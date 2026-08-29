# TASK-201: Confirm a whole course — bulk PENDING→CONFIRMED + ONE summary LINE (REQ-072 parts 1–2) (scheduler-back)

- Source: Porter's "REQ-072 Confirm-whole-course" (2026-08-25 log §3; no REQ file — his numbering). 🟠 MEDIUM–HIGH —
  **likely unblocks REQ-062** (the picker filters `CONFIRMED`, course sessions are born `PENDING`; `uat` PENDING 532 ·
  CONFIRMED 15). BE-only, no schema. On `develop`.
- Status: ✅ **BE code DONE (Sober 2026-08-28)** — draw-in-loop + one-enqueue-outside (outbox==1 by shape), no updateBookingStatus, attendeeNote-not-course.note caught. tsc 0·868/0. 🔴 sid outcome (PENDING→0, outbox==1) UNVERIFIED until owner/Tanya run it. Unblocks @Fern (TASK-202).
- Repo: **smart-scheduler-back**.

## What it is (Porter)
One action confirms **all** of a course's `PENDING` sessions at once + sends **one** LINE summary. Parts:
1. Bulk `PENDING → CONFIRMED` for a course.
2. **One** LINE message: course · start date · schedule (weekday/time) · planned leaves · note.
3. *(NOT this task — sized separately, TASK-203)* a LINE on the start date when there's a class that day.

## The design crux — ONE summary LINE, not N per-session pings
`bulkConfirm(ids)` loops `updateBookingStatus(id,"confirm")`, and **each confirm enqueues its own teacher LINE**
(`scheduler.service.ts:2089`). Passing a course's session ids to it would spam the teacher with one message per session.
REQ-072 wants a **single course-summary** LINE. So:
- **`POST /courses/:id/confirm`** — in one tx, confirm every `PENDING` COURSE_PACKAGE session of the course: set
  `status=CONFIRMED` + `confirmedAt`, **do the per-session freelance draw** (the money side effect must still happen,
  same as a single confirm), and **skip already-CONFIRMED** sessions (idempotent). **Suppress the per-session LINE**
  on this path.
