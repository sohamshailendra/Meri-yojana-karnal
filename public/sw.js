/* Offline support: the site keeps working after one visit, even without internet.
   Pages: network first (always the latest when online), saved copy when offline.
   Fonts and icons: saved copy first. */
'use strict';
var VERSION = 'meri-yojana-v1';
var CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
function save(req, res) { if (res && res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); } return res; }

self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate' || (url.origin === location.origin && /\.html?$/.test(url.pathname))) {
    e.respondWith(fetch(req).then(function (res) { return save(req, res); })
      .catch(function () { return caches.match(req).then(function (r) { return r || caches.match('index.html'); }); }));
    return;
  }
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) { return save(req, res); }).catch(function () { return hit; });
      return hit || net;
    }));
  }
});
