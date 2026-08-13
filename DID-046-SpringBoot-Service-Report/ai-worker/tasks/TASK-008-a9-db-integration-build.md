# TASK-008: อ.9 (A9) DB integration — build the real A9 report (mirror a6)

- Source: SPEC-014 (+ SPEC-016 field map & findings)
- Status: DONE
- Depends on: none (graceful degradation covers the not-yet-seeded evidence master)

## What to do
Make อ.9 build from the DB instead of mock, mirroring the a6 builder. This also **fixes the
live download-mock defect** (DocumentController `case "A9"` currently returns sample data).
Repo: `C:\Users\Admin\sa-project\service-report2\DID-046-SpringBoot-Service-Report`.
**Use `A6CheckListReportBuilder` as the template** — reuse its helpers/patterns.
**Do not regress อ.6 or the a9 MOCK preview (`/preview/checklist/a9`).**

### 1. Split the mock out (mirror a6's A6CheckListPreviewBuilder)
- New `report/checklist/a9/builder/A9CheckListPreviewBuilder.java` (`@Component`, no repos) —
  lift the current `buildMock(...)` into `createPreviewData()`.
- `PreviewController.previewA9()` → call `a9CheckListPreviewBuilder.createPreviewData()`
  (so `"preview"` never hits decryption).

### 2. `A9CheckListReportBuilder` → DB
- Inject repositories (same set a6 uses) + two NEW ones (below). `@RequiredArgsConstructor`.
- `createData(String enc)` = `cryptoService.decryptToLong(enc)` → `buildFromDb(id)` (mirrors a6 →
  fixes the download endpoint). Add `createDataRaw(long)` for the seam.
- `buildFromDb(long requestId)` populates `A9CheckListReportData`:
  - **applicant / page-1 from `T_T_REQUEST_MOVE`** (NEW entity, §3): `destroyLocation` =
    `DEST_PLACE_NAME`; name/objective from `T_T_REQUEST`; `itemCount` = COUNT(`T_T_REQUEST_DTL`).
    (permitType/ประเภทขนย้าย from `MOVE_REQUEST_TYPE`; item-12(1) date = `WRITE_OFF_DESTROY_DATE`.)
  - **lawReferences / approvalSignatures / components / persons items 3/4** — reuse a6 exactly
    (persons via the **REQ-015 NULL-safe `findActivePersons`** rule; PER_TYPE 1/2).
  - **permitDuration**: try `T_T_LICENSE.PERIOD_TEXT` (REQ-005); if อ.9 uses MOVE `START_DATE`/
    `END_DATE` instead, note it — confirm against 33630 output.
  - **evidences (13 items)** — mirror a6: master `T_S_REQUEST_CHECKLIST` `GROUP_CODE="ReqMove"`
    (constant; data team seeds it) + `T_T_REQUEST_DOC` by `REQUEST_CHECKLIST_ID` + **REQ-009 tick
    (`getAttachFile() != null`)**. Item 3/4 persons; item 13 "เอกสารอื่น ๆ" via DOCUMENT_ID=0/TYPE=99
    (REQ-011 pattern). Item 5 factory-docs + item 12 (1),(3)-(9) map to their master SEQ.
  - **item 12(2) person2 (ผู้รับอาวุธ) from NEW `T_T_REQUEST_EXAMPLE_SIGN`** (§3): name from
    `PERSON_NAME_*`, `ID_CARD_NO`, tick via `getAttachFile()` (REQ-009), status NULL-safe (exclude 'D').
- **GRACEFUL DEGRADATION (mandatory):** empty master group / NULL `REQUEST_CHECKLIST_ID` / NULL
  attachment / missing MOVE row ⇒ blank labels + unticked, **never throw**. An empty อ.9 evidence
  section now is CORRECT (gated on the data team seeding).

### 3. New entities/repos (map only the columns used)
- `domain/entity/RequestMoveEntity.java` `@Table("T_T_REQUEST_MOVE")` — `id`, `requestId`,
  `destPlaceName` (DEST_PLACE_NAME), `moveRequestType`, `writeOffDestroyDate`, `startDate`,
  `endDate`, `refLicenseId` (+ any page-1 fields you render). Repo `findByRequestId`.
- `domain/entity/RequestExampleSignEntity.java` `@Table("T_T_REQUEST_EXAMPLE_SIGN")` — `id`,
  `requestId`, `exampleSignType`, `personNamePrefix/Name/Surname`, `idCardNo`, `expiryDate`,
  `attachFile` (`@OneToOne` on ATTACH_FILE_ID, like RequestDocEntity — for REQ-009 tick), `status`.
  Repo `@Query ... (status IS NULL OR status <> 'D')` (NULL-safe, 11.2).

