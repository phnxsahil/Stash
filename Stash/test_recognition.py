import os
import time
import json
import glob
from dotenv import load_dotenv
import google.generativeai as genai
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import yt_dlp
import sys

# Load Keys
load_dotenv()

# Configure AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Configure Spotify
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET")
))

import shutil

def test_url(url):
    print(f"\n--- Testing URL: {url} ---\n")
    
    # 1. Metadata Path
    print("[1] Checking Metadata Path...")
    try:
        ydl_opts = {'quiet': True, 'no_warnings': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            track = info.get('track') or info.get('title')
            artist = info.get('artist') or info.get('uploader')
            print(f"    Extracted: Track='{track}', Artist='{artist}'")
    except Exception as e:
        print(f"    ❌ Metadata Extraction Error: {e}")

    # 2. Audio Download
    print("\n[2] Checking Audio Download Path...")
    filename = f"repro_{int(time.time())}"
    has_ffmpeg = shutil.which("ffmpeg") is not None
    
    ydl_opts = {'quiet': True, 'no_warnings': True}
    if has_ffmpeg:
        print("    🎞️ FFmpeg detected. Downloading mp3...")
        ydl_opts.update({
            'format': 'bestaudio/best',
            'outtmpl': filename,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '128',
            }],
        })
    else:
        print("    ⚠️ FFmpeg NOT detected. Downloading direct audio...")
        ydl_opts.update({
            'format': 'bestaudio',
            'outtmpl': f"{filename}.%(ext)s",
        })

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        files = glob.glob(f"{filename}*")
        audio_filename = files[0] if files else None
        
        if audio_filename:
            print(f"    ✓ Downloaded: {audio_filename}")
            
            # 3. AI Identification
            print("\n[3] Checking AI Identification Path...")
            print("    Uploading to Gemini...")
            audio_file = genai.upload_file(path=audio_filename)
            
            while audio_file.state.name == "PROCESSING":
                time.sleep(1)
                audio_file = genai.get_file(audio_file.name)
            
            print("    Asking Gemini...")
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = (
                "Listen to this audio snippet. Identify the official song name and the main artist. "
                "IMPORTANT: Return ONLY valid JSON in this format: {'track': 'Song Name', 'artist': 'Artist Name'}"
            )
            response = model.generate_content([prompt, audio_file])
            
            print(f"    Raw AI Response: {response.text}")
            
            try:
                cleaned_text = response.text.strip().replace('```json', '').replace('```', '').strip()
                ai_data = json.loads(cleaned_text)
                print(f"    Parsed AI Data: {ai_data}")
                
                # 4. Spotify Search
                print("\n[4] Checking Spotify Search Path...")
                track = ai_data.get('track')
                artist = ai_data.get('artist')
                
                # Search 1: Strict
                query_strict = f"track:{track} artist:{artist}"
                print(f"    Searching (Strict): {query_strict}")
                res = sp.search(q=query_strict, type='track', limit=1)
                
                if not res['tracks']['items']:
                    print("    🔍 Strict failed. Trying broad...")
                    query_broad = f"{track} {artist}"
                    res = sp.search(q=query_broad, type='track', limit=1)

                if res['tracks']['items']:
                    song = res['tracks']['items'][0]
                    print(f"    🎯 Success: {song['name']} by {song['artists'][0]['name']}")
                else:
                    print("    ❌ Nothing found on Spotify.")
            except Exception as e:
                print(f"    ❌ Identification/Search Error: {e}")
                
            # Cleanup
            os.remove(audio_filename)
        else:
            print("    ❌ Download failed.")
    except Exception as e:
        print(f"    ❌ Download Error: {e}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "https://www.instagram.com/p/DQrKXbtD6Hl/"
    test_url(target)
