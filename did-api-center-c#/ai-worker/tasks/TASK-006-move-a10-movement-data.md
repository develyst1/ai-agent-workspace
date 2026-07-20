# TASK-006: DASHBOARD_MOVE_A10 chart + table on the INFORM_MOVE backbone

- Source: SPEC-005 (revised 2026-07-20 — data resolved)
- Status: DONE (code — REWORK #4 verified 2026-07-20). Final acceptance = re-run live capture (Porter).
- Depends on: TASK-005 (DONE)

## REWORK #4 review — Verdict: DONE (code) — Sober (SA), 2026-07-20

Verified the code: SQL `,(SELECT MAX(RM.MOVE_REQUEST_TYPE) FROM T_T_REQUEST_MOVE RM WHERE RM.REQUEST_ID =
L.REQUEST_ID) AS MoveTypeCode` (repo L52-54) ✓; service resolves `MoveTypeCode` via
`CommonCodeIntMap("MoveRequestType")` (L244/273) and the dropdown via `GetDataActiveByGroupCode` with
**`Value = CODE_INT`** (L60-64 — matches the filter `InList(req.MoveTypes, r.MoveTypeCode?.ToString())`) ✓;
col5 ประเภทการขออนุญาต left as-is (INFORM_REQUEST_TYPE 0/1 map) ✓; **`T_R_TRANSPORT_TYPE` fully removed** —
grep across `spf/` = zero residue ✓; build 0 errors. Prior fixes (dedup/dates/buyer-group) intact.
**Final acceptance = the re-run capture** confirms `transport_type_code_name` populates (= the L.REQUEST_ID →
T_T_REQUEST_MOVE join resolves on live data; traced from DATADIC:631/906). col5/col6 flag routed to Porter.

## REWORK #4 applied (Jason, 2026-07-20)

Re-sourced ประเภทการขนย้าย per Sober's SPEC-005 "REWORK #4" (T_R_TRANSPORT_TYPE was empty; stakeholder
re-sourced the field). Now `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE` → name via `T_S_COMMON_CODE` group
`MoveRequestType`. All 5 steps done:

1. **SQL (`GetMoveA10Dashboard`):** replaced the LDTL scalar subquery with
   `,(SELECT MAX(RM.MOVE_REQUEST_TYPE) FROM T_T_REQUEST_MOVE RM WHERE RM.REQUEST_ID = L.REQUEST_ID) AS MoveTypeCode`
   (`L` already joined; `L.REQUEST_ID`). DTO field `TransportTypeCode` → `MoveTypeCode`.
2. **Service map/filter:** `transport_type_code_name` now resolves `MoveTypeCode` via `CommonCodeIntMap("MoveRequestType")`
   (added the helper, mirrors move-license `CODE_INT→CODE_NAME`); response key unchanged. Move-type filter →
   `InList(req.MoveTypes, r.MoveTypeCode?.ToString())`.
3. **Dropdown (`SearchFilter`):** ประเภทการขนย้าย now from `TSCommonCodeRepo.GetDataActiveByGroupCode("MoveRequestType")`
   → `{value: CODE_INT, label: CODE_NAME}` (replaced the `TRTransportTypeRepo` lookup).
4. **Removed dead `T_R_TRANSPORT_TYPE`:** deleted `TRTransportTypeEntity` + `TRTransportTypeRepository`, unwired from
   `IUnitOfWorkSPF`/`UnitOfWorkSPF` (property + reset). Grep confirms **zero `TRTransportType` residue** in the
   codebase. (TASK-007 superseded.)
5. `dotnet build` → **Build succeeded. 0 Error(s).**

**Verified:** grep — SQL uses `T_T_REQUEST_MOVE`/`MoveTypeCode`; service uses common-code group `"MoveRequestType"`
for both the dropdown and the row map; no `TRTransportType` anywhere. Rework #1/#2/#3-accepted (dedup, dates,
buyer-group) untouched.

