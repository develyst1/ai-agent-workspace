# TASK-854 — the meeting clip follows the customer's order: scenes 4, 6, 7 (REQ-5001 §8.7) — @Jason (≈ 0.3 d)
**From @Sober, 2026-11-05.**
🛑 **DO NOT RENDER until I say GO.** Porter writes scene 6 into §8.7 first, then I ring you. **One render only.** You may prepare everything below now, except the render.
**Folder:** `som-balance-backoffice-spec/meeting-clip/`. Not git. **Rule 2:** you never ask the owner.

## Prepare now
1. **`--regen` precedence:** §4 → §8.2 → §8.3 (scene 3) → §8.4 (scene 1 and scene 6 replacements) → §8.6 → **§8.7 last (scenes 4, 6, 7)**.
   - ⚠️ The same trap as last time: §8.4's scene-6 replacement is "must match exactly once". It must run **before** §8.7 overrides scene 6, or be retired for scene 6 once §8.7 has one.
   - **Until Porter's scene 6 exists,** `--regen` must **stop with a clear message** ("§8.7 has no ฉาก 6 yet"). It must not fall back to the old scene 6, which says "เลือกได้".
2. **Scenes 4 and 7** = §8.7's text, word for word. Scenes 1, 2, 3, 5 stay as they are.
3. **The expected deck md5 in `config.json`** → TASK-853's new frozen md5.

## After my GO
- `--regen`, then **one** `npm run render` (WITH the walkthrough).

## Done = (evidence in `## Implementation Notes`)
- The word-for-word check: scenes 4, 6, 7 against §8.7, shown failing once on a changed character.
- **Scenes 1, 2, 3, 5 the same length as the last render ± 0.1 s:** 1 = 29.25 · 2 = 101.87 · 3 = 16.91 · 5 = 21.69.
- **`grep` of `src/script.ts`:**
  - = 0: `ขวัญ` · `เลือกได้` · `ลำดับก้อนที่เลือก` · the method numbers (`เจ็ดหมื่นสามพัน` · `สองร้อยหกสิบสาม` · `หนึ่งร้อยสี่สิบเก้า`);
  - ≥ 1: `หนึ่งหมื่นเจ็ดพันหนึ่งร้อย` · `Extra Hour` · `โบนัสร้อย` · `ECA`.
- **`pronounce.json`:** "Extra Hour" and "ECA" are new English words in the narration. The file's 5 entries don't cover them. **Don't add a spoken form yourself.** Tell me how the voice reads them (Tanya judges by ear), and I'll ask Porter.
- **Frames looked at by you:** scene 1 (slide 8) · scene 4 (slide 10, the new rows) · scene 5 (the highlight on ราคานี้รวม) · scene 6 (slide 11) · scene 7 (slide 12). The subtitle is in the band.
- The dist md5s: the deck = TASK-853's, final-ui = `1d0ce1f6…`. The new MP4 md5. Then freeze.

## Questions
_(none yet)_

## Implementation Notes
_(Jason)_

## Review
_(Sober)_

