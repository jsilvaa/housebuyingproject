# House-Hack ROI Ledger — Netlify deploy

Static, single-file React dashboard (React/Babel loaded from CDN, no build step).

## One-time setup (do this outside any OneDrive/Dropbox-synced folder — cloud sync tools lock git's internal files mid-commit)

1. Unzip this folder somewhere local, e.g. `C:\dev\roi-dashboard-site`.
2. Open a terminal in that folder and run:
   ```
   git init
   git add -A
   git commit -m "Initial deploy"
   git branch -M main
   ```
3. Create a new empty repo on GitHub (github.com/new) — no README/license, just an empty repo. Name it whatever you like, e.g. `roi-dashboard`.
4. Connect and push:
   ```
   git remote add origin https://github.com/<your-username>/roi-dashboard.git
   git push -u origin main
   ```
5. In Netlify: **Add new site → Import an existing project → GitHub** → pick the repo. Netlify will read `netlify.toml` automatically (publish dir `.`, no build command). Click **Deploy site**.

## Every time you update the dashboard

1. Regenerate `ROIDashboard.html` from `ROIDashboard.jsx` as usual (per the project's CLAUDE.md).
2. Copy the new `ROIDashboard.html` over this folder's `index.html`.
3. `git add -A && git commit -m "update dashboard" && git push`
4. Netlify auto-deploys the new push within a few seconds — nothing else to do.
