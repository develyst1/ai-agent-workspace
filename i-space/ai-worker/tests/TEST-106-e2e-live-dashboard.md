# TEST-106: Live end to end — the Health Board built through Blueprint → CAW → real Claude CLI workers
- Teams: A + B (both SAs on standby; QA runs it) · TASKs: none
- Source REQ: REQ-108 (ACs tested: AC-1 … AC-8)
- Status: **TEST_FAILED** (phase 2, 2026-10-30 15:29, Tanya — AC-4 FAIL: a hand-entered spec never reached the workers (P2-1); AC-1/2/3/5/6/7/8 PASS; § Phase 2) · phase 1: **TEST_FAILED — phase 1** (2026-10-29 14:55, Tanya). AC-1 fails through the interview (P1-1) and AC-4 fails (the dashboard never re-checks by itself, P1-10). AC-2, AC-3, AC-6, AC-7, AC-8 PASS; AC-5 is phase 2. **Phase 2** (REQ-103 + REQ-104 builds, hand-entered requirements, live view) not run yet.
- Build under test: clean `git archive` exports of blueprint-back f60b934 · blueprint-front e46322a · caw-back 102a130 · caw-front 4b58bf3 (see § Instrument limits) · the Health Board spec as written in REQ-108 (the PM's text, entered verbatim: `tests/harness/test-106/spec.txt`)
- Surfaces: local · desktop web 1440 (Playwright + screenshots) · API reads · process list · the workspace folder on disk
- Designed: 2026-10-29 by Tanya

## Scope

- One real project through the whole product, the way the owner would use it. This is not a
  check of one feature; it is a **search for where the flow differs from the owner's intent**
  (`DECISIONS.md` 10:51, 10:53, 11:41). Every workaround is a finding, never a quiet fix.
- Phase 1 = today's code (AC-5 `NOT_TESTED`: no live view yet). Phase 2 = after REQ-103 + REQ-104
  (+ REQ-105 if delivered), the same project again, hand-entered requirements, live view on.
- Not in: making the dashboard production-grade, git in the workspace folder, any deploy.

## Instrument limits

- **Real Claude CLI** (owner 13:01). It proves the product really builds something. It is not
  repeatable: a second run may differ, so a FAIL caused by the model's output is reported **as
  the model's**, separate from a product defect.
- **LLM gateway** (phase 1 only, if Q1 = yes): the interview and the quiz, for this project only.
  Every call is counted (blueprint-back log + a gateway call count in this file).
- **Database:** caw-back on `pglite:file:<dir>`, so it survives a restart. **blueprint-back on
  `pglite:memory`:** it accepts no other pglite form (`blueprint-back → src/db/client.ts:12-20`;
  my Q3 default wrongly assumed it did, F-010). So blueprint-back must **not** be restarted during
  the run. Not the remote TEST DB (not in `PROTOCOL.md` § Environments yet).
- **Code under test = a clean export of each repo's HEAD** (`git archive HEAD`, read-only), run
  from the session scratchpad, **not** the repos' working trees. At 13:07 both teams had
  uncommitted REQ-103/104 work in all four repos (25 / 43 / 18 / 13 changed paths). Phase 1 is
  "today's code" by definition, and running the working trees would test half-built changes and
  collide with the engineers. The exports have no `.env` (it is untracked), which removes that
  risk too.

## Setup — every env value explicit (`.env` is loaded by Bun; `tests/REGRESSION.md` guards)

| Process | Port | Explicit env (never printed: any `DATABASE_URL` that is not pglite) |
|---|---|---|
| blueprint-back | 4200 | `DATABASE_URL=pglite:file:<dir>/bp` · `GATEWAY_URL` = real (phase 1, only after Q1 = yes) · `CAW_NOTIFY_URL=http://127.0.0.1:4500/v1/notify` · `PORT=4200` |
| blueprint-front | 3100 | `BLUEPRINT_API_URL=http://127.0.0.1:4200` · `CAW_URL=http://127.0.0.1:3500` |
| caw-back API | 4500 | `DATABASE_URL=pglite:file:<dir>/caw` · `BLUEPRINT_URL=http://127.0.0.1:4200` · `BLUEPRINT_WEB_URL=http://127.0.0.1:3100` · `CAW_POLL_MS=30000` · `PORT=4500` |
| caw-back runner | — | `CAW_API_URL=http://127.0.0.1:4500` · `CLAUDE_BIN` = the real binary, **set explicitly and logged** · `CAW_WORKSPACE_ROOT` = per Q1 below · `RUNNER_TRACE_DIR=<dir>/traces` |
| caw-front | 3500 | `CAW_API=http` · `CAW_API_URL=http://127.0.0.1:4500` · `BLUEPRINT_URL=http://127.0.0.1:3100` · `NEXT_DIST_DIR` unset or `.next-f` (F-003) |
| Health Board (built) | 3900 | as the workers' README says |

The four product ports are the spec's own (it monitors :4200 / :3100 / :4500 / :3500), so this
round **must** use the standard ports. Before starting, `ss` must show them free. If another
role holds one, I stop and ask; I never stop someone else's server.

## Live-run ledger (REQ-108 AC-6) — one row per real hop or gateway call batch

| # | When (start–end) | What (hop id / gateway calls) | Worker · model · effort | Tokens in/out | Outcome | Limit / usage signal |
|---|---|---|---|---|---|---|
| G-1 | 13:08–13:24 | `GET /models` — 1 by QA's curl, plus 1 per chat-page load (the chat screen asks `GET /v1/models`, `blueprint-back → src/http/routes/models.ts:24`): about 8 loads, so **≈ 9 calls, counted from my script steps, not metered** | — | — | list returned | none seen |
| G-2 | 13:11–13:12 | round 1 (the spec): **2 × `POST /chat`**, the round and its one correction (`round.ts:417-438`, ended `reason=validation`) | Blueprint bot · `tier:medium` → `deepseek/deepseek-flash` | not shown | `changes_rejected` | none |
| G-3 | 13:15–13:16 | round 2 ("ช่วยบันทึก…อีกครั้ง"): **2 × `POST /chat`** (same path, `validation`) | `deepseek/deepseek-flash` | not shown | `changes_rejected` | none |
| G-4 | 13:18–13:24 | round 3, after switching the picker to "เก่งที่สุด": **≥ 2 `POST /chat`, ended by timeout after 382 s**. The client times out at 90 s and retries a transport failure once (`gateway/client.ts:75`, R8), so up to 4 attempts. Not metered | `tier:flagship` | not shown | `bot_could_not_answer` (`reason=timeout`) | none, but see finding P1-3 |
| G-5 | 13:27–13:29 | quiz: **5 × `POST /chat`** (5 questions, ready screen), all answered right in 3–5 s | `tier:flagship` (the project's model since round 3) | not shown | 5/5 answered | none |
| C-1 | runner 13:32:06–13:43:12 | **Real Claude CLI** — runner from the export with `CLAUDE_BIN=/home/box/.local/bin/claude` (→ versions/2.1.312), `CAW_WORKSPACE_ROOT=/workspace/caw-workspaces`. **One chat hop** `01a1865c-3eaa-…` (13:32:34–13:32:35), from my CAW chat message | ฟ้า (FE) · haiku · low | **0 / 0** | `failed`: `claude exit 1` — *"sandbox required but unavailable: … socat not installed … sandbox.failIfUnavailable is set — refusing to start"* (P1-6). No model turn ran, so no quota was spent | none |
| C-2 | runner 14:46:15–14:52:5x (TASK-112 build, snapshot fp `1b685c23fb11`, real `claude` 2.1.312) · hop `01a186a0-03e7-…` 14:46:16–14:46:51 | chat hop: my CAW chat request → a 2-card proposal | ฟ้า · `claude-haiku-5-5` · low | 70,579 / 2,464 (cache read 53,501) | `proposed` | none |
| C-3 | run 1 (อัตโนมัติ, budget 12) 14:48:41–14:48:54 · hop `01a186a1-efb1-…` | card #1 "สร้างหน้า Health Board" | ฟ้า · haiku · low | 113,855 / 22 | `stopped`: "ฟ้า พยายาม Bash: bun --version ซึ่งไม่อนุญาต · อ่านนอกโฟลเดอร์ถูกปฏิเสธ 2 ครั้ง". Run ended `nothing_workable` | none |
| C-4 | run 2 (the one "อัตโนมัติ" retry) 14:50:26–14:50:56 · hop `01a186a3-9579-…` | card #1 again: wrote `server.ts`, `public/index.html`, `README.md`, then `bun build …` → stopped | ฟ้า · haiku · low | 196,504 / 48 | `stopped`: "ฟ้า พยายาม Bash: bun build … ซึ่งไม่อนุญาต". Run ended | none |
| — | total real-CLI: 4 hops (1 refused at start by the sandbox, 0 tokens; 3 ran), ≈ 381 k tokens in (mostly cache) / 2,534 out; no limit or usage signal at any point; ดิน (QA) never got a hop | | | | | |

## Cases

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 1 | AC-1 phase 1: spec in through the interview | happy | new project "I-Space Health Board"; paste the REQ-108 spec as the first message; accept the proposals; answer the bot's questions only from the spec text (anything else → "ไม่ได้ระบุ") | spec pages show all 6 points and the "ไม่ทำ" list | | |
| 2 | AC-1 phase 1: a version | happy | quiz ≥ 5 questions (gateway), mark; "ยืนยัน 100%" | version 1 confirmed. Every gate step that blocked me is a **finding** against owner item 2 ("labels never blocked") | | |
| 3 | AC-2: button → CAW board | happy | "ส่งไปสร้างที่ CAW" (click) | CAW board for that project | | |
| 4 | AC-2: cards come from the spec | happy | how do cards get made? (the entry worker's proposals in chat, accepted by me) | cards traceable to spec parts (anchor key); none invented by me by hand — if the product forces a hand-made card, that is a finding | | |
| 5 | AC-3: team of ≥ 2 workers + workspace folder | happy | team screen: ≥ 2 workers (one FE-ish, one QA-ish), chain, entry worker; folder `/workspace/caw-workspaces/health-board` as the project's root | team saved; readiness shows ready | | |
| 6 | AC-3: real hops | happy | start a run (อัตโนมัติ, hop budget per Q4) | `ps` shows the **real** `claude` (path = `CLAUDE_BIN`), hops in the runs list, files appear in the folder. Ledger rows written as it goes | | |
| 7 | AC-3: the guards hold under real workers | negative | after the run: `git status` in the four repos; anything written outside the workspace folder (`find / -newer <marker>` limited to /workspace and $HOME) | nothing outside the folder (besides traces/DB dirs I declared). A write outside = a **BLOCKER** finding | | |
| 8 | AC-4: the built dashboard works | happy | start it per its README; open :3900 | 4 services, names, "ทำงาน" green, ms, last-check time; Thai text; "เช็คตอนนี้" works | | |
| 9 | AC-4: a service goes down | state | stop **my own** caw-front (pid); watch :3900 | that row turns "ไม่ตอบ" (red) within 13 s; back to "ทำงาน" after restart | | |
| 10 | AC-4: spec "ไม่ทำ" respected | negative | look for login, notifications, history, a DB | none built | | |
| 11 | AC-5 (phase 2): live CLI screen | happy | open a running worker's "ดูหน้าจอ" | output streams live (REQ-104) | phase 1: `NOT_TESTED — no live view in today's code` | |
| 12 | AC-6: ledger complete | happy | compare ledger rows with CAW's hop list and the blueprint-back gateway count | one row per hop / batch; every limit signal reported to the PM at once | | |
| 13 | AC-7: findings list | happy | § Findings below | every workaround, break or intent-mismatch, with evidence | | |
| 14 | AC-8: repos as found | regression | `git status --porcelain` × 4 | 0 tracked changes; workspace folder + DBs + traces declared and left | | |

## Findings (AC-7) — known before the run

- **F-0 (setup, from reading the code, 2026-10-29 13:08):** `caw-back/.env` sets
  `CAW_WORKSPACE_ROOT=/workspace/caw-workspaces` (`SYSTEM-FACTS.md` § Environment). The runner reads
  **its guard hooks and skills from that root**: `<root>/scripts/hooks/{block-shell-edits,
  block-irreversible,block-kill-by-name}.sh` and `<root>/.claude/skills/` (`caw-back →
  src/runner/config.ts:30-37`, `src/runner/prompt.ts:1-3`). It refuses without them ("guard hook
  missing"). `/workspace/caw-workspaces` is empty (`ls -la`, 13:08), so the runner as configured
  **cannot start**. The hooks exist in the agent workspace's `scripts/hooks/` (executable). The
  folder where workers *build* is a different thing: the project's workspace roots, set on CAW's
  team screen. → Q1.
- **F-0b:** there is no `.claude/skills/` in the agent workspace either. A worker given any skill
  fails its hop ("missing"). → Q2.

### Phase 1 findings (2026-10-29 13:08–13:24, the run)

- **P1-1 — the interview cannot store this spec. [BLOCKER for the flow]** I created the project
  through the dialog (`5cd54f17-…`), pasted the REQ-108 spec as the first message, and pressed Enter.
  Three rounds were run, each sent as a user would. All three stored nothing; the project still
  has **0 parts** (`GET /v1/projects` `"partCount":0`):
  1. round 1 (the spec): `changes_rejected`, log `[round] changes_rejected reason=validation`;
  2. round 2 (a plain "save it again" message): `changes_rejected`, `validation`;
  3. round 3 (the picker set to "เก่งที่สุด" / `tier:flagship`): `bot_could_not_answer`, `reason=timeout`, after 382 s.
  The validation error itself is never shown to the user. It reaches only the model's correction
  prompt (`round.ts:432-434`) and a one-word log reason.
  Evidence: `tests/harness/test-106/messages-after-round1.json`, `messages-2-round2.json`,
  `messages-4-round3-flagship.json`, `1-chat-after-round1.png`, `2-round2.png`, `4-round3-flagship.png`.
- **P1-2 — the bot says it saved when nothing was saved. [MAJOR, trust]** Round 1 reply:
  *"ขออภัยครับ — ระบบไม่รับการเพิ่มส่วนประเภท feature … ผมจึงรวมรายละเอียด…ไว้ในเนื้อหาของหน้าเว็บแทน แล้วแนบคำถามที่ยังค้าง 4 ข้อไว้ด้านล่างครับ"*.
  Round 2 reply: *"แก้ไขให้ถูกต้องแล้วครับ: …"*. Both rounds ended `changes_rejected` with
  `changeSetId: null`. A user reading the chat believes the spec is in. Round 1 also shows the
  model proposing a part kind `feature`, which the registry does not have (`spec/registry.ts`
  kinds = work step interaction role screen api system data decision question contradiction).
- **P1-3 — the strongest tier timed out.** "เก่งที่สุด" never answered within the client's 90 s
  timeout. It is a model-side behaviour as far as I can see, and its effect on the user is a wait
  of more than 6 minutes followed by "could not answer".
- **P1-4 — the send button did not send; Enter did.** With the spec filled in, a click on "ส่ง" in
  my first attempt sent nothing (0 messages stored). Pressing Enter in the same box sent it
  (`step1c-send.mjs` logged `send enabled true` before Enter). **Not isolated**: the click may have
  landed before React saw the text. It is recorded only as "seen once, not reproduced", not as a defect.
- **QA-side slip (not the product):** I first started blueprint-back on `pglite:file`, which it does
  not support → 500s; restarted on `pglite:memory` before any data (F-010).
- **P1-5 — the confirm gate forced a part the spec does not state.** After entering the spec as
  written, Blueprint reported one stuck item, `screen_without_api` on SCR-001
  (`blueprint-back → src/spec/stuck.ts:56-58`: every screen must interact with an `api` part).
  The spec monitors other services and names no API of its own. I added `API-001 GET /health`,
  taken from the spec's own `/health` URLs, to get past the gate. Owner item 2 says labels are
  never blocked; today the gate also shapes the content.
- **P1-6 — CAW's real workers cannot start on this machine. [BLOCKER for AC-3]** The runner gives
  every hop `sandbox: { enabled: true, failIfUnavailable: true, allowUnsandboxedCommands: false }`
  (`caw-back → src/runner/settings.ts:43-46`, deliberate: no silent unsandboxed fallback). The
  CLI's sandbox needs `bubblewrap` **and** `socat`: `/usr/bin/bwrap` exists, `socat` does not
  (`command -v socat` → nothing). So `claude` exits 1 before any model turn (ledger C-1, runner log
  `[runner 5b4dee82] hop 01a1865c…: claude exit 1 … socat not installed`). The hop is marked
  `failed`, the note says "ก้าวนี้ไม่ได้ทิ้งผลงานไว้ · exit 1". The same will hold on the deploy server
  unless it has both tools. This feeds REQ-109 (deploy-ready). **Not mine to fix:** installing a
  package changes the machine (QA charter: never reconfigure a server) → Q7.
- **Setup done before the block** (all logged; none in a desk repo): skill
  `/workspace/caw-workspaces/.claude/skills/i-space-builder/SKILL.md` (Q6) · CAW workers ฟ้า (FE)
  and ดิน (QA), haiku/low, chain FE⇄QA, entry FE, folder `/workspace/caw-workspaces/health-board`
  (still empty) · set up through CAW's API, the calls the team screen makes (`step5-team.mjs`).
- **Seen while checking:** another runner (Team B's, cwd `caw-back`, `--no-env-file`, its own API
  :4530, a ticker stub as `CLAUDE_BIN`) was running at the same time. It never polled my API, so
  there was no cross-talk. Left untouched.

### Phase 1 results by AC (2026-10-29 13:08–14:53)

| AC | Result | Evidence |
|---|---|---|
| AC-1 | **FAIL through the interview** (3 rounds stored nothing, P1-1/P1-2) · via the change-set API workaround the spec is in: all 6 points + "ไม่ทำ" on the overview, 0 stuck after P1-5's forced api part | `5-overview.png`, ledger G-2…G-4 |
| AC-2 | **PASS**: quiz 5/5 (real gateway) → "ยืนยัน 100%" v1 → "ส่งไปสร้างที่ CAW" → CAW board; ฟ้า (real CLI) proposed 2 cards anchored to SCR-001 / STEP-001, accepted with "ตกลง เริ่มงาน" → 2 cards on the board | `9-caw-board.png`, `proposals-run2.json`, `14-caw-board-cards.png` |
| AC-3 | **PASS**: real `claude` hops ran (no stub; `init` model `claude-haiku-5-5`), and files appeared in `/workspace/caw-workspaces/health-board` (3 files, nothing written outside it: `find -newer` marker). It took two runs, both ended by a stop (P1-7, P1-8) | ledger C-2…C-4, runner log, traces |
| AC-4 | **FAIL**: :3900 shows the 4 services, "ทำงาน" green (`rgb(26,127,55)`), ms, time, Thai, no login / alerts / history; "เช็คตอนนี้" works (stopped CAW web → "ไม่ตอบ" red). But **no automatic re-check**: the times did not move in 15 s, and a stopped service still read "ทำงาน" after 13 s with no click (P1-10) | `17-…`, `18-healthboard-13s-after-stop.png`, `19-…` |
| AC-5 | phase 2 (REQ-104's view exists now; not part of phase 1) | — |
| AC-6 | **PASS**: every live run and gateway batch has a ledger row; no limit signal seen | § Live-run ledger |
| AC-7 | **PASS**: findings P1-1…P1-10, each with evidence | § Phase 1 findings |
| AC-8 | **PASS**: QA ran only from exports / snapshots; the four repos show only the teams' own changes (46 / 51 / 24 / 18 paths, same as before) | `git status` 14:53 |

### More phase 1 findings (14:46–14:53, with the real workers)

- **P1-7 — the Bash fence refuses ordinary commands and names the wrong reason.** `pwd && ls -la` is refused
  because the fence fails closed on any `&` (SPEC-103 § No Bash sandbox). The hop note reports it as
  "อ่านนอกโฟลเดอร์ถูกปฏิเสธ" (read outside the folder refused). A worker reading that note cannot tell what to change.
- **P1-8 — one disallowed command stops the hop, and the run then ends with the card stuck in "กำลังทำ".**
  `bun --version` (C-3) and `bun build …` (C-4) are not on the allow-list (`git status/log/diff/show`, `ls cat head
  tail grep wc`, `bun test *`, `bun run typecheck`). Each stopped the hop at once, and the run ended
  `nothing_workable`: card #1 stays "doing", card #2 waits on it, and ดิน (QA) never runs. A builder cannot run
  or check what it built. **This is the reason the team did not finish**, more than the model.
- **P1-9 — a card gets only the rules that cover its own anchor part.** Card #1 (anchor SCR-001) received one
  decision ("ข้อความบนหน้าเป็นภาษาไทย"). The 10 s and 3 s rules cover STEP-002, so they never reached the builder
  (`card_context` in trace C-4: no "10 วินาที" anywhere). **QA's part in it:** my workaround linked those decisions
  to STEP-002 (step2-changeset.mjs). An interview could do the same, and the entry worker's 2-card split skipped
  STEP-002 anyway. Seam: `partContext` serves the decisions that cover the part (`blueprint-back → src/seam/context.ts`).
- **P1-10 — the built dashboard never re-checks by itself** (spec point 3). It checks only on load and on
  "เช็คตอนนี้" (`public/index.html` has no timer; confirmed by the run). Direct cause: P1-9.
- **P1-11 — the entry worker's reply has a muddled line** ("9 งาน ใช้ประมาณ 5 ก้าว — ไม่ใช่ 9 งาน: มี 2 งาน …"), a
  self-correction left in the text the user reads. Model output; minor.

## Defects

None filed as TEST defects: REQ-108's findings go to the PM as REQ content (REQ-108 AC-7). The ones that decide
whether the owner's flow works today are **P1-1/P1-2** (interview, already REQ-110), **P1-8** (Bash allow-list stops the
team), **P1-9** (rules don't reach the card) and **P1-6/F-0** (setup for a server).

## Test data created

| What | Where | End state |
|---|---|---|
| `/workspace/caw-workspaces/scripts/hooks/` (3 hooks, copied) · `/workspace/caw-workspaces/.claude/skills/i-space-builder/SKILL.md` | the CAW root | **left** (setup for later runs; PM Q1/Q6) |
| `/workspace/caw-workspaces/health-board/` — `README.md`, `server.ts`, `public/index.html` written by ฟ้า | the build folder | **left** (the owner makes it a repo later, REQ-108 l.27) |
| Blueprint project "I-Space Health Board" (+ v1, quiz) | `pglite:memory` | gone (process stopped 14:53) |
| CAW project `458a8293-…`, workers ฟ้า / ดิน, 2 cards, 4 hops, 2 runs | `pglite:file` in scratchpad `t106/db/caw` | left in scratchpad |
| traces of the 4 real hops | scratchpad `t106/traces/` | left (real output of the worker; no secret seen) |
| exports / snapshots + `node_modules` | scratchpad `t104/`, `t105/`, `t106/` | left in scratchpad |
| servers 4200 / 3100 / 4500 / 3500 / 3900, the runner | this machine | all stopped by pid at 14:53; `ss` 0; no `claude` process |

## Verdict

**Phase 1: `TEST_FAILED`.** The flow does reach every stage on today's code plus TASK-112: Blueprint → CAW → real
Claude CLI workers → files in the folder. But it does **not** produce what the owner asked:
- the interview cannot store a spec (P1-1, REQ-110 in progress);
- the team is stopped by the Bash allow-list before it can finish or hand off (P1-8);
- the builder never sees rules attached elsewhere in the spec (P1-9);
- so the dashboard misses spec point 3 (P1-10).

**Phase 2** (REQ-103 hand entry + REQ-104 live view, same project) is still to run. It needs a decision on P1-8 first,
or it will stop the same way.

## Questions

For the PM. Q1 and Q2 change the setup, not the ACs. Each has my default; correct only a wrong line.

- **Q1 — which root the runner gets.** **Default:** QA starts the runner with `CAW_WORKSPACE_ROOT` =
  the agent workspace root (where the three hooks are), passed on the command line. **The `.env`
  is not edited** (the owner's file). The build folder `/workspace/caw-workspaces/health-board` is
  set as the CAW project's workspace root on the team screen. F-0 goes to the owner/SA B as a
  finding about the `.env` value.
- **Q2 — worker skills.** **Default:** workers are created with **no skills**, because none exist
  under the root. The result says so, since a skill-less worker is not the full product.
- **Q3 — database.** **Default:** `pglite:file` under `tests/harness/test-106/`, not the remote TEST
  DB, until `PROTOCOL.md` lists it.
- **Q4 — quota guard.** **Default:** workers on the cheapest model the picker offers, low effort;
  the run's hop budget 12; QA stops the run at any limit signal or when the PM reports the
  owner's quota > ~60%. If 12 hops do not finish the dashboard, that is a finding with the hop
  list, not a reason to keep spending.
  > answer (PM, 2026-10-29 `[PM-decided]`): **Q1 changed:** do **not** point the runner at the agent workspace (it holds every desk's files; real workers must not run with that as their root). Instead **copy** the three hooks from the agent workspace's `scripts/hooks/` into the configured root `/workspace/caw-workspaces/scripts/hooks/` (keep them executable), leave `.env` untouched, build in `/workspace/caw-workspaces/health-board`. Log the copy as test setup. F-0 stands as a finding (feeds REQ-109 deploy-ready: CAW must ship or document its hooks). **Q2, Q3, Q4:** your defaults accepted. **Phase 1 is unblocked:** owner allowed the gateway for REQ-108 (13:05, `DECISIONS.md`).
- **Q5 (QA → PM, 2026-10-29 13:24) — BLOCKS phase 1 beyond AC-1.** The AI interview stored
  nothing in 3 rounds (P1-1). The spec can still reach Blueprint without a model, through the
  change-set API (`POST /v1/projects/{id}/change-sets`, the same route blueprint-front's own tests
  seed with). No screen offers that (`maps/blueprint-gap-102.md` a2). It would let phase 1 go on
  to AC-2…AC-4: the button, CAW's cards and the **real** Claude CLI workers.
  **Default:** continue that way, with AC-1 recorded as **FAIL through the interview** and the API
  entry labelled a workaround in every result line. Gateway use stops here (no more rounds); quiz
  and confirm go through the gateway only if CAW needs a confirmed version (today it does, so
  5 quiz calls). The alternative is to stop phase 1 here and run the whole flow in phase 2 (REQ-103
  hand entry), which needs no workaround.
  Holding meanwhile: the four services stay up on the standard ports for a quick continuation.
  blueprint-back is `pglite:memory`, so if they must be freed, the project is simply re-made.
  > answer (PM, 2026-10-29 `[PM-decided]`): **default accepted — continue via the change-set API**, AC-1 = FAIL through the interview, every result line labels the workaround. The 5 quiz calls for a confirmed version are inside the owner's REQ-108 gateway permission (13:05). P1-1/P1-2/P1-3 are routed to Team A as REQ-110.
- **Q6 (QA → PM, 2026-10-29 13:33) — BLOCKS AC-2 (cards) and AC-3.** Q2's accepted default ("workers with no skills") **cannot be done**. A worker needs **at least one skill** (`caw-back → src/http/routes/workers.ts:15` `Skills = z.array(…).min(1)`, used by `POST /v1/workers` `:30`). The runner reads each skill from `<CAW_WORKSPACE_ROOT>/.claude/skills/<name>/SKILL.md`, and a missing one fails the hop (`src/runner/prompt.ts:1-3,30-35`). `/workspace/caw-workspaces` has none (F-0b).
  **Default:** QA writes **one** neutral skill, `/workspace/caw-workspaces/.claude/skills/i-space-builder/SKILL.md`, saying only: build what your card asks inside your working folder · UI text in Thai · no git, no network beyond 127.0.0.1 · end each step with one CAW tool. Both workers (FE-ish, QA-ish) get it. It is logged as setup like the hooks copy, and left in place (test folder). The desk's own role skills are **not** copied: they carry this desk's chain and files, which CAW workers must not follow.
  Holding meanwhile, with services up: AC-1 done via the workaround; **AC-2 first half PASS** (quiz 5/5 by the real gateway, v1 confirmed, the button → CAW board `458a8293-…`).
  > answer (PM, 2026-10-29 `[PM-decided]`): **default accepted** — write the one neutral skill `i-space-builder` as you describe, log it as setup, leave it in the test folder; do not copy the desk's role skills. F-0b becomes REQ-109 input (CAW must ship or document a starter skill). Go on.
- **Q7 (QA → PM → owner, 2026-10-29 13:45) — BLOCKS AC-3/AC-4.** CAW's real workers need `socat`
  on this machine (P1-6); `bubblewrap` is already there. Installing it is a machine change, the
  owner's or Otto's (`OTTO.md`), never QA's. **Default:** the owner has `socat` installed, I re-run
  the one chat hop to prove the sandbox now starts, then continue AC-2 (cards) → AC-3 → AC-4 with
  the same team and budget 12. **Not an option I will take:** turning CAW's sandbox off or editing its
  settings to get past this; that removes a guard the code chose on purpose.
  Holding: my four services stay up (the CAW hop will need Blueprint's in-memory spec); my runner
  is **stopped** (13:43:12). Say if the standard ports must be freed sooner.
  > **Superseded 2026-10-29 13:46 by the owner's decision of 13:41** (`DECISIONS.md`): no Bash sandbox and no `socat`; workers run `claude` directly, each confined to its own folder under `CAW_WORKSPACE_ROOT`, **SA B sets how**. Q7 is closed; Q8 replaces it.
- **Q8 (QA → PM, 2026-10-29 13:46) — AC-3 still BLOCKED, now on SA B's change.** The code under test (today's `caw-back` HEAD
  102a130) **hard-codes** `sandbox.failIfUnavailable: true` (`src/runner/settings.ts:46`), so its runner will refuse exactly as in
  C-1 until SA B's "how" exists in code. QA does not edit product code, and does not flip that setting.
  **Default:** when SA B says the confinement change is done and reviewed, I run phase 1's runner from **that** change. If it is
  committed, I export that commit (`git archive <sha>`). If it is still uncommitted, I take only what SA B names (the runner files),
  because the working tree also holds unfinished REQ-104 work. I record which build, re-run the one chat hop, then go on to
  AC-2 (cards) → AC-3 → AC-4. Until then my runner stays stopped and the four services stay up.

## Phase 2 (2026-10-30 15:2x–, PM's go; owner order 105 → 112 → 108) — evidence `tests/harness/test-106/phase2/`
- Trees (clean HEAD exports — everything REQ-108 depends on is committed): blueprint-back **ccd32af** · blueprint-front **09f2717** · caw-back **4cc3241** · caw-front **b4f2659**. (blueprint-back's working tree holds REQ-116's 2 uncommitted paths — not in this run.) Standard ports 4200 / 3100 / 4500 / 3500, :3900 for the dashboard. Blueprint's gateway = the refusing stub (the spec is entered by hand, no gateway needed). Runner: real `claude` 2.1.314, `CAW_WORKSPACE_ROOT=/workspace/caw-workspaces`, folder **`health-board-108p2`** (new). Every step in `phase2/out/live.log`.
- **AC-1: PASS** — the spec entered **by hand** on Blueprint's requirements page (REQ-103): 8 requirements, the spec's 6 points + its title line + "ไม่ทำ", each verbatim (`hand.mjs`, `ac1-requirements.png`); label **v1** by "โด่ง" through the ready page's "ใส่ป้าย version" (`label.mjs`).
- **AC-2 (so far):** Blueprint's "ส่งไปสร้างที่ CAW" → a CAW board (header "ป้าย v1"); "ใช้ทีมเริ่มต้น" → the 5-seat team **with CAW's shipped role skills — the first hop started (REQ-117 confirmed live)**; chat → ปลา proposed 4 cards and asked one question ("สำรวจโค้ดก่อนไหม", its own default "ไม่ต้อง เริ่มงานตามที่เสนอเลย"); "ตกลง เริ่มงาน" stays disabled until it is answered ("ตอบคำถามของ ปลา ก่อน") → "ตามนั้น" → accepted (`ac2-*.png`).
- **P2-1 (finding):** all 4 cards are anchored on **REQ-001** (the title line). No card's context holds the 4 service URLs, the 10 s rule, the 3 s rule or :3900 (`card-*-context.json`): hand-entered requirements are parts with no links, so `relatedDecisions` has nothing to follow, and coverage says `uncovered []` because the spec has no decisions at all. The workers will build from REQ-001's one line unless they find the rest themselves.
- **AC-5: PASS** — while ใบเตย's hop ran, "ดูหน้าจอ" opened "หน้าจอของ ใบเตย · สด": the session, `card_context`, a `Bash` listing and a `Skill` call appeared live, growing without a reload (`ac5-screen-1/2.png`, `ac5-text.txt`).
- **O-1 (QA-side):** that `Skill` call loaded **`i-space-builder`** — the neutral skill QA left in `/workspace/caw-workspaces/.claude/skills/` in phase 1 (PM Q6). Left test data in the shared CAW root reaches every later run there; not CAW's.
- **P2-1, live consequence:** run 1's only hop (SA ใบเตย, opus, 08:24:08–08:24:45Z, out 3,270) designed from REQ-001's single line, and every specific contradicts the spec it could not see: port **3000** (spec :3900), timeout **2 s** (3 s), refresh **30 s** (10 s), example services **"auth", "files"** (the 4 URLs), labels **"เปิดอยู่/ปิดอยู่"** ("ทำงาน/ไม่ตอบ"), button **"ตรวจอีกครั้ง"** ("เช็คตอนนี้") (`card1-sa-comment.txt`).
- **P2-2 (finding):** that hop only **commented** (no hand-off, no status), so card #1 went back to `todo` with `workable: true` — and the run ended **`nothing_workable`**, its report "เสร็จแล้ว — ไม่มี · รอคุณ — ไม่มี · เหตุที่จบรอบ: ไม่มีงานที่ทำต่อได้" while a workable card sat on the board. 1 hop of 12; no file written. Operator: อัตโนมัติ again (run 2, 08:25:34Z).
- **Run 2 (08:25:34Z):** the SA's hop called `hand_off`, then asked the operator (card #5): *"…ระบบบอกแค่รหัสผู้รับ 2 คน ไม่บอกว่าใครเป็น BE ใครเป็น FE: 01a18be6-3828-… / 01a18be6-3833-… ควรส่งให้ใคร?"* → **P2-3**. Operator: answered with the id → name mapping only (…3833 = แบงค์ BE, …3828 = ฝน FE).
- **Run 3 (08:26:30Z):** SA → BE hand-off; **แบงค์ (BE) built `server/`, `services.json`, `package.json`, README in `health-board-108p2`, its own tests 7/7** — but `services.json` = **"Health Board" :3000 and "ระบบล็อกอิน" :3001** (not the spec's 4), the server's default port **3000** (spec :3900). Then BE asked (card #6) who `01a18be6-383f-…` is — its only hand-off target (the QA) shown as an id (P2-3 again). Run ended `nothing_workable`.
- **QA stopped the team here** (runner stopped 08:28Z): AC-4's outcome was set by P2-1 — further FE / QA hops would spend opus/sonnet quota without changing it. Run what was built (not read): `bun run server/index.ts` → **:3900 refuses**; `GET :3000/api/services` → the 2 made-up services, both "down" (`built-server.log`). No `public/` (the FE never ran), so no page.

### Phase 2 results by AC (2026-10-30 15:20–15:29)

| AC | Result | Evidence |
|---|---|---|
| AC-1 | **PASS** — by hand (REQ-103): the 6 points + "ไม่ทำ" on the requirements page; label v1 | `ac1-requirements.png`, `label.mjs` output |
| AC-2 | **PASS** — Blueprint's button → CAW board; the starting team (REQ-117 shipped skills, first hop started); ปลา proposed 4 cards from the spec; accepted after its question | `ac2-*.png`, `live.log` |
| AC-3 | **PASS** — real `claude` hops (opus/sonnet), files in `health-board-108p2` (server/, services.json, package.json, README), nothing outside it | ledger, `ls` |
| AC-4 | **FAIL** — nothing on :3900; the built server checks 2 made-up services on :3000/:3001 (P2-1) | `built-server.log` |
| AC-5 | **PASS** — "หน้าจอของ ใบเตย · สด": the hop's calls streamed live without a reload | `ac5-screen-*.png` |
| AC-6 | **PASS** — ledger below; no limit or usage signal; gateway 0 | `ledger.txt` |
| AC-7 | **PASS** — findings P2-1…P2-3, O-1 with evidence | above |
| AC-8 | **PASS** — QA ran from clean HEAD exports; the four repos clean at the end (blueprint-back's HEAD moved to f10f8cb meanwhile — REQ-116's commit, not QA's) | `git status` |

### Live-run ledger, phase 2 (`phase2/out/ledger.txt`)
| # | Hop | Model | Out tokens | Cache read | Outcome |
|---|---|---|---|---|---|
| C2-1 | chat 01a18be6-6e02 | opus | 2,644 | 52 k | proposed + question |
| C2-2 | chat 01a18be7-e113 ("ตามนั้น") | opus | 2,373 | 63 k | proposed again |
| C2-3 | #1 SA 01a18be8-be51 | opus | 3,270 | 215 k | commented (design from REQ-001) |
| C2-4 | #1 SA 01a18bea-1381 | opus | 1,633 | 227 k | asked (P2-3) |
| C2-5 | #1 SA 01a18bea-f19c | opus | 1,529 | 149 k | handed off → BE |
| C2-6 | #1 BE 01a18beb-38fc | sonnet | 9,884 | 495 k | built BE, asked (P2-3) |
| — | **6 hops, ≈ 21.3 k out, ≈ 1.2 M cache-read; gateway 0; no limit signal** | | | | |

### Phase 2 findings (AC-7)
- **P2-1 (MAJOR) — a hand-entered spec does not reach the workers.** Requirements typed on Blueprint's page are unlinked parts; the entry worker anchored all cards on REQ-001; a card's context carries only its anchor, `relatedDecisions` has nothing to follow, coverage says `[]`. The SA and BE built a different product (port, timeouts, services, words). This is what made AC-4 fail.
- **P2-2 — a run ends "nothing workable" while a workable card is on the board** (after a hop that only commented); the report says nothing is waiting.
- **P2-3 — `hand_off` shows the allowed recipients as bare ids** — twice a worker stopped to ask the operator who an id is (SA: BE or FE; BE: who is …383f = the QA). In TEST-112 the hand-offs went through; here every hand-off needed the operator.
- **O-1 (QA-side)** — the phase-1 skill `i-space-builder` left in `/workspace/caw-workspaces/.claude/skills/` was loaded by this run's SA; QA test data in the shared root.
- Also seen: after "ตามนั้น" on ปลา's question the chat held **two open proposals** (the first and a re-issued one); QA accepted the newer.

### Verdict, phase 2
**`TEST_FAILED`** — AC-4: the dashboard the team built does not monitor the spec's services and does not run on :3900, because a hand-entered spec never reached the workers (P2-1, MAJOR). **AC-1, AC-2, AC-3, AC-5, AC-6, AC-7, AC-8 PASS** — the pipeline itself (hand entry → label → button → team → real hops → files, live screen) works end to end. P2-2, P2-3 for the PM.
- **O-1 cleaned (2026-10-30 15:31, PM's request, DECISIONS 15:3x):** `/workspace/caw-workspaces/.claude/skills/i-space-builder/` removed (copy kept: `phase2/out/i-space-builder-SKILL.md.removed`, 565 bytes). The now-empty `/workspace/caw-workspaces/.claude/skills/` is left. Phase-1 test-data row "… `.claude/skills/i-space-builder/SKILL.md` — left" is superseded by this line. Left in the CAW root on purpose: `scripts/hooks/` (the runner needs them) and the build folders `health-board`, `health-board-112`, `health-board-112r2`, `health-board-108p2` (evidence).
