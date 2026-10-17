# Questions for the owner's meeting on Daily report + Overview — @Porter, 2026-10-11
**Owner:** *"dairy report เราจะยังไม่ทำ วันนี้ ฉันมีนัดคุยเรื่อง report + overview ที่ฉันเคยให้ปาล์ม comment ไว้มั้ง · นายช่วย ทำ List ที่ต้องถาม ให้ด้วย"*
**State:** Daily report TASK-723/724 are cut and HELD until this meeting. Overview is being re-opened, super-admin only (owner, same message).
⚠️ **Palm's comments on report/overview are NOT in our repo.** I searched the workspace and the front repo history. The Overview screen was built 19–27 Aug (front commits `4920f86`, `5e331ee`, `982ba08`). **If Palm's comments are in a chat or a file, bring them. The questions below are from OUR records only.**

## Daily report (proven on sid, TEST-092)
**The fact to open with:** the report counts **camp as coach-hours**, not as children. Khwan's 28 Sep: screen 17 = 9 lessons + 8 camp coach-hours, while she counted 9. On sid: 27 Sep shows 9, the truth is 4 · 30 Sep shows 15, the truth is 10 (the 7 camp children who came are not counted at all).
1. **What is the Daily report FOR, to her team?** Checking that the day ran? Coach pay? Sales? The answer decides what "Attended" must mean.
2. **Camp:** count the **children who came**, as their own row, with the coach-hours OUT of the totals? *(team recommendation: yes)*
3. **Group classes:** count them in Total booked / Attended, as their own row? *(rec: yes. Today the back counts them and the screen does not.)*
4. **On leave:** keep it OUT of Total booked, as its own line? *(rec: yes. Her 22 − 17 = 5 is exactly that.)*
5. Do they also want **coach-hours** somewhere (for pay)? If yes, as a separate block, never mixed into "Attended".
6. Any split they need: by coach · by branch · by booking type (today "By booking type" has no camp / Other / Group row).

## Overview (re-opened tonight, super admin only)
**What it is today** (`OverviewContent.tsx`), three zones: **1 Pulse** (attendance rate · total booked · total attended · total sales THB · a booked-vs-attended trend) · **2 Business** (existing / new customers, active course / voucher, the last 3 months, course-size and activity-share donuts, sessions by branch) · **3 Revenue**. Range: today / week / month / custom.
7. **Who should see it after super admin?** The owner only · a "board" role (REQ-092's example) · Khwan?
8. **Which zones are actually used?** Anything to drop, or anything missing?
9. 🔴 **"Total booked / attended" here must mean the SAME as in the Daily report.** If the report changes (camp = children), Overview changes with it. Agree it is one definition?
10. **"Sales / revenue":** counted when SOLD, or when USED (deducted)? Including refunds and rentals?
11. **"Existing / new customer":** what counts as new? First purchase ever, or first in N months?
12. Is the trend's default range right (today / week / month)?

## Not for the meeting, already decided
- Daily report build = TASK-723 (BE M) + 724 (FE S), ready to go the minute these answers land.
