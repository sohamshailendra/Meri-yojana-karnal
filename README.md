# Meri Yojana – Karnal • मेरी योजना – करनाल

Bilingual (हिन्दी / English) scheme finder for District Karnal. Citizens answer up to 8 questions and see the
Central and Haryana Government schemes they are eligible for, the ones to check, and a documents checklist.
Nothing is saved or sent anywhere: all matching runs in the browser.

- `public/index.html`: the whole site (engine + scheme data from `Karnal_Schemes_Master` + interface)
- `public/manifest.webmanifest`, `public/sw.js`, `public/icon*`: install-as-app and offline support
- `test/check.js`: sanity checks; also the Render build command, so a broken update never goes live

```bash
node test/check.js                    # run the checks
npx serve public                      # or: python3 -m http.server -d public 8000
```

## Deploy on Render

**Blueprint (recommended):** Render dashboard → **New → Blueprint** → choose this repository. It reads
`render.yaml` and creates the static site `meri-yojana-karnal`.

**Or by hand:** **New → Static Site** → this repository, then:

| Setting | Value |
|---|---|
| Branch | `main` |
| Root Directory | *(leave empty)* |
| Build Command | `node test/check.js` |
| Publish Directory | `public` |

The site is free to host as a static site and gets HTTPS on `https://<name>.onrender.com`.
To use your own domain (e.g. a `karnal.gov.in` subdomain), add it under **Settings → Custom Domains** and create the
CNAME record Render shows.

## Updating the scheme data

Replace `public/index.html` with the newly exported page, keep the extra lines in `<head>` (description,
theme-color, icons, manifest) and the service-worker registration at the end of the last `<script>`, run
`node test/check.js`, then push. Render redeploys automatically. Visitors who installed the app get the new data the
next time they open it online.
