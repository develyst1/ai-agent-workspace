# TEST-138: REQ-5004 SOM Dashboard round 2 gate (TASK-756 + 757, one build)
**Status:** ⏸ PREPARED 2026-11-06, NOT RUN. Waits for Porter's word that the owner has deployed sid. Then Karn's SQL (DR-9).
**Source:** `requirements/REQ-5004-*.md` §2, §3, §4a · `CHECK-REQ-5004-som-round-2-2026-11-06.md` · TASK-756, TASK-757. REQ-5002 §4–§7 for the lines that must not move.
**Tanya's limits here:** the owner signs in himself, in my pane; I type no password. Sid: QA data only, cleaned up and declared. GETs and my recount run inside the page; counts and ids come out, nothing is sent elsewhere.

## Before the deploy, 2026-11-06 (read only, sid, in the owner's sign-in from TEST-137; old build confirmed: no `from` echo)
### Baseline of the old build, 19:33 Bangkok
Saved in the pane's browser storage (`qa-t138-baseline`): Sep, Oct and Nov: every card, list, demographics, activity and capacity. It proves "a month gives the same answer" after the deploy, which Silver's review couldn't (TASK-757: "Tanya's recount on a month is the real proof").

| Month | Active course · voucher · 1st (3 m) · 1 HR (3 m) · Total | 1st · New this · New prev · Renew · No course · Not renewed | Hash: lists · demographics · activity |
|---|---|---|---|
| Sep | 77 · 5 · 3 · 5 · 52 | 8 · 3 · 3 · 38 · 0 · 2 | `9c725bde2844` · `591452bcdde5` · `5f4a70167a41` |
| Oct | 103 · 17 · 4 · 9 · 63 | 1 · 0 · 0 · 54 · 1 · 11 | `757d7abf779f` · `62c9f818417d` · `f6738cd1ceff` |
| Nov | 81 · 17 · 3 · 7 · 63 | 0 · 0 · 0 · 0 · 0 · 12 | `814cb4ae7087` · `a2f53d0b833e` · `a6653b812ccb` |

Sid can change between now and the deploy, so a moved number gets a row-level look before I call it a defect. Nov's Today and anything dated today are expected to move.

### My recount, checked against the old build first
Scratchpad `t138/gate.js`, my own code from the rules; it doesn't import the back. **Self-check: 0 differences on Sep, Oct, Nov** on every line that must not move, and 0 of 28 coaches differ on booked hours.

Writing it caught 2 mistakes of my own, neither in the product:
- **I read classes only up to 2027-12-31.** Courses on sid have rows into 2028 and later, and one of them holds a course Active. It now reads to 2040.
- **The 1st Trial card reads the first ATTENDED trial,** not the earliest trial if attended. Sep showed 8 against my 7; never seen before because I'd only run Oct and Nov.
- **For the record:** TEST-137's sid script had the same cut-off and also counted a class dated on the as-of day. It matched the cards, and these corrected rules match them too (Oct 103, Nov 81), so its verdict stands. Uat's script used the strict rule and matched.

### What I expect, written before seeing the build
On sid's data as of the baseline:

| Month | Total: old → new | Card 3: old → new | Capacity available: FT · PT · FL (Karn not set) | Booked: FT · PT · FL |
|---|---|---|---|---|
| Sep | 52 → **38** | 3 → **3** | **1803** (1275 + 528) · **240** · **0** | 238 · 7 · 16 |
| Oct | 63 → **40** (41 holders − 1 archived) | 4 → **4** | **1852** (1270 + 582) · **270** · **0** | 308 · 13 · 39 |
| Nov | 63 → **33** (34 holders − 1 archived) | 3 → **3** | **1782** (1200 + 582) · **270** · **0** | 196 · 8 · 8 |

**Card 3 doesn't move on sid's real data, so its rule can only be proved by the built cases below.**

