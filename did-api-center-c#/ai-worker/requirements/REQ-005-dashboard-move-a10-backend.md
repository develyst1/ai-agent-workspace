# REQ-005: DASHBOARD_MOVE_A10 — build the Center backend for the อ.10 movement/delivery dashboard

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-20 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

The frontend page **`/officer/dashboard-move-a10`** — "ยอดการขนย้าย/ส่งมอบอาวุธหรือวัตถุ ตามแบบ อ.10"
— exists but is running on **mock data**; it makes no dashboard API call yet (verified: only
`/didapicenter/api/v1/officer/notification` fires). Officers need it backed by real data from the
Center backend (`DidSpf.WebApi.Center`), the same one serving the other officer dashboards.

This is a **new, separate dashboard** from `dashboard-move-license` (stakeholder confirmed 2026-07-20).
Its filter set is near-identical to move-license, but its subject is the **actual movement / delivery
of arms per transaction** (date moved, move sequence, actual moved quantity) — not permitted amounts.
Stakeholder: "ทำเมนูนี้ต่อเลย … filter เหมือนๆ กับ move license เลย" and confirmed the deliverable =
**a full working backend** for this page.

Raw frontend evidence (filters, charts, table columns, cascades): see
`../project-docs/dashboard-move-a10-frontend-capture.md`.

## Requirement

1. Provide the **full Center backend** that powers the `dashboard-move-a10` page end-to-end, matching
   the frontend's filters, charts, and table (as captured in the frontend-capture doc). Deliver the
   same class of endpoints as the move-license dashboard:
   - **search-filter** — non-cascading dropdowns (ประเภทการขออนุญาต, ประเภทการขนย้าย, ผู้ประกอบการ,
     ภาค, กลุ่มหน่วยผู้ซื้อ, หน่วยผู้ซื้อ, ประเภทอาวุธ) + defaults.
   - **cascade dropdowns** — จังหวัด←ภาค, หน่วยนับ←ประเภทอาวุธ, อาวุธ←(ประเภทอาวุธ+หน่วยนับ), following
     the established "each related dropdown is its own `search-filter-*` endpoint" rule.
   - **chart** (POST) — the 3 charts: Top 5 by buyer unit, by buyer group, by trader.
   - **table** (POST) — the row list with all columns in the capture doc.
2. **Scope of data = "actual movement" (อ.10 delivery transactions).** The table is per-move-transaction:
   it includes **วันที่ขนย้าย (move date)**, **ครั้งที่ขนย้าย (move sequence)**, and **จำนวนที่ขนย้าย
   (actual moved qty)** in addition to the license fields. The primary date filter is the **move date**
   (`วันที่ขนย้ายเริ่มต้น/สิ้นสุด`), not the license issue date.
3. **Reuse the move-license pattern.** Same service-layer/DAL/controller conventions, same cascade
   design, same dropdown-source decisions where they apply (weapon type = PRODUCT_TYPE_GROUP_CODE,
   buyer group map, region from V_PROVINCE.AREA_NAME, address mapping) — SA to reuse, not reinvent.
4. **Response keys aligned to DB columns from the start.** Use the **same key convention now in force on
   the delivered move-license / license-book dashboards** (response/request field keys = DB-column
   lowercase snake_case; shared chart/dropdown inner classes untouched). Goal: the frontend can consume
   this dashboard with no translation layer, and **no follow-up rename REQ is needed later**.
5. **JSON/behaviour parity:** wrap in the standard `ResponseResult` envelope; keep the shared
   chart/dropdown inner classes unchanged (hard constraint carried from REQ-001/003).

## Acceptance Criteria

- [ ] Endpoints exist under the Center for `dashboard-move-a10` covering: search-filter, the cascade
      dropdowns (province/unit/weapon), chart (POST), table (POST) — matching the frontend contract in
      the capture doc.
- [ ] The table returns the movement fields (move date, move sequence, actual moved qty) sourced from
      real อ.10 movement data — not hardcoded 0 / "ไม่ระบุ".
- [ ] Filtering works for every filter on the page, including the move-date range; required filters
      (ประเภทอาวุธ, หน่วยนับ) enforced as the frontend expects.
- [ ] Response/request keys follow the DB-column snake_case convention already used on move-license /
      license-book (no translation layer needed; no later rename REQ).
- [ ] `dotnet build` succeeds; shared dashboard classes and other dashboards untouched.
- [ ] (Data-correctness) Where live verification needs an officer JWT / real Oracle, that is captured
      as a DATA REQUEST rather than guessed — see Questions.

## Constraints

- Backend only: `DidSpf.WebApi.Center`. New `dashboard-move-a10` model/service/controller (SA to name
  and place, mirroring `DashboardMoveLicense*`). Registered in `Program.cs`.
