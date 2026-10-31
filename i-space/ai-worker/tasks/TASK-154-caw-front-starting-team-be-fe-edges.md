# TASK-154: caw-front — the starting team's BE and FE can hand work to each other (BE ↔ FE edges)
- Source: SPEC-119 D1 (REQ-121)
- Owner: FE (Fanta, Team B)
- Status: DONE (2026-10-30 18:20, Silver — § Review)
- Depends on: REQ-120 committed (caw-back 3795236) ✓ — caw-front has no REQ-120 change; nothing shared with TASK-153

## What to do

Read SPEC-119 § D1 (2 minutes). Base: caw-front `atom` 1287772, tree clean. No git. The SA's probed reference
patch: `i-space/ai-worker/tests/harness/spec121-front.patch`.

**Closed file list — exactly these 2:** `src/lib/startingTeam.ts` · `src/lib/startingTeam.test.ts` — every path the
DoD names is on it.

1. `src/lib/startingTeam.ts:11-12` — `STARTING_EDGES` becomes
   `[["PM", "SA"], ["SA", "FE"], ["SA", "BE"], ["BE", "FE"], ["FE", "BE"], ["FE", "QA"], ["BE", "QA"], ["QA", "PM"]]`
   (8 edges, the two new ones right after `["SA", "BE"]`), and the comment above it names them: `… · SA → BE · BE ↔ FE
   (REQ-121: the BE hands the page to the FE, and back) · FE → QA …` — exactly as in the patch. Nothing else changes.
2. `src/lib/startingTeam.test.ts`:
   - `:17` — the `STARTING_EDGES` pin → the 8-edge list above.
   - `:20` test name "five members, six edges" → "eight edges"; `:25` `toHaveLength(6)` → `8`; `:29` the `has(a, b)`
     list gains `["แบงค์", "ฝน"]` and `["ฝน", "แบงค์"]`.
   - `:49` `toHaveLength(6)` → `8`; the retry line (`done.edges.length` … `6`) → `8`. `:57` (`toHaveLength(2)` after the
     drop on the 3rd edge) stays `2` — the 3rd edge is still `SA → BE`; if it does not, stop and say so.

## Definition of Done
- [ ] 1. Before: `git status --short --untracked-files=all | wc -l` → `0` (base: `0` on `1287772`, SA 18:18)
- [ ] 2. `bun test src/lib/startingTeam.test.ts` → `0 fail`, 9 tests (base: `9 pass · 0 fail · Ran 9 tests across 1 file`, SA 18:16)
- [ ] 3. `grep -c '\["BE", "FE"\], \["FE", "BE"\]' src/lib/startingTeam.ts` → `1` (base: `0`, SA 18:1x — no BE ↔ FE edge in `:12`)
- [ ] 4. `bun run typecheck` → exit `0` (base: `0`, SA 18:16)
- [ ] 5. `bun test src` → `0 fail`, 355 tests (base: `355 pass · 0 fail · Ran 355 tests across 26 files`, SA 18:10)
- [ ] 6. After: `git status --short --untracked-files=all` → exactly ` M src/lib/startingTeam.ts` and ` M src/lib/startingTeam.test.ts` (base: n/a — new: the list is this TASK's)

## Implementation Notes
Fanta (FE, B), 2026-10-30. `caw-front`, branch `atom`, HEAD `1287772` before and after, no git. Before: `git status --short --untracked-files=all | wc -l` → `0`. After: exactly the 2 listed files.

**What changed:** `startingTeam.ts:11-12` — `STARTING_EDGES` is the 8-edge list (`["BE","FE"]`, `["FE","BE"]` right after `["SA","BE"]`) and the comment names them as the patch words it. `startingTeam.test.ts` — the pin (`:17`) is the 8 edges; test name "eight edges"; `:25`, `:49` → `8`; the `has` list gains `["แบงค์","ฝน"]` and `["ฝน","แบงค์"]`; the retry line → `8`. `:57` stays `2` (the 3rd edge is still `SA → BE`; the test passes, so the order holds). Nothing else touched.

**DoD (my run)**
1. before → `0` ✓
2. `bun test src/lib/startingTeam.test.ts` → `9 pass · 0 fail · Ran 9 tests across 1 file` ✓
3. `grep -c '\["BE", "FE"\], \["FE", "BE"\]' src/lib/startingTeam.ts` → `1` ✓
4. `bun run typecheck; echo $?` → `0` ✓
5. `bun test src` → `355 pass · 0 fail · Ran 355 tests across 26 files` ✓
6. `git status --short --untracked-files=all` → ` M src/lib/startingTeam.test.ts`, ` M src/lib/startingTeam.ts` ✓

I did not diff against `spec121-front.patch`; I wrote the lines from the TASK text. **UNVERIFIED:** a real caw-back accepting the two new edges (mock only; the SPEC says the owner's AC-3 live run covers it).

## Questions

## Review
**DONE** — Silver, 2026-10-30 18:20. Re-run by me on caw-front 1287772 + the 2 paths (uncommitted):
- Scope: exactly ` M src/lib/startingTeam.ts`, ` M src/lib/startingTeam.test.ts`. `startingTeam.ts` is byte-identical to the probed reference (`cmp` with the patched copy of `spec121-front.patch` → same).
- Test diff read: the pin, both `toHaveLength` lines and the retry line → 8; `has` list gains แบงค์→ฝน and ฝน→แบงค์; `:57` stays 2 (3rd edge still SA → BE). All three probe consumers ticked.
- DoD 2: `bun test src/lib/startingTeam.test.ts` → 9 pass · 0 fail. DoD 4: typecheck 0. DoD 5: `bun test src` → 355 pass · 0 fail · Ran 355 tests across 26 files.
- tree-fp at review: caw-front 1287772 fp `868b4b0843c5`.
UNVERIFIED (QA's, AC-1): the starting team made against a real caw-back, then a BE → FE hand-off.
