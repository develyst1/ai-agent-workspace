# TEST-080: sid batch #2: the REQ-112 GATE (`TASK-657` §R-gate, the table "REWRITTEN AGAIN … for TASK-692"), 2026-10-07 00:00–00:30

**Tester:** Tanya (QA) · **Env:** sid only · **Deploy:** `DEPLOY-sid-2026-10-06.md` (both repos restarted, owner confirmed) · **Browser:** headless only · **Evidence:** `project-docs/qa-2026-10-07/`
**Scope of this file:** the gate (Team A, REQ-112). Team B's items (665+667, 668+669, 670, 671, 672, 624) follow in a separate section/file.

## Verdict
**API: every row of the gate PASSES, every expected date hand-checked** (below). **🔴 ONE FAIL on the SCREEN: an admin cannot cancel a COURSE session with «ปัญหาจากทางเรา» from any screen**, so the customer's own "15" (and "+7 for a school cancel") is reachable only through the API (see F1).

## Fixtures: fresh courses on sid, coach qatt75b, Private SURFSKATE
Today is Wed 07/10. An ORDINARY leave needs a STARTED course (`courseNotStarted`: any plan row dated before today means started). So the three gate courses start **D = Mon 05/10** with session 1 ATTENDED, and session 2 falls on Mon 12/10. **Base expiry = D + 28 / 49 / 84 = 02/11 · 23/11 · 28/12** (written in the table's own formula; I chose this D instead of its example D = 14/10 for that reason).
| key | course | student | sessions |
|---|---|---|---|
| C4 | `92ef88f7-bb62-40cf-9844-26e94c7915a4` | qakid3 | 4 × Mon 10:00 |
| C6 | `fd37d7c1-3b7c-434d-bbe8-22b1a259acc3` | campkid2 | 6 × Mon 11:00 |
| C10 | `41480fa2-10c9-4508-b532-234d364f5380` | qakid3 | 10 × Mon 13:00 |
| C4n (not started) | `8be608c9-352a-4211-ab3b-0143321e4d3e` | campkid2 | 4 × Wed 10:00 from 14/10 |
| P4 (parent door) | `2c28b534-71f9-4e66-809a-e03007957c13` | QAChatOne (parent 0899990763, LINE-linked QA phone) | 4 × Mon 09:00 from 05/10 |

## The gate, by hand
| step | act (door) | expected | **seen** | |
|---|---|---|---|---|
| base | create + confirm | 02/11 · 23/11 · 28/12 · C4n 11/11 | **02/11 · 23/11 · 28/12 · 11/11** | ✅ |
| 1 | ORDINARY leave on session 2 (12/10), Record leave `PATCH /bookings/:id/status sick-leave` | booked, +0; C4 make-up in week 5 | 200 on all three, `plannedAtCreation:false`; expiry **unchanged**; make-ups C4 **02/11 (week 5)**, C6 16/11, C10 14/12 | ✅ |
| 2 | ORDINARY leave on session 3 (19/10), the plan modal's Mark absence `POST /courses/:id/plan {mark-absence}` | C4 REFUSED, nothing written; C6/C10 booked +0 | **C4: 409 `LEAVE_NO_VALIDITY` *"อายุคอร์สไม่พอสำหรับคาบชดเชย — ขยายวันหมดอายุก่อน แล้วค่อยบันทึกลา"***. Session 3 still CONFIRMED, no make-up, expiry 02/11, leave count unchanged. **C6/C10: 200, +0**; C6's make-up lands ON its expiry 23/11 (inclusive). | ✅ |
| 2b | C4: admin extends the expiry +1 week (`PATCH /courses/:id/expiry 2026-11-09`), then repeats step 2 | booked, make-up in week 6 | Preview 200 (no warning) · save 200 · **nothing booked by the extension itself** (no held state, per §R3) · repeat ⇒ **200, make-up 09/11 = week 6** | ✅ |
| 3a | C10: admin records qatt75b's leave on 26/10 and 02/11 (future) | +0, day blocked, classes LISTED | 200 `mode advance · cancelled 0 · familiesNotified 0`; the classes on those days listed; **every expiry unchanged** | ✅ (run AFTER 3b: my first call was eaten by a shell path rewrite, 404. Order noted; 3a's effect is independent of 3b.) |
| 3b | C10: cancel sessions 4 (26/10) and 5 (02/11) with **SCHOOL_ISSUE** (API) | **+14 ⇒ D+84+14 = 11/01/2027 ("15")** · 2 make-ups | **expiry 2027-01-11 · maxWeek 15** · make-ups booked, all ≤ 11/01 (plan: 14/12, 21/12, 28/12, 04/01) | ✅ (API) |
| 4 | C6: cancel session 4 (26/10) with **SCHOOL_ISSUE** | +7 ⇒ 30/11, make-up booked | **expiry 2026-11-30 · maxWeek 9** · make-up **30/11** | ✅ (API) |
| 5 | C6: cancel session 5 (02/11) with **CUSTOMER_CANCELLED** | +0 · NOT refused · make-up CREATED past the expiry · admin told | 200 (not refused) · expiry **30/11 (+0)** · make-up **07/12, past the expiry** (from the plan; my bookings list missed the row at first) | ✅ (admin LINE notice: ⚪ not observable from my side) |
| her "6" | C4n (not started): Record leave on session 2 (21/10) | +7 ⇒ D+35 = 18/11 = week 6 · make-up booked | `plannedAtCreation:true` (T1) · **expiry 11/11 → 18/11** · make-up 11/11 · card **"ใช้ได้ถึงสัปดาห์ที่ 6"** | ✅ |
| Undo | undo C10's step-1 leave (`POST /bookings/:id/undo`) | the expiry does NOT change | 200 · the 12/10 class restored, its make-up cancelled · **expiry stays 2027-01-11** | ✅ |
| **Forward-only** | existing courses, untouched | expiry byte-identical to before the deploy | `0e9feec6` **2027-02-22** (TEST-077) · `f6c9b1e5` **2026-12-25** (TEST-077) · `0d40ff84` **2026-11-10** (TEST-077) · `e3c2d430` **2026-10-05** (TEST-078). All identical. | ✅ |
| **Parent's LINE door** | P4: session 2's leave already taken (room used, make-up on 02/11 = the expiry). Then the PARENT on the QA phone sends `leave` → picks **Mon 19/10 09:00** | her sentence verbatim · nothing written · admins get ONE notice | Reply: **"ไม่สามารถแจ้งลาได้ เนื่องจากวันหมดอายุไม่เพียงพอค่ะ กรุณาติดต่อแอดมินค่ะ"**, word for word. 19/10 still CONFIRMED, no make-up, expiry 02/11. `LINE-1-leave-picker.png`, `LINE-2-after-tap.png` | ✅ (admin notice ⚪ not observable from my side) |
Every course's live plan still holds its full number of classes (4 / 6 / 10) after every step.

