# TASK-492 — the admin **Undo**: a mistaken leave, and a false check-in — BE, M–L. **📐 Contract for §5 before code.**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · Round item 1. **Read `specs/SPEC-094-undo-leave-and-false-checkin.md` first — this task is its build order, not a replacement.** FE follows.
💰 **This is the money work of the round.** Owner rulings: **Undo a false check-in is silent** (REQ-108 ruling 2) and 🔨 **Q1 = HARD REFUSAL** (owner, 09-26, via Porter): **an admin may NOT undo a leave or a check-in on a session the day-end has already settled.**

## §1 The action
**`undoBooking(bookingId, reason?)`** — one implementation, two entry points (the session roster and the plan editor).
| the row is | Undo means | writes |
|---|---|---|
| `SICK_LEAVE` | the leave was a mistake | → CONFIRMED · `leave_used − 1` **only if it took quota** · re-hold the coach-hour · reverse the make-up/extension (§4) |
| `ATTENDED` from a check-in | the check-in was false | → CONFIRMED · **credit returned** · re-hold the hour · 🚫 **no message to anyone** |
| anything else | — | **refuse**, saying what the row is |

## §2 🔑 The three things that make this safe, from SPEC-094 §2 — build these first
1. **The guard is the row's own status, read INSIDE the transaction, with the update conditional on it.** Not a flag, not a pre-check. An Undo of a row that is no longer `SICK_LEAVE` must touch **zero rows and no counter**. That is what makes a double-click, a retry and two admins at once all safe. 📌 TASK-480's shape: **the state itself is the permission.**
2. 🔴 **A leave declared at course creation is FREE** (owner decision B; those rows carry `plannedAtCreation`, see `scheduler.service.ts:2264`). **Undoing one must NOT refund** — a blanket decrement **prints leave that was never spent**, on exactly the rows an admin tidies up first. **Pin both directions by value.**
3. 🔴 **`leave_used` must move by `sql` arithmetic with a floor** — `GREATEST(leave_used - 1, 0)` — never a read-modify-write. **And move the two existing increments** (`:3319`, `:3749`) to `sql` too: they read the value in JS and write it back, so **two leaves taken at the same moment lose a count** today. That is a live pre-existing defect and we will be looking straight at it. 📌 The floor is not belt-and-braces: **it is what makes a double Undo harmless rather than free leave.**

## §3 The refusals
1. 🔨 **The day-end has settled the session ⇒ HARD REFUSAL** (owner, Q1). No override, no flag. Say plainly that the day is closed. 📌 Widening this later is cheap; unwinding a settled day is not — that is the owner's reasoning and mine.
2. **The coach's hour has been re-booked ⇒ refuse, and NAME the obstacle** (the hour, and who holds it). "Cannot undo" tells an admin nothing they can act on. Re-hold through **`reconcileBookingHolds`** — the same function the leave door uses — never a hand-written insert, because *"is this hour free?"* must have one answer in this system.
3. **The row is not undoable** ⇒ refuse, saying what it is.
4. 🚫 **No partial success. One transaction or nothing.** A status flipped without its counter refunded is precisely the state we cannot detect later.

## §4 📐 Contract first — the make-up / extension (SPEC-094 §5)
**Send me a contract before any code**, as you did for TASK-486 and TASK-489. **My reading, to be checked against the code and corrected if wrong:**
- an `EXTENDED` row still **PENDING/CONFIRMED and in the future** ⇒ removed with the undo;
- one already **ATTENDED** ⇒ **refuse the whole Undo**, because the family has had the class: this is no longer a mistake to erase but a history to correct by hand;
- the **expiry** returns to what it was, and 🔑 **if it cannot be computed back exactly, say so and STOP** — a silently wrong expiry ends a course early for a real child.
⚠️ **If the code says otherwise, the code wins and I want it in the contract, not worked around.** Also tell me: **does anything else read `leave_used` as a count it maintains itself?**

## §5 Recording it
**Who undid it, when, and the reason** — and 🔑 **the original check-in's provenance is NOT overwritten** (owner ruling 2: keep it on the record). TASK-488 gave you the two columns for exactly this: **the channel stays, the actor is yours to write.**

## §6 RBAC
**A new action key (the 60th), not a reuse.** Undo moves money and the owner must be able to grant it separately from editing a booking. 🚫 Never folded into `bookings.edit`: **a key that means two things cannot be withheld for one of them.**

## Definition of Done
- [ ] §4's contract answered and ruled **before code** · the status guard inside the transaction, conditional update, **zero rows on a repeat** (pinned) · `plannedAtCreation` ⇒ **no refund**, pinned both ways · `GREATEST(…,0)` `sql` decrement **and both existing increments moved off read-modify-write** · the four refusals, each naming what it refused · the hour re-held through `reconcileBookingHolds` · the check-in case **silent**, credit returned · **actor recorded, channel preserved** · the new RBAC key · one transaction · suite **count** · tsc 0 · 58 = 58 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include **a double Undo that refunds twice**, an Undo of a `plannedAtCreation` leave that refunds, an Undo across the day-end, and a message sent on a check-in Undo · report here + `inbox/SA.md` + log.

---

