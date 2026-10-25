# TASK-838 — BE + FE: **REQ-127 ONE act "เปลี่ยนครู / เวลา ทั้งคอร์ส": the rest of a course moves to a new teacher, day and time** — @Jason (BE ≈ 0.85 d) + @Fern (FE ≈ 0.8 d), incl. +10%
**From @Sober, 2026-10-25.** GO by Porter; the owner: *"ทำทั้งคู่ ข้อความ OK"*. **After TASK-837 on each side** (one mutation set at a time per tree).

## Approved words (COPY-REVIEW 2026-09-29 §2026-10-25), VERBATIM
| where | TH | EN |
|---|---|---|
| the button (in "จัดการแผน" / Manage plan) | เปลี่ยนครู / เวลา ทั้งคอร์ส | Change teacher / time for the rest |
| its dialog line (`{n}` from the server's preview) | คาบที่เหลือ {n} คาบจะย้ายไปเรียนกับครูที่เลือก ตามวันและเวลาใหม่ คาบที่เรียนไปแล้วไม่เปลี่ยน | The remaining {n} sessions move to the chosen teacher, on the new day and time. Sessions already taught don't change. |

**Any other line that needs words** (a refusal, a toast, the dialog title): **reuse an existing approved string, or stop and tell me.** No new words.

## The rule (what "one act" means)
**Move the course's remaining live sessions IN PLACE**, in ONE transaction. Any refusal ⇒ nothing written.
- **Which rows:** the course's still-live sessions dated today or later. That is the SAME `endableSessions` definition the end and pause use. **Delivered rows are untouched:** they keep their teacher and date, **so the first-coach history (REQ-120 F4 / bonuses) stays readable.**
- **The new dates come from the resume planner:**
  - `courseSessionDates`, from the admin's **start date + time**, weekly, as course creation lays them out;
  - **one new date per moved row, in order;**
  - **no second scheduler.**
- **Each moved row** gets its new date, time (start / end) and **teacher**.
  - A CONFIRMED row returns to **PENDING** (its confirmation was for the old slot); the response says so, as TASK-570's start change does.
  - The admin then presses the existing **"ยืนยันทั้งคอร์ส"**, which sends ONE schedule message per person.
- **Gates, the create path's own:**
  - `assertTeacherBookable(newTeacher, date)` per date;
  - a clash with ANOTHER booking ⇒ `SLOT_TAKEN`, naming the date; the whole act rolls back;
  - the holds are reconciled per row, so the freelance ceiling moves from the old coach to the new one.
- **Not touched:** `size`, `usedSessions`, `leaveUsed`, the expiry (it may only GROW to cover the new last session, as resume does; never shrink), the sale, and the course's default rate (no rate is paid from it today; it's settled in REQ-120).
- **Not a pause:** no `droppedAt`, no "พักคอร์ส" / "dropped" wording, and **no cancelled rows**.
- **Notices:**
  - **ONE LINE per coach per act**: the old coach (the classes he no longer teaches), the new coach (the classes he now teaches);
  - **reuse TASK-436's teacher-reassigned notice** if it can carry several sessions. **If it can only carry one, stop and tell me** (no new words);
  - the family: nothing at this step; the schedule message comes at "ยืนยันทั้งคอร์ส";
  - **NOT one message per session.**
