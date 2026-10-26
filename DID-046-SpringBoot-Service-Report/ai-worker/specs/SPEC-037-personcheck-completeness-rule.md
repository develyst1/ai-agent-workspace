# SPEC-037: personCheck LIVE ครบ/ไม่ครบ rule + system-populated missing list (Porter's stakeholder rule)

- Source: Porter's "ครบ/ไม่ครบ RULE" (stakeholder). **LIVE path only** — the HISTORY path renders the frozen snapshot
  verbatim (unaffected; a snapshot's ครบ/missing are already stored). Partly reverses TASK-039's all-blank verification block.
- Status: ACTIVE (SA spec). Structure/labels unchanged; only the ครบ box logic + the "ขาดเอกสารดังนี้" content change.

## The rule (live PersonCheckReportBuilder)
1. **`ครบ` ⟺ items ๑,๒,๓ ticked AND item ๔ ticked AND EVERY real person complete** (has BOTH บัตรประชาชน AND
   ทะเบียนบ้าน). Anything else ⇒ **`ไม่ครบ`**.
2. **Item ๕ (หนังสือมอบอำนาจ) is OPTIONAL — excluded entirely** from ครบ/ไม่ครบ (must not influence either box).
3. **Item ๔'s checkbox ticks iff ≥1 real person row exists** (presence, not attachment state).
4. **Pad rows never count** — only real persons participate in ครบ and in item ๔'s tick (Jason already excludes pads from the item-๔ aggregate; same exclusion here).
5. **Zero people ⇒ item ๔ unticked ⇒ ไม่ครบ** (handle explicitly; not "nothing missing").
6. When ๑–๔ is incomplete: tick **ไม่ครบ** and **SYSTEM-POPULATE the "ไม่ครบ ขาดเอกสารดังนี้" numbered rows** with what
   is missing — **naming the person** for a person-level gap: `ขาดสำเนาทะเบียนบ้าน — <คำนำหน้า ชื่อ สกุล>` (NOT just
   "ขาดสำเนาทะเบียนบ้าน"). Rows the system doesn't fill stay blank + ruled for hand-writing (keep min 3).
7. **`แก้ไข` / `เอกสารที่หมดอายุ` / `เอกสารเพิ่มเติม อื่น ๆ` / `หมายเหตุ` remain fully hand-fill blank** (unchanged from TASK-039).

## Do (live builder only)
- Replace the current `completed = all documentItems checked` with the rule above (๑,๒,๓ + item๔ + per-person completeness; ๕ excluded).
- Item ๔ tick = `realPersons non-empty`. Per-person completeness from the same source TASK-038 used (per-person
  บัตร/ทะเบียนบ้าน doc presence).
- Build the `missing` (DocIncomp / "ไม่ครบ ขาดเอกสารดังนี้") list from the incompleteness: item ๑/๒/๓ untick → name the
  document; a person missing a doc → `ขาด<doc> — <person name>`. Pad to min 3 (unfilled rows blank ruled).
- Leave แก้ไข/หมดอายุ/เพิ่มเติม/หมายเหตุ as blank hand-fill (TASK-039).
- HISTORY builder (TASK-040) UNAFFECTED — it renders the snapshot's stored ครบ + …_DTL verbatim; this rule is live-only.

## Acceptance
- Live 38237 (or a mock): ครบ reflects ๑–๔ + all-persons-complete, ๕ ignored; a person missing a doc ⇒ ไม่ครบ with a
  named "ขาด… — person" line; zero people ⇒ item๔ untick + ไม่ครบ. หมดอายุ/แก้ไข/เพิ่มเติม/หมายเหตุ still blank. No literal null.
- History path + a1/a3/a6/a9/a14/a15 unaffected.

## Task
- TASK-041 (Jason, BE), live builder only.
