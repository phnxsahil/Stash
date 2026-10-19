import os
import time
import json
import glob
import logging
import random
import re
from uuid import uuid4
import asyncio
from functools import lru_cache
from typing import Optional
from collections import defaultdict

import requests
import spotipy
import yt_dlp
import shutil
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from spotipy.oauth2 import SpotifyClientCredentials
from shazamio import Shazam

from api.config import settings

# Configure module logger
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.DEBUG if settings.ENABLE_DEBUG_LOGS else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

# Helper to get Spotify client (Handles missing credentials gracefully)
def get_spotify_client() -> Optional[spotipy.Spotify]:
    """Create a Spotify client using client credentials flow."""
    if not settings.SPOTIFY_CLIENT_ID or not settings.SPOTIFY_CLIENT_SECRET:
        return None
    try:
        return spotipy.Spotify(auth_manager=SpotifyClientCredentials(
            client_id=settings.SPOTIFY_CLIENT_ID,
            client_secret=settings.SPOTIFY_CLIENT_SECRET
        ))
    except Exception as e:
        logger.error("Spotify Client Error: %s", e)
        return None

sp = get_spotify_client()

# --- Spotify search cache (TTL-based) ---
_spotify_cache: dict[str, tuple[float, dict]] = {}
SPOTIFY_CACHE_TTL = 3600  # 1 hour

def _get_cached_spotify(track: str, artist: str) -> Optional[dict]:
    """Return cached Spotify result if still fresh."""
    key = f"{track.lower().strip()}|{artist.lower().strip()}"
    entry = _spotify_cache.get(key)
    if entry and (time.time() - entry[0]) < SPOTIFY_CACHE_TTL:
        logger.debug("Spotify cache HIT for %s - %s", track, artist)
        return entry[1]
    return None

def _set_cached_spotify(track: str, artist: str, result: dict) -> None:
    """Store a Spotify result in cache."""
    key = f"{track.lower().strip()}|{artist.lower().strip()}"
    _spotify_cache[key] = (time.time(), result)

    # Evict stale entries if cache grows large
    if len(_spotify_cache) > 500:
        now = time.time()
        stale_keys = [k for k, (ts, _) in _spotify_cache.items() if now - ts > SPOTIFY_CACHE_TTL]
        for k in stale_keys:
            del _spotify_cache[k]

app = FastAPI(title="Stash Engine API v1.1.0")

# Configure CORS with environment-based origins (SECURE)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReelRequest(BaseModel):
    url: str

    @validator("url")
    def validate_social_url(cls, value: str) -> str:
        from urllib.parse import urlparse

        normalized = value.strip()
        parsed = urlparse(normalized)
        host = (parsed.hostname or "").lower().rstrip(".")
        allowed_hosts = ("instagram.com", "youtube.com", "youtu.be")
        if parsed.scheme not in {"http", "https"} or not any(
            host == domain or host.endswith(f".{domain}") for domain in allowed_hosts
        ):
            raise ValueError("Enter a valid Instagram or YouTube link")
        return normalized

@app.get("/")
@app.head("/")
def health_check():
    return {"status": "Antigravity Engine Online 🟢"}


# Rate limiting storage (in-memory for now)
request_log = defaultdict(list)

# --- Recognition cache (in-memory, per instance) ---
RECOGNITION_CACHE_TTL = 7 * 86400  # 7 days
_recognition_cache: dict = {}

_YT_ID_RE = re.compile(r'^[A-Za-z0-9_-]{11}$')

def normalize_source_key(url: str):
    """Canonical cache key: 'youtube:<id>' or 'instagram:<shortcode>'.

    YouTube: watch?v=, youtu.be/, /shorts/, /embed/, /v/, m./music.youtube.com
    Instagram: /reel/, /reels/, /p/, /tv/
    All tracking params (?igsh, &list=, &t=, &si=, ...) are ignored because we
    only keep the ID.
    """
    try:
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(url.strip())
        host = (parsed.hostname or '').lower()
        if host.startswith('www.'):
            host = host[4:]
        path = parsed.path.rstrip('/')
        qs = parse_qs(parsed.query)

        if host in ('youtube.com', 'm.youtube.com', 'music.youtube.com'):
            vid = (qs.get('v') or [None])[0]
            if not vid:
                for prefix in ('/shorts/', '/embed/', '/v/'):
                    if path.startswith(prefix):
                        vid = path[len(prefix):].split('/')[0]
                        break
            if vid and _YT_ID_RE.match(vid):
                return f'youtube:{vid}'
        elif host == 'youtu.be':
            vid = path.lstrip('/').split('/')[0]
            if vid and _YT_ID_RE.match(vid):
                return f'youtube:{vid}'
        elif host == 'instagram.com':
            for prefix in ('/reel/', '/reels/', '/p/', '/tv/'):
                if path.startswith(prefix):
                    code = path[len(prefix):].split('/')[0]
                    if code:
                        return f'instagram:{code}'
        return None
    except Exception:
        return None

