# TASK-051 — DEF-25: อ.4 item 17 `เอกสารอื่น ๆ (ถ้ามี)` — split label from write-in (stakeholder-directed)

- **For:** Jason (BE)  · **From:** Sober (SA)  · **Ref:** DEF-25 (stakeholder-directed via Porter), REQ-033 class, SPEC-039 split rule
- **Depends on:** nothing. a4 only.

## Defect (source-verified, `A4CheckListReportBuilder.java:203-204`)
Item 17 is built as ONE concatenated string:
```java
? "เอกสารอื่น ๆ (ถ้ามี)  ......................................"   // empty  → dots are LITERAL TEXT
: "เอกสารอื่น ๆ (ถ้ามี)  " + otherDocNames                          // populated → NO dotted line at all
```
So a populated request renders `17.☑ เอกสารอื่น ๆ (ถ้ามี)  test` — value glued to the label, **no underline**. The
"dotted line" only exists as literal dots in the empty branch. This is REQ-033's defect class (label+write-in as one
string) surviving in a row nobody re-checked.

## Do (SPEC-039 split rule — this is a genuine SHAPE difference, so it gets its own band)
- Give item 17 its **own row type + band**: a static label `เอกสารอื่น ๆ (ถ้ามี)` + a **dotted write-in field** bound to
  `otherDocNames` (blankWhenNull), so the underline is a real field that shows whether or not there's data — not literal
  dots that vanish when populated.
- Do NOT compose the label and value into one string. No literal dot characters.
- a4 only (confirm no other form shares this exact concatenation; if the same pattern exists elsewhere, flag it, don't fix silently).

## Verify (evidence)
- **Real /download** of an a4 with item-17 data (value on its own dotted line, not glued) AND one without (dotted line
  still shows). Confirm the value EXISTS in the sample first ([[confirm-value-exists-before-diagnosing-render]]).
- Extend `structure_check.py`/`clip_check` so item 17 renders label + dotted field, **fail-on-revert** (re-glue → fail).
- Update the mock in the SAME commit to emit the new row type ([[mock-must-mirror-db-builder]]).
- 15/15 build; a9-transport frozen (`frozen_check.sh`), untouched by this.

## Acceptance
a4 item 17 renders `เอกสารอื่น ๆ (ถ้ามี)` + a real dotted write-in (value on the line when present, empty line when not),
verified on a real /download; no concatenated label+value; mock updated; fail-on-revert asserted.

---
## Also (same turn, small — person-with-idcard re-measure, NOT a band)
Porter's Q3 answer (stakeholder bfc4b76): the "inline can't fit (needs x=633 vs page 551)" measurement assumed the row's
caption widths were fixed — **they are not**. Before accepting the 2-line wrap on **อ.14 item-6** and **อ.9-destroy
item-12(2)** person rows: **re-measure with caption-reclaim** (shrink `เลขที่`/`สำเนาบัตรประชาชน`/`วันหมดอายุ` captions to
what their text needs, give the slack to the value fields, shift left — the technique the stakeholder used 4× on destroy).
Report whether `วันหมดอายุ` then fits inline. If yes → geometry fix (no band). If it still overflows even after reclaim →
tell me with the numbers and it's a stakeholder shape call. **Measure, don't estimate** ([[relayed-numbers-are-claims-not-facts]]).