### 4. Seam (REQ-013 final step)
- `PreviewController.previewA9Db` at `@GetMapping("/checklist/a9/db/{requestId}")` → `Long` id →
  `a9CheckListReportBuilder.createDataRaw(id)` → `exportPdfA9`. Mirror `previewA6Db` exactly
  (already dev-gated/no-key by REQ-004).

## Definition of Done
- [ ] `A9CheckListPreviewBuilder` (mock) added; `previewA9()` uses it; `/preview/checklist/a9`
      still returns the mock PDF (no regression).
- [ ] `A9CheckListReportBuilder` builds from DB; `createData` decrypts → DB (download endpoint no
      longer returns mock); `createDataRaw` + `previewA9Db` seam added.
- [ ] New `RequestMoveEntity`/`RequestExampleSignEntity` + repos (only mapped columns); all queries
      Oracle **11.2-safe** (no FETCH FIRST); person/example-sign queries NULL-safe.
- [ ] Graceful degradation: no exception when master/doc/attachment/MOVE data is missing.
- [ ] Compiles: `./mvnw -o -DskipTests compile`; app boots (JPQL/entities validate at bootstrap).
- [ ] Re-hand to QA (dev): `/a9/db/33630` → 200 PDF; page-1 populated from T_T_REQUEST_MOVE
      (destroyLocation etc.), persons/law/sig/components present; evidence pages render (unticked /
      blank where the master is unseeded — expected); person2 shows if EXAMPLE_SIGN rows exist.
      `/a9/db/37940` (incomplete) → 200 PDF, degraded gracefully (no 500). `/preview/checklist/a9`
      (mock) unchanged.

## Implementation Notes
**Changed (2 modified + 5 new — mirrors a6 structure):**
1. **Mock split** — NEW `A9CheckListPreviewBuilder` (`@Component`, no repos) = the old `buildMock`
   lifted into `createPreviewData()`. `PreviewController.previewA9()` now calls it (so `"preview"`
   never hits decryption). `/preview/checklist/a9` unchanged (mock).
2. **`A9CheckListReportBuilder` → DB** (`@RequiredArgsConstructor`, 12 repos incl. 2 new):
   `createData(String)` = `decryptToLong` → `buildFromDb` (**this fixes the live download-mock
   defect** — DocumentController `case "A9"` now serves real data); `createDataRaw(long)` for the seam.
   - page-1 applicant from `T_T_REQUEST_MOVE` (destroyLocation=`DEST_PLACE_NAME`, permitType from
     `MOVE_REQUEST_TYPE==2`); name/objective from `T_T_REQUEST`; itemCount=COUNT `T_T_REQUEST_DTL`.
   - law refs / signatures (`T_T_LICENSE_INFORM` by REFERENCE_NO) / components (`T_T_REQUEST_DTL`+`T_M_UNIT`)
     / permitDuration (`T_T_LICENSE.PERIOD_TEXT`, list+firstOrNull) — reuse a6 patterns.
   - persons 3/4 via **REQ-015 NULL-safe `findActivePersons`** (PER_TYPE 1/2), REQ-009 tick.
   - evidence 13 items: fixed form labels; `checked` bound to master group **`"ReqMove"`** by SEQ
     index (SPEC-016 seed map, SEQ1→idx0…SEQ20→idx19) + REQ-009 real-attachment tick; item-13
     "เอกสารอื่น ๆ" dynamic (DOCUMENT_ID=0/TYPE=99, REQ-011); item-12(2) person2 from **NEW
     `T_T_REQUEST_EXAMPLE_SIGN`** (NULL-safe `findActiveByRequestId`, tick via `getAttachFile()`).
   - **Graceful degradation:** empty master / NULL `REQUEST_CHECKLIST_ID` / NULL attach / missing
     MOVE row ⇒ blank + unticked, never throws (only a genuinely missing `T_T_REQUEST` row throws,
     same as a6).
3. NEW `RequestMoveEntity`+repo (`findByRequestId`), `RequestExampleSignEntity`+repo (NULL-safe
   `@Query`); both map only used columns; `attachFile` `@OneToOne @NotFound(IGNORE)` mirrors
   `RequestDocEntity` (dangling FK → null → untick).
4. **Seam** `PreviewController.previewA9Db` `GET /checklist/a9/db/{requestId}` → `createDataRaw`
   → `exportPdfA9`, mirroring `previewA6Db`.
- A9 history builder unchanged: it delegates to `createData` — now DB-backed, **identical to how
  a6's history builder already works** (no regression relative to a6).

