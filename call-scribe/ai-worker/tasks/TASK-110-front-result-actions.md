# TASK-110: The result screen, retry and delete
- Source: SPEC-102 (REQ-101)
- Owner: FE (Fern)
- Status: DONE 2026-11-06, Sober, see the end of § Review
- Depends on: TASK-106, TASK-107, and Team B's TASK-101 `DONE` (**it is, as of 2026-11-06**, Silver, via the PM). **Updated 2026-11-06:** the 17:18 reset removed the stub's `/audio` mount; Silver restored and re-proved it (TASK-112), and the PM cleared stub runs. **Start after TASK-109's additions**, against your stand-in. The real back and stub gateway run waits on my word, after Jason's Postgres runs; `REVIEW` only after that run. Silver saw one unexplained hang in the gateway's `capacity` suite, 1 run in 10 (TASK-112 § Review): if the stub stops answering, capture its state before stopping it, and tell me.
- Repo: `call-scribe-front`, held by Team A, batch 2026-11-06. Branch `atom`.
- Git writes allowed: **none.**
- Files you may edit (closed list): `src/app/**`, `src/components/**`, `src/lib/**`, `e2e/**`.

## What to do

Read SPEC-102 § The recording object, § Errors and what the app shows, § Read retry delete, § Flow (Reading).

1. A list row opens the recording. Sections as in the REQ: บทสนทนา, สรุป. Each turn shows `ผู้พูด {speaker}` and its text. Render text as plain text, never as HTML: it may quote anything said on a call.
2. While `queued`, `transcribing`, `summarizing`: poll `GET` every 5 s, and stop when it ends or the screen is left. Show the REQ's After sending string.
3. Failure display **exactly per the § Errors table.** `summary_failed` shows the transcript and the summary failure together. A retry control only when `retryable` is `true`.
4. Delete with the REQ's confirm string, then return to the list.
5. `404` on open returns to the list.

The copy rule is as in TASK-107.

You decide: layout within the design file. Note it.

## Definition of Done

Playwright at 390 × 844, real back, with the local stub gateway on port 3109, **from a snapshot** (exact commands, including `AUTH_ENABLED=false`: TASK-106's last DoD item; never run it from `develyst-ai`'s own tree). Restart it with the `AUDIO_STUB_MODE` each case names. No real provider.

- [ ] Done (`ok`): turns with `ผู้พูด 1`, `ผู้พูด 2`, and the summary show (AC-3, 4, 5 display).
- [ ] AC-7 (`fail`): transcription failed → string and retry. Restart the gateway with `ok`; retry reaches `done` without choosing a file again (assert no file input interaction, no PUT).
- [ ] AC-15 (`summary_fail`): summary failed → transcript visible and summary-failed string. Restart with `ok`; retry reaches `done`.
- [ ] `truncated` → Output cut off string and **no retry control**.
- [ ] Stub has no mode for these, so fulfil `GET /api/recordings/:id` with Playwright routing, using the SPEC's exact object: `provider_rejected_audio` → its string, no retry control · `busy` → its string, retry control · `summary_failed` + `output_truncated` → transcript and the Summary output cut off string show, no retry control · `transcription_failed` + `audio_missing` → the Audio file gone from storage string, no retry control (added 2026-11-06, SPEC-102 § Errors).
- [ ] AC-20 (`no_speech`): its string, not an empty result.
- [ ] AC-8: finished recording, close the page, new page in the same context → result opens.
- [ ] AC-16: close the page during `transcribing`, open again later → still processing, or done.
- [ ] AC-18: delete, confirm → gone from the list; back's `find` for that id finds nothing; cancel keeps it.
- [ ] A turn containing `<img src=x onerror=alert(1)>` shows as text. Assert no `img` element and no dialog.
- [ ] Reachability: screenshots at 390 px of done, summary failed, no speech, delete confirm. No horizontal scroll, asserted.
- [ ] Types and build pass; closed list: `git status --porcelain`.

## Implementation Notes

