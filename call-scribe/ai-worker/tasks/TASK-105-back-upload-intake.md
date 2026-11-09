# TASK-105: Upload, intake, list, read, delete
- Source: SPEC-102 (REQ-101)
- Owner: BE (Jason)
- Status: DONE 2026-11-06, Sober, one open note, see the end of § Review
- Depends on: TASK-104's code, which is written. **Start now.** Build behind a store interface, as you did for sessions, and prove all you can with ffmpeg and files. Everything that needs Postgres stays `UNVERIFIED` until `DATABASE_URL` arrives; **`REVIEW` only after this TASK's DoD ran against the real database, after TASK-104.**
- Repo: `call-scribe-back`, held by Team A, board § Batch claims, batch 2026-11-06. Branch `atom`.
- Git writes allowed: **none.**
- Files you may edit (closed list): `src/recordings/**`, `src/intake/**`, `src/index.ts` (mount only), `src/env.ts` (only if a key is wrong), `test/**`, `README.md`, `package.json`, `bun.lock`.

## What to do

Read SPEC-102 § The recording object, § Upload, § Read retry delete (not retry: TASK-106), § Intake, § Flow's hourly clean-up.

1. All upload routes and `GET` list, `GET` one, `DELETE`, exactly as written. `:id` must be a uuid. `chunkSizeBytes` is 5242880.
2. Intake on `complete`: the five steps in § Intake, **in order, with the argument array, never a shell string.** Never use the uploaded name in a path or command.
3. On `415` and `413` from `complete`: delete the row and its folder before answering.
4. `complete` again after it succeeded returns the same result. Create with an existing `clientId` returns `200` and `receivedChunks`.
5. Hourly clean-up: `uploading` rows and folders over 24 hours old, **and expired `sessions` rows**. You may edit `src/auth/sessions.ts` for that one delete.
6. `status: "queued"` is set here. Nothing processes it until TASK-106.

**One back per database (SPEC-102 § Env):** the clean-up deletes rows, so stop anything on 3101 before a test run against the real database, and remove your test rows.

**Test audio is generated at test time** with ffmpeg into a temp folder. No audio file enters the repo. Synthetic only.

You decide: module layout. Note it.

## Definition of Done

The expected exits are what I ran on 2026-11-06 (SPEC-102 § What I read and ran). A different result is a finding: write it down.

- [ ] `bun test` → passes, and generates each of these:
  - M4A, MP3, Ogg/Opus, WebM/Opus, FLAC, WAV: `202`, `queued`, stored `audio.m4a` is `aac,audio,16000,1`.
  - Text renamed `.mp3`, random bytes `.m4a`, truncated `.m4a`, MP3 with 20 KB of random bytes mid-file, MP4 with no audio: `415`, **row gone and folder gone**.
  - 0-byte: `415` at create, nothing created.
  - Silence: `202`, `no_speech`.
  - Truncated WebM: `202`, `queued` (a cut-off recording survives).
- [ ] **Picture gone (AC-21):** upload an MP4 with video and sound. `ffprobe` on the stored file shows audio only, and `find <STORAGE_DIR>/<id>` lists only `audio.m4a`. Paste both.
- [ ] Upload: a 12 MiB file in three pieces, out of order. Missing one → `409 chunks_missing` naming it. Sending it → `complete` works. Wrong length → `400 bad_chunk`. Creating again → `200` with `receivedChunks`.
- [ ] Size: `sizeBytes` over the limit → `413`. A low `GATEWAY_MAX_BYTES` set for one test run → `413`, row and folder gone.
- [ ] Time (AC-19): generate a 60-minute file; `time` the `complete` call → under 30 s; stored size pasted.
- [ ] A path-style file name such as `../../x.m4a` is stored as display text and writes nothing outside `STORAGE_DIR`.
- [ ] Clean-up: an `uploading` row older than 24 hours and an expired session are gone after one run; a fresh one of each stays.
- [ ] Delete: row and folder gone (paste `find`), a second delete `404`.
- [ ] List: newest first; no `uploading` rows; no `turns` or `summary`. All routes `401` when logged out.
- [ ] Logs: grep the server's output for the test file name and find nothing. Paste the command and result.
- [ ] Closed list: `git status --porcelain`; no audio file: `git status --porcelain | grep -E '\.(m4a|mp3|wav|ogg|webm|flac|mp4|amr)$'` → nothing.

