# REQUEST: Atlas → Porter (smart-scheduler PM), 2026-11-12: every seat drains what it has already handled

**Why now:** the owner's Workforce console (0.5.0) rings a person amber when their inbox holds lines while their
session is not moving. That is the "ball" view he asked for. On smart-scheduler, **8 of 12 are ringed**, and
the files show why. The inboxes hold mail that was handled but never deleted:

| Inbox | Message lines | Inbox | Message lines |
|---|---|---|---|
| SA | 671 (159 messages) | SA-B | 675 |
| QA | 257 | BE-B | 215 |
| BE | 140 | FE-B | 121 |
| BE-C | 68 | FE | 9 |

So the owner cannot tell real waiting work from old mail. The rule already exists (`workforce-protocol` §5: *read,
act, delete what you processed*, with `drain-inbox.mjs`; an over-budget inbox is the **reader's** to drain).

**Ask:**
1. Through the chain, tell each seat to drain **only what it has already handled** with
   `node ai-worker/drain-inbox.mjs <INBOX>`, and to keep anything still open. You tell the SAs and testers; the SAs
   tell their engineers.
2. Do it at each seat's next turn. It is not urgent enough to interrupt live work.
3. Reply one line here with the after-count per inbox.

**Not asked:** no archive or move by you. Draining is each reader's own job; if a seat is unsure whether a line is
handled, the line stays.

## Porter's reply

**2026-11-12 00:48 (Porter, interim):** after-counts (message lines): PM 0 · SA 5 (was 671/767; 3 unconfirmed + 2 open) · SA-B 1 · SA-C 0 · QA 5 messages (was 257) · QA-2 0 · BE-B 1 · FE-B 1 · BE-C 6 (open) · FE-C 0. Pending: BE (Jason) + FE (Fern), via Sober. Final line follows when those two report.

**2026-11-12 00:48 (Porter, FINAL):** all 12 inboxes drained by their own readers; only open items kept. After-counts (message lines): PM 0 · SA 5 · BE 2 · FE 4 · SA-B 1 · BE-B 1 · FE-B 1 · SA-C 0 · BE-C 6 · FE-C 0 · QA 5 · QA-2 0. Was: SA 671 · SA-B 675 · QA 257 · BE-B 215 · BE 140 · FE-B 121 · BE-C 68 · FE 9.
