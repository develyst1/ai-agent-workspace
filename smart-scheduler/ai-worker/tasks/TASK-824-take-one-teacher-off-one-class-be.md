# TASK-824 — BE: **the building block "take one teacher off one class"** (REQ-125 ruling B, DESIGN §1) — @Jason (M ≈ 2.75 d incl. +10 percent)
**From @Sober, 2026-10-20.** Source: REQ-125 ruling B (owner: *"B"*), the design `DESIGN-REQ-125-one-teacher-leaves-a-multi-teacher-class-2026-10-19.md` (**read it whole: it is the spec**). Owner, 10-20: *"D1-D5 ตามแนะนำ ข้อความ OK เริ่มได้"*:
- **D1** the next main = the first extra in **name order**;
- **D2** Cancel leave puts the teacher back **as an extra**;
- **D3** a promoted GROUP coach's ceiling: **the group swap's existing refusal**;
- **D4** no free teacher to be main → **that class is left as it is and listed for the admin** (the D4 sentence), no cancel, no family notice;
- **D5** LINE the remaining coaches: **yes**, one per coach per day.

**The 7 strings in DESIGN §6 are APPROVED word for word** (COPY-REVIEW 2026-10-20). Use them verbatim, marked APPROVED; any change comes back to me.
**Claims GRANTED** as DESIGN §8. **Exception:** `services/other-series.service.ts`. **Ask me before touching it.** Own-team pins: ask me (standing rule). Nothing committed; one release with 824–828.

## Build (DESIGN §1, §5)
- One function, used by every later path, e.g. `takeTeacherOffClass(tx, bookingId, teacherId, date)`:
  - **an extra** → delete my `booking_teachers` row;
  - **the main** → promote the next **eligible** extra (D1 name order; eligible = not on leave that day AND free in that slot, `bookings_teacher_slot_uq`):
    - `teacher_id` ← them; their extra row removed;
    - **their own stored rate** → `teacher_rate_minor`;
    - **GROUP:** the seats' `teacher_id` + the freelance hold move **through the group swap's internals** (`swapGroupTeacher`, `scheduler.service.ts:1753`), not a copy. D3: its refusal stands.
  - **None eligible** → D4: report "cannot take off" (no change), so the caller can list it.
  - **Returns** what it did (`removedExtra` / `promoted: teacherId` / `cannot`) and my old rate (TASK-826 remembers it).
- **"A teacher remains"** helper: another teacher of the class who is not on leave that day (`teacherLeaveOn`, THE reader).
- **Courses, vouchers, trials, 1 HR:** never touched by construction (single teacher → "no teacher remains").
**No caller wired in this task.** 825/826 wire it.

## ✅ Done means
- Tests by value + a mutation set beside them (each bite shown).
- BE: tsc 0 · SAFE suite · counts · `unhandled-between-tests: N` · migrations N = N. FE: tsc 0 · `bun test` · build.
- `git status --short -uall` in full in your report. Nudge me after each task; I verify before the next.

---
## @Sober (ruling in BE inbox) — 2026-10-20 — ▶️ GO: TASK-824's 7 own-team pin edits, exactly as you proposed (standing rule, self-granted), each with a condition
**Accepted:** moving the group swap's per-date loop into the exported `moveGroupRowToTeacher` (moved, not copied) so the promotion reuses it. That is the DESIGN's "reuse, never a second copy".
1. `coach-rate-walk-req105.test.ts`: add `oldRateMinor` / `newRateMinor` to `NOT_A_COACH_RATE` with your reason.
   - **Condition:** a test (yours) proves neither key reaches any HTTP response body.
2. + 3. + 4. `group-series-req104.test.ts:203` · `group-session-req095-2a.test.ts:206` (+ its function list at `:240`) · `group-swap-rate-task632.test.ts:26/132`: widen each region to **exactly** `swapGroupTeacher` + `moveGroupRowToTeacher`, with the **same expected strings**.
   - **Condition:** no wider region (not the whole file, not a third function).
5. + 6. `group-swap-rate-task632.mutations.json` (G1 · G3 · G4) and `group-swap-rate-door-task634.mutations.json` (D4 · D5): re-aim only the **indentation** of the `from` anchors. The mutated code stays identical.
   - **Condition:** **both sets re-run on your final tree with the same N/N they had before, 0 survivors.** Show the before/after counts.
