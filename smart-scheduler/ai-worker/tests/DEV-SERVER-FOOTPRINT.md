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

## 2026-09-01 (Tanya) — REQ-078 (อื่นๆ) acceptance round on `sid`: two bookings, both cancelled

Access via the app's own login form on `som.develyst.online`. No token, cookie or secret written to disk or
printed. No script run on the server, no restart, no redeploy, no setting changed. Evidence: `TEST-064`.

| What | Where | Removed? |
|---|---|---|
| อื่นๆ booking **`QA-078 ประชุมทีม b8`** — teachers **Bank + Dewy + Ek**, 2026-09-02 09:00–10:00, **no student**, charge OFF | `sid` | ✅ **CANCELLED** (`ADMIN_ERROR` + note "QA cleanup - REQ-078 b8"); confirmed gone from all three teacher columns |
| อื่นๆ booking **`QA-078 clash b11`** — teacher **Camp**, 2026-09-01 11:00–12:00, **no student**, charge OFF | `sid` | ✅ **CANCELLED** (`ADMIN_ERROR` + note "QA cleanup - REQ-078 b11"); confirmed gone from the calendar, and the pre-existing Ally session reappeared |
| ⚠️ **Cleanup could NOT be re-verified in the bookings list** — `All bookings` with Type=Other reports "2 found" and renders zero rows (**TEST-064 DEF-3**). Verified on the calendar and in the cancel dialog instead | `sid` | ⚠️ declared, not glossed |
| `QA-078 clash CONFIRMED b12` (Camp 2026-09-08 11:00) | — | ✅ **never created** — refused by the slot guard before any write (DEF-2) |
| `QA-078 charged b14` (with a typed amount) | — | ✅ **never created** — the page crashed before Save on both attempts (DEF-5) |
| **No `bo.movement`** — every fixture had `Charge for this booking` **OFF**, none was confirmed or marked ATTENDED, and both were cancelled well before the 23:30 day-end | — | ✅ |
| **No LINE message** — `Confirm + LINE` never pressed on any booking (AC-16 deliberately left untested; `sid` may share `uat`'s channel and 2 real teachers are linked) | — | ✅ |
| **No row touched that QA did not create.** Ally's 2026-09-01 11:00 session was read only; it was `ON LEAVE` before and after — DEF-4 is a *display* fault, verified against the bookings list | — | ✅ |
| Viewport emulation used for the AC-15 measurements (1600 / 1280 / 768 / 375) | browser only | ✅ reset to desktop |
| `uat` / `frontoffice.develyst.online` | — | ✅ **no contact of any kind** |

## 2026-09-01 (Tanya) — ⏳ REQ-078 money run: **two fixtures LEFT LIVE overnight, owner-approved**

🔴 **This is the one entry in this ledger where the residue is deliberate and is NOT yet retired.** The owner
approved a real `bo.movement` on `sid` so that REQ-078's money path could be proven at all
(`log/2026-09-01.md`, Porter). **It is not closed until he confirms the reversal.**

| What | Where | Removed? |
|---|---|---|
| **F1** — อื่นๆ `QA-078 F1 money test 20B` · teacher **Bank** · 2026-09-01 14:00–15:00 · no student · **Charge ON, typed ฿20** · id **`4014e65e-72f2-4fba-b9f2-788c8f76cd22`** | `sid` | ⏳ **LEFT DELIBERATELY** so the 23:30 day-end posts it (AC-5/AC-9). Expected movement key **`rev:4014e65e-72f2-4fba-b9f2-788c8f76cd22`** = ฿20 / 2000 satang. **The OWNER reverses it in the backoffice** — that is the agreed disposal, and this row stays open until he says it is done. |
| **F2** — อื่นๆ `QA-078 F2 free control` · teacher **Dewy** · 2026-09-01 13:00–14:00 · no student · **Charge OFF** · id **`25d695c3-3ace-4b8d-9689-4c49d75d1a55`** | `sid` | ⏳ **LEFT DELIBERATELY** as the control — it must auto-attend and post **nothing** (AC-4/AC-9). **I cancel it myself** once the result is read; it needs no reversal because it should create no money. |
| Teacher rows | — | ✅ **none touched.** I established that all 10 freelance teachers are `฿0/h · SET PAY BEFORE BOOKING` and **did not set a pay rate**, even though it blocks AC-21 — that is a row I did not create. Raised to Porter instead. |
| Student / parent / course / voucher | — | ✅ **none created.** AC-7/AC-8 were left untested rather than spend a real family's quota or write an unsanctioned course sale. |
| LINE | — | ✅ **no message sent.** `Confirm + LINE` not pressed. AC-16 is held until Porter confirms the owner's own link is live. |
| Catalogue-item charge (AC-6) | — | ✅ **not run.** The approval was for ฿20; a catalogue item posts its own, larger price. Not assumed. |
| `uat` | — | ✅ **no contact of any kind.** |

**Disposal checklist for whoever reads this next:**
1. Owner reverses `rev:4014e65e-72f2-4fba-b9f2-788c8f76cd22` (฿20) and confirms → then F1's row can be closed.
2. Tanya cancels F1 and F2 once AC-4/AC-5/AC-9 are read.
3. If F2 turns out to have posted anything at all, that is a **defect**, not residue — it goes in `TEST-064`.

## 2026-09-01 (Tanya) — 📤 AC-16: **two LINE messages deliberately SENT — to the owner only**

Porter released AC-16 after the owner linked himself on `sid` as teacher **Bank**. This is the first outbound
LINE this project has sent in testing, so it is recorded here in full. Evidence: `TEST-064` §Round 3.

| What | Where | Removed? |
|---|---|---|
| **F3** — อื่นๆ `ประชุมทีม QA-078 F3` · teacher **Bank** (the owner) · 2026-09-02 09:00 · charge **OFF** · id **`94db6903-5470-42b1-a980-1ff3cf0d3ebd`** · **CONFIRMED**, `notification {channel: line, status: queued}` | `sid` | ⏳ left until the owner reports the message text; charge OFF ⇒ auto-attends tonight and **posts nothing**. Cancelled once AC-16 is settled. |
| **F4** — อื่นๆ `ประชุมทีม QA-078 F4 หลายครู` · teachers **Bank + Dewy** · 2026-09-02 10:00 · charge **OFF** · id **`4357f125-1028-429b-944e-2203c25e704b`** · **CONFIRMED**, `notification {channel: line, status: queued}` | `sid` | ⏳ same. |
| **2 LINE pushes sent** | the **owner's** phone only | n/a — deliberate and sanctioned; that is the test |
| 🔴 **The 2 real teachers on the shared channel — NEVER messaged.** Every fixture used **Bank** (= the owner) and **Dewy** (a `sid` fixture with no LINE link). The standing rule was not bent. | — | ✅ |
| Money | — | ✅ **charge OFF on both** ⇒ no `bo.movement` from this round |
| Students · teacher rows · settings · scripts · `uat` | — | ✅ untouched / never contacted |

⚠️ **Known and accepted:** cancelling F3/F4 later may itself push a LINE to the owner. Acceptable (it is him), and
I will report whatever arrives — a cancel notification on an อื่นๆ is worth knowing about.

**Live QA residue on `sid` at the end of this session — four bookings, all deliberate:**
`4014e65e…` (F1, ฿20, **owner reverses the movement**) · `25d695c3…` (F2, free control) ·
`94db6903…` (F3, LINE) · `4357f125…` (F4, LINE multi-teacher). **None is cleaned up yet, on purpose** — each is
waiting on a reading that only tomorrow's day-end or the owner's phone can give.

## 2026-09-02 (Tanya) — REQ-078 final round on `sid`. One fixture created and cancelled; the rest left, deliberately

Evidence: `TEST-064` §Round 4. No script run, no restart, no redeploy, no setting changed, no teacher row edited.

| What | Where | Removed? |
|---|---|---|
| **R4a** อื่นๆ `QA-078 R4 crash retest XYZ2` · **Bank + Camp + Dewy** · 2026-09-03 09:00 · charge OFF · id **`56fa6ee3-43a1-4dd3-bfaa-390b0fac71a2`** · **CONFIRMED** (used for DEF-6's dialog) | `sid` | ⏳ left — see the note below |
| **R4b** อื่นๆ `QA-078 R4 leave-overbook` · **Dewy + Ek** · 2026-09-03 10:00 · charge OFF (used for TASK-239 + DEF-4) | `sid` | ✅ **CANCELLED** (`ADMIN_ERROR`, note "QA cleanup R4 leave-overbook"). Cancelling it also **proved DEF-4 is display-only** — the hidden `Aileen · Inline Skate` session reappeared intact |
| Two clash attempts, อื่นๆ on **Camp** 2026-09-08 11:00 (single- and multi-teacher) | — | ✅ **never created** — refused before any write |
| **1 LINE push** (R4a's confirm) to **Bank = the owner** | owner's phone | n/a — sanctioned; Camp and Dewy have no LINE link, so nobody else was reachable |
| Money | — | ✅ charge **OFF** on both new fixtures ⇒ **no `bo.movement` from this round** |
| The 2 real teachers on the shared channel | — | ✅ **never messaged** |
| Other people's data | — | ✅ untouched. `Aileen · Inline Skate` was read only and is **verified back in place**; the freelance teachers' `฿0/h` rows were read, never edited |
| `uat` | — | ✅ **no contact of any kind** |

### 🔴 Live QA residue on `sid` at park time — 5 bookings, each with a named owner

| id | what | who retires it |
|---|---|---|
| `4014e65e-72f2-4fba-b9f2-788c8f76cd22` | **F1** ฿20 charged, 2026-09-01 14:00, **PENDING** | **owner** reverses `rev:4014e65e-…` if it posts → then Tanya cancels. **Do not cancel first** — it is the only ฿20 evidence |
| `25d695c3-3ace-4b8d-9689-4c49d75d1a55` | **F2** free control, 2026-09-01 13:00, **PENDING** | Tanya, once AC-4/AC-9 are read |
| `94db6903-5470-42b1-a980-1ff3cf0d3ebd` | **F3** LINE single, 2026-09-02 09:00, **CONFIRMED** | Tanya, once the owner reports the message text |
| `4357f125-1028-429b-944e-2203c25e704b` | **F4** LINE multi, 2026-09-02 10:00, **CONFIRMED** | Tanya, as F3 |
| `56fa6ee3-43a1-4dd3-bfaa-390b0fac71a2` | **R4a** 3-teacher, 2026-09-03 09:00, **CONFIRMED** | Tanya — purpose served |

⚠️ **Why they are still standing — a decision, not neglect.** F3/F4/R4a are **CONFIRMED**, and cancelling a
confirmed booking may push a LINE **to the owner's own phone** (he is linked as teacher **Bank**). Retiring three
of them now would send him three cancellation notices for zero test value while he is still reading the two
messages AC-16 depends on. **"Never message a real person unnecessarily" outranks tidy housekeeping.**
F1 must additionally survive until the movement question is settled. **Porter has the call (TEST-064 Q16); one
word and I retire all three in a single pass.**

## 2026-09-02 (Tanya) — REQ-079 testable slice: **READ-ONLY. Nothing created.**

Evidence: `TEST-065`. Post-`0030`/`0031` build on `sid`.

| What | Where | Removed? |
|---|---|---|
| **Nothing was created, modified or deleted** | `sid` | ✅ n/a |
| One `Clear LINE link` dialog **opened and cancelled** on a real parent row (phone `0897946312`) | `sid` | ✅ **nothing written** — it offered only `Cancel`, and a real family's link state is not mine to change in any case |
| Read-only page sweep: Schedule · Teachers · People · Bookings/Students · Overview · LINE links | `sid` | ✅ reads only |
| **No LINE message sent** · no booking · no student · no teacher row · no setting · no script · no restart | — | ✅ |
| 🔴 **Newly visible and recorded: `Haris` — a real teacher — is LINE-linked on `sid`** (the two linked accounts are `Bank` = the owner, and `Haris`). The standing rule that he is **never** messaged in rehearsal still binds. **Every fixture I have ever confirmed used Bank, Camp, Dewy or Ek — never Haris.** | — | ✅ |
| `uat` | — | ✅ **no contact of any kind** |

**Live residue is unchanged from 09-02's earlier round** — the five REQ-078 fixtures, their ids and who retires
each, are in `TEST-064` §Park note. Nothing added, nothing retired today.

## 2026-09-03 (Tanya) — REQ-079 verdict round: **READ-ONLY. Nothing created.**

Evidence: `TEST-065` §Round 2. The owner ran the LINE side from his device; I read the database/admin side.

| What | Where | Removed? |
|---|---|---|
| **Nothing was created, modified or deleted** | `sid` | ✅ n/a |
| `People` searches: `QA` · `QA ทดสอบ` · `adwa` · `เมนู` · `มิลล่` · `0900000092` — the AC-9 / AC-20 orphan-record check | `sid` | ✅ reads only. **All three abandoned-flow names return no record; parent count unchanged at 111** |
| **Two `Clear LINE link` dialogs opened and CANCELLED** — `0897946312` (not linked) and **`0900000092` (linked)** | `sid` | ✅ **nothing written** |
| 🔴 **I did NOT press `Clear LINE link` on the linked family.** That link is the **owner's own live account**, the fixture he is using to test REQ-079 — clearing it would destroy his campaign mid-run and modify data I did not create. **His to run, when he is done with it** | `sid` | ✅ deliberate |
| No booking · no student · no teacher row · no setting · no script · no restart · **no LINE message sent** | — | ✅ |
| **AC-18 rehearsal boundary holds:** the two linked accounts on `sid` are **`Bank` (the owner)** and **`Haris`** (a real teacher). Every fixture I have ever confirmed used Bank, Camp, Dewy or Ek — **never Haris** | — | ✅ |
| `uat` | — | ✅ **no contact of any kind** |

**Live residue unchanged** — the five REQ-078 fixtures, ids and owners, in `TEST-064` §Park note. Nothing added
or retired today.

## 2026-09-03 late (Tanya) — ruling on the owner's night run: **READ-ONLY**

Evidence: `TEST-065` §Round 3.

| What | Where | Removed? |
|---|---|---|
| **Nothing created, modified or deleted** | `sid` | ✅ n/a |
| Two `Clear LINE link` dialogs **opened and CANCELLED** — `0900000092` (now shows **not linked**) and `0905622548` (now shows **1 linked**). **I pressed `Clear` on neither** | `sid` | ✅ nothing written |
| `People` searches on both phone numbers — the independent check that the owner's clear→rebind actually landed in the data at **both** ends | `sid` | ✅ reads only |
| No booking · no student · no LINE message · no setting · no script · no restart | — | ✅ |
| `uat` | — | ✅ **no contact of any kind** |

📌 **Verified as a by-product, and worth recording:** clearing a family's link **kept all three of its students**
(`มิลล่า` · `มิลลิม` · `asda`). The dialog's promise — *"Students, bookings, notes and message history are all
kept"* — is **true**, not just displayed. That is the sentence an admin reads before pressing a red button.

**REQ-078's five live fixtures (`TEST-064` §Park note) are unchanged.** Nothing added or retired.

## 2026-09-05 (Tanya) — REQ-078 ฿20 money round, **correct fixture shape**: two bookings LEFT LIVE for the 18:30 pass

Evidence: `TEST-064` §Round 5. Server clock read **14:35** at the start; the day-end is **18:30** (owner closed
`C-03` — my earlier 23:30 was Porter's stale number), and it selects **`CONFIRMED` only**.

| What | Where | Removed? |
|---|---|---|
| **M1** — อื่นๆ `QA-078 M1 money 20B` · teacher **Ek** · 2026-09-05 **15:00–16:00** · no student · **Charge ON ฿20** · **CONFIRMED** · id **`5788d6fe-6099-40a4-8440-712ed7ceac5e`** | `sid` | ⏳ **LEFT DELIBERATELY** to post at 18:30. Expected movement key **`rev:5788d6fe-6099-40a4-8440-712ed7ceac5e`** = ฿20. **Owner reverses**; then Tanya cancels |
| **M2** — อื่นๆ `QA-078 M2 free control` · teacher **Kowjoe** · 2026-09-05 **15:00–16:00** · no student · **Charge OFF** · **CONFIRMED** · id **`6ac8c7d4-95e0-4370-bf93-0534df5ed5de`** | `sid` | ⏳ **LEFT DELIBERATELY** as the control — must post **nothing**. Tanya cancels once read |
| 🟢 **No LINE message reached anyone.** Both confirms returned `notification {channel: line, status: **skipped**, reason: "ผู้รับยังไม่ผูก LINE userId"}` — Ek and Kowjoe are unlinked **by deliberate choice**. **Bank (the owner) and `Haris` (a real teacher) were not used** | — | ✅ |
| No student · no parent · no teacher row · no setting · no script · no restart | — | ✅ |
| 🔴 **`uat` — no contact of any kind.** The owner's 09-04 read grant is live in principle, but the frontoffice `PRODUCTION_HOSTS` guard still refuses and **I did not look for another route around it** (`QA.md`). Backoffice `uat` was not touched either — the absence of a guard there is not permission | — | ✅ |

### 🧹 Superseded residue — F1/F2 are now KNOWN-DEAD, not merely unread
**`4014e65e-…` (F1, ฿20) and `25d695c3-…` (F2, free)** sit `PENDING` on 2026-09-01. With the selection rule now
known (**`CONFIRMED` only**), **they can never be swept** — no amount of waiting changes that. **M1/M2 supersede
them.** They should be cancelled; recorded here so no future session mistakes them for live evidence.

**Also still live from earlier rounds:** `94db6903-…` (F3, LINE) · `4357f125-…` (F4, LINE multi) ·
`56fa6ee3-…` (R4a, 3-teacher) — ids and owners in `TEST-064` §Park note, unchanged.
