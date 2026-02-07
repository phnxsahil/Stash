import { Song } from '../types';

// Simulated API service with placeholder functions
// Each function simulates network delay and returns mock data

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  // Simulate Spotify OAuth connection
  async connectSpotify(): Promise<void> {
    console.log('API: connectSpotify()');
    await delay(500);
    return Promise.resolve();
  },

  // Simulate logout
  async logoutUser(): Promise<void> {
    console.log('API: logoutUser()');
    await delay(300);
    return Promise.resolve();
  },

  // Simulate song URL recognition and matching
  async stashUrl(url: string): Promise<Song[]> {
    console.log('API: stashUrl()', url);
    await delay(1500);
    
    // Return mock song matches with real Spotify data
    const mockMatches: Song[] = [
      {
        id: 'track-1',
        song: 'Blinding Lights',
        artist: 'The Weeknd',
        source: 'Spotify Match',
        album_art_url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
        preview_url: 'https://p.scdn.co/mp3-preview/3ebe6b1d1a1f835dc7f5f2f78a5d7edb6b5e8e5f',
      },
      {
        id: 'track-2',
        song: 'Levitating',
        artist: 'Dua Lipa',
        source: 'Spotify Match',
        album_art_url: 'https://i.scdn.co/image/ab67616d0000b273be841ba4bc24340152e3a79a',
        preview_url: 'https://p.scdn.co/mp3-preview/9d2a5ddc6a4e8b9e2b7e4b0f7c8c7c8c7c8c7c8c',
      },
      {
        id: 'track-3',
        song: 'Save Your Tears',
        artist: 'The Weeknd',
        source: 'Spotify Match',
        album_art_url: 'https://i.scdn.co/image/ab67616d0000b2734ab2520c2c77a1d66b9ee21d',
        preview_url: 'https://p.scdn.co/mp3-preview/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
      },
    ];

    return Promise.resolve(mockMatches);
  },

  // Simulate adding a track to user's Spotify library
  async addTrack(trackId: string): Promise<void> {
    console.log('API: addTrack()', trackId);
    await delay(800);
    return Promise.resolve();
  },

  // Simulate fetching user's stash history
  async getUserHistory(): Promise<Song[]> {
    console.log('API: getUserHistory()');
    await delay(1000);
    
    // Return mock history with real Spotify data
    const mockHistory: Song[] = [
      {
        id: 'history-1',
        song: 'As It Was',
        artist: 'Harry Styles',
        source: 'YouTube',
        album_art_url: 'https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14',
        preview_url: 'https://p.scdn.co/mp3-preview/as-it-was-preview',
      },
      {
        id: 'history-2',
        song: 'Anti-Hero',
        artist: 'Taylor Swift',
        source: 'TikTok',
        album_art_url: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5',
        preview_url: 'https://p.scdn.co/mp3-preview/anti-hero-preview',
      },
      {
        id: 'history-3',
        song: 'Flowers',
        artist: 'Miley Cyrus',
        source: 'Instagram',
        album_art_url: 'https://i.scdn.co/image/ab67616d0000b273f58c09d2c1b1724f6ab761e8',
        preview_url: 'https://p.scdn.co/mp3-preview/flowers-preview',
      },
    ];

    return Promise.resolve(mockHistory);
  },

  // Simulate updating user preferences
  async updateUserPreferences(prefs: { autoAddTopMatch: boolean }): Promise<void> {
    console.log('API: updateUserPreferences()', prefs);
    await delay(400);
    return Promise.resolve();
  },
};
