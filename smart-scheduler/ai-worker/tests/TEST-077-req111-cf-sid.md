# TEST-077: REQ-111 batch on sid (C: an admin records a teacher's leave · F: a free pre-start absence · group/series swap money fixes), 2026-10-04

- **Brief:** `inbox/QA.md` 10-04 (Porter).
  - QA line: `QA-LINE-REQ111-CF-2026-10-04.md`.
  - Deploy: `DEPLOY-sid-2026-10-04.md` (no migration, 65 = 65).
  - Local heads at test time: BE `17ac167`.
- **Order:** API routes → screens → LINE.
- **Remit (owner, 10-04):** full test (every API route, screens, phone, LINE OA); anything needing a live DB is QA's.
- **Superseded in the QA line:**
  - **§2.2 cap: GONE** (owner, same day). More absences than the quota must be ACCEPTED, and each pre-start absence extends the expiry by exactly 1 week.
  - **§1.1 today/past:** the admin door accepts FUTURE dates only (deploy §9).
- **Known and deliberate, NOT faults:**
  - the widened swap (choose which teacher goes out) is backend-only and inert;
  - the admin door refuses today/past.
- **Rules:**
  - sid only; nothing on uat.
  - Owner-level LINE accounts are the owner's to test.
  - No passwords in files.
  - Kwan's LINE is untouched.
- **Evidence:** `project-docs/qa-2026-10-04/`.

