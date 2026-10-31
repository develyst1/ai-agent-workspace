# TASK-117: blueprint-back — `relatedDecisions` in a part's context (REQ-112, Blueprint side)
- Source: SPEC-106 § "REQ-112 addition — relatedDecisions" (REQ-112, Team A)
- Owner: BE (Jason)
- Status: DONE, round 2 (2026-10-30 14:2x, Sober — § Round 2 review). Round 1 DONE 13:3x; REWORK r2 14:1x (REQ-112 AC-5)
- Depends on: **REQ-114 round 2 committed (`2da175e`, pushed)** in blueprint-back ✓ (queue: REQ-114 r1 → REQ-105 `e4b2579` → REQ-114 r2 `2da175e` → this; one topic per commit, F-013).
- Repo: `blueprint-back` (path: `machine.local.md`), branch `atom`. **No git write.**

🔴 Prefix every `bun` command with `DATABASE_URL=pglite:memory` (and `PORT=` when it serves). Never print `.env`. No gateway, no CLI.

The contract is SPEC-106 § "REQ-112 addition". Team B builds against it, so any change to a field is a question to the SA first.

## Files (closed list — anything else → `## Questions` first)

- `src/seam/context.ts` (compute the field; the v2 context from TASK-113 gets it through the same builder)
- `src/http/routes/seam.ts` (`PartContextSchema` gains the two fields; the v2 `SpecContextSchema` (`:53`) is `PartContextSchema.omit(…).extend(…)`, so it inherits them with no edit)
- `openapi.json` (via `openapi:emit`)
- new `test/seam/related-decisions.test.ts`. **`test/seam/context.test.ts` is not edited.**
- `test/seam/spec-v2.test.ts`, **line 144 only** (added at release, 2026-10-30): it asserts the v2 context's exact key list, which gains `"relatedDecisions", "relatedDecisionsMore"` (keep the list sorted). Nothing else in that file.

**Consumers, re-grepped at release over `src test` on `2da175e` (Sober 13:1x):** `grep -rn "PartContext\b\|partContext(\|PartContextSchema\|SpecContext\|contextIn" src test` → `src/seam/context.ts:14,19,28` (type, v1 builder, `contextIn`, the shared builder, so put the computation there) · `src/seam/spec.ts:11,42,45` (`SpecContext` = `Omit<PartContext,…>`, typed through, no edit) · `src/http/routes/seam.ts:16-32,53,80,107,110` · `test/seam/context.test.ts` (asserts per field, unaffected) · `test/seam/feed.test.ts:63-64` (per field, unaffected) · `test/seam/spec-v2.test.ts:144` (exact key list, so it is in the list above) and `:155` (per field, unaffected).

## What to do

1. Compute `relatedDecisions` and `relatedDecisionsMore` exactly per SPEC-106 (which decisions, `via`, de-dup, sort, cap 50), from the same spec the response reads.
2. Add both fields to the v1 and v2 context schemas. Re-emit `openapi.json`.

## Definition of Done (each with its command and real output, pasted)

1. Base, on the REQ-105-committed tree: `bun test --timeout 30000` (full env prefix) → 0 fail (base: `308 pass / 16 skip / 0 fail`, Sober 2026-10-30 on the tree now committed as `2da175e`; `test/seam` alone `51 pass / 0 fail`, Sober 13:1x on `2da175e`).
2. After: same → 0 fail (base: as 1). `bunx tsc --noEmit` → exit 0 (base: exit 0, Sober 13:1x on `2da175e`). `git diff --stat test/seam/context.test.ts` → empty (base: empty, `2da175e`). `git diff test/seam/spec-v2.test.ts` → the one line 144 change only.
3. New tests (base: n/a — new field), named in Notes:
   - **TEST-106's shape:** build the spec of `tests/harness/test-106/step2-changeset.mjs` (work, 3 steps, SCR-001 in interactions under all 3, DEC-001…003 covering STEP-002, DEC-004/006 covering WRK-001, DEC-005 covering SCR-001). The context of SCR-001 → `decisions` = [DEC-005], and `relatedDecisions` keys = [DEC-001, DEC-002, DEC-003, DEC-004, DEC-006] with the right `via`. Both v1 (after a label) and v2. (base: n/a — new field; today `decisions` = [DEC-005] only, `src/seam/context.ts` `to("covers", key)`.)
   - A part whose flows carry no other decision → `relatedDecisions: []`, `relatedDecisionsMore: false` (base: n/a — new field).
   - A decision covering two of the flow's steps appears once, `via` = the lower key.
   - 51 related decisions → 50 returned, `relatedDecisionsMore: true` (base: n/a — new field).
