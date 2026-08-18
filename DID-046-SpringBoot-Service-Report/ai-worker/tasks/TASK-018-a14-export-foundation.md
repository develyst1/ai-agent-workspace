# TASK-018: อ.14 export-sale FOUNDATION — new report skeleton + routing + page-1 + evidence 1–11 (NOT item-12)

- Source: SPEC-023 (REQ-022). Mirrors the proven อ.9 foundation split. Item-12 export = TASK-019 (follow-up).
- Status: DONE (Sober-reviewed, preview + resolver independently verified)
- Assignee: Jason (BE)
- Depends on: none (routing answered; `ReqSaleInt` seed not needed — ticks graceful)
- ⚠️ Reuse the อ.9 engine/geometry; do NOT touch อ.6 / อ.9 report code. New report code = `"A14"`.

## Build the report skeleton (mirror `checklist/a9`)
New package `report/checklist/a14`: `A14CheckListReportData` (record; same shape as A9 incl. `documentTitle`
+ `item5Label`), `A14CheckListReportBuilder` (+ `A14CheckListPreviewBuilder`), jrxml under
`reports-045/request-a14/` (main + subreports) **copied from a9 geometry** (locked structure, 4-signature,
blank-never-null). Wire: `ReportDefinition.A14` (code `"A14"` + documentTitle), `ReportResourceService`
(a14 `.jasper` paths), `JasperPdfReportService.exportPdfA14()`, `DocumentController` switch, and the a14
`.jasper` regenerated via a new `A14PreviewTest` (mirror `A9PreviewTest`).

## Routing — new per-family leg (do NOT use resolveFromSpecial)
`RequestTypeResolverService`: add `resolveFromSaleInt(requestId)` — query the `T_T_REQUEST_SALE_INT` row
(new `RequestSaleIntEntity` + repo, NULL-safe status); if present with `FORM_ID` 14/16 → return `"A14"`.
Call it in the resolver chain **before** the `REQUEST_TYPE` fallback (alongside `resolveFromSpecial`; order
so a request maps to exactly one family). Do NOT add `case 14,16` to the SPECIAL switch (SPECIAL holds only
FORM_ID 6 — dead end). QA samples: 27300 / 34380 / 35966 / 36711 / 36741.

## Page 1 (mostly shared with อ.9 transport)
- `documentTitle` = `หลักฐานที่ใช้ประกอบคำขอรับหนังสืออนุญาตขายหรือจำหน่ายอาวุธ โดยการส่งออกไปนอกราชอาณาจักร`.
- item 2 (permitType) = `ขายและขนย้ายให้บุคคลอื่นนอกจากหน่วยงานตามมาตรา 7 โดยการส่งออกไปนอกราชอาณาจักร`.
- item 5: `item5Label` = `หน่วยงานผู้ซื้อ/ผู้รับอาวุธ`; **value = `T_T_REQUEST_SALE_INT.BUYER_NAME`**
  (confirm BUYER_NAME vs IMPORTER_NAME on a real sample during build; BUYER_NAME is the item-5 assumption).
- items 1/3/4/6 = same sources as อ.9 (traderName, weapon-annex ref, count of `T_T_REQUEST_DTL_SALE_INT`
  rows, objective). Header table = `T_T_REQUEST_SALE_INT`; detail/annex (page 4) = `T_T_REQUEST_DTL_SALE_INT`.
- **item 7 (ระยะเวลาการอนุญาต) = `T_T_LICENSE.PERIOD_TEXT`** (the a6 pattern:
  `firstOrNull(licenseRepository.findByRequestIdOrderByIdDesc(requestId))` → `nz(getPeriodText())`, blank
  when no license). **NOT** MOVE START/END. This is per **REQ-023/DEF-10** (item-7 = PERIOD_TEXT verbatim
  for ALL forms) — build a14 this way from the start; do NOT copy a9's soon-to-be-removed `moveDurationText`.

## Evidence page (items 1–11) + signature + annex
Items **1–11 are the same set** as อ.9 transport (per the official PDF) — reuse the a9 evidence builder logic.
Signature block = 4 slots always (reuse `buildSignatures`). Annex (page 4) from `DTL_SALE_INT`.
**item 12 = blank placeholder** (locked "12. เอกสารขอผู้ซื้อ" header, empty body) — TASK-019 fills it. item 13 shared.

## Verify — DB-free (BE) then real DB (QA)
- BE (`A14PreviewTest` mock): page-1 heading/item-2/item-5 label render; items 1–11 + 4 signature slots
  present; item-12 blank; **no "null"**; `.jasper` regenerated; test-compile + all PreviewTests green.
