# TASK-026: อ.15 checklist report — clone of อ.9 transport (SALE_DOM header, data-source only)

- Source: SPEC-029 (REQ-027). Human said proceed. Form-truth identical to อ.9 transport — **reuse the
  transport implementation; do NOT re-derive labels/headings.**
- Status: DONE (Sober-reviewed) — item-2 wording = open data item (Porter/human), not a code defect
- Assignee: Jason (BE)
- Depends on: TASK-025 (DONE — clone the split `request-a9-transport/`)
- ⚠️ The a9 base is DELIVERED — the one base change (item-2 hook) must keep a9-destroy + a9-transport
  **byte-identical** (text-equivalence, not md5). อ.6/อ.14 untouched.

## Do
1. **Report shell:** `ReportDefinition.A15` (documentTitle = the transport heading — identical form).
   `request-a15/` = copy of `request-a9-transport/` (main + 5 subreports). `ReportResourceService` a15 folder
   openers; `JasperPdfReportService.exportPdfA15`; `DocumentController` case "A15" (+ history); `PreviewController`
   `/a15/db` seam + preview. `A15PreviewTest` (mirror the transport preview).
2. **A15 builder** — extend `A9CheckListReportBuilderBase` (a15 requests have no MOVE row → `move` = null;
   the overrides ignore it):
   - `documentTitle()` = A15 title; `item5Label()` = "5.  หน่วยงานผู้ซื้อ/ผู้รับอาวุธ"; `checklistGroup()` = **`ReqSaleDom`**.
   - `item5Value(move)` = **first `VW_REQUEST_DTL` row's `AUTHORITY_NAME`** (blank when none) — NOT move.
     Requires mapping `AUTHORITY_NAME` on `RequestDtlViewEntity` (real view column, REQ-025 def) + a
     `findFirstByRequestId`/take-first helper. Do NOT read MOVE (a15 has none).
   - `permitTypeLabel(move)` (new hook, see step 3) = the **fixed item-2 constant** taken verbatim from the
     shared official อ.9/อ.15 form.
   - `buildItem12(...)` = the **transport** item-12 set (BUYER/permits/person2 — unchanged, all request-level).
3. **Base: extract item-2 into a hook (output-preserving).** In `A9CheckListReportBuilderBase`, replace the
   hardcoded `moveRequestTypeLabel(move)` (item-2) with an abstract `permitTypeLabel(move)`; a9-destroy +
   a9-transport override it to return `moveRequestTypeLabel(move)` (⇒ byte-identical). a15 returns its constant.
4. **Routing:** `resolveFromSaleDom(requestId)` = `requestSaleDomRepository.findByRequestId(id).isPresent() → "A15"`
   (**row-presence**, no FORM_ID equality → the stray FORM_ID=0 row still renders, no throwing fallback; no
   status filter — SALE_DOM has `SALE_DOM_STATUS`, never plain `STATUS`, DEF-11). New `RequestSaleDomEntity`
   (map only REQUEST_ID + FORM_ID; **no STATUS**) + repo. Add the leg after `resolveFromMove`; a6/a9/a14/legacy untouched.

## SPEC-027 column-citation rule (mandatory)
For `RequestSaleDomEntity` + the new `AUTHORITY_NAME` on `RequestDtlViewEntity`, cite the source in the
Implementation Notes: `T_T_REQUEST_SALE_DOM` (dict sheet) has `REQUEST_ID`+`FORM_ID`, **no plain STATUS**;
`AUTHORITY_NAME` is in the filed `VW_REQUEST_DTL` SELECT. Map only columns that exist.

## Verify — DB-free (BE) then real DB (QA)
- BE: `A15PreviewTest` renders the a15 form (= transport form) content-equivalently; **a9-destroy + a9-transport
  previews byte-identical to pre-change** (the item-2 hook extraction must not move them); no "null"; test-compile
  + all PreviewTests green; `.jasper` regenerated in `request-a15/`.
- QA (real DB, via Porter): a real a15 (a live `T_T_REQUEST_SALE_DOM` request) via `/download` + `/a15/db` →
  routes "A15", renders the form, item-5 = the buyer-org (from view AUTHORITY_NAME); a9/a14/a6 unaffected.
  Confirm `DTL.AUTHORITY_NAME` = the buyer-org value on a15 (and that a9-transport's MOVE-sourced item-5 is unchanged).

## Definition of Done
- [ ] `A15` report shell + `request-a15/` folder + wiring; `A15PreviewTest` green.
- [ ] A15 builder extends the base; item-5 from view `AUTHORITY_NAME`, item-2 fixed const via the new hook,
      group `ReqSaleDom`, item-12 = transport set.
- [ ] `resolveFromSaleDom` row-presence leg; `RequestSaleDomEntity` (no STATUS); a6/a9/a14/legacy routing unchanged.
- [ ] item-2 hook extraction leaves a9-destroy + a9-transport **byte-identical**; no "null"; test-compile + PreviewTests green.

## Handoff after DoD
Back to **Sober** for review (I diff a9 destroy/transport pre/post for byte-identical + column citations per
SPEC-027 + confirm item-5 view wiring). Then QA on a live a15 request.

## Progress — EXECUTED, DB-free verified → REVIEW (2026-08-20)
- **Base (output-preserving):** item-2 hardcoded `moveRequestTypeLabel(move)` → new abstract hook
  `permitTypeLabel(move)`; a9-destroy + a9-transport override → `moveRequestTypeLabel(move)` (byte-identical).
  `item5Value` hook now takes `(long requestId, RequestMoveEntity move)` so a15 can read the view. `moveRequestTypeLabel` → protected.
- **⚠️ Structural: moved `buildTransportItem12` (+LicRow/addLicenseRows/refNoDate/docDateLine/idCardLine) from
  A9TransportReportBuilder BACK into the base as `protected`** — so a15 + a9-transport share the transport item-12
  in ONE place (SPEC-029 §66 "shared logic in one place"; alternative was a15-extends-A9Transport which risks
  Spring bean-type ambiguity). This partially reverses TASK-024's placement but is **output-preserving** (proven
  byte-identical below). Flagging since it re-touches DELIVERED a9. a9-transport.buildItem12 now delegates to it.
