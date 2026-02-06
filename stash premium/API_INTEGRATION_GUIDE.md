# API Integration Guide - Music Recognition & Spotify

## 📍 Current Implementation

The app currently uses **simulated APIs** in `/src/app/services/apiService.ts`.

All API calls are mocked with realistic delays and return sample data for development/prototyping.

---

## 🔧 Where Shazam/ACRCloud APIs Go

### File: `/src/app/services/apiService.ts`

This is the **ONLY** file you need to modify for real API integration.

---

## 🎵 Music Recognition APIs (Shazam Alternatives)

### Option 1: **ACRCloud** (Recommended)
- **Best for**: Music recognition from audio/video URLs
- **Accuracy**: 95%+
- **Pricing**: Free tier available
- **Website**: https://www.acrcloud.com/

### Option 2: **AudD**
- **Best for**: YouTube, TikTok, Instagram video recognition
- **Accuracy**: 90%+
- **Pricing**: Pay-per-use
- **Website**: https://audd.io/

### Option 3: **Shazam API (RapidAPI)**
- **Best for**: Quick recognition
- **Accuracy**: Very high
- **Pricing**: Free tier on RapidAPI
- **Website**: https://rapidapi.com/apidojo/api/shazam

---

## 🔄 Integration Steps

### Step 1: Install Dependencies

```bash
npm install axios
# or
pnpm add axios
```

### Step 2: Add Environment Variables

Create `.env` file:

```env
# Music Recognition API
VITE_ACRCLOUD_ACCESS_KEY=your_access_key_here
VITE_ACRCLOUD_ACCESS_SECRET=your_secret_here
VITE_ACRCLOUD_HOST=identify-us-west-2.acrcloud.com

# Spotify API
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback

# Backend API (if you build one)
VITE_API_BASE_URL=https://your-backend.com/api
```

### Step 3: Update `apiService.ts`

---

## 📝 Code Examples

### Example 1: ACRCloud Integration

```typescript
// /src/app/services/apiService.ts

import axios from 'axios';
import { Song } from '../types';

const ACRCLOUD_HOST = import.meta.env.VITE_ACRCLOUD_HOST;
const ACCESS_KEY = import.meta.env.VITE_ACRCLOUD_ACCESS_KEY;
const ACCESS_SECRET = import.meta.env.VITE_ACRCLOUD_ACCESS_SECRET;

export const apiService = {
  // Real music recognition from URL
  async stashUrl(url: string): Promise<Song[]> {
    try {
      // Step 1: Download audio from URL (you'll need a backend for this)
      const audioResponse = await axios.post('/api/extract-audio', { url });
      const audioData = audioResponse.data.audioBase64;

      // Step 2: Recognize with ACRCloud
      const formData = new FormData();
      formData.append('sample', audioData);
      formData.append('access_key', ACCESS_KEY);
      formData.append('data_type', 'audio');
      formData.append('signature_version', '1');
      formData.append('signature', generateSignature()); // Implement signature
      formData.append('sample_bytes', audioData.length.toString());
      formData.append('timestamp', Date.now().toString());

      const response = await axios.post(
        `https://${ACRCLOUD_HOST}/v1/identify`,
        formData
      );

      // Step 3: Parse ACRCloud response
      const { metadata } = response.data;
      if (metadata && metadata.music && metadata.music.length > 0) {
        const matches = metadata.music.map((track: any) => ({
          id: track.external_metadata.spotify?.track?.id || track.acrid,
          song: track.title,
          artist: track.artists.map((a: any) => a.name).join(', '),
          source: 'ACRCloud Match',
          album_art_url: track.album?.name || '',
          preview_url: track.external_metadata.spotify?.track?.preview_url,
        }));

        return matches;
      }

      throw new Error('No matches found');
    } catch (error) {
      console.error('Music recognition failed:', error);
      throw error;
    }
  },
};
```

### Example 2: AudD Integration (Simpler for URLs)

```typescript
// /src/app/services/apiService.ts

import axios from 'axios';

const AUDD_API_KEY = import.meta.env.VITE_AUDD_API_KEY;

export const apiService = {
  async stashUrl(url: string): Promise<Song[]> {
    try {
      // AudD can directly recognize from URLs!
      const response = await axios.post('https://api.audd.io/', {
        api_token: AUDD_API_KEY,
        url: url, // Works with YouTube, TikTok, Instagram, etc.
        return: 'spotify',
      });

      const { result } = response.data;
      
      if (result) {
        return [{
          id: result.spotify?.id || result.song_id,
          song: result.title,
          artist: result.artist,
          source: 'AudD Match',
          album_art_url: result.spotify?.album?.images?.[0]?.url || '',
          preview_url: result.spotify?.preview_url,
        }];
      }

      throw new Error('No match found');
    } catch (error) {
      console.error('AudD recognition failed:', error);
      throw error;
    }
  },
};
```

### Example 3: Shazam API (RapidAPI)

```typescript
import axios from 'axios';

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export const apiService = {
  async stashUrl(url: string): Promise<Song[]> {
    try {
      // First, extract audio URL from video URL (backend needed)
      const audioUrl = await extractAudioUrl(url);

      // Then recognize with Shazam
      const response = await axios.get(
        'https://shazam.p.rapidapi.com/songs/v2/detect',
        {
          params: { url: audioUrl },
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'shazam.p.rapidapi.com',
          },
        }
      );

      const { track } = response.data;
      
      return [{
        id: track.key,
        song: track.title,
        artist: track.subtitle,
        source: 'Shazam Match',
        album_art_url: track.images?.coverart || '',
        preview_url: track.hub?.actions?.[0]?.uri,
      }];
    } catch (error) {
      console.error('Shazam failed:', error);
      throw error;
    }
  },
};
```

---

## 🎯 Spotify API Integration

### Step 1: OAuth Flow

```typescript
// Replace connectSpotify() function

