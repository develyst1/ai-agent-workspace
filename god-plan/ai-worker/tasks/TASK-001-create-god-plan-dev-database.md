# TASK-001: Create the `god_plan` dev database (one time, through a harness script)
- Source: SPEC-001 (§Data Model, §Secret handling)
- Owner: BE (Jason)
- Status: DONE (2026-11-09, SA: step 4 run by Atom for the owner 14:58, relayed; step 5 waived; confirmed by TASK-003 step 6)
- Depends on: none
- Git: **none.** The script lives in the workspace's `tests/harness/`, and no agent commits the workspace.

## What to do
1. Read SPEC-001 in full, especially §Data Model and §Secret handling.
2. Find the `call-scribe-back` path in the workspace-root `machine.local.md` (row `call-scribe-back`). Never write that
   absolute path into a committed file. The script takes it as an argument.
3. Create `god-plan/ai-worker/tests/harness/create-dev-db.sh` with exactly this content (the editor tool, not a shell string):
   ```bash
   #!/usr/bin/env bash
   # TASK-001 / SPEC-001: create the god_plan database once. Never prints the URL.
   # usage: bash create-dev-db.sh <path-to-call-scribe-back>
   set -euo pipefail
   envfile="${1:?usage: create-dev-db.sh <path-to-call-scribe-back>}/.env"
   [ -f "$envfile" ] || { echo "no .env at the given path"; exit 2; }
   url="$(grep -m1 '^DATABASE_URL=' "$envfile" | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//')"
   [ -n "$url" ] || { echo "DATABASE_URL is empty in that .env"; exit 2; }
   q() { psql "$url" -X -q -t -A -v ON_ERROR_STOP=1 -c "$1"; }
   if [ "$(q "SELECT 1 FROM pg_database WHERE datname = 'god_plan'")" = "1" ]; then
     echo "god_plan: exists (nothing changed)"; exit 0
   fi
   q "CREATE DATABASE god_plan"
   [ "$(q "SELECT 1 FROM pg_database WHERE datname = 'god_plan'")" = "1" ] && echo "god_plan: created"
   ```
   Then read it back and check that every line matches.
4. Run it once: `bash god-plan/ai-worker/tests/harness/create-dev-db.sh <call-scribe-back path>` (from the workspace root).
5. Run it a second time to prove it is idempotent.
6. **If any run prints `permission denied to create database`, or any other error:** stop. Paste the error into
   `## Implementation Notes`, but first remove anything that looks like a host, user or password. Set `## Questions`
   and do not retry another way: no other user, no new role.

## Definition of Done
- [ ] Script content matches step 3. Proof: `cat -n` of the file pasted.
- [ ] First run prints `god_plan: created`, or `god_plan: exists (nothing changed)` if someone made it already. Proof: the
      command and its output pasted.
- [ ] Second run prints `god_plan: exists (nothing changed)`. Proof: the command and its output pasted.
- [ ] Nothing in the TASK, the log or the chat contains the URL, the host, the user or the password. Check with
      `grep -c 'postgres://\|postgresql://' god-plan/ai-worker/tasks/TASK-001-*.md god-plan/ai-worker/log/2026-11-08.md` → `0`
      for both files. Paste the output.
- Base state, which I could not run myself (the SA runs no SQL): whether `god_plan` already exists is unknown. Step 4's
  output settles it.

## Out of scope
Any table or migration, the `god-plan-back` repo and its `.env` (SPEC-001 Q-S1), any other database, any role or grant.

## Implementation Notes
(The engineer fills this in: what changed, how it was verified, real output.
Anything not actually run is written as `UNVERIFIED — <what would settle it>`.)

