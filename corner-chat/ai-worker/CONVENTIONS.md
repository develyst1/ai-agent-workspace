# CONVENTIONS — tech foundation and code conventions of this desk

<!-- 🔧 TEMPLATE. The SA creates this file from the template when the foundation talk starts
     (before the first SPEC). Delete this comment. -->

> Tech foundation and code conventions of this desk. Written by the SA, answered by the operator through the
> PM. Marks: `operator` · `operator-delegated` · `open — try first`.
>
> **Knowledge tier.** Append-only, one decision per line: `YYYY-MM-DD · mark · decision (· where it was asked)`.
> Never compacted, never summarised. A decision that changes is struck through with the new line written under
> it — never deleted. A line marked `open — try first` is what the team uses until the operator settles it; it is
> reviewed when the first REQ reaches the operator, and the outcome goes in **Pattern review log**.
> `operator-delegated` needs a note saying when the operator delegated it.

## Architecture

## Stack

### Language

### Runtime

### Framework

### Data store

### UI library

## Code style

### Formatter

### Linter

### Naming

### Folders

## Error handling

## Tests

## Git

<!-- How git runs is central: the `git-command` skill (the owner's three commands, existing branch,
     no history rewriting). Do NOT restate it here. Record only the desk FACTS that skill needs:
     each repo's COMMIT-MESSAGE CONVENTION (none ⇒ the SA asks the owner whether to create one), the
     working branch, and whether the repo has `develop` / `production` and ships `merge-workflow.sh` /
     `release-workflow.sh` (missing ⇒ installed from the skill when the owner first says the command). If git was already settled at desk opening (SEATS.md / SYSTEM-FACTS.md),
     delete this section. -->

**Facts (SA Sober, 2026-11-02, read-only `git` + `ls`):**
- Repos: `corner-chat-back`, `corner-chat-front`, `corner-chat-app`.
- **Working branch `D1`**, created by the owner and checked out in all three. Each also has `main`, `develop`, `sit`, `uat`,
  `production` and `atom`, local and on `origin`.
- History: one commit each (`Initial commit`).
- **No commit-message convention** in any of them: no CONTRIBUTING, no commitlint, no `commit.template`, no pattern in `git log`.
- **No `merge-workflow.sh` / `release-workflow.sh`** in any of them; they are installed from the `git-command` skill the first
  time the owner says the command.
- Uncommitted work right now: back 9, front 9, app 13 paths.

**Commit-message convention — DECIDED (owner, 2026-11-02, verbatim via the PM: *"Use it"*, answering Q-GIT-1 below). All three
repos use the default exactly as written in Q-GIT-1:** `<type>: <summary> (TASK-<ID>[, TASK-<ID>])`. The types are `feat` / `fix` /
`test` / `chore`; the summary is English, ≤ 72 characters. From the second "ขึ้น git" on, commits are per TASK. The first commit on
`D1` is one per repo. Nothing from `ai-worker/` is committed.

**Q-GIT-1 (SA → PM → owner, 2026-11-02): commit-message convention. Decision pack.**
- `Checked: CONVENTIONS.md § Git (empty) · SYSTEM-FACTS · each repo — none has one.`
- **My default** (correct only the line that is wrong):
  1. Use the same convention in all three repos: `<type>: <summary> (TASK-<ID>[, TASK-<ID>])`. The type is `feat`, `fix`, `test`
     or `chore`; the summary is in English, ≤ 72 characters, and names every TASK the commit delivers.
  2. From the second "ขึ้น git" on, commits are per repo and per TASK, and only reviewed `DONE` files go in. Nothing from
     `ai-worker/` is ever committed.
  3. The exception is this first "ขึ้น git" on `D1`: one commit per repo for everything already reviewed:
     `feat: round-1 back end — accounts, mail, AI filter, LINE (TASK-001…039)`, with the TASK list. Pushed to `origin/D1` only.
- Until he answers, nothing is committed.
- **Status 2026-11-02:** the owner's "ขึ้น git" arrived (quoted by the PM). I stopped at step 3A.2 (no convention), per the
  `git-command` skill. Read-only pre-checks all pass:
  - all three repos are on `D1`, and `.env` is git-ignored in each;
  - no secret-looking file would be added (back 100, front 30, app 155 files);
  - no `.env` secret value appears in any of them (counted matches, 0 hits, no value printed);
  - every TASK is DONE except TASK-040, a one-line change to back's `package.json`. Back is committed after its review.
  When he answers Q-GIT-1, the three commits and pushes to `origin/D1` follow, and the hashes go to the PM.

## Pattern review log

<!-- YYYY-MM-DD · which `open — try first` line · what the team found · operator's answer (mark) -->
