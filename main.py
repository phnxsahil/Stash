import os
import time
import json
import glob
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import yt_dlp
import shutil

# 1. Load Keys
load_dotenv()

# 2. Configure AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# 3. Configure Spotify
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET")
))

app = FastAPI(title="Stash Engine API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReelRequest(BaseModel):
    url: str

@app.get("/")
def health_check():
    return {"status": "Antigravity Engine Online 🟢"}


from shazamio import Shazam

@app.post("/recognize")
async def recognize_reel(request: ReelRequest):
    print(f"🚀 Processing: {request.url}")

    # 1. DOWNLOAD AUDIO
    audio_filename = download_audio(request.url)
    if not audio_filename:
        raise HTTPException(status_code=500, detail="Audio download failed")

    try:
        # 2. ASK SHAZAM (Audio Fingerprinting)
        print("🎵 Fingerprinting with Shazam...")
        shazam = Shazam()
        
        # Shazam requires ffmpeg or compatible file. Our download_audio handles this.
        # If running locally on Windows without ffmpeg, this step might fail if the file format isn't supported natively.
        # However, shazamio often handles many formats or throws readable errors.
        
        out = await shazam.recognize_song(audio_filename)
        
        # Cleanup audio immediately
        if os.path.exists(audio_filename): os.remove(audio_filename)

        # 3. PARSE SHAZAM RESULT
        if not out.get('matches'):
            print("❌ Shazam found no matches.")
            return {"success": False, "error": "Shazam could not identify song"}

        track_info = out['track']
        shazam_title = track_info['title']
        shazam_artist = track_info['subtitle']
        
        print(f"🎯 Shazam Match: {shazam_title} by {shazam_artist}")

        # 4. VERIFY WITH SPOTIFY (Get Playable URI)
        # We still search Spotify to get the URI for the frontend player/saving
        return search_spotify_strict(shazam_title, shazam_artist)

    except Exception as e:
        print(f"❌ Error: {e}")
        if os.path.exists(audio_filename): os.remove(audio_filename)
        raise HTTPException(status_code=500, detail=str(e))

def download_audio(url):
    """Downloads Instagram audio. Falls back to direct format if FFmpeg is missing."""
    try:
        filename = f"temp_{int(time.time())}"
        has_ffmpeg = shutil.which("ffmpeg") is not None
        
        ydl_opts = {
            'quiet': True, 'no_warnings': True,
        }

        if has_ffmpeg:
            print("🎞️ FFmpeg detected. Downloading mp3...")
            ydl_opts.update({
                'format': 'bestaudio/best',
                'outtmpl': filename,
                'postprocessors': [{'key': 'FFmpegExtractAudio','preferredcodec': 'mp3'}],
            })
        else:
            print("⚠️ FFmpeg NOT detected. Downloading direct audio...")
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
    results = sp.search(q=query, type='track', limit=5)
    items = results['tracks']['items']
    
    if not items: return {"success": False, "error": "Not found on Spotify"}

    # SORT BY POPULARITY (Fixes the "Cover Song" issue)
    items.sort(key=lambda x: x['popularity'], reverse=True)
    best = items[0]
    
    print(f"🎯 Spotify Match (Popularity {best['popularity']}): {best['name']} by {best['artists'][0]['name']}")

    return {
        "success": True,
        "track": best['name'],
        "artist": best['artists'][0]['name'],
        "album_art": best['album']['images'][0]['url'],
        "spotify_uri": best['uri'],
        "spotify_url": best['external_urls']['spotify'],
        "confidence": 0.99
    }
