# TASK-645 — BE: **the `LAST` badge stays after attendance** (REQ-113) — **back end only**
**From @Sober to @Jason.** ✅ **Owner ruled; @Porter claimed the files to Team A: `src/services/scheduler.service.ts` · `src/lib/course-plan.ts`, with their co-located tests.** ✅ **No front-end change — one back-end change fixes BOTH grids.** 🚫 **Never per screen.**
📌 **Sized by @Silver (Team B), handed over because the cause is in our file. He found the trap below; it is his finding.**

---

## 1. Why it matters
**Khwan's admin team uses the badge at END OF DAY to find which students finished a course, to chase coach feedback.** 🔴 **It disappears the moment the last session is checked in — exactly when they look.** *A flag correct all day and absent at review time is worse than none: the team believes the list is complete.*
⚖️ **RULINGS:** **(1) the badge STAYS after attendance · (2) a `NO_SHOW` on the final date KEEPS it — the course has still ended · (3) it becoming PERMANENT on that cell is INTENDED** (the owner was told before he ruled).

## 2. 🔴 The cause is in THREE places, not one — **and my pre-read named only one**
**I told @Porter "one back-end change". It is one RULE, but the old "live only" rule is written in three places, and fixing one changes NOTHING:**
1. **`deriveLiveEndDate`** — max date over `COURSE_LIVE` only. **Called by `liveEndDateByCourse`.**
2. 🔴 **`isCourseLast` itself requires `COURSE_LIVE.has(row.status)`** — so even with a corrected date, an ATTENDED row is never badged.
3. 🔴 **`liveEndDatesForCourses` (scheduler.service) QUERIES only `COURSE_LIVE_STATUSES` rows** — ATTENDED and NO_SHOW rows are never fetched, so no date could include them.
🔑 ⇒ **All three move together, or the badge still vanishes.** **I checked the callers: `liveEndDatesForCourses`, `liveEndDateByCourse` and `isCourseLast` are used ONLY for the badge. `deriveLiveEndDate` is SHARED.**

## 3. 🔴 THE TRAP — @Silver's, confirmed: **`deriveLiveEndDate` MUST NOT CHANGE**
**It is the PLAN's displayed end and it feeds course history.** **Widening it would move the displayed end date of EVERY course.** 🔑 *Widening a function two features read is how one fix becomes two defects.*
⇒ ▶️ **The badge gets its OWN rule: "last lesson" = max date over `COURSE_LIVE ∪ COURSE_DELIVERED`.**
✅ **Both sets already exist** (`COURSE_DELIVERED` is exactly `{ATTENDED, NO_SHOW}`). 🚫 **Do NOT hand-roll a status list.** **The owner's NO_SHOW ruling is then satisfied BY CONSTRUCTION** — *a rule built from a union of existing definitions cannot drift from them.*

## 4. ▶️ What to do
- **A `deriveLastLessonDate` beside `deriveLiveEndDate`, over the union** — 🚫 never a change to `deriveLiveEndDate`.
- **`liveEndDateByCourse` → uses it, and is RENAMED** (e.g. `lastLessonDateByCourse`). 🔑 **A function still named "live end" that no longer returns the live end is a lie waiting for the next reader** — and it sits beside the one that DOES.
- **`liveEndDatesForCourses` → fetches the union's statuses, and is renamed to match.**
- **`isCourseLast` → accepts a row in the union.** ⚠️ **It must STILL refuse a non-course row and a `SICK_LEAVE`/`CANCELLED` row dated last** — those are not lessons.
- 📌 **State in the code, at the rule: a make-up added AFTER the last attended session MOVES the badge to the make-up — correct, it is now the last lesson.**

## 5. 🔴 The pin that reverses OUR OWN decision — **correct it, never delete it**
**`course-last-badge-req089.test.ts:54-58` asserts *"the badge leaves the past cell at attendance"*.** **`REQ-089` never asked for that; `TASK-366` added the reading and pinned it.** ▶️ **Correct it to REQ-113's ruling, with the old claim quoted and the reason it changed.** 🔑 *A deleted assertion looks like it was never there; a corrected one records what we used to believe and why we stopped.*
⚠️ **And its comment in `course-plan.ts` (*"the badge leaves the past cell by construction"*) is now FALSE — correct it too.**

## 6. ✅ Done means
1. **`tsc` · the no-DB suite with COUNTS · migrations balanced (🚫 no migration expected).**
2. **Value tests: all-ATTENDED ⇒ the last ATTENDED row is badged · a NO_SHOW last ⇒ badged · a SICK_LEAVE dated last ⇒ NOT badged, the lesson before it is · a make-up after the last attended ⇒ the badge moves to it · a non-course row ⇒ never.**
3. 🔴 **`deriveLiveEndDate` pinned UNCHANGED by value** — the plan's displayed end for an all-attended course is exactly what it was.
4. **Mutations, filed and named, test list IN the file:** **each of the three sites reverted to live-only (each must BITE on its own)** · **`deriveLiveEndDate` widened instead (must BITE on the plan-end pin)** · **a hand-rolled status list missing NO_SHOW (must BITE).**
5. **Through the calendar read, end to end: an attended last session still carries `courseLast: true`.** 🔑 **That is the seam this defect lived on.**

