# SPEC-024: ข้อ 7 ระยะเวลาการอนุญาต = T_T_LICENSE.PERIOD_TEXT verbatim — ALL forms (REQ-023 / DEF-10)

- Source: REQ-023 (human ruling, DEF-10). Item 7 (ระยะเวลาการอนุญาต) must read **`T_T_LICENSE.PERIOD_TEXT`
  verbatim** on **every** checklist form. This **reverts the DEF-4 อ.9 deviation** (MOVE START/END range).
- Status: ACTIVE

## Why / what changes
The canonical permit-duration source is `T_T_LICENSE.PERIOD_TEXT` (already used by อ.6 since REQ-005 —
a full sentence, printed as-is, blank when no license). During the อ.9 build (DEF-4) item 7 was switched
to `T_T_REQUEST_MOVE.START_DATE " ถึง " END_DATE` because อ.9 was thought to have "no license period".
The human now standardises: **all forms use PERIOD_TEXT verbatim.**

Per-form status:
- **อ.6** — already `license.getPeriodText()` (REQ-005). ✅ No change.
- **อ.9** — currently `moveDurationText(move)` (MOVE range). ❌ **Revert to the อ.6 pattern** (main change).
- **อ.14** — new build (TASK-018); spec'd to use PERIOD_TEXT from the start (TASK-018 updated). No separate change.
- Other builders (a1/a3/open/expand/personChange/planChange) have **no `permitDuration`/item-7** field
  (verified by grep) → not in scope.

## The อ.9 change (TASK-020)
`A9CheckListReportBuilder`:
1. Re-add the `LicenseRepository licenseRepository` field (it was removed in DEF-4 as "unused").
2. Replace `String permitDuration = moveDurationText(move);` with the อ.6 pattern:
   ```java
   LicenseEntity license = firstOrNull(licenseRepository.findByRequestIdOrderByIdDesc(requestId));
   String permitDuration = license != null ? nz(license.getPeriodText()) : "";
   ```
   (`LicenseRepository.findByRequestIdOrderByIdDesc` already exists — reuse; List + firstOrNull =
   Oracle-11.2-safe; blank when no license.)
3. Remove the now-unused `moveDurationText(...)` method. Leave everything else (MOVE is still used for
   item-5 destroyLocation, item-2 type, item-12(1) date) untouched.

## Consequence — surface, not hide (SA note)
This **reverses a RUNTIME-confirmed decision**: DEF-4 was verified on 18847, where MOVE START/END rendered
"01/12/2562 ถึง 31/03/2563". After this change, อ.9 item-7 shows `PERIOD_TEXT` and is **blank for any อ.9
request without a `T_T_LICENSE` row** (which was the original reason DEF-4 used MOVE dates). That blank is
the accepted tradeoff of the human's "verbatim PERIOD_TEXT everywhere" ruling — consistent with อ.6.
> Flag for QA/Porter: verify อ.9 item-7 on a request that HAS a license row (shows PERIOD_TEXT) and one
> that does not (blank, not the old MOVE range). 18847 will change from the MOVE range to PERIOD_TEXT/blank.

## Verify
- BE (A9PreviewTest): mock a license row → item-7 = PERIOD_TEXT; no license → blank; no "null";
  test-compile + PreviewTests green; regenerate `.jasper`. อ.6 preview unchanged.
- QA (real DB): อ.9 item-7 = PERIOD_TEXT on a licensed request, blank otherwise; อ.6 unchanged;
  อ.14 (when built) item-7 = PERIOD_TEXT.

## Tasks
- **TASK-020**: revert อ.9 item-7 to `T_T_LICENSE.PERIOD_TEXT` (above).
- อ.14: covered by TASK-018 (item-7 pinned to PERIOD_TEXT); no separate task. อ.6: no change.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
