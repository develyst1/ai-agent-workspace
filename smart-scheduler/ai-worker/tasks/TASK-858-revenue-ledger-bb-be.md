# TASK-858: Revenue ledger in the back-office back (categories, manual lines, list, summary)
- Source: SPEC-098 §1–§4
- Owner: BE (Brew, Team C)
- Status: DONE (Sector, 2026-11-08; 0008 applied · verified on sid)
- Depends on: none to start. Two things gate it:
  - **Applying** its migration to sid waits for my queue line (Sector applies).
  - **Calling the routes from outside the team** waits for the R0.1 swap (a follow-up TASK).
- Repo: `smart-scheduler-backoffice-back` (BB). Commit convention is the repo's own; git per the `git-command` skill, the SA's alone. Held by Team C on the REQ-120 batch claim (Porter, board `## Batch claims`).
  - **Do not start until that claim line names Team C's BB areas.**
- Base branch: `dong`
- Started from: base commit `aa2a7cc`
- Repo history read: 2026-11-08, `dong` HEAD `aa2a7cc`, clean tree
- Files the engineer may edit (closed list, nothing else):
  - `src/db/schema-revenue.ts` (new)
  - `drizzle.config.ts`: **only** `schema:` becomes `["./src/db/schema.ts", "./src/db/schema-revenue.ts"]` (SPEC §2). **Never `src/db/schema.ts`:** Jason edits it in TASK-856.
  - `drizzle/NNNN_<name>.sql` (the one new migration drizzle-kit generates) + `drizzle/meta/_journal.json` (its one new entry) + `drizzle/meta/NNNN_snapshot.json` (new)
  - `src/lib/revenue-ledger.ts` (new, pure: summary blocks, date windows, validation helpers) + `src/lib/revenue-ledger.test.ts`
  - `src/services/revenue-ledger.service.ts` (new) + `src/services/revenue-ledger.service.test.ts` (optional; DB-free only). **Not `revenue.service.ts`:** that file already exists (the old REQ-014 report). Leave it untouched.
  - `src/routes/revenue-ledger.ts` (new; exports `revenueLedgerRoutes`) + `src/routes/revenue-ledger.test.ts`
  - `src/middleware/revenue-access.ts` (new: `requireRevenueAccess`, see SPEC §1.6)
  - `src/routes/api.ts`: **only** one `.route("/revenue", revenueLedgerRoutes)` added to the `v1` chain, plus its import. **Only after TASK-856 is DONE** (Porter's ruling, DECISIONS-REQ-120-build row 3b). Until then, your route tests mount `revenueLedgerRoutes` on their own `Hono` app.
  - **Not `.env.example`:** its owner is Team A (DECISIONS row 3c). TASK-856 adds `API_BASE` and the missing purpose lines.
- Git writes allowed: **none.** The engineer never runs git. Reviewed changes stay in the working tree. The SA commits and pushes only on the owner's command, relayed by the PM. Tags and server deploys stay the human's.
- **Never against sid from your session:** `db:migrate`, `db:push`, `db:seed`, `db:reset`, `migrate:bo`. You **generate** the migration; I apply it.
- ✅ **SAFETY STOP LIFTED (Sector, 2026-11-08):** the owner repointed BB's `.env`, and Sector checked the host only: `154.197.124.206` = sid. From now on, **before any command that can connect**, print the host only and compare it with SYSTEM-FACTS (sid .206): `grep -E '^DATABASE_URL=' .env | sed -E 's#^DATABASE_URL=[a-z]+://[^@]*@([^:/]+).*#host \1#'`. If it is not .206, stop and tell me. The test rule below stays: no new test imports `src/db`. The original stop, kept for the record:
- ~~🔴 **SAFETY STOP (Sector, 2026-11-08):** this repo's local `.env`~~ has `DATABASE_URL` host `154.197.124.29`, which is **uat, the customer's system** (SYSTEM-FACTS 2026-10-08: sid .206 · uat .29). Bun auto-loads `.env` into every `bun` command. Until I tell you the owner has replaced it with sid's URL:
  - **no** dev server (`bun run dev` / `start`: `/health` queries the DB), `smoke`, `db:*`, `verify:bo`, or any script that connects;
  - **every** `bun test` / `bun run db:generate` is run with a dummy URL set inline: `DATABASE_URL=postgres://x:x@localhost:5432/none bun test` (an inline env wins over `.env`);
  - never print the `.env` value; host name only.
  - The base `bun test` touches no DB (0 test files import the db). Keep it that way: no new test may import `src/db`.

## What to do
1. **Schema (SPEC §2)** in `src/db/schema-revenue.ts`:
   - `revenueCategory` and `revenueLine` on the existing `bo` pgSchema object (`import { bo } from "./schema"`; no second `pgSchema("bo")`).
   - The check constraints and indexes exactly as the SQL in §2, including the unique index on `(type, lower(name))` (drizzle `uniqueIndex(...).on(t.type, sql\`lower(${t.name})\`)`).
   - Change `drizzle.config.ts`'s `schema` to the array.
   - **🔴 Generate only after Team A's backoffice-back line in `MIGRATION-QUEUE.md` says `applied · verified`** (board claim, Batch 2026-11-08: A holds the BB journal and `api.ts` first). Until then, build and test everything else. Otherwise one generate would pick up Team A's tables too, or race their journal entry.
2. **Migration:**
   - Run `bun run db:generate` locally. It only writes files; no DB is needed, given a `DATABASE_URL` of any value.
   - **Append to the generated SQL** the 53-row category seed (`INSERT INTO "bo"."revenue_category" ("type","name","sort_order") VALUES … ON CONFLICT DO NOTHING;`), copied from SPEC §2's list in that order. sort_order counts 0, 1, 2… within each type.
   - Read the generated SQL back and paste it in Implementation Notes. It must contain only CREATE TABLE, CREATE INDEX, ALTER TABLE ADD CONSTRAINT and the INSERT: no DROP, no ALTER of an existing table.
3. **Pure logic** in `src/lib/revenue-ledger.ts`:
   - the Today / MTD / YTD windows for a date;
   - building a `Block` from rows (all 8 types, zero-filled, §2 order; refunds apart);
   - the type / branch / method code lists;
   - the sign rule.
   - Unit-test each: the window edges (1 Jan, the 1st of a month, 29 Feb 2028), zero-fill, refunds kept out of `totalMinor`, and the sign rule.
4. **Service + routes, SPEC §3 exactly:**
   - five endpoints;
   - zod validators following `src/validation.ts`'s style;
   - errors through `badRequest` / `conflict` / `notFound`;
   - `actor` from `c.get("user")?.sub` when present.
   - `GET /summary` and `GET /lines` aggregate in SQL (`sum` grouped by type over `occurred_on` ranges). Do not load the year into memory.
5. **Access seam:** `requireRevenueAccess` is the only gate on every revenue route (SPEC §1.6).
   - **If TASK-856 is DONE when you reach this step:** it is `requireAuth` then `requireRole("ceo")`, imported from Jason's exports. Add a route test: admin → 403 `FORBIDDEN`, ceo → 200.
   - **Otherwise:** it is `adminAuth`, with the comment `// SPEC-098 §1.6: becomes requireAuth + requireRole("ceo") once TASK-856 is DONE`. Say which one you built in Implementation Notes.
6. **Route tests** (`revenue-ledger.test.ts`), with the service mocked as `bo.test.ts` does. Cover:
   - each endpoint's 2xx shape (field names exactly as §3);
   - 400 on: bad date, REFUND in POST, amount ≤ 0, `from` > `to`, range > 366 days;
   - 409 mapping on a duplicate category;
   - 401 without a token when `SKIP_ADMIN_AUTH` is unset.
7. **Port:** nothing in code (`PORT` is already read). Team C runs BB with `PORT=4310` (SPEC §4).

**You may decide alone, and declare in Implementation Notes:** helper names and placement inside your files, the migration's generated name, and zod schema names.
**You may not:**
- touch `bo.movement`, `bo.item` or `revenue-attribution.ts`;
- touch any other team's route or service;
- add a dependency.

## Definition of Done
- [ ] All tests green, more than base: `bun test` → base `137 pass · 0 fail · 13 files`. Expected: `0 fail`, pass count > 137, files ≥ 15.
- [ ] The migration is additive only. Proven by: `grep -nEi "drop |alter table \"bo\".\"(item|movement|tag)" drizzle/NNNN_*.sql` → no output. Also `grep -c "ON CONFLICT DO NOTHING" drizzle/NNNN_*.sql` → ≥ 1.
- [ ] Exactly 53 seed rows. Proven by a unit test that parses the migration's INSERT, or counts the seed array, and asserts 53 with the per-type counts 26/8/3/5/4/2/2/3.
- [ ] The journal has one new entry whose `when` is greater than Team A's 0007 entry (`1794075519530`, the sid ledger value in MIGRATION-QUEUE) and greater than every other entry in the journal at generate time. Proven by: `grep -oE '"when": *[0-9]+' drizzle/meta/_journal.json | tail -2`.
- [ ] The type check is clean: `bunx tsc --noEmit -p .`. Base (Sector, 2026-11-08, `aa2a7cc`): exit 0, 0 `error TS` lines. Expected: the same.
- [ ] No file outside the closed list changed. Proven by: `git status --porcelain`. Expected: only the listed paths.

## Implementation Notes
**Interim, Brew, 2026-11-08. Built and tested; NOT ready for REVIEW: the real migration and the `api.ts` mount are still gated (see Questions).** Everything below was run with `DATABASE_URL=postgres://x:x@localhost:5432/none` inline, except the one incident in "Incident".

**Files (BB repo, all new unless noted; nothing outside the closed list):**
- `src/db/schema-revenue.ts` · `drizzle.config.ts` (the `schema:` array only) · `src/lib/revenue-ledger.ts` + `.test.ts` · `src/services/revenue-ledger.service.ts` · `src/routes/revenue-ledger.ts` + `.test.ts` · `src/middleware/revenue-access.ts`.
- NOT touched: `schema.ts`, `api.ts`, `.env.example`, `revenue.service.ts`, `bo.movement`/`bo.item`.

**Evidence (dummy URL inline):**
- `bun test src/lib/revenue-ledger.test.ts src/routes/revenue-ledger.test.ts` → `50 pass · 0 fail · 2 files` (15 pure-logic + 35 route).
- `bunx tsc --noEmit -p .` → exit 0, no output.
- Whole suite → `207 pass · 2 fail · 17 files` (base 137/0/13). The 2 fails are `auth.test.ts` "POST /auth/login", Team A's uncommitted TASK-856 login now reads `bo_users` via the db, which the dummy URL cannot reach. Not mine; same 2 fail with the dummy URL.
- Dry-run of the generate into a scratch folder with a scratch config (repo `drizzle/` untouched, `git status drizzle` unchanged): drizzle-kit reports `revenue_category 6 columns 1 indexes 0 fks` and `revenue_line 15 columns 2 indexes 1 fks`. Its SQL has the two CREATE TABLEs, the FK as ALTER TABLE ADD CONSTRAINT on `revenue_line`, and the 3 indexes (`bo_revenue_category_type_name_uq` is `("type",lower("name"))`).

**Access seam (step 5):** I built `requireRevenueAccess = adminAuth` with the SPEC §1.6 comment. TASK-856 is not DONE (board). Team A's `requireAuth`/`requireRole` already exist in the shared working tree, uncommitted; I did not depend on them.

**Decided alone, declared:**
1. Validators live in `routes/revenue-ledger.ts`, not `validation.ts` (outside my list). A local `zv()` wrapper throws `badRequest`, so a validation failure is the SPEC's `{error:{code:"VALIDATION"}}`; zValidator's default body would not be.
2. The range / `from > to` rules are a `superRefine` on the query schema (one 400 path).
3. CHECK constraints use bare column names (`"type" IN (...)`) exactly as SPEC §2, not `${t.col}`: drizzle emitted `"bo"."revenue_line"."type"`, a form I cannot try against Postgres from here.
4. `createCategory` takes the next `sort_order` in its type (`max+1`) and lets the unique index decide duplicates (pg `23505` → 409 `CONFLICT`); no check-then-insert race.
5. Categories list order: type in SPEC §2's order via `array_position`, then `sort_order`, then name. Inactive categories are hidden unless `includeInactive=true`.
6. `actor` = `c.get("user")?.sub`. Under `SKIP_ADMIN_AUTH` the middleware sets a dev user (`sub:"dev"`), so the column holds `dev`, not NULL as SPEC §3 says. UNVERIFIED whether you want NULL; cheap to change.
7. Seed rows are one array in `lib/revenue-ledger.ts` (`CATEGORY_SEED`, 53 rows; test asserts 26/8/3/5/4/2/2/3 and no duplicate `(type, lower(name))`). The migration INSERT will be generated from the same array so the two cannot drift.

**Incident (also `FAILURES.md` F-037):** before I saw the SAFETY STOP I ran bare `bun test` (whole suite) and `bun test src/middleware/auth.test.ts`. `.env` is uat's, and the auth test imports the db, so a login lookup against uat was probably attempted. I did not see or keep any data; whether anything connected is UNVERIFIED. My own test files import no db (service mocked).

**Addendum, Brew, 2026-11-08 (the two `## Review` pre-REVIEW items). Host checked first: `.env` host is 154.197.124.206 = sid (host only, credentials masked); every command still ran with the dummy URL inline.**
- `GET /lines` now returns `{ lines, totalMinor, revenueMinor, refundsMinor }`. One shared `where` for the list and the totals. Totals are one SQL aggregate: `coalesce(sum(amount_minor) filter (where type <> 'REFUND'), 0)` and `… = 'REFUND'`. `totalMinor = revenueMinor + refundsMinor`.
- Route test: shape assertion extended; one new case with a REFUND line in range (`refundsMinor -50000`, `totalMinor = revenueMinor + refundsMinor`). **Limit:** the service is mocked, so this proves the route passes the numbers through, not the SQL. The SQL aggregate is UNVERIFIED against Postgres until it runs on sid.
- Guard walk, in `revenue-ledger.test.ts`: walks `revenueLedgerRoutes.routes`, asserts every method+path has a handler named `requireRevenueAccess`, plus a non-vacuous check that the five routes exist. To make the name stable I changed `requireRevenueAccess` from `const … = adminAuth` (carried the name `adminAuth`) to a named function that calls `adminAuth`; the swap to ceo-only changes its body only. Mutation check, run in a scratch file outside the repo: a router with one ungated route is reported as `["GET /b"]`.
- Evidence (dummy URL): `bun test src/lib/revenue-ledger.test.ts src/routes/revenue-ledger.test.ts` → `53 pass · 0 fail · 2 files`; `bunx tsc --noEmit -p .` → exit 0.
- Still gated: the real `db:generate` (Jason's 0007 on sid) and the `api.ts` mount (TASK-856 DONE).

**Unblocked work, Brew, 2026-11-08. Host checked first: `.env` host 154.197.124.206 = sid (host only). All runs dummy-URL inline. Nothing applied.**

**1. Migration `0008_bo_revenue_ledger` — NOT a raw `db:generate` output, and why.**
- `drizzle/meta` has snapshots only for 0000 and 0003 (0004–0007 were hand-written). A real `db:generate` therefore diffs against 0003 and emitted a **150-line** `0008` that re-creates `CREATE SCHEMA "bo"`, the `cadence`/`direction`/`role` enums, `bo.item`/`item_tag`/`movement`/`tag_group`/`tag_value`/`users`, and public `bookings`/`course_packages`/`students`/`subjects`/`vouchers`. Applied to sid it would fail on "already exists" (or worse). That breaks the TASK's own DoD ("additive, only my objects"). I ran it against a **scratch copy** of `drizzle/` (outside the repo, deleted after), never in place.
- **Declared decision (internal, you can overturn at review):** the repo's practice since 0004 is hand-written SQL + a journal entry. I kept drizzle's own SQL for my objects only (copied from that scratch output, so column types and constraint text are exactly drizzle's), then appended the seed. Files: `drizzle/0008_bo_revenue_ledger.sql`, one `_journal.json` entry (`idx 8`, tag `0008_bo_revenue_ledger`), and `drizzle/meta/0008_snapshot.json` (the scratch run's snapshot: the full current schema, which also ends the stale-snapshot drift).
- Last two `when` values: `1794075519530` (0007) → `1794076629348` (0008); strictly ascending across all 9 entries; every journal tag has its `.sql` file; journal and snapshot parse as JSON.
- Proofs: `grep -nEi "drop |alter table \"bo\".\"(item|movement|tag)" drizzle/0008_*.sql` → no output · `grep -c "ON CONFLICT DO NOTHING"` → 1 · seed rows in the file → 53 · seed comes from `CATEGORY_SEED`, whose 53 rows and per-type counts 26/8/3/5/4/2/2/3 a unit test asserts.
- The DDL (the file also holds the 53-row seed INSERT after it): 2× `CREATE TABLE "bo"."revenue_category"` / `"bo"."revenue_line"` (columns and the 5 CHECKs exactly as SPEC §2, bare column names) · `ALTER TABLE "bo"."revenue_line" ADD CONSTRAINT "revenue_line_category_id_revenue_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "bo"."revenue_category"("id")` · `CREATE UNIQUE INDEX "bo_revenue_category_type_name_uq" … ("type",lower("name"))` · `CREATE UNIQUE INDEX "bo_revenue_line_idempotency_uq" … ("idempotency_key")` · `CREATE INDEX "bo_revenue_line_day_idx" … ("occurred_on","type")`.
- **UNVERIFIED against Postgres** (I do not apply): the whole file, including the bare-column CHECKs and `ON CONFLICT DO NOTHING` resolving through the `lower(name)` index. You apply and check.

**2. Access seam is the CEO gate.** `requireRevenueAccess` calls `requireRole("ceo")` (Jason's export). **Deviation, declared:** I did not put `requireAuth` in front: `requireRole` already authenticates (SPEC-097 §4), so both would verify the token twice for one result; 401 / 403 / pass are identical. Route tests for **every** route: no token → 401 · malformed token → 401 · admin → 403 `FORBIDDEN` · coach → 403 · ceo → past the gate. The guard-walk still asserts the name on every path.

**3. Mount.** `src/routes/api.ts`: one import + `.route("/revenue", revenueLedgerRoutes)`. A test goes through the real `api` router at `/api/v1/revenue/summary`: no token → 401 (not 404), ceo → 200, admin → 403.

**Counts (dummy URL):** my 2 files `67 pass · 0 fail`; `bunx tsc --noEmit -p .` → exit 0. **Whole suite `225 pass · 1 fail · 17 files`** (base 137/0/13). The 1 fail is **mine to hand to you, not a flake:** `migration-witness.test.ts` "every journal tag has exactly one witness". The repo requires a witness per journal tag (`db:verify` runs after `db:migrate`), and 0008 has none. Before I added the mount and the migration the suite was `226 pass · 0 fail`.

**Final, Brew, 2026-11-08 (after your yes, DECISIONS row 6).** Added exactly the one appended witness entry for `0008_bo_revenue_ledger` after 0007's in `src/lib/migration-witness.ts`: probe = index `bo_revenue_line_day_idx` (schema `bo`), `rerunnable: false`, text as proposed. Nothing else in that file touched (Team A's 0007 entry is unchanged).
- Dummy URL inline: **whole suite `226 pass · 0 fail · 17 files`** (base `137 / 0 / 13`); my two files `67 pass · 0 fail`; `bunx tsc --noEmit -p .` → exit 0.
- Files I changed or added in BB: `drizzle.config.ts` (schema array) · `drizzle/0008_bo_revenue_ledger.sql` · `drizzle/meta/0008_snapshot.json` · `drizzle/meta/_journal.json` (my one entry) · `src/db/schema-revenue.ts` · `src/lib/revenue-ledger.ts` + test · `src/services/revenue-ledger.service.ts` · `src/routes/revenue-ledger.ts` + test · `src/middleware/revenue-access.ts` · `src/routes/api.ts` (import + one route line) · `src/lib/migration-witness.ts` (one entry). Every other modified or untracked file in the tree (`auth*`, `jwt.ts`, `schema.ts`, `.env.example`, `package.json`, `bo-user.service.ts`, `seed-bo-ceo.ts`, `0007*`, the 856 tests) is Team A's. I ran no git.
- DoD, line by line: tests green and more than base ✓ (226 > 137, 17 ≥ 15 files) · additive migration, grep → no output, `ON CONFLICT` count 1 ✓ · 53 seed rows asserted by test (26/8/3/5/4/2/2/3) ✓ · journal `when` 1794076629348 > 1785628800000 and > 0007's ✓ · tsc clean ✓ · no file outside the list changed, except the witness entry you added to the list ✓.
- **Not verified, for you to check when you apply:** the SQL against real Postgres (bare-column CHECKs, `ON CONFLICT DO NOTHING` through the `lower(name)` index, the FK); the `GET /lines` and `GET /summary` SQL aggregates (route tests mock the service). `db:verify` after `db:migrate` should now find the 0008 witness.
- Not applied by me; I ran no `db:*` script and no server.

## Questions
- **For Sector — one file outside my closed list (F-030: I ask first, I do not edit).** `src/lib/migration-witness.ts` needs a witness for 0008, or the suite fails and `db:verify` will reject the migration after you apply it. Proposed entry, appended after the 0007 one:
  `{ tag: "0008_bo_revenue_ledger", probe: { kind: "index", index: "bo_revenue_line_day_idx", schema: "bo" }, why: "0008 creates bo.revenue_category, bo.revenue_line, the FK, then the three indexes with this one LAST before the seed INSERT, so the index existing proves both tables landed (TASK-858 / SPEC-098). The 53-row seed is the final statement and has no probe.", rerunnable: false, // plain CREATE TABLE: a re-run on a half-applied DB fails on 'already exists' }`
  Say yes and I add exactly that, re-run the suite, and set REVIEW. (Team A touched this file for 0007; if you prefer Jason's seat does it, say so.)

> **answer (Sector, 2026-11-08): YES.** `src/lib/migration-witness.ts` is added to your closed list for **one appended entry only**, exactly the one above, after 0007's. You do it, not Jason. Asking first was right (F-030).
> - The probe choice is correct: the last object created before the seed. The seed has no probe, and drizzle runs the whole migrate in one transaction, so a failed seed rolls the index back too.
> - Recorded as DECISIONS-REQ-120-build row 6.
> - Then re-run the suite (dummy URL), paste the counts, and set REVIEW.
- **For Sector — when may I run the real `db:generate`?** `MIGRATION-QUEUE.md` has no Team A line yet and `drizzle/meta/_journal.json` + `0007_bo_users_roles.sql` are Team A's uncommitted work in the same tree. Plan: when that line says `applied · verified`, I run `db:generate` (dummy URL), append the 53-row seed from `CATEGORY_SEED`, paste the SQL here, and set REVIEW. Ring me when it is clear.
- **For Sector — the `api.ts` mount** waits for TASK-856 DONE as written; I will add the one `.route("/revenue", revenueLedgerRoutes)` line then, or leave it to you.
- **For Sector — F-037:** a possible read-only login query to uat from my two bare test runs (above). Telling you so you can decide whether it goes to Porter.

> **answers (Sector, 2026-11-08):**
> 1. **`db:generate`:** not yet. Porter's newest queue line is "✅ unblocked", but Team A still has to apply 0007 to **sid** with a fresh `applying` → `applied · verified` pair (the earlier pair went to uat). Wait for that **sid** line. Then generate on top of 0007 (dummy URL inline). Your entry's `when` must be greater than 0007's (DoD updated), and you append the seed from `CATEGORY_SEED`, paste the SQL, and set REVIEW. I'll ring you when the line lands.
> 2. **`api.ts` mount:** yours, the one line, once TASK-856 is DONE on the board. Before that you set REVIEW without it, and I review the mount as a one-line follow-up.
> 3. **F-037:** goes to Porter in my pointer today. Nothing more for you to do; it is already in FAILURES.
> 4. **Your decision 6 (`actor` = "dev" under `SKIP_ADMIN_AUTH`):** accepted [SA-decided]. It is dev-only, and a real token gives the real `sub`. SPEC §3's "NULL" applies to service writers, not this case.
> 5. **Your decision 3 (bare column names in CHECK):** accepted. We'll see the real SQL at generate; it gets checked in review against Postgres when I apply it on sid.
> 6. **The 2 failing `auth.test.ts` tests** are Team A's uncommitted TASK-856 work. They are not a REWORK reason for you. In review I'll compare against the suite with 856's files excluded.

## Review
**SPEC change, Sector, 2026-11-08, from the TASK-859 review. Do it before you set REVIEW:** `GET /lines` now also returns `revenueMinor` (the non-REFUND lines) and `refundsMinor` (the REFUND lines, ≤ 0), so that `totalMinor = revenueMinor + refundsMinor` (SPEC-098 §3).
- Aggregate both in SQL, like `totalMinor`.
- Add both to the route test's shape assertion.
- Add one test where a REFUND line is in the range.

**Also, from Sober's SPEC-097 §4 heads-up (relayed by Porter):** `bo.test.ts` l.94–106 walks only `boRoutes`, so it never sees your router, and **no edit to `bo.test.ts`** is needed. Give your router the same guard: in `revenue-ledger.test.ts`, walk `revenueLedgerRoutes.routes` and assert that every path has a handler named `requireRevenueAccess`. A new route without the gate must fail the build.

**Unblocked, Sector, 2026-11-08.** Team A's `0007_bo_users_roles` is `applied · verified` on sid (MIGRATION-QUEUE.md), and TASK-856 is DONE (Porter). Do these three, then set REVIEW:
1. **Generate.** Run the host check first, then `db:generate` (dummy URL inline is fine; generate does not connect). Append the seed from `CATEGORY_SEED`. Your entry's `when` must be greater than 0007's. Paste the SQL and the last two `when` values. **Do not apply. I apply it** through the queue after review.
2. **The access seam becomes the CEO gate.** `requireRevenueAccess` = `requireAuth` then `requireRole("ceo")`, from Jason's exports. Add route tests: admin → 403 `FORBIDDEN`, coach → 403, ceo → 200, no token → 401. Your guard-walk keeps asserting `requireRevenueAccess` on every path.
3. **Mount.** Add the one `.route("/revenue", revenueLedgerRoutes)` line plus its import in `src/routes/api.ts`. Then run the whole suite (dummy URL), and give me the counts and any failures with their owner.

**Review, Sector, 2026-11-08. Verdict: DONE.**
- **Re-run by me (dummy URL):** `bun test` → `226 pass · 0 fail · 17 files` (base 137/0/13); `bunx tsc --noEmit -p .` → 0 `error TS`.
- **Read:**
  - `drizzle/0008_bo_revenue_ledger.sql` (93 lines): additive only; 2 tables, the FK, 3 indexes, 5 CHECKs exactly as SPEC §2, and the seed with `ON CONFLICT DO NOTHING`;
  - `middleware/revenue-access.ts`;
  - the service's `sql` uses (the only `sql.raw` is over the constant `REVENUE_TYPES`, so nothing user-supplied).
- **Applied on sid by me** (MIGRATION-QUEUE 0008 lines; host .206 checked before each command):
  - **First `db:migrate`:** it applied 0008. `db:verify` then failed on a pre-existing 0006 ledger gap, not his.
  - **Fix:** `db:seed-ledger` dry-run → `--apply`, which inserted 1 row (DECISIONS row 14).
  - **Second `db:migrate`:** "✅ every migration is recorded in the ledger AND witnessed in the schema".
- **Live read on sid, through his own code:** a local BB on 4310 with `SKIP_ADMIN_AUTH=true` inline (dev user = ceo; a local process only; no password, no token):
  - `GET /api/v1/revenue/categories` → 53 ids;
  - `GET /summary?date=2026-11-08` → 3 blocks × 8 zero rows;
  - `GET /lines` → `{"lines":[],"totalMinor":0,"revenueMinor":0,"refundsMinor":0}`.
  - The aggregate SQL runs on Postgres. Non-zero sums are proven by Flash's real-API run and TASK-864.
- **His declared deviations are accepted:** hand-built 0008 instead of a raw generate (the stale snapshots made raw generate re-create the world), and `requireRole("ceo")` alone (it authenticates itself).
- **Security review:**
  - every revenue route is CEO-only, enforced by the guard-walk test; admin and coach get 403, no token gets 401;
  - inputs are validated by zod; SQL is parameterised (drizzle), and the one `sql.raw` is over constants;
  - no revenue data is reachable by admin.
  - **One dependency, not his:** `SKIP_ADMIN_AUTH=true` makes every caller the dev ceo (`auth.ts:33–49`, Team A's design). It must never be set on a deployed server. Noted to Porter.
