# TEST-127: REQ-133 Deliverable 2, the pricing deck (TASK-846). Local file, headless

- **QA:** Tanya
- **Date:** 2026-10-27, ~22:20 Bangkok
- **Brief:** Porter's "GO: REQ-133 Deliverable 2" in `inbox/QA.md`
- **File:** `som-balance-backoffice-spec/pricing-deck/dist/index.html`, 1,364,052 bytes, modified 22:07.
- **Audience:** ฟีน + Khwan at the owner's money meeting.
- ⚠️ **md5 = `e357cbf55a223bbb827d90191b56497d`, NOT the brief's `ba12a2de…`.** The file was rebuilt after the brief. **Everything below is about `e357cbf5…`.** If that's not the build meant for the meeting, tell me and I re-run it (≈ 5 min).
- **How:** headless Chrome, `file://`, 1600 × 900. Per-slide screenshots in my scratchpad (not in the repo).

## Verdict: ✅ PASS on every gate item · 🟡 wording and screenshot notes for the owner (below; none blocks)

| Gate | Result | |
|---|---|---|
| Opens offline | `file://`; **0 network requests** (everything inlined); 12 slides | ✅ |
| Console | **0 console errors · 0 page errors** | ✅ |
| Keys | → walks `#/slide/2` … `#/slide/12` (12 slides); ← back one; **Space** = next; **Home** = 1; **End** = 12 | ✅ |
| Click | the on-screen **ถัดไป** button walks 1 → 12, then it's disabled at 12; **ก่อนหน้า** walks back to 1 (disabled at 1); a click on the slide body = next | ✅ |
| Reload | `#/slide/7` + reload ⇒ still slide 7, same text | ✅ |
| Thai font | **Noto Sans Thai** loaded (bundled); `document.fonts.check` true; no boxes on any slide | ✅ |
| No "pending" / no A/B/C | **visible text: 0 "pending", 0 A/B/C options.** The file's 125 "pending" hits are all React internals (`d.status="pending"`, `pendingLanes`), none in UI strings; 0 A/B/C in UI strings | ✅ |
| **The price** | **ONE offer, 39,200 ฿** (slides 9, 10, 11); installments **11,900 / 13,800 / 13,500 = 39,200** ✅ | ✅ |
| The arithmetic | 149 × 263 = 39,187 ≈ **39,200** ✅ · 73,000 ÷ 278 = 262.6 ≈ **263** ✅ · 149 days ≈ **7 months** of one programmer ✅ · 39,200 ÷ 7 = 5,600 < "6,000 / month" ✅ | ✅ |
| Nothing internal | 0 team names, 0 TASK / REQ / SPEC / TEST numbers, 0 engineer-day / BE / FE / team splits. Only 278 / 200 / 51 / 149 and ≈ 7 months appear. ⚪ But **"(V3)"** on slide 8 (see 🟡 1) | ✅ (one 🟡) |

## 🟡 Notes for the owner (customer-visible; quoted per slide)
1. **Slide 8**, card "หน้าจอตัวอย่าง": *"ผ่านการตรวจครบทุกหน้า (V3)"*. "V3" is our internal version name; a customer reads it as jargon. Suggest dropping "(V3)".
2. **Slide 8**, the title says *"3 · ตกลงกันแล้ว"* (agreed), but its 3rd card says *"พร้อมเริ่มสร้างทันทีที่ตกลงกัน"* (as soon as we agree). The two contradict each other. *"สเปกปิดแล้ว"* is also tech jargon. Suggest e.g. "รายละเอียดครบแล้ว พร้อมเริ่มสร้าง".
3. **Slide 2**, the Stock card: *"รับเข้า / จ่ายออกแบบตะกร้า"* can be read as **"ออกแบบ" (design)**: "จ่าย / ออกแบบตะกร้า". Suggest "รับเข้า / จ่ายออก (เป็นตะกร้า)".
   - In the same card, *"ของ Demo ตามโรงเรียน"* is unclear on its own (what is a "Demo item" per school?).