## Implementation Notes

Jason, 2026-11-06. Repo `call-scribe-back`, branch `atom`, working tree only, no git writes. **Not ready for REVIEW: every Postgres-dependent check waits on `DATABASE_URL` (see UNVERIFIED).** Rule from Sober's inbox 2026-11-06 noted: one back per database, port 3101, stop it before a real-database run, remove test rows. Nothing was run against a real database.

**Layout (my decision):** `src/recordings/{types,serialize,store,routes,cleanup,mount}.ts`; `src/intake/{ffmpeg,files,intake}.ts`. `mount.ts` exists because `createApp` (`src/http/app.ts`) is TASK-104's file and not on this closed list: `index.ts` and the tests both call `mountRecordings(app, …)` after `createApp`. `src/auth/sessions.ts` gets `removeExpired()` for the clean-up, as allowed. `RecordingStore` interface has a Postgres and a memory implementation, like sessions.

**Decided (internal, reversible):**
- A non-uuid `:id` answers `404 recording_not_found` on every route (the SPEC lists no 400 for it).
- Create validates shape first (`400 invalid_request`), then `sizeBytes` 0 → `415`, then over `MAX_UPLOAD_BYTES` → `413`.
- A chunk body is read with a cap of the expected length; longer or shorter → `400 bad_chunk`. It is written to a temp name and renamed, so a half-written piece never counts as received.
- `complete`: two calls at once share one in-flight intake (same answer). A recording deleted mid-intake leaves no files behind.
- Intake: a file that validates but fails to normalise or probe is `415` too. An ffmpeg timeout (10 min) is a server error (`500`), never `415`. Pieces are streamed into the original, never held in memory.
- DELETE removes the folder first, then the row, so a failed row delete can be retried.
- Hourly clean-up: `startCleanup` in `index.ts` (`setInterval`, one hour), errors logged by class only.

**Evidence (real output):**
- `bun run typecheck` → clean. `bun test` → `40 pass / 0 fail / 183 expect() calls` (52 s, ffmpeg 7.x on this box). Generated at test time, nothing committed:
  - M4A, MP3, Ogg/Opus, WebM/Opus, FLAC, WAV, truncated WebM: `202`, `queued`, stored audio `ffprobe` → `aac,audio,16000,1`.
  - Text `.mp3`, random-bytes `.m4a`, truncated `.m4a`, MP3 with 20 KB random bytes mid-file, MP4 with no audio: `415 unsupported_file`, row gone, folder gone, `GET` then `404`.
  - 0-byte: `415` at create, nothing created. Silence: `202 no_speech`.
  - MP4 with picture and sound (AC-21): `readdir(<id>)` → `["audio.m4a"]`, `ffprobe` → `aac,audio,16000,1` (audio stream only).
  - 12 MiB-class WAV in 3 pieces, out of order: missing → `409 {"error":{"code":"chunks_missing","missing":[1]}}`; short piece → `400 bad_chunk`; index past the end → `400`; create again → `200` with `receivedChunks:[0,2]`; resend a piece → `204`; `complete` → `202 queued`; again → same; PUT after → `409`.
  - `MAX_UPLOAD_BYTES=1000`, `sizeBytes` 1001 → `413`, nothing created. `GATEWAY_MAX_BYTES=1000` → `413`, row and folder gone.
  - File name `../../x.m4a` stored as display text; `readdir(STORAGE_DIR)` → only the id; nothing written outside.
  - List: newest first, no `uploading`, no `turns` or `summary`; read has them. Delete → `204`, folder and row gone, second delete `404`. All six routes `401` logged out.
  - Clean-up: 25-hour-old `uploading` row and expired session removed (`{uploadsRemoved:1, sessionsRemoved:1}`), folder gone; fresh row, its folder and fresh session stay.
  - AC-19, 60-minute tone (64 kbps AAC, 29,638,418 B in): `complete took 10.4 s` (runs: 11.0, 11.3, 10.4), stored `audio.m4a` 18,316,939 B. Under 30 s. A tone, not speech.
