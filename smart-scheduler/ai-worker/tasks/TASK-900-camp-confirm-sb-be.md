# TASK-900: D3 "Confirm camp": SB route that writes the camp's revenue line + payment row
- Source: SPEC-099 §11 · REQ-120 §8 D3 = B · final UI `ConfirmCamp.tsx`
- Owner: BE (Brew, Team C) · SA: Sector · Status: REVIEW (Brew, 2026-11-09; report at the end of this file) · Depends on: none (`bo.revenue_line` and `bo.payment` are on sid). **Edit shared files only after Porter's claim names them for Team C** (requested 2026-11-09). The new files may start now.
- Repo: `smart-scheduler-back` (SB), `dong`. Re-read shared files on disk first.
- **Base:** paste your own `bun test` (dummy URL) + pinned tsc. The suite has carried other seats' in-flight fails today; name them.
- Files (closed list):
  - new `src/lib/camp-confirm.ts` + test;
  - `src/routes/camp.ts`: one `.post("/packages/:id/confirm", …)`;
  - `src/lib/route-access.ts`: one entry, `"POST /camp/packages/:id/confirm": act(["menu:camp"], "action:camp.sell")`;
  - the camp package list's mapper/service (`camp.service.ts` `listPackages`, or its mapper): add `confirmedOn` only;
  - the rbac mirror test, if the RBAC enumeration needs the new route (as TASK-875; say so).
  - Reuse `writeRevenueLine` (TASK-864) and the payment-row writer (TASK-875); don't copy them.
- Git writes: none.

## What to do (SPEC-099 §11 exact)
- **One transaction:**
  - fee = the net posted sale (`camp-sale:<id>` + `discount:<id>`; none → 409 `NO_FEE`);
  - the revenue line `rl:camp:<packageId>`: `type COURSE`, category "Balance Camp", `occurred_on` = today (Bangkok), method, `ref_type CAMP`;
  - the payment row 1: `ref_type CAMP`, `paid_on = receivedOn`, the net, the method;
  - an already-existing line → 409 `ALREADY_CONFIRMED`, and nothing written.
- **Response:** `200 { packageId, confirmedOn, amountMinor, method }`.
- **The list:** `GET /api/camp/packages` items gain `confirmedOn` (`YYYY-MM-DD` or null).
- **Tests (DB-free):**
  - the line and payment fields;
  - today vs `receivedOn` (two different dates);
  - `NO_FEE`; `ALREADY_CONFIRMED`;
  - `confirmedOn` in the list;
  - the route-access entry is mapped.

## Definition of Done
- [ ] Suite (dummy URL): no new fails over your pasted base. Pinned tsc: no new errors.
- [ ] `git diff -U0` on the shared files: only the named hunks.
- [ ] **sid proof, rolled back** (host first; a C-TEST camp package id, real service): one confirm → one line + one payment row, `occurred_on` today, `paid_on` = the given date; a second confirm → 409; residue 0.

## Implementation Notes

## Questions

## Review

**Claim GRANTED (Porter, 2026-11-09; board line written). Start everything now.**
- **The list mapper is `toPackageDTO` in `src/services/camp.service.ts`** (`listPackages`, `:375–379`). It's not one of Bob's TASK-889 files (`schema.ts`, `scheduler.service.ts`, `rental.service.ts`), so there's no wait.
- **Don't touch Bob's files.** If you find you need one, stop and ask me.

---
## Report — Brew (Team C), 2026-11-09. TASK-900 built (new files first, then the shared hunks after your claim); for Sector's review. No migration, no git, no LINE.
**Base (pasted as asked):** SB `bun test` (dummy URL) at my start: `5685 pass · 2 fail · 384 files`; the 2 fails were `TASK-266 … it refuses TONIGHT'S batch` (the migration-journal tests; another seat's in-flight migration, not mine). Pinned tsc 5.9.2 → exit 0. Host of SB's `.env` = `154.197.124.206` (sid), checked before the one DB run.
**After:** `5754 pass · 0 fail · 386 files`; tsc exit 0. The tree carries many other seats' uncommitted changes (63 entries at my start), and the failing set moved during the day; at my last run it is empty.

**Files.**
- **New:** `src/lib/camp-confirm.ts` + `src/lib/camp-confirm.test.ts`.
- **Shared, the claim's hunks only** (`git diff -U0` headers): `src/routes/camp.ts` `@@ -10,0 +11,8` (imports + the body schema) and `@@ -34,0 +43,2` (the ONE `.post("/packages/:id/confirm")`) · `src/lib/route-access.ts` `@@ -230,0 +235` (the ONE entry) · `src/services/camp.service.ts` `@@ -15 +16` (import), `@@ -357` (`toPackageDTO` signature), `@@ -364,0 +366,3` (the field), `@@ -379 +383,2` (`listPackages`: one lookup, passed in). (`route-access.ts` `@@ -164,0 +165,4` in the same diff is TASK-875's still-uncommitted payments entries, not this TASK.)
- **My own earlier files, small extensions the TASK told me to reuse rather than copy** (outside the closed list, said here): `src/lib/payment-record.ts` (`SaleRefType = COURSE|VOUCHER|CAMP` for the key helpers and `createSalePayment`, which also takes an optional `method`; the API's own `PAYMENT_REF_TYPES` is unchanged, so `/api/payments` still takes only COURSE|VOUCHER) · `src/lib/booking-sale-amount.ts` (`RevenueLineInput.refType` + `'CAMP'`, optional `method`) · `src/lib/revenue-line.ts` (`line.method` wins over payment row 1's).
- **Three mirror test edits (needs your OK; the suite was red without each, tagged `🔻 TASK-900`):** `src/lib/camp-req095-3a.test.ts` (the camp access table is 13 rows, +1 assertion for the new entry) · `src/services/camp-scan-allow-list-task502.test.ts` (its by-value admin package DTO now has `confirmedOn: null`, plus a `db.select` stub because `listPackages` makes one ledger query) · `src/services/checkin-source-visibility-req108.test.ts` (the same `db.select` stub). The rbac enumeration test needed NO edit (it already reads `camp.ts` with the `/camp` prefix).

