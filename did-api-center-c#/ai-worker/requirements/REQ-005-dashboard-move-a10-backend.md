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

---
### SA — SPEC-005 revised + all tasks reviewed (Sober, 2026-07-20)

- Revised SPEC-005 to the **INFORM_MOVE backbone** (`T_T_INFORM_MOVE_DTL` per moved item + header; grain
  = DTL, not the per-lot view). Resolved the 3 design points from code (no follow-up DATA REQUEST): อ.10
  scoping + dest region/province + row move-type all via a **license back-join on `REF_LICENSE_NO`**
  (`T_T_LICENSE FORM_ID=10` → `T_T_LICENSE_MOVE`/`V_PROVINCE`/`T_T_LICENSE_DTL`).
- **Reviewed & passed all three tasks (code):** TASK-005 (scaffold) DONE; TASK-007 (transport-type
  entity+dropdown) DONE; TASK-006 (movement table+charts) DONE **as code** — SQL/DTO/service verified
  against SPEC-005, build 0 errors.

- **DATA REQUEST 3 (REQ-005 acceptance gate) — @Porter, relay to stakeholder (Thai).** Unlike REQ-001–004
  (deterministic), REQ-005's correctness is **data-dependent** and can't be verified by the team statically
  (brownfield). Per this REQ's own AC #6, please have the stakeholder **hit the live endpoints and drop the
  JSON** in `../project-docs/`:
  - `POST /didapicenter/api/v1/officer/dashboard-move-a10/table` with a `move_date_range` that has known
    movements (e.g. a recent month), and `.../chart` with the same body.
  - **Confirm:** (1) **rows come back non-empty** — the table INNER-joins `T_T_LICENSE` on
    `LICENSE_NO = REF_LICENSE_NO AND FORM_ID=10`; if those license-number strings don't match exactly the
    dashboard is **empty** (highest risk); (2) `move_date`/`move_seq`/`moved_qty` are populated (not 0);
    (3) no duplicated rows (the `T_T_LICENSE_DTL` join on LICENSE_ID+PRODUCT_CODE); (4) `move_request_type_name`
    resolves (INFORM_REQUEST_TYPE is the 0/1 enum). If any fails → TASK-006 REWORK (targeted SQL fix).
  - **REQ-005 stays SPEC_DONE (not DELIVERED) until this capture confirms the data.**

---
### Porter — acceptance on the live capture (2026-07-20): NOT PASSED → TASK-006 REWORK

Stakeholder ran `/table` + `/chart` (`move_date_range` = 2026-06). Full analysis:
`../project-docs/data-req-3-2026-07-20-move-a10-live-capture.md`.

- **Core works:** 7 rows returned — the `REF_LICENSE_NO = LICENSE_NO` INNER join (highest risk) is fine;
  `move_date`/`move_seq`/`moved_qty` populated; `move_request_type_name` (0/1 enum) resolves; charts
  correctly SUM `moved_qty` and match the table (31130 นัด).
- **❌ Confirmed bug — duplicate rows:** `key:6` and `key:7` are identical (license `80/2569`, `P-0672`,
  `move_seq 3`, `moved_qty 0`) — the `T_T_LICENSE_DTL` join (`LICENSE_ID+PRODUCT_CODE`) multiplication
  Sober predicted. Harmless to totals here (0-qty) but would double-count a non-zero move.
- **Blank columns to triage (bug vs real data):** `transport_type_code_name` empty on all rows;
  `authority_group_no(_name)` empty on all rows → `by_buyer_group` collapses to "ไม่ระบุ"; `expiry_date`
  empty; dest region/province blank for `80/2569`.

@Sober @Jason: **TASK-006 → REWORK** — fix the dedupe first (confirmed), then triage the four empties
(join/mapping bug, or raise a targeted DATA REQUEST if a field is genuinely absent in the DB). Re-run the
same capture to confirm before Porter closes REQ-005 → DELIVERED.

---
### SA — REWORK triage + DATA REQUEST 4 (Sober, 2026-07-20)

Triaged the capture, split into code-fixes (Jason now) vs data-source questions (DATA REQUEST 4). Fix
design in SPEC-005 "Live-capture REWORK"; TASK-006 → REWORK.

- **Fixed in code (no data needed):** (1) **dup rows** → replace the row-multiplying `T_T_LICENSE_DTL`
  join with a **correlated scalar subquery** for `TRANSPORT_TYPE_CODE`; (2) **`expiry_date` blank** →
  source `issue_date`/`expiry_date` from the already-joined `T_T_LICENSE L` (`L.ISSUE_DATE`/`L.EXPIRY_DATE`),
  not the null denormalized `DTL.REF_LICENSE_*`.
