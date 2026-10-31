# TASK-140: blueprint-front — regenerate the API types for seam v2 (REQ-105 DEF-1)
- Source: SPEC-106 § Front (corrected 2026-10-30, F-036) · TEST-110 § DEF-1 (joint)
- Owner: FE (Fern)
- Status: DONE (2026-10-30 11:4x, Sober — § Review)
- Depends on: TASK-113 DONE (its `openapi.json` is in blueprint-back's working tree, uncommitted until REQ-105's git) · blueprint-front HEAD `b041cbd`, clean

## Why
TASK-113 added 4 routes to blueprint-back's `openapi.json` (`/spec`, `/spec/changes`, `/spec/locate`, `/spec/parts/{key}/context`). blueprint-front's `check:api` compares `src/core/api/schema.d.ts` with that file, and it goes red. The diff is additive only (QA: 296 added, 0 removed). The front calls none of these routes, so there is nothing to change besides the generated file.

## What to do
1. In blueprint-front, with blueprint-back beside it as today (TASK-113's tree): `bun run gen:api`.
2. Nothing else. Do not hand-edit `schema.d.ts`. If any line is **removed** or changed rather than added, stop and ask here (that would be a contract change, not DEF-1).

Closed file list: `src/core/api/schema.d.ts`. No git.

## Definition of Done
- [x] 1. `bun run check:api` → exit 0, "matches the OpenAPI document" (base: exit 1, "src/core/api/schema.d.ts differs from the OpenAPI document (run `bun run gen:api`)", Sober 2026-10-30 11:3x, and QA `joint/bp-front-check-api.txt`)
- [x] 2. `git diff --numstat` → `src/core/api/schema.d.ts` only, with 0 removed lines; paste it (base: empty, Sober 11:3x)
- [x] 3. `bun run typecheck` → exit 0 · `bun test src` → `235 pass / 0 fail` (base: exit 0 · `235 pass / 0 fail`, Sober 11:3x)

## Implementation Notes
Fern, 2026-10-30 ~11:5x. `blueprint-front`, branch `atom`, HEAD `b041cbd`, tree clean before. No git write run.
- Base: `bun run check:api` → exit 1 (as the TASK says).
- `bun run gen:api` (from `../blueprint-back/openapi.json`, TASK-113's working tree) → `schema.d.ts` regenerated; nothing hand-edited.
- **DoD:**
  - 1. `bun run check:api` → "src/core/api/schema.d.ts matches the OpenAPI document", exit 0 ✓
  - 2. `git diff --numstat` → `296	0	src/core/api/schema.d.ts` — one file, 0 removed ✓ (matches QA's 296 added / 0 removed, so no contract change)
  - 3. `bun run typecheck` → exit 0 · `bun test src` → `235 pass / 0 fail`, `Ran 235 tests across 10 files. [5.98s]` ✓
- `git status --short` → ` M src/core/api/schema.d.ts` only. No ports started, no test data.

## Questions

## Review
**DONE** (Sober, 2026-10-30 11:4x). Re-run by me in blueprint-front:
- `git status --short` → ` M src/core/api/schema.d.ts` only · `git diff --numstat` → `296	0	src/core/api/schema.d.ts`.
- The added path keys are exactly the 4 v2 routes: `/v1/projects/{projectId}/spec`, `…/spec/changes`, `…/spec/locate`, `…/spec/parts/{key}/context`. Nothing removed, so no contract change.
- `bun run check:api` → "matches the OpenAPI document", exit 0 · `bun run typecheck` → exit 0 · `bun test src` → `235 pass / 0 fail`.
- The file is generated (`gen:api`), not hand-edited. Within the closed list. No git.
Commit note: this goes up with REQ-105 A as blueprint-front's own topic, after blueprint-back's REQ-105 commit (whose `openapi.json` it mirrors).
