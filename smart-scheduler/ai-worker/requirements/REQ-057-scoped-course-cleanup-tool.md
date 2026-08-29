# REQ-057: A scoped way to remove ONE course and everything it created
- Status: **GO — SA cut authorised by the owner 2026-08-23.** (was READY_FOR_SA, then HOLD 08-22)
- Priority: **HIGH** — it blocks safe testing on `uat`, and `uat` now holds the customer's real families
- Requested: 2026-08-20 by stakeholder (owner) — *"เขียนสคริปเคลียร์ข้อมูลที่จะเกิดขึ้นหลังจากสร้างคอร์สให้หน่อย พอดีจะลองสร้างที่ uat"*
- Deadline: none stated, but it is wanted tonight

## Problem / Goal
The owner wants to **try creating a course on `uat`** and then remove what that created. **Today he cannot.**
There is **no delete for a course or a booking anywhere in the product** — a gap that has now cost us three times:
- Tanya could not test REQ-053's server guard on `sid` (no course existed, and creating one leaves residue);
- she flagged the same wall again on the LINE fixture;
- and now it blocks the owner on the **customer's own box**.

The only existing tool is **`db:reset`**, which is the opposite of scoped: it clears *everything* except teachers,
subjects and config — on `uat` that would delete **the 25 imported students and 23 families**.

**Goal: remove one named course and exactly what it produced — nothing else — with the same discipline as
`db:reset` (dry-run first, one transaction, a report the owner can read before committing).**

## Requirement
1. **Scoped to one course**, identified explicitly (course id). Never "the latest", never a date range.
2. **Removes what that course created**: the course row, its sessions/bookings, and anything hanging off those
   bookings (badges, outbox rows, check-in tokens) — whatever the FK graph actually requires. **SA determines the
   real list from the schema; this REQ does not guess it.**
3. **Touches nothing else**: the student and the parent **stay** (they are the customer's real people, not test
   data); other courses, other bookings and all config stay.
4. **Dry-run by default.** It prints what it would delete, per table, and **only `--commit` acts** — the same shape
   as `db:reset` and `import:students`, which the owner has now used a dozen times and trusts.
5. **Refuses to touch anything with real history**: if any session is `ATTENDED`, or money/quota has moved on it,
   it **stops and says so** rather than deleting evidence. A test course has no history; a real one does, and this
   tool must not become the way a real course gets erased.
6. **Re-runnable** (idempotent): a second run deletes nothing and says so.

## Acceptance Criteria
- [ ] **AC-1** — **Given** a course id, **When** run without `--commit`, **Then** it prints a per-table count of
      what would go and writes **nothing**.
- [ ] **AC-2** — **When** run with `--commit`, **Then** exactly that course and its own bookings are gone, and the
      **student, the parent, other courses and other bookings are untouched** (verifiable by count before/after).
- [ ] **AC-3 (the safety one)** — **Given** a course with an `ATTENDED` session or consumed quota/money, **When**
      run, **Then** it **refuses** and names why — with `--commit` too.
- [ ] **AC-4** — Re-running after a successful commit deletes 0 rows and says so.
- [ ] **AC-5** — Schema and both migration ledgers are untouched (same guarantee `db:reset` already makes).

## Constraints
- **Owner-run only**, like every tool that touches a real environment.
- Must not become a general-purpose delete: **one course at a time, by id**.

## Out of Scope
- A delete button in the product UI. That is a real product decision (who may erase a family's history, and what
  happens to money already recorded) and deserves its own REQ — this is an **operator tool** for test residue.
- Deleting students, parents or vouchers.

## Questions
- **Q1 (to SA):** what does the FK graph actually require — `booking_badges`, `notification_outbox`, check-in
  tokens, `course_packages`? Ground it; do not take my list above as the spec.
- **Q2 (to SA):** is "money/quota has moved" cleanly detectable (an `ATTENDED` row, a `bo.movement`, a drawn
  freelance budget)? If it is not cheaply knowable, say so and I will re-scope AC-3 rather than have it silently
  half-work.

---

## 📌 UPDATE 2026-08-22 — the target is named, and the risk has changed since this REQ was written
**When REQ-057 was raised, `uat` held test data. It now holds the customer's real families.** That inverts what
matters most about this tool: it was "let me undo my test", it is now **"a delete tool pointed at a live customer
system."** The requirement did not change; the **guardrails carry all the weight**.

### The target, from the DATA REQUEST (no guessing needed)
- Student **`Test`**, parent **`SOM Team` (0924912848)**, one **Skateboard** course (size 10, **4 used**),
  `source = IMPORT`, created 2026-08-21 20:38, plus its bookings.
- **Everything else on `uat` is real**: 137 students / 115 parents / 17 courses / 109 bookings.

### What Porter is adding to the requirement because of that
1. **The tool takes an explicit id and never a predicate.** No `--name Test`, no "delete where name like…". A
   human typing a pattern against a live roster is the failure mode we are buying protection from.
2. **Dry-run must print the full blast radius by name before anything** — the student, the parent, the course,
   **and every booking with its date** — so the owner reads *"4 bookings for Test on 25/8, 1/9, 8/9, 15/9"* and not
   a count.
