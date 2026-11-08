# TEST-138: REQ-5004 SOM Dashboard round 2 gate (TASK-756 + 757, one build)
**Status:** ✅ TEST_PASSED on sid, 2026-11-07, for what this round could reach (the API, and today's month screen). **Palm's screen: ✅ TEST_PASSED on sid 2026-11-07** (last section); not yet run on uat, which needs the front deployed there. **Uat:** ✅ TEST_PASSED 2026-11-07, read-only, on the same reach; see the last section.
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
**Sid, 2026-11-07, note "QA TEST-138". All soft records, so they stay visible as cancelled. 13 existing QA children, none with a parent, so no family could get a notice.**
- **16 bookings, all cancelled:** `14933fb3` `83e37c1c` `60ac2a9a` `bf905972` `b8a810a4` `bbf757de` `86803b89` `8ccdccf2` `bdb836c5` `0c7918aa` `db4d853d` `b472f656` `9ee0cc5a` `42f398cf` `8b2719d2` `b195bcb2`.
- **4 courses, cancelled (ADMIN_ERROR):** `2d1eab04` `8e938e35` `d94a0915` `a2360b33`. Their 16 classes dated in December onward: 0 live.
- **4 vouchers, cancelled (ADMIN_ERROR):** `b97a05c0` `a4e4cd04` `b38d15d4` `b52f8c00`.
- **1 coach, archived:** `ce39b746` (PART_TIME, "QA PT TEST-138"). Its 2 leave days (11-14, 11-16) were removed.
- **Attended, then cancelled:** `86803b89` and `8b2719d2`. Undo was refused (409 `UNDO_STAFF_ATTEND`), so I cancelled them directly; that worked.
- **Not checked:** whether the sales, the attended classes or the cancels left revenue rows on sid.
- **The pane's browser storage:** `qa-t138-baseline` deleted as planned. **`qa-t138-dr8` kept on purpose** (ids + dates, no names): Palm's round needs the recount, and DR-8 can't be re-read without the owner. It goes when that round ends.
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

## The run, 2026-11-07 (sid, after the owner's "deploy sid แล้ว")
**Instrument:** the API inside my signed-in pane, GETs + the built cases above, and today's screen on Oct and Nov. Desktop width. **Build:** whatever the owner deployed to sid; `/api` gives no build id. It answers with the new `from` + `to`, and his migrate output shows 0073 applied (74 recorded, as relayed by Porter). Sid's date was 11-07, not the baseline's 11-06.

### Verdict by step
| Step | Result | Evidence |
|---|---|---|
| A. Deploy | ✅ | `from` + `to` echoed; `/teachers` loads; the screen opens on a month |
| B. A month must not move | ✅ | Below |
| C. Total, capacity, leave, Karn | ✅ | Below |
| D. Built cases | ✅ | Below |
| E. Period API | ✅, with 1 named gap | Below |
| F. Clean up | ✅ | Numbers back to the start; 0 live QA rows |

### B. A month must not move (AC-6)
Against the old build's saved report. Comparison ignores the new `from` + `to` fields and key order.
| Month | Cards moved | List rows | Demographics · activity | Card = list = my recount |
|---|---|---|---|---|
| Sep | Total only (52 → 38, ruled) | identical, 6 lists | identical | ✅ |
| Oct | Total only (63 → 40, ruled) | identical, 6 lists | identical | ✅ |
| Nov | Total (63 → 33, ruled) · Active course 81 → 78 · Not renewed 12 → 13 | 1 row added on Not renewed | identical | ✅ |

**Nov's 2 extra moves are the date, not the build:** today went from 11-06 to 11-07, and my recount, written from the rules, gives 78 and 13 for 11-07. I didn't trace those courses one by one.

### C. The changed rules, every number as written down before the deploy
| Month | Total | Card 3 | Available FT · PT · FL | Booked FT · PT · FL |
|---|---|---|---|---|
| Sep | 38 ✅ | 3 ✅ | 1803 · 272 · 0 ✅ | 238 · 7 · 16 ✅ |
| Oct | 40 ✅ | 4 ✅ | 1852 · 306 · 0 ✅ | 308 · 13 · 39 ✅ |
| Nov | 33 ✅ | 3 ✅ | 1782 · 306 · 0 ✅ | 196 · 8 · 8 ✅ |

- **Per coach:** 29 / 29 match my recount on Sep, Oct, Nov, on hours in each cell.
- **Karn:** PART_TIME, work days 0/1/6, **32 · 36 · 36 h**, which is 4 h × 8 · 9 · 9 Sat–Sun days; Monday adds nothing. So the 4 h is live, though Porter's last note said the UPDATE was still pending. The API doesn't show the value itself; the hours prove it.
- **Leave:** FT on real data (a Friday and a Saturday in Oct, off at 5 and 6 h, in the 29 / 29). PT on a QA coach (Sat–Sun + Mon): Nov 54 h → **48 h** with a Saturday and a Monday on leave, so -6 and -0; back to 54 when removed.
- **The screen:** on Oct and Nov, cards and By type = the API. Read per coach on Nov only: Karn 0 / 36 h; PT Hours = weekend only with the weekday cell real (e.g. 3 / 0 h, Hours 0 / 54 h); FL "6 / 0 h", 0%. Oct's "not renewed" card opened a list of 11 rows = the card.

### D. Built cases, read as the change on Nov's cards after each step
| # | Build | Moved | Expected |
|---|---|---|---|
| D1 | 1st attended, then a voucher | Card 3 -1; No course stays +1 | ✅ |
| D2 | Voucher, then a 1st after it | Card 3 no change | ✅ |
| D3 | Cancel that voucher | Card 3 +1 | ✅ |
| D4 | 1st, then 1 HR the next day | Card 3 -1, card 4 +1 | ✅ |
| D4b | 1st, then 1 HR the same day, earlier hour | Card 3 -1, card 4 +1 | ✅ |
| D5 | 1 HR, then a 1st after it | Card 3 +1, card 4 stays | ✅ |
| D6 | 1 HR after the 1st, then cancelled | Card 3 back +1, card 4 -1 | ✅ |
| D7 | 1st + 1 HR dated 11-20 | Card 3 stays; card 4 +1 | ✅ (today only; I can't move the date) |
| D8 | 1 HR, then a voucher (Silver's trap) | Card 4 stays | ✅ |
| D9 | 1 HR, then a course | Card 4 -1 | ✅ |
| D10 | Course + voucher + 2nd course, one child | Total +1 only; Active course +2, voucher +1 | ✅ |
| D11 | DUO course | Total +2, Active course +1 | ✅ |
| D12 | Children with only cancelled courses | Not in Total: on real data, in the recount | ✅ |
| D13 | Archived holder | Out of Total, still on the Active cards: on real data, by the recount's cut (Oct 41 − 1, Nov 34 − 1 as read before the deploy). I didn't check whether that child's holding is a course or a voucher, and built no archived child | ✅ |

**With all of them live,** a recount loaded from scratch still matched: 0 differences on 6 periods, 29 / 29 coaches.

### E. The period, API only
- **Card = list = recount, 0 differences:** all data · 09-15 to 10-20 · one day (10-10) · 10-15 to today · 09-01 to 09-20 · 08-18 to 08-31 · 11-01 to today.
- **All data:** echo 2026-08-18 → 2026-11-07, `month` null; New previous = 3, so not always 0.
- **A month = its own dates:** Oct and 10-01 to 10-31 give the same report and rows, apart from the echo.
- **Past as-of:** 09-01 to 09-20 reads Active 57 and Total 31, that day's, against Nov's 78 and 33.
- **400 on both endpoints:** only `from` · only `to` · `from` > `to` · future `to` · `month` + range · 02-30 · bad format. A range ending today gives 200.
- **Branch filter, first real test:** sid's real bookings carry no badge, so all 4 values read 0 (every card = its list). I tagged a QA 1st and a QA voucher class with 1 value. On a month and on a range: 1st, No course, card 3, Active voucher and Total each read 1; another value still reads 0; 2 values together behave as OR. Every card = its list.

**A new coach on all data:** created today: all data 6 h (today, a Saturday) · 11-01 to today 12 h · Nov 54 h · Oct 54 h. So all data starts at the created day, and a month or a range stays as asked.

## NOT_TESTED, named
| What | Why | What settles it |
|---|---|---|
| AC-1 · AC-2's screen half · AC-5's FL display | Palm hasn't shipped | Palm's round |
| All data's available hours on existing coaches | The optional `created_at` read hasn't reached me. Booked hours are checked, and the rule held on the 1 coach above | The SELECT in DR-9, if wanted |
| Leave on Karn's 4 h rate | Sid is QA data only, so I didn't add leave to his row. The same code passed at the 6 h rate | Karn's first real leave, or the owner's word |
| Branch filter on a course | I tagged a voucher class; a course goes through the same check in the code, which is a read, not a run | One tagged course row |
| A phone-width screen | Desktop only this round | Palm's round |
| Uat | Not this round | Uat's gate, with fresh buy days + expiry |

## Karn's case, re-read after the owner's word, 2026-11-07 02:49 Bangkok: ✅
Owner's result via Porter: "1 row updated" (PART_TIME, active, work days 0/1/6, weekend_capacity_hours 4). That explains what the first run saw, so no one else changed the row.

| Month | Karn's Sat–Sun available | Weekday available | Leave on file | PT available |
|---|---|---|---|---|
| Sep | 32 h (8 days × 4) | 0 | 0 | 272 |
| Oct | 36 h (9 days × 4) | 0 | 0 | 306 |
| Nov | 36 h (9 days × 4) | 0 | 0 | 306 |

- **As predicted in the DR-9 ruling above.** Coaches on the list: 29.
- **Limit:** Karn has no class in these months (booked 0 on every cell), so a Monday class staying in the weekday cell wasn't seen on that row. The rule was seen on other PT coaches.

## Uat round 1, 2026-11-07 03:08 Bangkok: READ-ONLY. No defect so far, NO verdict yet
**Card and guards:** `picklocker/state/uat.json` (PokerVault, 03:06), loaded as-is, headless. The exact page answered 200 at `https://frontoffice.develyst.online/scheduler/som`. Every non-GET was aborted in the browser: the only one tried was `POST /cdn-cgi/rum`, Cloudflare's page analytics, not the app. All counting ran inside the page; counts and short ids came out; nothing was saved. I changed the month and the By type tab on screen only, which is local to my own browser. **Nothing on uat was created, edited or cancelled.**
**Build:** whatever the owner deployed; no version is shown. It echoes `from` + `to`, and his migrate output shows 0073 applied (74 OK, via Porter).

| Month | Active course · voucher | Card 3 | 1 HR | Total | 1st · New this · New prev · Renew · No course · Not renewed | Available FT · PT · FL (after Karn's 4 h) | Booked FT · PT · FL |
|---|---|---|---|---|---|---|---|
| Sep | 187 · 39 | 68 | 35 | 217 | 68 · 10 · 4 · 52 · 58 · 20 | 818 · 320 · 0 | 337 · 163 · 240 |
| Oct | 188 · 50 | 127 | 88 | 228 | 123 · 27 · 0 · 55 · 96 · 32 | 844 · 360 · 0 | 510 · 275 · 419 |
| Nov | 185 · 51 | 115 | 92 | 225 | 8 · 1 · 1 · 23 · 7 · 8 | 811 · 360 · 0 | 283 · 206 · 300 |

### What holds
- **Card = list row count:** 8 periods (Sep · Oct · Nov · all data · 09-15 to 10-20 · 10-10 · 10-15 to today · 09-01 to 09-20), all 6 lists: 0 differences.
- **Active, voucher, card 3, 1 HR, Total = my recount as of today:** Nov, all data, 10-15 to today: 0 differences. **Total Nov:** 226 holders − 1 archived = 225. **Card 3 Nov:** 165 on the old rule → 115.
- **Capacity:** 24 of 24 coaches on booked hours in every period; on available hours in every period but all data. FT · PT · FL by type = the sum of their coaches; FL available 0. No FT on all 7 days here.
- **A month doesn't move, Oct against TEST-137's table of 11-06:** 9 of 11 lines are the same. Only Total (502 → 228) and card 3 (176 → 127) moved, the 2 ruled changes. **Cards only:** I have no row-level baseline on uat.
- **Nov moved since 11-06:** Active course 195 → 185 · 1 HR 91 → 92 · 1st 7 → 8 · No course 6 → 7 · Renew 21 → 23 · Not renewed 6 → 8. The date moved and uat is live, and Active agrees with my recount for 11-07. The others have no recount yet.
- **A month = its own dates:** Oct and 10-01 to 10-31 are the same report, apart from the echo.
- **400 on both endpoints:** all 7 bad requests.
- **All data:** 2026-08-09 → 2026-11-07, `month` null.
- **The screen, Oct and Nov:** cards and By type = the API. Nov: PT weekday cell "14 / 0 h", 0%; Hours weekend only; FL "300 / 0 h"; these are the two "not a bug" readings Porter's brief named.

### Karn on uat (`c3648d58`): the 4 h is already live; who ran it is Porter's to confirm
- **Row:** PART_TIME, active, work days 0/1/6, no leave on file.
- **My first run read Sep at 48 h (6 h × 8 days), then every later read at 4 h.** The re-read minutes later gives Sep 32 h on the month and on 09-01 to 09-30. So the value changed during that run; it isn't a Sep-only fault. The first run's Sep row and PT total (336) are from before the change; the table above has the re-read.
- **Now:** Sep 32 · Oct 36 · Nov 36 (4 h × 8 · 9 · 9 days); 09-15 to 10-20 40 h (10 days); 10-10 4 h; weekday available 0.
- **The Monday rule, the limit left open on sid, is seen here:** Oct weekday booked 1 h, Hours 40 / 36 h on weekend only.
- **Screen, Nov:** 28 / 36 h, weekday 0 / 0 h, 78%.

### NOT_TESTED on uat, named
| What | Why | What settles it |
|---|---|---|
| Recount on past months and past ranges: Active, voucher, card 3, 1 HR, Total | They read as of a past day, which needs buy days + expiry moves | The owner's CSVs |
| New this, New prev, Renew, Not renewed row by row, No course and 1st against a recount | Same | The owner's CSVs |
| Card 3's and Total's rules on built cases | Read-only: no building on uat. They passed on sid | Nothing more on uat |
| All data's available hours | No `created_at` on the API; booked hours are checked | A SELECT, if wanted |
| Branch filter | Uat has 1 badge with 0 values, so there's nothing to filter by | A badge value on uat |
| AC-1 · AC-2's screen half · AC-5's FL display | Palm hasn't shipped | Palm's round |

### Test data created (uat)
None. Read-only.

## Uat round 2, 2026-11-07 03:13 Bangkok: ✅ TEST_PASSED, READ-ONLY
**Replaces "no verdict yet" above.** The same `gate.js` that was checked on sid, fed the owner's CSVs (`project-docs/qa-2026-11-07/uat-dr/`: 592 buy days, latest 11-06; 326 expiry changes). Same guards as round 1: headless, non-GET aborted (only `POST /cdn-cgi/rum` was tried), counts out, nothing saved. The CSVs went into a throwaway browser session and were removed from it. **Nothing on uat was created, edited or cancelled.**

**Every purchase on uat is in the CSV (0 undated), and no id collides on its first 8 characters.**

| Period | Active course · voucher · card 3 · 1 HR · Total | 1st · New this · New prev · Renew · No course · Not renewed | Booked / available FT · PT · FL | Old-rule card 3 · holders − archived | Differences · coaches |
|---|---|---|---|---|---|
| Sep | 187 · 39 · 68 · 35 · 217 | 68 · 10 · 4 · 52 · 58 · 20 | 337/818 · 163/320 · 240/0 | 80 · 219 − 2 | 0 · 24/24 |
| Oct | 188 · 50 · 127 · 88 · 228 | 123 · 27 · 0 · 55 · 96 · 32 | 510/844 · 275/360 · 419/0 | 176 · 229 − 1 | 0 · 24/24 |
| Nov | 185 · 51 · 115 · 92 · 225 | 8 · 1 · 1 · 23 · 7 · 8 | 283/811 · 206/360 · 300/0 | 165 · 226 − 1 | 0 · 24/24 |
| All data | 185 · 51 · 114 · 91 · 225 | 224 · 38 · 5 · 135 · 181 · 77 | 1085 · 590 · 872 booked | 164 · 226 − 1 | 0 · 24/24 booked |
| 09-15 to 10-20 | 188 · 49 · 114 · 75 · 228 | 124 · 23 · 0 · 49 · 102 · 29 | 497/980 · 231/400 · 392/0 | 156 · 229 − 1 | 0 · 24/24 |
| 10-10 | 194 · 44 · 82 · 52 · 223 | 8 · 0 · 0 · 1 · 8 · 0 | 27/36 · 28/40 · 26/0 | 108 · 224 − 1 | 0 · 24/24 |
| 10-15 to today | 185 · 51 · 114 · 91 · 225 | 69 · 16 · 1 · 54 · 57 · 28 | 357/646 · 224/280 · 327/0 | 164 · 226 − 1 | 0 · 24/24 |
| 09-01 to 09-20 | 169 · 36 · 62 · 33 · 194 | 55 · 5 · 4 · 44 · 50 · 16 | 265/551 · 154/240 · 214/0 | 71 · 198 − 4 | 0 · 24/24 |

- **Differences covers:** all 11 cards against my recount; every list's length against its card; New this, New prev, Renew and Not renewed row by row. 1st and No course are matched on count, not row by row.
- **The rules moved what they should:** Oct's old-rule card 3 reads 176, the same as TEST-137's table, against 127 now.
- **Past as-of:** 09-01 to 09-20 reads Active 169 and Total 194, that day's, against today's 185 and 225.
- **Nov's moves since 11-06:** every line matches the recount on today's data. The lists hold rows dated 11-06 (1st 1 · No course 1 · Renew 4 · Not renewed 2), consistent with live data arriving after that table; I didn't compare the two days row by row.

**Karn on uat: ✅.** The owner's read then "1 row updated" (via Porter) accounts for the change I saw at 03:08. Re-read: PART_TIME, active, days 0/1/6, no leave, Sep 32 · Oct 36 · Nov 36 h, steady across 2 runs since; Oct's 1 h Monday class stays in the weekday cell and out of Hours. The recount now counts Karn at 4 h and agrees on every period.

### Still NOT_TESTED on uat
| What | Why | What settles it |
|---|---|---|
| Card 3's and Total's rules on built cases | Read-only. They passed on sid; on uat only the totals are proved | Nothing more on uat |
| 1st and No course row by row | My recount compares their counts only | Low risk; REQ-5002's lists passed before |
| All data's available hours | No `created_at` on the API; booked hours are checked | A SELECT, if wanted |
| Branch filter | Uat has 1 badge with 0 values | A badge value on uat |
| AC-1 · AC-2's screen half · AC-5's FL display | Palm hasn't shipped | Palm's round |
| A phone-width screen | Desktop only | Palm's round |

## Customer gate, 2026-11-07: the ฟีน "when is it done" draft: 🔧 FAIL, 3 lines
**Draft checked:** `COPY-DRAFT-feen-som-dashboard-when-done-2026-11-07.md`, md5 `8c325442229a947a7d9afee6c7b3b2e1` from "พี่ฟีนครับ" to the end of the file (`1b12fe0e2e78b2ff7100f6aa810ff605` without the last newline).

**🔧 3 lines to fix:**
1. **"ย้ายออกจากรายการ 1st" names the wrong place.** The dashboard has 3 lines called 1st, and only card 3 moves. A child who opens a voucher **stays on "1st Trial, no course"** (D1), and on "1st Trial" if attended. Reading "รายการ 1st", ฟีน could open that list, see the child and call it not fixed.
   **"ลง 1 HR" is also too wide.** A 1 HR dated after today leaves the child on card 3 until that day (D7), and a 1 HR before the 1st doesn't move them (D5).
   - **Replace with:** *"เด็กที่มี 1st แล้วเปิด Voucher หรือมีคลาส 1 HR ตั้งแต่วัน 1st จนถึงวันนี้ จะย้ายออกจากช่อง 1st Trial (last 3 months)"*
2. **"Total customers นับเฉพาะคอร์สและ Voucher ที่ Active อยู่" reads as a sum.** It counts children, each once, so Oct on uat is 188 + 50 = 238 against a Total of 228.
   - **Replace with:** *"Total customers นับเด็กที่มีคอร์สหรือ Voucher ที่ Active อยู่ คนละ 1 ครั้ง"*
3. **The screen list leaves out her first item.** "หน้าแรกแสดงข้อมูลทั้งหมด" is in Palm's part and isn't built: uat still opens on the month. ฟีน would read it as done or dropped.
   - **Replace with:** *"ส่วนหน้าจอ คือหัวข้อตัวใหญ่ การเปิดหน้ามาแสดงข้อมูลทั้งหมด การเลือกช่วงวันเอง และการแสดงชั่วโมงของครู FL อยู่ระหว่างแก้"*

**Holds:**
- **"แก้ครบแล้ว" on the numbers:** rows 2, 3, 4 of REQ-5004 passed on sid and uat (card 3 and Total's rules on built cases on sid; on uat by recount).
- **"ขึ้นระบบแล้ว":** uat is deployed, and the owner's UPDATE for Karn's 4 h is in.
- **"Coach Capacity ... ตาม FT / PT / FL ที่กำหนดมา":** 24 of 24 coaches on uat.
- **"การแสดงชั่วโมงของครู FL":** still "x / 0 h" on screen, so it belongs in this paragraph.
- **The rules:** information only, no question to ฟีน; ครับ; formal; "ขวัญ" without พี่; no internal words; no staff name; no cause.

**Yours or the owner's to check, not things I can prove:**
- **"อยู่ระหว่างแก้":** I only know Palm's part was sent, not that it has started. The owner knows when he fills `[วันที่]`.
- **"วันนี้" is only true if it goes out on 11-07.** Later, it should say "เมื่อวันที่ 7".

**Optional, your call:**
- **Leave:** capacity deducts recorded leave, which isn't in her words, so someone working it out by hand can differ. It can wait for the definitions, or add *"(หักวันลาที่บันทึกไว้)"*.
- **PT weekday cell:** it reads like "14 / 0 h", and Palm's hiding it is optional. Not covered by "ครู FL", so it may draw a question.
- **The drop:** Oct's Total goes from 502 to 228. She asked for this, but it's the most visible change on the page.

Send it back with the 3 fixes and I'll re-check the new md5.

## Customer gate, re-check, 2026-11-07: the ฟีน "when is it done" draft v2: ✅ PASS
**Draft checked:** v2, md5 `164f2c400df6fbad58a5d65b01f6ddd2` from "พี่ฟีนครับ" to the end of the file (`bc3cf15eefbe5f8e8fe3bc5e6fcba435` without the last newline).
- **My 3 fixes are in, word for word.** The first names card 3 and the 1 HR's dates (D1, D5, D7), the second counts each child once, and the third lists the all-data default.
- **"ขึ้นระบบแล้วเมื่อวันที่ 7 พ.ย.":** true. The owner's uat deploy and my round ran on 11-07, and the date no longer depends on when it's sent.
- **Everything else** is unchanged from v1 and holds, as in my v1 check.

**This PASS covers the text as it stands, with `[วันที่]` left for the owner.** If anything else changes, the md5 changes and it comes back to me. The owner confirms "อยู่ระหว่างแก้" when he fills in the date, because I only know Palm's part was sent.

## Customer gate, re-check, 2026-11-07: the same draft v3, now to ขวัญ: ✅ PASS
**Draft checked:** v3, md5 `3b30935059ace7d2ffe693b5a66a597d` from "ขวัญครับ" to the end of the file (`3e8b28166c0b6c9d295da64896c085a2` without the last newline).
- **Paragraph 1:** the facts are unchanged from v2 and hold. The only change is the name it opens with.
- **"ส่วนที่เหลือเป็นหน้าจอ":** true. Those 4 are all that's left of REQ-5004: AC-1, AC-2's screen half and AC-5's FL display, with the all-data default and the from–to control both under AC-2. No number is waiting on them.
- **No date, and Palm named:** both are the owner's own words, so I don't count them against the rule on staff names.

**Not the text's fault, but they're yours to weigh:**
- **ฟีน's question stays open:** she asked "จะเสร็จตอนไหน", and this gives no date. The owner chose that.
- **A promise for Palm to keep:** "ปาล์มจะแจ้งกลับเมื่อเสร็จ" only comes true if Palm knows to report back, and to whom. I can't see that anyone has told Palm.

**Optional, one word:** "เดี๋ยวปาล์มจะแจ้งกลับ" is a little casual against the formal-tone rule. "ปาล์มจะแจ้งกลับเมื่อเสร็จครับ" keeps the meaning. It's close to the owner's own wording, so it isn't a fail; a change means a new md5 and a quick re-check.

## Palm's screen, 2026-11-07, sid: ✅ TEST_PASSED
**Build:** front `dccddce` in my clone, "feat: Add All / Monthly / Custom range periods"; the owner's "deploy หน้าบ้านขึ้น sid แล้ว". The running build shows no version. **Instrument:** headless Chrome through the real controls, `som` card, every non-GET blocked (only `POST /cdn-cgi/rum` was tried). Nothing written, on any system.

| What | Result on sid's screen |
|---|---|
| **AC-1, headings** | Existing Customers · New vs Renewing · Coach Capacity · Coach Name · Coach Type, exactly. None of the 5 old spellings left. English screen; the Thai screen keeps its own Thai headings |
| **AC-2, opens on all data** | "All" selected; its first request has no period. Label 18 Aug 2026 – 7 Nov 2026 on all 3 sections, the same as the API |
| **AC-2, the control** | All · Monthly · Custom range. A half-picked range leaves the figures alone. Picking 15–20 Oct sent `from=2026-10-15&to=2026-10-20`. Dates after today are disabled. Back to All gives the same figures |
| **AC-2, every card agrees** | All 11 cards = the API on All · Nov · Oct · 15–20 Oct, 0 differences |
| **AC-2, lists** | Tried on All, Oct, 15–20 Oct, all 6 lists: each list asks with that period, and row count = the card. An empty list says "0 rows · No data yet" |
| **Labels** | "1st Trial / 1 HR" reads the window ending at the period's last month: Sep–Nov on All, Aug–Oct on 15–20 Oct, matching the API's `recentFrom` / `recentTo`. Today stays on today |
| **AC-5, FL display** | Hours taught only: "6 h", weekday "6 h", weekend "0 h". No " / h", no %, no bar (FL cell 2 elements against FT's 5 with a bar). The By type tab uses the same cell in the code; I didn't read FL's row there on this build |
| **PT "—"** | Weekday cell "—" when there's nothing to show; **real hours when a PT taught on weekdays** ("20 h"). Hours = weekend only. No "/ 0" left. Karn reads 0 / 36 h on Oct |
| **FT** | Unchanged: %, x / y h, bar. An FT with no weekend days reads "—" too |
| **Phone, 375 px** | No sideways scroll on the page. The period control fits and works. The date picker fits, with future dates greyed. A list opens inside the screen (93 rows). The capacity table scrolls inside its own box to reach Weekday and Weekend |

**Not tested on this round:**
- **Uat:** Palm's screen isn't deployed there yet. Same run when it is.
- **The branch control on the new screen:** the API's filter passed on sid (round 1), but I didn't pick a badge on the new control.
- **All data's available hours on existing coaches:** still the optional `created_at` read. The screen shows them the same as the API.
- **A real phone:** this is headless Chrome at 375 px with touch, not a device.
- **Thai:** only the headings and period words in the dictionary, not a run through each state.

**Worth your eye, not a defect:** on the first pass my phone check counted 392 elements past the screen's right edge. That was my own filter, catching things inside the off-screen menu and the table's scroll box; the page itself doesn't scroll sideways, and the pictures show it fits.

**Evidence (`tests/evidence/`, git-ignored):** `test138s-1-opens-on-all.png` proves it opens on all data; `test138s-3-range-applied.png` the custom range; `test138s-10-fl-rows-desktop.png` the FL rows; `test138s-4-phone-top.png` + `test138s-6-phone-picker.png` + `test138s-11-capacity-phone-scrolled.png` the phone.

## Test data created (this round)
None. Writes were blocked.

## Palm's `45bf187`, 2026-11-07: NOT on sid, not tested
**Live test on sid (`som` card, writes blocked):** the Renew list on All still shows **all 93 rows**, "93 rows", no page control, width 780 px. That's `dccddce`'s window, so the paged one isn't deployed. I stopped there, as you said; **no verdict on the new window.**

**`dccddce..45bf187`, read from a throwaway clone in my scratchpad:** 1 commit, 2 files, nothing else.
- **`NvrDetailModal.tsx`:** size `xl` → `68rem`; client-side paging at 10 rows, with a page control only when there's more than one page; row numbers carry across pages; the count line becomes a range ("from–to of total", `overview.rowRange`); the teacher filter resets to page 1; closing resets to page 1.
- **`dictionaries.ts`:** removes `som.nvrRowCount`, in EN and TH. No other use of it remains, and `overview.rowRange` exists in the dictionary.
- **So my PASS on `dccddce` stands for everything else.** That's from reading the diff; the list windows themselves need the run below.

**What I'll run once it's on sid:**
- **Row count = card across pages,** on All, Oct and 15–20 Oct, walking every page of the longest lists and checking the row numbers run 1 to n with none repeated.
- **The range line and the page control,** including a list of 10 or fewer (no control) and an empty one.
- **The teacher filter** on the New lists: back to page 1, count follows.
- **Reopening** a list, and a different list, starts at page 1.
- **Phone, 375 px:** `68rem` must not push the window off the screen; the control fits.

**A note on how I read the diff:** you asked me to fetch in my clone. A fetch changes a code repo's refs, and my charter says no state-changing git there, so I cloned into my scratchpad and deleted it afterwards. `smart-scheduler-front` is untouched (still at `dccddce`; `git ls-remote` says develop is `45bf187`).

## The paged list window, 2026-11-07, sid: ✅ TEST_PASSED
**Live:** the Renew list now reads "1–10 of 93", with a page control, width 1088 px. The build shows no version, so this confirms the paged window, not the commit id. Writes blocked; only `POST /cdn-cgi/rum` was tried.

**Every list walked page by page, row count = card = API, row numbers 1 to n with no gap, never more than 10 on a page:**
| Period | 1st | New this | New prev | Renew | No course | Not renewed |
|---|---|---|---|---|---|---|
| All | 15, 2 pages | 4 | 3 | 93, 10 pages | 2 | 26, 3 pages |
| Oct | 1 | 0 | 0 | 54, 6 pages | 1 | 11, 2 pages |
| 15–20 Oct | 0 | 0 | 0 | 7 | 0 | 1 |

- **The range line:** "11–15 of 15", "91–93 of 93", "1–4 of 4". An empty list reads "0–0 of 0".
- **The page control:** shown only when there's more than one page (shown at 11 rows, absent at 7 or fewer; exactly 10 rows didn't occur). Next works; page 3 reads "21–30 of 93".
- **Reset:** closed on page 3, reopened: "1–10 of 93". A different list: "1–10 of 26".
- **Teacher filter:** "1–4 of 4" → pick a teacher → "1–1 of 1".
- **Phone, 375 px:** no sideways page scroll; window 19–356 px; the control fits at 35–340 px and wraps onto 2 rows with 10 buttons, which looks a little untidy but works; page 2 works by touch; the table scrolls inside its own box.

**Not covered:**
- **The filter resetting from page 2:** the New lists on sid have at most 4 rows, so it never starts past page 1. That line is in the code, not seen.
- **Row content page by page:** I compared counts and numbering, not each row's cells against the API. The pages are slices of the one list the earlier row-by-row checks covered.
- **Thai:** the range line's Thai wording is in the dictionary, not seen.
- **A real phone:** headless Chrome with touch.

**My earlier screen PASS:** nothing else in the diff touches it, and this run used the same control through All, Oct and a custom range with the cards matching.

**Can uat take this build? From QA's side, yes: no defect on sid.** What's deployed is the owner's call. When it's up, I run the same round on uat, read-only.

**Evidence (`tests/evidence/`, git-ignored):** `test138p-1-renew-page1.png` · `test138p-2-renew-page3.png` · `test138p-3-phone-list.png` · `test138p-4-phone-page2.png`.
**Test data created:** none.

## uat, 45bf187, 2026-11-08: ✅ TEST_PASSED, READ-ONLY
**Instrument:** headless Chrome through the real controls, uat card `picklocker/state/uat.json` used as given. Every non-GET was aborted, including auth; only `POST /cdn-cgi/rum` was tried, on all 3 runs. Nothing was saved, and nothing on uat was created, edited or cancelled. The build shows no version, so this confirms the paged window is live, not the commit id.

**Card check:** ✅ the card opened `/scheduler/som` on `frontoffice.develyst.online` (no redirect to login), on all 3 runs.

**The paged list window (as on sid):** ✅
- **Live:** the Renew list on All reads "1–10 of 136", with a page control, width 1088 px.
- **All 18 lists walked page by page, on All, Oct and 15–20 Oct.** Row count = API, row numbers 1 to n with no gap, never more than 10 on a page:
| Period | 1st | New this | New prev | Renew | No course | Not renewed |
|---|---|---|---|---|---|---|
| All | 230, 23 pages | 38, 4 pages | 5 | 136, 14 pages | 187, 19 pages | 83, 9 pages |
| Oct | 123, 13 pages | 27, 3 pages | 0 | 55, 6 pages | 96, 10 pages | 32, 4 pages |
| 15–20 Oct | 30, 3 pages | 4 | 0 | 5 | 27, 3 pages | 11, 2 pages |
- **One mismatch in my first run, and it was mine:** Oct "1st Trial" card read 14 against 123 in the API and the list. My script read the card before October's figures had loaded (14 is November's). A re-read after a 5 s wait shows 123 = API 123, and the screen run below reads it as 123 too. Not a defect.
- **Range line:** "221–230 of 230", "11–11 of 11", and an empty list reads "0–0 of 0". **The page control** shows at 11 rows and up, and is absent at 5 or fewer.
- **Reset:** page 3 of Renew reads "21–30 of 136", closed and reopened: "1–10 of 136"; another list: "1–10 of 83".
- **Teacher filter, now also from page 2** (sid couldn't test this): New this month on page 2 reads "11–20 of 38"; picking a teacher gives "1–1 of 1", with row number 1. From page 1: "1–10 of 38" → "1–1 of 1". The teacher I picked had 1 row, so this proves no stranded "page 2 of 1", not a reset inside a list still longer than 10.
- **Phone, 375 px:** no sideways page scroll (doc 375); window 19–356 px; the control fits at 35–340 px and wraps onto 2 rows with 10 buttons; page 2 by touch reads "11–20 of 136"; the table scrolls in its own box (306 of 600 px).

**Palm's screen, AC-1 / AC-2 / AC-5 (as on sid):** ✅
- **AC-1:** Existing Customers · New vs Renewing · Coach Capacity · Coach Name · Coach Type; none of the 5 old spellings.
- **AC-2:**
  - Opens on "All". Its first request has no period. The label "9 Aug 2026 – 8 Nov 2026" is on all 3 sections and equals the API's echo.
  - Every card = API, 0 differences, on All · Nov · Oct · 15–20 Oct · back to All · phone All.
  - A half-picked range leaves the figures alone. 15–20 Oct sends `from=2026-10-15&to=2026-10-20`. 27 of 35 days in November's calendar are disabled (after today).
  - "1st Trial / 1 HR" reads Sep–Nov on All and Nov, Aug–Oct on Oct and the range. "Today · 8 Nov 2026" stays.
  - Lists ask with the period chosen.
- **A month doesn't move:** Oct's 11 cards read 188 · 50 · 127 · 88 · 228 · 123 · 27 · 0 · 55 · 96 · 32, **exactly uat round 2's Oct row** (2026-11-07).
- **AC-5, FL:** all 11 FL rows read hours only (e.g. "105 h", "4 h", "101 h"); no "/", no %, no bar.
- **PT "—":** "—" where a PT has no weekday hours, real hours where they have some ("1 h", "16 h"). Hours = the weekend figure. No "/ 0".
- **FT:** % and x / y h, unchanged.
- **Phone, 375 px:** no sideways scroll; the period control fits; the date picker fits (16–309 px); a list opens inside the screen.

**Worth your eye, not a defect of this build:** on Oct, 3 PT rows read **"100% 40 / 36 h"**, "62 / 54 h" and "56 / 54 h": more hours booked than available, with the % stopping at 100. The capacity rules weren't changed by `45bf187`, and round 2 passed the numbers. Only the display of over-capacity is worth a look, if anyone wants.

**Still NOT_TESTED on uat:**
- the branch control on the new screen (uat has 1 badge with 0 values);
- each row's cells against the API page by page (counts and numbering checked, row by row only in round 2);
- the filter reset inside a list still longer than 10 after filtering;
- a list of exactly 10 rows;
- Thai beyond the dictionary;
- a real phone;
- card 3's and Total's rules on built cases (read-only; passed on sid).

**Evidence (`tests/evidence/`, git-ignored):** `test138up-1-renew-page1.png` · `test138up-2-renew-page3.png` · `test138up-3-phone-list.png` · `test138up-4-phone-page2.png` · `test138us-1-opens-on-all.png` · `test138us-3-range-applied.png` · `test138us-4-phone-top.png` · `test138us-6-phone-picker.png` · `test138us-7-phone-list.png`.
**Test data created:** none.

## Customer gate, 2026-11-08: the Khwan definitions draft (round 2): 🔧 FAIL, 2 lines
**Draft checked:** `COPY-DRAFT-khwan-som-dashboard-round-2-definitions-2026-11-07.md`, md5 `723ebfd596efdfc4637f5eb465aff4d6` from "ขวัญครับ" to the end of the file (`6aadcf08e71cea60689de5557146b6de` without the last newline).
- **Checked against:** REQ-5002, REQ-5004 §2–§4a, Silver's CHECK §4.2–§4.6, my TEST-138 built cases D1–D13, and today's uat runs.
- **Read on uat today:** the screen and paged rounds, plus one more read-only API read. Every non-GET aborted; only `POST /cdn-cgi/rum` was tried; counts and field names only.

**These hold:**
- **The opening:**
  - "แก้ … ทั้งสองครั้ง … ขึ้นระบบแล้ว": REQ-5002 and REQ-5004 (back + Palm's `45bf187`) are both on uat and passed.
  - The example child's Renew row in October: **1 row** on uat today, out of 55, matched in-page by her name. The cancelled ones are gone.
- **"ช่วงเวลา":** it opens on all data (uat: "9 Aug 2026 – 8 Nov 2026"); Monthly and a custom from–to work; the Active cards count as of the period's last day, capped at today (Silver §4.6; on uat, Oct reads that month's figures and All reads today's).
- **The cut-short line:** as ruled in REQ-5002 (not cancelled, counted as finished).
- **Lines 1, 2, 4, 6, 9, 10, 11** match the rules and the built cases (D8, D9, D10).
- **Line 5 (Total):** children with an Active course or voucher, each once, archived out (D10–D13, AC-4 amended).
- **The 11 names** match the screen's labels exactly.
- **Coach Capacity:** FT 5 / 6, PT 6 at weekends, Karn 4, a PT's weekday FL hours out of the fraction, FL hours only, recorded leave deducted (§4.2). All seen on uat's screen today.
- **The note on past periods:** today's working days apply backwards (§4.2).

**2 required replacements:**
1. **Line 21 (card 3), "ตั้งแต่วัน 1st จนถึงวันนี้".** It's true only for the current period. On a past period, the as-of day is that period's last day (§4.5–§4.6). Example: an October view where the 1 HR came in November still shows the child on card 3, and she'd read that as a bug. The wording also suggests that only a voucher opened after the 1st counts, but a course or voucher moves the child whatever the order (D2).
   - **Replace** line 21 **with:** `3. 1st Trial (last 3 months): เด็กที่มี 1st ในช่วง 3 เดือนนั้น ถ้าเปิดคอร์สหรือ Voucher หรือมีคลาส 1 HR ตั้งแต่วัน 1st จนถึงวันสุดท้ายของช่วงที่เลือก จะย้ายออกจากช่องนี้ (แต่ยังอยู่ในช่อง 1st Trial และ 1st Trial, no course ตามเงื่อนไขของช่องนั้น) ครับ`
   - **To keep D5/D7 in it:** a 1 HR before the 1st, or one dated after the period's end, doesn't move the child. The "ตั้งแต่ … จนถึง" in the replacement covers both, and "จนถึงวันสุดท้ายของช่วงที่เลือก" covers D7 for today too.
2. **Line 26 (New previous), "มี 1st ในเดือนก่อนหน้า".** Silver's rule (§4.6) is the 1st in **an earlier** calendar month than the purchase, any earlier month, not only the month just before. Over "All" it has to be, or New previous would always be 0. On uat today every row happens to be a 1-month gap (5 rows on All; Sep 4, Oct 0, Nov 1), so the data doesn't show the difference yet. A 1st in August with a course in October would count, and her checking would miss it.
   - **Replace** line 26 **with:** `8. New Course previous month: คอร์สแรกของเด็ก ที่เปิดในช่วงที่เลือก โดยมี 1st ในเดือนก่อนหน้าเดือนที่เปิดคอร์ส (เดือนใดก็ได้ก่อนหน้านั้น) ครับ`

**Recommended, for the same reason as fix 2:** line 25 (New this month) doesn't say "in the selected period". Replace with `7. New Course this month: คอร์สแรกของเด็ก ที่เปิดในช่วงที่เลือก โดยมี 1st ในเดือนเดียวกับที่เปิดคอร์สครับ`

**Your over-capacity question: yes, add a line.** On uat's October, 3 PT rows read "100% 40 / 36 h", "62 / 54 h" and "56 / 54 h": more hours taught than available, with the % stopping at 100. She'll compare her own sheet with the % and find it lower than the hours say.
- **Add under Coach Capacity:** `- ถ้าชั่วโมงที่มีสอนเกินชั่วโมงที่สอนได้ เปอร์เซ็นต์จะแสดงสูงสุด 100% แต่ตัวเลขชั่วโมงเป็นค่าจริง เช่น 40 / 36 h`
- **Whether the % should stop at 100** isn't in her words or the REQ. It's the screen's behaviour, and I'm stating it as seen, not as ruled. If the owner wants it to show 111 %, that's Palm's.

**A limit I didn't add, your call:** capacity over "All" is rough (Silver §4.6: a coach counts from the later of the data's start and when they were added). Line 39 covers past changes in working days, not this.

**This verdict rests on:** uat as read today. Card 3's and Total's rules on built cases were run on sid, not uat. Nothing on uat was written. The example child's name was matched in the page only, and not printed or stored.

## Customer gate, re-check, 2026-11-08: the Khwan definitions draft v2: ✅ PASS
**Draft checked:** v2, md5 `9e1459548950492d8e0c4474f1f972a6` from "ขวัญครับ" to the end of the file (`29d07eb61858a9b06ddada72ce0e5c8a` without the last newline). It matches your `9e145954`.
- **In, word for word:** my 2 replacements (line 3 to the period's last day; line 8 any earlier month), the recommended line 7, and the over-capacity line (100 % cap, real hours, "40 / 36 h", as seen on uat's October).
- **The rest is unchanged from v1** and holds, as in my v1 check against uat today.
- **The "All" capacity limit** is left out, your call. It's not a wrong claim, only an unstated one.

**This PASS rests on:** uat as read on 2026-11-08, read-only. Card 3's and Total's rules on built cases were run on sid. The 100 % cap is stated as the screen behaves, not as a ruling. Nothing was written.

## Customer gate, 2026-11-08: the Khwan follow-up draft (Bonus 100 example, go-live month, park fee, data list): 🔧 FAIL, 1 line
**Draft checked:** `COPY-DRAFT-khwan-followup-bonus100-golive-parkfee-data-2026-11-08.md`, md5 `844f70321a61ac500ef5dc9792e37f0a` from "ขวัญครับ" to the end of the file (`99ad922f74aa9f01e45f93157929b028` without the last newline).
**Checked against:** REQ-120 §15 (her verbatim answers), R1.1, R1.2 (Bonus 100), D5, D6, DECISIONS rows 11 and 12, and Master Plan v1 §3 and §7 (md5 `83592c51`, unchanged). It's a document check; nothing was run.

**These hold:**
- **Item 1, the case and A/B:** the same case as the 11-07 draft I passed (bought before go-live, renewed after), and the same A/B meaning. "ครูคนแรกของคอร์สเดิม" matches R1.2. Build default 1A stays switchable (row 12). The rows 17–20 wording is fine.
- **Item 2:** "เร็วที่สุดเดือนกุมภาพันธ์ 2570" holds. Revenue goes live for trial in wk 11–12 = 18–31 Jan 2027 (from Mon 9 Nov), so the first whole month is Feb 2570, the same as the 11-07 draft. "เริ่มนับวันที่ 1 ของเดือนนั้น" = D5. It answers her question back ("เราเลือกได้เลยหรอคะ") without inventing a month.
- **Item 3:** the same question as the HELD park-fee draft, word for word in substance, and exactly what row 11 needs (one block per hour today; yes ⇒ a follow-up TASK). "Park fee" is her own term (R2 table).
- **Item 4:** exactly §7's ขวัญ rows that are due on the start day: staff + type · vehicles · schools + distances · Merit · revenue types/categories + branches. The pay data (base, FL rates, the comparison month) is **not** in it, so it stays ฟีน → owner. The product list (received 3 Nov) and the stock count (≈ wk 7) are rightly out. The 4 types match R1.1.
- **Rules:** formal, ครับ throughout; "ขวัญ" without พี่; no staff or child names; no internal words; the only questions are to ขวัญ; no cause stated.

**1 required replacement:**
1. **Line 21, "ส่วนคอร์สที่เปิดก่อนเริ่มใช้ระบบกลางเดือน ขวัญใส่มือตามที่แจ้งมาได้เลยครับ".** It sits right under A/B, and the example's old course was **also** "ซื้อก่อนวันเริ่มใช้ระบบ". So she can read line 21 as "the old course's bonus, I enter by hand". Under 1A the system already pays that renewal, so she'd pay it twice. Or she reads A/B as moot. What she said in §15 is narrower: a mid-month go-live, the purchases made **earlier that month**, which the system doesn't compute. The bonus goes by the purchase date (row 12b), so say that.
   - **Replace** line 21 **with:** `   ส่วนกรณีเริ่มใช้ระบบกลางเดือน โบนัสจากคอร์สที่ซื้อหรือต่อในเดือนนั้นก่อนวันเริ่มใช้ระบบ ระบบจะไม่คิดให้ ขวัญใส่มือได้ตามที่แจ้งมาครับ`

**Recommended, your call:**
- **Line 19 (A's reason):** her answer was all about "no back-calculation", so give A the 11-07 reason she has already seen. `   A. ได้ (เพราะการต่อคอร์สเกิดหลังเริ่มใช้ระบบ ไม่ใช่การคิดย้อนหลัง)`
- **Line 27 (when the data is due):** "ประมาณวันไหน" alone invites "end of the month", and the plan counts its weeks from when the data is complete (§3 heading and its first bullet). `4. ข้อมูลสำหรับเริ่มงานตามแผน ตามแผนต้องการตั้งแต่วันเริ่มงานครับ ถ้าส่งช้า วันส่งมอบจะเลื่อนตาม ขวัญจะส่งได้ประมาณวันไหนครับ`
- **Line 28:** one person can be PT + FL (R1.1). `   - รายชื่อพนักงานพร้อมประเภท (Full-time / Part-time / Freelance / Staff ถ้าคนเดียวเป็นทั้ง Part-time และ Freelance ระบุทั้งสองอย่าง)`
- **Line 14:** "ขอยืนยันเพิ่มอีกนิด" reads a little casual, and items 2–4 aren't confirmations. `ขวัญครับ ขอบคุณสำหรับคำตอบครับ ขอสอบถามเพิ่มเติมอีก 4 ข้อครับ`
- **Line 25 (optional):** "2 กลุ่ม" → "2 กลุ่มขึ้นไป", if more than two at once is possible.

**This verdict rests on:** the files named above as on disk today. Whether the system's go-live cut-off really skips pre-go-live purchases is from DECISIONS row 12 (switch `goLiveDate`), not from a run.

## Customer gate, re-check, 2026-11-08: the Khwan follow-up draft v2: ✅ PASS
**Draft checked:** v2, md5 `1a42720887b6f72fe1df5110ed32a13f` from "ขวัญครับ" to the end of the file (`f40738b2f3f346a3c3cf1ba409a83f0e` without the last newline). It matches your `1a427208`.
- **In, word for word:** my line-21 replacement (bonuses from purchases earlier in a mid-month go-live month, entered by hand) and all 5 recommended lines (14 the opening, 19 A's reason, 25 "2 กลุ่มขึ้นไป", 27 needed from the start day and a late send moves the dates, 28 PT + FL).
- **The rest is unchanged from v1** (lines 16–18, 20, 23, 29–34) and holds, as in my v1 check: item 2's Feb 2570 (wk 11–12 = 18–31 Jan 2027), item 4 = §7's ขวัญ rows only, pay data stays ฟีน → owner.
- **Rules:** formal, ครับ; "ขวัญ" without พี่; no names; no internal words; questions to ขวัญ only; no cause stated.

**This PASS rests on:** a document check against REQ-120 §15, R1.1, R1.2, D5, D6, DECISIONS rows 11–12 and Master Plan v1 §3, §7 as on disk today. That the system skips purchases made before go-live comes from DECISIONS row 12, not from a run.
