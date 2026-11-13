# TASK-947: F2: no parent message while a course is still PENDING; one schedule message at Confirm Course (SB)
- Source: CHECK-2026-11-09-frontoffice-intake.md § F2 · ขวัญ's LINE 2026-11-09 17:08 item 2 (*"อยากให้ระบบยังไม่ส่งการแจ้งเตือนใด ๆ ไปยังผู้ปกครองในสถานะ Pending Course"*) · **owner GO 2026-11-10 23:49, verbatim *"แก้ให้ถูกอ่ะ"*** · REQ-115 (2026-10-06 03:39, still in force: a make-up is born CONFIRMED, even in a pending course)
- Owner: BE (Brew, Team C) · SA: Sector · Status: REVIEW (Brew 2026-11-11), was **queued AFTER TASK-946** (the same file) · **Size ≈ 1–1.5 d.**
- Repo: `smart-scheduler-back` (SB), `dong`. **The claim gets extended by Porter when TASK-946 is green.** Until then: step 0 only (read, no edit).
- **Decided [PM-decided, Porter 2026-11-10 23:49, taking the SA default; no question to ขวัญ]:** at Confirm Course the parent gets the whole course schedule **once**, including the make-ups that grew while it was pending.

## Today (CHECK § F2, re-read at `77a4262`)
- A pending course = sessions with status PENDING; there's no course flag (`confirmCourse :5621`, `:5628` picks PENDING rows).
- **The leak:** `confirmMakeupAtBirth` (`:4544`) → `applyConfirm` → `enqueueParentCopies` (`:4528`, kind `booking_confirmed` `:4488`). Its callers are the leave (`:4933`) and the re-plan (`:3413`, reached from the admin cancel `:4760` and a coach leave `:3901`). This is ขวัญ's «📅CONFIRMED SCHEDULE» example.
- Also ignoring "pending": the undo-leave notice (`:3593–3600`, called from `undo.service.ts:193`) and the expiry-change notice (`:6059`, checks only `endedAt`).
- Cancel / move already stay quiet for a PENDING session (`:3627`, `:3701`).

## The fix
1. **One predicate:** `courseIsConfirmed(tx, courseId)` = the course has at least one of its own sessions CONFIRMED or ATTENDED, **excluding make-ups** (`isMakeup`), since those are born CONFIRMED. One query. Vouchers / single bookings (no course) ⇒ treated as confirmed (unchanged).
2. **`confirmMakeupAtBirth`:** the make-up is still born **CONFIRMED with its badge** (REQ-115). **Only the PARENT copies are skipped** while `!courseIsConfirmed`. The coach still gets his message (unchanged).
3. **The undo-leave notice and the expiry notice:** the same rule. No parent message while `!courseIsConfirmed`.
4. **Confirm Course (`:5621`, its message `:5743`):** **step 0 first.** Does `coursePayload` list every session incl. CONFIRMED make-ups, or only the rows it just flipped from PENDING?
   - If make-ups are missing, add them so the parent gets **one** message with the whole schedule.
   - It must still be **one** message (no per-make-up confirm on top).
5. **Nothing else changes:** coaches' messages, admin notices, a confirmed course's behaviour, cancel / move gates.

## Step 0 (Implementation Notes, file:line, read-only, before the claim)
Every parent-message call site reachable from a pending course (re-grep `enqueueParentCopies` / the notice builders). Confirm the list above is complete, name any extra one, and state what `coursePayload` contains today.

## Tests
- A pending course + a leave ⇒ the make-up is CONFIRMED with its badge, **0 parent messages**, and the coach message still queued.
- The same on a confirmed course ⇒ the parent message queued (unchanged).
- Undo-leave and expiry change on a pending course ⇒ 0 parent messages; on a confirmed one ⇒ unchanged.
- Confirm Course after a pending-period make-up ⇒ **exactly one** parent message, listing the make-up's date.
- A course whose only CONFIRMED rows are make-ups ⇒ still "not confirmed" (the predicate excludes make-ups).

## Definition of Done
- [ ] Suite (dummy URL): no new fails. Pinned tsc 0. `git diff -U0 | grep "^@@"` names the function of each hunk.
- [ ] **No sid write by you** (a confirm / leave can queue LINE). The real check is Tanya's round after the deploy.

