# CHECK 2026-11-09: front-office intake F1 · F2 · F4 · F5 (step 0, nothing built)
Sector (SA, Team C), for Porter. Source: INTAKE-2026-11-09-khwan-line-frontoffice.md + her verbatim (`project-docs/customer-2026-11-09-line-som-system/…VERBATIM.txt` l.75–158).
Code read: SB `smart-scheduler-back` `dong` @ `77a4262` (2026-11-09). Line numbers are from that commit; the decisive ones I re-read myself.
Her own condition (l.134–136): *"หากมีความซับซ้อนหรือทำให้ต้องเพิ่มขั้นตอนการทำงานค่อนข้างเยอะ สามารถแจ้งได้เลยนะคะ เราอาจจะพิจารณาไม่ปรับ"* (if it's complex or adds a lot of steps, say so and she may drop it). So each item carries a size.

| # | Today (cause) | Smallest fix | Size | Risk to live courses |
|---|---|---|---|---|
| F5 | A cancelled make-up regrows on its own date | Mark the cancelled row's coach+date as taken | **0.5 d** BE + test | Low, but it reverses an owner ruling (TASK-551) |
| F2 | A make-up is born CONFIRMED and **messages the parent**, even in a PENDING course | Keep it CONFIRMED (her 10-06 rule) but **send nothing** until the course is confirmed | **1–1.5 d** BE | Low; touches the one confirm path |
| F4 | No closed-day feature (only per-teacher leave) | New "close a day" = loop the existing SCHOOL_ISSUE cancel + block the date | **3–4 d** BE+FE (new REQ) | Medium: bulk cancels + make-ups + family messages |
| F1 | One weekday + 1-hour sessions only; make-up = last date + 7 | A day pattern (2+ weekdays) + 2-hour sessions treated as one slot | **6–8 d** BE+FE (new REQ) | **High**: the course-plan engine everyone uses |

## F5: a leave on a make-up "extends" onto the same date (REQ-5006, reproduced in TEST-140)
- **Today:**
  - The cancel door re-plans the course (`scheduler.service.ts:4760` → `reconcileCoursePlan`). Dates are marked taken only for «ครูลา» (`:4757` `coachOff … reasonCode === "TEACHER_LEAVE"`).
  - The start point skips the cancelled row (`:3332`). When that row was the last session (a make-up always is), the start point falls back one week, and `extension-slot.ts:14` `addDays(fromDate, 7)` lands on the **cancelled row's own date**, which counts as free (a cancelled row holds no slot).
  - Then `:4766` sees "same slot", so no +1 week (`:4782`) and no family notice.
- **Fix:** always put the cancelled row's own coach+date into `coachOff` (and the same in the group cancel, `:4712`).
- **Size:** 0.5 d + tests.
- **Risk:** low. Side effect: that cancel now gets its +1 week and a family notice. **This reverses the owner's TASK-551 ruling** ("a make-up put straight back in the same slot changed nothing", comment `:4756`). Her complaint is exactly that result, so **the owner says OK** first.
- **Question for ขวัญ:** none.

## F2: no parent message while a course is still PENDING
- **Today:**
  - A pending course = sessions with status PENDING. There's no course flag (`confirmCourse :5621` flips the PENDING rows at `:5628`).
  - A leave in it creates a make-up that is **born CONFIRMED and announced** to the parent as `booking_confirmed`. That's her «📅CONFIRMED SCHEDULE» example (`confirmMakeupAtBirth :4544` → `applyConfirm` → `enqueueParentCopies :4528`, kind `:4488`; callers `:4933` the leave, `:3413` the re-plan on cancel / coach leave).
  - That is **her own ruling** (REQ-115, 2026-10-06 03:39, in force): *"เปิดคอร์ส ยังไม่คอนเฟิร์มทั้งคอร์ส · มีการกดลา ⇒ คลาสที่งอกออกไป คอนเฟิร์มอัตโนมัติ"*, chosen so admins stop pressing confirm daily and parents can take leave.
  - Two more parent messages ignore "pending": the undo of a leave (`:3593–3600`) and an expiry change (`:6059`, checks only "ended").
  - Cancel and move already stay quiet for a PENDING session (`:3627`, `:3701`).
- **Fix (keeps her 10-06 rule):** the make-up is still born CONFIRMED with its badge. **Only the parent message is held while the course has no CONFIRMED/ATTENDED session of its own** (one check in `confirmMakeupAtBirth`, plus the same check on the undo and expiry notices). When the admin presses **Confirm Course**, the parent gets the normal course message.
- **Size:** 1–1.5 d BE + tests. No FE.
- **Risk:** low. Coaches still get their message.
- **Open, for me to check while building:** whether the course message lists the already-confirmed make-up. If not, it gets added (inside the size).
- **Question for ขวัญ (one line):** «ตอนกด Confirm Course ระบบจะส่งตารางทั้งคอร์สให้ผู้ปกครองครั้งเดียว รวมคลาสที่งอกออกไประหว่างรอด้วย: ใช้แบบนี้ได้ไหมคะ» (when Confirm Course is pressed, the system sends the parent the whole course schedule once, including the classes that grew while it was pending: OK?). **Default: yes.**

## F4: close a whole day's schedule
- **Existing REQ: none.** No requirement mentions holiday, closed day, ปิด or blackout. REQ-005:90 only asks a question about it.
- **Today:**
  - per-teacher leave only (`teacher_leave_days`, `schema.ts:1305`). A future leave blocks that teacher's day and cancels nothing (`:3853–3866`); today's or a past leave cancels and re-plans (`:3868–3911`);
  - bulk cancel exists only per series (`/other-series|group-series/:key/cancel-all`, `routes/api.ts:421/447`);
  - the reason `SCHOOL_ISSUE` exists, but only one session at a time (`:4693`, `:4782`: it re-plans and adds +1 week).
- **Smallest fix (a new REQ):**
  - a "closed day" record (date + reason) that the booking check and the make-up date search (`findFreeExtensionDate :3140`) skip;
  - one admin action, "Close this day", that runs the existing `SCHOOL_ISSUE` cancel on every live class that day in one transaction (make-ups, +1 week and family messages for free; group seats via `cancelSeatsOfGroup`);
  - an FE dialog that lists the classes before you confirm.
- **Size:** 3–4 d (BE 2–2.5 + FE 1–1.5).
- **Risk:** medium (many classes at once). **Build F2 first**, otherwise closing a day sends "CONFIRMED" messages to pending courses.
- **Questions for ขวัญ (defaults in brackets):**
  1. Do the day's classes get cancelled and grow onto the next week, or move to another day? [cancel and grow onto the next week, like «ปัญหาจากทางเรา»]
  2. Is the course end date pushed back +1 week? [yes]
  3. Does the family get a LINE message? [yes, the normal cancel message]
  4. The whole school, or one branch (Bravo / อื่นๆ)? [the whole school]
  5. Coaches' pay for that day? [not paid, as a cancelled class]

## F1: fixed schedule on 2+ days a week, and 2-hour sessions
- **Today:**
  - a course stores **one** weekday + start time (`schema.ts:387–388`; set at `:2580`);
  - default sessions are weekly (`recurring.ts:17` `addDays(start, i*7)`);
  - **every session is exactly 1 hour** (`:1354` `endTime: addHour(startTime)`, `time.ts:25`).
  - A 2-hour class is two 1-hour bookings (inferred from `size` counting hours, `:2487`).
  - The per-session plan editor (REQ-030, delivered 08-10) lets the admin place rows by hand, which is what she does today.
  - **Make-ups:** `reconcileCoursePlan :3250` starts from the latest planned date and steps **+7 days** (`extension-slot.ts:14`), one make-up per missing row, moving the start forward each time (`:3414`).
    - **2-hour leave → 2 rows → week N+1 and week N+2**: her "2 weeks".
    - **Thu+Sun:** a leave on the last Sunday lands on the next Sunday, never the Thursday. No code knows the child's pattern. `course.weekday` isn't even read there (inferred: its only service use is a notice, `:5683`).
- **Smallest fix (a new REQ):**
  1. a course **day pattern**: 1–3 (weekday, start time) entries; existing courses = their one weekday;
  2. a **session length** of 1 or 2 hours: a 2-hour session stays two 1-hour bookings (pay and counts unchanged), but leave, make-up and moves treat the pair as **one slot**;
  3. make-ups go to the **next free date in the pattern** (not +7), and both hours of a 2-hour slot land together;
  4. FE: the pattern + length at course sale and in the plan editor.
- **Size:** 6–8 d (BE 4–5 incl. heavy tests on `reconcileCoursePlan`; FE 2–3).
- **Risk: high.** `reconcileCoursePlan` / `createCoursePackage` run every course. Existing courses must behave exactly as today (pattern = one day, length 1); that's proven by the current suite plus new pins. It needs a migration (pattern + length columns, additive).
- **Questions for ขวัญ (defaults in brackets):**
  1. The most days a week? [2, maybe 3]
  2. The longest session? [2 hours]
  3. A leave on a 2-hour day takes both hours? [yes, the whole day]
  4. Can the two days have different times or coaches? [different times yes; the coach can differ per day]
  5. A course whose 2-hour day is split across two coaches? [not supported, one coach per slot]

## Suggested order (for the owner)
**F5 → F2 → F4 → F1.** The two small, safe fixes go first. F4 needs F2 in place first. F1 is the big one: worth asking her whether F1's size is worth it (her own l.134).
Team C can start F5 + F2 now (Brew, BE); F4/F1 wait for REQs + her answers.
