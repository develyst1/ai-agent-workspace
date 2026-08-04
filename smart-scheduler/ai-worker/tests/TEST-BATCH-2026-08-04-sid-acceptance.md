# TEST-BATCH 2026-08-04: batch acceptance on `sid` — REQ-009 / 020 / 022 / 023 / 024 / 026
- Source REQs: REQ-009, REQ-020, REQ-022, REQ-023, REQ-024, REQ-026
- Status: mixed — see the verdict table
- Environment: **`sid` (som.develyst.online)**, authenticated via TASK-090 `mint-session.mjs`
- Tested: 2026-08-04 by Tanya

## Scope

The batch Porter routed after access was restored. Everything below was run against the deployed `sid`
build in a real compositing Chrome plus authenticated API calls. **No LINE message was ever triggered** —
those channels point at real people (QA rule 4), so every LINE-delivery AC is reported as `NOT TESTED`
rather than guessed at.

Harnesses: `tests/harness/sid-session.mjs`, `sid-batch-acceptance.mjs`, `sid-painted-checks.mjs`,
`sid-req022-expired-voucher-alert.mjs`. Evidence: `../project-docs/qa-2026-08-04/`.

## Verdicts

| REQ | Verdict | Basis |
|---|---|---|
| **REQ-024** | ✅ **TEST_PASSED** | the last open gate (painted date inputs) now measures **176 px** at all four widths; API 4/4 |
| **REQ-026** | ✅ **TEST_PASSED** | Stage 1 nav confirmed on the deployed build |
| **REQ-023** | 🟡 **PARTIAL** — web half PASS, LINE half NOT TESTED | the panel shows a real send stamp + counts; I may not trigger a send to real admins |
| **REQ-020** | 🟡 **PARTIAL** — screen/API PASS, the claim→approve path NOT TESTED | the pending queue is empty and only a real LINE claim can fill it |
| **REQ-022** | 🔴 **FINDING, no verdict** | the expired-voucher red alert is **unreachable through the UI** — see below |
| **REQ-009** | ⛔ **NOT TESTED** | needs writes to the shared teacher roster on `sid`; my sandbox refused, and I did not work around it |

## Cases

### REQ-024 — Bookings page search & filtering (closes the last gate)

| # | Case (AC) | Expected | Actual | Result |
|---|---|---|---|---|
| 24-1 | 🔴 **TASK-081 — the CUSTOM date inputs are usable** (the whole reason this stayed open) | ~176 px, not the old 26/36 px slivers | **From 176 px · To 176 px at 1600, 1280, 768 AND 375**; no page overflow; they drop to their own line below 1280 instead of crushing | **PASS** |
| 24-2 | all-bookings list responds | 200 + paged shape | 200, `total=89` | **PASS** |
| 24-3 | search matches **nickname AND parent phone** | both find the same child | nickname `QA-expv` → 8 · parent phone `0900000091` → 8 | **PASS** |
| 24-4 | date header is a **sort, not a filter** | first row flips, total unchanged; nonsense rejected | asc `2026-01-05` / desc `2026-09-23`, totals **89 = 89**, `sort=NONSENSE` → **400** | **PASS** |
| 24-5 | arbitrary custom range | every row inside the window | 28 rows for 2026-08-01…08-31, **0** outside | **PASS** |

### REQ-026 — nav tidy (Stage 1)

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| 26-1 | the extra "Dashboard" entry is gone | not listed | nav = Schedule · Teachers · People · LINE links · Bookings/Students · Badges · SOM dashboard · Needs attention · Daily report — **no bare "Dashboard"** | **PASS** |
| 26-2 | the three keepers survive | present and loading | SOM dashboard ✅ · Needs attention ✅ (loaded, see 23-1) · Daily report ✅ | **PASS** |

### REQ-023 — daily admin digest

| # | Case (AC) | Expected | Actual | Result |
|---|---|---|---|---|
| 23-1 | the panel shows a **real** last-run stamp | a timestamp, not the red "never run" | **"Digest last sent: 4 Aug 2026, 08:00"** — the scheduled job ran this morning | **PASS** |
| 23-2 | each triggered check carries a count + enough detail | counts + names | "Teachers not linked to LINE **21**" (named list) · "Students with incomplete info **11**" (named list) | **PASS** |
| 23-3 | one LINE message, in the morning | one push to admins | **NOT TESTED** — the recipients are real admins; I may not send | **NOT TESTED** |
| 23-4 | nothing outstanding ⇒ no message | silence on an empty day | **NOT TESTED** — same reason (and today is not empty) | **NOT TESTED** |
| 23-5 | re-running the same day doesn't spam | idempotent via `job_runs` | **NOT TESTED** — re-running the job is a send | **NOT TESTED** |

### REQ-020 — LINE pairing approval & link control

