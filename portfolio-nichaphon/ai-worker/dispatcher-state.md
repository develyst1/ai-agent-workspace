# Dispatcher state — portfolio-nichaphon

> Written ONLY by the dispatcher (workspace-root `DISPATCHER.md`): one line per
> hop, a run header per run, and the digest that ended the run. Keep the last 5
> runs here; older runs go verbatim to `archive/` in a PM housekeeping hop.
> Rotated 2026-08-30 (PM housekeeping): runs -a, -b, -c moved verbatim to
> `archive/dispatcher-state-2026-08-30.md`.
> Rotated 2026-09-02 (PM housekeeping): runs -d, -e, -f, -g moved verbatim to
> `archive/dispatcher-state-2026-09-02.md`.
> Rotated 2026-09-02 (PM housekeeping, 2nd): runs 2026-08-30-h, -i, -j appended
> verbatim to `archive/dispatcher-state-2026-08-30.md`.
> Rotated 2026-09-05 (PM housekeeping, 3rd): runs 2026-09-02-a, -b, -c appended
> verbatim to `archive/dispatcher-state-2026-09-02.md`.
> Rotated 2026-09-05 (PM housekeeping, 4th — gate said 7 runs > limit 6): runs
> **2026-09-02-d** and **2026-09-03-a** appended verbatim to the same archive file and
> `cmp`-verified byte-for-byte BEFORE this file was cut.
> Rotated 2026-09-05 (PM housekeeping, 5th — gate said 7 runs > limit 6 again): run
> **2026-09-04-a** → `archive/dispatcher-state-2026-09-04.md` (new file) and run
> **2026-09-05-a** → `archive/dispatcher-state-2026-09-05.md` (new file), both copied
> verbatim and `diff`-verified identical BEFORE this file was cut. Runs 2026-09-05-b
> onward stay below (5 runs — the "last 5" this header asks for, one under the limit).
> Rotated 2026-09-05 (PM housekeeping, 6th — gate said 8 runs > limit 6): runs
> **2026-09-05-b** and **2026-09-05-c** appended verbatim to
> `archive/dispatcher-state-2026-09-05.md` and string-verified present BEFORE this
> file was cut. Runs 2026-09-05-d onward stay below (6 runs — at the limit).
> Rotated 2026-09-09 (PM housekeeping, 6th — gate said 7 runs > limit 6 after the new
> intake run opened): run **2026-09-05-d** appended verbatim to
> `archive/dispatcher-state-2026-09-05.md` and `diff`-verified identical BEFORE this file
> was cut. Runs 2026-09-05-e onward stay below (6 runs — at the limit).
> Rotated 2026-09-13 (PM housekeeping, 7th — gate said 8 runs > limit 6 after run
> 2026-09-13-a opened): runs **2026-09-05-e** and **2026-09-05-f** appended verbatim to
> `archive/dispatcher-state-2026-09-05.md` and `diff`-verified identical BEFORE this file
> was cut. Runs 2026-09-05-g onward stay below (6 runs — at the limit).
> Rotated 2026-09-13 (PM housekeeping, 8th — gate said 7 runs > limit 6 after run
> 2026-09-13-b opened): run **2026-09-05-g** appended verbatim to
> `archive/dispatcher-state-2026-09-05.md` and string-verified present BEFORE this file
> was cut. Runs 2026-09-05-h onward stay below (6 runs — at the limit).
> Rotated 2026-09-13 (PM housekeeping, 9th — gate said 7 runs > limit 6 after run
> 2026-09-13-c opened): run **2026-09-05-h** appended verbatim to
> `archive/dispatcher-state-2026-09-05.md` and string-verified present BEFORE this file
> was cut. Runs 2026-09-05-i onward stay below (6 runs — at the limit).

