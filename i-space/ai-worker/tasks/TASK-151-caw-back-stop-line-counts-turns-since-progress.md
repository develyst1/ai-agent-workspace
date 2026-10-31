# TASK-151: caw-back — the `no_progress` stop line counts only the turns since the card's last progress
- Source: SPEC-116 D4 (REQ-119 round 2, req 4 / AC-4; TEST-116 DEF-1)
- Owner: BE (Bob)
- Status: DONE (2026-10-30 16:4x, Silver — § Review) · was REVIEW (2026-10-30, Bob; DoD 1–6 run — see Implementation Notes)
- Depends on: REQ-119 round 1 committed (`7956aa7`) ✓

## What to do
Read SPEC-116 § D4 first (one screen, with a table and the boundary cases). Repo `caw-back`, branch `atom`, base `7956aa7` (clean). **No git.**
Run every command as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`. No live hop, no real DB.

1. `src/runner/main.ts:235` — replace the count `n`:
   - take the run's hops on this card (`h.runId === action.runId && h.cardId === card.id`), ended (`outcome !== null`), not `interrupted`;
   - sort them **newest first by id** (UUIDv7; same as `main.ts:198`: `(a, b) => (a.id < b.id ? 1 : -1)`);
   - count from the newest until the first hop whose outcome is `handed_off` or `status` (progress — D4 table); that count is `turns`.
   - Keep the progress outcomes as one small named set next to the code (e.g. `const PROGRESS = new Set<HopOutcome>(["handed_off", "status"])`, with a one-line comment pointing at SPEC-116 D4).
   - **`turns === 0`** (the newest hop was progress) → call `endRun(project.id, action.runId, "no_progress")` with **no words**, so the run gets the generic `stopWords.no_progress` (D4 "Reachable 0", Q4). Otherwise the sentence is exactly as now, with `${turns}` where `${n}` was.
2. `src/runner/main.test.ts` — next to the SPEC-116 case at `:323-333`, add:
   - **(a) AC-4 / TEST-116 S2:** a card whose first worker comments on its 1st turn and hands off to a second worker on its 2nd turn; the second worker only comments (twice). → `stopReason` `no_progress`, report contains `ทำ 2 รอบแล้วไม่คืบ`, and **not** `ทำ 4 รอบ`. Use the chain/edges the existing hand-off tests in this file or `test/http/cards.test.ts` already set up. If the stub harness cannot give a card a second worker, say so in `## Questions` before writing anything else.
   - **(b) Reachable 0:** a card whose only hop moves it `todo → doing` (status) and leaves it workable → `stopReason` `no_progress`, report contains `เหตุที่จบรอบ: มีงานที่ยังทำต่อได้ แต่ไม่คืบ` and does **not** contain `ทำ 0 รอบ`.
   - `:331` (single worker, `ทำ 2 รอบ`) and `:458` (`ทำ 1 รอบ`, stopped once) stay green **unchanged**.

Closed file list (anything else → `## Questions` first): `src/runner/main.ts`, `src/runner/main.test.ts`. No new file, no `openapi.json` change, no front step (no shape change — SPEC-116 D4 Consumers).

