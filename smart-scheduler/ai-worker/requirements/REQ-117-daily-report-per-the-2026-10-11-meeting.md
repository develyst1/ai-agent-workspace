# REQ-117: Daily Report, re-specified by the customer in the 2026-10-11 meeting (PRIORITY 1 of 5)
> ⛔ **OWNER 2026-10-11, the ruling that governs this whole file: ALL reports (the Daily Report AND Dashboard + Overview) are front office and go to PALM. *"A คือหน้าบ้านทั้งหมดและ เราจะไม่แตะ ฉันฝากให้ปาล์มรับผิดชอบ"* · *"จำไว้ Report ทั้งหมด ฝากปาล์มรับมือไว้ก่อน ส่วนเรื่องข้อมูลที่ต้องเอามาขึ้นเราดูจริง แต่โน้ตไว้ ไว้คุยกันทีหลัง"*.** ⇒ **The team does NOT build this** (Palm-hands-off rule, SYSTEM-FACTS). TASK-723/724 are **CANCELLED (handed to Palm)**. **The DATA the reports need is ours to look at for real, LATER:** §3/§4 stay here as the notes for that talk. Nobody acts on them now.
> 🔴 **OWNER 2026-10-11: only the tabs REPORT · STOCK · REVENUE · SALARY count. *"อันอื่นไม่เกี่ยว"*.** ⇒ **The Authorize tab is NOT a requirement.** Every line below that came from it (the access row, "ไม่มีเรื่องเงิน") is **void until the owner says otherwise.**
**Source:** the owner's meeting with Khwan, พี่ฟิล์ม (the CEO) and Palm, 2026-10-11. Two artefacts:
1. **The customer's own sheet** "Status Update", tab **REPORT** (+ the **Authorize** tab). Snapshot in `project-docs/customer-2026-10-11-meeting/sheet-REPORT.csv` and `sheet-Authorize.csv`. **These are her words.**
2. **An AI summary of the call**, pasted by the owner: `project-docs/customer-2026-10-11-meeting/MEETING-NOTES-2026-10-11-as-given-by-owner.md` §2. **A third party's paraphrase**, so where it disagrees with the sheet, it is listed in §4 as a question, not ruled by us.
**Agreed priority order (meeting §6):** 1 **Daily Report (front office)** · 2 Salary · 3 Revenue · 4 Stock · 5 Report (back office). Items 2–5 are the BACK-OFFICE system, with their own REQs to come.
**Supersedes:** the 10-11 Q1/R2/R3 framing of TASK-723/724 (camp = children in its own row, group in the totals, leave OUT of Total booked). **R3 is reversed by the customer:** *Total booked = Confirmed + On leave*.

## 1. Her words: the sheet, tab REPORT (cells as exported, verbatim)
> Daily Report ไม่นับรวม Group (ECA/ CAMP)

> Total booked = จองมาเรียนทั้งหมดกี่คน · Attended = มาเรียนจริงๆทั้งหมดกี่คน **ไม่ต้องเอาออกจาก confirmed · Confrimed = คอนเฟิร์มมาเรียน *ถ้าแจ้งลา ให้เอาออก · Pending = ยังไม่โอน / ยังไม่คอนเฟิร์ม · Awaiting = Pause คลาส 1st/ 1HR ที่เลื่อนและรอลงตารางใหม่ · On leave = ลา *เอาออกจาก confirmed ด้วย · Cancelled = คลาสที่ยกเลิก · By booking type = ให้นับนร.ที่ Confirmed & หลัง 5.15 นับนร.ที่ Attended · Workload = ไม่เอากราฟ ขึ้นเฉพาะตัวเลข Attended/ Confirmed eg. 2/6 และอีก 1 บรรทัด รวมทุกโปรแกรม ECA, CAMP ด้วย เช่น Total (+Group): 7 · ***Total booked = Confirmed + On leave · Total Booked - On leave = Attended · Confrimed = Attended · เลือก period ได้ทุกเมนูเฉพาะเรื่อง / filter สาขา

**Authorize tab, the Daily Report row:** `Daily Report *ไม่มีเรื่องเงิน` → Kru: **ปิด / ไม่ให้ดู** · Admin 1 / Poo: **แก้ไขได้** · Admin 2-3 / Kung, London: **ดูได้** · CEO: **แก้ไขได้**.

