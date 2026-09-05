# Dispatcher state ARCHIVE — portfolio-nichaphon — runs dated 2026-09-04

> Rotated out of `../dispatcher-state.md` on 2026-09-05 by Porter (PM housekeeping,
> gate said `dispatcher-state.md holds 7 runs > 6`). Copied VERBATIM — not summarised,
> not edited — and `cmp`-verified byte-for-byte against the source before the live
> file was cut. Contains: RUN 2026-09-04-a.

## RUN 2026-09-04-a — N=8 — started from: human answer SQ10 (fix inside REQ-002) — hygiene FAIL, housekeeping first
hop 1 | PM  | did: housekeeping (shortened the one over-length SQ8 board cell, content verified present in SPEC-002) + recorded SQ10 and unblocked TASK-012; gate PASS | ball_to: SA | flags: check-hygiene.mjs was updated on disk mid-hop and now warns about a missing SYSTEM-FACTS.md — workspace-level, not this project's to invent
hop 2 | SA  | did: reviewed TASK-010 -> REWORK with all 5 of Fern's questions answered (T3 mechanism found in Mantine's own CSS, T4 added), scheduled TASK-012 between 010 and 011 | ball_to: FE | flags: FQ35 (no-animation-frame harness) written into SQ7 as a candidate mechanism for TEST-003 to confirm; gate not moved
hop 3 | FE  | did: TASK-010 rework round — T3 via the Accordion vars, T4 placeholder 4.28 -> 7.61:1, FQ33 comment; re-verified, no 20th file -> REVIEW | ball_to: SA | flags: harness also refuses to scroll — another datum for FQ35/SQ7
hop 4 | SA  | did: reviewed TASK-010 rework -> DONE (19-file scope, the exact 4 theme.ts hunks, tsc and both greps re-verified first-hand), carried its 4 UNVERIFIED checks into TASK-011 §7 + a 4th QA eye | ball_to: FE | flags: -
hop 5 | FE  | did: repaired DEF-1 with one line (display:block on .frame), proved the cause by a rendered before/after A/B, nine thumbnails now measure non-zero at both viewports -> REVIEW | ball_to: SA | flags: painted pixel still wants a QA eye (harness will not scroll); modal open still UNVERIFIED (FQ35)
hop 6 | SA  | did: reviewed TASK-012 -> DONE (one hunk, span kept, import graph and tsc re-verified); carried the painted-pixel check to TASK-011 §7 and a 5th QA eye | ball_to: FE | flags: 1 low-confidence item — nobody has SEEN the nine /about images paint; routed to QA via PM
hop 7 | FE  | did: ran TASK-011 site-wide sweep on 6 routes x 3 widths against a pristine HEAD copy, 0 files changed, 25/39 ticked -> REVIEW; DEF-1 proved by A/B (9 images at 0x0 on HEAD, 0 now) | ball_to: SA | flags: FQ38 (no visible focus ring on /contact fields, pre-existing, WCAG 2.4.7), FQ37 (+123 kB First Load JS on /blog and /portfolio), FQ36 (orphan dev server squatting the repo)
hop 8 | SA  | did: reviewed TASK-011 -> DONE, adjudicated all 5 unticked boxes, answered FQ36-FQ38 (corrected its own inline-vars rule, disputed Fern's FQ38 mechanism), placed SQ11/SQ12; REQ-002 -> SPEC_DONE | ball_to: PM | flags: 2 low-confidence items routed to a QA eye rather than resolved; SQ7 gate still deferred
STOPPED hop 8/8 — condition 5 (hop budget reached)
Board: SPEC-002 CLOSED — TASK-006..012 all DONE. REQ-002 SPEC_DONE awaiting Porter's acceptance round. 7 QA eyes queued under SQ8; TEST-003 + REGRESSION S13 are Tanya's.
Digest sent to human: all 6 routes rebuilt, DEF-1 repaired, SQ11 (+123 kB JS) needs his call; nobody has SEEN the /about images paint.
