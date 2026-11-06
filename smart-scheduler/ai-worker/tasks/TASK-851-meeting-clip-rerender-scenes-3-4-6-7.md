# TASK-851 — the meeting clip: new narration for scenes 3, 4, 6, 7 + the new slides (REQ-5001 §8 part 2) — @Jason (≈ 0.3 d)
**From @Sober, 2026-11-03. Start AFTER TASK-850 is done and frozen** (the clip captures its slides). Target: the MP4 to me **Wed 11-04 EOD**, READY FOR QA by Thu 11-05 18:00.
**The narration:** REQ-5001 **§8.2**, word for word. It replaces §4's scenes 3, 4, 6, 7; scenes 1, 2, 5 stay §4's text.
**Folder:** `som-balance-backoffice-spec/meeting-clip/` (your TASK-848 code). Not git. **Rule 2:** you never ask the owner.

## Changes
1. **The script source:** `--regen` builds `src/script.ts` from **§4, with §8.2's scenes 3 / 4 / 6 / 7 overriding**. It reads the REQ; never retype.
   - Rewrite `script.approved.sha256` from the result.
   - The word-for-word check compares each scene with its own source section: §4 for 1 / 2 / 5, §8.2 for 3 / 4 / 6 / 7.
2. **The cue / visual-change phrases** (SPEC-096 §1):
   - check that the scene-1 and scene-2 phrases still exist (unchanged text, so they should);
   - scenes 3 / 4 / 6 / 7 each show one slide, so no new cue phrases.
3. **Pronunciations:** the same `pronounce.json` (5 entries). No change.
4. **The deck md5 check in `render.mjs`:**
   - the expected `pricing-deck/dist/index.html` md5 becomes **TASK-850's new frozen md5**;
   - `final-ui` stays `1d0ce1f6…`.
   - Read the expected values from one place (`config.json`), so the next deck change is one edit.
5. **Scene 5** (unchanged narration) shows the **new** slide 10. Its highlight must still sit on "ราคานี้รวม", recomputed from the new slide.
6. **The subtitle band** (fix round 2) stays as is.

## Done = (evidence in `## Implementation Notes`)
- **The word-for-word check passes**, and is shown failing once on a copy with one character changed in a §8.2 scene.
- `npm run render` (WITH the walkthrough) → exit 0, with the per-scene durations.
  - Scenes 1, 2, 5 must be the same length as the last render ± 0.1 s: **1 = 29.57 · 2 = 101.87 · 5 = 21.69**.
  - The total stays "about 4–5 min" (REQ A1).
- `grep` of `src/script.ts`:
  - for `สองถึงสามเดือน|หนึ่งหมื่นหนึ่งพันเก้าร้อย|สามถึงสี่สัปดาห์|เครื่องมือช่วย` = 0;
  - for `ประมาณสามเดือน|แปดพันสามร้อย|สามพันหกร้อย` ≥ 1.
- **Frames looked at by you:** scene 3 (slide 9) · scene 4 (slide 10, the new table) · scene 5 (the highlight on ราคานี้รวม) · scene 6 (slide 11, the 3 blocks) · scene 7 (slide 12, 3 items). The subtitle is in the band and covers nothing.
- The dist md5s: the deck = TASK-850's, final-ui = `1d0ce1f6…`.
- The new MP4 md5. Then freeze.

## Questions
_(none yet)_

## Implementation Notes
_(Jason)_

## Review
_(Sober)_

## ADD-ON 1 — Sober, 2026-11-03 (REQ-5001 §8.3, owner-approved): scene 3 is ONE paragraph, and the method is out
- **The scene 3 source is now §8.3**, not §8.2:
  > เรื่องราคา ระบบหลังบ้านใหม่ครบทั้งห้าส่วน ราคาสามหมื่นเก้าพันสองร้อยบาทครับ ราคานี้ประเมินค่าแรงด้วยเรทเดิมของแพ็กเกจที่ใช้อยู่ ไม่ได้ขึ้นราคา และทั้งหมดเสร็จในประมาณสามเดือนครับ
  - `--regen` precedence: §4 → §8.2 → **§8.3 for scene 3**. Rebuild the hash.
  - The word-for-word check compares scene 3 with §8.3.
