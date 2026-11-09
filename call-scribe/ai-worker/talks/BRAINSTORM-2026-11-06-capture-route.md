# Brainstorm 2026-11-06 — how can LINE and Messenger calls get captured on his phone?

Started by the PM on the owner's word, via Atom, 2026-11-06 14:10: *"ไประดมสมองคุยกันกับ SA เพื่อหาทาง ดีกว่ามั้ย"*.
Divergent shape (`team-brainstorm.md`). Both SAs answer once, under their own heading, then one pointer line in
`inbox/PM.md`. You may read each other's replies here; anything addressed to the other SA goes through the PM.
Background: `talks/BRAINSTORM-2026-11-06-req-101-reading.md` § Sober, § Silver, § Decision.

## Second reading — what the owner asked for here
- **What I read it as:** the team should work out the capture route itself, and not hand him a check to run while it has options left to examine.
- **The strongest other reading:** he also means the whole pack: the team should answer more of it from its own thinking and bring him far fewer questions.
- **What would tell them apart:** nothing needs telling apart. Serve both: find the route, and reduce what reaches him.

## What is fixed
- `[operator 2026-11-06]` His Oppo Android phone alone, no computer, solo use. Never Flutter. *"ปัญหาคือ ฉันอยากอัดได้ที่มือถือไง"*.
- `[operator 2026-11-06]` Call recordings are personal data; no real recording reaches the team.
- ⚠️ Web app is NOT fixed. Native Android is open, as long as it is not Flutter (`SYSTEM-FACTS.md`, front stack line).
- A recorder on a second device needs a second device, which cuts against the 13:08 words. It stays on the list only as a last resort.

## Options so far (`[team-proposed]`, from Sober's reply; none proven)
1. The phone's own screen recorder, if it records call audio. Its file is then picked in the app; it would be a video.
2. A small native Android helper. Android documents accessibility services as able to capture during a call.
3. A second device on speakerphone.

## Asking

**@Sober, @Silver:** two or three real options, more than the above if you find them. For each:
- Does it get **both voices** on a LINE or Messenger call? Mark RAN, DOC, INFERRED or NOT VERIFIED, and cite the source.
- What does he have to do on each call, and what must he install?
- What is the real risk: Android version, ColorOS killing it, LINE or Messenger blocking it, store or sideload limits?
- What does it change for the build: front shape, and the audio the gateway must accept?
- Which one would you pick, and why? State what would change your mind.

**Sober:** the phone-side options. Can any of them be proven by the team with no Oppo, and how far? **Silver:** whether the
audio each option yields can be separated into two speakers, and any option not tied to the phone's own recording path.

**Both:** what is the smallest thing that only the owner can do, as one yes/no or one short action? If you can decide
something in the REQ's pack yourselves (`requirements/REQ-101-call-capture-transcript-summary.md` § Questions), say so.

## Replies

### Sober

**Reply. No route is proven, and the team cannot prove any of them without his phone. My pick: build no capture code yet. Try
the Oppo's own screen recorder, then a recorder app that already exists, on one LINE test call. If a mature recorder app
fails on his phone, a helper we write is unlikely to do better.** Nothing was run on Android.

Marks: **RAN** · **DOC** = read in the source, not run · **INFERRED** = my step from a source · **NOT VERIFIED**.

**1. The options** (all `[team-proposed]`)

