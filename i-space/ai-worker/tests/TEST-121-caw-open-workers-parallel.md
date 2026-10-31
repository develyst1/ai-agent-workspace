# TEST-121: CAW workers stay open between tasks, and the team works in parallel
- Source REQ: REQ-122 (Team B: SPEC-120, TASK-157/158/159/160)
- Status: **TEST_PASSED round 2** (2026-10-30 22:23, Tanya — AC-8 live: one session per worker across its tasks, DEF-1 fixed; AC-9 PASS; § Round 2) · round 1 **TEST_FAILED** (2026-10-30 21:41, Tanya) — AC-6 live: workers did **not** stay open across tasks (DEF-1, MAJOR); AC-1…AC-5, AC-7 PASS
- Environment: local (this machine) · stub `CLAUDE_BIN` (QA's own open-worker stub) for AC-1…5/7 · **live `claude` 2.1.314** for AC-6 (`CLAUDE_BIN=/home/box/.local/bin/claude`, logged) · no gateway (refusing stub :4396, 0 calls) · `free -m` checked before each live run (10,098 / 10,178 MB available, never below 9.4 GB during)
- Tested: 2026-10-30 by Tanya · harness `tests/harness/test-122/` (stub: `r122.mjs` + `qa-claude.ts`; live: `live/`) — named after the REQ; the TEST number came from `new-id.mjs`
- Build under test (`bash ai-worker/tools/tree-fp.sh`, at the start 21:16 and the verdict 21:41 — **the same**, and the same as the PM's line):
  - `tree-fp caw-back HEAD d33e586 fp 0aa059ed44ca (252 paths: 249 tracked, 3 untracked, 0 deleted)`
  - `tree-fp caw-front HEAD 04e2874 fp 3ce60b3d3217 (146 paths: 145 tracked, 1 untracked, 0 deleted)`
  - live only, committed: blueprint-back 6123018 · blueprint-front 6692a16. Run from clean HEAD exports + diff + untracked.

## Instruments and their limits
- `qa-claude.ts` — QA's own stub (not the SA's `open-claude.ts`): started with `-p --input-format stream-json` it is an **open worker** (one stdin line = one task, a stream ending in `result` per task, waits for the next; the hop id read from `CAW_HOP_FILE` on every call); with `-p <prompt>` a one-shot (chat). Per task it records pid, the n-th task of that process, hop id, card, prompt, `card_context`. Actions per worker per turn (TEST-116/119's set + `sleep:<ms>`, `review`, `done`, `die`).
- `r122.mjs` = TEST-119's `r121.mjs` (S1–S9 = REQ-117/119/120/121, the AC-7 regression) + **S10–S14** (AC-1…5); the real caw-back API + runner + caw-front, the starting team by its button, runs by the real dialog (S13 starts run 2 through the API so the open screen is never reloaded). `ONLY=` picks scenarios; `QA_RUNNER_ENV` passes runner settings (S14: `RUNNER_WORKER_MAX_TASKS=2`).
- Live: REQ-121's tools (`hand.mjs`, `label.mjs`, `live.mjs`, `accept-q.mjs`, `ac4.mjs`, `approver.mjs` — QA approves reviews as the owner, each logged), a **new** project + folder `health-board-122`; evidence = hop timeline, the traces' Claude **session ids**, the runner's "starting a new process" lines, `ps`.
- Harness bugs of mine, fixed before any verdict: the new stub kept step results under `results` (old checks read `result` → "HTTP undefined", S3 crashed); the screen locator picked ปลา's cell; S9 expected "#2 … todo" where REQ-122 correctly shows "doing" (ฝน works at the same time); my first process watcher counted every `claude` on the box (the desk's own sessions too); `ac4.mjs` read `li` rows and this team's page uses `article.service`. Pass 1 before the fixes: `r122-pass1a.out`.

## Cases

| # | AC | Type | Actual | Result |
|---|---|---|---|---|
| 1 | **AC-1** | happy | S10: 5 workers × 2 cards (each task 4 s): **10 tasks in 5 processes, one per worker, each serving its tasks 1 and 2**; **5 hops at once**, 5 stub processes seen at once; 10 tasks done in 10.2 s; all cards done (`out/s10-tasks.json`) | PASS |
| 2 | **AC-2** | happy | S11: one worker, 3 cards in a row → **one pid, tasks 1, 2, 3**; each hop ended **0.02 s** after the stub's result; each card done with its own task's comment (by text: pid + task n) — the note has no hop id field, so "its own hop" is shown by the text, not a field | PASS |
| 3 | **AC-3** | happy | S14 (`RUNNER_WORKER_MAX_TASKS=2`): tasks 1–2 in pid A, **task 3 in a new pid** (task 1 of it); that task had its card id in the prompt, `card_context` 200 for its own card, the rule lines, and ended done (`r122-pass2.out`) | PASS |
| 4 | **AC-4** | negative | S12: QA **SIGKILLed** the open worker mid-task → that hop `failed`, "ก้าวนี้ไม่ได้ทิ้งผลงานไว้ · exit 137 · tools: none · turns 0" (today's rule); the worker came back in a **new process** and its next task (#2) ended done. The killed card #1 stays `todo` and the run ends `no_progress` naming it (REQ-119: a failed hop is that card's turn) | PASS |
| 5 | **AC-5** | painted | S13: ใบเตย's screen, open after its task: "หน้าจอของ ใบเตย · **ว่าง · เปิดรอรับงาน**"; a new card + run 2 started with the page untouched → **2.2 s later the same screen shows "สด" and the new task's stream** (no reload); after it, idle again (`out/s13-*.png`) | PASS |
| 6 | **AC-6** | live | run 1 (budget 24, 13 card hops, 18:27–18:36 UTC+7): **parallel — yes**: up to 2 card hops at once, 7 overlapping pairs (#1 แบงค์ ∥ #4 ฝน, #3 แบงค์ ∥ #5 ฝน, #5 มิ้นท์ ∥ #6 ฝน, …); all 8 cards done; 0 operator questions | PASS (parallel) |
| 7 | **AC-6** | live | run 1: **workers stay open — NO**: 13 card hops = **13 different Claude session ids**, one `init` + one `result` each; the runner logged **10 × "starting a new process — its context reached N tokens"** with N = 238,884 … 632,307 against the default limit 150,000 → every real task started a new process → **DEF-1** (`live/out/runner.log`, traces) | **FAIL** |
| 8 | AC-6 | isolation | run 2 (diagnostic, budget 2, one worker, 2 tiny cards, runner with `RUNNER_WORKER_MAX_TOKENS=5000000`): **both tasks in ONE Claude session** (`24a53fb7…` on both hops), 0 restarts, one open process; task 2 took 6 s; both cards done, `notes/a.txt`, `notes/b.txt` written (`live/out2/`) — the open mechanism, `CAW_HOP_FILE` included, works with the real CLI; only the limit stops it | — |
| 9 | AC-6 | live | REQ-108 AC-4 on run 1's build (`health-board-122`, its README: `node server.js`): the page shows the 4 services ทำงาน with "เวลาตอบ" + "เช็คล่าสุด", a "เช็คตอนนี้" button; QA's caw-web stopped → "CAW เว็บ · ไม่ตอบ" **in 6.9 s** | PASS |
| 10 | **AC-7** | regression | S1–S9 (REQ-117/119/120/121): all OK (`r122.out`) — S9's other-cards line now shows the FE's card as `doing` (REQ-122: they work at once) | PASS |
| 11 | AC-7 | suites | caw-back **970 / 1 skip / 1 fail** — the known `withReadGuard` test, run **under load** (with pass 1); `src/runner/` ×3 in parallel → 601 / 1 fail each, the same test · caw-front typecheck 0, **361 / 0**, build 0. **Silver's 3 unnamed fails: not seen in 5 runs (4 loaded)** | PASS |

## Defects
### DEF-1 — live, an open worker is restarted after every task: the restart rule's token limit (150,000) is below the context of any real task — MAJOR
- Environment: run 1 above (real `claude` 2.1.314, default runner settings).
- Repro: any real run with default settings — e.g. REQ-108's spec, the starting team, อัตโนมัติ.
- Expected (REQ-122 req 1, AC-6): "workers stay open across their tasks" — a worker's next task reaches its open session.
- Actual: every card hop ran in a new process/session (13 hops, 13 session ids); the runner's own reason each time: `starting a new process — its context reached <N> tokens`, N 238,884–632,307 (`pool.ts` `acquire`: `lastTokensIn >= maxTokens`, default `RUNNER_WORKER_MAX_TOKENS` 150000). A real task's input (with the cached system prompt, skills and context) is never under 150,000, so the rule fires every time; the start-up time REQ-122 meant to save is paid on every task.
- Isolation: with the limit at 5,000,000 one real session served two tasks (case 8) — the rest of the mechanism works live.
- No fix proposed (the SA's).

## Observations (non-blocking)
- **O-1** — run 1's dashboard shows "เวลาตอบ 1 ms" on the service that is "ไม่ตอบ" (the time to be refused) — the team's page, not CAW.
- **O-2** — again, แบงค์ handed its API card #2 to ฝน, who reviewed it (TEST-119 O-1's pattern).
- **O-3** — a run started through the API on a project still in manual mode ends at once as `operator_stopped` "คุณสั่งหยุด" with 0 steps (run 2's first try; the screen always sets the mode first, so a user does not meet it).

## Live-run ledger
| Run | Hops (usage lines) | Out tokens | Notes |
|---|---|---|---|
| 1 (AC-6) | 14 (opus 6, sonnet 8) — 2 chat + card hops; report "13 ก้าว จากงบ 24" | ≈ 59.3 k | 18:27–18:36; 9 min 1 s; 0 operator questions; 6 reviews approved by QA as owner |
| 2 (isolation) | 2 (sonnet) | ≈ 0.7 k | 18:40; limit raised; one session |
| — | gateway 0 · no limit or usage signal · memory ≥ 9.4 GB available throughout | | |

## Test data created
| What | Where | End state |
|---|---|---|
| live: 2 Blueprint projects | `pglite:memory` (:4200) | gone: stopped |
| live: 3 CAW projects (run 1, run 2's two tries), cards, hops | `pglite:file` in QA scratch | left on disk, unserved |
| live: built dashboard `health-board-122`; `health-board-122-iso` (`notes/a.txt`, `notes/b.txt`) | `/workspace/caw-workspaces/` | left, as evidence |
| stub: 14 CAW projects (S1–S14) | `pglite:file` in `/tmp/qa119-…` | left in /tmp |
| servers 4200 / 3100 / 4500 / 3500 / 3900 / 4292 / 4541 / 3541 / 4396, runners, open workers | this machine | stopped; `ss` clear, no `--input-format` process left, 21:41 |

## Verdict
**`TEST_FAILED`** — AC-6: live, the workers did not stay open across their tasks: the restart rule's default limit (150,000 tokens) is below every real task's context, so every task started a new process (DEF-1, MAJOR; an isolation run with the limit raised shows one real session serving two tasks, so the rest of the mechanism works). The rest of AC-6 holds live (parallel hops, REQ-108 AC-4). **AC-1, AC-2, AC-3, AC-4, AC-5, AC-7 PASS** on the stub. Silver's 3 unnamed fails were not seen. **Tested trees (tree-fp.sh, same 21:16 and 21:41):** caw-back **d33e586 fp `0aa059ed44ca`** · caw-front **04e2874 fp `3ce60b3d3217`**.

## Questions
(none)

## Round 2 — REQ-122 req 7, AC-8 (live), AC-9 (stub) — DEF-1, 2026-10-30 22:00–22:23, Tanya
- Build under test (`bash ai-worker/tools/tree-fp.sh`, start 22:00 and verdict 22:23 — **the same**, and the same as the PM's line): `tree-fp caw-back HEAD d33e586 fp e1be4e88f4d1 (252 paths: 249 tracked, 3 untracked, 0 deleted)` (TASK-157…162) · `tree-fp caw-front HEAD 04e2874 fp 3ce60b3d3217` (unchanged since round 1; its builds reused). Live Blueprint: 6123018 / 6692a16.
- The change under test: the restart rule now reads the **last model call's prompt** (`StreamSummary.lastContext` = input + cache creation + cache read of the last assistant message), not the task's summed usage.
- Stub: `qa-claude.ts` gains `ctx:<n>` (the task's last call reports a prompt of n tokens), and `r122.mjs` gains **S15**. Round 1's evidence kept as `out-r1/`, `r122-r1*.out`, `caw-back-test-r1-loaded.txt`, `live/`.

| # | AC | Type | Actual | Result |
|---|---|---|---|---|
| R2-1 | **AC-9** | regression | S1–S13 again on round 2's tree — all OK (`r122.out`): 5 processes × 2 tasks at once; 3 tasks in 1 pid; SIGKILL → failed + back; screen idle → stream → idle; REQ-117/119/120/121 cases | PASS |
| R2-2 | **AC-9** (req 7) | happy | S15: ใบเตย's last calls at **60,000 tokens** (real-sized) → its **3 tasks in ONE process**, no restart on task 2 | PASS |
| R2-3 | **AC-9** (AC-3 with the new rule) | boundary | S15: แบงค์'s last calls at **200,000** → every next task in a **new** process; runner log "its context reached 200000 tokens (the last call's prompt)" ×2, none for ใบเตย; the restarted task did its own card with full context | PASS |
| R2-4 | AC-9 (AC-3) | boundary | S14, `RUNNER_WORKER_MAX_TASKS=2`: tasks 1–2 in pid A, task 3 in pid B with full context (`r122-pass2.out`) | PASS |
| R2-5 | AC-9 | suites | caw-back **976 / 1 skip / 1 fail** (the known `withReadGuard`, under load with the stub pass) (`caw-back-test-r2.txt`); caw-front unchanged (361 / 0, typecheck 0) | PASS |
| R2-6 | **AC-8** | live | one run, **default settings**, new project + folder `health-board-122r2`, REQ-108's spec typed by hand, real `claude`: 7 cards done in 10 card hops, 0 operator questions (QA approved 7 reviews as owner). **Every worker with 2+ tasks kept ONE session for all of them**: แบงค์ 3 tasks → `ccac7cfa`; ฝน 5 tasks → `60cd3d11`; มิ้นท์ 2 tasks → `9229c7d1` (traces `system/init.session_id`). **0 restarts** in the runner log. Last-call context per task 41,458–66,507 (limit 150,000) (`live-r2/out/ac8-sessions.txt`) | PASS |
| R2-7 | AC-8 (AC-6 parts) | live | parallel: up to **2 card hops at once** (e.g. #3 แบงค์ ∥ #4/#5/#6 ฝน); open workers seen 2–3 at once, ~240 MB each (`procs.log`) | PASS |
| R2-8 | AC-8 (AC-6 parts) | live | REQ-108 AC-4 on this build (`node server.js` — `package.json` start; **no README this time**): 4 services ทำงาน with เวลาตอบ + เช็คล่าสุด, "เช็คตอนนี้"; QA's caw-web stopped → "CAW เว็บ · ไม่ตอบ" **in 7.2 s** | PASS |

- **Memory:** 10,147 MB available before the run; the monitor read **2,606 MB once at 22:12:59** (below the PM's 3 GB line), 4,519 MB 30 s later; the run was not stopped on that one reading (the PM's rule is a check before each run; the dip is reported here). The biggest users at that moment were the desk's own Claude sessions (~300–500 MB each) and the two live APIs (~400 MB each); the 3 open workers ~240 MB each. 5,974 MB available after QA stopped everything.
- Instrument slips (no verdict on them): `accept-q.mjs` once found no "ตามนั้น" button on a page not yet settled — re-run, then fine; `ac4.mjs`'s page load took ~2 min to reach "networkidle" and my 120 s outer timeout cut the timing — re-run with room.
- **Live ledger, round 2:** 12 hops with usage (opus 4: chat ×2 + มิ้นท์ ×2; sonnet 8: แบงค์ ×3, ฝน ×5) — **≈ 34.9 k out**; 22:07–22:15; gateway 0; no limit signal.

### Verdict, round 2
**`TEST_PASSED` (round 2)** — AC-8 live, default settings: every worker kept one Claude session across all its tasks (3, 5 and 2 tasks), no restart at all; the team worked in parallel; the dashboard still meets REQ-108 AC-4 — **DEF-1 fixed**. AC-9: all of round 1's stub cases pass again, and the new rule restarts only when the last call's prompt is over the limit (and says so in the log). **Tested trees (tree-fp.sh, same 22:00 and 22:23):** caw-back **d33e586 fp `e1be4e88f4d1`** · caw-front **04e2874 fp `3ce60b3d3217`**.
