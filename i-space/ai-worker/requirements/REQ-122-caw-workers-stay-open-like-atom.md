# REQ-122: CAW workers stay open like Atom, and the whole team works at once
- Status: **round 2 TEST_PASSED** (2026-10-30 22:23, QA Tanya — AC-8 live: one Claude session per worker for all its tasks, 0 restarts; AC-9 PASS; tested caw-back d33e586 fp `e1be4e88f4d1` · caw-front 04e2874 fp `3ce60b3d3217`) · **TEST_FAILED** (2026-10-30 21:41, QA Tanya — AC-6: workers restarted after every real task, DEF-1 MAJOR; AC-1…5, 7 PASS; `tests/TEST-121-caw-open-workers-parallel.md`) · READY_FOR_SA (2026-10-30 18:5x, the PM)
- Priority: HIGH `[owner-approved 2026-10-29]` — planned under the name "REQ-106" in `../project-docs/plan-next-th.md` (owner GO 2026-10-29 12:41) and `../project-docs/plan-sit-th.md` step 5; `new-id.mjs` gave it 122 (the PM never picks a number). Every "REQ-106" in those plans means this REQ.
- Requested: 2026-10-29 by the owner — `DECISIONS.md` 2026-10-29 11:41 items 5, 7, 9 (*"ใช้ตามที่ Porter แนะนำทุกข้อ"*), and *"CAW คือเสมือน Atom"* (SYSTEM-FACTS, 00:19). Stamp `operator`.
- Deadline: none · Team: **B (CAW)** · design input: `maps/caw-wake-107.md` (REQ-107 study, TEST-103 PASSED — option A recommended, B as fallback)

## Problem / Goal

The owner wants CAW to work like Atom: each AI worker is a Claude CLI that stays open on the server and takes work continuously, the whole team works in parallel on one project, and the user can watch each worker's live screen. Today the runner starts a fresh `claude -p` for every hop and closes it when the hop ends (`maps/caw-wake-107.md` § baseline). Each hop pays the start-up time, and only one hop runs per project at a time.

## Requirement

1. Each AI worker in a CAW team is one Claude CLI session that **stays open** between its tasks. A new task reaches the open session; it does not start a new process each time. (11:41 item 5)
2. **The team works in parallel:** in one project, every worker that has a workable card runs at the same time, at most one task per worker. (11:41 item 7)
3. **Nothing important lives only in a worker's head:** every task brings in everything it needs from CAW's store (the card, spec, requirements, notes), as today. A session is restarted on a rule (for example after N tasks or a size limit), and a restart loses nothing. (`maps/caw-wake-107.md` § "Won't option A forget?")
4. If a worker's process dies mid-task, the task is marked interrupted as today, and the worker comes back. Its next task works.
5. **The live screen per worker (REQ-104) shows the open session**, including while it is idle between tasks. Read-only, as today. (11:41 item 9, first step)
6. Everything that works today keeps working: REQ-104/105/111–121 behaviour, budgets per run (REQ-120), the stop reasons (REQ-117/119), the guard hooks and folder confinement (REQ-111/113).

Which mechanism (stream-json stdin, resume, or another) and the restart rule are the SA's design. The study recommends A with B as the fallback.

## Acceptance Criteria

- [ ] **AC-1** — **Given** a team of 5 with a workable card each (stub CLI that reads stdin) **When** a run starts **Then** 5 worker processes start once and work at the same time; each process takes its next task without a new process starting. Check: QA, stub; process list + hop records.
- [ ] **AC-2** — **Given** one worker **When** it finishes 3 tasks in a row (stub) **Then** one process served all 3, each task was marked done when its result arrived, and its writes (comment / hand-off / status) landed on the right card. Check: QA, stub.
- [ ] **AC-3** — **Given** the restart rule's limit **When** a worker reaches it (stub) **Then** it is restarted, and its next task still does the right card's work with full context. Check: QA, stub.
- [ ] **AC-4** — **Given** a worker killed mid-task (stub) **When** the runner notices **Then** the task is interrupted (as today), the worker comes back, and its next task works.
- [ ] **AC-5** — **Given** a worker's live screen open **When** the worker is idle, then gets a task **Then** the screen shows it idle, then the new task's activity, without a reload.
- [ ] **AC-6** (live, ≤ 2 runs) — **Given** REQ-108's hand-typed Health Board spec on a new project **When** the team runs on real Claude CLI **Then** workers stay open across their tasks, whenever two or more cards are workable at once their workers run at the same time (the ledger shows overlapping hops; if the cards never overlap, QA says so and AC-1 is the proof), and the result still meets REQ-108 AC-4 (the dashboard on :3900 checks the 4 services). Check: QA, live; ledger + process list.
- [ ] **AC-7** (regression) — caw-back + caw-front suites pass; REQ-117/119/120/121 cases still pass.

