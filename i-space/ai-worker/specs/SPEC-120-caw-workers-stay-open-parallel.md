# SPEC-120: CAW workers stay open between tasks, and the whole team works at once
- Source: REQ-122 (design input `maps/caw-wake-107.md`, option A with B's crash path)
- Status: DONE — round 2 (2026-10-30 21:5x, Silver; TASK-162 DONE, REQ-122 r2 SPEC_DONE) · was ACTIVE — round 2 (2026-10-30 21:4x, Silver; REQ-122 TEST_FAILED, TEST-121 DEF-1 → D3 r2, TASK-162) · was DONE (2026-10-30 21:0x, Silver — TASK-157…160 DONE; REQ-122 SPEC_DONE) · was ACTIVE (2026-10-30 20:0x, Silver) — probes re-run 19:4x–20:0x after memory freed; TASK-157…160 cut. Q1–Q3 answered by the PM 19:1x (defaults accepted).
- Read: caw-back 3795236 + REQ-121 = d33e586 (`atom`, 2026-10-30): `src/runner/{hop,main,plan,stream,config,procs}.ts`, `src/mcp/server.ts`, `src/hops/service.ts`, `src/http/routes/team.ts`, `src/cards/view.ts:26-27`; caw-front 04e2874: `src/lib/{screen,crew}.ts`, `src/components/screen/WorkerScreen.tsx`, `src/words.ts:414-423`.

## Overview

Today every card hop starts a fresh `claude -p <prompt> … --no-session-persistence` with stdin closed (`hop.ts:73`, `:219`), and the API refuses a second running hop in a project (`hops/service.ts:48`). The planner returns one action per tick (`plan.ts:38-77`) and idles while any hop runs (`plan.ts:51`).

After this SPEC:
- **D1 (open worker).** Each (project, worker) pair has one long-lived **card process**, `claude -p --input-format stream-json --output-format stream-json …`. A card hop is one **task**: the runner writes one user message to its stdin, and the task is over at the stream's `result` event. The process then waits, idle, for the next task.
- **D2 (hop id per task).** The MCP server reads the running hop id from a file in the worker's folder on every call, instead of from its spawn env.
- **D3 (restart rule).** The process is restarted (a fresh session, nothing resumed) after `RUNNER_WORKER_MAX_TASKS` tasks (default 5), when the last task's context passes `RUNNER_WORKER_MAX_TOKENS` (default 150 000), when the spawn inputs change, or after `RUNNER_WORKER_IDLE_MS` idle (default 30 min).
- **D4 (crash).** If the process dies mid-task, the hop ends by today's rule for a dead child, and the next task starts a new process.
- **D5 (parallel).** There is one running hop per **worker** and per **card**, not per project. The planner starts every idle worker's next card in one tick, within the run's budget.
- **D6 (sessions seen).** The runner's check-in carries its open sessions. `GET /v1/team-status` returns them. The live screen shows "ว่าง · เปิดรอรับงาน" while the worker's session is open and idle, and keeps polling so the next task appears without a reload.
- **Chat hops are unchanged** (one-shot, `buildArgs({chat:true})`, cwd = the hop's own folder). They need different tools and a different cwd from a card process, so they cannot share it. [SA-decided] This is Q1 below (non-blocking).

**Proof that A works (live, 2026-10-30 18:51, one probe, haiku, scratch folder, no repo):** one `claude -p --input-format stream-json --output-format stream-json --verbose` (v2.1.314) took 3 user messages on the same stdin, 25 s apart. It printed `system/init` → `assistant` → `result success` after **each** one, with the same `session_id` all three times. The third answer recalled the first ("ONE"). On stdin EOF the process exited 0. Evidence: `tests/harness/req122-probe/stdin-3-tasks.jsonl` (10 lines). Per-task `result.usage` is per turn, not cumulative (in 2 / out 5 each time). ⇒ EOF closes a worker whose runner died (D4), and a task's context size can be read from its own `result` (D3).

## API / Interface Design

### D5.1 `POST /v1/projects/{projectId}/hops` — the running-hop rule (caw-back `src/hops/service.ts:48`)
Replace "this project already has a hop running" with two checks, in this order:
1. `s.hops.some(h => h.endedAt === null && h.workerId === input.workerId)` → **409 `hop_running`**, message `"this worker already has a hop running"`.
2. For a card hop: `s.hops.some(h => h.endedAt === null && h.cardId === input.cardId)` → **409 `hop_running`**, message `"that card already has a hop running"`.

The code stays `hop_running`, so the error enum in `openapi.json` is unchanged. Chat hops keep their own message rule (`chat/service.ts:94`). `chain/service.ts:47` is unchanged.
Consumers (probe): probe-change.sh caw-back spec122-api.patch → 13 errors (one patch for D5.1 + D6.1; SA 19:4x on d33e586)
caw-back → test/http/hops-runs.test.ts:23 (fail) a second one while it runs → 409 hop_running → TASK-157
caw-front → src/api/http.test.ts:313 TS2769 No overload matches this call. → TASK-158
caw-front → src/api/http.test.ts:318 TS2769 No overload matches this call. → TASK-158
caw-front → src/api/mock.test.ts:219 TS2769 No overload matches this call. → TASK-158
caw-front → src/api/mock.ts:765 TS2322 teamStatus answer lacks sessions → TASK-158

### D6.1 `POST /v1/runner/check-in` body and `GET /v1/team-status` response (caw-back `src/http/routes/team.ts`)
- **Request** `{ state: "running" | "stopping", sessions?: Session[] }`, where `Session = { projectId: string (uuid), workerId: string (uuid), state: "idle" | "busy" }`, max 200 items. `sessions` is optional, so an old runner still checks in. A check-in **replaces** the whole list (it is not merged). `stopping` clears it.
- **Response** `TeamStatus` gains `sessions: Session[]`. It is `[]` when `running` is false (stale > 45 s, or `stopping`). Kept in memory like the rest (`team.ts:1-4`). No event, no table.
- Exact casing: `sessions`, `projectId`, `workerId`, `state`. Schema name `TeamSession`.
- `openapi.json` changes ⇒ caw-front `gen:api` + `typecheck` (spec-rules §2).
Consumers (probe): probe-change.sh caw-back spec122-api.patch → 13 errors (same run as D5.1; the D6.1 hits)
caw-back → test/http/team-status.test.ts:36 (fail) a fresh API: not running, nobody seen … → TASK-157
caw-back → test/http/team-status.test.ts:43 (fail) a running check-in → 204, then team-status says running … → TASK-157
caw-back → test/http/team-status.test.ts:56 (fail) running is a running check-in in the last 45 s … → TASK-157
caw-back → test/http/team-status.test.ts:66 (fail) a stopping check-in makes running false AT ONCE … → TASK-157
caw-back → test/http/team-status.test.ts:78 (fail) a later check-in moves lastSeenAt … → TASK-157
caw-back → test/http/team-status.test.ts:87 (fail) the state is required and checked … → TASK-157
caw-back → test/http/team-status.test.ts:99 (fail) only a runner checks in … → TASK-157
caw-back → test/http/team-status.test.ts:123 (fail) the status belongs to the app that made it … → TASK-157
⇒ openapi.json changes: caw-front gen:api + typecheck → TASK-158 (typecheck exit 2 on the patched pair = the 4 caw-front hits above)

### D2 MCP server: the hop id per call (caw-back `src/mcp/server.ts:19,30,174`)
- `McpOptions.hopId?: string | (() => string | undefined)`. `api()` resolves it **on every call**: a function is called, a string is used as is.
- `import.meta.main`: when `CAW_HOP_FILE` is set, `hopId = () => readFileSync(CAW_HOP_FILE, "utf8").trim() || undefined` (a missing file means `undefined`). Otherwise `CAW_HOP_ID` is used, as today, for chat hops.
- Between tasks the runner writes `""` to the file, so a stray write gets the API's existing `hop_required`.
Consumers (probe): probe-change.sh caw-back spec122-runner.patch → 30 errors (D2 + D5.2; SA 19:5x on d33e586; main.test.ts and test/mcp/* not hit)
caw-back → src/runner/plan.test.ts:9 TS2322 Type '{ busyWorkers?: string[] | undefined; busyCards?: string[] | undefined; mode: "dispatcher" | "manual"; openRun: { id:… → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.test.ts:36 TS2769 No overload matches this call. → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.test.ts:39 TS2769 No overload matches this call. → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.test.ts:42 TS2769 No overload matches this call. → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.test.ts:62 TS2769 No overload matches this call. → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.test.ts:66 TS2769 No overload matches this call. → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.test.ts:69 TS2769 No overload matches this call. → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.test.ts:72 TS2769 No overload matches this call. → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.test.ts:75 TS2769 No overload matches this call. → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.test.ts:86 TS2769 No overload matches this call. → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.test.ts:87 TS2769 No overload matches this call. → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.test.ts:129 TS2769 No overload matches this call. → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:78 (fail) automatic mode — an open run > a hop is running → one at a time: nothing → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:78 (fail) automatic mode — an open run > none running → the lowest-numbered workable card, with its assignee → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:78 (fail) automatic mode — an open run > workable is in the API's order, but the lowest NUMBER wins regardless → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:78 (fail) automatic mode — an open run > a card with no assignee has no worker: skipped, the next one is taken → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:78 (fail) which cards are taken again within one run (a failed card must not be hopped in a loop) > a card whose hop FAILED or was STOPPE… → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:78 (fail) which cards are taken again within one run (a failed card must not be hopped in a loop) > a card already hopped by this worker … → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:78 (fail) which cards are taken again within one run (a failed card must not be hopped in a loop) > an INTERRUPTED hop does not count: th… → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:78 (fail) which cards are taken again within one run (a failed card must not be hopped in a loop) > the same card for a DIFFERENT worker … → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:78 (fail) which cards are taken again within one run (a failed card must not be hopped in a loop) > the only card, commented once → it ge… → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:78 (fail) which cards are taken again within one run (a failed card must not be hopped in a loop) > c1 commented once and c2 untouched → … → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:44 (fail) a chat message is the operator's go for one chat hop, in either mode (D-053 Q-A) > manual mode, nothing running → a chat hop fo… → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:44 (fail) a chat message is the operator's go for one chat hop, in either mode (D-053 Q-A) > dispatcher with an open run → the chat messa… → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:44 (fail) a chat message is the operator's go for one chat hop, in either mode (D-053 Q-A) > dispatcher with NO open run and no reason to… → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:44 (fail) a chat message is the operator's go for one chat hop, in either mode (D-053 Q-A) > it waits for a running hop, card or chat — o… → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:78 (fail) a chat message is the operator's go for one chat hop, in either mode (D-053 Q-A) > no entry worker → no chat hop (main logs it … → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:44 (fail) a chat message is the operator's go for one chat hop, in either mode (D-053 Q-A) > a chat hop does not touch the run: it is tak… → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:44 (fail) a chat message is the operator's go for one chat hop, in either mode (D-053 Q-A) > manual mode with a run still open: the run i… → TASK-159 (a plan.test.ts case on the old shape)
caw-back → src/runner/plan.ts:44 (fail) a chat message is the operator's go for one chat hop, in either mode (D-053 Q-A) > a run that must end (a card sent back twice)… → TASK-159 (a plan.test.ts case on the old shape)

## Data Model
No table and no event change. Sessions live in memory (D6.1). `hopsUsed` and the run budget are unchanged (REQ-120: only the run's budget, `service.ts:51`).

## Flow

### D1 Card process (new `caw-back → src/runner/pool.ts`)
Key `${projectId}|${workerId}`. The pool holds `{ child, dir, spawnKey, tasks, lastTokensIn, busyHop: string | null, idleSince }`.
1. **Folder:** `<tmpRoot>/worker-<projectId>-<workerId>/` (mode 0700) holds `mcp.json` (env `CAW_API_URL`, `CAW_WORKER_ID`, `CAW_HOP_FILE=<dir>/hop`, **no** `CAW_HOP_ID`), `settings.json` (today's per-hop build, `hop.ts:369-371`, with `readableDirs(roots, dir)`), `skills.md` (`writeSkillsFile`), and `hop` (the running hop id, or empty).
2. **Spawn args:** `buildArgs` minus the `-p <prompt>` pair, plus `-p --input-format stream-json`. Everything else is today's card flags (`hop.ts:204-221`), including `--no-session-persistence` (nothing is resumed: D3/D4). cwd = first writable root, env = `childEnv`, `detached: true`, **stdin: pipe**.
3. **spawnKey** = sha256 of the args + settings.json text + skills text. When it differs from the open process's key (roots, read-only, skills, model, effort or server ports changed), the process is ended and a new one started **before** the task.
4. **A task** (`runTask`, replacing the spawn half of `runOne` for card hops): the checks before the spawn stay as they are (`hop.ts:346-356`: roots, `folderOutsideWorkspace`, skills). Then: write the hop id to `<dir>/hop` → write the hop file (procs.ts, pid = the worker's pid) → write one line `{"type":"user","message":{"role":"user","content":<buildPrompt(...)>}}\n` → read lines with a **fresh `StreamState` per task** until the `result` line. Heartbeat, screen, refusals and the limit work on those lines exactly as today (`hop.ts:406-439`). The screen sender's `hopId` = this task's hop.
5. **Task end** = the `result` line. Then the outcome comes from events, as today (`hop.ts:453-483`), with `code` = 0. Then write `""` to `<dir>/hop`, **remove** the hop file **without** settling the group (the group is the open worker), set `tasks++` and `lastTokensIn = sum.tokensIn`, and mark the worker idle.
6. **Stops inside a task** (hop cap `hopMaxMs`, the 10th refusal, the limit signal): today's `end.note`, and the **process is terminated** (`terminate` + `settleGroup`). The hop is finished `stopped` with today's note. The next task starts a fresh process.
7. **Runner stopping:** as today (`main.ts:389-397`), every child is killed. A running task's hop stays running for the next runner (`hop.ts:458`). Idle workers just end.
8. **`StreamState` gains** `get done(): boolean` (true once a `result` line was read). It is the only parser change.

### D3 Restart rule (checked when a task is about to be given to the worker)
| Condition | Source | Action |
|---|---|---|
| `tasks >= RUNNER_WORKER_MAX_TASKS` (default 5) | pool counter | end the process, start a fresh one, then the task |
| `lastTokensIn >= RUNNER_WORKER_MAX_TOKENS` (default 150 000) | the last task's `result.usage` input + cacheCreation + cacheRead (`stream.ts:113-118`) | same |
| `spawnKey` changed | D1.3 | same |
| idle for `RUNNER_WORKER_IDLE_MS` (default 1 800 000) | `idleSince`, checked each tick | end the process; **no** new one until a task needs it |
| the process has exited | `child.exited` settled | drop it; the next task starts a new one |
Config: three new optional env keys in `runner/config.ts` via `positive(...)` (like `RUNNER_HOP_MAX_MS`, `config.ts:69`). A restart loses nothing: every task re-feeds itself (`buildPrompt` + `card_context`, `maps/caw-wake-107.md` § "Won't option A forget?").

### D4 Crash mid-task
The process exits before `result` ⇒ the read loop ends ⇒ `code = await child.exited` ≠ 0 ⇒ **today's rule** (`hop.ts:467-483`): the worker's events on the card decide the outcome; with none it is `failed`, note `"ก้าวนี้ไม่ได้ทิ้งผลงานไว้ · exit <n>"`. The pool drops the worker, and its next task spawns a new process. **"Interrupted" stays reserved for a runner restart** (`NOTES.interrupted`). See Q2.
A runner killed hard: its open workers get stdin EOF and exit 0 (probe). A worker mid-task is found by its hop file, as today (`main.ts:166`, `reapLeftover`).

### D5.2 Planner (caw-back `src/runner/plan.ts`)
- `PlanInput`: `hopRunning: boolean` stays (any running hop in the project: store ∪ this process). New fields: `busyWorkers: string[]` and `busyCards: string[]` (workers and cards with a running hop, store ∪ `activeIn`).
- `Action`: `start_hop` becomes `{ kind: "start_hops"; hops: { cardId: string; workerId: string }[] }` (one or more).
- Order (changes marked **new**):
  1. Manual mode: unchanged (`plan.ts:42-45`).
  2. `reviewFailed` → `finish_run`. Unchanged.
  3. Chat: pending message, entry worker set and **not in `busyWorkers`** (**new**: was `!hopRunning`) → `start_chat_hop`, alone in that tick.
  4. No open run → `open_run` / `idle`. Unchanged.
  5. `room = hopBudget − hopsInRun.length` (running hops count too, as the API counts them, `service.ts:51`). If `room <= 0`: `hopRunning` ? `idle` : `finish_run budget_spent`.
  6. **new:** go through `fresh` cards first, then `second`-turn cards (today's lists, `plan.ts:67-70`). Skip a card in `busyCards` or whose assignee is in `busyWorkers`, and take at most one card per worker and at most `room` cards → `start_hops`.
  7. Nothing to start: `hopRunning` ? `idle` : today's `no_progress` / `nothing_workable` (`plan.ts:74-76`). The run ends only when nothing is running.
- **Boundary case (spec-rules §3, `isWorkable` `cards/view.ts:26-27` + D5.1):** SA's hop on card #1 hands #1 to BE before its `result`. #1 is workable for BE, but `busyCards` holds #1, so it is not started this tick. The API would refuse it too (D5.1.2). SA's task ends → next tick #1 → BE. Two workers never run one card at once.
- `main.ts` `start_hop` case: loop over `hops`, one `api.startHop` + `launch` each. The per-card error handling (`main.ts:275-287`) runs per item: `hop_running` / `not_workable` / any other 4xx → `continue` to the next item. `no_budget` → the remaining items are skipped, and the run is ended `budget_spent` only when none of this project's hops is still being run by this process. Otherwise the planner ends it once they finish (D5.2 step 5). `busyWorkers` / `busyCards` = the listed hops with `endedAt === null`, or whose id is in `activeIn`. The workable cards are read whenever the mode is dispatcher with an open run, not only when nothing is running (`main.ts:207`). A pending chat message is looked for only while the entry worker is not busy (`main.ts:210`).

### D6.2 Sessions on the check-in (caw-back runner)
`createCheckIn` sends `sessions` from the pool: `idle` when `busyHop === null`, else `busy`. It sends on the 15 s timer, and once, not awaited, on every open, close, task start and task end.

### D6.3 Live screen (caw-front)
- `src/lib/screen.ts` `screenOf` also reads `api.teamStatus()` and returns `open: boolean` = `running && sessions.some(s => s.projectId === projectId && s.workerId === workerId)`. A failed teamStatus read → `open: false`.
- `WorkerScreen.tsx`: `again = !a.hop || a.hop.endedAt === null || a.more || a.open` (it keeps polling while the session is open). Header: when `open` and no running hop → badge `screen.idle`, `data-idle`. Otherwise today's states. The new hop is picked up by today's "newest hop changed" path (`WorkerScreen.tsx:43-45`).
- `src/words.ts` `screen.idle: "ว่าง · เปิดรอรับงาน"` — the PM's REQ-122 table, verbatim. No placeholder.
- The mock (`src/api/mock.ts` `teamStatus`) returns `sessions: []` unless a test sets them.

## Non-functional
- No new dependency. Live runs: QA's AC-6 only (≤ 2 runs, REQ-122).
- Parallel hops are separate process groups, as today. `CAW_WORKSPACE_ROOT` confinement and the guard hooks are unchanged, because they ride in each worker's settings and `buildArgs`.

## Tasks
- TASK-157: caw-back — one running hop per worker and per card; check-in sessions (D5.1, D6.1) — owner: BE Bob (depends on: REQ-121 committed d33e586 ✓)
- TASK-158: caw-front — gen:api for sessions; live screen "ว่าง · เปิดรอรับงาน" (D6.1 pair, D6.3) — owner: FE Fanta (depends on: TASK-157 openapi.json)
- TASK-159: caw-back runner — parallel planner `start_hops`; MCP hop id per call (D5.2, D2) — owner: BE Bob (depends on: TASK-157 DONE)
- TASK-160: caw-back runner — open worker process pool, restart rule, crash, sessions on the check-in, stdin stub (D1, D3, D4, D6.2) — owner: BE Bob (depends on: TASK-159 DONE)
  Consumers (probe): probe-change.sh caw-back spec122-types.patch → 0 errors (Child.stdin?, Spawner opts stdin?, api.checkIn(state, sessions?), StreamState.done; tsc + runner tests, SA 20:0x)

AC map: AC-1 → TASK-157 + 159 + 160 (stub, QA) · AC-2 → TASK-160 · AC-3 → TASK-160 (restart rule) · AC-4 → TASK-160 (D4, `FAKE:die`) · AC-5 → TASK-157 + 158 + 160 (sessions) · AC-6 → QA live (≤ 2 runs) after all four · AC-7 → every TASK's whole-suite DoD line.

## Round 2 — D3 r2: the restart rule reads the real context (REQ-122 req 7, AC-8, AC-9; TEST-121 DEF-1)

**What was wrong (mine, F-054).** D3 compared `RUNNER_WORKER_MAX_TOKENS` with the last task's `result.usage` (input + cacheCreation + cacheRead). The 18:51 probe made **one model call per task**, so its `result` equalled the context. A real task makes 4–19 calls, and `result.usage` adds up every call's prompt, so every real task "reached" 238 884–632 307 and the next task restarted the process.

**Measured on QA's live traces** (`tests/harness/test-121/live/out/traces/*.jsonl`, 13 card and chat hops, SA 21:4x, script = per assistant message id, its last usage line):
| | first call's prompt | last call's prompt | `result` sum |
|---|---|---|---|
| range over 13 tasks | 11 609–36 229 (a fresh session ≈ 36 k: system prompt + skills + tools) | **25 849–54 865** | 82 628–873 146 |
The last call's prompt is the session's context when the task ends, and it is what the next task starts on top of.

**D3 r2.**
- `StreamSummary.lastContext` = input + cacheCreation + cacheRead of the **last** assistant message (`stream.ts` `assistantUsage`, last entry), else `null`. The pool's `lastContext` comes from it (`hop.ts:474`). The hop's stored `tokensIn` / `tokensOut` (cost) keep the summed `result` numbers, unchanged.
- **The limit stays 150 000** [SA-decided]. The models' window is 200 000 (75 %, leaving room for one more task's growth before Claude's own compaction). The largest real task ended at 54 865, so a worker's **2nd task never restarts** (req 7). By arithmetic, the session would pass 150 000 only after ≈ 6 tasks of the largest kind (+ ≈ 19 k per task on a 36 k base), and the 5-task rule restarts first. So in a normal run the reasons in the log are "done 5 tasks", or "spawn inputs changed" / "process exited" — inferred from 13 tasks' growth; AC-8's live run settles it.
- Log line: `starting a new process — its context reached <n> tokens (the last call's prompt)`.
- The rest of D1–D6 is unchanged.

Consumers (probe): probe-change.sh caw-back spec122-r2.patch → 2 errors (tsc + pool/hop/stream/main tests, SA 21:4x on d33e586 + 21 paths, fp `0aa059ed44ca`)
caw-back → src/runner/pool.test.ts:50 TS2339 Property 'lastTokensIn' does not exist on type 'OpenWorker'. → TASK-162
caw-back → src/runner/pool.test.ts:50 (fail) reuse > one process serves task after task for the same (project, worker): one spawn, the same worker, tasks counted → TASK-162

**Round 2 tasks.**
- TASK-162: caw-back runner — `lastContext` in the summary, the pool restarts on it; TEST-121 regression tests — owner: BE Bob (depends on: TASK-160 DONE ✓, same uncommitted tree)
AC map r2: req 7 / AC-8 → TASK-162 + QA live (≤ 2 runs) · AC-9 → TASK-162 DoD 6 + QA's stub regression (AC-3 run with the new rule, e.g. `RUNNER_WORKER_MAX_TOKENS=40000` so a stub task's context reaches it).

## Questions
- **Q1 (non-blocking, [SA-decided] default):** chat hops stay one-shot (a fresh `claude -p` per message, as today). The entry worker's card work uses its open process; its chat answers do not, because a chat hop has other tools and runs in another folder. REQ-122 item 1 says "each AI worker … one session". Default: card work only.
- **Q2 (non-blocking, default):** REQ-122 item 4 / AC-4 says "interrupted as today". Today a child that dies mid-hop gives `failed` + "ก้าวนี้ไม่ได้ทิ้งผลงานไว้ · exit n". `interrupted` is only set when a runner restart finds an orphan ("ถูกขัดจังหวะเพราะตัวรันเริ่มใหม่"), and an interrupted hop does not use up the card's turn. Default: keep today's rule (`failed`, exit code in the note) and no new words.
- **Q3 (non-blocking, default):** the REQ table puts "ว่าง · เปิดรอรับงาน" on "worker strip / live screen". Default: the live screen header only. The crew seat keeps its states (`crew.ts:69-84`), which already show who is working per worker.
  > answer (Porter, PM, 2026-10-30 19:1x) `[PM-decided]`: **Q1 accepted** — card work on the open process; chat hops stay one-shot (other tools, other folder). REQ-122 req 1 reads "card work" for this round; a chat on the open session is not asked for. **Q2 accepted** — "as today" meant today's rule: `failed` + exit code, no new words; AC-4 is read that way. **Q3 accepted** — live screen header only; if the dress rehearsal shows the strip leaves the owner unsure whether a worker is open, it comes back as a small REQ.
