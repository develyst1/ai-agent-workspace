# TASK-052 — DEF-25 (a14): item 13 เอกสารอื่น ๆ split label from write-in

- **For:** Jason (BE)  · **From:** Sober (SA)  · **Ref:** DEF-25, TASK-051 (a4 pattern), SPEC-039
- **Depends on:** nothing. **a14 only** — independent builder, NOT the frozen a9 family.

## Defect
`A14CheckListReportBuilder.java:189` builds item 13 `เอกสารอื่น ๆ (ถ้ามี)` + value as ONE string with literal dots —
same class as DEF-25/a4. Value glues to label; dotted line vanishes when populated.

## Do
Mirror your a4 fix exactly: builder passes label + value separately (EvidenceItem detail/inputValue, no concatenation,
no literal dots); add the same form-agnostic gated dotted write-in element (`detail==null && inputValue!=null`) to a14's
`request-a14/subreport/request-a14-evidence.jrxml`; update the a14 mock in the same commit.

## Verify
Real /download of an a14 with item-13 data (value on its own dotted line) AND without (line still shows); confirm the
value exists in the sample first; extend structure_check for a14 item 13, fail-on-revert; build green.

## NOT in scope
a9-transport / a15 / a9-destroy item 13 — those are coupled to the frozen a9 base + transport and are on a stakeholder
ruling (see TASK-051 review / board DEF-25 row). Do not touch a9-transport.

---

## Done — Jason 2026-09-03

Mirrored the a4 fix exactly. a14 only; a9 family untouched.

- **Builder** — `new EvidenceItem("13", "เอกสารอื่น ๆ (ถ้ามี)", checked, null, otherDocNames, null)`.
  No concatenation, no literal dots, no new field.
- **Template** — the same form-agnostic gated element (`detail == null && inputValue != null`) added to
  `request-a14/subreport/request-a14-evidence.jrxml`. Checked first that a14's evidence band is structurally
  identical to a4's (same field x/widths after the R6/D3 pass), and that a14's label ends at the same
  displayed x=159.5 — so the a4 placement (x=125 w=380) transfers without re-deriving it.
- **Mock** updated in the same change; it carried the identical literal-dot string.

**Both states verified on the render:**
- populated → `13. เอกสารอื่น ๆ (ถ้ามี)` + value on a dotted run **165→545**
- empty (probe) → label alone, **run still printed 165→545**. Probe reverted.

**Fail-on-revert proven:** re-glued a14's label+value with literal dots →
`a14-preview.pdf item 13. has no dotted write-in run` and `… still uses LITERAL dots`. Restored → 28/28.

**Verifier:** rather than duplicate the a4 block, the DEF-25 assertions now loop over
`(a4, "17.")` and `(a14, "13.")` — same row, different item number per form. Adding the a9 family later is
one tuple.

### State
Suite **18/18**, BUILD SUCCESS. structure_check **28/28**, clip_check PASS, frozen_check PASS
(a9-transport untouched — confirmed, not assumed). Full tree (`verify/tree_check.sh`, nothing filtered):
```
 M src/main/java/com/smart/report/config/SecurityConfig.java     <-- still NOT mine (5th report)
 M .../a14/builder/A14CheckListPreviewBuilder.java
 M .../a14/builder/A14CheckListReportBuilder.java
 M .../a4/builder/A4CheckListPreviewBuilder.java      } TASK-051, not yet committed
 M .../a4/builder/A4CheckListReportBuilder.java       }
 M src/main/resources/reports-045/request-a14/subreport/request-a14-evidence.jrxml
 M src/main/resources/reports-045/request-a4/subreport/request-a4-evidence.jrxml
?? verify/
```
**Still open, not mine:** real /download of an a14 with item-13 data and one without (confirm the value
exists in the sample first). And the a9 family (transport / destroy / a15) item 13 remains on your ruling —
one builder + one mock + one element per form once you say go.

---
## Sober review — 2026-09-04 — ACCEPTED (a14 DEF-25 code CLOSED)
Verified DB-free: a14 builder item 13 = clean `EvidenceItem` (0 literal-dot runs); the gated element is present in
a14 evidence.jrxml (line 59, `$F{detail}==null && $F{inputValue}!=null`, identical to a4); structure_check 28/28 with the
a4/a14 DEF-25 loop, fail-on-revert; a9-transport frozen (no diff). Good — mirrors a4 exactly, verifier generalised to a
per-form tuple. **a14 item 13 → code CLOSED**, QA real /download (item-13 with + without data) to confirm.
a9-family item 13 remains on the stakeholder ruling (already routed). SecurityConfig = settled human seam, correctly untouched.
