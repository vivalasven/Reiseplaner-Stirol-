// Service Worker für den Südtirol Reiseplaner.
// Cacht die App-Shell beim ersten Öffnen, damit sie danach auch ohne
// Internetverbindung (z. B. unterwegs im Auto) startet.
// Muss im selben Verzeichnis wie die HTML-Datei, das Manifest und die Icons liegen.

const CACHE_NAME = 'suedtirol-reiseplaner-v70-9';
const CORE_FILES = [
  './',
  './Südtirol_Reiseplaner.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_FILES))
      .catch(() => {/* einzelne Datei evtl. nicht vorhanden – App bleibt trotzdem nutzbar */})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Cache-first für die App-Shell, Netzwerk als Fallback (und umgekehrt aktualisiert im Hintergrund).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
