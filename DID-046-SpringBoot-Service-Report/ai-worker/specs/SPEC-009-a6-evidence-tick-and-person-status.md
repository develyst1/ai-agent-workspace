# SPEC-009: อ.6 page-2 correctness — real-attachment tick (REQ-009) + person soft-delete filter (REQ-010)

- Source: REQ-009 + REQ-010 (bundled — same builder, same page-2 correctness class; Porter approved)
- Status: ACTIVE

## Overview
Two page-2 defects in `A6CheckListReportBuilder`, both fixable together:
- **REQ-009** — evidence checkbox ticks even when the document has no real attachment.
- **REQ-010** — person items 3/4 include soft-deleted (`STATUS='D'`) rows.

---

## REQ-009 — tick must reflect a REAL attachment

**Root cause (from code):** `hasFile(d)` = `d.getAttachFileId() != null && > 0` — it trusts
the **FK column** only. If the attachment file record is removed but `T_T_REQUEST_DOC.ATTACH_FILE_ID`
still holds the (now dangling) id, `hasFile` returns true → the box **stays ticked** (exactly the
38272 / row 46784 repro).

**Fix:** decide the tick from whether the **attachment row actually exists**, not the raw FK.
`RequestDocEntity` already maps `@OneToOne AttachFileEntity attachFile` (JoinColumn ATTACH_FILE_ID).
A dangling/null FK resolves the association to `null`; a real file resolves to a row. So:
```java
private boolean hasFile(RequestDocEntity d) {
    return d.getAttachFile() != null;   // real T_T_ATTACH_FILE row exists (handles null FK AND dangling FK)
}
```
Bonus: this **uses** the `t_t_attach_file` selects that are currently a wasted N+1 side-effect
(SPEC-008 "Runtime-only queries"). This one change also corrects the person doc ticks
(idCard/houseReg in `buildPersons` call the same `hasFile`).

**Rule scope (unchanged, flagged):** `checkedIds` is a **per-checklist-item aggregate** (an item
ticks if *any* `T_T_REQUEST_DOC` row with that `REQUEST_CHECKLIST_ID` has a file). With the fix,
removing the only doc row's attachment unticks the item. If an item has *multiple* doc rows, it
stays ticked while any sibling has a real file. The stakeholder's expectation reads as **per-row**;
the code is **per-item**. See Q1 — the `getAttachFile()` fix satisfies the reported repro either
way; only the multi-row-per-item case depends on Q1.

## REQ-010 — person query must exclude soft-deleted rows

**Root cause (from code):** `buildPersons` uses
`requestPerRepository.findByRequestIdAndPerTypeOrderByIdAsc(requestId, perType)` — **no status
filter** → `STATUS='D'` rows leak (38272: 92557–92566 = 'D' leak; only 92567–92569 = 'A').
Also: **`RequestPerEntity` currently maps no `STATUS` column at all** — it must be added before
the query can filter on it.

**Fix:**
1. `RequestPerEntity` — add `@Column(name = "STATUS") private String status;`
2. `RequestPerRepository` — `List<RequestPerEntity> findByRequestIdAndPerTypeAndStatusNotOrderByIdAsc(Long requestId, Integer perType, String status)`
3. `buildPersons` — call it with `STATUS_DELETED` ("D"), matching the doc query's `<> 'D'` convention.

### Soft-delete audit of the other a6 queries (ENTITY-mapping level)
| Entity (table) | STATUS mapped? | Action |
|---|---|---|
| RequestDocEntity (T_T_REQUEST_DOC) | ✅ yes | already filtered `<> 'D'` — OK |
| **RequestPerEntity (T_T_REQUEST_PER)** | ❌ no (add it) | **fix (this SPEC)** |
| RequestLawRefEntity (T_T_REQUEST_LAW_REF) | ❌ no | not filterable in code; see Q3 |
| RequestDtlEntity (T_T_REQUEST_DTL) | ❌ no | not filterable in code; see Q3 |
| RequestEmployerEntity (T_T_REQUEST_EMPLOYER) | ❌ no | not filterable in code; see Q3 |
| RequestCheckListEntity (T_S_REQUEST_CHECKLIST) | ❌ no (uses IS_ACTIVE=1) | master data, already gated by IS_ACTIVE |
| LicenseEntity / LicenseInformEntity | ❌ no | see Q3 |