### Coach list on sid (read only): 28 active, 1 inactive, 14 archived
| Type | Active | Work days |
|---|---|---|
| FT | 12 | 10 on all 7 days (the default) · `16bb60dd` `012456` · `4e58281c` `1234` |
| PT | 5 | `0caa0b5f` `06` · `59c298af`, `d33b65f6`, `34ce6f67`, `3cb5b02d` all 7 |
| FL | 11 + 1 inactive | `3ea9b42e` `1234`; the rest all 7 |

Work days: 0 = Sun … 6 = Sat. 5 of the 12 FT are QA-made (`2ade954f`, `f453d207`, `7829e67f`, `7508e641`, `7c9bbc14`).
- **All-7 on FT inflates available hours on sid.** It's the setting, not a bug (CHECK §4.2). Uat's list of 11-05 has no FT on all 7.
- **🔴 Karn on sid is `821186fa-44ce-4e55-addc-c5230b5383cc`: FREELANCE and INACTIVE.** TASK-756 applies `weekend_capacity_hours` only to PART_TIME, and capacity lists only active coaches. So setting 4 h on that row changes nothing, and AC-5's Karn can't be seen on sid. See DR-9.
- **Karn on uat (my dump of 11-05, TEST-136):** `c3648d58-d451-4be7-8a42-75f19d23b4c0`, PART_TIME, active, work days Sun Mon Sat. So uat's one-line UPDATE works. I re-read the id at uat's gate.

## DR-9, for the owner through Porter (bare SQL, sid only)
**After the deploy; I need one line back when it has run.**

**1. Karn, my recommendation:** make sid's row match uat's.
```sql
UPDATE teachers SET type = 'PART_TIME', active = true, work_days = ARRAY[0,1,6]::smallint[], weekend_capacity_hours = 4 WHERE id = '821186fa-44ce-4e55-addc-c5230b5383cc';
```
It proves Karn's own row end to end. The side effect: Karn reappears on sid's calendar.

**The other way, if Karn's sid row should stay as it is:** set the value on an existing PT with no other change. The rule is by type, not by name, so it proves the same code; Karn's row itself waits for uat.
```sql
UPDATE teachers SET weekend_capacity_hours = 4 WHERE id = '0caa0b5f-3ad7-4f57-9ca5-5e033e3f301b';
```

**2. Optional, for all data's coach start.** The teacher API has no `created_at`, so without this, available hours on all data are NOT_TESTED (booked hours still are).
```sql
SELECT id, type, (created_at AT TIME ZONE 'Asia/Bangkok')::date AS created_day FROM teachers WHERE active AND NOT archived ORDER BY id;
```

## The gate, in order
### A. The deploy itself
1. Sid answers with the new build (`from` + `to` echoed); `/teachers` still loads, which proves migration 0073 ran.
2. Today's screen still opens and works on a month.

### B. A month must not move (AC-6, TASK-757 🔴), API + screen, Sep · Oct · Nov
3. Against the baseline: 1st, New this, New prev, Renew, No course, Not renewed, Active course, Active voucher, 1 HR, every list's rows, demographics, activity. Same, apart from the new echo fields.
4. Card = its list's rows = my recount, per line and per month.

### C. The three changed rules on a month (AC-3, AC-4, AC-5)
5. **Total:** the table above; on screen too.
6. **Capacity, per coach:** 28 rows, each against my recount: FT weekday 5 + Sat–Sun 6; PT Sat–Sun 6, weekday capacity 0, weekday booked real, Hours = weekend only; FL booked real, available 0, % 0; by-type = the sums.
7. **Leave:** a day on recorded leave comes off at that coach's rate. Sid has 10 such days in Sep–Nov; if none falls on a working day of a PT and an FT, I add one to a QA coach, then remove it.
8. **Karn / the setting:** the row reads 4 h per Sat–Sun day worked, after DR-9.

