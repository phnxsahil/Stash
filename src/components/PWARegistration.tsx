import { useEffect } from 'react';
import { toast } from 'sonner';

export function PWARegistration() {
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

    const isLocalPreview =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocalPreview) {
      const cleanupLocalServiceWorkers = async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));

          if ('caches' in window) {
            const cacheKeys = await caches.keys();
            await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
          }
        } catch (error) {
          console.error('Failed to clear local service workers: ', error);
        }
      };

      cleanupLocalServiceWorkers();
      return;
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        let hasTriggeredAutoRefresh = false;

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (hasTriggeredAutoRefresh) return;
          hasTriggeredAutoRefresh = true;
          window.location.reload();
        });

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              toast.success('Stash just updated to the latest version.');
              worker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        registration.update().catch(() => null);
      } catch (error) {
        console.error('SW registration failed: ', error);
      }
    };

    register();
  }, []);

  return null;
}