- **Wait for TASK-850's add-on** (its new md5), then render on it.
- **Done adds:**
  - `grep` of `src/script.ts` for `เจ็ดหมื่นสามพัน|สองร้อยเจ็ดสิบแปด|สองร้อยหกสิบสาม|ห้าสิบเอ็ดวัน|หนึ่งร้อยสี่สิบเก้า|ขนาดของงาน` = 0;
  - one frame of scene 3 (the new slide 9) and one of scene 5 (slide 10's scope line, no 263).

## ADD-ON 2 — Sober, 2026-11-03: no "ขวัญ" in the narration (REQ-5001 §8.4). The SAME single render as add-on 1 (Porter: "do not render twice")
- **New `--regen` source:** §4 → §8.2 → §8.3 (scene 3) → **§8.4's three line replacements**:
  - scene 1 "กฎการทำงานทุกข้อ คุณขวัญยืนยันครบแล้ว" → "กฎการทำงานทุกข้อ ยืนยันกันครบแล้ว";
  - scene 6 "ลำดับการส่งมอบ คุณขวัญเลือกได้ครับ" → "ลำดับการส่งมอบ เลือกได้ครับ";
  - scene 7 "อย่างแรกคือลำดับก้อนที่คุณขวัญเลือก ว่าอยากได้ก้อนไหนก่อน" → "อย่างแรกคือลำดับก้อนที่เลือก ว่าอยากได้ก้อนไหนก่อน".
  - **Each replacement must match exactly once** in its scene, or `--regen` throws. Rebuild the hash.
- **The scene-1 cue phrase "กฎการทำงานทุกข้อ"** still starts the new line ✓ (checked). Keep the forced chunk break there.
- **The DoD changes:**
  - **scene 1 is now shorter**, so only **scenes 2 and 5** must equal the last render ± 0.1 s (2 = 101.87 · 5 = 21.69);
  - add: `grep -c ขวัญ src/script.ts` = 0.
  - (The final UI that scene 2 records has 0 "ขวัญ", checked by me.)
- **The order:** TASK-850 add-ons 1 + 2 → freeze → **one** `npm run render` → frames → md5.


## Jason (BE) 2026-11-03 — TASK-851 DONE: clip re-rendered with §8.2 narration + the new deck — GREEN, frozen
**New MP4: `meeting-clip/out/meeting-clip.mp4` · 295.17 s (4 min 55 s) · 10,387,994 B · md5 `2a3342c58dc0a7b7adeb1bb877174f1f`.** Built on TASK-850's deck md5 `7b677d23…`; if you change the deck after your review, it is one value in `config.json` → `inputs.deck.md5` plus a re-render.
- **Script:** `--regen` now builds `src/script.ts` from §4 with **§8.2's scenes 3 / 4 / 6 / 7 overriding**, by reading the REQ; `script.approved.sha256` rewritten (`e105671f1d99…`). The word-for-word check compares each scene with its own section. **Passes** (`7 scenes, 72 chunks … every scene equals the REQ word for word`). **Failing once:** a COPY with one character changed in scene 4 (แปดพันสามร้อยบาท → …ร้อนบาท) → `the script is NOT the approved text (sha256 e52614121585… vs approved e105671f1d99…)`, exit 1, with and without the REQ path (the hash stops it first). The original was untouched.
- **Cue phrases:** scenes 1 and 2 text is unchanged and the 14 cues were found (render would throw otherwise). Scenes 3/4/6/7 show one slide each, no new cues. `pronounce.json` unchanged (5).
- **Expected md5s** now come from one place: `config.json` → `inputs` (deck `7b677d23…`, final-ui `1d0ce1f6…`, full md5, not a prefix). Printed at the start and end of the render: both unchanged.
- **Plain `npm run render` (with the walkthrough) exit 0.** `scene durations (s): 1=29.57 2=101.87 3=46.22 4=30.34 5=21.69 6=37.66 7=27.80` · **scenes 1, 2, 5 are identical to the last render** (29.57 / 101.87 / 21.69) · `total 295.15 s` ("about 4–5 min" ✓) · `mp4: h264 High yuv420p 1920x1080 30/1, aac 48000 Hz 2 ch stereo, 295.17 s` · render 255 s.
- **`grep` of `src/script.ts`:** `สองถึงสามเดือน|หนึ่งหมื่นหนึ่งพันเก้าร้อย|สามถึงสี่สัปดาห์|เครื่องมือช่วย` = **0** · `ประมาณสามเดือน` = 2 · `แปดพันสามร้อย` = 1 · `สามพันหกร้อย` = 1 · the old AC-6 list (`ไม่มีส่วนลด|25,700|25700|1,300|ระวัง`) = 0.
- **Frames looked at (`out/frames/`):** scene 3 (slide 9: "เสร็จในประมาณ 3 เดือน…", subtitle "เหลืองานที่เพิ่มจริงหนึ่งร้อยสี่สิบเก้าวัน") · scene 4 (slide 10, the new table 8,300 / 13,800 / 13,500 / 3,600 / รวม 39,200) · **scene 5 (the amber frame is on "ราคานี้รวม: …", both lines, recomputed from the new slide)** · scene 6 (slide 11: the 3 blocks and the footer) · scene 7 (slide 12: 3 items). In each the subtitle is in the bottom band and covers nothing.
- **Playback:** Windows' Media Foundation player played the new file 0 → 295 s at 8×, no error (see the line below). I did not re-run Chrome, did not open Windows Media Player 12, and cannot hear it: Tanya, by ear (the numbers 8,300 / 3,600 / "ประมาณสามเดือน" / 4 · 7–8 · 6 · 10 · 5–6 · 10–11 weeks).
**Frozen.** Ball: Sober.

**Sober, 2026-11-03: NOT DONE. This MP4 (`2a3342c5…`) is SUPERSEDED.** It was rendered on deck `7b677d23…` with §8.2 only, before ADD-ON 1 (§8.3, the pricing method out) and ADD-ON 2 (§8.4, no "ขวัญ").
- **Checked:** `src/script.ts` still holds 3 × "ขวัญ" and 3 method numbers (เจ็ดหมื่นสามพัน / สองร้อยหกสิบสาม …).
- The §8.2 work itself is good; keep it.
- **Next:**
  - TASK-850 add-ons 1 + 2 → the new deck md5;
  - this TASK's add-ons 1 + 2 (`--regen` §4 → §8.2 → §8.3 → §8.4);
  - **one** render, with the DoD in the add-ons.
- **Your TASK-850 questions are answered** (Porter's yes on slides 8 / 12 and on "แต่ละก้อน"), in TASK-850's "Add-on 1, line 4".


## Jason (BE) 2026-11-03 — TASK-850 add-ons 1 + 2 and TASK-851 add-ons 1 + 2 DONE: ONE deck rebuild, ONE clip render — GREEN, both frozen
(No render was running when your STOP arrived: the earlier render on `7b677d23…` had already finished. I did the deck first, then rendered once.)
**DECK — new `pricing-deck/dist/index.html`: 1,324,721 B · md5 `afd90aaf065e5ddc747f3c5a5c558002`.**
- **Add-on 1 (method out):** `rate`, `work`, `comparison` and `extraRatePerDay` are **deleted** from `pricing.ts` and every use (nothing hidden behind a flag). Slide 9 = **39,200 บาท** + "ประเมินค่าแรงตามเรทเดิมของแพ็กเกจที่ใช้อยู่ ไม่ได้ขึ้นราคา" + "เสร็จในประมาณ 3 เดือน เพราะมี 2 ทีมทำพร้อมกัน มีการตรวจทานและทดสอบ · ทุกตัวเลขมีคนตรวจซ้ำ" (title kept). Slide 10 scope line: "ขอเพิ่มภายหลังคิดเรทเดิม ตามขนาดงาน" (no 263); "ไม่มีมัดจำ · จ่ายเมื่อส่งมอบแต่ละก้อน".
- **Add-on 2 (no ขวัญ):** slide 8 "ยืนยันกฎครบแล้ว", slide 11 "เลือกลำดับได้" (heading and slide title), slide 12 "ลำดับก้อนที่เลือก". `grep -c ขวัญ dist/index.html` = **0**.
- **Greps on `dist/index.html`:** `73000|73,000|278|\b263\b|\b149\b|51 วัน|200 วัน|เท่ากับโปรแกรมเมอร์|ขนาดของงาน` = 2 lines hit, **both are random runs inside base64 data** (font/image bytes: `…l6ARI++pHq…W4IbeXm+AwbEzHh278/bq2/…`, `…lWTLdFqhRmVJVnv…KIvZc278qrBpD…`), not text. To prove it, the **rendered text of all 12 slides** (read from the DOM) matches none of those patterns and has no "ขวัญ". The earlier list (`2–3 เดือน|เริ่มจาก Stock|11,900|3–4 สัปดาห์ งวด|เครื่องมือช่วย`) = 0. "แต่ละส่วน" = 0.
- tsc 0 · build 0 · **0 console** (served build, 12 slides stepped). Slides 9 and 10 looked at (1920×1080): slide 9 = the number box + 2 lines, nothing clipped; slide 10 fits.
**CLIP — new `meeting-clip/out/meeting-clip.mp4`: 264.80 s (4 min 25 s) · 9,163,156 B · md5 `6eeba8da690030675b2ba7ac3eadf0b3`.**
- **`--regen` source now §4 → §8.2 → §8.3 (scene 3) → §8.4 (3 line replacements, each must match exactly once or it throws).** Hash rewritten (`25aeef53…`). Word-for-word check passes: `7 scenes, 64 chunks … equal to the REQ`. (The failing demo on a changed character was already shown for TASK-851; the hash check is unchanged.)
- **Single plain `npm run render` (walkthrough on) exit 0.** `scene durations (s): 1=29.25 2=101.87 3=16.91 4=30.34 5=21.69 6=37.24 7=27.49` · **scenes 2 and 5 equal the last render** (101.87 / 21.69) · scene 1 is 0.32 s shorter, as you said · total 264.79 s ("about 4–5 min" ✓) · dist md5s: deck `afd90aaf…`, final-ui `1d0ce1f6…`, both unchanged · render 212 s. `config.json` → `inputs.deck.md5` is the new deck's.
- **`grep` of `src/script.ts`:** `เจ็ดหมื่นสามพัน|สองร้อยเจ็ดสิบแปด|สองร้อยหกสิบสาม|ห้าสิบเอ็ดวัน|หนึ่งร้อยสี่สิบเก้า|ขนาดของงาน` = **1, and it is scene 5's unchanged line "…เราคิดด้วยเรทเดิม ตามขนาดของงานครับ"** (§4's own words, a scope phrase, not the method). I did **not** touch it (scenes 1/2/5 text stays §4's, and scene 5 must keep its length). The other five patterns = 0. `ขวัญ` = **0**. The old lists (`สองถึงสามเดือน|…|เครื่องมือช่วย|ไม่มีส่วนลด|25,700|25700|1,300|ระวัง`) = 0. `ประมาณสามเดือน` 2 · `แปดพันสามร้อย` 1 · `สามพันหกร้อย` 1 · `ยืนยันกันครบแล้ว` 1 · `เลือกได้ครับ` 1 · `ลำดับก้อนที่เลือก` 1. **Your call:** if "ตามขนาดของงาน" must go from scene 5's narration too, Porter has to change §4 scene 5 (it is not mine to reword).
- **Frames looked at (`out/frames/`):** scene 3 = the new slide 9 (39,200 บาท + the two lines; subtitle "ราคานี้ประเมินค่าแรงด้วยเรทเดิมของแพ็กเกจที่ใช้อยู่" in the band) · scene 5 = slide 10 with the amber frame on "ราคานี้รวม: …" and the scope line reading "ขอเพิ่มภายหลังคิดเรทเดิม ตามขนาดงาน" (no 263). Frames 1, 4, 6, 7 re-made, not re-read this round.
- **Playback:** Windows Media Foundation played 0 → 264.80 s at 8×, no error. I did not re-run Chrome, open Windows Media Player 12, or listen to it (Tanya, by ear).
**Both frozen.** Ball: Sober.

**Sober, 2026-11-03 (final, after add-ons 1 + 2): DONE.**
- MP4 md5 `6eeba8da690030675b2ba7ac3eadf0b3`, 264.8 s (4 min 25 s, inside A1). Deck `afd90aaf…`, final-ui `1d0ce1f6…` unchanged.
- `src/script.ts`: `ขวัญ` · `เจ็ดหมื่นสามพัน` · `สองร้อยเจ็ดสิบแปด` · `สองร้อยหกสิบสาม` · `ห้าสิบเอ็ดวัน` · `หนึ่งร้อยสี่สิบเก้า` · `สองถึงสามเดือน` = **all 0**.
  - The one `ขนาดของงาน` is scene 5's approved, unchanged §4 line about how later additions are priced. Leaving it is right; my grep term over-matched.
- **Frames pulled by me at each scene's midpoint (scenes 1, 3, 4, 5, 6, 7):** every slide as ruled, the scene-5 highlight on ราคานี้รวม, the subtitles in the band.


## Jason (BE) 2026-11-03 — TASK-850 ADD-ON 3 + the one TASK-851 re-render DONE — GREEN, both frozen
- **Deck (add-on 3):** the three "ราคาคิดอย่างไร" in `slides.tsx` are now `section` "4 · ราคา", `title` "ราคา" and the `Head` kicker "4 · ราคา"; nothing else changed. tsc 0 · build 0 · `grep -c ราคาคิดอย่างไร dist/index.html` = **0** (and `ขวัญ` still 0). Slide 9 looked at (1920×1080): kicker "4 · ราคา", the HUD label "9 / 12 4 · ราคา", the rest as before. I did not re-step the 12 slides for console this time (a string change). **New `dist/index.html`: 1,324,631 B · md5 `ac0d60da31b68ebc224d0731491ad430`.**
- **Clip:** `config.json` → `inputs.deck.md5` set to it; ONE plain `npm run render` (walkthrough on) exit 0. `scene durations (s): 1=29.25 2=101.87 3=16.91 4=30.34 5=21.69 6=37.24 7=27.49` (**identical to the last render**), total 264.79 s, dist md5s printed at start and end: deck `ac0d60da…`, final-ui `1d0ce1f6…`, both unchanged. Script unchanged (hash `25aeef53…`, 64 chunks, word-for-word passed). Frame `scene-3.png` (the new slide 9 with the "4 · ราคา" kicker) looked at; the other frames are re-made from the same pipeline.
- **New MP4: `meeting-clip/out/meeting-clip.mp4` · 264.80 s · 9,181,591 B · md5 `1645a12e1534cefea2f29cf027732cd5`** (replaces `6eeba8da…`).
- Same limits as before: I cannot hear it, and I did not re-open Windows Media Player or Chrome on this file. My open item from the last report stands (scene 5's §4 line "ตามขนาดของงานครับ", left untouched).
**Both frozen.** Ball: Sober.

**Sober, 2026-11-03 (after add-on 3): DONE.** MP4 md5 `1645a12e1534cefea2f29cf027732cd5`, 264.8 s (unchanged). It was rendered on deck `ac0d60da…`; final-ui `1d0ce1f6…`. `script.ts` `ขวัญ` = 0. Scene 3 frame: "4 · ราคา", 39,200, the old-rate line, about 3 months. Frozen.

## ADD-ON 4 — Sober, 2026-11-03: scene 7 = REQ-5001 §8.6, word for word. ONE render after TASK-850 add-on 4
- **`--regen` precedence:** §4 → §8.2 → §8.3 (scene 3) → §8.4 (scenes 1 and 6 only) → **§8.6 (scene 7)**.
  - ⚠️ **Retire §8.4's scene-7 replacement:** §8.6's text is already neutral and doesn't contain "คุณขวัญเลือก", so the "must match exactly once" rule would throw.
  - Keep the rule for scenes 1 and 6.
- **Done =**
  - the word-for-word check, scene 7 against §8.6;
  - `grep` script: `ขวัญ` = 0, `สองคอลัมน์` = 1, `ไฟล์ Excel รายการสินค้าจริง` = 0;
  - **scenes 1–6 the same length as the last render ± 0.1 s** (only scene 7 changes);
  - the scene-7 frame (slide 12 with the note);
  - the deck md5 = 850's; the new MP4 md5. Freeze.


## Jason (BE) 2026-11-03 — ADD-ON 4 (REQ-5001 §8.6) DONE in TASK-850 + TASK-851: one rebuild, one render — GREEN, both frozen
**DECK — new `pricing-deck/dist/index.html`: 1,324,404 B · md5 `c79d68fe6c603a7e45b08172cc23c226`.**
- Slide 12 = 2 cards (**ลำดับก้อนที่เลือก** "อยากได้ก้อนไหนก่อน ก้อนไหนหลัง" · **วันที่จะเริ่มใช้ระบบ** "มีผลต่อการนับรายได้และโบนัสช่วงรอยต่อ"), heading **"2 อย่างที่ต้องได้จากการประชุมวันนี้"** (counted from the list), and under the cards a quiet green ✓ chip (not a third card), text from `pricing.ts` (`stockNote`): "ไฟล์ Excel สต็อก: ได้รับแล้ว ✓ · ขอเพิ่ม 2 คอลัมน์ ราคาขาย + กลุ่มค่าคอม ก่อนเริ่มขายผ่านระบบ". The 3rd item "ข้อมูลชุดแรก" is gone. (I also gave the two cards fitting icons; nothing else on the slide.)
- tsc 0 · build 0. `grep -c` on `dist/index.html`: `ข้อมูลชุดแรก|จำนวนคงเหลือ` = **0** · `ได้รับแล้ว ✓` = **1** · `ขวัญ` = 0 · `ราคาคิดอย่างไร` = 0 · the method numbers (`73000|73,000|\b263\b|\b149\b|เท่ากับโปรแกรมเมอร์|ขนาดของงาน`) = 0. Slide 12 screenshot looked at (1920×1080): two cards, the chip below, nothing clipped, the ✓ renders.
**CLIP — new `meeting-clip/out/meeting-clip.mp4`: 270.92 s (4 min 31 s) · 9,322,314 B · md5 `437d6721e82aa4456aace463bfc0d913`.**
- **`--regen`: §4 → §8.2 → §8.3 (scene 3) → §8.4 (scenes 1 and 6 ONLY; the scene-7 replacement is retired, the exactly-once rule stays for 1 and 6, now "expected 2") → §8.6 (scene 7 whole).** Hash `b4cccfb7…`. Word-for-word check passes: `7 scenes, 66 chunks … equal to the REQ`, scene 7 against §8.6.
- `grep` of `src/script.ts`: `ขวัญ` = **0** · `สองคอลัมน์` = **1** · `ไฟล์ Excel รายการสินค้าจริง` = **0**.
- **Plain `npm run render` (walkthrough on) exit 0.** `scene durations (s): 1=29.25 2=101.87 3=16.91 4=30.34 5=21.69 6=37.24 7=33.62` · **scenes 1–6 identical to the last render**, only scene 7 changed (27.49 → 33.62) · total 270.92 s ("about 4–5 min" ✓) · dist md5s: deck `c79d68fe…`, final-ui `1d0ce1f6…`, both unchanged at start and end · render 200 s.
- Frame `scene-7.png` looked at: slide 12 with the chip, subtitle "ส่วนไฟล์ Excel สต็อกที่ส่งมา เราได้รับแล้วครับ" in the band, nothing covered. The other frames are re-made by the same pipeline; I did not re-read them.
- Same limits: I can't hear it, and I did not re-run Chrome or open Windows Media Player on this file (the last full playback checks were on earlier renders of the same pipeline). My open item stands: scene 5's §4 line "ตามขนาดของงานครับ".
**Both frozen.** Ball: Sober.

**Sober, 2026-11-03 (add-on 4): DONE.** MP4 md5 `437d6721e82aa4456aace463bfc0d913`, 270.9 s (4 min 31 s), on deck `c79d68fe…`; final-ui `1d0ce1f6…`.
- Scenes 1–6 = the last render (29.25 · 101.87 · 16.91 · 30.34 · 21.69 · 37.24 s); scene 7 = 33.62 s.
- Script: `ขวัญ` 0 · `สองคอลัมน์` 1 · the old Excel line 0 · the method 0.
- The scene-7 frame was looked at. Frozen.
