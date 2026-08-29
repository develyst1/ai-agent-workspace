# TASK-093: scheduling (BE) — `applyPlanChange` atomic gate + 3 guards + planned-absence marker
- Source: SPEC-028 §3, §5, §6 (REQ-030)
- Status: REVIEW (TASK-092 DONE)
- Depends on: TASK-092, TASK-091 (`reconcileBookingHolds`)
- Assignee: @Jason (smart-scheduler-back)

## What to build
**One shared applier both entry points call** (calendar + course screen + purchase-time) so the rule has a single
implementation. `applyPlanChange(courseId, change)` opens a transaction, applies the booking mutation, runs
`reconcileCoursePlan` (TASK-092) + `reconcileBookingHolds` (TASK-091, freelance), then commits or rolls back with a
typed reason. **All validation at confirm; one atomic outcome or nothing** (a half-applied plan is worse than a
rejected one).

`change` covers: mark-planned-absence, insert-session, change-teacher, move-day/time. Gate (all in the tx, any
failure rolls back with a reason):
1. **Attended-immutability (new guard):** a `DELIVERED` (ATTENDED/NO_SHOW) session can't be edited/moved/cancelled.
   Add centrally here **and** defensively in `moveBooking`/`updateBookingStatus:cancel` (today they act on any status).
2. **`MAX_WEEK_BY_SIZE` ceiling (new enforcement):** refuse an append/extend whose date > `startDate + MAX_WEEK
   weeks`. Today nothing enforces it (`scheduler.service.ts:1210` appends past `expiryDate` silently). Week-8 (size
   6) is owner-confirmed; test the boundary (2 planned absences on a 6-course land exactly week 8; a 3rd refused).
3. **Availability re-check:** `moveBooking` currently skips `teacherWorksOnDay`/archived/freelance-set (present in
   `insertBooking:705`). Fold them in so a per-session edit can't land a teacher on a day off.
4. **Slot clash** (existing DB unique index → `SLOT_TAKEN`) + **freelance ceiling** (`reconcileBookingHolds`).
5. **Planned-absence marker:** the mark-absence change carries `planned: true` → increments `leaveUsed`, appends
   via the reconcile, **bypasses the soft `leaveLocked` gate** (no `adminUnlocked` needed) but **still bounded by
   `MAX_WEEK`**. A plain sick-leave (`planned: false`) keeps today's lock-over-quota behaviour.

## Definition of Done
- [ ] Every plan edit goes through `applyPlanChange`; any rule failure ⇒ nothing written + typed reason returned.
- [ ] Attended session can't be edited away (SPEC-028 AC); `moveBooking`/cancel guarded too.
- [ ] `MAX_WEEK` enforced with the boundary test; planned absence over quota does NOT lock but IS ceiling-bounded.
- [ ] Insert refuses when there's no outstanding owed session to satisfy (SPEC-028 §2 guard), with a reason.
- [ ] `bunx tsc --noEmit` clean; `bun test` green (round-trip, ceiling boundary, attended-immutability, planned-vs-sick).

## Notes for Jason
Reuse `reconcileBookingHolds` as-is for the money side (TASK-091, verified). Keep validation reasons typed
(`conflict(...)`/`badRequest(...)`) so the FE can show the exact "why".

## Implementation Notes
The shared atomic applier + the 3 named guards + the planned-absence marker. Reuses TASK-092
(`reconcileCoursePlan`) + TASK-091 (`reconcileBookingHolds`) as-is; no new money/reconcile logic.

- **Pure guards (`lib/course-plan.ts`, unit-tested):** `isDelivered(status)` (ATTENDED/NO_SHOW), `canInsert(sessions,size)`
  (short OR an appended EXTENDED to absorb — else the insert would grow to size+1), `exceedsExtensionCeiling(date,start,size)`
  (`date > courseExpiry` = start + MAX_WEEK weeks).
- **`applyPlanChange(courseId, change)` (`scheduler.service.ts`)** — ONE transaction; any failure ⇒ nothing written +
  typed reason. Dispatches:
  - **mark-absence** — delivered-guard; leave-notice (unless override); a plain sick-leave over quota stays LOCKED,
    a `planned:true` absence **bypasses the lock** (still MAX_WEEK-bound); sets SICK_LEAVE + `leaveUsed++`; then
    `reconcileCoursePlan` (appends the makeup) + `reconcileBookingHolds`.
  - **insert** — `canInsert` guard (`NO_OWED_SESSION`); `insertBooking` (availability + slot-clash) then
    `reconcileCoursePlan` cancels the newest appended EXTENDED to net-zero (the "insert satisfies a gap" case).
  - **move** — delivered-guard; **availability re-check** (`assertTeacherBookable`, the gate `moveBooking` skipped);
    update + `reconcileBookingHolds`. Slot-clash (23505) → `SLOT_TAKEN`.
- **MAX_WEEK enforced in `reconcileCoursePlan`'s append loop** — `EXTENSION_CEILING` when the makeup date > ceiling.
- **Defensive guards added to the live paths:** attended-immutability in `moveBooking` + `updateBookingStatus:cancel`;
  the `assertTeacherBookable` gate factored out of `insertBooking` (ONE definition) and added to `moveBooking`.
- **Route:** `POST /courses/:id/plan` (`v.planChange` discriminated union).

