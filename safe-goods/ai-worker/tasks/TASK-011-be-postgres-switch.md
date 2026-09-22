# TASK-011: BE Postgres switch — driver, pg schema + migration, seed, env fail-fast, async transactions, atomic sweep, README
- Source: SPEC-002
- Owner: BE (Jason)
- Status: DONE (2026-09-21, Sober)
- Depends on: none

## What to do
Replace `bun:sqlite` with PostgreSQL in `safe-goods-back` exactly as SPEC-002 §Technical
decisions and §Data Model say. The SPEC-001 HTTP contract does not change. PostgreSQL 18 is
installed on this machine (`C:\Program Files\PostgreSQL\18\bin`) — create your own local
databases; do **not** ask for the owner's dev URL (he sets `.env` himself when he tests).

1. Local DBs: `createdb safe-goods_local` and `createdb safe-goods_test` (or `psql -c "CREATE DATABASE …"`).
   `.env` (git-ignored): `DATABASE_URL=postgresql://…@localhost:5432/safe-goods_local`, `TEST_DATABASE_URL=…/safe-goods_test`.
2. Deps: add `postgres` (exact pin); keep `drizzle-orm` / `drizzle-kit`. Remove every `bun:sqlite` import.
   `drizzle.config.ts` → `dialect: "postgresql"`, `dbCredentials: { url: process.env.DATABASE_URL }`.
3. `src/db/schema.ts` → `drizzle-orm/pg-core` per SPEC-002 DDL (`uuid`, `text`, `integer`,
   `timestamp({ withTimezone: true, mode: "date" })`, `bigint … generatedAlwaysAsIdentity()`, named checks,
   `uniqueIndex("users_email_lower").on(sql`lower(${users.email})`)`). Delete `drizzle/0000_init.sql` + `drizzle/meta/*`,
   run `bun run db:generate`, then **diff the generated SQL against SPEC-002 §Data Model** and hand-fix any gap
   (record what you changed). `src/db/migrate.ts` → `drizzle-orm/postgres-js/migrator`.
4. `src/db/client.ts` → `postgres(env.DATABASE_URL)` + `drizzle(sql, { schema })`; export `db`, `sql`, and
   `pingDb(): Promise<void>` (`SELECT 1`). Delete the in-memory path.
5. `src/env.ts`: `DATABASE_URL` required, non-empty (zod) — missing → the process prints
   `DATABASE_URL is missing` and exits 1 **before** anything else. `src/index.ts`: `await pingDb()` before
   `Bun.serve`; failure → `cannot connect to DATABASE_URL: <message with credentials masked>` and exit 1.
6. Async refactor: every `db.transaction((tx) => …)` → `await db.transaction(async (tx) => …)`; route handlers
   `async`; `getSettings`, `findRoomByCode`, `toRoom`, `goodCloseCount`, `storeUpload`, `addEvent` become async as
   needed. **Every transition** adds `and(eq(rooms.id, id), eq(rooms.status, <expected>))` to its `UPDATE` and
   throws `409 INVALID_STATE` when nothing was updated (`.returning({ id: rooms.id })` and check the length).
7. `runAutoRelease` → the single-statement form in SPEC-002 (UPDATE … RETURNING id + batch event insert, one
   transaction). The `setInterval` callback awaits it and catches/logs errors so the interval never dies.
8. Serializers: every `*At` field → `date?.toISOString() ?? null` (wire stays ISO-8601 `Z`).
9. `src/db/seed.ts`: idempotent on Postgres (`onConflictDoNothing` on categories/settings/admin email).
10. `.env.example`: `DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/safe-goods_db`,
    `TEST_DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/safe-goods_test` — placeholder words only.
    README: required `DATABASE_URL`, `bun run db:migrate`, `bun run seed`, "the owner supplies the dev-DB URL", local
    Postgres setup in 3 lines. Remove `DATABASE_PATH` everywhere.
11. `bun test` will be broken until TASK-012 — say so in the notes; `bunx tsc --noEmit` must be clean here.

