# TEST-146: customer gate, the REQ-5009 item 5 sample table to ขวัญ
**Status:** ✅ PASS on v3 (v2 PASS, superseded by the owner's rewrite) (v1 🔧 FAIL, 1 line: 85 vs her screen's 96). Document check + 1 uat read.
**Source:** Porter's brief in `inbox/QA.md` (2026-11-08) · REQ-5009 item 5 · CHECK-REQ-5009 §5.

## Customer gate, 2026-11-08: 🔧 FAIL, 1 line
**Draft checked:** `COPY-DRAFT-khwan-req5009-activity-sample-table-2026-11-08.md`, md5 `35a997b1884c55f547f0c4392fba1d60` from "ขวัญครับ" to the end of the file (`591ea1507a517e15be162dada52b8f71` without the last newline).
**Checked against:** CHECK-REQ-5009 §5 (Silver's uat counts), REQ-5009 item 5 (her words), and **one uat read of my own** (2026-11-08 11:05 UTC, headless, uat card used as given, every non-GET aborted, only `POST /cdn-cgi/rum` tried; the SOM screen's painted card + `GET /reports/som`, counts only).

**These hold:**
- **Every number in lines 14–18 = §5's table**, cell for cell ("–" written as 0).
- **The top 5 is right:** by row total, SURFSKATE 116 · INLINE SKATE 84 · BIKE 76 · SKATEBOARD 29 · BALANCE BIKE 11; the next are SURFSKATE & INLINESKATE 9 and Balance Play (Private) 9.
- **"กิจกรรมอื่นอีก 11 แบบ":** §5 has 16 activity rows; 16 − 5 = 11. (The "(no class booked yet)" row, 3 vouchers of 15 h, isn't an activity, so leaving it out of the 11 is right.)
- **Units:** course sizes 4 / 6 / 10 are sessions ("ครั้ง"), voucher sizes 5 / 10 / 15 are hours = §5. No other size exists today.
- **"27 คน"** = §5; line 21's "counted in every activity, the total counts each child once" = §5's rule.
- **Total Customer 227: ✅ on her screen.** The painted card on uat reads "Total customers 227" right now, and the API's `totalCustomers` = 227. So Silver's SQL matches the screen exactly today, not just "within a few".
- **Rules:** formal, ครับ; "ขวัญ" without พี่; real numbers dated 8 Nov; no names; one ask, to ขวัญ. Searched / Data present (role-qa §3).

**1 required fix: the 85 doesn't match her screen's "1 HR (last 3 months)" card, and the text doesn't say why.**
- **Her own screen, today:** the 1 HR (last 3 months) card reads **96** (API `recentSingleSession` = 96, Sep–Nov). Line 11's base is "Total Customer 227 + 85". She asked that this ties to "Total Customer + 1hr (last 3 Month)", so she'll add 227 + 96 = 323, not 312, and find 11 missing.
- **The 85 is Silver's narrower set:** 1 HR children who **never opened a course**. *Probably* the 11 are 1 HR children who had a course (most already inside the 227), but nobody has shown that, and I won't write a cause the SA hasn't confirmed.
- **Also for Silver, the same root:** the 1 HR column sums to **100** (15 + 24 + 35 + 11 + 6 + 4 + 1 + 2 + 1 + 1), against a base of 85. Is that column only the 85 (some in 2 activities), or every child who took a 1 HR in that activity, Total Customer children included? Line 12 presents "1 HR" as a package next to course and voucher, so she'll read it one way or the other.
- **Fix:** ask Silver (via your chain) what the 11 are and what the 1 HR column counts, then add one line under line 11. If the 11 are what I think, the line is: `(การ์ด 1 HR (last 3 months) บนหน้าจอแสดง 96 คน ตัวอย่างนี้ไม่นับซ้ำเด็กที่เคยเปิดคอร์สแล้ว จึงเหลือ 85 คน)`. If they aren't, the line says whatever Silver finds.

**Optional:** line 21 states the Total column as decided ("ส่วนช่องรวมจะนับ…"). §5 calls that "the choice to show ขวัญ". Line 23's "ถ้าอยากปรับตรงไหน แจ้งได้เลย" already leaves it open, so it's fine as is.

**This verdict rests on:** §5 as on disk today, plus my one uat read (227 and 96). I ran no SQL; the 11 and the 1 HR column's meaning are Silver's to settle.
**Test data created:** none (uat read-only; nothing written, nothing saved).

## Customer gate, re-check, 2026-11-08: v2: ✅ PASS
**Draft checked:** v2, md5 `9477cbfd2775c81ad0ff681054274b3a` from "ขวัญครับ" to the end of the file (`149adfaeadc5660d90062ba8ab564e4b` without the last newline). It matches your `9477cbfd`.
- **The new line 12 holds against Silver's reconciliation (CHECK §5):** the card's 96 − 9 (active voucher holders, already in the 227) − 2 (archived) = 85 ✓; and 96 = her screen's card, which I read on uat today (TEST-146). "ซ่อนออกจากรายการแล้ว" for archived is the desk's agreed word. Taking Silver's 9 + 2 over my guess ("had a course") is right; my guess was wrong.
- **The 1 HR column** (94 children incl. the 9; 6 in two activities ⇒ 100) is now explained by Silver, and the line-22 rule ("counted in every activity") covers the 6.
- **The rest is unchanged from v1** (lines 9, 11, 13–24) and holds: every cell = §5, top 5 and "11 more" right, units right, 227 = her screen.
- **Rules:** formal, ครับ; "ขวัญ" without พี่; real numbers dated 8 Nov; no names; Searched / Data present.

**Optional, your call:** the 9 voucher holders also appear under that activity's Voucher columns, so a child can sit in two **packages** of one activity, not only in two activities. Line 22 speaks of activities only. If you want it covered: `เด็กที่ซื้อมากกว่า 1 กิจกรรม (ตอนนี้ 27 คน) หรือมีมากกว่า 1 แพ็กเกจ จะนับอยู่ในทุกช่องที่ซื้อ ส่วนช่องรวมจะนับเด็กแต่ละคนครั้งเดียวครับ`. It's not wrong as it stands.

**This PASS rests on:** CHECK-REQ-5009 §5 + its reconciliation as on disk, and my uat read in TEST-146 (227, 96). No SQL run by me.

## Customer gate, re-check, 2026-11-08: v3 (short rewrite): ✅ PASS
**Draft checked:** v3 (the short rewrite), md5 `6abd2d18dc5d0d2bc51370da79f58cc5` from "ขวัญครับ" to the end of the file (`a725c727c803ecaeb425faf43481dfbd` without the last newline). It matches your `6abd2d18`.
**Every number = CHECK-REQ-5009 §5:**
- Private SURFSKATE: Course 10 = **61** ✓ · Course 6 = **11** ✓ · Voucher 15 h = **15** ✓ · 1 HR = **15** ✓.
- Private BIKE: 1 HR = **35** ✓ · Course 4 = **10** ✓ · Voucher 10 h = **9** ✓ (Voucher 15 h is also 9; the text names 10 h, which is right).
- Units: course 4 / 6 / 10 = "ครั้ง", voucher 5 / 10 / 15 = "ชม." ✓.

**Line 11's base, "นับจากลูกค้าใน Total Customer และเด็กที่มา 1 HR ใน 3 เดือนล่าสุด": true for these cells.** The course and voucher cells come from active holders (= the 227, which her screen showed today, TEST-146). The 1 HR cells are every non-archived child with a 1 HR in Sep–Nov in that activity (Silver's reconciliation (b)), and that's the same window as her "1 HR (last 3 months)" card. No total or base number is stated, so the 96 / 85 question from v1 can't come up.
- *Fine print, not a fix:* the window runs to 30 Nov, so a 1 HR booked for later this month already counts, as it does on her card. "ที่มา" reads slightly stronger than that, but it matches the card she knows.

**Rules:** formal, ครับ; "ขวัญ" without พี่; real numbers dated 8 Nov; no names; one question, to ขวัญ. Searched / Data present in the header.

**Optional, your call:** each example row shows some packages, not all (SURFSKATE also has Course 4 = 6, Voucher 5 / 10 = 2 / 6). As "ตัวอย่าง" that's fine; if you want her not to read them as the whole row, add "(บางช่อง)" after "ตัวอย่างจากข้อมูลจริงวันที่ 8 พ.ย.".

**This PASS rests on:** §5 + its reconciliation as on disk, and my uat read in TEST-146. No SQL run by me.
