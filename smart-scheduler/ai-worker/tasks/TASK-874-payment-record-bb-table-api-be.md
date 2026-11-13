# TASK-874: F2 payment record: `bo.payment` table + back-office API (BB)
- Source: SPEC-099 §8 (decisions 1, 2, 4, 5)
- Owner: BE (Brew, Team C) · Status: DONE (Sector, 2026-11-08; sid proof read) · Depends on: none (first of the three; TASK-875 waits for its migration on sid)
- Repo: `smart-scheduler-backoffice-back` (BB), `dong`, dirty tree (other teams' work; leave it alone). **Edit nothing until Porter's claim line names these files for Team C** (requested 2026-11-08).
- **Base (Sector, 2026-11-08, dummy URL):** `bun test` → `322 pass · 0 fail · 20 files`; `bunx --package typescript@5.9.2 tsc --noEmit -p .` → 0 `error TS` (the TASK-872 pinned form).
- 🔴 Host check before anything that can connect. **You generate the migration; Sector applies it** through `MIGRATION-QUEUE.md`.
- Files (closed list):
  - `src/db/schema-revenue.ts`: add `payment`, exactly SPEC-099 §8.2's SQL;
  - the one new `drizzle/NNNN_*.sql` + its `_journal.json` entry + snapshot;
  - `src/lib/migration-witness.ts`: one appended entry (DECISIONS row 6);
  - `src/services/revenue-ledger.service.ts` + `src/routes/revenue-ledger.ts` + `src/routes/revenue-ledger.test.ts`: the payment routes go on the existing router (already mounted);
  - `src/lib/revenue-ledger.ts` (+ test): validators and helpers, if you want them there;
  - `src/middleware/revenue-access.ts`: add a second named gate `requirePaymentAccess` = `requireRole("ceo","admin")`.
- Git writes: none.

## What to do
1. **Migration:** SPEC-099 §8.2 exactly, built the way 0008 was (hand-checked SQL, additive only; no DROP, no ALTER of an existing table). `when` greater than every journal entry at generate time.
2. **Routes on `revenueLedgerRoutes`, under `/payments`, all through `requirePaymentAccess`** (an admin may record payments; R0.2: the response holds no revenue figure). Shapes exactly as SPEC-099 §8.5:
   - `GET /payments?refType&refId`;
   - `PATCH /payments/:id`;
   - `POST /payments` (`n` = max+1 for that ref, in one statement or a transaction, so two concurrent adds can't take the same `n`; the unique index is the backstop and maps to 409).
   - Rule: row `n=1`'s `amountMinor` is not editable (400 `VALIDATION`).
   - `actor` = JWT `sub`.
3. **The revenue-line follow (§8.4):** a PATCH that changes row 1's `method` also updates `bo.revenue_line.method` where `idempotency_key = 'rl:' || lower(ref_type) || ':' || ref_id` (i.e. `rl:course:<id>` / `rl:voucher:<id>`), in the **same transaction**. If no line exists yet (not confirmed yet), only the payment changes. Installments (`n ≥ 2`) never touch the revenue line.
4. **Guard walk:** extend your TASK-858 guard-walk so every `/payments` route carries `requirePaymentAccess` and every other revenue route still carries `requireRevenueAccess`.
5. **Tests (service mocked, as TASK-858):**
   - the shapes;
   - 400 on: bad method, amount ≤ 0, editing row 1's amount, bad date;
   - 409 on a duplicate `n`;
   - admin → 200 on payments and 403 on revenue;
   - coach → 403;
   - a unit test of the follow rule: row 1 method change updates the line; `n ≥ 2` doesn't.

## Definition of Done
- [ ] `bun test` (dummy URL) → 0 fail, pass > 322.
- [ ] Pinned tsc → 0 `error TS`.
- [ ] `grep -nEi "drop |alter table \"bo\".\"(item|movement|tag|revenue)" drizzle/<new>.sql` → no output.
- [ ] **The SQL on sid, after I apply it:** a scratch script (host printed first; C-TEST data only; the shape Brew used in TASK-864) proves on Postgres:
  - insert row 1, then PATCH its method → the matching C-TEST revenue line's method changes in the same transaction;
  - an installment doesn't change it;
  - a duplicate `n` → the 409 path.
  - Paste the output.
- [ ] `git status --porcelain`: only the listed files.

## Implementation Notes
**Brew, 2026-11-08. Claim granted (Porter, evening). Host of BB's `.env` = `154.197.124.206` (sid), checked first. Dummy `DATABASE_URL` on every test run; pinned `typescript@5.9.2` for tsc. Nothing applied to any database; no git. §8.9 read first: installments SPLIT the fee, so the "row 1 amount not editable" rule and test are dropped, and the `sum ≤ fee` 400 and `NO_FEE` 409 are in.**

**Files (the closed list, nothing else):** `src/db/schema-revenue.ts` (`boPayment`) · `drizzle/0012_bo_payment.sql` + its `_journal.json` entry + `drizzle/meta/0012_snapshot.json` · `src/lib/migration-witness.ts` (one appended entry) · `src/services/revenue-ledger.service.ts` · `src/routes/revenue-ledger.ts` · `src/routes/revenue-ledger.test.ts` · `src/lib/revenue-ledger.ts` + `.test.ts` · `src/middleware/revenue-access.ts`.

**What was built**
- **Table** `bo.payment`, exactly SPEC-099 §8.2 (10 columns, 4 CHECKs, unique `(ref_type, ref_id, n)`), in `schema-revenue.ts`.
- **Migration `0012_bo_payment`:** built the way 0008 was. A raw generate also re-emits Team A's tables (their hand-written 0009–0011 have no snapshots), so I generated into a scratch copy and took ONLY the `payment` CREATE TABLE and its unique index (compared line by line with §8.2), plus the scratch run's full `0012` snapshot. Two statements, additive only. `when` `1794147207607` > 0011's `1794146584908`, strictly ascending across all 13 entries, idx contiguous, every tag has its file. **Not applied.**
- **Gate** `requirePaymentAccess` = `requireRole("ceo","admin")` (a named function, like `requireRevenueAccess`); every other revenue route keeps the ceo-only gate.
- **Routes** on `revenueLedgerRoutes`, under `/payments`, shapes exactly SPEC-099 §8.5/§8.9: `GET ?refType&refId` → `{ payments:[{id,refType,refId,n,paidOn,amountMinor,method,updatedAt}], feeMinor, paidMinor, remainingMinor }` · `POST` → `201 { payment }` with `n = max+1` · `PATCH /:id` `{method?,paidOn?,amountMinor?}` → `200 { payment }` (any one field is enough; row 1's amount is editable) · no DELETE. `actor` = the JWT `sub`. Responses carry payment rows only: no revenue-line data (R0.2).
- **The rules** (pure, `lib/revenue-ledger.ts`; the service only reads and writes): the fee = `course-sale:<id>` / `voucher-sale:<id>` + `discount:<id>` read from `bo.movement` (the TASK-864 rule; `null` when the sale movement is absent); `installmentsFit` (sum ≤ fee, boundary inclusive); `paymentTotals`; the follow rule `followsRevenueLine` (row 1 AND a method in the patch); the line key `rl:<course|voucher>:<id>`.
- **The follow (§8.4):** a PATCH that changes ROW 1's method also sets `bo.revenue_line.method` where `idempotency_key = rl:course:<id>` / `rl:voucher:<id>`, **in the same transaction**. No line yet → the UPDATE matches nothing and only the payment changes. Installments, and row 1's date/amount edits, never touch it.

**Declared decisions (internal; overturn at review)**
1. **Every write runs in one transaction under a per-sale advisory lock** (`pg_advisory_xact_lock(hashtext('payment:<type>:<id>'))`), so two concurrent adds cannot take the same `n` and the `sum ≤ fee` check cannot race; the unique index stays the backstop and a collision (`23505`) maps to 409 `CONFLICT`. PATCH re-reads the row after taking the lock.
2. **A PATCH that changes the amount needs a fee** (409 `NO_FEE` otherwise): a sum cannot be checked without one. Method and date edits need no fee.
3. **`POST` on a sale with no posted sale movement → 409 `NO_FEE`**, which also stops a payment on a made-up sale id (there is no FK to `public`).
4. The API accepts `refType` `COURSE` and `VOUCHER` only (slice 2a); the table's CHECK already allows the later kinds.
5. The first row for a sale may be POSTed (`n = 1`): sales made before this ships have no auto row (their line keeps `TRANSFER`).
6. Over-fee message: "the installments add up to more than the course fee" (voucher: "…the voucher fee").
7. In the route test file the REAL service is imported as `…service.ts?real` so it is not the module the route tests mock (`mock.module` is keyed by the plain path); a test asserts the two differ.

**Evidence (dummy URL; pinned tsc)**
- Base (this TASK, before I edited): `415 pass · 0 fail · 24 files`; `tsc` exit 0 (Sector's stated base was `322 / 0 / 20`; the tree moved on with my TASK-863 and Team A's work).
- Now: **`485 pass · 12 fail · 24 files`**; `tsc --noEmit` → exit 0, 0 `error TS`. **My files: 0 fail.** `routes/revenue-ledger.test.ts` 66 → **120 pass**; `lib/revenue-ledger.test.ts` 15 → **29 pass** (+68 tests, all mine).
- **The 12 failures are not mine, and I checked rather than assumed.** They are in 3 files: `src/routes/salary-people-task871.test.ts` ("the pay run still takes only ACTIVE FT profiles": expects `created: 1`, gets 2) · `src/routes/salary-routes-task865.test.ts` ("every /salary route behind requireRole" expects 13 routes, finds 15; plus the HTTP round trip and the demo-path/lazy-lock/teacherName/run-semantics/validation cases that build on it) · `src/services/salary-engine-task865.test.ts`. **Owner: whoever is changing the `/salary` router and pay run (Team A/B's Salary pile).** Evidence it is not me: those files import only `salary.service`, `salary-memory.store`, `./salary`, `hono`, `jwt`, `http`, `role-of-day`, `satang`; none of the files I changed is imported by them or by the salary modules (grep: no hit for `revenue-ledger`, `revenue-access`, `schema-revenue`, `requirePaymentAccess`, `migration-witness`); and `src/routes/salary.ts`, `salary.service.ts`, `salary-db.store.ts`, `salary-memory.store.ts` were modified at 21:13–21:14, minutes before my run. The other +14 tests (+2 pass, +12 fail) in the count are those files' new or changed tests.
- `grep -nEi "drop |alter table \"bo\".\"(item|movement|tag|revenue)" drizzle/0012_bo_payment.sql` → no output (exit 1).
- `git status --porcelain`: 49 → 52. Mine: `drizzle/0012_bo_payment.sql` and `drizzle/meta/0012_snapshot.json` (new), `_journal.json` and `migration-witness.ts` (one appended entry each) and my earlier-modified revenue files. Nothing outside the list.
- **Guard walk (TASK §4), updated:** every non-payment route has a handler named `requireRevenueAccess`, every `/payments` route has `requirePaymentAccess`, a non-vacuity check (8 routes exist, exactly 3 under `/payments`), and "the gates never cross".
- **Tests (service mocked, as TASK-858):** the shapes of all three routes; 400 on a bad method, amount ≤ 0 / fractional, a bad or impossible date, a non-uuid ref/id, an unknown or later `refType`, an empty patch; 409 on a duplicate `n` and on `NO_FEE`; 400 over the fee; **role matrix on all three routes: no token 401 · coach 403 · admin past the gate · ceo past the gate; an admin reads payments (200) but gets 403 on `/summary`, `/lines`, `/categories`; an admin's responses contain no `revenue` / `totalMinor` / `rl:`**; no DELETE. **The follow rule** and the fee rules on the REAL service through a recording fake: row 1 method change updates the line (key `rl:course:<id>`, `rl:voucher:<id>` for a voucher) after the payment update, in one transaction after the lock; n = 2, 3, 7 never touch the line; row 1's date/amount edit never does; an amount that fits is accepted at the boundary, one satang more → 400 with nothing written; no fee → 409 `NO_FEE`; unknown payment → 404; POST `n = max+1`, first row `n = 1`, sum over the fee → 400 and no insert, no fee → `NO_FEE` and no insert, a discount-only movement is not a fee, `23505` → 409, any other error is not turned into a 409; GET totals (fee = sale + discount, remaining = fee − paid, voucher key, null fee), and GET runs no write.

**NOT VERIFIED — the sid proof (DoD) waits for you to apply 0012.** The table does not exist on sid yet (I checked: `to_regclass('bo.payment')` is null). The scratch script is ready (`payment-sid-proof.ts` in my scratchpad): host printed first, guard-tested with the dummy URL; it builds a C-TEST sale (a random id) with its two movements and a revenue line inside ONE transaction that is **rolled back at the end** (nothing persists, stricter than "C-TEST rows"), and proves on Postgres: insert row 1 and PATCH its method → the revenue line's method changes in the same transaction · an installment does not change it · the fee rule (over → 400, the boundary) · `NO_FEE` · a duplicate `n` fires the real unique index (`23505`, which the service maps to 409) · the transaction survives that failed insert · the CHECKs reject a bad method / amount 0 / `n` 0 / unknown `ref_type` · a residue count after the rollback. Ring me when 0012 is `applied · verified` and I run it.
- Also not exercised: two truly concurrent POSTs (the advisory lock is asserted to run first, not raced), and a revenue line with no matching payment on real data.

## Questions
- **For Sector:** none blocking. One for your review: the per-sale advisory lock (decision 1) is my addition; it costs one extra statement per write and removes the `n` race the TASK asked to guard. Say if you would rather rely on the unique index alone.

## Review

**Claim granted (Porter, 2026-11-08 evening).** All files are Team C's or new. Start after TASK-863 (block 1 comes first, owner order).

**SPEC change before you start (Sector, 2026-11-08): read SPEC-099 §8.9.** Installments split the fee. Every row's amount is editable, the API enforces `sum ≤ fee`, and GET adds `feeMinor` / `paidMinor` / `remainingMinor`. Drop the "row 1 amount not editable" rule and test; add the `sum > fee` 400 and the `NO_FEE` 409.

**Review, Sector, 2026-11-08. Verdict: DONE for the code; the sid proof (DoD) is still to run, by Brew.**
- **Re-run by me (dummy URL):** his two files `149 pass · 0 fail`; the **whole suite `512 pass · 0 fail`**, since the salary owners fixed their 12 meanwhile; pinned tsc → 0 `error TS`.
- **Read `drizzle/0012_bo_payment.sql`:** exactly SPEC-099 §8.2 (10 columns, 4 CHECKs, the unique index); additive only.
- **Applied on sid by me:** MIGRATION-QUEUE 0012 lines, host .206 checked. `db:migrate` gives "migrations applied successfully"; `db:verify` gives "✅ every migration is recorded … and witnessed" (journal 13, witnesses 11).
- **Accepted:**
  - the advisory lock (decision 1): one statement buys a race-free `n` and a race-free fee check, and the unique index stays the backstop;
  - decisions 2–7, including POSTing a first row for pre-ship sales and `?real` for the real service in tests.
- **Security review:**
  - payments are CEO + admin; every other revenue route stays CEO-only, and the guard-walk proves both gates never cross;
  - inputs are zod-validated, with uuid checks;
  - parameterised SQL; the advisory-lock key is built from validated values;
  - an admin's responses carry no revenue-line data (asserted).
  - Findings: none.
- **Still open:** run `payment-sid-proof.ts` (a rolled-back transaction) now that `bo.payment` exists, and paste the output here.

---
## The sid proof — Brew, 2026-11-08 (0012 `applied · verified` by Sector; the DoD item)
Scratch script outside the repo (`payment-sid-proof.ts`), cwd = BB, **host `154.197.124.206` printed first**, guard-tested with the dummy URL (it aborted, "Nothing was run"). The sale is C-TEST: a random uuid that is no real sale. **Everything ran inside ONE transaction that was rolled back at the end, so nothing persisted** (stricter than "C-TEST rows"). It calls the REAL service functions (`createPayment`, `updatePayment`, `listPayments`) on real Postgres.

```
host: 154.197.124.206
bo.payment exists on sid: true
fixtures: fee 950000 (sale 1000000 − discount 50000); revenue line method = TRANSFER
GET (no rows yet): rows 0 · fee 950000 · paid 0 · remaining 950000
POST row 1: n=1 amount 950000 method TRANSFER
PATCH row 1 method → CASH: revenue line method now CASH (expect CASH) ✔=true
POST with the fee already fully paid → 400 VALIDATION: the installments add up to more than the course fee
row 1 lowered to 500000, POST row 2: n=2 amount 450000 (500000 + 450000 = fee)
PATCH row 2 to 450001 (sum 950001 > fee) → 400 VALIDATION
PATCH installment (n=2) method → TRANSFER: revenue line still CASH (was CASH) ✔=true
PATCH row 1 date only: revenue line still CASH ✔=true
GET: rows n1=500000/CASH, n2=450000/TRANSFER · fee 950000 · paid 950000 · remaining 0
response keys: payments,feeMinor,paidMinor,remainingMinor · payment keys: id,refType,refId,n,paidOn,amountMinor,method,updatedAt · mentions revenue: false
POST on a sale with no posted fee → 409 NO_FEE
duplicate (ref_type, ref_id, n=2) → postgres error 23505 (the service maps 23505 → 409 CONFLICT) ✔=true
the transaction survived the failed insert (savepoint): still 2 rows
CHECK method BARTER: 23514
CHECK amount 0: 23514
CHECK n 0: 23514
CHECK ref_type NOPE: 23514

rolled back. residue on sid after the run: {"payments":0,"movements":0,"lines":0} (all zero expected)
```
**What it proves on real Postgres:** the three DoD points — (1) insert row 1, PATCH its method → the matching revenue line's method changes (TRANSFER → CASH) in the same transaction; (2) an installment (n=2) method change and a row-1 date edit leave the line alone; (3) a duplicate `n` fires the real unique index (`23505`), which `createPayment` maps to 409 `CONFLICT`. Plus: the fee rule on real data (over the fee → 400 at the boundary, exactly the fee accepted, row 1's amount editable per §8.9), `NO_FEE` → 409, the GET totals, an admin-safe response (no revenue wording), the savepoint surviving a failed insert, and all four table CHECKs (`23514`). **Not raced:** two truly concurrent POSTs (the advisory lock is asserted to run first in the unit tests, not exercised under contention on sid).

**Review closed, Sector, 2026-11-08. Verdict: DONE.** I read the sid proof above (host .206):
- a row-1 method change moves the revenue line (TRANSFER → CASH); installments and a date edit don't;
- the fee rule holds at the boundary (a 1-satang overrun → 400);
- `NO_FEE` 409, `23505` on a duplicate `n`, the savepoint survives, and all four CHECKs fire;
- the response carries no revenue keys;
- the rolled-back run leaves residue 0.
All DoD items are met.
