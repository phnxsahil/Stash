import { useEffect, useMemo, useState } from 'react';
import { Download, Radio, X } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'stash-pwa-prompt-dismissed-at';
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 3; // 3 days
const SHARED_URL_STORAGE_KEY = 'stash-pending-shared-url';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const canShowPrompt = useMemo(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (!dismissedAt) return true;
    return Date.now() - dismissedAt > DISMISS_COOLDOWN_MS;
  }, []);

  useEffect(() => {
    const markInteraction = () => setHasInteracted(true);
    window.addEventListener('pointerdown', markInteraction, { once: true });
    window.addEventListener('keydown', markInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', markInteraction);
      window.removeEventListener('keydown', markInteraction);
    };
  }, []);

  useEffect(() => {
    if (!canShowPrompt) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [canShowPrompt]);

  useEffect(() => {
    if (!deferredPrompt || !hasInteracted) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (new URLSearchParams(window.location.search).get('url')) return;
    if (localStorage.getItem(SHARED_URL_STORAGE_KEY)) return;

    const timer = window.setTimeout(() => {
      setShowPrompt(true);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [deferredPrompt, hasInteracted]);

  useEffect(() => {
    const handleInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
    };

    window.addEventListener('appinstalled', handleInstalled);
    return () => window.removeEventListener('appinstalled', handleInstalled);
  }, []);

  const dismissPrompt = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowPrompt(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
      return;
    }

    dismissPrompt();
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 px-safe pb-safe md:left-auto md:right-6 md:max-w-sm md:px-0">
      <div className="surface-panel bg-gradient-to-br from-card/92 via-card/84 to-accent/24 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Download className="w-4 h-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="beta-chip mb-3">
              <Radio className="h-3.5 w-3.5" />
              Native sharing
            </div>
            <h4 className="text-sm mb-1">Install Stash</h4>
            <p className="text-xs md:text-sm text-muted-foreground mb-3">
              Add Stash to your home screen for faster launch, native sharing, and an app-style mobile shell.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstall} className="h-9 px-4 bg-primary text-primary-foreground hover:opacity-90 outline-focus">
                Install
              </Button>
              <Button onClick={dismissPrompt} variant="outline" className="h-9 px-4 outline-focus">
                Later
              </Button>
            </div>
          </div>

          <Button
            onClick={dismissPrompt}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
