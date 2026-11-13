# TEST-149: sid gate after the 11-09 front-office deploy — 870 Am.3 · 875/876 payments · 889/898 branch · 900/901 camp confirm · 864 C1
**Status:** (1) ✅ · (2) ✅ (P8 partly NOT_TESTED) · (3) ✅ API, painted field NOT_TESTED · (4) ✅ API, painted badge NOT_TESTED · (5) ✅ (one more DB read open for the new parts).
**Source:** Porter's 2026-11-09 entry in `inbox/QA.md`.

**Build:** sid as deployed (Porter: SB `9369788` + SF `6c63154`; the local clones' HEADs read the same; the host shows no version).
**Instrument:** headless Chrome, sid card `picklocker/state/som.json` used as given (no password); the API the screens call, inside that session; one painted pass of the plan window (TH + EN, open / read / close only, every non-GET outside auth aborted: none tried). Run 2026-11-09 02:40–03:20 Bangkok.
**Test data:** QA child `c1743305` (no parent), QA coaches not on LINE, Private SURFSKATE, note "QA TEST-149".

## (1) TASK-870 Am.3: ✅ TEST_PASSED — D-148-1 and O-148-1 fixed
- **D-148-1, the race:** a 5 h voucher with 4 future bookings (1 h free). **3 times**, 2 bookings sent at the same moment: **201 + 400 each time** («ชั่วโมงในวอยเชอร์หมดแล้ว»), never 201 + 201; the voucher read reserved 5 / available 0 after each pair (the winner then cancelled to free the hour again).
- **O-148-1, the voucher end:** a voucher with one VOUCHER booking (16 Nov) + one อื่นๆ booking with that voucher (17 Nov): **the end preview counts 2 and lists both dates**; ending it **cancels both** (VOUCHER CANCELLED, OTHER CANCELLED). A second voucher with 1 future อื่นๆ row + 7 voucher rows: after the end, all 8 CANCELLED, reserved 0.
- Not re-run: the parent's page / admin attend refusal (unchanged since TEST-148, which passed).

## (2) TASK-875/876 payments: ✅ TEST_PASSED on P1–P7 + P9; P8 partly NOT_TESTED
| # | Done | Seen |
|---|---|---|
| P1 | course sold, method left alone | row 1 = **4,790 ฿ · Transfer · 2026-11-09**; fee 4,790, remaining 0 |
| P2 | method → Cash (the sale form's follow-up call) on P3's course | row 1 = **Cash**; no warning |
| P3 | course with 500 ฿ off | fee **4,290** = row 1 |
| P4 | 5 h voucher | row 1 = **6,000 ฿ · Transfer** |
| P5 | P1's row 1 → Card; then a session confirmed | row 1 = **Card** (the C1 line's method: DB read, (5) below) |
| P6 | row 1 lowered to 1,000, an installment of 3,790 added, then 1 ฿ more | two rows, remaining **0**; the extra → **400 "the installments add up to more than the course fee"** |
| P7 | a course sold before the deploy (`45fae9c9`, TEST-140) | **no rows**, remaining = the full fee (the card's "Transfer (default)" text: not painted by me) |
| P8 | the card for this session's user | works, shows the **course fee only, no revenue figure**. Whether this user is admin or CEO isn't shown to me, so **"as an admin, not CEO" is NOT_TESTED** |
| P9 | the painted card, Thai | «การชำระเงิน · วิธีชำระเงิน · บัตรเครดิต · แก้ไข · ชำระแล้ว · งวดชำระ · เพิ่มงวดชำระ · วันที่รับเงิน · จำนวนเงิน · โอนเงิน · ค่าคอร์ส · ค้างชำระ» — all Thai. English: "Payment · Payment Method · Credit card · Edit · Paid · Installment · Add an installment · Date received · Amount · Transfer · Course Fee · Remaining" |
- **Observation O-149-1 (timing, not judged):** read straight after the sale, P3's and P4's payment lists were **empty** (remaining = full fee); a few seconds later both had row 1 (Cash 4,290 / Transfer 6,000). Row 1 is written best-effort after the sale (TASK-875 §2: "never fails or delays the sale"). A card opened in that instant would show no row until reload.

## (3) TASK-889/898 F1 branch: ✅ TEST_PASSED (API); the painted field NOT_TESTED
- **Create:** a course with branch OTHER → course **OTHER**, all 4 sessions **OTHER**. A voucher with OTHER → **OTHER**. A 1 HR with OTHER → **OTHER**; with no branch → **BRAVO** (the default).
- **Move session:** one session → BRAVO: **only that one** changes.
- **Whole-course change** → BRAVO: the course and every not-yet-attended session become **BRAVO**; **the attended 26 Oct session stays OTHER** (a past class keeps where it happened).
- **Not tested:** the branch field / its labels on the screens (the plan window shows a "สาขา" / "Branch" label; I didn't open the create, sale or Move dialogs); the revenue line's branch (DB read, (5)).

## (4) TASK-900/901 camp confirm: ✅ TEST_PASSED (API); the painted badge + dialog NOT_TESTED
- A QA camp package (FULL, FULL_WEEK, `b2044a2d`): the list shows **confirmedOn null**; confirm (received 8 Nov, Cash) → **200 { confirmedOn 2026-11-09, amountMinor 1,150,000 (11,500 ฿), method CASH }**; the list then shows **confirmedOn 2026-11-09**; confirm again → **409 ALREADY_CONFIRMED «แพ็กเกจแคมป์นี้ยืนยันแล้ว»**; a bad date → 400. confirmedOn = today, not the received date, as SPEC-099 §11 says.
- **Not tested:** the camp card's badge / "Confirm camp" button / dialog (the card opens from the student's camp packages; I didn't drive it); NO_FEE (needs a 0-fee package); the camp's revenue line + payment row (DB read, (5)).

## (5) TASK-864 C1: ✅ TEST_PASSED (folds into TEST-148 §(3))
Sector's read-only DB read (end of TASK-864): **TRIAL 1,390 ฿ · COURSE (1 HR) 1,390 ฿ · my 2 vouchers 6,000 ฿ each**, all `occurred_on` 2026-11-09, source BOOKING, and **all still there after my cancels**. That matches what I expected (the list price, no discount; 5 h voucher = 6,000). The 5 extra voucher rows are other teams' sales that day.

**One more DB read would close the new parts** (bare SQL, sid only; for an SA seat):
```
SELECT idempotency_key, type, method, branch, amount_minor, occurred_on FROM bo.revenue_line
WHERE idempotency_key IN ('rl:course:52d40230-6a7d-4147-8903-55336659b0e5',
                          'rl:course:a2e9d921-8536-474d-baa7-f002bd8dcc5c',
                          'rl:camp:b2044a2d-ceff-4050-90b0-6dd8b8fea245');
SELECT ref_type, ref_id, amount_minor, method, paid_on FROM bo.payment
WHERE ref_type = 'CAMP' AND ref_id = 'b2044a2d-ceff-4050-90b0-6dd8b8fea245';
```
Expected: course `52d40230` method **CARD** (P5), 4,790 ฿; course `a2e9d921` branch **OTHER** (its first confirm was while it was OTHER); camp: COURSE · "Balance Camp" · **CASH** · 11,500 ฿ · occurred 2026-11-09; its payment row paid_on **2026-11-08**, CASH, 11,500 ฿.

## Test data created (sid, note "QA TEST-149")
- **Courses** `52d40230`, `b6edeabd`, `a2e9d921`: **cancelled** (ADMIN_ERROR); their sales, payment rows, a confirmed + an attended session and the C1 lines stay on sid's books.
- **Vouchers** `7356f1e3`, the O-148-1 one, `733f7ab8`, `68827b23`: **ended**; all their rows cancelled.
- **1 HR rows** `e85c4a14`, `1807b34f`: cancelled.
- **Camp package** `b2044a2d`: **confirmed, left as is** (a confirm can't be undone; QA child only).
**uat:** not touched.

## Evidence (`tests/evidence/`, git-ignored)
- `test149-payment-card-th.png` / `-en.png` — the plan window's payment card on course `52d40230`: 2 rows (1,000 Card + 3,790 Transfer), fee 4,790, remaining 0.
- The step tables above are the scripts' output, as printed.

## Painted round, 2026-11-09 03:30–04:20 Bangkok (Porter's 03:25 line): (a) 🐞 1 defect · (b) NOT_TESTED · (c) ✅
**Instrument:** headless Chrome, sid card as given, 1440 px, TH then EN (the app's own language switch); every non-GET outside auth aborted (none was tried). Same build (SB `9369788` + SF `6c63154`).

**(a) The branch field**
- **New course dialog:** a «สาขา» / "Branch" select, **default Bravo**, options **Bravo · อื่นๆ** (TH) / **Bravo · Other** (EN). ✅
- **Issue voucher (the voucher sale) dialog:** the same select, default Bravo, same options. ✅ (`test149-branch-vouchersale-th.png` / `-en.png`)
- **The plan window** (QA course `254d4b31`, created on branch **OTHER**): the whole-course control «สาขา» + «บันทึก» sits next to «เปลี่ยนครู / เวลา ทั้งคอร์ส» ✅ — **but its box is empty.** 🐞
- **Session ⋯ → แก้ไข / Edit:** opens inline in the plan (no separate Move dialog); a **second branch field** appears for that session, **also empty** (value null). Its options were not opened.
- **The read-only branch display** ("show it when not BRAVO", TASK-898 §3): **nowhere on the plan** for this OTHER course.

**🐞 Defect D-149-1 (TASK-898 / the plan payload; severity medium): the plan window never shows a course's or session's branch.**
- **Repro (sid, one go):** create a course with branch OTHER (API 201, `GET /courses` says OTHER, every session OTHER — TEST-149 §(3)). Open its plan (Bookings → Manage plan). **Expected:** the branch box reads «อื่นๆ» / "Other", and the plan shows the branch because it isn't Bravo. **Actual:** the box is **empty**, the session's edit field is **empty**, and "Other" appears nowhere. The same empty box shows on an ordinary Bravo course (`test149-p7-default-th.png`).
- **What I read (GET only):** `GET /entitlements/:id/plan` for that course returns **no `branch`** — not in `summary` (its 27 keys listed in the run) and `null` on every session row. The control reads `plan.summary.branch` (`CourseBranchControl` via `PlanModal.tsx:512`). No cause stated beyond that; the fix is the SAs'.
- **Why it matters:** an admin sees no branch, so can't tell which courses are at the other branch, and the Save next to an empty box gives no hint of the current value.

**(b) The camp card + "Confirm camp" dialog: NOT_TESTED.**
- The camp card opens from **People → a child under a parent → the tent icon**. My QA child has **no parent**, and the "no parent" list gives that row only «ผูกผู้ปกครอง» and «เก็บ» (no camp button), so the card can't be reached for her.
- Using a QA child **with** a parent risks a LINE message to whoever that parent is linked to, which isn't mine to send. **To settle it:** Porter names a QA child under a parent that isn't on LINE, and I run the same script (badge → button → dialog → confirm → badge flips).
- **Declared:** my first try had no filter and opened the camp card of the first child on the People list, a real-looking family (**read only, nothing pressed, nothing written**). Its screenshot showed parents' names and phone numbers, so **I deleted it at once**; nothing from it is in any file.
- The new QA package `f11e4664` (HALF, FULL_WEEK) is left **unconfirmed**.

**(c) P7 "Transfer (default)": ✅ painted.** A QA course sold before the deploy (child "QA Camp Kid2") shows **«วิธีชำระเงิน · โอนเงิน (ค่าเริ่มต้น)» · «ยังไม่มีงวดชำระ»** (EN: "Payment Method · Transfer (default)" · "No installments yet"), **no Edit button, no rows**. (`test149-p7-default-th.png` / `-en.png`)

**Test data (this round):** course `254d4b31` (branch OTHER) **cancelled** (ADMIN_ERROR; its sale and payment row stay); camp package `f11e4664` left unconfirmed. **Evidence kept:** `test149-branch-vouchersale-*`, `test149-branch-plan-*`, `test149-branch-move-*`, `test149-p7-default-*` (QA / test children only). **Deleted:** the camp-card screenshots and the New course screenshots (background showed real-looking children's names).

## Camp card, painted, 2026-11-09 ~04:20 Bangkok (Porter's 04:00 line): ✅ TEST_PASSED — closes (b) above
**Setup (sid, my own QA data):** parent `030dea39` "QA TEST-149 parent", phone `000000149` (no one's number), **no LINE id** (`lineUserId: null`); child `f49cead3` "QA TEST-149 camp kid" under it; camp package `bd23f47a` (HALF, FULL_WEEK). Headless, TH then EN; the only write let through was the one confirm POST.
**Path:** People → search "QA TEST-149" → exactly 1 parent card → its child's tent button → the camp card.
- **Before (TH):** «แคมป์ — QA149camp», «ครึ่งวัน · เต็มสัปดาห์ (5 วัน)», badge **«ยังไม่ยืนยัน»**, button **«ยืนยันแคมป์»** enabled.
- **The dialog (TH):** title «ยืนยันแคมป์»; «วันที่รับเงิน *» = **9 พ.ย. 2026** (today); «จำนวนเงิน» = **«—»** (as agreed until next round); «วิธีชำระเงิน» = **โอนเงิน** (default); buttons «ยกเลิก» · «ยืนยันแคมป์».
- **Pressed:** the request sent was `POST /api/camp/packages/bd23f47a…/confirm {"receivedOn":"2026-11-09","method":"TRANSFER"}`. **After:** badge **«ยืนยันแล้ว · 09/NOV/26»**, and a toast «ยืนยันแล้ว · 09/Nov/26 · 5,900» (the server's amount).
- **EN, reopened:** "Camp — QA149camp", badge **"CONFIRMED · 09/NOV/26"**, **"Confirm camp" now disabled**.
- **Not tested here:** NO_FEE's message (needs a 0-fee package) and a received date other than today on screen (the API case with 8 Nov passed in §(4)).
**Evidence (`tests/evidence/`, dialog element only, QA child only):** `test149-camp-card-before-th.png` / `-en.png`, `test149-camp-dialog-th.png`, `test149-camp-card-after-th.png`.
**Test data created:** parent `030dea39` (no LINE), child `f49cead3`, camp package `bd23f47a` **confirmed** (its sale, revenue line and payment row stay). The earlier QA package `f11e4664` stays unconfirmed.

## D-149-1, scope after Porter's 04:10 line (Sector's reading)
- **Withdrawn from the defect:** the empty per-session branch field under the plan's session Edit is **by design** (TASK-898 Q8: a session's branch lives in the calendar booking dialog). Not a defect.
- **Still open:** the plan's whole-course box + the read-only branch line — fixed by TASK-916 (`summary.branch`), closing on the next SB deploy. **Re-check then:** an OTHER course → box «อื่นๆ» + the branch line; a Bravo course → box «Bravo», no line. Not yet seen: the calendar booking dialog's per-session branch field.

## TASK-916 re-check, 2026-11-09 (Porter's 08:34 line): ✅ TEST_PASSED — D-149-1 closed, camp Amount filled
**Build:** sid as the owner deployed it (Porter: SB `9369788` + 6 uncommitted files = TASK-916; SF `6c63154` unchanged). Headless, sid card as given, TH then EN; the screen pass was read only (every non-GET outside auth aborted; none tried).
**API (GET):** `GET /entitlements/:id/plan` now returns **`summary.branch`**: **OTHER** for a new QA course on Other (`c9636fd4`), **BRAVO** for a QA Bravo course (`a795c3cd`). `GET /camp/packages` items now carry **`amountMinor`** (1,150,000 for a new FULL / FULL_WEEK package).
**(1) D-149-1, the plan window:**
- **Course on Other:** a read-only line **«สาขา · อื่นๆ»** / **"Branch · Other"** under the course header, and the whole-course box reads **«อื่นๆ» / "Other"**. ✅
- **Bravo course:** the box reads **«Bravo»**, and **no** branch line. ✅
- (The per-session field stays out of scope: by design, Porter's 04:10 line.)
**(2) The camp dialog's Amount:** on a new QA package (FULL, FULL_WEEK, `2db81478`), «จำนวนเงิน» / "Amount" reads **11,500** (was «—»); date = today, method = Transfer. Opened, read, **cancelled** (not confirmed). ✅
**Evidence (`tests/evidence/`, dialog element only, QA children only):** `test149-916-plan-other-th.png` / `-en.png`, `test149-916-plan-bravo-th.png` / `-en.png`, `test149-916-camp-dialog-th.png` / `-en.png`.
**Test data:** QA course `c9636fd4` (branch OTHER) **cancelled** (ADMIN_ERROR; its sale and payment row stay); camp package `2db81478` left **unconfirmed** (child under my QA parent `030dea39`, no LINE).
