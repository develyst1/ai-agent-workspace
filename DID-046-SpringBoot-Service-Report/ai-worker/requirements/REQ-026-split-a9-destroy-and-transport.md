# REQ-026: Split อ.9 destroy and อ.9 transport into two separate reports

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-08-20 by human (dev@smartalliance.co.th)
- Deadline: none

## Requirement
> *"a9 destroy กับ a9 move มันใช้ใบเดียวกันใช่มั้ย อยากให้แยกกัน เพราะในอนาคต เผื่อมีการแก้ไข
> มันแก้ยากกว่าหากรวมกันไว้"*

Today the two อ.9 variants share one report, selected at runtime by `MOVE_REQUEST_TYPE`
(2 = destroy, else = transport) — the REQ-019 design. The stakeholder wants them **separated**, so a
change to one variant cannot affect the other.

They are two different official forms (`A9-form-DESTROY-official.pdf` /
`A9-form-TRANSPORT-official.pdf`) with different headings, different item-5 labels and a different
item-12 set. Treating them as one form with branches has already cost us: several defects were fixed
on one variant while the other had to be re-checked separately.

## Requirement detail
1. **Two independent reports** — destroy and transport each get their own report definition,
   template and builder, in the same shape as the a14 report (which is already a clean
   single-variant report and is the pattern to copy).
2. **Routing keeps its current behaviour** — `resolveFromMove` still decides from the
   `T_T_REQUEST_MOVE` row; it now resolves to one of the two reports by `MOVE_REQUEST_TYPE`
   (2 = destroy, else = transport) instead of passing a variant flag downstream.
3. **Preview seams stay usable** — QA must still be able to render each variant by plain requestId.
4. **No output change.** This is a restructure, not a redesign: both rendered PDFs must be
   byte-for-byte equivalent in content to what they produce today.

## ⚠️ What must NOT be duplicated
The point is to separate what **differs by form**, not to fork everything. Splitting the genuinely
shared logic would double our maintenance instead of reducing it — and we already have direct
evidence of that cost: the item-7 rule (REQ-023) had to be fixed separately per report precisely
because each one re-derived it.

**Keep shared** (one implementation, called by both): persons items 3/4, law references, the
signature block, the annex/รายการ (now `VW_REQUEST_DTL`, REQ-025), item 7 `PERIOD_TEXT` (REQ-023),
the attachment-tick rule (REQ-009), `blankWhenNull` handling, and the shared item-12 permit blocks
(ป.3 / ป.5 / มหาดไทย / ยุทธภัณฑ์).

**Split** (form-specific): headings, item-2 permit-type text, item-5 label and source, the item-12
sub-item set and order, the checklist master GROUP_CODE (`ReqMoveDestroyer` vs `ReqMove`), and the
templates themselves.

SA should say explicitly in the SPEC where the shared/split line falls, so the split does not quietly
become a fork.

## Acceptance Criteria
- [ ] Destroy and transport are separate reports — a change to one cannot alter the other.
- [ ] Both render exactly as they do today (content unchanged); real-DB samples confirm it.
- [ ] `/download` routes both correctly; อ.6 and อ.14 routing unaffected.
- [ ] Shared logic is still shared — no duplicated copy of persons / law refs / signatures / annex /
      item-7 / tick rule.
- [ ] Preview-by-requestId still works for each variant.

## Constraints
- อ.9 transport is **delivered and verified on real data** — regression risk is the main hazard here.
  Verify on the real DB seam, not the mock preview.
- `.jasper` regenerated into `src/main/resources` + `clean compile` + restart.
- Oracle 11.2-safe.
- Entity columns confirmed against the data dictionary before review (the DEF-11 guard).

## Honest note for the record
This buys future maintainability, not present functionality — and it carries regression risk on work
that is currently correct. The stakeholder has weighed that and asked for the split; recording the
tradeoff, not disputing it.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
