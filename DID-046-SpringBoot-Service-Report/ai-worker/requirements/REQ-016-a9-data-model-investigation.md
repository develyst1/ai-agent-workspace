# REQ-016: Investigate the อ.9 data model before building the A9 report

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th) — raised by Porter on SA's recommendation
- Deadline: none

## Problem / Goal
REQ-014 (build the real A9 report) assumed อ.9 mirrors the อ.6 data model. The DATA REQUESTs
disproved that:
- **No อ.9 evidence checklist group exists** in `T_S_REQUEST_CHECKLIST` (only 8 groups; อ.6 =
  `ReqSpecial`; none match อ.9's 13-item form) — checked with and without `IS_ACTIVE`.
- **`T_T_REQUEST_DOC` has ZERO rows** for the sample request 37940.
- **No `T_T_REQUEST_SPECIAL` row** for 37940 — the อ.9 payload lives in **`T_T_REQUEST_MOVE`**
  (FORM_ID 9), a different table family.
- Sample 37940's persons have **NULL STATUS** and only `PER_TYPE` 1/2 — no distinct
  "ผู้รับอาวุธ" (item 12 (2) `person2`) source.

So the whole อ.9 evidence section (13 items + ticks, item 12 (1)–(9)) currently has **no
identified data source**. Building now would mean guessing pages 2–3.

## Requirement
Determine, and document, the **real อ.9 data model** before any build:
1. Where the อ.9 evidence items (13, incl. item 12 sub-items) and their tick state come from.
   Candidate answers to evaluate:
   (a) a checklist master that must be **seeded** for อ.9 (data work — this team does not
       write to DBs, so the human/DBA would create it),
   (b) fixed labels in the report + ticks bound by `DOCUMENT_ID` (note: 37940 has no docs),
   (c) the evidence is not document-driven and derives from `T_T_REQUEST_MOVE` columns.
2. The source for **item 12 (2) `person2` (ผู้รับอาวุธ)**.
3. A field-by-field source map for the whole อ.9 form (the SPEC-008 equivalent), based on
   `T_T_REQUEST_MOVE` + whatever the above resolves to.
4. Confirm whether **37940 is a representative/complete อ.9 request** or an incomplete one.

## Acceptance Criteria
- [ ] Every อ.9 form section has a named data source (or an explicit "no source exists —
      requires X" statement).
- [ ] The evidence-section question (a/b/c above) is answered with evidence.
- [ ] `person2` source identified, or stated as missing with what's needed.
- [ ] A clear go/no-go + estimated shape for REQ-014's build.

## Constraints
- No DB writes by the team; all facts via DATA REQUEST to the human.
- Read-only investigation, same pattern as REQ-001 was for อ.6.

## Open ask to the human (Porter to collect)
- A **complete/representative อ.9 request id** (one that has documents attached and, if
  applicable, a receiver person) — 37940 appears incomplete for this purpose.
- OR a statement of the อ.9 evidence business model (what the 13 items are meant to be
  ticked from).

## Relationship
- **Blocks REQ-014** (A9 DB integration) and therefore REQ-013 (a9 seam).
- The live defect stands meanwhile: the real download endpoint returns MOCK data for อ.9
  (SPEC-014) — REQ-014 fixes it once we can build อ.9 from the DB.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
