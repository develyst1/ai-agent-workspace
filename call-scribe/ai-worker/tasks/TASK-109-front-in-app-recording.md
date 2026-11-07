# TASK-109: Record in the app, and keep what was captured
- Source: SPEC-102 (REQ-101)
- Owner: FE (Fern)
- Status: DONE 2026-11-06, Sober, see the end of § Review
- Depends on: TASK-108's `upload.ts`, which is built. **Start after TASK-111.** Prove all you can with the fake mic and your stand-in; everything needing the real back stays `UNVERIFIED`. **`REVIEW` only after this TASK's DoD ran against the real back.**
- Repo: `call-scribe-front`, held by Team A, batch 2026-11-06. Branch `atom`.
- Git writes allowed: **none.**
- Files you may edit (closed list): `src/app/**`, `src/components/**`, `src/lib/**`, `e2e/**`, `package.json`, `bun.lock`.

## What to do

Read SPEC-102 § Flow (Record, Cut off).

1. `อัดเสียง` asks for the mic, then records with `MediaRecorder`, a 5000 ms timeslice, first supported of `audio/webm;codecs=opus`, `audio/mp4`.
2. **Each piece goes to IndexedDB as it arrives**, not at the end. Database `call-scribe`, with one entry per recording: `clientId`, MIME, created time, pieces.
3. Screen wake lock during recording, re-acquired when the page is visible again. Failure to get one is not an error.
4. Stop: assemble a `Blob` from IndexedDB, send it with TASK-108's `upload.ts`, `source: "mic"`. **Delete the entry only after `complete` succeeds.**
5. Track `ended`, recorder `error`: stop, keep the pieces, show Recording cut off.
6. Every app open: an unfinished entry shows Recording cut off, with an action to send what was kept. After a failed send it stays too.
7. Mic refused or absent: its string, and nothing is recorded.
8. **Added 2026-11-06 (SPEC-102 Q10, REQ-101 § User-facing wording):**
   - No microphone API at all → the row "In the app, no microphone API at all". IndexedDB will not open → the row "In the app, the phone cannot keep a recording": recording does not start. Both replace the `TODO-COPY` markers.
   - **The back answers `413` or `415` on a mic send:** the row "A mic recording the back refuses", **no retry**, entry kept, on the next app open too. Buttons: ลบ, then Delete confirm with ยืนยัน and ยกเลิก. Only a confirmed delete removes the entry. Every other send failure stays as it is, with retry.
   - The list name stays the start time (Q10 d).
9. Disable the file picker while recording (`[SA-decided]`, § Questions).

No call-recording claim anywhere: AC-2 is for no active call. The copy rule is as in TASK-107.

You decide: the IndexedDB wrapper (no library needed). Note it.

## Definition of Done

Playwright in `e2e/`, Chrome at 390 × 844, real back: `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream --use-file-for-fake-audio-capture=<generated wav>`. I ran these flags here on 2026-11-06, and they work on `localhost`.

- [ ] AC-2: record 12 s, stop → sent and processed. `ffprobe` the stored file: duration within 2 s of 12, and `max_volume` above -60 dB (paste the command and result).
- [ ] Crash keeps audio (AC-14): record 12 s, **close the page without stopping** (`page.close({ runBeforeUnload: false })`), new page in the same context → Recording cut off shows; send what was kept → the back accepts it, duration at least 5 s.
- [ ] Cut-off in flight: stop the track from the test → Recording cut off shows, and pieces are kept.
- [ ] A failed send keeps the entry: block `complete`, retry later → success, then the entry is gone (assert by reading IndexedDB).
- [ ] Mic refused: run without the fake-UI flag and with permission denied → its string, no entry.
- [ ] Back refuses a mic send (fulfil `complete` with `415`, and `POST /api/recordings` with `413`, by Playwright routing): its string, no retry control, entry still in IndexedDB. Reload: same message. ลบ then ยกเลิก: entry stays. ลบ then ยืนยัน: entry gone, message gone.
- [ ] No API (`navigator.mediaDevices` removed by init script) and no storage (`indexedDB.open` made to fail): each shows its string, and no recording starts.
- [ ] Picker disabled while recording, enabled after stop.
- [ ] Fake mic with silence → back returns `no_speech`, not `done` (AC-14 "never reports silent as finished"). Paste the status.
- [ ] Reachability: screenshot of recording in progress at 390 px.
- [ ] `UNVERIFIED — real mic, screen off and incoming call on his Oppo (AC-13).`
- [ ] Types and build pass; closed list: `git status --porcelain`, with no audio file in it.

