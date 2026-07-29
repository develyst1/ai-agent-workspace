# TASK-017: Port backend SQLite → PostgreSQL
- Source: SPEC-006
- Status: DONE
- Assignee: Jason (BE)
- Depends on: none (build/test on a LOCAL Postgres)

## What to do
Port `manager-gold-back` persistence from SQLite to PostgreSQL per SPEC-006. Same schema +
features, no data migration. Build + test on a **local** Postgres (remote server = parked deploy).
- **Driver:** replace `bun:sqlite` + `drizzle-orm/bun-sqlite` with Postgres (`postgres` +
  `drizzle-orm/postgres-js` recommended; `pg`/node-postgres ok). One client in `src/db/index.ts`.
- **Schema** (`src/db/schema.ts`): `sqliteTable`→`pgTable`; `text` stays; **epoch-ms columns
  (`created_at`, `updated_at`, `sessions.expires_at`) → `bigint({mode:"number"})` — NOT `integer`**
  (32-bit overflow; this is the key gotcha). Keep unique(email), all indexes, and the
  `person_tags` composite PK. FKs stay `references(... onDelete:"cascade")`.
- **Drop `PRAGMA foreign_keys = ON`** from `db/index.ts` (SQLite-only; Postgres is native).
- **Migrations:** switch drizzle-kit to `dialect:"postgresql"`; regenerate — replace the SQLite
  `drizzle/*.sql` with Postgres migrations that recreate the full schema on a fresh db. `bun run
  migrate` applies them.
- **Config:** `AI_CENTER_BASE_URL` stays; add/keep `DATABASE_URL` in `env.ts` + `.env.example`
  (local placeholder `postgres://postgres:postgres@localhost:5432/manager_gold` — **no real creds**).
- **Tests:** point the suite at a **local test Postgres** (`DATABASE_URL`/`TEST_DATABASE_URL`),
  migrate before running, keep isolation (random emails already used). Get the WHOLE suite green.
  AI tests keep mocking the gateway. Add a README note: how to create the local `manager_gold` db.

## Definition of Done
- [x] `bun run migrate` creates the full schema (6 tables + indexes + unique(email) + person_tags
      composite PK) on a **fresh local Postgres db `manager_gold`**; no `PRAGMA`/SQLite left.
- [x] Epoch-ms columns are `bigint` — insert a session/person and read back a full 13-digit ms
      timestamp intact (a test or documented check proving no 32-bit overflow).
- [x] `bun test` — the **entire existing suite passes against local Postgres** (auth, people CRUD,
      sub-resources, search/filter/export, AI advice+summary). Paste the pass count.
- [x] Backend boots against `DATABASE_URL`; `.env.example` has a local placeholder; **no real
      creds/secret committed** (`git`-verify `.env` untracked).
- [x] README documents the one-liner to create a local `manager_gold` dev/test db.

## Implementation Notes
Implemented by Jason on 2026-07-29 in `H:\manager-gold\manager-gold-back`
(branch `dong`, commit `b91413b`). Built + verified on a **local** Postgres 18.4
(`postgres://postgres:***@localhost:5432/manager_gold`); the prod remote `154.197.124.206`
was **not** touched. Creds only in git-ignored `.env`.

**Files changed:**
- `package.json` — added `postgres@3.4.9`; drizzle-kit stays.
- `src/db/schema.ts` — `sqliteTable`→`pgTable`; epoch-ms `created_at`/`updated_at`/
  `expires_at` → `bigint({mode:"number"})` (the 32-bit gotcha); kept `unique(email)`,
  every index, `person_tags` composite PK, and FK cascades.
- `src/db/index.ts` — `postgres.js` client + `drizzle-orm/postgres-js`; **dropped
  `PRAGMA foreign_keys`** (Postgres native). `idle_timeout` so scripts/tests exit cleanly.
- `src/db/migrate.ts` — `postgres-js` migrator (own `max:1` client, closed after).
- `drizzle.config.ts` — `dialect:"postgresql"`. Migrations regenerated
  (`0000_faulty_pretty_boy.sql`); old SQLite `drizzle/*.sql` removed.
- **Async refactor** (PG driver is async where `bun:sqlite` was sync): `getOwnedPerson`,
  `requireAuth`, `startSession`/`endSession`, all people/auth/ai route handlers, and the
  child-read helpers now `await`; list/profile/export/advice use `Promise.all`.
- `src/env.ts` + `.env.example` — `DATABASE_URL` + `TEST_DATABASE_URL` (placeholders only).
  `README.md` — Postgres setup + the `CREATE DATABASE manager_gold[_test]` one-liner.
- `test/setup.ts` — points the suite at a **local test DB** (`TEST_DATABASE_URL`), with a
  guard that refuses any non-local host; drops `public` **and `drizzle`** schemas then
  migrates fresh each run (isolated + repeatable). Existing tests updated to `await` DB calls;
  added a **bigint 13-digit round-trip** test.

**Verification (evidence):**
- `bun run migrate` → applied on fresh `manager_gold`; `\dt` shows all 6 tables
  (users, sessions, people, person_feelings, interactions, person_tags). Generated DDL has
  `created_at`/`updated_at`/`expires_at` as `bigint NOT NULL`. No `PRAGMA`/SQLite remains.
- **bigint / no overflow:** test inserts `created_at = 1785000000000` and reads it back exactly
  (13 digits, JS number); a live register returned `createdAt = 1785269804943` (13 digits).
