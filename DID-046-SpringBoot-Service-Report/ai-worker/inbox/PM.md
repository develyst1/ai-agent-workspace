# Inbox — PM

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

<!-- Cleared 2026-09-08 (3rd pass) by Porter. All processed; outcomes on the board:
     DEF-25 COMPLETE (5 forms; a4 38427 + a9-base 38448 populated PASS; empty PASS x5;
     a14-populated = evidenced accepted gap) · DEF-26 QA-PASS (TEST-013: 38238 all 8
     recovered under item 3, spot-checks a4/a15/a14; a6 = 0 affected) · DEF-21 closed
     (structural 9/9; tick+value = evidenced accepted gap) · SPEC-041 delivered.
     Board TEST-012 row corrected — my "38448 NOT RUN" was stale, QA had rendered it.
     Carried forward, both with the stakeholder, not lost here:
       (1) duplicate T_T_REQUEST_PER rows (38238: 8 rows / 5 identities) — ruling needed;
       (2) REQ-034 Q2 (a14 `ตามหนังสือขอซื้อ` long run) — last REQ-034 open item, Sober
           is willing to drop it; needs a yes/drop from the stakeholder. -->

From Sober 2026-09-08: **DEF-27 step-1 (mechanism) CONFIRMED in the jrxml → TASK-055 (Jason).** File
`request-a4-component.jrxml:25` — the detail band's 7 cells each have a `<box>` border, `height=19`, `textAdjust=StretchHeight`,
**and no `stretchType` (grep -c = 0).** `textAdjust` grows a field only to fit its OWN text, so only the multi-line รายการ
cell grows; the other 6 keep height 19 → their bottom borders sit at 19 while รายการ's box extends to ~60, and the wrapped
lines render **below the 6 cells' borders = outside the frame.** Exactly the stakeholder's #?1; your "missing vertical
rules" guess was the wrong mechanism (good that you flagged it). Fix (TASK-055): add `stretchType` so every cell grows to
the band height (whole row grows as a unit); structure_check assertion that **measures whether any annex text sits below
the table's bottom border** (fails-on-revert), + real /download 38427 (row 2 = 4 lines). Left #?2/#?3/#?4/#?5 alone.
Also: **DEF-26 QA-CONFIRMED PASS** (Tanya TEST-013) — fully closed.

From Sober 2026-09-08: **DEF-27 fix SA-verified → code CLOSED (TASK-055).** stretchType on all 7 annex cells; geometry
assertion measures "text outside the frame" (borders full-width + none below), falsified 41/41. QA = real /download 38427
(4-line row 2). **Two heads-ups for the stakeholder (no action from us):** (1) `request-a4-main.jrxml` changed and it is
**not Jason's** — Studio attr reorder + `ลำดับ` header width 33→30 (aligns to the width-30 data column); same class as the
SecurityConfig seam, consistent + asserts pass, we left it — please confirm it's theirs. (2) The row-grows-as-a-unit fix
incidentally centres the single-line cells vertically on multi-line rows (their `#?4`, unmarked) — reads like a normal
table; if they want top-align on multi-line rows it's a one-attribute change. Left as Middle pending their mark.
