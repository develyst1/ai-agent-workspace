# INTAKE 2026-11-09: ขวัญ's LINE of 2026-11-09 (front office plus back-office answers)

Porter, 2026-11-09 ~22:55. Source (verbatim): `project-docs/customer-2026-11-09-line-som-system/line-som-system-2026-11-09-VERBATIM.txt`.
Her answers are filed in `CUSTOMER-ANSWERS.md` § "2026-11-09 LINE". **The owner said his answers on that call were rushed.** Items marked ⚠️ wait for his word.

## Front-office work she listed (17:31): mapped to what we already have
| # | Her item | Existing | Status / owner |
|---|---|---|---|
| F1 | A fixed schedule needs 2+ days/week and multi-hour sessions; a leave moves the class to the NEXT real class day in order (17:08 item 1) | REQ-030 (editable recurring plan) is related | **NEW REQ needed.** SA step 0: Sector |
| F2 | A PENDING course sends parents NO notification (e.g. on a leave); notify only after Confirm Course (17:08 item 2) | none found | **NEW REQ needed.** SA step 0: Sector |
| F3 | Change a whole course's activity | REQ-5007 | ⚠️ HELD: the owner talks to พี่เบส first |
| F4 | Close a whole day's schedule | to find (grep found no clear REQ) | SA step 0: Sector, find or scope it |
| F5 | A leave extends the class onto the same date | REQ-5006 (reproduced, TEST-140) | SA step 0: Sector (Sober explained it 11-07) |
| F6 | Dashboard per her latest feedback (13:33: Total Customer + 1 Hr last 3 months; pie chart preferred; no vouchers; count courses; 1st Trial separate) | REQ-5004 / REQ-5009 (Palm's SOM dashboard) | ⚠️ owner: who builds it (Palm or us)? |

## Back-office answers that change a decision
- ⚠️ **Park fee:** «พร้อมกันหลายกรุ้ปได้» (several groups in the same hour) conflicts with DECISIONS-REQ-120-build row 11 (one block per hour). Silver (Team B, F5 / TASK-861) to size the change.
- ⚠️ **Revenue start:** «เริ่มนับคำนวณเดือนนี้ได้เลย». Is "this month" the go-live month (D5) or Nov 2026? Not confirmed.
- **Bonus 100 = 1A** (a renewal after go-live counts; no backdating; she enters the pre-go-live days of the month by hand). It matches the built default (DECISIONS row 12, 1A).
- **Data:** staff/types, vehicles, schools + distances and Merit come from her "tonight". Revenue categories + branches are ON HOLD (the owner will make a simple visual first).

## Her open question to us (19:58–21:11)
Why is REPORT · COURSE · STUDENT its own timeline line? A reply is drafted for the owner (in Porter's chat), formal tone, saying nothing about it being built already (omakase rule).
