import { supabase } from './supabase';
import { logger } from './logger';
import { HistorySaveError, type HistorySavePayload, type SaveResult } from './saveOutcome';
import type { Song, SongMatch, Playlist, UserPreferences } from '../types';

// Re-export types so existing imports from './lib/api' still work
export type { Song, SongMatch, Playlist } from '../types';

const normalizeBaseUrl = (value: string | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, '');
};

const configuredApiBase = normalizeBaseUrl(import.meta.env.VITE_API_URL);
const sameOriginBase = typeof window !== 'undefined' ? normalizeBaseUrl(window.location.origin) : null;
const isLocalPreviewHost =
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const HF_BACKEND_HOST = 'https://shanushrma-stash-backend.hf.space';

// Local preview should aggressively try real backend hosts before same-origin SPA routes.
const localRuntimeCandidates = isLocalPreviewHost
  ? [
    HF_BACKEND_HOST,
    'http://localhost:8000',
    'http://127.0.0.1:8000',
  ]
  : [];

const backendCandidates = Array.from(new Set([
  configuredApiBase,
  import.meta.env.DEV ? 'http://localhost:8000' : null,
  ...localRuntimeCandidates,
  sameOriginBase ? `${sameOriginBase}/api` : null,
  sameOriginBase,
].filter((value): value is string => Boolean(value))));

let resolvedBackendBase: string | null = configuredApiBase;

const isHuggingFaceBackend = (url: string | null | undefined): boolean =>
  Boolean(url && url.includes('hf.space'));

const isWakeUpStatus = (status: number): boolean => [502, 503, 504, 522, 524].includes(status);

const isSpaFallbackResponse = (response: Response): boolean => {
  const contentType = response.headers.get('content-type') || '';
  return response.ok && contentType.includes('text/html');
};

