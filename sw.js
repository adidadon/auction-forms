// Keeps the app on the phone so it opens without reception. Answers from the saved copy at once and
// refreshes the copy in the background, so a new version shows up the next time the app is opened.
const CACHE = "auction-forms-v2";
const FILES = ["./", "index.html", "vendor/jsQR.js", "manifest.webmanifest", "icon-180.png", "icon-512.png"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys()
  .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const req = e.request.mode === "navigate" ? new Request("index.html") : e.request;
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
