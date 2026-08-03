# REQ-021: DASHBOARDS — take every code→label from `T_S_COMMON_CODE`, stop hardcoding maps

- Status: READY_FOR_SA
- Priority: **HIGH** — finding #1 is a live data defect (rows show "ไม่ระบุ" instead of the real group), not a style issue
- Raised: 2026-07-24 — stakeholder supplied the full `T_S_COMMON_CODE` dump: *"this is table common please review and
  revise all the thing we develop and use this instead the hard code"*

## Current state = MIXED (verified in code)
Some dashboards already read the table — `DashboardMoveA10Service` L66/L369, `DashboardMoveLicenseService` L352/L363,
`DashboardTrackingService` L422/L432 all call `_uowSPF.TSCommonCodeRepo.GetDataActiveByGroupCode…` for
`RequestType` / `MoveRequestType`. **The infrastructure already exists and is proven** (`TSCommonCodeRepository`,
`TSCommonCodeEntity`, `ConstantSPF.GroupCode`). The remaining hardcoded maps are simply leftovers.

## Findings

### 1. ⛔ `BUYER_GROUP_MAP` — hardcoded, incomplete, and one label is wrong (LIVE DEFECT)
Duplicated verbatim in **3 services** (`DashboardTrackingService` L45-48, `DashboardMoveLicenseService` L37,
`DashboardMoveA10Service` L33):
```csharp
{ 1, "ทหาร" }, { 2, "ตำรวจ" }, { 3, "สมาคม" }, { 9, "อื่นๆ" },   // 4 entries
```
Table `GROUP_CODE = 'AuthorityGroupNo'` has **8 active codes**:
| CODE_INT | CODE_NAME (DB) | in our map? |
|---|---|---|
| 1 | ทหาร | ✔ |
| 2 | ตำรวจ | ✔ |
| 3 | **ภาคเอกชน (สมาคม บริษัทฯ)** | ⚠ label differs — we say "สมาคม" |
| 4 | สนามยิงปืนทหาร | ❌ missing |
| 5 | สนามยิงปืนตำรวจ | ❌ missing |
| 6 | **ส่วนราชการตามกฎกระทรวง** | ❌ missing |
| 7 | รัฐวิสาหกิจตามกฎกระทรวง | ❌ missing |
| 9 | อื่น ๆ | ✔ |
| 0 | ไม่ระบุ | (IS_ACTIVE=0 — correctly absent) |

The map feeds **both** the dropdown (`DashboardTrackingService` L113) **and** the table column (L389), so any license
with buyer group 4/5/6/7 renders as **"ไม่ระบุ"** in both. The stakeholder's own tracking screenshot shows
**"ส่วนราชการตามกฎกระทรวง" (=6)** in that column ⇒ code 6 exists in real data. **DATA REQUEST below confirms the blast radius.**
⇒ delete all 3 copies; read `AuthorityGroupNo` from the table (active only, ordered by `SEQUENCE`).

### 2. `MOVE_REQUEST_TYPE_MAP` in `DashboardMoveA10Service` L26-31 — hardcoded + abbreviated
```csharp
{ "0", "หน่วยงานตามมาตรา 7" }, { "1", "ขาย/ขนย้ายนอกหน่วยงาน" },   // 2 entries, shortened wording
```
Table `MoveRequestType` has **6 codes with full wording**: 0 ขนย้ายให้หน่วยงานตามมาตรา 7 · 1 ขายและขนย้ายให้บุคคลอื่นนอก
หน่วยงานตามมาตรา 7 · 2 ขนย้ายเพื่อทำลาย · 3 ขนย้ายเพื่อทดสอบ · 4 ขนย้ายเพื่อจัดแสดง · 5 ขนย้ายกลับโรงงาน.
⚠ **Naming trap flagged in the code comment itself** (L38-41): this map is applied to **`INFORM_REQUEST_TYPE`**
(col5 ประเภทการขออนุญาต), which is *not* the same column as `MOVE_REQUEST_TYPE` (col6) that already uses the table.
⇒ **SA must confirm which GROUP_CODE governs `INFORM_REQUEST_TYPE`** before swapping — if it is genuinely
`MoveRequestType`, the labels become the full DB wording (an FE-visible text change); if it is a different group,
use that one. Do **not** guess; raise a DATA REQUEST through Porter if the answer isn't in the table.

### 3. license-book paid/unpaid labels ≠ DB wording
`DashboardLicenseBookService` L29-30: `PAID_LABEL = "ชำระแล้ว"`, `UNPAID_LABEL = "รอชำระ"`.
Table `StatusPaid` (CODE_STR): `"11"` = **"ชำระเงินแล้ว"** (COLOR Green) · `"00"` = **"รอการชำระ"** (COLOR Orange).
These two labels drive the table column `paid_status_name` **and** the chart-1 category labels (TASK-037 unified them).
⇒ read from `StatusPaid`. Note this changes visible wording in two places at once — deliberate, but call it out at capture.

