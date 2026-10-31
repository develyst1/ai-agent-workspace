# TASK-150: caw-front — gen:api for the requirements route (REQ-118)
- Source: SPEC-117 § Consumers (new route → `schema.d.ts`)
- Owner: FE (Fanta)
- Status: DONE (2026-10-30 17:1x, Silver; § Review) — was: REVIEW (Fanta, 2026-10-30) — was: IN_PROGRESS — was: TODO — released 2026-10-30 17:1x, Silver (TASK-149 DONE; its `openapi.json` is in the caw-back tree, +82 lines, new route only). Was ON HOLD until TASK-149 DoD 9 (`openapi.json`). The REQ-119 front commit is done (`7a2a6a5`). Bases refreshed 2026-10-30 16:5x, Silver.
- Depends on: TASK-149 `openapi.json` · REQ-119 committed in caw-front (`7a2a6a5`) ✓ — same file `schema.d.ts`

## What to do
Repo `caw-front`, branch `atom`. **No git.** The front calls nothing new and shows nothing new (uncovered requirements reuse the REQ-112 line: `Uncovered.tsx` reads `key`/`title`, SPEC-117 D3).
1. `bun run gen:api` → `src/api/schema.d.ts` gains the `/v1/projects/{projectId}/requirements` path; nothing else in its diff.
Closed file list: `src/api/schema.d.ts`. Anything else → `## Questions`.

## Definition of Done
(bases re-run on caw-front `7a2a6a5` + caw-back `b6fbfaf`, both clean, SA 2026-10-30 16:5x: 1 = `0` · 2 = `0` · 3 = `match` · 4 = typecheck `0`, `355 pass · 0 fail · Ran 355 tests across 26 files`. First bases were on `b4f2659` 15:5x)
- [ ] 1. Before: `git status --short | wc -l` → `0` (base: `0`)
- [ ] 2. `grep -c "/requirements" src/api/schema.d.ts` → ≥ 1 (base: `0`)
- [ ] 3. `cmp <(bunx openapi-typescript ../caw-back/openapi.json) src/api/schema.d.ts && echo match` → `match` (base: `match`)
- [ ] 4. `bun run typecheck` → `0` · `bun test src` → `0 fail` (base: `0` · `Ran 355 tests across 26 files`, `0 fail`)
- [ ] 5. After: `git status --short` → ` M src/api/schema.d.ts` only (base: n/a — new)

## Implementation Notes
Fanta (FE, B), 2026-10-30. `caw-front`, branch `atom`, HEAD `7a2a6a5` before and after, no git. `bun run gen:api` from caw-back's working-tree `openapi.json`; `src/api/schema.d.ts` +65 / −0 (the `/v1/projects/{projectId}/requirements` path and its types, additions only). No other file touched.

**DoD (my run)**
1. `git status --short | wc -l` before → `0` ✓
2. `grep -c "/requirements" src/api/schema.d.ts` → `1` ✓
3. `cmp <(bunx openapi-typescript ../caw-back/openapi.json) src/api/schema.d.ts && echo match` → `match` ✓
4. `bun run typecheck; echo $?` → `0` · `bun test src` → `355 pass · 0 fail`, `Ran 355 tests across 26 files` ✓
5. `git status --short --untracked-files=all` → ` M src/api/schema.d.ts` only ✓

Build and e2e not run (not in this TASK's DoD; no code reads the new path). **UNVERIFIED:** nothing in the front calls the route, so only the types are checked.

## Questions

## Review
**DONE — Silver (SA B), 2026-10-30 17:1x.** I re-ran every check on caw-front `7a2a6a5`:
- `git status --short --untracked-files=all` → ` M src/api/schema.d.ts` only, `+65 / −0`, no removed line.
- `cmp` against `bunx openapi-typescript ../caw-back/openapi.json` (TASK-149's tree) → `match`.
- typecheck exit `0`.
- `bun test src` → `355 pass · 0 fail · Ran 355 tests across 26 files`.

This matches SPEC-117 § Consumers: types only, and the front calls nothing new. The UNVERIFIED line is right, since no front code reads the path.
Tree fingerprints after review (`tools/tree-fp.sh`, 17:13): caw-back `b6fbfaf` fp `a5e46d86d6b7` (249 paths, 2 untracked) · caw-front `7a2a6a5` fp `0c57fd1ec4c8`.
