# TEST-108 — REQ-123 full gate on sid (back `7d39cbf` · front `a289bca` · migration 0070 · journal 71)

**Tester:** Tanya (QA) · **Date:** 2026-10-18 · **Env:** sid, headless · **Brief:** `inbox/QA.md` → "⏸️ REQ-123 FULL gate (TEST-108)" + "▶️ GO TEST-108" · `DEPLOY-REQ-123-teacher-leave-release-2026-10-17.md` §4 · copy: `COPY-DRAFT-REQ-123-phase1-2026-10-17.md` (approved)
**Verdict: ✅ PASS on the behaviour, with 1 🔴 copy finding (F1) and 2 points I could not prove on sid (L1 LINE, L2 permission user).** Nothing is sent to Khwan. Evidence: `project-docs/qa-2026-10-18/test108/`.

## 1. Khwan's case again (813 + P1)
Recipe: New course → weekly Saturdays from **Sat 7 Nov 15:00** → Generate plan. qatt75 / QADT2 have leave on 7 Nov.

| Case | Seen | |
|---|---|---|
| **The preview warns** (P1) | An alert inside the plan: **"A class falls on qatt75's leave day — Sat 07/Nov/26 is a leave day for qatt75, so this course can't be created yet. Mark it as a planned absence and a make-up is added at the end."**, with ONE button **"Planned absence"** in it (`p1-private-warning.png`). Approved text, verbatim. | ✅ |
| **One click marks it** | The warning becomes the calm note **"Sat 07/Nov/26 is on qatt75's leave day and is marked as a planned absence — that's fine."** The row shows ON LEAVE, 05/Dec is appended, and the footer reads "New plan: 4 sessions · absent 1 · ends 05/Dec/26" (`p1-private-ticked-calm-note.png`). | ✅ |
| **Ticked → created**, Private | **201**, "Course registered · Created 5 weekly sessions", course `012e0059` | ✅ |
| **Ticked → created**, DUO (QADT2, QAChatOne + QAChatTwo) | the same warning/calm note with QADT2 → **201**, course `1b4588e7` | ✅ |
| **Not ticked → still refused**, Private and DUO | **409 `TEACHER_ON_LEAVE`** «ครู qatt75 ลาวันที่ 2026-11-07 — เพิ่มคาบกับครูในวันนั้นไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น» (QADT2 the same). The warning stays above the refusal. | ✅ |

## 2. 814 / P4: the calendar leave strip opens the panel
Calendar → Daily **Thu 19 Nov** → the chip **"qatt75b is away — 3 class(es) to handle"** (now clickable) → the panel **"qatt75b's leave"** (`p4-panel.png`):
- the approved note ("This only shows and cancels the leave…");
- `Reason: QA TEST-108 p2-range`;
- **each day of the range**, for example:
  - **Thu 19/Nov/26** · 3 class(es) booked · Cancel leave;
  - `10:00 – 11:00 · QAChatOne + QAChatTwo · Duo SURFSKATE · PENDING · Open`;
  - `13:00 – 14:00 · qakid3 · Private SURFSKATE · CONFIRMED · Open`;
  - `18:00 – 19:00 · QA-094 F1 · CONFIRMED · Open`;
  - Fri 20/Nov · Nothing booked · Cancel leave;
  - Sat 21/Nov · 2 classes …;
- then "THU 19/NOV/26 – SAT 21/NOV/26 · **Cancel all future days**", and **"See all teacher leave →"** (`/scheduler/teachers#teacher-leave`).

