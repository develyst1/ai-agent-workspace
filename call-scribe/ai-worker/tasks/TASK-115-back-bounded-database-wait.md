# TASK-115: A database call that gets no answer fails after 10 s, instead of hanging
- Source: SPEC-102 § Questions Q11 and § Non-functional (REQ-101, AC-14)
- Owner: BE (Jason)
- Status: DONE 2026-11-07, Sober, see the end of § Review; in 3bb7f2c, on develop through 22d8de8
- Depends on: none. Base: `call-scribe-back` branch `atom`, d7e36dc, working tree clean (read 2026-11-07).
- Repo: `call-scribe-back`, held by Team A, batch 2026-11-06. Branch `atom`.
- Git writes allowed: **none.**
- Files you may edit (closed list): `src/db.ts`, `src/index.ts`, `src/worker/worker.ts`, `test/**`, `README.md`.

## Why

On the real database (SPEC-102 Q11, Sober 2026-11-07), a request that lands on a connection that died silently gets no answer and no error, and only ends when the kernel gives up on the connection, about 15 minutes later. `/me` hit the 60 s cap at ticks 63, 64, 65, while tick 66 answered in 1551 ms. On his phone that is a screen stuck on loading, and the worker can stop the same way. The other connections work, so **a bounded wait followed by a normal failure is enough:** the next try goes to a working connection.

This treats the effect. **Do not tune the pool** (`idleTimeout`, `maxLifetime`, `max`): nothing shows those would help, and keep the change this small.

## What to do

1. `src/db.ts`: `withDeadline(store, ms)`, a generic wrapper returning the same interface. Every async method races a timer and on expiry throws `DbTimeoutError` (`name` that, `code` `DB_TIMEOUT`, so `errorLabel` logs it). Clear the timer when the call ends. A late answer is ignored and must not become an unhandled rejection.
2. `src/index.ts`: wrap `pgSessionStore(sql)` and `pgRecordingStore(sql)` with `DB_DEADLINE_MS = 10000`, a constant. No env key. Not the migration script.
3. **Requests need no other change.** `onError` already answers `500 internal_error` and logs `unhandled error: DbTimeoutError code=DB_TIMEOUT`. The front already has strings for that (list, login, Send failed). Say so in your notes if you find a route where it does not hold.
4. `src/worker/worker.ts`:
   - A job's statement timing out goes down the existing `worker_crashed` path, with nothing new.
   - **`claimNext` itself timing out:** the row may have been claimed with the answer lost, and no `current` knows it. Set `recovered = false`, so the next loop's `requeueInFlight` returns it to `queued`. That is safe only because this worker holds no other job at that moment: check it, and write the reason in a comment.
   - `failCrashed` and `requeueInFlight` timing out: already retried each loop.
5. Status guards already make a late write harmless; do not add more.

**One back per database (SPEC-102 § Env):** tests need no database. Use `bun test` only, and no worker against `call_scribe`.

## Definition of Done

Base check, ran 2026-11-07 at d7e36dc: `grep -rn "withDeadline\|DB_TIMEOUT" src` finds nothing, and `git status --porcelain` is empty. Ran `tests/harness/bun-sql-dead-connection.ts hole` on the driver: the silent query gets no answer by 12 s, and other queries return.

- [ ] `bun test` → all pass, adding, on the memory store, with a short deadline and a method that never resolves:
  - `withDeadline`: throws `DbTimeoutError` at the deadline; a method answering in time returns its value; a method that rejects passes its own error through; a late answer or late rejection after the deadline → no unhandled rejection; no timer left behind.
  - A route whose store call hangs → `500 internal_error` within the deadline, and the log line holds `DB_TIMEOUT`.
  - Worker, `storeTurns` hangs → `transcription_failed`, `worker_crashed`, retryable; the next queued row still runs; transcribe calls 2, one per recording.
  - Worker, `claimNext` hangs once after really claiming a row → the row returns to `queued` and finishes `done`.
- [ ] **The real driver, no real database:** a harness in `../ai-worker/tests/harness/`, on `bun-sql-dead-connection.ts`'s fake Postgres in `hole` mode, using the real `pgSessionStore` and `withDeadline`: the silent call throws `DB_TIMEOUT` at about the deadline, and the next call answers. Paste both, with times. Write output to a file: one piped run of that script hung, unexplained.
- [ ] `bun run typecheck` → clean. Closed list: `git status --porcelain`.
- [ ] `UNVERIFIED — a real dead connection on the real database:` that comes from the rerun through the PM, not this TASK.

## Implementation Notes

Jason, 2026-11-07. `call-scribe-back` branch `atom`, base d7e36dc. Committed by the SA as 3bb7f2c on the owner's order; I touched no file in the repo after that. `bun test` only; no database, no worker against `call_scribe`.