**Naming trap (reported, not fixed — @Sober routing to Porter):** col5 ประเภทการขออนุญาต (`INFORM_REQUEST_TYPE`,
my fixed 0/1 `MOVE_REQUEST_TYPE_MAP`) vs col6 ประเภทการขนย้าย (`MOVE_REQUEST_TYPE` via common-code) read
near-identical at 0/1 but col6 diverges at 2–5. Left col5 as-is per the task. Clearly commented in the service
(`GROUP_MOVE_TYPE`) to prevent a future mixup.

Re-run the same live capture → expect `transport_type_code_name` populated (`81/2569`→"ขนย้ายให้หน่วยงานตามมาตรา 7",
`80/2569`→"ขนย้ายเพื่อทดสอบ", per Sober's note). Runtime caveat (brownfield, flagged): `L.REQUEST_ID` +
`T_T_REQUEST_MOVE.REQUEST_ID` join validity is confirmable only at the re-run — Sober traced it from DATADIC:631.

## REWORK #4 (2026-07-20) — re-source ประเภทการขนย้าย (design in SPEC-005 "REWORK #4")

DATA REQ 6: the blank was an **empty `T_R_TRANSPORT_TYPE`**, and the stakeholder **re-sourced** the field.
ประเภทการขนย้าย is now **`T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE`** → name via **`T_S_COMMON_CODE` group
`MoveRequestType`** (0–5). Do:

1. **SQL (`GetMoveA10Dashboard`):** replace the `TransportTypeCode` LDTL scalar-subquery with
   `,(SELECT MAX(RM.MOVE_REQUEST_TYPE) FROM T_T_REQUEST_MOVE RM WHERE RM.REQUEST_ID = L.REQUEST_ID) AS MoveTypeCode`
   (`L` is already joined; `L.REQUEST_ID` = DATADIC:631). Rename the DTO field `TransportTypeCode` → `MoveTypeCode`.
2. **Service:** resolve the name via the move-license `CommonCodeIntMap` pattern —
   `TSCommonCodeRepo.GetDataActiveByGroupCode("MoveRequestType")` → dict `CODE_INT→CODE_NAME`; map
   `MoveTypeCode` → the row's `transport_type_code_name` (keep the response key). Move-type filter →
   `InList(req.MoveTypes, r.MoveTypeCode?.ToString())`.
3. **Dropdown (`SearchFilter`, ประเภทการขนย้าย):** source from the same common-code group
   (`GetDataActiveByGroupCode("MoveRequestType")` → `{value: CODE_INT, label: CODE_NAME}`), replacing the
   `TRTransportTypeRepo` lookup.
4. **Remove the now-dead `T_R_TRANSPORT_TYPE`:** delete `TRTransportTypeEntity`/`TRTransportTypeRepository`
   + the `IUnitOfWorkSPF`/`UnitOfWorkSPF` wiring + all `TRTransportTypeRepo` usages (TASK-007 is superseded).
5. `dotnet build`, set REVIEW → Porter re-runs the same capture (expect `transport_type_code_name` populated:
   `81/2569`→"ขนย้ายให้หน่วยงานตามมาตรา 7", `80/2569`→"ขนย้ายเพื่อทดสอบ").

**Naming trap (report at re-run, don't fix):** col5 ประเภทการขออนุญาต (INFORM_REQUEST_TYPE 0/1) vs col6
ประเภทการขนย้าย (MOVE_REQUEST_TYPE) read near-identical at 0/1 — @Sober is flagging to Porter; leave col5 as-is.

## REWORK #3 (2026-07-20) — transport-type only (gated on DATA REQ 6)

Re-run capture accepted **3/4**: dedup ✓, dates ✓, **buyer-group chart ✓** (the `T_M_BUYER_AUTHORITY` swap
works — chart = "ทหาร" 30330, consistent). Only `transport_type_code_name` is still blank, and DATA REQ 5
proved the codes exist (`0`/`3`/`1`) → it's a resolution bug, **not** missing data.

**Do NOT apply a fix yet — the cause isn't pinned down.** The board's "MAX subquery non-unique → blank"
reasoning is wrong (`MAX(3,1)=3`). All rows blank = one systematic cause; two candidates (@Sober raised
DATA REQUEST 6 to decide):
- **(B) PRODUCT_CODE correlation mismatch** (INFORM_MOVE_DTL vs LICENSE_DTL format/whitespace) → subquery
  NULL every row → fix = `TRIM`/normalize the `PRODUCT_CODE` join.
- **(A) name-lookup / ref-table miss** (codes `0`/`3` not in `T_R_TRANSPORT_TYPE`) → code `0` is a legit
  "none" (blank real); note any genuinely-missing code.

When DATA REQ 6 lands: if (b)`resolved_code` NULL → apply the TRIM fix; if it returns 0/3 but the ref table
lacks them → accept the blank (real). One line either way. Then re-run the same capture. **Other 3 fixes stay.**

## REWORK #2 review — Verdict: DONE (code) — Sober (SA), 2026-07-20

Verified the actual code: `TMBuyerAuthorityEntity` (`[Table("T_M_BUYER_AUTHORITY")]`, `Id`/`AuthorityGroupNo`/
`AuthorityName`) ✓; SQL join swapped to `T_M_BUYER_AUTHORITY BA ON BA.ID = DTL.BUYER_AUTHORITY_ID` (repo line 65)
✓; SearchFilter buyer group+unit dropdowns now use `TMBuyerAuthorityRepo.GetAllAsync()` (service line 83) ✓;
UoW wiring present; build 0 errors. Rework #1 (dedup scalar subquery + dates from `L.*`) intact.

**All live-capture findings now have verified code fixes.** Remaining uncertainty is data-only: does
`BUYER_AUTHORITY_ID` actually match `T_M_BUYER_AUTHORITY.ID` (strong DATADIC inference) → the **re-run live
capture** (Porter, REQ-005 acceptance) confirms the `by_buyer_group` chart populates. If it still comes back
null, that's the low-likelihood DATA REQ 5 escalation; otherwise REQ-005 → DELIVERED.

## REWORK #2 applied (Jason, 2026-07-20) — buyer-group master swap

Per Sober's DATADIC finding (no DATA REQUEST needed): the อ.10 movement flow's `BUYER_AUTHORITY_ID` targets
**`T_M_BUYER_AUTHORITY`** (has `AUTHORITY_GROUP_NO` 1/2/3/9), not the `T_M_PRIMARY_BUYER_AUTHORITY` that
move-license used. Fixed the whole buyer dimension:

1. **SPF DAL — new entity/repo `T_M_BUYER_AUTHORITY`** (via `spf-add-entity`): `Entities/TMBuyerAuthorityEntity.cs`
   (`[Table("T_M_BUYER_AUTHORITY")]`, `[Key] Id`, `AuthorityGroupNo` = `AUTHORITY_GROUP_NO`, `AuthorityName` =
   `AUTHORITY_NAME` — the 3 DATADIC-confirmed columns; read-only so plain `[Key]`, no sequence) +
   `Repositories/TMBuyerAuthorityRepository.cs` (ctor; dropdowns use inherited `GetAllAsync`). Wired into
   `IUnitOfWorkSPF` + `UnitOfWorkSPF` (property + `resetRepositories()` TM group).
2. **SQL (`GetMoveA10Dashboard`) — 1-line join swap:** `T_M_PRIMARY_BUYER_AUTHORITY BA` → `T_M_BUYER_AUTHORITY BA
   ON BA.ID = DTL.BUYER_AUTHORITY_ID`. Now `BA.AUTHORITY_GROUP_NO` resolves → `authority_group_no` +
   `authority_group_no_name` column + the `by_buyer_group` chart populate.
3. **Service `SearchFilter()` dropdowns:** buyer-group + buyer-unit now sourced from `TMBuyerAuthorityRepo.GetAllAsync()`
   (group = `AuthorityGroupNo` via `BUYER_GROUP_MAP`; unit = `AuthorityName`) — filter options now match the
   table's `BUYER_NAME` source.

**Verified:** `dotnet build` → **Build succeeded. 0 Error(s).** Grep: new repo wired in all 3 DAL spots (interface
1 + UoW 4); SQL joins `T_M_BUYER_AUTHORITY`; service dropdowns use `TMBuyerAuthorityRepo`. Rework #1 (dedup +
date) untouched and intact.

Re-run the same live capture to confirm: `by_buyer_group` chart populates + `authority_group_no(_name)` non-empty
(also confirms `BUYER_AUTHORITY_ID`↔`T_M_BUYER_AUTHORITY.ID`; if still null → DATA REQUEST 5, low likelihood).
Transport-type + dedup + dates already confirmed by rework #1.

## SA review of rework #1 + REWORK #2 (Sober, 2026-07-20)

**Rework #1 verified GOOD** (read the SQL): (1) dup rows fixed — LDTL join dropped, `TransportTypeCode` via
correlated scalar subquery `MAX(...)` (can't multiply); (2) `issue_date`/`expiry_date` now from the joined
`L.ISSUE_DATE`/`L.EXPIRY_DATE`. Both correct. Transport-type is confirmed real data (DATA REQ 4: ~70% populated)
— it'll surface after the dedup fix.

**REWORK #2 — buyer-group master is wrong (resolved from DATADIC, no DATA REQUEST needed).** DATA REQ 4 found
`BUYER_AUTHORITY_ID` is 100% populated but doesn't join `T_M_PRIMARY_BUYER_AUTHORITY`. The อ.10 movement flow
uses **`T_M_BUYER_AUTHORITY`** ("ใช้กับแบบ อ.10", has `AUTHORITY_GROUP_NO` 1/2/3/9; the move FK targets it —
DATADIC:90/911), not the PRIMARY master move-license borrowed. Fix the whole buyer dimension:
1. **SQL (`GetMoveA10Dashboard`, ~line 65) — 1-line swap:** `T_M_PRIMARY_BUYER_AUTHORITY BA` →
   `T_M_BUYER_AUTHORITY BA ON BA.ID = DTL.BUYER_AUTHORITY_ID`. `BA.AUTHORITY_GROUP_NO` → the `by_buyer_group`
   chart + `authority_group_no(_name)` column populate. (Raw SQL — no entity needed for the join.)
2. **SearchFilter dropdowns:** add a `TMBuyerAuthority` SPF entity/repo (`spf-add-entity`;
   `ID`/`AUTHORITY_NAME`/`AUTHORITY_GROUP_NO`, `[Table("T_M_BUYER_AUTHORITY")]`, wire into `IUnitOfWorkSPF`), and
   point the **buyer-group + buyer-unit** dropdowns at it (group = `AUTHORITY_GROUP_NO` via `BUYER_GROUP_MAP`;
   unit = `AUTHORITY_NAME`) so the filter options match the table's `BUYER_NAME`.
- Then `dotnet build`, set REVIEW. Porter re-runs the same capture → confirm the by_buyer_group chart populates
  (also confirms `BUYER_AUTHORITY_ID`↔`T_M_BUYER_AUTHORITY.ID`; if still null, that's the DATA REQ 5 escalation
  — low likelihood given DATADIC).

## REWORK applied (Jason, 2026-07-20) — 2 code fixes per Sober's triage

Live capture (`project-docs/data-req-3-2026-07-20-move-a10-live-capture.md`) cleared the highest-risk join
(rows come back) but found a **duplicate-row bug** (`key:6`==`key:7`, license `80/2569`) + an **empty
`expiry_date`**. Sober triaged → 2 code fixes; done in `TTInformMoveDtlRepository.GetMoveA10Dashboard`:

1. **Duplicate rows (confirmed bug — check #3).** Root cause = the `LEFT JOIN T_T_LICENSE_DTL LDTL ON
   LICENSE_ID + PRODUCT_CODE` multiplied backbone rows when a license had >1 DTL line for the same product
   (exactly the assumption #4 I flagged). **Fix:** dropped the LDTL join; `transport_type_code` now resolves via
   a **correlated scalar subquery** `(SELECT MAX(LDTL.TRANSPORT_TYPE_CODE) FROM T_T_LICENSE_DTL LDTL WHERE
   LDTL.LICENSE_ID = L.ID AND LDTL.PRODUCT_CODE = DTL.PRODUCT_CODE)` → exactly one value per backbone row, no
   multiplication. Grain is now strictly per-moved-item. (Chart `SUM(moved_qty)` no longer at risk of double-count.)
2. **Blank `expiry_date` / `issue_date` (check E).** `DTL.REF_LICENSE_ISSUE_DATE`/`REF_LICENSE_EXPIRY_DATE` are
   null in the data. **Fix:** source both from the joined license — `L.ISSUE_DATE AS IssueDate`,
   `L.EXPIRY_DATE AS ExpiryDate` (the license back-join already exists and is INNER, so always present).

**Not code bugs — routed elsewhere (per Sober's triage on the board):**
- Empty `transport_type_code_name` (C) and empty `authority_group_no`/`_name` → `by_buyer_group` chart (D):
  the resolution code is correct; whether the DB actually holds these values is **DATA REQUEST 4** (Porter →
  stakeholder): (a) is `T_T_INFORM_MOVE_DTL.BUYER_AUTHORITY_ID` populated? (b) is `T_T_LICENSE_DTL.TRANSPORT_TYPE_CODE`
  ever set for อ.10? Left as-is pending that answer — do not guess a source.
- Dest region/province blank for `80/2569` (G) = **real data** (confirmed not a bug) — no change.
- `purchase_document`/address carry-overs = harmless scaffold fields — no change.

Re-run the same live capture to confirm: dupes gone + expiry/issue populated. Buyer-group/transport-type
depend on DATA REQUEST 4.

## REWORK (2026-07-20) — from the DATA REQUEST 3 live capture

The core works (INNER join returns rows, movement fields + enum + chart SUMs correct). Two code fixes to do
now; two blank-source items gated on DATA REQUEST 4. Full analysis: SPEC-005 "Live-capture REWORK" +
`project-docs/data-req-3-2026-07-20-move-a10-live-capture.md`.

**Do now (code fixes — in `TTInformMoveDtlRepository.GetMoveA10Dashboard`):**
1. **Kill the duplicate rows (confirmed bug).** Remove `LEFT JOIN T_T_LICENSE_DTL LDTL ON LICENSE_ID +
   PRODUCT_CODE`; get `TransportTypeCode` via a **correlated scalar subquery** instead (can't multiply rows):
   `,(SELECT MAX(LDTL.TRANSPORT_TYPE_CODE) FROM T_T_LICENSE_DTL LDTL WHERE LDTL.LICENSE_ID = L.ID AND LDTL.PRODUCT_CODE = DTL.PRODUCT_CODE) AS TransportTypeCode`
2. **Fix `expiry_date` (blank everywhere).** Source `IssueDate`/`ExpiryDate` from the joined `T_T_LICENSE L`
   (`L.ISSUE_DATE`, `L.EXPIRY_DATE`) instead of the null `DTL.REF_LICENSE_ISSUE_DATE`/`REF_LICENSE_EXPIRY_DATE`.

**Gated on DATA REQUEST 4 (@Sober is routing via @Porter — don't guess these):**
3. `transport_type_code_name` blank — after fix #1 it renders whatever `TRANSPORT_TYPE_CODE` holds; if the DB
   truly has none, it stays blank (document as a real gap). Await DATA REQUEST 4.
4. `authority_group_no`/`by_buyer_group` chart dead — needs the real buyer-group source for movement rows
   (likely `DTL.BUYER_AUTHORITY_ID` is null). **Do not** invent a source. Await DATA REQUEST 4, then wire it.

**After the fixes:** `dotnet build`, set REVIEW; Porter re-runs the same capture (dupes gone, expiry present,
buyer-group populated once DATA REQ 4 lands).

## Original task (still the baseline design)

## What to do

Implement the real table + charts for `dashboard-move-a10`, sourced from the **INFORM_MOVE family** per
**SPEC-005 → "Movement data backbone"**. This replaces the `// TASK-006` stubs in `DashboardMoveA10Service`.

### 1. SPF DAL — add the movement source (use `spf-add-entity` where an entity is needed)
- Add entities/repo for `T_T_INFORM_MOVE_DTL` (+ `T_T_INFORM_MOVE` header) and a query-result DTO
  `DashboardMoveA10QueryResult` (grain = per moved item). Wire the repo into `IUnitOfWorkSPF`/`UnitOfWorkSPF`.
- Add a `GetMoveA10Dashboard(string moveDateStart, string moveDateEnd)` using `QueryJoinAsync<DashboardMoveA10QueryResult>`
  with the exact joins in SPEC-005 (DTL + header + `T_M_TRADER` + `T_M_UNIT` + `T_M_PRIMARY_BUYER_AUTHORITY`
  + license back-join `T_T_LICENSE`/`T_T_LICENSE_MOVE`/`V_PROVINCE`/`T_T_LICENSE_DTL`). Filter the
  **move-date range on `DTL.MOVE_DATE`** in SQL (mirror `GetMoveLicenseDashboard`'s date-range pattern);
  add `AND L.FORM_ID = 10` (อ.10 scoping) on the license back-join.

### 2. Service — `TableData()` / `ChartData()` (mirror `DashboardMoveLicenseService`)
- Map each row to `DashboardMoveA10TableRow`: license-side keys as in move-license, **plus**
  `move_date` (`MOVE_DATE`, `yyyy-MM-dd`/TH as the frontend expects), `move_seq` (`MOVE_SEQ`),
  `moved_qty` (`DTL.QUANTITY`); `quantity` = `ALLOWED_QUANTITY` (permitted). `move_request_type_name`
  from the 0/1 map on `INFORM_REQUEST_TYPE`; `transport_type_code_name` from `LDTL.TRANSPORT_TYPE_CODE`
  (via TASK-007's `T_R_TRANSPORT_TYPE` — until it lands, leave a resolvable seam / code fallback).
- **Rename the model key** `move_seq_no` → **`move_seq`** on `DashboardMoveA10TableRow` (matches column
  `MOVE_SEQ`; SPEC-005).
- Reuse move-license's LINQ multi-select filters (`InList`/`MatchEq`) for the remaining filters (companies,
  buyers, buyer units, region, provinces, weapon category, unit, weapons).
- Charts (measure = `SUM(moved_qty)`): `top5_by_buyer_unit` (group buyer unit, take top 5),
  `by_buyer_group` (group buyer-group label), `by_trader` (group trader). Reuse the shared
  `DashboardChartData`/`BuildChart` shape.

### 3. Verify the SPEC-005 assumptions on first run (flag, don't guess)
- `REF_LICENSE_NO` ↔ `T_T_LICENSE.LICENSE_NO` join actually matches; `INFORM_REQUEST_TYPE` values are the
  0/1 enum. If either is off, report back to @Sober (don't silently patch semantics).

## Definition of Done
- [x] Table returns real `move_date` / `move_seq` / `moved_qty` (mapped from `DTL.MOVE_DATE`/`MOVE_SEQ`/`QUANTITY`)
      + all license-side columns. (Values are DB-driven; live capture is brownfield — see Notes.)
- [x] Move-date range filter (SQL, `DTL.MOVE_DATE`) + every page filter (LINQ, mirror move-license) wired;
      charts measure `SUM(moved_qty)`.
- [x] `move_seq_no` key renamed to `move_seq`; shared classes / other dashboards untouched.
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).** Assumptions to verify on first DB run — see Notes.

## Implementation Notes

**Done by Jason 2026-07-17.** Implemented the real `dashboard-move-a10` table + charts on the INFORM_MOVE
backbone per SPEC-005 → "Movement data backbone". Replaced the `// TASK-006` stubs.

### SPF DAL added
- **Entities** `Entities/TTInformMoveEntity.cs` (header `T_T_INFORM_MOVE`) + `Entities/TTInformMoveDtlEntity.cs`
  (detail `T_T_INFORM_MOVE_DTL`, grain = per moved item). Read-only usage → plain `[Key]` on `ID` (no
  `[SequenceAuto]`; never inserted, and the skill says don't guess a sequence name).
- **Query DTO** `QueryResult/DashboardMoveA10QueryResult.cs` (Pascal auto-map from the SQL aliases).
- **Repos** `Repositories/TTInformMoveRepository.cs` (ctor only) + `Repositories/TTInformMoveDtlRepository.cs`
  hosting **`GetMoveA10Dashboard(moveDateStart, moveDateEnd)`** via `QueryJoinAsync<DashboardMoveA10QueryResult>`.
  Wired both into `IUnitOfWorkSPF` + `UnitOfWorkSPF` (lazy property + `resetRepositories()` TT group).
- **SQL** (exact joins from SPEC-005): backbone `T_T_INFORM_MOVE_DTL DTL` INNER JOIN `T_T_INFORM_MOVE H`
  (`H.ID = DTL.INFORM_MOVE_ID`); LEFT JOIN `T_M_TRADER`, `T_M_UNIT`, `T_M_PRIMARY_BUYER_AUTHORITY`; **INNER
  JOIN `T_T_LICENSE L ON L.LICENSE_NO = DTL.REF_LICENSE_NO AND L.FORM_ID = 10`** (อ.10 scoping); LEFT JOIN
  `T_T_LICENSE_MOVE LM`, `V_PROVINCE VP`, `T_T_LICENSE_DTL LDTL` (`LICENSE_ID` + `PRODUCT_CODE`). Move-date
  range filtered in SQL on `DTL.MOVE_DATE` (mirrors move-license's date pattern). Base DTL tables chosen over
  `V_INFORM_MOVE_DTL_LOT` (per-lot would multiply `QUANTITY`).

### Service (`DashboardMoveA10Service`)
- `TableData()`/`ChartData()` now call `BuildTableRows(req)` → `TTInformMoveDtlRepo.GetMoveA10Dashboard(...)`,
  build a `TRANSPORT_TYPE_CODE → name` dict from `TRTransportTypeRepo.GetDataAll()` (TASK-007), filter with the
  move-license `InList`/`MatchEq` set, map to `DashboardMoveA10TableRow`.
- Movement fields: `move_date` = `MOVE_DATE` (`yyyy-MM-dd`), `move_seq` = `MOVE_SEQ`, `moved_qty` = `DTL.QUANTITY`;
  `quantity` = `ALLOWED_QUANTITY` (permitted). `move_request_type_name` from the 0/1 map on `INFORM_REQUEST_TYPE`;
  `transport_type_code_name` from the T_R_TRANSPORT_TYPE dict; buyer-group label from `BUYER_GROUP_MAP`.
- Charts (measure `SUM(moved_qty)`): `top5_by_buyer_unit` (group `BuyerUnit`, `.Take(5)`), `by_buyer_group`
  (group buyer-group label), `by_trader` (group trader). Reused the shared `DashboardChartData`/`BuildChart` shape.
- **Renamed** the model key `move_seq_no` → **`move_seq`** (matches `MOVE_SEQ`; SPEC-005). Address block left
  empty (SPEC §4 — the อ.10 table has no address columns); only `dest_province_name`/`dest_area_name` populated
  (used by filters).

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`, builds the DAL too): **Build succeeded. 0 Error(s).**
- **Static grep:** both INFORM_MOVE repos wired in all 3 DAL spots; service calls
  `TTInformMoveDtlRepo.GetMoveA10Dashboard`; `move_date`/`move_seq`/`moved_qty` mapped from real columns; model
  key is `move_seq`; no `// TASK-006` stub left.
- **Live-response / real-data check deferred (brownfield — needs running Center + Oracle).** This task's
  correctness is genuinely data-dependent (below), so it warrants a live spot-check before final sign-off — a
  DATA REQUEST if the team wants it (stakeholder hits `/dashboard-move-a10/table` with a move-date range and
  drops the JSON in `project-docs/`).

### Assumptions to verify on first DB run (SPEC-005 §"Design assumptions" — flagged, not guessed)
1. **`REF_LICENSE_NO` == `T_T_LICENSE.LICENSE_NO`** string match (drives the INNER license back-join). If the
   format diverges, the `L.FORM_ID=10` INNER JOIN drops all rows — would need a normalized match. **Highest-risk.**
2. **`H.INFORM_REQUEST_TYPE` == the 0/1 `MOVE_REQUEST_TYPE` enum** — if values differ, `move_request_type_name`
   needs a different map.
3. **อ.10 scoping via `L.FORM_ID = 10`** — kept per SPEC ("safe to include").
4. **`LDTL` join multiplicity:** `T_T_LICENSE_DTL LDTL ON LICENSE_ID + PRODUCT_CODE` — if a license has >1 DTL
   line for the same product, the LEFT JOIN could duplicate backbone rows (inflating counts/qty). Expected unique
   in practice; **flagging** since it can only be confirmed against real data. If it duplicates, resolve
   `transport_type_code` via a scalar subquery/`DISTINCT` instead of a join.
None are silent — all are in the SQL as written per SPEC; @Sober, a 5–10 row live capture would confirm 1–4 at once.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE (code correct per SPEC-005 + builds) — Sober (SA), 2026-07-20.** Read the actual SQL,
DTO, and service:
- **SQL** (`TTInformMoveDtlRepository.GetMoveA10Dashboard`) matches the SPEC-005 backbone exactly: DTL +
  header INNER; `T_M_TRADER`/`T_M_UNIT`/`T_M_PRIMARY_BUYER_AUTHORITY` LEFT; license back-join
  `T_T_LICENSE (LICENSE_NO=REF_LICENSE_NO, FORM_ID=10)` → `LM`/`V_PROVINCE`/`LDTL`; move-date range on
  `DTL.MOVE_DATE`; aliases Pascal-map to `DashboardMoveA10QueryResult` (verified 1:1).
- **Service**: `BuildTableRows` mirrors move-license filters (`InList`/`MatchEq`); maps `move_date`/`move_seq`/
  `moved_qty` from real columns; `quantity`=ALLOWED_QUANTITY; `move_request_type_name` from the 0/1 map;
  `transport_type_code_name` from the `TRTransportTypeRepo` dict. Charts measure `SUM(MovedQty)` — Top-5 by
  buyer unit, by buyer group, by trader. Model key `move_seq_no`→`move_seq` done. Build 0 errors.
- SPF DAL entities/repo (`TTInformMove(Dtl)Entity/Repository`) + UoW wiring correct.

**⚠ Data-correctness NOT yet verified — needs DATA REQUEST 3 (live capture).** Unlike the rename/config
tasks, this task's correctness is genuinely data-dependent; static analysis cannot confirm it. Four
assumptions (all in the code as SPEC-005 specified, correctly flagged by Jason, none guessed):
1. **HIGH RISK — `T_T_LICENSE.LICENSE_NO == DTL.REF_LICENSE_NO` string match.** It's an **INNER** join, so
   a format/whitespace mismatch returns an **empty dashboard** (not a partial error). Must confirm rows come back.
2. `INFORM_REQUEST_TYPE` values are the `0/1` enum (else `move_request_type_name` blanks).
3. `LDTL` join on `LICENSE_ID + PRODUCT_CODE` doesn't duplicate backbone rows (would inflate table + chart
   sums). If it does → resolve `transport_type_code` via scalar subquery/`DISTINCT`.
4. Move-date filter + `MOVE_DATE`/`MOVE_SEQ`/`QUANTITY` actually populate.

**Acceptance gate:** REQ-005 must NOT be marked DELIVERED until a live capture confirms 1–4 (REQ-005 AC #6).
Routed to @Porter as DATA REQUEST 3. If any assumption fails, this task reopens (REWORK) for a targeted fix.
