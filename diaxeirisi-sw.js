/* Εργαλείο διαχείρισης ως εφαρμογή στο κινητό.
   Παίρνει πάντα πρώτα την τελευταία έκδοση από το internet· το αντίγραφο χρησιμοποιείται μόνο όταν δεν υπάρχει σύνδεση.
   Αφορά μόνο τα αρχεία diaxeirisi* — το υπόλοιπο site και το GitHub δεν επηρεάζονται. */
var CACHE = 'diaxeirisi-v1';
var FILES = ['diaxeirisi.html', 'diaxeirisi.webmanifest', 'diaxeirisi-192.png', 'diaxeirisi-512.png', 'diaxeirisi-maskable.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).catch(function () {}));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('diaxeirisi-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  var name = u.pathname.split('/').pop();
  if (FILES.indexOf(name) < 0) return;
  var key = u.origin + u.pathname;
  e.respondWith(
    fetch(key, { cache: 'no-cache', credentials: 'same-origin' }).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(key, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(key).then(function (m) { return m || Response.error(); });
    })
  );
});