| Action | Seen | |
|---|---|---|
| **Open** | opens the **real booking** dialog (QAChatOne & QAChatTwo · Duo SURFSKATE · 2026-11-19 10:00 – 11:00 · PENDING), with its own buttons (`p4-open.png`) | ✅ |
| **Cancel one day** (Fri 20 Nov) | confirm **"Cancel qatt75b's leave on 2026-11-20? That day opens for bookings with this teacher again. Existing classes don't change. The teacher is told on LINE." [Keep leave] [Cancel leave]** → toast **"Leave cancelled — the teacher has no LINE link, please tell them yourself"** → 20 Nov leaves the panel | ✅ |
| **Cancel all future days** | confirm **"Cancel qatt75b's leave from Thu 19/Nov/26 to Sat 21/Nov/26? The days still ahead open … The teacher is told on LINE."** → the same toast | ✅ |
| **Today / past cannot be cancelled** | Past (Bank 10 Oct): the panel and the list show **no Cancel** at all. **Today:** there is no today leave on sid to try. The admin's door refuses to record one (§7a), and the teacher's door on today would cancel QA classes and tell families, so I did not. The server's "today/past refused" text was **not exercised** (no button reaches it). | ⚪ L3 |

## 3. P2: a range leave
| Check | Seen | |
|---|---|---|
| 3 days = **one record, one reason** | Calendar 19 Nov → Record teacher leave → qatt75b · Date 19 Nov · **To 21 Nov** → hint "Recording leave for qatt75b blocks all **3** days …", button **"Block these 3 days for qatt75b"** → **ONE** `POST /teacher-leave-days` `{from:"2026-11-19", to:"2026-11-21", reason}` → 200, `mode advance-range`, one `rangeId`. The result lists each day **RECORDED** with its classes (`p2-range-03-result.png`). | ✅ |
| A day already on record is skipped | qatt75 range **9–12 Nov** (9, 10, 11 already recorded) → 9/10/11 **"ALREADY ON RECORD — THE FIRST ENTRY STANDS"**, 12 Nov **"RECORDED"** | ✅ |
| **32 days refused** | QACT 1 Dec → 1 Jan: refused (`400 VALIDATION`), but **see F1**: the screen shows the generic sentence, not the approved one | 🔴 F1 |
| **One LINE to the teacher** (record and cancel-all) | No QA teacher has LINE linked on sid (`lineLinked: none`). The screen says so honestly ("…has not been told — their LINE account is not linked" / the toast above), and the server answers `teacherNotified 0`. **Not observable.** | ⚪ L1 |

## 4. P3: the affected classes with child + program + link
- **In the panel (P4): ✅.** Child (+ co-child), program, time, status and **Open** on each class.
- **In the save result of the record dialog: time only.** For example `Thu 19/Nov/26 RECORDED 3 class(es) booked 10:00 – 11:00 13:00 – 14:00 18:00 – 19:00`, with no child, no program and no link, and the only button is Close. The server's reply carries `childName`, `coChildName` and `program` for each class. 🟡 F2. Whether the brief meant this screen too is Porter's call; the panel, one click away, has it.

## 5. P5: "Teacher leave" on the Teachers page
`/scheduler/teachers#teacher-leave` opens scrolled to **"Teacher leave"** with **Upcoming | Past** (`p5-list-upcoming.png`, `p5-list-past.png`):
- **Upcoming:** per teacher, each day as `Sat 31/Oct/26 · 1 class(es) booked · <reason>` with **Cancel leave** (and **Cancel all future days** on a range).
- **Past:** Bank 10/10 & 9/10, Kwan 4/10 with their reasons and **no Cancel**.
- **Reachable from the calendar:** the panel's "See all teacher leave →" ✅.

## 6. P6: the dialog's default date
| From | Seen | |
|---|---|---|
| Calendar, viewing **Thu 19 Nov** → "Record teacher leave" | **Date 19 Nov 2026** (the viewed day) | ✅ |
| Calendar, viewing **today** | Date 18 Oct 2026 (today, the viewed day), with the past/today refusal shown at once (§7a) | ✅ |
| Teachers → ⋮ → Record leave in advance | **Date empty**, never tomorrow | ✅ |

