# TASK-003: BE — git layer: clone, file tree, markdown digest, commit reader, PAT redactor
- Source: SPEC-001
- Status: DONE (rework reviewed by Sober 2026-08-20 — commit `2e441bf`)
- Assignee: Jason (BE)
- Depends on: TASK-001

## What to do

`src/git/` — a self-contained module with **no HTTP and no DB knowledge**.
Everything here is specified in SPEC-001 "Flow — the worker, step by step" 1–3
and "Non-functional → PAT handling / Repo URL safety". Follow it literally.

1. **`redact.ts` — write this first, everything else depends on it.**
   `redact(text, runToken?)` replaces the run's token and anything matching
   `gh[pousr]_[A-Za-z0-9]{20,}`, `glpat-[A-Za-z0-9_-]{20,}`,
   `Authorization: [^\s]+` with `***REDACTED***`.
   **Every** string this module logs, throws, or returns as an error message goes
   through it.
2. **`urlSafety.ts`** — accept `http`/`https` only; reject `git@`, `ssh://`,
   `file://`, and anything else. Reject hosts resolving to loopback/link-local/
   private ranges unless `ALLOW_PRIVATE_GIT_HOSTS=true`.
3. **`clone.ts`** — clone into `os.tmpdir()/code-report/<jobId>`:
   `git -c credential.helper= -c core.askPass= clone --filter=blob:none --single-branch [--branch <branch>] <url> <dir>`
   with `GIT_TERMINAL_PROMPT=0`, `GIT_ASKPASS=/bin/false`.
   PAT (when present) via `-c http.extraHeader="Authorization: Basic
   base64(x-access-token:<pat>)"` — **never inside the remote URL**.
   Spawn `git` with an **argv array, never `sh -c`**.
   10-minute wall-clock budget → `CLONE_TIMEOUT`.
   Map failures to `REPO_NOT_FOUND` / `REPO_AUTH_FAILED` / `BRANCH_NOT_FOUND` /
   `CLONE_FAILED` per SPEC-001's error table — including the binding rule:
   **no PAT supplied + remote 404s ⇒ `REPO_AUTH_FAILED`**, not `REPO_NOT_FOUND`.
4. **`tree.ts`** — `git ls-files`, paths only, excluding `node_modules/`,
   `dist/`, `build/`, `.next/`, `vendor/`, lockfiles and binaries by extension.
   Cap 2000 paths, keeping the **shallowest** ones.
5. **`markdown.ts`** — every non-excluded `*.md`/`*.mdx`. Order: root `README.md`,
   then `docs/**`, then the rest by path depth. Caps: 40 files, 20 000 chars per
   file, 200 000 chars total; mark truncation inline with `…[truncated]`.
6. **`commits.ts`** — `git log <branch> --since=... --until=... [--author=<a>
   --regexp-ignore-case] --no-merges --numstat --date=iso-strict`.
   - **Day boundaries are computed in `REPORT_TIMEZONE` (default `Asia/Bangkok`),
     never the server's local zone** — REQ-001 §4.5 is a requirement, not a
     default. `dateFrom` 00:00:00 to `dateTo` 23:59:59.999 in that zone.
   - Author is free text, matched case-insensitively as a substring of name or
     email (REQ-001 §4.6).
   - Per commit: short sha, author name + email, ISO date, subject, body, changed
     files with insertions/deletions.
   - Diffs: `git show --format= --unified=3 -- . ':(exclude)*.lock'
     ':(exclude)package-lock.json' ':(exclude)*.min.*'`, truncated at 8000 chars
     per commit; a commit touching > 50 files contributes **stats only, no diff**.
7. **`cleanup.ts`** — `rm -rf` the temp dir, callable from a `finally`; plus a
   startup sweep of stale dirs under the temp root.

## Definition of Done
- [x] `bun test` passes against a **fixture repository built in a temp dir by the
      test setup** (SPEC-001 "Testing") — no network in unit tests. Cover:
      commits inside/outside the window; the **Asia/Bangkok boundary case** (a
      commit authored 2026-08-07T23:30+07:00 belongs to 2026-08-07, and one at
      2026-08-08T00:30+07:00 does not, regardless of the machine's TZ — run the
      test with `TZ=UTC` **and** `TZ=Asia/Bangkok` and get the same result);
      author substring match on name and on email; `--no-merges`; the >50-file
      stats-only rule; the 8000-char diff cap; tree and markdown caps.
- [x] Redactor tests: a `ghp_`/`glpat-`/`Authorization:` string and the run token
      never survive into a returned error message or a log line.
- [x] A test asserts the cloned repo's `.git/config` contains **no token**
      (clone a local fixture remote with a dummy token supplied).
- [x] `urlSafety` tests reject `git@`, `ssh://`, `file://`, and a private-range
      host when `ALLOW_PRIVATE_GIT_HOSTS=false`.
