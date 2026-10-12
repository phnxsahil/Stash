import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function PWARegistration({ busy = false }: { busy?: boolean }) {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const reloadRequested = useRef(false);
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => {
    const onOffline = () => toast.warning('You are offline. Finding and saving songs needs a connection.');
    const onOnline = () => toast.success('Back online.');
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => { window.removeEventListener('offline', onOffline); window.removeEventListener('online', onOnline); };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      navigator.serviceWorker.getRegistrations().then(registrations => Promise.all(registrations.map(item => item.unregister()))).catch(() => null);
      return;
    }
    let disposed = false;
    const cleanup: (() => void)[] = [];
    const onControllerChange = () => {
      // First activation and updates from another tab must not destroy in-flight work.
      if (reloadRequested.current && !busyRef.current) window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    navigator.serviceWorker.register('/sw.js').then(registration => {
      if (disposed) return;
      const detectWaiting = () => { if (registration.waiting && navigator.serviceWorker.controller) setWaiting(registration.waiting); };
      const onUpdate = () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', detectWaiting);
        cleanup.push(() => worker.removeEventListener('statechange', detectWaiting));
      };
      detectWaiting();
      registration.addEventListener('updatefound', onUpdate);
      cleanup.push(() => registration.removeEventListener('updatefound', onUpdate));
      registration.update().catch(() => null);
    }).catch(() => null);
    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      cleanup.forEach(fn => fn());
    };
  }, []);

  if (!waiting || busy) return null;
  return <aside className="fixed left-4 right-4 top-24 z-50 mx-auto max-w-md rounded-2xl border border-border bg-background p-4 shadow-xl" aria-label="Stash update available">
    <p className="font-semibold">A new version is ready</p>
    <p className="mt-1 text-sm text-muted-foreground">Reload when you are ready. Unsaved text will be cleared.</p>
    <button disabled={busy} className="mt-3 min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50" onClick={() => {
      if (busyRef.current) return;
      reloadRequested.current = true;
      waiting.postMessage({ type: 'SKIP_WAITING' });
    }}>Update and reload</button>
    <button className="ml-4 min-h-11 text-sm" onClick={() => setWaiting(null)}>Later</button>
  </aside>;
}
