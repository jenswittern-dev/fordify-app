// fordify Service Worker
const IS_STAGING_SW = self.location.hostname.includes('staging') ||
                      self.location.hostname === 'localhost' ||
                      self.location.hostname === '127.0.0.1';
const CACHE = IS_STAGING_SW ? "fordify-staging-v10" : "fordify-v56";
const ASSETS = [
  "/",
  "/index.html",
  "/forderungsaufstellung.html",
  "/zinsrechner.html",
  "/rvg-rechner.html",
  "/gerichtskostenrechner.html",
  "/preise.html",
  "/agb.html",
  "/css/app.css",
  "/css/themes.css",
  "/css/bootstrap.min.css",
  "/css/rechner.css",
  "/js/app.js",
  "/js/bootstrap.bundle.min.js",
  "/js/decimal.min.js",
  "/js/config.js",
  "/js/data.js",
  "/js/zinsen.js",
  "/js/rvg.js",
  "/js/verrechnung.js",
  "/js/zusammenfassung.js",
  "/js/rechner-zins.js",
  "/js/rechner-rvg.js",
  "/js/rechner-gkg.js",
  "/img/logo.svg",
  "/img/logo-dark.svg",
  "/img/logo-clean.svg",
  "/img/logo-wordmark.svg",
  "/img/og-image.png",
  "/llms.txt",
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
