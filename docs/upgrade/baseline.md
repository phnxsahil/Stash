# Stash Round 1 baseline

Base: ae7988428ae7c7a4a6469081827e97e45a8b5b55, 12 October 2026.
Canonical repository: https://github.com/phnxsahil/Stash . Run the root Vite app, not the older nested Stash/, Stash_New_Design_V1.4/ or stash premium/ variants.

## Checks

- `npm ci`
- `npm run type-check`
- `npm run build:prod`
- `npm run test`
- `npm run test:e2e`

The existing Vitest and Playwright frameworks are retained. Smoke tests are unauthenticated and block external network access, except mocked auth responses. They do not save music or call real Spotify, Supabase or recognition services. Run browser installation locally if needed with `npx playwright install chromium`; do not treat a missing browser as a passing check.

## Current data flow and known risks

Spotify OAuth through Supabase establishes a Supabase login. That is different from a currently valid Spotify API authorization: reading session.provider_token does not implement provider-token refresh. Supabase session refresh alone does not refresh Spotify tokens.

The browser submits a URL to FastAPI /recognize. yt-dlp downloads audio, ffmpeg extracts a sample, ShazamIO recognizes it and Spotify search returns metadata. The browser then calls /save_track with a Spotify token and separately inserts a history row through Supabase. There is no durable accepted job or transaction across Spotify and history.

The save path can swallow a Spotify backend failure, still insert history and show success. handleSongSelection does not pass the selected default playlist to addTrack. Removal can swallow Spotify failure and still claim success; it uses the current default playlist rather than the original saved destination. Backend removal also attempts Liked Songs deletion. These issues are documented, NOT fixed in Round 1.

Profiles are written but not hydrated. Theme is locally persisted; other preferences fall back to defaults. No checked-in SQL migration or RLS policy proves the live database isolation. Client user_id filtering alone is not authorization. Actual Supabase schema, publication, RLS, deployment environment, Spotify app mode, authorized users and provider refresh availability remain unverified.

Artist statistics use art while the Instagram export boundary expects image. A typed adapter now maps those fields without changing the stats UI or inventing new export content. The export currently does not display topArtists; wiring the contract does not claim otherwise.

The manifest, Apple touch icon, standalone metadata and service worker already exist. The service worker is deliberately disabled on localhost, so these smoke tests do not establish offline/PWA correctness. Test real iOS installation and share flows on HTTPS before promising them. An iOS PWA is not an incoming Web Share Target.
