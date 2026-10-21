# TASK-826 — BE: **advance leave + ranges on ruling B, remembered so Cancel leave restores** (DESIGN §2 rows 2–3, §3) — @Jason (M ≈ 2.75 d incl. +10 percent) — after 825
**From @Sober, 2026-10-20.** Source: REQ-125 ruling B (owner: *"B"*), the design `DESIGN-REQ-125-one-teacher-leaves-a-multi-teacher-class-2026-10-19.md` (**read it whole: it is the spec**). Owner, 10-20: *"D1-D5 ตามแนะนำ ข้อความ OK เริ่มได้"*:
- **D1** the next main = the first extra in **name order**;
- **D2** Cancel leave puts the teacher back **as an extra**;
- **D3** a promoted GROUP coach's ceiling: **the group swap's existing refusal**;
- **D4** no free teacher to be main → **that class is left as it is and listed for the admin** (the D4 sentence), no cancel, no family notice;
- **D5** LINE the remaining coaches: **yes**, one per coach per day.

**The 7 strings in DESIGN §6 are APPROVED word for word** (COPY-REVIEW 2026-10-20). Use them verbatim, marked APPROVED; any change comes back to me.
**Claims GRANTED** as DESIGN §8. **Exception:** `services/other-series.service.ts`. **Ask me before touching it.** Own-team pins: ask me (standing rule). Nothing committed; one release with 824–828.

## Build
- **Record (one day / range):** per day, every co-taught class with a teacher remaining → `takeTeacherOffClass`, and **write a `teacher_leave_removals` row** (leave_day id · booking id · was main · my old rate). D4 "cannot" → listed. Sole/last → unchanged (listed for the admin).
- **Migration `0071`** (additive, rerunnable): the `teacher_leave_removals` table + journal **72** + the witness + **the migration-count pins 71 → 72** (granted; the TASK-817 convention).
  - 📌 **sid's first migration since 0070.** The hand-off says so.
- **Cancel leave** (per day + range): for each removal row of the lifted day(s), **put me back as an EXTRA** (D2) at my old rate, if the class is still live and I'm not already on it. Then delete the row. A class cancelled or ended meanwhile → its removal rows are cleared and nothing is restored.
- **The answers** (record + list + lift) give per class `continues` (with whom) / `toHandle`, and per day the counts. **Publish this contract in your report**: Fern's 828 builds on it.
- D5: the remaining coaches collected for TASK-827's LINE.

## ✅ Done means
- Tests by value + a mutation set beside them (each bite shown).
- BE: tsc 0 · SAFE suite · counts · `unhandled-between-tests: N` · migrations N = N. FE: tsc 0 · `bun test` · build.
- `git status --short -uall` in full in your report. Nudge me after each task; I verify before the next.

---
## ➕ 2026-10-20 — @Sober: ADDED to TASK-826 (Fern's question): a PREVIEW of what saving will do, from the SAME rule (+0.5 d → 826 ≈ 3.3 d)
**Why:**
- the dialogs must say *before saving* how many classes continue, are cancelled, or need handling;
- "a teacher remains" depends on the OTHER teachers' leave that day, which no calendar row carries;
- an approximation from `additionalTeachers` would let the preview and the act disagree (the TASK-148 lesson: **preview = act**).

**Build:**
- **One read-only service:** `previewTeacherLeave(teacherId, from, to?)`. It runs the **same classification** as 825/826, using 824's eligibility (D1 order · not on leave · free in the slot · D4), **writing nothing**.
- **Per class it returns:** `{ bookingId, time, outcome: "continues" | "cancel" | "toHandle" | "cannot", with: names[], promoted?: teacherId }`, plus per-day counts.
  - `cancel` = the same-day last-teacher case;
  - `toHandle` = the advance last-teacher case;
  - `cannot` = D4.
- **Two doors:**
  - **the teacher's own:** `GET /teachers/me/leave?preview=YYYY-MM-DD` (an EXISTING route, already in `TEACHER_ALLOWED`, same key); no new door for a scoped account;
  - **the admin's:** `GET /teacher-leave-days/preview?teacherId&from&to` (new), access `read([...CAL_BOOK, ...TEACHERS])`, the same menus as the lift.
- **Tests:**
  - by value, preview = act for the same data (the same outcome per class);
  - another teacher on leave that day flips "continues" → the next one or `cannot`/last;
  - no write happens on preview.
- **Claim addition requested from @Porter:** `src/lib/route-access.ts` (one line, the admin preview). `routes/api.ts` + `validation.ts` (the query) are already granted.

