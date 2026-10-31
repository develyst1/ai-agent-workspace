# TEST-117: a spec typed by hand in Blueprint reaches every CAW worker — the joint path
- Source REQ: REQ-118 (Team A: SPEC-115, TASK-145/146 · Team B: SPEC-117, TASK-149/150) — from TEST-106 phase 2 P2-1
- Status: **TEST_PASSED** (2026-10-30 17:46, Tanya) — AC-1…AC-5 on the joint path; AC-6 = REQ-108 phase 3
- Environment: local (this machine) · stub `CLAUDE_BIN` · no gateway (refusing stub :4396, 0 calls)
- Tested: 2026-10-30 by Tanya · harness `tests/harness/test-118/` (named after the REQ; the TEST number came from `new-id.mjs`)
- Build under test (`bash ai-worker/tools/tree-fp.sh`, at the start 17:31 and the verdict 17:46 — the same, and the same as the PM's line):
  - `tree-fp blueprint-back HEAD 93249a7 fp c51f8477e700 (157 paths: 156 tracked, 1 untracked, 0 deleted)`
  - `tree-fp blueprint-front HEAD b08d23a fp 3a86ddf81dbf (305 paths: 305 tracked, 0 untracked, 0 deleted)`
  - `tree-fp caw-back HEAD b6fbfaf fp a5e46d86d6b7 (249 paths: 247 tracked, 2 untracked, 0 deleted)`
  - `tree-fp caw-front HEAD 7a2a6a5 fp 0c57fd1ec4c8 (145 paths: 145 tracked, 0 untracked, 0 deleted)`
  - Run from clean HEAD exports + diff + untracked.

## Scope
REQ-118 AC-1…AC-5 on the **joint** path: the real Blueprint (back + web) and the real CAW (API + runner + web), wired together — the one thing the SAs' AC check left UNVERIFIED (each side had been tested against its own fixture). AC-6 = REQ-108 phase 3, after commit.

## Instruments and their limits
- `r118.mjs`: the 8 requirements of TEST-106 phase 2 are **typed on Blueprint's requirements page** (Playwright, as `hand.mjs` did); CAW makes its project from that Blueprint project and reads it over the seam; the starting team by the real button; runs by the real "อัตโนมัติ" dialog.
- `qa-claude.ts` (stub CLI, from TEST-112's) acts as MCP does, as the worker: the chat hop saves its prompt **and the text of `--append-system-prompt-file`**, locates and proposes 2 cards (REQ-001 → ใบเตย, REQ-005 → แบงค์), replies; a card hop saves its prompt and its `card_context`.
- `ctxdiff.mjs` + `seed.mjs` (TEST-112's interview-style spec): the old blueprint-back (HEAD 93249a7, no TASK-145) against the new one, every part context v2 and v1.
- What the stub cannot prove: that a real model builds from the requirements it is given — AC-6 / REQ-108 phase 3.
- Harness bugs of mine, fixed before any verdict: (1) I compared against `JSON.stringify` of the texts, which escapes the quotes three of them contain — they looked "missing"; (2) the AC-4 run's budget (see O-1); (3) `ctxdiff` first compared generated ids and times (`createdIn`, `savedAt`, `confirmedAt`). Run 1's output kept as `out-run1/`, `r118-run1.out`.

## Cases

| # | AC | Type | Actual (`r118.out`, `out/`) | Result |
|---|---|---|---|---|
| 1 | setup | — | the 8 requirements typed on Blueprint's requirements page → REQ-001…REQ-008, each `body.text` = the spec line verbatim, nothing else in the spec (`bp-spec.json`, `bp-requirements.png`) | — |
| 2 | AC-1 | seam | Blueprint's own context for REQ-001 and for REQ-005: `requirements` = all 8, verbatim (`seam-context-*.json`) | PASS |
| 3 | AC-1 | happy | CAW's `GET /v1/cards/{id}/context` as the worker, card #1 (anchored REQ-001) and card #2 (anchored **REQ-005**): `spec.requirements` = **all 8 texts verbatim**, 8 items each (`ac1-context-*.json`) | PASS |
| 4 | AC-1 | hop | both card hops read all 8 through `card_context`, and each hop's prompt says "2. Follow every requirement in `spec.requirements` and every rule … — the requirements bind every card, whatever its anchor" (`ac1-hop-*.json`) | PASS |
| 5 | AC-2 | happy | the entry chat hop's system-prompt file holds **all 8 verbatim** under `# The spec's requirements (Blueprint revision 8) — they bind the whole project` (`ac2-system-prompt.txt`); its prompt holds "2b. … Propose cards so that every requirement that asks for work is taken up by a card anchored on its key" | PASS |
| 6 | AC-2 | neighbour | the stub's proposal anchored on requirement keys is accepted: locate 200 ×2, propose 201, accept 200 → #1 REQ-001, #2 REQ-005 | PASS |
| 7 | AC-3 | happy | `GET /coverage?proposalId=` for that proposal → uncovered **REQ-002, 003, 004, 006, 007, 008** (the two taken up are not listed) (`ac3-coverage-proposal.json`) | PASS |
| 8 | AC-3 | painted | after accept: the board's coverage = the same 6, and the board shows "ส่วนนี้ใน spec ยังไม่มีงานไหนรับไป:" + key for each of the 6 (REQ-112's words) (`ac3-board.png`, `ac3-coverage-board.json`); the chat page shows the same line on the proposal | PASS |
| 9 | AC-4 | happy | REQ-004 ("3. …10 วินาที…") edited in Blueprint after run 1 (change-set `part.update`, revision 8 → 9) → both cards get `specChangedVersion 9`; the next hop's `card_context` holds the **edited text** and the other 7 unchanged; CAW's `/requirements` shows the edit (`ac4-*.json`) | PASS |
| 10 | AC-5 | regression | **interview-built spec** (TEST-112's seed: 23 parts, links, decisions, no requirement) in the old blueprint-back (HEAD 93249a7) vs the new one: **46 / 46 contexts (v2 + v1 for every part) equal** with only generated ids and times left out, the one difference being the new `requirements: []` (`ctxdiff.out`) — includes REQ-112's `relatedDecisions` unchanged | PASS |
| 11 | AC-5 | regression | REQ-117's harness (`r117/`, TEST-113's) on these trees: fresh root, starting team's first hop starts, review line "รอคุณตรวจ: ออกแบบ Health Board — มีอีก 3 งานรออยู่", "รอคุณ — ไม่มี" — OK. Two BADs, neither a regression: the "2 waiting" check is the same script expectation TEST-113 overruled (3 is right per SPEC-114 D3); the PM sentence check looks for the old wording — this REQ changed it on the PM's Q1 answer to "read the card's `spec.requirements`, `spec.decisions` and `spec.relatedDecisions`", and the CLI received the new sentence (all 6 shipped skills carry it) (`r117/r117.out`) | PASS |
| 12 | AC-5 | suites | blueprint-back **335 / 16 skip / 0** · blueprint-front check:api matches, typecheck 0, **238 / 0**, build 0 · caw-back **916 / 1 skip / 1 fail** — the known `withReadGuard` test only · caw-front typecheck 0, **355 / 0**, build 0 (`*-test.txt`, `*-front.txt`). REQ-105's "latest spec" rule: case 9 for requirements; REQ-112: case 10 + the suites | PASS |

## Observations (not REQ-118's)
- **O-1 — the "อัตโนมัติ" number is the project's budget, so a second run can end at once.** Run 1 was started with 2 and used 2; run 2, started with 2 again, ended in 0.3 s: "0 ก้าว จากงบ 2 · เหตุที่จบรอบ: ใช้งบครบแล้ว" (`out-run1/ac4-run.json`). The API refuses on `project.hopsUsed >= project.hopBudget` (caw-back `src/hops/service.ts:50`, REQ-105-era), and the report reads as if this run spent it. Older than this REQ; a user who starts a second run with the same number sees a run that did nothing and says its budget is spent.

## Test data created
| What | Where | End state |
|---|---|---|
| Blueprint projects (by-hand spec, 2 interview seeds) | `pglite:memory` (:4292, :4281, :4282) | gone: stopped |
| CAW projects, team, 2 cards, ~6 stub hops (+ REQ-117 rerun's) | `pglite:file` in `/tmp/qa118-…`, `/tmp/qa117-…` | left in /tmp (QA scratch, no repo) |
| servers 4292 / 3192 / 4541 / 3541 / 4281 / 4282, runners, stub 4396 | this machine | stopped; `ss` clear 17:46 |
| scripts, outputs, screens | `tests/harness/test-118/` | left, as evidence |

## Verdict
**`TEST_PASSED`** — on the joint path (real Blueprint → real CAW), a spec typed by hand reaches every worker: AC-1 (every card's context, whatever its anchor, holds all 8 requirements verbatim; each hop is told to follow them), AC-2 (the entry chat gets all 8 in its system prompt), AC-3 (requirements no card takes up are listed uncovered, on the board in REQ-112's words), AC-4 (an edit in Blueprint reaches the next hop; cards flagged), AC-5 (interview-built contexts identical but for `requirements: []`; REQ-117 unchanged except the PM-ordered sentence; four suites green but the known test). The SAs' one UNVERIFIED item is now verified. NOT_TESTED here: AC-6 (live) — REQ-108 phase 3 after commit. **Tested trees for git (tree-fp.sh, same at 17:31 and 17:46):** blueprint-back **93249a7 fp `c51f8477e700`** · blueprint-front **b08d23a fp `3a86ddf81dbf`** · caw-back **b6fbfaf fp `a5e46d86d6b7`** · caw-front **7a2a6a5 fp `0c57fd1ec4c8`**.

## Questions
(none)
