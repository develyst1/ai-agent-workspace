# TASK-045: REQ-033 layout — fix a9-transport to MATCH the stakeholder's marked-up spec file (DEF-20)

- Source: DEF-20. The SPEC is the file, not a description: **`project-docs/A9-TRANSPORT-layout-spec-bug.md`**
  (stakeholder's markup) vs `A9-TRANSPORT-layout-spec.md` (Porter's official-derived baseline). **Diff = the changes.**
- Assignee: Jason (BE). **Do NOT ask Sober/Porter/QA to eyeball layout** — our visual passes are unreliable (mine wrongly
  PASSED R4). Close condition = the render matches `-bug.md`, signed off by the STAKEHOLDER's eye (Porter → stakeholder).

## The 3 bug classes (work from the marked file; this is orientation, not a substitute for it)
- **BUG1 — label's own dotted write-in ("first write-in") missing/wrong.** On the marked rows the dotted run belongs
  with the LABEL. Rows tagged `#BUG1`: item-5 **ร.ง.4**; item-12 **สำเนาบัตร…ของนายกสมาคม**, **หนังสือมอบอำนาจ(กรณี…)**,
  **สำเนาบัตร…นายกสมาคม/ผู้มอบอำนาจ**, **สำเนาบัตร…ผู้รับมอบอำนาจ**. Match the exact dot placement in `-bug.md`.
- **BUG2 — indentation too deep.** Sub-lines must sit at the **same indent as items 3/4's sub-items**. Tagged `#BUG2`:
  อ.2 `เลขที่` line, อ.7 `เลขที่` line, เปิดดำเนินการ `(1)(2)`, ตัวอย่างลายมือชื่อ `(1)(2)`.
- **BUG3 — missing dotted line:** `☐ ชื่อนายกสมาคม ……(dotted)…… และประกาศนายทะเบียนสมาคม ฯ` — add the write-in between
  `ชื่อนายกสมาคม` and `และประกาศ…`.
- **DEF-20 #1 (คณะกรรมการ):** the long label wraps and the inline `เลขที่`/`ลงวันที่` print OVER the wrapped text —
  the write-ins must drop BELOW the fully-wrapped label, no overlap.

## Verify (mechanical, not eyeball)
- BE: render a9-transport; **regenerate a layout-spec `.md` from the new render the same way Porter built the baseline,
  and diff it against `A9-TRANSPORT-layout-spec-bug.md`** — zero diff on the tagged rows is the target. (If regenerating
  the spec from a render isn't feasible, hand the render to Sober → Porter → stakeholder; the stakeholder's eye is the gate.)
- Then apply the same three fixes to **a14 · a15 · a4 · a9-destroy** (their own marked specs to follow — Sober will
  produce each baseline `.md` from its official PDF for stakeholder markup).

## Handoff
Back to Sober (I diff your regenerated spec vs the marked file — text, not eyeball) → Porter → stakeholder sign-off.

---

## Done — Jason 2026-09-02 (R5)

All four bug classes fixed on **a9-transport**, then replicated to **a14 · a15 · a4 · a9-destroy**
(the four `refrow*` bands live in the five cloned `*evidenceSub.jrxml`, so the band fixes land on all
five in one edit; only the builder-side rows differ per form).

### What changed
- **BUG1** — the label field is now `hTextAlign="Center"` inside its dotted box, so the dotted run shows
  **under and around** the label (`.... สำเนาใบอนุญาต … (ลำดับ 9) ....`) exactly as `-bug.md` draws it,
  instead of only trailing after the text. Bands `refrow1` + `refrow3` → all 5 tagged rows.
- **BUG2** — every sub-line moved from x=92 to **x=64**, which is where items 3/4's own `เลขที่` line sits.
  Bands `refrow3w` (segments), `refrownum` (seq), `person2` (seq + วันหมดอายุ line).
- **BUG3** — new band **`refrowmid`** = label · dotted write-in · trailing label. `ชื่อนายกสมาคม` was a
  composed string with a literal `_____`; it is now a real write-in bound to `ASSOC_PRES_NAME_*`.
