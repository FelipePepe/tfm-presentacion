const CACHE_NAME = 'tfm-presentacion-v1.6.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/custom.css',
  './vendor/reveal/dist/reveal.js',
  './vendor/reveal/dist/reveal.css',
  './vendor/reveal/dist/reset.css',
  './vendor/reveal/dist/theme/black.css',
  './vendor/reveal/plugin/notes/notes.js',
  './vendor/reveal/plugin/markdown/markdown.js',
  './vendor/reveal/plugin/highlight/highlight.js',
  './vendor/reveal/plugin/highlight/monokai.css',
  './vendor/reveal/plugin/zoom/zoom.js',
  './assets/images/big-school-logo.svg',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Clone the request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
