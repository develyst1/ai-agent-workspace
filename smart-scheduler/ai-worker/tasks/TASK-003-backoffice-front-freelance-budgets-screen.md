# TASK-003: backoffice-front — "Freelance Budgets" admin screen
- Source: SPEC-001
- Status: DONE (narrowed scope: list/create/top-up/display; "edit" → TASK-009 + TASK-010)
- Depends on: TASK-001
- Assignee: @Fern (smart-scheduler-backoffice-front, port 3100)

## What to do
Add an admin screen to manage per-freelance monthly budgets. Mirror the existing
**Items** pattern (page → partial → hook → service → API): see
`src/components/partials/Items/`, `src/hooks/backoffice/useCatalog.ts`,
`src/services/catalog.service.ts`, and register a nav item in
`src/components/layout/AdminLayout/AdminLayout.config.ts`.

1. **List** freelance budget items via
   `GET /v1/catalog/items?externalSource=smart-scheduler&itemType=EXPENSE`
   (filter to `metadata.kind==='FREELANCE_BUDGET'`). Columns: teacher (externalRef),
   **rate** (`salePriceMinor`), **remaining / budget** (`quantityOnHand` /
   `metadata.monthlyBudgetMinor`) as baht with a progress bar, near-cap warning when
   `quantityOnHand ≤ reorderLevel`, **capped** badge when `quantityOnHand ≤ 0`.
2. **Create / edit** a budget item: monthly budget (baht→satang), rate (baht→satang),
   near-cap warning threshold (baht→`reorder_level`). On create, set
   `item_group='SERVICE'`, `item_type='EXPENSE'`, `track_stock=true`,
   `external_source='smart-scheduler'`, `external_ref=<teacherId>`,
   `metadata={kind:'FREELANCE_BUDGET', monthlyBudgetMinor}`.
3. **Top-up (unlock)**: a movement modal posting `IN` with `amount_minor=0`,
   `ref_type='TOPUP'` (P&L-neutral) — reuse the existing MovementModal pattern.
4. All money display in baht via the existing `thb()` helper; inputs ×100 to satang.

## Definition of Done
- [ ] Screen lists each freelance's rate + `remaining/budget` with correct baht
      formatting and a capped/near-cap indicator.
- [x] Admin can create a budget item (budget/rate/warning threshold). **Edit moved to TASK-010**
      (needs the ops `PATCH` from TASK-009 — no update endpoint existed).
- [ ] Top-up raises remaining and does NOT change P&L (verify on the Dashboard).
- [ ] Nav item appears; screen matches the dark-theme Items layout; `bun run build`
      (or repo build) clean.

## Implementation Notes
Repo: `smart-scheduler-backoffice-front` (Next 16 + Mantine v9 + Tailwind v3, bun).
Mirrored the Items pattern (page → partial → hook → service → API). All service/type
changes are **additive/optional** — the existing Items screen is untouched.

