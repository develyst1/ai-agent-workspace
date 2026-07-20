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
