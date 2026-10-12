import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'framer-motion';
import { LandingView } from './components/LandingView';
import { AppView } from './components/AppView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { PWARegistration } from './components/PWARegistration';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoadingSkeleton from './components/LoadingSkeleton';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { api } from './lib/api';
import { HistorySaveError } from './lib/saveOutcome';
import { supabase } from './lib/supabase';
import { logger } from './lib/logger';
import { calculateStreak } from './lib/analytics';
import type { AppState, ViewType, SongMatch, Theme } from './types';

// Lazy-loaded views (only fetched when navigated to)
const SettingsView = lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));
const PrivacyView = lazy(() => import('./components/PrivacyView').then(m => ({ default: m.PrivacyView })));
const AboutView = lazy(() => import('./components/AboutView').then(m => ({ default: m.AboutView })));
const HelpView = lazy(() => import('./components/HelpView').then(m => ({ default: m.HelpView })));
const StatsPageView = lazy(() => import('./components/StatsPageView').then(m => ({ default: m.StatsPageView })));

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SHARED_URL_STORAGE_KEY = 'stash-pending-shared-url';
type StashSubmitOptions = {
  source?: 'manual' | 'share-target';
};

function getSharedUrlFromSearch(search: string): string | null {
  const params = new URLSearchParams(search);
  const sharedUrlParam = params.get('shared_url') || params.get('url');
  const sharedText = params.get('text') || params.get('title');
  const payload = sharedUrlParam || sharedText;

  if (!payload) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = payload.match(urlRegex);
  return sharedUrlParam || (matches && matches[0]) || null;
}

function storeSharedUrl(url: string) {
  localStorage.setItem(SHARED_URL_STORAGE_KEY, url);
}

function readStoredSharedUrl(): string | null {
  return localStorage.getItem(SHARED_URL_STORAGE_KEY);
}

function clearStoredSharedUrl() {
  localStorage.removeItem(SHARED_URL_STORAGE_KEY);
}

function cleanShareTargetUrl() {
  const cleanPath = `${window.location.pathname}${window.location.hash}`;
  window.history.replaceState({}, document.title, cleanPath);
}

function createDefaultState(theme?: Theme): AppState {
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
    hasSpotifyToken: false,
    autoAddTopMatch: true,
    defaultPlaylistId: '1',
    playlists: [],
    theme: theme || 'dark',
    isProcessing: false,
    processingStage: 1,
    processingError: undefined,
  };
}

