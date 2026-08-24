const CACHE_VERSION = 'v4'; // bump this every deploy
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

// Stale-while-revalidate: show the cached version instantly (no waiting on
// the network, so the app opens right away instead of freezing on the
// launch icon), while fetching a fresh copy in the background to update the
// cache for the *next* launch. First-ever load (nothing cached yet) still
// waits on the network, same as before.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(() => cachedResponse);
        return cachedResponse || fetchPromise;
      })
    )
  );
});
