# SPEC-016: Investigate the อ.9 data model before building the A9 report

- Source: REQ-016
- Status: DONE — RESOLVED by sample 33630 + the human business ruling (see "RESOLUTION" at bottom)

## Why (recap)
REQ-014 assumed อ.9 = the a6 document model; the DATA REQUESTs disproved it: **no อ.9 checklist
group, no `T_T_REQUEST_DOC` rows for 37940, no `T_T_REQUEST_SPECIAL` row** — อ.9's payload is in
`T_T_REQUEST_MOVE` (FORM_ID 9). We cannot design the evidence section from a sample that has none.

## What I can pin now (from code + the DR data already in hand)
The อ.9 report body = the `A9CheckListReportData` record. Field inventory + current source status:
| อ.9 section | source status |
|---|---|
| applicant.name / itemCount / objective | likely reuse a6 (`T_T_REQUEST` / COUNT `T_T_REQUEST_DTL`) — **confirm on a complete sample** |
| **applicant.destroyLocation** | ✅ `T_T_REQUEST_MOVE.DEST_PLACE_NAME` (+ DEST_* address) |
| permitDuration (item 7, if present) | `T_T_LICENSE.PERIOD_TEXT` (REQ-005) — confirm อ.9 has item 7 |
| lawReferences | likely `T_T_REQUEST_LAW_REF` — confirm |
| approvalSignatures | likely `T_T_LICENSE_INFORM` — confirm |
| components/annex | likely `T_T_REQUEST_DTL` + `T_M_UNIT` — confirm |
| **evidences (13 items + item 12 (1)-(9))** | ❓ **NO source found** — the core unknown (a/b/c below) |
| **item 12 (2) person2 (ผู้รับอาวุธ)** | ❓ 37940 has only PER_TYPE 1/2 (= items 3/4); no receiver |
| persons items 3/4 | `T_T_REQUEST_PER` PER_TYPE 1/2 + the **NULL-safe** rule (REQ-015) |

## The core question — where do อ.9's 13 evidence items + ticks come from?
- **(a) seed a checklist master for อ.9** (human/DBA writes `T_S_REQUEST_CHECKLIST` + the request's
  `T_T_REQUEST_DOC`). We don't write DBs → this is human work and would gate the build.
- **(b) fixed labels in the report + ticks by `DOCUMENT_ID`** — but 37940 has 0 docs → all false;
  only decidable on a request that actually has documents.
- **(c) not document-driven** — evidence derives from `T_T_REQUEST_MOVE` columns.
All three are undecidable from 37940 alone (no docs, no special row, NULL persons → looks incomplete).

## Open ask to the human (Porter to collect) — this is the blocker
1. A **complete/representative อ.9 request id** — one that HAS its documents attached and (if the
   form needs it) a receiver person. Then run, into `project-docs/` (PII, gitignored):
   ```sql
   SELECT * FROM T_T_REQUEST_MOVE WHERE REQUEST_ID = :completeA9Id;   -- full page-1 payload
   SELECT ID, REQUEST_CHECKLIST_ID, DOCUMENT_ID, DOCUMENT_TYPE, DOCUMENT_NAME,
          ATTACH_FILE_ID, STATUS FROM T_T_REQUEST_DOC WHERE REQUEST_ID = :completeA9Id;
   SELECT ID, PER_TYPE, STATUS FROM T_T_REQUEST_PER  WHERE REQUEST_ID = :completeA9Id;
   ```
   **OR**
2. A statement of the **อ.9 evidence business model** — what the 13 items are meant to be ticked
   from (a master group name, a DOCUMENT_ID set, or MOVE columns).
Also confirm: **is 37940 complete or a draft/incomplete request?**

## Deliverable when unblocked
The อ.9 field-by-field source map (SPEC-008 equivalent) + the evidence-model answer (a/b/c) +
person2 source + a go/no-go and shape for REQ-014. Until then, **no build** — building อ.9 pages
2–3 now would be guesswork.

## Tasks
- None (investigation; no BE work until the sample/model lands).

## Questions
- **@Porter:** please get the human either a complete อ.9 sample (with the 3 queries above) or the
  evidence business model, and confirm whether 37940 is incomplete. That unblocks REQ-016 → REQ-014.

---

# RESOLUTION (2026-08-05) — go/no-go = **GO**

## Answer to the core question
**อ.9 uses the SAME data model as อ.6** (human ruling + sample 33630 = 14 doc rows).
- Evidence = `T_S_REQUEST_CHECKLIST` master group + `T_T_REQUEST_DOC.REQUEST_CHECKLIST_ID` binding
  + REQ-009 real-attachment tick — identical to อ.6.
- The things we saw as "missing" (no อ.9 GROUP_CODE, NULL `REQUEST_CHECKLIST_ID`, NULL
  `ATTACH_FILE_ID` on 33630) are **data the data team has not seeded/backfilled yet — NOT a
  different design.** Do NOT invent a DOCUMENT_ID-based mechanism and do NOT hardcode ids.
- **37940 was an incomplete request** (edge case). **Primary sample = 33630.**

