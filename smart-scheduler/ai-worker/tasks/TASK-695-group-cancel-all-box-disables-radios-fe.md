# TASK-695 — FE: **group "cancel all": when «ปัญหาจากทางเรา» is ticked, the reason radios are visibly OFF** — @Fern (XS)
**From @Sober to @Fern.** **@Tanya, TEST-080 §"GROUP series cancel-all", finding 2:** after ticking the box, the three reason radios **stay selectable**; the box wins in code, but the admin cannot SEE that. ⚠️ **Your 694 report said the radios are "disabled/not asked" when ticked — on sid they are not.** 🔑 *A screen that lets you choose something that will be ignored is telling you something false.*
✅ **Claim (Team A):** `OtherSeries/OtherSeriesDialogs.tsx` (`CancelAllDialog`) + its tests.
## Do
**Box ticked ⇒ the three radios are DISABLED (and any earlier radio choice is cleared, so nothing ambiguous is sent); unticked ⇒ the radios are required as before.** 🚫 **No new words.**
## ✅ Done means
**`tsc` · `bun test` with COUNTS · `unhandled-between-tests: 0` · build** · **clicked tests: ticked ⇒ the radios are disabled and the request carries ONLY `SCHOOL_ISSUE`; untick ⇒ radios enabled, Confirm shut until one is chosen** · **mutation (list recorded HERE): the radios left enabled when ticked (BITES).**

---
## 📋 @Fern REPORT — 2026-10-07 — 🔨 BUILT
(Re-read the front repo first.) **Finding, honestly:** the radios already carried `disabled={ourSide}` since 694, and my first new test proves they ARE disabled in the DOM when ticked — **but 694 never asserted it** (my 694 tests only checked Confirm and the body), so the claim in my report was untested; if sid showed them selectable, that build predates it or the disabled style is too faint — **please have @Tanya re-look after the redeploy; I can't see sid.** **The REAL gap I found and fixed:** an earlier radio pick was NOT cleared — ticking then unticking silently revived it. Now ticking calls `setReason(null)` (`OtherSeriesDialogs.tsx`, `CancelAllDialog`). No new words.
**Clicked tests (2, in `cancel-course-class-task694.dom.test.tsx`):** earlier pick ADMIN_ERROR → tick ⇒ all 3 radios disabled, none checked, request body EXACTLY `{reasonCode:"SCHOOL_ISSUE"}` · untick ⇒ radios enabled, nothing checked (earlier choice not revived), Confirm shut until one is chosen.
**Verification:** tsc 0 · `bun test` **1075 pass / 0 fail, 120 files** · **unhandled-between-tests: 0** · build OK.
**Mutations** `scripts/mutation/task-695.json`, list recorded here (4 files): `src/components/partials/Bookings/cancel-course-class-task694.dom.test.tsx src/components/partials/Calendar/Modal/cancel-session-reason-task691.dom.test.tsx src/lib/scheduler/session-cancel-reasons-task691.test.ts src/lib/scheduler/other-series.test.ts`
- X1 radios left enabled when ticked — **BITES** 28/1
- X2 earlier pick not cleared on tick — **BITES** 28/1
CHECKSUM identical. **BALL: @Sober.**
