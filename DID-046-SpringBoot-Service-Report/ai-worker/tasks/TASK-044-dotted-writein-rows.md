# TASK-044: dotted underlines on (1)/(2) write-in rows — 4 forms (REQ-033 / SPEC-038)

- Source: SPEC-038. Assignee: Jason (BE). Forms: **อ.9-transport · อ.14 · อ.15 · อ.4**. **อ.9-destroy OUT** (already dotted).
- Root: builder concatenates value into the label string → one static textField → nothing to underline. Fix = emit
  structured fields + a template band that renders label + own dotted-underline field (like the working `person` band).

## Do
1. New `EvidenceSub` row type (e.g. `refrow`): `seq`="(1)"/"(2)", prefix label, `detail`=refNo, `detail2`=date, `checked`=tick
   (reuse the existing record fields — no composed string).
2. New `refrow` band in evidenceSub `.jrxml` for **request-a9-transport, request-a15, request-a14, request-a4** (NOT
   a9-destroy): checkbox + seq + prefix + "ที่/เลขที่" + `detail` (bottomPen Dotted) + "ลง/ลงวันที่" + `detail2` (bottomPen
   Dotted). Copy the dotted-field pattern from the existing `person` band. Blank value still shows the dotted line.
3. Convert the composing builders to emit `refrow`: `A9CheckListReportBuilderBase.addLicenseRows` (:340) + the
   `refNoDate` rows (ขอซื้อ/คณะกรรมการ :307/:310), `A14CheckListReportBuilder` (:231/:235…), `A4CheckListReportBuilder`
   (item-6). Keep tick source, row/pad counts unchanged.
4. Leave a9-destroy items 3/4 and any other template-field rows untouched.

## Verify — BE then QA (all 4 are DELIVERED → re-render each)
- BE: `lineStyle="Dotted"` present on the new refrow band; A9/A14/A15/A4 PreviewTests render (visually check the mock
  PDFs show dotted (1)/(2) lines, empty and populated); a9-destroy PreviewTest byte-equivalent/unchanged; clean package green.
  **Do not verify by label grep — check the rendered dotted line** (SPEC-038 method note).
- QA (real DB): re-render อ.9-transport / อ.14 / อ.15 / อ.4 — (1)/(2) & เลขที่/ลงวันที่ rows show dotted underlines,
  populated values sit on the line; a9-destroy unchanged; a1/a3/a6 unaffected.

## Handoff
Back to **Sober** (review: refrow band uses dotted fields, all 4 builders converted, a9-destroy untouched, re-render evidence). Then QA.

## Done (2026-09-01) — Jason

New `refrow` `EvidenceSub` type across the 4 templates + builders, per SPEC-038's exact method: bind by the
rendered dotted line, not a label grep.

- **New `refrow` band** in all 4 evidenceSub templates (`request-a9-transport`, `request-a15`
  [`request-a9-evidenceSub.jrxml`], `request-a14`, `request-a4`) — checkbox + `seq` + `label` (plain
  prefix text) + `detail` (dotted underline) + `note` repurposed as the 2nd static label + `detail2`
  (dotted underline). Modeled on the working `person` band's dotted-field pattern, gated by
  `"refrow".equals($F{type})`. `request-a9-destroy`'s evidenceSub is **untouched** — confirmed 0 `refrow`
  matches, dotted-field count unchanged (6, was 6).
- **Converted builders** (all via a new shared-shape `refrow(seq, label1, no, label2, date, checked)`
  helper, one per builder class — no field composition, `detail`/`detail2` carry the real values):
  - `A9CheckListReportBuilderBase.addLicenseRows` (ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์ (1)/(2) rows) — shared by
    transport + a15 only (verified: `A9DestroyReportBuilder` never calls it, so a15/transport's fix
    doesn't touch destroy's actual output).
  - The two `refNoDate`-composed rows in the same base (ตามหนังสือขอซื้อ / ตามหนังสือคณะกรรมการ, lines
    formerly 307/310) — `refNoDate()` helper now fully removed (no other call sites).
  - `A14CheckListReportBuilder.addLicenseRows` (same 4 permit types) + the item-12(7) "ตามหนังสือขอซื้อ"
    row (line 231) — `refNoDate()` removed there too.
  - `A4CheckListReportBuilder.buildRefImportRows` (item-6 อ.8 ฉบับเดิม, including the min-2 pad rows from
    the earlier Sober review).
  - Mirrored into all 3 dev-preview mock builders (`A9CheckListPreviewBuilder`, `A14CheckListPreviewBuilder`,
    `A4CheckListPreviewBuilder`) so the `/preview/checklist/*` seams stay representative.