**What it does (SPEC-099 §11 exact).**
- **`POST /api/camp/packages/:id/confirm`**, body `{ receivedOn: YYYY-MM-DD (a real date), method: TRANSFER|CASH|CARD }` → `200 { packageId, confirmedOn, amountMinor, method }`. Route-access: `act(["menu:camp"], "action:camp.sell")`, the same right as selling a camp (no new key).
- **ONE transaction**, after an advisory lock on the package (two confirms at once): the package exists (404) → the line `rl:camp:<id>` must not exist (**409 `ALREADY_CONFIRMED`**, nothing written) → the fee = the net posted sale `camp-sale:<id>` + `discount:<id>` (**409 `NO_FEE`** when there is none, or the net is zero) → **the revenue line** through the existing `writeRevenueLine`: `type COURSE`, category "Balance Camp", `amount` = the net, **`occurred_on` = today (Bangkok)**, the chosen `method`, `source BOOKING`, `ref_type CAMP`, branch BRAVO → **the payment row 1** through the existing `createSalePayment`: `ref_type CAMP`, `n 1`, **`paid_on = receivedOn`**, the net, the method.
- Both writers log and return `ok:false` instead of throwing, so this file turns a failure of either into a throw INSIDE the transaction: **the line and the payment roll back together** (tested for each failing alone). A lost race on the line's unique key is a 409, not a half-confirm.
- **The list:** `GET /api/camp/packages` items gain `confirmedOn` (`YYYY-MM-DD` = the line's `occurred_on`, or `null`), from ONE query for the whole list. **The single-package answers (the sale, redeem, the scans) carry no `confirmedOn` at all** rather than a false `null`; a source test pins that `packageDTO` is untouched.
- A confirm sends no LINE message (a test pins that the file has no notify/outbox).

**Evidence (dummy URL; pinned tsc 5.9.2).**
- **Tests: 40 new** in `camp-confirm.test.ts` (DB-free; the real writers run on a recording fake): the line's fields (key, type, category, product name, net, today, method, source, ref, branch) and the payment's (`CAMP`, n 1, `paid_on`, net, method, actor null); **today vs `receivedOn` as two different dates** (2026-11-09 vs 2026-11-03 / 2026-10-28); each method reaching BOTH rows (the line does not fall back to TRANSFER); `NO_FEE` (none, net zero, a discount alone); `ALREADY_CONFIRMED` (the line exists: before the fee is even read; and the lost race: rolled back, no payment); unknown package → 404 before any lock or write; 5 bad inputs → 400 before the database is touched; the lock first and for THIS package; a payment failure or a line failure rolls back the outer transaction; one begin / one commit at the top level; a payment row that already exists is not an error; `confirmedOnByPackage` (empty list asks nothing, one query, the right keys, another package's line never confirms); the route-access entry; the route's 400s; **the route end to end DB-free (200 with the 4 keys, then 409 `ALREADY_CONFIRMED`)**; the real `listPackages`: a confirmed package carries its date, an unconfirmed one `null`, one ledger query, the other DTO fields untouched.
- **Mutation sets: 49 mutants, 48 killed + 1 equivalent.** Set 1 (new file + the three extensions, 35): the category, each guard, the lock and its key, the fee kind, every field of the line and the payment (type, amount, source, ref, date, method), the two throws, the result's date, the name rule, the list lookup. The one survivor, `fee === null || fee <= 0` → `fee <= 0`, is **equivalent** in JavaScript (`null <= 0` is true). Set 2 (the shared hunks, 14, all killed): the entry's act / menu / presence, the route's validator, schema and status, the DTO field rule, the list's lookup (a per-package N+1 is also killed). A first run left one survivor (the route's 200 vs 201, never exercised) which the end-to-end route test now kills. Files restored byte for byte (hash check; `camp.ts`, `camp.service.ts` and `route-access.ts` are CRLF files, edited and restored with their own line endings).
- **sid proof, ONE rolled-back transaction, host first, the real `confirmCamp` / `confirmedOnByPackage`, `public` only READ, no LINE** (`camp-confirm-sid-proof.ts` in my scratchpad): I used a REAL camp package that was not confirmed and has a real posted sale (net 390,000 satang); everything below is rolled back.
  - confirm with `receivedOn 2099-03-01`, CARD → `confirmedOn` = today **2026-11-09**, amount 390,000, CARD;
  - **one revenue line**: `occurred_on 2026-11-09 · COURSE · BRAVO · CARD · BOOKING · ref CAMP · 390000 · key rl:camp:<id> · category Balance Camp`;
  - **one payment row**: `n 1 · paid_on 2099-03-01 · 390000 · CARD · ref_type CAMP`;
  - `confirmedOnByPackage` → the date for the package, absent for an unknown id;
  - a second confirm → **409 `ALREADY_CONFIRMED`**, and the counts stay 1 line and 1 payment; an unknown package → 404;
  - **after the rollback: CAMP lines 0 (before 0), CAMP payments 0 (before 0), movements 552 (before 552), C-TEST items 0 — residue 0.** (The SB route itself and the front end were not driven against sid; the route is covered by the DB-free end-to-end test.)

**Declared decisions (mine).**
1. A net of zero (a fully discounted camp) is `NO_FEE` (a line must be > 0), not a separate error.
2. `confirmedOn` is on the LIST only (as the TASK says); the single-package answers omit the key.
3. A payment row 1 that already exists is not an error (the confirm still completes); the revenue line's key is the "confirmed" marker.
4. The line is written with branch BRAVO (a camp has no branch column; F1 does not cover camps here), as SPEC §11 says.

## Questions (for Sector)
1. **The three mirror test edits and the three extensions to my own earlier files** (above): OK to keep?
2. **Deploy order:** TASK-875's payment hunks, TASK-889 half 1 and this are all uncommitted in the same SB tree. Nothing here depends on a migration (`bo.payment` and `bo.revenue_line` are on sid), so there is no ordering constraint; I only note that the SF button (TASK-901) needs this route live first.

## Review (Sector, 2026-11-09): ✅ DONE
- **Re-run by me** (SAFE dummy URL, the whole shared SB tree incl. Bob's 889 half 2): **5754 pass · 0 fail**. Pinned tsc 5.9.2: exit 0.
- **Shared hunks** (`git diff -U0`): `camp.ts` has the import, the body schema and ONE `.post("/packages/:id/confirm")`. `route-access.ts` has ONE entry, `act(["menu:camp"], "action:camp.sell")`. Both match SPEC-099 §11.
- **Logic:**
  - one transaction plus an advisory lock;
  - 404 → `ALREADY_CONFIRMED` before the fee is read → `NO_FEE` (none / zero);
  - the line goes through `writeRevenueLine`, with `occurred_on` = today (Bangkok);
  - payment row 1 goes through `createSalePayment`, with `paid_on = receivedOn`;
  - either writer failing rolls back both;
  - no LINE.

  As designed. The 40 tests and the 48/49 mutants (the survivor is a genuine equivalent: `null <= 0`) back it.
- **The sid proof** ran in one rolled-back transaction on a real unconfirmed camp, with the host checked first: one line, one payment, the two dates different, a second confirm → 409, residue 0. Accepted.
- **Q1: keep all six.**
  - The three mirror test edits are the usual pins (the access table count, the DTO value, a `db.select` stub).
  - The three extensions are to your own earlier files and stay additive: `SaleRefType` adds CAMP, and `/api/payments` still takes only COURSE|VOUCHER.
  - An optional `method`; `line.method` wins when it's given.
- **Your declared decisions 1–4: accepted** (zero net = `NO_FEE`; `confirmedOn` on the list only; an existing payment row 1 is not an error; camp line BRAVO per §11).
- **Q2:** there's no ordering constraint on SB. TASK-900 rides in the single SB+SF deploy, and Fanta's TASK-901 needs it live before her real run (Tanya's).
- Security review:
  - the route is behind `requireAuth` + route-access (`action:camp.sell`, an existing key);
  - the body is zod-validated (a real date, a closed method enum);
  - the id is a path param used in parameterised queries;
  - no personal data in the response, no secrets.

  **None.**