- Logs: harness `ai-worker/tests/harness/back-log-privacy.ts` boots the back on memory stores, uploads under the name `SECRET-CALL-NAME-7391.m4a`, hits a refused file and a bad chunk. Server output: `harness server on 127.0.0.1:3101 / complete -> 202 / refused complete -> 415 / list -> 1 recording(s)`. `grep -c "SECRET-CALL-NAME-7391" <that output>` → `0`. Port 3101 free afterwards (`ss -ltn | grep -c ':3101'` → `0`). ✅
- `git status --porcelain` → `.env.example .gitignore bun.lock migrations/ package.json scripts/ src/ test/ tsconfig.json` (the repo is untracked as a whole until the SA commits). `git status --porcelain | grep -E '\.(m4a|mp3|wav|ogg|webm|flac|mp4|amr)$'` → nothing (exit 1). ✅
- Tests clean up their own temp folders (`afterAll`).

**Finding (SPEC check):** a plain 60-minute 64 kbps source at 29.6 MB normalised to 18.3 MB at 40 kbps, as predicted (SPEC said 17.4 MB for a tone). No difference from the table that needs a decision.

**UNVERIFIED — need `DATABASE_URL`:** `pgRecordingStore` (every SQL statement in `src/recordings/store.ts`), `removeExpired` SQL, `jsonb`/`bigint` mapping, `ON` uniqueness of `client_id`, and every DoD item above on the real database. The same assertions run on the memory store only. Also not yet run: `/security-review` (path-unsafe id, file name, cookie), `silent-failure-hunter`.

**Not covered by the memory store, worth the DB run:** two creates with the same `clientId` at once (the second `insert` would hit the `UNIQUE` and answer 500). I did not add a catch for it; tell me if you want a retry-as-`200` there.

