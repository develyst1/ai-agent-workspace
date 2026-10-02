# TASK-582 — item 2: the advance-leave act — BE, M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · ⏸️ **Queued behind TASK-581.** The owner ruled as recommended.

## §0 The ruling
**A future-dated advance leave uses the NEW act: it BLOCKS the day and LISTS what is already booked. 🚫 It no longer auto-cancels.**
✅ **The gate, the table and the list are already built and inert (TASK-561).** ⇒ **This is the writer, and the one question that held it is now answered.**

## §1 Build
- **The act writes `teacher_leave_days` and returns the day's live bookings.** 🚫 **It cancels nothing.**
- 🔑 **`reportOwnLeave` for a FUTURE date must now route to this act instead of cancelling.** ⚠️ **Say exactly where the fork is, and pin BOTH sides:** **a future date ⇒ block + list, nothing cancelled · today or the past ⇒ unchanged.** *That boundary is the whole ruling.*
- ⚠️ **Who may record one — admin, teacher, or both?** **The owner ruled the ACT; if he did not rule the ACTOR, say so and use the narrowest reading that works, declared.** 🚫 **Do not widen a permission on a guess.**
- ✅ **Removable, as I ruled:** *a block that cannot be lifted is a trap.* **Pin that removing it restores nothing and cancels nothing** — it only stops stopping new bookings.
- ⚠️ **The gate goes LIVE the moment this writes.** ⇒ **Re-state that every booking-creating path still respects it, and that the make-up still SKIPS.** 🔑 **TASK-561 proved it inert; this is the first time it bites for real.**

## Definition of Done
- [ ] The act writes the day and returns the list, **cancelling nothing** · the future/past fork **named and both sides pinned** · the actor question answered **or the narrowest reading declared** · removal pinned as harmless · 🔑 **the gate re-proven live, including the make-up skip** · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · mutations incl. **a future leave still cancelling** and **a past leave routed to the new act** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-30): the advance-leave act is LIVE · **the fork named (`isAdvanceLeave`: strictly AFTER today) and BOTH sides pinned by value** · cancels nothing, tells nobody · removable (the lift restores and cancels nothing) · **the ACTOR: the narrowest reading, declared** · **the gate re-proven LIVE through one shared store, the make-up skip included** · 🟠 **"listed for the ADMIN" has no admin view yet** · **NO migration (65)** · **3665 / 0 normally and 3× DB-unreachable (0 failed queries)** · tsc 0 · **8 / 8 mutations bite**

## §1 🔑 The fork: ONE place, both sides pinned
- **`isAdvanceLeave(date)` = `date > today` (Bangkok)**, in `lib/teacher-leave.ts`. `reportOwnLeave` asks it FIRST.
  - **A FUTURE date ⇒ the new act:** `teacher_leave_days` gets one row (teacher, date, reason, `createdBy` = who), and the response lists that day's LIVE classes (`leaveDayBookings`, TASK-561's read, the "whose class" predicate).
    - 🚫 **No booking read-for-write, no transaction, no update, no message**; tripwires make any of them throw.
    - Response: `{ mode: "advance", cancelled: 0, bookingIds: [], familiesNotified: 0, leave: { date, reason }, alreadyRecorded, bookings: [...] }`. The three old fields stay present and **truthful (zero)** so today's screen doesn't break.
  - **TODAY or the PAST ⇒ the old cancel, unchanged:** the same writes (`CANCELLED` + `TEACHER_LEAVE`) and **the same response shape (no `mode`)**, pinned by value for today AND a past date, with a tripwire proving **no leave row** is written.
- **Why TODAY is not "advance":** the day has begun and its classes are about to run. A block that only stops NEW bookings would leave families waiting for a coach who isn't coming; the cancel, which tells them, is the honest act for today. This matches TASK-561's *"recorded only for a date strictly AFTER today"*.
- **`sessionIds` on a FUTURE date ⇒ 400, in words (DRAFT)**, nothing written. The ticks choose classes to CANCEL, which this act never does. **Refused, not silently ignored.**
- **Recording the same day twice is not an error:** the FIRST record stands (its reason, its author), the list comes back again, `alreadyRecorded: true` (the unique index + `ON CONFLICT DO NOTHING`).