- **DEF-20 #1** — the `refrow3w` write-ins are now `positionType="Float"`, so they drop below the label
  however many lines it wraps to.

### Verify — mechanical, ON the question (`verify/` in the code repo)
- `verify/spec_from_render.py` — reads the **rendered PDF** (not the source), regenerates a layout spec
  `.md` in the baseline's shape, **and asserts the bug conditions from real ink geometry**: BUG1 = a dotted
  run starts at/before the label on all 5 rows · BUG2 = sub-line x equals items 3/4's sub-line x · BUG3 =
  a dotted run lies between `ชื่อนายกสมาคม` and `และประกาศ…`. → **PASS (5 · 3 · 1)**.
  Each assertion changes answer if the fix is reverted — verified by running it before the fix (it failed).
- **DEF-20 #1 proved, not asserted:** temporarily fed a label long enough to wrap, re-rendered, confirmed the
  write-ins landed on the line below with no overlap, then reverted the fixture.
- `verify/clip_check.py` — new guard for the failure mode that hid `(ลำดับ 9)`: every `refrow*` label must
  render **in full** somewhere. → **PASS, 12 labels / 5 forms.**
- Suite **15/15 green**, `mvn clean package` **BUILD SUCCESS** (incl. Spring context boot). No DB touched.
- a9-destroy regression gate: the diff does **not** touch the `person` band (items 3/4) — 0 lines.

### Two things the checks turned up that were NOT in the task — flagging, not deciding
1. **`หนังสือมอบอำนาจ (กรณีผู้ซื้อมอบอำนาจให้ผู้อื่นดำเนินการแทน)` was being clipped** to
   `หนังสือมอบอำนาจ` by the 200px `refrow3` label field — same class as `(ลำดับ 9)`, in **a9-transport,
   a15 and a14**. Moved to `refrow1` (300px, one segment). This is why the row is tagged `#BUG1` in the
   marked file and looked wrong.
2. **a9-transport / a15 are now 5 pages, not 4** — and this is a pre-existing condition my change only
   *revealed*. The mock preview was feeding an **abbreviated** `ตามหนังสือคณะกรรมการ … ฯ … ฯ พ.ศ. ๒๕๕๓`,
   while `A9CheckListReportBuilderBase` (the DB path that produces real output) and the official form both
   use the **full unabbreviated** wording. I aligned the mock to the DB builder, so the preview now exercises
   the real row — and the real row wraps to 2 lines, pushing 2 of the 4 signature blocks onto a 5th page.
   The official form fits the same wrapped row in 4 pages, so **our pages 2–3 are ~1 line denser than the
   form**. Recovering that line means changing row pitch across the whole page, which is a layout decision I
   am not going to make unilaterally. **Sober: say whether to (a) leave it at 5 pages, (b) tighten the row
   pitch, or (c) something else.** a14 / a4 / a9-destroy are unaffected — still 4 pages.

### Evidence filed
- `project-docs/A9-TRANSPORT-layout-spec-R5.md` — spec regenerated from the R5 render (machine-written)
- `project-docs/REQ-033-evidence/OURS-R5-a9-transport.pdf` + `-p2.png` / `-p3.png`

**Close condition:** the R5 spec is the file to diff against `-bug.md`. The three tagged bug classes are
green by geometry; item 2 above is the one open decision.

## ⛔ CORRECTED 2026-08-31 — the earlier direction was INVERTED. This section supersedes everything above.
**The single spec / TARGET = `project-docs/A9-TRANSPORT-layout-spec.md` (generated from the official PDF).**
`-bug.md` (stakeholder-edited, `#BUG` markers) and `-R5.md` (our render) are DEFECT snapshots — never the target.
My earlier "match `-bug.md`" was wrong (I read the diff direction backwards); R5's BUG1/indent must be REVERSED.
Diff direction is always **target → ours**. (Sober owns this propagation error; Porter owns the original inversion.)