# 📐 CONTRACT — @Jason → @Sober (2026-09-26) — §4 answered from the code, plus five places where the code says something the task assumes otherwise. **No code written.**

Line numbers are `scheduler.service.ts` unless named. "Door 1" is the plan editor's `mark-absence` (`:3287`). "Door 2" is the per-session `sick-leave` action (`:3725`).

## 🔴 Read first: five places where the code disagrees with the task
1. **"Only if it took quota" can't be read from `plannedAtCreation`.** Four kinds of `SICK_LEAVE` row took **no** quota, and only one of them is marked (§B).
2. **`reconcileBookingHolds` does not hold the coach's hour.** It reconciles the **freelance budget**. The hour is the partial unique index `bookings_teacher_slot_uq`, and a leave frees it (§F).
3. **Re-running the reconcile after an Undo would cancel the WRONG make-up.** It trims "newest-dated LIVE EXTENDED first", not the undone leave's (§A.2).
4. **A check-in Undo to CONFIRMED on a class that has started is re-attended by tonight's day-end.** The unit is consumed again and the parent gets the deduction message: not silent, and not undone (§D).
5. **Writing the undoer into `checkin_actor` would repeat TASK-488's mistake.** That column means "who checked in" (§E).

## §A 📐 The make-up and the expiry (your §4)
**A.1 The two make-up writers, and both link the same way.** Door 2 inserts the make-up itself (`:3781`, `extendedFromId: id`). Door 1 and course creation append through `reconcileCoursePlan` (`:2930`, `extendedFromId: a.extendedFromId`, the unmatched leave, `course-plan.ts:236`). ⇒ **A leave's make-up is exactly the row with `extendedFromId = <the leave>`.**
- ✏️ **Correction to your reading:** make-ups are born **`EXTENDED`**, not PENDING/CONFIRMED. The rule below is written on `EXTENDED`.

**A.2 Why the Undo must cancel THAT row itself.** When a course is over-planned, `planCourseMoves` cancels **"the trailing appended session(s) — newest-dated LIVE EXTENDED first"** (`course-plan.ts:249`).
- After an Undo that only flipped the status, the next reconcile would cancel the **newest** make-up, which can belong to a **different** leave. That leave is then left unmatched and gets another make-up later.
- **On an imported course it cancels nothing at all** (`withholdImportCancels`, `priorSessions > 0`), and the course stays over-planned.
- ⇒ **Build:** set the linked make-up to **`CANCELLED`**, as the reconcile does (never deleted, so history keeps it), then run `reconcileCoursePlan`, **pinned to be a no-op** (0 appended, 0 cancelled). Its freelance hold is released through `reconcileBookingHolds`.
  - ⚠️ A make-up on a rented course carries an inherited rental row (`inheritCourseRental`, TASK-376). **The reconcile's own cancel leaves that row alone today, and I'd do the same.** Named for you in case the rental should be reversed.

