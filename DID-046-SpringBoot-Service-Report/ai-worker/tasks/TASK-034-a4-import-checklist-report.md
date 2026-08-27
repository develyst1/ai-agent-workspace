# TASK-034: Build the อ.4 checklist report (REQ-029 / SPEC-034)

- Source: SPEC-034 (REQ-029). Assignee: Jason (BE).
- **BLOCKED** until REQ-031's QA leg closes (Porter's sequencing — don't build อ.4 templates mid-change to the
  jasper build pipeline). Start only after REQ-031 QA smoke passes.

## Do (see SPEC-034 for the full mapping)
1. New standalone builder `A4CheckListReportBuilder` (+ `A4CheckListPreviewBuilder`), model `A4CheckListReportData`,
   template folder `request-a4` (main + lawRef/signature/evidence/evidenceSub/component). Model on **a14**, not a9-base.
2. Page 1: 7 items — item-2 fixed constant `สั่งหรือนำเข้ามาในราชอาณาจักร`; **ระยะเวลา at item 6** = `T_T_LICENSE.PERIOD_TEXT`
   (REQ-023); item-1=`T_T_REQUEST.TRADER_NAME`; item-5 วัตถุประสงค์=`T_T_REQUEST.OBJECTIVE`; NO buyer item. Law-refs from data.
3. 17 evidence items, TICK RULE via `ChecklistCodeBinder`, group `ReqImport` (codes in SPEC-034; bind the 4 IS_ACTIVE=0
   rows too). Persons 3/4 from `T_T_REQUEST_PER`. Item-6 = §4 own-table from `T_T_REQUEST_DTL_REF_IMPORT` by REQUEST_ID
   (a9 `LicRow` pattern; tick by `ATTACH_FILE_ID`). 5(4)/17 no master → untick. หมายเหตุ footnote + 4 signature slots.
4. Annex: `VW_REQUEST_DTL` base cols + 3 อ.8 cols from `T_T_REQUEST_DTL_REF_IMPORT` joined by `REQUEST_DTL_ID`
   (firstOrNull per item). **State whether VW_REQUEST_DTL exposes the item DTL id or you read `T_T_REQUEST_DTL`.**
5. Wire: `ReportDefinition.A4`, `ReportResourceService.openRequestA4*`, `JasperPdfReportService.exportPdfA4`,
   `DocumentController` case `"A4"` (download + history). Resolver already maps `REQUEST_TYPE=4→"A4"` (REQ-028) — no change.
6. SPEC-027 guard: any new @Entity/@Column (e.g. `RequestImportEntity`, `RequestDtlRefImportEntity`) must cite the
   dict sheet per column (T_T_REQUEST_IMPORT / T_T_REQUEST_DTL_REF_IMPORT verified in SPEC-034). No FETCH FIRST (11.2).

## Verify — BE then QA
- BE: test-compile + a new `A4PreviewTest` (compile jrxml→jasper + mock render) green; boots; อ.6/อ.9/อ.14/อ.15
  PreviewTests unchanged; SPEC-027 column citations. Confirm `T_T_REQUEST.OBJECTIVE` + the annex join key explicitly.
- QA (real DB, once a REQUEST_TYPE=4 request exists): renders, matches the official PDF (7 items, ระยะเวลา at 6,
  17 evidence, item-14 not truncated, footnote, annex 3 cols, 4 signatures); ticks land by code + item-6 own-table.

## Handoff
Back to **Sober** (review: item indexing 6-not-7, §4 item-6, annex join/cardinality decision, no template drift on
the other 4 forms). Then QA.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
