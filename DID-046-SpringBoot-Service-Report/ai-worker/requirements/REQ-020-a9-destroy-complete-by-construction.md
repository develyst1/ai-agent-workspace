# REQ-020: Finish the อ.9 DESTROY report now, without real data — full-coverage mock preview

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
The destroy variant cannot be verified with real data, and **it will not be possible for a while**:
the frontend/backend team that builds the อ.9 **destroy request creation flow has not finished it**
and has been pulled onto more urgent work. So no destroy request can be created, and every existing
อ.9 request is transport-type with no checklist linkage.

The stakeholder's decision: **do not wait.** Use what we have to "imagine" a complete อ.9 destroy
request and finish the checklist report now.
> *"ตอนนี้มันสร้างใบทำลายไม่ได้เลย เพราะ UI frontend + backend เขาที่ทำส่วนนี้เขายังทำไม่เสร็จ …
> แต่เราอ่ะ จะต้อง นำข้อมูลที่เรามี มา imagine หรือ จินตนาการ ใบ a9 ทำลาย แล้วทำ checklist report
> นี่ ให้เสร็จก่อน"*

## What we already have (this is more solid than "guessing")
1. **The official destroy form** — `project-docs/A9-form-DESTROY-official.pdf` = exact wording,
   item order and layout.
2. **The REAL seeded master `ReqMoveDestroyer`** (T_S_REQUEST_CHECKLIST, IDs 98–116, SEQ 1–19,
   IS_ACTIVE=1 only) — real labels, order, `OPTIONAL`, `DOCUMENT_ID`, `DOCUMENT_TYPE` from the data
   team. The evidence section can be built against real master data, not invented labels.
3. **A working mock mechanism** — `A9CheckListPreviewBuilder` already backs `/preview/checklist/a9`.
4. Proven-real page-1 plumbing from the transport sample (name, permitType, destroyLocation,
   duration, law refs, signatures, components all confirmed flowing).

## Requirement
1. **Complete the destroy variant by construction**: every field/item of the official destroy form is
   implemented and bound, using the `ReqMoveDestroyer` master for the evidence section (labels, SEQ
   order, optional flag) and the agreed sources for page 1.
2. **Provide a full-coverage DESTROY mock preview** the stakeholder can open and compare against the
   official PDF — a simulated "complete" destroy request with **every** field populated:
   all 19 evidence items with a realistic mix of ticked/unticked, dates present, persons, item 12(2)
   ตัวอย่างลายมือชื่อผู้รับอาวุธ, all four signatures, annex rows, page headings.
   Purpose: prove the whole form renders correctly **without a real request existing**.
3. The mock must sit on the **same builder/template path** as the real one, so switching to real data
   later is a data swap, not a rebuild. No parallel "mock-only" template.
4. Keep the real DB path working and degrading gracefully for historical requests (NULL
   REQUEST_CHECKLIST_ID + legacy DOCUMENT_ID scheme ⇒ labels shown, nothing ticked, no exception).

## Acceptance Criteria
- [ ] A destroy mock preview endpoint/route renders the **complete** destroy form with every field
      populated, and it visually matches `A9-form-DESTROY-official.pdf`.
- [ ] The evidence section is driven by the real `ReqMoveDestroyer` master (19 rows, IS_ACTIVE=1),
      not hardcoded labels.
- [ ] The same code path serves real data when a real destroy request finally exists — no rework.
- [ ] Historical/real requests still render gracefully (no ticks, no errors).
- [ ] Open assumptions are listed in the SPEC with what will confirm them once real data appears.

## Constraints
- No destroy request can be created until the other team finishes their flow — do not plan around it.
- Oracle 11.2-safe; `.jasper` changes require `clean compile` + restart before testing.
- GROUP_CODE constants: destroy = **`ReqMoveDestroyer`**, transport = **`ReqMove`** (corrected).

## Out of Scope
- The transport variant (REQ-019 step 2) — next, after this.
- Anything requiring the other team's request-creation flow.

## Follow-up when real data exists
Re-run the destroy report against the first real type-2 request at MOVE_STATUS ≥ 18 and confirm the
assumptions list. Tracked as a standing item, not a blocker.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
