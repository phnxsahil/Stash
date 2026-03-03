# Stash Backend Audit (Resume-Level Strength)

## Objective Facts

1. Number of backend routes: 5
   - GET /, HEAD / (health)
   - POST /recognize
   - POST /analyze_vibe
   - POST /save_track
   - POST /remove_track

2. Number of external API call sites (by provider)
   - Spotify: 10 call sites
     - search
     - current_user
     - track
     - current_user_playlists
     - user_playlist_create
     - playlist_add_items
     - playlist
     - current_user_saved_tracks_add
     - current_user_saved_tracks_delete
     - playlist_remove_all_occurrences_of_items
   - Shazam: 1 call site (recognize)
   - Gemini: 2 call sites (genre detection, vibe analysis)

3. Number of transactional or multi-step write sequences: 2
   - /save_track: detect genre -> find/create playlist -> add track to playlist or liked songs
   - /remove_track: remove from liked songs -> optionally remove from playlist

4. Idempotency on Spotify save/remove paths: No explicit idempotency keys or dedupe logic.

5. Rate limiting process-safe or distributed: Process-local, in-memory list per IP. Not distributed, not persisted.

6. Audio processing blocking or async: Mixed; download via yt-dlp is blocking inside async handler. Shazam recognition is async.

7. Count of potential race-condition points: 4
   - Shared in-memory request_log for rate limiting
   - Shared in-memory Spotify cache (_spotify_cache)
   - Shared cookie file paths (/tmp/instagram_cookies.txt, /tmp/youtube_cookies.txt, /tmp/cookies.txt)
   - Temp audio filename based on seconds (temp_{int(time.time())}) can collide

8. Spotify OAuth tokens validated server-side: No. Token is accepted and used directly for API calls.

9. Duplicate saves prevented: No.

10. History queries paginated: No. Supabase history fetch selects full history without limit/pagination.

11. Retries/backoff for external API calls: Partial.
   - Shazam recognize has retry with incremental backoff (1s, 2s). Spotify and Gemini do not.

12. Request timeouts enforced: No explicit timeouts on requests to Gemini, Shazam, Spotify, or yt-dlp.

## Evaluation (assume 500 concurrent users, burst recognition traffic)

Data integrity: 3/10
- No dedupe or idempotency on Spotify saves.
- Multi-step write sequences are not transactional and have no compensating logic.
- History write path is client-side and not enforced server-side.

Concurrency safety: 2/10
- Shared in-memory rate limit and cache are not coordinated across workers.
- Shared cookie files and timestamp-based temp filenames can collide under concurrency.
- Blocking download in async handler stalls the event loop under load.

Scalability: 3/10
- Blocking yt-dlp inside async handler limits throughput.
- No queueing, no worker separation for heavy recognition workloads.
- Rate limiting is per-process only and ineffective in multi-instance deployments.

External API resilience: 3/10
- Only Shazam has retry; Spotify and Gemini have none.
- No explicit timeouts; failures can hang requests.
- No circuit breaker or fallback strategy.

Security clarity: 4/10
- Client-provided Spotify token is not validated server-side.
- /recognize endpoint is unauthenticated and only uses IP-based rate limiting.
- CORS is configured but no server-side auth/permission checks for save/remove endpoints.