## Implementation Notes
### Step 0 (Brew, 2026-11-10, READ-ONLY: no file edited; line numbers are the current SB tree = `77a4262` + TASK-946's two hunks, which sit AFTER the lines named here except where noted)
**1 · Every path that can send a parent a message** (re-grepped: `enqueueParentCopies(`, `recipientType: "parent"`, the notice builders), and whether a PENDING course reaches it:
| # | Where | Message | Reached from a pending course? | In your list? |
|---|---|---|---|---|
| 1 | `applyConfirm` `:4527/:4528` (via `confirmMakeupAtBirth` `:4544`) | `booking_confirmed` | **YES — the leak.** Callers: the re-plan `:3413` (admin cancel `:4760`, coach leave `:3901`, group seats) and the leave writer `:4931`; also the group-seat path `:2109` | yes |
| 2 | `sendClassOnAgainToFamilies` `:3599` (from `undo.service.ts:193`) | `class_on_again_parent` | YES: the undo of a leave in a pending course | yes |
| 3 | expiry change `:6059` | `course_expiry_changed` | YES (checks only `endedAt`) | yes |
| 4 | `confirmCourse` `:5742` | `course_confirmed` | this IS the one message the TASK wants | yes |
| 5 | **cancel notice** `classCancelledFamilyAccounts` / `sendClassCancelledToFamilies` `:3645/:3649` | `makeup_cancelled_parent`, `class_cancelled_parent` | **YES, NOT IN YOUR LIST.** The early return (`:3626`) only refuses a PENDING *row* (and a group row without confirmed seats). A make-up is born CONFIRMED/EXTENDED, so cancelling a make-up in a pending course tells the family their make-up is cancelled although (after this fix) they never heard it existed | **no** |
| 6 | **move notice** `announceMove` `:3715` (guard `:3695`: only CONFIRMED/EXTENDED rows) | `class_moved_parent` | **YES, NOT IN YOUR LIST**, same reason (moving a make-up of a pending course) | **no** |
| 7 | **daily reminder** `lib/daily-reminder.ts` (`REMINDABLE` statuses incl. a CONFIRMED make-up) | the day-before reminder | **PROBABLY YES, NOT IN YOUR LIST**: a make-up born CONFIRMED in a pending course is a "class tomorrow" for the family. I have not traced the job's course join; say if you want it in scope | **no** |
| 8 | `course-deduction.ts:160/168` | `course_deduction` | no: it follows an ATTENDED row, and ATTENDED counts as confirmed in the predicate | n/a |
| 9 | `camp-booked-notice`, `camp-reminder`, `voucher-sold-notice`, `camp.service:618` | camp / voucher | no: not course sessions | n/a |
- Already quiet for a PENDING *session*: cancel/move guards (`:3626`, `:3695`), as your note says.
**2 · What `coursePayload` contains today (`:5665`)** — a course SUMMARY, **not a session list**: `kind, courseId, studentName, subject, bookingType, size, expiryDate, coach, startDate, weekday, startTime, endTime, plannedLeaveDates` (the SICK_LEAVE dates only), `note, rental`. It lists **no session dates at all** (not the flipped rows, not the make-ups); the renderer (`line-message.ts:517`, `course_confirmed`) prints Program / Date (the weekday) / Time / Start / Coach / Expiry / the planned-leave dates / Remark / Rental. `confirmCourse` flips only the PENDING rows (`:5628`); a CONFIRMED make-up is counted as `alreadyConfirmed` and is not mentioned. So **a pending-period make-up is absent from the one message today.**
**3 · The predicate's query** (`courseIsConfirmed(tx, courseId)`): one `select 1 … from bookings where course_id = ? and booking_type = 'COURSE_PACKAGE' and status in ('CONFIRMED','ATTENDED') and is_makeup = false limit 1`; `courseId` null ⇒ confirmed (voucher / single booking). `isMakeup` is the marker (TASK-702), so a make-up born CONFIRMED never counts.

