# TASK-015: อ.9 TRANSPORT variant — FOUNDATION (scaffold: branch + item5 + heading + master). NOT item-12 content.

- Source: SPEC-022 (REQ-019 step 2). Porter approved building the foundation now; item-12 transport
  content = TASK-016 (blocked on a DATA REQUEST) — **do not build item-12 here.**
- Status: DONE (Sober-reviewed, both previews independently verified)
- Assignee: Jason (BE)
- Depends on: none
- ⚠️ **Destroy must stay byte-identical** (REQ-020 is done + real-DB verified). This task only ADDS the
  transport branch; the destroy path must not change.

## Variant flag (one place, reused)
In `A9CheckListReportBuilder` compute once from the MOVE row:
`boolean destroy = move != null && move.getMoveRequestType() != null && move.getMoveRequestType() == 2;`
→ `2 = destroy` (existing behaviour); **null / any other value = transport**. (Porter's REQ-019 rule.)

## Change 1 — map AUTHORITY_NAME
`domain/entity/RequestMoveEntity.java`: add `@Column(name = "AUTHORITY_NAME") private String authorityName;`
(alongside `destPlaceName`). No other entity change.

## Change 2 — heading per variant (page-1)
`request-a9-main.jrxml:35` is already `$F{documentTitle}` — no template change. In the builder, feed:
- destroy → `หลักฐานที่ใช้ประกอบคำขอรับหนังสืออนุญาตขนย้ายอาวุธ` (current `ReportDefinition.A9` — keep sourcing it from there).
- transport → `หลักฐานที่ใช้ประกอบคำขอรับหนังสืออนุญาตขายและขนย้ายอาวุธ` (builder constant).
Both keep report code `"A9"` — do NOT add a ReportDefinition/resolver entry (variant is builder-only).

## Change 3 — item-5 label becomes data-driven (the ONE static template diff)
`request-a9-main.jrxml:77` is a static `<element kind="staticText"> … <text>5.  สถานที่ทำการกำจัดหรือทำลาย</text>`.
- Replace it with a `textField` at the **same x/y/width/height/font/align** whose expression is
  `$F{item5Label}` (keep geometry identical — reuse destroy layout).
- Add `item5Label` to the page-1 data (`A9CheckListReportData` — next to `documentTitle`) + its JSON
  field mapping in the jrxml (`net.sf.jasperreports.json.field.expression` = `item5Label`).
- Builder feeds: destroy → `"5.  สถานที่ทำการกำจัดหรือทำลาย"`; transport → `"5.  หน่วยงานผู้ซื้อ/ผู้รับอาวุธ"`.
  (Match the existing "5.  " spacing/indent of the old static text exactly.)

## Change 4 — item-5 value per variant
The Applicant `destroyLocation` slot (builder ~L77): `destroy ? nz(move.getDestPlaceName()) : nz(move.getAuthorityName())`.
> **ASSUMPTION (PM decision, not data-proven):** transport item-5 = `AUTHORITY_NAME` (buyer org). On the
> current samples AUTHORITY_NAME == DEST_PLACE_NAME so output is identical; this keeps the form correct if
> they ever diverge. Human may overrule.

## Change 5 — checklist master per variant
`A9…Builder.java:34,133`: the tick master group is the constant `CHECKLIST_GROUP = "ReqMoveDestroyer"`.
Make it variant-driven: `String checklistGroup = destroy ? "ReqMoveDestroyer" : "ReqMove";` and pass that
to `findByGroupCodeAndIsActiveOrderBySequenceAsc(...)`. (`ReqMove` = 15 seeded rows; graceful if unbound.)

## Change 6 — item 12: transport = BLANK body (placeholder), NOT destroy's sub-items
In `buildEvidences`, gate the existing destroy item-12 sub-items (the 9 `employer(...)` lines + destroy
person2 wiring) behind `if (destroy)`. For transport, render item 12 as its **locked header only with an
empty sub-list** (blank body) — do NOT emit destroy's content. TASK-016 fills the real transport item-12.
Everything else in `buildEvidences` (items 1-11, 13) is shared and unchanged.

## Verify — DB-free (BE), then real DB (QA)
### BE (A9PreviewTest, no DB):
- Add a **transport** mock case (`moveRequestType` = e.g. 0/null, `authorityName` set) alongside the
  existing destroy mock → confirm in the preview: heading = "…**ขายและขนย้าย**อาวุธ"; item-5 label =
  "5.  หน่วยงานผู้ซื้อ/ผู้รับอาวุธ" + value from `authorityName`; item-12 body **blank**; no "null".
- **Destroy regression:** existing destroy mock preview **unchanged** (heading, item-5 label/value,
  item-12 nine sub-items, ticks). `A9PreviewTest` green; regenerate `.jasper` via the PreviewTest (DEF-7 lesson).
- `./mvnw -o -DskipTests=false test-compile` green.

### QA (real DB, via Porter — transport has real complete data):
- `/a9/db/38336` (+ 33630 / 38321 / 38234): page-1 heading "ขายและขนย้าย"; item-5 = buyer-org label +
  value; ticks bind to `ReqMove`; item-12 blank (expected until TASK-016). A real destroy request →
  unchanged (heading "ขนย้าย", item-12 nine subs).

## Definition of Done
- [ ] `AUTHORITY_NAME` mapped; variant flag computed once (2=destroy, else transport).
- [ ] Heading, item-5 label (`$F{item5Label}`, geometry unchanged), item-5 value, checklist master all
      switch by variant; destroy strings/sources untouched.
- [ ] Transport item-12 renders blank body (locked header), NOT destroy content; items 1-11/13 shared.
- [ ] BE: transport mock preview correct (heading/item5/blank item-12/no "null"); destroy mock **byte-identical**;
      `.jasper` regenerated; test-compile + A9PreviewTest green.
- [ ] No ReportDefinition/resolver change; destroy path unchanged.

## Handoff after DoD
Back to **Sober** for review, then QA (via Porter) on the real transport samples. **TASK-016** (transport
item-12 content) proceeds separately once the DATA REQUEST for the "ที่ ___ ลง ___" doc-number source lands.

## Implementation Notes
Transport branch ADDED; destroy path unchanged. **Files:** RequestMoveEntity, A9CheckListReportData,
A9CheckListReportBuilder, A9CheckListPreviewBuilder, request-a9-main.jrxml, A9PreviewTest (+ regen .jasper).
- **Variant flag** (once, in `buildFromDb`): `boolean destroy = move != null && move.getMoveRequestType()
  != null && move.getMoveRequestType() == 2;` → 2=destroy, null/other=transport.
- **C1 AUTHORITY_NAME:** mapped in `RequestMoveEntity` (`@Column("AUTHORITY_NAME") authorityName`).
- **C2 heading:** builder feeds `documentTitle` = destroy → `ReportDefinition.A9` ("…ขนย้ายอาวุธ") ;
  transport → constant "…ขายและขนย้ายอาวุธ". No ReportDefinition/resolver change; code stays "A9". jrxml
  heading already `$F{documentTitle}` (untouched).
- **C3 item-5 label data-driven:** `request-a9-main.jrxml` item-5 static→`textField $F{item5Label}` (same
  x/y/w/h/font/align, +blankWhenNull); added `item5Label` field decl + the `item5Label` component to
  `A9CheckListReportData` (2nd, next to documentTitle). Builder feeds destroy "5.  สถานที่ทำการกำจัดหรือทำลาย"
  / transport "5.  หน่วยงานผู้ซื้อ/ผู้รับอาวุธ".
- **C4 item-5 value:** `destroy ? DEST_PLACE_NAME : AUTHORITY_NAME` (transport = PM assumption; flagged).
- **C5 master per variant:** `checklistGroup = destroy ? "ReqMoveDestroyer" : "ReqMove"` passed to
  `buildEvidences(...)` → `findByGroupCodeAndIsActiveOrderBySequenceAsc(checklistGroup, ...)`.
- **C6 item-12:** destroy = existing 9 sub-items + person2 (gated `if (destroy)`); transport = locked
  header only (see Q1) + **empty** sub-list. Items 1-11/13 shared/unchanged.

**Verify (DB-free):** `.jasper` regenerated via A9PreviewTest (+A6PreviewTest); `test-compile` → BUILD
SUCCESS; both PreviewTests → Tests run: 2, Failures: 0 (a9 pages=4, a6 pages=3). Added a **transport
preview** (`createTransportPreviewData()` + `target/a9-transport-preview.pdf`) alongside the destroy one:
- **TRANSPORT** (PyMuPDF): page-1 heading = "…**ขายและขนย้าย**อาวุธ"; item-5 label = "หน่วยงานผู้ซื้อ/ผู้รับอาวุธ"
  + value from authorityName; item-12 = header "เอกสารของผู้ซื้อ" with **destroy 9-subs absent**; no "null". ✅
- **DESTROY (no regression):** page-1 heading = "…ขนย้ายอาวุธ"; item-5 = "สถานที่ทำการกำจัดหรือทำลาย";
  item-12 nine subs present; no "null" — content matches pre-change destroy. ✅ (page-2 static
  "…ขายและขนย้ายอาวุธ" is DEF-6 by-design, unchanged in both.)
No ReportDefinition/resolver change; destroy strings/sources untouched.

## Questions
- **Q1 (transport item-12 header text):** I used **"เอกสารของผู้ซื้อ"** as the locked header placeholder.
  > answer: Correct — "เอกสารของผู้ซื้อ" **is** the official transport item-12 header (Porter's pasted
  > form text), not just a placeholder. Keep it. TASK-016 adds the sub-items under it; the header stays.
- **Q2 (item-5 value = AUTHORITY_NAME):** implemented the PM assumption; flagged as not data-proven.
  > answer: Right call — it's Porter's semantic decision, recorded in SPEC-022 assumptions. QA confirms on
  > 38336 (where AUTHORITY_NAME==DEST_PLACE_NAME today). No change needed; leave the flag standing.

## Review
**Verdict: DONE** (Sober, 2026-08-18). Independently verified — re-read entity/model/builder/jrxml and
rendered **both** previews from mock (A9PreviewTest, no DB):
- **Variant scaffold:** `AUTHORITY_NAME` mapped; `destroy = moveRequestType==2` (else transport) computed
  once; per-variant title/`item5Label`/value/`checklistGroup`; item-12 gated `if (destroy)`; item-5 now
  `$F{item5Label}` textField (static text removed), model gained `item5Label`. ✅
- **TRANSPORT preview:** heading "…**ขายและขนย้าย**อาวุธ"; item-5 = "หน่วยงานผู้ซื้อ/ผู้รับอาวุธ" + value
  from `authorityName`; destroy 9-subs **absent** (blank item-12 body, per design); no "null". ✅
- **DESTROY preview (no regression):** heading "…ขนย้ายอาวุธ"; item-5 = "สถานที่ทำการกำจัดหรือทำลาย";
  9 sub-items present (incl. ผู้เชี่ยวชาญ); no "null" — matches pre-change destroy. ✅
- No ReportDefinition/resolver change; `.jasper` regenerated; test-compile + A9PreviewTest green (pages=4).
- Follow-up unchanged: **TASK-016** fills the transport item-12 sub-items (BLOCKED on the doc-number DATA REQUEST).
