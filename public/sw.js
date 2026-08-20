const CACHE_NAME = 'nutrigrade-ai-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/hall-of-shame',
  '/pantry',
];

// Install event — precache static application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event — clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event — network-first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and API calls
  if (event.request.method !== 'GET') return;

  // Let API requests pass to network or client-side IndexedDB fallback
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        // Offline fallback from cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        
        // If navigating to a page offline, return cached homepage shell
        if (event.request.mode === 'navigate') {
          return (await caches.match('/')) || Response.error();
        }

        return Response.error();
      })
  );
});
