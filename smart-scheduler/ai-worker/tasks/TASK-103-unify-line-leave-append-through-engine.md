# TASK-103: scheduling (BE) — route the LINE-bot leave append through the plan engine (one append definition)
- Source: SPEC-028 (follow-up from TASK-093 review — Jason flagged, Sober agreed to defer)
- Status: TODO (POST-GO-LIVE — deliberately not in the go-live batch)
- Depends on: TASK-093
- Assignee: @Jason (smart-scheduler-back)

## Why
TASK-093's `applyPlanChange:mark-absence` appends the makeup via the TASK-092 engine (`reconcileCoursePlan`), which
enforces `MAX_WEEK`. The live **LINE-bot leave** path (`updateBookingStatus:sick-leave`, ~`scheduler.service.ts`
:1289) still uses its **inline** append — a **second definition** of the same operation, and **not** ceiling-guarded.
Two definitions of one thing is this project's recurring drift; it was deferred (not folded in) only because
ripping out a live customer-facing flow next to go-live is the wrong risk.

⚠️ **The concrete gap while it coexists:** the inline path is quota-bounded (`canTakeLeave`), so in the normal case
it can't exceed `MAX_WEEK`. **The one real hole is the adminUnlock edge** — an unlocked, over-quota LINE leave is
**not** ceiling-capped, where the engine path would refuse it. Low frequency; acceptable until this lands.

## What to do
- Route `updateBookingStatus`'s `sick-leave` append through the **same** engine (`reconcileCoursePlan`) /
  `applyPlanChange` machinery so there is **one** append definition and `MAX_WEEK` is enforced everywhere.
- Preserve the LINE path's other behaviours (notifications, the leave-notice gate, the lock-over-quota semantics).
- Regression-guard the live LINE-leave flow (leave → appended makeup → digest/notify) so the swap is provably
  behaviour-preserving for the common case, plus the adminUnlock-over-ceiling case now refuses.

## Definition of Done
- [ ] One append definition; the LINE-leave path enforces `MAX_WEEK` (incl. the adminUnlock edge).
- [ ] LINE-leave notifications + lock-over-quota behaviour unchanged for the normal case (tests).
- [ ] `bunx tsc --noEmit` clean; `bun test` green.
