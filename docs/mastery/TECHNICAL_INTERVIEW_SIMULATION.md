# 🧪 Stash Technical Interview Simulation

This is a **Stress Test**. Below are the questions a Senior Engineer or Lead Architect will ask when they look at your **GitHub Repository** or **Live Website**.

---

## 🧐 Part 1: The GitHub "Code Probe"
*The interviewer is screen-sharing your repo. They are scrolling through your code.*

### 1. The "Hacky" Cookie Choice
**Interviewer**: *"I see in `api/config.py` you’re manually loading `YTDLP_COOKIES_1`, `YTDLP_COOKIES_2` in a while loop. Why didn't you use a database for this, and isn't rotating cookies a bit of a cat-and-mouse game with Instagram?"*

> **How to Answer**: 
> "You're 100% right—it is a cat-and-mouse game. I chose the `.env` approach for the MVP because it allowed for **instant rotation** without the latency or complexity of a database connection during the cold start of a serverless function. 
> 
> The 'Real-World' solution would be a distributed secret manager (like AWS Secrets Manager), but for this scale, I prioritized **Operational Simplicity**. It allowed me to ship the feature and monitor the success rate immediately."

### 2. The Persistence Strategy
**Interviewer**: *"In `api.ts`, your `getUserHistory` fetch has a fallback to fetch *all* songs if the user filter fails. Doesn't that leak data or create a privacy concern if unintended users see others' songs?"*

> **How to Answer**: 
> "Excellent catch. That was a conscious design trade-off for **Availability** over strict **Privacy** in the initial debug phase. In a strict production environment, I would replace that fallback with a localized 'Offline Cache' (like IndexDB) on the frontend. 
> 
> I used this specific fallback to ensure that during a demo or an unstable network state, the UI remains functional and informative rather than going completely blank, which is often a worse user experience for a discovery app."

---

## 🏗️ Part 2: Architecture & Scalability (Medium/Hard)

### 1. Scaling the "Indie Wall"
**Interviewer**: *"Spotify limits you to 25 users in development mode. If this app went viral tomorrow and you had 10,000 users sign up, how would you re-architect the backend to stay within Spotify’s Extended Quota requirements while managing thousands of concurrent audio identification requests?"*

> **How to Answer**: 
> "To handle 10k users, I'd shift to an **Asynchronous Job Queue**. Right now, the `/recognize` endpoint is synchronous—the user waits for the download and the identification. 
> 
> I would move to a **Redis/Celery** architecture:
> 1. User submits URL $\rightarrow$ Backend returns a 'Job ID'.
> 2. Worker nodes handle the `yt-dlp` download in the background.
> 3. Once identified, the backend pushes a notification via **WebSockets** or **Supabase Realtime** to the frontend.
>
> This prevents server timeouts and allows us to horizontally scale the worker nodes independently of the web server."

### 2. The "Dirty" Data Problem
**Interviewer**: *"Audio identification isn't perfect. What do you do when Shazam returns metadata that Spotify doesn't recognize?"*

> **How to Answer**: 
> "This happens often. My current strategy is a **Fuzzy Match + Popularity Sort**. If an exact title match fails, I use the Spotify API's search with a lower threshold and sort the results by 'Popularity'. 
> 
> If the confidence is still low, the 'Product' answer is to show the user the **Top 3 Closest Matches** and let them pick. It turns a potential system failure into an interactive user moment."

---

## 🌐 Part 3: The Live Website Probe

### 1. The "Lag" Perception
**Interviewer**: *"Identification takes about 5-8 seconds on the live site. That's a long time. How did you optimize the 'Perceived Performance' of that wait?"*

> **How to Answer**: 
> "Since the bottleneck is the actual network download of the audio, I can't make physics faster. Instead, I focused on **Visual Feedback**. 
> 
> I built the `ProcessingOverlay` with specific status updates: 'Extracting Audio...', 'Analyzing Vibe...', 'Syncing to Spotify...'. By showing the user exactly *what* the system is doing, the 8 seconds feels like a high-tech process rather than a 'stuck' website."

---

## 💡 The "Defensive" Interview Strategy

**If they find a bug or something "bad":**
- **Don't**: Make excuses or say "I didn't know."
- **Do**: Say, "I'm aware of that technical debt. Here is how I would fix it given one more week: [Insert Plan]."

**If they ask about a piece of code you don't fully remember:**
- **Do**: Focus on the **Intent**. "I don't recall the specific line syntax for that library right now, but the *goal* of that block was to [Explain Goal]."

---

## 🛠️ Part 4: The Hard Cases (Architect Level)
*The interviewer wants to see how you handle massive scale and "dirty" production environments.*

### 1. The "Thundering Herd" (Concurrency)
**Interviewer**: *"What happens if a famous influencer posts a reel, and 50,000 people try to stash it at the exact same millisecond? Your backend hits the same URL 50k times. How would you prevent your server from being blacklisted by Instagram?"*

> **How to Answer**: 
> "I would implement a **Distributed Lock (or Request Coalescing)** using Redis. 
> 
> When a request comes in for URL `X`, the backend checks Redis: 'Is someone already downloading `X`?' 
> - If yes, the secondary requests 'Wait' (or subscribe to a channel). 
> - If no, the first request downloads the audio once. 
> - Once done, the result is cached and pushed to all waiting users. 
>
> This ensures that no matter how many people want the song, we only hit the external API **once** per song."

### 2. High-Latency & Edge Computing
**Interviewer**: *"Your database is in the US, but a user in Japan is trying to stash a song. The round-trip time is killing the user experience. How do you fix this without moving your entire database to Japan?"*

> **How to Answer**: 
> "I would move the 'Decision Making' to the **Edge** using Vercel/Cloudflare Edge Functions. 
> 
> We can cache common song identifications at the Edge. If a user in Japan stashes a song that has already been stashed by someone else, we return the cached Spotify URI from a local 'Edge KV' store without ever hitting the origin database. We only go back to the US for unique, first-time identifications."

---

## 📊 Part 5: Observability & Monitoring

### 1. "How do you know it's broken?"
**Interviewer**: *"You're asleep at 3:00 AM. The backend starts failing for 20% of users. How are you alerted, and what's the first dashboard you look at?"*

> **How to Answer**: 
> "I would have **Sentry** integrated for error tracking and **Prometheus/Grafana** for metrics. 
> 
> Specifically, I would look at the **'HTTP 4xx/5xx' error rates** segmented by 'Source URL'. If I see 403 errors spiking only for Instagram links, I know it's a cookie rotation failure. If I see 500s across the board, it's likely a database connection pool exhaustion. Monitoring isn't just about 'if' it's broken, but 'where' the leak is."

---

## 🏆 The "Final Boss" Interview Question
**Interviewer**: *"If you had a $1,000,000 budget and a team of 5 engineers to take Stash to 10M MAU, what is the FIRST thing you change in the current codebase?"*

> **How to Answer**: 
> "I would decouple the **Monolithic API** into **Microservices**. 
> 
> I'd separate the 'Audio Extraction' into its own autoscaling cluster because it's CPU-heavy, and keep the 'Auth/User' service lightweight and ultra-fast. Then, I'd implement a global **event-driven architecture** using Kafka or RabbitMQ to manage the data flow asynchronously, ensuring that a spike in one part of the world doesn't slow down the app for everyone else."

---

**Master's Final Strategy**: 
When you're asked these 'Hard' questions, the interviewer doesn't always expect you to have a perfect answer. They want to see your **Mental Model**. Show them you can think in terms of **Bottlenecks, Caching, and Fault Tolerance.**
