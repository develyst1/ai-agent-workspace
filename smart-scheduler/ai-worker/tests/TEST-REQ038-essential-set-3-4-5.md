# TEST-REQ038: essential set #3 / #4 / #5 — `sid` runtime verify
- Source REQ: REQ-038 (customer "Standard Timetable" feedback, items 1–5)
- Status: ✅ **ALL ACCEPTED — #3 · #4 · #5 all `TEST_PASSED`** (#3 was TEST_FAILED in round 1, built as TASK-124, accepted in round 3) · #2 spot-verified · OBS-5 resolved (TASK-125) · fast-follow 107/109/102/122 smoke-clean
- Environment: **`sid` (som.develyst.online)**, TASK-090 cookie path. Round 1 read-only; round 2 read-only apart from one reversible settings round-trip (restored + verified).
- Tested: 2026-08-10 by Tanya

## Scope

The two verify-only items Porter routed this morning (#3, #4) plus the acceptance of #5. Harnesses:
`tests/harness/sid-req038-3-4-verify.mjs`, `sid-voucher-plan-shape.mjs`.
Evidence: `../project-docs/qa-2026-08-10/`.

## #3 — "Search Bar หน้าตาราง" (a search bar on the timetable page) — 🔴 `TEST_FAILED` (GAP)

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| 3-1 | a **student** search on `/scheduler/calendar` | a "Search student / ค้นชื่อนักเรียน" control | the page's only inputs are **Teacher** (`All teachers`, 464 px), **Type** (`All types`, 286 px), **Badge** (`All badges`, 286 px). **No student search of any kind.** | 🔴 **FAIL** |
| 3-2 | any other route to find a student from the timetable | a search action somewhere on the page | buttons are `Sign out · 11 Aug 2026 · Today` + the slot cells. No search affordance | 🔴 **FAIL** |
| 3-3 | contrast — the same search exists on the bookings page | present | present ✅ (REQ-011/024 work is real, just not on this page) | **PASS** |

### Why this reads as DELIVERED on the board but isn't
The BA map has **"#3 Search Bar หน้าตาราง = REQ-011 DELIVERED 🟢"**. REQ-011 is a different thing: it fixed
the **student picker not filtering while typing inside the New Booking modal** (accepted 2026-07-29). That
fix is live and correct — but the customer's #3 asks for a search bar **on the timetable page itself**, so
a staff member can find a child's session without leaving the schedule. The timetable filters by
**teacher / type / badge only**. Nothing on that page searches students.

**Severity:** it is the customer's own essential-set item, and it is **unbuilt**, not broken — Porter's own
note anticipated this ("if either is a gap, it's a small FE add"). Not a regression; no existing behaviour
is wrong.

## #4 — a voucher booking shows its class/subject (REQ-029) — ✅ `TEST_PASSED`

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| 4-1 | the API carries a subject on voucher bookings | every voucher row exposes its class | `GET /bookings?type=VOUCHER` → 200, **5/5 rows carry a subject** | **PASS** |
| 4-2 | the FE renders it in the bookings list | the Subject column is populated on voucher rows | columns `Student · Subject · Teacher · Date · Time · Type · Status`; subject cells: **1st Trial · Skateboard · Skateboard · Inline Skate · Surfskate** — no blanks, no dashes | **PASS** |
| 4-3 | the voucher plan modal shows it per session | a Subject column with real values | `Date/Time/Teacher/**Subject**/Status` → `5 Jan · 09:00 · Bank · **Surfskate**` | **PASS** |

## #5 — deduction history (ประวัติการตัดคอร์ส) — ⛔ BLOCKED, cannot accept

`GET /courses/:id/history` → **404 Not Found** on `sid` (tried on a real course id and on my QA course).
TASK-119 (BE) and TASK-120 (FE) are both SA-PASS and build-complete, but **the build is not on `sid`** — so
there is nothing deployed for me to accept. **This is a deploy step, not a defect.** The moment it lands I
can accept it in one short pass (the timeline is read-only, so acceptance is cheap).

## Bonus — the `kind=voucher` plan shape is now VERIFIED (closes a standing backlog item)

This had been `NOT TESTED` since 2026-08-04 because the only live vouchers belonged to other people and I
won't edit a stranger's row. My own QA voucher now serves — and it is read-only to check:

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| V-1 | the DTO uses the voucher discriminant | `kind="voucher"`, hours summary, no size/owed/maxWeek | `kind=voucher · {kind:"voucher", totalHours:5, usedHours:0, hoursRemaining:5, expiryDate:"2026-04-05"}` · `liveEndDate=null` | **PASS** |
| V-2 | a voucher is never insertable | `insertable=false` | `insertable=false` | **PASS** |
| V-3 | the modal renders the voucher shape | VOUCHER badge + hours left, not "N-session course / Leave x/y" | **`VOUCHER · 5 / 5 h left · Ends no live sessions`** | **PASS** |
| V-4 | no course-only mechanics are offered | no Insert / Mark absence / Add extra | the modal's only action is **`Edit`** | **PASS** |
| V-5 | the rule is stated to the user | an explanation, not silence | *"Voucher sessions can be moved one at a time (no make-up chain)."* | **PASS** |

## Defects

### DEF-2 — the timetable page has no student search (essential-set #3) — **MEDIUM** (customer-facing gap, unbuilt)
- Environment: `sid`, `/scheduler/calendar`.
- Repro: open the timetable → look at the filter row.
- Expected: a way to search/find a student's session from the schedule page (customer's #3).
- Actual: filters are teacher / type / badge only; no student search anywhere on the page.
- Evidence: `../project-docs/qa-2026-08-10/sid-r38-1-calendar-controls.png`, harness output listing every
  input on the page.
- Not a regression — REQ-011's picker fix is live and correct, it simply isn't this.

## Test data created

**None.** Every check in this round was read-only: no booking, no course, no teacher, no LINE message.
The QA rows from the 2026-08-04 sessions are unchanged and already declared in `DEV-SERVER-FOOTPRINT.md`.

## Verdict

- **#3 → `TEST_FAILED`** (gap, unbuilt — the board's REQ-011 mapping doesn't cover it)
- **#4 → `TEST_PASSED`**
- **#5 → cannot be accepted: not deployed** (404 on `sid`); re-run the moment it ships
- **Bonus: the `kind=voucher` plan shape → verified**, backlog item closed

## Questions

1. **@Porter — #3 is the essential set's only real gap now.** It needs a small FE add (a student search on
   the timetable page). Do you want it scoped as its own task, or folded into REQ-038's build?
