# REQ-012: อ.6 evidence sub-items — support two render types (label-only vs label + dotted write-in)

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
REQ-011 made item-8 "เอกสารอื่น ๆ (ถ้ามี)" show the right value, but it prints the value
**appended after the label as plain text**. The stakeholder wants the value rendered as a
**fill-in on a dotted underline** (the government-form write-in style), and more generally
wants evidence sub-items to support **two distinct render types**.

## Requirement
The อ.6 evidence sub-items should render in one of two types (per sub-item):
1. **Type A — checkbox + label only.** e.g. item 8 (1)-(4):
   `☑ (1) หนังสือของส่วนราชการผู้ว่าจ้าง...`
2. **Type B — checkbox + label + a dotted write-in line carrying a value.**
   e.g. "เอกสารอื่น ๆ":
   `☑ เอกสารอื่น ๆ (ถ้ามี) .....ทดสอบ2, ทดสอบ 1.....`
   where the dynamic value (from REQ-011) is printed **on the dotted line**, not appended
   inline. When there is no value, the dotted line shows empty (blank write-in).

Specifically: the **"เอกสารอื่น ๆ (ถ้ามี)"** line must be **Type B** — keep the fixed label
+ dotted underline, and place the comma-joined document names (REQ-011) on the line.

## Acceptance Criteria
- [ ] "เอกสารอื่น ๆ (ถ้ามี)" renders as label + dotted underline with the value on the line
      (not plain-appended); empty value → blank dotted line.
- [ ] Existing label-only sub-items (item 8 (1)-(4)) are unchanged (Type A).
- [ ] The REQ-011 data (which docs, comma-join, tick-when-≥1) is unchanged — this REQ is
      presentation only.

## Constraints
- This is a **Jasper template (.jrxml/.jasper) + builder-field** change (the sub-item needs
  a render-type flag and separate label/fill-in-value fields), not just a Java string tweak.
  Backend + report template only.
- Keep the อ.6 layout/pagination intact (no overflow).

## Out of Scope
- Changing which documents appear or the tick rule (that's REQ-009/011).

## Questions
- SA: is a per-sub-item `renderType` (A/B) + a `fillInValue` field the cleanest model, or
  is "เอกสารอื่น ๆ" the only Type-B line (a targeted template change)? Recommend the general
  model only if other lines will need Type B; otherwise keep it targeted.
- Confirm the dotted-line style/length to match the existing form template.

## Traceability
- Presentation refinement on top of REQ-011 (SPEC-011 §item-8 "เอกสารอื่น ๆ").
