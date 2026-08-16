# REQ-054: A course is created with ONE program — the create screen must not be able to make a mixed course
- Status: READY_FOR_SA
- Priority: 🔴 **HIGH** — same corruption as REQ-053, one step upstream, and this one creates it from nothing
- Requested: 2026-08-16 — raised by Sober during TASK-133 review, adopted by Porter as a requirement
- Deadline: none stated
- Source: sibling of **REQ-053** (owner, 2026-08-16: *"คอร์สถูกฟิกตั้งแต่สร้างแล้วว่ากิจกรรมใด"*). Found in review:
  `CreatePlanFlow` posts a **per-row** `sessions[].subjectId`, and TASK-134's guard covers **edits only**.

## Problem / Goal
REQ-053 stopped staff from changing a course session's program **after** the course exists. But the create screen
can still produce a course whose sessions are **not all the same program from birth** — the same defect, before
anyone has a chance to notice it.

The owner's rule is not "you may not edit the program"; it is **"a course IS one program"**. A rule enforced only
on the edit path is a rule with a door left open, and the consequences are identical: the family's entitlement
stops matching what they bought, and 💰 **REQ-013 (sport share) + REQ-014 (revenue by activity) read the session's
program**, so a mixed course mis-attributes both — silently.

There is a deeper reason this keeps happening, and it belongs in this REQ rather than in a footnote: **a course has
no program of its own in the data.** The program is *derived* from its first booking (`bookings[0].subject`). So
"the course's program" is currently an accident of row order — which is exactly why both these defects were
possible.

**Goal: choose the program once, for the course, at creation — and make it impossible to save a mixed one.**

## Requirement
1. **On the create-course screen, the program is chosen once for the whole course**, not per session row.
2. **The server refuses to create a course whose sessions do not all carry that one program** — a client that
   forgets is not allowed to succeed (same discipline as REQ-053's server guard).
3. **The per-session program control disappears from the create flow** — staff should not be offered a choice the
   product does not permit.
4. **A course carries its program as its own field** (rather than only being inferable from its first booking), so
   "one program per course" has a real source of truth. *(Sober flagged this as optional hardening; Porter is
   putting it **in** scope — without it, requirement 2 is guarding a value that does not exist, and the same class
   of bug will return the next time somebody adds a path.)*
5. **Nothing changes for the other booking types** — single session, trial and voucher keep choosing their program
   per booking; they are not courses.

## Acceptance Criteria
- [ ] **AC-1** — **Given** the create-course screen, **When** staff build a 6-session course, **Then** the program
      is asked **once**, and no session row offers its own program control.
- [ ] **AC-2 (server-side)** — **Given** a crafted create request whose session rows carry different programs,
      **When** it reaches the API, **Then** the course is **not created** and the refusal names the rule.
- [ ] **AC-3** — **Given** a course created this way, **When** it is opened in the plan modal, **Then** every
      session shows that program, and REQ-053's read-only lock behaves exactly as it does today.
- [ ] **AC-4 (regression)** — Trial, single session and voucher bookings still choose their program per booking.
- [ ] **AC-5 (regression)** — Existing courses still open, edit, extend and report exactly as before; nothing about
      REQ-030's plan editing changes.
- [ ] **AC-6 (reporting)** — REQ-013's sport share and REQ-014's revenue-by-activity read a course's sessions as
      one program — verifiable on a newly created course.

## User-facing wording (Porter as UX writer)
- Field label on the create screen — TH: `วิชา / กิจกรรมของคอร์ส` · EN: `Course subject`
- Help under it — TH: `คอร์สหนึ่งคอร์ส = หนึ่งกิจกรรม ทุกคาบในคอร์สนี้จะเป็นกิจกรรมนี้ทั้งหมด` ·
  EN: `One course = one activity. Every session in this course uses it.`
- Server refusal (defensive; staff should never reach it) — TH: `ทุกคาบในคอร์สต้องเป็นกิจกรรมเดียวกัน` ·
  EN: `All sessions in a course must have the same subject.`

## Constraints
- Must not change how **existing** courses behave or how their program is currently read (see Q2 for history).
- Coordinate with REQ-053: same rule, two doors. If they disagree in any detail, they are wrong.

## Out of Scope
- Changing a course's program **after** creation (nobody has asked for it; it has refund/price implications).
- Repairing historical mixed-program courses — that depends on the DATA REQUEST below and is the **owner's**
  decision (REQ-053 Q3), not a migration anyone runs quietly.

## Questions
- **Q1 (to SA):** does adding a course-level program field (requirement 4) need a migration, and does anything
  currently rely on the `bookings[0].subject` derivation that would have to be repointed? Say what you find; if the
  honest answer is "bigger than it looks", tell Porter and I will split requirement 4 into its own REQ rather than
  let it swell this one.
- **Q2 (to owner — pending the DATA REQUEST Porter is raising for REQ-053):** if existing mixed-program courses are
  found, do we correct them to one program (which one?) or leave and flag them? *(Porter's lean: show me the list
  first — the right answer may differ per course, and some may be legitimate data-entry mistakes with a family who
  remembers what they actually bought.)*
  > answer: _pending_
