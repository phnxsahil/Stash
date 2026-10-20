import type { Song } from '../types';

export type HistoryRealtimePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Partial<Song>;
  old: Partial<Song>;
};

export function mergeHistoryRealtimeChange(history: Song[], payload: HistoryRealtimePayload): Song[] {
  const incoming = payload.eventType === 'DELETE' ? payload.old : payload.new;
  const existingIndex = history.findIndex(song => song.id === incoming.id);

  if (payload.eventType === 'DELETE') {
    return existingIndex < 0 ? history : history.filter(song => song.id !== incoming.id);
  }

  const nextSong = incoming as Song;
  if (existingIndex < 0) return [nextSong, ...history];

  return history.map((song, index) => index === existingIndex ? { ...song, ...nextSong } : song);
}

type HistoryRealtimeChannel = {
  on: (
    event: 'postgres_changes',
    filter: { event: '*'; schema: 'public'; table: 'history'; filter: string },
    callback: (payload: HistoryRealtimePayload) => void,
  ) => HistoryRealtimeChannel;
  subscribe: (callback: (status: string) => void) => HistoryRealtimeChannel;
};

type HistoryRealtimeClient = {
  channel: (name: string) => HistoryRealtimeChannel;
  removeChannel: (channel: HistoryRealtimeChannel) => Promise<unknown> | unknown;
};

export interface HistoryRealtimeHandlers {
  onChange: (payload: HistoryRealtimePayload) => void;
  onReconnect: () => void;
}

export function subscribeToHistoryRealtime(
  client: HistoryRealtimeClient,
  userId: string,
  handlers: HistoryRealtimeHandlers,
): () => void {
  let hasConnected = false;
  const channel = client
    .channel(`history-sync:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'history',
      filter: `user_id=eq.${userId}`,
    }, handlers.onChange)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        if (hasConnected) handlers.onReconnect();
        hasConnected = true;
      }
    });

  return () => { void client.removeChannel(channel); };
}
