# TASK-038: Build the CHECKPERSON (personCheck) report definition + builder (REQ-032 / SPEC-035)

- Source: SPEC-035 (REQ-032). Assignee: Jason (BE). HIGH — UI button currently returns 400.
- Finish abandoned work: routing (`case 0 → CHECKPERSON`), `BgChk` master, and the 6 `request-personCheck` templates
  already exist. Build ONLY the report definition + builder + wiring. Model on **a1/a3**, NOT อ.9.

## Do
1. `PersonCheckReportData` (record) matching the template field names EXACTLY:
   - main: `documentTitle`, `objectiveType`, `submittedBy`, `receivedBy`, `contactDate`, `note`, `documentItems` (list),
     `verificationResult` (object).
   - documentItems: `orderNo`, `title`, `checked`, `optional`.
   - verificationResult: `completed`, `sections` (list) → `code`, `label`, `status`, `items` → `orderNo`, `title`.
   - person table (`-list.jrxml`): name + สำเนาบัตรประชาชน / สำเนาทะเบียนบ้าน tick flags per row.
2. `PersonCheckReportBuilder.createData(requestId)`:
   - 5 evidence items via TICK RULE (`ChecklistCodeBinder`, group `BgChk`): ๑ `BgChk00701` · ๒ `BgChk00302` ·
     ๓ `BgChk00203` · ๕ `BgChk00606`; item ๔ = person table (codes `BgChk10204` บัตร / `BgChk10305` ทะเบียนบ้าน).
     **Bind by CHECKLIST_CODE only — `BgChk` SEQUENCE is duplicated/not unique; never index by SEQUENCE.** Skip
     `BgChk00001` (อ.2, IS_ACTIVE 0, not on the form).
   - Person rows from `T_T_REQUEST_PER` (name + idCard/houseReg flags), like a1/a3/a9 person handling.
   - Header/footer + ครบ/ไม่ครบ + missing/expired sections from `T_T_REQUEST` + `T_T_REQUEST_LOC_CHK` (confirm the exact
     columns). **Verify every @Column against the app's LIVE `DID_SPF` connection, not just the dict (DEF-17 lesson).**
   - Blank never `null`; unseeded/absent code → untick (graceful).
3. **Remove the hardcoded sample person** `1. นายทศนิยม หน้าสองหลังสาม` from `-list.jrxml` and bind the real person
   rows (minimal template edit to kill leftover test data — NOT a redesign). Confirm how `-list` is invoked from main.
4. Wire like a1: `ReportDefinition.CHECKPERSON`, `ReportResourceService.openRequestPersonCheck*` (6 templates),
   `JasperPdfReportService.exportPdfPersonCheck`, `DocumentController` `case "CHECKPERSON"` (download + history) + add
   CHECKPERSON to the "Supported requestType" help string. Resolver `case 0 → CHECKPERSON` already exists — no change.

## Verify — BE then QA
- BE: new `PersonCheckPreviewTest` (compile the 6 jrxml→jasper + mock render) green; `./mvnw -o clean package`
  produces the 6 `request-personCheck` `.jasper` (via the REQ-031 precompile — already in place); boots; a1/a3/a6/a9/a14/a15
  PreviewTests unchanged; **no `นายทศนิยม` anywhere** (grep the templates + a rendered mock).
- QA (real DB): **38237 → 200 PDF** (not 400), matches `PersonCheck-form-official.pdf`; ticks per TICK RULE; no sample person.

## Handoff
Back to **Sober** (review: field-name match, TICK-RULE-by-code, sample-person removed, a1-style wiring, DEF-17-style
column verification, no drift on other forms). Then QA on 38237.

## Done (2026-08-27) — Jason

Built the missing layer only; templates/master/routing untouched in shape (2 wiring bugs fixed in the abandoned
templates themselves, see below).

- `PersonCheckReportData` (+ nested `DocumentItem`, `Person`, `VerificationResult`, `VerificationSection`,
  `VerificationItem`) — field names match the 6 templates exactly. `objectiveType` (declared in main.jrxml,
  unused by any element) left unpopulated, same treatment a1 gives its own unused fields.
- `PersonCheckReportBuilder.createData(requestId)` — TICK RULE via `ChecklistCodeBinder`, group `BgChk`, bound
  by CHECKLIST_CODE only (not SEQUENCE): ๑`00701` ๒`00302` ๓`00203` ๕`00606`. `BgChk00001` (อ.2, inactive)
  correctly never referenced.
- Wired: `ReportDefinition.CHECKPERSON`, `ReportResourceService.openRequestPersonCheck*` (6), 
  `JasperPdfReportService.exportPdfPersonCheck`, `DocumentController` `case "CHECKPERSON"` (download switch)
  + help string. Resolver untouched (already had the case).
