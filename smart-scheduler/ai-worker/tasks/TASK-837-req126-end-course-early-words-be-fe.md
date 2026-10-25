# TASK-837 — BE + FE: **REQ-126 "ตัดจบคอร์ส": Khwan's words on the existing end-course act + a 5th end reason** — @Jason (BE ≈ 0.45 d) + @Fern (FE ≈ 0.2 d), incl. +10%
**From @Sober, 2026-10-25.** GO by Porter; the owner: *"ทำทั้งคู่ ข้อความ OK"*. **THE BEHAVIOUR IS UNCHANGED** (`endCourse` already does her 4 points; my read is in inbox/PM.md, 10-25).

## Approved words (COPY-REVIEW 2026-09-29 §2026-10-25), VERBATIM
| key | TH | EN |
|---|---|---|
| the end-course button (`endCourse.action`) | ตัดจบคอร์ส | End course early |
| the new end reason `ENDED_EARLY` (dialog option + **the coach's LINE reason**) | ตัดจบคอร์ส | Course ended early |

**⏳ NOT approved yet** (they still say "ยกเลิก / Cancel"). **Build each behind a «copy pending» marker**, using the DRAFT below; Porter has the drafts for the owner. **Nothing ships with a marker.**
| key | TH (draft) | EN (draft) |
|---|---|---|
| `endCourse.title` | ตัดจบคอร์สนี้? | End this course early? |
| `endCourse.confirmLine` | ตัดจบคอร์ส {program} ของ {student} — คาบที่เหลือ {n} คาบจะถูกนำออกจากตาราง ทำแล้วย้อนกลับไม่ได้ | End the {program} course for {student} early — the {n} remaining sessions are removed. It cannot be undone. |
| `endCourse.confirm` | ตัดจบคอร์ส | End course early |
| `endCourse.done` | ตัดจบคอร์สแล้ว | Course ended early |

**The voucher's own strings (`voucher.end*`) are NOT touched.**

## BE (@Jason)
- **A COURSE-ONLY sibling set** (TASK-690's `SCHOOL_ISSUE` shape): `ENDED_EARLY` is accepted by **`endCourse` only**.
  - **The voucher end still refuses it at the door:** its DB check (`vouchers_end_reason_chk`, 0051) stays as is, and the word "course" is wrong on a voucher.
  - Do **NOT** add it to the shared `END_REASONS`. That would make the voucher path accept it and Postgres refuse it (a 500).
- **Migration `0072_*`:** widen `course_packages_end_reason_chk` to include `ENDED_EARLY`.
  - Re-runnable; no data written; journal 72 → **73**; the witness reports the new check.
  - **The migration-count pins (71 → 72 style) are Team A's own: list them first.**
- `line-i18n.ts`: `ob_reason_ENDED_EARLY` = the approved reason (TH / EN), so the coach's LINE reads it.
- **Tests by value:**
  - end a course with `ENDED_EARLY` ⇒ ended, the reason stored, the coach's LINE shows "ตัดจบคอร์ส" / "Course ended early";
  - a voucher end with `ENDED_EARLY` ⇒ a 400 refusal (not a 500);
  - the 4 old reasons unchanged.
- **Mutations:** the reason added to the shared set (the voucher accepts it); the migration's check missing it; the LINE reason text missing.

## FE (@Fern)
- `endCourse.action` → the approved words.
- The end dialog offers **ตัดจบคอร์ส / Course ended early** as a 5th reason; the other three stay.
- The 4 draft keys behind «copy pending» (above).
- **Tests by value:** the button and the reason read the approved strings; choosing the new reason sends `ENDED_EARLY`; the voucher dialog doesn't offer it.
- **Mutations:** the button back to "ยกเลิกคอร์ส"; the reason sent as another code; the voucher offering it.

## Done means
Per side:
- tests by value + a set (each bite shown);
- tsc 0 · suite / `bun test` / build;
- `unhandled-between-tests: N`;
- `git status` in full;
- the back: migrations 73 = journal 73.

**List every pin file before editing.** One mutation set at a time per tree. **Git: on the owner's word only (via Porter's "ขึ้น git").**

## ✅ 2026-10-25 — the owner APPROVED the 4 end-dialog strings VERBATIM (via @Porter, COPY-REVIEW 2026-10-25)
`endCourse.title` · `confirmLine` · `confirm` · `done`: exactly the drafts in the table above. **@Fern: drop «copy pending»** on all 4, mark them APPROVED, and pin the exact text in your test.


## Jason (BE) 2026-10-25 — TASK-837 BE: PIN LIST (before any edit) + two decisions — waiting for GO

Nothing edited yet. Full list saved: `PINS-TASK-837-2026-10-25.txt` (63 count lines + 4 semantic).

**A. Migration-count pins 72 → 73 (mechanical, one number each; the TASK-826 list pattern):** ~37 files, 63 lines — every `toBe(72)` / `toHaveLength(72)` on the drizzle `.sql` count, the journal entries and `SCHEDULING_WITNESSES.length` (incl. `witness-observability-req105.test.ts:121`, `school-issue-reason-task690.test.ts:64-65`, `services/course-expiry-edit.test.ts:40`, `services/province-and-note-req088-9.test.ts:124`).

**B. Semantic pins the change breaks (all Team A's own):**
1. `school-issue-reason-task690.test.ts:101-104` — expects ONLY `0023` to touch `course_packages_end_reason_chk` → becomes `[0023, 0072]`; `:98` (0023 still lists three codes) stays true.
2. `teacher-told-on-cancel-req089.test.ts:209` — `ob_reason_*` keys == `SESSION_CANCEL_REASONS.length` → +1 for `ob_reason_ENDED_EARLY` (the approved reason; the coach's LINE reads it).
3. `advance-leave-co-taught-task826.test.ts:523` — the 0071 test's "72 files = 72 entries" name/numbers (the 0071 assertions stay).

**Design (so the pins above are the only breakage):**
- `lib/course-plan.ts`: `ENDED_EARLY = "ENDED_EARLY"` + `COURSE_END_REASONS = [...END_REASONS, ENDED_EARLY]` + `isCourseEndReason`, the TASK-690 sibling shape. **`END_REASONS` and `endVoucher` untouched** (the voucher still refuses it at the door, 400).
- `endCourse` (service) checks `isCourseEndReason`; its INVALID_REASON `allowed` lists the course set.
- `cancelReasonText` (coach's LINE) also reads `ENDED_EARLY` → `ob_reason_ENDED_EARLY`: TH ตัดจบคอร์ส / EN Course ended early (APPROVED, verbatim).
- Migration `0072_course_end_reason_ended_early.sql`: DROP IF EXISTS + ADD `course_packages_end_reason_chk` NOT VALID + VALIDATE, with `PROGRAM_CHANGED, CUSTOMER_CANCELLED, ADMIN_ERROR, ENDED_EARLY`; journal idx 72; witness = constraint-def contains `ENDED_EARLY`. Re-runnable, no data.

**⚠️ One finding for you (not changing it unless told):** `course_packages_end_reason_chk` (0023) lists only THREE codes, but `END_REASONS` has FOUR (`TEACHER_LEAVE`). So `endCourse` with `TEACHER_LEAVE` passes the door and Postgres refuses it (23514 ⇒ a 500). No admin screen offers it, so it is latent, and the task says the behaviour is unchanged — so 0072 keeps the three + `ENDED_EARLY`. Say so if you want `TEACHER_LEAVE` added to the course CHECK as well (one more word in 0072).

Ball: Sober — GO for the pin files above (A + B), please.

## ✅ 2026-10-25 — @Sober → @Jason: pin list GRANTED + one ruling. GO
- **(A) The migration-count bumps 72 → 73 (~63 lines / ~37 files): granted** under the standing TASK-800 convention (as for 0070 / 0071).
  - ⚠️ **Read every hit before you write it** (SYSTEM-FACTS: a sweep once turned "55 minutes" into 56). Bump only a number that MEANS the migration count.
  - **Report the count of edited lines.**
- **(B) The three semantic pins: granted** (Team A's own), minimal edits, each pin's point kept:
  - `school-issue-reason-task690.test.ts:101-104` → `[0023, 0072]`;
  - `teacher-told-on-cancel-req089.test.ts:209` → the `ob_reason_*` count +1;
  - `advance-leave-co-taught-task826.test.ts:523` → the 0071 name / numbers, as they now read.
- **⚖️ Your `TEACHER_LEAVE` finding: do NOT widen the DB for it.**
  - `TEACHER_LEAVE` is written by a teacher's own leave on ROWS, and it is **not a reason to end a course**.
  - So **the course-only set = exactly what the course-end CHECK accepts after 0072**: `PROGRAM_CHANGED · CUSTOMER_CANCELLED · ADMIN_ERROR · ENDED_EARLY`.
  - **`endCourse` refuses anything else at its door with the existing `400 INVALID_REASON`**, so `TEACHER_LEAVE` now gets a 400 and never a 500. No new words.
  - **Test:** `endCourse(TEACHER_LEAVE)` ⇒ 400, 0 rows changed.
  - **Mutation:** the course door using the shared `END_REASONS` again (it must bite).
  - `END_REASONS` and `endVoucher` stay untouched, as you planned.


## Jason (BE) 2026-10-25 — TASK-837 BE: code + migration in, granted pins done — THREE MORE pin files to list (waiting for GO)

**Done (granted):** (A) count bumps 72→73: **63 lines in 38 files** (every line carried the `TASK-826: +0071` chain; each got `· 🔻 TASK-837: +0072`; 0 left over). (B) `school-issue-reason-task690.test.ts:102` → `[0023, 0072]` · `teacher-told-on-cancel-req089.test.ts:209` → `+1` (+ the key is named) · `advance-leave-co-taught-task826.test.ts:523` → the stale "72 files = 72 entries" claim dropped (the body had no count). **Built:** `ENDED_EARLY` + `COURSE_END_REASONS` (= exactly the 0072 CHECK: PROGRAM_CHANGED, CUSTOMER_CANCELLED, ADMIN_ERROR, ENDED_EARLY) + `isCourseEndReason` in `course-plan.ts`; `endCourse` asks it (400 INVALID_REASON otherwise, `allowed` = the course set); `endVoucher` + `END_REASONS` untouched; `cancelReasonText` reads `ob_reason_ENDED_EARLY` (TH ตัดจบคอร์ส / EN Course ended early); migration `0072_course_end_reason_ended_early.sql`, journal idx 72, witness (constraint-def contains `ENDED_EARLY`).

**Three pins the same change breaks, NOT in your grant (my tree run, 3 of the 8 reds):**
1. `src/lib/school-issue-reason-task690.test.ts:87-91` — "the course end and the voucher end still ask `isEndReason`": counts `if (!isEndReason(input.reason))` = 2. Now endCourse asks `isCourseEndReason`, endVoucher `isEndReason` ⇒ I'd pin ONE of each.
2. `src/lib/school-issue-reason-task690.mutations.json` (set 690) — one mutation's `from` anchor is the old endCourse guard text (line 45); re-aim it to the new text so it resolves once and still bites (`mutation-sets-task627` fails until then).
3. `src/services/course-end.service.test.ts:45` — `expect(BODY).toContain("isEndReason")` ⇒ `isCourseEndReason`.

**⚠️ Not mine — FYI:** 3 other reds in my full run come from someone else's work in the SAME tree right now: `src/services/jobs.service.ts` (modified) + new `src/lib/day-end-sweep.ts` / `day-end-sweep-task749.mutations.json` (TASK-749, not mine). Their pins on the `inArray(bookings.bookingType, ["FIRST_TRIAL", "SINGLE_SESSION", "OTHER"])` text (`group-session-req095-2a.test.ts:232`, `booking-pause.test.ts:241`, `other-booking-money.test.ts:175`) fail until that task re-aims them. I am not touching them.

Next, while you decide: my own tests + set 837 (tests by value, TEACHER_LEAVE ⇒ 400, mutations). Ball: Sober — GO for the three pins.

## ✅ 2026-10-25 — @Sober → @Jason: the 3 extra pins GRANTED (Team A's own), minimal edits, each point kept
1. `school-issue-reason-task690.test.ts:87-91`: the `isEndReason` count → pin it as one of each, as you propose.
2. `school-issue-reason-task690.mutations.json:45`: re-aim the anchor to the new guard text. **The mutation must still bite.**
3. `services/course-end.service.test.ts:45`: `isEndReason` → `isCourseEndReason`.

**The shared tree: Team B's TASK-749 is in progress in the same back working tree** (`jobs.service.ts` + `day-end-sweep*`), uncommitted, and it breaks 3 tests (`group-session-req095-2a:232`, `booking-pause:241`, `other-booking-money:175`).
- **Don't touch them.**
- **Report your suite TWICE:** (a) as is, and (b) with those 3 named as 749's.
- **Your `git status` list = TASK-837's files only.** I verify with a clean room built from 837's files alone, and the commit list will exclude 749.


## Jason (BE) 2026-10-25 — TASK-837 BE (REQ-126 "ตัดจบคอร์ส") — GREEN (my files)

**Built (back):**
- `lib/course-plan.ts`: `ENDED_EARLY` + `COURSE_END_REASONS` = `PROGRAM_CHANGED, CUSTOMER_CANCELLED, ADMIN_ERROR, ENDED_EARLY` (exactly the 0072 CHECK; no `TEACHER_LEAVE`, per your ruling) + `isCourseEndReason`. **`END_REASONS` and `endVoucher` untouched.**
- `endCourse` asks `isCourseEndReason`; anything else ⇒ the existing `400 INVALID_REASON` with `allowed` = the course set (so `TEACHER_LEAVE` now gets a 400, never a Postgres 23514 ⇒ 500). The stored reason is the input.
- Coach's LINE: `ob_reason_ENDED_EARLY` = TH ตัดจบคอร์ส / EN Course ended early (APPROVED, verbatim); `cancelReasonText` reads it.
- Migration `drizzle/0072_course_end_reason_ended_early.sql` (DROP IF EXISTS + ADD … NOT VALID + VALIDATE, the four codes; no data; re-runnable), journal idx 72, witness (`constraint-def` contains `ENDED_EARLY`). Migrations **73 = journal 73**.

**Pins (all granted):** (A) count bumps 72→73: **63 lines in 38 files** (each carried the `TASK-826: +0071` chain, each got `· 🔻 TASK-837: +0072`; 0 left over). (B) `school-issue-reason-task690.test.ts:102` → `[0023, 0072]` · `teacher-told-on-cancel-req089.test.ts:209` → `+1` · `advance-leave-co-taught-task826.test.ts:523` → stale "72 files = 72 entries" dropped. Extras (your 2nd grant): `school-issue-reason-task690.test.ts:89-91` (one `isEndReason` = the voucher, one `isCourseEndReason` = the course) · `school-issue-reason-task690.mutations.json` M3 (the new guard text) **and M6** (its anchor was the old `cancelReasonText` line — re-aimed too) · `services/course-end.service.test.ts:45` → `isCourseEndReason`.

**Tests (new `src/lib/course-end-early-task837.test.ts`, 11, by value through the real service):** the course set = 0072's list in order, no TEACHER_LEAVE, `END_REASONS` unchanged, `isEndReason("ENDED_EARLY")` false · 0072 shape + 0023 still three + 0051 untouched · journal idx 72 + witness · **`endCourse(ENDED_EARLY)` ⇒ ended, `endReason: ENDED_EARLY` stored** (fake tx) · the 3 old reasons unchanged · **`TEACHER_LEAVE` / `SCHOOL_ISSUE` / junk ⇒ 400 INVALID_REASON, 0 transactions opened** · **a voucher end with `ENDED_EARLY` ⇒ 400** (0 transactions) · the dictionary + the cancel reader + the real coach message (`course_dropped_teacher`, cause ended) read «ตัดจบคอร์ส» / «Course ended early», an old reason keeps its old label · source pin.
**Set `course-end-early-task837.mutations.json`: 8/8 BITE, 0 survivors, checksum identical** — N1 reason added to the shared `END_REASONS` · N2 the migration's CHECK missing it · N3 the LINE reader ignores it · N4 wrong EN words · N5 the course door back on the shared set (the one you asked for) · N6 TEACHER_LEAVE added to the course set · N7 witness probes the wrong word · N8 stored reason not the input. **Set 690: 9/9 BITE** after the re-aims.

**Verified:** tsc 0 · full suite **5,125 pass / 3 fail (5,128 tests, 367 files)** — the 3 reds are TASK-749's, not mine (`jobs.service.ts` + `lib/day-end-sweep.ts` in the same tree: `group-session-req095-2a:232`, `booking-pause:241`, `other-booking-money:175`); with them out, 0 of mine. Unhandled 0. `git status` saved: `GIT-STATUS-back-837-2026-10-25.txt`: src non-test = `course-plan.ts`, `line-i18n.ts`, `line-message.ts`, `migration-witness.ts`, `scheduler.service.ts`, `_journal.json`, `0072_*.sql` (new), set 837 (new), set 690 (modified) + 43 test files; plus TASK-749's `jobs.service.ts`, `day-end-sweep.ts`, `day-end-sweep-task749.mutations.json` (not mine). My run had `.env` present; your no-.env room is yours.

Starting TASK-838 now (listing its pins first). Ball: Sober for 837.

---
## FE report — Fern, 2026-10-25 — TASK-837 FE DONE (front only; nothing committed by me)
**Change:**
- `types/app/scheduler/index.ts`: NEW `COURSE_ONLY_END_REASONS = ["ENDED_EARLY"]` (sibling list, TASK-691's shape), `COURSE_END_REASONS` (spread) and `CourseEndReason`; `END_COURSE_REASONS` is still the three. The course/plan `endReason` fields (3) read `CourseEndReason`; `contract.ts` `endReason` union gains `"ENDED_EARLY"`.
- `EndCourseDialog.tsx`: the existing `{END_COURSE_REASONS.map(…)}` radios untouched; ONE added block `{!isVoucher && COURSE_ONLY_END_REASONS.map(…)}` (so a voucher never offers it); state is `CourseEndReason`, the voucher call narrows with `reason as EndCourseReason`.
- `scheduler.service.ts` / `useScheduler.ts`: `endCourse` / `useEndCourse` take `CourseEndReason`; `endVoucher` / `useEndVoucher` stay `EndCourseReason`.
- `dictionaries.ts` (EN + TH): `endCourse.action` → **End course early / ตัดจบคอร์ส**; `endCourse.ENDED_EARLY` → **Course ended early / ตัดจบคอร์ส**; `title` / `confirmLine` / `confirm` / `done` = the APPROVED text verbatim (marked "✅ APPROVED by the owner 2026-10-25 (REQ-126)", **no «copy pending»**, per your later ruling). The voucher's `voucher.end*` strings are untouched.
**Pins** (listed to you first): untouched and green — `teacher-scope.test.ts:208-211`, `voucher-end.test.ts:80`, `session-cancel-reasons-task691.test.ts:21-76`, the 691/694/695 anchors. **Turned (2, minimal):** `voucher-end.test.ts:73` (the voucher submit line gains `reason as EndCourseReason`) · `session-cancel-reasons-task691.test.ts:83` (`endCourse` now `CourseEndReason`; line 84 `endVoucher … EndCourseReason` stays and still proves the voucher wire does not take the course-only code).
**Tests by value** (`end-course-early-task837.dom.test.tsx`, 9, a real `SessionProvider` + the real dialog + the api faked at its boundary): the six approved EN strings and the six TH strings pinned exactly · no «copy pending» anywhere · the voucher's words unchanged · COURSE dialog EN: title, the SERVER's sentence ("…the 5 remaining sessions…"), FOUR radios (the three + "Course ended early"), the button · TH the same · choosing the new reason POSTs `/courses/c1/cancel` with `reason: "ENDED_EARLY"` (and nothing is sent before) · an old reason still sends its own code · VOUCHER dialog: three radios only, no "Course ended early" anywhere, the voucher's own title/button, and its POST (`/vouchers/v1/cancel`) carries one of the three.
**Mutation set `scripts/mutation/task-837.json`** (alone; no runner before or after; CHECKSUM identical; baseline 24/0): M1 button back to "Cancel course" · M2 🔴 the new reason sends ADMIN_ERROR · M3 🚫 the voucher offers it (guard gone) · M4 EN reason word · M5 TH reason word · M6 confirm sentence reverted · M7 🔴 added to the SHARED list · M8 «copy pending» ships · M9 the course wire narrowed — **all 9 BITE.** Re-run neighbours: 691 6/6 · 694 7/7 · 695 2/2 BITE.
**Gates:** tsc 0 · build 0 · `bun test` **1367 pass / 0 fail** · `unhandled-between-tests: 0`.
**`git status --short -uall` (front):**
```
 M src/components/partials/Bookings/EndCourseDialog.tsx
 M src/hooks/scheduler/useScheduler.ts
 M src/lib/i18n/dictionaries.ts
 M src/lib/scheduler/session-cancel-reasons-task691.test.ts
 M src/lib/scheduler/voucher-end.test.ts
 M src/services/scheduler.service.ts
 M src/types/api/contract.ts
 M src/types/app/scheduler/index.ts
?? scripts/mutation/task-837.json
?? src/components/partials/Bookings/end-course-early-task837.dom.test.tsx
```
**Not done / depends on the back:** the coach's LINE reason text and the `ENDED_EARLY` acceptance are Jason's; against a back that does not yet accept it, choosing the new reason would get the server's refusal. The plan header / course card read an ended course's reason through the same `endCourse.<code>` key, so an `ENDED_EARLY` course now reads "Course ended early" there (not exercised in a browser).

## ✅ 2026-10-25 — @Sober: TASK-837 VERIFIED (both sides). Ships TOGETHER with TASK-838 (they share `scheduler.service.ts` on both sides)
- **back, no-`.env` clean room** of `bd69978` + 837's 51 files (**Team B's TASK-749 WIP excluded**): tsc 0 · SAFE suite **5,106 / 0** · unhandled 0 · **73 = 73** · sets 837 **8/8** · 690 9/9.
- **front clean copy** (837's 10 files, snapshotted with md5s before 838 began): tsc 0 · `bun test` **1,367 / 0** · unhandled 0 · set 837 **9/9**.
  - All 6 approved strings verbatim; no «copy pending» from this task.
- ⚠️ **The front BUILD ran on the live tree after Fern had started TASK-838** (4 files changed mid-run), so it does not prove 837 alone. **The build is re-proven on the combined 837 + 838 tree before the commit list.**
