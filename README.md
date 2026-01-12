# 🎵 Stash - The Internet's Save Button for Music

**Instantly save songs from Instagram Reels, TikTok, and YouTube directly to your Spotify library.**

![React](https://img.shields.io/badge/react-%2320232d.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007acc.svg?style=for-the-badge&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Framer](https://img.shields.io/badge/Framer-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![AI Optimized](https://img.shields.io/badge/AI--Optimized-NotebookLM-blueviolet?style=for-the-badge&logo=google-gemini&logoColor=white)

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://stashyourmusic.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📖 Deep-Dive & Mastery Documentation
This repository is fully documented for both human learning and AI ingestion (e.g., NotebookLM). 

- 🗺️ **[The Stash Odyssey](./docs/mastery/STASH_ODYSSEY.md)** - The start-to-finish story of how this project was built.
- 📚 **[The Stash Master Bible](./docs/mastery/STASH_MASTER_BIBLE.md)** - An exhaustive deep-dive into the code, architecture, and logic.
- 🎓 **[Technical Masterclass](./docs/mastery/TECHNICAL_MASTERCLASS.md)** - Simple explanations for complex engineering concepts used in Stash.
- 🏁 **[The 1-Hour Gauntlet](./docs/mastery/THE_1_HOUR_GAUNTLET.md)** - A comprehensive interview bank for technical and product roles.
- 🏎️ **[Mastery Dashboard](./docs/mastery/STASH_MASTERY_DASHBOARD.md)** - Resume-ready bullet points and project index.

---

---

## ✨ Features

- 🎯 **Instant Recognition** - Identify songs from Instagram Reels, TikTok, and YouTube links
- 🎧 **Direct Spotify Integration** - Save songs directly to your Spotify library or playlists
- 🧠 **Smart Stash** - Auto-organize songs by genre into custom playlists
- 📊 **Music Analytics** - Track your listening habits with beautiful stats and mood boards
- 📱 **PWA Support** - Install as an app on any device
- 🌓 **Dark/Light Mode** - Fully responsive with theme support
- 🚀 **Fast & Reliable** - Powered by Shazam audio fingerprinting

---

## 🚀 Quick Start

### 🌟 GitHub Codespaces (Recommended for Collaboration)

Get started in seconds with a pre-configured cloud development environment:

1. **Click** the green "Code" button → "Create codespace on main"
2. **Wait** 3-5 minutes for automatic setup (Node.js, Python, ffmpeg, dependencies)
3. **Configure** environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API credentials
   ```
4. **Run** the app:
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   python main.py
   ```

Your app will be available at the forwarded ports (5173 for frontend, 8000 for backend).

> **💡 Tip**: Configure [Codespaces secrets](https://docs.github.com/en/codespaces/managing-your-codespaces/managing-secrets-for-your-codespaces) for your API keys to avoid manual .env setup.

---

### Prerequisites

- Node.js 18+ 
- Python 3.11+
- Supabase account
- Spotify Developer account
- Railway account (for backend hosting)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
VITE_API_URL=your_railway_backend_url

# Backend (Railway)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
GEMINI_API_KEY=your_gemini_api_key
YTDLP_COOKIES=your_instagram_cookies
```

### Local Development

**Frontend:**
```bash
npm install
npm run dev
```

**Backend:**
```bash
pip install -r requirements.backend.txt
python main.py
```

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Auth:** Supabase
- **Hosting:** Vercel
- **Charts:** Recharts
- **Animations:** Framer Motion

### Backend
- **Framework:** FastAPI
- **Audio Recognition:** Shazamio (Shazam API)
- **Music API:** Spotify Web API (spotipy)
- **Video Downloader:** yt-dlp
- **AI:** Google Gemini (for genre detection)
- **Hosting:** Railway

---

## 📦 Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy!

### Backend (Railway)

1. Connect your GitHub repo to Railway
2. Set environment variables (including Instagram cookies)
3. Railway auto-deploys from `main` branch

### Supabase Setup

1. Create a new Supabase project
2. Enable Spotify OAuth provider
3. Add redirect URLs:
   - `https://yourdomain.vercel.app/**`
   - `https://your-supabase-url.supabase.co/auth/v1/callback`
4. Create `history` table (auto-created via Supabase migrations)

### Spotify Developer Setup

1. Create a new app at https://developer.spotify.com/dashboard
2. Add Redirect URIs:
   - `https://yourdomain.vercel.app`
   - `https://your-supabase-url.supabase.co/auth/v1/callback`
3. Copy Client ID and Secret to environment variables

---

## 🎮 Usage

### Desktop

1. Visit https://stashyourmusic.vercel.app
2. Login with Spotify
3. Paste an Instagram Reel, TikTok, or YouTube link
4. Click "Stash" - song is instantly saved to your library!

### Mobile (PWA)

1. Visit site on mobile browser
2. "Add to Home Screen"
3. Share reels directly from Instagram → "Stash" app
4. Song recognizes and saves automatically!

---

## 🔐 Instagram Cookie Setup

For Instagram Reels to work, you need to provide cookies:

1. Install "Get cookies.txt LOCALLY" browser extension
2. Visit instagram.com while logged in
3. Export cookies
4. Add to Railway as `YTDLP_COOKIES` environment variable

**For scaling:** Add multiple cookie sets as `YTDLP_COOKIES_1`, `YTDLP_COOKIES_2`, etc.

See [`INSTAGRAM_COOKIES_GUIDE.md`](./INSTAGRAM_COOKIES_GUIDE.md) for detailed instructions.

---

## 📊 Features in Detail

### Smart Stash
Automatically organizes songs by genre into themed playlists like "Stash: Techno", "Stash: Pop", etc.

### Rate Limiting
- Free tier: 10 songs/day per IP
- Protects against abuse
- Ready for premium tier implementation

### Stats & Analytics
- Songs stashed this week
- Current listening streak
- Top genres and artists
- Beautiful mood board visualizations

---

## 🛠️ Development

### Project Structure

```
stash/
├── src/
│   ├── components/     # React components
│   ├── lib/           # API & utilities
│   └── ...
├── api/               # Backend (Railway)
├── public/            # Static assets
└── main.py           # Backend entry point
```

### Key Files

- `src/App.tsx` - Main app logic
- `src/lib/api.ts` - Frontend API client
- `api/index.py` - Backend FastAPI routes
- `main.py` - Backend server

---

## 🐛 Troubleshooting

### Auth not working
- Verify Supabase redirect URLs include `/**` wildcard
- Check Spotify Developer Dashboard redirect URIs
- Clear browser cache and try incognito mode

### Instagram downloads failing
- Check if cookies are expired (refresh every ~90 days)
- Verify `YTDLP_COOKIES` is set in Railway
- Public posts should work without cookies

### Backend errors
- Check Railway logs for specific errors
- Verify all environment variables are set
- Ensure ffmpeg is installed (auto-installed in Docker)

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Created by**: [User](https://github.com/Stashyourmusic)
- [Shazam](https://www.shazam.com/) for audio fingerprinting
- [Spotify](https://spotify.com) for their amazing API
- [Supabase](https://supabase.com) for auth infrastructure
- [Vercel](https://vercel.com) & [Railway](https://railway.app) for hosting

---

## 🔗 Links

- **New Repository:** https://github.com/Stashyourmusic/Stash
- **Live Demo:** https://stashyourmusic.vercel.app
- **Backend API:** https://stash-production-ed8d.up.railway.app
- **Report Issues:** [GitHub Issues](https://github.com/Stashyourmusic/Stash/issues)

---

Made with ❤️ for music lovers everywhere