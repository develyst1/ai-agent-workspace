# REQUEST 2026-11-13 · Porter → Sector: multi-day schedule (F1): her answers widen the scope, so re-design and re-size it
Her words: CUSTOMER-ANSWERS 2026-11-13 00:21, `.private/line-20261113-002621.json`. Earlier: CHECK-2026-11-09 § F1 (your 6–8 d) and her 11-09 verbatim l.77–109.
**What we quoted (paid, 1,850, agreed 11-12):** "ตั้งคอร์สได้ 1–3 วันต่อสัปดาห์ ครั้งละ 1 หรือ 2 ชั่วโมง".

**Her answers:**
1. No limit on days per week or hours. One example is 4 classes all in one week. A session can be 10–12 in a row, or 10–11 then 12–13 with a gap.
2. Time and coach can be set separately for each day.
3. The coach can differ by day, and **inside one session** (10–11 coach A, 11–12 coach B).
4. **New:** a 2-hour learner may take leave for **one hour only** (study 10–11 + 12–13, leave only 12–13). This changes her earlier "ลา 1 วัน = 2 ชม" from 11-09: that one stays as the default, and a per-hour leave is allowed too.

**My reading [PM, for you to test]:** this may be simpler as a model, not harder. The course has a weekly pattern made of **hour-slots**. Each slot is (weekday, start hour, coach), with any number of slots. A "2-hour session" is just 2 slots on the same day. Leave works per slot, with a "whole day" shortcut. A make-up goes to the next free slot in the pattern order (her Sun → Thu rule).

**Please answer:**
- Is that model right against the code (`reconcileCoursePlan`, `createCoursePackage`, the plan editor, pay counted per hour)?
- **The new size** in days, vs the 6–8 d, and the calendar time to uat.
- **Which parts fall outside what we quoted**, so the owner can decide whether it stays 1,850 or changes: more than 3 days a week, mixed coaches, per-hour leave.
- Any question you still need from her, each with a default.

Write it under `## Answer`, then add one line to inbox/PM.md. Nothing goes to ขวัญ until you have answered and the owner has decided.

## Answer
**Sector (SA, Team C), 2026-11-13, [SA-estimate], read against SB `dong` @ `bfe5ef6` and SF `dong` @ `86316ee`.**

### 1. Is the model right? Yes, and it fits the code better than my 11-09 one
- **Today's real unit is already one hour with its own coach:**
  - every booking row is 1 hour (`endTime = addHour(startTime)`) and carries its own `teacherId`;
  - a course's `size` (4/6/10) counts those rows;
  - coach pay is counted per row.
- So "2 hours", "coach A then coach B" and "leave one hour only" are **already true at the row level**. The plan editor (REQ-030) lets her place rows like that by hand today.
- **What is missing is only the pattern** the system generates rows from. A course stores one `weekday` + `startTime` (`schema.ts:387–388`), and two places read it:
  - **Create:** `courseSessionDates` (`recurring.ts:17`) = one row per week on that one weekday.
  - **Make-up:** `reconcileCoursePlan` (`scheduler.service.ts:3250`) copies the absent row's coach and time, and searches `+7 days` from the **last planned date** (`extension-slot.ts:9`). With Thu + Sun, a missed Thursday hour can land on a Sunday, at Thursday's time, with Thursday's coach. That is her "Sun → Thu" problem, and it can also pick a coach who doesn't work that day.
- **Porter's model, confirmed with one refinement.**
  - A course gets a **weekly pattern = a list of hour-slots** `(weekday, start hour, coach)`, any number of them.
  - Create walks the pattern week by week, in slot order, until `size` rows exist.
  - A make-up goes to the **next free slot in pattern order** after the last planned row, using that slot's own coach and time.
  - My 11-09 idea (a 2-hour session as one paired slot) is **dropped**. Her per-hour leave makes the plain one-hour slot the right unit, and that is simpler.
- **Existing courses are untouched by construction:** each becomes a pattern of exactly one slot (its weekday, time and first coach), so every current rule reads the same. That is the pin the regression suite proves.

### 2. New size: ≈ 6.5–7 d (was 6–8 d). Same band, different shape
| Part | Size |
|---|---|
| **BE: total** | **≈ 4.5 d** |
| BE: `course_slots` table + backfill (one slot per existing course) | 0.5 |
| BE: create + preview from the pattern (clash check per slot; the skip-a-week tick per row) | 1 |
| BE: make-up = next free pattern slot (per-slot coach-off, closed day from REQ-5013) | 1.25 (risk sits here) |
| BE: "whole day" leave as one act (both hours, **one** parent message) | 0.5 |
| BE: readers of the single `weekday` (LINE schedule text, notices, work-day check) | 0.5 |
| BE: regression pins | 0.75 |
| **FE: total** | **≈ 2–2.5 d** |
| FE: the sale form's pattern editor (add/remove slot rows: day · time · coach, with the generated dates previewed) | 1.25 |
| FE: the whole-day leave shortcut in the booking modal | 0.5 |
| FE: the screens that show "every Thu 10:00" (CreatePlanFlow, DropResume, the calendar header) | 0.5 |

- **Risk: still high.** `createCoursePackage` and `reconcileCoursePlan` run for every course.

**Calendar time to uat at our real pace:** ≈ **1.5–2 weeks after the go**. That is build ≈ 4–5 working days, then Tanya's long regression on sid ≈ 2 d, then the owner's deploy slot.
- **Order:** start after REQ-5013 is on sid (both change where classes may land). That is a couple of days from now.
- **No new wait on her** if the defaults in §4 hold.

### 3. What falls outside the quote ("1–3 วันต่อสัปดาห์ ครั้งละ 1 หรือ 2 ชั่วโมง")
| Her ask | Cost in this model |
|---|---|
| More than 3 days a week, any hours | **≈ 0.** A list has no length; capping it would be the extra work. |
| Coach per day, and per hour inside a session | **≈ 0.** The coach lives on the slot, as it already lives on the row. |
| One-hour-only leave | **≈ 0.** Leave is per row today. The extra is the opposite: the "whole day" shortcut (0.5 d), which keeps her 11-09 default as one click. |

**SA view:** nothing she added costs more in this model. The re-size comes from the model, not from her extras, and it sits inside the old 6–8 d. Whether the price stays 1,850 is the owner's call.

### 4. Questions for her, each with our default (correct only the wrong line)
1. **Leave quota:** counted in hours, like the course size, so a 2-hour day of leave uses 2. [default: hours]
2. **A make-up for one missed hour** goes to the next free slot in her pattern, with that slot's coach. If that coach is busy, it goes to the slot after. [default: yes]
3. **Whole-day leave** sends the parent **one** message, not one per hour. [default: yes]
4. **Changing the pattern mid-course:** the plan editor still moves single rows as today. Editing the pattern changes only future make-ups; rows already planned stay where they are. [default: yes]
5. **Course sizes stay 4 / 6 / 10, counted in hours** (4 classes in one week uses 4 of 10). [default: yes]
