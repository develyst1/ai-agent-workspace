# Frontend capture — dashboard-move-license (License Move), 2026-07-20

Captured by Porter from the live test frontend (read-only, not logged in), for REQ-006.

- URL: `https://test-pamf-did.mod.go.th/officer/dashboard-move-license`
- Page title: **"ยอดอนุญาตให้ขาย/ขนย้ายอาวุธ"** (approved/permitted amounts — license-first)
- This is the MIRROR of dashboard-move-a10: same filter set, but **license-first** (approved requests) with
  the actual-delivered qty attached, and it filters by **issue date**, not move date.

## Filters
1. **วันที่อนุญาต** — date range `วันที่อนุญาตเริ่มต้น` / `วันที่สิ้นสุด` (LICENSE ISSUE date; a10 used move date)
2. ประเภทการขออนุญาต
3. ประเภทการขนย้าย
4. ผู้ประกอบการ
5. ภาค(ผู้รับปลายทาง) / 6. จังหวัด(ผู้รับปลายทาง)
7. กลุ่มหน่วยผู้ซื้อ / 8. หน่วยผู้ซื้อ
9. ประเภทอาวุธ* / 10. หน่วยนับ* / 11. อาวุธ

## Charts — "ยอดอนุญาตให้การขาย/ขนย้ายกระสุน" (measure = APPROVED qty, not actual)
1. **แยกตามเอกสารการซื้อ** (by purchase document) ← unique to License Move; `purchase_document` was a KNOWN
   GAP (returned "ไม่ระบุ") — needs a source
2. แยกตามกลุ่มหน่วยผู้ซื้อ
3. แยกตามผู้ประกอบการ

## Table — "รายการยอดอนุญาตให้ขาย/ขนย้ายอาวุธ" (12 cols) — "plan vs actual"
1. # · 2. เลขที่หนังสือ อ.10 · 3. วันที่อนุญาต อ.10 · 4. วันที่หมดอายุ อ.10
5. ประเภทการขออนุญาต · 6. ประเภทการขนย้าย · 7. ผู้ประกอบการ
8. กลุ่มหน่วยผู้ซื้อ · 9. หน่วยผู้ซื้อ · 10. อาวุธ
11. **จำนวนที่ได้รับอนุญาต** (approved) · 12. **จำนวนขนย้ายจริง** (actual delivered) · 13. หน่วยนับ

## Key reading vs REQ-006
- Backbone = **approved อ.10 license lines** (1 row per license × weapon type → multiple types supported).
- Col 11 `จำนวนที่ได้รับอนุญาต` = allowed qty (from license/request).
- Col 12 `จำนวนขนย้ายจริง` = **attach = SUM of actual deliveries from INFORM_MOVE** (`T_T_INFORM_MOVE_DTL`
  where `REF_LICENSE_NO` = this license AND matching weapon), LEFT-joined → 0 if never delivered. **This is
  the field that returned 0 before** — the REQ-006 fix.
- ประเภทการขนย้าย (col 6) = same `MoveRequestType` source resolved in REQ-005.
- Charts measure APPROVED qty (title "ยอดอนุญาต…"); a10 charts measured ACTUAL. Different measures.
- Purchase-document chart (chart 1) still needs its source (was "ไม่ระบุ") — likely a DATA REQUEST.