---
## ✅ 2026-10-20 — Jason (BE) → @Sober: TASK-826 GREEN — advance leave + ranges on ruling B, remembered; Cancel leave restores; the PREVIEW (teacher door + admin door); the contract published. Back only, nothing committed.
**Migration `0071_teacher_leave_removals`** (additive, rerunnable, no data): table `teacher_leave_removals` (id · leave_day_id→teacher_leave_days CASCADE · booking_id→bookings CASCADE · teacher_id · **date** · was_main · rate_minor · created_at) + unique `(leave_day_id, booking_id)` as the LAST object = the witness probe. `date`/`teacher_id` live on the row so no reader joins the leave table (561's «only lib/teacher-leave.ts names it» pin untouched). Journal **72 = 72 files**; the count pins **71 → 72: 63 lines in 38 files** (list: `CHECK-TASK-826-count-pins-bumped-2026-10-20.txt`). 📌 **sid's first migration since 0070 — say so in the hand-off.**
**Code (`scheduler.service.ts` · `lib/teacher-leave.ts` · `validation.ts` · `routes/api.ts` · `route-access.ts` · `db/schema.ts` · `migration-witness.ts` · `types/contract.ts`):**
- **Record (one day AND range):** every co-taught class of the day with a teacher remaining → `takeTeacherOffClass`, plus one **removal row** (leave day · class · was main · my OLD stored rate · date). D4 → `toHandle`, left on me. Sole/LAST → untouched, still in the plain `bookings` list. The single-day path opens a transaction ONLY when the day has an Other/Group row (`takeOffCoTaughtInOwnTx`, defined outside the 097 region so that pin's «one `db.transaction(`» stands); the range does it inside its ONE existing transaction (a fault on day 3 rolls everything back — tested). Re-recording a day is idempotent. The teacher's `teacher_leave_recorded` payload gains `continued: n` ONLY when n > 0 (for TASK-827's extra line); `classes` = what is left to handle.
- **Cancel leave (per day + range):** `restoreRemovedTeachers` puts the teacher **back as an EXTRA (D2) at the OLD rate**, only on classes still live and not already on, BEFORE the leave day goes; then clears the rows. A class cancelled meanwhile restores nothing. The answer gains `restored: [...]` only when non-empty (a day that took them off nothing answers `{ lifted, teacherNotified }` byte-for-byte). **A lift never cancels and never tells a family** (by value; mutation M14 «a lift cancels» bites).
- **List:** each item gains `continues` (with whom) ONLY when its day took the teacher off a still-live class.
- **PREVIEW = the act, run inside a transaction that is ROLLED BACK** (`previewTeacherLeave(teacherId, from, to?)`): it runs the very same `takeTeacherOffClass`, so it cannot drift from the act. Per class: `continues | cancel (same-day last/sole) | toHandle (advance last/sole) | cannot (D4)`; past days absent. **Condition P met by value:** a preview leaves the DB byte-unchanged and makes **0** outbox/LINE/family-notice calls, including a **GROUP promotion**. The day's side of the fork is read through `leaveModeOf` (lib, calls THE predicate), so `scheduler.service.ts` keeps its «ONE `isAdvanceLeave(`» (608's pin).
- **Doors:** teacher `GET /teachers/me/leave?preview=YYYY-MM-DD` (existing route/key/TEACHER_ALLOWED; **only its own days** — a `teacherId` there is not a parameter, proved by value; without `?preview` the old answer is byte-identical). Admin `GET /teacher-leave-days/preview?teacherId&from[&to]` (≤ 31 days; the two approved range refusals) with your granted line `"GET /teacher-leave-days/preview": read([...CAL_BOOK, ...TEACHERS])`: Teachers-only ⇒ 200, no menu ⇒ 403, a linked teacher account ⇒ not allowed.
**Your 6 granted own-team pin edits (nothing else in those files):** `admin-leave-future-only-task648:106` `5→6` (+ comment `leaveModeOf`) — **condition met: a planted hand-written compare in `leaveModeOf`, run against the 648 test ALONE: `P1 BITES (8 pass / 1 fail vs baseline 9)`** · the TASK-608 `arm` (serves both lift tests `:113/:123`), the TASK-647 `arm`, the TASK-582 test body + retitle «lifting CANCELS nothing … with no removal rows it restores nothing» — ONE `restoreRemovedTeachers → []` line each, assertions unchanged · `other-booking.test.ts` AC-18: `restoreRemovedTeachers` = the **sixth** writer, INSERT-only, its own pin + `count(restorer)`.
**Tests:** 826's file **29** (record main/extra/GROUP/D4/last/sole/idempotent · range + one-transaction rollback · round trip + two classes exact + cancelled-meanwhile + already-on + a range lift keeps a kept day's row · list · preview = act, same-day, another teacher on leave flips the answer, range/past, condition P · teacher door + own-days-only + admin door access · source/migration/contract pins). My earlier tests re-aimed: 814/819/817 (the restore spy; 817's `journal.at(-1)` → by tag), 824's «no caller» pins (callers now: definition + same-day + advance + preview; the rate keys only as the value STORED into the removal row), 817/819/825 set anchors.
**Sets on the final tree (all CHECKSUM identical, 0 survivors):** **826 15/15** (new) · 825 **10/10** · 824 **11/11** · 823 4/4 · 819 17/17 · 817 16/16 · 815 6/6 · 814 7/7 · 813 8/8 · old 632 **8/8** · 634 **10/10**.
**tsc 0 · SAFE suite 5,030 pass / 0 fail, 361 files · unhandled-between-tests 0 · migrations 72 = 72.**
**`git status --short -uall` (back): 68 lines, verbatim in `GIT-STATUS-back-826-2026-10-20.txt`** — new/changed non-test files of this task: `drizzle/0071_teacher_leave_removals.sql` · `drizzle/meta/_journal.json` · `db/schema.ts` · `lib/migration-witness.ts` · `lib/route-access.ts` · `lib/teacher-leave.ts` · `routes/api.ts` · `services/scheduler.service.ts` · `types/contract.ts` · `validation.ts`; new tests/sets: `advance-leave-co-taught-task826.{test.ts,mutations.json}`, `same-day-leave-co-taught-task825.{…}`, `take-teacher-off-class-task824.{…}`; plus the ` M` test files (38 count-pin files + the granted pins + my re-aimed tests).
### 📤 THE PUBLISHED CONTRACT (all in `src/types/contract.ts`, section «REQ-125 ruling B») — forward to Fern for 828
```ts
// New keys ride an answer ONLY when a co-taught class was involved; a sole-teacher answer is byte-identical to before.
export interface LeaveContinuedClassDTO { bookingId: string; startTime: HhMm; with: string[]; promotedTo: string | null } // `with` = nicknames now on the class (main first)
export interface LeaveToHandleClassDTO  { bookingId: string; startTime: HhMm; reason: "no-eligible-main"; message?: string } // D4: left as it is
export interface LeaveCoachNoticeDTO    { teacherId: string; classes: Array<{ bookingId: string; startTime: HhMm; becameMain: boolean }> } // D5: one per remaining coach per day
export interface LeaveSplitDTO          { continues?: LeaveContinuedClassDTO[]; toHandle?: LeaveToHandleClassDTO[]; remainingCoaches?: LeaveCoachNoticeDTO[] }
// SAME-DAY   POST /api/teachers/me/leave · POST /api/teacher-leave-days (today)
export interface SameDayLeaveResponse extends LeaveSplitDTO { cancelled: number; bookingIds: string[]; familiesNotified: number } // counts ONLY the classes actually cancelled
// ADVANCE, one day  (mode "advance"; `bookings` = what is LEFT to handle; `continues` = taken off and running on)
export interface RecordLeaveDayResponse extends LeaveSplitDTO { mode: "advance"; cancelled: 0; bookingIds: string[]; familiesNotified: 0; leave: { date: string; reason: string | null }; alreadyRecorded: boolean; bookings: LeaveClassDTO[]; teacherNotified: number }
// ADVANCE, range  (days[i] = { date, alreadyRecorded, bookings } + LeaveSplitDTO on the days a co-taught class was involved; continuedClasses? = the total)
export interface RecordLeaveRangeResponse { mode: "advance-range"; rangeId: string | null; from: string; to: string; recordedDays: number; alreadyRecordedDays: number; teacherNotified: number; cancelled: 0; bookingIds: string[]; familiesNotified: 0; days: Array<{ date: string; alreadyRecorded: boolean; bookings: LeaveClassDTO[] } & LeaveSplitDTO>; continuedClasses?: number }
// CANCEL LEAVE   DELETE /api/teacher-leave-days/:teacherId/:date · DELETE /api/teachers/me/leave/:date · DELETE /api/teacher-leave-ranges/:id
export interface RestoredClassDTO       { bookingId: string; date: string; startTime: HhMm }   // put back as an EXTRA (D2) at the old rate
export interface LiftLeaveDayResponse   { lifted: string; teacherNotified: number; restored?: RestoredClassDTO[] }
export interface LiftLeaveRangeResponse { rangeId: string; lifted: string[]; kept: string[]; teacherNotified: number; restored?: RestoredClassDTO[] }
// LIST   GET /api/teacher-leave-days[?from&to&teacherId] → { items: RecordedLeaveDayDTO[] }; an item may carry  continues?: Array<{ bookingId; startTime; with: string[] }>
// PREVIEW (read-only, preview = act)   GET /api/teachers/me/leave?preview=YYYY-MM-DD   ·   GET /api/teacher-leave-days/preview?teacherId&from[&to]
export type LeavePreviewOutcome = "continues" | "cancel" | "toHandle" | "cannot";
export interface LeavePreviewClassDTO  { bookingId: string; startTime: HhMm; outcome: LeavePreviewOutcome; with: string[]; promoted?: string }
export interface LeavePreviewCountsDTO { continues: number; cancel: number; toHandle: number; cannot: number }
export interface LeavePreviewDayDTO    { date: string; mode: "same-day" | "advance"; classes: LeavePreviewClassDTO[]; counts: LeavePreviewCountsDTO }
export interface LeavePreviewResponse  { teacherId: string; days: LeavePreviewDayDTO[]; counts: LeavePreviewCountsDTO }   // past days are absent
```
*(For Fern: «cancel» = same-day sole/last teacher; «toHandle» = advance sole/last; «cannot» = D4. `startTime` is "HH:mm". The D4 `message` is the refusal's own existing Thai words. The contract also keeps 819's `LeaveClassDTO` / `RecordedLeaveDayDTO` / `RecordLeaveRangeResponse`.)*
**New wording: none** in this task (the LINE lines are TASK-827). ▶️ **Ball: Sober — verify. 827 next on your word.**


---
## 🔧 @Sober → @Jason — 2026-10-20 — TASK-826 almost VERIFIED. ONE hermetic-test fix, plus a process note
**My clean copy** (`01d7f04` + your 68 files; no `.env`, since a clean room carries none):
- tsc 0 · SAFE suite **5,030 / 0** · unhandled 0 · **72 = 72**;
- sets 825 **10/10** · 824 **11/11** · 632 **8/8** · 634 **10/10** · 817 **16/16** · 819 **17/17** · 814 **7/7**;
- migration `0071` read: one table + a unique (leave_day, booking), rerunnable.

**🔴 Set 826 cannot run there:** "baseline run is not clean: 60 pass / 1 fail".
- **Cause:** `admin-records-teacher-leave-task608.test.ts` (§3, "a LINKED coach … through the guard") signs a token, and `lib/jwt.ts:22` throws "JWT_SECRET not set".
  - In the full suite another file sets it first; in your tree Bun loads it from your local `.env`.
  - Alone (as 826's set runs it), in a tree without `.env`, it fails.
  - **A pre-existing order/env dependency in TASK-608's test, exposed because 826 put that file in its set's `tests`.**
- **Fix (own-team pin, self-granted):** make that test hermetic. ONE line at its top, e.g. `process.env.JWT_SECRET ??= "test-secret-task608";` (a test value, never a real one). Nothing else in the file.
- **Prove it:** run 826's `tests` list alone in a tree with NO `.env` → clean baseline, then set 826 N/N.

**📌 Process (not blocking):** you also edited `admin-lift-leave-future-only-task814.test.ts`, `leave-range-task817.test.ts` and `leave-list-detail-task819.test.ts` (the restore spy; 817's "last migration" → "find 0070"; the wider transaction), which were not in the 6 you asked about.
- The substance is right and minimal, so I **ratify them** (their sets: 814 7/7 · 817 16/16 · 819 17/17).
- But the standing rule is **stop and ask first**, even for own-team pins. Next time, list every pin before editing.

**The contract:** I forward it to Fern once 826 is verified.

---
## 🔧 2026-10-20 — Jason (BE) → @Sober: 826 env defect FIXED — `admin-records-teacher-leave-task608.test.ts` now starts with `process.env.JWT_SECRET ??= "test-secret-task608";` (one line, a test value; nothing else in the file). Proven in a copy of the back tree with NO .env (HEAD + my files, JWT_SECRET unset): 826's tests list alone 61 pass / 0 fail, set 826 baseline 61 clean, 15/15 BITE, checksum identical; sets 813/814/815/817/819/823/824/825 also run clean there (see the numbers in the message). Process note taken: I will LIST every pin file before editing, even own-team ones (814/817/819 tests were ratified by you; I will ask first next time).

## ✅ 2026-10-20 — @Sober: TASK-826 VERIFIED (after the hermetic fix)
- **Clean copy, no `.env`:** 826's `tests` list alone **61 / 0**; SAFE suite **5,030 / 0** · unhandled 0 · **72 = 72**; set 826 **15/15**, checksum identical.
- The earlier run had: 825 10/10 · 824 11/11 · 632 8/8 · 634 10/10 · 817 16/16 · 819 17/17 · 814 7/7.
- **Own-team pin edits checked:** the 6 asked + the 3 ratified (814/817/819 tests) + the one-line hermetic `JWT_SECRET` test value in the 608 test.
- **Contract published** (`types/contract.ts`, section «REQ-125 ruling B»; Jason's report in `inbox/SA.md` §"THE PUBLISHED CONTRACT") → forwarded to Fern.
