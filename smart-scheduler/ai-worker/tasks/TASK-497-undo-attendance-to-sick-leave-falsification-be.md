# TASK-497 — 🔴 undoing a mistaken attendance records a SICK LEAVE the family never took — BE, S. **Owner decision inside.**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size S.** Found while ruling TASK-492's contract. ⏸️ **Do not build until the owner has answered §2** — Porter is asking. Read it now so the answer turns straight into code.

## §0 The defect
TASK-258's "undo an attendance" sets the session to **`SICK_LEAVE`** (`scheduler.service.ts:3692`ff).
🔴 **A child who was marked present by mistake was not on sick leave.** The family's record then says they took a leave — **and a leave is something they have a limited number of** (`leave_used`, the quota, the extension ceiling). So a **staff mistake** can spend a **family's entitlement**, and the family has no way to see why.
📌 It is pre-existing, it predates the Undo work, and TASK-492's own Undo deliberately does **not** use this path. That is why it is a ticket rather than a paragraph in someone else's task.

## §1 What we know already, so the owner is not asked a vague question
- TASK-492's Undo returns a false check-in to **`CONFIRMED`** and is **silent**, per the owner's ruling. **That is the shape that does not falsify anything.**
- The only reason `SICK_LEAVE` was used is that it was the state available when TASK-258 was written; nothing depends on it meaning "the child was ill".
- ⚠️ **Whether it charged the quota is the thing to check first, and TASK-492 already touched it:** you found that a TASK-258 undone attendance is `SICK_LEAVE` **with no quota taken and no mark**, which is why `leave_charged` had to exist. ⇒ **the visible harm may be the RECORD rather than the balance** — establish which, by value, before anything else. **It changes how urgent this is and I want the truth, not the worse-sounding version.**

## §2 ❓ The owner's decision (Porter is asking)
**When staff undo an attendance they marked by mistake, what should the session become?**
- ⭐ **(a) CONFIRMED** — it is as if the mark never happened; the class is back to "expected". **My recommendation**, and it matches what he already ruled for a false check-in.
- **(b) SICK_LEAVE, as today** — if he considers "the child did not attend" the important fact, and the leave column the place it belongs.
- **(c) Something else he tells us.**
⚠️ **If the answer is (a), say whether any historical row needs correcting** — a family whose record shows a leave they never took is a data question for him, **not something we fix quietly.**

## §3 Build, once ruled
- The undo path produces the ruled state; **one implementation** — if it can share TASK-492's, share it, and say so.
- **The quota and the counters:** whatever the ruling, a staff mistake must not spend a family's entitlement. Pin it by value.
- 🚫 No change to what the family or the coach is told without my ruling (the "silent" ruling was about a false check-in, and this is a different act).
- 📌 Say whether the FE shows anything that assumes `SICK_LEAVE` here — a screen that reads the state will need to move with it.

## Definition of Done
- [ ] The current harm established **by value** (record only, or balance too) before the fix · the owner's ruling built, sharing TASK-492's implementation where possible · **a staff mistake never spends a family's entitlement**, pinned · historical rows raised as a data question, not fixed quietly · the FE's assumptions named · suite **count** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# 🔨 OWNER RULING — relayed by @Porter, 2026-09-26. ▶️ **GO.**
**An undone attendance returns the session to `CONFIRMED`, not `SICK_LEAVE`.** The entitlement and revenue reversal stay exactly as they are, **the leave quota stays untouched**, and **no message goes out.**

## ✅ §1.3 confirmed FROM THE CODE, not from the citation
Porter is right and I checked it rather than take it: `scheduler.service.ts` **AC-4** — *"no leave quota is consumed (the owner's named exception to C-22)"* — and nothing in that branch touches `leaveUsed`. The entitlement decrements are already the floored `sql` form (TASK-496).
⇒ **The harm is the RECORD LABEL ONLY, not the balance.** 📌 That is the less alarming answer and it is the true one. **I asked for the truth rather than the worse-sounding version, and this is it** — the family's *count* of leaves was never wrong; what was wrong is that their record said they took one.
⚠️ **It is still worth fixing, and here is why in one line:** a parent reading their own history sees a sick leave they never took, on a day their child was at the shop. **The number being right does not make the sentence true.**

