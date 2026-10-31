# REQ-117: CAW's starting team runs out of the box, and the run report says when a review is holding work up
- Status: **DELIVERED + COMMITTED** (2026-10-30 15:2x — caw-back 4cc3241 · caw-front b4f2659, pushed, PM verified) · DELIVERED (2026-10-30 15:0x, the PM — QA's TEST_PASSED) · was TEST_PASSED (2026-10-30 14:57, QA Tanya — AC-1…AC-3; tested trees caw-back 67dfe55+`8eabc258e3d2` · caw-front 7359fa3+`53136121e54d`; `tests/TEST-113-caw-starting-team-review-report.md`) · was READY_FOR_SA (2026-10-30, the PM)
- Priority: HIGH `[PM-decided]` — both stop or mislead a real user on the first run. Team B's next item.
- Requested: 2026-10-30 by the PM, from QA's TEST-112 joint + live run (F-0b again, O-4). Stamp `team-proposed` (defect route); decided under the owner's 08:40 standing order (`DECISIONS.md` § "ตัดสินใจแทนเจ้าของ รอทบทวน" 2026-10-30 14:2x).
- Deadline: none · Team: **B (CAW)**

## Problem / Goal

In TEST-112's live run (`tests/TEST-112-caw-card-rules-coverage.md` § Joint + live run), two things a real user would hit:
1. **"ใช้ทีมเริ่มต้น" does not work:** the first hop stopped before it began — *"skill role-pm not found under …/caw-workspaces/.claude/skills"*. The starting team names role skills that CAW's workspace root does not have (first seen as TEST-106 F-0b, parked for REQ-109).
2. **The report hides who is waiting on the operator:** a card in review ("รอตรวจ") blocked the cards after it, the run ended `nothing_workable`, and the run report said "รอคุณ — ไม่มี".

## Requirement

1. A user who presses "ใช้ทีมเริ่มต้น" on a fresh CAW install gets a team whose first hop starts — every skill the starting team names exists where the runner looks, shipped or set up by CAW itself (not by hand). How is the SA's design.
2. When a run stops because cards wait on a card in review (or any operator step), the run report and the board say so: which card waits for the operator's review, and how many cards wait behind it.
3. Nothing else in the run changes.

## Acceptance Criteria

- [ ] **AC-1** — **Given** a fresh `CAW_WORKSPACE_ROOT` with no `.claude/skills` **When** the user presses "ใช้ทีมเริ่มต้น" and starts the first chat hop (stub `CLAUDE_BIN`) **Then** the hop starts; no "skill … not found".
- [ ] **AC-2** — **Given** card #1 in review and cards #2, #3 depending on it **When** the run ends with nothing workable **Then** the report and the board show the § Wording line naming #1 and the 2 waiting cards; never "รอคุณ — ไม่มี".
- [ ] **AC-3** (regression) — caw-back and caw-front suites pass; a run with nothing waiting on the operator still says "รอคุณ — ไม่มี".
  - Check (all): QA, stub `CLAUDE_BIN` — no live hop needed; one live hop allowed to confirm AC-1 (DECISIONS 2026-10-29 13:01).

## User-facing wording (the PM)

| Where | TH | EN |
|---|---|---|
| run report / board, a review holds work up | รอคุณตรวจ: {ชื่องาน} — มีอีก {n} งานรออยู่ | Waiting for your review: {card} — {n} more cards are waiting on it |

## Out of Scope

- Changing who reviews or auto-approving reviews. · The desk's own role skills (never copied into CAW). · Other REQ-109 deploy items.

## Questions
(the SA and the QA ask here; the PM answers as `> answer: ...`)
- **SA B → PM, 2026-10-30 14:5x — two non-blocking questions, in `specs/SPEC-114-caw-starting-team-and-review-report.md` § Questions:**
  **Q1** the six role-skill texts CAW's AI workers get (SPEC-114 D2 — neutral defaults, English, "anything a user reads is in Thai"); **Q2** a
  review card that holds nothing up is not listed (default). Answer here or there; TASK-143/144 are built with the defaults meanwhile, and a
  text change later is a file edit, no code. Checked: REQ-117 § Wording, § Out of Scope (desk skills never copied — D2's are new); DECISIONS
  2026-10-30 (nothing on CAW's skill texts).
  > answer (PM, 2026-10-30 14:3x `[PM-decided]`): **Q1** — the six texts accepted, with **one sentence added to every role**: *"Before you ask the operator anything, read the card's `spec.decisions` and `spec.relatedDecisions`; ask only what they do not answer."* (TEST-112 DEF-1: live, the SA card asked for what DEC-001/003 already said.) **Q2** — default accepted: a review card that holds nothing up is not listed; the "รอตรวจ" column shows it. — Porter

## AC check
(SA B, Silver, 2026-10-30 15:1x — SPEC-114, TASK-143 + TASK-144 DONE, uncommitted on caw-back 67dfe55 / caw-front 7359fa3)

| AC | Where it is met | Self-checked |
|---|---|---|
| AC-1 fresh root, first hop starts | `caw-back → src/runner/prompt.ts:30-48` (shipped `skills/role-*` fallback) — the only skill gate is `src/runner/hop.ts:318-319`; tests `src/runner/prompt.test.ts` (a)–(c); SA ran the loader on a new empty folder → `true 1839` (base `false role-pm`), folder left empty | yes — at the gate the hop stops on; the full first chat hop with a stub CLI is QA's run |
| AC-2 report + board name #1 and 2 waiting | report: `src/runner/report.ts:60-82`, test `report.test.ts:140` (e); board: `caw-front → src/lib/reviewHold.ts`, `src/components/Board.tsx` notices, e2e `tests/board.spec.ts:317` (`review-holds`) — words = § Wording exactly | yes |
| AC-3 suites pass; nothing waiting → "รอคุณ — ไม่มี" | caw-back 883/1/1 (known `settings.test.ts` only), report+prompt 57/0 (SA re-run); caw-front unit 355/0, e2e 276 passed (SA re-run); test `report.test.ts:157` (g) keeps "- ไม่มี"; e2e `board.spec.ts:310` no line on the default board | yes |

## Verification (by QA)

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | fresh `CAW_WORKSPACE_ROOT` (hooks only, no `.claude/skills`) → "ใช้ทีมเริ่มต้น" in the real UI → the first chat hop started and replied; no "not found"; the CLI was handed the PM role skill with the PM's Q1 sentence; nothing written into the root |
| AC-2 | PASS | #1 in review, #2/#3 behind it (+ #4 behind #2) → `nothing_workable`; report and board: "รอคุณตรวจ: ออกแบบ Health Board — มีอีก 3 งานรออยู่" (direct + transitive, SPEC-114 D3; AC-2's own case gives 2); a review card holding nothing up not listed (Q2) |
| AC-3 | PASS | nothing waiting → "รอคุณ — ไม่มี", no board line; caw-back 883/1/1 (known `execPath`), caw-front 355/0 + e2e 276 |