async connectSpotify(): Promise<void> {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  
  const scopes = [
    'user-library-modify',
    'user-library-read',
    'playlist-modify-public',
    'playlist-modify-private',
  ].join(' ');

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('response_type', 'token');
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', scopes);

  window.location.href = authUrl.toString();
},
```

### Step 2: Add Track to Spotify

```typescript
async addTrack(trackId: string): Promise<void> {
  const accessToken = localStorage.getItem('spotify_access_token');
  
  await axios.put(
    `https://api.spotify.com/v1/me/tracks`,
    {
      ids: [trackId],
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
},
```

### Step 3: Get User History

```typescript
async getUserHistory(): Promise<Song[]> {
  const accessToken = localStorage.getItem('spotify_access_token');
  
  const response = await axios.get(
    'https://api.spotify.com/v1/me/tracks?limit=50',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  return response.data.items.map((item: any) => ({
    id: item.track.id,
    song: item.track.name,
    artist: item.track.artists.map((a: any) => a.name).join(', '),
    source: 'Spotify Library',
    album_art_url: item.track.album.images[0]?.url || '',
    preview_url: item.track.preview_url,
  }));
},
```

---

## 🏗️ Backend Requirements

For production, you'll need a backend to:

1. **Extract audio from video URLs** (YouTube, TikTok, Instagram)
   - Use: `yt-dlp`, `youtube-dl`, or API services
   
2. **Handle API keys securely**
   - Never expose API keys in frontend
   - Proxy all music recognition through backend

3. **Process audio**
   - Convert video → audio
   - Extract audio fingerprint
   - Send to recognition API

### Recommended Stack:

```
Backend: Node.js + Express
Audio Processing: ffmpeg, yt-dlp
Hosting: Vercel, Railway, or AWS Lambda
```

### Example Backend Endpoint:

```typescript
// backend/routes/recognize.ts

import express from 'express';
import ytdl from 'ytdl-core';
import { ACRCloud } from 'acrcloud';

const router = express.Router();

router.post('/api/recognize', async (req, res) => {
  const { url } = req.body;
  
  try {
    // 1. Download audio from URL
    const audioBuffer = await downloadAudio(url);
    
    // 2. Recognize with ACRCloud
    const result = await acrcloud.recognize(audioBuffer);
    
    // 3. Return matches
    res.json({ matches: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function downloadAudio(url: string): Promise<Buffer> {
  // Use ytdl or similar library
  // Convert to audio buffer
  // Return buffer for recognition
}
```

---

## 📊 API Cost Comparison

| Service | Free Tier | Paid (per 1000 calls) | Best For |
|---------|-----------|----------------------|----------|
| **ACRCloud** | 2,000/month | $0.001 - $0.01 | High accuracy |
| **AudD** | 1,000/month | $0.02 | URL recognition |
| **Shazam** | 500/month | $0.004 | Quick recognition |
| **Spotify** | Unlimited | Free | Track metadata |

---

## 🔐 Security Best Practices

1. **Never commit API keys** to git
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use environment variables**
   ```typescript
   const API_KEY = import.meta.env.VITE_API_KEY;
   ```

3. **Proxy sensitive calls through backend**
   - Frontend → Your Backend → Music API
   - Never expose API keys in client code

4. **Rate limiting**
   ```typescript
   // Implement rate limiting on backend
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

---

## ✅ Integration Checklist

- [ ] Choose music recognition API (ACRCloud, AudD, or Shazam)
- [ ] Sign up and get API keys
- [ ] Add environment variables
- [ ] Install axios for HTTP requests
- [ ] Update `apiService.ts` with real API calls
- [ ] Implement Spotify OAuth flow
- [ ] Build backend for audio extraction (optional but recommended)
- [ ] Add error handling for API failures
- [ ] Implement rate limiting
- [ ] Test with real URLs from YouTube, TikTok, Instagram
- [ ] Deploy backend (if needed)
- [ ] Update frontend to point to production backend
- [ ] Monitor API usage and costs

---

## 🚀 Quick Start (Development)

### Option 1: Use AudD (Easiest)
1. Sign up at https://audd.io
2. Get API key
3. Add to `.env`: `VITE_AUDD_API_KEY=your_key`
4. Replace `stashUrl()` function with AudD example above
5. Done! Works with URLs directly

### Option 2: Use ACRCloud (Most Accurate)
1. Sign up at https://www.acrcloud.com
2. Create a project
3. Get access key & secret
4. Add to `.env`
5. Build backend for audio extraction
6. Replace `stashUrl()` with ACRCloud example

### Option 3: Use Shazam via RapidAPI
1. Sign up at https://rapidapi.com
2. Subscribe to Shazam API (free tier)
3. Get API key
4. Add to `.env`
5. Build backend for audio extraction
6. Replace `stashUrl()` with Shazam example

---

## 📞 Support

For implementation help:
- ACRCloud Docs: https://docs.acrcloud.com/
- AudD API: https://docs.audd.io/
- Spotify API: https://developer.spotify.com/documentation/web-api/
- RapidAPI Shazam: https://rapidapi.com/apidojo/api/shazam

---

**Remember**: The current `/src/app/services/apiService.ts` file contains mock implementations. Replace each function with real API calls for production!
