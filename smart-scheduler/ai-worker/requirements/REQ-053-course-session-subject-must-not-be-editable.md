# REQ-053: A course session's program (วิชา) must not be editable — the course fixed it at creation
- Status: READY_FOR_SA
- Priority: 🔴 **HIGH** — it silently corrupts what the family bought and what the reports count
- Requested: 2026-08-16 by stakeholder (owner)
- Deadline: none stated
- Source: owner, 2026-08-16 (screenshot of `แผนของ Athena` → `แก้ไขคาบ`) — *"ในการแก้ไข manage course ไม่ควรจะแก้
  กิจกรรมได้ เพราะคอร์สถูกฟิกตั้งแต่สร้างแล้วว่ากิจกรรมใด"*

## Problem / Goal
The plan editor's `แก้ไขคาบ` panel offers four fields: **วันที่ · เวลา · ครู · วิชา**. The first three are the point
of REQ-030 — a plan is editable. **วิชา (the program) is not**, and should never have been: a course **is** a
program. The family bought "6 × Surfskate"; a course row carries its program from creation, the price card is
priced per program, and the plan modal itself prints `โปรแกรม: Surfskate` above the sessions.

Letting one session's program be changed produces a course whose sessions are **not all the same thing** — and
every consequence is silent:
- **The family's entitlement is misrepresented** — they paid for one program and hold a session of another.
- 💰 **Reports break at the source.** REQ-013 (sport share) and REQ-014 (revenue by activity) both read the
  **session's** program. One edited session mis-attributes both. This is the exact defect class REQ-029 fought on
  the voucher path ("the wrong sport is written to the booking and nobody is told").
- **Pricing/product rules become unenforceable** — REQ-027's voucher exclusions and the price card are per program.

**Goal: on a course session, the program is shown, not edited.**

## Requirement
1. **In `แก้ไขคาบ` for a session that belongs to a course, `วิชา` is read-only** — displayed (so staff can see what
   it is), never changeable.
2. **Date, time and teacher stay fully editable** — REQ-030's behaviour is untouched.
3. **The server refuses a program change on a course session**, not just the UI. A field hidden only in the client
   is not a rule.
4. **A one-line explanation is shown** where the field was, so it reads as a deliberate product rule and not as a
   broken control (wording below).
5. **Say what the right action is instead:** if the child genuinely needs a different activity, that is a different
   product — a single session, a voucher session, or a new course — not an edit to this one.

## Acceptance Criteria
- [ ] **AC-1** — **Given** a session belonging to a course, **When** staff open `แก้ไขคาบ`, **Then** `วิชา` shows
      the course's program as **read-only text**, with the explanation line, and cannot be changed.
- [ ] **AC-2 (server-side)** — **Given** a crafted request that tries to change a course session's program,
      **When** it reaches the API, **Then** it is **refused**, and the stored program is unchanged.
- [ ] **AC-3 (regression, REQ-030)** — Date, time and teacher edits still work exactly as today, including the
      conflict checks, the freelance re-draw, and the extension behaviour.
- [ ] **AC-4 (other booking types)** — **Given** a session that is **not** part of a course (single session /
      voucher / trial), **When** staff open it, **Then** program editability behaves as it does today — this REQ
      does not silently restrict them.
- [ ] **AC-5 (existing data)** — **Given** a course whose sessions already have mixed programs (if any exist), the
      screen still renders and staff can see the mismatch — it is not hidden by the new read-only display.

## User-facing wording (Porter as UX writer)
- Read-only field label — TH: `วิชา` · EN: `Subject` (unchanged), value shown as plain text.
- Explanation under it — TH: `วิชาถูกกำหนดไว้ตั้งแต่ตอนสมัครคอร์ส จึงแก้ไขรายคาบไม่ได้ — หากต้องการเรียนกิจกรรมอื่น ให้จองเป็นคาบเดี่ยว บัตร หรือเปิดคอร์สใหม่` ·
  EN: `The subject is set when the course is created and can't be changed per session — for a different activity, book a single session, use a voucher, or start a new course.`
- Server refusal (if surfaced) — TH: `ไม่สามารถเปลี่ยนวิชาของคาบในคอร์สได้` ·
  EN: `A course session's subject cannot be changed.`

## Constraints
- Do not change how a **course** stores its program, and do not add a way to change a course's program wholesale —
  that is a bigger question (refund/price implications) nobody has asked for.
- REQ-030's plan-edit behaviour is otherwise untouched.

## Out of Scope
- Changing the program of an **entire** course after creation.
- Fixing historical mixed-program courses (see Q2 — that is a data conversation with the owner, not a silent
  migration).

## Questions
- **Q1 (to SA):** does the API today **accept** a subject change on a course session, and does anything downstream
  (price, quota, freelance draw, reports) already assume all sessions of a course share one program? Ground it —
  requirement 3 needs to know where the check belongs.
- **Q2 (to SA → Porter):** are there **existing** course sessions whose program differs from their course's? Do
  **not** query real data yourself — give Porter the query and I will raise it as a DATA REQUEST. If such rows
  exist they have been feeding REQ-013/REQ-014 wrong numbers, and that is the owner's decision to make, not a
  cleanup to run quietly.
- **Q3 (to owner, only if Q2 finds rows):** correct them, or leave and flag them?
  > **CLOSED 2026-08-16 — the question never arises. DATA REQUEST run by the owner: ZERO rows.** No course in the
  > live database has sessions with more than one program. So: **no historical corruption, nothing to correct, no
  > owner decision needed, and REQ-013/REQ-014's numbers were never distorted by this.**
  > *(Porter's first version of the query errored — `min(uuid)` has no such function; my mistake, corrected and
  > re-run.)*
  > ⇒ REQ-053 and REQ-054 are now purely **preventive**: they close a door nobody has walked through yet. That is
  > the cheapest moment to close it, and it means neither REQ carries a data-migration risk.
