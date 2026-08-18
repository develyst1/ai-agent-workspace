# TASK-133: Plan editor — lock วิชา (subject) on a course session (FE)
- Source: SPEC-042 (REQ-053)
- Status: DONE (code — SA-reviewed Sober 2026-08-16); visual pass → @Tanya; REQ-053 closes with TASK-134 (BE)
- Assignee: @Fern (FE)
- Depends on: none (BE guard is TASK-134; they're independent — this is the UI half)

## Context (why)
On the plan editor `แก้ไขคาบ` a course session currently lets staff change วิชา. A course is one program,
fixed at creation; changing a session's subject silently corrupts the course's (derived) program and the
REQ-013/REQ-014 revenue-by-activity reads. Lock it in the UI (the BE also refuses it — TASK-134).

## What to do
In `smart-scheduler-front/src/components/partials/Bookings/PlanModal.tsx`, `SessionEditor` (~L439+):
1. When `plan.kind === "course"` **and** the target is a **move/edit of an existing session**, replace
   the subject `<Select>` (~L584-591) with **read-only text** showing the session's `subject.name`, plus
   the one-line explanation (wording below).
2. Do **not** include `subjectId` in the course `move` payload (`onPreviewApply({kind:"move", …})`, ~L520).
3. Leave the subject `<Select>` **live** for `kind:"insert"` / `"extra"` (new sessions legitimately pick
   a program) and for the **voucher** move path (~L534) — the rule is COURSE_PACKAGE sessions only.
4. Wording via `t(...)` (TH + EN, add to `dictionaries.ts`):
   - TH `วิชาของคอร์สกำหนดตอนสร้างคอร์ส เปลี่ยนรายคาบไม่ได้ — หากต้องการวิชาอื่น ใช้คาบเดี่ยว/บัตร หรือเปิดคอร์สใหม่`
   - EN `A course's subject is fixed when the course is created and can't be changed per session — for a different activity use a single session / voucher, or start a new course.`

## Definition of Done
- [ ] On a course session's edit, วิชา is read-only text + the explanation; no subject Select. (AC-1)
- [ ] The course `move` payload no longer sends `subjectId`.
- [ ] `insert`/`extra` sessions and voucher/single/trial edits still let staff pick a subject. (AC-4)
- [ ] Booking/plan edit otherwise unchanged (date/time/teacher still editable on a course session).
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok · FRONTEND-STANDARD holds · hallmark verdict pasted.

## Implementation Notes
**Fern 2026-08-18 — `smart-scheduler-front@dong`, uncommitted (`PlanModal.tsx` + `dictionaries.ts`).**

### What changed
One predicate in `SessionEditor` drives all three effects:
```ts
const courseSubjectLocked = plan.kind === "course" && target.kind === "move" && !onLocalSave;
```
1. **Read-only วิชา** — when locked, the subject `<Select>` is replaced by a Mantine `Input.Wrapper` carrying the same
   `plan.colSubject` label, the session's `subject.name` as text, and the REQ's explanation as the field
   `description`. **Honest empty:** a session with no subject renders a labelled `—`, never a blank or an invented name.
2. **Payload** — `subjectId: courseSubjectLocked ? undefined : (subjectId ?? undefined)`. The field is **omitted from
   the move payload**, not merely disabled in the UI, so a locked subject can't be sent even if state held one.
3. **Everything else on that editor is untouched** — date, time, teacher and the availability/clash view stay editable
   on a course session (explicit DoD line).

### Why the predicate has a third clause (the one judgement call — Q1)
The task says lock on "a **move/edit of an existing session**". `target.kind === "move"` alone is **not** that: the
same `SessionEditor` is reused by **create mode** (`CreatePlanFlow` → `onLocalSave`), where the rows are an unsaved
draft and the course's program is still being chosen — locking there would have made the new-course flow unable to set
a subject at all (`onLocalSave` refuses without one, `PlanModal.tsx:482`). So the lock excludes it. Flagged in Q1
because it is a real, if narrow, hole in REQ-053's intent.

### DoD / AC
- ✅ **AC-1** — locked path renders text + explanation, no Select (code); wording is REQ-053's TH/EN verbatim, added as
  `plan.courseSubjectLocked` to both dictionaries. No copy of my own.
- ✅ **`move` payload no longer sends `subjectId`** on a course session — the one-line diff above.
- ✅ **AC-4 (still editable where it should be)** — `insert` and `extra` fail the `target.kind === "move"` clause;
  the **voucher** move path (`PlanModal.tsx:534`, `plan.kind === "voucher"`) fails the first clause and is
  byte-for-byte untouched; single/trial edits don't go through this editor at all.
- ✅ `bunx tsc --noEmit` **0** · `bun run build` **ok** · `bun test src/lib/scheduler/` **15/0** · §3.5 greps on
  `PlanModal.tsx`: hex **0** · `transition-all` **0** · `font-family` **0** · `z-[` **0**.
- 🔴 **Rendered check + `hallmark audit` — NOT verified**, same non-compositing-pane blocker as TASK-131/132. The
  visual claim here is small (a Select became a label + text + one description line) but it is still a claim I did not
  see, so it rides the same @Tanya pass.

### ⚠️ Housekeeping note, not my call
While I was on TASK-133 the owner **committed TASK-131 + TASK-132** as **`c6db8ca`** ("implement EligibleStudentSelect
…", 5 files). You had said to keep the batch uncommitted until review, so flagging that it is now on `dong` — nothing
is lost and I did not touch the commit. TASK-133's changes are the only uncommitted ones left.

## Questions
- **Q1 (scope — genuinely yours):** the same corruption REQ-053 describes is reachable in **create mode**. Each draft
  session in `CreatePlanFlow` carries its own `subject`, and `confirmCreate` posts `sessions[].subjectId` per row
  (`CreatePlanFlow.tsx:152`) — so staff can give session 3 of a brand-new course a different program from sessions
  1–2, and the course's *derived* program is then whatever `bookings[0]` happens to be. TASK-134's BE guard protects
  **existing** COURSE_PACKAGE sessions; I don't know whether it also refuses this at creation. I did **not** widen the
  lock (out of task scope, and it would need a different UX — the program belongs to the course-level field, not the
  row). Worth its own small REQ/TASK, or a line in SPEC-042 saying it's accepted?
- **Q2 (non-blocking):** I used `Input.Wrapper` + `Text` rather than a `disabled` Select, because a disabled Select
  still reads as "a control someone locked" and invites staff to hunt for the unlock. Read-only text + the reason
  states the rule instead. Say if you'd rather it look like a field.
  > answer (Sober): **keep it — good judgment.** A disabled control invites hunting for an unlock; read-only text + the
  > reason states the rule. That's the right read of REQ-053's "not a hidden field."

## Review
**PASS ✅ (code — Sober 2026-08-16). Visual pass → @Tanya; REQ-053 closes when TASK-134 (BE refuse) also lands.**
Reproduced, not trusted.
- **Reproduced:** `bunx tsc --noEmit` **0** · `bun run build` ok · `bun test src/lib/scheduler/` **15/0** · §3.5 greps
  on PlanModal **0**. Read the code: `courseSubjectLocked = plan.kind === "course" && target.kind === "move" && !onLocalSave`
  (`:478`) → read-only `Input.Wrapper` with the label + REQ wording as `description` (`:593-601`), and the move payload
  **omits** `subjectId` when locked (`:529`). Faithful to SPEC-042.
- **AC-4 preserved:** `insert`/`extra` fail the `move` clause; the voucher move path fails the `course` clause →
  untouched; single/trial don't use this editor. Good.
- **Q2 approved** (read-only text over disabled Select).
- 🔴 **Rendered/hallmark not verifiable headless** → @Tanya (small visual delta: a Select became a labelled text + one
  description line).

### 🔴 Q1 is a real finding — accepted as a scoped-out gap, routed as a follow-up (not widened here)
Fern is right: the **same subject-corruption is reachable in create mode** — `CreatePlanFlow` posts `sessions[].subjectId`
per row (`CreatePlanFlow.tsx:152`), so a brand-new course can be made mixed-program, and TASK-134's BE guard only
protects **existing** course-session edits (move/moveBooking), not `createCoursePackage`'s `sessions[]`. This is the
same REQ-013/014 corruption class, one step upstream. **It is out of REQ-053's scope** (which is `แก้ไขคาบ` = editing),
and the fix needs a different shape (subject as a **course-level** field at creation, not per-row, + a BE guard that all
`sessions[].subjectId` match). **I did not widen 133/134** (scope discipline). Recorded as a follow-up in SPEC-042 and
routed to Porter for a small sibling REQ. Correctly not silently fixed. **Verdict: code DONE.**
