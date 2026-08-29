# TASK-219: The single-booking confirm LINE must carry the session note (REQ-007 missing half) (scheduler-back)

- Source: owner (via Porter, 2026-08-29) — proved by use. 🟠 MEDIUM — REQ-007's **useful** half (a note like
  *"คุณยายมารับ 16:00"* matters to the teacher **on the day of that class**). On `develop`. No schema.
- Status: ✅ **BE code DONE (Sober 2026-08-29)** — `attendeeNote` set on the booking_confirmed payload (`:2148`) → template renders it, `line()` omits when absent; both cases + round-trip tested. tsc 0·943/0. 👀 on-phone look at deploy.
- Repo: **scheduler-back**.

## The gap
Course-confirm carries the note (`confirmCourse` → `note: rows[0]?.attendeeNote`), but **the single-booking confirm LINE
does not.** Owner's proof: a booking with note `asdawdwada` produced *"📅 ยืนยันตารางสอน · นักเรียน · วิชา · เวลา"* — **no
note line.** The `booking_confirmed` template (`lib/line-message.ts:28`) and the confirm-branch `enqueueLine` payload
(the `updateBookingStatus` `confirm` path) both omit `attendeeNote`.

## Fix
- Add the booking's **`attendeeNote`** to the `booking_confirmed` enqueue payload (the confirm branch in
  `updateBookingStatus`), and render it as a line in the template — **mirror `course_confirmed`'s note handling**.
- 🔴 **Omit the line entirely when there is no note** — do not print an empty label (a blank line is a defect, per the
  owner). Byte-identical message when the note is absent.

## DoD — the OUTCOME (the message a human reads)
- [ ] A single-booking confirm with a note renders a note line with that text; a confirm with no note renders **exactly**
      today's message (no empty label) — assert the rendered STRING both ways (the note-present and note-absent cases).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green.
- [ ] 👀 On-phone look when deployed (owner/Porter) — the LINE message is judged on a phone, like REQ-067B.

## Notes
(Jason fills in. Same `attendeeNote`-not-`course.note` field TASK-201 used. This closes REQ-007 — the note now reaches
the teacher on the confirm that matters, the day's own booking.)

## Implementation Notes
**Files:** `lib/line-message.ts` (`booking_confirmed`) · `services/scheduler.service.ts` (one payload, both
recipients) · `lib/line-message.test.ts` (+5) · `services/attendee-note.test.ts` (+2).

**The note now travels in the payload, not from the enriched context** — the same choice `course_confirmed` and
`sick_leave` already make. The worker builds `ctx` from the booking row the outbox references, so a note read
from there would vanish if that row were later edited or deleted; a message about a moment should carry the
moment's facts.

**One payload object, sent to teacher and parent.** Two literals would be two places to update, and one would
be missed — that is how a parent ends up reading a different confirmation from the teacher. There is a test
asserting exactly two `payload: confirmPayload` uses and **no** remaining inline literal.

**Omitted when empty, and I widened that past the task:** the line is absent for `undefined`, `null` **and**
`""`. An empty-string note is what an FE field that was focused and cleared actually sends, and *"หมายเหตุ:"*
with nothing after it reads as a note the teacher failed to receive — worse than no line.

**The tests assert the rendered STRING both ways**, per the standing lesson: a payload field that is present
and unrendered looks identical to one that was never sent, which is exactly the shape of the bug the owner
found by typing `asdawdwada` and getting a confirmation without it.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **943 pass / 0 fail** (+7).
No migration.

**DoD:** note rendered when present, line absent when not, both asserted on the rendered message ✅ · mirrors
`course_confirmed` ✅ · tsc/test ✅ · 👀 **on-phone look at deploy** — this message and TASK-206's confirm
summary are still both unseen on a real device.

## Questions
- Q1: the parent now gets the note too (it is one payload for both). For a note like *"แพ้ถั่ว"* that is
  simply the parent's own information coming back — but if a staff note is ever meant to be teacher-only, that
  is a second payload and worth deciding **before** somebody writes something internal in that box.

  > answer: (Sober)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-219 | scheduler-back (BE): **REQ-007's missing half** — the attendee note reaches the teacher on the **single-booking** confirm LINE (course-confirm already carried it; the owner proved this one didn't). | SPEC-066 | 🔎 **REVIEW** (Jason 2026-08-29 — the note travels **in the payload**, not from the enriched context: the worker builds `ctx` from the row the outbox references, so a note read from there vanishes if that row is later edited or deleted — a message about a moment should carry the moment's facts (same choice `course_confirmed`/`sick_leave` already make). **ONE payload object for teacher and parent**, with a test asserting exactly two uses and no inline literal left — two literals are two places to update and one gets missed, which is how a parent reads a different confirmation from the teacher. **Omission widened past the task**: absent for `undefined`, `null` **and** `""` — an empty string is what a focused-then-cleared FE field actually sends, and "หมายเหตุ:" with nothing after it reads as a note the teacher failed to receive. Tests assert the **rendered string both ways**, since a payload field that is present and unrendered looks identical to one never sent — exactly the bug the owner found by typing `asdawdwada`. tsc 0 · **943/0** (+7), no migration. 👀 **on-phone look at deploy** — this and TASK-206's summary are both still unseen on a real device. Q1: the parent now gets the note too (one payload); fine for "แพ้ถั่ว", but if a staff note is ever meant to be teacher-only that is a second payload — worth deciding **before** someone writes something internal in that box.) | Sober | — |
```
