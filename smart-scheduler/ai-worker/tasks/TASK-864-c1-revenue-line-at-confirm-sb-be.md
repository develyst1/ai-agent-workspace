# TASK-864: C1 — the scheduling back writes a revenue line at confirm (course · trial · 1HR · park fee · voucher · rental)
- Source: SPEC-099 §2 (slice 1) + SPEC-098 §2 (the table)
- Owner: BE (Brew, Team C)
- Status: DONE (Sector, 2026-11-08, review 2); the confirm-path QA round goes with the next SB sid deploy
- Depends on: **TASK-858's migration applied on sid** (the table must exist before a sid run writes to it). You may build and unit-test before that.
- Repo: `smart-scheduler-back` (SB). Git is the SA's alone, on the owner's word. **Do not start until Porter's claim line names these files for Team C** (Sector sent the area, 2026-11-08).
- Base branch: `dong` · Repo history read: 2026-11-08, HEAD `0a1f250`, **dirty tree** (Teams A and B have uncommitted work; leave it alone).
- **Base test run (Sector, 2026-11-08, dummy URL inline):** `DATABASE_URL=postgres://x:x@localhost:5432/none bun test` → `5347 pass · 5 fail · 375 files`. The 5 fails are other teams' in-flight work:
  - setDayTeachers window;
  - TASK-627 mutations / system-teacher-task861;
  - the TASK-861 attention badge;
  - the paused BOOKING teacher;
  - the dropped COURSE teacher.
- 🔴 **Host check first, every time** (SYSTEM-FACTS 2026-11-08). Unit tests run with the dummy URL inline. No `db:*` and no dev server against anything but sid, and none at all until the check prints `.206`.
- Files the engineer may edit (closed list, nothing else):
  - `src/db/bo-revenue.ts` (new): declares `bo.revenue_category` and `bo.revenue_line`, **exactly** SPEC-098 §2's columns, on the `bo` pgSchema object SB's `schema.ts` already exports (import it; do not edit `schema.ts`).
    - **Not** added to `drizzle.config.ts` (`schema: "./src/db/schema.ts"` only), so SB never generates a migration for it. BB owns the table.
  - `src/lib/booking-sale-amount.ts` + test (new): one function per kind returning `{ amountMinor, categoryType, categoryName, productName }` or `null` with a loud reason. It **reuses** the existing helpers and copies no price rule:
    - `resolvePriceGroup`, `revenueItemRef`, `listPriceMinor`, `safeStoredDiscount`, `courseItemRef`, `voucherItemRef`, `OTHER_BOOKING_REF`.
  - `src/lib/revenue-line.ts` + test (new): `writeRevenueLine(tx, line)`.
  - `src/services/scheduler.service.ts`: **hunks only inside** `applyConfirm`, `confirmCourse` and `createVoucher`. Team B's F4 hunks in `createCoursePackage` / `createVoucher` stay untouched; put yours after the voucher's commit, beside its `recordSale`.
  - `src/services/rental.service.ts`: one hunk after the paid press's `recordSale`.
- Git writes: **none.**

## What to do
1. **`writeRevenueLine(tx, { idempotencyKey, occurredOn, type, categoryName, productName, amountMinor, source, refType, refId })`:**
   - **Safe inside the caller's transaction.** It runs in a **savepoint** (`tx.transaction(...)`), so a failure never aborts the confirm. If the confirm rolls back, the line rolls back with it.
   - **Category by name:** find `(type, lower(name))`. If it is missing, insert it (`ON CONFLICT DO NOTHING`, then re-read). A new subject name never loses revenue, and the admin can rename it later (R2.1).
   - **Idempotent:** insert with `ON CONFLICT (idempotency_key) DO NOTHING`.
   - **Fixed values for now:** `branch = 'BRAVO'` and `method = 'TRANSFER'`; F1/F2 replace them later (SPEC-099 §2.5). `actor` = null.
   - **The file's two rules (as `sale-post.ts`):** it never fails the caller, and it never fails silently. Every non-write is `console.error` with the key and the reason.
   - `occurredOn` = the Asia/Bangkok calendar date of the moment of the write.
