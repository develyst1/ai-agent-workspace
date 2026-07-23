# Frontend capture — dashboard-import (อ.8 import permit), 2026-07-20

Captured by Porter from the live test frontend (read-only, not logged in), for REQ-014.

- URL: `https://test-pamf-did.mod.go.th/officer/dashboard-import`
- Page title: **"ยอดอนุญาตให้สั่งหรือนำเข้ามาในราชอาณาจักรซึ่งวัตถุหรืออาวุธ"** (import permits; the license =
  **หนังสือ อ.8**).
- Shape: **license-first "plan vs actual"** like License Move (REQ-006) — approved import license (permitted
  qty) with the **actual imported qty (per customs / กรมศุลฯ)** attached. Simpler filter set (no
  weapon-type-group, no region/province, no buyer).

## Filters
1. **วันที่อนุญาต** — issue-date range (`วันที่อนุญาตเริ่มต้น`/`สิ้นสุด`).
2. ผู้ประกอบการ (trader).
3. **หน่วยนับ*** (unit — required).
4. **วัตถุหรืออาวุธ*** (the actual product/weapon — required; NOT a type-group. cascade? standalone? — SA to confirm).

## Charts — "ยอดอนุญาตให้สั่งหรือนำเข้าวัตถุหรืออาวุธ"
1. **Top 5 แยกตามประเทศผู้ผลิต** (top 5 by manufacturing country) ← new dimension
2. แยกตามผู้ประกอบการ (by trader; measure = qty)
3. **ยอดหนังสืออนุญาต… แยกตามผู้ประกอบการ (ฉบับ)** (by trader; measure = **count of licenses/documents**, "X ฉบับ")

## Table — "รายการยอดอนุญาตให้สั่งหรือนำเข้าฯ" (+ Export Excel)
1. # · 2. **เลขที่หนังสือ อ.8** · 3. วันที่อนุญาต อ.8 · 4. วันที่หมดอายุ อ.8 · 5. ผู้ประกอบการ
6. **รหัสวัตถุหรืออาวุธ** (product code) · 7. **วัตถุหรืออาวุธ** (product name) · 8. **ประเทศผู้ผลิต** (mfg country)
9. **จำนวนที่ได้รับอนุญาต** (permitted) · 10. **จำนวนที่นำเข้าจริง (ตามแจ้งกรมศุลฯ)** (actual imported, customs) · 11. หน่วยนับ

## Reading vs REQ-014 (apply a10/license-move learnings)
- **Backbone = approved อ.8 import licenses** (license-first). SA to identify the อ.8 license source
  (table + FORM_ID/status) the same way อ.10 was.
- **จำนวนที่นำเข้าจริง (customs)** = the "actual" side — a separate source (analogous to INFORM_MOVE for
  move). **Unknown → likely a DATA REQUEST** (which table holds actual imports per กรมศุลฯ, linked to the license + product).
- New fields: **ประเทศผู้ผลิต** (mfg country) + the **"ฉบับ" = distinct-license COUNT** chart measure.
- Reuse: snake_case keys from day one, `ResponseResult`, cascade endpoints for related dropdowns, the perf
  lessons (slim base-table joins not fat views, pre-aggregated attach, no-date must complete), common-code/unit resolution.
