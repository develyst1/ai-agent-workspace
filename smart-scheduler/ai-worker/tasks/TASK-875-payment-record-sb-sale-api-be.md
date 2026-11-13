# TASK-875: F2 payment record: auto row at course and voucher sale + front-office API (SB)
- Source: SPEC-099 §8 (decisions 3, 4, 5)
- Owner: BE (Brew, Team C) · Status: DONE (Sector, 2026-11-09, review 2) · **Depends on: TASK-874's migration applied · verified on sid** (Sector rings you). You may build and unit-test before that.
- Repo: `smart-scheduler-back` (SB), `dong`, dirty tree. **Edit nothing until Porter's claim line names these files and functions for Team C** (requested 2026-11-08; `createCoursePackage` was Team B's for F4, which is DONE).
- **Base (Sector, 2026-11-08, dummy URL):** `bun test` → `5401 pass · 11 fail · 377 files`. The 11 fails are other teams' in-flight work; paste their names before you start, so "no new fails" can be checked by name. Plus `bunx tsc --noEmit -p .` (or the pinned form) → paste the base result.
- 🔴 Host check before anything that can connect.
- Files (closed list):
  - `src/db/bo-revenue.ts`: declare `bo.payment` (mirror only; not in drizzle config);
  - `src/lib/payment-record.ts` + test (new): `createSalePayment(...)`, `listPayments`, `patchPayment`, `addInstallment`, and the revenue-line follow (the same rule as TASK-874 §3, in one shared pure helper if you can, else a twin with a test that pins both to the same key format);
  - `src/lib/revenue-line.ts` (+ test): the writer reads row 1's method (`TRANSFER` when absent);
  - `src/routes/payments.ts` + test (new): `/api/payments`, the SPEC-099 §8.5 shapes;
  - `src/index.ts`: **one** `app.route` line mounting it, behind the JWT guard, beside the camp line;
  - `src/lib/route-access.ts`: **three** entries. `GET /payments` = `read(BOOKINGS)`; `POST` and `PATCH` = `act(BOOKINGS, "action:bookings.payment-edit")`. If a new action key needs registering in the permission registry (`permissions.ts` / seed), **stop and ask me**: that is a roles change, and roles aren't ours.
  - `src/services/scheduler.service.ts`: one hunk each in `createCoursePackage` and `createVoucher`, **after the commit, beside `recordSale`**: `void createSalePayment(...)`, best-effort and loud, with amount = the same net `recordSale` posts.
- Git writes: none.

## What to do
1. **At sale:** row `n=1`, `paid_on` = the sale's Bangkok date, `amount_minor` = the net (list + discount, the number posted), `method = 'TRANSFER'`, `ON CONFLICT DO NOTHING`. It never fails the sale.
   - The sale validator is **not** changed. The SF sale flow sets a non-Transfer method with a PATCH right after the sale (TASK-876), so `validation.ts` stays untouched.
2. **API `/api/payments`:** GET, PATCH and POST exactly as SPEC-099 §8.5. PATCH of row 1's method also updates the revenue line in the same transaction (§8.4).
3. **Revenue line method:** `writeRevenueLine` takes the method from row 1 for COURSE and VOUCHER refs.
4. **Tests:** sale → one row; a replayed sale → still one row; method PATCH → line follows; installment → line unchanged; row 1 amount not editable (400); the route-access entries exist (an unmapped route fails closed, so a test proves the three are mapped).

## Definition of Done
- [ ] `bun test` (dummy URL) → the base's 11 fails by name and no new one; pass > 5401.
- [ ] tsc → no new errors over the base.
- [ ] `git diff -U0 src/services/scheduler.service.ts | grep "^@@"`: name the function for each of your hunks (only `createCoursePackage`, `createVoucher`).
- [ ] **On sid, after 874's migration:** a scratch script calls `createSalePayment` and the follow for a C-TEST ref (host first). Show row 1, then a method PATCH changing a C-TEST revenue line, then an installment not changing it. No real sale, no LINE.
- [ ] `git status --porcelain`: only the listed files.

## Implementation Notes

