# Dispatcher state ARCHIVE — portfolio-nichaphon — runs dated 2026-09-05

> Rotated out of `../dispatcher-state.md` on 2026-09-05 by Porter (PM housekeeping,
> gate said `dispatcher-state.md holds 7 runs > 6`). Copied VERBATIM — not summarised,
> not edited — and `cmp`-verified byte-for-byte against the source before the live
> file was cut. Contains: RUN 2026-09-05-a. Later 2026-09-05 runs stay live.

## RUN 2026-09-05-a — N=6 — started from: N=6 (board ball on PM, REQ-002 acceptance round)
hop 1 | PM  | did: ran the REQ-002 acceptance pass — 8 criteria adjudicated (1 ticked, 3 with the owner, 2 evidence gaps, 2 partial), requested TEST-004 from Tanya | ball_to: HUMAN | flags: 8 owner decisions; AC2 is the one only he can make
hop 2 | PM  | did: opened N5 as REQ-003 (portfolio content refresh) DRAFT-BLOCKED after the owner re-raised it; recorded that the re-sent repos are material, not an answer to Q21; added Q22 as a DATA REQUEST | ball_to: HUMAN | flags: Q20/Q21/Q22 + REQ-002 AC2 with the owner; nobody has cloned the 4 repos
hop 3 | QA  | did: ran TEST-004 (REQ-002 acceptance) in headed Chrome with real scrolling and real Tab — TEST_FAILED; DEF-1 CLOSED on painted evidence, AC6 passes (0 hits in 96+96 checks), all 7 SQ8 eyes answered positive, SQ12 settled in Sober's favour; 58 screenshots | ball_to: PM | flags: DEF-2 (Home mobile CTA sliced by the fold) + DEF-3 (/services table unusable at 360), both MAJOR; QQ4-QQ7
hop 4 | PM  | did: processed TEST-004's TEST_FAILED intake — accepted the verdict unchanged, ticked AC6, closed DEF-1, recorded DEF-2/DEF-3 with no cause named, answered QQ4-QQ7, opened Q23/Q24/Q25 | ball_to: HUMAN | flags: 7 owner decisions; Q23/Q24 + AC2/AC5/AC7 gate REQ-002 DELIVERED
STOPPED hop 4/6 — condition 7 (ball_to HUMAN) + 1
Board: REQ-002 SPEC_DONE, acceptance 2 of 8; DEF-1 CLOSED; DEF-2/DEF-3 open awaiting the owner's scope call. REQ-003 DRAFT-BLOCKED on Q20/Q21/Q22. TEST-003 is Tanya's next unit.
Digest sent to human: 58 screenshots delivered incl. all 6 routes desktop+mobile; DEF-1 proven fixed on painted evidence; two mobile defects need his call.

