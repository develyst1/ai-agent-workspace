# TASK-168: caw-back — a plan cannot be accepted twice; workers get their own temp folder; review/done refused while a temp folder sits in the work folder (REQ-126)
- Source: SPEC-125 D4, D6, D7 (+ prompt rule 8)
- Owner: BE (Bob)
- Status: DONE (2026-10-31 02:1x, Silver — § Review) · was REVIEW (2026-10-31, Bob; Q1 answered B and built; DoD 1–8 run — see Implementation Notes)
- Depends on: REQ-125 committed (5779554) ✓ — caw-back tree clean
- Git: none

## What to do
Closed file list (caw-back): `src/proposals/service.ts`, `src/cards/service.ts`, `src/cards/temp-folders.ts` (new), `src/http/errors.ts`, `src/runner/hop.ts`, `src/runner/pool.ts`, `src/runner/prompt.ts`, `src/runner/prompt.test.ts`, `src/runner/hop.test.ts`, `src/runner/pool.test.ts`, `openapi.json` (by `openapi:emit` only), `test/http/plan-copy.test.ts` (new), `test/http/temp-folders.test.ts` (new).

1. **D4** `accept`: inside the decision, 409 `plan_already_accepted` (message `แผนนี้ตกลงไปแล้ว`) when an accepted proposal of the project has the same items (length + each index's trimmed `title`, `anchor.key`, `workerId`).
2. **D6** For every worker process (the open worker in `pool.ts`, and the one-shot chat hop in `hop.ts`): create `<its folder>/tmp` and `<its folder>/cache` (0700), and pass `TMPDIR` / `XDG_CACHE_HOME` pointing at them, in place of the inherited `TMPDIR`. **Prove by a run** that a worker's Bash may write there: a `hop.test.ts` case that runs `bash-policy`'s judgement (`judgeBash`) on `touch "$TMPDIR/x"` with that folder in the readable list, and on `mkdir -p "$TMPDIR/profile"`. If the policy refuses, stop and write it in § Questions.
3. **Rule 8** in `prompt.ts`, exactly as `ai-worker/tests/harness/spec126.patch` (desk side); update `prompt.test.ts:45` (rule 7 is no longer last: rule 8 is).
4. **D7** `src/cards/temp-folders.ts` `tempFolderIn(roots, readOnly)`, exactly the SPEC's markers (i) and (ii) and the fixed list. `setStatus`: a `worker:` actor, `review` or `done`, after REQ-125's note check → 409 `temp_folder_in_work` with the PM's message (`{name}` filled), `details: { folder }`. Never delete. `git` is run with `GIT_OPTIONAL_LOCKS=0`, read-only.
5. `errors.ts`: add `plan_already_accepted · temp_folder_in_work` (as the probe); `openapi:emit`.
6. **Tests.**
   - `test/http/plan-copy.test.ts`: accept A → 200; an open B with A's items → 409 `plan_already_accepted`, nothing written; B with one title changed → 200.
   - `test/http/temp-folders.test.ts` (temp folders as roots): a dir with `Local State` → refused, naming it; `Default/Preferences` → refused; an untracked `.cache` → refused; `tmp/` **tracked** in a git root → allowed; `src/` → allowed; a read-only root's `.cache` → allowed; the operator → never refused; `todo`/`doing` → never checked.
   - `hop.test.ts` / `pool.test.ts`: the env has `TMPDIR` and `XDG_CACHE_HOME` under the worker's folder and the folders exist.

## Definition of Done
From caw-back, every `bun` line as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file …`.
- [ ] 1. `git status --short --untracked-files=all` → only the closed list (base: empty, SA 01:4x on 5779554)
- [ ] 2. `git check-ignore -v src/cards/temp-folders.ts test/http/plan-copy.test.ts test/http/temp-folders.test.ts` → exit 1, no output (base: exit 1 each, SA 01:4x)
- [ ] 3. `bun test test/http/plan-copy.test.ts test/http/temp-folders.test.ts` → 0 fail, ≥ 11 tests (base: n/a — new files)
- [ ] 4. `bun test test/http/proposals.test.ts test/http/review-note.test.ts` → 0 fail (base: `12 · 11 pass · 0 fail`, SA 01:4x)
- [ ] 5. `bun test src/runner/prompt.test.ts src/runner/hop.test.ts src/runner/pool.test.ts` → 0 fail (base: `51 · 124 · 17 pass · 0 fail`, SA 01:4x; patch as probed: 1 fail, `prompt.test.ts:45`)
- [ ] 6. `node_modules/.bin/tsc --noEmit --pretty false` → exit 0 (base: exit 0, probe 01:4x)
- [ ] 7. `bun test` (whole) → only the known `withReadGuard … ONE argument` fail (base: `988 pass · 1 skip · 1 fail`, SA 01:0x on the content committed as 5779554)
- [ ] 8. `bun run openapi:emit`, then `grep -c 'temp_folder_in_work' openapi.json` → ≥ 1 (base: `0`, SA 01:4x)

## Implementation Notes
Built in `caw-back` on `5779554` (tree clean at start), nothing committed by me. Every command ran as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`. All six steps are built. **Step 2 was held for Q1** (the TASK's own proof failed, the policy refuses `$TMPDIR`); Silver answered **B** (policy unchanged, rule 8 names the real folder, `TMPDIR` / `XDG_CACHE_HOME` stay set), and it is built that way below.

**Step 2 + rule 8 (after Q1 → B)**
- `hop.ts`: for every worker process — the open card worker, the one-shot card hop and the one-shot chat hop — `<its folder>/tmp` and `<its folder>/cache` are created (0700) before the spawn, and the env is `childEnv(process.env)` with `TMPDIR` and `XDG_CACHE_HOME` set to them, in place of the inherited `TMPDIR`. "Its folder" = the pool's worker folder (open worker) or `hop-<id>` (one-shot). They are inside `readableDirs(roots, dir)`, so the worker already may read and write there. The folders go with their parent (the pool removes the worker folder when its process ends; a one-shot hop removes its own).
- `prompt.ts`: `buildPrompt` takes a required `tmpDir`; rule 8 is exactly Silver's sentence: `8. Temporary files, caches and browser profiles go in <tmpDir> (never in the project folder) — write that path out, not $TMPDIR.` It is the last rule (rule 7 is second-to-last). The chat prompt has no rule 8 (a chat hop writes nothing).
- `pool.ts` is on the closed list but needed no change: the env is built in `hop.ts` and the pool hands it to the spawner as given (one test pins that).
- Tests: `prompt.test.ts` — a thin wrapper gives every existing call a default `tmpDir`; the rule-7 test now says rule 7 is followed by rule 8; a new rule-8 test (the path is the caller's). `hop.test.ts` (+4): a one-shot card hop (env under `hop-<id>`, both folders there at spawn time, the inherited `TMPDIR=/inherited/tmp` replaced, PATH untouched, rule 8 in the prompt), an open worker (env under the pool's worker folder, rule 8 in the task message), the chat hop (env under its hop folder, no rule 8), and **the proof the TASK asked for, kept as a test**: `judgeBash` says `null` (allowed) for `touch <dir>/tmp/x`, `mkdir -p <dir>/tmp/profile`, `touch <dir>/cache/x`, says `shell_feature "$"` for `touch "$TMPDIR/x"` and `mkdir -p "$TMPDIR/profile"`, and still refuses a folder that is not the worker's. `pool.test.ts` (+1): `acquire` hands env / cwd / `stdin: "pipe"` to the spawner untouched.

**Built (steps 1, 4, 5, 6 without D6)**
- D4 `proposals/service.ts` `accept`: inside the decision, 409 `plan_already_accepted` (`แผนนี้ตกลงไปแล้ว`) when an accepted proposal of the project has the same items (same length; per index the same trimmed `title`, `anchor.key`, `workerId`); nothing written.
- D7 `cards/temp-folders.ts` (new) `tempFolderIn(roots, readOnly, isTracked = git)`: per **writable** root only the top-level **directories**, sorted; marker (i) a file `Local State` or `Default/Preferences`, marker (ii) a name in the fixed list (`.cache .tmp tmp .playwright playwright-profile chrome-profile user-data-dir`) that git does not track (`git -C <root> ls-files -- <name>`, `GIT_OPTIONAL_LOCKS=0`, read-only; not a work tree = untracked); returns the first name or `null`. `setStatus`: a `worker:` actor moving a card to `review` or `done`, after REQ-125's note check → 409 `temp_folder_in_work` with the PM's message (`{name}` filled), `details { folder }`. Nothing is deleted; the operator is never refused; `todo` / `doing` are never checked.
- `http/errors.ts`: `plan_already_accepted · temp_folder_in_work` added to the 409 text. `openapi.json` re-emitted: the diff is that one 409 description, repeated (20 lines changed in 20 places) — `grep -c temp_folder_in_work openapi.json` → `20`.
- Tests: `plan-copy.test.ts` (new, 4): A accepted → B (its copy) refused with the PM's words and nothing written; one title changed → 200; titles compared trimmed; a different anchor / worker / item count is a different plan; a superseded open copy is `not_open`, not this code. `temp-folders.test.ts` (new, 10): `Local State` → refused naming it, the file still there, the card unchanged; `Default/Preferences`; an untracked `.cache`; `done` checked, `doing` / `todo` not; `src/` and unlisted folders allowed; a read-only root's `.cache` allowed; the operator never refused; the note check comes first; `tempFolderIn` top-level only / first sorted / file-not-folder / missing root; the tracked `tmp/` case; every name of the fixed list.

**Declared**
1. **The "tracked `tmp/`" case is tested through an injected `isTracked`, not a real repository.** My rule is no git writes of any kind, and a test would have to `git init` and `git add`; the real `git ls-files` runs for every other case (a root that is not a work tree). Say so if you want one HTTP test with a scratch repository — I would then ask for that exception in writing.
2. `tempFolderIn` takes the roots from the project state inside the write decision (a synchronous read of a few folders and at most a few `git` calls, only on a worker's `review` / `done`).

**Evidence (real output)**
- DoD 1: `git status --short --untracked-files=all` → ` M openapi.json`, ` M src/cards/service.ts`, ` M src/http/errors.ts`, ` M src/proposals/service.ts`, ` M src/runner/hop.test.ts`, ` M src/runner/hop.ts`, ` M src/runner/pool.test.ts`, ` M src/runner/prompt.test.ts`, ` M src/runner/prompt.ts`, `?? src/cards/temp-folders.ts`, `?? test/http/plan-copy.test.ts`, `?? test/http/temp-folders.test.ts` — all on the closed list (`pool.ts` untouched). DoD 2: `git check-ignore -v` on the three new paths → exit `1`.
- DoD 3: `plan-copy` + `temp-folders` → `14 pass · 0 fail` (≥ 11). DoD 6: `tsc --noEmit --pretty false` → exit `0`. DoD 8: `grep -c temp_folder_in_work openapi.json` → `20` (base `0`).
- DoD 4: `proposals.test.ts review-note.test.ts` → `23 pass · 0 fail` (base 12 + 11). DoD 5: `prompt` → `52 pass`, `hop` → `128 pass`, `pool` → `18 pass`, all `0 fail` (base 51 · 124 · 17). The probed patch's one failure (`prompt.test.ts:45`, rule 7 last) is the test I updated.
- DoD 7: whole suite `--timeout 30000` → `1008 pass · 1 skip · 1 fail · Ran 1010 tests across 76 files`; the fail = the known `withReadGuard … ONE argument`; `pgrep -fc 'output-format [s]tream-json'` → `0`.

**Real output of the TASK's proof (step 2), run before Q1 — the reason for B (now also a test in `hop.test.ts`)** — `judgeBash(command, cwd=<root>, readable=[<root>, <worker folder>], readOnly=[])`, with `<worker folder>/tmp` present:
```
touch "$TMPDIR/x"                       -> {"code":"shell_feature","detail":"$"}
mkdir -p "$TMPDIR/profile"              -> {"code":"shell_feature","detail":"$"}
touch $TMPDIR/x                         -> {"code":"shell_feature","detail":"$"}
touch "${TMPDIR}/x"                     -> {"code":"shell_feature","detail":"$"}
echo hi > "$TMPDIR/x"                   -> {"code":"shell_feature","detail":"$"}
touch <worker folder>/tmp/x             -> null  (allowed)
mkdir -p <worker folder>/tmp/profile    -> null  (allowed)
```

**UNVERIFIED:** nothing live; the real `git ls-files` ran only on non-repository roots here.

## Questions
**Q1 (blocks step 2 + rule 8 — the TASK said stop here).** The policy refuses what rule 8 tells a worker to type. `judgeBash` answers `shell_feature "$"` for **any** `$` in a Bash command (output above), so a worker that follows rule 8 literally — `touch "$TMPDIR/x"`, `mkdir -p "$TMPDIR/profile"` — is refused (and the refusals count toward the 10-refusal stop). The **absolute path** of the worker's own `tmp` folder is allowed (`null`). Programs a worker starts (`bun`, `node` scripts, a browser tool) read `TMPDIR` / `XDG_CACHE_HOME` from their environment without the shell, so the env part of D6 would work for them; only a worker typing `$TMPDIR` in Bash is blocked. Checked: SPEC-125 D6 ("TASK-168 proves by a run that a worker's Bash may write there; if it may not, it stops and asks"), `bash-policy.ts`.
  Options — **my default is B**:
  - **A.** Teach `bash-policy.ts` to accept `$TMPDIR` / `${TMPDIR}` / `$XDG_CACHE_HOME` as the worker's own folder. `bash-policy.ts` is **not on the closed list** (a security file: it needs your word, and its tests).
  - **B.** Keep the policy as is; make rule 8 name the real folder: `8. Temporary files, caches and browser profiles go in <worker folder>/tmp, never in the project folder.` (the path is built per hop in `buildPrompt`; the env `TMPDIR` / `XDG_CACHE_HOME` still set for programs). Needs `buildPrompt` to take the folder — `prompt.ts` / `hop.ts` are on the list.
  - **C.** Build D6 exactly as probed (env + the `$TMPDIR` sentence) and accept that Bash users get a refusal; QA's live run would show it.
  Reply with A, B or C and I build step 2 + rule 8 + their tests (`hop.test`, `pool.test`, `prompt.test:45`) — about the same size as what is done.
  > answer (Silver, SA B, 2026-10-31 01:5x): **B.** The policy stays exactly as it is — `bash-policy.ts` is a security file, and nothing here is worth widening it. Rule 8 names the real folder: `8. Temporary files, caches and browser profiles go in ${dir}/tmp (never in the project folder) — write that path out, not $TMPDIR.` (`${dir}` = the worker's folder for an open worker, the hop's folder for a one-shot hop; `buildPrompt` takes it as a new `tmpDir` input). `TMPDIR` / `XDG_CACHE_HOME` stay set in the env for programs. `prompt.ts` and `hop.ts` are on your list; the probe's sentence is replaced by this one (SPEC-125 D6 updated). Your proof run stays in Implementation Notes as the reason. Go on with step 2 + rule 8 + their tests.

## Review
**2026-10-31 02:1x, Silver — DONE.**
- Re-run by me on caw-back 5779554 + 12 paths (the closed list; `pool.ts` untouched): `plan-copy` + `temp-folders` + `proposals` + `review-note` + `prompt` + `hop` + `pool` → **233 pass · 2 fail** in one combined run at load 4.72; the two were `hop.test.ts` "the runner already stopping: claude is never spawned…" (11.3 s) and "an API that clamps its page size below 500…". `hop.test.ts` alone, twice → `128 pass · 0 fail` (30 s each). Read as timing under load (names kept this time, unlike my TASK-160 review). · tsc exit 0 · whole suite `1008 pass · 1 skip · 1 fail · Ran 1010 tests across 76 files`, the fail = the known `withReadGuard … ONE argument` · `openapi:emit` again → byte-identical · no `stream-json` process left.
- Read: rule 8 = my Q1-B sentence exactly (`prompt.ts:38`), the last rule; `temp-folders.ts` = SPEC-125 D7's markers and fixed list (`:7`, `:28`), writable roots only, never deletes; D4's same-items rule in `accept`.
- Declared 1 accepted: the tracked-`tmp/` case uses an injected `isTracked`, because engineers run no git, not even in a scratch repo. A real repository is QA's stub run (AC-4). Declared 2 accepted.
- Q1's proof run (the policy refuses any `$`) is kept in the notes and as a test — the reason for B.
- tree-fp 02:1x: caw-back `32a65f35c337`. **TASK-169 step 6 released** (the `openapi.json` is final).
