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
