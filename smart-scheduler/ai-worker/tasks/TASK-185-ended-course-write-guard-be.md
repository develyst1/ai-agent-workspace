
## Implementation Notes
**Files:** `services/scheduler.service.ts` (`assertCourseWritable` + `assertBookingCourseWritable` + 6 call
sites) · `services/course-ended-writes.test.ts` (new, 11).

### The enumeration — walked from `routes/api.ts`, verdict per route
**44 write routes exist.** Every one is classified, and the classification is **machine-checked**: the test
reads the router, extracts every write route, and fails if any is missing from the verdict table — so a route
added next month that nobody thought about **fails by omission**. That is the only way an enumeration survives
the person who wrote it.

| route | verdict | why |
|---|---|---|
| `POST /courses/:id/extra-session` | **guarded** | 🔴 the money path — the owner's 3-minute break |
| `POST /bookings` (courseId set) | **guarded** | the chokepoint extras funnel through **and** a direct create-with-courseId |
| `POST /courses/:id/plan` | **guarded, loudly** | see below |
| `POST /courses/:id/plan/preview` | **guarded** | same applier (`dryRun`); a preview promising what the real call refuses is a lie |
| `PATCH /bookings/:id` (move) | **guarded** | relocating a forfeited slot is "revive" with a different verb |
| `PATCH /bookings/:id/status` | **guarded (reviving actions)** | `confirm`/`attend` only — see below |
| `POST /bookings/bulk-confirm` | **guarded by construction** | it *is* `confirm` in a loop |
| `PATCH /courses/:id` | **guarded** | only sets `adminUnlocked` — meaningless on a dead course, and a door to the plan paths |
| `POST /courses/:id/cancel` | its own `ALREADY_ENDED` | the double-cancel case, a different message |
| `PATCH /bookings/:id/note` | **allowed** | what a parent told us about a session that already happened |
| `PATCH /bookings/:id/badges` | **allowed** | a badge on a delivered session is a record, not a change |
| `POST /courses/:id/cancel/preview` | **allowed** | read-only, and it must still be able to say "already ended" |
| `POST /rentals` | **allowed — stated** | see the rental note below |
| 31 others | **unrelated** | cannot reach an existing course |

### The three judgement calls
1. **The plan path rejects LOUDLY.** `planCourseMovesForCourse` already returns no moves for an ended course —
   so without an explicit throw the route answers **200 "nothing changed"**, telling a staff member their leave
   was accepted when it wasn't. **A silent success on a dead course is its own lie.**
2. **Status transitions are enumerated by ACTION, not by route.** `confirm`/`attend` revive a forfeited session
   and let it consume quota or bill at day-end; `cancel`/`sick-leave` are deliberately **still allowed**,
   because they only move a session further from delivery and blocking them would trap a row in a state nobody
   can clear. Guarding the action is also what makes `bulk-confirm` covered **by construction** rather than by
   my remembering it.
3. 🔴 **`POST /rentals` is NOT guarded, and I want that read rather than assumed.** A rental's `refId` is
   opaque — the service never loads the booking — and a **standalone rental has no course at all**, so anyone
   wanting to bill equipment could simply omit `refId`. A course guard there would add a DB read to every
   rental while protecting nothing. Rentals bill for equipment actually handed over, not for the course. **If
   SA disagrees the fix is a booking lookup in `recordRental`; say so and I'll add it.**

**`COURSE_ENDED` ≠ `ALREADY_ENDED`.** One means "you tried to write to a dead course", the other "you cancelled
a course that was already cancelled". Collapsing them would make the message wrong in one of the two cases;
TASK-183 surfaces the new one.

**Testing the resulting state, per the DoD:** besides the router enumeration, each guarded path is asserted to
reach the guard **before** the thing that would do the damage — `addExtraSession` before `createBooking`,
`createBooking` before its transaction opens — and the **allowed** paths are asserted to *not* call it, so
"allowed" is a decision on record rather than an oversight.

⚠️ **The honest limit:** these are source-level and ordering assertions. Without a database I cannot execute
"ended course + POST extra-session → 409, zero rows". The guard is one shared function reached before any write
on every guarded path, which is the strongest statement available from here — and **Porter/Tanya can break it
in three minutes on `sid`, the same way the gap was found.**

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **795 pass / 0 fail** (+11). No
migration.

## Questions
- Q1: `POST /rentals` — allowed, reasoning above. Ratify or tell me to add the booking lookup.
- Q2: `PATCH /courses/:id` is refused outright rather than per-field (it only carries `adminUnlocked` today). If
  a future field is genuinely harmless on an ended course that becomes a per-field decision; flagging that I
  chose the strict reading now.

  > answer: (Sober)
