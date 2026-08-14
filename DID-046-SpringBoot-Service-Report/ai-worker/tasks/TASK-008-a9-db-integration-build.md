# TASK-008: อ.9 (A9) DB integration — build the real A9 report (mirror a6)

- Source: SPEC-014 (+ SPEC-016 field map & findings)
- Status: BLOCKED (waiting: Sober → QA — emitted-JSON diagnostic on /a9/db/18847; see Rework r2 Notes)
- Depends on: none (graceful degradation covers the not-yet-seeded evidence master)

## Rework (round 2) — DEF-4: อ.9 page-1 fields blank despite data (Sober, 2026-08-05)
QA on `/a9/db/18847`: item 1 (ชื่อผู้ขอ), 2 (ประเภท), 5 (สถานที่กำจัด/ทำลาย), 7 (ระยะเวลา) BLANK, and
the **law-reference list is empty** though 6 rows have IS_CHECKED=1. (item 8 blank = expected, master
unseeded.) SA verified the a9 **template is correct** (applicant.name→applicantName, .permitType,
.destroyLocation, subDataSource("lawReferences") all match the model) **and** `RequestMoveEntity`/repo
mappings are correct — so the blanks are the **builder emitting null at runtime**, an อ.9-data-shape reality.

### Diagnose first (definitive, no DB query): read the emitted JSON
`JasperPdfReportService.exportPdfA9` already `System.out.println`s the record JSON. Boot (dev), hit
`/a9/db/18847`, and read that JSON — it shows exactly which fields are null vs populated. (PII — do NOT
paste real values into files; just report which fields are null/present.) Use it to confirm each fix below.

### Fixes
1. **item 2 (permitType) — map the FULL `MOVE_REQUEST_TYPE` value list**, not the `==2`-only hardcode
   (18847 = type 0 → currently ""). From the data dictionary:
   `0`=ขนย้ายให้หน่วยงานตามมาตรา 7 · `1`=ขายและขนย้ายให้บุคคลอื่นนอกจากหน่วยงานตามมาตรา 7 ·
   `2`=ขนย้ายเพื่อทำลาย · `3`=ขนย้ายเพื่อทดสอบ · `4`=ขนย้ายเพื่อจัดแสดง · `5`=ขนย้ายกลับโรงงาน.
   (Use a small map/switch; null/unknown → "".)
2. **item 7 (permitDuration) — source from `T_T_REQUEST_MOVE.START_DATE`/`END_DATE`** (Thai range via
   `ThaiDateFormatUtil`), NOT `T_T_LICENSE.PERIOD_TEXT` (18847 has 2019-12-01→2020-03-31; a9 has no
   license period). Blank when both dates null.
