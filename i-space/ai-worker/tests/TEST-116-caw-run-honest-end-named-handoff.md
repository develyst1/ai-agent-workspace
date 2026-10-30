# TEST-116: a CAW run does not end "nothing workable" while a card is workable; hand-off names its people
- Source REQ: REQ-119 (Team B: SPEC-116, TASK-147 caw-back, TASK-148 caw-front) — from TEST-106 phase 2 P2-2, P2-3
- Status: **TEST_PASSED** (2026-10-30 16:36, Tanya; stamp corrected from a wrong "17:4x" — F-044) — AC-1…AC-3; DEF-1 MINOR for the PM
- Environment: local (this machine) · stub `CLAUDE_BIN` · no gateway (refusing stub :4396, 0 calls)
- Tested: 2026-10-30 by Tanya · harness `tests/harness/test-119/` (named after the REQ; the TEST number came from `new-id.mjs`)
- Build under test (`bash ai-worker/tools/tree-fp.sh`, at the start and again at the verdict — **the same**):
  - `tree-fp caw-back HEAD 4cc3241 fp 045bfe44eda2 (247 paths: 245 tracked, 2 untracked, 0 deleted)`
  - `tree-fp caw-front HEAD b4f2659 fp 16244093690a (145 paths: 145 tracked, 0 untracked, 0 deleted)`
  - Run from a clean HEAD export + diff + untracked. Blueprint = a blueprint-back export (TEST-115's), only to give CAW a project; not under test.

## Scope
REQ-119 req 1 (the run's end), req 2 (recipients by name and role), req 3 (nothing else changes). Out: why a real model comments instead of handing off; the two open proposals; REQ-118.

## Instruments and their limits
- `r119.mjs`: the real caw-back API + runner + caw-front, a fresh `CAW_WORKSPACE_ROOT` (guard hooks linked), the starting team made by the real button "ใช้ทีมเริ่มต้น", runs started by the real "อัตโนมัติ" dialog. One project per scenario, so turn counts do not mix.
- `qa-claude.ts` (stub CLI) acts as MCP does, **as the worker** (`x-caw-actor: worker:<id>`, `x-caw-hop`): reads `card_context`, then follows a script per worker per turn (`comment` / `handoff:<name or id>`), and records the prompt and `handOffTo` it was given.
- What the stub cannot prove: that a real model reads the "You may hand off to:" line and uses a name. That needs a live hop; REQ-108 phase 3 will show it.

## Cases (`r119.out`, `out/`)

| # | AC | Type | Actual | Result |
|---|---|---|---|---|
| 1 | AC-1 | happy | S1: #1 (ใบเตย SA) only comments → **2 hops** on #1 (one extra turn, not a loop), both `commented` → run ends **`no_progress`** (not `nothing_workable`); report `- เหตุที่จบรอบ: #1 ออกแบบ Health Board ยังทำต่อได้ แต่ทำ 2 รอบแล้วไม่คืบ — กด "อัตโนมัติ" เพื่อลองต่อ หรือเปิดการ์ดดู` (the PM's Q1 line, `{cardNo}`/`{turns}` apart); no "ไม่มีงานที่ทำต่อได้" anywhere; card still `todo`, workable (`s1-run.json`) | PASS |
| 2 | AC-1 | painted | S1 board: "การรันหยุดแล้ว: **มีงานที่ยังทำต่อได้ แต่ไม่คืบ**" (Q2's word), no "ไม่มีงานที่ทำต่อได้" (`out/s1-board.png`) | PASS |
| 3 | AC-1 | state | S1 again: pressing "อัตโนมัติ" once more (as the words say) → the card gets its 2 turns again, then the same honest stop | PASS |
| 4 | AC-1 | neighbour | S4: two commented cards (#1 SA, #2 FE) → order **#1, #2, #1, #2** (fresh turns first), then the stop names **#1 only** (lowest-numbered, PM's Q1) | PASS |
| 5 | AC-1 | neighbour | S2: SA comments, then hands off on its second turn → the hand-off counts as progress; แบงค์ (BE) gets its own 2 turns; the stop names #1 — **with "ทำ 4 รอบแล้วไม่คืบ"** → **DEF-1** | PASS (DEF-1) |
| 6 | AC-1 | regression | S5: budget 1 → 1 hop, `budget_spent` ("ใช้งบครบแล้ว") — the extra turn never overrides the budget | PASS |
| 7 | AC-2 | happy | S1: the SA's prompt holds `You may hand off to: ฝน (FE), แบงค์ (BE) — pass the name (or the id) as \`toWorkerId\` of \`hand_off\`.` — **no bare id**; `card_context.handOffTo` = `[{id, name "ฝน", roles ["FE"]}, {id, name "แบงค์", roles ["BE"]}]` (`out/s1-sa-prompt.txt`) | PASS |
| 8 | AC-2 | happy | S2: แบงค์'s prompt: `You may hand off to: มิ้นท์ (QA) — …` (the P2-3 case: "who is …383f") | PASS |
| 9 | AC-2 | happy | S2: `hand_off` **by name** ("แบงค์") → 200, card assignee = แบงค์'s id · S3: `hand_off` **by id** → 200 | PASS |
| 10 | AC-2 | negative | S3: an unknown name ("ใครก็ไม่รู้") → **409 `chain_broken`**, message "…you may hand to: มิ้นท์ (QA) 01a18c28-…" — names who is allowed, by name + role + id (`out/s3-refusal.json`); that hop ends `failed`, and the run ends `no_progress` naming #1 | PASS |
| 11 | AC-3 | regression | S6: REQ-117's line unchanged — `- รอคุณตรวจ: ออกแบบ Health Board — มีอีก 3 งานรออยู่`, stop `nothing_workable`, reason "ไม่มีงานที่ทำต่อได้" (true here: nothing is workable) · S6b: no cards → "รอคุณ — ไม่มี", no review line (`s6-run.json`, `s6b-run.json`) | PASS |
| 12 | AC-3 | suites | caw-back `bun test --timeout 30000` **893 / 1 skip / 1 fail** — the known `withReadGuard` `execPath` test (as in TEST-105/110/112/113) · caw-front typecheck 0, unit **355 / 0**, build 0 (`caw-back-test.txt`, `caw-front.txt`). e2e not re-run by QA (SA: 276 passed); the painted board check is case 2 | PASS |

## Defects
### DEF-1 — the stop's turn count includes turns that DID make progress — MINOR
- Environment: S2 above (stub CLI; same on any run where a card is handed off and then stalls).
- Repro (from a clean state): starting team; one card for ใบเตย (SA); ใบเตย comments on its first turn and hands off to แบงค์ by name on its second; แบงค์ only comments → อัตโนมัติ.
- Expected (REQ-119 req 1, "a reason that tells the truth (how many times…)"; the PM's words "ทำ {turns} รอบแล้วไม่คืบ" / "made no progress in {n} turns"): the turns without progress — 2 (แบงค์'s), or 3 if ใบเตย's first comment counts.
- Actual: `- เหตุที่จบรอบ: #1 ทำ API ตามแบบ ยังทำต่อได้ แต่ทำ 4 รอบแล้วไม่คืบ — …` — 4 = every hop on the card in the run, the hand-off included (`out/s2-run.json`; the count is every non-interrupted hop of that card in the run).
- Does not block AC-1 (the run does not end "nothing workable"; the report names the card; never "ไม่มีงานที่ทำต่อได้"). The single-worker case (the TEST-106 P2-2 case) shows the right number (2).

## Test data created
| What | Where | End state |
|---|---|---|
| 7 CAW projects (S1–S6b), 5-seat teams, 10 cards, ~22 stub hops | `pglite:file` in `/tmp/qa119-HDKVuG` | left in /tmp (QA scratch, no repo); servers stopped |
| Blueprint projects | `pglite:memory` (:4292) | gone: stopped |
| servers 4292 / 4541 / 3541, the runner, stub 4396 | this machine | stopped; `ss` clear 16:35 |
| scripts, logs, screens | `tests/harness/test-119/` | left, as evidence |

## Verdict
**`TEST_PASSED`** — AC-1 (a commented card gets one extra turn, then the run stops `no_progress` naming the card in the PM's words, and the board says "มีงานที่ยังทำต่อได้ แต่ไม่คืบ"; never "ไม่มีงานที่ทำต่อได้" while a card is workable), AC-2 (the prompt and `card_context` name every recipient as name + role; hand-off by name and by id works; an unknown name is refused naming who is allowed), AC-3 (REQ-117's line, "รอคุณ — ไม่มี", budget stop, suites). **DEF-1 MINOR** (the turn count includes a hand-off turn) for the PM to accept or route. NOT_TESTED: a real model using the named line (live; REQ-108 phase 3). **Tested trees for git (tree-fp.sh):** caw-back **4cc3241 fp `045bfe44eda2`** · caw-front **b4f2659 fp `16244093690a`**.

## Questions
(none)
