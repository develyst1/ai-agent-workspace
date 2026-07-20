# Frontend capture — dashboard-move-a10 (อ.10 movement/delivery)

Captured by Porter 2026-07-20 from the live test frontend (read-only, not logged in),
to give the team the raw evidence behind REQ-005. Frontend uses **mock data** — the
dashboard makes **no dashboard API call** yet (only `/didapicenter/api/v1/officer/notification` → 401).

- URL: `https://test-pamf-did.mod.go.th/officer/dashboard-move-a10`
- API base (Center): `/didapicenter/api/v1/officer/...`
- Page title: **"ยอดการขนย้าย/ส่งมอบอาวุธหรือวัตถุ ตามแบบ อ.10"**
- Relationship: **NEW dashboard, separate** from `dashboard-move-license` (confirmed by stakeholder
  2026-07-20). Filter set is near-identical to move-license, but the subject is **actual movement /
  delivery per transaction** (not permitted amounts).

## Filters (ค้นหาข้อมูล)

1. **วันที่ขนย้าย** — date range: `วันที่ขนย้ายเริ่มต้น` / `วันที่สิ้นสุด` (filters on the *move* date, not license date)
2. ประเภทการขออนุญาต (move-request / transport type) — default "ทั้งหมด"
3. ประเภทการขนย้าย (move type) — default "ทั้งหมด"
4. ผู้ประกอบการ (trader)
5. ภาค(ผู้รับปลายทาง) (region — destination receiver)
6. จังหวัด(ผู้รับปลายทาง) (province — destination; cascades from ภาค)
7. กลุ่มหน่วยผู้ซื้อ(ผู้รับปลายทาง) (buyer group)
8. หน่วยผู้ซื้อ(ผู้รับปลายทาง) (buyer unit)
9. **ประเภทอาวุธ*** (weapon type — required)
10. **หน่วยนับ*** (unit — required; cascades from ประเภทอาวุธ)
11. อาวุธ (weapon; cascades from ประเภทอาวุธ + หน่วยนับ)
- Buttons: ค้นหา / รีเซ็ต

Cascade structure looks identical to move-license: จังหวัด←ภาค, หน่วยนับ←ประเภทอาวุธ,
อาวุธ←(ประเภทอาวุธ+หน่วยนับ).

## Charts (subject: "ยอดการขนย้าย/ส่งมอบกระสุน")

1. Top 5 แยกตามหน่วยผู้ซื้อ (top 5 by buyer unit)
2. แยกตามกลุ่มหน่วยผู้ซื้อ (by buyer group)
3. แยกตามผู้ประกอบการ (by trader)
- Each shows ยอดรวม (total) + show/hide legend. Copy/PNG export controls present.

## Table — "รายการยอดการขนย้าย/ส่งมอบอาวุธหรือวัตถุ ตามแบบ อ.10" (+ Export Excel)

Columns (as rendered; two "ประเภทการขออนุญาต" headers appear — 2nd is almost certainly
**ประเภทการขนย้าย**; confirm from frontend types):
1. # (row key)
2. เลขที่หนังสือ อ.10 (license no)
3. วันที่อนุญาต อ.10 (issue date)
4. วันที่หมดอายุ อ.10 (expiry date)
5. ประเภทการขออนุญาต (move-request type)
6. ประเภทการขนย้าย (move type) — [rendered as a 2nd "ประเภทการขออนุญาต"; verify]
7. ผู้ประกอบการ (trader)
8. กลุ่มหน่วยผู้ซื้อ (buyer group)
9. หน่วยผู้ซื้อ (buyer unit)
10. อาวุธ (weapon)
11. จำนวนที่ได้รับอนุญาต (permitted qty)
12. **วันที่ขนย้าย (move date)** ← new vs move-license
13. **ครั้งที่ขนย้าย (move sequence no.)** ← new vs move-license
14. **จำนวนที่ขนย้าย (actual moved qty)** ← new vs move-license
15. หน่วยนับ (unit)

## Key risk flagged for SA

The three "actual movement" columns (วันที่ขนย้าย / ครั้งที่ขนย้าย / จำนวนที่ขนย้าย) are the
crux of this dashboard. During the move-license build, **`จำนวนขนย้ายจริง` (actual moved qty) was a
DATA GAP — no backing column, returned 0** (see memory `dashboard-move-license-api`). This dashboard
depends on that data existing as per-move-transaction rows (candidate source: `T_T_LICENSE_MOVE`
detail / a move-transaction table). SA must confirm the real source; likely a **DATA REQUEST**.
