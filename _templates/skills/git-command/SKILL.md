---
name: git-command
description: "Load when you are the SA role and the PM has ordered 'ขึ้น git' (put the code up) on a desk in ai-agent-workspace. Covers the one central git convention every desk shares (commit-message shape, work on the existing branch, no new branches, no history rewriting) and the two commands: รวมโค้ด = run the repo's merge-workflow.sh to integrate with develop; เอาโค้ดขึ้น = commit and sync (push). Do NOT load for PM/BA/FE/BE/QA seats, for Atlas/Marie/Otto, for git inside the workspace folder (agents never commit there), or without a PM order."
---

# git-command — the SA's git, on the PM's order

**If the desk's files disagree with this skill, the desk wins; report the disagreement to the PM.**
Generic desk mechanics (identity, log, evidence, safe edits) live in `workforce-protocol`; the two
worlds and the paths rule live in the workspace `CLAUDE.md`. This skill is the git craft only, and
it is **one central convention for every desk** — a desk supplies facts (branch, repo, whether a
`merge-workflow.sh` and a `develop` exist), never a second convention.

## 1. The gate — do not run a single git write until all of these hold

Git used to be the human's alone. It is now **the SA's, and only the SA's** — under three conditions
that are all required, every time:

1. **You are the SA** of this desk. No other seat runs git. Engineers (BE/FE) never commit, push,
   branch or tag; they finish reviewed code **in the working tree** and set the TASK to `REVIEW`.
   If you are not the SA, stop — this skill is not yours.
2. **The PM ordered it through the chain** — the words are `ขึ้น git` (put the code up), in your
   inbox or the board, from the PM. A nudge, your own judgement, or an engineer asking is **not** an
   order. No order ⇒ do nothing; ask the PM.
3. **The work is reviewed and `DONE`.** You committing is the last step after your own `DONE`
   verdict, not a way to "save progress". Nothing half-reviewed goes up.

Two hard lines that no order can cross:

- **Never git inside the workspace folder.** The `ai-worker/` coordination files are never committed
  by any agent, ever (`CLAUDE.md`). This skill runs **only inside a code repo** whose path you read
  from `machine.local.md`.
- **Never touch a real environment, tag or release.** Push to the shared remote is allowed by this
  skill; deploying, tagging a release, or anything on production/the customer's system stays the
  human's — a DATA REQUEST / release request up the chain, never a git write here.

## 2. The one central convention — the same on every desk

- **Work on the existing branch. Never create, rename or switch branches yourself.** The desk has one
  working branch; you commit onto whatever branch the repo is already on. Branch model is a desk
  fact (`PROTOCOL.md` / `SYSTEM-FACTS.md`): if the repo is sitting on `main`/`master`/`develop` and
  the desk has not said that is the working branch, **stop and ask the PM** — do not commit onto it.
- **Never rewrite history.** No `--force`, no `--amend` of a pushed commit, no rebase that rewrites
  what is already on the remote, no `git reset --hard` that drops reviewed work.
- **Commit-message shape** (central, one set):
  ```
  <type>: <imperative summary> (TASK-<ID>[, TASK-<ID>])
  ```
  `<type>` ∈ `feat | fix | refactor | test | docs | chore`. Summary is concise and imperative;
  English by default (a desk whose convention is Thai overrides). Name every TASK the commit
  delivers — that is the thread from the commit back to the SPEC. One logical change per commit
  where it is cheap; one commit for a reviewed batch is fine.
- **A commit carries only reviewed work.** If `git status` shows files no TASK named, stop and find
  out why before committing — never sweep strays in with `git add -A` blind.

## 3. The two commands

The order is fixed: **เอาโค้ดขึ้น first, รวมโค้ด second.** `merge-workflow.sh` refuses to run with a
dirty tree, so you commit and push before you integrate.

### 3A. เอาโค้ดขึ้น — commit and sync (push)

1. **Confirm the world.** You are in the code repo, not the workspace:
   `git rev-parse --show-toplevel` → the path from `machine.local.md`, not an `ai-worker` path.
2. **Confirm the branch.** `git branch --show-current` → the desk's working branch (§2). On
   `main`/`master`/`develop` and the desk has not blessed it ⇒ stop, ask the PM.