### Scope calls flagged, not silently decided
1. **a14 item-12(3)/(5) — left unconverted.** TASK-044 named line 231 specifically; lines 219/224
   (`docDateLine`/`idCardLine`, หนังสือมอบอำนาจ/บัตรผู้รับมอบอำนาจ) use a *single*-value composed pattern
   that doesn't fit the two-value `refrow` band without a different mini-layout, and per the standing
   DEF-17 flag they render permanently blank (no data source exists) — so there's no currently-observable
   dotted-line defect to fix there. Left them as composed strings; flagging since they share the same
   underlying pattern SPEC-038 describes, in case a future data source makes them worth converting too.
2. **อ.9-destroy's item-12(1) write-off date** (`A9DestroyReportBuilder`, `"(1) วัน เดือน ปี ที่จะทำการ
   กำจัดหรือทำลาย" + writeOffDate`) uses the exact same composed-string pattern as the defect this task
   fixes — but destroy is explicitly out of scope per REQ-033/SPEC-038 ("its items 3/4 already dotted").
   I did **not** touch it, per the explicit scope boundary. Flagging because it's the same bug class in a
   file the scope note didn't examine for this specific field — your call whether it's REQ-033's tail or
   a separate ticket.

**Verify (DB-free):** `grep -c 'lineStyle="Dotted"'` on the 4 touched evidenceSub files went from 6→8 each
(new refrow band's 2 dotted fields); `request-a9-destroy`'s stayed at 6 (0 `refrow` matches — confirmed
untouched). Full suite 15/15 green (A9/A14/A15/A4 PreviewTests render both variants' mocks with the new
dotted rows, populated and blank). `clean package` green. `SecurityConfig.java` shows as modified in
`git status` but I never touched it this task — pre-existing uncommitted state from before this session.

Back to **Sober** — see `inbox/SA.md`. Then QA re-renders อ.9-transport / อ.14 / อ.15 / อ.4 by eye (dotted
lines, not a grep) + a9-destroy canary (unchanged).

## Round 2 — scope extension (Porter + human, 2026-08-31): REQ-033 is now 5 forms
Both scope flags resolved. Two more `(1)/(2)`-style rows get the same `refrow` label+dotted treatment:

1. **a14 item-12(3)/(5)** (หนังสือมอบอำนาจ / บัตรผู้รับมอบอำนาจ) — INCLUDE (Porter). Same composed-string mechanism;
   they render permanently blank (accepted DEF-17 a14 §4 gap) → **blank is exactly the case the dotted write-in line
   is for.** Convert to `refrow` (dotted line shows even when blank).
2. **อ.9-destroy item-12(1)** (วัน เดือน ปี ที่จะทำการกำจัดหรือทำลาย) — now IN SCOPE (human: "แก้ด้วย"). Convert THIS
   ROW ONLY to `refrow` (label + dotted write-in; blank shows the line, populated sits on it).

### ⚠️ Destroy is now touched — but ONLY at item-12(1). Items 3/4 are the regression risk.
The a9-destroy canary changes meaning: it is no longer "untouched". a9-destroy **items 3/4 must render EXACTLY as
today** (those are the rows the stakeholder verified by hand). Do NOT restyle them; add the `refrow` band to the
destroy evidenceSub and use it for item-12(1) only. **Do not widen the destroy change beyond item-12(1).**

## Verify (Round 2)
- BE: a14 item-12(3)/(5) + destroy item-12(1) render as dotted write-in rows (blank + populated); **a9-destroy items
  3/4 unchanged** (diff the rendered rows / dotted-field positions — they must match today's output). Suite green, clean package green.
  Check by the rendered dotted line, not a label grep.
- QA (5 forms now): re-render อ.9-transport / อ.9-destroy / อ.14 / อ.15 / อ.4 — the in-scope write-in rows dotted;
  **a9-destroy items 3/4 identical to before** (explicit regression check).

→ Back to Sober for review, then QA closes REQ-033.

## Round 2 done (2026-09-01) — Jason

Both items converted to `refrow`; **a9-destroy items 3/4 confirmed byte-identical** (this was the regression risk).

1. **a14 item-12(3)/(5)** (`A14CheckListReportBuilder`): `docDateLine`/`idCardLine`-composed rows replaced with
   `refrow` calls — item-12(3) is single-value (date only, always blank today — no source) so it uses just the
   first dotted slot; item-12(5) is two-value (idCard no + expiry) so it uses both. `docDateLine`/`idCardLine`
   helpers removed (no other call sites left).
2. **อ.9-destroy item-12(1)** (`A9DestroyReportBuilder`): the write-off-date composed string replaced with a
   single `refrow("(1)", "วัน เดือน ปี ที่จะทำการกำจัดหรือทำลาย", writeOffDate, null, null, false)` call —
   **only this one row.** Item-12(2)+person2 and items (3)-(9) (plain tick/label `employer` rows, no write-in
   value) were **not touched**, and items 3/4 (the `person` band) were never touched at all.
3. Added the `refrow` band to `request-a9-destroy`'s evidenceSub too (new file for it, previously the only one
   of the 5 without it) — `protected`-ized the shared `refrow()` helper in `A9CheckListReportBuilderBase` so
   the destroy subclass can call it.
4. **New guard, applied to all 5 templates**: the `refrow` band's 2nd label/value slot (`note`/`detail2`) is
   now `printWhenExpression`-gated on `$F{note} != null` — single-value rows (item-12(3), item-12(1) here)
   only pass `label2=null`, so no stray empty dotted box appears where there's nothing to underline. The
   first slot (`detail`) always renders (that's the row's primary write-in value).
5. Mirrored into the `A14CheckListPreviewBuilder` and `A9CheckListPreviewBuilder` (destroy-branch) mocks.

**Regression check on a9-destroy (the explicit ask):** `git diff` on `request-a9-destroy/subreport/
request-a9-evidenceSub.jrxml` is a **pure 32-line addition** at the end of the file (the new `refrow` band)
— zero bytes changed in the existing `person`/`doc`/`docsub`/`employer`/`person2` bands. Items 3/4 render
off the untouched `person` band; they are provably byte-identical to before.

**Verify (DB-free):** full suite 15/15 green (both `A9PreviewTest` variants — destroy + transport — render
their updated mocks), `clean package` green, 58/58 jrxml.

Back to **Sober** — see `inbox/SA.md`. Then QA re-renders all 5 forms: the in-scope rows dotted (blank +
populated), and **a9-destroy items 3/4 identical to before** as the explicit regression check.

## Round 3 — REOPENED 2026-08-31 (stakeholder rejected the render). Whole page, 5 forms, PDF is the spec.
Prior rounds were too narrow. See **SPEC-038 Round 3** for the layout rules + the a9-transport per-line write-in
inventory (authoritative, verbatim from the PDF). This is a HIGH-priority layout redo of the whole evidence page.

## Do
- **Render every write-in slot the official PDF shows** per SPEC-038 R3's inventory — NOT just the old (1)/(2) rows.
  For a9-transport that means item-5 (ร.ง.4 วันหมดอายุ; อ.2/อ.7 เลขที่+ลงวันที่+วันหมดอายุ; เปิดดำเนินการ (1)(2)),
  items 3/4 BOTH (1)(2), and all of item-12's เลขที่/ลงวันที่/วันหมดอายุ + (1)(2) permit rows.
- **Layout rules (SPEC-038 R3):** (1) label never compressed/wrapped mid-word — full width; (2) dotted write-in
  follows the label immediately, filling to the next label; (3) long labels wrap full-width, the write-in group drops
  to the next line INDENTED (write-ins move, not the label).
- Apply the same line-by-line pass to **a9-transport · a15 · a14 · a4 · a9-destroy**, each against ITS official PDF.
  a9-destroy items 3/4 keep today's content but gain their (2) slot / dotted fills per the DESTROY PDF (still the regression-sensitive rows — match the form, don't invent).