- Removed the hardcoded sample person from `-list.jrxml`; person rows are real `$F{name}`-bound textFields now,
  wired through a fixed subreport chain (see bugs below). Also fixed the mislabeled 2nd/3rd column headers
  (both said "สำเนาบัตรประชาชน" — 3rd is now "สำเนาทะเบียนบ้าน", per REQ-032's own mapping table).
- New `PersonCheckPreviewTest` (mirrors `A6PreviewTest`) — compiles all 6 jrxml, renders mock data to
  `target/personCheck-preview.pdf`, 1 page, no exceptions.
- Verified DB-free: `./mvnw -o -DskipTests compile` (52/52 jrxml precompile clean) → `PersonCheckPreviewTest`
  green → all 5 `*PreviewTest`s (a6/a9/a15/a14/personCheck) green, no regression → `./mvnw -o -DskipTests
  clean package` green, jar produced. Could not boot-smoke or hit real DB (BE never touches env — QA's leg).

### Bugs found beyond what REQ-032/SPEC-035 flagged (fixed, since they blocked the feature entirely)
1. **`request-personCheck-documentItems.jrxml`** — item ๔'s nested person-list subreport had
   `dataSourceExpression = new JREmptyDataSource()` (always empty) and a hardcoded literal `.jasper`
   filename instead of a `$P{...}` parameter. Fixed to `subDataSource("persons")` off the current row +
   a new `$P{SUBREPORT_LIST}` parameter, per the working `request-a6-evidence.jrxml` nested-subreport
   convention (no `<field>` declaration needed; empty/absent array → zero rows).
2. **`request-personCheck-main.jrxml`** — the documentItems subreport element's own `expression` was a
   hardcoded literal source-`.jrxml` path (not `$P{SUBREPORT_DOCUMENT_ITEMS}`), while the verificationResult
   subreport right next to it correctly used its parameter. Fixed + threaded the new `SUBREPORT_LIST`
   parameter through main → documentItems → list.

### Judgment calls made — flagging explicitly, not presenting as settled
1. **`verificationResult` source**: SPEC-035/TASK-038 suggested `T_T_REQUEST_LOC_CHK` but flagged it
   unconfirmed (DEF-17 caution — BE can't verify live columns). I did **not** query it. Instead
   `completed`/`missing`/`expired` are **computed from the same `documentItems` list**, exactly like
   `A1CheckListReportBuilder`/`PersonChangeCheckListReportBuilder`/`A6CheckListReportBuilder` already do
   (no separate result table in any of those). Please confirm this is acceptable or point me at the real
   table if `T_T_REQUEST_LOC_CHK` is in fact load-bearing here.
2. **Person-table `PER_TYPE`**: `RequestPerRepository.findActivePersons(requestId, perType)` is
   signer/attorney-specific (`PER_TYPE` 1/2, used by อ.6/อ.9/อ.14 — none of which matches personCheck's
   "กรรมการ/ผู้ถือหุ้น/ผู้จัดการ" combined list). I added `findActivePersonsAll(requestId)` (same NULL-safe
   STATUS filter, no `PER_TYPE` filter) rather than guess a `PER_TYPE` value. If `T_T_REQUEST_PER` actually
   needs filtering for this form, this will over-include — safer/more-visible failure mode than
   under-including, but needs confirmation.
3. **Item ๔'s own `checked` flag**: there's no single `BgChk` code for item ๔ (it's the person table's two
   columns per REQ-032's own reconciliation). I derived item ๔'s row-level `checked` = persons non-empty AND
   every person has both `idCardChecked` and `houseRegChecked` — an aggregation-from-children pattern, same
   shape as a1's topic-level `hasAtLeastOneChecked`/`completed`. Flagging since it's inferred, not coded.
4. **No History builder** — REQ-032/SPEC-035 don't ask for one, and อ.9D/อ.9T/อ.14/อ.15 don't have one either
   (only a1/a3/personChange/open/expand/plantChange do). Skipped to match scope; separate ask if needed.

Back to **Sober** for review — see `inbox/SA.md`.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Sober review (2026-08-27) — DONE (SA-verified). Judgment calls ruled with dict evidence.
> answer (JC1 verificationResult): **your compute-from-items approach is CORRECT.** `T_T_REQUEST_LOC_CHK` does NOT
> exist in the schema (not a dict table; Porter's hint was wrong) — there is no result table, so computing
> completed/missing from the items (like a1/a6/personChange) is right. Caveat recorded: the **"เอกสารที่หมดอายุ ๑–๓"**
> sub-section has NO tick-derivable source and no table → it renders EMPTY. Accepted limitation (officer free-text),
> like the a14 §4 / อ.7-routing gaps.
> answer (JC2 PER_TYPE): **`findActivePersonsAll` (no PER_TYPE filter) is CORRECT.** Dict: `T_T_REQUEST_PER` IS the
> background-check person list (PERSON_SEQ/PERSON_NAME = "ผู้ตรวจสอบประวัติ"); `PER_TYPE` is signer-authority
> (1=ลงนาม/2=มอบอำนาจ), orthogonal to กรรมการ/ผู้ถือหุ้น/ผู้จัดการ (those are IS_DIRECTOR/IS_SHAREHOLDER/
> IS_MANAGING_DIRECTOR/IS_FACTORY_MANAGER flags). All persons on a CHECKPERSON request ARE the ones to list.
> answer (JC3 item-๔ + per-person ticks): **sound.** Per-person ticks correctly join docs by REF_ID=person +
> DOCUMENT_ID(บัตร/ทะเบียนบ้าน)+hasFile, gated by BgChk10204/10305 — genuinely per-person, no invented columns. Item-๔
> row-`checked` = persons non-empty AND all have both ticks = fine (aggregation, like a1). The 2 codes ARE used (category gate).
> answer (JC4 no History): **correct** — a9/a14/a15 have none; out of scope. Separate ask if the UI needs a history leg.
- Also verified: field names match the 6 templates; sample person `นายทศนิยม` removed (grep 0); mislabeled col header
  fixed (3rd = สำเนาทะเบียนบ้าน); the 2 template wiring bug-fixes (JREmptyDataSource→subDataSource, literal path→$P{param})
  are necessary to make the abandoned templates functional and follow the a6 nested-subreport convention — accepted.
  RequestPerEntity maps only real cols (ID_CARD_NO/ID_CARD_EXPIRY_DATE) — no DEF-17 risk. PreviewTest + clean package green.
- **TASK-038 DONE.** QA leg: 38237 → 200 (not 400), matches the form, per-person ticks land for persons with real
  บัตร/ทะเบียนบ้าน docs, no sample person. @Porter — one accepted limitation to record: "เอกสารหมดอายุ" section renders empty (no source).