4. `openapi:emit`, with `git diff --stat openapi.json` pasted; write "contract emitted" in Notes.
5. `git status --short` → only closed-list files (base: empty at `2da175e`, Sober 13:1x). `env | grep -c BLUEPRINT_GATEWAY_LIVE` → 0 (base: `0`, Sober 13:1x).

## Implementation Notes
(Jason, BE — 2026-10-30. All `bun` runs prefixed `DATABASE_URL=pglite:memory`, in `blueprint-back` at `2da175e`. No git, no gateway.)

**Changed (closed list only):**
- `src/seam/context.ts` — types `RelatedDecision`, `MAX_RELATED_DECISIONS = 50`; `PartContext` gains the two fields; `contextIn` computes them (so v1 and v2 share it): touched = every `flows[].work` and `flows[].at` key; each `decision` part with a `covers` link to a touched key and not in `decisions` is taken once, `via` = the first touched key in `compareKeys` order (= the lowest); sorted by decision key; first 50, `More` = more than 50.
- `src/http/routes/seam.ts` — `PartContextSchema` + `relatedDecisions: [{ via, decision: Part }]`, `relatedDecisionsMore: boolean`; `SpecContextSchema` inherits (no edit). `openapi.json` re-emitted — **contract emitted**.
- `test/seam/spec-v2.test.ts` line 144 only (the exact key list gains the two names, sorted). `test/seam/context.test.ts` untouched.
- New `test/seam/related-decisions.test.ts` (5 tests).

**Decided myself (invisible to the API):** a decision that is also the part's own `decisions` entry never appears in `relatedDecisions` (spec: "minus the ones already in `decisions`"); a `via` that is a work key sorts by `compareKeys` with step keys (so a decision covering both a step and the work gets the step if its key is lower — `STEP-…` < `WRK-…`).

**DoD evidence:**
1. Base (Sober's, `2da175e`): `308 pass / 16 skip / 0 fail` — not re-run by me before the change.
2. After: `bun test --timeout 30000` → `313 pass / 16 skip / 0 fail` (329 tests, 44 files; 308 + 5 new). `bunx tsc --noEmit` → exit 0. `git diff --stat test/seam/context.test.ts` → empty. `git diff test/seam/spec-v2.test.ts` → the one line 144 only (`"questions", "revision"` → `"questions", "relatedDecisions", "relatedDecisionsMore", "revision"`).
3. `bun test test/seam/related-decisions.test.ts --timeout 30000` → `5 pass / 0 fail / 14 expect()`:
   - "TEST-106's spec, v1 (after a label)": SCR-001 `decisions` = [DEC-005]; `relatedDecisions` = DEC-001/002/003 via STEP-002, DEC-004/006 via WRK-001; more false.
   - "…v2 (the live spec)": same; then removing the DEC-004→WRK-001 cover shows at once (4 left).
   - "no other decision": SYS-001 (in no flow) and SCR-001 (its only decision is its own) → `[]`, false.
   - "a decision covering two of the flow's steps": once, via STEP-002 (STEP-003 also covered).
   - "51 related → 50": keys DEC-001…DEC-050, more true; exactly 50 → false.
4. `git diff --stat openapi.json` → `openapi.json | 48 +++++++++++++++++++++++++++++++++++++++++++++++-` (1 file changed, 47 insertions(+), 1 deletion(-)): `PartContext` and `SpecPartContext` gain the two required fields.
5. `git status --short` → `M openapi.json · M src/http/routes/seam.ts · M src/seam/context.ts · M test/seam/spec-v2.test.ts · ?? test/seam/related-decisions.test.ts`. `env | grep -c BLUEPRINT_GATEWAY_LIVE` → `0`.

UNVERIFIED — CAW's client against the new fields (Team B, G9); the front `schema.d.ts` needs `gen:api` (TASK-141).

**Round 2 (Jason, 2026-10-30, E17):** `contextIn` — `touched` now also holds every step of each flow whose work is in `named` (comment updated). Decided myself: the part's own key joins `own`, so a decision anchor never lists itself (the TASK's (c) "minus itself"). Only `src/seam/context.ts` and `test/seam/related-decisions.test.ts` changed this round.
- R1. `bun test test/seam/related-decisions.test.ts --timeout 30000` → `8 pass / 0 fail / 22 expect()` (5 + 3 new).
  - AC-5, WRK-001, v1 and v2: `decisions` [DEC-004, DEC-006]; `relatedDecisions` (key, via) = [DEC-001, STEP-002], [DEC-002, STEP-002], [DEC-003, STEP-002]; more false; v1 = v2.
  - SCR-001 unchanged: the round-1 test passes untouched; a second test pins (key, via) = DEC-001/002/003 STEP-002, DEC-004/006 WRK-001.
  - DEC-004 anchor: [DEC-001, STEP-002], [DEC-002, STEP-002], [DEC-003, STEP-002], [DEC-006, WRK-001]; DEC-004 absent.
