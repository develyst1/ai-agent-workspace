# TASK-512 — the last primary-only coach notice, and one question about "moves" — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size S.** Both from your own TASK-510 report.

## §1 The bulk notice
`sendCourseDroppedToTeachers` (`course_dropped_teacher`: a course dropped or ended, a voucher ended) **groups the lost dates by `b.teacherId`** ⇒ **an additional teacher is not told a co-taught course stopped.**
**Same rule as TASK-510** (*every coach of a class is told when it stops happening*), and by your account **the last notice of this shape.**
- Through **`teachersOfBooking`**, like the other three. 🔑 **After this there should be NO coach notice that reads `teacherId` for a recipient — pin that across the senders as one statement**, so the rule is checkable rather than remembered. 📌 That pin is worth more than this fix: it is what stops the fifth copy being written next year.
- ⚠️ **The grouping is the interesting part.** Today's message lists **the dates that coach lost**; a co-taught course means **two coaches losing the same dates.** 🔑 **Say what each coach's message contains** — and if grouping by coach means a date appears in two messages, **that is correct and should be pinned as correct**, not tidied.
- 🚫 **The wording does not change** — only who receives it. Anything that reads oddly arriving at a second coach: **report it, do not edit it.**
- **Unlinked coaches SKIPPED**, as before.

## §2 ❓ "Moves" — answer before building anything
You said there is **no dedicated coach notice for a moved class**, and that **you have not traced whether a move reaches an additional teacher** — and you said that rather than claiming either way, which is why it is a question here and not a fix.
**Establish and report:**
1. **What a coach is told today when a class moves** (a reschedule, a date or time change) — by which message, if any.
2. **Whether an additional teacher gets it.**
3. 🔑 **And the case I actually care about: does a move ever reach a coach as a CANCELLATION plus a new class, or as nothing at all?** *Nothing at all* is the dangerous answer — **a coach who is not told a class moved will be in the wrong place at the right time**, which is the same failure as TASK-510's, wearing a third set of clothes.
🚫 **Build nothing for §2.** If the answer is "nothing at all", that is a finding with an owner decision behind it (is a move even announced today?), and I will take it up. **Report, and stop.**

## Definition of Done
- [ ] The bulk notice through `teachersOfBooking` · 🔑 **one pin across the senders that no coach notice reads `teacherId` for a recipient** · what each coach's message contains, with a repeated date pinned as **correct** if that is what happens · wording unchanged (oddities **reported**) · unlinked coaches SKIPPED · **§2 answered in full and NOT built** · suite **count** normally **and unreachable** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation returning the bulk notice to primary-only and one that tells the family · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-27): the bulk notice reaches every coach; ONE derived pin now classifies every coach message · ⚠️ my TASK-510 "the last of this shape" was WRONG: four more are primary-only · §2: a move reaches every coach as NOTHING AT ALL (not built) · 3310 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 59 = 59

## ⚠️ First, a correction to my own TASK-510 report
I wrote that the bulk notice was "the last coach notice with this shape that I found". **That was wrong.** I had looked at the notices named in the task, not at every producer. When I built this task's pin (which **derives** every coach-message producer from the source rather than trusting a list), it found **four more that read the primary alone**. See §2 of the pin below; they're named, not changed, since they're outside this task.

## §1 The bulk notice (`sendCourseDroppedToTeachers`: course dropped or ended, voucher ended)
- **Grouped by every coach of each CONFIRMED row** (`teachersOfBooking(tx, b.id)`), not by `b.teacherId`. Each group carries the coach's link, so an unlinked coach is a **SKIPPED row** as before.
- **What each coach's message contains:** the dates **THEY** lose, sorted, with `bookingId` = their first date. **On a co-taught course, two coaches get the SAME dates, one message each. Pinned as CORRECT, not tidied:** each of them loses those classes.
  - By value (`voucher-end-req103`): Ek + Ple co-teach 2 classes, and Ple has a third alone.
  - Ek gets `[d2, d4]` and Ple gets `[d2, d3, d4]`. **d2 and d4 are in both messages, on purpose.**
  - A PENDING class tells nobody; no family row.