### D. Built cases on sid, QA children only (card 3 and Total)
| # | Build | Expected |
|---|---|---|
| D1 | 1st + voucher after it | off card 3 · **still on No course (line 10)** |
| D2 | Voucher before the 1st | off card 3 (any order) |
| D3 | Then cancel that voucher | back on card 3 |
| D4 | 1st + 1 HR after it, and one on the same day | off card 3 · on card 4 |
| D5 | 1 HR **before** the 1st | stays on card 3 · on card 4 |
| D6 | 1st + cancelled 1 HR | stays on card 3 |
| D7 | 1st + 1 HR dated after today | stays on card 3 until that day |
| D8 | 1 HR + voucher | **stays on card 4** (Silver's trap) |
| D9 | 1 HR + course | off card 4 (REQ-5002) |
| D10 | One child with course + voucher, or 2 courses | Total +1 only; Active cards +2 |
| D11 | DUO course | Total +2; Active course +1 |
| D12 | Child with only an ended or cancelled course | not in Total |
| D13 | Archived child holding an Active course | out of Total, still on Active course |

### E. The period, API only until Palm ships (AC-2's API half)
14. **Periods, each card = list = my recount:** all data · 2026-09-15 to 2026-10-20 · one day · a range ending today · a range ending on a past day.
15. **All data:** starts at the earliest non-cancelled lesson row (2026-08-18 on sid), ends today; no future class counted; echo `month` null.
16. **A month = the same dates as from–to,** apart from the echo.
17. **New lines across months:** a first course with its 1st in the same month = this; an earlier month = previous; on all data New previous isn't always 0.
18. **Past as-of:** Active + Total on a past range read that day, not today.
19. **Refused with 400, on both endpoints:** only `from` · only `to` · `from` > `to` · `to` in the future · `month` + a range · 2026-02-30 · a bad format.
20. **Branch filter:** a badge on a month and on a range; card = list. NOT_TESTED on REQ-5002 so far.

### F. Clean up
Cancel what I built, remove any leave I added, declare it all below, delete `qa-t138-baseline` and `qa-t138-dr8` from the pane's storage.

## NOT_TESTED until Palm ships, by the brief
AC-1 (headings) · AC-2's screen half (opens on all data, the from–to control) · AC-5's FL display. **Expected for now, not a bug:** an FL row reads "x / 0 h"; a PT's weekday cell reads "/ 0".

## Noted for later
- **Uat's gate needs a fresh DATA REQUEST.** DR-7's buy days and expiry changes stop at 11-05, and the recount needs both.
- **REQ-5004's customer message** is held (Porter); it goes through me once rewritten.

## Test data created
- **So far, sid:** none in the app. In the pane's browser storage only: `qa-t138-baseline` (the old build's report, for the diff) and `qa-t138-dr8` (ids + dates). Deleted at step F.
- **Uat:** nothing, not opened for this test.

## DR-9 ruling, 2026-11-06 (Porter, `inbox/QA.md`; filed as `DATA-REQUEST-karn-weekend-capacity-2026-11-06.md`)
**The first SQL, on sid:** Karn PART_TIME, active, work days 0/1/6, 4 h. The calendar side effect is accepted on the test box. The optional `created_at` read goes to the owner too. Porter tells me when the deploy is done, with the SQL results.

**What that changes in my expected table above, once it has run (written before seeing the build):**
| Month | Karn's Sat–Sun days | Karn's available | PT available: 5 coaches → 6 coaches |
|---|---|---|---|
| Sep | 8 | 32 h | 240 → **272** |
| Oct | 9 | 36 h | 270 → **306** |
| Nov | 9 | 36 h | 270 → **306** |

- Those are before any recorded leave of Karn's; the gate reads his leave for the month.
- **Karn's Monday adds no capacity** (PT weekday rate 0). Any Monday class he has stays real in his weekday cell and out of his Hours.
- **Coaches on the list:** 28 → 29; PT 5 → 6; FL inactive 1 → 0. Karn's booked hours join the PT row.
- **My recount:** gets Karn's id in `window.__OWN` (4 h) before it runs.