**Postgres run, Jason 2026-11-06 (call_scribe on the owner's dev Postgres; 3101 free before and after; `.env` not opened, URL never printed):**
- `tests/harness/pg-store-105-106.ts` (the real `pgRecordingStore`, `pgSessionStore`, `runCleanup`; refuses to start if `recordings` is not empty): **27 PASS, 0 FAIL, "ALL PASS"**. Covers for this TASK: insert, bigint `size_bytes` 12345678901 round-trip, same `clientId` → `created=false`, **4 concurrent creates with one `clientId` → exactly 1 created, all the same id, no throw** (the `ON CONFLICT` race), `setIntakeResult` true/false, `list` hides `uploading`, clean-up (`uploadsRemoved:1, sessionsRemoved:1`; old row and folder gone; fresh row, folder and session stay), `remove` true then false. Ends `recordings left=0 sessions left=0`.
- `tests/harness/pg-restart-106.ts` against the running back, real Postgres, generated 4 s WAV: create → chunk 204 → complete 202; list newest first with no `turns`/`summary`; logged out `401`; delete during processing `204`, second delete `404`, folder gone (`dirs=2` left = the two finished ones); the back's log holds no file name and no turn text. ALL PASS.
- Still **only on the memory store** (ffmpeg matrix: M4A/MP3/Ogg/WebM/FLAC/WAV, 415 cases, 60-minute time, 12 MiB out-of-order chunks, 413, picture gone): their file handling does not touch Postgres, and `bun test` has them at 84 pass. Not repeated on the real database except the one WAV above.
- **Manual silent-failure pass** (the `silent-failure-hunter` agent is not available in my session, so this is NOT that agent): read every `catch` in `src/` (13). One real finding, in TASK-106's `worker.ts` (fixed there, see TASK-106). The rest log a class name or return a SPEC'd error. **`/security-review` is Sober's at review.**

**Intermittent failure, Jason 2026-11-06 (Sober's § Review): unreproduced.** `tests` loop: the whole `bun test` suite run 10 times in a row with `nproc/2` busy-loop processes on the box, full output kept per run, stopping at the first failure. Result: **10 of 10 runs exit 0, 89 pass / 0 fail each**, 80–90 s per run (the suite had 89 tests by then: +5 from the two reworks). `grep -l "(fail)"` over the ten logs → nothing. So I cannot name a test. My guess, NOT verified: the failure Sober saw ran at 105 s, the slowest of the runs, which fits a time limit (e.g. the 60-minute `complete` under 30 s, or `waitFor`'s 4 s) being hit on a loaded box; the load I made did not push any run over 90 s. If it recurs, keep the full output and the failing test's name goes in this file.

## Questions

- Jason → Sober: the concurrent same-`clientId` create above: leave as is (one owner, one phone) or turn the unique violation into the `200` path?
  > answer (Sober, 2026-11-06): **Turn it into the `200` path.** The SPEC says an existing `clientId` answers `200`, and overlap is realistic: on a weak connection the phone times out and retries while the first request is still running. Use `INSERT … ON CONFLICT (client_id) DO NOTHING RETURNING …`, and when nothing returns, read the existing row. No catch and no retry loop. **Add to your Postgres run:** two creates at once with one `clientId` → one `201`, one `200`, same `id`, one row. The rest of your decisions stand.
  > **Then start TASK-106**, up to its real-database checks (its header says how far).

## Review

**Sober, 2026-11-06: no verdict yet, stays `REVIEW`, one thing to settle.** No defect found in this TASK's code, and the Postgres evidence is accepted as read; I did not rerun it.

**An intermittent test failure, not identified.** On the committed code, 6130c6e, in a snapshot with no `.env`: `bun test` gave `83 pass, 1 fail` in 105.67 s, then `84 pass, 0 fail` twice, in 76.47 s and 81.41 s. **I cut the failing test's name by tailing the output, so I do not know which test, or which TASK's.** Your notes record one full run of 398 s on a busy box, so time limits are my first suspect; that is a guess. Since this TASK's DoD is that suite passing:
- Run the whole suite in a loop, keeping the full output, with other load on the box, until it fails or 10 runs pass. Name the test and the cause, and paste them.
- A test's time limit too tight for a loaded box: fix the test. A real race in the code: tell me before fixing. Ten clean runs: say so, and I record it as unreproduced.

**Security, by hand, at 6130c6e, no finding:** `:id` checked against an anchored uuid on every route · stored paths are built only from that id · the file name is never in a path or a command · ffmpeg and ffprobe use argument arrays · `index` must be digits and in range · chunk bodies are read with a length cap · `requireSession` covers the whole router.

**Sober, 2026-11-06: `DONE`, with one open note.** Built and proven by the engineer, not tested by a tester. No code defect found; the Postgres evidence is accepted as read.
**Open, recorded as unreproduced:** the single `bun test` failure I saw at 6130c6e was not named, and I cut its name myself. Since then: Jason's 10 loaded runs clean, then one more of mine clean with full output (89 pass, 0 fail). That is 1 failure in 14 full runs, on two versions of the code, cause unknown. The time-limit explanation is a guess. It may be in any of the three test files, and it does not point at this TASK's code more than the others. If it recurs: keep the full output, name the test.

**Sober, 2026-11-07, on the open note:** a candidate now has a name, from Jason (TASK-115 § Implementation Notes): `worker.test.ts` "a done transcription with no usable turns" hit Bun's 5 s test limit twice, 14.9 s and 8.5 s, then passed 6 of 6 and on a clean d7e36dc. Jason's reading is that the box stalled, and that fits Q11's gaps. **Not shown to be the same failure I saw:** I never had its name. Left as is; it is a test's time limit on a pausing box, if anything.
