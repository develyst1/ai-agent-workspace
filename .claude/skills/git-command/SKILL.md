---
name: git-command
description: "Load when you are the SA role on a desk in ai-agent-workspace and the PM has relayed one of the OWNER's four git commands: 'ขึ้น git' (commit + sync with the repo's commit-message convention), 'รวมโค้ด' (run the repo's merge-workflow.sh), 'release code' (run the repo's release-workflow.sh), 'ตั้ง branch' (give a repo the owner's standard branches: develop, sit, production and his own). Covers the gate (the owner's own words only), the four commands, conflicts, installing a missing workflow script, and reporting hashes back. Do NOT load for PM/BA/FE/BE/QA seats, for Atlas/Marie/Otto, for git inside the workspace folder (agents never commit there), or when the owner has not said the command."
---

# git-command — the SA types the owner's four git commands

**Owner's ruling, 2026-10-25 (verbatim):** *"ฉันไม่ได้อยากให้สกิลนี้ ทำให้ SA ทำงานgit เอง แต่ฉันต้องการแค่
SA ทำงานขึ้นgit ให้เมื่อฉันสั่ง ซึ่งฉันจะสั่งผ่านPM และ ฉันจะบอก PMเป็นแค่ คำสั่ง"* — and he named the
commands (§3). This replaces the 2026-10-22 version, under which the PM could order git on his own;
the owner found commits he had not asked for.

**If the desk's files disagree with this skill, the desk wins; report the disagreement to the PM.**

## 1. The gate — no git write until ALL of these hold

1. **You are the SA** of this desk. No other seat runs git. Engineers (BE/FE) never commit, push,
   branch or tag; they finish reviewed code in the working tree and set the TASK to `REVIEW`.
2. **The OWNER said the command, and the PM relayed it.** The PM's inbox line to you must quote the
   owner's words (`ขึ้น git` / `รวมโค้ด` / `release code` / `ตั้ง branch`) with the date. **The PM never originates a
   git command**, and your own judgement, a nudge, or an engineer asking is not one. No quoted owner
   command ⇒ do nothing; ask the PM.
3. **Only the command he said.** `ขึ้น git` does not include `รวมโค้ด`; `รวมโค้ด` does not include
   `release code`. One command, one run.
4. **The work is reviewed and `DONE`** — nothing half-reviewed goes up.

Hard lines no command crosses:

- **Never git inside the workspace folder.** `ai-worker/` coordination files are never committed by
  any agent, ever. Run only inside a code repo whose path you read from `machine.local.md`.
- **Never rewrite history.** No `--force`, no `--amend` of a pushed commit, no rebase of pushed work,
  no `reset --hard` that drops reviewed work. **Never create, rename or delete branches**, except
  the standard four that `ตั้ง branch` (§3D) adds. It never renames or deletes any branch.
- **No tags, no server deploy, nothing on the customer's system** — those stay the owner's.

## 2. Before any command

- `git rev-parse --show-toplevel` → the repo path from `machine.local.md`, not a workspace path.
- `git branch --show-current` → stay on the branch the repo is on. If it is `main`/`master`/
  `develop`/`production` and the desk has not named it the working branch ⇒ stop, ask the PM.
- `git status --porcelain` → every changed path maps to a reviewed `DONE` TASK. A stray file is a
  question to the PM, never swept in with `git add -A`.

## 3. The four commands

### 3A. `ขึ้น git` — commit + sync, with the repo's commit-message convention

1. **Find the convention:** the desk's `CONVENTIONS.md` (git section), else the repo's own
   (`CONTRIBUTING`, commitlint config, a clear pattern in `git log --oneline -20`).
2. **No convention found ⇒ stop and ask** (to the PM, for the owner): *"repo `<name>` ไม่มี commit
   convention — จะสร้างไหม? เสนอ `<type>: <summary> (TASK-<ID>)`"*. Commit nothing until he answers;
   if he says yes, the SA writes it into the desk's `CONVENTIONS.md` through the PM, then commits.
3. **Commit** the reviewed files: `git add <files>` → `git commit -m '<message per convention>'`
   (name every TASK the commit delivers).
4. **Sync the current branch:** `git fetch origin` → `git pull origin <branch>` (a conflict here is
   handled as in 3B step 3) → `git push origin <branch>`.

### 3B. `รวมโค้ด` — run the repo's `merge-workflow.sh`

What it does: checkout `develop` → pull latest → back to your branch → merge `develop` into it →
push → checkout `develop` → merge your branch into it → push → back to your branch.