- QA (real DB, via Porter): `/a14/db/{27300|34380|35966|36711|36741}` (add the a14 db seam like /a9/db) →
  routes to A14, page-1 populated from SALE_INT, items 1–11 + signature; item-12 blank (expected until TASK-019).
  Confirm อ.6/อ.9 routing + output unchanged (resolver regression).

## Definition of Done
- [ ] `checklist/a14` skeleton renders via A14PreviewTest; `.jasper` regenerated.
- [ ] `resolveFromSaleInt` leg routes อ.14 → "A14"; SPECIAL/MOVE/REQUEST_TYPE paths for อ.6/อ.9/others unchanged.
- [ ] Page-1 (heading/item2/item5=BUYER_NAME/1,3,4,6,7) + evidence 1–11 + 4 signatures + annex from SALE_INT/DTL_SALE_INT.
- [ ] item-12 blank placeholder; no "null"; test-compile + PreviewTests green; อ.6/อ.9 untouched.

## Handoff after DoD
Back to **Sober** for review, then QA on the real a14 samples. **TASK-019** (item-12 export) follows.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Implementation Notes — PARTIAL (foundation only; IN_PROGRESS, not for review yet)
Honest status: อ.14 is a **full report-family clone** of อ.9. I laid the low-risk foundation and stopped
before the intricate builder+wiring to avoid rushing it after a long task run. **Codebase compiles**
(`./mvnw -o -DskipTests compile` → BUILD SUCCESS).

**DONE (correct + compiling):**
- `ReportDefinition.A14` (code "A14" + the official ขายส่งออก documentTitle).
- Entities+repos (NULL-safe `@Query`, 11.2-safe): `RequestSaleIntEntity` (id/requestId/**FORM_ID**/
  **BUYER_NAME**/IMPORTER_NAME/status) + `RequestSaleIntRepository.findActive`; `RequestDtlSaleIntEntity`
  (item_no/product_code/product_name/quantity/unit/status) + repo `findActiveOrderByItemNo` + `countActive`.
- jrxml: copied `reports-045/request-a9` → `request-a14`, files renamed a9→a14, internal `request-a9`→
  `request-a14` refs fixed; copied `.jasper` deleted (regen via A14PreviewTest).
- `A14CheckListReportData` model = renamed copy of the A9 record (same shape incl. `item5Label`).

**REMAINING (the substantial part — next):**
1. `A14CheckListReportBuilder` + `A14CheckListPreviewBuilder`: write LEAN (single variant — no destroy/
   transport/MOVE machinery). Page-1: title=`ReportDefinition.A14`, item2=export permitType constant,
   item5Label="5. หน่วยงานผู้ซื้อ/ผู้รับอาวุธ", item5 value=`SALE_INT.BUYER_NAME`, itemCount=`DTL_SALE_INT`
   count, 1/3/6/7 like a9; evidence 1-11 reuse a9 labels + master group **`"ReqSaleInt"`** (graceful);
   4-slot signatures; components from `DTL_SALE_INT`; **item-12 = blank placeholder** ("เอกสารของผู้ซื้อ"
   header, empty); item-13 shared.  ⚠️ do NOT copy a9's transport item-12 / the 5 permit repos.
2. Wiring: `ReportResourceService` a14 `.jasper` paths; `JasperPdfReportService.exportPdfA14`;
   `DocumentController` switch `case "A14"`; `PreviewController` a14/db seam + preview.
3. Resolver: `RequestTypeResolverService.resolveFromSaleInt(requestId)` (SALE_INT FORM_ID 14/16 → "A14"),
   called before the REQUEST_TYPE fallback; do NOT add 14/16 to the SPECIAL switch. Keep a6/a9 routing intact.
4. `A14PreviewTest` (mirror A9PreviewTest) → regen a14 `.jasper`; DB-free verify (heading/item2/item5/
   evidence 1-11/4 sigs/item-12 blank/no "null"); test-compile + all PreviewTests green.

@Sober: TASK-018 is **IN_PROGRESS (foundation compiles)** — not ready for review. I paused before the
builder/wiring/test to do that carefully rather than rush a 15-file clone at the end of a long run. Will
resume on the next nudge. No a6/a9 code touched.

## Questions
- **Q1:** item-5 value = `SALE_INT.BUYER_NAME` (assumption) vs `IMPORTER_NAME`.
  > answer: Use **`BUYER_NAME`** — it's the buyer *organisation* ("หน่วยงานผู้ซื้อ/ผู้รับอาวุธ").
  > `IMPORTER_NAME`/`IMPORTER_*` is the foreign importer address block, which belongs to the export/item-12
  > context, not item 5. Keep the flag; QA confirms on a real sample (27300/34380/…). (Recorded in SPEC-023.)

