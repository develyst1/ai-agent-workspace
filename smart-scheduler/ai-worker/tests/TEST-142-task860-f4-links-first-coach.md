# TEST-142: TASK-860 — F4 trial → course/voucher link, renewal link, first coach, coach change, Bonus 100 pick
- Source REQ: REQ-120 §5 (F4) · §1.2 Bonus 50/100 · §9.4 #4–5 — built as TASK-860 (Team B, Bob; ACCEPTED by Silver 2026-11-08)
- Status: **NOT_TESTED (behaviour) — blocked: TASK-860's code is not deployed on sid.** Schema layer PASS · team suite PASS.
- Surfaces: local suite (dummy DB) · sid API · sid DB catalog (read-only). No screen exists for F4.
- Tested: 2026-11-08 by Twenty
- Round given by Porter 2026-11-08 (inbox/QA-2.md), whole, sid only.

## Scope
F4 stores facts only, and pays nothing. In scope:
- the sale writes `from_trial_booking_id` / `prev_course_id` / `prev_voucher_id`;
- day-end stamps `first_teacher_id`;
- TASK-838's whole-course teacher change stamps `coach_changed_at` + `latest_teacher_id`;
- `PUT /courses/:id/bonus100-pick`.

Out of scope, by design (TASK-860 "rule-neutral"): Bonus 100 1A/1B, A10, any go-live date filter, any bonus amount, any screen. The two new Thai 409 strings are Silver's follow-up for the Bonus screen TASK, so they are not judged here.

## Build under test
- Repo `smart-scheduler-back`, branch `dong`, HEAD `0a1f250`. TASK-860 is **uncommitted** in the working tree.
- The same tree also holds **TASK-861 in progress** (`drizzle/0075_system_teacher.sql`, `src/lib/system-teacher.ts`). 0075 is not in MIGRATION-QUEUE, so it is not on sid.
- `dist.zip` in that repo is dated **2026-11-07 02:28**, before TASK-860 was cut (2026-11-08).
- **sid's running API:** pre-TASK-860. See case 0.

