# TEST-152: sid — F5 (TASK-946, a cancelled/left make-up never regrows on the same date) + F2 (TASK-947, a PENDING course sends the parent nothing until Confirm Course)
**Status:** behaviour ✅ TEST_PASSED on (1) and (3) · the **messages** half of (1)/(2)/(3) 🟡 NOT_TESTED until one outbox read (SQL below) · 1 observation.
**Source:** Porter's 2026-11-11 00:23 line in `inbox/QA.md` (desk stop lifted for this round only).
**Build:** sid SB as the owner just deployed it (TASK-946 + 947); the host shows no version.
**Instrument:** the API the screens call, inside the sid card `som.json` (no password). **Nobody can be messaged:** a new child **"Tanya-QA F5F2 kid"** (`TanyaF5F2`) under my QA parent `030dea39` (**no LINE**) and QA coach `7829e67f` (**not on LINE**) — `enqueueLine` writes such messages as **SKIPPED** outbox rows (`lib/line.ts:51`), which is exactly what the outbox read will show.
**Course:** `70742d7e-dffb-4617-bd73-f9930ac0e0cd` — 4 × Private SURFSKATE, Mondays 18:00 from 16 Nov, **left PENDING** until step (2). Run 2026-11-10 17:25:51 → 17:26:17 UTC (00:25 Bangkok 11 Nov).

## The steps (plan after each, `M` = make-up)
| # | Step | Reply | Plan after | Expiry |
|---|---|---|---|---|
| 0 | start | — | 16 · 23 · 30 Nov · 7 Dec all PENDING | 14 Dec |
| 1a | **leave 16 Nov** (course PENDING) | 200 | 16 Nov SICK_LEAVE · **14 Dec CONFIRMED M** | **21 Dec** |
| 1b | **undo** that leave | 200 | 16 Nov **CONFIRMED** (see O-152-1) · 14 Dec M **CANCELLED** | 21 Dec |
| 1c | leave 16 Nov again | 200 | 16 Nov SICK_LEAVE · a new **14 Dec CONFIRMED M** | 28 Dec |
| 1d | **cancel 23 Nov** (customer) | 200 | 23 Nov CANCELLED · **21 Dec CONFIRMED M** | 28 Dec |
| 1e | **move 30 Nov → Tue 1 Dec** | 200 | 1 Dec PENDING | 28 Dec |
| 2 | **Confirm Course** | 200 | 1 Dec, 7 Dec → **CONFIRMED** | 28 Dec |
| 3a | **leave on the make-up 21 Dec** | 200 | 21 Dec SICK_LEAVE M · **28 Dec CONFIRMED M** — the **next** week, **not 21 Dec** | **4 Jan (+1 week)** |
| 3b | **cancel the make-up 28 Dec, school-issue ticked** | 200 | 28 Dec CANCELLED M /SCHOOL_ISSUE · **4 Jan CONFIRMED M** — **not 28 Dec** | **11 Jan (+1 week)** |

