export interface Song {
  id: string;
  song: string;
  artist: string;
  source: string;
  album_art_url: string;
  preview_url?: string;
}

export interface AppState {
  isLoggedIn: boolean;
  history: Song[];
  currentMatches: Song[];
  userPreferences: {
    autoAddTopMatch: boolean;
  };
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}
