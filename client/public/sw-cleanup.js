// Only obsolete API response caches are removed; the offline command queue is
// IndexedDB and must never be deleted by a service-worker upgrade.
self.addEventListener('activate', event => {
  event.waitUntil(caches.delete('api-cache'));
});
