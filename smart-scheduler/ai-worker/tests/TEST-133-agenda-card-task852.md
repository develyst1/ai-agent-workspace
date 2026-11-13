# TEST-133: TASK-852, the agenda card the owner screenshots for the customer's LINE group (REQ-5001 §8.5)

- **QA:** Tanya
- **Date:** 2026-11-03
- **Brief:** Porter's GO in `inbox/QA.md` (2026-11-03)
- **Against:** REQ-5001 §8.5, and the draft body `COPY-DRAFT-khwan-meeting-agenda-2026-11-07.md` md5 **`8118a042…`** (checked: unchanged)
- **How:**
  - **from clean:** a copy of `som-balance-backoffice-spec/agenda-card/` **without `node_modules` / `dist`** in my scratchpad, then `npm ci` → `npm run build` → `vite preview`;
  - **headless** real Chrome at 1080 px wide;
  - the owner's own folder was not touched.

## Verdict: ✅ TEST_PASSED

| Check | Result | |
|---|---|---|
| **Works from clean** | `npm ci` ✅ → `npm run build` ✅ (its word-for-word check *"ok (1476 chars)"* + tsc + vite build, 833 ms) → preview served `#/1` and `#/2` ✅. **Note:** `npm run preview` is `vite preview --open`. For the owner that opens his browser, as intended; I ran the same server without `--open` (on port 4199, since 4174 was taken by something else on this PC) so nothing popped up on his screen | ✅ |
| **Text = the draft, word for word** | my own check on the **rendered page text** (not the builder's script): **all 43 body fragments** (every line, table cell and "·"-separated part) are present **in the draft's order**, from *"สวัสดีครับ"* to *"เจอกันวันเสาร์ครับ 🙏"*; **0 missing**. The table's 3 header labels (ก้อน · มีอะไรบ้าง · ถ้าเลือกเป็นก้อนแรก ได้ใช้ประมาณ) appear as the label in each of the 3 cards (the card layout of one table header). **Only additions:** the page markers "1/2" / "2/2" (and the 1 / 2 · 2 / 2 switcher above the card) and the card numbers 1 / 2 / 3. No words added or changed | ✅ |
| **0 ฿ amounts · 0 "ขวัญ"** | none in the rendered text of either screen | ✅ |
| **Thai marks render; nothing clipped at 1080** | **Noto Sans Thai** 400 / 500 / 700 loaded, `document.fonts.check` true; every text element uses it. **0 elements overflow / clip**, 0 text outside the 1080 width, scrollWidth = 1080 on both screens. By eye: upper and lower marks intact (e.g. *"ที่"*, *"ยืนยัน"*, *"ล็อกอินโค้ช"*, *"ฝั่งโค้ช"*, *"เลือกได้อย่างใดอย่างหนึ่ง"*) | ✅ |
| **Screen 2 as a phone image** | 1080 wide × ≈ 2,470–2,570 tall (Fern's shot 1080 × 2468; mine 2573 incl. the grey switcher band). It reads well: 3 clear cards, chips for "มีอะไรบ้าง", a blue box for "ถ้าเลือกเป็นก้อนแรก", the 4 notes, then *"เจอกันวันเสาร์ครับ 🙏"*. Shown at a phone's width (≈ 1/3 scale) the body text is small but legible, and LINE lets you zoom | ✅ |
| **Screen 1** | 1080 × ≈ 1259: the greeting + the 6 topics as a list, topic 4 highlighted | ✅ |
| Console / network | 1 console line: a **404 for `/favicon.ico`** (the browser asks for it; the page has none). Harmless, invisible in a screenshot. 0 external requests | ✅ |

## ⚪ For the owner (Porter)
- **Crop below the grey switcher band** (the "1 / 2 · 2 / 2" pills at the very top) when screenshotting, or take the white card only. Fern's `shots/agenda-1-1080.png` and `agenda-2-1080.png` already are exactly that.
- The small "1/2" / "2/2" marker inside the card is fine to keep.

## Test data created
- None in the owner's folders. My clean copy, build and screenshots are in my scratchpad; the preview server is stopped.

## Evidence
1. **The rendered-text diff:** 43 / 43 fragments in order, 0 missing; extras = the page markers only. This proves word for word.
2. **The overflow / font scan** (0 clipped elements, Noto Sans Thai loaded) + the two 1080-px screenshots. This proves the marks and no clipping.
3. **`npm ci` → `npm run build` → preview** on a copy without `node_modules` / `dist`. This proves it works from clean.
