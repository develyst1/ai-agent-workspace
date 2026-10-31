# TASK-146: blueprint-front — gen:api for `requirements` in part context (REQ-118)
- Source: SPEC-115 (API / Interface, Consumers)
- Owner: FE (Fern)
- Status: DONE (2026-10-30 17:30, Sober — § Review) — released 2026-10-30 17:28 by Sober (TASK-145 DONE, back `openapi.json` re-emitted; blueprint-front still clean on `b08d23a`, so the bases below hold)
- Depends on: TASK-145 DoD 2 (back `openapi.json` re-emitted) · REQ-115 (TASK-135) committed (`b08d23a`) ✓ 2026-10-30 16:4x

## What to do
The back adds `requirements` to the part-context bodies. **Nothing on screen changes.** The front reads no context route.
1. `bun run gen:api` → `src/core/api/schema.d.ts`.

Closed file list: `src/core/api/schema.d.ts`. No git.

## Definition of Done
- [ ] 1. `grep -c "requirements" src/core/api/schema.d.ts` → ≥ 1 (base: `0` on `b08d23a`, Sober 16:5x — `git show b08d23a:src/core/api/schema.d.ts | grep -c requirements`)
- [ ] 2. `bun run check:api` → matches (base: `schema.d.ts matches the OpenAPI document`, exit 0, Sober 16:5x on `b08d23a`)
- [ ] 3. `bun run typecheck` → exit 0 · `bun test src` → 0 fail (base: exit 0 · `238 tests, 0 fail`, Sober 16:5x on `b08d23a`)
- [ ] 4. `git status --short` → ` M src/core/api/schema.d.ts` only (base: empty on `b08d23a`, Sober 16:5x)
- Probe (SPEC-115 § API, 17:00): with the back patch, front gen:api / typecheck / check:api / test src all exit 0 — so `schema.d.ts` is the whole list.

## Implementation Notes
Fern, 2026-10-30 ~17:3x. `blueprint-front`, branch `atom`, HEAD `b08d23a`, tree clean before (`git status --short | wc -l` → 0). No git write run.
- Base (before `gen:api`): `grep -c requirements src/core/api/schema.d.ts` → `0`; `bun run check:api` → exit 1. That differs from the TASK's base line ("matches", Sober 16:5x) only because TASK-145 has since re-emitted the back's `openapi.json` — the red is the reason for this TASK, not a surprise.
- `bun run gen:api` (from `../blueprint-back/openapi.json`) → `schema.d.ts` regenerated; nothing hand-edited.
- **DoD:**
  - 1. `grep -c "requirements" src/core/api/schema.d.ts` → `2` ✓
  - 2. `bun run check:api` → "src/core/api/schema.d.ts matches the OpenAPI document", exit 0 ✓
  - 3. `bun run typecheck` → exit 0 · `bun test src` → `238 pass / 0 fail`, `Ran 238 tests across 10 files. [5.93s]` ✓
  - 4. `git status --short` → ` M src/core/api/schema.d.ts` only ✓; `git diff --numstat` → `2	0	src/core/api/schema.d.ts`, the two added lines are `requirements: components["schemas"]["Part"][];` (twice), nothing removed.
- No ports started, no test data.

## Questions

## Review
**DONE** — Sober, 2026-10-30 17:30. Re-run by me on blueprint-front `b08d23a` + this TASK's 1 path (back = blueprint-back working tree with TASK-145):
- `git status --short` → ` M src/core/api/schema.d.ts` only; `git diff` = 2 added lines `requirements: components["schemas"]["Part"][];`, in `PartContext` (before `version`) and `SpecPartContext` (before `revision`), nothing removed.
- `grep -c requirements src/core/api/schema.d.ts` → `2` · `bun run check:api` → "matches the OpenAPI document" · `bun run typecheck` → exit 0 · `bun test src` → 238 pass / 0 fail. Same as Fern's.
- Fern's note on the base is right: check:api went red when TASK-145 re-emitted the back's `openapi.json`. That is the reason for this TASK, not a regression.
- tree-fp 17:30: blueprint-front `b08d23a` fp `3a86ddf81dbf` · blueprint-back `93249a7` fp `c51f8477e700`.
