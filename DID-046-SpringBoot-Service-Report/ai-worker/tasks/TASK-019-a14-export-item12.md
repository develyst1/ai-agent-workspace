# TASK-019: อ.14 item 12 "เอกสารขอผู้ซื้อ" — export sub-set (a14 builder)

- Source: SPEC-023 Delta 3 (REQ-022), pinned verbatim from `project-docs/A14-A16-form-official.pdf` (pp.2-3).
  Follow-up to TASK-018 (a14 foundation, DONE — item-12 is currently a blank placeholder).
- Status: DONE (Sober-reviewed, preview independently verified)
- Assignee: Jason (BE)
- Depends on: TASK-018 (a14 builder + the shared permit/BUYER/EXAMPLE_SIGN entities from TASK-016 exist).
- ⚠️ **This is NOT a copy of the อ.9 transport item-12.** The export set differs — same helper *sources*,
  different *order + labels*, drops some lines, adds 3 new tick-only docs. Build a lean a14-specific method.
- ⚠️ Only fills the a14 item-12 body; a14 page-1/evidence 1-11/signatures/annex (TASK-018/022) unchanged.
  Locked structure + blank-never-null; Oracle-11.2-safe (List + take-2, no FETCH FIRST).

## The official a14 item-12 order + labels (verbatim; header = `12. เอกสารขอผู้ซื้อ`)
1. `สำเนาหนังสือรับรองการจดทะเบียนเป็นนิติบุคคลของบริษัทผู้ซื้อ (วัน เดือน ปี ที่ออกไม่เกิน 6 ปี)` — **tick only** (NEW)
2. `หลักฐานการขอซื้ออาวุธที่ได้รับความเห็นชอบแล้วจากเจ้าหน้าที่รัฐบาลของประเทศผู้ซื้อ` — **tick only** (NEW)
3. `หนังสือมอบอำนาจ (กรณีผู้ซื้อมอบอำนาจให้ผู้อื่นดำเนินการแทน) ลงวันที่ _____` → `BUYER.ATTORNEY_BOOK_ISSUE_DATE`
4. `หนังสือรับรองผู้ใช้ปลายทาง (END-USER CERTIFICATE)` — **tick only** (NEW)
5. `สำเนาบัตรประชาชนผู้รับมอบอำนาจ เลขที่ _____ วันหมดอายุ _____` → `BUYER.ATTORNEY_ID_CARD_NO / _EXPIRY_DATE`
6. `ตัวอย่างลายมือชื่อผู้รับอาวุธ` (1)/(2) → person2 = `T_T_REQUEST_EXAMPLE_SIGN` (reuse the buildPerson2 logic)
7. `ตามหนังสือขอซื้อ` — เลขที่ _____ ลงวันที่ _____ → `BUYER.BUYER_DOC_NO / BUYER_DOC_DATE` (tick `BUYER_DOC_ATTACH_FILE_ID`)
8. `ภาพถ่ายสนามยิงปืนและช่องยิงปืน ฯ` — tick (checklist)
9. `ใบอนุญาตให้ซื้ออาวุธปืน หรือเครื่องกระสุนปืนส่วนบุคคล (แบบ ป.3) (กรณีเครื่องกระสุน)` — **(1)/(2)** ที่/ลง → `T_T_REQUEST_LICENSE_P3`
10. `สำเนาใบอนุญาต (แบบ ป.5) (กรณีวัตถุระเบิด) และใบอนุญาต (แบบ ป.5) ฉบับจริง เมื่อตรวจสอบแล้วให้บริษัท ฯ รับคืนไปได้` — **(1)/(2)** → `T_T_REQUEST_LICENSE_P5`
11. `สำเนาหนังสืออนุญาตให้ย้ายวัตถุระเบิดออกให้โดยกระทรวงมหาดไทย (กรณีวัตถุระเบิด)` — **(1)/(2)** → `T_T_REQUEST_MOI_MOVE_PERMIT`
12. `สำเนาใบอนุญาตตาม พ.ร.บ.ควบคุมยุทธภัณฑ์ พ.ศ.2530 (กรณีวัตถุระเบิด)` — **(1)/(2)** → `T_T_REQUEST_ARMS_CTRL_LICENSE`

Then `13. เอกสารอื่น ๆ (ถ้ามี)` (shared, unchanged).

