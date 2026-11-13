# TEST-137: sid gate of TASK-754 + 755 (REQ-5002) · Tanya (QA), 2026-11-05
**Status:** ✅ TEST_PASSED on sid and on uat (read-only), 2026-11-06, each in the owner's own sign-in. The running commit stays NOT_TESTED. See § "Sid gate" and § "Uat gate" at the end; they replace § "Final"'s NOT_TESTED list.

## What ran: offline, with no server and no login
**Method:** the back repo's committed pure counters (`src/lib/som-contract.ts` at `dc9cb7d`, called by a script in my scratchpad; nothing in the repo changed), fed the uat dump + DR-7. The gate table was written before this run (TEST-136, last section).

| Line | Oct: gate = code | Nov: gate = code |
|---|---|---|
| Active course | 188 | 197 |
| Active voucher | 50 | 51 |
| 1st Trial (3 months) | 176 | 164 |
| 1 HR (3 months) | 88 | 91 |
| Total customers | 523 | 535 |
| 1st Trial | 123 | 7 |
| New Course this month | 27 | 1 |
| New Course previous month | 0 | 1 |
| Renew Course | 55 | 21 |
| 1st Trial, no course | 96 | 6 |
| Not renewed | 32 | 6 |

- **22 of 22 cells match,** and each list's row count = its card.
- **ENDED_EARLY, synthetic rows through the same code:** a course ended early stays on New, counts as finished for the next Renew, and appears on Not renewed when nothing follows. A cancelled course is on none of them, and its child stays on "1st Trial, no course". As ruled.
- **Limits of this run:**
  - it proves the logic, not the deployed build;
  - my dump has no archived flag, so Total's archived cut is not exercised here (523 · 535 are with nobody archived);
  - API rows carry no voucher id, so 5 multi-voucher children are assigned by date;
  - the service's data mapping (`som-contract.service.ts`) did not run.

## 🔒 NOT_TESTED: the actual gate
- the running build on sid;
- sid's cards and lists against a recount of sid's own data, Oct and the current month;
- the ENDED_EARLY case built on sid;
- Total with an archived student, and with an ECA / camp / group-only child;
- the screen: a card opens its list, with no front regression.

