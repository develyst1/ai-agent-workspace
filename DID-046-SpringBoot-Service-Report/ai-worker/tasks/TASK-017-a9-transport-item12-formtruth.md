# TASK-017: อ.9 TRANSPORT item-12 form-truth fixes (order + verbatim labels + ส.ค.4 sub-lines + (1)/(2) rows)

- Source: SPEC-022 + Porter's form-truth review of `/a9/db/38336` vs `project-docs/A9-form-TRANSPORT-official.pdf`.
  Sober re-read the official PDF (pages 1-3) and confirmed all four mismatches verbatim.
- Status: DONE (Sober-reviewed, previews independently verified)
- Assignee: Jason (BE)
- Depends on: TASK-016 (transport item-12 body + the 5 entities/repos exist and are wired)
- ⚠️ Transport branch only (`else`); destroy item-12 unchanged. Locked-structure: labels **verbatim** from
  the official PDF; write-in values blank when absent, never "null". No new data sources needed (all rows
  already come from TASK-016's tables); this is order + labels + row-count.

## The official item-12 order + verbatim labels (from the PDF — use EXACTLY)
Render the transport item-12 sub-items in **this order** (currently ส.ค.4 is 7th — move it FIRST, etc.):

1. `สำเนาใบสำคัญแสดงการจดทะเบียนสมาคมยิงปืน (ส.ค.4)` — tick = ReqMove **SEQ13** (existing path). **+2 sub-lines:**
   - `ชื่อนายกสมาคม _____ และประกาศนายทะเบียนสมาคม ฯ (กรณีผู้ซื้อเป็นสมาคม)`
   - `สำเนาบัตรประจำตัวประชาชนของนายกสมาคม _____ วันหมดอายุ _____`
2. `หนังสือมอบอำนาจ (กรณีผู้ซื้อมอบอำนาจให้ผู้อื่นดำเนินการแทน) ลงวันที่ _____`
3. `สำเนาบัตรประชาชนนายกสมาคม/ผู้มอบอำนาจ เลขที่ _____ วันหมดอายุ _____`
4. `สำเนาบัตรประชาชนผู้รับมอบอำนาจ เลขที่ _____ วันหมดอายุ _____`
5. `ตัวอย่างลายมือชื่อผู้รับอาวุธ` — (1)/(2) ชื่อ-สกุล + สำเนาบัตรประจำตัวประชาชน เลขที่/วันหมดอายุ  → **buildPerson2** (unchanged)
6. `ตามหนังสือขอซื้อ` — เลขที่ _____ ลงวันที่ _____
7. `ตามหนังสือคณะกรรมการตามกฎกระทรวงการมีและใช้อาวุธปืน เครื่องกระสุนปืน วัตถุระเบิด ดอกไม้เพลิง และสิ่งเทียมอาวุธปืน ของหน่วยราชการและรัฐวิสาหกิจ และการมอบให้ประชาชนมีและใช้เพื่อช่วยเหลือราชการ พ.ศ. ๒๕๕๓` — เลขที่ _____ ลงวันที่ _____
8. `แผนการใช้กระสุนปืน ฯ` — tick = ReqMove **SEQ14**
9. `ภาพถ่ายสนามยิงปืนและช่องยิงปืน ฯ` — tick = ReqMove **SEQ15**
10. `ใบอนุญาตให้ซื้ออาวุธปืน หรือเครื่องกระสุนปืนส่วนบุคคล (แบบ ป.3) (กรณีเครื่องกระสุน)` — **(1)/(2)** ที่/ลง
11. `สำเนาใบอนุญาต (แบบ ป.5) (กรณีวัตถุระเบิด) และใบอนุญาต (แบบ ป.5) ฉบับจริง เมื่อตรวจสอบแล้วให้บริษัท ฯ รับคืนไปได้` — **(1)/(2)** ที่/ลง
12. `สำเนาหนังสืออนุญาตให้ย้ายวัตถุระเบิดออกให้โดยกระทรวงมหาดไทย (กรณีวัตถุระเบิด)` — **(1)/(2)** ที่/ลง
13. `สำเนาใบอนุญาตตาม พ.ร.บ.ควบคุมยุทธภัณฑ์ พ.ศ.2530 (กรณีวัตถุระเบิด)` — **(1)/(2)** ที่/ลง

(Then `13. เอกสารอื่น ๆ (ถ้ามี)` — the shared item, unchanged.)

## The four fixes
1. **ORDER** — reorder as above (ส.ค.4 first). Data sources per line are unchanged from TASK-016
   (BUYER / P3 / P5 / MOI / ARMS_CTRL / EXAMPLE_SIGN / DOC-TYPE22), only the sequence + labels change.
2. **ส.ค.4 sub-lines (new):**
   - ID-card sub-line → `T_T_REQUEST_BUYER.ASSOC_PRES_ID_CARD_NO` / `ASSOC_PRES_ID_CARD_EXPIRY_DATE`
     (already on `RequestBuyerEntity`).
   - `ชื่อนายกสมาคม _____` name → best-effort `BUYER.PERSON_NAME_PREFIX/PERSON_NAME/PERSON_SURNAME`; if that
     is the buyer-contact rather than the association president, leave the name **blank** (write-in) and
     flag — do NOT invent. "ประกาศนายทะเบียนสมาคม" has no column → static label only (blank write-in).
3. **Verbatim labels** — replace the abbreviated labels with the exact strings above (locked-structure rule).
4. **(1)/(2) two rows** — ป.3, ป.5, มหาดไทย, ยุทธภัณฑ์ each render **two numbered rows** `(1) ที่ ___ ลง ___`
   / `(2) ที่ ___ ลง ___`, filled from the repo list (index 0 → (1), index 1 → (2); **blank row when absent**,
   never "null"). The repos already return up to 2 rows (List, no FETCH FIRST) — emit both slots as locked structure.

## Blank-vs-bug check (Porter flagged)
On 38336 all item-12 values were blank. Before shipping, confirm (QA leg, real DB) whether 38336 actually
has rows in LICENSE_P3/P5/ARMS_CTRL/MOI/BUYER(doc,committee). The builder already reads these repos
(verified in TASK-016 review), so **if a request has rows and they still render blank → wiring bug** to
fix here; if the tables are genuinely empty for 38336, blank is correct. Ask QA for a transport request
that has permit rows to prove the populated path.

## Verify — DB-free (BE) then real DB (QA)
- BE (A9PreviewTest transport mock): set sample rows so ส.ค.4 is first with its 2 sub-lines; ป.3/ป.5/มท./
  ยุทธภัณฑ์ each show **(1) and (2)**; labels match the PDF verbatim; no "null"; destroy item-12 unchanged.
  test-compile + A9PreviewTest green; regenerate `.jasper`. (Page count 4→5 is expected.)
- QA (real DB, via Porter): `/a9/db/38336` (+ a request with real permit rows) — item-12 order/labels match
  the official PDF; (1)/(2) rows populate where data exists; destroy request unchanged.

## Definition of Done
- [ ] Transport item-12 order = the 13-block sequence above (ส.ค.4 first).
- [ ] ส.ค.4 shows its 2 sub-lines (ID-card wired to ASSOC_PRES_ID_CARD_*; name blank-safe/flagged).
- [ ] All labels verbatim from the official PDF (locked structure).
- [ ] ป.3/ป.5/มท./ยุทธภัณฑ์ each render (1) and (2) rows; blank when absent, never "null".
- [ ] Destroy item-12 unchanged; test-compile + A9PreviewTest green; `.jasper` regenerated.

## Implementation Notes
Transport branch only (`else`); destroy item-12 untouched. **Files:** `A9CheckListReportBuilder`
(`buildTransportItem12` reordered/relabelled) + `A9CheckListPreviewBuilder` (transport mock item-12) +
regen `.jasper`. No new data sources (TASK-016's tables reused); order/labels/row-count only.
- **Fix 1 ORDER:** rebuilt in the official 13-block sequence — **ส.ค.4 first** (SEQ13), then มอบอำนาจ,
  บัตร นายกสมาคม/ผู้มอบ, บัตร ผู้รับมอบ, person2, ขอซื้อ, คณะกรรมการ(2553), แผนกระสุน(SEQ14), ภาพถ่าย(SEQ15),
  ป.3, ป.5, มหาดไทย, ยุทธภัณฑ์.
- **Fix 2 ส.ค.4 sub-lines:** added the 2 sub-lines; ID-card sub-line wired to `BUYER.ASSOC_PRES_ID_CARD_NO/
  _EXPIRY_DATE`; "ชื่อนายกสมาคม _____" left as a **blank write-in** (no confirmed column — not invented; see Q1).
- **Fix 3 verbatim labels:** all sub-item labels replaced with the exact official-PDF strings.
- **Fix 4 (1)/(2) rows:** ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์ now render a doc-name header + **both** `(1) ที่ ___ ลง ___`
  and `(2) ที่ ___ ลง ___` always (index 0→(1), 1→(2)); **blank row when absent, never "null"** (tick =
  ATTACH_FILE_ID>0 per row).

**Verify (DB-free):** `test-compile` → BUILD SUCCESS; A9+A6 PreviewTests → Tests run: 2, Failures: 0.
Transport mock updated to the new order/labels/(1)(2). PyMuPDF on `a9-transport-preview.pdf` (now **5
pages**, expected): within item-12 **ส.ค.4 is first** (idx 96 < มอบอำนาจ 99 < ป.3 112 < ยุทธภัณฑ์ 121);
verbatim ป.3 label present; **(1) ×5 and (2) ×5** rows present (empty (2) slots render blank); **no "null"**.
**Destroy unchanged:** `a9-preview.pdf` item-12 nine subs intact, no "null".
@Sober: ready for review. QA (real DB): `/a9/db/38336` + a request with real permit rows → item-12 order/
labels match the official PDF; (1)/(2) populate where data exists.

## Questions
- **Q1 (ชื่อนายกสมาคม name — blank write-in):**
  > answer: Correct to leave it blank. I re-checked the `T_T_REQUEST_BUYER` columns in the data dictionary —
  > there is **no dedicated association-president *name* column** (`ASSOC_PRES_*` covers only the ID card
  > no/issue/expiry). `PERSON_NAME_*` is the generic buyer person and is NOT confirmed = the นายกสมาคม, so
  > do not wire it. **Blank write-in stands.** If Porter later confirms PERSON_NAME should fill it for the
  > association case, that's a one-line follow-up — not now.
- **Q2 (blank-vs-bug on 38336):**
  > answer: Agreed — routed to Porter/QA. The builder reads all 5 repos (verified), so blank = genuinely no
  > rows for 38336 (correct) unless QA finds a transport request WITH permit rows that still renders blank.
  > QA to supply a permit-bearing transport requestId for the populated-path proof; not a code blocker here.

## Review
**Verdict: DONE** (Sober, 2026-08-18). Independently verified — re-read `buildTransportItem12` + rendered
both previews from mock (A9PreviewTest, no DB):
- **Order:** ส.ค.4 is **first**, then มอบอำนาจ < ป.3 < ยุทธภัณฑ์ (index order confirmed) — matches the official PDF. ✅
- **ส.ค.4 sub-lines:** present (นายกสมาคม ID-card sub-line renders; name blank write-in per Q1). ✅
- **Verbatim labels:** the full official ป.3 string (and the rest) present. ✅
- **(1)/(2) rows:** ป.3/ป.5/มท./ยุทธภัณฑ์ each render both numbered slots (blank (2) when absent). ✅
- **No "null"** in transport; **destroy item-12 unchanged** (9 subs intact, no null). Page 4→5 expected. ✅
- test-compile + A9/A6 PreviewTests green; `.jasper` regenerated.
- REQ-019 transport is now form-accurate; remaining = QA populated-path proof (Q2) + Porter's final eyeball.