## Results
| Case | What | Verdict | Sent → got (code / words) |
|---|---|---|---|
| 1.1a | Admin POST, FUTURE date, unlinked coach qatt75b (21/10) | ✅ (one question) | `200` `mode:"advance"`, `cancelled:0`, `alreadyRecorded:false`, **that day’s class listed back** (`03713d0e` 10:00 CONFIRMED), **`teacherNotified:1`**. ❓ qatt75b has **no LINE link**, yet the count is 1 (it probably counts the SKIPPED row). See the screen check in Part 3. |
| 1.1c | The same day twice | ✅ | `200` `alreadyRecorded:true`, **`teacherNotified:0`** (no second notice). |
| 1.1b | TODAY / PAST on the admin door | 🔴 **conflicts with the deploy note** | 04/10 and 01/10 with no class ⇒ `200 {"cancelled":0,"bookingIds":[],"familiesNotified":0}`. With a fixture class for qatt75b today (`f9f73eed`, 21:30) ⇒ **`200 {"cancelled":1,"bookingIds":["f9f73eed…"],"familiesNotified":1}`**, and the class is **CANCELLED, `cancelReason TEACHER_LEAVE`**. This is the QA line’s §1.1 “cancelling branch” (and it cancelled the RIGHT teacher’s class), but **DEPLOY §9 and Porter say the admin door accepts FUTURE dates only**. The API does not refuse; only the dialog does (Part 3). See F1. |
| 1.6 | 🔴 `teacherId:"me"` | ✅ **400 (shape)** | `400 VALIDATION` *"ข้อมูลที่กรอกไม่ถูกต้อง…"*, details `path:["teacherId"]`, `"Invalid UUID"`. It is about the VALUE, not permission. **The near-miss has not come back.** |
| 1.1e | `teacherId:"abc"` | ✅ | `400 VALIDATION` Invalid UUID. |
| 1.1f | reason `"ab"` | ✅ | `400 VALIDATION` `too_small, minimum 3, path reason`. |
| 1.3 | Admin GET list | ✅ | No params ⇒ `200` (rows from today: Kwan 04/10 by kksom [real data, read only], qatt75b 21/10). `from>to` ⇒ `400` *"วันเริ่มต้องไม่หลังวันสิ้นสุด"*. Over 92 days ⇒ `400` *"ช่วงวันที่ยาวเกิน 92 วัน"*. **The row recorded in 1.1a appears** (15/10–31/10, `createdBy:"admin"`, its class listed). |
| 1.4 | The LINKED coach’s own three doors (qa-coach-qatt75) | ✅ | `POST /teachers/me/leave` 22/10 ⇒ `200` advance, its class listed, **`teacherNotified:0`** (no self-notice). `GET` ⇒ `200` `[{date:22/10}]`. `DELETE …/2026-10-22` ⇒ `200 {"lifted":"2026-10-22","teacherNotified":0}`. |
| 1.5c | A LINKED coach on the ADMIN routes | ✅ (wording note) | POST and DELETE ⇒ **`403 FORBIDDEN` *"ไม่มีสิทธิ์ทำรายการนี้"***; GET ⇒ **`403 SCOPE_TEACHER`** *"บัญชีครูทำได้เฉพาะดูตารางตัวเอง เช็คอิน และแจ้งลา"*. Refused, as required. 🟠 Only the GET gives the scope wording; the QA line expected “a scope refusal” for all three. |
| 1.5a | An admin WITHOUT `action:calendar.status` (qa-nostatus-077) | ✅ | POST ⇒ `403 FORBIDDEN`; DELETE ⇒ `403 FORBIDDEN`; GET ⇒ `200` (its key is `menu:calendar`, read only, by design). |
| 1.2 | Admin DELETE (lift) | ✅ | `200 {"lifted":"2026-10-21","teacherNotified":1}`; the list afterwards is `[]`; a repeat lift ⇒ `404 NOT_FOUND` *"ไม่พบวันลาล่วงหน้านี้"*. The teacher-told count is again 1 for an unlinked coach (see 1.1a). |
| 2.1 | Not-started course: declare an absence ⇒ accepted, make-up appended, leave count does NOT move | ✅ | Course `a795c3cd` (campkid2, 4 classes, Wed from 28/10, quota 1). Declare 28/10 ⇒ `200`, `plannedAtCreation:true`, make-up **25/11 EXTENDED** appended, **`leaveUsed 0/1`, remaining 1**, unchanged. |
| 2.2′ | (cap removed) More absences than the quota ⇒ ACCEPTED, no limit text | ✅ | Declares #2 (04/11) and #3 (11/11) ⇒ both **`200`**, free, with make-ups **02/12** and **09/12** appended; still **`0/1`**. **No refusal and no "limit" wording anywhere.** 3 declarations on a quota of 1. |
| 2.2″ | 🔴 Each pre-start absence extends the expiry by exactly ONE WEEK | 🔴 **FAIL — F3** | `a795c3cd`: expiry **25/11** at sale ⇒ **25/11 after #1, #2 and #3** (unchanged), while the make-ups sit on **25/11, 02/12, 09/12**, beyond the expiry. Re-checked on a 2nd fresh course `18386706` (qakid3, from 29/10) **on the COURSE CARD**: *"หมดอายุ 2026-11-26"* before **and after** 2 declarations (make-up 03/12 is past it). The card also still says *"ขยายได้ถึงสัปดาห์ที่ 5"* while the make-ups reach week 6. `F-1-card-before.png`, `F-2-card-after-2.png` |
| 2.3 | The at-cap refusal wording | ⚪ not applicable | The cap and its refusal were removed (TASK-643); I never met a refusal, as intended. |
| 2.5 | Start-date change on a not-started course: the free days stay free | ✅ (free half) · ⚪ charged half not constructible | `a795c3cd` start 28/10 ⇒ **04/11**: preview lists 7 moves, the 3 declared days `SICK_LEAVE→SICK_LEAVE`; applied ⇒ `200 {moved:7, startDate:2026-11-04, expiryDate:2026-12-23, previousExpiryDate:2026-11-25, needsReconfirm:1}`. Afterwards **all 3 still `plannedAtCreation` (free), `leaveUsed 0/1`**. The new expiry 23/12 = start + 7 weeks (4 + 3), so the start-date planner DOES count the declared days; the declare path alone does not (F3). **"Take one ordinary (charged) leave" on a NOT-started course could not be built:** every leave on an unstarted course is free by design (TASK-609 §1), and a started course can't have its start moved. |
| S1 | GROUP swap to a coach the group has NEVER paid, WITHOUT a rate ⇒ refused, NOTHING moves | ✅ | Group **QA-Group-077** (`2175eb89`, qatt75 @ 50000, 15/22/29 Oct 15:00). `PATCH /group-series/:key/teacher {to: qatt75b, fromDate: 22/10}` ⇒ **`400 RATE_REQUIRED`** *"วันที่ 2026-10-22: ครูที่มาสอนแทนยังไม่มีค่าสอนในตารางนี้ — กรุณาระบุค่าสอนของครูที่สอนแทน"*. Nothing moved: the very next (rated) call still found and moved **2** rows from qatt75, and 15/10 stays qatt75. |
| S2 | The same swap WITH a rate ⇒ succeeds | ✅ | `+ rateMinor: 70000` ⇒ **`200 {"moved":2}`**; series rows now **15/10 qatt75 · 22/10 qatt75b · 29/10 qatt75b**. |
| S3 | A from-here-on swap re-rates EVERY moved date (amounts) | ✅ **OTHER** · ⏳ **GROUP amounts: DATA REQUEST #7** | **ECA QA-ECA-077** (`b6f897b3`, qatt75 @ 50000, 16/23/30 Oct): the swap without a rate ⇒ `400 RATE_REQUIRED`; with `fromDate 23/10, rateMinor 65000` ⇒ `200 {moved:2}`. Per-row amounts (calendar API `other.teacherRates`): **16/10 qatt75 = 50000 · 23/10 qatt75b = 65000 · 30/10 qatt75b = 65000**. Every moved date carries the incoming coach's rate, and the unmoved date keeps the old one ✅. **GROUP rows don't expose a per-row rate** (`other:null`, `rate:null` on the calendar DTO), so the amounts of 22/10 and 29/10 can't be read by me; expected **70000** each and 15/10 still 50000 ⇒ DATA REQUEST #7. |
| 3.C1 | The control sits on the TEACHERS page row; ABSENT without the grant | ✅ | Admin: qatt75b's row menu = *แก้ไข · เปลี่ยนประเภท · **บันทึกวันลาล่วงหน้า** · เก็บ / ออกจากงาน* (EN: *Record leave in advance*). **qa-nostatus-077:** the coach row is shown but has **no row menu at all** and the text "บันทึกวันลาล่วงหน้า" is nowhere on the page, so the control is **absent, not greyed out**. `C-4-no-grant-teachers.png` |
| 3.C2 | FUTURE date: NO session chooser; the hint | ✅ | Default date = tomorrow (5 ต.ค.); **0 checkboxes** on 05/10 and on 21/10 (a day with a class). Hint TH *"การบันทึกวันลาของ qatt75b จะปิดรับจองคาบใหม่ทั้งวันนั้น — คาบที่จองไว้แล้วจะไม่ถูกยกเลิก และยังไม่มีการแจ้งผู้ปกครองเรื่องใด ๆ…"* / EN *"Recording leave for qatt75b blocks their whole day… Classes already booked that day are not cancelled and no family has been told anything…"*. `C-th-1-dialog.png`, `C-en-1-dialog.png` |
| 3.C3 | TODAY on the admin control: refused in the dialog, alternative named | ✅ · 🟠 stale line (F5) | *"ประตูนี้ใช้บันทึกวันลาล่วงหน้าเท่านั้น ถ้าเป็นวันนี้หรือวันที่ผ่านมาแล้ว ต้องจัดการคาบทีละคาบในหน้าปฏิทิน เพราะการยกเลิกคาบจะมีการแจ้งผู้ปกครองทุกครอบครัว · เลือกวันหลังจากวันนี้"* (EN *"This door records leave for a day that has not happened yet… · Pick a date after today"*); **submit disabled**. 🟠 In this state the old same-day line also shows under the reason: *"ผู้ปกครองของคาบที่ติ๊กจะได้รับแจ้ง และระบบจะเพิ่มคาบชดเชยให้"* / *"Families of the ticked sessions will be told; their make-ups are added by the system."* There are no ticks on this door. `C-th-2-today-refused.png`, `C-en-2-today-refused.png` |
| 3.C4 | The answer stays ON SCREEN, lists the classes, says NOTHING HAS BEEN CANCELLED | ✅ · 🔴 F2 · 🟠 F4 | Result (stays in the dialog): TH *"…มีคาบที่จองไว้แล้ว 1 คาบในวันนั้น แอดมินจะจัดการให้ทีละคาบ: 10:00 – 11:00 · **ยังไม่มีการยกเลิกคาบใด** คาบเหล่านั้นยังอยู่ในตารางและยังไม่ได้แจ้งผู้ปกครอง — ต้องจัดการทีละคาบเอง…"* / EN *"**NOTHING HAS BEEN CANCELLED.** Those classes are still on the schedule and no family has been told…"* ✅. 🔴 **But for qatt75b, who has NO LINE link, it says *"ระบบแจ้ง qatt75b เรื่องวันลานี้แล้ว"* / *"qatt75b has been told about this day."*** (`data-leave-teacher-told="yes"`). The not-told sentence (*"…ยังไม่ได้แจ้ง… เพราะบัญชี LINE ยังไม่ได้ผูก — ต้องแจ้งครูเองค่ะ"*) never shows, because the API returns `teacherNotified:1` for an unlinked coach. Same result for Bank (also unlinked). 🟠 The admin's result is worded **to the teacher**: *"2026-10-21 — บันทึกวันลาของคุณแล้ว · จะไม่มีการจองคาบใหม่กับคุณในวันนั้น"* / *"you are recorded as away · No new class can be booked with you that day"*. `C-th-3-result.png`, `C-en-3-result.png` |
| 3.C5 | No new permission key | ✅ | `GET /permissions`: 73 keys; leave-related = `action:calendar.leave-override`, `action:calendar.teacher-leave` (both pre-existing). The admin routes use the existing `action:calendar.status`. |

