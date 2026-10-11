# Reviewed upgrade sequence

Personal daily use first. Keep React/Vite, FastAPI and Supabase. Each round is a separate review batch. Later work can proceed on stacked branches under the requested full overhaul; merging, deployment, live migrations and infrastructure costs remain gated.

1. Baseline types, existing test commands, deterministic unauthenticated smoke tests and this record.
2. Truthful Spotify/Stash save and delete outcomes, chosen destination wiring, destination-specific removal and partial-failure recovery. No success message for an unverified external effect.
3. Recover live schema; review additive migrations and RLS; retain source URL, Spotify track identity and actual destination. Two-user isolation tests before realtime publication.
4. Owner-scoped history sync with stable row IDs, event reconciliation, tombstones, reconnect/foreground snapshots and logout cleanup.
5. Hydrate and sync preferences with field-level/version-aware updates.
6. Verify Spotify app mode/scopes/current endpoints. Secure server-side provider token refresh and authenticated API owner checks. No tokens in profile publications, logs or offline caches.
7A. Durable accepted-job contract. 7B. Bounded worker, per-job temporary files, URL/redirect/resource limits and uncertain external-effect reconciliation. Closing the app after server acceptance must not lose work.
8A. Safe service-worker caching and deferred update lifecycle. 8B. iOS install, paste-link and optional Shortcut workflow with physical-device checks. Do not advertise an unsupported incoming PWA share target.
9. User-scoped offline metadata and queued intents; replay on resume/reconnect, not a promise of iOS background processing.
10. Optional signed Android TWA APK for personal installation, Digital Asset Links and incoming-share tests. No Play Store release required. Capacitor/native iOS remains a separate choice if a true Share Extension is essential.
11. Optional opt-in push, search and small diagnostics after reliable saves and sync.

Infrastructure configuration and potential hosting cost require review. No destructive migration, deployment, native distribution or later-round functionality is part of Round 1.