## §2 Build — as ruled
- The undo path produces **`CONFIRMED`**. 🔑 **Share TASK-492's implementation if it fits** — two code paths that both mean *"this state was set by mistake, put it back"* will diverge, and say plainly whether they share it or why they cannot.
- 🚫 **Nothing else in that branch moves:** the entitlement decrement, the revenue reversal after commit, AC-4's no-quota rule, and the deliberate absence of an auto-`EXTENDED` make-up all stay **exactly** as they are. **Pin each of them unchanged by value** — this is a status change, not a rewrite of a money path.
- **No message**, to anyone.
- 📌 **The judgement named in the code as "for @Sober" — no make-up is created here, because the entitlement itself came back — is correct and stays.** Creating one would give the family the same session twice.

## §3 The DATA REQUEST (owner's instruction: report, never correct)
**Count the historical rows that got `SICK_LEAVE` from this path**, as a read-only query for the owner — and 🔑 **say honestly how confidently they can be identified.** If an undone attendance is indistinguishable from a real declared leave in the data, **say that**: a count that might include genuine leaves is worse than "we cannot tell", because it invites a correction that would take real leaves away from families. 🚫 **Nothing is corrected quietly, or at all, without his word.**

## Definition of Done
- [ ] `CONFIRMED`, sharing TASK-492's path or a stated reason why not · **every other behaviour in that branch pinned unchanged by value** (entitlement, revenue, AC-4, no make-up) · no message · the historical count written as a **DATA REQUEST** with its confidence stated · suite **count** normally **and unreachable** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that charges the quota and one that sends a message · report here + `inbox/SA.md` + log.

---

# ⏸️ STOPPED BEFORE BUILDING — @Jason (2026-09-26): the ruling built as a label change would RE-CHARGE the family the same night. One decision needed.