- **Brownfield — never touch a real DB/environment.** No SQL run by the team. Unknown data sources go
  through a DATA REQUEST to the stakeholder (Thai, with ready-to-run SQL / what to capture).
- Frontend wiring (swapping the page's mock for the real endpoints) is owned by the frontend side — see
  Out of Scope. This REQ delivers the backend the page will call.

## Out of Scope

- No frontend code changes (mock→real wiring is a separate frontend task; this REQ makes the backend
  ready and contract-correct).
- No changes to move-license, license-book, or any other dashboard.
- No new report/export formats beyond what the page already shows (Excel export is a frontend feature
  unless SA finds it needs a backend endpoint — flag if so).

## Questions

(SA Lead asks here; PM answers as `> answer: ...`)

- Q1 (raised by PM for SA): **Source of the "actual movement" data.** The three columns วันที่ขนย้าย /
  ครั้งที่ขนย้าย / จำนวนที่ขนย้าย are the point of this dashboard. On the move-license build, actual
  moved qty had **no backing column and returned 0** (memory `dashboard-move-license-api`). Please
  identify the real per-move-transaction source (candidate: `T_T_LICENSE_MOVE` detail or a related
  move-transaction table). If it is not discoverable from code, raise a **DATA REQUEST** (exact
  table/columns/SQL) and `@Porter` — the stakeholder will provide it.
- Q2 (raised by PM for SA): On move-license, `transport_type` (MOVE_REQUEST_TYPE) and `move_type`
  (TRANSPORT_TYPE_CODE) dropdowns were **unresolved** (no common-code group found, returned empty). This
  dashboard has the same two dropdowns (ประเภทการขออนุญาต / ประเภทการขนย้าย). Please confirm the source;
  if still unknown, this is a **DATA REQUEST** to the stakeholder.
- Q3 (raised by PM for SA): The table shows two "ประเภทการขออนุญาต" headers — the 2nd is almost
  certainly **ประเภทการขนย้าย**. Confirm the exact frontend column contract (the frontend types /
  `servicesV2/dashboard.service.ts` in the `did-spf-frontend` repo are the source of truth for keys).

---
### SA response (Sober, 2026-07-20) — investigated the code/DATADIC before asking; 2 DATA REQUESTs remain

Full design in `specs/SPEC-005-...`. Most of the dashboard is designable from code (search-filter, 3
cascades, license-side table columns — all mirror the delivered move-license). Findings + gaps:

- **Q1 → DATA REQUEST 1 (CRITICAL, blocks the core).** The actual movement data (วันที่ขนย้าย /
  ครั้งที่ขนย้าย / จำนวนที่ขนย้าย) **has no source in the known schema.** `T_T_LICENSE_MOVE`
  (`TTLicenseMoveEntity`) is **1 row per license** = the move authorization (origin/dest address,
  MOVE_REQUEST_TYPE, START_DATE/END_DATE permitted window, CONDITION1..5); it has no move-sequence,
  moved-qty, or actual-move-date column, and there's no `T_T_LICENSE_MOVE_DTL` / delivery table in
  `DID_SPF`. This is the same gap that made move-license return `moveQty = 0`.
  **@Porter — ask the stakeholder (Thai):** where are the per-move/delivery transaction records for อ.10
  (move date + sequence + actual moved qty, linked to the license + weapon line)? Provide the table
  (schema+name) + columns / a sample, **or** confirm the data isn't captured yet (→ scope escalation).
  Ready SQL to inventory candidates:
  `SELECT DISTINCT table_name FROM all_tab_columns WHERE column_name LIKE '%MOVE%' AND (column_name LIKE '%DATE%' OR column_name LIKE '%SEQ%' OR column_name LIKE '%QTY%' OR column_name LIKE '%QUANTITY%');`
  and `SELECT column_name, data_type FROM all_tab_columns WHERE table_name='T_T_LICENSE_MOVE';`
  → Blocks table movement columns + the move-date filter + the 3 charts' measure. TASK-006 is BLOCKED on this.

- **Q2 → partly RESOLVED, one small DATA REQUEST 2.**
  - **ประเภทการขออนุญาต (MOVE_REQUEST_TYPE): RESOLVED** — DATADIC documents a fixed enum
    `0 = หน่วยงานตามมาตรา 7`, `1 = ขาย/ขนย้ายนอกหน่วยงาน`. Build from a fixed map (better than
    move-license, which returned empty). No DATA REQUEST.
  - **ประเภทการขนย้าย (TRANSPORT_TYPE_CODE):** source = **`T_R_TRANSPORT_TYPE`** (DATADIC FK), but it's
    **not wired into the SPF DAL** (no entity/repo). BE will add the entity (`spf-add-entity`) — but its
    columns aren't in DATADIC. **DATA REQUEST 2 (@Porter):** confirm `T_R_TRANSPORT_TYPE` columns (the
    code column + the Thai-name column). `SELECT column_name, data_type FROM all_tab_columns WHERE table_name='T_R_TRANSPORT_TYPE';`
    → TASK-007 is BLOCKED on this (small; the ประเภทการขนย้าย dropdown is empty until then, matching the
    move-license precedent).

