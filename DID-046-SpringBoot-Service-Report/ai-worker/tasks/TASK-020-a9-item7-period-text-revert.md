# TASK-020: อ.9 item 7 — revert to T_T_LICENSE.PERIOD_TEXT (REQ-023 / DEF-10)

- Source: SPEC-024 (REQ-023 / DEF-10). Standardise item-7 = PERIOD_TEXT verbatim across all forms; this
  reverts the DEF-4 อ.9 MOVE-range deviation.
- Status: DONE (Sober-reviewed)
- Assignee: Jason (BE)
- Depends on: none (independent of the a14 work)
- ⚠️ อ.6 unchanged; only อ.9's item-7 source changes. MOVE stays used for item-5/item-2/item-12(1).

## Change (`A9CheckListReportBuilder`)
1. Re-add the field `private final LicenseRepository licenseRepository;` (removed in DEF-4).
2. Replace `String permitDuration = moveDurationText(move);` (~L106) with the อ.6 pattern:
   ```java
   LicenseEntity license = firstOrNull(licenseRepository.findByRequestIdOrderByIdDesc(requestId));
   String permitDuration = license != null ? nz(license.getPeriodText()) : "";
   ```
3. Delete the now-unused `private String moveDurationText(RequestMoveEntity move) { ... }` (~L404).
- `LicenseRepository.findByRequestIdOrderByIdDesc(Long)` already exists (a6 uses it) — reuse, don't add.
- Nothing else changes: MOVE is still read for destroyLocation (item 5, destroy), permitType (item 2),
  item-12(1) WRITE_OFF_DESTROY_DATE.

## Verify — DB-free (BE) then real DB (QA)
- BE (A9PreviewTest): add a mock license row → item-7 renders `PERIOD_TEXT`; with no license → **blank**
  (not the old "…ถึง…" range, no "null"). Destroy + transport previews both still render; อ.6 preview
  unchanged. test-compile + A9/A6 PreviewTests green; regenerate `.jasper`.
- QA (real DB, via Porter): อ.9 item-7 = PERIOD_TEXT on a licensed request; blank on one without a
  T_T_LICENSE row. **Note:** 18847 changes from "01/12/2562 ถึง 31/03/2563" (old MOVE range) to
  PERIOD_TEXT/blank — that is the intended DEF-10 behaviour, not a regression.

## Definition of Done
- [ ] อ.9 item-7 sourced from `T_T_LICENSE.PERIOD_TEXT` (a6 pattern); `moveDurationText` removed;
      `licenseRepository` re-added.
- [ ] Blank when no license (never "null"); MOVE still used for item-5/2/12(1).
- [ ] test-compile + A9PreviewTest + A6PreviewTest green; `.jasper` regenerated; อ.6 unchanged.

## Handoff after DoD
Back to **Sober** for review, then QA confirms PERIOD_TEXT on a licensed อ.9 request (and blank otherwise;
18847 now PERIOD_TEXT/blank).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Implementation Notes
Reverted อ.9 item-7 to the standard `T_T_LICENSE.PERIOD_TEXT` (a6 pattern; REQ-023/DEF-10) — undoes the
DEF-4 MOVE-range deviation. **1 file: `A9CheckListReportBuilder.java`.**
- Re-added `private final LicenseRepository licenseRepository;` (reused existing `findByRequestIdOrderByIdDesc`).
- `permitDuration` = `firstOrNull(licenseRepository.findByRequestIdOrderByIdDesc(requestId))` →
  `nz(getPeriodText())`, else `""` — verbatim, blank-when-no-license, never "null".
- Deleted the now-unused `moveDurationText(...)` helper (grep: 0 refs). MOVE still read for item-5
  (destroyLocation), item-2 (permitType), item-12(1) (WRITE_OFF_DESTROY_DATE) — unchanged.

**Verify:** `./mvnw -o -DskipTests=false test-compile` → BUILD SUCCESS; `A9PreviewTest`+`A6PreviewTest`
→ Tests run: 2, Failures: 0 (a9 p4 + transport p5, a6 unchanged). `moveDurationText` removed (0 refs),
`licenseRepository` present. อ.6 untouched. (Preview mocks pass their own permitDuration string, so the
PERIOD_TEXT-vs-blank behaviour is the DB path → QA's real-DB leg.)
@Sober: ready for review. QA (real DB): อ.9 item-7 = PERIOD_TEXT on a licensed request, blank without a
`T_T_LICENSE` row; 18847 now PERIOD_TEXT/blank (was "…ถึง…" MOVE range — intended DEF-10 behaviour).

## Review
**Verdict: DONE** (Sober, 2026-08-18). Independently verified the code + build:
- `licenseRepository` re-added (L64); item-7 = `firstOrNull(findByRequestIdOrderByIdDesc)` → `nz(getPeriodText())`, blank else (L106-107) — a6 pattern, REQ-023-compliant. ✅
- `moveDurationText` **removed** (0 grep refs); `getStartDate/getEndDate` no longer referenced. ✅
- MOVE still read for item-5 destroyLocation (L90), item-2 permitType (L95), item-12(1) writeOffDate (L110). ✅
- `test-compile` + A9PreviewTest + A6PreviewTest → BUILD SUCCESS, 2 run / 0 fail (a9 p4 + transport p5). a6 untouched. ✅
- Runtime PERIOD_TEXT-vs-blank = DB path (preview mocks supply their own string) → QA's leg. REQ-023 code complete (a6 ✓, a9 ✓, a14 pinned via TASK-018).
