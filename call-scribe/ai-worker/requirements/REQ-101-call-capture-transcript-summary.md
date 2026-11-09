# REQ-101: From a call recording on the owner's phone to a transcript, who said what, and a summary
- Status: READY_FOR_SA (2026-11-06, PM), on Atom's delegated Q1 (§ Questions). AC-9 stays `NOT_TESTED` until the owner runs the LINE call.
- Priority: HIGH `[team-proposed]`, the owner has not set one
- Requested: 2026-11-06 by the owner — stamp: `operator`, via Atom
- Deadline: none stated
- Depends on: none
- Source: `../project-docs/requirements-from-owner-2026-11-06.md`, `SYSTEM-FACTS.md`
- Revised 2026-11-06 after the moment-A round (`talks/BRAINSTORM-2026-11-06-req-101-reading.md` § Decision). The ACs were rewritten in place: still DRAFT, nobody had worked to them.

## Problem / Goal

The owner wants a record of what was said on his phone calls without using a computer. Today nothing gives him a
transcript or a summary of a call on his Oppo Android phone, and LINE and Messenger calls have no built-in recorder.
When this is solved, he gets a recording into one app on his phone and reads who said what and what the call covered.

Evidence, verbatim (operator, 2026-11-06):
> "อยากได้แอปที่บันทึกเสียงโทรเบอร์โทรไลน์โทรเฟสแล้วก็ส่งให้เอไอถอดทรานสคริปต์ออกมา แล้วก็ส่งให้เอไอวิเคราะห์บทสนทนาว่าคุยกันใครคนไหนพูดอะไรแล้วก็บทสรุปว่าเนื้อหาที่คุยกันคืออะไรบ้าง" (12:43)
> "ตัวโอเคอะ การอัดเสียงสายอะ เดี๋ยวอัดเสร็จแล้วเอาไฟล์ไปอัพให้ก็ได้ แต่ว่าไลน์อะดิมันไม่มีอัดเสียงอะ" (12:48)
> "ปัญหาคือ ฉันอยากอัดได้ที่มือถือไง" (13:08)
> "ฉันไม่อยากใช้คอมเลย ฉันอยากใช้มันในการอัดเสียงแล้วก็ส่งเป็น Sound Script ให้ AI llm gateway สร้างบทสนทนาได้, หรือสรุป" (13:11)

The PM's reading (mine, unconfirmed): one app on his phone takes a recording, either made in the app or already on the
phone, and returns who said what and a summary. **LINE and Messenger capture is unproven and this REQ promises none;
the build goes ahead on Atom's delegated Q1, and may prove to cover only what the owner's screen recorder can capture.**

## Requirement

1. The owner must be able to pick an audio file already on his phone and send it into the app `[operator 12:48]`, or a screen recording with sound, of which only the audio is used `[operator-delegated: Atom 16:15, Q1]`.
2. The owner must be able to record audio in the app on his phone. `[operator 13:08, 13:11]`
3. The system must produce a text transcript of a recording. `[operator 12:43]`
4. The system must show who said what in that recording. `[operator 12:43]`
5. The system must produce a summary of what the conversation covered. `[operator 12:43]`
6. Every step must be doable on the phone alone, with no computer. `[operator 13:11]`
7. The team must report to the owner, per call type (normal, LINE, Messenger), whether and how the call can be captured on his phone, where "works" means both voices are clear. No result is promised in advance. `[operator-delegated: SYSTEM-FACTS "Known limit"; wording the PM's]`
8. When a step fails or is interrupted, the owner must be told, and what was already captured must not be lost. `[team-proposed]`
9. The owner must be able to return to an earlier result. `[team-proposed, Q3]`
10. Only the owner must be able to reach the app and his recordings. `[team-proposed; call recordings are personal data, operator 2026-11-06]`
11. The owner must be able to delete a recording and its results. `[team-proposed, Q3]`

