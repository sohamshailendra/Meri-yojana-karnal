/* Sanity checks for the Meri Yojana site. Runs as the Render build command, so a broken
   page or data update fails the deploy instead of going live.   node test/check.js */
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
var PUB = path.join(__dirname, '..', 'public');
var html = fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');
var failures = 0;
function check(name, fn) {
  try { fn(); console.log('ok   ' + name); } catch (e) { failures++; console.log('FAIL ' + name + '\n     ' + e.message); }
}

var scripts = [], re = /<script>([\s\S]*?)<\/script>/g, m;
while ((m = re.exec(html))) scripts.push(m[1]);
var sandbox = {}; sandbox.window = sandbox;
var E, DATA;

check('page scripts parse', function () {
  scripts.forEach(function (src) { new vm.Script(src); });
});
check('engine and data load', function () {
  vm.runInNewContext(scripts[0], sandbox);
  E = sandbox.YojanaEngine;
  assert(E && typeof E.results === 'function', 'YojanaEngine not found');
  var d = /^var DATA = (\{.*\});\s*$/m.exec(html);
  assert(d, 'var DATA = {...}; line not found');
  DATA = JSON.parse(d[1]);
  assert(DATA.schemes.length > 0, 'no schemes');
  assert.strictEqual(DATA.schemes.length, DATA.meta.schemes, 'meta.schemes does not match the scheme list');
});
check('every scheme has id, English and Hindi name, unique id', function () {
  var seen = {};
  DATA.schemes.forEach(function (s) {
    assert(s.id && s.name && s.name_hi, 'incomplete scheme ' + (s.id || s.name));
    assert(!seen[s.id], 'duplicate id ' + s.id); seen[s.id] = 1;
  });
});
check('scheme links are web addresses', function () {
  DATA.schemes.forEach(function (s) { if (s.link) assert(/^https?:\/\//.test(s.link), s.id + ': ' + s.link); });
});
check('question flow ends within the screen limit for each beneficiary type', function () {
  var types = {}; DATA.schemes.forEach(function (s) { types[s.btype] = 1; });
  Object.keys(types).forEach(function (t) {
    var ans = { types: [t] }, asked = [], q;
    while ((q = E.nextQuestion(DATA.schemes, ans, asked)).next) {
      asked.push(q.next);
      assert(asked.length < E.MAX_SCREENS, t + ': too many questions');
    }
    var r = E.results(DATA.schemes, ans, q.skipped);
    assert(r.eligible.length + r.check.length + r.event.length > 0, t + ': no schemes shown at all');
  });
});
check('files the page, manifest and service worker need are present', function () {
  var need = ['manifest.webmanifest', 'sw.js', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable.png', 'apple-touch-icon.png'];
  need.forEach(function (f) { assert(fs.existsSync(path.join(PUB, f)), 'missing public/' + f); });
  JSON.parse(fs.readFileSync(path.join(PUB, 'manifest.webmanifest'), 'utf8'));
});

console.log(failures ? '\n' + failures + ' check(s) failed' : '\nAll checks passed (' + (DATA ? DATA.schemes.length : 0) + ' schemes)');
process.exit(failures ? 1 : 0);