- Start with a9-transport (inventory provided). Sober will provide/verify the a14/a15/a4/a9-destroy inventories from
  their PDFs in review — flag when you reach each and I'll hand you its line list.

## Verify
- Check the RENDERED PDF against the official form (not a label grep): every write-in line shows its dotted slot(s),
  blank + populated; NO Thai label breaks mid-word; long labels wrap full-width with write-ins indented below.
- All PreviewTests + clean package green. Then QA re-renders all 5 vs the official PDFs.

## Round 3 progress (2026-09-01) — Jason: อ.9 family done (transport · a15 · destroy). a14/a4 need your inventories.

I read `A9-form-TRANSPORT-official.pdf` and `A9-form-DESTROY-official.pdf` directly and worked the evidence page
line by line against them, then **verified by reading the rendered PDF back** (not a grep).

### New `refrow3` row type — replaces `refrow` (R1/R2's 2-slot version, now deleted)
`EvidenceSub` gained `label3`/`detail3` (+ back-compat ctors, no existing call site touched). One band per template,
gated on `"refrow3"`: checkbox + seq + **label on its own full-width line** (`textAdjust=StretchHeight`, never
compressed), then **up to 3 label+dotted-field segments indented on the line below**. Each segment is
`printWhenExpression`-gated on its own label, so a 1-slot row shows exactly one dotted line, not three empty boxes.

