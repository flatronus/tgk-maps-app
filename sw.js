// Service worker застосунку «Кресленик речень».
// Кешує основні файли для роботи офлайн (PWA).
// При зміні контенту застосунку збільшуйте CACHE_NAME (напр. v2, v3),
// щоб браузер підвантажив свіжі файли замість старих із кешу.
var CACHE_NAME = 'sentence-diagram-cache-v16';
var CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Стратегія: спершу мережа (щоб отримати свіжу версію, коли є з'єднання),
// а якщо мережа недоступна — віддаємо кешовану копію (робота офлайн).
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then(function (response) {
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(event.request, copy);
      });
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
