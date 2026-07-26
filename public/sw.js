const CACHE_NAME = 'ebookvala-v2';
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

// Routes that MUST NEVER BE CACHED (Network Only)
const NETWORK_ONLY_PATTERNS = [
  /\/api\/auth\//,
  /\/api\/checkout\//,
  /\/api\/admin\//,
  /\/checkout/,
  /\/admin/,
  /\/dashboard/,
  /\/account/,
  /\/author/,
];

// Service Worker Installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`[SW] Precache skipped for ${asset}:`, err);
          })
        )
      );
    })
  );
});

// Service Worker Activation & Cache Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interception
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, DELETE should always hit network)
  if (request.method !== 'GET') {
    return;
  }

  // 1. Guard against non-HTTP(S) schemes (Brave/Chrome extensions, blob, data)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 2. Guard against third-party origins (Brave Shields tracker/font/analytics blocking)
  if (
    url.hostname !== self.location.hostname &&
    !url.hostname.includes('localhost') &&
    !url.hostname.includes('127.0.0.1')
  ) {
    return;
  }

  // 3. Check Network-Only Patterns (Authenticated, Checkout, Admin, Auth)
  const isNetworkOnly = NETWORK_ONLY_PATTERNS.some((pattern) => pattern.test(url.pathname));
  if (isNetworkOnly) {
    event.respondWith(
      fetch(request).catch(() => {
        if (request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/offline') || Response.error();
        }
        return new Response(
          JSON.stringify({ error: 'Offline. Network connection required for authenticated actions.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // 4. Static Assets (Images, Fonts, Icons, _next/static) -> CacheFirst
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => Response.error());
      })
    );
    return;
  }

  // 5. Reader & Book Content -> StaleWhileRevalidate
  if (url.pathname.startsWith('/reader/') || url.pathname.startsWith('/api/reader/') || url.pathname.startsWith('/books')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse || caches.match('/offline'));

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 6. General HTML Navigation -> NetworkFirst with /offline fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => cached || caches.match('/offline'));
        })
    );
    return;
  }

  // Default StaleWhileRevalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => Response.error())
      );
    })
  );
});
