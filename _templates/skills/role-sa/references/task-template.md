# TASK template

One TASK = one owner, one working session, executable without a question. ID prefix and file name
come from the desk (e.g. `tasks/TASK-NNN-short-title.md`, or `TASK-<T>-NNN` with a team letter).

The block marked **if the desk requires** is mandatory on desks where the code belongs to someone
else or several teams share repos (the desk's protocol says so); elsewhere include only the lines
that apply. When you cannot fill a required line from evidence (e.g. the working base branch), that
is a question to the PM — never a guess. The repository's default branch is often not the working one.

```markdown
# TASK-<ID>: <short title>
- Source: SPEC-<ID>
- Owner: BE | FE (<the seat named on the desk roster>)   — exactly one
- Status: TODO | IN_PROGRESS | REVIEW | REWORK | DONE
- Depends on: TASK-<ID> | none

<!-- if the desk requires: -->
- Repo: <logical name>  — convention per the central `git-command` skill (one set, every desk)
  — held by this team on claim line <batch id>
- Base branch: <exact name> · Phase/release line: <id>
- Started from: base commit <sha> / tag <tag>
- Repo history read: YYYY-MM-DD, base branch HEAD <sha>
- Files the engineer may edit (closed list — nothing else):
  - <path inside the repo>
- Git writes allowed: **none** — the engineer never runs git. Reviewed changes stay in the
  working tree; the **SA** commits, pushes and integrates them on the PM's `ขึ้น git` order
  (`git-command` skill). Tags and releases stay the human's.
<!-- end -->

## What to do
Concrete behaviour and where it lives. Name the contract section of the SPEC this implements.
If this TASK changes a shape: list every consumer (grep result) and what each must still see.
State what the engineer may decide alone (internal names, helper placement) and must declare in
Implementation Notes.

## Definition of Done
- [ ] <checkable item> — proven by: `<exact command>` → expected <output>
- [ ] Reachability (UI work): the control renders at <screen/state> — proven by <screenshot/test>
- [ ] No file outside the closed list changed — proven by: `git status --porcelain` / `git diff --stat`

## Implementation Notes
(The engineer fills this in: what changed, how it was verified, real command + output.
Anything not actually run is written as `UNVERIFIED — <what would settle it>`.
Internal decisions taken alone: one line each, with the reason.)

## Questions
(Engineer asks; SA answers as `> answer: …`.)

## Review
(SA fills this in at REVIEW: verdict DONE | REWORK, reasons, evidence checked.)
```

Rules that do not fit in the block:
- No TASK asks for a bulk find-and-replace across code another team or the host owns.
- A change that must reach consumers through a new tag/release is two TASKs with the human
  publishing in between: the change, then (after the human tags) the consumer bump.
- A both-sides change is two TASKs, one per owner, linked by `Depends on:` in the stated order.
