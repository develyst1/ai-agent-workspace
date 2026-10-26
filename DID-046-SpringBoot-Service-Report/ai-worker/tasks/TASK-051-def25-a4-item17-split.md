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

---

## Done — Jason 2026-09-03

### อ.4 item 17 — split, no literal dots
`EvidenceItem` already carried `detail`/`inputValue`, so **no new field was needed**:
`new EvidenceItem("17", "เอกสารอื่น ๆ (ถ้ามี)", checked, null, otherDocNames, null)`.

Added one dedicated write-in element to **a4's evidence subreport only**, gated on
`$F{detail} == null && $F{inputValue} != null` — that identifies "a row with a value but no caption",
which is item 17 and nothing else. **I did not hardcode the item number**, because the same row is item
**13** on a14/a9 (see below), so a number would have made the fix un-reusable the moment you say the word.

Placed by measurement, not guess: the rendered label ends at jrxml x≈119, so the field starts at 125 and
runs to 505.

**Both states verified on the render:**
- populated → `17. เอกสารอื่น ๆ (ถ้ามี)` then the value at x=165 **sitting on a dotted run 165→545**.
- empty (probe) → label alone, **dotted run still printed, 165→545**. Probe reverted.

Mock updated in the same change (per [[mock-must-mirror-db-builder]]) — it had the identical literal-dot string.

**Fail-on-revert proven:** re-glued the label+value with literal dots → both new assertions fired:
`item 17 has no dotted write-in run` and `item 17 still uses LITERAL dots (label+value concatenated)`.
Restored → 27/27.

### 🔴 The same defect is on FOUR more forms — flagged, not fixed (as instructed)
Byte-identical code, same literal-dot string:
- `A14CheckListReportBuilder.java:188-191` — item **13**
- `A9CheckListReportBuilderBase.java:233-236` — item **13** (so a9-transport, a9-destroy **and** a15)

So DEF-25 is a 5-form defect, not a4-only. My printWhen discriminator is deliberately form-agnostic, so
extending it is: change those two builders + their mocks, and add the one element to each form's evidence
subreport. ⚠️ **a9-transport is frozen** — that one needs your ruling before I touch it.

### Person-with-idcard re-measure with caption-reclaim — **you were right to push back**
My earlier "needs x=633 vs 551" assumed the caption widths were fixed. Re-measured on the a9-destroy render
with per-field slack (displayed px; the subreport sits at +33):

| field | window | text | slack |
|---|---|---|---|
| seq `(1)` | 97–121 | 97–107.4 | **13.6** |
| name | 114–232 | 114–214.3 | 17.7 *(data-dependent)* |
| docTypeLabel | 272–392 | 272–382.5 | **9.5** |
| `เลขที่` caption | 396–420 | ~396–421 | ~0 — already reclaimed |
| id value | 420–538 | 421–508.2 | **29.8** |

- Line 1 ends **x=508.2**; line-2 content (`วันหมดอายุ 1 ม.ค. 2569`) is **96px**.
- Inline needs **508.2 + 6 + 96 = 610.2**; the page's widest ink elsewhere is **550.7** → must save **59.5px**.
- **Safe reclaim** (fixed-format fields only: seq + docTypeLabel + id) = **52.9px** → lands at **557.3**, still
  **6.6px over**.
- Including the name field's 17.7px would reach 539.6 and fit — but that slack is **data-dependent**; a longer
  real name would then clip, and names are the one thing here we can't bound.

**So: inline is ~7px short on safe reclaim, not 82px short.** That's materially different from my first
number and I was wrong to report it without reclaim. It is now a genuine judgement call rather than a
physical impossibility: shrink the name field and accept a clip risk on long names, or keep the two-line
wrap. **Not mine to decide** — over to you/the stakeholder, with the numbers above.

### State
Suite **18/18**, BUILD SUCCESS. structure_check **27/27** (+2 DEF-25, fail-on-revert proven), clip_check PASS,
frozen_check PASS (a9-transport untouched). Full tree (`verify/tree_check.sh`, nothing filtered):
```
 M src/main/java/com/smart/report/config/SecurityConfig.java   <-- still NOT mine (4th report)
 M .../a4/builder/A4CheckListPreviewBuilder.java
 M .../a4/builder/A4CheckListReportBuilder.java
 M src/main/resources/reports-045/request-a4/subreport/request-a4-evidence.jrxml
?? verify/
```
Still open, not mine: **real /download** of an a4 with item-17 data and one without (confirm the value exists
in the sample first).

---
## Sober review — 2026-09-04 — a4 ACCEPTED; DEF-25 confirmed 5-form; a9-family is freeze-coupled
Verified: a4 builder no longer concatenates (line 206 passes label+value separately), a4 evidence.jrxml has the gated
write-in element, mock updated, structure_check 27/27 fail-on-revert. **a4 item 17 = fixed.** Good form-agnostic
discriminator (`detail==null && inputValue!=null`, no hardcoded item number) — that's what makes it reusable.

**DEF-25 5-form scope confirmed in source:** `A14…:189` (item 13, independent builder) + `A9CheckListReportBuilderBase:234`
(item 13, shared by **transport + a15 + destroy**). Ruling on how to extend:
- **a14 → fix NOW (TASK-052)** — independent builder, not frozen. Mirror the a4 pattern.
- **a9-family (transport/a15/destroy) → NOT a straight extend.** The fix changes the **shared base builder** (stop
  gluing) which changes **transport's** output → transport's frozen evidence.jrxml would need the new element too
  (its item-13 dots are literal text in the builder string; jrxml has 0 dots). That couples the whole a9-family fix to
  the **frozen a9-transport** file → **stakeholder ruling required** (route via Porter; they may do it themselves as with
  bfc4b76, or lift the freeze for Jason). Do NOT touch a9-transport without it.

**Person re-measure — thank you, correct pushback.** ~7px short on safe reclaim (not 82). Ruling/recommendation:
**keep the 2-line wrap.** Inline only "fits" by eating the name field's 17.7px, which is data-dependent → a longer real
name clips on a legal document. All data already renders on 2 lines; a 7px gamble on name length isn't worth a clip.
Routing to stakeholder with your numbers + this recommendation; their cosmetic call, but safe = keep 2-line.
