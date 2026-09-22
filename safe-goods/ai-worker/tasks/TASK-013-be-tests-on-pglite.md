# TASK-013: BE Change 1 — remove TEST_DATABASE_URL; `bun test` on embedded PGlite; AC-7 / AC-8 proof
- Source: SPEC-002 (§Change 1)
- Owner: BE (Jason)
- Status: DONE (2026-09-21, Sober)
- Depends on: TASK-012

## What to do
The owner removed the test-database env (REQ-002 §Change 1). `bun test` must need **no env**
and must **never open** the database named by `DATABASE_URL`. SPEC-002 §Change 1 decides how:
an embedded PostgreSQL (`@electric-sql/pglite`) inside the test process. Sober probed it on this
machine (Bun 1.3.14, PGlite 0.5.8 = PostgreSQL 18.3): uuid / timestamptz / `lower(email)` unique
index / identity / transactions / RETURNING all work.

1. Deps: `bun add -d @electric-sql/pglite` (exact pin; dev dependency — the app never loads it).
2. `src/db/client.ts` → factory. Keep the exported `Db` type and the `db` singleton, but:
   `createPostgresDb(url)` (postgres.js, as now) and `createPgliteDb(client: PGlite)`
   (`drizzle-orm/pglite`); a `setTestDb(db)` hook the preload calls **before** anything imports the
   client, so `db` resolves to the PGlite instance in tests and to `DATABASE_URL` otherwise. `pingDb`
   works on both.
3. Migrator: `runMigrations()` picks `drizzle-orm/pglite/migrator` vs `drizzle-orm/postgres-js/migrator`
   by the db kind; both read `./drizzle`.
4. `src/env.ts`: `DATABASE_URL` stays required for the app; under `bun test` (`NODE_ENV === "test"`,
   which Bun sets) it is **optional and never read** — the preload must not have to set it. The
   `DATABASE_URL is missing` exit still fires for `bun src/index.ts` (AC-6 unchanged).
5. `src/test/setup.ts`: `new PGlite()` (in-memory) → `setTestDb(createPgliteDb(client))` → migrate
   once → `JWT_SECRET`, `UPLOAD_DIR` (OS temp) as before. Delete every mention of `TEST_DATABASE_URL`
   (code, `.env.example`, README, `bunfig.toml` comments). `resetDb()` keeps TRUNCATE + seed per file.
6. Unique-violation helper (`src/lib/pg.ts`): Drizzle wraps PGlite's error — check
   `e.code === "23505" || e.cause?.code === "23505"` (and the constraint name on either level).
7. Re-run the whole suite; the concurrency test (TASK-012 (b)) stays — PGlite serialises the two
   requests, the assertion (one 200 + one 409, one event) still holds. If any test needs a real
   multi-connection Postgres to pass, say so in `## Questions` rather than weakening it.
8. README: "`bun test` needs no database and no env — it runs an embedded PostgreSQL in memory."

## Definition of Done
- [x] `grep -rn "TEST_DATABASE_URL" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist` → **no hits** (AC-7) — paste.
- [x] `bun test` with **no `.env` at all** (temporarily rename it, then restore) → all green — paste the summary and the command showing `.env` absent.
- [x] AC-8: `DATABASE_URL` → your local `safe-goods_local` holding exactly one room (paste `SELECT code, status, updated_at FROM rooms`), run `bun test` to completion, re-run the same SELECT → identical row; also `SELECT count(*) FROM users` before/after identical — paste both.
- [x] `bun test` summary pasted: **≥ 50 pass, 0 fail** (name the runtime: PGlite version from `SELECT version()` printed once by the preload).
- [x] `bun run dev` with `DATABASE_URL` set still boots on real Postgres; `DATABASE_URL=` → `DATABASE_URL is missing`, exit 1 (AC-6 unchanged) — paste.
- [x] `bunx tsc --noEmit` exit 0; `package.json` dev-dependency line pasted (exact pin). `git status --short`; no commit.

