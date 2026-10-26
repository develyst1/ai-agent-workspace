# TASK-042: DEF-19 — อ.4 static headings still carry a14-clone wording (annex + page-2 heading)

- Source: DEF-19 (QA). Assignee: Jason (BE). Blocks REQ-029 close. Static labels in `request-a4-main.jrxml`.
- Root: cloning a14 carried its static strings into the annex/heading bands; the verbatim pass fixed only the
  EVIDENCE items. **I swept every a4 subreport — only `request-a4-main.jrxml` is affected (2 strings); the generic
  evidence/evidenceSub/lawRef/signature subreports are clean.**

## Fix (verbatim from `A4-A8-form-official.pdf`)
1. **`request-a4-main.jrxml:166` (annex heading, the DEF-19 one):**
   `แบบบัญชีรายการ วัตถุ/อาวุธที่ขออนุญาตขายและขนย้ายอาวุธ`
   → `แบบบัญชีรายการ วัตถุ/อาวุธที่ขออนุญาตสั่งหรือนำเข้ามาในราชอาณาจักร`
2. **`request-a4-main.jrxml:130` (page-2 evidence-section heading):** drop the spurious trailing `ซึ่งอาวุธ` —
   `เอกสารหลักฐานที่ใช้ประกอบคำขอรับหนังสืออนุญาตสั่งหรือนำเข้ามาในราชอาณาจักรซึ่งอาวุธ`
   → `เอกสารหลักฐานที่ใช้ประกอบคำขอรับหนังสืออนุญาตสั่งหรือนำเข้ามาในราชอาณาจักร`
3. Mirror into `A4CheckListPreviewBuilder` mock only if it hardcodes either heading (else no-op).

## Verify — BE then QA
- BE: `grep -rn 'ขายและขนย้าย\|ซึ่งอาวุธ' src/main/resources/reports-045/request-a4/` = 0; A4PreviewTest + clean package
  green (the REQ-031 precompile rebuilds the .jasper).
- QA: real REQUEST_TYPE=4 render — annex heading = "…สั่งหรือนำเข้ามาในราชอาณาจักร"; page-2 heading correct.

## Handoff
Back to **Sober** (grep 0 + no other a14 leftovers). Then QA re-runs 38427 (DEF-19 + item-6 §4 real values + annex 3
อ.8 cols + the 1:N firstOrNull rule on a >1-REF_IMPORT request) → closes REQ-029.

## Done (2026-08-31) — Jason

Both strings fixed exactly as given (`request-a4-main.jrxml` lines 130/166). Checked `A4CheckListPreviewBuilder`
for hardcoded copies of either heading — none found (the two matches on `ซึ่งอาวุธ` were only in Javadoc comments
on the builder/model classes, not rendered text) — item 3 was a no-op, confirmed not assumed.

**Verify:** `grep -rn 'ขายและขนย้าย\|ซึ่งอาวุธ' src/main/resources/reports-045/request-a4/` → 0 matches.
`A4PreviewTest` green (4-page mock PDF, .jasper rebuilt via the REQ-031 precompile), `A4CheckListReportBuilderTest`
unaffected (4/4, this fix didn't touch builder logic), `clean package` green, 58/58 jrxml.

Back to **Sober** — see `inbox/SA.md`. Then QA re-runs 38427 to close REQ-029.
