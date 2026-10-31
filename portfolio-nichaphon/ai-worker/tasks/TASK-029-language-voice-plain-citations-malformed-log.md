# TASK-029: Language by code, first-person voice, plain citations, malformed-reason log — on the stub
- Source: SPEC-009 (D1–D5)
- Status: **DONE** (2026-11-01, Sober — see §Review. Was REVIEW 2026-11-01, Fern)
- Depends on: none
- Owner: Fern (FE)

**Zero real calls.** Every run pins `GATEWAY_BASE_URL` at the stub or a dead port. No ledger row. No git write.
Repo `portfolio-nichaphon-web`, branch `D1`, base HEAD `b068fba`, tree clean (2026-11-01). Base suite (Sober, 2026-11-01):
`cd back && bun test` → `45 pass / 0 fail / 178 expect() calls / Ran 45 tests across 6 files`.
**TASK-028 is still open on SQ40** — do not touch `front/src/constant/ask.ts` or `front/README.md` here.

## What to do

Read SPEC-009 first (D1–D5 + §R2, ~1.5 pages). Closed file list — `back/` only:

1. **`back/src/chain/language.ts`** — add `detectLanguage(question: string): DetectedLanguage` (D1: any U+0E00–U+0E7F char
   → `"th"`; else any `[A-Za-z]` → `"en"`; else `"other"`). `answerLanguage`: `th`→`"Thai"`, `en`/`other`→`"English"`.
   Replace the Q50 header comment with: Q50 answered 2026-11-01 by the owner, mirror the visitor — REQ-009 R1 / SPEC-009 D1.
2. **`back/src/chain/prompts.ts`** — `step3System(language)` gains the D2 lines: first person as the owner; never "the
   profile/site/owner" in the third person; on `none`/no excerpts never "I have not done X", say it is not written here
   and point to `/contact`; when `language === "Thai"`: refer to himself as ผม, polite ครับ where natural, keep product,
   company and technology names exactly as in the excerpts. Keep `STEP: answer` as line 1 and every existing rule.
3. **`back/src/chain/verify.ts`** — add pure `plainText(s: string): string` per D3 (rules listed there, nothing more).
4. **`back/src/chain/parse.ts`** — `parseStep1` / `parseStep2` return `ParseResult<T> = { ok: true; value: T } | { ok: false; reason: string }`
   with D4's closed reason set (`no_json` · `bad_json` · `field:<name>` · `match:<index>:<field>`). `extractJson` may return
   which of `no_json`/`bad_json` happened. Accept/reject rules **unchanged** — only the failure now says why.
5. **`back/src/chain/log.ts`** — add `logStepMalformed(id, step, attempt, answer, reason)` printing exactly
   `[chain] id=<id> step=<n> malformed attempt=<1|2> provider=<p> model=<m> tokens=<pt>/<ct>/<tt> len=<n> reason=<r>`.
6. **`back/src/chain/run.ts`** — `callStep` takes a parser returning `ParseResult`; step 3's parser returns `reason: "empty"`;
   log every malformed attempt (5); the `step_malformed` detail names both reasons. Step 3 language =
   `answerLanguage(detectLanguage(question))` (D1). Citations built with `plainText` on `ref` and `excerpt` (D3) — after
   `verifyExcerpts`; the step-2 `done` frame keeps the raw `kept` matches. Retry count, frames and `calls` unchanged.
7. **`back/test/stub-gateway.ts`** — marker `stub:malformed@2` (D5): step 2 replies a JSON object cut mid-string, both
   attempts. Add it to the header comment list. Existing markers untouched.
8. **`back/test/chain.test.ts`** (and/or a new `back/test/language.test.ts`) — new tests:
   (a) `detectLanguage`: `"คุณเคยใช้ฐานข้อมูลอะไรบ้าง"` → th · `"เคยใช้ PostgreSQL ไหม"` → th · `"Which databases?"` → en ·
   `"123 ?"` → other; `answerLanguage` map for all three.
   (b) `plainText`: `"- **Databases** — PostgreSQL · MySQL · MSSQL · MongoDB · SQLite"` → `"Databases — PostgreSQL · MySQL · MSSQL · MongoDB · SQLite"`;
   `"## Skills"` → `"Skills"`; `` "use `bun` [docs](https://x.y)" `` → `"use bun docs"`; `"snake_case"` unchanged.
   (c) a chain run whose stub excerpt contains `**` (a fixture-verbatim line you add to the test's own knowledge object,
   not to `test/fixtures/knowledge/`) → `answer.citations[0].excerpt` has no `**`, the step-2 frame's match still has it.
   (d) step-3 system message for a Thai question contains `Thai` and `ผม`; for an English one contains `English` and no `ผม`
       (capture the messages through `deps.ask`).
   (e) `stub:malformed@2` → `step_malformed`, `at_step: 2`, `calls: 3`; two `malformed` log lines with `reason=bad_json`,
       and none of the question text in any `[chain]` line (capture `console.log`).
   (f) `parseStep2` reasons: no braces → `no_json`; `{"coverage":"x","matches":[]}` → `field:coverage`;
       one match with `relevance:"medium"` → `match:0:relevance`.

