/* Takes a page exported from the scheme master (the one-file "Meri Yojana" HTML with `var DATA = {...}`
   inside) and updates public/data.json from it. The site's own code is not touched.
     node scripts/import-export.js path/to/Meri_Yojana_Karnal.html                              */
'use strict';
var fs = require('fs'), path = require('path');
var src = process.argv[2];
if (!src) { console.error('usage: node scripts/import-export.js <exported.html or data.json>'); process.exit(2); }
var text = fs.readFileSync(src, 'utf8'), json;
if (/\.json$/i.test(src)) json = text;
else {
  var m = /^var DATA = (\{.*\});\s*$/m.exec(text);
  if (!m) { console.error('no "var DATA = {...};" line found in ' + src); process.exit(1); }
  json = m[1];
}
var D = JSON.parse(json);
if (!D.meta || !Array.isArray(D.schemes)) { console.error('unexpected data shape'); process.exit(1); }
var out = path.join(__dirname, '..', 'public', 'data.json');
var old = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : null;
fs.writeFileSync(out, JSON.stringify(D) + '\n');
console.log('public/data.json: ' + D.schemes.length + ' schemes, built ' + D.meta.built + (old ? ' (was ' + old.schemes.length + ', built ' + old.meta.built + ')' : ''));
if (old) {
  var ids = {}; old.schemes.forEach(function (s) { ids[s.id] = s; });
  var added = D.schemes.filter(function (s) { return !ids[s.id]; }).map(function (s) { return s.id; });
  var seen = {}; D.schemes.forEach(function (s) { seen[s.id] = 1; });
  var removed = old.schemes.filter(function (s) { return !seen[s.id]; }).map(function (s) { return s.id; });
  if (added.length) console.log('added: ' + added.join(' '));
  if (removed.length) console.log('removed: ' + removed.join(' '));
}
console.log('Now run: node test/check.js   (it fails if the new data breaks anything; see DATA-ISSUES.md for corrections to re-apply)');
