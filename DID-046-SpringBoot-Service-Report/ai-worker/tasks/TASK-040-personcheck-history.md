# TASK-040: personCheck HISTORY builder — render the stored snapshot (REQ-032 Addendum 2 / SPEC-036)

- Source: SPEC-036. Assignee: Jason (BE). Reuses `PersonCheckReportData` + the 6 templates + `exportPdfPersonCheck`.
- **Clone `A1CheckListHistoryReportBuilder`** (same snapshot family). Render VERBATIM — no recompute from live tables.

## Do
1. `PersonCheckHistoryReportBuilder.createData(String encFormId)`: decryptToLong → `RequestChecklistFormRepository
   .findById(formId)`. Map to `PersonCheckReportData`:
   - Footer: submittedBy=`REQUEST_PERSON_NAME`, receivedBy=`CREATE_NAME`, contactDate=`dateOnly(REQUEST_CONTACT_DATE)` (DEF-18 blank-not-null).
   - documentItems: `…_DOC` (findByRequestChecklistFormIdOrderBySequenceAsc) → title=`CHECKLIST_NAME`, checked=`HAS_FILE`.
   - persons: `…_PER` (findByRequestChecklistFormId) → name=`REQUEST_CHECKLIST_PERSON`, idCardChecked=`HAS_ID_CARD_NO_FILE`,
     houseRegChecked=`HAS_HOUSE_REG_NO_FILE`. Pad to min 5.
   - verification: `…_DTL` per TITLE_CHECKLIST_CODE — DocIncomp→ขาดเอกสาร, DocEdit→แก้ไข, DocExpire→หมดอายุ,
     DocExtra→เพิ่มเติมอื่นๆ. title=`formatDetailTitle(DESCRIPTION, REASON)` (**DESCRIPTION primary — per a1's working code**).
     Pad each section to min 3 rows. หมายเหตุ band as live.
   - ครบ/ไม่ครบ: from the snapshot only (derive from `…_DOC.HAS_FILE`, like a1) — never live tables.
   - **NO ChecklistCodeBinder / TICK RULE / live repos here** — the snapshot is pre-flattened.
2. Add `RequestCheckListPerRepository.findByRequestChecklistFormId(Long)` if absent (NULL-safe, no FETCH FIRST).
3. Wire `DocumentController` HISTORY switch: `case "CHECKPERSON"` → `personCheckHistoryReportBuilder.createData(formId)`
   → `exportPdfPersonCheck`. Resolver already routes formId→CHECKPERSON. No template change.
4. **Verify `…_PER` columns against the live `DID_SPF` connection** (DEF-17 — snapshot family not in dict; Form/Doc/Dtl
   proven by a1's history builder, `…_PER` is new usage). If a column is absent, that's a DATA REQUEST up the chain.

## Verify — BE then QA
- BE: test-compile + boots; a `PersonCheckHistoryPreviewTest` (or extend the existing) renders mock snapshot; no literal
  null; date-only; min-5 persons; 3-per-section; a1/a3/a6/a9/a14/a15 + live personCheck PreviewTests unchanged; clean package green.
- QA (real DB): **history on FORM_ID 211 (REQUEST_ID 37832)** → 200, matches the stored snapshot **verbatim** (6 docs,
  1 person both ticks, real footer); live 38237 unchanged.

## Handoff
Back to **Sober** (review: verbatim-from-snapshot, DESCRIPTION-primary, no live-table reads, `…_PER` column verify,
history-switch wiring). Then QA both paths → closes REQ-032 fully.

## Done (2026-08-27) — Jason

New `PersonCheckHistoryReportBuilder` + wiring, DB-free green. Everything the entities/repos needed
(`RequestCheckListPerEntity`/`RequestCheckListPerRepository.findByRequestChecklistFormIdOrderByIdAsc`)
already existed — no new repository method needed (item 2 of the Do list was a no-op).

- `createData(encFormId)`: `…_FORM` → footer (`REQUEST_PERSON_NAME`/`CREATE_NAME`/`dateOnly(REQUEST_CONTACT_DATE)`,
  nz-guarded), `note`=`nz(REASON)`. `…_DOC` (`findByRequestChecklistFormIdOrderBySequenceAsc`) → documentItems
  verbatim, `title=CHECKLIST_NAME`, `checked=(HAS_FILE==1)`. `…_PER` → persons, padded to min 5 (same pad
  shape as live, numbered 1..5+). `…_DTL` per `TITLE_CHECKLIST_CODE` → the 4 sections, `DESCRIPTION`-primary
  via `formatDetailTitle` (cloned verbatim from `A1CheckListHistoryReportBuilder`), padded to min 3 each.
  `ครบ` = `documentItems.stream().allMatch(checked)` — snapshot-only, exactly like a1. **No ChecklistCodeBinder,
  no live repos** — confirmed nothing outside `…_FORM/_DOC/_PER/_DTL` is touched.
- Wired `DocumentController`'s HISTORY switch `case "CHECKPERSON"` → `exportPdfPersonCheck` (same as live —
  no template/service change needed beyond the new case).
- `…_PER` columns (`HAS_ID_CARD_NO_FILE`/`HAS_HOUSE_REG_NO_FILE`/`REQUEST_CHECKLIST_PERSON`) — the entity
  and repository **already existed in the codebase** (not something I added), so this isn't a fresh
  DEF-17-style risk I introduced; I can't verify it against the live `DID_SPF` connection myself (BE never
  touches env) — please confirm someone already did when this entity was first added, or route it to QA's
  leg alongside the FORM_ID 211 render.

