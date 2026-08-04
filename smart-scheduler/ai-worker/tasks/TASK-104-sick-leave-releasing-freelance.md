# TASK-104: scheduling (BE) — SICK_LEAVE no longer draws the freelance ceiling (owner reversal of TASK-028)
- Source: SPEC-028 §11.1 (owner decision 2026-08-03, reverses TASK-028's locked rule)
- Status: TODO
- Depends on: — (modifies TASK-028/091 code, both DONE)
- Assignee: @Jason (smart-scheduler-back)

## What to change
The owner reversed "still pay the sick-leave freelance." **Move `SICK_LEAVE` from the *consuming* set to
*releasing*** in the freelance drawdown:
- `lib/freelance-budget.ts:36` — `FREELANCE_CONSUMING_STATUSES` becomes `{CONFIRMED, ATTENDED, EXTENDED}` (drop
  `SICK_LEAVE`). So `heldTarget(SICK_LEAVE) → 0`; a CONFIRMED→SICK_LEAVE now **refunds** the held hour.
- **This is the money side only.** The course-size reconcile (TASK-092) is unchanged — a sick-leave still appends a
  makeup; only the freelance *hold* changes. Do not touch `reconcileCoursePlan`.
- Net: a sick-leave costs **1** freelance hour (the makeup, when taught), not 2.

## Careful pass (it's live money)
- The reconcile-to-target machinery (`reconcileDelta`/`reconcileBookingHolds`, TASK-091) is unchanged — only the
  classification. The round-trip stays correct: `CONFIRMED→SICK_LEAVE→ATTENDED→SICK_LEAVE` = held `1→0→1→0`.
- **Update the tests that pin SICK_LEAVE as consuming** (`freelance-budget.test.ts`, and any in `hold-moves` /
  `applyPlanChange` that assume the old target) to the new rule.
- Update the note in `TASK-028` (its locked rule is reversed) — pointer only; TASK-028 stays DONE.

## Definition of Done
- [ ] `heldTarget(SICK_LEAVE) === 0`; a sick-leave releases the held hour; makeup still appends and draws on confirm.
- [ ] Tests updated to the new rule (SICK_LEAVE releasing); round-trip + idempotency still green.
- [ ] `bunx tsc --noEmit` clean; `bun test` green.

## Note (no code here)
The manual fuel-allowance (ค่าน้ำมัน) path already exists — backoffice `POST /bo/items` (EXPENSE item) +
`POST /bo/items/:id/movements` (hand-entered). No new work; optionally seed one "ค่าน้ำมันครู" EXPENSE item.

## Review
**Verdict: DONE ✅** — Sober, 2026-08-04 (code-verified). Read the constant + the tests; ran the suite:
**tsc 0 · `bun test` 434/0** (`freelance-budget` 21/21).
- **One-line classification flip, machinery self-corrects** — `FREELANCE_CONSUMING_STATUSES = {CONFIRMED, ATTENDED,
  EXTENDED}` (SICK_LEAVE dropped) ⇒ `heldTarget(SICK_LEAVE)=0`. `reconcileDelta`/`reconcileBookingHolds`/`planHoldMoves`
  untouched — the money path corrects itself from the classification. This is the reconcile-to-target design paying
  off: an owner rule reversal is a **classification change, not a code change**.
- **Tests pin the NEW rule** (not just deleted the old): `heldTarget("SICK_LEAVE")=0`, `reconcileDelta(1,"SICK_LEAVE")
  =-1` (refund), round-trip `CONFIRMED→SICK_LEAVE→ATTENDED→SICK_LEAVE = [1,0,1,0]` ending released — full ceiling back.
- **`reconcileCoursePlan` untouched** — a sick-leave still appends a makeup, which draws on its own confirm ⇒ a
  sick-leave costs **1** freelance hour, not 2. **This resolves the TASK-093 owner-flag.**
- Fuel allowance = manual `bo` EXPENSE (no code, already supported), left un-seeded. **DONE.**
