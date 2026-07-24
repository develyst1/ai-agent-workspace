# REQ-014: DASHBOARD_IMPORT — build the Center backend for the อ.8 import-permit dashboard

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-20 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

New officer dashboard **`/officer/dashboard-import`** — "ยอดอนุญาตให้สั่งหรือนำเข้ามาในราชอาณาจักรซึ่งวัตถุ
หรืออาวุธ" (import permits; license = **หนังสือ อ.8**). Needs a full Center backend, built **reusing the
patterns + learnings from the two prior dashboards** (dashboard-move-a10, dashboard-move-license) — stakeholder:
"ไปต่อที่เมนูนี้เลย ในแบบที่มีความรู้จากสองเมนูก่อนหน้ามาแล้ว." Frontend evidence:
`../project-docs/dashboard-import-frontend-capture.md`.

## Requirement

Deliver the officer endpoints powering the page end-to-end, **mirroring License Move (REQ-006): license-first
"plan vs actual"** — approved อ.8 import licenses (permitted qty) with the **actual imported qty (per customs /
กรมศุลฯ) attached**.

1. **search-filter** — ผู้ประกอบการ, หน่วยนับ*, วัตถุหรืออาวุธ* (required); + any related dropdown as its own
   `search-filter-*` cascade endpoint (per the established rule — SA to decide if วัตถุหรืออาวุธ cascades from หน่วยนับ).
2. **chart** (POST) — 3 charts: (a) **Top 5 by ประเทศผู้ผลิต** (mfg country), (b) by ผู้ประกอบการ (measure =
   permitted qty), (c) by ผู้ประกอบการ **counted in ฉบับ = distinct-license count**.
3. **table** (POST) — columns per the capture: อ.8 no, issue/expiry date, trader, product code + name,
   **ประเทศผู้ผลิต**, **จำนวนที่ได้รับอนุญาต** (permitted), **จำนวนที่นำเข้าจริง (customs)**, หน่วยนับ.
4. **Filter by** the issue-date range (`วันที่อนุญาต`), trader, unit, product.
5. **Conventions (reuse, from day one):** DB-column snake_case keys, `ResponseResult` envelope, shared
   chart/dropdown inner classes untouched; **apply the perf learnings** (slim base-table joins — no fat views;
   pre-aggregated LEFT-JOIN for the "actual" attach — no per-row correlated subqueries; **no-date search must
   complete, not hang**).

## Acceptance Criteria

- [ ] Endpoints exist for dashboard-import: search-filter (+ cascades), chart (POST), table (POST) — matching
      the frontend contract.
- [ ] Table shows **permitted vs actual-imported** per อ.8 line; ประเทศผู้ผลิต populated; the "ฉบับ" chart =
      distinct-license count.
- [ ] snake_case keys; `dotnet build` succeeds; no-date completes; other dashboards untouched.
- [ ] Data-correctness verified via a live capture (like a10/license-move), DATA REQUESTs where needed.

## Constraints

- Backend only: `DidSpf.WebApi.Center` — new `DashboardImport*` controller/service/models mirroring
  `DashboardMoveLicense*`, registered in `Program.cs`. Brownfield — never touch a real DB; unknowns → DATA REQUEST.

## Out of Scope

- No frontend code (FE wires mock→real). No change to other dashboards.

## SA investigation — Sober, 2026-07-21 (traced code + DATADIC before asking)

Resolved 4/5 from code; only the "actual imported" source is a true unknown (→ DATA REQUEST 10).

