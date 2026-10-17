// Test fixture only. No account, Spotify, recognition, or database calls are made.
import { createRoot } from 'react-dom/client';
import App from '../src/App';
import { api } from '../src/lib/api';
import { supabase } from '../src/lib/supabase';
import '../src/index.css';

const match = { id: 'sample', song: 'Save-flow sample', artist: 'Test fixture', album_art_url: '', confidence: .95 };
supabase.auth.getSession = async () => ({ data: { session: { user: { email: 'fixture@example.invalid', user_metadata: { full_name: 'Test fixture' } } } }, error: null }) as any;
supabase.auth.onAuthStateChange = (() => ({ data: { subscription: { unsubscribe() {} } } })) as any;
api.getSpotifyToken = async () => 'test-only';
api.getUserPlaylists = async () => [{ id: '1', name: 'Liked Songs' }];
api.getUserPreferences = async () => ({ autoAddTopMatch: true, defaultPlaylistId: '1', theme: 'dark' });
api.updateUserPreferences = async () => {};
api.getUserHistory = async () => {
  requestAnimationFrame(() => requestAnimationFrame(() => { (window as any).__fixtureReady = true; }));
  return [];
};
api.stashUrl = async () => [match];
api.addTrack = async (_track, source) => {
  await new Promise<void>((resolve, reject) => {
    (window as any).__completeSave = resolve;
    (window as any).__failSave = () => reject(new Error('Fixture save failed'));
  });
  return { song: { ...match, source, created_at: new Date().toISOString() }, playlistName: 'Liked Songs' };
};
createRoot(document.getElementById('root')!).render(<App />);