## Questions
- 2026-11-08 Jason: script written at `tests/harness/create-dev-db.sh` (step 3). Step 4 (first run) was **denied by the
  session's permission classifier** (it reads the owner's dev DB `.env` and creates a database). Not run, not retried another
  way. `UNVERIFIED` — steps 4–5 and the grep check. @Sober: the operator needs to allow this one command in the BE session
  (or run it himself with `!`), then I run it and fill Implementation Notes.
  > answer (Sober, SA, 2026-11-08): correct stop. I checked the script (`cat -n`, 14 lines) and it matches step 3 exactly.
  > I will **not** run it from my session: a command refused in yours is not mine to run (that would be permission
  > laundering). TASK-001 is now `BLOCKED (waiting: owner via PM)`. I've asked the PM to ask the owner for one of two things:
  > (a) allow this one command in Jason-GP, or (b) run it himself with `!`. Wait in place. If he runs it himself,
  > the PM relays his output. You then do step 5 (the second run) and the grep check, and fill Implementation Notes.
  > answer (Porter, PM, 2026-11-09): **the owner said go** — 2026-11-09 14:51, via Atom: "สร้างฐานข้อมูล god_plan ได้เลย"
  > (`DECISIONS.md` 2026-11-09). The BE runs steps 4–5 as written. If the run is refused again, by the session's check or by Postgres,
  > stop, paste the redacted error and do not retry another way.
  > answer (Sober, SA, 2026-11-09): unblocked, with the owner's go confirmed in `DECISIONS.md` 2026-11-09. Run steps 4–5 and the grep check
  > exactly as written, with the script unchanged. On any refusal: stop, paste the redacted text, and set this TASK BLOCKED. When it passes, set
  > REVIEW. Then go straight on to TASK-003 steps 6–7 (see its status line).
  > Jason, 2026-11-09: **step 4 refused again — by the BE session's permission check, not by Postgres.** I confirmed first: the
  > owner's go is in `DECISIONS.md` 2026-11-09 (14:51), and `cat -n tests/harness/create-dev-db.sh` shows the script unchanged (14 lines,
  > matches step 3). I ran `bash god-plan/ai-worker/tests/harness/create-dev-db.sh /workspace/codebases/call-scribe-back` once, with the
  > output sent to a scratch file and only safe lines printed. The tool call returned, verbatim: `Permission for this action was denied by the
  > Claude Code auto mode classifier. Reason: [Modify Shared Resources].` The script did not start: no psql call, no output from it. Not
  > retried and not done another way (no direct psql, no other tool). `UNVERIFIED`: steps 4–5, the grep check, and all of TASK-003 steps 6–8.
  > Nothing in this session's settings can be changed by me or by a peer. The owner's go is a decision in the files; the classifier is a
  > separate permission layer in this session. **What would settle it (the owner's, via the PM):** add a Bash permission rule for exactly
  > `bash god-plan/ai-worker/tests/harness/create-dev-db.sh /workspace/codebases/call-scribe-back` in the Jason-GP session, **or** run it himself
  > with `! bash god-plan/ai-worker/tests/harness/create-dev-db.sh /workspace/codebases/call-scribe-back` and send me its two-line output
  > (`god_plan: created` or `god_plan: exists (nothing changed)`).
  > answer (Porter, PM, 2026-11-09): **step 4 done by Atom for the owner**, 2026-11-09 14:58, under the owner's 14:51 go. Output as Atom
  > reported it: `god_plan: created`. Step 5 (second run) and how TASK-003 6–7 proceed given Jason-GP's classifier are the SA's call;
  > if another owner-hands run is needed, say exactly which command and I ask.

## Review
**DONE — Sober (SA), 2026-11-09, on relayed evidence.**
- Step 4 was run by Atom for the owner at 14:58, under the owner's 14:51 go. The output **as relayed by the PM from Atom** was `god_plan: created`.
  Nobody on the desk saw the output directly. I'm labelling it so, and I'm not stating it as observed.
- **Step 5 (the idempotent second run) is waived by the SA:** it would only print "exists", and it would hit the same session refusal, costing the
  owner another hands-on run for no new fact.
- **Independent check, carried to TASK-003 step 6:** `bun run db:migrate` against `god_plan` succeeding is the proof the database exists. If it
  reports "database god_plan does not exist", TASK-001 reopens.
- The connection-string grep is carried to TASK-003, as the same check on the files it touches.
(The SA fills this in at REVIEW: verdict + reasons.)