2. **@Porter — #5 needs a deploy** before I can accept it. Same sitting as anything else pending?

---

# ROUND 2 — 2026-08-10 (after the afternoon `sid` deploy): #5 accepted + fast-follow smoke

Porter deployed #5 (deduction history) plus the fast-follow. Harnesses:
`tests/harness/sid-req038-5-and-fastfollow.mjs` · `sid-req038-5-fastfollow-round2.mjs` ·
`sid-req038-2-and-rental.mjs`. Evidence: `../project-docs/qa-2026-08-10/sid-ff*.png`.

## #5 — deduction history (ประวัติการตัดคอร์ส) — ✅ `TEST_PASSED`

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| 5-1 | the endpoint is live (was 404 this morning) | 200 with summary + timeline | **200** · `{courseId, summary, events}` | **PASS** |
| 5-2 | the timeline carries the course's real events | several distinct kinds | **8 events**, 6 distinct kinds: `scheduled · sick-leave · attended · cancelled · makeup-appended · extra-session-added` — every one traceable to something I did to this course on 08-04 | **PASS** |
| 5-3 | the summary is right | used / leave / remaining / end | `{size:4, usedSessions:1, leaveUsed:1, remaining:3, liveEndDate:"2026-09-08"}` — matches the plan | **PASS** |
| 5-4 | the modal renders what · when · context | human labels, dates, teacher/subject | `Deduction history · USED: 1 OF 4 · LEAVE USED: 1 · REMAINING: 3 · ENDS: 8 SEP 2026` then entries like `Scheduled · 1 Sep 2026 · Bike / Scooter / Balance Cruiser · Bank · 4 Aug 2026 16:43 · Sick leave …` | **PASS** |
| 5-5 | **no raw i18n key falls through** (the hyphen-key transform SA flagged as the one real risk) | no `kindNo-show` / `history.x` strings on screen | scanned the rendered text for `kind[A-Z]…` and `history.…` → **no leaks**; the 6 kinds present all render as prose | **PASS** |
| 5-6 | the "who isn't tracked" note is shown | an explicit note | *"Who made each change isn't tracked yet — the branch shares one login."* | **PASS** |

