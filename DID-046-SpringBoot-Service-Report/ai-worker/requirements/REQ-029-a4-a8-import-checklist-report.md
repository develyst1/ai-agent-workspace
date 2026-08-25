# REQ-029: อ.4–อ.8 checklist report (สั่งหรือนำเข้ามาในราชอาณาจักร)

- Status: READY_FOR_SA (released 2026-08-24 — master seeded, mapping complete)
- Priority: MEDIUM (queued behind DEF-12 + REQ-028)
- Requested: originally 2026-08-05 by human ("งานต่อไปจะเป็นพวกนี้… 14-16 ก่อน")
- Official form: `project-docs/A4-A8-form-official.pdf` (surveyed by Porter, 2026-08-20)

## Why this REQ is drafted now
The team is busy on DEF-12 and REQ-028; this is the next queued form. Drafting it early costs the
human nothing and lets SA start the moment the queue clears. **Not released to SA yet** — REQ-028
should land first so อ.4 becomes one `switch` case instead of a fifth probe leg.

## Form structure (surveyed from the official PDF — not assumed)
**Page 1 — 7 items** (note: **7 items, not 8** — this form differs from อ.6/อ.9/อ.14):
1 ชื่อผู้ขออนุญาต · 2 ประเภทการขออนุญาต = **`สั่งหรือนำเข้ามาในราชอาณาจักร`** (fixed constant, printed
on the form) · 3 วัตถุ/อาวุธที่ขออนุญาต ตามผนวกบัญชีรายการที่แนบ · 4 จำนวนที่ขออนุญาต ·
**5 วัตถุประสงค์ที่ขออนุญาต** · **6 ระยะเวลาการอนุญาต** · 7 เอกสารหลักฐาน (ด้านหลัง)

⚠️ **There is NO "หน่วยงานผู้ซื้อ/ผู้รับ" item.** วัตถุประสงค์ moves up to 5 and ระยะเวลา to **6**.
So the standing item-7 rule (REQ-023) lands on **item 6** here. Do not copy the item index blindly
from อ.9/อ.14 — this is exactly the kind of off-by-one that renders plausibly and is wrong.

**Pages 2–3 — 17 evidence items:**
1 จดทะเบียน (ออกให้เมื่อ) · 2 หนังสือมอบอำนาจ (ลงวันที่) · 3 ผู้มีอำนาจลงนาม (1)(2) ·
4 ผู้รับมอบอำนาจ (1)(2) · 5 รับรองการประกอบกิจการโรงงาน **[4 sub-lines: ร.ง.4 / อ.2 ฉบับต่ออายุ /
อ.7 / เปิดสายการผลิต (1)(2)]** · **6 สำเนาหนังสืออนุญาต แบบ อ.8 ฉบับเดิม (1)(2)** · 7 บัตรผู้เสียภาษี ·
8 ภ.พ.20 · 9 แผนที่โรงงาน · **10 สถานที่จัดเก็บวัตถุหรืออาวุธที่สั่งนำเข้าฯ** · 11 แผนผังโรงงาน ·
**12 ภาพตัวอย่างหรือแบบรูปวัตถุ/อาวุธ** · **13 คุณสมบัติ/ลักษณะของวัตถุหรืออาวุธ** ·
**14 หลักฐานว่าหาไม่ได้ในราชอาณาจักร ฯลฯ** (long paragraph label — watch the field height) ·
**15 โครงการวิจัย (กรณีขอเพื่อการวิจัย)** · **16 ใบแสดงรายการสินค้า และใบสั่งซื้อ** ·
17 เอกสารอื่น ๆ (ถ้ามี)

Plus a footnote that must print:
> `หมายเหตุ  เอกสารภาษาต่างประเทศให้แนบฉบับแปล พร้อมรับรองการแปลมาด้วยทุกครั้ง`

**No item-12 "เอกสารของผู้ซื้อ" block at all** — none of the ส.ค.4 / ป.3 / ป.5 / มหาดไทย /
ยุทธภัณฑ์ machinery from อ.9/อ.14 applies. Do not port it.

**Page 4 — annex with EXTRA COLUMNS.** Unlike every previous form, the annex is
`ลำดับ | รหัส | รายการ | จำนวน` **plus three more**: `เลขที่หนังสือ | วันที่ออกเอกสาร | วันที่หมดอายุ`
under the heading **"หนังสืออนุญาต แบบ อ.8 ฉบับเดิม (กรณีเคยมีการสั่งนำเข้าฯ)"**.
`VW_REQUEST_DTL` (REQ-025) does not obviously carry those three — **SA must find their source before
designing the annex.** This is the one genuinely new piece of work in this form.