## Cases
| # | Case (from AC) | Type | Surface | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|---|
| 0 | Is the TASK-860 code running on sid? | precondition | sid API | `harness/sid-task860-deployed-probe.mjs`: PokerVault's sid session, as-is (landed `https://som.develyst.online/scheduler/calendar`, HTTP 200, not a login page). Sends `PUT /api/courses/<nil uuid>/bonus100-pick` with `{pick:"NOT_A_PICK"}` (invalid, so it writes nothing). | TASK-860 code answers `400` (validator) | **`404 {"error":{"code":"NOT_FOUND","message":"route not found"}}`** | **FAIL as a precondition: not deployed** |
| 1 | §1 migration 0074 is on sid: 9 course + 4 voucher columns, all nullable | schema | sid DB catalog, read-only | `harness/sid-task860-schema-read.ts`. DB host printed only: `154.197.124.206` = sid. | 13 nullable columns, as in TASK §1 | all 13 present: the uuid columns, `coach_changed_at` / `bonus100_pick_at` timestamptz, `bonus100_pick` / `bonus100_pick_by` text. All `nullable=YES`. | PASS |
| 2 | §1 CHECKs: at most one prev; pick ∈ FIRST/LATEST/SHARE | schema | same | same | `course_prev_one_chk`, `voucher_prev_one_chk`, `course_bonus100_pick_chk` | all 3 present, each with the expected definition | PASS |
| 3 | §1 one trial converts at most once per table | schema | same | same | partial unique indexes on `from_trial_booking_id WHERE NOT NULL` | `course_from_trial_uq` and `voucher_from_trial_uq` are present, partial | PASS |
| 4 | §1 additive, no data written | schema | same | same | no links or first coach filled yet | 277 courses: 0 with a link, 0 with `first_teacher_id`. Vouchers: 0 with `first_teacher_id`. Ledger: 123 rows (matches Bob's `db:verify`). | PASS (consistent with the code not running) |
| 5 | Team suite for F4 (TASK §7, cases 1–8) | unit | local, dummy `DATABASE_URL` | `bun test src/lib/first-coach-task860.test.ts` | green | **25 pass · 0 fail** (126 expects). Ran on the mixed 860+861 tree. | PASS (layer 1 only; proves nothing about sid) |
| 6 | Bonus 50 link: a course sold after the child's ATTENDED 1st Trial sets `from_trial_booking_id` | happy | sid API | `Twenty-F4` child → FIRST_TRIAL booking → mark ATTENDED → sell course (SALE) → read course | `fromTrialBookingId` = that trial | — | NOT_TESTED (case 0) |
| 7 | The same trial does not re-link: a 2nd purchase (course, then voucher) | negative | sid API | same child, buy again | null on the 2nd and 3rd sales | — | NOT_TESTED (case 0) |
| 8 | Only ATTENDED counts: PENDING / NO_SHOW / CANCELLED trial → no link | negative | sid API | 3 children, one trial status each, then a sale | `fromTrialBookingId` null | — | NOT_TESTED (case 0) |
| 9 | A future-dated ATTENDED trial is not linked ("on or before today") | boundary | sid API | trial dated tomorrow, if the API lets it be attended | null | — | NOT_TESTED (case 0) |
| 10 | Voucher after a 1st Trial also links (Bonus 50 = course OR voucher) | happy | sid API | trial ATTENDED → sell voucher | voucher `fromTrialBookingId` set | — | NOT_TESTED (case 0) |
| 11 | Renewal: course after course sets `prev_course_id`, across programs (4A) | happy | sid API | course in program X → course in program Y | `prevCourseId` = X course | — | NOT_TESTED (case 0) |
| 12 | Voucher after voucher sets `prev_voucher_id` (kept; the Bonus line decides it is not a renewal) | happy | sid API | voucher → voucher | `prevVoucherId` set, `prevCourseId` null | — | NOT_TESTED (case 0) |
| 13 | Course after voucher / voucher after course: links recorded, no kind filter (A10 neutral) | rule-neutral | sid API | both orders | the matching prev id, the other null | — | NOT_TESTED (case 0) |
| 14 | First purchase ever: both prev null | boundary | sid API | brand-new child | both null | — | NOT_TESTED (case 0) |
| 15 | Import paths write no links | negative | sid API | the `เรียนอยู่แล้ว (ย้ายข้อมูล)` import for a child who has an attended trial | all link columns null | — | NOT_TESTED (case 0) |
| 16 | DUO: links on the primary child only | edge | sid API | DUO course for two `Twenty-` children | primary gets links; co-student none | — | NOT_TESTED (case 0) |
| 17 | Day-end stamps the first coach = the coach on the earliest ATTENDED row; the `booking_teachers` extras do not count | happy | sid, the 17:30 day-end | fixture course with ATTENDED rows on two dates, two coaches, **created before 17:30** | `firstTeacherId` = the earliest row's `teacherId` | — | NOT_TESTED (case 0, and needs a day-end run on the new build) |
| 18 | Day-end step is idempotent: the 2nd run changes nothing | regression | sid | read after the next day's run | same value | — | NOT_TESTED (as 17) |
| 19 | First night fills old courses too, imports included | happy | sid DB read | counts after the first new-build day-end | `first_teacher_id` filled for every course with ≥1 ATTENDED row | — | NOT_TESTED (as 17) |
| 20 | TASK-838 act with a NEW teacher stamps `coach_changed_at` + `latest_teacher_id` | happy | sid API | course-wide teacher change on a `Twenty-` course | both set | — | NOT_TESTED (case 0) |
| 21 | A time-only TASK-838 act writes nothing | negative | sid API | same teacher, new time | both stay null | — | NOT_TESTED (case 0) |
| 22 | A single-session cover writes nothing (5A) | negative | sid API | change one session's teacher | both stay null | — | NOT_TESTED (case 0) |
| 23 | A second change overwrites `latest_teacher_id` | state | sid API | change twice | latest = the 2nd teacher | — | NOT_TESTED (case 0) |
| 24 | Pick refusals: 409 `NO_COACH_CHANGE`, 409 `SAME_COACH`, 400 bad value; success stamps `bonus100_pick_by/at` | negative + happy | sid API | PUT on the cases above | as TASK §5 | — | NOT_TESTED (case 0) |
| 25 | Regression: a sale still succeeds and posts its revenue as before | regression | sid API + `bo.movement` | each sale above | sale 2xx; revenue movement present | — | NOT_TESTED (case 0) |
| 26 | Front office unchanged by the additive DTO keys | regression | sid, painted | open the calendar + a course | renders as before | — | NOT_TESTED (case 0) |

## Defects
None. Case 0 is an environment state, not a defect in TASK-860.

## Test data created
| What | Where | Removed? |
|---|---|---|
| none: the probe sent one INVALID PUT (answered 404, nothing written) and catalog SELECTs only | sid | n/a. Read-only. |

Planned for the run, all named `Twenty-F4 …`: about 8 children, their trials, courses and vouchers.

## Verdict
**NOT_TESTED for behaviour (cases 6–26).** TASK-860's code is not on sid: the route answers 404 `route not found`, and the newest back build is dated before the TASK. The schema layer (cases 1–4) and the team suite (case 5) PASS. Neither proves a sale writes a link. The owner's standing rule is "every QA pass needs a sid deploy" (SYSTEM-FACTS, owner 2026-08-19), so I did not run a local server against sid. Doing that would also run the day-end sweep over every team's rows.

## Evidence
- `project-docs/qa-2026-11-08/task860-sid-landing.png`: the sid session I used is live (the calendar is painted, not a login page). Case 0's 404 came through this session.
- Case 0's response, verbatim: `PUT /api/courses/<nil>/bonus100-pick {pick:"NOT_A_PICK"} → HTTP 404 · {"error":{"code":"NOT_FOUND","message":"route not found"}}`. This is an API result, so there is no screen to shoot.
- Cases 1–4: the output of `harness/sid-task860-schema-read.ts`, quoted in the table (host `154.197.124.206`).

## Questions
1. **For Porter: a sid deploy of TASK-860's build is needed before cases 6–26 can run.**
   - The working tree also holds TASK-861 in progress, with migration 0075 not on sid. So the build has to be cut so that it carries F4 and does not need 0075. Which build that is, is Team B's to say.
   - Once it is up, I re-run case 0 (expect 400), then 6–26.
   - Cases 17–19 also need the 17:30 day-end to run once on the new build, with my fixture made before 17:30. Their results come the morning after.
