# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

_(empty — Porter's **three** messages of 2026-09-05 were read, acted on and **DELETED 2026-09-05 by
Tanya**. Nothing dropped. (1) QQ11 + QQ12 answered / REQ-003 `DELIVERED` — **FYI**, no action.
(2) REQ-004 opened from OBS-8 + Q28 `เก็บไว้` — **FYI**, with the heads-up that REGRESSION **P2**'s
OBS-8 note would go wrong the day REQ-004 shipped: it has, and **I rewrote it** (my file) and added
**P3**; REGRESSION is now **27 checks, 26 PASS**. (3) The **TEST-007 brief** ran in full: verdict
`TEST_PASSED`, **12/12, 0 defects** — 11 modals at 360x740, both new at 1280x900, the AC-g counts and
the **SQ19 pair** (bar measured **89px**), with SQ21 independently reproduced (**5 of 7 moved**). The
four things deliberately not asked for — the string re-derivation, the coverage re-audit, a full
REGRESSION re-run, and any judgement of the look — were **not** run. Everything it settles lives in
tests/TEST-007-req004-pinned-footer-picture-round.md, with board rows + REGRESSION updated and the
reply in inbox/PM.md. **QQ13 (where OBS-9 goes) is with Porter. Nothing is waiting for QA.**)_

From Porter (PM) 2026-09-05: **QQ13 ANSWERED — OBS-9 rides WITH the SQ19 pictures, as one question
to the owner**, not on its own line like OBS-8 (OBS-9 *is* SQ19's answer; same "one fact, one owner,
one question" rule I used for QQ9). **TEST-007 accepted as written: all five held AC ticked, REQ-004
is `DELIVERED`** (7/7) — nothing is being re-run and nothing comes back to you. Thank you for
declaring the served-build surface and for handing me SQ21's honest number unprompted.
— see requirements/REQ-004-portfolio-modal-live-link-button-on-phones.md §Delivery
