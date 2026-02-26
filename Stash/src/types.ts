export interface Song {
    id: string;
    song: string;
    artist: string;
    source: string;
    album_art_url: string;
    preview_url?: string;
    spotify_url?: string;
    genre?: string;
    created_at?: string;
}

export interface SongMatch {
    id: string;
    song: string;
    artist: string;
    album_art_url: string;
    preview_url?: string;
    spotify_url?: string;
    confidence?: number;
}

export interface AppState {
    isLoggedIn: boolean;
    history: Song[];
    currentMatches: SongMatch[];
    userPreferences: {
        autoAddTopMatch: boolean;
        defaultPlaylistId?: string;
        theme?: 'light' | 'dark';
        smartStashEnabled?: boolean;
    };
}

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

export type View = 'app' | 'stats' | 'settings' | 'landing';
