# TEST-112: a worker gets every rule its card needs; a part no card covers is shown — CAW side, on QA's Blueprint stand-in
- Source REQ: REQ-112 (Team B side: SPEC-109, TASK-121/122)
- Status: **TEST_PASSED** (round 2, 2026-10-30 14:43, Tanya — AC-1…AC-5; DEF-1 closed live; tested fps in § Round 2 verdict) · joint + live TEST_FAILED 14:1x (DEF-1) · IN_TEST 10:10 (stand-in)
- Asked by: the PM, 2026-10-30 (`inbox/QA.md`, REQ-112 § Questions last note) · no gateway · no live Claude CLI
- Tested: 2026-10-30 by Tanya

## Build under test
- `caw-back` **27cbd1b** (REQ-105 committed) + Team B's REQ-112 tree fp **`731120f9b2fa`** (8 paths) · `caw-front` **4a071bc** + fp **`78fc858510bf`** (14 paths). Same fp method as TEST-110. Clean HEAD export + diff + untracked, no `.env`; unchanged at 10:10.

## Instruments and their limits
- **Blueprint = QA's own stand-in** `test-112/bp-standin.mjs` (TEST-110's, written from SPEC-106 v2) + project P3 = **TEST-106's Health Board spec**, rebuilt from `tests/harness/test-106/step2-changeset.mjs` (same titles, bodies, links; keys in Blueprint's per-kind order). Its part context carries `decisions` and — in mode `contract` — `relatedDecisions` computed by **QA's reading of SPEC-106 § REQ-112 addition**. Checked before use against SPEC-106's own worked example: SCR-001 → DEC-001…003 via STEP-002, DEC-004/006 via WRK-001; DATA-001 → `[]`. Mode `none` = today (field absent). Switching it does not move the spec revision (shipping TASK-117 changes Blueprint's answers, not the spec).
  SA B's presets (`stand-in-blueprint-105.ts` `req112` / `req112-related`) **not used, on purpose**: they serve the builders' own reading; this one is independent.
- **Workers = QA's stub CLI** `test-112/qa-claude.ts` through the real runner. Card hop: reads `card_context` as MCP does and saves the prompt + context it got. Chat hop (entry worker): `locate` → `propose_cards` (one builder card on SCR-001, as TEST-106) → `reply` with the proposal — the same three calls MCP makes.
- Driver `test-112/r112.ts`; output `r112.out`; evidence `test-112/out/`.

## Cases (run 3, 2026-10-30 ~10:05; runs 1–2 failed on QA's stub, see § QA-side)

| # | AC | Type | Actual | Result |
|---|---|---|---|---|
| 1 | AC-2 (proposal) | happy | the entry worker proposes 1 card on SCR-001 → `GET …/coverage?proposalId` = STEP-002 (DEC-001+002+003) · WRK-001 (DEC-004+006); the chat's proposal block shows **"ส่วนนี้ใน spec ยังไม่มีงานไหนรับไป: STEP-002 เช็คสถานะทั้ง 4 บริการ"** and **"… WRK-001 I-Space Health Board"**, keys linked to Blueprint (`ac2-proposal.png`) | PASS |
| 2 | AC-2 (D4) | state | accepting the proposal with uncovered parts → 200, card 1 on SCR-001 (advisory, never blocks) | PASS |
| 3 | AC-2 (board) | happy | board coverage (cards only) = the same two parts; the board shows both sentences, keys link to `…/web?part=STEP-002` / `WRK-001` (`ac2-board.png`) | PASS |
| 4 | AC-1 (today) | state | before TASK-117: the builder's context has `decisions` = DEC-005 only, no `relatedDecisions` — the 10 s / 3 s rules do **not** reach the worker yet (the REQ's own problem, as expected) | info |
| 5 | AC-1 (D1) | happy | the prompt the worker got: "2. Follow every rule in `spec.decisions` and `spec.relatedDecisions` of your card's context — a rule on a related part applies to your card too." · MCP `tools/list` (real server): `card_context` names `spec.decisions` and `spec.relatedDecisions` | PASS |
| 6 | AC-1 | happy | with `relatedDecisions` on: the builder's card context carries **DEC-002 "เช็คใหม่เองทุก 10 วินาที…" and DEC-003 "ไม่ตอบภายใน 3 วินาที…" via STEP-002** (+ DEC-001, DEC-004/006), passed through whole (`relatedDecisionsMore false`, `decisions` unchanged) (`ac1-hop-contract.json`) | PASS *(CAW side; the real field is TASK-117's)* |
| 7 | AC-2 | state | with `relatedDecisions` on and the revision moved: coverage `uncovered []`; the board shows no sentence (`ac2-board-covered.png`) | PASS |
| 8 | AC-4 | regression | card on DATA-001 (no flows): `relatedDecisions []`; the rest of its context identical with and without the field | PASS |
| 9 | D4 | unhappy | stand-in stopped → coverage 502 `blueprint_unreachable`; the board renders, no coverage line, REQ-105's unreachable sentence (`d4-board-down.png`) | PASS |
| 10 | AC-4 | suites | caw-back `bun test` **872 pass / 1 skip / 1 fail** — the one = the known `withReadGuard` `execPath` test (TEST-105, TEST-110); CLI stub 0 calls · caw-front unit **346 / 0**, typecheck 0, build 0, e2e **273 passed** | PASS |
| 11 | AC-1 live / joint | — | **NOT_TESTED** — needs Team A's TASK-117 (the real `relatedDecisions`) | NOT_TESTED |
| 12 | AC-3 | live | **NOT_TESTED** — REQ-108 phase 2 | NOT_TESTED |

