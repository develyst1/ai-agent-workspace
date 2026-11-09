# TASK-875: F2 payment record: auto row at course and voucher sale + front-office API (SB)
- Source: SPEC-099 §8 (decisions 3, 4, 5)
- Owner: BE (Brew, Team C) · Status: TODO · **Depends on: TASK-874's migration applied · verified on sid** (Sector rings you). You may build and unit-test before that.
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

## Questions

## Review

**Claim granted (Porter, 2026-11-08 evening).** Order for Brew: **TASK-863 first** (block 1, owner order), then 874, then this.
- **The shared hunks here wait** until Bob's 861/870 are in REVIEW: `scheduler.service.ts` (`createCoursePackage`, `createVoucher`), the `src/index.ts` route line and the `route-access.ts` entries. Silver gives the word through Porter, and I ring you.
- The new files may start at any time.

**SPEC change (Sector, 2026-11-08): SPEC-099 §8.9 applies here too.** The same fee rule, fields and errors as TASK-874; the fee comes from the posted movements.
