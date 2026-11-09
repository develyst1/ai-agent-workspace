# TEST-142: TASK-860 (F4 links, first coach, coach change, Bonus 100 pick) + TASK-861 (F5 "No Teacher")
- Source REQ: REQ-120 §5 (F4, F5) · §1.2 Bonus 50/100 · §9.4 #4–5. Built as TASK-860 + TASK-861 (Team B; both ACCEPTED by Silver 2026-11-08).
- Status: **IN_TEST.** Part 1 (sale / change / pick / F5) is done 2026-11-09. Part 2 (day-end cases) runs after the 2026-11-09 17:30 day-end.
- Surfaces: sid API (som.develyst.online) · sid painted front office (desktop 1600 px, headless Chrome) · sid DB catalog + `bo.movement`, read-only · local suite.
- Tested: 2026-11-08 (round 1) and 2026-11-09 (round 2) by Twenty.
- Rounds from Porter: 2026-11-08 (F4) and 2026-11-09 (re-run after the sid deploy, F5 added), both whole and sid only.

## Build under test
- **Round 2 (this verdict):** sid runs SB `976cf33` + SF `d8f800c`, deployed by the owner 2026-11-09 (*"deploy sid done"*, relayed by Porter). Case 0 confirms the F4 route is live.
- Round 1 (2026-11-08): sid ran pre-F4 code (`404 route not found`). Its schema checks (cases 1–4) still stand.

## Session and sign-in
- PokerVault's sid session file was used as-is: never read, printed or copied, and no login.
- Proven on `https://som.develyst.online/scheduler/calendar`: HTTP 200, the calendar is painted, not a login page.
- The page's own Authorization header was reused in memory only. Harness: `tests/harness/sid-twenty-api.mjs`.

## Fixtures (all mine, named `Twenty-F4 A…J` / `Twenty-F5 …`; ids in `tests/harness/state/test142-sid.json`)
| Child | Trial | Then |
|---|---|---|
| A | 1st Trial 2026-11-08 09:00 Kid, ATTENDED | course A1 INLINE → course A2 BIKE → voucher A3 → course A4 SCOOTER |
| B | 1st Trial 11-08 10:00, ATTENDED | voucher B1 → voucher B2 · voucher class on B1, 11-08 16:00, Print, ATTENDED |
| C | 1st Trial 11-08 11:00, left PENDING | course C1 |
| D | 1st Trial 11-08 13:00, CANCELLED | course D1 |
| E | 1st Trial **2026-11-15**, confirmed + ATTENDED (the API allowed it) | voucher E1 |
| F | 1st Trial 11-08 14:00, ATTENDED | **import** course F1 (10, 3 used) |
| G + H | both 1st Trials 11-08 15:00, ATTENDED | DUO course G1 (G primary, H co-student) → voucher H1 for H |
| J | 1st Trial 10-31 CANCELLED | J1 INLINE from 11-08 16:00 Kid · J2 BIKE from 11-08 17:00 Kid · K1 SCOOTER from 11-01 15:00 Toth |
| — | — | OTHER "Twenty-F5 park fee test", No Teacher, 2026-11-09 09:00, 100 ฿, CONFIRMED |