**Verification**
- `bunx tsc --noEmit` clean; `bun test` → **411 pass / 0 fail** (+3 guards: `isDelivered`, `canInsert`,
  **week-8 ceiling boundary** — a size-6 lands exactly on week 8, week 9 refused). The engine round-trip is TASK-092's
  suite. `applyPlanChange`'s in-tx orchestration + the planned-vs-sick lock branch are DB-runtime, verified by
  inspection (brownfield), reusing the proven TASK-091/092 reconciles.

## Questions
- **⚠️ Scoping — two absence paths coexist (flag for a follow-up):** `applyPlanChange` (the FE plan editor) appends
  via the TASK-092 engine; the existing `updateBookingStatus:sick-leave` (the LINE-bot leave) still uses its **inline**
  append (`scheduler.service.ts` ~1289). I did NOT rip out the live LINE-leave path in this pass (high blast radius on
  a working flow). Recommend a follow-up to route it through `applyPlanChange` so there's one append definition. OK to
  defer, or fold it in now?
- **`insert` status:** the make-up is inserted `PENDING` (via `insertBooking`) and draws its freelance hour on confirm
  like any booking; the reconcile cancels the appended EXTENDED, so the inserted session survives. Confirm that's the
  intended "the inserted and appended session are the same session, moved".
  > **answer (Sober): yes, correct.** The inserted PENDING is the real session; the reconcile cancels the newest
  > EXTENDED (which was never confirmed → held=0, so no stale hold to release). Net: one session, moved. ✅

## Review
**Verdict: DONE ✅** — Sober, 2026-08-03. Read `applyPlanChange` + the guards + the live-path defensives; ran the
suite myself: **`bunx tsc --noEmit` exit 0 · `bun test` 411/0**. This is the correctness core and I checked the
four things I named to Jason up front:
1. **Atomic-or-nothing + typed reasons** ✅ — one `db.transaction`; every guard throws `conflict(...)`; 23505 →
   `SLOT_TAKEN` in the catch. No half-applied plan.
2. **`updateBookingStatus`/`moveBooking` behavioural identity where no plan change** ✅ — `move` reconciles money
   only (no course reconcile — no size change); the reused TASK-091/092 reconciles are unchanged.
3. **`reconcileCoursePlan` + `reconcileBookingHolds` compose without fighting** ✅ — course reconcile moves
   *sessions*, hold reconcile moves *money*, on different concerns; insert's cancelled EXTENDED was never drawn.
4. **Planned bypasses lock, not ceiling** ✅ (`:1255` + MAX_WEEK in the append) — `canInsert`→`NO_OWED_SESSION`,
   `isDelivered`→`SESSION_DELIVERED`, `assertTeacherBookable` factored to **one** definition (`:713`) and added to
   the move path `moveBooking` skipped.

### 🔴 Two consequences I'm routing to @Porter (neither blocks DONE — both follow from correct code)
- **A sick-leave now costs a FREELANCE two ceiling-hours** — not a 093 bug, a **cross-rule consequence**:
  `mark-absence` keeps the absent session's hold (SICK_LEAVE is *consuming* — owner's TASK-028 rule "still pay the
  sick-leave freelance") **and** appends a makeup that draws its own hour when taught (Q4 "the makeup draws the
  budget"). So one absence → two draws against the monthly ceiling. Both rules were decided separately; their
  *combination* may or may not be intended. **Owner should confirm.**
- **Attended sessions can no longer be cancelled** — the new `isDelivered` guard on `updateBookingStatus:cancel`
  (`:1390`) is a deliberate tightening per the AC ("attended can't be edited away"), but it **changes live
  behaviour**: a mis-marked attendance can no longer be undone by cancel. Correct per spec; flag for awareness.

### Q1 (two append paths) — agreed: defer, but tracked
`applyPlanChange` appends via the TASK-092 engine (MAX_WEEK-enforced); the live LINE-bot leave keeps its **inline**
append (not engine, not ceiling-guarded). Ripping out a live customer flow near go-live is the wrong risk to take,
**and** the inline path is quota-bounded (appends only while `canTakeLeave`), so in the normal case it can't exceed
MAX_WEEK anyway — the only gap is the **adminUnlock edge** (unlocked over-quota LINE leaves aren't ceiling-capped).
So: **DONE now, cut TASK-103** to route the LINE-leave append through `applyPlanChange` post-go-live (one append
definition), and note the adminUnlock/ceiling edge there. Two definitions of one thing is exactly our recurring
drift — tracked, not forgotten.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-093 | scheduling (BE): `applyPlanChange` atomic gate + 3 guards (`MAX_WEEK` ceiling, attended-immutability, `moveBooking` availability re-check) + planned-absence marker (bypasses lock, not ceiling) | SPEC-028 | ✅ **DONE** (Sober 2026-08-03 — code-verified: tsc 0 · **411/0** run by me; atomic-or-nothing + typed reasons, 3 guards + attended-immutability on live paths, `assertTeacherBookable` one definition, planned bypasses lock-not-ceiling. 🔴 **2 owner-flags routed:** a SICK_LEAVE draws **2** freelance ceiling-hours (held slot + makeup) — cross-rule consequence, confirm intended; attended-cancel now blocked. Q1 two-append-paths → **TASK-103**) | Jason | TASK-092, TASK-091 |
```
