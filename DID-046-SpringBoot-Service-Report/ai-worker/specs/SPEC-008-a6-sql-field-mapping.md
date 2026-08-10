# SPEC-008: อ.6 (A6) — SQL + form-field mapping reference

- Source: REQ-008
- Status: DONE (documentation) — reconciled with runtime show_sql (id 38273), 2026-08-05

## Overview
For one อ.6 render (e.g. `GET /api/v1/preview/checklist/a6/db/38273` →
`A6CheckListReportBuilder.createDataRaw(38273)` → `buildFromDb(38273)`), this lists
**every query the builder issues, in order**, its **effective SQL + bind params**,
and **which อ.6 form field/section each result populates**. Derived by reading the
code — all repositories use Spring Data **derived queries** (no `@Query`), so the
effective SQL is mechanical. `:req` = the requestId (38273 in the example).

> The real endpoint `/api/v1/download/checklist/{enc}` runs the same `buildFromDb`
> after decrypting the id; the `/a6/db/{id}` seam skips decryption + the resolver.
> Same queries either way.

## Query-by-query (execution order in `buildFromDb`)

### 1. Request header — `requestRepository.findById(:req)`
```sql
SELECT * FROM T_T_REQUEST WHERE ID = :req;
```
- `TRADER_NAME` → **applicant.name** (front item 1, ผู้ขออนุญาต)
- `OBJECTIVE` → **applicant.objective** (front item 6)
- `REFERENCE_NO` → bind param for the signatures query (#6)
- (front item 2 `permitType` = fixed string "ผลิตส่วนประกอบของอาวุธเป็นการเฉพาะคราว", not from DB)

### 2. Employer — `requestEmployerRepository.findByRequestId(:req)`
```sql
SELECT * FROM T_T_REQUEST_EMPLOYER WHERE REQUEST_ID = :req;   -- 0..1 row
```
- `EMPLOYER_NAME` → **applicant.receivingUnit** (front item 5, หน่วยงานผู้รับส่วนประกอบ)
- (⚠️ `TOTAL_DAYS` is **no longer used** for item 7 after REQ-005 — see #5)

### 3. Item count — `requestDtlRepository.countByRequestId(:req)`
```sql
SELECT COUNT(*) FROM T_T_REQUEST_DTL WHERE REQUEST_ID = :req;
```
- count → **applicant.itemCount** (front item 4, จำนวนที่ขออนุญาต)

### 4. Law references — `requestLawRefRepository.findByRequestIdOrderByIdAsc(:req)`
```sql
SELECT * FROM T_T_REQUEST_LAW_REF WHERE REQUEST_ID = :req ORDER BY ID ASC;
```
- `NAME` → **lawReferences[].label**; `IS_CHECKED` (1/0) → **lawReferences[].checked ✓**
  (front page, อ้างอิงกฎหมาย list; `SUB_LAWREF` subreport)

### 5. Permit duration (item 7) — `licenseRepository.findByRequestIdOrderByIdDesc(:req)`  ⟵ REQ-005 fix
```sql
SELECT * FROM T_T_LICENSE WHERE REQUEST_ID = :req ORDER BY ID DESC;   -- List; take first in Java
```
- first row's `PERIOD_TEXT` → **permitDuration** (front item 7, ระยะเวลาการอนุญาต),
  printed **verbatim** (no `" วัน"`); **blank** if no row.
- List + `firstOrNull` (latest by ID) — **not** `FETCH FIRST` (Oracle 11.2-safe).

### 6. Approval signatures — `buildSignatures(REFERENCE_NO from #1)`
```sql
-- primary (informStatus 20 = นำเรียนแล้ว):
SELECT * FROM T_T_LICENSE_INFORM
 WHERE REFERENCE_NO = :ref AND INFORM_STATUS = 20 ORDER BY ID DESC;   -- List, take first
-- fallback if none:
SELECT * FROM T_T_LICENSE_INFORM WHERE REFERENCE_NO = :ref ORDER BY ID DESC;
```
- from the one chosen row, 4 signer columns → **approvalSignatures[0..3]**
  (`SUB_SIGNATURE`, 2-col grid, emitted order `[1,3,2,4]`):
  - `NAME_PREFIX1+NAME1+SURNAME1` / `POSITION1` → signer 1 (ตั้งเรื่อง)
  - `..2` / `POSITION2` → signer 2 (หน.)  ·  `..3` / `POSITION3` → signer 3 (ผอ.)
  - `..4` / `POSITION4` → signer 4 (จก.)

### 7. Evidence checklist (back, items 1–8) — `buildEvidences(:req)`
**7a. master labels** — `requestCheckListRepository.findByGroupCodeAndIsActiveOrderBySequenceAsc('ReqSpecial', 1)`
```sql
SELECT * FROM T_S_REQUEST_CHECKLIST
 WHERE GROUP_CODE = 'ReqSpecial' AND IS_ACTIVE = 1 ORDER BY SEQUENCE ASC;   -- SEQ 1..9
```
- `CODE_NAME` → evidence item **labels** (SEQ1→item1, SEQ2→item2, SEQ3→item5, SEQ4→item6,
  SEQ5→item7-doc, SEQ6..9→item8 (1)-(4)); `ID` → join key for the tick (#7b).

**7b. attachments/tick** — `requestDocRepository.findByRequestIdAndStatusNot(:req, 'D')`
```sql
SELECT * FROM T_T_REQUEST_DOC WHERE REQUEST_ID = :req AND STATUS <> 'D';
```
- **checked ✓** = a row exists with `REQUEST_CHECKLIST_ID` = master.ID **and** its
  **`ATTACH_FILE_ID` column** is not null (>0). The tick is decided from the **FK column**
  (`hasFile()` reads `getAttachFileId()`), **not** from the `t_t_attach_file` table. The
  per-doc `t_t_attach_file WHERE id=?` selects seen at runtime are an ORM side-effect of a
  nullable `@OneToOne` (see "Runtime-only queries" below), not the tick mechanism.
- `ISSUE_DATE` → item 1 "ออกให้เมื่อ", item 2 "ลงวันที่"; `EXPIRY_DATE` → item 5 "วันหมดอายุ"
  (`SUB_EVIDENCE` / `SUB_EVIDENCE_SUB` subreports)

**7c. persons items 3/4** — `buildPersons(:req, perType)` (perType 1 → item 3, 2 → item 4)
```sql
SELECT * FROM T_T_REQUEST_PER WHERE REQUEST_ID = :req AND PER_TYPE = :perType ORDER BY ID ASC;
-- per person, their id-card/house-reg docs:
SELECT * FROM T_T_REQUEST_DOC
 WHERE REQUEST_ID = :req AND REF_ID = :personId
   AND DOCUMENT_ID IN (102,103) AND STATUS <> 'D';
```
- `PERSON_NAME_PREFIX+PERSON_NAME+PERSON_SURNAME` → person **label** (ชื่อ–สกุล)
- `ID_CARD_NO` → detail "เลขที่"; `ID_CARD_EXPIRY_DATE` → detail "วันหมดอายุ"
- doc `DOCUMENT_ID=102` (บัตรประชาชน) + file → **idCard ☐✓**; `103` (ทะเบียนบ้าน) + file → **houseReg ☐✓**

### 8. Component annex table — `buildComponents(:req)`
```sql
SELECT * FROM T_T_REQUEST_DTL WHERE REQUEST_ID = :req ORDER BY ITEM_NO ASC;
-- per row, unit lookup (N+1):
SELECT * FROM T_M_UNIT WHERE ID = :quantityUnitId;
```
- `ITEM_NO`→seq, `PRODUCT_CODE`→code, `PRODUCT_NAME`→name,
  `QUANTITY` + `T_M_UNIT.UNIT_NAME_ABBR` → **components[].quantity** (annex page, `SUB_COMPONENT`)

## Runtime-only queries (ORM association side-effects) — reconciled with show_sql (id 38273)
These appear in the emitted SQL but are **not** explicit repository calls in the builder —
they are triggered by **nullable `@OneToOne`/`@ManyToOne` associations** on the loaded
entities. Nullable `@OneToOne` cannot be proxied lazily without bytecode enhancement, so
Hibernate issues a resolving `SELECT` even though the A6 builder reads only scalar columns.
**None of these feed an อ.6 field — they are loaded-but-not-printed.**

| Runtime query | Triggered by (association) | อ.6 field | Note |
|---|---|---|---|
| `SELECT * FROM T_T_REQUEST_LOC_CHK WHERE REQUEST_ID = ?` | `RequestEntity.requestLocInfo` `@OneToOne(LAZY, mappedBy="request")` | — | loaded, not printed |
| `SELECT * FROM T_M_TRADER_PLANT WHERE TRADER_ID = ?` | `RequestEntity.factoryInfo` `@OneToOne(LAZY, JoinColumn TRADER_ID)` (and `companyInfo`→`T_TRADER` similarly if trader present) | — | loaded, not printed |
| `SELECT * FROM T_S_COMMON_CODE WHERE (CODE_STR, GROUP_CODE) IN (?,?)` ×2 | `@ManyToOne` CommonCode assocs (`RequestEntity.activeCode` + the one on `RequestDocEntity`) — status/label decode | — | loaded, not printed |
| `SELECT * FROM T_T_ATTACH_FILE WHERE ID = ?` ×N (one per `T_T_REQUEST_DOC` row) | `RequestDocEntity.attachFile` `@OneToOne(LAZY, JoinColumn ATTACH_FILE_ID)` | — | **N+1**; does NOT drive the tick (tick = the `ATTACH_FILE_ID` column) |

**Root cause + why it matters (perf, not correctness):** the nullable `@OneToOne` fields
(`requestLocInfo`, `companyInfo`, `factoryInfo`, `attachFile`) each force an eager resolving
select — the `attach_file` one runs once **per evidence doc** (a real N+1, larger than the
`T_M_UNIT` one). Output is correct; this is a performance/cleanup observation (candidate for
a follow-up REQ: make these truly lazy via bytecode enhancement, or map only the scalar FKs).

## Notes (accuracy, not defects)
- **No `@Query` anywhere** — every statement above is a Spring Data derived query; the
  SQL shown is the effective shape (Hibernate selects all mapped columns; only the
  discriminating WHERE/ORDER + consumed columns are shown).
- **Two "top-1 in Java" spots** (#5 license, #6 license-inform) return a `List` ordered
  DESC and take the first — deliberately avoiding `FETCH FIRST` (Oracle 11.2). See ENV
  fact on the board / REQ-005.
- **N+1** at #8 (a `T_M_UNIT` lookup per annex row). Correctness is fine; perf tuning is
  out of REQ-008 scope.
- Runtime confirmation (optional, QA read-only): set Hibernate `show_sql`/`format_sql`
  and hit `/a6/db/38273` to capture the literal emitted SQL — matches the above.

## AC mapping
- Every อ.6 section → source query + table.columns. ✅
- Effective SQL + bind params per query (not just table names). ✅
- Item 7 reflects the REQ-005 `T_T_LICENSE.PERIOD_TEXT` fix, not `TOTAL_DAYS`. ✅

## Tasks
- None (documentation only).

## Questions
(none)
