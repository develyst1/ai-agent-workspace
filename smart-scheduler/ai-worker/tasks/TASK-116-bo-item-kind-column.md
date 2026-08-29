# TASK-116: backoffice-back (BE) — structural `kind` on `bo.item` (1:1 with booking types)
- Source: SPEC-034 §1 (REQ-035)
- Status: POST-GO-LIVE / FAST-FOLLOW (owner 2026-08-04 — REQ-035 out of the 3-day launch; first fast-follow after ship)
- Depends on: — (owns `bo`; the REQ-032 migration-verify gate applies)
- Assignee: @Jason (smart-scheduler-backoffice-back)

## What to build
1. **Migration:** add a `kind` column to `bo.item` — enum `FIRST_TRIAL | SINGLE_SESSION | COURSE_PACKAGE | VOUCHER |
   RETAIL`. Structural (not a badge/tag) — the sale flow branches on it, and a mistag would break the plan.
2. **Seed/reseed sets `kind`** 1:1 from the `external_ref` pattern: `course-*`→COURSE_PACKAGE, `session-*`→
   SINGLE_SESSION, `voucher-*`→VOUCHER, `first-trial`→FIRST_TRIAL (rental/RETAIL as applicable). Reseeding the catalog
   is owner-approved (REQ-035 §Constraints) if the current seed doesn't map cleanly.
3. **DTO exposes** `kind` + `remaining/ceiling` (so the picker and the Items screen can read them).

## Definition of Done
- [ ] `kind` column added (migration passes the REQ-032 `db:verify`); every seeded item has a `kind` matching its ref.
- [ ] `kind` maps 1:1 to the 4 booking types (RETAIL = POS, no booking); exposed on the item DTO.
- [ ] `bunx tsc --noEmit` clean; `bun test` green. ⚠️ Deploy: migration + reseed, per the REQ-032 gate.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-116 | backoffice-back (BE): structural **`kind`** column on `bo.item` (1:1 with booking types) + seed/reseed sets it; DTO exposes `kind`+`remaining/ceiling` | SPEC-034 | **TODO** (blocked on Porter go-live-vs-fast-follow) | Jason | — |
```
