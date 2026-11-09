# TEST-144: customer gate, the 4 teaching-hours questions to ขวัญ
**Status:** ✅ PASS on v2 (v1 🔧 FAIL, 3 lines). Document check.
**Source:** Porter's brief in `inbox/QA.md` (2026-11-08) · TASK-872 ## Questions.

## Customer gate, 2026-11-08: 🔧 FAIL, 3 lines
**Draft checked:** `COPY-DRAFT-khwan-teaching-hours-rules-2026-11-08.md`, md5 `a9588349000f0be1cad4854e25d485c9` from "ขวัญครับ" to the end of the file (`3bd13d22c68217fe77bf83424d228a77` without the last newline). A document check; nothing was run.
**Checked against:** TASK-872 ## Questions (Q1, Q2, Q3, Q5) and Sector's review, REQ-120 R1.2 and §9.4 #3, and the front office's own Thai words (`dictionaries.ts`: PENDING = "รอยืนยัน" l.3084; the kinds of an "อื่นๆ" booking: ECA · "ฟรี" · KOL · แคมป์, l.3258–3263; back `OTHER_KINDS` = ECA, FREE, KOL, CAMP).

**These hold:**
- **The opening:** hours from the timetable, used for Extra Hour (FT/PT) and Freelance pay = R1.2.
- **Q1 = TASK Q1:** a past class still at "รอยืนยัน" is exactly PENDING, the screen's own word. A = the default (not counted). EXTENDED isn't asked; it moves the sample coach by 0, so leaving it out is fine.
- **Not asked, rightly:** the no-show case (already ruled, §9.4 #3), meetings / OTHER with no kind (OT, R1.2), Q4/Q6/Q7 (SA-decided).
- **Rules:** formal, ครับ; "ขวัญ" without พี่; no names; A/B; no internal words except "KOL", which is her screen's own label.

**3 required replacements:**
1. **Q2 (line 16), "คลาส Free และ KOL ของ ECA / Camp".** Not exact. Free and KOL are **their own kinds**, beside ECA and Camp, on an "อื่นๆ" booking (the kind picker: ECA · ฟรี · KOL · แคมป์). As written she can read it as "the free sessions inside an ECA or a camp", which ECA and Camp themselves aren't (they are counted). And her screen says "ฟรี", not "Free".
   - **Replace** line 16 **with:** `2. รายการอื่นๆ ที่เลือกประเภท "ฟรี" หรือ "KOL" (ไม่ใช่ ECA หรือแคมป์ ซึ่งนับอยู่แล้ว) นับเป็นชั่วโมงสอนของครูไหมครับ`
2. **Q3 (line 20), "ไม่มีเด็กมาเลย (ลาหรือยกเลิกทั้งหมด) แต่ครูอยู่".** Two gaps.
   - "ไม่มีเด็กมาเลย" also covers children who just didn't turn up. That's already ruled (counted, §9.4 #3), and the rule here isn't about them: a no-show still holds a seat.
   - "แต่ครูอยู่" suggests the system knows the coach was there. It doesn't: under A it counts the hour whether or not the coach stayed. And TASK Q3 also covers a Group nobody has joined yet.
   - **Replace** line 20 **with:** `3. คลาส Group ที่วันนั้นไม่มีเด็กอยู่ในคลาสเลย (เด็กลาหรือยกเลิกทั้งหมด หรือยังไม่มีเด็กลงชื่อ) แต่คลาสยังอยู่ในตารางของครู นับเป็นชั่วโมงสอนของครูไหมครับ (เด็กที่ไม่มาโดยไม่ได้ลา ยังนับให้ครูตามที่ตกลงไว้แล้ว)`
3. **Q4 (line 24) isn't A/B, but line 26 asks for "เลขข้อกับ A หรือ B".** She also isn't told what changes. Today, camp days already past when the week is created get no hours for the coach (TASK Q5, `camp.service.ts:283`, read by Sector).
   - **Replace** line 24 **with:**
     `4. ปกติสร้างแคมป์ในระบบเมื่อไรครับ`
     `   A. ก่อนวันเริ่มแคมป์เสมอ`
     `   B. บางครั้งสร้างหลังแคมป์เริ่มไปแล้ว (ถ้าเป็นแบบนี้ ตอนนี้วันแคมป์ที่ผ่านไปก่อนสร้าง ระบบจะยังไม่นับชั่วโมงให้ครู)`

**Not required:** A is the team's default in every question, but the text doesn't say so. That's fine for a plain ask.

**This verdict rests on:** the files named above, as on disk today. B in fix 3 states what the system does by Sector's code reading, not by a run.

## Customer gate, re-check, 2026-11-08: v2: ✅ PASS
**Draft checked:** v2, md5 `9f77a5fbf5088d0d6c07a62cee9acc40` from "ขวัญครับ" to the end of the file (`e49c11e7cc6245c781159c4a87daa6a7` without the last newline). It matches your `9f77a5fb`.
- **In, word for word:** my 3 replacements: Q2 (line 16, "ฟรี" / "KOL" as their own kinds), Q3 (line 20, no child in the class + the no-show note), Q4 (lines 24–26, now A/B with what B means today).
- **Line 28** ("เลขข้อกับ A หรือ B") now fits all 4.
- **The rest is unchanged from v1** (lines 10, 12–14) and holds, as in my v1 check.
- **Rules:** formal, ครับ; "ขวัญ" without พี่; no names; A/B; no internal words beyond her screen's own labels.

**This PASS rests on:** a document check against TASK-872 ## Questions, REQ-120 R1.2 and §9.4 #3, and the front office's Thai labels. Q4's B states the system's behaviour by Sector's code reading, not a run.
