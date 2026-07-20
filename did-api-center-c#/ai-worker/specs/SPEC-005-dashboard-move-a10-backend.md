# SPEC-005: DASHBOARD_MOVE_A10 — Center backend for the อ.10 movement/delivery dashboard

- Source: REQ-005
- Status: ACTIVE — live capture (DATA REQUEST 3, 2026-07-20) cleared the core but found a dup-row bug +
  blank columns → TASK-006 REWORK. Fix design in the "Live-capture REWORK" section below.

## REWORK #4 (2026-07-20) — ประเภทการขนย้าย re-sourced (stakeholder correction)

Root cause of the persistent blank (DATA REQ 6): `T_R_TRANSPORT_TYPE` is **empty (0 rows)** in this env — the
join/subquery worked. **Stakeholder then re-sourced the field entirely:** ประเภทการขนย้าย is **NOT**
`T_T_LICENSE_DTL.TRANSPORT_TYPE_CODE`/`T_R_TRANSPORT_TYPE`; it is **`T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE`**,
name via **`T_S_COMMON_CODE` group `MoveRequestType`** (codes 0–5: 0 ให้หน่วยงานตามมาตรา 7 · 1 ขาย/ขนย้ายนอก
หน่วยงาน · 2 ทำลาย · 3 ทดสอบ · 4 จัดแสดง · 5 กลับโรงงาน).

**New design (both the table column `transport_type_code_name` AND the ประเภทการขนย้าย dropdown):**
- **Join (code-verified):** `T_T_INFORM_MOVE_DTL.REF_LICENSE_NO` → `T_T_LICENSE L` (already joined,
  `FORM_ID=10`) → `L.REQUEST_ID` (DATADIC:631) → `T_T_REQUEST_MOVE.REQUEST_ID` (DATADIC:906). Resolve the code
  via a **scalar subquery** (avoids the earlier multiplication trap):
  `,(SELECT MAX(RM.MOVE_REQUEST_TYPE) FROM T_T_REQUEST_MOVE RM WHERE RM.REQUEST_ID = L.REQUEST_ID) AS MoveTypeCode`
- **Name resolution:** reuse the move-license `CommonCodeIntMap` pattern —
  `TSCommonCodeRepo.GetDataActiveByGroupCode("MoveRequestType")` → dict `CODE_INT → CODE_NAME`; map
  `MoveTypeCode` → `transport_type_code_name`.
- **Dropdown (SearchFilter, ประเภทการขนย้าย / `transport_type_code_ddl`):** source from the same common-code
  group (`GetDataActiveByGroupCode("MoveRequestType")` → items `{value: CODE_INT, label: CODE_NAME}`) — drop
  the empty `T_R_TRANSPORT_TYPE`. Move-type filter now compares `MoveTypeCode`.
- **Remove the now-dead `T_R_TRANSPORT_TYPE`** entity/repo/UoW wiring + the old `TransportTypeCode` subquery
  (TASK-007 is superseded — Karpathy: remove what this change orphaned). No new entity — common-code is already in the DAL.

⚠ **Naming-trap flag to Porter (non-blocking):** col5 **ประเภทการขออนุญาต** stays sourced from
`INFORM_REQUEST_TYPE` (0/1 hardcoded map, works today); col6 **ประเภทการขนย้าย** now = `MOVE_REQUEST_TYPE`
via `MoveRequestType`. At 0/1 the two read near-identical; col6 diverges at 2–5. The re-run capture will show
whether they differ — confirm the stakeholder genuinely wants both distinct columns (they appear on the page).

## Live-capture REWORK (2026-07-20) — findings + fixes

Capture: `project-docs/data-req-3-2026-07-20-move-a10-live-capture.md` (body `move_date_range
["2026-06-01","2026-06-30"]`, 7 rows). **Cleared:** INNER join `LICENSE_NO=REF_LICENSE_NO & FORM_ID=10`
returns rows; `move_date`/`move_seq`/`moved_qty` populated; `move_request_type_name` (0/1) resolves;
charts SUM `moved_qty` correctly. **To fix:**