### 4. GROUP_CODE keys live as inline string literals, not constants
`GROUP_REQUEST_TYPE = "RequestType"`, `GROUP_MOVE_TYPE = "MoveRequestType"` are `private const` inside each service
(tracking L26-27, move-license L30/L32, a10 L42). `ConstantSPF.GroupCode` is the designated home but currently only
holds the `*_SEARCH_BY` keys.
⇒ add `REQUEST_TYPE`, `MOVE_REQUEST_TYPE`, `AUTHORITY_GROUP_NO`, `STATUS_PAID` to `ConstantSPF.GroupCode` and use them
from all dashboards. One home, no per-service copies.

### 5. Columns of the table we currently ignore
`SEQUENCE` (dropdown display order), `IS_ACTIVE`, `DISPLAY_TYPE` (`ALL`/`SPF`/`ISPF`/`NONE`), `COLOR_CODE`.
Dashboards are officer-side ⇒ the correct read is **`GetDataActiveByGroupCodeAndDisplayType(group, "SPF")`**
(the repo method already exists) and **order by `SEQUENCE`**, so an inactive or ISPF-only code can never leak into an
officer dropdown. Verify the existing 3 call sites do this too, not just the new ones.

## Explicitly NOT in `T_S_COMMON_CODE` — must stay derived (do not invent a group)
- **สถานะการขนย้าย** — รอดำเนินการ / กำลังขนย้าย / เสร็จสิ้นแล้ว (`DashboardTrackingService` L33-35): computed from
  approved vs moved quantities (DR-16 roll-up A). No such GROUP_CODE exists in the dump.
- **สถานะหนังสืออนุญาต (display)** — ยังไม่หมดอายุ / หมดอายุ (L52-53): computed from `EXPIRY_DATE` vs today (REQ-017 ADD-2).
  ⚠ Note `StatusLicense` **does** exist in the table (10 รอนำเรียน · 20 นำเรียน · 30 ลงนาม/ออกเลขใบอนุญาต · **40 จ่ายหนังสืออนุญาต**)
  but it is the **backbone filter**, not this display label — the two were already conflated once (DR-16 correction).
  Keep them separate. Do not repoint the expiry label at `StatusLicense`.
  (Worth noting: the label we used to hardcode for 40 was "ออกหนังสืออนุญาตแล้ว" — the DB says "จ่ายหนังสืออนุญาต".
  That map is already deleted by TASK-034, so nothing to fix; recorded only so nobody re-adds the wrong wording.)
→ Porter has asked the stakeholder whether these two should be **added to `T_S_COMMON_CODE`** as new groups.

## Acceptance
- [ ] No hardcoded code→label dictionary remains in any `Services/Dashboard*.cs` (grep for `Dictionary<int, string>` /
      `Dictionary<string, string>` returns only genuinely derived, non-code-table maps).
- [ ] Buyer-group 4/5/6/7 rows render their real names in **both** the dropdown and the table (no more "ไม่ระบุ").
- [ ] Group codes come from `ConstantSPF.GroupCode`; lookups use active + `DISPLAY_TYPE` SPF + `SEQUENCE` order.
- [ ] Derived statuses (move status, expiry status) untouched.
- [ ] Stakeholder capture: tracking `/search-filter` + `/table`, a10, license-book `/chart` + `/table`.

## 📋 DATA REQUEST (Porter → stakeholder) — measures the blast radius of finding #1
```sql
SELECT B.AUTHORITY_GROUP_NO, C.CODE_NAME, COUNT(*) AS LICENSES
FROM T_T_LICENSE L
JOIN T_T_REQUEST_MOVE RM   ON RM.REQUEST_ID = L.REQUEST_ID
JOIN T_M_BUYER_AUTHORITY B ON B.ID = RM.BUYER_AUTHORITY_ID
LEFT JOIN T_S_COMMON_CODE C ON C.GROUP_CODE = 'AuthorityGroupNo'
                           AND C.CODE_INT   = B.AUTHORITY_GROUP_NO
WHERE L.FORM_ID = 10 AND L.LICENSE_STATUS = 40
GROUP BY B.AUTHORITY_GROUP_NO, C.CODE_NAME
ORDER BY 1;
```
Any row with `AUTHORITY_GROUP_NO` in (4,5,6,7) = licenses currently mislabelled "ไม่ระบุ" today.
⚠ **SA: adjust the join to whatever path the tracking query actually uses** (`RMV` derived table joins
`T_T_REQUEST_MOVE` + `T_M_BUYER_AUTHORITY` by `REQUEST_ID`) — Porter wrote this from the query shape, not from a run.

@Sober — SPEC + TASK. Item 2 needs your column-level confirmation before any label changes.

---
## ✅ 2026-07-24 — DATA REQUEST answered. Finding #1 CORRECTED (Porter overstated it).
Stakeholder ran the query over all status-40 อ.10s:
| AUTHORITY_GROUP_NO | CODE_NAME (DB) | LICENSES |
|---|---|---|
| 0 | ไม่ระบุ (IS_ACTIVE=0) | 6 |
| 1 | ทหาร | 667 |
| 2 | ตำรวจ | 1,372 |
| 3 | **ภาคเอกชน (สมาคม บริษัทฯ)** | **239** |
| 9 | อื่น ๆ | 203 |

