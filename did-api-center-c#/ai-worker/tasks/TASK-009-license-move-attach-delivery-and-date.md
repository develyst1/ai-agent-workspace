# TASK-009: LICENSE_MOVE — delivery-attach + dates + type columns + buyer-group

- Source: SPEC-006 (+ SPEC-007 date). Stakeholder authorized impl 2026-07-20 ("ทำเลย").
- Status: DONE (code — Sober reviewed 2026-07-20). Final acceptance = live capture (Porter).
- Depends on: none

## Review — Verdict: DONE (code) — Sober (SA), 2026-07-20
Read the actual SQL + service + model — all 5 parts correct:
- **A** `MovedQty` = `NVL(SUM(T_T_INFORM_MOVE_DTL.QUANTITY),0)` by `REF_LICENSE_NO`+`PRODUCT_CODE` (SQL L219-222);
  service `MoveQty = r.MovedQty ?? 0` (L297). `quantity`(approved)+charts unchanged.
- **B** `issue_date` = `ToStringTH` (service L259); `issue_date_formatted` removed from model+service.
- **C** col5 = `RQ.REQUEST_TYPE` + `LEFT JOIN T_T_REQUEST RQ ON RQ.ID=L.REQUEST_ID`; name via
  `CommonCodeIntMap("RequestType")` (L262); dropdown `CommonCodeDdlByInt("RequestType")` (L60); filter on RequestType (L238).
- **D** col6 = `MAX(RM.MOVE_REQUEST_TYPE)` subquery; name via `"MoveRequestType"` (L263); dropdown+filter aligned.
- **E** buyer join → `T_M_BUYER_AUTHORITY`; dropdowns via `TMBuyerAuthorityRepo` (L88).
- **Backbone intact:** `T_T_LICENSE (status 40)` INNER `T_T_LICENSE_MOVE` INNER `T_T_LICENSE_DTL`, ISSUE_DATE
  filter, per-DTL-line (multi-type). Old `MOVE_REQUEST_TYPE`/`TRANSPORT_TYPE_CODE` selects gone. Build 0 errors;
  only `DashboardMoveLicense*` + its SQL touched.
