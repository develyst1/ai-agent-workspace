# SPEC-034: อ.4 checklist report (สั่งหรือนำเข้ามาในราชอาณาจักร) — REQ-029

- Source: REQ-029 (READY_FOR_SA) + Porter's `ReqImport` mapping + the official form
  (`project-docs/A4-A8-form-official.pdf`, 4 pages, SA-surveyed) + data dictionary.
- Status: ACTIVE (SA spec). **Implementation is SEQUENCED AFTER REQ-031's QA leg closes** (Porter): do not build
  อ.4 templates mid-change to the very build pipeline that compiles them. TASK-034 is BLOCKED until then.
- Pattern: closest analog is **a14** (standalone builder on `ChecklistCodeBinder`, no MOVE) — NOT the a9-base
  (move-centric). New builder + model + template folder `request-a4`. Reuse persons/lawRef/signature/annex/§4 helpers.

## Open questions — RESOLVED (SA, from dict + form; verify-on-real-data flagged where rule #4 applies)
- **Q4 variants:** ONE report. อ.8 is the granted-license counterpart (referenced as evidence item-6 "อ.8 ฉบับเดิม"),
  like อ.6/อ.7 sharing one report. No destroy/transport-style split. Code `"A4"`, folder `request-a4`.
- **Q3 item-5 วัตถุประสงค์:** `T_T_REQUEST_IMPORT` has NO objective column (only PLANT_*/REF_LICENSE_*). Source is
  **`T_T_REQUEST.OBJECTIVE`** (same as อ.6, per CLAUDE.md a6 mapping). BE: confirm the column on `T_T_REQUEST`.
- **Q2 annex + item-6 source:** `T_T_REQUEST_DTL_REF_IMPORT` — cols `ID(PK) · REQUEST_ID(FK) · REQUEST_DTL_ID(FK,
  nullable) · LICENSE_NO · ISSUE_DATE · EXPIRY_DATE · ATTACH_FILE_ID`. Only `ID` is unique ⇒ **many-per-item is
  possible**; the form prints ONE line per item. Read it TWICE (Porter): (a) evidence item-6 = all rows by
  `REQUEST_ID` (§4 own-table lines), (b) annex = joined per item by `REQUEST_DTL_ID`. See rules below.

