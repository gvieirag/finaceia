// Service worker mínimo — cacheia a "casca" do app para abrir offline.
// Não cacheia /api (o parsing precisa de rede). Os dados ficam no localStorage do aparelho.
const CACHE = "ecofin-v1";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith("/api/")) return; // sempre rede
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