## Implementation Notes
(Jason, 2026-09-21. Bun 1.3.14; embedded runtime = **PostgreSQL 18.3 (PGlite 0.5.8) on wasm32** — printed once by the preload. Local checks against my `safe-goods_local` (PG 18.4). No git write.)

**⚠️ One thing Sober should know first:** the repo's git-ignored `.env` now carries the owner's **remote dev-DB** `DATABASE_URL` (he placed it; I did not touch the file). I never ran anything against it: every DoD step that needs a real Postgres was run with `DATABASE_URL=<my local safe-goods_local>` passed on the command line, and `bun test` cannot open `DATABASE_URL` by construction (see AC-8). Note for whoever runs `bun run dev` on this machine: with that `.env`, the app boots against the dev DB and its 60-second sweep will write there — expected once it is the dev box, but not "local only" any more.

**Dev dependency:** `"@electric-sql/pglite": "0.5.8"` (devDependencies; the app never imports it — `src/db/client.ts` only imports its *type*, and `drizzle-orm/pglite` is loaded there but instantiated only through `createPgliteDb`, which the preload alone calls).

**What changed:**
- `src/db/client.ts` → factory. `createPostgresDb(url)` (postgres.js) / `createPgliteDb(client)` (`drizzle-orm/pglite`) both return `{ kind, db, ping, close }`; `Db = PgDatabase<PgQueryResultHKT, typeof schema>` so every route/serializer is driver-agnostic and unchanged. The `db` singleton is a lazy Proxy: importing the module never connects; the first query resolves the handle — the one installed by `setTestDb()` (tests) or `createPostgresDb(DATABASE_URL)` (app). **Under `NODE_ENV=test` with no test handle installed it throws instead of opening `DATABASE_URL`** — that is what makes AC-8 structural, not accidental. Also exports `dbKind()`, `pingDb()`, `closeDb()`; the raw `sql` export is gone (seed/migrate use `closeDb()` / `db.execute`).
- `src/db/migrate.ts` → `runMigrations()` picks `drizzle-orm/pglite/migrator` or `drizzle-orm/postgres-js/migrator` by `dbKind()`, same `drizzle/` folder; `rowsOf()` normalises `db.execute` results (postgres.js returns rows, PGlite `{ rows }`).
- `src/env.ts` → `DATABASE_URL` optional only when `NODE_ENV === "test"`; the `DATABASE_URL is missing` exit is unchanged for the app (AC-6 re-proven below).
- `src/lib/pg.ts` → walks `e` → `e.cause` → … for `code === "23505"` (+ constraint name on the same level) — Drizzle wraps PGlite's error one level down.
- `src/test/setup.ts` → `new PGlite()` (memory) → `setTestDb(createPgliteDb(client))` → `runMigrations()` once → prints `SELECT version()`; sets `JWT_SECRET`, `UPLOAD_DIR` (OS temp). Reads no env. `resetDb()` (per file) = `db.execute(TRUNCATE … RESTART IDENTITY CASCADE)` + `seed()` as before.
- `src/routes/delivery.test.ts` → `makeDue` / `countEvents` now go through the query builder (`sql\`now() - interval '1 second'\`` / `count()` join) instead of the removed raw client — same assertions.
- `TEST_DATABASE_URL` deleted from `.env.example`, README, my `.env`; README §Tests now reads "`bun test` needs no database and no env — it runs an embedded PostgreSQL (PGlite) in memory and never touches `DATABASE_URL`." `bunfig.toml` unchanged (it only names the preload).
- The concurrency test (TASK-012 (b)) passes unchanged on PGlite — one 200, one 409, one event — no test needed a real multi-connection server, so nothing to raise in §Questions.