- **A1 (อ.8 backbone):** `T_T_LICENSE` **`FORM_ID = 8`** (อ.8; same FORM_ID scheme License Book uses) + **`LICENSE_STATUS
  = 40`** (issued) × `T_T_LICENSE_DTL`. **No import-specific license header** exists (DATADIC T_T_ list has
  LICENSE/LICENSE_DTL/LICENSE_MOVE/LICENSE_INFORM but **no LICENSE_IMPORT**) → FORM_ID=8 identifies อ.8 directly
  (simpler than อ.10's T_T_LICENSE_MOVE back-join). Verify FORM_ID=8 at the capture.
- **A3 (ประเทศผู้ผลิต) — SOLVED in code:** `T_T_LICENSE_DTL_PRODUCER` (`TTLicenseDtlProducerEntity`, doc = "ผู้ผลิต +
  ประเทศต้นทางของรายการในใบอนุญาต...อ.8"), sub of `T_T_LICENSE_DTL` keyed by **`LICENSE_DTL_ID`**, cols `PRODUCER_NAME`
  + **`PRODUCER_COUNTRY_CODE`** → join `T_M_COUNTRY (COUNTRY_CODE → COUNTRY_NAME)`. ⚠ Grain: a line can have multiple
  producers (`ITEM_NO`) → multiple countries; SA to pick per-producer-row vs one (see SPEC-014).
- **A2 (จำนวนที่นำเข้าจริง / customs) — DATA REQUEST 10 (the real unknown):** the actual side = the **"แจ้งนำเข้า"
  (INFORM_IMPORT)** declaration family — there's a whole separate dashboard for it (`ConstantSPF.DASHBOARD_INFORM_IMPORT
  = "AX31"` = "ยอดการแจ้งนำเข้า...ตามแบบ อ.8"). But it is **not in DATADIC's documented T_T_ list and has no DAL entity**
  (just like a10's INFORM_MOVE, which needed DATA REQUEST 1). Need: the table(s) holding **actual customs-declared import
  quantity** per อ.8 license + product, the **qty column**, the **link to the license** (`REF_LICENSE_NO`?) **+ product**
  (`PRODUCT_CODE`?), and an **import date**. (`T_T_REQUEST_IMPORT` is the *application*, not the actual qty — checked.)
- **A4 (ฉบับ chart):** `COUNT(DISTINCT license)` per trader (distinct `L.LICENSE_NO`/`L.ID`) — grain confirmed.
- **A5 (product dropdown):** own cascade endpoint **`search-filter-product?quantity_unit_id=`** (optional หน่วยนับ parent),
  mirroring the established cascade rule; source = distinct products on อ.8 license lines (`T_T_LICENSE_DTL`, FORM_ID=8),
  filterable by unit. (No weapon-type-group here — simpler than a10/license.)

## DATA REQUEST 10 (via Porter → stakeholder/DBA) — the ONLY blocker for the "actual" attach
> Which table holds the **actual imported quantity per แบบ อ.8 (แจ้งกรมศุลฯ / INFORM_IMPORT)**? Please provide:
> 1. Table name(s) — the header + detail (analogous to `T_T_INFORM_MOVE` + `T_T_INFORM_MOVE_DTL`).
> 2. Columns: the **imported quantity**, the **quantity-unit id**, the **product code**, the **ref-license linkage**
>    (`REF_LICENSE_NO` or license id), and an **import/declare date**.
> 3. A row count + a sample row (like DATA REQUEST 1 for INFORM_MOVE).
The backbone + producer-country + charts + cascades can be scaffolded now (SPEC-014); the "จำนวนที่นำเข้าจริง" column +
the by-nothing-actual measures wait on this.

## BUG-014-A (stakeholder live capture, 2026-07-24) — both /chart AND /table return 999 WITH a date range

Stakeholder ran the two capture curls **with `issue_date_range: ["2026-01-01","2026-08-01"]`** (a bounded
range — NOT the no-date case):
```
POST /didapicenter/api/v1/officer/dashboard-import/chart  → {"message":"พบข้อผิดพลาด กรุณาติดต่อเจ้าหน้าที่","errors":{},"status_code":"999"}
POST /didapicenter/api/v1/officer/dashboard-import/table  → (identical 999)
```
Both endpoints 999 **even with a date filter** ⇒ **not the REQ-011 no-date/perf class** — this is a hard
**query/mapping error in the new DASHBOARD_IMPORT code** (TASK-020 scaffold and/or TASK-021 `imported_qty`
attach). Same generic 999 shape as an unhandled `ORA-*` bubbling up through `ResponseResult`.

### @Sober — diagnose (Porter routing; do NOT go to Jason until SA localizes it)
Likely suspects, in order (a10/license-move never hit these because import is the first FORM_ID=8 build):
1. **The `V_RPT_IMPORT_PRODUCT` pre-agg LEFT JOIN (TASK-021).** First use of this view in the codebase — verify
   the exact **column names** used exist (`QUANTITY`, `REF_LICENSE_NO`, `REF_PRODUCT_CODE`) and the **GROUP BY**
   is valid; an ORA-00904 (invalid identifier) here throws for every call, date or not. **Prime suspect.**
2. **`T_T_LICENSE_DTL_PRODUCER` join (ประเทศผู้ผลิต, TASK-020)** — `LICENSE_DTL_ID`/`PRODUCER_COUNTRY_CODE`/
   `T_M_COUNTRY` join keys correct? Another first-use table.
3. **FORM_ID=8 backbone / bind params** — `:dateStart`/`:dateEnd` bound but the import SQL references a param the
   command doesn't add (or vice-versa), or a type/`TO_DATE` format mismatch on the import query specifically.
4. **The `search-filter` endpoint** — did the stakeholder's earlier capture of search-filter/product cascade
   succeed, or is the whole controller failing? (If search-filter works, it isolates the fault to chart+table SQL.)

**Ask for the real error:** the 999 hides the ORA text. **DATA/OPS REQUEST 11 (Porter → stakeholder):** pull the
**server log / stack trace** for these two 999 calls (the inner `ex.Message` / ORA-code), OR temporarily surface
`errors` in the dev response — that single line will pinpoint which column/table is wrong far faster than guessing.
SA: give me the exact SQL text of the import `/chart` + `/table` queries too (paste here) so I can eyeball the
columns against DATADIC while we wait for the log.

### Porter pre-trace (2026-07-24) — pulled the actual SQL for Sober; localized to first-use tables
Source: `DidSpf.Oracle.DataAccess.SPF/Repositories/TTLicenseDtlRepository.cs` → `GetImportDashboard` (L282-335;
**both /chart and /table call this one method** → a single SQL fault fails both, matching the capture). The SQL:
```sql
SELECT L.LICENSE_NO, L.ISSUE_DATE, L.EXPIRY_DATE, L.TRADER_ID, L.TRADER_NAME,
       DTL.PRODUCT_CODE, DTL.PRODUCT_NAME, DTL.QUANTITY, DTL.QUANTITY_UNIT_ID,
       U.UNIT_NAME, CTY.COUNTRY_NAME, NVL(IIV.IMPORTED_QTY,0)
FROM T_T_LICENSE L
INNER JOIN T_T_LICENSE_DTL DTL ON DTL.LICENSE_ID = L.ID
LEFT JOIN T_M_UNIT U ON U.ID = DTL.QUANTITY_UNIT_ID
LEFT JOIN (SELECT PR.LICENSE_DTL_ID, MAX(PR.PRODUCER_COUNTRY_CODE) AS PRODUCER_COUNTRY_CODE
             FROM T_T_LICENSE_DTL_PRODUCER PR GROUP BY PR.LICENSE_DTL_ID) PRD ON PRD.LICENSE_DTL_ID = DTL.ID
LEFT JOIN (SELECT C.COUNTRY_CODE, MAX(C.COUNTRY_NAME) AS COUNTRY_NAME
             FROM T_M_COUNTRY C GROUP BY C.COUNTRY_CODE) CTY ON CTY.COUNTRY_CODE = PRD.PRODUCER_COUNTRY_CODE
LEFT JOIN (SELECT RIP.REF_LICENSE_NO, RIP.REF_PRODUCT_CODE, SUM(RIP.QUANTITY) AS IMPORTED_QTY
             FROM V_RPT_IMPORT_PRODUCT RIP GROUP BY RIP.REF_LICENSE_NO, RIP.REF_PRODUCT_CODE) IIV
       ON IIV.REF_LICENSE_NO = L.LICENSE_NO AND IIV.REF_PRODUCT_CODE = DTL.PRODUCT_CODE
WHERE L.FORM_ID =:FORM_ID AND L.LICENSE_STATUS =:LICENSE_STATUS  [ + optional ISSUE_DATE range ]
ORDER BY L.ISSUE_DATE DESC, L.ID DESC, DTL.ITEM_NO ASC
```
Ruled out: the `=: PARAM` space (L327) is **not** the bug — the working license query (L265) binds the same way.
**Suspect columns/tables used here for the FIRST time in the codebase (any invalid identifier = ORA-00904 →
999 on every call, date or not):**
- `T_M_UNIT` + `U.UNIT_NAME`, `DTL.QUANTITY_UNIT_ID` — is the unit master really `T_M_UNIT` with `ID`/`UNIT_NAME`?
  (License/a10 resolved unit differently — this join is new here.)
- `T_T_LICENSE_DTL_PRODUCER` `PR.LICENSE_DTL_ID` / `PR.PRODUCER_COUNTRY_CODE`; and `PRD.LICENSE_DTL_ID = DTL.ID`
  (is the T_T_LICENSE_DTL PK column `ID`?).
- `T_M_COUNTRY` `C.COUNTRY_CODE` / `C.COUNTRY_NAME`.
- `V_RPT_IMPORT_PRODUCT` `RIP.REF_LICENSE_NO` / `RIP.REF_PRODUCT_CODE` / `RIP.QUANTITY` (from DATA REQ 10 col read
  — but names unverified against the live view; a view-permission/ORA-00942 on `V_RPT_IMPORT_PRODUCT` would also 999).
- `DTL.PRODUCT_NAME`, `DTL.QUANTITY`, `DTL.ITEM_NO`, `L.EXPIRY_DATE`, `L.TRADER_NAME` — new SELECT cols vs the
  move query; confirm they exist on T_T_LICENSE_DTL / T_T_LICENSE.

@Sober — the server-log ORA line (DATA REQ 11) will name the exact bad identifier; then Jason does a 1-line column
fix. Also note `GetImportProducts` (L341) uses the same new tables → the `search-filter-product` cascade may 999 too.

### Porter code-verification (2026-07-24) → suspect narrowed to a SINGLE object: `V_RPT_IMPORT_PRODUCT`
Checked every first-use table against its DAL entity (`[Column(...)]` attrs) — **all confirmed present:**
- `T_M_UNIT` → `TMUnitEntity`: `ID`, `UNIT_NAME` ✓
- `T_M_COUNTRY` → `TMCountryEntity`: `COUNTRY_CODE`, `COUNTRY_NAME` ✓
- `T_T_LICENSE_DTL_PRODUCER` → `TTLicenseDtlProducerEntity`: `LICENSE_DTL_ID`, `PRODUCER_COUNTRY_CODE` ✓
- `T_T_LICENSE_DTL` → `TTLicenseDtlEntity`: `ID`(PK), `LICENSE_ID`, `ITEM_NO`, `PRODUCT_CODE`, `PRODUCT_NAME`,
  `QUANTITY`, `QUANTITY_UNIT_ID` ✓ · `T_T_LICENSE` cols (LICENSE_NO/ISSUE_DATE/EXPIRY_DATE/TRADER_*/FORM_ID/
  LICENSE_STATUS/ID) all already used by the shipped move queries ✓
⇒ **`V_RPT_IMPORT_PRODUCT` is the ONLY object with no entity (raw view, first use) — cannot verify from code.**
Its two plausible failure modes (both → 999 on every call):
- **ORA-00942** — view not visible to the app's Oracle connection user (`DID_SPF`): missing SELECT grant, or the
  view lives in another schema and needs a `SCHEMA.` qualifier. (The stakeholder saw it via their own tool/user.)
- **ORA-00904** — one of `REF_LICENSE_NO`/`REF_PRODUCT_CODE`/`QUANTITY` is slightly off vs the live view (the
  DATA REQ 10 column read may have paraphrased names).

### DATA/OPS REQUEST 11 (refined — Porter → stakeholder) — two tiny probes, no log-digging needed
Run **as the API's DB user** (same connection the WebApi uses), not your admin tool:
1. `SELECT COUNT(*) FROM V_RPT_IMPORT_PRODUCT;`  → ORA-00942 ⇒ **grant/visibility** problem (Jason qualifies the
   schema or DBA grants SELECT). A number ⇒ view is reachable, go to (2).
2. `SELECT REF_LICENSE_NO, REF_PRODUCT_CODE, QUANTITY FROM V_RPT_IMPORT_PRODUCT WHERE ROWNUM = 1;`  → ORA-00904 ⇒
   **column-name** problem (name it → Jason fixes the one identifier). Rows ⇒ names are right (look elsewhere).
(If easy, the server-log ORA line still settles it in one shot — but these two probes need no log access.)

## Questions

(SA Lead asks here; PM answers as `> answer: ...`)

- Q1 (PM for SA): **อ.8 import-license source** — which table + FORM_ID/status identifies the approved อ.8
  import licenses (the backbone)? Trace like อ.10; DATA REQUEST if not in code.
- Q2 (PM for SA): **จำนวนที่นำเข้าจริง (actual imported per กรมศุลฯ)** — this is the "actual" side (analogous to
  INFORM_MOVE for move). Which table/columns hold the customs-declared import quantities, linked to the license
  + product? Likely a **DATA REQUEST** (the biggest unknown, like DATA REQUEST 1 was for a10).
- Q3 (PM for SA): **ประเทศผู้ผลิต (mfg country)** source column/table (on the license line? the product? a
  customs record?).
- Q4 (PM for SA): the **"ฉบับ" chart** = COUNT(DISTINCT license) per trader — confirm the grain.
- Q5 (PM for SA): does **วัตถุหรืออาวุธ*** (product) cascade from หน่วยนับ (its own `search-filter-*` endpoint),
  or is it a standalone dropdown? Source for the product list.
