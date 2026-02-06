import os
import time
import json
import glob
import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import yt_dlp
import shutil

# Import centralized configuration
from api.config import settings
from shazamio import Shazam
from collections import defaultdict
import random
import asyncio
import requests

# Configure Spotify with validated credentials
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=settings.SPOTIFY_CLIENT_ID,
    client_secret=settings.SPOTIFY_CLIENT_SECRET
))

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

@app.get("/")
@app.head("/")
def health_check():
    return {"status": "Antigravity Engine Online 🟢"}


# Rate limiting storage (in-memory for now)
request_log = defaultdict(list)

@app.post("/recognize")
async def recognize_reel(req: ReelRequest, request: Request):
    # Get client IP for rate limiting
    client_ip = "unknown"
    try:
        # Try to get real IP from headers (for proxies/load balancers)
        client_ip = request.headers.get("x-forwarded-for", "unknown").split(",")[0]
    except:
        pass
    
    # Rate limiting: 10 reels per IP per day
    now = time.time()
    request_log[client_ip] = [t for t in request_log[client_ip] if now - t < 86400]  # Keep last 24h
    
    if len(request_log[client_ip]) >= settings.RATE_LIMIT_PER_DAY:
        raise HTTPException(
            status_code=429, 
            detail=f"Daily limit reached ({settings.RATE_LIMIT_PER_DAY} reels/day). Upgrade to Pro for unlimited access!"
        )
    
    request_log[client_ip].append(now)
    
    if settings.ENABLE_DEBUG_LOGS:
        print(f"🚀 Processing: {req.url} (IP: {client_ip}, Count: {len(request_log[client_ip])})")

    # 1. DOWNLOAD AUDIO
    audio_filename = download_audio(req.url)
    if not audio_filename:
        # Return 422 (Unprocessable Entity) instead of 500 so frontend handles it gracefully
        raise HTTPException(status_code=422, detail="Could not download audio. Instagram/TikTok might be blocking the request. Try a different link.")

    try:
        # 2. ASK SHAZAM (Audio Fingerprinting) with Retry Logic
        if settings.ENABLE_DEBUG_LOGS:
            print(f"🎵 Fingerprinting with Shazam: {audio_filename}")
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
                    print(f"⚠️ Shazam attempt {attempt + 1} failed: {shazam_error}. Retrying in {wait_time}s...")
                    await asyncio.sleep(wait_time)
                else:
                    print(f"❌ Shazam failed after {max_retries} attempts: {shazam_error}")
                    raise shazam_error
        
        if not out:
            raise Exception("Shazam recognition returned no data")
        
        # Cleanup audio immediately
        if os.path.exists(audio_filename): os.remove(audio_filename)

        # 3. PARSE SHAZAM RESULT
        if not out.get('matches'):
            if settings.ENABLE_DEBUG_LOGS:
                print("❌ Shazam found no matches.")
            return {"success": False, "error": "Could not identify song from audio"}

        track_info = out['track']
        shazam_title = track_info['title']
        shazam_artist = track_info['subtitle']
        
        if settings.ENABLE_DEBUG_LOGS:
            print(f"🎯 Shazam Match: {shazam_title} by {shazam_artist}")

        # 4. VERIFY WITH SPOTIFY (Get Playable URI)
        # We still search Spotify to get the URI for the frontend player/saving
        return search_spotify_strict(shazam_title, shazam_artist)

    except Exception as e:
        print(f"❌ Error: {e}")
        if audio_filename and os.path.exists(audio_filename): os.remove(audio_filename)
        raise HTTPException(status_code=500, detail=str(e))

def download_audio(url):
    """Downloads Instagram audio to /tmp. Tries without cookies first (public posts), then with cookies."""
    
    # Try WITHOUT cookies first (works for public posts)
    result = _download_with_options(url, use_cookies=False)
    
    # If failed, retry WITH cookies (for private/restricted posts)
    if not result:
        print("⚠️ Cookieless download failed. Retrying with authentication...")
        result = _download_with_options(url, use_cookies=True)
    
    return result

