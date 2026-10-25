# TEST-118: REQ-129, every row behind the Daily Report's per-coach "Total (+Group)" (uat READ-ONLY)

- **QA:** Tanya
- **Date:** 2026-10-25
- **Environment:** uat (back `d9c0cf3` + front `e7ec71d`)
- **Brief:** Porter's ▶️ TEST-118 entry; `requirements/REQ-129-daily-report-workload-total-group.md`
- **Safety:** read only; 0 writes. Counts and types only; coaches named as in REQ-129; no child names.

**Verdict:**
- **Every number is explained, row by row, and = the report.** For every coach checked, Total (+Group) = **attended/confirmed lessons + lessons ON LEAVE** (status \`SICK_LEAVE\`).
- On these days there are **no group, ECA, camp or live Other classes at all**, so the "+Group" part adds nothing. **The whole gap between "Attended / Confirmed" and "Total (+Group)" is the on-leave lessons.**
- **Kid's calendar column doesn't show those leave rows.** Where a lesson is on leave and another lesson took the same hour, the column shows only the live one.
- (What the label should mean is Silver's question; no cause or judgement here.)

## 24 Oct 2026, All teachers (the CEO's screenshot day)
- **Report:** Total booked 86 · Attended 52 · Confirmed 52 · Pending 0 · Awaiting 1 · **On leave 34** · Cancelled 21.
- **Rows (111):** lessons ATTENDED 52 · **SICK_LEAVE 34** · CANCELLED 21 · PAUSED 1 · Other CANCELLED 3. **0** group, **0** ECA, **0** camp, **0** seats, **0** pending-slot rows.

| Coach | Report: Attended / Confirmed · Total (+Group) | Rows IN Total (time · type · status) | Recount |
|---|---|---|---|
| **Kid** (PT) | 5 / 5 · **7** | 10:00 Voucher ATTENDED · 10:00 Course **ON LEAVE** · 11:00 1st Trial ATTENDED · 14:00 Course ATTENDED · 15:00 Course **ON LEAVE** · 15:00 Course ATTENDED · 16:00 Course ATTENDED. Not counted: 3 Course CANCELLED (14:00, 15:00 ×2) | 5 attended + **2 on leave** = 7 ✅ |
| **Toth** (PT) | 4 / 4 · **8** | 10:00 Course **ON LEAVE** · 11:00 Course **ON LEAVE** · 11:00 Voucher ATTENDED · 12:00 Course ATTENDED · 14:00 Course **ON LEAVE** · 15:00 Course **ON LEAVE** · 15:00 1st Trial ATTENDED · 16:00 Course ATTENDED | 4 attended + **4 on leave** = 8 ✅ |
| **Tarb** (FL) | 0 / 0 · **2** | 11:00 Course **ON LEAVE** · 15:00 Course **ON LEAVE**. Not counted: 12:00 Course CANCELLED | 0 + **2 on leave** = 2 ✅ |
| **Ek** (FT) | 0 / 0 · **1** | 11:00 Course **ON LEAVE** | 0 + **1 on leave** = 1 ✅ |

- Every row has the coach as the **main** teacher (no extra-teacher rows).
- **Kid's calendar column, 24 Oct (API grid):** 10:00 Voucher · 11:00 1st Trial · 14:00 Course · 15:00 Course · 16:00 Course, all ATTENDED: **5 shown**. The 2 on-leave courses (10:00, 15:00) share their hour with an attended lesson, so the column shows the attended one.

## Khwan's screenshot (Kid 3 / 6 · Total 9) is **25 Oct**, not 24 Oct
- **Report 25 Oct:** Kid attended **3** / confirmed **6** · Total (+Group) **9**, exactly her numbers.
- **Rows:**
  - 10:00 1 HR ATTENDED + 10:00 Course **ON LEAVE**;
  - 11:00 1 HR ATTENDED + 11:00 Course **ON LEAVE**;
  - 12:00 1 HR ATTENDED + 12:00 Course **ON LEAVE**;
  - 15:00, 16:00, 17:00 Course CONFIRMED.
  - Recount: 3 + 3 confirmed + **3 on leave** = 9 ✅.
- **Kid's calendar column, 25 Oct:** 10:00 / 11:00 / 12:00 **1 HR** (her "3 green") + 15:00 / 16:00 / 17:00 **Course** (her "3 blue") = **the 6 she sees**.
- **The 3 on-leave courses at 10:00 / 11:00 / 12:00 are hidden behind the 1 HR lessons in the same hours, but are counted in Total (+Group).** That is the 9 − 6 = 3 she can't see.
- 25 Oct All: TB 105 · Att 35 · Conf 77 · Pend 1 · Leave 28 · Canc 21 (rows: lessons only; no group / ECA / camp).

## For Silver (facts only)
- **On these two days, Total (+Group) − Confirmed = the coach's on-leave lessons, every time.**
- The "+Group" label suggests group classes; on these days there were none.
- On the calendar, an on-leave lesson that another lesson replaced in the same hour is not visible.

**Scripts (scratchpad):** `u118.js` (24 Oct, 4 coaches), `u118b.js` (any date / coach; run for 25 Oct, Kid).