## Field-source map (SPEC-008 equivalent for อ.9)
| อ.9 section | source | note |
|---|---|---|
| applicant block (page 1) | **`T_T_REQUEST_MOVE`** (FORM_ID 9) | อ.9 payload table, not T_T_REQUEST_SPECIAL |
| applicant.destroyLocation | `T_T_REQUEST_MOVE.DEST_PLACE_NAME` (+ DEST_* address) | ✅ |
| applicant.name/objective, itemCount | `T_T_REQUEST` / COUNT `T_T_REQUEST_DTL` | reuse a6 |
| lawReferences | `T_T_REQUEST_LAW_REF` | reuse a6 |
| approvalSignatures | `T_T_LICENSE_INFORM` | reuse a6 |
| permitDuration (if the a9 form has item 7) | `T_T_LICENSE.PERIOD_TEXT` (REQ-005) | reuse a6 |
| components/annex | `T_T_REQUEST_DTL` + `T_M_UNIT` | reuse a6 |
| persons items 3/4 | `T_T_REQUEST_PER` PER_TYPE 1/2, **NULL-safe rule (REQ-015)** | reuse a6 |
| evidences (13 items) | `T_S_REQUEST_CHECKLIST` (group below) + `T_T_REQUEST_DOC` by `REQUEST_CHECKLIST_ID` + REQ-009 tick | mirror a6 |
| item 12 (2) person2 (ผู้รับอาวุธ) | `T_T_REQUEST_PER` — **PER_TYPE TBD** (33630/37940 had only 1/2) | see open item |

## Graceful degradation (CONFIRMED in the design — answers Porter Q2)
While the data team has not seeded the อ.9 master / backfilled `REQUEST_CHECKLIST_ID` /
`ATTACH_FILE_ID`, the builder must **degrade, never throw**:
- master group lookup returns empty → evidence labels blank / items render with no master text;
- NULL `REQUEST_CHECKLIST_ID` / NULL attachment → boxes **unticked**;
- **an empty อ.9 evidence section right now is CORRECT behavior, not a defect.**
E2E verification of อ.9 pages 2–3 is **gated on the data team seeding** — a human-side dependency,
not a code blocker. The applicant block (T_T_REQUEST_MOVE), persons, law refs, signatures,
components are verifiable now.

