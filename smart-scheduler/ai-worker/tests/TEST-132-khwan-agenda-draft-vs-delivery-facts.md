# TEST-132: the customer draft `COPY-DRAFT-khwan-meeting-agenda-2026-11-07.md` against the FINAL delivery facts

- **QA:** Tanya
- **Date:** 2026-11-03
- **Kind:** a document check, not a run
- **Brief:** Porter's 2 entries in `inbox/QA.md` (2026-11-03): the GO, and the addendum "use the FINAL facts"
- **Against:**
  - `DELIVERY-FACTS-REQ-5001-s8-part-order-2026-11-03.md` (✅ FINAL, Sober; Silver confirmed every Q);
  - brief §4 prices (total 39,200).
- **The owner's D1 ("about 3 months") and D2 (installments by block)** are still open; the draft is judged as written.

## Verdict: ❌ TEST_FAILED on one claim (the REVENUE row's timing) · everything else ✅

### 🔴 The one mismatch
- **The draft, row "รายได้ + หน้าบ้าน":**
  - it lists *"รายได้ลงอัตโนมัติ · ยกเลิกคอร์ส / Refund · รายงานรายวัน / MTD / YTD · **สาขา · วิธีชำระเงิน / ผ่อน · Confirm camp · Park Rent**"*;
  - and gives the whole row **one time: "ประมาณ 6 สัปดาห์"**.
- **The FINAL facts:** ≈ 6 weeks is **Revenue + C1** only.
  - **Q4:** *"Team B builds Revenue + C1 while Team A builds Roles in parallel … **F1 + F2 make it complete at ≈ 3 wk extra**, in parallel"*.
  - **Silver, Q4:** *"**F1 / F2 / C-d / D3 / F5 complete the block later**, inside REVENUE's ≈ 13,800"*.
  - **Q1:** Team B's front-office items are ≈ 6 weeks of their own; F1 + F2 alone ≈ 3.
- **So the draft promises branch / payment method / installments / Confirm camp / Park Rent at ≈ 6 weeks**, which the facts don't support.
- **The other two rows already split this correctly** ("ส่วนแรก … · ครบทั้งก้อน …"); this row doesn't.
- **Expected:** the same two-part shape, e.g. *"รายได้ ประมาณ 6 สัปดาห์ · สาขา / วิธีชำระเงิน / ผ่อน / Confirm camp / Park Rent ตามมาหลังจากนั้น"*.
  - **The "หลังจากนั้น" length is not in the facts as one number** ("≈ 3 wk extra" covers F1 + F2 only). The SAs give it; I don't invent it.

### ✅ Every other number and claim
| Check | The draft | FINAL facts | |
|---|---|---|---|
| Stock, first slice | *"ส่วนแรก ประมาณ 4 สัปดาห์ (เร็วที่สุด)"* | Q4 STOCK ≈ 4 wk; the fastest of the three (4 vs 6 vs 5–6) | ✅ |
| Stock slice **contents** | *"รายการสินค้าจาก Excel · รับเข้า · ยอดคงเหลือ · ของ Demo"* | Q1: *"catalogue from her Excel, Stock In, live balance per location, Demo"* | ✅ |
| **STOCK OUT not in the slice** | selling comes with the full block: *"ครบทั้งก้อน รวมการขายออก ประมาณ 7–8 สัปดาห์"* | Q4: full Stock ≈ 7–8 wk | ✅ |
| Revenue | *"ประมาณ 6 สัปดาห์"* | Q4 ≈ 6 wk (Revenue + C1) | ✅ the number (🔴 above: what it covers) |
| Salary, first slip | *"สลิปแรก ประมาณ 5–6 สัปดาห์ (เงินเดือนฐาน + รายการที่ลงเอง)"* | Q4: *"≈ 5–6 wk for slips with base + manual lines"* | ✅ |
| Salary, full | *"ครบทุกรายการ รวมโบนัส ประมาณ 10–11 สัปดาห์"* | Q4: *"full Salary (FL pay + bonuses) ≈ 10–11 wk"* | ✅ |
| Total | *"ประมาณ 3 เดือน"*, *"นับจากวันที่ได้ข้อมูลครบ"* | Q3: ≈ 13 wk ≈ 3 months (planning rate, rebalanced; her Excel at GO). D1 open | ✅ as written |
| Roles with the first block | *"มากับก้อนแรกเสมอ ไม่ว่าขวัญจะเลือกก้อนไหน"* | Q2.1 / Q4: *"Roles always ship with the first block"* | ✅ |
| If Stock first | *"ยอดขายของจะเข้ารายงานรายได้ตอนส่งก้อนรายได้ และค่าคอมจะบันทึกไว้ก่อน แล้วจ่ายตอนมีก้อนเงินเดือน"* | Q2.5 + Q2.4 | ✅ |
| If Salary before Stock | *"ค่าคอมขายของต้องใส่เองในสลิป จนกว่าจะมีก้อนสต็อก"* | Q2.6 | ✅ |
| Prices | 8,300 + 13,800 + 13,500 + 3,600 = **39,200** | Q1 / Q5 block prices; total 39,200 | ✅ |
| **Block contents** | **Revenue row:** สาขา (F1) · วิธีชำระเงิน (F2) / ผ่อน (C-d) · Confirm camp (D3) · Park Rent (F5) + Revenue. **Salary row:** หลายบทบาท / STAFF (F3) · ดูว่าใครเปลี่ยนทดลองเป็นคอร์ส (F4) · ล็อกอินโค้ช (F6) + Salary. **Stock row:** Stock only | Q1 cut: REVENUE = Revenue + F1 · F2 · C-d · D3 · F5; SALARY = Salary + F3 · F4 · F6 | ✅ none missing, none in the wrong block |
| Agenda items 5 / 6 | *"ไม่มีมัดจำ"* · *"ไฟล์ Excel สินค้า + จำนวนคงเหลือ"* | deck slide 10 / 12; Q3 assumption | ✅ |
| Nothing internal | 0 team names, 0 engineer-days, 0 "optimistic edge", 0 TASK / REQ, 0 SA names | | ✅ |
| Khwan | addressed **"ขวัญ"** throughout; no "พี่ขวัญ" ("พี่" appears only as the owner, the sender) | | ✅ |
| Real staff names | none | | ✅ |

