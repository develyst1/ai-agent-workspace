# TASK-029: CHECKLIST_CODE tick-binding + DEF-14 buyer fields (REQ-030)

- Source: SPEC-032 (REQ-030 + DEF-14). Data-binding only — **`.jasper` untouched; printed order/labels LOCKED.**
- Status: TODO — Part A + DEF-14 name/duplicate are actionable now; **item-12 buyer-line ticks + a14/destroy
  scope wait on Porter's 2 confirms (SPEC-032 §Confirm).**
- Assignee: Jason (BE)
- Depends on: none for Part A; Porter's 2 confirms for the item-12-buyer-tick + scope parts.
- ⚠️ Oracle 11.2-safe. Bind by CHECKLIST_CODE only — never SEQUENCE / list position / ID.

## Part A — CODE binding (do now)
1. `RequestCheckListEntity`: add `@Column(name="CHECKLIST_CODE") String checklistCode` (dict-confirmed).
2. `A9CheckListReportBuilderBase`: replace `mid` (positional) with
   `Map<String,Long> idByCode = master.stream().collect(Collectors.toMap(RequestCheckListEntity::getChecklistCode,
   RequestCheckListEntity::getId, (a,b)->a))`; helper `tick(suffix)=checked(checkedIds, idByCode.get(checklistGroup()+suffix))`.
3. Rebind items **1-11** + item-12 checklist lines **ส.ค.4/แผนการใช้กระสุน/ภาพถ่ายสนามยิง** by the SPEC-032
   suffix table (1→00101, 2→00602, 5(1)→00803, 5(2)→12204, 5-สลักหลัง→12305, 5(3)อ.7→00006, 6→00407, 7→10008,
   8→00009, 9→00010, 10→12111, 11→00012, ส.ค.4→00013, แผนกระสุน→00021, ภาพถ่าย→00022). Map each RENDERED line
   to its suffix; a rendered line with no listed code prints unticked. **Do not reorder anything.**

## Part B — DEF-14 (do now: name + duplicate; buyer-ticks after confirm #1)
- `RequestBuyerEntity`: add `ASSOC_PRES_NAME_PREFIX/_NAME/_MIDDLE_NAME/_SURNAME` + the 4 `*_ATT_FILE_ID` (dict-confirmed).
- **ชื่อนายกสมาคม** = `join(prefix,name,middle,surname)`, blank when all null (remove the "no column" comment).
- **`:271`/`:278` duplicate — keep, documented:** table has one president/grantor card set (`ASSOC_PRES_ID_CARD_*`)
  + one attorney set; นายกสมาคม *is* the ผู้มอบอำนาจ, so 00016 & 00018 legitimately share `ASSOC_PRES_ID_CARD_*`.
  Leave both bound to it with a code comment; do NOT invent a second source.

## Gated on Porter confirm (SPEC-032 §Confirm — I'm routing them)
- **#1 buyer-line tick source:** proposed = CODE identifies the line; the TICK value for มอบอำนาจ/บัตร/ขอซื้อ/
  คณะกรรมการ/ประกาศ comes from the BUYER `*_ATT_FILE_ID` (REQ-009 present&>0), not the checklist doc. Wire the
  4 hardcoded-`false` ticks to those columns once Porter confirms.
- **#2 scope:** items 1-11 CODE-binding auto-fixes destroy+transport+a15 (shared base). Also fix **a14** (its
  `ReqSaleInt` codes) here. Leave **a9-destroy item-12** positional (its ReqMoveDestroyer codes aren't in
  REQ-030; DEF-13-destroy human-cancelled) unless Porter supplies them. **a6** — check + fix items 1-11 or scope out.

## Verify
- BE: CHECKLIST_CODE mapped; `idByCode` replaces `mid`; buyer name/ticks wired; test-compile + all PreviewTests
  green; `.jasper` untouched.
- QA (real DB): every tick lands on its own line (a real ReqMove + ReqSaleDom request); SEQUENCE/IS_ACTIVE
  toggles move no tick; ชื่อนายกสมาคม populates; order = official form; a6/a9-destroy/a14 per the scope decision.

## Definition of Done
- [ ] `CHECKLIST_CODE` mapped; positional `mid` gone; items 1-11 + ส.ค.4/แผนกระสุน/ภาพถ่าย bound by code.
- [ ] ชื่อนายกสมาคม from `ASSOC_PRES_NAME_*`; buyer-doc ticks from `*_ATT_FILE_ID` (per confirm #1); 00016/00018 documented duplicate.
- [ ] a14 fixed the same way; destroy/a6 per confirm #2; printed order unchanged; test-compile + PreviewTests green.

## Handoff after DoD
Back to **Sober** for review (code-diff vs the suffix table + column citations + a9 destroy/transport byte-identical
except intended tick corrections). Then QA per-family real render.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
