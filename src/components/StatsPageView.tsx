import { StatsView } from './StatsView';
import { StashShell, type StashDestination } from './stitch/StashShell';
import type { Playlist, Song } from '../types';

interface StatsPageViewProps {
  onBack: () => void; theme: 'light' | 'dark'; history?: Song[];
  userName: string; songsThisWeek: number; streak: number;
  playlists?: Playlist[]; defaultPlaylistId?: string; hasSpotifyToken?: boolean;
  onNavigate?: (destination: StashDestination) => void;
  onToggleTheme?: (theme: 'light' | 'dark') => void; onLogout?: () => void;
}
export function StatsPageView({ onBack, theme, history = [], userName, songsThisWeek, streak, playlists, defaultPlaylistId, hasSpotifyToken, onNavigate, onToggleTheme, onLogout }: StatsPageViewProps) {
  return <StashShell active="stats" userName={userName} connected={hasSpotifyToken} theme={theme} onNavigate={onNavigate || (() => onBack())} onToggleTheme={onToggleTheme} onLogout={onLogout}>
    <StatsView history={history} userName={userName} songsThisWeek={songsThisWeek} streak={streak} playlists={playlists} defaultPlaylistId={defaultPlaylistId} />
  </StashShell>;
}