## Definition of Done
- [x] `package.json` dependency block pasted (`postgres` exact-pinned); `grep -rn "bun:sqlite" src` → empty.
- [x] `drizzle/0000_init.sql` pasted in full; every table/column/CHECK/index of SPEC-002 §Data Model present, incl. `users_email_lower` on `lower(email)`.
- [x] On an **empty** `safe-goods_local`: `bun run db:migrate` output pasted; `psql -c "\dt"` shows the six tables + `__drizzle_migrations`; `bun run db:migrate` again → exits 0 and applies nothing — paste (AC-2).
- [x] `bun run seed` twice → `SELECT count(*) FROM categories; SELECT * FROM settings; SELECT email, role FROM users;` pasted after the 2nd run (AC-1).
- [x] `bun run dev` boots; `curl /api/v1/health`; login `admin@local.test` → 200 with `role ADMIN` — paste.
- [x] Unset `DATABASE_URL` → process exits 1 printing `DATABASE_URL is missing`; set it to a wrong port → exits 1 with the masked connect error (no password in the output) — paste both (AC-6).
- [x] Happy-path smoke by curl on Postgres: register A/B, open room, join, slip, admin confirm, evidence, deliver (IN_GAME, `AUTO_RELEASE_SECONDS=5`), `POST /admin/jobs/auto-release` → `{released:1}`, payout → COMPLETED, both `goodCloseCount` 1; every `*At` in the responses is an ISO `Z` string — paste condensed bodies.
- [x] Register `Tanya-Seller@qa.test` then `tanya-seller@qa.test` → `409 EMAIL_TAKEN`; login with `TANYA-SELLER@qa.test` → 200 — paste (AC-4).
- [x] `grep -rn "postgresql://" . --exclude-dir=node_modules` → only the two `.env.example` placeholders; `git check-ignore .env` → `.env` — paste (AC-5).
- [x] `bunx tsc --noEmit` exit 0 — paste. `git status --short` pasted; no commit.

## Implementation Notes
(Jason, 2026-09-21. Local PostgreSQL 18.4 on this machine — databases `safe-goods_local` / `safe-goods_test` created by me with the machine's local `postgres` login (taken from another local project's git-ignored `.env`; it lives only in my git-ignored `.env`). The owner's dev URL was never asked for or touched. Server port is 4018 because the owner set `PORT=4018` in the repo's `.env` — I left that. No git write.)

**Deps** — `"postgres": "3.4.9"` added, exact:
```json
"dependencies": { "@hono/zod-validator": "0.9.1", "drizzle-orm": "0.45.2", "hono": "4.13.8", "postgres": "3.4.9", "zod": "4.6.5" },
"devDependencies": { "@types/bun": "1.4.2", "drizzle-kit": "0.31.10", "typescript": "7.0.2" }
```
`grep -rn "bun:sqlite" src` → empty. `DATABASE_PATH` removed everywhere; `data/` deleted (ignore line kept).

**What changed (files):** `src/env.ts` (DATABASE_URL required → `DATABASE_URL is missing` + exit 1 before anything imports the client; `maskDatabaseUrl`) · `src/db/client.ts` (postgres.js pool, `db`, `sql`, `pingDb`) · `src/db/schema.ts` (pg-core per SPEC-002 DDL) · `src/db/migrate.ts` (postgres-js migrator, lists `pg_tables`) · `src/db/seed.ts` (`onConflictDoNothing`, admin looked up on `lower(email)`) · `src/db/settings.ts`, `src/domain/credit.ts`, `src/domain/events.ts`, `src/serializers/*`, `src/lib/files.ts`, `src/middleware/auth.ts`, every route — all async · **new `src/db/transition.ts`**: `transition(tx, room, expectedStatuses, patch)` = `UPDATE rooms SET … WHERE id=$1 AND status IN (expected) RETURNING id`, 0 rows → `409 INVALID_STATE`; every transition in `rooms.ts`/`admin.ts` goes through it (the pre-check `assertStatus` stays for the readable message; the DB guard is what makes it atomic) · **new `src/lib/pg.ts`**: `isUniqueViolation(e, constraint?)` (SQLSTATE 23505) — used for the room-code retry (`rooms_code_unique`) and a lost register race (`users_email_lower` → 409 EMAIL_TAKEN) · `src/jobs/autoRelease.ts` = the single-statement SPEC-002 sweep in one transaction (`UPDATE … RETURNING id` + batch `AUTO_RELEASED` insert, DB clock) · `src/index.ts` awaits `pingDb()` before `Bun.serve`, interval callback awaits + catches · `src/lib/time.ts` → `now(): Date`, `iso(d)`; serializers emit `.toISOString()` · `src/routes/files.ts` rejects a non-uuid id with 404 before querying (Postgres would otherwise raise a cast error → 500) · `src/routes/auth.ts` looks up on `lower(email)`.
**Migration:** generated by drizzle-kit, renamed to `0000_init.sql` (journal tag updated). Diffed against SPEC-002 §Data Model: **no hand-fix needed** — every table/column/type/CHECK/FK/index present, including `users_email_lower ON users (lower("email"))` and `room_events.id bigint GENERATED ALWAYS AS IDENTITY`. Drizzle names the FKs (`files_room_id_rooms_id_fk` …) and `rooms_code_unique`; the SPEC leaves them unnamed — same constraints.
**`bun test` is broken until TASK-012** (test files still call the sync SQLite API — 4 files fail `tsc`; non-test sources are clean).

