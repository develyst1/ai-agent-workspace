# REQ-004: Move freelance limit into the frontoffice — standalone, no backoffice dependency
- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-07-20 by คุณฟีน (stakeholder)
- Deadline: none

## Problem / Goal
The stakeholder reviewed the current **backoffice** and finds it **hard to use, hard to
understand, and not scalable** — it will be **torn down and rebuilt from scratch later.**
First, finish the **frontoffice** and make it **stand-alone** (no dependency on the
backoffice that's going away).

Concretely, for now: move **freelance limit management into the frontoffice** so admins
can set and enforce each freelance teacher's cap **entirely within the scheduling app**,
with **no calls to the backoffice**. Only the **limit / over-booking prevention** is in
scope now — freelance **expense / P&L tracking is deferred** to the future new backoffice.
**FT/PT salary is out of scope** for now (deferred too).

### What this changes vs REQ-001 (deliberate)
REQ-001 stored the freelance budget/rate in the backoffice (`ops`) and the scheduling app
pulled it via `OPS_API_URL` + drew it down through ops on each booking. REQ-004 **re-homes
that to the scheduling app**: budget/rate/remaining live in the scheduling DB (`public`),
are managed by a frontoffice screen, and the cap is enforced locally. The scheduling→ops
freelance calls are **switched off**.

## Requirement
1. **Manage freelance limit in the frontoffice.** A screen in the scheduling front
   (e.g. on/near the Teachers page) to set & edit, per freelance teacher:
   - **monthly budget (baht)** and **hourly rate (baht/hr)** — stored in the scheduling DB.
2. **Enforce the cap locally (no backoffice call):**
   - Booking a freelance **draws down** their remaining budget (rate × hours), tracked in scheduling.
   - Teachers page shows **`remaining / budget`** + a **near-cap warning**.
   - Remaining **≤ 0 → auto-hide** the freelance from booking (as today). **Cancel / leave restores** it.
   - Admin can **unlock**: **top-up** the budget, or **allow-negative / override**.
   - **Monthly reset** back to the configured budget at the start of each month (now a
     scheduling-side responsibility, since the ops month-start job is being retired for this).
3. **No expense / P&L for freelance now** — this is limit-only. Money reporting waits for
   the rebuilt backoffice.
4. **Decouple from the backoffice** — the scheduling app **no longer calls ops** for
   freelance budget/drawdown. It works fully stand-alone.

## Acceptance Criteria
- [ ] Admin can set/edit each freelance's **monthly budget + rate** from the frontoffice
      (no backoffice involved).
- [ ] Teachers page shows **`remaining / budget`** + near-cap warning, sourced locally.
- [ ] Booking a freelance draws the budget down; **cancel/leave restores** it.
- [ ] Remaining **0 → freelance auto-hidden** from booking; **top-up / override** re-enables.
- [ ] Budget **resets monthly** to the configured amount (scheduling-side).
- [ ] With the **backoffice offline / `OPS_API_URL` unset**, freelance limit still works
      100% (proof of standalone).

## Constraints
- **Stand-alone in the scheduling app** (`public` DB + scheduling-front UI). **No dependency
  on the backoffice** for the freelance limit.
- **Limit-only** — no freelance expense/P&L now (deferred to the new backoffice).
- **FT/PT salary out of scope** (deferred).
- Reuse the existing scheduling-front freelance UI (remaining/budget, near-cap, `overLimit`
  auto-hide) — just re-source it from local data instead of ops.

## Out of Scope
- FT/PT salary management (deferred).
- Freelance expense / P&L reporting (deferred to the rebuilt backoffice).
- The backoffice rebuild itself (separate future effort).
- Deploying REQ-003's teacher→backoffice sync (ON HOLD — see board).

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
- SA: **Existing freelance budgets** currently live in ops (placeholder data). For REQ-004,
  **re-enter** them in the frontoffice, or **migrate** ops→scheduling once? (Porter leans
  re-enter — it's placeholder data and small.)
  > SA (Sober): **Re-enter — confirmed.** The 8 freelance budgets are placeholder (70k @ 500) and small;
  > re-entering via the new frontoffice screen (TASK-020) avoids a one-off cross-system migration script
  > against a backoffice that's being torn down. No migration task.
- SA: **Monthly reset** — implement as a scheduling-side scheduled job (extend the existing
  end-of-day/internal jobs), or admin-triggered? Recommend a scheduling-side monthly job so
  it stays automatic without the backoffice.
  > SA (Sober): **Scheduling-side monthly job — confirmed.** New `POST /internal/jobs/month-reset`
  > (`INTERNAL_JOB_SECRET`, same guard as end-of-day), invoked by a Windows task on the 1st. Keeps reset
  > automatic + standalone; replaces the retired ops month-start job for freelance. (Deploy: one more
  > scheduled task alongside the existing end-of-day.)
- SA: Leave the **ops freelance code dormant** (don't delete — backoffice is being rebuilt
  anyway) and just stop the scheduling→ops freelance calls? (Porter: yes, least churn.)
  > SA (Sober): **Confirmed — leave dormant.** TASK-019 removes the ops freelance calls from the live
  > booking/teachers paths but keeps the `ops-client.ts` functions in place (unused) for the eventual
  > backoffice rebuild. Least churn; the standalone-proof test asserts no ops fetch on those paths.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-004 | Move freelance limit into the frontoffice — standalone, no backoffice dependency | HIGH | ✅ **DELIVERED** | Deployed & confirmed working by คุณฟีน 2026-07-20. Freelance limit now standalone in the frontoffice. |
```