### ⚪ Observations (not errors; Porter's / the owner's call)
1. **"ระบบสิทธิ์ผู้ใช้ 3,600 (จ่ายพร้อมก้อนแรก)":**
   - per Q5, ≈ 750 of it is C1, which is **delivered with REVENUE**;
   - if Khwan picks Stock or Salary first, she pays that ≈ 750 before receiving it.
   - Q5 calls it your rounding choice ("I'd keep the round numbers"), so it's fine as written; just be ready if she asks.
2. **"แจ้งเตือนของใกล้หมด"** is listed in the Stock block, but not in the Stock first slice. That's correct per the facts (it needs R0.4 notifications, which come later). The draft doesn't promise it early.

## Test data created
- None (document read only).

## Evidence
1. FINAL facts Q4 + Silver's Q4 line (quoted above) vs the draft's Revenue row: this proves the 🔴.
2. Q1 block table + Q5 vs the draft's 2 tables: this proves the contents and the prices.


---
## Re-check: the Revenue row (draft md5 `2f6c2973b394db065a041b501c479024`, 2026-11-03): ✅ TEST_PASSED
- **The new row:** *"รายได้ ประมาณ 6 สัปดาห์ (หรือจะเอาสาขา + วิธีชำระเงินก่อน ได้ใน 3–4 สัปดาห์ เลือกได้อย่างใดอย่างหนึ่ง) · ครบทั้งก้อน รวมหน้าบ้าน ประมาณ 10 สัปดาห์"*.
- **Against Silver's addendum** (facts file, "Silver's corrections" → *"Added 2026-11-03 (Porter's ask, TEST-132)"*):

| Draft | Facts | |
|---|---|---|
| Revenue ≈ 6 wk | *"Revenue + C1 alone stays ≈ 6 weeks, but only if Revenue is built before F1 / F2"* | ✅ |
| branch + payment method first, 3–4 wk | *"If F1 + F2 go first: 16.0 d ⇒ ≈ 3–4 weeks"* | ✅ |
| *"เลือกได้อย่างใดอย่างหนึ่ง"* | *"It's one or the other, not both"* | ✅ |
| whole block incl. front office ≈ 10 wk | *"the WHOLE REVENUE block when it comes first = ≈ 10 weeks … Either way"* (64.8 d ÷ 7 + 1 wk QA) | ✅ |
| price 13,800 (unchanged) | Q1 / Q5 | ✅ |

- **"ประมาณ 3 เดือน" still holds with a 10-week Revenue block:**
  - Team B's whole lane is 70.3 d (the 64.8 d block + F4 5.5), i.e. ≈ 11 wk, which fits inside Q3's ≈ 13 wk ≈ 3 months;
  - the critical path is Team A's lane, with the same rebalance assumption as before;
  - Silver signed "about 3 months" (Q3 / his corrections), and his addendum doesn't change the total.
- **Nothing else in the draft changed** (the rows, prices, notes and wording all checked again: as in the first round).
- ⚪ The facts' Q4 "REVENUE" row still has the old text, which Silver flags for Sober to re-mark. The draft follows Silver's corrected numbers, which is right. Once Sober re-marks it, the two agree.
- **Verdict for the whole draft: ✅ TEST_PASSED** (the owner's D1 / D2 still open, judged as written).


---
## Wording-only re-check (draft md5 `5efa904f698029eee036b9c8e12100f8`, 2026-11-03): ✅ TEST_PASSED
- **Context:** the owner approved D1 ("ประมาณ 3 เดือน") and D2 (installments by block). Porter changed 2 lines.
- **The 2 changed lines:**
  - the opening: *"…ส่ง agenda … ให้ดูก่อนนะครับ ขวัญจะได้เตรียมมาคุยว่าอยากได้ส่วนไหนก่อน ส่วนไหนหลัง"*;
  - the item-4 heading: *"งานแบ่งเป็น 3 ก้อน ฝากขวัญเตรียมมาว่าอยากได้ก้อนไหนก่อน ก้อนไหนหลัง"*.
  - Both read naturally and say what the owner asked (come prepared with the order).
- **Every number is unchanged** since the PASS on `2f6c2973…`, compared line by line with that text:
  - the 3 rows' timings (4 / 7–8 · 6 or 3–4 / 10 · 5–6 / 10–11);
  - "ประมาณ 3 เดือน", the Roles line and both "if first" notes;
  - the prices 8,300 / 13,800 / 13,500 / 3,600 = 39,200;
  - agenda items 1–6.
- **Wording checks:**
  - "ขวัญ" throughout, no "พี่ขวัญ";
  - **no question to ฟีน** (ฟีน isn't mentioned);
  - nothing internal (no team, engineer-days, SA / QA names, TASK / REQ);
  - no real staff names.
- ⚪ **Optional wording polish (not blocking):**
  - the opening says *"ส่วนไหนก่อน ส่วนไหนหลัง"* and agenda item 4 says *"ส่วนไหนก่อน"*, but the choice is between the **3 ก้อน** (item 2 talks about *"ทั้ง 5 ส่วน"*);
  - using "ก้อน" in the opening too would stop her thinking she orders 5 parts.


---
## Wording re-check: the message to the customer team, Khwan's name removed (draft md5 `9e0d054156560b4979b64826a34c1233`, 2026-11-03): ✅ TEST_PASSED
- **Owner's ruling:** no line names or centres Khwan; the reader is the team (พี่ฟีน · พี่กุ้ง · ขวัญ).
- **0 "ขวัญ" in the message body** (from *"สวัสดีครับ"* to *"เจอกันวันเสาร์ครับ"*, counted).
- **Numbers unchanged:** every number in the body, in order, is 7 · 5 · 4 · 7–8 · 6 · 3–4 · 10 · 5–6 · 10–11 · 3 (เดือน) · 39,200 · 8,300 · 13,800 · 13,500 · 3,600, the same as the PASS on `5efa904f…` / `2f6c2973…`.
- **Reads naturally to a group:**
  - *"สวัสดีครับ … จะได้เตรียมมาคุยกันว่าอยากได้ก้อนไหนก่อน ก้อนไหนหลัง"*;
  - *"ที่ยืนยันกันครบแล้ว"*; *"เลือกลำดับได้…"*; *"ฝากเตรียมมา…"*; *"ไม่ว่าจะเลือกก้อนไหน"*;
  - no one is singled out. **My earlier ส่วน / ก้อน note is resolved** (the opening, item 4 and item 5 all say "ก้อน").
  - Item 3 *"ราคา (ประเมินค่าแรงตามเรทเดิม)"* is clear, and matches the deck's "ใช้เรทเดิม".
- **Nothing internal;** no real staff names; no question to anyone.
- ⚪ **When copying:** the section starts with a label line and the owner's quote (*"เลิกอ้างขวัญสักที…"*) right above *"สวัสดีครับ"*. **Copy from "สวัสดีครับ" only**; that quote must not reach the LINE group.


---
## Removal-only re-check: the price section removed (draft md5 `8118a042e30df88d73db9762e8a6ace5`, 2026-11-03): ✅ TEST_PASSED
- **No ฿ amount in the body** ("สวัสดีครับ" … "เจอกันวันเสาร์ครับ"):
  - a scan for ฿ / บาท / any "n,nnn" figure found **0 amounts**;
  - its one hit, "บาท", is inside the word *"หลายบทบาท"* (multi-role), not money.
- **Nothing dangling:**
  - no reference to the removed "ข้อ 5" section, a price table, "ด้านล่าง" or per-block prices;
  - agenda items 3 *"ราคา (ประเมินค่าแรงตามเรทเดิม)"* and 5 *"การจ่ายเงิน (จ่ายตามก้อนที่ได้รับ ไม่มีมัดจำ)"* stay as topics without amounts, and read fine on their own.
- **The rest is unchanged since `9e0d0541…`:**
  - the opening, items 1–6, the 3-block table with all its timings (4 / 7–8 · 6 or 3–4 / 10 · 5–6 / 10–11), the Roles line, "ประมาณ 3 เดือน" and both "if first" notes;
  - 0 "ขวัญ" in the body; nothing internal.
- **Copy from "สวัสดีครับ" only** (as before).
