/* 离线缓存：首次打开后断网也能玩。改版时把 CACHE 版本号 +1 */
const CACHE = 'screw-puzzle-v4';
const ASSETS = ['./','./index.html','./manifest.webmanifest',
                './icon-192.png','./icon-512.png','./icon-512-maskable.png'];
self.addEventListener('install', e => {
  // 用 cache:'reload' 绕过浏览器 HTTP 缓存，否则会把旧版 HTML 烤进新缓存
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(ASSETS.map(u =>
      fetch(u, { cache: 'reload' }).then(r => { if (r.ok) return c.put(u, r); }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)
      .then(res => { const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match('./index.html'))));
});
