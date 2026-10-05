# Dispatcher state — harness-console

> Written by the **Dispatcher only** (`DISPATCHER.md` at the workspace root). It is the
> run log: one line per hop, newest run at the bottom. No role writes here.
>
> **Mode: dispatcher.** The roles on this desk are **Porter (PM) · Sober (SA) · Fern (FE)**
> — there is no BE and no QA, so a hop never names one.

**No run has happened yet.** The desk was opened 2026-10-04 by Marie and the first
dispatcher session has not started.

🔴 **Before the first run, two things are true and the Dispatcher should expect them:**
1. **There is no requirement yet.** `CONSOLE-PLAN.md` at the workspace root is the design
   input, not a requirement. The first ball is the **owner's**, then Porter's.
2. The hygiene gate must PASS before dispatching — it did at desk-open
   (`node check-hygiene.mjs harness-console`, 2026-10-04).

## RUN 2026-10-05-a — N=4 — started from: requirement (v1, 2 screens) — gate PASS at start
hop 1 | PM  | did: REQ-001 written, READY_FOR_SA; confirmed --json absent | ball_to: HUMAN | flags: 2 questions, 2 low-confidence assumptions
STOPPED hop 1/4 — conditions 1, 3, 7 (questions for human; low-confidence assumptions; ball_to HUMAN)
Digest: Q1 Marie adds check-hygiene.mjs --json per REQ-001 §C-2? · Q2 console UI labels English per REQ-001 or Thai? · A (low) plan items owner didn't name are out of v1 · B (low) UI labels English. SA inbox holds REQ-001.

## RUN 2026-10-05-b — N=4 — started from: answers (Q1=ได้, Q2=อังกฤษ, A ถูก) — gate PASS at start
hop 1 | PM  | did: recorded owner answers in SYSTEM-FACTS + REQ-001, pointed Sober | ball_to: SA | flags: 1 irreversible_pending (owner opens Marie for ORDER 16 ①)
STOPPED hop 1/4 — condition 4 (irreversible_pending: only the owner can call Marie)
Digest: owner opens Marie for MARIE.md ORDER 16 ① (--json); next hop = SA (2 pointers in inbox/SA.md) on "ไปเลย".

## RUN 2026-10-05-c — N=4 — started from: ไปเลย — gate PASS at start
hop 1 | SA  | did: SPEC-001 written, data contract BLOCKED on --json, TASKs held; Q-3..Q-5 to Porter | ball_to: PM | flags: 3 questions, 1 low assumption, 1 irreversible_pending
STOPPED hop 1/4 — conditions 1, 3, 4 (questions; low-confidence assumption; owner must open Marie)
Digest: Q-3 AC-7 wording · Q-4 'Gate error — ' text on timeout/non-JSON · Q-5 three more --json points for Marie · A (low) path without check-hygiene.mjs shows AC-7 message. Next hop = PM.

## RUN 2026-10-05-d — N=4 — started from: answers (Q-3=ข, A ถูก; Q-4 unanswered) — gate PASS at start
hop 1 | PM  | did: recorded Q-3=ข + A in SYSTEM-FACTS/REQ-001, re-asked Q-4, routed to Sober | ball_to: HUMAN | flags: 2 questions, 1 low assumption, 1 irreversible_pending
STOPPED hop 1/4 — conditions 1, 3, 4, 7
Digest: Q-4 proposed texts OK? · AC-7 text OK? · owner opens Marie (ORDER 16 ① + Q-5). Sober has inbox item (SPEC-001 update).

## RUN 2026-10-05-e — N=4 — started from: answers (Q-4 ได้, AC-7 ได้) — gate PASS at start
hop 1 | PM  | did: recorded Q-4 + AC-7 owner-approved, routed to Sober | ball_to: SA | flags: 1 irreversible_pending (same Marie item, re-stated)
STOPPED hop 1/4 — condition 4 (irreversible_pending: owner opens Marie for --json)
Digest: no open questions; next hop = SA (fold answers into SPEC-001). Every hop re-reports the Marie item until --json exists.

## RUN 2026-10-05-f — N=4 — started from: ไปเลย — gate PASS at start
hop 1 | SA  | did: SPEC-001 ACTIVE from real --json, TASK-001 TODO for Fern, Q-6..Q-8 to Porter | ball_to: FE | flags: 3 questions, 1 low assumption
STOPPED hop 1/4 — conditions 1, 3
Digest: Q-6 last-moved = newestLogDate? · Q-7 file health ก/ข · Q-8 wording + ball = every board row? Next: FE (TASK-001) and PM (Q-6..Q-8 in inbox/PM.md).

## RUN 2026-10-05-g — N=4 — started from: answers ("ตามนั้น" = accepts the dispatcher's suggested answer line for Q-6/Q-7/Q-8/B) — gate PASS at start
hop 1 | PM  | did: recorded Q-6/Q-7/B, proposed Q-8 wording table (12 rows) | ball_to: HUMAN | flags: 1 question, 2 low assumptions, gate FAIL
STOPPED hop 1/4 — conditions 1, 3, 7 + hygiene FAIL (dispatcher-state 7 runs > 6) → Marie before next dispatch
PENDING owner answer (not yet delivered to PM — gate FAIL blocks dispatch): "Q-8 ได้, สมมติฐาน A B ถูก" → pass verbatim into the next PM hop once Marie has rotated this file.
