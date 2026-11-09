# Brainstorm 2026-11-06 — REQ-101: what the owner actually asked for

Moment A (`team-brainstorm.md`), started by the PM before anything is asked of the owner.
Evidence: the owner's words in `../requirements/REQ-101-call-capture-transcript-summary.md` § Problem / Goal; the full
record is `../../project-docs/requirements-from-owner-2026-11-06.md`. Each joiner answers once, under their own heading
below, then puts one pointer line in `inbox/PM.md`. The PM still decides; business intent goes to the owner.

Reply with one of: your reading holds · the other is stronger · a third reading · run this check instead. Cite evidence.

## Second reading 1 — what "record" has to achieve
- **What I read it as:** two ways in (record in the app, or pick a file), with LINE and Messenger capture investigated
  and reported, so an app that handles only files and in-app recording is still a useful first delivery.
- **The strongest other reading:** capturing LINE and Messenger calls on the phone IS the point (12:48 and 13:08:
  *"ไลน์อะดิมันไม่มีอัดเสียงอะ"*, *"ปัญหาคือ ฉันอยากอัดได้ที่มือถือไง"*). Normal calls he can already record. If LINE
  cannot be captured, an upload app misses what he wanted, and the investigation must come before any build.
- **What would tell them apart:** the investigation's result on his phone, and his answer to one consequence question:
  "if LINE cannot be captured at all, is the rest still worth building?"

## Second reading 2 — "ใครคนไหนพูดอะไร"
- **What I read it as:** turns labelled by distinct speakers (ผู้พูด 1 / 2).
- **The strongest other reading:** he expects to see who each person is (himself, the other party by name).
- **What would tell them apart:** what the transcription and the analysis can really identify from audio alone, then
  the owner's choice on one sample result.

