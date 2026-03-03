# Stash Backend Simulation Scenarios (Technical)

## Scenario A: 100 users submitting URLs simultaneously

What breaks?
- The async /recognize handler performs blocking yt-dlp downloads on the event loop; with 100 concurrent requests, the server thread(s) are saturated and requests queue or time out at the reverse proxy.
- Temp file naming uses second-level timestamp; multiple requests in the same second can collide on /tmp/temp_<timestamp>, overwriting audio or deleting each other’s files.
- Shared cookie files (/tmp/instagram_cookies.txt, /tmp/youtube_cookies.txt) can be overwritten by concurrent requests, leading to cross-request cookie leakage and failed downloads.

Where does duplicate or inconsistent state occur?
- Audio files can be overwritten between requests, yielding incorrect Shazam matches or 500s if files disappear mid-processing.
- Rate-limit counters are per-process; in multi-worker deployments, limits are inconsistent across processes.

Where does API cost spike?
- Shazam recognition is called for each request; burst traffic produces a linear spike in Shazam calls.
- Spotify search is called after every successful recognition; spikes scale with successful Shazam hits.
- If cookies fail, yt-dlp retries with cookies, doubling download attempts.

What is the first bottleneck?
- yt-dlp download in /recognize (blocking I/O + CPU). This blocks the async loop and starves other requests.

Is failure recoverable?
- Partially. The handler catches exceptions and returns 422/500, but corrupted temp files or overwritten cookies can produce incorrect results. No built-in retry for yt-dlp or Spotify search. Requests must be retried by the client.

## Scenario B: Spotify API rate limit hit

What breaks?
- /recognize -> search_spotify_strict returns 500 on Spotify search failure. Recognition fails even if Shazam succeeded.
- /save_track operations that call Spotify (playlist add, liked songs add) fail with 500; the track is not saved to Spotify.

Where does duplicate or inconsistent state occur?
- If frontend already writes history to Supabase after a failed backend save, Supabase history can indicate a saved item even though Spotify write failed.
- In Smart Sort mode, playlist creation might succeed and add may fail, leaving empty or partially populated playlists.

Where does API cost spike?
- Repeated retries at the client level (not implemented server-side) can cause additional Spotify calls. The backend itself does not implement retry, so spike is client-driven.

What is the first bottleneck?
- Spotify Web API quota; calls to search and playlist/library endpoints fail.

Is failure recoverable?
- Yes, but manual. Client would need to retry once rate limits reset. No server-side queue or retry mechanism.

## Scenario C: yt-dlp download fails mid-stream

What breaks?
- download_audio returns None; /recognize returns HTTP 422 with "Could not download audio".

Where does duplicate or inconsistent state occur?
- No backend writes occur. No Spotify or Supabase write. No state inconsistency server-side.

Where does API cost spike?
- yt-dlp may attempt partial download; if it fails, the function retries with cookies (second download attempt). That doubles download cost per request.

What is the first bottleneck?
- External video download (network + yt-dlp). Failure occurs before Shazam and Spotify calls.

Is failure recoverable?
- Yes, via client retry with a different URL or later retry. No server-side retry/backoff is implemented.

## Scenario D: Two concurrent save-to-playlist requests for same track

What breaks?
- No explicit breaking error, but both requests call Spotify add endpoints.

Where does duplicate or inconsistent state occur?
- Duplicate track entries in playlists are possible because playlist_add_items is called twice with no dedupe or idempotency key.
- Liked Songs add is idempotent on Spotify’s side, but the backend does not check for existing state and reports success in both calls.
- If Smart Sort creates a new playlist in one request while the other reads playlists concurrently, both can create the playlist, resulting in two genre playlists with the same name.

Where does API cost spike?
- Duplicate Spotify calls: current_user_playlists, user_playlist_create, playlist_add_items, and track lookups are executed twice.

What is the first bottleneck?
- Spotify API rate limits and latency (playlist read/create/add). This is the first external bottleneck under concurrency.

Is failure recoverable?
- Partially. Users can manually remove duplicates. There is no automated dedupe or reconciliation.