@app.post("/recognize")
async def recognize_reel(req: ReelRequest, request: Request):
    # Get client IP for rate limiting
    client_ip = "unknown"
    try:
        # Try to get real IP from headers (for proxies/load balancers)
        client_ip = request.headers.get("x-forwarded-for", "unknown").split(",")[0].strip()
    except (AttributeError, IndexError):
        pass
    
    # Rate limiting: 10 reels per IP per day
    now = time.time()
    request_log[client_ip] = [t for t in request_log[client_ip] if now - t < 86400]  # Keep last 24h
    
    if len(request_log[client_ip]) >= settings.RATE_LIMIT_PER_DAY:
        raise HTTPException(
            status_code=429, 
            detail=f"Daily limit reached ({settings.RATE_LIMIT_PER_DAY} reels/day). Upgrade to Pro for unlimited access!"
        )
    
    # CACHE: instant return for a link recognized before.
    # Placed before the append so cache hits don't burn the daily limit.
    cache_key = normalize_source_key(req.url)
    cached = _recognition_cache.get(cache_key) if cache_key else None
    if cached and now - cached["ts"] < RECOGNITION_CACHE_TTL:
        logger.debug("Cache hit: %s", cache_key)
        return cached["result"]

    request_log[client_ip].append(now)
    
    logger.debug("Processing: %s (IP: %s, Count: %d)", req.url, client_ip, len(request_log[client_ip]))

    # 0. CHECK CONFIGURATION
    if not settings.SPOTIFY_CLIENT_ID or not settings.SPOTIFY_CLIENT_SECRET:
        raise HTTPException(
            status_code=503, 
            detail="Backend Error: Spotify API credentials are not configured on the server. Please check environment variables."
        )
    
    if not settings.GEMINI_API_KEY:
        logger.warning("Gemini API Key missing. Genre detection will be disabled.")

    # 1. START DOWNLOAD FIRST (it is the fallback and usually the winner)
    loop = asyncio.get_running_loop()
    download_task = loop.run_in_executor(None, download_audio, req.url)

    # 1b. FAST PATH (YouTube only): title metadata -> Spotify, raced against
    # the download. Only a corroborated match wins; anything doubtful falls
    # through to fingerprinting with no time lost.
    video_id = cache_key.split(':', 1)[1] if cache_key and cache_key.startswith('youtube:') else None
    if video_id:
        metadata_task = loop.run_in_executor(None, try_metadata_fastpath, video_id)
        try:
            meta_result = await asyncio.wait_for(asyncio.shield(metadata_task), timeout=10)
        except Exception:
            meta_result = None
        if meta_result:
            logger.debug("Fast path hit: %s", cache_key)
            asyncio.create_task(_cleanup_download(download_task))
            _recognition_cache[cache_key] = {"ts": time.time(), "result": meta_result}
            return meta_result
        logger.debug("Fast path missed, using audio fingerprint: %s", cache_key)

    audio_filename = await download_task
    if not audio_filename:
        # Return 422 (Unprocessable Entity) instead of 500 so frontend handles it gracefully
        raise HTTPException(status_code=422, detail="Could not download audio. Instagram might be blocking the request. Try a different link.")

    try:
        # 2. ASK SHAZAM (Audio Fingerprinting) with Retry Logic
        logger.debug("Fingerprinting with Shazam: %s", audio_filename)
        shazam = Shazam()
        
        # Retry logic for Shazam API (handles connection timeouts on serverless)
        out = None
        max_retries = 3
        for attempt in range(max_retries):
            try:
                out = await shazam.recognize(audio_filename)
                break  # Success, exit retry loop
            except Exception as shazam_error:
                if attempt < max_retries - 1:
                    wait_time = attempt + 1  # SPEED: Faster backoff: 1s, 2s
                    logger.warning("Shazam attempt %d failed: %s. Retrying in %ds...", attempt + 1, shazam_error, wait_time)
                    await asyncio.sleep(wait_time)
                else:
                    logger.error("Shazam failed after %d attempts: %s", max_retries, shazam_error)
                    raise shazam_error
        
        if not out:
            raise Exception("Shazam recognition returned no data")
        
        # Cleanup audio immediately
        if os.path.exists(audio_filename): os.remove(audio_filename)

        # 3. PARSE SHAZAM RESULT - if the opening window had no music
        # (intro, silence, talk), retry once with a mid-song window.
        if not out.get('matches'):
            logger.debug("No match in 0-8s window. Retrying 30-38s window...")
            mid_filename = await loop.run_in_executor(None, download_audio, req.url, 30.0)
            if mid_filename:
                try:
                    out = await shazam.recognize(mid_filename)
                except Exception as mid_error:
                    logger.warning("Mid-song retry failed: %s", mid_error)
                    out = None
                finally:
                    if os.path.exists(mid_filename):
                        try: os.remove(mid_filename)
                        except OSError: pass
        if not out or not out.get('matches'):
            logger.debug("Shazam found no matches.")
            return {"success": False, "error": "Could not identify song from audio"}

        track_info = out['track']
        shazam_title = track_info['title']
        shazam_artist = track_info['subtitle']
        
        logger.debug("Shazam Match: %s by %s", shazam_title, shazam_artist)

        # 4. VERIFY WITH SPOTIFY (Get Playable URI)
        # We still search Spotify to get the URI for the frontend player/saving
        result = search_spotify_strict(shazam_title, shazam_artist)
        if cache_key and result and result.get("success"):
            _recognition_cache[cache_key] = {"ts": time.time(), "result": result}
        return result

    except Exception as e:
        error_msg = str(e)
        logger.error("Recognition Error: %s", error_msg)
        
        # Cleanup audio if it still exists
        if audio_filename and os.path.exists(audio_filename): 
            try: os.remove(audio_filename)
            except OSError: pass
            
        # Return a more descriptive error based on the exception
        if "quota" in error_msg.lower():
            raise HTTPException(status_code=429, detail="Backend Error: API Quota exceeded for Shazam/Spotify.")
        elif "authentication" in error_msg.lower() or "credentials" in error_msg.lower():
            raise HTTPException(status_code=503, detail=f"Backend Error: API Authentication failed. {error_msg}")
        else:
            raise HTTPException(status_code=500, detail=f"Backend Error: {error_msg}")

