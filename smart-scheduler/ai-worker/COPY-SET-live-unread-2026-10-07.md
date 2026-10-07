# COPY SET — 2026-10-07 — **47 sentences already in front of Khwan's team and families that NOBODY has read**
**Assembled by @Sober for @Porter → the owner. ⏱️ To be sent AFTER the uat release (@Porter times it).**
🔴 **This is NOT "approve what is live".** These strings have been on the screens for days to weeks, and **no owner has ever read them.** **Some may be wrong — finding that is the point.** Read each as if it were new; "it has been live and nobody complained" is not a reason to pass it.
**Source:** the front approval audit (`tasks/TASK-701-front-approval-marker-audit-fe.md`) — every string below is extracted **from the code, by script, not retyped**; the EN and TH are what a person sees today.
**For each group, the owner can:** ✅ approve as is · ✏️ give new words (then it is a copy change, and approved strings are never improved afterwards) · ❓ ask where it shows.
**Who sees them:** all ADMIN-facing (Khwan's team) **except L8 (PARENTS)** and L9.

---

## L1 · Discount-entry errors — 3 string(s)
**Where it shows:** ADMIN · the discount box when selling/booking (`DiscountSection`) — shown when the typed discount is invalid.
**Why it is here:** no approval found anywhere.

| key | EN | TH |
|---|---|---|
| `discount.errPercentRange` | A percentage discount must be between 0 and 100. | ส่วนลดเป็นเปอร์เซ็นต์ต้องอยู่ระหว่าง 0–100 |
| `discount.errBahtPositive` | A baht discount must be a whole number above zero. | ส่วนลดเป็นบาทต้องเป็นจำนวนเต็มบวก |
| `discount.errValue` | That discount value isn't valid. | ค่าส่วนลดไม่ถูกต้อง |

## L2 · Attendee-note hint — 1 string(s)
**Where it shows:** ADMIN · the hint under the per-session attendee note on a booking.
**Why it is here:** wording was Porter's own (TASK-179); never sent to the owner.

| key | EN | TH |
|---|---|---|
| `attendeeNote.hint` | Who is bringing the child, and logistics for this session. Not for phone numbers, addresses or medical details. | ใครเป็นคนพามา และรายละเอียดการรับส่งของคาบนี้ ไม่ใช่ที่สำหรับเบอร์โทร ที่อยู่ หรือข้อมูลสุขภาพ |

## L3 · 🙋 MINE — the admin's record-leave dialog (TASK-611) — 14 string(s)
**Where it shows:** ADMIN · Teachers page → «Record leave in advance» → the dialog and its result.
**Why it is here:** **@Sober's ruling only (2026-10-04), never the owner's — my miss.** The TH lines are Fern's drafts; the EN hint was tightened after review and the tightened text was never recorded.

| key | EN | TH |
|---|---|---|
| `teacherLeave.adminTitle` | Record leave for {name} | บันทึกวันลาของ {name} |
| `teacherLeave.adminSubject` | Whose leave this is | บันทึกวันลาให้ใคร |
| `teacherLeave.adminHint` | Recording leave for {name} blocks their whole day for new bookings. Classes already booked that day are not cancelled and no family has been told anything — you will see the list once the day is recorded. | การบันทึกวันลาของ {name} จะปิดรับจองคาบใหม่ทั้งวันนั้น — คาบที่จองไว้แล้วจะไม่ถูกยกเลิก และยังไม่มีการแจ้งผู้ปกครองเรื่องใด ๆ เมื่อบันทึกแล้วระบบจะแสดงรายการคาบให้ดู |
| `teacherLeave.adminPastRefused` | This door records leave for a day that has not happened yet. For today or a past day, the classes have to be handled one at a time on the calendar, because cancelling them tells each family. | ประตูนี้ใช้บันทึกวันลาล่วงหน้าเท่านั้น ถ้าเป็นวันนี้หรือวันที่ผ่านมาแล้ว ต้องจัดการคาบทีละคาบในหน้าปฏิทิน เพราะการยกเลิกคาบจะมีการแจ้งผู้ปกครองทุกครอบครัว |
| `teacherLeave.adminPastRefusedAction` | Pick a date after today | เลือกวันหลังจากวันนี้ |
| `teacherLeave.adminNothingCancelled` | NOTHING HAS BEEN CANCELLED. Those classes are still on the schedule and no family has been told — they are yours to handle one by one, and until you do, treat them as going ahead. | ยังไม่มีการยกเลิกคาบใด คาบเหล่านั้นยังอยู่ในตารางและยังไม่ได้แจ้งผู้ปกครอง — ต้องจัดการทีละคาบเอง และจนกว่าจะจัดการ ให้ถือว่าคาบยังสอนตามปกติ |
| `teacherLeave.adminDoneTeacherTold` | {name} has been told about this day. | ระบบแจ้ง {name} เรื่องวันลานี้แล้ว |
| `teacherLeave.adminDoneTeacherNotTold` | {name} has not been told — their LINE account is not linked. You will need to tell them yourself. | ระบบยังไม่ได้แจ้ง {name} เพราะบัญชี LINE ยังไม่ได้ผูก — ต้องแจ้งครูเองค่ะ |
| `teacherLeave.adminSubmit` | Block this day for {name} | ปิดรับจองวันนั้นของ {name} |
| `teacherLeave.adminAdvanceTitle` | {date} — leave recorded for {name} | {date} — บันทึกวันลาของ {name} แล้ว |
| `teacherLeave.adminAdvanceBlocked` | No new class can be booked with {name} that day. | จะไม่มีการจองคาบใหม่กับ {name} ในวันนั้น |
| `teacherLeave.adminAdvanceClasses` | {n} class(es) already booked with {name} that day: | มีคาบที่จองกับ {name} ไว้แล้ว {n} คาบในวันนั้น: |
| `teacherLeave.adminAdvanceNoClasses` | Nothing is booked with {name} that day. | วันนั้นยังไม่มีคาบที่จองกับ {name} |
| `teachers.actRecordLeave` | Record leave in advance | บันทึกวันลาล่วงหน้า |

## L4 · Cover-rate field (TASK-577) — 2 string(s)
**Where it shows:** ADMIN · an OTHER series → a covering coach for one session → the rate box.
**Why it is here:** called "approved" in passing in a Team B draft; no approval entry.

| key | EN | TH |
|---|---|---|
| `otherSeries.coverRate` | {name}'s rate for this session | ค่าสอนของ {name} สำหรับคาบนี้ |
| `otherSeries.coverRateHint` | The covering coach is paid their own rate for this session. This series has none on file for them yet, so enter it here. | ครูที่มาสอนแทนจะได้ค่าสอนของตัวเอง ตารางนี้ยังไม่มีค่าสอนของครูท่านนี้ จึงต้องระบุที่นี่ |

## L5 · "This session or from here on" + move-this-only (TASK-564) — 8 string(s)
**Where it shows:** ADMIN · an OTHER series → change a coach (the scope choice and the notes under it) · a COURSE session → Move (the last line).
**Why it is here:** COPY-REVIEW §2–§4 approved the LINE notices for this work, not these screen lines.

| key | EN | TH |
|---|---|---|
| `otherSeries.scopeLabel` | Which sessions? | ใช้กับคาบไหน? |
| `otherSeries.scopeThis` | This session only | เฉพาะคาบนี้ |
| `otherSeries.scopeRest` | This session and the rest | คาบนี้และคาบถัดไปทั้งหมด |
| `otherSeries.scopeHint` | Choose one — nothing is assumed. | เลือกอย่างใดอย่างหนึ่ง ระบบไม่เดาให้ |
| `otherSeries.scopeThisDate` | The session on | คาบวันที่ |
| `otherSeries.coverNote` | {to} covers for {from} on that day. {from} is not teaching it, and {to} is paid for it. | {to} สอนแทน {from} ในวันนั้น {from} ไม่ได้สอนคาบนั้น และ {to} ได้ค่าสอนของคาบนั้น |
| `otherSeries.joinNote` | {name} joins that session as a second coach. Both coaches are paid for it. | {name} เข้าสอนคาบนั้นเป็นครูคนที่สอง ได้ค่าสอนทั้งสองคน |
| `booking.moveThisOnly` | This moves this session only — the rest of the course stays as it is. | ย้ายเฉพาะคาบนี้ คาบอื่นของคอร์สยังคงเดิม |

## L6 · 🔴 THE LARGEST GAP — the change-start-date dialog (TASK-571): 14 strings, NONE approved — 14 string(s)
**Where it shows:** ADMIN · a not-yet-started course → «Move the start date».
**Why it is here:** ⚠️ **Easy to mistake for covered:** the SAME dialog carries five strings that ARE approved (TASK-574's preview, COPY-REVIEW §11 — `newStartHintCurrent`, `preview`, `forecastTitle`, `forecastRow`, `forecastCaveat`). **These 14 are the rest of the dialog and were never in any set** — including the warning that NOBODY is told by the move.

| key | EN | TH |
|---|---|---|
| `courseStart.startLabel` | Starts | เริ่มเรียน |
| `courseStart.edit` | Move the start date | เลื่อนวันเริ่มเรียน |
| `courseStart.title` | Move the start date — {student} | เลื่อนวันเริ่มเรียน — {student} |
| `courseStart.newStart` | New start date | วันเริ่มเรียนใหม่ |
| `courseStart.newStartHint` | The first session moves here; the rest follow week by week. | คาบแรกจะย้ายมาวันนี้ คาบถัดไปเลื่อนตามสัปดาห์ละคาบ |
| `courseStart.warnStale` | Nobody is told by this move. Until you run Confirm course, the family and the coach still have the OLD dates — run it as soon as the new dates are right. | การเลื่อนนี้ไม่มีการแจ้งใคร ลูกค้าและครูยังถือตารางเดิมอยู่จนกดยืนยันคอร์สอีกครั้ง — เมื่อวันใหม่ถูกต้องแล้วให้กดยืนยันคอร์สทันที |
| `courseStart.warnExpiry` | The expiry date is recalculated from the new schedule. | วันหมดอายุจะคำนวณใหม่จากตารางใหม่ |
| `courseStart.warnHandSetExpiry` | Someone set this course's expiry date by hand. This move REPLACES it. | คอร์สนี้มีคนตั้งวันหมดอายุไว้เอง การเลื่อนนี้จะแทนที่วันนั้น |
| `courseStart.confirm` | Move the sessions | เลื่อนคาบทั้งหมด |
| `courseStart.doneTitle` | {n} sessions moved — the course now starts {date} | ย้าย {n} คาบแล้ว — คอร์สเริ่ม {date} |
| `courseStart.expiryMoved` | Expiry: {from} → {to} | วันหมดอายุ: {from} → {to} |
| `courseStart.skippedTitle` | Weeks skipped (the coach is away) | สัปดาห์ที่ข้ามไป (ครูลา) |
| `courseStart.reconfirmTitle` | {n} sessions need confirming again | {n} คาบต้องยืนยันใหม่ |
| `courseStart.reconfirmBody` | Their confirmation was of the old dates, so it was cleared. Run Confirm course to send the new schedule — one message per person. | การยืนยันเดิมเป็นของตารางเดิม จึงถูกล้างไปแล้ว กดยืนยันคอร์สเพื่อส่งตารางใหม่ — คนละหนึ่งข้อความ |

## L7 · Group swap rate (TASK-634) — 2 string(s)
**Where it shows:** ADMIN · a GROUP series → swap the coach → the rate box.
**Why it is here:** Fern's draft, "yours to rule on" to @Sober; later files call it approved with no owner entry.

| key | EN | TH |
|---|---|---|
| `booking.groupSwapRate` | {name}'s rate for this group (per session) | ค่าสอนของ {name} สำหรับกลุ่มนี้ (ต่อคาบ) |
| `booking.groupSwapRateHint` | Leave this empty unless the swap is refused for a missing rate — that happens when this group has never paid this coach before. | ไม่ต้องกรอก ยกเว้นระบบปฏิเสธเพราะไม่มีค่าสอน — จะเกิดเมื่อกลุ่มนี้ยังไม่เคยจ่ายค่าสอนให้ครูคนนี้ |

## L8 · 👪 PARENT-FACING — "address on file" on the registration PAGE (TASK-566) — 2 string(s)
**Where it shows:** PARENT · the LINE registration page (LIFF), when the family's address is already on file.
**Why it is here:** the sentence is in no COPY or REQ file.

| key | EN | TH |
|---|---|---|
| `register.addressOnFile` | We already have your address on file. | เรามีที่อยู่ของครอบครัวนี้อยู่แล้วค่ะ |
| `register.addressOnFileProvince` | We already have your address on file ({province}). | เรามีที่อยู่ของครอบครัวนี้อยู่แล้วค่ะ ({province}) |

## L9 · The "linked to one" line (TASK-593) — 1 string(s)
**Where it shows:** the registration flow, when a phone is already linked to one child.
**Why it is here:** COPY-REVIEW-2026-09-29:266 describes it ("keeps its own sentence") but quotes no string. ⚠️ **Read it: the EN says "(1 child)" while the TH carries `{n}`** — the two halves do not say the same thing in the same way.

| key | EN | TH |
|---|---|---|
| `register.alreadyLinkedToOne` | Linked to {phone} (1 child). | ผูกกับเบอร์ {phone} (นักเรียน {n} คน) |

---
## L10 · 🙋 MINE — listed, NOT for approval (owner rule 2026-10-07: a refusal no screen can reach)
**Back end, `ADMIN_LEAVE_FUTURE_ONLY` (TASK-648)** — the server's refusal when an admin records a coach's leave for TODAY. **No screen can send today's date** (the L3 dialog offers future dates only), so by your rule it ships with engineer wording. **It is in this list because the copy was mine to send up and I never did. It returns to approval the day a screen can reach it.**

---
**Count: 47 screen strings in 9 groups (L1–L9) + 1 listed back-end refusal (L10).** ⚠️ *"23" in the audit counts DRAFT LABELS in the file, not strings — one label can cover a whole dialog. 47 is the number of sentences to read.*
