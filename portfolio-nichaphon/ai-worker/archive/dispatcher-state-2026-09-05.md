# Dispatcher state ARCHIVE — portfolio-nichaphon — runs dated 2026-09-05

> Rotated out of `../dispatcher-state.md` on 2026-09-05 by Porter (PM housekeeping,
> gate said `dispatcher-state.md holds 7 runs > 6`). Copied VERBATIM — not summarised,
> not edited — and `cmp`-verified byte-for-byte against the source before the live
> file was cut. Contains: RUN 2026-09-05-a. Later 2026-09-05 runs stay live.
> Appended 2026-09-13 (PM housekeeping, 8th rotation): RUN 2026-09-05-g, verbatim — the file
> now holds runs -a through -g, i.e. every 2026-09-05 run.
> Appended 2026-09-13 (PM housekeeping, 9th rotation): RUN 2026-09-05-h, verbatim — the file
> now holds runs -a through -h.

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

## RUN 2026-09-05-d — N=4 — started from: human says /portfolio still shows nothing + "I wrote all of these myself" (hygiene FAIL, housekeeping folded into hop 1)
hop 1 | PM  | did: cleared both hygiene FAILs (rotated 2 runs, consolidated REQ-002 49.3->42.5KB, each archived verbatim and cmp-verified first) and recorded the third handover in REQ-003, filing the new sentence as Q27 instead of resolving it | ball_to: HUMAN | flags: /portfolio gap fully explained — no role has ever changed site content and nobody has read the 4 repos
STOPPED hop 1/4 — condition 7 (ball_to HUMAN) + 2 (data request)
Board: REQ-001 + REQ-002 DELIVERED. REQ-003 DRAFT-BLOCKED on Q20/Q21/Q22/Q27 — Q27 decides whether the next hop is a repo survey or just placing his own text.
Digest sent to human: the /portfolio gap is expected, not a bug; one reply block answers everything.


