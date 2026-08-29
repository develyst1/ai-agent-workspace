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

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-009 | Close the freelance ceiling on teacher type-change (+ admin warning) | **LOW** (owner 2026-08-02: *"ไม่ด่วน ใช้น้อยมาก"*) | ✅ 🧪 **`TEST_PASSED` (Tanya, 2026-08-04, post-deploy)** — run under Porter's authorization with a throwaway `QA-req009d` freelance teacher (฿5,000 ceiling), **archived after; roster verified back to FULL_TIME 7 / PART_TIME 6 / FREELANCE 10**. ⋯ → *Change type* → Full-time shows the red alert **“This closes QA-req009d's freelance budget (remaining ฿5,000) — it will not carry over.”**; **Cancel changes nothing** (still FREELANCE); **Confirm** → FULL_TIME with the ceiling closed; switching **back to freelance re-arms the gate** (`available=false, reason=NO_BUDGET` — no silent restore). ⚠️ AC “past P&L unchanged” stays **NOT TESTED** (backoffice, cross-month). Evidence: `tests/TEST-REQ030-BATCH-post-deploy-acceptance.md`. _Prior:_ Testing this honestly means creating a **QA teacher** on `sid`, giving it a freelance budget and changing its type — a write to the shared **teacher roster**. My sandbox refused that write and I did not work around it. **@Porter — authorize a `QA-req009` teacher (I archive it after), or have the owner do the type change on a real teacher and report the confirmation text.** The code path exists (`closeFreelanceCeiling`, `scheduler.service.ts:304`) but reading code is not testing. Evidence/questions: `tests/TEST-BATCH-2026-08-04-sid-acceptance.md`. Prior: **SPEC_DONE** — build complete, ready to deploy | **@Porter — deploy + acceptance (rides the same batch; backend + FE, NO migration). BUILD COMPLETE 2026-08-01: TASK-060 ✅ + TASK-061 ✅.** SPEC-019 (2026-08-01). **🔎 Two of the REQ's own assumptions moved once I read the code. (1) "Closing" already has a representation — `bo.item.active` is the flag that `findFreelanceItem`, `listFreelanceCeilings` AND `resetFreelanceBudgets` all filter on, so close = `active=false`: no migration, nothing deleted, history preserved by construction. (2) ⚠️ REQ Q1 ("immediate or effective-month?") is **answered by the code, not by คุณฟีน** — there is **no effective-dating left**: `updateTeacher` writes `type` immediately and the effective-dated path went with the ops sync in TASK-029. Question withdrawn, not routed. **🔎 Plus a stale-ceiling path the REQ never named:** `archiveTeacher` closes nothing and `resetFreelanceBudgets` joins no teacher table, so **an archived freelance teacher's dead budget is re-filled every month, forever** — same defect, same one line, included (FYI to คุณฟีน, splittable). **REQ Q2 (hours already drawn): proceeding on "leave them"** — committed spend, REQ item 3 says history is preserved, and `reconcileFreelanceDraw` skips non-FREELANCE so nothing touches them again; non-blocking FYI if คุณฟีน thinks the centre stops owing for booked-but-not-taught sessions. **Item 4 ("back to freelance starts fresh") needs no code** — it already falls out of `setupIncomplete`; pinned with a test instead. _Porter's original:_ Sober — write SPEC. Follow-up flagged during TASK-029 review; stakeholder confirmed 2026-07-28: on FREELANCE→FT/PT, **close the freelance budget + warn the admin first** (keep history; new budget if changed back). **Lowest priority — after hotfixes + REQ-006 re-deploy.** No money leak. |
```
