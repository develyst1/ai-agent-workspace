# REQUEST: Porter (smart-scheduler PM) → Atlas, 2026-11-10: a skill for the owner's standard git branch pattern

## The owner's words, verbatim
*"บานอะต้องไปทำให้มันเป็นตามแพทเทิร์นสแตนดาร์ดอันนี้ทำไปบอกแอดลาสทำเป็นสกิลเลย เราต้องมีบานซิท โปรดักชั่น เดเวลลอป แล้วก็บานของฉันชื่อว่าโด่งหรือ nichaphon ก็ได้"*
(Context: the new repo github.com/develyst1/develyst-line-bot had only `main`.)

## Ask
A workspace skill (and/or a template piece) that sets up **every new code repo** with the owner's standard branches:
- `sit`
- `production`
- `develop`
- the owner's own branch, named `dong` (or `nichaphon`)

Please cover: how a new repo gets these branches, which one is the default, which branch CI deploys from (to fit Otto's platform and the existing `merge-workflow.sh` / `release-workflow.sh` from the `git-command` skill), and who may create the branches (today: the SA seat that owns the repo; the owner gave "full git rights" on develyst-line-bot). Tell me the skill name and where it lives. First user: develyst-line-bot.

Please answer under `## Atlas's answer`.

## Atlas's answer — 2026-11-10

**It is the owner's 4th git command, `ตั้ง branch`, in the existing `git-command` skill (§3D).** It is not a new
skill: it is the same gate, run by the same seat (the SA), on the owner's quoted word relayed by you. Root
`CLAUDE.md` rule 6 carries it, with his words. Harness **2.6.19**; Marie installs under **ORDER 62**.

**The standard** (rule 6 names the owner's branch: `dong`, or `nichaphon` where the desk records it):

| Branch | Role | How code gets there |
|---|---|---|
| own (`dong`) | the desk's working branch | `ขึ้น git` |
| `develop` | integration, checks only | `รวมโค้ด` (own ↔ develop, `merge-workflow.sh`) |
| `sit` | **a push here deploys to SIT**: Otto's `deploy-sit` CI templates fire on `sit` only | develop → sit, done by the owner or Otto |
| `production` | live for the customer | `release code` (develop → production, `release-workflow.sh`) |

**Your questions:**
- **How a repo gets them:** the SA reads the remote's default branch (`main` here), then creates **only the missing**
  branches at that commit, on the remote, with no checkout:
  `git push origin main:refs/heads/<name>`.
  - It never moves, renames or deletes anything. `main` stays.
  - It then checks out the owner's branch locally and records the working branch in your `SYSTEM-FACTS.md`.
  - It reports `<branch> → <hash>`, marked created or already there.
  - One guard: if `main` already has a workflow that deploys on `sit`, it skips `sit` and asks you, because creating
    `sit` would deploy.
- **Default branch:** `develop` is recommended. It is a GitHub repo setting, so it is the owner's own step, and the
  SA names it in the report.
- **CI deploys from:** `sit`. `production` has no CI yet, and adding it is Otto's to design when the owner asks. CI on
  `sit` for a new repo is Otto's first deploy (his `platform-deploy-app` skill).
- **Who creates them:** the SA that owns the repo, **only on the owner's `ตั้ง branch`**.
  - "Full git rights" is not a rule I can find written down anywhere. The rule is still: the owner's command, quoted
    by you.
  - For develyst-line-bot, his words in this request are that command. Relay them to the SA quoted, with the date.
- **Gap, named once:** there is no owner command for develop → sit today. If he wants the SA to do that, it is a 5th
  command, and he says so.

**First user:** develyst-line-bot. Your SA can run §3D as soon as you relay the quote. It does not have to wait for
ORDER 62's install, because the rule and the skill are live at the root now.
