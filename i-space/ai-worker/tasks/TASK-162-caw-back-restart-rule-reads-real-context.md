# TASK-162: caw-back runner — the restart rule reads the session's real context (the last call's prompt), not the task's summed usage (REQ-122 round 2)
- Source: SPEC-120 § Round 2 (D3 r2)
- Owner: BE (Bob)
- Status: DONE (2026-10-30 21:5x, Silver — § Review) · was REVIEW (2026-10-30, Bob; DoD 1–7 run — see Implementation Notes) · was TODO — released 2026-10-30 21:4x, Silver, on the PM's word (DECISIONS 2026-10-30 21:4x "in-flight fixes go on" under the gate FAIL); was HELD 21:4x
- Depends on: TASK-160 DONE ✓ (same uncommitted tree: caw-back d33e586 + 21 paths, tree-fp `0aa059ed44ca` = QA's TEST-121)
- Git: none

## What to do
Closed file list (caw-back): `src/runner/stream.ts`, `src/runner/stream.test.ts`, `src/runner/pool.ts`, `src/runner/pool.test.ts`, `src/runner/hop.ts`, `src/runner/hop.test.ts`.

The probed change is `ai-worker/tests/harness/spec122-r2.patch` (desk side, 20 ± lines). Build it as written.
1. **`stream.ts`**: `StreamSummary.lastContext: number | null` = `input + cacheCreation + cacheRead` of the **last** assistant message's usage (the `assistantUsage` map, last entry in insertion order), or `null` with none. A module-level `lastContextOf`.
2. **`hop.ts:474`**: the value passed to `pool.release` is `sum.lastContext`, not `sum.tokensIn`. The hop record's `tokensIn` / `tokensOut` (cost) is **unchanged** (still `sum.tokensIn`).
3. **`pool.ts`**: `OpenWorker.lastTokensIn` → `lastContext`; the `release` parameter → `context`. The restart log line becomes `its context reached <n> tokens (the last call's prompt)`. The default `RUNNER_WORKER_MAX_TOKENS` stays **150 000** (SPEC-120 § Round 2: real last-call context 25 849–54 865).
4. **Tests.**
   - `pool.test.ts:50`: the probe's 2 hits, rename only.
   - `stream.test.ts`: (a) a stream with 3 assistant messages whose usages are (10 000 + 26 000 cache), (11 000 + 30 000), (12 000 + 33 000), plus a `result` whose usage sums to 122 000 → `lastContext` = 45 000, `tokensIn` = 122 000. (b) Only a `result`, no assistant usage → `lastContext` null. (c) One message on several lines (same id, growing usage) → its last value.
   - `hop.test.ts`: (d) **the TEST-121 regression**: an open worker whose stub prints, per task, a multi-call stream with summed `result` usage ≥ 238 884 and last-call context ≤ 55 000 serves **5 tasks on one child** (restart only on the 6th, by the task count), with the default limit. (e) A task whose last call's context is ≥ 150 000 → the **next** task starts a new child, and the log line names `(the last call's prompt)`.

## Definition of Done
From caw-back, every `bun` line as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file …`.
- [ ] 1. `git status --short --untracked-files=all` → the same 21 paths as before, no new path (base: 21 paths, SA 21:4x, tree-fp `0aa059ed44ca`)
- [ ] 2. `bun test src/runner/stream.test.ts` → 0 fail, ≥ 34 tests (base: `31 pass · 0 fail`, SA 21:4x)
- [ ] 3. `bun test src/runner/pool.test.ts` → 0 fail, ≥ 17 tests (base: `17 pass · 0 fail`, SA 21:4x; patch as probed: 2 errors, both `:50`)
- [ ] 4. `bun test src/runner/hop.test.ts` → 0 fail, ≥ 124 tests (base: `122 pass · 0 fail`, SA 21:4x)
- [ ] 5. `node_modules/.bin/tsc --noEmit --pretty false` → exit 0 (base: exit 0, SA 21:4x)
- [ ] 6. `bun test` (whole) → only the known `withReadGuard … ONE argument` fail (base: `970 pass · 1 skip · 1 fail`, 972 tests, SA 21:0x on this same tree)
- [ ] 7. `grep -n 'lastTokensIn' src/runner/*.ts` → no output (base: 4 lines in pool.ts + 1 in pool.test.ts, SA 21:4x)

