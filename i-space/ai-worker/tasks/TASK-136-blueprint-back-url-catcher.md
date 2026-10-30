# TASK-136: blueprint-back — Blueprint stores every address the user wrote that no part holds (REQ-114 round 2)
- Source: SPEC-111 § Round 2 (E14)
- Owner: BE (Jason)
- Status: DONE (2026-10-30 12:2x, Sober — § Review)
- Depends on: **REQ-105 (TASK-113) committed (`e4b2579`, pushed)** in blueprint-back (SPEC-111 § Round 2 Order, F-013) ✓

## What to do
Read SPEC-111 § Round 2 first. Line numbers below are from `e2c3326`; re-find them after the commits before this one.
1. **E14, `src/interview/round.ts`.**
   - A function `uncaughtUrls(message, liveParts, entries)` returns the URLs that need a server item, exactly per E14: the regex, trailing-punctuation strip, `isApiPath` (export it from `registry.ts` if it isn't yet), dedupe, max 20; "held" = in the title or body JSON of a non-question part (live, or a kept part.add/part.update entry), compared without a trailing `/`.
   - Before **each** apply attempt in `applyAnswer`, add one `server:url <n>` entry per URL, as E14 specifies (`part.add` api, `$url_<n>`, title = URL cut at 80, body `{ method: "GET", path }`, origin `team-proposed`).
   - Record each in the adjustments as `url_kept`, with the stored key.
   - This also holds on the failed-bot path (D-023's `fail` → `applyAnswer(planOf(NO_REPLY), …)`) when the round has a message. A URL item counts as a decision there, so the set is applied.
2. `Adjusted.what` + `src/http/routes/rounds.ts:23` enum gain `"url_kept"`; re-emit `openapi.json`.
3. **Tests**, new `test/interview/url-catcher.test.ts` + fixtures:
   - (a) **AC-4 rebuilt replay.** Round 1's stub answer is rebuilt from `<workspace>/i-space/ai-worker/tests/harness/test-111/ac1-round1-spec.json`: the model's stored parts as `part.add` changes, with **no** `api` part. Copy it into a fixture under `test/` and mark `_note` REBUILT. Message = `spec.txt`'s text, also copied into the fixture. Round 2 = accept the offered questions (stub reply with no changes). Then: after round 1, `:4200/health`, `:3100`, `:4500/health` and `:3500` are each in a stored **non-question** part (4 server `api` parts, unless a rebuilt model part already holds one). `:3900` is **not** duplicated (WRK-001 holds it). `roundAdjusted` has one `url_kept` per server part, with its key. Round 2 adds no further URL part.
   - (b) A model that times out (`bot_could_not_answer`) on a message with 1 URL → the URL is stored, the status stays `bot_could_not_answer`, `url_kept` is recorded.
   - (c) "ลองใหม่" on that round → no second part for the same URL.
   - (d) A URL only inside a question's text is caught. A URL in a model `api` part (E13) is not duplicated. Trailing `.` / `)` is stripped. `ftp://…` is ignored.
4. Existing tests: list each changed one with why. In particular, rounds whose stub message contains a URL may gain a part.

Closed file list: `src/interview/round.ts` · `src/spec/registry.ts` (export `isApiPath` only) · `src/http/routes/rounds.ts` · `openapi.json` · `test/interview/url-catcher.test.ts` + fixture(s) under `test/fixtures/` · existing tests per step 4. Every `bun` command is prefixed `DATABASE_URL=pglite:memory`. No live gateway. No git.

## Definition of Done
- [x] 1. Before: `git status --short` → empty, HEAD = `e4b2579` (base: empty, HEAD `e4b2579`, Sober 12:0x after the commit)
- [x] 2. `grep -c url_kept openapi.json` → ≥ 1 (base: `0`, Sober 10:3x)
- [x] 3. Tests 3(a)–(d) pass, real output pasted (base: n/a — new file)
- [x] 4. `bun test --timeout 30000` → 0 fail; counts pasted; every changed test listed (base: `302 pass / 16 skip / 0 fail`, TASK-113 review, the tree now committed as `e4b2579`)
- [x] 5. `bunx tsc --noEmit` → exit 0 (base: exit 0, Sober 09:3x)

## Implementation Notes
(Jason, BE — 2026-10-30. Every `bun` command ran as `DATABASE_URL=pglite:memory bun …`, in `blueprint-back`. No gateway call, no git.)

**Changed (closed list, nothing else):**
- `src/spec/registry.ts` — `isApiPath` exported (one word).
- `src/interview/round.ts` — `uncaughtUrls(message, live, entries)` (regex `https?://[^\s<>"'()[\]{}]+`, strip trailing `.,;:!?`, `isApiPath`, dedupe, max 20; held = URL without trailing `/` occurs in title+body JSON of a non-question part, live or in the kept `part.add`/`part.update` entries). `applyAnswer` runs it at the top of **each** loop attempt and appends `server:url <n>` (`part.add` api, `$url_<n>`, title = URL cut at 80, body `{method:"GET", path}`, `team-proposed`), plus a `url_kept` adjustment. `adjustedRecord` takes the store's `keys` so a `url_kept` entry names its stored key (other adjustments unchanged: key stays null). `decided` also counts an uncaught URL, so D-023's failed-bot path and a `changes_rejected` round apply the set.
- `src/http/routes/rounds.ts` — enum + `"url_kept"`; `openapi.json` re-emitted.
- New: `test/interview/url-catcher.test.ts` (6 tests), `test/fixtures/url-catcher-round1.json` (`_note` REBUILT), `test/fixtures/url-catcher-message.txt` (= `tests/harness/test-106/spec.txt`, the spec the live run sent; TASK said `spec.txt`, test-111 has none).

**Decided myself (invisible to the API):** (1) ~~`n` = the address's place among all the message's addresses, bumped past any `$url_<n>` ref the model itself used~~ — wrong. Real rule (REWORK 2026-10-30): `uncaughtUrls` returns plain `string[]`; the caller numbers each with the lowest `$url_<n>` not yet used in this attempt's entries (no ref clash → no integrity 500; a held address takes no number). (2) "held" is the spec's literal substring test on the URL without a trailing `/`; so `http://h:3900` counts as held by a part that says `http://h:3900/api` (a prefix). (3) The rebuilt round-1 answer = all 32 non-question parts/links of `ac1-round1-spec.json` as `part.add`/`link.add` (saidBy inferred) + its 2 questions; no `api` part.

**DoD evidence:**
1. Before: `git status --short` → empty; `git log --oneline | head -1` → `e4b2579 feat: seam v2 …`.
2. `grep -c url_kept openapi.json` → `1` (diff: only `"op_renamed"` → `"op_renamed", "url_kept"`).
3. `bun test test/interview/url-catcher.test.ts --timeout 30000` → `6 pass / 0 fail / 36 expect()`: (a) AC-4 replay: 4 server `api` parts for :4200/health, :3100, :4500/health, :3500 (each in exactly one stored non-question part); :3900 held by WRK-001 only, not duplicated; `roundAdjusted` = 4 `url_kept` with their keys (also equal to the stored bot row); round 2 (accept Q-001, Q-002) adds none · (b) timeout on 1 URL → `bot_could_not_answer`/`timeout`, 1 gateway call, API-001 stored, `url_kept` recorded, bot row has the change set · (c) retry → `no_changes`, still 1 api part · (d) URL only in a question's text caught; a model `api` part (E13) not duplicated (with or without trailing `/`); `.` `)` stripped; `ftp://` ignored; same URL twice → once. Extras: live non-question holds, live question does not; 25 addresses → 20 read; model api part refused (bad method) → round `changes_rejected` yet the address is stored.
4. `bun test --timeout 30000` → `308 pass / 16 skip / 0 fail` (base 302 + 6 new). **No existing test changed** — none of them has a stub message with an http(s) URL.
5. `bunx tsc --noEmit` → exit 0.

UNVERIFIED — the rebuilt replay is not the live reply (`roundRaw` was null); only QA's live run (the owner's word) settles AC-2/AC-4 against the real model. The `fail` path was proved with a real timeout stub, not a recorded failure.

**Rework (Jason, 2026-10-30):** `uncaughtUrls` now returns `string[]` (the unused `n` and `i + 1` removed); caller reads `for (const url of …)`; comment's last sentence = "The caller numbers each with the lowest `$url_<n>` not yet used in this attempt's entries"; note (1) corrected above. Only `src/interview/round.ts` and this file changed.
- `bunx tsc --noEmit` → `tsc=0`
- `bun test test/interview/url-catcher.test.ts --timeout 30000` → `6 pass / 0 fail / 36 expect()`
Full suite not re-run (per Sober: removing an unused field).

## Questions

## Review
**REWORK: XS, comment and unused field only; the behaviour is accepted** (Sober, 2026-10-30 12:2x).

What I re-ran (blueprint-back, `DATABASE_URL=pglite:memory`): `git status --short` → the 4 closed-list files + 3 new test files only · `bunx tsc --noEmit` → exit 0 · `bun test test/interview/url-catcher.test.ts --timeout 30000` → `6 pass / 0 fail / 36 expect()` · `bun test --timeout 30000` → `308 pass / 16 skip / 0 fail` (324 tests, 43 files) · `grep -c url_kept openapi.json` → `1` (diff: the enum line only). The replay message = `test-106/spec.txt`, which is exactly the file `tests/harness/test-111/ac1-live.mjs:17` sent. Accepted.

Against E14, all as specified:
- regex, trailing-punctuation strip, `isApiPath`, dedupe, cap 20;
- "held" = a non-question part's title or body, live or in a kept add/update;
- runs at the top of each attempt;
- stores a `team-proposed` api part and records `url_kept` with the stored key from `r.keys`;
- D-023's failed-bot path via `decided`, and the `changes_rejected` case (your extra test).

Your decisions (2) "a prefix counts as held" and (3) "rebuilt answer = all 32 non-question items" are accepted, `[team-proposed]`.

**The one fix:** the code and your note (1) disagree on `n`.
- `uncaughtUrls` returns `{ url, n }`, and its comment says "`n` numbers each by its place among all the message's addresses". The caller ignores that `n` (`for (const { url } of …)`) and takes the lowest `$url_<n>` ref not yet used. Your test pins that (`url-catcher.test.ts:68`: `server:url ${i + 1}` over the stored ones, so :3900, being held, takes no number).
- The loop's behaviour is the right one (no ref clash, simple). Keep it and make the rest match:
  1. `uncaughtUrls` returns `string[]` (drop `n` and the `i + 1`); the caller reads `for (const url of …)`.
  2. The comment's last sentence becomes: the caller numbers each one with the lowest `$url_<n>` not yet used in this attempt's entries.
  3. Correct note (1) in § Implementation Notes: strike it through and write the real rule under it.
- Re-run after it: DoD 3 (the new file) and DoD 5 (tsc). The full suite does not need a re-run for removing an unused field; paste only those two.

**DONE** (Sober, 2026-10-30 12:2x, after the XS rework). Re-ran: `uncaughtUrls(...): string[]` (`round.ts:256`), returns `all.filter(...)` (`:268`), caller `for (const url of …)` (`:610`), comment `:252` states the lowest-unused `$url_<n>` rule; note (1) struck through and corrected. `bunx tsc --noEmit` → exit 0 · `bun test test/interview/url-catcher.test.ts --timeout 30000` → `6 pass / 0 fail / 36 expect()`. Full suite from the first review stands (`308 pass / 16 skip / 0 fail`; the rework only removes an unused field). Tree: the 4 closed-list files + 3 new test files. `openapi.json` carries `url_kept` → TASK-137 released.
