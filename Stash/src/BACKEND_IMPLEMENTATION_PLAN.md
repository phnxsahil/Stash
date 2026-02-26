# 🚀 Stash Backend Implementation Plan

> **Easy-to-understand guide for implementing the Stash backend**  
> For: Antigravity, VS Code, or any development environment

---

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Step-by-Step Implementation](#step-by-step-implementation)
7. [External Services](#external-services)
8. [Error Handling](#error-handling)
9. [Testing Guide](#testing-guide)
10. [Deployment](#deployment)

---

## 🎯 **Overview**

### What the Backend Does

```
1. User Authentication (Spotify OAuth)
2. URL Processing (Extract audio from links)
3. Song Identification (Match audio to Spotify tracks)
4. Library Management (Add songs to Spotify)
5. History Tracking (Store user's stashes)
6. Stats Generation (Calculate achievements, genres, etc.)
```

### User Flow
```
User → Frontend → Backend API → External Services → Database → Frontend
```

---

## 🛠️ **Technology Stack**

### Recommended Stack

**Option 1: Node.js + Express (Easiest)**
```
- Runtime: Node.js 18+
- Framework: Express.js
- Database: PostgreSQL (or MongoDB)
- ORM: Prisma (for PostgreSQL) or Mongoose (for MongoDB)
- Authentication: Passport.js
- Hosting: Vercel, Railway, or Render
```

**Option 2: Python + FastAPI**
```
- Runtime: Python 3.9+
- Framework: FastAPI
- Database: PostgreSQL
- ORM: SQLAlchemy
- Authentication: OAuth2
- Hosting: Railway, Fly.io
```

**Option 3: Supabase (No-Code Backend)**
```
- Database: PostgreSQL (built-in)
- Authentication: Built-in OAuth
- API: Auto-generated REST/GraphQL
- Functions: Edge Functions (TypeScript)
- Hosting: Supabase Cloud
```

### Recommendation for Beginners
✅ **Use Supabase** - 80% of backend is already built for you!

---

## 🏗️ **Architecture**

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React PWA)                 │
│  - User Interface                                        │
│  - State Management                                      │
│  - API Calls                                             │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/HTTPS
                   ↓
┌─────────────────────────────────────────────────────────┐
│                   BACKEND API (Express/FastAPI)          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Authentication Layer (Spotify OAuth)              │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Business Logic                                    │ │
│  │  - URL Processing                                  │ │
│  │  - Song Matching                                   │ │
│  │  - Achievement Calculation                         │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Database Layer (PostgreSQL)                       │ │
│  └────────────────────────────────────────────────────┘ │
└──────┬────────────────────┬─────────────────────────────┘
       │                    │
       ↓                    ↓
┌─────────────────┐  ┌──────────────────┐
│  Spotify API    │  │  Audio Services  │
│  - OAuth        │  │  - ACRCloud      │
│  - Add Track    │  │  - Shazam API    │
│  - Playlists    │  │  - yt-dlp        │
└─────────────────┘  └──────────────────┘
```

---

## 🗄️ **Database Schema**

### PostgreSQL Schema (Recommended)

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stashes Table (User's saved songs)
CREATE TABLE stashes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  spotify_track_id VARCHAR(255) NOT NULL,
  track_name VARCHAR(500),
  artist_name VARCHAR(500),
  album_art_url TEXT,
  preview_url TEXT,
  source_platform VARCHAR(100), -- 'instagram', 'tiktok', 'youtube', etc.
  source_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  auto_add_top_match BOOLEAN DEFAULT FALSE,
  default_playlist_id VARCHAR(255),
  theme VARCHAR(10) DEFAULT 'dark',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Achievements Table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100), -- 'first_stash', 'collector', 'music_lover', 'curator'
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Streaks Table
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_stash_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX idx_stashes_user_id ON stashes(user_id);
CREATE INDEX idx_stashes_created_at ON stashes(created_at);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
```

### MongoDB Schema (Alternative)

```javascript
// users collection
{
  _id: ObjectId,
  spotifyId: String,
  email: String,
  displayName: String,
  accessToken: String,
  refreshToken: String,
  tokenExpiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// stashes collection
{
  _id: ObjectId,
  userId: ObjectId,
  spotifyTrackId: String,
  trackName: String,
  artistName: String,
  albumArtUrl: String,
  previewUrl: String,
  sourcePlatform: String,
  sourceUrl: String,
  createdAt: Date
}

// userPreferences collection
{
  _id: ObjectId,
  userId: ObjectId,
  autoAddTopMatch: Boolean,
  defaultPlaylistId: String,
  theme: String,
  createdAt: Date,
  updatedAt: Date
}

// achievements collection
{
  _id: ObjectId,
  userId: ObjectId,
  achievementType: String,
  unlockedAt: Date
}

// streaks collection
{
  _id: ObjectId,
  userId: ObjectId,
  currentStreak: Number,
  longestStreak: Number,
  lastStashDate: Date,
  updatedAt: Date
}
```

---

## 🔌 **API Endpoints**

### Base URL: `https://api.stash.app/v1`

### Authentication Endpoints

```
POST   /auth/spotify/login
  - Redirects to Spotify OAuth
  - Returns: Redirect URL

GET    /auth/spotify/callback
  - Receives Spotify OAuth token
  - Creates/updates user in database
  - Returns: { user, accessToken }

POST   /auth/logout
  - Clears session
  - Returns: { success: true }

GET    /auth/me
  - Returns current user info
  - Requires: Authentication
  - Returns: { user }
```

### Stashing Endpoints

```
POST   /stash
  - Body: { url: string }
  - Process:
    1. Extract audio from URL
    2. Identify song using ACRCloud/Shazam
    3. Match to Spotify track
  - Returns: { matches: [{ id, song, artist, albumArt, previewUrl }] }

POST   /stash/add
  - Body: { spotifyTrackId: string, sourceUrl: string }
  - Process:
    1. Add track to user's Spotify library
    2. Save to database
    3. Update streak
    4. Check for new achievements
  - Returns: { stash, newAchievements: [] }
```

### History Endpoints

```
GET    /history
  - Returns: { stashes: [...], total: number }
  - Supports pagination: ?page=1&limit=20

DELETE /history/:id
  - Deletes a stash from history
  - Returns: { success: true }
```

### Stats Endpoints

```
GET    /stats
  - Returns: {
      totalStashes: number,
      thisWeek: number,
      thisMonth: number,
      genres: [{ name, count }],
      topArtists: [{ name, count }],
      streak: number,
      achievements: [...]
    }

GET    /achievements
  - Returns: { achievements: [...], progress: {...} }
```

### Preferences Endpoints

```
GET    /preferences
  - Returns: { autoAddTopMatch, defaultPlaylistId, theme }

PUT    /preferences
  - Body: { autoAddTopMatch?, defaultPlaylistId?, theme? }
  - Returns: { preferences }
```

### Spotify Integration Endpoints

```
GET    /spotify/playlists
  - Fetches user's Spotify playlists
  - Returns: { playlists: [...] }

GET    /spotify/profile
  - Fetches Spotify user profile
  - Returns: { email, displayName, ... }
```

---

## 📝 **Step-by-Step Implementation**

### Phase 1: Setup (30 minutes)

#### Option A: Using Supabase (Recommended for Beginners)

```bash
# 1. Create Supabase account
Go to https://supabase.com → Sign up → Create new project

# 2. Set up Database
- Go to Table Editor
- Create tables using SQL above (Database Schema section)
- Enable Row Level Security (RLS)

# 3. Enable Spotify OAuth
- Go to Authentication → Providers → Enable Spotify
- Add Spotify Client ID and Secret (from Spotify Developer Dashboard)

# 4. Get API Keys
- Go to Settings → API
- Copy your project URL and anon key
- Add to frontend .env file
```

#### Option B: Using Node.js + Express

```bash
# 1. Initialize project
mkdir stash-backend
cd stash-backend
npm init -y

# 2. Install dependencies
npm install express cors dotenv
npm install pg prisma @prisma/client
npm install passport passport-spotify
npm install axios yt-dlp-wrap
npm install -D typescript @types/node @types/express

# 3. Initialize Prisma
npx prisma init

# 4. Create .env file
DATABASE_URL="postgresql://user:password@localhost:5432/stash"
SPOTIFY_CLIENT_ID="your_spotify_client_id"
SPOTIFY_CLIENT_SECRET="your_spotify_client_secret"
SPOTIFY_REDIRECT_URI="http://localhost:3000/auth/callback"
ACRCLOUD_ACCESS_KEY="your_acrcloud_key"
ACRCLOUD_ACCESS_SECRET="your_acrcloud_secret"
JWT_SECRET="your_random_secret_key"
```

---

### Phase 2: Spotify OAuth (1 hour)

#### Step 1: Register Spotify App
```
1. Go to https://developer.spotify.com/dashboard
2. Click "Create App"
3. Fill in:
   - App Name: Stash
   - Redirect URI: http://localhost:3000/auth/callback
4. Copy Client ID and Client Secret
```

#### Step 2: Implement OAuth Flow (Express Example)

```javascript
// routes/auth.js
const express = require('express');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const router = express.Router();

// Configure Spotify Strategy
passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: process.env.SPOTIFY_REDIRECT_URI,
    },
    async (accessToken, refreshToken, expires_in, profile, done) => {
      // Save user to database
      const user = await db.user.upsert({
        where: { spotifyId: profile.id },
        update: {
          accessToken,
          refreshToken,
          tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        },
        create: {
          spotifyId: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
          accessToken,
          refreshToken,
          tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        },
      });
      
      return done(null, user);
    }
  )
);

// Login endpoint
router.get('/spotify/login', 
  passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-library-modify', 'playlist-modify-public'],
  })
);

// Callback endpoint
router.get('/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET);
    res.redirect(`https://your-frontend.com/auth?token=${token}`);
  }
);

module.exports = router;
```

---

### Phase 3: URL Processing & Song Identification (2 hours)

#### Step 1: Extract Audio from URL

```javascript
// services/audioExtractor.js
const YTDlpWrap = require('yt-dlp-wrap').default;
const ytDlpWrap = new YTDlpWrap();

async function extractAudio(url) {
  try {
    // Download audio as temporary file
    const audioPath = `/tmp/audio_${Date.now()}.mp3`;
    
    await ytDlpWrap.execPromise([
      url,
      '-x', // Extract audio only
      '--audio-format', 'mp3',
      '--audio-quality', '0', // Best quality
      '-o', audioPath,
    ]);
    
    return audioPath;
  } catch (error) {
    console.error('Audio extraction failed:', error);
    throw new Error('Could not extract audio from URL');
  }
}

module.exports = { extractAudio };
```

#### Step 2: Identify Song with ACRCloud

```javascript
// services/songIdentifier.js
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

async function identifySong(audioFilePath) {
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Create ACRCloud signature
  const stringToSign = [
    'POST',
    '/v1/identify',
    process.env.ACRCLOUD_ACCESS_KEY,
    'audio',
    '1',
    timestamp,
  ].join('\n');
  
  const signature = crypto
    .createHmac('sha1', process.env.ACRCLOUD_ACCESS_SECRET)
    .update(stringToSign)
    .digest('base64');
  
  // Read audio file
  const audioBuffer = fs.readFileSync(audioFilePath);
  
  // Send to ACRCloud
  const formData = new FormData();
  formData.append('sample', audioBuffer, { filename: 'sample.mp3' });
  formData.append('access_key', process.env.ACRCLOUD_ACCESS_KEY);
  formData.append('data_type', 'audio');
  formData.append('signature_version', '1');
  formData.append('signature', signature);
  formData.append('sample_bytes', audioBuffer.length);
  formData.append('timestamp', timestamp);
  
  const response = await axios.post(
    'https://identify-eu-west-1.acrcloud.com/v1/identify',
    formData,
    { headers: formData.getHeaders() }
  );
  
  // Parse response
  if (response.data.status.code === 0) {
    const music = response.data.metadata.music[0];
    return {
      title: music.title,
      artist: music.artists[0].name,
      album: music.album.name,
      isrc: music.external_ids?.isrc,
    };
  }
  
  throw new Error('Song not found');
}

module.exports = { identifySong };
```

#### Step 3: Match to Spotify Track

```javascript
// services/spotifyMatcher.js
const axios = require('axios');

async function matchSpotifyTrack(songInfo, userAccessToken) {
  // Search Spotify
  const searchQuery = `track:${songInfo.title} artist:${songInfo.artist}`;
  
  const response = await axios.get('https://api.spotify.com/v1/search', {
    params: {
      q: searchQuery,
      type: 'track',
      limit: 5,
    },
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
    },
  });
  
  // Return matches
  return response.data.tracks.items.map(track => ({
    id: track.id,
    song: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album_art_url: track.album.images[0]?.url,
    preview_url: track.preview_url,
  }));
}

module.exports = { matchSpotifyTrack };
```

#### Step 4: Complete Stash Endpoint

```javascript
// routes/stash.js
const express = require('express');
const { extractAudio } = require('../services/audioExtractor');
const { identifySong } = require('../services/songIdentifier');
const { matchSpotifyTrack } = require('../services/spotifyMatcher');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    const user = req.user; // From auth middleware
    
    // Step 1: Extract audio
    const audioPath = await extractAudio(url);
    
    // Step 2: Identify song
    const songInfo = await identifySong(audioPath);
    
    // Step 3: Match to Spotify
    const matches = await matchSpotifyTrack(songInfo, user.accessToken);
    
    // Clean up temp file
    fs.unlinkSync(audioPath);
    
    res.json({ matches });
  } catch (error) {
    console.error('Stash failed:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

### Phase 4: Add to Spotify Library (30 minutes)

```javascript
// routes/stash.js (continued)
router.post('/add', async (req, res) => {
  try {
    const { spotifyTrackId, sourceUrl } = req.body;
    const user = req.user;
    
    // Add to Spotify library
    await axios.put(
      'https://api.spotify.com/v1/me/tracks',
      { ids: [spotifyTrackId] },
      { headers: { Authorization: `Bearer ${user.accessToken}` } }
    );
    
    // Determine source platform
    const sourcePlatform = getSourcePlatform(sourceUrl);
    
    // Save to database
    const stash = await db.stash.create({
      data: {
        userId: user.id,
        spotifyTrackId,
        sourceUrl,
        sourcePlatform,
        createdAt: new Date(),
      },
    });
    
    // Update streak
    await updateUserStreak(user.id);
    
    // Check for achievements
    const newAchievements = await checkAchievements(user.id);
    
    res.json({ stash, newAchievements });
  } catch (error) {
    console.error('Add failed:', error);
    res.status(500).json({ error: error.message });
  }
});

function getSourcePlatform(url) {
  if (url.includes('instagram.com')) return 'Instagram';
  if (url.includes('tiktok.com')) return 'TikTok';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
  return 'Web';
}
```

---

### Phase 5: Achievements & Streaks (1 hour)

```javascript
// services/achievements.js

async function checkAchievements(userId) {
  const newAchievements = [];
  
  // Get total stashes
  const totalStashes = await db.stash.count({
    where: { userId },
  });
  
  // Define achievement thresholds
  const achievements = [
    { type: 'first_stash', threshold: 1 },
    { type: 'collector', threshold: 10 },
    { type: 'music_lover', threshold: 25 },
    { type: 'curator', threshold: 50 },
  ];
  
  // Check each achievement
  for (const achievement of achievements) {
    if (totalStashes >= achievement.threshold) {
      // Check if already unlocked
      const existing = await db.achievement.findFirst({
        where: {
          userId,
          achievementType: achievement.type,
        },
      });
      
      if (!existing) {
        // Unlock achievement
        const unlocked = await db.achievement.create({
          data: {
            userId,
            achievementType: achievement.type,
            unlockedAt: new Date(),
          },
        });
        
        newAchievements.push(unlocked);
      }
    }
  }
  
  return newAchievements;
}

async function updateUserStreak(userId) {
  const today = new Date().toDateString();
  
  const streak = await db.streak.findUnique({
    where: { userId },
  });
  
  if (!streak) {
    // Create new streak
    await db.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastStashDate: today,
      },
    });
    return;
  }
  
  const lastStashDate = new Date(streak.lastStashDate).toDateString();
  
  if (lastStashDate === today) {
    // Already stashed today, no change
    return;
  }
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  if (lastStashDate === yesterday) {
    // Continue streak
    const newStreak = streak.currentStreak + 1;
    await db.streak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastStashDate: today,
      },
    });
  } else {
    // Streak broken, reset
    await db.streak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        lastStashDate: today,
      },
    });
  }
}

module.exports = { checkAchievements, updateUserStreak };
```

---

### Phase 6: Stats API (30 minutes)

```javascript
// routes/stats.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const user = req.user;
    
    // Total stashes
    const totalStashes = await db.stash.count({
      where: { userId: user.id },
    });
    
    // This week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = await db.stash.count({
      where: {
        userId: user.id,
        createdAt: { gte: weekAgo },
      },
    });
    
    // This month
    const monthAgo = new Date();
    monthAgo.setDate(1); // First day of month
    const thisMonth = await db.stash.count({
      where: {
        userId: user.id,
        createdAt: { gte: monthAgo },
      },
    });
    
    // Get streak
    const streak = await db.streak.findUnique({
      where: { userId: user.id },
    });
    
    // Get achievements
    const achievements = await db.achievement.findMany({
      where: { userId: user.id },
    });
    
    res.json({
      totalStashes,
      thisWeek,
      thisMonth,
      streak: streak?.currentStreak || 0,
      achievements,
    });
  } catch (error) {
    console.error('Stats failed:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 🔧 **External Services Setup**

### 1. ACRCloud (Song Identification)

```
1. Go to https://www.acrcloud.com
2. Sign up for free account (1000 calls/month free)
3. Create new project
4. Copy Access Key and Access Secret
5. Add to .env file
```

### 2. Spotify API

```
1. Go to https://developer.spotify.com/dashboard
2. Create app
3. Add redirect URIs
4. Copy Client ID and Secret
5. Request these scopes:
   - user-read-email
   - user-library-modify
   - playlist-modify-public
```

### 3. yt-dlp (Audio Extraction)

```bash
# Install yt-dlp globally
npm install -g yt-dlp-wrap

# Or use in Node.js
npm install yt-dlp-wrap
```

---

## 🚨 **Error Handling**

### Common Errors & Solutions

```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err);
  
  // Spotify token expired
  if (err.response?.status === 401) {
    return res.status(401).json({
      error: 'Spotify token expired. Please login again.',
    });
  }
  
  // URL not supported
  if (err.message.includes('Unsupported URL')) {
    return res.status(400).json({
      error: 'This platform is not supported yet.',
    });
  }
  
  // Song not found
  if (err.message.includes('Song not found')) {
    return res.status(404).json({
      error: 'Could not identify the song. Try a different link.',
    });
  }
  
  // Generic error
  res.status(500).json({
    error: 'Something went wrong. Please try again.',
  });
}

