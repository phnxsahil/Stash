# Upgrade change log

## Round 1 - 12 October 2026

Base commit: ae7988428ae7c7a4a6469081827e97e45a8b5b55.

- Fixed art/image export-prop mismatch using a typed, immutable mapping, with three unit tests. No export UI/content redesign.
- Added npm test and test:e2e scripts, retaining installed frameworks/dependencies.
- Replaced obsolete landing/privacy copy assertions and fragile theme selector. Named the theme switch and privacy back button for accessibility.
- Made unauthenticated smoke tests block external network access and use an explicit local theme.
- Added baseline and gated upgrade-risk documentation.

Validation: npm ci, npm run type-check and npm run build:prod passed. Vitest: 8/8 across 3 files. Chromium smoke: 3/3. No production services or music-library mutation. Screenshots inspected at 390 and 1280: labels do not change visual layout. Existing mobile landing overflow and inherited-scroll privacy header position were observed and belong to the later UI redesign, not hidden as baseline success. No iPhone/PWA offline/authenticated-flow certification.

Save correctness, backend/security, realtime, offline lifecycle, Android packaging and frontend redesign remain later batches. No merge or deployment in this round.

## Round 2 - 12 October 2026

Stacked on Round 1. No merge or deployment.

- Selected destination now reaches the save backend. HTTP errors, false JSON success, missing provider token, and unknown destinations no longer produce a library-success message.
- Save/remove mutations use a single confirmed backend host without failover replay after a network failure. Spotify playlist writes use current `/items` routes; library writes use `/me/library`; private-playlist OAuth scope is requested.
- Spotify success followed by an unconfirmed history write offers an in-memory, history-only retry. Stable UUID and owner check prevent replaying the playlist add. Keep the page open: durable/offline recovery is not implemented in this round.
- History removal is explicitly Stash-only, owner-scoped and confirmed by returned row ID. Legacy rows have no saved destination, so the current preference is never used to guess where to remove a song in Spotify.
- Backend removal touches exactly one explicit destination, propagates errors and never silently deletes from Liked Songs plus a playlist. No mutation retry on timeouts.

Validation: production build/typecheck passed; 21 unit tests; 7 Python mutation tests; 4 Chromium tests, including partial-save retry and Stash-only removal. No production services or music-library mutation. Recovery banner screenshots inspected at 390 and 1280. Live history schema/RLS (UUID primary key, upsert/select policies) and current Spotify account/app access remain deployment gates. Physical iOS testing remains outstanding.

Current Spotify endpoint references checked for this batch:
- https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide
- https://developer.spotify.com/documentation/web-api/reference/save-library-items
- https://developer.spotify.com/documentation/web-api/reference/add-items-to-playlist
- https://developer.spotify.com/documentation/web-api/reference/remove-items-playlist
- https://developer.spotify.com/documentation/web-api/reference/remove-library-items
- https://developer.spotify.com/documentation/web-api/reference/create-playlist
