# TASK-118: backoffice-front (FE) — stock field on the Items screen (set/edit/unlimited + remaining + revenue)
- Source: SPEC-034 §5 (REQ-035)
- Status: POST-GO-LIVE / FAST-FOLLOW (REQ-035 out of the 3-day launch — owner 2026-08-04; deps TASK-116)
- Depends on: TASK-116 (`kind` + stock on the item DTO)
- Assignee: @Fern (smart-scheduler-backoffice-front)

## What to build
Extend the existing backoffice **Items** screen (no new screen):
- **A stock/ceiling field** — set a number, or leave blank = **unlimited**. Editing sets/clears `ceilingQty`.
- **Show `remaining / ceiling`** (or **"—/unlimited"** when no ceiling) + the **revenue per item**.
- **`kind`** shown as a read-only structural property (not editable — a mistag breaks the sale flow).

## Definition of Done
- [ ] Staff can set an item's stock, edit it, or clear it to unlimited; the value persists.
- [ ] The screen shows remaining/ceiling (or "—/unlimited") and revenue per item; `kind` is read-only.
- [ ] tsc clean; build ok. Measure any new shared-row control at 1600/1280/768/375 (board STANDING RULE).

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-118 | backoffice-front (FE): Items-screen **stock field** (set/edit/unlimited) + `remaining/ceiling` + revenue-per-item + read-only `kind` | SPEC-034 | **BLOCKED** (TASK-116) | Fern | TASK-116 |
```
