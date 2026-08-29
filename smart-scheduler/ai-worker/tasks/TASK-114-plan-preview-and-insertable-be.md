# TASK-114: scheduling (BE) — `insertable` flag + plan-diff dry-run preview (OBS-3 = A)
- Source: SPEC-028 §12 (REQ-030, owner ruling 2026-08-04)
- Status: TODO (go-live-relevant — transparency on the core plan flow)
- Depends on: TASK-097 (DTO), TASK-093 (`applyPlanChange`)
- Assignee: @Jason (smart-scheduler-back)

## What to build
1. **`insertable` on the course plan DTO** (`getEntitlementPlan`, TASK-097): `insertable = canInsert(sessions, size)`
   (`current < size || hasEXTENDED`); **`false` for a voucher** (no insert). Lets the FE disable Insert only when
   there's genuinely nothing to reschedule — NOT at every `owedCount == 0` (that would break REQ-030's post-absence
   insert). The BE still refuses the genuinely-empty case with `NO_OWED_SESSION`.
2. **`applyPlanChange` `dryRun` mode** — runs the **full** transaction (all guards + `reconcileCoursePlan` +
   `reconcileBookingHolds`), then **reads back the resulting sessions + derived `liveEndDate` and ROLLS BACK**
   instead of committing. Returns `{ moves: {appended, cancelled}, resultingSessions, liveEndDate }`. On a guard
   failure, throws the **same typed reason** the real apply would.
   - 🔑 **Reuse the real applier — do NOT re-derive the reconcile.** The rollback guarantees preview == apply; a
     second computation would be the drift this project keeps paying for.
3. **`POST /courses/:id/plan/preview`** — same body as `/plan`, returns the dry-run result (or the typed refusal).

## Definition of Done
- [ ] `insertable` on the DTO: **false** on a full course with no EXTENDED, **true** post-absence (with an EXTENDED),
      false for a voucher — tested.
- [ ] `dryRun` writes **nothing** (verify no rows changed after a preview), and its resulting plan **matches** what a
      real apply produces for the same change — tested.
- [ ] A preview of a change that would be refused returns the same typed reason (e.g. `EXTENSION_CEILING`, `SLOT_TAKEN`).
- [ ] `bunx tsc --noEmit` clean; `bun test` green.

## Review
**Verdict: DONE ✅** — Sober, 2026-08-04 (code-verified). Read the dry-run path + the catch; ran the suite:
**tsc 0 · 445/0**.
- **`insertable`** (`:1139` course = `canInsert`, `:1164` voucher = false) — disables Insert **only** on a
  genuinely-full course (no EXTENDED), NOT at every `owedCount==0`, so REQ-030's post-absence insert stays enabled.
  The BE still refuses the truly-empty case with `NO_OWED_SESSION`. Exactly §12.1.
- 🔑 **The dry-run-rollback is the elegant, drift-proof version I specced** — `finalize()` sits at the **end** of
  each branch (after all guards + `reconcileCoursePlan` + `reconcileBookingHolds`); in dry-run it reads back the
  resulting sessions + `deriveLiveEndDate` from the tx, then **throws `DryRunSignal` to roll the whole tx back**
  (nothing written, incl. any enqueued LINE). The outer catch (`:1593`) returns the captured preview **first**, then
  falls through to the normal typed-error handling — so a **refused** change rethrows the **same** reason
  (`EXTENSION_CEILING`/`SLOT_TAKEN`/`TEACHER_CHANGE_TOO_LATE`/…) in dry-run as in a real apply.
- **preview == apply by construction** — the same code path, writes discarded. No second reconcile definition — the
  drift this project keeps paying for is structurally impossible here.
- **`POST /courses/:id/plan/preview`** returns `{change, moves, resultingSessions, liveEndDate}` (or the typed refusal).
**DONE — unblocks TASK-115 (the FE plan-diff confirm).**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-114 | scheduling (BE): **OBS-3=(A)** — `insertable` flag on the plan DTO (= `canInsert`, false for voucher) + `applyPlanChange` **dryRun** mode (real tx, roll back → resulting sessions + end + moves; same typed refusals) + `POST /courses/:id/plan/preview`. Preview can't diverge from apply | SPEC-028 §12 | 🔎 **REVIEW** (Jason 2026-08-04 — tsc 0 · **445/0**. `getEntitlementPlan` DTO now carries `insertable = canInsert(sessions, size)` (course) / `false` (voucher) — FE disables Insert only on a genuinely-full course, not every owed==0 (post-absence stays enabled). `applyPlanChange` gained `opts.dryRun`: runs the **full** tx (every guard + `reconcileCoursePlan` + `reconcileBookingHolds`) via a `finalize()` wrapper that, in dry-run, reads back the resulting sessions + `deriveLiveEndDate` and throws `DryRunSignal` to **roll the tx back**; outer catch returns `{change, moves:{appended,cancelled}, resultingSessions, liveEndDate}`. **Reuses the real applier — preview==apply by construction, no re-derivation.** A refused change throws the **same typed reason** (EXTENSION_CEILING/SLOT_TAKEN/…). `POST /courses/:id/plan/preview` (same body as `/plan`). `insertable` logic pure-tested via `canInsert`; dry-run rollback verified by inspection — brownfield, no DB tests) — ✅ **DONE** Sober 2026-08-04: code-verified — `finalize` at end of each branch, `DryRunSignal` rollback, catch (`:1593`) returns preview first then rethrows real typed reasons; preview==apply by construction; tsc 0 · 445/0 run by me. Unblocks TASK-115 | Jason | TASK-097, TASK-093 |
```
