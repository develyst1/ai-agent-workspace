# SPEC-031: DEF-12 — อ.15 item-5 = child อ.9's MOVE.AUTHORITY_NAME (not VW placeholder `-`)

- Source: DEF-12 (Porter, confirmed on real data 10/10). 🔴 TOP. **Corrects my SPEC-029 item-5 call.**
- Status: ACTIVE

## The defect (my SPEC-029 error, owned)
SPEC-029 wired a15 item-5 to `VW_REQUEST_DTL.AUTHORITY_NAME` (first detail row). On real data that column is
the **placeholder `-`** for a15's own detail rows → item-5 prints `-`, not the buyer organisation. The real
name lives on the **child อ.9** request's `MOVE.AUTHORITY_NAME`. อ.15's own request has no MOVE row (true),
but its *family* does, reachable via **`T_T_REQUEST.REF_REQUEST_ID`** (the parent/child spine).
My premise "a15 gets item-5 from the view" was wrong; I should not have assumed the view column carried it.

## Fix (a15 item5Value → child อ.9 hop)
`A15ReportBuilder.item5Value(requestId, move)` (move is null for a15 — ignore it):
1. Find the child อ.9: `requestRepository.findByRefRequestIdAndRequestType(requestId, 3)` (child's
   `REF_REQUEST_ID` = this a15 requestId, child `REQUEST_TYPE` = 3). Return `List` + firstOrNull (11.2-safe).
2. Read that child's `T_T_REQUEST_MOVE.AUTHORITY_NAME` (`requestMoveRepository.findByRequestId(childId)`) —
   **the same field อ.9 transport prints** (bind via the shared path, no second copy).
3. **Graceful:** no child (57 of 483 อ.15 have none) → **blank**, never `-`, never "null".
- New repo method `RequestRepository.findByRefRequestIdAndRequestType(Long, Integer)` (JPQL/derived list).
- **Remove the now-dead `AUTHORITY_NAME` mapping on `RequestDtlViewEntity`** (added in TASK-026 for the wrong
  source; nothing else uses it — verify grep 0 refs before deleting).

## `-` placeholder note (Porter #3)
`-` is the system's "empty" placeholder (the view's own `PRODUCT_NAME_DISPLAY_LICENSE` already strips it).
Item-5 is the known leak; after the fix it reads the child MOVE (a real name). Other printed a15/a9 fields:
annex name already strips `-`; no other bare-`-` source identified. If QA finds one, flag as a display question
(do not blanket-strip `-` on our side — it's the view owners' concern, per REQ-025).

## Impact on REQ-028 (correcting Porter's worry)
DEF-12's fix uses **`T_T_REQUEST.REF_REQUEST_ID` + the child's `T_T_REQUEST_MOVE`** — **not** `T_T_REQUEST_SALE_DOM`.
So a15 still reads **no field** from SALE_DOM (header=T_T_REQUEST, item-5=child MOVE, item-7=LICENSE, annex=VW,
ticks=ReqSaleDom). ⇒ **`RequestSaleDomEntity` remains routing-only; REQ-028's "delete it after collapsing
routing" still holds.** (Re-confirm at REQ-028 time, but DEF-12 introduces no SALE_DOM data dependency.)

## Verify
- BE (DB-free): compiles/boots; a15 item5Value calls the child-a9 hop; VW.AUTHORITY_NAME mapping removed
  (0 refs); A15/A9 PreviewTests green; a9-transport item-5 UNCHANGED (still MOVE.AUTHORITY_NAME on its own row).
  (The child-hop value is a DB path — mock can't prove it.)
- QA (real DB, via Porter): **18041 → item-5 = `สมาคมกีฬานักยิงปืนสมัครเล่นภูเก็ต`** (not `-`); an a15 with no
  child → blank; a9-transport item-5 unchanged.

## Tasks
- TASK-028: the a15 item-5 child-a9 fix + repo finder + remove dead VW.AUTHORITY_NAME mapping.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
