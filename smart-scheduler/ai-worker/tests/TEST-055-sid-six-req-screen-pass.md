# TEST-055: sid six-REQ screen pass (REQ-043/044/048/049/053/054)
- Source REQ: REQ-043, REQ-044, REQ-048, REQ-049, REQ-053, REQ-054
- Status: TEST_PASSED (screen/UI acceptance) — server-side negatives (AC-2) + reporting (AC-6) NOT_TESTED, see Verdict
- Environments: dev-server (`som.develyst.online` = sid)
- Tested: 2026-08-19 by Tanya

## Scope
The reachable-screens pass Porter briefed on 2026-08-19 after the go-live wipe + DEF-4 close.
Run on **sid only** via Playwright + real Chrome (paints), authenticated through the minted NextAuth
cookie (no password typed into a login form — `scripts/mint-session.mjs` path, TASK-090). Breakpoint
discipline note: cases below captured at 1440; 375/768 responsive sweep still pending (see Verdict).
**No production, no `uat`, no real LINE OA touched.** `sid` data state at test time: wiped to people-only
(109 parents / 130 students, **zero courses / vouchers / bookings**), so empty pickers/grid are expected.

## Cases
| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|----------------|------|-------|----------|--------|--------|
| 1 | Auth to sid without typing a password | setup | mint cookie → set on som.develyst.online → open /scheduler/calendar | authed session, calendar renders | authed=true, HTTP 200, Schedule grid + teacher rows render (grid empty = wipe) | PASS |
| 2 | REQ-044 — New-booking modal tab strip | happy | calendar → "+" add cell → modal | exactly 3 tabs; COURSE gone; Voucher where it was | Tabs = **Trial · Single session · Voucher** (3). No Course tab. | PASS |
| 3 | REQ-043 — one student picker across tabs | happy | in modal, each tab | every tab has a Student picker | Student * ("Search by name, nickname or parent phone") present on Trial, Single, Voucher | PASS |
| 4 | REQ-048 — voucher time selectable | happy | Voucher tab | a selectable Time field | **Time \* = 09:00** dropdown (required) + Program \* ("chosen, not assumed from teacher") | PASS |
| 5 | REQ-049 — settings rows render | happy | /scheduler/settings | rule rows render with values | 5 rows render (teacher-change notice 3d · check-in window 30m · leave-notice FT/PT 3h · leave-notice freelance 3h · leave-notification audience Admin only), each Current/Default + DEFAULT badge + Edit | PASS |
| 6 | REQ-054 AC-1 — program asked once | happy | /scheduler/bookings → New course | one program control; program gated behind teacher; no per-session program control on the form | Single **Program \*** control; "Select a teacher first" until a teacher is chosen | PASS |
| 7 | REQ-054 — teacher-swap does not keep a stale subject | edge | New course → pick Teacher Bank → note Program → swap to Teacher Ek | Program re-derives from the new teacher; no stale/mismatched subject carried | Program disabled→enabled on first teacher; **resets to "Select a program" on every swap** (Bank→Ek). No stale value. | PASS |
| 8 | REQ-053 AC-1 — วิชา read-only on a course session (Edit session) | happy | New course → fill (Bike program) → Generate plan (dry-run preview, NOT created) → session ⋯ → **Edit** | Subject shown read-only text + explanation line; not editable | **Edit session** shows Date/Time/Teacher editable but **Subject = read-only plain text** "Bike / Scooter / Balance Cruiser" under the explanation *"A course's subject is fixed when the course is created and can't be changed per session…"*. Same PlanModal component used for persisted sessions. | PASS |
| 9 | REQ-054 AC-3 — plan modal shows program per session, read-only | happy | New course → fill → Generate plan (dry-run preview) → inspect rows | per-session rows show the one program, no per-row program control | Plan = 6 rows, **every row Subject = "Bike / Scooter / Balance Cruiser"**, zero per-session program controls (`perSessionProgramControls: []`); dates render `DD/MMM/YY` | PASS |
| 10 | REQ-053 AC-2 — server refuses a crafted subject change on a course session | negative | `PATCH /bookings/:id` with a different `subjectId` on a course session | refused (`COURSE_SUBJECT_LOCKED`), stored program unchanged | **NOT_TESTED** — no course session exists on sid (0 courses globally) to PATCH; creating a fixture = unremovable residue on the go-live-import box. See Blocker. | NOT_TESTED |
| 11 | REQ-054 AC-2 — server refuses a mixed-program course create | negative | `POST /courses` subjectId=Bike, session[1].subjectId=Surfskate, existing student `{id}` | course NOT created, refusal names the rule | **HTTP 400** — `"ทุกคาบในคอร์สต้องเป็นกิจกรรมเดียวกัน"` (REQ-054's exact wording); **courses 0→0, nothing persisted** | PASS |

## Defects
### DEF-5 — booking modal renders สาขา / จังหวัด labels in Thai while the UI is in English — MINOR
- Environment: dev-server (sid)
- Repro (from a clean state): 1) sign in, 2) ensure the language toggle shows **EN** active, 3) calendar → "+"
  → New-booking modal → any tab. The last two field labels render as **`สาขา`** and **`จังหวัด`** (branch /
  province) while every other label (Student, Teacher, Subject, Program, Time) is English.