## Implementation Notes
Built in `caw-back` on the same uncommitted tree (`d33e586` + 21 paths), nothing committed by me, no new path. Every command ran as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`; no live Claude, stub only.

**What changed** (`spec122-r2.patch`, applied by hand with the editor)
- `stream.ts`: `StreamSummary.lastContext: number | null` = `input + cacheCreation + cacheRead` of the last entry of `assistantUsage` (a module-level `lastContextOf`), `null` with none.
- `hop.ts`: `pool.release` gets `sum.lastContext` (via `tokensInOfTask`); the hop record's `tokensIn` / `tokensOut` (its cost) still come from `sum.tokensIn` / `sum.tokensOut`, untouched.
- `pool.ts`: `OpenWorker.lastTokensIn` → `lastContext`; `release(w, context)`; the restart log line is `its context reached <n> tokens (the last call's prompt)`. The default `RUNNER_WORKER_MAX_TOKENS` stays 150 000.

**Tests**
- `pool.test.ts:50` renamed (`a.lastContext`).
- `stream.test.ts` (+4 → 35): (a) 3 calls (10k+26k, 11k+30k, 12k+33k) + a result summing 122 000 → `lastContext` 45 000, `tokensIn` 122 000 · (b) only a result → `null` (and `summarize([])` → `null`) · (c) one message on several lines (same id, growing usage) → its last value 26 000 · one more on the recorded `ok` run (`lastContext` not null and ≤ `tokensIn`).
- `hop.test.ts` (+2 → 124): (d) the TEST-121 regression — every task prints 3 calls (25 849 → 40 000 → 54 865) and a `result` summing 241 000 (≥ 238 884); with the default limit **5 tasks go to ONE child**, no "starting a new process" before the 6th, and the 6th starts a second child with the log `it has done 5 tasks` (not the context), the first child got exactly 5 stdin messages, and the first hop's recorded `tokensIn` is still the summed 241 000 · (e) a task whose last call is 150 000 → the next task starts a new child, the old one gets EOF, and the log has `its context reached 150000 tokens (the last call's prompt)`. To print such streams I gave the test's `openStub` an optional per-task stream and `openWorld` a `setStream`, plus a `callStream` helper in the same file.
- **The new cases do catch the bug:** with `sum.tokensIn` put back for one run, `(d)` and `(e)` failed (`4 pass · 2 fail` on the open-worker describe); the line was restored (`grep -n 'tokensInOfTask =' src/runner/hop.ts` → `sum.lastContext`) before the runs below.

**Evidence (real output)**
- DoD 1: `git status --short --untracked-files=all | wc -l` → `21` (the same paths, none new).
- DoD 2: `stream.test.ts` → `35 pass · 0 fail` (base 31; ≥ 34). DoD 3: `pool.test.ts` → `17 pass · 0 fail`. DoD 4: `hop.test.ts` → `124 pass · 0 fail · Ran 124 tests across 1 file` (base 122).
- DoD 5: `node_modules/.bin/tsc --noEmit --pretty false` → exit `0`.
- DoD 6: whole suite `--timeout 30000` → `976 pass · 1 skip · 1 fail · Ran 978 tests across 73 files` (base `970 · 1 · 1`); the fail = the known `withReadGuard … ONE argument`.
- DoD 7: `grep -n 'lastTokensIn' src/runner/*.ts` → no output (exit 1). After the runs: `pgrep -fc 'output-format [s]tream-json'` → `0`, `ps | grep -c '[o]pen-claude'` → `0`.

**UNVERIFIED:** a live CLI — the real per-call usage lines come from SPEC-120 § Round 2's TEST-121 numbers (25 849–54 865), not from a run of mine. When a task's stream has no assistant usage at all (a `result` only), `lastContext` is `null` and the worker's recorded context stays at the previous task's value (a `null` never overwrites it).

## Questions

## Review

**2026-10-30 21:5x, Silver — DONE.**
- Re-run by me on d33e586 + the same 21 paths (no new path): `stream + pool + hop` → `176 pass · 0 fail` (35 + 17 + 124) · tsc exit 0 · `grep -n 'lastTokensIn' src/runner/*.ts` → no output, exit 1 · whole suite `976 pass · 1 skip · 1 fail · Ran 978 tests across 73 files`, the fail = the known `withReadGuard … ONE argument` · `pgrep -fc 'output-format [s]tream-json'` → 0.
- **On real streams:** I fed QA's 13 live traces (`tests/harness/test-121/live/out/traces/`) through the patched `summarize` (a read-only scratch script importing `src/runner/stream.ts`). `lastContext` = 25 849 · 28 368 · 44 431 · 41 702 · 45 300 · 46 877 · 49 269 · 45 048 · 45 040 · 42 167 · 50 246 · 45 348 · 54 865: exactly the numbers in SPEC-120 § Round 2, measured there by a separate parser. None would restart at 150 000. `tokensIn` on the same traces = 82 628 … 873 146 (the old reading).
- The diff = `spec122-r2.patch`; the hop's stored cost is untouched. The cases are right: (d) 5 tasks on one child with the TEST-121 numbers, the 6th restarts on "done 5 tasks"; (e) a 150 000 last call restarts the next task with the new log words. Bob's mutation check (the old `sum.tokensIn` makes (d) and (e) fail) shows the tests guard the fix.
- His UNVERIFIED note (a task with no assistant usage keeps the previous context; `null` never overwrites) is the right behaviour: a stream with no usage cannot say the session grew.
- tree-fp 21:57: caw-back `e1be4e88f4d1` · caw-front `3ce60b3d3217` (unchanged since round 1).