3. **See what will go up.** `git status --porcelain` and `git diff --stat`. Every path maps to a
   reviewed `DONE` TASK. A stray file is a question, not a `git add -A`.
4. **Stage and commit** with the §2 message:
   `git add <the reviewed files>` (or `-A` only once step 3 is clean) → `git commit -m '<message>'`.
5. **Sync.** `git fetch origin` → if behind, integrate per the desk's convention (the desk's
   `merge-workflow.sh` is the normal integrator; a plain `git pull` only if the desk says so) →
   `git push origin <current-branch>`.
6. **Capture the output** of the commit and the push (the commit sha, the push summary) — that is
   your evidence (§4).

### 3B. รวมโค้ด — integrate with develop (run `merge-workflow.sh`)

This is the desk's integration script; it syncs `develop → your branch` and `your branch → develop`
and pushes both. It applies **only where the desk has a `develop` and ships the script** — a desk
whose only branch is `main` has no `รวมโค้ด`; say so to the PM, do not improvise a merge.

1. **Tree must be clean.** `git status --porcelain` is empty — you ran §3A first. If it is dirty,
   commit (§3A) before integrating; do not rely on the script's stash prompt.
2. **Run it from the repo root:** `./merge-workflow.sh` (the path is the repo's own copy — find the
   repo via `machine.local.md`; never run the workspace copy against a code repo).
3. **Read every line of its output.** It is interactive and it can stop on a conflict.
4. **On a merge conflict: STOP.** Do not guess a resolution and do not force anything. A conflict is
   a design decision — report it to the PM with the exact conflict output; the resolution may need
   the owner. Resolving blind is how you ship a silent regression.
5. **Capture the final summary** (the script's `✅ Sync Complete` block, or the conflict) as evidence.

## 4. After — evidence, log, hand back

- **Paste the real command output** (commit sha, push result, the script's summary) into the TASK /
  the log, the same way any evidence is recorded (`workforce-protocol` §14). "Pushed" without the
  output is not evidence.
- **Log one entry** through the desk's log script: what went up, which TASK IDs, which branch, and
  whether `รวมโค้ด` ran or did not apply.
- **Report up to the PM** in one line: done / where it is / anything the PM must relay to the owner
  (a release or tag the human still has to make, a conflict that is waiting).
- **A failure is reported, never worked around.** Push rejected, auth failed, conflict, wrong branch
  — stop and tell the PM with the output. Record it in `FAILURES.md` if it was your mistake
  (wrong branch, strays swept in, an order you acted on that never came).

## 5. Skills you call

| Situation | Skill |
|---|---|
| About to write a `DONE`/"synced"/"pushed" claim | `superpowers:verification-before-completion` — confirm against real output first |
| A clean branch-integration flow beyond this script | `superpowers:finishing-a-development-branch` — **only within §1–§2 above** |
| The PM's open session needs waking after you push | `nudge-session` (files first, then nudge) |

## 6. Anti-patterns you will be tempted by

- **Treating a nudge or your own judgement as the order.** Only `ขึ้น git` from the PM counts (§1.2).
- **Committing to "save progress."** Git here is the last step after `DONE`, not a checkpoint.
- **`git add -A` over a dirty tree.** Strays no TASK named go up with the batch and nobody notices.
- **Creating a feature branch per task.** The desk works on one existing branch (§2); splitting is
  not your call.
- **Forcing past a conflict** in `merge-workflow.sh` — that is deciding a merge blind. Stop, report.
- **Running git in the workspace**, or committing an absolute path / a secret / a local `.env`.
- **Rewriting pushed history** to "tidy up" — `--force`/`--amend`/hard-reset on what is on the remote.
- **Claiming it went up without the output** — a push summary or sha, or it is `UNVERIFIED`.

## 7. Desk handshake

Before running anything: the identity line the desk prescribes, then the desk signpost
`<desk>/CLAUDE.md` reading list for the SA seat. From the desk come the **working branch**, the
**repo path** (via `machine.local.md`), whether this repo ships a **`merge-workflow.sh`** and has a
**`develop`**, the TASK ID prefix, and the failure log. This skill supplies only the convention and
the two commands; everything desk-specific, the desk wins.
