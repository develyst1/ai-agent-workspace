# TASK-137: blueprint-front — the chat names each address Blueprint kept (REQ-114 round 2)
- Source: SPEC-111 § Round 2 (E14b)
- Owner: FE (Fern)
- Status: DONE (2026-10-30 12:3x, Sober — § Review)
- Depends on: TASK-136 DoD 2 · blueprint-front's previous topic committed (`282e426`, REQ-105 / TASK-140, pushed 2026-10-30)

## What to do
1. `bun run gen:api`.
2. `src/features/chat/load.ts` `adjustedLines` (`:108-118` today): besides `field_dropped`, a `url_kept` entry gives one line: **"{title} — Blueprint เก็บไว้ใน {key} ให้แล้ว (AI ไม่ได้ใส่ไว้ในสเปก)"**. `{title}` is the URL. `{key}` is the stored key; with no key, use the ref. Put the words in `src/features/chat/words.ts` beside Q5's line. The wording is final: the PM accepted it as written (REQ-114 § Questions Q, 2026-10-30). Update the doc comment at `:31`.
3. Unit tests in `load.test.ts`: one `url_kept` → one line with the URL and key. `url_kept` + `field_dropped` → both lines, in record order. `op_renamed` only → nothing (TASK-131's guard still holds).
4. **Real render:** with TASK-136's back end and a stub whose message holds `http://127.0.0.1:4200/health` and whose answer holds no part for it, the line shows in default, clean-blue, luxury-gold and minimal-mono. Behind "ดูรายละเอียด" is fine (TEST-107 Q7). Screenshots go in `tests/harness/task-137/`.

Closed file list: `src/core/api/schema.d.ts` · `src/features/chat/load.ts` · `src/features/chat/words.ts` · `src/features/chat/load.test.ts`. No git.

## Definition of Done
- [x] 1. `bun run check:api` → matches (base: matches, Sober 22:3x / TASK-131)
- [x] 2. `bun run typecheck` → exit 0 · `bun test src` → 0 fail, 235 + your new tests (base: exit 0 · `235 pass / 0 fail`, TASK-133 09:5x)
- [x] 3. 4 screenshots, each with the line (base: n/a — new: `url_kept` does not exist before TASK-136)
- [x] 4. `git status --short` → only the 4 closed-list paths (base: empty after `282e426`)

## Implementation Notes
Fern, 2026-10-30 ~12:5x. `blueprint-front`, branch `atom`, HEAD `282e426`, tree clean before. No git write run.
1. `bun run gen:api` → `schema.d.ts` 1 line changed (`what` union gains `"url_kept"`).
2. `words.ts`: `urlKept(url, key)` = "{url} — Blueprint เก็บไว้ใน {key} ให้แล้ว (AI ไม่ได้ใส่ไว้ในสเปก)" — the PM's wording verbatim, beside `fieldDropped`. `load.ts`: `adjustedLines` adds a `url_kept` branch (`title` = the address; key → ref; no address or neither key nor ref → no line); doc comments at `:31` and on `adjustedLines` updated. `field_dropped` behaviour unchanged (rewritten from `continue` form to if / else-if, same conditions).
3. `load.test.ts` +3 tests: one `url_kept` → one line, verbatim, also under the reply text · no key → ref; no ref and no key, or no address → nothing · `field_dropped` + `op_renamed` + `url_kept` → both lines in record order, `op_renamed` adds none. TASK-131's op_renamed guard still passes.
4. **Real render:** stub gateway `tests/harness/stub-gateway-137.mjs` (answers "รับทราบครับ" with no part), back end from TASK-136's working tree (`DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:4296 CAW_NOTIFY_URL=`, `BLUEPRINT_GATEWAY_LIVE` unset, :4299), front rebuilt (`bun run build`, gitignored `.next`) and started on :3101. `tests/harness/walk-137.ts` posts "เช็กสถานะบริการที่ http://127.0.0.1:4200/health":
```
stored bot row:  roundStatus applied · roundAdjusted [{"key":"API-001","ref":"$url_1","item":"server:url 1","what":"url_kept","title":"http://127.0.0.1:4200/health"}] · content "รับทราบครับ"
stored api part: API-001 api "http://127.0.0.1:4200/health" body {path, method GET, responses []}
all 4 themes, chat: bot "รับทราบครับ" · "http://127.0.0.1:4200/health — Blueprint เก็บไว้ใน API-001 ให้แล้ว (AI ไม่ได้ใส่ไว้ในสเปก)"     ALL OK: true
```
Screenshots `tests/harness/task-137/<theme>-137-url-kept.png` (4). I read `luxury-gold` by eye (line sits under the reply, wraps cleanly at 1280); the other 3 are confirmed by text match in the page, not by eye — UNVERIFIED by eye. The line is visible without "ดูรายละเอียด".
5. **DoD:** 1. `check:api` → matches ✓ · 2. `typecheck` exit 0; `bun test src` → `238 pass / 0 fail` (235 + 3), `Ran 238 tests across 10 files. [6.05s]` ✓ · 3. 4 screenshots, each page text holds the line ✓ · 4. `git status --short` → exactly the 4 closed-list paths (` M` schema.d.ts, load.test.ts, load.ts, words.ts); `git diff --numstat` 1/1 · 19/0 · 6/5 · 3/0 ✓
6. Footprint: stub (pid 681399), back (681421), front (681422) stopped by pid; `ss -ltn` for 3100–3103 / 4290–4299 → no listeners. In-memory DB only. `/impeccable audit` not run: no layout or style change, one more text line in an existing message block.

## Questions

## Review
**DONE** (Sober, 2026-10-30 12:3x). Re-run by me in blueprint-front:
- `git status --short` → the 4 closed-list paths; `git diff --numstat` → schema.d.ts 1/1 · load.test.ts 19/0 · load.ts 6/5 · words.ts 3/0. The schema diff is only `what` gaining `"url_kept"`.
- `bun run check:api` → matches · `bun run typecheck` → exit 0 · `bun test src` → `238 pass / 0 fail` (235 + 3).
- Code: `urlKept` in `words.ts` is the PM's wording verbatim. `adjustedLines` keeps `field_dropped` exactly (same conditions, if/else-if), adds `url_kept` (title + key → ref; nothing to name → no line), `op_renamed` stays silent.
- **The screenshots, read by eye by me**, including the 3 Fern did not: default, clean-blue and minimal-mono each show under "รับทราบครับ" the line "http://127.0.0.1:4200/health — Blueprint เก็บไว้ใน API-001 ให้แล้ว (AI ไม่ได้ใส่ไว้ในสเปก)", on one line, without "ดูรายละเอียด". luxury-gold read by Fern. All 4 confirmed.
- The real walk used TASK-136's back tree (stored bot row `url_kept` API-001 `$url_1`), with a stub and no live call. Processes stopped, ports free (Fern's note).

