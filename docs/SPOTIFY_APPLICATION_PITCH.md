# 📄 Spotify Extended Quota Application Pitch

Use this content when filling out the **Quota Extension Request** form in the Spotify Developer Dashboard. 

> [!TIP]
> Even if you don't meet the 250k MAU requirement yet, a professional and value-aligned application can sometimes trigger an exception or at least get you on their radar.

---

## 1. App Description & Use Case
**Question:** What does your app do?
**Draft:**
Stash is a productivity tool for music discovery that bridges the gap between social media platforms (Instagram, TikTok, YouTube) and the Spotify ecosystem. It allows users to instantly identify music from social media links and "stash" them directly into their Spotify library or genre-specific playlists. By streamlining the path from "social discovery" to "Spotify saving," Stash increases user engagement and listenership within Spotify, preventing discovered tracks from being forgotten.

## 2. Value to Spotify Ecosystem
**Question:** How does this benefit Spotify and its users?
**Draft:**
Stash acts as a funnel for the Spotify platform. Users frequently discover music on social media but lack a frictionless way to save those tracks to their primary streaming service. Stash solves this, ensuring that songs discovered elsewhere result in actual streams on Spotify. Our "Smart Stash" feature also encourages organization, leading to higher playback rates of saved tracks. We are committed to exposing Spotify's rich catalog to users the moment they encounter a song in the wild.

## 3. Compliance & Security
**Question:** How do you handle user data?
**Draft:**
Stash adheres strictly to Spotify’s Developer Terms. We use official OAuth flows via Supabase Auth, ensuring that we never see or store user credentials. We only request the minimum necessary scopes (`user-library-modify`, `playlist-modify-public`) required to perform the "stashing" action initiated by the user. Our backend is hosted on Railway with secure environment variable management, and our frontend is a secure PWA.

## 4. Growth & Metrics
**Question:** What is your current user base and growth plan?
**Draft:**
We are currently in a successful private beta (limited to 25 users) with a 90%+ feature-utilization rate. We have a growing waitlist of [INSERT NUMBER] users who are eager to use the service. Our goal is to scale responsibly—starting with this quota extension—to meet the clear demand we've identified in the music-sharing community.

## 5. Why Extended Quota Now?
**Question:** Why do you need to move out of development mode?
**Draft:**
The current 25-user limit prevents us from fulfilling the demand from our waitlist and gathering the data required to reach the next tier of scale. Moving to Extended Quota Mode will allow us to open the platform to our initial 1,000+ waitlisted users, helping us build the momentum needed to eventually reach "Partner" status.

---

## Final Submission Advice:
- **Use a custom domain email** if possible (even if not a "company" yet).
- **Link to your live demo:** https://stashyourmusic.vercel.app
- **Include professional screenshots** of the "Mood Board" and "History" views to show high quality.
- **Be persistent.** If they deny you, reply and ask for specific feedback or a smaller quota increase (e.g., 500 users).
