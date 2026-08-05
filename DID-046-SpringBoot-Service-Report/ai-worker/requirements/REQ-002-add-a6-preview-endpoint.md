# REQ-002: Add/restore the อ.6 (a6) preview endpoint

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
To verify the อ.6 report (REQ-001), the stakeholder needs a **reference of what a
correct, complete อ.6 looks like**. There is already a working **preview endpoint
for อ.9** that renders the full layout with sample data and needs **no auth**:
`GET /document-service/api/v1/preview/checklist/a9?disposition=inline` — works today.
The equivalent for **อ.6** appears to be **disabled or missing**:
`GET /document-service/api/v1/preview/checklist/a6?disposition=inline` — currently
not working. The stakeholder wants the อ.6 preview available so it can serve as
the correctness baseline and so testing can start immediately.

> Human's words (Thai, verbatim): "ทำให้ มี preview a6 ด้วย แล้ว ไปเทสได้เลย
> เป้าหมายความถูกต้องคือ ผลลัพธ์ ของการดึง จาก request id มันควรได้ ผลลัพธ์ เหมือน
> .../preview/checklist/a6?disposition=inline ซึ่ง มันจะมี หน้าตาครบเลย แต่ตอนนี้
> เส้นนี้ น่าจะถูกปิด หรือหายไป … /preview/checklist/a9 … ยังใช้ได้ เลย ขนาดไม่มี
> auth หรือ x api key"

## Requirement
1. The system must expose `GET /api/v1/preview/checklist/a6?disposition=inline`
   that returns a PDF of the อ.6 checklist rendered with the **full/complete
   layout** (all sections and fields present), using sample/mock data — i.e. the
   อ.6 analogue of the existing, working a9 preview.
2. The a6 preview must **behave like the a9 preview**: same URL shape, same
   `disposition` handling, and **no auth / no X-API-KEY required** (matching a9's
   current behavior).
3. The output must render the complete อ.6 form so it can be used as the visual
   "correct" reference for REQ-001 verification.

## Acceptance Criteria
- [ ] `GET /api/v1/preview/checklist/a6?disposition=inline` returns HTTP 200 and a
      valid อ.6 PDF (no auth header needed), the same way a9's preview does today.
- [ ] The returned PDF shows the complete อ.6 layout (all sections/fields visible),
      matching the design of the a6 template.
- [ ] Behavior parity with the a9 preview (URL, disposition, no-auth).

## Constraints
- Backend-only Spring Boot service (existing JasperReports a6 templates).
- Mirror the existing a9 preview implementation rather than inventing a new pattern.
- Preview uses sample/mock data — it does not require the Oracle DB or a requestId.

## Out of Scope
- Verifying real-data correctness by requestId — that is REQ-001 (this preview is
  the reference REQ-001 compares against).
- Fixing any อ.6 data-mapping defects (e.g. D3 = item 7 duration source) — separate
  follow-up REQ.

## Relationship to REQ-001
This preview becomes the **correctness baseline** for REQ-001 AC#2/#3: Tanya
compares the real `download/checklist/{requestId}` output against this a6 preview's
layout. REQ-001 verification is best done **after** REQ-002 lands.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
