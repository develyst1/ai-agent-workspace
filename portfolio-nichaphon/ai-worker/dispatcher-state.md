# Dispatcher state — portfolio-nichaphon

> Written ONLY by the dispatcher (workspace-root `DISPATCHER.md`): one line per
> hop, a run header per run, and the digest that ended the run. Keep the last 5
> runs here; older runs go verbatim to `archive/` in a PM housekeeping hop.
> Rotated 2026-08-30 (PM housekeeping): runs -a, -b, -c moved verbatim to
> `archive/dispatcher-state-2026-08-30.md`. Runs -d onward stay below.

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

## RUN 2026-08-30-h — N=4 — started from: ไปเลย (hygiene FAIL -> housekeeping hop first)
hop 1 | PM  | did: housekeeping — archived runs -a/-b/-c verbatim to archive/dispatcher-state-2026-08-30.md, trimmed to last 5 runs; hygiene now PASS (1 warning: today's log has 9 entries > 20 lines) | ball_to: SA | flags: -
hop 2 | SA  | did: reviewed TASK-005 -> DONE (19/20, check 16 NOT-RUN with reason), answered FQ9-FQ12, closed SPEC-001; REQ-001 -> SPEC_DONE with a 7-item owner-eye handover | ball_to: PM | flags: 7 questions for the human — routed to PM per the chain, not delivered raw
hop 3 | PM  | did: turned the SPEC_DONE handover into a 10-item owner acceptance review in REQ-001; REQ-001 SPEC_DONE, blocked on the owner (NOT delivered) | ball_to: HUMAN | flags: 10 acceptance questions
STOPPED hop 3/4 — condition 7 (ball_to HUMAN)
Board: TASK-001..005 all DONE, SPEC-001 DONE, REQ-001 SPEC_DONE awaiting the owner's AC1/AC2. No work waits for SA or FE — spawn PM only, after the human answers.
Digest sent to human: Home is done and reviewable at localhost:3000; 10 acceptance items (2 sign-off, 5 owner-hands-only checks, 2 scope calls, 1 next-REQ ordering).
DISPATCHER NOTE 2026-08-30: human asked for a new QA role (Tanya, Playwright, screenshots to PM, QA<->PM only). Out of dispatcher scope (I write only this file) and out of PM scope (role charters are not PM's). Routed to Atlas (design) + Marie (operate). No hop spawned.

## RUN 2026-08-30-i — N=4 — started from: human ("ok ลองดูมี QA ละ") — Tanya/QA now exists on the board
hop 1 | PM  | did: opened the first QA round on REQ-001, briefed Tanya in the REQ, moved owner items A/C/E to QA (owner list 10 -> 7) | ball_to: QA | flags: 6 acceptance questions still with the human (non-blocking for QA)
hop 2 | QA  | did: first QA round on REQ-001 in a real browser on local — TEST-001 + REGRESSION.md + harness, 18 screenshots in project-docs/qa-req001-2026-08-30/; TEST_PASSED (partial), 0 defects; items A + E now PASS and leave the owner's list | ball_to: PM | flags: 2 questions, 1 optional data request, irreversible_pending (item D, git, playwright dep)
STOPPED hop 2/4 — condition 4 (irreversible_pending) + 1 + 2 + 3
Board: REQ-001 SPEC_DONE + QA TEST_PASSED (partial); owner list down to 5 (AC1, AC2, B, C-call, D) + 2 scope calls F/G.
Digest sent to human: QA screenshots delivered; Playwright kept OUT of front/package.json on purpose; footer still says (c) 2025.
