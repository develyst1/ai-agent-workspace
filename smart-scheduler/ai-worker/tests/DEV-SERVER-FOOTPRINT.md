# DEV-SERVER FOOTPRINT — `sid` (som.develyst.online)

> Owner: Tanya (QA). The single running ledger the stakeholder asked for
> (*"ต้อง track ได้"*). Everything I create on `sid`, and whether it is gone.
> One place Porter can open to answer *"what has QA touched?"* without reading
> every TEST file.
>
> **Rules I follow (Porter [morning]/[afternoon] 2026-08-02):** every record I
> create carries a visible **`QA-`** marker; I never edit a row I did not create;
> I never message a real person; I clean up and declare what I could not.
> `sid` DB host = `154.197.124.206` (confirmed dev by the owner).

## Records created

| Date | What | Marker | TEST | Removed? |
|------|------|--------|------|----------|
| 2026-08-02 | Parent `1405dbbc-4466-40f6-a060-0d08d9f62930` phone 0900000091 | name **QA-expv-parent**, note "QA expired-voucher test…" | TEST-022b | ❌ **no delete endpoint** — suspend is the only off-switch. Left in place, QA-marked. |
| 2026-08-02 | Student `be5192a8-9634-4b81-a1c8-cb7a7f855995` under that parent | name **QA-expv-student**, nickname **QA-expv** | TEST-022b | ❌ no delete endpoint. Left in place, QA-marked. |
| 2026-08-02 | Voucher `13c369bc-23a5-4e89-95b0-92c7cbf8199f` 5h, expiry forced to 2026-04-05 (via a past first booking) | belongs to QA-expv-student | TEST-022b | ❌ no delete endpoint. **Expired + 0/5 used** → inert; cannot be spent (that is the test). |
| 2026-08-02 | Revenue movement from the voucher sale (`createVoucher` → `recordSale`, if wired on `sid`) | via QA voucher above | TEST-022b | ❌ **cannot remove** — no delete path for `bo.movement`. Small residue on the money ledger; flagged to @Porter. |
| 2026-08-02 | Booking #1 `e009b01c-e12b-4d3e-b15b-8c55831f0c2c` (voucher, 2026-01-05 09:00) | note "QA expired-voucher test" | TEST-022b | ✅ **CANCELLED** (status→CANCELLED; the softest removal the API offers). |
| 2026-08-02 | Booking #2 (2026-08-05) — **never created** (the 400 under test) | — | TEST-022b | ✅ n/a — rejected. |

## Rejected/rolled-back write attempts (created nothing — logged for traceability)

| Date | Attempt | Result | Residue |
|------|---------|--------|---------|
| 2026-08-02 | `POST /courses` Onewheel **size 10** (forbidden combo) | 400 "ไม่มีแพ็กเกจ 10 ชั่วโมง" — refused **before** the DB transaction | none |
| 2026-08-02 | `POST /courses` Balance Play (Private) **size 4** (forbidden combo) | 400 "ไม่มีแพ็กเกจ 4 ชั่วโมง" — refused **before** the transaction | none |
| 2026-08-02 | `POST /courses` Onewheel **size 6** (allowed) with a **nonexistent** student id | 400 "ข้อมูลอ้างอิงไม่ถูกต้อง" — passed the sellable gate, failed at student resolution **inside** the tx → rolled back | none (atomic tx rollback) |

## Notes

- All entries above are `POST` attempts that the server **rejected**; no course,
  no booking, and no `bo.movement` revenue row was written. Recorded here anyway
  because "attempted a write on `sid`" is exactly what the owner wants traceable.
- The size-6 rollback relies on transaction atomicity (Drizzle/postgres-js). If a
  future audit ever finds an orphaned Onewheel size-6 course with no student, this
  is the entry to check it against.

## 2026-08-04 (Tanya) — NO FOOTPRINT

Nothing was created, modified or read on `sid` this session: the access file (`H:\sm-test-access.txt`)
is unreachable, so no login and no backend token were ever obtained. All work was **local** (`next dev`
on :3016 in mock mode, stopped at end of session). No DB writes anywhere. Evidence screenshots live in
`../project-docs/qa-2026-08-04/` and contain no credential, cookie or token.

## 2026-08-04 (Tanya) — SECOND SESSION, after access was restored: one course package created

Access file relocated to `C:\Users\Admin\sm-test-access.txt`; TASK-090's `mint-session.mjs` used as
written. **No token, cookie or secret was written to disk or printed.**

