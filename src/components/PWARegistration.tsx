import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

export function PWARegistration() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const lastUpdateCheckRef = useRef(0);
  const updateRequestedRef = useRef(false);

  const checkForUpdate = useCallback(async () => {
    const registration = registrationRef.current;
    const now = Date.now();
    if (!registration || now - lastUpdateCheckRef.current < 60_000) return;
    lastUpdateCheckRef.current = now;
    try {
      await registration.update();
      if (registration.waiting) setWaitingWorker(registration.waiting);
    } catch {
      // A transient network failure should not interrupt the app.
    }
  }, []);

  useEffect(() => {
    const onOffline = () => toast.warning('You are offline. Stash will use cached screens where possible.');
    const onOnline = () => toast.success('Back online.');

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const isLocalPreview = import.meta.env.DEV && (
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    );

    if (isLocalPreview) {
      const cleanupLocalServiceWorkers = async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations
            .filter((registration) => {
              const scriptUrl = registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL;
              return scriptUrl ? new URL(scriptUrl).pathname === '/sw.js' : false;
            })
            .map((registration) => registration.unregister()));

          if ('caches' in window) {
            const cacheKeys = await caches.keys();
            await Promise.all(cacheKeys
              .filter((cacheKey) => cacheKey.startsWith('stash-static-') || cacheKey.startsWith('stash-runtime-'))
              .map((cacheKey) => caches.delete(cacheKey)));
          }
        } catch (error) {
          console.error('Failed to clear local service workers: ', error);
        }
      };

      cleanupLocalServiceWorkers();
      return;
    }

    let disposed = false;
    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        if (disposed) return;
        registrationRef.current = registration;

        const setWaiting = (worker: ServiceWorker | null) => {
          if (worker && navigator.serviceWorker.controller) setWaitingWorker(worker);
        };

        setWaiting(registration.waiting);

        const onControllerChange = () => {
          if (!updateRequestedRef.current) return;
          updateRequestedRef.current = false;
          window.location.reload();
        };
        const onVisibilityChange = () => {
          if (document.visibilityState === 'visible') void checkForUpdate();
        };
        const onOnline = () => void checkForUpdate();

        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('online', onOnline);

        const onUpdateFound = () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaiting(worker);
            }
          });
        };
        registration.addEventListener('updatefound', onUpdateFound);

        await checkForUpdate();

        const dispose = () => {
          navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
          document.removeEventListener('visibilitychange', onVisibilityChange);
          window.removeEventListener('online', onOnline);
          registration.removeEventListener('updatefound', onUpdateFound);
        };
        if (disposed) dispose();
        return dispose;
      } catch (error) {
        console.error('SW registration failed: ', error);
      }
    };

    let cleanup: (() => void) | undefined;
    void register().then((dispose) => { cleanup = dispose; });
    return () => {
      disposed = true;
      cleanup?.();
      registrationRef.current = null;
    };
  }, [checkForUpdate]);

  const applyUpdate = () => {
    if (!waitingWorker) return;
    setIsUpdating(true);
    updateRequestedRef.current = true;
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  };

  return waitingWorker ? (
    <div className="st-pwa-update" role="status">
      <div>
        <strong>Stash has an update</strong>
        <span>Refresh when you’re ready to use the latest version.</span>
      </div>
      <button type="button" onClick={applyUpdate} disabled={isUpdating}>
        <RefreshCw size={16} aria-hidden="true" />
        {isUpdating ? 'Updating…' : 'Update'}
      </button>
    </div>
  ) : null;
}