- **Then enqueue exactly ONE LINE** (to the **teacher**, matching the existing confirm→teacher pattern) summarising the
  course: program · student · start · weekday+time · the count confirmed · any planned-leave (`SICK_LEAVE`) sessions ·
  the course note. Bilingual template via the existing LINE builder; the outbox row carries the courseId so the worker
  can enrich (mirror TASK-136's booking-carrying outbox).
- Return `{ confirmed: N, skipped: M, course }`. A session that can't confirm (e.g. `INSUFFICIENT_BUDGET` freelance
  over-cap) is **reported, not silently dropped** (reuse `bulkConfirm`'s per-item outcome shape) — and if any fail,
  say so in the response so the FE can surface it.

## ⚠️ Consequence the owner has ACKNOWLEDGED (state it in the code, don't re-litigate)
A `CONFIRMED` session nobody marks **auto-attends at day-end and consumes quota** (REQ-070, his own design).
Bulk-confirming a course **arms that for every session in it.** The owner has confirmed he wants this. Leave a comment
at the endpoint noting it so the next reader doesn't "fix" it.

## Definition of Done — verify the OUTCOME (the lesson)
- [ ] `POST /courses/:id/confirm` flips **every** PENDING course session to CONFIRMED (assert the resulting **count**,
      not just that the call returns 200), skips already-confirmed (idempotent — second call confirms 0), freelance
      draw happens per newly-confirmed session.
- [ ] **Exactly ONE** LINE row is enqueued for the whole course (assert the outbox count == 1, carrying the courseId) —
      **not one per session.** Absent-teacher-LINE writes a SKIPPED row as usual.
- [ ] A session that fails to confirm is reported in the response, not dropped.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green. Pure summary-builder unit-tested.

## Notes / Questions
(Jason fills in. Recipient = teacher unless you find the existing confirm LINE goes elsewhere — say which. If suppressing
the per-session LINE cleanly means a small refactor of `updateBookingStatus`'s enqueue (a `notify:false` option vs a
separate confirm-core), pick the one that doesn't change single-confirm behaviour and say why. FE button = TASK-202.)

## Implementation Notes
**Files:** `services/scheduler.service.ts` (`confirmCourse`) · `routes/api.ts` · `lib/line-message.ts`
(`course_confirmed`) · `lib/line-i18n.ts` (7 keys + the 7 weekday names) ·
`lib/line-message.test.ts` (+6) · `services/course-ended-writes.test.ts` (+8, incl. the route classification).

**Your question answered: I did NOT add `notify:false` to `updateBookingStatus`.** That function is the app's
most-used write path, and threading a transaction *and* a suppression flag through it to serve one caller
would put **every single-session confirm** at risk for a feature that does not touch them. `confirmCourse`
instead reuses the **pieces** — the status write, `issueCheckinToken`, `reconcileBookingHolds` — inside one
transaction. **Single-confirm behaviour is byte-identical after this task**, and there is a test asserting
`updateBookingStatus` is not called here.

**Recipient = teacher**, matching the existing confirm→teacher pattern (`booking_confirmed` enqueues to the
teacher's `lineUserId`); nothing on the confirm path goes to a parent today.

**The ledger stays per-session; only the message is collapsed.** `reconcileBookingHolds` runs inside the loop,
so a course confirm draws exactly what ten single confirms would draw — collapsing the ledger the way the
notification is collapsed would silently under-charge a freelance teacher's budget. A test pins that the draw
is inside the loop and the enqueue is outside it, because **that ordering is the feature**.

**The message carries its own data.** No `bookingId` on the outbox row: a course summary is not a fact about
any one session, and pointing it at an arbitrary one would have the worker enrich it with that session's
details and quietly contradict the summary. Weekday renders **in words** ("อาทิตย์ 10:00"), never as `0`.
Planned leaves appear **only when there are some** — a "0" reads as a problem to a teacher scanning the message.

**🔴 One thing the REQ's wording would have led me to get wrong:** it asks for "the course note", and **there is
no `course.note` column** — I checked instead of assuming. The course-level note staff actually write is
TASK-178's `attendeeNote`, set once at creation and carried onto every session. `course.note` would have
**compiled** (the row is `any`) and silently sent an empty line forever — the same compiler-silent class as the
mapper omissions.

**Failures are reported, not dropped** (`INSUFFICIENT_BUDGET` and friends are `ApiException`s thrown before any
write, so the transaction stays usable), and a **non-**`ApiException` is rethrown: a half-written course confirm
is worse than none. Confirming 0 sends nothing — "confirmed 0 sessions" trains a teacher to ignore the message
that matters.

**The REQ-070 consequence is recorded at the endpoint** (a CONFIRMED session nobody marks auto-attends at
day-end and consumes quota — the owner's own design, acknowledged), with a test asserting the comment is there
so the next reader does not "fix" it.

**📌 The TASK-185 completeness test caught this route too**, by omission, before I classified it — third time
this month. `POST /courses/:id/confirm` is `guarded`: confirming is a reviving write, so it goes through
`assertCourseWritable` like every other one.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **868 pass / 0 fail** (+14).
No migration.

### ⛔ The DoD is an outcome, and two of its lines need the box
"**The count flipped**" and "**the outbox is 1, not N**" are database facts. What I can prove from here is the
*shape that makes them inevitable* — one enqueue, outside the loop; the draw inside it — and I have. **@Porter /
@Tanya on `sid`:** confirm a course, then check (a) its PENDING count goes to 0, and (b) `notification_outbox`
gains **exactly one** row for it, not one per session. **If it gains N, stop — that is the whole feature.**

## Questions
- Q1: `plannedLeaves` counts existing `SICK_LEAVE` sessions on the course. On a brand-new course that is always
  0; it earns its place when a course is confirmed *after* leaves were entered. Say if you'd rather it were
  dropped from the message entirely.
- Q2: I send **only to the teacher**. The parent gets nothing on course confirm today (no existing path does).
  If REQ-072 intends the parent too, that is a second recipient and a second template — flagging, not guessing.

  > answer: (Sober)

  > **A (Sober): Q1 keep · Q2 teacher-only, accept.** Q1 — keep `plannedLeaves`; it's already conditional (shown only
  > when >0, so no misleading "0"), and it earns its place exactly on the confirm-after-leaves case. Q2 — teacher-only is
  > correct: it matches the existing confirm→teacher pattern and no parent-LINE path exists on confirm today. A parent
  > notification would be a second recipient + template = a **new owner decision**, not a guess to fold in here — flagged
  > to @Porter, not built.

## Review — ✅ code PASS (Sober 2026-08-28)
Reproduced tsc 0 · `bun test` **868/0** (+14). Verified the outcome-**shape**, not just the code path: the freelance
draw (`reconcileBookingHolds`) is **inside** the pending-loop (per-session ledger, never under-charged) and `enqueueLine`
is **outside** it (one course-summary row, no `bookingId` — a summary isn't a per-session fact). `confirmCourse` reuses
the pieces rather than threading a `notify:false` through `updateBookingStatus` (single-confirm stays byte-identical,
asserted). The `course.note`-doesn't-exist catch (→ `attendeeNote`) is exactly the verify-don't-assume discipline —
`course.note` would have compiled on an `any` row and sent an empty line forever. REQ-070 consequence commented + tested;
the route is `guarded` (confirm is a reviving write), caught by the TASK-185 completeness test.
**Held to the lesson:** the real-data outcome (sid: PENDING→0, `notification_outbox` +1 exactly) is the owner/Tanya
check — I am NOT confirming it from code. If it enqueues N, that's the whole feature broken; stop.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-201 | scheduler-back (BE): **REQ-072 parts 1–2** — `POST /courses/:id/confirm`: bulk PENDING→CONFIRMED for a whole course in one tx + **exactly ONE** teacher LINE summary (not one per session). | SPEC-066 (REQ-072) | 🔎 **REVIEW** (Jason 2026-08-28 — **did NOT add `notify:false` to `updateBookingStatus`**: it is the app's most-used write path, and threading a tx + a suppression flag through it for one caller would risk **every single-session confirm** for a feature that doesn't touch them. `confirmCourse` reuses the **pieces** (status write · `issueCheckinToken` · `reconcileBookingHolds`) in one tx; a test asserts `updateBookingStatus` is never called here, so single-confirm is byte-identical. 🔴 **The ledger stays per-session; only the message collapses** — the draw is INSIDE the loop, the enqueue OUTSIDE it, and a test pins that ordering because it IS the feature (collapsing the ledger too would silently under-charge a freelance budget). Message carries its own payload (no `bookingId` — a course summary isn't a fact about one session; enriching from one would contradict the summary), weekday rendered **in words**, planned-leave line shown only when non-zero. 🔴 **The REQ's wording would have made me get one thing wrong**: it says "the course note" and **there is no `course.note` column** — I checked; the real one is TASK-178's `attendeeNote`. `course.note` would have **compiled** (row is `any`) and sent an empty line forever. Failures reported not dropped; non-`ApiException` rethrown (a half-written course confirm is worse than none); confirming 0 sends nothing. REQ-070 auto-attend consequence recorded at the site + test. 📌 **TASK-185's completeness test caught this route too, by omission — third time this month.** tsc 0 · **868/0** (+14), no migration. ⛔ **DoD is an outcome**: @Porter/@Tanya on `sid` — PENDING count → 0 and the outbox gains **exactly one** row, not N. **If it gains N, stop.** Q1 `plannedLeaves` on a new course is always 0; Q2 teacher-only recipient — parent would be a second template, flagged not guessed.) | Sober | — |
```
