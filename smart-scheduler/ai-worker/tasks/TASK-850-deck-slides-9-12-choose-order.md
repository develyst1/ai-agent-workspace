# TASK-850 — the pricing deck, slides 9–12: "about 3 months" + installments by block + she chooses the order (REQ-5001 §8 part 2) — @Jason (≈ 0.4 d)
**From @Sober, 2026-11-03. GO now. Do this BEFORE TASK-851** (the clip captures these slides). Target: done **Wed 11-04 midday**.
**Why:** the owner, 2026-11-03: *"ได้ทั้ง 2 ข้อ ประมาณ 3 เดือน งวดตามก้อน"*. Facts: `DELIVERY-FACTS-REQ-5001-s8-part-order-2026-11-03.md` (FINAL).
**The wording source** (copy its text and numbers exactly; never retype or reword): `COPY-DRAFT-khwan-meeting-agenda-2026-11-07.md` §ข้อ 4 + §ข้อ 5 (Tanya passed it).
**Folder:** `som-balance-backoffice-spec/pricing-deck/` (your TASK-846 code). Not git. **Rule 2:** you never ask the owner. Questions go below, to me.

## 0. First: archive the current build, verbatim
- `pricing-deck/dist/index.html` (md5 `604bde02235715366734c053509b311f`) → `pricing-deck/archive/index-2026-11-03-604bde02.html` (a byte copy).
- Paste both md5s; they must be equal.
- `final-ui/` does not change in this TASK. Don't touch it.

## 1. The changes (keep the look; change only these; every number in `pricing.ts`)
1. **Slide 9:**
   - "เสร็จใน 2–3 เดือน" → **"เสร็จในประมาณ 3 เดือน"**;
   - **also drop "และมีเครื่องมือช่วยให้ทำเร็วขึ้น"** from the same line. That is my default, matching Porter's §8.2 note that drops the phrase from scene 3. Porter may veto it; it's one line in `pricing.ts`.
   - The rest of slide 9 is unchanged.
2. **Slide 10:**
   - the installment table → **"จ่ายตามก้อนที่ได้รับ"**, rows exactly as the copy's ข้อ 5: สต็อก 8,300 · รายได้ + หน้าบ้าน 13,800 · เงินเดือน + ฝั่งโค้ช 13,500 · ระบบสิทธิ์ผู้ใช้ (จ่ายพร้อมก้อนแรก) 3,600;
   - a total row of **39,200**, summed from the array and asserted = `total` (as now);
   - **keep** "ไม่มีมัดจำ", the "ราคานี้รวม …" lines and the scope line, **unchanged**. Scene 5's highlight finds "ราคานี้รวม" by its text, so keep that text and element.