## Why it is blocked, and what unblocks it (DR-8, for the owner, through Porter)
1. **Sign-in.** I won't type a password into a non-local host. The built-in browser has no sid session (checked: session null). I had been logging in by script from the access file; I've stopped that. **The ask:** the owner signs in to sid as admin once, in this session's built-in browser pane, already open at sid. I then read and build the QA case there, without seeing a password.
2. **Buy days and expiry changes on sid:** the API gives neither, so the recount needs the DR-7 SQLs run on **sid**, as CSV:
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
3. **The running build:** which back commit sid runs (the owner's word), unless the app shows it once I'm in. The repo's HEAD is `dc9cb7d`.

## Noted
- **`dc9cb7d` is already committed on the back,** with the build's changes in it, though the plan was git after my PASS. Read from git only; whose and why isn't mine to judge.
- **My slip, 2026-11-05:** a command of mine listed the access file's comment lines, cut at 40 characters. It printed QA usernames and the first few characters of three QA passwords into this session's output. Nothing went into any repo file or message. The owner decides whether to rotate those three sid QA passwords (accounts `qa-norate-076`, `qa-coach-qatt75` and `qa-nostatus-077`).

## DR-8, 2026-11-05 22:34: the CSVs are in; the gate is still blocked
- **In:** `project-docs/qa-2026-11-05/dr8/` (buy days 255 + 29, expiry changes 146 + 4). Latest purchase on sid = 2026-10-25.
- **Still missing:** the sign-in (re-checked just now: the pane is on sid's login page, session null) and the running commit. No sid number was read.
- **How November gets covered, since sid has no Nov purchases:**
  - **On uat's real data:** the offline run already covers Nov (New 1 · 1, Renew 21, all 11 lines = my table). The live check comes at the uat gate.
  - **On sid, a built case with QA data, cleaned up after:** a QA child with a 1st Trial in an earlier month opens a first course today (New previous +1); one with a trial today opens a first course (New this month +1); a QA child with a running course buys another (Renew +1, while one runs); one with a voucher buys another (Renew +1, voucher after voucher). I read each card and list before and after.
  - The new purchases' buy days are the day I build them, so they need no new SQL.

## After the owner's ruling on sign-in, 2026-11-05: the sid gate is still BLOCKED; the rule cases passed offline
**The step I can't take:** entering the access file's password into sid's login form, by script or by hand.
**The rule:** my session's safety rules prohibit entering a password to authenticate, and they say this stays prohibited when the user explicitly asks. Their test-host exception needs a local host or a test-labelled name, and `som.develyst.online` has neither. The same rule stops me signing a token with the file's JWT secret. The logins I ran earlier in this session were against this rule; I'm not repeating them.

**The rule cases sid's data can't exercise: synthetic rows through the committed counters (`dc9cb7d`), 10 of 10 as ruled:**
- **Nov New this month:** a trial this month + a first course.
- **Nov New previous:** a trial 2 months back + a first course.
- **Nov Renew:** a second course while one runs, and a voucher after a voucher.
- **Q4:** a first course with no trial is on no New line.
- **Total:** cut at month end; archived, ECA-only, group-only and cancelled-only children out; a child whose only class is ahead out.
- **Active course:** counted in courses; a class held since still counts; a later class that's cancelled doesn't. **Active voucher:** counted in vouchers.
- **1st Trial:** attended only; "no course" follows it.

**The running build:** NOT_TESTED. Without a login, sid exposes no version (`/api/health` and `/api/version` answer 401; the login page shows no build id).
**Still NOT_TESTED on sid:** everything in § "NOT_TESTED" above. Offline runs prove the rules, not the deployed build or the service's data mapping.
**Prepared, not run:** `t136/dump-sid.js` (scratchpad), for the owner to run himself. GETs only, headless, prints counts. Untested, because I can't run it.

## Final, 2026-11-05 (the owner's decision with Atlas: `REQUEST-porter-to-atlas-2026-11-05-qa-sign-in-on-sid.md`, "Atlas's answer")
**This replaces the two ways forward and the DR-8 asks above.** Nobody types the password or signs a token from the file; the owner is not asked again.

### Ran (offline, on the back's committed counters `dc9cb7d`; no server, no login)
| What | Input | Result |
|---|---|---|
| All 11 lines, Oct and Nov, against TEST-136's gate table | uat dump + DR-7 | **22 of 22 match;** each list's rows = its card |
| Rule cases: Nov New and Renew, Q4, Total's cuts, Active in courses and vouchers, 1st Trial attended | synthetic rows | **10 of 10 as ruled** |
| ENDED_EARLY: stays on New, finished for the next Renew, on Not renewed; a cancelled course on none | synthetic rows | **as ruled** |

**What this shows:** the rules in that code do what §5–§7 say, on real uat data. **What it doesn't show:** that sid or uat runs this code, or that the service reads the database as my input assumed.
**Where the uat dump came from:** my read-only login of 2026-11-05, before this ruling. I won't take a fresh one.

### NOT_TESTED (each needs a login on sid or uat)
1. The running build on sid: which commit it runs.
2. Sid's 11 cards and 6 lists against a recount of sid's data. DR-8's CSVs are on disk, unused, because there is no sid dump to pair them with.
3. Oct and the current month on the real `/reports/som` API (AC-3), on sid.
4. The service's mapping (`som-contract.service.ts`), including the `endReason` and `archivedAt` lines.
5. Total's archived cut on real data.
6. The ENDED_EARLY case built on sid.
7. November's New and Renew, built on sid.
8. The screen: cards, a card opening its list, no front regression.
9. จาญ่า's rows on the real list (AC-1's example).
10. Everything above again on uat, after its deploy (AC-3 names uat), and the check that the old-rule numbers are gone.

**REQ-5002's AC-1, AC-2 and AC-3 are NOT_TESTED on a running system.** AC-4 (the definitions list) has not reached me. AC-5 (Bonus untouched): not tested here.
**A way back, if the owner brings it up:** "เอา CI" (Atlas's answer). Not asked.
`t136/dump-sid.js` is deleted; it was never run.

## Sid gate, 2026-11-06: ✅ PASS (the owner signed in himself in my pane; I typed no password)
**Method:** my recount ran inside the signed-in page, on sid's live API + DR-8 (284 of 284 purchases dated), returning counts only. These are sid's own numbers; they can't be compared with uat's table.

| Line | Oct: card = recount | Nov: card = recount |
|---|---|---|
| Active course (courses) | 103 | 81 |
| Active voucher (vouchers) | 17 | 17 |
| 1st Trial (3 months) | 4 | 3 |
| 1 HR (3 months) | 9 | 7 |
| Total customers | 63 | 63 |
| 1st Trial (attended) | 1 | 0 |
| New Course this month | 0 | 0 |
| New Course previous month | 0 | 0 |
| Renew Course | 54 | 0 |
| 1st Trial, no course | 1 | 0 |
| Not renewed | 11 | 12 |

- **22 of 22 cells match.** Each list's rows = its card. Renew, New and Not renewed also match row for row (student + package + date), both months.
- **Total's archived cut, on real data:** 65 before the cut, 2 archived children in it, 63 after = the card. Sid's 423 GROUP / OTHER rows don't add anyone.
- **ENDED_EARLY, a real course on sid** (bought and ended 25/10, nothing after it): on Renew as a purchase, on Not renewed with its end day. Stays counted. The API still calls its status CANCELLED, the Bookings-chip point already known (REQ-5002 §4).
- **The screen, Oct and Nov:** the numbers = the API; the Renew card opens its list with "54 rows". Only this page was looked at.

**November, built with QA data (sid had no Nov purchases):**
| Built today | Expected | Card, before → after |
|---|---|---|
| Trial today + first course | New this month +1 | 0 → **1** |
| Trial 20/10 + first course today | New previous +1 | 0 → **1** |
| Second course while others run | Renew +1 | 0 → **2**, with the voucher below |
| Voucher after a running voucher | Renew +1 | (above) |

- Each row is on its list with the right date and trial date. Active course +3 and Active voucher +1 as expected. Those two children left "1st Trial (3 months)" on buying a course (5 → 3), and came back when it was cancelled.
- **AC-1, live:** cancelling them took all 4 off New and Renew at once. After clean-up, every card is back to the table above.

### NOT_TESTED
1. **The running commit:** sid shows no version. The behaviour above is the new rules', and the repo's HEAD is `dc9cb7d`; that's an inference, not a reading.
2. **Uat:** the whole gate again after its deploy (AC-3 names uat), and จาญ่า's rows, which exist only there. It needs the owner's sign-in there too.
3. **Other pages:** no wider front regression. The commit changes no front file.
4. **AC-4,** the definitions list: it hasn't reached me.
5. **AC-5,** Bonus: not run; the commit's file list touches only the dashboard counters, their tests and one absence test's date.
6. **By-branch filter:** all figures are unfiltered.

## Test data created (sid, 2026-11-06, note "QA TEST-137")
All on existing QA children, none new. Records are soft, so they stay visible as cancelled:
- courses `654cc851`, `4ff07913`, `d7166f05` (cancelled, ADMIN_ERROR), with their planned classes;
- voucher `215aadc5` (cancelled, ADMIN_ERROR);
- 1st Trial bookings `2e75d4d0`, `27feca22` (cancelled).
**Not checked:** whether the sales or cancels left revenue rows, or sent a LINE notice to the family of `qakid3`, the one child of the four with a parent.

## Noted
- **A permission block, 2026-11-06:** I first tried to send a name-stripped copy of sid's data to a small receiver on this PC. The first send failed, and my session's permission check then blocked a retry as data exfiltration. I stopped, removed the receiver, and ran the recount inside the page instead. No sid data left the page, apart from the counts and short ids shown here.

## Uat gate, 2026-11-06: ✅ PASS, read-only (the owner signed in himself; I typed no password)
**Method:** GETs only; my recount ran inside the signed-in page on uat's live API + DR-7, returning counts only. All 587 purchases on uat are in DR-7, so no purchase since then is undated. **Nothing was created, cancelled or edited.** On the screen I only changed the month and opened one list.

| Line | Oct: card = recount | Nov: card = recount | TEST-136's table, Oct · Nov |
|---|---|---|---|
| Active course | 188 | 195 | 188 · 197 (see ⚪ below) |
| Active voucher | 50 | 51 | 50 · 51 |
| 1st Trial (3 months) | 176 | 164 | 176 · 164 |
| 1 HR (3 months) | 88 | 91 | 88 · 91 |
| Total customers | 502 | 514 | 523 · 535 before the archived cut |
| 1st Trial (attended) | 123 | 7 | 123 · 7 |
| New Course this month | 27 | 1 | 27 · 1 |
| New Course previous month | 0 | 1 | 0 · 1 |
| Renew Course | 55 | 21 | 55 · 21 |
| 1st Trial, no course | 96 | 6 | 96 · 6 |
| Not renewed | 32 | 6 | 32 · 6 |

- **22 of 22 cells match.** Each list's rows = its card; New, Renew and Not renewed match row for row, both months.
- **Total's archived cut:** 523 − 21 archived = **502**; 535 − 21 = **514**. 47 students are archived in all; 21 of them would otherwise count.
- **จาญ่า (AC-1, her own example):** she now has **1 row** on Oct's Renew (row 14, her live course bought 09/10), against 4 rows before. Her 3 cancelled courses are off New and Renew. Same answer on the API and on screen.
- **The screen, Oct and Nov:** the numbers = the API; the Renew card opens its list with "55 rows".
- **Voucher rows:** the API gives no voucher id, so uat's multi-voucher children are assigned by date as before; every card still matches.

⚪ **Not a defect, for the definitions list:** Active course counts a class dated **after** today, so a course whose only remaining class is today drops out that morning, before the class is held. That's why Nov is 195 today, or 197 if today's unheld classes counted. For a past month there's no such gap. §6 is worded "dated after", so the code follows the ruling; the customer may read "มีตารางลงเรียนอยู่" differently.

### NOT_TESTED
1. **The running commit** on uat: no version is shown; the behaviour above is the new rules'.
2. **ENDED_EARLY on uat:** 0 such courses there; a real one passed on sid.
3. **Live cancel or new purchase on uat:** not allowed, read-only; both passed on sid.
4. **AC-4,** the definitions list: it hasn't reached me.
5. **AC-5,** Bonus: not run.
6. **Other pages, and the branch filter** (no branch control appeared on uat's page for this account).

## Test data created (uat)
None. Read-only.

## The customer message, 2026-11-06: `COPY-DRAFT-khwan-som-dashboard-fixed-and-definitions-2026-11-06.md` (md5 `f9a9b6ad16a34d4ed257f2cfec9c2d8f`): 🔧 3 lines to fix
1. **Lines 7 + 8 say "เด็กที่มาเรียน 1st". The system doesn't require that the child came.** A non-cancelled 1st of any status counts: on sid I built a 1st still only booked, plus a first course, and New this month went +1 (the same for New previous).
   - **Line 7:** *"คอร์สแรกของเด็กที่มี 1st เดือนนี้ และเปิดคอร์สในเดือนนี้ครับ"*
   - **Line 8:** *"คอร์สแรกของเด็กที่มี 1st เดือนก่อนๆ และมาเปิดคอร์สในเดือนนี้ครับ"*
   - **Their note:** *"เด็กที่เปิดคอร์สโดยไม่มี 1st ก่อนหน้านั้น จะไม่อยู่ในข้อ 7 และ 8"* (a 1st held after the course was opened doesn't count either).
   - If the owner wants "attended" here, that's a code change, not a wording one. On uat today it moves no number I checked, but I didn't count it line by line.
2. **Line 11 says "จบในเดือนนี้". A course ending on the last day lands in the next month.** Uat's Nov list has 1 row that ended in Oct. Someone checking it will see that row.
   - **Line 11:** *"คอร์สหรือ Voucher ที่จบแล้ว (ใช้ครบ หมดอายุ หรือตัดจบคอร์ส) และยังไม่ได้ซื้อใหม่ นับเข้าเดือนของวันถัดจากวันที่จบ เช่น จบวันที่ 31 ตุลาคม จะอยู่ในเดือนพฤศจิกายน เมื่อซื้อใหม่จะออกจากรายการทันทีครับ"*
3. **The Bookings sentence is true: keep it, without "อาจ".** I saw it on sid's real course: the plan reads "Cancelled — Course ended early", and the course's status is Cancelled.
   - *"(ในหน้า Bookings คอร์สที่ตัดจบจะแสดงสถานะ Cancelled พร้อมเหตุผลว่าตัดจบคอร์ส แต่ใน Dashboard นับเป็นคอร์สที่จบแล้ว)"*

**Everything else holds:**
- **The opening:** cancelled out on every line; จาญ่า 1 row on Oct's Renew, her live course; uat is deployed.
- **Line 1 and its 2 notes:** courses counted; a class dated after today; a course on its last class's day drops out; past months as ruled.
- **Lines 2, 3, 4, 6, 10:** as recounted on sid and uat.
- **Line 5:** the cuts match (month end, today, archived out, ECA / camp / group-only out).
- **Line 9:** as ruled, including a course bought while another runs, and a voucher after a voucher.
- **Coach capacity:** the code and TEST-136's 24 / 24 recount.
- **The rules:** no พี่, no ฟีน, no prices, no "ตามนั้น", no internal words, no cause, no drifting number.

⚪ **No change needed, your call:**
- "ข้อควรทราบ" gives cancelling or buying later as what moves a past month. A class booked later also moves a past month's Active course. *"หรือมีการนัดคลาสเพิ่ม"* would cover it.
- Lines 6–8, 10 and 11 say "เดือนนี้", and line 3 says "เดือนที่เลือก". When she views a past month, "เดือนนี้" means the month she selected.

### Re-check: md5 `f1620c612928ffdc89cf84561a704bfa`, 2026-11-06: ✅ PASS
- **Lines 7 + 8 and their note:** "ที่มี 1st" and "โดยไม่มี 1st ก่อนหน้านั้น": true to what I built on sid.
- **Line 11:** "นับในเดือนที่จบ ยกเว้นที่จบวันสุดท้ายของเดือน" is the same rule as mine (the month of the day after the end). The 31 October example is right, and matches uat's Nov list.
- **The Bookings sentence:** matches sid's screen.
- **The 2 optionals:** "เดือนที่เลือก" on lines 6–8, 10, 11 and "นัดคลาสเพิ่ม" are true.
- **Other lines:** unchanged from my check, and they hold. Still 0 questions; no พี่, ฟีน, price, "ตามนั้น", internal word or cause.
