const V = '__VERSION__';
const FILES = [/*__FILES__*/];

const CACHE = 'gl-' + V;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      const toCache = FILES.length ? FILES : ['./', 'index.html'];
      return Promise.allSettled(toCache.map(u => cache.add(u).catch(() => {})));
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

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // version.json always network
  if (url.pathname.endsWith('version.json')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Navigation: network first
  if (e.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname === '/') {
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match('index.html') || caches.match('./'))
    );
    return;
  }

  // Own files with ?v= : cache first
  if (url.search.includes('v=') || url.pathname.includes('/js/build/') || url.pathname.includes('/css/') || url.pathname.includes('/img/')) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
        if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      }))
    );
    return;
  }

  // Foreign (fonts, jsdelivr): stale-while-revalidate
  if (url.host.includes('fonts.g') || url.host.includes('jsdelivr') || url.host.includes('googleapis')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const fetched = fetch(e.request).then(r => {
          if (r.ok || r.type === 'opaque') caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        }).catch(() => cached);
        return cached || fetched;
      })
    );
    return;
  }
  // else: do not intercept (Supabase etc.)
});