- **A preview = the act:** a dry run in a rolled-back transaction, the `previewTeacherLeave` / `applyPlanChange({dryRun})` shape. It answers `{ n, firstDate, lastDate, clashes? }`, and the dialog's `{n}` comes only from it.
- **The permission:** reuse `action:bookings.course-edit` (the plan editor's key). An ended or paused course refuses with its existing words (`assertCourseWritable`).

## BE (@Jason)
- `scheduler.service.ts`: the act + its preview (built on the resume planner + TASK-570's move-in-place); a route pair (`POST /courses/:id/change-teacher-time` + `/preview`); `route-access.ts` (+ its pins, Team A's own).
- **Tests by value:**
  - a 10-session course with 6 delivered, 1 CONFIRMED + 3 PENDING left ⇒ those 4 move to the new teacher / day / time, the CONFIRMED one is PENDING, the 6 delivered are unchanged;
  - ONE LINE to the old coach + ONE to the new coach (not 4 + 4);
  - a clash on date 3 ⇒ 409 `SLOT_TAKEN` naming it, 0 rows changed;
  - the preview writes nothing and equals the act;
  - an ended course ⇒ refused;
  - the expiry grows to cover the new last date and never shrinks.
- **Mutations:** a delivered row moved; one notice per session; the preview committing; the expiry shrinking; a clash half-applied; the CONFIRMED row left CONFIRMED.

## FE (@Fern)
- The button in `PlanModal.tsx` (gated by `action:bookings.course-edit`).
- A dialog built from `DropResumeDialog`'s pickers (start date + time + teacher, pre-set to the current teacher), showing the approved line with `{n}` from the preview. Confirm ⇒ the act.
- On a clash, show the server's sentence. On success, the plan refreshes and **"ยืนยันทั้งคอร์ส" is the next step** (the existing button).
- **Tests by value:** the approved words, n from the preview, the request body, the clash sentence shown.
- **Mutations:** n computed on the client; the teacher not sent; the button shown without the permission.

## Done means
Per side:
- tests by value + a set (each bite shown);
- tsc 0 · suite / `bun test` / build;
- `unhandled-between-tests: N`;
- `git status` in full.

**List every pin file before editing.** **Git: on the owner's word only.**


## Jason (BE) 2026-10-25 — TASK-838 BE: STOP, as the task says — TASK-436's teacher-reassigned notice carries ONE session only. Need your ruling (no new words)

**Finding (read the code, not a guess):** `sendTeacherReassigned(tx, bookingId, old, new)` (scheduler.service.ts:3669) enqueues `teacher_unassigned` / `teacher_assigned` with `{ kind, bookingId }` and nothing else. The renderer (`line-message.ts:825-845`) builds its body from ONE booking's `ctx`: `Student`, `Subject`, and a single `Time` = `dd-mm-yyyy HH:mm-HH:mm` of that row. It cannot list several sessions. Calling it per moved row = **N + N messages** (4 + 4 for your example), which the TASK forbids.

**Option (b) — what I propose (no new words):** let the SAME two kinds carry a list. The payload gains an optional `sessions: [{ date, startTime, endTime }]`; the renderer prints the existing `Time` label once per session (one line each, `dd-mm-yyyy HH:mm-HH:mm`, the SAME format as today) when `sessions` is present, and is **byte-identical** when it is absent (so every existing single-row send, `moveBooking` / `applyPlanChange`, is unchanged). Title, `Student`, `Subject` keys are the existing approved strings. 838 sends ONE `teacher_unassigned` to the old coach and ONE `teacher_assigned` to the new coach per act. Cost: ~0.1 d on top of 838; touches `lib/line-message.ts` (the `teacher_assigned/unassigned` case) + a new helper `sendCourseTeacherChange(tx, …)` next to `sendTeacherReassigned`; a pin or two on that case (Team A's own) — I'll list them.
**Option (a):** one message per session (4+4) — rejected by the TASK. **Option (c):** no coach notice at all in 838 — also contrary to the TASK.

**Meanwhile I am building everything that does NOT need the answer:** the act `changeCourseTeacherAndTime` (+ its preview = the act in a rolled-back transaction), the route pair, `route-access` entry. I will NOT write the notice until you rule. Ball: Sober — (b)? and GO for its pins when I list them.

## ⚖️ 2026-10-25 — @Sober → @Jason: the coach notice. **Proposal (b) ACCEPTED, no new words**
- `teacher_assigned` / `teacher_unassigned` get an **optional** `sessions: [{date, startTime, endTime}]`.
  - When present, the renderer prints **the existing Time line once per session**, in date order.
  - When absent, the output is **byte-identical** to today (a by-value test pins both shapes).
- **838 sends exactly ONE to the old coach and ONE to the new coach per act.**
  - The old coach's message lists the sessions he loses (at their OLD date / time).
  - The new coach's message lists the sessions he gains (at their NEW date / time).
  - If old = new teacher (only the time changes), **no reassign pair at all**: the moved sessions follow the existing move notice rules, still one per person per act. If that needs words, stop and tell me.
- **Claims added:** `lib/line-message.ts` (that one case) + a helper beside `sendTeacherReassigned`. **List the pins first** (the kind-count / inventory pins are Team A's own).
- **Tests:** the absent field ⇒ the old bytes; 3 sessions ⇒ 3 Time lines; the act ⇒ exactly 2 outbox rows.
- **Mutations:** sessions ignored (only one line printed); one message per row; the old coach shown the NEW times.
- **Wording note (no change):** the titles are singular ("A class has been assigned to you" / "คาบสอนนี้ถูกย้ายออก…"). With several times under them they read as ONE class (the course) on several dates, which is true. Porter is told, for transparency.


## Jason (BE) 2026-10-25 — TASK-838 BE: act + preview + routes + notice BUILT; SIX pins listed (waiting for GO) + 3 questions

**Built (ruling (b) applied, no new words):** pure plan `lib/course-teacher-time-change.ts` (`endableSessions` + "today or later" + `courseSessionDates`, one new date per moved row, a safe write order) · the act `changeCourseTeacherAndTime` + `previewCourseTeacherAndTime` (the act run inside a transaction that is ALWAYS rolled back; answers `{ n, firstDate, lastDate, clashes? }`) in `scheduler.service.ts` · `POST /courses/:id/change-teacher-time` + `/preview` (validation `changeCourseTeacherTime`, route-access entries) · the coach notice `sendCourseTeacherChange` (ONE `teacher_unassigned` per distinct old coach, ONE `teacher_assigned` to the new one, only rows whose teacher changes) + the renderer's optional `sessions` list (absent ⇒ byte-identical). tsc 0. First full run: the new code breaks exactly SIX existing pins (the other 3 reds are TASK-749's):

1. `src/lib/coach-notice-inventory-task512.test.ts` (exact producer list, `:86`) — add `sendCourseTeacherChange` to `NAMED_BY_DESIGN` ("the old coach(es) and the new coach — named people, one notice per act").
2. `src/lib/rbac-stage1-users-req092.test.ts:169` — `actorOf(c)` count 24 → 25 (+ the chain note).
3. `src/lib/teacher-reassigned-notice-req097.test.ts:124` — the inline `teacher_unassigned` enqueue count 1 → 2 (the new helper is a named, pinned second site; the single-row helper stays the only `sendTeacherReassigned`).
4. `src/services/course-ended-writes.test.ts` (route classification, `:194`) — the 2 new routes classified `"guarded"` (`assertCourseWritable` first).
5. `src/services/course-expiry-edit.test.ts:223` — `recordExpiryChange(` count 5 → 6.
6. `src/services/leave-week-triggers-task656.test.ts:568` — the exact writers-of-`expiryDate` list gains `"scheduler.service.ts · runCourseTeacherTimeChange · update"` (it grows the expiry only, via `replanExpiry`, like the resume).

**Three small questions (I will take the default if you say nothing):**
- **Permission key:** the TASK names `action:bookings.course-edit` as "the plan editor's key", but the plan routes use `action:bookings.course-plan`; `course-edit` is `PATCH /courses/:id`. I used **`course-edit`** (literal; Fern gates the button the same). Say if you meant `course-plan`.
- **Same-coach (time-only) change:** no coach notice and no family message at all (the existing `announceMove` is one message PER ROW, which breaks "one per person per act"); the schedule message comes at "ยืนยันทั้งคอร์ส". If you want a one-per-act time-only notice, that needs words → I stop.
- **No `TEACHER_CHANGE_TOO_LATE` (the ≥ 3-day rule of the single-row teacher swap)** and **no change of a row's own rate override** (`teacher_rate_minor` stays as the row had it): the TASK lists neither. Say if either should apply.

Next: my tests + set 838 while you decide. Ball: Sober — GO for pins 1–6.

## ⚖️ 2026-10-25 — @Sober → @Jason (+ @Fern): the 6 pins GRANTED + 3 answers
**Pins 1–6: GRANTED** (Team A's own), minimal edits, each point kept:
1. `coach-notice-inventory-task512`: the new named-by-design entry;
2. `rbac-stage1-users-req092:169`: the `actorOf` count 24 → 25;
3. `teacher-reassigned-notice-req097:124`: the `teacher_unassigned` count 1 → 2;
4. `course-ended-writes`: the 2 routes classed as guarded;
5. `course-expiry-edit:223`: the `recordExpiryChange` count 5 → 6;
6. `leave-week-triggers-task656:568`: the writers list + `runCourseTeacherTimeChange`.

**Q1, the permission: use `action:bookings.course-plan`, NOT `course-edit`. My task was wrong.**
- This act RE-PLANS the course's sessions, exactly like TASK-570's start-date change, which uses `course-plan` (`route-access.ts:175-176`).
- `course-edit` is for editing the course record.
- Both routes (act + preview), the pins, and **@Fern: the button gate** use `action:bookings.course-plan`.

**Q2, a time-only change (same coach): ✅ as you built it.**
- No reassign pair and nothing sent at the act.
- The moved CONFIRMED rows go back to PENDING (`needsReconfirm` in the response), and the existing **"ยืนยันทั้งคอร์ส"** then sends the schedule to the coach and the family. That's the same contract as TASK-570.

**Q3: ✅ both as you built them.**
- **No `TEACHER_CHANGE_TOO_LATE` gate:** this act is resume-like (the admin picks the start date), and resume has no such gate either. The plan editor's per-session move keeps its rule.
- **Rows' own rate overrides are untouched:** no rate is paid from them today, and "the new coach's rate" is settled inside REQ-120 (noted in my 10-25 read).


## Jason (BE) 2026-10-25 — TASK-838 BE (REQ-127 "เปลี่ยนครู / เวลา ทั้งคอร์ส") — GREEN (my files)

**Built (back):**
- `lib/course-teacher-time-change.ts` (pure plan): `endableSessions` + "today or later"; `courseSessionDates` — ONE new date per moved row, in order; a CONFIRMED row → PENDING; a safe write order (a forward shift moves the last row first, a backward one the first); refusals `START_IN_PAST` (400) / `NOTHING_TO_MOVE` (409, the existing words).
- `scheduler.service.ts`: `runCourseTeacherTimeChange` (one body for act AND preview): `assertCourseWritable` first (ended ⇒ `COURSE_ENDED`, paused ⇒ `COURSE_DROPPED`), `assertTeacherBookable` per date, 23505 ⇒ **409 `SLOT_TAKEN` naming the date** (the existing sentence), holds reconciled per row, expiry via `replanExpiry` (grows, never shrinks) recorded through `recordExpiryChange`, `reconfirmNeededSince` set when rows un-confirm; the course's `weekday` / `startTime` follow (as the resume does). Not touched: size / usedSessions / leaveUsed / sale / rates / rows' own rate overrides; no cancelled row, no `droppedAt`.
- `changeCourseTeacherAndTime` (act) + `previewCourseTeacherAndTime` (the SAME body inside a transaction that is always rolled back ⇒ `{ n, firstDate, lastDate }`, plus `clashes: [date]` where the act would refuse).
- Routes `POST /courses/:id/change-teacher-time` + `/preview` (validation `changeCourseTeacherTime` = `{ teacherId, startDate, startTime }`; the act passes the actor); `route-access`: **`action:bookings.course-plan`** for both (your ruling; equal to `start-date`).
- Notice (ruling (b), no new words): `sendCourseTeacherChange` — ONE `teacher_unassigned` per distinct old coach (his sessions at their OLD slot) + ONE `teacher_assigned` to the new coach (NEW slots); only rows whose teacher changes ⇒ a same-coach change tells nobody. Renderer (`line-message.ts`, that one case): optional `sessions` ⇒ the existing Time line once per session in date order; absent/empty ⇒ byte-identical.

**Pins (your grant, 6 files, minimal):** `coach-notice-inventory-task512` (named-by-design entry) · `rbac-stage1-users-req092:169` 24→25 · `teacher-reassigned-notice-req097:124` 1→2 · `course-ended-writes` (2 routes `guarded`) · `course-expiry-edit:223` 5→6 · `leave-week-triggers-task656` (writers list + `runCourseTeacherTimeChange`, kept in sort order).

**Tests (new `src/lib/course-teacher-time-change-task838.test.ts`, 18, by value through the real service with a fake transaction that really rolls back):** 10 sessions / 6 delivered / 1 CONFIRMED + 3 PENDING ⇒ exactly those 4 written (the planner's dates, new teacher, 15:00-16:00), c1 → PENDING with its confirm fields cleared, the 6 delivered NOT written, no cancel / `droppedAt` / counters · **ONE notice per coach: exactly 2 outbox rows** (old coach's 4 OLD slots, new coach's 4 NEW slots) · same coach ⇒ 0 notices · **clash on the 3rd date ⇒ 409 SLOT_TAKEN naming it, 0 rows committed, 0 notices** · ended ⇒ COURSE_ENDED / paused ⇒ COURSE_DROPPED, 0 writes · expiry grows and never shrinks (+ recorded with the admin as actor) · **preview writes nothing and EQUALS the act**; a clash ⇒ `clashes: [date]`; ended refused · plan: only live rows dated today+ move, the write order is safe both directions, the two refusals · renderer: absent ⇒ old bytes, 3 sessions ⇒ 3 Time lines in date order · source pins (routes + key, the act's gate order, no insert / cancel, preview = act in a rollback, one notice helper, one call).
**Set `course-teacher-time-change-task838.mutations.json`: 12/12 BITE, 0 survivors, checksum identical** — A1 a delivered row moved · A2 one notice per session · A3 the preview commits · A4 the expiry shrinks · A5 a clash half-applied · A6 CONFIRMED left CONFIRMED · A7 `sessions` ignored · A8 the old coach shown the NEW times · A9 a time-only change sends the pair · A10 the ended gate removed · A11 the new teacher not written · A12 the write order broken.

**Verified:** tsc 0 · full suite **5,147 pass / 3 fail (5,150 tests, 368 files)** — the 3 reds are still TASK-749's (`day-end-sweep` / `jobs.service.ts`), none mine; unhandled 0. `git status` saved: `GIT-STATUS-back-838-2026-10-25.txt` — mine (non-test): `course-plan.ts`, `line-i18n.ts`, `line-message.ts`, `migration-witness.ts`, `route-access.ts`, `api.ts`, `validation.ts`, `scheduler.service.ts`, `_journal.json`, set 690 (modified); new: `0072_*.sql`, `course-teacher-time-change.ts`, sets 837 + 838; plus TASK-749's `jobs.service.ts`, `day-end-sweep.ts`, `day-end-sweep-task749.mutations.json` (not mine). My run had `.env` present; your no-.env room is yours.

**For Fern:** body `{ teacherId, startDate, startTime }` (HH:mm); preview answer `{ n, firstDate, lastDate, clashes? }` — the dialog's `{n}` comes only from it; act answer `{ n, moved, firstDate, lastDate, teacherId, needsReconfirm, expiryDate, previousExpiryDate, expiryExtended }`; a clash is `409 SLOT_TAKEN` (the sentence names the date, `details.date`); ended / paused ⇒ 409 `COURSE_ENDED` / `COURSE_DROPPED`; key `action:bookings.course-plan`.

Ball: Sober for 838 (and 836 / 837 earlier).

## ✅ 2026-10-25 — @Sober: TASK-838 BE VERIFIED, together with 837 (the combined back tree)
- **No-`.env` clean room** of `bd69978` + **61 files** (837 + 838; **Team B's 4 TASK-749 files excluded**): tsc 0 · SAFE suite **5,128 / 0**, 367 files · unhandled 0 · **73 = 73**.
- **Sets, one at a time:** 838 **12/12** · 837 8/8 · 690 9/9. 0 survivors, checksums identical.
- The routes are gated by `action:bookings.course-plan` (as ruled).
- 🧊 **The back tree is frozen for 837 + 838.** The file list + md5s are kept for the commit list. The FE half (Fern) is pending.

---
## FE report — Fern, 2026-10-25 — TASK-838 FE DONE (front only; nothing committed by me)
**Built against Jason's route names as written in the task** (`POST /courses/:id/change-teacher-time` + `/preview`; his routes are not in the back yet, so none of this has met a real server).
**Change:**
- `PlanModal.tsx`: ONE button "Change teacher / time for the rest" inside the `courseWritable` block (so an ended / paused course never shows it), gated `action:bookings.course-edit`; the dialog is mounted only while open and reads the same slot / teacher facts the pause dialog reads.
- NEW `ChangeTeacherTimeDialog.tsx`: `DropResumeDialog`'s pickers (`course.firstDate`, `course.time`, `booking.teacher`; pre-set to the course's own slot and CURRENT teacher). **The preview is asked on open and whenever an input changes** (a late answer to an old input never replaces the current one); the sentence's `{n}` is the server's `n`; **Confirm waits for the answer to THESE inputs**; the act's body is `{ startDate, startTime, teacherId }` with the teacher ALWAYS named (even unchanged). A refusal (clash `SLOT_TAKEN`, ended/paused) is the server's own sentence in the alert; nothing else happens. Success: the dialog closes, the plan re-reads (`invalidateAll`), "ยืนยันทั้งคอร์ส" is the next step. **No success toast** (no approved string exists for it).
- `scheduler.service.ts` (+ mock), `useScheduler.ts` (`usePreviewChangeTeacherTime`, `useChangeTeacherTime`), `contract.ts` (`ChangeTeacherTimeInput`, `ChangeTeacherTimePreview {n, firstDate, lastDate, clashes?}`). `dictionaries.ts` (EN + TH): `plan.changeRest` (button AND the dialog title) + `plan.changeRestLine` = the approved text, verbatim, marked "✅ APPROVED by the owner 2026-10-25 (REQ-127)". Every other string in the dialog is an existing one (`common.confirm`, `common.cancel`, `course.*`, `booking.teacher`); a test pins the dialog's exact key list so no new word can slip in.
**Pins (listed to you first):** TURNED, 1 file / 2 lines: `action-gate.test.ts` `SITE_INVENTORY` (+`ChangeTeacherTimeDialog.tsx → …course-edit`, +`PlanModal.tsx → …course-edit`). One pin I had NOT listed went red and I did not edit it: `resume-teacher.test.ts:49` reads a fixed 1400-char window after `export const resumeCourse` and forbids a bare `teacherId: input.teacherId,` — my new service functions fell in that window (a window accident, not a violation: this act names its teacher on purpose). **I moved my functions above `resumeCourse` instead** (a comment says why); the pin is untouched and green.
**Tests by value** (`change-teacher-time-task838.dom.test.tsx`, 11): the approved EN + TH strings exactly · no «copy pending» and the dialog's `t()` keys are exactly the 9 existing/approved ones · the preview is asked first on `/courses/c1/change-teacher-time/preview` with the course's own time, the CURRENT teacher and the default date, and writes nothing · the sentence shows the server's n (4, and a different 9) · TH sentence · Confirm disabled while the dry run is pending, enabled after · the act goes to `/courses/c1/change-teacher-time` with EXACTLY `startDate, startTime, teacherId`, the unchanged teacher included · a 409 clash shows the server's sentence, one request only, the dialog stays · Confirm gated by `bookings.course-edit` (source-read; see note) · the plan button: gated, inside the writable block, approved label · the dialog mounted only while open.
**Mutation set `scripts/mutation/task-838.json`** (alone; no runner before or after; CHECKSUM identical; baseline 30/0): M1 🔴 client n · M2 🔴 teacher not sent · M3 🚫 plan button without the key · M4 confirm before the answer · M5 🔴 clash swallowed · M6 EN line reworded · M7 TH button shortened · M8 wrong preview route · M9 🚫 dialog Confirm without the key — **all 9 BITE.**
**Gates:** tsc 0 · build 0 · `bun test` **1378 pass / 0 fail** (146 files) · `unhandled-between-tests: 0`.
**Two things I hit that are worth knowing (both fixed, both in the test, not the product):**
1. `mock.module` is process-global and another file stubs `useCan` for everyone, so a "no key ⇒ no Confirm" RENDER test passed alone and **failed in the full run — and the failure killed `bun test` itself (exit 127, no summary)** rather than reporting red. I replaced it with a source read (the render-level proof of permission lives in the action-gate sweep + M9).
2. Another file stubs `ApiClientError` with a different constructor, so a clash's sentence could arrive as its CODE; the test now exports its own error class from its own mock.
**`git status --short -uall` (front):**
```
 M src/components/partials/Bookings/EndCourseDialog.tsx        (837)
 M src/components/partials/Bookings/PlanModal.tsx
 M src/hooks/scheduler/useScheduler.ts
 M src/lib/i18n/dictionaries.ts
 M src/lib/rbac/action-gate.test.ts
 M src/lib/scheduler/session-cancel-reasons-task691.test.ts     (837)
 M src/lib/scheduler/voucher-end.test.ts                         (837)
 M src/services/scheduler.mock.service.ts
 M src/services/scheduler.service.ts
 M src/types/api/contract.ts
 M src/types/app/scheduler/index.ts                              (837 + 838 types)
?? scripts/mutation/task-837.json                                (837)
?? scripts/mutation/task-838.json
?? src/components/partials/Bookings/ChangeTeacherTimeDialog.tsx
?? src/components/partials/Bookings/change-teacher-time-task838.dom.test.tsx
?? src/components/partials/Bookings/end-course-early-task837.dom.test.tsx   (837)
```
**Not done / caveats:** never run against a real back; the preview's `clashes?` is typed but not rendered (its shape is not in the task and there are no approved words for it — a clash is shown through the server's refusal sentence when the act is refused); the success path shows no toast; the dialog's teacher PICK (choosing a different teacher) is not exercised by a clicked test (the unchanged-teacher body is — a Mantine Select pick under happy-dom was not worth the flake); the old/new-coach notice, CONFIRMED→PENDING and the expiry are all the back's.

## 🔧 2026-10-25 — @Sober → @Fern: TASK-838 FE checked. ONE fix, then the combined verify
- ✅ **The routes, the body** (`teacherId` + `startDate` + `startTime`, always sent) **and the preview type** (`{ n, firstDate, lastDate, clashes? }`) **match Jason's back exactly.** The 4 approved strings are verbatim.
- 🔧 **`PlanModal.tsx:488` gates the button with `action:bookings.course-edit`. It must be `action:bookings.course-plan`.** My correction (above, 10-25) reached your inbox but not your session, because my nudge didn't go out.
  - The back's routes now require `course-plan`, so a user with only `course-edit` would see a button whose call is refused.
  - Fix the gate, plus its test + the set-838 mutation that guards it ("the button shown without the permission" must bite on the RIGHT key).
- Then re-run `bun test` + set 838 + set 837, and nudge me. **I verify 837 + 838 together and re-prove the build on the combined tree.**

---
## FE fix — Fern, 2026-10-25 — the gate is `action:bookings.course-plan` (relayed by Porter; Sober's two entries read)
- `PlanModal.tsx` (the button, ~:488): `action:bookings.course-edit` → **`action:bookings.course-plan`**. **Also `ChangeTeacherTimeDialog.tsx` (the Confirm, which is the act):** the same key — otherwise a `course-plan`-only user would get the button but no Confirm, and the back's routes require `course-plan`. (Your entry named only :488; this second site is the same defect, so I fixed it too — say if you object.)
- Pins turned (Team A's own; the two lines I had added and listed): `action-gate.test.ts` `SITE_INVENTORY` — `ChangeTeacherTimeDialog.tsx → …course-plan`; `PlanModal.tsx` now lists `course-plan` twice and my `course-edit` line is gone.
- My test now asserts the right key and that `course-edit` is ABSENT from both sources; the set-838 mutation that guards the gate was re-aimed (M3: button without the key; **new M10: button gated by the WRONG key `course-edit` again**; M9 re-aimed to the dialog's Confirm).
- **Re-run:** `bun test` **1378 pass / 0 fail** (146 files) · tsc 0 · build 0 · `unhandled-between-tests: 0` · set **838: 10/10 BITE** · set **837: 9/9 BITE** (each alone, no runner before/after, CHECKSUM identical). `git status --short -uall` is unchanged from the report above (same 17 files).
- **Not done — please confirm:** your FIRST entry also said *"show `needsReconfirm` as the existing start-change screen does (no new words)"* and that a time-only change sends nothing at the act. The later entry says ONE fix and that everything else matches Jason's back, so I did NOT add a `needsReconfirm` display (the act's response is not read; the plan re-reads and "ยืนยันทั้งคอร์ส" is the next step). If you do want it shown, tell me which string of the start-change screen to reuse and I will add it.

## ⚖️ 2026-10-25 — @Sober → @Fern: needsReconfirm: **YES, show it. Reuse the APPROVED start-change strings, no new words**
- The act answers `needsReconfirm` (back `scheduler.service.ts:6431`) and stamps `reconfirmNeededSince`, which already feeds the attention list.
- **On success, when `needsReconfirm > 0`, show the same orange alert `ChangeStartDateDialog.tsx:185-187` shows,** with the approved keys `courseStart.reconfirmTitle` ("{n} sessions need confirming again" / "{n} คาบต้องยืนยันใหม่") + `courseStart.reconfirmBody` (APPROVED 2026-10-11, COPY-REVIEW:592).
  - **The same keys, not copies.** At 0, nothing is shown.
- **Why:** without the prompt, an admin can move a course and never press "ยืนยันทั้งคอร์ส", and then the family and the coach keep the OLD schedule. This is the exact risk TASK-570 guards.
- **Test:** `needsReconfirm: 2` ⇒ the alert with n = 2; 0 ⇒ no alert.
- **Mutation:** the alert hidden (must bite).
- Then `bun test` + sets 838 / 837, and nudge me. **This is the last FE item:** I then verify 837 + 838 together.

---
## FE — Fern, 2026-10-25 — needsReconfirm DONE (the last FE item; ruled YES by you, relayed by Porter)
- `ChangeTeacherTimeDialog.tsx`: when the act answers `needsReconfirm > 0`, the dialog **stays open and shows the start-change screen's orange alert** — `courseStart.reconfirmTitle` ({n} = the server's `needsReconfirm`) + `courseStart.reconfirmBody`, the SAME keys (APPROVED 2026-10-11), no copies, no new word; its only control is the existing `common.close`, which runs `onDone` + `onClose` (the plan behind re-reads). At 0 or absent: nothing shown, the dialog closes as before.
- `contract.ts` `ChangeTeacherTimeResult { needsReconfirm? }`; service/mock typed to it (mock answers 2 offline).
- **Tests by value** (+4 → 15 in `change-teacher-time-task838.dom.test.tsx`): `needsReconfirm: 2` ⇒ the alert with n = 2 (`data-change-reconfirm="2"`), the approved body text, the dialog still open (`closes` = 0, no Confirm left) until Close · TH: 3 ⇒ "3 คาบต้องยืนยันใหม่" + the approved Thai body · 0 and absent ⇒ no alert, closed onto the plan · the dialog uses the start-change keys (source) and those keys' text is the approved text. The dialog's exact `t()` key list pin now includes `courseStart.reconfirmTitle` / `reconfirmBody` / `common.close`.
- **Mutation set 838: 13/13 BITE** (new M11 🔴 alert hidden · M12 n ≠ the server's · M13 shown at 0; the earlier 10 unchanged) · **set 837: 9/9 BITE** (each alone, no runner before/after, CHECKSUM identical).
- **Gates:** tsc 0 · build 0 · `bun test` **1382 pass / 0 fail** (146 files) · `unhandled-between-tests: 0`.
- One thing the repo's own sweep taught me (fixed): `dom-assert-readable.test.ts` (TASK-596) turned red on my first version — I had `expect(document.querySelector(…)).toBeNull()`, which prints the DOM on failure. It is a count now. `git status --short -uall` is unchanged (the same 17 files as the report above).

## ✅ 2026-10-25 — @Sober: TASK-837 + TASK-838 VERIFIED TOGETHER → READY (`DEPLOY-REQ-126-127-end-early-and-change-teacher-time-2026-10-25.md`)
- **back** (no `.env`, 749 excluded): `bd69978` + 61 files: **5,128 / 0** · 73 = 73 · sets 838 12/12 · 837 8/8 · 690 9/9.
- **front** `46c6ee1` + 16 files: tsc 0 · **1,382 / 0** · build 0 (the tree unchanged) · sets 838 **13/13** · 837 9/9.
- The back was re-checked against its frozen md5s after the front run: unchanged.
- **Commit lists:** back 61 (the 4 TASK-749 files listed as NOT in it) · front 16.
- 🧊 Both trees are frozen. **Git: on the owner's word only.**

## ⬆️ 2026-10-25 — @Sober: ขึ้น git (the owner's word, via Porter) — TASK-837 + 838 COMMITTED + PUSHED on `dong`. No deploy
- **back** **`5b5f483`** `feat: End a course early and move the rest of a course to a new teacher and time (TASK-837, TASK-838)`.
  - **Exactly the 61 named files**: staged from the frozen list (`--pathspec-from-file`), staged count = 61, 0 extra, **0 TASK-749 files staged**.
  - Push: `bd69978..5b5f483  dong -> dong`.
  - The tree is left with **only Team B's 4 TASK-749 files**, untouched.
- **front** **`f9f7f9c`** (the same message): the 16 files (all 837 / 838; tree clean after).
  - Push: `46c6ee1..f9f7f9c  dong -> dong`.
- `git fetch` first: neither branch was behind (0 / 1). **รวมโค้ด (`merge-workflow.sh`) not run** (not ordered).
- **Still the owner's:** the deploy + `db:migrate` 0072 (sid, then uat), after Tanya's gate.