### Lines now rendering their write-ins (all verified in the rendered PDF)
- **items 3/4** — both **(1) AND (2)** slots always (padded blank when the request has fewer people). Was: only
  the rows that existed.
- **item 5** — ร.ง.4 `วันหมดอายุ` · อ.2 `เลขที่`+`ลงวันที่`+`วันหมดอายุ` · อ.7 `เลขที่`+`ลงวันที่`+`วันหมดอายุ` ·
  เปิดดำเนินการ **(1)(2)** `ที่`+`ลง`. All values pulled from that code's doc row (DEF-17 pattern). Was: 4 plain
  tick-only lines with no write-ins at all.
- **item 12** — บัตรนายกสมาคม / มอบอำนาจ / นายกฯ-ผู้มอบอำนาจ / ผู้รับมอบอำนาจ each `เลขที่`+`วันหมดอายุ` ;
  ขอซื้อ + คณะกรรมการ `เลขที่`+`ลงวันที่` ; ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์ **(1)(2)** `ที่`+`ลง`.
- **a9-destroy** item-12(1) วันที่กำจัด/ทำลาย (R2 carry-over, now on refrow3).
- **The Thai mid-word breaks are gone** — `ตามหนังสีอขอซื้อ` etc. no longer occur; confirmed by reading the
  rendered text back. อ.7's label differs per form (TRANSPORT long / DESTROY short) → variant hook, form-verbatim.

### ⚠️ One deliberate layout deviation — your call, flagging not deciding
SPEC-038 R3 rule 3 implies **short** labels keep their write-ins on the *same* line and only long ones drop to the
next. My `refrow3` band puts the label on its own line **always**. I chose that because it's the only shape that
satisfies rule 1 (never compress/wrap the label) unconditionally — deciding per-row what counts as "short enough"
is exactly the kind of guess that produced the mid-word breaks in the first place. Cost: more vertical space
(a9-transport went 4 → 5 pages). If you want short rows inline, tell me the rule for "short" (a character budget,
or an explicit per-line list from the PDF) and I'll add a second inline band — I don't want to invent that threshold.

### ⚠️ Near-miss worth recording
Deleting the old `refrow` band from all 5 templates would have made a14's and a4's permit rows **silently vanish**
— those two builders still emit `type="refrow"` and are not yet R3-converted. Caught it before the run; a14/a4 keep
their `refrow` band until their conversion. It's the "renders plausibly when wrong" shape again — a compile and a
green PreviewTest would both have passed with the rows simply missing.

### Not done — needs your per-form inventories (as you offered)
**a14 and a4 are untouched by R3.** They have their own `EvidenceSub` records + templates, and their official forms
are different documents (`A14-A16-...`, `A4-A8-...`). Per your "I'll hand you the a14/a15/a4/a9-destroy line lists
from THEIR PDFs" — a15 and a9-destroy came free (they share the a9 base/model), so **a14 and a4 are what's left**.
Send those two line lists and I'll apply the same pass.

