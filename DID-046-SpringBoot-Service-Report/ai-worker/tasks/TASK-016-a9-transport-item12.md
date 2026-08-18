# TASK-016: อ.9 TRANSPORT item 12 "เอกสารของผู้ซื้อ" — locked labels + real sources + ticks

- Source: SPEC-022 (REQ-019 step 2). Follow-up to TASK-015 (foundation, DONE+verified).
- Status: DONE (Sober-reviewed, both previews independently verified)
- Assignee: Jason (BE)
- Depends on: TASK-015 (variant branch already in place; transport item-12 body currently blank)
- ⚠️ Destroy item-12 (the 9 sub-items behind `if (destroy)`) must stay unchanged. This is the **transport
  branch only** (the `else` side). Keep locked-structure + "blank, never null".

## What to build
Replace TASK-015's blank transport item-12 body with the official "เอกสารของผู้ซื้อ" sub-item list
(labels hardcoded/locked, per Porter's official-PDF text). Each sub-item: label + optional
"ที่ ___ / ลงวันที่ ___" (or เลขที่/วันหมดอายุ) write-in values + a tick. **Values blank when the row/field
is absent — never "null".** All source tables carry `STATUS` → apply the NULL-safe soft-delete filter
`(STATUS IS NULL OR STATUS <> 'D')` (same rule as REQ-010/015).

## Source map (resolved from `project-docs/DIDPERMIT-data-dictionary.xlsx` — no human ask needed)
All permit tables share: `REQUEST_ID`, `STATUS`, `LICENSE_NO`, `ISSUE_DATE`, `EXPIRY_DATE`,
`ATTACH_FILE_ID`. "(1)/(2)" = **up to 2 rows** per table (Oracle 11.2 — use `List` + take first 2, **no
FETCH FIRST**; order by ID). Tick = `ATTACH_FILE_ID` present (REQ-009 rule: not null / > 0).

| item-12 sub-item (locked label) | source table | "ที่ ___" | "ลงวันที่ ___" | tick |
|---|---|---|---|---|
| หนังสือมอบอำนาจ — ลงวันที่ ___ | `T_T_REQUEST_BUYER` | — | `ATTORNEY_BOOK_ISSUE_DATE` | (none) |
| สำเนาบัตร นายกสมาคม/ผู้มอบอำนาจ — เลขที่/วันหมดอายุ | `T_T_REQUEST_BUYER` | `ASSOC_PRES_ID_CARD_NO` | `ASSOC_PRES_ID_CARD_EXPIRY_DATE` | (none) |
| สำเนาบัตร ผู้รับมอบอำนาจ — เลขที่/วันหมดอายุ | `T_T_REQUEST_BUYER` | `ATTORNEY_ID_CARD_NO` | `ATTORNEY_ID_CARD_EXPIRY_DATE` | (none) |
| ตัวอย่างลายมือชื่อผู้รับอาวุธ | `T_T_REQUEST_EXAMPLE_SIGN` | **reuse `buildPerson2`** (person2) — same as destroy 12(2) | | `ATTACH_FILE_ID` |
| ตามหนังสือขอซื้อ — ที่ ___ ลงวันที่ ___ | `T_T_REQUEST_BUYER` | `BUYER_DOC_NO` | `BUYER_DOC_DATE` | `BUYER_DOC_ATTACH_FILE_ID` |
| ตามหนังสือคณะกรรมการฯ พ.ศ.2553 — ที่ ___ ลงวันที่ ___ | `T_T_REQUEST_BUYER` | `GOV_COMMITTEE_NO` | `GOV_COMMITTEE_ISSUE_DATE` | `GOV_COMMITTEE_ATT_FILE_ID` |
| แผนการใช้กระสุนปืน ฯ | `T_T_REQUEST_DOC` TYPE-22 → **ReqMove SEQ14** | — | — | existing checklist tick |
| ภาพถ่ายสนามยิงปืน/ช่องยิง ฯ | `T_T_REQUEST_DOC` TYPE-22 → **ReqMove SEQ15** | — | — | existing checklist tick |
| (ส.ค.4 → **ReqMove SEQ13**, already wired via the shared checklist path) | `T_T_REQUEST_DOC` TYPE-22 | — | — | existing |
| ใบอนุญาต **ป.3** — (1)/(2) ที่ ___ ลง ___ | `T_T_REQUEST_LICENSE_P3` | `LICENSE_NO` | `ISSUE_DATE` | `ATTACH_FILE_ID` |
| ใบอนุญาต **ป.5** — (1)/(2) ที่ ___ ลง ___ | `T_T_REQUEST_LICENSE_P5` (`LICENSE_TYPE` 1=ซื้อ/2=ค้า) | `LICENSE_NO` | `ISSUE_DATE` | `ATTACH_FILE_ID` |
| หนังสืออนุญาตย้ายวัตถุระเบิด (**มหาดไทย**) — (1)/(2) | `T_T_REQUEST_MOI_MOVE_PERMIT` | `LICENSE_NO` | `ISSUE_DATE` | `ATTACH_FILE_ID` |
| ใบอนุญาต **ยุทธภัณฑ์** พ.ร.บ.ควบคุมฯ พ.ศ.2530 — (1)/(2) | `T_T_REQUEST_ARMS_CTRL_LICENSE` | `LICENSE_NO` | `ISSUE_DATE` | `ATTACH_FILE_ID` |

Then **13. เอกสารอื่น ๆ (ถ้ามี)** — unchanged shared item.

## Code shape
- New entities + repos (mirror the a9 style; only the columns above are needed; `@Query` list finders,
  `firstOrNull`/take-2, NULL-safe status): `RequestLicenseP3Entity`, `RequestLicenseP5Entity`,
  `RequestArmsCtrlLicenseEntity`, `RequestMoiMovePermitEntity`, `RequestBuyerEntity`.
- Build the transport item-12 subs in the builder's `else` (transport) branch (the `if (destroy)` from
  TASK-015). Reuse `buildPerson2` for ตัวอย่างลายมือชื่อ. Use the existing `EvidenceSub`/`employer`
  render types; dotted write-in for the "ที่ ___ ลง ___" values (like a6 REQ-012 dotted line).