3. **It must REFUSE, not warn, if the target has any sign of real life**: a LINE-linked parent, a booking with
   `ATTENDED` status, a posted sale (`bo.movement` with that `refId`), or more than one student on the parent.
   **A refusal the owner has to override deliberately is worth more than a confirmation prompt he will click.**
4. **Never touch `subjects`, `teachers`, `bo.item`, or anything not reachable from the given id.**
- [ ] **AC-8** — **Given** the real course of a real family, **When** it is passed to the tool, **Then** it is
      **refused** with the reason named (linked parent / attended session / posted sale), and nothing is written.
- [ ] **AC-9** — **Given** `Test`'s course id, **When** dry-run runs, **Then** it lists the student, parent, course
      and **each booking by date**, and writes nothing.
- [ ] **AC-10** — After `--commit`, **`select count(*)` for students/parents/courses/bookings drops by exactly the
      numbers the dry run printed** — no more, no less.

**Question that is now the owner's, not SA's:** does he want the **parent `SOM Team` removed too**, or only the
student and course? Porter's lean: **remove both** — it is a fabricated household, and leaving an orphan parent in
a customer's roster is its own small mess. **Asked; not assumed.**

---

## ⏸️ ON HOLD — owner, 2026-08-22 — ✅ **LIFTED by the owner 2026-08-23: *"REQ-057 เดินต่อได้ ให้ Sober cut ได้เลย"***
> *"ไม่ๆ เราไม่ลบข้อมูลนักเรียน ผู้ปกครอง และการจองคอร์สในตอนนี้ จนกว่าเขาจะแจ้ง"*

**Nothing is deleted from `uat` until the customer asks.** The `Test` / `SOM Team` residue **stays** for now — it is
one fabricated family sitting quietly beside 137 real ones, and that is a much smaller cost than running a delete
tool across a live roster nobody has asked us to touch.

**Status: HOLD, not dropped.** The REQ keeps everything gathered today — the named target, the explicit-id rule,
the refuse-don't-warn guardrails, AC-8/9/10 — so that when the customer does ask, **the spec is ready and nobody
re-derives it under time pressure**, which is exactly when a delete tool gets built carelessly.

**Porter's note on sequencing, for the record:** building it now would also have been defensible (dry-run-only is
harmless), but it would have gone ahead of work that is **hurting the customer today** — 24 children whose gender
the product will not show, an importer that cannot absorb the sheet edits already on their way back to us, and a
program that cannot be sold at all. **A tool for a delete nobody will run this week does not outrank those.**

---

## ✅ HOLD LIFTED — owner, 2026-08-23
> *"REQ-057 เดินต่อได้ ให้ Sober cut ได้เลย"*

**@Sober — cut it.** Everything below the 08-22 UPDATE stands unchanged: explicit id only (never a predicate),
dry-run default, blast radius printed **by name** not by count, and **refuse — not warn** on any sign of real life.
Q1/Q2 at the top are still yours to ground from the schema; **do not take Porter's table list as the spec.**

⚠️ **One distinction Porter is drawing rather than assuming, because the owner's 08-22 hold was about deleting and
this authorisation is about building.** *Cutting and building* the tool is now GO. **Running it against `uat` is a
separate owner decision** and the 08-22 rule — *nothing is deleted until the customer asks* — is **not** treated as
withdrawn by this line. A dry-run-only tool sitting ready is exactly what the hold anticipated. If the owner does
mean "and delete the `Test` / `SOM Team` household too", he says so and it is one more owner-run step.

**Still open and it is the owner's, not SA's:** does the parent **`SOM Team` (0924912848)** go with the student and
the course, or only the student + course? Porter's lean is **both** — a fabricated household, and an orphan parent
in a customer's roster is its own small mess. **Does not block the cut**; it is a run-time argument, not a design.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-057 | 🧹 **Scoped cleanup tool for data created after making a course** — owner needs to test course creation on `uat` and then remove exactly what that test created, nothing else | 🔴 **HIGH** | 🔨 **GO — owner lifted the 08-22 hold 2026-08-23** (*"เดินต่อได้ ให้ Sober cut ได้เลย"*). **@Sober to cut.** Guardrails from the 08-22 UPDATE are load-bearing: explicit course id only (never a predicate) · dry-run default · blast radius printed **by name** · **refuse, not warn**, on a LINE-linked parent / `ATTENDED` session / posted sale. ⚠️ **Building ≠ running** — the owner's *"เราไม่ลบ...จนกว่าเขาจะแจ้ง"* still governs whether it is ever pointed at `uat`. Open (owner, non-blocking): does parent `SOM Team` go too, or student+course only? | @Sober — spec. **Scope is now knowable, not guessed:** the `uat` DATA REQUEST (2026-08-22) shows the test residue by name — student **`Test`** under parent **`SOM Team` (0924912848)**, 1 course (Skateboard, 10, 4 used), plus its bookings. Tool must be **dry-run first**, take an explicit target (student/course id), and **refuse** to touch anything with a real family attached. |
```
