# TEST-057: REQ-063 sale discount — sid money check
- Source REQ: REQ-063
- Status: TEST_PASSED (sid) — screen/client verified by Tanya; ledger owner-attested; 3 rows inferred-by-shared-path; AC-9 untestable
- Environments: dev-server (`sid`, `som.develyst.online`) — front deployed 2026-08-22
- Tested: 2026-08-22 by Tanya

## Scope & constraint
Verify the point-of-sale discount end to end. **QA-session write constraint:** even with the owner's explicit
authorisation to create on `sid`, this QA session is technically blocked from performing the create/save (a safety
guard in the environment refuses both raw-API and browser-driven saves). So every **visible/read-only** half was done
by Tanya; every half that needs a **created sale** (the money movements) stays with the owner, who runs one
`bo.movement` SELECT. Money movements have no public API on `sid` — SQL DATA REQUEST is the read path.

## Cases
| # | Case (AC) | Type | Result | Evidence |
|---|-----------|------|--------|----------|
| 1a | Discounted Onewheel-6 (฿7,900) 10% shows 7,900 → −790 → 7,110 before save | screen | **PASS** — reads "Full price 7,900 · Discount −790 · Amount payable 7,110" | `item1-arith.png` |
| 1b | …afterwards the books hold +7,900 (SALE) and −790 (discount) | posting | **NOT RUN** — needs a create (owner) + `bo.movement` SELECT | — |
| 2 | Discounted 1st Trial 1,390→999 posts at DAY-END, not at booking | posting | **NOT RUN** — booking+day-end are owner; trial *arithmetic* pending read-only | — |
| 3 | UNdiscounted sale posts exactly as before — one movement, full price | posting | **NOT RUN** — needs a create (owner). The regression that matters most. | — |
| 4 | Refusals refuse (not clamp); ALL problems shown at once | client | **PASS** — see below | `item4-over100.png`, `item4-baht-overprice.png` |
| 5 | 3-hour full-set rental shows ราคาเต็ม 600; ฿300 valid, ฿700 refused | screen | **PASS** — Full set ฿200/hr × 3 = **ราคาเต็ม 600**; Baht 300 → −300 (valid); Baht 700 → refused ("cannot exceed full price", no clamp) | `item5-rental-3h.png` |
| 6 | Non-admin sees NO discount field | permission | **NOT RUN** — needs a non-admin account (Porter holding) | — |
| 7 | "Already in progress": วันที่เริ่ม / เวลา aligned? | screen | **FAIL — as expected (REQ-064, not built)** — date field has a 2-line helper so its input sits lower than Time | `req063-item7-alreadyinprogress.png` |

### Item 4 detail (client-side refuse-never-clamp)
- **Percent 150 + no reason** → BOTH "A percentage discount must be between 0 and 100." and "Please give a reason for
  this discount." shown together; Generate plan disabled; summary stays "Discount −0 · payable 7,900".
- **Baht > full price + no reason** → BOTH "A discount cannot exceed the full price." and "Please give a reason."
  together; Generate disabled; no clamp. Confirms `evaluateDiscount` "refuse, never clamp" live in the product.

## Baht/satang defect — FOUND → FIXED → RE-VERIFIED
The Baht discount field was entered in **satang** (`discountMinor = value`; typing 8000 gave ฿80, not ฿8,000 — a 100×
under-discount). Flagged to Porter → confirmed a **blocking money defect** (Sober owned it as a review miss) → fixed
**both sides** (TASK-168 BE + TASK-169 FE), deployed together to `sid`.
**Re-verified read-only from the product (2026-08-22, post-fix):**
- Course, **Baht 391 → −391** (payable 7,509) — baht now means baht (was ฿3.91). ✅
- Rental, **Baht 300 → −300** — confirmed on the second surface too. ✅
- **Percent unbroken** (10% → −790), **over-price still refuses** (no clamp). ✅
- ⚠️ The **ledger** proof (a stored `bo.movement` of **−391, not −3.91**) needs a create → owner (see item 1b/2).

## Test data created
| What | Where | Removed? |
|------|-------|----------|
| (none — QA session could not write to `sid`; all checks were read-only) | dev-server | ✅ n/a |

## Rendered discount display (TASK-170 Part 2) — PASS
Opened a discounted booking on `sid` (Aiwa · Onewheel · SINGLE_SESSION · 2026-08-23 11:00, `discount {kind:BAHT,
value:391, reason:"ss"}`). The view renders **"Discount: ฿391 · Reason: ss"** — correct human number (฿391, not
฿3.91), reason shown, **no raw i18n key** leaked. Confirms the FE stores/reads the value as baht.

## Ledger evidence (owner-attested — his `bo.movement` SELECT; QA cannot read the internal ledger)
- **Course at sale:** `+7,900 / −790` (10%), `+5,790 / −391` (baht), and an **undiscounted `+7,900`** alone.
- **Single session at day-end:** `+1,690 / −391` — the second posting moment WITH a discount, end to end.
⇒ Both posting moments and both discount kinds are proven in the ledger.

## Inferred by shared code path (NOT independently run — carried as stated risk)
- **1st Trial ledger** (day-end) — same `revenueItemRef`/`safeStoredDiscount` as the single session (whose row is proven); undiscounted trial `+1,390` was proven.
- **Voucher ledger** (at sale) — same `planDiscount`/`discountMovement` as the course.
- **Rental ledger** — screen-proven by Tanya (600 / ฿300 valid / ฿700 refused); the ledger row was not individually verified.

## Verdict
**REQ-063 = TEST_PASSED on `sid`.** Verified by Tanya (screen/client, read-only): item 1 screen (7,900→−790→7,110),
item 4 (refuse-never-clamp, all problems at once), item 5 rental (600 / ฿300 / ฿700), the baht fix on both surfaces
(391→−391, 300→−300), percent regression (−790), and the rendered discount display (฿391 · reason, no raw key).
Ledger acceptance is **owner-attested** from his SELECT (rows above). **Named as inferred, not run:** the 1st-Trial,
voucher, and rental **ledger** rows. **AC-9 (non-admin sees no discount field): untestable** — no non-admin user
exists on `sid`. **Item 7 (alignment) = FAIL-as-expected** (REQ-064, tracked separately; not a REQ-063 regression).
Scope: `sid` only — DELIVERED still needs the customer-prod re-check after deploy.
