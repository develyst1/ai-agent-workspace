# TEST-078: both-teams batch on sid (`DEPLOY-sid-2026-10-05.md` §7 + `HANDOFF-teamB-next-batch-2026-10-05.md` "For QA"), 2026-10-05 00:40–02:31

**Tester:** Tanya (QA) · **Env:** sid only (https://som.develyst.online). 🚫 Nothing on uat. · **Evidence:** `project-docs/qa-2026-10-05/`
**Scope:** TASK-645 (LAST badge) · 644+662 (a new student needs a parent phone) · 663+664 (no-parent tag + People filter) · 660 (digit search) · 661 (check-in sentence).

## Summary
| # | Item | Verdict |
|---|---|---|
| 1 | 660: a digit search no longer floods the list | ✅ PASS |
| 2 | 644: a new student with no phone is refused, nothing created; with a phone it gets a parent; imports exempt | ✅ PASS (5 of 5 routes) |
| 3 | 663: `?noParent=true` | ✅ PASS |
| 4 | **645: LAST badge on a CHECKED-IN final session, day + week grid** | ✅ **PASS, seen on screen** |
| 5 | 645: sick leave on the final date ⇒ no badge; a make-up carries it; the lesson before carries it when nothing is after | ✅ PASS |
| 6 | 645: NO_SHOW on the final date keeps the badge | ⚪ **Could not run**: sid has 0 NO_SHOW rows, and nothing can write one today (see 6) |
| 7 | 645: the plan's displayed END date unchanged for an all-attended course | ✅ PASS (rule untouched; see 7) |
| 8 | 662 on screen: New course / New voucher / booking modal / OTHER / Import | ✅ PASS · 🟠 2 copy notes |
| 9 | 664 on screen: picker tag + People filter | ✅ PASS |
| 10 | Refusals that are NOT the student phone read as before | ✅ PASS (leave ×2) · ⚪ swap/rate not reproduced (see 10) |
| 11 | 661 check-in sentence A′ on the phone | ✅ PASS (both replies) |

## 1 — 660 digit search (`GET /api/bookings`, range 01/09–30/11, limit 200)
No `q`: total **1385**. `q=2` ⇒ **149**, all names or titles that contain a "2" (campkid2 37, "28-2 Oct" 45, "12-16 Oct" 30, …), so it no longer returns the whole roster. `q=Ari3y` ⇒ 7 · `q=081` (phone) ⇒ 125 · `q=089999` (the QA parent phone) ⇒ 6 · `q=Aileen` (name) ⇒ 60 · `q=Aileen 2` (name + digits) ⇒ 0, which matches names only, as intended.

## 2 — 644 (API)
| Route | No phone | With phone (`08999907xx`, QA) |
|---|---|---|
| `POST /bookings` | **400 `VALIDATION`**, `details[0].path = ["student","phone"]`, message *"นักเรียนใหม่ต้องมีเบอร์โทรผู้ปกครอง (อย่างน้อย 9 หลัก) — ถ้าเป็นนักเรียนที่มีอยู่แล้ว ให้เลือกจากรายชื่อแทน"*; student rows with that name: **0** | 201; the new student HAS a parent (`a3d2b1a6…`) |
| `POST /courses` | the same 400, same path, 0 rows | 201; has a parent (`c97526ca…`) |
| `POST /vouchers` | the same 400, same path, 0 rows | 201; has a parent (`fcbb4744…`) |
| `POST /courses/import` | **201 accepted** (owner's exemption); student `parentId null` | — |
| `POST /vouchers/import` | **201 accepted**; student `parentId null` | — |

## 3 — 663 `GET /api/students?noParent=true`
⇒ 200, **14 rows, every one with `parentId null`, none archived** (QA fixtures: QA-diag-*, QA-req07x-*, plus my two import students). The unfiltered list (180 rows) holds **exactly 14 parentless**, the same set. `noParent=false` ⇒ 200 · `noParent=yes` ⇒ 400 (the strict "true/false" pattern).

## 4–7 — TASK-645 the LAST badge
**Fixtures** (qatt75b, Private SURFSKATE, 4 classes, Mondays 07/09 → 28/09, all in the past so they could be checked in):
- **L1** `e3c2d430` (qakid3, 10:00);
- **L2** `51ff30df` (campkid2, 11:00).

A first fixture at 08:00 (`24fe18f7`) never showed on the grid because the day grid runs 09:00–17:00 (my mistake, not a defect). It is cancelled.
**API** = `GET /calendar?date=…&view=day|week` → the row's `courseLast`. **Screen** = Schedule, filtered to qatt75b, the `LAST` stamp on the cell.

| Case | API (day + week) | Screen |
|---|---|---|
| **4.** L1, all 4 checked in (`attend` ×4 ⇒ 200). **The final 28/09 is ATTENDED** | **`courseLast=true`** on 28/09 in both reads; 21/09 `false` | ✅ **Day grid:** qakid3 10:00 (green ATTENDED) shows **LAST**. ✅ **Week grid:** *"10:00 · qakid3 · LAST · Course"*. `LAST-0928-day.png`, `LAST-0928-week.png` |
| Before check-in (same course, CONFIRMED) | `courseLast=true` on 28/09 | — |
| **5a.** L2: 1–3 attended, **sick leave on the final 28/09** ⇒ a make-up appended on 05/10 11:00 (EXTENDED) | 28/09 SICK_LEAVE `false` · **05/10 make-up `true`** · 21/09 `false` | ✅ Week 28/09: campkid2 11:00 **no stamp**. ✅ Day + week 05/10: the make-up shows **LAST**. `LAST-1005-day.png`, `LAST-1005-week.png` |
| **5b.** …the make-up cancelled | The plan **re-issued** a new make-up at once (`726923b7`, same slot), and it carries `true`. *The plan keeps 4 deliverable classes; an admin cancel cannot leave a sick-leave as the final.* | — |
| **5c.** …the course **ended early** (`POST /courses/51ff30df/cancel` ⇒ 200), so nothing live is after the sick leave | **21/09 ATTENDED `true`** · 28/09 SICK_LEAVE `false` | ✅ **Day 21/09:** campkid2 11:00 shows **LAST**; qakid3 10:00 (not its last) has none. ✅ Week 21/09: the same. `LAST-0921-day.png`, `LAST-0921-week.png` |

**6 — NO_SHOW ⚪ could not run.**
- `GET /bookings?status=NO_SHOW` over 2024–2027 on sid ⇒ **total 0**.
- And nothing can create one: `jobs.service.ts` has written ATTENDED instead of NO_SHOW since TASK-180, and no screen or route sets it (`updateStatus` actions are confirm / attend / sick-leave / cancel).
- So the "NO_SHOW keeps the badge" rule is covered by the unit set (`645` 7/7) and the code (`isCourseLast` accepts `COURSE_DELIVERED`), **not by a value on sid**.
- To see it: a **DATA REQUEST** for the owner to set ONE QA row on sid to NO_SHOW, e.g. L1's final `2b36fa9a` (28/09). Then I read the badge.

**7 — the plan's END date ✅.**
- `GET /entitlements/:id/plan` → `liveEndDate`: L1 (all attended) **`null`**; its untouched twin L2 before any action **`2026-09-28`**.
- `deriveLiveEndDate` (the plan's displayed end, live rows only) has **not changed in this batch**: its last commit is `0c0facb`, long before it. The badge reads its OWN function (`deriveLastLessonDate`).
- So the plan end behaves exactly as before. For an all-attended course it is null, and the modal falls back to its own rule. 📌 The badge moving never moved the plan end.

## 8 — 662 on screen (TH)
| Screen | New name, empty phone | 5 digits | 10 digits | Existing student (QA Kid Three) |
|---|---|---|---|---|
| New course (`สมัครคอร์ส`) | label **"เบอร์ผู้ปกครอง *"** (no "(ถ้ามี)"), error *"นักเรียนใหม่ต้องมีเบอร์ผู้ปกครอง เพื่อให้ผู้ปกครองเห็นคลาสของน้องใน LINE ได้"* | error stays | error gone | **no phone field** |
| New voucher (`ออกวอยเชอร์`) | same label + error, **ออกวอยเชอร์ disabled** | disabled | **enabled** | no phone field, enabled |
| Booking modal (calendar cell, 20/10 13:00, qatt75b) | same label + error, **บันทึก disabled** | disabled | **enabled** | no phone field, enabled |
| Booking modal, **อื่นๆ** | no student: no phone field, no error. New name: the required phone field + error appear; บันทึก stays **enabled** (the picker is optional there, by design). **Pressing บันทึก ⇒ the server refuses** and the screen shows *"จองวันที่นี้ไม่ได้ / นักเรียนใหม่ต้องมีเบอร์โทรผู้ปกครอง (อย่างน้อย 9 หลัก) — ถ้าเป็นนักเรียนที่มีอยู่แล้ว ให้เลือกจากรายชื่อแทน"*: the specific sentence, **not** "ข้อมูลที่กรอกไม่ถูกต้อง". Nothing was created (0 students, 0 bookings on 20/10). | | | |
| **Import** (`เรียนอยู่แล้ว (ย้ายข้อมูล)`) | label **"เบอร์ผู้ปกครอง (ถ้ามี)"**, **no error** at any phone length | | | |
Shots: `662-*.png`.

🟠 **Copy notes (non-blocking, for Porter to judge):**
- (a) On the OTHER refusal the notice's TITLE is *"จองวันที่นี้ไม่ได้"* ("can't book this date"), but the problem is the phone, not the date.
- (b) The same rule shows **two different sentences** on one screen: the field says *"…เพื่อให้ผู้ปกครองเห็นคลาสของน้องใน LINE ได้"*, while the server's refusal says *"…(อย่างน้อย 9 หลัก) — ถ้าเป็นนักเรียนที่มีอยู่แล้ว ให้เลือกจากรายชื่อแทน"*. Which one is "the approved sentence" for the refusal?
- Not checked: the Import Save with a new name and no phone. Its Save was disabled only because the other import fields were empty. The import's acceptance is proven on the API (§2), not by saving on screen.

## 9 — 664 on screen
- **Picker:** typing "QA-req074-iso" ⇒ the option *"QA-req074-iso | ยังไม่มีผู้ปกครอง"* (1 `data-no-parent-tag`, grey). **Picking it works** (the input holds the name). The parented row "QA Kid Three (0812345671)" has **no tag** (0). `664-picker-tag.png`
- **People:** the switch *"นักเรียนที่ยังไม่มีผู้ปกครอง"* is **off by default**, and with it off the page is the normal parent list (150 parents) with the explainer shown **0 times**.
- **Switched on:** the label reads **"(12)"** (the API's 14 minus the 2 import students I archived). The explainer *"นักเรียนในรายการนี้ ผู้ปกครองจะไม่เห็นคลาสใน LINE จนกว่าจะผูกกับผู้ปกครอง"* appears **once**. The rows are name + "—" with **no action buttons**; the only buttons on the page are the page-level menu, วันเกิด and เพิ่มผู้ปกครอง. `664-people-off.png`, `664-people-on.png`

## 10 — Refusals that are NOT the student phone
- **Admin leave, today (API):** `400 VALIDATION` *"บันทึกวันลาแทนครูได้เฉพาะวันถัดไปเป็นต้นไป — ถ้าต้องการยกเลิกคาบของวันนี้ กรุณาจัดการรายคาบในปฏิทิน"*, **word for word as recorded in TEST-077**.
- **The coach's own door, on screen** (qa-coach-qatt75, 29/10, reason "ab"): the server refuses on a DIFFERENT path, and the screen shows the generic *"ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง"*, as before. Team B's branch did not catch it. Nothing was recorded (my leave on 29/10: empty). `REF-coach-leave-short-reason.png`
- ⚪ **Swap / rate (`RATE_REQUIRED`) not reproduced.** TEST-077's QA series fixtures are cancelled. A no-rate swap on a REAL series is a write if it is not refused, so I did not use one.
  - What is known: that refusal has a different code (`RATE_REQUIRED`, not `VALIDATION`), and the new branch only reads `VALIDATION` at exactly `["student","phone"]`.
  - I can rebuild a QA series and show it on your word.
- 🟠 Pre-existing, not this batch: the coach's door lets a 2-letter reason through to the server, and the answer is the generic line, not "at least 3 characters".

## 11 — 661 on the phone (Redmi, demo OA "SOM-Balance-Demo", linked as QA parent 0899990763; its children QAChatOne/QAChatTwo have **no class today**, checked first)
- `checkin` ⇒ *"วันนี้ไม่พบคลาสที่ยืนยันแล้วสำหรับบัญชีนี้ค่ะ หากน้องมีเรียนวันนี้ รบกวนติดต่อแอดมินเพื่อตรวจสอบก่อนเช็คอินนะคะ / We couldn't find a confirmed class for today on this account. If your child has a class today, please contact the admin to check it before checking in."*
- `qr` ⇒ the **same** two lines.
- Both are word for word A′ (`line-i18n.ts` `empty_checkin` / `qr_none`). `661-checkin-reply.png`, `661-qr-reply.png`
- 📌 I triggered both by the chat commands (`checkin`, `qr`), which reach `doCheckin` / `doQr`. I did **not** point the camera at a printed shop QR.

## Footprint
- ✅ **Cancelled:** booking `65b12efd`; courses `b1c75149`, `00b7dfd4` (import), `24fe18f7` (08:00 fixture), `51ff30df` (L2, ended early: the 5c case itself); vouchers `af738909`, `e0b6f96c` (import).
- ✅ **Archived (not deleted):** students QA NoPhone 078 B/C/V and QA Import 078 C/V; the three parents created for B/C/V (`a3d2b1a6`, `c97526ca`, `fcbb4744`).
- **Kept as a live example:** course **`e3c2d430`** (L1, qakid3/qatt75b, all 4 attended, LAST on 28/09). Also the candidate row for a NO_SHOW DATA REQUEST. Cancel on your word.
- No leave days recorded. Phone: two chat messages (`checkin`, `qr`) to the demo OA from the QA parent account; nothing else changed. Nothing on uat.

## §10 re-test — TASK-654 after the sid front redeploy · 2026-10-05
| Check | Verdict | Evidence |
|---|---|---|
| **อื่นๆ Save gate** (title filled "QA TEST-078 654 gate", so only the student decides) | ✅ **PASS, 5 of 5** | NO student ⇒ **บันทึก enabled** · NEW name, no phone ⇒ **disabled** (field error shown) · NEW name, `12` ⇒ **disabled** · NEW name, `0899990799` ⇒ **enabled** · EXISTING "QA Kid Three" ⇒ **enabled** (no phone field). Since Save is shut, the server's second sentence can no longer appear: **one sentence for one rule.** `654-other-1/2/3-*.png` |
| **Neutral refusal title** on a LESSON tab | ✅ **PASS** | Calendar → qatt75b 20/10 13:00 → existing QA Kid Three. Then (API) qatt75b's leave recorded for 20/10, then บันทึก ⇒ the server refused. Alert: **"บันทึกไม่สำเร็จ"** / *"ครูqatt75b ลาวันที่ 2026-10-20 — เพิ่มคาบกับครูวันนี้ไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น"*. The title no longer blames the date; the line beneath names the real cause (the coach's leave). Nothing was created (qatt75b bookings on 20/10: 0); the leave was lifted (200). `654-lesson-refusal-title.png` |
📌 **How the refusal was forced:** on a leave day the calendar offers NO add-booking buttons (the screen blocks it first). So I opened the modal on a normal day and recorded the leave AFTER, and the server is what refused.
🟠 **Reading that body under the neutral title** (your ask, against @Fern's table). It names its cause correctly, but two small things are in the sentence itself (back-end text, not TASK-654): **"ครูqatt75b"** has no space between ครู and the name, and **"เพิ่มคาบกับครูวันนี้ไม่ได้"** says *today* about a future date (20/10).

## NO_SHOW follow-up — after the owner's DATA REQUEST (`UPDATE 1` on sid) · 2026-10-05
⚠️ **Data note for the next reader:** row **`2b36fa9a-5c7d-4117-ac7b-2f19a03f3d10`** (course `e3c2d430`, QA Kid Three / qatt75b, Mon 28/09/2026 10:00) was set to **NO_SHOW by the owner's DATA REQUEST** (SQL), not by any screen. **It is LEFT as NO_SHOW** — no screen restores it (see below), and Porter ruled no second request.
| Check | Verdict | Evidence |
|---|---|---|
| **The LAST badge stays on a NO_SHOW final** | ✅ **PASS** | API `GET /calendar` day + week: 28/09 **NO_SHOW `courseLast=true`**; 21/09 `false`. **Day grid:** the red NO_SHOW cell qakid3 10:00 shows **LAST** (`LAST-0928-noshow-day.png`). **Week grid:** *"10:00 · qakid3 · LAST · Course"* (`LAST-0928-noshow-week.png`). |
| **The plan's displayed END date is unchanged by the status change** | ✅ **PASS** | `liveEndDate` **null** before (all ATTENDED) and **null** after (NO_SHOW). Manage plan header: **"No upcoming sessions"**, no end date, the same as for the all-attended course. Rows: 07/09, 14/09, 21/09 ATTENDED · **28/09 NO-SHOW**. `NOSHOW-manage-plan.png` |
| **Counters for a NO_SHOW** (read, no expectation given) | 📖 read | Card (Completed tab): **COMPLETED · 4/4 sessions · Leave quota 1 left · "Used 0/1 · extendable to week 5" · Expires 2026-10-05**. API: `usedSessions 4`, `leaveUsed 0`, `status COMPLETED`. ⇒ **the NO_SHOW counts as a DELIVERED session (consumes one of the 4), NOT as a leave** — consistent with the quota rule that `{ATTENDED, NO_SHOW}` consume. `NOSHOW-course-card.png` |
🟠 **One line that reads wrong (likely pre-existing, not this batch):** the Manage plan of this **COMPLETED** course says *"This course was cancelled, so sessions can no longer be added or changed."* — the course was not cancelled; it finished.
🟠 Small: the grid legend lists CONFIRMED / ATTENDED / PENDING / ON LEAVE / EXTENDED / AWAITING RESCHEDULE but **no NO-SHOW**, so the red cell has no legend entry (historic status; cosmetic).
**Restore to ATTENDED from a screen: not possible** — no screen sets this status (`updateStatus` has confirm / attend / sick-leave / cancel; the day-end job no longer writes NO_SHOW), and the plan is closed ("sessions can no longer be added or changed"). Left as NO_SHOW, per Porter.