- [x] Cleanup test: temp dir is gone after both a successful and a **throwing** run.
- [x] `grep -rn "sh -c\|exec(" src/git/` returns nothing — paste the output.

## Implementation Notes
(Jason, 2026-08-20 — commit `ae87a70` in `code-report-back`)

### Files added (all new; nothing outside `src/git/` and `test/` was touched)

| File | What it is |
|------|------------|
| `src/git/redact.ts` | `redact(text, runToken?)` + `redactAll(text, secrets[])`. The three SPEC-001 patterns plus the run's literal token. |
| `src/git/urlSafety.ts` | scheme gate (`http`/`https` only) + loopback/link-local/private-range gate, DNS **injected** so no unit test resolves anything. |
| `src/git/run.ts` | the **only** place a `git` process starts: argv array, `stdin: "ignore"`, `GIT_TERMINAL_PROMPT=0`, `GIT_ASKPASS=/bin/false`, `GIT_CONFIG_NOSYSTEM=1`, wall-clock kill, and **redaction of stdout/stderr before the caller sees them**. |
| `src/git/errors.ts` | `GitLayerError` carrying a SPEC-001 `ErrorCode` + an already-redacted `detail`. No user-facing text is composed here — that stays in `src/errors/messages.ts`. |
| `src/git/clone.ts` | `buildCloneArgs` / `cloneRepository` / `withClone` + `classifyCloneFailure`. |
| `src/git/tree.ts` | `listRepoFiles` (full, filtered) + `capPaths` + `readFileTree`. |
| `src/git/markdown.ts` | ordered digest under the 40 / 20 000 / 200 000 caps, `…[truncated]` inline. |
| `src/git/commits.ts` | timezone-correct window, author filter, log parsing, per-commit diffs. |
| `src/git/cleanup.ts` | `jobTempDir` / `removeJobDir` / `sweepStaleTempDirs`. |
| `src/git/index.ts` | barrel for TASK-005. |
| `test/fixtures/gitRepo.ts` + six `test/git-*.test.ts` | fixture repo builder and the tests. |

No HTTP, no database, no `src/index.ts` change: TASK-005 wires this in.

### Decisions worth reviewing

1. **The base64 credential is treated as a secret in its own right.**
   `Authorization: Basic <base64>` — the blob decodes straight back to the PAT.
   `clone.ts` therefore hands `runGit` three literals to redact (the PAT, the
   whole header, and the bare base64), not just the PAT. See **Q-BE-4**: the
   spec's `Authorization: [^\s]+` pattern on its own stops at the space after
   `Basic`, so pattern-only redaction would have left the blob readable.
2. **Redaction sits at the process boundary (`runGit`), not at each call site.**
   Every byte of git stdout/stderr is redacted before any caller can see it, so
   no future caller can forget. Nothing in `src/git/` logs at all yet — there is
   no logger in the backend before TASK-005 — so the "never in a log line" half
   of the DoD is evidenced through the returned strings.
3. **`--author` is escaped, not passed raw.** git treats it as a regex; the user
   types free text (REQ-001 §4.6). `authorPattern()` escapes metacharacters so
   `a.b+c` matches literally and stays a case-insensitive substring match.
4. **Day boundaries are pure and offset-explicit.** `zonedBoundary()` never reads
   `process.env.TZ`; it resolves the zone offset with `Intl` (two passes, so a
   DST zone is resolved at the local instant) and emits e.g.
   `2026-08-07T23:59:59.999+07:00`. The machine's zone cannot change the result.
5. **The markdown digest reads from the *uncapped* file list**, not from the
   2000-path tree — otherwise a big repository could lose its `README.md` to the
   tree cap before the digest ever saw it.
6. **`sweepStaleTempDirs` takes an options object** (`{maxAgeMs, now, root}`) so
   the sweep itself is under test rather than re-implemented in the test.
7. **`withClone()`** is the intended entry point for TASK-005: it deletes the
   temp dir in a `finally` on success, throw and timeout alike.

### Verification (commands and their real output)

```
$ bun run typecheck
$ tsc --noEmit
tsc exit: 0

$ bun test
 103 pass
 0 fail
 286 expect() calls
Ran 103 tests across 11 files. [5.11s]
```

The Asia/Bangkok boundary case, run both ways as the DoD demands:

```
$ TZ=UTC bun test test/git-commits.test.ts
 13 pass · 0 fail · 36 expect() calls

$ TZ=Asia/Bangkok bun test test/git-commits.test.ts
 13 pass · 0 fail · 36 expect() calls
```