## 7. P7: the dialog says what saving will do
| Door | Seen | |
|---|---|---|
| **a.** Admin, today | The approved refusal is shown **before** saving: "This door records leave for a day that has not happened yet. For today or a past day, the classes have to be handled one at a time on the calendar, because cancelling them tells each family. **Pick a date after today**". **Block is disabled.** | ✅ |
| **b.** Teacher's own door (`qa-coach-qatt75` → Report leave), **future** 21 Nov | **"Saving only blocks the day for new bookings. 3 class(es) stay on the schedule for an admin to handle."** | ✅ |
| **c.** Teacher's own door, **today** (default) | **"Saving cancels 1 class(es) and tells their families."** (no family count, owner's A). **Not saved:** it would cancel a QA class and send a LINE. | ✅ |

## 8. The copy vs the approved draft
**58 of 62** approved strings (TH + EN, 817/816/818/820/821/819) are in the code **verbatim**: the two LINE lines, and every 816/818/820/821 string. The ones I saw on screen matched word for word (§1–§7).
- 🔴 **F1 — the range refusals don't reach the screen.**
  - For 32 days, the server answers `400 {"code":"VALIDATION","message":"ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง","details":[{"message":"ลาล่วงหน้าได้ไม่เกิน 31 วันต่อครั้ง","path":["to"]}]}`. The dialog shows **only the generic top-level sentence**, so the approved «ลาล่วงหน้าได้ไม่เกิน 31 วันต่อครั้ง» is never seen.
  - The **English** approved refusals ("The end date can't be before the start date", "A leave can cover at most 31 days at a time", "The leave range is not valid") **are not in the code at all** (front or back).
  - The form also does not refuse first: it offers **"Block these 32 days for QACT"**.
  - (The draft said "the form refuses first".)
- ⚪ Small wording notes (approved copy, so no change asked):
  - the single-day cancel confirm shows the date as **"2026-11-20"**, while the range confirm shows **"Thu 19/Nov/26"**;
  - the range result header still says **"No new class can be booked with qatt75b that day."** (singular) for 3 days;
  - the cancel confirm says **"The teacher is told on LINE"** even when the teacher has no LINE link (the toast then says otherwise).

## 9. Permissions: a Teachers-only admin can use the list and cancel
- `qa-nostatus-077` (menus **Schedule + Teachers**, **no action keys**): the "Teacher leave" list **loads**, with no 4xx, but shows **no Cancel**.
- That is by design: Cancel is gated on **`action:calendar.status`** (front `TeacherLeaveList.tsx:133`, `LeaveDayPanel.tsx:115`; back `DELETE /teacher-leave-days/…` = `act([...CAL_BOOK, ...TEACHERS], "action:calendar.status")`), and this user was built without it.
- 🟠 **L2: sid has no QA user with "Teachers menu + `action:calendar.status`, no Schedule menu"**, so "Teachers-only can cancel" is **unproved**. Creating that user or changing a user's keys is not mine to do. **DATA REQUEST to the owner** if he wants it proved: a sid user with exactly `menu:teachers` + `action:calendar.status`.

## Findings
| # | Sev | What |
|---|---|---|
| F1 | 🔴 | The approved range refusals (31-day limit, end-before-start) never show. The screen shows the generic «ข้อมูลที่กรอกไม่ถูกต้อง…»; the approved Thai sentence sits only in `details`. The EN versions don't exist. The form doesn't refuse 32 days before saving. |
| F2 | 🟡 | The record dialog's result lists affected classes by time only. The panel has child + program + Open; the result doesn't, although the server sends them. |
| L1 | ⚪ | "One LINE to the teacher" isn't observable: no QA teacher is LINE-linked on sid. The screen and server report "not told" correctly. |
| L2 | 🟠 | "A Teachers-only admin can cancel" is unproved: there's no such QA user (DATA REQUEST above). |
| L3 | ⚪ | Cancelling a today/past leave: past shows no Cancel ✅; the server's refusal text wasn't exercised (no today leave exists, and making one would notify families). |

## Data left on sid (QA only)
- **Courses:** `012e0059` (QAChatOne · qatt75 · from 7/11 15:00) · `1b4588e7` (DUO · QADT2 · from 7/11 15:00).
- **Leave:** qatt75 **12 Nov** (new, from the overlap test). qatt75b 19–21 Nov was **cancelled** again (20 Nov alone, then all future).
- Nothing on uat; no family notified (advance leave notifies none; the today door was not saved).

