# CONVENTIONS — tech foundation and code conventions of this desk

> Tech foundation and code conventions of this desk. Written by the SA, answered by the operator through the
> PM. Marks: `operator` · `operator-delegated` · `open — try first`.
>
> **Knowledge tier.** Append-only, one decision per line: `YYYY-MM-DD · mark · decision (· where it was asked)`.
> Never compacted, never summarised. A decision that changes is struck through with the new line written under
> it — never deleted. A line marked `open — try first` is what the team uses until the operator settles it; it is
> reviewed when the first REQ reaches the operator, and the outcome goes in **Pattern review log**.
> `operator-delegated` needs a note saying when the operator delegated it.

## Architecture

2026-11-06 · open — try first · Phone web app → back → gateway. The phone never calls the gateway. Detail: `specs/SPEC-102-app-intake-processing-results.md`. [SA-decided, Sober]

## Stack

### Language

2026-11-06 · open — try first · TypeScript, both repos. [SA-decided, Sober]

### Runtime

2026-11-06 · operator · Bun on the back (13:12).
2026-11-06 · open — try first · Bun as the package manager on the front; the built server runs on Node, per `deploy-ready-build`. [SA-decided, Sober]

### Framework

2026-11-06 · operator · Back: Hono or Elysia only (13:12).
2026-11-06 · open — try first · Back: Hono. [SA-decided, Sober]
2026-11-06 · operator-delegated · Front never Flutter; start mobile web/PWA (Atom 16:15, under *"ฝากตัดสินใจ แทนฉันไปก่อนนะ"*).
2026-11-06 · open — try first · Front: Next.js standalone, installable PWA, no service worker. [SA-decided, Sober]

### Data store

2026-11-06 · operator · The owner's dev Postgres, this project's database, never a local one (13:09).
2026-11-06 · open — try first · Bun's built-in `SQL`, plain SQL migrations, no ORM. Audio on disk under `STORAGE_DIR`. [SA-decided, Sober]

### UI library

2026-11-06 · open — try first · Tailwind, no component library. [SA-decided, Sober]

## Code style

### Formatter

2026-11-06 · open — try first · None configured until the repos need one. Match the file you are in. [SA-decided, Sober]

### Linter

2026-11-06 · open — try first · `tsc --noEmit` only, for now. [SA-decided, Sober]

### Naming

2026-11-06 · open — try first · JSON between front and back is camelCase, Postgres is snake_case, the gateway's JSON is snake_case and stops at `src/gateway/`. [SA-decided, Sober]

### Folders

2026-11-06 · open — try first · As each TASK's closed list says. [SA-decided, Sober]

## Error handling

2026-11-06 · open — try first · HTTP errors are `{ "error": { "code": "…" } }`. Failed processing is a status on the recording, not an HTTP error. No silent failure: a recording is never reported as finished when it is silent or empty. [SA-decided, Sober]

## Tests

2026-11-06 · open — try first · Back: `bun test`. Front: Playwright with `channel: "chrome"` at 390 × 844. Test audio is generated at test time and never committed. [SA-decided, Sober]

## Git

<!-- How git runs is central: the `git-command` skill (the owner's three commands, existing branch,
     no history rewriting). Do NOT restate it here. Record only the desk FACTS that skill needs:
     each repo's COMMIT-MESSAGE CONVENTION (none ⇒ the SA asks the owner whether to create one), the
     working branch, and whether the repo has `develop` / `production` and ships `merge-workflow.sh` /
     `release-workflow.sh` (missing ⇒ installed from the skill when the owner first says the command). If git was already settled at desk opening (SEATS.md / SYSTEM-FACTS.md),
     delete this section. -->

## Pattern review log

<!-- YYYY-MM-DD · which `open — try first` line · what the team found · operator's answer (mark) -->
