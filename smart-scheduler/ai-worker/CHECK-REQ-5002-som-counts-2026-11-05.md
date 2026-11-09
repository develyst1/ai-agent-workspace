# CHECK: REQ-5002, SOM Dashboard counts vs Khwan's 11 definitions (@Silver, 2026-11-05)
**Read only: nothing changed.** Code = `smart-scheduler-back`, `src/lib/som-contract.ts`, read at the current working tree. The screen is Palm's (`SomContent.tsx`, `NvrDetailModal.tsx`), read only.
**Not in this file:** row counts. I don't read uat. "Which way" is from the code; **how many rows comes from Tanya's recount.**

## 1. Why the cancelled rows are counted (the mechanism)
"Cancelled" on a course = `endedAt` is set (`course-status.ts`, first rule). That covers a course cancelled outright and one ended early after some classes. New vs Renewing never checks it for the purchase being counted:
1. **The purchase's own status is ignored.** The loops at `:450` (courses) and `:465` (vouchers) count every purchase by its buy date. A cancelled course stays in New or Renew forever.
2. **A cancelled earlier course counts as "ended", which makes the next purchase a renewal.** `RENEW_ENDED_STATUSES` (`:372`) includes CANCELLED, and `kindOf` (`:441`) reads it. So a re-booking after a cancel is a "Renew".
3. **A cancelled course also "buys" the child out of other lists:** `boughtByAsOf` (`:225`, comment: *"A purchase counts whatever became of it"*), `trialNotConverted` (`:435`) and `renewedLater` (`:473`).
4. **"Not renewed" counts a cancelled course as finished** (`:483`, `:488`).
5. **The class rows are already safe.** Trials (`:233`, `:410`), the branch test (`:208`, `:393`) and capacity (`:548`) skip CANCELLED rows.
   - **With a branch filter selected,** a course whose rows are all cancelled drops out through `inBranch`. So the same card can differ between "no filter" and a filter.

**This is our rule, not a data fault.** `TASK-742` built it from my CHECK-REQ-124 default Q3.7 ("ended" includes cancelled) and from TEST-109 N1. Khwan hadn't ruled on either.

**จาญ่า (Renew Course, Oct 2026: 4 rows; Bookings page: Cancelled 3, Active 1, Completed 1):**
- ✅ Points 1 + 2 can produce exactly this: 5 courses, the first is not a renewal, and the other 4 are.
- **What decides row 15** is the order on her Bookings page, which Tanya reads. After the fix her 3 cancelled courses are gone, leaving 2:
  - if the Active one was bought after the Completed one had finished: **one row stays**, a real renewal;
  - if it was bought while the Completed one was still running: **no row** (see Q6).
- Not proven against her rows until Tanya's TEST.

**One claim of hers I can't reproduce from the code: "1st" counting cancelled classes.** `:410` skips a cancelled trial row, so the 1st Trial card should not count one. Tanya's recount settles it. If she finds such a row, it comes back to me.

## 2. The 11 lines + Coach capacity
"Differs" = today's rule against §1 of the REQ. All 11 also need her last line: **no cancelled course or class.**

