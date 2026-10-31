# TASK-142: blueprint-back — URL catcher: an address stops at Thai text, and "held" means the same address (REQ-116)
- Source: SPEC-113 (E15, E16)
- Owner: BE (Jason)
- Status: DONE (2026-10-30 14:5x, Sober — § Review)
- Depends on: **TASK-117 committed (`ccd32af`, pushed)** in blueprint-back ✓ (F-013, SPEC-113 § Order).

## What to do
Read SPEC-113 first. Line numbers are from `2da175e` and still hold on `ccd32af` (TASK-117 did not touch `round.ts`: `:253` `URL_RE`, `:268` the `includes` test, Sober 14:4x).
1. **E15**, `src/interview/round.ts:253`: `URL_RE = /https?:\/\/[A-Za-z0-9\-._~:/?#@!$&*+,;=%]+/g`.
2. **E16**: one helper `addressesIn(text: string): string[]` = the `URL_RE` matches, trailing `.,;:!?` stripped, each `noSlash`. Use it for the message side (then `isApiPath`, dedupe, cap 20, as today; the stored `path`/title stay the address as written, i.e. the stripped match, **not** the `noSlash` form) and for the held side: `held = new Set(addressesIn(<the joined held text>))`, and an address is held when `held.has(noSlash(url))`. Remove the `text.includes(...)` test. Update the comment above `uncaughtUrls` to say "the same address (E16)".
3. **Tests**, added to `test/interview/url-catcher.test.ts` (a new `describe`/block at the end; do not rewrite the existing tests):
   - (a) AC-1: message `ช่วยตรวจที่http://127.0.0.1:4500/healthทุก 10 วินาที`, stub reply with no part → one api part with `path` exactly `http://127.0.0.1:4500/health`; `url_kept` title the same.
   - (b) AC-2: stub reply adds a non-question part titled `บริการทดสอบ http://127.0.0.1:31000`, message `ตรวจ http://127.0.0.1:3100 ด้วยครับ` → `:3100` kept (one `url_kept`), `:31000` part untouched.
   - (c) A part holding `http://h.test:9/api` does **not** hold the user's `http://h.test:9` (now kept); a part holding `http://h.test:9/` **does** hold `http://h.test:9` (the trailing `/` rule).
   - (d) Thai glued on both sides, `ดูที่http://h.test:7/xแล้วนะ`, → `http://h.test:7/x`.
4. Existing tests: none should change. If one does, stop and ask here (it would mean E16 changed REQ-114 behaviour beyond SPEC-113).

Closed file list: `src/interview/round.ts` · `test/interview/url-catcher.test.ts` (additions only). No `openapi.json` change. Every `bun` command is prefixed `DATABASE_URL=pglite:memory`. No live gateway. No git.

## Definition of Done
- [x] 1. Before: `git status --short` → empty, HEAD = `ccd32af` (base: empty, `ccd32af`, Sober 14:4x)
- [x] 2. `bun test test/interview/url-catcher.test.ts --timeout 30000` → `10 pass / 0 fail` (6 existing + 4 new); paste (base: `6 pass / 0 fail`, Sober 14:4x on `ccd32af`)
- [x] 3. `bun test test/interview/service-urls.test.ts --timeout 30000` → 0 fail (REQ-114 AC-1, unchanged) (base: `url-catcher` + `service-urls` together `8 pass / 0 fail`, Sober 14:4x on `ccd32af`)
- [x] 4. `bun test --timeout 30000` → 0 fail; counts pasted (base: `316 pass / 16 skip / 0 fail`, TASK-117 r2, the tree now committed as `ccd32af`)
- [x] 5. `bunx tsc --noEmit` → exit 0 · `git diff --stat openapi.json` → empty · `git status --short` → the 2 closed-list files only (base: exit 0 · empty · empty, Sober 14:4x on `ccd32af`)

## Implementation Notes
(Jason, BE — 2026-10-30. `bun` runs prefixed `DATABASE_URL=pglite:memory`, in `blueprint-back` at `ccd32af`. No git, no gateway.)

**Changed (closed list):** `src/interview/round.ts` — `URL_RE` = the ASCII class (E15); `stripped(text)` = the matches with trailing `.,;:!?` stripped (the as-written form, used for the message so the stored `path`/title stay as written); `addressesIn(text)` = `stripped` then `noSlash` (E16); `held` = `new Set(addressesIn(<joined held text>))`, an address is held when `held.has(noSlash(url))`; the `includes` test is gone; comment updated. `test/interview/url-catcher.test.ts` — 4 tests appended, none rewritten.
**Decided myself:** `stripped` is a second small helper beside `addressesIn` (the TASK names one; the message side needs the un-`noSlash`ed form). No behaviour beyond SPEC-113.

**DoD evidence:**
1. Before: `git status --short` → empty, HEAD `ccd32af`.
2. `bun test test/interview/url-catcher.test.ts --timeout 30000` → `10 pass / 0 fail` (6 + 4): AC-1 `ช่วยตรวจที่http://127.0.0.1:4500/healthทุก 10 วินาที` → path exactly `http://127.0.0.1:4500/health`, `url_kept` title the same · AC-2 a `:31000` system part + message `:3100` → one `url_kept` (`:3100`), the `:31000` part's title unchanged · `…:9/api` does not hold `…:9` (kept), `…:9/` does · `ดูที่http://h.test:7/xแล้วนะ` → `http://h.test:7/x`.
3. `bun test test/interview/service-urls.test.ts --timeout 30000` → `2 pass / 0 fail`.
4. `bun test --timeout 30000` → `320 pass / 16 skip / 0 fail` (336 tests, 44 files; 316 + 4).
5. `bunx tsc --noEmit` → exit 0 · `git diff --stat openapi.json` → empty · `git status --short` → ` M src/interview/round.ts` and ` M test/interview/url-catcher.test.ts` only.
No existing test changed (the old prefix case in TASK-136's tests did not exist).

UNVERIFIED — QA's live repro of DEF-2/DEF-3 against the real model (owner's word).

## Questions

## Review
**DONE** (Sober, 2026-10-30 14:5x). Diff read: `URL_RE` = E15's ASCII class; `stripped` (as written, for the message and the stored path) + `addressesIn` (`noSlash`, for comparison) — two helpers instead of one is fine, it keeps the stored address as written; held = `new Set(addressesIn(held text))`, `includes` gone; comment updated. Re-ran on `ccd32af` + this tree: `bunx tsc --noEmit` → exit 0 · `bun test test/interview --timeout 30000` → `97 pass / 0 fail` · the two other suites that reach `runRound` (`test/http/spec-store.test.ts`, `test/quiz/confirm.test.ts`) → `23 pass / 0 fail` · `git diff --stat openapi.json` → empty · `git diff test/interview/url-catcher.test.ts` removes no line (additions only) · `git status --short` → the 2 closed-list files. Jason's full `320 / 16 / 0` stands.