**Verify (DB-free):** full suite 15/15 green; `clean package` green, 58/58 jrxml. Rendered
`target/a9-transport-preview.pdf` + `a9-preview.pdf` read back and compared line-by-line against the two official
PDFs (the on-point check, per SPEC-038's method note).

Back to **Sober** — see `inbox/SA.md`.

## Round 3 COMPLETE (2026-09-01) — Jason: all 5 forms done

a14 + a4 applied per your SPEC-038 R3 inventories. **`refrow3` is now the single write-in mechanism across all 5
forms** — the R1/R2 2-slot `refrow` type, its band, and its helpers are fully removed (no emitter, no band, no
dead helper left anywhere).

### a14 (per your inventory — it differs from a9, as you flagged)
- **item 5: NO อ.7 line** (only ร.ง.4 → วันหมดอายุ · อ.2 → เลขที่+ลงวันที่+วันหมดอายุ · เปิดสายการผลิต → (1)(2) ที่+ลง).
- **item 12 = INTERNATIONAL block** (no นายกสมาคม / no ส.ค.4): มอบอำนาจ → ลงวันที่ · END-USER CERTIFICATE (☐) ·
  บัตรผู้รับมอบอำนาจ → เลขที่+วันหมดอายุ · ขอซื้อ → เลขที่+ลงวันที่ · ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์ → each (1)(2) ที่+ลง.
- items 3/4 padded to both (1)(2). Added a local `documentReferenceNo`/`expiryDate` (a14 doesn't extend the a9 base).

### a4 (per your inventory — no buyer block)
- item 5 **has** อ.7 (unlike a14): ร.ง.4 วันหมดอายุ · อ.2 and อ.7 เลขที่+ลงวันที่+วันหมดอายุ · เปิดสายการผลิต (1)(2).
- **item 6** อ.8 ฉบับเดิม → (1)(2) ที่+ลง (kept the min-2 padding). **items 7–17 stay ☐-only** — no write-ins added,
  exactly as your inventory says. Annex อ.8 columns untouched (REQ-029's, not this REQ).
- items 3/4 padded to both (1)(2).

### Layout ruling followed
Shipped the **own-line** version as instructed; **no inline band added**. Awaiting the stakeholder's eye via QA —
if they want inline-for-short, send the per-row inline/drop list and I'll add the second band.

**Verify:** suite 15/15 green; `clean package` green (58/58 jrxml). Read the **rendered** a9-transport and a14 PDFs
back against their official forms (the on-point check): every inventory line has its dotted slot(s) blank+populated,
no Thai mid-word breaks, a14 correctly has no อ.7 and no นายกสมาคม/ส.ค.4. Page counts: a9-transport 4→5, a14 4→5,
a15 5, a4 4, a9-destroy 4 (the own-line layout costs the extra page — expected, part of the ruling above).

Back to **Sober** — see `inbox/SA.md`. Then QA renders all 5 vs the official PDFs.

## Round 4 done (2026-09-02) — Jason: INLINE per the rendered form; a9-transport back to 4 pages

Followed the image method: rendered `A9-form-TRANSPORT-official.pdf` p2–p3 AND our own output to PNG and
compared them by eye each cycle. Evidence filed next to Porter's:
`project-docs/REQ-033-evidence/OURS-R4-a9-transport-p2.png` / `-p3.png` / `-.pdf`.

### What was actually wrong (seen in the image, not inferred)
My R3 "always own-line" band put every write-in on its own line. Against the official that was wrong in
three visible ways at once: no dotted run after the label, `เลขที่`/`ลงวันที่` pushed to the next line, and
`(1)`/`(2)` split from their `ที่ …… ลง ……`. It also cost a page (5 vs 4).

### The fix — three purpose-built bands, chosen per row from the form
- **`refrow3` (INLINE, the form's default)** — checkbox + label + up to 2 label+dotted segments on ONE line.
  The dotted run after the label comes from giving the label field itself a fixed width and a dotted bottom
  border — that is exactly how the paper form produces it.
- **`refrow3w` (WRAPPED)** — only where the label genuinely overflows (อ.2, อ.7, คณะกรรมการ): label takes the
  full width, its write-ins sit indented on the line below. **No overlap** (R3 symptom #2 gone).
- **`refrownum`** — `(n) ที่ …… ลง ……` on ONE line, **no checkbox** (the form shows none).

Applied across a9-transport · a15 · a14 · a4 · a9-destroy, in the real builders **and** the preview mocks
(the mocks are what the PreviewTests render — that is why my first R4 pass still looked wrong).

### Verified by image + page count, not by description
- **a9-transport = 4 pages** (official 4). a9-destroy 4 · a14 4 · a15 4 · a4 4.
- `ตามหนังสือขอซื้อ ……… เลขที่ …… ลงวันที่ ……` renders on one line with the dotted fill — the stakeholder's
  verbatim target row.
- คณะกรรมการ wraps full-width with its write-ins below, not overlapping.
- ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์ and เปิดดำเนินการ: `(1) ที่ …… ลง ……` each on one line.
- No Thai mid-word breaks anywhere on p2–p3.
- Suite 15/15 green; `clean package` green (58/58 jrxml).

### ⚠️ Two things I will not decide myself
1. **A behaviour change with data loss.** The form has no checkbox on the `(n) ที่ …… ลง ……` rows, so
   `refrownum` drops it — which means the per-row `ATTACH_FILE_ID` signal (previously a tick on อ.4 item-6
   and the ป.3/ป.5 rows) **is no longer shown anywhere**. The data is still read; the form has nowhere to
   put it. I updated `A4CheckListReportBuilderTest` to assert the form-accurate shape and documented the
   consequence in the test itself. If officers rely on that tick, the *form* needs a column — I am not
   inventing a checkbox the form doesn't have.
2. **อ.7 is a genuine hybrid I could not reproduce exactly.** The official keeps `เลขที่`/`ลงวันที่` inline
   at the end of the long label line and wraps only `วันหมดอายุ`. A fixed Jasper band cannot split a
   segment group mid-flow, so all three sit on line 2. Everything else on the row matches. Flagging rather
   than claiming parity — if it matters, it needs a per-row hand-positioned band for that one line.

Back to **Sober** — see `inbox/SA.md`. Compare `OURS-R4-a9-transport-p2/p3.png` against
`OFFICIAL-a9-transport-p2/p3.png`; then QA renders all 5 against their own official PDFs.

## R4 review fixes (2026-09-02) — Jason: (a) and (b) done, (c) noted

**(b) `(ลำดับ 9)` restored — and the cause matters.** The label was never missing from the builder; the
inline band's 200px label field was **truncating** it. Any long label on a 2-segment inline row would have
been silently clipped the same way — so I added a fourth band rather than just widening one field:
- **`refrow1`** — INLINE, **wide label (300px) + ONE segment**. For rows whose label is too long for the
  2-segment band (ร.ง.4 …(ลำดับ 9) วันหมดอายุ ……). Applied in a9-transport/a15/a9-destroy, a14 and a4.

**(a) item-4 numbering restarts (1)(2).** This was **mock-only** — `buildPersons()` already numbers from 1
per call, so real data was always correct. Worth recording why the mock had it: the **official DESTROY PDF
literally prints "(3)" then "(1)"** in item 4 — a typo in the source document, which the mock had faithfully
copied. The TRANSPORT form shows (1)(2). I did not reproduce the typo; "the form is the spec" means the
form's *intent*, not its proofreading errors. Flagging in case the stakeholder wants the typo preserved.

**(c) อ.7 hybrid** — noted as an accepted minor deviation per your call.

**Verified (image + page count):** re-rendered and compared to `OFFICIAL-a9-transport-p2.png`. ร.ง.4 now
reads `…(แบบ ร.ง.4) (ลำดับ 9) ……… วันหมดอายุ 1 ม.ค. 2569` in full on one line; item 4 shows (1)(2).
**a9-transport still 4 pages**; destroy 4 · a14 4 · a15 4 · a4 4. Suite **15/15**, `clean package` green
(58/58 jrxml). Evidence refreshed at `project-docs/REQ-033-evidence/OURS-R4-a9-transport-p2/p3.png`.

→ Back to **Sober** for the quick re-check, then QA renders all 5 against their official PDFs.
