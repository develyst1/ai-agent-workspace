# TEST-REQ030-BATCH: post-deploy acceptance on `sid` — REQ-030 · REQ-037 · OBS-3 (+ REQ-009)
- Source REQs: REQ-030 (SPEC-028), REQ-037 (SPEC-033 §4), OBS-3=(A), REQ-009
- Status: **REQ-030 `TEST_PASSED` · REQ-037 `TEST_PASSED` · OBS-3 `TEST_PASSED` · REQ-009 `TEST_PASSED`**
- Environment: **`sid` (som.develyst.online)** — the live deploy the owner ran today; authenticated via
  TASK-090 `mint-session.mjs` (production-refusal guard intact; `frontoffice.develyst.online` never touched)
- Tested: 2026-08-04 by Tanya

## Scope

The full acceptance of the batch that just went live, driven **both** through the API and through a real
painted browser. Harnesses (committed, re-runnable):
`tests/harness/sid-req030-live-acceptance.mjs` · `sid-r30-notice-and-extra.mjs` · `sid-r30-ui-acceptance.mjs` ·
`sid-r30-ui-extra-and-cancel.mjs` · `sid-req009-ui-warning.mjs` · `sid-verify-roster-untouched.mjs`.
Evidence: `../project-docs/qa-2026-08-04/sid-r30-*.png`, `sid-ui-*.png`, `sid-ui2-*.png`,
`sid-req009-ui-*.png`, and the `*-result.json` transcripts.

> ⏱ **Clock note for whoever reads the evidence later:** this machine's clock reads **2026-08-10**, while
> the team's log file for this work is `2026-08-04.md`. All relative dates in the evidence (e.g. "a class
> tomorrow" = 2026-08-11) come from the machine clock, so they are internally consistent — but the two do
> not agree, and the 3-day-notice results only make sense against the machine clock. Flagged to @Porter.

## REQ-030 — the editable course plan

| # | Case (AC) | Expected | Actual | Result |
|---|---|---|---|---|
| 30-1 | the plan DTO carries the new fields | `insertable` + per-row `bookingType` | `insertable=false` on a fresh full course; every row `bookingType=COURSE_PACKAGE` | **PASS** |
| 30-2 | edit/move applies, with availability + clash | the chosen slot is written; the clash view names the owner | move applied; availability shows `BANK · BOOKED · QA-EXPV` (red) + `NO BUDGET` (orange) + free (green) | **PASS** |
| 30-3 | a clashing move is refused with the server's words | 4xx + the reason painted | **409 `SLOT_TAKEN` "ครูมีคาบในช่วงเวลานี้แล้ว"**, shown in the modal's red alert | **PASS** |
| 30-4 | **planned absence keeps the course at size** | the absent row leaves, one appended takes its place | counted rows **4 → 4**; statuses `PENDING, SICK_LEAVE, PENDING, PENDING, EXTENDED`; `appended:["3f2e5074…"]` | **PASS** |
| 30-5 | insert places the trailing session in the chosen slot | a row appears there; size unchanged | placed at the requested date/time; counted rows **4 → 4** | **PASS** |
| 30-6 | **teacher-change 3-day notice** | 4xx when the class is inside the window | class **tomorrow**, Bank → Camp → **409 `TEACHER_CHANGE_TOO_LATE` "ต้องเปลี่ยนครูล่วงหน้าอย่างน้อย 3 วันก่อนเริ่มคลาส"** (setting `teacher_change_notice_days=3`, not overridden) | **PASS** |
| 30-7 | …and it is a *notice*, not a block | the same swap far enough out is allowed | class 2026-09-04, same two teachers → **200** | **PASS** |
| 30-8 | admin `override` bypasses the notice | 200 | **200** | **PASS** |
| 30-9 | 🆕 **delivered rows still refuse edit/move** | `SESSION_DELIVERED` | **409 `SESSION_DELIVERED` "คาบที่เรียนไปแล้ว แก้ไขไม่ได้"**; in the UI the row reads *"Attended — locked"* with no Edit / Mark absence | **PASS** |
| 30-10 | 🆕 **delivered cancel with NO reason is refused** | `REASON_REQUIRED` | **409 `REASON_REQUIRED` "ต้องระบุเหตุผลในการยกเลิกคาบที่เรียนไปแล้ว"** | **PASS** |
| 30-11 | 🆕 …and a whitespace-only reason too | trimmed, then refused | **409 `REASON_REQUIRED`** for `"   "` | **PASS** |
| 30-12 | 🆕 **delivered cancel WITH a reason cancels and re-owes** | 200; row CANCELLED; a make-up appears | 200; row `CANCELLED`; counted rows **4 → 4**; reason stored (`note="QA acceptance — mis-marked attendance"`) | **PASS** |
| 30-13 | 🆕 **the UI asks for that reason** | a mandatory reason prompt before sending | dialog *"Cancel this session … This session is marked attended. Cancelling it needs a reason (it's audited), and a make-up is re-owed."* + **Reason (required) \*** field | **PASS** |
| 30-14 | 🆕 **a live-row cancel re-owes** | cancel needs no reason; size restored | 200 with no reason; counted rows **4 → 4** (make-up appended) | **PASS** |
| 30-15 | orphaned-session pre-check | impact reports what a change would orphan | `GET /teachers/:id/work-days/impact?workDays=0` → `{removedDays:[1,2,4,5,6], removedDaysLabel:"จ, อ, พฤ, ศ, ส", orphanCount:6, sessions:[…]}` over future LIVE rows | **PASS** |