**Final acceptance = live capture (Porter, like A10):** the new joins (`L.REQUEST_ID`→T_T_REQUEST/T_T_REQUEST_MOVE;
INFORM_MOVE SUM; license-side `BUYER_AUTHORITY_ID`→`T_M_BUYER_AUTHORITY.ID`) are data-verifiable only — expect
col5/col6 names, `move_qty`>0 for delivered rows, buyer-group populated. If the license-side buyer FK misses
(like A10's movement side did before the swap), that's a targeted follow-up.

All changes are in `TTLicenseDtlRepository.GetMoveLicenseDashboard` (SQL), `DashboardMoveLicenseQueryResult`
(DTO), `DashboardMoveLicenseService`, and `DashboardMoveLicenseModel.cs`. Backbone unchanged. Verify at one
live capture (like A10). **DO NOT** touch other dashboards/shared classes/filters-logic beyond the below.

## A — attach real delivered qty (`move_qty`, col 12; was hardcoded 0) [SPEC-006 core]
- SQL: add `,(SELECT NVL(SUM(IMD.QUANTITY),0) FROM T_T_INFORM_MOVE_DTL IMD WHERE IMD.REF_LICENSE_NO = L.LICENSE_NO
  AND IMD.PRODUCT_CODE = DTL.PRODUCT_CODE) AS MovedQty`. DTO: add `decimal? MovedQty`. Service: `MoveQty = r.MovedQty ?? 0`.
- `quantity` (approved) + charts (measure approved) unchanged.

## B — single formatted `issue_date` [SPEC-007]
- Model: remove `issue_date_formatted` (prop + `[JsonProperty]`). Service: `Date` (`issue_date`) =
  `r.IssueDate.ToStringTH(FormatStr.DATEONLY)`; delete the `DateFormatted` line.

## C — col5 ประเภทการขออนุญาต = REQUEST_TYPE (common-code "RequestType")
- SQL: join the request — add `,RQ.REQUEST_TYPE AS RequestType` with `LEFT JOIN T_T_REQUEST RQ ON RQ.ID = L.REQUEST_ID`
  (`L.REQUEST_ID` exists). DTO: add `int? RequestType`.
- Service: resolve name via `CommonCodeIntMap("RequestType")` (same helper as col6); map to the col5 field
  (`TransportType` → `move_request_type_name`... **keep the existing response key**). **Drop** the old
  `MOVE_REQUEST_TYPE`/0-1 map source for col5.
- ⚠ Pending Porter confirm (SPEC-006): use the common-code `RequestType` names vs a literal 3-value hardcode.
  Implement the common-code version; if Porter says "exactly 3 literals", it's a small map swap.

## D — col6 ประเภทการขนย้าย = MOVE_REQUEST_TYPE (common-code "MoveRequestType")  [now unblocked — cols distinct]
- SQL: add `,(SELECT MAX(RM.MOVE_REQUEST_TYPE) FROM T_T_REQUEST_MOVE RM WHERE RM.REQUEST_ID = L.REQUEST_ID) AS MoveTypeCode`.
  DTO: add `int? MoveTypeCode`. Service: resolve via `CommonCodeIntMap("MoveRequestType")` → the col6 field
  (`transport_type_code_name`, keep the key). Replace move-license's current empty `TRANSPORT_TYPE_CODE`/`TransportType` source.
- Dropdown `SearchFilter` ประเภทการขนย้าย → `GetDataActiveByGroupCode("MoveRequestType")` (value=CODE_INT); and
  ประเภทการขออนุญาต dropdown → `GetDataActiveByGroupCode("RequestType")`. (Mirror A10's common-code dropdowns.)

## E — buyer group → `T_M_BUYER_AUTHORITY` (stakeholder)
- SQL: change the buyer-authority join to `T_M_BUYER_AUTHORITY BA ON BA.ID = DTL.BUYER_AUTHORITY_ID` →
  `BA.AUTHORITY_GROUP_NO`. Service: label via the existing 1/2/3/9 `BUYER_GROUP_MAP` (no separate name column).
  Also point the SearchFilter buyer group+unit dropdowns at `T_M_BUYER_AUTHORITY` (as A10 does). [Same live-verify
  caveat as A10 for the license-side `BUYER_AUTHORITY_ID`→`T_M_BUYER_AUTHORITY.ID` link.]

## Definition of Done
- [x] `move_qty` = real SUM (0 if none); `quantity` unchanged; approved-undelivered rows present (backbone still
      the approved-license `T_T_LICENSE`; `move_qty` = `NVL(SUM,0)` subquery so 0-delivery rows still appear).
- [x] `issue_date` single formatted; `issue_date_formatted` gone (model + service).
- [x] col5 = REQUEST_TYPE (common-code "RequestType"); col6 = MOVE_REQUEST_TYPE (common-code "MoveRequestType");
      both dropdowns sourced from those groups (value=CODE_INT).
- [x] buyer group/unit from `T_M_BUYER_AUTHORITY` (SQL join + SearchFilter dropdowns).
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).** Other dashboards untouched. Live capture (Porter) to accept.

## Implementation Notes

**Done by Jason 2026-07-20.** All changes in the LICENSE_MOVE dashboard only (SQL/DTO/service/model); backbone
(`T_T_LICENSE` approved-license, status 40) unchanged. Reuses the A10 patterns (common-code dropdowns,
`T_M_BUYER_AUTHORITY`, INFORM_MOVE SUM).

### A — real delivered qty (`move_qty`)
- SQL `GetMoveLicenseDashboard`: added `,(SELECT NVL(SUM(IMD.QUANTITY),0) FROM T_T_INFORM_MOVE_DTL IMD WHERE
  IMD.REF_LICENSE_NO = L.LICENSE_NO AND IMD.PRODUCT_CODE = DTL.PRODUCT_CODE) AS MovedQty`. DTO: `decimal? MovedQty`.
  Service: `MoveQty = r.MovedQty ?? 0` (was hardcoded 0). `quantity` (=`DTL.QUANTITY`, approved) + charts unchanged.

### B — single formatted `issue_date` (SPEC-007)
- Model `DashboardMoveLicenseTableRow`: removed `DateFormatted` + `[JsonProperty("issue_date_formatted")]`.
- Service: `Date` (`issue_date`) = `r.IssueDate.ToStringTH(FormatStr.DATEONLY)`; deleted the `DateFormatted` line.

### C — col5 ประเภทการขออนุญาต = `T_T_REQUEST.REQUEST_TYPE` (common-code "RequestType")
- SQL: `,RQ.REQUEST_TYPE AS RequestType` + `LEFT JOIN T_T_REQUEST RQ ON RQ.ID = L.REQUEST_ID`. DTO: `int? RequestType`
  (dropped the old `LM.MOVE_REQUEST_TYPE`/`MoveRequestType`). Service: `TransportType` (`move_request_type_name`, key
  kept) = `MapCode(CommonCodeIntMap("RequestType"), r.RequestType)`. Filter → `InList(req.TransportTypes, r.RequestType?.ToString())`.
  Stakeholder chose common-code (dynamic) 2026-07-20 — no hardcode.

### D — col6 ประเภทการขนย้าย = `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE` (common-code "MoveRequestType")
- SQL: `,(SELECT MAX(RM.MOVE_REQUEST_TYPE) FROM T_T_REQUEST_MOVE RM WHERE RM.REQUEST_ID = L.REQUEST_ID) AS MoveTypeCode`.
  DTO: `int? MoveTypeCode` (dropped the old `DTL.TRANSPORT_TYPE_CODE`/`TransportTypeCode`). Service: `MoveType`
  (`transport_type_code_name`, key kept) = `MapCode(CommonCodeIntMap("MoveRequestType"), r.MoveTypeCode)`. Filter →
  `InList(req.MoveTypes, r.MoveTypeCode?.ToString())`.
- Dropdowns (`SearchFilter`): ประเภทการขออนุญาต → `CommonCodeDdlByInt("RequestType")`, ประเภทการขนย้าย →
  `CommonCodeDdlByInt("MoveRequestType")` (new helper; value=CODE_INT, mirrors A10). The old `CommonCodeDdl`
  (value=CODE_STR-fallback via `GetDataActiveByGroupCodeAndDisplayType`) was orphaned by this swap → removed.

### E — buyer group → `T_M_BUYER_AUTHORITY`
- SQL: buyer join `T_M_PRIMARY_BUYER_AUTHORITY BA` → `T_M_BUYER_AUTHORITY BA ON BA.ID = DTL.BUYER_AUTHORITY_ID`
  (`BuyerUnitName` NVL fallback kept). Service `SearchFilter` buyer group+unit dropdowns → `TMBuyerAuthorityRepo.GetAllAsync()`
  (group via the 1/2/3/9 `BUYER_GROUP_MAP`; unit = `AuthorityName`). Reuses the entity/repo added in TASK-006 rework #2.

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`): **Build succeeded. 0 Error(s).**
- **Static grep:** SQL has `RequestType`/`MovedQty`/`MoveTypeCode`/`T_M_BUYER_AUTHORITY`/`T_T_REQUEST RQ`; old
  `MoveRequestType`/`TransportTypeCode` selects gone; DTO orphans removed; service uses the new groups/filters/maps,
  `MoveQty = r.MovedQty`, `TMBuyerAuthorityRepo`, no `issue_date_formatted`; model `issue_date_formatted` gone.
  Other dashboards untouched (only `DashboardMoveLicense*` + the shared `GetMoveLicenseDashboard` SQL).
- **Live capture needed to accept (brownfield — flagged, Sober-designed from DATADIC):** the new joins are runtime-
  verifiable only: `RQ.ID = L.REQUEST_ID` (T_T_REQUEST), `RM.REQUEST_ID = L.REQUEST_ID` (T_T_REQUEST_MOVE),
  `IMD.REF_LICENSE_NO = L.LICENSE_NO AND IMD.PRODUCT_CODE = DTL.PRODUCT_CODE` (INFORM_MOVE SUM), and the license-side
  `BUYER_AUTHORITY_ID`↔`T_M_BUYER_AUTHORITY.ID` link (same caveat as A10 §E). Expect col5/col6 names populated,
  `move_qty` non-zero for delivered rows, buyer-group populated. If the license-side buyer FK misses (like A10's
  did on the movement side), that's a targeted follow-up.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

(Sober fills this in at REVIEW.)
