# TASK-522 — a group SEAT's events must reach every coach of the GROUP — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size S.** 🔨 **Owner ruling: "a seat's coaches are the group's coaches."** ⏭️ **Rides the next deploy with TASK-516.**

## §0 The ruling and the case behind it
A group's extra coaches are recorded on the **group row**, not on each child's seat ⇒ **a message about one child's seat reaches that seat's coach only.**
**The example I put to the owner:** a Saturday group taught by **Ek and Nok** (Nok on the group). **Ploy's seat is cancelled. Ek is told; Nok is not — although Nok will be standing in that class.**
🔨 **He ruled: notify every coach of the group** on a seat's cancel, leave, undo **and the rest.**

## §1 Build
- **A seat's coach set = the group's coach set.** 🔑 **Through the shared predicate**, extended to resolve a seat's group — **not a fifth answer to "whose class is this?"** If `teachersOfBooking` cannot express it, **say why before writing anything else**; extending the one predicate is strongly preferred to a sibling of it.
- **"And the rest" is the owner's phrase, so bound it and say what you bounded:** every message the TASK-512 inventory classifies as a **class event** on a seat. 🔑 **Use the inventory — it is the list that cannot be wrong** — and **quote which producers this touches.**
- ⚠️ **A group has many seats.** If two children's seats are cancelled, each coach hears twice — **once per seat.** 📌 **That is probably correct** (two children, two facts) **but say it plainly and pin it**, as you did for the repeated dates in TASK-512. **If you think it should be one message, argue for it rather than building it.**
- 🚫 Wording unchanged; anything reading oddly at a group's second coach is **reported, not edited.** Unlinked coaches SKIPPED.
- **The non-group paths must not move** — pin that a private session's recipients are unchanged.

## Definition of Done
- [ ] A seat's events reach **every coach of the group**, through the extended shared predicate (or a stated reason it cannot be) · the affected producers **quoted from the TASK-512 inventory** · the two-seats case **stated and pinned** · private sessions pinned unchanged · wording unchanged (oddities reported) · unlinked SKIPPED · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation returning a seat to its own coach and one that changes a private session's recipients · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-27): the ONE predicate now knows what a seat is. `teachersOfBooking` resolves the CLASS first (a seat ⇒ its group row), then asks THE predicate, unchanged · every class-event producer inherits it · two seats ⇒ each coach twice, pinned as CORRECT · private sessions unchanged · 3376 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 60 = 60 · ⏭️ for the NEXT deploy

## §1 The change: the shared predicate EXTENDED, not a sibling of it (`lib/own-scope.ts`)
- `teachersOfBooking(exec, bookingId)` now **resolves the class first**: one read of the row's `group_id`. **A seat ⇒ its group row; every other row ⇒ itself** (and an unknown row falls back to itself, never to a different class).
- **Then THE predicate, unchanged** (`ownScopeWhere(teachers.id)`), on that row. So a seat's coaches are exactly the group's coaches: the group's `teacher_id` **and** its `booking_teachers`.
- **Why two steps rather than one clever SQL:** the resolution is then **provable by value** in a unit test (no database), and the predicate's own SQL stays byte-identical. **Cost: one indexed read by primary key per coach notice.**

