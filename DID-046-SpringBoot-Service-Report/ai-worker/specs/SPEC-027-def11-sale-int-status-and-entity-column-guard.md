# SPEC-027: DEF-11 — invented `STATUS` on T_T_REQUEST_SALE_INT (500s on /download) + entity-column guard

- Source: DEF-11 (Porter). 🔴 TOP — blocks the อ.9 production proof the human is trying to close.
- Status: ACTIVE

## The defect (confirmed against the dictionary)
`T_T_REQUEST_SALE_INT` has **no `STATUS` column** (its status-ish columns are `SALE_INT_STATUS` and
`CHECKING_STATUS`). But TASK-018 wrote:
- `RequestSaleIntEntity` → `@Column(name = "STATUS") private String status;`
- `RequestSaleIntRepository.findActive` → JPQL `WHERE e.requestId = :id AND (e.status IS NULL OR e.status <> 'D')`
- `resolveFromSaleInt` → calls `findActive(...)`.
The resolver order is `resolveFromSpecial (อ.6) → resolveFromSaleInt → resolveFromMove (อ.9) → REQUEST_TYPE`.
So `resolveFromSaleInt`'s query runs for **every non-อ.6 request** → `ORA-00904: "STATUS": invalid
identifier` → **real `/api/v1/download/checklist/{id}` 500s for อ.9 (destroy + transport) and อ.14** (and
any legacy form). อ.6 is the only form that never reaches it (resolveFromSpecial returns first) — **the one
form we hand-tested was the only one that structurally could not hit the bug.**
Introduced by TASK-018, exactly on the routing path TASK-021 had just repaired.

## Why review missed it
`test-compile` + PreviewTests are **DB-free** (JPQL is not executed; mocks feed the builders), so an invalid
column name is invisible until a real request hits the DB. My "SA-verified" on TASK-018 confirmed
compile/boot/preview but **could not** catch ORA-00904. Owned — see the guard below.

## Fix (TASK-023)
1. **`RequestSaleIntEntity`:** remove the `status` field + its `@Column("STATUS")`. Routing needs only
   `REQUEST_ID` + `FORM_ID` (both real). (BUYER_NAME/IMPORTER_NAME/FORM_ID all exist — keep.)
2. **`RequestSaleIntRepository`:** replace `findActive` with a plain `List<RequestSaleIntEntity>
   findByRequestId(Long)` (no status filter — routing is row-presence + FORM_ID). Oracle-11.2-safe.
3. **`resolveFromSaleInt`:** call `findByRequestId(...)` (same `.stream().findFirst().map(getFormId)` logic).
   > If a real soft-delete filter is genuinely wanted here later, it must use the **real** column
   > (`SALE_INT_STATUS`) — but routing does not need it; keep it out to stay minimal.

## Sweep — the same class of bug in the other new entities (TASK-018/019/022)
Verify **every** mapped column exists in the source, column-by-column:
- **`RequestSaleIntEntity`** — the culprit (above).
- **`RequestDtlViewEntity`** (VW_REQUEST_DTL): checked — its columns (`ID, REQUEST_ID, ITEM_NO,
  PRODUCT_CODE, PRODUCT_NAME_DISPLAY_LICENSE, QUANTITY, QUANTITY_UNIT_NAME1, STATUS`) all appear in the
  filed view `SELECT` (REQ-025). **OK** — and it IS queried (a6/a9/a14 annex), so it would already 500 if
  wrong; re-confirm each field once more when fixing.
- **`RequestDtlSaleIntEntity`** — a14's old annex source, now **unused** (TASK-022 moved annex+count to the
  view). No live 500 (never queried), but a wrong mapping is a latent trap. **Verify its columns against
  `T_T_REQUEST_DTL_SALE_INT`, or delete the now-dead entity/repo** (SA prefers deleting dead code — mention
  which you did).
- Spot-check the TASK-015/016 additions that ARE on live paths: `RequestMoveEntity.AUTHORITY_NAME` and the
  5 permit entities (`LICENSE_NO/ISSUE_DATE/EXPIRY_DATE/ATTACH_FILE_ID/STATUS`) — these were verified
  against the dict earlier (the permit tables DO have `STATUS`); re-confirm while you're in there.

## Process guard (Porter's point 3 — stop this class at the desk)
**New standard, effective now:** any task that adds/edits an `@Entity`/`@Table`/`@Column` must, in its
Implementation Notes, **name the dictionary sheet (or filed view DDL / Porter-supplied `DESCRIBE`) that
confirms each mapped column exists** — not "mirrored from <other table>". The reviewer (Sober) verifies the
mapped column list against that source, because compile + DB-free PreviewTests **cannot** catch an invalid
column. Mirroring another table's shape is the exact move that produced DEF-11; a column is not real until
it's found in the dictionary for **that** table. (No test-infra project — this is a desk checklist.)

### Status-column naming (Porter's DEF-11 note — critical for the next header table)
Request **header** tables name their status column **per family** — `T_T_REQUEST_SPECIAL.REQUEST_STATUS`,
`T_T_REQUEST_MOVE.MOVE_STATUS`, `T_T_REQUEST_SALE_INT.SALE_INT_STATUS`. The plain `STATUS` / `<> 'D'`
convention is from the **child/detail** tables (`T_T_REQUEST_PER.STATUS`, `T_T_REQUEST_DTL.STATUS`, the
permit tables, BUYER, EXAMPLE_SIGN) — those genuinely have `STATUS`. **Assume no request-header table has a
plain `STATUS` until you've seen it in the dict.** And note: header tables are matched by **`REQUEST_ID`**
(no `REF_LICENSE_ID`; licence linkage is by REQUEST_ID, per REQ-005). ⚠️ Swapping in a guessed status column
(e.g. `MOVE_STATUS`) would **compile and run but silently filter the wrong thing** — worse than the crash.
For **routing legs specifically, use no status filter at all** — row-presence + FORM_ID is enough (that's
why the DEF-11 fix drops the filter rather than "correcting" the column). Applies directly to the coming
อ.4–8 header `T_T_REQUEST_IMPORT` (verify its real status column before mapping). Porter can pull
`ALL_TAB_COLUMNS` for any table on request — ask before assuming; it costs one query.

## Verify
- BE: `test-compile` + boot; `resolveFromSaleInt` uses `findByRequestId`; `RequestSaleIntEntity` has no
  `status`. (The 500 is a DB-path bug — real proof is QA.)
- QA (real DB, via Porter — the DEF-11 proof + the REQ-024 proof it was blocking): a real **อ.9** and a real
  **อ.14** through the REAL `/api/v1/download/checklist/{encId}` → return the PDF, **no ORA-00904 / 500**;
  อ.6 still routes.

## Tasks
- TASK-023: the fix + the sweep above.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