## RUN 2026-09-05-e — N=8 — started from: human answers Q27/Q20/Q21/Q22 — REQ-003 unblocked
hop 1 | PM  | did: recorded Q20/Q21/Q22/Q27 verbatim, added R7 (every drafted line needs the owner's approval) + R9 (an unsourced field stays empty), and moved REQ-003 DRAFT-BLOCKED -> READY_FOR_SA | ball_to: SA | flags: Q22-b/Q28/Q29 non-blocking with written defaults; reading the 4 repos is now sanctioned read-only
hop 2 | SA  | did: took REQ-003 to IN_SPEC and wrote SPEC-003 (content-only — two objects in projects.ts, no component or CSS), split at the R7 approval gate into TASK-016 (draft pack, cited per line) and TASK-017 (place approved text verbatim, BLOCKED) | ball_to: FE | flags: SQ14 (no screenshots ship — no image slot exists), SQ15 ("Nine projects" numeral), SQ16 (ordering + name tie-break)
hop 3 | FE  | did: read the 4 pinned repos read-only in scratch + the 2 public sites, wrote the fully-cited DRAFT-001 pack, touched no code -> REVIEW | ball_to: SA | flags: all 4 SHAs matched the pinned table; zero uncited lines; zero dates/clients/metrics; FQ44-FQ46 for SA
hop 4 | SA  | did: reviewed TASK-016 -> DONE with its own re-verification (10/10 cited lines spot-checked at 2 re-cloned pinned SHAs), answered FQ44-FQ46 so only 1 of 3 reaches the owner, reduced his decisions to a 4-line approval sheet with a default on every pick | ball_to: PM | flags: 1 low-confidence item — 2 of the 4 repos were not re-cloned, sampling declared
hop 5 | PM  | did: relayed the REQ-003 draft pack to the owner at the R7 gate with the full drafted strings verbatim, recorded an explicitly EMPTY approval record in REQ-003 | ball_to: HUMAN | flags: 4 decisions, 3 of them a tick; TASK-017 stays BLOCKED and AC-g unticked until the owner's words are written in
STOPPED hop 5/8 — condition 7 (ball_to HUMAN) — the R7 approval gate is the owner's by design
Board: REQ-001 + REQ-002 DELIVERED; REQ-003 IN_SPEC with SPEC-003 ACTIVE, TASK-016 DONE, TASK-017 BLOCKED on the owner's approval.
Digest sent to human: the full drafted text for both entries, 4 decisions.

## RUN 2026-09-05-f — N=4 — started from: owner approval of the REQ-003 draft pack
hop 1 | PM  | did: cleared 2 hygiene FAILs (2 runs rotated + 4 board cells shortened, all archived verbatim and verified first) and recorded the owner's verbatim "อนุมัติ" as the R7 approval record; AC-g ticked, TASK-017 unblocked on the board | ball_to: SA | flags: approved text is cited to DRAFT-001 rather than re-typed, so no second copy can drift
hop 2 | SA  | did: re-checked the R7 record and both target files on disk, moved TASK-017 BLOCKED -> TODO with 5 pack-to-code mapping rulings so Fern needs no round-trip | ball_to: FE | flags: SQ17 — the repo is now checked out on branch D1 (not develop) with TASK-013/014/015 committed as c152314; branch choice is the owner's, so Fern edits the checked-out tree and switches nothing
hop 3 | FE  | did: placed the two owner-approved entries in projects.ts (+52/-0, now 11) and changed the intro numeral to "Eleven"; 18/18 approved strings verified verbatim, tsc 0, build 0, 11 cards + both modals + both live links checked on the served build | ball_to: SA | flags: no screenshot of an open modal (same harness limit as SQ7/FQ35), declared not claimed; branch found = D1, zero git writes
hop 4 | SA  | did: reviewed TASK-017 -> DONE by re-deriving every approved string from DRAFT-001 with its own parser and comparing against the evaluated module — 24/24 character-exact, 0 diffs; SPEC-003 DONE, REQ-003 SPEC_DONE | ball_to: PM | flags: modal pixels still uncaptured (a QA leg); SQ17 (branch D1) still the owner's
STOPPED hop 4/4 — condition 5 (hop budget reached)
Board: REQ-001 + REQ-002 DELIVERED; REQ-003 SPEC_DONE — the two projects are in the code, awaiting Porter's acceptance + a QA look.
Digest sent to human: his two projects are on /portfolio, text character-identical to what he approved.


## RUN 2026-09-05-g — N=4 — started from: ไปเลย (hygiene FAIL, housekeeping folded into hop 1)
hop 1 | PM  | did: fixed the one hygiene FAIL and wrote the REQ-003 acceptance pass — 7/8 ticked, AC-d deliberately held open because the live-project link renders inside a modal only the engineer has ever seen | ball_to: QA | flags: requested exactly one picture-capturing round, and named what it did NOT ask for
hop 2 | QA  | did: ran TEST-006 on a fresh local production build and CAPTURED /portfolio + both new modals as pictures at 1280 and 360, reading each live-project href off the DOM — TEST_PASSED 10/10, 0 defects | ball_to: PM | flags: QQ11 (the 2 files are now committed at ca5c097 on D1 — SQ17's premise moved), QQ12 (OBS-8)
hop 3 | PM  | did: ticked AC-d on TEST-006 and set REQ-003 DELIVERED (8/8); answered QQ11 (ca5c097 is on develop and origin/develop, so SQ17's premise is settled) and QQ12; archived REQ-003 verbatim before consolidating it to clear the gate | ball_to: HUMAN | flags: REQ-003 sits ~150 bytes under the 45KB cap — the next writer must consolidate first
STOPPED hop 3/4 — condition 7 (ball_to HUMAN) — all three REQs are DELIVERED and no role has work waiting
Board: REQ-001, REQ-002, REQ-003 all DELIVERED. Nothing queued for PM, SA, FE or QA. Everything open is the owner's: sign-off, the deploy call, and the non-blocking carries.
Digest sent to human: his two projects are live on /portfolio with pictures; the whole engagement is now waiting on him.

## RUN 2026-09-05-h — N=4 — started from: human answers OBS-8 (raise the button) + Q28 (keep the nine)
hop 1 | PM  | did: turned OBS-8 into REQ-004 (READY_FOR_SA — the live-link button must be visible without scrolling on phones) and closed Q28 as the owner's word, not a team default | ball_to: SA | flags: Q30/Q31/Q32 non-blocking with written defaults; REQ-003 is 53 bytes under the 45KB cap and must be consolidated before any further write
hop 2 | SA  | did: specced REQ-004 and cut TASK-018 in one unit — a one-CSS-rule sticky footer, mechanism already proven by the same modal's sticky header; closed SQ17 | ball_to: FE | flags: SQ18 (the real scope is 7 modals, not 11 — four entries have no link), SQ19 (the pinned bar covers ~85px of phone reading area), SQ20
hop 3 | FE  | did: implemented TASK-018 — pinned the modal footer (1 file, +15/-0); 7/7 linked buttons visible with zero scrolling at 360x740, desktop scrollHeight byte-identical, tsc 0, build 0 -> REVIEW | ball_to: SA | flags: FQ47 (spacing-lg is 24px not 20 — design unaffected because SA specified the token), FQ48 (5 of 7 actually moved; 2 never overflowed)
hop 4 | SA  | did: reviewed TASK-018 -> DONE (scope, tsc, build and the BUILT css re-verified first-hand), corrected its own SPEC arithmetic from FQ47, raised SQ21; SPEC-004 DONE, REQ-004 SPEC_DONE | ball_to: PM | flags: every AC still unticked — they ask to be SEEN, and an implementer's own numbers never tick a "seen" AC
STOPPED hop 4/4 — condition 5 (hop budget reached)
Board: REQ-001/002/003 DELIVERED, REQ-004 SPEC_DONE awaiting Porter's acceptance + one QA picture round.
Digest sent to human: the phone button is fixed and measured; the picture round is one hop away.