## By eye (screens, headless)
| check | seen | |
|---|---|---|
| The card's week = the stored expiry's week | C4 **6** (exp 09/11) · C6 **9** (30/11) · C10 **15** (11/01) · C4n **6** (18/11) · plus 4 older QA cards: label = expiry week on all 8 | ✅ |
| No "x of y" / quota / lock words | 0 hits on 8 cards and on the C4n plan modal | ✅ |
| The course-END dialog has NO «ปัญหาจากทางเรา» | radios: ลูกค้าเปลี่ยนกิจกรรม · ลูกค้าไม่เอาแล้ว · แอดมินคีย์ผิด, none checked | ✅ `END-COURSE-dialog.png` |
| The 4th reason on the SESSION cancel dialog | see F1 | 🔴 |

## 🔴 F1: a COURSE session cannot be cancelled with «ปัญหาจากทางเรา» on any screen
- **What happens:**
  - A course class opened from the calendar offers only *เพิ่มค่าเช่า · ปิด · มาเรียน · ย้ายคาบ · บันทึกลา/ป่วย*, with **no cancel**.
  - The plan modal's row menu (*จัดการ*) offers *แก้ไข · บันทึกลา · ยกเลิกคาบ*. **"ยกเลิกคาบ"** opens *"ยกเลิกคาบเรียนนี้ — คาบนี้จะถูกยกเลิกและมีคาบชดเชยคืนให้"* with **0 reason choices**: just ยกเลิก / ยกเลิกคาบ. `COURSE-SESSION-cancel-dialog.png`
- **Why (code, read only):**
  - The dialog that carries the 4 reasons (`CancelBookingDialog`, with «ปัญหาจากทางเรา» + its hint) is opened only when `canCancelWithReason`, which is **SINGLE_SESSION · VOUCHER · FIRST_TRIAL · OTHER**, never `COURSE_PACKAGE` (`BookingModal.tsx` ~497).
  - The plan's own `CancelSessionDialog` sends **no reason code** (`PlanModal.tsx` ~1209).
