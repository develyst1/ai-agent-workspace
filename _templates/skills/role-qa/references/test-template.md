# TEST file template

File: `tests/TEST-<team>-NNN-short-title.md` when the desk has teams (one counter per team),
otherwise `tests/TEST-NNN-short-title.md`. Write it **before** the build lands where you can;
fill Actual/Result as you run. If the desk's own template differs, the desk wins.

```markdown
# TEST-<team>-NNN: <short title>
- Team: <team that built it — omit if the desk has no teams> · TASKs: TASK-<team>-NNN, …
- Source REQ: REQ-NNN (ACs tested: AC-1 … AC-n)
- Status: DRAFT | IN_TEST | TEST_PASSED | TEST_FAILED | NOT_TESTED
- Build under test: repo `<logical name>`, branch `<name>`, HEAD `<sha>` | deployed build `<id>`
- Surfaces: local | deployed · desktop web | mobile web | app (device/simulator)
- Tested: YYYY-MM-DD by <Name>

## Step 0 — reproduction on the OLD build
<!-- DEFECT WORK ONLY. Delete this whole section for a new feature — there is no symptom
     to reproduce, and a Step 0 demanded there is ceremony. See the `reproduce-first` skill. -->
- Recipe: REQ-NNN §Reproduction          ← pointer, never a copy
- Build: <the old one, named>
- Result: REPRODUCED | NOT REPRODUCED
- Evidence: `<path>` — the reporter's own symptom, not a similar one

`NOT REPRODUCED` is a finding, not a pass: the situation is not understood yet, so the fix is
unproven by definition. Report it; do not proceed to judge the fix. If you had to change the
recipe to make it reproduce, send the corrected recipe back through the PM — that is a finding
about the requirement, not a test detail. If reproduction is genuinely impossible, say exactly
what is missing and the fix ships labelled `UNPROVEN — could not reproduce`; impossible must
never quietly become `PASS`.

## Scope
What this round covers — and what it deliberately does not, and why (risk call, no access, out of AC).
Boundary of the verdict: the files/branch the TASKs named.

## Instrument limits
One line per instrument used, e.g. "Local mock: proves layout and render; NOT behaviour —
server refusals and alternate payloads are untested, not passed."

## Cases
| # | Case (from AC) | Type | Surface | Steps / command | Expected | Actual | Evidence | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | AC-1 … | happy / negative / boundary / state / permission / regression | … | … | … | (observed, verbatim) | path or output ref | PASS / FAIL / BLOCKED / NOT_TESTED |

## Defects
### DEF-1 — <one-line summary of the symptom> — BLOCKER | MAJOR | MINOR | COSMETIC
- Build / environment / surface:
- Preconditions (data, account role, flags):
- Repro (from a clean state): 1… 2… 3…
- Expected: (cite the AC)
- Actual: (+ verbatim error / log / response text)
- Frequency: always | n of m runs
- Evidence: `<path>` — what it shows
- Linked case: #n
(No proposed fix. What broke and how to see it is ours; why and how to repair it is not.)

## Observations (not ours)
Things seen in code or behaviour our team did not change. For the PM to carry onward.
Never part of the verdict, never routed as a defect.

## Test data created
| What (id / marker) | Where | End state (removed / left + why) |
|---|---|---|
| none — read-only round | — | — |

## Verdict
`TEST_PASSED` / `TEST_FAILED` / `NOT_TESTED` — one-line reason.
NOT_TESTED items: <case #> — reason — what would settle it.

## Evidence (decisive)
- `<path>` — what it proves (1–3 items; for a FAIL, the shot shows the failure)

## Questions
(For the PM, per the desk's chain; answers come back as `> answer: ...`)
```

## Severity — use consistently

| Level | Meaning |
|---|---|
| BLOCKER | An AC fails on its main path, data is lost/corrupted, security/permission breach, or no workaround. Stops delivery. |
| MAJOR | An AC fails on a secondary path or a common edge; a workaround exists but a user would not find it. Stops delivery unless the PM explicitly accepts it in writing. |
| MINOR | Behaviour off-spec in a rare edge, or on a surface the desk ruled out of scope (say which ruling). |
| COSMETIC | Visual/copy only, no effect on meaning or reachability. |

A control that renders but cannot be reached by a user is **not** cosmetic — it is a failed AC.

## A defect report passes this check

A developer who has never spoken to you can, from the entry alone: reach the precondition,
reproduce it on the first try, see the difference between expected and actual, and know which
build it was. If they would need to ask you anything, the report is not done.
