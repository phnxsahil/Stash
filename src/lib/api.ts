// API Service Layer - Integrated with Supabase and Spotify
import { supabase } from './supabase';

interface Song {
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

interface SongMatch {
  id: string;
  song: string;
  artist: string;
  album_art_url: string;
  preview_url?: string;
  spotify_url?: string;
  confidence?: number;
}

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
    const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000" : window.location.origin);

    if (onStatusUpdate) {
      onStatusUpdate("Downloading Reel...");
      setTimeout(() => onStatusUpdate("Extracting Audio..."), 1500);
      setTimeout(() => onStatusUpdate("Identifying Song..."), 3500);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/recognize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error("Backend Error");

      const data = await response.json();

      if (data.success) {
        return [{
          id: data.spotify_uri?.split(':').pop() || Date.now().toString(),
          song: data.track,
          artist: data.artist,
          album_art_url: data.album_art,
          preview_url: data.preview_url,
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

  async getSpotifyToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.provider_token || null;
  },

  async saveToSpotifyLibrary(trackId: string): Promise<boolean> {
    const token = await this.getSpotifyToken();
    if (!token) return false;

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${trackId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        console.log(`✅ Spotify: Successfully added track ${trackId} to Liked Songs`);
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error(`❌ Spotify: Failed to add track to Library (${response.status}):`, errData);
      }
      return response.ok;
    } catch (err) {
      console.error("Spotify API Error (Library):", err);
      return false;
    }
  },

  async addToSpotifyPlaylist(playlistId: string, trackId: string): Promise<boolean> {
    const token = await this.getSpotifyToken();
    if (!token || !playlistId || playlistId === '1') return false;

    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [`spotify:track:${trackId}`]
        })
      });

      if (response.ok) {
        console.log(`✅ Spotify: Successfully added track ${trackId} to Playlist ${playlistId}`);
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error(`❌ Spotify: Failed to add track to Playlist (${response.status}):`, errData);
      }
      return response.ok;
    } catch (err) {
      console.error("Spotify API Error (Playlist):", err);
      return false;
    }
  },

  async addTrack(song: SongMatch, source: string, playlistId?: string): Promise<{ song: Song; playlistName?: string }> {
    console.log('API: addTrack()', song);

    let savedPlaylistName = '';
    let genre = 'Unknown'; // Default value

    // Call Backend to Save (Handles Smart Stash & Spotify)
    const token = await this.getSpotifyToken();
    if (token && song.id && song.id.length > 15 && !song.id.includes('.')) {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000" : window.location.origin);

        const res = await fetch(`${API_BASE_URL}/save_track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token,
            track_id: song.id,
            playlist_id: playlistId || '1'
          })
        });
        const data = await res.json();
        if (data.success && data.playlist_name) {
          savedPlaylistName = data.playlist_name;
        }
        genre = data.genre || 'Unknown'; // Extract genre from backend response
        console.log("✅ Backend Save Success:", data);
      } catch (err) {
        console.error("❌ Backend Save Error:", err);
      }
    }

    // Sanitize payload for Supabase (Undefined values can cause 400s)
    let savedSong: Song | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        // user_id: user?.id, // Commenting out potential problematic column
        song: song.song,
        artist: song.artist,
        source: source || 'Web',
        album_art_url: song.album_art_url,
        preview_url: song.preview_url || null,
        // spotify_url: song.spotify_url || `https://open.spotify.com/track/${song.id}`,
        genre: genre, // Add genre to Supabase payload
      };

      console.log("API: Inserting into Supabase:", payload);

      const { data, error } = await supabase
        .from('history')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.warn("⚠️ Supabase Insert Warning (Non-fatal):", error.message);
      } else {
        savedSong = data as Song;
      }
    } catch (dbError) {
      console.warn("⚠️ Supabase Insert Failed (Ignored):", dbError);
    }

    // Construct a temporary song object if DB failed, so the UI can still show success
    const fallbackSong: Song = {
      id: song.id,
      song: song.song,
      artist: song.artist,
      source: source || 'Web',
      album_art_url: song.album_art_url,
      spotify_url: song.spotify_url || '',
      genre: savedSong?.genre || 'Unknown',
      created_at: new Date().toISOString()
    };

    return { song: savedSong || fallbackSong, playlistName: savedPlaylistName };
  },

  async getUserHistory(): Promise<Song[]> {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getVibeAnalysis(history: Song[]): Promise<string> {
    try {
      if (history.length === 0) return "No music yet! Start stashing.";

      const songList = history.slice(0, 20).map(s => `${s.song} - ${s.artist}`);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/analyze_vibe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs: songList })
      });
      const data = await res.json();
      return data.vibe || "Feeling mysterious.";
    } catch (e) {
      console.error("Vibe analysis failed:", e);
      return "Unable to sense the vibe right now.";
    }
  },

  async deleteSong(id: string): Promise<void> {
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
    smartStashEnabled?: boolean;
  }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updates: any = {
      id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (prefs.autoAddTopMatch !== undefined) updates.auto_add_top_match = prefs.autoAddTopMatch;
    if (prefs.defaultPlaylistId !== undefined) updates.default_playlist_id = prefs.defaultPlaylistId;
    if (prefs.theme !== undefined) updates.theme = prefs.theme;
    if (prefs.smartStashEnabled !== undefined) updates.smart_stash_enabled = prefs.smartStashEnabled;

    const { error } = await supabase
      .from('profiles')
      .upsert(updates);

    if (error) throw error;
  },

  async getUserData(): Promise<{ name: string; email: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    return {
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email || ''
    };
  },

  async getUserPlaylists(): Promise<Array<{ id: string; name: string }>> {
    const token = await this.getSpotifyToken();
    if (!token) return [{ id: '1', name: 'Liked Songs' }];

    try {
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Spotify API Error");
      const data = await response.json();

      const spotifyPlaylists = data.items.map((p: any) => ({
        id: p.id,
        name: p.name
      }));

      return [{ id: '1', name: 'Liked Songs' }, ...spotifyPlaylists];
    } catch (err) {
      console.error("Failed to fetch Spotify playlists:", err);
      return [{ id: '1', name: 'Liked Songs' }];
    }
  },
};