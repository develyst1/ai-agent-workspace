
## Implementation Notes
**Files:** `drizzle/0022_booking_attendee_note.sql` (new) · journal idx 22 · `lib/migration-witness.ts` ·
`db/schema.ts` · `validation.ts` · `services/scheduler.service.ts` (3 create sites + `setAttendeeNote`) ·
`routes/api.ts` (new route) · `db/mappers.ts` + `types/contract.ts` · `lib/line-schedule.ts` ·
`services/line-webhook.service.ts` · tests: `services/attendee-note.test.ts` (new, 7) · `line-schedule` (+4) ·
`mappers` (+1).

**1. `0022`** — one nullable `attendee_note`, no back-fill (nothing to derive one from). The migration's header
records **why it is not `note`**, because that is the decision a future reader will want to undo.

**2. 🔴 A separate ROUTE, not a field on `PATCH /bookings/:id`.** The move path re-times a session and tells the
teacher about it; a note is not a status change, so routing the note through it would have made *"fix a typo"*
push a LINE message. `PATCH /bookings/:id/note` exists precisely so AC-8 is structural rather than a promise.

**3. AC-8 and AC-3 are asserted at the source, deliberately.** `services/attendee-note.test.ts` reads
`setAttendeeNote`'s own body and fails if it contains `enqueue`/`notify`/`outbox`, if it writes `note:` or
`status:`, or if it targets anything other than `where(eq(bookings.id, id))`. *"We didn't call notify"* is true
the day it is written and quietly stops being true when someone later routes note edits through the move path
"for consistency" — and a push to a teacher because of a typo fix is not something the suite would otherwise
notice. I could not write the DB-level AC-3/AC-8 tests without a database; this is the strongest guard I can
give from here, and I would rather say that plainly than let a green suite imply an end-to-end proof.

**4. `null` clears, an omitted field does not** — the zod body requires the key. Clearing a note is an edit and
must be expressible; a `.optional()` there would have made "clear this" indistinguishable from "don't touch it".

**5. Course creation carries one note onto every session it creates**, and the per-session edit then changes
exactly one. That matches how the note reads ("แพ้ถั่ว" is about the child, not about a Tuesday) while leaving
the per-session override the requirement asks for.

**6. LINE:** the note is indented under its own session; a session **without** one is byte-identical to before
(AC-5) — asserted by string equality, including a whitespace-only note. Almost every session has none, and a
placeholder on all of them would cost more attention than the feature is worth.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **743 pass / 0 fail** (+12). ⚠️ **I ran nothing against a
database.** **Owner-run: `0022`, `sid` first.** Until applied, the column is absent and every write of it fails —
so this deploys **code after migration**, not before.

**DoD:** column + witness ✅ · stores on all four types + per-session edit ✅ · AC-3 one column, one booking
(source-asserted) ✅ · AC-8 no notify path (source-asserted) ✅ · DTO + `AppType` ✅ · LINE shows it, unchanged
when absent, TH/EN, cap/empty/quick-replies pinned ✅ · tsc/test ✅.
**@Fern — `booking.attendeeNote` is on the wire and `PATCH /bookings/:id/note` takes `{ attendeeNote }`;
TASK-142 and TASK-179 are one prop and one call.**

## Questions
- Q1: a course's note is copied onto **every** session at creation. The alternative — store it once on the
  course — would make "the note for this Tuesday" impossible without a second concept. But it does mean editing
  the note on one session leaves the other nine saying the old thing, which is *correct* per AC-3 and may still
  surprise staff. Worth a word in TASK-179's copy; flagging rather than deciding it for Fern.

  > answer: (Sober)
