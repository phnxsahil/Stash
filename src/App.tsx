import { useState, useEffect, useRef } from 'react';
import { LandingView } from './components/LandingView';
import { AppView } from './components/AppView';
import { SettingsView } from './components/SettingsView';
import { PrivacyView } from './components/PrivacyView';
import { AboutView } from './components/AboutView';
import { HelpView } from './components/HelpView';
import { StatsPageView } from './components/StatsPageView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { PWARegistration } from './components/PWARegistration';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { api, Song, SongMatch, Playlist } from './lib/api';
import { supabase } from './lib/supabase';

type ViewType = 'landing' | 'app' | 'settings' | 'privacy' | 'about' | 'help' | 'stats';

interface AppState {
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  history: Song[];
  currentMatches: SongMatch[];
  currentUrl: string;
  showModal: boolean;
  currentView: ViewType;
  isLoadingHistory: boolean;
  autoAddTopMatch: boolean;
  defaultPlaylistId: string;
  playlists: Playlist[];
  theme: 'light' | 'dark';
  isProcessing: boolean;
  processingStage: 1 | 2 | 3 | 'success' | 'error';
  processingError?: string;
}

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    // Load theme from localStorage on initial load
    const savedTheme = localStorage.getItem('stash-theme') as 'light' | 'dark' | null;
    return {
      isLoggedIn: false,
      userName: '',
      userEmail: '',
      history: [],
      currentMatches: [],
      currentUrl: '',
      showModal: false,
      currentView: 'landing',
      isLoadingHistory: false,
      autoAddTopMatch: true, // Default to true as requested
      defaultPlaylistId: '1',
      playlists: [],
      theme: savedTheme || 'dark',
      isProcessing: false,
      processingStage: 1,
      processingError: undefined,
    };
  });

  const [pendingSharedUrl, setPendingSharedUrl] = useState<string | null>(null);
  const sharedUrlRef = useRef<string | null>(null);
  const stashSubmitRef = useRef<((url: string) => Promise<void>) | null>(null);

  // Handle Share Target on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrlParam = params.get('url');
    const sharedText = params.get('text') || params.get('title');
    const payload = sharedUrlParam || sharedText;

    if (!payload || sharedUrlRef.current) return;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = payload.match(urlRegex);
    const cleanUrl = sharedUrlParam || (matches && matches[0]);

    if (!cleanUrl) return;

    sharedUrlRef.current = cleanUrl;
    setPendingSharedUrl(cleanUrl);

    // Clean the URL bar so refreshes don't resubmit the payload
    window.history.replaceState({}, document.title, '/');
  }, []);

  useEffect(() => {
    if (!pendingSharedUrl || !state.isLoggedIn) return;

    stashSubmitRef.current?.(pendingSharedUrl);
    sharedUrlRef.current = null;
    setPendingSharedUrl(null);
  }, [pendingSharedUrl, state.isLoggedIn]);

  // Handle Auth Session
  useEffect(() => {
    const checkSession = async () => {
      console.log('🔐 Checking auth session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Session:', session ? 'Found' : 'Not found');
      if (session) {
        handleAuthSuccess(session.user);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, session ? 'Session present' : 'No session');
        if (session) {
          handleAuthSuccess(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = async (user: any) => {
    console.log('✅ Auth success! User:', user.email);
    setState((prev) => ({
      ...prev,
      isLoggedIn: true,
      userEmail: user.email || '',
      userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      currentView: 'app',
    }));
    console.log('✅ Redirecting to dashboard...');

    try {
      const playlists = await api.getUserPlaylists();
      setState((prev) => ({ ...prev, playlists }));
      await loadHistory();
    } catch (err) {
      console.warn("Auth: Failed to fetch enriched user data:", err);
    }
  };

  // Load history when user logs in
  useEffect(() => {
    if (state.isLoggedIn && state.history.length === 0) {
      loadHistory();
    }
  }, [state.isLoggedIn]);

  // Apply theme to document and save to localStorage
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    document.documentElement.className = state.theme;
    localStorage.setItem('stash-theme', state.theme);
  }, [state.theme]);

  const loadHistory = async () => {
    setState((prev) => ({ ...prev, isLoadingHistory: true }));
    try {
      const history = await api.getUserHistory();
      setState((prev) => ({ ...prev, history, isLoadingHistory: false }));
    } catch (error) {
      console.error('Failed to load history:', error);
      setState((prev) => ({ ...prev, isLoadingHistory: false }));
      toast.error('Failed to load history');
    }
  };

  const handleConnectSpotify = async () => {
    try {
      await api.connectSpotify();
    } catch (error) {
      console.error('Failed to connect:', error);
      toast.error('Failed to connect to Spotify');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logoutUser();
      setState({
        isLoggedIn: false,
        userName: '',
        userEmail: '',
        history: [],
        currentMatches: [],
        currentUrl: '',
        showModal: false,
        currentView: 'landing',
        isLoadingHistory: false,
        autoAddTopMatch: true,
        defaultPlaylistId: '1',
        playlists: [],
        theme: state.theme,
        isProcessing: false,
        processingStage: 1,
        processingError: undefined,
      });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Failed to logout:', error);
      toast.error('Failed to logout');
    }
  };

  const handleStashSubmit = async (url: string) => {
    try {
      setState((prev) => ({
        ...prev,
        currentUrl: url,
        isProcessing: true,
        processingStage: 1,
        processingError: undefined
      }));

      const matches = await api.stashUrl(url, (status) => {
        if (status === "Extracting Audio..." || status === "Downloading...") {
          setState(prev => ({ ...prev, processingStage: 1 }));
        } else if (status === "Identifying Song...") {
          setState(prev => ({ ...prev, processingStage: 2 }));
        } else if (status === "Verifying with Spotify...") {
          setState(prev => ({ ...prev, processingStage: 3 }));
        }
      });

      setState((prev) => ({ ...prev, processingStage: 'success' }));

      setTimeout(async () => {
        setState((prev) => ({ ...prev, isProcessing: false, processingStage: 1 }));

        if (state.autoAddTopMatch && matches.length > 0) {
          await handleSongSelection(matches[0]);
        } else {
          setState((prev) => ({
            ...prev,
            currentMatches: matches,
            showModal: true,
          }));
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to stash:', error);
      setState((prev) => ({
        ...prev,
        processingStage: 'error',
        processingError: 'Failed to find song. Please try again.'
      }));

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          processingStage: 1,
          processingError: undefined
        }));
      }, 2000);

      toast.error('Failed to find song. Please try again.');
    }
  };
  stashSubmitRef.current = handleStashSubmit;

  const handleSongSelection = async (song: SongMatch) => {
    try {
      setState((prev) => ({ ...prev, showModal: false }));
      const source = extractSource(state.currentUrl);
      const { song: newSong } = await api.addTrack(song, source);

      setState((prev) => ({
        ...prev,
        history: [newSong, ...prev.history],
        currentMatches: [],
        currentUrl: '',
      }));

      toast.success(`"${song.song}" added to your library!`);
    } catch (error) {
      console.error('Failed to add track:', error);
      toast.error('Failed to add song to library');
    }
  };

  const handleDeleteSong = async (id: string) => {
    try {
      await api.deleteSong(id);
      setState((prev) => ({
        ...prev,
        history: prev.history.filter((song) => song.id !== id),
      }));
      toast.success('Song removed from history');
    } catch (error) {
      console.error('Failed to delete song:', error);
      toast.error('Failed to delete song');
    }
  };

  const handleToggleAutoAdd = async (value: boolean) => {
    try {
      await api.updateUserPreferences({ autoAddTopMatch: value });
      setState((prev) => ({ ...prev, autoAddTopMatch: value }));
      toast.success(value ? 'Auto-add enabled' : 'Auto-add disabled');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  const handleToggleTheme = async (value: 'light' | 'dark') => {
    try {
      if (state.isLoggedIn) {
        await api.updateUserPreferences({ theme: value });
      }
      setState((prev) => ({ ...prev, theme: value }));
    } catch (error) {
      console.error('Failed to update theme:', error);
      toast.error('Failed to update theme');
    }
  };

  const handlePlaylistChange = async (playlistId: string) => {
    try {
      await api.updateUserPreferences({ defaultPlaylistId: playlistId });
      setState((prev) => ({ ...prev, defaultPlaylistId: playlistId }));
      const playlist = state.playlists.find(p => p.id === playlistId);
      toast.success(`Default playlist set to ${playlist?.name || 'selected playlist'}`);
    } catch (error) {
      console.error('Failed to update playlist:', error);
      toast.error('Failed to update playlist');
    }
  };

  const handleNavigate = (view: ViewType) => {
    setState((prev) => ({ ...prev, currentView: view }));
  };

  // Expose for settings navigation
  useEffect(() => {
    (window as any).onNavigate = handleNavigate;
    return () => { delete (window as any).onNavigate; };
  }, []);

  const handleBack = () => {
    if (state.isLoggedIn) {
      setState((prev) => ({ ...prev, currentView: 'app' }));
    } else {
      setState((prev) => ({ ...prev, currentView: 'landing' }));
    }
  };

  const extractSource = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
    return 'Web';
  };

  const renderView = () => {
    switch (state.currentView) {
      case 'privacy':
        return <PrivacyView onBack={handleBack} theme={state.theme} />;
      case 'about':
        return <AboutView onBack={handleBack} theme={state.theme} />;
      case 'help':
        return <HelpView onBack={handleBack} theme={state.theme} />;
      case 'stats':
        return (
          <StatsPageView
            onBack={handleBack}
            theme={state.theme}
            history={state.history}
            userName={state.userName}
            songsThisWeek={state.history.filter(s => {
              const date = new Date(s.created_at || '');
              const now = new Date();
              const diff = now.getTime() - date.getTime();
              return diff < 7 * 24 * 60 * 60 * 1000;
            }).length}
            streak={0} // Placeholder for now
          />
        );
      case 'settings':
        return (
          <SettingsView
            userName={state.userName}
            userEmail={state.userEmail}
            autoAddTopMatch={state.autoAddTopMatch}
            defaultPlaylistId={state.defaultPlaylistId}
            playlists={state.playlists}
            theme={state.theme}
            onBack={handleBack}
            onLogout={handleLogout}
            onToggleAutoAdd={handleToggleAutoAdd}
            onPlaylistChange={handlePlaylistChange}
            onToggleTheme={handleToggleTheme}
            onOpenStats={() => handleNavigate('stats')}
          />
        );
      case 'app':
        return (
          <AppView
            userName={state.userName}
            history={state.history}
            songsThisWeek={state.history.filter(s => {
              const date = new Date(s.created_at || '');
              const now = new Date();
              const diff = now.getTime() - date.getTime();
              return diff < 7 * 24 * 60 * 60 * 1000;
            }).length}
            streak={0} // Placeholder for now
            autoAddTopMatch={state.autoAddTopMatch}
            theme={state.theme}
            onLogout={handleLogout}
            onStashSubmit={handleStashSubmit}
            onDeleteSong={handleDeleteSong}
            onToggleAutoAdd={handleToggleAutoAdd}
            onToggleTheme={handleToggleTheme}
            onOpenSettings={() => handleNavigate('settings')}
            onOpenStats={() => handleNavigate('stats')}
          />
        );
      case 'landing':
      default:
        return (
          <LandingView
            onConnect={handleConnectSpotify}
            theme={state.theme}
            onToggleTheme={handleToggleTheme}
            onNavigate={(page) => handleNavigate(page)}
          />
        );
    }
  };

  return (
    <div className="size-full">
      {renderView()}

      <ConfirmationModal
        isOpen={state.showModal}
        matches={state.currentMatches}
        onClose={() => setState((prev) => ({ ...prev, showModal: false }))}
        onSelectSong={handleSongSelection}
      />

      <ProcessingOverlay
        isVisible={state.isProcessing}
        stage={state.processingStage}
        errorMessage={state.processingError}
        onClose={() => setState((prev) => ({
          ...prev,
          isProcessing: false,
          processingStage: 1,
          processingError: undefined
        }))}
      />
      <PWAInstallPrompt />
      <PWARegistration />

      <Toaster position="bottom-right" theme={state.theme} />
    </div>
  );
}