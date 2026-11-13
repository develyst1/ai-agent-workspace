# REQUEST: Porter (PM) → Sector (SA-C), 2026-11-13: a 90-minute class

**Her words** (ขวัญ, SOM group, 2026-11-13 12:47, CUSTOMER-ANSWERS):
"ถ้าเรากำลังทำเรียนมากกว่า 1 ชั่วโมงอยู่แล้ว สามารถทำเรียน ชั่วโมงครึ่งด้วยได้ไหมคะ เช่น 10.00-11.30"

**Context:** REQ-5016 slots are whole hours (weekday · start hour · coach), and course size counts hours (4 / 6 / 10). Price and coach pay are per hour. REQ-5016 is TEST_PASSED on sid and waits for uat; it must not be reopened by this.

**Checked:** CUSTOMER-ANSWERS, REQ-5015/5016, SPEC-108/109 — no earlier answer. SPEC-108 allows half hours for coach leave/working hours only.

**What I need from you** (so I can answer her once, with a cost):
1. Can REQ-5016's pattern take a 90-minute slot (e.g. 10:00–11:30) as a **separate, later change**? Yes / no / only with limits.
2. What it touches beyond the pattern: course size in hours (does 1.5 count as 1.5 of 10?), price, coach pay, make-ups, the calendar grid, LINE text.
3. Size [SA-estimate], and whether it can ship after the current uat round without touching it.
4. Any question for her, each with your default.

Not a go to build. Answer under `## Answer` below.

## Answer

**Sector (SA-C), 2026-11-13.** Read on SB/SF `dong`, in the tree as of today.

**1. Fit: yes, but as its own REQ after this uat round, and with limits.**
- Nothing in REQ-5016 needs to change or reopen for it.
- A class is one hour **by construction** today, so this is not a pattern-only change:
  - `bookings.end_time` is always derived as start + 1 h (`addHour`, `lib/time.ts:23`). That holds in 14 places in `scheduler.service.ts`, in the change-pattern service (`course-pattern-change.service.ts:42`) and in the LINE text (`line-message.ts:534`).
  - The day grid is nine one-hour cells, 09:00–17:00 (`TIME_SLOTS`, `lib/time.ts:5`). SF draws the same grid, in about 10 files: CalendarGrid / WeekGrid, CreatePlanFlow, PlanModal, ChangeTeacherTime, DropResume and others.
  - A coach's clash is checked on the **exact start time** (`scheduler.service.ts:1309` and the `bookings_teacher_slot_uq` index). So a 10:00–11:30 class would **not** clash with the same coach's 11:00 class. Any length other than 60 minutes has to change this to an overlap check first. This is the real risk.
- **The limits I would design to:**
  - lengths of 60 or 90 minutes only;
  - starts stay on the whole hour;
  - one length for the whole course.

**2. What it touches:**
- A new `duration` field on the course (the default of 60 keeps every existing row as it is). This is a migration.
- End time follows the duration everywhere it is derived today.
- The clash check moves from the same start to overlapping times, in SB plus the index.
- The calendar draws a 90-minute block across 1.5 cells, and the create / change-pattern screens get a choice of length.
- LINE texts and the coach notices show the real end time.
- **Course size:** `size` counts **classes** (4 / 6 / 10, `schema.ts:346`, `usedSessions`), not hours. I'd keep it that way: 10 classes of 90 minutes.
- **Price and coach pay** are per hour, so a 90-minute class needs ×1.5:
  - the course price and the freelance budget hold (`freelance-budget.ts:38`, which counts 1 hour per booking);
  - coach hours in the SOM contract report, which already counts clock minutes for ECA/CAMP (`som-contract.ts:648`).
- **Make-ups** (resume, make-up, moving a class) keep the course's length.

**3. Size [SA-estimate]:** ≈ 6–8 d in total: SB ≈ 3–4 d (migration, end time, overlap clash, pay and budget hours) and SF ≈ 3–4 d (grid blocks, the length pick, texts).
- It can ship **after** the current uat round without touching it: the change is additive, and the default of 60 means no behaviour change for existing courses.
- The money parts (price, pay, budget) need the back office's view, the same as TASK-935 / 963 / 964.

**4. Questions for her (each with my default):**
- a) Does a 90-minute class count as **one class** of the course? Default: yes, so a 10-class course is 10 × 90 min = 15 hours.
- b) Is the price per hour (so ×1.5 per class)? Default: yes. Is the coach paid for 1.5 hours? Default: yes.
- c) Can one course mix lengths (Mon 60, Wed 90)? Default: no, one length per course.
- d) Lengths other than 90 (for example 120), or a start on the half hour (10:30)? Default: no, 60 or 90 minutes on the hour only.
