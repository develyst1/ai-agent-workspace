# TEST-124: TASK-750 rehearsal on sid. The owner runs the duplicate-sale reversal script; Tanya gates it

- **QA:** Tanya
- **Date:** 2026-10-25
- **Brief:** Porter's ▶️ TASK-750 rehearsal entry in `inbox/QA.md`
- **Build:** back `5382fe4`
- **Run doc:** `smart-scheduler-back/docs/RUN-reverse-duplicate-sales.md`
- **Steps:** dry run → `--commit` → `--commit` again, which must write 0.
- **I run nothing that writes.** The owner runs the script on the box. I read sid through the admin API (read only) and send the ledger checks as bare SQL.

## Gate 1: the dry run must list exactly these 4 bookings, 4,470.00 in total (anything else ⇒ STOP)
These are TEST-123 round 1's duplicates: posted at 12:12 UTC, then again at 12:15:50 UTC.

| Booking | Date | Type | Generation to reverse | Amount |
|---|---|---|---|---|
| `f6688ea2` | 2026-10-22 | SINGLE_SESSION | 0 (`rev:<id>`) | 1,390.00 |
| `ff9ea3fd` | 2026-10-23 | OTHER | 0 | 300.00 |
| `9a4a5feb` | 2026-10-24 | SINGLE_SESSION | 0 | 1,390.00 |
| `a37c8c46` | 2026-10-23 | SINGLE_SESSION | 0 | 1,390.00 |
| **4 bookings** | | | | **4,470.00** |

- **STOP if:**
  - any other booking id appears, including TEST-123 re-run's F1 `bc35c21f`, F3 `2a6f8784` or N4 `724c0ad5` (each posted once);
  - a generation other than 0 appears;
  - the amounts or the total differ.

## Before snapshot (20:19 Bangkok, back 5382fe4, nothing run yet)
- **The 4 above:** `posted-sale` (the current generation) = generation 1 at **12:15:50 UTC**: 1,390.00 · 300.00 · 1,390.00 · 1,390.00.
- **The re-run fixtures:**
  - F1 `bc35c21f` 1,390.00, F3 `2a6f8784` 300.00 and N4 `724c0ad5` 1,390.00, each posted once at 12:48:34;
  - F2 `a7f6a37b` voucher, not posted;
  - N1 and N3: CANCELLED.
- **The whole booking set 2026-09-06 … 2026-10-26: 1,282 rows.**
  - ATTENDED 542 · CANCELLED 434 · SICK_LEAVE 145 · PENDING 92 · CONFIRMED 47 · EXTENDED 17 · PAUSED 4 · NO_SHOW 1.
  - Each row's status, check-in source and date is saved for an exact diff afterwards.
- **Vouchers:** 29, used hours saved. QA voucher `48d2c786` = 2 / 5 h.

## Gate 2: after the 1st `--commit`
- The summary shows **4 written, 4,470.00**.
- **By API value:** each of the 4 still shows `posted-sale` = **12:15:50** (generation 1, the HIGHEST, stays live).
  - If it shows 12:12 or none, the wrong generation was reversed ⇒ 🔴.
- **Nothing else changed:** the exact diff of all 1,282 bookings (status, check-in source) and all 29 vouchers' hours = 0 differences.

## Gate 3: the 2nd `--commit` writes **0**

## Gate 4: the ledger, by SQL (owner, sid, read only)
**SQL 1** is Silver's duplicate query (`inbox/PM.md` "🔴 URGENT reply" §1), run on **sid**. It must return **0 rows**.