1. **Duplicate rows (confirmed bug).** `key:6`/`key:7` identical (license `80/2569`, product `P-0672`) —
   the `LEFT JOIN T_T_LICENSE_DTL LDTL ON LICENSE_ID + PRODUCT_CODE` multiplies the backbone row when a
   license has >1 DTL line for the same product. **Fix: remove that join; resolve `TRANSPORT_TYPE_CODE`
   via a correlated scalar subquery** so it can never multiply rows:
   ```sql
   ,(SELECT MAX(LDTL.TRANSPORT_TYPE_CODE) FROM T_T_LICENSE_DTL LDTL
      WHERE LDTL.LICENSE_ID = L.ID AND LDTL.PRODUCT_CODE = DTL.PRODUCT_CODE) AS TransportTypeCode
   ```
2. **`expiry_date` blank on all rows (mapping bug).** It was mapped from the denormalized (null)
   `DTL.REF_LICENSE_EXPIRY_DATE`. **Fix: source `issue_date` + `expiry_date` from the already-joined
   `T_T_LICENSE L`** (`L.ISSUE_DATE`, `L.EXPIRY_DATE`) — authoritative, and we already have `L`.
3. **`transport_type_code_name` blank on all rows (triage → DATA REQUEST 4).** The LDTL join *did* match
   (it caused the dups) but `TRANSPORT_TYPE_CODE` is null → the license line doesn't carry it for these
   records (move-license had the same trouble). Confirm whether it's ever populated / where ประเภทการขนย้าย
   truly comes from. After the scalar-subquery fix it renders whatever exists (null → blank).
