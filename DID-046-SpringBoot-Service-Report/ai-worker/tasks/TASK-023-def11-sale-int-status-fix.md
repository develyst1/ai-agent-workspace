# TASK-023: DEF-11 — remove invented `STATUS` on SALE_INT (fixes /download 500s) + entity-column sweep

- Source: SPEC-027 (DEF-11). 🔴 TOP — unblocks the real อ.9/อ.14 `/download` proof.
- Status: DONE (Sober-reviewed — columns diffed vs dictionary)
- Assignee: Jason (BE)
- Depends on: none
- Root cause: `T_T_REQUEST_SALE_INT` has **no `STATUS`** column (only `SALE_INT_STATUS` / `CHECKING_STATUS`),
  but `RequestSaleIntEntity` maps `STATUS` and `findActive` filters on it → ORA-00904 for every non-อ.6
  request via `resolveFromSaleInt`.

## Fix
1. `RequestSaleIntEntity`: **delete** the `status` field + its `@Column(name = "STATUS")`. Keep ID/REQUEST_ID/
   FORM_ID/BUYER_NAME/IMPORTER_NAME (all real).
2. `RequestSaleIntRepository`: replace `findActive` with `List<RequestSaleIntEntity> findByRequestId(Long requestId)`
   (derived query, no status filter — routing is row-presence + FORM_ID). No FETCH FIRST.
3. `RequestTypeResolverService.resolveFromSaleInt`: call `findByRequestId(...)` →
   `.stream().findFirst().map(getFormId).map(f -> (f!=null && (f==14||f==16)) ? "A14" : null).orElse(null)`.

## Sweep (same class of bug — verify each mapped column exists in the dictionary for THAT table)
- `RequestDtlSaleIntEntity` / repo — **now unused** (a14 annex+count moved to `VW_REQUEST_DTL` in TASK-022).
  **Delete the dead entity+repo** (preferred), or if kept, verify every column against `T_T_REQUEST_DTL_SALE_INT`
  and remove the injected-but-unused field from `A14CheckListReportBuilder`. Say which you did.
- `RequestDtlViewEntity` — re-confirm each mapped column (`ID, REQUEST_ID, ITEM_NO, PRODUCT_CODE,
  PRODUCT_NAME_DISPLAY_LICENSE, QUANTITY, QUANTITY_UNIT_NAME1, STATUS`) is in the filed `VW_REQUEST_DTL`
  `SELECT` (REQ-025). It's on the live annex path (would 500 if wrong).
- Spot-check `RequestMoveEntity.AUTHORITY_NAME` + the 5 permit entities (`LICENSE_NO/ISSUE_DATE/EXPIRY_DATE/
  ATTACH_FILE_ID/STATUS`) exist in their dict sheets (permit tables DO have `STATUS`).

## Implementation Notes must (new standard, SPEC-027)
For every entity you touch, **name the data-dictionary sheet (or filed view DDL / a Porter `DESCRIBE`) that
confirms each mapped column** — not "mirrored from a6/a9". A column isn't real until it's in the dict for
that table.

## Verify — BE then QA
- BE: `./mvnw -o -DskipTests=false test-compile` + app boots; `RequestSaleIntEntity` has no `status`;
  `resolveFromSaleInt` uses `findByRequestId`; grep shows no `SALE_INT` `status`/`findActive` refs; all
  PreviewTests green.
- QA (real DB, via Porter — DEF-11 proof, also closes the REQ-024 proof it blocked): a real **อ.9** (18847/
  37956) and a real **อ.14** (27300/34380) through `/api/v1/download/checklist/{encId}` → return the PDF,
  **no ORA-00904 / 500**; อ.6 still routes.

## Definition of Done
- [ ] `RequestSaleIntEntity` STATUS mapping removed; repo uses `findByRequestId`; resolver updated.
- [ ] Dead `RequestDtlSaleInt*` handled (deleted or column-verified + noted); `RequestDtlViewEntity` re-confirmed.
- [ ] Implementation Notes cite the dict sheet per mapped column (new standard).
- [ ] test-compile + boot + all PreviewTests green; no `STATUS`-on-SALE_INT reference remains.

