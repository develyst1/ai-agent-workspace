# TASK-039: personCheck — DEF-18 null-date + human's revised-form layout (REQ-032, one pass)

- Source: DEF-18 (QA) + Porter relaying the human's REVISED form (supersedes the surveyed PDF for the verification
  block). Assignee: Jason (BE). Closes REQ-032. Land all of it in one pass.
- Frame correction (Porter): this is a PAPER form — the verification write-in rows and extra person rows are
  **blank ruled rows filled by hand**, NOT data bindings. Do not compute/derive them. (The earlier "expired-docs
  accepted limitation" is withdrawn — it was never a data gap.)

## Do
1. **DEF-18 — no literal `null`:** `วันที่มาติดต่อ` (`contactDate`) prints `"null"` on 38237 when null. Guard with
   `nz()`/blank like every other field. **Sweep the whole personCheck data path** — no field may emit literal `"null"`
   (SPEC-035 "blank never null"). 
2. **วันที่มาติดต่อ = DATE ONLY, no time.** Ours renders `… 14:22`; the human's shows `08/05/2569` with no time. Format
   date-only (ThaiDateFormatUtil date formatter). If the time is ever deemed deliberate, raise it — but the revised form is date-only.
3. **Person table — minimum 5 rows.** Render the real persons; **pad with blank ruled rows up to 5**; if the request
   has >5 persons, render all of them (grow beyond 5). Simplest: pad the person list to `max(5, persons.size())` with
   blank rows (blank name, unticked) in the builder so the template just iterates.
4. **Verification block — 4 sub-sections, each with ≥3 numbered blank write-in rows:**
   - `ไม่ครบ ขาดเอกสารดังนี้` · **`แก้ไข`** · `เอกสารที่หมดอายุ` · **`เอกสารเพิ่มเติม อื่น ๆ`**
   - `แก้ไข` and `เอกสารเพิ่มเติม อื่น ๆ` are **NEW** (not in the surveyed PDF). Each sub-section prints **min 3
     numbered blank ruled rows** for hand-fill (grow if real data ever exists, but default blank). These are NOT
     computed from the checklist items — remove the compute-from-items for missing/expired; render fixed blank rows.
   - `ครบ / ไม่ครบ` stays a checkbox (as built). Keep the officer footer (ผู้มายื่นเรื่อง/เจ้าหน้าที่รับเรื่อง/วันที่มาติดต่อ).
5. **Add a `หมายเหตุ` section** after `เอกสารเพิ่มเติม อื่น ๆ`, before the footer (blank ruled area for hand-fill).
6. Template edits are now sanctioned (the revised form requires them) — keep them minimal and consistent with the
   existing subreport chain; the REQ-031 precompile builds the `.jasper` on a plain `clean package`.

## Verify — BE then QA
- BE: grep the rendered mock PDF text — **no literal `"null"` anywhere**; `วันที่มาติดต่อ` date-only; person table
  shows ≥5 rows on a <5-person mock; the 4 verification sub-sections each show 3 blank numbered rows; หมายเหตุ present.
  PersonCheckPreviewTest + `clean package` green; other forms' PreviewTests unchanged.
- QA (real DB): **38237 → 200**, no literal `null`, date-only, ≥5 person rows, 4 write-in sub-sections + หมายเหตุ match
  the human's revised form, real person ticks land, no sample person.

## Handoff
Back to **Sober** (review: no-literal-null sweep, date-only, min-rows, the 2 new sub-sections + หมายเหตุ, no drift). Then QA on 38237 closes REQ-032.

## Done (2026-08-27) — Jason

All 6 items landed in one pass, DB-free green.

1. **DEF-18 fixed**: added `@JsonInclude(NON_NULL)` to the top-level `PersonCheckReportData` record (the
   nested records already had it). Root cause: a null String field serialized as JSON `null`, and
   JsonDataSource/Jackson's `NullNode.asText()` returns the literal string `"null"`, not blank — dropping
   the key entirely is what actually fixes it, `nz()`-to-`""` alone would not have (still confirmed as
   defense-in-depth: `note`/`contactDate` also nz-guarded in the builder now).
2. `contactDate` now built via a new `dateOnly(LocalDateTime)` helper — `ThaiDateFormatUtil.formatOrNull`
   on `.toLocalDate()`, date-only, no time, blank-not-null.
3. `padPersons()` — real persons rendered as-is; padded with blank (`""`, unticked) rows up to 5; if the
   request has >5 people all render (no cap). `personDocsComplete` (item ๔'s own checked flag) still
   computed from the **real** list only — pad rows never count against it.
4. Removed the old compute-from-documentItems `missing`/`expired` logic entirely (dead code deleted, incl.
   the now-unused `buildExpiredItems`). All 4 sub-sections (`ไม่ครบ`/`แก้ไข`(new)/`เอกสารที่หมดอายุ`/
   `เอกสารเพิ่มเติมอื่นๆ`(new)) now always get 3 blank numbered `VerificationItem`s via `blankWriteInRows()` —
   hand-fill paper lines, not data. Their own header checkbox (`status`) is hardcoded `false` (kept the
   checkbox element per "minimal template edit", just no longer computed). Top-level `ครบ` checkbox is
   unchanged — still computed from `documentItems`.
   `verificationResult-Sections-Item.jrxml`: swapped the `"- "+title` bullet for `"("+orderNo+") "+title`
   with a bottom-border ruled line, so blank rows render as numbered ruled write-in lines, not empty
   bullets.
5. `main.jrxml`: new static band between the verificationResult subreport and the footer — `หมายเหตุ` label
   + 2 ruled lines, blank (no data binding — same "paper form, hand-filled" treatment as item 4, per your
   own framing in the task).
6. Template edits kept to the 2 files above; no change to the subreport parameter chain from TASK-038.

**Verify (DB-free):** `PersonCheckPreviewTest` updated — mock now includes `contactDate=null` with an
`assertFalse(json.contains("null"))` regression guard (catches DEF-18 recurring at the JSON-serialization
layer, not just visually), 5-row person mock (2 real + 3 blank) to exercise the padded layout, and 3-blank-row
verification sections. Green, PDF now 2 pages (was 1 — expected, more content). All 5 `*PreviewTest`s green,
no regression. `./mvnw -o -DskipTests clean package` green, 52/52 jrxml precompiled, jar built.

Back to **Sober** — see `inbox/SA.md`. Then QA re-verifies 38237.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
