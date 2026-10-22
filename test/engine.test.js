/* Snapshot test for the matching engine. For a broad set of answer profiles it records the question
   sequence and every scheme's status and reasons, and compares them with test/engine.snapshot.json.
   Any change in what the engine decides therefore shows up as a diff, which the commit must explain.
     node test/engine.test.js            # compare
     node test/engine.test.js --update   # rewrite the snapshot (after an intended change)         */
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
var html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
var src = /<script>([\s\S]*?)<\/script>/.exec(html)[1];
var sandbox = {}; sandbox.window = sandbox; vm.runInNewContext(src, sandbox);
var E = sandbox.YojanaEngine;
var dataSrc = fs.existsSync(path.join(__dirname, '..', 'public', 'data.json'))
  ? fs.readFileSync(path.join(__dirname, '..', 'public', 'data.json'), 'utf8') : /^var DATA = (\{.*\});\s*$/m.exec(html)[1];
var S = JSON.parse(dataSrc).schemes;
var KEY = { category: 'cats', income: 'income', occupation: 'occ', 'class': 'cls', disability: 'dis', event: 'events', residence: 'res' };

/* ------------------------------------------------------------ profiles */
var P = {
  widow62_bpl:      { types: ['Individual','Household'], gender: 'F', age: 62, cats: ['BPL'], income: 'i1', occ: ['none'], dis: 'none', events: ['widow'], res: 'r4' },
  sc_student_c11:   { types: ['Student','Individual','Household'], gender: 'M', age: 16, cats: ['SC'], income: 'i2', occ: ['none'], cls: 'c11', dis: 'none', events: ['none'], res: 'r4' },
  farmer45:         { types: ['Farmer','Individual','Household'], gender: 'M', age: 45, cats: ['GEN'], income: 'i3', occ: ['farmer','livestock'], dis: 'none', events: ['none'], res: 'r4' },
  bocw38_bca:       { types: ['Worker','Individual','Household'], gender: 'M', age: 38, cats: ['BC-A'], income: 'i2', occ: ['bocw'], dis: 'none', events: ['none'], res: 'r4' },
  woman30_dis60:    { types: ['Individual','Household'], gender: 'F', age: 30, cats: ['GEN'], income: 'i2', occ: ['jobseeker'], dis: 'd3', events: ['none'], res: 'r4' },
  mother24_birth:   { types: ['Individual','Household'], gender: 'F', age: 24, cats: ['GEN'], income: 'i3', occ: ['none'], dis: 'none', events: ['birth'], res: 'r4' },
  vendor50_unk:     { types: ['Worker','Individual','Household'], gender: 'M', age: 50, cats: ['BC-B'], income: 'UNK', occ: ['vendor','unorganised'], dis: 'none', events: ['none'], res: 'r4' },
  esm58_marriage:   { types: ['Individual','Household'], gender: 'M', age: 58, cats: ['GEN'], income: 'i5', occ: ['exserviceman'], dis: 'none', events: ['marriage'], res: 'r4' },
  msme_woman35:     { types: ['Enterprise','Individual','Household'], gender: 'F', age: 35, cats: ['GEN'], income: 'i5', occ: ['entrepreneur'], dis: 'none', events: ['none'], res: 'r4' },
  newborn_aay:      { types: ['Household','Individual','Worker'], gender: 'F', age: 0, cats: ['AAY'], income: 'i1', occ: ['unorganised'], dis: 'none', events: ['birth'], res: 'r2' },
  all_unknown:      { types: ['Individual','Household'], gender: 'F', age: null, cats: ['UNK'], income: 'UNK', occ: ['none'], dis: 'UNK', events: ['none'], res: 'r0' },
  age0:             { types: ['Individual','Household'], gender: 'M', age: 0, cats: ['GEN'], income: 'i1', occ: ['none'], dis: 'none', events: ['none'], res: 'r4' },
  age120:           { types: ['Individual','Household'], gender: 'F', age: 120, cats: ['GEN'], income: 'i1', occ: ['none'], dis: 'none', events: ['none'], res: 'r4' },
  age_blank_rich:   { types: ['Individual','Household'], gender: 'M', age: null, cats: ['GEN'], income: 'i6', occ: ['none'], dis: 'none', events: ['none'], res: 'r4' },
  income_border18:  { types: ['Individual','Household'], gender: 'F', age: 70, cats: ['BPL'], income: 'i2', occ: ['none'], dis: 'none', events: ['none'], res: 'r4' },
  income_border30:  { types: ['Individual','Household'], gender: 'M', age: 65, cats: ['GEN'], income: 'i4', occ: ['none'], dis: 'none', events: ['none'], res: 'r4' },
  dis_border40:     { types: ['Individual','Household'], gender: 'M', age: 40, cats: ['GEN'], income: 'i2', occ: ['none'], dis: 'd1', events: ['none'], res: 'r4' },
  dis70:            { types: ['Individual','Household'], gender: 'T', age: 25, cats: ['SC'], income: 'i1', occ: ['none'], dis: 'd4', events: ['none'], res: 'r4' },
  new_resident:     { types: ['Individual','Household'], gender: 'F', age: 35, cats: ['GEN'], income: 'i2', occ: ['none'], dis: 'none', events: ['none'], res: 'r0' },
  every_event:      { types: ['Individual','Household'], gender: 'F', age: 45, cats: ['GEN'], income: 'i2', occ: ['none'], dis: 'none',
                      events: ['birth','marriage','death','accident','diagnosis','acid','widow','child_care','shelter','victim','unemployed','family_planning','freedom','kashmiri','padma'], res: 'r4' },
  every_category:   { types: ['Individual','Household'], gender: 'F', age: 45, cats: ['SC','BC-A','BC-B','DNT','ST','MINORITY','EWS','BPL','AAY'], income: 'i1', occ: ['none'], dis: 'none', events: ['none'], res: 'r4' },
  every_occ:        { types: ['Student','Individual','Household','Worker','Farmer','Enterprise'], gender: 'M', age: 30, cats: ['GEN'], income: 'i3',
                      occ: ['bocw','hlwb','unorganised','farmer','livestock','dairy_coop','fish','sports','shg','entrepreneur','jobseeker','journalist','vendor','artisan','exserviceman','esm_child','defence','tree_owner'], cls: 'ug', dis: 'none', events: ['none'], res: 'r4' },
  student_c1:       { types: ['Student'], gender: 'F', age: 6, cats: ['BC-A'], income: 'i2', occ: ['none'], cls: 'c1', dis: 'none', events: ['none'], res: 'r4' },
  student_c8_dis:   { types: ['Student'], gender: 'M', age: 13, cats: ['GEN'], income: 'i3', occ: ['none'], cls: 'c8', dis: 'd2', events: ['none'], res: 'r4' },
  student_iti:      { types: ['Student'], gender: 'F', age: 19, cats: ['SC'], income: 'i2', occ: ['none'], cls: 'iti', dis: 'none', events: ['none'], res: 'r4' },
  student_pg_ews:   { types: ['Student'], gender: 'M', age: 23, cats: ['EWS'], income: 'i5', occ: ['none'], cls: 'pg', dis: 'none', events: ['none'], res: 'r4' },
  student_phd:      { types: ['Student','Individual'], gender: 'F', age: 27, cats: ['MINORITY'], income: 'i4', occ: ['none'], cls: 'phd', dis: 'none', events: ['none'], res: 'r4' },
  farmer_woman_shg: { types: ['Farmer','Enterprise'], gender: 'F', age: 40, cats: ['BC-B'], income: 'i2', occ: ['farmer','shg','dairy_coop'], dis: 'none', events: ['none'], res: 'r4' },
  fish_farmer:      { types: ['Farmer'], gender: 'M', age: 33, cats: ['GEN'], income: 'i4', occ: ['fish'], dis: 'none', events: ['none'], res: 'r3' },
  tree_owner:       { types: ['Farmer','Individual'], gender: 'M', age: 75, cats: ['GEN'], income: 'i3', occ: ['tree_owner','farmer'], dis: 'none', events: ['none'], res: 'r4' },
  hlwb_worker:      { types: ['Worker'], gender: 'F', age: 29, cats: ['GEN'], income: 'i3', occ: ['hlwb'], dis: 'none', events: ['marriage','birth'], res: 'r4' },
  worker_death:     { types: ['Worker','Household'], gender: 'F', age: 44, cats: ['BPL'], income: 'i1', occ: ['bocw'], dis: 'none', events: ['death','widow'], res: 'r4' },
  journalist:       { types: ['Individual'], gender: 'M', age: 61, cats: ['GEN'], income: 'i5', occ: ['journalist'], dis: 'none', events: ['none'], res: 'r4' },
  sports_youth:     { types: ['Individual','Student'], gender: 'F', age: 17, cats: ['GEN'], income: 'i3', occ: ['sports'], cls: 'c12', dis: 'none', events: ['none'], res: 'r4' },
  enterprise_only:  { types: ['Enterprise'], gender: 'M', age: 50, cats: ['SC'], income: 'i5', occ: ['entrepreneur','artisan'], dis: 'none', events: ['none'], res: 'r4' },
  household_only:   { types: ['Household'], gender: 'M', age: 48, cats: ['AAY'], income: 'i1', occ: ['none'], dis: 'none', events: ['none'], res: 'r4' },
  freedom_dep:      { types: ['Individual'], gender: 'M', age: 55, cats: ['GEN'], income: 'i5', occ: ['none'], dis: 'none', events: ['freedom'], res: 'r4' },
  acid_survivor:    { types: ['Individual'], gender: 'F', age: 22, cats: ['GEN'], income: 'i2', occ: ['none'], dis: 'none', events: ['acid','victim'], res: 'r4' },
  defence_serving:  { types: ['Individual','Household'], gender: 'M', age: 32, cats: ['GEN'], income: 'i5', occ: ['defence'], dis: 'none', events: ['none'], res: 'r4' },
  kashmiri:         { types: ['Household','Individual'], gender: 'F', age: 50, cats: ['GEN'], income: 'i2', occ: ['none'], dis: 'none', events: ['kashmiri','shelter'], res: 'r1' }
};

