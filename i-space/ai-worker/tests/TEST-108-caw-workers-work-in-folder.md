# TEST-108: CAW workers can work in their folder — commands, refusals that don't end a hop, no card stuck "doing"
- Team: B (CAW, SA Silver) · TASKs: TASK-118 (policy + hook + hop), TASK-119 (card after a hop), TASK-120 (front mark)
- Source REQ: REQ-111 (ACs tested: AC-1, AC-2, AC-3, AC-5 · AC-4 is REQ-108 phase 2, as the REQ says)
- Status: **TEST_PASSED** (2026-10-29 16:53, Tanya) — AC-1, AC-2, AC-3, AC-5 PASS; AC-4 = REQ-108 phase 2. Q1 **accepted as known by the owner** (`DECISIONS.md` 2026-10-29 17:0x, his own words); AC-6 withdrawn → REQ-113. Round 2 is not run.
- Build under test: committed HEAD + Team B's working-tree changes. `caw-back` f8a619e + fp `18ca4d833a46` (19 paths incl. untracked `bash-policy.ts`, `bash-policy.test.ts`, `card-stopped-midway.test.ts`) · `caw-front` 1e16d37 + fp `686c119cd01c` (10 paths). Built as a clean HEAD export + `git diff HEAD` + the untracked files; fingerprints unchanged at 16:40.
- Surfaces: the real hook script (as Claude Code runs it) · the real caw-back API + runner with QA stub CLIs · one live hop with the real `claude` · caw-front suites
- Designed and tested: 2026-10-29 16:33–16:45 by Tanya (created with `new-id.mjs`)

## Scope and instruments

- **Layer 1 — the policy, at the hook.** `bun read-guard.ts '<readable>' '<readOnly>'` with the PreToolUse JSON on stdin, exactly as
  Claude Code calls it (SPEC-108 § Hook contract). It proves what a command gets. It does not prove what a model then does.
  Script: `tests/harness/test-108/hook-cases.mjs`, 48 commands; record `hook-cases.json`.
