# TASK-178: Session note (`attendee_note`) — column, store, DTO, teacher LINE (REQ-068) (scheduler-back)

- Source: SPEC-063 (REQ-068). BE foundation — TASK-142 (cell) + TASK-179 (input) depend on the DTO.
- Status: REVIEW (Jason 2026-08-23). Next step: @Sober · unblocks @Fern
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**.

## Why a NEW column (Q3, decisive)
`bookings.note` is the system's **status-reason/audit** field — cancel/sick-leave/auto-extend write it
(`scheduler.service.ts:1595,1737,1927,1990,2031`). Sharing it would make a leave reason clobber the attendee note
and vice versa. ⇒ **new `bookings.attendee_note`**, kept entirely separate from `note`.

## What to build
1. **Migration:** `attendee_note text` (nullable) on `bookings`. Additive, hand-authored + journal-registered,
   `sid` first. No backfill.
2. **Validation:** accept `attendeeNote` on the booking create body + a per-session edit; **max ~200 chars** (zod).
3. **Store on all four booking types** at creation, and a **per-session edit** path used by manage-course that sets
   **only this booking's `attendee_note`** — never `note`, never another session (AC-3).
4. 🔴 **Editing/adding a note enqueues NO notification** (AC-8) — provable by an empty outbox in a test. It is not a
   status change; do not route it through any notify path.
5. **DTO:** `toBookingDTO` → `attendeeNote: string | null`, typed through `AppType`.
6. **Teacher LINE schedule** (`line-webhook.service.ts`, the REQ-067B builder): a session with an `attendee_note`
   shows it as an indented line under that session; a session without one is byte-identical to today (AC-4/AC-5).
   TH/EN; the cap/empty-state/quick-replies unchanged.

## Definition of Done
- [ ] Migration adds `attendee_note` (nullable); schema + ledger clean; `sid` first.
- [ ] AC-1/AC-2: the note stores on 1st Trial / 1 HR / course / voucher and via per-session edit; returned on the DTO.
- [ ] AC-3: editing one course session's note leaves the other sessions' `attendee_note` untouched (test).
- [ ] AC-8: adding/editing a note enqueues **nothing** (empty-outbox test).
- [ ] AC-4/AC-5: LINE shows the note when present, unchanged when absent; TH/EN; regressions (cap/empty/quick-reply) hold.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green. Owner runs the migration (`sid` first); you run nothing against a DB.

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-23).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **743/0** (+12).
- **`0022`** — nullable `attendee_note`; header records **why it is not `note`** (system's status-reason vs the
  family's note; two authors, one column would erase the other). Additive.
- **🔴 AC-8 made structural, not promised:** a **separate `PATCH /bookings/:id/note`** route (`api.ts:192`), NOT a
  field on the notifying move path — so a note edit *cannot* push LINE. And `attendee-note.test.ts` asserts at the
  **source** that `setAttendeeNote`'s body never enqueues/notifies, never writes `note:`/`status:`, and targets only
  `where(eq(bookings.id, id))` (AC-3). That's the strongest guard available without a DB, and Jason flags the
  DB-level limit honestly rather than letting 743-green imply more.
- DTO maps `attendeeNote` (`mappers.ts:109`); LINE shows an indented note when present, byte-identical when absent
  (string-equality asserted); `null` clears vs omitted-doesn't-touch.
- **Runsheet flag carried:** `0022` is **migration-BEFORE-code** (writing the column before it exists fails) —
  reverse of the recent ones. Queue: `0020 · 0021 · 0022` (+ backoffice `0006`) + REQ-065 flip SQL.

**Q1 (course seeds the note onto all its sessions at creation; per-session edit then changes one):** AC-3-correct,
**acceptable**. But a course-wide "who's coming" is conceptually a per-session thing, so → **TASK-179 guidance:**
either the course *creation* form omits the attendee-note (per-session only, via manage-course), or it labels a
creation note as "applies to all sessions initially" — so staff aren't surprised that editing one session leaves
the others saying the old thing. Non-blocking. **DONE — TASK-142 (re-cut) + TASK-179 unblocked.**

## Notes / Questions
(Jason fills in. `attendee_note` is distinct from `note` — never let a status flow write it, and never let a note
edit write `note`. The FE cell/input tasks (142/179) are one prop each once this DTO lands.)