module.exports = errorHandler;
```

---

## 🧪 **Testing Guide**

### Manual Testing Checklist

```
□ Spotify OAuth works
□ Can extract audio from Instagram reel
□ Can extract audio from TikTok video
□ Can extract audio from YouTube video
□ Song identification returns correct match
□ Can add song to Spotify library
□ History shows recent stashes
□ Achievements unlock correctly
□ Streak increments daily
□ Stats calculate correctly
```

### Test with Postman

```bash
# 1. Login
GET http://localhost:3000/auth/spotify/login

# 2. After OAuth, test stashing
POST http://localhost:3000/stash
Headers: Authorization: Bearer YOUR_JWT_TOKEN
Body: { "url": "https://instagram.com/reel/..." }

# 3. Add to library
POST http://localhost:3000/stash/add
Headers: Authorization: Bearer YOUR_JWT_TOKEN
Body: { "spotifyTrackId": "...", "sourceUrl": "..." }

# 4. Get history
GET http://localhost:3000/history
Headers: Authorization: Bearer YOUR_JWT_TOKEN

# 5. Get stats
GET http://localhost:3000/stats
Headers: Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🚀 **Deployment**

### Deploy to Railway (Recommended)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add PostgreSQL database
railway add postgresql

# 5. Set environment variables
railway variables set SPOTIFY_CLIENT_ID=your_id
railway variables set SPOTIFY_CLIENT_SECRET=your_secret
# ... (set all .env variables)

