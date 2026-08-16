# REQ-046: A leave must name the SESSION, not just the day (LINE especially)
- Status: READY_FOR_SA
- Priority: **HIGH** — a student can hold two sessions on one day, and today's leave is ambiguous
- Requested: 2026-08-16 by stakeholder (owner), from a customer meeting
- Deadline: none stated
- Source: owner, 2026-08-16 — *"การลาล่วงหน้า ในไลน์ ตอนนี้เหมือนมันจับแค่เป็นวันๆ หรือเปล่า"*

## Problem / Goal
The owner suspects that leave taken **through LINE** is captured **per day**, not per session. That matters
because **a student really can have two sessions on the same day** — his own plan modal on 2026-08-16 shows
`04/Oct/26 10:00` and `04/Oct/26 11:00`, and `11/Oct/26 10:00` and `11:00`.

If leave is recorded against a **day**, then for those students it is undefined which session was cancelled — and
every downstream number inherits the guess: which session is re-owed, how the course extends, the teacher's
schedule, the freelance draw, and the attendance figures. A parent tapping "แจ้งลา" is answering a question we
never asked precisely.

**Goal: every leave — LINE or staff-side — identifies exactly one session, and the parent knows which one they
just cancelled.**

## Requirement
1. **A leave is always recorded against one specific session** (date **and** time **and** teacher), never a date
   alone.
2. **In LINE, when the day holds more than one session for that student, the bot asks which one** — as tappable
   choices, never "type a number" (REQ-015's standing rule).
3. **The confirmation names the session that was cancelled** (date, time, teacher/program), so a wrong tap is
   caught immediately by the person who made it.
4. **A parent with several children is asked which child** if the tap is ambiguous — same rule, same reason.
5. Staff-side leave (plan editor / bookings) must obey requirement 1 as well, so both paths write the same thing.

## Acceptance Criteria
- [ ] **AC-1** — **Given** a student with exactly one session on the chosen day, **When** the parent takes leave in
      LINE, **Then** it is applied to that session and the reply names **its time and teacher**.
- [ ] **AC-2** — **Given** a student with **two** sessions on the same day (e.g. 10:00 and 11:00), **When** the
      parent takes leave in LINE, **Then** the bot **asks which session** with tappable options and applies the
      leave to **only the chosen one**; the other session is untouched.
- [ ] **AC-3** — **Given** a parent with two children who both have a session that day, **When** they take leave,
      **Then** they are asked **which child** before the session question.
- [ ] **AC-4 (negative)** — **Given** a session that is already cancelled, attended, or past the cut-off (REQ-047),
      **When** the parent tries to take leave on it, **Then** they get a clear reason and **nothing changes**.
- [ ] **AC-5 (regression)** — Quota, extension, re-owing, and the teacher's calendar behave exactly as they do
      today for the single-session-per-day case; only the ambiguous case changes.
- [ ] **AC-6** — The staff-side leave path records the same session-level identity (verifiable in the plan/history).

## User-facing wording (Porter as UX writer)
- Which child — TH: `ลาให้ใครคะ` · EN: `Which child?`
- Which session — TH: `วันนี้มี {n} คาบ ลาคาบไหนคะ` · EN: `There are {n} sessions that day — which one?`
- Option label — TH: `{time} น. · ครู{teacher} · {program}` · EN: `{time} · {teacher} · {program}`
- Confirmation — TH: `แจ้งลาแล้ว: {date} {time} น. ครู{teacher} — คาบนี้จะถูกเลื่อนไปต่อท้ายคอร์ส` ·
  EN: `Leave recorded: {date} {time} with {teacher} — this session moves to the end of the course.`
- Already-cancelled / past cut-off — reuse REQ-047's refusal wording; do not invent a second vocabulary.

## Constraints
- Taps, not typed numbers (REQ-015).
- No change to what a leave *does* to the plan (REQ-030's model stands) — this REQ fixes **which** session it does
  it to.

## Out of Scope
- The cut-off rule itself (**REQ-047**).
- Bulk leave ("we're away all next month") — if the owner wants it, it is its own requirement.

## Questions
- **Q1 (to SA — investigation, please answer before designing):** what does the LINE leave path record **today** —
  a session id, or a date it resolves later? If a student has two sessions that day, which one does it pick, and is
  the pick deterministic? Ground it in the code and say what you found; the owner's *"เหมือนมันจับแค่เป็นวันๆ"* is a
  suspicion, and I would rather publish "we checked, it was already session-level" than build a fix for a
  non-problem.
  > answer (Sober 2026-08-16): **Checked — already session-level.** Every leave path records a
  > **bookingId**, never a date. Web (`markSickLeave({id})`) acts on one booking. LINE `doLeave`: today's
  > CONFIRMED bookings → if >1 it **already shows a tappable picker** carrying each `bookingId`, then
  > `doLeaveBooking` authorizes + marks that one. Only backend entry is `PATCH /bookings/:id/status`. So
  > "10:00 vs 11:00 same day" is already disambiguated by taps. **What's missing is copy, not
  > correctness:** the picker label is `name + time` (no teacher/program) and the confirmation names only
  > student + make-up date, never *which* session was cancelled — which is why it *feels* day-level. Fix =
  > label + confirmation enrichment + a child-first step (SPEC-041 / TASK-135).
- **Q2 (to SA):** if it **is** day-level today, are there **existing** leave records whose session is ambiguous?
  If yes, tell Porter — that is a data question for the owner, not something to silently reinterpret.
  > answer (Sober 2026-08-16): **No ambiguous records exist** — every leave is a bookingId, so there is
  > nothing day-level to reinterpret; no data cleanup / DATA REQUEST needed.
- **Q3 (to owner):** when the parent picks the wrong session and re-taps, should the bot allow **undo** of a leave
  taken minutes ago, or must staff fix it? Porter's lean: staff fix it — an undo path is a new flow and the
  confirmation (AC-1..3) already makes mistakes visible.
  > answer: _pending_
