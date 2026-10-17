# REQ-119: Daily Report, the BACK serves Palm's contract (`GET /reports/daily`)
> ✅ **CLOSED 2026-10-13: LIVE on uat (back `be2b34f` + front `89774a9`), Tanya TEST-101 PASS on sid and uat. Palm is told through the owner (COPY-DRAFT-palm-…).**
**Owner, 2026-10-12:** *"ก่อนไปหลังบ้าน มาเก็บdashboardแปป"* · *"นายดูไฟล์ของปาล์มน่าจะรู้ว่าต้อง serveหน้าบ้านด้วยข้อมูลแบบไหน ถ้าทีมและนายยังงง ก็ไปดูexcelเพิ่มได้"*
**Palm, to the owner (LINE screenshot, 22:55):** *"ผมเอาขึ้นไปให้ใน develop แล้วนะ · ชื่อไฟล์ .md backend-daily-report.md"*
**This is the "data side, later" that REQ-117 parked.** The SCREEN stays Palm's; the team touches the BACK only.

## Sources (read in this order)
1. **Palm's handoff:** `smart-scheduler-front` → `docs/backend-daily-report.md` (commit `89774a9`, on `develop` and already in the owner's `dong` branch). §1.1 UI, §2 the 7 stats, §3 the two booking-type rows, §4 `byTeacher`, §5 the contract, §6 switch-over, §7 Q1–Q6, §8 tests, §9 checks.
2. **Palm's counting code (his temporary answers to Q1–Q6):** `smart-scheduler-front` → `src/lib/scheduler/daily-report.ts`, lines 21–34.
3. **The customer's Excel:** `project-docs/customer-2026-10-11-meeting/sheet-REPORT.csv` (her words, quoted in REQ-117 §1).

## What the back must do
- `GET /reports/daily?date=…[&teacherId=…]` returns **exactly** Palm's §5 shape. Field names are verbatim, integers only, and all 4 booking types are always present, in the order Palm gives.
- `teacherId` filters **every** counter.
- **All new fields ship in ONE release.** The front switches the moment it sees `awaiting` (Palm §6).
- **Counting = Palm's temporary choices** (`daily-report.ts` L26–30), so the numbers do not jump at switch-over:
  - NO_SHOW is counted as Confirmed;
  - EXTENDED is counted as Pending;
  - Awaiting = PAUSED 1st/1HR only, by the class's original date;
  - Total booked excludes PAUSED;
  - workload `total` counts rows, every row that is neither cancelled nor paused.
  - ⚠️ The **one exception** is the ❓ below.
- **What only the back can do** (Palm §4):
  - an ECA/OTHER row with several coaches counts for **every** assigned coach;
  - a GROUP row counts **once** per coach, never its seats.
- **Palm's §9 checks are the SA's FIRST job**, against our real back code. Any mismatch comes to @Porter; it never goes to Palm directly.
- 🚫 No front file is edited. No change to Palm's doc.

## ❓ The one conflict for the owner (Palm vs the Excel)
- **Excel (her words):** *"Total booked = Confirmed + On leave"* · *"Total Booked - On leave = Attended"*. That leaves **Pending OUT** of Total booked.
- **Palm (`daily-report.ts`):** Total booked = every lesson row that is neither cancelled nor paused, so **Pending and Extended are IN**.
- **Effect:** the two numbers differ whenever a class is still pending that day, and so does the % circle (`attended / totalBooked`).
- **Status: ✅ RULED by Khwan 2026-10-13 01:12 → A (the Excel).** Her words: *"งงนะคะ แต่ที่ต้องการคือ แบบ A: Total booked = 8 (ไม่นับคลาสที่ยังไม่คอนเฟิร์ม) → อัตรามาเรียน 5/8 = 63% · ไม่นับคลาสที่ยังไม่คอนเฟิร์มค่า"*. ⇒ **Total booked = Confirmed + On leave; Pending and Extended are OUT.** The back flips its one switch (`TOTAL_BOOKED_INCLUDES_PENDING` → false).

## Out of scope
- The screen, the period/branch filter, the Excel export, double-click detail: Palm's.
- Dashboard / Overview: Palm's.
- Palm's Q1–Q6 beyond the conflict above: they stay at his temporary values until the owner/ฟีน answer. A later answer means both sides change together.
