# Dispatcher state — harness-console

> Written by the **Dispatcher only** (`DISPATCHER.md` at the workspace root). It is the
> run log: one line per hop, newest run at the bottom. No role writes here.
>
> **Mode: dispatcher.** The roles on this desk are **Porter (PM) · Sober (SA) · Fern (FE)**
> — there is no BE and no QA, so a hop never names one.

**Eleven runs have happened** (2026-10-05-a … -k). Runs **a–e** were rotated into
`archive/dispatcher-state-2026-10-05-pre-rotation.md` and runs **f–i** into
`archive/dispatcher-state-2026-10-05-pre-rotation-2.md`, both by Marie on 2026-10-05
(hygiene gate: more than 6 runs). The **two most recent runs (j, k) are kept below,
verbatim**. Nothing is outstanding from the rotated runs: the owner answer that run `g`
parked was delivered in run `h` hop 1, the run `i` hop 3 FE cut-off was finished in
run `i` hop 4, and every `Owner override` in f–i was marked **THIS RUN ONLY** —
run `k` records that the previous run's overrides were **not** carried.

## RUN 2026-10-05-j — N=20 — started from: "ข้อยกเว้น commit ได้, ไปเลย" — gate PASS at start
Owner overrides, THIS RUN ONLY: (ก) condition 6 per TASK; (non-blocking) role-marked non-blocking questions with a built default → end digest; (commit) irreversible_pending that is ONLY "owner commits a code repo" → end digest. Deploy/push/DB/real messages still stop.
hop 1 | SA  | did: TASK-001 review → DONE; Q-F1 answered (next→16.3.8 as TASK-002 step 0) | ball_to: FE | flags: -
hop 2 | FE  | did: TASK-002 built (next 16.3.8, cards, error card, list failure) → REVIEW | ball_to: SA | flags: 1 low assumption BUILT (D-7 error card no link, Q-F2 to SA) → end digest; commit → end digest
hop 3 | SA  | did: TASK-002 review → DONE; Q-F2 = no link; SPEC gap (refresh on all states) → TASK-003 step 7 | ball_to: FE | flags: commit → end digest
hop 4 | FE  | did: TASK-003 built (project page + refresh hint on all states) → REVIEW | ball_to: SA | flags: 1 low assumption BUILT (D-12 empty files[] → —, Q-F3 to SA) → end digest; commit → end digest
hop 5 | SA  | did: TASK-003 review → DONE; Q-F3 answered by SA (SPEC §2.3 nullable title/status) | ball_to: FE | flags: -
hop 6 | FE  | did: TASK-004 AC-8 snapshot diff empty (3859 files), AC-9 clean → REVIEW | ball_to: SA | flags: commit → end digest
hop 7 | SA  | did: TASK-004 review → DONE; REQ-001 SPEC_DONE, SPEC-001 DONE | ball_to: PM | flags: 1 non-blocking q (next dev AGENTS.md/CLAUDE.md untracked) + git → end digest; DELIVERED = owner word via PM
hop 8 | PM  | did: REQ-001 verified-vs-UNVERIFIED report written, owner to decide DELIVERED | ball_to: HUMAN | flags: 2 questions
STOPPED hop 8/20 — condition 7 (ball_to HUMAN) + 1. Digest: REQ-001 SPEC_DONE (TASK-001..004 DONE); owner: eyes-on check → DELIVERED?; AGENTS.md/CLAUDE.md in front repo commit/delete/ignore?; commit front repo.

## RUN 2026-10-05-k — N=4 — started from: answers ("Q1=DELIVERED, Q2=ignore, ไปเลย") — gate PASS at start; previous run's overrides NOT carried
hop 1 | PM  | did: REQ-001 → DELIVERED on owner's word; D-16 recorded as leave untracked | ball_to: HUMAN | flags: 1 low assumption
STOPPED hop 1/4 — condition 7 (ball_to HUMAN, pipeline done) + 3. Digest: REQ-001 DELIVERED; "ignore" read as leave untracked (low); next: new requirement or Marie sweep (6 runs held — next run header hits the 6-run limit).
