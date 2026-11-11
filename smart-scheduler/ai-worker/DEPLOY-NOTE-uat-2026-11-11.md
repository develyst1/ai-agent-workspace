# DEPLOY NOTE: uat, 2026-11-11: everything on SB/SF `dong` since uat was held (F5 + F2 and the front-office batch)
**Written by Sector (SA, Team C) for Porter, 2026-11-11, after the owner's "เลย" for F5 + F2 on uat (Porter's 21:41 line).** Docs and read-only work only: I deploy nothing. The owner runs every step on uat.
Read on: SB `bfe5ef6`, SF `6c63154` (both trees clean), BB `6f1b427` (files only), plus 5 read-only uat queries via `scripts/uat-select.mjs` (host printed `172.17.172.29/32` = uat's internal address; counts only, no personal data).

## 🔴 READ FIRST: one decision before any step (D1)
**On uat, the `bo` schema has ONLY the stock tables:** `item · item_tag · movement · tag_group · tag_value` (my catalog read, 2026-11-11). **`bo.revenue_category`, `bo.revenue_line` and `bo.payment` do not exist there.** sid has them (the back office runs there), so no sid test could see this.
This SB build reads those tables in three places with no fallback:
- **The camp package list of every child** (`camp.service.ts:385` → `confirmedOnByPackage`, a plain SELECT on `bo.revenue_line`) ⇒ **the camp list fails (500) for every child on uat.**
- **The Payment card** (`GET` / `POST` / `PATCH` payments, `payment-record.ts:158+`) ⇒ fails; the SF shows the card live (`PAYMENTS_LIVE = true`).
- **"Confirm camp"** (`camp-confirm.ts:59`) ⇒ fails.

The sale and confirm paths themselves are safe: the revenue line and the payment row are written in a savepoint and only `console.error` when the table is missing (`revenue-line.ts` header, `payment-record.ts:110-120`).

**D1, the owner chooses one.** ⭐ **SA pick changed at 22:30 to C** (owner: *"ทำไม ไม่ migrate ให้เท่ากันก่อนขึ้นล่ะ"*). C is assessed in §D1-C at the end of this note; it replaces STEP 2 below.
- **C (SA pick): run the back office's own full `db:migrate` on uat**, so uat's `bo` schema and BB ledger equal sid's. See §D1-C.
- **A: create the three tables on uat first, with the back office's own migration files `0008_bo_revenue_ledger.sql` + `0012_bo_payment.sql`** (BB repo `drizzle/`). Both only create new tables (0008 also seeds 53 revenue categories); they touch no existing table. From then on uat records revenue lines and payment rows, as sid does. **Known cost:** BB's migration ledger on uat won't list those two. When the back office itself goes to uat, mark them applied first, or its `db:migrate` stops on "relation already exists". That's a step for that deploy, not this one.
- **B: a code guard first** (camp list and payment card treat a missing table as "none"; Confirm camp answers a clear refusal). ≈ 0.25 d BE + review + sid + Tanya + ขึ้น git, **then** this deploy. On uat, no revenue or payment rows are kept until the back office arrives.
- 🚫 **Not an option: deploying as is.** The camp list would break for real admins.

## 1. What goes
**Repos: SB + SF together.** TASK-875 and TASK-876 must ship in one deploy, and sid runs exactly this pair: SB `bfe5ef6` + SF `6c63154` (TEST-153 ran on it).
- **SB:** uat runs `0a1f250`/`7601560` (my inference: uat has migrations up to 0073 and none of 0074–0076; the only commit between them touches CLAUDE.md). It goes to **`bfe5ef6`**, which adds 6 commits.
- **SF:** uat runs `45bf187` (owner, 11-08). It goes to **`6c63154`** (`dong`).
- **Palm's SF `develop` `86316ee` is OUT.** It is `6c63154` plus one commit (the SOM per-activity pies) and has never been on sid. Owner's rule: *"ต้องเทสด้วยนะที่ sit ไม่งั้น ไม่ขึ้น uat"*. Its way in: sid deploy of SF `develop` → Tanya's screen check → a later uat deploy. The API it reads (TASK-950) does go now and is harmless to the old screen.

| Plain name | TASK | Repo | sid proof |
|---|---|---|---|
| **F5: a cancelled make-up never re-grows onto its own date** | 946 | SB | TEST-152 PASS |
| **F2: no parent message while a course is PENDING; one schedule message, with the make-up dates, at Confirm Course** | 947 | SB | TEST-152 PASS (incl. the undo fix) |
| Voucher counts booked sessions; an empty voucher's check-in is refused (+ the used-up voucher page in LINE; row lock; voucher end cancels อื่นๆ draws) | 870 (+Am.2, Am.3) | SB + SF | TEST-148, TEST-149 (1) |
| "No Teacher" system coach for park-fee blocks | 861 | SB + SF | TEST-148 |
| F4 links: trial → course/voucher, renewal, first coach (data only) | 860 | SB | Silver's review; no screen |
| C1: a revenue line at every confirm/sale | 864 | SB | TEST-148 (3), TEST-149 (5) |
| Payments: a payment row at sale, Payment Method at sale, Payment card + installments | 875 + 876 | SB + SF | TEST-149 (2), P8 partly NOT_TESTED |
| Branch at booking (Bravo / อื่นๆ) on course, voucher, booking | 889 + 898 | SB + SF | TEST-149 (3) API ✅; painted: the plan window's branch box shows empty (TEST-149 painted (a)) |
| Confirm camp (badge + dialog) + the camp list's net amount | 900 + 901 + 916 | SB + SF | API ✅; 916 re-check ✅; **the painted card + dialog NOT_TESTED** |
| Coach Capacity: FT 4/5 · PT 5 (own rate wins) · ECA + camp hours count | 877 | SB | TEST-148 |
| SOM dashboard API: demographics base = Total Customer + 1 HR (last 3 months); activity packages | 950 | SB | TEST-153 PASS (API) |
| SOM card colours + hover (Palm) | — | SF | on sid since 11-09 |
| Pay-slip LINE reminders 09:00 / 11:00 | 888 | SB | **inert on uat:** only an outside scheduler calls `/internal/jobs/pay-confirm-*`, uat has none, and the job needs the back office. Add no cron. |

**Visible to the customer the moment it is live:** the Branch field (default Bravo) · the Payment card · the camp "Confirm" badge · the "No Teacher" column on the calendar · the voucher refusal sentence · **SOM dashboard numbers move** (capacity rates, 877; demographics base, 950). Porter: Khwan hears this in one message after Tanya's round.

## 2. Migrations that run on uat: 3, all SB, forward-only
1. **`0074_conversion_links_first_coach`:** nullable link columns on `course_packages` (5) and `vouchers` (4), plus 2 partial unique indexes. **No backfill:** existing rows stay NULL.
2. **`0075_system_teacher`:** `teachers.is_system`, plus **ONE new row, "No Teacher"** (`FREELANCE`, active), plus a one-row unique index. uat now has 30 teachers and 0 "No Teacher".
3. **`0076_branch_on_course_voucher_booking`:** `branch text NOT NULL DEFAULT 'BRAVO'` on `course_packages` / `vouchers` / `bookings`, plus a CHECK (`BRAVO`/`OTHER`) each. Every existing row reads BRAVO. Adding the CHECK scans the tables once (5,744 bookings, so fast).

**Risk to live data:** low. Nothing existing is rewritten except the default `BRAVO` on old rows, and one row is added. **Plus D1-A's two back-office files** (new tables only).

## 3. BEFORE: what uat holds now (my reads, 2026-11-11 ~22:00; the owner re-reads at deploy time)
| Read | Now |
|---|---|
| host | `172.17.172.29/32` (uat internal) |
| migrations present | 0070 `range_id` ✔ · 0071 `teacher_leave_removals` ✔ · 0072 `ENDED_EARLY` ✔ · 0073 `weekend_capacity_hours` ✔ · **0074–0076 absent** |
| `bo` tables | `item item_tag movement tag_group tag_value` (**no revenue/payment**, D1) |
| teachers · "No Teacher" | 30 · 0 |
| course_packages · vouchers · bookings · camp_packages | 540 · 69 · 5,744 · 35 |
| outbox PENDING | 0 |
| QA test kids (`QAChat%`) | 0 (it's uat, not sid) |

**Owner's SQL, bare, one at a time, on the uat database:**
```sql
SELECT inet_server_addr();
```
```sql
SELECT (SELECT count(*) FROM teachers) AS teachers, (SELECT count(*) FROM course_packages) AS courses, (SELECT count(*) FROM vouchers) AS vouchers, (SELECT count(*) FROM bookings) AS bookings, (SELECT count(*) FROM notification_outbox WHERE status='PENDING') AS outbox_pending;
```
**STOP if:** the host isn't `172.17.172.29`, or `outbox_pending` > 0 (let the worker drain first, then re-read).

## 4. Steps, in order (the owner)
**STEP 0: trees.** In the SB folder: `git status` (clean) and `git log --oneline -1` → **`bfe5ef6`**. In the SF folder: clean and **`6c63154`**. Anything else ⇒ **STOP**. Note: SF's `origin/develop` moved to `86316ee` (Palm); build from `dong`, not `develop`.
**STEP 1: env.** The owner's usual uat routine (each repo's `.env.uat`). No new env key is required. `BACKOFFICE_API_URL` empty is fine (posting is skipped, never failed). Leave `LINE_OA_WRITE_ALLOW` as uat has it.
**STEP 2 (D1-A only): the two back-office tables.** Open BB `drizzle/0008_bo_revenue_ledger.sql`, run it whole on uat. Then the same with `drizzle/0012_bo_payment.sql`. Check:
```sql
SELECT (SELECT count(*) FROM bo.revenue_category) AS categories, (SELECT count(*) FROM bo.revenue_line) AS lines, (SELECT count(*) FROM bo.payment) AS payments;
```
**Expect 53 · 0 · 0.** An error ⇒ STOP, nothing else runs. (Each file is all-or-nothing in a transaction only if your tool wraps it; otherwise send me the error.)
**STEP 3: SB migrate.**
```bash
bun run db:migrate
```
Expect, in order:
- `db:preflight — 3 pending migration(s): 0074_conversion_links_first_coach, 0075_system_teacher, 0076_branch_on_course_voucher_booking` and `✅ this batch can be applied in one run.`
- drizzle applies 3.
- `Journal: 77 migration(s)`, `Schema witnesses: 77 applied`, and **`✅ every migration is recorded in the ledger AND witnessed in the schema.`**

**STOP on:** any other pending list · `Nothing was applied.` · `could not decide` · a 🔴 line · `Deploy is NOT complete`. Send the output; never re-run blindly.
**STEP 4: build + restart SB, then SF** (the usual uat way). Both, in the same sitting: the SF's Branch field and Payment card call the new SB routes.
**STEP 5: the log line.** SB prints `[outbox] LINE worker started` once after the restart. No line ⇒ STOP and send the log.

## 5. AFTER: checks (owner's SQL; then I re-read with uat-select and Tanya does the screens read-only)
```sql
SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND ((table_name='course_packages' AND column_name IN ('branch','from_trial_booking_id','prev_course_id','prev_voucher_id','first_teacher_id','latest_teacher_id')) OR (table_name='vouchers' AND column_name IN ('branch','from_trial_booking_id','prev_course_id','prev_voucher_id','first_teacher_id')) OR (table_name='bookings' AND column_name='branch') OR (table_name='teachers' AND column_name='is_system'));
```
**Expect 13.**
```sql
SELECT (SELECT count(*) FROM teachers) AS teachers, (SELECT count(*) FROM teachers WHERE is_system) AS system_teacher, (SELECT count(*) FROM bookings WHERE branch <> 'BRAVO') AS non_bravo, (SELECT count(*) FROM course_packages) AS courses, (SELECT count(*) FROM bookings) AS bookings;
```
**Expect teachers 31, system_teacher 1, non_bravo 0, courses and bookings = the BEFORE numbers** (plus any real bookings made in between).

**Tanya on uat, READ-ONLY.** Never press Save, Confirm, Cancel, Move, Sell, Pay or Check-in: each reaches real families. She looks, in TH and EN:
- a child's **camp list opens** (the D1 line);
- a course's **Payment card opens**;
- the **Branch** field shows on New course / Issue voucher (view only, closed without saving);
- the **"No Teacher"** column;
- the SOM dashboard loads;
- the outbox stays drained.

**F5/F2 themselves can't be proved on uat read-only** (they need a cancel / confirm). They rest on TEST-152 on sid. The first real Confirm Course after the deploy is the live proof: one parent message, with make-up dates.

## 6. Known and deliberate
- The camp **"Confirm" card + dialog were never painted on sid** (TEST-149 (b) NOT_TESTED). The plan window's branch box shows **empty** for a stored branch (TEST-149 painted (a)), a display gap; the data is right.
- The group-series **cancel-all** still regrows make-ups the old way (TASK-946 follow-up, ≈ 0.25 d, queued after this).
- Q-153-1 (what the 1 HR package counts) is open. It affects only `activityPackages`, which no uat screen shows until Palm's `86316ee`.

## 7. Rollback
SB → `0a1f250`, SF → `45bf187`, **together**. 🚫 No down-migration on a live box: 0074–0076 and the D1-A tables stay. The old code ignores the new columns, and old inserts take `branch` = BRAVO by default. **One visible leftover:** the old code knows nothing of `is_system`, so **"No Teacher" would appear as an ordinary coach** in lists and pickers until it is archived (that's the owner's call then). Messages already sent stay sent.

## §D1-C: the back office's full `db:migrate` on uat (Sector, 2026-11-11 ~22:30; read-only assessment)
Read on: BB `6f1b427` (`drizzle/`, `scripts/` and `migration-witness.ts` are clean; the uncommitted files are only route/service code, which this run doesn't use) plus 3 uat catalog reads (no data rows).

**What uat holds today (catalog):**
- `bo`: `item` (46 rows) · `movement` (~2,768) · `item_tag`, `tag_group`, `tag_value` (0).
- `bo.movement` already has `actor` + `note` (0006 ✔); `bo.item` has `external_ref` (0005 ✔).
- **No `bo.users` and no `bo.role` type: 0007 never stuck on uat.**
- `ops`: 15 empty tables (0000/0003, a retired schema).
- **The BB ledger `drizzle.__drizzle_migrations_bo` has 8 rows** (from table stats: 8 inserted, 0 deleted). Its rows aren't readable by my role, so **which 8 is unknown.**

**(1) What would run: up to 15 migrations, 0007 → 0021.** drizzle runs every migration newer than the ledger's last row, **all in ONE transaction**: any error ⇒ nothing applied.
- **Effect on the live stock tables (`bo.item`, `bo.movement`): three nullable ADD COLUMNs, nothing else.**
  - `0015` `item.commission_group`
  - `0017` `movement.occurred_on`
  - `0018` `item.revenue_category_id` (FK to the new categories)
- **No ALTER of existing values, no DROP, no backfill, no row rewritten.**
- **Everything else is new and empty**, except three seeds:
  - users/roles (0007);
  - revenue (0008: **53 categories**);
  - salary (0009–0011, 0014);
  - payment (0012);
  - school/transport (0013);
  - sale (0016);
  - demo stock (0019);
  - notifications (0020: **7 assignment rows for role ceo + 5 low-stock thresholds**);
  - `users.fo_user_id` (0021).
- No back office runs on uat, so nothing reads any of it except SB (revenue line, payment).

**(2) Will the ledger gap hit uat? Probably, in two places, and both are caught:**
- **a. `0021` alters `bo.users`, which uat lacks.** If the ledger's last row is 0007 (likely: 8 rows ≈ 0000–0007), drizzle starts at 0008, never creates `users`, and **0021 fails ⇒ the whole run rolls back, nothing applied.** Fix: run **0007's SQL by hand first**. It is fully guarded (`CREATE TYPE … EXCEPTION WHEN duplicate_object`, `CREATE TABLE IF NOT EXISTS`, `CREATE UNIQUE INDEX IF NOT EXISTS`), so it is safe whatever the ledger says.
- **b. The sid-style gap:** `db:verify` (the second half of `db:migrate`) checks that every journal entry is in the ledger, except the 2 retired ones (0001, 0002). If uat's 8 rows skip one (as 0006 was skipped on sid), the verify goes red **after** the migrations have committed. **Fix, as on sid** (TASK-858; DECISIONS row 14): `db:seed-ledger` dry run → send me the output → `--apply` → `db:verify` green.

**(3) Steps (they replace STEP 2 of §4; then STEP 3 onward as written):**
- **C0, env:** the owner's usual uat routine (BB's `.env.uat`).
- **C1, the owner reads the ledger (bare SQL):**
  ```sql
  SELECT id, created_at FROM drizzle.__drizzle_migrations_bo ORDER BY created_at;
  ```
  The `created_at` values match these journal `when`s: 0000 `1782753248558` · 0001 `…559` · 0002 `…560` · 0003 `1784531451038` · 0004 `…039` · 0005 `1785542400000` · 0006 `1785628800000` · 0007 `1794075519530`.
  **Go only if the LAST row is `1785628800000` (0006) or `1794075519530` (0007).** Anything later, or earlier than 0006 ⇒ **STOP**, send me the list.
- **C2, run BB `drizzle/0007_bo_users_roles.sql` whole on uat.** Check:
  ```sql
  SELECT to_regclass('bo.users') IS NOT NULL AS users_ok;
  ```
  Expect `true`.
- **C3, from the BB folder:**
  ```bash
  bun run db:migrate
  ```
  Expect drizzle to apply 14 (or 15 if the ledger ended at 0006), then:
  - `Journal: 22 migration(s) · ledger drizzle.__drizzle_migrations_bo: N row(s)`;
  - `ℹ️ 2 migration(s) are RETIRED`;
  - **`✅ every migration is recorded in the ledger AND witnessed in the schema (retired excepted).`**

  **STOP on:** a drizzle error (nothing was applied: send it) · `🔴 … NOT recorded as applied` (that's (2)b: go to C3b) · a witness line other than `applied` / `retired`.
  **C3b, only on (2)b:**
  ```bash
  bun run db:seed-ledger
  ```
  This is a dry run: send me the output, wait for my "apply", then run `bun run db:seed-ledger --apply` and `bun run db:verify`, and expect the ✅ line.
- **C1 result (owner, 22:44): 8 rows; the last is 0006 ⇒ GO. The 0004 `created_at` appears twice (ids 5 and 7).**
  - **Effect on the migrate: none.** drizzle looks only at the last `created_at`, so it applies 15 (0007–0021; the hand-run 0007 makes its own 0007 a no-op).
  - **Expected:** `Journal: 22 migration(s) · ledger …: 23 row(s)` (8 + 15).
  - **The verify matches by file HASH, not timestamp.** If the duplicate (or any old row) carries a hash that isn't today's file, it reports one of **0000/0003/0004/0005/0006** as `NOT recorded`. That's the C3b path (seed-ledger dry run → me). It isn't a STOP: the 15 new ones are already committed and fine.
  - 🔴 **A real STOP:** a red line naming any of **0007–0021**, or any witness not `applied` / `retired`.
- **C4, the check:**
  ```sql
  SELECT (SELECT count(*) FROM bo.revenue_category) AS categories, (SELECT count(*) FROM bo.revenue_line) AS lines, (SELECT count(*) FROM bo.payment) AS payments, (SELECT count(*) FROM bo.item) AS items, (SELECT count(*) FROM bo.movement) AS movements;
  ```
  **Expect 53 · 0 · 0 · items and movements = their counts before C1** (read them in C1 too: today 46 · ~2,768). Then continue at STEP 3 (the SB migrate).

**(4) Pick: C, over A.**
- uat ends up equal to sid, with no ledger debt left for the back office's own uat release (A leaves two hand-made tables its ledger doesn't know).
- The live stock rows are not rewritten.
- One transaction means a failure applies nothing.

The extra cost is one ledger read, one guarded SQL file, and possibly a seed-ledger round. **Not clean in one respect:** it creates the empty salary, users, sale and notification tables on the customer's database before the back office is released there. They are harmless while no back office runs on uat, and the owner should know.
