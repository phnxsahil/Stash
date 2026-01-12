# 🏁 The 1-Hour Stash Gauntlet: Every Question Answered

This guide is designed as a **60-minute simulated interview**. It covers every possible question an interviewer (from HR to the CTO) could throw at you regarding Stash.

---

## ⏱️ Minute 0-10: Introduction & Behavioral
*Goal: The interviewer wants to see if you can communicate complex ideas simply.*

### 1. "Walk me through what Stash is in 60 seconds."
*   **Pro Answer**: "Stash is a full-stack automated music discovery engine. It identifies songs from social media URLs (Instagram/TikTok/YouTube) and saves them directly to a user's Spotify library. I built it to solve the 'Lost Vibe' friction point using FastAPI, React, and Supabase."

### 2. "What was the most difficult technical trade-off you made?"
*   **Pro Answer**: "The choice between **Synchronous vs. Asynchronous identification**. I chose synchronous for the MVP to prioritize immediate user feedback (the 'Wow' moment), but I had to implement robust UI overlays to manage the 8-second wait time. If I were to re-architect for scale, I'd move to a Redis-based job queue."

---

## ⏱️ Minute 10-25: Frontend Deep-Dive (React & TS)
*Goal: Prove you master modern UI development.*

### 3. "Why TypeScript over plain JavaScript for this project?"
*   **Pro Answer**: "Type safety, especially when dealing with nested API responses from Spotify and Shazam. It prevented dozens of 'undefined' errors when mapping tracks and allowed me to refactor the `SongMatch` interface without breaking the UI."

### 4. "How do you manage state for the identification process?"
*   **Pro Answer**: "I use React's `useState` and `useEffect` hooks in `api.ts` and `AppView.tsx`. I track a `loadingStatus` string (e.g., 'Downloading...', 'Thinking...') which reactively updates the `ProcessingOverlay` component to keep the user informed."
*   **⚠️ The Cross-Question**: *"Why not use a state management library like Redux or Zustand for this global state?"*
*   **Defense**: "For this specific use case, the state is mostly local to the Stash-to-History flow. Pulling in Redux would have added unnecessary boilerplate and bundle size. If the app grew to have complex sibling-component communication (like a real-time player and a separate settings panel), I would migrate to **Zustand** for its simplicity and performance."

### 5. "What happen if a user refreshes during a stash?"
*   **Pro Answer**: "Currently, the state is in memory, so a refresh cancels the local UI process. However, the backend might still finish the job. To fix this in production, I'd implement a 'Job Polling' system using a unique ID stored in LocalStorage."
*   **⚠️ The Cross-Question**: *"Doesn't storing things in LocalStorage expose you to XSS (Cross-Site Scripting) attacks?"*
*   **Defense**: "LocalStorage is indeed vulnerable to XSS. That's why I only ever store non-sensitive 'Status IDs'. I never store Auth Tokens or personal info there. For session persistence, I rely on **HttpOnly Cookies**, which are invisible to JavaScript scripts and thus protected from most XSS attacks."

---

## ⏱️ Minute 25-40: Backend & API (FastAPI & Python)
*Goal: Show you understand the 'Brain' and data extraction.*

### 6. "How does `yt-dlp` interact with Instagram's bot protection?"
*   **Pro Answer**: "Instagram uses aggressive bot detection. I implemented a **Cookie Rotation** system in `api/config.py`. By loading multiple valid session cookies and rotating them per request, I simulate real user sessions and avoid IP rate-limiting."

### 7. "Tell me about the logic inside `search_spotify_strict`."
*   **Pro Answer**: "Shazam metadata is often 'dirty' (contains 'Remix', '2024 Remaster', etc.). My logic queries Spotify for multiple results, then uses a **Popularity Sort**. Since covers are rarely more popular than originals, this ensures we almost always save the correct version."
*   **⚠️ The Cross-Question**: *"But what if the user actually wanted the Remix?"*
*   **Defense**: "That's a great point about user intent. In the next iteration, I'd provide a 'Search Results' UI where users can see the top 3 matches and confirm the one they want. For this MVP, I optimized for the 'Mainstream Case' to keep the friction low."

