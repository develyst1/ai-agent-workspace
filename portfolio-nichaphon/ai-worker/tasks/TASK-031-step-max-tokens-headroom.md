# TASK-031: Step `max_tokens` headroom — 1024 / 4096 / 1024 (the R2 fix, UNPROVEN until QA)
- Source: SPEC-009 D8 (§R2 TASK-030 result)
- Status: **DONE** (2026-11-01, Sober — see §Review. Was REVIEW 2026-11-01, Fern)
- Depends on: TASK-029 `DONE` (met)
- Owner: Fern (FE)

**Zero real calls.** Pin `GATEWAY_BASE_URL` at the stub or a dead port. No ledger row. No git write.
Tree at start = TASK-029's end state (8 ` M` + `?? back/test/language.test.ts`, on `D1` @ `b068fba`).

## What to do

1. **`back/src/chain/run.ts`** — `STEP_OPTS` (lines ~36–41): `max_tokens` 256 → **1024**, 1024 → **4096**, 512 → **1024**.
   Temperatures untouched. Update the comment above it: `SPEC-007 §Step contracts temperatures; max_tokens per SPEC-009 D8 (TASK-030: step 2 cut at 1024).`
   Nothing else in the file.
2. **`back/test/chain.test.ts`** — one test: a happy-path run with an injected `deps.ask` that records `opts` per call →
   `max_tokens` = `[1024, 4096, 1024]`, `temperature` = `[0, 0, 0.2]`.

Do NOT touch anything else (prompts, parse, retry, stub, front, knowledge, README).

## Definition of Done

- [ ] 1. `cd back && bun test` → paste summary before (expect `53 pass / 0 fail`) and after (54 pass / 0 fail).
- [ ] 2. `cd back && bunx tsc --noEmit` → exit 0.
- [ ] 3. `grep -n "max_tokens" back/src/chain/run.ts` → pasted; shows 1024 / 4096 / 1024 and nothing else changed.
- [ ] 4. `git diff --stat -- back/src/chain/run.ts back/test/chain.test.ts` pasted; `git status --short` = TASK-029's set, no new file.
- [ ] 5. Zero real calls (state it).

## Implementation Notes
(Fern, 2026-11-01.) `D1` @ `b068fba`; the tree at start was TASK-029's end state (8 ` M` + `?? back/test/language.test.ts`). **Zero real calls**: every test run pinned
`GATEWAY_BASE_URL=http://127.0.0.1:1` (a dead port), and the new test uses an injected `deps.ask`. No ledger row. No git write.

**Changed:** `run.ts` `STEP_OPTS` (3 numbers + the comment line, as ordered, nothing else). `chain.test.ts` gets one test in the SPEC-009 describe,
"D8 step options: max_tokens 1024 / 4096 / 1024, temperature 0 / 0 / 0.2". It wraps the existing `fakeAsk` and records `opts` on each call, and also asserts `calls === 3`.

1. Before: `GATEWAY_BASE_URL=http://127.0.0.1:1 bun test` → `53 pass / 0 fail / 209 expect() calls / Ran 53 tests across 7 files`. After: `54 pass / 0 fail / 212 expect() calls / Ran 54 tests across 7 files`.
2. `bunx tsc --noEmit` → exit 0.
3. `grep -n "max_tokens" back/src/chain/run.ts` →
   `36:// SPEC-007 §Step contracts temperatures; max_tokens per SPEC-009 D8 (TASK-030: step 2 cut at 1024).`
   `38:  1: { max_tokens: 1024, temperature: 0 },` · `39:  2: { max_tokens: 4096, temperature: 0 },` · `40:  3: { max_tokens: 1024, temperature: 0.2 },`
4. `git diff --stat -- back/src/chain/run.ts back/test/chain.test.ts` → `run.ts | 47`, `chain.test.ts | 81`, `2 files changed, 111 insertions(+), 17 deletions(-)`.
   These numbers are against HEAD, so they include TASK-029. This task's own share: run.ts 39 → 47 (4 lines replaced), chain.test.ts 68 → 81 (one 13-line test).
   `git status --short` → the same 8 ` M` + `?? back/test/language.test.ts`; no new file.
5. Zero real calls.

**UNVERIFIED — what would settle it:** whether the gateway or deepseek actually honours `max_tokens: 4096`. Our own `askGateway` passes the value
through unclamped (`gateway/ask.ts:26`); I did not read the gateway side, and doing so is out of scope. One real step-2 reply showing `completion_tokens > 1024` would settle it (QA round).
The fix itself stays **UNPROVEN** until QA, as the title says.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** (Sober, 2026-11-01). Zero real calls in review.
- Re-run: `GATEWAY_BASE_URL=http://127.0.0.1:1 bun test` → `54 pass / 0 fail / 212 expect() calls / Ran 54 tests across 7 files`;
  `bunx tsc --noEmit` → exit 0. `run.ts:36-41` read: 1024 / 4096 / 1024, temperatures 0 / 0 / 0.2 untouched. New test
  (`chain.test.ts:218`) asserts both arrays and `calls === 3`. `git status` = TASK-029's set, no new file.
- Your UNVERIFIED line stands and is right. Workspace `llm-gateway` skill documents `max_tokens` as optional with no stated
  ceiling — that is docs, not behaviour. **Settled only by a real step-2 reply with `completion_tokens > 1024`**, or by its
  absence of `malformed` across QA's databases re-run. Rides on QA's ledger row (SPEC-009 rows 11–25).
- The fix is **UNPROVEN** until then, in that word.
