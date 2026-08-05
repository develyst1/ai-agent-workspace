# REQ-005: Fix อ.6 item 7 "ระยะเวลาการอนุญาต" to print from the correct source

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
QA (TEST-002, DEF-1) confirmed on real UAT data that อ.6 item 7
"ระยะเวลาการอนุญาต" prints the **wrong value**: it shows `TOTAL_DAYS + " วัน"`
(e.g. "111 วัน / 90 วัน / 350 วัน") instead of the business-confirmed source
**`T_T_LICENSE.PERIOD_TEXT`**. This is the defect the stakeholder originally
suspected. It must be corrected so the printed permit duration is accurate.

## Requirement
1. อ.6 item 7 "ระยะเวลาการอนุญาต" must be sourced from **`T_T_LICENSE.PERIOD_TEXT`**
   (the business-confirmed field), not `T_T_REQUEST_EMPLOYER.TOTAL_DAYS`.
2. Since `PERIOD_TEXT` is already a text value, the hardcoded `" วัน"` suffix must
   be reviewed and removed if it produces a wrong/duplicated unit.
3. The corrected value must appear in the generated อ.6 PDF for the affected requests.

## Acceptance Criteria
- [ ] For the sample ids (38240/38272/38273) the printed item 7 matches
      `T_T_LICENSE.PERIOD_TEXT`, not the old `TOTAL_DAYS + " วัน"`.
- [ ] No stray/duplicated unit (e.g. "…วัน วัน") in the output.
- [ ] QA re-runs REQ-001's item-7 check and it passes (DEF-1 closed).

## Constraints
- Backend-only; change limited to the item-7 sourcing in the อ.6 builder
  (`A6CheckListReportBuilder`, ~lines 83-85). Do not disturb other items.
- Read-only QA against localhost:33000 (UAT-wired) for verification.

## Out of Scope
- Other defect leads (D1, D2, D4, D5) — verified/tracked separately under REQ-001.

## Traceability
- Source defect: TEST-002 DEF-1 (= SPEC-001 lead D3). Business rule: SPEC-001 §Q2
  (human-confirmed source = `T_T_LICENSE.PERIOD_TEXT`).

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
