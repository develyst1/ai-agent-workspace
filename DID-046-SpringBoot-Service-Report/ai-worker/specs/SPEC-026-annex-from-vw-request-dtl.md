# SPEC-026: รายการ (annex + item-4 count) from VW_REQUEST_DTL — ALL checklist reports (REQ-025)

- Source: REQ-025 (human). The บัญชีรายการ (annex/page-4 list) **and** item-4 count (จำนวนที่ขออนุญาต) must be
  sourced from a single **`VW_REQUEST_DTL`** view on **every** checklist report (a6, a9 destroy+transport,
  a14, and future a4-8…) instead of the per-form detail tables.
- Status: ACTIVE (UNBLOCKED — view exists (18847→1 row); columns filed in `requirements/REQ-025-…md`; ready to task)

## Why
The human wants every report's รายการ to read the **canonical, system-wide** view `VW_REQUEST_DTL` — the
same source the rest of the application uses — so our reports stop diverging from what users see elsewhere.
The view is built `FROM T_T_REQUEST_DTL` enriched with LEFT JOINs to product/unit/common-code masters, and
it pre-assembles the licence-facing display name + resolved unit names we currently derive by hand.
- **Confirmed (Porter/human): the view EXISTS** (`SELECT COUNT(*) … WHERE REQUEST_ID=18847` → 1).
- **a9 caveat DROPPED (falsified):** 18847 is an อ.9 and the view returns a row → อ.9 items DO live in
  `T_T_REQUEST_DTL` (the view's base table). The view serves a9 correctly.

## Design (one shared view entity/repo; swap all three builders)
1. New read-only entity `RequestDtlViewEntity` (`@Table(name="VW_REQUEST_DTL")`, `@org.hibernate.annotations.Immutable`,
   `@Id` on `ID`) mapping the columns from the filed view definition — at minimum:
   `ID, REQUEST_ID, ITEM_NO, PRODUCT_CODE, PRODUCT_NAME_DISPLAY_LICENSE, QUANTITY, QUANTITY_UNIT_NAME1,
   QUANTITY2, QUANTITY_UNIT_NAME2, STATUS`. Repo `RequestDtlViewRepository`:
   `findByRequestIdOrderByItemNoAsc(Long)` + `countByRequestId(Long)` (Oracle-11.2-safe — no FETCH FIRST).
2. In **a6, a9, a14** builders: `buildComponents` reads `requestDtlViewRepository.findByRequestIdOrderByItemNoAsc`;
   **item-4 count** = `requestDtlViewRepository.countByRequestId`. Drop the per-form Dtl repo usage for
   annex/count (`RequestDtl*` entities may remain for other uses).
   - **Print name = `PRODUCT_NAME_DISPLAY_LICENSE`** (the view's assembled licence-facing string — skips
     `'-'`, skips PRODUCT_GROUP_NAME when it duplicates PRODUCT_TYPE_NAME). Map it into `ComponentItem.productName`.
   - **Unit = the view's resolved `QUANTITY_UNIT_NAME1`** — replace the local
     `formatQuantity(q, unitId)` unit lookup (`unitRepository.findById(unitId).getUnitNameAbbr()`) with
     `format(quantity) + " " + QUANTITY_UNIT_NAME1`. **Drop the `unitRepository` unit-derivation.**
     (Note: `QUANTITY_UNIT_NAME1` = `T_M_UNIT.UNIT_NAME` = the **full** name; a6/a9 currently print the
     **abbr** — so the printed unit changes abbr→full. Intended per REQ-025 point 3 / "same as the rest of
     the system"; QA confirms it reads acceptably.)
   - `ComponentItem` record shape unchanged (itemNo/productCode/productName/quantityString) — only the source values change.
   - **NULL-status: adopt the view AS-IS.** Human ruling 2026-08-18 — do NOT count/flag/compensate for the
     view's `WHERE STATUS != 'D'` NULL-drop; whatever the view returns is what prints (the view's owners fix
     the view if wrong). No blankWhenNull change beyond the standing rule on the new string columns.
3. Future reports (a4-8) use the view too — this becomes the standard annex source.

## Regression guard (only the item list moves; a6/a9 DELIVERED)
Per REQ-025 point 4: **nothing outside the รายการ changes** — page-1 fields, evidence ticks, signatures,
law refs stay exactly as they are. Within the item list, expect: a6/a9 item **name** now = the view's
`PRODUCT_NAME_DISPLAY_LICENSE` and **unit** = full name (was abbr) — intended, QA confirms on a real sample.
Item **order + count** must match the view's output for that REQUEST_ID.
**Sample = 18847** (an อ.9 with a real item row). **Do NOT use 38362** — it legitimately has zero item rows
(empty annex is correct there, not a bug).

## Verify
- BE (DB-free where possible): builders compile + boot against the new view entity/repo; PreviewTests green
  (mocks supply components directly, so the view swap is a DB-path change — QA's leg for row content).
- QA (real DB): a6 annex unchanged (38272/38314); a9 annex correct on a real a9 with รายการ; a14 annex
  correct (27300/…); item-4 count matches the annex row count on each.

## Sequencing (Porter's question)
Porter prefers landing REQ-025 before TASK-019 (a14 item-12). They **do not collide** — TASK-022 touches
`buildComponents` + item-4 count (the annex); TASK-019 touches `buildTransportItem12`/a14 item-12 (evidence),
different methods. Either order works; TASK-022 is unblocked now, so it can land first cleanly.

## Tasks
- TASK-022 (UNBLOCKED): the view entity/repo + swap a6/a9/a14 buildComponents + item-4 count (name =
  `PRODUCT_NAME_DISPLAY_LICENSE`, unit = `QUANTITY_UNIT_NAME1`).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
