# The release gate — two signatures or it does not ship

Nothing reaches a customer environment until **both** QA has passed it on the deployed build
**and** the PM has said GO. The customer environment holds real people, real records, real
money; a bad deploy there is their business day, not a rollback exercise. Who deploys, and to
which environments, is a desk fact.

## Two signatures, two questions — neither substitutes for the other

| | Asks | Answers with |
|---|---|---|
| **QA** | Does it actually work? | Evidence from running the **deployed** build — screens rendered, flows exercised, numbers checked. Never a code read. |
| **PM** | Is it the right thing, the right moment, is the customer impact understood? | The ACs, what is not covered, what the customer is doing now, what breaks if we are wrong. |

QA passes but PM sees a business reason to hold → it holds. PM wants it shipped but QA has not
run it → there is no green light. Silence is not agreement from either side.

## Not a green light

- "Code-complete", "reviewed", "tests pass", "type-check clean" — the code is built and correct
  in a reviewer's judgement; nothing about the deployed environment.
- A dry run, a script's own success message, a report that reconciles with itself.
- "It worked locally."
- Nobody objecting.

## What a green light contains — written in the log, in this shape

1. **Build** — what ships, and confirmation it is the exact build that was tested (an id/sha, not "the branch").
2. **Tested** — by QA, on the deployed build, each result mapped to a REQ/AC, with evidence paths.
3. **NOT tested** — named explicitly.
4. **Migrations** — run and verified on a non-customer environment first; what the human must run on the customer's.
5. **Rollback** — the verified backup, and what "undo" actually means here.
6. **Customer impact** — what they will notice, what they should be told.
7. **Both signatures** — `QA: PASS (<TEST id>, <scope>)` and `PM: GO (<reason>)`, in the log,
   **before** the human is asked to deploy.

## After the deploy

Re-run the acceptance subset (and the regression Core set) on the deployed environment you are
cleared for. Delivered means deployed *and* verified.

## Accountability

If it ships on our green light and breaks something inside the scope we signed, that is ours:
say so in the log, write what let it through, and **fix the gate, not just the bug** (add the
regression case; record the failure per the desk's FAILURES process). The operator may override
and ship anyway — that is their call; record it as their decision, not restated as ours.
The operator should never be the one who notices.
