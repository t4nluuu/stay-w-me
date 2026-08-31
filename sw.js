const CACHE_NAME = 'companion-phone-v1';
const FILES = [
  './',
  './index.html',
  './manifest.json',
];

// 安裝：把檔案存進快取
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting(); // 立刻啟用新版
});

// 啟用：刪掉舊版快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 請求：先嘗試從網路拿（確保最新版），失敗才用快取
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 拿到新版就更新快取
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request)) // 離線時用快取
  );
});
