# PostgreSQL access — stakeholder-provided (for the SQLite→PostgreSQL change)

Source: stakeholder (dev@smartalliance.co.th), provided to Porter (PM) on 2026-07-28.

## ⚠️ SECRET — handle with care
- This contains a **real database password**. It must live ONLY in the backend
  `manager-gold-back/.env` (which is git-ignored). **Never commit it** to the
  `manager-gold-back` / `manager-gold-front` repos.
- The stakeholder pasted it in chat; ideally rotate it later and keep future
  secrets in `.env` only.

## Connection
Database name **confirmed by stakeholder (2026-07-28): `manager_gold`**. Full URL:
```
DATABASE_URL=postgresql://postgres:smart2026%23@154.197.124.206:5432/manager_gold
```
- user: `postgres`
- password: **`smart2026#`** — in the URL the `#` MUST be percent-encoded as
  **`%23`** (a raw `#` in a `.env`/URL is read as a comment/fragment and breaks).
  So the URL uses `smart2026%23`.
- host: `154.197.124.206`
- port: `5432`
- database: **`manager_gold`** (the deploy-time remote may need this db created first).

## Dev / local database (for build + test) — stakeholder-provided 2026-07-29
Engineers build/test against a **local** Postgres (the test suite creates/drops
data, so never the prod db). Stakeholder: use localhost, password `smart2026`
(the LOCAL password has **no `#`** → no `%23` encoding needed).
```
DATABASE_URL=postgresql://postgres:smart2026@localhost:5432/manager_gold
```
- host `localhost` · port `5432` · user `postgres` · password `smart2026` · db `manager_gold`.
- Jason may run a local Postgres (e.g. Docker) with these credentials; `.env`-only, never committed.
- **This is the DATA REQUEST answer that unblocks TASK-017.**

## Build vs deploy (important)
- **Build:** engineers implement PostgreSQL support and test against a LOCAL/dev
  Postgres — they do NOT need to connect to `154.197.124.206`.
- **Deploy (currently parked):** this remote server is the deploy-time database.
  Connecting to it + running migrations there is a deploy/ops step (human/Porter),
  not part of the build.