3. **Slide 11:**
   - "เริ่มจาก Stock …" → the copy's ข้อ 4 table: the 3 blocks, each with "ถ้าเลือกเป็นก้อนแรก ได้ใช้ประมาณ" in the copy's own words:
     - สต็อก: ส่วนแรกประมาณ 4 สัปดาห์ (เร็วที่สุด) · ครบทั้งก้อนประมาณ 7–8 สัปดาห์;
     - รายได้ + หน้าบ้าน: ประมาณ 6 สัปดาห์ (หรือสาขา + วิธีชำระเงินก่อน 3–4 สัปดาห์ เลือกได้อย่างใดอย่างหนึ่ง) · ครบทั้งก้อนประมาณ 10 สัปดาห์;
     - เงินเดือน + ฝั่งโค้ช: สลิปแรกประมาณ 5–6 สัปดาห์ · ครบทุกรายการ รวมโบนัส ประมาณ 10–11 สัปดาห์;
   - the heading says she chooses: exactly **"ขวัญเลือกลำดับได้"** (Porter's GO);
   - a footer: **"ระบบสิทธิ์ผู้ใช้มากับก้อนแรก · ทั้งหมดประมาณ 3 เดือน · นับจากวันที่ได้ข้อมูลครบ"**.
   - The table must fit one slide at 1920×1080, readable; no text under 22 px.
4. **Slide 12:** add **"ลำดับก้อนที่ขวัญเลือก"** as the **first** item. The heading counts from the list ⇒ "3 อย่าง".

## Done = (evidence in `## Implementation Notes`)
- The archive md5 = `604bde02…`.
- tsc 0 · build 0 · 0 console · the payment sum assertion still fires on a wrong number (show once, revert).
- `grep -c` of the new `dist/index.html`:
  - for `2–3 เดือน|เริ่มจาก Stock|11,900|3–4 สัปดาห์ งวด|เครื่องมือช่วย` = 0;
  - for `ประมาณ 3 เดือน|8,300|ขวัญเลือกลำดับได้|ลำดับก้อนที่ขวัญเลือก` ≥ 1 each.
- Screenshots of slides 9–12 at 1920×1080, looked at by you (no overflow, no clipped Thai).
- The new md5. Then freeze.

## Questions
**To @Sober (Jason, 2026-11-03).** Two lines outside slides 9–12 had to change for your grep `เริ่มจาก Stock` = 0 to hold. I did the minimum and I need your yes:
1. **Slide 8, card 3 (was "ตกลงราคา → เริ่มจาก Stock")** → now **"ตกลงราคา → เลือกลำดับก้อน"** (words from the copy's own "ขวัญเลือกลำดับได้" / "ลำดับก้อน"). If you prefer other words, it is one string in `slides.tsx`.
2. **Slide 12, card for the data (was "ไฟล์ Excel สินค้าจริง + จำนวนคงเหลือ (เริ่มจาก Stock)")** → the parenthetical is **dropped** (a deletion only). Card 1's body "อยากได้ก้อนไหนก่อน ก้อนไหนหลัง" is the copy's own words (ข้อ 4 heading), as your TASK gave only the title.
Also: your default for slide 9 (drop "และมีเครื่องมือช่วยให้ทำเร็วขึ้น") is applied; if Porter vetoes it, `showToolsPhrase = true` in `pricing.ts` brings it back (one line, one rebuild).

## Implementation Notes
_(Jason, 2026-11-03.)_
**0. Archive:** `pricing-deck/archive/index-2026-11-03-604bde02.html`. `md5sum` of both: `604bde02235715366734c053509b311f` = `604bde02235715366734c053509b311f`, and `cmp` says byte-identical. `final-ui/` untouched.
**Changes (all numbers in `pricing.ts`, wording from COPY-DRAFT-khwan-meeting-agenda-2026-11-07 ข้อ 4 + 5, copied not reworded):**
- **Slide 9:** "เสร็จในประมาณ 3 เดือน เพราะมี 2 ทีมทำพร้อมกัน มีการตรวจทานและทดสอบ · ทุกตัวเลขมีคนตรวจซ้ำ" (`comparison.deliverText`, `showToolsPhrase=false`). Rest unchanged.
- **Slide 10:** heading **"จ่ายตามก้อนที่ได้รับ"**, lead "รวม 39,200 บาทเท่าเดิม ไม่ว่าจะเลือกลำดับไหน" (ข้อ 5's own words), table ก้อน | ราคา: สต็อก 8,300 · รายได้ + หน้าบ้าน 13,800 · เงินเดือน + ฝั่งโค้ช 13,500 · ระบบสิทธิ์ผู้ใช้ (จ่ายพร้อมก้อนแรก) 3,600 · **รวม 39,200** (summed from the array). "ไม่มีมัดจำ", the "ราคานี้รวม:" element and the scope line are unchanged (same element, so scene 5's highlight still finds it). Row padding tightened (`table.t.tight`) so the extra row fits.
- **Slide 11:** heading **"ขวัญเลือกลำดับได้"**; table "ก้อน | ถ้าเลือกเป็นก้อนแรก ได้ใช้ประมาณ" with the 3 blocks, each: the first-run line, then the "ครบ…" line; footer **"ระบบสิทธิ์ผู้ใช้มากับก้อนแรก · ทั้งหมดประมาณ 3 เดือน · นับจากวันที่ได้ข้อมูลครบ"**.
- **Slide 12:** first item **"ลำดับก้อนที่ขวัญเลือก"**; the heading counts from the list ⇒ "3 อย่างที่ต้องได้จากการประชุมวันนี้".
**Done list:**
- `tsc` 0 · build 0 · **0 console** (served build, all 12 slides stepped). Smallest text on any slide: **26 px** (≥ 22).
- **Sum assertion fires on a wrong number** (a COPY of `pricing.ts` with สต็อก 8301, run with bun): `error: pricing.ts: payments sum to 39201, total is 39200` (exit 1); the real file loads clean (exit 0). Original untouched.
- `grep -c` on the new `dist/index.html`: `2–3 เดือน|เริ่มจาก Stock|11,900|3–4 สัปดาห์ งวด|เครื่องมือช่วย` = **0**. `ประมาณ 3 เดือน` = 1 · `ขวัญเลือกลำดับได้` = 1 · `ลำดับก้อนที่ขวัญเลือก` = 1 (the file is one line, so `grep -c` counts 1 per pattern). ⚠️ **`8,300` = 0 in the file** because the page formats `8300` at run time (`baht()`); it is on screen: the DOM text of slide 10 reads "สต็อก 8,300" (and the picture shows it). Same reason `13,500` never appears as such in the file.
- **Slides 9–12 at 1920×1080 looked at by me:** slide 10 fits with the scope line ending at y ≈ 1000 of 1080; slide 11's table and footer fit; slide 12 shows 3 cards; slide 9 unchanged but for the one line. No overflow, no clipped Thai.
- **New `pricing-deck/dist/index.html`: 1,326,591 B · md5 `7b677d23f75e8001d3882fac5d4d1282`.** Frozen (no more rebuilds unless you ask). **Review the 2 questions above before it goes to the clip:** TASK-851 reads this md5 from `config.json`, so a change is one edit plus a re-render.

## Review
_(Sober)_

**Sober, 2026-11-03: DONE** (the 2 wording changes below go to the PM for his OK; they don't block TASK-851).
- **Checked:**
  - dist md5 `7b677d23f75e8001d3882fac5d4d1282`; archive `index-2026-11-03-604bde02.html` = `604bde02…` ✓; tsc 0;
  - slides 8–12 read in the browser, console 0. Slide 9 says "เสร็จในประมาณ 3 เดือน" (the tools phrase gone). Slide 10 has the 4 rows + 39,200, "ไม่มีมัดจำ" and "ราคานี้รวม" unchanged. Slide 11 (screenshot): the 3 blocks with the copy's weeks + the footer. Slide 12: 3 items, "ลำดับก้อนที่ขวัญเลือก" first;
  - `8,300` doesn't appear in the dist because numbers are formatted at run time, so my grep for it was naive; the rendered slide shows it.
- **Your Q1 + Q2:**
  - **my grep was too broad** (it reached slides 8 and 12, outside the GO list). Your minimal changes are right: both lines would otherwise contradict "she chooses";
  - they're customer wording, so I've sent them to Porter for his yes.

## ADD-ON 1 — Sober, 2026-11-03: the owner removes the pricing METHOD (REQ-5001 §8.3). **TASK-850 reopened**
- **Owner, verbatim:** *"ตรง วิธีคิด เก็บไว้ เป็น เผื่อเขาถามค่อยบอกเถอะ บอก แค่ ราคา และบอกว่าคิดจากราคาเดิม …"*
- **Slide 9** shows ONLY:
  - **39,200 บาท**;
  - **"ประเมินค่าแรงตามเรทเดิมของแพ็กเกจที่ใช้อยู่ ไม่ได้ขึ้นราคา"**;
  - **"เสร็จในประมาณ 3 เดือน"** (keep the rest of that line: "เพราะมี 2 ทีมทำพร้อมกัน มีการตรวจทานและทดสอบ · ทุกตัวเลขมีคนตรวจซ้ำ").
  - **Remove:** 73,000 / 278 / 263 / 200 / 51 / 149, the 149 × 263 equation boxes, the "149 วันทำงาน คือขนาดของงาน …" line, and the "(เท่ากับโปรแกรมเมอร์ 1 คน … 7 เดือน)" comparison.
  - Keep the slide's title / kicker look. If "ใช้เรทเดิม ไม่ขึ้นราคา" remains as the title, fine.
- **Slide 10, the scope line:**
  - "ขอเพิ่มภายหลังคิดเรทเดิม **(263 บาท/วัน)** ตามขนาดงาน" → drop the bracket, giving **"ขอเพิ่มภายหลังคิดเรทเดิม ตามขนาดงาน"**.
  - `[SA-decided]`: AC-6 now says 263 appears nowhere. Porter is told.
- **Delete, don't hide:** remove `rate`, `work`, `comparison` and `extraRatePerDay` from `pricing.ts` and every use. Nothing of the method may be **bundled** (the A/B/C lesson of 10-27).
- **Done =**
  - tsc 0 · build 0 · console 0;
  - **in `dist/index.html`, no `73000|73,000|278|\b263\b|\b149\b|51 วัน|200 วัน|เท่ากับโปรแกรมเมอร์|ขนาดของงาน`** (show the grep). Anything left must be a non-method value that you name; e.g. a CSS number is fine;
  - slides 9 and 10 looked at;
  - the new md5. Then freeze. TASK-851 then re-renders on that md5.
- **Add-on 1, line 4 (Porter's yes, 11-03):** slide 10 "ไม่มีมัดจำ · จ่ายเมื่อส่งมอบแต่ละส่วน" → **"… จ่ายเมื่อส่งมอบแต่ละก้อน"**. Porter also said yes to your slide 8 ("ตกลงราคา → เลือกลำดับก้อน") and slide 12 (the dropped "(เริ่มจาก Stock)"): keep both.

## ADD-ON 2 — Sober, 2026-11-03: no "ขวัญ" anywhere (REQ-5001 §8.4, owner-approved). Do it in the SAME rebuild as add-on 1
- **Owner, verbatim:** *"เลิกอ้างขวัญสักที คนตัดสินมีหลายคน ขวัญแค่พนักงานคนนึง …"*
- Exactly:
  - slide 8 "คุณขวัญยืนยันกฎครบแล้ว" → **"ยืนยันกฎครบแล้ว"**;
  - slide 11 "ขวัญเลือกลำดับได้" → **"เลือกลำดับได้"**;
  - slide 12 "ลำดับก้อนที่ขวัญเลือก" → **"ลำดับก้อนที่เลือก"**.
- The current dist has **4** hits; "ขวัญเลือกลำดับได้" is there twice. **`grep -c ขวัญ dist/index.html` = 0** is the Done check, whatever the source of a hit.


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

**Sober, 2026-11-03 (add-ons 1 + 2 review): DONE.**
- Deck md5 `afd90aaf065e5ddc747f3c5a5c558002`.
- My greps of the built file: `ขวัญ` · `73,000` / `73000` · standalone `278` / `263` / `149` · `51 วัน` · `200 วัน` · `เท่ากับโปรแกรมเมอร์` · `ขนาดของงาน` · `แต่ละส่วน` · `เริ่มจาก Stock` = **all 0**.
- The rendered slides 8–12 (frames from the MP4) are as ruled.

## ADD-ON 3 — Sober, 2026-11-03 (Porter's yes: slide 9's kicker → "4 · ราคา")
- `slides.tsx` has **three** "ราคาคิดอย่างไร", and all three change:
  - l.127 `section` "4 · ราคาคิดอย่างไร" → **"4 · ราคา"** (the footer label);
  - l.128 `title` "ราคาคิดอย่างไร" → **"ราคา"**;
  - l.131 the `Head` kicker → **"4 · ราคา"**.
  - Nothing else on the slide changes.
- **Done =** `grep -c ราคาคิดอย่างไร dist/index.html` = 0 · tsc 0 · build 0 · the slide-9 frame · the new md5. Then TASK-851 = **one** re-render on it (the expected deck md5 in `config.json`), with the same checks, and the new MP4 md5. Then freeze both.


## Jason (BE) 2026-11-03 — TASK-850 ADD-ON 3 + the one TASK-851 re-render DONE — GREEN, both frozen
- **Deck (add-on 3):** the three "ราคาคิดอย่างไร" in `slides.tsx` are now `section` "4 · ราคา", `title` "ราคา" and the `Head` kicker "4 · ราคา"; nothing else changed. tsc 0 · build 0 · `grep -c ราคาคิดอย่างไร dist/index.html` = **0** (and `ขวัญ` still 0). Slide 9 looked at (1920×1080): kicker "4 · ราคา", the HUD label "9 / 12 4 · ราคา", the rest as before. I did not re-step the 12 slides for console this time (a string change). **New `dist/index.html`: 1,324,631 B · md5 `ac0d60da31b68ebc224d0731491ad430`.**
- **Clip:** `config.json` → `inputs.deck.md5` set to it; ONE plain `npm run render` (walkthrough on) exit 0. `scene durations (s): 1=29.25 2=101.87 3=16.91 4=30.34 5=21.69 6=37.24 7=27.49` (**identical to the last render**), total 264.79 s, dist md5s printed at start and end: deck `ac0d60da…`, final-ui `1d0ce1f6…`, both unchanged. Script unchanged (hash `25aeef53…`, 64 chunks, word-for-word passed). Frame `scene-3.png` (the new slide 9 with the "4 · ราคา" kicker) looked at; the other frames are re-made from the same pipeline.
- **New MP4: `meeting-clip/out/meeting-clip.mp4` · 264.80 s · 9,181,591 B · md5 `1645a12e1534cefea2f29cf027732cd5`** (replaces `6eeba8da…`).
- Same limits as before: I cannot hear it, and I did not re-open Windows Media Player or Chrome on this file. My open item from the last report stands (scene 5's §4 line "ตามขนาดของงานครับ", left untouched).
**Both frozen.** Ball: Sober.

**Sober, 2026-11-03 (add-on 3): DONE.** Deck md5 `ac0d60da31b68ebc224d0731491ad430`. `ราคาคิดอย่างไร` = 0, `4 · ราคา` = 2 (the kicker + the footer). `ขวัญ` / 263 / 149 / 73,000 = 0. The slide-9 frame from the MP4 was looked at. Frozen.

## ADD-ON 4 — Sober, 2026-11-03: slide 12 stops asking for the stock file (REQ-5001 §8.6; Porter's GO). Only slide 12 changes
- `needs` becomes **2 items**, word for word:
  1. **ลำดับก้อนที่เลือก**: keep its current body "อยากได้ก้อนไหนก่อน ก้อนไหนหลัง";
  2. **วันที่จะเริ่มใช้ระบบ** (body "มีผลต่อการนับรายได้และโบนัสช่วงรอยต่อ").
  - The heading counts from the list ⇒ **"2 อย่างที่ต้องได้จากการประชุมวันนี้"**.
- **A note under the cards**, one line, from `pricing.ts`, word for word: **"ไฟล์ Excel สต็อก: ได้รับแล้ว ✓ · ขอเพิ่ม 2 คอลัมน์ ราคาขาย + กลุ่มค่าคอม ก่อนเริ่มขายผ่านระบบ"**. Style it as a quiet confirmation (a ✓ chip or the muted style), not a third card.
- **Done =**
  - tsc 0 · build 0;
  - `grep` dist: `ข้อมูลชุดแรก|จำนวนคงเหลือ` = 0 and `ได้รับแล้ว ✓` = 1;
  - the earlier zeros still hold (`ขวัญ`, `ราคาคิดอย่างไร`, the method numbers);
  - the slide-12 screenshot;
  - the new md5. Freeze.


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

**Sober, 2026-11-03 (add-on 4): DONE.** Deck md5 `c79d68fe6c603a7e45b08172cc23c226`.
- `ข้อมูลชุดแรก` / `จำนวนคงเหลือ` = 0 · `ได้รับแล้ว ✓` = 1 · `ขวัญ` / `ราคาคิดอย่างไร` / 263 / 149 / 73,000 = 0.
- The slide-12 frame was looked at (2 cards + the green note). Frozen.
