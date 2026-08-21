# REQ-030: Bind evidence ticks by `CHECKLIST_CODE` — อ.9 transport + อ.15 (master was rebuilt)

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-21 by human (dev@smartalliance.co.th)
- Supersedes: DEF-13 (previously cancelled — the human has now made the master change and asked us to
  adapt: *"มีการแก้ไขมา ทั้ง อ.9 ขนย้ายธรรมดา และ อ.15 ให้ดูให้ตรงตัวอย่างเหมือนเดิม"*)

## What changed
The data team rebuilt `T_S_REQUEST_CHECKLIST`. Both `ReqMove` and `ReqSaleDom` are now **22 rows**
(previously `ReqMove` had 15), and the item-12 buyer documents each got their **own row** instead of
being lumped together.

`ReqMove` still exists (IDs 117–138) — the earlier partial paste was a false alarm.

**Our positional binding is now badly wrong.** The code does `mid.apply(13)` → "แผนการใช้กระสุนปืน"
and `mid.apply(14)` → "ภาพถ่ายสนามยิงปืน", but in the new master those SEQ positions are
"เอกสารขอซื้อ" and "หนังสือคณะกรรมการ". Combined with the `IS_ACTIVE` filtering that already shifted
everything from index 3 on, the ticks are meaningless.

## Requirement
1. **Bind every evidence tick by `CHECKLIST_CODE`**, never by SEQUENCE, list position, or `ID`.
   - `SEQUENCE` is the data team's presentation order and they renumber it.
   - `ID` is **not** stable either — the rebuild reassigned IDs (`ReqSaleInt` used to hold 145–159;
     `ReqSaleDom` holds that range now).
   - `CHECKLIST_CODE` is assigned at creation and survives both — confirmed by the human.
2. **The printed structure does not change.** Order and labels stay locked to the official form, per
   the standing rule (*"เราจะ lock ไปบน report เลย"*). The master's SEQUENCE is **their** ordering,
   not ours — do not reorder item-12 to match it.
3. A row that is `IS_ACTIVE = 0` simply never ticks; its form line still prints.
4. A form line with **no** master row still prints, unticked (e.g. ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์ tick from
   their own tables, not from the master).

## The mapping — form line → `CHECKLIST_CODE` suffix
Identical suffixes in both groups: prefix `ReqMove…` for อ.9 transport, `ReqSaleDom…` for อ.15.

| Form line | Suffix | ReqMove | ReqSaleDom |
|---|---|---|---|
| 1 จดทะเบียน ฯ กรมพัฒนาธุรกิจการค้า | `00101` | active | active |
| 2 หนังสือมอบอำนาจ (ของผู้ขออนุญาต) | `00602` | active | active |
| 5(1) ร.ง.4 | `00803` | active | active |
| 5(2) อ.2 | `12204` | **inactive** | **inactive** |
| 5 สลักหลัง อ.2 | `12305` | **inactive** | **inactive** |
| 5(3) อ.7 | `00006` | **inactive** | **row does not exist** |
| 6 บัตรผู้เสียภาษี | `00407` | active | active |
| 7 ภ.พ.20 | `10008` | active | active |
| 8 คุณลักษณะและคุณสมบัติของอาวุธ | `00009` | active | active |
| 9 แผนที่โรงงาน | `00010` | active | active |
| 10 แผนผังโรงงาน | `12111` | active | active |
| 11 แผนการขนย้าย พ.ศ.2556 | `00012` | active | active |
| **12** ส.ค.4 | `00013` | active | active |
| 12 ประกาศนายทะเบียนสมาคม ฯ | `00017` | **inactive** | active |
| 12 บัตรประชาชนนายกสมาคม | `00016` | **inactive** | active |
| 12 หนังสือมอบอำนาจ (ของผู้ซื้อ) | `00019` | active | active |
| 12 บัตรประชาชนนายกสมาคม/ผู้มอบอำนาจ | `00018` | active | active |
| 12 บัตรประชาชนผู้รับมอบอำนาจ | `00020` | active | active |
| 12 ตามหนังสือขอซื้อ | `00014` | active | active |
| 12 หนังสือคณะกรรมการ ฯ พ.ศ.2553 | `00015` | active | active |
| 12 แผนการใช้กระสุนปืน ฯ | `00021` | active | active |
| 12 ภาพถ่ายสนามยิงปืนและช่องยิงปืน ฯ | `00022` | active | active |

Note the only real difference between the two groups: **อ.9 transport has `00016`/`00017` inactive
and อ.15 has them active**, and อ.9 has an extra inactive `00006` (อ.7). Handle that by data, not by
per-form code — the same mapping serves both.

## Also fix here (DEF-14, same code path)
1. **ชื่อนายกสมาคม currently prints blank.** The builder comment claims no column exists; it does —
   `ASSOC_PRES_NAME_PREFIX` / `_NAME` / `_MIDDLE_NAME` / `_SURNAME` on `T_T_REQUEST_BUYER`.
2. **Two form lines are bound to the same columns** —
   `A9CheckListReportBuilderBase.java:271` and `:278` both read `ASSOC_PRES_ID_CARD_NO` /
   `_EXPIRY_DATE`, so they print identical values. The rebuilt master proves they are different
   lines (`00016` = กรณีผู้ซื้อเป็นสมาคม vs `00018` = กรณีมอบอำนาจ). SA to determine the correct
   second source; if the table genuinely has only one card set, say so and leave a documented
   duplicate rather than inventing one.

## Acceptance Criteria
- [ ] Every tick lands on the form line it belongs to, verified against a real request.
- [ ] Renumbering `SEQUENCE` or toggling `IS_ACTIVE` afterwards does not move any tick.
- [ ] Printed order/labels unchanged — identical to the official form and to today's output.
- [ ] อ.9 transport and อ.15 both correct from the one shared implementation.
- [ ] ชื่อนายกสมาคม populates when the data exists.
- [ ] อ.6 / อ.9 destroy / อ.14 unaffected (or corrected the same way if they share the pattern —
      SA to state which).

## Constraints
- Oracle 11.2-safe; `.jasper` unchanged (this is a data-binding fix, not a template change).
- Verify on the real DB seam.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
