# TASK-159: caw-back runner — every idle worker starts its next card in the same tick; the MCP server reads the hop id per call (REQ-122)
- Source: SPEC-120 D5.2 + D2
- Owner: BE (Bob)
- Status: DONE (2026-10-30 20:3x, Silver — § Review) · was REVIEW (2026-10-30, Bob; DoD 1–7 run — see Implementation Notes) · was TODO — released 2026-10-30 20:2x, Silver (TASK-157 DONE; whole suite on d33e586 + TASK-157 = `929 pass · 1 skip · 1 fail`, the known one — use it as DoD 6's base)
- Depends on: TASK-157 DONE · REQ-121 committed (d33e586) ✓
- Git: none

## What to do
Closed file list (caw-back): `src/runner/plan.ts`, `src/runner/plan.test.ts`, `src/runner/main.ts`, `src/runner/main.test.ts`, `src/mcp/server.ts`, `test/mcp/server.test.ts`.

The probed change is `ai-worker/tests/harness/spec122-runner.patch` (desk side). Build it as written; differences go in Implementation Notes.
1. **`plan.ts`** (SPEC-120 D5.2): `PlanInput.busyWorkers` / `busyCards`; `Action` `start_hop` → `start_hops { hops: {cardId, workerId}[] }`; chat waits only for a busy **entry worker**; `room = hopBudget − hopsInRun.length` (`room <= 0` → idle while running, else `budget_spent`); fresh cards then second turns, skipping busy workers and busy cards, one card per worker, at most `room`; nothing to start → idle while running, else today's `no_progress` / `nothing_workable`.
2. **`main.ts`**: `busyWorkers` / `busyCards` from the listed hops (`endedAt === null` or in `activeIn`). Workables are read whenever dispatcher + open run. `pendingMessage` is skipped only while the entry worker is busy. The `start_hops` loop with per-item handling and `no_budget` as in SPEC-120 D5.2.
3. **`mcp/server.ts`** (D2): `hopId?: string | (() => string | undefined)`, resolved per call; `CAW_HOP_FILE` read per call (empty or missing → none), else `CAW_HOP_ID`. Fix the patch's spacing (`hop ? { … }`).
4. **Tests.** `plan.test.ts`: the probe's 30 hits are all this file (12 TS errors where the input lacks `busyWorkers`/`busyCards`, and 18 cases asserting `start_hop`). Port each to the new shape, keeping its meaning. The "one at a time per project" case becomes "one per worker": it passes when the running hop's worker is busy, and a second idle worker's card starts. New cases:
   - (a) 3 workers × 1 fresh card each, budget 5 → `start_hops` with 3, lowest number first.
   - (b) budget room 2 with 3 idle → 2.
   - (c) the SPEC's boundary case: card #1 workable for BE, while SA's hop on #1 runs → #1 not started; BE's other card is.
   - (d) one worker with 2 workable cards → only its lowest.
   - (e) chat pending, entry worker busy, others idle → `start_hops` for the others (no chat).
   - (f) room 0 while hops run → idle; room 0 and none running → `budget_spent`.
   - (g) nothing startable while a hop runs → idle (not `no_progress`).
   `main.test.ts`: one case with 2 workers and 2 workable cards on the stub → both hops start in one tick (2 hop rows running at once). `test/mcp/server.test.ts`: a function `hopId` is called per request and its value goes in `x-caw-hop`; `undefined` → no header.

## Definition of Done
From caw-back, every `bun` line as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file …`.
- [ ] 1. `git status --short` → TASK-157's 5 paths + this TASK's closed list only (base: empty, SA 19:5x on d33e586)
- [ ] 2. `bun test src/runner/plan.test.ts` → 0 fail, ≥ 41 tests (base: `34 pass · 0 fail`, SA 19:5x; patch as probed: 30 errors, all this file)
- [ ] 3. `bun test src/runner/main.test.ts` → 0 fail, ≥ 64 tests (base: `63 pass · 0 fail`, SA 19:5x; patch as probed: no hit here)
- [ ] 4. `bun test test/mcp/server.test.ts test/mcp/chat-tools.test.ts` → 0 fail, ≥ 25 tests (base: `24 pass · 0 fail`, SA 19:5x)
- [ ] 5. `node_modules/.bin/tsc --noEmit --pretty false` → exit 0 (base: exit 0, SA 19:5x)
- [ ] 6. `bun test` (whole) → only the known `withReadGuard … ONE argument` fail (base: `922 pass · 1 skip · 1 fail`, SA 19:5x)
- [ ] 7. `bun run openapi:emit` then `git diff --stat openapi.json` → only TASK-157's change (base: emit leaves the tree clean, SA 19:5x)

## Implementation Notes
Built in `caw-back` on `d33e586` + TASK-157's 5 paths, nothing committed by me. Every command ran as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`; no live hop, no real DB.

**What changed** (the probed `spec122-runner.patch`, applied by hand with the editor)
- `plan.ts`: `PlanInput.busyWorkers` / `busyCards`; `Action` `start_hop` → `start_hops { hops }`; chat waits only for a busy **entry worker**; `room = hopBudget − hopsInRun.length` (`room <= 0` → idle while running, else `budget_spent`); fresh cards then second turns, skipping busy workers and busy cards, one card per worker, at most `room`; nothing to start → idle while a hop runs, else today's `no_progress` / `nothing_workable`.
- `main.ts`: `busyWorkers` / `busyCards` from the listed hops (`endedAt === null` or in `activeIn`); workables are read whenever dispatcher + open run; the chat's `pendingMessage` is skipped only while the entry worker is busy; the `start_hops` loop with per-item handling (`hop_running` / `not_workable` → continue, `no_budget` → end the run only if none of ours is still running, other 4xx → that card refused, anything else rethrown).
- `mcp/server.ts`: `hopId?: string | (() => string | undefined)`, resolved per call; in the stdio entry `CAW_HOP_FILE` is read per call (empty or missing → none), else `CAW_HOP_ID`; the header comment names it.

**Differences from the patch (all cosmetic or noted)**
1. The patch has spacing slips (`from"@model…`, `hop ?{`, `workable =(`, `?{ kind`); I wrote them with normal spacing. I also moved `readFileSync`'s import above the SDK import without changing the SDK import.
2. The comment on `hopRunning` in `PlanInput` no longer says "one at a time per project" (it is no longer true); the chat comment in `planTick` says "waits only for a running hop of the ENTRY worker".
3. `fresh` and `second` are both lists now; `second` also holds cards with no hop yet, so such a card can appear twice in `[...fresh, ...second]`. Harmless: once a worker is in `busy` after its first start, its second appearance is skipped (one card per worker) — kept as probed.

**Tests**
- `plan.test.ts`: all 30 hits ported (12 TS errors: `busyWorkers`/`busyCards` added to `base`; the 18 `start_hop` expectations → a small `starts(…)` helper for `start_hops`). "One at a time per project" is now "one per worker": the running hop's worker is busy and starts nothing, a second idle worker's card does start; the chat case waits only for a busy entry worker (and a second case: another worker's hop does not hold the chat back). New (a)–(g) exactly as the TASK lists them.
- `main.test.ts`: `REQ-122: 2 workers with 1 workable card each → both hops start in one tick and run side by side` (2 hop rows running at once, distinct workers and cards, a further tick starts nothing while both run, then both children are released).
- `test/mcp/server.test.ts`: a function `hopId` is asked per request (`hop-1`, `hop-2`, then `undefined` → no header) and a plain string / `undefined` still work.
- `main.test.ts:80-91` ("not started a second time") and every other existing main case pass unchanged (the probe said no hit there).

**Evidence (real output)**
- DoD 1: `git status --short` → ` M openapi.json`, ` M src/hops/service.ts`, ` M src/http/routes/team.ts` (TASK-157's 5 with the two test files below) + ` M src/mcp/server.ts`, ` M src/runner/main.test.ts`, ` M src/runner/main.ts`, ` M src/runner/plan.test.ts`, ` M src/runner/plan.ts`, ` M test/mcp/server.test.ts`, ` M test/http/hops-runs.test.ts`, ` M test/http/team-status.test.ts` — 11 paths, no others.
- DoD 2: `plan.test.ts` → `43 pass · 0 fail · Ran 43 tests across 1 file` (base 34).
- DoD 3: `main.test.ts` → `64 pass · 0 fail · Ran 64 tests across 1 file` (base 63).
- DoD 4: `test/mcp/server.test.ts test/mcp/chat-tools.test.ts` → `25 pass · 0 fail · Ran 25 tests across 2 files` (base 24).
- DoD 5: `node_modules/.bin/tsc --noEmit --pretty false` → exit `0`.
- DoD 6: whole suite `--timeout 30000` → `940 pass · 1 skip · 1 fail · Ran 942 tests across 72 files` (base `929 · 1 · 1`); the fail = the known `withReadGuard … ONE argument` (`settings.test.ts`).
- DoD 7: `bun run openapi:emit` → `openapi.json | 44 ++++-`, the same 44 lines as after TASK-157 (nothing added by this TASK). `pgrep -fc 'output-format [s]tream-json'` → `0`.

**UNVERIFIED**
- The stdio entry's `CAW_HOP_FILE` branch (`import.meta.main`) has no test: only the function `hopId` it builds is tested. A real file read per call needs TASK-160's runner (which writes the file) — QA's/the SA's joint run settles it.
- No live parallel run. The runner's orphan/adopt code (`adopt`, `hopRunning`) is unchanged and was only exercised by the existing main cases and the two-hops stub case, not by two workers' hops dying and restarting together.

## Review

**2026-10-30 20:3x, Silver — DONE.**
- Re-run by me on d33e586 + TASK-157's 5 + this TASK's 6 paths (11 in all): `plan.test` + `main.test` + `test/mcp/server` + `chat-tools` → `132 pass · 0 fail` (43 + 64 + 25) · tsc exit 0 · whole suite `940 pass · 1 skip · 1 fail · Ran 942`, the fail = the known `withReadGuard … ONE argument` · `pgrep -fc 'output-format [s]tream-json'` → 0.
- `plan.ts`'s ± lines = `spec122-runner.patch` (diffed with spaces stripped); only comments differ, and those are better: "one at a time per project" is gone, and why the run waits is said. The 7 new cases (a)–(g) are there: c2 → w2 while w1 runs, SA's #1 kept from BE until SA ends (the SPEC's boundary case), chat skipped while the entry worker is busy and the others start, room 0 → idle / `budget_spent`.
- Difference 3 (a card can be listed in both `fresh` and `second`): correct as built — a worker is busy after its first start, so the repeat is skipped and never counts toward `room`.
- UNVERIFIED as Bob wrote: the `CAW_HOP_FILE` read in the stdio entry → TASK-160 (it writes the file) and QA's stub run; two workers' orphans restarting together. tree-fp 20:39: caw-back `4939028df59b`.
