# TEST-122 (REQ-131 / TASK-839) + TEST-123 (REQ-130 / TASK-749) on sid: 🔒 BLOCKED, one DATA REQUEST (DR-4)

- **QA:** Tanya
- **Date:** 2026-10-25
- **Brief:** Porter's ▶️ GO TEST-122 / GO TEST-123 entries in `inbox/QA.md`
- **Nothing was written on sid for either test.** No fixture was left that tomorrow's real 17:30 day-end job could pick up.

## TEST-122: why I can't start it alone
- **The refusal comes only from the parent's own LINE action** (`line-webhook.service.ts:1048`, the parent's leave tap). Calling the webhook myself would need LINE's signature, and I won't forge it.
- **The only LINE-linked QA parent** is a3fb456e (QAChatOne / QAChatTwo), on the phone **0899990763**. So the parent's tap has to be made on that phone.
- **The admin rows:** sid has no LINE-linked admin (TEST-111), so each admin row is SKIPPED, and its text is built only at send time. **What I can prove by value is the row's `booking_id` and payload (SQL).** The rendered "…: <child> · <dd-mm-yyyy>" line needs a linked admin, or Sober's unit test.

## TEST-123: why I can't start it alone
- **The trigger `POST /internal/jobs/end-of-day` needs `INTERNAL_JOB_SECRET`.** I have no access to sid's env, it's not in my access file, and the brief says it must never be written down.
- **sid's back version:** sid has no public version endpoint, so I can't confirm `304212d` (vs `8db9f74`) from outside.

