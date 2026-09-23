# MYB Intranet Landing Page — Revamp

A modular replacement for the old MYB intranet homepage. Built as three independent
services so you can swap or extend any layer without touching the others:

```
frontend/   React (Vite) — the public landing page + the hidden analytics dashboard
backend/    FastAPI — custom logic: visitor tracking/cookies, dashboard stats, newsletter relay
db/         Postgres schema + PostgREST config — instant REST API for simple content tables
```

## Why this split

- **PostgREST** sits directly on Postgres and auto-generates a REST API for the
  "content" tables that are basically CRUD: `quick_links`, `events`, `news_items`,
  `newsletter_subscribers`, `gallery_images`. Editing a table (or adding a new one)
  is enough to add a new content type — no backend code required.
- **FastAPI** handles everything that isn't plain CRUD: setting/reading the visitor
  cookie, logging page views, computing the aggregated numbers the dashboard shows,
  and proxying newsletter signups (so the public site never talks to Postgres
  directly with write access).
- **React frontend** renders sections from a single config file
  (`frontend/src/config/sections.config.js`). Turning a section on/off, or
  reordering the page, is a one-line change there — see "Adding/removing a
  section" below.

## Local setup (no Docker — Postgres, PostgREST and the backend run as native processes)

You need three things installed once: **Postgres** (16+), the **PostgREST** binary, and **[uv](https://docs.astral.sh/uv/)** for Python. Node/npm for the frontend as usual.

### 1. Database
```bash
createdb myb
psql -d myb -f db/schema.sql
```
This creates the `api` schema, the `web_anon` / `authenticator` / `web_writer` roles, and seeds sample data. If you re-run it, drop the db first: `dropdb myb && createdb myb`.

By default the roles use the passwords baked into `schema.sql` (`authenticator` / `postgres`, `web_writer` / `web_writer_pw`) — fine for local dev, change them for anything shared.

### 2. PostgREST (serves the `*_public` content views)
Download the binary once from https://github.com/PostgREST/postgrest/releases (grab the `linux-static-x64` or `macos` tarball, extract it, put `postgrest` on your PATH). Then:
```bash
PGRST_DB_URI="postgres://authenticator:postgres@localhost:5432/myb" \
PGRST_DB_SCHEMAS="api" \
PGRST_DB_ANON_ROLE="web_anon" \
PGRST_SERVER_PORT=3001 \
postgrest
```
(Or point it at `db/postgrest.conf` instead of env vars: `postgrest db/postgrest.conf`.)

### 3. Backend (FastAPI, via uv)
```bash
cd backend
uv sync                # creates .venv and installs deps from pyproject.toml
DATABASE_URL="postgresql://web_writer:web_writer_pw@localhost:5432/myb" \
DASHBOARD_KEY="change-me" \
CORS_ORIGINS="http://localhost:5173" \
uv run uvicorn app.main:app --reload --port 8000
```
`uv sync` reads `pyproject.toml` and gives you a `.venv` + `uv.lock` — no `pip install`, no requirements.txt to keep in sync by hand.

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
Vite's dev proxy (`vite.config.js`) already forwards `/api` → `:8000` and `/content` → `:3001`, so nothing else to configure.

Visit `http://localhost:5173`. The hidden dashboard is at whatever `DASHBOARD_PATH` you set (default `/ops/pulse-9f21`, see `backend/app/config.py` and `frontend/src/config/dashboard.js` — **keep those two in sync**), gated further by the `DASHBOARD_KEY` env var above.

### Running everything at once
Four terminal tabs is normal for this kind of stack. If that's annoying, a simple `Procfile` + `honcho`/`overmind`, or just a short shell script with `&` and a trap to kill on exit, works well — happy to add one if you want it.

## Adding / removing a landing page section

Open `frontend/src/config/sections.config.js`:

```js
export const SECTIONS = [
  { id: "hero", enabled: true, component: "Hero" },
  { id: "quickLinks", enabled: true, component: "QuickLinks" },
  { id: "featureTiles", enabled: true, component: "FeatureTiles" },
  { id: "gallery", enabled: true, component: "Gallery" },
  { id: "events", enabled: true, component: "Events" },
  { id: "newsletter", enabled: true, component: "Newsletter" },
  { id: "latestNews", enabled: true, component: "LatestNews" },
];
```

- Flip `enabled: false` to hide a section without deleting code.
- Reorder the array to reorder the page.
- To add a brand-new section: drop a component in `frontend/src/components/`,
  register it in `frontend/src/components/registry.js`, add an entry here.

Quick links, feature tiles, and gallery images are themselves data, not hardcoded
markup — they come from the `quick_links`, `feature_tiles`, and `gallery_images`
tables via PostgREST, with a local JSON fallback in `frontend/src/config/` used
only if the API is unreachable (so the page still renders something in dev).

## About the "secret" dashboard

A couple of things worth flagging since you're hosting this on the intranet:

- **"Secret via obscure URL" is not real access control.** Anyone who finds the
  link (browser history, a shared screenshot, a referrer header) can see it. This
  scaffold adds a shared-secret key on top (`DASHBOARD_KEY`) so an obscure path
  isn't the only thing standing in the way — but it's still a single shared
  password, not per-user login. That matches your "no login on the landing page"
  requirement, but if the dashboard should only be for IT/management, consider
  eventually putting it behind your existing SSO/Active Directory instead of a
  shared key.
- **Cookie-based tracking on an internal, no-login site** means you're tracking
  by browser/device, not by identity — you won't know *which employee* visited,
  just that "visitor #482 opened the page 6 times this week." That's usually
  what's wanted for traffic stats. If you later want it tied to a real employee
  identity, that needs a login system, which is a bigger decision than this
  scaffold makes for you.
- No tracking script talks to any third party — everything stays inside your
  own Postgres instance.

## What's stubbed vs. real

Everything here runs end-to-end (cookie set on first visit, page view logged,
dashboard reads real aggregates back out of Postgres). What's intentionally left
for you to fill in per your actual content:
- Real photography for the hero/gallery (placeholders are colored blocks)
- Copy for events/news (seed rows are examples)
- Email delivery for newsletter confirmations (the endpoint stores the
  subscriber; wiring an actual mail provider is a few lines in
  `backend/app/routers/newsletter.py`)
- Branding tokens in `frontend/src/styles/tokens.css` — pulled from the current
  MYB logo colors, adjust to taste