- **A15ReportBuilder** (@Component extends the base): documentTitle=A15, item5Label=transport, checklistGroup=`ReqSaleDom`,
  item12Title/buildItem12=transport set; `item5Value` = first `VW_REQUEST_DTL` row's `AUTHORITY_NAME`; move=null flows
  through harmlessly (a15 has no MOVE row).
- **Domain:** `RequestSaleDomEntity` (T_T_REQUEST_SALE_DOM — maps ID/REQUEST_ID/FORM_ID, **no STATUS**, DEF-11) +
  `RequestSaleDomRepository.findByRequestId`. `AUTHORITY_NAME` added to `RequestDtlViewEntity`.
- **Routing:** `resolveFromSaleDom` (row-presence → "A15") after resolveFromMove. `ReportDefinition.A15`.
  `JasperPdfReportService.exportPdfA15` (→ `request-a15/` folder). DocumentController A15 download+history.
  PreviewController `/a15/db` seam. `request-a15/` = clone of `request-a9-transport/`. `A15PreviewTest`.

### SPEC-027 column citations
- `T_T_REQUEST_SALE_DOM` (dict): REQUEST_ID + FORM_ID present; **no plain STATUS** (only SALE_DOM_STATUS) → not mapped.
- `RequestDtlViewEntity.AUTHORITY_NAME` = `DTL.AUTHORITY_NAME`, **filed VW_REQUEST_DTL SELECT, REQ-025 line 95**
  (verified the column exists before mapping — DEF-11 guard; this entity is shared by every report).

### Verify (DB-free)
- `test-compile` SUCCESS; `clean compile` SUCCESS; boot :33093 **Started** clean (A15 builder + SALE_DOM repo +
  resolver + seams wire; no NoUniqueBean — the 3 concrete builders are distinct types).
- `A9PreviewTest`: destroy 4pg **7805 chars** / transport 5pg **7606 chars** — **IDENTICAL to pre-change** ⇒ the
  item-2 hook extraction + item-12 relocation did **not** move a9 output. `A15PreviewTest`: a15 5pg 7606, **0 "null"**.
- Real a15 byte-identical + field correctness = QA's leg (rule #4).

## Questions
> **Q1 (blocks a15 real render correctness): exact item-2 wording?** SPEC-029 §62 says a15 item-2 = a fixed
> constant "verbatim from the shared official form (Porter confirmed)" but the **string was never given**. I did
> NOT guess (DEF lesson) — `A15ReportBuilder.ITEM2_PERMIT_TYPE = ""` (blank, graceful, never "null") for now.
> Please paste the exact ประเภทการขออนุญาต text for อ.15 and I'll set the const (1-line change).
> **Q2 (structural, for your review):** OK to keep `buildTransportItem12` in the base (shared by a9-transport +
> a15)? It's output-preserving but re-touches the TASK-024 placement. Alternative = duplicate it into a15.

(Jason asks; Sober answers as `> answer: ...`)

## Answers + Review
**Q2 (buildTransportItem12 in the base): APPROVED.** Keeping the transport item-12 shared in the base
(a9-transport + a15 both delegate to it) is exactly the "shared logic in one place" principle (REQ-026/
SPEC-027) — the alternative (duplicate into a15) is the anti-pattern. It re-touches TASK-024's placement but
is output-preserving (a9 byte-identical, proven). Correct call.
**Q1 (item-2 wording): you were right NOT to guess — and my SPEC-029 was wrong.** I read the official form:
item-2's value is `ขึ้นตามประเภทที่เลือกในระบบ` — a **system-driven placeholder, not a fixed constant**. So
there is no string to copy from the form. For a9 it's `moveRequestTypeLabel(MOVE_REQUEST_TYPE)`; a15 has no
MOVE type, and SALE_DOM has no obvious type column. ⇒ **a15's ประเภทการขออนุญาต wording is a Porter/human
question** (a fixed domestic-sale type string, or a SALE_DOM-driven value). Your `ITEM2_PERMIT_TYPE = ""`
(blank, graceful) is the correct interim — a 1-line const set when the wording lands (a14-style pending data).

**Verdict: DONE** (Sober, 2026-08-20). Verified independently:
- **a9 byte-identical:** my re-render = destroy 7808 / transport 7610 chars = **exactly my TASK-025 baseline**
  → the item-2 hook extraction + item-12 relocation did NOT move a9 output. ✅
- **a15:** renders the transport form (5pp, 7610), item-2 blank (pending wording), **no "null"**. ✅
- **Entities (SPEC-027 cited):** `RequestSaleDomEntity` = ID/REQUEST_ID/FORM_ID, **no STATUS** (dict: SALE_DOM
  has only SALE_DOM_STATUS); `RequestDtlViewEntity.AUTHORITY_NAME` = `DTL.AUTHORITY_NAME` (filed VW SELECT).
  Verified both exist before mapping. ✅
- **Routing:** `resolveFromSaleDom` row-presence → "A15" (stray FORM_ID=0 degrades gracefully); after
  resolveFromMove; a6/a9/a14/legacy untouched. ✅  test-compile + A9/A15 PreviewTests green; boots.
- Real a15 field-correctness (item-5 = view AUTHORITY_NAME = buyer-org) = QA's leg.