## §2 "And the rest", BOUNDED by the TASK-512 inventory (quoted from `coach-notice-inventory-task512.test.ts` → `VIA_PREDICATE`)
**Every class-event coach notice asks `teachersOfBooking`, so extending it moves them all, with no producer touched:**
- `sendLeaveNotice` (a seat's leave) · `sendClassCancelledToCoaches` (a seat's cancel; also the Undo's cancelled make-up) · `undoBooking` (a seat's leave Undo: "on again") · `pauseBooking` / `resumeBooking` (a seat paused / resumed) · `notifyRentalAddedSameDay` (a seat's same-day rental) · `sendCourseDroppedToTeachers` (a group course's seats dropped / ended, per coach).
- `sendClassCancelledToOtherTeachers` (a teacher's own leave) is in the same list but **acts on non-seat rows** (`groupId IS NULL`), so it's unchanged.
- **The inventory's "may only shrink" list stays empty; no producer was added or reclassified.**

## §3 Two seats ⇒ each coach TWICE, pinned as CORRECT
- Ploy's and Mew's seats cancelled ⇒ **four rows: Ek and Nok about Ploy's seat, Ek and Nok about Mew's.** Each row points at **its own seat**, so each message names **its** child.
- Two children, two facts; I'd keep it that way. One merged message would need a new message shape, the owner's words, and a rule for which seats are "the same moment". **I'm not arguing for it.**

## §4 Proof (`seat-coaches-task522.test.ts`, 7 tests)
- **By value over a small world** (the group G taught by Ek + Nok, where Nok is on the group row; seats S1/S2; a private class P):
  - **Ploy's seat ⇒ Ek AND Nok**, and the predicate was asked about **G**;
  - 🚫 **a private session ⇒ its own coaches, asked about itself (unchanged)**;
  - the group row itself is unchanged;
  - an unknown row ⇒ itself;
  - **the join is still THE predicate**, with the resolved id as its parameter.
- **Through a REAL producer** (`sendClassCancelledToCoaches`): the two-seats case (4 rows, each naming its seat, teachers only), and an **unlinked group coach ⇒ a SKIPPED row**.
- **Mutations** (database unreachable · CHECKSUM identical before and after · restores byte-identical · BASELINE=7):
  - **S: a seat returns to its own coach:** BITES (4);
  - **P: a private session's recipients change:** BITES;
  - **N: the predicate narrowed to the primary:** BITES.
- **Existing fakes taught the new first read** (answered "not a seat", so their assertions are unchanged): TASK-508's predicate-SQL test and `voucher-end`'s fake transaction.
- ⚠️ **Not executable here:** the two reads against a real Postgres. **The first real run is @Tanya's on sid**: a group with an extra coach, cancel one seat, both coaches told.

## ⚠️ §5 Reads oddly at the group's second coach: REPORTED, not edited
- The worker fills each message's `Coach :` line from **the row the message is about**: `joinCoaches(teacher, additionalTeachers)` of the **seat**, and a seat carries no extras.
- **So Nok's copy of "Ploy's class is cancelled" says `Coach : Ek`, not `Ek, Nok`.** It isn't false (Ek is the primary), but it omits the reader. To a co-teacher it may read like a message meant for someone else.
- **The fix would be the same resolution in `bookingContext`** (a seat's coach line = the group's), a one-line change beside this one. **It changes the text of existing messages, so it's yours to rule on.**

⛔ Only you mark this DONE.

---

# ✅ REVIEWED by @Sober (2026-09-27) — 🔨 **one addendum, then DONE.** (Next deploy.)
Verified: **3390 pass / 0 fail normally and unreachable** (with TASK-516 on top) · tsc 0 · 60 = 60.

🔑 **He taught THE predicate what a seat is, and touched no producer.** `teachersOfBooking` resolves the class first — a seat ⇒ its group row, else itself — then asks `ownScopeWhere`, unchanged. ⇒ **every class-event notice in the TASK-512 inventory inherited the ruling without being edited.** 📌 **That is the return on four tasks of converging on one predicate: a rule changed once and eight senders obeyed it.** Had we still had five hand-written recipient lists, this would have been five edits and at least one miss.
✅ **Two seats ⇒ each coach twice, one per child, each naming its seat — pinned as correct and not argued into a merge.** Two children, two facts, and I asked for exactly that judgement rather than tidiness.
✅ Private sessions pinned unchanged; the join is still the predicate; unlinked ⇒ SKIPPED. ⚠️ **And he says the first real Postgres run is Tanya's on sid** — correct, and worth saying rather than implying the query is proven.

## 🔨 The addendum: **yes, fix the `Coach :` line. One line, and it is the same defect.**
Nok's copy says **`Coach : Ek`** — because the worker builds that line from **the seat row**, which has no extras. 🔑 **So the message we just widened to reach Nok tells Nok that the coach is someone else.**
**Do the same resolution in `bookingContext`.** It changes existing message text, which is why you asked — **and the change is from a false line to a true one**: it adds the coach who is actually teaching. 🚫 **Nothing else about those messages moves**, and **pin the private-session line byte-identical.**
📌 **Recorded as the pattern, because it is the third instance:** *a message built from the wrong row.* The seat knows one coach, the group knows both — **and every line assembled from the seat inherits the seat's blind spot.** ⚠️ **So while you are there: say whether any OTHER line in `bookingContext` is built from the seat and would read falsely for a group's second coach.** If there are none, say so.

---

# ✅ ADDENDUM DONE — @Jason (2026-09-27): a seat's `Coach :` line names the GROUP's coaches · a private row byte-identical · 3400 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 60 = 60
- **`bookingContext`** (the worker's per-row context) now joins the seat's **`group`** (with its teacher + extras) onto **the SAME query** (the one-round-trip rule its comment insists on).
  - **`coach` = the group's coaches when the row is a seat**, else its own, as before.
  - So Nok's copy of "Ploy's class is cancelled" now reads **`Coach : Ek, Nok`**. A false line became a true one.
- 🔑 **Does any OTHER line in `bookingContext` read falsely for a group's second coach? NONE.**
  - `studentName` is **the seat's child**, which is what a seat's message is about.
  - `subject` / `title` / `date` / `startTime` / `endTime` are **the seat's own**, the same class and slot.
  - `teacherNickname` is the seat's primary, which **is** the group's primary (a seat is created with the group's teacher). It's used only as the coach fallback and in one dead branch (`sick_leave`, no producer).
  - **The Coach line was the only one assembled from something the seat doesn't know.**
- **Pinned by value** (`line-notices-both-names-req095-13.test.ts`, +2): a seat on Ek + Nok's group ⇒ `Coach : Ek, Nok`, with its own child/subject/slot; **🚫 a private row's whole context byte-identical.** The with-line source pin moved (same claim: the query loads `coStudent`).
- **Mutations** (CHECKSUM identical, restores byte-identical): **the Coach line from the seat again:** BITES · **a private row's line changed:** BITES.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
**3400 / 0 normally and unreachable** · tsc 0 · 60 = 60. A seat's `Coach :` line is now the **group's** coaches; a private row byte-identical.
✅ **And the answer to "any other false line?" is NONE, with the reasoning shown** — the child, the subject and the slot are the seat's **and true of it**, and `teacherNickname` is the group's primary. 🔑 **"None, and here is why each of the others is fine" is a result; "I looked and found nothing" is not.**
