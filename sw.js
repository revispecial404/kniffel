// Minimaler Service Worker - notwendig für die PWA-Installierbarkeit.
// Kann später erweitert werden, z.B. für Offline-Caching.

const CACHE_NAME = 'kniffel-cache-v1';
const URLS_TO_CACHE = [
  '/', // Wichtig, um die Startseite zu cachen
  '/index.html', // Explizit die HTML-Datei
  // Füge hier Pfade zu CSS, JS (falls ausgelagert), Icons hinzu, wenn du Offline-Fähigkeit möchtest
  // z.B. '/styles.css', '/script.js', '/icons/icon-192x192.png'
];

// Installation: Öffnet den Cache und fügt die Basis-Assets hinzu
self.addEventListener('install', event => {
  console.log('Service Worker: Installiert');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache geöffnet');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => {
         console.error('Service Worker: Fehler beim Cachen während der Installation:', err);
      })
  );
});

// Aktivierung: Bereinigt alte Caches (optional, gut für Updates)
self.addEventListener('activate', event => {
  console.log('Service Worker: Aktiviert');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Alter Cache wird gelöscht:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Kontrolliert sofort offene Clients
});

// Fetch: Fängt Netzwerkanfragen ab (Cache-First Strategie)
self.addEventListener('fetch', event => {
  // Nur GET-Anfragen behandeln
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request) // Prüft, ob die Anfrage im Cache ist
      .then(response => {
        if (response) {
          //console.log('Service Worker: Aus Cache geladen:', event.request.url);
          return response; // Aus Cache zurückgeben
        }
        //console.log('Service Worker: Vom Netzwerk geladen:', event.request.url);
        return fetch(event.request) // Nicht im Cache -> Vom Netzwerk holen
                 .then(networkResponse => {
                    // Optional: Hier könnte man die Antwort auch dynamisch zum Cache hinzufügen
                    return networkResponse;
                 })
                 .catch(error => {
                    console.error('Service Worker: Fehler beim Fetchen:', error);
                    // Optional: Hier könnte eine Offline-Fallback-Seite zurückgegeben werden
                 });
      })
  );
});

