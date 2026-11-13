# REQUEST 2026-11-13 · Porter → Sector: ขวัญ 00:43–00:46. Four topics, all front office. Answer each from the code; no customer reply until you do.
Her words: CUSTOMER-ANSWERS 2026-11-13 00:43–00:46 · `.private/line-20261113-005555.json`.

**A. Multi-day (F1), your design (REQUEST …multi-day…resize § Answer):**
- **(1) The leave quota is counted in WEEKS, not per class or hour.** Her words: "ตอนนี้เรานับเป็นสัปดาห์นะคะ ไม่ได้นับสิทธิ์เป็นครั้ง". How does today's quota count? Does the hour-slot model keep "1 leave = 1 week, whatever the hours"? Restate the rule and give the size impact.
- **(4) "งงค่ะ".** Your rule on changing the pattern mid-course confused her. Give me a plain one-line version with a tiny example.
- **(5) Confirm her example:** a 10-class course studied Mon–Thu uses 4 per week, so it lasts 2.5 weeks.

**B. Close a day (REQ-5013, live on sid, Tanya testing), her new scope:**
- **Close for some coaches only**, not the whole school (e.g. a meeting that takes several coaches out). Is this today's coach leave applied to several coaches at once? Or a closed day with a coach list? Size it, and say whether it belongs in REQ-5013 or comes after.
- **Several days:** already in (a range). Confirm.
- **Warn when a course falls on a closed day:** you refuse the sale and the Attention panel lists it. Is that the warning she wants? Confirm it covers her case.

**C. Coach leave with a time range** (e.g. morning 10–12 only). Can today's coach leave do part of a day? If not, size it.

**D. Coach working hours** (e.g. weekend afternoons only), set on the working-hours page. Does that page support per-day hours today? If yes, tell me where she does it herself. If not, size it.

Days only, plus "she can do it herself today at <screen>" wherever that's true. Answer under `## Answer`, then add one line to inbox/PM.md.

## Answer
**Sector (SA, Team C), 2026-11-13, read against SB `dong` (TASK-959 in) + SF `dong`. [SA-estimate] for sizes.**

### A. Multi-day (F1)
**(1) Leave counted in weeks: yes, and it fits.**
- **Today** (`SB lib/leave.ts`): the quota is per course size (4 → 1, 6 → 2, 10 → 3), and the course window is `size + quota` **weeks** (`MAX_WEEK_BY_SIZE`: 5 / 8 / 13).
- With one class a week, "1 leave = 1 class = 1 week", so today the two readings are the same thing.
- **New rule for the pattern [replaces my default 1 "in hours"]:** one leave = **one week** of the pattern. Any hours she marks absent inside that week, one hour or all of them, use **1** from the quota. The make-ups for those hours go after the last planned class, as in my design.
- **The window stays the same table** (5 / 8 / 13 weeks). A 4-a-week course just finishes early inside it.
- **Size impact:** +0.25 d BE (count distinct weeks, not rows), so F1 ≈ 7 d.

**(4) In plain words** (a new default, simpler than mine, because the act already exists):
- **One line:** "เปลี่ยนวัน/เวลา/ครูของคอร์สกลางทาง = คาบที่ยังไม่ได้เรียนทั้งหมดย้ายไปตามตารางใหม่ ส่วนคาบที่เรียนไปแล้วอยู่เหมือนเดิม".
- **Example:** a course on จ + พฤ 17:00 that she changes to อ + ศ from next week. The 2 classes already taught stay. The 6 still to come become อ / ศ next week onwards.
- **Why:** the same act already exists for one weekday, "เปลี่ยนครู/เวลาทั้งคอร์ส" (TASK-838, `POST /courses/:id/change-teacher-time`, with a preview). It is extended to the pattern.
- **Size:** +0.5 d. F1 total ≈ **7.5 d**.

**(5) Her example is right:** 10 classes on จ–พฤ = 4 a week → week 1: 4, week 2: 4, week 3: 2. It is done in **2.5 weeks**.

### B. Close a day
- **For some coaches only:** that is **today's coach leave**, and **she can do it herself today**: ปฏิทิน → «บันทึกการลาของครู», one coach at a time, a single day or a range.
  - It already refuses new classes for that coach on those days.
  - Make-ups skip those days.
  - The calendar shows the leave strip with that coach's classes, each with «เปิด».
  - The coach is told on LINE.
  - **What she lacks is picking several coaches in one go.** That is a multi-select in the same dialog, saving one leave per coach. FE ≈ 0.5 d; the BE is unchanged, since it calls the existing route per coach.
  - **It comes after REQ-5013** as its own small item. It is not part of option B, which is whole-school.
- **Several days:** **yes**, already in REQ-5013. From / To, up to 31 days, in one save.
- **Warn when a course falls on a closed day:** yes, both ways. Please confirm with her that this is what she means.
  - **Selling a new course or booking a class onto it:** the save is refused with «วันที่ … ปิดทำการ (…) — กรุณาเลือกวันอื่น». She ticks that week as skipped, then saves.
  - **Classes already there when she closes the day:**
    - the save tells her «มี N คลาสค้างอยู่»;
    - they appear in Attention («คลาสในวันปิดทำการ»);
    - the 08:00 LINE summary carries them every morning until she has moved or cancelled them;
    - the calendar strip on that day lists them.

### C. Coach leave for part of a day (e.g. 10–12 only): **not today**
- **Today:** a coach's leave is per **whole date** (`teacher_leave_days`: one row per coach per date, no time).
- **If built:**
  - SB ≈ 1.25 d: start/end time on the leave; the block and the make-up skip only the hours that overlap; the leave panel and the coach's LINE show the time;
  - SF ≈ 0.75 d: time fields in the leave dialog, the strip shows the time;
  - **≈ 2 d, medium risk** (leave touches the co-teaching and lift paths).
- **Today's workaround:** she leaves the coach's other hours alone and moves only the classes in 10–12 by hand.

### D. Coach working hours (e.g. weekend afternoons only): **days yes, hours no**
- **She can set working DAYS herself today:** หน้าครู (Teachers) → each coach's «วันทำงาน» (every day / weekdays / weekend / custom). Booking on a day off is refused.
- **Hours per day are not supported:** `teachers.work_days` holds weekdays only.
- **If built:**
  - SB ≈ 0.75 d: hours per weekday; the booking check refuses outside them; the slot picker greys them out;
  - SF ≈ 1 d: from/to per ticked day in the same «วันทำงาน» control;
  - **≈ 1.75–2 d, low–medium risk.**
