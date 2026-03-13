// Service Worker - Punto POS Pro
// STRATEGY: Network First for ALL requests.
// This avoids stale CSS/JS being served after Next.js rebuilds assets.

const CACHE_NAME = 'punto-pos-v4'; // Bumped version to v4 to force deep refresh

self.addEventListener('install', (event) => {
  // Skip waiting so new SW activates immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up ALL old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip Next.js internal hot-reload requests
  if (request.url.includes('_next/webpack-hmr') || request.url.includes('__nextjs')) return;

  // Skip Supabase API calls - always network
  if (request.url.includes('supabase.co')) return;

  event.respondWith(
    // NETWORK FIRST strategy: always try to get fresh content from the network
    fetch(request)
      .then((networkResponse) => {
        // Only cache successful responses for offline fallback
        if (networkResponse && networkResponse.status === 200 && request.mode === 'navigate') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline fallback: try cache only for navigation (HTML pages)
        if (request.mode === 'navigate') {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/');
          });
        }
        // For other requests offline, just fail gracefully
        return new Response('Offline', { status: 503 });
      })
  );
});
