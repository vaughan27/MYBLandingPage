# MYB Intranet Landing Page — Revamp

A modular replacement for the old MYB intranet homepage. Two services:

```
frontend/   React (Vite) — the public landing page + the hidden analytics dashboard
backend/    FastAPI — ALL data access: content reads, visitor tracking, newsletter, dashboard
db/         Postgres schema — plain tables, no roles/views beyond one app user
```

**This used to be three services** (Postgres + PostgREST + FastAPI). PostgREST
has been removed — FastAPI now reads and writes everything itself
(`backend/app/routers/content.py` is what replaced it). One database role
(`myb_app`), no read-only views, no separate REST-generation layer. Fewer
moving parts, one less thing to run and keep in sync.

- **FastAPI** handles both plain content (quick links, events, news, gallery —
  see `routers/content.py`) and logic (visitor cookie, page-view logging,
  dashboard aggregates, newsletter signups). Every route talks to Postgres
  through the same `get_conn()` helper in `database.py`.
- **React frontend** renders sections from a single config file
  (`frontend/src/config/sections.config.js`). Turning a section on/off, or
  reordering the page, is a one-line change there — see "Adding/removing a
  section" below.

## Local setup (Postgres + FastAPI, no Docker, no PostgREST)

You need **Postgres** (16+), **[uv](https://docs.astral.sh/uv/)** for Python, and Node/npm for the frontend.

### 1. Database
```bash
createdb landingPage
psql -d landingPage -f db/schema.sql
```
This creates the `public` schema, one `myb_app` role, and seeds sample data. Re-running it needs a fresh db: `dropdb myb && createdb myb` first (see "db/schema.sql runs once" below).

The default password baked into `schema.sql` is `myb_app_pw` — fine for local dev, change it (and the matching `DATABASE_URL` below) for anything shared.

### 2. Backend (FastAPI, via uv) — this now serves everything
```bash
cd backend
uv sync                # creates .venv and installs deps from pyproject.toml
DATABASE_URL="postgresql://myb_app:myb_app_pw@localhost:5432/myb" \
DASHBOARD_KEY="change-me" \
CORS_ORIGINS="http://localhost:5173" \
uv run uvicorn app.main:app --reload --port 8000
```
`uv sync` reads `pyproject.toml` and gives you a `.venv` + `uv.lock` — no `pip install`, no requirements.txt to keep in sync by hand.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Vite's dev proxy (`vite.config.js`) forwards `/api` → `:8000`. That's the only proxy needed now — there's no separate `:3001` to configure.

Visit `http://localhost:5173`. The hidden dashboard is at whatever `DASHBOARD_PATH` you set (default `/ops/pulse-9f21`, see `backend/app/config.py` and `frontend/src/config/dashboard.js` — **keep those two in sync**), gated further by the `DASHBOARD_KEY` env var above.

### Running everything at once
Three terminal tabs (down from four). If that's annoying, a simple `Procfile` + `honcho`/`overmind`, or a short shell script with `&` and a trap to kill on exit, works well — happy to add one if you want it.

### `db/schema.sql` runs once, not repeatedly
It's a "create from scratch" script (`CREATE ROLE`, `CREATE TABLE`...) — running it against a database that already has these objects will error. For a structural change later (new column, new table), write a small one-off `ALTER TABLE ...` and run just that against the live database, then update `schema.sql` by hand so it still reflects the full picture for the next fresh install.

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
tables, served via FastAPI's `/api/content/*` endpoints (`backend/app/routers/content.py`),
with a local JSON fallback in `frontend/src/config/` used only if the API is
unreachable (so the page still renders something in dev).

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
