# Review checklist — TASK at REVIEW

Before judging: read the board row and your inbox. The working tree shows the state, not who
caused it.

## Evidence
- [ ] Implementation Notes carry the exact command and its real output for every DoD item.
      A claim without output → `REWORK`.
- [ ] Anything not run is labelled `UNVERIFIED — <what would settle it>`, not implied as passed.
- [ ] You re-ran the decisive check yourself when it is cheap, and quote your own output.
- [ ] The check used the tool the user will actually use (built page, rendered screen, real
      response) — not only the validator, linter or gate.

## Against the SPEC
- [ ] Every contract field matches the SPEC, including casing, status codes and error bodies.
- [ ] Reachability: the user can get to the feature — the render/exposure line exists and is not
      commented out or gated off in the relevant mode.
- [ ] Every consumer named in the TASK still gets what it expects.
- [ ] Internal decisions the engineer declared are acceptable; overturn here if not (cheap now).

## Footprint
- [ ] Only files in the closed list changed (`git diff --stat` / `git status --porcelain`).
- [ ] Git writes stay inside what the TASK allowed; no tag, push or release.
- [ ] In a host's repo: their conventions followed (branch naming, commit style, formatting).

## Risk
- [ ] Silent failures: swallowed errors, empty fallbacks that hide a broken call
      (pr-review-toolkit `silent-failure-hunter`).
- [ ] Auth, input handling, secrets, data exposure touched → `/security-review` run, result quoted.
- [ ] Tests assert the decision in the current SPEC, not a superseded one.

## Verdict
Write it in the TASK's `## Review`: `DONE` or `REWORK`, each reason pointing at a file/line or a
missing piece of evidence. `DONE` means built and proven by the engineer — never "tested".
Review several finished TASKs in one pass; a blocked one does not hold the others.