# 6. Deploy
railway up
```

### Deploy to Vercel (Serverless)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Set environment variables in Vercel dashboard
# 4. Use Vercel Postgres for database
```

### Deploy to Render

```bash
# 1. Go to https://render.com
# 2. Connect GitHub repo
# 3. Create Web Service
# 4. Add PostgreSQL database
# 5. Set environment variables
# 6. Deploy
```

---

## 📊 **Performance Tips**

1. **Cache Spotify Access Tokens** (refresh only when expired)
2. **Use CDN for Album Art** (CloudFlare Images)
3. **Queue Audio Processing** (Redis + Bull)
4. **Rate Limit API** (express-rate-limit)
5. **Compress Responses** (gzip middleware)

---

## 🔒 **Security Checklist**

```
□ Store secrets in environment variables
□ Use HTTPS only
□ Implement rate limiting
□ Validate all inputs
□ Sanitize user data
□ Use prepared statements (SQL injection prevention)
□ Implement CORS properly
□ Hash sensitive data
□ Use secure session cookies
□ Keep dependencies updated
```

---

## 📚 **Resources**

- [Spotify API Docs](https://developer.spotify.com/documentation/web-api)
- [ACRCloud Docs](https://docs.acrcloud.com)
- [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)

---

## 🎯 **Quick Start (Copy-Paste Ready)**

### Supabase Setup (5 minutes)

```sql
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spotify_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stashes table
CREATE TABLE stashes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  spotify_track_id VARCHAR(255) NOT NULL,
  track_name VARCHAR(500),
  artist_name VARCHAR(500),
  album_art_url TEXT,
  preview_url TEXT,
  source_platform VARCHAR(100),
  source_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  auto_add_top_match BOOLEAN DEFAULT FALSE,
  default_playlist_id VARCHAR(255),
  theme VARCHAR(10) DEFAULT 'dark',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Streaks
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_stash_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_stashes_user_id ON stashes(user_id);
CREATE INDEX idx_stashes_created_at ON stashes(created_at);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);

-- Enable Row Level Security
ALTER TABLE stashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own stashes" ON stashes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stashes" ON stashes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own stashes" ON stashes FOR DELETE USING (auth.uid() = user_id);
```

---

## ✅ **Done!**

You now have a complete backend implementation plan. Choose your path:

1. **Easy Mode**: Use Supabase (recommended for beginners)
2. **Custom Mode**: Build with Node.js/Express
3. **Python Mode**: Use FastAPI

**Next Steps**:
1. Set up database
2. Configure Spotify OAuth
3. Set up ACRCloud
4. Test each endpoint
5. Deploy to production

Good luck! 🚀