## Defects
None in Team B's change.

## Observations
- **O-1 — the coverage memo outlives the day Blueprint gains `relatedDecisions`.** Right after the stand-in started sending the field (same spec revision, as when TASK-117 is deployed), `GET …/coverage` still answered STEP-002 + WRK-001 uncovered (revision 1); one spec edit later it answered `[]`. SPEC-109 D2 keys the memo by revision + anchors, so this is as designed. The effect: on the day TASK-117 ships, a board can show "ไม่มีงานไหนรับไป" lines that are no longer true until someone edits the spec or CAW restarts. For the PM to weigh; not a fail of any AC.
- **O-2** — the stand-in's project title is the old seed's ("จองห้องประชุม"); a harness detail, nothing tested reads it.

## QA-side (not the product)
- Run 1: my stub proposed without `locate` → 422 `anchor_not_located` (CAW lets a hop propose only keys it located — correct). Run 2: it proposed but never `reply`-ed, so the chat showed "ทีมยังตอบข้อความนี้ไม่ได้" and no proposal block. Run 3 does locate → propose → reply, as MCP does.

## Test data created
| What | Where | End state |
|---|---|---|
| CAW project, worker, chat message, proposal, 2 cards, 2 hops (per run) | `pglite:file` in `/tmp/qa112-*` | run folders deleted |
| servers 4290 / 4541 / 3541, the runner, 3551/3552 (e2e) | this machine | stopped; `ss` clear 10:10 |
| scripts, logs, screens | `tests/harness/test-112/` | left, as evidence |

## Verdict
**CAW side PASS on QA's stand-in** — AC-2 (proposal + board), AC-1's CAW part (prompt line, MCP description, the field passed through whole), AC-4. **NOT_TESTED:** AC-1 with Blueprint's real `relatedDecisions` + the joint run (TASK-117), AC-3 (live, REQ-108 phase 2). No defect in Team B's change; O-1 for the PM.

## Questions
(none)