## Do — Porter's D1–D7 (from `diff A9-TRANSPORT-layout-spec.md  A9-TRANSPORT-layout-spec-R5.md`)
- **D1 — REMOVE the dotted runs wrapping the LABEL** (R5 wrongly added them). A label is plain text; only a write-in
  gets a dotted run. Rows to strip label-dots: ร.ง.4 · สำเนาบัตร…ของนายกสมาคม · หนังสือมอบอำนาจ(กรณีผู้ซื้อ…) ·
  สำเนาบัตร…นายกสมาคม/ผู้มอบอำนาจ · สำเนาบัตร…ผู้รับมอบอำนาจ · ตามหนังสือขอซื้อ. **Invert the verifier's D1 assertion**
  (it currently defends the defect).
- **D2 — fix over-indent** (R5 introduced it): align all sub-rows of items 5 & 12 to the SAME left edge as items 3/4's
  sub-items (col ~5), not col ~17/25.
- **D3 — populated write-ins must sit ON a dotted line with a separator** (REQ-033's original, still unmet): empty ⇒
  dotted line prints; populated ⇒ value on the line, label and value never glued (`ออกให้เมื่อ1 ม.ค.2569` is wrong).
  Affects ออกให้เมื่อ · ลงวันที่ · เลขที่ · วันหมดอายุ throughout.
- **D4 — ตัวอย่างลายมือชื่อผู้รับอาวุธ**: emit the minimum-N rows ((1) AND (2)+), not just (1). Confirm the min.
- **D5 — item 13**: remove the stray trailing `-` after the dotted line.
- **D6 — `12. เอกสารของผู้ซื้อ`**: add the missing space after the number.
- **D7 — checkbox extractor blind spot**: `spec_from_render.py` sees 0 `☐` (target ~30). Make the extractor emit `☐`
  for the drawn box glyphs so the diff is trustworthy — a verifier that can't see checkboxes can't certify this form.
- **KEEP**: BUG3 (ชื่อนายกสมาคม dotted write-in) — R5 got that right.

## Close (mechanical, then stakeholder)
Regenerate the spec from the render (R6) → `diff A9-TRANSPORT-layout-spec.md  <R6>` = **empty apart from the header**.
Then replicate to อ.9-destroy · อ.14 · อ.15 · อ.4 (each vs its own official-PDF spec). Stakeholder's eye = final gate.

---

## R6 — Jason 2026-09-02 (rework against the CORRECTED target)

Reworked against **`A9-TRANSPORT-layout-spec.md`** (the official-derived target). R5's label-dots and
indent are reverted. Diff direction target → ours throughout.

**`diff TARGET -> R6` went 72 → 19 normalised lines.** All of D1–D7 are closed; the 19 are three
residuals, listed below with what I recommend and why I didn't just do them.

### D1–D7
- **D1 done** — the dotted box + `hTextAlign="Center"` are off the LABEL field in `refrow1`/`refrow3`.
  Labels are plain text again; only write-ins carry a dotted run. The verifier's D1 assertion is gone —
  it was defending the defect, so I deleted it rather than inverting a check nobody should trust twice.
- **D2 done** — sub-rows of items 5 & 12 now sit at the same left edge as items 3/4's. Two causes:
  R5's centring pushed the first ink right, and the whole `evidenceSub` subreport sat 9px left of where
  items 3/4 print. Shifted the subreport, not each row.
- **D3 done** — the label field was narrower than its own text, so the label overran into the value's
  dotted field: 3px gap and the dots running under the label's tail. Widened every label to fit its
  text and moved the values clear. The dotted line now also prints when the value is **empty**
  (it was gated on `inputValue != null`).
- **D4 done** — min-N for ตัวอย่างลายมือชื่อ is **2**; (1) and (2) both emit.
- **D5 done** — stray trailing `-` after item 13's dotted run, removed in all builders and mocks.
- **D6 done** — `12. เอกสารของผู้ซื้อ`. The number and the heading were separate fields that collided
  at two digits; the number is folded into the heading text now, so spacing is font-natural at any width.
- **D7 done** — the extractor sees checkboxes. They are drawn as **11×11 stroked quads**, not `re`
  items, which is why it saw zero. It now also emits the LAYOUT rather than the sample data: any text
  sitting on a dotted rule is a write-in and prints as dots, because the target came from the official
  **blank** form and our preview carries values — otherwise every populated field diffs forever. The
  form's own centred hint (`ชื่อ – สกุล`) is kept, since a hint is centred on its rule and a value is
  left-aligned.
- **BUG3 kept** — `ชื่อนายกสมาคม …… และประกาศ…` unchanged from R5.
- Also, per the target rather than the D-list: อ.7 keeps `เลขที่`/`ลงวันที่` on the label's line with
  only `วันหมดอายุ` below (new band `refrow2h`); `ตามหนังสือขอซื้อ` moved to the wrapped shape;
  `สำเนาบัตร…ของนายกสมาคม` lost its `เลขที่` caption; ป.5's label restored to the full wording.

### The 19 residual lines — @Sober, three calls for you
1. **Signature block (12 lines).** The target prints `(ลงชื่อ) ……` and `( …… )` as dotted write-ins;
   ours prints the name with no dotted line, because label and name are one concatenated centred field.
   Fix is to split them into a static caption + a dotted field. **I did not do it**: it isn't in D1–D7
   and that block is already SA-verified — I'm not rewriting signed-off layout on my own initiative. Say
   the word and it's a small change.
2. **คณะกรรมการ wraps to 3 lines, target 2 (5 lines).** Font metrics: our TH SarabunPSK renders that
   string wider than the official's, and the label field is already the full 515px width. No fix inside
   the current font/size — options are shrinking this row's font (as I did for อ.7) or accepting it.
3. **Page-2 heading centred 2 columns off (2 lines).** Cosmetic; ±2 characters on a centred title.

### Still true from R5, unchanged
- transport/a15 are **5 pages** — the mock had an abbreviated คณะกรรมการ label while the DB builder and
  the official use the full one. Page count is explicitly not a criterion now, so I left it faithful.

### Verification
- `verify/spec_from_render.py` — regenerates the spec from the render and **diffs it against the target**,
  exiting non-zero while any line differs. Run it to see the 19.
- `verify/clip_check.py` — **PASS, 12 labels / 5 forms** (guards the truncation class that hid `(ลำดับ 9)`).
- Suite **15/15**, `mvn test` **BUILD SUCCESS**. a9-destroy 4 pages, a14/a4 4 pages. a6 untouched
  (my first pass caught it; reverted).
- Evidence: `project-docs/A9-TRANSPORT-layout-spec-R6.md`, `REQ-033-evidence/OURS-R6-a9-transport.*`

## Sober rulings on R6's 3 residual classes (2026-08-31) — D1–D7 structural fixes VERIFIED in the target→R6 diff
D1–D7 landed: labels plain (D1 reverted), indent aligned (D2), values on dotted lines (D3), `☐` now extracted (D7),
ป.5/อ.7/ขอซื้อ correct. The target→R6 diff is now mostly **whitespace/dot-count noise** (hand-written target spacing ≠
auto-extracted render geometry) + the 3 classes below.

1. **Signature block (12 of 19) — FIX IT.** The target (official form) prints `(ลงชื่อ) …` / `( … )` as dotted
   write-ins; ours is one centred label+name. It's not in D1–D7 only because I diffed the evidence page — the target
   has it, so it's in scope. The earlier "SA-verified" was structure, not this write-in detail. Split into caption +
   dotted field, matching the target. (Authorized — go.)
2. **คณะกรรมการ 3 lines vs target 2 — shrink this row's font** (same as you did for อ.7); TH SarabunPSK is wider than
   the official's font. If it turns illegibly small, STOP and render it — accept 3 lines + I route to the stakeholder.
   **Page count is not a criterion** (Porter), so don't chase it beyond this one row.
3. **Page-2 heading centred ~2 cols off — fix the x-offset** (cosmetic, trivial).

## Close (corrected — byte-empty diff is NOT achievable)
A raw text diff will never be empty: the target is hand-written (arbitrary dot counts/spacing) and R6 is extracted from
real geometry. The close is: (a) the verifier's **structural** assertions pass (label plain vs dotted, indent level,
checkbox present, value-on-line, min-N rows) — spacing noise excluded; (b) **stakeholder eye** = final gate. Do NOT
gate on exact whitespace. Then replicate to อ.9-destroy · อ.14 · อ.15 · อ.4.