Both runs assert the same three things against a fixture repo whose commits are
dated `2026-08-07T23:30:00+07:00`, `2026-08-08T00:30:00+07:00` and
`2026-08-06T10:00:00+07:00`: the 23:30 commit **is** in the 2026-08-07 report,
the 00:30 one **is not**, and the previous day's is not. This test is not
decorative — a naive local-zone implementation running under `TZ=UTC` would pull
the 00:30+07:00 commit in, and that assertion fails.

Forbidden-surface grep (DoD asks for the output pasted — it is empty):

```
$ grep -rn "sh -c\|exec(" src/git/
grep exit: 1 (1 = no matches)
```

Token grep over the whole test run (same gate TASK-002 used):

```
$ bun test > /tmp/git-test-run.txt 2>&1 ; echo $?
0
$ grep -c "ghp_0123456789abcdefghijklmnopqrstuvwx\|glpat-ABCDEFGHIJKLMNOPQRST" /tmp/git-test-run.txt
0   (grep exit 1 = no match)
```

Test coverage against each DoD line: window in/out + the two boundary commits,
`--no-merges` (a real merge commit exists in the fixture and is absent from the
result), author substring on **name** (`somCHAI` → Somchai Jaidee) and on
**email** (`@y.co.th` → Malee Wong), the >50-file rule (a 60-file commit yields
stats and an empty diff), the 8000-char diff cap, the tree cap keeping the
shallowest paths, the markdown 40-file and 200 000-char caps, `.git/config` and
`git remote -v` free of a dummy token after a **real** clone of a local fixture
remote, `git@`/`ssh://`/`file://`/private-range rejection, and the temp dir gone
after a successful run, a throwing run **and** a failed clone.

### Not done here, on purpose

- Nothing is wired into the HTTP app or the worker — that is TASK-005.
- No database was touched (this module has no DB knowledge at all).
- The one thing not exercised for real is a clone **over the network** against a
  private repository with a real PAT; SPEC-001 "Testing" puts that in TASK-009.

## Implementation Notes — REWORK pass
(Jason, 2026-08-20 — commit `2e441bf` in `code-report-back`)

All four items are done and nothing else in the module was touched. Six files
changed: `src/git/{commits,clone,redact}.ts` and their three test files.

### REWORK 1 — the author filter

`authorPattern()` is gone; `authorNeedle()` only trims. `commitLogArgs` now
pushes `--fixed-strings` before `--author=<text>` and keeps
`--regexp-ignore-case`. **I reproduced your finding on my own machine before
changing anything** (git 2.53.0.windows.3, scratch repo, two authors):

```
$ git log --author='dara+dev@w.co.th'    --regexp-ignore-case   # what the user typed
plus author commit | dara+dev@w.co.th
$ git log --author='dara\+dev@w\.co\.th' --regexp-ignore-case   # what authorPattern() produced
lookalike commit   | daradev@w.co.th          ← WRONG COMMIT
$ git log --fixed-strings --author='dara+dev@w.co.th' --regexp-ignore-case   # the fix
plus author commit | dara+dev@w.co.th
```

**Test added:** the fixture repo gained two commits — `Dara Plus
<dara+dev@w.co.th>` and `Dara Lookalike <daradev@w.co.th>` — and the new test
asserts filtering by the plus address returns **exactly** the plus commit
(`toEqual`, not `toContain`, so the lookalike appearing fails it). A second test
pins the argv (`--fixed-strings` present, `--author=a.b+c(d)` unescaped).
The local part `dara` is deliberately unrelated to the other three fixture
authors, so the existing `somCHAI` / `@y.co.th` substring tests keep testing
what they say they test.

### REWORK 2 — a failed `git log`

`readCommits` no longer returns `[]` on a non-zero exit; it throws via a new
exported `classifyLogFailure(stderr, { branch })`: `BRANCH_NOT_FOUND` when a
branch was named **and** stderr matches an unknown-revision message
(`unknown revision or path not in the working tree` / `ambiguous argument` /
`bad revision`), otherwise `CLONE_FAILED` carrying `firstMeaningfulLine(stderr)`.
A genuine zero-commit result still returns `[]` — the existing "an empty window
is zero commits, not an error" test is unchanged and still passes.
**Three tests added:** the two codes, plus one asserting an unknown-revision
message with **no** branch asked for is `CLONE_FAILED` and not `BRANCH_NOT_FOUND`
(a bad `HEAD` is not a branch the user named).

### REWORK 3 — the redactor pattern

`redact.ts` third pattern is now `/Authorization:[^\r\n]*/gi`, per the amended
SPEC-001. `credentialSecrets()` is untouched, as you asked.
**Two tests added:** the header fully redacted **with no `runToken` argument**
(so it is the pattern alone, not the literal path) while the *next line*
survives — proving `[^\r\n]*` stops at the newline and does not eat the rest of
git's stderr — and a case-insensitive `authorization: Bearer …` line.

### REWORK 4 — the 404 rule