**A.3 The rule, by the make-up's state:**
| the linked make-up is | Undo |
|---|---|
| none (a voucher or single leave · an over-quota leave · a TASK-258 undone attendance) | proceeds, nothing to remove |
| `EXTENDED`, date **not settled** (§C) | **cancelled with the Undo** |
| `EXTENDED`, date **settled** (never marked, since the day-end only marks CONFIRMED) | **refuse**: it may have been taught, and the day is closed |
| `ATTENDED` / `NO_SHOW` | **refuse the whole Undo** (your reading, confirmed): the family has had the class |
| `SICK_LEAVE` (the make-up itself declared absent; TASK-361's chain has a make-up of its own) | **refuse**: a chain, to be corrected by hand |
| `CANCELLED` already | proceeds; the reconcile then decides (pinned) |
| more than one live linked row (shouldn't exist) | **refuse**, naming them |

**A.4 The expiry: exactly when it can be computed back, otherwise STOP.**
- **What the code does:** the expiry **only ever grows**. The reconcile writes the stretch **once per run** through `recordExpiryChange` (`course_expiry_changes`: `from_date`, `to_date`, actor `null` = the system). Creation's `bornCeiling` is written **without** an audit row. **Door 2 never moves the expiry at all** (see A.5).
- **The rule:**
  1. The make-up's date **≠** the current expiry ⇒ **it doesn't hold the expiry**, so it is **unchanged**. That is exact: whatever set the current date, it wasn't this make-up alone.
  2. The date **=** the current expiry, **and another live row of the course sits on or after it** ⇒ still needed ⇒ **unchanged**.
  3. The date **=** the current expiry and nothing else needs it ⇒ **restore only if** the course's **latest** `course_expiry_changes` row has `to_date` = the current expiry, **actor `null`** (a system stretch), and a `from_date` ≥ every remaining row's date. It is restored to `from_date` **through `recordExpiryChange` with the undoer as actor**.
  4. **Otherwise STOP:** refuse, **naming the expiry and why**: set by an admin (actor present), set at creation (no row), or the record doesn't match.
- 🔑 Pinned both ways by value: a stretch that is reversed exactly, and one that is refused (admin-set).

**A.5 Finding, not fixing: the two leave doors disagree about the expiry.** Door 1 stretches it (reconcile, TASK-308). **Door 2 inserts its make-up at `findFreeExtensionDate` and never touches the expiry**, so a door-2 make-up can sit **after** the course's expiry. Two doors, two answers. Its own ticket, if you agree.

## §B 📐 `leave_used`: who maintains it, and what "took quota" means
- **Maintained by exactly two writers:** Door 1 `:3320` and Door 2 `:3750`, **both read-modify-write** (`course.leaveUsed + 1`). **Nothing else writes it, and nothing derives it from rows.**
- **Readers:** `leave.ts:94–95` (remaining / locked), the course DTO `:776`, the course history summary (`:2531` → `course-history.ts:174`, read, not stored), and the expiry decision's leave room `:4750`. **All derive; a correct decrement is all they need.**
- 🔴 **Which `SICK_LEAVE` rows took NO quota.** `plannedAtCreation` identifies only the first of these:
  - (a) `plannedAtCreation`: free (owner decision B). **Marked.**
  - (b) a **Door 2 leave over quota**: the status is set to `SICK_LEAVE` **before** `canTakeLeave` is asked. Then there is no increment and no make-up, and the route answers `locked: true`. **Not marked.**
  - (c) a **TASK-258 undone attendance** (`ATTENDED → SICK_LEAVE`): no quota by the owner's rule, entitlement already returned. **Not marked.**
  - (d) a **voucher or single-session** leave: no course, so no quota. (The row shows it: no `courseId`.)
- ⇒ A decrement keyed on `!plannedAtCreation` alone **prints free leave on (b) and (c)**, the exact failure §2.2 was about, in a new place.
- **Proposal: `bookings.leave_charged boolean` (nullable), written by the two doors at the moment they charge** (true) or don't (false).
  - The Undo refunds **iff `leave_charged = true`**, and clears it **in the same conditional update**.
  - **Legacy rows (null, taken before the migration)** are inferred: `plannedAtCreation` ⇒ free; a linked make-up exists ⇒ charged (both doors charge exactly when they create one); **anything else ⇒ REFUSE**, "cannot tell whether this leave used quota; correct by hand". Never a guess.
  - *Without a migration:* inference only, with the same refusal. It is safe, but it refuses some legitimate Undos forever. **I recommend the column.**
- ✅ **The two increments move to `sql``${leave_used} + 1``** and **the Undo's decrement to `GREATEST(leave_used - 1, 0)`**, as you asked.
- ⚠️ **The same race, on the counter the check-in Undo refunds:**
  - `attend` does `usedSessions: current.course.usedSessions + 1` (`:3540`, read-modify-write, and its value feeds the deduction message);
  - TASK-258 does `Math.max(0, usedSessions - 1)`;
  - so does the voucher's `usedHours`.
  - The day-end already does it right (`sql … + 1` with `.returning()`, `jobs.service.ts:95`). **I'd move `attend` and TASK-258 onto that shape in this task**, because the Undo's own decrement races `attend`'s increment. Yours to rule: in this task, or its own ticket.

## §C "Settled", defined from data (your hard refusal)
**Settled ⇔ the session's date is before today (Bangkok), OR a `job_runs` row `{ job: "end-of-day", run_date: <date>, status: "success" }` exists.**
- **Why the date part too:** the day-end runs for **today** (~18:05, `scripts/end-of-day.ts`) and never revisits a past date. A past day is closed **whether or not** its job row exists (the box was down, or the job was never registered).
- ⇒ **Undo is possible only for future sessions and for today's before the cut.** For a leave that is the normal case (a mistaken leave is nearly always for a coming class). **For a check-in it means the same day, before ~18:05.**
- A `job_runs` row is written after every run, **not unique**, and a failed run writes nothing, so "a success row exists" is the test.

## §D 🔴 The check-in Undo meets the day-end
**The day-end auto-attends every started CONFIRMED class** (`jobs.service.ts:80`, REQ-070 / TASK-396). So an Undo that returns a false check-in on a **started** class to CONFIRMED is **re-attended at ~18:05**: the unit is consumed again, and **`notifyCourseDeduction` messages the parent**.
- **Before the class starts** (a wrong tap in the early window): CONFIRMED is exactly right, and nothing re-attends it.
- **Options for a started class (yours or the owner's):**
  - **(i)** CONFIRMED as the spec says, **and** the response carries `willAutoAttendAtDayEnd: true`, so the page tells the admin to mark the real outcome (leave or no-show) before the cut. **My recommendation.** Nothing is invented; it says what will happen.
  - **(ii)** refuse the Undo of a check-in on a started class. This is safer, but an admin then can't fix a wrong-child tap at all.
  - 🚫 Not NO_SHOW: that consumes a unit (TASK-474), which is not "credit returned".
- **Two silent consequences to put in the owner sentence, not to code around:**
  - the **deduction message sent by the false check-in stays sent** (it can't be unsent, and the Undo is silent);
  - the **ON_TIME_CHECKIN CRM points are not reversed** (nothing reverses points anywhere, and TASK-258 doesn't either).
- ❓ **Which ATTENDED rows are "from a check-in"?** I read it as channel ∈ {`checkin-qr`, `line`, `shopfront-qr`, `staff`}. `end-of-day` and null (pre-0056) rows are settled anyway.
  - **`staff`** (an admin's own attend) is the question. It already has **TASK-258's "undo attendance"** (→ `SICK_LEAVE`, no quota, entitlement returned), so two tools would reverse one mark with different results.
  - My recommendation: the new Undo covers `staff` too (it answers "that was a mistake"), and TASK-258 stays for "the child was absent". Yours.

## §E The record: an append-only table, not the check-in columns
- **`checkin_actor` means "who checked in"** (TASK-488). Writing the undoer there makes a QR check-in read as "checked in via shop QR **by admin-dong**", which is the one-column-two-facts defect we just split.
- **Leaving `checkin_channel` on a CONFIRMED row** would render TASK-482's "Shop QR" chip on a class nobody attended. And the next real check-in **overwrites** it, so it would not stay "on the record" anyway.
- **Proposal: one append-only table `booking_undos`**: `booking_id` · `kind` (`leave` | `checkin`) · `undone_by` · `undone_at` · `reason` · `prior_status` · **`prior_checkin_channel` · `prior_checkin_actor`** · `leave_refunded` · `makeup_cancelled_id` · `expiry_from` · `expiry_to`.
  - The check-in Undo copies the provenance there and **clears** the row's live check-in columns. **The original provenance is kept durably, in the one place nothing overwrites.**
  - It also answers "why did this course's leave count go down?" (§2.1).
- ⇒ **Migration 0058** = `booking_undos` + `bookings.leave_charged`. The witness is the last created object, and the census moves 58 → 59. **This makes the task bigger than "no migration of its own" (SPEC-094 §7)**, and I'd rather you know that before the build than after.

## §F The other refusals, as the code allows them
- **The slot:** the one answer to "is this hour free?" is the **index** `bookings_teacher_slot_uq`: status not in (CANCELLED, PENDING_RESCHEDULE, **SICK_LEAVE**, PAUSED), `group_id` null, `slot_yielded_at` null. A leave frees the slot (UC-004), so someone may hold it now.
  - **Build:** inside the transaction, find the live occupant **with the index's own predicate**, then refuse, **naming the hour and the booking holding it** (its student and coach). The `23505` stays as the backstop.
  - **Then** `reconcileBookingHolds(tx, id, teacher, "CONFIRMED", false)` re-draws the freelance hour. `INSUFFICIENT_BUDGET` ⇒ refuse, naming it.
- **An ended course** ⇒ refuse (TASK-185 refuses every reviving transition on one).
- **A camp-derived row** ⇒ refuse (`assertNotCampRow`; camp has its own day undo). **A group seat:** the slot belongs to the group row, so there is no slot check for a seat. Named, not decided.
- **Anything else** (CONFIRMED, CANCELLED, PAUSED, a settled date) ⇒ refuse, saying what the row is.
- **The guard:** `UPDATE … SET status='CONFIRMED' … WHERE id = $1 AND status = $expected`, `.returning()`. **Zero rows ⇒ the Undo did nothing** (no counter, no make-up, no expiry, no record) and answers the row's current state. Every other write in the transaction happens only after that row came back.

## §G 📌 A leave Undo and the coach (not covered by any ruling yet)
The leave sent the coach and admin a **"class cancelled" notice** (TASK-305/306, both doors). Owner ruling 2 made the **check-in** Undo silent; **nothing rules on the leave Undo.** If it is silent too, **the coach believes the class is off and doesn't come in**, which is the TASK-306 hole in reverse.
- **My recommendation:** a leave Undo sends the coach and admin a "class is back on" notice, through the same builder, and the make-up's cancellation is covered by the reconcile's existing notices, if any.
- This is the owner's call.

## RBAC
A new action key, `bookings.undo`. It is never folded into `bookings.edit`.

## ❓ What I need ruled before code
1. **`leave_charged` + `booking_undos` (migration 0058)**, or inference-only with no migration (§B, §E).
2. **The check-in Undo on a started class:** (i) CONFIRMED + a warning flag, or (ii) refuse (§D). And **does `staff` count** as a check-in?
3. **The `used*` read-modify-write sites:** in this task, or their own ticket (§B).
4. **The leave Undo's notice to the coach** (§G, the owner's).
5. **Door 2 not stretching the expiry:** its own ticket? (A.5)

⛔ Stopped. No code until you rule.

---

# 🔨 RULING — @Sober (2026-09-26) on the contract's five. **The contract earned its keep five times over; two of my instructions were simply wrong.**

📌 **Before the answers: this is the clearest case yet for contracts on money work.** Five of my statements met the code and five lost. Had this been cut as a task, **§D alone would have shipped a feature that undoes a check-in and then silently re-does it at 18:05, with the deduction message the owner explicitly forbade.** The Undo would have *looked* correct in every test anyone would have thought to write, and the parent would have got a message about a class their child did not attend — the exact harm REQ-108 §1 was written about.

## ❓1 — 🔨 **Take the migration. `leave_charged` AND `booking_undos`. Migration 0058.**
**Inference is guessing at a fact we never recorded, and this is money.** You found that *"took quota"* is **not** `!plannedAtCreation`: an over-quota Door-2 leave and a TASK-258 undone attendance are both `SICK_LEAVE` with no quota taken. ⇒ **the boolean I told you to use is wrong, and no amount of care makes it right.** Record the fact.
🔑 **And this is the same lesson as TASK-488, which is why I am not economising here:** we have just spent a task splitting a column that held two facts, **because inferring one from the other cost us two near-misses in an afternoon.** Inferring "was this leave charged?" from "was it planned at creation?" is the identical mistake with money attached.
✅ **Legacy rows: refuse when it cannot be inferred — exactly right.** A refusal an admin can escalate is cheap; a wrong refund is invisible. 
✅ **`booking_undos`, append-only, keeping the prior provenance: take it.** My §5 told you to write the undoer into `checkin_actor`, which **repeats TASK-488's mistake in the same week we fixed it** — you caught me, and the append-only table is the right shape: an undo is an **event**, not a property of the row.
⚠️ SPEC-094 §7 said "no migration of its own". **That was wrong; the sizing changes and I will say so upward.** A bigger migration is not a reason to build on a guess.

## ❓2 — 🔨 **Neither (i) as written nor (ii). The Undo must leave a state the day-end will NOT silently re-attend.**
🔴 **(i) as you describe it only warns the PAGE — so the money still moves and the message still goes out at 18:05.** That is the defect, not a mitigation. A flag the day-end does not read is decoration.
⇒ **Build it so the day-end respects the undo:** an undone session is **not auto-attended** by that night's settle, and the admin decides what it becomes. **If the day-end cannot be made to honour that, then (ii) — refuse — and say so**, because a refusal is honest and a silent re-attend is not.
**Why not simply refuse now:** a false check-in is found *minutes* after it happens, which is precisely when the class has started. **A feature that cannot fix the case it exists for is not the safe half — it is no feature.** Q1's hard refusal is about a **settled** day; this is a day still open.
**`staff` attends: OUT of this task.** TASK-258 already undoes them, and 🔴 **it undoes them to `SICK_LEAVE`, which is a falsification** — a child who was marked present by mistake was not on sick leave, and the family's record will say they were. **That is a real finding, and it gets its own ticket rather than being quietly absorbed here.** Do not build a second door for `staff`.

## ❓3 — ✅ **Its own ticket**, except what Undo itself writes.
Undo's own writes use `sql` arithmetic with the floor. The other `used*` read-modify-write sites are **a pre-existing defect class, and a separate ticket** — this task is already larger than the spec assumed, and bundling an unrelated race into the money work makes both harder to review. 📌 Name them in the ticket while they are fresh in your head.

## ❓4 — **The coach notice is the owner's, and I am asking. Build without it; it is additive.**
You are right that a silent leave-Undo leaves **the coach still believing the class is off** — and unlike the family, the coach has to *be somewhere* as a result. **The owner's "silent" ruling was about the family and a false check-in**; a coach whose class is back on is a different person with a different need. Recommendation going up: **notify the coach on a leave Undo, never the family.** Build the silent version; the notice is one call when he answers.

## ❓5 — ✅ **Its own ticket.** Door 2 not stretching the expiry while Door 1 does is **one rule with two readers**, the shape of half this round's findings. Out of scope here, and worth a ticket while you can still see it.

## Also accepted from the contract, without change
✅ **§2 — `reconcileBookingHolds` is the freelance BUDGET, not the hour.** My §3 named the wrong function; the hour is the partial unique index, and checking the occupant **through the index's own predicate** is the only way that answer stays the same as the booking flow's. **Naming who holds the hour** stands.
✅ **§3 — cancel the row whose `extendedFromId` IS this leave, then run the reconcile and pin it as a no-op.** That re-running the reconcile alone would **cancel the WRONG make-up** (newest-first, and nothing at all on an imported course) is the kind of thing no test I specified would have found. And make-ups are born `EXTENDED`, not PENDING/CONFIRMED — my §4 was wrong about that too.
✅ **The expiry: restore only when the latest change is the system stretch to this make-up's date, otherwise STOP and name why.** Exactly the ruling I asked for in SPEC-094 §5, and you reached it from the code rather than from my sentence.
✅ **"Settled" = date < today OR a successful `end-of-day` `job_runs` row** — a definition tied to evidence that the job ran, not to a clock. Take it.

## Definition of Done — amended
As before, plus: · **migration 0058** (`leave_charged`, `booking_undos`), witness = a created object, **the old columns untouched** · `leave_charged` written by **both** leave doors · legacy rows inferred where safe and **refused otherwise**, pinned · the undone session **not auto-attended by the day-end** (pinned through the real day-end path) **or** a refusal, with the reason stated · `staff` attends untouched (TASK-258 named) · the coach notice absent for now · 🔑 mutations: **a double Undo refunding twice** · an over-quota leave refunded · a `plannedAtCreation` leave refunded · **the day-end re-attending an undone session** · a message sent on a check-in Undo · the wrong make-up cancelled · an expiry restored when it should have stopped.

---

# ✅ REPORT — @Jason → @Sober (2026-09-26) — the Undo, built as ruled. Migration 0058 (`leave_charged` + append-only `booking_undos`) · the day-end honours an undone check-in · the 60th key. 3240 pass / 0 fail · tsc 0 · 59 = 59 · 10/10 mutations bite

**Numbers:** `bun test` **3240 pass / 0 fail**, twice (+22: the new file) · `tsc` **0** · **59 = 59** (files and journal; 0058 is `when 1783000000054`, in series) · **60 action keys**.

## The contract, for @Fern
`POST /api/bookings/:id/undo` `{ reason?: string (≤ 500) }`. The key is **`action:calendar.undo`** (the 60th). A **linked account** is refused with `403 SCOPE_TEACHER` before the service runs.
- **200** `{ kind: "leave" | "checkin", leaveRefunded, makeupCancelledId, expiry: { from, to } | null, booking }`. The `booking` is the same DTO as everywhere else.
- **Refusals, all `409`, each naming what it refused:**
  - `UNDO_NOT_UNDOABLE` (its status) · `UNDO_STAFF_ATTEND` · `UNDO_DAY_SETTLED` (its date);
  - `COURSE_ENDED` / `COURSE_DROPPED`;
  - `UNDO_LEAVE_CHARGE_UNKNOWN`;
  - `UNDO_MAKEUP_TAUGHT` / `_CHAIN` / `_SETTLED` / `_AMBIGUOUS` / `_STATE` (the make-up's date);
  - `UNDO_EXPIRY_UNRECOVERABLE` (the expiry and why);
  - `UNDO_SLOT_TAKEN` (the hour and **who holds it**, through `displayNameOf`);
  - `UNDO_PLAN_WOULD_CHANGE`;
  - `UNDO_ALREADY_CHANGED`.
- ⚠️ TASK-483's lesson: **every one of these is a refusal, and none may render as a tick.**

## How each ruling landed
**❓1: migration 0058.** `bookings.leave_charged boolean` (nullable, **no backfill**) and `booking_undos` (append-only; kind CHECKed `leave` | `checkin`). The witness is **`booking_undos_booking_idx`, the last object created**. The old columns are untouched.
- **Both leave doors RECORD the charge:**
  - Door 1: `leaveCharged: !b.plannedAtCreation`.
  - Door 2: `const charges = …canTakeLeave… && !plannedAtCreation`. **The same expression decides the increment**, so the record and the counter cannot disagree, and an over-quota leave is recorded `false`.
  - TASK-258's undone attendance writes `false`, and so does the creation flip (TASK-361).
  - **Both increments are now `sql``${leave_used} + 1``** (no read-modify-write).
- **The refund decision** (`leaveChargeOf`, pure):
  - a recorded `true` ⇒ refund; a recorded `false` ⇒ none;
  - legacy: no course ⇒ free · `plannedAtCreation` ⇒ free · a linked make-up ⇒ charged · **else REFUSED**.
  - ⚠️ **Named:** a course born with absences inserts its planned rows through `insertBooking`, whose input doesn't carry `leaveCharged`, so **those rows stay NULL**. They are `plannedAtCreation`, and the inference answers them **"free" with certainty**. I didn't widen `insertBooking`'s input for it.

**❓2: the day-end honours the Undo.** Its `due` select gained one clause, **`notUndoneCheckin()`**: `not exists (select 1 from booking_undos where booking_id = bookings.id and kind = 'checkin')`. **A session whose check-in an admin undid is not auto-attended**, so the unit isn't consumed again and no deduction message goes out. It stays CONFIRMED until someone marks it; a real check-in later makes it ATTENDED as usual.
- ⚠️ **How it is pinned, honestly:** the rendered SQL of the fragment is pinned **byte for byte**, and the day-end's `due` select is pinned to carry it. **I did not execute the whole day-end job**: it is one transaction with no seam (the existing day-end tests are source-level for that reason). The clause can only **narrow** the CONFIRMED set; the moved "byte-frozen" pin says so.
- **`staff` attends are OUT:** refused with `UNDO_STAFF_ATTEND`, and TASK-258 is untouched.

**❓3: the Undo's own writes use `sql`.** The refund, `usedSessions` and `usedHours` are all **`GREATEST(… - 1, 0)`**. 📌 **For the separate ticket, the remaining read-modify-write sites** (`scheduler.service.ts`):
- `attend`'s `const used = current.course.usedSessions + 1` (**:3542**; its value also feeds the deduction message, so it needs `.returning()` as the day-end does) and `current.voucher.usedHours + 1` (**:3562**);
- TASK-258's `Math.max(0, current.course.usedSessions - 1)` (**:3692**) and `usedHours` (**:3698**);
- ⚠️ and TASK-258's **`reverseBookingSale(id)` (:3714), called INSIDE its transaction while it writes through `db`**. If that transaction rolls back, the revenue reversal stays. **The Undo calls it only after its commit.**

**❓4: silent.** No message to anyone. **Pinned by value:** the only row the Undo inserts is its own `booking_undos` record (an outbox message would be another insert), and by source there is no `notify`/`enqueueLine`/`sendLeaveNotice`. The coach notice is a single call once the owner rules.

**❓5:** Door 2 not stretching the expiry is untouched (its own ticket).

## The guard, and the rest of the contract as accepted
- **Every check is a read; the FIRST write is `UPDATE bookings SET status='CONFIRMED' … WHERE id = $1 AND status = <what was read>`.** Zero rows ⇒ `UNDO_ALREADY_CHANGED`, and nothing else is written. Pinned by source (nothing writes before it) **and by value**: a second Undo that read the row before the first committed touches **zero rows**, refunds **nothing**, and adds **no record**.
- **The make-up:** the row whose `extendedFromId` IS this leave is set to CANCELLED (conditionally, and its freelance hold is released). **Pinned by value: with a newer make-up of ANOTHER leave in the course, only this leave's is cancelled.** The reconcile then runs and **must be a no-op**; if it would append or cancel anything, the Undo is refused (`UNDO_PLAN_WOULD_CHANGE`).
- **The expiry** (`expiryDecision`, pure):
  - keep when the make-up doesn't hold it, or another row still needs it;
  - restore **only** the system's stretch (actor null, `to_date` = this make-up's date, every remaining row under its `from`), **through `recordExpiryChange` with the undoer as actor**;
  - otherwise **STOP**, naming why: set at creation / set by <actor> / not this make-up's change / a row after <from>.
- **The hour:** the occupant is found **with the unique index's own list, `SLOT_INACTIVE_STATUSES`** (no seat, not yielded). A cancelled or on-leave row in the slot is free (pinned). Then `reconcileBookingHolds(…, "CONFIRMED")` re-draws the freelance hour.
- **Settled** = the date is before today, OR a **successful** `end-of-day` `job_runs` row exists (a *failed* run doesn't settle; pinned).
- **Ended OR paused course** ⇒ refused through **the ONE guard `assertCourseWritable`**, not a copy (see below). The route is classified `guarded` in TASK-185's table.
- **A check-in Undo:** CONFIRMED · the unit back (course or voucher, floored) · **the row's check-in columns cleared and COPIED into the record** (`prior_checkin_channel` / `_actor`, owner ruling 2) · `reverseBookingSale` after the commit.

## Two things the suite caught in MY code while building
1. **The slot-holder message hand-copied `otherTitle ?? nickname ?? name`.** `coach-rate-req095-13-3`'s "no hand-copied name chain in src" pin caught it. It is now **`displayNameOf(holder)`** (the ONE name rule), with the co-student loaded.
2. **I had written `isCourseEnded` myself.** TASK-185's route table required the new route to be classified, which is how I found **`assertCourseWritable`** checks ended **and paused**. The Undo now calls that guard, so a paused course is refused too (pinned: `COURSE_DROPPED`).

## Moved pins (each with its reason written in)
- `bulk-confirm-extended-req094` › the day-end's "byte-frozen" select: **`+ notUndoneCheckin()`**, still CONFIRMED-only, narrowing only.
- `advance-leave-on-extended-req089` › the TASK-361 flip: `+ leaveCharged: false`.
- `rbac-stage1` › `actorOf(c)` 20 → 21 (the Undo route) · `linked-account-told` › `max(500)` 7 → 8 (the Undo's reason) · `course-ended-writes` › the new route classified `guarded`.
- **The census:** 58 → 59 migration files and journal tags, and 59 → 60 action keys, moved **only at the lines the run named**. One misattributed SKIP (`line-id-token:78`) was resolved by hand: the real line was `oa-write-guard-req105:139`.

## Break-and-watch: `mut492.mjs`, 10 mutations, **10 bite**
`BASELINE=74` (the Undo file + the three pins that moved), read off a real run. `finally` + sha-256 restore, byte-identical every time. **CHECKSUM `abe98a1f…` identical before and after.**
- **A — a DOUBLE Undo refunds twice** (the guard no longer conditional on status): **bites, 2 fail**.
- **B — an OVER-QUOTA leave refunded** (a recorded false ignored): **bites, 2 fail**.
- **C — a `plannedAtCreation` leave refunded**: **bites, 2 fail**.
- **D — the day-end RE-ATTENDS an undone session** (the exclusion dropped): **bites, 2 fail** (by source + the moved pin).
- **E — a MESSAGE sent on a check-in Undo** (an extra insert): **bites, 1 fail**.
- **F — the WRONG make-up cancelled** (newest EXTENDED, as the reconcile trims): **bites, 2 fail**.
- **G — an expiry restored when it should have STOPPED** (an admin-set expiry treated as the system's): **bites, 2 fail**.
- **H — the refund without its floor**: **bites, 8 fail**. ⚠️ Honestly: partly because the harness refuses any `SET` SQL it doesn't recognise, plus the source count of `GREATEST`.
- **I — a SETTLED day let through**: **bites, 1 fail**.
- **J — Door 2 recording the charge without the quota test**: **bites, 1 fail** (by source).

## Named for the owner sentence (unchanged from the contract)
- The false check-in's deduction message stays sent.
- The ON_TIME points are not reversed.
- An undone check-in stays CONFIRMED until someone marks it.
- A leave Undo is silent to the coach until the owner rules.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26) — 📌 one stray comment to fix, everything else stands
Re-run by me, twice: **3240 pass / 0 fail** both times · tsc 0 · **59 files = 59 tags** · `ACTION_KEYS` is **60** (the key really is new; I counted) · `notUndoneCheckin()` read by me **inside the day-end's own `where`** at `jobs.service.ts:83`.

## 🔑 The thing I most wanted to be true, and it is
**`notUndoneCheckin()` is in the day-end job's own query**, not in a flag the page reads. ⇒ **the money cannot move that evening**, which was the whole ruling. And he says plainly that **the job has no seam to execute in a test**, so it is pinned by **rendered SQL and by source** rather than end-to-end — **a named limit rather than a test that pretends.** That is the right trade and the right disclosure.

## What the suite caught in his own code — and why I am glad he reported it
- **a hand-copied name chain** ⇒ now `displayNameOf`;
- **his own `isCourseEnded`** ⇒ replaced by the ONE guard (`assertCourseWritable`), which also refuses a **paused** course — a case he would have missed with his own helper.
📌 **Two defects, in new code, in the same task where he found five in mine.** Reporting them rather than quietly fixing them is what makes the rest of the report worth trusting.

## ✅ Built as ruled, on every point that mattered
`leave_charged` recorded by **both** doors, Door 2 using **the same expression as its increment** so an over-quota leave records `false` — that is the fix for the exact case my `plannedAtCreation` boolean got wrong · both increments now `sql + 1`, ending the lost-count race · the conditional `WHERE id AND status` as the **first write**, a stale second Undo touching **zero rows** · refund only on a recorded `true` or an inference made with certainty, else refused · `GREATEST` on every counter · the `extendedFromId`-linked make-up only, **pinned against a newer foreign one** · the expiry restored only from the system stretch, else STOP with the reason · the hour's occupant through `SLOT_INACTIVE_STATUSES`, **named** · settled = date < today or a successful run · **`staff` refused** · the check-in Undo **silent**, the unit back, **the provenance copied into the record and cleared from the row** (the append-only shape doing its job).

## 📌 One thing to fix, and it is small but it is exactly our recurring bug
`permissions.ts:84` — the new key's line carries a **trailing comment left over from its neighbour**: *"// TASK-406 (REQ-097) — a LINKED account's own leave; the link is the identity, the key is the door // TASK-397"*. That describes `calendar.teacher-leave`, not `calendar.undo`, and **it says the opposite of what this key means** — a linked account is refused here by the route.
Your block comment above it is correct and complete. **Delete the trailing one.** 🔑 **A comment that is untrue about the line it sits on is the same defect class as a column whose name is untrue about its contents** — and we have spent two days on that. The next reader will believe the comment.

## For the tickets, recorded while fresh
`used*` read-modify-write at `attend` **:3542/:3562** and TASK-258 **:3692/:3698** — and ⚠️ **TASK-258 calls `reverseBookingSale` INSIDE its transaction while writing through `db`**, which is a second bug in that path (his check-in Undo reverses the sale **after** commit, which is the correct shape). Both go in the ticket.

---

# ✅ FIX — @Jason → @Sober (2026-09-26) — the stray comment: MOVED BACK, not deleted. 3240 pass / 0 fail (twice) · tsc 0
- **What it actually was:** not a leftover. It is `calendar.teacher-leave`'s OWN trailing comment. My build matched that line only up to its closing `),` and inserted the Undo key there, so **the neighbour's comment was pushed onto my new line.** It was untrue on the Undo key and had gone missing from the line it describes.
- **The fix:** the comment is back on `calendar.teacher-leave`, byte-identical to before. The Undo key's line ends at `),`. **`git diff` on `permissions.ts` is now a pure 3-line insertion** (the block comment + the key) and touches no existing line. Deleting it, as the message suggested, would have removed a true comment from teacher-leave.
- **Swept for the same mistake:** I checked every file this task edited through a line anchor (`route-access.ts`, `validation.ts`, `api.ts`, `jobs.service.ts`, `migration-witness.ts`, `scheduler.service.ts`, `schema.ts`) for a trailing comment moved or lost. **None.**
- 📌 **The lesson, for my own build scripts:** an anchor that ends mid-line (before a trailing comment) moves that comment onto whatever is inserted. I'll anchor on whole lines.
⛔ Your DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26) — the comment is home, and he did better than I asked
**3240 pass / 0 fail** twice · tsc 0 · 59 = 59 · `permissions.ts` read by me: the Undo key's line is clean and the block comment above it is the only one attached to it.

📌 **I said "delete the trailing comment". He established it was `calendar.teacher-leave`'s OWN comment, displaced onto his line by a mid-line anchor, and moved it BACK byte-identical.** Deleting it would have lost a true sentence about the neighbouring key to tidy up a false one about his — **the right fix restores the fact rather than removing it**, and the diff is now a pure three-line insertion, which is what it always should have been.
✅ **And he swept the other anchored files for displaced comments and found none.** That turns a one-line correction into a statement about the whole edit, which is the difference between fixing an instance and closing a class.

**TASK-492 is complete. REQ-108's Undo is built:** the guard is the row's own status, the day-end cannot re-attend an undone session, a leave is refunded only when it was charged, every counter is floored, the provenance is preserved in an append-only record, and the family is never told.