## §2 ⚖️ The ACTOR: the owner ruled the ACT, not the actor ⇒ the narrowest reading, declared
- **The same door, key and identity as before:** `POST /teachers/me/leave`, a **LINKED teacher**, **their own day** (`action:calendar.teacher-leave` + `assertLinked`).
- **No admin door, no new key, no new permission.**
- **Two small doors added, same identity:** `GET /teachers/me/leave` (my recorded days from today on; a read, `menu:calendar`) and `DELETE /teachers/me/leave/:date` (lift one of mine, the same action key). Both are in `TEACHER_ALLOWED`.
  - Through the ROOT app: an UNLINKED account (an admin) ⇒ **403 SCOPE_TEACHER on all three**, services never reached. A linked one reaches its own, with `me`. A malformed date ⇒ 400.
  - `:date` is declared in `FREE_FORM_PARAMS` (the uuid guard fails closed on any undeclared param, correctly).
- **If the owner wants an ADMIN to record a teacher's leave:** it's the same writer (`recordAdvanceLeave(exec, teacherId, …)`) behind an admin route with a key. **Small, but a new permission, so not guessed.**

## §3 ✅ Removable, and the lift is harmless
- `liftAdvanceLeave` deletes **that one row, by teacher AND date**. Pinned: another teacher's row on the same date survives.
- 🚫 **No update, insert, transaction or booking read** (tripwires). Not recorded ⇒ 404 (DRAFT).
- **It restores nothing and cancels nothing: it only stops stopping new bookings.**

## §4 🔑 The gate, LIVE, re-proven end to end
- **One shared store:** the act's INSERT lands in it, and **THE reader** (`teacherLeaveOn`) reads the SAME store.
  - **Seam A:** a new booking with that teacher that day ⇒ **409 TEACHER_ON_LEAVE**; another day is untouched.
  - **Seam B:** **the automatic make-up SKIPS the leave week** (10-08 ⇒ 10-15).
  - **Lift ⇒ both as if it never was** (bookable again; the make-up lands on 10-08).
- **Every booking-creating path still respects it:** TASK-561's derived pins are all still green:
  - booking rows are born in exactly **four** places (the one inserter, the two make-up writers, the dev seed);
  - both seams read THE reader;
  - the non-insert doors (revive, leave-Undo, a seat joining a group) call the class check;
  - the camp sync skips and lists.
  - **Nothing in that set changed**, so the proof is this TASK's end-to-end on top of it.
- **The module is still the ONLY toucher of `teacher_leave_days`.** The TASK-561 pin moved from *"writes nothing"* to *"writes exactly `insert:teacherLeaveDays` + `delete:teacherLeaveDays`, never an update, a cancel or a message"*.

## §5 Existing pins updated, only for this
- TASK-561 *"reportOwnLeave untouched"* ⇒ it now forks (the owner ruled), pinned here instead.
- The linked account's route set: 8 → 10.
- The ended-course classification: `+DELETE /teachers/me/leave/:date` (unrelated: no booking).
- The two free-form-param censuses: `+/api/teachers/me/leave/:date`.

## §6 🟠 FINDING: *"listed for the ADMIN"*, but there is no admin view
- The owner's words: existing classes are **listed for the admin to handle by hand**. Today the list goes back to **the teacher who recorded it**, in the response.
- **An admin has no way to see recorded leave days or their classes.** The block works (new bookings refused, in words naming the teacher and day), but nobody is shown the classes that now need a human.
- **Two small options, your call:**
  - **(a) an admin READ:** upcoming recorded leave days with each day's live classes (`leaveDayBookings`, already built). Read-only, no copy needed.
  - **(b) a LINE notice to admins** when a teacher records one. Needs the owner's wording.
- **Not built, because the ruling names the list but not where the admin reads it.**

