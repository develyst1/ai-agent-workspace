# TASK-825 — BE: **same-day leave on ruling B** (DESIGN §2 row 1, §4) — @Jason (M ≈ 1.65 d incl. +10 percent) — after 824
**From @Sober, 2026-10-20.** Source: REQ-125 ruling B (owner: *"B"*), the design `DESIGN-REQ-125-one-teacher-leaves-a-multi-teacher-class-2026-10-19.md` (**read it whole: it is the spec**). Owner, 10-20: *"D1-D5 ตามแนะนำ ข้อความ OK เริ่มได้"*:
- **D1** the next main = the first extra in **name order**;
- **D2** Cancel leave puts the teacher back **as an extra**;
- **D3** a promoted GROUP coach's ceiling: **the group swap's existing refusal**;
- **D4** no free teacher to be main → **that class is left as it is and listed for the admin** (the D4 sentence), no cancel, no family notice;
- **D5** LINE the remaining coaches: **yes**, one per coach per day.

**The 7 strings in DESIGN §6 are APPROVED word for word** (COPY-REVIEW 2026-10-20). Use them verbatim, marked APPROVED; any change comes back to me.
**Claims GRANTED** as DESIGN §8. **Exception:** `services/other-series.service.ts`. **Ask me before touching it.** Own-team pins: ask me (standing rule). Nothing committed; one release with 824–828.

## Build
- In the same-day act (`scheduler.service.ts:3664-3682`), split my targets:
  - **co-taught with a teacher remaining** → `takeTeacherOffClass` (824): **not cancelled, no family notice**, no make-up;
  - **D4 "cannot"** → left as it is, listed in the answer for the admin;
  - **sole/last teacher** → **exactly today's path** (cancel + make-up + families + coaches).
- **The answer** says per class: `continues` (with whom) / `cancelled` / `toHandle`. The counts feed TASK-828.
- **D5:** the remaining coaches are queued for ONE LINE per coach per day (the message itself is TASK-827; here, collect who + which classes).

## ✅ Done means
- Tests by value + a mutation set beside them (each bite shown).
- BE: tsc 0 · SAFE suite · counts · `unhandled-between-tests: N` · migrations N = N. FE: tsc 0 · `bun test` · build.
- `git status --short -uall` in full in your report. Nudge me after each task; I verify before the next.

