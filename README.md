# 🎵 Stash — Save the songs you discover

Stash turns music links from Instagram Reels, YouTube Shorts, and other supported sources into saved songs in your Spotify library. It is a responsive React app with an installable Android/Chrome PWA and a FastAPI recognition backend.

*Made with ❤️ by [Sahil Sharma](https://github.com/Stashyourmusic) to bridge the gap between social discovery and your music library.*

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

## ✨ Features

- 🎯 **Instant Recognition** - Identify songs from Instagram Reels and YouTube links
- 🎧 **Direct Spotify Integration** - Save songs directly to your Spotify library or playlists
- 🧠 **Smart Stash** - Organize saved songs by genre when the backend can classify them
- 📊 **Music Analytics** - Track your listening habits with beautiful stats and mood boards
- 📱 **PWA Support** - Install Stash on Android/Chrome for faster launches and native sharing
- 🌓 **Dark/Light Mode** - Fully responsive with theme support
- 🚀 **Fast & Reliable** - Powered by Shazam audio fingerprinting through FastAPI

---

## 🚀 Quick Start


---

### Prerequisites

- Node.js 18+ 
- Python 3.11+
- Supabase account
- Spotify Developer account

### Environment Variables

Create `.env.local` in the root directory for the frontend and keep backend-only secrets in the environment used by your FastAPI host:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API (local FastAPI or your deployed FastAPI URL)
VITE_API_URL=http://localhost:8000

# Backend-only variables (do not expose these as VITE_ variables)
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

The Vite dev server runs on port 3000 and the FastAPI server runs on port 8000. Set `VITE_API_URL` to the backend you are actually running before starting Vite.

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
3. Paste an Instagram Reel, or YouTube link
4. Click "Stash" - song is instantly saved to your library!

### Mobile (PWA)

1. Visit site on mobile browser
2. Choose **Add to Home screen** in Chrome
3. Share reels directly from Instagram → "Stash" app
4. Song recognizes and saves automatically!

The installed Android/Chrome app uses a cached app shell for fast repeat launches. API and authentication calls still require a network connection. The first launch after an update can be online; later launches can show the cached shell and the offline screen when the network is unavailable.

When a new Stash release is available, it downloads in the background and shows an **Update** button. Choose it when you are ready; Stash activates the new worker and reloads once. Existing installations update this way without needing to be installed again. Chrome controls when the home-screen icon and manifest metadata are refreshed.

The short logo animation runs on fresh launches and respects the device's reduced-motion setting. It does not replay every time you return to the app.

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
When enabled, Stash can organize recognized songs by genre into themed playlists such as "Stash: Techno" and "Stash: Pop". Recognition, Spotify access, and playlist operations depend on the configured backend and account connection.

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

### Test the production PWA locally

The normal Vite dev server intentionally clears local service-worker registrations so stale caches do not hide code changes. To test installation, offline navigation, and update prompts, build and serve the production output:

```bash
npm run build
npm run preview
```

Open the preview URL in Chrome, install it from the address bar, and use DevTools → Application → Service Workers to inspect the active and waiting workers. Run a second build after a source change, reload the preview, and use Stash's **Update** button to activate it. Previewing over `localhost` is supported; production deployments should serve `/sw.js`, `/index.html`, and `/manifest.json` with revalidation headers.

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

### Free Hugging Face uptime
- The free `cpu-basic` Hugging Face Space can sleep after prolonged inactivity.
- Use an external uptime monitor against `https://shanushrma-stash-backend.hf.space/health`.
- A 12-hour ping cadence is enough to stay comfortably below the 48-hour sleep window while remaining free-tier friendly.
- Expect occasional cold starts after rebuilds or long idle periods anyway, and keep the frontend retry copy aligned with that behavior.

### PWA looks stale or does not update
- Confirm you are using `npm run preview` or a deployed HTTPS site; `npm run dev` removes local service workers by design.
- Wait for the **Update** button instead of reinstalling the app.
- In Chrome DevTools → Application, check that `/sw.js` is controlled by the current origin and clear only the Stash cache if a previous development build is stuck.
- An installed PWA cannot make Spotify, Supabase, or recognition requests while offline; only the app shell and cached static assets are available.

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

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
---
title: Stash Backend
emoji: "🎵"
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 8000
---
