/* Sanity checks for the Meri Yojana site. Runs as the Render build command, so a broken
   page or data update fails the deploy instead of going live.   node test/check.js */
'use strict';
var fs = require('fs'), path = require('path'), assert = require('assert');
var PUB = path.join(__dirname, '..', 'public');
var read = function (f) { return fs.readFileSync(path.join(PUB, f), 'utf8'); };
var failures = 0;
function check(name, fn) {
  try { fn(); console.log('ok   ' + name); } catch (e) { failures++; console.log('FAIL ' + name + '\n     ' + e.message); }
}

var E, DATA;
check('engine.js, app.js and sw.js parse', function () {
  new Function(read('engine.js')); new Function(read('app.js')); new Function(read('sw.js'));
});
check('engine and data load', function () {
  E = require(path.join(PUB, 'engine.js'));
  assert(E && typeof E.results === 'function', 'YojanaEngine not exported');
  DATA = JSON.parse(read('data.json'));
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
check('every scheme can be reached by some set of answers', function () {
  var T = ['Student', 'Individual', 'Household', 'Worker', 'Farmer', 'Enterprise'];
  var never = DATA.schemes.filter(function (s) {
    var a = { types: T, gender: s.gender === 'Any' ? 'F' : s.gender, age: s.age_min != null ? s.age_min : (s.age_max != null ? s.age_max : 30), about_done: true,
      cats: ['SC', 'BC-A', 'BC-B', 'DNT', 'ST', 'MINORITY', 'EWS', 'BPL', 'AAY'], income: 'i1', occ: s.occ && s.occ.length ? s.occ : ['none'],
      cls: s.cls && s.cls.length ? s.cls[0] : 'c10', dis: 'd4', events: E.hardEvents(s), res: 'r4' };
    return E.evaluate(s, a, {}).status === 'no';
  });
  assert(!never.length, 'unreachable: ' + never.map(function (s) { return s.id; }).join(' '));
});
check('index.html references files that exist, and no inline script or style (CSP)', function () {
  var html = read('index.html');
  assert(!/<script>|<style>|style="/.test(html), 'inline script or style in index.html');
  assert(!/style="/.test(read('app.js')), 'inline style attribute in app.js');
  var refs = html.match(/(?:href|src)="([^"]+)"/g).map(function (m) { return m.split('"')[1]; }).filter(function (u) { return !/^(https?:|#)/.test(u); });
  refs.forEach(function (u) { assert(fs.existsSync(path.join(PUB, u)), 'missing public/' + u); });
  JSON.parse(read('manifest.webmanifest'));
  read('sw.js').match(/'([\w./-]+\.(?:html|css|js|json|svg|png|woff2|webmanifest))'/g).forEach(function (m) {
    var f = m.replace(/'/g, ''); assert(fs.existsSync(path.join(PUB, f)), 'service worker caches missing file ' + f);
  });
});
check('engine snapshot unchanged', function () {
  var r = require('child_process').spawnSync(process.execPath, [path.join(__dirname, 'engine.test.js')], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stdout + r.stderr);
});

console.log(failures ? '\n' + failures + ' check(s) failed' : '\nAll checks passed (' + (DATA ? DATA.schemes.length : 0) + ' schemes)');
process.exit(failures ? 1 : 0);