---
## ✅ 2026-10-20 — Jason (BE) → @Sober: TASK-825 GREEN — same-day leave keeps co-taught classes; the sole/last teacher's path is byte-identical. Back only, nothing committed.
**Code — `scheduler.service.ts`, the same-day act (`reportTeacherLeave`, today/past side) only:** per live target — a class with extras (`additionalTeachers.length > 0`: an Other/ECA, a group with extras; the lesson types never have extras):
- `takeTeacherOffClass(tx, b.id, me)` (824) → **removedExtra / promoted** ⇒ the class **continues**: NOT cancelled, no `reconcileCoursePlan`/make-up, **the families NOT told**; recorded in `continues: [{ bookingId, startTime, with: [nicknames now on the class], promotedTo }]`;
- **cannot / no-eligible-main (D4)** ⇒ left **exactly as it is**, listed in `toHandle: [{ bookingId, startTime, reason, message }]` (message = the swap/slot refusal's own existing words — no new text);
- **cannot / no-teacher-remains** (I am the LAST teacher, e.g. everyone else is on leave) ⇒ **today's cancel path, unchanged** (cancel + make-up + families + other coaches);
- a class with no extras ⇒ today's path, untouched.
- **D5 collected, not sent (the message is TASK-827):** `remainingCoaches: [{ teacherId, classes: [{ bookingId, startTime, becameMain }] }]` — ONE entry per remaining coach per day listing all their classes (a coach on leave that day is not in it; never me).
- **The answer:** `cancelled` = the classes actually cancelled (`cancelledIds`), `bookingIds` = those ids, `familiesNotified` = only theirs. **The three new keys ride the answer ONLY when a co-taught class was involved** — a sole-teacher day answers `{ cancelled, bookingIds, familiesNotified }` byte-for-byte as before, so the TASK-582 shape pins pass untouched.
- Types exported for the contract: `SameDayContinuedClass`, `SameDayToHandleClass`, `SameDayCoachNotice`. (I did not add them to `contract.ts` — say if you want that now for Fern's 828; it is 3 interfaces.)
**Your 4 conditions, all in tests + set:** (1) a sole-teacher day (one class, and three classes) → `cancelled` = every live target, answer `toEqual({cancelled, bookingIds, familiesNotified})` ✅ · (2) a mixed day → `cancelled: 1` (only the sole class), `familiesNotified: 1` and the ONE family sender (spied) asked about **only that class** ✅ · (3) **K9** counts a continuing class as cancelled → bites ✅ · (4) **K10** tells the family of a continuing class → bites ✅.
**Tests (14 + 2 re-aimed):** main of a 3-teacher ECA (Ann by name, her rate, I am off, not cancelled, `continues` with names) · I am an extra · a co-taught GROUP (swap internals, seats follow, no cancelSeatsOfGroup) · own door and admin door (`onBehalf`) identical · D4 (every slot taken) → `toHandle`, class unchanged · LAST teacher → cancelled · sole teacher → byte-identical · sole day with 3 classes · mixed day · D5 aggregation per coach (+`becameMain`) · a coach on leave not told · `sessionIds` · source pins (one call of the block, before any cancel write; the branch cancels/notifies/re-plans nothing; the sole answer keys).
**Set 825: 10/10 BITE** (K1 split never fires = the REQ-125 defect · K2 D4 falls through to cancel · K3 last teacher left alone · K4 split keys always in the answer · K5 per-class coach entries · K6 promotion not reported · K7 `cancelled` = live.length · K8 `with` empty · K9 · K10), baseline 24 (the set also runs TASK-582's act test), CHECKSUM identical. 824's set re-run: **11/11**.
**Own-team pins (self-granted per your ruling), nothing else in those files:** `teacher-own-calendar-req097.test.ts:341` → the new final line `return { cancelled: cancelledIds.length, bookingIds: cancelledIds, familiesNotified, ...split };` · my 824 "no caller" pin re-aimed: callers = the definition + the same-day act (exactly 2 occurrences), the act's one call is inside `reportTeacherLeave`, and **neither the act nor its answer types contain any `RateMinor`** (the rate keys stay in-process); 826 will extend it.
**tsc 0 · SAFE suite 4,997 pass / 0 fail, 360 files · unhandled-between-tests 0 · migrations 71 = 71.**
**`git status --short -uall` (back):** ` M` `coach-rate-walk-req105.test.ts` · `group-series-req104.test.ts` · `group-session-req095-2a.test.ts` · `group-swap-rate-door-task634.mutations.json` · `group-swap-rate-task632.mutations.json` · `group-swap-rate-task632.test.ts` · `teacher-own-calendar-req097.test.ts` · `other-booking.test.ts` · `scheduler.service.ts` · `?? same-day-leave-co-taught-task825.{mutations.json,test.ts}` · `?? take-teacher-off-class-task824.{mutations.json,test.ts}` (824's files still uncommitted, one release).
**New wording: none.** ▶️ **Ball: Sober — verify. 826 (migration 0071) next on your word.**

---
## ✅ 2026-10-20 — @Sober: TASK-825 VERIFIED
- **Clean copy** of back `01d7f04` + the 13 changed files (824 + 825): tsc 0 · SAFE suite **4,997 / 0**, 360 files · unhandled 0 · 71 = 71.
- **Sets:** 825 **10/10** (incl. my K9 "a continuing class counted as cancelled" and K10 "its family told") · 824 **11/11**. 0 survivors, checksums identical.
- **Own-team pin, checked:** `teacher-own-calendar-req097.test.ts:341` → the new final line (`cancelledIds`, `...split`), exactly as granted. 824's "no caller" pin re-aimed by Jason in his own file.
- **Your contract question, RULED:** put the answer types in `types/contract.ts` **in TASK-826, together with the preview and the record/lift answers.** One published contract for Fern's 828, not two.