| # | line | today (file:line) | her definition | same? | if changed, rows go |
|---|---|---|---|---|---|
| 1 | **Active course** | PEOPLE (K1, `:14`) holding a course that is ACTIVE at month end: not ended, not paused, not used up, not expired (`:218`). No schedule needed | a course with classes scheduled, not paused | **pause: same · cancelled: same.** **Differs:** a course with no class booked counts today. Unit: she wrote "คอร์ส", K1 says people (Q2) | down |
| 2 | **Active voucher** | PEOPLE holding an ACTIVE voucher (`:219`) | a voucher that's been opened for use | **same**, on the plain reading | none |
| 3 | **1st Trial (last 3 months)** | people with a non-cancelled trial class in the selected month and the 2 before (`:190`, `:233`), minus those who bought a course (`:240`) | 1st Trial children of the past 3 months, out once they take a course | **same, except:** a **cancelled** course still moves the child out | up |
| 4 | **1 HR (last 3 months)** | people with a non-cancelled 1 HR class in the window. **Nobody moves out** (`:18`, `:241`) | children with only 1 HR who never opened a course, past 3 months | **differs:** a child with a course still counts. Her 06:26 question: yes, it **is** per name (a set of people) | down |
| 5 | **Total customers** | distinct names: Active course + Active voucher + 1st Trial + 1 HR of the **selected month only** (`:243`) | all customers, by name | **by name: same. Which set: unclear** (Q7). Today's total isn't the union of the 4 cards above it | either way |
| 6 | **1st Trial** | people whose **earliest** non-cancelled trial class is in this month, any status: booked, future and no-show count (`:411`, `:433`) | 1st Trial children who came this month | **differs:** "มาเรียน" = attended (Q3) | down |
| 7 | **New Course this month** | a course with no earlier course, in the month of the child's trial, **or the buy month if no trial** (`:460–462`). Bought in a later month still lands in the trial's month | a child's 1st Trial this month, and the course opened this month | **differs:** no-trial courses count, and later-month purchases count | down |
| 8 | **New Course previous month** | same, when the trial was in **exactly** the month before, **whenever** it was bought (`:463`) | a child's 1st Trial before this month, who opened a course | **differs** (Q5): bought in the trial's own month counts again here; a trial 2+ months ago lands on no card | either way |
| 9 | **Renew Course** | a course or voucher bought when every earlier **course** had ended, cancelled included (`:441–468`). Voucher after voucher = **not** counted (a voucher looks only at earlier courses). Voucher after course = counted | course after course, voucher after voucher | **differs:** voucher → voucher is missing; voucher after course is extra; the cancelled rows of §1 | down for cancelled + voucher after course; up for voucher → voucher |
| 10 | **1st Trial, no course** | line 6's people with no course bought by month end (`:435`), voucher doesn't convert (Q3.4) | 1st Trial children who haven't opened a course | **same, except:** a **cancelled** course counts as converted. Follows line 6 if Q3 changes | up (cancelled), down (Q3) |
| 11 | **Course / Voucher not renewed** | ended this month (cancelled, used up or expired) and nothing newer bought (`:475–489`) | courses / vouchers that finished and weren't renewed | **differs:** cancelled counts as finished; a cancelled purchase counts as "renewed" | down |
| + | **Coach capacity** | see §4 | she asked what it means | no change asked | none |

> ⚠ **§3 is withdrawn:** REQ-5002 §5 ruled these, and §10 carries the result. Kept as the record.

