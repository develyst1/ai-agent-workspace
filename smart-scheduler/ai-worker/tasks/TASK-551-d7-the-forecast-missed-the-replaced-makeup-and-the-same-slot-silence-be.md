# TASK-551 — D7: the forecast missed the replaced make-up · and the same-slot silence — BE, M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-28) · **Size M.** From Tanya's item-6 run on sid, via @Porter. 🔑 **D7 FIRST — it is a wrong screen; §2 is a new rule.**

---

## §1 🔴 D7 — the forecast said "no make-up" when a make-up existed
**Observed on sid:** an admin cancelled make-up `e7cb8771` (10/11); the re-plan re-added `0494ab85` on the same date. **Undoing that leave forecast "คืนโควตาลา, no make-up", then the act refused with `UNDO_PLAN_WOULD_CHANGE`.**
- ⚠️ **The refusal itself is the accepted behaviour** (TASK-546 §4, and the dialog says so). 🔴 **The forecast's "no make-up" is NOT.** *Saying "nothing else follows" when something does is the exact defect this whole thread was fixing, reappearing on the new screen.*
- 🔑 **NAME THE CAUSE BEFORE FIXING IT.** **Say what `planUndo` actually read and why it did not see `0494ab85`.** ⚠️ **If the honest answer is that this IS the accepted `UNDO_PLAN_WOULD_CHANGE` gap and not a separate defect, STOP and say so** — *I would rather re-open my own ruling than have you build around it.*
- 🚫 **The fix must not make the preview disagree with the act.** **Whatever it reads, `undoBooking` must read the same** — `planUndo` is one function for that reason, and **a special case for the preview would undo the whole of TASK-546.**
- ⚠️ **If the act itself is wrong here** (it refuses where it should proceed, or the reverse), **that is a separate finding — report it, do not fold it in.**

---

## §2 The same-slot silence — **owner ruling, "ตามแนะนำ ไม่ต้องส่ง"**
**When an admin cancels a make-up and the re-plan puts a new class on the SAME DATE AND TIME, send NO family notice.** **A different date or time ⇒ the notice goes exactly as built today**, with its `ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ …` line.

### 2a ⚖️ The coach side — I agree with @Porter's principle, **with one condition he did not name**
✅ **Same slot ⇒ the coach's week is unchanged ⇒ no cancel notice.** **But the slot is not the whole identity of a coach's class:**
🔑 **If the re-plan puts the class back in the same slot with a DIFFERENT COACH, the original coach LOST a class and the new coach GAINED one — and "nothing changed" is false for both.**
⇒ **For the coach, the comparison is SAME DATE + SAME TIME + SAME COACH.** ⚠️ **If the re-plan cannot change the coach, say so and the condition costs nothing; if it can, it is load-bearing.** **Derive it; do not assume either way.**

### 2b 🔑 The rule that governs this whole section
**Suppressing a notice is the OPPOSITE failure of everything else this week, and it is the more dangerous one:** *a wrong sentence is visible and gets reported; a missing message is silence, and nobody reports silence.*
⇒ **The comparison must be EXACT** — same date, same time (and same coach for the coach side) — 🚫 **never "close enough", never a tolerance, never "the same week".**
⇒ **ONE decider for both audiences**, the way `planUndo` is one function. 🚫 **Two comparisons that agree today are two that can disagree later.**
⇒ ✅ **Pin BOTH directions, as @Porter asked:** the same-slot case sends **nothing**, the different-date case sends **the notice with its line, byte for byte as today.**

---

## §3 @Porter's third question — **answer it by derivation, and I am not going to guess it for you**
**"No new class ⇒ no line" appears unreachable by an admin cancel, because every course cancel re-owes a make-up.**
- **Derive which paths can reach a cancelled make-up with NO append** — consider at least a course at its extension ceiling, an expired course, a non-course row, a coach's own leave, and the other-series cancel-all. **Name each one reachable or not, with the reason.**
- ⇒ **Then give @Porter either a concrete path Tanya can follow, or the plain statement that it is covered by test only.** 🔑 **"Test only" is an acceptable answer; "I could not find one" is not.** ⚠️ **And if it is genuinely unreachable in production, say that too** — *a branch no user can reach is worth knowing about for a different reason.*

---

## Definition of Done
- [ ] **D7 cause NAMED before the fix** (or **STOPPED** as the accepted gap) · the preview and the act still read the same thing, **no preview-only special case** · any wrongness in the ACT reported separately · §2 suppression **exact, one decider, both audiences**, the coach comparison **including the coach — derived, not assumed** · 🔑 **both directions pinned: same slot ⇒ nothing; different date ⇒ today's notice byte for byte** · §3 answered **path-by-path with reasons**, ending in a path for Tanya or "test only" · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · 🔑 mutations incl. **a suppression firing on a different date** and **the forecast missing an appended class again** · report + `inbox/SA.md` + log.

---

# REPORT — @Jason (2026-09-28): §1 D7 **cause NAMED and STOPPED** (the fix changes the act's outcome, so a separate finding, as you asked) · §2 **built** · §3 **answered path by path** · **3532 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries** · tsc 0 · 61 = 61 · four §2 mutations bite

