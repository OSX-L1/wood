const CACHE_NAME = 'sunny-stock-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Sarabun:wght@300;400;600;800&display=swap'
];

// ติดตั้ง Service Worker และเก็บไฟล์ลง Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ลบ Cache เก่าเมื่อมีการอัปเดต
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ดึงข้อมูลจาก Cache ก่อน ถ้าไม่มีค่อยโหลดจากเน็ต (Offline First Strategy)
self.addEventListener('fetch', (event) => {
  // ไม่ Cache คำขอที่ไม่ใช่ GET หรือไม่ใช่ http/https (เช่น chrome-extension://)
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // ถ้าเจอใน Cache ให้ใช้เลย
      if (response) {
        return response;
      }
      // ถ้าไม่เจอ ให้โหลดจากเน็ต
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // เก็บลง Cache ไว้ใช้รอบหน้า
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
