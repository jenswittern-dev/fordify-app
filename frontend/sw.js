// fordify Service Worker
const CACHE = "fordify-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/css/app.css",
  "/css/bootstrap.min.css",
  "/js/app.js",
  "/js/bootstrap.bundle.min.js",
  "/js/decimal.min.js",
  "/js/data.js",
  "/js/zinsen.js",
  "/js/rvg.js",
  "/js/verrechnung.js",
  "/js/zusammenfassung.js",
  "/img/logo.svg",
  "/img/logo-wordmark.svg",
  "/data/basiszinssaetze.json",
  "/data/rvg_tabelle.json",
  "/fonts/inter-latin.woff2",
  "/fonts/inter-latin-ext.woff2",
  "/fonts/jetbrains-mono-latin.woff2",
  "/fonts/jetbrains-mono-latin-ext.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