## RUN 2026-09-05-i — N=4 — started from: ไปเลย (hygiene FAIL, housekeeping folded into hop 1)
hop 1 | PM  | did: cleared both hygiene FAILs by sweeping 33 closed board rows + 2 runs into verified verbatim archives (board 22.4 -> 13.6KB) and ran the REQ-004 acceptance pass — AC-e/AC-f ticked on the diff, 5 held for pictures, TEST-007 requested | ball_to: QA | flags: re-homed 2 facts that lived only in swept cells before cutting
hop 2 | QA  | did: ran TEST-007 on the SERVED production build (built CSS verified to carry the six sticky properties first) — TEST_PASSED 12/12, 0 defects; all 11 modals captured at 360x740 at scrollTop 0, the pinned bar measured at exactly 89px = 13.4% of the scrollport | ball_to: PM | flags: OBS-9 — at open the bar hides the ENTIRE "What it does" list on the two entries the owner approved word-for-word; QA judges no look, that is his
hop 3 | PM  | did: ticked AC-a/b/c/d/g on TEST-007 and set REQ-004 DELIVERED (7/7); answered QQ13 (OBS-9 rides with the SQ19 pictures as one question) | ball_to: HUMAN | flags: recorded plainly that the fix moved 5 of 7, not 7 of 7
STOPPED hop 3/4 — condition 7 (ball_to HUMAN) — all four REQs DELIVERED, every team role idle
Board: REQ-001/002/003/004 all DELIVERED. Nothing queued for PM, SA, FE or QA. Every open row is a non-blocking carry addressed to the owner.
Digest sent to human: REQ-004 closed with pictures; the only real question left is whether the 89px pinned bar is acceptable.

## RUN 2026-09-09-a — N=4 — started from: new requirement (resume -> MD, Bun/Hono back/, LLM-gateway-backed AI Q&A on Home)
hop 1 | PM  | did: intake of the new requirement — secured both resume files into project-docs and transcribed the PNG (references withheld), read the gateway's CLAUDE.md + Bruno contract WITHOUT firing a call, opened REQ-005 (profile MD + 8 site/resume conflicts), REQ-006 (back/ Bun+Hono gateway client) and REQ-007 (Home ask-AI with ideas A-I) | ball_to: HUMAN | flags: 9 blocking questions; the gateway's Bruno collection declares auth:none on every request
STOPPED hop 1/4 — condition 7 (ball_to HUMAN) + 1 + 2
Board: REQ-001..004 DELIVERED; REQ-005/006/007 all DRAFT-BLOCKED on the owner. No team role has work waiting.
Digest sent to human: the three REQs, the ideas table, the 8 resume-vs-site conflicts, and the auth:none cost exposure.

