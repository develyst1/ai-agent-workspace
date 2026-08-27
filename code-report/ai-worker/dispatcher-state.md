# Dispatcher state — code-report

## RUN 2026-08-25-a — N=4 — started from: ไปเลย (date rolled over to 2026-08-25)
hop 1 | BE  | did: startup ritual found TASK-027 already implemented + committed at 23df16f (in REVIEW) by a prior session; correctly did NOT start TASK-028 (its dep 027 was not DONE yet — same guess-across-boundary discipline); created log/2026-08-25.md | ball_to: SA | flags: -
hop 2 | SA  | did: reviewed TASK-027 (5-stage pipeline + client flip + worker wiring) → DONE at 23df16f; re-ran gates (typecheck 0, 259 tests pass); traced the internal→wire stage mapping end-to-end (6 JOB_STAGES in order, worker tests intact); answered Q-BE-27 and routed its two user-facing D2 effects to Porter as Q-SA-24 | ball_to: BE | flags: Q-SA-24 (2 non-blocking business questions)
hop 3 | BE  | did: implemented TASK-028 — the REAL AI_CURIOUSNESS loop: env-bounded (default 5) text-action protocol (list_tree/read_file/search/done) over the RepoInspector, JSON.parse in try/catch so a malformed model reply is a safe stop not a job abort, results fed back as repo DATA; single worker swap, wire stays 6 stages; 274 tests pass (+15); commit 75acb5f | ball_to: SA | flags: -
hop 4 | SA  | did: reviewed TASK-028 → DONE at 75acb5f, re-ran gates (274/0), traced D4/D5 conformance; DELIBERATELY kept REQ-008 IN_SPEC (not SPEC_DONE) because Req-7 fallback-model is still un-specced — marking it done would falsely report the requirement as fully built | ball_to: SA | flags: -
STOPPED hop 4/4 — condition 5 (hop budget reached)

Board state at stop: 24 TASKs DONE (TASK-027 + TASK-028 joined). The deeper 5-stage AI pipeline the human asked for is BUILT and reviewed: AI_PROJECT → AI_COMMITS → AI_CURIOUSNESS (model reads real files via list_tree/read_file/search, env-bounded loop) → AI_UNDERSTANDING (own-reasoning prompt) → AI_WRITING (by-topic multi-pass), each with per-stage model + max_tokens from env.
REQ-008 stays IN_SPEC — one piece left: Req-7 fallback models (deepseek-v4-pro/flash when a primary runs out of credit/errors), Sober's next design unit.
Porter still owes: raise REQ-009 (FE progress steps for the 2 new reasoning stages, Q-SA-23=yes), accept REQ-006, and now relay Q-SA-24.
Open non-blocking questions for the human: Q-SA-24 (report header shows "REPORT PARAMETERS:" AI-facing labels — ok or make a reader-friendly header? + were Contributors/commit-appendix intentionally dropped by the by-topic writer?), Q-SA-22, Q40, Q-BE-24, REQ-006 acceptance.
STILL WAITING ON THE HUMAN: TASK-014 Phase B evidence into project-docs/.

## RUN 2026-08-25-b — N=4 — started from: ไปเลย
hop 1 | SA  | did: designed REQ-008 Req-7 (fallback models) into SPEC-007 as decision D6 — fallback lives INSIDE AiClient above the retry loop so pipeline/curiosity/worker stay untouched; chain deepseek-v4-pro→flash, max_tokens clamped to the fallback's 30000 cap, fires on retryable exhaustion not 4xx; created TASK-029; raised Q-SA-25 | ball_to: BE | flags: Q-SA-25 (4 non-blocking policy questions), 1 optional data request. KEY HONEST FINDING: AI API CENTER's documented failure shape has NO structured credit/quota code, so "out of credit" cannot be reliably told apart from a generic error — both trigger the same fallback (ships correctly); a true distinction needs a real out-of-credit response sample
hop 2 | BE  | did: implemented TASK-029 fallback inside createHttpAiClient (config AI_FALLBACK_MODELS, de-duped chain, cap clamp, only advances on retryable failure); 287 tests pass (+13); commit 4bfc21e | ball_to: SA | flags: 1 non-blocking transparency question (Q-BE-29 — a DoD-prose vs SPEC-table conflict on absent-vs-empty env; built the SPEC-table reading)
hop 3 | SA  | did: reviewed TASK-029 → DONE at 4bfc21e (gates re-run: typecheck 0, 287/0), cross-checked the fallback trigger predicate against the Failure classification; advanced SPEC-007 → DONE and REQ-008 → SPEC_DONE (last task built) | ball_to: PM | flags: -
hop 4 | PM  | did: PM acceptance check on REQ-008 — all technical ACs built + SA-reviewed, but held it at SPEC_DONE (NOT DELIVERED) because one AC requires the fallback design be confirmed with the human before ship; routed 3 pre-ship sign-offs | ball_to: HUMAN | flags: 3 pre-ship questions + 1 optional data request
STOPPED hop 4/4 — condition 5 (hop budget reached; also ball_to HUMAN on pre-ship sign-offs)

