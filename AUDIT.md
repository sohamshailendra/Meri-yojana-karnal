# Audit: Meri Yojana – Karnal (22 October 2026)

Site as deployed from commit `a2cc9ae` (data built 24-09-2026, 258 schemes). Measured on a local static server
with Lighthouse 12 (mobile, slow 4G, 4× CPU), axe-core 4 on every screen, and Playwright walkthroughs of
11 people at 360 px and 320 px, Hindi and English, light and dark. Evidence is in `audit/`
(`lighthouse-mobile.html`, screenshots, `browser-log.txt`, `print-widow-hi.pdf`).

## 1. Scores and numbers

| Measure | Result |
|---|---|
| Lighthouse Performance (mobile, slow 4G) | **60** |
| First Contentful Paint / Largest Contentful Paint | **6.9 s** (nothing shows until the whole page has arrived) |
| Total Blocking Time / Layout shift | 0 ms / 0 (excellent once loaded) |
| Lighthouse Accessibility / Best Practices / SEO | **100 / 100 / 100** |
| axe-core, all 10 screens × 2 languages × 2 themes, details open | **0 violations** (one transient contrast flag at 320 px did not reproduce) |
| Page weight, first visit | **933 KB** transferred: `index.html` 634 KB raw (127 KB gzip, of which the scheme data is 108 KB) + 8 Mukta font files 318 KB |
| Render-blocking | Google Fonts CSS (`fonts.googleapis.com`), est. 2.9 s saved by removing it from the critical path |
| Local, fast network | DOM ready 198 ms, first paint 164 ms. The page is fast once the bytes are there. |
| Works offline after one visit | Yes |
| Horizontal scrolling at 320 px | None |
| JavaScript errors in any walkthrough | None |

## 2. What is already good

- Matching engine is sound: every one of the 258 schemes is reachable by some set of answers; "don't know"
  answers degrade gracefully into "check with the office"; back-and-change works; no persona got stuck.
- The accessibility basics are right: real buttons with `aria-pressed`, visible focus, 56 px Next/Back,
  60 px options, `role="alert"` on the error, heading focus on each screen, Hindi and English parity in the
  interface strings, dark theme, print stylesheet.
- Honest framing: "guidance, not a sanction", data date, "nothing is saved or sent".
- Good Hindi in the interface: natural, short, Haryana-government register. Only 4 interface strings exceed 90
  characters.

## 3. Findings, in priority order

### P1 — The Hindi user gets English where it matters most (data gap)

Only the scheme **name** is in Hindi. For 254 of 258 schemes the benefit line, documents, how to apply,
mode and eligibility rules exist **only in English**. On the Hindi interface every result card shows an English
benefit sentence under a Hindi title, then a note "विवरण अंग्रेज़ी में हैं।" (see `audit/hi-360-9b-card-open.png`).

| Field | In Hindi |
|---|---|
| `name_hi` | 258 / 258 |
| `benefit`, `benefit_short` | 4 / 251 |
| `docs_text`, `how`, `elig_text`, `nodal`, `dept` | 0 |

A Hindi-only reader therefore learns *which* schemes match but not *what they give* or *what to bring*. This
cannot be fixed in code without inventing translations (rule 1). It needs a decision: the district team adds
Hindi columns to the master sheet (at least `benefit_short`, `how`, `docs`), or approves a one-time
machine-assisted translation that an officer checks before it ships.

### P1 — The results page is a wall: 59–73 cards, 20–34 phone screens of scrolling

| Person | Eligible | Check | Life-event | Cards | Page height at 360 px |
|---|---|---|---|---|---|
| Widow, 62, BPL | 16 | 16 | 27 | 59 | 15,654 px (20 screens) |
| Farmer, 45, GEN, 2 acres | 39 | 15 | 19 | 73 | 24,874 px (31 screens) |
| Same farmer at 320 px | | | | 73 | 26,984 px (34 screens) |

The widow's print-out is **34 A4 pages** (`audit/print-widow-hi.pdf`). The WhatsApp text is capped at 3,500
characters, so it silently truncates. The sum box at the top gives counts only; a person has to scroll to find
out what any of it means.

