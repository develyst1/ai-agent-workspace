# TASK-006: อ.6 "เอกสารอื่น ๆ" as Type B (label + dotted write-in line)

- Source: SPEC-012
- Status: DONE
- Depends on: none

## What to do
Render the item-8 "เอกสารอื่น ๆ (ถ้ามี)" value on a **dotted write-in line** instead of
appended after the label. Targeted change (reuse the existing `detail` field as the
fill-in value; no new model field). Repo:
`C:\Users\Admin\sa-project\service-report2\DID-046-SpringBoot-Service-Report`.

### 1. Builder (`A6CheckListReportBuilder`, the REQ-011 "เอกสารอื่น ๆ" block)
Move the value from the label into `detail`; label becomes the fixed text:
```java
// was: otherLabel with names appended + detail=null
employerSubs.add(new EvidenceSub("employer", null, "เอกสารอื่น ๆ (ถ้ามี)",
        null, null, !otherDocNames.isBlank(), otherDocNames));  // detail = otherDocNames ("" when none)
```
- Keep the `otherDocNames` computation from TASK-005 unchanged.
- `otherDocNames` is `""` (never null) when empty → `detail != null` stays true → this row is
  always Type B. The (1)-(4) rows keep `detail = null` → Type A (unchanged).

### 2. Template (`src/main/resources/reports-045/request-a6/subreport/request-a6-evidenceSub.jrxml`)
In the `"employer".equals($F{type})` band, keep the checkbox + label. **Add** a value
textField gated by `$F{detail} != null`, with a dotted bottom border, to the right of the
short "เอกสารอื่น ๆ (ถ้ามี)" label:
```xml
<element kind="textField" x="185" y="0" width="351" height="16"
         fontName="TH SarabunPSK" fontSize="14.0" hTextAlign="Left" vTextAlign="Bottom">
  <expression><![CDATA[$F{detail}]]></expression>
  <printWhenExpression><![CDATA[$F{detail} != null]]></printWhenExpression>
  <box><bottomPen lineWidth="0.75" lineStyle="Dotted"/></box>
</element>
```
- Tune x / width / dotted style in the preview to match the form. `detail == null` (items
  (1)-(4)) → element hidden → those rows unchanged.
- **JR7 rules:** omit `uuid` (or use a real 36-char one); band height ≥ y+height of every
  element; keep pagination intact (no overflow).

### 3. Recompile jrxml → jasper (no maven jasper plugin — use the preview test)
```bash
./mvnw -o -Dtest=A6PreviewTest -DfailIfNoTests=false test
```
This recompiles `request-a6-*.jrxml` → `.jasper` and writes `target/a6-preview.pdf` — open it
to verify the dotted line renders.

## Definition of Done
- [ ] Builder: "เอกสารอื่น ๆ" row uses fixed label + `detail = otherDocNames`; (1)-(4) `detail=null`.
- [ ] `request-a6-evidenceSub.jrxml` renders `detail` on a dotted underline for the employer
      row when `detail != null`; `.jasper` recompiled (A6PreviewTest passes).
- [ ] `target/a6-preview.pdf` shows "เอกสารอื่น ๆ (ถ้ามี)" with the value on a dotted line;
      items (1)-(4) unchanged (label-only); layout/pagination intact (report the preview result).
- [ ] Compiles: `./mvnw -o -DskipTests compile`.
- [ ] Re-hand to QA (real-data proof, dev profile): `/a6/db/38314` → the "เอกสารอื่น ๆ" value
      ("ทดสอบ2, ทดสอบ 1" / "wdw") sits on the dotted line; a request with none → blank dotted line.

## Implementation Notes
**Changed (2 source files — SPEC-012 scope):**
- `A6CheckListReportBuilder.java` (REQ-011 block) — the "เอกสารอื่น ๆ" sub-row now uses a **fixed
  label** `"เอกสารอื่น ๆ (ถ้ามี)"` and puts the value in `detail = otherDocNames` (`""` when none,
  never null → always Type B). `otherDocNames` computation + `checked = !isBlank()` unchanged from
  TASK-005. The (1)-(4) rows keep `detail = null` → Type A.
- `request-a6-evidenceSub.jrxml` — in the `"employer"` band, kept the checkbox + label; **added** a
  `textField` for `$F{detail}` gated by `printWhenExpression $F{detail} != null`, `x=185 y=0 w=351
  h=16`, dotted bottom border (`bottomPen lineWidth="0.75" lineStyle="Dotted"`). `uuid` omitted (JR7
  auto-gen). Band height 18 ≥ y+height(16); `detail==null` (items (1)-(4)) → element hidden → those
  rows unchanged.

**Verification (BE boundary):**
- jrxml→jasper recompile + preview: `./mvnw -o -Dtest=A6PreviewTest -DfailIfNoTests=false test`
  → all 6 a6 jrxml `compiled:` OK (no JR7 error), `Tests run: 1, Failures: 0`, `A6 PREVIEW PDF ...
  pages=3` — layout/pagination intact.
- App compile: `./mvnw -o -DskipTests compile` → `BUILD SUCCESS`.
- **Scope note:** `git status` shows `A6CheckListReportBuilder.java` + `request-a6-evidenceSub.jrxml`
  (the real changes) **plus** the sibling `request-a6-*.jasper` binaries — those are recompiled by
  A6PreviewTest even though their `.jrxml` source is unchanged (that's the project's compile loop,
  CLAUDE.md "compile ทุก jrxml → .jasper วางทับ"). No sibling jrxml source was touched.

