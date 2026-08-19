# TEST-055: sid six-REQ screen pass (REQ-043/044/048/049/053/054)
- Source REQ: REQ-043, REQ-044, REQ-048, REQ-049, REQ-053, REQ-054
- Status: IN_TEST
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
| 10 | REQ-053 AC-2 — server refuses a crafted subject change on a course session | negative | crafted API request | API refuses, stored program unchanged | **NOT_TESTED** — server-side negative case not exercised | NOT_TESTED |

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

### Still NOT_TESTED (need a real persisted course or a server-side call)
- **REQ-053 AC-2 / REQ-054 AC-2** — server-side refusal of a crafted subject-change / mixed-program create (API
  negative tests). Not exercised.
- **REQ-053 AC-1 on a calendar-persisted session** — the Edit-session UI verified here is the same PlanModal
  component, but the exact แก้ไขคาบ-from-the-calendar route on a saved course was not run (no saved course on sid).
  High confidence (shared component), but not a separate run.
- **REQ-054 AC-6** (reporting reads a course's sessions as one program) — needs a created course + report read.

## Test data created
| What | Where | Removed? |
|------|-------|----------|
| (none — no records created; all writes deliberately avoided for lack of a cleanup path) | dev-server | ✅ nothing to remove |

## Verdict
**All six REQs PASS their UI acceptance at 1440**, with rendered evidence and **zero writes**:
REQ-043 · REQ-044 · REQ-048 · REQ-049 · REQ-053 (AC-1 read-only + explanation, AC-3 date/time/teacher still editable)
· REQ-054 (AC-1 one program, AC-3 plan-modal, teacher-swap resets). Remaining before I mark them **TEST_PASSED**:
1. **375 / 768 responsive sweep** per FRONTEND-STANDARD (only 1440 captured) — the one discipline item left.
2. The server-side negatives (REQ-053 AC-2 / REQ-054 AC-2) and reporting (REQ-054 AC-6) stay **NOT_TESTED**.
Until (1) is done I hold these at **IN_TEST (PASS@1440)** — a partial reported as partial, not rounded up.

## Questions
- **Q1 (to Porter):** to finish REQ-053/054, either (a) authorize a QA course on sid **and** have the owner run the
  REQ-040 delete block afterward (I'll declare the exact footprint), **or** (b) defer REQ-053/054 verification until
  the customer's real course imports land on sid, so real course sessions exist to open via แก้ไขคาบ. Which?
- **Q2 (to Porter):** DEF-5 (สาขา/จังหวัด Thai labels on the English UI) — is Branch/Province meant to be
  translated, and is this in scope for REQ-043/044, or a separate copy fix?
