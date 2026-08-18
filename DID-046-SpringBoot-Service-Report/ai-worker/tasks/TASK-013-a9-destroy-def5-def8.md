# TASK-013: อ.9 DESTROY — close the two residual defects (DEF-5 null leak, DEF-8 label truncation)

- Source: SPEC-020 review (residual after TASK-012's 6 items were accepted). Porter handoff 2026-08-05:
  "remaining a9-destroy work is now just DEF-5 and DEF-8. Nothing else."
- Status: DONE (Sober-reviewed, independently verified)
- Assignee: Jason (BE)
- Depends on: none (TASK-012 items 1,3,4,5,6 accepted; DEF-6 CANCELLED — do NOT touch headings)

## Scope guard
Exactly TWO template defects below. **Do NOT** change headings (DEF-6 is CANCELLED — the two-page
headings differ **by design** and already match the official destroy PDF). No builder logic changes are
required for DEF-8; DEF-5 is a template guard (builder is already null-safe — see diagnosis).

---

## DEF-5 — literal "null" on the DB render path (item 2, page 2)

### Diagnosis (already localized — do not re-hunt the builder)
The builder is null-clean: `issueDate(d)` returns a real `null` (`d == null ? null :
ThaiDateFormatUtil.formatOrNull(...)`), `moveDurationText` uses `nz(...)`, `buildPerson2` uses `nz(...)`
throughout. So the "null" is **template-side**, and it only shows on the DB path because the
**A9PreviewTest mock supplies non-null dates** — that is why it never reproduced in preview.

Mechanism: item 2 is `new EvidenceItem("2","หนังสือมอบอำนาจ", checked, "ลงวันที่",
issueDate(docByChecklist.get(id2)), null)`. When the doc has no issue date, `inputValue = null`. With
`@JsonInclude(NON_NULL)` on the model, a null `inputValue` is **omitted from the JSON**, so in Jasper
`$F{inputValue}` evaluates to null. The value textField that prints it has **no `isBlankWhenNull`**, so
a null can surface as the literal text "null".

Culprit fields in `src/main/resources/reports-045/request-a9/subreport/request-a9-evidence.jrxml`:
- **line ~51–53** — item-2 value: `printWhenExpression="2".equals($F{orderNo})`, `expression=$F{inputValue}`, no guard.
- **line ~44–46** — non-item-2 value: `printWhenExpression=$F{inputValue}!=null && !"2".equals($F{orderNo})`,
  `expression=$F{inputValue}` (guarded by printWhen, but add the attribute anyway for safety).

### Fix (template only, by construction)
1. Add **`isBlankWhenNull="true"`** to every value textField in `request-a9-evidence.jrxml` whose
   expression can be null (the two `$F{inputValue}` fields above at minimum). Null → blank, never "null".
2. Sweep `request-a9-evidenceSub.jrxml` for the same pattern (`$F{detail}`, `$F{detail2}`,
   `$F{idCardNo}`, `$F{expiryDate}` value textFields) and add `isBlankWhenNull="true"` wherever a null
   value is possible. Keep it to null-capable value fields; do not touch static labels.

### Reproduce + verify WITHOUT the DB (you can close this yourself)
The mock hides the bug only because its dates are non-null — so make one null:
1. In the A9 **preview** builder (`A9CheckListPreviewBuilder` / whatever `A9PreviewTest` calls), set
   **one** evidence item's `inputValue` to `null` (e.g. item 2's date). Rebuild the preview PDF
   **before** your template fix and confirm the preview now shows "null" (reproduces DEF-5 DB-free).
2. Apply the `isBlankWhenNull="true"` guards, regenerate, confirm that item renders **blank** (dotted
   line / empty), no "null" anywhere in `target/a9-preview.pdf` (grep the extracted text for "null").