| Option | Both voices on LINE / Messenger? | What he does | Real risk | What it changes in the build |
|---|---|---|---|---|
| **A. Oppo's own screen recorder**, "system sound and microphone" | **NOT VERIFIED; I expect one voice or none.** A shop guide and a search snippet describe those sound options; no source covers calls. Android lets system components capture more than apps, which is the only reason to hope (DOC, INFERRED for this recorder) | Installs nothing. Starts it before each call, stops it after, picks the file in our app | A screen recording of every call: large files, and the screen shows the contact. The setting may differ by ColorOS version | Front stays web. Back must take a **video** and pull out its audio. AC-6's video case gets settled |
| **B. A recorder app that already exists** (Cube ACR is the one I found) | **NOT VERIFIED.** Vendor names LINE, not Messenger, and makes no both-sides claim; only user reviews do. A competitor warns not all devices support it (search snippet) | Installs it, grants accessibility. Records automatically or by hand, then picks the file in our app | **Closed-source app holding personal recordings**, with accessibility access to his phone. Privacy policy not read. Google Play restricts this use (2022 press reports; the Google page I opened does not mention it) | Front stays web. Format unknown |
| **C. Our own native helper**, using an accessibility service | **NOT VERIFIED; I expect the same limit as B.** Android lets such a service capture *input* during a call (DOC). Hearing the other side through playback capture needs media, game or unknown usage (DOC), and I expect LINE's call audio is none of these (INFERRED). So likely his voice, plus the other side only on speakerphone | Sideloads an APK, allows restricted settings, enables accessibility. Updates by hand | Android 13+ blocks sideloaded accessibility until allowed by hand, and Android 15 may tighten it (press, not run). ColorOS killing it: NOT VERIFIED | **Largest.** A Kotlin app and a new repo, which only the owner can add, and the desk has no Android seat |
| **D. Shell-level capture via Shizuku** (ShizuCallRecorder) | **Likely no.** Its listing: focus is cellular; third-party apps *"not guaranteed"*, may work *"provided they use Android Telecom"*. One article says WhatsApp and WeChat do not work. Whether LINE uses Telecom: NOT VERIFIED | Installs two apps, with Wireless Debugging setup (from memory, NOT VERIFIED). Likely repeated after each restart (INFERRED) | Rests on hidden Android APIs (its developer's note) | Front stays web. Its separate stereo channels would make speakers easy, if it worked |
| **E. Second device on speakerphone** | **Likely yes, by physics** (INFERRED, not run), at lower quality | Needs a second device for every call | Cuts against 13:08 *"ฉันอยากอัดได้ที่มือถือไง"*; last resort only | None. The harshest audio for Silver's separation |

**Rejected, with why:** a web page's mic (my earlier reply: Android's call rule and no `getDisplayMedia`) · playback capture
inside an app, on its own (the usage rule in C) · scrcpy's `output` source, because it *"disables playback on the device"*
(DOC), so he likely would not hear the call (INFERRED) · root, because it risks his only phone (my judgement, not researched).

⚠️ **For B and C, unverified:** I recall that Thai banking apps may refuse to run while a non-store accessibility service
is on. One search found no source, so treat this as a warning only. If true, it costs him more on C than on B.

**2. My pick and order**

1. **A first:** no install, one test call.
2. **B only if A fails**, as a test on a test call, before any real call goes through it.
3. **C only if B works and he refuses a closed-source app for his recordings.** B's result then tells us what is reachable
   on his phone before we pay for a build. If B fails, I would not build C on hope.
4. **E or no LINE at all**, if A and B both fail. That is Q1's real question.

**What would change my mind:** evidence that LINE's call audio can be captured by an ordinary app; or the owner saying
he wants capture inside one app whatever it costs, which moves C up, still after B's test.

**Front shape:** under A or B the front stays a web app with a file picker, plus in-app recording for non-calls. I still hold
SPEC-101's front stack until Q1 closes. The upload-to-summary pipeline is unchanged by any option; only the formats differ.

**3. Can the team prove any of it with no Oppo? No, not the part that matters.** There is no phone or `adb` here. An
emulator is out of reach (RAN: `/dev/kvm` belongs to group `pulse-access`, and user `box` is not in it). It would not be
ColorOS either, and it would not settle a real LINE call. What we can prove is the back half, using a synthetic video or audio
file: audio extracted, transcript, summary. That is ordinary SPEC work after Q1, not a capture proof.

**4. The smallest thing only the owner can do**

> One LINE test call, about a minute, with someone who agreed. Oppo screen recorder on, set to system sound and microphone.
> Play it back. **Are both voices there? Yes or no.**

Yes → repeat once on Messenger. No → the PM asks whether he will try B; same one call, same yes or no. No file comes to us.

**5. What I can take out of the pack** (`[SA-decided]` unless marked; the PM owns the pack)

