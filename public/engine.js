/* Karnal Yojana Finder – matching and question engine.
   Used by the app (browser) and by the test script (node). No network, no storage. */
(function (root) {
  'use strict';

  var LEVELS = ['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','iti','diploma','ug','pg','phd'];
  var INCOME_BANDS = [            // [low, high) in rupees per year
    { id: 'i1', lo: 0,      hi: 100000 },
    { id: 'i2', lo: 100000, hi: 180000 },
    { id: 'i3', lo: 180000, hi: 250000 },
    { id: 'i4', lo: 250000, hi: 300000 },
    { id: 'i5', lo: 300000, hi: 800000 },
    { id: 'i6', lo: 800000, hi: Infinity }
  ];
  var DIS_BANDS = { none: null, d1: [1, 40], d2: [40, 60], d3: [60, 70], d4: [70, 101] };
  var RES_BANDS = { r0: [0, 1], r1: [1, 3], r2: [3, 5], r3: [5, 15], r4: [15, 200] };
  var SOFT_EVENTS = { admission: 1, retirement: 1 };
  var MAX_SCREENS = 8;
  // Order after "Who is this for?". If the path is long, the last ones are skipped (-> Check).
  var ORDER = ['about', 'category', 'income', 'occupation', 'class', 'disability', 'event', 'residence'];

  function hardEvents(s) { return (s.events || []).filter(function (e) { return !SOFT_EVENTS[e]; }).concat(s.special || []); }
  function inter(a, b) { for (var i = 0; i < a.length; i++) if (b.indexOf(a[i]) >= 0) return true; return false; }

  function catMatch(personCats, schemeTokens) {
    for (var i = 0; i < schemeTokens.length; i++) {
      var t = schemeTokens[i];
      if (personCats.indexOf(t) >= 0) return true;
      if (t === 'BC' && (personCats.indexOf('BC-A') >= 0 || personCats.indexOf('BC-B') >= 0)) return true;
    }
    return false;
  }

  /* Evaluate one scheme against the answers.
     ans: answers object; skipped: {questionId:true} for questions dropped by the screen cap.
     Returns {status: 'eligible'|'check'|'event'|'no', reasons:[{key,text}], window, slabs:[...]} */
  function evaluate(s, ans, skipped) {
    skipped = skipped || {};
    var R = [], no = false, eventPending = false, windowNote = null;
    function chk(key, text) { R.push({ key: key, text: text || '' }); }

    // beneficiary type
    if (ans.types && ans.types.indexOf(s.btype) < 0) no = true;

    // gender
    if (s.gender !== 'Any') {
      if (ans.gender) { if (ans.gender !== s.gender) no = true; }
      else if (skipped.about) chk('notasked_gender');
    }
    // age
    if (s.age_min != null || s.age_max != null) {
      if (ans.age != null) {
        if (s.age_min != null && ans.age < s.age_min) no = true;
        if (s.age_max != null && ans.age > s.age_max) no = true;
      } else if (skipped.about || ans.about_done) chk('age_unknown', ageText(s));
    }
    // category
    var c = s.cat || { any: true, tokens: [], other: [] };
    if (!c.any && (c.tokens.length || c.other.length)) {
      if (ans.cats) {
        if (ans.cats.indexOf('UNK') >= 0) chk('cat_unknown', s.cat_raw);
        else if (!catMatch(ans.cats, c.tokens)) {
          if (c.other.length) chk('cat_other', s.cat_raw); else no = true;
        }
      } else if (skipped.category) chk('notasked_cat', s.cat_raw);
    }
    if (c.note) chk('cat_note', c.note);
    // income
    if (s.income_cap != null) {
      if (ans.income === 'UNK') chk('income_unknown', s.income_cap);
      else if (ans.income) {
        var b = INCOME_BANDS.filter(function (x) { return x.id === ans.income; })[0];
        if (b.lo >= s.income_cap) no = true;
        else if (b.hi > s.income_cap) chk('income_border', s.income_cap);
      } else if (skipped.income) chk('notasked_income', s.income_cap);
    }
    // occupation
    if (s.occ && s.occ.length) {
      if (ans.occ) { if (!inter(ans.occ, s.occ)) no = true; }
      else if (skipped.occupation) chk('notasked_occ', s.occ_raw);
    }
    // class / course – only for Student schemes
    if (s.btype === 'Student' && s.cls && s.cls.length && s.cls.length < LEVELS.length) {
      if (ans.cls) { if (s.cls.indexOf(ans.cls) < 0) no = true; }
      else if (skipped['class']) chk('notasked_class', s.cls_raw);
    }
    // disability
    if (s.dis_min != null) {
      if (ans.dis === 'UNK') chk('dis_unknown', s.dis_min);
      else if (ans.dis === 'none') no = true;
      else if (ans.dis) {
        var d = DIS_BANDS[ans.dis];
        if (d[1] <= s.dis_min) no = true;
        else if (d[0] < s.dis_min) chk('dis_border', s.dis_min);
      } else if (skipped.disability) chk('notasked_dis', s.dis_min);
    }
    // residence
    if (s.res_years != null) {
      if (ans.res) {
        var r = RES_BANDS[ans.res];
        if (r[1] <= s.res_years) no = true;
        else if (r[0] < s.res_years) chk('res_border', s.res_years);
      } else chk('res_unknown', s.res_years);
    }
    // life events
    var he = hardEvents(s);
    if (he.length) {
      if (ans.events && inter(ans.events, he)) {
        if (s.window_days && ans.events.some(function (x) { return (s.events || []).indexOf(x) >= 0; })) windowNote = s.window_raw;
      } else eventPending = true;
    }
    // exclusions the app cannot test
    if (s.exclusions) chk('exclusion', s.exclusions);
    // rules present only in the eligibility text
    (s.gaps || []).forEach(function (g) {
      if (g.report_only) return;
      if (g.key === 'category') {
        if (ans.cats && ans.cats.indexOf('UNK') < 0 && inter(ans.cats.concat(expandBC(ans.cats)), g.hint || [])) return;
        chk('gap', g.text); return;
      }
      if (g.key === 'disability') { if (ans.dis && ans.dis !== 'none' && ans.dis !== 'UNK') return; chk('gap', g.text); return; }
      chk('gap', g.text);
    });

    var status = no ? 'no' : eventPending ? 'event' : R.length ? 'check' : 'eligible';
    return { status: status, reasons: dedupe(R), window: windowNote, slabs: matchSlabs(s, ans) };
  }

  function expandBC(cats) { return (cats.indexOf('BC-A') >= 0 || cats.indexOf('BC-B') >= 0) ? ['BC'] : []; }
  function dedupe(R) {
    var seen = {}; return R.filter(function (r) { var k = r.key + '|' + r.text; if (seen[k]) return false; seen[k] = 1; return true; });
  }
  function ageText(s) {
    if (s.age_min != null && s.age_max != null) return s.age_min + '–' + s.age_max;
    if (s.age_min != null) return s.age_min + '+';
    return '≤ ' + s.age_max;
  }
  function matchSlabs(s, ans) {
    if (!s.slabs) return [];
    return s.slabs.map(function (sl) {
      var ok = true;
      if (ans.cls && sl.cls && sl.cls.length && sl.cls.indexOf(ans.cls) < 0) ok = false;
      if (ans.gender && sl.gender && sl.gender !== 'Any' && sl.gender !== ans.gender) ok = false;
      return { id: sl.id, label: sl.label, benefit: sl.benefit, match: ok };
    });
  }

  // ---------------------------------------------------------------- adaptive questions
  function candidates(schemes, ans) {
    return schemes.filter(function (s) { return evaluate(s, ans, {}).status !== 'no'; });
  }
  var RELEVANT = {
    about: function (C) { return C.some(function (s) { return s.gender !== 'Any' || s.age_min != null || s.age_max != null ||
        (s.slabs || []).some(function (x) { return x.gender && x.gender !== 'Any'; }) ||
        (s.gaps || []).some(function (g) { return g.key === 'gender'; }); }); },
    category: function (C) { return C.some(function (s) { return (s.cat && !s.cat.any && (s.cat.tokens.length || s.cat.other.length)) ||
        (s.gaps || []).some(function (g) { return g.key === 'category'; }); }); },
    income: function (C) { return C.some(function (s) { return s.income_cap != null; }); },
    occupation: function (C) { return occOptions(C).length > 0; },
    'class': function (C, ans) { return ans.types && ans.types.indexOf('Student') >= 0 &&
        C.some(function (s) { return s.btype === 'Student' && s.cls && s.cls.length && s.cls.length < LEVELS.length; }); },
    disability: function (C) { return C.some(function (s) { return s.dis_min != null ||
        (s.gaps || []).some(function (g) { return g.key === 'disability'; }); }); },
    event: function (C) { return eventOptions(C).length > 0; },
    residence: function (C, ans) { return C.some(function (s) { return s.res_years != null && evaluate(s, ans, {}).status !== 'event'; }); }
  };
  /* The page may collect an answer on another screen (disability is asked with gender and age). */
  var ANSWERED = {
    about: function (a) { return !!a.about_done; }, category: function (a) { return !!a.cats; }, income: function (a) { return !!a.income; },
    occupation: function (a) { return !!a.occ; }, 'class': function (a) { return !!a.cls; }, disability: function (a) { return !!a.dis; },
    event: function (a) { return !!a.events; }, residence: function (a) { return !!a.res; }
  };
  function occOptions(C) {
    var seen = {}, out = [];
    C.forEach(function (s) { (s.occ || []).forEach(function (o) { if (!seen[o]) { seen[o] = 1; out.push(o); } }); });
    return out;
  }
  function eventOptions(C) {
    var seen = {}, out = [];
    C.forEach(function (s) { hardEvents(s).forEach(function (e) { if (!seen[e]) { seen[e] = 1; out.push(e); } }); });
    return out;
  }
  /* asked: array of question ids already answered (not counting 'types').
     Returns {next: id|null, skipped: {id:true}} */
  function nextQuestion(schemes, ans, asked) {
    var C = candidates(schemes, ans);
    var used = 1 + asked.length; // "types" is screen 1
    var skipped = {};
    for (var i = 0; i < ORDER.length; i++) {
      var q = ORDER[i];
      if (asked.indexOf(q) >= 0 || ANSWERED[q](ans)) continue;
      if (!RELEVANT[q](C, ans)) continue;
      if (used >= MAX_SCREENS) { skipped[q] = true; continue; }
      return { next: q, skipped: skipped, candidates: C };
    }
    return { next: null, skipped: skipped, candidates: C };
  }
  /* Upper bound on remaining screens, for the progress bar */
  function remainingEstimate(schemes, ans, asked) {
    var C = candidates(schemes, ans), n = 0;
    ORDER.forEach(function (q) { if (asked.indexOf(q) < 0 && !ANSWERED[q](ans) && RELEVANT[q](C, ans)) n++; });
    return Math.min(n, MAX_SCREENS - 1 - asked.length);
  }

  function results(schemes, ans, skipped) {
    var out = { eligible: [], check: [], event: [] };
    schemes.forEach(function (s) {
      var e = evaluate(s, ans, skipped);
      if (e.status !== 'no') out[e.status].push({ scheme: s, ev: e });
    });
    return out;
  }
  function docsChecklist(list) {
    var seen = {}, out = [];
    list.forEach(function (x) { (x.scheme.docs_canon || []).forEach(function (d) { if (!seen[d]) { seen[d] = 1; out.push(d); } }); });
    return out;
  }

  /* How specific a scheme is to the person: the number of answered questions it actually tests.
     0 means it matches everyone, so the page lists it last. */
  function specificity(s) {
    var n = 0;
    if (s.btype !== 'Individual' && s.btype !== 'Household') n++;
    if (s.gender !== 'Any') n++;
    if (s.age_min != null || s.age_max != null) n++;
    if (s.cat && !s.cat.any && (s.cat.tokens.length || s.cat.other.length)) n++;
    if (s.income_cap != null) n++;
    if (s.occ && s.occ.length) n++;
    if (s.btype === 'Student' && s.cls && s.cls.length && s.cls.length < LEVELS.length) n++;
    if (s.dis_min != null) n++;
    if (s.res_years != null) n++;
    if (hardEvents(s).length) n++;
    if ((s.gaps || []).some(function (g) { return !g.report_only; })) n++;
    return n;
  }

  var API = { LEVELS: LEVELS, INCOME_BANDS: INCOME_BANDS, MAX_SCREENS: MAX_SCREENS, ORDER: ORDER,
    evaluate: evaluate, specificity: specificity, nextQuestion: nextQuestion, remainingEstimate: remainingEstimate,
    results: results, occOptions: occOptions, eventOptions: eventOptions, candidates: candidates,
    docsChecklist: docsChecklist, hardEvents: hardEvents };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.YojanaEngine = API;
})(this);

