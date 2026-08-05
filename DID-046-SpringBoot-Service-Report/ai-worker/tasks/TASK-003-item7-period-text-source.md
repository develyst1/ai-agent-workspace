# TASK-003: Source อ.6 item 7 "ระยะเวลาการอนุญาต" from T_T_LICENSE.PERIOD_TEXT

- Source: SPEC-005
- Status: DONE
- Depends on: none

## What to do
Fix DEF-1: อ.6 item 7 must print `T_T_LICENSE.PERIOD_TEXT` (business-confirmed),
not `T_T_REQUEST_EMPLOYER.TOTAL_DAYS + " วัน"`. Repo:
`C:\Users\Admin\sa-project\service-report2\DID-046-SpringBoot-Service-Report`.
Change **only** item-7 sourcing — leave every other field alone.

Confirmed facts (from DATA REQUEST DR-1/DR-2, in SPEC-005 §Questions):
- Join: **`T_T_LICENSE.REQUEST_ID = <this request's id>`**. Do **not** use
  `REF_LICENSE_ID` (it is NULL).
- `PERIOD_TEXT` is a full sentence (e.g. "ใช้ได้จนถึง 27 ก.ค. 2569 นับแต่วันที่ได้รับอนุญาต")
  → print it verbatim, **no `" วัน"` suffix**.
- No license row → item 7 **blank** (`""`).
- If >1 license row for a request → take the **latest by `ID` DESC**.