## Data sources (from the dictionary — verify against the DB, per the DEF-11 guard)
| Purpose | Source |
|---|---|
| Request header | `T_T_REQUEST_IMPORT` |
| Routing | `T_T_REQUEST.REQUEST_TYPE = 4` (**confirmed**, board DISCRIMINATOR FACT) |
| Producer / origin | `T_T_REQUEST_DTL_PRODUCER` |
| Previous อ.8 reference | `T_T_REQUEST_DTL_REF_IMPORT` ← **likely the annex's 3 extra columns** |
| Checklist master | **unknown — CHECK `T_S_REQUEST_CHECKLIST` FIRST.** The known groups list had no import group, but that same list was stale twice (`ReqSaleInt`, `ReqSaleDom` were already seeded). **Verify before requesting a seed.** |
| Annex, item-4 count | `VW_REQUEST_DTL` (REQ-025) |
| ระยะเวลา (item 6) | `T_T_LICENSE.PERIOD_TEXT` (REQ-023) |


## ✅ Checklist master SEEDED — `ReqImport`, and the full form-line → code mapping

The data team created **`GROUP_CODE = 'ReqImport'`** (16 rows; `SEQUENCE` runs 1–17 with **9 absent**).
Mapped line by line against `A4-A8-form-official.pdf`:

| อ.4 form line | CHECKLIST_CODE | IS_ACTIVE |
|---|---|---|
| 1 สำเนาหนังสือรับรองการจดทะเบียน ฯ (ไม่เกิน 6 เดือน) | `ReqImport00101` | 1 |
| 2 หนังสือมอบอำนาจ | `ReqImport00602` | 1 |
| 3 / 4 ผู้มีอำนาจลงนาม / ผู้รับมอบอำนาจ | *(no master row — persons)* | — |
| 5(1) ร.ง.4 (ลำดับ 9) | `ReqImport00803` | 1 |
| 5(2) อ.2 (ฉบับต่ออายุ) | `ReqImport12204` | **0** |
| 5(3) อ.7 | `ReqImport00006` | **0** |
| 5(4) หนังสืออนุญาตให้เปิดสายการผลิต (1)(2) | *(no master row)* | — |
| **6 สำเนาหนังสืออนุญาต แบบ อ.8 ฉบับเดิม (1)(2)** | *(no master row — own table, see below)* | — |
| 7 สำเนาบัตรประจำตัวผู้เสียภาษีของนิติบุคคล | `ReqImport00407` | 1 |
| 8 ใบทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ. 20) | `ReqImport10008` | 1 |
| 9 แผนที่แสดงสถานที่ตั้งโรงงาน ฯ | `ReqImport00010` | 1 |
| 10 สถานที่จัดเก็บวัตถุหรืออาวุธที่สั่งนำเข้ามาฯ | `ReqImport00012` | 1 |
| 11 แผนผังโรงงาน | `ReqImport12111` | 1 |
| 12 ภาพตัวอย่างหรือแบบรูปวัตถุหรืออาวุธ ฯ | `ReqImport00013` | 1 |
| 13 เอกสารหลักฐานแสดงคุณสมบัติหรือลักษณะ ฯ | `ReqImport00014` | 1 |
| 14 เอกสารหรือหลักฐานที่แสดงว่าไม่สามารถหาได้ในราชอาณาจักร ฯ | `ReqImport00015` | 1 |
| 15 โครงการวิจัย (กรณีขอเพื่อการวิจัย) | `ReqImport00016` | **0** |
| 16 ใบแสดงรายการสินค้า และใบสั่งซื้อ | `ReqImport00017` | **0** |
| 17 เอกสารอื่น ๆ (ถ้ามี) | *(no master row)* | — |
| *(master-only, not on the form)* สำเนาสลักหลัง (แบบ อ.2) | `ReqImport12305` | 0 |

**The 17-vs-16 arithmetic, resolved:** form items **3, 4** (persons), **5(4)** เปิดสายการผลิต,
**6** อ.8 ฉบับเดิม and **17** เอกสารอื่น ๆ have no master row; the master carries one extra row
(`12305` สลักหลัง) that the form does not print. It is not a 1:1 list and must not be treated as one.