- **Effect:** T3 (+1 week when the school cancels a course class) works through the API (3b, 4 above) but **an admin cannot do it from the screen**: the customer's "15" can't be produced by her team. And «ปัญหาจากทางเรา» shows exactly where it adds no week (single / voucher / trial / other).
- 📌 The commit message of `826d42f` describes the opposite of the code ("Added SCHOOL_ISSUE to END_COURSE_REASONS … Modified SESSION_CANCEL_REASONS to exclude SCHOOL_ISSUE … Pre-selected SCHOOL_ISSUE"). The CODE and the SCREEN agree with the brief on both of these: end-course has 3 reasons, nothing pre-selected. Only the message is wrong. It is not a fault, but anyone reading the git log will be misled.

## Notes (not faults)
- The API course object still carries `leaveUsed / leaveQuota / leaveRemaining / leaveLocked / adminUnlocked` (e.g. C4 `leaveUsed 2, leaveQuota 1, leaveLocked false`). Nothing locks and no screen shows them; just a leftover in the response.
- The parent's LINE picker prompt reads in English (*"Pick class to request leave 👇"*) for a TH-set parent. The refusal itself is TH. Probably pre-existing.
- The camp/leave refusal now reads *"ครู qatt75b ลาวันที่ 2026-10-26 — เพิ่มคาบกับครูในวันนั้นไม่ได้…"*: the space and «ในวันนั้น» I flagged on 05/10 are fixed (TASK-659).

## Footprint (all QA, sid)
- **Kept as live examples until the round closes:** C4, C6, C10, C4n, P4 (ids above).
- The qatt75b leave days 26/10 and 02/11 were **lifted** (200).
- Phone: `leave` + one picker tap, as the QA parent. Nothing else changed.

## F1 re-test: `TASK-694` (front-only redeploy) ON THE SCREEN · 2026-10-07 · headless
Fresh started courses (first class Mon 05/10, attended): **C10b `19463198-f3c9-4395-a4d6-28f6d59edca3`** (qakid3, 10 × Mon 14:00, base 28/12) · **C6b `5f0595b6-2663-4d20-9943-87bdb956adcc`** (campkid2, 6 × Mon 15:00, base 23/11). Every cancel was done through **Bookings → the card → จัดการแผน → the row's จัดการ → ยกเลิกคาบ**.
| check | seen | |
|---|---|---|
| The course-class cancel dialog | *"ยกเลิกคาบเรียนนี้ … คาบนี้จะถูกยกเลิกและมีคาบชดเชยคืนให้ — คอร์สยังคงจำนวนคาบเท่าเดิม"* + **ONE checkbox «ปัญหาจากทางเรา», OFF by default**, hint *"เลือกข้อนี้เมื่อคาบถูกยกเลิกเพราะทางเรา — ระบบจะขยายอายุคอร์สให้ 1 สัปดาห์"*; 0 radios | ✅ `694-3b-s4-ticked.png` |
| **3b**: C10b sessions 4 (26/10) and 5 (02/11), box TICKED | 28/12 → **04/01** (wk 14) → **11/01/2027 (wk 15)**: **+14, her "15"**; make-ups 14/12 and 21/12; notice "ยกเลิกคาบแล้ว" | ✅ |
| **4**: C6b session 4 (26/10), box TICKED | 23/11 → **30/11 (wk 9)**: **+7**; make-up 16/11 | ✅ |
| C6b session 5 (02/11), box **UNticked** | expiry stays **30/11**: **+0**; make-up 23/11 still booked | ✅ `694-4-s5-unticked.png` |
| The NON-course cancel dialog (a fresh SINGLE_SESSION, qakid3 21/10 15:00) | *"ยกเลิกการจองนี้?"*: reasons **ลูกค้าเปลี่ยนกิจกรรม · ลูกค้าไม่เอาแล้ว · แอดมินคีย์ผิด**, none pre-selected; **no «ปัญหาจากทางเรา», no week hint** | ✅ `694-non-course-dialog.png` |
| GROUP series cancel-all with the box ⇒ each seat's course +7 | ⚪ **not run**: no QA group with course-holding seats on sid; Porter's ask did not include it. I can build one on request. | ⚪ |
**⇒ F1 FIXED on the screen.** My first unticked attempt opened the older C6 (`fd37d7c1`, same expiry 30/11, its 02/11 already cancelled), so the menu had no cancel and nothing was clicked. Re-done on C6b.
**Footprint:** C10b and C6b kept with the gate courses; the single `09a79f78` was cancelled (cleanup, 200).

## GROUP series cancel-all with the box, ON THE SCREEN (Porter's ask, 10-07) · headless
**Fixture (built for this):**
- **QA-Group-080A** (`5f6f5403-ba33-436b-b3e7-04bd287a75f5`, qatt75b, Thu 16:00, cap 4): 3 seat courses, 6 classes each from 15/10, seated on all 6 dates: qakid3 `c7cb3c79`, campkid2 `613a7b9b`, QAChatTwo `a8b4e457`.
- **QA-Group-080B** (`9df01b24-1202-4053-819f-fd36a58e29da`, Thu 17:00): 1 seat course, QAChatOne `e0bdba00`.
- All confirmed; every expiry at sale **03/12** (15/10 + 49).