Scripts (scratchpad): `t107c.js` (P1), `t108b`–`t108g.js`.


---
# §re-check — F1 / F2 after TASK-822 (sid front `90a11da`) · 2026-10-18
**Verdict: ✅ both PASS.** All from the calendar's "Record teacher leave" dialog (QACT, then qatt75b). I watched the network for any `POST /teacher-leave-days`.

## F1: the range refusals, TH + EN
| Case | Language | Shown in the dialog | Submit | Request sent | |
|---|---|---|---|---|---|
| 32 days (1 Dec → 1 Jan) | EN | **"A leave can cover at most 31 days at a time"** | "Block these 32 days for QACT" **disabled** | **none** | ✅ |
| 32 days | TH | **«ลาล่วงหน้าได้ไม่เกิน 31 วันต่อครั้ง»** | «ปิดการจอง 32 วันของครู QACT» **disabled** | **none** | ✅ |
| End before start | EN | **"The end date can't be before the start date"** | "Block this day for QACT" **disabled** | **none** | ✅ |
| End before start | TH | **«วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม»** | «ปิดรับจองวันนั้นของ QACT» **disabled** | **none** | ✅ |

All four sentences are the approved ones, verbatim.
- **How end-before-start was reached:** the To picker greys out days before the From date, so it can't be picked directly. Set From 1 Dec, To 5 Dec, then **move From to 10 Dec**, and the refusal appears.
- ⚪ In that state the button's label falls back to the single-day wording ("Block this day…" / «ปิดรับจองวันนั้นของ…»). It stays disabled, so this is cosmetic only.

Screens: `rc-32days-EN-*`, `rc-32days-TH.png`, `rc-endbefore-TH.png`, `rc-endbefore-EN.png`.

## F2: the save result lists each class with child · program · status + Open
I recorded qatt75b **19–21 Nov** again. The result now reads, for example:
- `Thu 19/Nov/26 · RECORDED · 3 class(es) booked`, then:
  - `10:00 – 11:00 · QAChatOne + QAChatTwo · Duo SURFSKATE · PENDING · Open` (**DUO: both children**);
  - `13:00 – 14:00 · qakid3 · Private SURFSKATE · CONFIRMED · Open`;
  - `18:00 – 19:00 · QA-094 F1 · CONFIRMED · Open`;
- `Sat 21/Nov/26 · 2 class(es) booked …`.

There are **5 Open buttons**. **Open** on the first one opens the real booking (QAChatOne & QAChatTwo) (`rc-f2-03-result.png`, `rc-f2-04-open.png`). ✅
- **Cleanup:** the range was cancelled again from the panel (Cancel all future days → "Leave cancelled — the teacher has no LINE link…").

**Still open from the gate:**
- **L1:** LINE to the teacher isn't observable (no LINE-linked QA teacher).
- **L2:** the Teachers-only cancel waits for the owner's DATA REQUEST (the user is not mine to create).


---
# §uat — REQ-123 on uat, READ-ONLY (back `7d39cbf` · front `90a11da` · journal 71) · 2026-10-18
**Verdict: ✅ PASS.** Headless, logged in as admin.
- **Writes:** every non-GET was aborted (4 Cloudflare `cdn-cgi/rum` beacons). The **one exception** was **`POST /courses/preview`** ("Generate plan"). Before letting it through, I read the server code: `previewCoursePackage` only reads (`findFirst`), with no insert, update or delete. **1 call.**
- Nothing was saved, no Cancel was pressed, and nothing was created. No screenshot shows a family name: the one uat image is the warning box only.

