# TASK-570 — REQ-110 item 6: change a course's start date — BE, M/L

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · **Size M/L.** Khwan, REQ-110 item 6. 🔑 **The LAST item of the round, and the biggest.**

## §0 What she asked and why
**"ผู้ปกครองเราขยับวันเริ่มคอร์สบ่อยมากค่ะ"** — **a button to move a NOT-YET-STARTED course's start date, with the expiry recomputed normally**, instead of cancel-and-recreate.
🔑 **Her own reason is the argument: cancel-and-recreate *"จะทำให้เงินงง"*.** ⇒ **She is describing a workaround that will corrupt the money once the system carries it.** 📌 **That is why this is worth doing properly rather than quickly.**
**The owner's scope: a course that has NOT STARTED, and the expiry recomputed the normal way.**

## §1 Why this is M/L and not M
**It is TWO things at once: a RE-PLAN and an EXPIRY WRITE.** ⇒ **Both of the fortnight's rules apply, and both are now enforceable:**
- 🔑 **Every answer to a leave carries its link** (TASK-553 steps 1–2). **The re-laid sessions must be born linked, like resume's.** ⚠️ **If this becomes a FOURTH writer that answers a leave without linking, it is the defect we have spent three days removing.**
- 🔑 **Every expiry move is RECORDED, with its actor** (TASK-556, TASK-568). ⚠️ **"Recomputed normally" must still leave a record** — *a system recompute is an actor-NULL row, not an absent one.*

## §2 Build
- **Derive what "not yet started" MEANS and pin it** — 🔑 **no attended session? no session in the past? the start date in the future?** ⚠️ **These differ for a course whose first session was cancelled.** **Choose, justify in one line, and 🚫 do not accept the easy one silently.**
- ⚠️ **Say what happens to sessions already laid out** — re-laid, cancelled and re-created, or moved? 🔑 **Whichever it is, the family's notices must match: a parent who gets six "cancelled" messages for a date change will phone Khwan.** ⇒ **Name the audience and what they receive; if the honest answer is "six cancellations", STOP and tell me.**
- ✅ **Refuse, with actionable words, anything outside the owner's scope** (a started course, an ended one). 🚫 **Do not silently do nothing.**
- ⚠️ **Money: say plainly what this does NOT touch** — what was paid, any deduction already taken. 🔑 **Khwan's whole reason is that the workaround confuses the money; the fix must be able to say what it leaves alone.**
- ⚠️ **And the TASK-561 block applies:** **a re-laid session landing on a teacher's blocked day follows the same rule as a re-planned make-up.** **Prove it.**

## §3 Migration
⚠️ **Report the number the moment one exists. The uat range is 64 today.**

## §4 Not in scope
🚫 The FE half · 🚫 started courses · 🚫 the money itself · 🚫 Palm's items.

## Definition of Done
- [ ] "Not yet started" **derived, pinned and justified** · the re-laid sessions **born linked** · the expiry recompute **recorded with an actor** · the session treatment and **the family's notices named — STOP if it is six cancellations** · out-of-scope refused with actionable words · **what it does NOT touch stated** · the TASK-561 block proven · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · migration reported · 🔑 mutations incl. **a re-laid session born unlinked** and **an expiry moved without a record** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-30): the start date moves, the sessions MOVED in place (not cancelled / re-created), the expiry recomputed AND recorded · **NO migration (64 stays)** · **3624 / 0 normally, and 3× DB-unreachable, 0 failed queries** · tsc 0 · ten mutations bite · **not six cancellations: ZERO messages at the move, ONE schedule message per person at the re-confirm**

## §1 🔑 "Not yet started", exactly (`courseNotStarted`, pinned)
- **Not started ⇔ nothing was imported as already taught (`priorSessions` = 0) AND every non-CANCELLED session of the plan is dated TODAY or later.** That leaves nothing delivered and no leave in the past.
- *One line of justification:* a **cancelled** session doesn't start a course (the family attended nothing and nothing was charged), **but a past delivery, a past no-show or a past leave has already run the course's time.**
- 🚫 **Not the easy ones:**
  - *"the start date is in the future"* misses a course whose first session already happened;
  - *"no attended session"* treats a past no-show or a past leave as not started.
  - Both variants are mutations that bite.
