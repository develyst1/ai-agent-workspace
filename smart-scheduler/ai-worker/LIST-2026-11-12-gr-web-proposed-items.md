# LIST 2026-11-12: every "Proposed" item on the GR web and its menu (round 7b)
Sober (SA, Team A), for Porter, to answer ขวัญ "proposed แต่ละอันจะไปอยู่กับเมนูไหน" (CUSTOMER-ANSWERS 2026-11-12 03:15, ledger 29). Read from `final-ui` on 2026-11-12 (round 6c, release 20261111-201644): `src/pages/proposed/index.ts` + every "Proposed" marker in the other pages. **The "will sit under" column is [SA-proposed]**: where each item would live if she approves it. It is not decided.

| # | Proposed item (as on the GR web today) | Where it sits now | Will sit under, once approved | Size on its banner |
|---|---|---|---|---|
| 1 | **Payment Setting (Edit)**: edit the pay rules (rates, commission rules) | PROPOSED | **SALARY → Payment Setting**, as an Edit mode on that page. ⚠️ Round 6 already added Edit on its **commission groups**; the rest (rates, rules) is still this proposal | 1.5 days |
| 2 | **Bonus (Conversion)**: Total, period and coach filters | **already SALARY**, right before Other Income, no banner (round 5 #16) | stays there; she treats it as a real page | — |
| 3 | **Conversion export** (Excel + PDF) | PROPOSED | **SALARY → Bonus (Conversion)**, as Excel / PDF buttons on that page | 1 day |
| 4 | **Revenue Summary export** (Excel) | PROPOSED | **REVENUE → Summary**, as an Excel button on that page | 0.5–1 day |
| 5 | **Move course to branch** (a whole course, not one class) | PROPOSED | **SETTING → Branch for booking** (the branch page) | 0.5 day |
| 6 | **Stock Report filters** (Type, Product, search on the Movement tab) | PROPOSED (CEO + Admin) | **STOCK → Stock Report**, inside the Movement tab | 0.5–1 day |
| 7 | **Report Revenue + Conversion** (Excel) | PROPOSED | **REPORT → All Report**, as a new report there | — (no size on its banner) |
| 8 | **Unlock a locked period** (CEO), the orange «Proposed: to confirm» tag | **already inside SALARY → Monthly Payment** | stays there; the tag goes when she confirms | — |

**Not on the GR web:** the front-office "Proposed" pages (TASK-945) are HELD on the owner's stop of 2026-11-10 ("หยุดก่อน"), so there is nothing to show her for them.
**For Porter:** once she says yes to an item, its "Proposed" page is removed and the feature moves into the page in column 4. Each one is a small Team C round (Flash owns `pages/proposed/*`), except #1, which touches Team B's Payment Setting.