- Expected: on the English UI, those labels read in English (Branch / Province), via the i18n dictionary.
- Actual: Thai-only labels — copy not going through `t(...)` (the repo's own rule: "Never hardcode user-facing
  copy — add keys to dictionaries.ts"). Same Thai-on-English pattern also appears on Settings row *titles*, but
  those are business-rule names and are arguably intended; the booking-modal form-field labels are the clear defect.
- Evidence: scratchpad `newbooking-1440-Voucher.png` (screenshots held out of the repo — sid shows real family PII).

## Observations (out of scope — for Porter to route, not tested by me)
- Calendar status legend still shows **"AWAITING RESCHEDULE"**, though `smart-scheduler-front/CLAUDE.md` says that
  flow + `PENDING_RESCHEDULE` status was removed 2026-07-11 (UC-006). Possibly a stale legend entry.

## How REQ-053/054 were verified WITHOUT creating a course (no writes)
There is **no course/booking delete** anywhere — not in the UI (REQ-036 unbuilt) nor the API (only
`DELETE /teachers/:id/line-link` and `DELETE /settings/:key`). So creating a QA course would leave **unremovable
residue** on the freshly-wiped go-live box — I did **not** do that. Instead I used the **plan preview**: fill the
New-course form and press **Generate plan** (a dry-run that persists nothing) — then inspect the plan table and open a
session's **Edit** panel. I never clicked **Create plan** or **Save**, so nothing was written. Catalog note: sid's
catalog **is** seeded — "Bike / Scooter / Balance Cruiser" (and other programs) have packages and generate a plan;
only "1st Trial" has no packages (expected — trials aren't courses).

### Server-side negatives (Porter's 2026-08-19 ruling: AC-2 required before sign-off)
- **REQ-054 AC-2 — DONE, PASS** (case 11): the live `POST /courses` guard refuses a mixed-program create with the
  REQ's exact rule text and persists nothing. The rule constant is `COURSE_SUBJECT_LOCKED` (src/lib/course-subject-lock.ts).
- **REQ-053 AC-2 — NOT_TESTED, needs a decision** (case 10): the guard is `changesCourseSubject` on `PATCH /bookings/:id`
  and only fires on a booking with `courseId != null`. sid has **0 courses globally**, so there is no course session
  to PATCH, and creating a fixture leaves unremovable residue (no course/booking delete) on the box the owner is
  importing the customer's real courses onto. Corroborating (not a substitute for the live run): it is the **same
  one-course-one-subject rule** whose create-side (REQ-054 AC-2) just passed live, and `course-subject-lock.test.ts`
  unit-covers both edit paths. **Q1 → Porter:** authorize an isolated QA fixture (new QA student + one course; I run
  the PATCH-refusal, then owner scoped-deletes just that student's rows), or defer REQ-053 AC-2 until real courses land?
- **REQ-054 AC-6** (reporting reads a course's sessions as one program) — Porter **deliberately deferred** it
  (REQ-013/014 read per-session subject, untouched by this change); named in the green light, not dropped.

## Test data created
| What | Where | Removed? |
|------|-------|----------|
| (none — no records created; all writes deliberately avoided for lack of a cleanup path) | dev-server | ✅ nothing to remove |

## Responsive sweep (375 / 768 / 1440)
Measured at all three widths on Calendar, New-booking modal, Settings, New-course modal:
- **No horizontal scroll** anywhere (`scrollWidth == innerWidth` at 375 and 768); nothing clipped.
- New-booking modal: **3-tab strip intact** at 375 & 768; nav collapses to a hamburger at 375; fields stack cleanly
  (Student / Teacher / Subject+Time / สาขา+จังหวัด / Cancel-Save); all reachable.
- ⚠️ **Tap targets under the 44px touch guideline** — modal tabs & Save/Cancel 36px, Settings Edit 30px. This is a
  **pre-existing MINOR** (the 2026-08-11 hallmark audit already logged "30px hit target at 375"), **not a regression**
  from this work, and does not block content acceptance. Noted, not re-raised as a new defect.

## Verdict
**TEST_PASSED — screen/UI acceptance — for all six REQs at 375 / 768 / 1440**, rendered evidence, **zero writes /
zero footprint**: REQ-043 · REQ-044 · REQ-048 · REQ-049 · REQ-053 (AC-1 read-only+explanation, AC-3 date/time/teacher
editable) · REQ-054 (AC-1 one program, AC-3 plan-modal, teacher-swap resets).
**Explicitly NOT covered by this pass (still NOT_TESTED):** the server-side negatives REQ-053 AC-2 / REQ-054 AC-2
(crafted-request refusals) and REQ-054 AC-6 (reporting reads a course as one program) — API/report tests, not screen
tests. Porter to decide whether the screen pass is sufficient for sign-off or those are required too (Q1).
**Carry-over:** DEF-5 (สาขา/จังหวัด Thai on EN UI, minor); sub-44px tap targets (pre-existing minor).

## Questions
- **Q1 (to Porter):** to finish REQ-053/054, either (a) authorize a QA course on sid **and** have the owner run the
  REQ-040 delete block afterward (I'll declare the exact footprint), **or** (b) defer REQ-053/054 verification until
  the customer's real course imports land on sid, so real course sessions exist to open via แก้ไขคาบ. Which?
- **Q2 (to Porter):** DEF-5 (สาขา/จังหวัด Thai labels on the English UI) — is Branch/Province meant to be
  translated, and is this in scope for REQ-043/044, or a separate copy fix?