async function fetchBackend(path: string, init?: RequestInit): Promise<Response> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (path === '/save_track' || path === '/remove_track') {
    if (!resolvedBackendBase) await fetchBackend('/');
    if (!resolvedBackendBase) throw new Error('No backend API endpoint confirmed');
    return fetch(`${resolvedBackendBase}${normalizedPath}`, init);
  }

  const candidates = resolvedBackendBase
    ? [resolvedBackendBase, ...backendCandidates.filter((base) => base !== resolvedBackendBase)]
    : backendCandidates;

  if (candidates.length === 0) {
    throw new Error('No backend API endpoint configured');
  }

  let lastError: Error | null = null;

  for (let index = 0; index < candidates.length; index += 1) {
    const base = candidates[index];
    const url = `${base}${normalizedPath}`;

    try {
      const response = await fetch(url, init);

      if (isSpaFallbackResponse(response)) {
        logger.warn(`Backend candidate returned HTML fallback: ${url}`);
        continue;
      }

      if (response.status === 404 && index < candidates.length - 1) {
        logger.warn(`Backend candidate returned 404, trying next: ${url}`);
        continue;
      }

      resolvedBackendBase = base;
      return response;
    } catch (error: any) {
      logger.warn(`Backend candidate failed: ${url}`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error('Unable to reach backend API');
}

logger.log('API Config:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
  BASE_URL: resolvedBackendBase,
  CANDIDATES: backendCandidates
});

export const api = {
  async connectSpotify(): Promise<void> {
    const redirectUrl = window.location.origin;

    try {
      logger.log('API: Initiating Spotify OAuth manually...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          scopes: 'user-library-read user-library-modify playlist-read-private playlist-modify-public playlist-modify-private',
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // Manual redirect is more reliable in various browsers
        }
      });

      if (error) {
        logger.error('API: Supabase Auth Error:', error);
        throw error;
      }

      if (data?.url) {
        logger.log('API: Redirecting to:', data.url);
        window.location.assign(data.url);
      } else {
        throw new Error('No redirect URL returned from Supabase');
      }

    } catch (err: any) {
      logger.error('API: connectSpotify() error:', err);
      throw err;
    }
  },

  async logoutUser(): Promise<void> {
    logger.log('API: logoutUser()');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async stashUrl(url: string, onStatusUpdate?: (status: string) => void): Promise<SongMatch[]> {
    logger.log('API: stashUrl()', url);
    onStatusUpdate?.('Extracting Audio...');

    try {
      const response = await fetchBackend('/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      onStatusUpdate?.('Identifying Song...');

      if (!response.ok) {
        if (isWakeUpStatus(response.status) || (isHuggingFaceBackend(response.url) && response.status === 429)) {
          throw new Error('The recognition backend is waking up right now. Give it a few seconds, then try again.');
        }
        if (response.status === 422) {
          throw new Error("Instagram likely blocked this download or the server cookies are expired. Try a public post, refresh cookies, or use a YouTube link.");
        }
        throw new Error(`Backend Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      onStatusUpdate?.('Verifying with Spotify...');

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
      logger.error('API Error:', error);
      if (
        error instanceof Error &&
        (error.message.includes('Failed to fetch') || error.message.includes('Load failed') || error.message.includes('NetworkError')) &&
        (isHuggingFaceBackend(resolvedBackendBase) || backendCandidates.includes(HF_BACKEND_HOST))
      ) {
        throw new Error('The recognition backend may be waking from sleep. Wait a few seconds and try again.');
      }
      throw error;
    }
  },

  async getSpotifyToken(): Promise<string | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      logger.error('Supabase: Session fetch error:', error);
      return null;
    }
    const token = session?.provider_token || null;
    if (!token && session) {
      logger.warn('Supabase: Session exists but provider_token is MISSING (expired or refresh failed)');
    }
    return token;
  },

  async saveToSpotifyLibrary(trackId: string): Promise<boolean> {
    const token = await this.getSpotifyToken();
    if (!token) return false;

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/library?uris=${encodeURIComponent(`spotify:track:${trackId}`)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        logger.log(`Spotify: Successfully added track ${trackId} to Liked Songs`);
      } else {
        const errData = await response.json().catch(() => ({}));
        logger.error(`Spotify: Failed to add track to Library (${response.status}):`, errData);
      }
      return response.ok;
    } catch (err) {
      logger.error("Spotify API Error (Library):", err);
      return false;
    }
  },

  async addToSpotifyPlaylist(playlistId: string, trackId: string): Promise<boolean> {
    const token = await this.getSpotifyToken();
    if (!token || !playlistId || playlistId === '1') return false;

    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
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
        logger.log(`Spotify: Successfully added track ${trackId} to Playlist ${playlistId}`);
      } else {
        const errData = await response.json().catch(() => ({}));
        logger.error(`Spotify: Failed to add track to Playlist (${response.status}):`, errData);
      }
      return response.ok;
    } catch (err) {
      logger.error("Spotify API Error (Playlist):", err);
      return false;
    }
  },

  async saveHistory(payload: HistorySavePayload): Promise<Song> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== payload.user_id) throw new Error('Sign in to the same Stash account to retry history.');
    // A stable client ID makes an uncertain insert safe to retry without duplicates.
    const { data, error } = await supabase.from('history').upsert(payload, { onConflict: 'id' }).select().single();
    if (error || !data) throw new Error('Stash history could not be confirmed.');
    return data as Song;
  },

  async addTrack(song: SongMatch, source: string, playlistId = '1'): Promise<SaveResult> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Sign in before saving.');
    const trackId = /^[a-zA-Z0-9]{22}$/.test(song.id) ? song.id : null;
    let playlistName = 'Stash';
    let destinationId = '';
    let genre = 'Unknown';
    let spotifySaved = false;

    if (trackId) {
      const token = await this.getSpotifyToken();
      if (!token) throw new Error('Reconnect Spotify before saving this track.');
      let response: Response;
      try {
        response = await fetchBackend('/save_track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, track_id: trackId, playlist_id: playlistId }),
        });
      } catch {
        throw new Error('Spotify save could not be confirmed. Check Spotify before trying again; the track may already be there.');
      }
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.success !== true) {
        throw new Error(response.status === 401
          ? 'Reconnect Spotify before saving.'
          : 'Spotify save could not be confirmed. Check the selected destination before trying again.');
      }
      if (!data.playlist_id || !data.playlist_name) throw new Error('Spotify accepted the save but its destination is unknown. Check Spotify before trying again.');
      playlistName = data.playlist_name;
      destinationId = data.playlist_id;
      genre = data.genre || 'Unknown';
      spotifySaved = true;
    }

    const payload = {
      id: crypto.randomUUID(), user_id: user.id,
      song: song.song, artist: song.artist, source: source || 'Web',
      album_art_url: song.album_art_url, preview_url: song.preview_url || null,
      spotify_url: song.spotify_url || (trackId ? `https://open.spotify.com/track/${trackId}` : null), genre,
    };
    const result = { playlistName, destinationId, spotifySaved };
    try {
      return { song: await this.saveHistory(payload), ...result };
    } catch {
      throw new HistorySaveError(payload, result);
    }
  },

  async getUserHistory(): Promise<Song[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn("History: No authenticated user found, returning empty history.");
        return [];
      }

      logger.log("Supabase: Fetching user history...", { user_id: user.id });

      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error("Supabase: Scoped history fetch failed:", error);
        throw error;
      }

      logger.log(`Supabase: Loaded ${data?.length || 0} items for user.`);
      return data || [];
    } catch (err) {
      logger.error("API: getUserHistory critical failure:", err);
      return [];
    }
  },

  async deleteSong(id: string): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Sign in before removing history.');
    const { data, error } = await supabase.from('history').delete()
      .match({ id, user_id: user.id }).select('id');
    if (error || !data?.some(row => row.id === id)) throw new Error('Stash history removal could not be confirmed.');
  },

  async removeFromSpotify(trackId: string, playlistId: string): Promise<void> {
    if (!/^[a-zA-Z0-9]{22}$/.test(trackId) || !playlistId || playlistId === 'smart_sort') {
      throw new Error('An exact track and saved destination are required.');
    }
    const token = await this.getSpotifyToken();
    if (!token) throw new Error('Reconnect Spotify before removing this track.');
    const response = await fetchBackend('/remove_track', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, track_id: trackId, playlist_id: playlistId }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.success !== true) throw new Error('Spotify removal could not be confirmed.');
  },

  async updateUserPreferences(prefs: UserPreferences): Promise<void> {
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

  async getUserPlaylists(): Promise<Playlist[]> {
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
      logger.error("Failed to fetch Spotify playlists:", err);
      return [{ id: '1', name: 'Liked Songs' }];
    }
  },

  async getVibeAnalysis(history: any[]): Promise<string> {
    try {
      if (history.length === 0) return "No music yet! Start stashing.";
      const songs = history.slice(0, 15).map(s => `${s.song} by ${s.artist}`);
      const response = await fetchBackend('/analyze_vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs })
      });
      const data = await response.json();
      return data.vibe || "Eclectic and mysterious.";
    } catch (err) {
      logger.error("Vibe analysis failed:", err);
      return "Eclectic and mysterious.";
    }
  }
};
