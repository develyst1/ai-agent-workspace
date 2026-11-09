# TASK-106: Worker, gateway client and retry
- Source: SPEC-102 (REQ-101), against SPEC-101 contract v1
- Owner: BE (Jason)
- Status: DONE 2026-11-06, Sober, see the end of § Review
- Depends on: TASK-105's code, which is written. **Start now**, behind the store interface as before; everything needing Postgres stays `UNVERIFIED`, and **`REVIEW` only after this TASK's DoD ran against the real database.** The last DoD item also needs Team B's TASK-101 at `DONE`: **it is, as of 2026-11-06 (Silver, via the PM).** Everything else runs against a fake.
- Repo: `call-scribe-back`, held by Team A, batch 2026-11-06. Branch `atom`. **`develyst-ai` is Team B's: never edit it.**
- Git writes allowed: **none.**
- Files you may edit (closed list): `src/worker/**`, `src/gateway/**`, `src/recordings/**` (retry route, delete's discard), `src/index.ts` (start the worker only), `test/**`, `README.md`.

## What to do

Read SPEC-101 § API and § How the back uses it. SPEC-102 § Errors, § The seam, § Flow (Processing).

1. `src/gateway/` is the one place that knows the gateway: snake_case stops here. Multipart with one part `file`. Bearer `LLM_GATEWAY_KEY`. **Every `413`: do not parse the body.**
2. Worker: one job at a time, as in § Flow. Poll every 5 s, 35-minute limit. A job `404` resubmits once, then `job_lost`. **A network error or 5xx fails the job only on the POST; while polling, keep going through them until the limit** (§ The seam).
3. Map failures to `status` + `errorCode`, per § Errors. A gateway `retryable: false` becomes `retryable: false` on the recording. A `429` becomes `busy`, with **no automatic retry**.
4. `POST /api/recordings/:id/retry`. From `summary_failed`, keeps `turns` and redoes only the summary.
5. Start-up recovery per § Flow. Delete during processing: the worker notices the row is gone, discards the result, and writes nothing.
6. Log only: id, status, error code, duration. **Never turn text.**

**One back per database (SPEC-102 § Env):** stop anything on 3101 before a test run against the real database, and remove your test rows.

Tests use a fake gateway started inside `test/`. No real provider, no deployed gateway, no spend, ever, in this TASK.

You decide: worker wake-up (a 2-second poll of the table is fine). Note it.

## Definition of Done

- [ ] `bun test` → passes, with the fake answering:
  - OK: `queued` → `done`; `turns` and `summary` stored; first status seen is `transcribing`, then `summarizing`.
  - `no_speech: true`: `no_speech`, and **no summary call made**. Count the calls.
  - Each of the five gateway error codes, in each step: status, `errorCode`, `retryable` per § Errors.
  - `429` → `busy`, retryable. `503` → `gateway_rejected`. Network down on the POST → `gateway_unreachable`. `413` with an empty body → no parse error.
  - **Network down or 5xx during polling, then back: the job finishes `done`, with no second transcription call.** Still failing at the limit: `poll_timeout` (use a short limit in the test).
  - Job `404` once: resubmitted and succeeds. Twice: `job_lost`.
  - Summary fails, retry: **transcription call count stays the same**, only the summary reruns (AC-15).
  - Retry on `retryable: false` → `409 not_retryable`.
- [ ] Restart (AC-16): kill the server during `transcribing` against a slow fake, start it again; the job finishes. Paste the status before and after. Again during `summarizing`: no new transcription call.
- [ ] Delete during processing: no row and no folder afterwards, no error in the log.
- [ ] Logs: a fake turn containing a marker word; grep the output → nothing.
- [ ] Closed list: `git status --porcelain`.
- [ ] **Final, once the SA says TASK-101 is `DONE`:** the local stub gateway, **from a snapshot, never from Bob's tree** (it may hold his `.env` and `api-keys.json`, and Bun loads `.env` by itself). Silver ran the snapshot and install on 2026-11-06:
  ```
  D=$(mktemp -d); tar -C <develyst-ai path> --exclude=.git --exclude=node_modules --exclude=.env --exclude=api-keys.json -cf - . | tar -C "$D" -xf -
  cd "$D" && bun install --frozen-lockfile
  AUTH_ENABLED=false PORT=3109 AUDIO_TRANSCRIBE_PROVIDER=stub AUDIO_SUMMARY_PROVIDER=stub AUDIO_STUB_MODE=ok bun run start
  ```
  **`AUTH_ENABLED=false` is required, or every call returns `401`.** Run with `AUDIO_STUB_MODE` = `ok`, `no_speech`, `fail`, `truncated`, `summary_fail`, restarting for each. Real upload through to the expected status for each. `NODE_ENV` must not be `production`. Paste each. Stop it by its port, and delete the snapshot.

## Implementation Notes

Jason, 2026-11-06. Repo `call-scribe-back`, branch `atom`, working tree only, no git writes. `develyst-ai` was never edited (read through a `tar` snapshot only). **Not ready for REVIEW: the Postgres runs wait on `DATABASE_URL` (see UNVERIFIED).** Rule from Sober noted: one back per database, port 3101; nothing was run against a real database.

**Layout (my decision):** `src/gateway/client.ts` (the only file that knows snake_case and the gateway's HTTP), `src/gateway/job.ts` (submit + poll + resubmit rules), `src/worker/worker.ts` (one job at a time), retry route in `src/recordings/routes.ts`, store methods in `src/recordings/store.ts` (Postgres + memory). `index.ts` starts the worker. Worker wake-up: an idle worker looks at the table every 2 s (`idleMs`). Every store write is guarded by the status it expects (`WHERE status = …`), so a stopped worker's late answer or a deleted row changes nothing.

**Also done, from Sober's TASK-105 answer:** create is now one atomic `INSERT … ON CONFLICT (client_id) DO NOTHING RETURNING *`, then a read of the existing row when nothing returns. Memory-store test: two creates at once → one `201`, one `200`, same id, one row (passes). **The Postgres version is UNVERIFIED** and is on the DB run list.

**Decided (internal, reversible):**
- POST failures: network error or 5xx → `gateway_unreachable`; `429` → `busy`; every `413` → `gateway_rejected` without reading the body; `503` whose body says `audio_not_configured` → `gateway_rejected`, any other `503` → `gateway_unreachable`; any other 4xx → `gateway_rejected`; a 202 with no `job_id` → `gateway_rejected`.
- While polling, a network error or 5xx continues (no second submit). A non-5xx, non-404 answer (e.g. `401`) fails at once as `gateway_rejected`, because polling on cannot help.
- A job `404` resubmits once; the second `404` is `job_lost`. The 35-minute limit restarts on the resubmit (longest total two limits). Reason: a resubmit at minute 30 should get its own full wait.
- The uploaded file name is never sent; the multipart part is always named `audio.m4a`.
- Missing `audio.m4a` while the row still exists → `transcription_failed` / `audio_missing` (retryable true by the table's "anything else"); a missing file because the row was deleted is silent.
- **Deviation to confirm (Sober):** `isRetryable` now treats `provider_rejected_audio` and `output_truncated` as not retryable in BOTH steps. SPEC-102's table lists only `output_truncated` for `summary_failed`. A test of "summary + provider_rejected_audio → retryable:false" (the gateway's flag, SPEC-101) failed against the table, and the rule "a gateway `retryable:false` becomes `retryable:false`" decided it. **Not representable:** an unknown code the gateway marks `retryable:false` would show as retryable, because there is no column for the flag. SPEC-101 lists no such code.

**Evidence (real output):**
- `bun run typecheck` → clean. `bun test` → `82 pass / 0 fail / 287 expect() calls`, 63.7 s (one earlier full run took 398 s while the box was busy; separate files 1 s, 11 s, 51 s; not investigated further). Worker tests use a fake gateway started inside `test/` (`test/fake-gateway.ts`, localhost, no provider, no spend):
  - OK: statuses sampled `["queued","transcribing","summarizing","done"]`; turns and summary stored; summary request body equals the stored turns; `Authorization: Bearer test-key` on every call; uploaded part name `audio.m4a`.
  - `no_speech`: status `no_speech`, `fake.calls.summary` = 0, turns stay `null`.
  - All five gateway codes × both steps: status, `errorCode`, `retryable` (provider_timeout, provider_failed, provider_response_invalid → true; provider_rejected_audio, output_truncated → false). Transcript kept on a failed summary.
  - POST: `429`→`busy`; `503 audio_not_configured`→`gateway_rejected`; other `503` / `500`→`gateway_unreachable`; `400`, `415`→`gateway_rejected`; `413` with an empty body and with a JSON body→`gateway_rejected`, no parse error; network down on the POST→`gateway_unreachable` with 0 calls reaching the fake. Each of these: exactly 1 POST (no automatic retry).
  - Polling: 3 network errors then OK → `done`, `calls.transcribe` = 1. Three `502`s then OK → `done`, `calls.transcribe` = 1. Still `500` at a 150 ms limit → `poll_timeout`. Never-finishing job → `poll_timeout`. `401` while polling → `gateway_rejected`.
  - Job `404` once → resubmitted, `done`, `calls.transcribe` = 2. Twice → `job_lost`, 2 calls. A lost summary job resubmits the summary only (`[transcribe, summary]` = `[1, 2]`).
  - Retry (AC-15): summary fails, `POST …/retry` → `202 queued`, `errorCode` null, turns equal to before; then `done`; `[transcribe, summary]` = `[1, 1]` before and `[1, 2]` after. Transcription failure retry → `done` (2 transcribe calls). `retryable:false` → `409 not_retryable`; never-failed row → `409`; unknown id → `404`; logged out → `401`.
  - Restart, **in-process only**: worker stopped while `transcribing` → second worker logs `requeued 1 in-flight recording(s)` and finishes `done`. Stopped while `summarizing` → second worker finishes `done`, `calls.transcribe` stays 1, `calls.summary` = 2. A stale worker's late `storeTurns` / `markFailed` after a requeue returns `false` and the row stays `queued`.
  - Delete during processing: `DELETE` → `204` while `transcribing`; after the fake job finishes, no row, no folder (`existsSync` false), `console.error` never called, `calls.summary` = 0.
  - Privacy: turn text, summary and file name all containing a marker word, plus a failing run; every `console.log/error/warn` line captured (non-empty: ids and statuses are logged); `not.toContain(marker)` → passes.
- **Final item, the real stub gateway (TASK-101 is `DONE` per this TASK's header):** snapshot of the `develyst-ai` working tree with `tar --exclude=.git --exclude=node_modules --exclude=.env --exclude=api-keys.json`, into the scratchpad; `bun install --frozen-lockfile` → `5 packages installed`; `ls -a` of the snapshot shows no `.env` and no `api-keys.json`. Five gateways at once on ports 3109-3113 (one per mode instead of restarting one; `AUTH_ENABLED=false`, `AUDIO_*_PROVIDER=stub`, `AUDIO_STUB_DELAY_MS=600`, `NODE_ENV` unset). The back's real intake, worker and client ran against each through `ai-worker/tests/harness/back-vs-stub-gateway.ts` (memory stores, synthetic tone, real upload route):
  ```
  ok           statuses: transcribing -> summarizing -> done            final: status=done errorCode=null retryable=false turns=4 summaryChars=113
  no_speech    statuses: transcribing -> no_speech                      final: status=no_speech errorCode=null turns=null summaryChars=null
  fail         statuses: transcribing -> transcription_failed           final: errorCode=provider_failed retryable=true turns=null
  truncated    statuses: transcribing -> transcription_failed           final: errorCode=output_truncated retryable=false turns=null
  summary_fail statuses: transcribing -> summarizing -> summary_failed  final: errorCode=provider_failed retryable=true turns=4 summaryChars=null
  ```
  Stopped the five processes by pid (cwd confirmed as the snapshot via `readlink /proc/<pid>/cwd`, bare `kill`); `ss -ltn | grep -cE ':31(09|1[0-3])'` → `0`; snapshot deleted. `git status --porcelain` in `develyst-ai` shows only Bob's changes (I wrote nothing there).
- `git status --porcelain` in `call-scribe-back` → `.env.example .gitignore bun.lock migrations/ package.json scripts/ src/ test/ tsconfig.json`; `grep -E '\.(m4a|mp3|wav|ogg|webm|flac|mp4|amr)$'` on it → nothing (exit 1). ✅

**UNVERIFIED — need `DATABASE_URL`:**
- Every new SQL statement: `claimNext` (`FOR UPDATE SKIP LOCKED` in an `UPDATE … WHERE id = (SELECT …)`), `storeTurns` (`${JSON.stringify(turns)}::jsonb`), `markNoSpeech`, `markFailed`, `storeSummary`, `requeueInFlight`, `requeueFailed`, and the `ON CONFLICT` create. `jsonb` read-back of `turns` is mapped in `fromPg` and never ran.
- The DoD's **real restart** (kill the server process during `transcribing`, start again) and the Postgres status before and after. Only the in-process stop is proven.
- Not yet run: `/security-review`, `silent-failure-hunter`.

**Postgres and restart run, Jason 2026-11-06 (same conditions as TASK-105's note; fake gateway from `test/fake-gateway.ts`, delay 2.5 s, localhost only, no real provider):**
- `pg-store-105-106.ts` ALL PASS (27): **3 concurrent `claimNext` with 2 queued → 2 distinct rows, 1 null** (`FOR UPDATE SKIP LOCKED`); `storeTurns` jsonb read-back equals what was stored (Thai text, a quote, a backslash); the status guards (`storeTurns`/`storeSummary` on the wrong status → false); `markNoSpeech`; `markFailed` + code; `requeueFailed` clears the error, null on a non-failed row; `summary_failed` keeps turns and the next `claimNext` goes straight to `summarizing`; `requeueInFlight` → 2 with turns kept.
- **Real restart (AC-16)**, `pg-restart-106.ts` (the back runs as a child process and is killed by the script): *A* killed in `transcribing` (DB status before kill `transcribing`, right after kill still `transcribing`) → restarted back logs `requeued 1 in-flight`, ends `done`. *B* killed in `summarizing` → restarted, ends `done`, **fake gateway transcribe calls 3 before and after the restart** (no new transcription call). Delete during processing: row and folder gone, no error line in the log. ALL PASS, run twice (second time after the fix below).
- **Found by my manual `catch` read, fixed:** `worker.ts` `run()` called `requeueInFlight()` outside the loop's inner `try`, and the outer `catch {}` swallowed anything. A database down at boot would end the worker with no log and leave every upload `queued` forever. Now boot recovery runs inside the loop and is retried until it works; the error class is logged each time. New test `boot recovery failing` (first `requeueInFlight` throws → logged, retried, queue still processed, message not logged).
- **`audio_missing` change (Sober's answer):** added to `NOT_RETRYABLE` in `src/recordings/serialize.ts`; new test: queued row with no audio on disk → `transcription_failed`/`audio_missing`, `retryable:false`, retry → `409 not_retryable`, gateway never called.
- `bun test` → **84 pass / 0 fail / 294 expect()**; `bun run typecheck` clean; `git status --porcelain` → only the listed paths; `ss -ltn | grep -c ':3101'` → 0. First restart run was void: `Bun.spawn(["bun",…])` went through the pnpm shim and `kill()` left a server behind on 3101 (cwd checked, killed by bare pid); the script now spawns `process.execPath`.
- **Not done:** `silent-failure-hunter` agent (not in my session; manual pass above instead). The stub-gateway final item is Sober's "do not rerun" ruling. Gateway-less `.env` keys: I passed dummy `LLM_GATEWAY_*` on the command line only.

**Rework, Jason 2026-11-06 (Sober's § Review R1, `worker_crashed`). `bun test` only, no database touched:**
- `src/worker/worker.ts`: `runOne` records the row it works on (`current`); a crash (not a stop) moves it to `crashed`. At the top of each loop, before claiming, `failCrashed()` does `get`; if the row is still `transcribing`/`summarizing` it `markFailed`s it `transcription_failed`/`summary_failed` with `worker_crashed`, then forgets it. If `get` or `markFailed` throws, the id is kept, one line `could not fail a crashed job yet: <ErrorName>` is logged, and nothing new is claimed until it works. **No automatic requeue.** A stop (`signal.aborted`) keeps today's behaviour, boot recovery covers it. `worker_crashed` is retryable (the default; error codes are not a closed list in the back).
- Tests (`test/worker.test.ts`, memory store, a store method made to throw): (1) `storeTurns` fails once → `transcription_failed`/`worker_crashed`/`retryable:true`, **the next queued row still runs to `done`**, transcribe calls = 2 (one per recording); (2) `storeTurns` fails once and `markFailed` fails twice → same end state, transcribe calls 1, log has `could not fail a crashed job yet: Error`; (3) `storeSummary` fails once → `summary_failed`/`worker_crashed`, turns kept, retry `202` → `done`, transcribe calls 1, summary calls 2. In (1)–(3) the log never holds the error's message (`secret-detail` planted in it), class name only. 3 pass.
- Whole suite: **89 pass / 0 fail / 319 expect()**; typecheck clean; no worker was run against `call_scribe`.
- Not changed by this rework: the earlier real-Postgres restart evidence (it ran before this change; the restart path itself is untouched).

## Questions

- Jason → Sober: (1) OK to treat `provider_rejected_audio` as non-retryable in the summary step too (deviation above)? (2) Gateway `retryable:false` on a code not in SPEC-101 cannot be stored (no column); leave it, or add a column in a SPEC change?
  > answer (Sober, 2026-11-06): **(1) Yes, and it is not a deviation.** Your step 3 and SPEC-101 say it; my § Errors table was the gap, now fixed. Read at `develyst-ai` `src/audio/http.ts:25`: this code needs `audio` true, so a summary should not produce it. Your handling is the safe one if it ever does.
  > **(2) Leave it, no column.** `AudioJobErrorCode` is a closed list of five (`src/audio/types.ts`), each with a fixed flag. A sixth code is a SPEC-101 change, and reaches me first. The worst case is one extra retry he presses himself.
  > **One change, from reading your notes:** add `audio_missing` to `NOT_RETRYABLE`. The Transcription failed string says the audio is still there and to press retry, and here it is gone, so a retry can only fail the same way. Add a test: `retryable` false, retry → `409 not_retryable`. It is now in SPEC-102 § Errors; the string is with the PM (Q9 c). Your other decisions in the notes stand, including the limit restarting on a resubmit and `401` while polling failing at once.
  > **Stub run:** your 17:08 run stands as this DoD item's evidence. It ran before the 17:18 reset took the `/audio` mount out of Bob's tree. **Do not rerun it now:** `/audio` answers 404 until Silver re-proves it, and that word comes through the PM. This change does not touch the seam, so it does not hold `REVIEW`.
  > **Database: released, see TASK-104 § Questions, and do that TASK's order first.** Then this TASK's Postgres list and the real restart.

## Review

**Sober, 2026-11-06: `REWORK`, one item, and **the gap is in my SPEC, not your work**: § Flow says what a provider failure does, and nothing about the back's own database failing.** The Postgres and restart evidence is accepted as read; I did not rerun it. Your boot-recovery fix was a good catch.

**R1. A database error during a job leaves the recording stuck, with no way out.** A failed write leaves the row in-flight until the next restart, as the comment in `worker.ts`'s `catch` says. Probe, snapshot, memory store, `storeTurns` throwing once: `3 s after one failed write: transcribing errorCode null transcribe calls 1`. The app then polls forever on "กำลังถอดเสียง", with no retry, against AC-14. The database is remote, so a dropped connection during a 30-minute job is realistic.
- Keep the id of a row whose job crashed. At the top of each loop, before claiming, try: `get` it; if it is still `transcribing` or `summarizing`, `markFailed` it (`transcription_failed` or `summary_failed`, by its current status) with `errorCode` `worker_crashed`; then forget it. If that write also fails, keep the id and try again next loop, so it recovers when the database does.
- **Do not requeue automatically:** a crash that repeats would pay for a transcription every two seconds. A retry stays his own press. `worker_crashed` is retryable under "anything else", and the existing strings are true for it; stored turns are kept, so a retry from `summary_failed` only redoes the summary.
- A stop (`signal.aborted`) keeps today's behaviour, and boot recovery still covers it.
- Tests, memory store: write fails once after transcription → `transcription_failed`/`worker_crashed`, `retryable: true`, then the next `queued` row still runs. Write fails 3 times, then recovers → same end state. Crash in `summarizing` → `summary_failed`, turns kept. No second transcription call in any of these. No error message in the log, class name only.

**No database run needed**: the statements are the ones you already proved. Run `bun test` only, and no worker against `call_scribe`: Fern is on the real back now. Also see TASK-105 § Review on the intermittent failure.

**Sober, 2026-11-06, re-review: `DONE`.** Built and proven by the engineer, not tested by a tester. Reran on a snapshot of the working tree, no `.env`: typecheck clean, 89 pass, 0 fail. My probe, with `storeTurns` throwing once, now gives `transcription_failed worker_crashed retryable true transcribe calls 1`. Read: a crash fails the row, a stop keeps it for boot recovery, and nothing new is claimed while the row cannot be failed.
**Evidence limits, accepted:** `worker_crashed` ran on the memory store only; it uses `get` and `markFailed`, already proven on Postgres. The real restart and the stub run predate this rework, and neither path changed. **TASK-110's run covers the stub again.** Real provider behaviour stays with TASK-103. The rework is uncommitted, and goes up only on the owner's next `ขึ้น git`.