Do NOT touch: `front/` (nothing there changes — `HomeAsk.tsx:116` renders `excerpt` as text already), `copy.ts`
(SQ43), `back/knowledge/`, `test/fixtures/knowledge/`, gateway code, `max_tokens`/temperatures, the retry count, any README.

## Definition of Done

Paste command + the relevant output for each in §Implementation Notes.

- [ ] 1. Before any edit: `cd back && bun test` → paste the summary (expect the base line above). After: all green, count = 45 + your new tests.
- [ ] 2. `cd back && bunx tsc --noEmit` → exit 0 (base `b068fba`, Sober 2026-11-01: exit 0, tree stayed clean; `npx tsc` does NOT work in `back/` — no local typescript).
- [ ] 3. `grep -n "Q50" back/src/chain/language.ts` → only the "answered 2026-11-01" pointer line.
- [ ] 4. Stub run: terminal 1 `STUB_PORT=3999 bun run stub`; terminal 2 `GATEWAY_BASE_URL=http://127.0.0.1:3999 KNOWLEDGE_DIR=test/fixtures/knowledge PORT=4099 bun run start`;
      terminal 3 `ASK_WS_URL=ws://localhost:4099/ws bun run ws-client "stub:malformed@2 which databases?"` → frames end
      `error step_malformed at_step 2` then `done`; paste the two `[chain] … malformed …` lines and the `fail` line from terminal 2.
- [ ] 5. Same setup, `bun run ws-client "เคยใช้ฐานข้อมูลอะไรบ้าง"` → frames reach `answer` (the stub's canned text is English —
      that is fine; DoD 6 proves the Thai instruction). Paste the `[chain]` lines: no Thai text in any of them.
- [ ] 6. Test 8(d) green — that is the proof the Thai/English instruction reaches step 3. Name the test.
- [ ] 7. `git status --short` from the repo root → only files from the closed list above (` M` / `??`). `git diff --stat` pasted.
- [ ] 8. Zero real calls (state it); stub, `back/` stopped; 3999 / 4099 free.

## Implementation Notes
(Fern, 2026-11-01.) Repo `portfolio-nichaphon-web`, branch `D1`, HEAD `b068fba` before and after; tree clean before (`git status --porcelain` empty).
**Zero real calls** — every run pinned `GATEWAY_BASE_URL` at the in-process stub or `http://127.0.0.1:3999`. No ledger row. No git write.

**Changed (closed list only):** `back/src/chain/{language,prompts,verify,parse,log,run}.ts`, `back/test/{stub-gateway,chain.test}.ts`, new `back/test/language.test.ts`.
- `language.ts` — `detectLanguage` per D1; `answerLanguage` th→Thai, else English; Q50 comment → answered pointer.
- `prompts.ts` — `step3System` adds two D2 lines (first person / no third person; `none` → never "I have not done", "not something written here", `/contact`), plus the Thai line (ผม, ครับ, names as written) **only when `language === "Thai"`**. `STEP: answer` still line 1.
- `verify.ts` — pure `plainText` per D3 (links → text, leading list marker and `#`s per line, `**` `__` backticks, then `normalise`).
- `parse.ts` — `ParseResult<T>` exported here (types.ts is not on the list); `extractJson` returns `no_json`/`bad_json`; `parseStep1` → `field:<name>`; `parseStep2` → `field:coverage|matches` or `match:<i>:<field>`. Accept/reject checks unchanged.
- `log.ts` — `logStepMalformed` prints exactly the D4 line.
- `run.ts` — `callStep` takes a `ParseResult` parser and logs each malformed attempt; step 3 parser → `reason: "empty"`; `step_malformed` detail now `… (len=<n> reasons=<r1>,<r2>)`; step 3 language = `answerLanguage(detectLanguage(question))`; citations built with `plainText` after `verifyExcerpts`, step-2 `done` frame still gets raw `kept`. Retry count, frames, `calls` unchanged.
- `stub-gateway.ts` — marker `stub:malformed@2` (header list updated): step 2 replies one complete match then a second cut mid-string.

**Decisions I took (internal, not visible) — overrule any:**
1. **Stub:** the old step-1 check `has("stub:malformed")` also matches `stub:malformed@2` as a substring, so it now reads `has("stub:malformed") && !has("stub:malformed@2")`. The old marker behaves exactly as before (its test is still green).
2. **Cut body shape:** one complete match before the cut, so a `}` exists and the reason is `bad_json` as D5 says. A body cut before any `}` would log `no_json` under today's `extractJson`. This matters for TASK-030's reading of H1: a real reply truncated before the first match closes logs `no_json`, not `bad_json`.
3. **Reason names outside D4's examples:** a `matches` entry that is not an object → `match:<i>:entry`; a top-level value that is not an object → `no_json` (unreachable, because the `{…}` slice always parses to an object).
4. **Prompt wording:** the old line "say plainly that the profile does not cover this…" breaks D2's no-third-person rule, so I rewrote it. The rule itself stays: say it is not covered, point to `/contact`, do not guess.
5. **Test 8(c):** the stub's canned excerpts have no `**`, so 8(c) uses an injected `deps.ask`. The line is added only to the test's own knowledge object; `test/fixtures/knowledge/` is untouched.

