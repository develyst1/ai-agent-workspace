# SPEC-019: DASHBOARD_TRACKING (ติดตามสถานะการขนย้าย ตาม อ.10) — Center backend, license-first

- Source: REQ-017
- Status: ACTIVE (structure + reuse settled; the two STATUS definitions gated on DR-16)

## Shape
License-first อ.10, **grain = one row per อ.10 license (ฉบับ)** — track each license's **move status**. Backbone +
filters reuse a10/license-move/REQ-013/REQ-009 heavily. All DID_SPF. New `DashboardTracking{Controller,Service,Model}`
+ `IDashboardTrackingService`, route `officer/dashboard-tracking`, registered in `Program.cs`.
**CORRECTION (TASK-031):** the page DOES have **one** `issue_date_range` filter (วันที่อนุญาต อ.10 → `L.ISSUE_DATE`,
like license-move) — the first text-only capture missed the date picker (found via a11y tree). Empty ⇒ return-all →
must still complete (REQ-011/012 perf: pre-agg, base tables, no correlated subqueries). Added in TASK-031.

## Backbone (mirror license-move's อ.10 identification)
```
FROM T_T_LICENSE L                         -- อ.8 family: L.FORM_ID = 10
INNER JOIN T_T_LICENSE_MOVE LM ON LM.LICENSE_ID = L.ID   -- identifies อ.10 (as license-move); 1:1 per license
LEFT JOIN T_T_REQUEST RQ ON RQ.ID = L.REQUEST_ID          -- RequestType (col5), like license-move
LEFT JOIN (pre-agg T_T_REQUEST_MOVE by REQUEST_ID) RMV    -- MoveTypeCode + buyer group/unit (REUSE license-move RMV)
LEFT JOIN (slim region: T_M_PROVINCE→T_M_AREA by LM.DEST_PROVINCE_NAME) VP   -- dest region/province (REQ-012 slim)
-- move-status (computed): pre-agg approved vs actual, by license — see below
WHERE L.FORM_ID = 10  [AND L.LICENSE_STATUS IN (:statuses)]   -- statuses to include = DR-16
```
Grain = license (one row per L). Multi-select **weapon-type / หน่วยนับ / อาวุธ** filters licenses that HAVE a matching
line → `EXISTS (SELECT 1 FROM T_T_LICENSE_DTL DTL [join slim VW_PRODUCT base per REQ-012] WHERE DTL.LICENSE_ID=L.ID
AND <filter>)` (keeps ฉบับ grain, no row multiplication). No pre-agg fan-out.

## Move status (Q1) — SA recommendation: COMPUTED (reuses license-move attach)
Per license: `approved = SUM(T_T_LICENSE_DTL.QUANTITY where LICENSE_ID=L.ID)`; `actual = SUM(T_T_INFORM_MOVE_DTL.QUANTITY
where REF_LICENSE_NO=L.LICENSE_NO)` — both as **pre-aggregated LEFT JOINs** (no correlated subquery). Bucket:
`actual=0 → ยังไม่ขนย้าย · 0<actual<approved → ขนย้ายบางส่วน · actual≥approved → ขนย้ายครบ`.
Rationale: `INFORM_MOVE_STATUS` is a *per-declaration* workflow flag (a license has many declarations) — not a
license-level completion status; the computed approved-vs-actual is the meaningful "สถานะการขนย้าย" and reuses the
license-move `move_qty` logic aggregated to license level. **DR-16 confirms: computed (this) vs stored, + the exact Thai
labels + the partial/full threshold.**

## License status (Q2) — `L.LICENSE_STATUS` (int) → label; **DR-16 needs the code→label map + which statuses the tracking page includes**
(40=ออกหนังสืออนุญาตแล้ว known; the FE has สถานะหนังสืออนุญาต as a *filter* with multiple values ⇒ backbone likely spans
>1 status — need the set + labels. If it's a common-code group, resolve dynamically like RequestType.)

## Filters (11 — reuse map, Q3)
RequestType (`RQ.REQUEST_TYPE`→common-code `RequestType`) · MoveRequestType (common-code `MoveRequestType`) · trader ·
**region→province** cascade (reuse a10 `ProvinceDdl`) · **buyer group→unit** cascade (reuse REQ-013 `BuyerUnitDdl`) ·
weapon-type (shared `DashboardWeaponTypeCodes`, REQ-009) · unit · weapon · **license status** (DR-16 labels). Buyer
group/unit + region/province + move/request type all already sourced in license-move — reuse verbatim.

## Charts (3 — all COUNT(DISTINCT license) = ฉบับ, Q4)
- `by_trader_move_status` — by trader, split by move status (count licenses).
- `by_trader` — total licenses by trader (count).
- `by_move_status` — total licenses by move status (count).

## Table (10 cols) — license-level
`license_no` (อ.10), `issue_date`, `expiry_date`, `request_type`, `move_type`, `trader_name`, `buyer_group`,
`buyer_unit`, `license_status` (labeled), `move_status` (computed). snake_case; single formatted dates.

## DR-16 RESOLVED (2026-07-24) — status logic final
- **License status:** backbone `FORM_ID=10 AND LICENSE_STATUS=40` (show issued only); `LICENSE_STATUS_MAP={40:"ออกหนังสืออนุญาตแล้ว"}`; the filter is effectively single-value.
- **Move status (verbatim, roll-up = A / license-level Σ totals, `≥` for done — Sober decision in data-req-16):**
  `ACT=0 → รอดำเนินการ · 0<ACT<APV → กำลังขนย้าย · ACT≥APV → เสร็จสิ้นแล้ว`. A≡B unless a line over-moves; escalate to
  per-line B only if Porter's validation shows real over-moving. → TASK-030.

## (original) DR-16 (via Porter → stakeholder) — the two status definitions (only blocker for the status logic)
1. **สถานะการขนย้าย (move status):** confirm COMPUTED (approved vs SUM actual `T_T_INFORM_MOVE_DTL`) — buckets
   ยังไม่ขนย้าย/ขนย้ายบางส่วน/ขนย้ายครบ + the exact Thai labels + partial/full threshold; **or** a stored source
   (`INFORM_MOVE_STATUS`?) with its code→label values.
2. **สถานะหนังสืออนุญาต (license status):** `T_T_LICENSE.LICENSE_STATUS` **code→label map** + **which statuses** the
   tracking page lists (only 40, or a range e.g. 30/40/expired?). Common-code group name if dynamic.

## ADDENDUM (TASK-032) — weapon cascade endpoints (stakeholder, post-capture)
The tracking search-filter must expose the same weapon cascade as a10/move-license (it was scaffolded with only
`search-filter`/`-province`/`-buyer-unit`). Add `search-filter-unit?product_type_group_code=` (หน่วยนับ←ประเภทอาวุธ) +
`search-filter-weapon?product_type_group_code=&quantity_unit_id=` (อาวุธ←ประเภท+หน่วยนับ), mirroring
`DashboardMoveA10Service.UnitDdl`/`WeaponDdl` verbatim (reuse `TMUnitRepo` + `VwProductRepo`). → TASK-032.

## Tasks
- TASK-029 — scaffold DashboardTracking (controller/models/service + search-filter + region/province & buyer-group/unit
  cascades + weapon/unit/weapon dropdowns) + the license-first backbone (FORM_ID=10, ฉบับ grain, EXISTS filters,
  computed move-status **structure** with placeholder labels) + 3 ฉบับ-count charts. Buildable now (reuse). — Jason.
- TASK-030 — finalize the move-status labels/threshold + license-status label map & included-statuses per DR-16. — Jason (gated).

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