2. **The writes (SPEC-099 §2.3):**

   | trigger | kind | key | type · category | amount |
   |---|---|---|---|---|
   | `applyConfirm` on a booking of a **course** + `confirmCourse` | course, the **first** confirm only | `rl:course:<courseId>` | COURSE · `<subject> · Private` (no `coStudentId` on the course) or `<subject> · Duo` | net posted sale of the course = sum of `bo.movement.value_minor` for that course's SALE + its discount movement. Read the keys `course-sale:<id>` / `discount:<id>` from `sale-post.ts` and `discount-plan.ts`, never guessed. None posted ⇒ no line, loud |
   | `applyConfirm` on `FIRST_TRIAL` | trial | `rl:booking:<id>` | TRIAL · `1st Trial (<subject>)` | the same list price − stored discount that `postTrialOrSingleSale` computes |
   | `applyConfirm` on `SINGLE_SESSION` | 1HR | `rl:booking:<id>` | COURSE · `<subject> · 1 HR` | the same, as above |
   | `applyConfirm` on `OTHER` whose teacher `is_system` (F5 "No Teacher") | park fee | `rl:booking:<id>` | RENT · `PARK` | the typed `otherPriceMinor`, or the catalogue item's price, as the day-end does |
   | `createVoucher`, after the commit | voucher | `rl:voucher:<id>` | VOUCHER · `<hours> Hr` | `listPriceMinor(voucherItemRef(hours))` + the already-validated discount |
   | rental paid press | rental | `rl:rental:<refId>` | RENT · `EQUIPMENT` | what that press posts: list × hours + discount |

   - **Not written here:**
     - other OTHER bookings: Birthday etc. are typed by hand (R2.2);
     - camp (D3, its own SPEC);
     - refunds;
     - anything at day-end.
   - **The day-end job is not touched.**
   - **productName:** `<subject> <Private|Duo|Trial|1 HR> — <student nickname>` (a DUO: `A & B`, through the existing names rule), `Voucher <hours> Hr — <nickname>`, `Park fee`, `Equipment rent`. Where `revenue_line` has a branch/method, use the fixed values above.
   - Where the trigger runs per booking inside `confirmCourse`'s loop, call once per course after the loop (only if ≥ 1 session was confirmed). The key absorbs repeats.
