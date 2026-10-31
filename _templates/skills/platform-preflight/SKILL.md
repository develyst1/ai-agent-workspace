---
name: platform-preflight
description: "Load EVERY time the workspace's Release & Platform role (OTTO.md) is about to act — build, deploy, install, configure, test or clean up — on a server or on a desk's app, before the first command that changes anything, AND before reporting anything as done. Six gates, each answered in writing: survey what already exists, read the desk's REQ/SPEC/TASK, check which proposals the owner actually answered, batch the sitting's root work into one prompt, prove the clean-up, and prove 'done' on the real path with the gaps named. Born from OTTO-FAILURES OF-001…OF-008 (2026-10-31). Do NOT load for desk roles, or for read-only investigation that changes nothing."
---

# platform-preflight — look, read, confirm, batch, clean

On 2026-10-31 the platform role made seven mistakes in one afternoon (`OTTO-FAILURES.md` OF-001…OF-007). Six had
one root: **it produced before it looked, and it treated its own plan as agreed.** These gates stop that. Answer
each one in a few lines **in your reply or working notes before the first changing command**. A gate you skip
must say why.

## Gate 1 — What already exists? (OF-001, OF-003)

Before you build, write, install or ask the owner for anything, look for it:
- **The artifact:** is a tested build already in the repo's checkout (`dist/`, `.next*/standalone/`)? When was it
  built, and by which TASK? **Use the tested artifact. Never rebuild in a clone of your own on the owner's PC.**
- **The data source and config:** what does the working local setup use? Read the `.env` *keys* and host:port
  (**never print a secret value**), then check that host:port is reachable from the server.
- **The box:** `pm2 list`, the nginx sites, listening ports, and the port registry.

**Something seems missing ⇒ find what the working setup uses before you ask the owner.**

## Gate 2 — What did the desk already write? (OF-002)

For a desk's app, read the **REQ, SPEC and TASK that produced this build**, plus the desk's `SYSTEM-FACTS.md` lines on
deploy and environment. Their known limits ("the binary needs Postgres; pglite:memory crashes it") and env needs
outrank your reading of the source. Quote the line you relied on.

## Gate 3 — Which proposals did the owner actually answer? (OF-004)

Keep a ledger of every proposal you made in this sitting:

| Proposal | Owner's answer (quote) | Status |
|---|---|---|
| … | "โอเคนะ" (on the login question only) | answered / **unanswered** |

**An answer covers only the question it answered.** Act only on answered rows. Confirm the unanswered ones in **one
line**, all together, before acting on any of them.

## Gate 4 — One root prompt per sitting (OF-007)

- List every step this sitting will need root for, **before the first one**.
- Write them as **one reviewed script** that shows each step: what it does, what it changes, and its check. The owner
  then types the password **once**. Steps are visible, never hidden in one `sh -c` line.
- A second prompt in the same sitting is allowed only for a step you could not know beforehand, and you say why.
- If a step exists only because of an unconfirmed proposal (Gate 3), it is not on the list.

## Gate 5 — Prove the clean-up (OF-005, OF-006)

- After any throwaway test: read the **full** `pm2 list` and the saved dump (`pm2 save` contents), not a `grep` for
  the name you expected. Remove every app you created, then `pm2 save`.
- **Delete only paths you created and can name.** Never glob over a shared directory (`/tmp/tmp.*`, `/srv/apps/*`).
- **Clean up only after every job you scheduled in this sitting has fired.** List them first (for example
  `systemctl list-timers | grep otto-`, `atq`). A file a pending timer still reads (a guard's confirmation flag)
  is not yours to delete yet. (OF-011.)
- Paste the before/after into the report.

## Gate 6 — "Done" means proven on the real path, with the gaps named (OF-008)

Before you tell the owner anything is done, or recommend stopping:
- **Say what it is for, not only what you built.** A deploy pipeline exists to stop bad code before it ships, so
  "the pipe runs and rollback works" is not "done".
- **List the checks it runs AND the checks it does not run.** For example: "runs typecheck + build; does NOT run
  the back's `bun test` or the front's Playwright specs; the health check catches a crash, not wrong behaviour".
- **Show one failing case going through the real path.** Push a deliberately broken change through CI itself and
  watch it stop. A test that goes **around** the thing under test (straight to `deploy-app`, skipping CI) proves
  only the part it touched, and you must say so.
- **A decision parked in a brief or plan ("tests later") is raised to the owner,** in one line, every time you
  report that area done. It is never treated as settled because it was written down.

## After a mistake

Append an `OF-NNN` entry to `OTTO-FAILURES.md` before your next reply to the owner, in its own format. Never close
or grade your own entry.