3. **item 5 (destroyLocation) & item 2** — if the JSON shows `applicant.destroyLocation` null even though
   the DB row has `DEST_PLACE_NAME`, then `requestMoveRepository.findByRequestId(18847)` returned empty in
   the app → find why (confirm one MOVE row per request; check the actual FK; add a `@Query` if the
   derived name isn't matching). If the JSON shows it populated but the PDF is blank, escalate to me
   (would contradict the template check). Fixing `move` loading also fixes item 2.
4. **item 1 (name)** — objective (same `request` row) prints but name is blank ⇒ likely
   `T_T_REQUEST.TRADER_NAME` is null for อ.9 requests. Confirm via the JSON; if null, source the applicant
   name from the correct place for อ.9 (check the app/screen + dictionary — e.g. trader/company or MOVE).
   Report what you find; if it needs a DB fact, flag it to me (I'll raise a DATA REQUEST).
5. **law references** — if the JSON `lawReferences` is empty, `requestLawRefRepository.findByRequestIdOrderByIdAsc(18847)`
   returned nothing → อ.9 law refs link differently than อ.6. Check how the 6 IS_CHECKED rows attach to the
   request (REQUEST_ID vs a form/move key); flag the linkage to me if it needs a schema fact.
6. **signatures heads-up** — `REFERENCE_NO="MV000407"` (a MOVE ref). Confirm `T_T_LICENSE_INFORM` lookup
   by REFERENCE_NO returns signers for อ.9 (else signatures are silently empty too) — check the JSON.

**Rework DoD:**
- [ ] item 2 uses the full MOVE_REQUEST_TYPE label map; item 7 uses MOVE START/END dates.
- [ ] item 1 / item 5 / lawReferences populate on 18847 (or, for any that need a DB/schema fact, a
      precise DATA REQUEST is raised to Sober rather than guessed).
- [ ] `./mvnw -o -DskipTests=false test-compile` green; graceful degradation preserved (no 500).
- [ ] Re-hand to QA on `/a9/db/18847`: items 1/2/5/7 + law list populate; report the emitted-JSON findings.

## Review (round 2) — DEF-3 fixed (Sober, 2026-08-05)
`A9PreviewTest:43` now `new A9CheckListPreviewBuilder().createPreviewData()` (import added); I re-ran
**`./mvnw -o -DskipTests=false test-compile` → exit 0** (the gate my round-1 DoD missed). Full project
incl. tests compiles; Jason's A9PreviewTest run is green (pages=4). Round-1 verification of the build
still stands. **Verdict: DONE.** REQ-014 + REQ-013 → SPEC_DONE; QA does the real-data proof (/a9/db/33630).

## Rework (round 1) — DEF-3: test compilation broken (Sober, 2026-08-05)
`src/test/.../a9/A9PreviewTest.java:43` still calls `new A9CheckListReportBuilder().createData("preview")`,
but §1 moved the mock into `A9CheckListPreviewBuilder` and `A9CheckListReportBuilder` now needs 12 repos
→ `./mvnw test-compile` fails (constructor mismatch). Confirmed: `test-compile` → COMPILATION ERROR at
A9PreviewTest:43. (Main compile passed because our DoD used `-DskipTests`, which skips TEST compilation —
my miss; DoD updated below.)

**Fix (one line):** in `A9PreviewTest`, build the mock via the split-out no-arg preview builder:
```java
// was: new A9CheckListReportBuilder().createData("preview")
A9CheckListReportData data = new A9CheckListPreviewBuilder().createPreviewData();
```
(`A9CheckListPreviewBuilder` has a no-arg ctor — no repos — so `new ...()` works in the plain-JUnit test,
exactly the pattern A6PreviewTest uses for its mock.)

**Rework DoD (added):**
- [ ] `A9PreviewTest` uses `A9CheckListPreviewBuilder().createPreviewData()`; no ref to the DB builder's ctor.
- [ ] **`./mvnw -o -DskipTests=false test-compile` succeeds** (full project incl. tests compiles) —
      this is the gate that was missing. Then re-run A9PreviewTest if you want the preview PDF.
- [ ] Re-hand for review; the rest of the build (verified round 1) is unchanged.

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
- **Q4 (Jason) — the emitted-JSON diagnostic is a real-UAT read; BE rule #4?**
  > answer (Sober, 2026-08-05): **Correct — hold the line.** Booting + hitting `/a9/db/18847` reads
  > real UAT data by a real (PII) id; that is QA's read-only leg (same as my TASK-003 ruling), not BE's.
  > Your two code-only fixes (item 2 MOVE_REQUEST_TYPE map, item 7 MOVE START/END dates) are accepted.
  > I'm routing the **emitted-JSON field-presence check** to Tanya via Porter — she reports which of
  > `applicant.name`, `applicant.destroyLocation`, `lawReferences[]`, `approvalSignatures[]` are
  > **null/empty vs populated** in the console JSON on `/a9/db/18847` (field-presence only — no PII values).
  > Then: JSON-populated but PDF-blank → template (I'll re-open); JSON-null → the builder's query got
  > nothing → I raise the exact DATA REQUEST (name source / MOVE-row for 18847 / a9 law-ref linkage /
  > REFERENCE_NO signer join) and hand you the confirmed source to wire. TASK-008 stays BLOCKED on that check.

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

## Rework Notes (round 1 — DEF-3 test-compile, Jason)
Fixed the test-compile break (my `-DskipTests` DoD miss).
- `A9PreviewTest`: import + line 43 now `new A9CheckListPreviewBuilder().createPreviewData()`
  (was `new A9CheckListReportBuilder().createData("preview")`). The preview builder has a no-arg
  ctor (no repos), so plain-JUnit instantiation works — same pattern as A6PreviewTest.
- Evidence: `./mvnw -o -DskipTests=false test-compile` → **BUILD SUCCESS** (full project incl. tests).
  `./mvnw -o -Dtest=A9PreviewTest test` → `Tests run: 1, Failures: 0`, `A9 PREVIEW PDF … pages=4`
  (mock preview intact). Main compile + app-boot from round 1 unchanged.
- Re-handing for review. Q1/Q2/Q3 from round 1 still stand (permitDuration source, evidence
  SEQ-mapping graceful-until-seeded, and the REQ-004 gate note — now tracked as REQ-018).

## Rework Notes (round 2 — DEF-4, Jason)
**Done — the 2 deterministic (code-only) fixes:**
1. **item 2 (permitType)** — new `moveRequestTypeLabel(move)`: full `MOVE_REQUEST_TYPE` map
   0→ให้หน่วยงานตามมาตรา 7, 1→ขาย/ขนย้ายให้บุคคลอื่นนอกมาตรา 7, 2→ทำลาย, 3→ทดสอบ, 4→จัดแสดง,
   5→กลับโรงงาน; null/unknown→"". (18847=type 0 will now show its label instead of blank.)
2. **item 7 (permitDuration)** — new `moveDurationText(move)` = `MOVE.START_DATE` " ถึง " `END_DATE`
   via `ThaiDateFormatUtil` (พ.ศ.); blank when both null. Dropped `T_T_LICENSE.PERIOD_TEXT` for a9
   and removed the now-unused `licenseRepository` field (surgical).
- `./mvnw -o -DskipTests=false test-compile` → **BUILD SUCCESS**. Graceful degradation preserved.

**BLOCKED — the other 4 need a real `/a9/db/18847` run (BE boundary):**
The rework's diagnosis step ("boot dev, hit `/a9/db/18847`, read the emitted JSON") is a read of the
**real UAT DB by a real PII request-id** — outside the BE hard boundary (workspace rule #4: BE never
connects to a real DB), and you (Sober) already ruled in TASK-003 that real-data runs are **QA's leg**.
I'm holding that line for consistency rather than crossing rule #4. So for:
- **item 1 (name)** — is `T_T_REQUEST.TRADER_NAME` null for อ.9? (objective from the same row prints,
  so the row loads — name may just be null / sourced elsewhere for อ.9.)
- **item 5 (destroyLocation)** — did `requestMoveRepository.findByRequestId(18847)` return empty
  (→ FK/linkage issue) or is `DEST_PLACE_NAME` null? (also gates item 2's label showing.)
- **lawReferences empty** — did `findByRequestIdOrderByIdAsc(18847)` return nothing → อ.9 law refs link
  by a different key than `REQUEST_ID`?
- **signatures** — does `T_T_LICENSE_INFORM` by `REFERENCE_NO="MV000407"` return signers for อ.9?

**Request (please route):** ask **Tanya (QA, dev)** to hit `/a9/db/18847` and report **which of these
fields the emitted JSON shows null vs populated** (no PII values — just null/present per field). With
that I can finish: if a field is null in the DB / links by a different key, that's a schema/DB fact →
please raise it as a **DATA REQUEST** and I'll wire the correct source. If you intend BE to self-run the
diagnostic against real data, I need an explicit override of rule #4 (recommend the human confirms) —
otherwise QA owns the run, same as TASK-003.

## Questions
- **Q4 (DEF-4 diagnostic routing):** see Rework r2 Notes — route the `/a9/db/18847` emitted-JSON
  field-presence check to Tanya; any null-in-DB / different-linkage finding → DATA REQUEST to me.
  The 2 code fixes (item 2 full map, item 7 MOVE dates) are done + compile and can be reviewed now.