### 8. "Why FastAPI? Why not Node.js or Django?"
*   **Pro Answer**: "Python was essential for the audio libraries (`shazamio`, `yt-dlp`). FastAPI offered the best performance with its `async/await` support, which is critical when the server is waiting on external network calls."
*   **⚠️ The Cross-Question**: *"Django also supports async now. Why not go with a more established framework?"*
*   **Defense**: "Django comes with a lot of 'batteries included' like a built-in Admin and ORM that I didn't need for this specific music engine. FastAPI is much more lightweight and allowed me to build a high-performance, documentation-first API with **Pydantic** validation in half the time."

---

## ⏱️ Minute 40-55: Systems Design & Security
*Goal: Senior-level architectural thinking.*

### 9. "How do you secure your API keys in production?"
*   **Pro Answer**: "I use environment variables (`.env`) which are never committed to GitHub. On Railway and Vercel, I use their native Secret Management to inject these keys at runtime."
*   **⚠️ The Cross-Question**: *"If I were to compromise your Railway account, I'd have all your keys. How would you improve this?"*
*   **Defense**: "I would move the keys to a dedicated Secret Manager (like AWS Secrets Manager or HashiCorp Vault) with short-lived access policies and audit logging. This would add a layer of separation between the 'Hosting' and the 'Secrets'."

### 10. "If I want to add Apple Music support, how do you change the code?"
*   **Pro Answer**: "I would introduce a **Service Interface** pattern. Instead of calling Spotify-specific functions in `api.ts`, I'd create a generic `saveTrack` function that routes to either a `SpotifyProvider` or an `AppleMusicProvider` based on the user's preference."
*   **⚠️ The Cross-Question**: *"Apple Music uses a completely different Auth flow (MusicKit). How do you handle multiple auth providers?"*
*   **Defense**: "I'd use a **Strategy Pattern**. I would create an abstract `AuthProvider` class. When the user logs in, the app detects the provider and uses the corresponding strategy for token exchange and refreshes, keeping the main application logic clean."

### 11. "Explain your database schema and RLS."
*   **Pro Answer**: "I have a `songs` table where each row has a `user_id`. I implemented **Row Level Security (RLS)** in PostgreSQL (Supabase) so that even if my frontend has a bug, a user can *never* query or delete another user's history at the database level."

---

## ⏱️ Minute 55-60: The "Stress" End-Game
*Goal: Can you handle the hardest scenarios?*

### 12. "Suppose the server runs out of disk space during an audio download. Does the app crash?"
*   **Pro Answer**: "No. I wrapped the `download_audio` logic in a `try-except` block. If the download fails for any reason (including disk space), the backend raises a clean 422 error, which the frontend catches to show a 'Service Temporarily Unavailable' toast."

### 13. "If you had to monetize this tomorrow, what technical gate would you build?"
*   **Pro Answer**: "I already have the groundwork in `index.py` with the **Rate Limiter**. I would move the `RATE_LIMIT` variable from the config into a `user_pro_status` column in the database, allowing 'Pro' users to bypass the 10-stash daily limit."

---

## 🛡️ The "Code Probe" Cheat Sheet
*If they open GitHub and point at a file:*

| File | What to say |
| :--- | :--- |
| `App.tsx` | "This is the entry point—it handles layout switching and global theme state." |
| `index.py` | "This is the API hub. It coordinates the rate-limiting and the audio-to-metadata pipeline." |
| `api.ts` | "This is the communication bridge. It handles the Spotify 'Secret Handshake' (OAuth)." |
| `StatsView.tsx` | "This is the analytics engine. It uses AI (Gemini) to categorize the user's music vibe." |

---

**Master's Tip**: Keep your answers under 60 seconds. Focus on **Intent** (Why you did it) and **Result** (How it helped the user). 🚀