## RUN 2026-09-09-b — N=8 — started from: human answers Q33-Q45 — REQ-005/006/007 unblocked
hop 1 | PM  | did: recorded the 9 answers as §Owner decisions in REQ-005/006/007, resolved C1-C8 under "resume base", and moved all three to READY_FOR_SA | ball_to: SA | flags: surfaced 2 collisions inside the owner's own answers rather than resolving them (idea H vs no-cap; Q45 omitting F vs Q39's language default); noted 5 calls covers REQ-006 only
hop 2 | SA  | did: took REQ-005 to IN_SPEC — SPEC-005 + TASK-019/020 (TODO, Fern) + TASK-021 (BLOCKED on one owner approval) | ball_to: FE | flags: grepped the tree and found the REQ undercounted conflict C1 — it is 5 strings not 2, including visible homepage copy and 2 indexed metadata descriptions
hop 3 | FE  | did: applied all 10 decided resume-fact corrections (10 insertions / 10 deletions across 4 files), tsc 0, build 0 before and after -> REVIEW | ball_to: SA | flags: FQ32 — an 11th string ("Three years of shipping...") now contradicts the new "4 Years"; left untouched deliberately. Also logged a self-caught mistake: wrongly "fixed" CRLF->LF then restored it
hop 4 | SA  | did: reviewed TASK-019 -> DONE (diff, 4 greps, tsc, build and CRLF re-verified by bytes; closed Fern's photo gap by reading the BUILT html), routed FQ32 as C9 into TASK-020's approval sheet instead of a second owner hop | ball_to: FE | flags: 0 of the owner's 5 gateway calls spent; branches have diverged (D1=6c17609, develop=ca5c097)
hop 5 | FE  | did: wrote DRAFT-002 profile pack (395 lines: full PROFILE.md body + 66-row citation file + 9 skill items + C5/C8/C9 + a 5-line approval sheet), zero code touched -> REVIEW | ball_to: SA | flags: FQ35 — 6 body claims have a site citation but NO resume backing, listed together rather than dropped silently, because the REQ-007 AI would repeat them as fact
hop 6 | SA  | did: reviewed TASK-020 -> REWORK — the pack is sound but its approval sheet said 6 resume-unbacked claims when the citation table shows 22, incl. 4 certificates and a claim about a named third-party company; struck one unsourced identity inference; answered FQ33/34/35 | ball_to: FE | flags: ruled KEEP all 22 and make them visible — deleting his own published copy would be the team editing his life
hop 7 | FE  | did: applied all 3 rework fixes in DRAFT-002 — 22 of 66 rows flagged by a mechanical rule (0 mismatch either way), the unsourced bridge struck, sheet grown to 6 lines -> REVIEW | ball_to: SA | flags: corrected SA's arithmetic (17 newly flagged, not 16); FQ36 — striking the bridge may now imply two separate CRM projects, which no source states either
hop 8 | SA  | did: re-reviewed the rework with its own independent scan (22/22 flagged, 0 either way) and set TASK-020 DONE — the REQ-005 approval pack is ready for the owner; answered FQ36 as SQ29 instead of a third pass | ball_to: PM | flags: corrected two of its own numbers on the record (Fern's 17 was right, its own 73-row parse was wrong)
STOPPED hop 8/8 — condition 5 (hop budget reached)
Board: REQ-005 IN_SPEC (TASK-019 + TASK-020 DONE, TASK-021 BLOCKED on the owner's approval); REQ-006 and REQ-007 still READY_FOR_SA and untouched. 0 of the owner's 5 gateway calls spent.
Digest sent to human: 10 resume corrections are live in the code; the profile pack needs his approval; the gateway/AI work has not started.

## RUN 2026-09-13-a — N=10 — started from: ไปเลย (hygiene FAIL, housekeeping folded into hop 1; REQ-006 leg next)
hop 1 | PM  | did: cleared both hygiene FAILs (2 runs rotated, 7 board cells shortened, stale git row closed against a fresh read — D1=1dcc9b8, develop=ca5c097), gate PASS; put the REQ-005 6-line approval sheet to the owner with every proposed string | ball_to: HUMAN | flags: sheet blocks only TASK-021; REQ-006 is independent
DISPATCHER DECISION: the approval sheet is carried to the end-of-run digest; continuing on the independent REQ-006 leg under the owner's N=10.
hop 2 | SA  | did: consumed the REQ-006 leg — fired and recorded 2/5 real gateway calls (production is v1.1.0 vs the readable v1.0.0 checkout; POST /chat answered from deepseek-flash, a model in neither catalogue), wrote SPEC-006 + TASK-022 (scaffold, no call) + TASK-023 (the one paid call, gated) | ball_to: FE | flags: SQ31 — does a provider-free GET count against the 5? counted conservatively
hop 3 | FE  | did: scaffolded back/ (Bun + Hono, 13 files: config, typed failure classifier, askGateway, /health + /ask, six-mode stub, 18 tests pass) with ZERO real calls -> REVIEW | ball_to: SA | flags: ledger still 2/5; FQ37/FQ38 non-blocking
hop 4 | SA  | did: reviewed TASK-022 -> DONE (re-ran every DoD check with the URL pinned to a dead port, 18/18, own stub round-trip), answered FQ37 as TASK-023 step 0 and FQ38, unblocked TASK-023 | ball_to: FE | flags: ledger 2/5; TASK-023 will spend call #3 through back/
hop 5 | FE  | did: TASK-023 — step 0 trim->400 (18/18), ledger row 3 appended BEFORE firing, one real call through back/ -> 200 deepseek/deepseek-flash 19 tokens 568ms; ledger 3/5; AC-d greps empty -> REVIEW | ball_to: SA | flags: no retry, exactly one call
hop 6 | SA  | did: reviewed TASK-023 -> DONE (every DoD line re-run on a dead-port gateway, zero real calls), closed SPEC-006 DONE, REQ-006 -> SPEC_DONE | ball_to: PM (acceptance) / SA (REQ-007 leg next) | flags: ledger 3/5, rows 4-5 left to the owner
hop 7 | SA  | did: consumed the REQ-007 leg — SPEC-007 ACTIVE (understand->match->answer chain, one askGateway per step, over a real Bun WebSocket; code-verified citations; off-topic stops after step 1; nothing stored) + TASK-024/025/026 TODO stub-only + TASK-027 BLOCKED on Q49 | ball_to: FE | flags: 0 real calls; SQ34-SQ37 to PM
hop 8 | FE  | did: built TASK-024 on the stub — knowledge loader, generated PROJECTS.md from projects.ts (11 sections), the transport-free 3-step chain with code-built verbatim citations, fictional fixture profile, step-aware stub; 31/31 tests, tsc 0, zero real calls -> REVIEW | ball_to: SA | flags: FQ40 (CRLF drift on non-Windows), FQ41
hop 9 | SA  | did: reviewed TASK-024 -> DONE (every DoD line re-run on a dead-port/stub gateway, 31/31, generator idempotent by sha256), answered FQ40 as a 2-line EOL-agnostic test fix in TASK-025 step 0, unblocked TASK-025 | ball_to: FE | flags: 0 real calls
hop 10 | FE | did: built TASK-025 — a real GET /ws WebSocket over the chain (createBunWebSocket on the same Bun.serve, per-socket abort, close mid-chain cancels the in-flight fetch), 11 real-socket tests, ws-client CLI; 42/42, tsc 0, zero real calls -> REVIEW | ball_to: SA | flags: FQ42 (no done frame after busy/bad_request) for SA to flip if wanted
STOPPED hop 10/10 — condition 5 (hop budget reached)
Board: REQ-005 IN_SPEC (TASK-021 BLOCKED on the owner's approval sheet); REQ-006 SPEC_DONE awaiting PM acceptance; REQ-007 IN_SPEC — TASK-024 DONE, TASK-025 REVIEW, TASK-026 TODO gated, TASK-027 BLOCKED on Q49. Ledger 3/5 (REQ-006) + 0/? (REQ-007).
Digest sent to human: the REQ-005 approval sheet (carried from hop 1), back/ built end to end incl. the real WebSocket, Q49 needed before any real chain run.

## RUN 2026-09-13-b — N=10 — started from: owner approval of the REQ-005 sheet + Q49=30 (hygiene FAIL, housekeeping folded into hop 1)
hop 1 | PM  | did: cleared 2 hygiene FAILs, recorded the REQ-005 sheet answers verbatim + resolved (SQ29 = two projects), Q49=30 into REQ-007, delivered REQ-006 6/6 (own read-only re-checks, no QA round by PM decision) | ball_to: SA | flags: REQ-006 DELIVERED
hop 2 | SA  | did: reviewed TASK-025 -> DONE (42/42 on a dead-port pin, own stub run of all 9 frames, FQ42 accepted), opened the SPEC-007 ledger at 0/30, lifted TASK-021 to TODO with the owner's values pasted | ball_to: FE | flags: TASK-021 first, then TASK-026; both zero-call
hop 3 | FE  | did: placed TASK-021 — PROFILE.md + citations diff-identical to the approved draft, 9 skill chips + C5/C8/C9 in five front/ files, back/ 42/42 with profile:true, front tsc 0 build 0 -> REVIEW | ball_to: SA | flags: 0 real calls; FQ45 non-blocking
DISPATCHER DECISION: TASK-026 is startable and file-disjoint from TASK-021's review — giving Fern the next hop rather than waiting on SA.
hop 4 | FE  | did: built TASK-026 — the Home "Ask the AI" section (chips, input, 3-row thinking timeline with provider/model/ms badges, answer + Sources links, failure panel) on the stub; tsc 0, build 0, happy/none/offtopic seen, 18 pictures -> REVIEW | ball_to: SA | flags: 0 real calls; Home hero untouched, fold unchanged at 360
hop 5 | SA  | did: reviewed TASK-021 + TASK-026 as one unit, every DoD re-run -> both DONE; SPEC-005 DONE, REQ-005 SPEC_DONE; TASK-027 -> TODO with Runs A/B/C named and a 12-of-30 cap | ball_to: FE | flags: next hop spends real money
hop 6 | FE  | did: TASK-027 — first REAL chain runs via ws-client, 7 calls (planned 7, 0 retries, ledger 7/30, rows written before each fire): Run A covered with 5 code-verified citations, Run B (Kubernetes) coverage:none with no invented claim, Run C (weather) stopped at step 1; every frame recorded verbatim -> REVIEW | ball_to: SA | flags: FQ50 — the leading "Yes." is a capability inference, put to SA not judged
hop 7 | SA  | did: reviewed TASK-027 read-only — frames diff-identical to project-docs, re-traced every AI claim in Run A line-by-line against both knowledge files (nothing named that is not there), D6 re-run by script; TASK-027 DONE, SPEC-007 DONE, REQ-007 SPEC_DONE | ball_to: PM | flags: SQ38 (may the AI say "Yes." when every fact under it is on a line — default yes); AC-a browser picture UNVERIFIED by design
hop 8 | PM  | did: acceptance passes — REQ-005 4/5 (AC-d held for pictures), REQ-007 4/8 (AC-a/d/e/h held for a real browser); requested TEST-008 (zero cost) + TEST-009 (real gateway, 1 question, cap 5) from Tanya, asked Sober for the ledger row | ball_to: QA (via SA for the ledger row) | flags: 4 owner questions, none blocking
hop 9 | SA  | did: wrote SPEC-007 ledger rows 8-12 authorising TEST-009 (1 question, planned 3, hard cap 5, actuals PENDING); fired nothing, 7/30, 18 unallocated | ball_to: QA | flags: -
hop 10 | QA | did: TEST-008 TEST_PASSED 24/24 zero cost (REQ-005 strings photographed, REQ-007 failure pictures) + TEST-009 TEST_PASSED — one real question in a real browser against the real gateway, calls=3 of planned 3, 3 steps with real deepseek-flash badges, 6/6 claims traced, nothing invented | ball_to: PM | flags: QQ14 — H8 hero fold margin now 0.41px over (spent by REQ-005's longer role/lead)
STOPPED hop 10/10 — condition 5 (hop budget reached)
Board: REQ-005 SPEC_DONE 4/5 + REQ-007 SPEC_DONE 4/8 both awaiting Porter's tick from TEST-008/009; REQ-006 DELIVERED. Ledger 7/30 pending Sober's actuals -> 10/30. All 7 SPEC-007 + 3 SPEC-005 + 2 SPEC-006 tasks DONE.
Digest sent to human: the AI feature works end to end against his real gateway in a real browser — picture delivered.

## RUN 2026-09-13-c — N=4 — started from: new requirement (back/ port 4014 via env; front/ port 3023 if locked) — hygiene FAIL, housekeeping folded into hop 1
hop 1 | PM  | did: cleared 2 hygiene FAILs; REQ-005 DELIVERED 5/5 + REQ-007 DELIVERED 8/8 on TEST-008/009; relayed calls=3 to SA; wrote REQ-008 (back 4014 = R1 READY_FOR_SA; front 3023 = R2 held on Q54: front is locked in Docker but not in scripts) | ball_to: SA | flags: Q54 blocks R2 only
hop 2 | SA  | did: filled SPEC-007 ledger (10/30, 20 unallocated), specced REQ-008 R1 as SPEC-008 + TASK-028 (code default 4014, env overrides, every local 3001 follows, fresh front build), R2 held on Q54 | ball_to: FE | flags: repo is clean at a294347 — the human committed back/ + front
hop 3 | FE  | did: implemented all 6 TASK-028 edits (back default 4014 + guard test + ws-client + both READMEs + front constant), 45/45 tests, fresh front build, .env proof then deleted, zero real calls -> BLOCKED | ball_to: SA | flags: FQ53 — port 4014 is held by the HUMAN's own `bun run dev` (PID 16964, started 23:20 from his VS Code), which hot-reloaded onto 4014 when config.ts was saved; Fern would not kill, double-bind or send to it
STOPPED hop 3/4 — the only unblock is the human's own process; an SA relay hop would add nothing
Board: REQ-005/006/007 DELIVERED; REQ-008 IN_SPEC — TASK-028 BLOCKED on FQ53 (human), R2 held on Q54 (human). Ledger 10/30.
Digest sent to human: stop or confirm PID 16964; Q54 for the front port.