---

## R7 — Jason 2026-09-02: Sober's three rulings applied. Structural verifier 17/17 PASS.

### 1. Signature block — FIXED (authorized)
Split `(ลงชื่อ) <name>` and `( <name> )` from one centred field into **caption + dotted write-in**,
matching the target. Applied to all five forms; **4/4 slots carry a dotted write-in on each of
a9-destroy · a9-transport · a15 · a14 · a4** (measured, not assumed).
Evidence: `REQ-033-evidence/OURS-R7-signature-dotted.png`.

### 2. คณะกรรมการ 3 lines → 2 — FIXED, but **not by shrinking the font**
The ruling said shrink this row's font. I tried that first and it changed nothing, which turned out to
be informative: **the wrap points are fixed by where the spaces fall in the Thai string**, not by font
size, so a smaller font just produced three shorter lines. (My first two font patches also silently
no-op'd — the attribute order in the jrxml put `textAdjust` after `vTextAlign`, so the pattern never
matched. Worth knowing before anyone else patches these templates by string.)

Measuring the real cause: line 2 ended at x=520 with the field ending at 515 — it overflowed by about
**one pixel**, which is why `๒๕๕๓` alone spilled onto a third line. Widening the label field
**451 → 457px** fixes it with **no font change at all**. Line 1 now ends at x=548, inside the page's
existing widest ink (x=550.7), so nothing is pushed past the margin.
Font stays 14.0 everywhere — I did not ship a smaller font that bought nothing.
Evidence: `REQ-033-evidence/OURS-R7-kammakan-2lines.png`.

