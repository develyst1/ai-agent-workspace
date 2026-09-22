# TASK-012: BE test suite on Postgres + regression proof
- Source: SPEC-002
- Owner: BE (Jason)
- Status: DONE (2026-09-21, Sober)
- Depends on: TASK-011

## What to do
Make `bun test` prove REQ-001's behaviour on PostgreSQL (SPEC-002 §Technical decisions →
Tests), so Tanya's AC-3 regression runs against an engine we already trust.

1. `src/test/setup.ts` (bunfig preload): read `TEST_DATABASE_URL` (fail loudly if unset), point the
   db client at it, run the migrator once, then `TRUNCATE users, categories, settings, rooms, files, room_events
   RESTART IDENTITY CASCADE` + `seed()` before **each test file** (a `beforeAll` helper every test file calls, or a
   preload-level hook — your choice, state it). `UPLOAD_DIR` → OS temp as today.
2. Port the existing 46 tests (`app`, `auth`, `domain/fee`, `routes/rooms`, `routes/payment`, `routes/delivery`)
   to the async API. Keep the assertions; where a test relied on synchronous SQLite (e.g. setting
   `auto_release_at` in the past by direct SQL) use a raw `UPDATE` on the test DB.
3. Add: (a) AC-4 — register mixed-case email then lower-case → `409 EMAIL_TAKEN`; login with upper-case → 200.
   (b) Status-guard race: two concurrent `POST /received` on the same room (`Promise.all`) → exactly one 200 and
   one `409 INVALID_STATE`; exactly one `RECEIVED_CONFIRMED` event. (c) `runAutoRelease` with two due rooms → `2`,
   again → `0`, events = 2. (d) Timestamp shape: every `*At` in a `Room` matches
   `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/`.
4. README: add the `TEST_DATABASE_URL` line and `bun test`.

## Definition of Done
- [x] `bun test` output pasted: **≥ 50 pass, 0 fail**, against `safe-goods_test` (paste `TEST_DATABASE_URL` masked).
- [x] Run `bun test` twice in a row → same result (truncate-per-file works) — paste the second run's summary.
- [x] The four new tests named in the output.
- [x] `bun test` with `TEST_DATABASE_URL` unset → fails immediately with a message naming it — paste.
- [x] `bunx tsc --noEmit` exit 0. `git status --short` pasted; no commit.

## Implementation Notes
(Jason, 2026-09-21. `bun test` against my local `safe-goods_test` on PostgreSQL 18.4 — `TEST_DATABASE_URL=postgresql://postgres:***@localhost:5432/safe-goods_test` (git-ignored `.env`). No git write.)

**Harness:** `src/test/setup.ts` (bunfig preload, runs once per process): fails loudly if `TEST_DATABASE_URL` is unset, copies it into `DATABASE_URL` before `src/env.ts` loads, sets `JWT_SECRET` / `UPLOAD_DIR` (OS temp), then `await runMigrations()` once. **Per test file** (my choice of the two options in §1): every file calls `beforeAll(resetDb)` from `src/test/helpers.ts` → `TRUNCATE users, categories, settings, rooms, files, room_events RESTART IDENTITY CASCADE` + `seed()`. Bun runs test files sequentially in one process, so files never see each other's rows and event ids restart at 1 per file. Helpers also hold the shared `PNG`, `ISO_Z` and `badTimestamps()` walker.
**Port:** all 46 tests kept their assertions; only the sync SQLite calls changed — `runAutoRelease()` is awaited, and "auto_release_at in the past" is now a raw `UPDATE rooms SET auto_release_at = now() - interval '1 second' WHERE code = $1` on the test DB (`makeDue` in `delivery.test.ts`). One extra assertion in `payment.test.ts`: `/files/not-a-uuid` → 404 (Postgres would otherwise raise a uuid cast error).
**Added (4):** (a) `AC-4: mixed-case register, lower-case duplicate → 409 EMAIL_TAKEN; upper-case login → 200` (auth) · (b) `status-guard race: two concurrent received → exactly one 200 + one 409, one RECEIVED_CONFIRMED event` (delivery; `Promise.all` of two POSTs, event count via SQL) · (c) `auto-release with two due rooms → 2, again → 0, two AUTO_RELEASED events` (delivery) · (d) `timestamp shape: every *At in a Room is null or an ISO-8601 Z string` (rooms; recursive walk of every key ending in `At`).
README already carries the `TEST_DATABASE_URL` + `bun test` lines (added in TASK-011).

**`bun test` — run 1:**
```
bun test v1.3.14 (0d9b296a)
src\app.test.ts:  src\routes\auth.test.ts:  src\routes\delivery.test.ts:  src\routes\payment.test.ts:  src\routes\rooms.test.ts:  (+ src\domain\fee.test.ts)
 50 pass
 0 fail
 244 expect() calls
Ran 50 tests across 6 files. [3.27s]
```
**run 2 (immediately after, same DB — truncate-per-file works):**
```
 50 pass
 0 fail
Ran 50 tests across 6 files. [3.28s]
```
**The four new tests in the run (junit reporter names):**
```
"AC-4: mixed-case register, lower-case duplicate → 409 EMAIL_TAKEN; upper-case login → 200"
"status-guard race: two concurrent received → exactly one 200 + one 409, one RECEIVED_CONFIRMED event (SPEC-002 §Flow)"
"auto-release with two due rooms → 2, again → 0, two AUTO_RELEASED events"
"timestamp shape: every *At in a Room is null or an ISO-8601 Z string (SPEC-002)"
```
**`TEST_DATABASE_URL` unset:**
```
$ TEST_DATABASE_URL= bun test
TEST_DATABASE_URL is missing — bun test needs a LOCAL Postgres database it may truncate (see .env.example)
exit=1     (no test file runs — the preload exits first)
```
**`bunx tsc --noEmit`** → exit 0 (whole repo, tests included).
**`git status --short`:** 38 lines — TASK-011's set plus ` M src/app.test.ts`, ` M src/routes/{auth,delivery,payment,rooms}.test.ts`, ` M src/test/helpers.ts`, ` M src/test/setup.ts`; `?? src/db/transition.ts`, `?? src/lib/pg.ts`. No commit.

**UNVERIFIED:** nothing in the DoD. Note for Tanya's AC-3 run (via Sober → Porter): the suite truncates whatever database `TEST_DATABASE_URL` names — it must never be pointed at the owner's dev DB.

## Questions

## Review
**Verdict: DONE (Sober, 2026-09-21).** Ran `bun test` myself on the local `safe-goods_test`: 50 pass / 0 fail / 245 expects, 6 files; `tsc` clean incl. tests. The four new tests are present and named as specified; the concurrency test settles TASK-011's one UNVERIFIED item (exactly one 200 + one 409, one event). Truncate-per-file harness is the right shape. The warning that the suite truncates `TEST_DATABASE_URL` goes to Porter for Tanya verbatim.
With TASK-011 + 012 DONE → REQ-002 SPEC_DONE; AC-3 (Tanya's regression subset on Postgres) is the remaining proof.
