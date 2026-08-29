# TASK-022: backoffice-back — universal item/movement/tag API + P&L report
- Source: SPEC-006
- Status: DONE
- Depends on: TASK-021
- Assignee: @Jason (smart-scheduler-backoffice-back, port 4010)

## What to do
Build the backoffice API on `bo.*` (single-admin JWT — reuse REQ-002; **NO roles, NO approvals**). New
`src/services/item.service.ts` + routes; mount under `/api/v1`.

1. **Items**: `GET /items` (filter by direction/cadence/active/tag), `POST /items`
   `{name, unit, direction, cadence, unitPriceMinor, ceilingQty?, ownerRef?}` (on create with a ceiling →
   `remaining_qty = ceiling_qty`), `PATCH /items/:id` (name/unit/unitPrice/ceiling/cadence/active — **direction
   immutable** after create), `GET /items/:id`.
2. **Movements**: `POST /items/:id/movements` `{qty(signed), reason?, refType?, refId?, idempotencyKey?}` →
   apply in a tx: if the item tracks a ceiling, `remaining_qty += qty` with an optional non-negative guard
   (allow-negative flag for overrides); `value_minor = |qty| × unit_price`; idempotent via the unique key.
   `GET /items/:id/movements`.
3. **Tags**: CRUD `tag_group` + `tag_value`; `PUT /items/:id/tags` (set the item's tag values, one per group).
4. **P&L report**: `GET /reports/pl?from&to` → `SUM(value_minor) GROUP BY direction (, cadence)` + `byItem`.
5. Auth: all mutations behind the existing single-admin JWT middleware; reads can stay open like the old ops.
   Money in integer satang; error envelope `{error:{code,message,details}}` (reuse the existing lib).

## Definition of Done
- [ ] Create an item (e.g. water bottles: unit=ขวด, INCOME, VARIABLE, ceiling 100, price 1500); a movement
      `qty:-2` sets remaining 98 and books value 3000; P&L shows it under INCOME.
- [ ] A FIXED_MONTHLY EXPENSE item + a `qty:-1` movement shows under EXPENSE/fixed in the report.
- [ ] Ceiling guard + idempotency-key dedupe work; `direction` can't be changed via PATCH.
- [ ] Single-admin JWT enforced on writes; `bun test` + `bunx tsc --noEmit` clean (unit-test the P&L fold +
      the movement/ceiling math as pure functions).

## Implementation Notes
Repo: `smart-scheduler-backoffice-back`. New API on `bo.*`, reusing the REQ-002 single-admin JWT.

- **`src/services/item.service.ts`** — `listItems` (filter direction/cadence/active/tagValueId),
  `createItem` (ceiling → `remaining=ceiling` on first create), `getItem`, `updateItem` (name/unitPrice/
  ceiling/cadence/active/metadata; **direction + unit immutable**), `applyMovement` (in a tx: ceiling guard
  via `computeRemainingAfter`, `value_minor` signed, idempotent via the unique key), `listMovements`,
  `getPLReport` (SUM per item in the date window → pure `foldPL`).
- **`src/services/tag.service.ts`** — `listTagGroups` (groups + nested values), `createTagGroup`,
  `createTagValue`, `setItemTags` (replace-all; enforces **one value per group**).
- **`src/lib/bo-money.ts`** (pure, unit-tested) — `computeRemainingAfter`, `movementValueMinor`, `foldPL`.
- **`src/routes/bo.ts`** — items/movements/tags/reports; **writes behind `adminAuth`**, reads open.
  **`src/validation.ts`** — bo schemas. **`db/mappers.ts`** — bo DTOs. Mounted `/api/v1/bo/*` (see D1).

**Verification**
- `bunx tsc --noEmit` → clean; `bun test` → **48 pass / 0 fail** — added `bo-money.test.ts` (9: ceiling
  guard both directions + override, signed value for sale/reversal, P&L fold income/expense/profit +
  by-direction/cadence + zero-net drop) and `bo.test.ts` (3: POST /items no token → **401**, valid token +
  bad body → **400**, non-int qty → **400**). DoD math (remaining 98, value 3000, FIXED_MONTHLY expense) is
  covered by the pure tests.
- ⚠️ DB-runtime paths (create/movement/report round-trips) verified by inspection (brownfield — no DB); the
  ceiling/value/P&L logic is pure-tested and the admin-JWT gate is route-tested.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **D1 — mounted under `/api/v1/bo/*`, not bare `/items` `/reports/pl`.** The old `ops.*` routes are **still
  live** (REQ-001/002 are DELIVERED and use `/api/v1/catalog/items`, `/api/v1/reports/pl`). Mounting bo at the
  bare paths would collide on `/reports`. So the new backoffice lives under `/api/v1/bo/*` and coexists with the
  dormant ops routes (which I did NOT unmount, to avoid breaking the live REQ-001/002). @Fern's TASK-023 targets
  `/bo/*`. OK, or do you want ops unmounted + bo at the root once REQ-001/002's ops usage is retired?
  > answer (Sober): **`/api/v1/bo/*` is correct — keep it.** REQ-001/002 are DELIVERED and still use the ops
  > paths; do NOT break them. `bo` coexists now; **unmounting the ops routes + moving `bo` to the root is a
  > later cleanup** — part of retiring ops after the data migration (TASK-025) + freelance re-absorb (TASK-024)
  > land and nothing live uses ops. I'll track it as an ops-retirement step in the REQ-006 deploy note. TASK-023
  > correctly targets `/bo/*`.
- **D2 — `value_minor = −qty × unit_price` (signed), not `|qty|`.** ... OK to keep?
  > answer (Sober): **Keep the signed rule — you're right, my SPEC wording was imprecise.** `−qty × unit_price`
  > (OUT positive, IN/reversal negative) is the financially-correct reading: `SUM(value_minor)` nets sales-vs-
  > returns and draws-vs-reversals (the reversible-P&L property TASK-001 needed a special `BOOKING_REVERSAL`
  > filter for — here it falls out of the sign for free). Matches the DoD number too. **I've corrected the
  > design doc + SPEC-006** to the signed rule so the docs match the code.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `backoffice-back`: `bun test` → **48 pass / 0 fail**, `tsc` 0.
Read the pure `bo-money.ts` + the routes:
- **`computeRemainingAfter`** — `remaining + qty`; blocked if `< 0 && !allowNegative`. Correct (signed qty; OUT
  reduces remaining; per-item override allows negative). ✓
- **`movementValueMinor = −qty × unit_price`** — signed so `SUM` nets reversals (D2, approved — the correct
  reading). ✓
- **`foldPL`** — income = Σ INCOME, expense = Σ EXPENSE, profit = income − expense; byDirection/byCadence/byItem
  (zero-net items dropped). Clean, unit-tested (9 money cases). ✓
- **Auth** — all writes (`POST/PATCH/PUT` items/movements/tags) behind `adminAuth` (REQ-002 single-admin JWT),
  reads open; route-tested (no token → 401, bad body → 400). Mounted `/api/v1/bo/*`, coexisting with dormant ops
  (D1, approved). Pure math + auth tested; DB round-trips accepted under brownfield. No rework.
**TASK-023 unblocked.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-022 | backoffice-back: universal item/movement/tag API + P&L report (single-admin JWT) | SPEC-006 | DONE | Jason | TASK-021 |
```