**FYI, not changed:** the stub's canned step-3 text still says "the profile lists…" in the third person. It is test data, but a QA picture taken on the stub will show it.

**DoD evidence**
1. Before: `cd back && bun test` → `45 pass / 0 fail / 178 expect() calls / Ran 45 tests across 6 files`. After: `53 pass / 0 fail / 209 expect() calls / Ran 53 tests across 7 files` (45 + 8: language.test.ts 5, chain.test.ts 3).
2. `cd back && bunx tsc --noEmit` → exit 0 (tsconfig includes `test/**`).
3. `grep -n "Q50" back/src/chain/language.ts` → `3:// Q50 answered 2026-11-01 by the owner: mirror the visitor — REQ-009 R1 / SPEC-009 D1.` (only line).
4. Stub 3999 + `back/` 4099 (fixtures). `ws-client "stub:malformed@2 which databases?"` frames: `accepted`, 1 started/done, 2 started, `{"type":"error","kind":"step_malformed","message":"The AI gave an answer this step could not read.","at_step":2}`, `{"type":"done"}`. Terminal 2:
   `[chain] id=35b78a87-… step=2 malformed attempt=1 provider=deepseek model=deepseek-flash tokens=14/1/15 len=250 reason=bad_json`
   `[chain] id=35b78a87-… step=2 malformed attempt=2 provider=deepseek model=deepseek-flash tokens=14/1/15 len=250 reason=bad_json`
   `[chain] id=35b78a87-… fail kind=step_malformed at_step=2 calls=3 wall_ms=19 detail="reply did not match the step schema after one retry (len=250 reasons=bad_json,bad_json)"`
   (`provider=deepseek` is the stub's canned body, not a real call.)
5. `ws-client "เคยใช้ฐานข้อมูลอะไรบ้าง"` → steps 1–3 done, `answer` with 2 citations, `calls:3`. `[chain]` lines: `step=1 ok … len=119`, `step=2 ok … len=407`, `step=3 ok … len=155`, `end coverage=covered calls=3 wall_ms=2`. No Thai text in any of them.
6. Test 8(d): `chain.test.ts` › "SPEC-009 — language, plain citations, malformed reasons" › **"8(d) step-3 system message: Thai question → Thai + ผม; English question → English, no ผม"** — green.
7. `git status --short` → ` M` on the 8 listed files + `?? back/test/language.test.ts`; nothing else. `git diff --stat`: language 17, log 8, parse 88, prompts 7, run 39, verify 15, chain.test 68, stub-gateway 9 → `8 files changed, 196 insertions(+), 55 deletions(-)` (plus the new untracked test file).
8. Zero real calls. I stopped the stub and `back/` that I started (bun PIDs 12856, 16188); `netstat` shows no listener on 3999 or 4099.

Not run: `/impeccable audit` (no UI in this TASK — `back/` only, front untouched). `/simplify` not run — the diff is all ordered lines.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** (Sober, 2026-11-01). Reviewed the evidence and re-ran the decisive checks myself, zero real calls:
- `git status --short` → exactly the 8 ` M` files of the closed list + `?? back/test/language.test.ts`; nothing in `front/`,
  `copy.ts`, knowledge, fixtures, gateway, `max_tokens` or retry count. Read the full `back/src` diff.
- `GATEWAY_BASE_URL=http://127.0.0.1:1 bun test` → `53 pass / 0 fail / 209 expect() calls / Ran 53 tests across 7 files` (= 45 + 8).
  `bunx tsc --noEmit` → exit 0. Working-copy line endings uniform CRLF in every touched file (git's LF/CRLF notice is autocrlf, not a mix).
- D1 `detectLanguage`/`answerLanguage` and the Q50 pointer line as specified; D2 lines in `step3System`, Thai line only for Thai
  (test 8(d)); D3 `plainText` applied after `verifyExcerpts`, step-2 frame still raw (test 8(c)); D4 closed reasons + the exact
  log line, behaviour unchanged (same retry, frames, `calls`); D5 marker — test 8(e) also asserts no question text in any `[chain]` line.
- Your five calls — **all accepted**: (1) the `!has("stub:malformed@2")` guard is right; (2) cut shape fine — and your point
  is correct and matters: **a real step-2 reply truncated before any `}` logs `no_json`, not `bad_json`** → SPEC-009 H1's
  prediction amended to say so; (3) `match:<i>:entry` and the unreachable `no_json` — fine; (4) the rewritten "not covered"
  line keeps every rule and fixes the third-person clash — correct; (5) injected `deps.ask` for 8(c), fixtures untouched — correct.
- FYI accepted as is: the stub's canned step-3 text stays third-person (test data); QA judges voice on the real gateway only.

Unverified by design: whether the real model actually writes Thai / first person — that is QA's real-gateway round (REQ-009 AC-a/b/d).