**Verdicts:**
- **(1) behaviour ✅:** on a PENDING course a leave creates the make-up (and moves the expiry), undo removes it, cancel and move work.
- **(3) ✅ (TASK-946):** a leave or a school-issue cancel on a make-up moves it to the **next free week, never the same date**, and the course grows **+1 week** each time. (TEST-140's AC-1 defect, the same date regrowing, no longer happens.)
- **(1) messages / (2) / (3) family notice: NOT_TESTED** — there is no API to read the outbox, and I don't run SQL. One read settles all three (below).
- **Daily-reminder path: NOT_TESTED** (a scheduled job; can't be triggered from the API).

## Observation O-152-1 (not judged)
**Undoing a leave on a PENDING course restored the class as CONFIRMED, not PENDING** (1b: 16 Nov came back CONFIRMED while 23/30 Nov and 7 Dec stayed PENDING). If a CONFIRMED class on a still-PENDING course is the trigger for parent messages, this undo could be a path that bypasses F2. For Sector.

## DATA REQUEST — one read-only SELECT on sid (for an SA seat), bare SQL
```
SELECT created_at, recipient_type, status, error, booking_id, left(payload::text, 400) AS payload
FROM notification_outbox
WHERE created_at BETWEEN '2026-11-10T17:25:50Z' AND '2026-11-10T17:26:20Z'
ORDER BY created_at;
```
**Expected** (all rows SKIPPED, nobody is on LINE):
- **Before 17:26:08.8 (steps 1a–1e):** `teacher` rows for the coach only — **no `parent` row**. (F2)
- **Between 17:26:08.8 and 17:26:10.8 (Confirm Course):** **exactly one `parent` row**, a course-schedule message whose payload includes **«ขยายคาบ» / "Extended"** for the make-ups. (F2)
- **After 17:26:10.8 (steps 3a, 3b):** a `parent` **family notice** for the moved make-up (3b with the school-issue tick). (F5)
- Other teams' rows in the same 30 s window, if any, have other booking ids; my course's booking ids are below.

**This course's booking ids:** see `ids` in the run (9 rows), all on course `70742d7e…` (`booking.course_id`), so `… WHERE booking_id IN (SELECT id FROM bookings WHERE course_id = '70742d7e-dffb-4617-bd73-f9930ac0e0cd')` narrows it.

## Test data created (sid)
Child `TanyaF5F2` ("Tanya-QA F5F2 kid") under QA parent `030dea39` (no LINE); course `70742d7e…` (sold → its sale / C1 lines stay), now CONFIRMED with the rows above; SKIPPED outbox rows. **Left as is** until the outbox read is done (then I cancel the course).
**uat:** not touched.

## DATA REQUEST answered: outbox read (Sector, SA, 2026-11-11; sid dev DB, host .206 checked, READ ONLY tx, this course's rows only)
21 rows in the window, all SKIPPED (no LINE). By kind, with no payload text copied:
| UTC | step | rows (recipient · kind) | verdict |
|---|---|---|---|
| 17:25:52.5 | 1a leave (pending) | teacher leave_notice · admin leave_notice · teacher booking_confirmed | ✅ **no parent row** |
| **17:25:54.8** | **1b undo** | teacher class_cancelled_teacher · teacher class_on_again_teacher · **parent makeup_cancelled_parent · parent class_on_again_parent** | ❌ **2 parent rows while the course is PENDING** (see O-152-1 ruling) |
| 17:25:58.6 | 1c leave again | teacher booking_confirmed · admin + teacher leave_notice | ✅ no parent row |
| 17:26:02.4 | 1d cancel (customer) | teacher booking_confirmed | ✅ no parent row |
| (1e move) | — | none | ✅ |
| **17:26:08.1** | **2 Confirm Course** | **parent course_confirmed ×1** (+ teacher copy), `makeupDates ["2026-12-14","2026-12-21"]` | ✅ **exactly one parent row, with the make-up dates («ขยายคาบ» line)** |
| 17:26:11.5 | 3a leave on the make-up | teacher + **parent booking_confirmed** (the new make-up) · admin + teacher leave_notice | ✅ the family is told (course now confirmed) |
| 17:26:15.0 | 3b cancel the make-up, school issue | teacher + **parent booking_confirmed** · teacher class_cancelled_teacher · **parent makeup_cancelled_parent** | ✅ family notice (F5) |

**O-152-1 ruling (Sector, [SA-decided]): a DEFECT, and it is the cause of the only leak above.**
- `undo.service.ts:147` always restores an undone leave as `CONFIRMED`. That's older code (TASK-540 era), not TASK-947, but on a PENDING course it makes the course look confirmed. So the undo's own family notices (makeup_cancelled_parent, class_on_again_parent) pass the TASK-947 gate.
- Correct behaviour: **an undo restores the class to PENDING while the course has no confirmed class of its own** (CONFIRMED when it does, as today).
- Fixed inside TASK-947 as a rework (Brew). After the redeploy, re-run step 1b: 16 Nov comes back PENDING, and **no parent row**.
- **Verdict now:** F5 (3a/3b) ✅. F2 ✅ **except the undo path** (1b) ❌. The daily reminder stays NOT_TESTED (a scheduled job). After-deploy `db:verify` on sid = Journal 77 · ledger 125 · witnesses 77 ✅.

## Step 1b re-run after the O-152-1 fix (Porter 00:48; SB redeployed), 2026-11-10 17:49 UTC: ✅ TEST_PASSED (behaviour) · outbox read pending
Same child (TanyaF5F2, QA parent no LINE) and coach (7829e67f, no LINE).
- **A — a NEW PENDING course** `341c9765-afa6-4101-bace-cdd4e9c4ada2` (Tuesdays 19:00 from 17 Nov, 18:00 was taken): leave 17 Nov → 17 Nov SICK_LEAVE + make-up 15 Dec CONFIRMED M (17:49:26.6Z); **undo** → **17 Nov PENDING** ✓ (was CONFIRMED before the fix), the 15 Dec make-up CANCELLED (17:49:28.5Z). The other sessions stay PENDING.
- **B — control, the already-confirmed course** `70742d7e…`: leave 7 Dec → **undo → 7 Dec CONFIRMED** ✓ (unchanged behaviour for a confirmed course); its make-up 11 Jan CANCELLED.
- **For Sector's outbox read:** course A's rows between **17:49:24Z and 17:49:29Z** — expected **no `parent` row** (teacher / admin rows only). Course B's undo (17:49:32–34Z) may notify the parent (that course is confirmed) — expected.
**Test data:** course A `341c9765…` (sold, PENDING; left until the read, then cancelled with the others).

## Re-run 1b after the O-152-1 fix: outbox read (Sector, 2026-11-11; sid, host .206, READ ONLY, course `341c9765…` only)
| UTC (2026-11-10) | rows | verdict |
|---|---|---|
| 17:49:23.7 (leave) | teacher booking_confirmed · admin + teacher leave_notice | ✅ no parent row |
| 17:49:25.8 (**undo**) | teacher class_cancelled_teacher · teacher class_on_again_teacher | ✅ **no parent row** (the 2 that leaked before are gone) |
- **5 rows total, 0 parent rows.**
- Sessions after the undo: 17 / 24 Nov, 1 / 8 Dec **PENDING**, and the grown make-up 15 Dec CANCELLED: the restored class is back **PENDING**, as the fix intends.
- **F2 verdict: PASS** (with steps 2 and 3 above). The daily-reminder path stays NOT_TESTED (a scheduled job).
