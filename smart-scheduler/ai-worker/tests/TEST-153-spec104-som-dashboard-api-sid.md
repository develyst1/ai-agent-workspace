# TEST-153: sid — SPEC-104 SOM dashboard API (TASK-950): the demographics base + activityPackages
**Status:** ✅ TEST_PASSED on (1), (2) and (3) as specified · **1 question** on what the 1 HR package counts (Q-153-1, a definition, not a defect).
**Source:** Porter's 2026-11-11 20:10 line in `inbox/QA.md` · SPEC-104 · TASK-950. SF not redeployed, so **the screen is out of scope**.
**Build:** sid SB as the owner just deployed it; the host shows no version.
**Instrument:** `GET /api/reports/som` inside the sid card `som.json` (no password), for **3 periods**: the default (this month), `?month=2026-10`, and `?from=2026-10-15&to=2026-11-05`. My recounts come from `/bookings` (2,776 rows read, 2025–2027) in-page. Counts only, no names.

## (1) The demographics base ✅
| Period | `demographics.base` | gender · ageBand · nationality · province · district `.total` | Total Customers | gender.total − Total Customers |
|---|---|---|---|---|
| default | `CUSTOMERS_PLUS_RECENT_1HR` ✓ | **38** · 38 · 38 · 38 · 38 | 33 | **5** (Bob: 38 = 33 + 5 ✓) |
| Oct 2026 | ✓ | **47** × 5 | 40 | 7 |
| 15 Oct – 5 Nov | ✓ | **39** × 5 | 34 | 5 |
- Every demographics field shares one total (one base) ✓. The added children (5 / 7 / 5) are within the 1 HR card's count (7 / 9 / 7), as "customers + the 1 HR children who aren't customers" needs. The exact overlap (which 1 HR children are already customers) isn't exposed by the API, so "the 5 are exactly the non-customer 1 HR children" is inferred from the counts, not shown child by child.

## (2) `activityPackages` ✅
| Check | default | Oct 2026 | 15 Oct – 5 Nov |
|---|---|---|---|
| `base` = `CUSTOMERS_PLUS_RECENT_1HR` | ✓ | ✓ | ✓ |
| **Σ COURSE counts = the Active-course card** | **79 = 79** ✓ | **103 = 103** ✓ | **82 = 82** ✓ |
| package kinds present | COURSE, SINGLE_SESSION — **no VOUCHER** ✓ | same ✓ | same ✓ |
| every activity's `total` = Σ its packages (firstTrial **not** in total) | ✓ (0 off) | ✓ | ✓ |
| `firstTrial` per activity = my count of non-cancelled 1st Trials of that activity in the range | ✓ (0 off) | ✓ | ✓ |
| packages largest count first | ✓ | ✓ | ✓ |
| activities listed incl. zeros | 21 (10 at 0) | 21 (9 at 0) | 21 (11 at 0) |
- Example (default): **Private SURFSKATE** total 61 = Course 6 × 31 + Course 4 × 20 + Course 10 × 5 + 1 HR 5; firstTrial 8 (separate).
- No `unknown` bucket appeared (every row had a subject).

## (3) The old `activityProgram` ✅ still present (keys month · from · to · categories) on all 3 periods.

## Q-153-1 — what `SINGLE_SESSION` counts (for Porter / Silver; not a defect by SPEC-104's text)
- **The API's 1 HR package = the 1 HR *card's* children** (those who took a 1 HR in the card's window and haven't since become customers): Σ over activities = **8** vs the card's **7** (default), **12** vs **9** (Oct) — a child with 1 HR in two activities counts in each.
- **It is not "every child who took a 1 HR of that activity"**: my raw count of non-cancelled 1 HR takers in the same window is **22 / 20** children (e.g. SURFSKATE 15 vs the API's 5).
- **Why it matters:** the **sample table we sent ขวัญ** (TEST-146 v3, CHECK-REQ-5009 §5 reconciliation (b)) defined its 1 HR column as **"every non-archived child who took a 1 HR in that activity (incl. voucher holders)"** — the wider set. If Palm's screen draws this API, its 1 HR slices will be smaller than the numbers she was shown. SPEC-104's own wording ("children with a 1 HR … in the window the 1 HR card already uses", inside a base of "Total Customer + 1 HR") reads more like the card's set, which is what was built. Which one she means is Porter's to settle.
> answer (Porter, `inbox/QA.md` 2026-11-11 23:30): **CLOSED**. PM ruling of 11-11: the 1 HR package is the 1 HR card's children, so the chart matches ขวัญ's "Total Customer + 1 Hr" base. That is what was built, so nothing changes.

## Not tested
The screen (SF not redeployed); badge filtering of `activityPackages`; the per-child overlap in (1) (not exposed by the API).
## Test data created
None (GET only). **uat:** not touched.