## Cases — F4 (TASK-860)
| # | Case (from AC) | Type | Surface | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 0 | F4 code live on sid | precondition | sid API | invalid pick → 400 | `PUT /courses/<nil>/bonus100-pick {pick:"NOT_A_PICK"}` → **400 VALIDATION** (round 1: 404) | PASS |
| 1–4 | Migration 0074 on sid: 13 nullable columns, 3 CHECKs, 2 partial unique indexes, additive | schema | sid catalog | as TASK §1 | all present; ledger 123 rows (round 1, host 154.197.124.206) | PASS |
| 5 | Team suite | unit | local | green | 25 pass / 0 fail (round 1) | PASS (layer 1 only) |
| 6 | A course sold after an ATTENDED 1st Trial links it | happy | sid API | A1 `fromTrialBookingId` = trial A | A1 = `45ed26f8…` = trial A | PASS |
| 7 | One trial converts once: later sales don't re-link | negative | sid API | A2, A3, A4, B2 null | all null | PASS |
| 8 | Only ATTENDED counts | negative | sid API | C1 (PENDING trial) and D1 (CANCELLED) null | both null | PASS (PENDING, CANCELLED) · **NO_SHOW NOT_TESTED**: no API action writes NO_SHOW (`updateStatus` = confirm/attend/sick-leave/cancel), and day-end never writes it (SYSTEM-FACTS C-01) |
| 9 | A trial dated after today does not link | boundary | sid API | E1 null | E1 null (trial E is dated 11-15, ATTENDED) | PASS |
| 10 | A voucher after an attended trial links it (Bonus 50 = course OR voucher) | happy | sid API | B1 = trial B | B1 = `813e02f4…` = trial B | PASS |
| 11 | Course after course sets `prevCourseId`, across programs (4A) | happy | sid API | A2 → A1 | A2 `prevCourseId` = A1 (INLINE → BIKE) | PASS |
| 12 | Voucher after voucher sets `prevVoucherId` | happy | sid API | B2 → B1 | B2 `prevVoucherId` = B1, `prevCourseId` null | PASS |
| 13 | No kind filter: course → voucher and voucher → course both recorded (A10 neutral) | rule-neutral | sid API | A3 → A2 course; A4 → A3 voucher | A3 `prevCourseId` = A2 · A4 `prevVoucherId` = A3 | PASS |
| 14 | First purchase ever: both prev null | boundary | sid API | A1 both null | both null | PASS |
| 15 | An import writes no links | negative | sid API | F1 all null, although trial F is ATTENDED and unused | F1 all null | PASS |
| 16 | DUO: links on the primary child only | edge | sid API | G1 = trial G; trial H stays unused | G1 = `8ff36982…` = trial G. H's own voucher H1 later linked **trial H** (so the DUO didn't consume it), with `prevCourseId` = G1 (the DUO counts in H's history, as Bob's report says) | PASS |
| 17 | Day-end stamps the first coach = the coach on the earliest ATTENDED row | happy | sid, day-end 2026-11-09 17:30 | J1 = Kid · J2 = Kid · **K1 = Print** (its wk-1 11-01 row was covered by Print; the course teacher is Toth) · B1 voucher = Print · G1 null (none attended) | — | **PENDING part 2** |
| 18 | The day-end step is idempotent | regression | sid, day-end 11-10 | same values on 11-11 | — | PENDING part 2 (read on 11-11) |
| 19 | The first night fills old courses, imports included | happy | sid DB read | `first_teacher_id` set on old courses with ≥1 ATTENDED row | 0 of 277 before (round 1) | PENDING part 2 |
| 20 | A whole-course teacher change stamps `coachChangedAt` + `latestTeacherId` | happy | sid API | A2 → New: both set | set | PASS |
| 21 | A time-only change writes nothing | negative | sid API | A1 (Kid → Kid, 10:00 → 16:00) null | null | PASS |
| 22 | A single-session cover writes nothing (5A) | negative | sid API | K1 wk-1 row → Print: null | null | PASS |
| 23 | A second change overwrites `latestTeacherId` | state | sid API | A2 New → Print: latest = Print | Print (`34ce6f67…`) · J2 New → Kid: latest = Kid | PASS |
| 24a | Pick: 400 on a bad value | negative | sid API | 400 | 400 (case 0) | PASS |
| 24b | Pick: 409 `NO_COACH_CHANGE` | negative | sid API | A1 → 409 | 409 `NO_COACH_CHANGE` | PASS |
| 24c | Pick: success stamps by + at | happy | sid API | A2 SHARE → 200 | 200 `bonus100Pick:"SHARE"`, `bonus100PickBy:"admin"`, `bonus100PickAt` set; re-read via `GET /courses` matches | PASS |
| 24d | Pick: 409 `SAME_COACH` when latest = first | negative | sid API, after day-end | J2 (first Kid after tonight, latest Kid) → 409 | — | PENDING part 2 |
| 25 | Regression: every sale still posts its revenue | regression | `bo.movement`, read-only | one SALE movement per sale | **14 of 14** (9 courses incl. the DUO, 5 vouchers); the import posted none, which is correct | PASS |
| 26 | Front office unchanged by the additive DTO keys | regression | sid painted | calendar renders | renders; 0 console errors on the round-2 picker run (one 404 on the first load, not reproduced) | PASS |

