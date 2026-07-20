# TASK-010: backoffice-front — Edit modal for Freelance Budgets
- Source: SPEC-001 (split out of TASK-003 — REQ-001 "edit budget/rate")
- Status: DONE
- Depends on: TASK-009 (DONE)
- Assignee: @Fern (smart-scheduler-backoffice-front, port 3100)

## What to do
Add an **Edit** action to the Freelance Budgets screen built in TASK-003, using the
new ops `PATCH /catalog/items/:id` (TASK-009). Mirror the existing Create modal.

1. Per-row "แก้ไข" button → Edit modal pre-filled with the item's current rate
   (`salePriceMinor`), monthly budget (`metadata.monthlyBudgetMinor`), and near-cap
   threshold (`reorderLevel`), all shown in baht.
2. Submit → `PATCH /catalog/items/:id` with the changed fields (baht→satang ×100,
   `metadata:{...existing, monthlyBudgetMinor}` per the shallow-merge contract).
3. **UX note (from TASK-009):** editing the monthly budget changes the *reset target*,
   not the current remaining — it takes effect at the next monthly reset. Message this
   in the modal so admins aren't surprised the remaining bar doesn't jump. To change
   *current* remaining now, use Top-up.
4. Invalidate the `["backoffice","items"]` / freelance-budgets query on success.

## Definition of Done
- [ ] Admin can edit rate / monthly budget / near-cap threshold; list reflects the change.
- [ ] Editing budget preserves other metadata (kind) — verified against the returned DTO.
- [ ] Modal explains budget-edit = next-reset target; Top-up = change remaining now.
- [ ] `bunx tsc --noEmit` + `bun run build` clean.

## Implementation Notes
Repo: `smart-scheduler-backoffice-front`. Extends the TASK-003 Freelance Budgets screen with an
Edit action using Jason's `PATCH /catalog/items/:id` (TASK-009). Mirrors the Create modal.

**Files changed / added**
- `src/services/catalog.service.ts` — added `updateItem(itemId, patch)` → `PATCH /v1/catalog/items/:id`,
  and `UpdateItemInput` (`name?/salePriceMinor?/reorderLevel?/active?/metadata?`). Additive.
- `src/hooks/backoffice/useFreelanceBudgets.ts` — added `useUpdateFreelanceBudget()` (mutation →
  `updateItem`, invalidates the freelance-budgets query key on success).
- `src/components/partials/FreelanceBudgets/EditFreelanceBudgetModal.tsx` — **new.** Pre-filled from the
  row (name, rate `salePriceMinor/100`, budget `metadata.monthlyBudgetMinor/100`, near-cap `reorderLevel/100`),
  all baht. teacherId (externalRef) shown **disabled** (identity is locked by TASK-009). Submit sends
  `{name, salePriceMinor, reorderLevel, metadata:{monthlyBudgetMinor}}` (baht→satang ×100) — backend
  shallow-merges metadata so `kind` is preserved.
- `src/components/partials/FreelanceBudgets/FreelanceBudgetsContent.tsx` — per-row **"แก้ไข"** button
  (Pencil) next to "เติมงบ"; wired `editItem` state + `<EditFreelanceBudgetModal>`.

**UX messaging (DoD #3 / TASK-009 note):** the Edit modal shows a blue Alert — editing the **monthly
budget** sets the target for the **next reset**; current remaining doesn't change until month-start reset.
To raise remaining now, use **เติมงบ (Top-up)**. This matches TASK-009's "budget edit = reset target,
not current stock" contract.

**Verification (evidence)**
- `bunx tsc --noEmit` → **exit 0** (clean).
- `bun run build` → **exit 0**; `/freelance-budgets` prerendered.
- Loaded `/freelance-budgets` in a browser (dev): page mounts cleanly with the Edit modal wired — no
  React error, header + empty-state + nav render (regression check that adding the Edit button/modal
  didn't break the screen).
- ⚠️ **Live edit round-trip NOT executed** — the "แก้ไข" button only appears on a real row, and creating/
  editing a budget writes to the shared ops **Postgres**, which the **brownfield rule** bars me from
  driving (no freelance-budget rows exist yet). Verified by inspection + typecheck, same posture accepted
  on TASK-003/009. The modal reuses the exact proven Create/TopUp wiring; the PATCH contract is Jason's
  DONE TASK-009.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

- None — followed TASK-010 + TASK-009's contract as written (identity locked, metadata shallow-merge,
  next-reset messaging). Flag if you'd prefer the Edit modal to also expose `active` (soft-disable) — I
  left it out since TASK-010 scope is rate/budget/threshold only.
  > answer (Sober): **Leave `active` out — correct scope call.** REQ-001's AC is "edit budget/rate";
  > soft-disabling a departed freelance's budget item is a real but separate concern (and booking
  > visibility is already handled scheduling-side via TASK-008's `active`/override). Not worth widening
  > this task. Noted as a possible small follow-up if คุณฟีน asks for a "retire freelance" action later —
  > not creating a task for it now (no requirement).

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `backoffice-front` `bunx tsc --noEmit` → exit 0.
Verified the Edit modal sends exactly TASK-009's contract: `salePriceMinor`, `reorderLevel` (null when
cleared), `metadata:{monthlyBudgetMinor}` (backend shallow-merges → `kind` preserved); identity
(teacherId) shown disabled; the blue Alert correctly messages "budget edit = next-reset target, use
Top-up to change remaining now" (matches the TASK-009 semantics). Reuses the proven Create/TopUp wiring.
Live edit round-trip is DB-runtime, unverifiable under brownfield — accepted on the same basis as
TASK-003/009. No rework.
