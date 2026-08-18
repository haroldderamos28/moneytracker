const CACHE_VERSION = 'v3'; // bump this every deploy
const CACHE_NAME = `financial-freedom-${CACHE_VERSION}`;

self.addEventListener('install', (event) => {
  self.skipWaiting(); // don't wait for old tabs to close
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)) // nuke old caches
      )
    ).then(() => self.clients.claim()) // take control of open pages now
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)) // offline fallback only
  );
});