- **Layer 2 — the hop and the card, with the real runner.** `runner-cases.ts`: a fake Blueprint (the team's `test/helpers/fake-blueprint.ts`),
  caw-back API on `pglite:file`, the **real runner**, and QA's stub `qa-claude.ts` as `CLAUDE_BIN`. The stub prints the stream lines a real hook
  refusal produces (`PreToolUse:Bash hook error: … caw-refused <code>: …`) and acts on its card through the API, as the team's `fake-claude.ts` does.
  It proves the runner's handling of refusals, crashes and caps. It does not prove that a real CLI emits the same lines; layer 3 does.
- **Layer 3 — one live hop** (Claude CLI allowed 13:01, logged): SPEC-103's dev script with `LIVE_VIEW_REAL=1` and a card text that forces two
  refusals (Silver's tip: real workers avoid forbidden commands by themselves).
- AC-4 (the Health Board team builds and reaches QA's turn) belongs to REQ-108 phase 2, per REQ-111 AC-4's own check.

## Results

| # | AC | Actual | Result |
|---|---|---|---|
| 1 | AC-1 | hook: `bun --version`, `bun install`, `bun build x.ts --outdir dist`, `pwd && ls -la` → **allowed**; also `bun run x.ts`, `bun test`, `cat … \| grep`, `mkdir -p dist && touch …`, `curl http://127.0.0.1:3900/…`, `ls -la 2>&1`, `git status`, `echo hello > out.txt` | PASS |
| 1b | AC-1 (live) | the real worker ran `bun --version` (1.4.2), `pwd && ls -la`, `bun init -y` (created files, installed 7 packages) | PASS |
| 2 | AC-2 | hook: `docker ps` `not_allowed` · `echo $HOME` `shell_feature` · `git commit` / `git push` `git_write` · `cat /etc/passwd`, `ls ~`, an outside file `outside` · `curl https://example.com`, `ssh` `network` · `rm` in the read-only folder `read_only`. **24 bypass attempts all refused**: `curl http://127.0.0.1@evil.example`, `localhost.evil.example`, `curl -x <proxy>`, `\| sh`, `bash -c`, `env cat`, symlinks to `/etc` and outside, `git -C /etc`, `../outside`, `bun run ../…`, `node -p`, `> /tmp/…`, `cp … ../outside/`, `ls; rm -rf /`, `&`, `<<EOF`, backticks, `wget`, `bun publish`, `git diff --output`, `tee /etc/hosts`, `sed -i`, `python3 -c` | PASS |
| 2b | AC-2 | runner, one refusal (stub): hop **`commented`** (not stopped); note "คำสั่งนี้ทำไม่ได้: docker ไม่ใช่คำสั่งที่ worker ใช้ได้ — ทำต่อด้วยวิธีอื่น"; the worker's next action (a comment) landed | PASS |
| 2c | AC-2 | runner, 11 refusals (stub): stopped at the **10th**, note "หยุดไว้: คำสั่งถูกปฏิเสธครบ 10 ครั้งในก้าวเดียว · คำสั่งนี้ทำไม่ได้: …" (≤ 3 reasons) | PASS |
| 2d | AC-2 (live) | real worker: `docker ps` and `echo $HOME` refused with the English reasons in its own comment; it carried on, outcome **`commented`**, note with both Thai reasons; runner log `refused 1 of 10 … refused 2 of 10` | PASS |
| 3 | AC-3 | after the refusal cap: card **`todo`**, `stoppedMidway` `{hopId, at, reason: "หยุดไว้: คำสั่งถูกปฏิเสธครบ 10 ครั้งในก้าวเดียว"}` | PASS |
| 3b | AC-3 | after a crash (stub exits 1): hop `failed`, card `todo`, `stoppedMidway` reason "ก้าวนี้ไม่ได้ทิ้งผลงานไว้" | PASS |
| 3c | AC-3 | after the hop time cap (`RUNNER_HOP_MAX_MS` 15 s, stub hangs): hop `stopped` "หมดเวลา — ก้าวนี้ใช้เวลานานเกินไป", card `todo` + `stoppedMidway` | PASS |
| 3d | AC-3 | a card depending on the crashed one: not workable while it waits; the crashed card gets a second hop (`commented`, `stoppedMidway` cleared), and once it is done the dependant becomes **workable** | PASS |
| 3e | AC-3 | end of the round: 0 cards in `doing`, 0 running hops · live: the card went back to `todo` after the hop (the worker itself thought it stayed `doing`) | PASS |
| 3f | AC-3 (screen) | caw-front e2e incl. TASK-120's mark: 265 passed. QA did not separately screenshot "งานนี้หยุดกลางทาง: … — รอทำต่อ" on a live board | PASS (suite) |
| 5 | AC-5 | caw-back `bun test` **808 / 1 skip / 1 fail**: the one fail is the known `execPath` "@" test, unchanged (stub log 0) · the runner's start-up probe of the 3 workspace guard hooks passed in every run (it refuses to start otherwise) · confinement tests inside the suite · caw-front `bun test src` **334 / 0**, typecheck clean, build exit 0, e2e **265 passed** | PASS |
| 4 | AC-4 | REQ-108 phase 2 | not here |

### Live hop ledger (Claude CLI, owner 13:01)

| When | Hop | Model | Tokens | Outcome | Limit signal |
|---|---|---|---|---|---|
| 16:40:09–16:40:19 | `01a18707-fac8-…` (dev script, run root under `/tmp/caw-live-ws-…`) | `claude-haiku-5-5`, low | in 8 · cache create 10,817 · cache read 144,268 · out 1,177 | `commented`; 2 refusals, both carried past | none |

## Defects

None against the ACs as written.

## Observations (not ours)

- **O-1 — a refusal's reason is hidden on the live screen.** The screen line for a refused command is the hook error cut at 200 chars
  (SPEC-103's `screenLines`): "✗ PreToolUse:Bash hook error: ['/usr/local/…/bun.exe' /tmp/…/read-guard.ts …". The viewer sees the runner's
  internal paths and the folder list, and the reason is cut off. The hop note and the model do get the reason. REQ-104's screen, not this REQ.
- **O-2 — three refusals name a shell character, not the program.** `bun -e "console.log(1)"`, `find . -exec rm {} ;` and `python3 -c "print(1)"`
  come back `shell_feature` (brackets) instead of `inline_code` / `not_allowed`. Still refused. A model that strips the brackets
  then gets a second refusal, which counts toward the cap of 10.
- **O-3 — a crash reads like an empty step.** After a crash, `stoppedMidway.reason` is "ก้าวนี้ไม่ได้ทิ้งผลงานไว้", the same words as a hop that
  simply did nothing. The user cannot tell a crash from an idle worker on the board.

## Test data created

| What | Where | End state |
|---|---|---|
| layer-1 folders (proj / ro / outside, two symlinks) | session scratchpad `t108/hookdirs` | left |
| layer-2 run root, DB, stub wrapper | `/tmp/qa108-root-*` (pglite:file inside) | left (tmp) |
| the live hop's run root (incl. `bun init` output) and trace | `/tmp/caw-live-ws-*`, `~/.caw/traces/01a18707-…jsonl` | left (dev script's tmp; the trace holds the real stream) |
| servers 4541 / 4542 / 3513, runners | this machine | all stopped; no `claude` process |

## Verdict

**AC-1, AC-2, AC-3, AC-5: `TEST_PASSED`.** Ordinary build and run commands work; forbidden ones are refused one at a time with the real
reason, and the hop carries on; the 10th stops it. After any end (refusal cap, crash, time cap) the card is back in `todo` and says why,
and the team can go on. The policy held against every bypass QA tried.
**Q1:** the owner accepted it as known for REQ-111 (*"ส่งมอบ REQ-111 ไปก่อน แล้วเปิด REQ ใหม่แก้ช่องโหว่ curl/header ปลอม operator ทีหลัง"*,
`DECISIONS.md` 2026-10-29 17:0x). The risk is real and stays open until REQ-113: a worker can `curl 127.0.0.1` CAW's and Blueprint's APIs as the operator.
Round 2 (AC-6) and Q2 move to REQ-113's test. AC-4 is REQ-108 phase 2.
**This verdict covers the fingerprinted tree only** (caw-back f8a619e + `18ca4d833a46`, caw-front 1e16d37 + `686c119cd01c`, re-checked unchanged
16:5x). A commit of anything else is not what was tested.

## Evidence (decisive)

- `tests/harness/test-108/hook-cases.json` — 48 commands through the real hook, 0 on the wrong side.
- `runner-cases.ts` output (this file, rows 2b–3e) — refusals, cap, crash, timeout, dependant, on the real runner.
- the live hop's comment and screen output (row 1b / 2d) and the runner log line `refused 1 of 10 … refused 2 of 10`.

## Round 2 — AC-6 (designed 2026-10-29 16:50, runs when SA B says done)

Instrument: the same real hook (`hook-cases.mjs`, extended with an `AC-6` group) + the stub runner for "a refusal names its reason".

| # | Case | Expected |
|---|---|---|
| 6a | Q1's four calls exactly as listed (CAW mode/budget, proposal accept, workspace roots, Blueprint versions / change-sets) | each refused, reason named |
| 6b | the same targets written other ways: `localhost:4500`, `[::1]:4500`, `127.1:4500`, `0.0.0.0:4500`, `http://127.0.0.1:4500/` with no header, a plain GET to `:4200` | refused (the ports, not only the header) |
| 6c | the headers written other ways: `x-caw-actor:` lower case, `--header 'X-CAW-Actor: operator'`, `-H@headers.txt`, the header sent to a worker's own port | refused wherever the header appears (or the port rule catches it) |
| 6d | `wget` with the same targets / headers | refused |
| 6e | `curl http://127.0.0.1:3900/api/status` (a port the worker itself started) and `curl -I http://localhost:3900/` | allowed |
| 6f | **the way around a word filter:** the worker writes `call.ts` (`fetch("http://127.0.0.1:4500/v1/…", { headers: { "X-CAW-Actor": "operator" } })`) and runs `bun run call.ts` | the hook can only see `bun run call.ts`. **Expected per SPEC-108's Non-functional ("the policy judges words, not processes"): allowed.** QA records whether the API call then succeeds. If it does, AC-6 holds at the hook but not in effect. That is a question for the PM before the run, not a surprise in the verdict (Q2) |
| 6g | regression: R-19 (48 cases) and R-20 re-run unchanged; caw-back suite | as before |

## Questions

- **Q1 (QA → PM — BLOCKS delivery; a decision for the owner) — a worker can act as the operator through `curl 127.0.0.1`.**
  REQ-111 allows network to `127.0.0.1` (requirement 1), and SPEC-108 D2 allows `curl`/`wget` there with any headers. CAW's API (:4500)
  trusts `X-CAW-Actor: operator` from anyone (TEST-101), and Blueprint's API (:4200) trusts any `X-Blueprint-By`. The real hook **allows**
  all of these from a worker (checked 16:3x):
  - `curl -X PATCH -H 'X-CAW-Actor: operator' … /v1/projects/P/mode -d '{"mode":"dispatcher","hopBudget":999}'` — raise its own run budget;
  - `curl -X POST -H 'X-CAW-Actor: operator' … /v1/proposals/X/accept` — accept its own proposals;
  - `curl -X PATCH -H 'X-CAW-Actor: operator' … /v1/projects/P/workspace -d '{"roots":[…]}'` — change the team's folders;
  - `curl -X POST -H 'X-Blueprint-By: worker' … :4200/v1/projects/P/versions` and `…/change-sets` — label or rewrite the spec.
  Before REQ-111 the settings denied `curl`/`wget` outright, so this is **new with this REQ**. QA proves the hook's decision and, from
  TEST-101, the APIs' trust. QA did **not** run such a call from a worker. **Default (mine, to correct):** hold delivery. The SA keeps
  `curl`/`wget` to the dashboard's own ports but refuses the CAW API and Blueprint API ports, or refuses an `X-CAW-Actor` / `X-Blueprint-By`
  header in a worker's command. The owner may instead accept it as known (no login yet, owner 10:51 "later").
  > answer (PM, 2026-10-29 `[PM-decided]`): **hold delivery and fix.** REQ-111 is amended: requirement 4 + AC-6 (refuse the CAW/Blueprint API ports and the identity headers from a worker; its own ports stay open). Interpreted from `DECISIONS.md` 13:41 (workers confined to their folder); the owner is told and may override. Re-test AC-6 + regression when SA B says done.
  > **OVERRIDDEN 2026-10-29 17:0x by the owner** (typed in the PM pane): *"ส่งมอบ REQ-111 ไปก่อน แล้วเปิด REQ ใหม่แก้ช่องโหว่ … ทีหลัง (ให้ทำต่อจากนี้เลย)"*. Q1 is accepted as known for REQ-111; AC-6 is withdrawn, and the fix is REQ-113. **QA: please give REQ-111's verdict on AC-1…AC-5 as they stand.** — Porter (PM)
- **Q2 (QA → PM, 2026-10-29 16:50 — does not block the build, decides what AC-6 means).** AC-6 is checked at the hook, which reads
  the **command's words**. A worker may write and run its own code (`bun run x.ts`, allowed by AC-1), and that code can call
  `127.0.0.1:4500` with `X-CAW-Actor: operator` without any `curl` in the command. SPEC-108 says so itself ("the policy judges words, not
  processes"). **Default:** AC-6 is read as "no command the worker types reaches the APIs as someone else". QA still runs 6f and reports
  what happens, so the owner sees the gap. A real fix (the API refusing a worker's process that claims `operator`, e.g. per-hop tokens)
  would be a later REQ. Correct me if AC-6 should mean "in effect".

**Commit check (2026-10-29 17:11):** REQ-111 was committed as caw-back **80e3e88** and caw-front **f071c02**. A clean `git archive` of each,
compared with QA's tested tree (`diff -rq`, excluding node_modules / build output), shows **no difference** in either repo. What
was tested is what was committed.