4. **Slide 2**, the สิทธิ์ card: *"CEO เห็นทุกอย่าง แอดมินไม่เห็นยอดเงินเดือน แจ้งเตือน เชื่อมกับระบบเดิม"*. "แจ้งเตือน" stands alone between two items and reads as a fragment.
5. **Slide 4**, point 2: *"ต้องลงเอง ก็เพิ่มรายการได้"* reads oddly. Suggest "ถ้าต้องลงเอง ก็เพิ่มรายการเองได้".
6. **Slide 9**, point 3: *"…รวมเทส การขึ้นระบบ UAT รายงาน 6 หัวข้อ และหน้า SOM Dashboard / Daily Report ไว้แล้ว"*.
   - The closing **"ไว้แล้ว"** dangles: is the SOM Dashboard / Daily Report *included in* this price, or *already delivered*? A CEO will ask.
   - "เทส" and "UAT" are our words.
7. **Slide 9**, point 1: *"แพ็กเกจเดิม 73,000 บาท (+ ค่าสิทธิ์ผู้ใช้ 3,500) … ตกวันละประมาณ 263 บาท"*.
   - 263 comes from 73,000 alone (73,000 ÷ 278); with the 3,500 it would be 275.
   - A reader who adds them gets a different rate. Suggest saying the 3,500 is outside the daily rate, or dropping the bracket.
8. **Slide 9**, the comparison: *"149 วัน = จ้างโปรแกรมเมอร์ 1 คนประมาณ 7 เดือน แต่ราคานี้เฉลี่ยไม่ถึงเดือนละ 6,000 บาท และส่งได้ใน 2–3 เดือน"*.
   - The "< 6,000 / month" is averaged over **7** months, but the money is paid over **2–3** months (≈ 13,000–20,000 / month).
   - Correct as written, but it can feel like it's hiding the real monthly outlay. Owner's call.
9. **Slide 11:**
   - the slide is titled *"6 · ไทม์ไลน์"*, but its footer says *"6 · ลำดับการส่งมอบ"*. Minor, but inconsistent; slide 9 is the same (*"ราคาคิดอย่างไร"* vs *"ราคา"*);
   - only installment 1 has a duration (≈ 3–4 สัปดาห์); 2 says only *"ต่อจากงวดแรก"*.
10. **Slide 12:** *"ที่ต้องได้จากห้องนี้"* / *"3 อย่างที่ต้องได้จากห้องนี้"*. "จากห้องนี้" (from this room) is meeting slang. Suggest "จากการประชุมวันนี้".
11. **The screenshots (known v3, to be swapped), but note before the meeting:**
    - **slide 3** shows a salary table with **staff-like names next to salary figures**, incl. **"Kung" 17,200 ฿ and "Poo" 15,600 ฿**: the customer's own admins' nicknames (กุ้ง, พี่ปู) beside a salary, in front of the CEO;
    - the caption says *"ชื่อและตัวเลขเป็นตัวอย่าง"*, but it may still read as real.
    - The sidebar also shows internal item codes (*"F1 · Branch on a booking"*, *"D3 · Confirm camp"*).
    - If the swap doesn't happen before the meeting, consider neutral names here.

## Also checked
- The number-free slide labels ("1 · ทำอะไรได้" … "7 · ที่ต้องได้จากห้องนี้") and the footer hint (← → Space · F เต็มจอ · Home / End) are on every slide.
- The price screenshot for Porter is in his scratchpad (`req133-deck-price.png`, slide 10).

## md5 confirmed (Porter's CORRECTION, `inbox/QA.md` 2026-10-27)
- **`e357cbf55a223bbb827d90191b56497d`, 1,364,052 B** is the build to test, and it supersedes `ba12a2de…`. **That's exactly the file this TEST ran on**: md5 re-read after the correction, unchanged.
- **No re-run needed:** the verdict above stands for this build.