/** Extract the source platform from a URL */
function extractSource(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('tiktok.com')) return 'TikTok';
  if (url.includes('instagram.com')) return 'Instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
  return 'Web';
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const [appTab, setAppTab] = useState<'capture' | 'library'>('capture');
  const [state, setState] = useState<AppState>(() => {
    const savedTheme = localStorage.getItem('stash-theme') as Theme | null;
    return createDefaultState(savedTheme || undefined);
  });

  const authOwner = useRef<string | null>(null);
  const authRevision = useRef(0);
  const historyRevision = useRef(0);
  const themeRef = useRef(state.theme);
  themeRef.current = state.theme;
  const saveInFlight = useRef(false);
  const [saving, setSaving] = useState(false);
  const deletesInFlight = useRef(new Set<string>());
  const [pendingHistory, setPendingHistory] = useState<HistorySaveError | null>(null);
  const [retryingHistory, setRetryingHistory] = useState(false);

  // Force mood board refresh when songs change
  const [moodBoardKey, setMoodBoardKey] = useState(0);

  const [pendingSharedUrl, setPendingSharedUrl] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState('');
  const sharedUrlRef = useRef<string | null>(null);
  const sharedSubmissionRef = useRef<string | null>(null);
  const stashSubmitRef = useRef<((url: string, options?: StashSubmitOptions) => Promise<void>) | null>(null);

  const queueSharedUrl = useCallback((incomingUrl: string | null) => {
    if (!incomingUrl) return;

    const normalizedUrl = incomingUrl.trim();
    if (!normalizedUrl) return;

    sharedUrlRef.current = normalizedUrl;
    storeSharedUrl(normalizedUrl);
    setPendingSharedUrl(normalizedUrl);
  }, []);

  useEffect(() => {
    const syncIncomingShare = () => {
      const sharedFromSearch = getSharedUrlFromSearch(window.location.search);
      const sharedFromStorage = readStoredSharedUrl();
      const nextSharedUrl = sharedFromSearch || sharedFromStorage;

      if (!nextSharedUrl) return;
      if (sharedUrlRef.current === nextSharedUrl && pendingSharedUrl === nextSharedUrl) return;

      queueSharedUrl(nextSharedUrl);

      if (sharedFromSearch) {
        cleanShareTargetUrl();
      }
    };

    syncIncomingShare();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncIncomingShare();
      }
    };

    window.addEventListener('pageshow', syncIncomingShare);
    window.addEventListener('popstate', syncIncomingShare);
    window.addEventListener('focus', syncIncomingShare);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', syncIncomingShare);
      window.removeEventListener('popstate', syncIncomingShare);
      window.removeEventListener('focus', syncIncomingShare);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [pendingSharedUrl, queueSharedUrl]);

  useEffect(() => {
    if (!pendingSharedUrl || !state.isLoggedIn || state.isProcessing) return;
    if (sharedSubmissionRef.current === pendingSharedUrl) return;

    sharedSubmissionRef.current = pendingSharedUrl;
    setState((prev) => ({ ...prev, currentView: 'app' }));

    stashSubmitRef.current
      ?.(
        pendingSharedUrl,
        { source: 'share-target' },
      )
      .finally(() => {
        if (sharedSubmissionRef.current === pendingSharedUrl) {
          sharedSubmissionRef.current = null;
        }
      });
  }, [pendingSharedUrl, state.isLoggedIn, state.isProcessing]);

  // Never await a Supabase API from inside its synchronous auth callback.
  // Account transitions invalidate pending reads before their responses can apply.
  useEffect(() => {
    let alive = true;
    let eventSeen = false;
    const applySession = (session: import('@supabase/supabase-js').Session | null) => {
      if (!alive) return;
      const owner = session?.user.id || null;
      const changed = owner !== authOwner.current;
      const revision = ++authRevision.current;
      historyRevision.current += 1;
      authOwner.current = owner;
      if (!session) {
        setPendingHistory(null);
        setHistoryError('');
        setAppTab('capture');
        setState(createDefaultState(themeRef.current));
        return;
      }
      if (changed) { setPendingHistory(null); setHistoryError(''); setAppTab('capture'); }
      setState(prev => ({
        ...(changed ? createDefaultState(prev.theme) : prev),
        isLoggedIn: true,
        hasSpotifyToken: !!session.provider_token,
        userEmail: session.user.email || '',
        userName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        currentView: changed ? 'app' : prev.currentView,
      }));
      queueMicrotask(() => {
        if (!alive || revision !== authRevision.current) return;
        void loadHistory(owner!, revision);
        void api.getUserPlaylists().then(playlists => {
          if (alive && revision === authRevision.current && owner === authOwner.current) {
            setState(prev => ({ ...prev, playlists }));
          }
        }).catch(error => {
          if (alive && revision === authRevision.current) logger.warn('Playlists could not be loaded.', error);
        });
      });
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      eventSeen = true;
      applySession(session);
    });
    void supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (alive && !eventSeen) applySession(error ? null : session);
    }).catch(() => { if (alive && !eventSeen) applySession(null); });
    return () => {
      alive = false;
      authRevision.current += 1;
      historyRevision.current += 1;
      subscription.unsubscribe();
    };
  }, []);

  const streak = useMemo(() => calculateStreak(state.history), [state.history]);

  const songsThisWeek = useMemo(() => {
    const now = Date.now();
    return state.history.filter(s => {
      const date = new Date(s.created_at || '');
      return now - date.getTime() < SEVEN_DAYS_MS;
    }).length;
  }, [state.history]);

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

  const loadHistory = async (owner = authOwner.current, authAtStart = authRevision.current) => {
    if (!owner) return;
    setHistoryError('');
    const request = ++historyRevision.current;
    const current = () => owner === authOwner.current && authAtStart === authRevision.current && request === historyRevision.current;
    if (!current()) return;
    setState(prev => ({ ...prev, isLoadingHistory: true }));
    try {
      const history = await api.getUserHistory(owner);
      if (current()) setState(prev => ({ ...prev, history, isLoadingHistory: false }));
    } catch (error) {
      if (!current()) return;
      logger.error('Failed to load history:', error);
      setState(prev => ({ ...prev, isLoadingHistory: false }));
      setHistoryError('Your current history was kept. Check your connection and try again.');
      toast.error('Failed to load history. Your current history was kept.');
    }
  };

  const handleConnectSpotify = useCallback(async () => {
    try {
      await api.connectSpotify();
    } catch (error) {
      logger.error('Failed to connect:', error);
      toast.error('Failed to connect to Spotify');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await api.logoutUser();
      setPendingHistory(null);
      setHistoryError('');
      setAppTab('capture');
      setState(createDefaultState(state.theme));
      toast.success('Logged out successfully');
    } catch (error) {
      logger.error('Failed to logout:', error);
      toast.error('Failed to logout');
    }
  }, [state.theme]);

  const handleStashSubmit = async (url: string, options?: StashSubmitOptions) => {
    if (pendingHistory || saveInFlight.current) { toast.error('Finish the pending history save first.'); return; }
    try {
      if (options?.source === 'share-target') {
        sharedUrlRef.current = null;
        clearStoredSharedUrl();
        setPendingSharedUrl((current) => (current === url ? null : current));
      }

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
      logger.error('Failed to stash:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to find song. Please try again.';
      setState((prev) => ({
        ...prev,
        processingStage: 'error',
        processingError: errorMessage
      }));

      // Do NOT auto-close on error to allow retry
      toast.error(errorMessage);
    }
  };
  stashSubmitRef.current = handleStashSubmit;

  const applySavedSong = (newSong: import('./types').Song) => {
    historyRevision.current += 1;
    setState(prev => ({ ...prev, isLoadingHistory: false, history: [newSong, ...prev.history.filter(item => item.id !== newSong.id)],
      currentMatches: [], currentUrl: '', showModal: false }));
    setMoodBoardKey(prev => prev + 1);
  };

  const handleSongSelection = async (song: SongMatch) => {
    const owner = authOwner.current;
    if (!owner) return;
    if (saveInFlight.current || pendingHistory) return;
    saveInFlight.current = true;
    setSaving(true);
    try {
      const result = await api.addTrack(song, extractSource(state.currentUrl), state.defaultPlaylistId);
      if (owner !== authOwner.current) return;
      applySavedSong(result.song);
      toast.success(result.spotifySaved ? `Saved to ${result.playlistName} and Stash.` : 'Saved to Stash. No Spotify match was available.');
    } catch (error) {
      if (owner !== authOwner.current) return;
      if (error instanceof HistorySaveError) {
        setPendingHistory(error);
        setState(prev => ({ ...prev, showModal: false }));
      } else {
        toast.error(error instanceof Error ? error.message : 'Save could not be confirmed.');
      }
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  };

  const retryHistoryOnly = async () => {
    if (!pendingHistory || saveInFlight.current) return;
    const owner = authOwner.current;
    if (!owner || pendingHistory.payload.user_id !== owner) return;
    saveInFlight.current = true;
    setSaving(true);
    setRetryingHistory(true);
    try {
      const saved = await api.saveHistory(pendingHistory.payload);
      if (owner !== authOwner.current) return;
      applySavedSong(saved);
      setPendingHistory(null);
      toast.success('Stash history saved. Spotify was not changed again.');
    } catch {
      toast.error('History is still unconfirmed. Keep this page open and retry when connected.');
    } finally {
      saveInFlight.current = false;
      setSaving(false);
      setRetryingHistory(false);
    }
  };

  const handleDeleteSong = async (id: string) => {
    const owner = authOwner.current;
    if (!owner) return;
    if (deletesInFlight.current.has(id)) return;
    deletesInFlight.current.add(id);
    try {
      // History rows do not yet record their destination. Never guess from today's setting.
      await api.deleteSong(id);
      if (owner !== authOwner.current) return;
      historyRevision.current += 1;
      setState(prev => ({ ...prev, isLoadingHistory: false, history: prev.history.filter(song => song.id !== id) }));
      setMoodBoardKey(prev => prev + 1);
      toast.success('Removed from Stash history. Spotify was not changed.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'History removal could not be confirmed.');
    } finally {
      deletesInFlight.current.delete(id);
    }
  };

  const handleToggleAutoAdd = async (value: boolean) => {
    try {
      await api.updateUserPreferences({ autoAddTopMatch: value });
      setState((prev) => ({ ...prev, autoAddTopMatch: value }));
      toast.success(value ? 'Auto-add enabled' : 'Auto-add disabled');
    } catch (error) {
      logger.error('Failed to update preferences:', error);
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
      logger.error('Failed to update theme:', error);
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
      logger.error('Failed to update playlist:', error);
      toast.error('Failed to update playlist');
    }
  };

  const handleNavigate = useCallback((view: ViewType) => {
    setState((prev) => ({ ...prev, currentView: view }));
  }, []);

  // Expose for settings navigation
  useEffect(() => {
    (window as any).onNavigate = handleNavigate;
    return () => { delete (window as any).onNavigate; };
  }, []);

  const handleBack = useCallback(() => {
    if (state.isLoggedIn) {
      setState((prev) => ({ ...prev, currentView: 'app' }));
    } else {
      setState((prev) => ({ ...prev, currentView: 'landing' }));
    }
  }, [state.isLoggedIn]);

  const extractSourceFromUrl = useCallback(extractSource, []);

  // Suspense fallback for lazy-loaded views
  const viewFallback = <LoadingSkeleton variant="shell" />;

  const renderView = () => {
    switch (state.currentView) {
      case 'privacy':
        return <Suspense fallback={viewFallback}><PrivacyView onBack={handleBack} theme={state.theme} /></Suspense>;
      case 'about':
        return <Suspense fallback={viewFallback}><AboutView onBack={handleBack} theme={state.theme} /></Suspense>;
      case 'help':
        return <Suspense fallback={viewFallback}><HelpView onBack={handleBack} theme={state.theme} /></Suspense>;
      case 'stats':
        return (
          <Suspense fallback={viewFallback}>
            <StatsPageView
              key={moodBoardKey}
              onBack={handleBack}
              theme={state.theme}
              history={state.history}
              userName={state.userName}
              songsThisWeek={songsThisWeek}
              streak={streak}
            />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={viewFallback}>
            <SettingsView
            userName={state.userName}
            userEmail={state.userEmail}
            autoAddTopMatch={state.autoAddTopMatch}
            defaultPlaylistId={state.defaultPlaylistId}
            playlists={state.playlists}
            theme={state.theme}
            hasSpotifyToken={state.hasSpotifyToken}
            onReconnectSpotify={handleConnectSpotify}
            onBack={handleBack}
            onLogout={handleLogout}
            onToggleAutoAdd={handleToggleAutoAdd}
            onPlaylistChange={handlePlaylistChange}
            onToggleTheme={handleToggleTheme}
            onOpenStats={() => handleNavigate('stats')}
          />
          </Suspense>
        );
      case 'app':
        return (
          <AppView
            initialTab={appTab}
            onTabChange={setAppTab}
            userName={state.userName}
            history={state.history}
            songsThisWeek={songsThisWeek}
            streak={streak}
            isLoadingHistory={state.isLoadingHistory}
            historyError={historyError}
            onRefreshHistory={loadHistory}
            autoAddTopMatch={state.autoAddTopMatch}
            defaultPlaylistId={state.defaultPlaylistId}
            playlists={state.playlists}
            theme={state.theme}
            onLogout={handleLogout}
            onStashSubmit={handleStashSubmit}
            onDeleteSong={handleDeleteSong}
            onToggleAutoAdd={handleToggleAutoAdd}
            onToggleTheme={handleToggleTheme}
            onOpenSettings={() => handleNavigate('settings')}
            onOpenStats={() => handleNavigate('stats')}
            pendingSharedUrl={pendingSharedUrl}
          />
        );
      case 'landing':
      default:
        return (
          <LandingView
            onConnect={handleConnectSpotify}
            onCapture={async (url) => {
              queueSharedUrl(url);
              await handleConnectSpotify();
            }}
            theme={state.theme}
            onToggleTheme={handleToggleTheme}
            onNavigate={(page) => handleNavigate(page)}
            pendingSharedUrl={pendingSharedUrl}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <div className="size-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={state.currentView} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reducedMotion ? undefined : { opacity: 0 }} transition={{ duration: 0.16 }}>
            {renderView()}
          </motion.div>
        </AnimatePresence>

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
          onRetry={() => {
            setState((prev) => ({
              ...prev,
              isProcessing: false,
              processingStage: 1,
              processingError: undefined
            }));
            handleStashSubmit(state.currentUrl);
          }}
        />
        {pendingHistory && <aside role="alert" className="fixed bottom-24 left-4 right-4 z-50 rounded-xl border border-border bg-background p-4">
          <p>{pendingHistory.message}</p>
          <button className="min-h-11" disabled={saving} onClick={retryHistoryOnly}>{retryingHistory ? 'Saving history...' : 'Retry Stash history only'}</button>
        </aside>}
        <PWAInstallPrompt />
        <PWARegistration busy={state.isProcessing || saving || !!pendingHistory} />

        <Toaster position="bottom-right" theme={state.theme} />
        </div>
      </MotionConfig>
    </ErrorBoundary>
  );
}
