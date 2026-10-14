const CACHE = "txc-v57";
const TILES = "txc-tiles-v1";
const MAX_TILES = 500;
const NETWORK_TIMEOUT = 3500;
const ASSETS = ["./", "./index.html", "./manifest.json", "./logo.jpg", "./icon-192.png", "./icon-512.png", "./pdf.min.js", "./pdf.worker.min.js", "./nav-enhancements.css", "./nav-enhancements.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(ASSETS.map((a) => c.add(a)))));
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  const keep = [CACHE, TILES];
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

function timeout(ms) { return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)); }

async function trimTiles(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_TILES) await Promise.all(keys.slice(0, keys.length - MAX_TILES).map((k) => cache.delete(k)));
}

async function tileResponse(req) {
  const cache = await caches.open(TILES);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) { cache.put(req, res.clone()); if (Math.random() < 0.05) trimTiles(cache); }
    return res;
  } catch (err) { return Response.error(); }
}

async function injectNavAssets(response) {
  try {
    const text = await response.text();
    if (text.includes('data-txc-nav-enhancements')) return new Response(text, {status: response.status, statusText: response.statusText, headers: response.headers});
    const css = '<link data-txc-nav-enhancements rel="stylesheet" href="./nav-enhancements.css">';
    const js = '<script data-txc-nav-enhancements src="./nav-enhancements.js"></script>';
    const html = text.replace('</head>', css + '</head>').replace('</body>', js + '</body>');
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'text/html; charset=utf-8');
    return new Response(html, {status: response.status, statusText: response.statusText, headers});
  } catch (e) { return response; }
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  if (url.hostname === "tile.openstreetmap.org") {
    e.respondWith(tileResponse(e.request));
    return;
  }

  if (e.request.mode === "navigate" || url.pathname.endsWith(".html")) {
    e.respondWith(
      Promise.race([fetch(e.request.url, { cache: "no-cache" }), timeout(NETWORK_TIMEOUT)])
        .then(async (r) => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return injectNavAssets(r);
        })
        .catch(async () => {
          const r = await caches.match(e.request, { ignoreSearch: true }) || await caches.match("./index.html");
          return r ? injectNavAssets(r) : r;
        })
    );
    return;
  }

  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
    if (res.ok && url.origin === self.location.origin) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
    }
    return res;
  }).catch(() => r)));
});