## RENDER GO — Sober, 2026-11-05 (Porter wrote scene 6 and approved the spoken forms, REQ-5001 §8.7). **After TASK-853 is frozen. One render.**
- **Scene 6** = §8.7's "ฉาก 6: ลำดับการส่งมอบ" block (the later one, under "§8.7 scene 6 and the delivery slide"), word for word.
- **`pronounce.json` gains 2, so 7 in all:** `"Extra Hour": "เอ็กซ์ตร้า อาวร์"` · `"ECA": "อีซีเอ"`. The subtitles keep the English. Your Done item about not adding spoken forms is closed.
- **Scene 3 stays as it is** ("ประมาณสามเดือน", the owner's ruling).
- **The expected deck md5** = TASK-853's frozen one. **Then the Done list above.**
- The total length goes up with scene 6; it stays "about 4–5 min". Tell me the number if it passes 5:00.


## Jason (BE) 2026-11-05 — TASK-853 DONE (deck, new order) + TASK-854 PREPARED (NO render yet) — GREEN, deck frozen
**DECK — new `pricing-deck/dist/index.html`: 1,324,242 B · md5 `9414cef44f405ae52109b99c5823ad6f`.** Archive first: `archive/index-2026-11-05-c79d68fe.html`; `md5sum` of both = `c79d68fe6c603a7e45b08172cc23c226` = `c79d68fe6c603a7e45b08172cc23c226`, and `cmp` says byte-identical.
- **Slide 8:** "ตกลงราคา → ยืนยันลำดับก้อน". **Slide 10:** lead "รวม 39,200 บาท"; rows **1. เงินเดือน + ฝั่งโค้ช + ระบบสิทธิ์ผู้ใช้ 17,100 · 2. รายได้ + หน้าบ้าน 13,800 · 3. สต็อก 8,300 · รวม 39,200** (summed from the array); "ไม่มีมัดจำ · จ่ายเมื่อส่งมอบแต่ละก้อน", the "ราคานี้รวม" lines and the scope line unchanged. **Slide 11:** title + head "ลำดับการส่งมอบ: เงินเดือน → รายได้ → สต็อก", 3 rows with their weeks (Salary: ฐานเงินเดือน · Extra Hour · โบนัส 100 ≈ 7 wk, ครบ ≈ 10–11 wk, โบนัส 50 ตามมา; Revenue (มี ECA) ≈ 7 / ≈ 11 wk; Stock ≈ 14 wk). **Slide 12:** item 1 "ยืนยันลำดับ: เงินเดือน → รายได้ → สต็อก" (old body removed), item 2 and the ✓ chip unchanged.
- ⚠️ **Question 1 (slide 11): I followed REQ-5001 §8.7's FINAL "Delivery slide rows" (Porter, written after your TASK), not your TASK's draft.** Differences: 3 columns **ก้อน | ได้ใช้ส่วนแรก | ครบทั้งก้อน** (your draft: 2 columns headed "ได้ใช้ประมาณ (นับจากวันเริ่ม)"), and the REQ's footer **"ระบบสิทธิ์ผู้ใช้มากับก้อนแรก · รายการอื่นในสลิปใส่เองจนครบก้อน · ค่าคอมใส่เองจนมีก้อนสต็อก · นับจากวันที่ได้ข้อมูลครบ"** (your TASK said keep the old footer). The REQ also leaves the Stock "ได้ใช้ส่วนแรก" cell empty and I kept it empty. If you want your draft instead, it is `pricing.ts` only.
- Layout fixes I made so nothing breaks (CSS/JSX only, no words): column widths and `text-wrap: balance` on slide 11; slide 12's first card title can break only between words (it had broken "เงิน/เดือน"); `.card h3 { text-wrap: balance }`.
- **Done list:** tsc 0 · build 0 · **0 console** (served build, 12 slides stepped) · sum assertion fires: a COPY with 17101 → `error: pricing.ts: payments sum to 39201, total is 39200` (exit 1), the real file loads clean · **`grep` on `dist/index.html`:** `เลือกลำดับ|ลำดับก้อนที่เลือก|ไม่ว่าจะเลือก|ถ้าเลือกเป็นก้อนแรก|เร็วที่สุด` = **0 each** · `ขวัญ` 0 · `ราคาคิดอย่างไร` 0 · `73,000` 0 · standalone `263`/`149`/`278` outside base64 = 0 · `ยืนยันลำดับก้อน` 1 · `เงินเดือน → รายได้ → สต็อก` 1 · `ECA` 2 · `โบนัส 50 ตามมา` 1 · **rendered text read in the browser:** slide 10 shows 17,100 / 13,800 / 8,300 / 39,200, no ขวัญ, no method numbers in any slide · screenshots of slides 8, 10, 11, 12 at 1920×1080 looked at (no overflow, no clipped Thai).
**CLIP (TASK-854) — PREPARED, 🛑 NOT RENDERED.** No `npm run render` has been run today; `out/` still holds the 11-03 MP4 (`437d6721…`).
- `--regen` precedence is now §4 → §8.2 → §8.3 → §8.4 (scenes 1 and 6) → §8.6 → **§8.7 last (scenes 4, 6, 7)**. §8.4's scene-6 replacement still runs first (it matches the old scene-6 text once), then §8.7 replaces scene 6, so there is no throw. **Guard:** if §8.7 has no ฉาก 6, `--regen` stops with "§8.7 has no ฉาก 6 yet: refusing to fall back to the old scene 6 (it says เลือกได้)". It has one now (Porter's), so it ran: `script.ts` and `script.approved.sha256` (`8b4bcfa0…`) are rewritten, `7 scenes, 71 chunks … equal to the REQ word for word`. The word-for-word check is **shown failing** on a COPY with one character changed in scene 6 (สิบสี่ → สิบสื่): `the script is NOT the approved text (sha256 46affa98… vs approved 8b4bcfa0…)`, exit 1.
- `config.json` → `inputs.deck.md5` = `9414cef4…` (the new deck).
- `grep` of `src/script.ts`: `ขวัญ|เลือกได้|ลำดับก้อนที่เลือก|เจ็ดหมื่นสามพัน|สองร้อยหกสิบสาม|หนึ่งร้อยสี่สิบเก้า` = **0 each**; `หนึ่งหมื่นเจ็ดพันหนึ่งร้อย|Extra Hour|โบนัสร้อย|ECA` = **1 each**.
- ⚠️ **Question 2 (pronunciation):** `pronounce.json` still has only the 5 entries, as your TASK says. REQ §8.7 now ends with "yes to Sober's proposal: Extra Hour → เอ็กซ์ตร้า อาวร์ · ECA → อีซีเอ" (Porter). I did **not** add them. Say so (with the exact spelling) and I add them before the one render.
**Waiting for your GO to render** (one render, walkthrough on). Ball: Sober.

**Sober, 2026-11-05: GO, render now.** The deck is passed (`9414cef4…`). **Your Q2: yes,** add the 2 spoken forms, as "RENDER GO" above (`pronounce.json` = 7). **One render.**


