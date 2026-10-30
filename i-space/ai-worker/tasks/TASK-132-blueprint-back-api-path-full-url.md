# TASK-132: blueprint-back — an `api` part's `path` may be a full http(s) URL; prompt line; AC-1 replay test (REQ-114)
- Source: SPEC-111 (E13, E13b)
- Owner: BE (Jason)
- Status: DONE
- Depends on: REQ-110 committed (**e2c3326** ✓, blueprint-back `atom`, pushed 2026-10-30 08:5x). The tree is clean.

## What to do
Read SPEC-111 first.
1. **E13, `src/spec/registry.ts:28`.** `path: z.string().refine(isApiPath, { message: 'must start with "/" or be a full http(s) URL' })`. `isApiPath(v)` = `v.startsWith("/")`, or `new URL(v)` parses (in a try) with protocol `http:` or `https:` and a non-empty `hostname`. Keep `isApiPath` in `registry.ts` with one comment line citing SPEC-111 E13.
2. **E13b, `src/interview/context.ts` `kindsBlock()` (`:47-54`).** Add the SPEC's line about `api.path` after the link lines and before the `ref` line, word for word.
3. **Tests:**
   - (a) `test/spec/registry.test.ts`: the six values from SPEC-111 E13 → `/rooms` ✓ · `http://127.0.0.1:4200/health` ✓ · `https://x.example/a` ✓ · `127.0.0.1:3900` ✗ · `ftp://h/x` ✗ · `http://` ✗.
   - (b) **AC-1 replay** (new `test/interview/service-urls.test.ts` + fixture `test/fixtures/service-urls-round1.json`). A stub reply holding the 4 rebuilt changes, `{ "change": { "op": "part.add", "ref": <ref>, "kind": "api", "title": <title>, "body": { "method": "GET", "path": <url> } }, "saidBy": "user", "sure": true }`:
     - `$api_blueprint_api_health` "Blueprint API Health" `http://127.0.0.1:4200/health`
     - `$api_blueprint_web` "Blueprint เว็บ" `http://127.0.0.1:3100`
     - `$api_caw_api_health` "CAW API Health" `http://127.0.0.1:4500/health`
     - `$api_caw_web` "CAW เว็บ" `http://127.0.0.1:3500`

     These refs and titles come from `ac1-round1.json` `refused`. The paths come from `tests/harness/test-106/spec.txt`, because the model's own bodies were not recorded (SPEC-111 § What I read). Copy the values into the fixture; a test never reads the workspace. Mark the fixture **rebuilt** in a top-level `"_note"`. `ModelReply` is a plain `z.object` (`protocol.ts:9`), so the reply parser drops that key. Then: the round is `applied`, 4 API parts are stored, each `body.path` equals its URL, nothing is refused, and 1 gateway call is made.
   - (c) The prompt contains the `api.path` line.

Closed file list: `src/spec/registry.ts` · `src/interview/context.ts` · `test/spec/registry.test.ts` · `test/interview/service-urls.test.ts` (new) · `test/fixtures/service-urls-round1.json` (new). Every `bun` command is prefixed `DATABASE_URL=pglite:memory`. No live gateway. No git.

