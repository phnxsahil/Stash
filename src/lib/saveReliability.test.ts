import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { HistorySaveError } from './saveOutcome';

const mock = vi.hoisted(() => ({
  user: vi.fn(), session: vi.fn(), from: vi.fn(), upsert: vi.fn(), single: vi.fn(), match: vi.fn(), select: vi.fn(), delete: vi.fn(),
}));
vi.mock('./supabase', () => ({ supabase: { auth: { getUser: mock.user, getSession: mock.session }, from: mock.from } }));
const track = { id: '4iV5W9uYEdYUVa79Axb7Rh', song: 'Test song', artist: 'Test artist', album_art_url: '' };
const fetchMock = vi.fn();
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('save and removal reliability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    mock.user.mockResolvedValue({ data: { user: { id: 'owner' } }, error: null });
    mock.session.mockResolvedValue({ data: { session: { provider_token: 'stub-token' } } });
    const chain = { upsert: mock.upsert, select: mock.select, single: mock.single, delete: mock.delete, match: mock.match };
    mock.from.mockReturnValue(chain);
    mock.upsert.mockReturnValue(chain); mock.delete.mockReturnValue(chain); mock.match.mockReturnValue(chain);
    mock.select.mockReturnValue(chain);
    mock.single.mockResolvedValue({ data: { ...track, id: 'row' }, error: null });
    fetchMock.mockImplementation(async (url: string) => url.endsWith('/save_track')
      ? json({ success: true, playlist_id: 'chosen', playlist_name: 'Chosen playlist' }) : json({ status: 'online' }));
  });

  it('passes the chosen destination and confirms both effects', async () => {
    const result = await api.addTrack(track, 'Web', 'chosen');
    const call = fetchMock.mock.calls.find(([url]) => url.endsWith('/save_track'))!;
    expect(JSON.parse(call[1].body).playlist_id).toBe('chosen');
    expect(result.spotifySaved).toBe(true);
    expect(mock.upsert.mock.calls[0][0].id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it.each([401, 403, 429, 500])('never writes history or reports success after HTTP %s', async status => {
    fetchMock.mockResolvedValue(json({ success: false }, status));
    await expect(api.addTrack(track, 'Web')).rejects.toThrow();
    expect(mock.upsert).not.toHaveBeenCalled();
  });

  it('rejects false success in HTTP 200', async () => {
    fetchMock.mockResolvedValue(json({ success: false }));
    await expect(api.addTrack(track, 'Web')).rejects.toThrow();
    expect(mock.upsert).not.toHaveBeenCalled();
  });

  it('does not send a save without a provider token', async () => {
    mock.session.mockResolvedValue({ data: { session: {} } });
    await expect(api.addTrack(track, 'Web')).rejects.toThrow('Reconnect Spotify');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not replay a timed-out mutation on another host', async () => {
    fetchMock.mockRejectedValue(new TypeError('network'));
    await expect(api.addTrack(track, 'Web')).rejects.toThrow('could not be confirmed');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries an uncertain history write with the same ID and no Spotify replay', async () => {
    mock.single.mockResolvedValueOnce({ data: null, error: { message: 'offline' } });
    let pending: HistorySaveError | undefined;
    try { await api.addTrack(track, 'Web', 'chosen'); } catch (error) { pending = error as HistorySaveError; }
    expect(pending).toBeInstanceOf(HistorySaveError);
    const writes = fetchMock.mock.calls.length;
    await api.saveHistory(pending!.payload);
    expect(fetchMock).toHaveBeenCalledTimes(writes);
    expect(mock.upsert.mock.calls[1][0].id).toBe(mock.upsert.mock.calls[0][0].id);
  });

  it('does not fabricate a Spotify URL for a non-Spotify match', async () => {
    await api.addTrack({ ...track, id: 'unmatched' }, 'Web');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mock.upsert.mock.calls[0][0].spotify_url).toBeNull();
  });

  it('scopes history deletion and requires a confirmed returned row', async () => {
    mock.select.mockResolvedValueOnce({ data: [], error: null });
    await expect(api.deleteSong('row')).rejects.toThrow('could not be confirmed');
    expect(mock.match).toHaveBeenCalledWith({ id: 'row', user_id: 'owner' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an unknown smart-sort removal destination', async () => {
    await expect(api.removeFromSpotify(track.id, 'smart_sort')).rejects.toThrow('exact');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not swallow failed Spotify removal', async () => {
    fetchMock.mockResolvedValue(json({ success: false }));
    await expect(api.removeFromSpotify(track.id, 'chosen')).rejects.toThrow('could not be confirmed');
  });
});
