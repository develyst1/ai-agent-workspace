# REQUEST 2026-11-12 · Porter → Sober: ขวัญ's 15:13 + 15:26 group messages (dashboard labels, Proposed list)
Her words, verbatim: `.private/line-20261112-152856.json` (and CUSTOMER-ANSWERS.md, the two 2026-11-12 15:13 / 15:26 lines). The owner sends the free-work value and the paid options to แนท tonight, so I need the answers below today.

**A. Front-office Dashboard labels.** This came from พี่ปุ้ม + พี่ฟีน and is wording only: rename and reorder the cards.
- Whose code holds these strings: Palm's front end, or our back end (TASK-950 API)?
- If Palm's, I will route it through the owner. If ours, give the TASK size.

**B. Proposed list (LIST-2026-11-12-gr-web-proposed-items.md).** Her numbering differs from the LIST.
- Items 1, 2 and 3 are acknowledged (Payment Setting Edit, Conversion export, Revenue Summary export).
- Item 4, Move course to branch: she asks *"ไม่ได้จะไปอยู่หน้าบ้านด้วยหรอคะ"*. Is the front office in scope (TASK-945 is HELD), and what does adding it cost in days?
- Item 5, Stock filters: she wants them on **every** Stock page, including Sales History and Balance. Give the new size in days, against the 0.5–1 on the banner.
- Item 6, Report Conversion: she wants a click-through to the name list, as on the front-office dashboard, with the columns 1st Trial (Student) · Open Course (After Trial) · Conversion % · Renewal Course. Give the size in days.
- Report Revenue: she will come back on it. Do nothing yet.

Days only, one line each, with the source or "SA estimate". Write it under `## Answer`, then add one line to inbox/PM.md.

## Answer
**Sober (SA, Team A), 2026-11-12. Days only, one engineer, QA excluded.**

**A. Dashboard labels: Palm's code. Ours: 0 d.**
- The card names are strings in the front end: `smart-scheduler-front` `src/lib/i18n/dictionaries.ts:1842-1844` (Active course / Active voucher / 1st Trial …) and `:1883-1888` (the six New-vs-Renewing cards). Palm's last commit there is `86316ee`, 2026-11-11.
- Every name on her list maps to a number the back end already returns. «New Course previous month» = `newCoursePrevMonth`, `som-contract.ts:470/633`. So it is a wording and order change only, with no TASK-950 change.
- One check for Palm: «Active Customer (Course + Voucher นับเป็นคน)» should draw from the existing customer count, not a new figure [inferred; Palm confirms on her screen].

**B. Proposed list (her numbering):**
- **4. Move course to branch, front office too: +1–1.5 d** on top of the 0.5 d back-office banner (SA estimate: an SB move route + SF button/dialog + tests).
  - This is a new ask, not TASK-945, which is the HELD front-office Proposed pages.
  - Whether the front office is in scope is the owner's call.
- **5. Stock filters on every Stock page (incl. Sales History and Balance): 1.5–2 d**, replacing the banner's 0.5–1 (SA estimate: one shared filter bar: Type, Product, search; wired into each Stock page's list query in BB+BF).
- **6. Report Conversion with a click-through to names (1st Trial (Student) · Open Course (After Trial) · Conversion % · Renewal Course): 1.5–2 d** (SA estimate: BB report + name-list endpoint + BF table and drill-down).
  - It should reuse the front-office dashboard's definitions (`som-contract.ts` NVR buckets) so the two screens never disagree.
  - It replaces my earlier 1–1.5 d for "Report Revenue + Conversion". Report Revenue waits for her.
- 1–3: acknowledged, no change to the earlier sizes.

## Follow-up (Porter, 2026-11-12 16:00): her 15:31 and 15:58 messages
See CUSTOMER-ANSWERS.md, the 15:31 and 15:58 lines. Her text is in `.private/line-20261112-155857.json`. Her 15:57 image is not readable by the bot; I asked the owner for it.

**C. Dashboard pie charts.** She wants a bigger TOTAL row on top, with per-activity rows under it, in 3 pies:
1. **Active Course.** Every active course, excluding 1st, 1HR and Voucher.
2. **TOTAL 1st Trial.**
3. **1HR + Voucher booked in the Period**, counted in classes.

Questions:
- Does our API (TASK-950 `activityPackages` and others) already return these counts, or is back-end work needed? Give the days.
- Which part of the work is Palm's?

**D. Report Revenue: she said yes.** It counts by **Category first**, with a second box by **Type**.
- Give the size in days. This was the Report Revenue part you left out of 6.

Answer under `## Answer 2`, then add one line to inbox/PM.md.

## Answer 2
**Sober (SA, Team A), 2026-11-12. Days only, one engineer, QA excluded. Source: SPEC-104 l.22–40 (the `activityPackages` contract).**

**C. Dashboard pies. Two of the three need no back-end work; the third needs ≈ 0.5–0.75 d of SB work.**
- **Pie 1, Active Course: 0 d for us.** Per activity it is Σ `packages[kind=COURSE].count`, and the TOTAL is the sum over activities. Neither includes 1st Trial, 1 HR or voucher (SPEC-104 l.26, 38).
- **Pie 2, TOTAL 1st Trial: 0 d for us.** `activities[].firstTrial` already gives the 1st Trials in the period (l.32, 40).
- **Pie 3, 1 HR + Voucher booked in the period, counted in classes: ≈ 0.5–0.75 d BE (SB)** (SA estimate). Nothing returns it today: `SINGLE_SESSION` counts **children** over the **last 3 months** (l.30, 39), and vouchers are left out everywhere (l.38).
  - The fix is a new additive field per activity, `bookedSingleAndVoucher` = non-cancelled 1 HR + voucher **class bookings** dated in the range, plus tests. The path does not change and no other field moves.
- **Palm's part:** redraw the 3 pies, put the bigger TOTAL row on top with the per-activity rows under it, and do the labels. Pie 3 reads the new field once SB ships it.
- ⚠️ Her 15:57 image is not read yet. If it shows a different grouping, this size may change.

**D. Report Revenue, Category first plus a second box by Type: ≈ 1–1.5 d** (SA estimate: BB report query reusing the Revenue Summary category data, GR row #23 + BF page in All Report + Excel export + tests).
- With it, item 6 (Report Conversion, 1.5–2 d) plus D ≈ **2.5–3.5 d** for the whole REPORT pair.
