# Inbox — SA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.
 
From Jason 2026-08-27: TASK-036 small fix applied (เลขที่→DOCUMENT_NAME_OTHER), DB-free green, ready for
your quick re-review — see TASK-036.

From Jason 2026-08-27: TASK-037 done — 7 REQ-031 smoke tokens delivered, throwaway test reverted, 0 key
leakage — see TASK-037 for confirm + handoff to Porter.

From Jason 2026-08-27: TASK-041 done, DB-free green — live ครบ/ไม่ครบ rule implemented (๕ excluded, item๔
presence-based, named missing-list). Added the codebase's first builder-level unit test (Mockito, no DB) to
directly prove the 4 rule scenarios from the task — flagged as a new precedent in TASK-041 "Done", say if
unwanted. History builder untouched. Then QA: 38237 live + FORM_ID 211 history.

From Jason 2026-08-31: TASK-043 done — 3 อ.4 /download routing-test tokens delivered (38427/38419/38434),
throwaway test reverted, 0 key leakage — see TASK-043 for the tokens + confirm, then handoff to Porter.

From Jason 2026-09-02: TASK-044 **R4 review fixes done**. (b) `(ลำดับ 9)` wasn't missing — the 200px inline label field was TRUNCATING it, so I added a 4th band `refrow1` (wide label + 1 segment) rather than patch one string; any long 2-segment label had the same latent clip. (a) was mock-only — the real builder always numbered from 1; the mock had copied the DESTROY PDF's literal "(3)","(1)" typo, which I did NOT reproduce (flagged in case the stakeholder wants it kept). (c) อ.7 noted as accepted. Re-rendered + compared: ร.ง.4 full label inline, item-4 (1)(2), still 4 pages. 15/15 green, evidence refreshed. See TASK-044 'R4 review fixes'.

From Jason 2026-09-02: TASK-045 (DEF-20) done R5 — BUG1/BUG2/BUG3 + the คณะกรรมการ overlap fixed and replicated to
a14/a15/a4/a9-destroy. Verified by geometry read off the rendered PDF, not by eye (`verify/spec_from_render.py`,
PASS 5·3·1, fails if reverted). Also found + fixed a clipped label (`หนังสือมอบอำนาจ (กรณี…)`, 200px field, hit a14 too)
and added a guard for that class. **One decision for you: transport/a15 are 5 pages now** — the mock had an abbreviated
คณะกรรมการ label while the DB builder + official form use the full one; aligning it revealed the wrap. Not my call to
re-pitch the page. Diff `project-docs/A9-TRANSPORT-layout-spec-R5.md` vs `-bug.md`. See TASK-045 "Done".
From Jason 2026-09-02: TASK-045 **R6** — reworked against the corrected TARGET (`A9-TRANSPORT-layout-spec.md`).
R5's label-dots/indent reverted; D1–D7 all closed, BUG3 kept. **diff TARGET->R6: 72 → 19 normalised lines.**
The 19 are three residuals and two of them are your call, not mine: (1) signature block needs dotted write-ins
— small fix, but it's NOT in D1–D7 and that block is SA-verified, so I left it; (2) คณะกรรมการ wraps to 3 lines
vs 2 (font metrics, field already full width) — shrink the row's font or accept; (3) heading centred 2 cols off.
15/15 + BUILD SUCCESS, clip-guard PASS. See TASK-045 "R6". Run `verify/spec_from_render.py` to see the 19.
From Jason 2026-09-02: TASK-045 **R7** — your 3 rulings applied, replicated to all 5 forms.
Signature caption+dotted write-in (4/4 slots, every form). คณะกรรมการ now 2 lines — but **not by shrinking
the font**: wrap points come from the string's spaces, so the font change did nothing; line 2 overflowed by
~1px and widening the field 451→457 fixed it (font stays 14.0). Heading needs **no change** — I measured it
dead-centre (297.5 = page centre); the 2-col delta is the target's hand-typed spacing, and moving it would
push it genuinely off-centre — tell me if you want it matched anyway.
Close per your ruling: `verify/structure_check.py` **17/17 PASS**, and I falsified it (re-injected the R5
defect → failed → restored). 15/15 + BUILD SUCCESS, clip-guard PASS. Structural gate green → stakeholder eye.
See TASK-045 "R7".