## Definition of Done
- [ ] 1. Before: `git status --short | wc -l` → `0` + nothing of REQ-110 left uncommitted (base: `0`, Sober 08:5x, right after e2c3326)
- [ ] 2. The 6-value probe of SPEC-111 E13 (`PART_KINDS.api.body.safeParse({ method: "GET", path })`) → `true true true false false false` (base: `true false false false false false`, Sober 08:0x)
- [ ] 3. `bun test test/spec/registry.test.ts` → 0 fail (base: `21 pass / 0 fail`, 87 expects, Sober 08:0x)
- [ ] 4. New tests 3(b) and 3(c) pass, real output pasted (base: n/a — new files)
- [ ] 5. `bun test --timeout 30000` → 0 fail. Paste the counts and list any existing test you changed. If a test times out under load, re-run that file alone (base: `275 pass / 16 skip / 1 fail`, where the 1 = AC-A3 load timeout that passes alone, Jason 00:0x / Sober's review of TASK-130)
- [ ] 6. `bunx tsc --noEmit` → exit 0 (base: exit 0, Sober 2026-10-30 00:xx)
- [ ] 7. After: `git status --short` → exactly the 5 closed-list paths

## Implementation Notes
Jason, 2026-10-30 ~09:1x. All `bun` commands prefixed `DATABASE_URL=pglite:memory`. No git, no live gateway, no edit outside the closed list.

**Built**
- E13 `registry.ts`: `isApiPath(v)` = `v.startsWith("/")` or `new URL(v)` parses (in a try) with protocol `http:`/`https:` and non-empty `hostname`; one comment line cites SPEC-111 E13. `api.path` = `z.string().refine(isApiPath, { message: 'must start with "/" or be a full http(s) URL' })`.
- E13b `context.ts` `kindsBlock()`: the SPEC's line, word for word, after the link lines and before the `ref` line.
- Tests: `test/spec/registry.test.ts` (+1: the six values and the message), new `test/interview/service-urls.test.ts` (AC-1 replay + prompt line), new fixture `test/fixtures/service-urls-round1.json` (top-level `_note` says REBUILT; the 4 refs/titles are from `ac1-round1.json` `refused`, paths from the spec's URLs; `ModelReply` strips `_note`).
- Internal decision: `refine` on `z.string()` keeps the field typed `string` in the prompt (`path: string` unchanged, existing prompt tests pass).

**DoD evidence**
1. before: `git status --short | wc -l` → `0`, HEAD `e2c3326` ✔.
2. Probe `[ "/rooms", "http://127.0.0.1:4200/health", "https://x.example/a", "127.0.0.1:3900", "ftp://h/x", "http://" ]` through `PART_KINDS.api.body.safeParse({ method: "GET", path })` (in the new registry test) → `[true, true, true, false, false, false]` ✔; refusal message of `127.0.0.1:3900` = `must start with "/" or be a full http(s) URL`.
3. `bun test --timeout 30000 test/spec/registry.test.ts test/interview/service-urls.test.ts` → `24 pass / 0 fail, 96 expect() calls [1.90s]` (registry alone = 21 old + 1 new).
4. AC-1 replay: round `applied`, 1 gateway call, `refused` null, 4 `api` parts stored in order with `GET` and `http://127.0.0.1:4200/health` · `:3100` · `:4500/health` · `:3500`. Prompt test: the line is in `kindsBlock()` and `SYSTEM_PROMPT`, after `- covers:` and directly before the `ref คือ` line.
5. Full suite: `bun test --timeout 30000` → `279 pass / 16 skip / 0 fail, 1417 expect() calls, Ran 295 tests across 40 files [1221.83s]`. No timeout this time. Count check: 276 (REQ-110 final) + 3 new = 279 ✔. Existing tests changed: none (I only added a test to `registry.test.ts`).
6. `bunx tsc --noEmit` → exit 0 ✔.
7. After: `git status --short` → exactly 5 paths: ` M src/interview/context.ts`, ` M src/spec/registry.ts`, ` M test/spec/registry.test.ts`, `?? test/fixtures/service-urls-round1.json`, `?? test/interview/service-urls.test.ts` ✔. `openapi.json` untouched (part bodies are not typed there, as SPEC-111 says). `ss -ltn` :4200/:4500 → nothing.

**UNVERIFIED:** AC-2 (a live model now sends the URL and it is stored in ≤ 3 calls) — QA's live run only. The replay is rebuilt, not recorded (fixture `_note`).

## Questions

## Review
Sober (SA, A), 2026-10-30 09:3x — **DONE.** The diff is exactly SPEC-111: `registry.ts` `isApiPath` + `refine` (E13), and one `kindsBlock()` line before the `ref` line (E13b). Sober's re-run: registry + service-urls → `24 pass / 0 fail`; the 6-value probe → `true true true false false false`; `bunx tsc --noEmit` → exit 0; regression `test/interview` → `87 pass / 0 fail` [208 s]; fixture marked rebuilt (`_note`). Full suite 279/16/0 accepted from the evidence (count 276 + 3 new). UNVERIFIED: AC-2 live (QA, ≤ 3 calls).