| What | Where | Removed? |
|---|---|---|
| Course package `6710384c-19d3-4afb-997b-1f56f9063c11` (4 sessions, teacher Bank, Bike/Scooter/Balance Cruiser) for **QA-expv-student** — created for the TASK-099 behavioural pass | `sid` | ❌ **no delete endpoint exists.** Left in place; QA-owned student only |
| That course's own session edits: 2 moves, 1 mark-absence (→ SICK_LEAVE + appended EXTENDED), 1 insert, 2 cancels, 1 confirm→attend on a past-dated session | `sid` | ❌ same — they are that course's sessions |
| A `POST /courses` attempt that returned 409 SLOT_TAKEN | `sid` | ✅ nothing created (atomic refusal) |
| Booking attempt on the expired QA voucher via the UI | `sid` | ✅ nothing created — the student was never selectable (FIND-1) |
| **Not** created: any teacher/roster row (REQ-009 was not run), any LINE message, any change to another person's data | — | — |

## 2026-08-04 (Tanya) — THIRD SESSION: post-deploy acceptance of REQ-030 / REQ-037 / OBS-3 + REQ-009

| What | Where | Removed? |
|---|---|---|
| Course package `11cca516-1c1e-46d0-bd77-d70a1689f420` (4 sessions, QA-owned `QA-expv-student`) + its own edits: moves, one planned absence, one insert, several cancels, one delivered-then-cancelled row | `sid` | ❌ no delete endpoint — left in place, QA-owned rows only |
| Two **extra paid sessions** (`SINGLE_SESSION`) on the QA courses, created for REQ-037 — both **cancelled** as part of the test | `sid` | ❌ rows remain (CANCELLED), QA-owned only |
| Throwaway teachers **`QA-req009`, `QA-req009b`, `QA-req009c`, `QA-req009d`** (Porter-authorized; three extras were created while fixing harness row-targeting) | `sid` | ✅ **ALL ARCHIVED.** Roster verified after: FULL_TIME 7 · PART_TIME 6 · FREELANCE 10 |
| 🔴 **Near-miss, declared:** a first harness attempt opened the **type-change dialog on teacher `Bank`** (wrong row) and pressed Save with the type unchanged | `sid` | ✅ **nothing written** — the FE returns early when the type is unchanged; verified directly: Bank is still FULL_TIME. Harness fixed so it cannot leave a row again |
| Dry-run previews (`/plan/preview`) — many | `sid` | ✅ by design: the transaction is rolled back, nothing persists |
| No LINE message sent · no other person's row modified · production (`frontoffice.develyst.online`) never touched | — | — |

## 2026-08-10 (Tanya) — REQ-038 verify rounds: read-only apart from one reversible settings round-trip

