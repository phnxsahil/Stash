import { useState, useEffect } from 'react';
import { LandingView } from './components/LandingView';
import { AppView } from './components/AppView';
import { SettingsView } from './components/SettingsView';
import { PrivacyView } from './components/PrivacyView';
import { AboutView } from './components/AboutView';
import { HelpView } from './components/HelpView';
import { StatsPageView } from './components/StatsPageView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { PWARegistration } from './components/PWARegistration';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { api } from './lib/api';
import { supabase } from './lib/supabase';

interface Song {
  id: string;
  song: string;
  artist: string;
  source: string;
  album_art_url: string;
  preview_url?: string;
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

interface Playlist {
  id: string;
  name: string;
}

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
  processingStatus: string;
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
      autoAddTopMatch: false,
      defaultPlaylistId: '1',
      playlists: [],
      theme: savedTheme || 'dark',
      processingStatus: '',
    };
  });

  // Global Error Handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global Error Caught:", event.error);
      toast.error(`App Error: ${event.message || 'Something went wrong'}`);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Handle Share Target on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedText = params.get('text') || params.get('url') || params.get('title');

    const handleSharedContent = async (text: string) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = text.match(urlRegex);
      if (matches && matches[0]) {
        const reelUrl = matches[0];
        // If not logged in, we might want to store it or prompt login
        // For now, let's assume we proceed if we can
        handleStashSubmit(reelUrl);
      }
    };

    if (sharedText) {
      handleSharedContent(sharedText);
      // Clean up the URL
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  // Handle Auth Session
  useEffect(() => {
    // 1. Initial Session Check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handleAuthSuccess(session.user);
      }
    };
    checkSession();

    // 2. Listen for Session Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          handleAuthSuccess(session.user);
        } else {
          // Handled by handleLogout if manually triggered, 
          // but good for token expiry
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = async (user: any) => {
    console.log("Auth: Successful login for", user.email);

    // Set basic info first so the UI transitions immediately
    setState((prev) => ({
      ...prev,
      isLoggedIn: true,
      userEmail: user.email || '',
      userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      currentView: 'app',
    }));

    // Then try to fetch enriched data in the background
    try {
      const playlists = await api.getUserPlaylists();
      setState((prev) => ({ ...prev, playlists }));
      loadHistory();
    } catch (err) {
      console.warn("Auth: Failed to fetch enriched user data (playlists/history):", err);
      // We don't block the UI here, the user is already in the app
    }
  };

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
      toast.loading('Redirecting to Spotify...');
      await api.connectSpotify();
    } catch (error) {
      console.error('Failed to connect:', error);
      toast.dismiss();
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
        autoAddTopMatch: false,
        defaultPlaylistId: '1',
        playlists: [],
        theme: state.theme, // Preserve theme on logout
        processingStatus: '',
      });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Failed to logout:', error);
      toast.error('Failed to logout');
    }
  };

  const handleStashSubmit = async (url: string) => {
    try {
      setState((prev) => ({ ...prev, currentUrl: url, processingStatus: 'Starting...' }));

      const matches = await api.stashUrl(url, (status) => {
        setState((prev) => ({ ...prev, processingStatus: status }));
      });

      if (state.autoAddTopMatch && matches.length > 0) {
        // Auto-add the top match
        await handleSongSelection(matches[0]);
      } else {
        // Show modal for selection
        setState((prev) => ({
          ...prev,
          currentMatches: matches,
          showModal: true,
          processingStatus: '',
        }));
      }
    } catch (error) {
      console.error('Failed to stash:', error);
      setState((prev) => ({ ...prev, processingStatus: '' }));
      toast.error('Failed to find song. Please try again.');
    }
  };

  const handleSongSelection = async (song: SongMatch) => {
    try {
      // Close modal
      setState((prev) => ({ ...prev, showModal: false }));

      // Extract source from URL (simplified)
      const source = extractSource(state.currentUrl);

      // Add track
      const newSong = await api.addTrack(song, source);

      // Add to history
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
      toast.success(
        value ? 'Auto-add enabled' : 'Auto-add disabled'
      );
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
        return <StatsPageView onBack={handleBack} theme={state.theme} history={state.history} />;
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
          />
        );
      case 'app':
        return (
          <AppView
            userName={state.userName}
            history={state.history}
            autoAddTopMatch={state.autoAddTopMatch}
            theme={state.theme}
            onLogout={handleLogout}
            onStashSubmit={handleStashSubmit}
            onDeleteSong={handleDeleteSong}
            onToggleAutoAdd={handleToggleAutoAdd}
            onToggleTheme={handleToggleTheme}
            onOpenSettings={() => handleNavigate('settings')}
            processingStatus={state.processingStatus}
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

      <PWAInstallPrompt />
      <PWARegistration />

      <Toaster position="bottom-right" theme={state.theme} />
    </div>
  );
}