## Page 1 — 7 items (NOT 8; NO buyer/หน่วยงาน item) — index carefully
1. ชื่อผู้ขออนุญาต / ชื่อบริษัท → `T_T_REQUEST.TRADER_NAME` (a6 pattern).
2. ประเภทการขออนุญาต → **fixed constant `สั่งหรือนำเข้ามาในราชอาณาจักร`** (printed on the form; not data-driven).
3. วัตถุ/อาวุธที่ขออนุญาต ตามผนวกบัญชีรายการที่แนบ → static pointer to the annex.
4. จำนวนที่ขออนุญาต → count of item rows (`VW_REQUEST_DTL`, REQ-025) + " รายการ".
5. วัตถุประสงค์ที่ขออนุญาต → `T_T_REQUEST.OBJECTIVE`.
6. **ระยะเวลาการอนุญาต → `T_T_LICENSE.PERIOD_TEXT` (REQ-023 rule).** ⚠️ The item-7-rule lands on **item 6** here —
   there is no buyer item, so วัตถุประสงค์=5, ระยะเวลา=6. Do NOT copy item-7 from อ.9/อ.14. (REQ-029's explicit off-by-one warning.)
7. เอกสารหลักฐาน (ด้านหลัง) → static pointer.
- Law-refs block + delegation paragraph (มอบอำนาจช่วง …): same mechanism as a9/a6 (`T_T_REQUEST_LAW_REF` ⨝
  `T_M_LAW_REFERENCE`); the form's law list is อ.4-specific (มาตรา 25 + the import กฎกระทรวง set) — bind from data, blank-safe.

## Pages 2–3 — 17 evidence items (TICK RULE, group `ReqImport`; IS_ACTIVE irrelevant — bind the 4 inactive too)
Bind each printed line by its `CHECKLIST_CODE` via `ChecklistCodeBinder` (code→ID once, tick ⟺ a doc with
`ATTACH_FILE_ID` not null/≠0 AND STATUS≠'D' on that REQUEST_CHECKLIST_ID). Codes (REQ-029 mapping):
| line | code | | line | code |
|---|---|---|---|---|
| 1 จดทะเบียน | `ReqImport00101` | | 10 สถานที่จัดเก็บฯ | `ReqImport00012` |
| 2 มอบอำนาจ | `ReqImport00602` | | 11 แผนผังโรงงาน | `ReqImport12111` |
| 3 ผู้มีอำนาจลงนาม (1)(2) | persons (T_T_REQUEST_PER) | | 12 ภาพตัวอย่าง/แบบรูป | `ReqImport00013` |
| 4 ผู้รับมอบอำนาจ (1)(2) | persons | | 13 คุณสมบัติ/ลักษณะ | `ReqImport00014` |
| 5(1) ร.ง.4 | `ReqImport00803` | | 14 หาไม่ได้ในราชอาณาจักรฯ (LONG label) | `ReqImport00015` |
| 5(2) อ.2 ฉบับต่ออายุ | `ReqImport12204` (IS_ACTIVE 0 — bind) | | 15 โครงการวิจัย | `ReqImport00016` (0 — bind) |
| 5(3) อ.7 | `ReqImport00006` (0 — bind) | | 16 ใบแสดงรายการสินค้า/ใบสั่งซื้อ | `ReqImport00017` (0 — bind) |
| 5(4) เปิดสายการผลิต (1)(2) | no master row → render untick (like a9 เปิดดำเนินการ) | | 17 เอกสารอื่น ๆ | no master row → dynamic other-docs / untick |
| 6 อ.8 ฉบับเดิม (1)(2) | **§4 own-table** (below) | | 7 บัตรผู้เสียภาษี | `ReqImport00407` |
| 8 ภ.พ.20 | `ReqImport10008` | | 9 แผนที่โรงงาน | `ReqImport00010` |

- **Item 6 (§4 carve-out):** render one line per `T_T_REQUEST_DTL_REF_IMPORT` row for this `REQUEST_ID` (like อ.9's
  ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์): label "(n) ที่ <LICENSE_NO> ลง <ISSUE_DATE>", tick from that row's `ATTACH_FILE_ID`
  (not null/≠0). No master row, no code lookup — own-table, exactly the a9 `LicRow` pattern.
- **Do NOT reorder to the master's SEQ** — master 10/11/12 = แผนที่/แผนผัง/สถานที่จัดเก็บ but the FORM prints
  9/10/11 = แผนที่/สถานที่จัดเก็บ/แผนผัง. Code binding makes the master order irrelevant; the form order is locked.
- **No item-12 "เอกสารของผู้ซื้อ" block** — none of the ส.ค.4/ป.3/ป.5/มท./ยุทธภัณฑ์ machinery applies. Do not port it.
- Item-14's long paragraph label: use a stretch textField (DEF-8 lesson — no truncation).
- **หมายเหตุ footnote MUST print:** `เอกสารภาษาต่างประเทศให้แนบฉบับแปล พร้อมรับรองการแปลมาด้วยทุกครั้ง`.
- **4 signature slots** (ประจำแผนกฯ / ผอ.กคร.อท.ศอพท. / หน.หนังสืออนุญาตฯ / จก.อท.ศอพท.) — reuse the a-family
  signature block; blank-safe (never "null").

## Page 4 — annex with 3 EXTRA columns
- Base columns `ลำดับ | รหัส | รายการ | จำนวน` from `VW_REQUEST_DTL` (REQ-025: name=PRODUCT_NAME_DISPLAY_LICENSE,
  unit=QUANTITY_UNIT_NAME1). Plus, under "หนังสืออนุญาต แบบ อ.8 ฉบับเดิม":
  `เลขที่หนังสือ=LICENSE_NO · วันที่ออกเอกสาร=ISSUE_DATE · วันที่หมดอายุ=EXPIRY_DATE` from `T_T_REQUEST_DTL_REF_IMPORT`
  joined by `REQUEST_DTL_ID` = the item row's DTL id.
- **Cardinality (rule #4 — verify on real data):** REF_IMPORT is not unique per `REQUEST_DTL_ID`, so >1 is possible;
  the form has ONE line per item. Design: `firstOrNull` per item (order by ISSUE_DATE desc, then ID) and render that
  one; blank when none. BE/QA: confirm on real data whether any item ever has >1 REF_IMPORT — if so, we've chosen
  "show the latest"; escalate only if the form is expected to list all.
- **Join key:** the annex needs the item's `REQUEST_DTL_ID`. BE: confirm `VW_REQUEST_DTL` exposes the item's DTL id
  (`T_T_REQUEST_DTL.ID`); if the view doesn't carry it, read `T_T_REQUEST_DTL` for the key. **State which, explicitly.**

## Routing / wiring (routing already exists)
- `RequestTypeResolverService`: `REQUEST_TYPE = 4 → "A4"` already in the collapsed switch (REQ-028). No resolver change.
- Add: `ReportDefinition.A4`, `A4CheckListReportData` (record), `A4CheckListReportBuilder` (+ preview builder),
  `request-a4/` templates (main + lawRef/signature/evidence/evidenceSub/component subreports), `ReportResourceService`
  `openRequestA4*`, `JasperPdfReportService.exportPdfA4`, and `DocumentController` case `"A4"` (both download + history legs).

## Acceptance
- Matches the official PDF: 7 page-1 items (ระยะเวลา at **6**, NO buyer item, item-2 constant), 17 evidence items in
  form order, verbatim labels, item-14 not truncated, หมายเหตุ footnote, 4 signature slots, annex with the 3 อ.8 columns.
- Ticks by `ReqImport` code (incl. the 4 IS_ACTIVE=0 rows); item-6 §4 own-table ticks by `REF_IMPORT.ATTACH_FILE_ID`;
  unseeded/absent code → untick (graceful, never error). Blank-never-null throughout.
- อ.6 / อ.9 (both) / อ.14 / อ.15 unaffected. Real-data render (QA) once a real REQUEST_TYPE=4 request is available.

## Task
- TASK-034 (Jason, BE): build อ.4 per the above. **BLOCKED until REQ-031 QA closes.** Back to Sober for review, then QA.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