**Verdict: `TEST_PASSED`.** Every AC, including the three behaviour changes, verified live.

## REQ-037 — the extra PAID session

| # | Case (AC) | Expected | Actual | Result |
|---|---|---|---|---|
| 37-1 | it is a **visibly separate** action from Insert | different label and colour, side by side | **"Add extra (charged)"** grape `rgb(134,46,156)` on `rgb(243,217,250)`, 165 px — beside **"Insert make-up"** in blue. Two clearly different controls | **PASS** |
| 37-2 | it adds a **SINGLE_SESSION** | the new row is not a plan row | `201`; row `bookingType=SINGLE_SESSION`, status `PENDING` | **PASS** |
| 37-3 | **course size / end unchanged** | the plan is untouched | counted rows 4 → 4 · `size` 4 → 4 · `liveEndDate` 2026-09-08 → 2026-09-08 | **PASS** |
| 37-4 | the row is marked as an extra in the UI | a badge, and no Mark absence on it | row reads `22 Aug · 11:00 · Bank · … · PENDING · **EXTRA** · Edit · Cancel` — **no Mark absence** | **PASS** |
| 37-5 | **cancelling it does not re-owe** | no make-up appended | cancel 200 · counted rows 4 → 4 · `owedCount` 0 → 0 (twice, on two separate extras) | **PASS** |
| 37-6 | revenue posts | it rides the existing single-session revenue path | **NOT verified end-to-end by me** — the sale posts at day-end via the existing `revenueItemRef` path; I did not run the day-end job (it is a scheduled write). The booking is created as a `SINGLE_SESSION`, which is the input that path consumes | **NOT TESTED** |

**Verdict: `TEST_PASSED`** on the ACs that define the feature. 37-6 is called out plainly: I confirmed the
*shape* the revenue path consumes, not the posting itself — that needs the day-end run, which is a
scheduled job I don't trigger. Worth one look after the next day-end.

## OBS-3 — the plan-diff preview

| # | Case (AC) | Expected | Actual | Result |
|---|---|---|---|---|
| O3-1 | preview is a true dry run | returns the resulting plan, writes nothing | `POST /courses/:id/plan/preview` → 200 `{change, moves, resultingSessions, liveEndDate}`; the stored plan was byte-identical afterwards | **PASS** |
| O3-2 | a refused change fails **in preview** with the same typed reason | no confirm dialog for an impossible change | preview of a clashing move → **409 `SLOT_TAKEN`** (same code as the real apply) | **PASS** |
| O3-3 | **the UI shows the diff before commit** | resulting sessions + the new end date | **"Your plan will become: 0 added · 1 removed · ends 1 Sep 26"** followed by the full resulting session list | **PASS** |
| O3-4 | backing out writes nothing | the plan is unchanged | rows 9 → 9 · end 2026-09-18 → 2026-09-18 | **PASS** |
| O3-5 | Insert is disabled **only** on a genuinely-full course | post-absence `owed==0` stays enabled | my course: `insertable=true` at `owedCount=0` (an EXTENDED exists) → Insert enabled. A genuinely-full course (student "Palm", owed 0) → `insertable=false` → the button is **`disabled`** in the UI, with the paid extra still available | **PASS** |
| O3-6 | OBS-4 tidy-up | times render `HH:mm` | `09:00, 13:00, 11:00 …` — no raw `13:00:00` anywhere in the modal | **PASS** |

**Verdict: `TEST_PASSED`.** Note the earlier OBS-3 hazard is now closed *by design*: the destructive
"insert with nothing owed silently cancels the trailing session" case is now shown as **"1 removed"** in
the diff before anything is written.

### STANDING RULE — the modal's action row measured on the deployed build