4. **`authority_group_no`(+`_name`) blank → `by_buyer_group` chart dead — RESOLVED (wrong master).**
   DATA REQ 4: `BUYER_AUTHORITY_ID` is **100% populated** but does **not** join `T_M_PRIMARY_BUYER_AUTHORITY.ID`.
   **Root cause (from DATADIC, no DATA REQ 5):** the movement flow uses a *different* buyer master —
   **`T_M_BUYER_AUTHORITY`** ("ข้อมูลหน่วยผู้ซื้อ **ใช้กับแบบ อ.10**", DATADIC:90), which has `AUTHORITY_GROUP_NO`
   (1=ทหาร/2=ตำรวจ/3=สมาคม/9=อื่นๆ). The move-flow FK (`T_T_REQUEST_MOVE.BUYER_AUTHORITY_ID`, DATADIC:911)
   targets `T_M_BUYER_AUTHORITY`, not the PRIMARY master that move-license borrowed.
   **Fix (whole buyer dimension → `T_M_BUYER_AUTHORITY`):**
   - **SQL (1-line swap):** `T_M_PRIMARY_BUYER_AUTHORITY BA` → `T_M_BUYER_AUTHORITY BA ON BA.ID = DTL.BUYER_AUTHORITY_ID`
     (raw-SQL join — no entity needed). `BA.AUTHORITY_GROUP_NO` then resolves → chart + `authority_group_no(_name)` populate.
   - **Dropdowns (SearchFilter):** the buyer **group** + **unit** dropdowns must also source from
     `T_M_BUYER_AUTHORITY` (not PRIMARY) so the filter options match the table's `BUYER_NAME`/group. Add a
     `TMBuyerAuthority` SPF entity/repo (`spf-add-entity`; ID/AUTHORITY_NAME/AUTHORITY_GROUP_NO) and point the two
     dropdowns at it. (Group filter happens to work either way — same 1/2/3/9 codes — but the หน่วยผู้ซื้อ name
     list would mismatch otherwise.)
   - **Verification:** the planned re-run capture confirms the chart populates (strong DATADIC inference; if
     `BUYER_AUTHORITY_ID` still doesn't match `T_M_BUYER_AUTHORITY.ID`, escalate to DATA REQ 5 — low likelihood).
5. **dest region/province blank for `80/2569` — real data, not a bug.** `LEFT JOIN T_T_LICENSE_MOVE`
   correctly yields null when that license has no move-authorization row. Leave as-is.

Everything else (grain, joins, filters, movement/charts) stays as designed above.

## Overview

A new officer dashboard `dashboard-move-a10` ("ยอดการขนย้าย/ส่งมอบอาวุธ ตามแบบ อ.10"), a **sibling of
`dashboard-move-license`** but keyed on **actual movement/delivery transactions** (move date, move
sequence, actual moved qty), not permitted amounts. Same endpoint shapes, cascade design, filter
sources, `ResponseResult` envelope, shared-class hard constraint, and **DB-column snake_case keys from
day one** (so no later rename REQ — REQ-005 #4). New `DashboardMoveA10*` controller/service/models
mirroring `DashboardMoveLicense*`, registered in `Program.cs`.

**Naming convention:** reuse the delivered move-license keys verbatim for every shared field (the
frontend already knows them); add snake_case keys for the 3 new movement fields (see §Models). Shared
`DashboardChartData`/`DashboardChartCategory`/`DashboardChartSeriesItem` and `DropdownDDL*` inner keys —
**untouched** (hard constraint).

## What is SETTLED (designable from code — no data gap)

### Endpoints (mirror move-license, officer-only, `[OfficerOnlyFilter]`, route base `api/v1/officer`)
| Endpoint | Verb | Response |
|---|---|---|
| `/dashboard-move-a10/search-filter` | GET | `DashboardMoveA10SearchFilterResponse` |
| `/dashboard-move-a10/search-filter-province` | GET `?dest_area_name=` | `DropdownDDLData` |
| `/dashboard-move-a10/search-filter-unit` | GET `?product_type_group_code=` | `DropdownDDLData` |
| `/dashboard-move-a10/search-filter-weapon` | GET `?product_type_group_code=&quantity_unit_id=` | `DropdownDDLData` |
| `/dashboard-move-a10/chart` | POST `DashboardMoveA10SearchRequest` | `DashboardMoveA10ChartsResponse` |
| `/dashboard-move-a10/table` | POST `DashboardMoveA10SearchRequest` | `List<DashboardMoveA10TableRow>` |

(Query-param names already follow the snake_case convention delivered on move-license SPEC-001 §E.)

### Filters / dropdown sources (identical to move-license unless noted)
- ผู้ประกอบการ = `TMTraderRepo.GetDataActiveFactory`; ภาค = `V_PROVINCE.AREA_NAME`; จังหวัด (cascade) =
  `VProvinceViewRepo.GetByAreaName`; ประเภทอาวุธ = `ProductTypeGroupCode` **from DB** (per REQ-002/SPEC-002
  precedent — `TMProductTypeGroupRepo`, or config if the stakeholder wants parity with move-a10 later);
  หน่วยนับ (cascade) = `TMUnitRepo` / `VwProductRepo.GetDataByProductTypeGroupCode`; อาวุธ (cascade) =
  `VwProductRepo.GetByTypeGroupAndUnit`; กลุ่มหน่วยผู้ซื้อ/หน่วยผู้ซื้อ = `TMPrimaryBuyerAuthorityRepo`
  (+ the buyer-group `AUTHORITY_GROUP_NO` map).
- **ประเภทการขออนุญาต (MOVE_REQUEST_TYPE)** — **RESOLVED** (improves on move-license, which returned
  empty): DATADIC documents it as a fixed enum `0 = หน่วยงานตามมาตรา 7`, `1 = ขาย/ขนย้ายนอกหน่วยงาน`.
  Build from a fixed 2-value map (like the buyer-group map). Value = `0/1`, label = the Thai text.
- **ประเภทการขนย้าย (TRANSPORT_TYPE_CODE)** — source is **`T_R_TRANSPORT_TYPE`** (DATADIC: FK target).
  This ref table is **not yet wired into the SPF DAL** (no entity/repo). Needs a new SPF entity +
  repository (`spf-add-entity`) for `T_R_TRANSPORT_TYPE` (CODE → Thai name). Its exact columns aren't in
  DATADIC — **confirm columns** (DATA REQUEST 2, small). Once wired: dropdown value = code, label = name.

### Table — license-side columns (all traceable, reuse move-license mapping)
Same source query as `GetMoveLicenseDashboard` for the license side: `license_no` (L.LICENSE_NO),
`issue_date` (L.ISSUE_DATE), `expiry_date` (L.EXPIRY_DATE), `move_request_type_name` (from the 0/1 map),
`transport_type_code_name` (from T_R_TRANSPORT_TYPE), `trader_name`, `authority_group_no` +
`authority_group_no_name`, `authority_name`, origin/dest address block, `product_code`, `product_name`,
permitted qty `quantity`, `unit_name`, `dest_area_name`. (Keys identical to move-license SPEC-001 §D.)

## Movement data backbone (RESOLVED — INFORM_MOVE family; DATA REQUEST 1 answered 2026-07-20)

The actual per-move data lives in the **`INFORM_MOVE` family** ("การแจ้งขนย้าย"), NOT the license tables.
Source doc: `project-docs/data-req-2026-07-20-move-a10-results.md`.

- **Backbone (grain = per moved item):** `T_T_INFORM_MOVE_DTL DTL` INNER JOIN `T_T_INFORM_MOVE H`
  (`H.ID = DTL.INFORM_MOVE_ID`). One row = one moved weapon line — matches the table's grain.
  - Chose the **base tables over the `V_INFORM_MOVE_DTL_LOT` view**: the view is per-**lot** (`LOT_NO`,
    `TOTAL_LOT_NO`), finer than per-move-item, so summing `QUANTITY` over it would multiply. Use DTL.
- **Movement fields (the point of this dashboard):**
  | Response key | Source | Note |
  |---|---|---|
  | `move_date` | `DTL.MOVE_DATE` | วันที่ขนย้าย — **also the primary date filter** |
  | `move_seq` | `DTL.MOVE_SEQ` | ครั้งที่ขนย้าย (int) — note: key = `move_seq` (column), **not** `move_seq_no` |
  | `moved_qty` | `DTL.QUANTITY` | จำนวนที่ขนย้าย (actual moved) |
  | `quantity` | `DTL.ALLOWED_QUANTITY` | จำนวนที่ได้รับอนุญาต (permitted) — keep key `quantity` for cross-dashboard consistency with move-license (there permitted qty = `quantity`) |
- **Denormalized on DTL (no extra join needed):** `REF_LICENSE_NO`, `REF_LICENSE_ISSUE_DATE`,
  `REF_LICENSE_EXPIRY_DATE`, `PRODUCT_CODE`, `PRODUCT_NAME`, `BUYER_AUTHORITY_ID`, `BUYER_NAME`,
  `QUANTITY_UNIT_ID`. Header `H` gives `TRADER_ID`, `INFORM_REQUEST_TYPE`.
- **Enrichment joins (resolve the remaining filters/labels — all designable from code):**
  - `T_M_TRADER TR ON TR.ID = H.TRADER_ID` → `trader_name` (ผู้ประกอบการ).
  - `T_M_UNIT U ON U.ID = DTL.QUANTITY_UNIT_ID` → `unit_name`.
  - `T_M_PRIMARY_BUYER_AUTHORITY BA ON BA.ID = DTL.BUYER_AUTHORITY_ID` → `AUTHORITY_GROUP_NO`
    (`authority_group_no` + `authority_group_no_name` via the buyer-group map); `authority_name` = `DTL.BUYER_NAME`.
  - **License back-join for dest region/province + move type + อ.10 scoping** (mirrors move-license):
    `T_T_LICENSE L ON L.LICENSE_NO = DTL.REF_LICENSE_NO`, then
    `T_T_LICENSE_MOVE LM ON LM.LICENSE_ID = L.ID` → `LM.DEST_PROVINCE_NAME` (`dest_province_name`),
    `V_PROVINCE VP ON VP.PROVINCE_NAME = LM.DEST_PROVINCE_NAME` → `VP.AREA_NAME` (`dest_area_name`); and
    `T_T_LICENSE_DTL LDTL ON LDTL.LICENSE_ID = L.ID AND LDTL.PRODUCT_CODE = DTL.PRODUCT_CODE` →
    `LDTL.TRANSPORT_TYPE_CODE` (`transport_type_code_name`, resolved via `T_R_TRANSPORT_TYPE` — TASK-007).
- **Charts** (measure = SUM(`DTL.QUANTITY`) actual moved qty): `top5_by_buyer_unit` (group `BUYER_NAME`,
  top 5), `by_buyer_group` (group `AUTHORITY_GROUP_NO` label), `by_trader` (group `trader_name`).
- **Filters** all now sourced: move-date range (`DTL.MOVE_DATE`, in SQL), trader (`H.TRADER_ID`), buyer
  group/unit (`BA.AUTHORITY_GROUP_NO`/`DTL.BUYER_NAME`), weapon type/unit/weapon
  (`PRODUCT_CODE`/`QUANTITY_UNIT_ID` — note DTL has no PRODUCT_TYPE_GROUP_CODE; get it from the LDTL/license
  join or `VwProduct` by PRODUCT_CODE), dest region/province (LM via the back-join), ประเภทการขออนุญาต
  (`H.INFORM_REQUEST_TYPE`), ประเภทการขนย้าย (`LDTL.TRANSPORT_TYPE_CODE`).

### Design assumptions to verify (from code + at build/test — NOT new blockers)
1. **`REF_LICENSE_NO` ↔ `T_T_LICENSE.LICENSE_NO`** join validity (the DATA REQ doc labels REF_LICENSE_NO
   as the อ.10 license link). If the string format diverges, the enrichment (dest/transport/scoping)
   needs adjusting — BE to sanity-check on first run.
2. **`H.INFORM_REQUEST_TYPE` == the `MOVE_REQUEST_TYPE` 0/1 enum** (ประเภทการขออนุญาต). Both are the
   move-request-type; confirm the values line up with the 0/1 map. If not, adjust the map.
3. **อ.10 scoping:** add `AND L.FORM_ID = 10` on the license back-join if INFORM_MOVE is not inherently
   อ.10-only. Safe to include; keep it.
4. **Grain/addresses:** the move-a10 **table has no address columns** (capture doc cols 1–15). The
   scaffold model carries move-license's origin/dest address block — harmless (frontend ignores extras),
   but only `dest_province_name`/`dest_area_name` are actually needed (for filtering). BE may leave the
   extra address fields empty or trim them; not required for acceptance.

## Models (new, `Models/Dashboard/DashboardMoveA10Model.cs`)

Mirror `DashboardMoveLicense*` shapes/keys. `DashboardMoveA10TableRow` = the move-license table row keys
**plus** three new keys (snake_case per convention; final source per DATA REQUEST 1):
`move_date` · `move_seq_no` · `moved_qty`. Request `DashboardMoveA10SearchRequest` = the move-license
request **but the date range filters the move date** → key `move_date_range` (not `issue_date_range`).
Charts response = 3 `DashboardChartData` containers: `top5_by_buyer_unit`, `by_buyer_group`, `by_trader`
(container keys snake_case; inner `DashboardChartData` untouched). Exact chart container keys pending Q3
confirmation but default to these.

## Non-functional / Out of scope

- `dotnet build` succeeds; DI registration in `Program.cs` (Scoped service, like `DashboardMoveLicenseService`).
- No change to move-license/license-book/other dashboards; shared classes untouched; no frontend code.

## Tasks

- TASK-005: Scaffold `DashboardMoveA10` (controller + models + search-filter + 3 cascades + MOVE_REQUEST_TYPE
  enum dropdown + DI). **DONE** (reviewed 2026-07-20).
- TASK-006: Chart + table on the **INFORM_MOVE backbone** (add the SPF DAL query/entity for
  `T_T_INFORM_MOVE`/`_DTL` + the enrichment joins above; implement `TableData`/`ChartData`; move-date filter;
  rename the placeholder key `move_seq_no` → `move_seq`). **UNBLOCKED** (data resolved). (depends on: TASK-005)
- TASK-007: Add `T_R_TRANSPORT_TYPE` SPF entity/repo (`TRANSPORT_TYPE_CODE` + `TRANSPORT_TYPE_NAME`) + wire
  the ประเภทการขนย้าย dropdown + table `transport_type_code_name`. **UNBLOCKED** (columns confirmed).
  (depends on: — ; TASK-006 consumes it for the table's `transport_type_code_name`.)

## Resolved data sources (both DATA REQUESTs answered 2026-07-20)

- **DATA REQUEST 1 → INFORM_MOVE family** (see the backbone section above). Movement data =
  `T_T_INFORM_MOVE` + `T_T_INFORM_MOVE_DTL`; enriched from the license via `REF_LICENSE_NO`.
- **DATA REQUEST 2 → `T_R_TRANSPORT_TYPE`** = `TRANSPORT_TYPE_CODE` (code) + `TRANSPORT_TYPE_NAME` (Thai
  label) [+ audit]. → TASK-007 SPF entity.
- **Q3 (frontend keys) → by convention.** Keys follow the delivered move-license snake_case; table cols
  5/6 = `move_request_type_name` (`INFORM_REQUEST_TYPE`) + `transport_type_code_name`
  (`LDTL.TRANSPORT_TYPE_CODE`). No frontend types were supplied; the FE (still on mock) adopts these.

## Questions (Jason ↔ Sober)

(Jason asks here; Sober answers as `> answer: ...`)
