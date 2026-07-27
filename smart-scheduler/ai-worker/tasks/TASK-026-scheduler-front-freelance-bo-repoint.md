# TASK-026: scheduler-front — re-point freelance budget admin at the `bo`-backed data
- Source: SPEC-006
- Status: DONE (verify-only — no FE code change needed)
- Depends on: TASK-024 (DONE)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
After TASK-024 moves the freelance ceiling from `public.freelance_budgets` to a `bo.item` (unit=hour), adjust
the frontoffice freelance budget admin (built in TASK-020) so it reads/writes the new shape. Likely small.

1. Confirm the teacher DTO still exposes `remainingMinor`/`budgetMinor`/`reorderMinor`/`overLimit` (TASK-024
   keeps the field names, sourced from `bo.item`) → the **`FreelanceRow` display needs no change**.
2. If the set/edit + top-up endpoints changed shape (e.g. ceiling now in **hours** rather than baht budget),
   update `setFreelanceBudget`/`topUpFreelanceBudget` inputs + the modals accordingly (hours + rate, or keep
   baht and convert — match TASK-024's contract). Coordinate the unit shown (hours vs baht) with Sober/TASK-024.
3. Keep the `setupIncomplete` badge behavior (no ceiling item → not bookable) — now sourced from `bo`.

## Definition of Done
- [ ] Freelance set/edit/top-up works against the `bo`-backed endpoints; `remaining/ceiling` displays correctly
      (unit per TASK-024).
- [ ] No regression to the booking auto-hide / override behavior.
- [ ] `bunx tsc --noEmit` + `bun run build` clean.

## Implementation Notes
**Outcome: verify-only — no FE change required.** TASK-024 deliberately **kept the scheduling admin API +
teacher DTO contract byte-for-byte identical** (same endpoints, same `*Minor` field names, baht in/out);
only the *storage* moved (`public.freelance_budgets` → `bo.item`, unit=hour, converted internally). So the
TASK-020 freelance budget admin already targets the correct, unchanged contract.

**Confirmed against TASK-024's delivered notes (checkpoints #1–#3 of this task):**
- **Display (#1):** the teacher DTO still exposes `remainingMinor`/`budgetMinor`/`reorderMinor`/`overLimit`
  (`attachFreelanceBudgets` now re-sources them from the `bo.item`: `remainingMinor=remaining×rate`, etc.) →
  `FreelanceRow` unchanged. ✓
- **Set/edit + top-up (#2):** my `services/scheduler.service.ts` calls **`PUT /teachers/:id/budget`**
  `{monthlyBudgetMinor, rateMinor, reorderMinor?}` and **`POST /teachers/:id/budget/topup`** `{amountMinor}` —
  exactly the endpoints/bodies TASK-024 kept (it does the baht→hours conversion server-side). **Units stay baht**
  in the UI (Sober confirmed: keep baht, no FE churn). No modal change. ✓
- **setupIncomplete (#3):** freelance with no `bo.item` → `setupIncomplete=true` → not bookable; behavior
  unchanged, now sourced from `bo`. ✓

I made **no code edits** (surgical scope — the contract is preserved, so there is nothing to re-point). Recorded
the storage-move + baht-kept rationale here so the change is traceable.

**Verification (evidence)**
- `bunx tsc --noEmit` → **exit 0**; `bun run build` → **exit 0** (`/scheduler/teachers` prerenders) — confirms
  the existing freelance admin still compiles cleanly against the unchanged contract.
- Grepped `scheduler.service.ts` → the budget endpoints/fields match TASK-024's kept shape exactly.
- ⚠️ Live round-trip against `bo.item` not driven (NextAuth gate → prod login + real API; brownfield) — same
  accepted posture as TASK-020/023. The contract identity + green build are the evidence.
- **Deploy note (from TASK-024's Q&A):** TASK-025 data migration (`freelance_budgets` → `bo.item`) must run
  **before/with** the TASK-024 deploy, else live freelances have no `bo.item` → `setupIncomplete` → not bookable.
  FE-side there's nothing to sequence.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

- None — verify-only. If you'd rather the UI **display hours** (native `bo` unit) instead of baht later, that's
  a small follow-up (TASK-024 kept baht deliberately to avoid a coordinated FE+BE break); not needed now.
  > answer (Sober): **Keep baht — agreed, hours is a later nicety** (not worth a coordinated FE+BE break). Good
  > that the preserved contract made this a genuine no-op. Note: the **bo Items tag-prefill** (backoffice-front,
  > TASK-023 fast-follow — now that Jason's DTO carries `tagValueIds`) is a *separate* pending item, not part of
  > this scheduler-front task; tracked for pre-deploy.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20) — **verify-only, correct.** Independently confirmed `scheduler-front`
`bunx tsc --noEmit` → exit 0 and that `setFreelanceBudget`/`topUpFreelanceBudget` still hit
`PUT /teachers/:id/budget` + `POST /teachers/:id/budget/topup` — exactly TASK-024's preserved (baht) contract.
No FE edit was needed because TASK-024 kept the endpoints + `*Minor` DTO fields byte-for-byte; the freelance
admin (TASK-020) already targets the now-`bo`-backed contract, and `setupIncomplete`/auto-hide are unchanged
(re-sourced from `bo.item`). Surgical no-op with a clear rationale recorded. No rework.
**🏁 ALL 6 REQ-006 TASKS DONE — the backoffice rebuild is code-complete.**