### ⚠️ Structural gap not covered by the task spec — flagging before QA, not guessing silently
TASK-040 says map `…_DOC` to `documentItems` **verbatim, 1:1** (no folding). But the live builder's item ๔
is a **synthetic row that folds two BgChk codes (10204 idCard, 10305 houseReg) into one row carrying a
nested `persons` list** — and the *template* (unchanged, per item 6) only knows how to render the person
table by pulling `subDataSource("persons")` off **one specific `documentItems` row**. A verbatim 1:1 dump
of `…_DOC` has **no row that structurally corresponds to "item ๔"** — for personCheck's `BgChk` group the
snapshot most likely has idCard and houseReg as two *separate* doc lines (6 rows total, matching QA's own
FORM_ID 211 sample: "6 doc rows, 1 person"), not 5.

Since nothing in the snapshot tables carries a per-row "this is the person-table row" flag, and TASK-040
explicitly forbids referencing live `ChecklistCodeBinder`/master data to identify it, I added a **heuristic**
(`isPersonRow()`): attach the `persons` list to the first `…_DOC` row whose `CHECKLIST_NAME` contains
"บัตรประชาชน", with a same-list-on-last-row fallback if no row matches (so the person table is never
silently dropped). This is a guess about what the stored `CHECKLIST_NAME` text actually looks like — I
have not seen a real snapshot row's text. **Please have QA specifically confirm on FORM_ID 211 that the
person table renders under the correct document line** (not under a wrong one, and not duplicated). If the
real `CHECKLIST_NAME` text doesn't contain "บัตรประชาชน", the fallback will still show the table (just
possibly on the wrong row) rather than disappearing — flagging so this isn't discovered cold on a rendered
form.

**Verify (DB-free):** extended `PersonCheckPreviewTest` with a second scenario mocking the history shape
(6 raw doc rows, persons attached via the same heuristic) — renders to
`target/personCheck-history-preview.pdf`, 2 pages, `assertFalse(json.contains("null"))` passes for both
scenarios. All 5 `*PreviewTest`s green, `clean package` green, 52/52 jrxml.

**Separately, not part of this task:** Porter's ครบ/ไม่ครบ RULE message (items ๑–๔ only, item ๔ ticks on
person-existence not attachment, every person's attachments must be complete for ครบ, missing items must
name the person) hasn't landed in a SPEC/TASK yet — TASK-040 only says "ครบ/ไม่ครบ from the snapshot,
never live tables" for history, which is consistent with that rule not applying to history at all (a
snapshot is frozen). But the **live** builder (TASK-039) still computes ครบ the old way and still renders
blank hand-fill rows for "ไม่ครบ", not the new named-person-missing-list behavior. Not touching that without
a TASK — flagging so it isn't lost.

Back to **Sober** — see `inbox/SA.md`. Then QA: FORM_ID 211 (history) + 38237 (live) → closes REQ-032.

## Sober review (2026-08-27) — DONE with one hardening DATA REQUEST; person-row heuristic accepted as interim
- History builder verified: verbatim from …_FORM/_DOC/_PER/_DTL, DESCRIPTION-primary via cloned formatDetailTitle,
  ครบ from snapshot docs only, NO ChecklistCodeBinder/live repos, history-switch `case "CHECKPERSON"` wired, date-only +
  nz. Reuses PersonCheckReportData + templates. `…_PER` entity/repo pre-existed (not a new DEF-17 risk you introduced —
  routed to QA's leg on 211). Preview 2 scenarios green, no literal null. ✅
- **Person-row heuristic (isPersonRow via CHECKLIST_NAME contains "บัตรประชาชน") — accepted as INTERIM** (safe last-row
  fallback so the table never vanishes). Good catch flagging it — it's the DEF-12 "renders plausibly but wrong" class.
  It can't be hardened DB-free: `…_DOC.CHECKLIST_ID` drifts on master rebuild, SEQUENCE is BgChk-duplicated, so the frozen
  `CHECKLIST_NAME` text is the only stable snapshot-local key.
> answer: keep the heuristic for now BUT harden it with the real text — see DATA REQUEST. Do NOT resolve via the live
> master (ChecklistCodeBinder) — that's the live-data coupling the history path must avoid.
- @Porter — **DATA REQUEST:** the `…_DOC` rows for **FORM_ID 211** (CHECKLIST_ID · CHECKLIST_NAME · SEQUENCE · HAS_FILE),
  so Jason matches the two person-doc lines by their exact stored `CHECKLIST_NAME` instead of a substring guess. Until then
  QA must confirm on 211 the person table renders under the CORRECT doc line (not a wrong one, not duplicated).
- **TASK-040 DONE** (history mechanism correct; person-row match = interim pending 211's doc-name text). QA: FORM_ID 211 (history) + 38237 (live).
