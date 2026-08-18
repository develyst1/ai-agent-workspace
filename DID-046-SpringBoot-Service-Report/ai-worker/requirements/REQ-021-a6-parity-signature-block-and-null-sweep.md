# REQ-021: Apply the same fixes to อ.6 — signature block always prints + null-leak sweep

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
Two defects found and fixed on อ.9 almost certainly exist on **อ.6** as well, which is already
DELIVERED and in use:

1. **Signature block disappears when there are no signers (DEF-9 equivalent).** On อ.9 the four
   signature slots vanished entirely for a request with no `T_T_LICENSE_INFORM` row, leaving only
   the "ขอรับรองว่าได้ตรวจสอบแล้ว…" line. These are **paper forms that must be signable by hand**, so
   the four slots must always print.
2. **Literal `"null"` printed in place of an empty value (DEF-5 equivalent).** อ.9 printed
   "ลงวันที่ null"; the human suspects อ.6 may have the same leak somewhere.
   > *"อ.6 แก้ให้ด้วย มีเรื่อง null ด้วยมั้ง ไม่รู้"*

## Requirement
1. The อ.6 **signature block renders unconditionally** — the four slots (signature line, (name)
   parentheses, position line) always print, blank when no signer data exists, populated when it does.
2. **Sweep the whole อ.6 report for literal "null" leaks** — every value field that can receive a null
   (dates, numbers, text, sub-report fields) must render blank instead of the string "null".
   Fix all occurrences, not just the one that mirrors อ.9's.
3. Do not change any อ.6 behaviour that was already delivered and verified.

## Acceptance Criteria
- [ ] An อ.6 request **with no signers** renders the four empty signature slots (form still signable).
- [ ] An อ.6 request **with signers** renders them exactly as today — no regression.
- [ ] No rendered อ.6 PDF contains the literal string "null" for any sampled request.
- [ ] The delivered อ.6 behaviours still hold: REQ-005 item 7 (PERIOD_TEXT), REQ-009 attachment ticks,
      REQ-010/REQ-015 person filtering, REQ-011 "เอกสารอื่นๆ", REQ-012 dotted write-in line.

## Constraints
- อ.6 is **DELIVERED and in use** — changes must be minimal and regression-checked.
- Verify on the **real DB path** (`/a6/db/{id}`), not only the mock preview — that is exactly how the
  อ.9 null leak escaped the first time.
- `.jasper` changes require regenerating into **`src/main/resources`** (not just target) + `clean
  compile` + restart, per the DEF-7 lesson.

## Suggested verification samples
- 38272 / 38314 — known-good อ.6 requests used throughout the อ.6 work.
- Plus any อ.6 request with no `T_T_LICENSE_INFORM` row, to prove the empty signature case.

## Traceability
- Mirrors อ.9's DEF-5 (null) and DEF-9 (signature block) — same paper-form principle the human set
  for the checklist: structure is locked, data merely fills it in.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