**Path:** Calendar → week of 15/10 → "Series in range" → the series → **ยกเลิกทั้งชุด** → the dialog.
| check | seen | |
|---|---|---|
| The cancel-all dialog | *"จะยกเลิก 10 วันที่ใช้งานอยู่ … ที่นั่ง 18 ที่ของนักเรียน 3 คน…"* · reasons ลูกค้าเปลี่ยนกิจกรรม · ลูกค้าไม่เอาแล้ว · แอดมินคีย์ผิด + **checkbox «ปัญหาจากทางเรา», OFF by default**, hint *"…ระบบจะขยายอายุคอร์สให้ 1 สัปดาห์"* | ✅ `694-group-A-ticked.png` |
| **A, box TICKED** ⇒ each seat's course +1 week PER SEAT cancelled (6 seats ⇒ +42 days; computed by hand BEFORE the click) | **all three: 03/12 → 14/01/2027**; all 6 seat rows of each CANCELLED | ✅ |
| **B, box UNticked** (reason ลูกค้าไม่เอาแล้ว) ⇒ +0 | **03/12 unchanged**; toast *"ยกเลิกแล้ว 6 วัน · ที่นั่ง 6 ที่ · แจ้งครอบครัวแล้ว 1 ครอบครัว (6 ข้อความ)"* | ✅ `694-group-B-unticked.png` |
**⇒ The box takes on the group cancel-all, and only when ticked.**

🟠 **Two things for the SA (not the checkbox):**
1. **Where the re-owed make-ups land after a group cancel-all.** Each seat's make-ups became one-to-one sessions in the course's own slot (qatt75b Thu 16:00). With **three kids sharing that one coach slot**, the 18 make-ups queue three weeks apart:
   - qakid3: 31/12 · 21/01 · 11/02 · 04/03 · 18/03 · 08/04
   - campkid2: 24/12 · 14/01 · 04/02 · 25/02 · 01/04 · 22/04
   - QAChatTwo: 07/01 · 28/01 · 18/02 · 11/03 · 25/03 · 15/04

   So **4 of each family's 6 make-ups fall PAST the new expiry 14/01**, running to April (created + admin told, per 657). Group B's single kid got weekly make-ups 26/11–31/12, which is the contrast. Is "a cancelled group ⇒ N private make-ups for the same coach slot, serially" the intended model?
2. With the box ticked, the three reason radios **stay visible and selectable**. The code lets the box win (`chosen = ourSide ? SCHOOL_ISSUE : reason`), but an admin who ticks the box AND picks a radio can't see which one is sent.

📌 **My slip, declared:** while finding which sizes a group course accepts, my two "probe" calls **created** two real QA courses in group A (6- and 10-class, qakid3, `ec5969f2`, `6f5c955f`). Both were cancelled at once (200). Selling them also extended the series to 17/12 (the later dates hold only those cancelled seats). No real family is involved; sid only.
**Footprint:** QA-Group-080A/B and their 4 seat courses kept as examples; probe courses cancelled.

## `TASK-695` re-look (front redeploy) · 2026-10-07 · headless, nothing confirmed
Fixture: **QA-Group-080C** (`172e2375-9aa0-4330-b263-fd5462efc79c`, one date, no seats). Calendar → Series in range → ยกเลิกทั้งชุด; read and closed with **ยกเลิก**; afterwards cancelled by API (ADMIN_ERROR, cleanup).
| step | radios | box | Confirm |
|---|---|---|---|
| opened | 3 enabled, none checked | off | shut |
| pick แอดมินคีย์ผิด | แอดมินคีย์ผิด checked | off | enabled |
| **tick the box** | **all 3 DISABLED, none checked** (the earlier pick CLEARED) | on | enabled |
| try to pick ลูกค้าไม่เอาแล้ว while ticked | **not selectable** | on | enabled |
| **untick** | 3 enabled, **none checked** (the earlier pick NOT revived) | off | **shut** |
On screen the disabled radios are clearly greyed. `695-ticked.png`, `695-unticked.png` · ✅ **PASS**.
📌 **Correction to my own finding 2:** in that run I only COUNTED the radios ("radios visible 3"); I did not check whether they were disabled. So "stay selectable" claimed more than I had measured. Fern says `disabled` was already there since 694. **What 695 really fixed, and I have now seen work: the earlier radio choice is cleared on tick and not revived on untick.** Lesson for me: "selectable" is checked by trying to select, not by counting.
