# Meri Yojana – Karnal • मेरी योजना – करनाल

Bilingual (हिन्दी / English) scheme finder for District Karnal. Citizens answer about six questions and see the
Central and Haryana Government schemes they are eligible for, the ones to check, one next step per scheme and a
documents checklist. Nothing is saved or sent anywhere: all matching runs in the browser.

| File | What it is |
|---|---|
| `public/index.html` | The page: head, a static Hindi start screen (paints before anything else loads), script tags |
| `public/style.css` | Design: teal and saffron theme, light and dark, print slip, self-hosted Mukta and Baloo 2 font faces |
| `public/emblem.png` | Government of Haryana emblem (header, footer, preview image) |
| `public/engine.js` | Matching and question engine (`YojanaEngine`); also loads in Node for the tests |
| `public/app.js` | Interface: words in both languages, questions, results, history, print, WhatsApp |
| `public/data.json` | The 258 schemes, exported from `Karnal_Schemes_Master` (see **Updating the data**) |
| `public/sw.js`, `manifest.webmanifest`, `icon*`, `fonts/` | Install-as-app, offline use, fonts |
| `test/check.js` | Sanity checks; the Render build command, so a broken update never goes live |
| `test/engine.test.js` | Snapshot of the engine's verdicts for 40 answer profiles |
| `scripts/import-export.js` | Pulls a new scheme list out of an exported page into `data.json` |
| `AUDIT.md`, `DATA-ISSUES.md`, `prompts/` | The audit this work started from, data questions for the district team, the improvement prompt |

```bash
node test/check.js                    # run every check (also runs the engine snapshot)
npx serve public                      # local server with gzip, like Render; then open http://localhost:3000
```

## Deploy on Render

**Blueprint (recommended):** Render dashboard → **New → Blueprint** → choose this repository. It reads
`render.yaml` and creates the static site `meri-yojana-karnal` with the security, CSP and cache headers.

**Or by hand:** **New → Static Site** → this repository, then:

| Setting | Value |
|---|---|
| Branch | `main` |
| Root Directory | *(leave empty)* |
| Build Command | `node test/check.js` |
| Publish Directory | `public` |

The site is free to host as a static site and gets HTTPS on `https://<name>.onrender.com`. To use your own
domain (e.g. a `karnal.gov.in` subdomain), add it under **Settings → Custom Domains** and create the CNAME
record Render shows.

## Updating the data

1. Run the district's `yojana_kit` (`python build_schemes.py Karnal_Schemes_Master_vX_Y.xlsx`) as before. It writes
   `schemes.json` (and the one-file app and the Data Gaps workbook). Then:
   ```bash
   node scripts/import-export.js path/to/schemes.json        # or the exported Karnal_Yojana_App.html
   ```
   It rewrites `public/data.json` and lists schemes added or removed.
2. Re-apply the corrections listed under *Corrections already made in the page* in `DATA-ISSUES.md`, unless the
   master sheet already has them.
3. `node test/check.js`. If the engine's verdicts changed, it prints every difference; when they are intended,
   run `node test/engine.test.js --update` and mention the differences in the commit.
4. Push. Render redeploys; visitors see "the scheme list was updated on …" on their next online visit, and
   the installed app refreshes itself.

If the master sheet gains Hindi columns, export them as `benefit_hi`, `benefit_short_hi`, `how_hi`, `docs_hi`
(list) and `nodal_hi`; the page will prefer them automatically.
