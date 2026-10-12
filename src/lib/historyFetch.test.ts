import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn(), select: vi.fn(), eq: vi.fn(), order: vi.fn() }));
vi.mock('./supabase', () => ({ supabase: { auth: { getUser: mocks.getUser }, from: mocks.from } }));
describe('strict owner-scoped history fetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'owner' } }, error: null });
    const chain = { select: mocks.select, eq: mocks.eq, order: mocks.order };
    mocks.from.mockReturnValue(chain); mocks.select.mockReturnValue(chain); mocks.eq.mockReturnValue(chain);
    mocks.order.mockResolvedValue({ data: [], error: null });
  });
  it('accepts a verified empty history and scopes the query', async () => {
    await expect(api.getUserHistory('owner')).resolves.toEqual([]);
    expect(mocks.eq).toHaveBeenCalledWith('user_id', 'owner');
  });
  it('returns ordered rows only for the verified owner', async () => {
    const rows = [{ id: 'new', user_id: 'owner' }, { id: 'old', user_id: 'owner' }];
    mocks.order.mockResolvedValue({ data: rows, error: null });
    await expect(api.getUserHistory('owner')).resolves.toEqual(rows);
    expect(mocks.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });
  it.each([{data: {user: null}, error: null}, {data: {user: {id: 'owner'}}, error: {message: 'expired'}}])('does not convert failed auth into empty history', async result => {
    mocks.getUser.mockResolvedValue(result); await expect(api.getUserHistory()).rejects.toThrow(); expect(mocks.from).not.toHaveBeenCalled();
  });
  it('rejects account switch before querying', async () => {
    await expect(api.getUserHistory('other')).rejects.toThrow('account changed'); expect(mocks.from).not.toHaveBeenCalled();
  });
  it.each([{ data: null, error: {message: 'offline'} }, { data: null, error: null }, { data: [], error: {message: 'denied'} }])('does not convert query failure into empty history', async result => {
    mocks.order.mockResolvedValue(result); await expect(api.getUserHistory()).rejects.toThrow('could not be loaded');
  });
  it('rejects the whole snapshot if another owner is present', async () => {
    mocks.order.mockResolvedValue({ data: [{id: 'a', user_id: 'owner'}, {id: 'b', user_id: 'other'}], error: null });
    await expect(api.getUserHistory()).rejects.toThrow('unexpected owner');
  });
});