`classifyCloneFailure` splits the old `NOT_FOUND` list in two, so the
distinction is visible in the code: `NOT_A_REPOSITORY`
(`does not appear to be a git repository`) → `REPO_NOT_FOUND`, checked first;
`NOT_FOUND` (`repository … not found` / `not found` / `404`) →
`REPO_AUTH_FAILED` unconditionally.
**Two tests added** (PAT + 404 ⇒ `REPO_AUTH_FAILED`; the not-a-repository string
⇒ `REPO_NOT_FOUND` for `hasPat` **both** ways). The pre-existing "no PAT + 404"
test is unchanged and still passes.

### Verification (commands and their real output)

```
$ bun run typecheck
$ tsc --noEmit
tsc exit: 0

$ bun test
 110 pass
 0 fail
 301 expect() calls
Ran 110 tests across 11 files. [8.66s]

$ TZ=UTC bun test test/git-commits.test.ts
 17 pass · 0 fail · 43 expect() calls
$ TZ=Asia/Bangkok bun test test/git-commits.test.ts
 17 pass · 0 fail · 43 expect() calls

$ grep -rn "sh -c\|exec(" src/git/
grep exit: 1 (no matches)

$ bun test > /tmp/git-test-run.txt 2>&1 ; echo $?
0
$ grep -c "ghp_0123456789abcdefghijklmnopqrstuvwx\|glpat-ABCDEFGHIJKLMNOPQRST" /tmp/git-test-run.txt
0   (grep exit 1 = no match)
$ grep -c "Authorization: Basic" /tmp/git-test-run.txt
0   (grep exit 1 = no match)
```

103 → 110 tests: 7 added, 1 replaced (the old "metacharacters are escaped" test,
which asserted the defect). The two-TZ run went 13 → 17 for the same reason.
No network, no database, nothing outside `src/git/` and `test/`.

### Two things for your review — neither is a change I made on my own judgement

1. **`classifyCloneFailure`'s `hasPat` option is now unused.** Your fix text said
   the 404 branch returns `REPO_AUTH_FAILED` unconditionally, and no other branch
   reads it — so the parameter no longer affects the result. I **kept it**
   (documented as such in the doc comment) rather than removing it, because
   removing an exported signature is a change you did not ask for. Say the word
   and it goes in one line, tests included.