def _download_with_options(url, use_cookies=False):
    """Internal function to download with or without cookies."""
    try:
        filename = f"/tmp/temp_{int(time.time())}"
        has_ffmpeg = shutil.which("ffmpeg") is not None
        
        # Detect platform from URL
        is_youtube = 'youtube.com' in url or 'youtu.be' in url
        is_instagram = 'instagram.com' in url
        
        ydl_opts = {
            'quiet': False, 
            'no_warnings': False,
            'nocheckcertificate': True,
            # SPEED: Only download first 15 seconds (Shazam identifies in ~5s)
            'download_ranges': lambda info, ydl: [{'start_time': 0, 'end_time': 15}],
            'force_keyframes_at_cuts': True,
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
                # Fallback to Instagram cookies for other platforms (TikTok, etc.)
                cookies_content = random.choice(settings.YTDLP_COOKIES_INSTAGRAM)
                platform_name = "General"
                cookie_file = '/tmp/cookies.txt'
            
            if cookies_content:
                try:
                    with open(cookie_file, 'w') as f:
                        f.write(cookies_content)
                    ydl_opts['cookiefile'] = cookie_file
                    
                    if settings.ENABLE_DEBUG_LOGS:
                        print(f"🍪 Using {platform_name} cookies for download")
                except Exception as e:
                    print(f"⚠️ Cookie file creation failed: {e}")
            else:
                if settings.ENABLE_DEBUG_LOGS:
                    print(f"⚠️ No cookies available for {platform_name or 'this platform'}")
        else:
            if settings.ENABLE_DEBUG_LOGS:
                print("🌐 Trying cookieless download (public post)...")

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
        print(f"Download Error: {e}")
        return None

def search_spotify_strict(track, artist):
    # Search with keywords (broader than strict field match, but sorted by popularity)
    query = f"{track} {artist}" 
    results = sp.search(q=query, type='track', limit=10)  # Get more results to filter
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
    
    if settings.ENABLE_DEBUG_LOGS:
        print(f"🎯 Spotify Match (Popularity {best['popularity']}): {best['name']} by {best['artists'][0]['name']}")

    return {
        "success": True,
        "track": best['name'],
        "artist": best['artists'][0]['name'],
        "album_art": best['album']['images'][0]['url'],
        "spotify_uri": best['uri'],
        "spotify_url": best['external_urls']['spotify'],
        "preview_url": best.get('preview_url'), 
        "confidence": 0.99
    }

class SaveWebTrackRequest(BaseModel):
    token: str
    track_id: str
    playlist_id: str

class RemoveTrackRequest(BaseModel):
    token: str
    track_id: str
    playlist_id: str = "1"  # Default to liked songs

# Helper: AI Genre Detection
def detect_genre_with_gemini(track_name, artist_name):
    """Detect music genre using Gemini AI"""
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
        print(f"⚠️ Gemini Genre Error: {e}")
        return "Unknown"

class AnalyzeVibeRequest(BaseModel):
    songs: list[str] # List of "Song - Artist" strings

@app.post("/analyze_vibe")
def analyze_vibe_summary(request: AnalyzeVibeRequest):
    """Analyze user's music vibe using AI"""
    if settings.ENABLE_DEBUG_LOGS:
        print(f"🔮 Analyzing Vibe for {len(request.songs)} songs...")
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
        if settings.ENABLE_DEBUG_LOGS:
            print(f"✨ Vibe Result: {vibe}")
        return {"vibe": vibe}
    except Exception as e:
        print(f"❌ Vibe Error: {e}")
        return {"vibe": "Eclectic and mysterious."}

@app.post("/save_track")
def save_track_to_spotify(request: SaveWebTrackRequest):
    """Save track to Spotify library or playlist"""
    if settings.ENABLE_DEBUG_LOGS:
        print(f"💾 Saving Track: {request.track_id} to Playlist: {request.playlist_id}")
    
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
        print(f"🤖 Genre: {genre}")
        
        playlist_name = "Stash: " + genre

        # 3. Smart Sort Logic (Playlist overriding)
        if request.playlist_id == "smart_sort":
            print("🧠 Smart Sort Engaged.")
            
            # Find/Create Playlist
            playlists = user_sp.current_user_playlists(limit=50)
            existing_id = None
            for p in playlists['items']:
                if p['name'].lower() == playlist_name.lower():
                    existing_id = p['id']
                    break
            
            if existing_id:
                target_playlist_id = existing_id
                print(f"📂 Found existing playlist: {playlist_name}")
            else:
                new_playlist = user_sp.user_playlist_create(user_id, playlist_name, public=False)
                target_playlist_id = new_playlist['id']
                print(f"✨ Created new playlist: {playlist_name}")

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
                 except:
                     final_playlist_name = "Selected Playlist"
                     
             print(f"✅ Added to playlist: {final_playlist_name} ({target_playlist_id})")
        else:
             user_sp.current_user_saved_tracks_add([request.track_id])
             print("✅ Added to Liked Songs")

        return {
            "success": True, 
            "playlist_id": target_playlist_id, 
            "playlist_name": final_playlist_name,
            "genre": genre 
        }

    except Exception as e:
        print(f"❌ Save Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/remove_track")
def remove_track_from_spotify(request: RemoveTrackRequest):
    """Remove track from Spotify library and/or playlist"""
    if settings.ENABLE_DEBUG_LOGS:
        print(f"🗑️ Removing Track: {request.track_id} from Playlist: {request.playlist_id}")
    
    try:
        # Initialize User Context
        user_sp = spotipy.Spotify(auth=request.token)
        
        # Always remove from Liked Songs
        try:
            user_sp.current_user_saved_tracks_delete([request.track_id])
            if settings.ENABLE_DEBUG_LOGS:
                print("✅ Removed from Liked Songs")
        except Exception as e:
            # Song might not be in liked songs, that's okay
            if settings.ENABLE_DEBUG_LOGS:
                print(f"⚠️ Not in Liked Songs: {e}")
        
        # If playlist_id provided and not "1" (Liked Songs), also remove from that playlist
        if request.playlist_id and request.playlist_id != '1' and request.playlist_id != 'smart_sort':
            try:
                user_sp.playlist_remove_all_occurrences_of_items(
                    request.playlist_id, 
                    [f"spotify:track:{request.track_id}"]
                )
                if settings.ENABLE_DEBUG_LOGS:
                    print(f"✅ Removed from playlist: {request.playlist_id}")
            except Exception as e:
                if settings.ENABLE_DEBUG_LOGS:
                    print(f"⚠️ Playlist removal failed: {e}")
        
        return {"success": True}
    
    except Exception as e:
        print(f"❌ Remove Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