**AC-7:**
```
$ grep -rn "TEST_DATABASE_URL" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude=dist.zip
(no hits)
```
**`bun test` with no `.env` at all** (`mv .env .env.bak` → `ls -a .env` → `No such file or directory` → run → `mv` back):
```
[test] embedded database: PostgreSQL 18.3 (PGlite 0.5.8) on wasm32-unknown-emscripten, compiled by emcc … 3.1.74, 32-bit
 50 pass
 0 fail
Ran 50 tests across 6 files. [6.59s]
```
**AC-8** — `DATABASE_URL=postgresql://postgres:***@localhost:5432/safe-goods_local` (holding exactly one room, the COMPLETED `YA4PS867` from TASK-011's smoke; the other rooms deleted beforehand):
```
BEFORE  SELECT code, status, updated_at FROM rooms → YA4PS867 | COMPLETED | 2026-09-21 21:08:09.506+07   (1 row)
        SELECT count(*) FROM users               → 4
$ DATABASE_URL=… bun test → 50 pass / 0 fail — Ran 50 tests across 6 files. [6.19s]
AFTER   SELECT code, status, updated_at FROM rooms → YA4PS867 | COMPLETED | 2026-09-21 21:08:09.506+07   (1 row)   — identical
        SELECT count(*) FROM users               → 4                                                        — identical
```
(Ran a second time with the `.env` as the owner left it — dev-DB URL present — same 50/50; the suite never connected anywhere: PGlite is in-process and the client refuses `DATABASE_URL` under test.)
**`bun test` summary (runtime PGlite 0.5.8 = PostgreSQL 18.3):** `50 pass · 0 fail · 245 expect() calls · Ran 50 tests across 6 files.` — three consecutive runs (6.82 s / 6.59 s / 6.19 s), identical.
**AC-6 unchanged:**
```
$ DATABASE_URL=postgresql://postgres:***@localhost:5432/safe-goods_local bun run dev
safe-goods-back listening on http://localhost:4018          (PORT=4018 from the owner's .env)
$ curl -s localhost:4018/api/v1/health → {"success":true,"data":{"ok":true,"time":"2026-09-21T14:31:41.161Z"}}
$ DATABASE_URL= bun src/index.ts
DATABASE_URL is missing
exit=1
```
**`bunx tsc --noEmit`** → exit 0. **`git status --short`:** ` M .env.example  M README.md  M bun.lock  M package.json  M src/db/client.ts  M src/db/migrate.ts  M src/db/seed.ts  M src/env.ts  M src/lib/pg.ts  M src/routes/delivery.test.ts  M src/test/helpers.ts  M src/test/setup.ts` — no commit.

**SPEC-002 §Deploy notes — checked against the code as built:** every line holds (`PORT`, `DATABASE_URL`, `UPLOAD_DIR`, single-origin `CORS_ORIGIN`, `AUTO_RELEASE_SECONDS` / `SWEEP_INTERVAL_MS`, `ADMIN_*`; `bun install → db:migrate → seed → start`; `/api/v1/health`; "bun test needs nothing and touches no database" is now true). Nothing to correct.

**UNVERIFIED:** nothing in the DoD.

## Questions

## Review
**Verdict: DONE (Sober, 2026-09-21).** Verified on my machine without touching the owner's `.env` target: `grep TEST_DATABASE_URL` → 0 hits (AC-7); `bun test` 50/50 on the embedded PGlite (PostgreSQL 18.3); `tsc` clean; `@electric-sql/pglite 0.5.8` pinned as a dev dependency; `src/db/client.ts` throws under `NODE_ENV=test` unless the preload installed the embedded handle — AC-8 is structural, and Jason's before/after row check proves it empirically. AC-6 re-proven. Index empty, no commit. Good discipline on the dev-DB URL: never used, flagged.
Routed to Porter (fact for SYSTEM-FACTS): the repo's `.env` on this machine now points `safe-goods-back` at the owner's remote dev DB — `bun run dev` here writes there (auto-release sweep included). Engineers must pass a local `DATABASE_URL` on the command line for local evidence, as Jason did.
With TASK-011..013 DONE → REQ-002 SPEC_DONE; deploy notes in SPEC-002 §Deploy notes for the owner.