**SQL A: the 4 bookings' ledger.** Expected for each: 2 `rev:`, 1 `rev-undo:`, the `rev-undo:` on generation 0 (the key without `#`), and its value = minus the sale.
```sql
SELECT ref_id, idempotency_key, value_minor / 100.0 AS thb,
       to_char(created_at AT TIME ZONE 'Asia/Bangkok', 'MM-DD HH24:MI:SS') AS at_bkk
FROM bo.movement
WHERE ref_id IN ('f6688ea2-81fd-412b-9d6a-d0c8243451e6', 'ff9ea3fd-ba8d-40aa-919f-a995cd783c6c',
                 '9a4a5feb-4d36-43c8-a197-093160cc896e', 'a37c8c46-6d6e-47b1-9d01-171a7c9d6c56')
  AND (idempotency_key LIKE 'rev:%' OR idempotency_key LIKE 'rev-undo:%' OR idempotency_key LIKE 'discount:%')
ORDER BY ref_id, created_at;
```
**SQL B: no LINE messages from the script.** Expected: only rows explained by something else (normally 0).
```sql
SELECT recipient_type, status, payload->>'kind' AS kind, count(*)
FROM notification_outbox
WHERE created_at >= '2026-10-25 13:20:00+00'
GROUP BY 1, 2, 3
ORDER BY 4 DESC;
```

## Results
(filled in as each output arrives)

### Dry run (owner, from his local back checkout, sid's DB): 🛑 MISMATCH ⇒ STOP, no `--commit`
- **The output:** 4 bookings, **7,250.00**.
  - The same 4 ids as my gate.
  - `f6688ea2`, `ff9ea3fd` and `9a4a5feb`: generation 0 only, the amounts as expected ✅.
  - **`a37c8c46`: generations 0, 1 and 2, 4,170.00** (= 3 × 1,390.00, no discount). I expected generation 0 only, 1,390.00.
- **What the API shows for `a37c8c46` (read only, 20:3x):**
  - a **1 HR dated 23 Oct 15:00**, note "QA TEST-083 669";
  - **check-in source `end-of-day`, actor none**: it was **auto-attended by a day-end job**, not by staff;
  - the live sale (`posted-sale`) is 1,390.00 at **12:15:50 UTC**, the highest generation; no discount;
  - not undoable (`UNDO_NOT_UNDOABLE`), and it has no parent check-in, so **no undo → re-attend cycle can explain the extra generations.**
- **My reading (facts first, then a likely story that needs the ledger):**
  - **Fact:** the job auto-attended it. Only a run **for date 23 Oct** could do that on the old build, and the old build posts that date's rows when it does. So **generation 0 was most likely posted by sid's 17:30 job on 23 Oct.**
  - **Fact:** my two TEST-123 round-1 runs (12:12 and 12:15:50 UTC, build `304212d`, which had no "already posted" check) each posted it again ⇒ at least 3 sales.
  - **The 4th sale** must be one more run that touched it:
    - a second run for 23 Oct on the old build (a manual re-run, or the scheduled task firing twice);
    - or sid's 17:30 job on 25 Oct, if `304212d` was already on sid by then. It was committed at 18:53, so that's unlikely.
    - The `job_runs` read below decides it.
  - **So the script is most likely counting right:** 4 live sales, reverse generations 0, 1 and 2, keep generation 3 (the 12:15:50 one, the highest) live. That's exactly the TASK-750 rule.
- **⛔ Correction to my TEST-123 report (round 1, run 1):** I wrote that "QA Link 083 H" was *"already ATTENDED but never posted, so posted at 12:12:26. Right by the rule."* **That was wrong.** It was already posted (most likely on 23 Oct), so run 1's post at 12:12 was **itself a duplicate**, not a first post. I didn't read its posted-sale before the run; I inferred "never posted" from the sweep's count. **Lesson:** snapshot every row in the window by value before a run, not only my own fixtures.
  - **The impact on uat is unchanged:** that's what the 18 Oct SQL already measured.
- **To clear the gate, 2 bare read-only SQLs (owner, on sid):**

```sql
SELECT idempotency_key, value_minor / 100.0 AS thb, reason,
       to_char(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD HH24:MI:SS') AS at_bkk
FROM bo.movement
WHERE ref_id = 'a37c8c46-6d6e-47b1-9d01-171a7c9d6c56'
ORDER BY created_at;
```
```sql
SELECT run_date, status,
       to_char(started_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD HH24:MI:SS') AS started_bkk,
       summary
FROM job_runs
WHERE job = 'end-of-day' AND run_date BETWEEN '2026-10-23' AND '2026-10-25'
ORDER BY started_at;
```