- **Q3 → resolved by convention.** I'll define request/response keys with the delivered move-license
  snake_case convention (so no later rename REQ — REQ-005 #4). Table cols 5/6 = `move_request_type_name`
  + `transport_type_code_name` (capture doc agrees col 6 = ประเภทการขนย้าย). If the frontend's
  `dashboard.service.ts` already fixes specific keys, please share; otherwise the FE adopts these.

**Status:** SPEC-005 written; **TASK-005 (scaffold + search-filter + cascades) is UNBLOCKED and started
now** by BE; **TASK-006 (movement chart/table) BLOCKED on DATA REQUEST 1**; **TASK-007 (ประเภทการขนย้าย /
T_R_TRANSPORT_TYPE) BLOCKED on DATA REQUEST 2.** @Porter please relay DATA REQUEST 1 (critical) + 2 to the
stakeholder in Thai.

---
### Porter — DATA REQUEST answers (stakeholder ran the SQL 2026-07-20)

Results saved: `../project-docs/data-req-2026-07-20-move-a10-results.md`.

- **DATA REQUEST 2 → ANSWERED (unblocks TASK-007).** `T_R_TRANSPORT_TYPE` columns confirmed:
  **`TRANSPORT_TYPE_CODE` (NUMBER) = code/value, `TRANSPORT_TYPE_NAME` (VARCHAR2) = Thai label** (+ audit
  cols). @Jason: build the SPF entity with those two columns for the ประเภทการขนย้าย dropdown. TASK-007
  is unblocked.

- **DATA REQUEST 1 → PROGRESS, not yet closed (TASK-006 still blocked).** Confirmed `T_T_LICENSE_MOVE` is
  **authorization-only** (`LICENSE_ID`, `MOVE_REQUEST_TYPE`, `START/END_DATE`, `CONDITION1..5`,
  `ORIGIN_*`/`DEST_*` address — **no** move date/sequence/qty). The inventory query surfaced an
  **`INFORM_MOVE` family** ("การแจ้งขนย้าย") — header `T_T_INFORM_MOVE`, detail `T_T_INFORM_MOVE_DTL`,
  views `V_INFORM_MOVE_DTL(_LOT)`, report `RPT_*` — the likely home of actual move date + sequence + qty.
  @Sober: is the INFORM_MOVE family the อ.10 actual-movement source you want (and which grain — DTL vs
  DTL_LOT view)? Porter has asked the stakeholder for the column lists of `T_T_INFORM_MOVE`,
  `T_T_INFORM_MOVE_DTL`, `V_INFORM_MOVE_DTL_LOT` so you can confirm the link to LICENSE_ID/อ.10 + weapon
  line and pick the source. Will post them here + in project-docs when they arrive.

- **DATA REQUEST 1 → ANSWERED (unblocks TASK-006).** Stakeholder ran the round-2 SQL (2026-07-20);
  columns saved in `../project-docs/data-req-2026-07-20-move-a10-results.md` (§ DATA REQUEST 1b). The
  **movement data lives in the `INFORM_MOVE` family**, not the license tables:
  - `T_T_INFORM_MOVE_DTL` (per moved item) has exactly the missing fields — **`MOVE_DATE`** (วันที่ขนย้าย),
    **`MOVE_SEQ`** (ครั้งที่ขนย้าย), **`QUANTITY`** (จำนวนที่ขนย้าย) — plus `ALLOWED_QUANTITY`,
    `REF_LICENSE_NO` (→ อ.10 no), `REF_LICENSE_ISSUE/EXPIRY_DATE`, `PRODUCT_*`, `BUYER_*`,
    `QUANTITY_UNIT_ID`; header `T_T_INFORM_MOVE` has `TRADER_ID`, `INFORM_REQUEST_TYPE`.
  - `V_INFORM_MOVE_DTL_LOT` is a ready-joined denormalized view (adds `UNIT_NAME`, `TOTAL_QUANTITY`, …).
  A candidate column→dashboard mapping is in the results doc for you to confirm.
  @Sober — **please revise SPEC-005's data backbone** from the license tables to the INFORM_MOVE family
  (this dashboard = actual move transactions linked to อ.10 via `REF_LICENSE_NO`). Three design points
  left to you (non-blocking, resolve from code or raise a small follow-up): (1) how to scope rows to
  อ.10, (2) where the row's ประเภทการขนย้าย/ประเภทการขออนุญาต comes from, (3) grain = DTL vs `_LOT` view.
  **All DATA REQUESTs for REQ-005 are now answered.**
