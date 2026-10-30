# REQ-119: A CAW run does not end while a card is workable, and hand-off names its people
- Status: **DELIVERED + COMMITTED round 1** (2026-10-30 16:4x — caw-back 7956aa7 · caw-front 7a2a6a5, pushed, PM verified) · DELIVERED round 1 (the PM — QA's TEST_PASSED; tested trees caw-back 4cc3241 fp `045bfe44eda2` · caw-front b4f2659 fp `16244093690a`) · **round 2 (DEF-1) READY_FOR_SA** after round 1's commit — § Round 2 · was TEST_PASSED (2026-10-30 16:36, QA Tanya — AC-1…AC-3; DEF-1 MINOR; `tests/TEST-116-caw-run-honest-end-named-handoff.md`) · SPEC_DONE (2026-10-30 16:1x, Silver, per the board) · READY_FOR_SA (2026-10-30 15:3x, the PM)
- Priority: HIGH `[PM-decided]` — in TEST-106 phase 2 the operator had to restart the run once and answer "who is this id" twice; a real user would think the team stopped.
- Requested: 2026-10-30 by the PM, from QA's TEST-106 phase 2 P2-2 and P2-3. Stamp `team-proposed` (defect route); decided under the owner's 08:40 standing order (`DECISIONS.md` § "ตัดสินใจแทนเจ้าของ รอทบทวน" 2026-10-30 15:3x).
- Deadline: none · Team: **B (CAW)**

## Problem / Goal

From `tests/TEST-106-e2e-live-dashboard.md` § Phase 2:
1. **P2-2** — the SA's hop only commented (no hand-off, no status), card #1 went back to `todo` with `workable: true`, and the run ended `nothing_workable` with the report "เสร็จแล้ว — ไม่มี · รอคุณ — ไม่มี · เหตุที่จบรอบ: ไม่มีงานที่ทำต่อได้" — while a workable card sat on the board.
2. **P2-3** — `hand_off` showed the allowed recipients as bare ids; twice a worker stopped and asked the operator who an id was (SA: which is BE/FE; BE: who is the QA).

## Requirement

1. A run never ends as "nothing workable" while a card on the board is workable. If a hop leaves its card workable without progress, the run either gives that card another turn or ends with a reason that tells the truth (how many times, what the next step is — SA's design), never "ไม่มีงานที่ทำต่อได้".
2. Wherever a worker is told whom it may hand off to, each recipient is named by name and role, not only by id.
3. Nothing else in the run changes.

## Acceptance Criteria

- [ ] **AC-1** — **Given** a card whose hop only comments and leaves it `todo`/workable (stub) **When** the run continues **Then** it does not end with `nothing_workable` while that card is workable; if it stops, the report does not say "ไม่มีงานที่ทำต่อได้" and names the card.
  - Check: QA, stub `CLAUDE_BIN`, run report + board.
- [ ] **AC-2** — **Given** a 5-seat starting team **When** a worker is offered hand-off recipients **Then** each one appears as name + role (e.g. "แบงค์ (BE)"), and a hand-off by name or id still works.
  - Check: QA reads the prompt/tool text the stub received.
- [ ] **AC-3** (regression) — REQ-117's review line and "รอคุณ — ไม่มี" unchanged; caw-back and caw-front suites pass.

## User-facing wording (the PM)

| Where | TH | EN |
|---|---|---|
| run report, the run stops while a card is still workable | หยุดรอบ: {ชื่องาน} ยังทำต่อได้ แต่ทำ {n} รอบแล้วไม่คืบ — กด "อัตโนมัติ" เพื่อลองต่อ หรือเปิดการ์ดดู | Run stopped: {card} can still be worked on but made no progress in {n} turns — press "อัตโนมัติ" to try again, or open the card |

(Use only if the SA's design stops the run in that case; if the run simply gives the card another turn, no new words.)

## Out of Scope

- Why the SA worker commented instead of handing off (model behaviour). · Two open proposals after "ตามนั้น" (TEST-106 phase 2 "Also seen" — noted, not fixed here). · REQ-118's spec-context fix.

## Round 2 — DEF-1 (PM, 2026-10-30 16:3x `[PM-decided]`, DECISIONS "17:4x" line = real 16:3x, F-044)

TEST-116 DEF-1 (MINOR): after a hand-off, the stop line counts every turn on the card ("ทำ 4 รอบแล้วไม่คืบ") although the hand-off turn made progress. A wrong number in a sentence the user reads.
- **Req 4** — `{turns}` in the stop line counts only the turns since the card's last progress (a hand-off, a status change~~, a file written~~ — "progress" as SPEC-116 already defines it; struck 16:4x, Q4b).
- **AC-4** — **Given** TEST-116's S2 (SA comments, hands off on its 2nd turn; BE only comments twice) **When** the run stops **Then** the line says "ทำ 2 รอบแล้วไม่คืบ"; the single-worker case still says 2. Check: QA, stub.
- Built after round 1 is committed; Team B may fold it into its next caw-back TASK (same files as REQ-118 B). No new words.

## Questions
(the SA and the QA ask here; the PM answers as `> answer: ...`)

- **Q1–Q3 (Silver, SA B, 2026-10-30 16:1x) — non-blocking; the defaults are being built.** Full text + cases: `specs/SPEC-116-caw-run-honest-end-named-handoff.md` § Questions.
  Checked: DECISIONS 2026-10-30 08:40 (PM decides, never wait) · REQ-119 § Wording — not covered: where the sentence sits in the report, the run strip's short word, and whether a commented card is retried.
  **Q1** report line = `- เหตุที่จบรอบ: #{n} {title} ยังทำต่อได้ แต่ทำ {n} รอบแล้วไม่คืบ — กด "อัตโนมัติ" เพื่อลองต่อ หรือเปิดการ์ดดู` (your sentence without `หยุดรอบ: `; lowest-numbered stuck card only) · **Q2** run strip word `มีงานที่ยังทำต่อได้ แต่ไม่คืบ` · **Q3** a commented card gets ONE extra turn per worker per run (≤ 1 more hop each), then the honest stop. Correct only the line that is wrong.
  > answer (PM, 2026-10-30 16:2x `[PM-decided]`): **Q1 accepted**, one fix: `{n}` is used twice — card number and turn count are two different values; write them `#{cardNo} {title} … ทำ {turns} รอบแล้วไม่คืบ`. Lowest-numbered stuck card only: OK. **Q2 accepted** (`มีงานที่ยังทำต่อได้ แต่ไม่คืบ`). **Q3 accepted**: one extra turn per worker per run, then the honest stop. — Porter
- **Q4 (Silver, SA B, 2026-10-30 16:4x) — round 2, non-blocking; the default is in TASK-151.** Full text: `specs/SPEC-116-caw-run-honest-end-named-handoff.md` § D4.
  Checked: DECISIONS 2026-10-30 16:4x (round 2 not in r1's commit) · this REQ § Round 2 + Q1/Q2 answers — not covered: a stop where the newest hop made progress, and req 4's "a file written".
  **Q4a** count 0: one hop moves the card `todo → doing` (still workable), the worker's turn is used up, the run stops `no_progress` → "ทำ 0 รอบแล้วไม่คืบ" is not true → default: the generic line `เหตุที่จบรอบ: มีงานที่ยังทำต่อได้ แต่ไม่คืบ` (your Q2 word), no number. · **Q4b** "a file written" is not something the runner can see (a hop that only writes files ends `commented`) → default: progress = hand-off or status change only; AC-4 does not depend on it. Correct only the line that is wrong.
  > answer (PM, 2026-10-30 16:4x `[PM-decided]`): **Q4a accepted** — count 0 → the generic line, no number. **Q4b accepted** — "a file written" in req 4 was my error (the runner cannot see it); req 4 reads: progress = a hand-off or a status change. — Porter

## AC check
(SA, Silver, 2026-10-30 16:1x [time corrected 16:3x, was written "17:2x" — F-043] — checked against the built code in caw-back on `4cc3241` + TASK-147's 21 paths, caw-front on `b4f2659` + TASK-148's 5 paths; uncommitted)

| AC | where it is met | self-checked |
|---|---|---|
| AC-1 a commented card does not end the run `nothing_workable`; a stop names the card, not "ไม่มีงานที่ทำต่อได้" | caw-back `src/runner/plan.ts` (second turn, `no_progress` + `cardId` while a workable card is left) · `src/runner/main.ts` `case "finish_run"` (`#{cardNo} {title} ยังทำต่อได้ แต่ทำ {turns} รอบแล้วไม่คืบ — …`) · tests `plan.test.ts` (commented twice → `no_progress` c1), `main.test.ts` (stub run: report holds the line, not "ไม่มีงานที่ทำต่อได้") · front word `caw-front → src/words.ts` `stopReason.no_progress` (TASK-147/148 § Review) | yes |
| AC-2 recipients as name + role; hand-off by name or id works | `src/cards/service.ts` `recipientsOf` → `card_context.handOffTo`, the refusal's `allowedWorkers` + named message, id-or-name resolve · `src/runner/prompt.ts` line "You may hand off to: แบงค์ (BE), …" (hop.ts passes the chain's recipients) · tests `test/http/cards.test.ts` (by name → 200, stored id; `handOffTo`), `prompt.test.ts` (TASK-147 § Review) | yes |
| AC-3 REQ-117's review line and "รอคุณ — ไม่มี" unchanged; suites pass | `src/runner/report.ts` + `report.test.ts` untouched (`git diff --quiet`) · caw-back whole suite 893/1 skip/1 known fail (`settings.test.ts`), tsc 0 · caw-front typecheck 0, 355/0, e2e 276 passed | yes |
| AC-4 (round 2, SA Silver 2026-10-30 16:4x, caw-back `7956aa7` + TASK-151's 2 paths, uncommitted) TEST-116 S2 → "ทำ 2 รอบแล้วไม่คืบ"; single worker still 2 | `src/runner/main.ts` `PROGRESS` + `case "finish_run"` (count newest first, stopping at the first `handed_off`/`status`; 0 → generic words, Q4a) · `main.test.ts` "SPEC-116 D4 (AC-4, TEST-116 S2)" (hops first c, first handed_off, second c, second c → `ทำ 2 รอบ`, not `ทำ 4 รอบ`) + "reachable 0" + `:331` single worker `ทำ 2 รอบ` unchanged · re-run 63/0, tsc 0; whole suite 895/1/1 known (TASK-151 § Review) | yes |

## Verification (by QA)
Tanya, 2026-10-30 16:36 — tree-fp.sh: caw-back 4cc3241 fp `045bfe44eda2`, caw-front b4f2659 fp `16244093690a` (same at start and verdict); stub CLI; detail TEST-116.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | a commenting card → 2 hops, then `no_progress`: "เหตุที่จบรอบ: #1 ออกแบบ Health Board ยังทำต่อได้ แต่ทำ 2 รอบแล้วไม่คืบ — …"; board "มีงานที่ยังทำต่อได้ แต่ไม่คืบ"; never "ไม่มีงานที่ทำต่อได้"; two cards → #1,#2,#1,#2, #1 named; budget still wins |
| AC-2 | PASS | prompt "You may hand off to: ฝน (FE), แบงค์ (BE)" / "มิ้นท์ (QA)", no bare id; `handOffTo` name + roles; hand-off by name and by id → 200; unknown name → 409 naming who is allowed |
| AC-3 | PASS | REQ-117's "รอคุณตรวจ: … — มีอีก 3 งานรออยู่" and "รอคุณ — ไม่มี" unchanged; caw-back 893/1/1 (known withReadGuard), caw-front typecheck 0, 355/0, build 0 |

DEF-1 MINOR: after a hand-off inside the run, "ทำ {turns} รอบแล้วไม่คืบ" counts the hand-off turn too (4 where 2 made no progress).
