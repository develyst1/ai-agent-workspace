# TASK-039: The back end recovers by itself when the database drops its connection
- Source: TEST-005 § Observations (QA-B Tefany, 2026-11-02), relayed by the PM · SPEC-001 §8a as amended by D43/D45 (the owner's
  remote Postgres) · REQ-002/003 (intake must not stop silently)
- Owner: BE (Jason)
- Status: DONE (SA Sober, 2026-11-02; pool timeouts; the drop's cause not established)
- Depends on: TASK-033 (DONE)

- Repo: `corner-chat-back` · git writes: **none**
- Files you may edit (closed list): `src/core/db.ts`, `test/db-reconnect.test.ts` (new)

## The defect (read, not guessed)
- QA-B's back end on the owner's server logged `PostgresError: Connection closed` (`ERR_POSTGRES_CONNECTION_CLOSED`) twice on
  2026-11-02. From then on **every** loop tick and request failed with the same error until the process was restarted.
  Evidence: `ai-worker/tests/harness/qa-b/stack-backend.connclosed.log`, where line 5 and the repeated "Filter loop tick failed"
  blocks show it.
- `src/core/db.ts` builds one `new SQL(url, options)` at load, with no `idleTimeout` and no `maxLifetime`. Both default to 0, so
  connections live forever (bun-types `sql.d.ts:520-570`, Bun 1.3.14).
- Why the pool keeps handing out a dead connection is `inferred — a remote server or NAT closes idle sockets, and Bun's pool does
  not recover`. Your RED test settles it.

## What to do
1. **RED first. Reproduce it in a test:** open the app's `db` against a `corner_chat_test_*` run database on the owner's server
   (the existing `test/setup.ts` flow). Run one query. Then, from a **second** `SQL` connection, kill only our own backend:
   `select pg_terminate_backend(pid) from pg_stat_activity where datname = current_database() and pid <> pg_backend_pid()`.
   Then show that the next `db` query fails, and that the one after it still fails (the bug), before the fix.
   - **Only that run database.** `current_database()` is the run's own; never terminate anything else.
2. **Fix, inside `db.ts` only.** No import changes in the 24 files that use `db`.
   - **Pool hygiene:** `idleTimeout: 60` and `maxLifetime: 1800` (seconds), as named constants with a comment saying why: a
     remote server or NAT drops idle sockets.
   - **Self-healing:** when a query fails with `ERR_POSTGRES_CONNECTION_CLOSED`, the module swaps in a fresh `SQL` instance (and
     closes the old one quietly), so the **next** call works.
     - **No automatic re-run of the failed query:** a write may or may not have committed, and the loops already retry on their
       next tick.
     - The failing call still throws, so the request answers 500 once.
     - Log one line, `database connection lost — reconnected`, never the URL.
   - **Keep the API:** `db` stays a tagged-template function with `.begin`, `.array`, `.unsafe` and `.close` (the methods in use:
     `begin` ×11, `array` ×3, `unsafe` ×1, `close` ×1). A forwarding wrapper or a `Proxy` over a function is fine. Your call;
     declare it.
   - A swap must not happen twice for one drop. Concurrent failures share one reconnect.
3. **GREEN:** the same test now shows the first query after the kill throws, and the second succeeds. Also cover: a
   `db.begin(...)` transaction after a reconnect works, and a normal error (a syntax error) does **not** swap.

## Definition of Done (paste real output)
- [ ] `test/db-reconnect.test.ts`: RED output pasted, then GREEN. Kill → one failure → next query OK; `begin` after a reconnect;
      a syntax error does not reconnect; one reconnect for parallel failures.
- [ ] Whole tree `bun run test` (owner's server) green · `tsc --noEmit` 0.
- [ ] **Live:** start the back end on your own port and run database. Kill its backend the same way, then wait one filter-loop tick
      and one mail-outbox pass. The log shows **one** `reconnected` line and **no** further `Connection closed`. A `GET /me` with
      a token answers 200. Paste the log lines (no URL).
- [ ] Your run database is dropped afterwards · `git status` → the closed list only.

## Implementation Notes
2026-11-02. **I could not reproduce the defect, so I have NOT changed `db.ts`.** The RED step of the TASK did not go red. Working tree: only the new `test/db-reconnect.test.ts` (passes today). No git. Run databases were mine and are dropped by `test/setup.ts`; nothing else on the server was touched (the one extra read was counts of connections: `max_connections` 100, 20 client backends at that moment, 10 of them this run's pool).

**What I tried, all with Bun 1.3.14 on Windows, the app's own `db` against my run database on the owner's server (probe files, deleted afterwards):**
1. The TASK's recipe, `pg_terminate_backend` of every other backend of the run database, 300 ms pause, then queries: `ok, ok, ok` (the pool reconnects by itself).
2. Same kill with **no pause**, 4 sequential queries: `CONNECTION_CLOSED, SERVER_ERROR, CONNECTION_CLOSED, ok`. So Bun's pool heals itself after 1-3 failed queries.
3. A **full pool** (19 connections open), killed without a pause, 16 sequential queries: first run `SERVER_ERROR, CONNECTION_CLOSED, ok ×14`; second run `SERVER_ERROR, CONNECTION_CLOSED, SERVER_ERROR, CONNECTION_CLOSED, ok ×12`. With a 300 ms pause: `ok ×16`.
4. Kill **during an in-flight query** and **inside `db.begin`**: one `SERVER_ERROR` / `EXPECTED_REQUEST`, then a stray `CONNECTION_CLOSED` or two, then `ok`.
5. A **local TCP proxy** between a `SQL` and the server, cut abruptly (`socket.destroy()` and `socket.end()`, so no Postgres message, like a NAT reset): `ok ×10` after both.
Every case recovers within four failed queries and then stays healthy. The one thing QA-B saw, *every* tick failing for ~13 lines until restart, never appeared.

**What QA-B's log does and does not say** (`harness/qa-b/stack-backend.connclosed.log`, read in full): `Connection closed` from the first request after start-up, then the filter loop and the mail outbox failing with the same error on every pass (13 lines). No timestamps, no Bun version, no OS. The server (`idle_session_timeout` 0, `tcp_keepalives_idle` default) does not close idle sessions itself, so whatever closed them was outside Postgres (a NAT/firewall, or QA's own tooling, e.g. the harness restarting or cutting the connection).

**So the TASK's premise ("the pool keeps handing out a dead connection") is not shown on my machine.** I do not want to ship a connection-swapping wrapper around `db` (a `Proxy` over a tagged template, which changes how every query is built) on a cause I cannot show. A change like that has its own risk: `db` fragments and `db.begin` go through it.

**Left as is:** `test/db-reconnect.test.ts` (new): kill every other backend of the run database, wait 300 ms, then the 2nd and 3rd queries must succeed. It passes today (a guard for the pool's own healing, and the RED for the fix if the cause turns up).

**Re-scoped work done, 2026-11-02 (SA's answer: pool timeouts only, no wrapper).**
- **`src/core/db.ts`:** two named constants, `IDLE_TIMEOUT_S = 60` and `MAX_LIFETIME_S = 1800` (seconds), with a one-line why, passed as `idleTimeout` / `maxLifetime`. Nothing else changed; no import in the other files.
- **Test first:** `test/db-reconnect.test.ts` got a "pool hygiene" test. RED: `Expected: 60 · Received: undefined`. Then my second mistake: Bun keeps these options in **milliseconds** (`60000`), so the test expects `60_000` and `1_800_000`; GREEN after that fix. The kill test from before stays as the guard.
- **Whole tree on the owner's server, default 5 s test timeout:** `6 fail` — all `timed out after 5000ms` (lockout ×2, admin password, pipeline "4 in flight", a LINE push, a reply validation) in a 367 s run. **Not caused by this change:** I removed the two options again and ran `test/auth.test.ts` twice: 2 and 3 lockout timeouts, the same as with them (1 and 2). The server is simply slower and spikier right now (median round trip 54 ms, max 896 ms; 20 client backends from several desks), so tests that make ~100 sequential queries cross 5 s. Earlier today the same tree took 206 s and passed with no failures.
- **Whole tree with `--timeout 60000`:** `409 pass · 0 fail · 25 files [439.73 s]`. `tsc --noEmit` → 0. Closed list only (`src/core/db.ts`, `test/db-reconnect.test.ts`); probe files deleted.
- **For the SA (not mine to change, the `test` script is outside this TASK's list):** on the remote server the default 5 s per-test timeout is now flaky for the slowest tests. A `--timeout 30000` in the `test` script (or `bunfig.toml`) would fix it for everyone; say if you want that as a TASK.
- **Not done:** the removed live DoD item (kill a running back end and watch the log) — there is no `reconnected` line any more.

## Questions
- For the SA: which Bun version and OS ran QA-B's back end, and how long had it been idle before the first `Connection closed`? If it was Linux or a different Bun, the failure may be platform-specific, and I should reproduce there (or QA-B can run the same kill recipe in their stack and send me the output).
- For the SA: do you want the **cheap, safe half** now: `idleTimeout: 60` and `maxLifetime: 1800` in `db.ts` (the pool then never keeps a socket for more than 30 minutes or idle for more than a minute, which is what a NAT would time out)? It needs no wrapper, and one run on the owner's server shows it does no harm. The swap-on-`CONNECTION_CLOSED` wrapper I'd hold until a reproduction exists.

  > answer (SA Sober, 2026-11-02). **Your pushback is right, and good work.** Five failure shapes all heal, so no wrapper. `[SA-decided]`
  > 1. **QA-B's environment:** the same machine as you. `stack.ts` spawns `bun src/index.ts` from the same `PATH`, so it is Windows
  >    with the same Bun 1.3.14 (`inferred` from the harness, not asked). It is not a platform difference.
  > 2. ~~**The likely cause is QA-B's own harness, not the pool**~~ **REFUTED 2026-11-02 (QA-B via the PM): only one of her stacks ran during both drops. The cause is open.** (`inferred — timestamps would settle it`):
  >    - `qa-b/stack.ts:16`, `live-stack.ts:18` and `test-004.ts:22` all use the **same** database name, `corner_chat_test_qa_b`.
  >    - Each runs `DROP DATABASE … WITH (FORCE)` at start, and `stack.ts:66` / `test-004.ts:70` drop it again at the end.
  >    - So if any of them runs while `stack.ts`'s back end is up, Postgres kills the back end's connections, and the database is
  >      either recreated empty or gone. Every loop tick then fails until `stack.ts` restarts and recreates it, which is exactly the
  >      log's shape: errors from the first request, and only a restart fixes it.
  >    - I am sending this to the PM for Team B: one database name per script, or never two at once.
  > 3. **Yes to the cheap half:** add `idleTimeout: 60` and `maxLifetime: 1800` in `db.ts`, as named constants with a one-line why
  >    (a remote server or NAT drops idle sockets). Keep your `test/db-reconnect.test.ts` as the guard.
  > 4. **New DoD** (replaces the live box and the wrapper items): the two options are in · your test is green · whole tree green on
  >    the owner's server · `tsc` 0 · the closed list only. If QA-B sees it again **with timestamps** and no harness overlap, we reopen.

  > correction (SA Sober, 2026-11-02): QA-B's check refutes point 2 (one stack, no overlap). Her harness is fixed anyway (one database per
  > script; it refuses to drop a database that has live connections). **Cause: unknown.** Keep the timeouts. If it recurs, capture timestamps, the
  > Bun version and `pg_stat_activity` for our database, and reopen.

## Review

**Verdict: DONE** — SA Sober, 2026-11-02 (re-scoped DoD).
- **What I re-ran:**
  - `src/core/db.ts:13-16` → `IDLE_TIMEOUT_S = 60`, `MAX_LIFETIME_S = 1800`, passed as `idleTimeout` / `maxLifetime`;
  - `bun run test --timeout 60000 test/db-reconnect.test.ts` → `2 pass · 0 fail`;
  - `tsc --noEmit` → 0.
- **Accepted:** your whole tree, 409 pass / 0 fail with `--timeout 60000` (439 s). The 6 timeouts at the default 5 s happen without
  this change too, so they're not caused by it; they are TASK-040.
- **The drop's cause stays open:** see the correction in § Questions for what to capture if it recurs.
- **Security review:** not applicable — pool timing only, no auth, secret or data change.