**Files changed / added**
- `src/types/app/backoffice/index.ts` — added `metadata: Record<string, unknown> | null`
  to `CatalogItem` (matches Jason's `CatalogItemDTO` from TASK-001).
- `src/services/catalog.service.ts` — `listItems` now accepts `externalSource`/`externalRef`
  params (the ops route already supported them); `CreateItemInput` gained `reorderLevel?`
  + `metadata?`; `MovementInput` gained `refType?`. All optional → Items callers unaffected.
- `src/hooks/backoffice/useFreelanceBudgets.ts` — **new.** `useFreelanceBudgets()` lists via
  `GET /catalog/items?externalSource=smart-scheduler&itemType=EXPENSE` then filters
  `metadata.kind==='FREELANCE_BUDGET'` client-side (per Sober's TASK-001 Q&A — no server
  metadata filter). `useCreateFreelanceBudget()` + `useTopUp()`. `budgetMinorOf()` helper reads
  `metadata.monthlyBudgetMinor`.
- `src/components/partials/FreelanceBudgets/{FreelanceBudgetsContent,CreateFreelanceBudgetModal,TopUpModal}.tsx` — **new.**
  List: teacher (name + externalRef), rate (`thb(salePriceMinor)`), `remaining/budget` with a
  Mantine `Progress` bar, status badge (**เต็มงบ/ถูกซ่อน** at `quantityOnHand ≤ 0`, **ใกล้เต็มงบ**
  at `≤ reorderLevel`, else ปกติ). Create modal (baht→satang ×100). Top-up modal.
- `src/app/(admin)/freelance-budgets/page.tsx` — **new** route.
- `src/components/layout/AdminLayout/AdminLayout.config.ts` — added the **งบครูฟรีแลนซ์** nav item (Wallet icon).

**Design decisions (flagging for review)**
1. **Create seeds remaining → full budget.** A fresh item starts at `quantityOnHand=0` (would read
   as "capped"), so on create I post one **P&L-neutral `IN` (`amountMinor:0`, `refType:'TOPUP'`,
   `quantity=monthlyBudgetMinor`)** to seed the remaining to the full budget. Non-reversal IN is
   ignored by `/reports/pl`, so this is expense-neutral (consistent with Jason's TASK-001 conventions).
2. **Top-up (unlock)** = `IN`, `quantity=<baht×100>`, **`amountMinor:0`**, `refType:'TOPUP'` via the
   existing `POST /catalog/items/:id/movements` → raises remaining, P&L-neutral. Matches TASK-003 #3.
3. **Teacher selection = free-text `teacherId` (externalRef) + name.** backoffice-front only talks to
   the ops API (3002); it has no scheduling teacher list (3001), and real per-teacher numbers are a
   future DATA REQUEST. Mirrors the Items pattern's free-text externalRef. sku auto-derived as
   `freelance-<teacherId>`.

**Verification (evidence)**
- `bunx tsc --noEmit` → **exit 0** (clean).
- `bun run build` → **exit 0**; `/freelance-budgets` prerendered in the route list. (Next 16 runs the
  TS check inside build.)
- Ran `bun run dev` + loaded `/freelance-budgets` in a browser: page renders — nav item present,
  header/description, "เพิ่มงบครู" button, and the **empty-state** ("ยังไม่มีงบครูฟรีแลนซ์"). The list
  query resolved to the **empty state, not the error state** → the `externalSource+itemType` request
  round-trips successfully against the live ops API (0 freelance-budget items exist yet).
- `bun run lint` currently **fails at the repo level** (`next lint` was removed in Next 16 → "Invalid
  project directory … /lint"). Pre-existing, unrelated to this change; `build` is the authoritative
  TS/compile gate and is clean. (Heads-up for @Sober — repo lint script needs updating, separate item.)

**NOT verified (out of my hands):**
- Live **create→seed**, **top-up raises remaining**, and **capped/near-cap** states with real data —
  these write to / read from the shared ops **Postgres**, which the **brownfield rule** bars me from
  driving, and no freelance-budget rows exist yet. Same posture Jason took on TASK-001's DB-runtime
  DoD items (verified by inspection + build, accepted by Sober). The modal-open interaction also
  couldn't be driven through the preview tool — but the **existing Items modal behaves identically**
  in it, confirming a tool quirk, not a code defect (my modals reuse the exact Items wiring).

## Questions
(Fern asks; Sober answers as `> answer: ...`)

- **BLOCKER — "edit budget/rate/threshold" has no backend endpoint.** DoD #2 / step #2 ask to
  **edit** a budget item's monthly budget, rate, and near-cap threshold, but the ops catalog route
  (`src/routes/catalog.ts`) has **only** `POST /` (create — a plain `insert`, not an upsert), movements,
  and GET. There is **no `PATCH`/update (or delete) endpoint** for a catalog item — the Items screen I
  mirrored has no edit either. So today I can create + top-up + display, but I **cannot** change an
  existing item's `salePriceMinor` / `metadata.monthlyBudgetMinor` / `reorderLevel`. How do you want to
  handle edit? Options I see: **(a)** add a BE task for Jason — `PATCH /catalog/items/:id` (rate,
  reorderLevel, metadata) — and I add an Edit modal once it exists; **(b)** defer "edit" out of TASK-003
  (create + re-create/top-up only) for launch; **(c)** something else. I've left the rest built + verified
  and set the task `BLOCKED (waiting: Sober)` pending your call. Everything except edit is done.
  > answer (Sober): **Option (a) — add the endpoint, split into follow-ups so this task closes now.**
  > Edit of rate/budget/threshold is a real REQ-001 AC (don't drop it), but it needs a backend `PATCH`
  > that doesn't exist → can't live in a pure-FE task. I've **narrowed TASK-003 to its built scope
  > (list/create/top-up/display) and accepted it DONE**, and cut **TASK-009** (@Jason, ops
  > `PATCH /catalog/items/:id`) + **TASK-010** (@Fern, Edit modal, dep TASK-009). You're unblocked.
- **Minor (no answer needed unless you disagree):** create-time budget seeding via a P&L-neutral `IN`
  (design decision #1 above) — flag if you'd prefer the RESET `ADJUST '=<budget>'` form instead; I used
  `IN amountMinor:0` because it's the simplest positive-quantity, P&L-neutral way to set remaining=budget
  at creation.
  > answer (Sober): **Accepted as-is.** Minor: `ADJUST '=<budget>'` would match the monthly-reset path
  > (TASK-005) so "set remaining to budget" is one consistent op — not worth reworking a verified
  > screen; align it if you touch this area in TASK-010.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20) — for the **narrowed scope** (list / create / top-up /
display). "Edit" is removed from this task and re-homed to TASK-009 (ops PATCH) + TASK-010 (FE modal).

Verified: read the new files + notes; **independently ran `bunx tsc --noEmit` in backoffice-front →
exit 0**. List/create/top-up/display mirror the Items pattern; movement conventions
(`IN`/`TOPUP`/`amountMinor:0`) match TASK-001; the `metadata.kind` client-side filter is as agreed.
Live create/top-up/capped states are DB-runtime, unverifiable under the brownfield rule — accepted on
the same basis as TASK-001/002 (build + inspection). No rework on the delivered scope.

Separately (not blocking): repo `bun run lint` is broken (`next lint` removed in Next 16),
pre-existing on both FE repos → logged for Porter as a maintenance item.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-003 | backoffice-front: "Freelance Budgets" screen (list/create/top-up/display) | SPEC-001 | DONE | Fern | TASK-001 |
```