## DR-4: ONE request, for the owner (via Porter)
1. **Confirm sid's back is at `304212d`** (e.g. \`git log -1\` on the box).
2. **TEST-123's trigger:**
   - when I say "ready", the owner runs the day-end job once on sid **twice**, a few minutes apart (no output to me except the HTTP status);
   - **or** gives me a way to run it that keeps the secret off any file and chat.
   - I then prepare the QA fixtures right before (so tomorrow's 17:30 job never sees them), read the result by value (status, quota, posted sale), and clean up.
3. **TEST-122's parent tap:**
   - I prepare a QA course for QAChatOne whose next session has no room for a make-up before its expiry;
   - the owner then taps "แจ้งลา" for that session in LINE **on 0899990763**;
   - afterwards, one bare SQL (below) shows the admin rows.

```sql
SELECT created_at, recipient_type, status, booking_id IS NOT NULL AS has_booking,
       payload->>'kind' AS kind, payload
FROM notification_outbox
WHERE created_at >= '2026-10-25'
  AND (payload->>'kind' = 'leave_refused_no_validity' OR recipient_type = 'admin')
ORDER BY created_at DESC
LIMIT 20;
```

The full TEST-122 / TEST-123 reports follow once DR-4 is answered.


---
## TEST-123: fixtures READY on sid (2026-10-25 19:05 Bangkok). Run date for the job = **2026-10-25**
- DR-4 (1) answered by the owner: sid back = `304212d` (*"sid ล่าสุดเลย"*).
- **QA fixtures** (teacher qatt75b, QA kid QAChatTwo, its QA voucher `48d2c786`: 5 h, 0 used):

| Key | Date (9:00) | Type | Status now | Expected after run 1 | After run 2 |
|---|---|---|---|---|---|
| F1 `f6688ea2` | 22 Oct | 1 HR | CONFIRMED | **ATTENDED**, **posted once** | unchanged, still posted once |
| F2 `74f9104c` | 20 Oct | VOUCHER | CONFIRMED | **ATTENDED**, voucher **1 h used**, a deduction LINE with its class date; not posted (vouchers aren't) | unchanged (still 1 h) |
| F3 `ff9ea3fd` | 23 Oct | priced OTHER (300.00) | CONFIRMED | **ATTENDED**, **posted once** | unchanged |
| N1 `a9ef0058` | 17 Oct (8 days) | 1 HR | CONFIRMED | **untouched** (outside the 7-day window) | untouched |
| N3 `e4e769f7` | 21 Oct | 1 HR | PENDING | **untouched** | untouched |
| P4 `9a4a5feb` | 24 Oct | 1 HR | ATTENDED (by staff) | stays ATTENDED; **posted once** by the sweep | still once |

- **Before snapshot:** all posted-sale = none; the voucher 0 / 5 h.
- **Not buildable from the admin side:**
  - "an undone attendance": sid refuses to undo a staff attendance (`UNDO_STAFF_ATTEND`: undo is for a parent's own check-in only);
  - "an EXTENDED row in the past": a make-up can't be back-dated;
  - "today's class not started yet": no slot after 17:00 today.
  - These three stay with the unit tests (TASK-749's set).

### For the owner (via Porter): run the day-end job **twice**, a few minutes apart, ON THE BOX
- The route is mounted at the **root** (`/internal/jobs/end-of-day`, not under `/api`). Call it as the scheduled task does, on the back's local port, with the secret from sid's env.
- **Use the body `{"date":"2026-10-25"}`**, so the run date is fixed even after midnight.
- Then say "ran twice" (the HTTP status and the JSON summary of each run are welcome; no secret).
- **Before tomorrow 17:30** I read everything back and clean up, so the real job never sees these rows.


### TEST-123 · run 1 (the owner, 19:12, `{"date":"2026-10-25"}`): read back by value
**The summary:** `autoAttended 6 · coursesAutoAttended 3 · vouchersAutoAttended 1 · sweptPosted 4 · revenuePosted 0`.

| Row | After run 1 | Expected | |
|---|---|---|---|
| F1 1 HR 22 Oct | **ATTENDED** (check-in source `end-of-day`) · **posted 1,390.00** (12:12:26 UTC) | attended + posted | ✅ |
| F2 VOUCHER 20 Oct | **ATTENDED** (`end-of-day`) · not posted · **voucher 1 / 5 h used** (was 0) | attended, 1 h cut, not posted | ✅ |
| F3 priced Other 23 Oct | **ATTENDED** (`end-of-day`) · **posted 300.00** | attended + posted | ✅ |
| N1 1 HR 17 Oct (8 days) | **CONFIRMED**, not posted | untouched | ✅ |
| N3 1 HR 21 Oct PENDING | **PENDING**, not posted | untouched | ✅ |
| P4 1 HR 24 Oct (staff-attended) | ATTENDED (`admin`) · **posted 1,390.00** | posted once by the sweep | ✅ |

**The 3 non-fixture auto-attends** (= `coursesAutoAttended 3`; found by each course's history event at 12:12:25 UTC):
- all three are **QA course sessions dated 19 Oct**, QA kid QAChatTwo;
- they were still **CONFIRMED** with their start long passed (left over from my TEST-096 / TEST-099 runs);
- 19 Oct is inside the window (run date − 6). **Right by the rule; exactly what TASK-749 is for.**

| Course | Teacher | Session | Note |
|---|---|---|---|
| `f7c5ce29` | qatt75b | 19 Oct | ACTIVE course |
| `abcd45b3` | qatt75b | 19 Oct | ACTIVE course |
| `47f7c357` | qatt75 | 19 Oct, **a make-up of 5 Oct** (make-ups are born CONFIRMED, not EXTENDED) | it was the course's last session, so the course is now **COMPLETED** |

**The 4th swept post** (`sweptPosted 4` = F1 + F3 + P4 + 1) is a **QA 1 HR on 23 Oct for "QA Link 083 H"**: already ATTENDED but never posted, so posted at 12:12:26. **Right by the rule.**

- `vouchersAutoAttended 1` = F2. `revenuePosted 0`: no row dated today.
- The deduction LINE for F2 (its class date) and for the 3 course sessions: SKIPPED / not observable without SQL. QAChatTwo's household is the LINE-linked QA parent, so a real message may have reached 0899990763.


### TEST-123 · run 2 (the owner, 19:15, same body): 🔴 F1, the swept sales were POSTED A SECOND TIME
**The summary:** `autoAttended 0 · sweptPosted 4`.

| Booking | Posted sale after run 1 | Posted sale after run 2 (`GET /bookings/:id/posted-sale`, the CURRENT generation) |
|---|---|---|
| F1 1 HR 22 Oct | 1,390.00 at 12:12:26 UTC | **1,390.00 at 12:15:50 UTC**, a new generation |
| F3 priced Other 23 Oct | 300.00 at 12:12:26 | **300.00 at 12:15:50** |
| P4 1 HR 24 Oct | 1,390.00 at 12:12:25 | **1,390.00 at 12:15:50** |
| QA 1 HR 23 Oct ("QA Link 083 H") | 1,390.00 at 12:12:26 | **1,390.00 at 12:15:50** |

- **How I read it:**
  - `posted-sale` reads the booking's **current generation**, counted from its `rev:` movements in the ledger (`lib/sale-post.ts:320`, `postedGeneration`).
  - A posted time of 12:15:50 (run 2) means **a second `rev:` movement now exists for each booking**: the revenue is in the books **twice**.
- **Not doubled:** attendance (`autoAttended 0`) and the voucher (still **1 / 5 h**).
- **Consequences (facts, not a cause):**
  - each further run on a date whose 7-day window still holds these rows posts them **again**;
  - **sid's own 17:30 job tomorrow (26 Oct, window 19–26 Oct)** would make it 3 for these 4, and the same for any other attended 1 HR / 1st Trial / priced Other of the last 7 days;
  - **if `304212d` reaches uat**, real revenue would multiply the same way, every day.
- **Where to look (for Sober; not confirmed):** `jobs.service.ts` ≈ 218–229. The key is `revKey(b.id, await revGeneration(b.id))`, and `revGeneration` returns the NEXT generation. So an already-posted booking gets a fresh key on every run instead of a duplicate. The sweep has no "already posted" check (the comment at ≈ 159 says so on purpose). That is Sober's to confirm.
- **`sweptPosted` counts** `res.ok`, and a skipped duplicate also returns `ok: true`, so the counter alone can't tell a duplicate from a new post. The by-value read above can.

**What I did NOT do:** nothing reversed and nothing written. Reversing sales is a money act, so it's Porter's / the owner's call.


---
## TEST-123 RE-RUN (back `d33e249`): fresh fixtures READY on sid (2026-10-25 19:39 Bangkok). Run date for the job = **2026-10-25**
- **The brief:** Porter's ▶️ GO TEST-123 RE-RUN in `inbox/QA.md`.
- **Pass:**
  - run 1 posts each eligible row once;
  - **run 2 gives `autoAttended 0` AND `sweptPosted 0`**;
  - no booking gains a 2nd `rev:` sale;
  - the 4 old duplicates do NOT gain a 3rd.
- **The fresh QA fixtures** (teacher qatt75b, QA kid QAChatTwo, QA voucher `48d2c786` now at 1 / 5 h). Ids are in my scratchpad `t123r-ids.json`.

| Key | Date | Type | Status now | Expected after run 1 | After run 2 |
|---|---|---|---|---|---|
| F1 `bc35c21f` | 22 Oct 11:00 | 1 HR | CONFIRMED | **ATTENDED**, **posted once** | unchanged; same posted time |
| F2 `a7f6a37b` | 20 Oct 10:00 | VOUCHER | CONFIRMED | **ATTENDED**, voucher **2 / 5 h**; not posted | unchanged (2 h) |
| F3 `2a6f8784` | 23 Oct 10:00 | priced OTHER (300.00) | CONFIRMED | **ATTENDED**, **posted once** | unchanged |
| N1 `12b1ddf3` | 17 Oct 10:00 (8 days) | 1 HR | CONFIRMED | **untouched** | untouched |
| N3 `1200cd50` | 21 Oct 13:00 | 1 HR | PENDING | **untouched** | untouched |
| N4 `724c0ad5` | 24 Oct 11:00 | 1 HR | ATTENDED (by staff) | stays ATTENDED; **posted once** by the sweep | still once |
| OLD F1 `f6688ea2` · F3 `ff9ea3fd` · P4 `9a4a5feb` · "QA Link 083 H" `a37c8c46` | 22–24 Oct | already posted (twice, round 1) | ATTENDED | **no new sale** (the "already posted" case) | still none |

- **Before snapshot (12:39:31 UTC):**
  - the 6 fresh rows: posted-sale = none;
  - OLD F1 1,390.00, OLD F3 300.00, OLD P4 1,390.00: each still at **12:15:50 UTC** (round 1's 2nd generation);
  - "QA Link 083 H" is read in the read-back (same check).
- **Not buildable from the admin side, again:** posted → undone → re-attended. sid refused the undo of a staff attendance again (`UNDO_STAFF_ATTEND`, 409, on N4); undo is only for a parent's own check-in. That case stays with Sober's unit test.
- **Expected run 1 summary:** `sweptPosted` = **2** (F1, F3) + **1** (N4) = 3, plus any other attended-but-unposted row of 19–25 Oct I don't own. `autoAttended` ≥ 3 (F1, F2, F3). Any extra I'll name in the read-back.

### For the owner (via Porter): run the day-end job **twice**, a few minutes apart, ON THE BOX
- Same as round 1: the root route `/internal/jobs/end-of-day` on the back's local port, the secret from sid's env.
- **Body `{"date":"2026-10-25"}`** (it's before midnight; keep this date even if it runs after).
- Then say "ran twice", with each run's JSON summary if possible (no secret).
- I read back by value, then clean up **before tomorrow's 17:30 job**.


### TEST-123 RE-RUN · runs 1 + 2 (the owner, 19:48 and 19:50, `{"date":"2026-10-25"}`): ✅ PASS by value
- **Run 1:** `autoAttended 3 · coursesAutoAttended 0 · vouchersAutoAttended 1 · revenuePosted 0 · sweptPosted 3`.
- **Run 2:** all counters 0.
- **Read back:** each booking's CURRENT posted generation (`GET /bookings/:id/posted-sale`), checked after run 2.

| Row | After both runs | Posted (current generation) | Verdict |
|---|---|---|---|
| F1 1 HR 22 Oct | ATTENDED (`end-of-day`) | 1,390.00 at **12:48:34 UTC** (run 1); none at 12:50 | ✅ once |
| F2 VOUCHER 20 Oct | ATTENDED (`end-of-day`) | none (vouchers aren't posted); voucher **2 / 5 h** (was 1) | ✅ one cut |
| F3 priced Other 23 Oct | ATTENDED (`end-of-day`) | 300.00 at **12:48:34** | ✅ once |
| N1 1 HR 17 Oct (8 days) | CONFIRMED | none | ✅ untouched |
| N3 1 HR 21 Oct PENDING | PENDING | none | ✅ untouched |
| N4 1 HR 24 Oct (staff-attended) | ATTENDED (`admin`) | 1,390.00 at **12:48:34** | ✅ once |
| OLD F1 / F3 / P4 / "QA Link 083 H" (already posted) | ATTENDED | all still at **12:15:50 UTC** (round 1's 2nd generation) | ✅ no 3rd |

- **Counters match the values:**
  - `sweptPosted 3` = F1 + F3 + N4;
  - `autoAttended 3` = F1 + F2 + F3;
  - `vouchersAutoAttended 1` = F2.
- **No other row was touched:** I checked every other ATTENDED 1 HR / 1st Trial / Other row dated 17–25 Oct, and none has a posting at or after 12:45 UTC.
- **So the fix holds:** a booking whose revenue is live is no longer posted again, either on run 2 or for the 4 rows that already had a sale.
- **Not covered (stays with Sober's unit test):** posted → undone → re-attended. sid refuses a staff undo (`UNDO_STAFF_ATTEND`).
- **Left over from round 1:** the 4 old duplicates still have **2 `rev:` sales each** (2,780.00 + 600.00 + 2,780.00 + 2,780.00 in total, of which 4,470.00 is the extra copies). Reversing them is a money act, so it's yours / the owner's call.

**Cleanup:**
- **Cancelled:** N1 `12b1ddf3` and N3 `1200cd50` (never posted), reason `ADMIN_ERROR` with the note "QA TEST-123 re-run fixture cleanup". Both returned 200.
- **Left as they are:** F1, F2, F3 and N4. Cancelling an attended, posted row would reverse a sale (a money act), and the voucher hour is a cut.
- They are safe for tomorrow's 17:30 job: they're already ATTENDED and posted, so the fixed sweep should skip them. That makes **tomorrow's real job a free extra check**. If you want it, I'll read these 4 again (plus the old 4) after 17:30.


> **⛔ CORRECTION (Tanya, 2026-10-25 20:3x, from TEST-124):** in round 1 / run 1 above, "QA Link 083 H" `a37c8c46` was **NOT** "never posted". It was auto-attended by a day-end job (check-in source `end-of-day`) and was most likely posted by sid's own 23 Oct run. Run 1's 12:12 post was therefore already a duplicate (TASK-750's dry run shows 4 live sales on it). I had not snapshotted it before the run.