- **Q4: cut to the action in §4.** Drop "file type" and "where it landed": I would have the back detect the format by decoding
  the file, not check a list, so we need no report from him. This assumes `ffmpeg` is available where the back runs
  (INFERRED, to settle in SPEC-101). Drop the dialer check: he told us at 12:48 that normal calls are fine, and any common
  format goes through the same path. Ask his model and ColorOS version only if we reach C.
- **AC-13: I withdraw the "during a normal and a LINE call" cases** I asked for in the last round. They cannot change the
  route, given Android's call rule, and they add work for him. Screen-off recording stays, as it serves requirement 2.
  The PM decides.
- **Q5: can wait until after Q1.** Its only purpose is AC-13 and the app itself, and neither is needed for the capture answer.
- **AC-6's video case:** my proposal, a video with sound is accepted if option A wins, otherwise it is refused. For the PM.
- **AC-1's "dialer format":** becomes "any format the back can decode". Whether the gateway needs one fixed output format
  is for Silver's route; the PM carries it.

**Sources:** [Android: sharing audio input](https://developer.android.com/media/platform/sharing-audio-input) ·
[Android: playback capture](https://developer.android.com/media/platform/av-capture) ·
[Oppo Store: screen recording](https://oppostore.co.uk/blog/how-to-enable-screen-recording-on-OPPO-mobile-phone) (search
snippet only; another guide I tried returned 403) · [Cube ACR](https://cubeacr.app/) ·
[Engadget: Play policy](https://www.engadget.com/google-is-banning-third-party-call-recording-apps-from-the-play-store-093201443.html) ·
[Google: AccessibilityService on Play](https://support.google.com/googleplay/android-developer/answer/10964491) ·
[Esper: restricted settings](https://esper.io/blog/android-13-sideloading-restriction-harder-malware-abuse-accessibility-apis) ·
[Android Authority: Android 15](https://androidauthority.com/android-15-enhanced-confirmation-mode-3436697) ·
[ShizuCallRecorder](https://f-droid.org/ko/packages/com.kitsumed.shizucallrecorder) ·
[Zhihu on ShizuCallRecorder](https://www.zhihu.com/tardis/jm/art/2040712162109306619) ·
[scrcpy audio](https://raw.githubusercontent.com/Genymobile/scrcpy/master/doc/audio.md).

### Silver

**Pick: the ColorOS screen recorder first, an existing recorder app second, and do not build our own helper unless the
second works.** No option is proven for both voices. Nothing ran on Android or on a real call; there is no phone here.
All of it is `[team-proposed]`. Marks are the PM's: RAN, DOC, INFERRED, NOT VERIFIED. "Secondary" means a search result,
not the vendor's own page. `cubeacr.app` and `nllapps.com` could not be fetched, so what they say is secondary.

**The finding that reorders the list: a helper app probably cannot hear the other party.**
- Apps can capture another app's playback only for `USAGE_MEDIA`, `USAGE_GAME` or `USAGE_UNKNOWN`, so not voice-call audio.
  DOC, Android playback capture. That LINE and Messenger play calls as voice-call audio is INFERRED.
- Capturing the call's downlink needs a pre-installed app with `CAPTURE_AUDIO_OUTPUT`. DOC, sharing audio input.
- An accessibility service may capture **input**, meaning the mic. DOC. And *"The preprocessing associated with the
  highest-priority active app is enabled"*, DOC, so a helper would likely get the call's own echo cancellation, which
  removes the other party from the mic. INFERRED. A call-recorder developer warns that recording may be one-sided on some
  chips, which fits. Secondary.
- System components are different: *"Android system components can capture playback by default"*, DOC. That is why the
  phone's own recorder is the better first try, though an app can still opt out with `ALLOW_CAPTURE_BY_NONE`.

**Options**

| | 1. ColorOS screen recorder | 2. Existing recorder app (Cube ACR, Talker ACR) | 3. Our own native helper | 4. Device on the phone (Plaud Note, vibration sensor) |
|---|---|---|---|---|
| Both voices on LINE / Messenger | NOT VERIFIED. Offers system sound + mic at once (ColorOS listings, secondary); no source covers a call | NOT VERIFIED. Listing names LINE and says not all devices support VoIP (secondary) | Probably not (above). INFERRED | Vendor claims yes; one review says WhatsApp and Wi-Fi calls worked (secondary). Android NOT VERIFIED |
| Each call | Start the recorder, stop it, pick the file | Automatic if it works, then pick the file | Same as 2 | Clip on, switch to call mode, move the file over |
| Install | Nothing | One app, accessibility permission | Our APK, plus "allow restricted settings" on Android 13+ (secondary) | Buy a device |
| Real risk | LINE or the mic may be muted during a call; **the file holds images of his screen** | A third party's app can read his screen and hears his calls; vendor cloud and price not checked; Play policy limits this use (secondary) | Same limits as 2 with our own upkeep; ColorOS may kill it | Against *"อัดได้ที่มือถือ"*; file transfer and vendor cloud not checked |
| Build impact | App accepts MP4, strips the audio | File pick only; format unknown | Front stops being only a web app | File pick only |

Rejected: a Bluetooth call recorder (one listing moves files by USB to a computer, against 13:11; buyer reviews poor,
secondary) · LINE on a PC (13:11) · a second phone on speakerphone, kept only as the last resort you already named.
A server joining the call: I found no route, but did not search it fully. NOT VERIFIED.

**Can each option's audio be separated into two speakers?** Synthetic English voices at known turns, measured with
`ffmpeg` here. RAN for the shapes only. **No diarization ran, since there are no provider keys, so this shows what each
shape gives a provider, not how well it does.**

| Shape | Comes from | Measured | Separation |
|---|---|---|---|
| Two tracks | **No option above reaches this** | Each channel's turns found from level alone, no AI | Certain, and it would even know which voice is his. Do not design for it |
| Clean mix, both voices direct | Option 1 at best | Owner turn -21.9 dB, other party -14.1 dB; turns visible, identities not | Diarization on a fair input. Best realistic case |
| Other party only leaks through the speaker | Options 2 and 3 on speakerphone, or a second device | At -25 dB and phone band: owner -21.9, other party -46.8 dB. The -25 is **my assumption**, not a phone measurement | Weak. Likely losing the words, not just the labels (INFERRED) |
| One voice | Option 3 as expected, or option 1 with system sound blocked | Other party's turn -91 dB (silence) | Nothing to separate. Half a conversation |

So separation depends on capture: **if the other party is faint, no provider can fix it.** Mixed overlap and level also
hurt mono diarization, and channel-separated audio avoids that class of error (vendor docs, secondary). Thai with
speakers remains unproven, as in my last reply. To avoid testing only clean audio, my 2-minute check gains one more
variant per provider, the leak shape above, about 2 extra runs.

**Build.** The gateway work is the same whichever route wins: it takes audio files, not video `[SA-decided]`. Formats:
AAC/M4A and webm/opus are in the Gemini and xAI lists (DOC); AMR is in neither. MP4 is accepted by Gemini and xAI directly
(DOC), but I would not send it: the images are personal data no AI needs. Stripping audio from MP4 without re-encoding
works: exit 0, AAC kept, 10 s test file 10,256,292 → 78,876 bytes. RAN; the video bitrate is my setting, so read the ratio
only as "much smaller". Stripping belongs in `call-scribe-back` or on the phone, Team A's seam, for the PM to carry.
**So AC-6's video case should become "accepted, audio kept, picture dropped" if option 1 wins.**

**Which I pick, and what would change my mind.** Run 1. If both voices are clear, stop: nothing native, one file route. If
not, try 2 on one test call. It uses the same mechanism as our helper, so **it tells us whether 3 could work without
building 3** (INFERRED). If 2 also fails, 3 is very unlikely to do better, and Q1 is asked with "LINE is not capturable on the
phone alone, except with a clip-on device". I would build 3 only if 2 works and he rejects a third party holding his calls.
I would drop this order if his check shows ColorOS blocks 1 and Play will not install 2 on his phone.

**The smallest thing only he can do: one test call on LINE, with someone who agreed.** Recorder set to system sound and
microphone. He plays it back and answers one line: **"both as clear as each other / the other person faint / one voice /
silent".** Then the same on Messenger if LINE passes. "Faint" needs its own answer, since "both heard" in AC-9 would pass
audio that no provider can use. I suggest that change to AC-9 and Q4. No file comes to the team.

**What the pack can lose, for the PM to decide:**
- **Q2, Q7:** defaults hold and neither changes the build now, so a one-line FYI rather than a question.
- **Q6:** I can design for 60 minutes without his number: xAI takes 500 MB, Gemini has its Files API (DOC). He corrects it
  if he sees it is wrong; AC-19 uses 60.
- **Q9, Q10:** only after Q1 says build. Which provider sits in my check's result, so he sees a one-line choice, not a survey.
- **Q4:** the dialer's format and his model wait until Q1 says build, or the check fails. He told us at 12:48 normal calls are fine.
- **Q1's native question:** do not ask until option 2 has a result.

**Sources:** [Android: playback capture](https://developer.android.com/media/platform/av-capture) ·
[Android: sharing audio input](https://developer.android.com/media/platform/sharing-audio-input) ·
[Gemini audio](https://aistudio.google.com/docs/audio) · [Gemini video](https://aistudio.google.com/docs/video-understanding) ·
[xAI voice API](https://docs.x.ai/developers/rest-api-reference/inference/voice) ·
[ColorOS recorder listing](https://www.apkmirror.com/apk/coloros/screen-recording-5) ·
[Cube ACR listing](https://apps.appfollow.io/android/call-recorder-cube-acr/com.catalinagroup.callrecorder?country=us) ·
[ACR Phone on VoIP](https://www.nllapps.com/apps/cb/voip-call-recording.htm) ·
[Android 13 sideload limit](https://9to5google.com/2022/05/06/android-13-sideloaded-accessibility/) ·
[Neowin on the Play policy](https://www.neowin.net/news/android-13-will-introduce-new-restrictions-on-sideloaded-apps/) ·
[Bluetooth recorder listing](https://itemscatalogue.redcross.int/support--4/radio-and-telecommunication--19/telephone--109/voice-recording-device-bluetooth--CTELCELLRECBT.aspx) ·
[Plaud on calls](https://www.plaud.ai/blogs/articles/ai-phone-call-recorder-record-transcribe-calls) ·
[Plaud Note review](https://uat4.www.digitaltrends.com/mobile/plaud-note-review) ·
[Channel-separated audio](https://docs.medallia.com/voci/audio-capture/audio-data-and-accuracy/single-channel-mono-and-channel-separated-audio)

## Decision (PM, after one round)

By the PM, 2026-11-06, `[PM-decided]`. Both SAs reached the same order separately. No option is proven; nothing ran on Android.

1. **Build no capture code yet.** Order of trial: the phone's own screen recorder → an existing recorder app, on a test call only → our own helper only if the app works and he refuses a third party holding his calls → a device or no LINE at all, which is what Q1 then asks.
2. **Why this order:** a system component may capture what an app cannot (Android docs), it needs no install, and a helper probably cannot hear the other party. The existing app tests the same mechanism as a helper, without our building one (Silver, inferred).
3. **Rejected:** building a helper first · web page microphone · root · Shizuku as a first try · LINE on a PC (13:11) · a second phone, last resort only.
4. **The owner's one action:** one LINE test call, answered as one of four: both clear · other person faint · one voice · silent. I took Silver's four over Sober's yes/no: "faint" would pass "both heard" and yet fail transcription.
5. **Sober's and Silver's pack cuts, all accepted:** Q2, Q3, Q6, Q7, Q8 become recorded defaults, shown when Q1 is asked. Dialer format and phone model wait. Q5, Q9, Q10 wait for Q1. The native question waits for the app's result. Design for 60 minutes. Format is detected by decoding. AC-13 drops its call cases.
6. **Video:** if the screen recorder wins, accepted with audio kept and picture dropped. Silver's gateway takes audio only; stripping sits on Team A's side, for the SPEC.
7. **Noted for later:** Sober's unverified warning that Thai banking apps may refuse a non-store accessibility service. Raise it before any helper test; Silver's two extra check runs go with Q9.
