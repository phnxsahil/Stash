// API Service Layer - Integrated with Supabase and Railway
import { supabase } from './supabase';

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
  spotify_url?: string;
  confidence?: number;
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
  async connectSpotify(): Promise<void> {
    const redirectUrl = window.location.origin;

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          scopes: 'user-library-read user-library-modify playlist-read-private playlist-modify-public',
          redirectTo: redirectUrl,
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (err: any) {
      console.error('API: connectSpotify() error:', err);
      throw err;
    }
  },

  async logoutUser(): Promise<void> {
    console.log('API: logoutUser()');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async stashUrl(url: string, onStatusUpdate?: (status: string) => void): Promise<SongMatch[]> {
    console.log('API: stashUrl()', url);
    const API_BASE_URL = "https://stash-production-ed8d.up.railway.app";

    // Exact status timings as requested
    if (onStatusUpdate) {
      onStatusUpdate("Downloading Reel...");
      setTimeout(() => onStatusUpdate("Extracting Audio..."), 2000);
      setTimeout(() => onStatusUpdate("Identifying Song..."), 4000);
      setTimeout(() => onStatusUpdate("Verifying with Spotify..."), 7000);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/recognize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error("Backend Error");

      const data = await response.json();

      // Adaptation: backend returns a single result, but UI expects an array of SongMatch
      if (data.success) {
        return [{
          id: data.spotify_uri || Date.now().toString(),
          song: data.track,
          artist: data.artist,
          album_art_url: data.album_art,
          preview_url: '', // Add mapping if available
          spotify_url: data.spotify_url,
          confidence: data.confidence
        }];
      } else {
        throw new Error(data.error || "Failed to recognize song");
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async addTrack(song: SongMatch, source: string): Promise<Song> {
    console.log('API: addTrack()', song);

    // 1. Save to Supabase History
    const { data, error } = await supabase
      .from('history')
      .insert({
        song: song.song,
        artist: song.artist,
        source: source,
        album_art_url: song.album_art_url,
        preview_url: song.preview_url,
      })
      .select()
      .single();

    if (error) throw error;

    return data as Song;
  },

  async getUserHistory(): Promise<Song[]> {
    console.log('API: getUserHistory()');
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async deleteSong(id: string): Promise<void> {
    console.log('API: deleteSong()', id);
    const { error } = await supabase
      .from('history')
      .delete()
      .match({ id });

    if (error) throw error;
  },

  async updateUserPreferences(prefs: {
    autoAddTopMatch?: boolean;
    defaultPlaylistId?: string;
    theme?: 'light' | 'dark';
  }): Promise<void> {
    console.log('API: updateUserPreferences()', prefs);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...prefs,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  },

  async getUserData(): Promise<{ name: string; email: string }> {
    console.log('API: getUserData()');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    return {
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      email: user.email || ''
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