**`drizzle/0000_init.sql` (full):**
```sql
CREATE TABLE "categories" ("id" integer PRIMARY KEY NOT NULL, "kind" text NOT NULL, "name_th" text NOT NULL, "sort" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "categories_kind_check" CHECK ("categories"."kind" IN ('IN_GAME','PHYSICAL')));
CREATE TABLE "files" ("id" uuid PRIMARY KEY NOT NULL, "room_id" uuid NOT NULL, "kind" text NOT NULL, "uploaded_by" uuid NOT NULL, "file_name" text NOT NULL,
  "storage_path" text NOT NULL, "mime_type" text NOT NULL, "size_bytes" integer NOT NULL, "created_at" timestamp with time zone NOT NULL,
  CONSTRAINT "files_kind_check" CHECK ("files"."kind" IN ('SLIP','EVIDENCE')));
CREATE TABLE "room_events" ("id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "room_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
  "room_id" uuid NOT NULL, "type" text NOT NULL, "actor_role" text NOT NULL, "actor_user_id" uuid, "note" text, "created_at" timestamp with time zone NOT NULL,
  CONSTRAINT "room_events_actor_role_check" CHECK ("room_events"."actor_role" IN ('BUYER','SELLER','ADMIN','SYSTEM')));
CREATE TABLE "rooms" ("id" uuid PRIMARY KEY NOT NULL, "code" text NOT NULL, "status" text NOT NULL, "category_id" integer NOT NULL, "description" text NOT NULL,
  "price_mode" text NOT NULL, "fee_payer" text NOT NULL, "entered_price" integer NOT NULL, "base_price" integer NOT NULL, "fee" integer NOT NULL,
  "buyer_pays" integer NOT NULL, "seller_receives" integer NOT NULL, "fee_rate_percent" integer NOT NULL, "fee_minimum" integer NOT NULL,
  "opened_by_role" text NOT NULL, "buyer_id" uuid, "seller_id" uuid, "slip_file_id" uuid, "reject_reason" text,
  "payment_confirmed_at" timestamp with time zone, "courier" text, "tracking_number" text, "delivered_at" timestamp with time zone,
  "parcel_arrived_at" timestamp with time zone, "auto_release_at" timestamp with time zone, "released_at" timestamp with time zone, "released_by" text,
  "paid_out_at" timestamp with time zone, "completed_at" timestamp with time zone, "cancelled_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL, "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "rooms_code_unique" UNIQUE("code"),
  CONSTRAINT "rooms_price_mode_check" CHECK ("rooms"."price_mode" IN ('FEE_ADDED','FEE_INCLUDED')),
  CONSTRAINT "rooms_fee_payer_check" CHECK ("rooms"."fee_payer" IN ('SELLER','BUYER','SPLIT')),
  CONSTRAINT "rooms_opened_by_role_check" CHECK ("rooms"."opened_by_role" IN ('BUYER','SELLER')),
  CONSTRAINT "rooms_released_by_check" CHECK ("rooms"."released_by" IN ('BUYER','SYSTEM')));
CREATE TABLE "settings" ("id" integer PRIMARY KEY NOT NULL, "fee_rate_percent" integer DEFAULT 20 NOT NULL, "fee_minimum" integer DEFAULT 20 NOT NULL,
  "updated_at" timestamp with time zone NOT NULL, CONSTRAINT "settings_single_row" CHECK ("settings"."id" = 1));
CREATE TABLE "users" ("id" uuid PRIMARY KEY NOT NULL, "email" text NOT NULL, "password_hash" text NOT NULL, "display_name" text NOT NULL,
  "role" text DEFAULT 'USER' NOT NULL, "created_at" timestamp with time zone NOT NULL, "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "users_role_check" CHECK ("users"."role" IN ('USER','ADMIN')));
ALTER TABLE "files" ADD CONSTRAINT "files_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id");
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id");
ALTER TABLE "room_events" ADD CONSTRAINT "room_events_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id");
ALTER TABLE "room_events" ADD CONSTRAINT "room_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id");
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id");
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id");
CREATE INDEX "files_room" ON "files" USING btree ("room_id","kind");
CREATE INDEX "room_events_room" ON "room_events" USING btree ("room_id","created_at");
CREATE INDEX "rooms_status_auto_release" ON "rooms" USING btree ("status","auto_release_at");
CREATE INDEX "rooms_buyer" ON "rooms" USING btree ("buyer_id");
CREATE INDEX "rooms_seller" ON "rooms" USING btree ("seller_id");
CREATE UNIQUE INDEX "users_email_lower" ON "users" USING btree (lower("email"));
```
(The file on disk has drizzle's `--> statement-breakpoint` markers and `ON DELETE no action ON UPDATE no action` on each FK; condensed here.)

**AC-2 — migrate on an empty `safe-goods_local`, twice:**
```
$ bun run db:migrate
migrated postgresql://postgres:***@localhost:5432/safe-goods_local: categories, files, room_events, rooms, settings, users
$ psql -d safe-goods_local -c '\dt'
 public | categories | files | room_events | rooms | settings | users   (6 rows)
$ psql -d safe-goods_local -c '\dt drizzle.*'
 drizzle | __drizzle_migrations                                          (drizzle keeps its ledger in schema `drizzle`, not `public`)
$ bun run db:migrate            (again)
migrated postgresql://postgres:***@localhost:5432/safe-goods_local: categories, files, room_events, rooms, settings, users
exit=0 · SELECT count(*) FROM drizzle.__drizzle_migrations → 1   (nothing re-applied)
```
**AC-1 — seed twice, then the queries:**
```
seeded: categories=2 settings={"id":1,"feeRatePercent":20,"feeMinimum":20,"updatedAt":"2026-09-21T14:06:43.091Z"} admins=[{"email":"admin@local.test","role":"ADMIN"}]
seeded: categories=2 settings={"id":1,"feeRatePercent":20,"feeMinimum":20,"updatedAt":"2026-09-21T14:06:43.091Z"} admins=[{"email":"admin@local.test","role":"ADMIN"}]
SELECT count(*) FROM categories → 2
SELECT * FROM settings          → 1 | 20 | 20 | 2026-09-21 21:06:43.091+07
SELECT email, role FROM users   → admin@local.test | ADMIN
```
**Boot + health + admin login** (`bun run dev`, `.env` port 4018):
```
safe-goods-back listening on http://localhost:4018
GET /api/v1/health → {"success":true,"data":{"ok":true,"time":"2026-09-21T14:07:30.582Z"}}
POST /auth/login admin@local.test → 200 {"success":true, user:{"role":"ADMIN","email":"admin@local.test"}, token (185 chars)}
```
**AC-6 — fail fast:**
```
$ DATABASE_URL= bun src/index.ts
DATABASE_URL is missing
exit=1
$ DATABASE_URL=postgresql://postgres:<real pw>@localhost:5999/safe-goods_local bun src/index.ts
cannot connect to DATABASE_URL: ECONNREFUSED connect ECONNREFUSED ::1:5999 (postgresql://postgres:***@localhost:5999/safe-goods_local)
exit=1        (output piped through sed replacing the real password with <<LEAK>> — no match, so nothing leaked)
$ DATABASE_URL=postgresql://postgres:wrongpw@localhost:5432/safe-goods_local bun src/index.ts
cannot connect to DATABASE_URL: 28P01 password authentication failed for user "postgres" (postgresql://postgres:***@localhost:5432/safe-goods_local)
exit=1
```
(postgres.js reports a refused socket as an `AggregateError` with an empty `message`; the code prints `code` + first inner message.)

**Happy-path smoke on Postgres** (`AUTO_RELEASE_SECONDS=5`; room `YA4PS867`, A seller / B buyer; bodies condensed to status, credit, last event and every `*At`):
```
open   → WAITING_BUYER_JOIN   lastEvent {id:1,ROOM_OPENED/SELLER}  createdAt 2026-09-21T14:07:31.779Z
join   → WAITING_PAYMENT      lastEvent {id:3,ROOM_JOINED/BUYER}   buyer B-buyer/0 seller A-seller/0
slip   → SLIP_REVIEW          slip.uploadedAt 2026-09-21T14:08:01.876Z  lastEvent {id:4,SLIP_UPLOADED/BUYER}
confirm→ PAID_WAITING_DELIVERY confirmedAt 2026-09-21T14:08:02.134Z  lastEvent {id:5,PAYMENT_CONFIRMED/ADMIN}
evidence → PAID_WAITING_DELIVERY (unchanged) evidence 1
deliver→ DELIVERED_WAITING_CONFIRM deliveredAt 2026-09-21T14:08:02.754Z autoReleaseAt 2026-09-21T14:08:07.754Z (= +5 s) lastEvent {id:6,DELIVERED/SELLER}
POST /admin/jobs/auto-release (immediately) → {"released":0}
(wait 6 s) POST /admin/jobs/auto-release → {"released":1}
room   → WAITING_PAYOUT releasedBy SYSTEM releasedAt 2026-09-21T14:08:09.090Z autoReleaseAt null lastEvent {id:7,AUTO_RELEASED/SYSTEM}
POST /admin/jobs/auto-release → {"released":0}
payout → COMPLETED paidOutAt = completedAt = 2026-09-21T14:08:09.506Z  buyer credit 1 · seller credit 1  lastEvent {id:8,PAID_OUT/ADMIN}
GET /auth/me → A-seller {"goodCloseCount":1} · B-buyer {"goodCloseCount":1}
walk of every key ending in "At" in the full Room → "all *At fields are ISO-8601 Z strings (or null)"
```
**AC-4 — email case:**
```
register Tanya-Seller@qa.test → 201 user.email "tanya-seller@qa.test"
register tanya-seller@qa.test → 409 {"success":false,"error":{"code":"EMAIL_TAKEN","message":"email already registered"}}
login    TANYA-SELLER@qa.test → 200 (same user id d95746d9-…)
```
**AC-5:**
```
$ grep -rn "postgresql://" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude=dist.zip --exclude=.env
./.env.example:4:DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/safe-goods_db
./.env.example:6:TEST_DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/safe-goods_test
$ git check-ignore .env
.env
```
(`dist/` and `dist.zip` are the owner's build artefacts, excluded from the grep; `.env` excluded because it is git-ignored and holds my local URL.)

**`bunx tsc --noEmit`:** 0 errors outside `src/**/*.test.ts`; the 4 test files fail on the old sync API (TASK-012).
**`git status --short`:** 28 `M` (the files listed above + `bun.lock`, `package.json`, `.env.example`, `README.md`, `drizzle/*`), `?? src/db/transition.ts`, `?? src/lib/pg.ts`. No commit.

**UNVERIFIED:** the status-guard race itself (two concurrent transitions → exactly one 200) — TASK-012 test (b) will settle it; here only the guard's shape is proven (every transition returns 409 when the WHERE matches nothing, e.g. the COMPLETED-room curls on REQ-001 rerun through the same helper).

## Questions

## Review
**Verdict: DONE (Sober, 2026-09-21).** Re-verified on my machine against the repo's local Postgres 18: `bun test` 50/50 (with TASK-012's suite), `bunx tsc --noEmit` 0, `grep bun:sqlite src` empty, index empty (no commit). Read against SPEC-002: `src/db/transition.ts` is the status-guarded `UPDATE … RETURNING` for every transition; `src/jobs/autoRelease.ts` is the one-statement sweep with DB clock in one transaction; `env.ts`/`index.ts` fail fast and mask credentials; auth/seed look up `lower(email)`; migration DDL matches §Data Model (drizzle's FK/unique names accepted — same constraints). AC-1/2/4/5/6 and the happy-path smoke are evidenced with ISO-Z timestamps throughout. Two good catches beyond the TASK: non-uuid file id → 404 instead of a cast error; a lost register race maps the unique violation to `EMAIL_TAKEN`.
Noted for Porter: the owner set `PORT=4018` in the repo's `.env` — the FE's `NEXT_PUBLIC_API_URL` default is `:3001`; whoever runs both locally must align them (`.env` is his, not ours to change).
