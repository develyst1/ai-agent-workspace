# TEST-102: REQ-101 app acceptance (every tester AC except AC-11)
- Team: A · TASKs: TASK-104 to TASK-110 (SPEC-102). SPEC-101 and its TASKs (gateway, Team B) are what this round calls. Cases aligned to SPEC-102 v1, 2026-11-06.
- Source REQ: REQ-101, as revised 2026-11-06 16:18. ACs: 1, 2, 3, 4, 5, 6, 7, 8, 12, 14, 15, 16, 17, 18, 19, 20, 21
- Status: DRAFT — design only. **Nothing here has run against an app; there is no app yet.** Runs at `SPEC_DONE`, per the PM.
- Build under test: not yet. Recorded per run as below (§ Build identity).
- Environment: local + a database of my own on the owner's dev Postgres (Q10). My own `STORAGE_DIR`. Audio: `AUDIO-SOURCES.md`, never a real recording.
- Tested: not yet. Designed 2026-11-06 by Tanya.

## Scope

Whether the app does what REQ-101 promises, on my own setup at phone width. Boundary of the verdict: `call-scribe-back` and
`call-scribe-front`, as handed over by Team A, calling a local copy of the gateway.

**Not mine, and named so nobody assumes otherwise:** AC-11 (Tefany, TEST-101) · AC-9, AC-10, AC-13 (the owner's). Per the PM
(REQ § Questions), `TEST_PASSED` means every tester AC passed, with AC-9, AC-10, AC-13 and the phone surface named `NOT_TESTED`.

**Deliberately skipped, by risk:** computer widths (Out of Scope; a failure there is not a defect) · iPhone (Out of Scope) ·
load and concurrency beyond `AUDIO_MAX_CONCURRENT` (one user) · other browsers (see § What this round cannot prove).

**Highest risk, tested hardest:** losing a recording (AC-7, 14, 15, 16) · a stranger reaching a recording (AC-17) · a useless
result reaching the owner (AC-3, 4, 5) · a recording "deleted" but still stored (AC-18) · the file the chosen capture route
really produces, a long screen recording (AC-19 + AC-21).

## Instrument limits

| Instrument | Proves | Does NOT prove |
|---|---|---|
| Headless Chrome through DevTools (`harness/local-cdp-instrument-probe.mjs`, ran, see § Design evidence). No package installed | Layout and hit-tests at phone width, flows, what leaves the page | Android, ColorOS, a finger, a real GPU |
| File put into the file input through DevTools | The app's handling of a file | The real picker. No picker opens, so "can he reach this file on his phone" stays `NOT_TESTED` |
| Fake microphone reading a WAV | The recording path, measured | A real microphone, screen off, or app switching. The file starts when the mic opens, so a mic opened long before "record" loses the start: an instrument effect, checked before calling it a defect |
| SPEC-101's stub provider (`AUDIO_TRANSCRIBE_PROVIDER=stub`, `AUDIO_STUB_MODE`) on a local gateway copy | App and back behaviour on each outcome: errors, retries, states | **Anything about real results.** Its turns are fixed and ignore the audio. A case tagged `stub` never counts for AC-3, 4, 5 or 19's quality |
| Real provider through a local gateway copy | AC-2's words, AC-3, 4, 5, 19, 20 | Real call audio. Clean synthetic Thai flatters transcription and speakers, so a pass here does not predict a phone call. Only AC-10 can |
| Recording proxy between back and gateway, at `LLM_GATEWAY_URL` (to write, once the back exists) | What the back really sends, and how many calls. It can also answer in the stub's place, for outcomes the stub has no mode for: `provider_rejected_audio`, a summary's `output_truncated`, `429` | What the gateway then sends to a provider. That side is TEST-101's and TASK-103's. An injected answer proves the back's handling, not that the gateway would send it |
| `harness/local-score-result.mjs` | AC-3 and AC-4's numbers, the same way every run | Whether the result is good enough. That is the owner's, in AC-10 |

Tool note: the desk's method is a re-runnable harness, Playwright by default (`_templates/roles/TANYA-PLAYWRIGHT.md`). I use
plain DevTools because it needs no install and is proven here. If Team A's front ships Playwright as a dependency, I use that
instead. Either way nothing goes into a product repo.

## What this round cannot prove (phone surface, `NOT_TESTED` by design)

The real microphone on his Oppo · the real file picker reaching his recordings · the dialer's and the screen recorder's real
formats and sizes · screen off, app switching, ColorOS killing the app · an upload of gigabytes over mobile data · installing
it · which browser it runs in (assumed Chrome; his default may be Oppo's own) · real call audio. AC-10 and AC-13 are where these
get seen, and AC-13 is the only one aimed at any of them on purpose.

## Build identity (every run names this)

Engineers cannot commit until the owner says so, so **HEAD alone does not identify what I test**. Each run records, per repo:
branch, `git rev-parse HEAD`, `git status --short`, and a hash of the tracked diff plus the untracked files. I test a copy of that
tree outside the repo, so engineers' work and my runs do not collide. Reading git state only; no state-changing git.

## Test data

- **Audio:** `harness/local-make-fixtures.sh` (generated, ran, 26 files) + `harness/audio-scripts/`. Lives outside every repo.
- **S1** — two Thai voices, 24 turns, 254 words by the counting method, 4 written topics. Script ready; **audio does not exist (Q1).**
- **S1-phone** — S1 reduced to the shape of a phone recording (mono, narrow band, compressed). Reported beside S1, never judged:
  it tells the owner what to expect, and AC-3's line is set on clean audio.
- **S1-inject** — S1 plus one turn telling the summariser to say nothing happened. For AC-5.
- **S2** — 60 minutes of non-repeating Thai, generated from S1-style sections, with **one topic only in the last 5 minutes**, so a
  transcript or summary cut short fails visibly. Looping S1 would prove nothing. To write once Q1 gives a source.
- **Rows and files:** every file name carries `QA-`, and the store is my own (Q10), so I can tell mine from Jason's and Fern's. I delete only mine.
- **Login:** my local copy's own throwaway password, hashed with the back's `bun run hash-password`, in a git-ignored `.env` outside the repo. Never the owner's.

## Counting methods, fixed now so a result cannot tune them

- **AC-3:** Thai has no spaces, so words come from `Intl.Segmenter('th')`. Pass = ≥ 80% of script words appear in the transcript,
  counted once per occurrence. Also recorded for the owner: recall in order, and words in the transcript that are not in the script.
- **AC-4:** script and output words are aligned. A turn takes the label most of its aligned words carry; a turn with none is wrong.
  Each label maps to the voice it matches most. Pass = exactly two labels and ≥ 80% of turns on the right voice. Short turns count.
- **AC-5:** judged by reading, not scored: for each listed topic, the sentence that covers it; for each sentence, the script turn it
  rests on. A sentence with no turn behind it is an added topic. Both lists go in Evidence.
- **Messages:** compared with REQ-101's wording table as it stands on the run day, since those strings are drafts.

## Cases

Tags: `stub` = needs only SPEC-101's stub. `real` = needs a real provider, Q1 and Q9. `app-SPEC` = the steps depend on Team A's SPEC
and get finalised when it exists. All at 390 px, SPEC-102's stated width. Key screens also at 360 px: his real width is unknown, so a
failure only there is reported as a finding, not as an AC failure. Every run is logged in first, except the login cases. Actual and Result
are empty until the run.

### Getting a recording in

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 1.1 | AC-1 each format | happy · stub | SPEC-102's list: `ok-en.m4a`, `.mp3`, `ok-en-two-voices.wav`, `.opus`, `.webm`, `.flac`, plus `.ogg` (Vorbis) and the app's own recording format. AMR cannot be made here (6.5) | Sending message, then the processed message, per format. Stored file is AAC, 16 kHz, mono | | |
| 1.2 | AC-1 reachable | happy · stub | Hit-test both home actions at their centres, measure page and control widths, screenshot | Each action is the element at its own centre; no sideways scroll; Thai renders, no boxes | | |
| 1.3 | AC-1 no extension | boundary · stub | Pick `ok-en-no-extension` | Accepted: format is read from the bytes (capture-route Decision 5) | | |
| 1.4 | AC-1 Thai file name | boundary · stub | Pick `ไฟล์ทดสอบ ชื่อไทย มีวรรค (1).mp3` | Same as 1.1; the name displays correctly | | |
| 1.5 | AC-1 double tap | state · stub | Trigger send twice fast | One recording, one job (proxy count) | | |
| 1.6 | Decodable, on no list | boundary · stub | Pick `ok-en-unlisted.wma` | Accepted: SPEC-102 validates by decoding, not by a list (Q11) | | |
| 2.1 | AC-2 measured | happy · stub | Fake mic `mic-en-then-silence.wav`, record 10 s, stop. `ffprobe` what left the page | Same processing as a picked file. Duration 10 s ± 1 s. Start not silent | | |
| 2.2 | AC-2 words | happy · real | Fake mic on S1 | Script's words in the transcript, scored as AC-3 | | |
| 2.3 | AC-2 mic refused | negative · stub | Deny microphone permission, tap record | "Microphone refused" message, no empty recording in the list | | |
| 2.4 | No microphone | negative · stub | Run with no audio input device, tap record | "No microphone found" message, nothing recorded | | |
| 21.1 | AC-21 video goes through, browser strip | happy · stub | Pick `ok-en-screen.mp4`. Reassemble what left the page; `ffprobe` it | Goes through like any recording. **What left the phone has no video stream** | | |
| 21.2 | AC-21 back as fallback | happy · stub | Set `localStorage["cs_strip_in_progress"]` before the pick (SPEC-102's strip safety), so the original is sent | Goes through. `ffprobe` at the proxy: audio only. Gateway's `video_not_allowed` never fires | | |
| 21.3 | AC-21 no picture kept | negative · stub | After 21.1 and 21.2, `ffprobe` everything in my `STORAGE_DIR` for this recording | Only `audio.m4a`, no video stream. Chunks and original gone | | |
| 21.4 | Video with no sound | negative · stub | Pick `bad-video-no-sound.mp4`, through the strip, then again by the fallback (a screen recording with sound off is a likely slip) | Q3: unsupported message, nothing kept, on both paths | | |

### Refusing what is not a recording

Case 6.5 is cut: the PM removed "format outside the list" from AC-6 (Q11), and anything that decodes is accepted (1.6). AMR, the likeliest real example, cannot be made here and stays unproven until AC-10. For each of 6.1 to 6.6, four checks: the message; list unchanged; no new row or stored file (before/after by `QA-` marker and folder
listing); **no call reaches the gateway** (proxy count 0).

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 6.1 | AC-6 text named `.mp3` | negative · stub | `bad-text-as.mp3` | Unsupported message, keeps nothing | | |
| 6.2 | AC-6 0 bytes | boundary · stub | `bad-zero.mp3`, `bad-zero.m4a` | Same | | |
| 6.3 | AC-6 corrupt | negative · stub | `bad-random.m4a`, `bad-cut-header.m4a`, `bad-midfile-corrupt.mp3`, per SPEC-102 Q4. All three fail its validation command (§ Design evidence) | Same | | |
| 6.4 | AC-6 picture named `.mp3` | negative · stub | `bad-image-as.mp3` | Same | | |
| 6.6 | AC-6 plain `.txt` | negative · stub | `bad-plain.txt` | Same, or the picker cannot offer it (input `accept`); note which | | |
| 6.7 | AC-6 app still works | state · stub | After 6.1, pick `ok-en.mp3` | Normal processing | | |

### The result

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 3.1 | AC-3 | happy · real | S1 through the app; adapt the output to the scorer's shape; score | ≥ 80%. Percentage recorded for the owner | | |
| 3.2 | AC-3 shown in full | happy · stub | Fixed stub turns on screen; compare the page's text with the job's `turns` | Every turn shown, none clipped at 360 px | | |
| 3.3 | S1-phone, for the owner | measure · real | Same as 3.1 on S1-phone | Recorded, not judged | | |
| 4.1 | AC-4 | happy · real | S1; score | Exactly 2 labels; ≥ 80% of turns right | | |
| 4.2 | AC-4 labels | happy · stub | Read the labels on screen | `ผู้พูด 1`, `ผู้พูด 2`, as the wording table says | | |
| 5.1 | AC-5 every topic | happy · real | S1; read against the topic list | All 4 covered, any wording; the figures right (18 November, 200,000 baht) | | |
| 5.2 | AC-5 nothing added | negative · real | Each summary sentence traced to a turn | Nothing without a turn behind it | | |
| 5.3 | AC-5 call text is data | negative · real | S1-inject (SPEC-101: "Call text is data") | Summary still covers the 4 topics and does not obey the turn | | |
| 20.1 | AC-20 from the gateway | happy · stub | `AUDIO_STUB_MODE=no_speech` with `ok-en.mp3` | "No speech" message; no empty result; no summary call (proxy) | | |
| 20.4 | AC-20 silence at intake | happy · stub | `nospeech-silence-30s.wav` (measured -91 dB, under `SILENCE_DB` -60) | "No speech" message. **No call to the gateway at all** (proxy count 0) | | |
| 20.2 | AC-20 noise, tones | negative · real | `nospeech-noise`, `-tones` (measured -27 and -14 dB, so they pass intake and reach a provider) | Same message. **An invented transcript is a FAIL**; these are where AI transcribers tend to invent | | |
| 20.3 | AC-20 tiny file | boundary · stub | `edge-silence-tenth-second.wav` (-91 dB) | "No speech". Never an empty result | | |

### When things fail (the recording must survive)

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 7.1 | AC-7 retry works | state · stub | Mode `fail`; pick; open it; restart my gateway copy in mode `ok`; retry | Message; retry finishes it. **Picker not opened, file not re-sent from the phone, same recording, list count unchanged** | | |
| 7.2 | AC-7 still failing | state · stub | Retry with mode still `fail` | Same message, one entry, audio intact (`ffprobe` the stored file) | | |
| 7.3 | AC-7 retry twice | state · stub | Trigger retry twice fast | One job (proxy count) | | |
| 7.4 | No retry: transcript cut off | negative · stub | Mode `truncated` (`retryable: false`) | "Output cut off" message, no retry button, audio intact, **no partial result shown as finished** | | |
| 7.9 | No retry: provider refused | negative · stub | Proxy answers `provider_rejected_audio` | "Provider refused this file" message, no retry button, audio intact | | |
| 7.5 | Gateway unreachable | negative · stub | Gateway stopped (`gateway_unreachable`); then one with no provider set, 503 (`gateway_rejected`) | "Transcription failed" with retry (SPEC-102 § Errors), not a stuck spinner | | |
| 7.6 | Job lost in a restart | state · stub | Restart the gateway during `running`. Then lose it twice, by proxy | Once: resubmits and finishes. Twice: `job_lost`, "Transcription failed" with retry. **Never "processing" forever** | | |
| 7.7 | Busy | state · stub | Proxy answers `429` | "Busy" message, retry offered, audio intact. SPEC-102's one-at-a-time worker cannot reach `429` by itself | | |
| 7.8 | Gateway never finishes | state · stub | `AUDIO_STUB_DELAY_MS` beyond 35 minutes. Slow, costs nothing, runs in the background | `poll_timeout`: "Transcription failed" with retry, at about 35 minutes | | |
| 7.10 | Queue order | state · stub | Three recordings at once | One at a time, oldest first, all finish, none lost | | |
| 15.1 | AC-15 | state · stub | Mode `summary_fail`; open; restart in `ok`; retry | Transcript shows, summary-failed message. **On retry: 0 transcription calls, 1 summary call (proxy)** | | |
| 15.2 | AC-15 after reopening | state · stub | Close and reopen between failure and retry | Same | | |
| 15.3 | No retry: summary cut off | negative · stub | Proxy answers `output_truncated` on the summary | Transcript shows, "Summary output cut off" message, no retry, no partial summary | | |
| 14.1 | AC-14 upload lost | negative · stub | Go offline through DevTools midway through a file over 5 MiB, then online and retry | Send-failed message. **Only the missing pieces are sent again** (request log). One recording | | |
| 14.2 | AC-14 recording not yet sent | state · stub | Offline, record, stop, close the tab, new tab, online | Cut-off message with "ส่งเสียงที่อัดได้"; sending it works. **It exists nowhere else, so this is the sharpest loss case** | | |
| 14.3 | AC-14 mic lost | negative · stub | End the mic track at 20 s of a recording | Cut-off message. Duration kept measured; seconds lost recorded (Q5). SPEC-102's 5 s pieces suggest up to about 5 s | | |
| 14.4 | AC-14 page dies | negative · stub | Crash the page through DevTools at 20 s, reopen | Same as 14.2. Seconds lost recorded (Q5) | | |
| 14.5 | AC-14 closed while sending | state · stub | Close at "กำลังส่งไฟล์", new tab | No row stuck in the list (`uploading` rows are not listed). Picking the file again works. A recording from the mic is offered again, as 14.2 | | |
| 14.8 | Send refused, too large | boundary · stub | Set my `MAX_UPLOAD_BYTES` low; pick a file at the limit, then one byte over. Same again with `GATEWAY_MAX_BYTES` low | At the limit: goes through. Over: "File too large", nothing kept. **For a mic recording, nothing kept would lose it: what happens is recorded as a finding** | | |
| 14.6 | AC-14 empty never finished | negative · stub | Record and stop at once; separately, a silent fake mic | Never reported as a finished recording | | |
| 14.7 | AC-14 half a file | boundary · stub | `edge-half-of-mp3.mp3`: decodes, cut short (validation exit 0) | Q4: processed, since it holds real audio. Not refused, no crash | | |
| 16.1 | AC-16 | state · stub | Close at "ส่งไฟล์แล้ว", delay set long; reopen before and after it ends | Still processing, then the result | | |
| 16.2 | AC-16 back restarted | state · stub | Restart my back copy during `transcribing`, reopen | Back to `queued`, then finishes. Never stuck | | |
| 16.3 | AC-16 restarted while summarising | state · stub | Restart my back copy during `summarizing` | Finishes. **0 more transcription calls** (proxy): SPEC-102 keeps stored turns | | |
| 8.1 | AC-8 | state · stub | Finished recording; close the tab; new tab (SPEC-102's "closes"). Installed-app behaviour is phone-only | Opens, same text, still logged in | | |
| 8.2 | AC-8 browser restarted | state · stub | Restart the browser on the same profile | Same | | |
| 8.3 | AC-8 gateway gone | state · stub | Stop the gateway, or wait past `AUDIO_JOB_TTL_MS`; open | Still opens: the result is the back's, not the gateway's in-memory job | | |
| 8.4 | Back restarted | state · stub | Restart my back copy; open | Same | | |

### Who can reach it, and getting rid of it

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 17.1 | AC-17 no login, every route | permission · stub | With no cookie: every `/api/*` route in SPEC-102 except login, one by one. **At the server, not through the screen** | `401 unauthorized` each; no recording, no result, no write. Rows counted before and after | | |
| 17.2 | AC-17 known id | permission · stub | Same, with a real recording id. Also a `:id` that is not a uuid (`../../etc`), and guesses at stored paths | Same, or `404`. Nothing from `STORAGE_DIR` is ever served | | |
| 17.5 | Login, wrong password | permission · stub | Wrong password, then right | "Wrong password" message, no cookie. Then in | | |
| 17.6 | Login, too many tries | permission · stub | 5 wrong within 15 minutes, then the **right** one | `429`, "Too many attempts" message. Even the right password waits | | |
| 17.7 | Log out | permission · stub | Log out, then reuse the old cookie directly | `401`, on the server too, not only on the screen | | |
| 17.8 | Another site | permission · stub | Request with credentials from an origin other than `FRONT_ORIGIN` | Browser blocks it: no CORS allowance for that origin | | |
| 17.9 | Cookie | permission · stub | Read the `Set-Cookie` header; run with `COOKIE_SECURE` unset | `HttpOnly`, `Secure`, `SameSite=Lax`. Script on the page cannot read it | | |
| 17.10 | Hostile file name | negative · stub | Pick files named `<img src=x onerror=alert(1)>.mp3` and `../../../QA-x.mp3` | Shown as plain text, nothing runs, nothing written outside `STORAGE_DIR` | | |
| 17.3 | AC-17 keys stay on the server | permission · stub | Search the built front files for the gateway URL, key names and values (matched by the harness, never printed) | Absent. SPEC-101: the caller is the back, never the phone | | |
| 17.4 | AC-17 on the real address | permission | Repeat 17.1 and 17.2 on the first reachable environment, once it is recorded in `SYSTEM-FACTS.md` and I am cleared | Same. **Q6: must pass before any real recording goes up** | | |
| 18.1 | AC-18 cancel | negative · stub | Delete, then cancel at the confirm | Nothing changes | | |
| 18.2 | AC-18 confirm | happy · stub | Delete, confirm | Gone from the list, the row, and `STORAGE_DIR/<id>`. `GET` on the old id answers `404` | | |
| 18.3 | AC-18 only that one | negative · stub | Two recordings, delete one | The other intact and opens | | |
| 18.4 | AC-18 while processing | state · stub | Delete during `running`; let the job end | Stays gone: no row, no file, no result coming back | | |
| 18.5 | AC-18 a failed one | state · stub | Delete a recording in the failed state | Same as 18.2 | | |

### The long one

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 19.1 | AC-19 | boundary · real | S2 as M4A, through the app | AC-3, 4, 5 hold, **including the last-5-minutes topic**. Time taken recorded | | |
| 19.2 | AC-19 over the gateway's limit | boundary · stub | 60 minutes of 16 kHz WAV, about 115 MB against the gateway's 100 MiB (SPEC-101's arithmetic) | Reaches the gateway under the limit (proxy size). `complete` answers within SPEC-102's 30 s (measured) | | |
| 19.3 | AC-19 + AC-21, the real route, strip | boundary · stub | A 60-minute MP4 with sound, 8 Mbps, about 3.6 GB (SPEC-102's test rate), through the browser strip. Measure time and page memory | Audio only leaves the page; or the strip fails and the fallback takes over. Page memory recorded: SPEC-102 saw 600 MB on 613 MB of video. **Desktop numbers only; a phone may die far sooner** | | |
| 19.5 | AC-19 + AC-21, fallback | boundary · stub | Same file, strip off (as 21.2), in 5 MiB pieces. Measure time and the back's memory and disk | Goes through; audio only kept; temporary files gone afterwards | | |
| 19.4 | Size on the real address | boundary | Repeat 19.3 on the first reachable environment. The server template's 20 MB body limit is SPEC-101's open risk, and local cannot show it | Same | | |

### No real recording in our files

Searched by what a file **is**, not its name: every file and every blob in history is checked with `ffprobe`, not by extension.

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 12.1 | AC-12 the 3 repos | negative | Working tree + all history, read only | Every audio or video file is on `AUDIO-SOURCES.md` | | |
| 12.2 | AC-12 the desk | negative | `ai-worker/`, `project-docs/`, their history | Same | | |
| 12.3 | AC-12 stored uploads | negative | My local storage folder | Only `QA-` files, each traced | | |
| 12.4 | AC-12 transcripts | negative | Text in logs and TEST evidence, compared with the scripts | Only script text. **Limit: no search can recognise an unknown real transcript in free text**; this is a sample, named as one | | |
| 12.5 | AC-12 again after AC-10 | negative | Q8 sets the scope | Same | | |

### Not an AC, checked because the wording table promises it

| # | Case | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| X.1 | Empty list | state · stub | First open with no recording, on my own empty database (Q10) | `ยังไม่มีเสียงที่บันทึกไว้` | | |
| X.2 | Wording, all of it | happy · stub | Every string in REQ-101's table that the runs above reached, compared exactly. List the ones no case reached | Each matches. Unreached strings named, not assumed | | |
| X.3 | Personal data in logs | negative · stub | Search my back's and gateway's output for the file names and stub turn text used | Absent. SPEC-102: never log a file name, turn text, summary or password | | |

**Named and skipped:** the hourly clean-up of `uploading` rows older than 24 hours. It would take a day to see, and only tidies; no AC rests on it.

## What real runs would cost

First round about **70 audio-minutes**, about **140** if everything is re-tested once: S1 and variants about 10 minutes, no-speech
files 2, S2 60. Using Silver's figure in REQ Q9 (xAI, 2 minutes ≈ a third of a US cent) that is roughly **25 US cents plus summary
calls**. Arithmetic only: Gemini is not priced and the provider is not chosen. **I make no real call until the owner's limit arrives (Q9
in the REQ).** Everything tagged `stub` costs nothing.

## Run order at `SPEC_DONE`

**Stub cases go earlier, by the PM's order 2026-11-06 (§ Questions, last item):** straight after the Q11 probe ends, on my own database, without waiting for `SPEC_DONE`. Round 1 ran and was stopped, § Stub round 1; rerun only on the PM's word. The final verdict still waits. **Commits to record, from the PM's later message, superseding the tree named in that item:** front `e329eef`, back `1195792`, gateway `6711807`.

0. Before my first write, and not before it, so the answer is current: read which tables exist in my database, read-only. If anything there is not ours, stop and tell the PM (Q10). Not run yet.
1. Stub cases first: they need no money and catch most failures. 2. Real cases, once Q1 and the REQ's Q9 are answered, starting with S1.
3. S2 last, and only if S1 passed: if S1 fails, 60 minutes would only cost more. 4. AC-12 last, over everything the round left behind.

## Design evidence (ran 2026-11-06 by Tanya, on this machine; instruments only, no app)

- `node tests/harness/local-score-result.mjs --self-test`: 19 of 19 as predicted, on Node and Bun. Includes garbage text and one label on
  every turn: **both now FAIL**, which the first AC wording could not do. The first run was 15 of 17: my own case was wrong (it flipped
  one turn, not two), and the code was right. Case corrected, and 80% added as an explicit boundary.
- Scorer on S1 against itself: 254 words, 24 turns, 100%. One label on all 24 turns: `exactlyTwoLabels: false`, AC-4 FAIL.
- `node tests/harness/local-cdp-instrument-probe.mjs`: asked 375 px, page reported 375, no sideways scroll, hit-test landed on the
  button, file reached the input, recording left the page and arrived whole. Chrome's own headless flag had given Tefany 500 for 390
  asked; DevTools' device override does not have that problem.
- **Fake mic: `%noloop` did not work.** A 2 s tone with it, 6 s recorded: -28 to -40 dB to the end. The same tone padded with real
  silence: -13, -33, -54 dB, then silence for the rest. So fake-mic files are padded; `mic-en-then-silence.wav` is.
- `bash tests/harness/local-make-fixtures.sh <folder>`: 26 files, each checked with `ffprobe`. Refuses a folder inside a git repo. Its
  first version left an empty folder behind when refusing; fixed and rerun, nothing left.
- **SPEC-102's validation command, `ffmpeg … -xerror -i <in> -map 0:a:0 -af volumedetect -f null -`, over all 26 fixtures, so expectations
  are measured.** Exit 183: `bad-cut-header`, `bad-midfile-corrupt`, `bad-plain`, `bad-random`, `bad-text-as`, both `bad-zero`. Exit 234:
  `bad-image-as`, `bad-video-no-sound`. Exit 0: every `ok-en*` including `.wma`, `mic-en-then-silence`, `edge-half-of-mp3`. Silence and the tiny file:
  -91.0 dB. Noise -27.2 dB, tones -14.0 dB. This tests ffmpeg with that command, **not the back**, which does not exist yet.
- **Thai text-to-speech: refused twice, so it has never run (Q1).**

## Q11 database stall probe (SPEC-102 § Questions Q11; routed by the PM 2026-11-06)

**Status: FINISHED 2026-11-07 01:45, exit 0. The stall did not reproduce: 36 `ok`, 0 `symptom`, 0 `could not ask`. All four suspects are `NOT SETTLED`, so Q11 is not explained.** This is a probe, not a TEST-102 round: TEST-102 stays `DRAFT`.

| Pass (real local time) | `/health` | `/me` | `SELECT 1` long-lived | `SELECT 1` new | Long-lived pid |
|---|---|---|---|---|---|
| Baseline median, 3 runs, 11-06 19:07:43 to :50 | 1 ms | 496 ms (499, 245, 496) | 245 ms | 1296 ms | 6280 |
| After 1 min, 11-06 19:08:50 | 1 | 247 | 246 | 1322 | 6280 |
| After 5 min, 11-06 19:13:52 | 1 | 246 | 247 | 1306 | 6280 |
| After 15 min, 11-06 19:28:54 | 2 | 247 | 250 | 1308 | 6280 |
| **Across the freeze**, not a 30-minute gap, 11-07 01:45:23 | 4 | 499 | **1307** | 1380 | **19824** |
| 5 overlapping `/me`, 11-07 01:45:26 | not in this pass | 263, 520, 521, 522, 524 | 261 | 1311 | 19824 |

All `ok`. One login at setup: 1339 ms, 204. The extra new connection at 8 s never fired, because no `/me` reached 8 s.

| Suspect | Verdict | What the numbers show |
|---|---|---|
| D1: dead idle pooled connection | `NOT SETTLED` | No stall to judge. No wait at 1, 5 or 15 minutes on the probe's own connection. 30 minutes not measured. The back's worker queried every 2 s throughout, so its pool was not idle in the way D1 means |
| D2: database host or network slow at times | `NOT SETTLED` | New connections 1287 to 1380 ms at all 8 passes measured. 8 moments over a 51-minute run say nothing about the moments between them, and no back stall happened to compare with |
| D3: back's pool runs out under overlap | `NOT SETTLED` | 5 overlapping `/me` took 263 to 524 ms. That rules out only this size of overlap on an otherwise empty back, not overlap during uploads |
| D4: password hashing | `NOT SETTLED` | `/me` never stalled, and the recipe logs in once |

**Three things the numbers do show, no cause claimed:**
1. **The box's freeze replaced the probe's long-lived connection, with no error and no symptom.** The pid changed from 6280 to 19824, and that `SELECT 1` took 1307 ms, about what a new connection takes. So on this run a connection that was lost came back on its own. It is one case, and a freeze is not the same as an idle connection.
2. **The back's log holds one line after startup: `worker: job crashed: PostgresError`.** The file was last written 11-07 01:38:23, so that is when it happened (the line itself has no time). The box had just woken, by the PM's check at 01:39. No row was involved, and `/me` answered in 499 ms at the next pass. The log gives the class only, by design.
3. **A `SELECT 1` costs about 245 ms from this box, on a connection already open, and a new connection about 1300 ms.** `/me` took either about 245 or about 495 ms. That was steady all run. Anything doing many database statements in a row adds this up, which is arithmetic, not a finding about the stall.

**Why this cannot clear anything:** Fern's stalls came during heavy real use, on database `call_scribe`. This was a light recipe on `call_scribe_test`, on the same host, in a different hour. No stall here does not mean there is no stall.

**Timing through the stub cases, my decision on the PM's and Sober's ask 2026-11-07:** every 15 s, not once a minute, with the long-lived `SELECT 1` added to `/me` and the new connection, all three fired together (`harness/q11-watch.ts`). It runs as a separate process, because timing inside the harness would block it for over a second at each check and disturb the cases. It has its own session, so 17.7's log out does not end it. Numbers only; Sober judges the cause.

**Seen once already, in a 2-case smoke run of that setup, 2026-11-07 01:53 to 01:54. Reported as seen, cause not known:** back's log `unhandled error: PostgresError` at 01:54:10. Case X.1's empty list did not appear within 15 s. The watch tick begun 01:53:54 never finished, though the one begun 01:54:10 did (`/me` 534 ms, long-lived 245 ms, new 1296 ms). The old watch kept no record of which check was out, so it now writes each check as it ends. **Separately, the box stopped again:** between 01:54:10 and 02:10:34 the wall clock moved 984 s and uptime 705 s, so about 280 s frozen, and X.1's recorded 325 s includes that. My database then showed one connection (mine), `max_connections` 100, no idle or statement timeouts, no connection limit on the role or database. The earlier 4-case smoke run, with no watch, had no such event; two small runs are too few to tell whether the watch has anything to do with it.

- **Recipe:** as Sober wrote it, with the predictions in SPEC-102 Q11 written before any pass. `harness/q11-db-stall-probe.ts`. Raw numbers: `harness/q11-results-2026-11-06.jsonl`. Symptom = over 8 s; a request is abandoned at 60 s and still labelled `symptom`.
- **Build:** `call-scribe-back`, branch `atom`, HEAD 6130c6e, plus Jason's uncommitted changes in 5 files (tracked diff sha256 `446f4af885e479cd`, no untracked files). Run from a snapshot outside the repo, no `.env` in it.
- **Setup:** my database `call_scribe_test`, port 3121, my own `STORAGE_DIR`. The harness refuses any other database name. No other database on that host was touched. Gateway is a closed local port, with no rows for the worker to send.
- **Table check before the first write:** `current_database: call_scribe_test`, `tables: 0`. Nothing there that is not ours. Then `applied 001_init`: `recordings`, `sessions`.
- **Three additions to the recipe, all read-only and the same on every pass:** `pg_backend_pid()` after the long-lived `SELECT 1`, to show the connection really stayed the same one; the local 1-minute load; and, if `/me` is still out at 8 s, one extra new connection at that moment, which is what D1 and D2 ask for.
- **Limits, already known:** this is not the database Fern's stalls were on (`call_scribe`), though it is the same host. The back's worker queries every 2 s (`worker.ts`, `idleMs`) all through each gap, so a gap is idle for requests, not for the back's pool. Fern's stalls came during heavy use, and this recipe is a light one, so it may show no stall at all; that would not clear anything. D4 needs login timed during a stall, and the recipe logs in once.

**The box froze during `gap-30m`, so that pass is not a 30-minute gap.** Measured by me 2026-11-07 01:40: the probe process had run 2760 s of uptime against 23547 s of wall clock since 19:07:40, so about 20790 s (5.8 h) passed with the box stopped, agreeing with the PM's inference. The cause of the stop is not known. The gap's timer does not count frozen time, so the gap spans about 30 minutes of run time plus 5.8 hours of wall clock, in which the database host kept running. Whatever that pass shows gets reported as its own case, and D1's 30-minute point stays unmeasured unless rerun.

**The probe's build:** 6130c6e plus Jason's diff at that moment, not a commit. Compared at report time: the 3 `src` files that differ between 6130c6e and `1195792` are byte-identical to the snapshot, and no migration or script differs between those commits. So the probe ran the same server code as `1195792`.

**Instrument checks, dry runs before the real run:** real settings: 24 `ok`. Symptom line at 1 ms: 25 `symptom`. HTTP checks aimed at a closed port: 13 `could not ask`, with the database checks still `ok`. Port already taken: refused, exit 4. A request that never answers: `TimeoutError`, labelled `symptom` (separate check, 1 s cap). No file written contains the URL.

**My harness bug, caught in those dry runs:** on this box `bun` is a shell launcher, so stopping it left the real server running on 3121 with the first run's password. The next two dry runs got 401 and proved nothing. Stopped that one process (checked by its working directory), changed the harness to start the real binary and refuse a taken port, and repeated all the dry runs. **The same trap may catch anyone who stops a back by the launcher's pid.**

## Stub round 1, 2026-11-07: stopped, not finished. No verdict

**Build:** front `e329eef`, back `1195792`, gateway `6711807`, from `git archive` snapshots, each repo clean at that commit. Own database `call_scribe_test`, ports 3120 to 3123, headless desktop Chrome at 390 px. Stub turns are fixed text, so nothing here speaks to AC-3, 4, 5 or 19's quality. **Instrument:** `harness/local-test102-stub.mjs`. Raw: `harness/test102-stub-results-2026-11-07.json`. Captured before the stop: `harness/q11-capture-2026-11-07/`.

**State when stopped, 10:35:** began 02:11:29. **Results stop at 14.3 (02:42), and the run never moved again: my own bug, not the app.** Case 14.4 awaits `Page.crash`, which never returns: a bare script on `about:blank` showed `still pending at 20 s`, with no app involved. I had no per-case time limit. Then stopped by pid, ports 3120 to 3123 free, no process left by working directory or name. **The watch ended with the run, which I did not intend, so it is not running** (last tick 10:35:09).

**Results: 48 PASS, 4 FAIL, 13 ERROR, 65 in all. Sorted below, there is no confirmed product defect among them, and none goes to Sober as one.** Of the PM's 15, 9 are my harness and 6 follow a pause. 2 more came from my stop itself.

| Case | Result | Sorted as | Evidence |
|---|---|---|---|
| 1.5 double tap | FAIL, 2 rows | **Harness** | I set the hidden input twice, which no finger can do: the button is disabled while busy (`FilePicker.tsx`). Each pick made its own row and one job. The case as written has not run |
| 21.1 strip, 21.2 fallback | ERROR, FAIL | **Harness** | Playwright's `postDataBuffer()` gave null for these PUT bodies, so "what left the page" was never read, and the 0 B is mine. 21.2's other checks passed, including no video at the gateway. **AC-21's main claim is `NOT_TESTED`** |
| 7.1, 15.1+15.2 retry | FAIL | **Harness, by reading; only a rerun settles it** | I read the status right after the click, and saw the old failed status before the back had moved. No pause in either window. 7.2 waits 1 s and passed |
| 14.1, 14.5, 14.8 | ERROR | **Harness** | `pick()` joined a full path onto the fixtures folder: `ENOENT`. Never ran. That is why `sendFailed` and `tooLarge` were not reached |
| 17.8 another site | ERROR | **Harness** | The front listens on `[::1]`, so `127.0.0.1:3120` refused. The two header checks before it passed |
| 7.7 busy | ERROR | **Pause**, plus my unguarded clean-up | Watch ticks 33 to 34: no tick for 49 s, 02:19:35 to 02:20:24. `GET /api/recordings` took 41684 ms, then answered 500. My clean-up could not read a 500. The case never ran, so `busy` was not reached |
| 16.3 restart while summarising | ERROR | **Pause** | Ticks 47 to 48: 154 s. `GET /:id` took 149995 ms, then 500 |
| 18.5 delete a failed one | ERROR | **Pause** | Ticks 60 to 61: 102 s. Two page requests took 101454 and 101446 ms, then 500 |
| 2.1 mic measured | ERROR | **Pause**; would also hit the null-body bug | 481 s of wall clock, 285 of uptime. `GET /:id` took 460238 ms, ended in `TypeError` |
| 14.2, 14.3 kept recording | ERROR, row stayed `queued` 90 s | **After a pause; for Sober** | Cut-off message and send worked. No gap in the window, the last ended 02:38:01, and `/me` answered normally. But the worker took nothing for 200 s or more. The back's log has no times, so I cannot show what it was doing. Possibly the same stuck connection as below |
| 14.4 | ERROR at my stop | **Harness** | The hang above |
| 14.6 | ERROR at my stop | **My stop** | It began after I stopped the front. Never ran |

**Passed, on this build, on stub text:** 1.1 in 7 formats, 1.2, 1.3, 1.4, 1.6, 21.4, 6.1 to 6.4, 6.6, 6.7, X.1, 3.2+4.2, 20.1, 20.3, 20.4, 7.2 to 7.6 and 7.9, 7.10, 15.3, 14.7, 16.1, 16.2, 8.1 to 8.4, 17.1+17.2, 17.3, 17.5 to 17.7, 17.9, 17.10, 18.1 to 18.4, 2.3, 2.4 (forced). X.3 passed, but on the logs of an unfinished round. A pass is a pass only for what that case checked; none of this is a round verdict.
**Not run at all:** 7.8, 19.2, 19.3, 19.5, 12.x, plus everything marked harness above. **Real cases:** still waiting.

### What the watch shows, for Q11. Numbers only; the cause is Sober's

383 ticks, 02:11 to 10:35, every 15 s. `/me` median 250 ms when `ok`, new connection 1302, long-lived 247.

1. **The Q11 shape appeared 15 times.** At 15 ticks `/me` took past the 60 s cap and the long-lived `SELECT 1` did too, **while a new connection at the same moment took 1283 to 1541 ms.**
2. **All 15 begin within 30 s after a gap in the watch's own ticks: 12 at 0 s, 2 at 15 s, 1 at 30 s.** None elsewhere.
3. **Socket state, captured before the stop:** the back held 3 connections to the database port, 2 with unsent bytes (`sendQ` 102 and 54). On this box's sockets to that port: `retrans 1/10`, `1/11`, retransmit timers running, last ack 298 to 467 s earlier. Not all those sockets are shown to be the back's.
4. **How it ends:** the long-lived connection ended `ERR_POSTGRES_CONNECTION_CLOSED` 4 times, with its queued checks waiting up to 359 s. The back's log: 19 `unhandled error: PostgresError`, 5 `worker: job crashed: PostgresError`. Requests answered 500 after the wait, and later ones worked with no restart.
5. **New connection over 8 s: 3 ticks of 383** (60, 164, 298), each right before a gap.

| Suspect | Verdict, for **these** stalls only | Why |
|---|---|---|
| D1 dead connection | Prediction **came true after box pauses**; not sitting idle, as D1 was written | Point 1. Whether idle alone does it: `NOT SETTLED`. 1, 5, 15 minutes did not, in the probe |
| D2 host or network slow | `RULED OUT` at those 15 ticks | New connections stayed fast through each |
| D3 pool exhausted | `NOT SETTLED` | Not separately tested; one `/me` at a time stalled, with the cases running beside it |
| D4 hashing | `RULED OUT` at those ticks | `/me` stalled, and it does no hash |

**None of this says what happened in Fern's two stalls on 11-06.** I have no clock from then. A pause is one way to produce this shape; that is all this shows.

**Against Sober's rule, I am not classifying these; two things in the rule do not fit, for Sober to settle:**
- **The wall-against-uptime clock misses half the gaps.** 29 gaps over 20 s: 14 lose uptime (23228 s, agreeing with the PM's 14) and **15 do not** (25 to 314 s, 1428 s together). In those 15 my watch's own timer did not fire, and in 3 of them a back request took the same length, so two separate processes stopped together. That is my inference from the matching numbers. The cases that hit them are above. By the rule's clock they count as "no freeze".
- **Taken literally, all 15 are "no freeze inside that tick",** because each pause ends just before its tick. But `/health` was not timed at those ticks, and each sits right after a pause. So literally they are neither `recurrence` nor `freeze-adjacent`.

**One lead, not a defect yet, relevant to AC-18:** my store holds **2 folders with `audio.m4a` and no row in the database** (`03ea9118…`, from the smoke run, and `38fdbdf9…`, 02:31). Synthetic audio. The delete route removes files first (`routes.ts:173`), so that route should not leave this, and I do not know what did. Both were around pauses. Left in place for Sober. **If a real recording could end up this way, it would stay stored with nothing in the app to delete it.** 18.x needs a case that reproduces it before this is called a defect.

### State at the desk pause, 2026-11-07 12:18 (PM's order; `DECISIONS.md` 12:16). Where a fresh session picks this up

**Nothing of mine is running:** no listener on 3120 to 3129, no process by working directory or command, checked 12:18:53. **TEST-102 is still `DRAFT`, with no verdict.** Stub round 1 is not to be rerun until TASK-115 is done and the owner has spoken on the machine.

**The harness fixes below are WRITTEN BUT UNPROVEN.** I applied them at 12:18 to `harness/local-test102-stub.mjs` and `harness/q11-watch.ts`. The pause came before any ran. Only `node --check` passed, which shows the syntax and nothing else. Also added: closing whatever a case opened, one long-lived check at a time in the watch, and `upEnd` on each watch check. **First job on return, before any rerun, as the PM asked:** prove them on a subset. Run `--only 1.5,21.1,21.2,7.1,15.1+15.2,14.1,14.5,14.8,17.8,7.7,14.4` with `--plant-hang --plant-gap --plant-clean --case-limit 5` for the planted ones (the real cases need a longer limit, so as two runs), then `--keep-watch`, and check that the watch survives and stops by its pid. Build the snapshots afresh: the commits will have moved, and which to use is the PM's word.

**Lives only in my session scratchpad, so expect it gone:** snapshots (remake with `git archive`), fixtures (remake with `harness/local-make-fixtures.sh`), and **the 2 leftover audio folders the PM asked me to leave for Sober.** Their record, in case they go: `03ea9118-088d-4f42-bf66-e9e1a4b5d10e/audio.m4a`, 89494 B, sha256 `e8136e8a30e603d7`, 17.67 s, written 11-07 01:53:26 · `38fdbdf9-e9dc-4614-8ec3-99f0fcb63593/audio.m4a`, 51512 B, sha256 `fd510e93ebdc1080`, 10.14 s, written 11-07 02:31:11. Both synthetic. Not copied to the desk: no audio belongs here beyond `AUDIO-SOURCES.md`.

**Left in `call_scribe_test`:** 2 tables, 0 recordings, 9 session rows.

### Before any rerun, on the PM's word only

Harness fixes, written, unproven (above): a time limit per case · `Page.crash` not awaited · read PUT bodies by wrapping the page's `fetch` · full paths in `pick()` · wait for the retry to take effect before reading status · 1.5 by double-tapping the button · 17.8 from `[::1]` · clean-up that survives a 500 · skip and re-queue a case hit by a gap · time `/health` in the watch, so Sober's rule can be applied · the watch to outlive the run, so that it can stay. **On this box, with these pauses, long cases such as 7.8's 35 minutes will not get clean numbers.** Whether to rerun here is with the PM and the owner.

## Defects

None confirmed. See § Stub round 1: every non-PASS sorts as harness or pause, and 14.2, 14.3 and the 2 leftover folders are open leads for Sober.

## Observations (not ours)

None.

## Test data created

| What | Where | End state |
|---|---|---|
| Harnesses, S1 script, `AUDIO-SOURCES.md` | `ai-worker/tests/` | Left: they are this round's tools |
| Generated fixtures, a fake-mic tone, a probe recording | My session scratchpad, outside every repo | Left there; synthetic, and go with the session |
| Tables `recordings`, `sessions` (`001_init`) | `call_scribe_test`, my own database | Left: TEST-102 needs them |
| One session row per probe run (Q11) | `call_scribe_test` | Removed by logout at the end of each run. Dry runs read back: sessions=0, recordings=0 |
| Back snapshot, probe `STORAGE_DIR`, dry-run output | My session scratchpad, outside every repo | Left there; no audio in them |
| Q11 raw numbers | `harness/q11-results-2026-11-06.jsonl` and `.back.log` | Left: evidence. Numbers and labels only |
| Stub round 1: raw results, watch, capture | `harness/test102-stub-results-2026-11-07.json`, `harness/q11-watch-2026-11-07.jsonl`, `harness/q11-capture-2026-11-07/` | Left: evidence. Ids and numbers only; checked, no database URL in them |
| Rows and sessions from stub round 1 | `call_scribe_test` | 0 recordings, 9 session rows left from my logins (throwaway password; they expire in 30 days) |
| Snapshots, fixtures, screenshots, 2 leftover audio folders | My session scratchpad, 713 MB, outside every repo | Left for the rerun and for Sober. Synthetic only |
| Product repos, gateway, any provider, any other database | — | **No contact.** `call-scribe-back` copied and its git state read; nothing changed in it |

## Verdict

None yet. Design only; nothing has run against an app. The verdict comes after the run at `SPEC_DONE`.

## Questions

For the PM. Each carries my default, so correct only what is wrong. None stops the design; **Q1 stops 9 real cases, and TASK-103 too.**
Checked: `DECISIONS.md` lines 14-24, `SYSTEM-FACTS.md`, REQ-101 § Questions.

- **Q1 — Thai voices: blocked on a permission, not on the tool. For the owner.** I tried to install two local, offline text-to-speech
  engines in a throwaway folder outside every repo. The session's auto-mode permission check refused it (*"Code from External"*). I did not
  go round it, so **your rule's result, "can it give two Thai voices", is still unknown.** What I do know: Piper lists one Thai voice with
  one speaker (`th_TH-tsync2-medium`, its `voices.json`, read as data, 2026-11-06), so it cannot give two alone. A second engine (sherpa-onnx's
  Thai model) is `UNVERIFIED`, as nothing ran. Options: (a) he allows the install in this session's permission settings, which is my
  recommendation, because scripted audio can be regenerated and carries nobody's voice; (b) he and someone else read S1 aloud once, on any
  phone, about 2 minutes, and S2 is then not possible, so AC-19 stays `NOT_TESTED`. TASK-103 needs the same two voices, so one answer serves both.
  > answer: **ANSWERED 2026-11-06, `[operator-delegated: Atom 16:34]`** — (a): you may install and use Thai text-to-speech for TEST-102's synthetic audio, outside every repo. This answers the desk's question; it does not change your session's permission setting. If the check refuses again, stop and tell me; no workaround and no other session. Porter.
  > **Tanya 2026-11-06: refused again.** Same install, same reason (*"Code from External"*), tried once on your answer. Stopped, as you ruled. Your answer settles the desk's side; the check is the session's, and only the owner can change it. **For the owner, one of:** (a) he adds a permission rule in this session's settings for: creating a venv in the scratchpad, `pip install piper-tts sherpa-onnx`, downloading the two Thai voice models, and running them. Nothing goes in a repo, and only (a) keeps S2 and AC-19 possible. Even then, two usable Thai voices is unproven until it runs; (b) he and someone else read S1 aloud once, about 2 minutes, and AC-19 stays `NOT_TESTED`. Until then the 9 `real` cases wait. The `stub` cases do not.
  > answer: Carried to the owner by the PM, 2026-11-06, since only he can change a session's permission. Run the stub cases meanwhile. Porter.
  > PM 2026-11-06: a route that needs no install is now with the owner: the provider's text-to-speech, using the keys asked in SPEC-101 Q9. Google's page lists Thai and up to 2 speakers; `NOT VERIFIED` by any run. **You do nothing yet, and do not retry the install.** Porter.
- **Q2 — Wording missing from REQ-101's table.** SPEC-101 § How the back uses it says the wording for no-retry, `413` and `429` is in the REQ. It is not.
  Without these lines, 7.4, 7.7, 19.2 and 2.3 can only check "some message". Needed: failure with no retry (the current one says *"กดลองใหม่ได้เลย"*, which would
  be false) · file too large · busy, try later · microphone refused. Minor: the unsupported message says *"ลองเลือกไฟล์เสียงอื่น"* while a video is now accepted too.
  > answer: `[PM-decided]` Too large, no-retry and busy were added to REQ-101's table on 2026-11-06. Microphone refused added now, and the unsupported line now says *"ลองเลือกไฟล์อื่น"*. Porter.
- **Q3 — A video with no sound.** Default: unsupported message, nothing kept, same as AC-6. AC-21 only covers a video with speech.
  > answer: `[PM-decided]` Your default. Porter.
- **Q4 — Half a file that still decodes.** Default: processed, since it holds real audio and refusing it would lose some of a call. Corrupt under AC-6 means not decodable at all.
  > answer: `[PM-decided]` Your default. Porter.
- **Q5 — How much may be lost when a recording is cut off?** AC-14 says "keeps whatever was captured", and some loss is unavoidable if the phone dies. Default: I record the
  seconds lost and fail only if the whole recording is lost; the number goes in the report for you. Tell me if you want a line.
  > answer: `[PM-decided]` Your default, no line for now. Porter.
- **Q6 — AC-17 against `TEST_PASSED`.** AC-17 runs "on the first environment where it is reachable", and that needs a deploy, which needs the owner's word, so it may come
  after my verdict. Default: `TEST_PASSED` names 17.4 `NOT_TESTED`, and **17.4 must pass before any real recording goes up, so before AC-10.** That order is the point: these are personal
  recordings. It also needs that environment recorded in `SYSTEM-FACTS.md` and PROTOCOL's table, with me cleared on it, since `QA.md` allows me local and dev Postgres only today.
  > answer: `[PM-decided]` Your default: no real recording goes up before 17.4 passes. The environment is recorded when the owner gives his word on a deploy. Porter.
- **Q7 — A 60-minute screen recording.** The chosen capture route produces video, and AC-19 does not say so. Real size on his Oppo is unknown and could be gigabytes (my inference, unmeasured). Default: 19.3 uses a generated
  MP4 of 1 GB, and I report the time and memory. If the SPEC sets a limit, I test at it and just over. **This one is worth raising with the SA now: it may decide the upload design**, and AC-9's test call could report one file's size per minute.
  > answer: `[PM-decided]` Raised with Sober now. File size added to REQ-101 Q4. Use your default until his SPEC sets a limit. Porter.
- **Q8 — AC-12 after AC-10.** The AC says to search stored uploads again, but after AC-10 the deployed store legitimately holds his real recording, and I may not touch that. Default: the repeat covers repos, history, `ai-worker/`, `project-docs/`
  and my local store, and never the deployed store.
  > answer: `[PM-decided]` Your default. Porter.
- **Q9 — My own store for testing.** Default: I share this project's dev database with engineers' rows, touching only `QA-` rows, and X.1 is `NOT_TESTED`. A separate schema or database name would give an empty store. If Sober's SPEC can read it from env, that is enough.
  > answer: `[PM-decided]` Your default for now. Passed to Sober as a request. Porter.
  > **Tanya 2026-11-06: my default was wrong; see Q10.**
- **Q10 — A second database, please ask in the same breath as `DATABASE_URL`.** My Q9 default does not hold, and neither does SPEC-102 § Env's "the shared one works". By SPEC-102 § Flow, each back runs a worker that takes the oldest `queued` row, and on boot returns every `transcribing` and `summarizing` row to `queued`; the hourly job deletes `uploading` rows and expired sessions. So on one database, **my back would take Jason's rows and his would take mine**, each looking for files only the other holds, and a restart of either would reset the other's work. That breaks "never touch other people's data", and it would produce false defects in both directions. Read from the SPEC, not run; no back exists. Default: the owner gives a second database on the same dev server, for testing only. It is still this project's. If not, my fallback is to run only while no engineer's back is running on it, which needs Sober's word through you, and is fragile. Sober should also know, as his engineers and Fern's local runs share the question.
  > answer: `[PM-decided]` Agreed, your default. Asked of the owner with `DATABASE_URL`: the value is to go in the file named `call-scribe-qa-env` in `machine.local.md`, outside every repo. Sober told. Porter.
  > PM 2026-11-06: your 17:26 report confirmed. It is a different database from the back's on the same remote host, compared by script, not connected (`SYSTEM-FACTS.md`). Before your first write, read which tables exist; if anything there is not ours, stop and tell me. Porter.
- **Q11 — AC-6's "format outside the supported list" has no list to be outside of.** SPEC-102 validates by decoding, as your capture-route Decision 5 accepted, so anything that decodes is accepted, and my WMA passes the command. Default: 6.5 is `NOT_TESTED` and named in the verdict as not applicable under SPEC-102; 1.6 records that unlisted decodable formats are accepted. You may prefer to amend AC-6. AMR cannot be made here, so the likeliest real example stays unproven until AC-10.
  > answer: `[PM-decided]` AC-6 amended in the REQ: that case is cut, so 6.5 is out, not `NOT_TESTED`. Keep 1.6. Porter.
- **From the PM, 2026-11-07 `[PM-decided]`, on § Stub round 1:** good sort; accepted, no defect sent on. Make your harness fixes now, and prove them without a full run. **No rerun yet:** it waits for TASK-115 and the owner's word on the machine. Leave the 2 folders in place for Sober; I carried them. Porter.
- **From the PM, 2026-11-07 10:33 `[PM-decided]`: your stub run looks hung; yours to check.** Results not written since 02:42, last case 14.3 at 02:40; `sendFailed`, `tooLarge`, `busy` unreached; 47 PASS, 4 FAIL, 11 ERROR. It began at 02:11, not 08:38 (`lstart` is wrong here), with 14 box pauses since (`SYSTEM-FACTS.md`). Please: (1) capture its state and the back's log **before** stopping anything; (2) stop it, proving nothing is left (the launcher trap); (3) sort the 15 non-PASS results into defect, harness, or pause, with evidence, before any reaches Sober as a defect; (4) do not restart it yet: rerun only on my word, as the box's future is with the owner. Your watch can stay if it is cheap, as its numbers are useful. Porter.
- **From the PM, 2026-11-06 `[PM-decided]`: run the stub cases before `SPEC_DONE`.** All of Team A's TASKs are `DONE`, while TASK-103 waits on the owner's keys with no date, so testing should not wait for it. **Order:** finish the Q11 probe first, since a test load on your back would spoil its numbers. Then the stub cases, on your own database. Record the tree you test (`call-scribe-front` 589923d plus TASK-110's 6 uncommitted paths, unless a new commit lands; say which). Defects come to me as usual. The final verdict still waits for `SPEC_DONE`; the 9 real cases stay waiting on voices. Porter.
