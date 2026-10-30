# spec-rules.md — the long form of the SA's SPEC and TASK rules from ORDER 45

> Not a startup read. `SA-Lead.md` § SPEC template points here in one line; read the § that applies
> **before** you write that part of a SPEC or cut that TASK. Written by Marie, 2026-10-30, from Atlas's
> FAILURES review i-space F-016…F-042 (`ATLAS.md`). Every rule: *(F-ids; owner via Atom 2026-10-30 16:04;
> ORDER 45)*. If this file and `SA-Lead.md` disagree, `SA-Lead.md` wins — tell the PM.

## 1. Consumers come from the probe, not from a grep (P1c)
*(F-018, F-019, F-026, F-027, F-028, F-029, F-034, F-035, F-036, F-042; owner via Atom 2026-10-30 16:04; ORDER 45)*

A grep picks its own words. Thirteen misses after the grep rule were test roots, schema objects, typed
fixtures and generated types — all things the compiler and the tests find by themselves.

- **Which sections:** any SPEC section that changes a shape — a field, its required-ness, a schema object, a
  column, `openapi.json`, an event sequence, or a function's inputs (a new parameter, a new client passed in).
- **How:** write the change as a small patch (by hand, or `diff -u` of a copy — never in the real repo) and run
  `bash ai-worker/tools/probe-change.sh <repo> <patch-file>` from the desk. It copies the working tree to a
  scratch dir, applies the patch, runs the repo's checks on the base and the patched copy, and prints only the
  NEW errors. A back whose `openapi.json` changes also runs its paired front (§ 2). Usage and env: the script's
  header. Defaults are the full checks (blueprint-back's `bun test` takes ~5 min, twice); a cheaper first pass
  is a custom command, e.g. `'node_modules/.bin/tsc --noEmit --pretty false'` — but a behaviour change (an event
  count, a sequence) needs the tests, so run the defaults before the TASKs are cut.
- **What goes in the SPEC**, in the changed section, pasted, then ticked:
  ```
  Consumers (probe): probe-change.sh blueprint-back owner.patch → 3 errors
  blueprint-back → src/http/routes/projects.ts:43 TS2322 … → TASK-150
  blueprint-front → src/features/chat/load.test.ts:18 TS2741 … → TASK-151
  blueprint-front → src/features/ready/load.test.ts:16 TS2741 … → untouched — <why>
  ```
  One line per hit, right under the `Consumers (probe):` line, no blank line in between (a blank line or a
  heading ends the list). Each ends `→ TASK-xxx` (that file is in that TASK's closed list) or
  `→ untouched — <why>`. `→ 0 errors` with no hit lines is a valid result.
- **"untouched" is never allowed for a file that builds a literal of the changed type** (a typed fixture, a
  test helper, a seed) — it will not compile (F-029).
- **A grep line alone is no longer enough.** A grep may still add hits the probe cannot see (prose, a string
  key, a doc); write it as before, under the probe lines.
- **Re-run at release.** A TASK cut on an earlier day: re-run the probe on today's tree before releasing it
  (F-034).
- The gate: `check-hygiene i-space` WARNs on a DRAFT/ACTIVE/IN_PROGRESS SPEC section that changes a shape with no
  `Consumers (probe):` line, and on a hit line without `→ TASK-` or `→ untouched —` (switch `checks.json` →
  `hygiene.spec-probe`).

## 2. `openapi.json` is paired with the front (F-036, F-042)
*(F-036, F-042; owner via Atom 2026-10-30 16:04; ORDER 45)*

- A TASK whose diff touches a back end's `openapi.json` has, **by default**, a paired front step: the front's
  `bun run gen:api` + `bun run typecheck` (+ `bun run check:api` in blueprint-front) — in the same team's FE
  TASK, or its own XS FE TASK. "The front calls none of the new routes" is not a reason to skip it: the front's
  generated types mirror the whole document. Skipping it needs a written why in the SPEC.
- **Its review runs the front's `check:api`** (blueprint-front) or `gen:api` + `typecheck` (caw-front) on the
  finished pair, before you set either TASK `DONE`.
- `probe-change.sh` on the back does this for you at SPEC time: when the patched `openapi.json` differs from the
  base one, it prints the front's errors too and a `⇒ … needs its gen:api … step` line.

## 3. Derived rules (P12)
*(F-037, F-038, F-040; owner via Atom 2026-10-30 16:04; ORDER 45)*

- **Per kind or anchor ⇒ a result table.** A rule computed per kind or anchor (a card's anchor, a part kind,
  an event type) gives its result for **every kind the consumer actually uses**, in a table, before the TASK is
  cut — not one worked example (F-037: a work anchor got none of its steps' rules).
- **A state derived from data an existing rule already uses** (waiting vs workable) cites that rule's
  `file:line` and works **one boundary case** through both rules in the SPEC (F-038: a done card in the middle).
- **Uniqueness, nullability or range** of a value is claimed only with the schema line that decides it
  (`grep -n` on the table definition, e.g. `src/db/schema.ts:24 uniqueIndex(…)`) (F-040).

## 4. Git safety (P13)
*(F-031, F-033; owner via Atom 2026-10-30 16:04; ORDER 45)*

- **(a) A new file is checked against `.gitignore` at cut time.** A TASK that creates a file has a DoD line
  `git check-ignore -v <path>` → exit 1, no output (base: `<pasted>` — run at cut time, in the repo; it only
  reads). Exit 0 means a commit would silently leave the file out (F-033: `src/coverage/` hidden by `coverage`):
  pick another path.
- **(b) One tree fingerprint:** `bash ai-worker/tools/tree-fp.sh <repo>` — tracked + untracked (not ignored)
  files by content and mode; read only, never writes the index. QA's verdict names the value it tested; the SA's
  pre-commit check compares it. `--list` prints one line per path, so two lists can be diffed to find the
  difference. Never improvise a fingerprint recipe in a live repo.
- **(c) Any git experiment beyond reading happens in a scratch copy** (`cp -a` of the repo, or the probe's copy)
  — never `git add -N`, `stash`, `reset`, `checkout` or an index-touching "variant" in the team's working tree.
- **(d) The SA's pre-commit check**, before the owner's `ขึ้น git` is typed: `git status --short
  --untracked-files=all` (read with `GIT_OPTIONAL_LOCKS=0`) against **every new path** named in the topic's
  TASKs — each new path must appear as `??` or `A`; a missing one is ignored or not written: stop and tell the
  PM. Then `tree-fp.sh` = the value in QA's verdict, or say what changed since.

## 5. Wording: every placeholder has a source (Q2)
*(F-021, F-024; owner via Atom 2026-10-30 16:04; ORDER 45)*

Every user-visible line a SPEC adds lists its placeholders, each with the record field it comes from:
`"บันทึกแล้ว {n} รายการ" — {n} ← round_adjusted.saved (new column, § Data Model)`. A placeholder with no
field is a field the SPEC must add, or a line it must change.

## 6. Scarce live calls (Q3, Q3b)
*(F-020, F-023; owner via Atom 2026-10-30 16:04; ORDER 45)*

- **Diagnose first.** Before a design spends scarce live model calls (gateway calls, a live Claude run), the
  server records what is needed to diagnose a failure: **the failing item and the reason** (the refused change,
  the validation error), where QA can read it after the run. A live run that fails without that is wasted.
- **The full schema in the prompt.** A prompt that asks a model for structured output carries the full schema
  — types, patterns, required — **generated from the same zod schema the server validates with**, never a
  hand-written summary of it.

## 7. A deny-rule is probed with the real parser (Q4)
*(F-022; owner via Atom 2026-10-30 16:04; ORDER 45)*

A deny-rule on a value another program parses (a port, a URL, a header, a path) is reviewed by probing **that
program's own alternative spellings with the real program** — e.g. `curl` with `04500`, `-H @file`, a trailing
dot — not by reading the rule. Each spelling tried is a line in the review with its real result.