2. **`readCommits` now throws where it used to return `[]` — TASK-005 must catch
   it.** `withClone()` will still delete the temp dir (it is a `finally`), and
   `GitLayerError` carries the code the worker stores, so the shape is the same
   as a clone failure. Flagging it because TASK-005 is not written yet and this
   is a behaviour change in an API it is about to call.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **Q-BE-4 (NON-BLOCKING — Sober's call, nothing waits).** SPEC-001's redactor
  pattern `Authorization: [^\s]+` matches only up to the first space, so for the
  header we actually send — `Authorization: Basic <base64>` — the pattern alone
  redacts `Authorization: Basic` and **leaves the base64 blob**, which decodes
  straight back to the PAT. I did not change the specified pattern. Instead
  `clone.ts` passes the blob to the redactor as a literal run secret, so on every
  real path the token is gone (evidenced above). The open question is whether the
  *pattern* should also be widened to the end of the line, so that an
  `Authorization` header from some future source we did not derive ourselves is
  covered too. That is a one-line change in `redact.ts`; I will not widen a
  spec-quoted pattern on my own judgement.
  > answer (Sober, 2026-08-20): **widen it.** SPEC-001 "Non-functional → PAT
  > handling" 5 is amended to `Authorization:[^\r\n]*` (case-insensitive), so you
  > are not editing a spec-quoted pattern on your own judgement — the spec now
  > says this. Keep `credentialSecrets()` as well; two mechanisms on the same
  > secret is deliberate. Full reasoning and the accepted trade-off: `## Review`
  > → REWORK 3. **This is part of the rework.**
- **Q-BE-5 (NON-BLOCKING — an assumption, flagged not buried).** TASK-003 binds
  only one half of the 404 rule: *no PAT + 404 ⇒ `REPO_AUTH_FAILED`*. The other
  half is not written down, so I implemented the literal complement: **PAT
  supplied + 404 ⇒ `REPO_NOT_FOUND`**. The consequence to check: a *valid* token
  whose scope does not cover the repository also produces a 404 on GitHub, and
  that user will be told "repository address not found" when the true cause is
  the token's scope — which SPEC-001's error table lists under
  `REPO_AUTH_FAILED` ("token … insufficient"). If you want the PAT case to say
  `REPO_AUTH_FAILED` too, it is one line in `classifyCloneFailure` plus one test.
  > answer (Sober, 2026-08-20): **yes — change it.** A 404 maps to
  > `REPO_AUTH_FAILED` whether or not a PAT was supplied; SPEC-001's error table
  > already files "token … insufficient" there, and that case 404s. Keep
  > `REPO_NOT_FOUND` for the unambiguous "does not appear to be a git repository"
  > case. Full reasoning: `## Review` → REWORK 4. **This is part of the rework.**
- **Not a question, a boundary note for the board.** TASK-001's remaining two DoD
  items (`bun run migrate`, `bun run seed:users`) are still not evidenced by me:
  the human has authorised a real local database, but running migrations against
  a real database is outside what I may do (`BE.md` "Hard boundaries"). That
  evidence has to come from the human running the two commands, or from an
  explicit instruction in a TASK that changes that boundary.

## Review

**Sober (SA Lead), 2026-08-20 — verdict: `REWORK`.** Four concrete items, all
small, all conformance against SPEC-001 / REQ-001 — no new scope. The work
itself is good: the module boundary is clean, redaction sits at the process
boundary where a future caller cannot forget it, and the timezone work is the
real thing rather than a comment claiming it is.

### What I verified myself (not trusted from the paste)

I re-ran every DoD command instead of reading Jason's transcript:

```
$ bun run typecheck   →  tsc --noEmit, exit 0
$ bun test            →  103 pass · 0 fail · 286 expect() · 11 files
$ TZ=UTC bun test test/git-commits.test.ts            →  13 pass · 0 fail
$ TZ=Asia/Bangkok bun test test/git-commits.test.ts   →  13 pass · 0 fail
$ grep -rn "sh -c\|exec(" src/git/                    →  exit 1 (no matches)
$ bun test > /tmp/git-test-run.txt 2>&1               →  exit 0
$ grep -c "ghp_0123456789abcdefghijklmnopqrstuvwx\|glpat-ABCDEFGHIJKLMNOPQRST" …
                                                      →  0 (exit 1)
$ grep -c "Authorization: Basic" /tmp/git-test-run.txt →  0 (exit 1)
```

All six DoD lines reproduce. **The DoD is met — that is not why this is
`REWORK`.** It is `REWORK` because two behaviours conform to the DoD's letter
and still contradict SPEC-001/REQ-001 on inputs the DoD never exercised, and
because Q-BE-4 and Q-BE-5 are answered in a direction that changes code.

Contract conformance that does hold, checked line by line: no HTTP and no DB
import anywhere in `src/git/`; the PAT reaches git only through
`-c http.extraHeader` on the argv array and never the remote URL
(`buildCloneArgs`); `withClone` removes the temp dir in a `finally`, and
`cloneRepository` also removes it on the timeout and failure paths before
throwing; the caps are the spec's numbers (2000 / 40 / 20 000 / 200 000 / 8000 /
50); `zonedBoundary` never reads `process.env.TZ`, which is what makes the
two-TZ run above load-bearing rather than decorative; and the markdown digest
reads from the **uncapped** file list, so a big repo cannot lose its `README.md`
to the tree cap — decision 5 is the right call and I would have written the same.

### REWORK 1 — the author filter is escaped for the wrong regex dialect (defect)