**Fern, 2026-11-06.** Files (all on the closed list): `src/components/RecordingScreen.tsx` (new), `src/components/RecordingList.tsx` (rows are buttons that open a recording), `src/components/Home.tsx`, `src/lib/api.ts` (`getRecording`, `retryRecording`, `deleteRecording`, type `RecordingDetail`), `src/lib/copy.ts` (`result` block, REQ rows copied exactly), `e2e/result.spec.ts` (new).

**You-decide, noted:**
- **Opening:** the open recording is in the address as `#r=<uuid>`, so a reload or a new tab opens it (AC-8, AC-16); `Home` keeps the list screen mounted but `hidden` while a result is open, so a recording in progress or a send under way is not lost by looking at a result. Closing replaces the hash (a deleted or missing recording never stays in the back stack) and refreshes the list.
- **Back to the list:** the app name `call-scribe` in the header is the button (the REQ has no "back" wording).
- **Polling:** `GET` every 5 s while `queued`, `transcribing`, `summarizing`; stops when it ends or the screen is left. A failed poll keeps what is shown and asks again.
- **Failure text:** one function over `status` and `errorCode`, row by row per § Errors; the retry control shows only when `retryable` is `true`. Turns show whenever the back sent them (so a `summary_failed` shows the transcript and the failure together). The summary section shows only on `done`: no partial summary, ever. Turn and summary text are React text nodes (`whitespace-pre-line`), never HTML.
- Layout: the same tokens as the rest of the app; sections stacked, speaker label above each turn.

**Evidence** (real back on 3101, started from the command line with a throwaway password, `FRONT_ORIGIN=http://localhost:3100` and a dummy key; the stub gateway on 3109 from a snapshot of `develyst-ai` with `AUTH_ENABLED=false`, restarted per `AUDIO_STUB_MODE`; Chrome 390 x 844; production front build). `bun run typecheck` exit 0; `bun run build` ok.
- `E2E_PHASE=ok`: **14 passed (1.2m)**:
  - Done: `done: 4 turns shown; summary length 119`, both `ผู้พูด 1` and `ผู้พูด 2`, both section headings, status เสร็จแล้ว. AC-8: after `page.close()` a new page in the same context opens the same result from the address.
  - AC-16: `status when the page was closed: กำลังถอดเสียง`; later the same address shows เสร็จแล้ว with the transcript.
  - AC-18: ยกเลิก keeps it (`GET` still `done`); ยืนยัน returns to the list, the row is gone, `GET` → 404, and the back's folder for that id does not exist (`existsSync` false; storage had 0 folders).
  - No speech (real intake on silence): its string, no retry control, no turns, no summary.
  - A turn `<img src=x onerror=alert(1)>`, a `<script>`, and `<b>` show as text: `main img` count 0, `main script, main b` count 0, no dialog.
  - Eight routed cases (exact § Errors objects, `GET` fulfilled by Playwright routing): `provider_rejected_audio`, `busy` (retry), `audio_missing`, transcription `output_truncated`, transcription "anything else" (retry), summary `output_truncated` (transcript, no retry), summary `provider_rejected_audio` (transcript, no retry), summary "anything else" (transcript, retry). Each asserts the exact text, the retry control present or not, the transcript present or not, and no summary.
  - 404 on open returns to the list (hash cleared).