| Viewport | Modal | Session table scrollWidth / scroller | overflow-x | "Add extra (charged)" | "Insert make-up" | Footer wraps | Any collapsed control |
|---|---|---|---|---|---|---|---|
| 1600 | 780 | 748 / 748 | auto | 165 | 139 | no | none |
| 1280 | 780 | 748 / 748 | auto | 165 | 139 | no | none |
| 768 | 691 | 659 / 659 | auto | 165 | 139 | no | none |
| **375** | 338 | 598 / 306 | **auto** | 165 | 139 | **yes (wraps to two lines — correct)** | none |

✅ No control collapses at any width; the table scrolls rather than clips. The new paid-extra button
does not squeeze the Insert button at 375 — the footer wraps, which is the reflow-safe behaviour.

## REQ-009 — close the freelance ceiling on a teacher type change

Run under Porter's explicit authorization (2026-08-04) with a **throwaway QA teacher, archived afterwards**.

| # | Case (AC) | Expected | Actual | Result |
|---|---|---|---|---|
| 9-1 | the row shows the freelance teacher + budget | visible on the Teachers page | `QA-req009d-teacher · (QA-req009d) · Every day · ฿250/h` | **PASS** |
| 9-2 | **the type change warns, naming the budget and the remaining amount** | a red alert naming both | ⋯ → *Change type* → Full-time → **"This closes QA-req009d's freelance budget (remaining ฿5,000) — it will not carry over."** | **PASS** |
| 9-3 | **cancel changes nothing** | still FREELANCE | after Cancel: `type=FREELANCE` | **PASS** |
| 9-4 | **confirm changes the type and closes the ceiling** | FT/PT + no active ceiling | after Save: `type=FULL_TIME`; API-level repeat of the same flow also showed the ceiling closed | **PASS** |
| 9-5 | back to freelance requires a NEW budget (no silent restore) | the setup-incomplete gate re-arms | after switching back: availability reports `available=false, reason=NO_BUDGET` | **PASS** |
| 9-6 | past P&L unchanged | a prior month still shows what it showed | **NOT TESTED** — that is a backoffice P&L comparison across months; the dialog states the change is effective this month onward | **NOT TESTED** |

**Verdict: `TEST_PASSED`** (9-6 stated as untested, not assumed).

## Defects

**None.** Nothing in this batch failed.

## Near-miss worth recording (my own, not the product's)

My first REQ-009 UI attempt walked the DOM up from the row-actions button **all the way to the page root**,
so it matched *any* row containing my teacher's name and opened the **wrong teacher's** (Bank's) type
dialog. I selected "Full-time" and pressed Save. **Nothing was written** — Bank was already FULL_TIME and
the FE returns early when the type is unchanged (`TeacherRowActions.tsx:43`). I then verified the roster
directly: **FULL_TIME 7 · PART_TIME 6 · FREELANCE 10, Bank still FULL_TIME** (`sid-verify-roster-untouched.mjs`).
The harness now stops walking once the container exceeds row size. Recording it because "no harm done"
is a result I had to *check*, not assume — and because a QA harness that can wander into another person's
row is exactly the thing my own rules forbid.

## Test data created

| What | Where | Removed? |
|---|---|---|
| Course package `11cca516…` (4 sessions) for QA-owned `QA-expv-student` + its own session edits (moves, absence, insert, cancels, one delivered-then-cancelled row) | `sid` | ❌ no delete endpoint — left in place, QA-owned rows only |
| Further edits to the earlier QA course `6710384c…` (same student): one extra paid session created **and cancelled**, one live extra created **and cancelled** | `sid` | ❌ rows remain (cancelled), QA-owned only |
| Throwaway teachers `QA-req009` / `QA-req009b` / `QA-req009c` / `QA-req009d` (three were created while fixing harness targeting) | `sid` | ✅ **all archived** — roster verified back to FULL_TIME 7 / PART_TIME 6 / FREELANCE 10 |
| Wrong-row type dialog opened on teacher **Bank** and saved as a no-op | `sid` | ✅ nothing written — verified above |
| No LINE message sent · no other person's row modified · production never touched | — | — |

## Verdict

**REQ-030 `TEST_PASSED` · REQ-037 `TEST_PASSED` · OBS-3 `TEST_PASSED` · REQ-009 `TEST_PASSED`.**
Two items are reported as untested rather than rounded up: **REQ-037 revenue posting** (needs the day-end
job) and **REQ-009 past-P&L immutability** (backoffice, cross-month).

## Questions

1. **@Porter — the clock mismatch** (machine says 2026-08-10, the log file is 2026-08-04). Which is
   authoritative for evidence dates? It matters for anything time-relative like the 3-day notice.
2. **@Porter — REQ-037 revenue:** do you want me to re-check the extra session's sale after the next
   day-end run, or is that the owner's P&L eyeball?
