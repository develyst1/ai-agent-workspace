# TASK-022: LINE fails closed: no call leaves the machine when `LINE_CHANNEL_ACCESS_TOKEN` is empty
- Source: SPEC-002 § Config + § LINE notifier (amended 2026-11-01) · REQ-003 Constraints ("Any push to a real person needs the owner's go") · SYSTEM-FACTS "Real systems" · incident in TASK-020 § Implementation Notes finding 1
- Owner: BE (Bob)
- Status: DONE (Silver, 2026-11-01. See § Review)
- Depends on: TASK-020 (DONE)

- Repo: `corner-chat-back`. Team B claim only.
- Files you may edit (closed list): `src/modules/line/line-api.ts` · `src/modules/line/notifier.ts` · `test/line-notifier.test.ts` · `test/line-core.test.ts` (only if you put the `line-api` unit test there)
- Git writes allowed: **none.** Tests: `bun run test` only.

## Why
TASK-020's first live run reached the **real** `https://api.line.me` once, from a stray dev server that picked up a
`pending` row in the shared dev database. The repo `.env` has an empty `LINE_CHANNEL_ACCESS_TOKEN` (SA checked:
length 0), so the call went out as `Bearer ` with nothing behind it and LINE answered 401. That was luck, not
design: SPEC-002 defaults `LINE_API_BASE` to real LINE and never checks the token. Fix it in our code, whoever runs the server.

## What to do
1. `line-api.ts`: in `call()`, **before any `fetch`**, if `config.lineChannelAccessToken` is empty or blank, throw
   `new LineApiError(0, "<label> (not configured)")`. No request is made. Keep the error free of ids, tokens and bodies,
   as now. `push()` must surface that case distinctly, not as a `0` network error. For example, give `push` a separate
   early return, or a status sentinel you name and document in Notes.
2. `notifier.ts`: when the token is empty, **throw `Error("line not configured")` at once, with no retries and no
   `line_pushes` row**. Team A's notify then logs `line | ok=false | line not configured`, the same shape as FCM's
   `fcm not configured`.
3. Nothing else changes. With a real token (B1, the test OA) everything behaves exactly as today.

## Definition of Done (paste real output)
- [ ] A test: token `""` → `notifyLine` throws `line not configured` · the fake LINE API records **0** calls (also no retry
      calls) · no `line_pushes` row. The same with token `"   "`.
- [ ] A test: token `""` → `groupName` / `memberDisplayName` / `profileDisplayName` / `reply` each reject, and the fake
      records 0 calls. (Use a spy on `fetch`, or point `LINE_API_BASE` at the fake, and assert 0 requests.)
- [ ] Every existing LINE test is still green: `bun run test test/line-*.test.ts` (paste the result line).
- [ ] Live, local, on a **private** database (as you did in TASK-020): token empty in the server's env → a mention for a
      linked user with an `always` rule → `notifications_log` shows `line | f | line not configured`. Run `netstat` or the fake's
      log to show nothing went out. Paste both.
- [ ] `git status --porcelain` → only closed-list files.

## Implementation Notes
**Bob, 2026-11-01.** Test-first: 4 new tests in `test/line-notifier.test.ts` (token `""` and `"   "`, each for the notifier and for the API methods) RED (12 pass / 4 fail; a control test "a real-looking token still pushes as before" passed throughout), then the guard → GREEN. Closed list held (`line-api.ts`, `notifier.ts`, `test/line-notifier.test.ts`); no new dependency, no git writes.

What changed:
- `line-api.ts`: new `export const lineConfigured(config)` = token is not empty/blank after `trim()`. `call()` checks it **before any `fetch`** and throws `new LineApiError(0, "<label> (not configured)")` (no id, token or body in it). `push()` used to turn every thrown error into status `0` (network error, retried); it now rethrows a `LineApiError` and only maps real fetch failures to `0`. So "not configured" is a thrown `LineApiError`, distinct from the `0` status of a network error. That is the "named sentinel" the TASK asked for: an exception, not a number.
- `notifier.ts`: first line of `notifyLine`: `if (!lineConfigured(config)) throw new Error("line not configured")`: before the link lookup, so no query, no push, no sleep/retry, no `line_pushes` row. Team A's notify logs it as `line | ok=false | line not configured`.
- Nothing else changed; with a token set, behaviour is as before (the control test and all 95 earlier LINE tests are green).

