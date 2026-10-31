# TASK-120: caw-front — the "stopped midway" sentence on the board card and the card page
- Source: SPEC-108 (REQ-111) — D7, § API "Card"
- Owner: FE (Fanta)
- Status: DONE (2026-10-29 15:5x, Silver — § Review) · was REVIEW (Fanta)
- Depends on: REQ-104 committed (1e16d37) in caw-front ✓ · TASK-119 DONE ✓

## What to do

Closed file list (caw-front): `src/api/schema.d.ts` (generated, `bun run gen:api` only) · `src/api/caw.ts` · `src/api/mock.ts` · `src/words.ts` ·
`src/components/Board.tsx` · `src/components/card/CardView.tsx` (and its CSS module if the mark needs a class) · fixtures that build a full
`Card` and stop compiling: `src/api/mock.test.ts`, `src/api/mock-writes.test.ts`, `src/lib/crew.test.ts:11`, `src/components/runs/RunsList.test.tsx:11` ·
one test that the mark renders (unit or `tests/card.spec.ts` / `tests/board.spec.ts`, your choice). No git.

1. `bun run gen:api` (reads `../caw-back/openapi.json`, which TASK-119 re-emitted).
2. `Card` in `src/api/caw.ts:58-75` gains `stoppedMidway: { hopId: string; at: string; reason: string } | null; // REQ-111: the last hop ended without finishing`.
   The HTTP mapper passes it through; the mock sets `null` everywhere **except one seeded `todo` card** that gets
   `{ hopId: <an existing mock hop id>, at: <a fixed time>, reason: "หมดเวลา — ก้าวนี้ใช้เวลานานเกินไป" }`, so the screens can be seen.
3. `words.ts`: `cardMark.stoppedMidway = (reason: string) => \`งานนี้หยุดกลางทาง: ${reason} — รอทำต่อ\`` (REQ-111 wording, exactly).
4. Show it where the other card marks are: `Board.tsx:77-80` (a mark beside "spec เปลี่ยน" / "รอคำตอบ", same chip shape; the stuck
   colour family, as "spec เปลี่ยน" uses) and `CardView.tsx:48-49` (same). On the board the reason may be cut with an ellipsis on one
   line; the full sentence goes in its `title`. On the card page show it whole.
5. Light and dark, 390 / 1280 / 1440: the chip wraps, never pushes the card wider (the `ac5` run covers every screen).

## Definition of Done

- [ ] 1. Before. `cd caw-front && git status --short | wc -l` → `0` (base: `0`, SA re-run 2026-10-29 15:3x after commit 1e16d37)
- [ ] 2. `grep -c stoppedMidway src/api/schema.d.ts` → ≥ `1` (base: `0`, 2026-10-29 15:0x)
- [ ] 3. `bun test src` → 0 fail (base: `334 pass · 0 fail`, `Ran 334 tests across 24 files`)
- [ ] 4. `bun run typecheck` → exit 0 (base: exit 0)
- [ ] 5. `NEXT_DIST_DIR=.next-f bun run build && NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → 0 failed (base: `264 passed (2.7m)`, SA 2026-10-29 15:2x with `.next-sa` / port 3519; tree unchanged at 18 paths after)
- [ ] 6. A screenshot of the seeded card on the board and on its card page, light + dark at 390 px, paths in Implementation Notes (base: n/a — new: the mark does not exist)

## Implementation Notes
Fanta · 2026-10-29 15:42–15:50 · `caw-front` on `atom` @ 1e16d37 · no git write · no live Claude CLI · builds only into `.next-f`.

**DoD**
1. Before (15:42): `git status --short | wc -l` → `0` · `git log -1 --oneline` → `1e16d37 feat: read-only worker screen, corner button, team-down command (REQ-104, TASK-106, TASK-111)`.
2. `bun run gen:api` (plain, no hand edit; reads `../caw-back/openapi.json`) → `git diff --numstat src/api/schema.d.ts` → **6 additions, 0 deletions**: `stoppedMidway: { at: string; hopId: string; reason: string } | null` on the card, with its description. `grep -c stoppedMidway src/api/schema.d.ts` → `1` (the field is one line; base was `0`).
3. `bun test src` → `334 pass · 0 fail · 1325 expect() calls · Ran 334 tests across 24 files` (same count: the mark is covered by the e2e below, as you allowed).
4. `bun run typecheck` → exit 0. Before I fixed the two fixtures it failed in exactly the two files you named: `src/lib/crew.test.ts(9,62)` and `src/components/runs/RunsList.test.tsx(9,7)` (`stoppedMidway` missing). `mock.test.ts` and `mock-writes.test.ts` did not need a change (they build cards through the mock, which now sets it).
5. `NEXT_DIST_DIR=.next-f bun run build` → ✓ Compiled successfully; `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` (15:44 → 15:47) → **265 passed (2.7m)**, exit 0 — 264 + the one new test.
6. Screenshots, relative to `tests/harness/task-120/` (made by `tests/harness/task-120-shots.mjs` against a mock build on :3520, real Chrome, 15:47; server stopped by pid): `board-card-390-light.png`, `board-card-390-dark.png`, `card-page-390-light.png`, `card-page-390-dark.png` (and the same four at 1280 — `-1280-` in the name).

**What changed**
- `src/api/caw.ts`: `Card.stoppedMidway: { hopId: string; at: string; reason: string } | null` (as you wrote it). The HTTP side needed no mapper: `http.ts` passes cards through, and typecheck is clean on the generated type.
- `src/api/mock.ts`: `seed()` defaults it to `null`; the accepted-proposal card builder sets `stoppedMidway: null`; **seeded card 1** (`ออกแบบหน้าค้นหาห้อง`, `todo`, ฝน) gets `{ hopId: id("h", 2) (a seeded hop), at: "2026-10-13T08:03:00+07:00", reason: "หมดเวลา — ก้าวนี้ใช้เวลานานเกินไป" }`.
- `src/words.ts`: `cardMark.stoppedMidway(reason) = \`งานนี้หยุดกลางทาง: ${reason} — รอทำต่อ\`` — REQ-111's row verbatim (`REQ-111 § User-facing wording`); the reason is shown as the back end sends it.
- `Board.tsx`: a chip beside "spec เปลี่ยน" / "รอคำตอบ", same shape and the stuck colour family (`bg-stuck-soft text-stuck`), a `CircleAlert` icon so it is not colour alone, one line (`truncate`) with the whole sentence in `title`, `data-stopped-midway`. `CardView.tsx` + `card.module.css` (`.markStopped`, 3 lines): the same sentence whole, wrapping inside the page.
- `tests/board.spec.ts` (+1 test, `หยุดกลางทาง · …`): exactly one `[data-stopped-midway]` on the board (card 1), its text and `title` equal the sentence, and the card page shows the same sentence whole.