## 3. Questions only she can answer (for @Porter to batch). The default is what I build if unanswered
| Q | question | default |
|---|---|---|
| Q1 | A course **really cancelled after some classes were taught** (reason ADMIN_ERROR / PROGRAM_CHANGED / CUSTOMER_CANCELLED): out of all counts, like one never taught? | out. **⚠ Corrected 11-05, see §8:** this no longer covers **ตัดจบคอร์ส** (ENDED_EARLY), which by her own words is not a cancel |
| Q2 | Active course / voucher: count **children** (the owner's K1, today) or **courses**? And "มีตารางลงเรียนอยู่": must it have an upcoming class, or is any unfinished course enough? | children; an upcoming class required (her words) |
| Q3 | 1st Trial "ที่มาเรียน": attended only? (Today: booked, future and no-show count too. REQ-124's K2 said "booked"-month by class date) | attended only |
| Q4 | A course bought with **no 1st Trial** is on **no card** under her definitions. OK? | yes, as she wrote; and it is listed in her definitions list as not counted |
| Q5 | "New Course previous month": a trial in **any** earlier month or only last month? And must the course be bought **this** month? | any earlier month, bought in the selected month |
| Q6 | A renewal bought **before** the old course finished is on no card today (my 10-18 default, never hers). Count it as Renew? | keep it off, until she says |
| Q7 | Total customers: the names on the 4 cards above it, or something wider? | the union of the 4 cards above, as shown |

**Course after voucher and voucher after course** are on no card under her line 9 (default: as she wrote).

> ⚠ **§4's lines 1, 2, 5, 7, 8, 9 are replaced by §10.**

## 4. The plain definitions list (AC-4; for Porter's Thai). It describes the counting AFTER the fix, with the defaults above; **it goes out only after Tanya passes it**
All lines exclude cancelled courses and classes. Branch filter: a class by its own branch, a course or voucher through its classes. Dates are Bangkok calendar days. "Opened" = the day the course was created.
1. **Active course:** children with a course that has an upcoming class. Not paused, not used up, not expired. One child with 2 courses = 1.
2. **Active voucher:** children with an opened voucher, not used up, not expired. One child with 2 = 1.
3. **1st Trial (last 3 months):** children with a 1st Trial in the selected month and the 2 before it. Out once they open a course. A voucher doesn't move them out.
4. **1 HR (last 3 months):** children with a 1 HR class in the same 3 months who have never opened a course. Counted by name.
5. **Total customers:** the names on the 4 lines above, each name once.
6. **1st Trial:** children who attended their first 1st Trial this month.
7. **New Course this month:** children with their 1st Trial this month and their first course opened this month.
8. **New Course previous month:** children with their 1st Trial in an earlier month and their first course opened this month.
9. **Renew Course:** a course opened after an earlier course had finished, or a voucher opened after an earlier voucher had finished. Counted per purchase, in the month it was opened.
10. **1st Trial, no course:** the children of line 6 with no course opened by the end of the month. A voucher doesn't count as a course.
11. **Course / Voucher not renewed:** finished this month (used up, expired, or cut short with ตัดจบคอร์ส) and nothing newer opened. It leaves the list as soon as the family buys again.

**Coach capacity** (her 06:06 question): **Hours = booked hours / available hours.** On her shot, 101 / 234 h = 54 / 153 h weekday + 47 / 81 h weekend.
- **Booked:** that coach's lessons and group classes in the month, including an extra coach. Not cancelled rows, not ECA, not camp. Rounded to whole hours.
- **Available:** the coach's work days in the month × **9 hours** a day (`:503`), minus recorded leave days. Saturday + Sunday = weekend. Her shot fits: 153 = 17 days × 9, 81 = 9 days × 9.
- **% =** booked ÷ available, capped at 100. Hours are not capped.

**Limits:**
- Past months can change when something is cancelled later, or when a family renews later.
- There is no stored trial → course or course → renewal link, so these are worked out from the child and the dates.
- A pause that was later resumed leaves no trace.
- ⚠️ The rule that a past month's Active counts are as-of month end stays.

## 5. Bonus: AC-5
Nothing here touches Bonus. F4 isn't built, and R1's "Voucher after voucher is NOT a renewal" stands. The dashboard's Renew rule stays in `som-contract.ts` only, and F4 must not reuse it. A warning goes in TASK-754.

## 6. Palm's screen
- **Nothing is required of Palm.** The whole fix is on the back, with the same fields and shapes.
- **For the owner to weigh; each needs Palm, and neither is in my TASKs:**
  1. The 5 Existing Customers cards have **no list** (`SomContent.tsx:111–123`). AC-3's "card = list" can only be checked on the 6 New vs Renewing cards. Tanya recounts the other 5 from the raw API.
  2. Her 06:30 question could also mean on-screen explanations. My answer is the list in §4, not a screen change.
  3. The Thai label "ต่อคอร์ส" will now include voucher → voucher. The English is her word already.

## 7. TASKs (HELD for @Porter's GO; REQ AC-2 says differences first)
- **TASK-754** (≈ 1.5 d): AC-1 and the lines that need no answer: cancelled out everywhere, 1 HR move-out, Renew's voucher rules.
- **TASK-755** (≈ 2 d): lines 1, 5, 6, 7, 8, once Q2–Q5 + Q7 are answered, or on the defaults if Porter says so.
- **Total ≈ 3.5 d** (+10 % included), Bob, on the back only. Then my review, then Tanya's recount.

## 8. Added 2026-11-05, after TEST-136 (Tanya, uat, read only)
**จาญ่า: settled.** Rows 1, 2, 3 are her 3 cancelled courses, all bought 01/10. Row 15 is the live course bought 09/10, after her completed course. **Row 15 stays.** That confirms §1.

**Her "1st" complaint: settled.** The 1st Trial lists hold 0 cancelled classes, as the code said. What she can see is a cancelled **course**: 3 kids are off the 3-month line only because of one.

**🔴 My Q1 default was wrong, and I'm correcting it.**
- I wrote that a course ended early is out, "same as her label". Her own words on exactly that case (REQ-126, 10-24): *"แต่ไม่ใช่การ pause ไว้ หรือ cancel ไปค่ะ"*, and the money stays in full. I missed this.
- The system now records it apart from a cancel: reason `ENDED_EARLY` (TASK-837, live on uat 10-26). 0 such courses on uat, so **no number below changes today**.
- **The rule should be:** cancelled = ended with any reason **except** ENDED_EARLY. An ENDED_EARLY course stays in New / Renew, counts as finished for the next Renew, and appears in Not renewed.
- **A course cut short before 10-26 can't be told apart:** it was ended with a cancel reason, so it counts as cancelled.
- **Her Bookings chip:** `courseStatus` still calls any ended course CANCELLED, so a ตัดจบคอร์ส course may read "Cancelled" there. Not read on screen; not in this REQ.

> ⚠ **The "after TASK-755" column below is replaced by §10.**

**AC-2: the differences, with rows (Oct · Nov). ✅ Exact after DR-7 (TEST-136 "After DR-7", which replaces my estimates).** Expected after each TASK:

| line | today | after TASK-754 | after TASK-755 (defaults) |
|---|---|---|---|
| Active course | 185 · 190 | same | **183 · 190** (the reading in §9) |
| Active voucher | 49 · 49 | same | same |
| 1st Trial (3 months) | 173 · 161 | **176 · 164** | same |
| 1 HR (3 months) | 102 · 107 | **88 · 91** | same |
| Total customers | 361 · 263 | same | **434 · 432** (the 4 cards' union; follows Active course's reading) |
| 1st Trial | 123 · 11 | same | **123 · 7** |
| New Course this month | 43 · 1 | **35 · 2** (cancelled out; a live course whose only earlier course was cancelled moves in from Renew) | **27 · 1** |
| New Course previous month | 18 · 35 | **10 · 28** | **0 · 1** (Q5's default, first course: children here open a course in their trial's month) |
| Renew Course | 62 · 30 | **40 · 19** (Oct: 62 − 19 cancelled − 1 voucher after courses − 2 that renew only a cancelled course) | same |
| 1st Trial, no course | 96 · 10 | 96 · 10 (my "up" in §2 didn't happen in the data) | **96 · 6** (Nov follows 1st Trial's 7) |
| Not renewed | 43 · 14 | **32 · 6** | same |

These are the numbers TASK-754's gate should recount. Where mine and Tanya's §3 differ, her recount decides.

**Tanya's Q5 = my Q6, her Q6 = the correction above.** Her Q1–Q4 are my Q5, Q7, Q2, Q3.

## 9. Added 2026-11-05: TASK-755's reading of Active course in a past month
**Picked: 183 (Oct).** A course counts when it was ACTIVE at month end and has a non-cancelled class dated after that day, whatever that class's status is now.
- **Why not 172 ("classes still not held today"):** it shrinks as time passes. Once November's classes are held, October's number falls, and a past month would keep changing for no real reason.
- **The known limit:** nothing records when a class was booked or cancelled. So a past month can include a class booked after month end, and can miss one that was cancelled after it. **That is in the definitions list.**
- **The current month has no gap:** 190 on either reading.
- **Line 5 follows:** Oct Total = 434 on this reading.

**Add to §4's limits, for the definitions list:**
- Active course in a past month is read from the classes as they stand today, not as they stood then.
- A course ended with ตัดจบคอร์ส shows Cancelled on her Bookings page, but it stays counted on this dashboard as a finished course.

**For Q6, the size of the question:** a course bought while an earlier one ran is on no card: Oct 21 (15 live), Nov 4 (1 live).

> ⚠ **§10's table, New lines and flags are superseded by §11 (REQ-5002 §6 + §7).**

## 10. Added 2026-11-05: after Porter's rulings (REQ-5002 §5). Replaces §3's defaults and §8's last column
**Expected on uat data (Oct · Nov), for Tanya's gate:**
| line | today | now | source |
|---|---|---|---|
| Active course | 185 · 190 | **to recount** (courses with a class dated after the as-of day). People were 183 · 190; packages 197 in Nov | Tanya |
| Active voucher | 49 · 49 | **50 · 51** | TEST-136 |
| 1st Trial (3 months) | 173 · 161 | 176 · 164 | TEST-136 |
| 1 HR (3 months) | 102 · 107 | 88 · 91 | TEST-136 |
| Total customers | 361 · 263 | **to recount.** Tanya's 539 is everyone ever, not cut by month | Tanya |
| 1st Trial | 123 · 11 | 123 · 7 | TEST-136 |
| New Course this month | 43 · 1 | **to recount** (27 · 1 was first course only) | Tanya |
| New Course previous month | 18 · 35 | **5 · 3** | TEST-136 ("any live course opened this month") |
| Renew Course | 62 · 30 | **up to 55 · 20** (40 · 19 + the live courses bought while an earlier one ran, 15 · 1) | mine; Tanya decides |
| 1st Trial, no course | 96 · 10 | 96 · 6 | TEST-136 |
| Not renewed | 43 · 14 | 32 · 6 | TEST-136 |

**The definitions list, the lines that change:**
1. **Active course:** courses that have a class scheduled after that day. Not paused, not used up, not expired. A child with 2 courses = 2.
2. **Active voucher:** vouchers that are open, not used up, not expired. A child with 2 = 2.
5. **Total customers:** every child who has had a class or a course / voucher (cancelled ones don't count) up to the end of that month, each name once.
7. **New Course this month:** a course opened this month by a child whose 1st Trial was this month.
8. **New Course previous month:** a course opened this month by a child whose 1st Trial was in an earlier month.
9. **Renew Course:** a course opened on a later day than an earlier course of the child, even if that one is still running; or the same for a voucher after a voucher. Counted per purchase.

**🚩 Where I read her words differently (Porter asked me to flag):**
- **Q5, "first course".** §5 quotes *"เดือนก่อนๆ ที่เพิ่งมาเปิดคอร์สในเดือนปัจจุบัน"* and *"นักเรียนใหม่เดือนอื่นมาเปิด"*. The full lines start with the word **new**: *"ลูกค้าใหม่จากเดือนก่อนๆ ที่เพิ่งมาเปิดคอร์ส"* (meeting §3.2), and the sheet says *"นักเรียนใหม่"*.
  - **Her own sample in the sheet fits new students only:** Sep 1st 13, New this month 5, then Oct New previous **8** (13 − 5). Oct 1st 12, New this month 6, then Nov New previous **6** (12 − 6). Each trial child opens once. It is a sample, not data, but its arithmetic is a first course.
  - **Against that:** on uat, 4 of Oct's 5 are already Renew, so the same purchase shows on New previous **and** Renew, and the sum of the lines overstates purchases. With first course only it's 0 · 1.
  - **I'd go first course.** It's one constant, built as ruled until you say.
- **Q6, "never hers".** Meeting §3.2 has **"Renew: ลูกค้าเดิมที่เรียนจบแล้วต่อคอร์สเพิ่ม"** ("finished, then continued"). Her sheet (*"ลูกค้าเก่าต่อคอร์ส + Voucher"*) and her 11-05 line (*"คอร์สต่อคอร์ส"*) don't say finished. So her later words favour your ruling, but "finished" isn't only ours. Oct 40 vs up to 55.
  - A consequence to tell the owner: a child running a Bike course who opens a Surfskate course is now a Renew.
- **Line 11 sits oddly with line 9.** A course that ended, followed by a voucher, leaves Not renewed today, though voucher after course is not a Renew. I left it: any new purchase means the family came back. Not changed unless you rule.

**🔧 Total customers: my choices, since §5 says only "all customers":**
- **Cut at the selected month's end,** so a past month doesn't grow.
- **Archived students are out** (the old report's TASK-411 rule). **This needs one more service line: asked.**
- ~~ECA / camp-only children are in.~~ **Wrong, and overruled (§6, §7.3): they are OUT.** I also misstated Tanya's basis: her 539 leaves them out (549 with them).

**Palm:** no screen change. But his doc says Active counts people (§2) and Total is a mixed set; those no longer match. Tell him through the owner.

## 11. Added 2026-11-05: the final target (REQ-5002 §6 + §7, TEST-136's last section). 754 + 755 are ONE build
| line | today | **gate (Oct · Nov)** | against TEST-136's last table |
|---|---|---|---|
| Active course | 185 · 190 | **188 · 197** | same; the reading in §9, in courses |
| Active voucher | 49 · 49 | **50 · 51** | same |
| 1st Trial (3 months) | 173 · 161 | **176 · 164** | same |
| 1 HR (3 months) | 102 · 107 | **88 · 91** | same |
| Total customers | 361 · 263 | **Tanya recounts** | her 523 · 535 doesn't say whether archived children are out; §7.3 has them out |
| 1st Trial | 123 · 11 | **123 · 7** | same |
| New Course this month | 43 · 1 | **27 · 1** | her "first course only" figure; §7.1 overrides §6's 30 |
| New Course previous month | 18 · 35 | **0 · 1** | her "After DR-7" first-course figure; §7.1 overrides her table's 5 · 3 |
| Renew Course | 62 · 30 | **55 · 21** (flip: 40 · 19) | same. My §10 said 20 for Nov; I missed her 1 voucher after voucher |
| 1st Trial, no course | 96 · 10 | **96 · 6** | same |
| Not renewed | 43 · 14 | **32 · 6** | same |

- **No purchase sits on both a New line and Renew now.** But Oct 7 · Nov 1 first courses with no 1st Trial are on no card (Q4).
- **The definitions list.** **Line 5:** every child known by the end of that month (this month: to today) through a course, a voucher or a lesson class; children with only ECA / camp / group classes, and archived children, aren't counted. **Lines 7 + 8:** a child's **first** course, opened this month, with the 1st Trial this month (7) or in an earlier month (8). **Line 9:** as §10, while the owner keeps §7.2.
- **The Nov column moves with the date of the run** (TEST-136 is at 05/11); the recount and the card must be on the same day.
