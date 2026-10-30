# TASK-146: blueprint-front — gen:api for `requirements` in part context (REQ-118)
- Source: SPEC-115 (API / Interface, Consumers)
- Owner: FE (Fern)
- Status: TODO, ON HOLD until TASK-145 re-emits `openapi.json` (2026-10-30 15:3x, Sober)
- Depends on: TASK-145 DoD 2 · blueprint-front's previous topic committed: REQ-115's TASK-135 (same file `schema.d.ts`) — the SA fills the hash at release

## What to do
The back adds `requirements` to the part-context bodies. **Nothing on screen changes.** The front reads no context route.
1. `bun run gen:api` → `src/core/api/schema.d.ts`.

Closed file list: `src/core/api/schema.d.ts`. No git.

## Definition of Done
- [ ] 1. `grep -c "requirements" src/core/api/schema.d.ts` → ≥ 1 (base: `0` on `09f2717`, Sober 15:3x — `git show 09f2717:src/core/api/schema.d.ts | grep -c requirements`)
- [ ] 2. `bun run check:api` → matches (base: matches, exit 0, Sober 15:2x on `09f2717`)
- [ ] 3. `bun run typecheck` → exit 0 · `bun test src` → 0 fail (base: exit 0 · `238 pass / 0 fail`, Sober 15:2x on `09f2717`)
- [ ] 4. `git status --short` → ` M src/core/api/schema.d.ts` only (base: empty on `09f2717`, Sober 15:2x)

## Implementation Notes

## Questions

## Review