1. **Tree must be clean** (`git status --porcelain` empty). The script would ask to stash, and the
   question cannot be answered from here. Dirty ⇒ stop and tell the PM: *"มีงานยังไม่ commit — ต้อง
   `ขึ้น git` ก่อน"*. Never stash on your own.
2. **Run it from the repo root:** `bash ./merge-workflow.sh`. Read every line of the output.
3. **On a conflict: fix it, then run the script again** (owner's ruling). Fixing means: open each
   conflicted file, keep both sides' intent, run the repo's build/tests, `git add` + `git commit`,
   then rerun. If you cannot tell which side is right — the two sides change the same behaviour
   differently — stop and ask the PM; that is a decision, not a merge.
4. **Script missing ⇒ install it** from this skill's `scripts/merge-workflow.sh` into the repo root,
   tell the PM you added it, then run it. (The new file goes up with the next `ขึ้น git`.)

### 3C. `release code` — run the repo's `release-workflow.sh`

What it does: pull latest `develop` → checkout `production` → pull → merge `develop` into it →
push `production` → back to the original branch.

1. **Tree must be clean**, as in 3B step 1.
2. **Script missing ⇒ install it** from this skill's `scripts/release-workflow.sh` into the repo
   root, tell the PM, then run it.
3. **No `production` branch on the remote ⇒ stop and ask the PM** (the fix is the owner's `ตั้ง branch`, §3D).
4. **On a conflict: fix and rerun**, as in 3B step 3.
5. If the repo deploys automatically from `production`, this command deploys — the owner's own
   word is the authority for that, which is why only his word starts it.

### 3D. `ตั้ง branch` — the owner's standard branches

The owner's standard (root `CLAUDE.md` rule 6, which names his own branch):

| Branch | What it is | How code reaches it |
|---|---|---|
| the owner's own | the desk's working branch; engineers' reviewed work is committed here | `ขึ้น git` |
| `develop` | integration; CI runs checks only | `รวมโค้ด` (own ↔ develop) |
| `sit` | **a push here deploys** to the SIT server (the platform's `deploy-sit` CI) | develop → sit, by the owner or the platform role; not one of these four commands |
| `production` | what is live for the customer | `release code` (develop → production) |

1. **Read first:** `git fetch origin`, `git branch -r`, and the remote's default branch
   (`git remote show origin` → "HEAD branch", for example `main`). That default is the **base**.
2. **Create only what is missing, all at the base commit, on the remote, with no checkout:**
   `git push origin <base>:refs/heads/<name>` for each of `develop`, `sit`, `production` and the
   owner's own branch that does not exist yet. **Exception: if the base already holds a workflow
   that deploys on `sit`** (`.github/workflows/` mentions `sit`), creating `sit` deploys. In that case,
   skip `sit` and ask the PM. A branch that already exists is **left as it is**
   (named in the report), even if it points somewhere else. Never rename or delete `main` or any other
   branch.
3. **Local checkout → the owner's own branch,** only if the tree is clean:
   `git checkout -b <own> origin/<own>`, or `git checkout <own>` if it already exists locally. A dirty tree ⇒
   stop and tell the PM. The SA writes the working branch into the desk's `SYSTEM-FACTS.md`
   (repo · working branch · date).
4. **Not yours, so name them in the report as the owner's one-liners:**
   - the GitHub **default branch** is a repo setting: `develop` is recommended, set in Settings → Branches;
   - **CI on `sit`** is the platform role's first deploy (its `platform-deploy-app` skill). A new repo's
     first `sit` push may start no CI run, which a later empty commit fixes, and that is the platform
     role's step too.
5. **Report** as §4: `<branch> → <short hash>` for each of the four, marked *created* or *already there*.

## 4. After every command — the owner must see it

- **Report to the PM** with the real output: branch, every commit hash, the push lines, the
  script's `✅ … Complete` block (or the conflict and how you fixed it). "Pushed" without output is
  `UNVERIFIED`.
- **The PM puts it on the FIRST line of his next reply to the owner**: `git: <command> เสร็จ —
  <repo> <branch> <hashes>`. Never buried inside a longer message.
- **A failure is reported, never worked around** (push rejected, auth failed, wrong branch, missing
  `production`). Your own mistake goes into `FAILURES.md`.

## 5. Anti-patterns

- Acting on a PM line that does not quote the owner's command.
- Running `รวมโค้ด` or `release code` because `ขึ้น git` went well — one command, one run.
- `git add -A` over a dirty tree; stashing to make a script run.
- Creating a branch outside `ตั้ง branch`, or creating a commit convention without asking.
- In `ตั้ง branch`: moving an existing branch to the base, deleting `main`, or changing repo settings.
- Rewriting pushed history to tidy up.
