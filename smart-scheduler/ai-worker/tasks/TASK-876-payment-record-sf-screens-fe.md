# TASK-876: F2 payment record: Payment Method at sale + the Payment card with installments (SF)
- Source: SPEC-099 §8 (decision 6) · final UI `pages/a/frontoffice/Payment.tsx` (REQ-133, agreed) · REQ-5010 #8 ("Course Fee")
- Owner: FE (Flash, Team C) · Status: REVIEW (Flash, 2026-11-08): built incl. the 3 shared edits; real-API run waits for TASK-875; Q6 (SB path) + Q7 (Thai for 10 lines) open · Depends on: none to start (build against SPEC-099 §8.5 with a typed fake, off by default, as in TASK-859); the real-API run waits for TASK-875.
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
**🟢 LIVE FLIP DONE (Flash, 2026-11-09), on Porter's GO relayed by Sector: `PAYMENTS_LIVE = true`, the tree now ships the feature.**
- `grep -n "PAYMENTS_LIVE = true\|USE_FAKE_PAYMENTS = false" src/components/partials/Payments/config.ts` → `6:export const PAYMENTS_LIVE = true;` and `12:export const USE_FAKE_PAYMENTS = false;` (the one line changed in `config.ts`; its comment still says "flip after TASK-875", untouched).
- Two lines of **my own test file** had to follow, because they pinned the old state: the gate-off test now passes `live: false` explicitly, and the constants test now expects `PAYMENTS_LIVE` true and `USE_FAKE_PAYMENTS` false. Nothing else changed.
- `tsc` → `tsc error TS: 0`. `bun test` (whole SF suite) → `1435 pass · 0 fail · 155 files` (up from 1432 / 154: other teams' tests now in the tree; mine are unchanged at 16).
- **What this turns on, so the deploy is read right:** the Payment card in the plan modal (every saved course and voucher: it will call `GET /api/payments`) and the Payment Method select + the post-sale PATCH in the sale form. All of it needs TASK-875's routes, so **the SF deploy must go with SB's TASK-875 in the same deploy** (as you said); SF alone would show an error card in every plan modal.
- Not re-run against the real API after the flip (nothing but the constant changed; the read-only run of 2026-11-09 used the same code with the gate on). Tanya's P1–P9 cover the real writes.

**REAL-API RUN, READ-ONLY (Flash, 2026-11-09), step 1 of Sector's "Next step" with the read-only correction. No POST, no PATCH, nothing written on sid.**
- **Host check first:** SB `dong` @ `976cf33`; `grep -E '^DATABASE_URL=' .env | sed -E 's#…@([^:/]+).*#host \1#'` → `host 154.197.124.206` (sid), so I went on.
- **Local SB:** `SKIP_AUTH=true PORT=4306 LINE_CHANNEL_ACCESS_TOKEN= LINE_CHANNEL_SECRET= bun src/index.ts`; its log: `[outbox] LINE_CHANNEL_ACCESS_TOKEN not set — worker idle (rows stay PENDING)`. I changed nothing in SB (its `git status` shows only others' edits).
- **What sid holds (GET only, no names printed):** I read `GET /api/courses?limit=40` and `GET /api/payments?refType=COURSE&refId=<id>` for each of the 40 → **no course has a payment row yet** (`withRows: null`; rows are only created by a new sale after TASK-875 deploys). So the real reads available were: a course with a fee and no row (`feeMinor` 649000, status CANCELLED) and one with no fee (`feeMinor: null`). Real answers: `{"payments":[],"feeMinor":null,"paidMinor":0,"remainingMinor":null}` for an unknown id; for the no-row course `feeMinor: 649000`.
- **How the screens ran:** the repo's real `PaymentCard` and `PlanModal` + the **real services** (no fake: `USE_FAKE_PAYMENTS` stayed `false`), `PAYMENTS_LIVE = true` **for this run only**, in a scratch bundle outside the repo (same setup as before), through a scratch proxy that forwards `/api/*` to `localhost:4306` and **answers 405 to anything but GET**. (The app's own login can't be used here, as before, so a fake client session seeds `useMe`; the SB's SKIP_AUTH makes the API accept it.) Harness `evidence/TASK-876/shoot-real.mjs`.
- **Results (pasted from the run):** every request the page made: `GET /api/auth/session · GET /api/payments · GET /api/entitlements/<id>/plan · GET /api/me` → **`nonGet: []`**, `pageErrors: []`.
  - Course with a fee, no payment row (an older sale): `Payment · Payment Method · Transfer (default) · Installment · No installments yet` → Edit 0, Add 0, Paid 0 (`real-1280-1-no-payment-row.png`, and in Thai with Porter's words `real-1280-1b-no-payment-row-th.png`: การชำระเงิน · วิธีชำระเงิน · โอนเงิน (ค่าเริ่มต้น) · งวดชำระ · ยังไม่มีงวดชำระ).
  - Sale with no fee: the same card, no Add (`real-1280-2-no-fee.png`).
  - Inside the real `PlanModal` of that course: the "Payment" heading and "Transfer (default)" are there (checked by text only, no screenshot: its header carries a student's name).
- **Not shown on real data, because sid has none yet:** a row 1 with Edit/Paid, Course Fee, Remaining, Add an installment. Those states are proven on the fake and by the 16 tests; Tanya's round and the first real sale after deploy cover them. **No C-TEST data was needed or created.**
- **Observation, not changed:** for the no-row course the API does return `feeMinor: 649000`, but the card shows "No installments yet" and no Course Fee line when there are no rows (my rule: nothing to add to, nothing to split). Say if you want the fee shown there.
- **Restored:** `config.ts:6` `PAYMENTS_LIVE = false`, `:12` `USE_FAKE_PAYMENTS = false` (grep → 2 lines); `tsc` → `tsc error TS: 0`; SB on 4306 stopped; scratch junction removed; ports 4306 / 3306 / 3310 all down. SF footprint unchanged (`M CreatePlanFlow.tsx · M PlanModal.tsx · M dictionaries.ts · ?? Payments/ · ?? payments.service.ts · ?? types/payments.ts`).
- **Step 2 (yours to ring):** after the owner's next SB deploy to sid, a one-line change sets `PAYMENTS_LIVE = true`.

**Q7 DONE (Flash, 2026-11-08): Porter's Thai for the ten lines is in `th.paymentRecord`, verbatim from his table** (วันที่รับเงิน · จำนวนเงิน · โอนเงิน (ค่าเริ่มต้น) · ลองอีกครั้ง · กำลังโหลดข้อมูลการชำระเงิน · โหลดข้อมูลการชำระเงินไม่สำเร็จ · บันทึกการชำระเงินไม่สำเร็จ · ยังไม่มีงวดชำระ · เลือกวันที่รับเงิน · กรอกจำนวนเงินมากกว่า 0). `grep -c "PENDING (Porter)" src/lib/i18n/dictionaries.ts` → `0`; `tsc` → `tsc error TS: 0`; whole SF suite → `1432 pass · 0 fail`; `git diff --numstat` on `dictionaries.ts` → `48 0` (additions only; the block comment shrank by one line). The "visible gap" bullet below is closed. The gate is still off, so none of this shows in the app yet; not re-screenshotted for that reason (the Thai card screenshot from before still shows the 10 English lines).

**🔴 SHIP GATE DONE (Flash, 2026-11-08): the tree is deploy-safe.** Numbers below that say 1430 / 14 are from before the gate; the current ones are here.
- `Payments/config.ts`: `export const PAYMENTS_LIVE = false;` (line 6) and `export const USE_FAKE_PAYMENTS = false;` (line 12). `grep -n "PAYMENTS_LIVE = false\|USE_FAKE_PAYMENTS = false" src/components/partials/Payments/config.ts` → those 2 lines.
- Gate **off**: `PaymentCard` is a thin outer component that returns `null` and renders the inner card only when live, so no hook, query or call can run (a `live` prop exists only so a test can switch it on); `CreatePlanFlow.tsx` shows no Payment Method select (`PAYMENTS_LIVE && chosen && …`) and makes no follow-up call (`if (PAYMENTS_LIVE) void recordSaleMethod(…)`); the fake is only ever reached by a dynamic import inside the service under `USE_FAKE_PAYMENTS`, which is false, and the service is never called. The shared-file diff is still additions only: `git diff --numstat` → `18 0 CreatePlanFlow.tsx` · `5 0 PlanModal.tsx` · `49 0 dictionaries.ts`.
- `tsc` → `tsc error TS: 0`. `bun test` (whole suite) → `1432 pass · 0 fail · 154 files` (my 16 new + the repo's 1416). Two tests pin the gate: with the gate off the card renders nothing and `listPayments` is called 0 times; and the tree's two constants are both `false`. **Mutation:** I replaced the gate line with `if (false as boolean) return null` and the gate test went red (`15 pass · 1 fail`); restored (marker grep → 0).
- A repo guard (`dom-assert-readable`, TASK-596) failed on my first version of the gate test, because it passed a DOM node to `toBeNull()`; I rewrote those three to boolean checks (`.length`, `=== undefined`). The whole suite is green again.
- **Gate-off screenshots of the REAL screens** (`evidence/TASK-876/gate-off-1-sale-form.png`, `gate-off-2-plan-modal.png`, harness `shoot-gate-off.mjs`; same scratch-bundle setup as before, rebuilt from the tree as it is now): the sale form with a priced program chosen (Course size, Discount section, "Amount payable" all showing, i.e. the select *would* have been there) → `paymentMethodLabels: 0`; its labels are Private · DUO · Student · Teacher · Program · Course size · Percent · Baht · Reason · First session date · Time · Session note, nothing new. The plan modal → `installmentHeadings: 0`, `paymentWords: 0`. **`paymentsRequests: []`** — not one request to anything containing "payments" in either screen. (I compared by DOM text and screenshot, not pixel-diff against a pre-change build.)
- `PAYMENTS_LIVE` flips to `true` in a later one-line change after TASK-875 is on sid. Everything I flipped for runs is restored; scratch junction removed; no dev server left running.

**Built (Flash, 2026-11-08): the new files first, then the three shared edits after Sector's "CLEARED", with your answers 1–5 and SPEC-099 §8.9 applied.** Status: all build work done; the real-API run and Porter's Thai for 10 lines are open.

*Files:* new: `src/types/payments.ts` · `src/services/payments.service.ts` · `src/components/partials/Payments/{config,fake,hooks,sale-method,api-sentence}.ts` · `{PaymentCard,InstallmentTable,PaymentDialog,PaymentMethodSelect}.tsx` · 2 test files. Shared, **additions only** (`git diff --numstat` → `15 0 CreatePlanFlow.tsx` · `5 0 PlanModal.tsx` · `49 0 dictionaries.ts`, 0 deleted): `CreatePlanFlow.tsx` (imports, one `payMethod` state + its reset, the select under the discount section shown when a price is chosen, and after the sale a non-awaited `recordSaleMethod("COURSE", result.course.id, payMethod)` that notifies `paymentRecord.saleWarning` only if it fails) · `PlanModal.tsx` (one import and one line: `{!isCreate && entitlementId && <PaymentCard refType={isCourse ? "COURSE" : "VOUCHER"} refId={entitlementId} />}`) · `dictionaries.ts` (one appended `paymentRecord` block, EN and TH). `VoucherPanel.tsx` untouched (answer 1). `git status --porcelain` for these: `M CreatePlanFlow.tsx`, `M PlanModal.tsx`, `M dictionaries.ts`, `?? Payments/`, `?? payments.service.ts`, `?? types/payments.ts`. Before each shared file I checked it was unmodified on disk (same line counts, no `git status` entry) and touched only my lines.

*Applied from your answers / §8.9:* `GET` returns `{payments, feeMinor, paidMinor, remainingMinor}`; the card shows Course Fee = `feeMinor` and Remaining = `remainingMinor` (nothing summed on screen); every row's amount is editable, row 1 included; the API's 400 "adds up to more than the course fee" is shown in the dialog as it arrives; `feeMinor: null` hides "Add an installment" and the two figure lines; no row 1 hides Edit and Add. The PM's Thai is in the dictionary (Payment Method, Edit, Paid, Installment, Add an installment, Course Fee, Remaining = ค้างชำระ, the three methods, the card title, the sale warning, verbatim; a test pins the warning's exact Thai).

*Checks, real output:*
- `node node_modules/typescript/bin/tsc --noEmit -p . | grep -c 'error TS'` → `0` (base 0).
- `bun test` (whole SF suite) → `1430 pass · 0 fail · 154 files` (includes my 14 new: `payment-card-task876.dom.test.tsx` 10 = 9 card tests + 1 dictionary pin, `sale-method.test.ts` 4; the other 1416 are the repo's, all still green, incl. `keys.test.ts` and `approved-copy.test.ts`).
- **The tests can fail:** twice I broke the code on purpose and the matching test went red, then restored (marker grep → 0): always-send-`paidOn` ⇒ `Edit → Cash → Save PATCHes ONLY the method` failed (`Received + 1`); Add shown with no fee ⇒ the no-fee test failed.
- One real catch on the way: the full run first showed `1429 pass · 1 fail` (my "API's 400 is shown" test passed alone). Cause: other test files replace `@/lib/api/client` process-wide with their own error class, so my `instanceof ApiClientError` check was false in the whole-suite run. Fixed in the code, not the test: `api-sentence.ts` reads the API's sentence from any error with a numeric `status` (an `ApiClientError` is one). The other 154 files are untouched.
- `config.ts:5` → `export const USE_FAKE_PAYMENTS = false;` (true only for screenshot runs, restored). Scratch `node_modules` junction removed; ports 3306/3310 down.
- Screenshots in `evidence/TASK-876/`, outside the repo (scratch `bun build` bundles in the session scratchpad, Chrome headless, 1280 / 768 / 375):
  - `shoot.mjs` → the card alone (`<w>-2-card-edit-open`, `-3-installment-added`, `-4-no-payment-row`, `-5-error-retry`, `-6-loading`, `-1-sale-method-select-cash`): `hscroll` false in every state at every width; no-row → Edit 0 / Add 0 / Paid 0; error → `The payment service did not answer Retry`.
  - `shoot-app.mjs` → **the real `CreatePlanFlow` and `PlanModal`** with the repo's mock services and the payment fake: `app-<w>-1-sale-form-cash-chosen` (Student → Teacher → Program → price → "Payment Method" shows Transfer by default, then Cash chosen: `defaultMethod: Transfer`, `chosenMethod: Cash`), `app-<w>-2-plan-modal-payment-card` (`Installment Add an installment # Date received Amount Payment Method 1 16/Oct/26 5,000 Transfer Edit 2 30/Oct/26 3,000 Cash Edit Course Fee 9,500 Remaining 1,500`), `app-<w>-3-plan-modal-payment-card-th` (the PM's Thai); 0 page errors.
- ⚠️ **Not the live app:** I could not use the app's own login in mock mode (REQ-128's 7-day rule fails closed on the mock token, so no session), so those two screens are rendered in a scratch page with a fake client session; the card, select and wiring are the repo's real components. Theme copied from `MantineProviders.tsx`; Tailwind built from the repo's config.
- `UNVERIFIED`: the real SB API (TASK-875), the sale round trip (create → row 1 → PATCH to Cash → warning on failure; the PATCH rule is unit-tested in `sale-method.test.ts`, the call itself not run end to end), keyboard-only walk, reduced-motion, `/impeccable audit` (not run). Edit / Add carry `min-h-[44px]` below `sm`, as the neighbouring panels do; not measured.
- 🟡 **Visible gap, by design until Porter answers (Q7):** in Thai the card still shows English for `Date received`, `Amount`, `Transfer (default)`, `Retry`, `Loading payments`, `Could not load the payments`, `Could not save the payment`, `No installments yet`, `Choose the date received`, `Enter an amount above 0` (his table did not cover them; I will not translate). Each is marked `// PENDING (Porter)` in `dictionaries.ts` (`th.paymentRecord`).

*Decided alone (internal):* dates print with the repo's `formatDateDisplay` (`16/Oct/26`) and money with the repo's `formatPriceMinor` (`9,500`, no symbol), not the final UI's `16/10/26` / `9,500 ฿`, because SF's other panels do; "Add an installment" and "Edit" are hidden when there is no row 1 (and Add also when there is no fee); the dialog title is "Payment Method" when editing and "Add an installment" when adding; the card has a small heading "Payment" / การชำระเงิน (the PM's "card title") above it; the sale-form select shows only once a price is chosen (same condition as the discount section); the post-sale call is not awaited, so the form closes at once; Save/Cancel use the existing `common.save` / `common.cancel` (they already have Thai).

*Read-only notes from before the claim:* Read-only so far: SF `dong` @ `ec10cee`, dirty tree (19 modified + 5 untracked, other teams'; none in my list): `CreatePlanFlow.tsx` (536), `VoucherPanel.tsx` (228), `PlanModal.tsx` l.96–170 and 296–430, `services/pricing.service.ts` (mock pattern), `lib/i18n/dictionaries.ts` head (4,288 lines), `hooks/scheduler/useScheduler.ts` create hooks, the final UI `Payment.tsx` + `mock/a-fo.ts`. SF has a test runner (`bunfig.toml` → `test/dom-preload.ts`; `bun test`), so I will add tests.

## Questions
(Flash, 2026-11-08. All in one message. Until Sector answers, TASK is BLOCKED and I touch no file.)
0. **Claim.** `board.md ## Batch claims` has no line naming Team C's SF files: a grep for `partials/Payments`, `payments.service` and `CreatePlanFlow` finds nothing. I am waiting for it as you said.
1. **`VoucherPanel.tsx` is the voucher LIST, not a detail view.** One table, a row per voucher, and **Manage** opens `PlanModal`; there is nowhere in it to put a card for one voucher. `PlanModal` already shows both kinds (the `isCourse` branch, `entitlementId`). **Default I will take:** one `<PaymentCard>` in `PlanModal.tsx` (edit mode only, both kinds: `refType` from the plan's kind, `refId` = `entitlementId`), and `VoucherPanel.tsx` untouched. Please confirm that `entitlementId` is the `course_packages.id` / `vouchers.id` that `bo.payment.ref_id` holds.
2. **Strings: `dictionaries.ts` or not.** `CreatePlanFlow` and `PlanModal` take every label from `useT()` / `dictionaries.ts`, which is EN + TH (`th` is typed `typeof en`, so each key needs both). Your TASK says to ask first. **Default:** no change to `dictionaries.ts`; the Payments components carry the English labels you wrote (Payment Method, Edit, Paid, Installment, Add an installment, Course Fee, Transfer/Cash/Credit card, the sale warning) in a `labels.ts` of their own. **Cost of the default:** in Thai mode the card stays English. **Alternative:** I add the keys, you or Porter give me the Thai.
3. **Copy nobody wrote.** The loading line, the error line (default `Could not load the payments` + Retry), the empty-table line, and the validation messages of "Add an installment" (date missing, amount ≤ 0). Default: I use those plain English lines; tell me if you want them different. Also: **is the "Paid" badge always shown when row 1 exists?** (default yes; I derive nothing from installments).
4. **"Course Fee" total vs the installments.** The final UI's installments **sum to the price** (5,000 + 4,500 = Course price 9,500). SPEC-099 §8 decisions 2–3 say row 1 holds the **whole net sale** and later rows are additional records ("payment rows record method and dates only"). Read together, row 1 (9,500) + an installment (4,500) would not add up to a Course Fee of 9,500. **Default I will take:** the "Course Fee" line shows row 1's `amountMinor` (the API's number), every row is listed as returned, and **the screen sums nothing and shows no balance or "remaining"**. Tell me if installments are meant to split the fee (then row 1's amount and the Course Fee need a rule from you and Brew).
6. **SB path.** SPEC-099 §8.5 writes SB's route as `/api/v1/payments`, but SB mounts every route at `/api/<name>` (`src/index.ts`; no `/v1` anywhere) and SF's other services call `/bookings`, `/teachers`, … I used `/payments` (one constant in `payments.service.ts`). Please confirm with Brew's TASK-875 which one it is.
7. **Thai for ten lines (Porter).** Not in the PM's table, so they are English placeholders in the Thai dictionary, marked `// PENDING (Porter)`: `Date received`, `Amount`, `Transfer (default)`, `Retry`, `Loading payments`, `Could not load the payments`, `Could not save the payment`, `No installments yet`, `Choose the date received`, `Enter an amount above 0`. Until he writes them, a Thai admin sees those lines in English.
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

**🔴 SHIP GATE, do this first (Sector, 2026-11-08):** Team B's SB + SF sid deploy is close and takes the whole SF tree, including your in-progress lines. The tree today has `USE_FAKE_PAYMENTS = true` and calls `/api/payments`, which doesn't exist on sid until TASK-875 ships. So:
1. In `Payments/config.ts` add `export const PAYMENTS_LIVE = false;`.
2. **When it is false:**
   - `PaymentCard` renders `null`;
   - the sale flow shows no Payment Method select and makes **no** follow-up call;
   - nothing imports the fake.
3. Set **`USE_FAKE_PAYMENTS = false`** in the tree. Flip it locally only for your runs, and restore it before you stop.
4. Prove it:
   - tsc 0;
   - `grep -n "PAYMENTS_LIVE = false\|USE_FAKE_PAYMENTS = false" src/components/partials/Payments/config.ts` → 2 lines;
   - one screenshot of PlanModal and the sale flow with the gate off, looking exactly as before your change.
   - Then tell me, and I give Silver the deploy-safe word.
- `PAYMENTS_LIVE` flips to `true` in a later one-line change, after TASK-875 is on sid.

**Ship gate verified (Sector, 2026-11-08): SF is deploy-safe for Team C.**
- `config.ts:6` `PAYMENTS_LIVE = false`, `:12` `USE_FAKE_PAYMENTS = false`;
- `PaymentCard.tsx:28–29` returns `null` before any hook or query;
- `CreatePlanFlow.tsx:332` (the follow-up call) and `:516` (the select) are both behind `PAYMENTS_LIVE`;
- the fake is only reached through `USE_FAKE_PAYMENTS` (`payments.service.ts:16–26`);
- tsc → 0 `error TS`.
- The `dictionaries.ts` keys are inert text.
- **Go on with the rest of TASK-876 behind the gate.** It flips only after TASK-875 is on sid.

> **answers (Sector, 2026-11-08):**
> 6. **`/payments` is right.** SB mounts at `/api/<name>` with no `/v1`. TASK-875 says `/api/payments`, and SPEC-099 §8.5 is now corrected.
> 7. **The ten Thai lines are asked of Porter now.** Your `// PENDING (Porter)` placeholders stay until he answers.
> **Review of the full build follows** after TASK-875's real-API run (DoD 2b), the same pattern as TASK-859. The ship gate itself is verified (above).

**Q7 answered: Porter's Thai for the 10 lines (PM wording, 2026-11-08).** Replace the `// PENDING (Porter)` placeholders in `th.paymentRecord`:

| English | Thai |
|---|---|
| Date received | วันที่รับเงิน |
| Amount | จำนวนเงิน |
| Transfer (default) | โอนเงิน (ค่าเริ่มต้น) |
| Retry | ลองอีกครั้ง |
| Loading payments | กำลังโหลดข้อมูลการชำระเงิน |
| Could not load the payments | โหลดข้อมูลการชำระเงินไม่สำเร็จ |
| Could not save the payment | บันทึกการชำระเงินไม่สำเร็จ |
| No installments yet | ยังไม่มีงวดชำระ |
| Choose the date received | เลือกวันที่รับเงิน |
| Enter an amount above 0 | กรอกจำนวนเงินมากกว่า 0 |

Then `grep -c "PENDING (Porter)" src/lib/i18n/dictionaries.ts` → 0, and tsc 0.

**Next step (Sector, 2026-11-09): TASK-875 is DONE.** The payment API is in the SB tree and reaches sid with the **next SB deploy** (the owner's). Two steps for Flash:
1. **Now:** prove the screens against the real SB API **locally**.
   - Local SB on 4306 (`PORT=4306`) with these inline: `SKIP_AUTH=true`, `LINE_CHANNEL_ACCESS_TOKEN=`, `LINE_CHANNEL_SECRET=` (empty, so the outbox worker stays idle), against sid. **Host check first.**
   - SF with `NEXT_PUBLIC_API_URL`, or whatever SF's base-URL key is (read `.env.example`), pointing at `http://localhost:4306/api`, set inline.
   - Flip `PAYMENTS_LIVE` to true **locally for the run only**.
   - C-TEST data only: open an existing C-TEST course's card and add one installment. **No new sale and no confirm:** a confirm queues LINE.
   - Shots at 1280. Then restore `PAYMENTS_LIVE = false`, stop both servers, and report.
2. **After the owner's next SB deploy to sid:** a one-line change sets `PAYMENTS_LIVE = true` in the tree. I'll ring you for it, and Tanya's round covers the real login path.
- **Correction to step 1 (Sector, same day):** sid has **no C-TEST course** (the earlier proofs were rolled back, or were revenue lines only), so "add one installment" would write to a real sid course. Step 1 is **read-only** instead: open an existing sid course's card through the local SB and show the real `GET` render (row 1, or "Transfer (default)" for an older sale; Course Fee, Remaining). **No POST and no PATCH.** The write paths stay proven on the fake plus Brew's sid proofs; Tanya's round does the real writes.

**Review, Sector, 2026-11-09. Verdict: the build is ACCEPTED. DONE follows the live flip, which rides the next SB+SF sid deploy, and Tanya's P1–P9 (TASK-875 "For the owner").**
- **Read-only real-API run:**
  - host = sid; only GETs (`nonGet: []`, `pageErrors: []`);
  - the gate stays off in the tree; servers stopped;
  - I read `real-1280-1-no-payment-row.png`: an older sale shows "Payment Method · Transfer (default)" and "No installments yet", with no Edit, no Add, and no Course Fee/Remaining. That is the right call: an old sale was paid outside this system, so "Remaining = the full fee" would mislead.
- **No student name in any shot** (he checked the PlanModal by text because its header names a child): good.
- **Your freeze note:** no issue. Your SF payment work was committed in `d8e39dc` (2026-11-08 22:35, gate off) before the merge (`d8f800c`), and the tree today holds `PAYMENTS_LIVE = false`, `USE_FAKE_PAYMENTS = false`.
- **Next for you, only on my ring** (when Porter says the next SB+SF deploy is being prepared): set `PAYMENTS_LIVE = true` (one line), run tsc + the SF suite, and report. The flip must ship in the same deploy as SB's TASK-875 code.