## Findings
- 🔴 **F2 (customer-visible, CONFIRMED on screen) — the admin is told an UNLINKED coach "has been told".** API `teacherNotified:1` for coaches with no LINE link (qatt75b, Bank) on record and on lift ⇒ the result shows *"ระบบแจ้ง {name} เรื่องวันลานี้แล้ว"* / *"{name} has been told about this day."* DEPLOY §9: the screen must *not* claim they were told. The admin will then not phone the coach, which is exactly the outcome the not-told sentence exists to prevent.
- 🟠 **F4 — the admin's result screen is worded to the TEACHER** ("บันทึกวันลาของคุณแล้ว / you are recorded as away", "with you"). It reuses the coach's own dialog copy.
- 🟠 **F5 — the old same-day line ("ผู้ปกครองของคาบที่ติ๊กจะได้รับแจ้ง… / Families of the ticked sessions will be told…") reappears in the admin dialog when today/past is picked.** There are no ticks on that door.
- 🔴 **F3 (money/validity) — declaring a free pre-start absence does NOT extend the course expiry.**
  - **Expected** (Porter, Sober): +1 week per declaration.
  - **Seen** on 2 fresh courses, by API and on the course card: the expiry is unchanged, while each declaration appends a make-up after the last session. So the make-ups land on or past the expiry:
    - `a795c3cd`: expiry 25/11, make-ups 25/11 / 02/12 / 09/12;
    - `18386706`: expiry 26/11, make-up 03/12.
  - Only a later start-date change recomputes it (23/12).
  - **Risk:** make-ups beyond the expiry (expiry jobs, reminders, and the "week 5" extension ceiling shown on the card).
