# SPEC-022: อ.9 TRANSPORT variant (REQ-019 step 2) — one shared report, variant by MOVE_REQUEST_TYPE

- Source: REQ-019 step 2 (human approved; Porter's form diff). Destroy is done (REQ-020); transport is
  the sibling variant with **real complete test data** (38336 / 33630 / 38321 / 38234).
- Status: ACTIVE (all 3 asks resolved by Porter; foundation = TASK-015 ready; item-12 = TASK-016 blocked on DATA REQUEST #2)
- Human instruction (via Porter): *content matches the official TRANSPORT PDF, but REUSE the destroy
  form's layout mechanics (margins/gaps/band geometry, locked-structure). Don't re-invent the layout.*

## Variant split (Porter's REQ-019 definition)
`T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE`: **2 = destroy** (existing), **else = transport** (new). One report
code `"A9"`, one resolver, one set of templates. The builder branches on the type.

## Architecture finding (investigated) — the variants differ in only 3 places, and only ONE is static
Porter's form diff (page-1 heading, item 5, item 12) maps onto the code as:
| Difference | Where it lives now | Data-driven? |
|---|---|---|
| **page-1 heading** | `request-a9-main.jrxml:35` = `$F{documentTitle}` | ✅ data-driven (builder feeds the string) |
| **item-5 value** | `:80` = `$F{destroyLocation}` | ✅ data-driven |
| **item-5 label** | `:77` = **static** `<text>5. สถานที่ทำการกำจัดหรือทำลาย</text>` | ❌ **hardcoded** — the ONE static diff |
| **item-12 title + sub-items** | built in `buildEvidences` (EvidenceItem/EvidenceSub lists) | ✅ data-driven |
| page-2 heading `:142`, annex `:178` | already "…ขายและขนย้าย…" | identical on both — **no change** (re-confirms DEF-6 cancel) |

⇒ **Recommended approach:** convert the item-5 label to a data-driven field (`$F{item5Label}`) so the
**one** shared template serves both variants; the builder supplies heading + item5 label/value + item-12
content per variant. This is the minimal template change and honours "reuse the destroy geometry."
(Rejected: a separate transport main.jrxml — duplicates layout, fights the human's instruction.)

## The three content differences — sources
1. **page-1 heading (transport):** "…ขออนุญาต**ขายและขนย้าย**อาวุธ" (destroy = "…**ขนย้าย**อาวุธ").
   The builder picks the `documentTitle` string by variant (both keep report code "A9"; no new
   ReportDefinition/resolver entry needed — variant is a builder concern, not a report-code concern).
2. **item 5 (transport):** label = "5. หน่วยงานผู้ซื้อ/ผู้รับอาวุธ" (via the new `$F{item5Label}`);
   value = **`T_T_REQUEST_MOVE.AUTHORITY_NAME`** (not yet mapped in `RequestMoveEntity` — add the
   `@Column(name="AUTHORITY_NAME")` field). Destroy keeps label "สถานที่ทำการกำจัดหรือทำลาย" + value
   `DEST_PLACE_NAME`, unchanged.
   > **Confirm on a real transport sample (38336):** 18847 has AUTHORITY_NAME == DEST_PLACE_NAME so it
   > can't disambiguate. "หน่วยงานผู้ซื้อ/ผู้รับอาวุธ" (buyer/receiver *organisation*) reads as
   > AUTHORITY_NAME; DEST_PLACE_NAME is a *place*. QA prints 38336 and confirms which column carries the
   > buyer org before we lock it.
3. **item 12 (transport) = "เอกสารของผู้ซื้อ":** different sub-item set from destroy's 9. Known reusable
   piece: **(x) ตัวอย่างลายมือชื่อผู้รับอาวุธ → person2 = `T_T_REQUEST_EXAMPLE_SIGN`** (same as destroy
   12(2), already built by `buildPerson2`). **UNKNOWN / blocked:** the exact transport sub-item labels
   and the **"(n) ที่ x/xxxx" document-number lines** — their text is on the official transport PDF (not
   in my reach: `project-docs/` is gitignored/empty in this checkout) and their DB source is unconfirmed.
   See Open items — this is the one blocker before a task can be written for item 12.

## Ticks master (per variant)
- **transport → `ReqMove`** (15 SEQ rows, already seeded by the data team).
- destroy → `ReqMoveDestroyer` (19 rows) — unchanged.
The builder selects the checklist GROUP_CODE by variant so ticks bind to the right master.

## Locked rules (carry from destroy)
Form structure LOCKED in the report (labels hardcoded/locked, ticks from DB); missing data → **blank,
never "null"** (blankWhenNull already swept for a9 in TASK-013/014); signature block always 4 slots
(TASK-014). Reuse destroy band geometry per the human's instruction.

## Verify
Transport has **real complete requests** (unlike destroy) → end-to-end on real DB (QA):
- `/a9/db/38336` (+ 33630 / 38321 / 38234): page-1 heading = "ขายและขนย้าย"; item 5 = buyer org label +
  value; item 12 = "เอกสารของผู้ซื้อ" structure; ticks bind to `ReqMove`; destroy samples (18847 type-0
  is transport-ish; a real type-2) unaffected. BE proves structure in the A9PreviewTest loop first.

## Open items — RESOLVED by Porter (2026-08-18)
1. ✅ **Official TRANSPORT item-12 text** — Porter pasted the full "เอกสารของผู้ซื้อ" block (in the log):
   หนังสือมอบอำนาจ (ลงวันที่); สำเนาบัตร นายกสมาคม/ผู้มอบอำนาจ + ผู้รับมอบอำนาจ (เลขที่/วันหมดอายุ);
   ตัวอย่างลายมือชื่อผู้รับอาวุธ (person2/EXAMPLE_SIGN); **ตามหนังสือขอซื้อ (ที่/ลงวันที่)**; **ตามหนังสือ
   คณะกรรมการ พ.ศ.2553 (ที่/ลงวันที่)**; แผนการใช้กระสุนปืน; ภาพถ่ายสนามยิงปืน/ช่องยิง; **ป.3 / ป.5 /
   มท. ย้ายวัตถุระเบิด / ยุทธภัณฑ์ พ.ศ.2530** (each "(1)/(2) ที่ ___ ลง ___"); then **13. เอกสารอื่น ๆ**.
   > **Master cross-check (seeded `ReqMove`, 15 rows):** only **ส.ค.4 (SEQ13), แผนการใช้กระสุน (SEQ14),
   > ภาพถ่ายสนามยิงปืน (SEQ15)** have master rows. ป.3/ป.5/มท./ยุทธภัณฑ์/หนังสือขอซื้อ/หนังสือคณะกรรมการ
   > have **no master row** → under locked-structure they still print, no tick source, and their
   > "ที่ ___ ลง ___" values need a data source (= item #2, the DATA REQUEST).
2. ✅ **RESOLVED from the data dictionary (no human ask needed).** Each item-12 permit doc has its own
   table with the pattern `LICENSE_NO`(="ที่") + `ISSUE_DATE`(="ลงวันที่") + `ATTACH_FILE_ID`(tick) + `STATUS`:
   ป.3→`T_T_REQUEST_LICENSE_P3` · ป.5→`T_T_REQUEST_LICENSE_P5` (+`LICENSE_TYPE` 1=ซื้อ/2=ค้า) ·
   ยุทธภัณฑ์→`T_T_REQUEST_ARMS_CTRL_LICENSE` · มท.→`T_T_REQUEST_MOI_MOVE_PERMIT`. The ขอซื้อ + คณะกรรมการ
   + มอบอำนาจ block all sit on **`T_T_REQUEST_BUYER`** (`BUYER_DOC_NO/DATE/TYPE/ATTACH`,
   `GOV_COMMITTEE_NO/ISSUE_DATE/ATT_FILE_ID`, `ATTORNEY_BOOK_ISSUE_DATE`, `ASSOC_PRES_ID_CARD_*`,
   `ATTORNEY_ID_CARD_*`). ส.ค.4/แผนกระสุน/ภาพถ่ายสนามยิง stay in `T_T_REQUEST_DOC` TYPE-22 → ReqMove
   SEQ13/14/15. Full mapping in TASK-016 → **TASK-016 UNBLOCKED**.
3. ✅ **item-5 source — PM decision (semantic, not data-proven → ASSUMPTION):** on 38336/33630/38321
   `AUTHORITY_NAME == DEST_PLACE_NAME` (can't discriminate). Porter's call: **transport item 5
   "หน่วยงานผู้ซื้อ/ผู้รับอาวุธ" → `AUTHORITY_NAME`** (buyer ORG, tied to `BUYER_AUTHORITY_ID`); **destroy
   → `DEST_PLACE_NAME`** (a place). Rationale: identical today, stays correct if they ever diverge.
   Human may overrule.

## Exact strings (for the foundation task)
- **Destroy heading** (`ReportDefinition.A9`) = `หลักฐานที่ใช้ประกอบคำขอรับหนังสืออนุญาตขนย้ายอาวุธ`.
- **Transport heading** = `หลักฐานที่ใช้ประกอบคำขอรับหนังสืออนุญาตขายและขนย้ายอาวุธ` (insert "ขายและ").
- **Variant flag:** `destroy = (moveRequestType != null && moveRequestType == 2)`; null/other → transport.
- **Checklist master:** destroy `ReqMoveDestroyer` / transport `ReqMove` (`A9…Builder.java:34,133`).

## Tasks
- **TASK-015 (foundation — ready NOW):** `AUTHORITY_NAME` mapping on `RequestMoveEntity`; variant branch;
  data-driven `item5Label` (jrxml `:77` static → `$F{item5Label}`) + heading + item-5 value + `ReqMove`
  master, all per variant. Transport item-12 body stays **blank** (locked "12." header, no sub-items) in
  this task — NOT destroy's content. Destroy output must stay byte-identical.
- **TASK-016 (item-12 transport content — BLOCKED on DATA REQUEST #2):** hardcode the transport item-12
  sub-item labels (locked structure), reuse person2/EXAMPLE_SIGN, bind ticks to `ReqMove` SEQ13-15, wire
  the "ที่ ___ ลง ___" values once the source lands (blank meanwhile).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
