# TASK-131: blueprint-front — take the new `op_renamed` adjustment into the API types (REQ-110 round 4)
- Source: SPEC-105 § Round 4 (contract changes)
- Owner: FE (Fern)
- Status: DONE — released 2026-10-30 (TASK-130 DONE; `grep -c op_renamed openapi.json` → 1 in blueprint-back)
- Depends on: TASK-130 DoD 2. Same topic, same uncommitted tree: commit nothing.

## What to do
The back adds `"op_renamed"` to `roundAdjusted[].what`. The server read the model's `type` as `op`, and **the user never sees it**: `load.ts:113` shows only `field_dropped`, which is correct and stays.
1. `bun run gen:api` → `src/core/api/schema.d.ts`.
2. `src/features/chat/load.ts:31`: add `op_renamed` to the doc comment that lists the `what` values. No behaviour change.
3. Add one unit test in `src/features/chat/load.test.ts`: a row whose `roundAdjusted` holds only `op_renamed` entries shows **no** extra line (the same output as with no adjustments).

Closed file list: `src/core/api/schema.d.ts` · `src/features/chat/load.ts` (comment only) · `src/features/chat/load.test.ts`. No git.

## Definition of Done
- [ ] 1. `grep -c op_renamed src/core/api/schema.d.ts` → ≥ 1 (base: `0`, Sober 22:3x)
- [ ] 2. `bun run check:api` → "schema.d.ts matches the OpenAPI document" (base: matches, exit 0, Sober 22:3x, before TASK-130)
- [ ] 3. `bun run typecheck` → exit 0 (base: exit 0, Sober 18:5x, TASK-128 § Review)
- [ ] 4. `bun test src` → 235 pass / 0 fail (base: `234 pass / 0 fail`, Sober 18:5x)
- [ ] 5. `git status --short` → the same 7 ` M` lines as TASK-128 DoD 3, nothing else (base: those 7, Sober 18:5x)

## Implementation Notes
Fern, 2026-10-30 ~00:4x. `blueprint-front`, branch `atom`, HEAD `a52e022`; before: the 7 ` M` lines of TASK-128 DoD 3, `grep -c op_renamed src/core/api/schema.d.ts` → 0. No git write run.
1. `bun run gen:api` (from `../blueprint-back/openapi.json`) → `schema.d.ts` regenerated.
2. `load.ts:31`: `op_renamed` added to the doc comment list of `what` values. Comment only.
3. `load.test.ts`: one new test — a row whose `roundAdjusted` holds only two `op_renamed` entries: `adjustedLines` → `[]` and the row text equals the text with `roundAdjusted: null`.
4. **DoD results:**
   - 1. `grep -c op_renamed src/core/api/schema.d.ts` → `1` ✓
   - 2. `bun run check:api` → "src/core/api/schema.d.ts matches the OpenAPI document", exit 0 ✓
   - 3. `bun run typecheck` → exit 0 ✓
   - 4. `bun test src` → `235 pass / 0 fail`, `2483 expect() calls`, `Ran 235 tests across 10 files. [6.43s]` ✓
   - 5. `git status --short` → the same 7 ` M` lines, nothing else ✓ (`git diff --stat`: 7 files, 330 insertions, 11 deletions, includes TASK-110/124/127 work)
5. Note: the new test is a guard, not a red-first test — `load.ts` already ignored every `what` except `field_dropped`, so it passes on the base too (UNVERIFIED red-first: not run against a base, by design — no behaviour changed).
6. Footprint: no ports started, no test data, no files outside the closed list.

## Questions

## Review
Sober (SA, A), 2026-10-30 00:4x — **DONE.** Sober's re-run in `blueprint-front`: `grep -c op_renamed src/core/api/schema.d.ts` → `1` · `check:api` → matches · typecheck exit 0 · `bun test src` → `235 pass / 0 fail`, 2483 expects · `git status --short` → the same 7 ` M` lines · `load.ts` diff: comment only (`:31` lists `op_renamed`). Accepted that the new test is a guard (it passes on the base), as the TASK asked for no behaviour change.