> Scope stated plainly: I exercised **6 of the 9** kind labels — the ones this course's real history
> produces. The other three (`no-show`, `freelance-drawn`, `freelance-refunded`) were verified by SA at
> code level; I did not manufacture events just to see their labels.

## #2 — the calendar course-picker (TASK-121) — ✅ spot-verified, with one observation

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| 2-1 | the API offers one entry **per course** with context | two entries for a two-course student | `students[]` carries `context.courseId` + subject per course | **PASS** |
| 2-2 | the dropdown names the course before selection | subject + used/size in the label | options render as **`QA-expv · Bike / Scooter / Balance Cruiser (1/4)`** — subject and used/size both present | **PASS** |

### OBS-5 — two courses that match on *every displayed dimension* are indistinguishable — **LOW**, and my data made it visible
My QA student's two courses have the **same subject, same size, same progress**, so both options render as
the **identical string** `QA-expv · Bike / Scooter / Balance Cruiser (1/4)`. The system still picks
correctly (the value is keyed by `courseId`), so nothing is booked wrong — but a human cannot tell which
row is which. **My data is artificial** (I created two near-identical QA courses), and the customer's real
case is two *different* programs, where the label works. Flagging as an edge, not a defect: it would bite
only where a student holds two same-program, same-progress packages. **@Porter** — worth a tiebreaker
(start date?) in the label, or leave it?

## Fast-follow smoke — all ✅

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| 107-1 | the voucher picker omits excluded programs | derived from `voucherAllowedGroups`, not a hardcoded list | server says allowed = `["bike-skate"]` ⇒ excluded = **Onewheel E-Skate · Balance Play (Private) · Balance Play (Group)**. Picker offers `1st Trial · Bike/Scooter/Balance Cruiser · Surfskate · Freeskate · Skateboard · Inline Skate` — **none of the three excluded** | **PASS** |
| 107-2 | an unclassifiable program stays selectable **by design** | the FE must not over-hide; the server is the backstop | `1st Trial` (no price group) is offered — documented in `sellable.ts` ("leave it to the server") | **PASS** |
| 107-3 | …and the server actually refuses it | 4xx with a stated reason | booking a voucher onto `1st Trial` → **409 `VOUCHER_PROGRAM_EXCLUDED` "วอยเชอร์ใช้กับคลาส Onewheel หรือ Balance Play ไม่ได้"** — nothing created | **PASS** |
| 109-1 | the standalone rental entry exists and opens | "Record rental" → a rental form | on the **All bookings** tab: `Record an equipment rental · Equipment * · Hours * · Cancel · Record rental` | **PASS** |
| 102-1 | the settings screen loads | the business rules with their defaults | screen renders; API `teacher_change_notice_days=3 (default 3)` · `checkin_early_minutes=30 (default 30)` | **PASS** |
| 122-1 | a setting can be overridden and **reset** | override takes, reset restores the default | `PUT value=5` → `{value:5, isOverridden:true}` → `DELETE` → **`{value:3, isOverridden:false}`** — back to the default | **PASS** |
| 122-2 | the environment is left as found | identical to the pre-test state | `teacher_change_notice_days = 3, isOverridden=false` ✅ | **PASS** |

## Four harness errors I made (recorded so the results are readable)

Round 1 reported four FAILs that were **mine, not the product's** — each was re-run and passed:
1. **#5** — I parsed `entries`; the payload key is **`events`**. The modal had been rendering correctly all along.
2. **TASK-107** — my regex `/balance/i` matched **"Balance *Cruiser*"**, an **allowed** program. Fixed by
   deriving the excluded set from the server's own `voucherAllowedGroups` instead of guessing from names.
3. **TASK-109** — I looked on the calendar; the standalone rental entry is on the **All bookings** tab.
4. **#2** — I typed into the search box but never opened the **Select** beneath it, which is where the
   per-course entries live.
> Worth stating because a FAIL from a QA harness costs someone a debugging session. A red result is a
> claim about the product, and it has to survive checking before it leaves my desk.

## Test data created (round 2)

| What | Where | Removed? |
|---|---|---|
| One settings override (`teacher_change_notice_days` 3 → 5) to exercise TASK-122's reset | `sid` | ✅ **reset; verified back to value 3 / isOverridden=false** |
| One voucher booking attempt on `1st Trial` | `sid` | ✅ nothing created — refused 409 by design |
| Everything else | — | read-only |

