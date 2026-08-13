# SPEC-012: อ.6 evidence sub-items — Type A (label-only) vs Type B (label + dotted write-in)

- Source: REQ-012
- Status: ACTIVE

## Overview
Render the item-8 "เอกสารอื่น ๆ (ถ้ามี)" value (from REQ-011) **on a dotted write-in
line** (govt-form style) instead of appended after the label. Presentation only — the
REQ-011 data/tick logic is unchanged. Scope: the `request-a6-evidenceSub` Jasper template
+ a small builder tweak.

## SA decision on the model (answers REQ-012 Q1): TARGETED, reuse `detail` — no new flag
Only "เอกสารอื่น ๆ" needs Type B today, so **do not** build a general per-sub-item
`renderType` model (speculative). The `EvidenceSub.detail` field already exists (used by
"person", null for "employer"). Use it as the **fill-in value** + a **null/non-null sentinel**
to pick the render type in the template:
- **Type B** ("เอกสารอื่น ๆ" row): `detail != null` (it's `""` when empty, or the names) →
  template draws label + dotted write-in line carrying `detail`.
- **Type A** (item 8 (1)-(4)): `detail == null` → template draws checkbox + label only (unchanged).

This needs **no new model field** and cleanly separates the two types by whether `detail`
is present.

## Builder change (`A6CheckListReportBuilder`, the REQ-011 block)
Change the "เอกสารอื่น ๆ" sub-row so the value lives in `detail`, label stays fixed:
```java
// label fixed (no appended value, no literal dots); value goes to detail (""=empty write-in, else names)
employerSubs.add(new EvidenceSub("employer", null, "เอกสารอื่น ๆ (ถ้ามี)",
        null, null, !otherDocNames.isBlank(), otherDocNames));   // detail = otherDocNames ("" when none)
```
- `otherDocNames` is `""` (not null) when there are none (`Collectors.joining` of an empty
  stream) → `detail != null` stays true → the "เอกสารอื่น ๆ" row is **always Type B** (blank
  dotted line when empty). The (1)-(4) rows keep `detail = null` → Type A.
- `checked` unchanged (tick when ≥1).

## Template change (`request-a6-evidenceSub.jrxml` → recompile `.jasper`)
In the **`"employer".equals($F{type})`** band, keep the existing checkbox + label
(x=48 box, x=64 label textField). **Add**, gated by `printWhenExpression` `$F{detail} != null`:
- a `textField` rendering `$F{detail}` placed to the right of the "เอกสารอื่น ๆ (ถ้ามี)" label
  (e.g. start x≈185 to the right margin), with a **dotted bottom border** for the write-in line:
  ```xml
  <element kind="textField" x="185" y="0" width="351" height="16"
           fontName="TH SarabunPSK" fontSize="14.0" hTextAlign="Left" vTextAlign="Bottom">
    <expression><![CDATA[$F{detail}]]></expression>
    <printWhenExpression><![CDATA[$F{detail} != null]]></printWhenExpression>
    <box><bottomPen lineWidth="0.75" lineStyle="Dotted"/></box>
  </element>
  ```
  (Exact x/width/style to be tuned in the preview to match the form; empty `detail` → the
  dotted underline shows blank, which is the intended write-in.)

### JR7 caveats (from CLAUDE.md — must respect or compile fails)
- `uuid` must be a real 36-char UUID **or omitted** (let Jasper gen). Don't invent a bad one.
- `textAdjust` only on `textField`. Band height ≥ (y+height) of every element (incl. the new one).
- Dotted line = `lineStyle="Dotted"` on a `<line>` pen or a box `bottomPen`. Keep layout/pagination
  intact (no overflow) — this is a single-row addition, minimal height impact.
- Recompile jrxml → jasper via the preview test (project has no maven jasper plugin):
  `./mvnw -o -Dtest=A6PreviewTest -DfailIfNoTests=false test` → check `target/a6-preview.pdf`.

## Definition of Done (see TASK-006)
- "เอกสารอื่น ๆ (ถ้ามี)" renders as label + dotted underline with `detail` on the line
  (not appended inline); empty value → blank dotted line.
- Item 8 (1)-(4) unchanged (Type A, `detail == null`).
- REQ-011 data/tick unchanged. Layout/pagination intact. `.jasper` recompiled.

## Tasks
- TASK-006: builder detail-field tweak + evidenceSub Type-B template + recompile (depends on: —)

## Questions
- **Q1 (Porter) — dotted-line style:** confirm the underline weight/dash + write-in width to
  match the printed form. SA default = a thin dotted bottom border spanning the remaining row
  width; Jason tunes in the A6 preview. Non-blocking (visual).
- **Q1 decided (REQ-012 Q on general-vs-targeted):** TARGETED (reuse `detail`), per above — no
  general renderType model unless a future line needs Type B.