MILESTONE: REQ-008 (the deeper 5-stage AI pipeline) is BUILT, fully SA-reviewed, and SPEC_DONE. TASK-025..029 all DONE. It is NOT yet DELIVERED — Porter holds it on 3 pre-ship business sign-offs. Every engineer is idle on REQ-008; nothing is blocked.

## RUN 2026-08-25-c — N=4 — started from: answers (1=ตามนั้น, 2=รับได้ขอดูก่อน, 3=ถ้าไม่มีประโยชน์เอาออก, 4=ก) + ไปเลย
hop 1 | PM  | did: processed the 3 pre-ship sign-offs, verified built defaults match the human's confirmations, moved REQ-008 SPEC_DONE → DELIVERED | ball_to: HUMAN | flags: - (2 non-blocking follow-ups: SA appendix-removal call, raise REQ-009)
hop 2 | PM  | did: raised REQ-009 (surface AI_CURIOUSNESS + AI_UNDERSTANDING as their own progress steps, per Q-SA-23=yes) READY_FOR_SA | ball_to: SA | flags: 1 non-blocking question (Q-REQ009-1 labels)
hop 3 | SA  | did: wrote SPEC-008 + TASK-030 (BE) + TASK-031 (FE); KEY FINDING — the pipeline ALREADY announces both stages, they were only hidden because SPEC-007's wire deliberately folded them onto AI_COMMITS/AI_WRITING, so REQ-009 is an "un-fold" (grow wire 6→8 + identity map), not new computation; drafted the two step labels and routed for confirmation (Q-SA-26) | ball_to: BE | flags: 1 non-blocking question (Q-SA-26 labels)
hop 4 | BE  | did: implemented TASK-030 — grew JOB_STAGES 6→8 in announce order, made WIRE_STAGE_BY_INTERNAL an identity map, updated stale docs + tests (progress.total stays derived, no literal); 288 tests pass; commit 803a44c | ball_to: SA | flags: -
STOPPED hop 4/4 — condition 5 (hop budget reached)

MILESTONE 2: REQ-008 DELIVERED (2026-08-25). The whole deep AI pipeline the human asked for is shipped and accepted.

## RUN 2026-08-25-d — N=4 — started from: ไปเลย
hop 1 | SA  | did: reviewed TASK-030 → DONE at 803a44c (re-ran gates: typecheck 0, 288/0; verified identity map + no literal count) | ball_to: FE | flags: -
hop 2 | FE  | did: implemented TASK-031 — grew FE REPORT_STAGES 6→8 + both dictionaries with the draft labels; typecheck 0, build green; commit e75346e | ball_to: SA | flags: -
hop 3 | SA  | did: reviewed TASK-031 → DONE at e75346e; cross-checked FE REPORT_STAGES byte-for-byte equals backend JOB_STAGES; SPEC-008 → DONE, REQ-009 → SPEC_DONE | ball_to: PM | flags: -
hop 4 | PM  | did: acceptance check on REQ-006 — code-level AC passes on re-verified TASK-022/023 diffs, but the VISUAL ACs need the stakeholder's own eyes (no deployed env, screen is admin-gated); held at SPEC_DONE, routed Q-REQ006-1 (visual confirm) | ball_to: HUMAN | flags: 1 visual-confirm question
STOPPED hop 4/4 — condition 5 (hop budget reached)

