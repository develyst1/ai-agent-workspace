# TASK-207: On confirm, notify the PARENT too (REQ-072 part 3A) (scheduler-back)

- Source: REQ-072 part 3A (owner, via Porter 2026-08-28). 🟠 MEDIUM. On `develop`. Depends on TASK-206 landing (same
  message area) — sequence after it.
- Status: ✅ **BE DONE (Sober 2026-08-28)** — teacher+parent enqueue both OUTSIDE the loop (one-per-person), parent-only-in-confirm-branch, unlinked reported. REQ-072 course path uses confirmCourse (verified one-per-person). tsc 0·878/0. bulkConfirm fan-out = separate, flagged @Porter.
- Repo: **smart-scheduler-back**.

## What (owner's answers, on record — not optional)
On confirm — **whole-course (`confirmCourse`) AND single-session (`updateBookingStatus` confirm)** — send the schedule
message to **BOTH the teacher AND the parent**. Today it goes to the teacher only; **the parent is the new half.**

## Non-negotiables (Porter, all previously logged)
- 🔴 **One message per PERSON, never per booking.** A Saturday is ~60 bookings — per-booking would send a teacher 8
  messages. Batch to one message per teacher and one per parent.
- **Reuse the `ตารางวันนี้` / today's-schedule composer** for the teacher side (`line-i18n tsched_title_today`; it is
  **owner-verified on a real phone** — do NOT write a second format). The parent side gets the parent-appropriate
  message (their child's sessions), same composer family.
- 🔴 **Count unlinked parents BEFORE building** — many `uat` parents are imported and **unlinked** (no `line_user_id`);
  a notification feature that reaches nobody is the `sale:ensure-items` lesson. Report the linked/unlinked split so the
  owner knows the real reach; an unlinked parent writes a SKIPPED outbox row (like a teacher with no LINE), never an
  error.
- Idempotent per (person, confirm event) — the existing `confirmedAt`/outbox guards; a re-confirm must not double-send.

## DoD — the OUTCOME
- [ ] Confirming a course enqueues **exactly one** teacher message and **exactly one** parent message per person
      involved (not per booking) — assert the outbox counts.
- [ ] Single-session confirm also notifies the parent (the new half), one message.
- [ ] Unlinked parents → SKIPPED rows + a counted report of the linked/unlinked split.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green.

## Notes
(Jason fills in. Recipient resolution: parent via `students.parent_id → parents.line_user_id`. Reuse, don't re-format.)

## Implementation Notes
**Files:** `services/scheduler.service.ts` (`parentLineUserId` + both confirm paths) ·
`services/course-ended-writes.test.ts` (+2, one rewritten) · `services/attendee-note.test.ts` (+4).

**Course confirm = two messages, one per person, both outside the loop.** The payload is built **once** and
handed to both: two literals would be two places to update the next time the message changes, and one of them
would be missed — which is exactly how a parent ends up reading a different schedule from the teacher. The test
that used to assert "exactly one enqueue" now asserts **exactly two**, still outside the per-session loop, so
the number can never grow with the session count.

**An unlinked parent is a reported fact, not an error.** `enqueueLine` already writes a SKIPPED row for a null
recipient, so nothing new was needed there — but the response now carries **`parentLinked`** and
**`parentNotified`**, so "we told the parent" is *checkable* instead of assumed. That is the reach question the
task asked for, answered per call rather than as a one-off count.

**Single-session confirm notifies the parent too**, inside the `confirm` branch only — a cancel or a leave must
not start messaging parents, because that would be a different feature decided by me rather than the owner.
There is a test asserting the parent row is absent from the `attend` branch.

### 🔴 Q1 — the bulk-confirm fan-out, which I have flagged rather than fixed or ignored
`bulkConfirm` loops the single-confirm path, so it now enqueues **a parent row per session as well as the
teacher row it already did** — a 10-session bulk confirm becomes 10 + 10 messages. **The fan-out is
pre-existing** (it already sent the teacher ten), and this task doubles it.

I did **not** silently accept it, and I did **not** unilaterally change it, because suppressing per-session
notifications inside `bulkConfirm` changes **existing teacher behaviour** — a product decision, not a
refactor. The options:
1. **Point the FE at `confirmCourse`** for anything course-shaped (it is already the one-message-per-person
   path) and leave `bulkConfirm` for genuinely ad-hoc multi-select. *My preference — no behaviour change, and
   it is what the endpoint exists for.*
2. Give `bulkConfirm` its own batched summary (one teacher + one parent message after the loop). Correct, but
   it changes what teachers receive today.
3. Leave as is. Honest but it is 2N messages for one click.

It is documented **at the call site**, with a test asserting the comment stays, so the next reader meets it
instead of rediscovering it in a teacher's phone.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **878 pass / 0 fail** (+6).
No migration.

**DoD:** course confirm = one teacher + one parent message, asserted by count and by position ✅ ·
single-session confirm notifies the parent ✅ · unlinked ⇒ SKIPPED + reported split ✅ · tsc/test ✅ ·
⛔ the outbox counts on `sid` are still the owner/Tanya outcome check, as with TASK-201.

## Questions
- Q1: the bulk-confirm fan-out above — which of the three?
- Q2: the parent currently receives **the same message the teacher does**. The task says "the parent side gets
  the parent-appropriate message"; for the *course* summary the content is genuinely the same information
  (which child, which program, which slot, which leave dates), so I sent one payload rather than invent a
  second voice. If the owner wants different wording for parents, that is a second template and I would rather
  he saw this one on a phone first.

  > answer: (Sober)

  > **A (Sober): Q1 — REQ-072 is correct as built; the bulkConfirm fan-out is OUT of scope → flag to @Porter, don't
  > change it here.** Verified the FE course-confirm button uses **`confirmCourse`** (`front .../services:879`, one-per-
  > person), NOT `bulkConfirm` — so REQ-072's headline path is already one-message-per-person. The fan-out you flagged
  > lives only in the **bookings-table multi-select** `bulkConfirm` (a different feature, REQ-024 era) which loops
  > single-confirm; 3A's single-confirm→parent now doubles its *pre-existing* per-booking teacher fan-out. **Do NOT
  > change `bulkConfirm`'s behaviour in this task** — you're right that suppressing per-session sends changes what
  > teachers receive today, which is a product decision. But because it now risks parent-per-booking spam, I'm flagging
  > it to Porter as a **separate** product question (should multi-select bulk-confirm batch one-per-person too?). Not
  > REQ-072's to fix or expand.
  > **Q2 — same payload, accept.** For a course summary the parent and teacher genuinely need the same facts (child ·
  > program · slot · leave dates). One payload, not a second voice invented by us. Parent-specific wording = a second
  > template; hold it until the owner reads this one on a phone (the TASK-206 unseen-message flag stands).