def _cookies_configured_for(url: str) -> bool:
    """True when a cookie pool exists for this URL's platform."""
    is_youtube = 'youtube.com' in url or 'youtu.be' in url
    is_instagram = 'instagram.com' in url
    if is_youtube:
        return bool(settings.YTDLP_COOKIES_YOUTUBE)
    if is_instagram:
        return bool(settings.YTDLP_COOKIES_INSTAGRAM)
    return bool(settings.YTDLP_COOKIES_INSTAGRAM)

def _strip_brackets(text: str) -> str:
    return re.sub(r'[\(\[][^\)\]]*[\)\]]', ' ', text)

def _title_tokens(text: str) -> set:
    words = re.sub(r'[^a-z0-9 ]', ' ', text.lower()).split()
    stopwords = {'official', 'video', 'lyrics', 'lyric', 'audio', 'hd', '4k',
                 'mv', 'music', 'ft', 'feat', 'the', 'a', 'an', 'full', 'song'}
    return {w for w in words if w not in stopwords and len(w) > 1}

def try_metadata_fastpath(video_id: str) -> Optional[dict]:
    """YouTube oEmbed title+channel -> Spotify. Returns a result dict ONLY on
    a corroborated match; otherwise None and the caller fingerprints audio."""
    try:
        resp = requests.get(
            'https://www.youtube.com/oembed',
            params={'url': f'https://www.youtube.com/watch?v={video_id}', 'format': 'json'},
            timeout=5,
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
    except Exception as e:
        logger.debug("oEmbed failed: %s", e)
        return None

    raw_title = data.get('title') or ''
    channel = data.get('author_name') or ''
    artist_guess = re.sub(r'\s*(VEVO|-\s*Topic|Official.*)$', '', channel, flags=re.IGNORECASE).strip()
    title_guess = _strip_brackets(raw_title).strip()
    if not title_guess:
        return None

    try:
        result = search_spotify_strict(title_guess, artist_guess)
    except Exception:
        return None
    if not result or not result.get('success'):
        return None

    track_tokens = _title_tokens(result.get('track', ''))
    guess_tokens = _title_tokens(title_guess)
    if not guess_tokens:
        return None
    overlap = len(track_tokens & guess_tokens) / len(guess_tokens)

    spotify_artist = (result.get('artist') or '').lower()
    artist_ok = bool(artist_guess) and (
        artist_guess.lower() in spotify_artist or spotify_artist in artist_guess.lower()
    )

    # Strict: channel corroborates the artist AND titles strongly overlap.
    # Without a usable channel name, demand near-total title overlap.
    if (artist_ok and overlap >= 0.6) or (not artist_guess and overlap >= 0.85):
        return result
    return None

async def _cleanup_download(task) -> None:
    """After a fast-path win, let the abandoned download finish and delete it."""
    try:
        path = await task
        if path and os.path.exists(path):
            os.remove(path)
    except Exception:
        pass

def download_audio(url: str, start: float = 0.0) -> Optional[str]:
    """Downloads an 8s audio window starting at `start` seconds.
    With cookies configured, go straight to them; otherwise cookieless first."""
    
    if _cookies_configured_for(url):
        # Authenticated first - on hosts where cookieless is blocked this
        # skips a guaranteed-fail attempt that costs seconds.
        result = _download_with_options(url, use_cookies=True, start=start)
        if not result:
            logger.warning("Authenticated download failed. Trying cookieless...")
            result = _download_with_options(url, use_cookies=False, start=start)
    else:
        result = _download_with_options(url, use_cookies=False, start=start)
    
    return result

def _download_with_options(url: str, use_cookies: bool = False, start: float = 0.0) -> Optional[str]:
    """Internal function to download with or without cookies."""
    try:
        filename = f"/tmp/temp_{uuid4().hex}"
        has_ffmpeg = shutil.which("ffmpeg") is not None
        
        # Detect platform from URL
        is_youtube = 'youtube.com' in url or 'youtu.be' in url
        is_instagram = 'instagram.com' in url
        
        ydl_opts = {
            'quiet': False, 
            'no_warnings': False,
            'nocheckcertificate': True,
            # SPEED: Only download an 8 second window (Shazam identifies in ~5s)
            'download_ranges': lambda info, ydl, s=start: [{'start_time': s, 'end_time': s + 8}],
            'noplaylist': True,
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Sec-Fetch-Mode': 'navigate',
            }
        }

        # Add cookies with rotation support based on platform
        if use_cookies:
            cookies_content = None
            platform_name = ""
            
            # Select cookies based on URL type
            if is_youtube and settings.YTDLP_COOKIES_YOUTUBE:
                cookies_content = random.choice(settings.YTDLP_COOKIES_YOUTUBE)
                platform_name = "YouTube"
                cookie_file = '/tmp/youtube_cookies.txt'
            elif is_instagram and settings.YTDLP_COOKIES_INSTAGRAM:
                cookies_content = random.choice(settings.YTDLP_COOKIES_INSTAGRAM)
                platform_name = "Instagram"
                cookie_file = '/tmp/instagram_cookies.txt'
            elif settings.YTDLP_COOKIES_INSTAGRAM:
                # Fallback to Instagram cookies for other platforms (other supported sources)
                cookies_content = random.choice(settings.YTDLP_COOKIES_INSTAGRAM)
                platform_name = "General"
                cookie_file = '/tmp/cookies.txt'
            
            if cookies_content:
                try:
                    with open(cookie_file, 'w') as f:
                        f.write(cookies_content)
                    ydl_opts['cookiefile'] = cookie_file
                    logger.debug("Using %s cookies for download", platform_name)
                except Exception as e:
                    logger.warning("Cookie file creation failed: %s", e)
            else:
                logger.debug("No cookies available for %s", platform_name or 'this platform')
        else:
            logger.debug("Trying cookieless download (public post)...")

        if has_ffmpeg:
            ydl_opts.update({
                'format': 'worstaudio/worst',  # SPEED: Lowest quality is fine for fingerprinting
                'outtmpl': filename,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '64',  # SPEED: 64kbps is enough for Shazam
                }],
            })
        else:
            ydl_opts.update({
                'format': 'bestaudio',
                'outtmpl': f"{filename}.%(ext)s",
            })

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        files = glob.glob(f"{filename}*")
        return files[0] if files else None
    except Exception as e:
        logger.error("Download Error: %s", e)
        return None