**Measured** (390 / 1280 × light / dark, 8 runs; JSON lines printed by the script): sideways page scroll `0` in all; board chip `244 px` inside a `274 px` card at 390 (`184` in `214` at 1280), inside the card's box every time, cut with an ellipsis in all four (the card is narrow); card page mark `358 × 45 px` at 390 (two lines, wraps, no overflow) and `424 × 26` at 1280 (one line); dark mode shows the stuck colours (screenshot read).
**Honest notes**
- On the board the ellipsis cuts the **whole sentence**, so at 390 only "งานนี้หยุดกลางทาง: หมดเวลา — …" is visible and the tail "— รอทำต่อ" is in the `title` and on the card page. Your text said "the reason may be cut"; keeping the head and tail around a cut reason would mean splitting the sentence in `words.ts`, which I did not do. Say so if the board must always show "รอทำต่อ".
- The seeded reason itself contains an em dash, so the shown sentence has two ("…: หมดเวลา — ก้าวนี้ใช้เวลานานเกินไป — รอทำต่อ"); that is the seed text you gave.
- `tests/ac5.spec.ts` runs on the `operator-like` seed, which has its own cards, so the AC-5 sweep does **not** include the seeded stopped card; my 8 measured runs above are the check for it. `/impeccable audit`: not run (skill not in my session; same as TASK-106).
- `git status --short` after → 10 `M`: caw.ts, mock.ts, schema.d.ts, Board.tsx, CardView.tsx, card.module.css, RunsList.test.tsx, crew.test.ts, words.ts, board.spec.ts — all in the closed list; no `tsconfig.json`, no new files in the repo. Footprint: git-ignored `.next-f/`, `test-results/`; no servers left (`ss … :3510|:3520` → nothing).

## Questions

## Review

**Verdict: DONE** — Silver (SA, Team B), 2026-10-29 15:5x.
- **Against SPEC-108 D7:** `Card.stoppedMidway` typed exactly; `schema.d.ts` from `gen:api` only (+6/0); words = REQ-111's sentence verbatim (`cardMark.stoppedMidway`); a chip beside the other marks on the board (stuck colours + icon, `title` = whole sentence) and the whole sentence on the card page. Matches.
- **Re-run by me:** `bun test src` → `334 pass · 0 fail`; `bun run typecheck` → exit 0; `grep -c stoppedMidway src/api/schema.d.ts` → 1; 10 paths, all in the list. e2e 265 accepted on her output (not re-run).
- **Screens read by me:** `board-card-390-dark.png` (chip inside the card, cut with an ellipsis) and `card-page-390-light.png` (whole sentence, two lines, no sideways scroll).
- **Her note on the board cut — accepted** `[SA-decided]`: at 390 the board shows the head "งานนี้หยุดกลางทาง: หมดเวลา — …"; the tail is in the `title` and on the card page. The task allowed the cut; the PM is told in one line (user-facing copy is the PM's).
- Git: nothing; REQ-111's commit waits for TASK-118 and the owner's word.
