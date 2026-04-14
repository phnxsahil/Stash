const CACHE_VERSION = 'v7';
const STATIC_CACHE = `stash-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `stash-runtime-${CACHE_VERSION}`;
const IS_LOCALHOST =
  self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

const PRECACHE_ASSETS = ['/', '/index.html', '/manifest.json', '/favicon.png', '/logo-512.png', '/offline.html'];

const NETWORK_ONLY_PATTERNS = [/\/api\//i, /\/auth\/v1\//i, /\/rest\/v1\//i, /\/recognize$/i, /\/save_track$/i, /\/remove_track$/i];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  if (IS_LOCALHOST) {
    event.waitUntil(self.skipWaiting());
    return;
  }

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  if (IS_LOCALHOST) {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
        .then(() => self.registration.unregister())
    );
    return;
  }

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
              return caches.delete(cacheName);
            }
            return Promise.resolve(false);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

const isNetworkOnlyRequest = (request) => NETWORK_ONLY_PATTERNS.some((pattern) => pattern.test(request.url));

const isStaticAssetRequest = (request) =>
  request.destination === 'style' ||
  request.destination === 'script' ||
  request.destination === 'font' ||
  request.destination === 'image' ||
  request.destination === 'manifest';

self.addEventListener('fetch', (event) => {
  if (IS_LOCALHOST) return;

  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (isNetworkOnlyRequest(request)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;
          return caches.match('/offline.html');
        })
    );
    return;
  }

  if (isStaticAssetRequest(request)) {
    event.respondWith(
      caches.match(request).then(async (cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        } catch {
          return Response.error();
        }
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      return cached || Response.error();
    })
  );
});
