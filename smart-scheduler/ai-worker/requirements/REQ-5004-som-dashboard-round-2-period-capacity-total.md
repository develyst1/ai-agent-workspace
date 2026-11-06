# REQ-5004: SOM Dashboard round 2: all-time default + custom period, 1st moves out on voucher / 1 HR, Total = active only, Coach capacity per coach type, title case
**Owner, 2026-11-06:** pasted Khwan's LINE summary after her call (tags the owner and ฟีน). **Status:** OPEN → Silver (SA-B) to check what is back vs Palm's screen, then cut TASKs.
**Follows:** REQ-5002 (UAT PASS 11-06). This changes 3 of the definitions in REQ-5002's customer message (`COPY-DRAFT-khwan-som-dashboard-fixed-and-definitions-2026-11-06.md`): line 3, line 5 and Coach capacity. That draft is HELD until this lands.

## 1. Khwan's words (LINE, 2026-11-06), verbatim
> สรุปจากการโทรให้อีกทีนะคะ @Dong_08 @Feeny♡Lively
>
> Existing customers = ตัวแรกของทุกคำตัวใหญ่ได้ไหมคะ
> Existing customers = Existing Customers
> New vs renewing = New vs Renewing
> Coach capacity = Coach Capacity
> Coach name = Coach Name
> Coach type = Coach Type
>
> 1. หน้าแรกแสดงข้อมูลทั้งหมดที่เก็บข้อมูลมาค่ะ เรามาเลือก period แล้วค่อยแสดงตาม period นั้นๆ
> ต้องเพิ่มเลือก period แบบกำหนดวันด้วยนะคะ จากวันที่เท่าไหร่ถึงวันที่เท่าไหร่ค่า
>
> 2. 1st มาเปิด Voucher หรือ 1hr ต้องย้ายออกจาก 1st ด้วยเหมือนกันนะคะ
>
> 3. Total customers = ขอนับเฉพาะ Course + Voucher ที่ Active อยู่ค่ะ
>
> 4. Coach capacity: 101 / 234 h คือ ชั่วโมงที่มีสอน / ชั่วโมงที่สอนได้ในเดือนนั้น
> ** อันนี้เราขอเซ็ทเลขให้นะคะ
> FT = วันธรรมดา 5hr * วันทำงาน
> วันเสาร์อาทิตย์ 6hr *วันทำงาน
>
> PT = วันเสาร์อาทิตย์ 6hr *วันทำงาน
> Karn **กรณีพิเศษ วันเสาร์อาทิตย์ 4 hr*วันทำงาน
> *** PT ที่มารับ FL วันธรรมดา ไม่ต้องคำนวณค่ะ
>
> FL = ไม่ต้องคำนวณชั่วโมงค่ะ แสดงเฉพาะชั่วโมงที่สอนไป

## 2. What changes (Porter's reading of her words; the SA checks it against the code)
| # | today (REQ-5002) | after |
|---|---|---|
| T | headings "Existing customers", "New vs renewing", "Coach capacity", "Coach name", "Coach type" | Title Case: Existing Customers · New vs Renewing · Coach Capacity · Coach Name · Coach Type |
| 1 | opens on a month | opens on **all data collected**; picking a period narrows it. Plus a **custom from–to date** period |
| 2 | 1st Trial (last 3 months): only opening a course moves a child out; a voucher does not | opening a **course, a voucher or a 1 HR** moves the child out |
| 3 | Total customers: everyone with a course, voucher or class to the period end, each name once | only children with an **Active course or Active voucher**, each name once |
| 4 | capacity = working days × 9 h − leave | **FT** = weekday working days × 5 h + Sat–Sun working days × 6 h · **PT** = Sat–Sun working days × 6 h; **Karn**: Sat–Sun × 4 h; a PT's weekday FL work is not counted · **FL** = no capacity; show hours taught only |

## 3. Acceptance
- **AC-1:** the five headings read exactly as in row T.
- **AC-2:** the Dashboard opens on all data; every card and list agrees with that view. A custom from–to period works for every card, alongside the existing periods.
- **AC-3:** on 1st Trial (last 3 months), a child who opened a course, a voucher or a 1 HR after the 1st is not listed.
- **AC-4:** Total customers = distinct children holding an Active course or Active voucher (same meaning as cards 1 and 2).
- **AC-5:** Coach capacity follows row 4 per coach type. FL shows hours taught with no " / h" capacity. Karn's Sat–Sun rate is 4 h.
- **AC-6:** card number = its list's row count = Tanya's recount, as in REQ-5002 AC-3. REQ-5002's other lines are unchanged.

## 4. For Silver to answer (not questions to the owner or Khwan unless the data can't settle them)
1. Which rows are on the back and which need Palm's screen (headings, all-time default, from–to picker). Palm's screen comes back to Porter; never to Palm directly.
2. "วันทำงาน": where a coach's working days come from today, and whether recorded leave is still deducted (her words don't say).
3. Karn: how the code knows which coach that is, a per-coach setting or the name. Prefer a setting over a hard-coded name; say which.
4. PT + FL on one person (REQ-120 R1.1, role by day): confirm weekday FL classes stay out of that coach's PT capacity, and whether they still count in hours taught.
5. Row 2 applies to card 3 (the one she defined with "ย้ายออก"). Say whether line 10 (1st Trial, no course) is touched; it is not in her words.
6. "All data" with a custom period: what Active course / Active voucher mean for a past range (REQ-5002 §6.1 used month end).

## 4a. Silver's answers, accepted by Porter 2026-11-06 (`CHECK-REQ-5004-som-round-2-2026-11-06.md`)
- Back: rows 2, 3, 4 (numbers) + period query (`from`/`to`, none = all data; `month` keeps working). Palm: 5 headings · period control + all-data default · FL shows hours taught only. Back can deploy first.
- Working days = `teachers.work_days`; recorded leave stays deducted. Karn = a nullable per-coach column, set by one owner `UPDATE` per environment (DATA REQUEST once built).
- Line 10 and card 4 unchanged. A 1 HR moves a child off card 3 only if dated on/after the 1st.
- Over a range: New this month = 1st in the same calendar month as the purchase; earlier = previous.
- **AC-4 amended:** Total also keeps archived students out (REQ-5002 §7.3 stands).
- GO: TASK-756 then TASK-757 (Bob), claims granted.

## 5. Rules
As REQ-5002 §3. No customer message before Tanya passes it; deploys and git are the owner's.
