# SPEC-035: personCheck (ตรวจสอบประวัติ / CHECKPERSON) report — finish the abandoned work (REQ-032)

- Source: REQ-032 (READY_FOR_SA) + `project-docs/PersonCheck-form-official.pdf` + the 6 existing
  `request-personCheck` templates + Porter's `BgChk` mapping.
- Status: ACTIVE (SA spec). **Finish abandoned work — do NOT redesign the templates.** Only the report definition +
  builder are missing (routing `case 0 → CHECKPERSON` and the `BgChk` master already exist).
- Pattern: **a1/a3** (standalone, one page, no signature block / no law refs / no annex). Do NOT clone an อ.9-family builder.

## The gap (whole task)
UI button on ตรวจสอบประวัติ → `400 Unsupported requestType: CHECKPERSON` because `DocumentController` has no
`case "CHECKPERSON"` and there's no `ReportDefinition`/builder. `request-personCheck` is the only template folder
without a builder. Build the definition + builder against the existing templates; render `CHECKPERSON`.

## Data contract (from the existing templates — the builder/model MUST match these field names)
- **main** (`request-personCheck-main.jrxml`): `documentTitle`, `objectiveType`, `submittedBy` (ผู้มายื่นเรื่อง),
  `receivedBy` (เจ้าหน้าที่รับเรื่อง), `contactDate` (วันที่มาติดต่อ), `note`, + subDataSources `documentItems`, `verificationResult`.
- **documentItems** (`-documentItems.jrxml`): `orderNo`, `title`, `checked`, `optional` — the 5 evidence items.
- **person table** (`-list.jrxml`): the item-๔ person rows (name + สำเนาบัตรประชาชน / สำเนาทะเบียนบ้าน tick columns).
  ⚠️ contains a **hardcoded sample person `1. นายทศนิยม หน้าสองหลังสาม`** — BE must confirm how `-list` is invoked
  (subreport/subDataSource or nested under documentItems item ๔) and replace the hardcoded row with the real binding.
- **verificationResult** (`-verificationResult*.jrxml`): `completed` (ครบ/ไม่ครบ), `sections` → each `code`/`label`/
  `status`/`items` → `orderNo`/`title` (ขาดเอกสาร ๑–๓ / เอกสารหมดอายุ ๑–๓).

## Evidence ticks — TICK RULE, group `BgChk` (bind by CHECKLIST_CODE ONLY)
| form item | code | note |
|---|---|---|
| ๑ บัญชีรายชื่อผู้ถือหุ้น | `BgChk00701` | |
| ๒ หนังสือบริคณห์สนธิ | `BgChk00302` | |
| ๓ หนังสือรับรองบริษัทฯ | `BgChk00203` | |
| ๔ person table — สำเนาบัตรประชาชน col | `BgChk10204` | item ๔ is the person table's TWO columns, not one tick |
| ๔ person table — สำเนาทะเบียนบ้าน col | `BgChk10305` | |
| ๕ หนังสือมอบอำนาจ | `BgChk00606` | |
| *(master-only, not on form)* สำเนา อ.2 | `BgChk00001` (IS_ACTIVE 0) | do not render |
- ⚠️ **`SEQUENCE` is DUPLICATED in `BgChk`** (`BgChk00001` and `BgChk00701` both SEQUENCE 1). Bind by `CHECKLIST_CODE`
  only — never sort/index by SEQUENCE. Use `ChecklistCodeBinder` (code→id, tick ⟺ doc with ATTACH_FILE_ID not null/0 AND STATUS≠D).
- The **per-person** บัตร/ทะเบียนบ้าน ticks likely come from `T_T_REQUEST_PER` per-person flags (as a1/a3/a9 person
  handling does), NOT one code per person — BE to confirm whether 10204/10305 are the item-๔ category ticks vs the
  per-row source, and bind the person rows from `T_T_REQUEST_PER`.

## Data sources (BE to bind; verify EVERY column against the app's LIVE connection — DEF-17 lesson, not just the dict)
- Header/footer (documentTitle/objectiveType/submittedBy/receivedBy/contactDate/note): `T_T_REQUEST` + the person-check
  request table (per Porter's hint `T_T_REQUEST_LOC_CHK`) — reuse a1/a3's header sourcing where it matches.
- Person table rows: `T_T_REQUEST_PER` (name + idCard/houseReg flags).
- ครบ/ไม่ครบ + missing/expired sections: `T_T_REQUEST_LOC_CHK` (identify the completed flag + the missing/expired lists).
- **Per DEF-17: any new @Entity/@Column must be verified against the app's actual `DID_SPF` connection, and treated as
  perishable** — cite the source, and prefer minimal columns. SPEC-027++ guard applies.

## Wire (mirror a1)
`ReportDefinition.CHECKPERSON`; `PersonCheckReportBuilder` (+ history if a1 has one) + `PersonCheckReportData` (record
matching the field names above); `ReportResourceService.openRequestPersonCheck*` (6 templates); `JasperPdfReportService
.exportPdfPersonCheck`; `DocumentController` `case "CHECKPERSON"` (download + history legs). Resolver `case 0 → CHECKPERSON`
already exists — no resolver change. Add CHECKPERSON to the "Supported requestType" help string.

## Acceptance
- **38237 renders a PDF (not 400)**; matches the official form (heading, 5 items, person table, ครบ/ไม่ครบ block, footer).
- Ticks per the TICK RULE (BgChk codes); **NO hardcoded sample person** anywhere in the output.
- Blank never `null`. a1 / a3 / a6 / a9(d+t) / a14 / a15 unaffected.
- ⚠️ `.jasper` for `request-personCheck` are compiled by the REQ-031 build step — after REQ-031 closes, a plain
  `clean package` compiles them; confirm the 6 personCheck `.jasper` are produced.

## Task
- TASK-038 (Jason, BE). Sequence after REQ-031 QA if it overlaps the build pipeline (same caution as อ.4); the
  personCheck templates rely on the REQ-031 precompile to reach the jar.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