- **`80/2569` dest blank = real data** (that license has no `T_T_LICENSE_MOVE` row; LEFT join → null). Not a bug.

- **DATA REQUEST 4 — @Porter, ask the stakeholder (Thai), two column checks (ready SQL):**
  1. **Buyer group (important — the `by_buyer_group` chart is dead).** Is `BUYER_AUTHORITY_ID` actually
     populated on the movement detail, and does it join to the buyer-authority master?
     `SELECT COUNT(*) total, COUNT(BUYER_AUTHORITY_ID) has_id FROM T_T_INFORM_MOVE_DTL;` and
     `SELECT d.BUYER_AUTHORITY_ID, d.BUYER_NAME, a.AUTHORITY_GROUP_NO, a.AUTHORITY_NAME
        FROM T_T_INFORM_MOVE_DTL d LEFT JOIN T_M_PRIMARY_BUYER_AUTHORITY a ON a.ID = d.BUYER_AUTHORITY_ID
        WHERE ROWNUM <= 10;`
     If `BUYER_AUTHORITY_ID` is null, **where does the buyer's group come from** for movement rows (match
     `BUYER_NAME` → authority, or another column)?
  2. **ประเภทการขนย้าย.** Is `TRANSPORT_TYPE_CODE` ever populated on the อ.10 license lines, or is the
     column genuinely empty for these? `SELECT COUNT(*) total, COUNT(TRANSPORT_TYPE_CODE) has_code
        FROM T_T_LICENSE_DTL WHERE LICENSE_ID IN (SELECT ID FROM T_T_LICENSE WHERE FORM_ID = 10);`
     If always null, confirm ประเภทการขนย้าย is a genuine data gap (column stays blank) — or point to the
     real source.
  - Jason does the 2 code fixes now; the buyer-group wiring waits on DATA REQ 4 #1. Re-run the same
    capture after both land.

---
### Porter — DATA REQUEST 4 answers (stakeholder ran the SQL 2026-07-20)
Results: `../project-docs/data-req-4-2026-07-20-buyergroup-transport.md`.

- **#2 ประเภทการขนย้าย → CODE FIX, not a data gap.** `T_T_LICENSE_DTL.TRANSPORT_TYPE_CODE` for FORM_ID=10
  is **9407/13362 ≈ 70% populated** — the data exists. The capture blank was a resolution bug already
  covered by Jason's rework (correlated subquery + `T_R_TRANSPORT_TYPE`). Keep the column; no data needed.
- **#1 buyer group → @Sober, join key is WRONG (design gap).** `BUYER_AUTHORITY_ID` is 100% populated
  (12886/12886) but does **NOT** match `T_M_PRIMARY_BUYER_AUTHORITY.ID` (group + name come back NULL for
  every row; IDs 77/59/65/375). We have `BUYER_NAME` but not the group. The move-license join doesn't apply
  to the movement flow. @Sober: please identify from DATADIC/code the real FK target for
  `T_T_INFORM_MOVE_DTL.BUYER_AUTHORITY_ID` (a broader authority master? different key column?) and its
  group code — resolve from code, else raise **DATA REQUEST 5** with the exact probe SQL and @Porter. The
  `by_buyer_group` chart + `authority_group_no(_name)` stay unresolved until then.

---
### Porter — acceptance round 2 on the re-run capture (2026-07-20): 3/4 fixed, 1 to disambiguate
Full analysis: `../project-docs/data-req-5-2026-07-20-move-a10-recapture.md`.

- ✅ **Dup rows FIXED** (6 rows; `80/2569 seq 3` once). ✅ **`expiry_date` FIXED** (all rows). ✅ **Buyer-group
  chart FIXED** — `authority_group_no`/`_name` resolve (`T_M_BUYER_AUTHORITY` swap works); `by_buyer_group`
  = "ทหาร" 30330 + "ไม่ระบุ" 800, consistent with the table.
- ⚠️ **`transport_type_code_name` still blank on all 6 rows** — inconclusive (DATA REQ 4 said ~70% of อ.10
  lines have a code, so these 2 licenses may just lack one). **→ DATA REQUEST 5 (@Porter→stakeholder):**
  `SELECT l.LICENSE_NO, dtl.PRODUCT_CODE, dtl.TRANSPORT_TYPE_CODE FROM T_T_LICENSE_DTL dtl JOIN T_T_LICENSE l
  ON l.ID=dtl.LICENSE_ID WHERE l.FORM_ID=10 AND l.LICENSE_NO IN ('81/2569','80/2569');` — NULL ⇒ real blank ⇒
  accept; populated ⇒ @Jason 1-line resolution bug.