## Acceptance Criteria

The tester uses only synthetic or self-made audio. AC-1 to AC-8, AC-11, AC-12 and AC-14 run on the tester's own setup at
phone width. **Only AC-9, AC-10 and AC-13 prove the real phone**, and they are the owner's. The pass lines in AC-3, 4 and 5
are `[PM-decided, provisional]`, set to stop a useless result reaching the owner; they do not replace his judgement in AC-10.

- [ ] **AC-1** — **Given** a self-made audio file in each common format the SPEC names, plus the in-app format **When** the user picks it in the app **Then** the app shows it as being sent, then processed.
  - Check: tester, in the app at phone width, per format.
- [ ] **AC-2** — **Given** the app is open and no call is active **When** the user records a known script and stops **Then** that recording enters the same processing as a picked file.
  - Check: tester, with a fake microphone: measures duration and non-silence, and finds the script's words in the transcript.
- [ ] **AC-3** — **Given** a self-made recording of a known script **When** processing ends **Then** at least 80% of the script's words appear in the transcript.
  - Check: tester, with the counting method named in the TEST; the percentage is also recorded for the owner.
- [ ] **AC-4** — **Given** a self-made recording of two voices with known turns **When** processing ends **Then** exactly two speakers are labelled, and at least 80% of the script's turns carry the right voice.
  - Check: tester maps each label to the voice it matches most often, since labels are arbitrary, then counts.
- [ ] **AC-5** — **Given** a script with a written topic list **When** processing ends **Then** the summary covers every listed topic, in any wording, and adds no topic the script does not contain.
  - Check: tester, against the topic list.
- [ ] **AC-6** — **Given** a text file renamed `.mp3`, a 0-byte file, or a corrupt audio file that cannot be decoded ~~, or audio in a format outside the supported list~~ (**AMENDED 2026-11-06 by the PM:** SPEC-102 accepts whatever decodes, so there is no list; TEST-102 Q11) **When** the user picks it **Then** the app shows the "unsupported file" message and keeps nothing.
  - Check: tester, each case, in the app list and in storage.
- [ ] **AC-21** — **Given** a self-made video file with speech **When** the user picks it in the app **Then** the speech goes through like any recording, and no picture from it is stored or sent to an AI provider.
  - Check: tester, in the app, then in storage and in the outgoing request.
- [ ] **AC-7** — **Given** the transcription step fails **When** the user opens that recording **Then** the app shows the "transcription failed" message with a retry that needs no new file.
  - Check: tester, with the step made to fail on the tester's own environment.
- [ ] **AC-8** — **Given** a finished recording **When** the user closes the app and opens it again **Then** that result can be opened.
  - Check: tester, in the app. "Closes" is defined once the app's SPEC settles what is installed.
- [ ] **AC-9** — **Given** the capture check is done on his phone **When** the owner reports it **Then** LINE, then Messenger if LINE passes, each have a result: both clear, other person faint, one voice, or silent, with the route used. Normal calls stand on his word at 12:48.
  - Check: the owner runs it; the PM records it in `SYSTEM-FACTS.md`. No recording, or screenshot showing a contact, comes to the team. Not a tester's check. `NOT_TESTED` until he has a free minute on the phone (Atom 16:15).
- [ ] **AC-10** — **Given** the app is reachable from his Oppo **When** the owner takes one of his own recordings through it with no computer **Then** the owner says the result is good enough.
  - Check: the owner only; no team member ticks this.
- [ ] **AC-11** — regression: **Given** the gateway has been changed for audio **When** the existing Bruno requests and `/tiers` run on a local copy **Then** status codes, response shape and error cases match a baseline taken from 790f63a; the reply text is not compared.
  - Check: the tester of the team that holds the gateway. The baseline can come from a scratch copy of 790f63a; provider calls may be stubbed.