def search_spotify_strict(track: str, artist: str) -> dict:
    """Search Spotify for a track, prioritizing exact artist matches and sorting by popularity."""
    # Check cache first
    cached = _get_cached_spotify(track, artist)
    if cached:
        return cached

    query = f"{track} {artist}" 
    
    current_sp = sp or get_spotify_client()
    if not current_sp:
        raise HTTPException(status_code=503, detail="Backend Error: Spotify client is not initialized.")
        
    try:
        results = current_sp.search(q=query, type='track', limit=10)  # Get more results to filter
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backend Error: Spotify search failed. {str(e)}")
        
    items = results['tracks']['items']
    
    if not items: return {"success": False, "error": "Not found on Spotify"}

    # IMPROVED MATCHING: Prioritize exact artist matches
    exact_matches = []
    partial_matches = []
    
    for item in items:
        item_artist = item['artists'][0]['name'].lower()
        search_artist = artist.lower()
        
        # Check if artist name matches (exact or contains)
        if item_artist == search_artist:
            exact_matches.append(item)
        elif search_artist in item_artist or item_artist in search_artist:
            partial_matches.append(item)
    
    # Prefer exact matches, fall back to partial, then all results
    candidates = exact_matches or partial_matches or items
    
    # SORT BY POPULARITY (Fixes the "Cover Song" issue)
    candidates.sort(key=lambda x: x['popularity'], reverse=True)
    best = candidates[0]
    
    logger.debug("Spotify Match (Popularity %d): %s by %s", best['popularity'], best['name'], best['artists'][0]['name'])

    result = {
        "success": True,
        "track": best['name'],
        "artist": best['artists'][0]['name'],
        "album_art": best['album']['images'][0]['url'],
        "spotify_uri": best['uri'],
        "spotify_url": best['external_urls']['spotify'],
        "preview_url": best.get('preview_url'), 
        "confidence": 0.99
    }

    # Cache the result
    _set_cached_spotify(track, artist, result)
    return result

