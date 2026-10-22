# Prompt: improve Meri Yojana – Karnal as far as it can sensibly go

Start a Claude Code session on this repository, then paste everything below the line. It works best in one
session at high effort. To review each change before it goes live, ask for a pull request per phase instead of
pushes to `main`.

---

You are working in the repository `sohamshailendra/meri-yojana-karnal`. It is **Meri Yojana – Karnal**, a
bilingual (हिन्दी default / English) government-scheme finder for District Karnal, Haryana. A citizen answers up
to 8 adaptive questions and sees the Central and Haryana Government schemes they appear eligible for, the ones
to confirm at an office, schemes tied to life events, and one combined documents checklist. It is hosted on
Render as a static site: every push to `main` redeploys, and `node test/check.js` is the build command.

**Your job: make this the best scheme finder a Karnal resident could be given. That means accurate, quick to
use on a cheap Android phone over a slow 4G connection, usable by people with low literacy or a disability, and
trusted by the district administration. Do this without ever inventing or changing a fact about a scheme.**

## 1. Who uses it

- Rural and urban households of Karnal: farmers, labourers, street vendors, students and parents, elderly
  people, widows, persons with disabilities, small enterprises. Many read Hindi slowly. Most use
  low-cost Android phones, often shared, and open the link from WhatsApp.
- Facilitators who help them: CSC / Atal Seva Kendra operators, Antyodaya Saral staff, anganwadi workers,
  sarpanches, school teachers. They run it many times a day for different people.
- District officers who answer for what the site says.

Every decision should favour the first group, then the second.

## 2. How the site is built

- `public/index.html` is the whole site (~634 KB) and has three parts:
  1. **CSS** in `<style>`, with colour tokens on `:root` (`--ink`, `--paddy` = eligible, `--haldi` = check,
     `--stamp` = verified badge) and a dark theme.
  2. **Engine** in the first `<script>` as `YojanaEngine`: `evaluate`, `nextQuestion`, `results`,
     `docsChecklist` and others. It also runs under Node via `module.exports`. Question order is `ORDER`; the cap
     is `MAX_SCREENS = 8`. Statuses are `eligible | check | event | no`.
  3. **Data + interface** in the second `<script>`. Line `var DATA = {...};` holds 258 schemes generated
     from `Karnal_Schemes_Master_v6_0_Sep2026.xlsx` (built 24-09-2026). After it come the words table `W`
     (`{en, hi}` pairs), `REASON`, `DOCS`, `SECTOR`, and the screens (`renderStart`, `renderQ`,
     `renderResults`, `card`, `waText`, `wire`).
- Each scheme has, among others: `id, sector, dept, name, name_hi, level, elig_text, benefit, benefit_short,
  docs, docs_canon, how, mode, link, nodal, btype, exclusions, age_min/max, gender, cat, income_cap,
  res_years, occ, cls, dis_min, events, window_raw/days, verified, gaps, slabs`.
- Facts about the data: 23 sectors; beneficiary types Individual 64, Student 57, Worker 48, Farmer 43,
  Household 35, Enterprise 11; 82 schemes are not yet `verified`; 130 have rules found only in the text (`gaps`);
  16 have no link.
- `public/sw.js` and `public/manifest.webmanifest` provide install-as-app and offline use. Bump `VERSION` in
  `sw.js` whenever the cached file list changes.
- `render.yaml` holds the static site, headers and caching. `test/check.js` holds the build-time checks.
- There is no backend. **Nothing a user enters is saved or sent anywhere.** The start screen promises this.

## 3. Rules that are never broken

1. **No invented scheme facts.** Do not add, remove or reword eligibility, benefits, amounts, documents,
   deadlines, links or offices in `DATA`. If something looks wrong, list it in `DATA-ISSUES.md` (scheme id, field,
   what looks wrong, why) for the district team. The data comes from the master spreadsheet, and a hand edit
   would be lost at the next export anyway.
2. **The engine's results do not change** unless you have found a real bug. Before touching the engine, write a
   test that captures today's results for a broad set of answer profiles. Keep it passing, or explain every
   difference in the commit message.
3. **Privacy stays absolute.** No analytics, cookies, trackers, third-party scripts, server calls or storage of
   answers. Storage on the device is allowed only for interface settings (language, text size) and only with
   `try/catch`. If you add sharing, put the answers in the URL fragment (`#…`), never in the path or query, so
   they never reach a server log.
4. **Hindi and English stay equal.** Every new string goes into `W` with both `en` and `hi`. Write natural,
   simple Hindi of the kind used in Haryana government notices, not word-for-word translation. Keep
   Devanagari digits out of numbers and amounts (use ₹ and Western digits, as now).
5. **It still runs from one static folder** with no build step beyond `node test/check.js`. You may split
   files (for example the data into `public/data.json`) if it measurably helps, but the site must keep working
   offline after one visit.
6. **It stays light.** Use no frameworks. Any library must justify its weight. Target a first visit under about
   300 KB transferred (gzip/brotli) and interaction under 100 ms on a mid-range phone.

## 4. Start with an audit; do not touch code yet

Run the site locally (`python3 -m http.server -d public`) and measure. Playwright and Chromium are available in
cloud sessions.