1. **New entity** `domain/entity/LicenseEntity.java` — `@Entity @Table(name="T_T_LICENSE")`,
   minimal: `@Id Long id` (`ID`), `Long requestId` (`REQUEST_ID`), `String periodText`
   (`PERIOD_TEXT`). Match the style of existing entities (Lombok, `@Column(name=...)`).
   (Only map the columns we use — don't map the whole table.)

2. **New repository** `domain/repository/LicenseRepository.java` — Spring Data,
   `Optional<LicenseEntity> findFirstByRequestIdOrderByIdDesc(Long requestId);`

3. **`A6CheckListReportBuilder`** — inject `LicenseRepository` (add to the constructor
   field list — it's `@RequiredArgsConstructor`), and replace the item-7 block
   (currently lines ~83-85):
   ```java
   // ข้อ 7 ระยะเวลา — ที่มา = T_T_LICENSE.PERIOD_TEXT (join by REQUEST_ID, latest by ID); ไม่มี license = ว่าง
   String permitDuration = licenseRepository.findFirstByRequestIdOrderByIdDesc(requestId)
           .map(LicenseEntity::getPeriodText)
           .map(this::nz)
           .orElse("");
   ```
   Remove the old `EMPLOYER.TOTAL_DAYS + " วัน"` logic. Do not change how `employer`
   is used elsewhere (items 5/etc. still use it).

## Definition of Done
- [ ] `LicenseEntity` + `LicenseRepository` added; `A6CheckListReportBuilder` item-7
      now reads PERIOD_TEXT (no `" วัน"`), latest-by-ID, blank when no row.
- [ ] No other field/behaviour changed (`git diff` scoped to the builder + 2 new files).
- [ ] Compiles: `./mvnw -o -DskipTests compile` (show BUILD SUCCESS).
- [ ] Evidence via the QA seam (dev profile on): GET (no auth)
      `/api/v1/preview/checklist/a6/db/38272` and `/db/38273` → item 7 shows the real
      PERIOD_TEXT sentence (not "90 วัน"); `/db/38240` → item 7 blank. Report what item 7
      prints for each (you may extract text from the PDF). This is the DEF-1 close proof.
- [ ] `:33000` is a pre-existing instance — boot your own build on an alt port if needed,
      and don't disturb it (as in TASK-001/002).

## Implementation Notes
**Changed (item-7 sourcing only — 1 modified + 2 new, exactly SPEC-005 scope):**
- NEW `domain/entity/LicenseEntity.java` — `@Data @Entity @Table("T_T_LICENSE")`, maps only
  `ID` (`@Id Long id`), `REQUEST_ID` (`Long requestId`), `PERIOD_TEXT` (`String periodText`).
  Style matches `RequestEmployerEntity` (Lombok `@Data`, `@Column(name=...)`).
- NEW `domain/repository/LicenseRepository.java` — `JpaRepository<LicenseEntity, Long>` with
  `Optional<LicenseEntity> findFirstByRequestIdOrderByIdDesc(Long requestId)` (join by REQUEST_ID,
  latest-by-ID per SA decision).
- MOD `report/checklist/a6/builder/A6CheckListReportBuilder.java` — injected `LicenseRepository`
  (added to the `@RequiredArgsConstructor` final-field list, imported via the existing
  `domain.repository.*` wildcard); replaced the item-7 block (old lines ~83-85):
  ```java
  String permitDuration = licenseRepository.findFirstByRequestIdOrderByIdDesc(requestId)
          .map(LicenseEntity::getPeriodText)
          .map(this::nz)
          .orElse("");
  ```
  Dropped the old `EMPLOYER.TOTAL_DAYS + " วัน"` logic and its hardcoded suffix. `employer` is
  still used for items 5/applicant etc. — unchanged. No other field touched.

**Verification I can do within BE boundary:**
- Compile: `./mvnw -o -DskipTests compile` → `BUILD SUCCESS`.
- Scope (this task): `git status` → only `A6CheckListReportBuilder.java` modified + the 2 new
  License files. (pom/SecurityConfig/PreviewController/A6CheckListPreviewBuilder in the working
  tree are the still-uncommitted TASK-001/002 work, not part of this change.)

**Runtime proof NOT run by me — needs QA/human (see Questions):** the DoD's `/a6/db/38272|38273|
38240` check issues real SELECTs against real UAT `T_T_LICENSE` data for specific real request-ids.
That is a real-DB/real-data verification, which is outside the BE hard boundary (workspace rule #4:
BE never runs SQL / connects to a real DB) and is QA's leg (Tanya via the /a6/db seam, dev profile
on). Requesting Sober route the runtime item-7 proof to QA/human — see Questions.

## Questions
- **Q1 (runtime proof routing):** The code fix is complete + compiles, but the DoD's final
  item — GET (dev profile) `/a6/db/38272`, `/db/38273` → item 7 = real PERIOD_TEXT sentence;
  `/db/38240` → blank — reads **real UAT DB data by real request-ids**. Per workspace rule #4 /
  BE.md, BE must not run SQL or connect to a real DB, and this real-data check is QA's leg. Please
  route the item-7 runtime proof to Tanya (QA) via Porter (dev profile active so the /a6/db seam is
  open per TASK-002; expected: 38272/38273 show their PERIOD_TEXT verbatim with **no `" วัน"`**,
  38240 blank). I'll handle any REWORK if the output reveals a code issue.
  (If you intended BE to self-run this against real data, flag it — I'll need explicit sign-off
  that it's in-boundary, but I'd still recommend QA owns the real-data run.)
  > answer (Sober, 2026-08-05): Correct call — you must NOT run SQL / hit the real UAT DB
  > (workspace rule #4). The real-data item-7 proof is QA's leg, not BE's, and SA doesn't
  > touch real DBs either. The DoD's runtime bullet is therefore a QA verification, not a BE
  > gate; your code leg is complete. I'm routing the DEF-1 close proof to Tanya via @Porter.

## Review
**Verdict: DONE (code leg)** (Sober, 2026-08-05). Verified independently.

- **Scope:** the TASK-003 change is exactly `A6CheckListReportBuilder.java` (item-7 block) +
  new `LicenseEntity.java` + `LicenseRepository.java`. The other working-tree modifications
  (pom, SecurityConfig, PreviewController, A6CheckListPreviewBuilder) are the still-uncommitted
  TASK-001/002 work — correctly excluded from this task's scope. ✅
- **Correctness vs SPEC-005 confirmed design:** join by `REQUEST_ID`
  (`findFirstByRequestIdOrderByIdDesc`), `REF_LICENSE_ID` not used; `permitDuration =
  PERIOD_TEXT` verbatim via `nz(...)`, **no `" วัน"` suffix**; no row / null → `""` (blank);
  >1 row → latest by `ID` DESC. `LicenseEntity` maps only ID/REQUEST_ID/PERIOD_TEXT. Only
  item-7 changed; `employer` still used for items 5/applicant. ✅
- **Compile:** re-ran `./mvnw -o -DskipTests compile` myself → exit 0. ✅
- **Runtime DEF-1 proof:** NOT a BE/SA gate — it reads real UAT data, which is QA's read-only
  leg. Routed to Tanya via Porter (see Q1 answer). REQ-005 → SPEC_DONE; the TEST_PASSED that
  actually closes DEF-1 comes from QA.

The code leg is complete and correct; if QA's real-data run reveals an issue, it returns as
REWORK.

## Rework (round 2) — DEF-2: Oracle 11.2 has no FETCH FIRST (Sober, 2026-08-05)
QA (TEST-003, TEST_FAILED) found the derived method `findFirstByRequestIdOrderByIdDesc`
makes Hibernate emit `FETCH FIRST 1 ROWS ONLY` (Oracle 12c+). **UAT DB = Oracle 11.2** →
`ORA-00933`, so `/a6/db/{id}` 500s and item 7 is unverifiable. The code leg is otherwise
correct — only the "top-1" mechanism must change.

**Fix — use the project's existing Oracle-11g-safe convention (return a List, take the first
in Java; no limit clause).** This is exactly what `LicenseInformRepository` already does
(see its comment) and how `A6CheckListReportBuilder.buildSignatures` already picks the top
row via the `firstOrNull(...)` helper. Do NOT add a native `FETCH FIRST`/`ROWNUM` query —
match the existing pattern.

1. **`LicenseRepository`** — replace the `findFirst…` method with a List-returning one (no
   `First` → no FETCH FIRST):
   ```java
   // คืน List (เอาตัวแรกใน Java) — เลี่ยง FETCH FIRST ที่ Oracle 11.2 ไม่รองรับ (ORA-00933); ORDER BY ID DESC = ล่าสุด
   List<LicenseEntity> findByRequestIdOrderByIdDesc(Long requestId);
   ```
2. **`A6CheckListReportBuilder`** item-7 — take the first via the existing `firstOrNull(...)`:
   ```java
   LicenseEntity license = firstOrNull(licenseRepository.findByRequestIdOrderByIdDesc(requestId));
   String permitDuration = license != null ? nz(license.getPeriodText()) : "";
   ```
   (Same semantics: latest-by-ID, blank when none, no `" วัน"`.)

**Rework DoD (add to the DoD above):**
- [ ] No `FETCH FIRST` / no 12c-only SQL is emitted for the license lookup (grep the fix;
      the repo method has no `First`/`Top`/`Pageable`/`Limit`).
- [ ] Compiles (`./mvnw -o -DskipTests compile`).
- [ ] Then re-hand to QA: the same runtime proof (`/a6/db/38272,38273` → real PERIOD_TEXT,
      no `" วัน"`; `/a6/db/38240` → blank) must now return **200 PDF** (no ORA-00933) — that
      QA run closes DEF-1 **and** DEF-2.

## Rework Notes (round 2 — DEF-2 fix, Jason)
Applied the SPEC'd Oracle-11.2-safe convention (List + `firstOrNull`, matching
`LicenseInformRepository`/`buildSignatures`) — no `FETCH FIRST`/`ROWNUM`, no native query.
- `LicenseRepository` — replaced `Optional<LicenseEntity> findFirstByRequestIdOrderByIdDesc`
  with `List<LicenseEntity> findByRequestIdOrderByIdDesc(Long requestId)` (no `First` →
  Hibernate emits plain `ORDER BY ID DESC`, no `FETCH FIRST 1 ROWS ONLY`).
- `A6CheckListReportBuilder` item-7 — `LicenseEntity license = firstOrNull(licenseRepository
  .findByRequestIdOrderByIdDesc(requestId)); permitDuration = license != null ? nz(license
  .getPeriodText()) : "";` Same semantics: latest-by-ID, blank when none, no `" วัน"`.

Rework DoD:
- ✅ No `FETCH FIRST`/12c-only SQL for the license lookup — `grep -E "First|Top|Pageable|Limit|FETCH"`
  on `LicenseRepository.java` matches only the explanatory comment; the derived method name has
  no `First`/`Top`/`Pageable`/`Limit`.
- ✅ Compiles: `./mvnw -o -DskipTests compile` → `BUILD SUCCESS`.
- ⏳ Re-hand to QA: the runtime proof (`/a6/db/38272,38273` → real PERIOD_TEXT, no `" วัน"`;
  `/a6/db/38240` → blank) must now return **200 PDF** (no ORA-00933). Still a real-UAT-DB read →
  QA's leg, not BE's (unchanged from Q1). @Sober: please re-route to Tanya to close DEF-1 + DEF-2.

## Review (round 2) — DEF-2 rework
**Verdict: DONE (code leg)** (Sober, 2026-08-05). Verified independently.
- `LicenseRepository` = `List<LicenseEntity> findByRequestIdOrderByIdDesc(Long)` — no
  `First`/`Top`/`Pageable`/`Limit` (the only "FETCH FIRST" text is the explanatory comment),
  so Hibernate emits plain `ORDER BY ID DESC` → no ORA-00933 on Oracle 11.2. ✅
- Builder item-7 = `firstOrNull(licenseRepository.findByRequestIdOrderByIdDesc(requestId))` →
  `nz(periodText)` else `""` — same semantics (latest-by-ID, blank, no `" วัน"`), matches the
  existing `LicenseInformRepository`/`buildSignatures` convention. ✅
- Compile: re-ran `./mvnw -o -DskipTests compile` myself → exit 0. ✅
- Runtime proof unchanged = QA's leg (real UAT read). Re-routed to Tanya to close DEF-1 + DEF-2.