## Joint + live run (2026-10-30 13:3x–, PM's go: AC-1 real field, joint, AC-3 live; live CLI allowed, owner 2026-10-29 13:01) — evidence `tests/harness/test-112/joint/`
- Trees: blueprint-back 2da175e + REQ-112 A tree fp `15fbcda12f05` (5 paths) · blueprint-front 15283e1 + fp `461b90ce3887` (1 path) · caw-back **67dfe55** clean · caw-front **7359fa3** clean. Standard ports (the spec monitors them): bp 4200 / 3100, CAW 4500 / 3500; Blueprint's gateway = the refusing stub; runner with the **real `claude` 2.1.314**, `CAW_WORKSPACE_ROOT=/workspace/caw-workspaces`, the project folder **`/workspace/caw-workspaces/health-board-112`** (new; TEST-106's `health-board` untouched). Every step in `joint/out/live.log`.
- Spec: TEST-106's, entered by its own change-set script (`joint/seed.mjs`, a new Blueprint project) — the interview is not under test here.
- **AC-1 on the real field: PASS** — Blueprint's v2 context for SCR-001: `decisions` DEC-005, `relatedDecisions` DEC-001/002/003 via STEP-002 + DEC-004/006 via WRK-001 (`real-scr001-context.json`); the builder's card (#3, SCR-001) context in CAW carries the same, the 10 s and 3 s rules included (`card-3-context.json`).
- Flow, through the screens: Blueprint "ส่งไปสร้างที่ CAW" → CAW board → "ใช้ทีมเริ่มต้น" (ปลา PM opus · ใบเตย SA opus · ฝน FE sonnet · แบงค์ BE sonnet · มิ้นท์ QA opus; entry ปลา) → folder → chat. The first chat hop **stopped before it began: "skill role-pm not found under /workspace/caw-workspaces/.claude/skills"** — the starting team names role skills CAW's root does not have (TEST-106 F-0b again → REQ-109 input). Interpreted TEST-106 Q6 `[PM-decided]` (no desk role skills in CAW's root; the neutral `i-space-builder`) for the starting team: the 5 workers' skills set to `i-space-builder`; "ลองอีกครั้ง".
- The entry worker (real hop) proposed 4 cards: #1 SA @WRK-001 · #2 BE @WRK-001 (after #1) · #3 FE @SCR-001 (after #1) · #4 QA @STEP-001 (after #2, #3). **Coverage with the real field: `uncovered []`** on the proposal and on the board (joint AC-2).
- Observation O-3: cards anchored on the **work** (#1, #2) get DEC-004/006 and `relatedDecisions []` — a work's own steps are not in its `flows[].at` (SPEC-106's rule), so the 3 s rule (DEC-003, on STEP-002) does not reach the server card #2. Watched in the build.
- Accepted ("ตกลง เริ่มงาน"), อัตโนมัติ with budget 12 (06:52Z). AC-3 result to follow in this section.
- **Live run 1 (06:52:30–06:52:58Z) → DEF-1.** Card #1 (SA ใบเตย, opus, anchored on **WRK-001**) asked the operator instead of working (card #5, `ask_operator`): *"spec ของ WRK-001 บอกว่า "เช็คสถานะทั้ง 4 บริการ" (STEP-002) แต่ไม่ได้ระบุว่า 4 บริการของ I-Space คือตัวไหน อยู่ที่ address อะไร และนับว่า "เปิดอยู่" ด้วยเกณฑ์อะไร…"*. The spec **does** say it — DEC-001 (the 4 services with URLs) and DEC-003 (3 s) — but they cover STEP-002, and a card on the work gets `relatedDecisions []` (O-3). Its draft plan then drifted from the spec ("เปิดอยู่/ปิดอยู่", "เช็คอีกครั้ง", no 3 s, no 10 s). The run ended `nothing_workable` (all other cards depend on #1). 1 hop, `claude-opus-5-5`, out 2,313 tokens (`joint/out/runner.log`, `card5-question.txt`).
- Operator step (QA as the owner would): answered #5 with **the spec's own DEC-001 + DEC-003 text only** — not DEC-002 (the 10 s rule), so AC-3 still tests whether that rule reaches the builder by itself. Second run started 06:54:55Z, budget 12.

### DEF-1 (live) — a card anchored on a work does not get the rules on that work's steps; live, it stopped the team at its first card — MAJOR
- Build: blueprint-back 2da175e + fp `15fbcda12f05` (TASK-117) · caw-back 67dfe55 · caw-front 7359fa3; real `claude` 2.1.314.
- Repro: TEST-106's spec (DEC-001…003 cover STEP-002; WRK-001 `has_step` STEP-001…003) → a card anchored on WRK-001 → `GET /v1/cards/{id}/context`.
- Expected (REQ-112 req 1: "its context includes every rule (decision) in the spec that bears on what the card builds"): a card on the whole work gets the rules on its steps (DEC-001…003).
- Actual: `decisions` DEC-004/006, `relatedDecisions []`. SPEC-106's rule takes steps from the part's `flows[].at` — for a work that is empty, its own `has_step` steps are not counted. Live, the SA on that card could not see the 4 services and asked; the team stopped.
- Not caught by AC-1 as written (it names the SCR-001 card, which PASSES). Evidence: `card-1-context.json`, `card-2-context.json`, `card5-question.txt`, runner log. (No fix proposed.)
- **Live run 2 (06:54:55–06:57:58Z):** #1 handed SA → FE → QA; QA set #1 to "รอตรวจ" (review); the run ended `nothing_workable` (#2, #3 wait on #1 done) while its report said "รอคุณ — ไม่มี". The files were already written inside #1's hops (`server.ts`, `public/`, `services.json`, README) — that version had **no** automatic re-check (`out/built-after-run2/`). Operator step: #1 → done (as the owner would for a card in review). O-4: a card in review blocks its dependants and the run report says nothing waits on the operator — REQ-108 / team-flow, not REQ-112.
- **Live run 3 (06:58:38–07:00:00Z):** #2 (BE แบงค์, sonnet) → review; **#3 (FE ฝน, sonnet, the SCR-001 card) → review, and its hop read `card_context` with `relatedDecisions` — "10 วินาที" 8 times in its trace** (`traces/01a18b9a-fab3-….jsonl`). `public/app.js:64` now `setInterval(check, 10000)`; words "ทำงาน" / "ไม่ตอบ" / "เช็คตอนนี้" from the spec.
- **AC-3: PASS** — the built page, run as its README says (`bun server.ts`, :3900), opened in Chrome with **no click**: its own `/api/health` requests at **0.0, 10.0, 20.0, 30.0 s** (gaps 10.0 s); every shown time moved 14:00:39 → 14:01:09 (`ac3.out`, `ac3-t0.png`, `ac3-t35.png`). The 10 s rule reached the builder through Blueprint's real `relatedDecisions` — QA's operator answer (#5) deliberately left it out.
- **Live-run ledger** (`out/ledger.txt`): 8 hops — 1 stopped at start (no skill), 7 ran: chat `proposed` (opus) · #1 `asked` (opus) · #1 `handed_off` ×2 (opus, sonnet) · #1 → review (opus) · #2 → review (sonnet) · #3 → review (sonnet). Tokens out ≈ 29.6 k; cache-read ≈ 2.25 M; cache-create ≈ 169 k. #4 (QA) never ran (waits on #2, #3 in review). No limit or usage signal seen. **Gateway calls: 0** (refusing stub log empty).
- **AC-4 (joint trees):** blueprint-back `bun test --timeout 30000` **313 / 16 / 0** · caw-back **874 / 1 / 1** (the known `execPath` test) · blueprint-front `check:api` matches, typecheck 0, unit **238 / 0** · caw-front unit **346 / 0**, typecheck 0 · gateway 0 · repos unchanged by QA (fps re-taken 14:0x, same as the start).

### Verdict, joint + live (2026-10-30 14:1x)
**`TEST_FAILED`** — **DEF-1 (MAJOR)**: a card anchored on a work does not get the rules on that work's steps, and live it stopped the team at its first card (the SA asked for what DEC-001/DEC-003 already say). That is REQ-112 requirement 1 — "every rule (decision) in the spec that bears on what the card builds" — failing for the most common anchor of an SA / BE card.
**Every AC as written PASSES:** AC-1 on Blueprint's real field (the SCR-001 card carries the 10 s / 3 s rules) · AC-2 joint (coverage `[]` with the real field; uncovered parts shown — TEST-112 stand-in run) · **AC-3 live: the page the real team built re-checks by itself every 10.0 s** · AC-4 suites green. Not rounded up: AC-3 passed only after QA, as operator, answered the question DEF-1 caused. O-3 (DEF-1's mechanism), O-4 (review blocks dependants while the report says nothing waits on the operator — REQ-108), F-0b again (the starting team's role skills are not in CAW's root — REQ-109).

## Round 2 (2026-10-30 14:3x) — AC-5 + DEF-1 re-check (SPEC-106 E17, TASK-117 r2) — evidence `tests/harness/test-112/r2/`
- Trees: **blueprint-back 2da175e + fp `1d9eb523d5e1`** (5 paths) · **blueprint-front 15283e1 + fp `461b90ce3887`** (unchanged) · **caw-back 67dfe55** and **caw-front 7359fa3** as committed. The CAW working trees now carry another REQ's uncommitted work (caw-back 3 paths incl. `skills/`, caw-front 7 incl. `reviewHold`) — **not** in this run and not judged here.
- Real blueprint-back (round 2) + caw-back API, TEST-106's spec (`r2/seed.mjs`), cards on WRK-001, SCR-001, STEP-001, DATA-001 (`r2.out`):

| # | AC | Actual | Result |
|---|---|---|---|
| R2-1 | **AC-5** | card on **WRK-001**: `decisions` DEC-004, DEC-006 · `relatedDecisions` **DEC-001, DEC-002, DEC-003 via STEP-002**; the 4 URLs, "10 วินาที", "3 วินาที" all in its context (`card-wrk001-context.json`) | PASS |
| R2-2 | AC-1 | SCR-001 unchanged: DEC-005; DEC-001…003 via STEP-002 + DEC-004/006 via WRK-001 | PASS |
| R2-3 | neighbour | STEP-001 → DEC-004/006 via WRK-001 only (not its sibling step's rules) | PASS |
| R2-4 | AC-4 | **all 23 parts compared round 1 (fp `15fbcda12f05`) vs round 2** on the same spec: **17 identical**; WRK-001 `[]` → DEC-001…003 (AC-5); DEC-004/006 now get DEC-001…003 (they cover the work); DEC-001…003 no longer list **themselves** (round 1 did) (`round1-vs-round2.txt`) → O-5 | PASS |
| R2-5 | AC-2 | coverage with the 4 cards: `uncovered []` | PASS |
| R2-6 | **DEF-1 live** | one real hop, SA (`claude-opus-5-5`) on a WRK-001 card with live card #1's task: **`commented`, no `ask_operator` call** (tools used: `card_context`, `comment`); its plan quotes DEC-001's 4 URLs, DEC-002 10 s + "เช็คตอนนี้", DEC-003 3 s, DEC-004 :3900, DEC-006 "ไม่ทำ" (`live-comment.txt`, trace). Ledger: 1 hop 07:31:26–07:32:03Z, out 3,542, cache-read 142,771. Gateway 0. | PASS |
| R2-7 | AC-4 | blueprint-front `check:api` matches round 2's `openapi.json` (no contract change, E17) · back suite → below | — |

- **QA-side correction:** my round-1 stand-in run expected DATA-001 → `[]`; the real Blueprint (round 1 and round 2 alike) climbs from a data part through the screen that `shows` it, so DATA-001 gets DEC-001…006. My stand-in's flows were simpler than Blueprint's — the TEST-112 stand-in row "AC-4 DATA-001 `[]`" proved CAW passes `[]` through, not what Blueprint sends for DATA-001.
- **O-5:** round 2 also changes decision anchors (a decision no longer lists itself; DEC-004/006 gain the step rules). Sensible, but E17 says "everything else unchanged" — for the PM / SA A to note.
- R2-7 (AC-4) cont.: blueprint-back `bun test --timeout 30000` **316 / 16 / 0** [637 s], gateway 0. caw-back / caw-front at 67dfe55 / 7359fa3 = the trees of the joint run (874/1/1 known `execPath`; 346/0, typecheck 0) — no change since.

### Verdict, round 2 (final, 2026-10-30 14:43)
**`TEST_PASSED`** — AC-1 … AC-5 met: AC-5 (a card on the work gets its steps' rules) on Blueprint's real field, **DEF-1 closed live** (the SA no longer asks for what the spec says), AC-3 live from the joint run (the team-built page re-checks every 10 s), AC-4 regression (17 of 23 part contexts byte-identical; the rest as E17 intends + O-5), suites green. **Tested trees for git:** blueprint-back **2da175e + fp `1d9eb523d5e1`** · blueprint-front **15283e1 + fp `461b90ce3887`** · caw-back **67dfe55** · caw-front **7359fa3** (CAW as committed — the CAW working trees' current uncommitted changes are another REQ's and were not tested here). Open for the PM: O-4 (review blocks dependants; REQ-108), F-0b (starting team skills; REQ-109), O-5.
