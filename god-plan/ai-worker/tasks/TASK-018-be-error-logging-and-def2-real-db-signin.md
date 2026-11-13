# TASK-018: Back — log unexpected errors with their cause, then find and fix DEF-2 (sign-in 500 bursts on real Postgres)
- Source: REQ-001 §Defects to fix DEF-2 (MAJOR, the DELIVERED gate; PM-decided: log unexpected errors with detail, no secrets) · TEST-001 §Defects DEF-2 · SPEC-002 §API error table (`500 INTERNAL`)
- Owner: BE (Jason)
- Status: DONE (2026-11-09, SA review; DEF-2 closes on QA's real-DB round). Earlier: REVIEW (Jason)
- Depends on: none
- Git: none by you.

## What is known (QA's facts, TEST-001 DEF-2)
On the real back (`bun src/index.ts`, `god_plan`), sign-in fails **in bursts** with `500 INTERNAL`: through the screen, through `/api` and **direct to the
back**, any account, with the stall detector **quiet**. Between bursts the same calls work. It was never seen on PGlite. Idle gaps of 5–240 s did not
trigger it. The only log line is `unhandled error: Error` (`src/http/errors.ts:33` logs `err.name` only), so the cause is invisible.

## Hypotheses: none chosen, by rule (`reproduce-first.md` §4). The log will tell.
- **H1, the remote server drops connections:** postgres.js reuses a pooled connection that the server, or something between, has closed (codes like
  `CONNECTION_CLOSED`, `ECONNRESET`, `57P01`, `idle_session_timeout`). That fits "real DB only" and "bursts".
- **H2, argon2 under memory pressure:** every sign-in runs `Bun.password.verify` (argon2id; about 64 MiB per verify at the default cost).
  2026-11-09: this machine is short of memory (the SA's background watcher was killed by the harness for "critically low on memory"), and
  Fern logged multi-minute freezes. An allocation failure surfaces as a bare `Error`. It fits "bursts", but not obviously "real DB only".
- **H3, pool or connect timeout:** `CONNECT_TIMEOUT` or a pool wait error under bursts.

## What to do
1. **Error logging (required regardless of cause, PM-decided).** In `src/http/errors.ts` `errorHandler`, for any non-`AppError`, log **one line of JSON**:
   `{"at":ISO,"method","path":<route path without query>,"name","code"?,"message":<redacted>,"stack":<top 5 frames>}`.
   - **Redaction:** never the request body, cookies, headers or query string. If `message` contains `postgres://` / `postgresql://` or `password`, replace it
     with `"[redacted]"`. Keep `code` / `errno` / `severity` / postgres `routine` when present (no parameters).
   - Same in `scripts/owner-set.ts` only if it has its own catch-all (it does; keep its no-secret rule).
   - Test: an unexpected error produces the line with name, code and path, and a body containing a marker never appears in it.
2. **Reproduce with QA's recipe on the real back** (`god_plan`, `.env` as in TASK-003 step 6, the gateway = the stand-in), the stall detector beside it:
   sign in repeatedly for about 30 min (`tests/harness/repro-real-db-idle.mjs` or your own loop: owner, A, B in turn, about one every 10–20 s).
   Capture each new log line. **Paste the first 3 distinct error lines.** If no 500 appears in 30 min, say so and run 30 more.
3. **Fix by the cause the log shows.** Write which hypothesis it confirmed, or a new one. Likely shapes, for guidance only:
   - H1 → set postgres.js `idle_timeout` (e.g. 20 s) and `max_lifetime` (e.g. 30 min) from **config** (SPEC-003 rule: env with defaults, in `.env.example`),
     so a server-closed connection is never reused.
   - H2 → **stop and write it in `## Questions`** before changing any hash parameter: existing hashes carry their own cost, and changing it is a design question.
   - H3 → pool `max` / `connect_timeout` from config.
   Any new key: `src/config/env.ts` + its test + `.env.example`, default = postgres.js's current behaviour except where the fix needs a change.
4. **The same recipe after the fix:** about 30 min of sign-ins, **0** 500s and **0** error lines, detector quiet. Paste the counts.

## Definition of Done
- [ ] Step 1 test + `bun test` all pass, `bun x tsc --noEmit` clean. Paste.
- [ ] Step 2: the captured error lines (redacted by construction). Paste.
- [ ] Step 3: the confirmed cause in one paragraph + the change. Step 4: the counts over about 30 min after the fix (sign-ins / 200 / 401 / 500 / error lines / detector stalls). Paste.
- [ ] `grep -c 'postgres://\|postgresql://' ` on this TASK and today's log → 0. Servers stopped by PID.

## Implementation Notes
**Done (Jason, 2026-11-09).** `god-plan-back`, branch `atom`, nothing committed. Two steps went in the order the TASK asks: the error log first, then reproduce, then the fix. A temporary diagnostic (logging SQL statement text, never parameters, and a token-hash prefix) was used for the analysis only and is **removed again**: `grep -rn "TEMP-DIAG\|GP_DIAG" src test scripts` → 0, and `src/auth/session.ts` was restored byte-for-byte before the real change (md5 checked).

### Step 1: error logging
`src/http/errors.ts`: for any non-`AppError`, one line of JSON: `at`, `method`, `path` (the **route pattern**, e.g. `/api/invites/:token/accept`, never the real path, because a link token can sit in it), `name`, `code`/`errno`/`severity`/`routine` when present, `message`, a `cause` object (`name`, same codes, `message`) because drizzle wraps the driver error, and `stack` (top 5 frames). **Redacted:** never the body, cookies, headers or query string; a message that contains a connection string, `password`, or starts with drizzle's `Failed query` (that message carries the SQL parameters) becomes `[redacted]`; IP addresses and `host:port` become `[host]`. `scripts/owner-set.ts` already prints only the error code, unchanged. `test/errors.test.ts` (7 tests): the line has name, code and route pattern; a request body, query string, cookie, header and the real path containing markers never appear; each redaction rule; an `AppError` logs nothing. The first test run caught a real bug of mine (the IP was replaced before the `host:port` pattern, leaving `:5432`); fixed.

### Step 2: the reproduction (first distinct error lines, as logged; `<repo>` replaces the code folder's path)
The real back, `bun src/index.ts` on `god_plan`, on my own port 4320 (other roles kept the shared 4310 busy; the failure is direct to the back, so the port does not matter), owner / my own synthetic invitees A and B / a wrong password in turn, one call every 10–20 s, with a stall detector (a 500 ms timer firing more than 3 s late) in the same process:
```
{"at":"2026-11-09T13:31:52.793Z","method":"POST","path":"/api/auth/sign-in","name":"Error","message":"[redacted]","cause":{"name":"Error","code":"CONNECTION_CLOSED","errno":"CONNECTION_CLOSED","message":"write CONNECTION_CLOSED [host]"},"stack":["at queryWithCache (<repo>/node_modules/drizzle-orm/pg-core/[host]:19)","at async <anonymous> (<repo>/node_modules/drizzle-orm/postgres-js/[host]:33)","at processTicksAndRejections (native:[host])"]}
{"at":"2026-11-09T13:49:44.289Z","method":"POST","path":"/api/auth/sign-in","name":"Error","message":"[redacted]","cause":{"name":"PostgresError","code":"23505","severity":"ERROR","routine":"_bt_check_unique","message":"duplicate key value violates unique constraint \"sessions_token_hash_unique\""},"stack":["at queryWithCache (<repo>/node_modules/drizzle-orm/pg-core/[host]:19)","at processTicksAndRejections (native:[host])"]}
```
Only these two distinct lines appeared (the second one 4 more times in the first 30 minutes). A third 500, on `POST /api/invites/:token/accept` (the invite-accept transaction), happened once before the log was in place, so its line is lost (my mistake: I cleared a log before reading it).
**Before the fix, same 30-minute recipe, same machine:** `sign-ins=45 200=28 401=10 500=4 other=3 (client 60 s timeouts) detector-stalls=5` (the stalls were 63 s, 92 s, 607 s, 94 s and 100 s late). Every 500 was the `23505` line, each within about a minute after a stall or a client timeout. **The detector was NOT quiet in my run**; QA saw the same 500s with it quiet, so a stall is one way to trigger it, not the only one.

### Step 3: the confirmed cause, in one paragraph
**Not H2** (argon2 memory): no allocation error was ever logged, and every failure carried a database code. **H1/H3 in substance, with a sharper shape:** a pooled database connection is lost around an in-flight query. The postgres.js docs say it plainly: when a connection is lost, *"whether those queries ran is unknown"*. That shows up two ways, both seen: `CONNECTION_CLOSED` (the write hit a connection the other side had closed), and `23505` on `sessions_token_hash_unique`, always the **first or second INSERT on a freshly replaced connection** (per connection: conn 2 #1 and #2, conn 3 #1, conn 4 #1 failed; none later on the same connection). The tokens are fresh each time (35 of 35 logged hash prefixes distinct; 200 000 locally generated tokens gave 200 000 distinct hashes), so a duplicate means the same statement reached the server twice. In the post-fix soak the pattern appeared once more, **3 s after a 132 s stall**, and was absorbed (below). **Reproduced on demand** through a local TCP pass-through (it only forwards bytes; the database address stays inside the script) that drops every database connection abruptly in the middle of a sign-in: `500 CONNECTION_CLOSED` in **2 of 8** rounds with prepared statements on and **1 of 12** with `prepare: false`, so prepared statements are **not** the cause; freezing the process mid-request (SIGSTOP) reproduced the `23505` variant once. Never on PGlite, because there the connection is in-process. **What I did not find:** the exact driver-level step that sends the INSERT twice (I read postgres.js 4.1.0's retry paths in `connection.js`, which retry only on prepared-statement errors, and found no match). The fix below does not depend on knowing it.

### The change
1. **Pool hygiene from config** (`src/config/env.ts` `DbConfig`, `src/db/client.ts`; SPEC-003 rule: env, default, `.env.example`, test): `DB_POOL_MAX` 10 · `DB_IDLE_TIMEOUT_S` **20** (postgres.js default 0 = never; the fix closes an idle connection before a server or network device can drop it silently) · `DB_MAX_LIFETIME_S` 1800 · `DB_CONNECT_TIMEOUT_S` 30 (postgres.js default) · `DB_QUERY_TIMEOUT_S` **10** (default was no limit; a query that never answers is cut instead of holding the request) · `DB_TRANSIENT_RETRIES` 1. New boot invariant: `(DB_TRANSIENT_RETRIES + 1) × DB_QUERY_TIMEOUT_S < SERVER_IDLE_TIMEOUT_S` (2 × 10 < 30), else exit naming the keys. `loadDbConfig()` lets `owner:set` use the same pool settings without the web-server keys.
2. **A safe retry in the auth path only** (`src/db/retry.ts`): the sign-in's user lookup, `createSession` and `findSessionUser` (every authenticated request) are retried **once** on a connection-loss error (`CONNECTION_CLOSED`, `CONNECTION_DESTROYED`, `CONNECT_TIMEOUT`, `QUERY_TIMEOUT`, `ECONNRESET`, `EPIPE`, `ETIMEDOUT`, `57P01/02/03`, read from the error or its `cause`). `createSession` makes a **fresh token on every attempt** and also retries a `23505` on the token hash: a lost or doubled attempt leaves only an orphan session row that nobody holds (it expires). Each retry logs one line (`at`, `event: db-retry`, `attempt`, `code`; no query, no parameters). **Not retried, on purpose:** the other writes (project, task, comment, invite creation) because repeating them could create a second row; and the invite-accept transaction (a lost connection rolls the whole transaction back cleanly, and the person can press the button again).
3. `.env.example` has 24 keys (6 new, one comment line each, no values). `scripts/owner-set.ts`, `src/index.ts` pass the pool config.

### Step 1 and step 3 test evidence
```
$ bun test
 150 pass
 0 fail
 784 expect() calls
Ran 150 tests across 7 files.     (was 116; per file: ai 32 · core 25 · links 17 · config 50 · errors 7 · retry 12 · schema 7)
$ bun x tsc --noEmit → no output, exit 0
$ bun run db:generate → "No schema changes, nothing to migrate"   (drizzle/ unchanged)
$ grep -rn "process.env" src | grep -v src/config/env.ts → none · the literal grep outside src/config → none
```
`test/retry.test.ts` (12): classification of transient codes (on the error and on its cause; everything else not), a token collision only for the session token hash; `withRetry`: one retry then success with one log line and no secret, gives up after N with the original error, 0 retries or an unregistered database means none, a non-transient error is thrown at once; on a real PGlite with faults injected: a lost connection on the insert → second attempt stored, one row; a replayed insert (duplicate hash) → retried with a **fresh** token and the caller holds the stored one; two failures in a row surface the error; the session lookup is retried; through the real app, a sign-in with one injected `CONNECTION_CLOSED` answers 200 with a `db-retry` line, and with the retries used up answers 500 `INTERNAL` plus the cause in the log. `test/config.test.ts` gained every new key (defaults, set, 12 invalid cases by name, the new invariant, `loadDbConfig`).

### Step 4: after the fix, the same recipes
1. **The on-demand harness** (connections dropped in the middle of a sign-in, through the proxy), 30 rounds, 3 sign-ins each: **90 of 90 returned 200, 0 × 500.** `CONNECTION_CLOSED` still occurred twice (the same rate as before) and both were absorbed by the retry (2 `db-retry` lines).
2. **The 30-minute soak on the real `god_plan` back**, same recipe as step 2 (14:56 to 15:26 UTC): `sign-ins=73 200=55 401=18 500=0 other=0 detector-stalls=5`. All 18 `401` were the wrong-password calls (no `UNEXPECTED` line); **0 × 500, 0 client timeouts.** The back's own log had one structured line besides the boot line: `{"at":"2026-11-09T15:05:14.624Z","event":"db-retry","attempt":1,"code":"23505"}`, 3 s after the 132 s stall at 15:05:11, i.e. the bug firing and being absorbed, with the user still getting a 200. **Machine stalls were as bad as in the failing run** (5 stalls: 139 s, 132 s, 39 s, 207 s, 127 s late), so the comparison is fair.
Servers stopped by their port's PID (0 listeners on 4320 and on the proxy's port); my scratch credential files deleted. The connection-string grep from the DoD: today's log → 0; this TASK → 2 hits, both in the SA's own instruction text above (the redaction rule and the DoD line, which name the scheme as a pattern), none in my notes and no value anywhere.

### What is NOT proven (`UNVERIFIED`)
- The exact driver mechanism of the duplicate send (above); the fix handles its effect, not its source. If you want the source, the next step is a wire-level trace, which needs a database-side or TLS-aware capture I do not have.
- Whether `DB_IDLE_TIMEOUT_S` 20 by itself prevents the stale-connection case: I could not isolate it (no failure appears while idle). The retry is what the two proofs above measure.
- Invite accept and the other writes still fail with a 500 if the connection is lost in the middle (they are deliberately not retried). QA's real-database round must run again; the PGlite rounds cannot show this.
- Whole-machine stalls themselves (up to 207 s) are not mine to fix; they are why the soak had 73 sign-ins, not 150.
- `/security-review`: not run. My read: the retry never repeats a non-idempotent write; the log line redacts connection strings, `password`, drizzle's `Failed query` messages, hosts and IPs, and never includes the body, cookies, headers or query string.

### Decisions for the SA to veto
(1) Two defaults changed from postgres.js's own: idle timeout 20 s (was never) and query timeout 10 s (was no limit). (2) The retry lives in the auth path only. (3) `QUERY_TIMEOUT` counts as transient (the query was cancelled, a read is safe to repeat, and the session insert uses a fresh token). (4) Left on `god_plan` (synthetic, by design): many orphan session rows for the owner and my invitees (I did not count them: no SQL), a few extra projects "BE DEF-2 repro … (synthetic)", several synthetic invitee accounts `be-repro-*@godplan.test` whose passwords I no longer hold, and their used invites. QA may want fresh names.

## Questions

## Review
**DONE — Sober (SA), 2026-11-09.** DEF-2's fix is proven on the real database by your soak. QA's real-DB round is what closes DEF-2.
- Re-ran: `bun x tsc --noEmit` clean · `bun test` 150 pass, 0 fail.
- **Security read (auth path + logging), by reading** (the tree is untracked, so no diff-based `/security-review`): `src/db/retry.ts`, `src/http/errors.ts`, `createSession`.
  - The retry only applies to a database **registered at boot** (a WeakMap budget). `invites/routes.ts:95` calls `createSession(tx, …)` with a transaction object
    that isn't registered, so there's **no retry inside a transaction**. Correct. A fresh token per attempt, so the only leftover is an orphan session row nobody holds. Accepted.
  - The log line keeps only `code` / `errno` / `severity` / `routine` from the error and its cause, so never Postgres's `detail` (which can carry key values). The message is
    redacted for connection strings, `password` and drizzle's `Failed query`. The route pattern only, never the real path. No body, cookies, headers or query. Accepted.
- **The cause is accepted as shown by the log** (connection lost around an in-flight query: `CONNECTION_CLOSED` and the replayed insert `23505`). H2 (argon2) is ruled out.
  **The driver-level mechanism of the double send is unproven, and you said so.** The fix handles the effect, which is enough for DEF-2.
- **Proof accepted:** the same 30-min recipe before → 4 × 500, after → 0 × 500, with comparable machine stalls. The on-demand connection-drop harness 90/90. `db:generate` shows no changes.
- **Decisions 1–4 accepted:** idle 20 s and query timeout 10 s (the new boot invariant keeps `2 × 10 < 30`); retry in the auth path only; `QUERY_TIMEOUT` counts as transient; synthetic leftovers.
- **Carried, and they matter for QA:** invite-accept and the other writes still answer 500 if the connection drops mid-call (not retried, by design). Any such 500 in QA's real-DB round
  is a known limit, not a new defect, **unless it happens with the detector quiet**. In that case it comes back to me.
- **Nit, non-blocking (do it with your next back TASK):** `redactMessage` is also applied to stack frames, and its `host:port` pattern eats `file.ts:12`. That's why your log shows
  `[host]:19`. Keep the file and line in frames. Redact only real hosts and IPs.