- Minor (@Sober, non-blocking): buyer-group code `0` (row 6, foreign buyer "…Sdn Bhd") has no label in the
  1/2/3/9 map — add a label if `0` is a real group.
- **REQ-005 held at SPEC_DONE pending DATA REQUEST 5.** All primary movement features verified on live data.

---
### Porter — DATA REQUEST 5 result (2026-07-20): transport-type blank = **CODE BUG** → TASK-006 REWORK
`SELECT … TRANSPORT_TYPE_CODE …` for the captured licenses returned: `81/2569 P-0048 → 0`,
`80/2569 P-0672 → 3` **and** `→ 1`. **The codes exist** — so the blank is a resolution bug, not missing data.
- Clue 1: `80/2569`+`P-0672` has **2 DTL lines** (codes 3 & 1) → the correlated scalar subquery keyed on
  LICENSE_ID+PRODUCT_CODE is non-unique → yields blank. Needs a deterministic pick / correct grain.
- Clue 2: `81/2569`+`P-0048` is a **single** line, code `0`, still blank → also check code `0` exists in
  `T_R_TRANSPORT_TYPE` (name lookup) — small follow-up `SELECT TRANSPORT_TYPE_CODE, TRANSPORT_TYPE_NAME
  FROM T_R_TRANSPORT_TYPE;` if BE can't resolve from code.
- @Sober @Jason: **TASK-006 → REWORK** (transport-type resolution only; the other 3 fixes stay). Re-run the
  same capture after — `transport_type_code_name` should populate. Full analysis:
  `../project-docs/data-req-5-2026-07-20-move-a10-recapture.md`.

---
### SA — transport-type diagnosis + DATA REQUEST 6 (Sober, 2026-07-20)

First: 3/4 fixes confirmed on live data — dedup, dates, and the **buyer-group chart (the `T_M_BUYER_AUTHORITY`
call was right)**. Good. Now the transport-type blank:

**Correcting the working hypothesis:** the subquery is `MAX(TRANSPORT_TYPE_CODE)`, which returns **one value
even over 2 rows** (`MAX(3,1)=3`) — so the 2-line case does **not** yield blank from "non-uniqueness". Both
the single-line (`81/2569` code 0) and multi-line (`80/2569`) rows being blank points to **one systematic
cause across all rows**, and there are exactly two candidates I can't tell apart without DB facts:
- **(A) Name-lookup miss** — codes `0`/`3` aren't rows in `T_R_TRANSPORT_TYPE` (e.g. `0` = "none") → the
  service dict returns blank. Plausible: `81/2569`'s code is `0`, which may not be a real transport type.
- **(B) Correlation miss** — `T_T_INFORM_MOVE_DTL.PRODUCT_CODE` and `T_T_LICENSE_DTL.PRODUCT_CODE` don't
  match exactly (trailing space / case) → the subquery `WHERE ... PRODUCT_CODE = ...` matches nothing →
  NULL on **every** row. This would explain "all blank" cleanly.

**DATA REQUEST 6 (@Porter → stakeholder) — 2 short queries that pinpoint it (so we fix once, not twice):**
```sql
-- (a) the ref table's actual codes+names (does 0/1/3 exist?)
SELECT TRANSPORT_TYPE_CODE, TRANSPORT_TYPE_NAME FROM T_R_TRANSPORT_TYPE ORDER BY 1;

-- (b) reproduce our exact correlation — does it resolve a code per movement row?
SELECT d.REF_LICENSE_NO, d.PRODUCT_CODE AS inform_pc,
       (SELECT MAX(ldtl.TRANSPORT_TYPE_CODE)
          FROM T_T_LICENSE_DTL ldtl JOIN T_T_LICENSE l2 ON l2.ID = ldtl.LICENSE_ID
         WHERE l2.LICENSE_NO = d.REF_LICENSE_NO AND ldtl.PRODUCT_CODE = d.PRODUCT_CODE) AS resolved_code
FROM   T_T_INFORM_MOVE_DTL d
WHERE  d.REF_LICENSE_NO IN ('81/2569','80/2569');
```
- If (b) `resolved_code` is **NULL** → cause **(B)** correlation/format mismatch → fix = TRIM/normalize the
  `PRODUCT_CODE` join (or correlate on a stabler key). If (b) returns `0`/`3` but (a) lacks those codes →
  cause **(A)** → code `0` is a legit "none" (blank is real) and any present code (e.g. 3) that's missing from
  the ref table is a data gap to note. Either way it's a **1-line fix or an accepted-blank**, decided by this.
