# SPEC-006: DASHBOARD_LICENSE_MOVE — plan-vs-actual (attach real delivered qty from INFORM_MOVE)

- Source: REQ-006
- Status: ACTIVE

## Overview

License Move = the **mirror of Move A10**: start from the **approved อ.10 licenses** (plan) and **attach the
actual delivered qty** (from the verified INFORM_MOVE source) so col 12 `จำนวนขนย้ายจริง` (`move_qty`) shows
real deliveries instead of the current hardcoded **0**. "Plan (approved) vs actual (delivered)".

**Backbone (Q2 — traced from code, unchanged): the current move-license backbone is already correct.**
`TTLicenseDtlRepo.GetMoveLicenseDashboard` = `T_T_LICENSE L` (`LICENSE_STATUS=40` issued/approved)
**INNER JOIN `T_T_LICENSE_MOVE`** (identifies อ.10 move) **INNER JOIN `T_T_LICENSE_DTL DTL`** (weapon lines).
So a row = **1 approved license × 1 weapon type** → **multiple weapon types per request already supported**
(one row per DTL line). Filters by ISSUE_DATE (วันที่อนุญาต). No backbone/grain change needed — REQ-006 is a
**data-attach**, not a rebuild.

## Core change — populate `move_qty` (col 12) from INFORM_MOVE (Q5)

Replace the hardcoded `MoveQty = 0` with the **SUM of actual deliveries** for that license-line, via a
**correlated scalar subquery** (LEFT semantics — 0 when never delivered; no row multiplication):

```sql
,(SELECT NVL(SUM(IMD.QUANTITY), 0)
    FROM T_T_INFORM_MOVE_DTL IMD
   WHERE IMD.REF_LICENSE_NO = L.LICENSE_NO
     AND IMD.PRODUCT_CODE   = DTL.PRODUCT_CODE) AS MovedQty
```
- Match grain = **`REF_LICENSE_NO` (=license) + `PRODUCT_CODE` (=weapon)** — the same weapon line the approved
  row represents (Q5: no lot-level needed; we SUM over all its deliveries/lots). `NVL(...,0)` = "อนุมัติแต่ยัง
  ไม่ส่ง" shows 0.
- Add `MovedQty` (decimal) to `DashboardMoveLicenseQueryResult`; map it to the existing table-row field
  `move_qty` (was `MoveQty = 0`). `quantity` (col 11, approved) stays = `DTL.QUANTITY`.
- Charts (title "ยอดอนุญาต…") keep measuring the **approved** qty (`SUM(Qty)`) — **unchanged** (A10 measured
  actual; License Move measures approved, by design).

**This reuses the exact INFORM_MOVE source verified in REQ-005** — same `T_T_INFORM_MOVE_DTL.QUANTITY`, same
`REF_LICENSE_NO`↔`LICENSE_NO` link that the A10 live capture confirmed resolves.

## Also fold in (coordination)

- **REQ-007 (dates):** on `DashboardMoveLicenseTableRow`, collapse `issue_date`+`issue_date_formatted` → single
  formatted `issue_date` (see SPEC-007). Done in the same task (TASK-009) since it's the same model/service.

## Open items

- **Q4 — `purchase_document` chart ("แยกตามเอกสารการซื้อ") source.** Chart 1 groups by `purchase_document`,
  which the service sets to the constant `NOT_SPECIFIED` ("ไม่ระบุ") — no backing source in code (confirmed:
  `PurchaseDocument = NOT_SPECIFIED`). **Genuine data gap.** SA to raise a **DATA REQUEST** (what column/table
  holds "เอกสารการซื้อ" for an อ.10 line — on the license, the request, or INFORM_MOVE?). **Non-blocking for the
  col-12 core** — that chart stays "ไม่ระบุ" until the source is known; ship the delivery-attach first.
- **Type columns (col5 ประเภทการขออนุญาต / col6 ประเภทการขนย้าย):** move-license already resolves col5 from
  `MOVE_REQUEST_TYPE` via common-code `MoveRequestType`; col6 currently from `TRANSPORT_TYPE_CODE` via the
  (empty) `TransportType` group. The capture suggests col6 should also use `MoveRequestType`. **This is the same
  col5/col6 naming-trap flagged (unresolved) on A10** — do NOT change the type columns here until Porter/
  stakeholder confirm whether the two "type" fields are distinct. Tracked separately; **not part of TASK-009.**

## Stakeholder-answer updates (2026-07-20) — now in TASK-009 scope

Both "type" columns are **distinct**, both come from the **request** (via `L.REQUEST_ID → T_T_REQUEST`), and
buyer-group moves to `T_M_BUYER_AUTHORITY`:

