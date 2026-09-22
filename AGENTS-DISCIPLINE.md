# Working discipline — every role, every AI vendor

> **Why this file exists.** Until 2026-09-23 a real part of how the roles behaved
> came from the owner's **personal, machine-local** assistant config — an
> always-invoke-first rule and a table of which technique to use when. It worked,
> and it was invisible: `grep` for it in any role file, `PROTOCOL.md` or the
> workspace `CLAUDE.md` returned **zero**. That breaks amnesia-first ("the repo is
> the only memory") and it would have vanished silently the moment a role moved to
> a different AI vendor — the work would just get slightly worse, with nothing to
> point at.
>
> So it lives here now, in the repo, vendor-neutral, and every role reads it.

## Think before you code

1. **Read first, write second.** The TASK, its SPEC, the existing code you are
   about to touch. Most "ambiguity" is a line someone skimmed.
2. **Keep it simple.** The straightforward implementation that a colleague can
   read beats the clever one. If you need a paragraph to explain why it works,
   it is probably wrong.
3. **Surgical changes.** Touch what the TASK names. No drive-by refactors, no
   renames, no dependency bumps, no reformatting, no "while I was in there".
   A diff that is bigger than the task is a diff nobody can review.
4. **State your assumptions out loud** — in the TASK's `## Implementation Notes`
   or `## Questions`. An assumption written down is a decision someone can veto;
   an assumption in your head is a defect waiting to be discovered by a customer.
5. **Define "done" before you start.** What command, what output, what screen
   proves this worked? If you cannot name it at the start, you will not be able
   to prove it at the end.

## Evidence before assertion

**Never claim complete, fixed, or passing without having run the check and seen
the output.** Paste the command and its real result. Summarising output you did
not run is fabrication — and it is the fastest way to lose the team's trust in
every other line you write.

If you could not run it, say so plainly and label it: `NOT VERIFIED` /
`NOT_TESTED`. That is an acceptable, expected answer here. A confident claim that
turns out to be untested is not.

## Which technique for which situation

| Situation | What to do |
|---|---|
| **A bug, a test failure, unexpected behaviour** | Reproduce it first, from a clean state. Trace the actual failure path in the code. Form one hypothesis and try to **falsify** it before you fix anything. A fix applied before a reproduction is a guess. |
| **Implementing a feature or a bugfix** | Where the repo works test-first, write the failing test first. Otherwise: name the verification before you write the code. |
| **Receiving a review (`REWORK`)** | Verify the feedback technically before implementing it. Agreeing performatively with a suggestion that is wrong wastes two people's time. If you disagree, say why, with evidence — then do what the reviewer decides. |
| **Frontend work** | `FERO-DESIGN.md` — contrast, layout, motion, the absolute bans, the four states. |
| **UI verification** | `TANYA-PLAYWRIGHT.md` — harness, hit-test, the four widths, what a mock run cannot prove. |
| **Something is ambiguous** | Write the question in the file and stop. Never resolve it by assumption. |
| **The work is bigger than one session** | Do one coherent unit, write your files, stop. Do not start a second unit. |

## What this does not change

The chain, the hard boundaries and the startup ritual in your own role charter
**outrank everything here.** This file is about craft; the charter is about
authority. When they appear to conflict, the charter wins and you report the
conflict.
