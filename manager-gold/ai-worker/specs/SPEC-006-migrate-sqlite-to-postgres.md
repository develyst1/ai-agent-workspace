# SPEC-006: Migrate the database SQLite → PostgreSQL
- Source: REQ-006
- Status: DONE (TASK-017 accepted 2026-07-29; verified on local Postgres; REQ-006 → SPEC_DONE, pending Porter acceptance. Remote-server migrate = parked deploy step.)
- Baseline: `../architecture-baseline.md` (§1 data store changes to Postgres here).

## Overview
Port persistence from SQLite to **PostgreSQL**, same schema + features, no data migration
(current SQLite holds only throwaway test data — schema parity is enough). Stay on **Drizzle**
(swap the SQLite dialect/driver for Postgres). Build + test against a **local** Postgres; the
stakeholder's remote server is a **deploy-time** concern only (parked, human/Porter). Backend
reads `DATABASE_URL`; target db name `manager_gold`.

## Design decisions (Sober)
- **Driver:** replace `bun:sqlite` + `drizzle-orm/bun-sqlite` with Postgres — recommend
  `postgres` (postgres.js) + `drizzle-orm/postgres-js` (clean on Bun); `pg` + `node-postgres`
  is an acceptable alternative. One client/pool in `src/db/index.ts`.
- **Schema dialect:** `sqliteTable` → `pgTable`. `text` stays `text`. **CRITICAL — epoch-ms
  timestamp columns (`created_at`, `updated_at`, `sessions.expires_at`) must become `bigint`
  (`bigint(... {mode:"number"})`), NOT `integer`.** Postgres `integer` is 32-bit and epoch-ms
  (~1.78e12) overflows it → data corruption/insert errors. This is the #1 gotcha of this port.
  (Keeping them as ms `bigint` avoids touching all the `Date.now()` call sites.)
- **Drop `PRAGMA foreign_keys = ON`** (SQLite-only) — Postgres enforces FKs + `ON DELETE CASCADE`
  natively. All existing FK/cascade behaviour is preserved.
- **Migrations:** regenerate for the Postgres dialect (drizzle-kit `dialect: "postgresql"`).
  The old SQLite `drizzle/*.sql` are SQLite-syntax — replace the migrations folder with the
  Postgres-generated ones (fresh history is fine: no prod data). Migrations must recreate the
  FULL schema (users, sessions, people, person_feelings, interactions, person_tags + all indexes
  + unique(email) + composite PK on person_tags).
- **Config:** `DATABASE_URL` in `env.ts` + `.env.example` (placeholder only, e.g.
  `postgres://postgres:postgres@localhost:5432/manager_gold`). Real remote creds live ONLY in
  `manager-gold-back/.env` (git-ignored), from `../../project-docs/db-postgres-access.md`.
  - **LOCAL build/test (provided 2026-07-29):** `DATABASE_URL=postgresql://postgres:smart2026@
    localhost:5432/manager_gold` — local password `smart2026` has **no `#`**, so **no `%23`** here.
  - **REMOTE/deploy (parked):** the prod password is `smart2026#` → **must** be `%23`-encoded in the
    URL (`smart2026%23`); a raw `#` breaks URL/.env parsing. Remote-only; not for build.
- **Queries:** current SQL is portable. The TASK-008 search uses `lower(col) LIKE lower(%term%)`
  — valid on Postgres (could be `ILIKE`, optional). Verify no other SQLite-only SQL remains.

## Data Model
Unchanged in shape — same 6 tables, columns, relationships, indexes as SPEC-001/002. Only the
column **types** change per dialect (text→text; epoch-ms integer→**bigint**) and FKs become
native. No new/removed tables or fields.

## Testing (this is the real acceptance proof)
- The suite currently runs on a throwaway `test.sqlite`. Port it to a **local test Postgres**:
  point tests at a local DB via `DATABASE_URL` (or a `TEST_DATABASE_URL`), **migrate it before the
  suite**, and keep tests isolated (existing tests already use random emails/uuids, so they don't
  collide; add a clean/migrate step so a run starts from a known schema).
- **All existing tests must pass on Postgres** (auth, people CRUD, sub-resources, search/filter/
  export, AI advice+summary — the AI tests keep mocking the gateway; no real AI/DB-secret in tests).
- Engineers now need a **local Postgres** to run `bun test` (document the one-liner to create a
  local `manager_gold` dev/test db in the README).

## Non-functional
- No behaviour change — identical API + isolation (`getOwnedPerson`, per-user scoping) on Postgres.
- No secret committed: `.env.example` uses a local placeholder; real creds only in `.env`.
- Connection pooling via the driver's default; close cleanly.

## Tasks
- TASK-017: BE — port SQLite→Postgres: driver + `pgTable` schema (**bigint** ms columns) + drop
  PRAGMA + regenerated Postgres migrations + `DATABASE_URL` config + test suite green on a local
  Postgres. (depends: —)

## Deploy note (human/Porter — parked, NOT engineer work)
On the remote server `154.197.124.206`: create database `manager_gold`, set `DATABASE_URL` with the
`%23`-encoded password (creds: `../../project-docs/db-postgres-access.md`), run the Postgres
migrations. Part of the parked deployment step; engineers build/verify on local Postgres only.

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