Board state at stop: 27 TASKs DONE. REQ-008 DELIVERED. REQ-009 SPEC_DONE (built + reviewed; awaiting PM acceptance = label confirm Q-SA-26 + combined live-highlight run). REQ-006 SPEC_DONE (awaiting the human's visual confirm Q-REQ006-1). REQ-007 (Thai UI) TASK-024 BLOCKED on Q-SA-22.
Accumulated open questions for the human (ALL non-blocking):
- Q-REQ006-1: open the new-report screen, confirm (a) load buttons align with dropdowns (b) dates read DD/MMM/YY in both the inputs and the summary → then REQ-006 DELIVERED
- Q-SA-26: confirm the 2 progress-step labels (AI_CURIOUSNESS='สำรวจโค้ดเพิ่มเติม'/'Exploring the codebase', AI_UNDERSTANDING='ทำความเข้าใจข้อมูล'/'Making sense of the findings') → then REQ-009 can DELIVER
- Q-SA-22: REQ-007 git-term Thai forms (blocks Fern TASK-024 only)
- Q40 (older)
Sober's parked design call: remove orphaned Contributors/commit-appendix code (Q-SA-24 item 2, "remove if not useful").
STILL WAITING ON THE HUMAN: TASK-014 Phase B evidence into project-docs/.

Board state at stop: 25 TASKs DONE. REQ-008 DELIVERED. REQ-009 IN_SPEC — TASK-030 (BE 8-stage wire) at REVIEW, TASK-031 (FE progress ledger + labels) TODO & independently startable for Fern. REQ-006 SPEC_DONE awaiting PM acceptance. REQ-007 (Thai UI) TASK-024 BLOCKED on Q-SA-22.
Two things Porter parked: Sober's design call on removing orphaned Contributors/commit-appendix code (Q-SA-24 item 2, human said "remove if not useful"), REQ-006 acceptance.
Open non-blocking questions for the human: Q-SA-26 (confirm the 2 progress-step labels: AI_CURIOUSNESS='สำรวจโค้ดเพิ่มเติม'/'Exploring the codebase', AI_UNDERSTANDING='ทำความเข้าใจข้อมูล'/'Making sense of the findings'), Q-SA-22 (REQ-007 git-term Thai), Q40, Q-BE-24.
STILL WAITING ON THE HUMAN: TASK-014 Phase B evidence into project-docs/ (report #2 idea — header revisit he wants to see first).

## RUN 2026-08-25-e — N=4 — started from: answer (blanket "ให้คิดแล้วเอาที่ควรนั้นแหละ")
hop 1 | PM  | did: routed the blanket reply across 4 pending items — closed Q-SA-22 (loanword policy, unblocks TASK-024) and Q-SA-26 (step labels confirmed) as wording judgment calls; left Q-REQ006-1 (visual confirm) and TASK-014 evidence hand-over open (need the human's own eyes / real command output, not delegable) | ball_to: HUMAN | flags: 2 questions for human, 1 data request
STOPPED hop 1/4 — condition 1 (questions_for_human non-empty) + condition 7 (ball_to: HUMAN)

## RUN 2026-08-24-h — N=4 — started from: answer (Q-REQ008-4: deepseek-v4-flash = same tier as gpt-4.1-mini → ≤30000/call)
hop 1 | PM  | did: recorded Q-REQ008-4 CLOSED, folded deepseek-v4-flash=30000 into REQ-008 Req 6/7 | ball_to: SA | flags: -
hop 2 | SA  | did: reviewed TASK-026 (RepoInspector) → DONE; re-verified the 2-layer path confinement + literal git-grep read-only; ruled the symlink test env-skip (Windows) and the search-vs-exclusions point both SPEC-conformant; flagged that Jason left it UNCOMMITTED and routed the commit to him | ball_to: BE | flags: -
hop 3 | BE  | did: committed TASK-026 at 157e5a2; then hit ANOTHER real sequencing conflict on TASK-027 — its DoD (green typecheck + tests) can't be met without pulling in TASK-028's worker wiring + the internal→wire stage mapping, since making the client fields required breaks pipeline.ts→worker.ts and the 5-stage redesign breaks 3 worker tests. Raised Q-BE-26 to Sober rather than pull TASK-028 forward (the overlap anti-pattern Sober rejected at Q-BE-25) | ball_to: SA | flags: -
hop 4 | SA  | did: ruled Q-BE-26 → Option A (same class + same ruling as Q-BE-25): the contract flip lands green with its sole caller in one commit; verified read-only that pipeline.ts is the only client.chat caller and worker.ts:198 its only prod caller; WIDENED TASK-027 to carry minimal worker wiring + stage mapping, NARROWED TASK-028 to just the curiosity-investigator swap; unblocked 027 | ball_to: BE | flags: -
STOPPED hop 4/4 — condition 5 (hop budget reached)

Pattern worth noting: this is the THIRD time an engineer hit a task-boundary conflict and refused to guess across it (Q-BE-25, now Q-BE-26 twice-related), and each time Sober ruled the same principle — a required-field contract change lands in ONE green commit with its sole consumer, never a red tree between tasks — and verified the "sole caller" claim by grep before ruling. The task graph is being corrected as it's built, not papered over.

Board state at stop: 22 TASKs DONE (TASK-026 joined, committed 157e5a2). TASK-027 (5-stage pipeline + client flip + minimal worker wiring + stage mapping) now startable — the big one, the actual AI_CURIOUSNESS/AI_UNDERSTANDING pipeline. TASK-028 narrowed to the curiosity investigator loop, depends on 027. REQ-008 Req 7 (fallback models) still Sober's design unit.
Porter still owes: raise REQ-009 (FE progress steps, Q-SA-23=yes), accept REQ-006. Fern's TASK-024 BLOCKED on Q-SA-22.
Open non-blocking questions for the human: Q-SA-22 (REQ-007 git-term Thai), Q40, Q-BE-24, REQ-006 acceptance.
STILL WAITING ON THE HUMAN: TASK-014 Phase B evidence into project-docs/.

Older open questions: Q-SA-17 (BLOCKS TASK-016 only — what runs behind localhost so he can see all three screens: ก run the backend + his DB + log in as admin, ข frontend only with a team-built stub showing fake data, ค just /login for now), Q24 (does "เดี๋ยวรันเอง" also cover TASK-009's eleven manual UI runs, or only TASK-014's two API jobs). Plus the standing data request: run TASK-014's Run A and Run B and paste the two GET /api/reports/:jobId bodies and the three AI-stage log lines — no passwords, cookies or tokens.













