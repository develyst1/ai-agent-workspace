# TASK-022: รายการ (annex + item-4 count) from VW_REQUEST_DTL — a6/a9/a14 (REQ-025)

- Source: SPEC-026 (REQ-025). Standardise the annex + item-4 count onto the `VW_REQUEST_DTL` view for all reports.
- Status: DONE (Sober-reviewed)
- Assignee: Jason (BE)
- Depends on: none
- ⚠️ **Only the รายการ (item list) changes.** Page-1 fields, evidence ticks, signatures, law refs stay
  exactly as they are (REQ-025 point 4). a6/a9 are DELIVERED — no regression outside the item list.

## New view entity + repo (read-only)
`RequestDtlViewEntity` — `@Table(name = "VW_REQUEST_DTL")`, `@org.hibernate.annotations.Immutable`, `@Id` on
`ID`. Map the columns needed (from the filed view definition):
`ID, REQUEST_ID, ITEM_NO, PRODUCT_CODE, PRODUCT_NAME_DISPLAY_LICENSE, QUANTITY, QUANTITY_UNIT_NAME1`
(+ `QUANTITY2, QUANTITY_UNIT_NAME2, STATUS` if useful). Repo `RequestDtlViewRepository`:
`findByRequestIdOrderByItemNoAsc(Long)` + `countByRequestId(Long)` — Oracle-11.2-safe (no FETCH FIRST).
Do NOT create/alter/drop the view; adopt it **as-is** (incl. its `WHERE STATUS != 'D'` — the NULL-status
question is CLOSED by the human: do not compensate).

