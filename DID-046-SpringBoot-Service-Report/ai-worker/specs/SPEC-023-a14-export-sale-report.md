# SPEC-023: อ.14–อ.16 checklist report (ขาย/จำหน่าย โดยส่งออกนอกราชอาณาจักร) — reuse the อ.9 engine

- Source: REQ-022 (human; Porter's survey + table map). อ.14 = คำขอ, อ.16 = หนังสืออนุญาต → one report
  code `"A14"` (same pair-shares-one-report pattern as อ.6/อ.7 and อ.9/อ.10).
- Status: ACTIVE (architecture + Porter's 3 open items resolved from the dictionary; 2 genuine data needs flagged)
- Human instruction (via Porter): structurally close to อ.9 transport — **reuse the อ.9 engine/geometry/
  locked-structure/blank-never-null/4-signature/tick rules**; only the content deltas differ.

## Reuse (from อ.9 transport, verbatim mechanics)
Model/record shape, JSON→Jasper pipeline, band geometry, `buildSignatures` (4 slots), evidence render
types (`EvidenceItem`/`EvidenceSub`/`employer`/person2), attachment-tick rule (`ATTACH_FILE_ID` present),
NULL-safe soft-delete (`STATUS IS NULL OR <>'D'`), Oracle-11.2-safe (List + take-N, no FETCH FIRST),
`blankWhenNull`. Evidence **items 1–11 are the same set** as อ.9 transport (per the official PDF).

## Delta 1 — routing / identification (Porter answered #1 — ARCHITECTURE FINDING)
**PROJECT FACT (Porter's SQL):** `T_T_REQUEST_SPECIAL` holds **only FORM_ID 6** (70 rows) — no 7/9/10/14/16.
**Every form family has its OWN request table carrying its own FORM_ID:** อ.6=`T_T_REQUEST_SPECIAL`(6),
อ.9=`T_T_REQUEST_MOVE`(9), **อ.14=`T_T_REQUEST_SALE_INT`(FORM_ID=14)**, อ.4=`T_T_REQUEST_IMPORT`.
- ⇒ **Do NOT add `case 14,16` to the `resolveFromSpecial` switch** (that path is a dead end for every
  family except อ.6). Route อ.14 by a **new per-family leg**: `resolveFromSaleInt(requestId)` — query the
  `T_T_REQUEST_SALE_INT` row; if present (FORM_ID 14/16) → `"A14"`. Add it to the resolver chain **before**
  the `REQUEST_TYPE` fallback, mirroring `resolveFromSpecial`.
- **Scope call (surgical):** add ONLY the SALE_INT leg for REQ-022. The general "each family has its own
  table" strategy is the right long-term shape (อ.4–8 will add an IMPORT leg the same way), but I am NOT
  refactoring the whole resolver under REQ-022 — each family adds its leg when that report is built.
- **Latent defect noted (NOT REQ-022 scope) → @Porter/REQ-014:** the existing `9/10 → A9` branch in
  `resolveFromSpecial` **can never match** (SPECIAL has no 9/10) — so the real `/download/checklist/{id}`
  cannot route a real อ.9 by this path (why it served mock อ.9). อ.9 should get the same MOVE-table leg.
  Track as a separate defect against REQ-014; don't fold into REQ-022.
- อ.14 QA samples (Porter): **27300 / 34380 / 35966 / 36711 / 36741**.

## Delta 2 — page-1 (mostly shared with อ.9 transport)
- **Heading** (`$F{documentTitle}`) = `หลักฐานที่ใช้ประกอบคำขอรับหนังสืออนุญาตขายหรือจำหน่ายอาวุธ โดยการส่งออกไปนอกราชอาณาจักร`.
- **item 2** (permitType) = `ขายและขนย้ายให้บุคคลอื่นนอกจากหน่วยงานตามมาตรา 7 โดยการส่งออกไปนอกราชอาณาจักร`.
- **item 5** label = `หน่วยงานผู้ซื้อ/ผู้รับอาวุธ` (same as อ.9 transport). **Value = `T_T_REQUEST_SALE_INT.BUYER_NAME`**
  (Porter open #3 → RESOLVED). `IMPORTER_NAME` is the *foreign importer* (item-12 / export context), not item 5.
  > Confirm on a real อ.14 sample (BUYER_NAME vs IMPORTER_NAME) during the build.
- items 1/3/4/6/7 = same sources as อ.9 (traderName, weapon-annex ref, count of detail rows, objective, duration).
- Header table = **`T_T_REQUEST_SALE_INT`**; detail (annex/page 4 + item-4 count) = **`T_T_REQUEST_DTL_SALE_INT`**;
  อ.16 licence detail = `T_T_LICENSE_DTL_SALE_INT`.

## Delta 3 — item 12 "เอกสารขอผู้ซื้อ" (export-specific; FULL, verbatim from the official PDF pp.2-3)
Complete ordered sub-item set (12 lines, then shared item 13):
1. `สำเนาหนังสือรับรองการจดทะเบียนเป็นนิติบุคคลของบริษัทผู้ซื้อ (วัน เดือน ปี ที่ออกไม่เกิน 6 ปี)` — **tick only** (NEW)
2. `หลักฐานการขอซื้ออาวุธที่ได้รับความเห็นชอบแล้วจากเจ้าหน้าที่รัฐบาลของประเทศผู้ซื้อ` — **tick only** (NEW)
3. `หนังสือมอบอำนาจ (กรณีผู้ซื้อมอบอำนาจให้ผู้อื่นดำเนินการแทน) ลงวันที่ _____` → `BUYER.ATTORNEY_BOOK_ISSUE_DATE`
4. `หนังสือรับรองผู้ใช้ปลายทาง (END-USER CERTIFICATE)` — **tick only** (NEW)
5. `สำเนาบัตรประชาชนผู้รับมอบอำนาจ เลขที่ _____ วันหมดอายุ _____` → `BUYER.ATTORNEY_ID_CARD_NO / _EXPIRY_DATE`
6. `ตัวอย่างลายมือชื่อผู้รับอาวุธ` (1)/(2) → person2 = `T_T_REQUEST_EXAMPLE_SIGN` (reuse `buildPerson2`)
7. `ตามหนังสือขอซื้อ` — เลขที่ _____ ลงวันที่ _____ → `BUYER.BUYER_DOC_NO / BUYER_DOC_DATE` (tick `BUYER_DOC_ATTACH_FILE_ID`)
8. `ภาพถ่ายสนามยิงปืนและช่องยิงปืน ฯ` — tick (checklist)
9. `ใบอนุญาตให้ซื้ออาวุธปืน หรือเครื่องกระสุนปืนส่วนบุคคล (แบบ ป.3) (กรณีเครื่องกระสุน)` — **(1)/(2)** ที่/ลง → `T_T_REQUEST_LICENSE_P3`
10. `สำเนาใบอนุญาต (แบบ ป.5) (กรณีวัตถุระเบิด) และใบอนุญาต (แบบ ป.5) ฉบับจริง เมื่อตรวจสอบแล้วให้บริษัท ฯ รับคืนไปได้` — **(1)/(2)** → `T_T_REQUEST_LICENSE_P5`
11. `สำเนาหนังสืออนุญาตให้ย้ายวัตถุระเบิดออกให้โดยกระทรวงมหาดไทย (กรณีวัตถุระเบิด)` — **(1)/(2)** → `T_T_REQUEST_MOI_MOVE_PERMIT`
12. `สำเนาใบอนุญาตตาม พ.ร.บ.ควบคุมยุทธภัณฑ์ พ.ศ.2530 (กรณีวัตถุระเบิด)` — **(1)/(2)** → `T_T_REQUEST_ARMS_CTRL_LICENSE`

Then `13. เอกสารอื่น ๆ (ถ้ามี)` (shared) + 4 signature slots (same as อ.9).
- **~80% reuses อ.9 sources** (BUYER ATTORNEY_*/BUYER_DOC_*, person2, the 4 permit entities from TASK-016) —
  most of `buildTransportItem12` is directly reusable; **drop** ส.ค.4/บัตรนายกสมาคม/คณะกรรมการ/แผนกระสุน;
  **add** the 3 tick-only NEW lines (#1/#2/#4).
- **3 NEW tick-only docs (#1/#2/#4):** no write-in values — ticks come from `T_T_REQUEST_DOC` under the
  seeded `ReqSaleInt` group (needs the SEQ→item map in the seed). No new entity needed.

## Delta 4 — checklist master GROUP_CODE (Porter open #1 → needs SEEDING)
Existing seeded groups (ReqMove/ReqMoveDestroyer/ReqOpen/ReqExpand/ReqPersonChange/ReqPlantChange/ReqSpecial)
have **no export-sale group**. อ.14 ticks need a new `T_S_REQUEST_CHECKLIST` GROUP_CODE **seeded by the
data team** (same as อ.9 needed `ReqMove`). Proposed name: **`ReqSaleInt`**. Until seeded → all ticks false
(graceful), report still renders (locked structure). → **DATA REQUEST / seed-spec to the data team**
(mirror SPEC-016): confirm the GROUP_CODE name + provide the SEQ→item map, then backfill
`T_T_REQUEST_DOC.REQUEST_CHECKLIST_ID`.

## Not building
- **อ.15** (`T_T_REQUEST_SALE_DOM`) — dictionary marks it "ระบบ PAMF ไม่ได้ใช้แล้ว"; skip unless asked.
- อ.4–อ.8 (import) = the next report after this (Porter's note), separate REQ.

## Phased plan (proven อ.9 split)
- **TASK-A (foundation):** new report skeleton `checklist/a14` (ReportDefinition `A14` + documentTitle,
  model, builder, jrxml mirrored from a9 geometry, ReportResourceService + JasperPdfReportService +
  DocumentController wiring), resolver `case 14,16→"A14"`, page-1 (heading/item2/item5=BUYER_NAME/1,3,4,6,7),
  evidence items 1–11 + signature + annex from `SALE_INT`/`DTL_SALE_INT`; item-12 blank placeholder;
  ticks graceful (group unseeded). DB-free preview-verifiable.
- **TASK-B (item 12 export):** the "เอกสารขอผู้ซื้อ" sub-items above once the NEW-doc sources + PDF tail confirmed.
- **Seed (parallel, data team):** `ReqSaleInt` checklist master + doc backfill.

## Open items
1. ✅ **Routing — ANSWERED** (Porter): per-family table; อ.14 = SALE_INT.FORM_ID=14 → `resolveFromSaleInt` leg (Delta 1).
2. ⏳ **Seed `ReqSaleInt`** checklist master (data team) — Porter owns; he produces the hand-off once the
   item-12 sub-items are pinned. **They are now pinned (Delta 3)** — the seed needs SEQ rows incl. the 3
   NEW tick-only docs (#1 buyer company reg, #2 govt approval, #4 END-USER CERT) + the shared evidence
   items 1–11 + item-12 permit/doc lines. Ticks render blank-but-correct until seeded (graceful).
(Resolved, no ask: item-5 = SALE_INT.BUYER_NAME; header/detail tables; item-1..11 reuse; full item-12 labels+sources.)

## Tasks
- **TASK-018 (foundation) — ready to write/start now:** report skeleton + `resolveFromSaleInt` routing leg +
  page-1 + evidence 1–11 + signature + annex from SALE_INT/DTL_SALE_INT; item-12 blank; graceful ticks.
- **TASK-019 (item 12 export):** the pinned Delta-3 sub-items (reuse most of `buildTransportItem12`; drop
  ส.ค.4/คณะกรรมการ/แผนกระสุน; add the 3 tick-only NEW lines). Can follow TASK-018 immediately (labels+sources
  all pinned; only the `ReqSaleInt` SEQ map for the 3 new ticks depends on the seed).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
