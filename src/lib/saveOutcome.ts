import type { Song } from '../types';

export interface HistorySavePayload {
  id: string;
  user_id: string;
  song: string;
  artist: string;
  source: string;
  album_art_url: string;
  preview_url: string | null;
  spotify_url: string | null;
  genre: string;
}

export interface SaveResult {
  song: Song;
  playlistName: string;
  destinationId: string;
  spotifySaved: boolean;
}

// The payload is held in memory only. Retry history, never replay a playlist add.
export class HistorySaveError extends Error {
  constructor(public readonly payload: HistorySavePayload, public readonly result: Omit<SaveResult, 'song'>) {
    super(result.spotifySaved
      ? `Saved to ${result.playlistName}, but Stash history could not be confirmed. Retry history only.`
      : 'Stash history could not be confirmed. Retry history only.');
    this.name = 'HistorySaveError';
  }
}