## §7 📌 For @Fern (FE, read only, not changed)
- **`ReportLeaveDialog`:** a FUTURE date must not offer ticks (a subset ⇒ 400). The response now carries `mode: "advance"` and the list, so the success message must say **"day blocked, N classes listed, nothing cancelled"**, not "cancelled 0".
- **The FE mirror `TEACHER_ALLOWED_ROUTES`** needs the two new routes if the teacher screen lists and lifts days.
- 📋 **3 DRAFT server sentences** are in `COPY-REVIEW-2026-09-29.md` §15.

## §8 Checks
- Suite: **3665 / 0** (3655 + 10 new). **DB-unreachable 3×: 3665 / 0, 0 "Failed query".** tsc 0. **65 .sql = 65 tags, no migration** (the table is TASK-561's `0062`).
- **Line endings:** found that four of the touched production files are CRLF, which my grep had hidden. Every edit kept each file's own ending; **no mixed file** (checked).
- **Mutations with `bun run mutation:run`:** baseline 45, measured; CHECKSUM identical; every restore byte-identical:
  - **L1, a future leave still cancelling (the fork removed):** BITES.
  - **L2, a past leave routed to the new act:** BITES.
  - **L3, TODAY routed to the new act (the boundary off by one):** BITES.
  - **L4, the advance act ALSO cancels (falls through):** BITES.
  - **L5, `sessionIds` silently ignored on a future date:** BITES.
  - **L6, the lift deletes every day of mine, not the one named:** BITES.
  - **L7, an unlinked account reaches the list:** BITES.
  - **L8, the gate off:** BITES.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · 🟠 **one finding, and it is a silence**
Verified by me: **3665 / 0** (and 3× unreachable) · tsc 0 · **65 .sql, no migration** (counted myself).

## ✅ The fork, pinned on both sides — which was the whole ruling
**Future ⇒ record the day + list its live classes; nothing cancelled, no transaction, nobody told (tripwires).** **Today / past ⇒ the old cancel, SAME writes, SAME response shape.**
✅ **"Today stays a cancel because its classes are about to run"** — 🔑 *a reason, not a boundary chosen for tidiness.*
✅ **`sessionIds` on a future date ⇒ 400 in words** (*they pick classes to cancel, and nothing is being cancelled*) ✅ **and recording twice ⇒ the first record stands.**

## ✅ The actor, narrowest reading, declared — exactly as instructed
**The SAME door and identity: a LINKED teacher, their own day. No admin door, no new key.** **Plus GET/DELETE on that identity; unlinked ⇒ 403 on all three.**
🔑 **He did not widen a permission on a guess, and he said which reading he took.** ✅ **Lift deletes one row by teacher AND date, restoring nothing and cancelling nothing** — *as I ruled: a block that cannot be lifted is a trap, and lifting it must not become a second act.*

## ✅ The gate is LIVE, proven end to end
**Through ONE shared store: recorded ⇒ a new booking 409 AND the make-up SKIPS the week · lifted ⇒ both gone.** ✅ **And TASK-561's derived set — four birth places, both seams — is still green and unchanged.**
🔑 **"Still green and unchanged" is the claim that matters: the gate was proven inert, and turning it on did not quietly change what it covers.**

## 🟠 His finding — **ruled, and it is bigger than an option list**
**The owner ruled "listed for the ADMIN to handle by hand". No admin can see a recorded day or its classes — the list goes to the teacher.**
🔑 **And there is a second half he did not claim: the OLD act CANCELLED, and a cancel told the admins. The new act tells nobody.** ⇒ **We silently removed a signal admins used to get, at the exact moment we also stopped cancelling.**
⇒ **Both halves, and neither is optional:**
- ✅ **(a) the admin read — now. `leaveDayBookings` is built and needs no copy.**
- ✅ **(b) the notice — also now, behind a SHAPE pin, words as a DRAFT to the owner.** 🔑 **This is not a new notification being proposed; it is a restoration.** *Adding a signal is the owner's call; not losing one is ours.*
⇒ **TASK-587.** 📌 **The ruling said "listed for the admin", and we had built a list the admin cannot reach.**

## 📌 Carried to @Fern
**The leave dialog must not tick on a future date, and must word the advance result.** 📋 **His 3 drafts are in COPY-REVIEW §15.** ⇒ **TASK-588 — item 2's last piece.**
