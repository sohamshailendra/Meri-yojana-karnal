/* Offline support: the site keeps working after one visit, even without internet.
   Page, code and the scheme list: network first (always the latest when online), saved copy when offline.
   Fonts and icons: saved copy first. */
'use strict';
var VERSION = 'meri-yojana-v3';
var CORE = ['./', 'index.html', 'style.css', 'engine.js', 'app.js', 'data.json', 'manifest.webmanifest',
  'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'emblem.png',
  'fonts/baloo2-700-devanagari.woff2', 'fonts/baloo2-700-latin.woff2',
  'fonts/mukta-400-devanagari.woff2', 'fonts/mukta-400-latin.woff2', 'fonts/mukta-700-devanagari.woff2', 'fonts/mukta-700-latin.woff2'];
var FRESH = /\/(index\.html|style\.css|engine\.js|app\.js|data\.json)$/;

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
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode === 'navigate' || FRESH.test(url.pathname)) {
    e.respondWith(fetch(req).then(function (res) { return save(req, res); })
      .catch(function () { return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()); }); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (res) { return save(req, res); }).catch(function () { return hit; });
    return hit || net;
  }));
});
