# REQ-5014: Change the activity of a whole course from the next class (option A, no refund)
**Status:** READY_FOR_SA → @Silver (Team B) · **Written:** 2026-11-13 by Porter (PM) · **Priority:** HIGH. This is a paid item: พี่ฟีน picked option A on 2026-11-12, 1,900 ฿, inside the 4,000 deal.
**Go:** the owner says the build pause covers the back office only (SYSTEM-FACTS 2026-11-12). The owner also lifts REQ-053 for this action (SYSTEM-FACTS 2026-11-13).
**Sources:**
- REQ-5007, her ask of 11-07;
- CONCEPT-F3-change-activity-2026-11-11.md, which this REQ replaces wherever the two differ;
- CHECK-REQ-5007-money (Silver);
- DECISIONS-REQ-120-build row 24, her money ruling of 11-10;
- her answers of 2026-11-13 00:26 (CUSTOMER-ANSWERS);
- REQUEST-porter-to-silver-2026-11-13-change-activity-her-answers.md § Answer.

## Problem
Parents are switching activities more and more. Today the admin's only path is End early plus a new course. That path counts the money twice and splits the history across two courses.

## Acceptance criteria
1. **Change activity** is available on a course and on a 1 HR or Trial booking. The admin picks the new activity and, optionally, a new coach for the remaining classes.
2. **Only classes from the next one onward change.** Attended and no-show classes keep their activity, coach and date (her 00:26 answer 1). The course keeps its size and its expiry.
3. **The difference is pro-rated on the remaining classes:** (new package price − old package price) × remaining ÷ size, rounded to whole baht. Her example: 100 → 120 for 10 classes, 4 left, so the difference is 8 ฿. The confirm screen shows it. The admin records it through **Add Manually**, linked to the course, with the reason «ส่วนต่างเปลี่ยนกิจกรรม».
4. **Option A:** when the new activity is cheaper, the difference shows as 0. There is no refund.
5. **No price on the card for that activity × package:** the admin types the full-package price (whole baht, greater than 0 and at most 100,000). It is used only to work out the difference and is stored on the history row as «ราคาพิมพ์เอง». It never overrides a price the card has, and it is never saved to the card (her 00:26 answer 3, Silver's defaults). 1 HR and Trial follow the same rule.
6. **Revenue (her 11-10 ruling):** the sale line keeps its amount and its month. Only its **category** follows the new activity, and the line carries a history note («เปลี่ยนจาก X เป็น Y วันที่ … โดย …»). The Detail row shows «X → Y». The «revenue by activity» read takes the course's own activity (Silver's M0 fix).
7. **Statistics and the teaching report** count each class by what it actually was.
8. **Notices:** the family and the coach each get one short notice when the change is confirmed.
9. This action is not a renewal. The Bonus 100 / first-coach link is unchanged.
10. Existing courses behave as today when nobody uses the action (the regression suite stays green).

## Out of Scope
- A refund when moving to a cheaper activity (option B, not bought).
- Changing classes that were already attended.
- Saving a typed price to the price card.

## Notes
- **Size:** Silver's quote, about 6.5–8 d including the typed price (+0.5 d).
- **Calendar target:** about 5–11 working days (Sector's plan, option B, Team B).
- **Revenue pieces:** these sit with the Revenue block, which is Team C's per CONCEPT-F3 §4. Silver coordinates the seam with Sector. Until the Revenue block reaches uat, the rows for criterion 6 can ship behind it.
- Questions go in `## Questions`.

## Questions
