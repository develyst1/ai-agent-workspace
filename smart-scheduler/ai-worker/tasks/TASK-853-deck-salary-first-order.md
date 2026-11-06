# TASK-853 — the pricing deck follows the customer's order: เงินเดือน → รายได้ → สต็อก (REQ-5001 §8.7) — @Jason (≈ 0.3 d)
**From @Sober, 2026-11-05. GO now.** Owner: *"ทำการแก้ไขมา ให้เป็นตามนี้ ทั้ง สไลด์ หรือ อะไรต่างๆ"*. The meeting is Sat 11-07. **Read REQ-5001 §8.7.** Scope: the meeting material only; REQ-120 still has no build GO.
**Folder:** `som-balance-backoffice-spec/pricing-deck/`. Not git. **Rule 2:** you never ask the owner. Questions go below, to me.
**§8.3 and §8.4 still hold:** no pricing method, no "ขวัญ".

## 0. Archive first
`pricing-deck/dist/index.html` (md5 `c79d68fe6c603a7e45b08172cc23c226`) → `pricing-deck/archive/index-2026-11-05-c79d68fe.html`, a byte copy. Paste both md5s.

## 1. The changes (every number in `pricing.ts`)
1. **Slide 8** (§8.7 calls it "slide 3 card": it is section **3 · ตกลงกันแล้ว**), the "ขั้นต่อไป" card: → **"ตกลงราคา → ยืนยันลำดับก้อน"**.
2. **Slide 10 (payment):**
   - rows in this order, roles merged into the first:
     - **"1. เงินเดือน + ฝั่งโค้ช + ระบบสิทธิ์ผู้ใช้"** 17,100
     - **"2. รายได้ + หน้าบ้าน"** 13,800
     - **"3. สต็อก"** 8,300
   - total row 39,200, summed and asserted = `total`;
   - the lead → **"รวม 39,200 บาท"** (drop "ไม่ว่าจะเลือกลำดับไหน");
   - **unchanged:** "ไม่มีมัดจำ · จ่ายเมื่อส่งมอบแต่ละก้อน", the "ราคานี้รวม …" lines (scene 5's highlight finds them), the scope line.
3. **Slide 11 (delivery):** title + head **"ลำดับการส่งมอบ: เงินเดือน → รายได้ → สต็อก"**; one row per block, in that order. `[SA-drafted in the agenda's own wording; Porter checks at QA]`. Weeks from DELIVERY-FACTS "Added 2026-11-05":

   | ก้อน | ได้ใช้ประมาณ |
   |---|---|
   | **เงินเดือน + ฝั่งโค้ช** | ฐานเงินเดือน · Extra Hour · โบนัส 100 **ประมาณ 7 สัปดาห์** · โบนัส 50 ตามมา · ครบทั้งก้อน ประมาณ 10–11 สัปดาห์ |
   | **รายได้ + หน้าบ้าน** (รวม ECA) | รายได้ **ประมาณ 7 สัปดาห์** · ครบทั้งก้อน รวมหน้าบ้าน ประมาณ 11 สัปดาห์ |
   | **สต็อก** | **ครบทั้งก้อน ประมาณ 14 สัปดาห์** |

   - The footer stays as it is: "ระบบสิทธิ์ผู้ใช้มากับก้อนแรก · ทั้งหมดประมาณ 3 เดือน · นับจากวันที่ได้ข้อมูลครบ".
   - Change the column header "ถ้าเลือกเป็นก้อนแรก ได้ใช้ประมาณ" → **"ได้ใช้ประมาณ (นับจากวันเริ่ม)"**.
4. **Slide 12 (last):**
   - item 1 → **"ยืนยันลำดับ: เงินเดือน → รายได้ → สต็อก"**. Its old body "อยากได้ก้อนไหนก่อน ก้อนไหนหลัง" no longer fits; remove it.
   - item 2 unchanged; `stockNote` unchanged.

## Done = (evidence in `## Implementation Notes`)
- The archive md5 = `c79d68fe…`. tsc 0 · build 0 · 0 console. The sum assertion shown firing once, then reverted.
- **`grep` of `dist/index.html`:**
  - = 0: `เลือกลำดับ` · `ลำดับก้อนที่เลือก` · `ไม่ว่าจะเลือก` · `ถ้าเลือกเป็นก้อนแรก` · `เร็วที่สุด`;
  - = 0 (still): `ขวัญ` · `ราคาคิดอย่างไร` · `73,000` · standalone `263` / `149` / `278`;
  - ≥ 1: `ยืนยันลำดับก้อน` · `เงินเดือน → รายได้ → สต็อก` · `ECA` · `โบนัส 50 ตามมา`.
- **Rendered, read in the browser** (numbers format at run time, so grep can't see them): slide 10 shows 17,100 / 13,800 / 8,300 / 39,200.
- Screenshots of slides 8, 10, 11, 12 at 1920×1080, looked at by you.
- The new md5. Then freeze. **No clip render in this TASK** (TASK-854 waits for Porter's scene 6).

## Questions
_(none yet)_

## Implementation Notes
_(Jason)_

## Review
_(Sober)_

## CORRECTION — Sober, 2026-11-05: Porter wrote the delivery slide. **It REPLACES my drafted slide-11 rows and footer in §1.3 above**
Copy from REQ-5001 §8.7 ("Delivery slide rows"), word for word:
| ก้อน | ได้ใช้ส่วนแรก | ครบทั้งก้อน |
|---|---|---|
| 1. เงินเดือน + ฝั่งโค้ช | ฐานเงินเดือน · Extra Hour · โบนัส 100: ประมาณ 7 สัปดาห์ | ประมาณ 10–11 สัปดาห์ (โบนัส 50 ตามมา) |
| 2. รายได้ + หน้าบ้าน (มี ECA) | ประมาณ 7 สัปดาห์ | ประมาณ 11 สัปดาห์ |
| 3. สต็อก | | ประมาณ 14 สัปดาห์ |

- **Footer:** "ระบบสิทธิ์ผู้ใช้มากับก้อนแรก · รายการอื่นในสลิปใส่เองจนครบก้อน · ค่าคอมใส่เองจนมีก้อนสต็อก · นับจากวันที่ได้ข้อมูลครบ".
- **Slide 9 stays "เสร็จในประมาณ 3 เดือน"** (`deliverText`; the owner's ruling).
- Done's ≥ 1 grep: `ได้ใช้ส่วนแรก` · `ครบทั้งก้อน` · `มี ECA` · `ค่าคอมใส่เองจนมีก้อนสต็อก` · `โบนัส 50 ตามมา`. The rest of the Done list stands.


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

**Sober, 2026-11-05: DONE.** Deck md5 `9414cef44f405ae52109b99c5823ad6f`; archive `index-2026-11-05-c79d68fe.html` = `c79d68fe…` ✓; tsc 0; console 0.
- All my greps hold.
- Slides 8–12 read in the browser = §8.7: slide 10's 17,100 / 13,800 / 8,300 / 39,200; slide 11 Porter's 3-column table + footer; slide 12 the 2 items + the stock note.
- **Your Q1:** right: Porter's table, as my CORRECTION says. Frozen.
