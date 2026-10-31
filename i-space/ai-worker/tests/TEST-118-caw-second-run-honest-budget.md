# TEST-118: a second "อัตโนมัติ" run with the same number takes its own steps, and its report counts them
- Source REQ: REQ-120 (Team B: SPEC-118, TASK-152) — from TEST-117 O-1
- Status: **TEST_PASSED** (2026-10-30 18:14, Tanya) — AC-1…AC-3
- Environment: local (this machine) · stub `CLAUDE_BIN` · no gateway (refusing stub :4396, 0 calls)
- Tested: 2026-10-30 by Tanya · harness `tests/harness/test-120/` (named after the REQ; the TEST number came from `new-id.mjs`)
- Build under test (`bash ai-worker/tools/tree-fp.sh`, at the start 18:11 and the verdict 18:14 — the same, and the same as the PM's line):
  - `tree-fp caw-back HEAD 3efcc1a fp a95143c64740 (249 paths: 249 tracked, 0 untracked, 0 deleted)` — 5 modified paths (TASK-152)
  - `tree-fp caw-front HEAD 1287772 fp 0c57fd1ec4c8 (145 paths: 145 tracked, 0 untracked, 0 deleted)` — unchanged; TEST-117's build of the same fp reused
  - Run from a clean HEAD export + diff. Blueprint = a blueprint-back export, only to give CAW a project.

## Scope
REQ-120 req 1 (the typed number is this run's steps — the SA chose the per-run design, the PM's preference) and req 2 (no run ends at once claiming a budget it never spent). No new words (the per-run design needs none).

## Instruments and their limits
- `r120.mjs` = TEST-116's `r119.mjs` (its S1–S7 kept, as REQ-119/117's regression) + **S8**: the real caw-back API + runner + caw-front, the starting team by the real button, every run started through the real "อัตโนมัติ" dialog with its number typed. Two cards whose stub hops only comment (4 turns a run), so the budget, not the cards, is what stops each run.
- `qa-claude.ts` = TEST-116's stub CLI.

## Cases (`r120.out`, `out/`)

| # | AC | Type | Actual | Result |
|---|---|---|---|---|
| 1 | setup | — | S8 run 1, typed 2 → 2 hops, `budget_spent`, "- 2 ก้าว จากงบ 2" (`s8-run1.json`) | — |
| 2 | **AC-1** | happy | S8 run 2, **typed 2 again** (TEST-117 O-1's case) → **2 own hops**, `budget_spent`, ran 1.0 s with work done (TEST-117: 0 hops in 0.3 s) (`s8-run2.json`) | PASS |
| 3 | **AC-2** | happy | run 2's report: "- 2 ก้าว จากงบ 2", "- เหตุที่จบรอบ: ใช้งบครบแล้ว" — its own steps; the reason is true this time | PASS |
| 4 | AC-1 | neighbour | run 3, typed 1 → 1 own hop, "- 1 ก้าว จากงบ 1" (`s8-run3.json`) | PASS |
| 5 | AC-2 | neighbour | the project has 5 card hops in all = 2 + 2 + 1 — no run took another's count; board strip "การรันหยุดแล้ว: ใช้งบครบแล้ว · กด อัตโนมัติ เพื่อเริ่มรอบใหม่" (`s8-board.png`) | PASS |
| 6 | AC-3 | regression | REQ-119 / REQ-117 (S1–S7 of TEST-116): commented card → one extra turn then `no_progress` naming it, board word, press again; S2 "ทำ 2 รอบ" after a hand-off; recipients by name + role, by name / id / unknown 409; two cards #1,#2,#1,#2; budget 1 → 1 hop; count 0 → generic line; REQ-117 "รอคุณตรวจ: … — มีอีก 3 งานรออยู่"; "ไม่มีงานที่ทำต่อได้" when true; "รอคุณ — ไม่มี" — **all OK** | PASS |
| 7 | AC-3 | suites | caw-back `bun test --timeout 30000` **916 / 1 skip / 1 fail** — the known `withReadGuard` test only (= base) (`caw-back-test.txt`) · caw-front unchanged since TEST-117 (typecheck 0, 355 / 0, build 0 on fp `0c57fd1ec4c8`) | PASS |

## Defects
None.

## Test data created
| What | Where | End state |
|---|---|---|
| 8 CAW projects (S1–S8), teams, cards, ~30 stub hops | `pglite:file` in `/tmp/qa119-…` (the harness's prefix) | left in /tmp (QA scratch, no repo) |
| servers 4292 / 4541 / 3541, the runner, stub 4396 | this machine | stopped; `ss` clear 18:14 |
| scripts, outputs, screens | `tests/harness/test-120/` | left, as evidence |

## Verdict
**`TEST_PASSED`** — AC-1 (a second "อัตโนมัติ" with the same number takes that many steps of its own, through the real dialog; a third with 1 takes 1), AC-2 (each run's report counts its own steps; "ใช้งบครบแล้ว" only when this run spent them), AC-3 (REQ-117/119 lines unchanged, all of TEST-116's cases again; suites green but the known test). TEST-117 O-1 is fixed. **Tested trees for git (tree-fp.sh, same 18:11 and 18:14):** caw-back **3efcc1a fp `a95143c64740`** · caw-front **1287772 fp `0c57fd1ec4c8`** (unchanged).

## Questions
(none)
