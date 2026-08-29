# TASK-020: scheduler-front — frontoffice freelance budget admin (set/edit/top-up)
- Source: SPEC-005
- Status: DONE
- Depends on: TASK-019 (DONE)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
Bring freelance budget management into the frontoffice Teachers page (moved off the backoffice, which
is being retired). The **display** already works — `FreelanceRow` shows `remaining/budget` + near-cap +
`overLimit` hide + override, and the DTO is now locally sourced (TASK-019), so no display change. Add the
**set/edit** and **top-up** controls. Files: `src/components/partials/Teachers/*`,
`src/services/scheduler.service.ts`, `src/hooks/scheduler/useScheduler.ts`.

1. **Service + hooks** (mirror the existing teacher-mutation pattern → invalidate `TEACHERS_KEY` +
   `CALENDAR_KEY`): `setFreelanceBudget(id, {monthlyBudgetMinor, rateMinor, reorderMinor?})` →
   `PUT /teachers/:id/budget`; `topUpFreelanceBudget(id, amountMinor)` → `POST /teachers/:id/budget/topup`.
   Baht↔satang (×100 / ÷100).
2. **Set/edit budget control** on each freelance row (or its kebab from TASK-017): a modal to set monthly
   budget (baht), rate (baht/hr), and near-cap threshold (baht). Message that editing the budget is the
   next-reset target (not current remaining) — use **Top-up** to change remaining now.
3. **Top-up control**: a small modal/input → adds to remaining immediately.
4. A freelance with **no budget set** shows the existing `setupIncomplete` badge ("ตั้งเงินก่อนจึงจะจองได้")
   and is not bookable — no change needed beyond TASK-019 sourcing it locally; just confirm it renders.

## Definition of Done
- [ ] Admin can set/edit a freelance's monthly budget + rate + near-cap from the Teachers page; a newly
      set budget shows `remaining/budget` with remaining = the budget.
- [ ] Top-up raises the remaining immediately (bar/number updates after invalidation).
- [ ] A freelance with no budget shows the setup-incomplete badge + is absent from booking columns.
- [ ] `remaining ≤ 0` hides them from booking; override / top-up re-enables (existing behavior, now local).
- [ ] `bunx tsc --noEmit` + `bun run build` clean.

## Implementation Notes
Repo: `smart-scheduler-front` (port 3016). Adds set/edit + top-up controls for the now-**local** freelance
budget (TASK-019). Display is unchanged — `FreelanceRow` already renders `remaining/budget` + near-cap +
`overLimit` hide + override, and the DTO field names are identical (locally re-sourced), so **no display
edits**; only the admin controls are new.

**Files changed / added**
- `services/scheduler.service.ts`: `setFreelanceBudget(id, {monthlyBudgetMinor, rateMinor, reorderMinor?})`
  → `PUT /teachers/:id/budget`; `topUpFreelanceBudget(id, amountMinor)` → `POST /teachers/:id/budget/topup`.
  Both return `void` (no dependence on the response shape — the hook invalidation refetches).
- `services/scheduler.mock.service.ts`: matching in-memory stubs (first-set → remaining=budget; edit keeps
  remaining; top-up adds to remaining; recompute `overLimit`/`setupIncomplete`).
- `hooks/scheduler/useScheduler.ts`: `useSetFreelanceBudget` + `useTopUpFreelanceBudget` (invalidate
  teachers + calendar + archived).
- `components/partials/Teachers/FreelanceBudgetControls.tsx` (new): on each **FreelanceRow**, a "ตั้ง/แก้งบ"
  button → set/edit modal (monthly budget, rate/hr, near-cap; baht→satang ×100; blue Alert: *edit = next-reset
  target, use Top-up to change remaining now*), and a "เติมงบ" button → top-up modal (adds to remaining, shows
  the resulting balance). Wired into `FreelanceRow` in `TeachersContent.tsx`.
- i18n: added `teachers.*` budget keys (en + th).

**setupIncomplete (DoD #3)** — no change needed: a freelance with no budget row already shows the
`setupIncomplete` badge (TASK-017) and is not bookable via `toTeacherView.bookable`; TASK-019 now sources
that flag locally. Setting a budget clears it (server recomputes; FE refetches on invalidation).

**Verification (evidence)**
- `bunx tsc --noEmit` → **exit 0**; `bun run build` → **exit 0**, `/scheduler/teachers` prerendered (SSG ran
  the new component tree — no render crash).
- ⚠️ **Live render not driven** — `/scheduler/teachers` is NextAuth-gated (→ **production** login) + real
  frontoffice API (brownfield); I did NOT authenticate. Same accepted posture as TASK-004/017. The budget
  modals reuse the exact proven Create/Top-up modal + mutation patterns from TASK-003; the PUT/POST contract
  is Jason's DONE TASK-019.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

- None blocking — built against TASK-019's DONE contract. Note: the set/edit + top-up controls live directly
  on each FreelanceRow (not the shared TASK-017 kebab, which is for lifecycle actions on all teacher types);
  budget is freelance-only, so a per-freelance-row control reads cleaner. Flag if you'd prefer them folded
  into the kebab.
  > answer (Sober): **Per-FreelanceRow placement is the right call — keep it.** Budget is freelance-only, so
  > a dedicated on-row control reads better than burying it in the all-types lifecycle kebab. Good judgment.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `scheduler-front` `bunx tsc --noEmit` → exit 0 (build 0 per
notes). Verified the contract: `setFreelanceBudget` → `PUT /teachers/:id/budget` and `topUpFreelanceBudget`
→ `POST /teachers/:id/budget/topup` — exactly TASK-019's endpoints; hooks invalidate teachers+calendar+archived;
set/edit modal (budget/rate/near-cap, baht→satang) with the "edit = next-reset target, use Top-up now" Alert;
top-up modal; mock stubs mirror the server (first-set→remaining=budget, edit keeps remaining). The display is
unchanged (local-sourced DTO, same field names) → no regression; `setupIncomplete` badge clears when a budget
is set. Live render behind prod NextAuth — accepted under brownfield (same posture as TASK-004/017). No rework.
**REQ-004 is fully built (019/020).**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-020 | scheduler-front: frontoffice freelance budget admin (set/edit/top-up) | SPEC-005 | DONE | Fern | TASK-019 |
```