- R2. `bun test --timeout 30000` → `316 pass / 16 skip / 0 fail` (332 tests, 44 files; 313 + 3).
- R3. `bunx tsc --noEmit` → exit 0 · `git diff --stat openapi.json` → `48 +++…-` (47+/1−, unchanged) · `git status --short` → the same 5 paths as round 1.

## Questions

## Review
**DONE** (Sober, 2026-10-30 13:3x). Re-run by me on blueprint-back (`2da175e` + this tree):
- `git status --short` → `openapi.json`, `src/http/routes/seam.ts`, `src/seam/context.ts`, `test/seam/spec-v2.test.ts` (line 144 only, read in the diff), new `test/seam/related-decisions.test.ts`. Closed list kept. `git diff --stat test/seam/context.test.ts` → empty.
- `bunx tsc --noEmit` → exit 0 · `bun test test/seam --timeout 30000` → `56 pass / 0 fail` (51 + 5) · `bun test --timeout 30000` → `313 pass / 16 skip / 0 fail` (329 tests, 44 files).
- Against SPEC-106 § REQ-112 addition: touched = `flows[].work` + `flows[].at`; only `kind === "decision"` with a `covers` link; minus own `decisions`; de-dup with `via` = the lowest touched key (`touched` sorted by `compareKeys`, first wins); sorted by decision key; cap 50 + `More`. Computed in `contextIn`, so v1 and v2 share it. `SpecContextSchema` inherits the fields. Matches.
- `openapi.json`: +47/−1; the −1 is `"questions"` gaining a comma in `PartContext.required`. Contract emitted. Your two decisions (own decision excluded; a work key sorts with steps by `compareKeys`) follow the SPEC's text. Accepted.
- Next: TASK-141 (front `gen:api`) released now. CAW's client (Team B) is the PM's to relay.

## Round 2 — a card on a work gets the rules on that work's steps (REQ-112 AC-5, 2026-10-30 14:1x, Sober)
**Why:** QA's live run (TEST-112 DEF-1): a card anchored on WRK-001 got `relatedDecisions []`, because a work's flow has `at = []` and only `at` steps were touched. SPEC-106 § REQ-112 addition, **Round 2 / E17**. This is my design gap (F-037), not a defect in your build.

**What to do** (same tree, no commit in between):
1. `src/seam/context.ts` `contextIn`: `touched` also gets every step of each work in `named` (the works the climb named directly). For each such work these are the `flows` entry's `steps` keys. Nothing else in the rule changes. Update the comment above it.
2. `test/seam/related-decisions.test.ts`, add:
   - (a) **AC-5:** TEST-106's spec, the context of **WRK-001** (v1 after a label, and v2) → `decisions` keys [DEC-004, DEC-006] unchanged; `relatedDecisions` contains DEC-001, DEC-002, DEC-003, each `via` = the lowest step key it covers. Paste the full key/via list.
   - (b) SCR-001's result is byte-for-byte the same as round 1 (the existing TEST-106 test must still pass unchanged).
   - (c) A decision anchor that covers a work (e.g. DEC-004 → WRK-001) also gets that work's steps' rules, minus itself.
3. Do not edit `test/seam/context.test.ts` or `test/seam/spec-v2.test.ts` beyond round 1's line 144. No `openapi.json` change.

**DoD round 2:**
- [x] R1. `bun test test/seam/related-decisions.test.ts --timeout 30000` → 0 fail, 5 + 3 new (base: `5 pass / 0 fail`, round 1)
- [x] R2. `bun test --timeout 30000` → 0 fail, counts pasted (base: `313 pass / 16 skip / 0 fail`, Sober round-1 review)
- [x] R3. `bunx tsc --noEmit` → exit 0 · `git diff --stat openapi.json` unchanged from round 1 (`48`, 47+/1−) · `git status --short` → round 1's 5 paths only (base: as stated, Sober 14:1x)

**Round 2 review: DONE** (Sober, 2026-10-30 14:2x). Diff read: `namedSteps` = the steps of each flow whose work is in `named`, joined into `touched`; `own` gains the part's own key (so a decision anchor never lists itself, which is right for (c)); comment updated. Re-ran: `bunx tsc --noEmit` → exit 0 · `bun test test/seam --timeout 30000` → `59 pass / 0 fail` (56 + 3) · `git diff --stat openapi.json` → 47+/1−, unchanged from round 1 · `git status --short` → round 1's 5 paths. Full suite not re-run by me this round: `contextIn` is reached only through the seam routes (`src/seam/context.ts`, `src/seam/spec.ts`), all inside `test/seam`. Jason's `316 / 16 / 0` stands. Your (key, via) lists for WRK-001 and DEC-004 match E17.

