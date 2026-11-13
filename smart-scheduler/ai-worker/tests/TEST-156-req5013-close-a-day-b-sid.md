# TEST-156: REQ-5013 close a whole day (option B) on sid: TASK-959 (SB) + TASK-960 (SF)

**Tester:** Tanya (QA) · **Date:** 2026-11-13 · **Asked by:** Porter (inbox/QA.md) · **Design:** `specs/SPEC-105-close-a-day-option-b.md`
**Surface:** sid, `https://som.develyst.online`, admin session card `picklocker/state/som.json` (no sign-in by anyone; this also settles TASK-960's "sid UI run NOT_TESTED"). Headless Chrome at 1280, in EN and TH. The deployed build is identified by behaviour: the «Close a day» button and the `/closed-days` routes are live.
**Test date:** Wed 2026-12-30, which had 0 live classes before the test. It was closed during the test and re-opened at the end.

## Verdict: ✅ TEST_PASSED (4 items NOT_TESTED, listed below)

| # | Case (REQ-5013 AC / SPEC-105) | Result |
|---|---|---|
| 1 | The dialog (§5): From · To (optional) · Reason · Note; past days disabled | ✅ The picker disables 12 Nov and earlier; 13 Nov (today) is selectable. Reason defaults to Holiday. Buttons are Cancel / Close. |
| 2 | Close 30 Dec through the UI → the toast (§5) | ✅ «Closed 1 day(s) · 1 class(es) still on them — see Attention». The 1 is my QA class on that day. |
| 3 | Server refusals (§3) | ✅ yesterday gives `400 PAST_DATE` «ปิดวันทำการย้อนหลังไม่ได้ — เลือกวันนี้หรือวันถัดไป» · OTHER without a note gives `400 NOTE_REQUIRED` · 30 Dec → 15 Feb gives `400 RANGE_TOO_LONG` «…ไม่เกิน 31 วัน» · re-opening a day that isn't closed gives `404 NOT_CLOSED` |
| 4 | AC1: today can be closed | ✅ `POST {from: 2026-11-13, OTHER, note}` gave **201** `{created:[2026-11-13], classesOnThem: 6}`, and I re-opened it at once (**200** `reopened:true`). It was closed for about a second. No LINE (rule 6). |
| 5 | The banner (AC5), week view, opened via `?date=2026-12-30` | ✅ The `?date` reader opens the week «28 Dec – 3 Jan 2027» on 30 Dec. The strip reads «Wed 30/Dec/26 · Closed day · Holiday», and in TH «Wed 30/Dec/26 · วันปิดทำการ · วันหยุด». The TH button reads «ปิดวันทำการ». |
| 6 | The panel (§5) | ✅ «Closed day · Wed 30/Dec/26 · Reason: Holiday · Closed by admin · 13 Nov 2026 01:00 · 1 class(es) still on this day · 11:00 – 12:00 QA-5013 class on the closed day PENDING · Open · Open the day again». The TH version matches. «Open» opens that class's booking modal. |
| 7 | AC2 create door: UI New booking (Other, QADT2) on 30 Dec | ✅ **409 `DAY_CLOSED`**. The form shows «Couldn't save · วันที่ 30 ธ.ค. ปิดทำการ (วันหยุด) — กรุณาเลือกวันอื่น». Nothing was created. |
| 8 | AC2 move door: `PATCH /bookings/:id` of my QA row from 6 Jan to 30 Dec | ✅ **409 `DAY_CLOSED`**, with the same message |
| 9 | **§4.2 (Porter's watch): a course sale with a week on the closed day**: Private FREESKATE ×4 from Wed 23 Dec 10:00, QA coach QADT2, QA student | ✅ **Refused first:** `409 DAY_CLOSED` «วันที่ 30 ธ.ค. ปิดทำการ (วันหยุด) …». **Then with week 2 ticked absent (`absentWeeks:[2]`): 201.** The rows are 23 Dec PENDING · **30 Dec `SICK_LEAVE`, plannedAtCreation=true** (exempt, as §4.1a says) · 6 Jan · 13 Jan · 20 Jan. So 4 classes are kept and the course runs one week longer. |
| 10 | AC3 the list: the Attention card | ✅ «Classes on a closed day · 1» lists «2026-12-30 11:00 · QA-5013 class on the closed day · QADT2». The item links to `/scheduler/calendar?date=2026-12-30`, and a click lands on that week. The course's planned-absence row is not listed (it isn't a class). |
| 11 | AC6 re-open from the panel, behind the exact confirm | ✅ The TH confirm reads exactly «ยกเลิกการปิดเท่านั้น — คลาสที่ยกเลิก/ย้ายไปแล้วจะไม่กลับมา และไม่มีข้อความถึงผู้ปกครอง». Confirm sends one `DELETE /closed-days/2026-12-30` → **200** `{reopened:true}`. The toast reads «เปิดวันทำการแล้ว», and the strip is gone (0). My QA class was still on the day, unchanged ("restores nothing"). |
| 12 | Console | ✅ 0 page errors in every run |

## Observations (not defects)
- **O-156-1 (UX, for Porter/SA):** on a closed day the calendar cells still show "+". The server refuses with a clear message (case 7). SPEC-105 doesn't ask for the cell to be greyed, as a coach's leave is. Mentioned only in case ขวัญ asks.
- **O-156-2 (not ours):** in the ticked course, the last row (20 Jan) read CONFIRMED right after the create, while the other three read PENDING. It is not part of REQ-5013; I note it without judging it.

## Not tested
- **The group-series extender skips the closed date (`closedDaySkipped`, §4.4):** a nightly job; I don't run jobs. Brew's tests cover it.
- **The make-up search moves past the closed date (§4.3):** it needs a sick leave on a live course near the date. Not run; Brew's tests cover it.
- **No button for a teacher session:** I have no teacher card. Flash pinned it at the source.
- **The 08:00 LINE digest count:** LINE belongs to the owner; not triggered.

## Evidence (`tests/evidence/req-5013-sid/`)
- `01-dialog-close-30-dec.png`: the dialog with From 30 Dec 2026, before Save.
- `02-week-banner-30-dec.png`: the week opened via `?date=2026-12-30`, with the strip «Wed 30/Dec/26 · Closed day · Holiday».
- `03-panel-30-dec.png`: the panel with reason, who and when, the class with «Open», and «Open the day again».
- `04-create-refused-day-closed.png`: New booking on 30 Dec refused, with the server's TH message.
- `05-attention-card.png`: «Classes on a closed day · 1» and its date-linked item.
- `06-reopen-confirm-th.png`: the exact TH re-open sentence.
- These cover TASK-960's 3 asked screenshots (dialog, banner + panel, attention card) and the DAY_CLOSED refusal on a real door.

## Test data created (sid)
| Row | End state |
|---|---|
| booking `51cbc5c0…` «QA-5013 class on the closed day», OTHER, QADT2, 2026-12-30 11:00 | **CANCELLED** (ADMIN_ERROR, "QA-5013 test data clean-up") |
| booking `868aca12…` «QA-5013 move test», OTHER, QADT2, 2027-01-06 10:00 | **CANCELLED** |
| course `1f803409…` Private FREESKATE ×4, QADT2, QA student «QA-req074-1hr», from 2026-12-23 | **cancelled** (`POST /courses/:id/cancel` ADMIN_ERROR): 4 classes CANCELLED. The planned-absence row (30 Dec, SICK_LEAVE) stays as the cancel leaves it. Its revenue: **no COURSE line** on sid in November for it (read 2026-11-13 with the new bo-ceo card: the only 13 Nov lines are TEST-155's two park fees), so there is no revenue residue. |
| `closed_days` 2026-12-30 (Holiday) and 2026-11-13 (OTHER, "QA-5013 AC1 check") | **both re-opened** (soft rows, `reopened_at` set). `GET /closed-days` 13 Nov → 13 Jan returns `[]`. |
| refused attempts (UI create, move, the first course POST) | nothing written |

QA coach QADT2 is not LINE-linked (`lineLinked=false`). The QA student is a QA fixture, but I did not check its parent's LINE link; the course create and cancel would only reach that QA household. Closing and re-opening a day sends no LINE (rule 6).

## Quick regression 2026-11-13, committed build (SB `738b6eb` · SF `6c52040`): ✅ PASS
- QA class on 2026-12-30 11:00 (QADT2), then close 30 Dec (WEATHER) → **201** `{created:[2026-12-30], classesOnThem: 1}`. Yesterday → `PAST_DATE`.
- `?date=2026-12-30` → the strip reads «Wed 30/Dec/26 · Closed day · Weather» (`r2-01-week-strip-weather.png`).
- A create on the day → **409 DAY_CLOSED** «วันที่ 30 ธ.ค. ปิดทำการ (สภาพอากาศ) — กรุณาเลือกวันอื่น». The Attention payload carries `classes_on_closed_days` with my class.
- Re-open → **200** `reopened:true`. `GET /closed-days` returns `[]`. 0 page errors.
- **Test data:** the QA class «QA-5013r…» is CANCELLED. The 30 Dec closure is re-opened (a soft row).
