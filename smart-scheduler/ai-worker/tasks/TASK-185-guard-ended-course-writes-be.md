# TASK-185: An ended course must accept NO write that adds/revives a session or bills (REQ-036 Part B / B1) (scheduler-back)

- Source: REQ-036 Part B (owner broke it in 3 min; Porter 2026-08-25). 🔴🔴 **HIGHEST — this one touches money.** A
  cancelled course still accepted `เพิ่มคาบ (คิดเงิน)` and now carries a billable 25/Aug session ⇒ **a cancelled
  course can bill a family.** BE-only, no migration.
- Status: ✅ **BE DONE (Sober 2026-08-25)** — billing hole closed; enumeration is a machine-checked completeness test. Live re-break check → Tanya/owner on `sid`. → @Porter
- Repo: **smart-scheduler-back**.

## The gap (grounded, and it was MY miss)
The `endedAt` guards from TASK-181 protect the **plan computation** (`owedCount`/`insertable`/`reconcile` via
`isCourseEnded`) — the plan-insert path. They do **not** guard the **direct service write routes**. I said
"re-booking is already server-guarded"; that was true for the plan path **only**. Proof: `addExtraSession`
(`scheduler.service.ts:917`) loads the course and calls `createBooking(… SINGLE_SESSION, courseId)` **with no
`isCourseEnded` check** — a `SINGLE_SESSION` that **posts revenue at day-end once attended**. `isCourseEnded` is
currently consulted in exactly three places (the DTO, the preview, `endCourse`'s own ALREADY_ENDED). Every other
course-touching write is unguarded.

## The principle (this, not a fixed list)
**An ended course (`ended_at != null`) accepts no write that (a) adds a session, (b) revives a
cancelled/forfeited session onto the calendar, or (c) bills money.** A harmless annotation (a note, a badge on a
delivered session) may be allowed — but that is a **stated judgment per path**, not a default.

## What to do — enumerate from the ROUTER, not from this task
Porter's instruction, and mine: **walk every write route in `routes/api.ts` and decide each on the principle**
— do not trust the list below, it is a cross-check, not the source. For each course-touching write, either add the
guard (→ **`409 COURSE_ENDED`**, a new coded conflict, distinct from `ALREADY_ENDED` which is the double-cancel
case) **or** record in the task why it is harmless.

1. **One shared chokepoint.** A helper — `assertCourseWritable(courseId, exec)` (throws `conflict("COURSE_ENDED", …)`
   if `isCourseEnded`) — used everywhere, so the check is one behaviour and the next new route has an obvious thing
   to call. For booking-scoped routes, resolve the booking's `courseId` first (a `SINGLE_SESSION` soft-linked by
   `courseId` counts — that is the exact billing path).
2. **Cross-check list (verify each against the router yourself):**
   - `POST /courses/:id/extra-session` → `addExtraSession` — 🔴 **the money path, guard first.**
   - `POST /bookings` (`createBooking`) **when `courseId` is set** — the chokepoint `addExtraSession` funnels through;
     guarding here is defense-in-depth **and** catches a direct create-with-courseId.
   - `POST /courses/:id/plan` → `planChange` — the plan compute already no-ops when ended; make the **route reject
     loudly (409)** rather than silently returning 200 with no change (a silent success on an ended course is its
     own lie).
   - `PATCH /bookings/:id` → `moveBooking` — moving an ended course's session relocates a forfeited slot. Guard.
   - `PATCH /bookings/:id/status` → `updateBookingStatus` — a transition that **revives** (un-cancel, confirm,
     attend) an ended course's session can re-consume/re-bill. Guard the reviving transitions.
   - `PATCH /courses/:id` → `updateCourse` — editing an ended course's size/schedule. Guard (or justify a narrow
     allow).
   - `PATCH /bookings/:id/note` (`setAttendeeNote`), `PATCH /bookings/:id/badges` (`setBookingBadges`) — **likely
     allow** (annotation, no revive, no bill). **State the call**; don't guard reflexively.

