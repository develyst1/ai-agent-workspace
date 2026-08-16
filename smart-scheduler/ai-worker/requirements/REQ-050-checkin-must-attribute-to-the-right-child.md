# REQ-050: Check-in must land on the right child and the right session — audit first, then fix
- Status: READY_FOR_SA
- Priority: 🔴 **HIGH** — attendance consumes a paid session and draws freelance budget; a wrong attribution is money
- Requested: 2026-08-16 by stakeholder (owner)
- Deadline: none stated
- Source: owner, 2026-08-16 — *"การลาในไลน์ การเช็คอิน เก็บลงถูกคนจริงหรือไม่ หากมีลูกมากกว่าหนึ่งคน จะเป็นไง"*

## Problem / Goal
A LINE account belongs to a **parent**, not to a child. A parent with **two or more children** taps "เช็คอิน" — and
the system has to decide *which child* and *which session* that tap meant. The owner is asking whether it decides
correctly today, or quietly picks one.

**This is not a cosmetic concern.** Attendance is the event that (a) consumes a session from a paid course/voucher,
(b) draws the freelance teacher's budget, and (c) feeds the attendance and revenue figures. A check-in written
against the wrong child **takes a lesson from a family that did not use one** — and nobody notices, because both
records look perfectly normal.

**Goal: every check-in names one child and one session, chosen by the person tapping — never inferred.**
*(The leave half of the owner's question is **REQ-046**; this REQ is the check-in half. Same failure mode, same
family of fix — Sober may well want to design them together.)*

## Requirement
1. **Before anything is recorded, the tapping parent chooses the child** whenever more than one of their children
   could be meant.
2. **The session is identified exactly** (date · time · teacher · program) — never "today's session" when the child
   has two that day (the plan modal already shows real students with 10:00 **and** 11:00 on one date).
3. **The confirmation names what was recorded** — child, session, time — so a wrong tap is caught by the person who
   made it, immediately.
4. **Staff can correct a wrong check-in**, and correcting it must **release** whatever it consumed (session count
   and freelance draw) — a fix that leaves the money moved is not a fix.
5. Every path that records attendance obeys 1–3: LINE, the `/checkin?token=` link, staff screens, and anything
   REQ-051 adds.

## Acceptance Criteria
- [ ] **AC-1 (the reported worry)** — **Given** a parent with **two children who both have a session today**,
      **When** they tap เช็คอิน, **Then** they are asked **which child**, and only the chosen child's session is
      marked attended; the sibling's session is untouched.
- [ ] **AC-2** — **Given** a child with **two sessions on the same day**, **When** the parent checks in, **Then**
      they are asked **which session**, and only that one is marked.
- [ ] **AC-3** — **Given** any successful check-in, **When** the confirmation is sent, **Then** it names the
      **child and the session time**, not just "เช็คอินสำเร็จ".
- [ ] **AC-4 (negative)** — **Given** a session already attended, or outside the check-in window, **When** the
      parent tries, **Then** they get a clear reason and **nothing is written twice** (no double-consumption).
- [ ] **AC-5 (correction)** — **Given** a check-in recorded against the wrong child, **When** staff correct it,
      **Then** the wrongly-consumed session is **returned** and the freelance draw is **reconciled** — verifiable in
      the plan and the money figures.
- [ ] **AC-6 (regression)** — Single-child, single-session families see **no extra question** — the flow they use
      today does not grow a step.

## User-facing wording (Porter as UX writer)
- Which child — TH: `เช็คอินให้ใครคะ` · EN: `Who is checking in?`
- Which session — TH: `วันนี้มี {n} คาบ เช็คอินคาบไหนคะ` · EN: `There are {n} sessions today — which one?`
- Option label — TH: `{time} น. · ครู{teacher} · {program}` · EN: `{time} · {teacher} · {program}`
- Confirmation — TH: `เช็คอินแล้ว: {student} · {date} {time} น. · ครู{teacher}` ·
  EN: `Checked in: {student} · {date} {time} · {teacher}`
- Already checked in — TH: `คาบนี้เช็คอินไปแล้วค่ะ` · EN: `This session is already checked in.`
- Outside the window — reuse the existing check-in-window wording; do not invent a second phrasing.

## Constraints
- Taps, not typed numbers (REQ-015's standing rule).
- No change to the check-in **window** rule itself (that value belongs to REQ-031's settings work).

## Out of Scope
- The walk-in QR page (**REQ-051**) — but its check-in must obey requirement 5 of this REQ.
- Leave (**REQ-046**).

## Questions
- **Q1 (to SA — investigation, answer before designing):** what does a check-in resolve **today** for a parent with
  several children — does it ask, pick the first match, or pick by some rule? Ground it in the code and say what
  you found. As with REQ-046, I would rather publish *"we checked, it already asks"* than have the team build a fix
  for a problem that isn't there.
- **Q2 (to SA):** if it currently picks silently, **have wrong attributions already happened in real data?** Do not
  investigate the data yourself — tell Porter what query would answer it and I will put it to the owner as a DATA
  REQUEST. If families have been charged sessions they didn't use, that is a business conversation, not a bug fix.
- **Q3 (to owner, pending Q2):** if wrong check-ins are found in history, do you want them **corrected** (sessions
  returned, money reconciled) or left as-is with a note? Porter's lean: correct them — a family that lost a lesson
  did not agree to lose it.
  > answer: _pending_