| What | Where | Removed? |
|---|---|---|
| Morning round (#3 / #4 / voucher plan shape) | `sid` | ✅ **nothing created** — every check was a read |
| Afternoon round (#5 acceptance, #2 spot-verify, fast-follow smoke) | `sid` | ✅ read-only except the two rows below |
| `teacher_change_notice_days` overridden 3 → 5 to exercise TASK-122's reset | `sid` settings | ✅ **RESET; verified back to `value:3, isOverridden:false`** — the environment is exactly as I found it |
| One voucher-booking attempt on `1st Trial` (expected refusal) | `sid` | ✅ nothing created — **409 `VOUCHER_PROGRAM_EXCLUDED`** |
| No teacher/roster write · no LINE message · production never touched | — | — |

## 2026-08-10 evening (Tanya) — #3 acceptance: READ-ONLY

Filtering and pixel measurement only. **Nothing created, nothing modified, no LINE message.** The settings
override from the afternoon round remains reset (`teacher_change_notice_days = 3, isOverridden=false`).

## 2026-08-11 (Tanya) — customer-prod: NO CONTACT

The post-deploy smoke was routed to QA on **`frontoffice.develyst.online` (production)**. I did not run it
and **made no request of any kind to that host — not a page load, not an API call, not a status check.**
Reason: `QA.md` ("Production — never; not read, not write, not 'just a GET'"), the workspace QA rule, and
TASK-090's built-in `PRODUCTION_HOSTS` refusal, **which I did not modify or bypass**. Delivered
`CLICK-SCRIPTS-owner.md` **Script 6** for the owner instead. No footprint anywhere this session.

## 2026-08-11 (Tanya) — customer-prod PHASE 1: authorized, and ZERO footprint

Ran under the human's in-session authorization. Access via the app's **own login form**;
`mint-session.mjs` was **not run, not edited, not bypassed**.

| What | Where | Removed? |
|---|---|---|
| Reads: students / courses / vouchers / bookings / teachers / settings / sellable-packages | customer-prod | ✅ nothing created |
| Calendar filter-row width measurement at 1600 / 1280 / 768 / 375 | customer-prod | ✅ read-only |
| Voucher Program picker opened (never submitted) · rental form opened then **Cancelled** (never recorded) · settings screen viewed (**no override on prod**) | customer-prod | ✅ nothing written |
| **#2 / #4 data — deliberately NOT created.** The app has no delete for students/parents/courses/vouchers/bookings, so the "remove what you create" condition could not be met. Held for a decision. | — | n/a |
| No LINE message · no teacher-change flow · no row touched that QA did not create (QA created none) | — | — |

## 2026-08-11 (Tanya) — customer-prod PHASE 2 + SECTION E: data created, **cleanup waived by the human**

The human approved creating QA-owned data for #2/#4 and **explicitly waived cleanup** — he will re-run the
reset to return prod to a clean slate. The app has no delete for these rows in any case (only
booking-cancel and parent-suspend), which is why the waiver was needed.

| What | Where | Removed? |
|---|---|---|
| Parent + student **`QA-prod-student`** (`QA-prod`, phone 0900000092) | customer-prod | ❌ by agreement — reset to follow |
| **2 course packages** (Bike / Scooter / Balance Cruiser · Surfskate), 4 sessions each | customer-prod | ❌ by agreement |
| **1 voucher** (5 h) + **1 voucher booking** | customer-prod | ❌ by agreement |
| Section-E edits **on those rows only**: 1 move, 1 planned absence (+ appended make-up), 1 insert, 1 live cancel, 1 delivered-then-cancelled-with-reason, 1 extra paid session (cancelled) | customer-prod | ❌ by agreement |
| Full id list for the reset to verify against | `../project-docs/qa-prod-2026-08-11/phase2-created.json` | — |
| **No LINE message · no teacher-change flow · no row touched that QA did not create · TASK-090 guard untouched** | — | — |

## 2026-08-11 (Tanya) — customer-prod REQ-041 visual verify: READ-ONLY

Human-authorized in-session for a post-deploy visual check. Access via the app's **own login form**;
`mint-session.mjs` **not run, not edited, not bypassed**.

| What | Where | Removed? |
|---|---|---|
| Page loads + computed-style reads (header, Teachers, Reports, Calendar, Bookings, Vouchers) | customer-prod | ✅ nothing created |
| One hover on a Teachers block · one plan modal opened and closed with Escape | customer-prod | ✅ nothing submitted |
| Two throwaway `<div>`s injected and removed inside a single `evaluate` (CSS probe) | customer-prod (browser only) | ✅ never persisted |
| **No writes · no LINE · no teacher-change flow · no row touched** | — | — |
| Pre-existing QA residue from the 2026-08-11 phase-2 run is unchanged and still listed in `../project-docs/qa-prod-2026-08-11/phase2-created.json` (owner clears it) | customer-prod | ❌ by agreement |

## 2026-08-30 (Tanya) — REQ-058 AC-2/AC-3 pass on `sid`: two bookings, both cancelled

Access via the app's own login form on `som.develyst.online`. No token, cookie or secret written to disk or
printed. No script run on the server, no restart, no redeploy, no setting changed.

| What | Where | Removed? |
|---|---|---|
| Booking `QA-req072-fixture` · **1 HR** · `Bike & Scooter` · teacher Bank · 2026-08-31 09:00–10:00 · session note "QA REQ-058 AC-3 test 2026-08-30 - delete after" | `sid` | ✅ **CANCELLED** (`ADMIN_ERROR` + note "QA cleanup - REQ-058 AC-3 test row"); verified `CANCELLED` in Bookings → All bookings |
| Booking `QA-req072-fixture` · **1st Trial** · `Surfskate & Freeskate` · teacher Bank · 2026-09-01 09:00–10:00 · session note "QA REQ-058 AC-3 trial test 2026-08-30 - delete after" | `sid` | ✅ **CANCELLED** (`ADMIN_ERROR` + note "QA cleanup - REQ-058 AC-3 trial test row"); verified `CANCELLED` in the same list |
| Course-plan price previews (`Surfskate & Inline Skate` sizes 4/6/10; `Surfskate` size 6) | `sid` | ✅ **nothing created** — form read, then **Cancel**; "Generate plan" never pressed |
| **No** new student or parent — the QA-owned `QA-req072-fixture` from an earlier round was reused deliberately (students have no delete path) | — | — |
| **No** `bo.movement`: neither booking was confirmed or marked ATTENDED, so nothing posted to the money ledger | — | ✅ |
| **No LINE message** — `Confirm + LINE` never pressed | — | ✅ |
| **No row modified that QA did not create today**; the pre-existing `QA-req072-fixture` Onewheel course sessions were read only | — | ✅ |
| `uat` / `frontoffice.develyst.online` — **no contact of any kind** | — | ✅ |

Evidence: `TEST-063-req058-nine-programs-bookable.md`.
