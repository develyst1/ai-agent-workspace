# REQ-104 — Customer checklist reconcile (Khwan, 2026-09-22) — gap-check before telling her "done"

**Source:** customer full status list via owner, 2026-09-22. Mapping vs built/spec'd; 4 uncertain areas sent to @Sober for a gap-check.

## Customer's list ↔ our status
- **Group:** 1 Confirm whole course · 2 Confirm weekly for the coach · 3 runs/standing schedule → ⚠️ GAP-CHECK: REQ-101 gave confirm/manage/cancel-all to ECA/OTHER series; GROUP is a separate object (group series) — does it have the same Confirm-all / weekly-confirm / manage parity, or is that unbuilt?
- **ECA:** 1 manage plan · 2 confirm whole + daily · 3 notify on edit/move/remove · 4 cancel all → ✅ REQ-101 (sid-passed this batch).
- **Camp:** 1 on the grid showing who teaches each day ✅(§11 live) — **1b coach rate settable PER DAY** → ⚠️ GAP-CHECK; 2 Attended/auto/QR check-in + **show remaining credit** + notify the parent like Private → ⚠️ GAP-CHECK; 3 **Redeem lists only kids WITH credit** → ⚠️ GAP-CHECK (likely new).
- **สิทธิเพดานเงินครู (see/not):** ✅ REQ-102 key 57 (this batch).
- **แก้ค่าสอนคอร์ส (see=edit / not):** ✅ REQ-102 §6 key 59 (this batch).
- **Cancel Voucher:** ✅ REQ-100 (single) + REQ-103 (whole).
- **Rich Menu / QR check-in:** 🔴 next round (owner: separate).

## 4 gap-check questions for @Sober
1. GROUP object — does it have Confirm-whole-course / weekly-confirm-to-coach / a manage surface like ECA's REQ-101? What exists vs what's missing + size.
2. CAMP — is the coach rate settable PER DAY (per camp-week-day) today, or only per week/overall? 
3. CAMP check-in — does it show the remaining day-credit to the admin AND notify the parent like a Private check-in? What's missing?
4. CAMP Redeem — does the redeem/enroll picker list only kids WITH remaining credit, or all? 

## §2 — OWNER RULINGS 2026-09-22 ("เอาตามแนะนำ") — SPEC-090 gap build GO
1. GROUP: add a **one-button "confirm the whole group"** (parity with ECA; per-child already works underneath).
2. GROUP: build the **weekly coach digest** (Monday) — words below.
3. GROUP: build the **manage surface** (the REQ-101 modal generalised to `group_key`) — cancel-all CASCADES to every child's seat with each family told · add/remove extra coach · add dates · edit name/cap/rates.
4. CAMP: **coach rate per day** (per-coach-per-day on the week's day editor, behind key 59), default for a new day = **0** (a manager fills it).
5. CAMP check-in: (a) the scan page **shows remaining credit**; (b) a **CAMP deduction family notice at DAY-END** (parity with Private, not at scan) — words below.
6. CAMP redeem: ✅ already done (only credit>0).

### Notice words (Porter draft, owner-accepted 2026-09-22)
- **Weekly coach digest** `📅 ตารางสอนสัปดาห์นี้ / THIS WEEK'S SCHEDULE` — greeting + list (วันที่ · เวลา · รายการ/นักเรียน) + "รบกวนตรวจสอบและเตรียมความพร้อม" + EN.
- **Camp deduction (parent, day-end)** `🏕️ ตัดเครดิตแคมป์ / CAMP CREDIT USED` — นักเรียน · วันที่ · คงเหลือ {n}/{N} วัน + EN.

## §3 — owner 2026-09-22: the two new notices are ENGLISH ONLY (no Thai)
Owner: "pure english ไม่เอาไทยเลย". The weekly coach digest and the camp deduction notice render in ENGLISH ONLY — no Thai line, regardless of the recipient's line_lang.
- **Weekly coach digest:** `📅 THIS WEEK'S SCHEDULE` · "Hello, here is your teaching schedule for this week:" · list (Date · Time · Program/Student) · "Please review your schedule."
- **Camp deduction (parent, day-end):** `🏕️ CAMP CREDIT USED` · `Student : {name}` · `Date : {date}` · `Remaining : {remaining}/{total} days`.
(Supersedes the bilingual draft in §2.)

## §4 — ACCEPTANCE CHECKLIST (owner reiterated 2026-09-22: this list must be COMPLETE; Rich menu/QR NOT in it — next round). All on `sid`:
- Group 1 confirm-whole-course → TASK-441 ✅
- Group 2 weekly coach confirm → TASK-441 weekly digest (EN) ✅
- Group 3 standing schedule → group series (existing) ✅
- ECA 1 manage plan → REQ-101 modal ✅
- ECA 2 confirm whole + daily → REQ-101 confirm-all + per-row ✅
- ECA 3 edit/move/remove notify coach → REQ-101 notices + TASK-436 reassign ✅
- ECA 4 cancel all → REQ-101 cancel-all (key 58) ✅
- Camp 1 grid shows daily coach + rate per day → §11 + TASK-443 ✅
- Camp 2 check-in shows remaining credit + parent notify → TASK-443 (scan Remaining + day-end CAMP CREDIT USED, EN) ✅
- Camp 3 redeem only kids with credit → already ✅
- Perm: see/not freelance ceiling → key 57 ✅
- Perm: see=edit / not-see=no-edit coach rate → key 59 ✅
- Cancel Voucher → REQ-100 (single) + REQ-103 (whole) ✅
ALL 13 covered, all on sid (verify 53). Gate: Tanya PASS → Khwan customer-UAT on sid → single uat.
