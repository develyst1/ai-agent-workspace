# SPEC-096: meeting-clip, the presenter video for the 11-07 meeting (REQ-5001)
**Author:** Sober (SA, Team A) · **Written:** 2026-11-03 · **REQ:** `requirements/REQ-5001-meeting-clip-presenter-video-for-11-07.md` · **TASKs:** TASK-848 (Jason, pipeline) · TASK-849 (Fern, final-UI walkthrough)
**Folder:** `som-balance-backoffice-spec/meeting-clip/` (path in `machine.local.md`; not git; no server). **Read-only inputs:** `pricing-deck/dist/index.html` (md5 `604bde02…`) and `final-ui/dist/index.html` (md5 `1d0ce1f6…`). Nothing writes to either folder.

## 0. What I measured before designing (2026-11-03, my scratchpad spike)
- **Thai voice, offline, no key:** Windows has `MSTTS_V110_thTH_Pattara`, i.e. **Microsoft Pattara, male, th-TH**, through the WinRT `Windows.Media.SpeechSynthesis` API (it is NOT visible to the old SAPI `System.Speech`). PowerShell 5.1 can drive it.
  - It returns 16 kHz mono 16-bit WAV.
  - A sample of scene 1 is in `meeting-clip/samples/voice-pattara-scene1.wav`.
- **The §4 script at Pattara's default rate:** scene 1 24.3 s · 2 78.1 s · 3 44.9 s · 4 26.8 s · 5 17.2 s · 6 21.1 s · 7 16.1 s = **228.6 s = 3.8 min**.
  - REQ AC-1 asks 6–8 min. That is a question to the PM (REQ `## Questions` Q1). The design takes the pacing as parameters, so either answer is a config change.