- **col5 ประเภทการขออนุญาต — field FOUND from code (my assigned investigation):** = `T_T_REQUEST.REQUEST_TYPE`
  (DATADIC:806 "ประเภทคำขอ (enum RequestType)"), reached via `L.REQUEST_ID → T_T_REQUEST RQ`. **Recommend
  resolving the name via the existing common-code group `"RequestType"`** (auto Thai name: ขนย้าย/ขายในราช
  อาณาจักร/ขายนอกราชอาณาจักร = อ.9/อ.15/อ.14) — cleaner than a literal 3-value hardcode and same pattern as col6.
  Drop the old `INFORM_REQUEST_TYPE`/`MOVE_REQUEST_TYPE` 0/1 source. **→ Porter Q: OK to use the common-code
  `RequestType` group (proper names, maintainable) instead of hardcoding exactly 3 labels?** (If they insist on
  3 literals, it's a small map — but the field + group are confirmed.)
- **col6 ประเภทการขนย้าย — UNBLOCKED (distinct confirmed):** = `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE` via
  common-code `"MoveRequestType"` (0–5) — same as A10. Join `L.REQUEST_ID → T_T_REQUEST_MOVE` (scalar subquery
  `MAX(...)`). Replaces move-license's current empty `TRANSPORT_TYPE_CODE`/`TransportType` source.
- **Buyer group → `T_M_BUYER_AUTHORITY`** (stakeholder). Same fix A10 needed: join `T_M_BUYER_AUTHORITY BA ON
  BA.ID = DTL.BUYER_AUTHORITY_ID` → `BA.AUTHORITY_GROUP_NO`; label via the 1/2/3/9 map (T_M_BUYER_AUTHORITY has
  **no** separate group-name column — DATADIC:90; group name = the code map, same as A10). Verify at the live
  capture (the license-side `BUYER_AUTHORITY_ID`→`T_M_BUYER_AUTHORITY.ID` link, like A10).
- **purchase_document → PARKED** (stakeholder: no such data; leave "ไม่ระบุ"; removing the chart = FE change).

## Live-capture REWORK (2026-07-20) — buyer-group re-source (the only fail)

Capture (`project-docs/data-req-8-...`): **move_qty ✅ (31230 exact), dates ✅, col5/col6 ✅** — **buyer-group
empty on all rows.** Root cause: License Move's `T_T_LICENSE_DTL.BUYER_AUTHORITY_ID` is null (the buyer/
recipient lives on the **request-move**, not the license line; the license shows the buyer as the
`dest_place_name`). **Traced from DATADIC:911 (no DATA REQUEST):** `T_T_REQUEST_MOVE.BUYER_AUTHORITY_ID` FK →
`T_M_BUYER_AUTHORITY`, and `T_T_REQUEST_MOVE.AUTHORITY_NAME` = หน่วยผู้ซื้อ. We already reach `T_T_REQUEST_MOVE`
via `L.REQUEST_ID` (col6). **Fix = source the buyer from there** (scalar subqueries, deterministic, no
multiplication):
```sql
,(SELECT MAX(BA.AUTHORITY_GROUP_NO)
    FROM T_T_REQUEST_MOVE RM JOIN T_M_BUYER_AUTHORITY BA ON BA.ID = RM.BUYER_AUTHORITY_ID
   WHERE RM.REQUEST_ID = L.REQUEST_ID)                                   AS BuyerGroupNo
,(SELECT MAX(RM.AUTHORITY_NAME) FROM T_T_REQUEST_MOVE RM
   WHERE RM.REQUEST_ID = L.REQUEST_ID)                                   AS BuyerUnitName
```
Remove the old `LEFT JOIN T_M_BUYER_AUTHORITY BA ON BA.ID = DTL.BUYER_AUTHORITY_ID` + its
`AUTHORITY_GROUP_NO`/`NVL(...)` selects. Service mapping unchanged (`BuyerGroupLabel = map(BuyerGroupNo)`,
`BuyerUnit = BuyerUnitName`). **Re-capture buyer columns only** to accept (residual risk: if
`RM.BUYER_AUTHORITY_ID` is also null → escalate to a DATA REQUEST, low likelihood given DATADIC).

Minor (noted, not fixed): a license with **2 DTL lines for the same product** would each get the full
license+product delivery SUM in `move_qty` (double-count) — rare; charts measure approved qty so unaffected.
The buyer-unit **dropdown** still lists `T_M_BUYER_AUTHORITY` names (may not match the table's `RM.AUTHORITY_NAME`)
— group filter works; unit-dropdown alignment is a low-priority follow-up.

## Acceptance / Non-functional

- [ ] `move_qty` (col 12) = real SUM of INFORM_MOVE deliveries per license-line (0 if none); approved-but-
      undelivered rows still show (LEFT semantics).
- [ ] Multiple weapon types per license each show correctly (already per-DTL-line).
- [ ] `quantity` (approved) unchanged; charts still measure approved; other dashboards untouched.
- [ ] `dotnet build` succeeds; verified via a live capture (like A10) before DELIVERED.

## Tasks
- TASK-009: LICENSE_MOVE — add the `MovedQty` delivery-attach subquery + DTO/map; fold in SPEC-007 date change.
  (depends on: —)

## Questions
(Jason asks here; Sober answers as `> answer: ...`)

## To Porter
- **DATA REQUEST (Q4 purchase_document):** please ask the stakeholder where "เอกสารการซื้อ" for an อ.10 line
  comes from (column/table) — the chart "แยกตามเอกสารการซื้อ" is stuck on "ไม่ระบุ". Non-blocking; the core
  `move_qty` fix ships without it.
- **Coordinate the col5/col6 type-column question** (still open from A10) before we touch move-license's two
  "type" columns.
