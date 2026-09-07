# REQ-034 step-1 — อ.9-destroy (ReqMoveDestroyer) special-row list, from A9-form-DESTROY-official.pdf

Method as for อ.14/อ.4: official PDF (p2–p3) vs `A9DestroyReportBuilder` row-types. Shape-comparison, not width
measurement. Standing rule in force: each row = own band, prefer duplication ([[subevidence-split-rows-not-share]]).
destroy has its OWN `buildItem12` (not the transport one) and 11 evidenceSub row types (no refrow4/refrow5 — correct, it
has no buyer block).

## Official rows vs current builder
| # | official row | current row-type | verdict |
|---|---|---|---|
| 1 | สำเนาหนังสือรับรองการจดทะเบียน · ออกให้เมื่อ [date] | (item) | verify date write-in |
| 2 | หนังสือมอบอำนาจ · ลงวันที่ [date] | (item) | OK |
| 3 | ผู้มีอำนาจลงนาม — (n) ชื่อ–สกุล · ☐สำเนาทะเบียนบ้าน ☐สำเนาบัตรประจำตัวประชาชน · เลขที่ [id] · วันหมดอายุ [date] | `person` | regression-verify (person expresses two checkboxes + id + expiry) |
| 4 | ผู้รับมอบอำนาจ — same person shape | `person` | OK (note: official prints `(3)` then `(1)` — a data/numbering quirk, not layout) |
| 5 | ร.ง.4 (ลำดับ 9) วันหมดอายุ · อ.2 เลขที่/ลงวันที่/วันหมดอายุ · อ.7 (same) · เปิดดำเนินการผลิต (1)(2) ที่/ลง | refrow1 · refrow3w · refrow3w · refrownum | 🟠 same candidates as อ.4: ร.ง.4 `(ลำดับ 9)` label verbatim; อ.2/อ.7 long-label clip-check → split if they strain |
| 6–11 | simple items | (item) | OK |
| 12 | เอกสารประกอบการขนย้ายเศษวัตถุ… — (1) วันกำจัด [date] · **(2) ตัวอย่างลายมือชื่อผู้รับอาวุธ → per person: (n) name สำเนาบัตรประจำตัวประชาชน เลขที่ [id] วันหมดอายุ [date]** · (3)–(9) numbered text items | (1)=refrow3 · (2)=employer + **`person2`** · (3)–(9)=employer | 🔴 **SPECIAL (same as a14 item-6):** (2)'s people use `person2` (name only) — official carries `สำเนาบัตรประจำตัวประชาชน + เลขที่ + วันหมดอายุ` inline (wraps to 2 lines). Currently DROPPED. Needs the person-with-idcard band. |
|  | สำเนาบัตรประจำข้าราชการทหาร/ตำรวจ *กรณีตามาตรา 7 (conditional) | not in buildItem12 | 🟠 CANDIDATE — verify whether this conditional row renders at all; if it's a real checklist row, it needs one. |

## destroy special rows for Jason
1. 🔴 **item 12(2) person-with-idcard band** — the SAME shape as a14 item-6 (name + สำเนาบัตรประชาชน + เลขที่ + วันหมดอายุ,
   wraps 2 lines). Give it its own row type + band in destroy's evidenceSub. Confirm the id/expiry source in
   `buildPerson2` before building (currently emits name only).
2. 🟠 **ข้าราชการทหาร/ตำรวจ (มาตรา 7) conditional row** — confirm it exists as a checklist row / should render; if so, own band.
3. 🟠 **item 5 ร.ง.4 `(ลำดับ 9)` label + อ.2/อ.7 long-label** — same as อ.4 (verbatim label + clip-check, split if strain).
4. items 3/4 `person` rows — regression-verify only.

## ✅ REQ-034 step-1 COMPLETE (all 3 forms): อ.14, อ.4, อ.9-destroy
**Cross-form theme — the recurring special row = person-with-idcard** (name + สำเนาบัตรประชาชน + เลขที่ + วันหมดอายุ inline),
needed in **อ.14 item-6 AND อ.9-destroy item-12(2)**, both currently `person2` (name only) → id/expiry dropped. Same SHAPE,
but per the split rule each form gets its OWN band (per-form evidenceSub) — don't share across forms.
Next: consolidate into TASK-050 for Jason (per-form dedicated bands, verify-first on real /download, a9-transport frozen).

---
## ⚠️ CORRECTION 2026-09-03 (Sober) — item 12(2) person-with-idcard "drop" was WRONG (same as a14)
`person2` renders `เลขที่`+`วันหมดอายุ`; buildPerson2 passes id+expiry. Nothing dropped (Jason verified + measured).
Only delta = `วันหมดอายุ` wraps to line 2; inline can't fit at this width. **NOT a band** — cosmetic stakeholder call.
Also: **ร.ง.4 `(ลำดับ 9)` was a4-only** (a14 + a9-base already had it; destroy inherits) — my "a4 and destroy" was wrong.
Item 1 above (person band) retracted; item 3 (ร.ง.4) does not apply to destroy.
