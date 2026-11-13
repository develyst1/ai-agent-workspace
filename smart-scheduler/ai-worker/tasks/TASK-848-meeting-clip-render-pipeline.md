# TASK-848 — the meeting-clip RENDER PIPELINE (REQ-5001) — @Jason (≈ 1.0 d)
**From @Sober, 2026-11-03. GO now.** SPEC: `specs/SPEC-096-meeting-clip-presenter-video.md` (read it whole; §1–§3 are your build). REQ: `requirements/REQ-5001-meeting-clip-presenter-video-for-11-07.md`.
**Target:** the first full MP4 in my hands **Wed 11-04 EOD**; final after the PM's answers **Thu 11-05**. Tanya then has Fri, and the owner's deadline is Fri 11-06 18:00.
**Folder:** `som-balance-backoffice-spec/meeting-clip/` (path in `machine.local.md`). Not git; no smart-scheduler repo touched. **You may only READ** `pricing-deck/dist/` and `final-ui/dist/`.
**Rule 2 (workspace CLAUDE.md, re-read it):** you never ask the owner anything. A question goes in `## Questions` below, to me.

## Closed file list (all new, all under `meeting-clip/`)
`package.json` · `package-lock.json` · `vite.config.ts` · `tsconfig.json` · `index.html` · `config.json` · `pronounce.json` (starts as `{}`) · `README.md` · `src/script.ts` · `src/stage/**` (the overlay page) · `scripts/render.mjs` · `scripts/chunk.mjs` · `scripts/tts.ps1` · `scripts/timeline.mjs` · `scripts/capture-deck.mjs` · `scripts/capture-overlays.mjs` · `scripts/compose.mjs` · `out/**` (generated; the README says it's disposable). `samples/` already exists: don't touch it.
**Not yours:** `scripts/capture-ui.mjs` is Fern's (TASK-849). You call `recordWalkthrough(...)` exactly as SPEC §2 says.
- Until hers lands, `render.mjs --no-ui` holds deck slide 2 for all of scene 2, so you can render end to end on Wed.

## Build: SPEC §1 steps 1–5, plus
- **`src/script.ts`:** the 7 scene strings, copied from REQ §4 **character for character**. Copy them with a script that reads the REQ file; never retype Thai.
  - The chunk assertion (SPEC §1.1) must pass. **Change no word.**
  - A line that won't fit its timing is a question to me, never an edit.
- **Voice:** PowerShell 5.1 + WinRT, Microsoft Pattara (th-TH, Male), as in SPEC §0.
  - My working spike is in my scratchpad, so you can't read it. The SPEC says enough. The trick is `[Windows.Media.SpeechSynthesis.SpeechSynthesizer, …, ContentType=WindowsRuntime]` + `AsTask` on `IAsyncOperation`.
  - **Text reaches PowerShell only through a UTF-8 file**, never an argument.
- **`config.json`** holds `voice.rate`, the gaps (SPEC §1.3), `crossfadeSec` 0.4, `crf` 20, the subtitle style (font size, bottom margin, max 2 lines, a dark translucent band behind the text so it reads on any slide).
- **Subtitles look like the deck:** Noto Sans Thai (`@fontsource/noto-sans-thai`, the same version as `pricing-deck/package.json`), white on a ≈ 70 % black band, bottom-centre, never more than 2 lines, never off-screen at 1920 wide.
- **`render.mjs` prints, at its end:** the per-scene durations, the total, the ffprobe summary (codec, size, fps, duration, audio), and the MP4's md5. It also checks the two REQ-133 dist md5s at its start and end (SPEC §3).
- **README:**
  - first run: `npm ci`, plus the Playwright browser line if needed;
  - one command: `npm run render`;
  - how to change a line, the rate or the gaps;
  - where the MP4 lands;
  - `FFMPEG_PATH` as a fallback.

## Done = (evidence in `## Implementation Notes`: each command + its real output)
1. `npm run render` from a clean `out/` → exit 0. Paste the full end-of-run summary.
2. **The chunk assertion is shown passing,** and shown FAILING once: change one character in a copy of a scene string, run `node scripts/chunk.mjs`, paste the error, revert.
3. `ffprobe` of `out/meeting-clip.mp4`: h264 · yuv420p · 1920×1080 · 30 fps · aac 48000 Hz stereo · the duration.
4. **The MP4 opened in Chrome AND in Windows' default player,** start to end. Say which player and version.
5. Screenshots: one frame per scene (`ffmpeg -ss <t> -frames:v 1`), checked by you, in `out/frames/`. Subtitles have no clipped Thai marks; scene 5's highlight sits on "ราคานี้รวม".
6. AC-6: `grep` of `src/script.ts` for `ไม่มีส่วนลด|25,700|25700|1,300|ระวัง` = 0.
7. The two REQ-133 dist md5s, before and after: unchanged (`render.mjs` prints them).
8. A second `npm run render` → the same per-scene durations ± 0.1 s (AC-7).

## Questions
**To @Sober (Jason, 2026-11-03).** Three, each with the default I built on:
1. **`pronounce.json` starts `{}` as the TASK says, but the PM's A3 in REQ-5001 already approved four spoken forms:** CEO → "ซีอีโอ", Excel → "เอ็กเซล", PDF → "พีดีเอฟ", Park Rent → "พาร์ค เร้นท์" (SOM BALANCE: still asked, so left alone). *Default:* left empty, pipeline supports it (`pronounce.json`, SSML `<sub alias>`). *If you say go:* I add the 4 entries, one re-render (2 min). Tanya then judges by ear.
2. **Subtitles on top for scenes 5 and 6 (a deviation from "bottom-centre").** At the bottom the band sits exactly over the slide-10 "ราคานี้รวม" line (scene 5, where the highlight must be visible) and over slide 11's "นับจากวันที่ได้ข้อมูลครบ…" footer (scene 6). *Default:* `config.json` → `subtitle.topScenes: [5, 6]` (top of the frame, 14 px margin; covers only the kicker/title area). *Say "bottom" and I set `[]`;* the highlight then sits under the subtitle in scene 5.
3. **Output folder.** `render.mjs` empties `out/` first (README says it's disposable). Fern's `capture-ui.mjs` / her test already write `out/ui-test.webm` and `out/ui-frames/` there, so a render started while she is testing would delete her test output. *Default:* unchanged. Tell me if you want her files kept (e.g. I only clear my own subfolders).

## Implementation Notes
_(Jason, 2026-11-03.) Folder `som-balance-backoffice-spec/meeting-clip/` (not git). All files are in the closed list; extra only: `src/stage/data.generated.json` (inside `src/stage/**`, written by `capture-overlays.mjs`), `config.json` keys, and `ffprobe-static` in `package.json` (ffmpeg-static ships no ffprobe)._

**What I built:** `npm run render` → `scripts/render.mjs`: (1) `chunk.mjs`, (2) `tts.ps1` (Pattara through WinRT, text only via UTF-8 files), (3) `timeline.mjs` → `out/timeline.json` in the SPEC §2 shape, (4) `capture-deck.mjs` + `capture-overlays.mjs` (Vite page, Noto Sans Thai 5.2.5), (5) `compose.mjs` (ffmpeg-static; per-scene video, `xfade` 0.4 s, voice mixed sample-exactly in JS). Versions pinned with no `^`: playwright **1.64.1** (its `browsers.json` names chromium **1248**, the one installed; no browser download needed), vite 7.1.9, ffmpeg-static 5.3.0, ffprobe-static 3.1.0. `npx tsc --noEmit` = 0.
`src/script.ts` was **generated by reading REQ §4** (`node scripts/chunk.mjs --regen <REQ>`), never typed. Chunking: ≤ 60 chars, splits on spaces only, forced starts at the 13 cue phrases, and "SOM BALANCE" / "Park Rent" never split. Within a stretch it picks the fewest, most even chunks and prefers to end one after "ครับ".

**Done list**
1. **`npm run render` from a clean `out/` → exit 0** (`npm run render -- --no-ui --frames`; **`--no-ui` because Fern's `capture-ui.mjs` landed at 19:56, after this run**. The plain `npm run render` stops with a message saying so if it is absent). End of run:
```
[1/5] 7 scenes, 68 chunks; assertion passed (and equal to the REQ)
[2/5] voice: Microsoft Pattara (th-TH, Male) rate 1
[3/5] 267.6 s, walkthrough from 33.5 s for 88.1 s, 14 cues
[4/5] 7 slides, 68 subtitles (max 1 lines), highlight found
=== SUMMARY ===
scene durations (s): 1=28.73  2=92.82  3=49.23  4=29.79  5=21.70  6=24.76  7=20.55
total narration timeline: 267.59 s
mp4: out\meeting-clip.mp4  video h264 High yuv420p 1920x1080 30/1  audio aac 48000 Hz 2 ch (stereo)  duration 267.60 s  size 9924458 B
mp4 md5: 4092e0cf788f0bd5d24f65f07ca65497
dist md5 (end): pricing-deck/dist/index.html 604bde02235715366734c053509b311f (unchanged) · final-ui/dist/index.html 1d0ce1f63ae826984172ade3d724f41a (unchanged)
render time: 150 s
```
   **Length 4 min 27 s** (A1's ≈ 4–5 min). Scene 2 holds slide 2 for all 92.8 s in this build (no walkthrough yet).
2. **Chunk assertion, passing and failing once** (the failing run uses a COPY of `script.ts` with one character changed, ก่อนอื่น → ก่อนอื้น; the original was never touched):
```
$ node scripts/chunk.mjs --source <REQ-5001>
chunk assertion PASSED: 7 scenes, 68 chunks, longest 60 chars, and every scene equals the REQ word for word      (exit 0)
$ node scripts/chunk.mjs --script <copy with 1 char changed> --source <REQ-5001>
script differs from the REQ, scene 1: first difference at character 79
  REQ    : … กันครับ ก่อนอื่นขอเล่าว่าตอนน…
  script : … กันครับ ก่อนอื้นขอเล่าว่าตอนน…                                                                       (exit 1)
```
   ⚠️ **Honest limit:** the chunk↔script check inside `chunk.mjs` proves the *chunker* drops or adds nothing; it cannot notice that someone edited `script.ts`. What catches an edited word is `--source <REQ>` (also read from `REQ_5001`, and `render` then checks it too). A render **without** `REQ_5001` does not compare with the REQ. I ran all renders with it set, and the README says so.
3. **ffprobe:** video `h264 High yuv420p 1920x1080 avg_frame_rate=30/1` · audio `aac 48000 Hz 2 ch stereo` · duration 267.600 s · 9,924,458 B · `mov,mp4`.
4. **Playback:** (a) **Chrome 152** (the Claude app's Chromium, UA `Chrome/152.0.7977.167`): a `<video>` on `http://localhost` loaded it (1920×1080, 267.6 s), played at 16× muted from start to `ended` in 17 s, `error = null`. (b) **Windows' media stack:** the shell reads it (Length 00:04:27, 1920×1080, 30 fps, MP4 Video), and `Windows.Media.Playback.MediaPlayer` (Media Foundation, the engine of Films & TV) opened and played it 0 → 267.60 s at 8×, no error. (c) ⚠️ **I did NOT open the default player app itself:** the `.mp4` default here is **Windows Media Player 12.0.19041.6093**; its COM engine does not start without a window (stuck "Transitioning" 60 s, a tooling limit, not a file error) and I did not pop a window on the owner's screen. **Tanya should double-click it once in WMP.** I cannot hear it: the audio is checked by ear by Tanya (AC-2), not by me.
5. **Frames** `out/frames/scene-1…7.png`, each looked at by me: subtitles are one line each (the page throws if one wraps to 3+ lines or leaves the screen), Thai above/below marks not clipped (Noto Sans Thai, Chrome shaping), **scene 5: the amber frame sits on the "ราคานี้รวม: …" line and is not covered** (subtitle on top, see Question 2).
6. **AC-6:** `grep -cE 'ไม่มีส่วนลด|25,700|25700|1,300|ระวัง' src/script.ts` = **0**.
7. **REQ-133 dist md5s** printed at the start and the end of every render, unchanged: pricing-deck `604bde02235715366734c053509b311f`, final-ui `1d0ce1f63ae826984172ade3d724f41a`. `render.mjs` stops if either differs.
8. **Second `npm run render` (same state):** per-scene durations identical to the 0.01 s (`1=28.73 2=92.82 3=49.23 4=29.79 5=21.70 6=24.76 7=20.55`), and in fact the MP4 md5 was identical too (`4092e0cf…`; the voice is offline, so the audio repeats).

**What is NOT done:** the final-UI walkthrough in scene 2 (Fern's TASK-849; `recordWalkthrough` is called exactly as SPEC §2: `{ cues, durationSec, outFile }`, `out/timeline.json` is written before it). **Not yet tried with her file:** a full `npm run render` without `--no-ui`. Pronunciations are not applied (Question 1). I have not heard the audio.

## Review
**Sober, 2026-11-03: the first MP4 is ACCEPTED as a milestone (not DONE yet). Answers to your 3 questions, plus 1 hardening.**
- **I checked:**
  - your summary + Done list 1–8 against the files;
  - frames `scene-3.png` and `scene-5.png` opened full size: Thai marks intact; the scene-5 amber frame is on "ราคานี้รวม" and uncovered; subtitles in the deck font;
  - 4 min 27 s fits A1;
  - the identical md5 on the 2nd render is a nice bonus.
  - Your honest notes on WMP and on the REQ comparison are exactly right.
- **Q1:** answered by my "## Update" below. Add the **5** entries (SOM BALANCE included; the owner answered).
- **Q2: accepted.** Subtitles on top for scenes 5 and 6 (`topScenes: [5, 6]`). The highlight must stay visible. Note the deviation in the README.
- **Q3: `render.mjs` clears only what it generates** (an explicit list: `tts/`, `slides/`, `overlays/`, `frames/`, `timeline.json`, the walkthrough WebM, the MP4). It never deletes the whole `out/`. Fern's `out/ui-test.webm` and `out/ui-frames/` stay hers.
- **Hardening (your own ⚠️):** the word-for-word check must **fail closed** without the REQ path, too.
  - `--regen` also writes `script.approved.sha256` (the hash of the REQ §4 text it copied).
  - Every render checks `src/script.ts` against that hash, and against the REQ as well when `REQ_5001` is set. A mismatch ⇒ stop.
  - So an edited `script.ts` can never render silently, even from the owner's plain `npm run render`.
- **Before DONE:**
  - the full render WITH Fern's walkthrough, after her rework passes my check. Keep `--no-ui` until then;
  - the pronunciations applied, plus one frame showing an English word still in the subtitle;
  - the hash check shown failing once on an edited copy.
  - Then the final MP4 path + md5.

## Update — Sober, 2026-11-03 (the PM's answers, REQ-5001 `### Answers`)
- **Length:** AC-1 now reads *"about 4–5 minutes, the script at a natural pace; no slowed speech, no padding silence"*. Keep `voice.rate` 1.0 and the SPEC gaps. Don't stretch anything.
- **Voice:** Pattara is **final** (owner: *"เสียงใช้ได้"*).
- **`pronounce.json` = exactly these 5** (what is SAID; the subtitles keep the written English). Approved: the first by the owner, the rest by the PM:
  ```json
  { "SOM BALANCE": "ส้มบาลานซ์", "CEO": "ซีอีโอ", "Excel": "เอ็กเซล", "PDF": "พีดีเอฟ", "Park Rent": "พาร์ค เร้นท์" }
  ```
  - Done adds: the burned-in subtitles still show "SOM BALANCE" / "CEO" / "Excel" / "PDF" / "Park Rent". Show one frame of a subtitle that contains one of them.
- **Scene 2's walkthrough:** Fern's recorder is in REWORK (timing races). Keep `--no-ui` working until I pass it.


## Jason (BE) 2026-11-03 — TASK-848 update applied: the 5 spoken forms are in — GREEN, still `--no-ui`
- `pronounce.json` = **exactly your 5** (SOM BALANCE → ส้มบาลานซ์, CEO → ซีอีโอ, Excel → เอ็กเซล, PDF → พีดีเอฟ, Park Rent → พาร์ค เร้นท์). This also settles my Question 1. `voice.rate` stays 1.0, gaps unchanged, nothing stretched.
- **Proof it only changes what is SAID:** `out/tts/*.ssml` now holds 8 `<sub alias=…>` (CEO ×2, Excel ×3, PDF, Park Rent, SOM BALANCE). The subtitles still show the written English: frame `out/frames/subtitle-Excel-PDF.png` (at 53.2 s) reads "และส่งออกเป็น Excel หรือ PDF ได้ครับ", and the slide-1 kicker "SOM BALANCE" is the deck's own.
- **Render exit 0, `--no-ui`.** The voice is now a little longer: scenes 1=29.57 2=101.87 3=49.23 4=29.79 5=21.69 6=24.77 7=22.02, **total 278.97 s = 4 min 39 s** (inside "about 4–5 min"). mp4 10,155,825 B, md5 `58ddce61cccc1668cececfa4234b88c8`, same ffprobe shape. dist md5s unchanged. Chunk assertion passed and equal to the REQ.
- Still true: I can't hear it, so Tanya judges the spoken forms by ear. Questions 2 (subtitles on top in scenes 5 and 6) and 3 (render empties `out/`, Fern's test files) are still open on my defaults. Scene 2's walkthrough waits for your word that Fern's recorder passed; `--no-ui` keeps working.
Ball: Sober.


## Jason (BE) 2026-11-03 — TASK-848 review items done: hash fails closed, `out/` is scoped — GREEN, still `--no-ui`
- **Hash (fail closed).** `node scripts/chunk.mjs --regen <REQ>` now also writes `script.approved.sha256` (sha256 of the §4 text it copied; `70d03d5d1920…`). `chunk.mjs` and **every render** compare `src/script.ts` with it, and also with the REQ when `REQ_5001`/`--source` is given. **Shown failing, no REQ path anywhere:**
  - hash file absent → `script.approved.sha256 is missing: run … --regen …` (exit 1);
  - a COPY with one character changed (ก่อนอื่น → ก่อนอื้น) → `the script is NOT the approved text (sha256 d545c10ff602… vs approved 70d03d5d1920…)` (exit 1);
  - **plain `npm run render -- --no-ui` on an edited `src/script.ts`** → the same error at `render.mjs` step 0, exit 1. I then restored the file; md5 identical to before.
  - The real script passes with no REQ path. My first try deleted the last MP4 before the check ran, so I moved the check **before** any clearing: a refused script no longer costs the last good MP4.
- **Q3 as you ruled:** `render.mjs` clears only `tts/ slides/ overlays/ frames/ scenes/ stage/ timeline.json voice.wav walkthrough.webm meeting-clip.mp4`. Verified after a render: Fern's `out/ui-test*.webm` and `out/ui-frames*` are still there. **Q2 noted in the README** (top subtitles in scenes 5 and 6, and why).
- **Q1 / the 5 pronunciations** were already in (previous entry). **Render exit 0, `--no-ui`:** 4 min 39 s, 10,155,825 B, md5 `58ddce61cccc1668cececfa4234b88c8` (the same as before the hardening: nothing changed in the output); frames `subtitle-Excel-PDF.png` and `scene-1…7.png` re-made; dist md5s unchanged.
- **Still before DONE:** the full render with Fern's walkthrough after you pass her rework (I'll run it on your word; `capture-ui.mjs` is hers and I don't touch it).
Ball: Sober.


## Jason (BE) 2026-11-03 — TASK-848 FINAL: full render WITH Fern's walkthrough — GREEN, ready for your DONE check
**Final MP4: `som-balance-backoffice-spec/meeting-clip/out/meeting-clip.mp4` · 4 min 39 s (278.97 s) · 10,943,676 B · md5 `1996f7a72083b14d674581b6fe8faf12`.**
- **Plain `npm run render` (no `--no-ui`, no REQ path, so the fail-closed hash did the guarding), exit 0, twice.** End of run: `scene durations (s): 1=29.57 2=101.87 3=49.23 4=29.79 5=21.69 6=24.77 7=22.02` · `total narration timeline: 278.94 s` · `walkthrough from 34.3 s for 97.1 s, 14 cues` · `mp4: h264 High yuv420p 1920x1080 30/1, aac 48000 Hz 2 ch (stereo), duration 278.97 s` · `dist md5 (end): … 604bde02… (unchanged) · 1d0ce1f6… (unchanged)` · render 262 s.
- **Second render: the same per-scene durations to the 0.01 s.** The MP4 md5 now differs between the two runs (the live UI recording is not bit-identical, as SPEC §3 allows), so the md5 above is the second one, the file on disk.
- **Pronunciations applied; English still shown:** `out/frames/subtitle-SOM-BALANCE.png` (6.6 s: "SOM BALANCE กันครับ") and `subtitle-Excel-PDF.png` (53.2 s: "และส่งออกเป็น Excel หรือ PDF ได้ครับ").
- **Scene 2 walkthrough looked at, 12 frames on one contact sheet cut from THIS final MP4 (`out/frames/walkthrough-contact-sheet.png`):** Monthly Payment on "ส่วนแรกคือเงินเดือน", Payment Detail on "โค้ชเปิดดูสลิป", Revenue Summary, STOCK OUT, Branch for booking, Payment Method, Park Rent, then Employee **with no salary column for Admin** on "แอดมินไม่เห็น…", the coach's own Payment Detail on "โค้ชทุกคนมีล็อกอิน…", Home as CEO on "และทุกอย่างเชื่อมกับระบบเดิม". Dark mode, invented names only (Pete / Ton / Ploy / May / Nam / Beam / น้อง…). The recorder's cursor ring is visible.
- **Playback of THIS file:** Chrome 152 loaded it (1920×1080, 278.97 s) and played it start to `ended` at 16×, no error. Windows' Media Foundation player: opened 278.97 s, played 0 → 278.97 s at 8×, no error. Same limit as before: **I did not open Windows Media Player 12 itself** (the default `.mp4` app; no headless way); Tanya double-clicks it once. I can't hear it either: Tanya, by ear.
- Frames `out/frames/scene-1…7.png` re-made from this render. Scoped cleanup held (Fern's `out/ui-*` files still there). AC-6 grep of `src/script.ts` = 0 (unchanged).
**Things to know:** a render takes about 4½ min now (the walkthrough is recorded live). The walkthrough covers 97.1 s of the 101.9 s of scene 2; slide 2 shows only for the first sentence.
Ball: Sober.

**Sober, 2026-11-03 (final review): DONE.**
- **I checked:**
  - md5 `1996f7a72083b14d674581b6fe8faf12` = the report;
  - ffprobe: h264 High yuv420p 1920×1080 30/1 + aac LC 48000 Hz 2 ch, 278.967 s;
  - REQ-133 dist md5s `604bde02…` / `1d0ce1f6…` unchanged.
- **Sync (AC-4),** from `out/timeline.json`: all 14 scene-2 cues fire on the chunk that names their page (Monthly Payment ← "ส่วนแรกคือเงินเดือน" … CEO / Home ← "และทุกอย่างเชื่อมกับระบบเดิม").
- **Frames** pulled by me from the MP4 and looked at, one after each key cue: slide 2 · Monthly Payment · Payment Detail ("…Excel หรือ PDF") · Revenue Summary · STOCK OUT · Branch for booking · To Confirm Camp ("Park Rent…") · Employee as CEO · **Employee as Admin at 122.2 s (no Base salary column, no Revenue menu; subtitle "แอดมินไม่เห็นยอดเงินเดือน")** · Coach on own Payment Detail · Home · slide 9.
  - All dark, invented names only, subtitles intact.
- **Fail-closed script hash:** `chunk.mjs:134–139` (seen).
- **Left for Tanya (by design):**
  - the ear: words in order, the numbers, the 5 spoken forms;
  - one double-click in Windows Media Player 12 itself.

## Fix round 2 — Sober, 2026-11-03 (TEST-131 PASSED; the PM wants Tanya's 🟡 overlaps gone). **Reopened: one visual change**
- **The problem:** a subtitle sits on slide text in 3 places:
  - scene 2: slide 2's bottom cards;
  - scene 4: slide 10's "ราคานี้รวม" lines;
  - scene 6: the top subtitle on "6 · ลำดับการส่งมอบ".
- **Don't patch slide by slide.** Give every frame its own **subtitle band**, so a subtitle never lies on content, on any slide or UI screen:
  - **Layout:** the visual (slide PNG, or the walkthrough WebM) is scaled **uniformly** to fit 1920 × **920**, centred horizontally, top-aligned (no stretching; ≈ 1636 × 920). The bottom **160 px** is the subtitle band.
  - **Fill:** around the visual, the slide's own background colour (sample a corner pixel of each slide PNG). For the dark walkthrough, the UI's dark body colour. The frame then reads as one piece.
  - **Subtitle:** centred **inside the band** (same font, size and band style as now). Drop `topScenes`; every scene uses the band.
  - **The scene-5 highlight** is scaled with its slide: use the same transform on `highlight.json`'s box.
- **Nothing else changes:** the script, audio, chunk timings, cues and lengths are identical. The per-scene durations must equal the last render's to 0.01 s (`1=29.57 2=101.87 3=49.23 4=29.79 5=21.69 6=24.77 7=22.02`).
- **Done =**
  - `npm run render` exit 0 (WITH the walkthrough);
  - the summary with the same durations;
  - the dist md5s unchanged;
  - **frames you looked at:** scene 2 slide 2, scene 2 one UI page, scene 4, scene 5 (highlight still on "ราคานี้รวม"), scene 6. In each, no subtitle pixel on slide or UI content;
  - the new MP4 md5 in `inbox/SA.md`. Then freeze.


## Jason (BE) 2026-11-03 — TASK-848 Fix round 2 DONE: dedicated subtitle band — GREEN, frozen again
**New MP4: `meeting-clip/out/meeting-clip.mp4` · 10,031,994 B · md5 `21b916245e6be558be5295601f1b286b`** (the previous one, `1996f7a7…`, is replaced).
- **What changed (only the picture):** the slide or the UI recording is scaled uniformly to **1636 × 920** (`config.json` → `layout.visualHeight: 920`), centred (x = 142) and top-aligned. The bottom **160 px** is the subtitle band: subtitle centred in it (same font, size, ≈ 70 % black band; `bottomMarginPx` 28). The fill around the visual is its **own corner pixel**: top-left of each slide PNG, bottom-right of the first frame of the walkthrough (the UI's dark body). The scene-5 highlight box is scaled with the same transform (`x' = 142 + x·0.852`, `y' = y·0.852`). `topScenes` / `topMarginPx` are gone from the config; the README says what the layout is. Script, audio, chunk timings and cues untouched.
- **Plain `npm run render` (with the walkthrough, no REQ path) exit 0.** Summary: `scene durations (s): 1=29.57 2=101.87 3=49.23 4=29.79 5=21.69 6=24.77 7=22.02` (**identical to the last render**) · `total 278.94 s` · `mp4: h264 High yuv420p 1920x1080 30/1, aac 48000 Hz 2 ch stereo, 278.97 s` · `dist md5 (end): 604bde02… (unchanged) · 1d0ce1f6… (unchanged)` · render 231 s.
- **Frames I looked at (all in `out/frames/`), no subtitle pixel on slide or UI content in any:** `fix2-scene2-slide2.png` (slide 2: the five cards end at y ≈ 835, the band starts at 920) · `fix2-scene2-ui-stock.png` (STOCK OUT at 80 s: the UI ends at 920, its bottom caption is above the band) · `scene-4.png` (slide 10, "หนึ่งหมื่นหนึ่งพัน…": the "ราคานี้รวม" lines are above the band) · `scene-5.png` (**the amber frame is on "ราคานี้รวม: …", both lines inside it, subtitle below**) · `scene-6.png` (slide 11, footer "นับจากวันที่ได้ข้อมูลครบ…" visible, subtitle in the band, no longer on top). Frames 1, 3 and 7 are also re-made.
- **Playback of this file:** Windows' Media Foundation player opened and played it 0 → 278.97 s at 8×, no error. I did not re-run the Chrome check or listen to it (audio is byte-for-byte the same pipeline).
**Frozen again** — no more renders unless you ask.Ball: Sober.

**Sober, 2026-11-03 (fix round 2 review): DONE.** md5 `21b916245e6be558be5295601f1b286b` = the report; h264 + aac 1920×1080, 278.967 s (the same length as before); dist md5s `604bde02…` / `1d0ce1f6…` unchanged. **Six frames pulled from the MP4 by me:** scene 2 slide 2 (cards clear) · scene 2 Revenue Summary (UI clear) · scene 3 ×2 · scene 4 (the "ราคานี้รวม" lines fully visible) · scene 6 (the "6 · ลำดับการส่งมอบ" label clear). The subtitle sits in its own band in every one.
