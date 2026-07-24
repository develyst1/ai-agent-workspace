# REQ-016: DASHBOARD_IMPORT_A8 — Center backend for the "แจ้งนำเข้าจริง ตาม อ.8" dashboard (real-first, mirror of a10)

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-24 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
New officer dashboard **`/officer/dashboard-import-a8`** — "ยอดการแจ้งนำเข้ามาในราชอาณาจักรซึ่งวัตถุหรืออาวุธ
ตามแบบ อ.8". The **real-import-first** counterpart of the delivered permit-first `dashboard-import` (REQ-014),
mirroring the a10 vs license-move relationship the stakeholder confirmed:
- license move = **approve** LEFT JOIN real  ·  a10 = **real** LEFT JOIN approve  ·  **import-a8 = a10-style (real-first)**.

Frontend evidence: `../project-docs/dashboard-import-a8-frontend-capture.md`.

## Requirement
Base = the actual import declarations `T_T_INFORM_IMEX_DTL` (× `T_T_INFORM_IMEX`, `INFORM_TYPE='0'`, `IS_CANCEL=0`),
one row per declaration line (ครั้งที่/seq); attach the referenced อ.8 license (`T_T_LICENSE` FORM_ID=8, by
`REF_LICENSE_NO = LICENSE_NO`) for the อ.8 no / issue / expiry dates. All in **DID_SPF** (no elicensing).

1. **search-filter** (+ cascades): ผู้ประกอบการ, หน่วยนับ*, วัตถุหรืออาวุธ* — reuse REQ-014's cascade where possible.
2. **TWO date filters** (⚠ differs from dashboard-import): **วันที่อนุญาต อ.8** (license ISSUE_DATE) +
   **วันที่แจ้งนำเข้า** (`T_T_INFORM_IMEX.INFORM_DATE`, the primary/base date — like a10's MOVE_DATE). Both optional,
   both supported no-date (perf lessons).
3. **chart** (POST) — **4 charts** = {by ผู้ประกอบการ, Top5 by ประเทศแหล่งที่มา(ต้นทาง)} × {qty, **มูลค่า(บาท)**}.
   New value/บาท measure (`AMOUNT_BAHT`); origin country = `ORIGIN_COUNTRY_CODE` (NOT producer country).
4. **table** (POST) — 15 cols per the capture (อ.8 no, issue/expiry, trader, **วันที่แจ้งนำเข้า**, **วันที่อนุญาตนำเข้า**,
   product code+name, unit, **จำนวนที่ได้รับอนุญาต**, **ครั้งที่**, **จำนวนที่นำเข้าจริง**, **ราคาต่อหน่วย**,
   **รวมมูลค่า(บาท)**, **ประเทศแหล่งที่มา(ต้นทาง)**).
5. Conventions: snake_case keys, ResponseResult, shared chart/dropdown inner classes; perf (pre-agg, no fat views,
   no-date must complete). New `DashboardImportA8*` controller/service/models mirroring the a10 set, registered in Program.cs.

## Acceptance Criteria
- [ ] Endpoints: search-filter (+cascades), chart (POST, 4 charts qty+baht), table (POST, 15 cols) — match the FE.
- [ ] Real-first base (IMEX detail line grain, INFORM_TYPE='0', IS_CANCEL=0) with the อ.8 license attached.
- [ ] Two date filters (issue อ.8 + inform date) work independently; no-date completes.
- [ ] snake_case; `dotnet build` succeeds; other dashboards untouched; verified by live capture.

## Constraints
- Backend only: `DidSpf.WebApi.Center`. Brownfield — no real DB; unknowns → DATA REQUEST. All DID_SPF (no elicensing).

## SA questions (Sober) — see capture doc Q1–Q5
- Q1 "วันที่อนุญาตนำเข้า" (col 7) source vs "วันที่แจ้งนำเข้า"=INFORM_DATE (header START_DATE/ISSUE_DATE?).
- Q2 "จำนวนที่นำเข้าจริง" = QUANTITY vs ACTUAL_QUANTITY (REQ-014 locked QUANTITY — confirm same here).
- Q3 origin country col = `ORIGIN_COUNTRY_CODE` (dtl) → T_M_COUNTRY? (vs header CONSIGNMENT/DESTINATION).
- Q4 permitted = `ALLOWED_QUANTITY` (on the IMEX line) vs license DTL.QUANTITY; value = `AMOUNT_BAHT` + `UNIT_PRICE_BAHT`.
- Q5 grain = per IMEX detail line (ครั้งที่); confirm no de-dup; cancelled excluded.

## Out of Scope
- No frontend code. No change to dashboard-import (REQ-014) or other dashboards.
