import { ConfirmationModal } from '../src/components/ConfirmationModal';
import { ProcessingOverlay } from '../src/components/ProcessingOverlay';
import { HelpView } from '../src/components/HelpView';
import { PrivacyView } from '../src/components/PrivacyView';
import { AboutView } from '../src/components/AboutView';
import { LandingView } from '../src/components/LandingView';
// Isolated visual QA only. Sample records never enter the app, APIs or storage.
import '../src/index.css';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SettingsView } from '../src/components/SettingsView';
import { StatsPageView } from '../src/components/StatsPageView';
import { api } from '../src/lib/api';
import { AppView } from '../src/components/AppView';
import type { Song } from '../src/types';

const params = new URLSearchParams(location.search);
const songs: Song[] = [
  { id: 'fixture-1', song: 'Strangers', artist: 'Kenya Grace', source: 'Instagram', album_art_url: '', spotify_url: 'https://open.spotify.com/track/fixture', created_at: new Date(Date.now() - 120000).toISOString(), genre: 'Electronic' },
  { id: 'fixture-2', song: 'Birds of a Feather', artist: 'Billie Eilish', source: 'YouTube', album_art_url: '', created_at: new Date(Date.now() - 10800000).toISOString(), genre: 'Pop' },
  { id: 'fixture-3', song: 'A long song title that needs to fit safely inside a narrow screen', artist: 'A very long artist name and collaborators', source: 'TikTok', album_art_url: '', created_at: new Date(Date.now() - 86400000).toISOString() },
];
function Preview() {
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'light' ? 'light' : 'dark');
  const [history, setHistory] = useState(['empty', 'loading', 'error'].includes(params.get('state') || '') ? [] : songs);
  const [autoAdd, setAutoAdd] = useState(true);
  document.documentElement.className = theme;
  if (params.get('screen') === 'match') return <div className="stitch-theme" style={{ minHeight: '100dvh' }}><ConfirmationModal isOpen matches={songs.map(song => ({ ...song, confidence: 0.95 }))} onClose={() => { (window as any).__closed = true; }} onSelectSong={song => { (window as any).__selected = song.id; }} /></div>;
  if (params.get('screen') === 'processing') return <div className="stitch-theme" style={{ minHeight: '100dvh' }}><ProcessingOverlay isVisible stage={params.get('stage') === 'error' ? 'error' : params.get('stage') === 'success' ? 'success' : 2} onClose={() => { (window as any).__closed = true; }} onRetry={() => { (window as any).__retried = true; }} /></div>;
  if (params.get('screen') === 'help') return <HelpView theme={theme} onBack={() => {}} />;
  if (params.get('screen') === 'privacy') return <PrivacyView theme={theme} onBack={() => {}} />;
  if (params.get('screen') === 'about') return <AboutView theme={theme} onBack={() => {}} />;
  if (params.get('screen') === 'landing') return <LandingView theme={theme} onToggleTheme={setTheme} onConnect={() => { (window as any).__connect = true; }} onCapture={async url => { (window as any).__submittedUrl = url; }} />;
  if (params.get('screen') === 'settings') return <SettingsView userName="Visual QA" userEmail="visual-qa@example.invalid" autoAddTopMatch={autoAdd} defaultPlaylistId="1" playlists={[{ id: '1', name: 'Liked Songs' }, { id: '2', name: 'Very long playlist name to verify safe truncation' }]} theme={theme} onBack={() => { location.search = ''; }} onLogout={() => {}} onToggleAutoAdd={setAutoAdd} onPlaylistChange={value => { (window as any).__playlist = value; }} onToggleTheme={setTheme} onOpenStats={() => { location.search = '?screen=stats'; }} hasSpotifyToken onReconnectSpotify={() => { (window as any).__reconnected = true; }} />;
  if (params.get('screen') === 'stats') {
    api.getVibeAnalysis = async () => 'Visual QA fixture — discovery insight';
    return <StatsPageView onBack={() => { location.search = ''; }} theme={theme} history={history} userName="Visual QA" songsThisWeek={history.length} streak={2} playlists={[{ id: '1', name: 'Liked Songs' }]} defaultPlaylistId="1" hasSpotifyToken onToggleTheme={setTheme} />;
  }
  return <AppView initialTab={params.get('screen') === 'library' ? 'library' : 'capture'} userName="Visual QA" history={history} songsThisWeek={history.length} streak={history.length ? 2 : 0} isLoadingHistory={params.get('state') === 'loading'} historyError={params.get('state') === 'error' ? 'Check your connection and try again.' : undefined} onRefreshHistory={async () => {}} autoAddTopMatch={autoAdd} defaultPlaylistId="1" playlists={[{ id: '1', name: 'Liked Songs' }]} theme={theme} hasSpotifyToken onLogout={() => {}} onStashSubmit={async url => { (window as any).__submittedUrl = url; }} onDeleteSong={id => setHistory(current => current.filter(song => song.id !== id))} onToggleAutoAdd={setAutoAdd} onToggleTheme={setTheme} onOpenSettings={() => { location.search = '?screen=settings'; }} onOpenStats={() => { location.search = '?screen=stats'; }} />;
}
createRoot(document.getElementById('root')!).render(<Preview />);