## "PLEASE SEED THIS" spec for the data team (answers Porter Q1)
**Proposed `GROUP_CODE = 'ReqMove'`** (the อ.9 analogue of อ.6's `'ReqSpecial'`; อ.9 = ขาย/ขนย้าย).
The code will look up this exact constant — the data team must seed rows with GROUP_CODE spelled
exactly this way (confirm the name with them; if they prefer another, tell me and I'll set the constant).
Seed `T_S_REQUEST_CHECKLIST` rows (IS_ACTIVE=1), one per **tickable document line**, in SEQ order;
then backfill each request's `T_T_REQUEST_DOC.REQUEST_CHECKLIST_ID` to the matching row id.
Persons (items 3/4, and 12(2)) are NOT master — they come from `T_T_REQUEST_PER`.

| SEQ | อ.9 form item | CODE_NAME (label) |
|---|---|---|
| 1 | item 1 | สำเนาหนังสือรับรองการจดทะเบียนฯ (มีอายุไม่เกิน 6 เดือน) |
| 2 | item 2 | หนังสือมอบอำนาจ |
| 3 | item 5 · ร.ง.4 | สำเนาใบอนุญาตประกอบกิจการโรงงาน (ร.ง.4) |
| 4 | item 5 · อ.2 | สำเนาใบอนุญาตประกอบกิจการโรงงานทำอาวุธ (แบบ อ.2) |
| 5 | item 5 · อ.7 | สำเนาหนังสืออนุญาต (แบบ อ.7) |
| 6 | item 5 · เปิดดำเนินการ | สำเนาหนังสืออนุญาตให้เปิดดำเนินการผลิตอาวุธ |
| 7 | item 6 | สำเนาบัตรประจำตัวผู้เสียภาษีของนิติบุคคล |
| 8 | item 7 | ใบทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20) |
| 9 | item 8 | สำเนาเอกสารแสดงคุณลักษณะและคุณสมบัติของอาวุธ |
| 10 | item 9 | แผนที่แสดงสถานที่ตั้งโรงงาน ฯ |
| 11 | item 10 | แผนผังโรงงาน |
| 12 | item 11 | แผนการขนย้าย (มาตรการฯ พ.ศ.2556) |
| 13 | item 12 (1) | วัน เดือน ปี ที่จะทำการกำจัดหรือทำลาย |
| 14 | item 12 (3) | สถานที่ที่จะทำการกำจัดหรือทำลาย พร้อมแผนผัง |
| 15 | item 12 (4) | ชื่อเจ้าหน้าที่/ผู้ควบคุมการกำจัดหรือทำลาย |
| 16 | item 12 (5) | รูปถ่ายเศษวัตถุ/อาวุธที่ขอกำจัดหรือทำลาย |
| 17 | item 12 (6) | ขั้นตอน วิธีการ กระบวนการกำจัดหรือทำลาย |
| 18 | item 12 (7) | สำเนาหนังสืออนุญาตขนย้าย (แบบ อ.10) |
| 19 | item 12 (8) | เอกสารอนุญาต/ยินยอมตามกฎหมายอื่น (ถ้าอยู่ใต้บังคับ) |
| 20 | item 12 (9) | เอกสารผู้เชี่ยวชาญ/ยินยอมใช้สถานที่ (กรณีเฉพาะ) |
> Items **3, 4** (ผู้มีอำนาจ/ผู้รับมอบอำนาจ) and **12 (2)** (ตัวอย่างลายมือชื่อผู้รับอาวุธ) = persons,
> from `T_T_REQUEST_PER`, NOT master. Item **13** ("เอกสารอื่น ๆ (ถ้ามี)") is the free/other-docs line
> (a6 handled it via DOCUMENT_ID=0/TYPE=99 — REQ-011; apply the same for อ.9, not a master row).

## Open item (not a build blocker — graceful)
- **person2 (item 12(2) ผู้รับอาวุธ) PER_TYPE** still unconfirmed (33630/37940 had only 1/2). Until a
  sample with a receiver appears, person2 renders empty (graceful). Porter to watch for a PER_TYPE 3
  (or MOVE-based receiver) in a future sample.

## Hand-off
REQ-016 CLOSED → REQ-014 UNBLOCKED (build อ.6-pattern for อ.9 + T_T_REQUEST_MOVE applicant + graceful
degradation). Data team gets the seed spec above (once Porter confirms the GROUP_CODE name).

---

# DATA DICTIONARY FINDINGS (2026-08-05) — 3 open items resolved from DIDPERMIT-data-dictionary.xlsx
(Read directly from `project-docs/DIDPERMIT-data-dictionary.xlsx` — human-provided reference, not a DB hit.)

1. **person2 (item 12(2) ผู้รับอาวุธ) SOURCE = `T_T_REQUEST_EXAMPLE_SIGN`** — "ข้อมูลตัวอย่างลายมือชื่อ
   ผู้รับอาวุธ", its OWN table (NOT `T_T_REQUEST_PER`). Key columns: `REQUEST_ID` (FK), `EXAMPLE_SIGN_TYPE`
   (1=สำเนาบัตรประชาชน, 2=บัตรกลาโหม, 3=บัตรเจ้าหน้าที่รัฐ), `PERSON_NAME_PREFIX/NAME/SURNAME`, `ID_CARD_NO`,
   `ISSUE_DATE`/`EXPIRY_DATE`, `ATTACH_FILE_ID` (→ tick via REQ-009 real-attachment rule), `STATUS`
   (C/R/W/A — apply the NULL-safe exclude-only-'D' rule). ⇒ a9 build needs a new `RequestExampleSignEntity`
   + repo `findByRequestId...`.
2. **PER_TYPE confirmed** (`T_T_REQUEST_PER.PER_TYPE`): 0|null=ไม่ระบุ, **1=ผู้มีอำนาจลงนาม (item 3)**,
   **2=ผู้รับมอบอำนาจ (item 4)** — identical to อ.6. No receiver type here (receiver = EXAMPLE_SIGN above).
3. **GROUP_CODE:** `T_S_REQUEST_CHECKLIST.GROUP_CODE` is free master data (VARCHAR20). The dictionary lists
   no อ.9 checklist group (consistent with the earlier scan's 8 groups). ⇒ **no existing อ.9 group → seed a
   new one; keep proposed `'ReqMove'`** (data team to create; confirm the exact name).

## อ.9 page-1 mapping from `T_T_REQUEST_MOVE` (table desc = "ข้อมูลคำขอขนย้ายวัตถุหรืออาวุธฯ อ.9")
| อ.9 field | T_T_REQUEST_MOVE column |
|---|---|
| destroyLocation (สถานที่กำจัด/ทำลาย) | **`DEST_PLACE_NAME`** (+ `DEST_*` address block) |
| ประเภทการขนย้าย (permitType/objective) | `MOVE_REQUEST_TYPE` (2 = ขนย้ายเพื่อทำลาย → อ.9-destroy) |
| โรงงาน / ต้นทาง | `PLANT_*` / `ORIGIN_*` blocks |
| item 12(1) วันที่กำจัด/ทำลาย | `WRITE_OFF_DESTROY_DATE` |
| ระยะเวลาขนย้าย (item 7?) | `START_DATE`/`END_DATE` (or `ACTUAL_*`) — **may replace `T_T_LICENSE.PERIOD_TEXT` for อ.9; confirm at build** |
| อ.7/อ.2 reference (item 5) | `REF_LICENSE_NO`/`REF_LICENSE_ID`/`REF_LICENSE_TYPE` |
| form | `FORM_ID` (9/10) |
- Link: `T_T_REQUEST_MOVE.REQUEST_ID = requestId` (one row per request).

## Net: person2 + page-1 sources now RESOLVED. Only the data-team **seeding** (master group 'ReqMove'
+ REQUEST_CHECKLIST_ID backfill) remains — a human-side dependency, handled by graceful degradation.
