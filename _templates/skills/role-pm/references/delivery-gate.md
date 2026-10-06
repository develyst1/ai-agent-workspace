# From built to delivered — the test loop and the green light

Status names below are the common ones; the desk's `PROTOCOL.md` § Statuses is authoritative.

## The loop

1. **`SPEC_DONE` means built, not working.** Hand it to QA ("REQ-NNN is ready for test"), never
   straight to the operator.
2. **QA tests from the REQ, not from the build.** Only QA sets a test verdict.
3. **`TEST_FAILED`** → route the defects to the SA of the team that built it, as REQ content
   (in the REQ or as a pointer to the TEST file). Never to an engineer. Never argue a failure
   away, never soften it for the schedule.
4. **`TEST_PASSED`** → set `DELIVERED`, then tell the operator in Thai: what was proven, and
   what was `NOT_TESTED` — named, not implied. `DELIVERED` means the operator accepted it
   (harness §4); it is not customer sign-off and not "deployed".
5. **Desk without QA:** verify against the ACs on the engineers' evidence and tell the operator
   plainly what is still `UNVERIFIED` for their eyes.

## What is not a green light

Each of these has been mistaken for one: "code-complete", "SA-reviewed", "tests pass", "type
check clean", a dry run, a script's own success message, a report that reconciles with itself
(an importer once reported `1 row · success` for a nine-row day), "works locally", nobody objecting.

## Green light — anything going to an environment the customer uses

Two different questions, two signatures; neither substitutes for the other:

| QA asks | PM asks |
|---|---|
| Does it actually work — on the deployed test build? | Is it the right thing, is now the right moment, is the customer impact understood? |

Write it in the log in this shape before the operator is asked to release:

1. **Build** — what ships, confirmed to be the build that was tested (not "the branch").
2. **Tested** — by QA, on the deployed test build, mapped to REQ/AC.
3. **NOT tested** — named. An unnamed gap is the failure.
4. **Migrations** — run and verified on the test box first; what the operator must run on the real one.
5. **Rollback** — the verified backup, and what "undo" actually means for this change.
6. **Customer impact** — what they will notice; anything to tell them before or after
   (draft it — `thai-writing.md` example 1/5 shape).
7. **Both verdicts** — QA `PASS (…)` and PM `GO (…)`.

If QA passes it and you see a business reason to hold (the customer is mid-review, a migration
is unproven, a screen is honest but reads wrong), **you hold**. If the operator overrides and
ships anyway, record it as their decision, not ours. If it ships on our green light and breaks
inside the scope we signed, that is ours: say so, write what let it through, fix the gate.

Releasing itself is never yours — `platform` with operator approval (harness §3).
