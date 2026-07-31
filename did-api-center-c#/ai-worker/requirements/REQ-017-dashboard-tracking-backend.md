# REQ-017: DASHBOARD_TRACKING — Center backend for "ติดตามสถานะการขนย้ายตาม อ.10"

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-24 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
New officer dashboard **`/officer/dashboard-tracking`** — "ติดตามสถานะการขนย้ายตามหนังสืออนุญาตขนย้ายอาวุธ":
list each issued **อ.10** move license with its **สถานะการขนย้าย (move status)**, plus counts by trader / by
status. อ.10 license-first (backbone = `T_T_LICENSE` FORM_ID=10 × `T_T_LICENSE_MOVE`), same family as a10 +
license-move → **maximize reuse**. Frontend evidence: `../project-docs/dashboard-tracking-frontend-capture.md`.

## Requirement
1. **search-filter** (+ cascades) — 11 filters, nearly all reused: ประเภทการขออนุญาต (RequestType), ประเภทการขนย้าย
   (MoveRequestType), ผู้ประกอบการ, **ภาค→จังหวัด** (dest region→province cascade), **กลุ่มหน่วยผู้ซื้อ→หน่วยผู้ซื้อ**
   (buyer group→unit cascade, REQ-013), ประเภทอาวุธ (shared config REQ-009), หน่วยนับ, อาวุธ, **สถานะหนังสืออนุญาต**.
   **No date-range filter** (return-all must not hang — REQ-011 perf).
2. **chart** (POST) — 3 charts, all counted in **ฉบับ (distinct license count)**: (a) by trader × move-status,
   (b) total by trader, (c) total by **move status**.
3. **table** (POST) — 10 cols: อ.10 no, issue/expiry date, request type, move type, trader, buyer group, buyer unit,
   **สถานะหนังสืออนุญาต** (license status), **สถานะการขนย้าย** (move status).
4. **Conventions:** snake_case, ResponseResult, shared chart/dropdown classes, perf (pre-agg, base tables, no-date OK).
   New `DashboardTracking*` controller/service/models; register in Program.cs.

## Acceptance Criteria
- [ ] Endpoints: search-filter (+ region/province + buyer group/unit cascades), chart (POST, 3 ฉบับ-count charts),
      table (POST, 10 cols) — match the FE.
- [ ] **move status** derived correctly (per SA decision below) + license status labeled; both appear in table + a chart.
- [ ] Filters all work (reuse a10/license cascades); return-all (no date) completes; snake_case; build succeeds; others untouched.
- [ ] Verified by live capture; DATA REQUESTs where needed.

## Constraints
- Backend only: `DidSpf.WebApi.Center`, all DID_SPF. Brownfield — no real DB; unknowns → DATA REQUEST.

## SA questions (Sober)
- **Q1 (THE core unknown) — "สถานะการขนย้าย" (move status):** computed (approved อ.10 qty vs SUM actual
  `T_T_INFORM_MOVE` → not-moved / partial / full) OR a stored status (`INFORM_MOVE_STATUS` / a flag on
  `T_T_LICENSE_MOVE`)? Need the exact source + the code→label set. → **DATA REQUEST via Porter.**
- **Q2 — "สถานะหนังสืออนุญาต" (license status):** `T_T_LICENSE.LICENSE_STATUS` code→label map (values beyond 40=issued?).
- Q3 — confirm the 11 filters map to the same sources as a10/license-move (region/province, buyer group/unit,
  RequestType, MoveRequestType, weapon-type config); any tracking-specific filter?
- Q4 — chart "ฉบับ" = COUNT(DISTINCT license) (as REQ-014 by-trader ฉบับ); confirm grain vs the move-status split.
- Q5 — backbone: FORM_ID=10 + LICENSE_STATUS filter? (license-move used FORM_ID via T_T_LICENSE_MOVE INNER JOIN — reuse.)

## Out of Scope
- No frontend code. No change to other dashboards.

---
## ADDENDUM 2026-07-24 (stakeholder) — search-filter MUST include the WEAPON cascade, like move-license
Stakeholder: "filter search ของ tracking ยังต้องมี relate filter weapon ด้วย เหมือน move license."

**Gap (verified in code):** move-license & a10 expose a weapon cascade; dashboard-tracking does not.
- `DashboardMoveLicenseController`: `search-filter-unit` (หน่วยนับ, `?product_type_group_code=`) +
  `search-filter-weapon` (อาวุธ, `?product_type_group_code=&quantity_unit_id=`) — cascade off ประเภทอาวุธ.
