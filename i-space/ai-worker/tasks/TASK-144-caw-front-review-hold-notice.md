# TASK-144: caw-front — the board says which review holds work up ("รอคุณตรวจ: …")
- Source: SPEC-114 (REQ-117, Team B) — D3, D4
- Owner: FE (Fanta)
- Status: **DONE** (Silver, 2026-10-30 15:1x — § Review round 2) · was REVIEW (Fanta, 2026-10-30 14:43; rework round 1 in Notes) — was: **REWORK** (Silver, 2026-10-30 14:4x — § Review: one rule, the SPEC's ambiguity, not your error) · was REVIEW (Fanta, 2026-10-30 14:33) — was: TODO — released 2026-10-30 14:5x (SA)
- Depends on: REQ-105 / REQ-112 committed (7359fa3) in caw-front ✓ · independent of TASK-143 (no API change: the board already has `Card.status` and `Card.dependsOn`, `src/api/caw.ts:73`)

## What to do
Read SPEC-114 D3 and D4. No API, schema or `gen:api` change.

1. **Rule, pure** — new `src/lib/reviewHold.ts`: `reviewHolds(cards: Card[]): { card: Card; waiting: number }[]` — for each **work** card in
   `review`, *waiting* = the work cards not `done` that depend on it directly or through other cards (walk `dependsOn` backwards; each card
   once; cycle-safe). Keep only waiting ≥ 1; order by card number. (The back-end report uses the same rule — SPEC-114 D3.)
2. **Words** — `src/words.ts`: `reviewHold.line(title: string, n: number)` = `รอคุณตรวจ: ${title} — มีอีก ${n} งานรออยู่` — the PM's words
   (REQ-117 § Wording), exactly. No other new words.
3. **Board** — `src/components/Board.tsx`, notices area (`:176-177`): after `Uncovered`, one quiet line per hold (same family/classes as
   `Uncovered`'s box; `role="status"`; the title plain text, real spaces between pieces — your TASK-122 lesson). Nothing when there is none.
   Shown whenever true (D4), computed from the board's `cards` prop — no new prop from the page.
4. **Mock** — first check the default seed: `grep -n 'review' src/api/mock.ts` shows #6 and #7 in review; if any not-done card depends on
   them, the line appears on the default board → list every existing e2e/unit assertion that changes in Notes (do not hide it). Add a
   `MOCK_STATES` state `review-holds`: card #1 in `review`, #2 and #3 `todo` depending on #1 (REQ-117 AC-2's case).
5. **Tests** — `src/lib/reviewHold.test.ts` (new): AC-2's case → one hold, waiting 2; a chain #3 → #2 → #1 counts 2; a done dependant not
   counted; a review card nothing depends on → none; a cycle ends. `src/words.test.ts`: the line, exact. e2e `tests/board.spec.ts` +1: in
   `review-holds` the board shows `รอคุณตรวจ: <#1 title> — มีอีก 2 งานรออยู่`; in a state with no review holding work, no such line.

**Closed file list:** `src/lib/reviewHold.ts` (new), `src/lib/reviewHold.test.ts` (new), `src/words.ts`, `src/words.test.ts`,
`src/components/Board.tsx`, `src/api/mock.ts` (+ `src/api/mock.test.ts` only if a state test needs it), `tests/board.spec.ts`. New paths are
not git-ignored (`git check-ignore -v src/lib/reviewHold.ts` → exit 1, SA 14:4x). Anything else → `## Questions` first. **No git.**

## Definition of Done
- [ ] 1. Before. `git status --short | wc -l` → `0` (base: `0` on 7359fa3, SA 2026-10-30 14:4x)
- [ ] 2. `grep -c 'รอคุณตรวจ' src/words.ts` → `1` (base: n/a — new: `grep -rn 'รอคุณตรวจ' src` → no hit on 7359fa3)
- [ ] 3. `bun test src` → 0 fail, the new reviewHold cases named (base: `Ran 346 tests across 25 files`, `0 fail`, SA 14:4x)
- [ ] 4. `bun run typecheck` → exit 0 (base: exit 0 — SA's TASK-139 review on the tree now committed as 7359fa3)
- [ ] 5. `NEXT_DIST_DIR=.next-f bun run build && NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → 0 failed (base: `274 passed (2.5m)` — SA's TASK-139 review run on the tree now committed as 7359fa3; not re-run at cut)
- [ ] 6. Screenshot at 390 of the board in `review-holds`, light → `tests/harness/task-144/` in the workspace (base: n/a — new state)
- [ ] 7. After: `git status --short --untracked-files=all` → only listed paths; `ss -ltn | grep -cE ':351[0-9] '` → `0` (base: `0` lines and `0`, SA 2026-10-30 14:5x on 7359fa3)

## Implementation Notes
Fanta (FE, B), 2026-10-30 14:28–14:33. `caw-front`, branch `atom`, HEAD `7359fa3` before and after, no git. Before: `git status --short | wc -l` → `0`. After: 5 modified + 2 new files (`src/lib/reviewHold.ts`, `reviewHold.test.ts`), all on the closed list; `tsconfig.json` untouched. No API, schema or `gen:api` change.

**What changed:** `src/lib/reviewHold.ts` `reviewHolds(cards)` — per work card in `review`, waiting = not-done work cards reaching it through `dependsOn` backwards (each once, a visited-set so a cycle ends and the card itself is never counted; it walks through a done card, since a not-done card may wait behind it); only waiting ≥ 1, by card number · `words.ts` `reviewHold.line(title, n)` = the PM's line exactly, no other word · `Board.tsx` one `<p role="status" data-review-hold>` per hold, after `Uncovered` and before the chat-waits line, same box classes as `Uncovered`, title as text in one string (real spaces), computed from the `cards` prop (no new prop) · mock state `review-holds` (card 1 → `review`, cards 2 and 3 `todo` depending on card 1; card 3's old dependency on card 2 is replaced, so waiting is exactly 2) · tests below.

**Default seed checked first (TASK step 4):** probe on `createMockApi()` → `reviewHolds` = `[]` (cards 6 and 7 are in review, nothing depends on them: deps in the seed are only 3→2, 5→12, 12→11). So the line does **not** appear on the default board and **no existing assertion changed**.

**Tests:** `reviewHold.test.ts` +8 (AC-2's case → `[[1,2]]`; chain 3→2→1 counts 2; a card two paths reach counted once; a done dependant not counted, one behind it still is; review with no dependant → none; only a work card in review counts, a question card neither holds nor waits; a cycle ends; several holds in number order) · `words.test.ts` +1 (the line, exact) · `board.spec.ts` +2 (default board: no `[data-review-hold]` and no `รอคุณตรวจ` anywhere; `review-holds`: exactly one line = `รอคุณตรวจ: ออกแบบหน้าค้นหาห้อง — มีอีก 2 งานรออยู่`, `role="status"`).

**DoD (my run, 2026-10-30 14:2x–14:33)**
1. `git status --short | wc -l` before → `0` ✓
2. `grep -c 'รอคุณตรวจ' src/words.ts` → `1` ✓
3. `bun test src` → `355 pass · 0 fail`, `Ran 355 tests across 26 files` (base 346; +8 reviewHold, +1 words) ✓
4. `bun run typecheck; echo $?` → `0` ✓
5. `NEXT_DIST_DIR=.next-f bun run build` → exit `0`; `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → `276 passed (2.6m)` (base 274, +2) ✓
6. `tests/harness/task-144/board-review-holds-390.png` (script `tests/harness/task-144-shot.mjs`): I opened it — the line sits under the uncovered notice, one line at 390, `358x46`, quiet box like its neighbours; text `รอคุณตรวจ: ออกแบบหน้าค้นหาห้อง — มีอีก 2 งานรออยู่`; `sideways: false` ✓
7. After: `git status --short --untracked-files=all` → only the 7 listed paths; `ss -ltn | grep -cE ':351[0-9] '` → `0` (3512 stopped by its pid) ✓

**UNVERIFIED:** `/impeccable audit` and `/simplify` (skill absent in this session, as before) · a long card title wrapping (the box has `break-words`, not tried with a long mock title) · dark mode and 1280 (not asked in DoD 6; the box uses the same tokens as `Uncovered`, which TASK-122 shot in both) · real caw-back (mock only; the rule reads only `status`/`dependsOn`/`kind`, which the API already sends).

**Rework round 1 (Fanta, 2026-10-30 14:43)** — Silver's one rule, applied: `reviewHold.ts` now stops the walk at a **done** card (`if (x.status === "done") continue` before pushing it), so a not-done card that depends on the review only through a done card is not counted; the doc comment says "through other cards that are themselves not done". Test flipped in `reviewHold.test.ts`: `[review #1, done #2 → #1, todo #3 → #2]` → `[]` (was `[[1,1]]`), plus one case that keeps the other path counted (`#4 → #1` directly, with the done chain beside it → `[[1,1]]`). Nothing else touched; `review-holds` and `board.spec.ts` unchanged (AC-2's case has no done card between), so no e2e re-run, as you said.
Re-run: `bun test src/lib/reviewHold.test.ts` → `8 pass · 0 fail` · `bun test src` → `355 pass · 0 fail`, `Ran 355 tests across 26 files` (count unchanged: one test flipped and extended with an assertion, none added) · `bun run typecheck; echo $?` → `0` · `git status --short --untracked-files=all` → the same 7 paths · `ss -ltn | grep -cE ':351[0-9] '` → `0`. The 276-passed e2e line above is from before the rework and is **not re-run** (UNVERIFIED for this edit; the rule file is imported by `Board.tsx`, so a re-run by the SA settles it).

## Questions

## Review
**Verdict: REWORK (round 1)** — Silver (SA), 2026-10-30 14:4x. One change; everything else is accepted as is.
- **The change — walk only through cards that are not done.** `src/lib/reviewHold.ts:20` walks on through a **done** card ("a not-done card
  may wait on it"), and `reviewHold.test.ts:22` pins that. But a card whose own dependencies are all done **is workable** (`back:
  src/cards/view.ts:1-2`), so it does not wait on the review even if the done card between them depends on it — counting it would tell the
  operator more cards wait than do. Fix: push a dependant onto the walk only if it is not `done`; flip test `:22` to "a not-done card behind a
  **done** dependant is NOT counted". **My fault, not yours:** SPEC-114 D3 said "directly or through other cards", which allowed your reading;
  D3 now says "through other cards that are themselves not done" (clarified 14:4x).
- **Accepted (checked, will not re-check unless touched):** default seed probe — no hold (deps 3→2, 5→12, 12→11; #6/#7 have no dependants),
  so no existing assertion changed; scope 5 + 2 on the list; words line exact; visited-set cycle guard; the other 7 tests; your screenshot
  note (line under `Uncovered`, one line at 390). DoD 3/5 numbers will move by the flipped test only.
- **Re-run after the fix:** `bun test src/lib/reviewHold.test.ts` + `bun test src`, `bun run typecheck`; e2e only if `review-holds` or the
  board spec changes (they should not — AC-2's case has no done card in between).
**Round 2 verdict: DONE** — Silver (SA), 2026-10-30 15:1x.
- `src/lib/reviewHold.ts:20`: a done dependant is marked seen and **not** pushed — the walk ends there; a card also reachable by a not-done
  path is still reached that way. Test `reviewHold.test.ts:22-25`: `#3 → #2 done → #1` → `[]`; with `#4 → #1` added → `[[1, 1]]`. Matches
  SPEC-114 D3 (clarified) and TASK-143's report rule.
- **My re-run** (caw-front 7359fa3 + this tree, 7 paths): `bun test src` → `355 pass · 0 fail · Ran 355 tests across 26 files`; `bun run
  typecheck` → `0`; **e2e `276 passed (2.6m)`** — the run she left UNVERIFIED is now done; port 351x free.
- Round 1's accepted items stand. UNVERIFIED (carried): `/impeccable audit`; a very long title; dark/1280 (same tokens as `Uncovered`).
