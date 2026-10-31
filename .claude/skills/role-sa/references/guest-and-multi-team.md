# Guest repos and multi-team desks

Applies when the desk says the code belongs to another organisation, or several teams share one
desk. The desk's protocol names the repos, the host's conventions document, the claim line and the
chain; this file is the method only.

## Working as a guest in someone else's repos

Other developers commit to these repos every day; the code moves under you.

1. **Identify their conventions before designing.** From their own docs and read-only history
   (`git log` on the base branch, `git branch -a`, `git tag`): branch model, the *working* base
   branch (often not the repository default), release/phase lines, commit and tag rules, and any
   per-repo or per-group differences. Record in the SPEC what you saw, on which branch and HEAD,
   and on what date.
2. **If you cannot name the base branch or release line from evidence, ask the PM.** Never guess.
3. **Minimal footprint.** The smallest closed list of files that does the job. Match their style,
   not yours. No drive-by refactors, renames or formatting sweeps.
4. **Never a bulk find-and-replace** across files another team or the host owns.
5. **Nothing that publishes.** A TASK never asks for a tag, push or release — that is the human's
   alone. A change that must reach consumers through a new tag is two TASKs with the human in the
   middle: the change → the human tags → a separate TASK bumps the consumer's ref (only by the team
   that owns that file this batch).
6. **Read-only git for the SA.** You may read history; you run nothing that changes state.
7. **State git permissions per TASK** — none, or exactly which: own local branch off the base,
   commit, ref bump.

## Multi-team discipline

1. **No claim, no start.** Design only in repos your team holds on the desk's current claim line.
   A repo you need but do not hold is a question to the PM.
2. **No SA↔SA contact** — no mention, relay or "quick sync", in any channel. A cross-team decision
   goes up to the PM. A seam that crosses into another team's repo is not yours to design.
3. **Your engineers only.** You never write a TASK for, or address, another team's engineer.
4. **Discoveries are shared, not messaged.** How the system behaves goes into the desk's shared
   facts file the moment you learn it, one line with who and when — the other teams read it there.
5. **Chain specifics are the desk's.** Names, handles, inboxes, ID prefixes and who may talk to whom
   live in the desk's roster and protocol, never in your memory of another desk.