Evidence:
```
$ bun run test test/line-*.test.ts      → 100 pass / 0 fail, 5 files
$ bun run test                          → 321 pass / 0 fail, 20 files   (whole repo)
$ bunx tsc --noEmit | grep -c "error TS" → 0
```
Covered (DoD): token `""` and `"   "` → `notifyLine` throws `line not configured`, fake records **0** calls, sleep never called (no retries), no `line_pushes` row · token `""`/`"   "` → `groupName`, `memberDisplayName`, `profileDisplayName`, `reply` and `push` each reject with an error containing `not configured`, fake records **0** requests (calls would reach the fake, because the tests set `LINE_API_BASE` to it).

**Live, local, on a private database** (`corner_chat_live_b`, created and dropped by me; the dev database was not touched: 0 rows of mine there). Server on :8091 with `LINE_CHANNEL_ACCESS_TOKEN` **empty** (the repo `.env` value is empty too), `LINE_API_BASE` = a fake LINE API running as its own process that logs every request; the seed owner linked to `Llive1`, in group `Glive`, with an `always` rule on `URGENT`; one signed mention event sent with `send-event.ts`:
```
send-event.ts → 200 {} (50 ms)
notifications_log:   fcm | f | fcm not configured
                     line | f | line not configured
line_pushes rows:    0
message:             live-msg-1 | done | notified        (the filter ran normally; only LINE was refused)
fake LINE API requests received: 0                        (not even the sender-name lookup)
```
`netstat` is **not** evidence here: it counts every connection on the machine (83 to :443 from the browser and other apps), so I do not cite it. The evidence is the fake's 0 requests plus the guard sitting before any `fetch`.

```
$ git status --porcelain -uall | grep -E "modules/line/(line-api|notifier)|test/line-notifier"
?? src/modules/line/line-api.ts       (edited, this TASK)
?? src/modules/line/notifier.ts       (edited, this TASK)
?? test/line-notifier.test.ts         (edited, this TASK)      ("??" because the whole tree is still uncommitted)
```

For the SA, not changed (outside the closed list): with an empty token, other LINE paths in `webhook.ts` degrade quietly: the sender name falls back to `"LINE"`, the group name to the group id, the link-code reply is logged `line.reply_failed` and skipped. One path is stricter: a `join` event calls the member-profile lookup without a catch (TASK-011 decision: idempotent redelivery), so with an empty token a `join` answers **500** and LINE would redeliver it. Harmless today (no OA is pointed at this server), but say if you want it caught.

**UNVERIFIED:** with a real token against real LINE (needs B1); only the empty-token behaviour was exercised live.

## Questions

## Review
**Verdict: DONE**. Silver (SA, Team B), 2026-11-01. Built and proven by the engineer. Not a test verdict.

Re-run by the SA, 2026-11-01:
```
$ bun run test test/line-*.test.ts (5 files) → 100 pass, 0 fail, 1293 expect() [3.62s]
$ bun run test   (whole repo)              → 321 pass, 0 fail
$ bunx tsc --noEmit                         → exit 0
```
- `lineConfigured` is checked in `call()` **before any `fetch`** (line-api.ts:31), so all five LINE calls are covered at one point ✔.
  `push` rethrows it, not as a retryable `0` ✔. The notifier refuses first, with no lookup, retry or row ✔. A real token behaves as before (control test) ✔.
- Live on a private DB: the fake saw 0 requests and `notifications_log` reads `line | f | line not configured`. Not citing netstat is right ✔.
- Bob's note (an empty token makes `join` answer 500): **accepted as is.** It needs a validly signed webhook plus a missing token,
  which means a misconfigured server, and LINE redelivers once fixed. Catching it would hide that misconfiguration. No change.
This closes F-012's fix. The DECISIONS rule "dev never calls a real outside service by default" holds by construction for LINE.
