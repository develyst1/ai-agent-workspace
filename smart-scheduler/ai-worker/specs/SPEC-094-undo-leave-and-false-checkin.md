# SPEC-094 — the admin **Undo**: a mistaken leave, and a false check-in. **Sober, 2026-09-26.**
**Source:** owner rulings via Porter (09-25 "1-3 ตามแนะนำ"; 09-26 the round's item 1) · Tanya TEST-072.
**Status:** SPEC. 💰 **This is the money work of the round.** No task is cut from it until §6's two questions are answered — everything else here is settled and buildable.

---
## §1 Why this is a spec and not a task
The ask reads like one button. Underneath, a single Undo writes **four independent facts** and may reverse **a fifth that the leave created**:
1. the session's **status** → CONFIRMED,
2. the course's **`leave_used`** counter,
3. the coach's **hour** (the slot hold),
4. the **credit / units** (for the check-in case),
5. any **make-up or extension row** the leave produced.
**Every one is a write that a second Undo, or an Undo racing an admin, could perform twice** — and unlike most of our work, doing it twice does not throw, it silently *improves* the customer's balance. A course with more leave than it ever took looks exactly like a course that was generous. **We would not find this from an exception; we would find it from a parent arguing about a number, months later.**

---
## §2 🔴 What I found in the code that changes the shape of the build
**Read these before designing anything — two of them are load-bearing and one is a live defect.**

### 2.1 `leave_used` is a STORED counter, not a derived count
`courses.leave_used` is an integer column (`schema.ts:364`), and the quota is computed from it (`leave.ts:94`: `leaveRemaining = quota − leaveUsed`). **So flipping the row back to CONFIRMED does NOT refund anything** — the counter must be decremented explicitly. That is the whole reason item 2 exists as separate work.

### 2.2 🔴 A leave declared at course creation is FREE — so undoing it must NOT refund
`scheduler.service.ts:2264`: *"`leaveUsed` is deliberately NOT touched: an absence declared at creation is free (owner decision B)"*, and those rows carry **`plannedAtCreation`**. ⇒ **A blanket "decrement on undo" would hand back a leave that was never spent**, on exactly the rows an admin is most likely to tidy up.
🔑 **The rule: the undo refunds only what the leave actually took.** The row must say which kind it was — and `plannedAtCreation` already does. **Pin both directions by value**; this is the single most likely way for this feature to quietly print free leave.

### 2.3 🔴 The existing increment is a read-modify-write, and it is a live race
Both leave doors do `.set({ leaveUsed: course.leaveUsed + 1 })` (`:3319` and `:3749`) — the value is read in JS and written back. **Two leaves taken on one course concurrently lose a count.** That is a pre-existing defect, not something Undo introduces.
⇒ **The decrement must be `sql` arithmetic with a floor** (`leave_used = GREATEST(leave_used - 1, 0)`), never a read-modify-write. ⇒ **And the two existing increments should move to the same shape in the same task**, because we will be looking straight at them. 📌 The `GREATEST` floor is not belt-and-braces: it is what makes a double Undo *harmless* rather than *free leave*.

### 2.4 The coach's hour already has an owner
`reconcileBookingHolds(tx, bookingId, teacherId, status, override)` is what the leave door calls when it sets `SICK_LEAVE` (`:3323`). **Undo re-holds through the same function**, not through a hand-written insert. If it cannot re-hold, that is §4's refusal — **and it must be the same check the booking flow already uses**, because "is this hour free?" must have one answer in this system.

---
## §3 The model — one action, two entry points, ONE guard
**`undoBooking(bookingId, reason?)`**, an admin action with a single implementation:
| the row is | Undo means | writes |
|---|---|---|
| `SICK_LEAVE` | the leave was a mistake | status → CONFIRMED · `leave_used − 1` **only if it took quota** (§2.2) · re-hold the hour · reverse the make-up/extension (§5) |
| `ATTENDED` **from a check-in** | the check-in was false | status → CONFIRMED · **credit returned** · re-hold the hour · 🚫 **no message to anyone** (owner ruling 2) |
| anything else | — | **refuse**, with a sentence saying what the row is |

🔑 **The guard is the row's own status, read inside the transaction, and the update is conditional on it.** Not a flag, not a timestamp, not a check before the transaction. An Undo of a row that is no longer `SICK_LEAVE` must affect **zero rows and change no counter** — that is what makes a double-click, a retry and two admins at once all safe. 📌 This is the TASK-480 shape: *the state itself is the permission*.

**Recorded on the row: who undid it, when, and the reason** — and 🔑 **the original check-in's provenance is NOT overwritten** (owner ruling 2: *"keep the provenance of the original check-in on the record"*). That is precisely why **the source-column split (round item 5) lands BEFORE this**: today one column holds a channel *and* a person, and Undo needs to write an actor without destroying a channel. Building Undo first would mean writing the actor into the wrong column and migrating it a week later.

---
## §4 The refusals, and what they say
1. **The coach's hour has been re-booked** ⇒ refuse. The replacement is a real class with a real family in it, and taking their hour back silently is a worse outcome than an admin having to look at it. **The message must name the obstacle** — the hour and who has it — because "cannot undo" tells an admin nothing they can act on.
2. **The row is not undoable** (already CONFIRMED, CANCELLED, settled at day-end, a camp day) ⇒ refuse, saying what the row is.
3. 🔴 **An Undo must never cross the day-end.** The day-end job settles started CONFIRMED classes and **moves units and money** (TASK-474's rule). Undoing a session the day-end has already settled would re-open a consumed unit hours after the shop closed its day. **Whether that is a hard refusal or a warned override is §6 Q1 — it is the owner's, not mine.**
4. 🚫 **No partial success.** All of it in one transaction, or none of it. A status flipped without its counter refunded is the exact state we cannot detect later.

---
## §5 The make-up / extension a leave created — the part I am least sure of, stated as such
A leave can produce a **make-up (`EXTENDED`)** row and can move the course's **expiry**. Undo must reverse what the leave created — but a make-up that has **already been taught** cannot be un-taught.
**My reading, to be confirmed against the code by the engineer before any of it is built:**
- an `EXTENDED` row that is still **PENDING/CONFIRMED and in the future** ⇒ removed with the undo;
- one that is **ATTENDED** ⇒ **refuse the whole Undo** and say why: the family has had the class, and the honest position is that this is no longer a mistake to erase but a history to correct by hand;
- the **expiry** returns to what it was, and 🔑 **if that cannot be computed back exactly, say so and stop** — a silently wrong expiry date ends a course early for a real child.
⚠️ **Engineer: if the code says otherwise, the code wins and I want it in the report, not worked around.**

---
## §6 What I need before cutting the task
**Q1 — for the OWNER (via Porter):** may an admin undo a session **the day-end has already settled** — yesterday's, or this morning's after the cut? **Hard refusal, or a warning they can override?** It is the difference between "this tool cannot fix yesterday's mistake" and "this tool can move money in a closed day". I recommend a **hard refusal** for this round: it is the safe half, it can be widened later, and widening is cheap while unwinding a settled day is not.
**Q2 — for ME, from the code:** whether the leave's make-up/extension is reversible as §5 describes. This is an engineer's read, not a decision, and it comes back as a **contract** before code — TASK-486's contract proved its worth twice.

**RBAC:** a **new action key** (60th), not a reuse. Undo is a distinct power from editing a booking — it moves money — and the owner should be able to grant it separately. 📌 Do not fold it into `bookings.edit`: a key that means two things cannot be withheld for one of them.

---
## §7 Sizes
| piece | BE | FE |
|---|---|---|
| `undoBooking` + the status guard + the RBAC key | **M** | — |
| the `leave_used` decrement, `GREATEST` floor, **and moving the two existing increments off read-modify-write** | S | — |
| re-holding the coach-hour + the re-booked refusal | S | — |
| the make-up/extension reversal (§5) | **M**, pending Q2 | — |
| the check-in case (credit returned, silent) | S | — |
| the roster action + the plan editor action + the refusal messages | — | **M** |
**Total: BE M–L · FE M.** No migration of its own (it rides item 5's).

📌 **One last thing for whoever builds this.** Every screen here is read by someone in a hurry who has just realised they made a mistake. TASK-483 is the cautionary tale of this round: **the backend refused a camp scan perfectly and the page still told a nanny "Already checked in ✅"**, so she would have walked the child in. **A correct refusal rendered as a success is not a smaller bug than a wrong refusal** — and Undo is nothing but refusals and confirmations.