## 2. What the summary adds (meeting §2, paraphrase)
- The report stays as it is; **the contents get corrected**.
- **Two sections:** the TOP is **Private + Duo** (Duo treated as Private). The BOTTOM, "Group", is **Balance Play Group · Camp · ECA**.
- **Balance Play Group:** each child has their own course, so it is **counted per child**.
- **ECA:** show the **number of schools / ECA classes** (e.g. 1 school) and the **coaches who went** (e.g. 7). The child count is not needed (no per-child course). Coach pay belongs to the back office.
- **By booking type: TWO lines**, "(Confirm)" and "(Attended)". This was Dong's proposal, agreed, because the system reads live data and does not keep a morning snapshot.
- **Cancel is NOT shown** ("ให้หน้าตา Clean").
- **Awaiting:** classes paused **that day** (e.g. a sudden illness). A course dropped long-term is **not** in the Daily Report; it lives on the Bookings page.
- **On leave:** ALL leave, in advance and same-day. A same-day leave moves **out of Confirm into On leave**.
- **Workload:** a separate table, **"taught / booked"**, e.g. 3/5 (5 booked, 2 sick, 3 taught).
- **Double-click for detail, and Export to Excel.**

## 3. The model, as one table (sheet + summary, where they agree)
| line | counts | removed when |
|---|---|---|
| **Total booked** | **= Confirmed + On leave** | — |
| **Confirmed** | confirmed classes, **including those already attended** | the child takes leave ⇒ moves to On leave |
| **Attended** | checked in / came | — (stays inside Confirmed) |
| **On leave** | every leave, advance or same-day | — |
| **Pending** | not paid / not confirmed | — |
| **Awaiting** | paused (see Q2) | — |
| ~~Cancelled~~ | see Q1 | — |
| **By booking type (Confirmed)** · **(Attended)** | two lines | — |
| **Workload** | per coach, numbers only, no chart (see Q6) + **one line `Total (+Group)`** | — |
| **Group section** | Balance Play Group (per child) · Camp · ECA (schools/classes + coaches) | not in the top totals |
🚫 **No money anywhere in this report** (Authorize: *"ไม่มีเรื่องเงิน"*).

## 4. ❓ Open: the sheet and the summary disagree, or neither says. **The owner was in the room, so he answers first. Khwan only for what he cannot.**
- **Q1 Cancelled:** the sheet LISTS it (*"Cancelled = คลาสที่ยกเลิก"*); the summary says **do not show it**. Which one?
- **Q2 Awaiting:** the sheet says *"Pause คลาส 1st/ 1HR ที่เลื่อนและรอลงตารางใหม่"* (a 1st Trial / 1 HR moved and waiting for a new slot); the summary says *a class paused that day, e.g. sick*. In our statuses this is `PAUSED`, or "awaiting reschedule (parent)" (`AWAITING_RESCHEDULE`/`PENDING_RESCHEDULE`), or both?
- **Q3 Pending and Awaiting** are NOT in *"Total booked = Confirmed + On leave"*. So they sit OUTSIDE the total. Confirm.
- **Q4 Balance Play Group:** "counted per child" — in the TOP section (with Private + Duo) or the BOTTOM "Group" section? The summary puts it in the bottom section.
- **Q5 Camp in the Group section:** which number: children who came, the camp week's booked children, or only the coaches?
- **Q6 Workload:** the sheet says *"Attended/ Confirmed eg. 2/6"* + *"Total (+Group): 7"*; the summary says *"สอนจริง / จองมา"* 3/5 in a separate table. Same thing? And does `Total (+Group)` count coaches or classes?
- **Q7 Period + branch filter** (*"เลือก period ได้ทุกเมนูเฉพาะเรื่อง / filter สาขา"*): does this apply to the Daily Report (a range, not one day?), or to the Dashboard?
- **Q8 Export to Excel + double-click detail:** in scope for the Daily Report now?

## 5. What exists already (for the SA)
- **TASK-723 (BE, Bob) + TASK-724 (FE, Fanta), CUT and HELD.** They make the back the ONE counter (the screen stops recounting `/calendar`), which still stands. **Their counting rules must be re-cut to §3.**
- **Reproduce first:** TEST-092's sid fixtures (27 Sep, 30 Sep) show today's wrong numbers. The after-fix recipe must be re-derived from §3.
- ~~**Access:** the Authorize tab's Daily Report row~~ — **VOID (owner: only REPORT/STOCK/REVENUE/SALARY count).** Access stays as today.