---
## Quick re-check of the fixed deck: md5 `056a00b466fced49741c0c3fbd6cb9a5`, 1,352,754 B (built 22:20): ✅ PASS
- **Brief:** Porter's "GO: TEST-127 quick re-check" in `inbox/QA.md`.
- **md5 read from the file before the run:** matches.

### Gate basics, re-run: all ✅
- offline (0 network requests);
- 0 console / page errors;
- 12 slides by → ← Space Home End, by the on-screen buttons (disabled at the ends), and by a click on the slide;
- `#/slide/7` survives a reload;
- Noto Sans Thai loaded;
- 0 "pending" / A/B/C / TASK / team names in the UI text.
  - The file's "v3" / "V3" hits are now only Mantine library code (`v3()` / `V3()`), **0 in the UI text**.
- **The price is unchanged:** 39,200 = 11,900 + 13,800 + 13,500.

### My 11 notes
| # | Slide | Now | |
|---|---|---|---|
| 1 | 8 "(V3)" | gone: *"ผ่านการตรวจครบทุกหน้า"* | ✅ |
| 2 | 8, agreed vs "once agreed" + "สเปกปิดแล้ว" | title *"รายละเอียดครบแล้ว พร้อมเริ่มสร้าง"*; the contradiction is gone | ✅ (⚪ the 3rd card repeats the title word for word; cosmetic) |
| 3 | 2, "จ่ายออกแบบตะกร้า" + "ของ Demo" | *"รับเข้า / ขายออกเป็นตะกร้า (หลายชิ้นในบิลเดียว)"* · *"ของ Demo ที่วางไว้ตามโรงเรียน"* | ✅ |
| 4 | 2, the dangling "แจ้งเตือน" | *"CEO เห็นทุกอย่าง · แอดมินไม่เห็นยอดเงินเดือน · มีแจ้งเตือนในระบบ · เชื่อมกับระบบเดิม"* | ✅ |
| 5 | 4, point 2 | *"ถ้าต้องลงเอง ก็เพิ่มรายการเองได้"* | ✅ |
| 6 | 9, "…ไว้แล้ว" + "เทส / UAT" | *"ราคานี้รวมการทดสอบ การติดตั้งระบบ ช่วงทดลองใช้ก่อนใช้งานจริง รายงาน 6 หัวข้อ และหน้า SOM Dashboard / Daily Report แล้ว"*: clearly "included"; no jargon | ✅ |
| 7 | 9, "(+ ค่าสิทธิ์ผู้ใช้ 3,500)" vs 263 | the bracket is dropped: *"แพ็กเกจเดิม 73,000 บาท … ตกวันละประมาณ 263 บาท"* (73,000 ÷ 278 = 262.6 ✅) | ✅ |
| 8 | 9, "< 6,000 / month" | gone: *"…ประมาณ 7 เดือน แต่เราส่งมอบได้ใน 2–3 เดือน เพราะใช้เครื่องมือ AI ช่วย"* | ✅ |
| 9 | 9 / 11 titles vs footers | footers now match ("4 · ราคาคิดอย่างไร", "6 · ลำดับการส่งมอบ") | ✅ (⚪ installment 2 still has no duration of its own, *"ต่อจากงวดแรก"*; the whole job is "2–3 เดือน". Fine as is) |
| 10 | 12 "จากห้องนี้" | *"ที่ต้องได้จากการประชุมวันนี้"* | ✅ |
| 11 | **the 5 screenshots** | **slide 3 salary:** Pete / May / Ton / Ploy / Nam / Beam, **no "Kung" / "Poo"**. **Slides 5 and 7:** Ton / Ploy / Nam / May. Student "น้องเอ". **The internal codes (F1 / D3) are gone from the sidebar** ("Branch on a booking", "Confirm camp"). Caption *"ชื่อและตัวเลขเป็นตัวอย่าง"* on each. None of these names is one of the customer's admins or a teacher I've seen on sid / uat | ✅ |

- **Price screenshot:** fresh, from this build (slide 10), in Porter's scratchpad as `req133-deck-price.png` (overwritten).

## ✅ FINAL: the deck `056a00b4…` passes. Ready for the meeting