- `src/db.ts`: `DbTimeoutError` (`name` `DbTimeoutError`, `code` `DB_TIMEOUT`) and `withDeadline(store, ms)`: a `Proxy` returning each function property as a call raced against a `setTimeout`; non-function properties (the memory store's `rows`) pass through; the timer is cleared in `finally`; the late settlement of the real call is already subscribed by `Promise.race`, so it is never an unhandled rejection; a synchronous throw passes its own error.
- `src/index.ts`: `pgSessionStore` and `pgRecordingStore` wrapped with `DB_DEADLINE_MS = 10000` (constant, no env key). Migration script untouched.
- `src/worker/worker.ts`: `recovered` moved up to the worker's scope; when `claimNext` throws (**any** error, not only a timeout: the same lost-answer risk), `recovered = false` and the error is rethrown, so the next loop's `requeueInFlight` returns an unseen claimed row to `queued`. The comment states why that is safe: `current` is null (`runOne` is not re-entered), `crashed` is null (the loop does not reach `runOne` while one is pending), one worker per database. A job statement timing out takes the existing `worker_crashed` path unchanged.
- Requests: no change needed; `onError` answers `500 internal_error` and logs `unhandled error: DbTimeoutError code=DB_TIMEOUT` (test below). I checked no other route; the only route code I ran is `/api/auth/me`.

**Evidence:**
- `test/deadline.test.ts`, 8 tests: throws `DbTimeoutError`/`DB_TIMEOUT` at the deadline (40 ms); in-time value returned, `rows` passes through; own rejection and sync throw pass through; late answer and late rejection → no `unhandledRejection` event; no timer left (patched `setTimeout`/`clearTimeout`, live set empty after answer, rejection, sync throw and timeout); route with a hanging `isValid` → `500 internal_error` within the deadline and the log is exactly `unhandled error: DbTimeoutError code=DB_TIMEOUT`; worker with `storeTurns` hanging → `transcription_failed`/`worker_crashed`/retryable, next row `done`, transcribe calls 2; worker with `claimNext` really claiming then losing its answer → row requeued and `done`, transcribe calls 1.
- **Real driver, fake Postgres** (`tests/harness/db-deadline-115.ts`, the fake server copied from Sober's `bun-sql-dead-connection.ts`; real `pgSessionStore` + `withDeadline`, deadline 1000 ms; output written to a file). `hole`: `c1 normal: answered in 4 ms`, `c2 normal: answered in 0 ms`, `c3 hits the dying connection: ERROR DbTimeoutError code=DB_TIMEOUT in 1000 ms`, `c4 next call: answered in 0 ms`, `c5: answered in 0 ms`. `fin`: `c3 ERROR PostgresError code=ERR_POSTGRES_CONNECTION_CLOSED in 0 ms`, then c4 and c5 answered. The call used is `removeExpired` because the fake does not implement ParameterDescription (a first try with `isValid` timed out every call, all ten connections; that was the fake, not the code).
- Final: `bun test` → **110 pass / 0 fail / 376 expect()** (68.93 s); `bun run typecheck` clean; `git status --porcelain` empty (already committed). `grep -rn "withDeadline\|DB_TIMEOUT" src` lists `db.ts` and `index.ts`.
- **One intermittent failure seen, and its cause looks environmental:** `worker.test.ts` "a done transcription with no usable turns" hit Bun's 5 s test limit twice (14.9 s and 8.5 s, once in the full suite, once in the 1st-3rd isolated reruns), while the 3-test run took 65 s in total. Rerun straight after: this tree 6 of 6 pass at about 0.6 s per run; a clean copy of d7e36dc (`git archive`, in scratch) 6 of 6 pass. My reading, NOT proven: the box stalled for several seconds at those moments (other sessions running), and the test's setup (`makeApp` hashes a password with argon2) counts inside the 5 s. That matches TASK-105's unreproduced failure and would also be a cause worth weighing for Q11's stalls on this machine.
- **UNVERIFIED:** a real dead connection on the real database (comes from the PM's rerun, as the TASK says).

## Questions

## Review

**Sober, 2026-11-07: NOT reviewed, no verdict. Parked with the project (owner's 12:16 word, DECISIONS.md).** The code went up as in progress in 3bb7f2c, and is on `develop` through `22d8de8`, because the box has already lost uncommitted work once. On a snapshot, no `.env`: typecheck clean, `bun test` 110 pass, 0 fail, full output kept. Diff read, and it matches this TASK.
~~**To finish when call-scribe resumes:** (1) the DoD's real-driver harness: not written. (2) Jason's § Implementation Notes: not written. (3) My review. (4) Rerun on the real database, through the PM, on a machine that does not pause if he moves it. **Then** TASK-116, still `TODO`.~~

**Corrected, Sober 2026-11-07: everything above about "not written" and "no verdict" is withdrawn, and it was my error (F-entry).** Jason had finished both at 12:13, before my note. **Commit 3bb7f2c's message also says "the real-driver check has not run" and "IN PROGRESS". That is wrong, and stays in history: no rewriting.** This line is the correction.

**Verdict: `DONE`.** Built and proven by the engineer, not tested by a tester. Diff read in full; nothing added since (`git status` clean at 22d8de8). Snapshot of 22d8de8, no `.env`: typecheck clean, `bun test` 110 pass, 0 fail. Jason's harness, run by me on that snapshot:
```
hole: c3 hits the dying connection: ERROR DbTimeoutError code=DB_TIMEOUT in 1001 ms | c4 next call: answered in 0 ms
fin:  c3 ERROR PostgresError code=ERR_POSTGRES_CONNECTION_CLOSED in 0 ms | c4 next call: answered in 0 ms
```
**Accepted limit:** the harness used `removeExpired`, since the fake server has no parameter support; the wrapper treats every method alike. `recovered = false` on any `claimNext` error, not only a timeout: right, for the reason in Jason's comment.
**Not shown, so the back is still not ready:** a real dead connection on the real database. **To finish when call-scribe resumes:** (1) rerun on the real database, through the PM, on a machine that does not pause, if he moves it; (2) TASK-116, still `TODO`.
