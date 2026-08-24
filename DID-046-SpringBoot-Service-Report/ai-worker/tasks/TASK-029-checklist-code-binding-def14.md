# TASK-029: CHECKLIST_CODE tick-binding + DEF-14 buyer fields (REQ-030)

- Source: SPEC-032 (REQ-030 + DEF-14). Data-binding only — **`.jasper` untouched; printed order/labels LOCKED.**
- Status: REVIEW (Part A + DEF-14 name/dup done, DB-free green) — **item-12 buyer-line ticks + a14/destroy scope
  still GATED on Porter's 2 confirms (SPEC-032 §Confirm); I finish those on the answers.**
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

## Progress — Part A + DEF-14(name/dup) EXECUTED, DB-free verified → REVIEW (gated parts still open)

**Done now (ungated):**
- `RequestCheckListEntity.checklistCode` (`CHECKLIST_CODE`) mapped.
- Base `buildEvidences`: **positional `mid` replaced by `idByCode`** (`Map<code,id>`, active-only → missing→untick,
  graceful) + `idFor(idByCode, suffix)` helper (full code = `checklistGroup()+suffix`). Rebound items **1-11** by the
  SPEC-032 suffix table: 1→00101, 2→00602, 5ร.ง.4→00803, 5อ.2→12204, 5อ.7→00006, 5"เปิดดำเนินการ"→**no code→untick**,
  6→00407, 7→10008, 8→00009, 9→00010, 10→12111, 11→00012. **Print order/labels unchanged.**
- item-12 **transport** checklist lines rebound: ส.ค.4→00013, แผนกระสุน→00021, ภาพถ่าย→00022 (shared base →
  fixes transport + a15 at once). `buildItem12` hook now passes **both** `mid` (destroy positional) **and** `idByCode`.
- DEF-14 name: `RequestBuyerEntity` +`ASSOC_PRES_NAME_PREFIX/_NAME/_MIDDLE_NAME/_SURNAME`; ชื่อนายกสมาคม line =
  `join(...)` (blank when null), replaced the "no column" placeholder.
- DEF-14 `00016`/`00018` duplicate **documented** in code (both intentionally share `ASSOC_PRES_ID_CARD_*`).
- **Untouched:** `.jasper`, printed order, a9-destroy item-12 (still positional `mid` — ReqMoveDestroyer sub-codes
  aren't in REQ-030, DEF-13-destroy cancelled).

**Verify (DB-free):** test-compile + clean compile SUCCESS; boot :33096 Started clean (CHECKLIST_CODE + 4 buyer
name cols map OK); all 5 PreviewTests render. NB previews use the **mock** builder (not the DB `buildEvidences`
path) so they prove no-break only — **actual tick landing is QA's leg** (rule #4).

**Still GATED (not done — waiting on Porter's 2 confirms, SPEC-032 §Confirm):**
- **#1 buyer-doc ticks:** the 4 hardcoded-`false` ticks (ประกาศนายทะเบียน / บัตรนายก / มอบอำนาจ / บัตรผู้รับมอบ) →
  wire to BUYER `*_ATT_FILE_ID` once #1 confirmed. Left `false`; the 4 att-file-id columns NOT yet added (avoid unused
  mappings until wired).
- **#2 scope:** a14 (`ReqSaleInt` codes) same-pattern fix + a6 items 1-11 decision + destroy item-12 (leave positional)
  wait on Porter. Not touched.

@Sober: Part A (items 1-11 + transport item-12 checklist lines) + DEF-14 name/duplicate are code-DONE + DB-free
green; buyer-doc ticks and a14/a6/destroy scope held for Porter's 2 confirms. Review Part A now; I'll finish the
gated parts on the confirms.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review — Part A + DEF-14 name/dup (Sober, 2026-08-21)
Verified code + build:
- `RequestCheckListEntity.CHECKLIST_CODE` mapped (dict-confirmed). Positional `mid` replaced by
  `idByCode` + `idFor(suffix)=idByCode.get(checklistGroup()+suffix)`; **all items 1-11 code-bound** (grep:
  no `mid.apply` for 1-11) with the REQ-030 suffixes; item-5 sub-lines ร.ง.4/อ.2/อ.7 = 00803/12204/00006. ✅
- ชื่อนายกสมาคม = `join(ASSOC_PRES_NAME_PREFIX/_NAME/_MIDDLE_NAME/_SURNAME)`; 00016/00018 documented dup
  (one president/grantor card set). ✅  test-compile + A6/A9/A14/A15 previews green (4/0); print order unchanged. ✅
- **Observation (not blocking, → Porter/QA):** the rendered item-5 4th line is "เปิดดำเนินการผลิตอาวุธ"
  (ticks `false`, no code) while REQ-030's table lists "สลักหลัง อ.2 → 12305" there. 12305 is inactive (never
  ticks) so binding is moot, but the LABEL may differ from the official form — confirm during QA; out of
  REQ-030's tick-binding scope (labels stay locked).
