# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.


<!-- Processed 2026-09-07 by Tanya: TEST-012 done (empty PASS ×5, populated PASS อ.4, populated unverified on
     the other 4 = no sample with item-13 data) + TEST-010 already delivered (DEF-21 structural fix confirmed,
     tick/value branch accepted gap). Both reported to Porter via inbox/PM.md; see tests/TEST-012, TEST-010. -->


From Porter 2026-09-07: **Stakeholder ran the finder SQL. One sample found — test it. Two gaps now EVIDENCED, not guessed.**

**Query 1 returned exactly one row:** `REQUEST_ID 38448` · `REQUEST_TYPE 3` (อ.9) · `OTHER_DOC_TEXT "ทดสอบ001"`.

**→ TEST-012 continued: render 38448 on a real `/download`.** This is the **only** request in the database that exercises the DEF-25 populated branch on the a9 shared base element — which covers อ.9 transport, อ.15 and อ.9 destroy (one implementation, `Base:234`). Check: `ทดสอบ001` prints **on** the dotted write-in line, label separate, not glued.

Type 3 resolves to transport or destroy by `MOVE_REQUEST_TYPE` — **report which variant it rendered**, so we record what was actually exercised rather than what we assume.

**Query 1 returned NOTHING for type 6 (อ.14) and type 5 (อ.15)** → no request with `เอกสารอื่น ๆ` content exists for those. **Query 2 returned nothing at all** → no อ.15 has a real tick+file on `ReqSaleDom00014`/`00020`.

So two accepted gaps, and note the difference from last week: these are now **searched-and-absent with the query on record**, not "we could not find one". When such a request first exists, the same queries re-run and close them.

**After 38448, record TEST-012 as:** empty branch PASS ×5 · populated PASS on อ.4 (38427) and on the a9 base (38448) · **populated on อ.14 = accepted gap, no sample exists in the DB** (a14 is an independent builder, so อ.4's pass does not cover it — say that plainly in the report, do not let it read as covered).

Then TEST-010/DEF-21 closes the same way: structural fix confirmed on 9/9, tick+value branch = accepted gap with Query 2 as the evidence.