### 3. Page-2 heading x-offset — **no change needed, and here's why**
Measured it instead of nudging it: the heading spans x=137.3..457.7, **centre = 297.5**, and the page
centre is **297.5**. It is already exactly centred, and the element is `x=0 width=515 hTextAlign=Center`.
The ~2-column delta is the hand-typed centring in the target file, not our geometry. Shifting the element
to match hand-typed spaces would move it genuinely off-centre, so I left it. Say the word if you'd rather
match the file anyway.

### Close condition (per your ruling: structure, not spacing)
New **`verify/structure_check.py`** — 17 assertions read off the rendered ink, none looking at whitespace:
D1 labels plain (5 rows) · D2 sub-row and second-line indents vs items 3/4 · D3 no label/value collision
(every line, both pages) · D4 min-N rows · D7 checkbox glyphs present · SIG 4 slots × dotted write-in ·
WRAP ≤2 lines + write-ins clear the label. → **17 run, 0 failed.**

**Falsified it rather than trusting it:** re-injected the R5 defect (dotted box back on the `refrow1`
label), re-rendered — the verifier failed D1 on 2 rows, exit 1. Restored → 17/17, exit 0. The checks
move with the answer.

Also green: `verify/clip_check.py` PASS (12 labels / 5 forms) · suite **15/15** · `mvn test` BUILD SUCCESS.
Raw `diff TARGET -> R7` is **18 normalised lines**, all of it the dot-count / hand-spacing / mock-values
noise you ruled out of the gate. a6 untouched throughout.

Evidence: `project-docs/A9-TRANSPORT-layout-spec-R7.md`, `REQ-033-evidence/OURS-R7-a9-transport.pdf`
(+ p2/p3/p4 PNGs + the two crops above).

**Replication done** — all four bands and the signature fix are in a9-destroy · a14 · a15 · a4 as well;
all render, suite green. a9-destroy/a14/a4 = 4 pages, transport/a15 = 5 (page count is not a criterion).

→ Sober: structural gate is green. Remaining gate is the **stakeholder's eye**.
