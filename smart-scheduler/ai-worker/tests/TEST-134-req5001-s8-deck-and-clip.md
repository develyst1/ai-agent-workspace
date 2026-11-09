# TEST-134: REQ-5001 §8.2–§8.4 + the slide-9 kicker: deck `ac0d60da…` + clip `1645a12e…`

- **QA:** Tanya
- **Date:** 2026-11-03
- **Brief:** Porter's GO in `inbox/QA.md` (2026-11-03, queued after TASK-852)
- **Builds (md5 checked before the run):**
  - deck `pricing-deck/dist/index.html` **`ac0d60da31b68ebc224d0731491ad430`**;
  - clip `meeting-clip/out/meeting-clip.mp4` **`1645a12e1534cefea2f29cf027732cd5`** (4:24.8);
  - final UI `1d0ce1f6…` (unchanged).
- **Against:** REQ-5001 §5 as amended by:
  - §8.2 (scenes 3 / 4 / 6 / 7, AC-2's new number list);
  - §8.3 (no method: scene 3's new text; AC-6 forbids 73,000 / 278 / 263 / 200 / 51 / 149);
  - §8.4 (0 "ขวัญ");
  - the kicker ("4 · ราคา", 0 "ราคาคิดอย่างไร").
- **How:**
  - headless Chrome on the deck;
  - for the clip: ffprobe / ffmpeg, the clip's timeline + SSML, **my own expected narration rebuilt from the REQ text**, 29 frames by eye, real Chrome (headless).

## Verdict: ✅ TEST_PASSED · ⚪ by-ear listening still NOT_TESTED (no Thai speech recognizer on this PC; the click-script in TEST-131 applies)

### Deck `ac0d60da…`
| Check | Result | |
|---|---|---|
| Gate basics | offline (0 network), 0 console / page errors, 12 slides by keys / click, the reload keeps the slide, Noto Sans Thai | ✅ |
| Slide 8 | *"ยืนยันกฎครบแล้ว"* (no คุณขวัญ) · card 3 *"ตกลงราคา → เลือกลำดับก้อน"* | ✅ |
| **Slide 9 + kicker** | kicker **"4 · ราคา"** (footer too); only **39,200 บาท** + *"ประเมินค่าแรงตามเรทเดิมของแพ็กเกจที่ใช้อยู่ ไม่ได้ขึ้นราคา"* + *"เสร็จในประมาณ 3 เดือน"*. **No method** | ✅ |
| Slide 10 | installments **by block**: สต็อก 8,300 · รายได้ + หน้าบ้าน 13,800 · เงินเดือน + ฝั่งโค้ช 13,500 · ระบบสิทธิ์ผู้ใช้ (จ่ายพร้อมก้อนแรก) 3,600 = **39,200**; *"จ่ายเมื่อส่งมอบแต่ละก้อน"*; the scope line is now *"ขอเพิ่มภายหลังคิดเรทเดิม ตามขนาดงาน"* (**263 dropped**) | ✅ |
| **Slide 11 = the agenda's weeks** | *"เลือกลำดับได้"*; Stock 4 (fastest) / 7–8 · Revenue 6 (or branch + payment method first 3–4, one or the other) / 10 · Salary 5–6 / 10–11; *"ทั้งหมดประมาณ 3 เดือน · นับจากวันที่ได้ข้อมูลครบ"*. Identical to the agenda (TEST-132 / 133) | ✅ |
| Slide 12 | *"3 อย่าง"*: ลำดับก้อนที่เลือก · วันที่จะเริ่มใช้ระบบ · ข้อมูลชุดแรก | ✅ |
| **Whole-deck scan** (rendered text of all 12 slides **and** every UI string in the file) | **0** of 73,000 / 278 / 263 / 200 วัน / 51 / 149 · **0 "ขวัญ"** · **0 "ราคาคิดอย่างไร"** · 0 "2–3 เดือน" · 0 11,900 · 0 old 4–5 weeks · 0 AI · 0 ไม่มีส่วนลด · 0 25,700 | ✅ |
| Slides 1–7 | identical to round 4 (`604bde02…`) | ✅ |
| Old build archived | `pricing-deck/archive/index-2026-11-03-604bde02.html` | ✅ |

### Clip `1645a12e…`
| AC | Result | |
|---|---|---|
| **1** | H.264 High yuv420p 1920×1080 + AAC-LC 48 kHz stereo, **4:24.8**; the longest silences are 2.91 / 2.92 s (scene breaks only). **Chrome:** plays, 154 frames in 3 s (2 dropped, headless), audio decoded, seeks, **`ended`**, no error | ✅ |
| **2: the words** | **my own expected narration**, built from the REQ (§4 scenes 1 / 2 / 5 · §8.3 scene 3 · §8.2 scenes 4 / 6 / 7 · the 3 §8.4 swaps applied in scenes 1 / 6 / 7), = **the clip's subtitle chunks, word for word, in all 7 scenes**. The voice got exactly those chunks + only the 5 approved spoken forms (ส้มบาลานซ์ ×1 · ซีอีโอ ×2 · เอ็กเซล ×3 · พีดีเอฟ ×1 · พาร์ค เร้นท์ ×1) | ✅ |
| **2: the new numbers** | spoken as Thai words: สามหมื่นเก้าพันสองร้อย · แปดพันสามร้อย · หนึ่งหมื่นสามพันแปดร้อย · หนึ่งหมื่นสามพันห้าร้อย · สามพันหกร้อย · หกเดือน · ประมาณสามเดือน · ประมาณสี่ / เจ็ดถึงแปด / หก / สิบ / ห้าถึงหก / สิบถึงสิบเอ็ด สัปดาห์ (= AC-2's new list exactly; the F1 + F2 "3–4" option is on slide 11, not in the §8.2 narration, as written) | ✅ |
| **3** | the subtitle shown = the chunk being spoken (frames); 1 line, in its own band below the picture, Thai marks intact | ✅ |
| **4** | scene 1 = slides 1 → 8 (*"ยืนยันกฎครบแล้ว"*) · 2 = slide 2 + the UI walkthrough (unchanged text, 14 cues) · **3 = the new slide 9** · **4 = the new slide 10 (by block)** · 5 = slide 10 with "ราคานี้รวม" highlighted · **6 = the new slide 11** · **7 = the new slide 12 (3 items)**. All from deck `ac0d60da…` | ✅ |
| **5** | UI dark, invented names (scene 2 unchanged) | ✅ |
| **6 (+ §8.3 / §8.4)** | **0** of เจ็ดหมื่นสามพัน / สองร้อยเจ็ดสิบแปด / สองร้อยหกสิบสาม / สองร้อยวัน / ห้าสิบเอ็ด / หนึ่งร้อยสี่สิบเก้า in sound + subtitles; **0 "ขวัญ"**; 0 สองถึงสามเดือน / 11,900 / old weeks / AI / เครื่องมือช่วย / ไม่มีส่วนลด / 25,700 / +1,300 / ระวัง / ถาม–ตอบ. On screen: the deck scan above. Scene 2's ordinary UI mock amounts are not "the method" (Sober's note) | ✅ |
| **8** | final UI `1d0ce1f6…` unchanged; the deck is the new frozen `ac0d60da…` (AC-8's old deck md5 is superseded by §8's rulings) | ✅ |
| Scene 2 unchanged | its 25 chunks = §4 word for word, as before | ✅ |

## NOT_TESTED
- **By ear** (the new scenes 1 / 3 / 4 / 6 / 7, the numbers, "ส้มบาลานซ์"): this PC has no Thai speech recognizer.
- **What I proved instead:** the exact text the voice got, and that it is the REQ word for word.
- **Settles it:** the owner listens once (TEST-131's click-script). The voice is still Pattara, the only th-TH male voice.

## Test data created
- None (read only; the preview / browser ran headless; no re-render).

## Evidence
1. **The rebuilt-from-REQ narration = the clip's chunks in all 7 scenes** (`scan2.mjs` + `s3.mjs`), and the SSML = the chunks + only the 5 approved swaps. This proves AC-2's words.
2. **The whole-deck scan:** 0 method numbers, 0 "ขวัญ", 0 "ราคาคิดอย่างไร", in the rendered text and in the file. This proves §8.3, §8.4 and the kicker.
3. **The frames of scenes 3, 4, 6 and 7** show the new slides 9 / 10 / 11 / 12 under their own sentences. This proves AC-4.


---
## Delta: §8.6 (deck `c79d68fe6c603a7e45b08172cc23c226` + clip `437d6721e82aa4456aace463bfc0d913`, 2026-11-03): ✅ TEST_PASSED
- **The md5s were checked before the run;** final UI `1d0ce1f6…` unchanged.
- **Deck:**
  - **only slide 12 changed** (all 12 slides' text compared with TEST-134's build);
  - it now reads *"2 อย่างที่ต้องได้จากการประชุมวันนี้"*: 1. ลำดับก้อนที่เลือก · 2. วันที่จะเริ่มใช้ระบบ (…โบนัสช่วงรอยต่อ), with the note **"ไฟล์ Excel สต็อก: ได้รับแล้ว ✓ · ขอเพิ่ม 2 คอลัมน์ ราคาขาย + กลุ่มค่าคอม ก่อนเริ่มขายผ่านระบบ"**. That's §8.6 exactly.
  - Offline, 0 errors, 12 slides.
- **Clip (4:30.9):**
  - **scene 7 = §8.6's narration, word for word** (8 chunks: *"สุดท้าย มีสองอย่าง…"* … *"…ก่อนเริ่มขายผ่านระบบครับ ขอบคุณครับ"*);
  - **"สองคอลัมน์"** is spoken (AC-2's addition);
  - **scenes 1–6 are unchanged**, word for word (§4 / §8.2 / §8.3 / §8.4 as in TEST-134; the same durations);
  - the SSML still = the chunks + only the 5 approved swaps;
  - the frames show slide 12 (new) under scene 7's sentences, with the subtitle in its own band.
- **Every earlier zero holds:**
  - **deck** (rendered + file strings): 0 method numbers, 0 "ขวัญ", 0 "ราคาคิดอย่างไร", 0 "2–3 เดือน";
  - **clip** (sound + subtitles): the same, + 0 11,900 / old weeks / AI / ไม่มีส่วนลด / 25,700 / ระวัง.
- **Chrome:** 270.9 s, plays (0 dropped), seeks, **`ended`**, no error.
- **By ear:** still NOT_TESTED (no Thai recognizer); the owner's listen per TEST-131.


---
## Delta: §8.7, the customer's order (deck `9414cef44f405ae52109b99c5823ad6f` + clip `c1866dd0e3ebd0e66fea7a93bbc57651`, 2026-11-05): ✅ TEST_PASSED, by-ear NOT_TESTED
- **The md5s were checked before the run;** final UI `dist` `1d0ce1f6…` unchanged.
- **Deck (12 slides, offline, 0 network, 0 console / page errors; keys and reload at `#/slide/7` work; font loaded):**
  - **only slides 8, 10, 11, 12 changed** from the §8.6 build (all 12 slides' text compared);
  - **slide 8:** "ขั้นต่อไป: ตกลงราคา → ยืนยันลำดับก้อน";
  - **slide 10:** lead "รวม 39,200 บาท"; rows 1. เงินเดือน + ฝั่งโค้ช + ระบบสิทธิ์ผู้ใช้ 17,100 · 2. รายได้ + หน้าบ้าน 13,800 · 3. สต็อก 8,300; รวม 39,200. The sum is right, and 13,500 + 3,600 = 17,100;
  - **slide 11:** title "ลำดับการส่งมอบ: เงินเดือน → รายได้ → สต็อก"; the rows and footer = §8.7's table, character for character, with Stock's first-slice cell blank as specified;
  - **slide 12:** item 1 "ยืนยันลำดับ: เงินเดือน → รายได้ → สต็อก"; item 2 and the Excel note unchanged.
- **Delivery table against DELIVERY-FACTS 2026-11-05 (both SAs' sections):** Salary slice ≈ wk 7 ✓ · whole Salary wk 10–11 ✓ · Revenue wk 7 ✓ · whole Revenue wk 11 ✓ · Stock ≈ wk 14 ✓ · Roles with the first block ✓ · other slip items by hand until the block is whole ✓ · commission by hand until Stock ✓ · Bonus 50 later ✓ · ECA in Revenue ✓. F5 stays in Revenue's price (§8.7), so 13,800 is right.
- **Clip (4:49.4, 1920×1080, 30 fps, h264 + aac):**
  - **every scene was compared with my own text built from the REQ:** scenes 4, 6, 7 = §8.7, word for word (8 / 13 / 8 chunks); scene 1 = §4 + the §8.4 swap; scene 2 and scene 5 = §4; scene 3 = §8.3;
  - **AC-2:** หนึ่งหมื่นเจ็ดพันหนึ่งร้อย, สามหมื่นเก้าพันสองร้อย, หมื่นสามพันห้าร้อย, สามพันหกร้อย, หมื่นสามพันแปดร้อย, แปดพันสามร้อย, Extra Hour, โบนัสร้อย, โบนัสห้าสิบ, ECA, เจ็ด / สิบถึงสิบเอ็ด / สิบเอ็ด / สัปดาห์ที่สิบสี่, สองคอลัมน์: all there;
  - **SSML = the chunks + the 7 approved swaps only.** Extra Hour → "เอ็กซ์ตร้า อาวร์" once (s6c03), ECA → "อีซีเอ" once (s6c08), no Latin left for the voice to read raw; subtitles keep the English; every wav is newer than its SSML;
  - **frames:** slide 10 under scene 4, slide 11 under scene 6, slide 12 under scene 7, slide 8 under scene 1's late lines; subtitles in their own band, none clipped;
  - **sound:** no gap inside a scene beyond the planned pauses (≈ 1.5 s between parts of scene 2, ≈ 2.9 s between scenes, ≈ 2 s at the end); peak −0.5 dB;
  - **Chrome:** 289.4 s, plays, seeks, `ended`, no error.
- **Zero scan (deck rendered + file strings; clip sound + subtitles):** 0 "เลือกได้", 0 "ไม่ว่าจะเลือกลำดับไหน", 0 "ก้อนไหนก่อน", 0 Stock-first wording, 0 old weeks (3–4, 4, 4–5, 5–6, 6, 7–8, 10), 0 11,900; the deck shows no 13,500 / 3,600 row. 0 method numbers, 0 "ขวัญ", 0 "ราคาคิดอย่างไร", 0 "2–3 เดือน", 0 AI, 0 ไม่มีส่วนลด, 0 25,700, 0 ระวัง. The word "เลือก" remains only in "เลือกโค้ชที่ขาย", "เลือกวิธีชำระเงิน" and "เลือกสินค้าลงตะกร้า", which are product steps, not the order.
- **By ear: NOT_TESTED.** No Thai speech recognizer on this PC, and I don't open a visible player. Text, SSML and timing can't prove how a word sounds, so this stays the owner's. Windows' default player also stays with his click-script (TEST-131). Where to listen:
  - scene 4: 2:29–3:02; scene 6: 3:23–4:15; scene 7: 4:15–4:49;
  - "เอ็กซ์ตร้า อาวร์": 3:31–3:35; "อีซีเอ": 3:49–3:55.
- **Not re-run:** the on-screen buttons click-through and the rebuild command (AC-7).
- ⚪ **Not defects, for Porter's eye:**
  1. Scene 3 and slide 9 say "ประมาณ 3 เดือน" and scene 6 / slide 11 say "ประมาณสัปดาห์ที่สิบสี่", ≈ 3¼ months, heard in the same clip. As ruled in §8.7.
  2. Scene 6 says "โบนัสร้อย ได้ใช้ในประมาณเจ็ดสัปดาห์", while DELIVERY-FACTS' ⚠️ says that under the plan default (B) Bonus 100 pays little or nothing on the early slips. The customer's A / B answer is still open.
  3. Scene 1 says today leaves two things, "ตกลงราคา และกำหนดวันเริ่ม"; scene 7's two are the order and the start date. Scene 1 is unchanged per §8.7.
