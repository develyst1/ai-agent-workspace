# Dispatcher state ARCHIVE — portfolio-nichaphon — rotated 2026-09-02

> Runs rotated out of `../dispatcher-state.md` by a PM housekeeping hop on
> 2026-09-02 (9 runs > limit 6). Contents below are VERBATIM, byte-for-byte.
> Runs archived here: 2026-08-30-d, -e, -f, -g. Newer runs stay in dispatcher-state.md.
> Earlier runs -a/-b/-c are in `dispatcher-state-2026-08-30.md`.
>
> Second rotation 2026-09-05 (PM housekeeping): runs 2026-09-02-a, -b, -c appended below.
> Third rotation 2026-09-05 (PM housekeeping, 7 runs > limit 6): runs **2026-09-02-d** and
> **2026-09-03-a** appended below, also VERBATIM (`cmp`-verified byte-for-byte against the
> extracted block before dispatcher-state.md was touched). Runs 2026-09-04-a onward stay there.

## RUN 2026-08-30-d — N=4 — started from: human answers Q10-Q11
hop 1 | PM  | did: closed Q11 (English quotes locked into R5 under the human's explicit authorisation), kept Q10 open | ball_to: SA | flags: 1 question (non-blocking), 1 low-confidence assumption
STOPPED hop 1/4 — conditions 1 + 3
Board: REQ-001 READY_FOR_SA, fully unblocked for Home; inbox/SA.md has the pointer; SA still not dispatched after 4 runs.
Digest sent to human: Q10 needs the exact Thai strings pasted (non-blocking); flagged that 4 consecutive runs ended on PM questions and no SA hop has run yet — a bare "ไปเลย" or "N=8 ไปเลย" wakes Sober.

## RUN 2026-08-30-e — N=4 — started from: human answer to Q10
hop 1 | PM  | did: closed Q10 — final Thai for quotes 1-3 written into REQ-001 R5 (punctuation/spacing only) | ball_to: SA | flags: 1 conditional question
STOPPED hop 1/4 — condition 1 (a question is present, though PM marks it non-blocking)
Board: REQ-001 READY_FOR_SA with ZERO open questions; Blocked section empty for the first time; SA still not dispatched after 5 runs.
Digest sent to human: quotes 1-3 finalised (punctuation only, wording untouched); a bare "ไปเลย" / "N=8 ไปเลย" wakes Sober for the Home SPEC.

## RUN 2026-08-30-f — N=8 — started from: human answer ("ใช่") + N=8 ไปเลย
hop 1 | PM  | did: recorded the bare "ใช่" as REQ-001 Q12 with both readings, left R5 untouched | ball_to: SA | flags: 1 copy-only question, 1 low-confidence assumption
DISPATCHER DECISION: Q12 is copy-only and cannot affect structure/palette/library; the human raised N to 8 explicitly to get past PM-only stalls (7 runs, 0 SA hops). Carrying Q12 into the end-of-run digest instead of stopping at it.
hop 2 | SA  | did: wrote SPEC-001 (Home visual identity rebuild) from a real read of the repo; REQ-001 -> IN_SPEC | ball_to: SA | flags: 2 low-confidence assumptions (dark-only, display font) — both reversible, routed to PM as SQ1-SQ3, nothing blocked
hop 3 | SA  | did: cut TASK-001..005 from SPEC-001 and closed a gap in its own task split (SectionHeading eyebrow -> TASK-003, props frozen) | ball_to: FE | flags: -
hop 4 | FE  | did: implemented TASK-001 (tokens + Space Grotesk + dark-only mount) across 4 repo files, clean build, 6 routes checked; BLOCKED on FQ1 | ball_to: SA | flags: 1 low-confidence assumption (no-flash asserted from mechanism, not a measured frame); 4 files uncommitted on develop
hop 5 | SA  | did: answered FQ1 (h1 tracking -> global rule in globals.css, Mantine 8 HeadingStyle verified in node_modules), amended TASK-001/004 + SPEC-001 | ball_to: FE | flags: -
DISPATCHER DECISION: condition 6 (SA woken 3x) technically fires, but the three SA hops were three distinct deliverables (SPEC -> TASKs -> unblock), not churn. Continuing under the human's explicit N=8; recorded here so it can be overruled.
hop 6 | FE  | did: closed FQ1 (h1 tracking rule in globals.css), re-ran TASK-001 DoD 6/6 green, TASK-001 -> REVIEW | ball_to: SA | flags: 1 low-confidence assumption (no-flash from mechanism, not a measured frame)
hop 7 | SA  | did: reviewed TASK-001 first-hand (4-file diff, 20 hex values, 0 vars lost, clean build) -> DONE; self-reported an SA-owned WCAG AA failure in the CTA token pair (SA-OWN-1) | ball_to: FE | flags: -
hop 8 | FE  | did: implemented TASK-002 (GlassPanel/AuroraBackdrop/PullQuote + Quote type + quotes.ts verified byte-identical to R5) -> REVIEW | ball_to: SA | flags: 1 low-confidence assumption (PullQuote measure/floor), FQ2 open
STOPPED hop 8/8 — condition 5 (hop budget reached)
Board: TASK-001 DONE; TASK-002 REVIEW (Sober); TASK-003 TODO unblocked; TASK-004 blocked behind SA-OWN-1 (CTA pair fails WCAG AA, Sober's own defect); TASK-005 TODO. REQ-001 Q12 + SPEC-001 SQ1-SQ3 open with the human, non-blocking.
Digest sent to human: first code landed on develop (uncommitted, 16 files); SQ1 (theme toggle leaves the header) needs an answer before TASK-003 ships; Home page itself is TASK-004, ~5-6 more hops away.

## RUN 2026-08-30-g — N=10 — started from: human answers SQ1 + Q12
hop 1 | PM  | did: closed Q12 (punctuation-only, R5 Thai FINAL) and answered SQ1 (toggle removed) as new R10 + acceptance criterion | ball_to: SA | flags: -
hop 2 | SA  | did: reviewed TASK-002 -> DONE (independent re-verify of quote strings/build/contracts), answered FQ2, recorded SQ1-SQ3 in SPEC-001, raised SA-OWN-2 (dimmed-over-aurora contrast) | ball_to: FE | flags: 1 low-confidence assumption (who deleted an untracked .zip — cosmetic)
hop 3 | FE  | did: implemented TASK-003 (shell: toggle removed, scrolled header bar, footer + eyebrow restyle) across 4 files -> REVIEW | ball_to: SA | flags: 2 low-confidence assumptions routed to SA as FQ4/FQ5; Drawer + focus ring UNVERIFIED (hidden browser pane pauses rAF)
hop 4 | SA  | did: reviewed TASK-003 -> DONE (independent re-verify), answered FQ3/FQ4/FQ5, amended SPEC-001 + TASK-004/005 (header-band luminance ceiling, drawer/focus checks 18-19) | ball_to: SA | flags: -
hop 5 | SA  | did: closed SA-OWN-1 + SA-OWN-2 with measured values and rejected alternatives; carried the fix into TASK-004 §0 -> TASK-004 UNGATED, board Blocked empty | ball_to: FE | flags: 1 low-confidence assumption (aurora composite bounds derived, not sampled — mitigated by a binding render-sampled DoD)
hop 6 | FE  | did: implemented TASK-004 (Home rebuild: hero/stats/capabilities/statement + §0 token fix + header-height token) across 15 code files; SA-OWN-1/2 measured on the render and passing | ball_to: SA | flags: BLOCKED on FQ6 (hero-top vs header-contrast geometry conflict), 1 low-confidence assumption (band full-bleed vs scrollbar)
hop 7 | SA  | did: answered FQ6/FQ7 — hero + band invert nesting to bleed full-width with zero shared-file edits; hero aurora alphas 55/62/24 -> 48/52/22 so peak luminance clears AA everywhere | ball_to: FE | flags: 2 low-confidence assumptions (composite luminance is modelled not pixel-read; alpha drop is the owner's to accept at review)
hop 8 | FE  | did: implemented TASK-004 §8 (bleed inversion + aurora alphas), seams gone, hero at viewport top, all contrast measured passing -> REVIEW | ball_to: SA | flags: FQ8 open (hero taller than fold at short viewports), 1 DoD box unticked
hop 9 | SA  | did: reviewed TASK-004 -> DONE (5 out-of-scope diffs verified, tsc/build re-run), answered FQ8 (min-height is a floor; the "===" was SA's wording defect), carried 2 look-questions to TASK-005 check 20 | ball_to: FE | flags: 2 owner look-questions (non-blocking, routed via TASK-005 -> Porter)
hop 10 | FE | did: ran the full TASK-005 acceptance sweep — 19/20 checks passed with evidence, no source file changed -> REVIEW | ball_to: SA | flags: FQ9-FQ12 for SA; check 16 NOT-RUN (needs the owner's OS reduced-motion toggle)
STOPPED hop 10/10 — condition 5 (hop budget reached)
Board: TASK-001..004 DONE, TASK-005 REVIEW (Sober). REQ-001 IN_SPEC. Nothing BLOCKED.
Digest sent to human: Home rebuilt and passing 19/20; FQ11 (display h1 leaked onto the 5 out-of-scope routes) is the one worth his call; check 16 needs his OS toggle; English quote translations still await his confirmation.

> Appended 2026-09-05 (PM housekeeping, 3rd rotation): runs 2026-09-02-a, -b, -c
> moved here VERBATIM, byte-for-byte, from `../dispatcher-state.md` (8 runs > limit 6).
> Runs 2026-09-02-d onward stay in dispatcher-state.md.

## RUN 2026-09-02-a — N=4 — started from: human answers AC1/AC2/Q4 (REQ-001 unblocked) + two new asks
hop 1 | PM  | did: recorded AC1/AC2/Q4, updated R5 to the owner's own Thai, ticked 10 of 11 acceptance criteria, issued a one-case QA confirm tick; parked the two new asks as Q14-Q17 | ball_to: QA | flags: 4 questions + 1 data request for the new work (not for REQ-001)
hop 2 | QA  | did: ran the one-case confirm tick on local — all rendered quotes character-for-character identical to R5; TEST-001 -> TEST_PASSED, 11/11 acceptance criteria ticked | ball_to: PM | flags: -
hop 3 | PM  | did: verified 11/11 AC + 5/5 tasks + TEST_PASSED first-hand and set REQ-001 to DELIVERED with a §Delivery section | ball_to: HUMAN | flags: Q14-Q17 + 1 data request; B/C/D/F/G/H carried forward
STOPPED hop 3/4 — condition 7 (ball_to HUMAN) — REQ-001 DELIVERED, every queue empty
Board: REQ-001 DELIVERED 2026-09-02, SPEC-001 DONE, TASK-001..005 DONE, TEST-001 TEST_PASSED. No work waits for SA, FE or QA.
Digest sent to human: REQ-001 closed; nothing can start until Q14-Q17 (scope + a concrete "เท่/เบียว" anchor + the real portfolio material into project-docs/).

## RUN 2026-09-02-b — N=4 — started from: human answers Q14-Q17 (hygiene FAIL -> housekeeping hop first)
hop 1 | PM  | did: housekeeping — rotated 4 runs to archive/, consolidated REQ-001 47.5KB -> 40.8KB (original archived verbatim); both FAILs cleared, gate PASS | ball_to: HUMAN | flags: -
hop 2 | PM  | did: closed Q14-Q17, opened REQ-002 (whole-site AI/robotic/IoT step-up merged with the five-route rebuild) READY_FOR_SA; held N5 content on Q20/Q21 | ball_to: SA | flags: Q18-Q21 with the human (Q18/Q19 non-blocking), 2 data requests for the portfolio content
hop 3 | SA  | did: wrote SPEC-002 (one site-wide step-up layer + five route rebuilds) from a real read of the repo; REQ-002 -> IN_SPEC | ball_to: SA | flags: SQ1-SQ6 to PM (none blocking); 1 low-confidence assumption (whether the design reads as "AI/robotic/IoT" is the owner's call)
hop 4 | SA  | did: cut TASK-006 (token/theme step-up) + TASK-007 (shared devices) from SPEC-002, corrected a z-index defect in its own spec | ball_to: FE | flags: 1 low-confidence assumption (route-aurora alphas are a starting point; the measured ceiling decides)
STOPPED hop 4/4 — condition 5 (hop budget reached)
Board: REQ-001 DELIVERED; REQ-002 IN_SPEC with SPEC-002 ACTIVE, TASK-006/007 TODO owner Fern. Q18-Q21 + SQ1-SQ6 with the human/PM, none blocking the build.
Digest sent to human: REQ-002 opened and specced (whole site, AI/robotic/IoT), build can start on a bare "ไปเลย"; N5 portfolio content still needs his real facts.

## RUN 2026-09-02-c — N=10 — started from: ไปเลย (board ball on FE)
hop 1 | FE  | did: implemented TASK-006 (5 tokens both blocks, Accordion/Modal/Input/Alert skins, TechChip pill) in 2 files; Home A/B vs pristine HEAD = 0 differences -> REVIEW | ball_to: SA | flags: FQ13 — Modal and Drawer never open on develop, pre-existing, reproduced against HEAD (contradicts QA's 2026-08-30 drawer PASS); FQ14-FQ18 look calls
hop 2 | SA  | did: reviewed TASK-006 -> DONE (re-verified diff/grep/tsc first-hand, accepted the rest on stated evidence), answered FQ14-FQ18, escalated the Modal+Drawer mount defect to Porter as SQ7 instead of inventing a fix task | ball_to: FE | flags: SQ7 needs an owner scope call; QA reproduction requested via Porter
hop 3 | FE  | did: built TASK-007's four shared devices (MachineGround, route aurora, GlassPanel node tone, RouteHero) + About pilot mount; BLOCKED on FQ19 — the lattice pushes Home's hero to L 0.05477 (4.12:1), over Sober's 0.046 ceiling | ball_to: SA | flags: 2 low-confidence assumptions about how the ceiling and the aurora alphas were meant to be read
hop 4 | SA  | did: answered FQ19 — --site-grid-line dark 0.045 -> 0.02 (ceiling not relaxed, 4 levers rejected with reasons), answered FQ20-FQ23, unblocked TASK-007 | ball_to: FE | flags: SQ8 to PM; 2 QA eye checks requested via PM; 1 low-confidence item (is the lattice still visible at the new alpha)
hop 5 | FE  | did: applied the 0.02 token and re-measured; /about + Home band clear, the two named viewports pass, but 1217x800 still breaches at L 0.04671 -> BLOCKED again on FQ24 with an alpha sweep supplied | ball_to: SA | flags: second SA<->FE bounce on the same token value; condition 6 (FE woken 3x) noted
hop 6 | SA  | did: ended the FQ24 ping-pong by changing lever not value — grid alpha back to 0.045, the two transparent aurora parents get an opaque ground, so the ceiling holds by construction; third pass is self-checking and escalates to PM, never back to SA | ball_to: FE | flags: ping-pong closed structurally; SQ9 added to PM's queue
hop 7 | FE  | did: applied the three FQ24 edits and ran the bounded third pass — D1 contributes exactly zero to all three aurora blocks at 1217/1280/360, everything under the ceiling; TASK-007 -> REVIEW with no question | ball_to: SA | flags: - (ping-pong resolved)
hop 8 | SA  | did: reviewed TASK-007's third pass against its own published gate and set it DONE; retired two of its own bad band measurements in the record | ball_to: SA | flags: SQ7/SQ8/SQ9 still with PM
hop 9 | SA  | did: cut TASK-008..011 (About+Services / Portfolio+Blog / Contact+theme follow-ups / site-wide sweep) and corrected three of its own SPEC calls against the real code | ball_to: FE | flags: SQ2's premise was wrong and corrected by SA itself; no new ordinals until PM answers
hop 10 | FE | did: implemented TASK-008 (About + Services rebuild, 12 files) with Home A/B showing zero difference; BLOCKED on FQ25 (a 4.23:1 contrast drop) + FQ26 (a TASK self-contradiction) | ball_to: SA | flags: 2 low-confidence assumptions routed to SA, not resolved
STOPPED hop 10/10 — condition 5 (hop budget reached)
Board: REQ-002 IN_SPEC; TASK-006/007 DONE, TASK-008 BLOCKED on SA, TASK-009/010/011 TODO. SQ7 (Modal/Drawer never open) is the one item needing an owner scope call.
Digest sent to human: 3 of 7 REQ-002 tasks landed; the site-wide step-up layer is live; SQ7 is a real functional defect predating this REQ.

## RUN 2026-09-02-d — N=4 — started from: human answer SQ7 (QA repro first) — hygiene FAIL, housekeeping hop first
hop 1 | PM  | did: housekeeping — shortened 2 over-long board cells to pointers, rotated runs -h/-i/-j verbatim to archive, cleared the PM inbox; gate PASS | ball_to: PM | flags: -
hop 2 | PM  | did: recorded SQ7's answered half (QA repro, ordered first), queued TEST-002 with Tanya, told SA the scope half is still open | ball_to: QA | flags: caught the dispatcher's date error again
DISPATCHER CORRECTION: today is 2026-09-03, not 09-02 (this run header is mislabelled). Porter is right; using 2026-09-03 from here on.
hop 3 | QA  | did: ran TEST-002 (SQ7 repro) — all three Modal/Drawer triggers open, paint and close on local; verdict CANNOT_REPRODUCE; found unrelated MAJOR DEF-1 (all 9 /about lightbox thumbnails render 0x0) | ball_to: PM | flags: QQ1-QQ3 for PM; Fern's FQ13 premise contradicted by an independent run
hop 4 | PM  | did: accepted CANNOT_REPRODUCE as written, granted TEST-003 (build-output round), routed DEF-1 to Sober, put 2 scope calls to the owner | ball_to: HUMAN | flags: -
STOPPED hop 4/4 — condition 5 (hop budget) + 7 (ball_to HUMAN)
Board: REQ-002 IN_SPEC; TASK-006/007 DONE, TASK-008 BLOCKED on SA (FQ25/FQ26), 009-011 TODO; TEST-002 CANNOT_REPRODUCE; DEF-1 new MAJOR with SA; TEST-003 queued for QA.
Digest sent to human: SQ7 did not reproduce (modal/drawer work); DEF-1 = 9 /about images render 0x0.

## RUN 2026-09-03-a — N=6 — started from: ไปเลย (board ball on SA)
hop 1 | SA  | did: unblocked TASK-008 (answered FQ25/FQ26/FQ27 with applicable one-liners), added a standing token rule to TASK-009/010, placed DEF-1 as TASK-012 with cause + one-line fix + provenance (predates the team, commit 7a58154) | ball_to: FE | flags: SQ10 (DEF-1 scope) with the owner; date conflict raised a third time
hop 2 | FE  | did: closed TASK-008 (one token swap; contrast 4.23 FAIL -> 7.52/5.84 PASS), re-ran the whole DoD, all boxes ticked -> REVIEW | ball_to: SA | flags: 2 stated verification limits (R4 innerText diff + Home A/B not physically re-run for a one-declaration delta)
hop 3 | SA  | did: reviewed TASK-008 -> DONE (close-out diff, A1-A5/B1-B5 and scope all verified against the real repo), decided both of Fern's FYIs without bouncing | ball_to: FE | flags: 1 low-confidence item (the .organisation contrast row is Fern's measurement, never a pixel readback)
hop 4 | FE  | did: implemented TASK-009 (Portfolio + Blog rebuild, 12 files) — R4/R6 byte-identical, H1->H3 skip fixed, D1 contributes 0 at three widths -> REVIEW | ball_to: SA | flags: FQ28 (an in-TASK contradiction Fern refused to settle silently); card look verified numerically, not by eye
hop 5 | SA  | did: reviewed TASK-009 -> DONE (scope, tsc and the client-boundary grep re-verified first-hand), answered FQ28 against its own wording, added 2 standing rules to SPEC-002 | ball_to: FE | flags: nobody has laid eyes on the rebuilt Portfolio/Blog cards — verified numerically only
hop 6 | FE  | did: implemented TASK-010 (Contact rebuild C1-C4 + theme follow-ups T1/T2, 6 files) -> REVIEW; T3 left unbuilt because Mantine's styles API rejects the nested selector | ball_to: SA | flags: FQ32 BLOCKING (T3 mechanism is Sober's to pick); FQ35 — this session's browser pane never fires rAF, a concrete mechanism for SQ7's "modal never opens"
NOTE: this hop was cut off mid-write by a session rate limit; the agent was resumed with its context and finished only the bookkeeping — no code work was redone.
STOPPED hop 6/6 — condition 5 (hop budget reached)
Board: REQ-002 IN_SPEC — TASK-006/007/008/009 DONE, 010 REVIEW, 011 TODO, 012 BLOCKED on SQ10. All five SQ8 heights now collected.
Digest sent to human: 5 of 7 REQ-002 tasks done; SQ7 likely explained as a headless-browser artefact, not a site defect.

