# TASK-034: LINE live guard: real api.line.me only with LINE_LIVE=1
- Source: SPEC-002 § Questions Q-LIVE + its answer (`DECISIONS.md` D44, PM-decided 2026-11-01) · `DECISIONS.md` line 21 (dev never calls a real outside service by default) · TASK-022 (fail closed)
- Owner: BE (Bob)
- Status: DONE 2026-11-01 (SA-B review below)
- Depends on: none. Its partner, `test/setup.ts` blanking the token, is Team A's file: Sober's (PM routed it). **The hold on starting the back end from `.env` stands until both are DONE.**

- Why: `corner-chat-back/.env` now holds the real LINE secret and token **and** `LINE_API_BASE=https://api.line.me`. The owner will not edit `.env` again (D44). Without this guard, every `bun run dev` would talk to the real LINE OA.
- Repo: `corner-chat-back`. Files you may edit: `src/modules/line/line-api.ts` · `test/line-live-guard.test.ts` (new) · `src/modules/line/index.ts` (the one startup log line only) · `.env.example` **only** to add the line `LINE_LIVE=` with a comment (if Sober's TASK-033 is editing `.env.example` at the same time, skip it and write that in Notes).
- **Never:** `.env` (the owner's), `test/setup.ts` (Team A's), any real LINE call. **Do not start the server from `.env`** while you work: the hold.
- Git writes allowed: **none.**

## What to do
1. In `line-api.ts`, decide the target **at call time, before `fetch`** (keep it beside `lineConfigured`):
   - `base` = `LINE_API_BASE` trimmed, else `https://api.line.me` (as now).
   - The host of `base` is a **loopback** (`127.0.0.1`, `localhost`, `::1`): allowed (the fake).
   - Any other host: allowed **only when `process.env.LINE_LIVE === "1"`** (exactly `"1"`).
   - Otherwise throw `new LineApiError(0, `${label} (live not enabled)`)` **before any fetch**. It is the same kind of error as "not configured", so the notifier treats it as not retryable. Check that `push`'s try/catch rethrows it the way it rethrows "not configured".
   - A `base` that is not a valid URL → the same refusal.
2. The token check (TASK-022) stays first. An empty token means no call, whatever `LINE_LIVE` says.
3. Add one startup log line in `index.ts` when the module registers: `line: target=fake|live|closed`, using the same rule. It must not print the token, the secret or the full URL; the host is fine.
4. `.env.example`: add `LINE_LIVE=` with the comment `# 1 = real api.line.me (owner's go, test OA, D16/D44); anything else = fake or closed`.

## Definition of Done (paste real output)
- [ ] `test/line-live-guard.test.ts` mocks `globalThis.fetch` and **counts calls**. **No test may reach the network.** Cases:
  - real base, `LINE_LIVE` unset → throws `(live not enabled)`, fetch count 0;
  - real base, `LINE_LIVE="true"` or `"0"` → the same refusal;
  - real base, `LINE_LIVE="1"` → fetch called once with `https://api.line.me/...` (mocked, so nothing leaves);
  - fake base `http://127.0.0.1:<port>`, no `LINE_LIVE` → fetch called;
  - `localhost` is allowed too;
  - a base of `http://127.0.0.1.evil.test` is refused (host match, not prefix);
  - empty token + `LINE_LIVE="1"` → `(not configured)`, fetch 0;
  - the notifier, given a refused push → not retried, and the error is the expected one;
  - restore `process.env` and `fetch` after each test.
- [ ] `bun run test test/line-live-guard.test.ts test/line-api.test.ts test/line-notifier.test.ts test/line-webhook.test.ts` green (paste the counts). If the test DB is not reachable yet (D43, Sober's TASK-033), paste the error and run only the new file. The new file must not need a DB.
- [ ] `bunx tsc --noEmit` → no error in your files (paste).
- [ ] **No server at all** (`bun src/index.ts` would load `.env`, whose `DATABASE_URL` is now the owner's server). Prove the startup line with a test: export the rule as a small pure function (e.g. `lineTarget(env)`) and assert `fake`, `live` and `closed`.
- [ ] `git status --porcelain` → only the listed files.

## Implementation Notes
**Bob, 2026-11-01.** Test-first: `test/line-live-guard.test.ts` (24 tests) RED (`Export named 'describeLineTarget' not found`), then the guard → GREEN. **No server was started, `.env` was not touched** (its mtime is 10 minutes older than this run and I never opened it for writing), no real LINE call: every test replaces `globalThis.fetch` with a counter and restores it, and `process.env` (`LINE_API_BASE`, `LINE_LIVE`) is restored after each test. No new dependency, no git writes.

What changed (all on the list):
- `src/modules/line/line-api.ts`:
  - `lineTarget(env = process.env): "fake" | "live" | "closed"`: base = `LINE_API_BASE` trimmed, else `https://api.line.me`; it is parsed with `new URL` and the **hostname** is compared with `127.0.0.1`, `localhost`, `[::1]` → `fake`; any other host → `live` only when `LINE_LIVE === "1"` exactly (no trim, so `"true"`, `"0"`, `""`, `" 1"` all stay closed), else `closed`; a base that does not parse → `closed` (even with `LINE_LIVE=1`).
  - `describeLineTarget(config, env)`: `closed` when the token is empty/blank, else `lineTarget(env)`. This is what the startup line prints.
  - `call()`: the TASK-022 token check stays first; then, **before any `fetch`**, `lineTarget(process.env) === "closed"` → `throw new LineApiError(0, "<label> (live not enabled)")`. It is a `LineApiError`, the same kind as "not configured", so `push()`'s existing `catch` rethrows it (tested: `push` rejects instead of returning a retryable `0`) and the notifier does not retry it (tested: sleep never called, fetch 0). The default base constant is now `REAL_BASE`.
- `src/modules/line/index.ts`: one startup line, `line: target=fake|live|closed` (the word only: no token, secret or URL). It is skipped when `NODE_ENV=test`, because `createApp()` runs `registerLine` many times in the suite. This is the one new `console.` call.
- `.env.example`: added `LINE_LIVE=` under `LINE_API_BASE` with the TASK's comment. I did not know whether Sober's TASK-033 is editing this file at the same time; the edit is a two-line addition, easy to merge.
- `test/line-live-guard.test.ts` (new): see below.

Evidence:
```
$ bun test test/line-live-guard.test.ts      (no preload, no database)
 24 pass / 0 fail / 66 expect() calls
$ bun run test test/line-live-guard.test.ts test/line-api.test.ts test/line-notifier.test.ts test/line-webhook.test.ts
 84 pass / 0 fail / 278 expect() calls, 4 files          (the test database was reachable, so no error to paste)
$ bun run test test/line-*.test.ts
 124 pass / 0 fail, 6 files
$ bunx tsc --noEmit | grep -c "error TS" → 0
```
Covered (DoD): real base (default or explicit), `LINE_LIVE` unset → `(live not enabled)`, fetch **0** · `LINE_LIVE` = `"true"`, `"0"`, `""`, `"yes"`, `" 1"`, `"1 "` → same refusal · `LINE_LIVE="1"` → fetch called **once** with `https://api.line.me/v2/bot/group/G1/summary` (mocked) · all five API methods refused (push throws) · loopback `127.0.0.1`, `localhost`, `[::1]` with no `LINE_LIVE` → fetch called · host match, not prefix: `http://127.0.0.1.evil.test`, `http://localhost.evil.test`, `http://evil.test/127.0.0.1`, `http://127.0.0.1@evil.test`, `http://evil.test?x=localhost` all refused · bases `not a url`, `127.0.0.1:5555`, `api.line.me` refused even with `LINE_LIVE=1` · empty token + `LINE_LIVE=1` → `(not configured)`, fetch 0 (also blank token + loopback) · the notifier, given a refused push → not retried (no sleep), error contains `(live not enabled)`, fetch 0; this test uses a stub in place of the database · `lineTarget` returns `fake`, `live` and `closed` for the cases above, and `describeLineTarget` is `closed` for an empty or blank token whatever the base says.

**Does the suite bite?** Mutation check: with `lineTarget` temporarily returning `"live"` always, 17 of the 24 tests failed; restored, 24 pass again (no mutation marker left in the file: `grep -c MUTATION` = 0).

**The startup line is proved by a test, not by a server** (the TASK forbids starting one): `lineTarget` / `describeLineTarget` are pure functions asserted for `fake`, `live` and `closed`; the `console.log` line itself in `index.ts` is one template string and was not executed.

```
$ git status --porcelain -uall | grep -E "line-api|line-live-guard|modules/line/index|\.env\.example"
?? src/modules/line/line-api.ts       (edited, this TASK)
?? src/modules/line/index.ts          (edited, this TASK: the startup line)
?? test/line-live-guard.test.ts       (new, this TASK)
?? .env.example                       (edited, this TASK: LINE_LIVE=)
   (test/line-api.test.ts and src/modules/line/testing/fake-line-api.ts also match "line-api" in the grep; they are earlier TASKs' files, untouched here. "??" because the whole tree is still uncommitted.)
```
**Hold:** per the TASK, it stands until Sober's `test/setup.ts` change (blanking the token for every test run) is also DONE. Nothing in this TASK lifts it.

**UNVERIFIED:** with `LINE_LIVE=1` against real LINE (the owner's go, B1): only the mocked `fetch` was exercised. The `index.ts` `console.log` line was not run (no server).

## Questions

## Review
**Verdict: DONE** (Silver, SA-B, 2026-11-01 ~21:00). Reviewed against SPEC-002 Q-LIVE / D44 and DECISIONS line 21.
- I re-ran `bun test test/line-live-guard.test.ts` (no preload, no DB, `LINE_LIVE` unset) → `24 pass · 0 fail · 66 expect()`. `bunx tsc --noEmit` → `0` errors. `.env.example:29` has `LINE_LIVE=` ✓.
- I could **not** re-run the DB-backed LINE files now: `bun run test test/line-*.test.ts` → `Configuration error: DATABASE_URL must name the database "corner_chat" (this server is shared), got "corner_chat_dev"`. That is Team A's TASK-033 config check, now in the tree, against the owner's `.env`. It is not this TASK. Bob's 124/0 run came before that check landed. I am routing it to the PM for Sober.
- Code read (`line-api.ts`):
  - the token check is first, then `lineTarget(process.env) === "closed"` → `LineApiError(0, "(live not enabled)")` **before** `fetch` ✓;
  - the host is compared on the WHATWG-parsed `hostname` against an exact set (`127.0.0.1`, `localhost`, `[::1]`), so a prefix, userinfo or query cannot fake it ✓;
  - `LINE_LIVE` must equal `"1"` exactly ✓;
  - an unparsable base is closed, even with `LINE_LIVE=1` ✓.
  - `fetch` concatenates `baseUrl() + path`, and `path` always starts with `/`, so the authority that was checked is the one that is fetched ✓.
  - The startup line prints only the word ✓.
- The mutation check (17 of 24 fail when the guard is forced to "live") shows the tests bite ✓.
- **Security:** this TASK *is* the remedy for an outbound-call risk. **No HIGH or MEDIUM finding.**
- **The hold is NOT lifted by this TASK.** It still waits for Team A's `test/setup.ts` change (D44). `UNVERIFIED`: `LINE_LIVE=1` against real LINE (B1, the owner's go).