## Swap in a6 / a9 / a14 builders
- `buildComponents(...)`: iterate `requestDtlViewRepository.findByRequestIdOrderByItemNoAsc(requestId)` →
  `new ComponentItem(v.getItemNo(), v.getProductCode(), v.getProductNameDisplayLicense(),
   formatQuantity(v.getQuantity(), v.getQuantityUnitName1()))`.
  - **Item name = `PRODUCT_NAME_DISPLAY_LICENSE`** (the view's assembled string) — not raw PRODUCT_NAME.
  - **Unit = `QUANTITY_UNIT_NAME1`** (resolved name from the view). Change `formatQuantity` to take the
    **unit name string** instead of a unitId, and **drop the `unitRepository.findById(...)` lookup**
    (delete the now-unused `unitRepository` field if nothing else uses it). `#,##0.###` number format stays.
- **item-4 count** (จำนวนที่ขออนุญาต): `requestDtlViewRepository.countByRequestId(requestId)` — replace
  a6/a9 `requestDtlRepository.countByRequestId` and a14 `requestDtlSaleIntRepository.countActive`.
- `ComponentItem` record shape unchanged. Leave the per-form `RequestDtl*` entities/repos if used elsewhere;
  just stop using them for annex/count.
- `blankWhenNull` still applies to the new string columns in the annex jrxml (no "null" leaks).

## Verify — DB-free (BE) then real DB (QA)
- BE: builders compile + app boots against the view entity/repo; `A6/A9/A14 PreviewTests` green (mocks
  supply components directly → this is a DB-path change; regenerate `.jasper` if any jrxml touched).
- QA (real DB, via Porter) on **18847** (an อ.9 with a real item row; NOT 38362 — it has none):
  - อ.9/a6/a14 รายการ rows + order + count match `VW_REQUEST_DTL` for that REQUEST_ID.
  - item name = `PRODUCT_NAME_DISPLAY_LICENSE`; unit = resolved name (note: a6/a9 unit changes abbr→full — intended).
  - **No regression outside the item list** (a6 38272/38314 page-1/ticks/persons/sigs unchanged); no "null".

## Definition of Done
- [ ] `RequestDtlViewEntity` (@Immutable, VW_REQUEST_DTL) + repo (`findByRequestIdOrderByItemNoAsc`, `countByRequestId`).
- [ ] a6/a9/a14 `buildComponents` + item-4 count read the view; name = PRODUCT_NAME_DISPLAY_LICENSE, unit = QUANTITY_UNIT_NAME1.
- [ ] Local `unitRepository` unit derivation dropped where replaced; ComponentItem shape unchanged.
- [ ] test-compile + PreviewTests green; app boots; nothing outside the item list changed.

## Handoff after DoD
Back to **Sober** for review, then QA proves the annex on 18847 matches the view (row content is the DB leg).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Implementation Notes
Standardised the รายการ (annex) + item-4 count onto `VW_REQUEST_DTL` for a6/a9/a14. **Only the item list
changed** — page-1/ticks/persons/sigs/lawRefs untouched.
- NEW `RequestDtlViewEntity` (`@Immutable @Table("VW_REQUEST_DTL")`, `@Id ID`) mapping ID/REQUEST_ID/
  ITEM_NO/PRODUCT_CODE/**PRODUCT_NAME_DISPLAY_LICENSE**/QUANTITY/**QUANTITY_UNIT_NAME1**/STATUS +
  `RequestDtlViewRepository.findByRequestIdOrderByItemNoAsc` + `countByRequestId` (11.2-safe, no FETCH FIRST).
  View adopted as-is (its `WHERE STATUS != 'D'` kept; NULL-status not compensated — human-closed).
- a6/a9/a14 `buildComponents`: iterate the view → `ComponentItem(itemNo, productCode,
  **productNameDisplayLicense**, formatQuantity(quantity, **quantityUnitName1**))`. `formatQuantity` now
  takes the **unit-name string** (dropped the `unitRepository.findById` lookup + the `unitRepository`
  field in all three); `#,##0.###` format unchanged; `ComponentItem` shape unchanged.
- item-4 count: `requestDtlViewRepository.countByRequestId(requestId)` (replaced a6/a9
  `requestDtlRepository.countByRequestId` and a14 `requestDtlSaleIntRepository.countActive`).
- The per-form `RequestDtl*`/`RequestDtlSaleInt*` repos are now injected-but-unused (left in place per the
  task — they may be used elsewhere; only annex/count stopped using them).

**Verify:** `./mvnw -o -DskipTests=false test-compile` → BUILD SUCCESS; **app boots clean** (@Immutable
VW_REQUEST_DTL entity + repo validate at bootstrap); `A6PreviewTest`+`A9PreviewTest`+`A14PreviewTest` →
Tests run: 3, Failures: 0 (mocks feed components directly → this is a DB-path change; no jrxml touched).
@Sober: ready for review. QA (real DB, via Porter) on **18847**: a6/a9/a14 รายการ rows/order/count match
`VW_REQUEST_DTL`; name = PRODUCT_NAME_DISPLAY_LICENSE, unit = QUANTITY_UNIT_NAME1 (a6/a9 unit abbr→full —
intended); no regression outside the item list; no "null".

## Review
**Verdict: DONE** (Sober, 2026-08-18). Independently verified the code + build (row content = DB leg):
- `RequestDtlViewEntity`: `@Immutable @Table("VW_REQUEST_DTL") @Id`, maps `PRODUCT_NAME_DISPLAY_LICENSE`→productNameDisplayLicense, `QUANTITY_UNIT_NAME1`→quantityUnitName1. Repo has findByRequestIdOrderByItemNoAsc + countByRequestId. ✅
- **All 3 builders (a6/a9/a14) consistent:** buildComponents iterates the view → `ComponentItem(itemNo, productCode, productNameDisplayLicense, formatQuantity(quantity, quantityUnitName1))`; item-4 count = `requestDtlViewRepository.countByRequestId`; `formatQuantity` now takes the unit-name string; `unitRepository` lookup+field removed. ✅
- View adopted as-is (WHERE STATUS != 'D' kept; NULL-status not compensated — human-closed). ✅
- `test-compile` + A6+A9+A14 PreviewTests → BUILD SUCCESS, 3 run / 0 fail; app boots. Only the item list changed. ✅
- **REQ-025 code COMPLETE.** Row content (name/unit/order/count match the view) = QA's DB leg on 18847 (not 38362).
