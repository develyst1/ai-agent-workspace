# CHECK: REQ-5007 §3 item 4, the money side of a whole-course activity change
**Silver (SA-B), 2026-11-07.** Read only: code reading, nothing run, no real data, no build. The button itself and what it does to classes, reports and notices are Sober's (§3 items 1–3). The sizes below are the money part only and exclude QA.

## Answer in short
1. **Today, the money amount never changes by itself.** A course's sale is a fixed ledger row, written when it is sold.
2. **But today's "revenue by activity" looks up the activity when the report is read.** If a course's classes change activity, its whole sale moves to the new activity, **in every month, including closed ones**. The month's total stays the same.
3. **1 HR and Trial need no money work.** Only a course can have a price difference.
4. **A price difference has no way into the books today.** It needs an owner ruling and new work.
5. **The planned Revenue block stores each line, so a change won't move old lines.** It needs one new line type, which is not in the 32.8 d.

## 1. Today, per product
| product | when it posts | what the change does to the money |
|---|---|---|
| **Course** | at sale: `course-{group}-{size}`, amount from the card, ref = the course (`scheduler.service.ts:2642`) | The row stays on the old product code, with the old amount. |
| **1 HR** | at day-end, once attended: `session-{group}`, priced by the booking's program at that moment (`jobs.service.ts:228-234`) | Changed before it is attended: it simply posts at the new program's price. Attended: already locked (`SESSION_DELIVERED`). Nothing to correct. |
| **Trial** | at day-end: `first-trial`, one price for every program | No difference ever. The sale's activity follows the booking. |
| **Voucher** | at sale: `voucher-{hours}`, no activity at all | Nothing: the report shows it as "no activity" by design. |

⚠️ **An imported course has no sale row:** I found no sale posted on the import path. The system has no record of what was paid for it.

## 2. Today's reports, after a course's activity changes (back office)
- **Revenue by activity** (`revenue.service.ts:70-78`, `revenue-attribution.ts:138-150`) follows the course to its class rows and takes **the first one returned**, with no order.
  - **All classes changed:** the whole sale moves to the new activity, including in closed months.
  - 🔴 **Only future classes changed:** the course now has two activities and the query picks either. The sale's activity can flip between two reads of the same month.
    - **So any button that keeps attended classes on the old activity must first change this read** to the course's own `subject_id`. The back office doesn't read that column today (its `course_packages` definition doesn't have it).
- **P&L** (`item.service.ts:171`) groups by product. Across price groups the old course item keeps the sale, so **P&L and revenue by activity disagree** on where it sits. The total agrees.
- **Inside one price group** (the six skate programs share `bike-skate`) the product and price are the same, so there is no difference and no disagreement.

## 3. A price difference
**The card (VAT-inclusive):**
| | 4 h | 6 h | 10 h | 1 h |
|---|---|---|---|---|
| `bike-skate` | 4,790 | 6,490 | 9,790 | 1,390 |
| `onewheel` | 5,790 | 7,900 | 11,900 | 1,690 |
| `balance-private` | not offered | 7,490 | 11,390 | 1,390 |
| `balance-group` | not offered | 5,290 | 7,790 | 1,090 |
| `balance-duo` | 6,800 | 9,360 | 14,200 | 1,900 |

- **Example:** a 6 h `bike-skate` to `onewheel` is +1,410 ฿. A 6 h `balance-private` to `balance-group` is −2,200 ฿.
- **A dead end:** a 4 h course has no Balance Private or Group price on the card, so it can't move there as it stands.

**What's missing today:**
- The back office's manual entry takes a **quantity, not an amount** (`validation.ts:149`), and the amount isn't a field. So 1,410 ฿ can't be typed against a course.
- `reverseBookingSale` covers attendance undo only. Nothing else in the front office reverses or adds money, by the owner's standing line (REQ-036: "no ledger write"; REQ-120 C2).
- `PROGRAM_CHANGED` "carries over" is recorded as a reason only. The money part was marked LATER and was never built.
- **Today's route, ending the course and selling a new one, counts twice:** the old sale stays and the new one posts in full, unless someone corrects it by hand.
  - A discount on the new course might net the new sale down to the difference. **Not run.** Sober's item 1 can say whether it fits her steps.

**Rulings only the owner can make (through Porter):**
1. **Which amount?**
   - **A:** the whole-course difference (+1,410).
   - **B:** only the classes still to come (3 of 6 left = +705).
   - **C:** no charge, record the reason only.
   - **My recommendation: B,** if attended classes stay on the old activity (Sober's item 2), because it matches what was actually taught. It rounds and needs one rule for a discounted course.
2. **May the front office write money?** It would be a new exception to the REQ-036 line. Refunds would stay the back office's in any case.
3. 🔴 **A lower price, refund or credit?** REQ-120 C-f says a refund cancels the unattended classes and tells the family. That **must not fire here**, since the family is staying on. So a difference refund has to be its own kind of entry.

## 4. The planned Revenue block (R2.1–R2.5)
- **R2.2's line stores** type, category, product name and amount at confirm. So a later change does **not** move an old line by itself, and a closed month stays as reported. That is better than today.
- **"ตามความเป็นจริง" then needs one new line type, a re-class pair dated the day of the change:** −X on the old activity, +X on the new. The month's total is unchanged, the closed month stays closed, and the click-through list shows why.
  - X = the part for classes still to come, under ruling 1's B. Old lines are never edited, the same rule the ledger holds today (REQ-083 AC-9).
- **The difference:** a charge is a new revenue line on its payment date, with its method (needs F2). A refund is an expense in the refund month (R2.3), without C-f's cancel.
- **Bonuses:** a change of activity isn't a renewal. Whether it touches F4's first coach link is for the Salary rules (Sober).

## 5. Sizes (money part only, one engineer, excludes QA)
| version | what it does | size |
|---|---|---|
| **M0: same price group only** | The back-office read takes the course's own activity. The button refuses a change across price groups, saying the difference. No ledger write. **Trade-off:** the whole sale moves to the new activity, closed months included, until Revenue ships. | **≈ 0.5 d** |
| **M1: across groups, record only** | M0, plus: shows the difference and stores the admin's decision and amount on the course history. **The books stay short of the difference** until Revenue's manual line ships. | **≈ 2 d** |
| **M2: across groups, posted** | M1, plus: a difference movement with an explicit amount, either sign, on the course's ref, with `customer-spend` and P&L checked so it doesn't read as a second course sold. Needs ruling 2. **≈ 1 d of it is redone** when Revenue moves the posting. | **≈ 4 d** |
| **Revenue block add-on** | The re-class pair and the difference lines in R2.2, R2.3 and R2.5. **On top of R2's ≈ 32.8 d.** | **≈ +1.5 d** |

- **My recommendation: M0 now, the add-on inside Revenue.** It's the smallest honest step: across price groups, staff keep today's route until Revenue ships. Keeping closed months intact in today's report would need a change history (≈ 2 d) that Revenue then replaces, so I wouldn't build it.
- **The risk M0 leaves:** Khwan's "ทุกอย่างถูกต้อง" isn't met for closed months' activity split, or across price groups. **The customer has to be told that plainly.** Whether that's acceptable is the owner's.

## Not verified
- Real data: how many courses change across price groups, and whether any imported course is in the mix.
- The sizes are read from the code, not built.
- Whether the back-office screen lets staff send a ref on a manual entry. The API allows it, but I didn't read the screen.
