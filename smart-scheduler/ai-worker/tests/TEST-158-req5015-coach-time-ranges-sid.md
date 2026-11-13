# TEST-158: REQ-5015 coach time ranges + multi-coach leave on sid: TASK-965 (SB) + TASK-966 (SF)

**Tester:** Tanya (QA) · **Date:** 2026-11-13 · **Asked by:** Porter (inbox/QA.md) · **Design:** SPEC-108 (§§ 2–4, § 4a)
**Build:** the committed build on sid (SB `738b6eb` · SF `6c52040`, 0080 applied). Admin card `picklocker/state/som.json`, headless Chrome at 1280, EN.
**Data:** QA coaches only (QADT2, QADT3, QACT, all `lineLinked=false`, so no coach LINE notice could be delivered). Dates in Dec 2026. Every leave was lifted, every class cancelled, and QACT's hours were cleared at the end.

## Verdict: ✅ TEST_PASSED (2 wording observations, 3 NOT_TESTED)

| # | AC / SPEC | Result |
|---|---|---|
| 1 | AC2 · validation (§4) | ✅ start without end · start ≥ end · 13:15 (not :00/:30) · times plus `sessionIds` → **400** each |
| 2 | AC2 · record a part-day leave: QADT2, 2026-12-16, 13:00–15:00 (API) | ✅ 200. `GET /teacher-leave-days` gives `startTime 13:00 · endTime 15:00`, and `bookings` lists **only the 14:00 class** (QA classes also at 10:00 and, later, 12:00 / 15:00) |
| 3 | AC2 · doors by hour slot (§3.1) | ✅ a new class at **13:00 → 409 TEACHER_ON_LEAVE**. **12:00 → 201** and **15:00 → 201** (outside `[13:00, 15:00)`) |
| 4 | AC4 · whole-day leave unchanged: QADT3, same day, no times | ✅ 200. A class at 09:00 → 409 TEACHER_ON_LEAVE |
| 5 | AC2 · calendar (Daily, 16 Dec) | ✅ the strip reads «QADT2 is away — 1 class(es) to handle · **13:00–15:00**», and QADT3's reads «QADT3 is away — nothing booked». Greyed cells (`data-leave-day`), mapped to coach and hour: **QADT2 at 13:00 and 14:00 only**, QADT3 09:00–17:00 (all 9). |
| 6 | AC2 · the leave panel | ✅ «QADT2's leave … Wed 16/Dec/26 13:00–15:00 · 1 class(es) booked … 14:00 – 15:00 QA-5015 T2 14:00 PENDING · Open». Recording it cancelled nothing (all 4 QADT2 classes stayed PENDING). |
| 7 | **AC1 · several coaches at once (UI)**: «Record teacher leave», QADT2 + QADT3 + QACT, 18 Dec, All day off, 10:00–11:00 | ✅ the dialog takes 3 chips. Save sent **3 POSTs, one per coach, same body** with `startTime 10:00 · endTime 11:00`, each 200. The result reads «Result for each teacher: QADT2 SAVED · QADT3 SAVED · QACT SAVED» plus the "NOTHING HAS BEEN CANCELLED" line. |
| 8 | AC3 · working hours (API, § 4a): QACT, Wed 13:00–18:00 | ✅ impact `GET …/work-days/impact` → 200, `removedDays []`, `orphanCount 5` (warns, moves nothing). A key outside `workDays` → 400. Set → 200. |
| 9 | AC3 · the door | ✅ QACT Wed 16 Dec **10:00 → 400** «ครู QACT ทำงานวันพุธ เวลา 13:00–18:00 — กรุณาเลือกเวลาอื่นหรือครูอื่น» (the SPEC's sentence). **17:00 → 201** (inside). Thu 17 Dec 10:00 → 201 (no hours that day = the whole day). |
| 10 | Console | ✅ 0 page errors |

## Observations (wording, for Porter; not defects against the SPEC)
- **O-158-1:** a part-day refusal uses the whole-day sentence: «ครู QADT2 ลาวันที่ 2026-12-16 — เพิ่มคาบกับครูในวันนั้นไม่ได้ …». It names no time, says "in that day", and shows an ISO date. An admin may think the whole day is blocked.
- **O-158-2:** the dialog with All day off and 10:00–11:00 still says «Recording leave for … **blocks their whole day** for new bookings …», and the button reads «**Block this day** for QADT2, QADT3, QACT». Only the hour is blocked (case 3).
- **O-158-3:** on QACT's Wednesday, the calendar's cells before 13:00 still show "+" (the server refuses, case 9). SPEC § 3.4 asks only the slot picker to skip those hours.

## Not tested
- **The «Working days» hours editor on the Teachers page:** I couldn't reach QACT's control headless in two tries. The rule is proven by the API (cases 8–9).
- **The slot picker skipping a coach outside their hours** (§ 3.4).
- **One coach refused while the others save** (AC1's partial case), and the part-day **LINE text** (on hold for the owner's wording, Q1; QA coaches have no LINE).

## Evidence (`tests/evidence/req-5015-sid/`)
- `01-day-1280-part-day-cells.png`: Daily 16 Dec. QADT2 greyed at 13:00 only (the 14:00 class has the leave mark), with classes at 10:00, 12:00 and 15:00 free. QADT3 greyed all day.
- `02-multi-coach-dialog.png`: 3 coaches, 18 Dec, 10:00–11:00 (also shows O-158-2).
- `03-multi-coach-results.png`: SAVED for each coach.
- `04-leave-panel-part-day-qadt2.png`: the panel with 13:00–15:00 and only the 14:00 class.

## Test data created (sid)
| Row | End state |
|---|---|
| leaves: QADT2 16 Dec 13:00–15:00 · QADT3 16 Dec whole day · QADT2 / QADT3 / QACT 18 Dec 10:00–11:00 | **all 5 lifted** (DELETE 200 each). `GET` for Dec returns none for these coaches. |
| 6 QA classes «QA-5015 …» (QADT2 16 Dec 10:00 / 12:00 / 14:00 / 15:00; QACT 16 Dec 17:00; QACT 17 Dec 10:00) | **CANCELLED** (ADMIN_ERROR) |
| QACT `workHours` | set to Wed 13:00–18:00, then **cleared** (`null`); `workDays` unchanged (all 7) |
