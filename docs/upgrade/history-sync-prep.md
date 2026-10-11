# History sync preparation, not live sync

This review batch adds a transport-independent, owner-bound snapshot coordinator and deterministic tests. It is deliberately not imported by App and does not open a live channel, change the database or claim cross-device sync is working.

## Why snapshot-first

The current Supabase troubleshooting docs state that with RLS and full replica identity, old data still contains only the primary key. Owner inference from a deleted row therefore cannot rely on old.user_id. DELETE filter/delivery behavior needs explicit verification against the actual deployed setup. Do not subscribe to table-wide DELETE payloads and infer ownership. A private owner-authorized broadcast with deletion tombstones or a soft-delete UPDATE is a later schema/transport decision after the actual table and RLS are inspected.

INSERT/UPDATE hints must carry the matching owner. They trigger an owner-scoped snapshot instead of applying unordered event bodies directly. Connection success is not proof that RLS permits data delivery. Reconnect and foreground snapshots remain necessary, including when an event is missed.

## Core guarantees tested

- Never apply a mixed-owner snapshot or foreign/ownerless hint.
- Keep server order and deduplicate stable row IDs.
- Discard snapshots started before a newer hint/mutation.
- Coalesce a burst while a request is in flight into one newer snapshot.
- Keep confirmed local deletions hidden until a successful snapshot observes absence.
- Preserve the current UI on fetch failure; recover on later refresh.
- Stop on logout/account switch/unmount; late success/failure cannot leak into another session.

## Wiring and release gates

1. Inspect the actual history schema, UUID IDs, owner columns, grants and operation-specific RLS. Run two-user allow/deny tests before opening subscriptions or publication.
2. Use a strict snapshot fetcher. Current `api.getUserHistory()` catches errors and returns an empty list; that must not be used unchanged here, or a network/RLS failure would erase visible history.
3. Bind one coordinator to one authenticated user ID. Remove its channel and lifecycle listeners and call stop before account changes. Existing App auth code also needs explicit sign-out/account-switch handling and stale auth-result protection.
4. Subscribe before the connected snapshot. Use verified-owner INSERT/UPDATE hints only after publication/RLS checks. Call refresh on SUBSCRIBED, online and foreground; cleanup all listeners.
5. Call refresh after confirmed local saves and confirmedDelete after returned owner-scoped deletion. Test save/delete against in-flight snapshots. Do not lose pending-history retry state.
6. Pick and verify owner-authorized deletion delivery. No table-wide DELETE channel is enabled by this batch. Foreground reconciliation alone is not instant background deletion sync.
7. Test two signed-in browser sessions, reconnect races, expired session, logout/account switch, mobile resume and real iPhone suspension before claiming readiness.

## Sources checked

- https://supabase.com/docs/guides/realtime/postgres-changes
- https://supabase.com/docs/guides/troubleshooting/realtime-postgres-changes-troubleshooting
- https://supabase.com/docs/reference/javascript/subscribe

No live migration, publication, infrastructure change or deployment is included.