- `bun test` → **50 pass / 0 fail** (181 assertions) against local Postgres — auth, people CRUD,
  sub-resources, search/filter/export, AI advice+summary (gateway still mocked). **Repeatable**
  (ran twice, both 50/0) after the schema-reset fix.
- **Boot:** `PORT=4021 bun run start` (avoided Fern's :4020 per §7) → migrations run, `GET /`
  ok, register→PG write→`/auth/me` 200, stopped my PID.
- **Hygiene:** `.env` git-ignored (untracked, verified); `.env.example` placeholders only; no
  `smart2026`/secret in the staged diff; no `*.sqlite` tracked.

**Notes for review:**
- Two local dbs created: `manager_gold` (dev) + `manager_gold_test` (suite; schema wiped each run).
- One gotcha I hit + fixed: the migrator records history in a **separate `drizzle` schema**, so a
  second test run must drop `drizzle` too (not just `public`) or migrations get skipped and tables
  vanish — setup.ts now drops both.
- `q` search stays `lower(col) LIKE lower(%term%)` — valid on Postgres (left as-is; `ILIKE` optional).
- Remote deploy (create `manager_gold` on `154.197.124.206`, `%23`-encoded prod password, run
  migrations) stays **parked / human-Porter** per SPEC-006 — not part of this build.
- Commit local on `dong` only (not pushed), per baseline §6/§7.

## Questions
- **Jason → Sober:** blocked — needs a Postgres to build/test against; the dev environment has no
  local Postgres. (Set BLOCKED; correctly did not connect to the prod remote or guess.)
  > Sober: valid block — my SPEC assumed a local Postgres exists, which this environment lacks.
  > Routing it up as a DATA REQUEST (below). Don't use the prod remote for the test suite (it
  > creates/drops throwaway users) — we need a dev/test DB.
- **DATA REQUEST (→ @Porter → human):** the engineer needs a **Postgres to build + run the test suite
  against** for TASK-017. Please provide ONE of:
  (a) a **local Postgres** enabled on the dev machine (then just confirm the local connection, e.g.
      `postgres://postgres:postgres@localhost:5432` — engineer creates `manager_gold` locally), OR
  (b) a **dev/test Postgres connection string** to a database that is **NOT** the production
      `manager_gold` (the test suite creates and deletes throwaway accounts, so it must not run against
      prod data). A separate db like `manager_gold_dev` / `manager_gold_test` (on any host you control)
      is ideal.
  *Why:* SPEC-006 builds/tests on a local/dev Postgres; the remote `154.197.124.206` is deploy-time
  (prod) only. Build is blocked until an engineer-usable dev Postgres exists. Put the connection in
  `../../project-docs/` (or confirm the local setup); it goes in `.env` only, never committed.
  > **answer (Porter → Sober → Jason, 2026-07-29):** UNBLOCKED. Use a **local** Postgres —
  > `DATABASE_URL=postgresql://postgres:smart2026@localhost:5432/manager_gold` (localhost; password
  > `smart2026` — **no `#`**, so **no `%23` encoding** here). See `../../project-docs/db-postgres-access.md`.
  > `.env`-only, never committed. @Jason — go.
  > **Sober notes:**
  > - The `%23` gotcha in SPEC-006 applies to the **remote/prod** password `smart2026#` (deploy-time),
  >   NOT this local one (`smart2026`, no `#`).
  > - This is a LOCAL `manager_gold` (localhost) — fine for build. For **`bun test`**, prefer creating a
  >   separate local **`manager_gold_test`** db (or a `TEST_DATABASE_URL`) so the suite's create/drop of
  >   throwaway users doesn't churn your dev data — your call; migrate it before the run either way.
  > - Still don't touch the remote `154.197.124.206` (deploy/prod only).

## Review
**Verdict: DONE** — Sober, 2026-07-29 (commit `b91413b` on `dong`). Read `schema.ts`, `db/index.ts`,
`db/migrate.ts`, `test/setup.ts`, `people/service.ts`, and the generated migration; ran my own checks.
- **The #1 gotcha is handled in reality:** every epoch-ms column (`created_at`/`updated_at`/
  `expires_at`) is `bigint NOT NULL` in the generated DDL (grep-confirmed) — not `integer`. bigint
  round-trip tested (13-digit).
- **Dialect port correct:** `pgTable` + `postgres.js`/`drizzle-orm/postgres-js`; `PRAGMA foreign_keys`
  dropped (Postgres native); schema parity kept (unique(email), all indexes, `person_tags` composite
  PK, FK cascades). Migrations regenerated for the postgres dialect; old SQLite SQL removed.
- **Async refactor verified by the suite:** `getOwnedPerson`/`requireAuth`/session + all handlers now
  `await` (Promise.all where fanned out) — 50 tests pass on local Postgres, **repeatable (ran twice)**,
  covering every flow; a missed await would have failed them.
- **Test-setup safety (excellent):** `setup.ts` **refuses any non-local DB** (regex guard) before it
  `DROP SCHEMA public/drizzle` + migrates fresh — the destructive reset can't hit a remote/prod DB.
  Good catch on dropping the `drizzle` bookkeeping schema too (else migrations skip).
- **Security/hygiene: I verified independently** — `git grep smart2026` on tracked files = empty;
  `.env` untracked; `.env.example` placeholders only. No secret committed. Remote `154.197.124.206`
  untouched (build on local PG).

DoD: all 5 met. **Only task of SPEC-006 → REQ-006 complete** (verified on local Postgres per the REQ;
the remote-server migrate is the parked deploy step).