- `DashboardTrackingController` currently has only: `search-filter`, `search-filter-province`,
  `search-filter-buyer-unit`. **Missing:** `search-filter-unit` + `search-filter-weapon`.

**Requirement:** add the two weapon-cascade endpoints to dashboard-tracking, mirroring move-license exactly
(same route shape/params, reuse the same UnitDdl / WeaponDdl logic + shared DashboardWeaponTypeCodes config, REQ-009):
- `GET /officer/dashboard-tracking/search-filter-unit?product_type_group_code=` → หน่วยนับ (ว่าง ⇒ ทั้งหมด)
- `GET /officer/dashboard-tracking/search-filter-weapon?product_type_group_code=&quantity_unit_id=` → อาวุธ
Then the main `/search-filter` weapon-type + unit + weapon dropdowns behave like move-license (related/cascading),
and the /table + /chart weapon filters keep working (EXISTS on T_T_LICENSE_DTL, already in GetTrackingDashboard).

@Sober — please SPEC this (reuse move-license's Unit/Weapon Ddl; tracking is FORM_ID=10/STATUS=40 so scope the
product source the same way move-license does) and write the TASK for Jason. Everything else in REQ-017 is captured &
accepted; this weapon cascade is the only remaining gap before DELIVERED. Status reverted IN_SPEC.

---
## ADDENDUM 2 — 2026-07-24 (stakeholder) — "สถานะหนังสืออนุญาต" is EXPIRY-based, NOT LICENSE_STATUS
Stakeholder answer to REQ-019 Q1: **"หมดอายุมั้ย คือ วันหมดอายุ เกินหรือไม่เกินวันปัจจุบันน่ะ ไม่เกี่ยวกับ สถานะ 40"**
FE dropdown confirms the exact option set: **ทั้งหมด / ยังไม่หมดอายุ / หมดอายุ** (screenshot 2026-07-24).

**We built it wrong** — DR-16 recorded LICENSE_STATUS code→label ({40:"ออกหนังสืออนุญาตแล้ว"}); that was Porter's
reading, not the stakeholder's meaning. `LICENSE_STATUS=40` remains correct **as the backbone filter** (which licenses
appear at all) — it is simply NOT what the "สถานะหนังสืออนุญาต" column/filter means.

### Correct definition (verbatim from stakeholder)
- **ยังไม่หมดอายุ** — `EXPIRY_DATE` **ไม่เกิน** วันปัจจุบัน ⇒ `EXPIRY_DATE >= TRUNC(SYSDATE)` (today itself counts as
  ยังไม่หมดอายุ)
- **หมดอายุ** — `EXPIRY_DATE` **เกิน** วันปัจจุบันไปแล้ว ⇒ `EXPIRY_DATE < TRUNC(SYSDATE)`

### 4 touchpoints to fix (all in `DashboardTrackingService`, verified)
| # | line | now (wrong) | must become |
|---|---|---|---|
| 1 | L42 `LICENSE_STATUS_MAP` | `{40:"ออกหนังสืออนุญาตแล้ว"}` | remove/replace — status is derived from EXPIRY_DATE, not a code map |
| 2 | L110 `LicenseStatusDdl.Items` | items from the code map (1 item) | exactly 2 items: **ยังไม่หมดอายุ / หมดอายุ** (empty ⇒ ทั้งหมด, per the FE dropdown) |
| 3 | L269 `InList(req.LicenseStatuses, r.LicenseStatus?.ToString())` | filters by LICENSE_STATUS code | filter by the derived expiry bucket |
| 4 | L288 + L309 `LicenseStatusLabel(r.LicenseStatus)` | code→label | derive from `EXPIRY_DATE` vs today |

Backbone `FORM_ID=10 AND LICENSE_STATUS=40` — **unchanged**.
`expiry_date` is already selected & returned, so no query change is needed for the derivation (SA to choose:
derive in SQL or in the service — service is fine and keeps the query untouched).

**@Sober — SPEC + TASK.** Two open implementation details for you to settle (not stakeholder-facing):
(a) the `license_statuses` request value encoding for the 2 buckets (the FE currently sends whatever the DDL `value` is
    — keep DDL value and request value identical, like every other cascade); (b) rows with NULL `EXPIRY_DATE`, if any
    exist under FORM_ID=10/STATUS=40 — pick a deterministic bucket and state it (raise a DATA REQUEST via Porter only
    if you actually need a count).

Acceptance: FE dropdown shows ทั้งหมด/ยังไม่หมดอายุ/หมดอายุ; picking each filters the table+charts accordingly; the
table's `license_status` column and the REQ-019 modal badge both show the expiry label and always agree.
