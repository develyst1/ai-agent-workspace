# REQ-036: อ.4 correctness document — the rule behind every section, with SQL the stakeholder can run

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-09-07 by human (dev@smartalliance.co.th)
- Model: `specs/SPEC-008-a6-sql-field-mapping.md` (the equivalent for อ.6). No such document exists
  for อ.4 — `SPEC-034` is the build spec, not a verification mapping.

## What the stakeholder asked for
> *"ขอวัดความถูกต้องของ a4 บอกหลักการของแต่ละส่วนมาให้ครบ ขอข้อมูล ขอ sql result ได้"*

They want to **audit อ.4 themselves**. For every section of the form: what rule decides what prints,
where the data comes from, and **a query they can paste and run** to see the same values the report
sees. They supply the SQL results; we do not touch the DB.

## Requirement
Produce `specs/SPEC-041-a4-correctness-field-mapping.md`. For **every** section of อ.4 — page-1 header
and body, ระยะเวลา (item 6), the annex/รายการ block, all 17 evidence items including item 17
`เอกสารอื่น ๆ`, and the signature block — give:

| column | content |
|---|---|
| **Section** | the item number and label **as it prints on the form** |
| **Rule** | what decides the value, in one plain sentence (tick rule, ครบ rule, fallback, formatting) |
| **Source** | table.COLUMN, and the join path if it is not direct |
| **Code** | `File.java:line` |
| **Verify SQL** | a runnable query returning what that section should show for a given `REQUEST_ID` |
| **Status** | `VERIFIED on real data (id)` · `UNVERIFIED — no sample exists` · `ACCEPTED GAP (why)` |

## Non-negotiables
- **Every row's Source and Code cited from the builder — no guessing.** If you cannot trace a value to
  a line, write `UNKNOWN` and say so. An honest gap is worth more than a plausible-looking mapping.
- **Oracle 11.2**: no `FETCH FIRST`; use `(STATUS IS NULL OR STATUS <> 'D')` — bare `<> 'D'` is UNKNOWN
  on NULL and silently drops rows.
- Queries take `REQUEST_ID` as the only parameter, and default to **38427** (the accepted a4 sample).
- **State what each query proves in one line**, so the stakeholder is not reverse-engineering our intent
  from SQL.
- **Carry the known gaps forward verbatim; do not let the document read as full coverage:**
  - annex อ.8 3-column block, item-6 §4 and the 1:N rule — **`T_T_REQUEST_DTL_REF_IMPORT` is EMPTY**,
    never rendered a real value.
  - item 17 populated branch — **PASS** on 38427 (stakeholder accepted by eye).
- Where a section is genuinely unverifiable today, **include the query that would prove it** once such
  a request exists. That is what turned two hand-waves into evidenced gaps last round.

## Acceptance Criteria
- [ ] Every printed section of อ.4 appears — none silently omitted. Say how you enumerated them
      (walk the builder, not the render) so completeness is checkable.
- [ ] Each row has Rule · Source · Code · Verify SQL · Status.
- [ ] The stakeholder can run the queries top to bottom and compare against a render of 38427 without
      asking us anything.
- [ ] Gaps are labelled as gaps, in the same table, not in a footnote.

## Constraints
- SA/BE **never run SQL**. This document is written from the code; the stakeholder executes it.
- Do not change any a4 code as part of this. If writing it exposes a defect, **raise it separately** —
  do not fix it inside the mapping work.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