- **Tools on this machine:**
  - no system ffmpeg (Playwright's bundled `ffmpeg-1013` is a VP8-only build: not usable for H.264/AAC);
  - `python` is only the Windows Store stub;
  - node 22.23.2 / npm 10.9.8;
  - Playwright browsers installed: `chromium-1248`.

## 1. Design: one command, five steps
`npm run render` (in `meeting-clip/`) runs `scripts/render.mjs`, which runs these in order and stops on the first failure:
1. **`script` → chunks.** `src/script.ts` holds the §4 text **verbatim**, one string per scene (copied character for character).
   - `scripts/chunk.mjs` splits each scene on spaces into **subtitle chunks** of ≤ 60 characters (never mid-word, Thai or English), each at most 2 lines on screen.
     - It **always** starts a new chunk at each visual-change phrase in §1's two tables ("กฎการทำงานทุกข้อ", "ส่วนแรกคือเงินเดือน", "โค้ชเปิดดูสลิป" …).
     - Every one of them is preceded by a space in §4 (checked 2026-11-03), so a break there never splits a word.
   - **Assertion:** joining a scene's chunks with single spaces equals the scene text with whitespace collapsed. Any mismatch ⇒ throw. This is the word-for-word guarantee (AC-2).
2. **TTS → one WAV per chunk.** `scripts/tts.ps1`, the WinRT voice picked by `Language == 'th-TH'` and `Gender == Male`.
   - It reads each chunk from a UTF-8 file. Never pass Thai through a command-line string.
   - `config.json` → `voice.rate` (default 1.0) sets `SpeechSynthesizer.Options.SpeakingRate`.
   - **Pronunciation only, never the words:** `pronounce.json` maps a written token to what the voice says (SSML `<sub alias="…">`), e.g. `"CEO": "ซีอีโอ"`. The subtitle shows the written token. **It starts EMPTY.** An entry is added only after the PM approves it (Q3).
3. **Timeline.** `scripts/timeline.mjs` measures each WAV (RIFF header) and lays out `timeline.json` (§2) with the gaps from `config.json`:
   - `gap.chunk` 0.25 s;
   - `gap.paragraph` 0.6 s (a line break in §4);
   - `gap.sceneLead` 0.8 s, before a scene's first word;
   - `gap.sceneTail` 1.2 s, after its last.
4. **Visuals.**
   - **Deck slides** (scenes 1, 2-intro, 3–7): `scripts/capture-deck.mjs` opens `pricing-deck/dist/index.html#/slide/N` with `file://`, viewport 1920×1080, reload per slide, waits for `document.fonts.ready`, then screenshots PNG.
     - Scene 5 also takes the bounding box of the element whose text starts "ราคานี้รวม" on slide 10 → `highlight.json`.
   - **Final-UI walkthrough** (scene 2, TASK-849): `scripts/capture-ui.mjs` exports `recordWalkthrough({ cues, durationSec, outFile })` → a WebM at 1920×1080. DARK, because the final UI opens dark with empty storage (verified 10-27).
   - **Overlays (the Vite part):** `src/stage/` is a Vite + React page at 1920×1080 that renders **one overlay at a time on a transparent background**, chosen by URL:
     - `?sub=<chunkId>`: the subtitle;
     - `?hl=scene5`: the highlight frame around the `highlight.json` box.
     - `scripts/capture-overlays.mjs` builds it (`vite build`), opens the built page by `file://`, and screenshots each overlay with `omitBackground: true` → PNG.
     - Why the browser draws subtitles instead of ffmpeg: it uses the deck's own **Noto Sans Thai** (`@fontsource/noto-sans-thai`, as the deck), with Chrome's Thai shaping, so vowels and tone marks are not clipped (AC-3), and no TTF is needed.
5. **Compose.** `scripts/compose.mjs` drives **ffmpeg from the `ffmpeg-static` npm package** (pinned; no system install). Per scene it lays the visual (slide PNGs held, or the WebM), then each subtitle PNG over its chunk's [start, end], and the scene-5 highlight over scene 5. It concatenates the scenes with a 0.4 s crossfade and mixes the WAVs at their timeline starts.
   - **Output** `out/meeting-clip.mp4`: H.264 High, `yuv420p`, 1920×1080, 30 fps, CRF 20; AAC 48 kHz stereo 160 kb/s (the 16 kHz voice is resampled); `-movflags +faststart`. That plays in Windows' Films & TV / Media Player and in Chrome (AC-1).
   - It then prints its own ffprobe line (size, duration, codecs) and the md5.

**Scene → visual map** (REQ §3; the chunk where each visual starts is chosen by its first words, see §2 `cues`):
| scene | visual |
|---|---|
| 1 | slide 1 for chunk 1, then slide 8 from the chunk starting "กฎการทำงานทุกข้อ" |
| 2 | slide 2 for the first sentence ("ระบบหลังบ้านใหม่มีห้าส่วน …"), then the UI walkthrough (TASK-849) for the rest |
| 3 | slide 9 |
| 4 | slide 10 |
| 5 | slide 10 + the highlight overlay on "ราคานี้รวม …" |
| 6 | slide 11 |
| 7 | slide 12 |

**Scene-2 walkthrough cues** (each fires at the start of the chunk whose text starts with the given words; the route list is the final UI's own, `final-ui/src/pages/a/index.ts` and `pages/b/index.ts`):
| from the chunk starting | action, as **CEO** unless said |
|---|---|
| "ส่วนแรกคือเงินเดือน" | go `#/salary/payrun` (Monthly Payment) |
| "โค้ชเปิดดูสลิป" | open one row's Payment Detail |
| "ส่วนที่สองคือรายได้" | go `#/revenue/summary` |
| "ส่วนที่สามคือสต็อก" | go `#/stock/stock-out` |
| "ส่วนที่สี่คือ" | go `#/fo/branch` |
| "เลือกวิธีชำระเงิน" | go `#/fo/payment` |
| "รู้ว่าใครเปลี่ยน" | go `#/fo/trial-link` (Conversion) |
| "รวมถึง Park Rent" | go `#/fo/no-teacher`, then `#/fo/confirm-camp` halfway through the chunk |
| "และส่วนสุดท้ายคือสิทธิ์ผู้ใช้" | stay on `#/salary/people` as CEO |
| "แอดมินไม่เห็น" | switch the header role to **Admin** (Employee shows no salary column) |
| "โค้ชทุกคนมีล็อกอิน" | switch to **Coach** (lands on own Payment Detail) |
| "และทุกอย่างเชื่อมกับระบบเดิม" | switch back to **CEO**, go Home |

If a "chunk starting" text is not found, `timeline.mjs` throws and names it. A cue never silently drifts.

## 2. The contract between the two TASKs: `out/timeline.json`
Written by TASK-848's `timeline.mjs`, read by TASK-849's `recordWalkthrough`. Field casing is exact.
```ts
type Timeline = {
  fps: 30; width: 1920; height: 1080;
  totalSec: number;
  scenes: { n: 1|2|3|4|5|6|7; startSec: number; endSec: number }[];
  chunks: { id: string /* "s2c07" */; scene: number; text: string; startSec: number; endSec: number; wav: string /* out/tts/s2c07.wav */ }[];
  cues: { scene: 2; atSec: number /* relative to the walkthrough's own start */; action: "goto" | "openDetail" | "role"; route?: string /* "#/fo/branch" */; role?: "ceo" | "admin" | "coach" }[];
  walkthrough: { startSec: number; durationSec: number }; // absolute position of the UI video inside the MP4
};
```
- `recordWalkthrough({ cues, durationSec, outFile })` **must** return a WebM whose length is `durationSec` ± 0.2 s. Every cue is applied within 0.3 s of `atSec`, measured from the first frame.
- How it clicks is TASK-849's business; what it shows is this table.

## 3. Non-functional
- **Determinism (AC-7):** the same script + config ⇒ the same chunk text, timings and visuals. The voice is offline, so the audio repeats. The MP4 bytes may differ (encoder metadata), so AC-7 is judged on duration ± 0.1 s, frames and audio, not md5.
- **Runtime:** the full render under 10 minutes on this machine.
- **No network at render time,** except a first `npm install` and the one-time Playwright browser install.
- **Nothing written outside `meeting-clip/`.** After a render, the md5s of the two REQ-133 `dist/index.html` are unchanged (AC-8). `render.mjs` checks this itself at its start and end.
- **Versions pinned, no `^`.**
  - `playwright` is pinned to the version whose `browsers.json` names chromium revision **1248** (the one installed). If none fits, pin a current one and run `npx playwright install chromium` once (an official download), written in the README.

## 4. Risks and unknowns
| # | risk | how it's handled / what would settle it |
|---|---|---|
| R1 | **Length:** 3.8 min of speech vs AC-1's 6–8 min | **Settled 11-03 (PM, A1):** AC-1 = "about 4–5 min, natural pace, no padding". Pattara is final (owner); `pronounce.json` holds the 5 approved spoken forms (A3, SOM BALANCE → "ส้มบาลานซ์" by the owner) |
| R2 | **Voice quality:** Pattara is an older, flatter voice than a neural one | Q2. Offline, no key, which matches §7. A neural Thai voice (e.g. Microsoft Edge "Niwat") needs an online, unofficial endpoint, so I don't default to it. The owner hears the sample first |
| R3 | **English words in a Thai voice** (SOM BALANCE, CEO, Excel, PDF, Park Rent) may be misread | `pronounce.json` changes only what is SAID, never the subtitle or the words. Q3 asks which spoken forms the PM approves. Tanya judges by ear (AC-2) |
| R4 | **Playwright vs the installed browser revision** | pin to match, or a one-time install (§3) |
| R5 | **ffmpeg-static** downloads its binary at `npm install` from its GitHub release | the npm package is widely used; pinned. If the download is blocked, the README names it, and the owner can point `FFMPEG_PATH` at his own ffmpeg |

## 5. AC → TASK
| REQ AC | where |
|---|---|
| 1 plays, 1080p, length | 848 (compose + ffprobe line); the length is per Q1 |
| 2 word for word, numbers | 848 (chunk assertion); the numbers are spoken from the script's own Thai words; Tanya by ear |
| 3 subtitles readable | 848 (overlay page, the deck font) |
| 4 visual in sync | 848 (scene map, cues) + 849 (walkthrough timing ± 0.3 s) |
| 5 dark UI, invented names | 849 (empty storage ⇒ dark; it records only the final UI's own mock data) |
| 6 nothing internal | 848 (the inputs are the §4 script + the Tanya-passed deck / UI only; nothing reads the agenda file) |
| 7 one command | 848 (`npm run render`, README) |
| 8 dist unchanged | 848 (`render.mjs` md5 check at start and end) |