- **Pass to go on to `--commit`:**
  - SQL (a) shows **4 `rev:`** keys for `a37c8c46` (`rev:<id>`, `#1`, `#2`, `#3`), each 1,390.00, **no `rev-undo:`**, no `discount:`, and the last one at 12:15:50 UTC;
  - SQL (b) has a run for each of those sales.
  - Then **7,250.00 is the right total**: 4,470.00 + 2 × 1,390.00. The gate becomes: the 4 ids, these generations, 7,250.00.
  - If (a) shows a `rev-undo:` the script ignored, or fewer than 4 `rev:` keys ⇒ the script miscounts ⇒ Silver.

### Silver's read + DR-5 (the 2 SQLs that settle it): I have no SQL access, so the owner runs them on **sid**, read only
- **Silver's read** (`inbox/PM.md` "Re TASK-750 sid MISMATCH"): the planner reverses every live generation except the highest. "Generations 0, 1, 2" therefore means **4 `rev:` sales and 0 reversals**, and 7,250 − 4,470 = 2 × 1,390 exactly. **The same conclusion as my API read above.**
- **Where we differ (the SQL decides):** the source of the 4th sale.
  - **Silver:** a 3rd run on the 749 build.
  - **Mine:** a 2nd run on the old build for 23 Oct.
  - **The constraint by value:** the live (highest) sale is still at **12:15:50 UTC = 19:15 Bangkok**, my round-1 run 2. So any other run must have happened **before 19:12 Bangkok**: between `304212d` reaching sid (after 18:53) and 19:12, or on 23 Oct itself.
