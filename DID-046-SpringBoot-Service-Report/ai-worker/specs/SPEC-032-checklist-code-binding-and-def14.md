# SPEC-032: Bind evidence ticks by CHECKLIST_CODE + DEF-14 buyer fields (REQ-030)

- Source: REQ-030 (human rebuilt `T_S_REQUEST_CHECKLIST`; ReqMove & ReqSaleDom now 22 rows) + DEF-14 (buyer
  data ignored). Data-binding fix only — **`.jasper` unchanged, printed order/labels LOCKED to the form.**
- Status: ACTIVE — Part A locked; **2 items to confirm before Jason finishes** (tick-source split; destroy/a14 scope).
- Dict pre-check (SPEC-027) DONE: `T_S_REQUEST_CHECKLIST.CHECKLIST_CODE` ✅; BUYER `ASSOC_PRES_NAME_PREFIX/
  _NAME/_MIDDLE_NAME/_SURNAME` ✅ + `ASSOC_ANNOUNCE_ATTACH_FILE_ID`/`ASSOC_PRES_ID_CARD_ATT_FILE_ID`/
  `ATTORNEY_BOOK_ATT_FILE_ID`/`ATTORNEY_ID_CARD_ATT_FILE_ID` ✅ — all exist; map them.

## Root cause (confirmed in code)
`A9CheckListReportBuilderBase` builds `mid = i -> master.get(i).getId()` (L155) over
`findByGroupCodeAndIsActiveOrderBySequenceAsc` — **pure positional** into an IS_ACTIVE-filtered, data-team-
ordered list. The 22-row rebuild + inactive SEQ 4/5/6 shifts every `mid.apply(N)` → ticks land on the wrong
line. `RequestCheckListEntity` doesn't even map `CHECKLIST_CODE` yet.

## Part A — bind by CHECKLIST_CODE (never SEQUENCE/position/ID)
1. Add `@Column(name="CHECKLIST_CODE") String checklistCode` to `RequestCheckListEntity`.
2. In the base, replace `mid` with a **code→id map**:
   `Map<String,Long> idByCode = master.stream().collect(toMap(getChecklistCode, getId, (a,b)->a))`
   (master fetched active-only ⇒ inactive/missing code → absent → no tick; the form line still prints — REQ-030 §3/§4).
   Helper `tick(suffix) = checked(checkedIds, idByCode.get(checklistGroup() + suffix))`.
3. Replace every `mid.apply(N)` with `tick("<suffix>")` per REQ-030's table (prefix = `checklistGroup()`,
   so ReqMove/ReqSaleDom/ReqMoveDestroyer all reuse one code path):
   items **1→00101 · 2→00602 · 5(1)ร.ง.4→00803 · 5(2)อ.2→12204 · 5 สลักหลัง→12305 · 5(3)อ.7→00006 ·
   6→00407 · 7→10008 · 8→00009 · 9→00010 · 10→12111 · 11→00012**; item-12 checklist lines **ส.ค.4→00013 ·
   แผนการใช้กระสุน→00021 · ภาพถ่ายสนามยิง→00022**. ⚠️ The code's current item-5 sub-lines
   (ร.ง.4/อ.2/อ.7/"เปิดดำเนินการ") don't 1:1 the mapping (ร.ง.4/อ.2/สลักหลัง/อ.7) — Jason maps each RENDERED
   line to its suffix from the table; where a rendered line has no listed code, it prints unticked.
