import { useEffect, useState } from 'react';
import { AudioLines, BarChart3, ChevronDown, Disc3, Library, LogOut, Moon, Plus, Settings } from 'lucide-react';
import { CapturePanel } from './CapturePanel';
import { HistoryList } from './HistoryList';
import { QuickStats } from './QuickStats';
import { AchievementBanner } from './AchievementBanner';
import { Switch } from './ui/switch';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from './ui/sheet';
import { Playlist, Song } from '../lib/api';
import '../styles/library.css';

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
}

export function AppView({initialTab = 'capture',onTabChange,userName,history,songsThisWeek,streak,isLoadingHistory,historyError,onRefreshHistory,autoAddTopMatch,defaultPlaylistId,playlists,theme,onLogout,onStashSubmit,onDeleteSong,onToggleAutoAdd,onToggleTheme,onOpenSettings,onOpenStats,pendingSharedUrl}: AppViewProps) {
  const [view, setView] = useState<'capture'|'library'>(initialTab);
  const destinationName = playlists.find(playlist=>playlist.id===defaultPlaylistId)?.name || (defaultPlaylistId==='stash_playlist' ? 'Stash playlist' : 'Liked Songs');
  useEffect(()=>{if(pendingSharedUrl) { setView('capture'); onTabChange?.('capture'); }},[pendingSharedUrl,onTabChange]);
  const navigate = (next:'capture'|'library') => { setView(next); onTabChange?.(next); window.scrollTo({top:0,behavior:'instant'}); };

  return <div className="stash-app capture-theme">
    <a href="#main-content" className="capture-skip">Skip to main content</a>
    <header className="app-header">
      <a className="capture-brand" href="#main-content" onClick={()=>navigate('capture')} aria-label="Stash home"><AudioLines /> stash<span>.</span></a>
      <nav className="app-desktop-nav" aria-label="Main navigation">
        <button onClick={()=>navigate('capture')} aria-current={view==='capture' ? 'page' : undefined}><Plus size={18} /> Capture</button>
        <button onClick={()=>navigate('library')} aria-current={view==='library' ? 'page' : undefined}><Library size={18} /> Your library</button>
        <button onClick={onOpenStats}><BarChart3 size={18} /> Statistics</button>
      </nav>
      <Sheet>
        <SheetTrigger asChild><button className="app-account" aria-label="Open account menu"><span>{userName.charAt(0).toUpperCase() || 'S'}</span><ChevronDown size={14} aria-hidden="true" /></button></SheetTrigger>
        <SheetContent className="app-account-sheet capture-theme">
          <SheetTitle>Your Stash</SheetTitle><SheetDescription>Account and listening preferences</SheetDescription>
          <div className="account-identity"><span>{userName.charAt(0).toUpperCase() || 'S'}</span><div><strong>{userName}</strong><p>Your personal collection</p></div></div>
          <div className="account-theme"><label htmlFor="app-theme"><Moon size={18} /> Dark mode preference</label><Switch id="app-theme" checked={theme==='dark'} onCheckedChange={checked=>onToggleTheme(checked?'dark':'light')} /></div>
          <button className="account-menu-button" onClick={onOpenSettings}><Settings size={19} /> Settings & Spotify</button>
          <button className="account-menu-button" onClick={onOpenStats}><BarChart3 size={19} /> Statistics</button>
          <button className="account-menu-button" onClick={onLogout}><LogOut size={19} /> Log out</button>
        </SheetContent>
      </Sheet>
    </header>
    <main id="main-content" className="app-workspace">
      <section className="app-screen" data-active={view==='capture'} hidden={view!=='capture'} aria-label="Capture a song">
        <CapturePanel connected onSubmit={onStashSubmit} pendingSharedUrl={pendingSharedUrl} destinationName={destinationName} onChangeDestination={onOpenSettings} />
        <div className="capture-auto-add"><div><label htmlFor="auto-add-toggle">Auto-add top match</label><p>Found it? Save it straight to your Spotify destination.</p></div><Switch id="auto-add-toggle" checked={autoAddTopMatch} onCheckedChange={onToggleAutoAdd} /></div>
        <div className="capture-library-link"><div><Disc3 size={24} /><span>{history.length ? `${history.length} good ${history.length===1?'find':'finds'}, kept.` : 'Your collection starts with one good find.'}</span></div><button onClick={()=>navigate('library')}>Your library <Library size={17} /></button></div>
      </section>
      <section className="app-screen library-screen" data-active={view==='library'} hidden={view!=='library'} aria-label="Your library">
        <div className="library-heading"><div><p className="capture-eyebrow"><span /> YOUR PERSONAL LINER NOTES</p><h1>Your library<span>.</span></h1><p>The songs you found. The ones you kept.</p></div><button className="library-secondary" onClick={()=>navigate('capture')}><Plus size={18} /> Stash a song</button></div>
        <QuickStats totalSongs={history.length} songsThisWeek={songsThisWeek} streak={streak} onClick={onOpenStats} isLoading={isLoadingHistory && !history.length} unavailable={!!historyError && !history.length} />
        <HistoryList history={history} onDeleteSong={onDeleteSong} isLoading={isLoadingHistory} error={historyError} onRefresh={onRefreshHistory} onCapture={()=>navigate('capture')} />
        {(history.length > 0 || (!isLoadingHistory && !historyError)) && <AchievementBanner totalSongs={history.length} />}
      </section>
    </main>
    <nav className="app-bottom-nav" aria-label="Mobile navigation">
      <button onClick={()=>navigate('capture')} aria-current={view==='capture'?'page':undefined}><Plus size={23} /><span>Capture</span></button>
      <button onClick={()=>navigate('library')} aria-current={view==='library'?'page':undefined}><Library size={23} /><span>Library</span></button>
      <button onClick={onOpenStats}><BarChart3 size={22} /><span>Stats</span></button>
    </nav>
  </div>;
}
