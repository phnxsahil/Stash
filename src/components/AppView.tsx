import { useEffect, useState } from 'react';
import { CapturePanel, type SavedCapture } from './CapturePanel';
import { HistoryList } from './HistoryList';
import { QuickStats } from './QuickStats';
import { Playlist, Song } from '../lib/api';
import '../styles/library.css';
import { StashShell } from './stitch/StashShell';
import { AchievementBanner } from './AchievementBanner';

interface AppViewProps {
  initialTab?: 'capture' | 'library';
  onTabChange?: (tab: 'capture' | 'library') => void;
  userName: string;
  history: Song[];
  songsThisWeek: number;
  streak: number;
  isLoadingHistory?: boolean;
  historyError?: string;
  onRefreshHistory?: () => Promise<void>;
  autoAddTopMatch: boolean;
  defaultPlaylistId: string;
  playlists: Playlist[];
  theme: 'light' | 'dark';
  onLogout: () => void;
  onStashSubmit: (url: string) => Promise<void>;
  onDeleteSong: (id: string) => void;
  onToggleAutoAdd: (value: boolean) => void;
  onToggleTheme: (value: 'light' | 'dark') => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  pendingSharedUrl?: string | null;
  savedCapture?: SavedCapture | null;
  hasSpotifyToken?: boolean;
}

export function AppView({initialTab = 'capture',onTabChange,userName,history,songsThisWeek,streak,isLoadingHistory,historyError,onRefreshHistory,autoAddTopMatch,defaultPlaylistId,playlists,theme,onLogout,onStashSubmit,onDeleteSong,onToggleAutoAdd,onToggleTheme,onOpenSettings,onOpenStats,pendingSharedUrl,savedCapture,hasSpotifyToken}: AppViewProps) {
  const [view, setView] = useState<'capture'|'library'>(initialTab);
  const destinationName = playlists.find(playlist=>playlist.id===defaultPlaylistId)?.name || (defaultPlaylistId==='stash_playlist' ? 'Stash playlist' : 'Liked Songs');
  useEffect(()=>{if(pendingSharedUrl) { setView('capture'); onTabChange?.('capture'); }},[pendingSharedUrl,onTabChange]);
  const navigate = (next:'capture'|'library') => { setView(next); onTabChange?.(next); window.scrollTo({top:0,behavior:'instant'}); };

  return <StashShell active={view} userName={userName} connected={hasSpotifyToken} theme={theme} onToggleTheme={onToggleTheme} onLogout={onLogout} autoAddTopMatch={autoAddTopMatch} onToggleAutoAdd={onToggleAutoAdd} onNavigate={destination => destination === 'settings' ? onOpenSettings() : destination === 'stats' ? onOpenStats() : navigate(destination)}>
    {!isLoadingHistory && !historyError && <AchievementBanner totalSongs={history.length} />}
    <section hidden={view !== 'capture'} aria-label="Capture a song">
      <CapturePanel connected savedCapture={savedCapture} onSubmit={onStashSubmit} pendingSharedUrl={pendingSharedUrl} destinationName={destinationName} onChangeDestination={onOpenSettings} recentSong={history[0]} />
    </section>
    <section hidden={view !== 'library'} className="st-library-content" aria-label="Your library">
      <header className="st-library-heading"><div><h1>Your library</h1></div><p>The songs you found. The ones you kept.</p></header>
      <QuickStats totalSongs={history.length} songsThisWeek={songsThisWeek} streak={streak} onClick={onOpenStats} isLoading={isLoadingHistory && !history.length} unavailable={!!historyError && !history.length} />
      <HistoryList history={history} onDeleteSong={onDeleteSong} isLoading={isLoadingHistory} error={historyError} onRefresh={onRefreshHistory} onCapture={() => navigate('capture')} />
    </section>
  </StashShell>;
}
