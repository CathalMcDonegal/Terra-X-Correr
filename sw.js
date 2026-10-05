const CACHE = "txc-v55";
const TILES = "txc-tiles-v1";
const MAX_TILES = 500;
const NETWORK_TIMEOUT = 3500;
const ASSETS = ["./", "./index.html", "./manifest.json", "./logo.jpg", "./icon-192.png", "./icon-512.png", "./pdf.min.js", "./pdf.worker.min.js"];

self.addEventListener("install", (e) => {
  // La nova versió queda esperant fins que l'usuari prem "Actualitzar".
  // Es desa cada recurs per separat: si un falla, la resta es guarden igualment.
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(ASSETS.map((a) => c.add(a)))));
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  const keep = [CACHE, TILES];
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

async function trimTiles(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_TILES) await Promise.all(keys.slice(0, keys.length - MAX_TILES).map((k) => cache.delete(k)));
}

// Tessel·les del mapa: primer la memòria cau, després la xarxa.
async function tileResponse(req) {
  const cache = await caches.open(TILES);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) {
      cache.put(req, res.clone());
      if (Math.random() < 0.05) trimTiles(cache);
    }
    return res;
  } catch (err) {
    return Response.error();
  }
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  if (url.hostname === "tile.openstreetmap.org") {
    e.respondWith(tileResponse(e.request));
    return;
  }

  // HTML: xarxa primer, però amb límit de temps perquè amb mala cobertura
  // no s'esperi indefinidament abans de caure a la còpia local.
  if (e.request.mode === "navigate" || url.pathname.endsWith(".html")) {
    e.respondWith(
      Promise.race([fetch(e.request.url, { cache: "no-cache" }), timeout(NETWORK_TIMEOUT)])
        .then((r) => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return r;
        })
        .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
      if (res.ok && url.origin === self.location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => r))
  );
});
