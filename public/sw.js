// Public shell only. Never cache accounts, auth callbacks, shared links or API data.
const CACHE_NAME = 'stash-public-v8';
const PUBLIC_PATHS = new Set(['/offline.html', '/manifest.json', '/favicon.png', '/logo-512.png', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png']);
const IS_LOCALHOST = ['localhost', '127.0.0.1'].includes(self.location.hostname);

self.addEventListener('install', event => {
  if (IS_LOCALHOST) return;
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll([...PUBLIC_PATHS])));
  // Updates remain waiting until the user chooses a safe reload.
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(name => name.startsWith('stash-') && name !== CACHE_NAME).map(name => caches.delete(name))
  )).then(() => self.clients.claim()));
});

function publicAsset(request, url) {
  return request.method === 'GET' && url.origin === self.location.origin &&
    !url.search && !request.headers.has('Authorization') &&
    (PUBLIC_PATHS.has(url.pathname) || /^\/assets\/[a-zA-Z0-9_-]+\.(js|css|woff2?|png|jpe?g|svg|webp)$/.test(url.pathname));
}

function cacheable(response) {
  const control = response.headers.get('Cache-Control') || '';
  return response.ok && response.type !== 'opaque' && !response.redirected &&
    !/private|no-store/i.test(control) && !(response.headers.get('Vary') || '').includes('*');
}

self.addEventListener('fetch', event => {
  if (IS_LOCALHOST) return;
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('Authorization')) return;
  if (request.mode === 'navigate') {
    // Preserve the address, but never store callback codes or incoming shared URLs.
    event.respondWith(fetch(request).catch(() => caches.match('/offline.html')));
    return;
  }
  if (!publicAsset(request, url)) return;
  event.respondWith(caches.match(request).then(async cached => {
    if (cached) return cached;
    const response = await fetch(request);
    if (cacheable(response)) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
    }
    return response;
  }));
});
