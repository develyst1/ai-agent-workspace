# TASK-009: ops — PATCH /catalog/items/:id (edit item)
- Source: SPEC-001 (split out of TASK-003 — REQ-001 "edit budget/rate")
- Status: DONE
- Depends on: TASK-001 (DONE)
- Assignee: @Jason (smart-scheduler-backoffice-back, port 3002)

## What to do
Add an update endpoint for catalog items so admins can **edit** a freelance budget
item's rate / monthly budget / near-cap threshold (also benefits the generic Items
screen, which likewise has no edit). Files: `src/routes/catalog.ts`,
`src/services/inventory.service.ts`, `src/lib/validation.ts`, `src/types/contract.ts`.

1. **`PATCH /api/v1/catalog/items/:id`** (`adminOrService`) — partial update of:
   `name?`, `salePriceMinor?` (rate), `reorderLevel?` (near-cap threshold), `active?`,
   and **`metadata?`** (so `monthlyBudgetMinor` is editable). Do NOT allow changing
   `sku`/`item_group`/`item_type`/`external_*` here (identity/classification stay fixed).
2. **`metadata` merge semantics**: shallow-merge the provided keys into existing
   `metadata` (don't clobber other keys) — or document replace-semantics; pick one and
   state it. Recommend **shallow-merge** so editing `monthlyBudgetMinor` keeps `kind`.
3. Validation: all fields optional; `salePriceMinor`/`reorderLevel` ≥ 0 ints; return the
   updated `CatalogItemDTO` (404 if not found).
4. **Note**: editing `monthlyBudgetMinor` (the reset target) does **not** change current
   remaining stock — remaining changes only via movements (reset/top-up/draw). That's
   correct: an edited budget takes effect at the next monthly reset (TASK-005). Call this
   out in the response/docs so the FE (TASK-010) can message it.

## Definition of Done
- [ ] `PATCH /catalog/items/:id` updates rate/reorder/active/metadata and returns the new DTO.
- [ ] Editing `metadata.monthlyBudgetMinor` preserves `metadata.kind` (shallow-merge).
- [ ] Identity/classification fields are not mutable via PATCH; 404 on missing id.
- [ ] `bun test` + `bunx tsc --noEmit` clean; add an update test.

## Implementation Notes
Repo: `smart-scheduler-backoffice-back` (port 3002).

- **Route** `PATCH /api/v1/catalog/items/:id` (`adminOrService`, `v.updateCatalogItem`) → `updateCatalogItem`.
  Declared right after `GET /:id`; no conflict with the static `by-ref/movements` (declared earlier) or
  the `:id/movements` sub-paths.
- **`updateCatalogItem(id, input)`** (`inventory.service.ts`) — 404 if missing; builds a patch from only
  the provided `name`/`salePriceMinor`/`reorderLevel`/`active`/`metadata`. **Identity/classification
  (`sku`, `item_group`, `item_type`, `external_*`) are not accepted** (not in the DTO/validation, so
  unmutable via PATCH). Empty patch → returns current DTO (avoids a drizzle empty-`set` error). Returns
  the updated `CatalogItemDTO` (with balance).
- **metadata = shallow-merge** via an extracted pure `mergeMetadata(existing, incoming)`:
  `{...existing, ...incoming}` so editing `monthlyBudgetMinor` keeps `kind`; `undefined` incoming leaves
  metadata untouched.
- **Validation** (`v.updateCatalogItem`): all optional; `salePriceMinor`/`reorderLevel` ≥ 0 ints
  (`reorderLevel` nullable); `metadata` a record. Contract: `UpdateCatalogItemRequest`.
- Per task #4: editing `monthlyBudgetMinor` does **not** change current `quantity_on_hand` — the new
  budget applies at the next monthly reset (TASK-005). Noted here for TASK-010's FE messaging.

**Verification**
- `bunx tsc --noEmit` → clean (exit 0).
- `bun test` → **11 pass / 0 fail** (added `inventory.test.ts`, 4 cases covering the shallow-merge:
  monthlyBudgetMinor edit preserves kind, undefined = no-op, null-existing, null+undefined).
- ⚠️ The PATCH round-trip (persist + return DTO, 404) is DB-runtime, **verified by inspection**, not
  executed (brownfield: no DB). The business rule under test (shallow-merge) is covered purely.

**@Fern — TASK-010 unblocked.** `PATCH /catalog/items/:id` accepts `{name?, salePriceMinor?,
reorderLevel?, active?, metadata?}` and returns the updated item. For a Freelance Budget edit send
`salePriceMinor` (rate), `reorderLevel` (near-cap), and `metadata:{monthlyBudgetMinor}` (merges, keeps
`kind`). Message that a budget edit takes effect at the next monthly reset, not immediately.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- None — followed the task as written (adminOrService, shallow-merge, identity fields locked).

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `smart-scheduler-backoffice-back`: `bun test` →
**11 pass / 0 fail**, `tsc` exit 0. Verified `PATCH /catalog/items/:id` is a distinct method that
doesn't shadow `by-ref/movements` (declared earlier) or `/:id/movements`; `mergeMetadata` shallow-merges
only when `metadata` is provided (editing `monthlyBudgetMinor` keeps `kind` — covered by the 4 unit
tests); identity/classification fields are not accepted; empty-patch guard avoids a drizzle error. The
"budget edit takes effect at next reset, not current remaining" note is correctly surfaced for TASK-010.
DB round-trip verified by inspection (brownfield) — accepted. No rework. **TASK-010 unblocked.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-009 | ops: PATCH /catalog/items/:id (edit item) | SPEC-001 | DONE | Jason | TASK-001 |
```
