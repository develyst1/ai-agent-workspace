# REQ-009: Close the freelance ceiling when a teacher changes type — with an admin warning
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-28 by stakeholder (PM chat)
- Deadline: none — **sequence AFTER the live hotfixes (TASK-029) + the REQ-006 re-deploy** (no money leak; not urgent)
- Source: follow-up flagged by Sober during TASK-029 review (FL→FT/PT leaves a stale `bo.item` ceiling).

## Problem / Goal
A freelance teacher has a monthly budget **ceiling** (the freelance cap). When an admin changes that
teacher's type to **Full-Time / Part-Time**, the ceiling stops being relevant (FT/PT are fixed-cost, not
budget-capped) — but today it **lingers as stale data**, and the admin gets **no warning** that changing
the type affects the freelance budget.

Goal: on a type change away from freelance, **close the freelance ceiling**, and make the admin **aware
before they confirm** so it's a conscious choice — never a silent side-effect.

## Requirement
1. When an admin changes a teacher's type **from FREELANCE to FT/PT**, the system must **close /
   deactivate that teacher's freelance budget ceiling** — it is no longer enforced or shown as an
   active budget.
2. Before the change is saved, the admin must see a **clear confirmation** stating that the freelance
   budget **(including the remaining amount)** will be closed and will **not carry over**. The change
   proceeds only if the admin confirms; cancelling changes nothing.
3. **History is preserved** — past freelance expense / P&L movements are untouched (prior months'
   accounting stays correct).
4. If the teacher is later changed **back to freelance**, they start **fresh** (admin sets a new
   budget) — the old closed ceiling is not auto-restored.

## Acceptance Criteria
- [ ] Changing a freelance → FT/PT shows a confirmation that names the freelance budget + the remaining
      amount that will be closed; on **confirm** the type changes AND the ceiling is closed; on
      **cancel** nothing changes.
- [ ] After the change, the teacher is FT/PT with **no active freelance ceiling** — no stale active
      budget lingers in the UI or enforcement.
- [ ] Past P&L / freelance history is unchanged (a prior month still shows what it showed before).
- [ ] Changing a teacher back to freelance requires setting a new budget (no silent restore).

## Constraints
- **No money leak exists today** (the reconcile skips non-FREELANCE teachers) — this is **data-cleanliness
  + admin-clarity**, not a correctness fix. **Low urgency: do it after the live hotfixes + re-deploy.**
- Reuse the existing type-change (effective-dated) mechanic and the freelance budget (`bo.item`) model —
  do not redesign them. HOW to close the ceiling is the SA's design.
- Warn/confirm is a frontoffice UX concern (scheduler-front teacher management); closing the ceiling is
  backend.

## Out of Scope
- Changing how freelance budgets are set / reset / topped up.
- The FT/PT → freelance direction beyond "start fresh" (the existing setup-incomplete gate handles it).
- FT/PT salary handling (separate).

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`. Per stakeholder: if anything is unclear or a
business/scope question arises, write it here and route `@Porter` before building — do NOT guess.)
- Timing: type changes are **effective-dated** — should the ceiling close **immediately** on confirm, or
  from the **effective month** of the type change? (Porter's lean: immediate on confirm, since the cap is
  a live gate; route to คุณฟีน if it's a business call.)
- If the freelance has **active/future bookings that already drew the ceiling** at the moment of the
  change — leave them as-is, or reconcile? (Business + technical; flag for Porter/คุณฟีน.)