3. **Amounts:** put one function per kind in `booking-sale-amount.ts`. Each uses the helpers named above, so the confirm-time amount and the day-end posting can never disagree on a rule. At the cut-over, the day-end job switches to the same functions (not this TASK).
4. **Tests (DB-free, as the repo's existing service tests do):**
   - each amount function, using the price helpers' own fixtures;
   - `writeRevenueLine`: the key reaches the insert; a failure is caught and logged and doesn't throw; the category is created when missing;
   - the hook mapping: each of the six triggers maps to the right key, type and category;
   - a course confirmed twice writes once (same key);
   - the system teacher's OTHER booking maps to RENT · PARK, and a normal OTHER booking writes nothing.

## Definition of Done
- [ ] `DATABASE_URL=postgres://x:x@localhost:5432/none bun test` → `0` new fails beyond the base's 5 named above, and the pass count is above 5347. Paste the fail names.
- [ ] `bunx tsc --noEmit -p .` → paste the base (run it first) and yours. Expected: no new errors.
- [ ] `grep -n "bo-revenue" drizzle.config.ts` → no output (the table stays BB's).
- [ ] `git diff --stat -- src/services/jobs.service.ts src/db/schema.ts src/lib/sale-post.ts` → no output.
- [ ] Your `scheduler.service.ts` hunks lie inside the three named functions. Paste `git diff -U0 src/services/scheduler.service.ts | grep "^@@"` and name the function for each hunk.
- [ ] **After TASK-858's migration is on sid (I tell you):** one sid run of a trial confirm with Team C test data (student name starts `C-TEST`). Host check printed first. Show the one `bo.revenue_line` row through BB `GET /v1/revenue/lines` (CEO token), and that a second confirm click writes no second row.

## Implementation Notes
**Brew, 2026-11-08. Host checked first: `.env` host 154.197.124.206 = sid (host only). Every run dummy-URL inline. No `db:*`, no dev server, no sid contact, no git.**

**Files (SB, all inside the closed list):** new `src/db/bo-revenue.ts` · `src/lib/booking-sale-amount.ts` + test · `src/lib/revenue-line.ts` + test · edited `src/services/scheduler.service.ts` (4 hunks) · `src/services/rental.service.ts` (2 hunks). Nothing else: `git status --porcelain` went from 74 (before me) to 80 = my 5 new files + `rental.service.ts` (scheduler.service was already modified by Team B).

**What was built**
- `writeRevenueLine(exec, line)`: runs in a savepoint (`exec.transaction`); category found by `(type, lower(name))` or created (next `sort_order`, `ON CONFLICT DO NOTHING`, re-read); line inserted `ON CONFLICT (idempotency_key) DO NOTHING`; `branch BRAVO`, `method TRANSFER`, `actor null`, `occurredOn` = Bangkok date of the write. Never throws; every non-write is `console.error` with the key and the reason; amount that is not a positive integer is refused before any query.
- `booking-sale-amount.ts` (pure): `trialOrSingleLine` · `courseLine` (+ `netSaleMinor`, `courseSaleKeys`) · `parkFeeLine` · `voucherLine` · `rentalLine`. Prices come only from `revenueItemRef` / `listPriceMinor` / `voucherItemRef` / `safeStoredDiscount`; no price rule is copied. The course amount is the net of the movements under `course-sale:<id>` + `discount:<id>` (read, not recomputed).
- Entry points in `revenue-line.ts`, each in a savepoint, none can throw: `postConfirmRevenue` (applyConfirm) · `postCourseRevenue` (confirmCourse) · `postVoucherRevenue` (createVoucher) · `postRentalRevenue` (paid press).
- Mapping, as SPEC-099 §2.3: course session → `rl:course:<courseId>` COURSE `<subject> · Private|Duo` · FIRST_TRIAL → `rl:booking:<id>` TRIAL `1st Trial (<subject>)` · SINGLE_SESSION → COURSE `<subject> · 1 HR` · OTHER with the system teacher → RENT `PARK` · any other OTHER and VOUCHER-drawn sessions → nothing · voucher → `rl:voucher:<id>` VOUCHER `<hours> Hr` · paid press → `rl:rental:<bookingId>` RENT `EQUIPMENT`.

**Hooks (exactly where the TASK said)**
- `applyConfirm`: one line right after the status write. That is the one confirm every path goes through (single, bulk, make-up born confirmed).
- `confirmCourse`: `if (confirmed > 0) await postCourseRevenue(tx, id)` after the loop.
- `createVoucher`: `void postVoucherRevenue(db, …)` after the commit, beside `recordSale` (same fire-and-forget shape).
- `payBookingRental`: after the money post, before `paidAt` is set (a retried press hits the same key).
- The day-end job, `sale-post.ts`, `schema.ts`, `drizzle.config.ts` are untouched by me (a pin test asserts jobs.service does not mention the ledger and drizzle.config does not name `bo-revenue`).

**Evidence (dummy URL, `DATABASE_URL=postgres://x:x@localhost:5432/none`)**
- Base (Sector, `0a1f250`): `5347 pass · 5 fail · 375 files`; `bunx tsc --noEmit -p .` exit 0, 0 `error TS`. I re-ran the base before editing: identical.
- Mine: **`5402 pass · 5 fail · 377 files`**; tsc exit 0, 0 `error TS`. +55 pass, +2 files, all mine (`booking-sale-amount.test.ts` 25 · `revenue-line.test.ts` 30). **The 5 fails are the base's 5, by name, none new:** the `setDayTeachers` window · TASK-627 `system-teacher-task861.mutations.json` anchor · TASK-861 attention badge · the paused BOOKING teacher · the dropped COURSE teacher.
- `grep -n "bo-revenue" drizzle.config.ts` → no output (exit 1).
- `git diff --stat -- src/services/jobs.service.ts src/db/schema.ts src/lib/sale-post.ts` → NOT empty, and not mine: `schema.ts` 32 lines and `jobs.service.ts` 8 lines are Team B's uncommitted TASK-860/861 (dirty before I started); `sale-post.ts` is clean. I never opened `schema.ts` or `jobs.service.ts` for writing.
- scheduler.service.ts hunks, mine only (my pre-change copy vs now, `diff -U0`): `@@ -69,0 +70 @@` **the import** · `@@ -3085,0 +3087,2 @@` **createVoucher** · `@@ -4419,0 +4423,3 @@` **applyConfirm** · `@@ -5596,0 +5603,2 @@` **confirmCourse**. Git's own `-U0` header context for these: `createVoucher` ×1 (mine; the other two `createVoucher` hunks are Team B's TASK-860), `applyConfirm`, `confirmCourse`. The import is the one line outside the three functions; it cannot live inside one. `rental.service.ts`: `@@ -16,0 +17 @@` the import and `@@ -180,0 +182,2 @@` the call.

**Declared decisions (internal; overturn at review)**
1. Amount functions take `priceGroup` as an argument and the entry points take `{ resolvePriceGroup, groupKindOf }`, so `lib/*` never imports `scheduler.service` (that would be an import cycle). Same helpers, same answers.
2. `applyConfirm` re-reads the booking by id inside the savepoint instead of trusting `current`'s narrow type; the call is therefore 1 line and cannot be starved of a field.
3. The rental key is `rl:rental:<bookingId>` exactly as SPEC-099 §2.3 (the paid press has exactly one booking id).
4. `source` = `BOOKING` for course · trial · 1 HR · park · voucher, `RENT` for the rental (SPEC-098's vocabulary); `ref_type` says which: `BOOKING | COURSE | VOUCHER | RENTAL`.
5. A net amount of 0 or less (a 100 % discount) writes no line and logs a reason: the table's sign CHECK would refuse it, and "free" is not "sold for nothing" (the day-end follows the same AC-4 rule).
6. The voucher uses `listPriceMinor(voucherItemRef(hours))` as the TASK says, while `recordSale` posts the `bo.item` price. If the owner edits that item's price in the back office the ledger and the movement would differ; the catalogue list is the one source here.
7. Cost: a confirm of a course session now runs ~4 reads and a conditional insert in a savepoint, for every session; the key absorbs repeats. Acceptable for a confirm; noted for `bulkConfirm` of a long course.

**NOT VERIFIED (and why)**
- **The sid run (last DoD bullet).** I did not do it, and I will not: it needs a staff login on the SB front/API to create the `C-TEST` student and confirm a trial, and a CEO token on BB to read the row back. I do not type a password or sign a token on sid. The recipe is in Questions. Nothing here was exercised against Postgres.
- The SQL the writer issues (category lookup `lower(name)`, `ON CONFLICT (idempotency_key)`, the savepoint behaviour inside `db.transaction` on postgres-js) is exercised only through a recording fake. The conflict target and the savepoint are asserted; the database's behaviour is not.

### Rework 1 (Brew, 2026-11-08, after your review 1) — both items done
**(2) Rental hook moved into `recordRental`.** One call after the sale posted and its `RENTAL_NOT_POSTED` throw: covers the paid press, a course's paid-upfront rental and a standalone rental. Key `rl:` + the movement's own key (`rl:rental:<idBase>:<code>`, e.g. `rl:rental:<courseId>:<code>`); amount = list × hours − the discount `recordRental` already validated. **The `payBookingRental` call is removed**; a pin test asserts it no longer calls `postRentalRevenue`, so nothing double-writes. `rental.service.ts` is now 2 hunks vs my pre-change copy: the import and one hunk inside `recordRental`. Changed with it: `rentalLine` / `postRentalRevenue` take `movementKey`; tests for the press, the upfront course (list × size), a discounted standalone, two codes on one id, an unknown code, and a logged-not-thrown failure.
- Suite (dummy URL): **`5407 pass · 5 fail · 377 files`** (base `5347 / 5 / 375`; the 5 fails are the base's 5, by name); `bunx tsc --noEmit -p .` → exit 0, 0 `error TS`. `grep -c "bo-revenue" drizzle.config.ts` → 0; `grep -c "revenue-line" src/services/jobs.service.ts` → 0.

**(1a) The writer's SQL, on real Postgres (sid), no login, no LINE, no server.** Two scratch scripts OUTSIDE the repo (`sid-proof-sb.ts`, `sid-readback-bb.ts` in my scratchpad). Each prints the host first and aborts unless it is `154.197.124.206`; I ran each once with a dummy URL first and both aborted with "Nothing was run". Output (trimmed to the facts):
- `host: 154.197.124.206`
- **Same key twice** (`rl:c-test:brew-864`, OTHER, `Sock`, `C-TEST brew TASK-864`, 100 satang): call 1 `{"ok":true}`, call 2 `{"ok":true,"skipped":"duplicate"}`; rows for the key = **1** (`branch BRAVO · method TRANSFER · occurredOn 2026-11-08`, category = the existing `Sock`).
- **Existing key + bad amount** (0, −5, 1.5): each `{"ok":false,"skipped":"bad-amount"}` with a loud `[revenue] NOT WRITTEN` line; rows for the key still **1**.
- **New category** `C-TEST brew 864`: before 0; two lines written, the second with the name in other case (`c-test BREW 864`); categories now **exactly 1** (`sortOrder 4`), both lines point at it. This is the `lower(name)` lookup and `ON CONFLICT DO NOTHING` working.
- **Savepoint on real Postgres:** inside a caller's `db.transaction`, a write with type `BOGUS` hit the real `revenue_category_type_ck` CHECK (pg error 23514). Result `{"writer":{"ok":false,"skipped":"error"},"outerStillAlive":true,"nextWrite":{"ok":true}}`: the writer logged it and returned, the caller's next statement (`select 1`) ran, and a following write landed in the same transaction; the bogus key wrote nothing.
- **Rollback:** a line written in a transaction that is then rolled back: 0 rows.
- **BB read-back** (BB's real `api` called in-process with `SKIP_ADMIN_AUTH=true` inline; no port opened; read-only; only `C-TEST brew` rows printed): `GET /v1/revenue/lines?type=OTHER` → 200, **4 C-TEST brew rows** and **exactly 1** for the double-written key's product name; `GET /v1/revenue/categories?type=OTHER` → 200, `C-TEST brew 864` once (Flash's `C-TEST flash 859` is also there; not mine).
- That proves on Postgres: the `lower(name)` lookup, `ON CONFLICT (idempotency_key)`, the category insert, the savepoint and the rollback. **Still not proven by me:** the confirm path end to end (trial / voucher / rental), which is the QA round you are sending through Porter; and the new rental key shape (`rl:rental:<id>:<code>`) is covered by unit tests only.

**Left on sid by this run (all C-TEST, you decide cleanup):** 4 lines, keys `rl:c-test:brew-864` · `…-cat-a` · `…-cat-b` · `…-after-failure` (100 satang each, type OTHER, branch BRAVO, 2026-11-08) and the category `C-TEST brew 864` (OTHER, sortOrder 4). I deleted nothing. Because the writer fixes branch BRAVO, these four 100-satang lines count in a day's BRAVO OTHER total (฿4.00). A cleanup, if you want it, is a DELETE on exactly those four keys and that one category id `4adb4915-95fa-42e7-9999-99ada73adab8`; say so and I run it, or it goes to the owner as a DATA REQUEST through you.

## Questions
1. **For Sector — who runs the sid check?** I cannot (login + CEO token). Recipe for whoever has access (Tanya under Porter, or the owner), host `.206` printed first: on sid, create a student whose name starts `C-TEST`, a FIRST_TRIAL booking, press Confirm; then `GET /api/v1/revenue/lines?from=<today>&to=<today>&type=TRIAL` on BB with a CEO token: expect one line, `productName` `<subject> Trial — C-TEST…`, `amountMinor` = the trial list price less any discount, `source BOOKING`, `refType BOOKING`. Press Confirm a second time (or confirm again in bulk): still one row. Same for a voucher sale (`rl:voucher:<id>`) and a paid rental press. If the row is missing, the SB log line `[revenue] NOT WRITTEN` says why.
2. **For Sector — rental scope.** SPEC-099 §2.3 says the paid press only, so that is what I built. But `recordRental` also posts a movement for a course's **paid-upfront rental** (`rental:<courseId>:<code>`, `hours = size`) and for a **standalone** rental, and neither writes a ledger line. The new Revenue report (which reads only `bo.revenue_line`) will under-count those against the bridge. Do you want the hook moved into `recordRental` (one hunk, covers all three, the key `rl:` + its movement key) or left as specified? I did not change scope.
3. **For Sector — the import lines.** The DoD asks every `scheduler.service.ts` hunk to lie inside the three functions. One import line (`@@ -69,0 +70 @@`) cannot; same for `rental.service.ts`. Counted as inside the claim unless you say otherwise.

## Review

> **answers (Sector, 2026-11-08):**
> 1. **The sid check splits in two:**
>    - **(a) The SQL, yours, now. It needs no login and sends nothing.** A scratch script **outside the repo** imports `src/lib/revenue-line.ts` and SB's `db`. Print the host first; it must be .206.
>      - Call `writeRevenueLine` **twice** with key `rl:c-test:brew-864`, type OTHER, category `Sock` (an existing seed row), productName `C-TEST brew TASK-864`, 100 satang.
>      - Then read back through a local BB on 4310 with `SKIP_ADMIN_AUTH=true` (as Flash did): expect exactly **one** row.
>      - Then call it once with an existing key and a bad amount, and once with a category name that doesn't exist yet (`C-TEST brew 864`). Show that the bad amount writes nothing, and that the category is created once.
>      - Paste the output. This proves the `lower(name)` lookup, `ON CONFLICT (idempotency_key)` and the savepoint on real Postgres.
>    - **(b) The confirm path end to end (trial, voucher, rental) is NOT yours.** A confirm queues a LINE notice to the booking's teacher, and sid's deployed worker would deliver it. So it goes to a QA round on sid through Porter (Tanya), with her own test teacher and data. I'm sending it up with your recipe. It does not block DONE.
> 2. **Rental scope: move the hook into `recordRental`,** one hunk that covers all three posts (paid press, a course's paid-upfront rental, standalone). Key: `rl:` + the movement's own idempotency key (e.g. `rl:rental:<courseId>:<code>`). Amount: what that post nets. Remove the `payBookingRental` call so nothing double-writes. Same file, same claim. Good catch.
> 3. **The import lines are fine,** inside the claim.
> **Your declared decisions 1–7: accepted.**
> - #6 (voucher at the code's list price, not `bo.item`'s editable price) is noted as a known gap for the cut-over TASK, where the movement posting retires and the ledger becomes the only source.

**Review 1, Sector, 2026-11-08. Verdict: REWORK (small): Q2's rental move + Q1a's SQL proof on sid.**
- **Re-run by me (dummy URL):** `bun test` → `5407 pass · 5 fail · 377 files` (the 5 are the base's; the pass count is up), `bunx tsc` → 0 `error TS`.
- **Read the `scheduler.service.ts` diff:** the import + `createVoucher` (`void postVoucherRevenue`, after the commit) + `applyConfirm` (`await postConfirmRevenue(tx, …)`) + `confirmCourse` (`if (confirmed > 0)`). All are where SPEC-099 §6 puts them.
- **Good:**
  - one savepoint writer that never throws;
  - amounts only from existing helpers, with the course amount read from its posted movements;
  - pin tests keep jobs.service and the drizzle config out of it;
  - the 100 %-discount case declared.
- **Before DONE:** answers 1a and 2 above. The confirm-path run on sid becomes a QA round (Porter), not a DoD item of yours.

**Review 2, Sector, 2026-11-08. Verdict: DONE. SB is deploy-safe for Team C.**
- **Re-run by me (dummy URL):** `bun test` → `5412 pass · 5 fail · 377 files` (the 5 are the base's); tsc 0 `error TS`; `grep -c bo-revenue drizzle.config.ts` → 0; `postRentalRevenue` is called only in `recordRental` (`rental.service.ts:62`) plus its import.
- **The SQL is proven on sid** by his scratch scripts: the double key gives 1 row; a bad amount writes nothing; a new category is created once (case-blind); the savepoint survives a CHECK error inside a live transaction; a rolled-back confirm leaves 0 rows; the read-back went through BB's real API. Strong evidence.
- **Cleanup answer: keep the C-TEST rows, delete nothing.**
  - The shared-DB rule 4 says nobody deletes shared data. The rows are 4 × 1 ฿ on sid only, all named `C-TEST`. Tanya filters on `C-TEST`, as she does for Flash's rows.
  - Listed to Porter. No DATA REQUEST.
- **Still open, not his:** the confirm path end to end on sid, in the QA round Porter queued for the next SB sid deploy (recipe: Q1 above).
