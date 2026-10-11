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