class SaveWebTrackRequest(BaseModel):
    token: str
    track_id: str
    playlist_id: str

class RemoveTrackRequest(BaseModel):
    token: str
    track_id: str
    playlist_id: str = "1"  # Default to liked songs

# Helper: AI Genre Detection
def detect_genre_with_gemini(track_name: str, artist_name: str) -> str:
    """Detect music genre using Gemini AI."""
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        prompt = f"What is the primary music genre of the song '{track_name}' by '{artist_name}'? Return only ONE word (e.g., Techno, House, Pop, Rock, Ambient). Do not write sentences."
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        
        vibe = data['candidates'][0]['content']['parts'][0]['text'].strip().replace(".", "")
        return vibe
    except Exception as e:
        logger.warning("Gemini Genre Error: %s", e)
        return "Unknown"

class AnalyzeVibeRequest(BaseModel):
    songs: list[str] # List of "Song - Artist" strings

@app.post("/analyze_vibe")
def analyze_vibe_summary(request: AnalyzeVibeRequest) -> dict:
    """Analyze user's music vibe using AI."""
    logger.debug("Analyzing Vibe for %d songs...", len(request.songs))
    if not request.songs:
        return {"vibe": "No music yet! Start stashing to find your vibe."}
    
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        song_list = ", ".join(request.songs[:20]) # Limit to last 20 to save tokens
        prompt = f"Here is a user's recently liked music: {song_list}. In one short, fun sentence (max 10 words), describe their current 'music vibe' or mood. Be creative like Spotify Wrapped. Example: 'Melancholic late-night techno drive by yourself.'"
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        res = requests.post(url, json=payload)
        res.raise_for_status()
        data = res.json()
        
        vibe = data['candidates'][0]['content']['parts'][0]['text'].strip()
        logger.debug("Vibe Result: %s", vibe)
        return {"vibe": vibe}
    except Exception as e:
        logger.error("Vibe Error: %s", e)
        return {"vibe": "Eclectic and mysterious."}