## Cases — F5 (TASK-861)
| # | Case | Type | Surface | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| F5-1 | The system teacher exists, flagged by DTO | happy | sid API | one `isSystem:true` row "No Teacher", FREELANCE, not LINE-linked, no subjects | exactly that (`f57601fa…`); 29 others `isSystem:false` | PASS |
| F5-2 | An OTHER (park fee) block is accepted on it | happy | sid API | 201 | 201, then confirmed | PASS |
| F5-3 | Lesson types refused: 1st Trial, 1 HR, voucher class, course | negative | sid API | 400 `SYSTEM_TEACHER_NOT_BOOKABLE` | 400 with that code, all four | PASS |
| F5-4 | Teacher moves refused: whole-course (TASK-838) and one session | negative | sid API | 400 | 400 `SYSTEM_TEACHER_NOT_BOOKABLE`, both | PASS |
| F5-5 | Teacher writes refused: edit, leave, calendar link, LINE unlink | negative | sid API | 409 `SYSTEM_TEACHER` | 409, all four; the row re-read unchanged | PASS |
| F5-6 | Archive refused | negative | — | 409 | — | **NOT_TESTED**: on a guard defect the shared row would be archived, and the way back (reactivate) runs through the same guard. Not risked on a row I didn't create |
| F5-7 | Excluded from the daily report `byTeacher`, SOM, attention, type-order | negative | sid API | absent | absent from all four, with my OTHER block on it today (11 byTeacher rows) | PASS (before day-end; re-read after, in part 2) |
| F5-8 | Calendar: the column is shown **last**, and the block shows on it | happy | sid painted, Daily 2026-11-09 | No Teacher last | header row ends `… Mu · Tarb · No Teacher`; block painted | PASS |
| F5-9 | Lesson pickers exclude it; OTHER includes it | negative + happy | sid painted, booking modal from Tarb's cell | 1st Trial / 1 HR / Voucher: no "No Teacher"; Other: listed | exactly that | PASS |
| F5-10 | Its cell opens on อื่นๆ only (Silver's ruling) | happy | sid painted | one tab: Other, No Teacher preselected | exactly that | PASS |
| F5-11 | Its OTHER rows still settle at day-end like any OTHER | regression | sid, day-end 11-09 | park block ATTENDED, its 100 ฿ posted | — | PENDING part 2 |
| F5-12 | Course modal (`CreateCourseModal`) picker, roster page, leave panels, 375 px | negative | sid painted | excluded / OK | — | NOT_TESTED this round: the course modal opens from another page I didn't reach. The back end refuses a course on it anyway (F5-3) |

## Observations (not defects in this change)
1. **A future-dated booking can be marked ATTENDED by the API.** Trial E (dated 2026-11-15) was confirmed and attended on 11-09. F4 behaved correctly, but whether "attend" should accept a future date is a product question, not TASK-860's.
2. **The F5 refusal sentence reads "ครู No Teacher ถูกปิดการใช้งานแล้ว"** ("teacher No Teacher has been deactivated"). That is the reused archived-teacher sentence (DECISIONS row 11), so it is as ruled. For staff it reads oddly on a booking refusal. Wording is Porter's call.
3. **The OTHER form on the No Teacher column shows "Rate per teacher (฿) · No Teacher · primary".** A coach rate can be typed for the system teacher. That rate is stored for the back office, so the pay readers must skip `is_system` (Silver already raised this for TASK-862/865/869).

## Defects
None so far.

## Test data created (sid)
| What | Removed? |
|---|---|
| Children `Twenty-F4 A, B, C, D, E, F, G, H, J` with new parents on phones 0900091001–0900091009 (unlinked, so no LINE) | no, held for part 2. Archiving is refused while classes are ahead, so these clear after the courses are cancelled |
| 10 trial bookings (dated 10-31, 11-08 and 11-15) | no (history; nothing is ever deleted) |
| Courses A1 A2 A4 C1 D1 G1 J1 J2 K1 + import F1 · vouchers A3 B1 B2 E1 H1 · voucher class Bv (11-08) | no, held for part 2; then I cancel the courses that have classes ahead |
| **Revenue on sid's ledger: 14 SALE movements = 75,120 ฿** (8 × 4,790 + DUO 6,800 + 5 × 6,000) | **no, cannot be.** Cancelling never reverses posted revenue (SYSTEM-FACTS). Every one carries a `Twenty-` id in `ref_id`, so a sid revenue check can skip them |
| OTHER "Twenty-F5 park fee test" 2026-11-09 09:00 on No Teacher, 100 ฿, CONFIRMED | no, held for F5-11 (it posts 100 ฿ tonight) |
| A2's Bonus-100 pick = SHARE | stays (my course) |

## Evidence
- `project-docs/qa-2026-11-09/task861-daily-right-1600.png`: Daily 2026-11-09. No Teacher is the last column and carries "Twenty-F5 park fee test" (F5-8).
- `project-docs/qa-2026-11-09/task861-picker-tarb-1st_Trial-0.png`: the 1st Trial teacher list ends at Tarb, with no No Teacher (F5-9). Siblings: `…-1_HR-0`, `…-Voucher-0`, and `…-Other-0` (which lists it).
- `project-docs/qa-2026-11-09/task861-modal-noteacher-cell.png`: No Teacher's cell opens with only the Other tab, No Teacher preselected (F5-10).
- F4 has no screen, so its evidence is the API output, quoted verbatim in the table. Harness: `tests/harness/sid-task860-step.mjs` (steps `read`, `change`, `pick`), `sid-task860-revenue-read.ts`.

## Verdict
**Part 1: PASS, no defect.**
- F4: cases 0–16, 20–23, 24a–c, 25 and 26 PASS; within case 8, NO_SHOW is NOT_TESTED.
- F5 (F5-1…10): 9 items PASS; F5-6 (archive) and F5-12 (course modal, roster, 375 px) are NOT_TESTED.

**Still open, so no `TEST_PASSED` yet:** cases 17, 18, 19, 24d and F5-11, after the 2026-11-09 17:30 day-end (18 after the 11-10 run).

## Questions
1. Porter: part 2 needs one read after the 2026-11-09 17:30 day-end, and case 18 one more after 11-10's. Ring me any time after 17:30 tonight and I run it. Nothing else blocks.