- 🔴 **F1 (needs a ruling, not a guess) — the admin teacher-leave API accepts TODAY and PAST dates and CANCELS that day’s classes.** `POST /api/teacher-leave-days {teacherId: qatt75b, date: today}` ⇒ `200 {cancelled:1, familiesNotified:1}`, and fixture `f9f73eed` became CANCELLED (TEACHER_LEAVE). DEPLOY §9 / Porter: *"accepts FUTURE dates only. Deliberate"*. QA-line §1.1 expected exactly this cancelling branch. The two documents disagree, and the code follows the QA line. The refusal exists only in the dialog, so anyone holding `action:calendar.status` who crafts a request can cancel a teacher’s day (it cancelled the RIGHT teacher’s class, so the deploy note’s stated risk, the caller’s own sessions, did not occur here).
- ❓ **F2 — `teacherNotified:1` for a coach with NO LINE link** (qatt75b, on record and on lift). It probably counts the queued/SKIPPED row; the screen check is in Part 3.

## Test data created (footprint)
- QA account **`qa-nostatus-077`** (id `39861a63-9275-4b79-9928-39c51a7c6200`): menus calendar + teachers, **no action keys**, so no `action:calendar.status`. Password only in the credential file. **Kept for future rounds.**
- §1.1 fixtures: 1-HR **`03713d0e-6517-4557-b912-12b8b00211f5`** (campkid2 / qatt75b, 21/10 10:00, CONFIRMED). Today-probe **`f9f73eed-a76b-4128-835a-875f2c113cf7`** (qatt75b, 04/10 21:30), **CANCELLED by the admin leave door**. qatt75b leave 21/10 recorded, then lifted. Coach qatt75 own leave 22/10 recorded, then lifted.
- F fixtures: **course sales on sid**: `a795c3cd-9a30-482d-8660-be4bc81bc03c` (campkid2, qatt75; 3 free declarations; start moved to 04/11) and `18386706-6104-4a76-a318-7530c7292537` (qakid3, qatt75b; 2 free declarations). **Cancel at the end.**
- Swap fixtures: group **QA-Group-077** key `2175eb89-4259-433f-b7ca-eb3b4692ab59` (rows `4d404ee1`, `0b4d14c5`, `b5c45287`); ECA **QA-ECA-077** key `b6f897b3-3151-48c5-a738-84bcf1eec9b0`. **Cancel-all at the end.**
- ⚠️ **My mistake, 10-04 ~20:40:** my screen script's row locator matched the WRONG teacher row, so it recorded an advance leave for **Bank** (`2fb4f78d`, an existing sid coach) on **21/10** through the admin dialog, instead of my fixture qatt75b. Within minutes I **lifted it** (`DELETE /teacher-leave-days/2fb4f78d…/2026-10-21` ⇒ `200`), and the list is empty again. **Nothing was cancelled** (Bank's 09:00 class on 21/10 untouched) and **no family was told**. **Bank has no LINE link** (`lineLinked:false`), so no message reached anyone; at most two SKIPPED outbox rows. Declared here rather than hidden.
- Screen runs: qatt75b leave **21/10** recorded via the dialog **twice** (TH, EN) and **lifted each time** (200).