## Definition of Done
- [ ] 1. Before: `git status --short --untracked-files=all | wc -l` → `0` (base: `0` on `7956aa7`, SA 16:4x)
- [ ] 2. `bun --no-env-file test src/runner/main.test.ts` → `0 fail`, 63 tests or more, both new cases named in the output (base: `61 pass · 0 fail · Ran 61 tests across 1 file`, SA 16:4x on `7956aa7`)
- [ ] 3. `grep -n "รอบแล้วไม่คืบ" src/runner/main.test.ts` → `:331`'s `ทำ 2 รอบ` and `:458`'s `ทำ 1 รอบ` lines unchanged, plus the new case's `ทำ 2 รอบ` (base: two hits, `:331`, `:458`, SA 16:4x)
- [ ] 4. `bunx tsc --noEmit -p .` → exit `0` (base: `0` on `7956aa7`, SA 16:4x)
- [ ] 5. `bun --no-env-file test --timeout 30000` (whole suite) → only the known `src/runner/settings.test.ts` fail (base: `893 pass · 1 skip · 1 fail`, TASK-147 § Review on the same code, SA 16:0x)
- [ ] 6. After: `git status --short --untracked-files=all` → exactly ` M src/runner/main.ts` and ` M src/runner/main.test.ts`; `pgrep -fc 'output-format [s]tream-json'` → `0` (base: n/a — new: the list is this TASK's)

## Implementation Notes
Built in `caw-back` on `7956aa7`, nothing committed by me, only the two closed-list files touched. Every command ran as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`; no live hop, no real DB.

**What changed**
- `main.ts`: `const PROGRESS = new Set<HopOutcome>(["handed_off", "status"])` (comment points at SPEC-116 D4). At `case "finish_run"` the card's ended, non-`interrupted` hops of the run are sorted newest first by id (same comparator as the limit check); `n` = the index of the first `PROGRESS` hop (all of them if none). `n > 0` → the sentence exactly as before with `${n}`; `n === 0` → falls through to `endRun(…, action.reason)` with no words, so the run gets the generic `มีงานที่ยังทำต่อได้ แต่ไม่คืบ`.
- `main.test.ts`: two cases next to the round-1 one, plus the `mkWorker` import.

**Declared decision:** the variable is `n` (kept from round 1) rather than `turns`; nothing outside sees it.

**Evidence (real output)**
- DoD 1: `git status --short --untracked-files=all | wc -l` → `0` at start (HEAD `7956aa7`).
- DoD 2: `bun --no-env-file test src/runner/main.test.ts` → `63 pass · 0 fail · Ran 63 tests across 1 file` (base 61). The new cases: `SPEC-116 D4 (AC-4, TEST-116 S2): comment, hand off to a second worker, who only comments twice → …` — hops read back `[first commented, first handed_off, second commented, second commented]`, `stopReason no_progress`, report has `ทำ 2 รอบแล้วไม่คืบ`, not `ทำ 4 รอบ`; and `SPEC-116 D4 (reachable 0): … todo → doing …` — hops `[status]`, `stopReason no_progress`, report has `เหตุที่จบรอบ: มีงานที่ยังทำต่อได้ แต่ไม่คืบ`, not `ทำ 0 รอบ`. A second worker was possible in the stub harness (chain member + edge, the first worker's fake hop calls `POST …/handoff`), so no question was needed.
- DoD 3: `grep -n "รอบแล้วไม่คืบ" src/runner/main.test.ts` → `:331` (`ทำ 2 รอบ`, unchanged), `:352` (new, `ทำ 2 รอบ`), `:490` (was `:458`, `ทำ 1 รอบ`, unchanged — the line number moved because the new cases sit above it).
- DoD 4: `bunx tsc --noEmit -p .` → exit `0`.
- DoD 5: whole suite `--timeout 30000` → `895 pass · 1 skip · 1 fail · Ran 897 tests across 71 files`; the fail = the known `withReadGuard … PreToolUse hook` (`settings.test.ts`).
- DoD 6: `git status --short --untracked-files=all` → ` M src/runner/main.test.ts`, ` M src/runner/main.ts`; `pgrep -fc 'output-format [s]tream-json'` → `0`.

**UNVERIFIED:** no live hop (guardrail). I did not run the new case (a) against the old count to watch it fail; by reading, the old filter would give 4.

## Questions

## Review
**DONE** — Silver, 2026-10-30 16:4x, on caw-back `7956aa7` + the 2 paths.
- Scope: `git status --short --untracked-files=all` → ` M src/runner/main.test.ts`, ` M src/runner/main.ts` only; numstat 34/1 (test), 13/3 (main). Closed list kept.
- `main.ts` against SPEC-116 D4: `PROGRESS = {handed_off, status}` (the D4 table); the run's ended, non-`interrupted` hops on the card sorted newest first by id (same comparator as `:198`); `n` = the index of the first progress hop, or all of them if there is none. `n > 0` → the sentence unchanged with `${n}`; `n === 0` → falls through to `endRun(…, action.reason)` with no words = `stopWords.no_progress` (Q4a, accepted by the PM). The comment's "a file written alone is not visible" = Q4b. Variable name `n` is fine (it is internal).
- Tests read: (a) S2 is built with a real second chain member + edge and a real `POST …/handoff`, and the read-back hops are `[first commented, first handed_off, second commented, second commented]`, so it is AC-4's Given exactly. It asserts `ทำ 2 รอบ` and not `ทำ 4 รอบ`; the round-1 count over those 4 hops is 4, so the test pins the fix. (b) the `status`-only case asserts the generic line and not `ทำ 0 รอบ`. `:331` (2) and `:490` (1, was `:458`) are unchanged.
- My re-run: `bun --no-env-file test src/runner/main.test.ts` → `63 pass · 0 fail · Ran 63 tests across 1 file` · `bunx tsc --noEmit -p .` → exit 0. Whole suite: Bob's `895 pass · 1 skip · 1 fail` (known `settings.test.ts`) accepted; nothing outside `main.ts` changed.
- Bob's UNVERIFIED (case (a) not run against the old code) is settled by reading: the old filter has no stop at a hand-off, so it gives 4 and fails the `not.toContain("ทำ 4 รอบ")`. No shape change, so no probe and no front step (SPEC-116 D4).
