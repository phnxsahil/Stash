# Stash Scaling Ceiling Estimate

Assumptions
- 5k users, 1k monthly active
- 200 peak concurrent recognition requests
- 10k stash history rows

Scaling ceiling (qualitative)
- Primary ceiling is concurrent /recognize load. The current implementation will degrade sharply well before 200 concurrent requests due to blocking yt-dlp work on the async event loop and shared temp file paths. Expect significant queueing and timeouts under burst traffic without worker isolation.

Bottlenecks

CPU bottleneck (audio download + fingerprinting)
- yt-dlp download and ffmpeg extraction run in-process and block the event loop; CPU spikes scale with concurrent requests. This becomes the first hard limit as concurrency grows.

Network bottleneck
- Inbound: large concurrent video downloads (yt-dlp) saturate outbound bandwidth from the server. Each request fetches at least one video segment; failures can double downloads due to cookie retry.

Spotify API bottleneck
- /recognize triggers Spotify search for every successful Shazam match; /save_track triggers multiple Spotify calls (track info, playlists list/create/add). At 200 concurrent recognition + saves, Spotify rate limits are the first external API bottleneck.

Supabase bottleneck
- History writes and reads are unpaginated and tied to user actions; at 10k rows, full-history reads are acceptable but will degrade with growth and cause larger payloads per request. No batching or pagination.

Memory usage bottleneck
- In-memory request_log (rate limiting) and _spotify_cache are unbounded relative to traffic and can grow under sustained usage. Temp file handling also uses local disk and memory buffers inside yt-dlp/ffmpeg.

Top 3 ROI improvements (no architecture redesign)

1) Offload blocking work to a thread/process pool inside the same service
- Use run_in_executor for yt-dlp/ffmpeg, keeping the FastAPI event loop responsive.
- Immediate gain: higher concurrency and fewer timeouts without changing endpoints.

2) Add strict timeouts + retries with backoff on external requests
- Apply timeouts to Gemini/Spotify requests and add retry policies for Spotify search/save.
- Immediate gain: reduced tail latency and fewer hung requests under rate limits.

3) Fix temp file and cookie file collisions
- Use unique per-request temp paths (uuid or mkstemp) and per-request cookie files.
- Immediate gain: eliminates cross-request corruption and improves correctness under concurrency.
