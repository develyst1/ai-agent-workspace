# TASK-041: personCheck LIVE ครบ/ไม่ครบ rule + system-populated missing list (SPEC-037)

- Source: SPEC-037 (Porter's stakeholder rule). Assignee: Jason (BE). **LIVE `PersonCheckReportBuilder` ONLY** — do NOT
  touch `PersonCheckHistoryReportBuilder` (snapshot is frozen/verbatim).

## Do
1. `ครบ` ⟺ items ๑,๒,๓ ticked AND item ๔ ticked AND every REAL person has BOTH บัตรประชาชน + ทะเบียนบ้าน. Else ไม่ครบ.
2. **Item ๕ excluded** from the calc entirely.
3. Item ๔ tick = ≥1 real person exists (presence). **Pad rows never count** (keep the existing pad exclusion).
4. Zero people ⇒ item ๔ untick ⇒ ไม่ครบ (explicit path).
5. **System-populate "ไม่ครบ ขาดเอกสารดังนี้" (DocIncomp section)** with the gaps: item ๑/๒/๓ untick → name the document;
   a person missing a doc → `ขาด<doc> — <คำนำหน้า ชื่อ สกุล>`. Fill the numbered rows; leave the rest blank+ruled (min 3).
6. `แก้ไข` / `เอกสารที่หมดอายุ` / `เอกสารเพิ่มเติม อื่น ๆ` / `หมายเหตุ` stay blank hand-fill (unchanged).

## Verify — BE then QA
- BE: mock scenarios — (a) all complete → ครบ; (b) a person missing ทะเบียนบ้าน → ไม่ครบ + a named "ขาด… — person" line;
  (c) item ๕ absent → still ครบ if ๑–๔ ok; (d) zero people → item๔ untick + ไม่ครบ. No literal null; PreviewTests green; clean package green.
- QA (real DB): 38237 live path reflects the rule; the HISTORY path (FORM_ID 211) is UNCHANGED (verbatim snapshot); other forms unaffected.

## Handoff
Back to **Sober** (review: ๕-excluded, per-person completeness, named missing lines, pad-rows-excluded, zero-people path,
history untouched). Then QA both paths → closes REQ-032.

## Done (2026-08-27) — Jason

Live `PersonCheckReportBuilder` only — `PersonCheckHistoryReportBuilder` untouched (confirmed by re-reading it, no edits made).

- `completed` = item1.checked && item2.checked && item3.checked && item4Ticked && everyPersonComplete.
  Item ๕ never enters the formula (still rendered/ticked on the form, just doesn't gate ครบ).
- Item ๔'s own tick is now **presence-based** (`!realPersons.isEmpty()`), not attachment-based — replaces the
  old `personDocsComplete` (all-docs-checked) semantics from TASK-038/039. Pad rows are computed from
  `realPersons` (pre-pad) so they never influence either the tick or `everyPersonComplete`.
  Zero persons → item ๔ unticked → `completed=false` automatically (no special-cased branch needed).
- New `buildMissingList()`: unticked items ๑/๒/๓ contribute their full title as a line; each real person
  missing a doc contributes `"ขาด<doc> — <name>"` (a person missing both gets 2 lines). Real lines fill from
  row 1; padded with blank ruled rows up to the existing min-3 floor. `แก้ไข`/`เอกสารที่หมดอายุ`/
  `เอกสารเพิ่มเติมอื่นๆ`/`หมายเหตุ` untouched (still hand-fill blank, per TASK-039).

**Verify (DB-free) — new precedent, flagging it as a deliberate choice:** added
`PersonCheckReportBuilderTest` (plain JUnit + Mockito, no Spring context) — the **first builder-level unit
test in this codebase** (every other builder, including personCheck's own live/history builders until now,
is only verified via PreviewTest layout renders or by reading). Did this because TASK-041 is a business-rule
change where a visual render doesn't prove the branching logic, and BE has no DB to exercise it against.
Mocks the 5 repo dependencies, calls `createDataRaw()` directly, asserts on the actual `completed` boolean
and missing-list text for exactly the 4 scenarios TASK-041 listed: (a) all complete → ครบ ✅, (b) person
missing ทะเบียนบ้าน → ไม่ครบ + `"ขาดสำเนาทะเบียนบ้าน — นายบี สอง"` line ✅, (c) item ๕ absent, ๑–๔ ok → still
ครบ ✅, (d) zero people → item ๔ untick + ไม่ครบ ✅. All 4 green. If this pattern is unwanted going forward,
say so and I'll stick to PreviewTest-only for future builders.

All 5 `*PreviewTest`s green (unaffected — they hand-construct `PersonCheckReportData` directly, bypassing
the builder, so this rule change doesn't touch them). `clean package` green, 52/52 jrxml, jar built.

Back to **Sober** — see `inbox/SA.md`. Then QA: 38237 (live, rule applies) + FORM_ID 211 (history, unchanged) → closes REQ-032.
