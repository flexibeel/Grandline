// Service Worker: macht das Spiel offline spielbar (Seite, Skripte, Bilder bleiben zwischengespeichert).
// Version und Dateiliste trägt tools/bump-version.py beim Live-Gang ein. Im Zweig stehen Platzhalter,
// dann merkt sich der Worker nur ./ und index.html. NICHT von Hand eintragen.
const V = '2026-10-25a';
const FILES = [/*FILES*/"./","index.html","css/style.min.css?v=2026-10-25a","js/build/core.min.js?v=2026-10-25a","js/build/en.min.js?v=2026-10-25a","js/build/tail.min.js?v=2026-10-25a","manifest.webmanifest","legal.html","img/apple-touch-icon.png","img/icon-192.png","img/icon-512.png","img/icon-maskable.png","img/og-launch.png"/*END*/];

const CACHE = 'gl-' + V;
const SAME = self.location.origin;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      const list = FILES.length ? FILES : ['./', 'index.html'];
      // Einzeln und am HTTP-Zwischenspeicher vorbei: eine fehlende Datei bricht die Installation nicht ab
      return Promise.allSettled(list.map(u => cache.add(new Request(u, { cache: 'reload' }))));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith('gl-') && k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

const keep = r => r && (r.status === 200 || r.type === 'opaque');

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!url.protocol.startsWith('http')) return;
  const own = url.origin === SAME;

  // Versions-Check: immer Netz, nie aus dem Zwischenspeicher (ohne Netz scheitert er still)
  if (own && url.pathname.endsWith('version.json')) {
    e.respondWith(fetch(req).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Seiten: Netz zuerst. Die Spielseite (index.html oder nur der Ordner, auch mit ?welt=… oder ?v=…) wird gemerkt
  // und ohne Netz ausgeliefert. Andere Seiten (legal.html) werden nur aus der Liste ersatzweise geholt.
  if (own && req.mode === 'navigate') {
    const game = url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
    e.respondWith(
      fetch(req).then(r => {
        if (game && keep(r)) { const c = r.clone(); caches.open(CACHE).then(cache => cache.put('index.html', c)); }
        return r;
      }).catch(() => game
        ? caches.match('index.html', { ignoreSearch: true }).then(r => r || caches.match('./', { ignoreSearch: true }))
        : caches.match(req, { ignoreSearch: true }))
    );
    return;
  }

  // Eigene Dateien (Bündel und Stil mit ?v=, Bilder): Zwischenspeicher zuerst, sonst Netz und merken
  if (own && (url.search.includes('v=') || url.pathname.includes('/js/build/') || url.pathname.includes('/css/') || url.pathname.includes('/img/'))) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(r => {
        if (keep(r)) { const c = r.clone(); caches.open(CACHE).then(cache => cache.put(req, c)); }
        return r;
      }))
    );
    return;
  }

  // Fremdes (Supabase-Skript über jsDelivr, Google Fonts): aus dem Zwischenspeicher, im Hintergrund auffrischen
  if (!own && (url.host === 'cdn.jsdelivr.net' || url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com')) {
    e.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(r => {
          if (keep(r)) { const c = r.clone(); caches.open(CACHE).then(cache => cache.put(req, c)); }
          return r;
        }).catch(() => hit || Response.error());
        return hit || net;
      })
    );
    return;
  }
  // Alles andere (Supabase-Projekt: Konto, Rangliste, Duelle, Realtime): nicht anfassen
});
