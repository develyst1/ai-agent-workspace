# REQ-5016: Multi-day schedule (F1): a course's weekly pattern made of hour-slots

**Status:** ✅ TEST_PASSED on sid 2026-11-13 (Tanya, TEST-159 + re-tests; SB 40f2917 / SF 6ffaa6e) · fixes TASK-973/974/975 + TASK-972 Amd 1/1b · NOT_TESTED: LINE pattern text (owner wording), coach-away make-up, notices, Duo, TH/375 · next: uat on the owner's «รวมโค้ด»/«release code» · was: SPEC_DONE 2026-11-13 (Sector) · SPEC-109 · TASK-969 + 970 (Team C) ✅ · TASK-971 + 972 (Team B) ✅ · **Written:** 2026-11-13 by Porter (PM) · **Team:** C (Sector) · **Priority:** HIGH
- This is **paid** front-office work: 1,850 ฿ of the 4,000 deal. It is agreed, not paid (owner 2026-11-12/13: *"ยังไม่จ่ายนะ แค่ตกลง"* · *"ทำไปต่อ นั่นแหละ แต่อย่าเพิ่งแจ้งขวัญ"*).
- **Don't tell ขวัญ** about progress until the owner says so.
- The build pause until 14 Nov covers the back office only, so this may start now.

**Source:**
- ขวัญ's words, in CUSTOMER-ANSWERS:
  - 2026-11-13 00:21 (her answers 1–3 and per-hour leave);
  - 00:43–00:46 (leave counted in weeks; (2), (3) and (5) "ตามนั้น");
  - 01:01 ("ข้อ 4 ใช่ค่ะ ถ้ามีการเปลี่ยนตารางเรียนใหม่ตอนเปลี่ยนคอร์ส").
- Earlier: her 11-09 verbatim, and CHECK-2026-11-09 § F1.
- Design basis: Sector's answer in `REQUEST-porter-to-sector-2026-11-13-multi-day-her-answers-resize.md` § Answer, and log 2026-11-13 [00:57] (≈ 7.5 d).

## Problem
- A course today is one weekday at one start time: "every Thu 10:00".
- Parents buy courses that meet on several days, for 1 or 2 hours, sometimes with a gap, and with a different coach by day or by hour.
- ขวัญ builds these by hand in the plan editor today.
- Make-ups break. A missed Thursday hour can land on a Sunday at Thursday's time with Thursday's coach (her "Sun → Thu" problem).

## Acceptance criteria
1. **Pattern at create:** when selling a course, the admin sets a weekly pattern of any number of hour-slots. Each slot = weekday · start hour · coach.
   - There is no limit on days per week or hours.
   - Several slots on one day may be in a row (10–11, 11–12) or have a gap (10–11, 12–13).
   - Each slot has its own coach, including inside one session (10–11 coach A, 11–12 coach B).
   - The generated dates are previewed before saving.
2. **Generation:** classes are created week by week in slot order until the course size is reached. Size stays 4 / 6 / 10, counted in hours, so "10 classes, Mon–Thu 1 hour each" uses 4 in the first week.
   - Each class is checked for clashes, closed days (REQ-5013) and coach leave or hours (REQ-5015), as single classes are today.
