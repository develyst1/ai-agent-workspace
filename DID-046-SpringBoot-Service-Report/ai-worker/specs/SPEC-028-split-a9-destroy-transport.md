# SPEC-028: Split อ.9 into two independent reports (destroy / transport) — REQ-026

- Source: REQ-026 (human: *"a9 destroy กับ a9 move ... อยากให้แยกกัน ... เผื่อมีการแก้ไข มันแก้ยากกว่าหากรวมกันไว้"*).
  MEDIUM. Restructure only — **output must not change**.
- Status: ACTIVE (surveyed; size verdict below)

## Size verdict (Porter asked for this before Jason starts)
**Not materially bigger than it looks — and one item on your split list should NOT be split.** The survey
found the a9 **templates are already variant-agnostic**: `grep กำจัด|ทำลาย|สถานที่ทำการ` over
`reports-045/request-a9/*.jrxml` = **0 hits**. Every variant difference is data-driven (heading =
`$F{documentTitle}`, item-5 label = `$F{item5Label}`, item-12 title+subs built in the builder, page-2
heading/annex identical by design). ⇒ **The whole split surface is the builder + wiring; the templates stay
SHARED (one `request-a9` jrxml set for both reports).** Forking the templates would duplicate ~5 jrxml for
zero benefit — the opposite of REQ-026's intent. Proceed; this is a clean MEDIUM.

## The shared / split line (defended — this is REQ-026's real deliverable)
Porter's warning is right: duplicating the shared parts re-creates the REQ-023 item-7 pain (each report
re-derived the rule → had to be fixed report-by-report). So the shared logic lives in **exactly one place**.

**SPLIT (differs by form → per-variant):**
- documentTitle (heading), item-2 permitType text is data (`moveRequestTypeLabel`) — but the **item-5 label**
  (`สถานที่ทำการกำจัดหรือทำลาย` vs `หน่วยงานผู้ซื้อ/ผู้รับอาวุธ`) + **item-5 value** (`DEST_PLACE_NAME` vs
  `AUTHORITY_NAME`), the **item-12 title + sub-item set/order** (destroy 9-subs vs transport export set),
  the **master GROUP_CODE** (`ReqMoveDestroyer` vs `ReqMove`).
- The current `boolean destroy` branches at `A9CheckListReportBuilder` L84-88/111/205-224 = the whole split surface.

**KEEP SHARED (identical by form → one implementation, no duplication):**
- persons items 3/4, law refs, signature block (4 slots), annex (`VW_REQUEST_DTL`), **item-7 `PERIOD_TEXT`**,
  the tick rule, blank-when-null, evidence items 1–11, `buildPerson2`, the permit/BUYER helpers, the
  `EvidenceItem/EvidenceSub/ComponentItem` plumbing, `moveRequestTypeLabel`, applicant name/count/objective.
- **The templates** (`request-a9` jrxml/jasper) — shared, NOT split (variant-agnostic; see verdict).

## Architecture (a14 single-variant shape, no duplication)
1. **Shared base** — an abstract `A9CheckListReportBuilderBase` (or a shared `@Component` helper) holding all
   the KEEP-SHARED logic + the injected repos, exposing the record assembly. Variant hooks (abstract):
   `documentTitle()`, `item5Label()`, `item5Value(move)`, `checklistGroup()`, `buildItem12(...)`.
2. **Two thin builders** — `A9DestroyReportBuilder` + `A9TransportReportBuilder`, each overriding only the
   ~5 hooks. **No `boolean destroy` flag anywhere** (Porter constraint #2 — the variant is the *class*, not a flag).
3. **Two report codes** — `ReportDefinition` `A9D` (destroy) + `A9T` (transport), each with its documentTitle.
   Both map to the **same** `request-a9` `.jasper` resources (shared templates) via `ReportResourceService`;
   `JasperPdfReportService.exportPdfA9Destroy/Transport`; `DocumentController` two cases.
4. **Routing — in `resolveFromMove`** (constraint #2): `MOVE_REQUEST_TYPE == 2 → "A9D"`, else `→ "A9T"`
   (resolves to one of two reports; no variant flag handed downstream). Do NOT touch the อ.6/อ.14/legacy legs.
5. Retire the single `A9CheckListReportBuilder` variant flag once the two builders replace it (+ its
   preview: an `A9DestroyPreviewTest`/`A9TransportPreviewTest`, or one test rendering both).

## Constraint — OUTPUT MUST NOT CHANGE (the real hazard)
This is a pure restructure. Both PDFs must render **byte-identical** to today.
- BE (DB-free): render destroy + transport previews **before** and **after**; diff the extracted text (and
  page count) — must be identical (heading, item-5, item-12 set, 4 sigs, annex, no "null"). a6/a14 previews
  untouched. test-compile + all PreviewTests green; `.jasper` unchanged (templates not touched).
- QA (real DB): transport is DELIVERED+verified → re-render a real transport (38336/37956) and a destroy
  sample → identical to pre-split; both route correctly via `resolveFromMove` (`/download` + `/a9/db` seam).

## Not in scope
No behaviour/label/source change to any form — if a variant's output would change, that's a bug, not the split.
อ.6/อ.14 untouched. The 3 NEW a14 ticks + `ReqSaleInt` seed (REQ-022) are unrelated.

## Addendum (2026-08-18) — templates DO split, per-form (Porter's direction; my earlier "shared" call reversed)
I first ruled templates STAY SHARED (variant-agnostic → forking = duplication). **Porter overrode it, and
he's right:** every other form owns its own template set — a9 is the *only* form sharing one folder for two
reports, purely a leftover of being built as one form. Keeping it shared undermines REQ-026's whole goal
(independence for *future divergence*): the next edit to the destroy template would silently ride on
transport. The "duplication I avoided" is exactly the point — each report owns its template so they can
diverge freely. **Accepted.** ⇒ split the resources into `request-a9-destroy/` + `request-a9-transport/`
(mirroring a6/a14), **resource files only — do NOT touch the shared Java base** (the base stays; only
`ReportResourceService` repoints A9D→destroy folder, A9T→transport folder). = TASK-025.

## Tasks
- TASK-024: shared base + two builders + two ReportDefinition codes + resolveFromMove split + wiring. **DONE.**
- TASK-025: split the a9 template folder per-form (resource-only; byte-identical via text-equivalence, not md5).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