`authorPattern()` escapes `. * + ? ^ $ { } ( ) | [ ] \` — that is the **JavaScript**
metacharacter set. git matches `--author` with a **POSIX basic** regex, where
`+ ? { } ( ) |` are literal *until* you backslash them, at which point GNU BRE
turns them into operators. Escaping therefore does the opposite of what
Implementation Note 3 claims: it *introduces* regex behaviour.

I ran it against real git (2.53.0), fixture repo with two authors,
`somchai+dev@x.co.th` and `somchaidev@x.co.th`:

```
$ git log --author='somchai+dev@x.co.th'      --regexp-ignore-case   # what the user typed
commit by plus author     | somchai+dev@x.co.th
$ git log --author='somchai\+dev@x\.co\.th'   --regexp-ignore-case   # what authorPattern() produces
commit by lookalike author | somchaidev@x.co.th        ← WRONG COMMIT
$ git log -F --author='somchai+dev@x.co.th'   --regexp-ignore-case   # fixed-strings
commit by plus author     | somchai+dev@x.co.th
```

`\+` became "one or more of the preceding `i`", so the user filtering by their
own plus-address gets **someone else's commits and none of their own** — silently,
with no error. Gmail-style plus addressing is not exotic; this is REQ-001 §4.6
("free text … substring") not being delivered.

**Fix:** pass the user's text **unescaped** (trimmed) and add git's
`-F` / `--fixed-strings`, keeping `--regexp-ignore-case`. Delete
`authorPattern()`'s escaping rather than porting it to BRE rules — free text is
not a pattern and should never be compiled as one.
**Test to add:** an author containing `+` — assert the plus-address commit is
returned and the lookalike commit is not.

### REWORK 2 — a failed `git log` is reported as "no work in this period"

`readCommits` does `if (log.exitCode !== 0) return [];`. Zero commits is
`NO_COMMITS`, which SPEC-001 defines as a **success** status ("the run succeeded
and found nothing", REQ-001 AC 5). So every `git log` failure — an unknown
branch, a corrupt clone, a bad argument we introduce later — is presented to the
user as a finished, correct report saying nothing was done that day. That is the
worst shape a failure can take here: it is indistinguishable from a true result.

It also means the git layer can never raise `BRANCH_NOT_FOUND` from the log path
that SPEC-001 worker step 3 assigns to it. (Today a bad branch is caught earlier
by `--branch` at clone time, so this is currently latent — it becomes live the
moment anything calls `readCommits` on a clone it did not just make.)

**Fix:** `throw` instead of returning `[]` —
`BRANCH_NOT_FOUND` when a branch was named and stderr matches an
unknown-revision message, otherwise `CLONE_FAILED` (SPEC-001's "any other git
failure") carrying `firstMeaningfulLine(stderr)` as the already-redacted detail.
Genuine zero-commit results keep returning `[]`, unchanged.
**Tests to add:** one for each of the two codes.

### REWORK 3 — Q-BE-4 answered: **widen the pattern.** SPEC-001 amended

> answer (Q-BE-4): **Yes — widen it, and I have already changed SPEC-001 so you
> are not editing a spec-quoted pattern on your own judgement.** You were right
> to work around it inside TASK scope rather than rewrite my pattern; the pattern
> was wrong. `Authorization: [^\s]+` stopping at the first space is a plain
> mistake in a rule whose whole job is that nobody has to remember anything: it
> leaves the base64 blob, and the blob *is* the token. SPEC-001
> "Non-functional → PAT handling" 5 now reads **`Authorization:[^\r\n]*`,
> case-insensitive** — to end of line, so the value is covered whatever its
> scheme and whoever produced it.
>
> **Keep** `credentialSecrets()` as it is. Two independent mechanisms covering
> the same secret is the point, not duplication: the pattern catches headers we
> did not derive, the literal catches a blob that reaches us in some form the
> pattern does not recognise.
>
> The one cost, so it is a decision and not a surprise: a diff line in the
> analysed repository containing a literal `Authorization: …` is now redacted out
> of what we send to the AI. I accept that trade — losing one line of somebody
> else's source from a summary costs nothing; leaking a token costs the project.

**Fix:** `redact.ts`, replace the third pattern with `/Authorization:[^\r\n]*/gi`.
**Test to add:** `Authorization: Basic <base64>` fully redacted **with no
`runToken` argument supplied** — i.e. the pattern alone, not the literal path.

### REWORK 4 — Q-BE-5 answered: PAT + 404 ⇒ `REPO_AUTH_FAILED`

> answer (Q-BE-5): **Change it — a 404 maps to `REPO_AUTH_FAILED` whether or not
> a PAT was supplied.** Thank you for flagging this instead of burying it; the
> literal complement you implemented is a fair reading of TASK-003, and the
> reason it is wrong is in SPEC-001's own error table, which files "token
> missing/wrong/expired/**insufficient**" under `REPO_AUTH_FAILED`. A valid token
> with insufficient scope 404s on GitHub, so your reading routes a case the table
> explicitly assigns to `REPO_AUTH_FAILED` into `REPO_NOT_FOUND` instead — the
> same wasted afternoon the no-PAT rule exists to prevent, just one step further
> along. The two causes are genuinely indistinguishable from a 404: the honest
> answer names both, and only `REPO_AUTH_FAILED`'s message does.
>
> `REPO_NOT_FOUND` is **not** dead — keep it for the unambiguous cases your
> `NOT_FOUND` list already matches, e.g. "does not appear to be a git
> repository", where the remote answered and it is not a repository.

**Fix:** in `classifyCloneFailure`, the 404 / "not found" branch returns
`REPO_AUTH_FAILED` unconditionally; keep the
"does not appear to be a git repository" case on `REPO_NOT_FOUND` — split the
`NOT_FOUND` list in two so the distinction is visible in the code.
**Tests to add:** PAT + 404 ⇒ `REPO_AUTH_FAILED`; "does not appear to be a git
repository" ⇒ `REPO_NOT_FOUND`.

### Minors — recorded, NOT part of the rework

Do not touch these in this pass; I am recording them so they are not re-discovered.

1. `listRepoFiles` returns `[]` when `git ls-files` exits non-zero, so an
   unreadable clone becomes "a project with no files" and both the tree and the
   markdown digest silently go to the AI empty. Same shape as REWORK 2 but on a
   path with no SPEC-001 error code assigned, so I am binding it in **TASK-005**
   (the worker must not treat an empty tree as a successful read) rather than
   inventing a code here.
2. `MIN_LITERAL_TOKEN_LENGTH = 8` — a literal secret shorter than 8 characters is
   not redacted. The reasoning in the comment is sound and real PATs are far
   longer; noted only because it is a silent exception in a binding rule.
3. `runGit` passes the whole `process.env` to the child, so the git process
   inherits `SESSION_SECRET` and `DATABASE_URL`. Not a leak on any path we have,
   and not in any spec line — hardening for whoever writes the deployment task.
4. `assertSafeRepoUrl` resolves the host and then git resolves it again
   independently, and an `https` URL that **redirects** to a private host is not
   re-checked. This is inherent to the check SPEC-001 specifies; a real fix is a
   pinned-IP transport, which is not proportionate for this tool.
5. `EXCLUDED_DIRS` matches case-sensitively while the lockfile check lower-cases
   its input, so `Dist/` is not excluded. Cosmetic.

### One new question — **Q-SA-9, mine to route, NON-BLOCKING**

Not yours and nothing waits on it; recorded here because this is the file where
the evidence lives. `git log --since/--until` selects on the **committer** date,
while `%ad` (what we store and display) is the **author** date. I confirmed it
against real git:

```
commit authored 2026-08-07T10:00+07:00, committed 2026-08-12T10:00+07:00
window 2026-08-07 → (no commits)
window 2026-08-12 → the commit, displayed as a=2026-08-07T10:00:00+07:00
```

So after a rebase or a cherry-pick, a commit lands in a different day's report
than the date printed next to it. Your implementation is exactly what SPEC-001
told you to write, so this is my gap, not yours — I am routing it to Porter
(REQ-001 §4.5 never says which of the two dates "the day the work was done"
means). **The current behaviour stands as the working default; do not change it
in this rework.**

### To re-submit

The four items above, `bun test` green, the two-TZ run still green, the grep
gates still empty, commit referencing TASK-003, then `REVIEW` again. Nothing
else in the module needs to be touched.

## Review — rework pass

**Sober (SA Lead), 2026-08-20 17:31 — verdict: `DONE`.** All four rework items
are implemented, and the two that were real defects I re-broke and re-fixed on
my own machine rather than reading the transcript. Scope held: `git show --stat`
confirms exactly six files (`src/git/{clone,commits,redact}.ts` + their three
test files), the working tree is clean, so the commit carries the deliverable.

### What I verified myself, not from the paste

```
$ git log --oneline -1                →  2e441bf (working tree clean)
$ bun run typecheck  → tsc --noEmit   →  exit 0
$ bun test                            →  110 pass · 0 fail · 301 expect() · 11 files
$ TZ=UTC bun test test/git-commits.test.ts           →  17 pass · 0 fail
$ TZ=Asia/Bangkok bun test test/git-commits.test.ts  →  17 pass · 0 fail
$ grep -rn "sh -c\|exec(" src/git/                   →  exit 1 (no matches)
$ bun test > run.txt 2>&1                            →  exit 0
$ grep -c "ghp_0123…\|glpat-ABCD…" run.txt           →  0 (exit 1)
$ grep -c "Authorization: Basic" run.txt             →  0 (exit 1)
```

**REWORK 1 re-proved against real git (2.53.0.windows.3), fresh scratch repo,
two authors `plus+dev@w.co.th` and `plusdev@w.co.th`** — the point being that a
green test suite could be green against a fixture that never exercises the
dialect problem:

```
$ git log --author='plus\+dev@w\.co\.th' --regexp-ignore-case   # the OLD code's argv
lookalike commit   | plusdev@w.co.th          ← still the wrong commit
$ git log --fixed-strings --author='plus+dev@w.co.th' --regexp-ignore-case   # the NEW argv
plus author commit | plus+dev@w.co.th
```

I then checked the two properties the fix could have quietly cost, because
`--fixed-strings` is not a free swap — REQ-001 §4.6 wants a *case-insensitive
substring*, and `-F` could have made it neither:

```
$ git log -F --author='PLUS+DEV@W.CO.TH' --regexp-ignore-case  →  the plus commit   (case-insensitive: kept)
$ git log -F --author='pLuS pErSoN'      --regexp-ignore-case  →  the plus commit   (substring on the NAME: kept)
$ git log -F --author='.*'               --regexp-ignore-case  →  (nothing)         (free text is now literal)
```

That last line is the one I most wanted to see: under the old code a user typing
`.*` was escaped into a literal too, but any *unescaped* metacharacter reaching
git would have matched every commit in the repository. It cannot now.

**REWORK 2** — `readCommits` throws `classifyLogFailure(...)`; `BRANCH_NOT_FOUND`
only when a branch was actually named **and** stderr is an unknown-revision
message, otherwise `CLONE_FAILED` with the already-redacted
`firstMeaningfulLine`. The genuine zero-commit path still returns `[]` and its
original test is untouched and green — which is exactly the distinction that was
missing: a failure can no longer arrive as `NO_COMMITS`, and a true empty day
still can. The added negative test (unknown revision with **no** branch asked
for ⇒ `CLONE_FAILED`) is the one I would have asked for if he had not written it.

**REWORK 3** — `/Authorization:[^\r\n]*/gi`, matching the SPEC-001 amendment
verbatim. I ran the redactor directly on a three-line stderr rather than trusting
the unit test: `fatal: Authorization: Basic <blob>\nremote: next line must
survive\nauthorization: Bearer …` → the first and third lines become
`***REDACTED***`, **the middle line survives intact**. So the widened pattern
stops at the newline instead of eating the rest of git's stderr, and the
lower-case variant is caught. `credentialSecrets()` is untouched, as instructed.

**REWORK 4** — the list is split, `NOT_A_REPOSITORY` is tested **before**
`NOT_FOUND`, and the 404 branch returns `REPO_AUTH_FAILED` unconditionally.
I checked the ordering for a shadowing bug, since `REPO_NOT_FOUND` is now
reachable only through one narrow pattern: no `AUTH_FAILED` pattern matches
"does not appear to be a git repository", and `/repository .* not found/i` does
not match it either (there is no "not found" in that sentence), so the
unambiguous case still lands on `REPO_NOT_FOUND`.

### Your two flagged items — answered

1. **`classifyCloneFailure`'s unused `hasPat`: keep it, exactly as you left it.**
   You were right not to delete an exported signature I did not ask you to
   change, and you were right to say so instead of leaving me to find it. It is
   dead *my* answer orphaned it, not yours — and it is documented as unused in
   the doc comment, which is what stops the next reader from assuming the 404
   branch still depends on it. **I am not spending a review round on it**; the
   caller already computes it, and if TASK-005 finds no use for it there either,
   it goes then, in the pass that touches that call site anyway.
2. **`readCommits` throwing is now pinned in TASK-005**, so it cannot be
   discovered by the worker at runtime — see TASK-005 "What to do" item 6.
   Flagging a behaviour change in an API a not-yet-written TASK is about to call
   is precisely the right move; the binding is mine to write, and it is written.

### Why `DONE` and not another round

I went looking for the same class of thing that sent this back last time — a
behaviour that satisfies the DoD's letter and contradicts SPEC-001 on an input
the DoD never exercises — and did not find one in the reworked surface. I
checked the author path for a leading-dash needle (it cannot become a flag: it
rides inside a single `--author=<text>` argv token), for an empty/whitespace
author (guarded, the flag is not pushed at all), and the classifier ordering
above. The one swallowed-failure path I did find is pre-existing and recorded as
a minor below, not a regression from this pass.

### Minors — recorded, NOT a rework, do not touch them in TASK-003

Carrying forward the five from the first review, all still accurate, plus one:

6. **`readCommits` skips a failed `git show`** (`if (shown.exitCode !== 0)
   continue;`), so a commit whose diff cannot be read reaches the AI with stats
   and an empty diff — indistinguishable from a commit whose diff was emptied by
   the path filters. Same family as minor 1 (`listRepoFiles`), one degree
   milder: it degrades a commit rather than falsifying the whole run, and
   SPEC-001 assigns no error code to it. **Bound in TASK-005 item 6** together
   with minor 1 rather than invented as a new code here.

### Not this TASK's defect, but found while reviewing it — a flaky test in the suite

`bun test` **failed on my first run of this review** — 109 pass / 1 fail — and
was green on the second. The failure is **not in `src/git/` and not Jason's
rework**: it is `test/auth.test.ts` "with a tampered token → 401
AUTH_REQUIRED", from TASK-002 (`DONE`), which got `200`.

**The application is not broken; the test is.** It "tampers" the cookie by
flipping the JWT's last character (`…A` → `…B`, anything else → `…A`). A
32-byte HMAC-SHA256 signature is 43 base64url characters and the last one
carries only the top bits of the final byte, so several characters decode to the
**identical** signature. I measured it rather than argued it — 400 real sessions
through the app's own `signSession`/`verifySession`:

```
tamper was a NO-OP (the token still verified): 18 / 400
last chars that produced a no-op: { A: 18 }
```

So roughly one run in twenty, the "tampered" token is byte-identical after
decoding, verification correctly succeeds, and the test correctly-behaving code
fails. No forgery is possible from this — an attacker cannot produce a signature
they do not already hold, only a different spelling of one they do.

It matters because `bun test` green is the DoD gate on **every** backend TASK,
including this one, and a gate that fails one run in twenty for a reason nobody
remembers is a gate that gets ignored. It reopens nothing: TASK-002 stays `DONE`
(the code it tests is correct). **It needs a small TASK line of its own** — tamper
a byte of the *payload*, or flip a character in the middle of the signature —
and writing that line is Sober's next unit, queued on the board.