## Verdict — round 2

**#5 → `TEST_PASSED`.** #2 spot-verified (OBS-5 noted). Fast-follow 107 / 109 / 102 / 122 all smoke-clean.
**#3 (timetable search) remains the only open item in the essential set** — in build.

---

# ROUND 3 — 2026-08-10 (evening): #3 accepted → the essential set is complete

`sid` took the scheduler-front deploy carrying **TASK-124 (#3 timetable student search)** and
**TASK-125 (OBS-5 tiebreaker)**. Harnesses: `tests/harness/sid-req038-3-accept.mjs`,
`sid-req038-3-dayview.mjs`. Evidence: `../project-docs/qa-2026-08-10/sid-r38-3-*.png`.

## #3 — timetable student search — ✅ `TEST_PASSED` (this morning's DEF-2 is closed)

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| 3-1 | the control exists on the timetable | a "Find student" box beside Teacher / Type / Badge | **`Find student` · placeholder "Search by student name"**, first in the filter row — the page that had only three filters this morning now has four | **PASS** |
| 3-2 | typing a name filters the visible schedule | only that student's sessions remain | week view: **6 cells → 2**, both `QA-expv-student`; the other four students' sessions disappear | **PASS** |
| 3-3 | the match is case-insensitive | UPPER == lower | `QA-EXP` → 2 · `qa-exp` → 2 | **PASS** |
| 3-4 | a non-matching query really filters | the grid empties (it doesn't silently ignore the box) | `zzzz-no-such-student` → **0 cells** | **PASS** |
| 3-5 | clearing restores | back to the full schedule | 6 → filtered → **6 again** via the clear button | **PASS** |
| 3-6 | it works in the **day** view too, not only the week | the day grid filters the same way | day view on 2026-08-11: 2 cells painted, both survive a matching query, and a non-matching query → **0 cells** | **PASS** |

> Precision on 3-6: both sessions that day belong to the same student, so the *discriminating* evidence
> comes from the week view (6 → 2). What the day view proves is that the filter is **wired into the day
> memo at all** (non-match → empty), which is the thing that could have been missed.

### STANDING RULE — the filter row is now FOUR controls; measured on the deployed build

| Viewport | Find student | Teacher | Type | Badge | Lines used | Narrowest | Page h-scroll |
|---|---|---|---|---|---|---|---|
| 1600 | 218 | 366 | 220 | 220 | 2 | 218 | none |
| 1280 | 208 | 233 | 132 | 132 | 2 | 132 | none |
| 768 | 208 | 207 | 115 | 624 | 3 | 115 | none |
| **375** | **317** | 247 | 247 | 247 | **4** | 247 | none |

✅ **PASS.** Nothing collapses (the REQ-024 defect this rule exists for was **26/36 px**); the row **wraps**
onto more lines as space runs out — 2 → 3 → 4 — and never overflows the page. At 375 every control is
full-width and usable.

## TASK-125 — the OBS-5 tiebreaker — ✅ resolved

My own observation from this afternoon is closed: the two same-program courses now render as
**distinct** strings —
`QA-expv · Bike / Scooter / Balance Cruiser (1/4) · exp 2026-09-15` and
`… · exp 2026-09-21`. A human can now tell them apart. (SA's documented residual — same package bought the
same day → same expiry — is not reachable with my data and remains accepted.)

## Two more harness false-negatives I caught before reporting

1. **The day grid "looked empty".** The week view renders `10:00 | Student`; the **day view renders
   `Student | Subject | TYPE` with no leading time**. My time-anchored regex read the day grid as empty —
   which would have been filed as "the search doesn't work in the day view", a defect that doesn't exist.
2. **"The API says 3 sessions, the grid shows none."** My day-picker counted **cancelled** bookings, which
   the grid correctly does not paint. Fixed to count only painted statuses.
> Both would have been red results pointing at the product. The rule I'm applying: when a check says the
> product is broken, prove the *harness* isn't first.

## Test data created (round 3)

**None.** Filtering and measuring only.

## Verdict — round 3

**#3 → `TEST_PASSED`** (DEF-2 closed) · **OBS-5 → resolved by TASK-125**.
**REQ-038 essential set #1–#5 is now 100% accepted from QA's side:**
#1 ✅ · #2 ✅ · #3 ✅ · #4 ✅ · #5 ✅.
