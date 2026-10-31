# TEST-123: a card reaches review only with a two-part note; a BE card goes to the FE only with a reason
- Source REQ: REQ-125 (Team B: SPEC-124, TASK-166 caw-back, TASK-167 caw-front) — from TEST-122 F-3, F-4 (TEST-119 O-1/O-3, TEST-121 O-2)
- Status: **TEST_PASSED** (2026-10-31 01:29, Tanya) — AC-1, AC-2, AC-3, AC-5 on the stub; **AC-4 live PASS 03:18** (REQ-124 round 2, 2026-10-31 03:18, `tests/TEST-122-full-loop-rehearsal-new-project.md` § Round 2): 9/9 notes with both parts, no BE → FE hand-off
- Environment: local (this machine) · stub `CLAUDE_BIN` (QA's open-worker stub) · no gateway (refusing stub :4396, 0 calls) · no live hop
- Tested: 2026-10-31 by Tanya · harness `tests/harness/test-125/` (named after the REQ; the TEST number came from `new-id.mjs`)
- Build under test (`bash ai-worker/tools/tree-fp.sh`, start 01:22 and verdict 01:29 — **the same**, and the same as the PM's line):
  - `tree-fp caw-back HEAD 2426d9a fp a8e76ef8bc69 (253 paths: 252 tracked, 1 untracked, 0 deleted)`
  - `tree-fp caw-front HEAD a009d2c fp 7455b131052e (146 paths: 146 tracked, 0 untracked, 0 deleted)`
  - Run from clean HEAD exports + diff + untracked.

## Instruments
- `qa-claude.ts` = TEST-121's open-worker stub + actions `review-bare` (status review, no note), `review-half` (only `done`), `review-note` (`done` + `howToTry`), `handoff-reason:<name>` (hand-off with `reason`). It acts as the worker (`x-caw-actor: worker:<id>`), as MCP does.
- `r125.mjs` = TEST-121's `r122.mjs` (S1–S15, the AC-5 regression) + **S16** (AC-1/2) and **S17** (AC-3). S9 now hands BE → FE **with** a reason (REQ-125 makes the old no-reason hand-off a refusal — S17 tests that).
- Harness fixes of mine before the verdict: the `done`-only check read the message (which always names both fields) — now reads `details.missing`; the with-reason hand-off had no turn left after the refused one (a refused hand-off ends that hop `failed` = the card's turn in that run; the stub does not retry inside the hop as a real worker would) — now a second อัตโนมัติ. First pass kept as `r125-pass1.out`.

## Cases (`r125-pass1.out` for S1–S15, `r125-s16s17.out` for S16–S17)

| # | AC | Type | Actual | Result |
|---|---|---|---|---|
| 1 | **AC-1** | negative | a worker moves its card to review with **no note** → **409 `review_note_missing`** "ยังส่งตรวจไม่ได้ — เขียนบันทึกก่อนว่าทำอะไรไปบ้าง และเจ้าของจะลองได้อย่างไร (ใส่ใน done และ howToTry)", `details.missing: ["done","howToTry"]`; the card **stays** where it was (`out/s16-refusals.json`) | PASS |
| 2 | AC-1 | boundary | only `done` → 409, `details.missing: ["howToTry"]`; card unchanged → O-1 | PASS |
| 3 | **AC-2** | happy | both parts → 200, the card **in review** with **one** note `ทำแล้ว: เพิ่ม server.js (task 1)` / `ลองได้โดย: รัน node server.js แล้วเปิด http://127.0.0.1:3920` | PASS |
| 4 | AC-2 | painted | the **card screen** shows that note to the owner (`out/s16-card-note.png`) | PASS |
| 5 | AC-1 | neighbour | the **operator** moving a card to review on the screen needs no note (Q1 e) | PASS |
| 6 | **AC-3** | negative | แบงค์ (BE card) → ฝน with **no reason** → **409 `wrong_role`** "ส่งต่อการ์ดนี้ไม่ได้ — การ์ดนี้เป็นงานของ BE ถ้าต้องให้ FE ช่วย ให้บอกเหตุผลในการส่งต่อ (ใส่ใน reason)", `details.cardRole: "BE"`; the card stays with แบงค์ (`out/s17-handoffs.json`) | PASS |
| 7 | **AC-3** | happy | the same hand-off **with** a reason → 200, the card is ฝน's; the hand-off note keeps the reason "ต้องให้ทำส่วนหน้าเว็บต่อ" where the owner reads the card's notes | PASS |
| 8 | AC-3 | neighbour | BE → QA with **no** reason → 200 (Q1 b: the normal chain never needs one) | PASS |
| 9 | **AC-5** | regression | S1–S15 — REQ-117/119/120/121/122: open workers (5 × 2 tasks at once, 3 tasks in 1 pid, SIGKILL → back, screen idle → busy → idle, restart rule on the last call's prompt and on the task limit), honest stops, names, budgets, review line — **all OK** | PASS |
| 10 | AC-5 | suites | caw-back **988 / 1 skip / 1 fail** — the known `withReadGuard` only · caw-front typecheck 0, **361 / 0**, build 0 (`caw-back-test.txt`, `caw-front.txt`) | PASS |
| 11 | **AC-4** | live | REQ-124 round 2 (caw-back 5b49f65 · caw-front 7f68c42): **9 of 9** cards reached review with "ทำแล้ว:" + "ลองได้โดย:"; each card worked by its own role in one hop, **no BE → FE hand-off** — F-3, F-4 did not recur (REQ-124 round 2, 2026-10-31 03:18, `tests/TEST-122-full-loop-rehearsal-new-project.md` § Round 2) | PASS |

## Observations (non-blocking)
- **O-1** — the refusal sentence always asks for both `done` and `howToTry`, even when one is already given; only `details.missing` says which. A real worker that reads only the sentence may resend both — harmless.
- **O-2** — a refused hand-off ends the hop `failed` if the worker does not retry inside the hop, and that is the card's turn in the run (REQ-119). A real worker reads the 409 and can retry with a reason in the same hop; whether it does is REQ-124 round 2's live question.

## Test data created
| What | Where | End state |
|---|---|---|
| 17 CAW projects (S1–S17), teams, cards, stub hops | `pglite:file` in `/tmp/qa119-…` | left in /tmp |
| servers 4292 / 4541 / 3541, runners, stub 4396 | this machine | stopped; `ss`/`ps` clear 01:29 |
| scripts, outputs, screens | `tests/harness/test-125/` | left, as evidence |

## Verdict
**`TEST_PASSED`** — AC-1 (a worker's review without the note is refused, naming what is missing; the card stays), AC-2 (with both parts the card is in review and the owner sees "ทำแล้ว: … / ลองได้โดย: …" on the card screen), AC-3 (a BE card to the FE is refused without a reason, goes through with one, the reason is kept; BE → QA is free), AC-5 (every earlier case and both suites). **AC-4 NOT_TESTED** — it is REQ-124 round 2's live run. **Tested trees for git (tree-fp.sh, same 01:22 and 01:29):** caw-back **2426d9a fp `a8e76ef8bc69`** · caw-front **a009d2c fp `7455b131052e`**.

## Questions
(none)