**Groups 4/5/6/7 have ZERO rows.** ⇒ Porter's "licenses currently render ไม่ระบุ" claim was **wrong** —
no license is mislabelled that way today. The missing codes are a latent risk (silently wrong the day such data
appears), not a present outage. **Priority HIGH → MEDIUM.**

### What the data DID confirm — a real, present defect
**Code 3: DB says "ภาคเอกชน (สมาคม บริษัทฯ)", our hardcoded map says "สมาคม" ⇒ 239 licenses show the wrong label
today**, in both the dropdown and the table column, across all 3 services. That alone justifies the REQ.

### Also confirmed benign
Code **0 "ไม่ระบุ"** exists in real data (6 licenses) but is `IS_ACTIVE=0`. Reading active-only means code 0 is not
found and falls through to the `NOT_SPECIFIED` fallback — which is the string "ไม่ระบุ", i.e. **identical output**.
No change needed, but keep the fallback: it is what renders those 6 rows correctly.

### ⚠ Open discrepancy for SA to note (not blocking)
The stakeholder's tracking screenshot shows **"ส่วนราชการตามกฎกระทรวง" (=6)** in the กลุ่มหน่วยผู้ซื้อ column, yet the
query returns zero group-6 licenses and our code could not even produce that label (6 is absent from
`BUYER_GROUP_MAP` → it would render "ไม่ระบุ"). Most likely the captured page is the **existing/reference system**,
not our Center backend. Porter has asked the stakeholder to confirm. Do not treat that screenshot as evidence about
our data source; the SQL is authoritative.

**Net effect on scope: unchanged** — all 5 findings still stand and the fix is the same (read the table). Only the
severity of #1 and the wording of the acceptance criterion change:
- ~~[ ] Buyer-group 4/5/6/7 rows render their real names (no more "ไม่ระบุ")~~ — untestable today, no such data.
- [x] **replaced by:** group 3 renders **"ภาคเอกชน (สมาคม บริษัทฯ)"** (was "สมาคม") in the dropdown and the table —
      239 licenses; and adding a 4/5/6/7 license later must render correctly without a code change.

---
## ✅ 2026-07-24 — DR-17 answered → finding 2 UNBLOCKED (@Sober)
**Q1 — any dedicated group?** `GROUP_CODE LIKE '%Inform%'` returns **only `StatusInform`** (0 รอนำเรียน · 20 นำเรียนแล้ว).
That is a *นำเรียน status* group — **not** a request-type group. ⇒ **No dedicated group exists for `INFORM_REQUEST_TYPE`.**

**Q2 — what values actually occur?** `T_T_INFORM_MOVE.INFORM_REQUEST_TYPE` = **`0` (6 rows) · `1` (6,525 rows)** — only two,
and both are inside `MoveRequestType`'s domain `{0..5}`.

**⇒ Per SPEC-023 F's own decision tree: adopt `MoveRequestType`.** Two independent signals agree, so this is a
conclusion, not a guess:
1. the observed domain `{0,1}` is a subset of `MoveRequestType`, and no other candidate group exists;
2. the hardcoded strings are **literal truncations of that group's labels** —
   `"หน่วยงานตามมาตรา 7"` ⊂ `"ขนย้ายให้หน่วยงานตามมาตรา 7"` (0) and
   `"ขาย/ขนย้ายนอกหน่วยงาน"` ⊂ `"ขายและขนย้ายให้บุคคลอื่นนอกหน่วยงานตามมาตรา 7"` (1).
   Whoever wrote the map was abbreviating this very group.

**Consequence to state at capture:** col5's wording changes from the abbreviations to the full DB labels — expected and
intended, not a regression.

### ❓ One business decision the data cannot make — Porter has put it to the stakeholder
The col5 **filter dropdown**: list **all active codes from the group (6)**, or only the **2 that occur in data**?
Porter's recommendation to the stakeholder = **all active codes from the table**, because (a) every other dropdown in the
suite is built that way, (b) col6 already lists the same group's full set, and (c) "the table is the source of truth" is
the whole point of REQ-021 — filtering by observed data would reintroduce a second, drifting source. Awaiting the answer;
**everything else in finding 2 is unblocked now.**

@Sober — DR-17 is closed. Finalise the task; the dropdown-breadth answer follows separately and only affects the DDL,
not the label mapping.

### ✅ Dropdown breadth — DECIDED by stakeholder 2026-07-24: **option ก — all active codes from the table**
The a10 col5 ประเภทการขออนุญาต DDL lists **every active code of `MoveRequestType`** (6 today), not just the 2 present in
data. Same rule as every other DDL in the suite: **the table is the single source of truth**; the DDL never filters
itself by observed data (that would recreate the second, drifting source REQ-021 exists to remove).
Standard lookup semantics apply — active only, `DISPLAY_TYPE` SPF, ordered by `SEQUENCE` (finding 5).
Selecting a code with no data simply returns an empty result — correct and expected, not a bug.

**REQ-021 now has no open questions.** @Sober — finalise TASK-041; findings 1/3/4/5 were already actionable.
