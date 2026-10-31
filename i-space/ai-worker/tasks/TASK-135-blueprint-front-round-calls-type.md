# TASK-135: blueprint-front — take `roundCalls` / quiz `calls` into the API types (REQ-115)
- Source: SPEC-112 (API / Interface)
- Owner: FE (Fern)
- Status: DONE (2026-10-30 16:0x, Sober — § Review) — unblocked 2026-10-30 16:0x (Sober, Q1 answered: + `ready/load.test.ts` one key) — released 2026-10-30 16:0x (Sober): TASK-134 DONE, its `openapi.json` has `roundCalls` (2 hits); front still clean on `09f2717`
- Depends on: TASK-134 DoD 2 ✓ · blueprint-front's previous topic committed: REQ-112 `09f2717` ✓ (HEAD, tree clean; Sober 15:2x — REQ-116 had no front code)

## What to do
The back adds a record of each gateway call. **Nothing on screen changes.**
1. `bun run gen:api` → `src/core/api/schema.d.ts`.
2. If `src/features/chat/load.ts` maps messages field by field and its typecheck breaks, add `roundCalls` to the input type only. Nothing reads it.

Closed file list: `src/core/api/schema.d.ts` · `src/features/chat/load.ts` (step 2 only, type only) · `src/features/ready/load.test.ts` (Q1: `calls: null,` in `item()` only). No git.

## Definition of Done
- [ ] 1. `grep -c roundCalls src/core/api/schema.d.ts` → ≥ 1 (base: `0`, Sober 15:2x on `09f2717`)
- [ ] 2. `bun run check:api` → matches (base: matches, exit 0, Sober 15:2x on `09f2717` vs back `f10f8cb`)
- [ ] 3. `bun run typecheck` → exit 0 · `bun test src` → 0 fail (base: exit 0 · `238 pass / 0 fail`, Sober 15:2x on `09f2717`)
- [ ] 4. `git status --short` → `schema.d.ts` + `ready/load.test.ts` (+ `chat/load.ts` only if step 2 applied) (base: empty on `09f2717`, Sober 15:2x)

## Implementation Notes
Fern, 2026-10-30 ~16:2x. `blueprint-front`, branch `atom`, HEAD `09f2717`, tree clean before. No git write run. **Stopped at DoD 3: typecheck fails in a file outside the closed list — see § Questions Q1.**
- `bun run gen:api` → `git diff --numstat` `14	0	src/core/api/schema.d.ts` (0 removed). Added: a new `Call` schema (`asked, fallback, model, ok, reason, step, weight`), `roundCalls: Call[] | null` on the message, and `calls: Call[] | null` on two more schemas (the quiz and its item). Generated, not hand-edited.
- DoD 1. `grep -c roundCalls src/core/api/schema.d.ts` → `1` (base `0`) ✓ · DoD 2. `bun run check:api` → "matches the OpenAPI document", exit 0 ✓
- DoD 3. `bun test src` → `238 pass / 0 fail` ✓ but **`bun run typecheck` → exit 2**, one error: `src/features/ready/load.test.ts(24,77): error TS2322 … Types of property 'calls' are incompatible … Type 'undefined' is not assignable …`. Line 24 is the test helper `item()`, a hand-built `ApiQuizItem` literal; `calls` is now a required key (`Call[] | null`) and the literal has none. `src/features/chat/load.ts` is NOT the cause, so TASK step 2 does not apply.
- I changed nothing else. State left: ` M src/core/api/schema.d.ts` only.

**After Q1's answer (Fern, 2026-10-30 ~16:4x):** added `calls: null,` to the object literal in `item()` of `src/features/ready/load.test.ts` (one line, `git diff --numstat` `1	1`; the only changed text is that key). `chat/load.ts` untouched — step 2 did not apply. Re-run:
- DoD 1. `grep -c roundCalls src/core/api/schema.d.ts` → `1` ✓ · DoD 2. `bun run check:api` → "matches the OpenAPI document" ✓
- DoD 3. `bun run typecheck` → exit 0 (was 2) · `bun test src` → `238 pass / 0 fail`, `Ran 238 tests across 10 files. [6.41s]` ✓
- DoD 4. `git status --short` → ` M src/core/api/schema.d.ts` + ` M src/features/ready/load.test.ts`, nothing else ✓ (numstat 14/0 and 1/1).
- Footprint: no ports started, no test data.

## Questions
- **Q1 (Fern → @Sober).** The failing line is in `src/features/ready/load.test.ts`, which is not on this TASK's closed file list (`schema.d.ts` · `chat/load.ts`). The smallest fix is one key in that helper: `calls: null,` added to the object literal in `item()` (`:23-25`) — type only, no behaviour change, nothing reads `calls`. Please either add `src/features/ready/load.test.ts` to my list for that one line (I will then re-run DoD 3 and send to REVIEW), or tell me another way. Default if you say nothing: I wait. Also for your SPEC: the quiz item gaining a required `calls` key is a front-visible type change, not only `roundCalls`.
  > answer (Sober, 2026-10-30 16:0x): **yes — `src/features/ready/load.test.ts` is added to the closed list for exactly that one key, `calls: null,` in `item()` (`:24`).** Nothing else in that file. My SPEC-112 consumer grep on the front covered `roundRaw` only and missed the quiz item. Re-grepped now: `grep -rn "ApiQuizItem\|QuizItem\b" src` (not `schema.d.ts`) → `ready/load.ts:19` (the alias, no change) and `ready/load.test.ts:4,24,28`. `bun run typecheck` with your `schema.d.ts` → exactly 1 `error TS`, the line you found. Re-run DoD 3, then DoD 4 shows 2 paths. FAILURES entry is mine (F-042).

## Review
**DONE** — Sober, 2026-10-30 16:0x. Re-run by me on the tree (2 paths, on `09f2717`): `git diff --numstat` → `14 0 schema.d.ts` · `1 1 ready/load.test.ts`; the test diff is the one key `calls: null,` in `item()` (read). `bun run check:api` → matches · `bun run typecheck` → exit 0 · `bun test src` → 238 pass / 0 fail · `grep -c roundCalls src/core/api/schema.d.ts` → 1. Step 2 rightly not applied (`chat/load.ts` untouched).
