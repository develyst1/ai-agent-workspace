# TEST-131: REQ-5001, the presenter MP4 for the 11-07 money meeting

- **QA:** Tanya
- **Date:** 2026-11-03
- **Brief:** Porter's GO in `inbox/QA.md` (2026-11-03)
- **Against:** `requirements/REQ-5001-meeting-clip-presenter-video-for-11-07.md` §5, as amended by ### Answers:
  - AC-1 = 4–5 min;
  - the voice is Pattara;
  - the spoken forms are ซีอีโอ / เอ็กเซล / พีดีเอฟ / พาร์ค เร้นท์ / ส้มบาลานซ์;
  - the subtitles keep the English.
- **Build under test:** `som-balance-backoffice-spec/meeting-clip/out/meeting-clip.mp4`, 10,943,676 B, md5 **`1996f7a72083b14d674581b6fe8faf12`** (= Porter's; checked before and after the run).
- **Sober's review:** `tasks/TASK-848-…`. My verdict rests on my own runs below, not on it.

## Verdict: ✅ TEST_PASSED for AC-1…AC-8 as machine-checkable · 🟡 2 small visual notes · ⚪ 2 checks need a human (listen by ear · Windows Media Player by double-click)

| AC | Result | Instrument | |
|---|---|---|---|
| **1** plays · 1920×1080 · 4–5 min · no slowed speech / padding | **H.264 High, yuv420p, 1920×1080, 30 fps + AAC-LC 48 kHz stereo, 4:38.97** (ffprobe). Voice rate 1.0 (`config.json`). The longest silence in the whole clip is **2.92 s**, all at scene boundaries (scene tail + lead); inside scenes the gaps are ≤ 1.5 s (silencedetect −40 dB). **Chrome** (the real Google Chrome, headless, `file://`): readyState 4, duration 278.97 s, plays (3.0 s advanced in 3 s, 152 frames decoded, 0 dropped, audio decoded), seeks to 60 / 140 / 200 s, and **reaches `ended`** with no media error. **Windows:** the shell's media handler reads the file (duration 278.967 s, 1920 × 1080, 30 fps, 48 kHz, 2 ch); the default .mp4 app on this PC is **Windows Media Player** (`WMP11.AssocFile.MP4`) | ffprobe · ffmpeg · Chrome · Windows shell | ✅ (⚪ WMP double-click: below) |
| **2** the §4 script word for word, in order; every number spoken right | **Every one of the 7 scenes' text = REQ §4 word for word** (`chunk.mjs --source REQ-5001` ⇒ *"every scene equals the REQ word for word"*, and my own join of the 68 subtitle chunks = §4 per scene). **The voice was given exactly that text:** each of the 68 SSML files = its chunk + **only the 5 approved swaps** (SOM BALANCE → ส้มบาลานซ์ ×1 · CEO → ซีอีโอ ×2 · Excel → เอ็กเซล ×3 · PDF → พีดีเอฟ ×1 · Park Rent → พาร์ค เร้นท์ ×1); no other English is in the text. **Every AC-2 number is in the script as Thai words**, so the voice reads words, not digits: เจ็ดหมื่นสามพัน · สองร้อยเจ็ดสิบแปด · สองร้อยหกสิบสาม · สองร้อยวัน · ห้าสิบเอ็ด · หนึ่งร้อยสี่สิบเก้า · สามหมื่นเก้าพันสองร้อย · (หนึ่ง)หมื่นหนึ่งพันเก้าร้อย · (หนึ่ง)หมื่นสามพันแปดร้อย · (หนึ่ง)หมื่นสามพันห้าร้อย · หกเดือน · สามถึงสี่ / สี่ถึงห้า / สามสัปดาห์ · สองถึงสามเดือน. **The voice is Pattara:** `tts.ps1` picks the first th-TH male voice, and **Pattara is the only th-TH male voice installed** (the others are David / Zira / Mark, en-US). **The MP4's audio IS that TTS:** the re-render (AC-7) made the decoded audio track bit-identical (MD5 `5014ecfb…`) from the same 137 TTS files | text + SSML + voice list + decoded-audio hash | ✅ (⚪ by ear: below) |
| **3** subtitles match the audio, readable, no line off screen, no clipped Thai marks | the subtitles are the same 68 chunks the voice speaks, each shown during its own chunk's time (`timeline.json`); **1 line each, ≤ 60 chars, ≤ 1,700 px** (the render's own report); on **29 frames** read by eye: white on a dark band, Noto Sans Thai, no line off screen, upper and lower Thai marks intact (incl. the top-placed ones in scenes 5–6) | frames from the delivered MP4 | ✅ (🟡 1) |
| **4** each scene's visual, in sync | scene 1 = slide 1 → slide 8 · scene 2 = slide 2, then the final-UI walkthrough · 3 = slide 9 · 4 = slide 10 · 5 = slide 10 with **"ราคานี้รวม" highlighted** (yellow frame) · 6 = slide 11 · 7 = slide 12. **The walkthrough's 14 cues, each against the subtitle spoken at that moment:** Monthly Payment ↔ *"ส่วนแรกคือเงินเดือน"* · Payment Detail ↔ *"โค้ชเปิดดูสลิปของตัวเอง…"* · Revenue Summary ↔ *"ส่วนที่สองคือรายได้…"* · STOCK OUT ↔ *"ส่วนที่สามคือสต็อก ขายของแบบตะกร้า"* · Branch for booking ↔ *"ส่วนที่สี่คือการเพิ่มสิ่งที่ขาดในหน้าบ้าน…"* · Payment Method ↔ *"เลือกวิธีชำระเงิน"* · Conversion ↔ *"รู้ว่าใครเปลี่ยนจากคลาสทดลองเป็นคอร์ส"* · Park Rent + To Confirm Camp ↔ *"รวมถึง Park Rent และการยืนยันแคมป์ครับ"* · Employee ↔ *"และส่วนสุดท้ายคือสิทธิ์ผู้ใช้"* · **Admin** (Employee, no salary column) ↔ *"แอดมินไม่เห็นยอดเงินเดือน"* · **Coach** (own Payment Detail) ↔ *"โค้ชทุกคนมีล็อกอินของตัวเอง"* · CEO / Home ↔ *"…เชื่อมกับระบบเดิม…"* | frames + `timeline.json` cues | ✅ (⚪ 3) |
| **5** UI in DARK mode · invented names only | every walkthrough frame is dark. Staff: Pete / May / Ton / Ploy / Nam / Beam; children: น้องมะลิ / ภูมิ / ข้าวหอม / ใบบัว / ตะวัน; the only person named in the narration is คุณขวัญ (the §4 script's own words) | frames + text scan | ✅ |
| **6** nothing internal | **0 hits** in the spoken + subtitle text for: ไม่มีส่วนลด · 25,700 / the Salary-later option · +5 days / 1,300 · ระวัง / ถาม–ตอบ · TASK / REQ / AI / team names. The slides shown are the final deck (its round-3 / round-4 TEST-127 pass); the UI pages are the final UI (TEST-129 / 130) | text scan + frames | ✅ |
| **7** one documented command rebuilds the same MP4 | `npm run render` (README), 222 s: **audio bit-identical** (decoded MD5 the same), `voice.wav` / `timeline.json` / 137 TTS files / 8 slides / 69 subtitle overlays **all identical**, scenes **1 and 3–7 byte-identical**. **Only scene 2 differs**: `walkthrough.webm` is a live headless recording of the final UI, and its frames vary run to run. So the file md5 differs (`9db8a9f0…` vs `1996f7a7…`, size −30 KB). Same script, voice, subtitles, slides and timings; only the screen-capture pixels in scene 2 vary | re-render + per-file / decoded hashes | ✅ (read as "rebuilds the same clip"; byte-identical only outside the live capture) |
| **8** deck + final-UI `dist/` unchanged | `604bde02235715366734c053509b311f` · `1d0ce1f63ae826984172ade3d724f41a`, before, during (the render checks them at its start and end) and after | md5 | ✅ |

## 🟡 Small visual notes (none blocks; the SA's call)
1. **The bottom subtitle sits over slide text in two places:**
   - **scene 2's slide-2 frame:** it covers the bottom of the "แก้หน้าบ้าน" / "สิทธิ์ + เชื่อมระบบ" cards;
   - **scene 4 (slide 10):** it covers the *"ราคานี้รวม …"* lines while the installments are being read.
   - Both are readable (the band is dark), but the slide text behind is hidden for those seconds.
   - Scenes 5 and 6 already move the subtitle to the top for this reason; scene 4 could too.
2. **Scene 6, top subtitle:** it overlaps the small section label *"6 · ลำดับการส่งมอบ"*. Cosmetic.

## ⚪ Observations
3. **AC-4, one weaker sync:** during *"โค้ชเปิดดูสลิปของตัวเองแล้วกดยืนยันเอง"* the screen shows the **CEO's** Payment Detail (Pete's slip, "Viewing as CEO"), not a coach's own slip. The coach's own slip appears ~75 s later, with *"โค้ชทุกคนมีล็อกอินของตัวเอง"*. It's the right page, the wrong viewer.