### LINE (📱 new phone, Redmi 10C, demo OA; linked TEMPORARILY as coach **qatt75** 19:43–19:47, then restored to parent 0899990763)
| Case | Verdict | Evidence |
|---|---|---|
| The teacher's LINE notice for a day an ADMIN recorded | ✅ | Admin `POST /teacher-leave-days {qatt75, 30/10}` ⇒ `200 teacherNotified:1` (true here: qatt75 linked). It arrived within a minute: **"🗓️ แอดมินบันทึกวันลาของคุณแล้ว / Date: 30-10-2026 / วันนั้นจะไม่มีการจองคาบใหม่กับคุณ / บันทึกโดย: admin"**. `LINE-1-recorded-day.png` |
| …and for the day LIFTED | ✅ | Admin `DELETE …/30/10` ⇒ `200 teacherNotified:1`. It arrived: **"🗓️ แอดมินยกเลิกวันลาของคุณแล้ว / Date: 30-10-2026 / วันนั้นรับจองคาบกับคุณได้ตามปกติแล้ว"**. `LINE-2-lifted-day.png` |
| EN rendering of those two notices | ⚪ not run | The phone's coach chat was in TH; I did not switch the language. |
| Owner-level LINE account | ⚪ not mine | Stays the owner's (brief). |

**Footprint (10-04 19:50):**
- ✅ **Cancelled:** 1-HR `03713d0e`; today-probe `f9f73eed` (by the admin leave door itself); ECA QA-ECA-077 (3); Group QA-Group-077 (3).
- ✅ **All my leave days lifted:** qatt75b 21/10 (×3), qatt75 22/10, qatt75 30/10, and Bank 21/10 (my mistake, see above). The only leave day left in range is Kwan's own 04/10 (real, untouched).
- ✅ **The new phone is back to parent 0899990763** (qatt75 LINE unlinked; linked teachers: none, as before).
- **Kept as live examples for F3:** courses `a795c3cd` (campkid2) and `18386706` (qakid3). Cancel when Sober says.
- **Kept:** QA accounts `qa-nostatus-077`, `qa-norate-076`, `qa-coach-qatt75`.