## Definition of Done — test the RESULTING STATE, not just the action (Porter's lesson, and ours)
The Part-A rigour pass tested "does cancel break anything" and never "what can be done to the course afterwards".
This DoD fixes that:
- [ ] 🔴 **`addExtraSession` on an ended course → `409 COURSE_ENDED`, zero rows written, no `bo`/sale path reached**
      (assert at source: the guarded fn can't reach `createBooking`/`recordSale` for an ended course).
- [ ] **One test per guarded route**: ended course + that write → 409, nothing changed. This is the enumeration made
      provable — a route added later without the guard should make a "every course-write route rejects an ended
      course" test fail (if a table-driven test is feasible, prefer it so new routes are caught by omission).
- [ ] The allow-listed paths (note/badges, whatever you conclude) have a test that they **still work** on an ended
      course — so "allowed" is a decision on record, not an oversight.
- [ ] `COURSE_ENDED` is a distinct code from `ALREADY_ENDED`; the FE can tell "you cancelled a live course" from
      "you tried to write to a dead one" (TASK-183/B2 surfaces it).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green. No migration; no DB run by you.

## Notes / Questions
(Jason fills in. The enumeration is the deliverable as much as the guard — list every write route you checked and
the verdict for each, so the next reader can see nothing was skipped. If a route's course link is indirect
(booking → courseId), say how you resolved it.)

## Review — ✅ PASS (Sober 2026-08-25)
Reproduced: `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **795/0** (+11). Read the guard and the
enumeration test. This is stronger than the task asked for — accepting as-is.

- **The money hole is closed at the chokepoint.** `assertCourseWritable` (`:909`) + the booking-scoped twin; called
  in `createBooking` **before** `createBooking`'s own body/tx (`extra-session` funnels through it) — the enumeration
  test proves the *ordering* (`:107` guard-index < createBooking-index, `:113` < transaction), which is the right way
  to prove "no row, no sale" without a DB. The `COURSE_ENDED_MESSAGE` comment nails the SPEC-033 subtlety: an extra is
  invisible to the plan **engine**, not to the **money** — so the guard must see what the engine ignores.
- **The enumeration is a completeness test, not prose.** It reads `routes/api.ts`, and `:81` fails on any unclassified
  route while `:86` fails on a stale verdict — so it stays true after whoever wrote it moves on. It even handles the
  multi-line `.post(\n "…")` declaration (the exact omission class this task is about). That is the "test the resulting
  state / nothing skipped" lesson made mechanical.
- **REVIVING = {confirm, attend}, guarded by ACTION not route** (`:1973`) — so bulk-confirm is covered by construction,
  and cancel/sick-leave stay allowed (blocking them would trap a row nobody can clear). Correct.

### Q1 (rentals NOT guarded) — ACCEPT, your reasoning holds
A rental bills for **equipment handed over**, not for a course session; a standalone rental has no course, and `refId`
is opaque. Guarding it would add a per-rental read that protects nothing (anyone could omit `refId`). It is not a
course write. Leave it unguarded — and your escape hatch (a booking lookup in `recordRental` if we ever disagree) is
the right place if the owner later reports a rental billed against a dead course. Not now.

### Q2 (`PATCH /courses/:id` refused outright vs per-field) — ACCEPT outright
"Ended is ended." There is no field on an ended course a staffer needs to change (the end reason/note were set at
cancel; annotations go through the allowed note path). Outright refusal is simpler and can't leak a harmful edit;
per-field is speculative YAGNI. If the owner ever needs to correct a label on an ended course, relax it then.

### The one live check that must still run (Part-A's lesson, not skipped this time)
Source + ordering assertions can't execute "ended course + POST extra-session → 409, **zero rows written**" without a
DB. **That is the resulting-state test Part A missed — it must run live on `sid` before Part B is signed** (Tanya/owner,
~3 min, the same path the owner used to find the hole). Routed to @Porter. Everything else is DONE.
