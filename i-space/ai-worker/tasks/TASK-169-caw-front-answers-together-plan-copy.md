# TASK-169: caw-front — chat questions answered one by one and sent as one message; start waits for every answer; a plan copy shows as accepted (REQ-126)
- Source: SPEC-125 D1, D2, D3, D5 (+ `gen:api` for D4/D7's codes)
- Owner: FE (Fanta)
- Status: DONE (2026-10-31 02:1x, Silver — § Review) · was REVIEW (Fanta, 2026-10-31) — steps 1–8 all done (step 6 `gen:api` after TASK-168 DONE; step 8 added by Silver) — was: REVIEW with step 6 open — was: IN_PROGRESS — was: TODO (2026-10-31 01:5x, Silver) — D1–D3/D5 may start now; step 6 (`gen:api`) waits for TASK-168's `openapi.json`
- Depends on: REQ-125 front committed (ce5ca8d) ✓ · TASK-168 (openapi.json, step 6 only)
- Git: none

## What to do
Closed file list (caw-front): `src/components/chat/Chat.tsx`, `src/components/Board.tsx`, `src/lib/crew.ts`, `src/lib/crew.test.ts`, `src/words.ts`, `src/api/schema.d.ts` (by `gen:api` only), and **any test file the change makes fail** — name each in Implementation Notes with why.

1. **D1** the open message's questions keep a local `answers` map: "ตามนั้น" → the default; `ตอบเอง…` → a small box under that question (`พิมพ์คำตอบของข้อนี้`) + `ใช้คำตอบนี้`; answered → `ตอบแล้ว · <answer>` + `แก้`. When the last is answered, post **one** message: the `ข้อ <n>: <answer>` lines. Board: "ตามนั้นทุกข้อ" and its single AskSheet post the same form.
2. **D2** `answeredWith(chat, asked, i)` by question index, with the SPEC's result table: the new line form, then the old `ตามนั้น — <default>`, then a single question's typed text, else `null`.
3. **D3** `ProposalCard` gets `unanswered`; with `> 0` the agree button is disabled, and `ยังตอบคำถามไม่ครบ — เหลืออีก {n} ข้อ` shows.
4. **D5** `crew.ts` `samePlan(a, b)` (same length; each index: trimmed title, anchor key, worker); an open proposal equal to an accepted one shows `แผนนี้ตกลงไปแล้ว` and no agree block; `newestOpen` skips it.
5. **Words** (PM 01:4x), in `src/words.ts`: `oneAnswer.line(n, answer)` = `ข้อ ${n}: ${answer}` · `oneAnswer.ownPlaceholder` = `พิมพ์คำตอบของข้อนี้` · `oneAnswer.useOwn` = `ใช้คำตอบนี้` · `oneAnswer.edit` = `แก้` · `agreeStart.left(n)` = `ยังตอบคำถามไม่ครบ — เหลืออีก ${n} ข้อ` · `agreeStart.alreadyAccepted` = `แผนนี้ตกลงไปแล้ว`. Keep `oneAnswer.posted`.
6. After TASK-168's `openapi.json`: `bun run gen:api`.
7. **Tests** (`crew.test.ts`): D2's four result-table rows; `samePlan` equal / title differs / order differs; the one-message text for 4 answers (`ข้อ 1: …` … `ข้อ 4: …`).
8. **(added 2026-10-31 02:0x by Silver — the gap Fanta found, mine: SPEC-125 D5 named only the card and `newestOpen`)** `crew.ts` `proposalWaits`: an open proposal that `isPlanCopy` is not "waiting for the agreement", so the Board's notice does not say `รอคุณตกลง` for a copy. One `crew.test.ts` case: the newest reply's only open proposal is a copy → `false`.

## Definition of Done
From caw-front.
- [ ] 1. `git status --short` → only the closed list (base: empty, SA 01:4x on ce5ca8d)
- [ ] 2. `bun run typecheck` → exit 0 (base: exit 0, SA 01:1x on the same content)
- [ ] 3. `bun test src` → 0 fail, ≥ 368 tests (base: `361 pass · 0 fail`, SA 01:4x)
- [ ] 4. `git diff src/api/schema.d.ts` → only the 409 list text with the two new codes (base: n/a — needs TASK-168's openapi)
- [ ] 5. Seen in the running app (`bun run dev:mock`, a mock reply with 4 questions; add one to the mock's seed only if none exists, and name the file): screenshots under `ai-worker/tests/harness/task169/`:
  - (a) after "ตามนั้น" on q1: q1 `ตอบแล้ว`, q2–q4 still with their pair, agree disabled with `เหลืออีก 3 ข้อ`;
  - (b) after the 4th: one operator message with 4 `ข้อ n:` lines.
  (base: today one "ตามนั้น" closes all four — TEST-122 F-1)
- [ ] 6. `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → all pass, or each changed e2e named with why (base: `276 passed` on a009d2c, Fanta's TASK-165 run)

## Implementation Notes
Fanta (FE, B), 2026-10-31. `caw-front`, branch `atom`, HEAD `ce5ca8d` before and after, no git. Before: `git status --short --untracked-files=all | wc -l` → `0`. After: 9 modified, no new file; `tsconfig.json` untouched (`git diff --stat tsconfig.json` empty).

**Step 6 (`gen:api`) is NOT done.** TASK-168 is BLOCKED on the board (Bob, Q1), so its `openapi.json` is not final: caw-back's working-tree one already differs from my `schema.d.ts` (the 409 list text), but I will not generate from a file that may still move. `src/api/schema.d.ts` is untouched; DoD 4 is open until Silver says TASK-168's file is final.

**What changed (D1–D3, D5, words):**
- `words.ts`: `oneAnswer.line/ownPlaceholder/useOwn/edit`, `agreeStart.left/alreadyAccepted` — the PM's words exactly; `oneAnswer.posted` kept.
- `crew.ts`: `acceptText(answers, from = 1)` = `ข้อ {n}: {answer}` lines; `answeredWith(chat, asked, i)` by question index with the SPEC's four rules (an answer typed on several lines keeps them: a line that does not begin `ข้อ n:` belongs to the one before); `samePlan(a, b)` (length; per index trimmed title, anchor key, worker); `isPlanCopy(p, all)` (open and equal to an accepted one — so `newestOpen` and the card share one rule).
- `Chat.tsx`: local `answers` map keyed by the open message (lost on reload); `ตามนั้น` sets the default and posts nothing; `ตอบเอง…` opens a small box under that question (`พิมพ์คำตอบของข้อนี้`, focused) with `ใช้คำตอบนี้` (off while empty; trimmed); an answered question reads `ตอบแล้ว · <answer>` + `แก้`; the last answer posts ONE message (`postMessage`, one chat hop); the one filled `ตามนั้น` moves to the first unanswered question; `ProposalCard` gets `unanswered` (off + `ยังตอบคำถามไม่ครบ — เหลืออีก {n} ข้อ`, replacing `answerFirst` while questions are open) and `copy` (badge `แผนนี้ตกลงไปแล้ว`, no agree block); `newestOpen` skips copies.
- `Board.tsx`: `acceptInChat(key, answers, from)` — `ตามนั้นทุกข้อ` posts the `ข้อ n:` form for all; **a single question's `ตามนั้น` posts its own number** (`ข้อ {i+1}: …`) — see Interpreted below.
- `mock.ts` (**outside the closed list; the TASK allows it and says to name it**): state `entry-asked-four` — the seed's reply M4 asks four questions (the two of `entry-asked-two` + two more). No such state existed.
- Tests: `crew.test.ts` — the old `acceptText/answeredWith` block rewritten (line form; the SPEC's four result-table rows; multi-line answer; missing question / no message → null), `samePlan` ×3, `isPlanCopy` ×2; `words.test.ts` (+ the new words, inside two existing tests).

**Interpreted (one line each):** the SPEC says the Board's single-question path posts `ข้อ 1:`; with 2+ questions each AskSheet is one question of several, so I post its real number (`ข้อ 2:` for the second) — that is what D2 reads back by index. · A failed post keeps the answers on the screen; `แก้` then re-answering the last one posts again. · `?answer=1` (the board's `ตอบเอง…` link) still lands on the chat with the main box focused — D1 says the main box is not used for the answers, but the TASK did not ask to change that arrival, so I left it.

**Test files the change made fail, and why (each updated):**
- `tests/board.spec.ts:183` and `:208` — asserted the posted text `ตามนั้น — …`; now the `ข้อ n: …` lines (`oneAnswer.line`).
- `tests/chat.spec.ts:288` — asserted that `ตอบเอง…` focuses the main box; now it opens the small box under the question, focused and empty (the main box is not focused).
- `tests/chat.spec.ts:301` — asserted the reason `ตอบคำถามของ ปลา ก่อน`; with one question unanswered it now reads `เหลืออีก 1 ข้อ`.
- `tests/chat.spec.ts` +3 new e2e (`answers together · four open questions`, seed `entry-asked-four`): `ตามนั้น` on q1 posts nothing and shows `เหลืออีก 3 ข้อ`; `แก้` takes it back (4); the 4th answer sends exactly one message with the four lines (q2 typed), after which all four questions read `ตอบแล้ว · …`.

**DoD (my run, 2026-10-31)**
1. `git status --short --untracked-files=all` → 9 ` M`: `mock.ts`, `Board.tsx`, `Chat.tsx`, `crew.test.ts`, `crew.ts`, `words.test.ts`, `words.ts`, `tests/board.spec.ts`, `tests/chat.spec.ts` — on the closed list: `Board.tsx`, `Chat.tsx`, `crew.ts`, `crew.test.ts`, `words.ts`; test files the change touches: `words.test.ts`, `tests/board.spec.ts`, `tests/chat.spec.ts`; named by the TASK's own allowance: `mock.ts` ✓
2. `bun run typecheck; echo $?` → `0` ✓
3. `bun test src` → `368 pass · 0 fail`, `Ran 368 tests across 27 files` (base 361, +7) ✓
4. **NOT RUN** — waits for TASK-168's `openapi.json` (step 6).
5. Screenshots `tests/harness/task169/` (script `tests/harness/task-169-shot.mjs`, state `entry-asked-four`, light, 390 and 1280): `a-after-q1-{390,1280}.png` and `b-sent-{390,1280}.png`. I opened `a-after-q1-390.png`: q1 `ตอบแล้ว · ไม่นับ` + `แก้`; q2–q4 each with its pair (the filled `ตามนั้น` on q2); `ตกลง เริ่มงาน` greyed with `ยังตอบคำถามไม่ครบ — เหลืออีก 3 ข้อ`. `b-sent-390.png`: one operator message `ข้อ 1: ไม่นับ / ข้อ 2: ผู้จัดการอาคาร / ข้อ 3: ไม่ต้อง / ข้อ 4: แสดงเป็นสีเทา`, and `ตกลง เริ่มงาน` on again. The script printed the same texts at 1280, operator messages 2 → 3, `sideways: false` both. I did not open the two 1280 PNGs ✓
6. `NEXT_DIST_DIR=.next-f bun run build` → `0`; `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → `279 passed (2.6m)` (base 276; +3 new; the four changed ones named above) ✓ · `ss -ltn | grep -cE ':351[0-9] '` → `0` (3512 stopped by its pid).

**UNVERIFIED:** `/impeccable audit` and `/simplify` (skill absent in this session, as before) · the `แผนนี้ตกลงไปแล้ว` badge on a screen (no mock state has an open copy of an accepted plan; the rule is unit-tested, the render is read, not seen) · the `ตอบเอง…` box on screen (covered by e2e, not shot) · `เหลืออีก` with the board's `Board.tsx` `proposalWaits` line: the board still says `รอคุณตกลง` for an open copy (SPEC D5 names only the card and `newestOpen`) · real caw-back.

**Step 8 (added by Silver 02:0x) — done, Fanta 2026-10-31:** `crew.ts` `proposalWaits` now also requires `!isPlanCopy(p, proposals)`, so the Board's `รอคุณตกลง` notice does not show for an open copy of an accepted plan. `crew.test.ts` +1 test (3 expects): the newest reply's only open proposal is a copy → `false`; the same plan with a changed title → `true`; a copy beside another open proposal → `true`. Re-run: `bun run typecheck` → `0` · `bun test src` → `369 pass · 0 fail`, `Ran 369 tests across 27 files` (+1) · `NEXT_DIST_DIR=.next-f bun run build` → `0` · e2e → `279 passed (2.7m)` (no e2e changed; none reaches a copy) · `git status` → the same 9 paths, `tsconfig.json` untouched, no 351x port. The "board still says `รอคุณตกลง`" item is gone from UNVERIFIED. **Step 6 / DoD 4 — done, Fanta 2026-10-31 (after Silver's "TASK-168 DONE, openapi.json final"):** `bun run gen:api` → `git diff --stat src/api/schema.d.ts` → `20 insertions(+), 20 deletions(-)`; every changed line is the 409 list text, `… wrong_role · review_note_missing` → `… wrong_role · review_note_missing · plan_already_accepted · temp_folder_in_work` (the two new codes), nothing else. `cmp <(bunx openapi-typescript ../caw-back/openapi.json) src/api/schema.d.ts` → `match`. `bun run typecheck` → `0` · `bun test src` → `369 pass · 0 fail` · `git status` → 10 ` M` (the 9 above + `schema.d.ts`), `tsconfig.json` untouched, no 351x port. **e2e not re-run after `gen:api`:** the change is comment text in a `.d.ts` (no emitted code); the last e2e (`279 passed`, step 8) ran on the same source otherwise. **UNVERIFIED** for that reason only.

## Questions

## Review

**2026-10-31 02:0x, Silver — interim (not a verdict yet: step 6 waits for TASK-168, step 8 added).**
- Re-run by me on caw-front ce5ca8d + 9 paths: typecheck exit 0 · `bun test src` → `368 pass · 0 fail` · `tsconfig.json` untouched. Opened `a-after-q1-1280.png`: q1 `ตอบแล้ว · ไม่นับ` + `แก้`, q2–q4 with their pairs (the filled `ตามนั้น` on q2), `ตกลง เริ่มงาน` greyed with `ยังตอบคำถามไม่ครบ — เหลืออีก 3 ข้อ` — D1/D3 as specified.
- Accepted: the Board's single AskSheet posting its **real** number (`ข้อ {i+1}:`) — that is what D2 reads back; my SPEC's "ข้อ 1" was imprecise. `mock.ts` state `entry-asked-four` and the four changed e2e (named, with why) are within the TASK's allowance. Leaving the `?answer=1` arrival as it is: fine.
- **Step 8 added** (Fanta's UNVERIFIED note found it): `proposalWaits` must skip a plan copy — my D5 missed the Board's notice.
- Still open: step 6 (`gen:api` after TASK-168 is DONE — I tell you), step 8, then DoD 4 and a re-run of DoD 3/6.

**2026-10-31 02:1x, Silver — DONE (final).**
- Steps 6 and 8, re-run by me on caw-front ce5ca8d + 10 paths: the `schema.d.ts` diff = only the 409 list text gaining `plan_already_accepted · temp_folder_in_work` (20 places, one per route) · `gen:api` again → byte-identical (= TASK-168's final `openapi.json`) · typecheck exit 0 · `bun test src` → `369 pass · 0 fail` · `tsconfig.json` untouched · `proposalWaits` skips an `isPlanCopy` proposal (`crew.ts:77-82`).
- With the interim review above: D1–D3, D5, D2's result table and step 8 are met. e2e `279 passed` is Fanta's run (not re-run by me). The `แผนนี้ตกลงไปแล้ว` badge on screen and the Board's notice for a copy = QA (AC-3), as she wrote. tree-fp 02:1x: caw-front `f91e9b59a4f2`.