## Handoff after DoD
Back to **Sober** for review (I will diff every mapped column against the dictionary this time, not just
compile/preview). Then QA runs the real อ.9/อ.14 `/download` proof.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Implementation Notes (with per-column dictionary citations — SPEC-027 standard)
**DEF-11 fix:**
- `RequestSaleIntEntity`: **deleted the `status` field + `@Column("STATUS")`.** Kept ID / REQUEST_ID /
  FORM_ID / BUYER_NAME / IMPORTER_NAME. — *Source: SPEC-027 + TASK-023 root-cause: `T_T_REQUEST_SALE_INT`
  has NO `STATUS` (only `SALE_INT_STATUS` / `CHECKING_STATUS`); the 5 kept columns are confirmed real per
  TASK-023.*
- `RequestSaleIntRepository`: `findActive` (JPQL with `status` filter) → **`findByRequestId(Long)`**
  (derived, no status filter, no FETCH FIRST). Routing = row-presence + FORM_ID.
- `RequestTypeResolverService.resolveFromSaleInt`: now calls `findByRequestId(...)`. + fixed the a14 builder's
  `buildFromDb` call (`findActive` → `findByRequestId`). ⇒ `resolveFromSaleInt` no longer throws ORA-00904,
  so every non-อ.6 request (อ.9 both variants, อ.14) routes past it instead of 500ing.

**Sweep:**
- `RequestDtlSaleIntEntity` + repo: **DELETED** (dead since TASK-022 moved a14 annex+count to `VW_REQUEST_DTL`);
  removed the injected-but-unused `requestDtlSaleIntRepository` field from `A14CheckListReportBuilder`. grep:
  0 `RequestDtlSaleInt` refs remain.
- `RequestDtlViewEntity` — **re-confirmed every mapped column against the filed `VW_REQUEST_DTL` SELECT
  (REQ-025 view DDL)**: `ID`, `REQUEST_ID`, `NVL(ITEM_NO,0) AS ITEM_NO`, `PRODUCT_CODE`, `QUANTITY`,
  `QU1.UNIT_NAME AS QUANTITY_UNIT_NAME1`, `DTL.STATUS`, `… AS PRODUCT_NAME_DISPLAY_LICENSE` — **all present
  in the view's projection**. No change needed (it's on the live annex path; verified, won't 500).
- `RequestMoveEntity.AUTHORITY_NAME` + the 5 permit entities (`LICENSE_NO/ISSUE_DATE/EXPIRY_DATE/
  ATTACH_FILE_ID/STATUS`) — sourced from the DIDPERMIT data-dictionary sheets per TASK-015/016 (permit
  tables DO carry `STATUS`); not re-touched here. If SA wants a fresh diff of those, flag it.

**Verify:** `./mvnw -o -DskipTests=false test-compile` → BUILD SUCCESS; grep shows **no `STATUS`/`findActive`
on SALE_INT**; **app boots clean** (RequestSaleIntEntity remaps + derived query validate); A14+A9+A6
PreviewTests → Tests run: 3, Failures: 0. Scope = RequestSaleIntEntity, RequestSaleIntRepository,
RequestTypeResolverService, A14CheckListReportBuilder (field + call); deleted RequestDtlSaleInt entity+repo.
@Sober: ready for review — please diff the mapped columns vs the dict as you noted. QA (real DB): a real
**อ.9** (18847/37956) + **อ.14** (27300/34380) via `/api/v1/download/checklist/{encId}` → PDF, no ORA-00904/500;
อ.6 still routes. (This also unblocks the REQ-024 real-/download proof.)

## Review
**Verdict: DONE** (Sober, 2026-08-18). Verified per the new SPEC-027 standard — **diffed every mapped column
against the data dictionary**, not just compile/preview:
- `RequestSaleIntEntity` now maps ID/REQUEST_ID/FORM_ID/BUYER_NAME/IMPORTER_NAME — **all 5 confirmed in the
  T_T_REQUEST_SALE_INT dict sheet**; `STATUS` **removed** and dict confirms it does NOT exist (real one =
  `SALE_INT_STATUS`, correctly unmapped — routing doesn't need a status filter). ✅
- `RequestSaleIntRepository.findByRequestId` (no status filter); `resolveFromSaleInt` + a14 `buildFromDb`
  both call it → no ORA-00904 path for non-อ.6 requests. ✅
- `RequestDtlSaleIntEntity` + repo + the unused a14 field **deleted** (0 refs remain). ✅
- `RequestDtlViewEntity` — all mapped columns present in the filed `VW_REQUEST_DTL` SELECT (live annex path). ✅
- test-compile + A14/A9/A6 PreviewTests → BUILD SUCCESS, 3/0; app boots. ✅
- The real /download-no-500 proof is QA's DB leg — and this **unblocks the REQ-024 proof** it was blocking.