## Second reading 3 — 13:11 *"ส่งเป็น Sound Script ให้ AI llm gateway สร้างบทสนทนาได้, หรือสรุป"*
- **What I read it as:** "Sound Script" is a transcript (Atom's relay looks voice-typed), and he gets both outputs every
  time, as 12:43 says *"แล้วก็"*.
- **The strongest other reading:** *"หรือ"* means he chooses per recording, conversation OR summary, which also changes
  the AI cost per call.
- **What would tell them apart:** one line to the owner, unless a joiner finds it settled in the files.

## Second reading 4 — how a phone reaches it at all
- **What I read it as:** the team proves it locally at phone width, then the owner has it put up, and AC-10 happens on
  his phone only after that.
- **The strongest other reading:** the phone is the only real test surface. In-app recording and capture cannot be
  proven without it, so a reachable environment is needed from the start, not at the end.
- **What would tell them apart:** the SAs' and testers' answers below on what local testing can and cannot prove.

## Asking

- **@Sober** (app): reading 1 and 4. What can a mobile web app do with the microphone during a call or a LINE call? Mark
  what you verified and what you did not.
- **@Silver** (gateway): reading 2 and 3. What does `develyst-ai` really take today? `SYSTEM-FACTS.md` says text only,
  in Atlas's wording, and I have not checked it. Is there a route to Thai transcription with speakers?
- **@Tanya, @Tefany** (testers): can you test AC-1 to AC-8 without his phone, and is every AC in REQ-101 checkable as
  written? Name any that are not.

## Replies

### Sober

**Reply. Reading 1: the other reading is stronger on order — find out about LINE before anything is built on it. Reading
4: run the check below; I agree with Tanya and Tefany that the phone check comes early, and it needs one case they did
not list, recording during a call.** Nothing was run on Android or on his Oppo; there is no phone, `adb` or emulator here.

Marks: **RAN** = I ran it here (Chrome 156, Linux, headless, fake mic) · **DOC** = read in the primary source, not run ·
**INFERRED** = my step from a source · **NOT VERIFIED** = no source good enough.

**1. What a mobile web app can do with the microphone**

| Case | Answer | Mark |
|---|---|---|
| Normal call in progress | Android's rule for "Voice call + ordinary app": *"The call always receives audio"*; another app captures only if it is an accessibility service, or a pre-installed app with `CAPTURE_AUDIO_OUTPUT`. A page in Chrome is neither, so expect no usable call audio | DOC, the step to Chrome is INFERRED. The page does not spell out "silence" for this case, and ColorOS may differ |
| LINE / Messenger call | Android counts `MODE_IN_COMMUNICATION` as a voice call, so the same rule applies if they set it | DOC for the rule; that LINE and Messenger set it is INFERRED |
| Hearing the other party through the browser | `getDisplayMedia` is `version_added: false` on Chrome Android (MDN compat data), so there is no screen or system audio route from a page | DOC |
| If the mic did stay live in a call | It holds only what the mic hears: his voice, plus the other side only if it leaks from the speaker. Browser echo cancellation may remove even that | INFERRED, NOT VERIFIED |
| Recording with no call | Works: `audio/webm;codecs=opus`, 24446 bytes, decoded non-silent (peak 0.399). A fake mic can drive the flow | RAN, desktop only. Android's format is NOT VERIFIED |
| Plain `http://` to a non-localhost address | `isSecureContext:false`, `navigator.mediaDevices` undefined, no service worker; on `localhost` all present. So recording needs HTTPS | RAN, desktop; same result as Tanya's |
| Screen off or app switched while recording | Android silences background capture without a foreground service. Whether Chrome keeps it alive on ColorOS is unknown | DOC for the rule, NOT VERIFIED for Chrome |
| Incoming call during a recording | No Chrome Android source found. Reports on other browsers describe a stream that goes silent **with no error**, so we could save a silent file and call it a success | NOT VERIFIED |
| Picking the dialer's file | A file input should work, and needs no mic. Sharing from another app into an installed PWA is `share_target`: Chrome Android 76+, but the compat data has no entry for sharing files | NOT RUN on Android; `share_target` DOC, its file support NOT VERIFIED |

**Bottom line: do not expect a web app to record a LINE or Messenger call. This rests on Android's docs, not on his
phone,** so AC-9 still needs his phone's result.

**2. Routes that could still get LINE audio** (for the PM's Q1; none promised)

- **The phone's own screen recorder, if it records call audio.** Its output would then be picked as a file. Android lets
  system components capture more than apps can, which is a reason to try it, not to expect it. NOT VERIFIED on ColorOS.
  It would give a **video** file, and AC-6 as drafted may refuse it.
- **A small native Android helper.** Android documents accessibility services as able to capture during a call. How much
  of the other party it gets, and whether sideloading it is acceptable, are NOT VERIFIED. Not a web app (see §3).
- **A second device on speakerphone.** Needs nothing from us, but cuts against *"ฉันอยากอัดได้ที่มือถือ"*.

**3. A provenance point for the PM, on the files.** `SYSTEM-FACTS.md` line 43 and `DECISIONS.md` line 17 say "mobile-first
web app" under an `[operator]` stamp citing 13:12. His 13:12 words say only no Flutter, and Bun on the back.
`ATLAS.md` lines 1038-1039 record "installable web app or native, SA decides" and then "Atlas leans" to a web app. So
I read "web" as Atlas's lean, not his ruling. It matters only if LINE matters. Not mine to correct; the PM decides.

**4. Reading 1.** 12:43 names LINE and Facebook calls first, and 12:48 names LINE as the gap. One caution on the evidence:
13:08 does not name LINE and sits beside 13:11 "no computer", so it may be about the phone and not about LINE. Still, §1
makes the PM's first reading risky: it could deliver the part he said he can already nearly do. The answer to Q1 also
decides the front's shape, so **I hold SPEC-101's front stack until Q1 closes.** Upload, transcript and summary are the same
either way. Q1 lands better with results in hand: "LINE works by route X / not at all; is the rest still worth it?"

**5. Reading 4: the checks, cheapest first** `[team-proposed]`

- **Check A, needs nothing from us.** The owner, on one test call with someone who agreed: record a normal call with the
  dialer; run the phone's screen recorder during a LINE call and a Messenger call. He reports only: can both voices be
  heard, the file's type, and where it landed. **No file comes to the team.** This fills most of AC-9 and sharpens Q1, Q4
  and AC-6, so I would add it to Q4.
- **Check B, needs an HTTPS address.** Tanya's and Tefany's bare recording page, plus my one case: **record during a LINE
  call and a normal call**, and report whether both voices are there. It should store and upload nothing. It answers §1's
  unknowns on his real phone.
- So Q5 needs rewording: "once the tester has passed it" is too late for Check B. Since that page holds no recordings, it
  need not wait for the "only he can reach it" decision that a real server does. Hosting is the owner's call.

Local testing can prove the pipeline. It cannot prove anything marked NOT VERIFIED above, and the phone-only list from
the testers stands.

**6. Things the REQ asked of me, or that follow from this**

- *"ปิดแอปได้"*: **does not hold as written for the upload.** Once the file is on the server, processing can continue
  with the app closed, and I would design it that way. Before that, I expect closing to stop the upload (INFERRED; Background
  Fetch not checked). The PM may want a separate "uploading" message; I can confirm the rest in SPEC-101.
- AC-2's check says "plays back", but no requirement gives the app a player. Tanya and Tefany raised it; I would add none
  unless the PM asks.
- Team B's endpoint needs to accept what the app sends: `webm/opus` (desktop result) and the dialer's format, still
  unknown. For the PM to carry; I do not contact Silver.

**Sources:** [Android: sharing audio input](https://developer.android.com/media/platform/sharing-audio-input) ·
[Android: playback capture](https://developer.android.com/media/platform/av-capture) ·
[MDN: getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) ·
[MDN compat data: MediaDevices](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/MediaDevices.json) ·
[MDN: share_target](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target) ·
[Mozilla bug 914494](https://bugzilla.mozilla.org/show_bug.cgi?id=914494) ·
[WebKit bug 208209](https://bugs.webkit.org/show_bug.cgi?id=208209). A search for ColorOS's recording path and format found
nothing reliable, so I state none.

### Silver

**Short answer.** Reading 2: your reading holds, numbered speakers first; AI cannot get a real name from a voice alone.
Reading 3: your reading holds as the build default, and the answer does not change the gateway work, so one line in the
pack is enough. Thai with speakers has routes on paper, **but no provider I read confirms Thai, so none is proven. Run
the check at the end.** Nothing below used a real provider or the deployed gateway. All of it is `[team-proposed]`.

**What `develyst-ai` takes today.** Read at `atom` 790f63a on 2026-11-06, tree clean. Ran on an exported copy in my
scratchpad, fetch stubbed so nothing left the box (`tests/harness/stub-fetch.ts`).

| Finding | Evidence |
|---|---|
| No audio path on any of the 6 branches. Designed contract is text: `content: string` | `git grep` audio/transcribe/multipart/mime terms on each branch: 0 hits; `src/types/index.ts:10` |
| Sending a file fails: multipart to `/chat` returns a bare `500 Internal Server Error` | Ran. `src/routes/chat.ts:25` parses JSON outside the `try` |
| "Text only" is not enforced. Array content and an unlisted model id pass straight through to OpenAI-style providers. Gemini gets the array inside `text`, which I expect it to reject (not sent) | Ran, read the stub's outbound body. **An accident: do not build on it** |
| Defaults are 1024 output tokens and 30 s; the caller can override both | Ran; `src/config/models.ts:15-16` |
| **Cut-off output looks complete.** The stub answered `length` / `MAX_TOKENS`; the response had no trace of it, and Gemini returned only `parts[0]` of 2 parts | Ran; `src/types/index.ts:31-41`, `src/providers/gemini.ts:51` |
| Bun docs say an in-flight request is closed after 10 s idle. **Not reproduced:** a 70 s handler returned 200 on Bun 1.4.2 here. Deployed Bun version unknown | Ran. Conflict left open; the SPEC sets the timeout explicitly |

**Correction for `SYSTEM-FACTS.md` (the PM's file).** "Text only" holds as the contract. "Analysis (who said what,
summary) uses `/chat` as is" does not hold in two ways. A transcript carries no voices, so who said what has to come from
the audio step; a text model could only guess from content (inferred; the check below can show it). And `/chat` as is can
silently cut long output, so it suits the summary only with explicit limits and a check for truncation.

**Routes to Thai with speakers.** From each provider's docs on 2026-11-06, read through a fetch tool, so not word-checked.

| Provider | Speakers | Limits | Thai | My read |
|---|---|---|---|---|
| Gemini (already in the gateway, audio example uses `gemini-3.8-flash`, its medium tier) | By prompt + response schema, "Speaker 1, Speaker 2": model output, no dedicated parameter | Inline 20 MB per request, Files API above; 9.5 h per prompt | Page lists no languages | Candidate |
| xAI (provider is in the gateway, `POST /v1/stt` is not) | `diarize=true`, `speaker` integer on each word | 500 MB; $0.10/h batch | "25+ languages", Thai not named; docs show `en, fr, de, ja` as examples | Candidate, Thai is the open point |
| OpenAI | `gpt-4o-transcribe-diarize` + `diarized_json`; up to 4 known-speaker clips of 2-10 s | 25 MB | Whisper list not opened | **Avoid:** that model is deprecated, shutdown 2027-02-26 |
| DeepSeek | None found | | | No. Docs show text and image input only; absence, not a statement |

A vendor page (Soniox) gives Thai error rates, but it is a competitor's marketing, so I give it no weight. Format: none
of the three lists AMR. If his dialer writes AMR (Q4) we must convert. Length: at an assumed 64 kbps, 25 MB is about 52
minutes and 20 MB about 41 before base64, so Q6's number decides whether a long call needs chunking or a files route.

**Reading 2.** Every route gives distinct speakers, never identities. Names can come only from three places: reference
clips (OpenAI's deprecated model only), a guess from what people say, or **a third option: he renames "ผู้พูด 1" to a name
himself on each recording.** That last one is app work with no gateway change, and it can be added later without changing
the contract, because labels stay ids. Q2's recommendation stands. Sharper wording: "ผู้พูด 1/2 first, and would renaming
them yourself be enough later?" Real risk, not yet known: the reply below on mono, compressed phone audio applies most
here, since separating two voices is what suffers. I have no measurement.

**Reading 3. The files do not settle it:** `project-docs` line 6 (12:43) says *"แล้วก็"*, line 15 (13:11) says *"หรือ"*.
A technical point weakens the other reading: conversation and summary both need the same audio step, and that step is
the main AI work. Choosing per recording would save at most the one extra text call for the summary (inferred from the
shape; no Gemini or OpenAI prices checked). A choice can also be added later if turns and summary are separate fields,
so "both, every time" is cheap to reverse. *"บทสนทนา"* in the REQ's
result sections also reads as one view: the labelled turns are the transcript, not a second output. The PM's call.

**For AC-7 (testers' question).** There are two AI steps. Audio can succeed and the summary fail, so the turns survive
and *"ถอดเสียงไม่สำเร็จ"* would be false there. For AC-11, the stub lets response shape be compared with no provider
spend; the testers decide if that is enough.

**Risks for the PM's pack, none of them mine to decide:**
1. **Deploying `atom` brings more than audio.** `atom` is 7 ahead of and 2 behind `origin/production`, and `production`
   has no auth code. On `atom`, auth is ON unless `AUTH_ENABLED` says otherwise (`src/auth/authMiddleware.ts:7`). So if
   production's code is what is live, other apps sending no key would start getting 401 (inferred: which commit is live
   is unknown). This belongs with Q5.
2. **Where recordings go.** With no `provider`, `/chat` starts at DeepSeek and can walk through 4 providers (ran:
   `deepseek-flash` answered). I will pin one named provider for audio and transcripts, so a call never spreads by
   fallback. Whether a provider keeps or trains on this data depends on the key's terms, which I did not check. He
   should choose knowingly.
3. **The `llm-gateway` skill disagrees with this repo:** it says no key is needed and lists older models; `atom` differs
   on both. The skill may describe what is deployed (inferred). Reported per its own rule.

**DATA REQUEST (via the PM, can go in the pack):** which commit runs on `ai.develyst.online`, its `AUTH_ENABLED`, and
whether its Gemini and xAI keys are live. I did not call it. Why: it decides risk 1 and which candidates are usable.

**Run this check instead of arguing.** One self-made clip of about 2 minutes, two Thai voices reading a known script, one
run each on Gemini and xAI on a local copy, plus a plain transcript sent through `/chat` to show what text alone can do.
It settles Thai, speakers and the provider, and gives the owner his "one sample result" for reading 2. It needs what the
testers named: the audio source, plus `GEMINI_API_KEY` and `XAI_API_KEY` from the owner and clearance to spend on two
short runs. Size: xAI is about a third of a US cent at the batch rate (2 min at $0.10/h); Gemini not priced by me. For
the PM, on the sizing the testers asked about: that is this check's size only, because the per-recording route is not
chosen until it has run. It would run as a TASK after READY_FOR_SA, or earlier if the PM decides. Touches no deployed
system.

### Tanya

**Short answer.** Without his phone I can test the app's logic for AC-1, 2, 6, 7 and 8. AC-3, 4 and 5 can run without
the phone too, but not yet: they wait on four things below. Not every AC is checkable as written: AC-4 and AC-11 are
not, and AC-3, 5, 6, 7, 9 and 12 need a sharper line. Nothing here is a verdict; the app does not exist.

**Reading 4: a third reading.** Neither "phone only at the end" nor "phone from the start". The logic is proven locally.
A short list of phone-only risks needs one early owner-run check on his Oppo, using synthetic audio, as soon as a thin
build exists. Reason: AC-10 is the only phone proof and it covers one recording, which may be a picked file. **So
requirement 2, recording in the app on the real phone, can reach delivery never having run on one.** Q5 as written ("once
the tester has passed it") assumes the end-of-line answer, so it may need rewording, for the PM to decide.

**What I ran** (2026-11-06, this machine, throwaway, nothing left on the desk or in a repo):
- Headless Chrome on Linux with `--use-fake-device-for-media-stream --use-file-for-fake-audio-capture=<wav>`, 440 Hz
  tone in, `MediaRecorder` for 3 s. Result: `audio/webm;codecs=opus`, 3.00 s, measured about 438 Hz. **A synthetic file
  can stand in for the microphone.** A tone, not speech.
- The same page over plain `http://` on a non-localhost address: `isSecureContext:false`, `navigator.mediaDevices`
  undefined. **So recording cannot work from a phone reaching a dev machine by plain http; it needs HTTPS.** Desktop
  Chrome result; Android Chrome is the same web rule, but `UNVERIFIED` on his Oppo.
- Not run: anything on Android. No `adb` or emulator here, and this user is not in `/dev/kvm`'s group. An emulator
  would not be ColorOS anyway.

**What a local run cannot prove (phone-only list):** the mic on his Oppo · whether the real file picker reaches dialer
recordings (Playwright fills the input without opening any picker) · the dialer's real file format · screen off, app
switch or an incoming call while recording · closing the app mid-upload · installing it · how phone-call audio transcribes
(mono, compressed, both sides mixed; clean test audio will flatter the result).

**AC by AC:**

| AC | Without his phone? | Checkable as written? |
|---|---|---|
| 1 | Yes, logic only | Yes |
| 2 | Yes, with the fake mic | Mostly. The check says "plays the result back", but no requirement gives the app a player. Where do I play it? |
| 3 | Yes, once the blockers clear | **Cannot fail.** Quality is rightly the owner's, but a garbage transcript still "shows a transcript". Needs a floor. |
| 4 | Yes, once the blockers clear | **No.** One label on every turn passes "each turn carries a speaker label", and the count has no pass line. |
| 5 | Yes, once the blockers clear | Partly. All topics or some? Does an invented topic fail it? |
| 6 | Yes | Partly. The check looks at the list only, but "keeps nothing" also means no stored file or row. Undefined: an audio format we do not support, a video with sound, a text file renamed `.mp3`. Q4's dialer format decides the first. |
| 7 | Yes | Partly. Which AI step? If the transcript succeeds and the summary fails, *"ถอดเสียงไม่สำเร็จ"* is untrue. |
| 8 | Yes | Yes, once Q3 is answered |
| 9 | No, his phone only; not a tester check | Partly. "Works" is undefined: a capture with only his own voice is not the call. Are both voices audible on playback? Evidence must not put a real recording, or a screenshot showing a contact, in git. |
| 10 | No | Yes, as the owner's word. See the gap above. |
| 11 | Yes, local copy | **No.** LLM answers differ on every run, and `/chat` adds the current time to every call (`develyst-ai/CLAUDE.md`, read not run), so "return what they returned" fails even with no change. Needs: same status and response shape, not same text. |
| 12 | Yes | Partly. Listing audio files misses git history, renamed files and `project-docs/`. A real call's transcript in text is the same data and is not covered. Tracing needs a list of our self-made audio, which I would keep. |

**Promised or required, but no AC tests it:**
- Requirement 8 beyond the AI step: upload lost midway, recording interrupted (a call comes in, screen off).
- The processing message's promise *"ปิดแอปได้"*: AC-8 closes the app only after the work has finished.
- Only he can reach it (Q5 raises this; no AC).
- A very long call (needs Q6's number). Audio with no speech (what should the app show?).
- Delete, if Q3 says yes.

**What blocks AC-3, 4, 5 and the real half of 7:**
1. Team B's audio endpoint, on a local copy of the gateway. A mock would prove plumbing only.
2. Keys from the owner: the gateway's provider keys (`.env.example`) and `DATABASE_URL`.
3. 🛑 **Money:** real runs spend on the owner's provider keys, and that is on my stop list. I need clearance and a limit
   from the PM. The same applies to AC-11's `/chat` requests, including the 4-model `/chat/multi`.
4. **Test audio has no source yet.** No text-to-speech here and I have no voice. Two Thai voices need either a TTS tool
   installed outside the product repos (npm registry reachable; Thai quality not tried) or the owner recording a script
   with someone. Which is the PM's call.

**Time-sensitive:** AC-11 needs its "before" run on the gateway before Team B's first change. Today `atom` = 790f63a with a
clean tree. The repo is Team B's, so I read this as Tefany's `[team-proposed]`; the PM names the tester.

**Run this check instead of arguing reading 4:** the owner-run phone check above (open over HTTPS, record, pick a file
from his dialer folder, take an incoming call while recording), as a numbered click-script I write when the PM asks.

**Asked of the PM (answers change what I design):** a pass line for AC-3, 4, 5 and 11 · the undefined cases in AC-6 and 7
· whether the uncovered items above become ACs · AC-12's scope. The ACs stay the PM's; I wrote no TEST.

### Tefany

**Reply: your reading 4 holds for the pipeline, the other reading is stronger for the microphone. Run the check in §4.**
Most of this is checkable once the ACs are tightened; **AC-3 and AC-4 cannot fail as written**, and AC-4 is the owner's
core ask. I judged the ACs by reading them. No app exists, so no AC has been run. Everything below is `[team-proposed]`;
the PM decides.

**1. What I ran (this box, 2026-11-06), so the answer is not from memory**
- `bun tests/harness/local-fake-mic-probe.mjs <input.wav> <dir>`: Chrome, headless, fake mic fed a generated 440 Hz WAV.
  Result: `secure:true` on localhost, a recording of 3.00 s (opus, 48 kHz, mono), mean -30.4 dB overall and -30.4 dB
  through a 440 Hz band-pass, so the recorded signal is the tone I fed in. **The recording path can be driven without
  a phone.** It proves a browser API works with a file posing as a mic; it proves nothing about a real mic or his Oppo.
- That probe asked for a 390 px window and the page reported `width:500`. Plain headless Chrome did not honour phone
  width. Playwright is not installed here. It would need to come from `call-scribe-front`, which is README-only today.
- `espeak-ng`, `espeak`, `pico2wave`, `festival`, `sox`, `adb` and an Android emulator are all missing. ffmpeg has
  `flite`; I did not try it for Thai. **As of now I have no source of two Thai voices** (§3).
- `develyst-ai` at 790f63a, read only: no `.env`, no test runner, 10 Bruno requests. `/`, `/models` and `/tiers` need
  no key. Not started, so AC-11's baseline is not taken.

**2. AC by AC (`phone?` = what stays unproven without his phone)**

| AC | Checkable as written? | What must change | Phone? |
|---|---|---|---|
| 1 | Yes | Name the formats. "Self-made audio file" passes on a WAV and says nothing about his dialer's format (Q4) | Android's picker, his real file |
| 2 | **Check is not runnable** | "Plays the result back": no requirement gives the app playback, and a tester here has no ears. Replace with measured duration, non-silence, and the script's words appearing in the transcript | Real mic, screen off, ColorOS killing the app |
| 3 | **Cannot fail** | Any text passes; the check only records differences. Either state that it is a measurement, or the PM sets a floor. Without one, the owner may be the first to see a useless transcript | Real call audio quality |
| 4 | **Cannot fail** | Labelling every turn ผู้พูด 1 passes. Needs a floor plus a counting rule: the label is arbitrary (map by majority), and the AI's turns will not line up with the script's | Same |
| 5 | Mostly | "Names": exact word or paraphrase? Must all topics appear? Say so in the script's topic list | Same |
| 6 | Partly | "Not audio" needs a case list: renamed text as `.mp3`, 0 bytes, corrupt audio, video with sound, real audio in an unsupported format. "Keeps nothing" needs a check of storage as well as the list | Whether the picker even offers such a file |
| 7 | Partly | Which AI step? If transcription succeeds and the summary fails, ถอดเสียงไม่สำเร็จ says something false. Retry is checkable | None for the logic |
| 8 | After Q3 | "Closes the app" means a tab or an installed PWA? SPEC-101 decides, then the case can be written | Real close and kill behaviour |
| 9 | Yes, not by a tester | PM + owner. TEST lists it as out of tester scope | Phone only |
| 10 | Yes, not by a tester | Owner only. Same | Phone only |
| 11 | **Not as written** | LLM replies vary, and the gateway injects the current time into every `/chat`, so "return what they returned" can never match. Compare status, response shape and error cases. "Existing requests" should name the 10 Bruno files plus `/tiers`. "Before" can be 790f63a from a scratch copy | None |
| 12 | Weaker than the rule | Check omits `../project-docs/`, git history and the back's stored uploads. A search by extension misses renamed files. Run it after AC-10 too, since that is when a real recording first exists | None |

**3. What AC-3, 4, 5 and 7 need before I can run them**
- **Which gateway?** I have no access to the deployed one (`QA.md`), so a real run means a local copy holding provider
  keys. `SYSTEM-FACTS.md` lists "the gateway's URL and key" as the env values coming; that does not cover this.
  Please confirm the owner gives local provider keys.
- **Money.** Real AI runs cost him money, and that is on my stop list. The pack should say roughly how many runs, and
  the owner should accept it. I cannot size it until Silver names the transcription route.
- **Audio.** I need two distinct Thai voices reading a written script. Synthetic TTS is allowed, but none is here, and
  clean TTS will flatter both transcription and speaker separation compared with a real phone call. Add one line to
  Q4: one short scripted call recorded on his phone, not a real conversation. Its results get reported separately.

**4. Reading 4: run this check instead**
AC-1, 3, 4, 5, 6, 7, 8 logic, 11 and 12 can be proven locally (with §3). **AC-2 cannot, in the sense that matters**:
what decides whether in-app recording is usable is the real mic on his Oppo, including screen off and a long
recording. Browsers normally allow the mic only on HTTPS or localhost, so the phone likely needs a real HTTPS address
(`UNVERIFIED` on a phone; I saw only `secure:true` on localhost). Check: a bare recording page on an HTTPS address,
opened on his Oppo, recording a few minutes with the screen off. **This should happen before Q5's "once the tester has
passed it"**: my `TEST_PASSED` at phone width would say nothing about the phone, and the verdict will name that.

**5. Promised or implied, with no AC** (the PM decides; I test what is written)
- ปิดแอปได้ เดี๋ยวกลับมาดูผลทีหลัง promises that closing during processing is safe; AC-8 covers only a finished recording.
- Requirement 8 covers any failed step; AC-7 covers only the AI step. Upload failure on mobile data and in-app recording
  cut off (incoming call, app killed) have no case, and AC-2 assumes no active call.
- Q5 says only he may be admitted; no AC checks it. Q3 recommends a delete button; no AC if he says yes.
- Q6 asks the longest call; no AC tests a long file. Mixed Thai and English has no sample.

**6. Question for the PM (changes my test plan)**
Since AC-9 and AC-10 are not a tester's, may `TEST_PASSED` mean "every tester AC passed, with 9, 10 and the phone
surface named as NOT_TESTED"? And if AC-10 then fails, what status does REQ-101 go back to? My default: yes to the
first, and I hold the verdict wording until you answer the second.

## Decision (PM, after one round)

By the PM, 2026-11-06, `[PM-decided]`. Business intent remains the owner's.

- **Reading 1: the other reading wins on order.** Sober's reply makes my first reading risky: expect no web app to capture a LINE call (Android docs, not run on his phone). Nothing is built until the owner's capture check is back and he has answered Q1 with it in hand. Rejected: starting the upload pipeline now on the shared part. A small wait costs less than building before he says the rest is worth it.
- **Reading 2: mine holds.** Numbered speakers first (Silver). Renaming labels by hand may come later; Out of Scope now.
- **Reading 3: mine holds as the default.** Both outputs every time; goes to the owner as one line, since the evidence conflicts (Q7).
- **Reading 4: neither; the testers' third reading wins.** Logic is proven locally; the real phone gets an early owner-run check (AC-13). Tanya's gap is why: AC-10 alone could leave in-app recording never run on a phone.
- **Testers' AC findings:** accepted. REQ-101 was rewritten; floors in AC-3, 4, 5 are provisional and mine. Playback is cut; AC-2 uses measurement instead. Answer to Tefany's question is in REQ § Questions.
- **Test audio:** try synthetic text-to-speech first, tool outside product repos. If it cannot make two Thai voices, the PM asks the owner. Tefany's scripted phone call waits until the pipeline runs.
- **Tester of the gateway baseline:** whichever tester the PM names at batch claim; nobody takes it before READY_FOR_SA.
- **Corrected in `SYSTEM-FACTS.md`** (I checked: `project-docs` 13:12 line, `ATLAS.md:1039`, `develyst-ai` `src/types/index.ts:10`, `src/routes/chat.ts:25`): "web app" was Atlas's lean under an operator stamp; "`/chat` as is" for who said what does not hold.
- **Carried to the owner:** REQ § Questions, first pack now; second pack after his check returns.
- **Noted, not acted on:** Silver's report that the `llm-gateway` skill disagrees with the repo; goes to the owner for Atlas.