4. **Print order/labels stay exactly as today** (the master SEQUENCE is the data team's, not ours).

## Part B — DEF-14 (same code path, buyer data)
Add to `RequestBuyerEntity` (all dict-confirmed): `ASSOC_PRES_NAME_PREFIX/_NAME/_MIDDLE_NAME/_SURNAME` +
the 4 `*_ATT_FILE_ID` above.
1. **ชื่อนายกสมาคม** line: `join(prefix,name,middle,surname)` (blank when all null) — replaces the current
   hardcoded blank + wrong "no column" comment.
2. **The 4 buyer-doc ticks** (today hardcoded `false`) come from the BUYER attach ids (present & > 0, REQ-009):
   ประกาศนายทะเบียน/ส.ค.4-assoc→`ASSOC_ANNOUNCE_ATTACH_FILE_ID` · บัตรนายกสมาคม→`ASSOC_PRES_ID_CARD_ATT_FILE_ID` ·
   หนังสือมอบอำนาจ→`ATTORNEY_BOOK_ATT_FILE_ID` · บัตรผู้รับมอบ→`ATTORNEY_ID_CARD_ATT_FILE_ID`.
   (ขอซื้อ→`BUYER_DOC_ATTACH_FILE_ID`, คณะกรรมการ→`GOV_COMMITTEE_ATT_FILE_ID` already wired.)
3. **The `:271`/`:278` duplicate (00016 vs 00018): documented, not invented.** Both currently read
   `ASSOC_PRES_ID_CARD_*`. The table has exactly ONE president/grantor card set (`ASSOC_PRES_ID_CARD_*`) +
   one attorney set (`ATTORNEY_ID_CARD_*`); there is **no separate "ผู้มอบอำนาจ" card column**. In the
   association case the นายกสมาคม *is* the ผู้มอบอำนาจ, so `00016` (กรณีสมาคม) and `00018` (กรณีมอบอำนาจ)
   legitimately share `ASSOC_PRES_ID_CARD_*`. → **Keep both bound to it; documented duplicate** (REQ-030 allows
   this explicitly). `00020` บัตรผู้รับมอบ = `ATTORNEY_ID_CARD_*` (already distinct).

## ⚠️ Confirm before Jason finalises (don't guess)
1. **Tick source for item-12 buyer lines — REQ-030 vs DEF-14 overlap.** REQ-030 gives these lines
   CHECKLIST_CODEs (00016-00020) → implies a checklist tick; DEF-14 says their tick comes from the BUYER
   `*_ATT_FILE_ID`. Proposed reconciliation: **CODE identifies the line + its active-state (whether it prints/
   is tickable); the tick VALUE for buyer-doc lines comes from the BUYER `ATT_FILE_ID`** (attachment lives
   there, not in `T_T_REQUEST_DOC`) — consistent with REQ-030 §4 ("tick from their own tables"). @Porter:
   confirm this split (checklist-CODE tick for items 1-11 + ส.ค.4/แผนกระสุน/ภาพถ่าย; BUYER-ATT_FILE_ID tick
   for มอบอำนาจ/บัตร/ขอซื้อ/คณะกรรมการ/ประกาศ) before we lock it.
2. **Scope (REQ-030 AC asks SA to state).** The base is shared: **items 1-11 CODE-binding fixes อ.9 destroy +
   transport + อ.15 at once** (same suffixes, per-variant prefix). อ.9-**destroy item-12** uses its own
   `ReqMoveDestroyer` sub-item codes — **not in REQ-030's table** → its item-12 stays positional unless we get
   that mapping (DEF-13-destroy was human-cancelled; recommend: fix destroy items 1-11 via the shared change,
   leave destroy item-12 as-is + note, OR request its codes). **อ.14** shares the pattern (its own
   `ReqSaleInt` codes — Porter earlier gave item-12 = SEQ12-15; items 1-11 = same suffixes) → fix it the same
   way in this task. **อ.6** = separate builder; check whether it binds positionally and fix consistently or
   scope out. @Porter: OK to include a14 + fix destroy/a6 items 1-11, and leave destroy item-12 positional (cancelled)?

## Verify
- BE: `CHECKLIST_CODE` mapped; `mid` replaced by `idByCode`; buyer name/ticks wired; test-compile + all
  PreviewTests green; `.jasper` untouched. (Tick-landing is a DB path — QA proves.)
- QA (real DB): every tick lands on its own form line (verify a real ReqMove + ReqSaleDom request); toggling
  SEQUENCE/IS_ACTIVE moves no tick; ชื่อนายกสมาคม populates; printed order = official form; อ.6/อ.9-destroy/อ.14 correct or unaffected per the scope decision.

## Tasks
- TASK-029: Part A (CODE binding, base + a14) + Part B (DEF-14 buyer name/ticks/duplicate) — gated on the 2 confirms.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
