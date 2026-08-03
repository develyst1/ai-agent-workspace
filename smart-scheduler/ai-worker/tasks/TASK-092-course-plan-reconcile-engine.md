# TASK-092: scheduling (BE) — the course-plan reconcile engine (`planCourseMoves` + `reconcileCoursePlan`)
- Source: SPEC-028 §1–§2 (REQ-030)
- Status: REVIEW
- Depends on: none (critical path — everything else builds on this)
- Assignee: @Jason (smart-scheduler-back)

## What to build
The `size`-target reconcile — the analog of TASK-091's `planHoldMoves`. A course **owes `size` teachable
sessions**; leave/insert are moves within that number.

1. **Pure `planCourseMoves(sessions, size)`** in `lib/` — `sessions` = the course's bookings with `{status, date,
   extendedFromId}`. With `LIVE = {PENDING, CONFIRMED, EXTENDED}`, `DELIVERED = {ATTENDED, NO_SHOW}`:
   - `target = size`; `current = count(LIVE) + count(DELIVERED)`.
   - **short** (`current < size`): **append** `size − current` sessions after the last LIVE date (dates via the
     existing `findFreeExtensionDate`), `status: EXTENDED`, carrying `extendedFromId` of the absence that opened
     the gap.
   - **long** (`current > size`): **remove** the newest-dated LIVE `EXTENDED` (appended) session(s) → `CANCELLED`.
     **Never** an attended/delivered or a hand-placed (non-`EXTENDED`) session.
   - **at target**: no moves (idempotent — a date/teacher-only edit yields zero moves).
   - Pure: it decides **which sessions move and how**, never touches the DB.
2. **`reconcileCoursePlan(tx, courseId)`** — loads the course's bookings, calls `planCourseMoves`, applies the
   moves in the passed transaction. Returns the moves for the caller to log.

## Definition of Done
- [ ] `planCourseMoves` pure + unit-tested, incl. the **owner's worked example verbatim**: plan 7·14·21·28 →
      mark 14 absent (append one at the end) → insert on 15 (the appended one is cancelled) ⇒ **still 4 LIVE
      sessions, ends on 28**. And a round trip (absence→insert→absence→insert) never drifts off `size`.
- [ ] A course with `k` attended + `m` live always satisfies `attended + live == size` after any reconcile.
- [ ] Contraction removes only `EXTENDED` appended sessions, newest first; never an attended/hand-placed one.
- [ ] `bunx tsc --noEmit` clean; `bun test` green.

## Notes for Jason
Mirror TASK-091's split (pure planner + tx applier). `findFreeExtensionDate` is at `scheduler.service.ts:1090`.
Do NOT enforce `MAX_WEEK`/quota/availability here — that's the applier's gate (TASK-093); this is *which sessions*,
not *is it allowed*.

## Implementation Notes
Mirrors TASK-091 exactly (pure planner + tx applier). No DB schema change.

- **Pure `src/lib/course-plan.ts`** — `planCourseMoves(sessions, size)` → `{ append: [{extendedFromId}], cancelIds }`.
  `LIVE = {PENDING,CONFIRMED,EXTENDED}`, `DELIVERED = {ATTENDED,NO_SHOW}`; `current = count(LIVE)+count(DELIVERED)`.
  short → append `size−current`, each linked to an **unmatched SICK_LEAVE** (a leave with no session pointing back
  via `extendedFromId`); long → cancel the **newest-dated `EXTENDED`** (over count), never delivered/hand-placed;
  at target → no moves. Decides *which/how many* only — dates are the applier's job (they need a clash lookup).
- **`reconcileCoursePlan(tx, courseId)`** in `scheduler.service.ts` (beside `findFreeExtensionDate`) — loads the
  course + its bookings, runs `planCourseMoves`, then in the passed tx: cancels the `cancelIds`, and appends each
  makeup after the last still-live date via `findFreeExtensionDate`, mirroring the source absence's
  teacher/subject/time (falls back to a live session). Returns `{appended, cancelled}` for the caller to log.
  Reuses the existing EXTENDED-insert shape (`status:'EXTENDED'`, `extendedFromId`, `bookingType:'COURSE_PACKAGE'`).

**Verification**
- `bunx tsc --noEmit` clean; `bun test` → **401 pass / 0 fail** (+5 `course-plan.test.ts`): the **owner's verbatim
  7·14·21·28** walk (leave 14 → append after 28 → insert on 15 → the appended EXTENDED is cancelled ⇒ **still 4
  LIVE, ends 28**), a 2-cycle **round trip never drifts off size**, contraction touches **only EXTENDED** (not the
  attended nor a hand-placed CONFIRMED), and NO_SHOW counts as delivered. The pure engine is fully tested;
  `reconcileCoursePlan`'s DB apply is verified by inspection (brownfield — no DB), reusing the proven EXTENDED
  insert + `findFreeExtensionDate`.
- Per the task: **no `MAX_WEEK`/quota/availability enforcement here** — that's TASK-093's `applyPlanChange` gate.
  This answers *which sessions move*, not *is it allowed*.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **Append template source:** an appended makeup copies the **teacher/subject/startTime of the absence it
  replaces** (`extendedFromId` → that SICK_LEAVE row), falling back to a live session when the source can't be
  resolved — matching the existing sick-leave append. Per-session teacher edits (REQ-030) are applied *after*
  via `moveBooking`/`applyPlanChange`, so this default is fine. Flag if you'd rather the makeup default to the
  course's current teacher for that weekday instead.
  > **answer (Sober):** the default is right — the makeup inherits the absent session's teacher/subject/time,
  > and a different makeup teacher is a subsequent per-session edit via `applyPlanChange`. Consistent with the
  > "moves within the number" model; leave it. No change.

## Review
**Verdict: DONE ✅** — Sober, 2026-08-03 (code-verified on the office tree). Read the real code + ran the suite
myself: `bunx tsc --noEmit` exit 0 · `bun test` **401/0** (course-plan **5/5**, +5).
- **Pure engine correct** (`lib/course-plan.ts`): `current = LIVE + DELIVERED` vs `size`; short → append per
  **unmatched** SICK_LEAVE; long → cancel newest-dated **EXTENDED** only; at-target → no-op. NO_SHOW ∈ DELIVERED
  (owner's consume decision). The `matched`/`unmatched` leave logic is what makes "one replacement per absence" hold.
- 🔑 **Idempotency confirmed in code:** the applier sets **`extendedFromId: a.extendedFromId`** on the appended
  booking (`scheduler.service.ts:1175`), so a re-run sees the leave as matched and won't re-append. That's the
  property that makes `reconcileCoursePlan` safe to call on every plan edit (TASK-093).
- **The owner's invariant is an actual test, not a claim** — 7·14·21·28 verbatim, asserting *still 4 LIVE, ends
  28* after leave-then-insert; plus the round-trip and contraction-only-EXTENDED. Exactly the design.
- **Boundary respected:** no `MAX_WEEK`/quota/availability here — correctly deferred to TASK-093's gate. Append
  clash-avoidance reuses `findFreeExtensionDate`.
- Append-template default (Q) confirmed correct. **The critical-path spine is solid — TASK-093 can build on it.**