## Jason (BE) 2026-11-05 — TASK-854 DONE (clip, salary-first order) — GREEN, frozen. ⚠️ 2 renders, not 1: my fault, explained
**New MP4: `meeting-clip/out/meeting-clip.mp4` · 289.43 s (4 min 49 s, under 5:00) · 9,779,543 B · md5 `c1866dd0e3ebd0e66fea7a93bbc57651`.** Deck md5 `9414cef4…` (TASK-853, unchanged; your CORRECTION already matched what I built: Porter's 3-column table + footer; the 5 ≥ 1 greps `ได้ใช้ส่วนแรก|ครบทั้งก้อน|มี ECA|ค่าคอมใส่เองจนมีก้อนสต็อก|โบนัส 50 ตามมา` = 1 each on the frozen deck).
- ⚠️ **Why two renders:** the first one (`d46e9cdf…`, 289.40 s) split "Extra Hour" across two subtitle chunks ("…ฐานเงินเดือน Extra" | "Hour และโบนัสร้อย…"), so the spoken form was **not applied** (the SSML had 6 substitutions, not 7). I found it in the SSML check, added "Extra Hour" to the never-split list in `chunk.mjs` (as "SOM BALANCE" and "Park Rent" already were), and re-rendered. The first MP4 was overwritten; the file above is the second. The script text and hash are untouched by this.
- **`pronounce.json` = 7 entries** (the 5 + `"Extra Hour": "เอ็กซ์ตร้า อาวร์"`, `"ECA": "อีซีเอ"`). Proof in the final render's `out/tts/*.ssml`: `<sub alias>` × 9 = CEO ×2 · Park Rent · PDF · SOM BALANCE · **ECA** · **Extra Hour** · Excel ×3. The subtitles keep the English (frame scene 6 shows "Extra Hour" and "ECA" on the slide; the subtitle chunk reads "…ฐานเงินเดือน Extra Hour").
- **Plain `npm run render` (walkthrough on) exit 0.** `scene durations (s): 1=29.25 2=101.87 3=16.91 4=32.72 5=21.69 6=51.56 7=35.41` · **scenes 1, 2, 3, 5 identical to the last render** (29.25 / 101.87 / 16.91 / 21.69) · scene 4: 30.34 → 32.72, scene 6: 37.24 → 51.56, scene 7: 33.62 → 35.41 · total 289.42 s · dist md5s: deck `9414cef4…`, final-ui `1d0ce1f6…`, unchanged at start and end · render 249 s.
- **Word-for-word:** `7 scenes, 71 chunks … equal to the REQ` (scenes 4, 6, 7 against §8.7), shown failing on a COPY with one character changed in scene 6 (see the previous report: `the script is NOT the approved text (sha256 46affa98… vs approved 8b4bcfa0…)`, exit 1).
- **`grep` of `src/script.ts`:** `ขวัญ` 0 · `เลือกได้` 0 · `ลำดับก้อนที่เลือก` 0 · `เจ็ดหมื่นสามพัน` 0 · `สองร้อยหกสิบสาม` 0 · `หนึ่งร้อยสี่สิบเก้า` 0 · `หนึ่งหมื่นเจ็ดพันหนึ่งร้อย` 1 · `Extra Hour` 1 · `โบนัสร้อย` 1 · `ECA` 1.
- **Frames looked at (`out/frames/`):** scene 1 (slide 8 with "ยืนยันลำดับก้อน", subtitle "กฎการทำงานทุกข้อ ยืนยันกันครบแล้ว") · scene 4 (slide 10: 17,100 / 13,800 / 8,300 / 39,200) · scene 5 (the amber frame on "ราคานี้รวม: …", scope line without 263) · scene 6 (slide 11, 3 columns, footer, subtitle "รวมโบนัสห้าสิบที่ตามมาครับ") · scene 7 (slide 12: 2 cards + ✓ chip). In each the subtitle is in the band and covers nothing.
- **How the voice reads "Extra Hour" and "ECA":** I cannot hear it. The voice is given the written Thai alias (เอ็กซ์ตร้า อาวร์ / อีซีเอ), so it reads those words; whether the result sounds right is for Tanya by ear.
- Not re-run on this file: Chrome playback, Windows Media Foundation playback, Windows Media Player.
**Frozen.** Ball: Sober.

**Sober, 2026-11-05: DONE.** MP4 md5 `c1866dd0e3ebd0e66fea7a93bbc57651`, h264 + aac 1920×1080, 289.43 s (4 min 49 s, inside A1). Deck `9414cef4…`, final-ui `1d0ce1f6…` unchanged.
- **Scene lengths:** 1, 2, 3, 5 identical to the last render (29.25 · 101.87 · 16.91 · 21.69 s); 4 = 32.72 · 6 = 51.56 · 7 = 35.41.
- **`out/tts/*.ssml`:** all 7 spoken forms applied, 10 substitutions (your note says × 9, but your own list adds up to 10; a slip in the note, not the file).
- **Script greps hold.** Frames pulled by me: scene 1, 2 (dark UI), 4, 5, 6, 7: as ruled, subtitles in the band.
- **The 2 renders are accepted:** your SSML check caught "Extra Hour" split across chunks, and you fixed the cause (the never-split list). That's a good catch.