- **Tick-landing correctness = QA real-data** (DB-free can't exercise it). Gated rest (buyer-doc ticks →
  BUYER `*_ATT_FILE_ID`; a14/destroy/a6 scope) still awaits Porter #1/#2 — then back to me.
## ⚠️ RESPEC to the TICK RULE (Sober, 2026-08-21) — supersedes the gated plan above
Porter re-spec'd REQ-030 to the stakeholder's canonical TICK RULE (SPEC-032 rewritten). My earlier gate
questions are moot — Porter answered then withdrew them. Concrete deltas from Part A (which I'd verified
against the now-superseded draft):
1. **DELETE the IS_ACTIVE filter** on the master query. Tick is purely: line's CHECKLIST_CODE →
   T_S_REQUEST_CHECKLIST.ID → T_T_REQUEST_DOC (REQUEST_ID + REQUEST_CHECKLIST_ID), ATTACH_FILE_ID not null/0,
   STATUS≠D (NULL-safe). IS_ACTIVE plays no part.
2. Resolve **code→ID once per report** (single `findByChecklistCodeIn(codes)` → map), not per line.
3. **Item-12 buyer-doc + destroy lines tick via their own CHECKLIST_CODE too** (not hardcoded false, NOT the
   BUYER `*_ATT_FILE_ID` — gate #1 WITHDRAWN). Destroy item-12 codes = ReqMoveDestroyer 00013…00019.
4. **DEF-14 name** stays (ชื่อนายกสมาคม from ASSOC_PRES_NAME_*); the BUYER `*_ATT_FILE_ID` may supply line
   VALUES but never the tick. 00016/00018 = distinct lines (each ticks by its own code); value dup is data-driven, OK.
5. **Scope = all 5 forms.** a9 transport/a15/destroy = unblocked (codes known — SPEC-032). **a14 (ReqSaleInt)
   + a6 (ReqSpecial) GATED on their full group code lists** (only partial known; codes are group-scoped —
   suffixes differ per group). **a6 currently correct → a6/38272 output MUST stay unchanged (regression canary).**

## Do now (unblocked): the a9-base family (transport / a15 / destroy)
- Kill the IS_ACTIVE filter + the positional remnants; implement the TICK RULE helper (code→ID once, then
  per-line doc match). Bind items 1-11 + item-12 (transport/a15 buyer+permit lines by code; destroy item-12
  00013-00019). DEF-14 name. test-compile + previews green; `.jasper` untouched.
## Gated: a14 + a6 — need the ReqSaleInt / ReqSpecial full per-line CHECKLIST_CODE lists (Sober → Porter → human).

## Progress — RESPEC (TICK RULE) EXECUTED for the a9-base family, DB-free verified → REVIEW (2026-08-24)
Re-did the binding to the canonical TICK RULE (SPEC-032 rewritten); dropped the old `mid`/IS_ACTIVE scaffolding.
- **Rule mechanics (base):** master fetch = `findByGroupCode(checklistGroup())` (**IS_ACTIVE gone**);
  docs = new NULL-safe `findActiveByRequestId` (`STATUS IS NULL OR <>'D'`); `hasFile` = `ATTACH_FILE_ID != null && != 0`
  (was the `getAttachFile()` join). Tick ⟺ a matching `T_T_REQUEST_DOC` (REQUEST_CHECKLIST_ID = code's ID) with a
  file exists. `idFor(idByCode, suffix)` resolves code→ID once per report.
- **Code-bound now (codes ARE in SPEC-032):** items 1-11; transport/a15 item-12 buyer-doc lines
  ประกาศ=00017 · บัตรนายก=00016 · มอบอำนาจ=00019 · บัตรนายก/ผู้มอบ=00018 · บัตรผู้รับมอบ=00020 · ส.ค.4=00013 ·
  แผนกระสุน=00021 · ภาพถ่าย=00022 (00016/00018 now **distinct code ticks**, value still shared ASSOC_PRES_ID_CARD_*);
  **destroy item-12 (3)-(9) = 00013-00019** (positional `mid` fully removed; hook signature dropped `mid`).
  (1)วันกำจัด/(2)ตัวอย่างลายมือ have no code → untick. DEF-14 ชื่อนายกสมาคม from ASSOC_PRES_NAME_* (value).
- **Scope done:** transport + a15 + destroy (shared a9-base). **a14/a6 NOT touched** (gated on their code lists);
  a6 = separate builder, untouched ⇒ regression canary safe.

### ⚠️ Question — item-12 lines with NO CHECKLIST_CODE in SPEC-032 (need codes; did NOT guess)
> **Q:** these transport/a15 item-12 lines have no code in SPEC-032, so I left them ticking from their **own
> tables** (which the TICK RULE forbids) + flagged in code: **ตามหนังสือขอซื้อ** (buyerDocAttachFileId),
> **ตามหนังสือคณะกรรมการ** (govCommitteeAttFileId), and the **4 permit-row headers ป.3/ป.5/มหาดไทย/ยุทธภัณฑ์**
> (their license-row attachFileId). To make them rule-compliant I need their `ReqMove`/`ReqSaleDom` CHECKLIST_CODEs.
> Also please confirm the **destroy (3)-(9) → 00013-00019** order-based mapping + that (1)/(2) are correctly untick.

### Verify (DB-free)
- test-compile + clean compile SUCCESS; boot :33097 Started clean (new `@Query findActiveByRequestId` +
  `findByGroupCode` validated at startup); all 5 PreviewTests render. Previews = mock path → no-break only;
  **tick landing = QA real-data** (a real ReqMove + ReqSaleDom + a destroy sample; toggle SEQUENCE/IS_ACTIVE → no
  change; a6/38272 unchanged canary).

@Sober: TICK RULE implemented across the a9-family (transport/a15/destroy) for every line whose code is in
SPEC-032. Held: the item-12 own-table lines above (need codes) + a14/a6 (need group code lists). Review + route
the code request up.

## Follow-up — Sober's answers applied → a9-family CODE-DONE (2026-08-24)
Per Sober's review answers:
1. **ขอซื้อ = CODE 00014, คณะกรรมการ = CODE 00015** (they WERE in REQ-030's table — SPEC omission). Code-bound
   their ticks (`checked(checkedIds, idFor(..,"00014"/"00015"))`); BUYER_DOC/GOV_COMMITTEE only supply the line
   VALUE (เลขที่/ลงวันที่) now, never the tick. ✅
2. **Permit rows (ป.3/ป.5/มท./ยุทธภัณฑ์): kept own-table tick** (`addLicenseRows` unchanged) — REQ-030 §4 carve-out
   (no master row). (Sober confirming §4 vs "one source" with Porter — not my change.)
3. **destroy (3)-(9) = 00013-00019 confirmed** — my mapping stands; (1)/(2) no code = correct.
- Verify: test-compile + A9/A15/A6 previews green; boot :33098 clean. **a9-family (transport/a15/destroy) TICK RULE
  code-DONE.** Remaining = a14/a6 (gated on ReqSaleInt/ReqSpecial code lists) + QA real-data tick-landing.

@Sober: one-fix applied, a9-family done. Pinging you.

## Follow-up — a14 + a6 converted (Porter's code lists) → whole TASK-029 code-DONE (2026-08-24)
Sober relayed Porter's `ReqSpecial`(a6) + `ReqSaleInt`(a14) per-line code lists → converted both builders to the
TICK RULE. Per Sober's steer, extracted a **shared helper** instead of a 3rd copy:
- **NEW `report/common/util/ChecklistCodeBinder`** (static): `idByCode(master)`, `checkedChecklistIds(docs)`
  (ATTACH_FILE_ID>0), `tick(idByCode, checked, group, suffix)`. Used by a6 + a14 (a9-base kept its verified inline
  copy — noted; could retrofit later).
- **a6 (`ReqSpecial`):** master→`findByGroupCode`, docs→`findActiveByRequestId` (NULL-safe), `hasFile`=ATTACH_FILE_ID>0;
  items 1/2/5/6/7/8(1-4) code-bound = 00101/00602/00803/**00404**/**10005**/00006/00007/00008/00009.
- **a14 (`ReqSaleInt`):** same mechanics; items 1-11 = 00101/00602/00803/12204/(อ.7,เปิดดำเนินการ = no code→untick)/
  **00406**/**10007**/00008/00009/**12110**/**00011**; item-12(1)(2)(4)+ภาพถ่าย = 00012/00013/00014/00015; permits/
  ขอซื้อ/มอบอำนาจ/person2 = §4 own-table (unchanged).
- **Group-scoped suffixes respected** (a6 บัตรผู้เสียภาษี=00404, a14=00406, a9=00407 — NOT reused). Dropped orphaned
  `ACTIVE` consts.

**Verify (DB-free):** test-compile + clean compile + boot :33099 all green (all finders validate at startup);
5 PreviewTests render. **⚠️ a6 predicate changed** (getAttachFile()→ATTACH_FILE_ID>0, docs NULL-safe) — for the
9-row all-active ReqSpecial the code-binding maps to the same rows, so 38272 SHOULD be identical, but the
file/status predicate is a real change → **a6/38272 must be QA-confirmed identical (the mandated canary)**; if it
differs it reveals a dangling FK / NULL-status doc (surfaced, not hidden). a14 has no attachments → all ticks stay
blank (no visible change).

@Sober: **whole TASK-029 code-DONE** — all 5 forms on the TICK RULE via one shared helper. Back to you → QA
real-data tick-landing (ReqMove+ReqSaleDom+38362 land on their lines; toggle SEQUENCE/IS_ACTIVE → no move) + the
a6/38272 canary.

## Review + code-request answers (Sober, 2026-08-24) — a9-family
**Mechanism verified:** IS_ACTIVE filter deleted (`findByGroupCode`); NULL-safe `findActiveByRequestId`;
`hasFile`=ATTACH_FILE_ID not null/≠0; `idFor(idByCode,suffix)` code→ID once; positional `mid` gone; items 1-11
+ ส.ค.4/มอบอำนาจ/บัตร code-bound; DEF-14 ชื่อนายกสมาคม from ASSOC_PRES_NAME_*. compile + A9/A15/A6 previews green. ✅

**Your 3 flagged lines — answers:**
1. **ตามหนังสือขอซื้อ = `00014`, ตามหนังสือคณะกรรมการ = `00015`.** They DO have codes — they're in the REQ-030
   requirement table; I omitted them from SPEC-032's explicit list (my miss, now fixed in SPEC-032). **Code-bind
   both** (`checked(checkedIds, idFor(idByCode,"00014"))` / `"00015"`) — the tick moves OFF the own-table
   `getBuyerDocAttachFileId()`/`getGovCommitteeAttFileId()` (those stay as VALUE sources only, per the rule). One small change.
2. **ป.3 / ป.5 / มหาดไทย / ยุทธภัณฑ์ = NO checklist code → KEEP the own-table tick you have** (LicRow →
   permit-table `getAttachFileId()`). They are the explicit REQ-030 §4 carve-out ("tick from their own tables,
   not from the master" — no master row). Your current `addLicenseRows` handling is **correct**; leave it.
   (Flagging to Porter to confirm this survives the final "one source" wording — but §4 sanctions it.)
3. **destroy item-12 (3)-(9) → `00013`-`00019` — CONFIRMED** sequential per Porter's list:
   (3)สถานที่กำจัด=00013 · (4)เจ้าหน้าที่ควบคุม=00014 · (5)รูปถ่ายเศษวัตถุ=00015 · (6)ขั้นตอนกำจัด=00016 ·
   (7)อ.10=00017 · (8)กฎหมายอื่น=00018 · (9)ผู้เชี่ยวชาญ=00019. (1)/(2) (วันที่กำจัด / person2) have no code → untick. ✅
   NB codes are group-scoped: ReqMoveDestroyer00014=เจ้าหน้าที่ควบคุม, NOT ขอซื้อ (that's ReqMove00014) — your
   separate destroy buildItem12 already keeps them apart; good.

**Verdict:** a9-family = **one small fix** (code-bind ขอซื้อ 00014 / คณะกรรมการ 00015), then code-DONE. Permits
correct as-is; destroy mapping confirmed. Ping me after the fix. Tick landing = QA real-data. a14/a6 still gated on their code lists.

## a14 + a6 conversion — UNBLOCKED (Porter delivered both code lists, 2026-08-24)
Both are **separate builders** (`A14CheckListReportBuilder:139`, `A6CheckListReportBuilder:145`) that still
carry the positional `mid`. Apply the **same TICK RULE mechanism** proven in the a9 base (findByGroupCode — NO
IS_ACTIVE; NULL-safe `findActiveByRequestId`; `hasFile`=ATTACH_FILE_ID>0; `idFor(idByCode, suffix)` code→ID once)
to each, using its OWN group's suffixes. ⚠️ **Codes are group-scoped — do NOT reuse a9's suffixes** (บัตรผู้เสียภาษี
= a6 `00404` / a14 `00406` / a9 `00407`). Bind `IS_ACTIVE=0` rows (12204/12305) anyway. Recommend extracting the
~10-line tick helper into one shared util rather than duplicating it a third time (SA pref; your factoring).

### อ.6 — group `ReqSpecial` (9 codes; **38272 = regression canary, must render identically**)
1 จดทะเบียน→`00101` · 2 มอบอำนาจ→`00602` · 5 ร.ง.4(ลำดับ9)→`00803` · 6 บัตรผู้เสียภาษี→`00404` · 7 ภ.พ.20→`10005` ·
8(1)→`00006` · 8(2)→`00007` · 8(3)→`00008` · 8(4)→`00009`. Persons 3/4 = no code (own-table `T_T_REQUEST_PER`).

### อ.14 — group `ReqSaleInt` (separate export item-12)
1→`00101` · 2→`00602` · 5 ร.ง.4→`00803` · 5 อ.2→`12204` · 5 สลักหลัง→`12305` · 6 บัตรผู้เสียภาษี→`00406` ·
7 ภ.พ.20→`10007` · 8→`00008` · 9→`00009` · 10→`12110` · 11→`00011` · 12(1) นิติบุคคลผู้ซื้อ→`00012` ·
12(2) หลักฐานขอซื้อจากรัฐบาลผู้ซื้อ→`00013` · 12(4) END-USER CERT→`00014` · 12 ภาพถ่ายสนามยิง→`00015`.
item-12 มอบอำนาจ/บัตรผู้รับมอบ/person2/ขอซื้อ/ป.3/ป.5/มท./ยุทธภัณฑ์ + item-13 = no master row → own-table §4.

### DoD (a14/a6)
- [ ] a14 + a6 builders use the TICK RULE (IS_ACTIVE filter gone; code→ID→REQUEST_DOC; per-group suffixes above).
- [ ] a6/38272 renders **identically** (canary); persons still from T_T_REQUEST_PER; a14 own-table §4 lines unchanged.
- [ ] test-compile + all PreviewTests + boot green. Then whole TASK-029 → Sober review, then QA real-data tick-landing.

## Review — a14 + a6 (Sober, 2026-08-24): whole TASK-029 code-DONE
Verified: shared `ChecklistCodeBinder` (idByCode / checkedChecklistIds[ATTACH_FILE_ID not null/0] / tick) —
code→tick logic in ONE place. **a6 (ReqSpecial)** 00101/00602/00803/**00404**/**10005**/00006-00009;
**a14 (ReqSaleInt)** items 1-11 + 12(1)(2)(4)+ภาพถ่าย = 00012-00015; own-table §4 lines unchanged.
**Group-scoped suffixes correct & distinct** (a6 00404 / a14 00406 / a9 00407 — Jason commented the ≠).
findByGroupCode (no IS_ACTIVE), NULL-safe docs, hasFile=ATTACH_FILE_ID>0; positional `mid` gone everywhere.
test-compile + A6/A9/A14/A15 previews green. **Whole TASK-029 = code-DONE (all 5 forms on the TICK RULE).**
Remaining (not Sober): QA real-data tick-landing + **a6/38272 must render identically** (predicate changed
positional→code; codes cross-checked 1:1 vs 38272 by Porter, so expected identical — QA confirms).
