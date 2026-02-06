import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingView from './components/LandingView';
import AppView from './components/AppView';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import ConfirmationModal from './components/ConfirmationModal';
import ProcessingOverlay from './components/ProcessingOverlay';
import ToastContainer from './components/ToastContainer';
import { Song, AppState, Toast } from './types';
import { apiService } from './services/apiService';

type View = 'app' | 'stats' | 'settings';

function AppContent() {
  const [state, setState] = useState<AppState>({
    isLoggedIn: false,
    history: [],
    currentMatches: [],
    userPreferences: {
      autoAddTopMatch: false,
    },
  });

  const [mockUser] = useState({ name: 'Sahil' });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<'extracting' | 'identifying' | 'syncing' | 'error'>('extracting');
  const [processingError, setProcessingError] = useState<string | undefined>();
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentView, setCurrentView] = useState<View>('app');

  // Initialize app - load user history if logged in
  useEffect(() => {
    if (state.isLoggedIn) {
      loadUserHistory();
    }
  }, [state.isLoggedIn]);

  const loadUserHistory = async () => {
    try {
      const history = await apiService.getUserHistory();
      setState(prev => ({ ...prev, history }));
    } catch (error) {
      showToast('Failed to load history', 'error');
    }
  };

  const handleConnectSpotify = async () => {
    try {
      await apiService.connectSpotify();
      setState(prev => ({ ...prev, isLoggedIn: true }));
      showToast('Connected to Spotify!', 'success');
    } catch (error) {
      showToast('Failed to connect to Spotify', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logoutUser();
      setState({
        isLoggedIn: false,
        history: [],
        currentMatches: [],
        userPreferences: { autoAddTopMatch: false },
      });
      showToast('Logged out successfully', 'success');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  const handleStashSubmit = async (url: string) => {
    if (!url.trim()) {
      showToast('Please enter a URL', 'error');
      return;
    }

    // Show processing overlay
    setShowProcessing(true);
    setProcessingStage('extracting');
    setProcessingError(undefined);

    try {
      // Simulate stage progression
      setTimeout(() => setProcessingStage('identifying'), 500);
      setTimeout(() => setProcessingStage('syncing'), 1500);

      const matches = await apiService.stashUrl(url);
      
      // Hide processing overlay
      setShowProcessing(false);
      
      setState(prev => ({ ...prev, currentMatches: matches }));

      if (state.userPreferences.autoAddTopMatch && matches.length > 0) {
        // Auto-add the first match
        handleSongSelection(0);
      } else {
        // Show modal for manual selection
        setShowModal(true);
      }
    } catch (error) {
      setProcessingStage('error');
      setProcessingError('Failed to identify song');
      showToast('Failed to fetch song matches', 'error');
      // Auto-close error overlay after 3 seconds
      setTimeout(() => {
        setShowProcessing(false);
        setProcessingError(undefined);
      }, 3000);
    }
  };

  const handleSongSelection = async (index: number) => {
    const selectedSong = state.currentMatches[index];
    if (!selectedSong) return;

    try {
      await apiService.addTrack(selectedSong.id);
      
      // Add to history
      setState(prev => ({
        ...prev,
        history: [selectedSong, ...prev.history],
        currentMatches: [],
      }));

      setShowModal(false);
      showToast(`Added "${selectedSong.song}" to your library!`, 'success');
      
      // Stop any playing audio
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }
    } catch (error) {
      showToast('Failed to add track', 'error');
    }
  };

  const handleDeleteSong = (index: number) => {
    const deletedSong = state.history[index];
    setState(prev => ({
      ...prev,
      history: prev.history.filter((_, i) => i !== index),
    }));
    showToast(`Removed "${deletedSong.song}"`, 'success');
  };

  const handleToggleAutoAdd = async (enabled: boolean) => {
    setState(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, autoAddTopMatch: enabled },
    }));
    
    try {
      await apiService.updateUserPreferences({ autoAddTopMatch: enabled });
      showToast(
        enabled ? 'Auto-add enabled' : 'Auto-add disabled',
        'success'
      );
    } catch (error) {
      showToast('Failed to update preferences', 'error');
    }
  };

  const handlePreviewPlay = (previewUrl: string, buttonElement?: HTMLButtonElement) => {
    // If clicking the same song, pause it
    if (currentAudio && currentAudio.src === previewUrl) {
      currentAudio.pause();
      setCurrentAudio(null);
      return;
    }

    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
    }

    // Play new audio
    const audio = new Audio(previewUrl);
    audio.play().catch(() => {
      showToast('Failed to play preview', 'error');
    });

    audio.onended = () => {
      setCurrentAudio(null);
    };

    setCurrentAudio(audio);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    const newToast: Toast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#121212] dark:bg-[#121212] light:bg-white text-[#E5E5E5] dark:text-[#E5E5E5] light:text-gray-900 relative noise-texture transition-colors duration-200">
      {!state.isLoggedIn ? (
        <LandingView onConnect={handleConnectSpotify} />
      ) : (
        <>
          {currentView === 'app' && (
            <AppView
              userName={mockUser.name}
              history={state.history}
              autoAddEnabled={state.userPreferences.autoAddTopMatch}
              onLogout={handleLogout}
              onStashSubmit={handleStashSubmit}
              onDeleteSong={handleDeleteSong}
              onToggleAutoAdd={handleToggleAutoAdd}
              onNavigateToStats={() => setCurrentView('stats')}
              onNavigateToSettings={() => setCurrentView('settings')}
            />
          )}
          
          {currentView === 'stats' && (
            <div className="relative">
              {/* Back Button */}
              <button
                onClick={() => setCurrentView('app')}
                className="fixed top-4 left-4 z-20 px-4 py-2 rounded-lg bg-gray-800 dark:bg-gray-800 light:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-300 transition-colors text-sm"
              >
                ← Back
              </button>
              <StatsView history={state.history} />
            </div>
          )}
          
          {currentView === 'settings' && (
            <div className="relative">
              {/* Back Button */}
              <button
                onClick={() => setCurrentView('app')}
                className="fixed top-4 left-4 z-20 px-4 py-2 rounded-lg bg-gray-800 dark:bg-gray-800 light:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-300 transition-colors text-sm"
              >
                ← Back
              </button>
              <SettingsView
                autoAddEnabled={state.userPreferences.autoAddTopMatch}
                onToggleAutoAdd={handleToggleAutoAdd}
              />
            </div>
          )}
        </>
      )}

      <ConfirmationModal
        isOpen={showModal}
        matches={state.currentMatches}
        currentAudio={currentAudio}
        onClose={() => {
          setShowModal(false);
          if (currentAudio) {
            currentAudio.pause();
            setCurrentAudio(null);
          }
        }}
        onSelect={handleSongSelection}
        onPreviewPlay={handlePreviewPlay}
      />

      <ProcessingOverlay
        isOpen={showProcessing}
        stage={processingStage}
        error={processingError}
        onClose={() => {
          setShowProcessing(false);
          setProcessingError(undefined);
        }}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}