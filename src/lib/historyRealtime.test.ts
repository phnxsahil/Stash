import { describe, expect, it, vi } from 'vitest';
import type { Song } from '../types';
import { mergeHistoryRealtimeChange, subscribeToHistoryRealtime } from './historyRealtime';

const song = (id: string, title = id): Song => ({
  id,
  song: title,
  artist: 'Artist',
  source: 'YouTube',
  album_art_url: '',
  created_at: '2026-10-17T00:00:00.000Z',
});

describe('history realtime sync', () => {
  it('merges inserts, updates and deletes without duplicate rows', () => {
    const first = song('one', 'First');
    const second = song('two', 'Second');
    const inserted = mergeHistoryRealtimeChange([first], { eventType: 'INSERT', new: second, old: {} });
    expect(inserted.map(item => item.id)).toEqual(['two', 'one']);
    expect(mergeHistoryRealtimeChange(inserted, { eventType: 'INSERT', new: second, old: {} })).toHaveLength(2);
    expect(mergeHistoryRealtimeChange(inserted, { eventType: 'UPDATE', new: { ...second, song: 'Updated' }, old: second })[0].song).toBe('Updated');
    expect(mergeHistoryRealtimeChange(inserted, { eventType: 'DELETE', new: {}, old: second }).map(item => item.id)).toEqual(['one']);
  });

  it('refetches once when a connected channel reconnects', () => {
    let status!: (value: string) => void;
    let change!: (payload: any) => void;
    const channel = {
      on: vi.fn((_event, _filter, callback) => { change = callback; return channel; }),
      subscribe: vi.fn((callback) => { status = callback; return channel; }),
    };
    const client = { channel: vi.fn(() => channel), removeChannel: vi.fn() };
    const onChange = vi.fn();
    const onReconnect = vi.fn();
    const cleanup = subscribeToHistoryRealtime(client, 'user-1', { onChange, onReconnect });

    expect(client.channel).toHaveBeenCalledWith('history-sync:user-1');
    expect(channel.on).toHaveBeenCalledWith('postgres_changes', expect.objectContaining({ filter: 'user_id=eq.user-1' }), expect.any(Function));
    status('SUBSCRIBED');
    status('CHANNEL_ERROR');
    status('SUBSCRIBED');
    expect(onReconnect).toHaveBeenCalledTimes(1);
    change({ eventType: 'INSERT', new: song('three'), old: {} });
    expect(onChange).toHaveBeenCalledTimes(1);
    cleanup();
    expect(client.removeChannel).toHaveBeenCalledWith(channel);
  });
});
