# SIZING — REQ-113: the `LAST` badge vanishes once the session is checked in — @Silver, 2026-10-04
**Size only.** 🚫 Nothing is cut, nothing is started, and nothing is in the sid batch.
🔴 **STOP condition met (Porter's own):** the cause is a **back-end field**, and its query lives in **`scheduler.service.ts`, Team A's file.** Whose work this is, is Porter's call.
All facts are **CERTAIN**, read in code today, unless marked otherwise.

## 1. Is the badge computed from "remaining", or from an explicit flag? **Neither: from the course's LIVE end date, and attendance removes it BY DESIGN**
- **Front end:** `LastStamp` (`BookingCellBody.tsx:88-90`) renders only the server's `courseLast === true`. **The front decides nothing.**
- **Back end:** `courseLast` is set in `toBookingDTO` from `isCourseLast(row, lastByCourse)` (`scheduler.service.ts:466`, `:559`).
  - `isCourseLast` (`lib/course-plan.ts:92-98`) is true only for a COURSE row whose status is **LIVE** (`PENDING · CONFIRMED · EXTENDED`) and whose date is the course's **live end date**.
  - **The live end date is read by a query that selects only LIVE rows** (`liveEndDatesForCourses`, `scheduler.service.ts:480-487`), using `deriveLiveEndDate`.
- ⇒ **The moment the last session becomes ATTENDED**, by a check-in or by the end-of-day auto-attend, it is not live. The course then has no live end, and **no row is LAST.**
- 🔑 **This was a design decision, not a slip.** TASK-366 wrote it into the function's comment ("the badge leaves the past cell by construction") and pinned it in a test: `course-last-badge-req089.test.ts:54-58`, *"the badge leaves the past cell at attendance"*.
  - **The owner's REQ-089 item 5 never asked for that.** He asked for a big LAST badge "stuck on" the schedule, admin-facing (`REQ-089` §2, item 5). Removing it at attendance was the team's reading.
  - ⇒ Khwan's report **overturns a team assumption, not an owner ruling.**

## 2. Does the same loss hit the weekly view and the daily report?
- **Weekly view: YES, the same defect.** Both grids render the same `LastStamp` from the same `courseLast` field (`CalendarGrid.tsx` and `CalendarWeekGrid.tsx`). One back-end fix fixes both. 🚫 It must not be fixed per screen.
- **Daily report: NO.** It never shows LAST (no `courseLast` in `components/partials/Reports`). It has also been dropped by the owner.
- **Plan modal: NO.** Its `courseLastRow` is a different thing: it is the last row's coach, not the badge.

## 3. Badge or report? She asked for a BADGE, and she described a REPORT ("who finished today")
**Option 1: keep the badge after attendance. BE S, FE none.**
- **The change:**
  - A separate pure "last LESSON date" over **live + ATTENDED** rows, in `lib/course-plan.ts`.
  - The badge query widened to read ATTENDED too (`scheduler.service.ts:486`).
  - `isCourseLast` accepts an ATTENDED row.
- 🔴 **`deriveLiveEndDate` must NOT change.** It is the plan's live end and feeds every expiry read. That is exactly why the badge needs its own rule rather than a tweak to the shared one.
- Re-pin `course-last-badge-req089.test.ts:54-58` to the new decision. It must be corrected, not deleted, citing REQ-113.
- **Files:** `lib/course-plan.ts` (unclaimed by either team) and **`scheduler.service.ts` (Team A's).**
- **Visible consequence:** the badge stays on that cell for good, because a finished course's last lesson keeps its LAST in the history. **I read that as what she wants** (the evening review, and looking back), but the owner should know.
- **One edge for the owner:** a **NO_SHOW** on the final date. Did the course "finish"? For chasing coach feedback, probably yes. Today a NO_SHOW is not live either, so it loses the badge too.

**Option 2: a "who finished today" list. Cost depends on Option 1.**
- **On top of Option 1: FE only, XS–S.** The day's calendar rows already carry `courseLast`, so the list is a filter of the day the admin is looking at, with student, coach and program. No new read.
  - Where it lives is the owner's call: the schedule page, or "Needs attention".
- **Without Option 1: BE S/M + FE S.** That needs a new read: courses whose last lesson date is D, with their status. That is a new route and service, and the service file is Team A's.
- ⭐ **Note what her team actually does:** they look at the evening schedule to see who finished. **Option 1 alone restores exactly that,** in the place they already look. Option 2 is better at "nobody gets missed", because a list cannot be scrolled past.

**My reading, for Porter to weigh (the owner chooses):** Option 1 first. It is a bug against what she relies on, it is small, and it is the base that makes Option 2 nearly free if the owner wants it.

## Questions, all of them, for the owner via Porter
1. **Badge, list, or both?**
2. **NO_SHOW on the final date:** does it keep LAST?
3. **The ownership question (Porter's):** Option 1 needs `scheduler.service.ts` (Team A) plus `lib/course-plan.ts` (unclaimed). Which team, and when?
