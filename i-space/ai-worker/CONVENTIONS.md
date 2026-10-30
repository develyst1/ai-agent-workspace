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

2026-10-29 · operator-delegated (owner delegated it to Atom, 2026-10-29 00:40) · **Commit-message convention, all four repos** (`blueprint-back`, `blueprint-front`, `caw-back`, `caw-front`), the same as buddy-screen: `<type>: <summary> (REQ, TASK)` — name the REQ and every TASK the commit delivers, e.g. `feat: <summary> (REQ-101, TASK-101)` · **author `develyst <develyst1@hotmail.com>`** · branch `atom` in all four; each has `develop` / `production`, `merge-workflow.sh` and `release-workflow.sh` · the first `ขึ้น git` still needs the owner's own words in his own session — an Atom relay does not count for git (`ATOM.md` "Ruled by the owner" §1) · (`DECISIONS.md` 2026-10-29 00:40, filed by Marie, ORDER 40)

## Pattern review log

<!-- YYYY-MM-DD · which `open — try first` line · what the team found · operator's answer (mark) -->