- [ ] **AC-12** — data rule: **Given** the work is ready for delivery **When** the repos, their git history, `ai-worker/`, `project-docs/` and stored uploads are searched **Then** no real call recording or transcript of a real call is found.
  - Check: tester, tracing every audio file to a list of self-made sources. Repeated after AC-10, when a real recording first exists.
- [ ] **AC-13** — **Given** the app or a bare test page on an HTTPS address **When** the owner records speech on his Oppo with the screen off for a few minutes **Then** he reports whether the recording holds all of it. (Call cases dropped 2026-11-06: Sober withdrew them, they cannot change the route.) ~~**And when** he picks a 10-minute screen recording of his own in the app **Then** he reports whether it reaches "sent"~~ **AMENDED 2026-11-06 by the PM:** that wording uploaded his real recording, against this AC's own "uploads nothing" (my error, F-recorded; caught by Sober). **And when** he picks a 10-minute screen recording of his own on the bare test page **Then** the audio strip runs on the phone, nothing is sent, and he reports "finished" or "the page died" (the only proof of the browser strip on his phone).
  - Check: the owner runs it from a click-script the tester writes when the PM asks. It stores and uploads nothing. Not a tester's check. Needs Q5. For the script (Sober 2026-11-06, not run on a phone): the length on `/check` is the recording's own length, so he compares it with how long he spoke; shorter means the phone dropped part of it.
- [ ] **AC-14** — **Given** a step other than AI fails **When** an upload is lost midway, or a recording is cut off **Then** the app says so, keeps whatever was captured, and never reports a silent or empty recording as finished.
  - Check: tester, with the failure forced on the tester's own environment.
- [ ] **AC-15** — **Given** the summary step fails after transcription succeeded **When** the user opens that recording **Then** the transcript shows, and the app offers a retry for the summary only.
  - Check: tester, as AC-7.
- [ ] **AC-16** — **Given** closing the app during processing, after the file has been sent **When** the user reopens it **Then** the result is there, or still processing.
  - Check: tester.
- [ ] **AC-17** — **Given** someone who is not the owner **When** they open the app's address **Then** they reach no recording or result.
  - Check: tester, on the first environment where it is reachable (Q5).
- [ ] **AC-18** — **Given** a recording **When** the owner deletes it and confirms **Then** its audio and results are gone from the app and from storage. (Rests on Q3. Known limit `[PM-decided]`: if a job is running, the gateway holds it in memory until the job ends and for up to 1 hour after, never stored; SPEC-101 § Questions.)
  - Check: tester.
- [ ] **AC-19** — **Given** a self-made 60-minute recording (Q6) **When** it goes through **Then** AC-3 to AC-5 still hold.
  - Check: tester.
- [ ] **AC-20** — **Given** a self-made recording with no speech **When** processing ends **Then** the app shows the "no speech" message, not an empty result.
  - Check: tester.

## User-facing wording

Thai only `[team-proposed, Q6]`. All strings are `[PM-decided]` drafts; the owner has not seen them.