> Caveat: "entity maps no STATUS" ≠ "DB table has no STATUS". If a table has an unmapped
> soft-delete column, its query still leaks 'D' rows. Confirming that is a schema fact (Q3 /
> DATA REQUEST) — out of the confirmed-leak fix but needed to fully close REQ-010 AC#2.

---

## Definition of Done (see TASK-004)
- 38272 item 1 (row 46784, attachment removed) → **unticked**; a doc WITH a real file → **ticked**.
- 38272 items 3/4 → only active persons (92567/92568/92569); the 'D' rows (92557–92566) gone.
- No regression where docs have real files / persons are all active.

## Tasks
- TASK-004: real-attachment tick + person STATUS filter (depends on: —)

## Questions
- **Q1 (Porter/human) — tick rule:** per-document-row or per-checklist-item aggregate? The
  `getAttachFile()` fix satisfies the reported repro; Q1 only matters if one อ.6 item legitimately
  has multiple `T_T_REQUEST_DOC` rows. Recommend per-item aggregate stays unless business says otherwise.
- **Q2 (Porter) — status convention:** confirm exclude `'D'` (matches the doc query) vs a positive
  `= 'A'`. Are there other non-active statuses (rejected/superseded) to also exclude? Defaulting to
  `<> 'D'` for consistency.
- **Q3 (DATA REQUEST → human) — audit completeness:** do `T_T_REQUEST_LAW_REF`, `T_T_REQUEST_DTL`,
  `T_T_REQUEST_EMPLOYER` (and `T_T_LICENSE`/`T_T_LICENSE_INFORM`) have a `STATUS` column with `'D'`
  rows? If yes, they need the same filter (entity field + query) as a follow-up; if no, REQ-010 AC#2
  is fully closed. One query:
  ```sql
  -- any 'D' rows in the request-child tables for a sample request?
  SELECT 'LAW_REF' t, COUNT(*) FROM T_T_REQUEST_LAW_REF   WHERE REQUEST_ID=:req AND STATUS='D'
  UNION ALL SELECT 'DTL',       COUNT(*) FROM T_T_REQUEST_DTL      WHERE REQUEST_ID=:req AND STATUS='D'
  UNION ALL SELECT 'EMPLOYER',  COUNT(*) FROM T_T_REQUEST_EMPLOYER WHERE REQUEST_ID=:req AND STATUS='D';
  -- (ORA-00904 "invalid identifier" on a line = that table has no STATUS column → not applicable)
  ```

## Answers (Porter, 2026-08-05)
- **Q2 answered:** use **`STATUS <> 'D'`** — consistent with the existing doc query.
  Observed T_T_REQUEST_PER data had only 'A'/'D'. If other non-active statuses
  (rejected/superseded) turn up, treat as a follow-up; for now exclude 'D' only.
- **Q1 answered by human (2026-08-05): per-item aggregate** — tick if ANY doc row for
  that checklist item has a real file. This matches the current fix exactly → **no
  further change needed**. (Removing the only row's attachment still unticks; multi-row
  items stay ticked while any sibling has a file — as the human intends.)
- **Q3 relayed to the human** as a DATA REQUEST (audit SQL above). If any table
  returns 'D' rows, I'll raise a follow-up REQ; if none, REQ-010 AC#2 fully closes.
- Fix satisfies the reported repro either way → routing REQ-009/010 to Tanya (IN_TEST)
  now; Q1/Q3 don't block the close proof.
