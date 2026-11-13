# TASK-946: F5 / REQ-5006: a cancelled make-up must never regrow onto its own date (SB)
- Source: CHECK-2026-11-09-frontoffice-intake.md § F5 · REQ-5006 · TEST-140 (the reproduction) · **owner GO 2026-11-10 23:48, verbatim *"แก้สิ เราทำไม่ถูก"*; this reverses TASK-551** (SYSTEM-FACTS § Front-office F5 decision)
- Owner: BE (Brew, Team C) · SA: Sector · Status: REVIEW · **Size ≈ 0.5 d.** **The desk stop is lifted for THIS task only.**
- Repo: `smart-scheduler-back` (SB), `dong`, clean at `77a4262` (2026-11-10). **Base:** paste `bun test` (dummy URL) + pinned tsc first.
- Files (closed list):
  - `src/services/scheduler.service.ts`: the single cancel hunk at `:4757` (`coachOff`), and the group cancel at `:4712` (`cancelSeatsOfGroup` call / its re-plan); no other hunk;
  - new `src/services/cancel-makeup-same-date-req5006.test.ts`;
  - existing tests that pin TASK-551's "same slot changed nothing" behaviour (tagged `🔻 TASK-946`; name each one and why it flips).
- Git writes: none (I commit after the sid pass).

## Today (re-read 2026-11-10; CHECK § F5)
- The cancel door re-plans the course (`:4760` → `reconcileCoursePlan`).
- Dates are marked taken only for «ครูลา» (`:4757` `coachOff … reasonCode === "TEACHER_LEAVE"`).
- The start point skips the cancelled row (`:3332`). For a make-up (always the last session), it falls back one week, and `extension-slot.ts:14` `addDays(fromDate, 7)` lands on **the cancelled row's own date**, which counts as free.
- Then `:4766` reads it as the "same slot" ⇒ no +1 week (`:4782`) and no family notice.

## The fix (exactly CHECK § F5)
- **Always** add the cancelled row's own coach(es) + date to `coachOff`, whatever the reason: `[...(TEACHER_LEAVE pairs), ...(await teachersOfBooking(tx, current.id)).map(c => ({ teacherId: c.id, date: current.date }))]`.
  - `:3349` already reads the list, so the extension search skips that date.
  - Do the same for the group cancel path (`:4712`).
- **Result:** the re-grown make-up lands on the **next free week** (≥ +1 week from the cancelled date). `slot.family` is false, so the normal **+1 week** (`:4782`) and the **family notice** (`:4797`) happen as for any other cancel.
- Nothing else changes. A non-make-up cancel already lands a week later; prove it's unchanged.

## Tests (DB-free where the file allows; follow its existing fakes)
1. **The REQ-5006 / TEST-140 reproduction:** a course whose last session is a make-up (`isMakeup`, EXTENDED) is cancelled ⇒ the new make-up's date ≠ the cancelled date (≥ +7 days). Fails on the base, passes after.
2. The ticked school-issue cancel of a make-up ⇒ +1 week applied **and** the family notice queued.
3. A make-up cancel **without** the school-issue tick ⇒ no +1 week (unchanged rule), but still not the same date.
4. An ordinary (non-make-up) cancel ⇒ unchanged (a regression pin).
5. The group-row cancel ⇒ the seats' re-plan also skips the cancelled date.
6. TEACHER_LEAVE ⇒ still marks the leave dates (unchanged), and now the cancelled row's date too.

## Definition of Done
- [ ] Suite (dummy URL): no new fails; the flipped TASK-551 pins listed with their reason. Pinned tsc 0.
- [ ] Test 1 shown **red on the base, green after** (paste both runs).
- [ ] `git diff -U0 src/services/scheduler.service.ts | grep "^@@"`: only the two hunks.
- [ ] **No sid write by you:** a cancel can queue LINE. The real check is Tanya's round after the deploy (Porter routes it).

## Implementation Notes
(Brew, 2026-11-10. Repo `smart-scheduler-back` (SB), `dong`, clean at `77a4262` when I started. No git, no sid write, no real LINE. The desk stop was lifted for this task only.)
- **Base (before any edit):** SB `bun test` (dummy URL `postgres://x:x@localhost:5432/none`) **5771 pass · 0 fail · 387 files**; pinned tsc 5.9.2 (`-p .`) **exit 0**.
- **The two hunks** (`git diff -U0 src/services/scheduler.service.ts | grep "^@@"` shows exactly these two):
  - `@@ -4712 +4712 @@` the GROUP-row cancel: `...(reasonCode === "TEACHER_LEAVE" ? { coachOff: await coachOffOfRow(tx, current) } : {})` → `coachOff: await coachOffOfRow(tx, current)` (for every reason; `weekTrigger` and `reseat` untouched).
  - `@@ -4755,5 +4755,3 @@` the single cancel: the `reasonCode === "TEACHER_LEAVE" ? … : undefined` ternary → `const coachOff: CoachOff[] = await coachOffOfRow(tx, current);` (the cancelled row's coach(es), primary + additional, × its date, once each; for TEACHER_LEAVE it is the same pairs as before, not doubled). Its two TASK-705 / TASK-551 comment lines became one TASK-705 line + one TASK-946 line saying why. `coachOffOfRow` already existed (it is `teachersOfBooking` × the row's date), so no new helper.