## §1 ⏸️ D7: the cause, named before any fix. It is NOT the accepted gap and NOT a preview-vs-act split
- **What `planUndo` read:** the rows whose `extendedFromId` is the leave, minus CANCELLED. On sid that's **only `e7cb8771` (CANCELLED)**, so **no live make-up**. **The act reads exactly the same** (one function), so preview and act **agree**. Both are reading a **missing link**.
- 🔴 **Why `0494ab85` isn't linked to the leave: the course PLANNER** (`course-plan.ts` `planCourseMoves`, the "short" branch):
  > `const matched = new Set(sessions.map((s) => s.extendedFromId)…)`
  - A leave counts as **"matched" if ANY session points back to it, including a CANCELLED make-up.**
  - So after the admin cancelled `e7cb8771` (which points to the leave), the leave still counted as matched, and **the re-plan appended the replacement with `extendedFromId: null`** (or, if another unmatched leave exists, **that other leave's id**).
  - **Reproduced on the pure planner:** before the cancel ⇒ no moves; after ⇒ `append: [{ extendedFromId: null }]`; with a second unmatched leave ⇒ `[{ L2 }, { null }]`.
- **Why the act then refused (`UNDO_PLAN_WOULD_CHANGE`):** undoing the leave makes the course one over (`0494ab85` is now surplus), and the post-write reconcile would trim it. **That refusal is a CONSEQUENCE of the missing link**, not the accepted gap's own case.
- ⚠️ **Why I stopped rather than fix it:** the fix is one line in the **planner** (a CANCELLED make-up no longer "matches" its leave), **not** in the preview or the Undo, so preview and act stay one read. **But it changes the ACT's outcome** in exactly this case.
  - With the link right, the Undo would **cancel `0494ab85` and PROCEED** instead of refusing.
  - That's your §1 "act is wrong here ⇒ separate finding, don't fold it in". It also touches **the re-plan's attribution** everywhere a make-up was cancelled and re-owed. The **count** logic is untouched (`need` comes from `current < size`); only **which leave the new row names** changes.
- 📌 **Two more things a ruling needs to know:**
  1. **Existing rows aren't repaired by a code fix.** sid's `0494ab85` keeps `extended_from_id` = NULL, so **Tanya's exact case stays "no make-up" + refused** until that one row is re-linked (a DATA REQUEST for the owner, drafted on your word).
  2. **The same missing link affects the plan editor's make-up display and TASK-548's attribution** wherever an admin cancelled a make-up that was then re-owed. **The counts are right; the names are wrong.**
- ⛔ **Your ruling:** (a) the planner fix (+ the act now proceeding here, + one-row data repair), or (b) re-open TASK-546 §4 instead.

## §2 ✅ The same-slot silence: built, EXACT, ONE decider, both directions
- **Derived first (not assumed): the re-plan CAN change the coach and the time.** The new class copies coach / start / end from a **template** (the absence it replaces, else the first live session), **not** from the cancelled make-up, and copies **only the primary coach** (no `booking_teachers`).
  - ⇒ **your same-coach condition is load-bearing**, and so is an exact time compare.
- **`lib/same-slot.ts` `sameSlotReplacement`: ONE pure decider for BOTH audiences.**
  - **family** = an appended row with the **same date + start + end** (as HH:MM: `10:00:00` = `10:00` is the same time spelt twice, not a tolerance);
  - **coach** = that **and the same coach SET** (primary + additional, via THE predicate).
  - The facts come from **the rows the re-plan RETURNED** (by id).
- **Admin cancel of a MAKE-UP only** (`status === "EXTENDED"`). A CONFIRMED class is never suppressed (pinned + mutation).
  - The **coach notice moved below the re-plan** beside the family one: same transaction, pre-write inputs, **your TASK-548 move ruling applied again.**
- **Pinned, both directions, through the real cancel:**
  - **same date + time + same coaches ⇒ NOTHING** to anyone (the response reports no coach notice);
  - **same slot, different coach ⇒ the family is silent, the ORIGINAL coaches told**;
  - same slot, **co-teacher dropped** ⇒ the coaches told;
  - **a different DATE ⇒ today's notices byte for byte** (the family with `newClassDates`, + the coaches);
  - a different time (**even one minute**, or the end only) ⇒ both told.
- 📌 **Not in scope, stated:** the coach who **gains** the re-added class is not told, **in either case**. There's no "class added" notice for a re-plan append today. Pre-existing, and not changed here.
- **Mutations** (CHECKSUM identical, BASELINE=22): **a suppression firing on a different date** BITES · the coach silenced although the coach changed BITES · **a time tolerance** BITES · the rule reaching a CONFIRMED class BITES.
  - (Your "forecast missing an appended class again" belongs to D7's fix, which is held.)

## §3 Porter's question: "no new class ⇒ no line", path by path, derived
- **The rule:** a cancelled make-up gets NO append iff the course is **ended** (`planCourseMovesForCourse` ⇒ no moves) **or** still has **≥ size** live + delivered sessions after the cancel.
  - **Ended course: UNREACHABLE.** `endCourse` cancels **every** live row (`endableSessions` = all `COURSE_LIVE`), so no live make-up remains to cancel.
  - **Paused course: UNREACHABLE.** The pause cancels its live rows the same way.
  - **Extension ceiling: NOT a path.** TASK-308 removed the refusal; the append always happens (a far-out one warns the admin).
  - **Expired (not ended) course: NOT a path.** Not ended ⇒ it appends, and the expiry stretches.
  - **Non-course row: UNREACHABLE for this notice.** `EXTENDED` exists only on course rows.
  - **OTHER-series cancel-all: UNREACHABLE for this notice.** Its GROUP rows are never `EXTENDED`.
  - **Coach's own leave:** same as the admin (it runs the same re-plan).
  - **Over-size IMPORTED course: REACHABLE.** For an imported course (`priorSessions > 0`) the re-plan **withholds** its trims (`withholdImportCancels`, TASK-166), so it can stay **over size with surplus live make-ups.** Cancelling one leaves it at or above size ⇒ **no append ⇒ no line.**
- ⇒ **A concrete path for Tanya, IF sid has such a course:** the TASK-166 audit (`scripts/audit-imported-courses.ts`, or the `[course-plan] … NOT cancelled (imported course…)` log line) names imported courses that are over-long. **Cancel one of that course's surplus make-ups as admin: the family notice carries no new-class line.**
  - **If sid has none: test only.** The branch is pinned by value (TASK-548: no append ⇒ TASK-537's payload, no line).

⛔ Only you mark this DONE. D7 waits on your ruling.

---

# ✅ §2/§3 DONE · ⚖️ D7 RULED — REVIEWED by @Sober (2026-09-28)
Verified: **3532 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **61 = 61**.

## 🔴 D7 — he did exactly what §1 asked, and the cause is worse than the symptom
**Neither the accepted gap nor a preview/act split: both read the same thing, because THE LINK WAS NEVER WRITTEN.**
🔑 **`planCourseMoves` counts a leave as "matched" if ANY row points at it — INCLUDING the CANCELLED `e7cb8771`** ⇒ the re-plan appended `0494ab85` with `extendedFromId: null`. **Reproduced on the pure planner.**
📌 **So the forecast was honest about a database that was wrong.** *The screen said "no make-up" because no make-up was linked. Fixing the screen would have been fixing the wrong thing — which is exactly why §1 said name the cause first.*

### ⚖️ Ruling: **(a) — the planner fix, and a DATA REQUEST for the row. NOT (b).**
🔑 **A CANCELLED make-up is not a make-up.** **The planner treating it as one is wrong on its own terms, everywhere, not only where it produced a bad sentence** — *a course whose leave is "matched" by a cancelled row is a course that quietly stops owing what it owes.* ⇒ **Re-opening TASK-546 §4 would accept a wrong screen caused by a wrong link.**
✅ **And the act's outcome CHANGING here is not a reason against it — it is the point:** *the Undo cancelling the surplus `0494ab85` and proceeding is the act becoming RIGHT.* ⚠️ **But it stays a separate task as §1 required** ⇒ **TASK-552.**
🔴 **The sid row needs a one-row re-link — that is a DATA REQUEST and it goes to the owner through @Porter.** 🚫 **No agent touches it.** ⚠️ **Until it is done, Tanya's case stays exactly as it is, and that is expected, not a failed fix.**

## ✅ §2 — the condition was load-bearing, and he derived it rather than taking my word
**The re-plan CAN change the coach, the co-teachers and the times** (it copies a template's primary coach and times) ⇒ 🔑 **"same slot" alone would have silenced a notice for a coach who genuinely lost the class.** *I asked him not to assume either way; he found the answer that makes the condition necessary.*
✅ **ONE pure decider (`sameSlotReplacement`), exact on date · start · end · coach SET, make-ups only** — **one decider for both audiences, as required.** ✅ **The coach notice moved below the re-plan under TASK-548's own move rule** — *the rule I ruled once is now being applied without being restated, which is what a rule is for.*
✅ **Pinned both ways and then some:** same slot + same coaches ⇒ **nothing** · same slot + a **different or dropped** coach ⇒ **family silent, coaches told** · different date ⇒ **today's notices byte for byte** · **one minute off ⇒ both told.** 📌 *The one-minute case is the pin that proves "exact" means exact.*
⚠️ **Declared, not in scope: the coach who GAINS the re-added class is told in neither case (pre-existing).** ⇒ **Raised to @Porter as its own question; NOT folded in.**

## ✅ §3 — answered the way I asked: path by path, ending in something Tanya can do
**Unreachable: ended · paused · non-course · other-series. Not paths: the ceiling and an expired course (they append).**
✅ 🔑 **REACHABLE: an over-size IMPORTED course — its trims are withheld, so surplus make-ups exist.** **For Tanya: pick one from the TASK-166 audit and cancel a surplus make-up. If sid has none: test only.**
📌 **That is a real path with a named fallback** — *"I could not find one" was the answer I ruled out, and he did not give it.*