### P1 — The wrong schemes come first

Sectors are ordered by how many matching schemes they contain, and seven schemes match *everyone* (no
age, gender, income, category or occupation rule). So the first five "eligible" cards for a widow, a street
vendor, a new mother, an ex-serviceman, an MSME owner and a person with a disability are **the same**:

1. Paudhagiri (School Plantation Drive)
2. Free/Concessional Sapling Supply
3. Van Mitra Scheme
4. Vidhayak Adarsh Nagar Avam Gram Yojana
5. HRDA – Regulated Rural Development

The widow's own pension (SEWA-002) sits in the yellow "check" list below them, because its only unmatched
condition is an exclusion the app cannot test ("not drawing another government pension"). The widow sees
tree saplings before her pension.

Fix in code (no data change): order by specificity (how many of the person's answers the scheme actually
used), put sector groups with person-specific schemes first, and show "check" schemes that failed only on an
untestable exclusion next to the eligible ones with a clear label, rather than in a separate list.

### P1 — Data tagging errors that produce wrong results (for `DATA-ISSUES.md`)

| Scheme | Problem | Effect |
|---|---|---|
| FOR-001 Paudhagiri | `btype` Individual, no class or age rule; eligibility text says "School children of class 6–12" | Shown as eligible to a 62-year-old widow, first in her list |
| SEWA-007, HLTH-003, SAI-003, DLSA-002 | `btype` Individual, text says children / students, but no age or class rule captured | Same: adults see children's schemes |
| AH-003 Livestock Insurance | `docs_canon` contains `death` (the animal's death certificate) | Farmer's combined checklist tells him to bring a **death certificate** |
| FOR-005 Farm Forestry (clonal seedlings) | `docs_canon` contains `caste` and `disability` (subsidy slabs) | General-category farmer told to bring a caste certificate and a disability certificate |
| 16 schemes | No link at all (RCS-001, WCD-009, HLTH-006, EDU-021, SAI-006, REV-002, COOP-002, DC-006/7/8, HLTH-010, WCD-014/15, EDU-025/26/27) | No "apply here" |
| 46 schemes | English name over 90 characters (longest 213) | Card titles run 4–5 lines on a phone |
| 125 schemes | `benefit_short` over 160 characters | Not short; the card shows a truncated sentence ending in "…" |
| 82 schemes | Not verified (`verif_raw`: "Referred to department", "Partly verified (framework only)") | About half of every person's eligible list carries the dashed "pending" stamp |
| 37 schemes | No canonical documents | They add nothing to the checklist, though `docs_text` names documents |

### P2 — The adaptive questions never adapt

The start screen promises "the questions change with your answers, so you are only asked what matters."
All 11 personas were asked all 8 screens (the student skipped only "residence"). Causes: "Person" and
"Family" are pre-ticked, and Individual/Household schemes between them use every question. The residence
question (6 schemes) and disability question are asked of everyone. This is a promise the site does not keep,
and 8 screens is a lot for a person reading slowly.

Options (no data change): ask disability and residence only when the current candidates need them *and*
move them after the event screen; or ask one combined "anything special?" screen; or drop the pre-tick and
let people choose only "Student" or "Farmer" so the path shortens. The engine already supports skipping.

### P2 — The phone's Back button leaves the site

Screens are rendered in place with no history entries. Pressing the Android Back button on question 2
goes to `about:blank` (or back to WhatsApp) and the answers are lost. There is also no way to link to a
scheme or to results. Fix: push a history entry per screen and use `#/q/3`, `#/results`, `#/scheme/AGR-002`
(fragment only, per rule 3).

### P2 — The first paint waits for 634 KB

The whole app, including 573 KB of scheme data, is one HTML file, and the interface is drawn by script at the
end of it, so nothing appears until it has all arrived. On slow 4G that is 6.9 s of blank page. The Google
Fonts stylesheet is also render-blocking and pulls 8 font files (4 weights × Latin + Devanagari).

Fixes: render the start screen from static HTML immediately; move data to `data.json` loaded after first
paint and cached by the service worker; self-host a subset of Mukta in 2 weights (400, 700) with
`font-display: swap`; add `<link rel=preload>`. Expected: first paint under 1.5 s on slow 4G, total first-visit
weight roughly halved.

### P2 — The checklist and card details are hard to act on

- Combined checklist is the union of every eligible scheme's documents, so it grows to 8–10 items and includes
  documents the person does not need (see AH-003, FOR-005 above). No tick-off, no "which scheme needs this".
- "How to apply" is a paragraph of English with arrows; `mode` values like "Pro-active (PPP)" and
  "Institutional / Convergence" are internal vocabulary.
- The nodal officer is shown as a designation only ("Divisional Forest Officer (DFO)"), with no address, phone
  or "go to your CSC".
- Life-event schemes (14–35 per person) are collapsed under one heading at the bottom with the person's
  *chosen* events mixed with ones they did not choose.

### P3 — Smaller interface issues

- Language toggle buttons are 40 px tall (target: 44–48 px).
- Text below 15 px: stamp 11 px, `.meta` 14 px, brand subtitle 13 px. The stamp is the verification status
  and is the hardest text on the page to read.
- The start screen shows the raw file name `Karnal_Schemes_Master_v6_0_Sep2026.xlsx` to citizens.
- Event screen has 15 options (1,590 px); category screen 11; occupation up to 14. Long lists on one screen.
- `<html lang>` does switch with the toggle (good), but no `hreflang`/Open Graph/Twitter tags, so a WhatsApp
  share shows no preview image or description.
- No "Listen" (text-to-speech) for people who cannot read either language well.
- No text-size control.
- No way to search or browse the 258 schemes without answering questions.
- No notice when the scheme data has been updated since the last visit.

### Not testable here

On-device keyboard overlap with the fixed bottom bar on Android, real Jio/Airtel 4G timings, and the
Render response headers (`render.yaml` cannot be exercised locally). These need one check on a real phone
after deploy.

## 4. Persona outcomes

| # | Person | Screens | Elig / Check / Event | First "eligible" card | Would they know what to do? |
|---|---|---|---|---|---|
| 1 | Widow, 62, BPL | 8 | 16 / 16 / 27 | Paudhagiri (school saplings) | No. Her pension is in the yellow list, card 20+. |
| 2 | SC student, Class 11 | 8 (residence skipped) | 22 / 17 / 23 | Ambedkar Medhavi scholarship | Partly. Scholarships are first; details English only. |
| 3 | Farmer, 2 acres, buffaloes | 8 | 39 / 15 / 19 | Meri Fasal Mera Byora | Partly. Right schemes, but 73 cards and a death certificate on the list. |
| 4 | HBOCW construction worker | 8 | 18 / 12 / 27 | BOCW education assistance | Partly. 10 Labour Welfare schemes, all English detail. |
| 5 | Woman, 60% disability | 8 | 10 / 9 / 30 | VB-G RAM G (rural employment) | No. Aids/appliances and pension are "check"; saplings above them. |
| 6 | New mother, GEN | 8 | 10 / 12 / 22 | Paudhagiri | No. PMMVY and ABHB are "check"; JSSK eligible but 6th. |
| 7 | Street vendor, income unknown | 8 | 8 / 14 / 19 | Paudhagiri | No. PM SVANidhi is 6th. |
| 8 | Ex-serviceman, 58 | 8 | 7 / 9 / 14 | Paudhagiri | No. Nothing ex-serviceman-specific in the eligible list. |
| 9 | Woman MSME owner | 8 | 9 / 10 / 22 | Paudhagiri | No. NRLM is 4th; MSME schemes are "check". |
| 10 | Newborn daughter, AAY family | 8 | 19 / 13 / 23 | HAPPY transport card | Partly. Health schemes present, ABHB "check". |
| 11 | Everything "don't know" | 8 | 7 / 31 / 35 | Paudhagiri | No, but it is the honest answer. |

All reach results within 8 screens. Three get a useful first card (2, 3, 10); seven are shown saplings first.

## 5. What I propose to build, in order

1. **Correct results order and grouping** (engine untouched; presentation only): rank by specificity, demote
   the seven match-everyone schemes to the end of the list, merge "check: exclusion only" into the eligible
   group with a label, keep "event" schemes the person chose at the top and hide the ones they did not choose
   behind a button. Write the engine snapshot test first.
2. **Fewer, better-ordered questions**: ask only what the remaining candidates need; move residence and
   disability later; target 5–6 screens for most people.
3. **Results you can act on**: a one-line "what you get" and "where to go" on each card from existing fields;
   per-scheme documents instead of one union list, with tick-boxes; print as a 1–2 page slip; WhatsApp text
   of the top schemes only.
4. **History and links**: Back button, `#/scheme/ID` and shareable results via the fragment.
5. **Speed**: static start screen, `data.json`, self-hosted 2-weight Mukta subset, preload. Service-worker
   version bump and an "updated" notice.
6. **Readability**: Listen button (speechSynthesis), A/A+/A++ control, 48 px language toggle, stamp and
   meta text to 15 px, friendlier data line on the start screen.
7. **Browse and search** all schemes by sector/type with tolerant Hindi/English search.
8. **Findability**: Open Graph tags and a 1200×630 preview image.
9. **`DATA-ISSUES.md`** for the district team: the items in §3 (tagging, documents, missing links, missing
   Hindi), with scheme ids.

Items 1–4 change nothing about any scheme's facts or the engine's eligibility verdicts, only how they are
shown. I will keep the snapshot test green throughout.

## 6. Decisions needed from you before I start

1. **Hindi detail text.** Which do you want: (a) leave English-only and I make the English as clear as
   possible, (b) you get Hindi columns added to the master sheet, or (c) I produce a draft Hindi
   `benefit_short`/`how`/`docs` for all 258 schemes in a separate `data/hindi-draft.json` for an officer to
   check, and it ships only after that check?
2. **Match-everyone schemes.** Demote them to the end of the eligible list (my recommendation) or remove
   them from the results and show them once on a "for everyone" card?
3. **Data fixes.** Should I correct the obvious tagging errors (FOR-001 class 6–12, AH-003 death certificate,
   FOR-005 caste/disability) in `DATA` directly, flagged in the commit, or only list them in `DATA-ISSUES.md`
   for the next spreadsheet export? Rule 1 says list only; the first fix is one line and visibly wrong today.
4. **Go-ahead** for the order in §5, or a different priority.

---

# After the improvements (22 October 2026, commit on `main`)

Same method as above: Lighthouse 12 mobile on a gzip server (as Render serves), axe-core on 52 screen states
(every screen × Hindi/English × light/dark, details open, browse, scheme page), Playwright walkthroughs of the
same 11 people.

| Measure | Before | After |
|---|---|---|
| Lighthouse Performance | 60 | **97** (two runs) |
| First Contentful Paint | 6.9 s | **0.8–1.1 s** |
| Largest Contentful Paint | 6.9 s | 2.4–2.6 s |
| Accessibility / Best Practices / SEO | 100 / 100 / 100 | 100 / 100 / 100 |
| axe violations | 0 | **0** (52 screen states) |
| First-visit transfer | 933 KB (634 KB page + 8 Google font files) | **288 KB** (fonts self-hosted, 2 weights; data gzipped) |
| Requests to other sites | Google Fonts | **none** (CSP allows only the site's own files) |
| Screens to results (40 test profiles) | 8 for everyone | **6 for most** (1×4, 1×5, 19×6, 17×7, 2×8) |
| Widow's first "eligible" card | Paudhagiri (school saplings) | **Pension to Widows & Destitute Women** |
| Print-out for the widow | 34 pages | **2 pages** |
| Phone Back button | leaves the site, answers lost | moves between questions, answers kept |
| Shareable results / scheme links | none | `#/results/…`, `#/scheme/ID` (fragment only; never sent to a server) |
| Browse / search | none | all 258 schemes, spelling-tolerant Hindi/English search, sector and type filters |
| Read aloud / text size | none | Listen on every question and card; 3 text sizes |
| Data corrections | — | 6 tagging fixes (see `DATA-ISSUES.md`); engine verdicts otherwise unchanged (snapshot test) |

## Persona outcomes, after

| # | Person | Screens | Yes / Check | First card | Useful? |
|---|---|---|---|---|---|
| 1 | Widow, 62, BPL | 7 | 13 / 11 | Pension to Widows & Destitute Women (unless already drawing a pension) | Yes |
| 2 | SC student, Class 11 | 7 | 20 / 13 | Top Class Education for SC students; scholarships follow | Yes |
| 3 | Farmer, 2 acres, buffaloes | 6 | 34 / 11 | Livestock and agriculture schemes; no death/caste certificate on the list | Yes |
| 4 | HBOCW construction worker | 6 | 13 / 9 | Mukhya Mantri Panjikaran Protsahan (labour-board) | Yes |
| 5 | Woman, 60% disability | 6 | 5 / 6 | ADIP aids and appliances; disability pension to confirm | Yes |
| 6 | New mother, GEN | 6 | 6 / 7 | PMMVY maternity benefit, then JSSK | Yes |
| 7 | Street vendor, income unknown | 6 | 2 / 11 | PM SVANidhi | Yes |
| 8 | Ex-serviceman, 58 | 6 | 1 / 7 | Jan Dhan; ex-serviceman schemes are 60+ or need a different situation | Honest |
| 9 | Woman MSME owner | 6 | 3 / 8 | Start-up Village Entrepreneurship Programme | Yes |
| 10 | Newborn daughter, AAY family | 6 | 14 / 11 | Har Ghar – Har Grihini (LPG), ration, health | Yes |
| 11 | Everything "don't know" | 6 | 0 / 31 | Ujjwala, to check | Honest |

"Yes / Check" counts the person's own schemes; the six match-everyone schemes are in a collapsed group at the
end and life-event schemes in another.

## What was not done, and why

- **Hindi for benefit, documents and how-to-apply text**: left in English by decision (data, not code). The
  page uses `*_hi` fields automatically if the master sheet gains them.
- **Minifying app.js** (3 KB): not worth losing readable code for a district team.
- **Results page length**: 40–70 cards for farmers and students is the honest size of their lists; the
  person's own schemes come first, the rest is collapsed, and the slip is two pages.
- **Real-phone checks** still needed once deployed: Android keyboard over the bottom bar, Hindi voice
  availability for Listen, and the Open Graph preview on WhatsApp (the `og:url` / `og:image` tags assume
  `https://meri-yojana-karnal.onrender.com/`; change them in `public/index.html` if the site gets another name
  or a custom domain).


---

# Design round with tasteskill (23 October 2026)

Method: `.agents/skills/design-taste-frontend` (lint, inspect at 1440/768/390, critique). Before: 9 FAIL, 7 WARN
(eyebrow pill, emoji, gradient hero, 9 shadows, hairlines, no focal point, still page). After: **0 FAIL, 0 WARN**
with `few-pictures` and `no-footage` allowed (no photographs exist and the open collections were unreachable).

Direction dealt: **Colour chapters** (seed 516950161, nonprofit sector, palette and type kept). No redraws.
Idea: *the painted wall-notices of a Haryana village become the colour chapters.* Live thing: the "who are you
looking for?" list, whose rows carry the real scheme counts and start the questions with that type ticked.

```
ROUND 2
Seen in one second: the mosaic band of teal, saffron and four drawn artefacts; then the title at the 42% axis.
Idea (one sentence): the village wall-notice, one colour per wall, becomes the page's chapters.
Live thing: the who-is-it-for list with real counts; the department list with counts; the local clock.
Layout words by section: hero=mosaic+axis / who=menu / how=accordion strip / count=statement / about=inset split / footer=tiles
Scores: design 6.5 · usability 8 · creativity 7 · content 8 → overall 7.2
Caps applied: fewer than four real pictures → design ≤ 6.5; idea passes weakly for a neighbouring district → creativity ≤ 7.
Top three problems:
1. No photographs: the mosaic and the list carry drawings (desktop-fold.jpg). Needs 4–6 district photographs.
2. The accordion slivers read their names sideways on desktop (desktop-page-01.jpg); fine on the phone, where they stack.
3. Lighthouse Performance 89 (was 97): the display font and the larger stylesheet cost ~1 s of first paint on slow 4G.
```
