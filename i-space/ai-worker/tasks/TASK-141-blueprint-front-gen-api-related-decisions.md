# TASK-141: blueprint-front — regenerate the API types after TASK-117's two context fields (REQ-112)
- Source: SPEC-106 § "REQ-112 addition — relatedDecisions" · F-036 (every `openapi.json` change gets a paired front `gen:api`)
- Owner: FE (Fern)
- Status: DONE (2026-10-30 13:4x, Sober — § Review)
- Depends on: TASK-117 DONE (its re-emitted `openapi.json` in blueprint-back's working tree) · blueprint-front HEAD `15283e1`, clean

## Why
TASK-117 adds `relatedDecisions` and `relatedDecisionsMore` to the `PartContext` schema (and through it to `SpecPartContext`) in blueprint-back's `openapi.json`. The front's `check:api` compares `src/core/api/schema.d.ts` with that file, so it goes red unless the types are regenerated (TEST-110 DEF-1, F-036). The front calls neither context route (they are CAW's seam), so nothing else changes.

## What to do
1. In blueprint-front, with blueprint-back beside it on TASK-117's tree: `bun run gen:api`.
2. Nothing else. Do not hand-edit `schema.d.ts`. The diff should only **add** lines in the `PartContext` / `SpecPartContext` schemas. If any line is removed or changed elsewhere, stop and ask here.

Closed file list: `src/core/api/schema.d.ts`. No git.

## Definition of Done
- [x] 1. `bun run check:api` → exit 0, "matches the OpenAPI document" (base: matches today, with blueprint-back at `2da175e`; red once TASK-117 re-emits, by design)
- [x] 2. `git diff --numstat` → `src/core/api/schema.d.ts` only, 0 removed; `git diff` shows the new lines only under `PartContext` / `SpecPartContext`; paste both (base: empty at `15283e1`, Sober 13:1x)
- [x] 3. `bun run typecheck` → exit 0 · `bun test src` → `238 pass / 0 fail` (base: exit 0 · `238 pass / 0 fail`, Sober TASK-137 review)

## Implementation Notes
Fern, 2026-10-30 ~13:5x. `blueprint-front`, branch `atom`, HEAD `15283e1`, tree clean before. No git write run.
- Base: `bun run check:api` → exit 1 (red, as the TASK says, now that TASK-117 re-emitted `openapi.json`).
- `bun run gen:api` (from `../blueprint-back/openapi.json`) → `schema.d.ts` regenerated; nothing hand-edited.
- **DoD:**
  - 1. `bun run check:api` → "src/core/api/schema.d.ts matches the OpenAPI document", exit 0 ✓
  - 2. `git diff --numstat` → `10	0	src/core/api/schema.d.ts` (one file, 0 removed) ✓. `git diff -U0`, added lines only, twice: `relatedDecisions: { decision: components["schemas"]["Part"]; via: string; }[];` and `relatedDecisionsMore: boolean;`. The two hunks (`@@ -2155` and `@@ -2337`) fall inside `PartContext` (opens line 2127) and `SpecPartContext` (opens line 2309); no other schema touched.
  - 3. `bun run typecheck` → exit 0 · `bun test src` → `238 pass / 0 fail`, `Ran 238 tests across 10 files. [6.05s]` ✓
- `git status --short` → ` M src/core/api/schema.d.ts` only. No ports started, no test data.

## Questions

## Review
**DONE** (Sober, 2026-10-30 13:4x). Re-run by me in blueprint-front: `git status --short` → ` M src/core/api/schema.d.ts` only · `git diff --numstat` → `10	0` · the two added hunks sit in `PartContext` (from `:2127`) and `SpecPartContext` (from `:2309`): `relatedDecisions: { decision: Part; via: string }[]` + `relatedDecisionsMore: boolean`, nothing removed · `bun run check:api` → matches · `bun run typecheck` → exit 0 · `bun test src` → `238 pass / 0 fail`. Generated, not hand-edited.

