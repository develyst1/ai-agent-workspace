# TEST-113: CAW's starting team runs out of the box; the run report says when a review holds work up
- Source REQ: REQ-117 (Team B: SPEC-114, TASK-143 caw-back, TASK-144 caw-front)
- Status: **TEST_PASSED** (2026-10-30 14:57, Tanya)
- Asked by: the PM, 2026-10-30 (`inbox/QA.md`) · stub `CLAUDE_BIN` · no gateway · **no live hop** (optional; not needed — see § Instruments)
- Tested: 2026-10-30 by Tanya · harness `tests/harness/test-117/` (folder named after the REQ; the TEST number came from `new-id.mjs`)

## Build under test
- **caw-back 67dfe55 + fp `8eabc258e3d2`** (11 paths: 5 modified + `skills/role-{ba,be,fe,pm,qa,sa}/SKILL.md`) · **caw-front 7359fa3 + fp `53136121e54d`** (7 paths). Same fp method as TEST-110. Clean HEAD export + diff + untracked; unchanged at 14:57.
- Blueprint = the real blueprint-back export of TEST-112 round 2 — only to give CAW a project; not under test.

## Instruments and their limits
- `r117.mjs`: real caw-back API + runner + caw-front, **a brand-new `CAW_WORKSPACE_ROOT`** (`/tmp/qa117-…/root`): the guard hooks linked (the runner refuses to start without them, TEST-106 F-0), **no `.claude/skills`**. The starting team is made by the real button "ใช้ทีมเริ่มต้น".
- `qa-claude.ts` (stub CLI) records what the runner hands it — the prompt and the skills text behind `--append-system-prompt-file` — then replies (chat hop) or comments (card hop) as MCP does.
- What the stub cannot prove: that the real CLI reads that file. That path was already proven live with a skill file in TEST-112 (the real CLI ran from `--append-system-prompt-file` every hop), so the optional live hop was not spent.

## Cases (`r117.out`)

| # | AC | Type | Actual | Result |
|---|---|---|---|---|
| 1 | AC-1 | happy | fresh root without `.claude/skills` → "ใช้ทีมเริ่มต้น" → ปลา(role-pm) · ใบเตย(role-sa) · ฝน(role-fe) · แบงค์(role-be) · มิ้นท์(role-qa) → folder → chat message → the first chat hop **started and replied** (`outcome replied`); runner log has **no "not found"** | PASS |
| 2 | AC-1 | content | the CLI was handed the PM role skill (695 chars, from the runner's per-hop `skills.md`); it carries the PM's Q1 sentence verbatim ("Before you ask the operator anything, read the card's `spec.decisions` and `spec.relatedDecisions`; ask only what they do not answer.") (`out/ac1-skills.txt`); all 6 shipped `SKILL.md` carry it (grep) | PASS |
| 3 | AC-1 | state | the runner wrote nothing into the fresh root's `.claude` (shipped skills are read from caw-back itself) | PASS |
| 4 | AC-2 | happy | #1 "ออกแบบ Health Board" in review; #2, #3 depend on #1; #4 depends on #2; #5 in review with nothing behind it → auto run → `nothing_workable`; report "รอคุณ" = **"- รอคุณตรวจ: ออกแบบ Health Board — มีอีก 3 งานรออยู่"**; board shows the same line (`out/ac2-run.json`, `ac2-board.png`) | PASS |
| 5 | AC-2 | boundary | the count: 3 = #2, #3 and #4 (#4 waits through #2). SPEC-114 D3: "the work cards not `done` that depend on it, directly or through other cards (each counted once)", and a done card ends the walk (`caw-back → src/runner/report.ts:60-82`, read to explain the number). AC-2's own scenario (#2, #3 only) gives 2 by the same rule | PASS |
| 6 | AC-2 / Q2 | negative | #5 (in review, nothing behind it) is not listed; never "รอคุณ — ไม่มี" while #1 holds work up | PASS |
| 7 | AC-3 | regression | a second project, starting team, no cards → run ends; report "รอคุณ — ไม่มี", no "รอคุณตรวจ" line; its board shows none (`out/ac3-run.json`, `ac3-board.png`) | PASS |
| 8 | AC-3 | suites | caw-back `bun test` **883 / 1 / 1** (the known `withReadGuard` `execPath` test, as in TEST-105/110/112) · caw-front unit **355 / 0**, typecheck 0, build 0, e2e **276 passed** · CLI stub (`bin/claude`) 0 calls · gateway 0 | PASS |

## Defects
None.

## Test data created
| What | Where | End state |
|---|---|---|
| 2 CAW projects, 5-seat teams, 5 cards, 1 hop | `pglite:file` in `/tmp/qa117-…` | run folder deleted |
| the fresh root (`/tmp/qa117-…/root`, hooks link + `hb/`) | this machine | deleted with the run folder |
| servers 4292 / 4541 / 3541, the runner, 4396, e2e 3551/3552 | this machine | stopped; `ss` clear 14:57 |
| scripts, logs, screens | `tests/harness/test-117/` | left, as evidence |

## Verdict
**`TEST_PASSED`** — AC-1 (a fresh install's starting team starts its first hop with CAW's own role skills, PM's sentence included), AC-2 (report and board name the review that holds work up, in the PM's words, counting direct and transitive dependants per SPEC-114 D3; Q2 honoured), AC-3 (nothing waiting → "รอคุณ — ไม่มี"; suites green). **Tested trees for git:** caw-back **67dfe55 + fp `8eabc258e3d2`** · caw-front **7359fa3 + fp `53136121e54d`**.

## Questions
(none)