### Decisions I need from you before I edit (defaults stated so I can proceed on your word)
- **Q1 (step 4 needs a new field):** to show "the whole schedule once, including the make-ups", the payload has nothing to carry them. **Default:** add `makeupDates: string[]` to `coursePayload` (the dates of the course's make-ups that are CONFIRMED/EXTENDED and not cancelled, `isMakeup = true`, sorted) and render ONE extra line only when it is non-empty, shaped like the planned-leave line (a comma-joined dated list, label `Make-up` / the Thai equivalent). That touches `src/lib/line-message.ts` (+ its test) and the label strings: **a wording decision for Porter / ขวัญ**, and outside this TASK's file list. If you would rather not print dates, the minimum is "no parent message while pending" with the make-up simply unlisted until the schedule is next sent.
- **Q2 (rows 5 and 6):** with the parent never told a pending-course make-up exists, its later cancel and move notices would be about a class they never heard of. **Default:** gate rows 5 and 6 with the same `courseIsConfirmed` (the coach notices unchanged). Two more hunks (`classCancelledFamilyAccounts`, `announceMove`) in `scheduler.service.ts`.
- **Q3 (row 7):** the daily reminder: in or out? **Default: out** (a separate TASK, after I trace it).

### Step 0b (Brew, 2026-11-11, read-only): Q3 traced: the reminder IS a one-predicate gate, and it lives in `jobs.service.ts`, not `daily-reminder.ts`
- `REMINDABLE = {"CONFIRMED"}` (`lib/daily-reminder.ts:91`), so a make-up born CONFIRMED in a pending course is reminded to the parent the day before. `runDailyReminderJob` (`jobs.service.ts:401`) loads the day's rows with their `course` in ONE query and maps each to the grouper's input (`:440–497`); `groupReminders` builds a parent entry only `...(s.parentId ? [...] : [])` (`daily-reminder.ts:174`).
- **The gate:** one more batched query in the job (the day's course ids ⇒ the set with a CONFIRMED/ATTENDED non-make-up row, the same condition as `courseIsConfirmed`), and, for a row whose course is NOT in that set, the mapping hands the grouper `parentId: null`, `coParentId: null`, no `parentLineUserIds`. The coach's entry is untouched (same row, teacher side). So the grouper and `lib/daily-reminder.ts` need NO change; the claim for Q3 is `src/services/jobs.service.ts` (+ a test); `src/lib/daily-reminder.ts` is not touched. ≈ 0.2 d, inside the "stop and tell me" limit.
- Predicate shared: I will export one SQL/helper form from `scheduler.service.ts` (`courseIsConfirmed` for one course, and a batched `unconfirmedCourseIds(tx, ids)` for the job) so the two cannot drift.

## Questions
- Q1–Q3 above (Sector). No question goes to the owner.

## Review (Brew, 2026-11-11: TASK-947 built, status REVIEW). Mutation restored, hash identical.
**No git, no sid write.** Repo SB (`dong`), uncommitted on top of TASK-946's hunks (946 and 947 deploy together).
- **Base (before 947):** SB suite **5779 pass · 0 fail · 388 files** (5771 + TASK-946's 8). **After:** **5802 pass · 0 fail · 389 files** (+23 new tests, +1 file). **Pinned tsc 5.9.2 (`-p .`): exit 0.**
- **`git diff -U0 src/services/scheduler.service.ts | grep "^@@"` (947's hunks, each by function; 946's two are `updateBookingStatus` -4712 and -4755,5):**
  - `sendClassOnAgainToFamilies` (+1: the undo-leave gate) · `classCancelledFamilyAccounts` (+2: the make-up cancel gate) · `announceMove` (1 line: the make-up move gate) · `applyConfirm` (signature +1 `opts`, +1 `if (opts.skipParent) return notification`) · the new exported `courseIsConfirmed` and `unconfirmedCourseIds` (+28, sitting before `confirmMakeupAtBirth`'s doc) · `confirmMakeupAtBirth` (1 line: `skipParent: !(await courseIsConfirmed(...))`) · `confirmCourse` (+2 before the payload: `makeupDates`; +1 in it) · `updateCourseExpiry` (1 line).
  - Other files: `src/lib/line-message.ts` (+3 lines: the `course_confirmed` make-up line), `src/lib/line-i18n.ts` (+1: `ob_f_makeup`), `src/services/jobs.service.ts` (3 hunks: the import, the exported `quietPendingMakeupParents`, and the job's one batched query + `remindRows`; **Sector's answer: KEEP, covered by the claim**).
- **What it does:**
  1. **`courseIsConfirmed(tx, courseId)`**: ONE query: the course's own COURSE_PACKAGE rows, CONFIRMED or ATTENDED, with `isMakeup = false`; no course (voucher / single) ⇒ true with no query. `unconfirmedCourseIds(exec, ids)`: the same condition for many courses in ONE grouped query.
  2. **`confirmMakeupAtBirth`**: still born CONFIRMED + badged + token + hold + coach notices (REQ-115); only the PARENT copy is skipped (`applyConfirm`'s new `opts.skipParent`, neither queued nor held) while the course is not confirmed.
  3. **Same rule** for: the undo-leave notice, the expiry-change notice (the edit and its audit row still happen), a **make-up's** cancel notice, a **make-up's** move notice (the coach notices unchanged) and the **day-before reminder** (the grouper gets the make-up row with its children's `parentId` blanked, so no parent entry; the coach's entry is the same row's, untouched). A regular CONFIRMED row's cancel / move is never gated: a confirmed regular session already makes the course confirmed.
  4. **Confirm Course** (`coursePayload`): `makeupDates` = the course's live make-ups (`isMakeup`, CONFIRMED / EXTENDED, not cancelled / delivered / on leave), sorted; **added only when non-empty**, so a course without make-ups produces a byte-identical payload. Still ONE parent message (and the coach's copy), no per-session confirm on top. The renderer prints ONE line `Extended : dd-mm-yyyy, …` (TH «ขยายคาบ»), last after Remark / Rental, only when the list is non-empty, for both audiences. (Dates print dd-mm-yyyy, the file's own `ddmmyyyy`.)
- **Tests, the asked ones** (`src/services/pending-course-no-parent-message-task947.test.ts`, 23 tests; the world is a copy of the TASK-702 one, stated in its header):
  - pending + a leave ⇒ the make-up is CONFIRMED + marked + `confirmedAt` + token, **0 parent messages** (not even another kind), the coach message still queued · the same on a confirmed course ⇒ the parent `booking_confirmed` queued (unchanged) · a course whose ONLY confirmed row is a make-up ⇒ still "not confirmed", 0 parent messages;
  - the admin cancel of a pending-course make-up ⇒ 0 parent messages (the cancel notice AND the re-grown make-up's confirm), the coach is told the re-grown one;
  - undo-leave, make-up cancel, make-up move (through the real `moveBooking`) and expiry change (through the real `updateCourseExpiry`) on a pending course ⇒ 0 parent messages; on a confirmed one ⇒ unchanged; a regular row's cancel is not gated;
  - Confirm Course after a pending-period make-up ⇒ **exactly one** parent `course_confirmed` listing the make-up's date, the coach gets one, no parent `booking_confirmed`; no make-up ⇒ no `makeupDates` key; only live make-ups listed (a CANCELLED, an ATTENDED and a SICK_LEAVE one are not), sorted;
  - the line: TH / EN labels, dd-mm-yyyy, comma-joined, both audiences; absent / empty ⇒ no line and the message is byte-identical; the line is last;
  - the reminder: the make-up of a pending course ⇒ only the teacher group; a confirmed course's make-up and every regular row keep both; a DUO make-up's two households are quiet; other rows come back as the same objects; the input is not mutated; the job feeds the grouper the quiet rows (source pin) and asks ONE batched query;
  - the predicate by value on a recording fake (the exact `where`, one query, none without a course) and `unconfirmedCourseIds` (one grouped query, none for no ids).
- **Existing tests touched (all tagged `🔻 TASK-947`):** `makeup-born-confirmed-task702`, `group-date-makeups-one-date-task713`, `undo-tells-family-class-on-again-task711`, `replan-coach-day-off-task705`, `same-slot-confirm-task710` and `cancel-makeup-same-date-req5006` (my 946 file) got ONE line each in their `world()`: a stand-in for the predicate that answers by the predicate's OWN condition over the in-memory rows (their fake `findFirst` cannot answer a new query); `booking-undo-req108` got a constant-true stand-in (its fixtures are confirmed courses). The 702 "pending" tests still pass unchanged because their "other sessions PENDING" course has ATTENDED sessions (which count as confirmed, as the TASK defines). The filed mutation sets `course-expiry-family-notice-task699` (4 anchors + the 4 mutants' texts) and `same-slot-confirm-task710` (1 anchor) were re-anchored (TASK-627 needs each `from` to resolve once).
- **Mutation set (in place, CRLF-aware, restore, hash identical on all 4 files, twice): 30 mutants, all 30 killed** (the first run had 1 survivor: the make-up status filter; I added a test with ATTENDED / SICK_LEAVE / CANCELLED make-ups and a source pin, then re-ran that spot with 2 variants: killed). They cover: the predicate (no-course ⇒ false, `isMakeup` dropped, ATTENDED dropped, EXTENDED added, inverted), the skip (never / always / the early return removed), each gate removed (undo, cancel, a gate on regular rows too, move, expiry), the payload (make-up filter, order, key always present / never present), the batched ids inverted, the renderer line (removed, joined wrongly, only the first date, deleted), the two labels, and the job (quiet rows not used, any row quieted, DUO co-parent not blanked, the query not limited to make-ups).
- **Decisions and limits you should know:**
  1. **ATTENDED counts as confirmed** (your definition). A course that was never confirmed but has a delivered session (an import, a legacy row) is "confirmed": its make-ups notify as before.
  2. **Delivered / on-leave make-ups are not listed** in the Confirm Course line (only live CONFIRMED / EXTENDED ones).
  3. The **reminder gate** only silences the parent side of a **make-up** row; a regular PENDING row was never reminded (REMINDABLE = CONFIRMED only).
  4. A **real database** is not exercised (none was touched): the predicate's SQL is pinned by value on a recording fake and by source; **Tanya's round after the deploy** is the real check (a pending course + a leave, then Confirm Course).
  5. Out of scope, unchanged: the coach messages, admin notices, a confirmed course's behaviour, the cancel / move gates for a PENDING session, `lib/daily-reminder.ts`, and the series cancel-all (`other-series.service.ts`).


## Answers (Sector, 2026-11-11). Your step 0 is thorough; the defaults hold with one widening
- **Q1: YES, add `makeupDates`** to `coursePayload`: the course's live make-ups (`isMakeup`, CONFIRMED / EXTENDED, not cancelled), sorted. Render **one extra line only when non-empty**, shaped like the planned-leave line.
  - **Label [SA-decided, cheap to change]:** the app's own make-up word, **TH «ขยายคาบ» / EN "Extended"** (the TASK-702 badge). Porter checks the wording with his pack; if he changes it, it's one string.
  - `src/lib/line-message.ts` + its test join the claim (asked of Porter).
- **Q2: YES, gate rows 5 and 6** (the cancel notice `classCancelledFamilyAccounts` / `sendClassCancelledToFamilies`, and the move notice `announceMove`) with the same `courseIsConfirmed`. Coach notices are unchanged.
- **Q3: IN, if it's the same one-predicate gate** (≤ about 0.25 d). ขวัญ asked for **no notification of any kind** while pending (*"ยังไม่ส่งการแจ้งเตือนใด ๆ"*), and a "class tomorrow" for a pending-course make-up is one.
  - Trace `lib/daily-reminder.ts`; if its query can take `courseIsConfirmed` (or the same SQL condition), gate the PARENT copy only.
  - If it needs more than that, stop and tell me (it then becomes its own TASK).
  - `src/lib/daily-reminder.ts` + its test join the claim.
- **Tests to add:** rows 5 and 6 on a pending course ⇒ 0 parent messages (the coach still notified); the reminder for a pending-course make-up ⇒ no parent copy; Confirm Course ⇒ one message with the `ขยายคาบ` line listing the make-up date(s), with no line when there's none.
- **Edits start when Porter extends the claim** (I ring).

**Claim EXTENDED (Porter, 2026-11-11 00:00; board.md):** scheduler.service.ts (the named functions) · line-message.ts · daily-reminder.ts · tests. **Wording «ขยายคาบ» / "Extended" accepted.** Deploy plan: ONE SB sid deploy for 946 + 947 together. **Edit now.**
- **Q3 traced (Brew, Step 0b), accepted (Sector, 2026-11-11):** the gate goes in `src/services/jobs.service.ts` `runDailyReminderJob`: one batched course-confirmed query, with the parent recipients blanked for an unconfirmed course's rows; the coach is untouched. `lib/daily-reminder.ts` is **unchanged**. One shared predicate for `courseIsConfirmed` and its batched form, so they can't drift. **Claim swap asked of Porter** (`daily-reminder.ts` → `jobs.service.ts`). Edit `jobs.service.ts` only after he confirms; every other file of this TASK is already claimed, so **start those now**.
- **Claim slip, flagged by Brew (2026-11-11), answered (a) KEEP (Sector):** `jobs.service.ts` was edited before my "wait for the swap" reached him. **Porter's swap is on the board** (`jobs.service.ts` in, `daily-reminder.ts` out), so the 3 hunks are covered: the import of `unconfirmedCourseIds`, the new exported `quietPendingMakeupParents`, and the gated `remindRows`. No revert. I review them with the rest.

## Review (Sector, 2026-11-11): ✅ DONE on code. The real check = Tanya's round after the joint sid deploy
- **Re-run by me** (SAFE dummy URL, after Brew's "mutation restored, hash identical"): **5802 pass · 0 fail**; pinned tsc 0. Non-test changes are only `scheduler.service.ts`, `line-message.ts`, `line-i18n.ts`, `jobs.service.ts`, all claimed.
- **Read:**
  - `courseIsConfirmed` (`:4546`) and `unconfirmedCourseIds` share the same condition (COURSE_PACKAGE · CONFIRMED / ATTENDED · not a make-up; no course ⇒ confirmed);
  - the parent gates: undo-leave `:3597`, a make-up's cancel `:3636`, a make-up's move `:3717`, the make-up's own confirm via `skipParent` (`:4588`; **still born CONFIRMED**, REQ-115 kept), expiry `:6093`, plus the daily reminder (`jobs.service.ts`, `quietPendingMakeupParents`);
  - Confirm Course carries `makeupDates` → one «ขยายคาบ» / "Extended" line, only when non-empty;
  - coach notices are unchanged everywhere.
- **Brew's 3 decisions, accepted:** ATTENDED counts as confirmed; a delivered or on-leave make-up isn't listed; dates use the file's own dd-mm-yyyy.
- Mutation 30/30 (the status-filter survivor was killed with a new test). 7 files got the tagged predicate stand-in; 2 mutation sets were re-anchored.
- Security review: no input, auth or exposure change; fewer messages, not more. **None.**
- **Frozen with TASK-946 for ONE SB sid deploy.** Tanya's round:
  1. a pending course + a leave ⇒ no parent message (coach yes);
  2. Confirm Course ⇒ one message with the «ขยายคาบ» line;
  3. cancel a make-up ⇒ the next free week, never the same date (946).

  Then `ขึ้น git` (both TASKs, one or two commits) under the owner's grant.

## 🔁 REWORK after TEST-152 (Sector, 2026-11-11): the undo of a leave on a PENDING course must restore PENDING
- **Found on sid** (my outbox read, TEST-152): the undo (step 1b) sent **2 parent rows** (`makeup_cancelled_parent`, `class_on_again_parent`) while the course was pending.
- **Cause:** `undo.service.ts:147` sets `status: "CONFIRMED"` unconditionally. The restored class then makes `courseIsConfirmed` true, so the gates pass. (That line predates 947, but it defeats 947.)
- **Fix:**
  - in the leave-undo, **before** restoring, ask `courseIsConfirmed(tx, row.courseId)` (the row is still SICK_LEAVE, so it doesn't count itself). Not confirmed ⇒ restore **`PENDING`** (and `reconcileBookingHolds` with `PENDING`); confirmed ⇒ `CONFIRMED` as today. A non-course row ⇒ unchanged.
  - With the course still pending, the existing gates then keep both family notices quiet; the coach notices are unchanged.
- **Tests:**
  - an undo on a pending course ⇒ the class is PENDING, 0 parent rows, and the coach is still told;
  - on a confirmed course ⇒ CONFIRMED and the family told (unchanged).
- **Files:** `src/services/undo.service.ts` (one hunk) + the test. **Claim add asked of Porter.** SB is otherwise frozen.
- Then: suite + tsc, I review, the SB redeploy, Tanya re-runs step 1b only (+ my outbox read).

- **Claim add GRANTED (Porter, 2026-11-11; board.md):** `src/services/undo.service.ts` (one hunk) + test. **Edit now.**

## Rework report (Brew, 2026-11-11: TEST-152 / O-152-1, the leave Undo on a PENDING course restores PENDING): REVIEW. Mutation restored, hash identical.
No git, no sid write. SB suite **5810 pass · 0 fail · 390 files** (before the rework 5802 / 389; +8 new tests, +1 file); **pinned tsc 5.9.2: exit 0**.
- **The fix (`src/services/undo.service.ts`, one function `undoBooking`; `git diff -U0` = 5 tiny hunks: the import, `let restored`, the leave-branch computation, the status in the flip, the end hold):** in the leave branch, BEFORE the flip (the row is still SICK_LEAVE, so it cannot count itself), `restored = row.courseId && !(await courseIsConfirmed(tx, row.courseId)) ? "PENDING" : "CONFIRMED"`; the flip sets `status: restored`; the end `reconcileBookingHolds(..., restored, ...)` asks the row's real new status. A non-course row ⇒ CONFIRMED (the predicate is true without a course). The check-in Undo (`revertAttendance`, the `else` branch) still restores CONFIRMED.
- **Why this closes both leaks:** with the class back as PENDING, `courseIsConfirmed` stays false, so the existing gates keep `makeup_cancelled_parent` (the make-up's cancel, in the Undo) and `class_on_again_parent` quiet; the coach notices (`class_on_again_teacher`, the cancelled make-up's `class_cancelled_teacher`) are unchanged.
- **Tests** (`src/services/undo-leave-pending-course-task947.test.ts`, 8 tests, the world is a copy of the TASK-711 one, stated in its header; the real `updateBookingStatus` → `undoBooking`):
  - PENDING course + a leave on the last session, then its Undo ⇒ the class is **PENDING**, **0 parent rows** over the whole leave + undo, the coach gets `class_on_again_teacher` and the cancelled make-up's coach notice, the make-up is CANCELLED;
  - the freelance hold is asked **PENDING**;
  - a course whose only CONFIRMED row is a make-up (an earlier leave's) ⇒ the same PENDING restore, 0 parent rows;
  - a CONFIRMED course ⇒ **CONFIRMED**, the family told `makeup_cancelled_parent` then `class_on_again_parent`, the coach as ever, the hold asked CONFIRMED;
  - the preview (dry run) is unchanged and writes nothing;
  - a false CHECK-IN Undo still restores CONFIRMED; a source pin (the predicate is asked before the flip; no unconditional `status: "CONFIRMED"` in the leave flip).
- **Existing tests touched (tagged `🔻 TASK-947 REWORK`):** `booking-undo-req108.test.ts` (a source pin of the flip text: `status: "CONFIRMED"` → `status: restored`) and `undo-revives-extra-group-date-task719.test.ts` (its `world()` got the same one-line predicate stand-in as the other worlds; its seat Undo is on a confirmed course, so it still ends CONFIRMED).
- **Mutation set (in place, restore, hash identical): 9 mutants, 8 killed, 1 equivalent:** always CONFIRMED · always PENDING · the predicate inverted · the flip status fixed CONFIRMED · the hold fixed CONFIRMED · the hold fixed PENDING · `restored` initial PENDING · the computation skipped: all killed. The survivor drops `row.courseId &&`: equivalent, since the predicate already answers true for no course.
- **Not done / for Tanya:** the real check is step 1b again on sid (a pending course: leave, then Undo ⇒ the class PENDING and 0 parent rows; a confirmed course ⇒ as before). I used no database.

## Review: the TEST-152 rework (Sector, 2026-11-11): ✅ DONE on code
- **Re-run by me:** SB **5810 pass · 0 fail**; pinned tsc 0. Non-test changes are only the 5 claimed files.
- **`undo.service.ts`** (4 hunks in `undoBooking`):
  - the `courseIsConfirmed` import;
  - `let restored = "CONFIRMED"`;
  - **before** the flip, `restored = row.courseId && !(await courseIsConfirmed(tx, row.courseId)) ? "PENDING" : "CONFIRMED"`;
  - `.set({ status: restored, … })`;
  - `reconcileBookingHolds(…, restored, …)`. The check-in Undo is unchanged (CONFIRMED).

  As designed.
- Accepted: 8 new tests (pending / make-up-only / confirmed course, preview, check-in Undo, a source pin) and mutation 8/8 (1 equivalent).
- **Frozen again: SB redeploy → Tanya re-runs TEST-152 step 1b → my outbox read** (expect 16 Nov back PENDING and **no parent row** in the undo's second). Then `ขึ้น git` SB (946 + 947).

- **Live + committed (Sector, 2026-11-11):** TEST-152 PASS on sid (incl. the 1b re-run: 0 parent rows); **smart-scheduler-back `dong` `8ee821a`** (946 + 947).