3. **Make-ups:** a missed hour goes to the **next free slot in the pattern order** after the last planned class, with that slot's coach and time. If that coach is busy or away, it goes to the slot after that.
4. **Leave:**
   - A learner may take leave for one hour only, or a whole day (all that day's hours) in one act.
   - A whole-day leave sends the parent **one** LINE message, not one per hour.
   - **The leave quota is counted in WEEKS, as today**, not per hour (ขวัญ 00:43, *"ตอนนี้เรานับเป็นสัปดาห์นะคะ ไม่ได้นับสิทธิ์เป็นครั้ง"*).
5. **Changing the pattern mid-course:** the remaining (not yet taught) classes move to the new pattern (ขวัญ 01:01, Q4 = yes). This extends today's change-teacher-time flow (TASK-838).
6. **Everywhere that shows "every Thu 10:00"** (create plan, drop/resume, calendar header, LINE schedule text, notices) shows the pattern correctly.
7. **Existing courses behave exactly as today.** Each becomes a one-slot pattern, and the regression suite stays green.

## Out of Scope
- Changing prices or the price card. A different coach per slot does not change the course price.
- Group / Duo courses with a pattern, unless Sector finds they fall out for free. Say which in the SPEC.
- Coach pay rules. Pay stays per hour, as today.
- Telling ขวัญ anything (owner's hold).

## Notes
- **Size [SA-estimate, Sector]:** ≈ 7.5 d. That is the 6.5–7 d base, plus 0.25 d for the weeks-based quota and 0.5 d for moving classes on a pattern change.
- **Risk is high:** `createCoursePackage` and `reconcileCoursePlan` run for every course.
- **Deploy:** this ships with a later combined deploy. It must not leave the shared SB/SF tree half-done at a deploy ask (F-068 / F-072, joint gate).
- Rows already deployed to sid (SB 738b6eb / SF 6c52040) are not affected until this is committed.
- **A question to ขวัญ goes through me**, with a default. Her (5) check "ลง 10 ครั้ง เรียนทุก จันทร์ - พฤ นับเป็น 4 ไหม" is read as "yes, the first week uses 4 of 10" [PM-decided, cheap to reverse]. Tell me if the code disagrees.

## AC4 correction (Porter, 2026-11-13, from Silver's TASK-971 review)
- Today a leave sends the family **no** message at all (TASK-305: there is no parent recipient on a leave). So "one message for a whole-day leave" would be a new message with new wording.
- **Decided [PM, cheap to reverse]:** keep today's behaviour. A whole-day leave sends no family message, the same as a one-hour leave.
- I'll put "add a family message for leave?" in the owner's wording pack.

## Owner decision 2026-11-13: two teams
- Owner: *"ให้ทีม B ช่วยเลย"*. Team B (Silver → Bob, Fanta) takes part of REQ-5016 to bring the sid date forward.
- **Sector** names the slice in SPEC-109, with a file list that doesn't overlap TASK-969/970, and the hand-off contract.
- **Silver** cuts Team B's TASKs from that slice.
- The claim stays with Team C as the design owner. Team B gets only the files Sector lists.
- Same rule as before: no half-done shared tree at a deploy ask.

## Questions
- **Sector, 2026-11-13:** three questions with defaults, in SPEC-109 §7.
  1. **The LINE weekly-pattern line** «จ 10:00, 11:00 · พฤ 12:00» needs the owner's OK on the format. Default: until then, the message lists dates only.
  2. **Pattern order** starts from the course's start weekday [SA-decided].
  3. **At most 21 slots a week** [SA-decided].
  - **Her (5) check is right in the code:** 10 classes on Mon–Thu → 4 · 4 · 2.
  > answer (Porter, 2026-11-13):
  > - Q1: go with the default (dates only). I'll take the format «จ 10:00, 11:00 · พฤ 12:00» to the owner together with REQ-5015's «เวลา {from}–{to}» as one wording pack, and file his answer here.
  > - Q2 and Q3: accepted [PM, cheap to reverse].
  > - Duo yes / group-seat no: accepted. That fits the Out of Scope.
  > - Claim granted per SPEC-109's file lists.
  - **Duo gets the pattern for free. Group-seat courses don't** (they follow the group's own schedule).
- **Porter, 2026-11-13: owner asks for faster; can Team B take a slice?**
  > **answer (Sector, 2026-11-13): yes, a clean slice. [SA-proposed; Silver cuts his TASKs from it]**
  > **The split** (SPEC-109 §8 has the file lists):
  > | Team / engineer | Slice | Size |
  > |---|---|---|
  > | **Team B, Bob (SB)** | §3.3 whole-day leave + quota per course week (both `leave_used` doors + undo) and §3.4 change-pattern act + resume. Bob built TASK-961's "change activity" act on the same TASK-838 shape. | ≈ 1.75 d |
  > | **Team B, Fanta (SF)** | «ลาทั้งวัน» in `BookingModal` + the change-pattern dialog. She did TASK-962's dialog in the same files. | ≈ 1 d |
  > | **Team C, Brew (SB)** | migration + DTO + `course-pattern.ts` (`Slot`, `expandPattern`, `courseWeekOf`, `nextFreeSlot`) + create / preview + the make-up branch + LINE. | ≈ 3.25 d |
  > | **Team C, Flash (SF)** | the pattern editor at sale + the displays. | ≈ 1.5 d |
  >
  > **The seam:** Brew delivers `src/lib/course-pattern.ts` (types + pure helpers) and the migration **first, within ≈ half a day**. Bob builds on them and never edits them. If Bob needs a change, he asks through Porter → me.
  >
  > **Fastest sid date** [SA-estimate, measured pace]:
  > - 1 team: ≈ **2026-11-18**.
  > - 2 teams: ≈ **2026-11-16**: the BE critical path drops from ≈ 5 d to ≈ 3.25 d. Then the joint gate + the owner's deploy.
  >
  > **Risk (medium, manageable):**
  > 1. Brew and Bob both edit `scheduler.service.ts` (different functions) and append to `validation.ts` / `contract.ts`. Edit-tool collisions mean a re-read and retry, not lost work, but both must re-read before each edit.
  > 2. One full suite: either team can turn the tree red for the other. The rule is "the suite is green before you hand in".
  > 3. Review: Silver reviews Bob / Fanta; I review Brew / Flash **and the integration** (the change-pattern act re-places rows with `expandPattern`).
  > 4. One migration only (Brew's).
  >
  > **Until Porter's go,** Brew and Flash are told to leave the Team B slice untouched.
