# Frontend capture — dashboard-tracking (ติดตามสถานะการขนย้ายตาม อ.10), 2026-07-24

Captured by Porter from the live test frontend (read-only). For REQ-017.

- URL: `https://test-pamf-did.mod.go.th/officer/dashboard-tracking`
- Page title: **"ติดตามสถานะการขนย้ายตามหนังสืออนุญาตขนย้ายอาวุธ"** — track the **move status** of each issued
  อ.10 move license.
- Shape: **อ.10 license-first** (backbone = `T_T_LICENSE` FORM_ID=10 × `T_T_LICENSE_MOVE`, like license-move/a10)
  with a computed **"สถานะการขนย้าย" (move status)** per license. Closely related to a10 + license-move → heavy reuse.
- ⚠ **CORRECTION 2026-07-24:** the page DOES have a date-range filter — Porter's first text-only capture missed it
  (date `<input>`s don't render in innerText). Verified via accessibility tree: `textbox "วันที่อนุญาตเริ่มต้น"` +
  `textbox "วันที่สิ้นสุด"` = **วันที่อนุญาต อ.10 issue-date range** (ONE range, like license-move's `issue_date_range`
  → filter `L.ISSUE_DATE`). This also bounds /table (no need for paging). No-date must still complete (REQ-011).

## Filters (12 — date range + 11 dropdowns, nearly all reused from a10/license-move cascades)
0. **วันที่อนุญาต อ.10** — issue-date range (`issue_date_range` → `L.ISSUE_DATE`), single range like license-move. **(was missed; add it)**
1. **ประเภทการขออนุญาต** (request type — `T_T_REQUEST.REQUEST_TYPE` → common-code `RequestType`, as license-move col5)
2. **ประเภทการขนย้าย** (move type — common-code `MoveRequestType`, as a10/license)
3. ผู้ประกอบการ (trader)
4. **ภาค(ผู้รับปลายทาง)** (dest region/area) — cascades → province
5. **จังหวัด(ผู้รับปลายทาง)** (dest province, cascade from ภาค) — like the a10 region/province cascade
6. **กลุ่มหน่วยผู้ซื้อ(ผู้รับปลายทาง)** (buyer group) — cascades → buyer unit
7. **หน่วยผู้ซื้อ(ผู้รับปลายทาง)** (buyer unit, cascade from group) — REQ-013 `search-filter-buyer-unit` pattern
8. ประเภทอาวุธ (weapon type — shared `DashboardWeaponTypeCodes` config, REQ-009)
9. หน่วยนับ (unit)
10. อาวุธ (weapon/product)
11. **สถานะหนังสืออนุญาต** (license status — `T_T_LICENSE.LICENSE_STATUS` → label map; values? SA/DATA)

## Charts — 3, all measured in ฉบับ (document count)
1. **สถานะการขนย้าย… แยกตามผู้ประกอบการ (ฉบับ)** — by trader, split/colored by move status (count).
2. **จำนวนหนังสืออนุญาตทั้งหมด แยกตามผู้ประกอบการ (ฉบับ)** — total licenses by trader (count).
3. **จำนวนหนังสืออนุญาตทั้งหมด แยกตามสถานะการขนย้าย (ฉบับ)** — total licenses by **move status** (count).

## Table — "รายการหนังสืออนุญาตขนย้ายและสถานะ" (+ Export Excel) — 10 cols
1. # · 2. **หนังสืออนุญาต อ.10** · 3. วันที่อนุญาต อ.10 · 4. วันที่หมดอายุ อ.10 · 5. ประเภทการขออนุญาต
6. ประเภทการขนย้าย · 7. ผู้ประกอบการ · 8. กลุ่มหน่วยผู้ซื้อ · 9. หน่วยผู้ซื้อ
10. **สถานะหนังสืออนุญาต** (license status) · 11. **สถานะการขนย้าย** (move status ← the core new field)

## The core unknown — "สถานะการขนย้าย" (move status) — how is it derived?
Two possibilities (SA to determine; likely DATA REQUEST):
- (a) **Computed** by comparing the อ.10 approved qty vs the actual moved qty (SUM over `T_T_INFORM_MOVE(_DTL)`,
  the a10 actual source) → buckets like ยังไม่ขนย้าย (0) / ขนย้ายบางส่วน (0<x<approved) / ขนย้ายครบ (≥approved).
- (b) A **stored status** column/flag on `T_T_LICENSE_MOVE` / `T_T_INFORM_MOVE` (e.g. INFORM_MOVE_STATUS seen in
  DATADIC). Need the column + its code→label values.
⇒ Porter → DATA REQUEST: the exact source + the status codes/labels for BOTH สถานะการขนย้าย and สถานะหนังสืออนุญาต.

## Reuse map (minimize new work)
- Backbone + region/province cascade + buyer group/unit cascade + weapon-type config + move-type/request-type
  common-codes: all already built for a10 (`TTInformMoveDtlRepository`) + license-move (`TTLicenseDtlRepository`
  `GetMoveLicenseDashboard`) + REQ-013 cascades. dashboard-tracking = license-first (FORM_ID=10) + the move-status
  derivation + count(ฉบับ)-based charts. New: `DashboardTracking*` controller/service/models.
