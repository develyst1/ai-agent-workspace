# SPEC-038: dotted underlines on the (1)/(2) write-in rows (REQ-033)

- Source: REQ-033 (Porter/stakeholder). Scope: **อ.9-transport · อ.14 · อ.15 · อ.4** — the item-12 permit rows
  (ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์ + ขอซื้อ/คณะกรรมการ) and **อ.4 item-6** (อ.8 ฉบับเดิม). **อ.9-destroy is OUT** (its
  items 3/4 already use template fields with dotted lines — do NOT restyle).
- Status: ACTIVE (SA spec). 4 DELIVERED forms → each needs a re-render check (visual change to shipped output).

## Root cause (mechanism, not cosmetics)
The write-in rows are built by **string concatenation in the builder**, printed as one static label — so there is no
value field for the template to underline:
- `A9CheckListReportBuilderBase.addLicenseRows` (:340): `employer("(" + n + ") ที่ " + nz(no) + "  ลง " + nz(date), …)`
- `…refNoDate` (:347): `prefix + "  เลขที่ " + nz(no) + "  ลงวันที่ " + nz(date)`
- a14 (`:231/:235…`) and a4 (item-6) do the same.
The `employer` band renders `$F{label}` as a single textField → an empty row prints a bare `(1) ที่    ลง`, no dotted line.
**Rows already correct use the other mechanism: template label + its OWN field with `<bottomPen lineStyle="Dotted"/>`**
(e.g. the `person` band's เลขที่/วันหมดอายุ fields). Replicate that; leave working rows alone.

## Do
1. **New structured `EvidenceSub` row type** (e.g. `type="refrow"`) carrying the parts, not a composed string:
   `seq` = "(1)"/"(2)" (or blank), a fixed prefix label, `detail` = refNo, `detail2` = date-string, `checked` = tick.
   (The `EvidenceSub` record already has seq/label/detail/detail2/checked — reuse them; no record change likely needed.)
2. **New evidenceSub band for `refrow`** in the evidenceSub `.jrxml` of **request-a9-transport, request-a15,
   request-a14, request-a4** (NOT a9-destroy): checkbox (if applicable) + `seq` + prefix + "ที่/เลขที่" + `detail`
   field (bottomPen Dotted) + "ลง/ลงวันที่" + `detail2` field (bottomPen Dotted). Model on the existing `person` band's
   dotted fields. Blank value → the dotted line still prints.
3. **Builders emit `refrow` subs with structured fields** instead of composing strings:
   `addLicenseRows` and the `refNoDate`-based rows in `A9CheckListReportBuilderBase` (transport+a15), `A14CheckListReportBuilder`,
   and `A4CheckListReportBuilder` (item-6). Keep the same tick source + row count (incl. the min-slot padding a4 uses).
4. **Do NOT touch** rows already rendering label+own-field (a9-destroy items 3/4, and any other row using template fields).

## Acceptance (all 4 are DELIVERED — re-render each)
- อ.9-transport / อ.14 / อ.15 / อ.4: the (1)/(2) / เลขที่ / ลงวันที่ write-in rows show **dotted underlines** whether or
  not a value is present; a populated row prints the value ON the dotted line. Structure/labels/ticks otherwise unchanged.
- อ.9-destroy unchanged (canary — it already had dotted lines). a1/a3/a6 unaffected.
- Verify by rendered PDF, not by grep (see method note below).

## Method note (Porter's, adopted as a review rule)
A `lineStyle="Dotted"` COUNT per file (or a rendered PDF), not a label grep, is the on-point check here — a label grep
finds where a label exists, not whether a dotted line does. General rule now in effect: **when a check is cheap, ask
what it would say if the answer were the opposite; if it would say the same thing, it is not a check.** (Same failure
shape as md5-for-"did output change" and clean-package-for-"is the .jasper stale".)

## Task
- TASK-044 (Jason, BE): builder + evidenceSub template changes across the 4 forms; re-render each; a9-destroy untouched.

## Round 3 — REOPENED 2026-08-31 (stakeholder rejected). SCOPE = whole evidence page, 5 forms, PDF is the spec.
Porter's narrow `(1)/(2)` scope was too small. Work each form's evidence page **line by line against its official PDF**
(a9-transport → `A9-form-TRANSPORT-official.pdf`, a9-destroy → DESTROY, a14/a15 → `A14-A16-...`, a4 → `A4-A8-...`).
**Where any prior description disagrees with the form, the form wins.**

### Layout rules (all forms)
1. **NEVER compress or wrap the label.** Current output breaks Thai mid-word (`ตามหนังสี`/`อขอซื้อ`) because the label
   textField was squeezed. The label takes the width it needs.
2. A **dotted write-in follows the label immediately**, filling to the next label (เลขที่ …… ลงวันที่ …… วันหมดอายุ ……).
3. **Long labels wrap to full width; their write-in group drops to the NEXT line, indented.** The write-ins move, never the label.

### a9-transport write-in inventory (verbatim from the PDF — the authoritative reference; a15 mirrors it minus MOVE)
- **1** จดทะเบียน: `ออกให้เมื่อ`[date]
- **2** มอบอำนาจ: `ลงวันที่`[date]
- **3 / 4** (each has slots **(1) AND (2)**): name + ☐ทะเบียนบ้าน ☐บัตรประชาชน + `เลขที่`[id] `วันหมดอายุ`[date]
- **5**: ร.ง.4 → `วันหมดอายุ`[date] · อ.2 → `เลขที่`[no] `ลงวันที่`[date] `วันหมดอายุ`[date] · อ.7 → `เลขที่`[no]
  `ลงวันที่`[date] `วันหมดอายุ`[date] · เปิดดำเนินการ → **(1)** `ที่`[no] `ลง`[date] **(2)** `ที่`[no] `ลง`[date]
- **6–11**: ☐ label only (no write-in)
- **12**: ส.ค.4 (☐ only) · ชื่อนายกสมาคม [name] · บัตรนายกสมาคม `เลขที่`[id] `วันหมดอายุ`[date] · มอบอำนาจ `ลงวันที่`[date] ·
  บัตรนายกฯ/ผู้มอบอำนาจ `เลขที่`[id] `วันหมดอายุ`[date] · บัตรผู้รับมอบอำนาจ `เลขที่`[id] `วันหมดอายุ`[date] ·
  ตัวอย่างลายมือชื่อ **(1)(2)** name+☐บัตร `เลขที่`[id] `วันหมดอายุ`[date] · ขอซื้อ `เลขที่`[no] `ลงวันที่`[date] ·
  คณะกรรมการ(long, wraps) `เลขที่`[no] `ลงวันที่`[date] · แผนการใช้กระสุน (☐) · ภาพถ่ายสนามยิงปืน (☐) ·
  ป.3 / ป.5 / มหาดไทย / ยุทธภัณฑ์ → each **(1)(2)** `ที่`[no] `ลง`[date]
- **13**: เอกสารอื่น ๆ (☐ only)

### Method (SA owns "form is the spec")
Sober provides the per-line inventory for each form from its PDF (a9-transport above; a14/a15/a4/a9-destroy to follow /
verified in review). Jason renders each line as **label(full width, no wrap-break) + the dotted slots above**; items with
(1)(2) get BOTH slots; long labels wrap full-width with the write-in group indented on the next line. a9-destroy items 3/4
still render exactly as today except gaining their (2) slot / dotted fills per the DESTROY PDF.

### a14 write-in inventory (verbatim from A14-A16-form-official.pdf) — ⚠️ item-5 & item-12 DIFFER from a9
- **1** ออกให้เมื่อ[date] · **2** ลงวันที่[date] · **3/4** (1)+(2) name+☐ทะเบียนบ้าน ☐บัตร + เลขที่[id] วันหมดอายุ[date]
- **5** (⚠️ NO อ.7 line): ร.ง.4 → วันหมดอายุ[date] · อ.2 → เลขที่[no] ลงวันที่[date] วันหมดอายุ[date] ·
  เปิดสายการผลิต → (1)(2) ที่[no] ลง[date]
- **6–11**: ☐ only
- **12 เอกสารขอผู้ซื้อ (INTERNATIONAL — different from a9, NO นายกสมาคม/ส.ค.4):**
  จดทะเบียนนิติบุคคลผู้ซื้อ (☐) · หลักฐานการขอซื้อ…ประเทศผู้ซื้อ (☐) · หนังสือมอบอำนาจ → ลงวันที่[date] ·
  END-USER CERTIFICATE (☐) · บัตรผู้รับมอบอำนาจ → เลขที่[id] วันหมดอายุ[date] · ตัวอย่างลายมือชื่อผู้รับอาวุธ (☐) ·
  ตามหนังสือขอซื้อ → เลขที่[no] ลงวันที่[date] · ภาพถ่ายสนามยิงปืน (☐) · ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์ → each (1)(2) ที่[no] ลง[date]
- **13**: ☐ only

### a4 write-in inventory (verbatim from A4-A8-form-official.pdf) — NO buyer block
- **1** ออกให้เมื่อ[date] · **2** ลงวันที่[date] · **3/4** (1)+(2) name+☐ทะเบียนบ้าน ☐บัตร + เลขที่[id] วันหมดอายุ[date]
- **5**: ร.ง.4 → วันหมดอายุ[date] · อ.2 → เลขที่[no] ลงวันที่[date] วันหมดอายุ[date] · อ.7 → เลขที่[no] ลงวันที่[date]
  วันหมดอายุ[date] · เปิดสายการผลิต → (1)(2) ที่[no] ลง[date]
- **6 อ.8 ฉบับเดิม** → (1)(2) ที่[no] ลง[date]
- **7–17**: ☐ only (no write-in). Annex (p.4) อ.8 columns handled separately (REQ-029, not this REQ).

### Layout call (Jason's R3 flag) — RULING
Ship the **safe own-line** version now (label full width, write-ins indented below) — it fixes the actual defect
(missing dotted lines + Thai mid-word breaks) the stakeholder rejected. **Do NOT add an inline band yet.** Inline-vs-
own-line is a stakeholder-visible aesthetic and they were picky here — let them SEE the refrow3 render via QA first.
If they want inline-for-short-labels to save the page, Sober will hand you the exact per-row inline/drop list from the
PDFs (deterministic from the form — NOT a "short enough" guess). Decision deferred to the stakeholder's eye, not guessed.

## Round 4 — VISUAL SPEC from the RENDERED official PDF (my R3 own-line ruling was WRONG)
I rendered `A9-form-TRANSPORT-official.pdf` p2-3 to images and read them. The form is **INLINE-dominant** — my
"label on its own line always" ruling (R3) is the reason the stakeholder rejected again. **Reversed.**

### The layout, from the image (this is the spec; render + compare, don't paraphrase)
- **Default = INLINE:** label + its write-in slots flow left-to-right on the SAME line, a **dotted run fills the gap**
  between the label and each slot and after it. Examples on the official:
  - `2. ☐ หนังสือมอบอำนาจ ลงวันที่ ……[date]……` — one line.
  - อ.7: `☐ …(แบบ อ.7) เลขที่ ……[no]…… ลงวันที่ …[date]` — label+เลขที่+ลงวันที่ one line; only `วันหมดอายุ …` wraps to line 2.
  - `☐ ตามหนังสือขอซื้อ ………(dots)……… เลขที่ …[no]… ลงวันที่ …[date]…` — one line (R3 symptom #1: ours dropped these to line 2 with no dots).
  - item-12 buyer rows (บัตรนายกฯ, มอบอำนาจ, บัตรผู้รับมอบ) — each ONE line, label + inline write-ins.
- **Wrap ONLY on overflow, write-ins move to the next line indented (label never mid-word-broken):**
  - item 1 (long label) → `ออกให้เมื่อ …` on line 2.
  - อ.2 → `เลขที่ … ลงวันที่ … วันหมดอายุ …` on line 2.
  - item 3/4 → `เลขที่ … วันหมดอายุ …` on line 2 (after the name + 2 checkboxes line).
  - **คณะกรรมการ (long paragraph)** → label wraps across full-width line(s), then `เลขที่ … ลงวันที่ …` on the line
    below — **must not overlap** the wrapped text (R3 symptom #2).
- **(1)/(2) sub-rows = ONE line each:** `‹indent› (1) ที่ …[no]… ลง …[date]…` (เปิดดำเนินการ, ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์).
  R3 symptom #3: ours split the `(1)`/`(2)` from its `ที่ … ลง …` — they go together.
- Page count is the tell: **official a9-transport = 4 pages.** If ours is 5, the layout is still wrong.
- Red variant note on p3 (`*กรณีตามมาตรา 7 / สำเนาบัตรประจำข้าราชการทหาร/ตำรวจ`) exists on the form — confirm whether it must render.

### Method (Porter's, mandatory) — render to image, compare, iterate
Produce the official image + OUR rendered output image and compare line-by-line VISUALLY each cycle:
```
python -c "import fitz,tempfile,os; d=fitz.open('<pdf>'); [d[p].get_pixmap(matrix=fitz.Matrix(2,2)).save(os.path.join(tempfile.gettempdir(),f'cmp-p{p+1}.png')) for p in range(1,3)]"
```
(official PDFs in `project-docs/`; our output = the PreviewTest `target/*.pdf`). **Do not use text-grep or a description
for layout** — only the rendered image. Sober supplies the official reference images + verifies; Jason iterates positioning.
This is per-row Jasper positioning, not a one-size band — the generic "always own-line" band is abandoned.
