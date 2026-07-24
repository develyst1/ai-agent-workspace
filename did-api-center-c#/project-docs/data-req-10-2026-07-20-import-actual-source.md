# DATA REQUEST 10 — actual-import (customs) source for dashboard-import (REQ-014), 2026-07-20

## Round 1 — candidate tables (stakeholder ran the inventory)
Tables with import + (qty/ref_license) columns:
```
INF_T_LICENSE_IMPORT     ← "INF" = แจ้ง (inform) import vs a license — TOP candidate for actual qty ⭐
T_T_IMPORT_OS            ← "OS" = outstanding/balance (imported-so-far?)
T_T_REQUEST_IMPORT       ← the application (not actual) — checked, not it
V_REQUEST_DTL_IMPORT     ← request detail view
RPT_LICENSE_IMPORT / RPT_REQUEST_IMPORT / RPT_SUM_LICENSE_IMPORT   ← report tables
V_RPT_IMPORT_OS / V_RPT_IMPORT_PRODUCT / V_RPT_SUM_IMPORT          ← report views (V_RPT_IMPORT_PRODUCT may be a ready denormalized read model)
```
No `T_T_INFORM_IMPORT` (unlike move's `T_T_INFORM_MOVE`) — the "inform import" appears named `INF_T_LICENSE_IMPORT`.

## Round 2 — asked the stakeholder for columns of the top 3
`INF_T_LICENSE_IMPORT`, `T_T_IMPORT_OS`, `V_RPT_IMPORT_PRODUCT` — looking for: **imported quantity**,
`QUANTITY_UNIT_ID`, `PRODUCT_CODE`, **license linkage** (`REF_LICENSE_NO` / license id), **import/declare date**.

## @Sober — pick the actual-qty source from the columns, then design TASK-021's pre-aggregated LEFT-JOIN
attach (mirror the a10 `move_qty` = `NVL(SUM(...),0)` by license-no + product). Update SPEC-014.

---

## Round 2 result (2026-07-20) → ACTUAL-IMPORT SOURCE = `V_RPT_IMPORT_PRODUCT` ✅ (DATA REQUEST 10 CLOSED)

Column read of the 3 candidates:
- **`INF_T_LICENSE_IMPORT`** = the **license/permit** side (LICENSE_NO, ISSUE/EXPIRY_DATE, LICENSE_STATUS,
  PRODUCT_CODE/NAME, `QUANTITY_1`/`QUANTITY_2` = permitted, IMPORT_TYPE + IMPORT_BY_BOAT/PLANE/CAR). A ready
  denormalized อ.8-license-line view — **no "actual imported" column.** (Possible alternative backbone — SA judgment.)
- **`T_T_IMPORT_OS`** = outstanding balance (`OS_QUANTITY`/`OS_WEIGHT`/`OS_PRICE` by `LICENSE_NO`+declaration). Indirect.
- ⭐ **`V_RPT_IMPORT_PRODUCT`** = **actual import declarations per product** — has everything:
  - **`QUANTITY`** = actual imported qty · `REF_QUANTITY` = permitted (from license)
  - **`REF_LICENSE_NO`** + **`REF_PRODUCT_CODE`** = link to อ.8 license + product
  - **`COUNTRY_NAME`** / `ORIGIN_COUNTRY_CODE` = origin country · `DECLARATION_NO` = customs declaration
  - `EFFECTIVE_DATE` / `CONFIRM_DATE` = import date · `IS_CONFIRM` · TRADER_ID/NAME · LICENSE_ID/ITEM_NO

## ⚠ 2026-07-24 — `V_RPT_IMPORT_PRODUCT` FAILS at runtime: ORA-00942 (does not exist / not visible to app user)
Live probe (`SELECT COUNT(*) FROM V_RPT_IMPORT_PRODUCT`) as the API DB user → **ORA-00942**. Stakeholder: "ไม่มี
table นี้ ไม่มี view นี้." **Provenance note (not invented):** this name + its columns came from **the stakeholder's
own Round-1 inventory and Round-2 column read above** — so it was reachable from *some* connection on 2026-07-20,
but the app's `DID_SPF` connection can't see it now. Two hypotheses:
1. **Different schema** — the view lives in a reporting/DW schema; Round-2 was read via a privileged/other user;
   `DID_SPF` lacks SELECT + no synonym → 00942. Fix = DBA grant + synonym, OR Jason qualifies `OWNER.V_RPT_IMPORT_PRODUCT`.
2. **Not in this DB** — Round-2 columns came from another environment; the object truly isn't here → re-pick the
   actual-import source from an object confirmed to exist.

**LOCATE probe sent to stakeholder (DATA REQ 11 cont.):**
```sql
SELECT owner, object_name, object_type, status FROM all_objects
WHERE object_name IN ('V_RPT_IMPORT_PRODUCT','INF_T_LICENSE_IMPORT','T_T_IMPORT_OS','V_RPT_IMPORT_OS','V_RPT_SUM_IMPORT');
```
Result decides: found-under-other-owner → grant/qualify; not-found-at-all → @Sober re-design the "actual" attach
from a confirmed-existing member of the import family (e.g. `INF_T_LICENSE_IMPORT` / `T_T_IMPORT_OS` if those exist).

## ✅ 2026-07-24 — LOCATED: the import-actual family lives in schema `DID_ELICENSING` (cross-schema!)
`all_objects` result:
| object | owner | type | status |
|---|---|---|---|
| **V_RPT_IMPORT_PRODUCT** | **DID_ELICENSING** | VIEW | **VALID** ✅ (exists — just not in DID_SPF) |
| T_T_IMPORT_OS | DID_ELICENSING | TABLE | VALID |
| V_RPT_IMPORT_OS | DID_ELICENSING | VIEW | VALID |
| V_RPT_SUM_IMPORT | DID_ELICENSING | VIEW | VALID |
| INF_T_LICENSE_IMPORT | **DID_SPF** | VIEW | **INVALID** ⚠ (broken view in our own schema — do not use) |
| INF_T_LICENSE_IMPORT | DID_SPF69 | VIEW | VALID |

**Root cause of BUG-014-A:** `GetImportDashboard` runs on the **SPF** connection (`DID_SPF`) and references
`V_RPT_IMPORT_PRODUCT` unqualified → resolves to `DID_SPF.V_RPT_IMPORT_PRODUCT` (nonexistent) → ORA-00942. The
object is real but owned by **`DID_ELICENSING`** — a schema the SPF connection doesn't own. The move/license
dashboards never hit this because INFORM_MOVE lives inside `DID_SPF`; **import's "actual" side crosses a schema
boundary.** (Note: the solution already HAS a `DID_ELICENSING` DAL — `DidSpf.Oracle.DataAccess.ELicensing` /
`IUnitOfWorkELicensing` — but per solution CLAUDE.md it's "used by LK2, **not Center**." Center may need it wired.)

### @Sober — DESIGN DECISION: how does Center read `DID_ELICENSING.V_RPT_IMPORT_PRODUCT`? Two branches:
- **Branch A — DBA grant + synonym (least code):** DBA runs
  `GRANT SELECT ON DID_ELICENSING.V_RPT_IMPORT_PRODUCT TO DID_SPF;`
  `CREATE [OR REPLACE] SYNONYM DID_SPF.V_RPT_IMPORT_PRODUCT FOR DID_ELICENSING.V_RPT_IMPORT_PRODUCT;`
  Then the current SQL works **unchanged** (or Jason just qualifies `DID_ELICENSING.` if a grant exists w/o synonym).
  Keeps the single-query pre-agg LEFT JOIN. ⚠ Needs a **DBA action** (Porter → stakeholder: is a grant feasible?).
  A cross-schema JOIN in one query also needs the grant regardless of qualifying — qualifying alone ≠ permission.
- **Branch B — app-side two-connection merge (no DBA needed):** wire `DidSpf.Oracle.DataAccess.ELicensing`
  (`IUnitOfWorkELicensing` + its connection string) into Center; query the actual-import (SUM QUANTITY by
  REF_LICENSE_NO+REF_PRODUCT_CODE) via the **ELicensing** connection, then **merge in C#** onto the permitted-side
  rows (keyed by license-no+product-code). No grant/synonym; but adds a Center→DID_ELICENSING dependency + more code.

**Same-instance fact (verified 2026-07-24):** Center's `appsettings.json` wires **3** connections — `DID_EINTERNET`,
`DID_SPF`, `DID_SPF_CENTER` (Program.cs L169-184) — **no `DID_ELICENSING`.** All point to the **same Oracle instance**
`SID=DIDPERMIT` @ 10.32.2.50, differing only by schema user. ⇒ `DID_ELICENSING` is another schema on the **same DB**,
so a cross-schema SELECT/JOIN works natively once a grant exists → **Branch A is the clean fit; Branch B would add a
4th connection string just to reach a schema already on the same instance.**

**Column probes CONFIRMED (2026-07-24, run as a privileged user that can see the view):**
`SELECT COUNT(*) FROM V_RPT_IMPORT_PRODUCT` = **1022 rows**; `SELECT REF_LICENSE_NO, REF_PRODUCT_CODE, QUANTITY …
ROWNUM=1` = `{630201069, "1319.0003", 3}`. ⇒ **column names REF_LICENSE_NO/REF_PRODUCT_CODE/QUANTITY are correct
(no ORA-00904); the shipped SQL is right.** The 999 is **purely** cross-schema visibility (`DID_SPF` can't see
`DID_ELICENSING`'s view). Fix = grant/synonym; **no C# column change**. (Sample row for the post-fix capture check:
license 630201069 / product 1319.0003 should show `imported_qty ≥ 3`.) ⚠ At capture, confirm the join keys line up:
`REF_LICENSE_NO` (e.g. "630201069") vs `T_T_LICENSE.LICENSE_NO` format, and `REF_PRODUCT_CODE` ("1319.0003") vs
`T_T_LICENSE_DTL.PRODUCT_CODE`.

Porter recommends **Branch A if the DBA can grant** (minimal, matches the designed SQL, same instance); fall back to **B** if not.

## 2026-07-24 — STAKEHOLDER HARD RULE: "didapicenter must NOT touch the elicensing DB at all" ⇒ Branch B REJECTED too
Stakeholder: "Project didapicenter นี้ไม่ควรไปยุ่ง elicensing DB เลย" + "น่าจะเป็นตารางเหล่านี้มากกว่า:
T_M_COUNTRY / T_T_LICENSE_DTL_PRODUCER / T_T_LICENSE_DTL / T_T_LICENSE." **⇒ Roll back Branch B (remove all
ELicensing wiring from Center + the DAL additions).**

**Porter trace of the 4 named tables (entities) — they are the PERMIT side; no actual-import column exists:**
- `T_T_LICENSE` (TTLicenseEntity): header — LICENSE_NO/ISSUE/EXPIRY/TRADER/FORM_ID/LICENSE_STATUS/REF_LICENSE_NO.
  No imported-qty. `T_T_LICENSE_DTL` (TTLicenseDtlEntity): `QUANTITY` = **permitted** (+ QUANTITY2, IMPORT_BY_
  BOAT/PLANE/CAR flags) — **no actual-imported column.** `T_T_LICENSE_DTL_PRODUCER`+`T_M_COUNTRY` = producer country.
- **Full `DID_SPF` entity scan for IMPORT/ACTUAL/USED/CUSTOMS/DECLARED:** only `T_T_REQUEST_IMPORT` (the import
  *request/application*, not actuals). **No actual customs-import qty anywhere in DID_SPF.** The customs-declaration
  ("แจ้งกรมศุลฯ") family lives only in DID_ELICENSING (probe) / DID_SPF69 — outside the schema Center uses.
- **Logical conclusion:** the permit tables cannot contain "จำนวนนำเข้าจริงตามแจ้งกรมศุลฯ" by definition (permit ≠
  customs declaration). With elicensing off-limits, **Center has no real source for that ONE column.**

### DECISION to stakeholder (only the "จำนวนนำเข้าจริง" column is in question; everything else builds from the 4 SPF tables)
- **(A) DROP/park the actual-import column** — ship permitted + producer-country + charts from `DID_SPF` only
  (clean, no cross-DB). **Porter recommends A** (consistent with the hard rule).
- **(B)** stakeholder names a real `DID_SPF` actual-import source we missed → Sober traces it.
- (C) cross into elicensing only for this column — **rejected by stakeholder.**

## 2026-07-24 (cont.) — stakeholder domain teaching: the import lifecycle is ALL permit-side in DID_SPF
Stakeholder: "T_T_REQUEST_IMPORT คือ คำขอ ที่แปลงจบมาเป็น license" + shared `T_R_LICENSE_FORM`. Confirms the
FORM scheme: **FORM_ID 4 = อ.4 "คำขออนุญาตสั่งหรือนำเข้าฯ" (request)** → converts to → **FORM_ID 8 = อ.8
"หนังสืออนุญาตสั่งหรือนำเข้าฯ" (issued license).** (Also confirms our backbone FORM_ID=8 for the อ.8 import license.)
- Porter read `TTRequestImportEntity`: request header only (plant addr, REQUEST_ID, REF_LICENSE_NO, IMPORT_STATUS,
  submit/checking meta) — **zero quantity columns.** Still the request/permit side, not actuals.
- **Conclusion (firm): the entire DID_SPF import lifecycle is permit-side (อ.4 request → อ.8 license). "จำนวน
  นำเข้าจริงตามแจ้งกรมศุลฯ" is a post-license customs fact recorded only in the customs subsystem (DID_ELICENSING) —
  which Center must not touch. ⇒ NO actual-import source exists inside DID_SPF.** This mirrors the `purchase_document`/
  "เอกสารการซื้อ" precedent (stakeholder: "ไม่มี…ปล่อยไปก่อน note ไว้").
- **Porter recommendation → stakeholder (confirm):** park the "จำนวนนำเข้าจริง" column (null/"—"/omit), build the rest
  of dashboard-import from the 4 DID_SPF tables. Alt the stakeholder may choose: reinterpret "actual" as อ.4-requested
  vs อ.8-approved (both in SPF) — but that changes the column's meaning vs the FE label "ตามแจ้งกรมศุลฯ"; only if they say so.

## 2026-07-24 (cont.) — STAKEHOLDER REDIRECT: the actual-import IS in DID_SPF; team must map it (don't park it)
Stakeholder: elicensing removal is already underway (Sober/Jason) — settled. The real task: **Porter + Sober map
the SPF import picture** (which tables, which query), because "ข้อมูล import ไม่ได้อยู่ไกลถึง elicensing — มันอยู่ที่นี่
แหละ" and the 4 tables were just a *starting hint*. Deliver a concrete "what to run" list; stakeholder will run it.

**Porter trace (2026-07-24) — the actual-import concept EXISTS in DID_SPF, but its table isn't mapped as an entity:**
- `EnumConstantSPF.DocumentNoRunningType.RefInformImport = 13` = **"เลขที่ใบแจ้งข้อเท็จจริง (ขาเข้า)"** — the
  **import fact-declaration** (the "นำเข้าจริง / แจ้งนำเข้า" side), paired with `RefInformExport = 14` (ขาออก).
  ⇒ the concept is native to SPF. (`ConstantSPF.DASHBOARD_INFORM_IMPORT = "AX31"` = its own menu.)
- Mapped DAL INFORM entities are NOT it: `T_T_LICENSE_INFORM` (TTLicenseInformEntity) = a **notification letter**
  (TITLE/REFERENCE_NO/DOCUMENT_NO/template + 5 signatories/INFORM_STATUS) — **no qty/product/license-link**.
  `T_T_INFORM_MOVE(_DTL)` = the move actuals. **No import-fact-declaration entity exists** → the table is in the
  schema but unmapped in code (the DAL maps only a subset of DID_SPF).

### DATA REQUEST 12 (Porter → stakeholder) — discover the unmapped SPF import-actual table
```sql
-- D1: by object name
SELECT object_name, object_type FROM all_objects
WHERE owner='DID_SPF' AND object_type IN ('TABLE','VIEW')
  AND (object_name LIKE '%INFORM%' OR object_name LIKE '%IMPORT%' OR object_name LIKE '%FACT%'
       OR object_name LIKE '%DECLAR%' OR object_name LIKE '%CUSTOM%')
ORDER BY object_type, object_name;
-- D2: by column name (in case the table name isn't obvious)
SELECT table_name, column_name, data_type FROM all_tab_columns
WHERE owner='DID_SPF'
  AND (column_name LIKE '%IMPORT%' OR column_name LIKE '%INFORM%' OR column_name LIKE '%ACTUAL%'
       OR column_name LIKE '%DECLAR%' OR column_name LIKE '%CUSTOM%' OR column_name LIKE '%RECEIV%')
ORDER BY table_name, column_name;
```
Next once the name is known: read its columns + a sample; confirm the link to อ.8 (`REF_LICENSE_NO`/license id) +
product + a qty + a date; then design the pre-agg attach (a10 `move_qty` shape) — **all inside DID_SPF**.

### @Sober — co-design (SPEC-017 now covers BOTH the elicensing rollback AND the SPF-native re-attach)
1. **Roll back Branch B** (strip all ELicensing wiring from Center) — see rollback checklist below.
2. **Re-attach imported_qty from DID_SPF** once DATA REQUEST 12 reveals the "แจ้งข้อเท็จจริงขาเข้า" table
   (candidate: an unmapped `T_T_INFORM_*`/`*_FACT_*` table keyed to the อ.8 license + product). Add the entity+repo
   to the **SPF DAL** (`DidSpf.Oracle.DataAccess.SPF`), pre-aggregate, LEFT JOIN / C#-merge by LICENSE_NO+PRODUCT_CODE.
3. Help Porter judge **completeness** of the SPF table map for the whole page (permitted + producer country + actual
   + charts) before we commit — the stakeholder explicitly wants a team "is it complete?" check.

## ✅ 2026-07-24 — FOUND the SPF-native actual-import source: `T_T_INFORM_IMEX` + `T_T_INFORM_IMEX_DTL` (DID_SPF!)
DATA REQUEST 12 result. **IMEX = Import/EXport** ("แจ้งนำเข้า-ส่งออก" = the fact-declaration, matches
`RefInformImport=13`). Both tables are **owned by DID_SPF** — no elicensing.
- `T_T_INFORM_IMEX` (header): `INFORM_TYPE` (import vs export discriminator), `INFORM_DATE`, `INFORM_IMEX_STATUS`,
  `CUSTOMS_SENT_DATE`, `RECEIVED_DATE`, `ACTUAL_ARRIVAL_DEPARTER_DATE`, `CANCELLED_RECEIVED_DATE`, `CUSTOMS_MESSAGE`.
- `T_T_INFORM_IMEX_DTL` (detail): **`ACTUAL_QUANTITY` = the actual imported qty ("จำนวนนำเข้าจริง")** + `ACTUAL_
  AMOUNT_BAHT`, `ACTUAL_UNIT_PRICE`, `CUSTOMS_UNIT_CODE`, `IMPORT_EXPORT_SEQ`, `INFORM_IMEX_ID` (FK→header).
- Neither is mapped as a DAL entity yet → add to the **SPF DAL** (`DidSpf.Oracle.DataAccess.SPF`).

**Stakeholder guardrails (2026-07-24):** "อย่าฟรุ้งไปไกล / เลิกเชื่อชื่อ table / license import อยู่ใน license แค่
WHERE FORM_ID=8." ⇒ (1) backbone stays `T_T_LICENSE WHERE FORM_ID=8` — do NOT switch to INF_T_LICENSE_IMPORT or the
RPT_*/V_* name-lookalikes; (2) use the real base tables T_T_INFORM_IMEX(_DTL), not the report views.

### DATA REQUEST 13 (Porter → stakeholder) — the link keys, to finish the attach design
```sql
SELECT column_name, data_type FROM all_tab_columns
WHERE owner='DID_SPF' AND table_name IN ('T_T_INFORM_IMEX','T_T_INFORM_IMEX_DTL') ORDER BY table_name, column_id;
SELECT * FROM T_T_INFORM_IMEX      WHERE ROWNUM <= 3;
SELECT * FROM T_T_INFORM_IMEX_DTL  WHERE ROWNUM <= 3;
SELECT DISTINCT INFORM_TYPE FROM T_T_INFORM_IMEX;
```
Need: how IMEX links to the อ.8 license (`REF_LICENSE_NO`? a license/request id?) + the product (`PRODUCT_CODE`?) +
the unit, and which `INFORM_TYPE` value = import. Then the attach = `SUM(ACTUAL_QUANTITY)` grouped by license+product
where INFORM_TYPE=import, pre-agg LEFT JOIN onto the FORM_ID=8 permitted rows (a10 `move_qty` shape) — all in DID_SPF.

### @Sober — SPEC-017 now: re-attach imported_qty from T_T_INFORM_IMEX(_DTL) in the SPF DAL (once DR-13 gives keys)
Add `TTInformImexEntity` + `TTInformImexDtlEntity` + repo to `DidSpf.Oracle.DataAccess.SPF`; pre-aggregate
`SUM(ACTUAL_QUANTITY)` (INFORM_TYPE=import) by license-no + product-code; LEFT JOIN / merge onto GetImportDashboard's
FORM_ID=8 rows. Backbone unchanged (T_T_LICENSE FORM_ID=8). No elicensing. Watch grain (dedup like the move actuals).

## 2026-07-24 — DATA REQ 13 result: IMEX schema + link keys (stakeholder: INFORM_TYPE 0=import, 1=export)
`T_T_INFORM_IMEX` (header): ID(PK), TRADER_ID, **INFORM_TYPE ('0'=import/'1'=export)**, INFORM_DATE, **LICENSE_NO**
(the อ.8 no, e.g. `F08002261`), ISSUE_DATE, INFORM_IMEX_STATUS, CUSTOMS_MESSAGE ("LICENSE ACCEPTED"/"…CANCEL…"),
**IS_CANCEL**, CANCELLED_DATE, dest/consignment country, ports.
`T_T_INFORM_IMEX_DTL` (detail): ID(PK), **INFORM_IMEX_ID (FK→header.ID)**, ITEM_NO, REF_LICENSE_NO (a *different*
ref e.g. "36/2559" — NOT the อ.8), PRODUCT_CODE, PRODUCT_NAME, ALLOWED_QUANTITY, **QUANTITY**, QUANTITY_UNIT_ID,
REMAINING_QUANTITY, **ACTUAL_QUANTITY**, ACTUAL_AMOUNT_BAHT, ORIGIN_COUNTRY_CODE, INVOICE_*.

**Join (all DID_SPF):** `T_T_LICENSE L (FORM_ID=8) → T_T_INFORM_IMEX H ON H.LICENSE_NO=L.LICENSE_NO AND
H.INFORM_TYPE='0' AND H.IS_CANCEL=0 → T_T_INFORM_IMEX_DTL D ON D.INFORM_IMEX_ID=H.ID`. Link to license = the
**HEADER's LICENSE_NO** (not DTL.REF_LICENSE_NO).

**TWO OPEN DECISIONS (from the samples — Porter → stakeholder):**
1. **Which column = "นำเข้าจริง"?** In the 3 sample DTL rows `ACTUAL_QUANTITY` is NULL while `QUANTITY` is populated
   (=ALLOWED_QUANTITY). QUANTITY = declared-on-inform; ACTUAL_QUANTITY = verified (often null in legacy). Stakeholder to pick.
2. **Product grain:** sample `DTL.PRODUCT_CODE = "-"` (only PRODUCT_NAME text) → can't reliably join actual↔permitted
   per product_code. Attach imported_qty at **license level** (SUM per LICENSE_NO), or per-product with a reliable key?
   (Verify whether newer rows populate PRODUCT_CODE.)
- Also exclude cancelled (`IS_CANCEL=0`, and note "LICENSE CANCEL ACCEPTED" status rows).

**DATA REQ 14 (validation join) sent:**
```sql
SELECT L.LICENSE_NO, H.INFORM_TYPE, D.PRODUCT_CODE, D.PRODUCT_NAME, D.QUANTITY, D.ACTUAL_QUANTITY
FROM T_T_LICENSE L
JOIN T_T_INFORM_IMEX H ON H.LICENSE_NO=L.LICENSE_NO AND H.INFORM_TYPE='0' AND H.IS_CANCEL=0
JOIN T_T_INFORM_IMEX_DTL D ON D.INFORM_IMEX_ID=H.ID
WHERE L.FORM_ID=8 FETCH FIRST 20 ROWS ONLY;
```
Confirms: LICENSE_NO join matches; which qty col is populated for real อ.8; PRODUCT_CODE usability in newer data.

## ✅ 2026-07-24 — DR-14 result: JOIN CONFIRMED (stakeholder corrected the key). Ready to build.
**Correct join (stakeholder-fixed — the license link is on the DTL, not the header):**
```sql
FROM   T_T_LICENSE L                                     -- L.FORM_ID = 8, LICENSE_NO like "7/2561"
JOIN   T_T_INFORM_IMEX_DTL D ON D.REF_LICENSE_NO = L.LICENSE_NO
JOIN   T_T_INFORM_IMEX     H ON D.INFORM_IMEX_ID = H.ID AND H.INFORM_TYPE='0' AND H.IS_CANCEL=0
```
(`DTL.REF_LICENSE_NO` = the อ.8 no; header `LICENSE_NO`="F08…" is a separate customs/FCD code — do NOT use it.)
INFORM_TYPE: **'0'=import, '1'=export**. Returns many rows → join verified.

**Data pattern (from the sample):** `ACTUAL_QUANTITY` is **null/0 in the large majority** (legacy + many 2564+
rows). `QUANTITY` is always populated (the qty declared on the import inform).

**DECISION (stakeholder 2026-07-24, FINAL — changed from ACTUAL to QUANTITY): use `QUANTITY`.**
- `imported_qty = NVL(SUM(D.QUANTITY),0)` — the qty declared on the import inform (populated across rows, so the
  column isn't ~all-zero). NVL handles null→0. (Stakeholder first said ACTUAL_QUANTITY, then switched to QUANTITY.)
  Kept in ONE place so it stays swappable.
- **Grain = per LICENSE_NO + PRODUCT_CODE** (mirror a10 `move_qty`): pre-agg `(REF_LICENSE_NO, PRODUCT_CODE,
  SUM(QUANTITY)) WHERE INFORM_TYPE='0' AND IS_CANCEL=0 GROUP BY …`, LEFT JOIN onto the permitted line by
  `L.LICENSE_NO + DTL.PRODUCT_CODE`. Legacy rows with `PRODUCT_CODE="-"` simply won't match → imported 0 (accepted).
  ⚠ Sober: verify the IMEX `PRODUCT_CODE` ("P-xxxx") aligns with `T_T_LICENSE_DTL.PRODUCT_CODE`; if not, fall back to
  license-level SUM (document the caveat — no silent per-line mismatch).

### @Sober — SPEC-017 re-attach (BUILD NOW — join confirmed; QUANTITY default, swappable)
Add `TTInformImexEntity` + `TTInformImexDtlEntity` + repo to the **SPF DAL** (`DidSpf.Oracle.DataAccess.SPF`).
In `GetImportDashboard` (TTLicenseDtlRepository), add a pre-aggregated derived table:
`(SELECT D.REF_LICENSE_NO, D.PRODUCT_CODE, SUM(D.QUANTITY) AS IMPORTED_QTY FROM T_T_INFORM_IMEX_DTL D JOIN
T_T_INFORM_IMEX H ON D.INFORM_IMEX_ID=H.ID AND H.INFORM_TYPE='0' AND H.IS_CANCEL=0 GROUP BY D.REF_LICENSE_NO,
D.PRODUCT_CODE)` → `LEFT JOIN … ON IMP.REF_LICENSE_NO = L.LICENSE_NO AND IMP.PRODUCT_CODE = DTL.PRODUCT_CODE`,
`imported_qty = NVL(IMP.IMPORTED_QTY,0)`. All in DID_SPF (same connection) — a real SQL LEFT JOIN, not a C# merge.
**Stakeholder locked `QUANTITY`** (final; keep it in ONE place so it's swappable). Verify PRODUCT_CODE alignment; fall back to
license-only key if needed (document). Backbone unchanged (T_T_LICENSE FORM_ID=8). No elicensing.

### @Sober — (historical) SPEC-017 (Branch B ROLLBACK) done as TASK-024
Remove from Center: the `OracleELicensing` connection (appsettings + Program.cs L74/L189-192 + the `using`), the
`IUnitOfWorkELicensing` injection in `DashboardImportService`, the C# merge. Remove the DAL additions
(`VRptImportProductEntity`, `VRptImportProductRepository`, `ImportedQtyResult`, UoW wiring) — OR leave them in the
ELicensing DAL (LK2's project) but ensure **Center references none of it**. Revert `GetImportDashboard` to the
permitted-only shape: if (A), drop `imported_qty` (or return null/omit) so no elicensing/no cross-schema ref remains.
Build 0 errors; `/chart`+`/table` return permitted-side data with no 999.

## 2026-07-24 (superseded) — DECISION: Branch A DEAD (stakeholder has NO grant rights on the DB) ⇒ Branch B it is
Stakeholder: "ไม่ได้ ฉันไม่มีสิทธิในการทำแบบนั้นบน database" (same as no index-create rights). So no GRANT/synonym.
**Branch B feasibility CONFIRMED from code:**
- LK2 already wires DID_ELICENSING: `appsettings.json` `Oracle:ELicensing` block (Host/Port/**UserId=DID_ELICENSING**/
  Password) + `Program.cs` `GetOracleConnectionString("ELicensing")` → `AddScoped<IUnitOfWorkELicensing, UnitOfWorkELicensing>`.
  ⇒ credential + DAL + UoW all exist; Center copies the same wiring.
- **Gap:** the ELicensing DAL (`DidSpf.Oracle.DataAccess.ELicensing`) has only 3 entities/repos (TMTrader, TTLicense,
  TTLicenseDtl) — **no `V_RPT_IMPORT_PRODUCT` repo** → Jason adds one.

### @Sober — SPEC-016 (Branch B) — please design; then Jason implements (stakeholder go pending on the ops dep below)
1. **DAL:** add `VRptImportProductEntity` (`[Table("V_RPT_IMPORT_PRODUCT")]`, cols REF_LICENSE_NO/REF_PRODUCT_CODE/
   QUANTITY — confirmed present) + a repo method `GetImportedQtyByLicenseProduct()` returning the pre-aggregated
   `(REF_LICENSE_NO, REF_PRODUCT_CODE, SUM(QUANTITY) AS IMPORTED_QTY) GROUP BY …` (optionally filter to the license
   set / date if perf needs it). Wire into `IUnitOfWorkELicensing`/`UnitOfWorkELicensing`.
2. **Center wiring:** add the `Oracle:ELicensing` connection (mirror LK2) to Center `appsettings` + register
   `IUnitOfWorkELicensing` in `Program.cs` (4th UoW, Scoped).
3. **Service:** in `DashboardImportService`/`GetImportDashboard` — **remove the cross-schema `V_RPT_IMPORT_PRODUCT`
   LEFT JOIN** (it can never resolve on the SPF connection); fetch permitted rows via SPF as today, fetch the
   imported-qty map via the ELicensing UoW, and **merge in C#** keyed by `LICENSE_NO`+`PRODUCT_CODE` (a Dictionary
   lookup → `imported_qty = map.GetValueOrDefault(key, 0)`). Keeps the a10-shape "0 when no actual" semantics; no
   row multiplication. Charts/table unchanged downstream.
4. **Perf:** the import query no longer joins cross-schema; the ELicensing fetch is one pre-aggregated read. Confirm
   no-date still completes.
- **OPS dependency (Porter → stakeholder):** Branch B makes **Center connect to a 4th schema `DID_ELICENSING`** — the
  `DID_ELICENSING` connection (host/user/pwd, as LK2 has) must be present in **Center's deployed appsettings/env**.
  Confirm the stakeholder can add it (LK2's env already has it) + is OK with Center gaining this dependency.
Also: DID_SPF's own `INF_T_LICENSE_IMPORT` is **INVALID** — don't switch the backbone to it; stay on T_T_LICENSE FORM_ID=8.

### @Sober — wire TASK-021 (actual attach), like a10's move_qty
`imported_qty = NVL(SUM(V_RPT_IMPORT_PRODUCT.QUANTITY),0)` via a **pre-aggregated LEFT JOIN**:
`(SELECT REF_LICENSE_NO, REF_PRODUCT_CODE, SUM(QUANTITY) AS IMPORTED_QTY FROM V_RPT_IMPORT_PRODUCT GROUP BY …)`
ON `REF_LICENSE_NO = L.LICENSE_NO AND REF_PRODUCT_CODE = DTL.PRODUCT_CODE`. Notes:
- ⚠ `V_RPT_IMPORT_PRODUCT` is a **report VIEW** — apply the REQ-011/012 lesson (pre-aggregate; don't join per-row;
  watch it's not a fat view causing a no-date slowdown — materialize if needed).
- **ประเทศผู้ผลิต decision:** license-declared producer (`T_T_LICENSE_DTL_PRODUCER`→`T_M_COUNTRY`, per SPEC-014)
  vs the actual-import origin (`V_RPT_IMPORT_PRODUCT.COUNTRY_NAME`). Pick per the page's intent; confirm at capture.
- Possibly consider `IS_CONFIRM`/`CONFIRM_DATE` (count only confirmed declarations?) — SA judgment.
