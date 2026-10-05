# Dispatcher state — harness-console

> Written by the **Dispatcher only** (`DISPATCHER.md` at the workspace root). It is the
> run log: one line per hop, newest run at the bottom. No role writes here.
>
> **Mode: dispatcher.** The roles on this desk are **Porter (PM) · Sober (SA) · Fern (FE)**
> — there is no BE and no QA, so a hop never names one.

**Seven runs have happened** (2026-10-05-a … -g). Runs **a–e** were rotated into
`archive/dispatcher-state-2026-10-05-pre-rotation.md` by Marie on 2026-10-05
(hygiene gate: 7 runs > 6). The **two most recent runs are kept below**, and the
outstanding owner answer at the bottom of this file is **still undelivered**.

## RUN 2026-10-05-f — N=4 — started from: ไปเลย — gate PASS at start
hop 1 | SA  | did: SPEC-001 ACTIVE from real --json, TASK-001 TODO for Fern, Q-6..Q-8 to Porter | ball_to: FE | flags: 3 questions, 1 low assumption
STOPPED hop 1/4 — conditions 1, 3
Digest: Q-6 last-moved = newestLogDate? · Q-7 file health ก/ข · Q-8 wording + ball = every board row? Next: FE (TASK-001) and PM (Q-6..Q-8 in inbox/PM.md).

## RUN 2026-10-05-g — N=4 — started from: answers ("ตามนั้น" = accepts the dispatcher's suggested answer line for Q-6/Q-7/Q-8/B) — gate PASS at start
hop 1 | PM  | did: recorded Q-6/Q-7/B, proposed Q-8 wording table (12 rows) | ball_to: HUMAN | flags: 1 question, 2 low assumptions, gate FAIL
STOPPED hop 1/4 — conditions 1, 3, 7 + hygiene FAIL (dispatcher-state 7 runs > 6) → Marie before next dispatch

## OUTSTANDING — cleared: owner answer delivered to PM in RUN 2026-10-05-h hop 1.

## RUN 2026-10-05-h — N=20 — started from: answers ("Q-8 ได้, สมมติฐาน A B ถูก" + "ก ได้, ข ได้, ค ได้, ง งด session อื่น, N=20 ไปเลย") — gate PASS at start
Owner override, THIS RUN ONLY (ก ได้): stop condition 6 counts "same role woken 3 times on the SAME TASK", not per run. DISPATCHER.md unchanged.
hop 1 | PM  | did: recorded Q-8 approval + ข/ค/ง in SYSTEM-FACTS/REQ-001, pointed Sober | ball_to: SA | flags: -
hop 2 | SA  | did: SPEC-001 §1.4/§1.5 from owner answers; TASK-002/003/004 created TODO for Fern | ball_to: FE | flags: 1 question (Q-9, non-blocking), 1 low assumption
STOPPED hop 2/20 — conditions 1, 3 (Q-9; Q-9a built as yes, low). Next: FE TASK-001; PM holds Q-9.

## RUN 2026-10-05-i — N=20 — started from: answers ("Q-9 ใช่/ใช่, สมมติฐาน A ถูก, ข้อยกเว้น non-blocking ได้, ไปเลย") — gate PASS at start
Owner overrides, THIS RUN ONLY: (ก) condition 6 counts per TASK; (non-blocking) a question the role itself marks non-blocking AND already built a default for is collected for the end digest, not a stop. Blocking questions, low-confidence assumptions not yet built, irreversibles still stop. DISPATCHER.md unchanged.
hop 1 | PM  | did: recorded Q-9 yes/yes + A in SYSTEM-FACTS/REQ-001, pointed Sober | ball_to: SA | flags: -
hop 2 | SA  | did: closed Q-9 in SPEC-001 + TASK-002/003 (no change) | ball_to: FE | flags: -
hop 3 | FE  | CUT OFF (API error ENOTFOUND) mid-session — partial: board TASK-001 REVIEW, no FE log entry/report | ball_to: (none) | flags: unparseable → retry on owner "Try again"
hop 4 | FE  | did: TASK-001 finished after cut-off — all DoD re-run, REVIEW; Q-F1 (next 16.2.9 advisory) to SA | ball_to: SA | flags: 1 irreversible_pending (owner git commit in front repo)
STOPPED hop 4/20 — condition 4 (irreversible_pending: owner commits front repo). Next: SA review TASK-001.

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
