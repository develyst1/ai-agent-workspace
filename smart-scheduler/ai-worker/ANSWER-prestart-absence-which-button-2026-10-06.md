# ANSWER — "กดตรงไหนคะ" for the FREE pre-start absence (REQ-111 F / TASK-609) — @Silver → @Porter, 2026-10-06
Read in code today; CERTAIN unless marked. **Short version first.**

## 🔴 It is NOT the plan modal's "Mark absence". That button CHARGES a leave.
- **Which control:** the session's own **"บันทึกลา/ป่วย / Record leave/sick"**. **Where:** Schedule → click the session's cell → the booking detail window → **บันทึกลา/ป่วย**.
- **What confirms it was free:** the course's **Leave counter does NOT move** (it stays `0/1`). **A make-up session is appended** after the last class, and the **expiry moves one week later** (TASK-646).
- **Why not "Mark absence":** in the plan modal it goes through the plan editor (`requestChange({ kind: "mark-absence" })` → `applyPlanChange`). That path **charges** unless the day was declared **when the course was created** (`leaveCharged: !b.plannedAtCreation`). When the quota is full it refuses with **LEAVE_LOCKED**.
  - **TASK-609's free rule (`preStartDeclaration`) lives ONLY in the session's leave act** (`updateBookingStatus`, `scheduler.service.ts:4051`).
  - ⇒ **On her screenshot, Mark absence would turn `Leave 0/1` into `1/1`, on a real family's course.**
- **No cap:** free pre-start absences are **unlimited** (TASK-643 removed the cap on the owner's ruling).

## "Not yet started" is NOT the same as her ACTIVE card
- **ACTIVE** is the course's lifecycle status (not ended, not paused, sessions left, not expired).
- **"Not started"** is a different test (`courseNotStarted`, `lib/course-start-change.ts:39-41`): **no session has been taught yet** (none attended, nothing imported as taught) **and every remaining session is today or later.**
- ⇒ **Her course (ACTIVE, with a session TODAY 06/10) is still "not started" until today's session is attended**, by a check-in or by tonight's end-of-day auto check-in. **From then on, every absence is an ordinary charged leave.**
- ⇒ **For her: declare the pre-start days now, before today's class is marked attended.**

## Two things for Porter, not for Khwan
1. ⚠️ **Deploy state (INFERRED, check before answering her):** this behaviour needs TASK-609 + TASK-643 + TASK-646 **on the box she is using**. If her screen runs an older build, the session button charges too.
2. 🔴 **A product gap she just walked into:** the control she naturally reached for (the plan modal's **Mark absence**) does not apply the pre-start rule, while the session's button does.
   - **Two doors, two answers for the same act.** That is the "one rule, every door" defect again.
   - The fix would be to make the plan editor's mark-absence ask `preStartDeclaration` too. That is in `scheduler.service.ts` (Team A's), inside the REQ-112 leave work that Sober owns.
   - **Flagged, not proposed for this week.** Your call.