## vs the อ.9 transport item-12 (so you don't copy the wrong one)
- **DROP (not on the export form):** ส.ค.4 + its 2 sub-lines, บัตรนายกสมาคม/ผู้มอบอำนาจ, ตามหนังสือคณะกรรมการฯ พ.ศ.2553, แผนการใช้กระสุนปืน.
- **ADD (export only, tick-only):** #1 buyer company registration, #2 govt-approval evidence, #4 END-USER CERTIFICATE.
- **KEEP (same sources as transport):** มอบอำนาจ/ลงวันที่, บัตรผู้รับมอบ, person2, ขอซื้อ, ภาพถ่ายสนามยิง, ป.3/ป.5/มท./ยุทธภัณฑ์ ((1)/(2) rows).

## Code
- In `A14CheckListReportBuilder`, inject the shared domain repos created in TASK-016 (`RequestBuyerRepository`,
  `RequestLicenseP3/P5Repository`, `RequestArmsCtrlLicenseRepository`, `RequestMoiMovePermitRepository`) +
  the EXAMPLE_SIGN repo. Write `buildExportItem12(requestId, checkedIds, ...)` producing the ordered list
  above; replace TASK-018's blank item-12 body with it.
- Values inline (`nz(...)`, blank never "null"); tick = `attachFileId != null && > 0` per row; permits emit
  **both** `(1)` and `(2)` rows (list index 0/1, blank row when absent) — same pattern as TASK-017.
