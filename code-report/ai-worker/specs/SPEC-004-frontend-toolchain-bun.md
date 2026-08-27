# SPEC-004: Frontend toolchain — bun replaces npm (team wording alignment)
- Source: REQ-005
- Status: ACTIVE

## Overview

REQ-005 mandates that `code-report-front` is installed, run and verified with
**bun**, not npm, and that npm is dropped permanently. The technical situation,
verified against the real repo at `C:\Users\Admin\develyst\code-report\code-report-front`
(HEAD `d44f523`, `git status --porcelain` empty):

- **The migration is already done in the repo, by the stakeholder.** `d44f523`
  adds `bun.lock` and deletes `package-lock.json` and nothing else (REQ-005 Q34).
- **`package.json` is runner-agnostic.** Its four scripts are
  `dev` → `next dev`, `build` → `next build`, `start` → `next start`,
  `typecheck` → `tsc --noEmit`. **No script names npm**, so `bun run <script>`
  invokes the identical underlying command npm would have. No script edit is
  required, and none is made (REQ-005 Req 4: no product change).
- The repo's own `README.md` / `AGENTS.md` / `CLAUDE.md` carry **no** npm
  command (re-checked while writing this), so REQ-005 Req 5 costs nothing inside
  the repo.

**Therefore there is no frontend production-code work in this REQ.** The entire
remaining scope (REQ-005 Req 3 + Req 5) is the *team's own working instructions*
still written in npm, plus one live verification that AC 1 asks for evidence of.

Why this shape: a toolchain word-swap on runner-agnostic scripts changes nothing
the user sees; the only real risks are (a) a future FE TASK still telling an
engineer to verify with a command the repo no longer uses, and (b) an unproven
assumption that `bun run typecheck` / `bun run build` actually succeed. This SPEC
closes (a) by rewriting the wording (SA-owned files, done as part of this SPEC),
and (b) with a single, minimal FE verification TASK.

## API / Interface Design

None. No endpoint, route, request/response shape, or contract is touched
(REQ-005 Req 4, Out of Scope).

## Data Model

None. No schema, migration, or seed. No dependency added or removed
(REQ-005 Out of Scope: "Upgrading, adding or removing any package").

## Flow

### Command mapping (the whole substitution)

Every team instruction for `code-report-front` uses this substitution, and no
other change is made to the surrounding text:

| npm form (old) | bun form (new) |
|----------------|----------------|
| `npm run dev` | `bun run dev` |
| `npm run build` | `bun run build` |
| `npm run start` / `start` | `bun run start` |
| `npm run typecheck` | `bun run typecheck` |
| `npm install` / `npm ci` | `bun install` |
| "Node/npm requirement" (prose) | "Node/bun requirement" |

Note on install: bun has no separate `ci` verb; `bun install` against the
committed `bun.lock` is the normal install, and `bun install --frozen-lockfile`
is the CI-strict form. Where a team instruction needs the plain install, it is
`bun install`. (No team instruction currently uses `npm install`/`npm ci`, so
this row is documented for completeness and for the TASK-016 hand-over prose.)

### Scope of the rewrite — which files, and the ruling on DONE tasks

**RULING (SA, recorded not guessed):** REQ-005 Req 3 says the goal is that "a
**future** TASK is verified by the command the repo actually uses", and AC reads
"No **frontend TASK is still gated** on an `npm` command". *Gated* means blocking
a tick that is still to be made. Therefore:

- **Open / future FE work is rewritten** — these are the only DoD lines that
  still gate anything: `TASK-015`, `TASK-016`, `TASK-020`, and `TASK-009`
  (its frontend build line), plus the **standing FE proxy rule** they cite.
- **Already-`DONE` FE tasks and their SPECs are left exactly as written**
  (`TASK-006/007/008/010/011/012/013/018/019`, `SPEC-001`, `SPEC-002`,
  `REQ-003`, historical log entries). They were verified under npm when npm was
  correct; rewriting a closed, evidenced record to a command it was not run with
  would falsify history and gates nothing. This is a deliberate ruling, not an
  omission.

**Concrete edits (SA-owned files, executed as part of this SPEC):**

1. `tasks/TASK-015`: DoD `npm run typecheck` → `bun run typecheck`;
   `npm run build` → `bun run build` (two DoD lines + the proxy-rule citation).
2. `tasks/TASK-016`: prose "Node/npm requirement" → "Node/bun requirement";
   the start-path example `npm run dev` → `bun run dev`; DoD
   `npm run typecheck` / `npm run build` → bun forms.
3. `tasks/TASK-020`: DoD `npm run typecheck` / `npm run build` → bun forms;
   the proxy-rule citation `npm run build` → `bun run build`.
4. `tasks/TASK-009`: the frontend acceptance line `npm run build` → `bun run build`
   (leaves the `bun test` backend half untouched; orthogonal to its pending
   re-scope).
5. `board.md`: the standing FE proxy rule's operative runner is now
   `before bun run build`. The 2026-08-21 adoption cell keeps its historical
   text (it records what was adopted then) with a dated "(runner → bun,
   2026-08-24, REQ-005)" note, so current state is bun without falsifying the
   record.

### Req 5 — npm dropped permanently

No instruction of ours may re-introduce an npm command for this repo, and
`package-lock.json` does not come back. After this SPEC's edits, a repo-wide grep
for `npm ` across `ai-worker/` should return only **historical** hits (closed
DONE tasks, dated log lines, this file's mapping table, and REQ-005 itself) — no
**open, gating** instruction. That is the standing check for Req 5.

## Non-functional

- **No secrets, no real environment, no SQL** — unchanged from every FE TASK.
- **Local-only** run, exactly the arrangement already in force.
- Verification evidence for AC 1 comes from the engineer running the commands
  locally; SA does not run the frontend.

## Acceptance mapping (REQ-005)

- **AC "`git status --porcelain` empty"** — already met at `d44f523` (Q34),
  re-verified by Porter and again here. No work.
- **AC "the three screens behave exactly as at `f70fb02`"** — met **by
  construction**: the only commit since `f70fb02` is `d44f523` (a lockfile swap,
  zero source diff), and no dependency changes. Recorded as an SA ruling; no
  exhaustive re-smoke of three screens is demanded, only a light boot sanity in
  TASK-021.
- **AC "`bun run dev` starts the frontend, and the frontend's own verification
  commands run under bun"** — the `bun run dev` half is already how the
  stakeholder runs it; the `typecheck`/`build`-under-bun half is proven by
  **TASK-021**.
- **AC "No frontend TASK is still gated on an `npm` command"** — met by the
  wording edits above (open tasks + standing rule) and the Req 5 grep check.

## Tasks

- TASK-021: FE — verify `code-report-front` builds and type-checks under bun,
  and boots with `bun run dev` (depends on: — ; the wording edits are SA-owned
  and carry no engineer dependency).

## Questions
(Jason/Fern ask here; Sober answers as `> answer: ...`)

- No open question to the human. Everything REQ-005 needs was ruled from the
  real repo and the REQ's own text; no business ambiguity remains. (Q35/Q34
  already answered; Q40's UI-language scope is a separate REQ-006-adjacent gate
  and does not touch this toolchain REQ.)
