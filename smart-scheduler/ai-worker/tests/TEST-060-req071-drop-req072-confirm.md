# TEST-060: REQ-071 Drop/Pause course + REQ-072 Confirm whole course
- Source REQ: REQ-071, REQ-072 (parts 1–2)
- Status: read-only halves TEST_PASSED (sid); state-changing halves owner-pending
- Environments: dev-server (`sid`)
- Tested: 2026-08-28 by Tanya

## Constraint (corrected)
QA **is** authorised to write on `sid` (board 154-159, คุณฟีน 2026-08-04) — and it works: Tanya created a QA fixture
course (HTTP 201). The earlier "can't write" was wrong. Caveat: the session's tool-level guard **intermittently** blocked
follow-up writes (a create passed; a confirm + drop/resume batch were refused), so some state changes remain owner-run
until the guard is cleared.

## ✅ DEFECT (was 🔴) — stale Paused chip count — FIXED (TASK-205), verified
Found: FE **Paused chip = "(0)"** while API showed **DROPPED = 1**; clicking revealed the course. Root cause (Fern's
trace): a BE projection hand-copied fields into `countByStatus` and **omitted `droppedAt`**, so DROPPED was structurally
0 — not a refresh problem. Fixed by TASK-205 (projection deleted; `endedAt`/`droppedAt` required on the type → next
lossy copy is a compile error; + an "every bucket = its rows" invariant test). **Verified fixed:** Paused chip now **(1)**
= API DROPPED 1; FE chips **sum 19 = API total 19**; each chip's number equals its rows.

## Footprint — declared and RETIRED
Created `student QA-req071-fixture` + one course (`d2a83a1b…`) on `sid` and put it through create→confirm→drop→resume→
SLOT_TAKEN, then **retired it: cancelled with ADMIN_ERROR** (→ CANCELLED, out of the active view). The slot-steal
single-session booking was also cancelled. Residual: the `QA-req071-fixture` **student** only (no student delete).

## REQ-071 — Drop/Pause course
| # | Case | Result |
|---|------|--------|
| 1 | Five-status filter (Active·Paused·Completed·Expired·Cancelled), counts sum to total | **PASS** — Active(6)·Paused(0)·Completed(0)·Expired(0)·Cancelled(12) = 18 = `GET /courses` total 18 |
| 2 | Button label not a raw key (`endCourse.drop`), both dictionaries | **PASS** — "Pause course"(EN) / "พักคอร์ส"(TH) rendered; no raw key |
| 3 | Pause → พักคอร์ส badge, sessions leave schedule, NOT expired/cancelled | **PASS** (read-only, via the dropped Anya·Freeskate fixture) — status **DROPPED** (not EXPIRED/cancelled), droppedAt set, 6 remaining sessions **CANCELLED**, badge พักคอร์ส |
| 4 | Resume → sessions return on their slot | **PASS** (write) — DROPPED→ACTIVE, new expiry, `createdSessions:4` on their slots |
| 5 | 🎯 Pause → slot taken → resume must refuse SLOT_TAKEN (no double-book) | **PASS** (write) — drop → booked the slot → resume **409 SLOT_TAKEN** (translated), no double-book |
| 6 | A dropped course still accepts writes (unlike an ended one) | **NUANCE → Porter** — lifecycle writes work (resume/cancel); a **session** write (extra-session) is refused **409 `COURSE_DROPPED`** ("resume first") — distinct from `COURSE_ENDED`. "dropped ≠ ended" holds, but it doesn't literally accept a session-write; is resume-first the intent? |

## REQ-072 — Confirm whole course (parts 1–2)
| # | Case | Result |
|---|------|--------|
| 7 | Confirm button appears with pending count; disappears at 0 pending; proper label | **PASS** — 3-pending course shows "Confirm whole course (3)"; a 0-pending course shows none |
| 8 | Confirm → every รอยืนยัน→ยืนยันแล้ว; button disappears | **PASS** (write) — confirmed 4 / skipped 0; all 4 PENDING→CONFIRMED |
| 9 | notification_outbox = exactly 1 row per course (not per session) | **PARTIAL** — confirm response carried **ONE** notification object (one per course), skipped as my QA student has no LINE link → no row written. Full end-to-end (a LINE-linked recipient → exactly 1 row) = DATA REQUEST |
| 10 | Skip reasons render (raw/untranslated reason = finding) | **PASS** — reason "ผู้รับยังไม่ผูก LINE userId" (proper Thai), not a raw key |
| 11 | `used_sessions` must NOT change at confirm time | **PASS** (write) — used_sessions 0→0 across confirm |

## Note (process)
On case 7 I first opened a 0-pending course (no Confirm button) and re-verified on the real 3-pending course before
concluding — did not mis-report a missing button.

## REQ-072 whole (parts 2/3A/3B — after the scope grew)
- **Part 2 (leave DATES, not a count):** ✅ no `plannedLeaves` count in the confirm response; the service builds
  `plannedLeaveDates` (SICK_LEAVE dates, sorted, `scheduler.service.ts:2869`). The *rendered* dated message → owner (send-only).
- **Part 3A (parent on confirm):** ✅ per-person structure — response tracks a **teacher** notification + **parent**
  (`parentLinked`/`parentNotified`), i.e. one-per-person not per-booking. Both skipped (QA fixtures unlinked).
- **Send path (outbox = 1 row per linked person) + the dated message content:** owner-only — `PATCH /parents/:id` can't
  set `lineUserId`; a link needs the real OA flow (a phone). DATA REQUEST on `notification_outbox`.
- **Part 3B (08:15 reminder):** owner-only — `/jobs/daily-reminder` is server-internal (not public; `INTERNAL_JOB_SECRET`)
  and messages real linked people. Owner runs it on the box; QA verifies job_runs row · silent 2nd run · one-msg-per-person · reach.

## Verdict
**REQ-071 + REQ-072 = TEST_PASSED on `sid`** (write-verified on a QA fixture, then retired):
- REQ-072: confirm 4/4, used_sessions unchanged, one notification per course, translated skip reason.
- REQ-071: drop (DROPPED, sessions off), resume (sessions return), **SLOT_TAKEN refuses (no double-book)**, raw-key fix, badge.
Two items for Porter: (a) rule on the **`COURSE_DROPPED` session-write** behavior ("still accepts writes" vs resume-first);
(b) **outbox = 1 row** for a LINE-linked recipient — one DATA-REQUEST SQL for the end-to-end sign. **Open DEFECT:** the
stale Paused chip count (→ Fern). Scope `sid`; `uat` not QA's.