## RUN 2026-09-05-b — N=8 — started from: human answers AC2/Q23/Q24/AC5/AC7 — hygiene FAIL, housekeeping first
hop 1 | PM  | did: cleared 3 hygiene FAILs (runs + REQ-001 archived verbatim and diff-verified before compacting) and recorded the owner's 5 answers — AC2 + AC5 ticked, Q19/Q23/Q24 closed; REQ-002 now 5 of 8 | ball_to: SA | flags: AC1's tick is PM's inference from AC2, declared as overrulable; AC7 not ticked until QA has SEEN the 5 routes
hop 2 | SA  | did: placed DEF-2 / DEF-3 / the AC7 toggle removal as TASK-013/014/015 — disjoint, dependency-free, affordance shape and mobile-only scope decided up front so Fern need not ask | ball_to: FE | flags: SA narrowed DEF-2's cause without naming one (source read, not a rendered A/B); TASK-015 does NOT tick AC7 and says so
hop 3 | FE  | did: implemented TASK-013 (DEF-2) — mobile-only media block reclaims 118px against an 85px budget; found the real mechanism (QA renders at clientWidth 345, not 360, because of a classic scrollbar); desktop proved unchanged by a running-server A/B -> REVIEW | ball_to: SA | flags: FQ39 (mobile lead type now 17px/1.55) non-blocking; the +12px offset vs QA's table stays unexplained and is declared
hop 4 | FE  | did: built TASK-014 (DEF-3) — always-present 8px scrollbar + self-hiding right-edge glow, CSS only, ServicesTable.tsx byte-unchanged; reproduced QA's 303/887 geometry exactly -> REVIEW | ball_to: SA | flags: FQ40 (glass border painted twice) needs a ruling; arrow-key scrolling UNVERIFIED (harness delivers no key events)
hop 5 | FE  | did: implemented TASK-015 (deleted the dead ColorSchemeToggle + its barrel line), measured a before/after production build -> REVIEW | ball_to: SA | flags: SQ11's named lead FALSIFIED — removing the only client member of the ui barrel moved First Load JS by <=1 kB, not ~123 kB; FQ42/FQ43 open
hop 6 | SA  | did: reviewed TASK-013/014/015 as one unit -> all DONE (scope, 3 diffs, 4 greps and tsc re-run first-hand); answered FQ39-FQ43, ruled the token-composition rule into SPEC-002, struck SQ11's lead as falsified, raised SQ13 | ball_to: PM | flags: 2 low-confidence carries routed to QA as desktop eyes rather than ticked
hop 7 | PM  | did: requested TEST-005 (the closing QA round on REQ-002: H8/AC3, S14, the five-route AC7 look, /services at 1280, arrow keys) with the full brief in REQ-002 + inbox/QA.md | ball_to: QA | flags: corrected the dispatcher — REQ-002 is TWO QA rounds from DELIVERED, not one; AC8's open half is TEST-003
hop 8 | QA  | did: ran TEST-005 (REQ-002 closing round) — TEST_PASSED 5/5, 0 new defects; AC3 + AC7 tick, DEF-2 and DEF-3 both CLOSED, both TASK-014 carries settled; 33 screenshots | ball_to: PM | flags: QQ8/QQ9 for PM; REQ-002 now 7 of 8 AC
STOPPED hop 8/8 — condition 5 (hop budget reached)
Board: REQ-002 7 of 8 AC — only AC8's build half (S11 = TEST-003) remains, and it is Tanya's next unit. TASK-013/014/015 DONE. REQ-003 still DRAFT-BLOCKED on Q20/Q21/Q22.
Digest sent to human: both mobile defects fixed and verified by eye; one QA round from DELIVERED.

## RUN 2026-09-05-c — N=4 — started from: ไปเลย — hygiene FAIL, housekeeping first
hop 1 | PM  | did: housekeeping — shortened the 2 over-long board cells after verifying the content lives in TASK-014 and SPEC-002; answered QQ8/QQ9; gate PASS | ball_to: QA | flags: refused to close H5 by capturing a baseline, because that would silently make the owner's Q25 decision for him
hop 2 | QA  | did: ran TEST-003 (production-build round) — TEST_PASSED 13/13, 0 defects; S11 passes = AC8's open half, all 3 SQ7 triggers open on the built output, S13 holds, 12/12 loads console-clean | ball_to: PM | flags: QQ10 (next.config sets output:standalone but the grant named npm run start — ran both, they agree); REQ-002 has zero open QA work
hop 3 | PM  | did: ran the REQ-002 delivery pass — ticked AC3 + AC7 (TEST-005) and AC8 (TEST-003) on cited evidence, set REQ-002 DELIVERED at 8/8 with every carry listed as still open | ball_to: HUMAN | flags: 8 owner items; Q26 new (which surface the droplet serves)
STOPPED hop 3/4 — condition 7 (ball_to HUMAN)
Board: REQ-001 and REQ-002 both DELIVERED. No work waits for PM, SA, FE or QA. REQ-003 (portfolio content) is DRAFT-BLOCKED on Q20/Q21/Q22 — the only remaining front, and it is the owner's.
Digest sent to human: REQ-002 closed 8/8; the whole site rebuild is done; REQ-003 is now the only thing left and it needs his facts.
