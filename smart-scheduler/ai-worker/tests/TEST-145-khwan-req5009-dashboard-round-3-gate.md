# TEST-145: customer gate, the REQ-5009 reply to ขวัญ (Dashboard round 3)
**Status:** ✅ PASS on v3, item 5 removed (v2 PASS; v1 🔧 FAIL, 2 lines). Document check.
**Source:** Porter's brief in `inbox/QA.md` (2026-11-08) · REQ-5009 · CHECK-REQ-5009.

## Customer gate, 2026-11-08: 🔧 FAIL, 2 lines
**Draft checked:** `COPY-DRAFT-khwan-req5009-dashboard-round-3-2026-11-08.md`, md5 `4b6f54a49df26ad8396437a838534322` from "ขวัญครับ" to the end of the file (`635fe32e826d082f9589ecafa200058a` without the last newline). A document check; I ran nothing on uat (the counts are Silver's reads).
**Checked against:** REQ-5009 (her words), CHECK-REQ-5009 §1–§4, CUSTOMER-ANSWERS § SOM Dashboard, and my TEST-138 definitions gate (the screen's period control).

**role-qa §3, the Searched / Data spot-check:** ✅ for Coach Capacity. The index's SOM Dashboard section has the 11-06 numbers marked *superseded 11-08* and the 11-08 numbers → REQ-5009, which is what item 2 says. **Index gap, not a draft defect:** her 11-08 items 3 (Gender / Nationality source) and 4 (Address) have no line in CUSTOMER-ANSWERS yet; worth adding.

**These hold:**
- **Item 1:** screen-only (§1); "แก้ตามที่แจ้งมาทั้งหมด" with no date.
- **Item 2:** her new numbers word for word (FT 4 / 5, PT 5, Karn 4), ECA + Camp in hours, PT weekday FL still out = §2. Free / KOL stay out, and she named ECA and Camp only, so the text doesn't need to mention them.
- **Item 3:** 202 = children who attended at least once in the period, 1st Trial and 1 HR included (§3, `som-contract.ts:316/320`); Total Customer = active course / voucher holders; 36 = nationality not filled (202 − 166), and staff can fill it on the child's profile. SA-confirmed, read on uat.
- **Item 4:** 3 active parents with a typed-in value; staff re-pick the province (§4 A, no code). No names or addresses in the text.
- **Item 5:** the call she asked for.
- **Rules:** formal, ครับ; "ขวัญ" without พี่; self-serve first (items 3, 4); no date; no internal words; no parent names.

**2 required replacements (item 3):**
1. **Line 15, "ในเดือนที่เลือก".** The screen picks a **period**, not a month: it opens on "All", and a custom from–to works (TEST-138 on uat). Over "All" the number is every child who ever attended (540 on uat today), not a month's. Her 202 was November, but the rule isn't monthly.
   - **Replace** "ในเดือนที่เลือก" **with** "ในช่วงเวลาที่เลือก" (the word her definitions message already uses).
2. **Line 17, "ถ้าอยากให้การ์ดนี้นับแบบเดียวกับ Total Customer".** The switch isn't per card. Every card in that section (gender, nationality, age, address) uses the same set of children (§3: "every demographics card follows"). If she says yes for "this card", she'll get all four changed.
   - **Replace** line 17 **with:** `   ถ้าอยากให้ส่วนนี้ (เพศ สัญชาติ อายุ และที่อยู่) นับจากเด็กกลุ่มเดียวกับ Total Customer แทน แจ้งได้ครับ`

**Recommended, your call:**
- **Line 15:** she asked about two numbers, "all registered students" and Total Customer; the text answers only the second. Add before "จึงไม่ตรง": `ไม่ได้นับเด็กทุกคนที่ลงทะเบียนไว้ และ` → "… (รวม 1st Trial และ 1 HR) ไม่ได้นับเด็กทุกคนที่ลงทะเบียนไว้ และไม่ตรงกับ Total Customer …" (or your own phrasing). Also, holders who didn't come in the period aren't in the 202 (§3); that's the other half of why it differs.
- **Line 21:** "เดี๋ยวโทรคุย" reads casual for her formal tone. `5. Activity / Program จะโทรคุยตามที่ขวัญขอครับ`
- **Item 2, Karn's 4 h:** the one PT coach already at 4 is Silver's *inference* that it's Karn (CHECK §2: "confirm by the coach's row on the screen"). The text promises "Karn 4", which is right if that row is his; worth that one look before it goes.

**This verdict rests on:** the files named above, as on disk today, and Silver's uat reads. Nothing was run by me for this gate.

## Customer gate, re-check, 2026-11-08: v2: ✅ PASS
**Draft checked:** v2, md5 `d1ecac206b969896e61cd2d303828fdc` from "ขวัญครับ" to the end of the file (`a12a3cf2591717016c6d55733bf31fb7` without the last newline). It matches your `d1ecac20`.
- **In, word for word:** my 2 replacements (line 15 "ในช่วงเวลาที่เลือก"; line 17, the whole section: เพศ สัญชาติ อายุ และที่อยู่), the recommended line-15 addition with both halves (not all registered children; Total Customer counts holders whether or not they came), and line 21 ("จะโทรคุย").
- **Line 15's new wording is exact** to CHECK-REQ-5009 §3: attended in the period vs active holders regardless of attendance.
- **Karn's 4 h:** confirmed. TEST-138 l.294 (uat, my own read): Karn is PART_TIME, active, and the recount counts Karn at 4 h. So item 2's "Karn เสาร์อาทิตย์ 4 ชม." is already true today, and stays so under the new numbers (CHECK §2: his own rate stays).
- **The rest is unchanged from v1** (lines 9, 11, 13, 16, 19) and holds, as in my v1 check.
- **Rules:** formal, ครับ; "ขวัญ" without พี่; self-serve first; no date; no internal words; no parent names. Searched / Data present.

**This PASS rests on:** a document check against REQ-5009, CHECK-REQ-5009 (Silver's uat reads) and TEST-138. Nothing was run for this gate.

## Customer gate, re-check, 2026-11-08: v3 (item 5 removed): ✅ PASS
**Draft checked:** v3, md5 `1bff88bf9c49ca039fbdab6d84d492c7` from "ขวัญครับ" to the end of the file (`946114cbe23c690c64337b603f699484` without the last newline). It matches your `1bff88bf`.
- **Deletion only:** lines 9–19 are word for word v2's (which passed, md5 `d1ecac20`); only item 5 ("จะโทรคุย") is gone, with no blank line or stray text left behind. The file ends cleanly after item 4.
- **Nothing left points to item 5,** and items 1–4 don't depend on it. Item 5 now goes by the separate sample-table message (passed, TEST-146 v3).
- **Rules:** unchanged and still met.

**This PASS rests on:** a line-by-line comparison with v2 as passed in this TEST. Nothing was run.

## Customer gate, re-check, 2026-11-08: items 1–5 combined: ✅ PASS
**Draft checked:** `COPY-DRAFT-khwan-req5009-combined-1-to-5-2026-11-08.md`, md5 `d9f2bc5b22d6281d50605b5c0385a2f4` from "ขวัญครับ" to the end of the file (`03fc1f3195ac1e1b57d3cac0f78d4f4b` without the last newline). It matches your `d9f2bc5b`.
**Join only, proven by `diff`:**
- **Items 1–4 (lines 7–17)** = the passed reply v3 (`1bff88bf`) byte for byte; the only diff is the added item 5.
- **Item 5 (lines 19–24)** = the passed sample table v3 (`6abd2d18`) with indentation ignored, except: its greeting line "ขวัญครับ เรื่อง Activity / Program …" became "5. Activity / Program ขอเสนอหน้าตาแบบนี้ก่อนครับ", and its 2 blank lines are gone. Every word and number is unchanged.
- **One greeting, one closing question to ขวัญ;** the rules still hold.

**This PASS rests on:** the two diffs above against the passed drafts. Nothing was run.
