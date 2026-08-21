# REQ-057: A scoped way to remove ONE course and everything it created
- Status: READY_FOR_SA
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
