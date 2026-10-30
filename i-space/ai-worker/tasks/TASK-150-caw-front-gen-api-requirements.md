# TASK-150: caw-front — gen:api for the requirements route (REQ-118)
- Source: SPEC-117 § Consumers (new route → `schema.d.ts`)
- Owner: FE (Fanta)
- Status: TODO, ON HOLD until TASK-149 DoD 9 and REQ-119 front committed — I release it (2026-10-30 16:1x, Silver)
- Depends on: TASK-149 `openapi.json` · REQ-119 committed in caw-front (`<hash>`) — same file `schema.d.ts`

## What to do
Repo `caw-front`, branch `atom`. **No git.** The front calls nothing new and shows nothing new (uncovered requirements reuse the REQ-112 line: `Uncovered.tsx` reads `key`/`title`, SPEC-117 D3).
1. `bun run gen:api` → `src/api/schema.d.ts` gains the `/v1/projects/{projectId}/requirements` path; nothing else in its diff.
Closed file list: `src/api/schema.d.ts`. Anything else → `## Questions`.

## Definition of Done
(bases on `b4f2659` + caw-back `4cc3241`, SA 15:5x; re-run at release)
- [ ] 1. Before: `git status --short | wc -l` → `0` (base: `0`)
- [ ] 2. `grep -c "/requirements" src/api/schema.d.ts` → ≥ 1 (base: `0`)
- [ ] 3. `cmp <(bunx openapi-typescript ../caw-back/openapi.json) src/api/schema.d.ts && echo match` → `match` (base: `match`)
- [ ] 4. `bun run typecheck` → `0` · `bun test src` → `0 fail` (base: `0` · `Ran 355 tests across 26 files`, `0 fail`)
- [ ] 5. After: `git status --short` → ` M src/api/schema.d.ts` only (base: n/a — new)

## Implementation Notes

## Questions

## Review
