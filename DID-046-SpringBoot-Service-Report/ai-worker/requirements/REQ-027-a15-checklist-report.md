# REQ-027: อ.15 checklist report — clone the อ.9 transport report

- Status: READY_FOR_SA (blocked on the official form PDF)
- Priority: HIGH
- Requested: 2026-08-20 by human (dev@smartalliance.co.th)
- Deadline: none

## Requirement
> *"ขอ a15 ด้วยนะ คือลอก transport มาเลย มันคือเหมือนๆ กันนั่นแหละ ต่างกันแค่ source data มั้ง นิดเดียว"*

Build the อ.15 checklist report by **cloning the อ.9 transport report** (the human chose this base
explicitly over อ.14 when asked). Expected to differ mainly in its data source, not its structure.

**Sequencing:** this lands **after** REQ-026's template split. Cloning อ.9 transport before it has its
own `request-a9-transport/` folder would mean cloning a shared folder and then having to redo it.

## Data source (SA to confirm against the dictionary before asking the human)
- Header table: **`T_T_REQUEST_SALE_DOM`** — the dictionary's อ.15 table ("ขายในประเทศ").
- Checklist master: **`ReqSaleDom` already exists and is seeded — 13 rows.** Confirmed from the human's
  `T_S_REQUEST_CHECKLIST` group query. **Do not request a seed** (the DEF/seed lesson: verify first).
- Annex/รายการ: `VW_REQUEST_DTL` like every other report (REQ-025).

⚠️ **Assumption to verify, flagged not buried:** the dictionary marks `T_T_REQUEST_SALE_DOM` as
"ระบบ PAMF ไม่ได้ใช้แล้ว", which is why อ.15 was previously out of scope. The seeded `ReqSaleDom`
master argues it *is* live. SA: confirm the table has real rows and carries its own `FORM_ID`
(the per-family pattern — board ARCHITECTURE FACT) before designing the resolver leg. If the table is
genuinely empty, tell Porter — that changes this from "clone a report" to "build by construction".

## Requirement detail
1. Clone the อ.9 **transport** report — same geometry, margins and gap conventions.
2. Route via a per-family leg (`resolveFromSaleDom`), the same shape as `resolveFromSaleInt` /
   `resolveFromMove`. Do not touch the existing legs.
3. Its own template folder `request-a15/` (main + subreport), matching the house convention that
   every form owns its template set.
4. All standing rules inherited: item-7 = `T_T_LICENSE.PERIOD_TEXT` (REQ-023), annex from
   `VW_REQUEST_DTL` (REQ-025), tick rule (REQ-009), blank-never-null, signature block always prints,
   locked structure, Oracle 11.2-safe, entity columns dictionary-confirmed before review (DEF-11).
5. Preview seam `/preview/checklist/a15/db/{requestId}` consistent with the others.

## BLOCKED ON
**The official อ.15 form PDF.** Every report so far was built to form-truth against the official
document, and both times we guessed at wording instead we were wrong (DEF-6, the "ขอ/ของ" question).
Porter is requesting it from the human. Structure work can be surveyed meanwhile, but the evidence
items and headings must not be invented.

## Acceptance Criteria
- [ ] Rendered output matches the official อ.15 form (headings, item order, verbatim labels).
- [ ] Page-1 + annex populate from real อ.15 data; routing works via `/download`.
- [ ] อ.6 / อ.9 (both) / อ.14 unaffected — no regression.
- [ ] No "null"; signature block always prints its four slots.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
