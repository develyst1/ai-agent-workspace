# TEST-155: TASK-942 on sid — several park groups in one hour

**Tester:** Tanya (QA) · **Date:** 2026-11-13 · **Asked by:** Porter (inbox/QA.md) · **TASK:** `tasks/TASK-942-park-fee-several-groups-per-hour-sb-sf.md`
**Surface:** sid, `https://som.develyst.online` (front office, admin card `picklocker/state/som.json`), headless Chrome, 1280 and 375 px. The calls go through the deployed SB, as the admin. The deployed build is identified by behaviour: SB has `slot_exempt` (a 2nd park block in one hour gets 201), and SF has `data-park-stack` / `data-park-add` in the DOM.

## Verdict: ⚠️ TEST_FAILED, 1 defect (D-155-1)

The back end does what the TASK asks. The calendar still shows only one park block per hour, because `GET /calendar` sends only one.

| # | Case (AC) | Result |
|---|---|---|
| 1 | 3 park blocks (No Teacher, OTHER) at 2026-11-13 14:00 (BE §4) | ✅ A, B and C each got **201** |
| 2 | A real coach is still single: QA coach `QACT`, a 2nd OTHER in the same hour (BE §4) | ✅ **409 `SLOT_TAKEN`** («ครู QACT มีคาบสอนช่วงเวลานี้อยู่แล้ว …») |
| 3 | The same 2nd booking with `slotExempt: true` in the body (BE §4) | ✅ **409 `SLOT_TAKEN`**: the field is ignored |
| 4 | The calendar's No Teacher column shows N blocks in one hour cell (FE) | ❌ **D-155-1**: Daily shows `data-park-stack="1"` with park A only. Weekly's Fri cell also shows park A only. B and C are not drawn anywhere on the calendar. |
| 5 | The "+" stays available on the No Teacher cell that has a block (FE) | ✅ `data-park-add` sits under the stack. Clicking it opens «New booking · 13/Nov/26 · Other · No Teacher · primary». I closed it with Escape; nothing was saved. |
| 6 | 375 px | ✅ no page overflow (`scrollWidth − innerWidth = 0`). The stack is readable, but it held 1 card only (see D-155-1). |
| 7 | Her money case: A and B in the same hour → two `rl:booking:<id>` lines, each dated its own confirm day | **(a) ✅ two lines, live** (re-read 2026-11-13 with Porter's new bo-ceo card; GET `/api/v1/revenue/lines?from=2026-11-01&to=2026-11-30`). There are exactly two `RENT · PARK · «Park fee» · 100 satang · source BOOKING` lines, both `occurredOn 2026-11-13`, created 0.4 s apart (`…17:54:34.584Z` / `…34.959Z`): my A and B confirms. C was never confirmed and has no line. The API doesn't show the idempotency key, so `rl:booking:<id>` itself is not seen; that two separate lines exist for one hour is what this proves. **(b) ⏸ NOT_TESTED live:** "A confirmed yesterday, B today" needs a clock. Bob's unit test pins it (TASK-942 Notes). |

## D-155-1 — the calendar shows only the first park block in an hour (High)
- **Steps:**
  1. On sid, as admin, create 2 or 3 OTHER bookings on «No Teacher» on the same date and hour, for example `POST /api/bookings {teacherId:<No Teacher>, date, startTime:"14:00", bookingType:"OTHER", otherTitle, otherPriceMinor}` ×3. All three return 201.
  2. Open Schedule, then Daily (or Weekly), on that date.
- **Expected:** the No Teacher 14:00 cell shows all 3 blocks stacked, each with its own name (TASK-942 FE).
- **Actual:** the cell shows only the first (park A, `data-park-stack="1"`). B and C appear nowhere on the calendar, although `GET /api/bookings?teacherId=<No Teacher>&from=…&to=…` lists all three.
- **Where it is lost (what I saw):** the `GET /api/calendar?date=2026-11-13&view=day|week` payload gives each column `slots[]` with exactly one `{time, booking}` per hour. At 14:00 the No Teacher column carries park A only. SB `scheduler.service.ts` builds that slot from `idx.get(\`${date}|${teacher.id}|${time}\`)`, one booking per key. The SF `findAll` (which stacks) only ever receives that one booking. Fanta's DOM test fed several bookings directly, so it passed. The fix is the SA's to place.
- **Impact:** an admin can't see, open, confirm or cancel the 2nd and later group's block from the calendar. Its revenue line only appears once someone confirms it, which can now only happen from the Bookings list.

## Evidence (`tests/evidence/task-942-sid/`)
- `01-week-1280-no-teacher-fri.png`: Weekly, the No Teacher row on Fri 13 Nov: 11:00 one block, 14:00 «QA-942 park A» only, then the "+". B and C are missing.
- `02-day-1280-no-teacher-14.png`: Daily, the No Teacher 14:00 cell: one card «QA-942 park A», with the "+" under it.
- `03-day-375-no-teacher-14.png`: the same at 375 px, with no overflow.
- The API results (statuses and codes) are quoted in the table above. Scripts are in my scratchpad and are not committed.

## Not tested
- Case 7(b): the cross-day dating (needs a clock).
- The OTHER form's own submit path for a 2nd block (case 1 used the API the form calls). Creating through the "+" was opened but not saved.
- Moving a park block (`moveBooking` restamp): Bob's unit tests cover it, not run live.
- Dark mode.

## Test data created (sid)
| Row | Created | End state |
|---|---|---|
| booking `4de5f896…` «QA-942 park A», No Teacher, 2026-11-13 14:00, 1.00 ฿ | 2026-11-13 | confirmed, then **CANCELLED** (reason ADMIN_ERROR, "QA-942 test data clean-up") |
| booking `bddabab6…` «QA-942 park B», same hour, 1.00 ฿ | 2026-11-13 | confirmed, then **CANCELLED** |
| booking `5c5916cb…` «QA-942 park C», same hour, 1.00 ฿ | 2026-11-13 | **CANCELLED** (never confirmed) |
| booking `b57fb170…` «QA-942 coach 1», QA coach QACT, same hour | 2026-11-13 | **CANCELLED** |
| `bo.revenue_line` for A and B (RENT/PARK «Park fee», 1.00 ฿ each, occurredOn 2026-11-13) | 2026-11-13 | ⚠️ **residue, confirmed present: not removable from the app.** A cancel writes no reversal. Total 2.00 ฿ on sid's 13 Nov revenue. |

No LINE: neither No Teacher nor QACT is LINE-linked (`lineLinked=false`).

## Re-test 2026-11-13, committed build (SB `738b6eb` · SF `6c52040`): ✅ TEST_PASSED, D-155-1 fixed
- **Server:** 3 new park blocks «QA-942r park A/B/C» at 2026-11-13 15:00 → **201 ×3**. QA coach QACT: 1st 201, 2nd **409 SLOT_TAKEN**, 2nd with `slotExempt:true` **409 SLOT_TAKEN** (unchanged).
- **D-155-1 fixed:** `GET /calendar` now gives the slot `{time, booking, more}`. At 15:00 the No Teacher slot carries `booking` = park B and `more` = [C, A].
- **Calendar:** Daily `data-park-stack="3"`, with 3 cards (B · C · A) and the "+" under them. Weekly's No Teacher row shows all 3. 375 px also shows 3 cards with no overflow. 0 page errors.
- **Reachable:** a click on park C (the 2nd block) opens its booking modal. The modal shows only «Close» for this park block; I didn't compare it against a single-block park, so I'm not calling it a defect.
- **Money:** confirming A and B (API) wrote **two more separate `RENT · PARK · «Park fee» · 100` lines**, `occurredOn 2026-11-13`, created 0.3 s apart. The cross-day dating stays unit-test only.
- **Card order** is B · C · A, not the order created. This is an observation for Porter, if order matters to ขวัญ.
- **Evidence** (`tests/evidence/task-942-sid-r2/`): `01-week-1280-three-blocks.png` · `02-day-1280-three-blocks.png` · `03-day-375-three-blocks.png`.
- **Test data:** bookings `3e54dfc1…` (A), `52ef1212…` (B), `b838bb38…` (C) and `be80b18a…` (coach 1) are all **CANCELLED** (ADMIN_ERROR). ⚠️ Residue: 2 more 1.00 ฿ park-fee lines on sid 13 Nov (4 in all from this TEST). A cancel writes no reversal.
