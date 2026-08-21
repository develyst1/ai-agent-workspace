# SPEC-029: อ.15 checklist report — data-source clone of อ.9 transport (REQ-027)

- Source: REQ-027 (human: *"ขอ a15 ด้วยนะ ลอก transport มาเลย ... ต่างกันแค่ source data"*).
  Porter verified: **form-truth is identical to อ.9 transport** (same headings / 13 evidence items / item-12
  set incl. ส.ค.4·นายกสมาคม·คณะกรรมการ2553·แผนกระสุน / signatures). Reuse the transport implementation; do
  NOT re-derive labels. `A9-form-TRANSPORT-official.pdf` is the reference for both.
- Status: ACTIVE — but **NOT a trivial clone**; 2 items to resolve before tasking (below). Sequence AFTER TASK-025.

## What actually differs (per Porter)
- Header table = **`T_T_REQUEST_SALE_DOM`** (484 rows, **LIVE** — dict's "PAMF-retired" note is wrong; FORM_ID
  + `SALE_DOM_STATUS` present, matching the SPEC-027 header pattern → resolver leg = row-presence + FORM_ID).
- Checklist master = **`ReqSaleDom`** (13 rows, already seeded — do NOT request a seed).
- Own resolver leg (`resolveFromSaleDom` → "A15") + own **`request-a15/`** template folder (clone of the split
  `request-a9-transport/` — that's why REQ-027 sequences after TASK-025).
- Everything request-level is SHARED and works for a15 unchanged (keyed by REQUEST_ID): T_T_REQUEST name/objective,
  LICENSE item-7 PERIOD_TEXT, VW_REQUEST_DTL annex, persons/lawrefs/signatures, BUYER + the 4 permit tables +
  EXAMPLE_SIGN for item-12. **~90% of the transport builder is directly reusable.**

## ⚠️ 2 things to resolve BEFORE Jason starts (Porter asked to be told if it's bigger than a clone — it is)
1. **item-5 source is NOT in `T_T_REQUEST_SALE_DOM`.** a9-transport reads item-5 (หน่วยงานผู้ซื้อ/ผู้รับอาวุธ)
   from `MOVE.AUTHORITY_NAME`. SALE_DOM has **no `AUTHORITY_NAME` and no `BUYER_NAME`** (a14's SALE_INT did have
   BUYER_NAME — SALE_DOM does not). So for a15 the buyer-org value must come from somewhere else — likely
   `T_T_REQUEST_BUYER` (BUYER_NAME / PRIMARY_BUYER_AUTHORITY_ID → T_M_BUYER_AUTHORITY) or it is blank on this
   form. **DATA REQUEST / dict confirm — do NOT guess** (a14's BUYER_NAME assumption already needs QA confirm;
   inventing again risks a wrong field, per the DEF-11 lesson). Also confirm **item-2** text: a9-transport
   derives it from `MOVE_REQUEST_TYPE`; SALE_DOM has no such column → a15's item-2 is almost certainly a
   **fixed constant** (like a14's export permitType) — confirm the exact wording from the form.
2. **The shared base is MOVE-typed.** `A9CheckListReportBuilderBase` fetches a `RequestMoveEntity` and passes
   it to every hook (`item5Value(move)`, `buildItem12(…, move, …)`). a15 has no MOVE row → it **cannot extend
   the base as-is.** Two options (SA to pick when tasking):
   - **(a)** Generalise the base so the header entity is abstract (hook `headerFor(requestId)` returns a small
     variant-owned struct; item5Value/buildItem12 take that, not `RequestMoveEntity`). Cleanest long-term;
     a15/a9-transport/a9-destroy all become header-agnostic. Small refactor of DELIVERED a9 → **output must not
     change** (byte-identical, like TASK-024).
   - **(b)** a15 gets its own lean builder (a14 shape) reusing shared logic via a common helper component
     (extract the request-level helpers out of the a9 base into a shared `@Component`). Avoids touching the a9
     base but risks re-duplicating the shared logic REQ-026 just consolidated.
   Recommend **(a)** — it keeps the "shared logic in one place" property REQ-026/SPEC-027 fought for.

## Plan (once #1/#2 resolved + TASK-025 done)
- ReportDefinition `A15` (documentTitle = same transport heading, per Porter's form-identical finding);
  `request-a15/` = clone of `request-a9-transport/`; `ReportResourceService` a15 paths;
  `JasperPdfReportService.exportPdfA15`; `DocumentController` case "A15"; `PreviewController` /a15/db seam.
- `resolveFromSaleDom(requestId)` → SALE_DOM row present → "A15" (row-presence + FORM_ID; no status filter —
  header table, SPEC-027 rule). Add after resolveFromMove; don't touch a6/a9/a14/legacy legs.
- A15 builder = transport logic with the header from SALE_DOM + item-5 (source per #1) + item-2 (const per #1)
  + group `ReqSaleDom`; item-12 = the transport set (BUYER/permits/person2, unchanged); annex VW_REQUEST_DTL.
- Verify: A15PreviewTest content-equivalent to the transport form (text-equivalence, not md5); QA real a15 on a
  live SALE_DOM request.

## Resolution (2026-08-20 — human said proceed; Porter answered; I verified the code)
**#1 item-5 — RESOLVED, no human DATA REQUEST (Porter's conclusion right; his mechanism corrected).**
I verified against the a9-transport builder as Porter asked: `A9TransportReportBuilder.item5Value(move)` =
`move.getAuthorityName()` → today item-5 reads from **`T_T_REQUEST_MOVE.AUTHORITY_NAME`** (header), **not**
from `VW_REQUEST_DTL` (and `RequestDtlViewEntity` does not currently map AUTHORITY_NAME). So a15 does NOT
inherit it unchanged. **However** the `VW_REQUEST_DTL` SQL (REQ-025 filed def) DOES expose
`DTL.AUTHORITY_NAME / AUTHORITY_NAME_ABBR / BUYER_AUTHORITY_ID` — the column exists, just isn't mapped. ⇒
**a15 reads item-5 from the view:** add `AUTHORITY_NAME` to `RequestDtlViewEntity`; a15's `item5Value` takes
the first detail row's `AUTHORITY_NAME` (blank when none). No column invented, no human ask. QA confirms on a
real a15 that this equals the buyer-org value (and, for a9-transport, that `DTL.AUTHORITY_NAME` matches
`MOVE.AUTHORITY_NAME` — **do NOT switch a9-transport's source; leave it on MOVE to stay byte-identical**).
**item-2** = fixed constant, verbatim from the shared official form (Porter confirmed) — a15 hook returns it.

**#2 base decision — RESOLVED (TASK-025 done; keep shared logic in one place per REQ-026).**
Generalise the a9 base minimally so a15 fits without duplication and a9 stays byte-identical:
- a15 **extends `A9CheckListReportBuilderBase`**. a15 requests have no MOVE row → `findByRequestId` returns
  null → `move` = null flows to the hooks; a15's overrides ignore it (item-5 from the view; item-12 = the
  transport set, which uses BUYER/permits/person2, not move). ✅ no base change needed there.
- **Extract item-2 into a hook.** Base L76 hardcodes `moveRequestTypeLabel(move)`; make it an abstract
  `permitTypeLabel(move)` — a9-destroy/a9-transport return `moveRequestTypeLabel(move)` (byte-identical),
  a15 returns its fixed constant. Small, output-preserving refactor of the delivered base (verify a9 unchanged).

**Routing / FORM_ID=0 — design call (Porter asked me to choose): ROW-PRESENCE matching.**
`resolveFromSaleDom(requestId)` = SALE_DOM row present → "A15" (no FORM_ID equality check → the stray
`FORM_ID=0` row still resolves to A15 and renders, degrading gracefully, instead of a throwing fallback).
No status filter — SALE_DOM is a header table with `SALE_DOM_STATUS`, never plain `STATUS` (DEF-11 rule).
Add the leg after `resolveFromMove`; don't touch a6/a9/a14/legacy.

## Tasks
- TASK-026 (UNBLOCKED): a15 clone — item-5 from view AUTHORITY_NAME, item-2 hook const, `resolveFromSaleDom`
  row-presence, `ReqSaleDom` group, clone `request-a9-transport/` → `request-a15/`, base item-2 hook extraction.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
