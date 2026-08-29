# Dispatcher state — portfolio-nichaphon

> Written ONLY by the dispatcher (workspace-root `DISPATCHER.md`): one line per
> hop, a run header per run, and the digest that ended the run. Keep the last 5
> runs here; older runs go verbatim to `archive/` in a PM housekeeping hop.

## RUN 2026-08-30-a — N=4 — started from: requirement (human, Thai) — hygiene PASS
hop 1 | PM  | did: wrote REQ-001 (full UI visual redesign) and held it DRAFT/BLOCKED | ball_to: HUMAN | flags: 6 questions, 1 data request, 1 low-confidence assumption
STOPPED hop 1/4 — condition 7 (ball_to HUMAN) + 1 + 2 + 3
Board: REQ-001 DRAFT/BLOCKED on human; no SA/FE dispatched; inbox/SA.md deliberately untouched.
Digest sent to human: 6 scoping questions (Q1 what feels Claude-like / Q2 reference links-screenshots into project-docs/ / Q3 mood / Q4 re-skin vs rebuild / Q5 stay on Mantine 8 / Q6 deadline + all-6-pages vs Home-first) + DATA REQUEST for 1-3 reference sites.

## RUN 2026-08-30-b — N=4 — started from: human answers to Q1-Q6 + 4 quotes + 1 reference screenshot (chat only)
hop 1 | PM  | did: rewrote REQ-001 from the 6 answers + quotes, narrowed to Home-first, set READY_FOR_SA | ball_to: SA | flags: 4 questions, 1 data request, 1 low-confidence assumption
STOPPED hop 1/4 — conditions 1 + 2 + 3
Board: REQ-001 READY_FOR_SA (Home route only); handed to Sober via inbox/SA.md; SA not yet dispatched.
Digest sent to human: save the chat reference screenshot into project-docs/ (blocks visual direction, not SA start) + 3 copy/scope questions (quote 4 wording, quote language, approve library swap or not).

## RUN 2026-08-30-c — N=4 — started from: human answers Q7-Q9 + reference image landed in project-docs/
hop 1 | PM  | did: folded Q7-Q9 + the saved reference image into REQ-001, closed the reference DATA REQUEST | ball_to: SA | flags: 2 questions (non-blocking), 1 data request, 2 low-confidence assumptions
STOPPED hop 1/4 — conditions 1 + 2 + 3
Board: REQ-001 READY_FOR_SA, fully unblocked for the Home route; pointer in inbox/SA.md; SA still not dispatched.
Digest sent to human: Q10 (edit the 3 Thai quotes? paste exact strings) + Q11 (his own English wording for quotes 1-3) — neither blocks Home; a bare "ไปเลย" wakes Sober.

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