## User-facing wording (the PM)

| Where | TH | EN |
|---|---|---|
| worker strip / live screen, open but no task | ว่าง · เปิดรอรับงาน | Idle · open, waiting for work |

Any other new line the design needs: the SA asks, the PM writes it.

## Out of Scope

- Typing into a worker's screen (11:41 item 9, second step — after this REQ). · CLI per human user (item 6: per AI worker for now). · tmux / Atom's exact way (study option C) unless the SA shows A and B fail. · Deploy to SIT (the owner's).

## Round 2 (TEST-121 DEF-1, PM 2026-10-30 21:4x) `[PM-decided]` (DECISIONS 21:4x)

TEST-121: AC-1…5 and AC-7 PASS on the stub; AC-6 live FAILED. Every real card task started a new session (13 hops = 13 sessions) because the restart rule's limit (150,000 tokens) is below what one real task already reads (238,884–632,307). With the limit raised, one real session served 2 tasks, so the mechanism works.

- **Req 7.** In a real run, a worker's open session serves its next tasks. The restart rule (req 3) fires only when the session is really close to what it can hold, or on the rule's other limits. It must never fire on a worker's 2nd task in a normal run. How it is measured, and what the limit is, is the SA's design. Write the reason in the runner log, as today.
- **AC-8** (live, ≤ 2 runs, gateway 0) — **Given** REQ-108's hand-typed spec on a new project and the default settings **When** the team runs on real Claude CLI **Then** every worker that does 2 or more card tasks does at least its first 2 in one session (the ledger shows the same session id), and every restart in the runner log gives a reason that is not "the 2nd task". AC-6's other parts still hold (parallel hops, the dashboard checks the 4 services). Check: QA, live; ledger + runner log.
- **AC-9** (regression) — AC-1…5 and AC-7 still pass on the stub, and AC-3 (a restart loses nothing) is run with the new rule.
- Observations: O-1 is the team's page, not CAW. O-3 (a run started through the API on a project still in manual mode) is accepted, because the screen always sets the mode first. O-2 (an API card handed to the FE) goes on the dress-rehearsal watch list, the same as TEST-119 O-1.

## Questions
(the SA and the QA ask here; the PM answers as `> answer: ...`)

## AC check
(SA B, Silver, 2026-10-30 21:0x — SPEC-120; TASK-157/158/159/160 DONE, uncommitted: caw-back d33e586 fp `0aa059ed44ca` · caw-front 04e2874 fp `3ce60b3d3217`)

| AC | Where it is met | Self-checked |
|---|---|---|
| AC-1 | API one hop per worker/card `caw-back → src/hops/service.ts:48-50` (TASK-157) · planner `start_hops` `src/runner/plan.ts` (TASK-159, plan.test "the team works in parallel") · one open process per (project, worker) `src/runner/pool.ts:121-154` (TASK-160) · stub CLI `src/runner/e2e/open-claude.ts` · Bob's stub run: 4 tasks on 2 processes, 2 hops at once (TASK-160 DoD 9) | yes — design + stub; 5 workers is QA's run |
| AC-2 | a task = one stdin line, ends on `result` (`hop.ts:456-458`); outcome per hop from its own events; `x-caw-hop` per task from `CAW_HOP_FILE` (`mcp/server.ts`, TASK-159) · hop.test "one child serves 3 hops" | yes — stub; QA re-runs |
| AC-3 | restart rule `pool.ts:125-135` (5 tasks · 150 000 context · spawn change · exited), config `RUNNER_WORKER_MAX_TASKS/_MAX_TOKENS/_IDLE_MS`; each task re-feeds itself (`buildPrompt` + `card_context`) · pool.test restart cases | yes — stub; QA sets `RUNNER_WORKER_MAX_TASKS=2` to reach it |
| AC-4 | a process dying before `result` → today's rule `failed` "… · exit n" (Q2 answer), worker dropped, next task spawns new · stub `FAKE:die` · hop.test "a child dying mid-task" | yes — stub |
| AC-5 | sessions on the check-in (`main.ts` `createCheckIn`, TASK-160) → `GET /v1/team-status.sessions` (TASK-157) → `screenOf.open` + `WorkerScreen` `data-idle` "ว่าง · เปิดรอรับงาน", polls on while open (TASK-158); 390 shot `tests/harness/task158/screen-idle-390.png` | yes for each part; idle → task without reload end to end = QA's stub run (not run by me) |
| AC-6 | live, ≤ 2 runs — QA. Note: the real MCP server's `CAW_HOP_FILE` read is first used by a real worker here | yes — design (AC-1…5 parts together, as for REQ-121 AC-3); the live proof is QA's, as the REQ says ("Check: QA, live") |
| AC-7 | caw-back whole `970 pass · 1 skip · 1 fail` (known withReadGuard) · caw-front `361 pass · 0 fail`, typecheck 0 — SA re-runs 20:3x–21:0x; one loaded run of 4 runner files showed 3 fails not seen in 3 re-runs (TASK-160 § Review) | yes, with that note |

## Verification (by QA)
Tanya, 2026-10-30 21:41 — tree-fp.sh: caw-back d33e586 fp `0aa059ed44ca`, caw-front 04e2874 fp `3ce60b3d3217` (same at 21:16 and 21:41). Detail TEST-121.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | stub: 5 workers × 2 tasks → 5 processes, each served its 2 tasks; 5 hops at once |
| AC-2 | PASS | stub: one pid served tasks 1–3; each hop ended 0.02 s after its result; writes on the right card |
| AC-3 | PASS | stub, `RUNNER_WORKER_MAX_TASKS=2`: task 3 in a new process with its full context |
| AC-4 | PASS | stub worker SIGKILLed mid-task → hop `failed` ("exit 137"), worker back in a new process, next task done |
| AC-5 | PASS | the screen: "ว่าง · เปิดรอรับงาน" → the new task's stream 2.2 s after, no reload → idle again |
| AC-6 | **FAIL** | live: parallel yes (7 overlapping pairs), REQ-108 AC-4 yes ("ไม่ตอบ" 6.9 s), **workers stayed open: no** — 13 card hops, 13 sessions; runner: "its context reached 238,884…632,307 tokens" vs limit 150,000 (DEF-1). Isolation run (limit 5,000,000): one real session served 2 tasks |
| AC-7 | PASS | REQ-117/119/120/121 cases all OK; caw-back 970/1/1 known (under load), caw-front 361/0; Silver's 3 fails not seen in 5 runs |

### AC check — round 2 (SA B, Silver, 2026-10-30 21:5x — SPEC-120 § Round 2; TASK-162 DONE; caw-back fp `e1be4e88f4d1` · caw-front fp `3ce60b3d3217`)

| AC | Where it is met | Self-checked |
|---|---|---|
| Req 7 | the restart rule reads `StreamSummary.lastContext` (the last call's prompt) `caw-back → src/runner/stream.ts:19,126,132` → `hop.ts:474` → `pool.ts:127,159`; the log says why (`… (the last call's prompt)` / `it has done 5 tasks`). On QA's 13 real traces, lastContext is 25 849–54 865 against 150 000, so a 2nd task never restarts | yes — on real traces; the live proof is AC-8 |
| AC-8 | as req 7, plus round 1's AC-6 parts (unchanged code) | yes — design; the live proof is QA's ("Check: QA, live") |
| AC-9 | round 1's AC-1…5 and AC-7 code unchanged except the 3 files; whole suite `976 pass · 1 skip · 1 fail` (known); hop.test (d)/(e) run the restart rule with the new measure | yes — stub; QA re-runs AC-3 with the new rule |

**Round 2** — Tanya, 2026-10-30 22:23 — tree-fp.sh: caw-back d33e586 fp `e1be4e88f4d1`, caw-front 04e2874 fp `3ce60b3d3217` (same 22:00 / 22:23). Detail TEST-121 § Round 2.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-8 | PASS | live, defaults, new project: แบงค์ 3 tasks / ฝน 5 / มิ้นท์ 2 — each in ONE Claude session (trace session ids); 0 restarts; last-call context 41k–67k; parallel hops; REQ-108 AC-4 "ไม่ตอบ" 7.2 s |
| AC-9 | PASS | stub S1–S14 again OK; S15: 60k last calls → one process for 3 tasks; 200k → restart each task, log "(the last call's prompt)"; caw-back 976/1/1 known |

Memory note: one reading of 2,606 MB available during the run (22:12:59), 4.5 GB 30 s later; reported, run not stopped.

