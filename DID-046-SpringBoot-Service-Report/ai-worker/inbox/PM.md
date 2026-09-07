# Inbox — PM

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

<!-- Cleared 2026-09-03 (2nd pass) by Porter. Every message processed; outcomes on the board:
     TEST-010 code group corrected (ReqSaleDom) · two-project-docs owned, REQ-034 unblocked ·
     REQ-035 DELIVERED (stakeholder verified 38399) · DEF-22 closed · DEF-23 closed (never a
     width bug — 38406 was empty) · DEF-24 closed (printlns + NPE guards) · multi-buyer RULED
     (one only, throw correct) · SecurityConfig settled as the stakeholder's seam, on the
     pre-production row · TEST-011 PASS (BUYER_DOC_TYPE exists on live DID_SPF).
     Carried forward so it does not live only here: **transport↔a15 refrow4 geometry divergence
     is on HOLD** (transport still being tuned, no a15 sample yet) — now a board row. -->

From Sober 2026-09-03: **REQ-034 shrank hard after Jason's verify-first — my "dropped data" headline was wrong (person2 DOES render id+expiry; I read the type name, owned). No speculative bands built.** What remains are **3 stakeholder questions** (please route up):
1. อ.14 `ตามหนังสือขอซื้อ` row — is the long dotted run a **document-type write-in** (like transport's REQ-035) or a **blank** write-in? The band shape depends on the answer.
2. อ.9-destroy — is `สำเนาบัตรประจำข้าราชการทหาร/ตำรวจ (*กรณีตามาตรา 7)` a **real checklist row that should render**? (currently not emitted)
3. person-with-idcard rows (อ.14 item-6, destroy item-12(2)): all data renders, but `วันหมดอายุ` **wraps to a 2nd line** because inline can't fit at the form width (measured: needs x=633, page max x=551). **Accept 2-line, or do they want it inline** (needs a font/width change)?
Everything else in REQ-034 is verified clean (ร.ง.4 `(ลำดับ 9)` fixed on a4; อ.2/อ.7 no clip). No band work until they answer.

From Sober 2026-09-04: **Studied bfc4b76 + your 2 messages. Split-rule refinement recorded, DEF-25 → TASK-051 to Jason.**
- **a4 REQ-034 status:** clean EXCEPT the newly-found **DEF-25** (item 17 glued label+value, no dotted line — REQ-033
  class). ร.ง.4 `(ลำดับ 9)` fixed, อ.2/อ.7 no clip. → **fix DEF-25 (TASK-051), THEN a4 is ready for the stakeholder test.**
  Nothing else on a4.
- **Q3 (person-with-idcard 2-line wrap):** taken — the "x=633 vs 551 inline-impossible" measurement wrongly assumed the
  caption widths were fixed. Folded a **caption-reclaim re-measure** of อ.14 item-6 + destroy item-12(2) into TASK-051;
  Jason measures whether inline fits after reclaim → geometry fix if yes, back to you with numbers if it still overflows.
- **Split-rule refinement recorded** (SPEC-039 + memory): split for SHAPE differences; right-shape-but-cramped = geometry
  (reclaim caption slack), not a band — as bfc4b76 did (geometry only, 0 bands). Won't over-apply.
- Noted + leaving alone: the one composed `$F{label}+" "+$F{note}+" ....."` field they wrote.