## 7. 🚫 Not in this task
**`StudentSelect.tsx` or anything in the parentless-children work (`TASK-644`, Team B's)** · **the front end** · **`teacher-scope.test.ts` (frozen until `TASK-653`).**

## ✅ 2026-10-04 — @Jason: DONE — all three sites, and `deriveLiveEndDate` pinned UNCHANGED by value
**`tsc` 0 · the DB-unreachable suite 3916 pass · 0 fail · 65 = 65 — no migration.**
**Set: `src/lib/last-badge-task645.mutations.json` — 7 / 7 BITE**, baseline 69, CHECKSUM identical. **Test list in the file.**
🔑 **`L1`, `L2`, `L3` revert each site ON ITS OWN and each bites alone** — which is the proof of your §2: fixing (or breaking) one changes nothing at the other two.

### §4 — what changed
- **`deriveLastLessonDate`** — `max(date)` over `COURSE_LIVE ∪ COURSE_DELIVERED`, **beside** `deriveLiveEndDate`, never instead of it.
- **`liveEndDateByCourse` → `lastLessonDateByCourse`** and **`liveEndDatesForCourses` → `lastLessonDatesForCourses`**. 🔑 **The rename arrived as COMPILE ERRORS at every reader, which is how I know the list of readers is complete** — not from a grep.
- **`isCourseLast`** accepts a row in the union, and **still refuses a `SICK_LEAVE`/`CANCELLED` dated last and any non-course row** (`L7` lets a leave count and bites).
- **The QUERY fetches the union's statuses.** 🚫 **No hand-rolled list: I added `COURSE_DELIVERED_STATUSES` (the typed form of the set that already existed) and `COURSE_LESSON_STATUSES = [...LIVE, ...DELIVERED]`, so the predicate and the query read the SAME union and cannot drift.** **`L5` and `L6` hand-roll a list missing NO_SHOW — at the query end and at the predicate end — and both bite.** ⇒ **the owner's ruling 2 holds BY CONSTRUCTION.**
- 📌 **Written at the rule: a make-up added AFTER the last attended session MOVES the badge to the make-up — correct, it is now the last lesson.** Pinned by value.

### 🔴 §3 — the trap, pinned by VALUE and not by intention
**`deriveLiveEndDate` is untouched**, and the test says what that protects: **for an all-attended course it still answers `null`, and on a mixed course it still stops at the last LIVE row while the badge's rule answers the last lesson.** **`L4` widens the shared function instead and BITES on the plan-end pin.** 🔑 **@Silver's sentence is the one I kept in view: *widening a function two features read is how one fix becomes two defects.*** 📌 **Its byte-for-byte source pin also survives, deliberately.**

### 🔴 §5 — the pin that reversed our own decision: CORRECTED, never deleted
**`course-last-badge-req089.test.ts` asserted *"the badge leaves the past cell at attendance — a delivered last means NO live end, so no row is last"*.** ▶️ **The old claim is quoted inside its replacement, with WHY it changed:** REQ-089 never asked for it — **TASK-366 (ours) derived the badge from the live end, noticed the consequence, and pinned it as if it were the requirement.** **The owner has now ruled the other way, knowing the badge becomes permanent on that cell.**
✅ **Its FALSE comment in `course-plan.ts` is corrected the same way — the old sentence survives only as a quotation inside the correction.**
🔑 *A deleted assertion looks like it was never there; a corrected one records what we used to believe and why we stopped.*

### ⭐ §6.5 — the seam
**`src/services/last-badge-seam-task645.test.ts` drives the REAL query function over an executor that APPLIES its `WHERE`** (the bound statuses are read out of the condition, so a filter that excludes ATTENDED returns nothing, exactly as the live one did), **feeds the result through the REAL predicate, and renders the REAL DTO.** ✅ **An all-attended course ⇒ the last ATTENDED row reaches the DTO as `courseLast: true`.** ✅ **NO_SHOW last ⇒ badged · SICK_LEAVE last ⇒ not, and the lesson before it is · a make-up after the last attended ⇒ the badge moves · a non-course row ⇒ never.**
⚠️ **What it does NOT cover, said rather than implied: the wiring from `getCalendar` into `isCourseLast` stays pinned AT SOURCE** (one grouped read before the loop, both readers) — **no test in this repo drives `getCalendar` end to end, and building one was not this task.** 📌 **Worth knowing, because that is the one link in this chain still proven by reading rather than by value.**
