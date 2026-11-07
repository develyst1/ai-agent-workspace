# TASK-113: One log line when a request or the worker's database call is slow
- Source: SPEC-102 § Questions Q11 (REQ-101)
- Owner: BE (Jason)
- Status: DONE 2026-11-07, Sober, see § Review
- Depends on: none. Base: `call-scribe-back` branch `atom`, 1195792, working tree clean (read 2026-11-07).
- Repo: `call-scribe-back`, held by Team A, batch 2026-11-06. Branch `atom`.
- Git writes allowed: **none.**
- Files you may edit (closed list): `src/http/app.ts`, `src/worker/worker.ts`, `test/**`.

## Why

The back stalled twice on 2026-11-06 and left **nothing in its log**. Tanya's probe did not reproduce it (SPEC-102 Q11), so the next stall may be the only evidence we get, possibly on the owner's phone. **This names a stall when it happens. It is not a fix:** change no timeout, pool setting or retry.

## What to do

1. `src/http/app.ts`: a middleware around every request. When a request took **5000 ms or more**, log one line:
   `slow: method=POST route=/api/auth/login status=204 ms=8123`
   `route` is the route **pattern** (`/api/recordings/:id`), not the raw path; use `routePath` from `hono/route`, and check it works from a middleware after `next()`. Not-found requests must not log the raw path. A long `complete` will log, and that is correct.
2. `src/worker/worker.ts`: time `store.claimNext()`. When it took 5000 ms or more, log one line:
   `slow: worker claimNext ms=8123`
   This query runs every 2 s while idle, so it is the back's own clock on the database, even when nobody is using the app.
3. The threshold is a constant in each file. No env key, no new dependency, no log line under the threshold.
4. **Log only what is above.** Never a query string, file name, cookie, body or error message.

## Definition of Done

Base check, ran 2026-11-07 at 1195792: `grep -rn "slow:" src` finds nothing, and `git status --porcelain` is empty.

- [ ] `bun test` → all pass, adding, on the memory store, with the threshold passed in so tests do not wait 5 s:
  - a slow handler logs exactly one line with `method`, the route pattern, `status` and `ms`; a fast one logs none;
  - a slow request on `/api/recordings/<uuid>` logs the pattern, and the uuid is not in the line;
  - a `claimNext` wrapped to be slow logs its line; a fast one logs none.
- [ ] `bun run typecheck` → clean.
- [ ] Closed list: `git status --porcelain` → only the listed paths.
- [ ] **No database run needed, and no worker against `call_scribe`.** Paste `grep -n "slow:" src/http/app.ts src/worker/worker.ts`.

## Implementation Notes

Jason, 2026-11-07. `call-scribe-back` branch `atom`, base 1195792, working tree only, no git writes. `bun test` only; no database, no worker against `call_scribe`.

- `src/http/app.ts`: first middleware (`app.use("*")`, before CORS) times `next()` in a `try/finally`. At `>= slowMs` it logs `slow: method=<M> route=<pattern> status=<n> ms=<n>`. The pattern is `routePath(c, -1)` from `hono/route`: index `-1` is the matched handler's pattern; the default index would give the middleware's `*`. `SLOW_MS = 5000` constant; `slowMs` is an optional `createApp` dep **for tests only**, default the constant (no env key, no new dependency).
- `src/worker/worker.ts`: `claimNext()` timed in `runOne` with `try/finally` (a slow call that then throws is still logged). `slow: worker claimNext ms=<n>`. Same pattern: `SLOW_MS = 5000`, optional `slowMs` dep for tests.
- Logged: method, route pattern, status, ms; and the worker's ms. Nothing else (no query, file name, cookie, body, error message).
- `test/slow.test.ts` (new, 6 tests, memory store, threshold passed in): slow `POST` handler → exactly one line matching `^slow: method=POST route=/test/slow-created status=201 ms=\d+$`; fast request → none; slow `GET /api/recordings/<uuid>?token=secret-query` → one line with `route=/api/recordings/:id`, **uuid and the query string absent**; slow not-found (`/nothing/here-secret-name.m4a`, threshold 0) → one line, raw path absent; slow `claimNext` (wrapped) → lines of the exact shape; fast `claimNext` → none.

**Evidence:**
- `bun test test/slow.test.ts` → `6 pass / 0 fail / 17 expect()`. Whole suite: `95 pass / 0 fail / 336 expect()`.
- `bun run typecheck` → clean.
- `grep -n "slow:" src/http/app.ts src/worker/worker.ts` →
  `src/http/app.ts:34: console.log(\`slow: method=${c.req.method} route=${routePath(c, -1)} status=${c.res.status} ms=${ms}\`);`
  `src/worker/worker.ts:100: if (ms >= slowMs) console.log(\`slow: worker claimNext ms=${ms}\`);`
- `git status --porcelain` → ` M src/http/app.ts`, ` M src/worker/worker.ts`, `?? test/slow.test.ts` (all on the closed list).
- **UNVERIFIED:** a real 5 s stall on a real socket (tests use `app.request` and a 30 ms threshold); what the `route=` value is for a not-found request (the test only proves the raw path is absent, not the exact text). A request killed before it finishes (client disconnect, server stop) is not covered by the `finally`.

## Questions

## Review

**Sober, 2026-11-07: `DONE`.** Built and proven by the engineer, not tested by a tester. On a snapshot, no `.env`: typecheck clean, `bun test` 95 pass, 0 fail, 71.12 s, full output kept, no `(fail)` line. Diff read: only the two lines and their timing; no timeout, pool or retry changed.
**Your two `UNVERIFIED` items, run here,** real `Bun.serve`, real 5000 ms threshold, memory store with the session check slowed to 6 s:
```
A client waits:            slow: method=GET route=/api/auth/me status=401 ms=6002
B client gives up at 2 s:  client gave up: TimeoutError
                           slow: method=GET route=/api/auth/me status=401 ms=6001
C fast request:            no line
D not-found, threshold 0:  slow: method=GET route=/* status=404 ms=0
```
B is Fern's case: the client's timeout does not lose the line. **Known limit, accepted:** the line is written when the call ends, so a query that never returns writes nothing, and neither does a server killed mid-request. The stalls seen so far did end. The worker's line is not run on a socket or real database, and shares the same pattern. A real stall has not been caught, so this says nothing yet about Q11's cause. The work is uncommitted, in 3 paths, until the owner's word.
