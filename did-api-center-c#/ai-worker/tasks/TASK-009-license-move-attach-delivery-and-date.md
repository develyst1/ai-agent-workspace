# TASK-009: LICENSE_MOVE — delivery-attach + dates + type columns + buyer-group

- Source: SPEC-006 (+ SPEC-007 date). Stakeholder authorized impl 2026-07-20 ("ทำเลย").
- Status: TODO
- Depends on: none

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
- [ ] `move_qty` = real SUM (0 if none); `quantity` unchanged; approved-undelivered rows present.
- [ ] `issue_date` single formatted; `issue_date_formatted` gone.
- [ ] col5 = REQUEST_TYPE (common-code "RequestType"); col6 = MOVE_REQUEST_TYPE (common-code "MoveRequestType");
      both dropdowns sourced from those groups.
- [ ] buyer group/unit from `T_M_BUYER_AUTHORITY`.
- [ ] `dotnet build` succeeds; other dashboards untouched. Then live capture (Porter) to accept.

## Implementation Notes / Questions / Review
(Jason fills Implementation Notes; Sober fills Review.)