- **Why it works:** the extension search (`:3349`) reads `coachOff` dates for the template's coach as taken. A cancelled make-up is the last class, so the anchor is the class before it and its first candidate (+7) IS the cancelled date; now that date is skipped, the make-up lands on the next free week (≥ +7 from the cancelled date), `slot.family` is false, so the normal `+1 week` (SCHOOL_ISSUE) and the family notice follow as for any other cancel.
- **Behaviour you should know (consequences of "whatever the reason"):**
  1. A **non-make-up** class that is the course's LAST live class and is cancelled also used to regrow on its own date (the base test for it pinned `today`); it now lands a week later too. I did not special-case it, because the CHECK says "always, whatever the reason". A mid-course non-make-up cancel is unchanged (pinned: test 4).
  2. **The series cancel-all** (`other-series.service.ts`, the OTHER caller of `cancelSeatsOfGroup`) still passes `coachOff` ONLY for `TEACHER_LEAVE`. It is outside this TASK's closed list (two hunks in `scheduler.service.ts`), so I left it; its seats keep TASK-551's old behaviour. Say if you want it aligned (one more hunk + its pin in `replan-coach-day-off-task705.test.ts:232` and mutation C8).
  3. A **different coach on the replacement** (same date + time, other coach) can still land on the cancelled date: `coachOff` is per coach (the template's coach), and `same-slot-confirm-task710`'s "different coach ⇒ the family stays silent, the coach is told" test still passes unchanged.
- **Existing tests that pinned TASK-551 / the old shape, flipped and tagged `🔻 TASK-946`** (9 test edits in 6 files + 2 mutation sets; each is named with its reason):
  1. `src/services/replan-coach-day-off-task705.test.ts` · "the admin's cancel with ANY OTHER reason passes NOTHING — TASK-551 stands": it asserted `coachOff` null and the replacement on `today`; now it asserts the pair `[T1 × today]` and `today + 7`.
  2. same file · "GROUP doors … only for TEACHER_LEAVE" (a source pin): the pinned group call text changed; the series cancel-all pin is unchanged; the `coachOffOfRow(tx, ` count is 3 (was 2).
  3. `src/services/same-slot-confirm-task710.test.ts` · "admin cancel (any reason but «ครูลา») of the last live make-up ⇒ same slot, ZERO notices": the replacement is now on `today + 7` and IS announced (`["parent","teacher"]` confirms + the cancel notice).
  4. `src/services/makeup-cancel-family-task537.test.ts` · the two TASK-552 (B) "re-plan is ASKED" tests (`with a link`, `NO link`): the re-plan's `opts` now carry the coach × date pairs (were absent without «ครูลา»).
  5. `src/services/makeup-admin-teacher-leave-test098.test.ts` · "the STORED reason and the re-plan are the SAME as without «ครูลา»": "without «ครูลา» there is no coachOff, as ever" is false now; both asks are identical and equal to the pairs.
  6. `src/lib/group-session-req095-2a.test.ts` and `src/services/leave-week-triggers-task656.test.ts` · two source pins of the group cancel call text (`...(reasonCode === "TEACHER_LEAVE" ? … : {})` → `coachOff: await coachOffOfRow(tx, current)`); the trigger part of the pins is unchanged.
  7. The filed mutation sets `leave-week-triggers-task656.mutations.json` (T3b anchor) and `replan-coach-day-off-task705.mutations.json` (C4, C5, C7) had `from` anchors on the old text (TASK-627 requires each to resolve exactly once): re-anchored; C5 ("passes it for ANY reason — TASK-551 broken") became its own reversal ("ONLY for TEACHER_LEAVE again").

## Questions
- None blocking. Two decisions for you in the notes above: (1) the last regular class also moves a week now; (2) the series cancel-all is left as it was.

## Review (Brew, 2026-11-10 — status REVIEW)
- **Test 1 red on the base, green after.** New file `src/services/cancel-makeup-same-date-req5006.test.ts` (8 tests; the harness is a copy of the TASK-705 file's world + free-week search, driving the REAL `updateBookingStatus` + `reconcileCoursePlan`; the copy is stated in its header).
  - **On the base** (`scheduler.service.ts` as at `77a4262`, the new test file only): **1 pass · 7 fail**, each for its own reason:
    - test 1 (the reproduction): `expect(replacementOf(w).date).not.toBe(today)` ⇒ `Expected: not "2026-11-10"` (the make-up regrew on its cancelled date);
    - test 2 (ticked school issue): `expiryDate` `Expected "2027-02-22"`, `Received "2027-02-15"` (the +1 week was withheld);
    - test 3 (no tick): same date `Expected: not "2026-11-10"`;
    - test 4 (mid-course, unchanged date): fails ONLY on the new `coachOff` pair assertion (the date part, `today + 35`, passes on the base: the regression pin);
    - test 6b (all reasons pass the same pairs): `Expected: 1 · Received: 2` distinct asks;
    - test 5 (group, by value) and 5b (group, by source): the group call passed no `coachOff` for a non-«ครูลา» reason.
    - **test 6 (TEACHER_LEAVE: the pairs once each, two coaches ⇒ two pairs) passes on the base**: the unchanged rule.
  - **After the two hunks: 8 pass · 0 fail.**
- **Suite after:** `bun test` (dummy URL) **5779 pass · 0 fail · 388 files** (base 5771 / 0 / 387; +8 new tests, +1 file; the 10 older failures I got after the hunks are the flips listed above, all fixed). **Pinned tsc 5.9.2: exit 0.**
- **Coverage of the six asked tests:** (1) the make-up reproduction, 4 reasons · (2) the ticked school-issue cancel: +1 week applied AND the family notice queued · (3) no tick: no +1 week, but not the same date · (4) a mid-course non-make-up cancel unchanged · (5) the group-row cancel passes the group's coaches × date to its seats for every reason, with `SCHOOL_ISSUE` still carrying `T3_SCHOOL_ISSUE` and the others no trigger, plus a source pin that the reason test is gone · (6) TEACHER_LEAVE still passes the pairs (once, and two coaches ⇒ two pairs) and now so does every other reason (6b).
- **Mutation set on `scheduler.service.ts` (in place, CRLF-aware, restore, hash identical): 9 mutants, 9 killed:** never pass it; pass it only for TEACHER_LEAVE (TASK-551 back); skip it for SCHOOL_ISSUE; a wrong date; an empty list; group: not passed; group: TEACHER_LEAVE only (old); group: only the first coach; group: `reseat` flipped.
- **`git diff -U0 src/services/scheduler.service.ts | grep "^@@"`:** only `@@ -4712 +4712 @@` and `@@ -4755,5 +4755,3 @@`.
- **`git status --porcelain` (SB):** `M src/services/scheduler.service.ts` · the new test file · and the 8 flipped test / mutation files listed above. Nothing else.
- **Not done, not mine:** no sid write: a cancel can queue LINE. The real check is Tanya's round after the deploy (Porter routes it).

**Claim CONFIRMED (Porter, 2026-11-10 23:49; written on board.md):** SB `scheduler.service.ts` (the two coachOff hunks, single + group cancel) + tests. Go.

## Review (Sector, 2026-11-10): ✅ DONE (code). The real check = Tanya's round after the sid deploy
- **Re-run by me** (SAFE dummy URL): **5779 pass · 0 fail**; pinned tsc 0.
- **The diff:** `scheduler.service.ts` has exactly 2 hunks.
  - `:4712`: the group cancel passes `coachOff: await coachOffOfRow(tx, current)` for every reason.
  - `:4755`: the single cancel passes `coachOff = await coachOffOfRow(tx, current)` for every reason, replacing the TEACHER_LEAVE-only branch.
  - `coachOffOfRow` already existed (`:3246`), so no new helper.
- The new test file (8 tests) is red on the base (7 fail) and green after. 9 TASK-551 pins were flipped and tagged in 6 files, each with its reason; 2 mutation sets were re-anchored. Accepted.
- **Decision 1, accepted** [SA-decided]: a cancelled **last regular** class also no longer regrows onto its own date. It's the same defect, and "never the same date" is the owner's intent; a mid-course cancel is unchanged and pinned.
- **Decision 2, accepted to leave:** `other-series.service.ts:191`, the group-series cancel-all, still passes `coachOff` only for TEACHER_LEAVE. It's outside the claim and the desk stop. ⇒ **Follow-up (≈ 0.25 d, one hunk + its pin + mutation C8):** align it, because cancelling a whole group series can regrow a seat onto a cancelled date. Queued for after the stop.
- Security review: no input, auth or data-exposure change. **None.**
- **Next:** Porter routes the SB sid deploy + Tanya's round (a leave/cancel on a make-up ⇒ the next week, +1 week with the school-issue tick, family notice). Then `ขึ้น git` under the owner's grant.

- **Live + committed (Sector, 2026-11-11):** TEST-152 F5 PASS on sid; **smart-scheduler-back `dong` `8ee821a`** (946 + 947).