- Dates via `ThaiDateFormatUtil`; every value `nz(...)` / blank when null.

## Open confirm (not a blocker — flag to QA/Porter)
The มอบอำนาจ + สำเนาบัตร grouping under item 12 is mapped from Porter's official-PDF text; **QA/Porter
verify the exact sub-item order + which rows are "(1)/(2)" against the official transport PDF** on 38336
(form-truth is Porter's leg). Sources above are certain; only the visual grouping needs an eyeball.

## Verify — DB-free (BE) then real DB (QA)
- BE (A9PreviewTest): extend the transport mock with sample P3/P5/ARMS/MOI/BUYER rows → confirm item-12
  shows the full locked label set, "ที่/ลง" values populate, ticks reflect ATTACH_FILE_ID, blanks are
  blank (no "null"); person2 reused; destroy mock item-12 unchanged. test-compile + A9PreviewTest green;
  regenerate `.jasper`.
- QA (real DB, via Porter): `/a9/db/38336` → item-12 "เอกสารของผู้ซื้อ" populated from the real tables;
  ticks where ATTACH_FILE_ID present; a destroy request unchanged.

## Definition of Done
- [ ] 5 new entities+repos (P3/P5/ARMS_CTRL/MOI/BUYER), NULL-safe status, Oracle-11.2-safe (no FETCH FIRST).
- [ ] Transport item-12 renders the full locked label set with real "ที่ ___ ลง ___"/เลขที่/วันหมดอายุ
      values + ATTACH_FILE_ID ticks; person2 reused; ReqMove SEQ13-15 tick via the existing path.
- [ ] Blank (never "null") when a row/field is absent; destroy item-12 unchanged.
- [ ] test-compile + A9PreviewTest green; `.jasper` regenerated (DEF-7 lesson).

## Implementation Notes
Built the transport item-12 body in the builder's `else` (transport) branch; destroy `if (destroy)` block
unchanged. **New: 5 entities + 5 repos** — `RequestBuyerEntity`, `RequestLicenseP3/P5Entity`,
`RequestArmsCtrlLicenseEntity`, `RequestMoiMovePermitEntity` (+ repos), each mapping only the source-map
columns, `STATUS`, `ATTACH_FILE_ID`; repos are NULL-safe JPQL `@Query findActive` (`status IS NULL OR
<> 'D'`, `ORDER BY id`, **no FETCH FIRST** → 11.2-safe; take first 2 in Java for "(1)/(2)").
- `A9CheckListReportBuilder`: injected the 5 repos; new `buildTransportItem12(requestId, checkedIds, mid)`
  called from the transport branch. Sub-items (locked labels): มอบอำนาจ+ลงวันที่, สำเนาบัตร นายกสมาคม/ผู้มอบ
  + ผู้รับมอบ (เลขที่/วันหมดอายุ), ตัวอย่างลายมือชื่อ→**reuse `buildPerson2`**, ตามหนังสือขอซื้อ + คณะกรรมการฯ2553
  (ที่/ลงวันที่ + tick=ATTACH_FILE_ID), ส.ค.4/แผนกระสุน/ภาพถ่าย = ReqMove SEQ13-15 ticks (existing checklist
  path), ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์ = (1)/(2) rows (ที่/ลงวันที่ + tick). Values inline via `nz(...)` →
  **blank never "null"**; tick = `attachFileId != null && > 0` (per the task's REQ-009 rule).
- Values rendered inline in the label ("ที่ ___ ลงวันที่ ___", like destroy item-12(1)); the dotted
  write-in *styling* is a visual nicety — see Q1.

**Verify (DB-free + boot):** `test-compile` → BUILD SUCCESS; **app boots clean** (5 new entities/repos +
JPQL validate at bootstrap, no error); A9+A6 PreviewTests → Tests run: 2, Failures: 0. Extended the
**transport mock** item-12 with the full locked-label sample set + person2 → PyMuPDF on
`a9-transport-preview.pdf`: **all locked labels present** (ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์/ตามหนังสือขอซื้อ/
ส.ค.4/แผนกระสุน…), **no "null"**. **Destroy unchanged:** `a9-preview.pdf` item-12 nine subs intact, no "null".
@Sober: ready for review. QA (real DB): `/a9/db/38336` → item-12 populated from the real tables + ticks;
a destroy request unchanged.

## Questions
- **Q1 (visual — not blocking):** inline "ที่ ___ ลงวันที่ ___" values vs dotted write-in field.
  > answer: Accept the inline rendering — it's functionally correct, blank-safe, and mirrors destroy
  > item-12(1). The dotted-line *look* + the sub-item **order / which rows are "(1)/(2)"** are form-truth
  > = Porter/QA's leg on the official transport PDF (38336). If they want the dotted styling it's a small
  > jrxml follow-up (new evidenceSub render type) — I'll spec it only if QA flags it. Not a blocker; task DONE.

## Review
**Verdict: DONE** (Sober, 2026-08-18). Independently verified — re-read the 5 entities/repos + builder,
rendered **both** previews from mock (A9PreviewTest, no DB):
- **Entities/repos:** all 5 present with the source-map columns (P5 has `LICENSE_TYPE`; BUYER has the
  doc/committee/attorney fields); repos are NULL-safe JPQL (`status IS NULL OR <> 'D'`, `ORDER BY id`),
  **no FETCH FIRST** (List + take-2 in Java) — Oracle-11.2-safe, matches convention. App boots (JPQL validates). ✅
- **Builder:** `if (destroy) … else buildTransportItem12(…)` — destroy block untouched, transport in the else. ✅
- **TRANSPORT item-12 preview:** all locked labels render (หนังสือขอซื้อ · คณะกรรมการ · แผนกระสุน ·
  สนามยิงปืน · ป.3 · ป.5 · ยุทธภัณฑ์ · วัตถุระเบิด · ตัวอย่างลายมือชื่อ · มอบอำนาจ); **no "null"**. ✅
- **DESTROY (no regression):** 9 sub-items intact (ผู้เชี่ยวชาญ present), transport labels absent, no "null". ✅
- test-compile + A9PreviewTest + A6PreviewTest green; `.jasper` regenerated.
- Remaining (not code): QA populates item-12 on real `/a9/db/38336`; Porter/QA confirm sub-item order +
  "(1)/(2)" grouping + (optional) dotted styling against the official PDF.
