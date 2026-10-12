# Safety port onto the mobile rebuild

Base: codex/stash-frontend-rebuild at a82e472b215a7084678034012d011ece577b7108.

Preserves the user's capture/library layout, typography, animations and styles. The rewrite changed no backend/API/Supabase source relative to main, but also did not include the earlier safety stack. Do not merge rejected design PRs to recover these fixes.

Ported: truthful Spotify/Stash outcomes, exact chosen save destination, stable UUID history upsert/retry without repeating Spotify, confirmed owner-scoped Stash-only removal, strict history reads, sign-out/account-switch stale-read cleanup, owner guards for returned save/delete results, current Spotify mutation endpoints and public-only worker caching with explicit deferred updates. Necessary UI additions are a history-only retry notice and manual update prompt. Removal confirmation now says Spotify stays unchanged.

Not production certification: actual Supabase schema/UUID/grants/RLS/two-user isolation remain unverified; history UUID upsert still needs live validation. Spotify app/scopes/current account, physical iPhone behavior and production worker/multi-tab checks remain gates. Realtime core from #8 is not wired or copied here. Jobs and pending-history retry are not durable across reload. In-flight provider effects cannot be undone by switching accounts. Do not automatically deploy or merge.

Validation: build/typecheck, 43 unit, 7 Python and 15 browser tests. New design's supplied 12 browser tests pass on a separate host/port. Preview and authenticated mock screenshots at 390/1280 inspected, including partial-save recovery. Sample-data screens are not the user's real music or proof of live connectivity.

Design review, not applied changes: capture is cleaner than main with a single action and calmer surfaces; app-wide font system still differs between capture/library and older settings/help/stats; heavy 750-850 weights, tiny uppercase labels, truncated track titles and a decorative hero ahead of the input remain. Dark-mode preference does not change the forced-dark capture/library. Keep styling decisions with the user.
