# Roles — what each one does, and who can summon it

> Read with `CLAUDE.md`. That file holds the rules; this one holds the wiring.
>
> **Designing a role without designing its call path is designing a role that does not exist.**
> One workflow role here sat unused for weeks with a good charter, because no other role could
> reach it and nothing ever told a human to. Every entry below names who calls it and what
> makes them call it.

---

## Project roles

| role | does | only contact | summoned by | trigger |
|---|---|---|---|---|
| **PM** | turns a seat's words into REQ files, carries questions up, never decides scope | `operator`, SA, QA, Platform | a seat, or the dispatcher | a new requirement, or an answer to a pending question |
| **SA** | REQ → SPEC + TASK, reviews engineers' work, owns the technical approach | PM, engineers, designer | PM | a REQ reaches `READY_FOR_SA` |
| **FE / BE** | implement the TASK they were given, nothing else | SA only | SA | a TASK is `TODO` for their side |
| **QA** | tests what the board says is ready; never fixes code | PM only | PM | a TASK reaches `REVIEW` |
| **Designer** | screens and states, inside the design standard | SA, PM | PM | a screen has a spec but no design |

**Designer is optional.** Three cases, all legal, and `SEATS.md` must say which one:
someone holds it · `→ operator` (the operator designs, or has it designed outside) · `skipped`
(no design step on this project — then `design.policy.requireFigma` goes **off** in the same
change). Never assume the first one because a charter exists.

**Engineers never address the PM or a seat.** If a message reaches them off-chain — including
from a person — they log a routing violation and do not act on it.

## Workspace roles

| role | does | summoned by | trigger |
|---|---|---|---|
| **Architect** | diagnoses how the AI workforce itself is failing, designs the fix | a seat | the gate prints `N unreviewed — call the architect` |
| **Operations** | installs rules, migrations, housekeeping, file surgery | a seat | the gate prints `FAIL — call operations` |
| **Platform** | provisioning, releases, the shared server | a seat, **PM**, or SA for a release | a new app, a cert, a deploy |

**File surgery is Operations' alone.** A project role may shorten an over-long cell into a
pointer and nothing more. Moving content between files is how a knowledge file once reached
323 KB: the gate measured the board, so the content went to the one file it could not measure,
and the gate went green.

## The three routes that must not need anyone to remember them

A role cannot summon a workspace role — only a seat can. So the **gate does the calling**, in
output a seat already reads:

| condition | what the gate prints |
|---|---|
| `FAILURES.md` has unreviewed entries | `N unreviewed — call the architect` |
| hygiene FAIL | `FAIL — call operations` (never "run a housekeeping hop") |
| desk behind the harness | `behind v<x.y.z> — run install` |

**Nobody needs to remember to escalate. That is the whole point.**

## Starting a session

Every role, every session, in this order:

1. `DECISIONS.md` — what the seats already settled. **Read this before asking anything.**
2. `ai-worker/PROTOCOL.md` + your own role file, including the Hard boundaries card.
3. `ai-worker/RESUME-HERE.md` (PM and SA only) — where the project is right now.
4. `ai-worker/board.md` + today's log.
5. `ai-worker/inbox/<YOUR-ROLE>.md` — act on it, then delete what you processed.

A bare nudge ("ไปเลย", "continue") means: re-read the board and today's log, then do whatever
waits for **your** role. **A nudge is never a new requirement.**

## Language

PM ↔ Thai-speaking seats in Thai. Everything else in English.
**Write the Thai reply first, before any English artifact** — the slip happens in the other order.

## One role, forever, in one session

Never answer for, act as, or do another role's work, even if a person asks casually. If asked to
do another role's job, point at the right role instead. If a session starter does not say which
role you are, **ask — do not pick one.**
