# REQ-034 step-1 — อ.4 (ReqImport) special-row list, derived from A4-A8-form-official.pdf

Method as for อ.14: official PDF evidence rows (p2–p3) vs the row-type `A4CheckListReportBuilder` currently assigns.
Shape-comparisons, NOT width measurements — clip claims need a real-render measurement first
([[relayed-numbers-are-claims-not-facts]]). Standing rule now in force: **split every row to its own band, prefer
duplication over a shared band** ([[subevidence-split-rows-not-share]]).

## Key structural fact
**อ.4 has NO buyer / item-12 block** (no `ตาม…`/`บัตรผู้รับมอบ`). So the transport `refrow4`/`refrow5` do not apply here —
confirming SPEC-039's "don't paste". a4 already carries `person / refrow1 / refrow3w / refrownum` from REQ-029/033, so
most shapes are already expressed. The delta is small — mostly verify-on-render, not new bands.

## Official อ.4 rows vs current builder
| # | official row | current a4 row-type | verdict |
|---|---|---|---|
| 1 | สำเนาหนังสือรับรองการจดทะเบียน ฯ · ออกให้เมื่อ [date] | (item) | verify date write-in present |
| 2 | หนังสือมอบอำนาจ · ลงวันที่ [date] | (item) | OK |
| 3 | เอกสารของผู้มีอำนาจลงนาม/มอบอำนาจ — (n) ชื่อ–สกุล · ☐สำเนาทะเบียนบ้าน ☐สำเนาบัตรประชาชน · เลขที่ [id] · วันหมดอายุ [date] | **`person`** (two checkboxes + id + expiry) | OK — a4's `person` already expresses this (unlike a14, which used `person2` and dropped it → a14's SPECIAL row). Regression-verify. |
| 4 | เอกสารของผู้รับมอบอำนาจ — same person shape | `person` | OK |
| 5 | สำเนารับรองการประกอบกิจการโรงงาน: ร.ง.4 (ลำดับ 9) วันหมดอายุ · อ.2 เลขที่/ลงวันที่/วันหมดอายุ · อ.7 เลขที่/ลงวันที่/วันหมดอายุ · เปิดสายการผลิต (1)(2) ที่/ลง | refrow1 · refrow3w · refrow3w · refrownum | 🟠 **CANDIDATES:** (a) **ร.ง.4 label** — official = `…(แบบ ร.ง.4) (ลำดับ 9)`, builder omits `(ลำดับ 9)` → verbatim-label gap (DEF-19/DEF-20 family). (b) **อ.2/อ.7 long labels** on refrow3w — verify the label + 3 segments don't clip on a real render; if they strain, split per the standing rule. |
| 6 | อ.8 ฉบับเดิม (1)(2) ที่/ลง | refrownum | OK |
| 7–16 | simple items | (item) | OK |
| 17 | เอกสารอื่น ๆ (ถ้ามี) | (item) | OK |

## อ.4 special rows / actions for Jason (per standing split-row rule)
1. **ร.ง.4 label verbatim** — add `(ลำดับ 9)` (builder line ~155); official has it. Confirm on real render.
2. **อ.2 / อ.7 long-label rows (refrow3w)** — verify no clip on a real /download; if the label or the เลขที่/ลงวันที่/วันหมดอายุ
   run strains the shared refrow3w, give each its own band (do NOT bend refrow3w for both).
3. **item-3/4 person rows** — already correct in a4 (`person`); regression-verify only.
Everything here is verify-first; no unmeasured "needs N px". a9-transport stays frozen.

## Remaining: อ.9-destroy (A9-form-DESTROY-official.pdf) — last REQ-034 step-1 form, next.
