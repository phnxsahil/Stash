const RELEASE_ID = '__BUILD_ID__';
const CACHE_VERSION = RELEASE_ID.startsWith('__') ? 'dev' : RELEASE_ID;
const STATIC_CACHE = `stash-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `stash-runtime-${CACHE_VERSION}`;

const DEFAULT_PRECACHE_ASSETS = ['/', '/index.html', '/manifest.json', '/favicon.png', '/logo-512.png', '/offline.html', '/stash-logo.svg', '/fonts/plus-jakarta-sans.woff2', '/fonts/material-symbols-outlined.woff2'];
const PRECACHE_MANIFEST_JSON = '__PRECACHE_MANIFEST_JSON__';
const PRECACHE_ASSETS = PRECACHE_MANIFEST_JSON.startsWith('[')
  ? JSON.parse(PRECACHE_MANIFEST_JSON)
  : DEFAULT_PRECACHE_ASSETS;

const NETWORK_ONLY_PATTERNS = [/\/api\//i, /\/auth\/v1\//i, /\/rest\/v1\//i, /\/recognize$/i, /\/save_track$/i, /\/remove_track$/i];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if ((cacheName.startsWith('stash-static-') || cacheName.startsWith('stash-runtime-')) && cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
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
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (isNetworkOnlyRequest(request)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cachedShell = await caches.match('/index.html') || await caches.match(request);
      const refreshShell = fetch(request).then((response) => {
        if (!response.ok) return null;
        const responseClone = response.clone();
        return caches.open(RUNTIME_CACHE).then((cache) => cache.put('/index.html', responseClone)).then(() => response);
      }).catch(() => null);
      if (cachedShell) {
        event.waitUntil(refreshShell);
        return cachedShell;
      }
      const networkResponse = await refreshShell;
      return networkResponse || await caches.match('/offline.html');
    })());
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
