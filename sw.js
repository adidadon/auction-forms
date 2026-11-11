// Keeps the app on the phone so it opens without reception.
// The page itself: the newest version from the site when there is reception (up to 4 seconds), otherwise the saved copy.
// Other files: the saved copy at once, refreshed in the background.
const CACHE = "auction-forms-v4";
const FILES = ["./", "index.html", "vendor/jsQR.js", "manifest.webmanifest", "icon-180.png", "icon-512.png"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys()
  .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  if (e.request.mode === "navigate") {
    const req = new Request("index.html");
    e.respondWith(caches.open(CACHE).then(async (c) => {
      const net = fetch(req, { cache: "no-store" }).then((r) => { if (r.ok) c.put(req, r.clone()); return r; });
      const slow = new Promise((ok) => setTimeout(ok, 4000));
      const r = await Promise.race([net.catch(() => null), slow]);
      return r || (await c.match(req)) || net;
    }));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
