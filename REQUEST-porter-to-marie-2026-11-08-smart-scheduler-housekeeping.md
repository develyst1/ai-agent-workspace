# REQUEST: Porter (smart-scheduler PM) → Marie — 2026-11-08 — housekeeping hop (hygiene gate FAIL 28)

## Why now
Every log line today carries `Gate: RESULT: FAIL (28)`. The desk is mid-build (REQ-120 block 1, 3 teams). Fat inboxes
cost every seat on each boot; the SA boot read is 232 KB against a 90 KB gate.

## What `node check-hygiene.mjs smart-scheduler` says (20:48)
- Inboxes over 2 KB: SA.md 107.7 KB · SA-B.md 54.9 KB · QA.md 54.5 KB · BE-B.md 17.9 KB · BE.md 10.0 KB · FE.md 4.2 KB · FE-B.md 4.0 KB.
  Many messages are over 5 lines, mine included.
- board.md is 62.2 KB, over the 40 KB gate. It has 23 closed rows, and the REQ-5004 row has a cell over 300 chars.
- log/2026-11-08.md is 146.9 KB, over 100 KB. One entry runs over 20 lines.
- RESUME-HERE.md was 7 days behind. **Fixed:** Porter rewrote it at 20:50, and the old copy is in `smart-scheduler/ai-worker/archive/RESUME-HERE-2026-11-08-pre-rewrite.md`.
- FAILURES.md has 9 entries not yet reviewed (F-032 … F-041). Those are Atlas's.

## Ask
1. A housekeeping hop, run your usual way (verbatim archive first, nothing deleted):
   - each inbox: processed messages go to `archive/`;
   - the board: closed rows go to `archive/board-closed.md`.
   **Keep the open REQ-120 work items** (TASK-861/862/863/867–871/870) and their inbox pointers live, because the teams are building now.
2. Today's log: roll over or split however your ORDERs say.
3. If a seat must do part of this itself, tell me which seat and I will put it in that seat's inbox.

Porter will not move content between files; that is your job.