7. `other-booking.test.ts:263` (AC-18, the join table's named writers): `takeTeacherOffClass` becomes the **fifth** named writer, with its own pin: it deletes **only** an extra's row, never inserts, and never composes the teacher list.
**Nothing else in those files.** Then your 824 tests + set, and report: SAFE suite counts · unhandled · every set touched (824's + 632 + 634) · `git status`.

---
## ✅ 2026-10-20 — Jason (BE) → @Sober: TASK-824 GREEN — "take ONE teacher off ONE class" built, with the group swap's loop MOVED (not copied). No caller wired. Nothing committed.
**Code — `src/services/scheduler.service.ts` only (base `01d7f04`):**
- `moveGroupRowToTeacher(tx, g, input, rate)` (exported) = `swapGroupTeacher`'s per-date loop body, MOVED verbatim (bookable check → row + rate update with the 23505→SLOT_TAKEN 409 → `reconcileBookingHolds` → every live seat follows); `swapGroupTeacher` now calls it (`await moveGroupRowToTeacher(tx, g, input, rate)`). Nothing else in the swap changed.
- `takeTeacherOffClass(tx, bookingId, teacherId, { alsoLeaving? })` → `TakeOffOutcome`:
  - **extra** → my `booking_teachers` row goes → `{ outcome: "removedExtra", wasMain: false, oldRateMinor }`;
  - **main** → the next eligible extra in **D1 name order** (the nickname the calendar sorts by, `"th"`, then name, then id): `teacher_id` ← them, **their own stored rate** → `teacher_rate_minor`, their extra row removed → `{ outcome: "promoted", wasMain: true, teacherId, oldRateMinor, newRateMinor }`. **GROUP** goes through `moveGroupRowToTeacher` (seats + freelance hold follow; its refusals stand = **D3**);
  - each attempt runs in a **SAVEPOINT** (`tx.transaction`): a taken slot (`bookings_teacher_slot_uq`), an unbookable coach, or a freelance ceiling that cannot hold the hour just means «try the next», leaving nothing behind; a non-refusal error is rethrown;
  - **none eligible (D4) / no teacher remains** → `{ outcome: "cannot", reason: "no-eligible-main" | "no-teacher-remains", wasMain, oldRateMinor, message? }` and the class is **exactly as it was** (no cancel, no notice). Courses/vouchers/trials/1 HR = one teacher ⇒ `no-teacher-remains` ⇒ untouched.
- `remainingTeachersOf(exec, bookingId, leavingTeacherId, alsoLeaving)` = the «a teacher remains» helper: the class's OTHER teachers not on leave that day (THE reader `teacherLeaveOn`) and not leaving in the same act.
**Tests (24, by value through a fake tx):** extra removed (rate returned, null rate stays null) · main → Ann on HER rate not the outgoing 50000, Bea stays extra · D1 is name order not insertion order · an extra on leave skipped · same-act set skipped · a taken slot ⇒ next, the failed try leaves nothing · D4 every slot taken ⇒ `cannot`, class unchanged · a real fault is not swallowed · no teacher remains (extra and main) ⇒ unchanged · single-teacher types untouched · `remainingTeachersOf` · caller bug throws · GROUP: seats follow, D3 archived coach ⇒ next / all refused ⇒ `cannot` with the refusal's words, savepoint undoes a half-done try (main row moved, seat write refused) · source: two callers of the moved helper, the block cancels/notifies/inserts nothing.
**Set 824: 11/11 BITE** (J1 D1 reversed · J2 outgoing rate kept · J3 promoted extra's row kept · J4 leave ignored · J5 same-act set ignored · J6 no savepoint · J7 GROUP bypasses the swap internals · J8 no-teacher-remains guard dropped · J9 faults swallowed · J10 an extra leaving removes the others · J11 old rate not returned), CHECKSUM identical.
**The 7 granted own-team pin edits (each exactly as you ruled; nothing else in those files):** (1) `coach-rate-walk-req105` + `oldRateMinor`/`newRateMinor` in NOT_A_COACH_RATE — **condition met in my 824 test:** the keys exist only in the block's own type/function in `scheduler.service.ts` (not a route, DTO, contract or OpenAPI), and `takeTeacherOffClass` has no caller yet (825/826 must re-aim that pin with their own proof) · (2) `group-series-req104:203` · (3) `group-session-req095-2a:206` · (4) `group-swap-rate-task632:26` — each region widened to **exactly** `moveGroupRowToTeacher` + `swapGroupTeacher`, same expected strings · (5)(6) `group-swap-rate-task632.mutations.json` (G1·G3·G4) and `group-swap-rate-door-task634.mutations.json` (D4·D5): indentation of the `from`/`to` anchors only (text-level edit; 12+6 changed lines) · (7) `other-booking.test.ts` AC-18: `takeTeacherOffClass` is the **fifth** named writer — deletes only, no insert/update/read of the join table, never composes the list; the count formula gained `+ count(taker)`.
**Before/after for the touched old sets (your condition):** `group-swap-rate-task632` **8/8 → 8/8** · `group-swap-rate-door-task634` **10/10 → 10/10**, 0 survivors both times, CHECKSUM identical (before measured in a clean copy of HEAD).
**tsc 0 · SAFE suite 4,979 pass / 0 fail, 359 files · unhandled-between-tests 0 · migrations 71 = 71.**
**`git status --short -uall` (back):** ` M` `coach-rate-walk-req105.test.ts` · `group-series-req104.test.ts` · `group-session-req095-2a.test.ts` · `group-swap-rate-door-task634.mutations.json` · `group-swap-rate-task632.mutations.json` · `group-swap-rate-task632.test.ts` · `other-booking.test.ts` · `scheduler.service.ts` · `?? take-teacher-off-class-task824.{mutations.json,test.ts}`. No migration, no copy, no front.
*Note for 825/826:* `bookings.teacher_rate_minor` of a main teacher with no stored rate stays NULL on promotion if the extra had none (nothing invented); the block returns it so the caller can list it if you want that flagged.
▶️ **Ball: Sober — verify. 825 next, on your word.**

---
## 🔧 @Sober → @Jason — 2026-10-20 — TASK-824: ONE defect in your own new test (checkout-path dependent). Fix, then I re-verify
- **My clean copy** (`01d7f04` + your 10 files, in a folder NOT named `smart-scheduler-back`): suite **4,977 pass / 2 fail**. **Set 824 could not run** ("baseline run is not clean: 22 pass / 2 fail").
- **Cause:** `take-teacher-off-class-task824.test.ts:269`: `const rel = (f) => f.replace(/\\/g, "/").split("smart-scheduler-back/")[1];`. It depends on the **checkout folder's name**: anywhere else it returns `undefined`, so the two "keys stay in-process" tests at `:271` and `:277` fail.
  - The owner's machine happens to match. A server checkout, a renamed folder or my clean room does not.
- **Fix (your file, your claim):** derive it from the test's own root, e.g. `const rel = (f: string) => relative(root, f).replace(/\\/g, "/");` (`root` is already `resolve(import.meta.dir, "..", "..")`). Nothing else.
- **Everything else checked out:** tsc 0 · the 7 pin edits exactly as ruled · set 632 **8/8** · set 634 **10/10**, 0 survivors, checksums identical.
- Then re-run your set and nudge me. I re-run 824 in my clean room.

---
## 🔧 2026-10-20 — Jason (BE) → @Sober: TASK-824 test path defect FIXED — `rel` now `relative(root, f)` (import added), nothing else. Verified in a copy of the back tree in a folder NOT named smart-scheduler-back: 24/24 in the file, set 824 11/11 (baseline 24 clean, checksum identical), whole suite there as reported below.

---
## ✅ 2026-10-20 — @Sober: TASK-824 VERIFIED (after the `rel` fix)
- **Clean copy** of back `01d7f04` + the 10 files, in a folder NOT named `smart-scheduler-back`: tsc 0 · SAFE suite **4,979 / 0**, 359 files · unhandled 0 · 71 = 71.
- **Sets:** 824 **11/11** · 632 **8/8** · 634 **10/10**, 0 survivors, checksums identical. 632 and 634 hold the same counts as before the move.
- **The 7 own-team pin edits (self-granted under the standing rule), checked line by line:**
  - the anchors re-aimed for indentation only;
  - the regions are exactly `moveGroupRowToTeacher` + `swapGroupTeacher`;
  - the fifth named writer is delete-only;
  - the not-a-coach-rate keys proven to stay in-process.
- **No caller wired** (825 wires it). Go on with **TASK-825**.
