# REQ-049: When a customer takes leave, notify the admin — and the teacher, if the school says so
- Status: READY_FOR_SA
- Priority: **HIGH** — a coach who isn't told still shows up; this is the same cut-off conversation as REQ-047
- Requested: 2026-08-16 by stakeholder (owner), from the same customer meeting
- Deadline: none stated
- Source: owner, 2026-08-16 — *"ลูกค้าลา ต้องแจ้งแอดมินและครู สามารถตั้งค่าได้ว่า แค่แอดมิน หรือ ทั้งแอดมินทั้งครู"*

## Problem / Goal
A parent cancels through LINE and the session simply disappears from the plan. **Nobody is told.** The admin finds
out from the calendar if they happen to look; the coach can travel to the centre for a student who is not coming.
The customer asked for notification, and — sensibly — asked to **choose how far it goes**, because some schools
want the coach told directly and others want every message to pass through the office.

**Goal: a leave produces a notification, and the school decides who receives it.**

## Requirement
1. **When a leave is taken, a notification is sent** naming the student, the session (date · time · teacher ·
   program) and who took it (parent via LINE / admin).
2. **A setting controls the recipients**, with exactly two values in the school's own words:
   - `แจ้งแอดมินอย่างเดียว` / `Admin only`
   - `แจ้งทั้งแอดมินและครู` / `Admin and teacher`
   The setting lives on **REQ-031's settings screen** — not a constant, not a DB row without a screen.
3. **The teacher notified is the teacher of that session**, not the course's original teacher (they can differ
   after a REQ-030 plan edit).
4. **A notification never blocks the leave.** If sending fails or a teacher has no LINE link, the leave still
   stands and the failure is visible to staff — never a silent drop.
5. **Staff-initiated cancellations follow the same setting**, so a coach's information doesn't depend on which
   door the cancellation came through.

## Acceptance Criteria
- [ ] **AC-1** — **Given** the setting is `Admin only`, **When** a parent takes leave in LINE, **Then** the admin
      is notified with student · date · time · teacher · program, and **the teacher receives nothing**.
- [ ] **AC-2** — **Given** the setting is `Admin and teacher`, **When** the same leave happens, **Then** **both**
      are notified, and the teacher's message names the student and the freed slot.
- [ ] **AC-3** — **Given** a session whose teacher was changed by a plan edit, **When** leave is taken on it,
      **Then** the notification goes to **the session's current teacher** (AC-3 is the one people get wrong).
- [ ] **AC-4 (unhappy path)** — **Given** a teacher with no LINE link (or a send failure), **When** leave is taken,
      **Then** the leave still succeeds, and the failure is **visible to staff** with enough detail to act on.
- [ ] **AC-5** — **Given** an **admin** cancels the session on a staff screen, **When** the setting is
      `Admin and teacher`, **Then** the teacher is notified the same way (requirement 5).
- [ ] **AC-6 (no spam)** — **Given** one leave, **Then** exactly **one** message per recipient — retries or a
      re-save must not produce duplicates.
- [ ] **AC-7 (bilingual)** — Messages render in TH and EN per the recipient's language, with no raw i18n key.

## User-facing wording (Porter as UX writer)
**To the admin**
- TH: `แจ้งลา: {student} · {date} {time} น. · ครู{teacher} · {program} — แจ้งโดย {by}`
- EN: `Leave: {student} · {date} {time} · {teacher} · {program} — reported by {by}`

**To the teacher**
- TH: `{student} ลาคาบ {date} {time} น. ({program}) — ช่วงเวลานี้ว่างแล้วค่ะ`
- EN: `{student} has cancelled {date} {time} ({program}) — that slot is now free.`

**Settings screen**
- Label — TH: `แจ้งเตือนเมื่อมีการลา` · EN: `Notify on leave`
- Options — TH: `แจ้งแอดมินอย่างเดียว` · `แจ้งทั้งแอดมินและครู` — EN: `Admin only` · `Admin and teacher`
- Help — TH: `เลือกว่าเมื่อผู้ปกครองแจ้งลา ระบบจะแจ้งใครบ้าง` ·
  EN: `Choose who is notified when a parent cancels a session.`

## Constraints
- Uses the existing LINE/notification path (REQ-015/016) and **REQ-031's** settings mechanism + screen — no second
  notification system, no second settings system.
- ⚠️ **Testing constraint, stated deliberately:** this feature sends messages to **real teachers**. Tanya's charter
  forbids notifying real recipients, and the board already records the teacher-change dual-LINE case as excluded
  from production testing for exactly this reason. **The SPEC must therefore include a way to verify it without
  messaging real people** (test recipients / a dry-run / a log-only mode). If that is not designed in, this REQ is
  effectively untestable and I would rather know now than at test time.

## Out of Scope
- Notifying the **parent** back (their own confirmation is REQ-046's).
- Notifying on anything other than a leave/cancel (attendance, bookings, reschedules).
- A digest/summary variant — see Q2; today's 08:00 digest (REQ-023) is a different product.

## Questions
**All three answered by the owner, 2026-08-16: *"เอาทั้งคู่ ตามที่แนะนำ"* — every Porter recommendation accepted.**
- **Q1 — who is "the admin":** the **existing admin channel REQ-023's digest already uses.** No second address
  book, no new list to maintain, and it inherits whatever already works for the digest.
- **Q2 — immediate, not folded into the 08:00 digest.** A leave for today's 10:00 session is worthless in
  tomorrow's summary; that is the whole point of the REQ.
- **Q3 — a late leave reads the same as any other.** The timestamp already tells the coach it was last-minute;
  a second tone of voice for the same event is more vocabulary for no gain.
> Note for the SPEC: with Q2 = immediate, **AC-6 (exactly one message per recipient) is the risk to design for** —
> retries, a re-save, or a staff cancel that follows a parent's cancel must not each produce a message.
- **Q4 (to SA — investigation):** what is sent **today** when a session is cancelled — anything at all, to anyone?
  Ground it in the code before designing, so we extend what exists rather than building a parallel path.