3. Leave the mock item null in place (or a dedicated null-case fixture) so the guard stays regression-tested.
4. QA confirms on the real path (`/a9/db/{id}`) — BE must not hit the DB (rule #4). QA reports WHERE any
   "null" still appears; if one survives, it points at a field we did not guard.

---

## DEF-8 — item 12(2) receiver doc-type label truncates

### Diagnosis (geometry)
`request-a9-evidenceSub.jrxml`, person2 row (lines ~134–140):
- `docTypeLabel` textField: **x=239, width=118** (ends at x=357), fontSize 14, `hTextAlign=Left`, no `textAdjust`.
- then static "เลขที่": x=357, width=30 (ends 387).
- then idCardNo textField: x=387, width=118 (ends 505). Band width ≈ 535 → only ~30px slack at the right.

`width=118` at 14pt fits only ~26 Thai glyphs. Type 2 "สำเนาบัตรประจำตัวข้าราชการกลาโหม" (~30) prints as
"…ข้าราชการก"; type 3 "สำเนาบัตรประจำตัวเจ้าหน้าที่ของรัฐ" (longest) truncates worse. (Type 1
"สำเนาบัตรประจำตัวประชาชน" fits — that is why only receiver (2) looked wrong.)

### Fix (template only — pick the least-disruptive that fully shows type 3)
Recommended order (tune in the A9PreviewTest loop with a **type-3** mock label = the longest):
1. **`textAdjust="ScaleFont"`** on the `docTypeLabel` textField — auto-shrinks the font to fit width=118,
   no reflow of "เลขที่"/idCardNo. Simplest; verify type-3 is fully readable (font not too small).
2. If ScaleFont shrinks it too small: **widen `docTypeLabel`** (e.g. 118 → ~155) **and shift** the
   "เลขที่" static (x=357 → ~394) + idCardNo field (x=387 → ~424, reduce its width) right, staying inside
   the band width (≈535). Confirm the whole row (label + เลขที่ + id number) still fits on one line.
3. Do NOT wrap to 2 lines unless 1+2 both fail — a wrapped checklist row misaligns the receiver block.

### Verify (BE, DB-free)
Set the person2 mock in the preview to `docTypeLabel` = the **type-3** string
"สำเนาบัตรประจำตัวเจ้าหน้าที่ของรัฐ", regenerate `target/a9-preview.pdf`, and confirm the full label is
visible (extracted text contains the complete string, not a truncated prefix). Also confirm type-1 and
type-2 still render fully.

---

## Definition of Done
- [ ] `request-a9-evidence.jrxml` value `$F{inputValue}` textFields (item-2 + non-item-2) carry
      `isBlankWhenNull="true"`; evidenceSub null-capable value fields swept likewise.
- [ ] Preview with a **null** inputValue item renders **blank** (no "null" in the extracted PDF text) —
      and reproduced "null" **before** the fix to prove the guard works.
- [ ] `docTypeLabel` fully shows the **type-3** label in the preview (ScaleFont, or widen+shift); type-1/2 unaffected.
- [ ] `./mvnw -o -DskipTests=false test-compile` green; `A9PreviewTest` green (a9 pages=4); no other output change.
- [ ] Headings untouched (DEF-6 CANCELLED). No builder logic change for DEF-8.

## Handoff after DoD
BE closes the two DB-free proofs above → back to **Sober** for review, then **Tanya (via Porter)**
confirms DEF-5 blank on a real `/a9/db/{id}` render (the only leg that needs the DB).

## Implementation Notes
Both defects reproduced DB-free first, then fixed, then re-verified (A9PreviewTest loop; no DB).
**Changed:** `request-a9-evidence.jrxml` + `request-a9-evidenceSub.jrxml` (template guards / ScaleFont)
+ `A9CheckListPreviewBuilder.java` (regression fixtures). No builder-logic / heading change.

**DEF-5 (null leak):**
- Reproduced: set the mock item-2 `inputValue=null` → preview showed literal **"null"** (grep hit) —
  DB-free repro confirmed (the item-2 value textField `printWhen "2".equals(orderNo)` prints regardless
  of null, and the model's `@JsonInclude(NON_NULL)` drops the null so `$F{inputValue}`→null→"null").
- Fixed: added `blankWhenNull="true"` to the null-capable value textFields — `request-a9-evidence.jrxml`
  the two `$F{inputValue}` fields (item-2 + non-item-2) and the item-2 `$F{detail}`; swept
  `request-a9-evidenceSub.jrxml` person/person2 `$F{detail}`/`$F{detail2}` + `$F{docTypeLabel}` (5 fields).
- Verified: same null-item preview now renders **blank** — `'null' not in` the extracted PDF text.
  Left the mock item-2 `inputValue=null` in place as a standing regression fixture.

**DEF-8 (docTypeLabel truncation):**
- Reproduced: set the mock person2 `docTypeLabel` to the **type-3** longest string
  "สำเนาบัตรประจำตัวเจ้าหน้าที่ของรัฐ" → the full string was absent, a truncated prefix present.
- Fixed: added `textAdjust="ScaleFont"` to the `docTypeLabel` textField (x=239 w=118) — auto-shrinks to
  fit, no reflow of "เลขที่"/idCardNo (option 1). Verified: `search_for` of the **full type-3 string** > 0
  in the preview PDF; type-1/2 unaffected. (Left the type-3 label as the person2 fixture.)

**Verify:** `./mvnw -o -DskipTests=false test-compile` → BUILD SUCCESS (`blankWhenNull`/`ScaleFont` are
valid JR7 element attrs — no "Unrecognized field"); `A9PreviewTest`+`A6PreviewTest` → Tests run: 2,
Failures: 0 (a9 pages=4, a6 pages=3 — no regression). Headings untouched (DEF-6 CANCELLED). This task's
source diff = the 2 evidence jrxml + `A9CheckListPreviewBuilder` (the main.jrxml/builder/model diffs are
the still-uncommitted TASK-012 work).
@Sober: both DB-free proofs green — ready for review; then QA confirms DEF-5 blank on a real `/a9/db/{id}`.

## Review
**Verdict: DONE** (Sober, 2026-08-18). Independently verified — re-rendered `target/a9-preview.pdf` from
the mock (A9PreviewTest, no DB) and inspected the extracted text myself:
- **DEF-5:** grep for "null" over the whole PDF → **NONE**. Item 2 renders "หนังสือมอบอำนาจ ลงวันที่"
  with the date value **blank** (not "null"). The null-inputValue fixture (item 2, preview builder
  line ~74) is in place, so the guard stays regression-covered. `blankWhenNull="true"` confirmed on the
  culprit item-2 `$F{inputValue}` (evidence.jrxml:51) + the other null-capable value fields (evidence
  40/44; evidenceSub 67/76/134/140/149). ✅
- **DEF-8:** full type-3 label "สำเนาบัตรประจำตัวเจ้าหน้าที่ของรัฐ" is **present and complete** (no
  truncated prefix), followed by เลขที่ + id on one line — `textAdjust="ScaleFont"` on docTypeLabel
  (evidenceSub.jrxml:134) fits it with no reflow of the following elements. Type-1 still renders. ✅
- Scope clean: only the 2 evidence jrxml + preview-builder fixtures; **headings untouched** (DEF-6
  CANCELLED); no builder logic / model change. `A9PreviewTest` green, pages=4.
- Remaining leg (not BE, not blocking this task): QA (Tanya, via Porter) confirms DEF-5 blank on a real
  `/a9/db/{id}` — the only check needing the DB (rule #4).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