- **The 3 NEW tick-only docs (#1/#2/#4)** have no write-in values; their ticks come from `T_T_REQUEST_DOC`
  under the **`ReqSaleInt`** checklist group (TASK-018's master). That group is **not seeded yet** → ticks
  render **blank/unticked (graceful)** until Porter's data-team seed lands. That is correct, not a defect —
  do NOT block on the seed.

## Verify — DB-free (BE) then real DB (QA)
- BE (`A14PreviewTest` mock): extend the a14 transport-style mock with BUYER/P3/P5/MOI/ARMS rows + person2 →
  item-12 shows the full ordered export label set; ป.3/ป.5/มท./ยุทธภัณฑ์ each show `(1)` and `(2)`; the 3
  NEW docs print with (blank) tick; **no "null"**; a9 destroy/transport item-12 unchanged. test-compile +
  A6/A9/A14 PreviewTests green; regenerate `.jasper`.
- QA (real DB, via Porter): `/a14/db/{27300|34380|35966|36711|36741}` → item-12 "เอกสารขอผู้ซื้อ" populated
  from the tables; the 3 NEW ticks blank until `ReqSaleInt` seeded.

## Definition of Done
- [ ] a14 item-12 renders the 12-line export set in the official order/labels (verbatim); header "เอกสารขอผู้ซื้อ".
- [ ] Sources wired (BUYER ATTORNEY_*/BUYER_DOC_*, person2, P3/P5/MOI/ARMS (1)/(2)); 3 NEW docs = tick-only.
- [ ] Blank (never "null") when a row/field absent; a9 item-12 + a14 page-1/evidence/sig/annex unchanged.
- [ ] test-compile + PreviewTests green; `.jasper` regenerated.

## Handoff after DoD
Back to **Sober** for review, then QA on a real a14 sample. (The 3 NEW-doc ticks close only after Porter's
`ReqSaleInt` seed — that is REQ-022's remaining data leg, not this task.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Implementation Notes
Filled the a14 item-12 export body (a14-specific, NOT the อ.9 transport copy). **Files: A14 builder +
A14 preview** (a9 item-12 + a14 page-1/evidence/sig/annex untouched).
- `A14CheckListReportBuilder`: injected the 6 shared repos (Buyer, LicenseP3/P5, ArmsCtrl, MoiMovePermit,
  ExampleSign); new **`buildExportItem12(requestId, checkedIds, mid)`** in the official order/labels:
  #1 นิติบุคคลผู้ซื้อ (tick-only), #2 govt-approval evidence (tick-only), #3 มอบอำนาจ/ลงวันที่ (BUYER),
  #4 END-USER CERTIFICATE (tick-only), #5 บัตรผู้รับมอบ (BUYER), #6 person2 (EXAMPLE_SIGN, reused
  buildPerson2), #7 ตามหนังสือขอซื้อ (BUYER + tick), #8 ภาพถ่ายสนามยิงปืน (checklist tick), #9-12 ป.3/ป.5/
  มท./ยุทธภัณฑ์ (header + both (1)/(2), blank when absent). **DROPPED** vs อ.9: ส.ค.4+2 sub-lines,
  บัตรนายกสมาคม, คณะกรรมการฯ2553, แผนการใช้กระสุน. Header = **"เอกสารขอผู้ซื้อ"** (verbatim; see Q2).
  Values inline `nz(...)` → blank-never-null; tick = attachFileId>0.
- A14 mock item-12 extended to match (DB-free proof).
- Added helpers to the a14 builder (buildPerson2, exampleSignTypeLabel, addLicenseRows, employer,
  idCardLine/docDateLine/refNoDate, hasId, LicRow) — self-contained, no a9 coupling.

**Verify:** `test-compile` → BUILD SUCCESS; **app boots clean** (6 new repo injections validate); A14+A9+A6
PreviewTests → Tests run: 3, Failures: 0 (a14 pages=4). PyMuPDF on `a14-preview.pdf`: #1 นิติบุคคลผู้ซื้อ
present; **END-USER CERTIFICATE** (NEW) present; ป.3 verbatim + **(1)×4 (2)×4** rows; **dropped items
(ส.ค.4 / คณะกรรมการ2553 / แผนกระสุน) ABSENT**; **no "null"**. a9 destroy item-12 nine subs intact (no regression).
@Sober: ready for review. QA (real DB): `/a14/db/{27300|34380|...}` → item-12 export set populated; the 3
NEW-doc ticks blank until Porter's `ReqSaleInt` seed (graceful, expected).

## Questions
- **Q1 (checklist-tick SEQ mapping — provisional):** the 4 checklist-tick lines (#1/#2/#4 NEW + #8 ภาพถ่าย)
  bind to the `ReqSaleInt` master by **provisional indices mid.apply(12..15)** (continuing after evidence
  1-11). Master is unseeded → all render blank (graceful). When the data team seeds `ReqSaleInt`, the exact
  SEQ→line mapping must match; please pin the seed order (I'll align the indices then).
- **Q2 (header text):** used **"เอกสารขอผู้ซื้อ"** verbatim per the task (differs from อ.9's "เอกสารของผู้ซื้อ").
  If that's a PDF-transcription typo and should be "ของ", it's a one-line change — confirm.

## Answers + Review
**Q1 (ReqSaleInt SEQ mapping):** > answer: Provisional `mid.apply(12..15)` is fine — the master is unseeded
so all four render blank/graceful, no harm. I'll provide the authoritative **ReqSaleInt SEQ→line map**
(evidence 1-11 + the item-12 checklist-tick lines #1/#2/#4/#8) as part of Porter's seed hand-off (like
SPEC-016 did for ReqMove); align your `mid.apply()` indices to that when it lands — small change, not now.
**Q2 (header "เอกสารขอผู้ซื้อ"):** > answer: Keep it verbatim — it's what the official A14 PDF prints, and the
locked-structure / "เอาให้เหมือนฟอร์ม" rule means we match the form even if it reads like a typo (vs อ.9's
"ของผู้ซื้อ"). I'm flagging it to Porter as a probable official-form typo for the human to rule on; do NOT
change it unilaterally.

**Verdict: DONE** (Sober, 2026-08-18). Independently verified — read `buildExportItem12` + rendered a14/a9 previews (no DB):
- Header `ITEM12_TITLE = "เอกสารขอผู้ซื้อ"`; `buildExportItem12` wired at item "12"; 6 shared repos injected. ✅
- Preview: #1 นิติบุคคลของบริษัทผู้ซื้อ + #4 **END-USER** present; ป.3/ยุทธภัณฑ์ + (1)/(2) rows; **dropped items
  (ส.ค.4/คณะกรรมการ/แผนกระสุน/นายกสมาคม) ABSENT** → export set, not the a9-transport copy; **no "null"**. ✅
- a9 item-12 nine subs intact (no regression); A14+A9+A6 PreviewTests green; a14 page-1/evidence/sig/annex untouched. ✅
- 3 NEW-doc ticks blank until Porter's `ReqSaleInt` seed (graceful, expected) — REQ-022's remaining data leg.
