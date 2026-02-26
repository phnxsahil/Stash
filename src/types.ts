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

export interface Playlist {
    id: string;
    name: string;
}

export interface UserPreferences {
    autoAddTopMatch?: boolean;
    defaultPlaylistId?: string;
    theme?: 'light' | 'dark';
    smartStashEnabled?: boolean;
}

export type ViewType = 'landing' | 'app' | 'settings' | 'privacy' | 'about' | 'help' | 'stats';
export type Theme = 'light' | 'dark';

export interface AppState {
    isLoggedIn: boolean;
    userName: string;
    userEmail: string;
    history: Song[];
    currentMatches: SongMatch[];
    currentUrl: string;
    showModal: boolean;
    currentView: ViewType;
    isLoadingHistory: boolean;
    autoAddTopMatch: boolean;
    defaultPlaylistId: string;
    playlists: Playlist[];
    theme: Theme;
    isProcessing: boolean;
    processingStage: 1 | 2 | 3 | 'success' | 'error';
    processingError?: string;
    hasSpotifyToken: boolean;
}

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}