### Re-test of the three fixes — sid re-deploy 10-04 evening (TASK-646/647/648) · 20:45–21:00
| Fix | Verdict | Evidence |
|---|---|---|
| **F1** (TASK-648): the admin leave API REFUSES today/past at the server; nothing cancelled; the teacher's own same-day cancel unchanged | ✅ **PASS** | Fixture class qatt75b **today 22:00** (`fea7471a`, CONFIRMED). `POST /teacher-leave-days {qatt75b, 2026-10-04}` ⇒ **`400 VALIDATION`** *"บันทึกวันลาแทนครูได้เฉพาะวันถัดไปเป็นต้นไป — ถ้าต้องการยกเลิกคาบของวันนี้ กรุณาจัดการรายคาบในปฏิทิน"*; the fixture **still CONFIRMED**; **no leave day recorded**. Past (01/10) ⇒ the same 400. **Teacher's own** (qa-coach-qatt75) `POST /teachers/me/leave {today, sessionIds:[f4a6f210]}` ⇒ **`200 {cancelled:1, familiesNotified:1}`**, and that class is CANCELLED, unchanged ✅. |
| **F3** (TASK-646): each free pre-start absence stretches the expiry by ONE week, and every make-up lands INSIDE | ✅ **PASS** (API + card) | Fresh course `f6c9b1e5` (campkid2 / qatt75b, 4 classes, Fri from 30/10, quota 1). Expiry at sale **27/11**; declare #1 ⇒ **04/12**, #2 ⇒ **11/12**, #3 ⇒ **18/12**, #4 ⇒ **25/12**: +1 week EACH, `leaveUsed 0/1` throughout. Make-ups 27/11 · 04/12 · 11/12 · 18/12; **the last live row (18/12) is inside the expiry after every step.** Course card: *"หมดอายุ 2026-12-25"*. `RT-F3-card.png`. 📌 Arithmetic: "quota + 3" = **4** declarations ⇒ **+4 weeks** (the brief said +3), consistent with "+1 week each". 🟠 Copy (non-blocking): the card still says *"ขยายได้ถึงสัปดาห์ที่ 5"* while the make-ups now reach week 8. |
| **F2** (TASK-647): an UNLINKED coach reads as NOT told; a LINKED coach still reads as told AND gets the notice | ✅ **PASS** (screen + phone) | **qatt75b (no LINE):** Teachers → *บันทึกวันลาล่วงหน้า* → 29/10 ⇒ *"**ระบบยังไม่ได้แจ้ง qatt75b เพราะบัญชี LINE ยังไม่ได้ผูก — ต้องแจ้งครูเองค่ะ**"* (`data-leave-teacher-told="no"`). `RT-F2-qatt75b.png`. **qatt75 (phone linked as coach for this check):** ⇒ *"**ระบบแจ้ง qatt75 เรื่องวันลานี้แล้ว**"* (`told=yes`), and the phone received *"🗓️ แอดมินบันทึกวันลาของคุณแล้ว / Date: 29-10-2026 / วันนั้นจะไม่มีการจองคาบใหม่กับคุณ / คาบที่จองไว้แล้ว 1 คาบ…"*, then on lift *"🗓️ แอดมินยกเลิกวันลาของคุณแล้ว / Date: 29-10-2026…"*. `RT-F2-qatt75.png`, `RT-F2-linked-phone.png` |

**Re-test footprint:**
- ✅ `fea7471a` cancelled (cleanup); `f4a6f210` cancelled by the coach's own leave (the test itself).
- ✅ 29/10 leave days for qatt75b and qatt75 lifted. Leave days left in range: Kwan 04/10 only (real, untouched).
- ✅ The phone is back on parent 0899990763 (qatt75 LINE unlinked).
- Kept: course `f6c9b1e5` (F3 re-test), along with `a795c3cd` and `18386706`. Cancel on your word.
