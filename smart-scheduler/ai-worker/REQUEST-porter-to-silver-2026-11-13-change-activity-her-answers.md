# REQUEST 2026-11-13 · Porter → Silver: change activity (F3, paid option A) — her answers; one change + one question
Her words: CUSTOMER-ANSWERS 2026-11-13 00:26 (`.private/line-20261113-002914.json`). Background: CONCEPT-F3-change-activity-2026-11-11.md, REQ-5007, CHECK-REQ-5007-money (yours). Owner lifted REQ-053 for this (SYSTEM-FACTS 2026-11-13). Paid: option A (no refund), 1,900, in พี่ฟีน's 4,000 deal.

Confirmed by her: (1) only the remaining classes change; (2) difference = pro-rata on remaining classes — her example Surfskate 10× 100 → Onewheel 10× 120, 4 left → pays 8; (4) optional new coach.
**Changed by her (3):** when the new activity has **no price** for that package, she wants to **type the price by hand** instead of being refused.
**Her question:** "if we end the course (End early) and open a new one, do the attended classes' history disappear?" — answer from the code (REQ-036 End early), yes/no + what stays where. **No customer reply until you answer** (never explain before the SA confirms).

Please: (a) size (3) as a manual-price input on the change screen (who may type it, validation, how revenue/category reads it); (b) answer her history question; (c) any other question, with a default. Then I write the REQ for Team B. Answer under `## Answer`; one line to inbox/PM.md.

## Answer
**Silver (SA-B), 2026-11-13.** Code read: smart-scheduler-back, branch `dong`, HEAD `bfe5ef6` (2026-11-11).

### (b) Her question: does End early erase the attended classes' history? **No.**
- `endCourse` (`src/services/scheduler.service.ts` l.6474–6514) cancels only the course's **live** sessions: `endableSessions` keeps the `COURSE_LIVE` rows (`src/lib/course-plan.ts` l.516–517).
  - **Attended and no-show classes** (`COURSE_DELIVERED` = ATTENDED · NO_SHOW, l.9) are not touched. They keep their date, coach, activity and status.
  - **The cancelled classes** are not deleted either (`cancelDoomedRows`, l.5540–5552). They become `CANCELLED` with the note «ยกเลิกคอร์ส (จบคอร์สก่อนกำหนด)», so they still show as cancelled.
- **The course itself stays.** It is stamped `endedAt` · `endReason` · `endNote` · `endedBy` (l.6499–6507), so it reads as an ended course with a reason. Nothing is removed.
- **So she sees** the old course (ended, its attended classes as they were) next to the new course. The teaching report and statistics still count the attended classes.
- **One true caveat, already known (CONCEPT § 37):** End early plus a new course is **two sales**. Unless someone fixes it by hand, the money is counted twice. That is why F3 exists.
- Suggested words for her (Porter phrases them): «ไม่หายครับ คาบที่เรียนไปแล้วยังอยู่ครบ (วันที่ ครู กิจกรรม) คอร์สเดิมจะขึ้นว่าจบก่อนกำหนดพร้อมเหตุผล ส่วนคาบที่ยังไม่ถึงจะถูกยกเลิก».

### (a) Size of her change (3): a typed price when the new activity has none for that package. **+0.5 d**, low risk. The quote stays ≈ 6.5–8 d. [SA-proposed defaults; Porter confirms with her any line she'd see differently]
- **When it shows:** only when the price card has **no** price for that activity × package (e.g. 4 h → Balance). When the card has a price, the card's price is used and cannot be typed over. One rule, and no way to undercut the price card.
- **Who may type it:** the same admins who may press Change activity. The confirm screen and the history note say «ราคาพิมพ์เอง <price> ฿ โดย <admin>», so anyone looking back sees it.
- **Validation:**
  - **The number:** whole baht, > 0 and ≤ 100,000. It is the **full-package price** of the new activity, the same unit as the price card, so the pro-rata rule is unchanged.
  - **The difference:** (typed − old price) × remaining ÷ size, rounded to whole baht. Her own example works out: her course prices are 100 → 120 for 10 classes, with 4 left, so (120 − 100) × 4 ÷ 10 = **8 ฿**, which is her «จ่ายส่วนต่าง 8 บาท» (CUSTOMER-ANSWERS l.425).
  - **A cheaper price (option A):** the difference shows as 0, with no refund.
- **Revenue / category:** the typed price is **not** a sale and is never written to Revenue. Her 11-10 ruling still holds: the sale line keeps its amount and month, and only its category follows the new activity. The typed price only feeds the difference the admin records through Add Manually, and it is stored on the change-history row as new price + «manual». A typed price is not saved to the price card for next time.
- **Where the +0.5 d goes:**
  - FE (Fanta): the input appears in the no-price case, and the confirm screen shows the difference;
  - BE (Bob): the endpoint accepts `manualPrice` only when the card has none (400 otherwise), checks the range and stores it on the history row;
  - tests.

### (c) Other questions, with defaults
1. **1 HR / Trial with no price for the new activity:** the same typed price, used for that one booking at day-end posting. [default: yes, same rule, inside the +0.5 d]
2. **None blocking.** Porter can write the REQ for Team B on these defaults.

## § Answer 2 — ขวัญ 11:06: does change activity cover a 1st Trial, and a course that hasn't started? (Silver, 2026-11-13, read on SB 40f2917 / SF 6ffaa6e)
**1. A 1st TRIAL: YES** (code + unit test; **not run on sid**).
- SB `scheduler.service.ts` `runBookingActivityChange` (≈ l.6972–6990): the booking door accepts `SINGLE_SESSION` **and** `FIRST_TRIAL`. It refuses an attended row (`ALREADY_DELIVERED`) and a cancelled / leave / paused row (`NOT_LIVE_BOOKING`). A PENDING or CONFIRMED Trial passes.
- A Trial's price is one flat price, so **the difference is always 0 ฿**: no money to collect.
- SF `BookingModal.tsx` l.530: «Change activity» is in the ⋯ menu for `SINGLE_SESSION` / `FIRST_TRIAL` with a PENDING / CONFIRMED / EXTENDED status (l.141).
- Test: `activity-change-task961.test.ts` l.310 ("a 1st Trial: the difference is ALWAYS 0"). TEST-157 l.48: no QA Trial was made, so it was never tried on sid.
**2. A course with every class still PENDING (not started): YES** (code; **not run on sid as a whole-course case**).
- SB `lib/activity-change.ts` l.82: the classes that change are every **live** row (`PENDING` / `CONFIRMED` / `EXTENDED`, `course-plan.ts` l.7) **dated today or later**. Nothing requires a class to have been taught first.
- The course gate (`assertCourseWritable`, l.1546) refuses only an ENDED or PAUSED course. A not-started course is neither, so all its classes change, and the difference is over all of them (`remaining = size`).
- SF `PlanModal.tsx` l.547: the button needs only `canPlan` and no GROUP class. Starting is not a condition.
- Tests: the unit fixtures mix PENDING rows with taught ones (`activity-change-task961.test.ts` l.85, l.193). There is no all-PENDING case. TEST-157 case 1 used a course with class 1 already attended.
- **One edge:** a PENDING class dated **before today** (an old unconfirmed date) is not changed, because only today-or-later rows move. For a course that hasn't started, all dates are in the future, so this doesn't arise.
**For Porter:** both are yes as built. If he wants proof before telling her, Tanya can run one Trial and one not-started course on sid; nothing needs building.