**Runtime visual proof = QA's leg (real UAT DB, not BE).** The A6PreviewTest mock has the employer
sub-row with `detail=null`, so the preview PDF exercises the Type-A path + confirms the template
compiles/paginates; the actual Type-B value-on-dotted-line needs real data. @Sober: please route to
Tanya (dev profile): `/a6/db/38314` → "เอกสารอื่น ๆ (ถ้ามี)" value ("wdw"/其) sits **on the dotted
line** (not appended inline); a request with none → blank dotted line; items (1)-(4) unchanged.

## Open note — Q1 (dotted-line style)
Used SA default: thin dotted bottom border (0.75), write-in x=185→536. Easy visual tune in the
A6 preview if Porter/human wants a different weight/width (non-blocking).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW: verdict + reasons.)

## Review (round 1) — REWORK (Sober, 2026-08-05)
The code is correct by construction and verified: builder row = fixed label + `detail=otherDocNames`;
jrxml employer band adds a `$F{detail}` textField (x=185 w=351 h=16, dotted bottomPen 0.75, gated
`detail != null`, uuid omitted, y+h=16 ≤ band 18); scope = `A6CheckListReportBuilder.java` +
`request-a6-evidenceSub.jrxml` only (the `.jasper` regen is the expected A6PreviewTest output).
A6PreviewTest compiles all a6 jrxml with no JR7 error, pages=3. ✅ **on compile/pagination.**

**Why REWORK (one narrow gap):** the A6PreviewTest employer mock uses `detail=null`, so the preview
PDF exercised only the **Type-A** path — **nobody has visually confirmed the Type-B dotted-line-with-value
actually renders.** My DoD required `target/a6-preview.pdf` to *show the value on the dotted line*, and
this is the project's first jrxml layout change — the fast preview loop is exactly where to prove it,
not defer all risk to the QA/real-data run. There's a concrete layout risk to check: the label textField
is `x=64 w=472` and the value is `x=185` — for the "เอกสารอื่น ๆ (ถ้ามี)" label, confirm the label text
does **not** collide with the value/dotted line at x=185 (shrink the label textField width or shift the
value x if it does).

**Rework (small):**
1. In `A6PreviewTest`, give the employer "เอกสารอื่น ๆ" mock sub-row a **non-null `detail`** value
   (e.g. `"ทดสอบ2, ทดสอบ 1"`) so the preview exercises Type-B. (Keep at least one `detail=null`
   employer row so Type-A is still shown too.)
2. Re-run `./mvnw -o -Dtest=A6PreviewTest -DfailIfNoTests=false test`, open `target/a6-preview.pdf`,
   and confirm: the value sits **on the dotted underline** after "เอกสารอื่น ๆ (ถ้ามี)", **no overlap**
   between the label text and the value/line, items (1)-(4) still label-only, pagination intact.
   Report what the preview shows (and any x/width tweak you made).
3. No change to the runtime/data logic. Then re-hand for review + the QA real-data leg (38314).

## Review (round 2) — DONE (Sober, 2026-08-05)
Rework verified independently:
- A6PreviewTest now has BOTH an employer Type-A row (`detail=null`, "(1)…") and a Type-B row
  (`"เอกสารอื่น ๆ (ถ้ามี)"`, `detail="ทดสอบ2, ทดสอบ 1"`). ✅
- Re-ran `A6PreviewTest` myself → all 6 a6 jrxml compiled (no JR7 error), pages=3, exit 0. ✅
- **Extracted the preview PDF text (PyMuPDF): page 2 shows "เอกสารอื่น ๆ (ถ้ามี)" and
  "ทดสอบ2, ทดสอบ 1" as SEPARATE text runs** → the value renders via the new `$F{detail}`
  textField (Type-B, on its own element at x=185), NOT appended to the label; the Type-A "(1)…"
  row stays label-only. This proves the Type-B path renders and is distinct from the label. ✅
- Dotted bottomPen present in the jrxml (border, not text — not visible in text extraction).
  Pixel-level dotted-line + no-overlap is confirmed by Jason's preview eyeball and will be finally
  confirmed by QA's PyMuPDF render on real data (38314).
**Verdict: DONE (code leg).** REQ-012 → SPEC_DONE; QA does the real-data visual close.

## Rework Notes (round 1 — prove Type-B in preview, Jason)
Addressed the narrow gap: the preview now exercises the **Type-B** path, not just Type-A.
1. `A6PreviewTest` mock — item-8 employer subs now has **two** rows: the existing
   `(1)…` with `detail=null` (Type A, still shown) **plus** a `"เอกสารอื่น ๆ (ถ้ามี)"` row with
   `detail="ทดสอบ2, ทดสอบ 1"` (Type B). No production/data-logic change — test fixture only.
2. Re-ran `./mvnw -o -Dtest=A6PreviewTest -DfailIfNoTests=false test` → compiled all a6 jrxml (no
   JR7 error), `Tests run: 1, Failures: 0`, `A6 PREVIEW PDF … pages=3` (pagination intact).
3. Verified the rendered `target/a6-preview.pdf` with PyMuPDF text+geometry extraction:
   - Both text runs present and **separate**: label `"เอกสารอื่น ๆ (ถ้ามี)"` and value
     `"ทดสอบ2, ทดสอบ 1"` — the value is its own field (not appended to the label). ✅
   - Geometry: label and value share the **same row** with the value positioned **after/right of**
     the label (distinct runs, no coordinate overlap) → **no collision** between the short label
     `x=64` text and the value/dotted line at `x=185`. No x/width tweak needed. ✅
   - Item-8 (1)-(4) rows still label-only (Type A, `detail=null`). ✅
- No change to runtime/data logic. Scope now also includes `A6PreviewTest.java` (test fixture) on
  top of `A6CheckListReportBuilder.java` + `request-a6-evidenceSub.jrxml` (+ A6PreviewTest-regen
  `.jasper` binaries). Re-handing for review + QA real-data leg (38314).
