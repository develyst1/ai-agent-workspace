# REQ-022: อ.14–อ.16 checklist report (ขาย/จำหน่ายอาวุธ โดยส่งออกนอกราชอาณาจักร)

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
Next report in the series: the checklist for **"คำขอรับหนังสืออนุญาตขายหรือจำหน่ายอาวุธ โดยการ
ส่งออกไปนอกราชอาณาจักร" (อ.14 → อ.16)**. Official form filed at
`project-docs/A14-A16-form-official.pdf`. The stakeholder chose this one **before** อ.4–อ.8 because
it is structurally close to the อ.9 transport report we just delivered.

## Form structure (surveyed from the official PDF)
**Page 1 — 8 items** (very close to อ.9 transport):
1 ชื่อผู้ขออนุญาต · 2 ประเภทการขออนุญาต ("ขายและขนย้ายให้บุคคลอื่นนอกจากหน่วยงานตามมาตรา 7 โดยการ
ส่งออก…") · 3 อาวุธที่ขออนุญาต ตามผนวกบัญชีรายการที่แนบ · 4 จำนวนที่ขออนุญาต ·
**5 หน่วยงานผู้ซื้อ/ผู้รับอาวุธ** · 6 วัตถุประสงค์ · 7 ระยะเวลาการอนุญาต · 8 เอกสารหลักฐาน (ด้านหลัง)

**Pages 2–3 — 13 evidence items**, 1–11 essentially the same set as อ.9 transport
(จดทะเบียน / มอบอำนาจ / ผู้มีอำนาจลงนาม / ผู้รับมอบอำนาจ / รับรองการประกอบกิจการโรงงาน /
บัตรผู้เสียภาษี / ภ.พ.20 / คุณลักษณะอาวุธ / แผนที่โรงงาน / แผนผังโรงงาน / แผนการขนย้าย พ.ศ.2556),
then **12 "เอกสารขอผู้ซื้อ"** (includes the มหาดไทย explosive-move permit line) and
**13 เอกสารอื่น ๆ (ถ้ามี)**.

**Page 4** — annex table "แบบบัญชีรายการ วัตถุ/อาวุธที่ขออนุญาตขายหรือจำหน่ายอาวุธ โดยการส่งออกฯ".

## Data sources already identified (from the data dictionary — do not re-ask the human)
| Purpose | Table |
|---|---|
| **อ.14 request header** | **`T_T_REQUEST_SALE_INT`** ("ข้อมูลคำขออนุญาตขายหรือจำหน่ายอาวุธฯ โดยการส่งออกไปนอกราชอาณาจักร อ.14") |
| **อ.14 request detail** | **`T_T_REQUEST_DTL_SALE_INT`** |
| อ.16 licence detail | `T_T_LICENSE_DTL_SALE_INT` |
| Buyer/importer fields | dictionary shows `IMPORTER_NAME`, `IMPORTER_ADDRESS_NO`, `IMPORTER_CITY`, `IMPORTER_COUNTRY_CODE`, `EXPECTED_EXPORT_DATE`, `EXPORT_TRANSPORT_TYPE_CODE`, `EXPORT_DETAIL` — SA to confirm which table they sit on and which feed item 5 / the annex |

Reusable as-is from the delivered work: law references, approval signatures, persons items 3/4
(NULL-safe rule), the locked-structure + "blank never null" rules, the attachment tick rule
(`ATTACH_FILE_ID > 0` via the checklist join), and the item-12 permit blocks (มหาดไทย =
`T_T_REQUEST_MOI_MOVE_PERMIT`).

## Requirement
1. Produce the อ.14–อ.16 checklist report matching `A14-A16-form-official.pdf` — page 1 (8 items),
   pages 2–3 (13 evidence items incl. item 12 "เอกสารขอผู้ซื้อ"), signature block, annex table.
2. **Reuse the อ.9 engine/layout** (the stakeholder's standing instruction: same geometry/margins/gap
   conventions; structure locked in the report, not derived from the master table).
3. Evidence ticks bind via the checklist-id join + real attachment, exactly as อ.6/อ.9.
4. Missing data renders **blank — never the string "null"**; the signature block always prints its
   four slots.
5. Provide a `/preview/checklist/<form>/db/{requestId}` seam consistent with a6/a9 so it can be QA'd.

## Acceptance Criteria
- [ ] Rendered output matches the official PDF (item order, verbatim labels, (1)/(2) rows where the
      form has them, headings on both pages).
- [ ] Page-1 fields populate from the real อ.14 tables; annex table populates.
- [ ] Ticks reflect real attachments; no "null" anywhere; 4 signature slots always present.
- [ ] อ.6 and อ.9 reports are unaffected (no regression).

## Constraints
- Oracle 11.2-safe. `.jasper` regenerated into `src/main/resources` + `clean compile` before testing.
- Verify on the **real DB seam**, not only the mock preview (the lesson from อ.9's null leak).
- No DB writes by the team; schema facts from the data dictionary first, DATA REQUEST only if it
  genuinely lacks something.

## Open questions for SA to resolve (from the dictionary, before asking the human)
- Which checklist `GROUP_CODE` serves อ.14 (none of the known groups obviously matches — the data
  team may need to seed one, as with `ReqMove`/`ReqMoveDestroyer`).
- How an อ.14 request is identified/routed (FORM_ID? request type? which resolver path).
- Item-5 "หน่วยงานผู้ซื้อ/ผู้รับอาวุธ" source for the export case (IMPORTER_NAME?).

## Out of Scope
- **อ.4–อ.8 (นำเข้า)** — next after this; official form already filed as
  `project-docs/A4-A8-form-official.pdf` (17 evidence items, tables `T_T_REQUEST_IMPORT` +
  `T_T_REQUEST_DTL_PRODUCER` + `T_T_REQUEST_DTL_REF_IMPORT`).
- อ.15 (ขายในประเทศ) — dictionary marks `T_T_REQUEST_SALE_DOM` as "ระบบ PAMF ไม่ได้ใช้แล้ว".

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