- **Wording unchanged.** At a second coach it reads correctly: the `Coach :` line is built from **all** of the class's coaches (`joinCoaches`, primary first), so it doesn't claim the reader is the only one. **Nothing odd to report.**

## §2 🔑 The pin across the senders (`src/lib/coach-notice-inventory-task512.test.ts`, 3 tests)
- **The producer list is DERIVED:** every function that builds a `recipientType: "teacher"` row, found by scanning `src/`. **17 today.** It must equal the classified set, **so a new coach message fails the suite until someone decides which kind it is.** That's what stops the fifth copy.
- **Class-event notices ⇒ must ask `teachersOfBooking`, must not look a teacher up, must not read `teacherId` for a recipient** (5):
  - the leave notice, the cancel notice (shared sender), a teacher's own-leave notice, **the bulk notice**, and the Undo's two sends.
- **Named-by-design** (the recipient is a specific person, not "the coaches of a class") (4):
  - the reassignment pair (old + new coach), the อื่นๆ series swap pair, the linking coach's approval, and **camp's reminder** (camp's own day-teacher model).
- **Own copy, but reaches every coach today** (4). These are copies that currently agree, **named so they can be converged**:
  - `booking_confirmed` via `assignedTeacherIds`;
  - the series notices via `teacherId` + `extrasOf`;
  - the daily reminder;
  - the weekly digest.
- 🔴 **STILL PRIMARY-ONLY: an additional teacher is NOT told** (4). This list is **pinned as honest** (each still doesn't ask the predicate) and **may only shrink**:
  - **`pauseBooking`** (`booking_paused`: a class **STOPS**);
  - **`resumeBooking`** (`booking_resumed`: it **STARTS AGAIN**);
  - `confirmCourse` (`course_confirmed`);
  - `notifyRentalAddedSameDay` (`rental_added_teacher`).
  - The first two are exactly TASK-510's rule. **Recommend a follow-up** through `teachersOfBooking`, which would move them up the list.
- ⚠️ **Limit, stated in the file:** a producer passing `recipientType` through a **variable** isn't seen by the scan.

## Break-and-watch (database unreachable · CHECKSUM identical before and after · every restore byte-identical)
- **B1: the bulk notice back to the primary only:** BITES (the co-taught test).
- **B2: the bulk notice tells the family:** BITES (2).
- **N1: a NEW coach message nobody classified** (added to `rental.service`): BITES (the inventory's equality).
- **N2: the leave notice goes back to looking up its own teacher:** BITES (the inventory's class-event rule).
- **Existing pins moved (same claims):** two source pins that quoted the old grouping, and `voucher-end`'s fake transaction, which now answers the predicate's `select … inner join` from its own rows.

## §3 ❓ "Moves": answered in full, NOTHING BUILT
**1. What a coach is told when a class moves: NOTHING.**
- The moves are `PATCH /api/bookings/:id` (`moveBooking`) and the plan editor's `edit` change (`applyPlanChange`). The front end reaches the first from **BookingModal** and **PlanModal**.
- Both update the row **in place** (same id, new `date` / `startTime`).
- The code says so itself: *"a date / time / note / rate-only move stays silent"* (TASK-436). The only send on those paths is **`sendTeacherReassigned`, and only when the TEACHER changes.**
- **No coach, no family, no admin message** for a date or time change.

**2. Does an additional teacher get it?** Nobody gets anything, so no. On a *teacher* change, `sendTeacherReassigned` tells the old and new **primary**; an additional teacher on the class is not told their co-coach changed.

**3. 🔴 Cancellation-plus-new-class, or nothing at all? NOTHING AT ALL.**
- It's an in-place update, so no cancel notice fires and no confirm notice fires.
- `PENDING_RESCHEDULE` exists as a status, **but nothing in the backend writes it**, and `reschedule_requested` has a renderer but **no producer**. There's no other move path.
- **A coach only finds out passively:**
  - their calendar feed (ICS) updates;
  - the next **daily reminder** lists the new time, but **only if it is sent after the move** (a same-day move made after that morning's reminder reaches them through nothing);
  - the **Monday digest**.
- **This is TASK-510's failure in a third set of clothes: a coach at the old time, or not at the new one.** 🚫 Built nothing. Whether a move should be announced (to whom, in what words) is the owner's decision.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
Verified by me: **3310 pass / 0 fail normally AND with the database unreachable, zero failed queries** · tsc 0 · 59 = 59 · the inventory file present.

## 📌 He corrected his own TASK-510 claim, and the reason is the lesson of this whole round
He had written that the bulk notice was "the last coach notice with this shape". **It was not — four more read the primary alone.** And he says exactly why he was wrong: **he had looked at the notices NAMED IN THE TASK, not at every producer.** Then he built a pin that **derives** the producer list from the source, and the derivation found them.
🔑 **That is the same lesson as the `when` series, the enum table, the route table and the counter scan: a list is a memory, a derivation is a fact.** And **the person who wrote the wrong list is the one who found it, by building the thing that could not be wrong.** Correcting a signed-off report unprompted is the second time this week — it is why I can read these reports as evidence.

## 🔑 The inventory is worth more than the fix, and it is built the right way round
**17 producers, derived by scanning for `recipientType: "teacher"`, and the derived set must EQUAL the classified set** ⇒ **a new coach message fails the suite until someone decides which kind it is.** That is what stops the fifth copy, and it is a **decision forced at the moment of writing** rather than a rule someone has to remember.
✅ **Four classes, and the classification is honest rather than flattering:**
- **class-event notices** (5) that must ask the predicate;
- **named-by-design** (4) — the recipient is a *person*, not "the coaches of a class". 📌 **Keeping those out is the part that makes the pin usable**: a rule that forced the reassignment pair through a class predicate would be wrong, and a pin that cannot express exceptions gets deleted.
- **own copy but correct today** (4) — *copies that currently agree*, named so they can converge. **The TASK-510 lesson applied to itself.**
- 🔴 **still primary-only** (4) — **pinned as honest, and the list "may only shrink"**, which is the right shape for a known-bad set: it cannot quietly grow.
✅ **The limit is stated:** a producer passing `recipientType` through a variable is invisible to the scan.

## ✅ The repeated date, pinned as CORRECT
Two coaches lose the same dates and each gets their own message containing them. **Pinned as correct rather than tidied** — and the `Coach :` line is built from **all** the class's coaches, so a second coach's copy does not claim they were the only one. **He checked that rather than asserting "nothing odd".**

## 🔴 §3 — the answer is the worst of the three and exactly why I asked: **a move tells NOBODY**
A date or time change **updates the row in place**: no cancel notice, no confirm notice, **no coach, family or admin message at all**. `PENDING_RESCHEDULE` exists as a status that **nothing writes**, and `reschedule_requested` has a renderer with **no producer**.
**A coach finds out passively or not at all:** the calendar feed, the next daily reminder **only if it is sent after the move**, or Monday's digest. ⇒ 🔴 **a same-day move made after that morning's reminder reaches them through nothing.**
📌 **That is TASK-510's failure in its third set of clothes, and the sharpest yet: a coach at the old time, or not at the new one — with a child and a parent waiting.** 🚫 **He built nothing, as instructed.** Whether a move is announced, to whom, and in what words is **the owner's decision**, and it is going up now.

## ▶️ TASK-513, cut
`pauseBooking` (**a class stops**) and `resumeBooking` (**it starts again**) are primary-only and are **precisely TASK-510's rule** — not a new question, just the same fix on two more senders. `confirmCourse` and `notifyRentalAddedSameDay` go with them as the same shape.