## NOT_TESTED (named, with what settles it)
- **By ear: does the voice pronounce every word and number right?** I can't listen: this PC has no Thai speech recognizer (only en-US).
  - **What I proved instead:** the exact text the voice was given (word for word, numbers as Thai words, only the 5 approved swaps), that it's Pattara, and that the MP4's audio is that output.
  - **Settles it:** the owner (who already approved Pattara's sound) listens once. See the click-script.
- **Windows Media Player by double-click:** not opened.
  - A GUI player would pop up on the owner's screen (QA rule: headless only, nothing visible). Also the file is H.264 High + AAC-LC in MP4, and Windows' own media stack already parses it (above).
  - **Settles it:** the same click-script.

### Click-script for the owner (via Porter), ~5 min
1. In Explorer, open `som-balance-backoffice-spec/meeting-clip/out/` and **double-click `meeting-clip.mp4`**.
   - ✅ It opens in **Windows Media Player** and plays with sound.
   - ❌ An error, or no sound.
2. Listen through (4 min 39 s). Pay attention to:
   - the numbers in scenes 3–4 (**เจ็ดหมื่นสามพัน … สามหมื่นเก้าพันสองร้อย … หนึ่งหมื่นหนึ่งพันเก้าร้อย / หนึ่งหมื่นสามพันแปดร้อย / หนึ่งหมื่นสามพันห้าร้อย**);
   - **"ส้มบาลานซ์"** at ~0:06;
   - ซีอีโอ / เอ็กเซล / พีดีเอฟ / พาร์ค เร้นท์.
   - ✅ Every word sounds right.
   - ❌ Note the minute:second of anything misread.
3. Close the player. Nothing to clean up.
4. Tell Porter: "WMP ok / not ok" + any mm:ss.

## Test data created / footprint
- **Read only on the deliverable.**
- For AC-7 I ran `npm run render` once in `meeting-clip/`. It regenerated `out/` (the spec folder's own generated files; README: *"generated and disposable"*).
- I had backed up the delivered `out/` first. **After the re-render I copied the delivered `out/` back**, so `out/meeting-clip.mp4` is again **`1996f7a7…`** (checked), and `walkthrough.webm` / `scenes/s2.mp4` are the delivered ones.
- My backup and the re-rendered MP4 are in my scratchpad only.
- No server, no sid / uat, no network.

## Evidence (decisive)
1. **`chunk.mjs --source REQ-5001`** ⇒ *"chunk assertion PASSED: 7 scenes, 68 chunks … every scene equals the REQ word for word"*, plus my SSML scan (68 / 68 = chunk text + only the 5 approved swaps). This proves AC-2's text and order.
2. **The re-render's decoded audio MD5 `5014ecfb…` = the delivered MP4's.** This proves the audio is the Pattara TTS of that text, and that AC-7 rebuilds it.
3. **Chrome:** `{"duration":278.97,"w":1920,"h":1080,"decodedFrames":152,"dropped":0,"ended":true,"err":null}`. This proves AC-1 in Chrome.


---
## Re-check: the subtitle fix (md5 `21b916245e6be558be5295601f1b286b`, 2026-11-03): ✅ TEST_PASSED
- **Brief:** Porter's re-check entry in `inbox/QA.md`. The md5 was checked before the run.
- **Scope (only these):** (a) no subtitle over slide / UI text; (b) the subtitles still match the audio, with no Thai marks clipped; (c) Chrome to the end; (d) AC-8.

| | Result | |
|---|---|---|
| **(a) no overlap** | on the same 29 frames as before, across all 7 scenes, every slide and the UI recording are **scaled into the upper area**, and **every subtitle sits in its own band below**. **Scene 2:** slide 2's bottom cards (แก้หน้าบ้าน / สิทธิ์ + เชื่อมระบบ) are fully visible, and so is every UI page. **Scene 4:** slide 10's *"ไม่มีมัดจำ"* / *"ราคานี้รวม"* lines are fully visible. **Scene 5:** the yellow "ราคานี้รวม" highlight is fully visible. **Scene 6:** the *"6 · ลำดับการส่งมอบ"* label is clear. **0 overlaps** | frames | ✅ (both 🟡 closed) |
| **(b) subtitles = audio, marks intact** | **the decoded audio is bit-identical to the previous build** (MD5 `5014ecfb…`, unchanged); `timeline.json` chunks are unchanged (all 7 scenes = REQ §4 word for word; the SSML still = the chunks + only the 5 approved swaps); every frame's subtitle = the chunk spoken at that moment; one line each; upper and lower Thai marks intact | decoded-audio hash + text scan + frames | ✅ |
| **(c) Chrome** | duration 278.97 s, 1920 × 1080, 153 frames decoded in 3 s, 0 dropped, audio decoded, seeks OK, **`ended` reached**, no media error | real Chrome, headless | ✅ |
| **(d) AC-8** | `604bde02235715366734c053509b311f` · `1d0ce1f63ae826984172ade3d724f41a`: unchanged | md5 | ✅ |

- **Footprint:** read only (no re-render this time).
- **Unchanged from the first round:**
  - the 2 owner checks (listen by ear; Windows Media Player by double-click) are still NOT_TESTED. The click-script above applies to this MP4 as is.
  - The AC-4 nuance (the coach-slip sentence over the CEO's view) is unchanged.