@app.post("/save_track")
def save_track_to_spotify(request: SaveWebTrackRequest) -> dict:
    """Save track to Spotify library or playlist."""
    logger.debug("Saving Track: %s to Playlist: %s", request.track_id, request.playlist_id)
    
    try:
        # 1. Initialize User Context
        user_sp = spotipy.Spotify(auth=request.token)
        user_id = user_sp.current_user()['id']
        
        target_playlist_id = request.playlist_id
        
        # Always get track info first
        track_info = user_sp.track(request.track_id)
        track_name = track_info['name']
        artist_name = track_info['artists'][0]['name']

        # 2. Detect Genre (Always run this now for Analytics)
        genre = detect_genre_with_gemini(track_name, artist_name)
        logger.info("Genre: %s", genre)
        
        playlist_name = "Stash: " + genre

        # 3. Smart Sort Logic (Playlist overriding)
        if request.playlist_id == "smart_sort":
            logger.info("Smart Sort Engaged.")
            
            # Find/Create Playlist
            playlists = user_sp.current_user_playlists(limit=50)
            existing_id = None
            for p in playlists['items']:
                if p['name'].lower() == playlist_name.lower():
                    existing_id = p['id']
                    break
            
            if existing_id:
                target_playlist_id = existing_id
                logger.info("Found existing playlist: %s", playlist_name)
            else:
                new_playlist = user_sp.user_playlist_create(user_id, playlist_name, public=False)
                target_playlist_id = new_playlist['id']
                logger.info("Created new playlist: %s", playlist_name)

        # 4. Add Track to Target Playlist
        final_playlist_name = "Liked Songs"
        
        if target_playlist_id and target_playlist_id != '1':
             user_sp.playlist_add_items(target_playlist_id, [f"spotify:track:{request.track_id}"])
             
             # If it was Smart Sort, we already have the name
             if request.playlist_id == "smart_sort":
                 final_playlist_name = playlist_name
             else:
                 # Fetch name for custom ID
                 try:
                     pl_details = user_sp.playlist(target_playlist_id)
                     final_playlist_name = pl_details['name']
                 except Exception:
                     final_playlist_name = "Selected Playlist"
                     
             logger.info("Added to playlist: %s (%s)", final_playlist_name, target_playlist_id)
        else:
             user_sp.current_user_saved_tracks_add([request.track_id])
             logger.info("Added to Liked Songs")

        return {
            "success": True, 
            "playlist_id": target_playlist_id, 
            "playlist_name": final_playlist_name,
            "genre": genre 
        }

    except Exception as e:
        logger.error("Save Error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/remove_track")
def remove_track_from_spotify(request: RemoveTrackRequest) -> dict:
    """Remove track from Spotify library and/or playlist."""
    logger.debug("Removing Track: %s from Playlist: %s", request.track_id, request.playlist_id)
    
    try:
        # Initialize User Context
        user_sp = spotipy.Spotify(auth=request.token)
        
        # Always remove from Liked Songs
        try:
            user_sp.current_user_saved_tracks_delete([request.track_id])
            logger.debug("Removed from Liked Songs")
        except Exception as e:
            # Song might not be in liked songs, that's okay
            logger.debug("Not in Liked Songs: %s", e)
        
        # If playlist_id provided and not "1" (Liked Songs), also remove from that playlist
        if request.playlist_id and request.playlist_id != '1' and request.playlist_id != 'smart_sort':
            try:
                user_sp.playlist_remove_all_occurrences_of_items(
                    request.playlist_id, 
                    [f"spotify:track:{request.track_id}"]
                )
                logger.debug("Removed from playlist: %s", request.playlist_id)
            except Exception as e:
                logger.debug("Playlist removal failed: %s", e)
        
        return {"success": True}
    
    except Exception as e:
        logger.error("Remove Error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