## Implementation Notes — COMPLETE (foundation done + verified; resuming from partial)
Finished the builder + wiring + test after the earlier foundation pause. **All DoD met, DB-free.**
- **A14CheckListReportBuilder** (LEAN, single variant — no destroy/transport/MOVE): page-1 from
  `T_T_REQUEST_SALE_INT` (item5=BUYER_NAME, item2=export permitType, count=`DTL_SALE_INT`), name/objective/
  lawRefs from the shared tables, item-7 = `T_T_LICENSE.PERIOD_TEXT` verbatim (REQ-005/REQ-023 pattern),
  4-slot signatures (REQ-021), evidence **items 1-11 reuse the a9 labels + master group `"ReqSaleInt"`**
  (graceful), persons NULL-safe (REQ-015), REQ-009 tick, item-13 dynamic (REQ-011), **item-12 = header
  "เอกสารของผู้ซื้อ" + empty body** (TASK-019 fills). Components/annex from `T_T_REQUEST_DTL_SALE_INT`.
- **A14CheckListPreviewBuilder** (mock) + **A14PreviewTest** (compiles a14 jrxml → `.jasper`, renders).
- **Wiring:** `ReportResourceService` a14 paths; `JasperPdfReportService.exportPdfA14`; `DocumentController`
  `case "A14"`; `PreviewController` `/checklist/a14` + `/checklist/a14/db/{id}` seam.
- **Routing:** `RequestTypeResolverService.resolveFromSaleInt` — `T_T_REQUEST_SALE_INT.FORM_ID` 14/16 →
  "A14", called **after** `resolveFromSpecial`, **before** the REQUEST_TYPE fallback; non-14/16 → null
  (falls through). SPECIAL switch + a6/a9/others untouched.

**Verify:** `./mvnw -o -DskipTests=false test-compile` → BUILD SUCCESS; **app boots clean** (SALE_INT/
DTL_SALE_INT entities + repos + A14 builder(11 repos) + preview + resolver + PreviewController all validate);
`A14PreviewTest` + `A9PreviewTest` + `A6PreviewTest` → **Tests run: 3, Failures: 0** (a14 pages=4, a9 4, a6 3).
PyMuPDF on `a14-preview.pdf`: heading = "…ขายหรือจำหน่ายอาวุธ โดยการส่งออกไปนอกราชอาณาจักร"; item-5 label =
"หน่วยงานผู้ซื้อ/ผู้รับอาวุธ"; evidence 1-11 present; **4 signature slots**; item-12 header only; **no "null"**.
a6/a9 report code untouched (scope = 6 wiring files + new a14 package/entities/jrxml/test).
@Sober: TASK-018 foundation ready for review. QA (real DB, dev): `/a14/db/{27300|34380|35966|36711|36741}`
→ routes to A14, page-1 from SALE_INT, items 1-11 + 4 sigs, item-12 blank (until TASK-019); a6/a9 routing
+ output unchanged. Q1 (item-5 = BUYER_NAME vs IMPORTER_NAME) — mapped both; QA confirms on a real sample.

## Review
**Verdict: DONE** (Sober, 2026-08-18). Independently verified — read the resolver + a14 builder, rendered
all 3 previews (no DB):
- **Routing (critical):** `resolveFromSaleInt` (14/16→"A14", else null) called AFTER `resolveFromSpecial`,
  BEFORE the REQUEST_TYPE switch; SPECIAL switch + REQUEST_TYPE unchanged → **a6/a9/others routing intact**. ✅
- **a14 sources:** item-5 = `SALE_INT.BUYER_NAME`; item-7 = `T_T_LICENSE.PERIOD_TEXT` (a6 pattern, REQ-023-
  compliant from the start). ✅
- **a14 preview:** export heading, item-5 label, evidence 1–11, 4 signature slots, item-12 header-only
  (NO destroy/transport leakage — ยุทธภัณฑ์/ส.ค.4 absent), **no "null"**. ✅
- **No a6/a9 regression:** A14+A9+A6 PreviewTests all green (pages 4/4/3); a6/a9 report code untouched.
- Scope clean (new a14 package/entities/jrxml/test + 6 wiring files). Q1 answered (BUYER_NAME).
- Remaining for REQ-022: **TASK-019** (item-12 export content) + Porter's `ReqSaleInt` seed + QA on real a14 samples.
