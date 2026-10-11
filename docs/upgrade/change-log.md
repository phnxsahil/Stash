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

## Frontend A - 12 October 2026

Stacked on Round 2; independent visual work while live schema verification is pending.

- Rebuilt landing around record-sleeve artwork and an editorial discovery-to-collection flow. Retained existing local art/logo and warm dark/cream plus green identity; no new remote assets or fake live-analysis badge.
- Put capture first in the personal app. Replaced oversized achievement/stats blocks with a small stats row below the main action. Removed the floating input button that covered the auto-add control at 320px.
- Named theme/menu/settings/statistics controls, added accessible mobile sheet title/description and close-on-navigation behavior. Reset scroll when changing views.
- Added reduced-motion handling, narrow layout assertions and privacy scroll regression. No horizontal document overflow at 320/390/768/1280.

Validation: production build/typecheck, 21 unit tests, 7 Python tests and 5 browser tests passed. Landing and capture visually inspected at 320/390/768/1280; cream/dark landing, mobile menu, and privacy top position inspected. Fixed narrow header and tablet step spacing after visual checks. No physical iPhone or production auth test. Settings/stats/help redesign and PWA update/offline lifecycle remain separate batches. No merge or deployment.

## PWA A - 12 October 2026

Stacked on Frontend A. Public shell safety before offline data/queues.

- Cache only same-origin public static assets. Auth/API, cross-origin, query-bearing and Authorization requests bypass the cache; private/no-store/opaque/redirected responses are not saved. Navigation requests never cache callback codes or shared URLs; offline navigation falls back to the public offline page.
- Delete only old Stash caches, not unrelated origin storage. Updates wait for explicit user reload instead of immediately activating/reloading during recognition or a pending history save.
- Update banner is hidden while work is busy and requires explicit action. Controller changes from other tabs do not automatically reload this tab. Unsaved-text loss is disclosed.
- Replace install copy promising universal native sharing with browser-dependent support and paste fallback. Offline page states that finding/saving needs a connection and offers retry.

Validation: build/typecheck; 33 unit tests including the real worker event harness; 7 Python tests; 6 browser tests including an explicit-update harness and offline layout at 320/390/1280. Update banner/offline pixels inspected at 390/1280 and offline 320. No real production-worker upgrade, iPhone installation or multi-tab lifecycle certification yet. No offline song recognition, durable retry queue or iOS incoming share-target claim. No merge/deployment.