| Check | uat | |
|---|---|---|
| **Build identity, back** | `GET /teacher-leave-days` items now carry **`rangeId`** (TASK-817), and each class carries **`childName · coChildName · program`** (TASK-820/822 data) | ✅ |
| **Build identity, front** | Calendar has the **"Record teacher leave"** button (TASK-818). The Teachers page has **`#teacher-leave` "Teacher leave"** (TASK-821). | ✅ |
| **The leave strip opens the panel** | Sun 8 Nov: chip **"Tarb is away — 2 class(es) to handle"** is clickable and opens **"Tarb's leave"**. It shows the approved note, `Reason: Coach Tarb ลา`, the day **Sun 08/Nov/26 · 2 class(es) booked · Cancel leave**, two classes (`12:00 – 13:00 · <child> · Private INLINE SKATE · CONFIRMED · Open`, `14:00 – 15:00 · <child> · Private SURFSKATE · CONFIRMED · Open`) and "See all teacher leave →". **Cancel was not pressed.** | ✅ |
| **"Teacher leave" on the Teachers page** | Upcoming: **Tarb** Sat 07/Nov · Nothing booked; Sun 08/Nov · 2 classes; Sun 22/Nov · 1 class; Sat 05/Dec · Nothing booked. All with reason "Coach Tarb ลา" and Cancel leave. | ✅ |
| **The create preview warns on a leave week** (Khwan's real case) | New course → any student → **Tarb** · Private SURFSKATE & SKATEBOARD · 6 sessions · **from Sat 7 Nov** → Generate plan shows **two** warnings: **"A class falls on Tarb's leave day — Sat 07/Nov/26 is a leave day for Tarb …"** and the same for **Sat 05/Dec/26**, each with **"Planned absence"** (`uat-preview-warning.png`, the box only). Closed with Cancel; **nothing created**. | ✅ |

📌 **For the customer message:** Tarb also has leave on **Sat 5 Dec**. A 6-week Saturday course from 7 Nov hits **both** days, so Khwan will see **two** warnings and must tick both.

## The 4 screenshots for Khwan (from SID, Thai UI, QA data only)
Folder `project-docs/customer-2026-10-18-teacher-leave/`:

| File | What it shows | KB |
|---|---|---|
| `1-create-warning-tick.png` | The plan of QAChatOne (qatt75 · Saturdays from 7 Nov) with the warning **«มีคาบตรงกับวันลาของครู qatt75 — วันที่ Sat 07/Nov/26 เป็นวันลาของครู qatt75 จึงสร้างคอร์สนี้ยังไม่ได้ …»** and its one-click button **«ไม่มาแน่นอน (ลาล่วงหน้า)»** | 77 |
| `2-leave-range-dialog.png` | «บันทึกวันลาของ qatt75b»: วันที่ 19 พ.ย. 2026 → **ถึงวันที่ 21 พ.ย. 2026**, the line **«การบันทึกลาของครู qatt75b จะปิดการจองใหม่ตลอด 3 วัน …»**, reason «ไปอบรมต่างจังหวัด», button **«ปิดการจอง 3 วันของครู qatt75b»** | 35 |
| `3-leave-panel-cancel.png` | «การลาของครู qatt75b»: each day, classes with child + program + status + «เปิดดู», «ยกเลิกวันลา» / «ยกเลิกวันลาที่ยังไม่ถึงทั้งหมด» | 60 |
| `4-teacher-leave-list.png` | Teachers page «การลาของครู» · «ที่จะถึง / ที่ผ่านมา», per teacher, with «ยกเลิกวันลา» | 73 |

- Names in the images: QA teachers (qatt75, qatt75b, QADT2) and QA kids (QAChatOne/Two, qakid3, "QA-094 …"). **No real family.**
- ⚪ **Image 4 shows the QA reasons** ("QA TEST-107 …") as the reason text. They're harmless, but test-looking. Say if you want a cleaner list (it would need the old QA leave days lifted first).
- ⚪ In Thai, the dates inside sentences stay "Sat 07/Nov/26". That's the approved format ("as the plan table shows it").
- **Cleanup on sid:** the qatt75b 19–21 Nov range recorded for images 2–3 was cancelled again afterwards.

Scripts (scratchpad): `u108a.js`, `u108b.js` (uat), `t108s.js` (screenshots).
