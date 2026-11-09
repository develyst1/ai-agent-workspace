# TASK-876: F2 payment record: Payment Method at sale + the Payment card with installments (SF)
- Source: SPEC-099 §8 (decision 6) · final UI `pages/a/frontoffice/Payment.tsx` (REQ-133, agreed) · REQ-5010 #8 ("Course Fee")
- Owner: FE (Flash, Team C) · Status: IN_PROGRESS (Sector answered Q0–Q5 and the claim is granted, 2026-11-08; the shared lines wait for the ring) · Depends on: none to start (build against SPEC-099 §8.5 with a typed fake, off by default, as in TASK-859); the real-API run waits for TASK-875.
- Repo: `smart-scheduler-front` (SF), `dong`, dirty tree (17 entries, other teams'). **Edit nothing until Porter's claim line names these files for Team C** (requested 2026-11-08).
- **Base (Sector, 2026-11-08):** `node node_modules/typescript/bin/tsc --noEmit -p .` → 0 `error TS`.
- Files (closed list):
  - `src/components/partials/Payments/**` (new: `PaymentCard`, `InstallmentTable`, `PaymentMethodSelect`, a fake, tests if the repo has a runner);
  - `src/services/payments.service.ts` (new);
  - `src/types/payments.ts` (new);
  - `src/components/partials/Bookings/CreatePlanFlow.tsx`: **one** block. The Payment Method select beside the discount section, and after a successful sale a PATCH of row 1's method only if it isn't Transfer;
  - `src/components/partials/Bookings/PlanModal.tsx` and `VoucherPanel.tsx`: **one** `<PaymentCard refType=… refId=… />` each, where the course and voucher details are shown.
  - **Not** `dictionaries.ts` unless the screen's existing strings come from it. Read first: if `CreatePlanFlow` labels come from `src/lib/i18n/dictionaries.ts`, ask me before adding keys (a shared file).
- Git writes: none.

## What to do
- **Match the final UI's Payment page:**
  - the card shows the plan's name and student, "Payment Method" with a badge + **Edit** (a modal with the three methods), and a "Paid" badge;
  - the "Installment" table has date · amount · Payment Method per row, plus **"Add an installment"** (a date, an amount in whole baht, a method default Transfer);
  - **"Course Fee"**, not "Course price" (REQ-5010 #8).
  - English labels: Transfer · Cash · Credit card (codes TRANSFER · CASH · CARD).
- **Admin view:** the card shows payments only, never a revenue figure (the API sends none).
- **States:** loading, error with retry, and a course with no payment row (sold before this shipped): show "Transfer (default)" and hide Edit. Editing needs a row 1.
- **The sale-flow method select:** default Transfer. A failed follow-up PATCH shows a warning ("Sale saved; payment method not saved — set it on the course's Payment card"), and the sale stays saved.

## Definition of Done
- [ ] tsc → 0 `error TS`.
- [ ] Screenshots against the fake (fake off by default at the end), in `evidence/TASK-876/`:
  - the sale flow with Cash chosen;
  - the Payment card (Transfer, Edit open);
  - an installment added;
  - the no-payment-row state;
  - 1280 / 768 / 375 with no horizontal page scroll.
- [ ] After TASK-875 on sid: the same against the real SB API (local SB with the safe-run rules I'll give then; no LINE), C-TEST data only.
- [ ] `git status --porcelain`: only the listed files.

## Implementation Notes
**Slice 1 built (Flash, 2026-11-08, after Porter's claim for the NEW files; the 3 shared lines still wait for Sector's ring).**

*Files (all new, all in my closed list):* `src/types/payments.ts` · `src/services/payments.service.ts` · `src/components/partials/Payments/{config,labels,fake,hooks,sale-method}.ts`, `{PaymentCard,InstallmentTable,PaymentDialog,PaymentMethodSelect}.tsx`, and two test files. **Not touched:** `CreatePlanFlow.tsx`, `PlanModal.tsx`, `VoucherPanel.tsx`, `dictionaries.ts` (`git diff --stat` on them → no output). `git status --porcelain | grep -i payments` → exactly `?? src/components/partials/Payments/`, `?? src/services/payments.service.ts`, `?? src/types/payments.ts`.

*Checks, real output:*
- `node node_modules/typescript/bin/tsc --noEmit -p . | grep -c 'error TS'` → `0` (base 0).
- `bun test src/components/partials/Payments` → `10 pass · 0 fail` (2 files: `payment-card-task876.dom.test.tsx` — real clicks on Edit / Save / Add an installment / Retry; `sale-method.test.ts` — the follow-up PATCH rule). Before: no tests in that folder (new). **The tests can fail:** I temporarily made the dialog always send `paidOn`, and `Edit → Cash → Save PATCHes ONLY the method` went red (`9 pass 1 fail`, "Received + 1"); restored, back to 10 pass (grep for the marker → 0).
- `config.ts:5` → `export const USE_FAKE_PAYMENTS = false;` (true only for the screenshot run, restored).
- Screenshots in `evidence/TASK-876/` (`shoot.mjs`), taken **in isolation, outside the repo**, as you said: a scratch bundle (`bun build` of the card + the fake, in the session scratchpad, a `node_modules` junction that I removed afterwards) served locally, Chrome headless at 1280 / 768 / 375: `-1-sale-method-select-cash` (the select with Cash chosen), `-2-card-edit-open` (Transfer, Edit open), `-3-installment-added` (row 3 added), `-4-no-payment-row`, `-5-error-retry`, `-6-loading`. Results pasted from the run: no horizontal page scroll in any state at any width (`hscroll` false); card text `… 1 16/Oct/26 9,500 Transfer Edit 2 30/Oct/26 4,500 Cash Edit Course Fee 9,500`; no-row state → Edit 0, Add 0, Paid 0; error → `The payment service did not answer Retry`; after Add, the table has 3 rows + the Course Fee row. At 375 the table scrolls sideways **inside the card** (Payment Method column), the page does not.
- ⚠️ **Not the real theme:** the scratch page copies `MantineProviders.tsx`'s theme (that file pulls next-auth + i18n); Tailwind was built from the repo's config. So colours/spacing are the repo's, but the app's own shell is not around it.
- **Not built yet (waits for your ring):** the sale-flow select and the post-sale call in `CreatePlanFlow.tsx` (the DoD shot "sale flow with Cash chosen" — today only the select itself is shown), and the `<PaymentCard>` line in `PlanModal.tsx` (Q1). `recordSaleMethod()` is ready and tested for that block, and returns `ok`/`failed` without throwing so the sale stays saved.
- `UNVERIFIED`: the real SB API (TASK-875 not up); keyboard-only walk, reduced-motion, `/impeccable audit` (not run). Touch targets: Edit / Add buttons carry `min-h-[44px]` below `sm`, like the neighbouring panels; not measured.

*Decided alone (internal):* English labels in `labels.ts` (Q2 default); dates print with the repo's `formatDateDisplay` (`16/Oct/26`) and money with the repo's `formatPriceMinor` (`9,500`, no symbol), not the final UI's `16/10/26` / `9,500 ฿`, because SF's other panels do; "Add an installment" and "Edit" are hidden when there is no row 1; the dialog title is "Payment Method" when editing and "Add an installment" when adding.

*Read-only notes from before the claim:* Read-only so far: SF `dong` @ `ec10cee`, dirty tree (19 modified + 5 untracked, other teams'; none in my list): `CreatePlanFlow.tsx` (536), `VoucherPanel.tsx` (228), `PlanModal.tsx` l.96–170 and 296–430, `services/pricing.service.ts` (mock pattern), `lib/i18n/dictionaries.ts` head (4,288 lines), `hooks/scheduler/useScheduler.ts` create hooks, the final UI `Payment.tsx` + `mock/a-fo.ts`. SF has a test runner (`bunfig.toml` → `test/dom-preload.ts`; `bun test`), so I will add tests.

## Questions
(Flash, 2026-11-08. All in one message. Until Sector answers, TASK is BLOCKED and I touch no file.)
0. **Claim.** `board.md ## Batch claims` has no line naming Team C's SF files: a grep for `partials/Payments`, `payments.service` and `CreatePlanFlow` finds nothing. I am waiting for it as you said.
1. **`VoucherPanel.tsx` is the voucher LIST, not a detail view.** One table, a row per voucher, and **Manage** opens `PlanModal`; there is nowhere in it to put a card for one voucher. `PlanModal` already shows both kinds (the `isCourse` branch, `entitlementId`). **Default I will take:** one `<PaymentCard>` in `PlanModal.tsx` (edit mode only, both kinds: `refType` from the plan's kind, `refId` = `entitlementId`), and `VoucherPanel.tsx` untouched. Please confirm that `entitlementId` is the `course_packages.id` / `vouchers.id` that `bo.payment.ref_id` holds.
2. **Strings: `dictionaries.ts` or not.** `CreatePlanFlow` and `PlanModal` take every label from `useT()` / `dictionaries.ts`, which is EN + TH (`th` is typed `typeof en`, so each key needs both). Your TASK says to ask first. **Default:** no change to `dictionaries.ts`; the Payments components carry the English labels you wrote (Payment Method, Edit, Paid, Installment, Add an installment, Course Fee, Transfer/Cash/Credit card, the sale warning) in a `labels.ts` of their own. **Cost of the default:** in Thai mode the card stays English. **Alternative:** I add the keys, you or Porter give me the Thai.
3. **Copy nobody wrote.** The loading line, the error line (default `Could not load the payments` + Retry), the empty-table line, and the validation messages of "Add an installment" (date missing, amount ≤ 0). Default: I use those plain English lines; tell me if you want them different. Also: **is the "Paid" badge always shown when row 1 exists?** (default yes; I derive nothing from installments).
4. **"Course Fee" total vs the installments.** The final UI's installments **sum to the price** (5,000 + 4,500 = Course price 9,500). SPEC-099 §8 decisions 2–3 say row 1 holds the **whole net sale** and later rows are additional records ("payment rows record method and dates only"). Read together, row 1 (9,500) + an installment (4,500) would not add up to a Course Fee of 9,500. **Default I will take:** the "Course Fee" line shows row 1's `amountMinor` (the API's number), every row is listed as returned, and **the screen sums nothing and shows no balance or "remaining"**. Tell me if installments are meant to split the fee (then row 1's amount and the Course Fee need a rule from you and Brew).
6. **SB path.** SPEC-099 §8.5 writes SB's route as `/api/v1/payments`, but SB mounts every route at `/api/<name>` (`src/index.ts`; no `/v1` anywhere) and SF's other services call `/bookings`, `/teachers`, … I used `/payments` (one constant in `payments.service.ts`). Please confirm with Brew's TASK-875 which one it is.
5. **Decided alone (internal; overturn at review):** the Edit modal is the final UI's (date received editable, amount read-only on row 1 and editable on rows ≥ 2, method select) and PATCHes only the fields that changed; per-row method select is replaced by an Edit button on each row so one component serves both; the sale-flow follow-up looks up row 1 with `GET ?refType=COURSE&refId=<new course id>` (`result.course.id`) and PATCHes its method only when it isn't Transfer; the fake sits behind a constant in my folder, off by default, as in TASK-859; a **voucher sale** has no select (the sale flow named is `CreatePlanFlow`, course only), so its row 1 is Transfer until edited on the card.

## Review

**Claim granted (Porter, 2026-11-08 evening).** Start now on the new files: `partials/Payments/**`, `payments.service.ts`, `types/payments.ts`.
- **The three shared lines wait** until Fanta's TASK-870 FE is in REVIEW: the block in `CreatePlanFlow.tsx`, and the `<PaymentCard>` line in `PlanModal.tsx` and `VoucherPanel.tsx`. Silver gives the word through Porter, and I ring you.
- Until then, prove the card and the select in isolation, in a scratch page **outside** the repo or in your tests.

> **answers (Sector, 2026-11-08):**
> 0. **Claim: GRANTED** (board "Claim 2026-11-08 (evening)"). Start now on the new files. The shared lines wait, as above.
> 1. **One `<PaymentCard>` in `PlanModal.tsx` (edit mode, both kinds); `VoucherPanel.tsx` untouched: yes.** `entitlementId` **is** the `course_packages.id` / `vouchers.id`: SB `getEntitlementPlan` (`scheduler.service.ts:2738`) looks the id up in `coursePackages`, then vouchers. So `refType` comes from the plan's kind and `refId = entitlementId`. Your closed list drops `VoucherPanel.tsx`.
> 2. **Strings:** the front office is bilingual (D2's English rule is the back office only), so a Thai admin must not see English.
>    - **Now:** your own `labels.ts`, in English, so the work isn't blocked.
>    - **At the shared-lines step** (the same gate), move them into `dictionaries.ts` as one appended block. The Thai comes from Porter (I'm asking him now).
> 3. **Your copy lines are accepted.** "Paid" shows whenever row 1 exists.
> 4. **Good catch. The SPEC is wrong, and it's fixed in SPEC-099 §8.9.** Installments **split** the fee, as in the agreed screen.
>    - The API returns `feeMinor`, `paidMinor` and `remainingMinor`. Show "Course Fee" = `feeMinor`, the rows as returned, and **"Remaining" = `remainingMinor`** (the API's number, nothing summed on screen).
>    - Every row's amount is editable. A `sum > fee` 400 shows its message. `feeMinor: null` → hide "Add an installment".
> 5. **Your decisions are accepted,** including the voucher sale having no method select (row 1 Transfer until edited on the card).
> Status: back to IN_PROGRESS.

**Thai labels (Porter, PM wording decision, 2026-11-08).** Put them in your `labels.ts` beside the English now; they move into `dictionaries.ts` at the shared-lines step.

| English | Thai |
|---|---|
| Payment Method | วิธีชำระเงิน |
| Edit | แก้ไข |
| Paid | ชำระแล้ว |
| Installment | งวดชำระ |
| Add an installment | เพิ่มงวดชำระ |
| Course Fee | ค่าคอร์ส |
| **Remaining** | **ค้างชำระ** (not คงเหลือ: the app uses ค้างชำระ for money owed and คงเหลือ for sessions and budget) |
| Transfer / Cash / Credit card | โอนเงิน / เงินสด / บัตรเครดิต |
| card title | การชำระเงิน |
| the sale warning | บันทึกการขายแล้ว แต่ยังไม่ได้บันทึกวิธีชำระเงิน ตั้งได้ที่การ์ดการชำระเงินของคอร์สนี้ |

**The shared lines are still NOT cleared** (Silver, via Porter): Bob and Fanta are mid-edit. I ring you when they are.

**🟢 The shared lines are CLEARED (Silver's word via Porter, 2026-11-08):** Fanta's TASK-870 FE is in REVIEW and does not touch these files. Go now:
- the block in `CreatePlanFlow.tsx`;
- the `<PaymentCard>` in `PlanModal.tsx` (VoucherPanel untouched, per answer 1);
- the appended label block in `dictionaries.ts` (EN + the Thai above). It is added to your closed list for **one appended block only**.
- Before each shared file, re-read it on disk: other teams' edits may be in it, so touch only your lines.
