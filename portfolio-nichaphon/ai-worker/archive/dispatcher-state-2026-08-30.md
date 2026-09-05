# Dispatcher state ARCHIVE — portfolio-nichaphon — rotated 2026-08-30

> Runs rotated out of `../dispatcher-state.md` by a PM housekeeping hop on
> 2026-08-30 (8 runs > limit 6). Contents below are VERBATIM, byte-for-byte.
> Runs archived here: 2026-08-30-a, -b, -c. Newer runs stay in dispatcher-state.md.
>
> Second rotation 2026-09-02 (PM housekeeping, 7 runs > limit 6): runs 2026-08-30-h,
> -i, -j appended below, also VERBATIM. Runs 2026-09-02-a onward stay in dispatcher-state.md.

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

## RUN 2026-08-30-j — N=4 — started from: human ("ตอนนี้ฉันแก้ไข ok แล้ว") + his own commit 76ad68e landed after QA's run
hop 1 | PM  | did: closed items A/E from QA, attached C evidence, answered TEST-001's questions, added item H | ball_to: HUMAN | flags: raised N1-N3 about the human's own commit; caught the dispatcher's date error
DISPATCHER CORRECTION: today is 2026-09-02 (machine clock + session date). Every spawn prompt in runs a-j wrongly said 2026-08-30; Porter used the correct date. Fixed from here on.
DISPATCHER DECISION: human said "เลิกสนใจการ commit code ของฉัน ตั้งใจทำงานกันไป" — stop routing commit questions (N1-N3), keep the pipeline moving. Not stopping on them.
hop 2 | PM  | did: recorded the stop-tracking-commits standing rule, withdrew N1-N3 without ticking any AC, issued a 4-case QA re-verify round | ball_to: QA | flags: AC1/AC2 still with the human, in parallel
hop 3 | QA  | did: ran the 4-case re-verify on local — R5 count PASS, R7 build/console PASS, item C evidence re-captured; R5 character-for-character NOT ticked (rendered Thai of quote 2 is missing the word "ได้") | ball_to: PM | flags: 2 questions (Q4/Q5) that only the owner can settle
STOPPED hop 3/4 — condition 1 (a question only the owner can answer, about his own words)
Board: REQ-001 SPEC_DONE + QA TEST_PASSED (partial); the only untickable criterion is quote 2's Thai wording.
Digest sent to human: the site currently renders "ผมไม่ทำงาน" while his own original said "ผมไม่ได้ทำงาน" — one word "ได้" missing; AC1/AC2 still open.