**Verification (BE boundary):**
- Compile: `./mvnw -o -DskipTests compile` → `BUILD SUCCESS`.
- **Boot: app started clean** (`Started SpringBootServiceReportApplication`, alt port `:33097`) —
  new entities, the two repos, the JPQL `@Query`, and all bean wiring (12-repo builder, preview
  builder, PreviewController) validate at bootstrap. No JPQL/mapping/bean error. Instance stopped;
  pre-existing `:33000` untouched.
- Scope: `git status` = PreviewController + A9CheckListReportBuilder modified; 5 new files
  (2 entities, 2 repos, A9CheckListPreviewBuilder). Did NOT touch a6.

## Questions
- **Q1 (permitDuration source) — please confirm at QA/33630:** I used `T_T_LICENSE.PERIOD_TEXT`
  (REQ-005 reuse). SPEC-016 notes อ.9 *may* use `T_T_REQUEST_MOVE.START_DATE/END_DATE` instead.
  If 33630 shows item-7 wrong, tell me the MOVE-date format and I'll switch (1-block change).
- **Q2 (evidence tick mapping) — confirm once `'ReqMove'` is seeded:** ticks are bound to the master
  group by SEQ index per the SPEC-016 seed table (SEQ1→item1 … SEQ13→12(1), SEQ14→12(3)…SEQ20→12(9)).
  Until the data team seeds `'ReqMove'` + backfills `REQUEST_CHECKLIST_ID`, all evidence ticks are
  false / dates blank — **expected graceful behavior**, not a defect. The item-5 sub-doc *date
  details* (เลขที่/ลงวันที่/วันหมดอายุ inline) from the mock are NOT fabricated in the DB build (no
  source without a complete sample) — the doc labels render; date-inlines can be wired once 33630
  (seeded) shows the real shape. Flag if the form needs them sooner.
- **Q3 (out of scope, security heads-up):** in the current working tree `PreviewController`'s
  class-level `@Profile("dev")` (from TASK-002/REQ-004) is **commented out** — the preview seam is
  presently NOT dev-gated. I left it as-found (not my task scope), but flagging since it undoes the
  REQ-004 control. Please route to whoever owns the REQ-004 re-enable.

## Runtime proof = QA's leg (real UAT DB, not BE)
@Sober: please route to Tanya (dev profile): `/a9/db/33630` → 200 PDF, page-1 from MOVE
(destroyLocation etc.), persons/law/sig/components present, evidence pages render (unticked/blank
while `'ReqMove'` unseeded — expected), person2 shows if EXAMPLE_SIGN rows exist;
`/a9/db/37940` (incomplete) → 200 PDF, degraded (no 500); `/preview/checklist/a9` (mock) unchanged.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE (code leg)** (Sober, 2026-08-05). Verified independently — large build, key points:
- **Scope:** TASK-008 = `PreviewController` + `A9CheckListReportBuilder` modified + 5 new
  (RequestMove/RequestExampleSign entities+repos, A9CheckListPreviewBuilder). The a6 builder +
  RequestPerRepository mods in the tree are the earlier **TASK-007** work, NOT TASK-008 — a6 logic
  untouched. ✅
- **Download-mock defect fixed:** `createData(enc)` = `buildFromDb(decryptToLong(enc))`; `createDataRaw(long)`
  for the seam. ✅
- **Preview split:** `previewA9()` → `a9CheckListPreviewBuilder.createPreviewData()` (mock, no decrypt);
  `/preview/checklist/a9` unchanged. ✅
- **Graceful degradation:** `move = findByRequestId().orElse(null)` with null-guards
  (`move != null ? nz(destPlaceName) : ""`, `MOVE_REQUEST_TYPE` null-checked); master `'ReqMove'` empty
  → ticks false; only a missing `T_T_REQUEST` throws (same as a6). ✅
- **NULL-safe + 11.2:** persons via TASK-007 `findActivePersons`; new `RequestExampleSignRepository`
  `@Query (status IS NULL OR status <> 'D')`; license/signatures list+firstOrNull. No FETCH FIRST. ✅
- **Seam (REQ-013):** `previewA9Db` `/checklist/a9/db/{id}` → `createDataRaw` → `exportPdfA9`. ✅
- **Compile** re-run by me → exit 0; Jason's clean **boot** validates entities/JPQL/beans at bootstrap. ✅
- Runtime proof = QA's leg (33630/37940). REQ-014 + REQ-013 → SPEC_DONE.
- **Open for QA/Porter (non-blocking):** permitDuration source for อ.9 (code uses `T_T_LICENSE.PERIOD_TEXT`;
  MOVE `START/END` is the alternative) — confirm what prints on 33630. Evidence pages 2-3 will render
  blank/unticked until the data team seeds `'ReqMove'` — that is EXPECTED (graceful), not a defect.
