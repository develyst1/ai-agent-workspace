# TASK-157: caw-back — one running hop per worker and per card; the check-in carries the open sessions (REQ-122)
- Source: SPEC-120 D5.1 + D6.1
- Owner: BE (Bob)
- Status: DONE (2026-10-30 20:2x, Silver — § Review) · was REVIEW (2026-10-30, Bob; REWORK done — the 204 description line + re-emit; F-052)
- Depends on: REQ-121 committed (d33e586) ✓
- Git: none (the SA commits on the owner's word)

## What to do
Closed file list (caw-back): `src/hops/service.ts`, `src/http/routes/team.ts`, `test/http/hops-runs.test.ts`, `test/http/team-status.test.ts`, `openapi.json` (by `bun run openapi:emit` only).

1. **`src/hops/service.ts:48`**: replace the project-wide check with the two checks of SPEC-120 D5.1, in that order, both `409 hop_running`: the same worker has a running hop → `"this worker already has a hop running"`; for a card hop, the same card has a running hop → `"that card already has a hop running"`. The probed form is in `ai-worker/tests/harness/spec122-api.patch` (desk side). Keep its comment line.
2. **`src/http/routes/team.ts`**: SPEC-120 D6.1, exactly as in `spec122-api.patch`:
   - `TeamSession = { projectId, workerId, state: "idle" | "busy" }`, zod `SessionSchema` (uuid, uuid, enum) `.openapi("TeamSession")`.
   - Check-in body `sessions` optional, max 200. `checkIn(name, state, sessions = [])` stores them, or `[]` when the state is `stopping`.
   - `TeamStatus.sessions` = the stored list when `running`, else `[]`.
3. **Tests.** `hops-runs.test.ts:23`: the "second one while it runs → 409" case now uses the **same worker**. Add cases: (a) a second worker's hop on another card while the first runs → 201; (b) a hop on the same card by another worker while it runs → 409 `hop_running` "that card…". `team-status.test.ts`: the 8 cases the probe lists compare the whole body, so add `sessions: []` to each expected object. New cases: (c) a check-in with 2 sessions → status lists them in order; (d) a later check-in with 1 → only that 1 (replaced, not merged); (e) `stopping` → `[]`; (f) stale after 45 s → `[]`; (g) an item with `state:"paused"` or a non-uuid id → 400 `validation`, nothing recorded.
4. `bun run openapi:emit`: the diff adds `TeamSession` and `sessions` (request + response) only.

## Definition of Done
All commands from caw-back, as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file …` (the env-u form below is written once and applies to every `bun` line).
- [ ] 1. `git status --short` → only the 5 closed-list paths (base: empty, SA 19:5x on d33e586)
- [ ] 2. `bun test test/http/hops-runs.test.ts` → 0 fail, ≥ 11 tests (base: `9 pass · 0 fail`, SA 19:5x)
- [ ] 3. `bun test test/http/team-status.test.ts` → 0 fail, ≥ 16 tests (base: `11 pass · 0 fail`, SA 19:5x)
- [ ] 4. `node_modules/.bin/tsc --noEmit --pretty false` → exit 0 (base: exit 0, SA 19:5x)
- [ ] 5. `bun test` (whole) → only the known `withReadGuard … ONE argument` fail (base: `922 pass · 1 skip · 1 fail`, 924 tests, SA 19:5x)
- [ ] 6. `git diff --stat openapi.json` → changed, and `grep -c TeamSession openapi.json` ≥ 2 (base: n/a — new: this TASK adds the schema)
- [ ] 7. Consumers (SPEC-120 D5.1/D6.1 probe, 9 caw-back hits): all in the two test files above. The 4 caw-front hits are TASK-158's.

## Implementation Notes
Built in `caw-back` on `d33e586`, nothing committed by me, exactly the 5 closed-list paths. Every command ran as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`; no live hop, no real DB.

**What changed**
- `src/hops/service.ts:48`: the project-wide `hop_running` check is replaced by D5.1's two checks, in order, both `409 hop_running`: same worker → `"this worker already has a hop running"`; for a card hop, same card → `"that card already has a hop running"`. Same source as `spec122-api.patch` (applied by hand with the editor, read back).
- `src/http/routes/team.ts`: `TeamSession`, `SessionSchema` (`.openapi("TeamSession")`), the check-in body's optional `sessions` (max 200), `checkIn(name, state, sessions = [])` stores `[]` when `stopping`, `TeamStatus.sessions` = the stored list when `running` else `[]` — as in the patch.
- `hops-runs.test.ts`: the "second one while it runs" case now uses the same worker (and pins the message); new (a) a second worker on another card → 201, both running at once; (b) another worker on the same card → 409 `that card …`, and 201 once the first hop ends.
- `team-status.test.ts`: `sessions: []` added to the 8 whole-body expectations; new (c)–(g): 2 sessions listed in order · replaced not merged (and a check-in without `sessions` → `[]`) · `stopping` → `[]` even when it carries some · stale at 45.001 s → `[]` (still 1 at exactly 45 s, name and time kept) · `paused` / non-uuid `workerId` / non-uuid `projectId` / 201 sessions → 400 `validation`, the earlier sessions untouched.

**Declared:** the check-in's 204 description still says "only `state` is read from the body" (`team.ts`, unchanged as in the patch, so the `openapi.json` diff stays "TeamSession + sessions only"); it is now slightly stale — say if you want it reworded in this TASK or in TASK-159.

**Evidence (real output)**
- DoD 1: `git status --short` → ` M openapi.json`, ` M src/hops/service.ts`, ` M src/http/routes/team.ts`, ` M test/http/hops-runs.test.ts`, ` M test/http/team-status.test.ts` (it was empty at start, HEAD `d33e586`).
- DoD 2: `hops-runs.test.ts` → `11 pass · 0 fail · Ran 11 tests across 1 file` (base 9).
- DoD 3: `team-status.test.ts` → `16 pass · 0 fail · Ran 16 tests across 1 file` (base 11).
- DoD 4: `node_modules/.bin/tsc --noEmit --pretty false` → exit `0`.
- DoD 5: whole suite `--timeout 30000` → `929 pass · 1 skip · 1 fail · Ran 931 tests across 72 files`; the fail = the known `withReadGuard … ONE argument` (`settings.test.ts`).
- DoD 6: `bun run openapi:emit` → `openapi.json | 42 ++++-` (41 insertions, 1 deletion: `startCommand` gets a trailing comma entry in `required`); the diff = the `TeamSession` schema, `TeamStatus.sessions` + its `required`, and the check-in body's `sessions` (`maxItems: 200`) — nothing else. `grep -c TeamSession openapi.json` → `3`.
- DoD 7: the consumers are the two test files above (all updated). `pgrep -fc 'output-format [s]tream-json'` → `0`.
- Before the tests were updated the run showed exactly 9 fails (the one same-project hop case + the 8 whole-body status cases), the set the TASK and the probe predicted.

**REWORK done (2026-10-30, Bob):** `team.ts:51` 204 description is now exactly `noted — the name is the runner's actor, the time is the core's clock; \`state\` and the optional \`sessions\` are read from the body`. `bun run openapi:emit` → `openapi.json | 44 ++++-` (42 insertions, 2 deletions); the diff gained exactly that one description line (`git diff openapi.json | grep -n "read from the body"` → the old line `-` and the new one `+`). `hops-runs` + `team-status` → `27 pass · 0 fail`; tsc exit `0`; whole suite `929 pass · 1 skip · 1 fail` (the known `withReadGuard`); `git status` = the same 5 paths; `pgrep -fc 'output-format [s]tream-json'` → `0`. FAILURES entry F-052 filed.

**UNVERIFIED:** nothing live. The runner (`main.ts`, `hop.ts`) still plans one hop at a time, so this change alone lets two hops run in the API but nothing starts them — that is TASK-159/160.

## Review
**2026-10-30 20:0x, Silver — REWORK (one line; the rest accepted).**
- Re-run by me on d33e586 + the 5 paths: `hops-runs` + `team-status` → `27 pass · 0 fail` · tsc exit 0 · `git status` = the 5 closed-list paths. The `service.ts` diff = D5.1's two checks + comment. The `team.ts` +/- lines = `spec122-api.patch`, line for line (diffed). `openapi.json` +41/−1, the new schema only.
- **The one fix (your Declared note — right, and the gap is mine: my patch kept the old words):** `src/http/routes/team.ts:51`, the 204 description becomes exactly `"noted — the name is the runner's actor, the time is the core's clock; \`state\` and the optional \`sessions\` are read from the body"`. Then `bun run openapi:emit` again. DoD 6's diff gains this one description line, and nothing else changes. Re-run DoD 3 and 4, add the output under Implementation Notes, and set REVIEW. It is done now so Fanta's `gen:api` (TASK-158) reads the final document once.

**2026-10-30 20:2x, Silver — DONE.**
- Re-run by me on d33e586 + the 5 closed-list paths (`git status --untracked-files=all` = exactly those 5): `team.ts:51` reads the asked words exactly, and `openapi.json` carries the same text (one ± description line on top of the first round). `hops-runs` + `team-status` → `27 pass · 0 fail`; tsc exit 0. `openapi:emit` again → byte-identical (`cmp`). Whole suite `929 pass · 1 skip · 1 fail · Ran 931 tests`, the fail = the known `withReadGuard … ONE argument`.
- SPEC-120 D5.1 + D6.1 met; the 9 caw-back probe hits are carried in the two test files. The 4 caw-front hits are TASK-158's. Bob's F-052 is noted (the cause was my patch, F-051).
- Released: TASK-158 (Fanta, `gen:api` against this `openapi.json`) and TASK-159 (Bob).
