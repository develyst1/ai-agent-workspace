# TEST-157: REQ-5014 change activity on sid: TASK-961 (SB) + TASK-962 (SF)

**Tester:** Tanya (QA) · **Date:** 2026-11-13 · **Asked by:** Porter (inbox/QA.md) · **Design:** SPEC-106 §§ 2, 5, 7
**Surface:** sid `https://som.develyst.online` (owner's full deploy, 0080 applied), admin card `picklocker/state/som.json`, headless Chrome at 1280 / 375, EN. Revenue lines were read through the back office with the bo-ceo card (GET only).
**Kept away from (Porter's list until TASK-965 is green):** coach leave, planned absence at course create, group dates, swaps / cover, resume, DUO create, park blocks. Nothing here used them; the coach stayed the same in every change.
**QA data:** the QA student «QA-req074-1hr», who has **no parent** (so no family LINE), and QA coach QADT2 (`lineLinked=false`).

## Verdict: ⚠️ TEST_FAILED, 2 defects in the dialog (SF). The server side passes.

| # | Case | Result |
|---|---|---|
| 1 | Server preview, card price: course Private FREESKATE ×4 (4,790 ฿), class 1 ATTENDED, → Private ONEWHEEL (5,790 ฿) | ✅ remaining 3 from 2026-11-20 · 479000 → 579000 · CARD · **difference 75000** (= 1,000 × 3 ÷ 4) |
| 2 | Server preview, typed price: → Balance Play (Private), which has no size-4 price | ✅ without a typed price: `newPriceMinor null`, `priceSource null`, `difference null`. With 5,500 ฿: 550000 · MANUAL · **53300** (532.5 rounded to a whole baht) |
| 3 | Server refusals | ✅ 0 and 100,001 give `400 MANUAL_PRICE_RANGE` · a typed price for a card subject gives `400 MANUAL_PRICE_NOT_ALLOWED` · the current subject gives `400 SAME_ACTIVITY` · an act with no typed price gives `400 MANUAL_PRICE_REQUIRED` · a course row or an attended row through the booking route gives `409 NOT_SINGLE_OR_TRIAL`. Each comes with its Thai message. |
| 4 | UI: the course panel's «Change activity», card price | ✅ «Change 3 classes from 20/Nov/26 · 4,790 ฿ → 5,790 ฿ · Difference 750 ฿ · Classes already taught don't change». No price input. |
| 5 | **UI: typed price** | ❌ **D-157-1:** the price input appears, as it should. Once a price is typed, the preview never settles and Confirm stays disabled. |
| 6 | Act → rows (AC: attended rows stay) | ✅ after the act, the ATTENDED 13 Nov row is still **Private FREESKATE**. The 3 remaining rows are ONEWHEEL. The toast reads «Activity changed», and the plan refreshes. |
| 7 | Cheaper, no refund | ✅ server: ONEWHEEL → FREESKATE previews `difference 0`. UI: ONEWHEEL → Private SURFSKATE shows «5,790 ฿ → 4,790 ฿ · 0 ฿ · no refund»; acted, the 3 rows moved to SURFSKATE. |
| 8 | **The dialog's "current activity" after a change** | ❌ **D-157-2:** see below. |
| 9 | Success state, difference > 0 | ✅ «Record the difference of 750 ฿ at Add Manually (back office), reason "ส่วนต่างเปลี่ยนกิจกรรม"». **No «Open Add Manually» link was drawn.** SPEC says an unset `NEXT_PUBLIC_BACKOFFICE_URL` means no link; I can't see sid's env, so the link itself is NOT_TESTED. |
| 10 | 1 HR (booking modal ⋯ → «Change activity») | ✅ the menu has it for a live 1 HR. Preview: «Change 1 classes from 20/Nov/26 · 1,390 ฿ → 1,690 ฿ · Difference 300 ฿», no price input. Act 200, then the success text with no link (1 HR never has one). |
| 11 | 375 px | ✅ the dialog is 338 px wide, with no page overflow (`scrollWidth − innerWidth = 0`) |
| 12 | Console | ✅ 0 page errors |

## D-157-1: a typed price loops the preview, and Confirm never enables (High: the typed-price case can't be done in the UI)
- **Steps:**
  1. Open a size-4 course whose next activity has no size-4 card price (e.g. Private FREESKATE ×4 → Balance Play (Private)) through the course panel's «Change activity».
  2. Pick that activity. The price input appears (correct).
  3. Type 5500 and leave the field.
- **Expected:** one preview with `manualPriceBaht: 5500` → «4,790 ฿ → 5,500 ฿ · typed price · Difference 533 ฿», and Confirm on.
- **Actual:** the preview spins. In 20 s the dialog sent **37** preview calls, alternating `{subjectId}` and `{subjectId, manualPriceBaht: 5500}` about every 0.6 s, each answered 200. The text never shows and **Confirm stays disabled** (`02-preview-typed-price.png` shows the spinner).
- **What I saw, not a diagnosis:** the two alternating bodies suggest that the typed price is dropped from the next request once an answer with a price arrives, so the answer flips back to `null`, and round it goes. The server answers both correctly (case 2).

## D-157-2: after a change, the dialog still treats the old activity as current (Medium)
- **Steps:**
  1. Course with class 1 attended; change the remaining classes to ONEWHEEL (done).
  2. Open «Change activity» again.
- **Expected:** the header names ONEWHEEL, ONEWHEEL is left out of the list, and FREESKATE is offered.
- **Actual:** the header still reads «Private FREESKATE · QA-req074-1hr». **FREESKATE is missing** from the list, and **ONEWHEEL is offered**. Picking it would earn the server's `SAME_ACTIVITY` (the server confirms the current one is ONEWHEEL). So once a course has changed, the admin can't change it back to its first activity from this screen.
- **Where it comes from (what I read, not a fix):** `PlanModal.tsx` l.237–238 / l.716 passes `current = courseSlot.subject`, and `courseSlot` is the plan's **first** non-1 HR row. That is the attended class, which this feature deliberately leaves on the old activity.

## Observations
- EN "Change **1 classes**" for a 1 HR (a plural form). The TH string may be fine; for Porter's wording pass.
- No revenue line existed for my QA course or 1 HR (a create writes none; nothing was confirmed), so the **relabel** wasn't exercised live. Bob's two rolled-back sid proofs cover it.

## Not tested
- The «Open Add Manually» deep link (case 9: not drawn on sid; env not visible to me).
- Trial (`FIRST_TRIAL`), always 0 per SPEC. No QA Trial was made.
- A change with a new coach. That touches holds and coach notices; I kept the coach to stay clear of Porter's avoid list. Bob's second rolled-back sid proof covers it.
- `GROUP_COURSE` / `COURSE_ENDED` / `COURSE_PAUSED` / `NOT_LIVE_BOOKING` / `OLD_PRICE_NOT_ON_CARD` live (each needs data on the avoid list, or an extra course).
- The family / coach LINE notices: the student has no parent and QADT2 has no LINE, so nothing could be delivered.

## Evidence (`tests/evidence/req-5014-sid/`)
- `01-preview-onewheel.png`: the course dialog's card-price preview (750 ฿).
- `02-preview-typed-price.png`: D-157-1, 5,500 typed, the spinner, no preview.
- `03-dialog-375.png`: the dialog at 375 px.
- `04-success-record-difference.png`: the success state (750 ฿, no link).
- `05-preview-cheaper-no-refund.png`: «0 ฿ · no refund». Its header also shows D-157-2 (it still reads «Private FREESKATE» while the course is ONEWHEEL).
- `06-1hr-preview.png`: the 1 HR dialog, 300 ฿, no price input.

## Test data created (sid)
| Row | End state |
|---|---|
| course `2620af9d…` Private FREESKATE ×4, QADT2, student «QA-req074-1hr», from 2026-11-13 09:00 | 13 Nov class **ATTENDED** (stays; a past class), still Private FREESKATE. Course **cancelled** (`/courses/:id/cancel` ADMIN_ERROR): 20 Nov, 27 Nov, 4 Dec CANCELLED, last on Private ONEWHEEL. |
| 3 `activity_changes` history rows for that course (→ ONEWHEEL, → SURFSKATE, → ONEWHEEL) | stay (history; no delete route) |
| 1 HR `df4ec4d0…` 2026-11-20 11:00, QADT2, same student | changed to ONEWHEEL (1 history row), then **CANCELLED** |
| revenue | none written (the 13 Nov lines are only TEST-155's two park fees) |
| the ATTENDED class's sale posting, if attend posts one | not checked; QA student, sid only |

## Re-test 2026-11-13, committed build (SB `738b6eb` · SF `6c52040`): ✅ TEST_PASSED (D-157-1 and D-157-2 fixed), 1 question for Porter
New QA course `b7366772…`: Private FREESKATE ×4, QADT2, the parentless QA student, from 2026-11-13 10:00. Class 1 ATTENDED.
- **D-157-1 fixed:** Balance Play (Private) → the price input appears. Typing 5500 settles the preview to «Change 3 classes from 20/Nov/26 · 4,790 ฿ → 5,500 ฿ · typed price · Difference 533 ฿ · Classes already taught don't change», and **Confirm is enabled**. Confirm → «Record the difference of 533 ฿ at Add Manually (back office) …». The plan shows 13 Nov ATTENDED still on FREESKATE, and 20 Nov / 27 Nov / 4 Dec on Balance Play (Private).
- **D-157-2 fixed:** reopening the dialog shows the header «Balance Play (Private) · QA-req074-1hr». Balance Play (Private) is left out of the list, and **Private FREESKATE is offered**.
- **❓ Question for Porter (an "is it right" question, not a defect):** choosing FREESKATE there gets **`409 OLD_PRICE_NOT_ON_CARD`** «กิจกรรมเดิมไม่มีราคาในรายการราคา — คำนวณส่วนต่างไม่ได้», and the dialog shows the EN message. Confirm stays off.
  - So **a course moved to a typed-price activity can't change activity again**, not even back to where it was. The typed price is on its history row, but the server reads only the card.
  - This follows the rule Silver accepted (TASK-961 Review, item 1: refuse rather than invent an old price).
  - Whether ขวัญ needs a second change on such a course is the open point.
- **Still no «Open Add Manually» link**, so it stays NOT_TESTED (as in case 9).
- **Evidence** (`tests/evidence/req-5014-sid-r2/`): `01-typed-price-preview.png` (D-157-1 settled, Confirm on) · `02-typed-success.png` · `03-reopen-current-is-new-back-to-freeskate.png` (D-157-2 header and options, plus the OLD_PRICE_NOT_ON_CARD refusal).
- **Test data:** course `b7366772…` **cancelled** (ADMIN_ERROR). The 13 Nov 10:00 class stays ATTENDED; 3 rows CANCELLED. 1 more `activity_changes` history row (MANUAL 5,500, difference 533). No revenue line.
