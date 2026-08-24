# SPEC-032: Evidence ticks by the stakeholder TICK RULE (REQ-030) + DEF-14 buyer name

- Source: REQ-030 + the stakeholder's canonical **TICK RULE** (log 2026-08-21, Porter's "READ THIS FIRST"
  consolidated entry). **This supersedes the earlier draft of this SPEC and Porter's gate #1/#2 answers.**
- Status: ACTIVE (re-spec'd). Data-binding only — `.jasper` unchanged, printed order/labels LOCKED to the form.

## THE TICK RULE (canonical — implement exactly this; ignore all prior tick analysis)
Each printed line owns its **hardcoded `CHECKLIST_CODE`** (origin = the official form PDF), stored in the
builder next to the line text. To decide the tick for a line:
```
line's CHECKLIST_CODE
  → T_S_REQUEST_CHECKLIST WHERE CHECKLIST_CODE = <code>            → its ID
  → T_T_REQUEST_DOC WHERE REQUEST_ID = <req> AND REQUEST_CHECKLIST_ID = <ID>
  → tick ⟺ such a row exists
         AND ATTACH_FILE_ID IS NOT NULL AND ATTACH_FILE_ID <> 0
         AND (STATUS IS NULL OR STATUS <> 'D')      -- NULL-safe, REQ-015 lesson
```
Anything else ⇒ no tick. **Direction: start from the form line's code, ask if a matching doc exists — never
walk the request's docs.** `T_T_REQUEST_DOC` has **no** code column → reach the code via `REQUEST_CHECKLIST_ID
→ T_S_REQUEST_CHECKLIST.CHECKLIST_CODE` (human-confirmed).

## DEAD — do not implement (Porter withdrew these)
1. **`IS_ACTIVE` plays no part.** DELETE the `findByGroupCodeAndIsActive...` filter; stop reasoning about it.
   (The REQ-030 active/inactive table stays only as a record.)
2. **No positional index / SEQUENCE / ID / sorted-master walk.** `ID` is not stable (rebuild reassigns it);
   `SEQUENCE` is the data team's order. Only `CHECKLIST_CODE` is stable.
3. **No OR with BUYER `*_ATT_FILE_ID` for the tick** (gate #1 withdrawn). The tick has ONE source: the
   `REQUEST_CHECKLIST_ID` join. (Those BUYER columns may still supply line **values** — card no/dates — never the tick.)

## Implementation (rewrite the binding to the rule; don't adapt the old `mid`/scaffolding)
- Each builder hardcodes its lines' full `CHECKLIST_CODE`s. Resolve **code → ID once per report** — a single
  `IN` query (`findByChecklistCodeIn(codes)`) → `Map<code,ID>` — then per line: tick = a matching active-doc
  exists (build the checked-doc set from `T_T_REQUEST_DOC` by `REQUEST_CHECKLIST_ID`, ATTACH>0, STATUS≠D).
- A line whose code has **no** master row → **unticked, not an error** (data gap; how อ.4-8/any unseeded form behaves).
- Oracle-11.2-safe (no FETCH FIRST). `RequestCheckListEntity.CHECKLIST_CODE` already mapped (Part A).

## Scope — ALL five forms (one rule, group-scoped codes)
`CHECKLIST_CODE` carries its group prefix, and **codes are group-scoped** (Porter: อ.6 บัตรผู้เสียภาษี =
`ReqSpecial00404` but อ.9 = `ReqMove00407` — **suffixes differ per group; do NOT assume a suffix means the
same line across groups**). Each builder uses its own group's codes:
- **อ.9 transport (`ReqMove`) + อ.15 (`ReqSaleDom`):** REQ-030's table (identical suffixes; only 00016/00017
  active-vs-inactive + อ.9's extra 00006 differ — but IS_ACTIVE is irrelevant to the rule, so **the same
  hardcoded code list serves both**). Shared a9-base path (Part A direction).
- **อ.9 destroy (`ReqMoveDestroyer`):** codes `00101/00602/00803/12204/12305/00006/00407/10008/00009/00010/
  12111/00012` (items 1-11) + `00013…00019` (SEQ13-19 = destroy item-12: สถานที่กำจัด/เจ้าหน้าที่ควบคุม/
  รูปถ่ายเศษวัตถุ/ขั้นตอนกำจัด/อ.10/กฎหมายอื่น/ผู้เชี่ยวชาญ). Same base path, group prefix `ReqMoveDestroyer`.
- **อ.14 (`ReqSaleInt`):** separate builder. Only the item-12 tick codes are known (ReqSaleInt SEQ12-15 from
  TASK-019). ⚠️ **GAP: need the full ReqSaleInt per-line code list** (items 1-11 + item-12) — request from Porter/human.
- **อ.6 (`ReqSpecial`):** separate builder, **currently correct by luck** (9 rows, all active, contiguous) but
  in scope per the rule. ⚠️ **GAP: need the full ReqSpecial per-line code list** (only `00404` known). Request.
  **a6/38272 output is the regression canary — must be unchanged.**

## DEF-14 (folded in, same code path) — reduced by the rule
- **ชื่อนายกสมาคม** was hardcoded blank on a wrong "no column" comment → fill from
  `BUYER.ASSOC_PRES_NAME_PREFIX/_NAME/_MIDDLE_NAME/_SURNAME` (join like other person names; blank when all null).
  This is a VALUE fix, unaffected by the tick change.
- The **4 buyer-doc ticks** hardcoded `false` now tick **via the TICK RULE** (their own CHECKLIST_CODEs:
  ประกาศ 00017 / บัตรนายก 00016 / มอบอำนาจ 00019 / บัตรผู้รับมอบ 00020, + the ส.ค.4-assoc line) — **not** from
  the BUYER `*_ATT_FILE_ID` (gate #1 withdrawn).
- **00016 vs 00018:** the rebuilt master makes them distinct rows (กรณีสมาคม vs กรณีมอบอำนาจ) → each ticks by
  its own code. Their **value** (card no/expiry) still comes from the one `ASSOC_PRES_ID_CARD_*` set the table
  has — a data-driven value duplication, acceptable (the human made them separate lines; the table has one card set).

## Acceptance
- Printed structure/order/labels unchanged on every form; ticks land on the code-matched line.
- Re-running after any SEQUENCE renumber / IS_ACTIVE toggle changes nothing.
- **a6/38272 output unchanged** (regression canary). ชื่อนายกสมาคม populates when data exists.

## Tasks
- TASK-029 (respec'd): the TICK RULE across the a9-base family (transport/a15/destroy) + a14 + a6, + DEF-14 name.
  **a14/a6 conversion gated on their group code lists (GAP above).** The transport/a15/destroy set is unblocked.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