- **A course whose first session was CANCELLED is movable** (pinned). **A session TODAY still counts as not started** (it hasn't been taught).

## §2 The sessions: MOVED, not cancelled and re-created
- **The same rows are re-dated in place, weekly from the new start, in the plan's own order:**
  - a declared leave keeps its week;
  - a make-up stays at the end;
  - the weekday is derived from the new start (as creation / resume do);
  - the time and the teacher are kept.
- 🔑 **Born linked BY CONSTRUCTION: no row is created, so no link can be lost.** A make-up's `extendedFromId` travels with its row.
  - **This is NOT a fourth writer that answers a leave unlinked; it answers nothing new.**
  - Pinned: the one row write sets **only** the date (+ the re-confirm fields). Mutations dropping the link, or "re-creating" rows, BITE.
- **Applied in collision-free order:** a shift later moves the LAST row first, so no row lands on a sibling that hasn't left yet (pinned; the wrong-order mutation bites).
- **Every new date passes the create path's own gate** (`assertTeacherBookable`: archived / weekday off / freelance). **A clash with ANOTHER booking refuses the WHOLE move**, naming the date (`SLOT_TAKEN`, one transaction, nothing moved). The admin picks another start, as resume does.
- ✅ **TASK-561's block:** a week on the row's teacher's advance leave is **SKIPPED**, the make-up's own rule, through THE injected reader. **Returned as `skippedForLeave`** so the admin sees it (pinned; the ignore mutation bites).

## §3 🔑 The family's (and the coach's) notices: named
- **At the move: NOTHING is sent. No "cancelled", no per-session "moved".**
- **A CONFIRMED session returns to PENDING** (its confirmation was of the OLD schedule): the check-in token is cleared and the holds are reconciled to PENDING. **The response says `needsReconfirm: true`.**
  - The admin's existing **Confirm-course** then sends **ONE `course_confirmed` per person** (the coach + each linked family account) with the NEW start, weekday, expiry and leave dates. It's the approved CONFIRMED SCHEDULE message, **reused untouched, not a new wording.**
- **A course that was never confirmed:** nobody was told the old dates, so nothing to correct. The admin confirms as usual.
- ⚠️ **Between the move and the re-confirm, the family and the coach hold the OLD schedule.** The admin is told (`needsReconfirm`). *The alternative, auto-sending, would re-implement the course message or confirm rows the admin hadn't; I chose the one existing message on the admin's click.* **Your call if the owner wants it automatic.**

## §4 The expiry: recomputed the normal way, and RECORDED
- **Creation's own formula** (`courseBornCeiling(courseExpiry(new start, size), the plan's last session, declared absences)`) over the MOVED plan, **and never before the course's own last session.** Two advance leaves' make-ups can run past the formula; pinned, and that mutation bites.
- ⚠️ **RECORDED with the ADMIN as the actor, not NULL.** A deliberate departure from your *"actor-NULL row"*, for two reasons:
  1. **A person asked for it.** `resumeCourse`'s recompute (the other admin-triggered one) records the admin too.
  2. 🔴 **TASK-556's Undo reads an actor-NULL row ending on the expiry as the make-up's SYSTEM stretch and RESTORES its `from`.** After a start moved EARLIER, a make-up can sit exactly on the new expiry, so an actor-NULL row would make the Undo restore the **pre-move** (later) expiry: **silently wrong.**
  - With the admin as actor, the Undo **refuses** ("moved by …"), which is safe. **The record is present either way; only its reading differs.** (The recorded-as-system mutation bites.)
- ⚠️ If the admin had **edited the expiry by hand** before, the recompute replaces it (recorded). The owner's scope says *recomputed normally*. Say if a person's date should survive, as in TASK-569.

## §5 🚫 What it does NOT touch (Khwan's reason: the money)
- **No sale, refund or re-post:** the course's sale from purchase is the same sale; no `recordSale` / `reverseBookingSale` / `boMovement`.
- **No deduction** (nothing was delivered: that's "not started").
- **No counter:** `usedSessions`, `leaveUsed`.
- **No row created or cancelled:** ids, rentals and rates are the same objects.
- **Only:** the sessions' dates · a CONFIRMED → PENDING status · the holds reconciled to that status (as a single move does) · the course's `startDate` / `weekday` / `expiryDate` + its record. **All pinned by source as absences.**

## §6 Refusals, in words an admin can act on
- **A start in the past:** `400 START_IN_PAST`, with *"เลือกวันนี้หรือหลังจากนี้"*.
- **A STARTED course:** `409 COURSE_STARTED`, with *"ใช้ย้ายคาบรายคาบในแผนแทน"*.
- **An ENDED or PAUSED course:** `assertCourseWritable`'s own words, first.
- **Nothing to move:** `409 NOTHING_TO_MOVE`.
- **A clash:** `409 SLOT_TAKEN` with the date.
- 🚫 Never a silent nothing.

## §7 Door
- `POST /courses/:id/start-date { startDate }`, **the plan editor's key** (`action:bookings.course-plan`); classified "guarded" in the ended-course list. The actor comes from the token.

## §8 Checks
- Suite: **3624 / 0** (3610 + 14 new in `src/lib/course-start-change-task570.test.ts`). **DB-unreachable 3×: 3624 / 0, 0 "Failed query".** tsc 0. **64 .sql = 64 tags: no migration.**
- **Existing pins updated, each for exactly this addition:** `actorOf(c)` 22 → 23; `recordExpiryChange(` 4 → 5 (*"every path that moves an expiry records it"*: this is the fifth).
  - The two resume pins that read the resume region stay unchanged: **I moved the new function OUT of that region** (it first sat inside it and tripped them).
- **Break-and-watch** (BASELINE 14, CHECKSUM identical, every restore byte-identical):
  - **U1, a re-laid session BORN UNLINKED** (the move drops the link): **BITES**.
  - **U2, rows re-created instead of moved:** BITES (7).
  - **E1, an EXPIRY moved WITHOUT A RECORD:** **BITES**.
  - **E2, the recompute recorded as the system:** BITES.
  - **E3, the expiry ending before the last session:** BITES.
  - **N1, the easy "not started":** BITES.
  - **N2, a cancelled first session counted as started:** BITES.
  - **L1, TASK-561 ignored:** BITES.
  - **C1, a confirmed session keeping the OLD confirmation:** BITES.
  - **O1, the wrong move order:** BITES.
  - *U1 and E3 first SURVIVED:* no pin covered the row write's exact fields, and no fixture made the formula fall short. **Both gaps are closed with exactly those cases.**
- ⚠️ **Honest limit:** the service's wiring is pinned **by source**, and the whole plan **by value**. The collision-free ORDER is proven on the plan; the database's own slot index is what it protects, **and no agent runs it against a real DB.**

⛔ Only you mark this DONE. **This was the round's last BE item.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · **the round's last BE item**
Verified by me: **3624 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **64 .sql, no migration** (counted myself).

## 🔑 "Moved in place" is the design decision that made everything else easy
**The sessions are MOVED, not cancelled and re-created** ⇒ **born linked BY CONSTRUCTION — no new row, no lost link.**
🔑 **That is not an implementation detail; it is why this is not a fourth unlinked writer.** **The rule I wrote as a warning became unnecessary because he chose a shape that cannot break it.** 📌 *The best answer to "don't create this class of bug" is a design in which it cannot occur.*
✅ **Collision-free order · the create gate on every new date · a clash refuses the WHOLE move · TASK-561's leave weeks SKIPPED and returned.**
✅ **"Not started" derived, not assumed: nothing imported as taught AND every non-cancelled session today or later** — 🔑 **a cancelled first session is still movable; a past delivery, no-show or leave has started it.** **Two mutations bite on exactly the easy readings I warned about.**

## ⚖️ Notices — **ruled: keep it manual, with one condition**
**ZERO notices at the move — not six cancellations.** ✅ **Confirmed sessions go back to PENDING + `needsReconfirm`, and the existing Confirm-course sends ONE confirmed schedule per person.**
🔑 **That is better than what I asked for: I said "stop if it is six cancellations", and he made it one message that the admin sends when they are ready.**
⚖️ **Automatic? No.** 🔑 **An admin moving a start date is mid-conversation with a parent — an automatic blast would send a new schedule before the admin has finished deciding.**
⚠️ **The condition: the window where the family holds a stale schedule must be VISIBLE, not merely flagged.** ⇒ **A course awaiting reconfirmation has to surface where an admin actually looks (the attention surface), not only as a field.** **If it does not today, that is a finding for the FE half.** 📌 *An invisible "needs reconfirm" is how a family keeps the old dates for a month.*

## ⚖️ The actor — **accepted, and it is principled rather than convenient**
**The recompute is recorded with the ADMIN as actor, not NULL.**
✅ **Reason (1) alone carries it: a PERSON asked for this expiry.** 🔑 **The actor field records who caused it, and the truthful answer here is "an admin".**
✅ **Reason (2) is the proof that recording the truth keeps other features correct:** 🔴 **TASK-556's Undo reads an actor-NULL expiry row as a make-up's system stretch and would RESTORE the pre-move expiry.** ⇒ **With the admin as actor it refuses, which is safe.** 📌 **The inverse of TASK-569: there the actor distinguished a person's decision; here the same distinction protects the Undo.**

## ⚖️ A hand-set expiry replaced by the recompute — **as built, and here is why it is NOT a TASK-569 case**
🔑 **TASK-569's rule was "the system must not SILENTLY undo a person."** **This is a person overriding a person, in the open, with a record of both.** ⇒ **Not the same thing**, and **the owner's own words were "the expiry is recomputed normally."**
⚠️ **One condition: the admin must be able to SEE that they are about to replace an expiry someone set by hand.** **You already have the warn-and-save shape and `expiryImpact`** ⇒ 🔑 **say whether the preview already carries that fact; if not, it is a small addition and I want it before the FE half ships.** *Replacing a colleague's deliberate date without saying so is the silent-undo problem wearing different clothes.*
✅ **"Not touched" stated plainly** — the sale, deductions, counters, row identities, rentals, rates. **Only dates, CONFIRMED → PENDING, holds, and the course's start / weekday / expiry + record.** 🔑 **Khwan's reason was the money; this can say what it leaves alone.**
