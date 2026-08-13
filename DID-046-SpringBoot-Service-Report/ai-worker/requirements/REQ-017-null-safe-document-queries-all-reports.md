# REQ-017: NULL-safe document queries across ALL report builders

> ⛔ **CANCELLED 2026-08-05 by the stakeholder — will NOT be fixed.**
> Their decision: *"A9 เลย เรื่อง null ไม่ต้องแก้เลย ปล่อยไปเลย"* — the NULL-status rows are
> legacy documents from a past problem; current data no longer produces them, so the
> stakeholder accepts the behavior and wants the team's effort on อ.9 (REQ-014) instead.
> **Known accepted consequence:** 215 document rows remain invisible to all 7 reports; if an
> old request is re-printed, its NULL-status documents will not appear/tick. Kept on file in
> case the decision is revisited. **Note this does NOT cancel REQ-015** (the person-query fix
> for the regression this team introduced), which is already implemented and with QA.

- Status: **CANCELLED (won't fix)** — stakeholder decision 2026-08-05
- Priority: MEDIUM (lowered 2026-08-05 — legacy data only; see Status semantics)
- Requested: 2026-08-05 by human (dev@smartalliance.co.th) — raised by Porter on SA's audit
- Deadline: none

## Problem / Goal
While fixing REQ-015 (the person-query NULL regression), SA audited the **document** queries and
found the same Oracle NULL trap — but **pre-existing and far wider**:

- `findByRequestIdAndStatusNot(...)` (and its `RefId` person-doc variant) generate
  `STATUS <> 'D'`. In Oracle, `NULL <> 'D'` is UNKNOWN, so **document rows with
  `STATUS = NULL` are silently excluded**.
- These queries are used by **all 7 report builders**: a1, a3, a6, expand, open,
  personChange, plantChange.

Impact: for any request whose document rows have NULL status, **every one of those reports
drops those documents** — evidence items render unticked / missing dates, with no error. This
is not our regression (it predates REQ-010), but it is live and cross-report.

## Requirement
1. The document queries must treat NULL as "not deleted": include rows where
   `STATUS IS NULL` as well as `STATUS <> 'D'`; exclude only `'D'`.
   (SA: same approach as REQ-015 — JPQL `@Query`, since a derived method name can't express it.)
2. Apply consistently to the request-document query **and** the person-document (`RefId`)
   variant, so every report builder that uses them is corrected.
3. No behavior change for rows that already have a non-NULL status.

## Acceptance Criteria
- [ ] A request with NULL-status document rows shows those documents (ticks/dates) on the
      affected report(s) instead of silently dropping them.
- [ ] `'D'` (soft-deleted) documents remain excluded everywhere — อ.6 behavior on 38272 is
      unchanged (REQ-009/010/011 results hold).
- [ ] All 7 builders compile and are covered by the change; no other query semantics altered.
- [ ] Oracle 11.2-safe.

## Constraints
- Backend-only; shared repository methods — SA to check every call site before changing shape.
- Higher blast radius than REQ-015 (touches all reports) — QA should regression-check อ.6 at
  minimum, plus any report the human considers critical.

## Optional DATA REQUEST (to size the exposure)
```sql
SELECT NVL(STATUS,'(null)') AS st, COUNT(*) FROM T_T_REQUEST_DOC GROUP BY STATUS;
```
If NULL-status documents are common, this is urgent; if rare, it is still correct to fix.

## Out of Scope
- The person query (done in REQ-015).
- อ.9 work (REQ-014/016).

## Traceability
- Found by SA during REQ-015's AC#3 audit. Pre-existing defect, not introduced by this team.

## Status semantics — confirmed by the human (2026-08-05)
Measured distribution of `T_T_REQUEST_DOC.STATUS`:
`A` 24,933 · `C` 8,884 · `W` 7,070 · `R` 122 · `(null)` **215** · `D` 109.

**Human ruling:** *"ทุกสถานะ ยกเว้น D ถ้า null ก็เอาขึ้นปกติ"* — i.e. the allow-list is
**everything except `'D'`, and NULL is included**. So the intended rule is exactly
`(STATUS IS NULL OR STATUS <> 'D')`; `C`/`W`/`R` stay included as they are today. No
allow-list change beyond fixing the NULL exclusion.

Exposure: **215 document rows** are currently being dropped from every report by the NULL trap.

**Human context (2026-08-05):** the NULL-status rows are **old/legacy documents created when
something went wrong**; recent documents no longer have NULL status. ⇒ Not a live/ongoing
problem, so Porter lowered this to **MEDIUM** and queued it **after the อ.9 work (REQ-014)**.
It is still worth fixing: those old requests can still be re-printed, and the fix is small
(same shape as REQ-015).

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