- Lighthouse (mobile, slow 4G, 4× CPU) for performance, accessibility, best practices and SEO. Record the scores.
- axe-core on every screen: start, each question, results (with details open), both languages, light and dark.
- Go through 10 realistic people at 360×800, for example: a widowed woman aged 62 below the BPL line; an SC student
  in Class 11; a small farmer with 2 acres; a construction worker registered with the board; a person with 60%
  disability; a new mother; a street vendor; a retired soldier; an MSME owner; a family whose daughter was just
  born. For each, note confusing wording, wasted taps, missing schemes you would expect, and anything that
  needed scrolling to find.
- Read `renderResults` output as a person who has never used a government website. Ask whether they would know
  what to do next for each scheme.

Write the findings to `AUDIT.md` with numbers, screenshots in `audit/` and a prioritised list. **Show the user
`AUDIT.md` and wait for their go-ahead before building.**

## 5. Then improve, in this order

Do one phase per commit (or pull request). Run `node test/check.js` and the browser checks after each.

### Phase A: correctness and trust
- Results must be explainable. For every eligible or check scheme, show briefly *why* ("You are 62 and
  your family income is under ₹1.8 lakh"), drawn from the answers and the engine's checks.
- Show the data date and source on the start screen as well, not only in the results footer, and make the
  "guidance, not a sanction" message impossible to miss.
- Make unverified schemes (82) clearly distinct from verified ones, without hiding them.
- Test the engine with edge cases: age 0 and 120, income border bands, "don't know" on every question,
  going back and changing answers, every beneficiary type, and every scheme reachable by at least one profile.
  Add these to `test/check.js` or a new `test/engine.test.js` that the build runs.

### Phase B: ease of use for low-literacy users
- Plain words: at most about 12 words per sentence in questions and hints, with examples where a term is hard
  ("Parivar Pehchan Patra (PPP) – the family ID card").
- **Listen button** (Web Speech API `speechSynthesis`, `hi-IN` / `en-IN`) on each question and each result card.
  Hide it if no voice is available. It must never block the page.
- A text size control (A / A+ / A++), remembered on the device.
- Large tap targets (at least 48 px), clear focus, no tiny grey text below 15 px.
- Keep the fixed bottom bar from covering content when the keyboard is open on Android.

### Phase C: what to do next
- On each result card, give one clear next step: "Apply online at …", "Go to the Atal Seva Kendra / CSC with
  these documents", or "Visit (nodal office)". Use only the existing `how`, `mode`, `link` and `nodal` fields.
- Group the documents checklist by "you probably have" and "you may need to get", and let people tick items
  off on screen.
- Improve the WhatsApp share and printout so they work as a one-page slip a person can carry to an office:
  name of each scheme, office, documents, and the site link.
- A **"Browse all schemes"** view with search (Hindi and English, forgiving of spelling: "pension", "पेंशन",
  "pension yojna") and filters by sector and beneficiary type. Some people know the scheme they want and
  should not have to answer questions.
- Shareable links: each scheme gets a stable URL (`#/scheme/AGR-002`), and results can be shared
  through the fragment only (rule 3). The phone's Back button must move between screens, not leave the site.

### Phase D: speed and reliability
- Measure, then fix: render-blocking Google Fonts (self-host a Devanagari subset of Mukta or use
  `font-display: swap` with a good system fallback), the 573 KB data line (consider `data.json` cached by the
  service worker with a compact format), and the cost of first render.
- Offline: show a small "available offline" note after the first visit. When a new data version is deployed,
  tell returning users ("Scheme list updated on …").
- Add a Content-Security-Policy in `render.yaml` that allows only what the page uses. Keep the current headers.

### Phase E: findability
- Proper `<title>`, description, Open Graph and WhatsApp preview image (1200×630, bilingual, made as a PNG
  in `public/`), `lang` switching on `<html>`, a `sitemap.xml`, and JSON-LD `GovernmentService` entries only if
  they are accurate.
- If you add per-scheme pages for search engines, generate them from `DATA` in the build step (it may become
  `node scripts/build.js && node test/check.js`). Do not hand-write them.

### Phase F: tools for facilitators (only if the earlier phases are done well)
- A "Next person" button that clears everything at once, and a compact mode for quick repeated use.
- An optional printable "Karnal scheme handbook" of all schemes by sector.

## 6. What "done" means

- Lighthouse mobile is at least 95 in every category, or you explain why it isn't.
- axe shows zero serious or critical issues on every screen in both languages and both themes.
- All 10 people from the audit reach a useful result in 8 screens or fewer, and you can say for each what
  improved.
- The engine snapshot test passes. `node test/check.js` passes and covers the new behaviour.
- It works offline after one visit, and works at 320 px wide with no sideways scrolling.
- `README.md` explains how to update the data from a new master spreadsheet export. If you added a build script,
  that update takes one command.
- Final report to the user: before/after scores, screenshots, what changed, what you chose not to do and why,
  and the contents of `DATA-ISSUES.md`.

Ask the user before anything that changes what the site promises (privacy, "guidance not sanction"), adds a
paid service, or needs a decision from the district administration (for example a helpline number, a logo, or
an official domain).
