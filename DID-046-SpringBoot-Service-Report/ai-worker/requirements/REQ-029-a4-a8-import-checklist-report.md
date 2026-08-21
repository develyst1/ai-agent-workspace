# REQ-029: อ.4–อ.8 checklist report (สั่งหรือนำเข้ามาในราชอาณาจักร)

- Status: DRAFT (Porter — not yet released to SA)
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

## Open questions for SA (resolve from the dictionary/DB before asking the human)
1. Checklist master group for import — does one already exist?
2. Source of the annex's `เลขที่หนังสือ / วันที่ออกเอกสาร / วันที่หมดอายุ`
   (`T_T_REQUEST_DTL_REF_IMPORT`?), and whether it is 1:1 with the item row or many-per-item.
3. Item-5 วัตถุประสงค์ source on `T_T_REQUEST_IMPORT`.
4. Does อ.4 have variants (the title spans อ.4–อ.8), or is it one form like อ.14?
