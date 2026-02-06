import { useState, useEffect } from 'react';
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
import { toast } from 'sonner@2.0.3';
import { api } from './lib/api';

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
      autoAddTopMatch: false,
      defaultPlaylistId: '1',
      playlists: [],
      theme: savedTheme || 'dark',
      isProcessing: false,
      processingStage: 1,
      processingError: undefined,
    };
  });

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
    } else {
      document.documentElement.classList.remove('dark');
    }
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
      toast.loading('Connecting to Spotify...');
      const user = await api.connectSpotify();
      const userData = await api.getUserData();
      const playlists = await api.getUserPlaylists();
      toast.dismiss();
      setState((prev) => ({
        ...prev,
        isLoggedIn: true,
        userName: user.name,
        userEmail: userData.email,
        playlists,
        currentView: 'app',
      }));
      toast.success('Connected to Spotify!');
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
      
      // Simulate stage progression
      setTimeout(() => {
        setState((prev) => ({ ...prev, processingStage: 2 }));
      }, 800);
      
      setTimeout(() => {
        setState((prev) => ({ ...prev, processingStage: 3 }));
      }, 1600);
      
      const matches = await api.stashUrl(url);
      
      // Success stage
      setState((prev) => ({ ...prev, processingStage: 'success' }));
      
      setTimeout(() => {
        setState((prev) => ({ ...prev, isProcessing: false, processingStage: 1 }));
        
        if (state.autoAddTopMatch && matches.length > 0) {
          // Auto-add the top match
          handleSongSelection(matches[0]);
        } else {
          // Show modal for selection
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