const CACHE_NAME = 'runlog-free-ocr-v1';
const APP_SHELL = ["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch", event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // External CDN (Tesseract.js) stays network-controlled; same-origin app shell uses cache-first.
  if(url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
    const copy = res.clone(); caches.open(CACHE_NAME).then(c=>c.put(event.request,copy)); return res;
  })));
});