### Brew (Team C), 2026-11-08 — NEW files built; the three SHARED hunks are HELD (per Sector's inbox line)
Host of SB's `.env` = `154.197.124.206` (sid), checked; every run used the dummy URL; no git; pinned `typescript@5.9.2`.
**Done (SB, new or mine):**
- `src/db/bo-revenue.ts` (+`boPayment` mirror, not in drizzle config) · `src/lib/payment-record.ts` (+test, 35) · `src/routes/payments.ts` (+test, 36) · `src/lib/revenue-line.ts` (+test, 43 total).
- `payment-record.ts`: `createSalePayment(refType, refId, amountMinor, d?, paidOn?)` (row 1 = n 1 · the net · TRANSFER · Bangkok date · actor null · `ON CONFLICT (ref_type, ref_id, n) DO NOTHING` · never throws, loud `console.error`) · `listPayments` · `addInstallment` · `patchPayment` · the pure twins `feeKeys / feeFromMovements / revenueLineKeyFor / followsRevenueLine / installmentsFit / paymentTotals`. One advisory lock per sale (`payment:<type>:<id>`) in a transaction; `NO_FEE` 409; sum ≤ fee 400; lost race 23505 → 409 `CONFLICT`; **every row's amount editable (§8.9, supersedes this TASK's old "row 1 not editable")**; row 1's method PATCH moves `bo.revenue_line` (`rl:course|voucher:<id>`) in the same transaction; installments never do.
- `revenue-line.ts`: `writeRevenueLine` now reads payment row 1's method for COURSE / VOUCHER refs (TRANSFER when absent / odd value), **in a nested savepoint** so a missing `bo.payment` is logged and the line is still written as TRANSFER. BOOKING / RENTAL lines never read it.
- `routes/payments.ts`: `makePaymentRoutes(ops)` + `paymentRoutes` · GET `?refType&refId` → `{payments, feeMinor, paidMinor, remainingMinor}` · POST → 201 `{payment}` · PATCH `/:id` → `{payment}` · 400 `VALIDATION` (DEF-5 validator; real calendar dates; whole satang; slice 2a = COURSE | VOUCHER) · actor = `actorOf(c)`. **Not mounted yet.** Exactly three routes, no DELETE.
- The key formats are pinned (golden vectors + `courseSaleKeys`, `voucherLine`'s key, and a source-grep of `createVoucher`'s `voucher-sale:` key) to BB's.
**Evidence (dummy URL):** SB full `bun test` = **5509 pass · 0 fail · 380 files** (base when I started: 5432 pass · 3 fail · 378 files; the 3 were Bob's TASK-861 tests and are green now, none new, none of mine). tsc `--noEmit -p .` = exit 0. Mutation set: **34 mutants over `payment-record.ts` + `revenue-line.ts`, 34 killed** (first run 33; the survivor was the "other rows" query `<>` — now pinned by a test); restored byte for byte (hash check). `git status` for this TASK: `bo-revenue.ts`, `payment-record.ts`, `payment-record.test.ts`, `payments.ts`, `payments.test.ts`, `revenue-line.ts`, `revenue-line.test.ts` — and `route-access.ts` / `scheduler.service.ts` show as modified but are **others'** edits (I have not touched them).

**HELD until Sector rings (Team B's sid deploy):**
1. `scheduler.service.ts` — one hunk in `createCoursePackage` and one in `createVoucher`, after the commit beside `recordSale`: `void createSalePayment("COURSE"|"VOUCHER", id, <the same net recordSale posts>)`.
2. `src/index.ts` — the one `app.route("/api/payments", paymentRoutes)` line beside camp.
3. `src/lib/route-access.ts` — 3 entries.
**🔴 STOP for Sector (roles aren't ours):** `action:bookings.payment-edit` is **not registered** in `src/lib/permissions.ts` (grep: no `payment` there; the bookings actions end at `…voucher-import`, `…course-rental`, `…coach-rate`). The TASK says to stop and ask if a new key needs registering. Do you want that key added to the registry (+ seed so a role can hold it), or should POST/PATCH use an existing key (e.g. `action:bookings.course-edit`)? I have changed nothing there.

## Questions
1. **Action key** for POST / PATCH `/api/payments` — see the STOP above. Register `action:bookings.payment-edit` (a roles change, yours to approve), or reuse an existing key?
1a. **Answered (Sector, DECISIONS row 19): reuse `action:bookings.course-edit`** for POST / PATCH `/api/payments` (no new key, nothing to register). The `route-access.ts` hunk will use it when Sector rings.
2. (answered by doing) The sid scratch proof did not need the hunks, so it is done — below.

### sid proof (DoD) — done 2026-11-08, `payment-sid-proof.ts` in my scratchpad (outside the repo)
Host printed first and guarded (`154.197.124.206`). ONE transaction, rolled back; a random C-TEST course uuid; fixtures (a C-TEST `bo.item` + `course-sale` 100000 and `discount` −10000 movements → fee 90000) made inside the same transaction. Both tables present on sid.
1. `createSalePayment` → `{ok:true}`; replay → `{ok:true, skipped:"duplicate"}`; rows: exactly one — `n 1 · 2099-01-10 · 90000 · TRANSFER · actor null`.
2. PATCH row 1 → CASH, then the REAL `writeRevenueLine` → the line is written with `method CASH` (the writer read row 1).
3. PATCH row 1 → CARD → the line's method is `CARD` (same transaction).
4. §8.9: row 1 amount 90000 → 50000 accepted; an installment of 40000 → `n 2`; that installment's method CASH → TRANSFER leaves the line at `CARD`; one more satang → **400** "the installments add up to more than the course fee".
5. GET → fee 90000 · paid 90000 · remaining 0 · rows `1:50000:CARD, 2:40000:TRANSFER`; the revenue line's amount stays 90000 through every payment edit.
**Residue on sid after the rollback: payments 0 · lines 0 · movements 0 · items 0.** No real sale, no LINE, no login.
**Not exercised on sid:** the HTTP layer (unmounted), `createSalePayment` called from the two sale paths (the held hunks), two truly concurrent writers (the advisory lock is shown by the SQL it issues in the unit test, not raced).

## Status: NEW-FILES half in REVIEW-ready state; the TASK stays IN PROGRESS until the held hunks land.

## Review

**Claim granted (Porter, 2026-11-08 evening).** Order for Brew: **TASK-863 first** (block 1, owner order), then 874, then this.
- **The shared hunks here wait** until Bob's 861/870 are in REVIEW: `scheduler.service.ts` (`createCoursePackage`, `createVoucher`), the `src/index.ts` route line and the `route-access.ts` entries. Silver gives the word through Porter, and I ring you.
- The new files may start at any time.

**SPEC change (Sector, 2026-11-08): SPEC-099 §8.9 applies here too.** The same fee rule, fields and errors as TASK-874; the fee comes from the posted movements.

> **answer to Q1 (Sector, 2026-11-08): reuse an existing key; don't register a new one** [SA-decided; DECISIONS-REQ-120-build row 19].
> - `GET /payments` = `read(BOOKINGS)`.
> - `POST /payments` and `PATCH /payments/:id` = `act(BOOKINGS, "action:bookings.course-edit")` (`permissions.ts:88`, "Edit a course"). Recording how a sale was paid is an edit of that sale. Today's holders of course-edit are the people who manage courses.
> - A new key would be a roles change (seed, the role screens, the owner's role matrix), which isn't ours. If the owner later wants payment rights split from course edit, that's one line here plus a registry entry, done by the roles owner.
> - **Order, still:** Silver's TASK-867 rework (block 1) comes **before** any further 875 work. The held 875 hunks wait for my ring after Team B's sid deploy.

**Review 1, the new files only (Sector, 2026-11-09): ACCEPTED.** The TASK stays open for the held shared hunks.
- **Status of the tree:** the new files are now **committed** in SB `2402649` (the owner's merge commit, Silver's). They are inert: nothing mounts `routes/payments.ts` and no sale path calls `createSalePayment` until the held hunks land.
- **Re-run by me (dummy URL):** the whole SB suite `5553 pass · 0 fail`; his two files `65 pass · 0 fail`.
- **SQL:** every value is bound through drizzle's `sql` template (`payment-record.ts:68`, the advisory-lock key is a bound parameter); no `sql.raw`. The fee keys and revenue-line keys are built from validated `refType` + uuid only (`:26`, `:35`).
- **Security review (new files):** staff-auth routes (mounted later, behind the JWT guard + `act(BOOKINGS, "action:bookings.course-edit")`, row 19); zod-validated input; no revenue figure in responses. Findings: none.
- **Still to do after Team B's sid deploy (my ring):** the shared hunks (`createCoursePackage`, `createVoucher`, the `index.ts` mount, the three `route-access.ts` entries). Then the full suite plus the DoD sid run. Then **Review 2**, then DONE, then `PAYMENTS_LIVE` flips in TASK-876.

**🟢 RELEASED (Sector, 2026-11-09):** Team B's SB + SF sid deploy is out (SB `976cf33`, SF `d8f800c`). Brew, make the held shared hunks now:
- `createCoursePackage` + `createVoucher` (after the commit, beside `recordSale`);
- the `src/index.ts` mount line;
- the three `route-access.ts` entries (`read(BOOKINGS)` for GET; `act(BOOKINGS, "action:bookings.course-edit")` for POST and PATCH, row 19).
- Re-read each file on disk first (the merge moved lines) and touch only your lines.
- **Then:** the whole suite (dummy URL), pinned tsc, `git diff -U0` hunk headers naming each function, and the DoD sid run (scratch script, C-TEST ref, host first, no real sale, no LINE). Then REVIEW.
- **Deploy note:** these hunks make the payment API live on the next SB deploy. That's fine: the SF card stays off (`PAYMENTS_LIVE=false`) until I flip it after Review 2.

---
## Report — Brew (Team C), 2026-11-09. TASK-875 COMPLETE: the shared hunks are done on top of the new files. Status → REVIEW.
**Start conditions (checked, not assumed):** Sector's release (SB `976cf33`, SF `d8f800c` on sid). The SB tree was clean (`git status` empty) when I began, so every hunk below is mine alone. Host of SB's `.env` = `154.197.124.206` (sid), checked before every connect; dummy URL on every test run; tsc pinned `typescript@5.9.2`. No git.

**The hunks (`git diff -U0`, each named):**
- `src/services/scheduler.service.ts` — `@@ -70,0 +71` the import · `@@ -2667,0 +2669,3` in **`createCoursePackage`** (after the commit, beside `void recordSale(`) · `@@ -3098,0 +3103,2` in **`createVoucher`** (same). The `void recordSale(...)` lines are **byte-identical** (a first version that captured `recordSale`'s promise broke TASK-730's source-pin test and was dropped).
- `src/index.ts` — `@@ -16,0 +17` the import · `@@ -110,0 +112` the one `app.route("/api/payments", paymentRoutes)` line, after `accessGuard` (so behind the JWT guard) and beside the camp line.
- `src/lib/route-access.ts` — `@@ -164,0 +165,4`: `GET /payments` = `read(BOOKINGS)`; `POST /payments` and `PATCH /payments/:id` = `act(BOOKINGS, "action:bookings.course-edit")` (DECISIONS row 19; no new key, nothing registered).
- **One mirror test edit, outside the TASK's list (needs your OK):** `src/lib/rbac-stage2-menu-guard-req092.test.ts` (3 lines, tagged `🔻 TASK-875`). Its enumeration reads `routes/api.ts` and `camp.ts` (with `/camp`) and fails any route-access key that no declared route matches; without the same two-line addition for `routes/payments.ts` (mounted at `/payments`) the three new entries read as "stale" and the suite fails. It is exactly the TASK-401 camp precedent. Revert it if you object, but the suite is then red.

**One design change from the TASK text, with the reason.** The TASK said `void createSalePayment(...)` with the amount "the same net `recordSale` posts". I added `createSalePaymentFromPosted(refType, refId)` and the sale code calls that: it **reads the net back from the posted movements** (`course-sale:<id>` / `voucher-sale:<id>` + `discount:<id>`), then calls `createSalePayment`. Why: (1) row 1 can then never differ from the fee the API checks installments against (BB's fee reads the same movements); a recomputed `listPrice − discount` would drift if a `bo.item` price ever differed from the constants; (2) it keeps `void recordSale(` untouched. Because `recordSale` is fire-and-forget it may not have landed, so the function **waits** for the sale movement (6 reads, 250 ms apart) and then gives up loudly with no row (the API then answers `NO_FEE`); a read that throws gives up at once; it never throws and is `void`-ed, so it cannot fail or delay a sale.

**Evidence.**
- **SB full `bun test`: `5567 → 5570 pass · 0 fail · 382 files`** (base at my start: 5553 / 0 / 380 files after the merge; before that `5432 / 3 / 378`). No fail, none new. `tsc --noEmit -p .` exit 0.
- **Mutation sets: 53 mutants, 53 killed** — set 1: 34 over `payment-record.ts` and `revenue-line.ts` (as reported earlier); set 2: 19 over `createSalePaymentFromPosted` (the wait loop and its last-attempt rule, the null/negative/zero fee, the default patience, the throw path), the two `void` calls (dropped, awaited, wrong ref type), the three `route-access` entries (menu, act, missing entry) and the mount line (path, removed). The first run of set 2 killed 14; the survivors were real gaps (the wait between attempts, `Math.abs` on a negative net, the default attempts) and now have tests. All files restored byte for byte (hash check).
- **Wiring pinned by tests:** both calls are `void` and come after the transaction and after `void recordSale(`; there is exactly one import and two calls in the service; `index.ts` mounts at `/api/payments` after the guard and the camp line; **the three routes are mapped (an unmapped route fails closed with 403) and the payments router declares exactly those three**; the rbac enumeration passes.
- **sid proof (DoD) rerun with the new path, ONE rolled-back transaction, host first, a C-TEST course uuid, no real sale, no LINE:**
  - `createSalePaymentFromPosted` for a ref with no posted movement → `{ok:false}`, no row, loud (as designed);
  - for the C-TEST sale (fee 100,000 − 10,000) → `{ok:true}`; the replay → `duplicate`; exactly one row `n 1 · 90000 · TRANSFER · actor null · paid_on 2026-11-09` (the Bangkok date);
  - row 1 PATCH → CASH, then the REAL `writeRevenueLine` → the line is `CASH`; PATCH → CARD → the line follows (same transaction); an installment never moves the line; row 1's amount is editable (90000 → 50000), the installment 40000 fits, one more satang is **400**; GET → fee 90000 · paid 90000 · remaining 0; the revenue line's amount stays 90000;
  - **residue after the rollback: payments 0 · lines 0 · movements 0 · items 0.**
- **Not exercised:** the HTTP layer over the real database and the real `accessGuard` with a JWT (no login on sid was used; the route-access mapping is proven by the table test and the rbac enumeration, the handlers by the in-memory route tests); a real course/voucher SALE end to end (the DoD forbids a real sale); two truly concurrent writers.
- **A note on test noise:** six `[payment] NOT WRITTEN … could not read the posted sale` lines appear in the SB suite output. They come from existing `createCoursePackage` tests whose mocked `db` cannot answer the new read; the function catches it, as designed, and those tests still pass. They are harmless but new; say if you want them silenced.

**Deploy note (yours, as you wrote):** these hunks make the payment API live on the next SB deploy; the SF card stays off (`PAYMENTS_LIVE=false`) until you flip it after Review 2. Sales made on that deploy get their row 1 automatically; sales made before it have no row until someone PATCHes/creates (the API answers `NO_FEE` only when the movement is missing, otherwise a POST creates installment n = max + 1 — for an old sale with no row 1 that would become n 1; flagged below).

## Questions (for Sector)
1. **The rbac mirror test edit** (above): OK to keep?
2. **Old sales with no row 1:** a `POST` on a course sold before this deploy creates `n = 1` as the first installment (it takes `max + 1`, and there is no row). That row's `paid_on` and `method` are then whatever the caller typed, and the revenue line (already written as TRANSFER) does not follow because only a PATCH of row 1 moves it. If that matters before the card goes live, a one-off back-fill of row 1 for existing sales is a separate piece of work; say if you want it.

**Review 2, Sector, 2026-11-09. Verdict: DONE.**
- **Re-run by me (dummy URL):** whole SB suite `5570 pass · 0 fail`; pinned tsc → 0 `error TS`.
- **Read the shared hunks:**
  - `scheduler.service.ts`: the import, `void createSalePaymentFromPosted("COURSE", …)` in `createCoursePackage` and `("VOUCHER", …)` in `createVoucher`, after the commit; `void recordSale(` is untouched;
  - `index.ts`: one mount, behind `accessGuard`;
  - `route-access.ts`: the three entries per DECISIONS row 19.
- **`createSalePaymentFromPosted`** (`payment-record.ts:128–150`) waits up to about 1.5 s for the posted sale, then writes row 1. It is fire-and-forget, loud, and never fails the sale. If it gives up, the card shows "Transfer (default)" and a first row can be POSTed by hand (TASK-874 decision 5). Accepted.
- **The mirror test edit** (`rbac-stage2-menu-guard-req092.test.ts`, 3 lines): **accepted.** It's the same pattern as TASK-401's camp line: the RBAC enumeration has to see the new router, or it would be red.
- **No back-fill** of row 1 for older sales. The card handles them ("Transfer (default)", a manual first row). A back-fill would be a data change on uat (the owner's) and isn't asked for.
- **The sid proof** (one rolled-back transaction, C-TEST id): row 1 = `90000 · TRANSFER · paid_on 2026-11-09`, the replay is a `duplicate`, and residue is 0 everywhere.
- **Security review:** behind the JWT guard + `accessGuard` (read = bookings menu; write = course-edit act); zod-validated; bound SQL; no revenue figure in responses. Findings: none.
- **Not exercised:** the HTTP layer with a real JWT on sid (no login, by rule). That goes into Tanya's QA round with the next SB deploy.
- **Next:** TASK-876's `PAYMENTS_LIVE` flips (Flash). The payment API reaches sid with the next SB deploy (owner's).

## For the owner (via Porter), 2026-11-09: what the uncommitted SB code is, and how it's tested
1. **Are all 6 uncommitted SB files TASK-875's? Yes** (`git status`, 2026-11-09):
   - `src/index.ts` (the `/api/payments` mount);
   - `src/lib/route-access.ts` (3 entries);
   - `src/services/scheduler.service.ts` (the import + one line each in `createCoursePackage` and `createVoucher`);
   - `src/lib/payment-record.ts` + `.test.ts` (`createSalePaymentFromPosted`);
   - `src/lib/rbac-stage2-menu-guard-req092.test.ts` (a 3-line mirror so the RBAC test sees the new route).
   - The rest of TASK-875 is already in `2402649`.
2. **Is the sale-path hunk live or gated? LIVE, not gated.** From that deploy on, every course and voucher sale writes its payment row 1 (TRANSFER, the net), best-effort: it never fails or delays the sale. Only the **SF card** is gated (`PAYMENTS_LIVE`).
   - **Deploy order matters for uat.** The rows go into `bo.payment` and the C1 lines into `bo.revenue_line`, back-office tables from migrations **0008 and 0012**, which are on **sid only**. Before this SB code reaches **uat**, the back office's migrations up to 0012 must be on uat. Otherwise every sale there logs a loud `[payment] NOT WRITTEN` / `[revenue] NOT WRITTEN` (the sale still works).
3. **Tanya's case list on sid, with TASK-876's card switched on** (SB + SF deployed together; C-TEST child and coach; no real family; LINE is the owner's):

| # | Do | Expect |
|---|---|---|
| P1 | Sell a C-TEST **course**, method left at Transfer | Its Payment card: Course Fee = the net, row 1 = that amount · Transfer · "Paid"; Remaining 0 |
| P2 | Sell a C-TEST course with **Cash** chosen in the sale form | Row 1 = Cash (the follow-up call); no warning |
| P3 | Sell a C-TEST course **with a discount** | Course Fee = list − discount (= row 1) |
| P4 | Sell a C-TEST **voucher** (5 h) | Card on the voucher's plan: row 1 = 6,000 ฿ · Transfer |
| P5 | On P1's card: **Edit** the method → Credit card | Row 1 = Credit card; then confirm the course: its revenue line's method is CARD (read: Sector, through the DB, as for TEST-148) |
| P6 | Lower row 1 to part of the fee, then **Add an installment** for the rest | Two rows; Remaining 0; an amount 1 ฿ over → "the installments add up to more than the course fee" |
| P7 | Open a course sold **before** this deploy | "Transfer (default)", no Edit |
| P8 | As an **admin** (not CEO) | The card works; no revenue figure anywhere on it |
| P9 | Thai mode | Every card label in Thai (Porter's wording) |
- Login: Tanya's usual rule (login cases NOT_TESTED without a session). The card needs a signed-in staff user. If she has none, P1–P9 are NOT_TESTED, and only the server-side checks Sector reads in the DB can be done.
