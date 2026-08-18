# REQ-024: อ.9 cannot be routed by the real /download endpoint — add its per-family resolver leg

- Status: READY_FOR_SA
- Priority: HIGH — **blocks อ.9 going to production**
- Requested: 2026-08-18 by Porter (found by Sober during TASK-018 review)
- Deadline: before any อ.9 production deploy

## Problem
The `/api/v1/download/checklist/{enc}` resolver decides which report to build by reading
`T_T_REQUEST_SPECIAL` and switching on its `FORM_ID`, with a `9/10 → A9` branch.

`T_T_REQUEST_SPECIAL` contains **only FORM_ID 6** (70 rows — confirmed by the human, board
ARCHITECTURE FACT). So the `9/10 → A9` branch **can never match**. A real อ.9 request is never routed
to the อ.9 report by the production endpoint.

This is the same root cause as the original "อ.9 download serves mock data" defect. TASK-008 fixed the
*builder* (`createData` now decrypts → `buildFromDb`), which is why our `/a9/db/{id}` QA seam works —
but the *routing* leg was never fixed, so the production path is still broken.

## Requirement
1. Add a **`resolveFromMove` leg** for อ.9 — look up `T_T_REQUEST_MOVE` by request id and route to the
   อ.9 report, exactly the shape of the `resolveFromSaleInt` leg added in TASK-018.
2. Keep the existing variant split intact: `MOVE_REQUEST_TYPE = 2` → destroy, else transport (REQ-019).
3. **Surgical** — do not change `resolveFromSpecial` or the `REQUEST_TYPE` fallback. อ.6, อ.14 and
   every other report must route exactly as they do today.
4. The dead `9/10 → A9` branch in the SPECIAL switch should be removed or commented as unreachable, so
   the next person doesn't trust it.

## Acceptance Criteria
- [ ] A real อ.9 request downloaded via `/api/v1/download/checklist/{enc}` returns the **อ.9 report
      built from its own data** — matching what `/a9/db/{id}` returns for the same request.
- [ ] Both variants route correctly (a transport request and, when one exists, a destroy request).
- [ ] อ.6, อ.14 and all other forms route unchanged — no regression.

## Constraints
- Oracle 11.2-safe; `List` + `firstOrNull`.
- Verify on the real DB path, not the mock preview.

## Traceability
- Board: `ARCHITECTURE FACT` (each family has its own table + FORM_ID) and the
  `a9 resolver latent defect (REQ-014)` row.
- Pattern to copy: `resolveFromSaleInt`, TASK-018 (SPEC-023 Delta 1).

## Priority note
Ahead of อ.4–อ.8. อ.9 is otherwise finished and verified; without this, it cannot ship.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
