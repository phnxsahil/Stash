import { describe, expect, it, vi } from 'vitest';
import { createHistorySync } from './historySync';
const row = (id: string, user_id = 'owner') => ({ id, user_id });
function deferred<T>() { let resolve!: (value: T) => void; let reject!: (error: unknown) => void; const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
function setup(fetchSnapshot = vi.fn(async () => [row('a')])) {
  const applySnapshot = vi.fn(), onError = vi.fn();
  return { sync: createHistorySync({ ownerId: 'owner', fetchSnapshot, applySnapshot, onError }), fetchSnapshot, applySnapshot, onError };
}
describe('owner-bound history snapshot core', () => {
  it('deduplicates stable IDs without changing server order', async () => {
    const s = setup(vi.fn(async () => [row('b'), row('a'), row('b')]));
    await s.sync.refresh(); expect(s.applySnapshot).toHaveBeenCalledWith([row('b'), row('a')]);
  });
  it('does not apply any part of a mixed-owner snapshot', async () => {
    const s = setup(vi.fn(async () => [row('a'), row('other', 'other')]));
    await s.sync.refresh(); expect(s.applySnapshot).not.toHaveBeenCalled(); expect(s.onError).toHaveBeenCalledOnce();
  });
  it('ignores foreign and ownerless event hints', async () => {
    const s = setup(); await s.sync.receiveHint({ user_id: 'other' }); await s.sync.receiveHint({}); expect(s.fetchSnapshot).not.toHaveBeenCalled();
    await s.sync.receiveHint({ user_id: 'owner' }); expect(s.fetchSnapshot).toHaveBeenCalledOnce();
  });
  it('discards stale snapshots and coalesces burst hints into one newer request', async () => {
    const first = deferred<ReturnType<typeof row>[]>();
    const s = setup(vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue([row('new')]));
    const done = s.sync.refresh(); for (let i = 0; i < 10; i++) void s.sync.receiveHint({ user_id: 'owner' });
    expect(s.fetchSnapshot).toHaveBeenCalledOnce(); first.resolve([row('old')]); await done;
    expect(s.fetchSnapshot).toHaveBeenCalledTimes(2); expect(s.applySnapshot).toHaveBeenCalledOnce(); expect(s.applySnapshot).toHaveBeenCalledWith([row('new')]);
  });
  it('keeps confirmed deletions hidden until a snapshot observes absence', async () => {
    const s = setup(vi.fn().mockResolvedValueOnce([row('a')]).mockResolvedValueOnce([]).mockResolvedValueOnce([row('a')]));
    await s.sync.confirmedDelete('a'); expect(s.applySnapshot).toHaveBeenLastCalledWith([]);
    await s.sync.refresh(); expect(s.applySnapshot).toHaveBeenLastCalledWith([]);
    await s.sync.refresh(); expect(s.applySnapshot).toHaveBeenLastCalledWith([row('a')]);
  });
  it('does not resurrect a delete from an in-flight old snapshot', async () => {
    const first = deferred<ReturnType<typeof row>[]>();
    const s = setup(vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue([]));
    const done = s.sync.refresh(); void s.sync.confirmedDelete('a'); first.resolve([row('a')]); await done;
    expect(s.applySnapshot).toHaveBeenCalledOnce(); expect(s.applySnapshot).toHaveBeenCalledWith([]);
  });
  it('keeps current UI on failure and recovers on a later refresh', async () => {
    const s = setup(vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue([row('a')]));
    await s.sync.refresh(); expect(s.applySnapshot).not.toHaveBeenCalled(); expect(s.onError).toHaveBeenCalledOnce();
    await s.sync.refresh(); expect(s.applySnapshot).toHaveBeenCalledWith([row('a')]);
  });
  it('ignores a late result after logout and cannot be restarted', async () => {
    const first = deferred<ReturnType<typeof row>[]>(); const s = setup(vi.fn().mockReturnValue(first.promise));
    const done = s.sync.refresh(); s.sync.stop(); first.resolve([row('a')]); await done; await s.sync.refresh();
    expect(s.applySnapshot).not.toHaveBeenCalled(); expect(s.onError).not.toHaveBeenCalled(); expect(s.fetchSnapshot).toHaveBeenCalledOnce();
  });
  it('ignores a late failure after logout', async () => {
    const first = deferred<ReturnType<typeof row>[]>(); const s = setup(vi.fn().mockReturnValue(first.promise));
    const done = s.sync.refresh(); s.sync.stop(); first.reject(new Error('late')); await done; expect(s.onError).not.toHaveBeenCalled();
  });
});