**Item 6 is the interesting one.** The form's "สำเนาหนังสืออนุญาต แบบ อ.8 ฉบับเดิม (1)(2)" has no
checklist row because it is backed by its **own table** — `T_T_REQUEST_DTL_REF_IMPORT`
(`LICENSE_NO` / `ISSUE_DATE` / `EXPIRY_DATE` / `ATTACH_FILE_ID`). So it renders and ticks like the
ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์ permit rows on อ.9 — the §4 own-table carve-out, not the code path. That is
also the table feeding the annex's three extra columns.

⚠️ **The master's order is NOT the form's order** — master SEQ 10/11/12 = แผนที่ / แผนผัง / สถานที่จัดเก็บ,
while the form prints 9 แผนที่ / 10 สถานที่จัดเก็บ / 11 แผนผัง. This is harmless because we bind by code
and the printed structure is locked to the form — **do not "align" the report to the master's SEQ.**

## Requirement
1. Build the อ.4 checklist report to the official form above — 7 page-1 items, 17 evidence items,
   the หมายเหตุ footnote, the 4-slot signature block, and the extended annex.
2. Reuse the shared logic (persons 3/4, law refs, signatures, annex, item-7-rule, tick rule,
   blank-never-null). Own template folder `request-a4/`.
3. Route via `REQUEST_TYPE = 4` — after REQ-028, one switch case.

## Acceptance Criteria
- [ ] Matches the official PDF: item order, verbatim labels, ระยะเวลา at item **6**, no buyer item.
- [ ] The 17 evidence items render, including the long item-14 label without truncation (DEF-8 lesson).
- [ ] Annex prints the three extra อ.8 columns from a real source.
- [ ] หมายเหตุ footnote prints.
- [ ] อ.6 / อ.9 (both) / อ.14 / อ.15 unaffected.


## ✅ Open questions 1 & 2 — ANSWERED (2026-08-24, verified against the DB)

**1. Checklist master for import — DOES NOT EXIST. A seed is genuinely required.**
Full group list confirmed: `A1 · A3 · BgChk · ReqExpand · ReqMove(22) · ReqMoveDestroyer(19) ·
ReqOpen · ReqPersonChange · ReqPlantChange · ReqSaleDom(21) · ReqSaleInt(15) · ReqSpecial(9)`.
There is **no import/`ReqImport`/`A4` group**. Unlike `ReqSaleInt` and `ReqSaleDom` — where I asked
for a seed that already existed — this one is verified absent before asking. Porter owes the data
team a seed hand-off document covering the form's **17 evidence items**.

Until it is seeded, อ.4 renders with **every box unticked** and that is correct behaviour (same
steady state as อ.14 today). It does **not** block building the report.

**2. The annex's three extra columns — found.**
`T_T_REQUEST_DTL_REF_IMPORT` carries exactly them:

| annex column (form p.4) | source |
|---|---|
| เลขที่หนังสือ | `LICENSE_NO` |
| วันที่ออกเอกสาร | `ISSUE_DATE` |
| วันที่หมดอายุ | `EXPIRY_DATE` |

Plus `ATTACH_FILE_ID`, and crucially **`REQUEST_DTL_ID`** — so the rows hang off an individual item
row, not off the request. **SA must establish whether it is 1:1 or many-per-item** and decide how the
annex renders more than one (the official form shows a single line per item). Do not assume 1:1.

Note the annex joins to the item rows, while the item list itself now comes from `VW_REQUEST_DTL`
(REQ-025) — SA to confirm the view exposes the key needed to join `REQUEST_DTL_ID`, and say so
explicitly rather than discovering it mid-build.

## ⚠️ Live observation — the master is still being edited
`ReqSaleDom` was **22 rows earlier today and is 21 now**. The data team is actively changing the
master while we work. This is exactly why REQ-030 binds by `CHECKLIST_CODE`: a row disappearing now
means that line simply never ticks, instead of silently shifting every tick after it. Nothing to fix —
recording it as evidence the design decision was the right one, and as a reminder that any master
snapshot goes stale fast.

## Open questions for SA (resolve from the dictionary/DB before asking the human)
1. Checklist master group for import — does one already exist?
2. Source of the annex's `เลขที่หนังสือ / วันที่ออกเอกสาร / วันที่หมดอายุ`
   (`T_T_REQUEST_DTL_REF_IMPORT`?), and whether it is 1:1 with the item row or many-per-item.
3. Item-5 วัตถุประสงค์ source on `T_T_REQUEST_IMPORT`.
4. Does อ.4 have variants (the title spans อ.4–อ.8), or is it one form like อ.14?
