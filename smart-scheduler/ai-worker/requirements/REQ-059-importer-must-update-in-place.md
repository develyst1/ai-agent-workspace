# REQ-059: The importer must UPDATE existing students — deleting and re-importing is no longer possible
- Status: READY_FOR_SA
- Priority: 🔴 **HIGH** — it blocks every correction to data the customer is already using
- Requested: 2026-08-20 by stakeholder (owner)
- Deadline: none stated; every hour the customer works, more records become un-redoable

## Problem / Goal
Wave 1 imported people **insert-only**: a row either created a new student or was skipped as already present
(`มีอยู่แล้ว 0`). That was correct for an empty environment. **It is wrong now**, for two reasons that arrived
together:
1. **The customer has already used the imported students** — they have attached them to **courses**. So the
   records cannot be deleted and re-imported; deleting a student now would take a real course with it.
2. **The source Excel has been edited** by the customer since the import, and will keep being edited. Corrections
   and additions therefore have to land **on top of** what already exists.

**Goal: re-running the importer against an updated sheet brings the system in line with it — creating what is new,
updating what changed, and never destroying what the customer has built on.**

## Requirement
1. **Update in place.** A row that matches an existing student updates that student's fields rather than being
   skipped.
2. **The match rule must be stated and stable** — the importer already treats *(parent phone, student name)* as
   identity for idempotency. That is the candidate; **SA confirms it is safe** given that names get corrected too
   (a renamed child would otherwise import as a second person).
3. **Only fill and correct — never blank.** If the sheet has a value and the system does not, write it. If the
   sheet is **empty** and the system has a value **a human typed**, the sheet **must not erase it**. The customer
   has been filling gaps by hand (see REQ-060's gender question); an import that clears those would destroy their
   work silently.
4. **Never touch what the import does not own**: courses, bookings, vouchers, quotas, LINE links, notes added by
   staff.
5. **Dry-run first, as always**, and the report must say, per row, **created / updated (with which fields) /
   unchanged / held** — not just a count. "Updated 47" tells the owner nothing about what moved.
6. **Idempotent**: running it twice against the same sheet reports the second run as all-unchanged.

## Acceptance Criteria
- [ ] **AC-1 (new rows)** — A student added to the sheet since the last import is created, with their parent
      matched or created by phone as today.
- [ ] **AC-2 (corrections land)** — A field corrected in the sheet (e.g. gender, DOB, nickname) is updated on the
      existing student, and the dry run named that field before it was written.
- [ ] **AC-3 (no destruction)** — A row whose sheet cell is **empty** leaves an existing value **untouched**.
- [ ] **AC-4 (customer's work is safe)** — A student attached to a course keeps their course, bookings, plan,
      quota and LINE link across the update — verified on a student who has one.
- [ ] **AC-5 (identity)** — A student whose **name changed** in the sheet does not become a duplicate person; the
      behaviour is whatever SA confirms in requirement 2, and it is stated in the report.
- [ ] **AC-6 (idempotent)** — An immediate re-run reports **0 created · 0 updated**.
- [ ] **AC-7 (report)** — Per source row: created / updated + field list / unchanged / held-with-reason, keyed to
      the Excel row number as today (AC-15 of REQ-055).

## Constraints
- Owner-run, dry-run default, `sid` first — same family as `db:reset` / `import:students`.
- **This replaces "wipe and re-import" as the correction mechanism.** That door is closed for `uat` now, and it
  should not be reopened casually: the customer's own work sits on top of these rows.

## Out of Scope
- Deleting students or parents (there is no safe delete; REQ-057 covers *course* cleanup only).
- Wave 2 (courses/timetable import).

## Questions
- **Q1 (to SA):** is *(parent phone, student name)* still the right identity once names are being corrected, or
  should the importer key on something more stable? If there is no stable key, say so — the honest answer may be
  that renames must be handled by hand, and I would rather write that down than pretend.
- **Q2 (to SA):** can the dry run show a **field-level diff** (sheet value vs stored value) cheaply? That is what
  makes AC-2 trustworthy for the owner rather than a promise.

---

## 📊 EVIDENCE — 2026-08-22, measured against the customer's updated sheet
Porter diffed `Downloads/exceldata/Student list - Sheet1 (1).csv` (188 named rows) against the exact file we
imported from (179 named rows). **These are counts, not estimates.**

| What changed | Count | What the current importer would do |
|---|---|---|
| **Student NAME changed** (nickname → nickname + real name) | **31** | ⛔ Match nothing → **create 31 duplicate children** beside the ones the customer has already attached courses to |
| Rows added at the bottom | 9 | ✅ Create (correct) |
| DOB filled in where it was blank | ~20 | Would land — **if** the row matches |
| Phone filled in / corrected | ~15 | Would land — if it matches |
| **Phone now holds TWO numbers** (`x , y` / `x / y`) | **3** | ⛔ Fails the 10-digit rule → **held**, though the human meaning is plain |
| Gender filled in (2) and **corrected** (1: `Female`→`Male`) | 3 | Would land — if it matches |
| Nationality now `Japan` / `Taiwan`, not `Thai`/`Foreign` | 2 | Stores as text; check anything keying off `Foreign` |
| Free-text notes added (`หมดคอร์ส`, `ยังไม่ต่อคอร์ส`, `ขาด option BP`, `ยังไม่ได้สร้าง course แยก`) | ~10 | No home in our model — see Q4 |

### What this evidence changes about the REQ
- **Q1 (identity key) is no longer theoretical.** `(parent phone, student name)` is **provably unstable** — the
  customer edits names as they learn them. **31 collisions on the very first update.** The key has to survive a
  name change, or every future refresh of this sheet forks the roster again.
- **New AC required — the dual-phone case.** `0991659555 , 0994456464` must not be silently held. Whatever we
  decide (first number wins · second recorded as a second contact · report and hold), it must be **stated**, and a
  held row must say *why* in the report.
- **New AC required — the name change itself must be visible.** When a matched student's name changes, the report
  must print `เอแคลร์ → เอแคลร์ อังศุมาลิณณ์`, because that is the one field a human might have deliberately typed
  in the product and we would be overwriting.
- **Q4 (new, to owner via Porter):** the `Note` column now carries operational state (`หมดคอร์ส` = course finished,
  `ขาด option BP` = missing a BP option). **We have nowhere to put it and we should not invent one.** Proposal:
  ✅ **CLOSED 2026-08-22 — owner agreed.** The importer **ignores** the Note column and simply **echoes it in the report** next to the row, so the owner
  keeps the information without us guessing a meaning.

**Not in scope, stated so it is not assumed:** gender was **not** an import defect — 8 of the 179 original rows
had no gender in the source, which is what the customer was filling in by hand. The importer wrote it wherever the
sheet had it. (Verified in `uat`.)
