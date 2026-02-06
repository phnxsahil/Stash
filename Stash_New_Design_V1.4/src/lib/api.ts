// API Service Layer - Placeholder functions for backend integration
// Replace these with real API calls when backend is ready

interface Song {
  id: string;
  song: string;
  artist: string;
  source: string;
  album_art_url: string;
  preview_url?: string;
}

interface SongMatch {
  id: string;
  song: string;
  artist: string;
  album_art_url: string;
  preview_url?: string;
}

// Mock data for development
const mockSongs: Song[] = [
  {
    id: '1',
    song: 'Blinding Lights',
    artist: 'The Weeknd',
    source: 'YouTube',
    album_art_url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
  },
  {
    id: '2',
    song: 'levitating',
    artist: 'Dua Lipa',
    source: 'TikTok',
    album_art_url: 'https://i.scdn.co/image/ab67616d0000b273be841ba4bc24340152e3a79a',
  },
  {
    id: '3',
    song: 'Heat Waves',
    artist: 'Glass Animals',
    source: 'Instagram',
    album_art_url: 'https://i.scdn.co/image/ab67616d0000b273e5e5fa8e5b49b1e7cb3ab36b',
  },
];

const mockMatches: SongMatch[] = [
  {
    id: 'm1',
    song: 'Example Song',
    artist: 'Example Artist',
    album_art_url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    preview_url: 'https://p.scdn.co/mp3-preview/a0e789e2d65d4d11e14e90f4e90e4e8e5f5f5f5f',
  },
  {
    id: 'm2',
    song: 'Example Song (Remix)',
    artist: 'Example Artist',
    album_art_url: 'https://i.scdn.co/image/ab67616d0000b273be841ba4bc24340152e3a79a',
    preview_url: 'https://p.scdn.co/mp3-preview/b1f890f3e76e5e22f25f01f5f01f5f01f6f6f6f6',
  },
  {
    id: 'm3',
    song: 'Example Song (Live)',
    artist: 'Example Artist',
    album_art_url: 'https://i.scdn.co/image/ab67616d0000b273e5e5fa8e5b49b1e7cb3ab36b',
  },
];

export const api = {
  async connectSpotify(): Promise<{ name: string }> {
    console.log('API: connectSpotify()');
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { name: 'Music Lover' };
  },

  async logoutUser(): Promise<void> {
    console.log('API: logoutUser()');
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  async stashUrl(url: string): Promise<SongMatch[]> {
    console.log('API: stashUrl()', url);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Return mock matches
    return mockMatches.map((match, index) => ({
      ...match,
      id: `${Date.now()}-${index}`,
    }));
  },

  async addTrack(song: SongMatch, source: string): Promise<Song> {
    console.log('API: addTrack()', song);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return {
      id: Date.now().toString(),
      song: song.song,
      artist: song.artist,
      source,
      album_art_url: song.album_art_url,
      preview_url: song.preview_url,
    };
  },

  async getUserHistory(): Promise<Song[]> {
    console.log('API: getUserHistory()');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return [...mockSongs];
  },

  async deleteSong(id: string): Promise<void> {
    console.log('API: deleteSong()', id);
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  async updateUserPreferences(prefs: { 
    autoAddTopMatch?: boolean;
    defaultPlaylistId?: string;
    theme?: 'light' | 'dark';
  }): Promise<void> {
    console.log('API: updateUserPreferences()', prefs);
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  async getUserData(): Promise<{ name: string; email: string }> {
    console.log('API: getUserData()');
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { 
      name: 'Music Lover', 
      email: 'm...r@stash.app' 
    };
  },

  async getUserPlaylists(): Promise<Array<{ id: string; name: string }>> {
    console.log('API: getUserPlaylists()');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return [
      { id: '1', name: 'Liked Songs' },
      { id: '2', name: 'My Stash' },
      { id: '3', name: 'Discover Weekly' },
      { id: '4', name: 'Chill Vibes' },
      { id: '5', name: 'Workout Mix' },
    ];
  },
};