- **The env:** the dry run listed exactly sid's QA booking ids, so **the owner's local env pointed at sid this time** ✅.
- **DR-5, replacing my 2 SQLs above** (Silver's cover `job_runs` since 10-18):

```sql
SELECT idempotency_key, value_minor / 100.0 AS thb,
       to_char(created_at AT TIME ZONE 'Asia/Bangkok', 'MM-DD HH24:MI') AS at_bkk
FROM bo.movement WHERE ref_id LIKE 'a37c8c46%' ORDER BY created_at;
```
```sql
SELECT run_date, to_char(started_at AT TIME ZONE 'Asia/Bangkok', 'MM-DD HH24:MI') AS started_bkk,
       summary->>'revenuePosted' AS revenue_posted, summary->>'sweptPosted' AS swept_posted
FROM job_runs WHERE job = 'end-of-day' AND run_date >= '2026-10-18' ORDER BY started_at;
```

- **Pass:**
  - query 1 shows **4 `rev:` keys** (`rev:a37c8c46…`, `#1`, `#2`, `#3`), each 1,390.00, **no `rev-undo:` / `discount:`**, the last at **10-25 19:15**;
  - each `rev:` time matches an end-of-day run in query 2 (expected: one on 10-23 ~17:30; 10-25 19:12 and 19:15; plus one more before 19:12).
  - ⇒ the dry run's **7,250.00 is right**, and the new gate is the same 4 ids / these generations / 7,250.00.
- **Fail:** a `rev-undo:` the planner ignored, fewer than 4 `rev:` keys, a different amount, or a `rev:` with no run behind it ⇒ Silver.
- **Still 🛑 no `--commit`:** Silver's reopen comes first (the run doc + the target-DB line), then a new "ขึ้น git" and a fresh sid dry run, which I gate again with the same before/after checks.

### DR-5 answered + the commits (owner, sid)
- **Dry run #2** (local `f4aeb39`, `--env-file=.env.sid`):
  - **target line `smart_scheduler @ 172.17.172.206/32`**: this is **sid's host**. For the uat run, **the host** is what tells sid from uat (the DB name is probably the same on both);
  - the same 4 bookings, 7,250.00.
- **DR-5 SQL 1, `a37c8c46` ledger:** 4 rows, all 1,390.00, no `rev-undo:` / `discount:`.
  - `rev:` 10-23 18:30 · `#1` 10-25 18:30 · `#2` 10-25 19:12 · `#3` 10-25 19:15.
  - **Meets the pass** (4 generations, last at 19:15, one more before 19:12) ⇒ **7,250.00 is right. The script counted correctly.**
  - **The 4th sale is sid's own 10-25 18:30 day-end:** it swept 10-23 again, so the sweep build was already on sid at 18:30. Neither my guess nor Silver's was exactly right; the ledger settles it.
- ⚪ **sid's schedule (record only, not chased):** sid's own day-end posted at **10-23 18:30 and 10-25 18:30**, so sid's task looks like it runs at **18:30**, not 17:30 (uat's is 17:30 by the customer's wish).
  - ⇒ My Monday re-read of the 8 TEST-123 rows goes **after 18:30**, not 17:30.
- **`--commit` #1:** the same target; **"✓ กลับรายการแล้ว 6 รายการ"** = 1 + 3 + 1 + 1 generations ✅ (the plan exactly).
- **`--commit` #2:** **"กลับรายการแล้ว 0 รายการ"**, 0 bookings, 0.00 ✅ (idempotent).

### After-checks by API (sid, read only, 21:14 Bangkok)
- **The highest generation stays live** (`GET /bookings/:id/posted-sale`; if the wrong generation had been reversed, this would show an older time or none):
  - each of the 4 still shows its 12:15:50 UTC sale (= `#1` / `#3`): `f6688ea2` 1,390.00 · `ff9ea3fd` 300.00 · `9a4a5feb` 1,390.00 · `a37c8c46` 1,390.00 ✅;
  - the TEST-123 re-run rows are unchanged too (`bc35c21f` / `2a6f8784` / `724c0ad5` still at 12:48:34; F2 not posted).
  - **That whole read-back is byte-identical to the 20:19 before-snapshot.**
- **Nothing else changed:**
  - **all 1,282 bookings** dated 09-06 … 10-26: status + check-in source + date, **0 differences**;
  - **all 29 vouchers'** used hours, **0 differences** (QA voucher still 2 / 5 h);
  - status totals identical (ATTENDED 542 · CANCELLED 434 · …).

### DR-6: the ledger + LINE check (owner, sid, read only; one block)
```sql
-- SQL 1 (Silver's duplicate query, inbox/PM.md "URGENT reply" §1): expect 0 rows
WITH m AS (
  SELECT ref_id, idempotency_key AS k, value_minor, created_at
  FROM bo.movement
  WHERE idempotency_key LIKE 'rev:%' OR idempotency_key LIKE 'rev-undo:%' OR idempotency_key LIKE 'discount:%'
), per AS (
  SELECT b.id, b.date, b.booking_type,
         count(*) FILTER (WHERE m.k LIKE 'rev:%')      AS sales,
         count(*) FILTER (WHERE m.k LIKE 'rev-undo:%') AS reversals
  FROM bookings b JOIN m ON m.ref_id = b.id::text
  WHERE b.date >= '2026-09-06'
  GROUP BY b.id, b.date, b.booking_type
)
SELECT * FROM per WHERE sales - reversals > 1 ORDER BY date, booking_type, id;

-- SQL A: the 4 bookings' ledger
SELECT left(ref_id, 8) AS booking, idempotency_key, value_minor / 100.0 AS thb, reason,
       to_char(created_at AT TIME ZONE 'Asia/Bangkok', 'MM-DD HH24:MI:SS') AS at_bkk
FROM bo.movement
WHERE ref_id IN ('f6688ea2-81fd-412b-9d6a-d0c8243451e6', 'ff9ea3fd-ba8d-40aa-919f-a995cd783c6c',
                 '9a4a5feb-4d36-43c8-a197-093160cc896e', 'a37c8c46-6d6e-47b1-9d01-171a7c9d6c56')
  AND (idempotency_key LIKE 'rev:%' OR idempotency_key LIKE 'rev-undo:%' OR idempotency_key LIKE 'discount:%')
ORDER BY ref_id, created_at;

-- SQL B: the LINE outbox since the rehearsal began (20:20 Bangkok)
SELECT recipient_type, status, payload->>'kind' AS kind, count(*)
FROM notification_outbox
WHERE created_at >= '2026-10-25 13:20:00+00'
GROUP BY 1, 2, 3
ORDER BY 4 DESC;
```

**Expected:**
- **SQL 1:** **0 rows**.
- **SQL A: 16 rows** (3 + 3 + 3 + 7 = 10 `rev:` + 6 `rev-undo:`, no `discount:`):
  - `f6688ea2`: `rev:` +1,390 · `rev:#1` +1,390 · **`rev-undo:` (no `#`) −1,390**, reason "REVERSAL — duplicate day-end re-run";
  - `ff9ea3fd`: the same with 300.00;
  - `9a4a5feb`: the same with 1,390.00;
  - `a37c8c46`: `rev:`, `#1`, `#2`, `#3` at +1,390 each · **`rev-undo:`, `rev-undo:#1`, `rev-undo:#2`** at −1,390 each;
  - **no `rev-undo:…#1` on the first three and no `rev-undo:…#3` on `a37c8c46`**: the highest generation stays live;
  - all 6 reversals stamped at the 1st `--commit`, none later.
- **SQL B:** nothing the script could have made (it writes no outbox). Normally 0 rows; anything else I'll explain row by row.

### Verdict (pending DR-6)
- **✅ PASS on everything I can see:**
  - the dry run matched the ledger;
  - commit #1 wrote exactly the planned 6;
  - commit #2 wrote 0;
  - the highest generation is live on all 4;
  - 0 changes to bookings / attendance / vouchers.
- **It becomes a full PASS for the uat run when DR-6 matches the expected rows above.** Any mismatch ⇒ Silver, no uat.
- **For uat (from this rehearsal):**
  - check the **target host** before `--commit` (sid = 172.17.172.206);
  - run SQL 1 + SQL 2 on uat right before the dry run, and the dry-run total must equal SQL 2's;
  - expect a reversal count = Σ (sales − 1), not the booking count.

### DR-6 answered (owner, sid, via Porter): every row as expected ⇒ ✅ FULL PASS
- **SQL 1 = 0 rows:** no booking dated since 09-06 has more than one live sale on sid.
- **SQL A = 16 rows**, exactly the expected shape:
  - `9a4a5feb` / `f6688ea2` / `ff9ea3fd`: each has `rev:` + `rev:#1` + **one `rev-undo:` (gen 0)**;
  - `a37c8c46`: `rev:` … `#3` + **`rev-undo:` gen 0, `#1`, `#2`**;
  - all 6 reversals at **10-25 21:12:59** (commit #1 only), reason "REVERSAL — duplicate day-end re-run", amounts −1,390.00 / −300.00 (the net; no discount on these);
  - **the highest generation has no reversal on all 4**, matching the API read (12:15:50 still live).
- **SQL B = 0 rows:** no LINE / outbox row since 20:20. The script sent nothing.

## ✅ VERDICT: TASK-750 PASS on sid (back `5382fe4`, script from the owner's local `f4aeb39`, target `smart_scheduler @ 172.17.172.206/32`)
- **Dry run = the ledger:** 4 bookings, 6 generations, 7,250.00. The first gate's 4,470.00 was wrong because of my own TEST-123 misread of `a37c8c46` (corrected above).
- **Commit #1** wrote exactly the planned 6 reversals; **commit #2** wrote 0.
- The highest generation stays live, so a later attendance Undo still reverses the right sale.
- **0 side effects:** 0 changes in 1,282 bookings and 29 vouchers; 0 outbox rows.
- **For the uat run** (the owner's; not mine to run or watch beyond reading):
  1. check the **target host** line (it must NOT be sid's 172.17.172.206);
  2. run SQL 1 + SQL 2 on uat right before the dry run;
  3. the dry run must list exactly what SQL 1 lists (expected 13 bookings of 10-18), and its total must equal SQL 2's (≈ 17,751.00);
  4. the reversal count = Σ (sales − 1);
  5. after it: SQL 1 = 0 rows, and a 2nd `--commit` = 0.
