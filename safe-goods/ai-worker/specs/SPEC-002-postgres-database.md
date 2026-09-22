# SPEC-002: Run on PostgreSQL (replace local SQLite)
- Source: REQ-002 (`requirements/REQ-002-postgres-database.md`)
- Status: DONE (2026-09-21 — TASK-011..013 DONE; REQ-002 SPEC_DONE; deploy notes below; AC-3 on SIT by Tanya)
- Author: Sober (SA), 2026-09-21

## Overview

REQ-001 runs on `bun:sqlite`. The owner's dev/test database is PostgreSQL
(SYSTEM-FACTS §Database, Q16: dev box, team may migrate/seed, the owner sets
`DATABASE_URL` in `.env` when he tests). This SPEC swaps the storage layer of
`safe-goods-back` and **nothing else**: the HTTP contract of SPEC-001 is unchanged byte
for byte, the FE is untouched, and REQ-001's behaviour is proven again on Postgres
by `bun test` + Tanya's regression subset (AC-3).

### Technical decisions (SA, 2026-09-21)

| Area | Decision | Why |
|---|---|---|
| Driver | **`postgres`** (postgres.js) + **`drizzle-orm/postgres-js`**; migrator `drizzle-orm/postgres-js/migrator` | the standard, well-trodden Drizzle Postgres pair; Bun runs it natively. (Bun's built-in `Bun.sql`/`drizzle-orm/bun-sql` is newer — not worth the risk on a switch that must behave identically.) |
| Config | one env var **`DATABASE_URL`** (`postgresql://user:pass@host:5432/db`), required; no default, no fallback | REQ-002 §1, §6 |
| Fail fast | `src/env.ts` rejects a missing/blank `DATABASE_URL`; `src/index.ts` runs `SELECT 1` before `Bun.serve` and exits `1` with `DATABASE_URL is missing` / `cannot connect to DATABASE_URL: <driver message without the password>` | AC-6 |
| Schema | `drizzle-orm/pg-core`, DDL below. Types: `uuid` ids, `text`, `integer`, **`timestamptz`** for every `*_at` (Drizzle `timestamp({ withTimezone: true, mode: "date" })`), `bigint identity` for `room_events.id` | a real DB gets real types; the wire still carries ISO-8601 UTC strings — the serializers call `.toISOString()` (contract unchanged) |
| Email case | Postgres has no `COLLATE NOCASE` → **`CREATE UNIQUE INDEX users_email_lower ON users (lower(email))`**, and every lookup/insert lower-cases the email in code (already the case since TASK-002) | AC-4 / REQ-001 AC-26 without the `citext` extension |
| Migrations | `drizzle-kit generate` → `drizzle/0000_init.sql` (**regenerated for Postgres; the SQLite one is deleted**, journal reset); `bun run db:migrate` applies pending migrations via `__drizzle_migrations` — running twice is a no-op | AC-2 |
| Seed | `bun run seed` unchanged in behaviour (admin from `ADMIN_*`, 2 categories, settings 20/20), idempotent via `ON CONFLICT DO NOTHING` / upsert | AC-1 |
| Transactions | every `db.transaction` becomes **async**; routes and `runAutoRelease` become `async`. Every state transition adds the expected status to its `UPDATE … WHERE` and treats `rowCount = 0` as `409 INVALID_STATE` | with async I/O two requests can interleave; the WHERE guard makes each transition atomic on the DB |
| Auto-release sweep | one statement: `UPDATE rooms SET status='WAITING_PAYOUT', released_at=now(), released_by='SYSTEM', auto_release_at=NULL, updated_at=now() WHERE status IN ('DELIVERED_WAITING_CONFIRM','PARCEL_ARRIVED_WAITING_CONFIRM') AND auto_release_at <= now() RETURNING id`, then one batch insert of `AUTO_RELEASED` events for the returned ids, in one transaction | atomic and idempotent by construction |
| Tests | ~~`bun test` runs against `TEST_DATABASE_URL`~~ **Superseded by Change 1 (owner, 2026-09-21): `bun test` runs on an embedded PostgreSQL — `@electric-sql/pglite` (PostgreSQL 18.3 in WASM, in-memory) via `drizzle-orm/pglite`, migrated from the same `drizzle/` folder on preload. No env, no server; nothing named by `DATABASE_URL` is ever opened by the tests.** Probed on Bun 1.3.14 by Sober (§Change 1) | AC-7 / AC-8: isolated by construction |
| Local dev | engineers use their own local Postgres (`createdb safe-goods_local`) until the owner sets the dev URL; Tanya likewise, or the dev DB once the owner points her at it | REQ-002 §Constraints |
| Secrets | `.env.example` carries `DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/safe-goods_db` (placeholder words only); README says the owner supplies the dev URL; `.env` stays git-ignored; `data/` (old SQLite) removed from the repo layout, the ignore line may stay | AC-5, REQ §4 |
| Uploads | unchanged — local disk under `UPLOAD_DIR` | out of scope |

## API / Interface Design

**No change.** SPEC-001 §API is the contract; every response shape, casing, code and
status is identical. The only observable differences are ids (still uuid strings) and
that timestamps now come from `timestamptz` — still rendered `2026-09-21T13:00:00.000Z`.

## Data Model (PostgreSQL, `drizzle/0000_init.sql`)

```sql
CREATE TABLE users (
  id            uuid PRIMARY KEY,
  email         text NOT NULL,
  password_hash text NOT NULL,
  display_name  text NOT NULL,
  role          text NOT NULL DEFAULT 'USER',
  created_at    timestamptz NOT NULL,
  updated_at    timestamptz NOT NULL,
  CONSTRAINT users_role_check CHECK (role IN ('USER','ADMIN'))
);
CREATE UNIQUE INDEX users_email_lower ON users (lower(email));

CREATE TABLE categories (
  id      integer PRIMARY KEY,
  kind    text NOT NULL,
  name_th text NOT NULL,
  sort    integer NOT NULL DEFAULT 0,
  CONSTRAINT categories_kind_check CHECK (kind IN ('IN_GAME','PHYSICAL'))
);

CREATE TABLE settings (
  id               integer PRIMARY KEY,
  fee_rate_percent integer NOT NULL DEFAULT 20,
  fee_minimum      integer NOT NULL DEFAULT 20,
  updated_at       timestamptz NOT NULL,
  CONSTRAINT settings_single_row CHECK (id = 1)
);

CREATE TABLE rooms (
  id                   uuid PRIMARY KEY,
  code                 text NOT NULL UNIQUE,
  status               text NOT NULL,
  category_id          integer NOT NULL REFERENCES categories(id),
  description          text NOT NULL,
  price_mode           text NOT NULL,
  fee_payer            text NOT NULL,
  entered_price        integer NOT NULL,
  base_price           integer NOT NULL,
  fee                  integer NOT NULL,
  buyer_pays           integer NOT NULL,
  seller_receives      integer NOT NULL,
  fee_rate_percent     integer NOT NULL,
  fee_minimum          integer NOT NULL,
  opened_by_role       text NOT NULL,
  buyer_id             uuid REFERENCES users(id),
  seller_id            uuid REFERENCES users(id),
  slip_file_id         uuid,
  reject_reason        text,
  payment_confirmed_at timestamptz,
  courier              text,
  tracking_number      text,
  delivered_at         timestamptz,
  parcel_arrived_at    timestamptz,
  auto_release_at      timestamptz,
  released_at          timestamptz,
  released_by          text,
  paid_out_at          timestamptz,
  completed_at         timestamptz,
  cancelled_at         timestamptz,
  created_at           timestamptz NOT NULL,
  updated_at           timestamptz NOT NULL,
  CONSTRAINT rooms_price_mode_check     CHECK (price_mode IN ('FEE_ADDED','FEE_INCLUDED')),
  CONSTRAINT rooms_fee_payer_check      CHECK (fee_payer IN ('SELLER','BUYER','SPLIT')),
  CONSTRAINT rooms_opened_by_role_check CHECK (opened_by_role IN ('BUYER','SELLER')),
  CONSTRAINT rooms_released_by_check    CHECK (released_by IN ('BUYER','SYSTEM'))
);
CREATE INDEX rooms_status_auto_release ON rooms (status, auto_release_at);
CREATE INDEX rooms_buyer  ON rooms (buyer_id);
CREATE INDEX rooms_seller ON rooms (seller_id);

CREATE TABLE files (
  id           uuid PRIMARY KEY,
  room_id      uuid NOT NULL REFERENCES rooms(id),
  kind         text NOT NULL,
  uploaded_by  uuid NOT NULL REFERENCES users(id),
  file_name    text NOT NULL,
  storage_path text NOT NULL,
  mime_type    text NOT NULL,
  size_bytes   integer NOT NULL,
  created_at   timestamptz NOT NULL,
  CONSTRAINT files_kind_check CHECK (kind IN ('SLIP','EVIDENCE'))
);
CREATE INDEX files_room ON files (room_id, kind);

CREATE TABLE room_events (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id       uuid NOT NULL REFERENCES rooms(id),
  type          text NOT NULL,
  actor_role    text NOT NULL,
  actor_user_id uuid REFERENCES users(id),
  note          text,
  created_at    timestamptz NOT NULL,
  CONSTRAINT room_events_actor_role_check CHECK (actor_role IN ('BUYER','SELLER','ADMIN','SYSTEM'))
);
CREATE INDEX room_events_room ON room_events (room_id, created_at);
```

`rooms.slip_file_id` stays without an FK (as in SPEC-001) — `files.room_id → rooms`
already exists, and a two-way FK complicates inserts for nothing.

**Existing rows:** none to carry — the SQLite files were test data (REQ-002 §Out of
scope). **Who runs it:** the engineer on local Postgres; on the owner's dev DB the team
may run `db:migrate` + `seed` (Q16) — but only once the owner has placed the URL in
`.env`; nobody asks him for it in a file.

## Flow

Unchanged from SPEC-001 §Flow. The one behavioural hardening: every transition is
`UPDATE … WHERE id = $1 AND status = <expected>`; a lost race returns
`409 INVALID_STATE` exactly like a stale client would get today.

## Non-functional

- `DATABASE_URL` required; `TEST_DATABASE_URL` required for `bun test`; both local
  placeholders in `.env.example`. `bunfig.toml` preload migrates the test DB once.
- The password never reaches a log line: on connect failure print the driver error
  with the URL's credentials masked.
- Timestamps are written with `new Date()` (UTC) and read back as `Date`; the sweep uses
  the DB clock (`now()`), all other stamps use the app clock — both UTC.
- No FE change. If any wire field changes shape, that is a defect in this SPEC.

## Tasks

- TASK-011: BE Postgres switch — driver, pg schema + migration, seed, env fail-fast, async transactions with status guards, atomic sweep, README — owner: BE (depends on: —)
- TASK-012: BE test suite on Postgres + regression proof — `TEST_DATABASE_URL` harness, all 46 tests green, AC-4 case test, curl smoke of the whole happy path on Postgres — owner: BE (depends on: TASK-011)
- TASK-013: BE Change 1 — remove TEST_DATABASE_URL; `bun test` on embedded PGlite; AC-7 / AC-8 proof; README + .env.example — owner: BE (depends on: TASK-012)

## Questions
(none — REQ-002 is complete for design)

## Change 1 (owner, 2026-09-21 — REQ-002 §Change 1, req 7–8, AC-7/8)

**Decision (SA):** the test database is **embedded** — `@electric-sql/pglite` + `drizzle-orm/pglite`.
- `src/db/client.ts` becomes a factory: `createDb(kind: "postgres" | "pglite")` returning the same
  Drizzle `Db` type; the process singleton `db` is created lazily from `DATABASE_URL` (postgres.js)
  **unless** the test preload has already installed a PGlite instance. Migrations use
  `drizzle-orm/pglite/migrator` in tests and `drizzle-orm/postgres-js/migrator` in the app — same
  `drizzle/` folder, same SQL.
- The test preload (`src/test/setup.ts`) creates `new PGlite()` (memory), migrates once, seeds; per-file
  `resetDb()` truncates + seeds as today. `DATABASE_URL` is **not read** by the preload; `src/env.ts` must
  not `process.exit` on a missing `DATABASE_URL` when running under `bun test` — the env module gets a
  `DATABASE_URL` that is optional when `NODE_ENV === "test"` (Bun sets it), and required otherwise.
- Every SQL construct we use is plain PostgreSQL and was probed on PGlite 0.5.8 / Bun 1.3.14 by Sober:
  `uuid`, `timestamptz`, `now()`, `lower(email)` unique index (duplicate rejected), `bigint GENERATED ALWAYS
  AS IDENTITY`, transactions, `UPDATE … RETURNING`. Note for the unique-violation helper: Drizzle wraps the
  driver error — check `e.cause?.code === "23505"` as well as `e.code`.
- PGlite is a single connection, so the concurrency test (TASK-012 (b)) exercises the guard by ordering,
  not by true parallelism — still exactly one 200 + one 409, which is the property that matters. The
  atomicity against a real multi-connection Postgres was proven once in TASK-012 and stays in the notes.
- `TEST_DATABASE_URL` disappears from code, `.env.example`, README (AC-7). AC-8 is proven by running
  `bun test` with `DATABASE_URL` pointing at a local DB holding one room and showing the row untouched.

## Deploy notes for the owner (SIT) — added 2026-09-21 at Porter's request

The owner deploys; the team never does. The house `develyst-deploy` skill (PM2 + nginx + Let's Encrypt on
the Develyst Windows server) covers this stack if he wants the recipe.

**Backend — `safe-goods-back` (Bun ≥ 1.3, port from `PORT`)**
```
.env (git-ignored):
  DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME   # the dev Postgres
  PORT=3001                      # or whatever nginx proxies to (the repo's local .env currently says 4018)
  JWT_SECRET=<long random string>
  UPLOAD_DIR=uploads             # must be a persistent, writable directory (slips + evidence live here)
  CORS_ORIGIN=https://<FE host>  # the exact FE origin, scheme included
  AUTO_RELEASE_SECONDS=259200    # 3 days; lower it on SIT only if Tanya needs a short clock
  SWEEP_INTERVAL_MS=60000
  ADMIN_EMAIL=<admin login> · ADMIN_PASSWORD=<real one> · ADMIN_DISPLAY_NAME=Admin
commands, in order:  bun install  →  bun run db:migrate  →  bun run seed  →  bun run start
health check:        GET /api/v1/health → {"success":true,...}
```
Migrate + seed are idempotent — safe to run on every deploy. `bun test` needs nothing and touches no database.

**Frontend — `safe-goods-front` (Node 20+, Next.js 16, port 3000)**
```
.env (git-ignored):
  NEXT_PUBLIC_API_URL=https://<API host>   # public URL of the backend (no trailing slash)
  NEXTAUTH_URL=https://<FE host>
  NEXTAUTH_SECRET=<long random string>
commands:  npm ci  →  npm run build  →  npm run start   (PM2: `pm2 start npm --name safe-goods-front -- start`)
```
`NEXT_PUBLIC_API_URL` is baked in at build time — rebuild after changing it. The share link uses the
browser's own origin, so no FE setting names the host. Uploads are served by the API behind a bearer
token; nginx needs `client_max_body_size 6m` on the API host for 5 MB slips.

**Ports / proxies:** FE :3000 and API :`PORT` behind nginx; `CORS_ORIGIN` must equal the FE's public
origin or every browser call fails with a CORS error (symptom: the login page shows the generic error).
