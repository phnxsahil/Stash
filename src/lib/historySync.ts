/** Snapshot-first sync core. Transport and database rollout remain separate gates. */
export interface OwnedHistoryRow { id: string; user_id: string; }
export interface HistorySyncOptions<T extends OwnedHistoryRow> {
  ownerId: string;
  fetchSnapshot: () => Promise<T[]>;
  applySnapshot: (rows: T[]) => void;
  onError: (error: unknown) => void;
}

export function createHistorySync<T extends OwnedHistoryRow>(options: HistorySyncOptions<T>) {
  let active = true;
  let revision = 0;
  let dirty = false;
  let running: Promise<void> | null = null;
  // Keep confirmed local deletes hidden from snapshots started before the delete.
  // A successful newer snapshot retires the tombstone only once the row is absent.
  const tombstones = new Set<string>();

  const drain = async () => {
    while (active && dirty) {
      dirty = false;
      const startedAt = revision;
      try {
        const rows = await options.fetchSnapshot();
        if (!active || startedAt !== revision) continue;
        if (rows.some(row => row.user_id !== options.ownerId)) {
          throw new Error('History snapshot included another owner. Nothing was applied.');
        }
        const seen = new Set<string>();
        const next = rows.filter(row => {
          if (tombstones.has(row.id) || seen.has(row.id)) return false;
          seen.add(row.id);
          return true;
        });
        for (const id of tombstones) {
          if (!rows.some(row => row.id === id)) tombstones.delete(id);
        }
        options.applySnapshot(next);
      } catch (error) {
        if (active && startedAt === revision) options.onError(error);
      }
    }
  };

  const refresh = (): Promise<void> => {
    if (!active) return Promise.resolve();
    revision += 1;
    dirty = true;
    if (!running) {
      running = drain().finally(() => { running = null; });
    }
    return running;
  };

  return {
    /** Use on connect/reconnect, foreground, online and after confirmed mutations. */
    refresh,
    /** Only INSERT/UPDATE payloads with a verified matching owner are hints. */
    receiveHint(row: { user_id?: unknown }) {
      if (row.user_id !== options.ownerId) return Promise.resolve();
      return refresh();
    },
    confirmedDelete(id: string) {
      if (!active) return Promise.resolve();
      tombstones.add(id);
      return refresh();
    },
    /** Dispose on logout/account switch/unmount; late results cannot cross owners. */
    stop() { active = false; revision += 1; dirty = false; tombstones.clear(); },
  };
}
