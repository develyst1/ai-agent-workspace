# TEST-136: REQ-5002 on uat: reproduce her case + recount the SOM Dashboard's 11 lines (today's behaviour and her §1 definitions)

- **QA:** Tanya
- **Date:** 2026-11-05, ~19:50–20:20 Bangkok (uat "today" = 2026-11-05)
- **Brief:** Porter's ▶️ REQ-5002 in `inbox/QA.md`; `requirements/REQ-5002-*.md`
- **Env:** uat, admin, headless, **READ ONLY** (GETs only; my guard aborts every non-GET; only Cloudflare's browser beacon was blocked). **Nothing written.**
- **Instruments:**
  - `/reports/som` + the 6 list endpoints, months 2026-08 … 2026-11;
  - all bookings (5,465 rows), courses (520), vouchers (67), recounted by my own code;
  - the SOM page, Oct 2026 and Nov 2026, by eye and by row count.
- **Data:** counts only here. The only child named is her own example. The raw dump stays in my scratchpad.
- **No cause statements.** This says what the numbers are; the mechanism is Silver's.

## Verdict
- **🔴 REPRODUCED:** cancelled courses are counted on **4 of the 11 lines** (New Course this month, New Course previous month, Renew Course, Not renewed), and they also move 3 kids off a fifth. **AC-1 fails on today's build, as she reports.**
- **✅ Card = list = screen on all 6 lines that have a list**, Oct and Nov.
- **✅ The recount matches the card on every line in Nov that doesn't depend on a buy day.**
- **✅ DR-7 is back: the exact numbers are in § "After DR-7" at the end, and they replace every ⚠ below.** Was: **🔒 NOT_TESTED until DR-7:** the raw API doesn't expose the day a course or voucher was bought. Lines that depend on it are marked ⚠ below; one read-only SQL settles them.

## 1. Her case: reproduced exactly
**จาญ่า จิรัญญาณ์, Oct 2026, Renew Course:** 62 rows on screen; she is on **rows 1, 2, 3 and 15**, as in her screenshot.

| List row | Package | Bought | The course behind it | Status |
|---|---|---|---|---|
| 1 or 2 | Course 10 · Private BIKE | 01/10 | `e8245870`: 0 / 10 used, cancelled 01/10 (reason ADMIN_ERROR) | **CANCELLED** |
| 1 or 2 | Course 10 · Private BIKE | 01/10 | `8819df4e`: 0 / 10 used, cancelled 01/10 (PROGRAM_CHANGED) | **CANCELLED** |
| 3 | Course 10 · Private SURFSKATE | 01/10 | `fb17a9db`: 1 / 10 used, cancelled 09/10 (ADMIN_ERROR) | **CANCELLED** |
| **15** | Course 10 · Private BIKE | 09/10 | `db8a4d39`: 2 / 10 used | **ACTIVE** |

- Her Bookings page: **Cancelled 3 · Active 1 · Completed 1** ✅ (the completed one is Course 4 · Private BALANCE BIKE, bought 26/08, which appears in August's list).
- **So 3 of her 4 rows are cancelled courses. Row 15 is her live course, and under her definition it stays** (a course after her completed course).

## 2. The 11 lines: today's behaviour
⚠ = my recount depends on buy days the API doesn't give (see §4). "Cancelled" = rows whose course / voucher is cancelled now.

### October 2026
| Line | Card | Screen | List rows | My recount | Cancelled in it |
|---|---|---|---|---|---|
| Active course | 185 | 185 | no list on screen | ⚠ 182 (183 packages) | 0 at month end |
| Active voucher | 49 | 49 | no list | ⚠ 50 (52 packages) | 0 |
| 1st Trial (last 3 months) | 173 | 173 | no list | 173 ✅ | 0 classes · 3 kids are out **only** because of a cancelled course |
| 1 HR (last 3 months) | 102 | 102 | no list | 102 ✅ | 0 classes |
| Total customers | 361 | 361 | no list | ⚠ 358 | — |
| 1st Trial | 123 | 123 | 123 | 123 ✅ | 0 (all 123 attended) |
| New Course this month | 43 | 43 | 43 | 43 ✅, row for row | **10** |
| New Course previous month | 18 | 18 | 18 | 18 ✅, row for row | **9** |
| Renew Course | 62 | 62 | 62 | 62 ✅ row for row (+ ⚠ 8 courses I can't date) | **20** |
| 1st Trial, no course | 96 | 96 | 96 | 96 ✅ | 0 |
| Course / Voucher not renewed | 43 | 43 | 43 | ⚠ 44 | **14** (13 courses, 1 voucher) |

### November 2026 (to 05/11)
| Line | Card | Screen | List rows | My recount | Cancelled in it |
|---|---|---|---|---|---|
| Active course | 190 | 190 | no list | 190 ✅ (197 packages) | 0 |
| Active voucher | 49 | 49 | no list | 49 ✅ (51 packages) | 0 |
| 1st Trial (last 3 months) | 161 | 161 | no list | 161 ✅ | 0 classes · 3 kids out only because of a cancelled course |
| 1 HR (last 3 months) | 107 | 107 | no list | 107 ✅ | 0 classes |
| Total customers | 263 | 263 | no list | 263 ✅ | — |
| 1st Trial | 11 | 11 | 11 | 11 ✅ | 0 (7 attended, 4 confirmed, not yet held) |
| New Course this month | 1 | 1 | 1 | 1 ✅ | **1** (its only row) |
| New Course previous month | 35 | 35 | 35 | 35 ✅ | **8** |
| Renew Course | 30 | 30 | 30 | 30 ✅ row for row (+ ⚠ 4 undated) | **9** |
| 1st Trial, no course | 10 | 10 | 10 | 10 ✅ | 0 |
| Course / Voucher not renewed | 14 | 14 | 14 | ⚠ 12 | **8** |

- **The cancelled courses' reasons,** in the Oct lists: mostly ADMIN_ERROR (Renew 14 of 20; New this month 9 of 10; New previous 4 of 9), the rest CUSTOMER_CANCELLED / PROGRAM_CHANGED. Whole system: 122 cancelled courses (93 / 23 / 6) and 6 ended vouchers.
- **Her "1st" complaint, measured:** the 1st Trial lists themselves hold **0 cancelled classes**. Cancelled **courses** do affect them: 3 kids (Oct and Nov) leave the 3-month line only because of a course that was later cancelled.
- **The Existing lines have no list on the screen** (only the 6 New-vs-Renewing cards click through), so AC-3's "card = list" can only apply to those 6 unless a list is added.

## 3. The same lines under her §1 definition
Numbers as they'd be with cancelled courses and classes out and her wording applied. Each reading I had to choose is marked Q and listed in §5.

| Line | Her words | Oct: today → hers | Nov: today → hers |
|---|---|---|---|
| Active course | has a schedule, no paused | 185 → ⚠ 169 people / 170 packages *with a future class at month end* | 190 → **190** people / 197 packages (Q3) |
| Active voucher | opened | 49 → ⚠ ~49 | 49 → **49** (51 packages) (Q3) |
| 1st Trial (3 months) | moved out once a course is bought | 173 → **176** | 161 → **164** |
| 1 HR (3 months) | 1 HR only, never a course | 102 → **88** (14 hold a live course) | 107 → **91** (16) |
| Total customers | everyone, by name | 361 → ⚠ 433 *(the 4 lines above, distinct)* or 539 *(everyone with a live class or package)* (Q2) | 263 → 432 or 539 (Q2) |
| 1st Trial | came this month | 123 → **123** | 11 → **7** attended (+ 4 confirmed) (Q4) |
| New Course this month | 1st this month, course this month | 43 → **30** | 1 → **1** (a different row) |
| New Course previous month | 1st before this month, opened a course | 18 → **9** *(trial last month, course any time, live)* or ⚠ **3–4** *(course opened this month)* (Q1) | 35 → **27** or **1** (Q1) |
| Renew Course | course after course + voucher after voucher | 62 → ⚠ **39–50** (+ 0 voucher after voucher) (Q5) | 30 → ⚠ **19–28** (+ 0) (Q5) |
| 1st Trial, no course | 1st, no course yet | 96 → **96** | 10 → **10** |
| Not renewed | **ended**, not renewed | 43 → ⚠ ~33 | 14 → ⚠ ~6 |

**What changes beyond removing cancelled rows** (facts for Silver's AC-2 list):
- **New Course this month:** the Oct list holds **8 courses with no 1st Trial** before them and **1 bought in another month**; her wording needs both.
- **New Course previous month:** **all 18 Oct rows and 34 of 35 Nov rows were opened before the selected month.**
- **Renew Course:** Oct has **1 voucher bought after courses**, which her wording ("voucher after voucher") wouldn't count. **2 live Oct rows renew only a course that was cancelled.**
- **1 HR:** today counts children who also hold a course; her wording doesn't.

## 4. 🔒 DR-7 for the owner, uat, read only (ids + dates only, no names)
**Why:** `/courses` and `/vouchers` don't return when each was bought.
- **What I used instead:** 483 / 520 course buy days and 2 / 67 voucher buy days come from the lists' own dates; the rest are a stand-in (earliest of start / first class / end).
- **So:** the ⚠ cells are close but not proof, and the "exact" new / renew recount leans on the lists' dates for the day, though the classification is mine.

```sql
SELECT 'course' AS kind, id, to_char(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD') AS buy_day FROM course_packages
UNION ALL
SELECT 'voucher', id, to_char(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD') FROM vouchers
ORDER BY 1, 3;

SELECT 'course' AS kind, course_id AS id, from_date, to_char(changed_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD') AS changed_day FROM course_expiry_changes
UNION ALL
SELECT 'voucher', voucher_id, from_date, to_char(changed_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD') FROM voucher_expiry_changes
ORDER BY 1, 4;
```
- **With both results as CSV,** I re-run the same code: every ⚠ becomes exact, and the recount no longer leans on the lists. ≈ 15 minutes.
- **It doesn't block Silver's work:** the reproduction and the cancelled-row counts in §1–§2 stand without it.

## 5. Questions (for Porter; each changes a number above)
- **Q1. New Course previous month:** "เด็ก 1st เดือนก่อนหน้านี้ ที่เปิดคอร์ส": must the course be opened **this** month (Oct 3–4), or any time (Oct 9)? And "เดือนก่อนหน้านี้": last month only, or any earlier month?
- **Q2. Total customers:** "ลูกค้าทั้งหมดนับเป็นรายชื่อ": the distinct names of the 4 lines above it (≈ 430), or everyone with a live class or package (539)?
- **Q3. Active course / voucher:** people or packages? Nov differs: 190 vs 197, 49 vs 51. (REQ-124's K1 is still marked open in the code as "the owner's".)
- **Q4. 1st Trial:** "1st ที่มาเรียนเดือนนี้": attended only (Nov 7), or also booked and not yet held (Nov 11)?
- **Q5. Renew Course:** does a course bought while an earlier one is **still running** count? Today it doesn't (and appears on no New / Renew line at all: Oct ⚠ ~11 courses); her wording doesn't say.
- **Q6. "Cancel":** she says cancelled courses or classes. Does a course ended by the newer **ตัดจบคอร์ส** (some classes really taught) count as cancelled? None exists on uat yet (0 ENDED_EARLY), but it will.

## Not covered
- Coach capacity: not recounted here (the brief covers the 11 lines). The AC-4 definitions list is the SA's.
- Badge (branch) filters: all figures are unfiltered.
- The expiry date in force on 31/10 (uses today's date until DR-7's 2nd query).

## Test data created
None: read-only.

## Evidence
1. **Her rows 1, 2, 3, 15** on screen and in the list = 3 CANCELLED + 1 ACTIVE by `/courses`. Proves the reproduction.
2. **Card = list = rows on screen** for all 6 lists in Oct (123 / 43 / 18 / 62 / 96 / 43) and the cards in Nov (11 / 1 / 35 / 30 / 10 / 14).
3. **Row-for-row:** my New this / New previous / Renew rows = the lists' rows (0 only-in-list). Proves which rows are cancelled.


---
## Added, same day: Silver's 2 open points, Coach capacity, and the customer draft
### Silver's open points (`CHECK-REQ-5002-…` §1): settled
- **"1st counts cancelled classes": NOT reproduced.**
  - **0 rows rest on a cancelled class** in the 1st Trial and 1st Trial, no course lists, in **all 4 months** (2026-08 … 2026-11), checked row by row against the class itself.
  - The counted classes: Oct 123 attended; Nov 7 attended, 4 confirmed; Aug 25 attended, 3 sick leave; Sep 65 attended, 1 paused.
  - **What a reader could see instead (facts, not a cause):** in Oct, 6 of the 123 rows are children who **also** have a cancelled trial class (the live one is what's counted), and 7 are children who have a cancelled course (none has only cancelled courses).
  - 30 children whose only trial was cancelled are on no list ✅.
- **จาญ่า's row 15 stays:** her completed course's last delivered class was 25/09, before the live course was bought on 09/10. So it's a real renewal, whatever Q6 decides.

### Coach capacity: recounted, ✅ matches
- **Her shot** (101 / 234 h · 54 / 153 h 35 % · 47 / 81 h 58 %) is **a full-time coach in Oct 2026**: 17 weekdays + 9 weekend days × 9 h.
- **All 24 coaches, Oct and Nov:** booked hours from the raw classes **24 / 24** and available hours (work days × 9 − recorded leave) **24 / 24** = `coachCapacity`, on all four numbers.

### The draft `COPY-DRAFT-khwan-som-count-questions-2026-11-05.md`: ❌ 3 lines to fix
| Line | Now | Against | Fix |
|---|---|---|---|
| **Q5** + the intro (*"ตอบแค่ ตามนั้น"*) | offers two options with **no default**, so "ตามนั้น" can't answer it. Its numbers (3–4 / 9) are for **last-month-only** trials | CHECK Q5's default: **any earlier month + opened in the selected month** = ⚠ about **5** in Oct | state the default and its number, then the alternatives |
| **Q7** | same: two options, **no default** | CHECK Q7's default: **the 4 lines above** | state it as the default |
| **Q7**, *"ทุกคนที่มีคลาสหรือแพ็กเกจอยู่ … 540"* | reads as "currently has" | my 539 = everyone who **has ever had** a live class or package, in the data since Aug | *"ทุกคนที่เคยมีคลาสหรือแพ็กเกจ"* |
| **Q4**, *"ตุลาคมมี 8 รายการ"* | 8 rows, but **1 is a cancelled course** that goes anyway | my split: 8 = 7 live + 1 cancelled; all 8 never had a trial; Nov 0 | *"ตุลาคมมี 7 รายการ"* |

**✅ Everything else matches:**
- **Coach capacity:** 101 / 234 h and both definitions (lessons + group classes, no cancelled, no ECA, no camp; work days × 9 − recorded leave).
- **"1 HR นับเป็นรายชื่อ":** distinct children, 102 / 107.
- **Q1, Q2, Q3, Q6:** the stated defaults = CHECK's.
- **"ประมาณ 430":** 433 (Oct), 432 (Nov).
- **The rules:** "ขวัญ" without พี่; no cause; no internal words; no names; no prices.

**⚪ Read as the customer would (Porter's call):**
- *"ตรงตามที่ขวัญต้องการ"* and *"ให้ขวัญใช้ตรวจเทียบ"* centre her, against the owner's 11-03 rule (REQ-5001 §8.4). *"ตรงตามที่สรุปมา"* and *"ใช้ตรวจเทียบ"* avoid it, and she's still the one asked.
- *Q2* puts a statement after its *"ใช่ไหมครับ"*; the voucher sentence reads as an afterthought. Moving it before the question is clearer.
- *Line 11* and the closing line promise the fix (*"จะแก้"*), while TASK-754 / 755 are held for your GO.


### The draft, re-check (md5 `e780a0d4876de524a9bfc5e8f0d7d493`, 2026-11-05): ✅ PASS
- **My 3 fixes are in:**
  - Q5 states its default first (any earlier month + opened in the month viewed, *"ประมาณ 5 ราย"*);
  - Q7 states its default first (the 4 lines, *"ประมาณ 430"*) and says *"เคยมี … ประมาณ 540"*;
  - Q4 says 7.
  - *"ประมาณ"* is the right word for the 5 until DR-7.
- **Q2** is reordered and reads clearly; its default = CHECK's. **Q1, Q3, Q6** are unchanged and = CHECK's.
- **Added: *"ช่อง 1st: ตรวจแล้วไม่มีแถวไหนนับจากคลาสที่ยกเลิก"***: true by value (0 rows, 4 months, the two 1st Trial lists; the 3-month line counts live classes only, recount 173 and 161 = the cards).
- **Added: ตัดจบคอร์ส *"ยังนับเป็นคอร์สที่จบแล้ว ไม่ใช่คอร์สที่ยกเลิก"***: agrees with the ruling, and reads apart from Q1 (a course *cancelled* after some classes). **This settles my Q6 above.** For TASK-754's check: ENDED_EARLY stays counted. 0 such courses on uat today, so it needs a built case on sid.
- **The body** (from *"ขวัญครับ"*): no พี่, no ฟีน, no prices, no internal words, no cause; the wording that centred her is gone.
- ⚪ **For when it happens (not a fix now):** per the CHECK (§3 Q1), a course ended by ตัดจบ shows **Cancelled** on the Bookings page, and it will stay counted here. A reader comparing the two pages will see a "Cancelled" course still counted. The definitions list (§4) is the place to say so.


---
## After DR-7, 2026-11-05: every ⚠ is now exact
**Input:** `project-docs/qa-2026-11-05/dr7/buy-days.csv` (520 courses + 67 vouchers; every id is in my uat dump, 0 duplicates) and `expiry-changes.csv` (319 changes on 200 ids; every id known). Same dump as above, same day; no new read of uat. The recount stops leaning on the lists' dates (`t136/a6.mjs`, scratchpad).

**Today's rules: all 11 lines = the cards, for both months.** The 6 listed lines also match row for row (student + package + date).
| Line | Oct: card → recount (was ⚠) | Nov: card → recount |
|---|---|---|
| Active course | 185 → **185** (⚠ 182), 190 packages | 190 → 190 |
| Active voucher | 49 → **49** (⚠ 50), 50 packages | 49 → 49 |
| Total customers | 361 → **361** (⚠ 358) | 263 → 263 |
| Renew Course | 62 → **62**, row for row, 0 undated (⚠ 8) | 30 → **30**, row for row, 0 undated (⚠ 4) |
| Not renewed | 43 → **43**, row for row (⚠ 44) | 14 → **14**, row for row (⚠ 12) |

**Corrected:** Renew Oct holds **19** cancelled courses, not 20. A course bought while an earlier one ran (no card today) is Oct **21, of which 15 live** (⚠ ~11), Nov **4, of which 1 live**.

**Her definitions, exact (Silver's table, CHECK §8):**
| Line | after TASK-754: Silver → exact | after TASK-755 defaults: Silver → exact |
|---|---|---|
| Active course | same | ⚠ 169 · 190 → **Oct 172–183** (see limit 1) · **190** |
| Active voucher | same | 49 · 49 ✅ (50 and 51 packages) |
| 1st Trial (3 months) | 176 · 164 ✅ | same |
| 1 HR (3 months) | 88 · 91 ✅ | same |
| Total customers | same | ⚠ ≈ 433 · 432 → **Oct 423–434** (limit 1) · **432** |
| 1st Trial | same | 123 · 7 ✅ |
| New Course this month | 33–35 · 0–2 → **35 · 2** | 30 · 1 → **27 · 1** |
| New Course previous month | 9 · 27 → **10 · 28** | ⚠ ≈ 5 · ≈ 1 → **0 · 1** (see below) |
| Renew Course | 39 · ⚠ 19–21 → **40 · 19** (0 voucher after voucher in either month) | same |
| 1st Trial, no course | 96 · 10 ✅ | 96 · **6** (Nov follows 1st Trial's 7) |
| Not renewed | ⚠ ≈ 33 · 6 → **32 · 6** | same |

**The customer draft (`COPY-DRAFT-khwan-som-count-questions-2026-11-05.md`):**
- **Q4's 7 holds:** Oct 7 courses, 7 children, none ever came to a 1st Trial. Nov 1.
- **Q7's ≈ 430 and ≈ 540 hold:** 423–434 · 432, and 539.
- **🔴 Q5's ≈ 5 does NOT hold as the customer will read it.**
  - The 5 are real: 5 children with a trial in an earlier month opened a live course in Oct. But **none of them is a first course:** 4 classify as Renew and 1 was bought while an earlier course ran. Those 4 would count on New and on Renew at once.
  - The **first course** count, which is CHECK §4 line 8's definition, is **Oct 0 · Nov 1**. All of today's 18 Oct rows were opened in Sep, and 34 of Nov's 35 in Oct: children here open a course in their trial's month.
  - So with this default the card reads about 0 each month. She should see that before answering.
  - Other readings, for the same question: any live course opened this month = Oct 5 · Nov 3; a trial **last month only** with a first course opened **any time** (today's rule, minus cancelled) = Oct 10 · Nov 28.

**Limits:**
1. **Active course in a past month can't be exact from the stored data.** "Has an upcoming class at 31/10" needs the class as it stood that day, and nothing records when a class was booked or cancelled. Oct **183** = a live class dated after 31/10, whatever its status now, so it may include classes booked later. **172** = classes still not held today, so it misses classes held since 31/10. The ⚠ 169 was the second reading on stand-in days. Silver's rule has to pick one; **TASK-755's gate needs that reading stated.** The current month has no such gap (190 either way). Total customers inherits this.
2. **Booking rows from the API carry no voucher id.** 57 of 62 voucher children have one voucher, so their rows are exact. For the other 5 I assign a row to the latest voucher bought by that date, and a voucher ended unused takes none. Result: every card and list row matches.
3. **Expiry moves have day precision.** 32 ids moved twice in a day; reversing their order moves no number.
4. **Silver's column is his to update.** Where his and mine differ, CHECK §8 says this recount decides.
- **Answers Q1, Q5 and Not covered's expiry line above with numbers;** the ruling on each is still the customer's.


---
## REQ-5002 §5 rulings: my recount, and the shortened draft, 2026-11-05
**Same dump + DR-7, my own code (`t136/a7.mjs`, scratchpad). Written before reading any re-issued numbers of Silver's.** These replace § "After DR-7"'s after-TASK-755 column as the final target.

| Line | Oct | Nov (to 05/11) | Today's card, Oct · Nov |
|---|---|---|---|
| Active course (**courses**, with a class scheduled, not paused) | **177–188** (limit below) | **197** | 185 · 190 (people) |
| Active voucher (**vouchers**) | **50** | **51** | 49 · 49 (people) |
| 1st Trial (3 months) | **176** | **164** | 173 · 161 |
| 1 HR (3 months) | **88** | **91** | 102 · 107 |
| Total customers (all, by name) | **523** as of 31/10, or **539** with no date limit | **535** to today, **539** with classes booked ahead | 361 · 263 |
| 1st Trial (attended) | **123** | **7** | 123 · 11 |
| New Course this month | **30** (27 if first course only) | **1** | 43 · 1 |
| New Course previous month | **5** | **3** | 18 · 35 |
| Renew Course | **55** (40 after a finished course + 15 while one runs; 0 vouchers) | **21** (19 + 1 while one runs + 1 voucher after voucher) | 62 · 30 |
| 1st Trial, no course | **96** | **6** | 96 · 10 |
| Not renewed | **32** | **6** | 43 · 14 |

**Cross-check:** Oct's 89 live courses bought in the month = 30 + 5 + 55 − 3 − 5 overlaps + 7 on no card. Nov's 23 = 1 + 3 + 20 − 2 + 1. Every course lands where expected.

**What the rulings do, as facts:**
- **The same course counts twice.** All 5 of Oct's New previous are also on Renew (Nov 2 of 3), and 3 of Oct's New this month too. Her words don't exclude it, and §5 says "first course" isn't in them.
- **On no card at all:** Oct 7 · Nov 1 courses (Q4: a first course, never a 1st Trial).
- **ENDED_EARLY:** 0 on uat; needs a built case on sid.

**Three readings the gate needs stated (they change a number):**
1. **Active course in a past month:** 188 = a live class dated after 31/10, whatever its status now; 177 = only classes still not held today. Nothing records when a class was booked or cancelled, so neither is proof.
2. **Total customers:** does a past month count only customers known by its end (523), or everyone (539)? Does Nov include children whose only class is ahead (539 vs 535)? And do children with only ECA / camp / group rows count? With them it's 549 in all; my numbers above leave them out.
3. **New Course this month:** §5's Q4 doesn't say. By the logic of Q5 I count any course (30); first course only = 27.

**The draft (md5 `fd8e14d8af550c71853224c94ecd6dee`): ✅ PASS.**
- **0 questions.** No ฟีน, พี่, price, cause or internal word; the 7-question text and its numbers are gone.
- **Every statement is true or already tested:** the coach capacity lines (24 / 24 coaches, both months); 1 HR is by name; the 1st line (0 rows from cancelled classes, 4 months).
- **It answers** her 06:06 question, her 06:26 cancelled complaint and 1 HR question; the 06:30 question gets the promised definitions list.
- ⚪ **No change now:** the ตัดจบคอร์ส sentence is gone. "ไม่นับคอร์สที่ยกเลิก" stays true by the ruling (§4); the definitions list has to carry it, along with the Bookings-page "Cancelled" note and the past-month limit above.


---
## REQ-5002 §6 + §7: the gate table, uat dump + DR-7, 2026-11-05
**This replaces the §5 table above.** Not a test of the build: nothing is deployed yet.

| Line | Oct | Nov (to 05/11) |
|---|---|---|
| Active course (courses) | 188 | 197 |
| Active voucher (vouchers) | 50 | 51 |
| 1st Trial (3 months) | 176 | 164 |
| 1 HR (3 months) | 88 | 91 |
| Total customers | 523 **minus archived** | 535 **minus archived** |
| 1st Trial (attended) | 123 | 7 |
| New Course this month (first course) | 27 | 1 |
| New Course previous month (first course) | 0 | 1 |
| Renew Course | 55 (if the owner flips it: 40) | 21 = 20 courses + 1 voucher (flip: 19) |
| 1st Trial, no course | 96 | 6 |
| Not renewed | 32 | 6 |

- **New lines per child:** 27 courses = 27 children and 0 = 0 in Oct; 1 = 1 and 1 = 1 in Nov, so counting courses or children gives the same number.
- **Cross-check:** Oct's 89 live courses bought in the month = 27 + 0 + 55 + 7 on no card. Nov's 23 = 1 + 1 + 20 + 1. No course sits on New and Renew together.
- **🔒 Total's archived cut is NOT_TESTED:** the dump has no archived flag on students, so 523 and 535 are upper limits until I read it. ECA / camp / group-only children are out (§6, §7).
- **The numbers above are uat's data.** On sid, I recount sid's own data with the same code; they can't be compared with this table. The table applies when the build reaches uat.