| # | Case (AC) | Expected | Actual | Result |
|---|---|---|---|---|
| 20-1 | the staff screen exists | pending requests + controls | `/scheduler/link-requests` loads; **Unlink** control present | **PASS** |
| 20-2 | the pending-request API exists | lists queued claims | `GET /teacher-link-requests` → **200 `{"items":[]}`** | **PASS** (surface only) |
| 20-3 | a LINE claim **queues** instead of granting access | a pending row appears | **NOT TESTED** — the queue is empty and only a real LINE claim can create one | **NOT TESTED** |
| 20-4 | approve / reject / pick-on-collision | staff resolves the claim | **NOT TESTED** — nothing to resolve without 20-3 | **NOT TESTED** |
| 20-5 | unlink stops pushes | the account stops receiving | **NOT TESTED** — would affect a real person's link | **NOT TESTED** |

### REQ-022 — the expired-voucher red alert (four rounds open)

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| 22-1 | the Voucher tab renders type-first | tabs + per-tab form | Trial · Single session · Weekly course · **Voucher**; the Voucher tab shows Program and states *"A voucher booking doesn't pick a teacher or fixed time"* | **PASS** |
| 22-2 | booking on an **expired** voucher shows a red alert with the server's reason | red alert "วอยเชอร์หมดอายุแล้ว" | **Could not be reached — see the finding** | **BLOCKED** |
| 22-3 | (proxy) the shared refusal surface really does print the server's reason | a red alert carrying the server text | ✅ proven the same day in the plan modal: **409 `SLOT_TAKEN` → the alert rendered "ครูมีคาบในช่วงเวลานี้แล้ว"** (TEST-099 R2-5) | **PASS** |

## Finding

### FIND-1 — the expired-voucher red alert is **unreachable through the UI**, because eligibility hides the voucher first — **needs Porter's ruling, not a defect verdict**
- Steps: New booking → **Voucher** tab → student search `QA-expv` → **no options at all**.
- Why: `GET /students/eligible?type=VOUCHER` returns only students with a *live* voucher (2 students,
  expiries 2026-11-18 and 2026-10-21). My `QA-expv-student`, whose voucher expired 2026-04-05, is
  **filtered out server-side** — which is REQ-022's own design ("eligibility is a backend answer").
- So the promise is being kept by **prevention**, not by the alert: staff cannot select an expired
  voucher, so the alert only fires on a race (a voucher expiring between picking and saving).
- Evidence: `GET /vouchers?q=QA` → the expired voucher exists (5 h, expiry 2026-04-05, 0 used);
  `GET /students/eligible?type=VOUCHER` → it is absent. Screenshots `sid-req022-*.png`.
- The backend refusal itself was already proven (TEST-022b, `400 "วอยเชอร์หมดอายุแล้ว"`), and the
  *generic* reason-surfacing path is now proven live (22-3). **@Porter: does REQ-022 close on
  prevention + the proven shared alert path, or does the alert itself have to be demonstrated?** I am
  not deciding that — it is an AC-intent question.

## Test data created

| What | Where | Removed? |
|---|---|---|
| Course package `6710384c…` (4 sessions) for **QA-expv-student**, created for the TASK-099 behavioural pass | `sid` | ❌ **no delete endpoint exists.** Left in place: 1 ATTENDED (past-dated 2026-08-01), 1 SICK_LEAVE, 2 PENDING, 1 EXTENDED, 2 CANCELLED. QA-owned rows only |
| Booking edits inside that course (moves, one absence, one insert, two cancels) | `sid` | ❌ same — they are that course's own sessions |
| Nothing else | — | no other row was created or modified; **no LINE message sent**; no teacher/roster write (REQ-009 was not run) |

## Verdict

- **REQ-024 → `TEST_PASSED`** · **REQ-026 → `TEST_PASSED`**
- **REQ-023 → PARTIAL** (web half passed; the three LINE-delivery ACs stay `NOT TESTED` — they require
  sending to real admins)
- **REQ-020 → PARTIAL** (screen + endpoint exist; the claim→approve/reject/collision path stays
  `NOT TESTED` — it needs a real LINE claim, i.e. the owner's hands)
- **REQ-022 → no verdict**, pending Porter's ruling on FIND-1
- **REQ-009 → `NOT TESTED`** (below)

## Questions

1. **@Porter — REQ-009 needs an explicit go-ahead.** Testing it honestly means creating a **QA teacher**
   on `sid`, giving it a freelance budget, and changing its type — i.e. writing to the shared **teacher
   roster**. My sandbox refused that write, and I did not work around it. Options: (a) authorize a
   `QA-req009` teacher (I archive it afterwards), or (b) the owner runs it on a real teacher and tells
   you what the confirmation said. Until then REQ-009 is `NOT TESTED` — the code path exists
   (`closeFreelanceCeiling`, `scheduler.service.ts:304`), but reading code is not testing.
2. **@Porter — FIND-1** (above): does REQ-022 close on prevention?
3. **@Porter — REQ-020 / REQ-023 LINE halves** need the owner's phone. I can write click-scripts for
   both if you want them for her next sitting.