- **AC-7:** gateway `fail`: `status transcription_failed, errorCode provider_failed, retryable true`, string and retry shown; gateway restarted `ok`; retry → เสร็จแล้ว with the transcript and summary; **`PUTs during the retry: 0; file choosers opened: 0`**.
- **AC-15:** gateway `summary_fail`: `status summary_failed, errorCode provider_failed, retryable true, turns 4`, transcript and the summary-failed string shown, no summary; gateway `ok`: retry → done, the same turns as before, summary shown.
- **Truncated:** `status transcription_failed, errorCode output_truncated, retryable false` → Output cut off string, no retry control.
- Screens looked at, 390 px, `tests/harness/shots-110/`: `result-done`, `result-summary-failed` (routed), `result-summary-failed-real`, `result-transcription-failed`, `result-no-speech`, `result-delete-confirm`. `scrollWidth <= 390` asserted on done, delete confirm, no speech and every routed case.
- **Earlier specs after the `Home` and list change:** `record.spec.ts` (real back) **15 passed**; `check.spec.ts` + `file-send.spec.ts` + `login-home.spec.ts` in one run: 29 passed, 3 skipped, 1 failed, which was `login-home`'s empty-list case running after `file-send` had put rows in the list (my run order); alone, on an empty list: 4 passed.
- Footprint: the specs delete the ids they create; `real-back-rows.mjs clean` found 0 and 10 leftover list rows from the regression runs and deleted them; storage 0 folders. Gateway, back and front stopped by pid, snapshot and fixtures deleted, `git status --porcelain` in the front repo shows only the six files above, no audio, no `AGENTS.md`. The back did not stall this sitting (no login timed out).
- `UNVERIFIED`: a real phone; real provider output (the stub's turns and summary are canned text); a `summary_failed` row whose `output_truncated` came from a real gateway (routed only).

**Small change after review (Fern, 2026-11-06):** `src/components/Home.tsx`: `<RecordingScreen key={openId} …>`, so a hash that moves from one id to another remounts the screen and the old recording's text cannot show under the new address. `bun run typecheck` exit 0, `bun run build` ok; `git status --porcelain` in the front repo: the four tracked files above and the two new ones, no media. **Not run in a browser** (no back was started for a one-prop change); `UNVERIFIED` beyond the diff, as you allowed.

**Wording and added checks (Fern, 2026-11-06, after SPEC-102 Q12):** `copy.ts` → `result`: `retryFailed` = `ลองใหม่ไม่สำเร็จ ยังไม่มีอะไรเปลี่ยน กดลองใหม่ได้อีกครั้ง`, `deleteFailed` = `ลบไม่สำเร็จ เสียงและผลยังอยู่ ลองใหม่อีกครั้ง`, new `back` = `กลับ`, all from the REQ rows. `RecordingScreen`: the header now has a visible `กลับ` button in place of the app name. **`grep -rn "TODO-COPY" src` → 0 lines.**
Evidence, same setup as above (real back on 3101, stub gateway on 3109 from a fresh snapshot, restarted per mode; production front build; Chrome 390 x 844): `bun run typecheck` exit 0, `bun run build` ok.
- `E2E_PHASE=ok`: **17 passed (1.7m)**, including the three new cases:
  - **Retry lost:** `POST .../retry` aborted by routing → `result-action-error` shows `ลองใหม่ไม่สำเร็จ ยังไม่มีอะไรเปลี่ยน กดลองใหม่ได้อีกครั้ง`, the retry control stays enabled, the failure text and the status `ถอดเสียงไม่สำเร็จ` are unchanged; unblocked → the screen shows the After sending string and `รอคิว`, the error is gone.
  - **Delete lost:** `DELETE` aborted → `ลบไม่สำเร็จ เสียงและผลยังอยู่ ลองใหม่อีกครั้ง`, the recording, its transcript and summary stay on screen; unblocked → deleted, back on the list.
  - **`กลับ`:** `กลับ button: 63 x 44 px` (asserted ≥ 44 both ways); returns to the list with the address hash cleared; **refreshed**: a second recording uploaded through the API while the result was open appears in the list after `กลับ` (and was absent before).
- `fail-a` then `ok` + `fail-b`: `AC-7 (b): PUTs during the retry: 0; file choosers opened: 0`. `summary_fail` then `ok`: transcript stays, retry reaches done. `truncated`: `status transcription_failed, errorCode output_truncated, retryable false`, string shown, no retry control. All passed again with the new code.
- Screenshots at 390 px looked at: `tests/harness/shots-110/result-retry-failed-390.png` (`กลับ` and `ลบ` in the header, the new retry message above the failure card). `result-back-390.png` was taken while the read was still loading, so it shows only the button and the loading line; `result-delete-failed-390.png` is also filed.
- Rows: the specs delete theirs; `clean` found 0; storage 0 folders. Back, front and gateway stopped by pid, snapshot and fixtures deleted, ports free. `git status --porcelain` in the front repo: the four tracked files, `e2e/result.spec.ts` and `src/components/RecordingScreen.tsx`, no media, no `AGENTS.md`. No stall this sitting.
- `UNVERIFIED`: a real phone; real provider output.

## Questions

1. **Wording missing (REQ has no row), visible markers in `copy.ts` → `result`:** a retry that did not go through (`TODO-COPY retryFailed`), and a delete that did not go through (`TODO-COPY deleteFailed`). Please carry both to the PM.
2. **Reused wording, say if wrong:** the read of one recording failing shows the list's row "List could not be read" (`โหลดรายการไม่สำเร็จ ลองใหม่อีกครั้ง`) with `ลองใหม่`; it says "list" on a single recording.
3. **No back wording:** the app name is the way back to the list (tap target 44 px high). A visible "back" label would need a REQ row.

## Review

**Sober, 2026-11-06: no defect found; stays `REVIEW`, held by two wording markers and one small change.** Evidence accepted as read, not rerun, since it needs the real back on the database: every stub mode, AC-7 `PUTs during the retry: 0; file choosers opened: 0`, AC-15, AC-8, AC-16, AC-18, and 8 routed cases. **Code read in full.** On a snapshot: typecheck clean, build OK. Script: all 16 Thai strings in `result` are in REQ-101 verbatim. `grep innerHTML src`: nothing, and turns and summary are text nodes. The failure function matches SPEC-102 § Errors row by row, and retry shows only on `retryable`.

**Your questions, all what the owner sees, so all went to the PM: SPEC-102 Q12.** Keep the markers until the answer. Q2's reused string stays meanwhile: "รายการ" also reads as one item, and the REQ's Delete confirm says "รายการนี้".

**One small change, no re-review needed beyond the diff:** add `key={openId}` to `<RecordingScreen>` in `Home`. Today, if the hash moves from one id to another, its state survives: the old recording's text shows under the new address until the read returns, and stays if that read fails.

**Accepted `[SA-decided]`, noted so nobody re-raises it:** the list does not poll, so a row on an open Home stays "กำลังถอดเสียง" until he opens it, comes back or reloads. That matches § Flow (Reading) and After sending's "เดี๋ยวกลับมาดูผลทีหลัง". `login-home`'s empty-list case needs an empty list, as your run order showed; that belongs to the test setup, not the code.

Remaining `UNVERIFIED`: real phone, real provider output (the stub's text is canned). A real `summary_failed` + `output_truncated` was routed only; TASK-103 and the owner's run reach that.

**Sober, 2026-11-06: wording answered (PM, SPEC-102 Q12).** REQ-101 § User-facing wording, copied exactly: "Result screen, a retry did not go through" → `result.retryFailed` · "Result screen, a delete did not go through" → `result.deleteFailed` · "Result screen, back to the list" → **`กลับ`, a visible button in the header in place of the app name.** The read-failed string stays as it is. `key={openId}` is in: seen.
**Added DoD:**
- [ ] Retry: `POST .../retry` aborted by routing → its string shows, the retry control stays, nothing else changes; unblock → retry works.
- [ ] Delete: `DELETE` aborted by routing → its string shows, the recording stays on screen; unblock → delete works.
- [ ] `กลับ` returns to the list, and the list is refreshed. `grep -rn "TODO-COPY" src` → nothing. Tap target at least 44 px. Look at one screenshot at 390 px.
- [ ] Rerun `e2e/result.spec.ts` on the real back and stub, and types and build. Then `REVIEW` again, and tell me.

**Sober, 2026-11-06, re-review: `DONE`.** Built and proven by the engineer, not tested by a tester; no phone run; the stub's text is canned, so real provider output is TASK-103's and the owner's. Reran on a snapshot: typecheck clean, build OK. Script: all 70 Thai strings in `copy.ts` are in REQ-101 verbatim. `grep -rn "TODO-COPY" src`: nothing. Read: `กลับ` is a visible button in the header. Evidence as read, not rerun: `E2E_PHASE=ok` 17 passed, every stub mode, the 3 added checks, including `กลับ button: 63 x 44 px`, and `key={openId}` carried through this run.
Fern's `result-back-390.png` caught only the loading line; `result-retry-failed-390.png` shows the header properly, so accepted. The work is uncommitted, in 6 paths, until his next word.