- **Minor (bundle in):** buyer-group code **`0`** (foreign buyer "…Sdn Bhd", row 6) isn't in the 1/2/3/9 map
  (DATADIC documents only those). Is `0` a real group (ต่างประเทศ/อื่นๆ) that needs a label, or leave "ไม่ระบุ"?

**TASK-006 stays REWORK, gated on DATA REQUEST 6** for the transport-type fix (don't guess the cause). The
other 3 defects remain fixed; REQ-005 held at SPEC_DONE.

---
### Porter — DATA REQUEST 6 results (2026-07-20): root cause = EMPTY ref table, not a code bug
Full analysis: `../project-docs/data-req-6-2026-07-20-transport-type-rootcause.md`.
- **(a) `T_R_TRANSPORT_TYPE` returned NO DATA (0 rows).** Table exists, but empty in this environment.
- **(b) the correlated subquery RESOLVES the code** on every row (`81/2569→0`, `80/2569→3`) → the
  `PRODUCT_CODE` correlation is correct → **cause (B) ruled out.**
- **Root cause = (A), specifically the code→name reference table is empty.** The service gets the code fine,
  then finds no name in the empty `T_R_TRANSPORT_TYPE` → blank on every row/license. **Not a SQL/join bug.**
- **Broader impact:** the ประเภทการขนย้าย **dropdown (TASK-007)** reads the same empty table → also empty
  (matches the move-license precedent).
- **@Sober — your design call (no code "fix" to the join):** (1) accept as an environment data-gap (code is
  correct; populates once `T_R_TRANSPORT_TYPE` is seeded — document + DELIVER), or (2) hardcode a fixed enum
  for ประเภทการขนย้าย (like `MOVE_REQUEST_TYPE` 0/1) — needs the meaning of codes `0/1/3` from DATADIC, else
  a small stakeholder question via @Porter. Pick after checking DATADIC.
- Minor still open: buyer-group code `0` label (stakeholder didn't answer this round; non-blocking).
- **REQ-005 held at SPEC_DONE pending Sober's decision.** Dedup/dates/buyer-group remain accepted.

---
### Porter — ประเภทการขนย้าย fully resolved (2026-07-20): source + name mapping in hand
Stakeholder provided both halves: **source** = `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE`; **name mapping** =
`T_S_COMMON_CODE` group **`MoveRequestType`** (GROUP_NAME = "ประเภทการขนย้าย"; codes 0–5, e.g. 0="ขนย้ายให้
หน่วยงานตามมาตรา 7", 1="ขายและขนย้ายให้บุคคลอื่นนอกหน่วยงานตามมาตรา 7", 3="ขนย้ายเพื่อทดสอบ"). The captured
codes now resolve (81/2569→0, 80/2569→3). @Sober: wire the column+dropdown via the common-code table
(likely already in the DAL — drop the `T_R_TRANSPORT_TYPE` entity); trace the `T_T_REQUEST_MOVE` join;
**verify this `MoveRequestType` group isn't the same source as ประเภทการขออนุญาต's current 0/1 map** (near-identical
0/1 text). No more stakeholder data needed → Jason implements → re-run capture → close. Full data in
`../project-docs/data-req-6-2026-07-20-transport-type-rootcause.md`.

---
### Porter — stakeholder gave the REAL source for ประเภทการขนย้าย (2026-07-20)
The empty-table path was a wrong-source, not a data gap. Stakeholder: `T_R_TRANSPORT_TYPE` is **not used** —
**ประเภทการขนย้าย = `SELECT MOVE_REQUEST_TYPE FROM T_T_REQUEST_MOVE`.**
@Sober — **re-source the ประเภทการขนย้าย column + dropdown** to `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE`
(drop/repurpose the `T_R_TRANSPORT_TYPE` path from TASK-007). Design from code/DATADIC, DATA REQUEST if
needed: (1) `T_T_REQUEST_MOVE` structure + its join key to the INFORM_MOVE/license rows; (2) is
`MOVE_REQUEST_TYPE` a code (→ label map / enum values) or text — **⚠️ same column name as ประเภทการขออนุญาต's
0/1 enum; confirm it's the same set or different so the two "type" fields aren't conflated.** ประเภทการขออนุญาต
stays as-is. Then TASK-006 rework + re-run the capture. Details:
`../project-docs/data-req-6-2026-07-20-transport-type-rootcause.md`.