| Where / when | TH | What it promises |
|---|---|---|
| Home, main actions | อัดเสียง · เลือกไฟล์ | The two ways in; a file may be audio or a screen recording |
| While sending | กำลังส่งไฟล์ อย่าเพิ่งปิดแอป | Closing now may stop the send |
| After sending | ส่งไฟล์แล้ว กำลังถอดเสียงและสรุป ปิดแอปได้ เดี๋ยวกลับมาดูผลทีหลัง | Closing no longer matters (AC-16) |
| Unsupported file | แอปเปิดไฟล์นี้ไม่ได้ ยังไม่ได้เก็บอะไรไว้ ลองเลือกไฟล์อื่น | What happened, nothing kept, what to do |
| Microphone refused | แอปใช้ไมค์ไม่ได้ ยังไม่ได้อัดอะไร กรุณาอนุญาตไมค์ในการตั้งค่าของมือถือ หรือเลือกไฟล์แทน | Nothing recorded, two ways forward |
| Send failed | ส่งไฟล์ไม่สำเร็จ ไฟล์ในเครื่องยังอยู่ กดลองใหม่ได้เลย | The file is safe |
| Recording cut off | การอัดหยุดกลางคัน เก็บเสียงเท่าที่อัดได้ไว้แล้ว | What was kept |
| Transcription failed | ถอดเสียงไม่สำเร็จ แต่ไฟล์เสียงยังอยู่ กดลองใหม่ได้เลย | The recording is safe, retry needs no re-upload |
| Summary failed | ถอดเสียงเสร็จแล้ว แต่สรุปไม่สำเร็จ กดลองสรุปใหม่ได้เลย | The transcript is safe |
| File too large (gateway 413, or over the app's limit) | ไฟล์นี้ใหญ่เกินไป ยังไม่ได้เก็บอะไรไว้ ลองไฟล์ที่สั้นลง | Nothing kept, what to do |
| Provider refused this file (`provider_rejected_audio`), no retry offered | ถอดเสียงไฟล์นี้ไม่ได้ ไฟล์อาจเสีย ไฟล์เสียงยังอยู่ ลองเลือกไฟล์อื่นได้ | Retrying will not help; the file is safe |
| Output cut off (`output_truncated`), no retry offered | สายนี้ยาวเกินกว่าจะถอดได้ครบ ไฟล์เสียงยังอยู่ แต่ยังไม่มีผลให้ดู | No partial result is shown as complete |
| Busy (gateway 429) | ตอนนี้ยังถอดเสียงไม่ได้ ไฟล์เสียงยังอยู่ ลองใหม่อีกสักครู่ | Temporary, the file is safe |
| No speech | ไม่พบเสียงพูดในไฟล์นี้ | Nothing was transcribed, for that reason |
| Delete confirm | ลบเสียงและผลของรายการนี้เลยไหม ลบแล้วเอาคืนไม่ได้ | The scope and that it is final |
| Summary output cut off (`output_truncated`), no retry offered | ถอดเสียงเสร็จแล้ว แต่สรุปยาวเกินจนได้ไม่ครบ จึงยังไม่มีสรุปให้ดู | The transcript is there; no partial summary |
| Login | รหัสผ่าน · เข้าสู่ระบบ | Label and button |
| Login, wrong password | รหัสผ่านไม่ถูกต้อง ลองใหม่อีกครั้ง | Nothing else happened |
| Login, too many attempts | ใส่รหัสผิดหลายครั้ง รอ 15 นาทีแล้วลองใหม่ | When it can be tried again |
| Log out | ออกจากระบบ | Ends the session on this device |
| Recording screen | กำลังอัดเสียง · หยุดอัด | State and button |
| No microphone found | ไม่พบไมค์ในเครื่อง ยังไม่ได้อัดอะไร เลือกไฟล์แทนได้ | Nothing recorded, one way forward |
| Preparing a screen recording | กำลังเตรียมไฟล์ อย่าเพิ่งปิดแอป | Closing now may stop it |
| Buttons | ลองใหม่ · ลบ · ยืนยัน · ยกเลิก · ส่งเสียงที่อัดได้ | Each does only what it says |
| List status: `uploading` · `queued` · `transcribing` · `summarizing` · `done` · `no_speech` · `transcription_failed` · `summary_failed` | กำลังส่ง · รอคิว · กำลังถอดเสียง · กำลังสรุป · เสร็จแล้ว · ไม่พบเสียงพูด · ถอดเสียงไม่สำเร็จ · สรุปไม่สำเร็จ | The state of each recording, in this order |
| `/check`, title | ทดสอบมือถือ | A check page, not the app |
| `/check`, top line | หน้านี้ไม่ส่งไฟล์ออกจากเครื่องและไม่เก็บอะไรไว้ ปิดหน้าแล้วหายหมด | Nothing is sent or kept |
| `/check`, record | เริ่มอัด · หยุดอัด · อัดได้ {นาที}:{วินาที} ฟังดูว่าเสียงครบไหม | His own check by ear |
| `/check`, strip: pick, running | เลือกไฟล์วิดีโอ · กำลังแยกเสียง อย่าเพิ่งปิดหน้านี้ | What is happening |
| `/check`, strip finished | แยกเสียงเสร็จแล้ว ไฟล์เดิม {ขนาด} เหลือ {ขนาด} ใช้เวลา {วินาที} วินาที | Result to report |
| `/check`, strip failed | แยกเสียงไม่สำเร็จ ไม่ได้ส่งไฟล์ไปไหน | Nothing left the phone |
| `/check`, page died | รอบก่อนหน้านี้ปิดไปกลางคันตอนแยกเสียง ไฟล์นี้อาจใหญ่เกินไปสำหรับเครื่องนี้ | Result to report |
| `/check`, no microphone API, or the recorder will not start | หน้านี้ใช้ไมค์ไม่ได้ ยังไม่ได้อัดอะไร | Nothing recorded; a result he reports |
| `/check`, microphone refused | แอปใช้ไมค์ไม่ได้ ยังไม่ได้อัดอะไร กรุณาอนุญาตไมค์ในการตั้งค่าของมือถือ | Nothing recorded, one way forward |
| `/check`, no microphone found | ไม่พบไมค์ในเครื่อง ยังไม่ได้อัดอะไร | Nothing recorded |
| Audio file gone from storage (`audio_missing`), no retry offered; list row stays ถอดเสียงไม่สำเร็จ | ไม่พบไฟล์เสียงของรายการนี้แล้ว จึงถอดเสียงไม่ได้ ถ้ายังมีไฟล์อยู่ เลือกไฟล์นั้นส่งใหม่ได้ | The audio is gone, retrying will not help |
| In the app, no microphone API at all | แอปใช้ไมค์ไม่ได้ ยังไม่ได้อัดอะไร เลือกไฟล์แทนได้ | Nothing recorded, one way forward |
| In the app, the phone cannot keep a recording, so recording does not start | มือถือเก็บเสียงที่อัดไม่ได้ จึงยังไม่เริ่มอัด เลือกไฟล์แทนได้ | Nothing recorded, one way forward |
| A mic recording the back refuses (`413`, `415`), no retry offered; buttons ลบ with Delete confirm | ใช้เสียงที่อัดนี้ไม่ได้ เสียงยังเก็บอยู่ในเครื่อง ถ้าไม่ต้องการแล้วกดลบได้ | Unusable, still on the phone, nothing goes unless he confirms |
| Result screen, a retry did not go through | ลองใหม่ไม่สำเร็จ ยังไม่มีอะไรเปลี่ยน กดลองใหม่ได้อีกครั้ง | Nothing changed, he can press again |
| Result screen, a delete did not go through | ลบไม่สำเร็จ เสียงและผลยังอยู่ ลองใหม่อีกครั้ง | Both are still there |
| Result screen, back to the list | กลับ | Returns to the list |
| Before login or Home appears | กำลังเปิดแอป | Checking, nothing wrong yet |
| List loading | กำลังโหลดรายการ | Still working |
| List could not be read (button: ลองใหม่) | โหลดรายการไม่สำเร็จ ลองใหม่อีกครั้ง | The read failed; nothing else is claimed |
| Login failed, other reason | เข้าสู่ระบบไม่สำเร็จ ติดต่อระบบไม่ได้ ลองใหม่อีกครั้ง | Not a wrong password |
| Date on a list row | `6 พ.ย. 2569 16:10` (Thai, Buddhist year) | When it was recorded |
| Result sections | บทสนทนา · สรุป | One labelled conversation, one summary |
| Speaker labels | ผู้พูด 1 · ผู้พูด 2 | Different voices, not identities |
| Empty list | ยังไม่มีเสียงที่บันทึกไว้ | Nothing has gone wrong |

## Constraints

From `SYSTEM-FACTS.md`, all `[operator 2026-11-06]`: Oppo Android phone, single user, no computer · front never Flutter ·
back is Bun + Hono or Bun + Elysia only · the owner's dev Postgres only, never a local one · AI only through the owner's
gateway · env values come from the owner · no real recording in git, a log or FAILURES, and tests use synthetic or
self-made audio only · the deployed gateway and production are the owner's.

Front: start as mobile web/PWA; native Android only if the upload path needs it `[operator-delegated: Atom 16:15]`.

## Out of Scope

All `[PM-decided]`, not yet shown to the owner:
- Other users, teams, and sharing a result with anyone else.
- iPhone, and any screen designed for a computer.
- Live transcription during a call. A result comes after the recording ends.
- Search across calls, tags, and export.
- Audio playback in the app.
- Turning "ผู้พูด 1" into a real name, in this round (Q2).
- Any promise that LINE or Messenger calls can be captured.
- A consent notice or legal advice about recording calls (default Q8).

## Second reading

Round closed 2026-11-06: `talks/BRAINSTORM-2026-11-06-req-101-reading.md` § Decision.

## Questions

Checked: `DECISIONS.md` (7 lines, 2026-11-06) and `SYSTEM-FACTS.md` (all sections): not covered.

Reduced after the capture-route round, on the owner's word 2026-11-06 14:10 (*"ไประดมสมองคุยกันกับ SA เพื่อหาทาง ดีกว่ามั้ย"*). Route order and reasons: `talks/BRAINSTORM-2026-11-06-capture-route.md` § Decision.

**Delegation, via Atom 2026-11-06 16:15:** owner: *"ฝากตัดสินใจ แทนฉันไปก่อนนะ"*. Answers below stamped `[operator-delegated: Atom 16:15]` are Atom's decisions under it, not the owner's own words. Atom's scope: the remaining REQ-101 pack, until he says otherwise. Not covered: phone-side checks, deploy, money, customers, the live gateway.

**Held for his phone:**

- **Q4 (DATA REQUEST, PM → owner — BLOCKS AC-9 only)** — One LINE test call, about a minute, with someone who agreed, using the phone's screen recorder set to system sound and microphone. He plays it back and answers: both clear · other person faint · one voice · silent, and gives the file's size (added 2026-11-06, from TEST-102 Q7; it may decide the upload design). Messenger the same, only if LINE is clear. No file comes to the team.
  > reply 2026-11-06 15:59, `[operator]`, via Atom: *"ควรจะ ชัดทั้งคู่"*. PM's reading: the bar, not a result, so requirement 7's "both voices are clear" now stands on his word.
  > answer: **NOT RUN as of 2026-11-06 16:15** (via Atom: the 15:59 words were the bar only). Open until he has one free minute; Messenger after that. `[operator-delegated: Atom 16:15]`

**Decided under the delegation:**

- **Q1 (PM → owner — BLOCKS READY_FOR_SA)** — With the result in hand: is the app worth building on this route? If the screen recorder fails, the next try is an existing recorder app on one test call. A native helper is raised only if that app works and he refuses a third party holding his calls.
  > answer: **ANSWERED 2026-11-06, `[operator-delegated: Atom 16:15]`** — GO build. Capture = Oppo screen recorder, then upload in the app; an existing recorder app is the fallback; native helper only if those fail. Front never Flutter; start mobile web/PWA; native Android only if the upload path needs it. SPEC-101 may proceed.
  > PM's note: both SAs expect a helper cannot do better if the existing app fails (`talks/BRAINSTORM-2026-11-06-capture-route.md`), so reaching that branch goes back to the owner rather than straight to a build. `[PM-decided]`

**Defaults** `[PM-decided 2026-11-06]`, kept by `[operator-delegated: Atom 16:15]`. The owner has not seen these himself.

- **Q2** — "ผู้พูด 1 / 2"; AI cannot get a name from a voice alone (Silver's read of provider docs).
- **Q3** — Keep audio and results until he deletes them, with a delete button.
- **Q6** — Thai with some English terms; design for calls up to 60 minutes (my number, not his).
- **Q7** — Both the conversation and the summary, every time. Evidence conflicts: 12:43 *"แล้วก็"*, 13:11 *"หรือ"*. A per-recording choice can be added later (Silver).
- **Q8** — No consent notice in the app; recording rules for a call are his own.

**Later, by the need named:**

- **Q5 (BLOCKS AC-10, AC-13, AC-17)** — HTTPS is needed for the microphone (Tanya and Sober ran it on desktop Chrome; not run on his Oppo). Will he have Otto put up a bare test page for AC-13 first, then the app with access limited to him?
  > recommendation `[team-proposed]`: yes; the bare page stores nothing, so it need not wait for access control.
  > answer: **Yes in principle when AC-13 needs it, `[operator-delegated: Atom 16:15]`.** Deploy is outside the delegation, so the PM asks the owner's word before Otto puts up anything. `[PM-decided]`
- **Q9 (BLOCKS AC-3, 4, 5, 7, 15, 19)** — `GEMINI_API_KEY`, `XAI_API_KEY`, `DATABASE_URL`, and a spend limit for test runs. Silver's 2-minute provider check comes first; its size was xAI about a third of a US cent, and TASK-103 adds a 60-minute run per provider, xAI about 10 US cents at the batch rate (Silver's arithmetic); Gemini not priced. Silver raises it when TASK-102 is DONE.
  > answer: **HOLD until the first TASK needs env, `[operator-delegated: Atom 16:15]`.** The keys and any spend limit go to the owner then. No real provider call before that.
  > PM 2026-11-06: that moment has come (TASK-102 `DONE`). Asked the owner for the 2 keys and a US$1 limit; `DATABASE_URL` is already in place (`SYSTEM-FACTS.md`). Pending; no real provider call until he answers. Sizing and the voice route: SPEC-101 § Questions Q9. `[PM-decided]`
  > PM 2026-11-07: keys in place, owner via Atom 01:37. Spend and live calls await his own confirmation (`DECISIONS.md`, 2026-11-07 lines). TASK-103 prep only.
- **Q10 (does not block until the gateway is deployed)** — Which commit runs on the deployed gateway, its `AUTH_ENABLED`, and which provider he accepts for call data. Silver reports that deploying `atom` could start returning 401 to other apps (inferred; the live commit is unknown).
  > answer: **HOLD, `[operator-delegated: Atom 16:15]`.** The live gateway stays his.

**Answered within the team:**

- **Who builds what** `[PM-decided 2026-11-06]`: the batch line on `board.md`. Team B: the gateway's audio endpoint, who said what, the summary call. Team A: the app and its back, including stripping audio from video. Silver writes the endpoint contract first; the PM carries it to Sober. Tester: Tefany holds AC-11; Tanya holds the other tester ACs.
- **Test audio** `[PM-decided 2026-11-06]`: synthetic text-to-speech first, tool outside the product repos; if it cannot give two Thai voices, tell the PM.

- **From Tefany: what does `TEST_PASSED` cover, and where does REQ-101 go if AC-10 fails?**
  > answer: **PM-decided 2026-11-06, `[PM-decided]`** — `TEST_PASSED` = every tester AC passed, with AC-9, AC-10, AC-13 and the phone surface named `NOT_TESTED`. `DELIVERED` needs the owner's AC-10 as well. If AC-10 fails, the defect goes to the SA as REQ content, REQ-101 returns to `IN_SPEC`, and the tester re-tests what changed.

## Verification

| AC | Verdict | What I checked myself |
|---|---|---|
