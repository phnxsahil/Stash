import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'framer-motion';
import { LandingView } from './components/LandingView';
import { AppView } from './components/AppView';
import type { SavedCapture } from './components/CapturePanel';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { PWARegistration } from './components/PWARegistration';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StashLaunch } from './components/stitch/StashLaunch';
import LoadingSkeleton from './components/LoadingSkeleton';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { api } from './lib/api';
import { createOutbox, type OutboxEntry, type OutboxOperation } from './lib/outbox';
import { DEMO_MODE, buildDemoHistory } from './lib/demo';
import { supabase } from './lib/supabase';
import { logger } from './lib/logger';
import { calculateStreak } from './lib/analytics';
import type { AppState, ViewType, Song, SongMatch, Theme } from './types';

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

  // Force mood board refresh when songs change
  const [moodBoardKey, setMoodBoardKey] = useState(0);
  const [savedCapture, setSavedCapture] = useState<SavedCapture | null>(null);

  const [pendingSharedUrl, setPendingSharedUrl] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState('');
  const outboxRef = useRef(createOutbox());
  const [pendingSongIds, setPendingSongIds] = useState<Set<string>>(new Set());
  const [pendingOpsCount, setPendingOpsCount] = useState(0);
  const [failedOps, setFailedOps] = useState<OutboxEntry[]>([]);
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

  // Demo mode: skip auth, load sample history (clearly labelled in the UI).
  useEffect(() => {
    if (!DEMO_MODE) return;
    outboxRef.current.setAccount('demo@stash.local');
    setState((prev) => ({
      ...prev,
      isLoggedIn: true,
      userName: 'Demo',
      userEmail: 'demo@stash.local',
      currentView: 'app',
      history: buildDemoHistory(),
      playlists: [{ id: 'stash_playlist', name: 'Stash playlist' }],
      defaultPlaylistId: 'stash_playlist',
      hasSpotifyToken: false,
    }));
  }, []);

  // Handle Auth Session
  useEffect(() => {
    if (DEMO_MODE) return;
    const checkSession = async () => {
      logger.log('🔐 Checking auth session...');
      const { data: { session } } = await supabase.auth.getSession();
      logger.log('🔐 Session:', session ? 'Found' : 'Not found');
      if (session) {
        handleAuthSuccess(session.user);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.log('🔐 Auth state changed:', event, session ? 'Session present' : 'No session');
        if (session) {
          handleAuthSuccess(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = async (user: any) => {
    logger.log('✅ Auth success! User:', user.email);
    outboxRef.current.setAccount(user.email || user.id || 'anonymous');
    const token = await api.getSpotifyToken();

    setState((prev) => ({
      ...prev,
      isLoggedIn: true,
      hasSpotifyToken: !!token,
      userEmail: user.email || '',
      userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      currentView: 'app',
    }));
    logger.log('✅ Redirecting to dashboard...');

    try {
      // Parallelize for speed and decoupling
      logger.log('🔄 Fetching user data ecosystem...');
      const results = await Promise.allSettled([
        api.getUserPlaylists(),
        loadHistory()
      ]);

      const [playlistsRes] = results;
      if (playlistsRes.status === 'fulfilled') {
        setState((prev) => ({ ...prev, playlists: playlistsRes.value }));
      } else {
        logger.warn("Auth: Playlists failed to load (Token might be expired):", playlistsRes.reason);
      }
    } catch (err) {
      logger.error("Auth: Critical Failure in data ecosystem:", err);
    }
  };

  const streak = useMemo(() => calculateStreak(state.history), [state.history]);

  const songsThisWeek = useMemo(() => {
    const now = Date.now();
    return state.history.filter(s => {
      const date = new Date(s.created_at || '');
      return now - date.getTime() < SEVEN_DAYS_MS;
    }).length;
  }, [state.history]);

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
    const pageBackground = getComputedStyle(document.documentElement).getPropertyValue('--st-surface').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', pageBackground);
  }, [state.theme]);

  const loadHistory = async () => {
    if (DEMO_MODE) { setState((prev) => ({ ...prev, isLoadingHistory: false })); return; }
    setHistoryError('');
    setState((prev) => ({ ...prev, isLoadingHistory: true }));
    try {
      const history = await api.getUserHistory();
      setState((prev) => ({ ...prev, history, isLoadingHistory: false }));
    } catch (error) {
      logger.error('Failed to load history:', error);
      setHistoryError('Your songs are safe. Check your connection and try again.');
      setState((prev) => ({ ...prev, isLoadingHistory: false }));
      toast.error('Failed to load history');
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
      outboxRef.current.setAccount('anonymous');
      setFailedOps([]);
      setHistoryError('');
      setAppTab('capture');
      setState(createDefaultState(state.theme));
      toast.success('Logged out successfully');
    } catch (error) {
      logger.error('Failed to logout:', error);
      toast.error('Failed to logout');
    }
  }, [state.theme]);

  const refreshPendingEchoes = async () => {
    const entries = await outboxRef.current.pending();
    setPendingOpsCount(entries.length);
    setPendingSongIds(new Set(
      entries.filter((e) => e.op.kind === 'save').map((e) => (e.op as { kind: 'save'; song: Song }).song.id)
    ));
    setFailedOps(await outboxRef.current.failed());
  };

  const handleRetryFailedOp = async (id: string) => {
    await outboxRef.current.retry(id);
    await refreshPendingEchoes();
    toast.message('Queued for another sync attempt.');
    void syncOutbox();
  };

  const handleCancelFailedOp = async (id: string) => {
    await outboxRef.current.cancel(id);
    await refreshPendingEchoes();
    toast.message('Removed from the sync queue.');
  };

  const syncInFlightRef = useRef(false);
  const syncOutbox = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    if (syncInFlightRef.current) return; // one replay at a time - no interleaved double-apply
    syncInFlightRef.current = true;
    try {
      const isDuplicate = async (op: OutboxOperation): Promise<boolean> => {
        // Ask the server directly (the loaded history list can be stale or
        // incomplete). If the check itself fails we throw, so the entry is
        // retried later rather than applied blindly.
        if (op.kind === 'save') {
          const { found } = await api.findHistoryEntry({
            song: op.song.song,
            artist: op.song.artist,
            spotifyUrl: op.song.spotify_url,
          });
          return found;
        }
        const { found } = await api.findHistoryEntry({ id: op.songId });
        return !found; // delete already reflected when the row is gone
      };
      const { synced, skippedDuplicates, failed, authNeeded } = await outboxRef.current.process(async (op: OutboxOperation) => {
        if (op.kind === 'save') {
          const { created_at: _ts, source, ...match } = op.song;
          await api.addTrack(match, source || 'Web', op.playlistId);
        } else {
          await api.deleteSong(op.songId);
        }
      }, { isDuplicate });
      if (authNeeded) {
        toast.error('Your session expired. Sign in again and your queued changes will sync - nothing was lost.');
      }
      if (synced > 0) {
        toast.success(synced === 1 ? 'Back online. 1 song synced.' : `Back online. ${synced} songs synced.`);
        await loadHistory();
      }
      if (skippedDuplicates > 0) {
        toast.message(skippedDuplicates === 1 ? '1 queued song was already saved - skipped the duplicate.' : `${skippedDuplicates} queued songs were already saved - skipped the duplicates.`);
      }
      const permanent = failed.filter((f) => f.status === 'failed');
      const retrying = failed.filter((f) => f.status === 'pending');
      if (permanent.length > 0) {
        toast.error(permanent.length === 1
          ? "A queued change can't sync (it was rejected, not a network issue). It's kept below - retry it or discard it."
          : `${permanent.length} queued changes can't sync (rejected, not a network issue). They're kept below - retry or discard them.`);
      } else if (retrying.length > 0) {
        toast.error("Couldn't reach Stash. Queued changes will retry automatically.");
      }
      await refreshPendingEchoes();
    } catch (err) {
      logger.error('Outbox sync failed:', err);
    } finally {
      syncInFlightRef.current = false;
    }
  };

  useEffect(() => {
    refreshPendingEchoes();
    const onOnline = () => { if (state.isLoggedIn) syncOutbox(); };
    window.addEventListener('online', onOnline);
    const interval = window.setInterval(() => { if (state.isLoggedIn) syncOutbox(); }, 45000);
    return () => {
      window.removeEventListener('online', onOnline);
      window.clearInterval(interval);
    };
  }, [state.isLoggedIn]);

  const handleStashSubmit = async (url: string, options?: StashSubmitOptions) => {
    if (DEMO_MODE) {
      setState((prev) => ({
        ...prev,
        currentUrl: url,
        isProcessing: true,
        processingStage: 2,
        processingError: undefined,
      }));
      window.setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          processingStage: 'error',
          processingError: 'Demo mode: recognition runs on the live app. Connect Spotify on the real Stash to stash this song.',
        }));
      }, 1400);
      return;
    }
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
          await handleSongSelection(matches[0], url);
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

  const handleSongSelection = async (song: SongMatch, sourceUrl = state.currentUrl) => {
    setState((prev) => ({ ...prev, showModal: false }));
    const source = extractSource(sourceUrl);
    try {
      const { song: newSong } = await api.addTrack(song, source);
      setSavedCapture(previous => ({ url: sourceUrl, version: (previous?.version || 0) + 1 }));

      setState((prev) => ({
        ...prev,
        history: [newSong, ...prev.history],
        currentMatches: [],
        currentUrl: '',
      }));

      // Refresh mood board with new song
      setMoodBoardKey(prev => prev + 1);

      toast.success(`"${song.song}" added to your library!`);
    } catch (error) {
      logger.error('Failed to add track:', error);
      const offline = typeof navigator !== 'undefined' && !navigator.onLine;
      const networkish = error instanceof Error && /failed to fetch|networkerror|load failed|timed? ?out/i.test(error.message);
      if (offline || networkish) {
        const localSong: Song = {
          id: `local-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now()}`,
          song: song.song,
          artist: song.artist,
          source,
          album_art_url: song.album_art_url,
          preview_url: song.preview_url,
          spotify_url: song.spotify_url,
          created_at: new Date().toISOString(),
        };
        await outboxRef.current.enqueue({ kind: 'save', song: localSong });
        setState((prev) => ({
          ...prev,
          history: [localSong, ...prev.history],
          currentMatches: [],
          currentUrl: '',
        }));
        await refreshPendingEchoes();
        toast('Saved offline. It will sync to Spotify when you are back online.', { icon: '📥' });
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to add song to library');
      }
    }
  };

  const handleDeleteSong = async (id: string) => {
    try {
      // Find the song to get its Spotify track ID
      const song = state.history.find(s => s.id === id);

      // Remove from Spotify first (if we have the track info)
      if (song?.spotify_url) {
        const trackId = song.spotify_url.split('/').pop()?.split('?')[0];
        if (trackId) {
          await api.removeFromSpotify(trackId, state.defaultPlaylistId);
        }
      }

      // Then remove from Stash history
      await api.deleteSong(id);
      setState((prev) => ({
        ...prev,
        history: prev.history.filter((song) => song.id !== id),
      }));

      // Refresh mood board after deletion
      setMoodBoardKey(prev => prev + 1);

      toast.success('Song removed from Spotify and history');
    } catch (error) {
      logger.error('Failed to delete song:', error);
      const offline = typeof navigator !== 'undefined' && !navigator.onLine;
      const networkish = error instanceof Error && /failed to fetch|networkerror|load failed|timed? ?out/i.test(error.message);
      const song = state.history.find(s => s.id === id);
      if ((offline || networkish) && song) {
        await outboxRef.current.enqueue({ kind: 'delete', songId: id, spotifyTrackId: song.spotify_url?.split('/').pop()?.split('?')[0] });
        setState((prev) => ({ ...prev, history: prev.history.filter((sg) => sg.id !== id) }));
        await refreshPendingEchoes();
        toast('Delete queued. It will sync when you are back online.', { icon: '📥' });
        return;
      }
      toast.error(error instanceof Error ? error.message : 'Failed to delete song');
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
              playlists={state.playlists}
              defaultPlaylistId={state.defaultPlaylistId}
              hasSpotifyToken={state.hasSpotifyToken}
              onToggleTheme={handleToggleTheme}
              onLogout={handleLogout}
              onNavigate={destination => {
                if (destination === 'capture' || destination === 'library') { setAppTab(destination); handleNavigate('app'); }
                else handleNavigate(destination);
              }}
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
            onNavigate={destination => {
              if (destination === 'capture' || destination === 'library') { setAppTab(destination); handleNavigate('app'); }
              else handleNavigate(destination);
            }}
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
            hasSpotifyToken={state.hasSpotifyToken}
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
            savedCapture={savedCapture}
            pendingSongIds={pendingSongIds}
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
        {failedOps.length > 0 && (
          <div className="st-failed-ops" role="alert">
            <div className="st-failed-ops-text">
              {failedOps.length === 1
                ? `Couldn't sync "${failedOps[0].op.kind === 'save' ? (failedOps[0].op as { kind: 'save'; song: Song }).song.song : 'a delete'}". Nothing was lost.`
                : `${failedOps.length} queued changes couldn't sync. Nothing was lost.`}
            </div>
            <div className="st-failed-ops-actions">
              <button type="button" onClick={() => void handleRetryFailedOp(failedOps[0].id)}>Retry</button>
              <button type="button" onClick={() => void handleCancelFailedOp(failedOps[0].id)}>Discard</button>
            </div>
          </div>
        )}

        <PWAInstallPrompt />
        <PWARegistration />
        <StashLaunch />

        <Toaster position="bottom-right" theme={state.theme} />
        </div>
      </MotionConfig>
    </ErrorBoundary>
  );
              }
