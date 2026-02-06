import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Hide for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white mb-1">Install Stash</h4>
            <p className="text-gray-400 text-sm mb-3">
              Add to your home screen for quick access
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                className="bg-[#1DB954] hover:bg-[#1ed760] text-black flex-1"
              >
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                Not now
              </Button>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="icon"
            className="flex-shrink-0 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