## Implementation Notes

**Fern, 2026-11-06. Status stays `IN_PROGRESS`: the DoD has not run against the real back (rule in "Depends on"). Paused for TASK-111 REWORK (Sober's order).**

Built (all in the closed list): `src/lib/recordingStore.ts` (new), `src/components/Recorder.tsx` (new), `src/components/Home.tsx` (Recorder replaces the disabled button), `src/components/FilePicker.tsx` (`export` added to `SendStatus` and `Phase`, so a mic send shows exactly as a picked file does), `src/lib/copy.ts` (`recorder` block; mic strings point at the `check` rows), `e2e/record.spec.ts` (new).

You-decide, noted: IndexedDB wrapper is hand-written, four calls, one `recordings` store keyed by `clientId`, one entry per recording as the SPEC says; each piece is read-modify-written, appends chained so they never overlap. The entry's `clientId` is also the upload's `clientId`, so a send retried after the app closed resumes. Uploaded name is the start time only (`2026-11-06-174217.webm`, `.m4a` for mp4): no invented words.

Harness (throwaway, `tests/harness/`): `stub-back-109.mjs` = the 107 stand-in that also keeps each finished upload's bytes and answers `no_speech` when ffmpeg `max_volume` < -60 dB; `make-fixtures-109.sh` = 30 s tone and 30 s silence wav for Chrome's fake mic. Not the real back, not its decoder.

Evidence, 390 x 844 Chrome, front = standalone build on :3100, stand-in on :3101, fake mic flags as ordered:
- `bun run typecheck`: `tsc --noEmit`, exit 0. `bun run build`: ok.
- `bunx playwright test e2e/record.spec.ts`: **7 passed (51.1s)**, after the layout fix (the first run before it: 7 passed too).
- AC-2: `AC-2 stored ...bin: duration 12.12s, max_volume -20 dB`. A piece is already in IndexedDB at ~7 s, before stop. After `complete` the IndexedDB list is `[]`.
- AC-14 crash (`page.close({runBeforeUnload:false})` at 12 s, new page same context): cut-off shows, 2 pieces kept, send kept → sent, back received `9.99s` (the last <5 s is lost by design, SPEC's timeslice).
- Track ends in flight: cut-off shows, recording state gone, pieces kept (≥1), send-kept button visible. **The `ended` event is dispatched by the test on the real track** (a script `track.stop()` does not fire it); the real cause (phone takes the mic) is UNVERIFIED.
- Failed send (`complete` aborted): failed panel with the SPEC string, entry kept; unblock, ลองใหม่ → sent, entry gone (read from IndexedDB).
- Mic refused (no fake-UI flag): `data-kind=mic_refused`, string shown, IndexedDB `[]`. No-mic (`NotFoundError`) and no `navigator.mediaDevices`: strings/marker shown, nothing kept.
- Silence: stand-in log `max_volume=-91.0 -> no_speech`; list row `2026-11-06-173243.webm | 6 พ.ย. 2569 17:32 | ไม่พบเสียงพูด`. **Stand-in's rule, not the real back's.**
- Screens: `recording-390.png` and `cut-off-390.png` looked at. First version put the panel between the two action buttons; fixed (`order-10` under both). Stop button 56 px, danger colour with white text.
- Footprint: servers stopped by pid, 3100/3101 free; fixtures and stored uploads are in my scratch folder, none in the repo; `git status --porcelain` shows only untracked project files, no audio.

**Finding for the SA/BE:** MediaRecorder's webm has no duration in its header. `ffprobe -show_entries format=duration` prints `N/A` on the stored file (measured), so my "duration" is the ffmpeg decode time. If the back reads `durationMs` with ffprobe's header duration, mic recordings get none.

**Added after Sober's answers (Q10, item 8-9), Fern 2026-11-06:** the two markers are replaced by the REQ rows (`noMediaDevices`, `storageUnavailable`); a refused state (`rec-refused`): 413 or 415 from the back on a mic send marks the IndexedDB entry `refused`, shows the REQ row with `ลบ` only, no retry, and shows again on every open; `ลบ` → Delete confirm with `ยืนยัน` / `ยกเลิก`, only a confirmed delete removes the entry. File picker disabled while recording (`FilePicker` got a `disabled` prop; `Recorder` tells `Home`). `copy.ts:46` comment fixed (TASK-111's comment). New store function `markRefused`.
Evidence: `bun run typecheck` exit 0; `bunx playwright test e2e/record.spec.ts` → **10 passed (1.4m)**: refused 415-on-complete and 413-on-create (string, no `ลองใหม่`, entry kept, same after reload, ลบ+ยกเลิก keeps, ลบ+ยืนยัน removes and survives a reload), indexedDB.open failing (string, no recording starts), no-API string asserted, picker disabled while recording and enabled after stop. Screenshots looked at: `shots-109/refused-415-390.png`, `refused-confirm-390.png`.
**Run setup note:** port 3101 was held by a process that is not mine (not listed under my user), so I did NOT start my stand-in there: stand-in on 3199, front built with `NEXT_PUBLIC_API_BASE_URL=http://localhost:3199`, both stopped by pid afterwards. (Earlier runs today bound 3101 when it was free; I stopped those by pid.)

UNVERIFIED: everything against the real back; the real mic, screen off and an incoming call on his Oppo (AC-13); wake lock (not exercised); `audio/mp4` path (Chrome picks webm); hidden-tab behaviour.


### Real-back run (Fern, 2026-11-06)

**Real-back setup (Fern, 2026-11-06, after Sober's release):** the real back from `call-scribe-back`, one only, on 3101, started from the command line (`bun src/index.ts`) with my own throwaway `OWNER_PASSWORD_HASH`, `LLM_GATEWAY_URL=http://127.0.0.1:9` and a dummy key (nothing reaches any gateway), `COOKIE_SECURE=false`, and **`FRONT_ORIGIN=http://localhost:3100` on the command line**: the git-ignored `.env` has `FRONT_ORIGIN=http://127.0.0.1:3100`, so the back answered no `Access-Control-Allow-Origin` for `localhost:3100` and the first run failed with "เข้าสู่ระบบไม่สำเร็จ ติดต่อระบบไม่ได้" (my diagnosis, curl preflight). `.env` untouched. Rows: `tests/harness/real-back-rows.mjs` took a snapshot of the ids first (0 rows) and afterwards DELETEd only ids made since: two cleanups, removed 13 and then 3 rows, new rows left 0 each time. Both servers stopped by pid, 3100/3101 free.
`E2E_REAL_BACK=1 bunx playwright test e2e/record.spec.ts` against it: **10 passed (1.5m)**. AC-2: `ffprobe` on the back's `audio.m4a` → `duration 12.24s, max_volume -17.2 dB` (in `[12 ± 2]`, above -60). Crash at 12 s: kept 2 pieces, `back received 10.02s` (≥ 5). Silence: the list row for the real back's answer reads `ไม่พบเสียงพูด` (`no_speech`), not done. Failed send keeps the entry, retry deletes it. The refused states (415 on `complete` and 413 on create were fulfilled by Playwright routing, the back never saw them), no-API and no-storage pass.
**Not met, so this stays `IN_PROGRESS`:** the DoD's "AC-2 … sent **and processed**": with the dummy gateway the mic recordings ended `transcription_failed`, so I have seen the back accept and normalise them, not a result. That needs the stub gateway; **Sober, how do I start it?** Also `UNVERIFIED`: real mic, wake lock, screen off, an incoming call (AC-13).
**Odd, for the back's review (not mine to fix):** after my run deleted every row it made (`clean: new rows left: 0`), the back's storage still held one folder with only `chunks/0` (~108 KB, written during my record run). I did not touch it. It looks like pieces of an upload whose row is gone; I do not know which test left it.

**Second real-back run, with the stub gateway (Fern, 2026-11-06, Sober's answer to Q4):** stub gateway from a snapshot of `develyst-ai` (`AUTH_ENABLED=false PORT=3109 AUDIO_TRANSCRIBE_PROVIDER=stub AUDIO_SUMMARY_PROVIDER=stub AUDIO_STUB_MODE=ok`, `bun install --frozen-lockfile` in the snapshot), the back on 3101 with `LLM_GATEWAY_URL=http://127.0.0.1:3109`, dummy key, throwaway hash, `FRONT_ORIGIN=http://localhost:3100` on the command line. Front rebuilt for 3101.
- `E2E_EXPECT_DONE=1 E2E_REAL_BACK=1 bunx playwright test e2e/record.spec.ts` → **10 passed (1.8m)**.
- **AC-2 now processed:** `AC-2 stored .../audio.m4a: duration 12.12s, max_volume -15.7 dB` and `AC-2 processed: list row 2026-11-06-182151.webm | 6 พ.ย. 2569 18:22 | เสร็จแล้ว`. (`ffprobe -show_entries format=duration` on the back's `audio.m4a`; the back's answer is `done`, ok-mode stub text only.)
- Crash at 12 s: `kept pieces 2, back received 10.02s`. Silence: `ไม่พบเสียงพูด` from the real back's intake, no gateway call needed.
- **The leftover folder was mine:** `curl -X DELETE /api/recordings/9ac0bf28-…` with a session cookie → **`204`**, and the folder was gone (storage had 0 folders). Sober's reading was right: the refused test sends its pieces for real and fakes `complete`, so its row stays `uploading`, and `GET /api/recordings` never lists `uploading`, so my "new rows left: 0" could not see it. My earlier note called it "pieces of an upload whose row is gone": wrong.
- **Harness made honest:** `record.spec.ts` records the id of every `POST /api/recordings` answer (200/201) and an `afterEach` logs in and DELETEs each id (this run: five DELETEs, all `204`, including the refused test's `uploading` row). `real-back-rows.mjs clean` now prints that it cannot see `uploading` rows. After the run: `clean: removed 0, new rows left that the list shows: 0`, storage folders left 0. `file-send.spec.ts` was not changed: its tests finish their uploads; the earlier "new rows left 0" there stands only for rows the list can show.
- Stopped by pid afterwards: back 3101, front 3100, gateway 3109; snapshot and fixtures deleted; `git status --porcelain` in the front repo: no audio file; no `AGENTS.md`.
Still `UNVERIFIED` (phone only): real mic, screen off, an incoming call, wake lock, `audio/mp4`, hidden tab, a real track ending.

### Rework (Fern, 2026-11-06)

Files: `src/components/Recorder.tsx`, `src/lib/upload.ts` (TASK-108's R1, which this TASK depends on), `e2e/record.spec.ts`.
- **R1 (empty entry):** `scan` deletes entries with no piece and moves on; if only empty ones were found it shows Recording cut off with no action. `scan` also does nothing while a recording is running (its own entry is empty then).
- **R2 (recorder will not start):** everything after `createEntry`'s inputs (`isTypeSupported`, `new MediaRecorder`, `createEntry`, handlers, `start`) is in one `try`; a throw stops the tracks, deletes the entry if it was made, and shows the REQ row "In the app, no microphone API at all" (`recorder.noMediaDevices`).
- **TASK-108's R1 for a mic send:** from `upload.ts` (see TASK-108 § Rework R1). Test: `complete` reaches the back and its answer is lost → retry → sent, **`PUTs first attempt 1, on the retry 0`**, entry gone.
- Tests (all on the real back, dummy gateway): `E2E_REAL_BACK=1 bunx playwright test e2e/record.spec.ts` → **15 passed (2.1m)**. New: seeded empty entry (cut off, no send button, entry deleted); an empty entry older than a real one does not hide it (the real one shows, sends, entry gone); `MediaRecorder.prototype.start` throws (`R2: streams active after the throw: [false]; uncaught: []`, no entry); lost `complete` (mic).
- **Finding that changed one test, as you asked me to say if something does not reproduce:** "close the page 2 s after starting → empty entry" is **not deterministic**. In 1 of 4 runs Chrome flushed one last piece into IndexedDB as the page was closed, so the entry had 1 piece and (correctly) a send button. A page closed gracefully is not the same as a killed one. So that test now asserts the invariant (never an empty entry left; the send button exists exactly when a piece was kept; both outcomes seen: `entries after reopening []` and `[… "pieces":1]`), and the empty case is a **seeded** entry written straight into IndexedDB, which is deterministic (4 of 4). I did not run the two new Recorder tests against the old `Recorder.tsx` (the lost-`complete` test I did, see TASK-108).
- Rows: the spec deletes the ids it creates (`cleanup: DELETE … -> 204`); the nine `uploading` leftovers of the interrupted runs were deleted by their folder names (storage had 0 folders before this sitting): all `204`; storage 0 folders afterwards. Back and front stopped by pid, ports free, fixtures deleted, no media in the repo, no git writes.

## Questions

1. **Wording:** the REQ's "no microphone API / recorder will not start" row is for `/check` only (`หน้านี้ใช้ไมค์ไม่ได้…`). For the APP, two cases have no string: no microphone API at all, and "this phone cannot keep the recording" (IndexedDB cannot be opened). Visible markers `TODO-COPY noMediaDevices` and `TODO-COPY storageUnavailable` in `copy.ts` → `recorder`. Please carry both to the PM. (After TASK-111's rework the app uses its own mic-refused and no-mic rows, the longer ones; `/check` the shorter.)
2. **413 / 415 on a mic send** shows "send failed, retry", entry kept, since the local copy is the only copy; retrying can never succeed for those. Fine for now, or a different string?
3. **Name in the list** is the start time only (`2026-11-06-174217.webm`). Same Q8 spirit as the `.m4a` name: ok?
   > answer (Sober, 2026-11-06): **All three are what the owner sees, so they went to the PM: SPEC-102 Q10.** Keep the two visible markers and your present behaviour until the answer comes; it holds `REVIEW`, not your work.
   > **Your finding on webm duration: no change needed.** The back reads duration from the normalised `audio.m4a`, not the upload (`call-scribe-back` `src/intake/intake.ts:30`, SPEC-102 § Intake step 3). Ran here: a live-style webm with no header duration gives `N/A`, and after the SPEC's normalise command, `12.007`. Synthetic, ffmpeg-made, not Chrome's own file; your real-back run settles that, and the DoD's `ffprobe` goes on the stored `audio.m4a`.
   > **Picker during recording `[SA-decided]`: disable it.** A strip started mid-recording could kill the page on a phone and end the recording. No new wording. Add one assertion to `record.spec.ts`.
   > **Your stand-in evidence is noted, with no verdict until the real back.** Real-back runs start when I say: Jason's Postgres runs come first (SPEC-102 § Env, which also has the command-line keys you need). Accepted as `UNVERIFIED`: wake lock, the `audio/mp4` path, hidden tab, a real track ending.
   > Sober, 2026-11-06, on your additions: read; no verdict until the real back. **Stand-in on 3199: fine**, since SPEC-102 § Env's "never change the port" is about a real back, whose worker touches the database. The real-back run stays on 3101. Your UNVERIFIED line still says the picker is not disabled; drop that at your next edit. Next is TASK-110, as ordered.
4. **From § Real-back run:** how do I start the stub gateway? And one leftover folder.
   > answer (Sober, 2026-11-06): **Stub, cleared by the PM after TASK-112.** Exactly TASK-106's last DoD item, always from a snapshot, never from `develyst-ai`'s tree; the path is in `machine.local.md`:
   > ```
   > D=$(mktemp -d); tar -C <develyst-ai path> --exclude=.git --exclude=node_modules --exclude=.env --exclude=api-keys.json -cf - . | tar -C "$D" -xf -
   > cd "$D" && bun install --frozen-lockfile
   > AUTH_ENABLED=false PORT=3109 AUDIO_TRANSCRIBE_PROVIDER=stub AUDIO_SUMMARY_PROVIDER=stub AUDIO_STUB_MODE=ok bun run start
   > ```
   > Then start the back with `LLM_GATEWAY_URL=http://127.0.0.1:3109` and a dummy key on the command line. `AUTH_ENABLED=false` is required, or every call gets `401`. `NODE_ENV` must not be `production`. Stop it by its port and delete the snapshot afterwards. If it stops answering, capture its state first and tell me (TASK-112 § Review). **For this TASK, `ok` mode is enough:** AC-2 reaches `done`. Silence is decided by the back's intake, and you have that. The modes are TASK-110's.
   > **The leftover is probably your test's, not a lost row; inferred from reading, not checked.** `real-back-rows.mjs` finds rows through `GET /api/recordings`, which leaves out `uploading` rows by contract. The refused test sends the piece for real and then fakes `complete` with routing, so its row stays `uploading`. Your "new rows left: 0" could not see it. **Settle it:** start the back, then `curl -i -X DELETE` `/api/recordings/9ac0bf28-ba9e-426b-837d-b92d227b7fd4` with a session cookie. Predicted: `204`, and the folder gone. A `404` means no row, so my reading is wrong: leave the folder, and tell me. Paste the result. **Then make the harness honest:** remove what each run creates, including `uploading` rows, by recording the ids the test creates or by having the refused test delete its own. `clean` must not report 0 when it cannot see them.

## Review

**Sober, 2026-11-06: `REWORK`, two items, plus TASK-108's R1, which this TASK depends on.** Your evidence stands as read, not rerun: all 10 on the real back, AC-2 reaches `เสร็จแล้ว`, the leftover settled, and the harness made honest. Both items are in code the specs do not reach. **Read from the code, not run:** your tests settle them, and if one does not reproduce, say so.

**R1. A page that dies in the first 5 seconds leaves an entry that can never be cleared.** `createEntry` runs before the first piece (`Recorder.tsx:224`). After such a death, `scan` shows Recording cut off for it, with the send button (`:155`). Sending throws "nothing kept to send" (`:114`), so Send failed with a retry that always fails. There is no ลบ on this path, and `scan` shows only the first entry, so **it also hides any real recording behind it.**
- In `scan`: delete entries with no pieces and move on to the next, as `finishAfterStop` already does at `:204`. If that left nothing else to show, show Recording cut off with no action, as `:205` does. He did start one, and it is true that it stopped.
- Test: close the page 2 s after starting, reopen: cut-off with no send button, no entry left. Same, with a real kept entry behind it: the kept one shows, and sends.

**R2. A recorder that will not start fails silently, with the mic open: the same defect as TASK-111's R3.** `isTypeSupported`, `new MediaRecorder` and `r.start` (`:220-221`, `:255`) are outside any `try`.
- On a throw: stop the tracks, delete the entry if it was created, show the "In the app, no microphone API at all" row. Its wording is true for this too; same reading as `/check`'s row. `[SA-decided]`
- Test: `MediaRecorder.prototype.start` throws → its string, stream inactive, no uncaught error, no entry.

**From TASK-108's R1, for this TASK:** a mic send with `complete`'s answer lost → retry → sent, zero PUTs, **entry gone**. Without it, the recording would come back as cut off at every app open while also sitting in the list.

Rest read, no finding: the entry is deleted only after `complete` succeeds · refused state · a failed write stops the recording rather than leaving a hole · appends are chained.

**Sober, 2026-11-06, re-review: `DONE`.** Built and proven by the engineer, not tested by a tester. Diff read: `scan` removes empty entries and skips a running recording; everything after `getUserMedia` is guarded. Typecheck and build pass on a snapshot; your 15 passed on the real back are accepted as read, not rerun. AC-2's `เสร็จแล้ว` ran on the stub before this rework; TASK-110's run covers it again.
**Accepted:**
- My "close the page at 2 s" test was not deterministic, as you found: a graceful close may flush one piece. Your invariant, plus a seeded entry, is the better test. **A closed page is not a killed one,** so a real kill on his phone stays `UNVERIFIED`.
- You did not run the two new Recorder tests against the old code, and said so. So they are not shown red. The behaviour is plain in the diff; left as is.
Remaining `UNVERIFIED`, phone only: real mic, screen off, an incoming call, wake lock, `audio/mp4`, hidden tab, a real track ending. These are AC-13's, and the owner's.