## 🔴 The finding (read from the code; nothing written)
- **The day-end auto-attends every `CONFIRMED` row of its date** whose start has passed (`jobs.service.ts:83`): it marks it ATTENDED, **deducts the unit, and sends the deduction message**.
- **The only exception** is a row with a `booking_undos` record of kind `checkin` (`notUndoneCheckin()`, TASK-492's Sober ❓2). **The TASK-258 path writes no such record.**
- ⇒ **If `sick-leave` on an ATTENDED row simply wrote `CONFIRMED`**, an attendance undone **today** (before the day-end) is **re-attended tonight**: the unit the undo gave back is **taken again**, and **a message goes out**.
- **That breaks all three parts of the owner's ruling** (entitlement reversal, no message, "as if the mark never happened"). **The old `SICK_LEAVE` label was, by accident, what protected it**: the day-end never touches a leave.
- 📌 Sober's warning that two "put it back" paths would diverge is **exactly this**: TASK-492 already solved it for its own path, and this one would miss it.

## Why TASK-492's path cannot simply be called, and what CAN be shared
- **`undoBooking` won't take these rows:**
  - `undoKindOf` **refuses a staff-marked attendance** (`UNDO_STAFF_ATTEND`) and **a day-end one** (`UNDO_NOT_UNDOABLE`). Those are exactly the rows TASK-258 exists to correct.
  - It **refuses a settled day** (`UNDO_DAY_SETTLED`), while TASK-258's purpose is correcting a **past** mark.
  - ⇒ Routing TASK-258 through it would **refuse most corrections that work today**.
- **What CAN be shared:** the check-in Undo's **writes**:
  - the guarded flip to `CONFIRMED` with the check-in columns cleared;
  - the floored counter decrements;
  - 🔑 **the `booking_undos` event**, which is what the day-end reads.
  - The plan: extract them into **one function in `undo.service.ts`** that both call, and keep each path's **own entry rules** (TASK-492: parent check-ins and unsettled days only; TASK-258: any attendance, any date).

## ❓ Sober — the decision: what KIND does the event record for an undone STAFF or DAY-END attendance?
- **(i) `kind = 'checkin'`**, with `prior_checkin_channel` saying `staff` or `end-of-day`.
  - **No migration**, and the day-end already skips it.
  - ⚠️ But **the record would say "check-in" for something that was not a parent's check-in**. That is a small false label, inside a task whose subject is a false label.
- **(ii) A truthful kind, `'attendance'`** (my recommendation).
  - **Migration `0059`:** the check constraint gains `'attendance'`.
  - `notUndoneCheckin()` widens to both kinds (renamed to say so), with the day-end pin moved with it.
  - The `when` series is pinned, so 59 → 60 is deliberate and stated.
- Either way, **past dates** behave the same: the day-end only ever runs for its own date.

## 📌 Two consequences of `CONFIRMED` itself (the ruling stands; named so nobody is surprised)
1. **The freelance hold:** `SICK_LEAVE` RELEASED the coach's freelance draw; `CONFIRMED` HOLDS it (the tail reconciles to the new status), **the same as TASK-492's check-in Undo**. That is neither entitlement nor revenue, so it is outside what the ruling froze. **It is a change and I will pin it rather than hide it.**
2. **A past-dated undo leaves a `CONFIRMED` row in the past.** Nothing auto-resolves it (the day-end never revisits a date). The family keeps the entitlement (the unit came back), and **staff decide what the session becomes**. That's the owner's "as if the mark never happened", taken literally. **Named, not changed.**

## The DATA REQUEST: what I can already say about confidence (no query run)
- **The TASK-258 path left the attendance's check-in columns in place** (it never cleared them). So **an undone attendance = `SICK_LEAVE` with `checkin_source` / `checkin_channel` set**. A declared leave never had a check-in.
- **Certain** for rows attended since **`0056`** (when `checkin_source` began).
- **Rows attended before `0056` cannot be told apart from a genuine leave**, so the count is a **lower bound**. I'll say so in the request **rather than widen it** (widening would sweep in real leaves).

⛔ **Nothing built.** On your word: (i) or (ii), then I build. **Meanwhile I'll start TASK-508** (independent of this decision) unless you say otherwise.

---

# 🔨 RULING — @Sober (2026-09-27): **(ii), the truthful kind. Migration 0059.** ▶️ Build.
📌 **First: you asked this two turns ago and I dispatched TASK-508 and TASK-509 without answering it. That is my miss**, and you were right to carry it forward in every report until it was answered rather than pick one and proceed.

## (ii) — and the reason is the task's own subject
**(i) would record `kind = 'checkin'` for something that was not a check-in.** 🔑 **That is a false label written inside the task that exists to remove a false label.** The cost of (ii) is a migration and a widened predicate; the cost of (i) is that **the next person to read `booking_undos` learns the wrong thing about what happened**, and this whole round has been about records that say something other than what occurred.
✅ **The migration is cheap and safe here specifically:** the `when` series is pinned (TASK-494) and `db:generate` renumbers (TASK-495), so **59 → 60 is deliberate and enforced rather than a number someone hopes is right.** Rename `notUndoneCheckin()` to say what it now means, and **move the day-end pin with it.**

## 🔴 Your finding is the one that mattered, and it is the same trap as TASK-492 §D
**If an undone attendance simply became `CONFIRMED`, the day-end would re-attend it tonight** — the unit handed back is taken again **and a message goes out**, breaking all three parts of the owner's ruling. 📌 **And the sentence to keep: the old `SICK_LEAVE` label was, by accident, what protected it.** A wrong label was doing load-bearing work, so removing it without replacing the protection would have turned a labelling fix into a money bug. **That is exactly why this was a task and not a one-line status change.**

## The sharing: your plan, approved
**Extract the check-in Undo's writes into one function both paths call** (the guarded flip, the floored decrements, and 🔑 **the `booking_undos` event the day-end reads**), and **keep each path's own entry rules** — `undoBooking` must stay unable to take these rows (it refuses staff and day-end marks and settled days, which is precisely what TASK-258 exists to correct). ✅ **Sharing the writes and not the doors is the right cut**, and it answers my "two paths that mean the same thing will diverge" without pretending they are the same act.

## The two consequences, both accepted as named
1. **The freelance hold changes** (`SICK_LEAVE` released it; `CONFIRMED` holds it) — outside what the ruling froze, **the same as TASK-492's check-in Undo**, and **pinned rather than hidden.** ✅
2. **A past-dated undo leaves a `CONFIRMED` row in the past** that nothing auto-resolves; the family keeps the entitlement and staff decide what it becomes. ✅ **That is the owner's "as if the mark never happened" taken literally, which is what he asked for.**

## The DATA REQUEST — your confidence answer is exactly right
**An undone attendance is `SICK_LEAVE` with the check-in columns still set; a declared leave never had them.** Certain from `0056` onward, **and rows attended before that cannot be told apart from a genuine leave** ⇒ **the count is a LOWER BOUND, and you say so instead of widening it.** 🔑 **Widening would sweep in real leaves, and a number that might take a family's leave away is worse than an admitted gap.** State the bound in the request itself.

---

# ✅ REPORT — @Jason (2026-09-27): built as ruled, (ii) — an undone attendance is CONFIRMED again, through the check-in Undo's own writes, with an event whose kind is the TRUTH · migration 0059 · 3318 / 0 normal AND unreachable, 0 failed queries · tsc 0 · **60 = 60**

## §1 What changed
- **Migration `0059_attendance_undo_kind`** (via `db:generate --custom`; `when` 1783000000055, next in series):
  - the `booking_undos.kind` CHECK gains `attendance`;
  - rerunnable: DROP IF EXISTS, then ADD NOT VALID, then VALIDATE (0057's shape); no backfill.
  - **Witness:** `constraint-def` `booking_undos_kind_chk` contains `attendance`. **Not a name probe**: 0058 already created a constraint of that name, so only its definition proves 0059 ran.
  - `db:generate` also wrote a `meta/0059_snapshot.json` chained from 0003's. I **deleted it** per `drizzle/README.md` ("must not fabricate unverifiable meta snapshots"); `meta/` holds 0000–0003 as before.
- **The shared writes** (`services/attendance-revert.service.ts`). "Put it back" means the same thing on both doors:
  - `revertAttendance(tx, row, alsoSet)`: the **guarded** flip to CONFIRMED (`… AND status = <read>`), the row's check-in columns cleared, and the unit back (course `usedSessions` / voucher `usedHours`, floored, in `sql`);
  - `recordUndo(tx, row, event)`: the append-only event.
  - **Door 1** (`undoBooking`, a parent's check-in): now calls both. Its behaviour is byte-identical by its own 37 tests; the leave branch keeps its own flip.
  - **Door 2** (TASK-258, `updateBookingStatus(…, "sick-leave")` on ATTENDED): **CONFIRMED, not SICK_LEAVE.** It calls both, with its note as before (`note: reason ?? current.note`, in the same guarded update).
  - **Each door keeps its own entry rules**: Door 1 takes parent channels and unsettled days only; Door 2 takes any mark on any date. **They share the writes, not the doors.**
- 🔑 **The kind is the truth** (`attendanceUndoKind`):
  - a parent's check-in (`checkin-qr` / `line` / `shopfront-qr`) ⇒ `checkin`;
  - a **staff** mark, the **day-end's**, or a **legacy row with no channel** ⇒ `attendance`;
  - never `checkin` for something that wasn't one.
- **The day-end:** `notUndoneCheckin` is **renamed `notUndoneAttendance` and widened** to `kind in ('checkin', 'attendance')`. The one caller (`jobs.service`) and its byte-frozen literal pin moved with it. **This is what stops tonight's day-end re-attending an undone row** (the unit taken again, the message sent).
- **`undone_by`** = the staff actor the route already passes (`{ channel: "staff", actor }`).

## §2 Every other behaviour of that branch: pinned UNCHANGED by value (`attendance-undo-confirmed-task497.test.ts`, 4 tests, through the real `updateBookingStatus`)
- **The entitlement:** course `usedSessions` 3 → 2; a voucher's `usedHours` 5 → 4; **floored** (0 stays 0).
- 🔴 **AC-4, the quota: `leaveUsed` UNTOUCHED** (1 → 1).
- **No make-up:** the only insert is the event (no `bookings` row).
- **No message:** no outbox row; `notification` is the same skipped result (`แก้ไขการเช็คชื่อ — ไม่ส่งข้อความ`).
- **The revenue reversal:** `reverseBookingSale(id)` **after** the transaction, as before.
- **The event, by value:** `{ kind: "attendance", undoneBy: "admin-dong", reason, priorStatus: "ATTENDED", priorCheckinChannel: "staff", priorCheckinActor: "admin-kwan", leaveRefunded: false, … }`.
- **The kind table:** staff / end-of-day / null ⇒ `attendance`; checkin-qr / line / shopfront-qr ⇒ `checkin`.
- **The guard, NEW on this door:** a second request that read ATTENDED after the first committed ⇒ **409 `UNDO_ALREADY_CHANGED`**, zero rows, the unit not returned twice, no second event. The old door wrote unconditionally.

## §3 The two consequences you accepted, pinned rather than hidden
1. **The freelance hold:** the tail reconciles to the new status, so **CONFIRMED HOLDS the coach's hour** where SICK_LEAVE released it (pinned: `[[B1, "CONFIRMED"]]`), the same as TASK-492's check-in Undo.
2. **A past-dated undo leaves a CONFIRMED row in the past.** The day-end never revisits a date, so staff decide what it becomes (the owner's "as if the mark never happened", taken literally). Named, not changed.
3. (New, and true of both doors now) **the row's check-in columns are CLEARED**. Their provenance lives on the event (`prior_checkin_*`), as TASK-492 does. A CONFIRMED row claiming a check-in would be a new false label.

## §4 🔴 The FE assumes a LEAVE here (Fern's, named, not changed)
- The **only** way to undo an attendance in the UI is BookingModal's **"Sick leave" button** (`useMarkSickLeave` → `action: "sick-leave"`). It's enabled on an ATTENDED row (disabled only on SICK_LEAVE).
- **Its confirm dialog** (`confirmAction.leaveMsg`; the handler's own comment is *"consumes leave quota and appends a make-up"*) and **its toast** (`booking.leaveSavedTitle`) both describe a LEAVE.
- On an ATTENDED row they now describe the opposite of what happens (CONFIRMED, no quota, no make-up, no leave), and they did before too, less visibly.
- **Recommend a Fern task:** on an ATTENDED row the button (or its words) should say "undo attendance" and "the session is back to confirmed". **The words are the owner's.**

## §5 📋 DATA REQUEST — historical rows this door made SICK_LEAVE (READ-ONLY, for the owner; nothing is corrected, by his instruction)
```sql
-- TASK-497 · READ-ONLY. ⚠️ THIS COUNT IS A LOWER BOUND, BY DESIGN — see the notes below before acting on ANY number it returns.
SELECT b.id, b.date, b.start_time, b.student_id, b.checkin_source, b.checkin_channel, b.checkin_actor, b.note
FROM bookings b
WHERE b.status = 'SICK_LEAVE'
  AND (b.checkin_source IS NOT NULL OR b.checkin_channel IS NOT NULL)
ORDER BY b.date;
```
- **Why these rows are certain:** the old door wrote SICK_LEAVE **and left the attendance's check-in columns in place**. A declared leave is never checked in: the leave doors act on non-ATTENDED rows, and TASK-492's check-in Undo clears the columns before a row could become a leave. **So SICK_LEAVE + a check-in column = an undone attendance.**
- ⚠️ **Why it's a LOWER BOUND:** `checkin_source` exists only since **0056** and `checkin_channel` since **0057**. **An attendance undone before then left no mark, and is indistinguishable from a genuine leave.** Those rows are **not** in this count, and **nothing in the data can tell them apart.**
- 🚫 **Do not widen it** (e.g. to `leave_charged = false`). That also matches **real over-quota leaves**, and a correction built on it **would take genuine leaves away from families.**

## §6 Break-and-watch (database unreachable · CHECKSUM identical before and after · every restore byte-identical · BASELINE=41)
- **Q: the undo CHARGES the leave quota:** BITES (`leaveUsed` 1 → 2 seen by value, plus the leave-doors source pin).
- **M: the undo SENDS a message:** BITES.
- **S: back to SICK_LEAVE:** BITES.
- **K: the event says `checkin` for every attendance (option (i)'s false label):** BITES.
- **E: NO event written** (so tonight's day-end would re-attend): BITES.
- **D: the day-end exemption back to `checkin` only:** BITES (the predicate's rendered SQL).
- **Existing pins moved under the ruling (same claims):**
  - 61 migration census lines 59 → 60, each marked `// TASK-497: +0059`;
  - the 0058 journal pin finds 0058 **by tag** (it was the newest) and is byte-unchanged; a new 0059 test pins the file, the witness, the journal entry and the schema;
  - `counter-sql`'s inventory: the four check-in / TASK-258 decrement sites became the two shared ones, still floored;
  - `attendance-undo`: AC-1 and AC-2 are now read through the shared writer;
  - the day-end literal and the predicate SQL are renamed and widened.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
Verified by me: **60 `.sql` files = 60 journal tags** · **3318 pass / 0 fail normally AND with the database unreachable, zero failed queries** · tsc 0.

✅ **Built as ruled, and the kind is the truth:** a parent's check-in records `checkin`; a staff, day-end or legacy mark records **`attendance`**. **The record now says what happened** — which was the entire point of a task whose subject was a record that did not.
✅ **The shared writes are in their own service and each door keeps its entry rules** — the cut I approved, and it means **the day-end's exemption is the same fact for both doors** rather than two facts that must agree.
✅ **The guard came with it:** this door now refuses a double undo (409, nothing twice). **TASK-492's property arrived here for free because the writes were shared rather than copied** — which is the argument for sharing them, demonstrated rather than asserted.
✅ **Everything the owner froze is pinned unchanged by value** — the unit back and floored, **`leaveUsed` untouched**, no make-up, no message, the reversal after commit. And the three consequences are **pinned rather than hidden**, including the freelance hold and the past-dated `CONFIRMED` left for staff.
✅ **The mutation I care about most bites: "no event ⇒ tonight's re-attend".** That is the money bug this task could have become, and it is now a test.
✅ **`db:generate` wrote a chained snapshot and he deleted it per the README, and said so.** A silent artefact from a tool we have just been fixing is exactly the thing to mention rather than tidy away.

## 🔴 His FE finding — the one that stops this being finished
**The only UI path to this action is BookingModal's "Sick leave" button on an ATTENDED row.** Its dialog says the action **consumes quota and appends a make-up**; its toast says **leave saved**. 🔑 **All three are now untrue on that row — and they were the parts a human actually reads.**
📌 **We fixed the record and left the screen saying the old thing.** An admin pressing a button labelled *Sick leave*, told it will spend a family's quota, will avoid pressing it — **so the correction we just built is one nobody will dare use.** ⇒ **TASK-514 for @Fern**, and the words go to the owner with the two already waiting.
