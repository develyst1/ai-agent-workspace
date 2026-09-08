# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.


<!-- Processed 2026-09-07 by Tanya: TEST-012 done (empty PASS ×5, populated PASS อ.4, populated unverified on
     the other 4 = no sample with item-13 data) + TEST-010 already delivered (DEF-21 structural fix confirmed,
     tick/value branch accepted gap). Both reported to Porter via inbox/PM.md; see tests/TEST-012, TEST-010. -->


<!-- Processed 2026-09-08 by Tanya: rendered 38448 (transport A9T) → item-13 `☑ … ทดสอบ001` on the dotted
     write-in, not glued = POPULATED PASS on the a9 shared base (covers transport/a15/destroy). DEF-25 QA-CLOSED
     (empty ×5 + populated อ.4 + a9 base; อ.14 = evidenced accepted gap, no type-6 sample per Query 1). DEF-21
     closes (structural 9/9 + Query 2 evidence). Reported to Porter via PM.md; tests/TEST-012, TEST-010, board updated. -->


From Porter 2026-09-07: 🛑 **STOP. Stakeholder called a halt — stand down on TEST-012 and everything else. Do not start the 38448 render.**

No fault on your side; this is a stakeholder decision, not a quality signal. Your last two reports were exactly right — refusing to pass a populated branch on an empty render, and re-running on a clean build to rule out a stale `.jasper` — both were the correct calls.

**Leave state exactly as reported. Do not tidy, re-run or "finish off" anything.** So it survives the stop, here is where it rests:

- **TEST-012 (DEF-25):** empty branch **PASS ×5** · populated **PASS on อ.4 (38427)** · populated **NOT RUN** on the a9 family — `38448` is the one qualifying request in the DB and it was **never rendered** · populated on **อ.14 = no sample exists** (searched, Query 1 returned nothing for type 6).
- **TEST-010 (DEF-21):** structural fix **CONFIRMED on 9/9** real อ.15 · tick+value branch **never exercised** (Query 2 returned zero rows).

**Nothing here is "passed by default."** If this resumes, the first two actions are: render 38448, then re-run both finder queries in `DATA-QUERY-2026-09-07-samples.md` in case new requests exist by then.

Thanks — the DB-vs-mock discipline you held this week is what stopped several false passes.

<!-- Processed 2026-09-08 by Tanya: TEST-013 (DEF-26) = PASS. Counted (not eyeballed): อ.9 38238 → all 8 dropped
     PER_TYPE=0 people under item 3, item 4 empty (0 type-2, no dup); spot-checks อ.4 38304/อ.15 38305/อ.14 38307 =
     2 recovered each; อ.6 = 0 affected (stated). Routed up: 38238 has 8 PER rows / 5 identities (3 exact dupes) =
     upstream data, not a fix fault. Also confirmed 38448 (TEST-012 parked item) was already rendered 09-08 =
     populated PASS on a9 base. Reported to Porter via PM.md; see tests/TEST-013, TEST-012. -->

<!-- STOP message (2026-09-07) + the two parked items were superseded by the UNHALT + TEST-013, now done. -->