/* Walk the adaptive flow exactly as the page does, answering from the profile. */
function run(full) {
  var ans = { types: full.types }, asked = [], seq = [], q;
  while ((q = E.nextQuestion(S, ans, asked)).next) {
    var k = q.next; asked.push(k); seq.push(k);
    if (k === 'about') { ans.gender = full.gender; ans.age = full.age; ans.about_done = true; ans.dis = full.dis; } // the page asks disability with gender and age
    else ans[KEY[k]] = full[KEY[k]];
  }
  var R = E.results(S, ans, q.skipped), out = {};
  ['eligible', 'check', 'event'].forEach(function (st) {
    R[st].forEach(function (x) {
      out[x.scheme.id] = st + (x.ev.reasons.length ? ' [' + x.ev.reasons.map(function (r) { return r.key; }).join(',') + ']' : '') +
        (x.ev.window ? ' window' : '') + (x.ev.slabs.some(function (z) { return z.match; }) ? ' slab' : '');
    });
  });
  return { questions: seq.join(' > '), skipped: Object.keys(q.skipped), eligible: R.eligible.length, check: R.check.length, event: R.event.length,
    docs: E.docsChecklist(R.eligible), schemes: out };
}

var snap = {}; Object.keys(P).forEach(function (k) { snap[k] = run(P[k]); });
var file = path.join(__dirname, 'engine.snapshot.json');
if (process.argv.indexOf('--update') > -1) {
  fs.writeFileSync(file, JSON.stringify(snap, null, 1) + '\n');
  console.log('snapshot written for ' + Object.keys(snap).length + ' profiles');
} else {
  var old = JSON.parse(fs.readFileSync(file, 'utf8')), diffs = [];
  Object.keys(P).forEach(function (k) {
    var a = old[k], b = snap[k];
    if (!a) { diffs.push(k + ': new profile'); return; }
    if (a.questions !== b.questions) diffs.push(k + ': questions ' + a.questions + ' -> ' + b.questions);
    Object.keys(a.schemes).concat(Object.keys(b.schemes)).forEach(function (id) {
      if (a.schemes[id] !== b.schemes[id]) diffs.push(k + ': ' + id + ' ' + (a.schemes[id] || 'no') + ' -> ' + (b.schemes[id] || 'no'));
    });
    if (a.docs.join() !== b.docs.join()) diffs.push(k + ': docs ' + a.docs.join(',') + ' -> ' + b.docs.join(','));
  });
  diffs = diffs.filter(function (d, i) { return diffs.indexOf(d) === i; });
  if (diffs.length) { console.log('ENGINE RESULTS CHANGED:\n  ' + diffs.join('\n  ')); process.exit(1); }
  console.log('ok   engine snapshot unchanged (' + Object.keys(snap).length + ' profiles)');
}
module.exports = { run: run, profiles: P };
