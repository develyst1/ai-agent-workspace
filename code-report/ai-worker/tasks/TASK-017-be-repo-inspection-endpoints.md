# TASK-017: BE — repository inspection endpoints (branches, committers)
- Source: SPEC-003
- Status: DONE (reviewed by Sober 2026-08-21 at commit `d1f0993` — see `## Review`)
- Assignee: Jason (BE)
- Depends on: none. Independent of TASK-014 (that one is a runbook, not code) and
  of everything in `code-report-front`. **TASK-018 depends on this.**
- Written: 2026-08-21 by Sober (SA Lead)

## Why this exists

REQ-004 Requirements 1, 1a and 6: the form must offer a **branch list** and a
**committer list** loaded from the repository, and if the branch list cannot load
the user cannot continue. The backend has never contacted a repository before a
job row exists, so these two endpoints are new surface. Design and the reasons
behind every judgement: **SPEC-003 §"Decision 1", §"Decision 2", §"API /
Interface Design"** — read them before you start; they are not repeated here.

**Read-only by construction:** no table, no column, no job row, no AI call, no
config key, and `POST /api/reports` does not change.

## What to do

### 1. `src/git/lsRemote.ts` — a new git-layer module

- `export const LS_REMOTE_TIMEOUT_MS = 30_000;` (SPEC-003 Decision 1 — a form
  field may not hang for the clone's ten minutes).
- `buildLsRemoteArgs(href, { pat })`, exported so a test can assert the argv:
  the same discipline `buildCloneArgs` uses — `-c credential.helper=`,
  `-c core.askPass=`, `-c http.extraHeader=<authorizationHeader(pat)>` when there
  is a token — then `ls-remote --symref --heads <href>`. **The token never goes
  near the URL**, and **no directory is created**.
- `parseLsRemote(stdout)` → `{ branches: string[]; defaultBranch: string | null }`.
  Short names (`refs/heads/` stripped), git's own order, no de-duplication.
  `--symref` prints HEAD's target; that short name is `defaultBranch` **only if it
  is also in `branches`** — otherwise `null`. Never invent `main`.
- `listRemoteBranches(options)`: `assertSafeRepoUrl` (so the private-host / DNS
  gate applies), `runGit` with `timeoutMs: LS_REMOTE_TIMEOUT_MS` and the same
  secrets list, then `timedOut → GitLayerError("CLONE_TIMEOUT")`, `exitCode !== 0
  → classifyCloneFailure(stderr, { hasPat })`. Test seams (`runner`, `lookup`,
  `timeoutMs`) exactly as `cloneRepository` has them.
- **Reuse, do not re-derive:** `authorizationHeader` and the credential-secrets
  list already exist in `src/git/clone.ts`. `credentialSecrets` is module-private
  there — **export it and import it**. A second list of "what counts as a secret"
  is how one of them stops being redacted.
- Export the module from `src/git/index.ts`.

### 2. `src/repos/validate.ts` — body validation

- `validateBranchesBody`: `repoUrl` required, through the **same `parseRepoUrl`**
  the report body uses (so a URL carrying userinfo is rejected here too);
  `pat` optional, type-checked only and never inspected or echoed.
- `validateCommittersBody`: the above plus `branch`, `dateFrom`, `dateTo`, all
  three **required** here (the list has no meaning without them).
- **Import `parseCalendarDate`, `MAX_SPAN_DAYS` and the `DATE_ORDER` /
  `SPAN_TOO_LONG` issue handling from `src/reports/validate.ts`. Do not
  re-implement the date rules or re-declare 366** — a second copy of a bound is
  how two bounds drift apart. If that means exporting a small helper out of
  `reports/validate.ts`, export it; do not copy the body.
- Same `FieldIssues` shape, so `400` renders through the existing
  `validationEnvelope` + `fieldMessage` path with no new error text.

### 3. `src/repos/routes.ts` + `src/repos/index.ts`

`POST /` and `POST /committers`, exactly the shapes in SPEC-003 §API:

```
POST /api/repos/branches
  200 { branches: string[], defaultBranch: string | null }
  400 VALIDATION_ERROR { fields } · 401 AUTH_REQUIRED
  502 REPO_AUTH_FAILED | REPO_NOT_FOUND | CLONE_FAILED | CLONE_TIMEOUT

POST /api/repos/committers
  200 { committers: [ { name, email, commits } ] }
  400 VALIDATION_ERROR { fields } · 401 AUTH_REQUIRED
  502 BRANCH_NOT_FOUND | REPO_AUTH_FAILED | REPO_NOT_FOUND | CLONE_FAILED | CLONE_TIMEOUT
```

- A `GitLayerError` becomes `c.json(errorEnvelope(error.code, language, { branch,
  detail }), 502)` — the **existing** envelope, the existing messages, the
  existing `Accept-Language` handling. **No new error code and no new string in
  `src/errors/messages.ts`.**
- Committers: `withClone` with `--filter=blob:none --single-branch --branch
  <branch>` (i.e. `cloneRepository`'s own args) and
  `timeoutMs: INSPECT_CLONE_TIMEOUT_MS = 120_000`; inside it,
  `readCommits(dir, { branch, dateFrom, dateTo, timeZone: config.REPORT_TIMEZONE,
  includeDiffs: false })`; then group by `authorEmail` when it is non-empty, else
  by `authorName`, counting commits. **Sorted by `commits` descending, then
  `name` ascending.** `--no-merges` is already in `commitLogArgs`, which is why
  the list contains exactly the people a report can then find.
- The temp directory: `jobTempDir` validates its argument as a path segment, so
  pass an id you generate (`crypto.randomUUID()`), and **it must live under
  `tempRoot()`** so the startup sweep still finds a stray. `withClone` deletes it
  in a `finally` — on success, on throw, on timeout.
- **Both endpoints resolve config the way `reports/routes.ts` does** (lazily, on
  first use — never at import time), and take the same
  `ALLOW_PRIVATE_GIT_HOSTS` / `REPORT_TIMEZONE` values. No new key.

### 4. `src/index.ts` — the session gate first

```ts
app.use("/api/repos", requireSession);
app.use("/api/repos/*", requireSession);
app.route("/api/repos", createRepoRoutes());
```

Mount the gate **before** the routes, in the same shape TASK-002 used for
`/api/reports`, so an unauthenticated call is `401 AUTH_REQUIRED` and no git
process starts.

### 5. PAT handling — all seven SPEC-001 rules apply verbatim

Body only; request-lifetime memory only; never persisted; `http.extraHeader`
never the URL; the redactor on every line of git output; **request-body logging
off for `/api/repos/*`** — nothing in these files logs, echoes or stores the
body. Rule 7's acceptance grep now covers these paths too.

**One consequence, already stated in SPEC-003 and not a new decision:** the token
crosses the wire once per list load as well as once per submit. That is the
direct result of Q27 ("no list, no continuing"); do not try to soften it with a
cache or a server-side store — **a cache is deliberately not in this design**.

## Definition of Done
- [x] `bun run typecheck` exit 0.
- [x] `bun test` green, with new tests in `test/` (the existing file-per-module
      convention) covering **at least**:
      - [x] a `repoUrl` carrying userinfo → `400`, no process spawned;
      - [x] `git@…` / `ssh://` / `file://` → `400`;
      - [x] the PAT appears **only** in an `http.extraHeader` argv entry — never
            in the URL argument — for **both** endpoints (assert on
            `buildLsRemoteArgs` / `buildCloneArgs`);
      - [x] a PAT-bearing failure's stderr comes back **redacted** (token and the
            base64 credential both);
      - [x] `classifyCloneFailure` reuse: `authentication failed` and a bare
            `404` → `REPO_AUTH_FAILED`; `does not appear to be a git repository`
            → `REPO_NOT_FOUND`; a timeout → `CLONE_TIMEOUT`;
      - [x] `parseLsRemote`: heads parsed, `defaultBranch` from `--symref`, and
            `defaultBranch: null` when the symref target is not among the heads;
      - [x] an empty remote → `200 { branches: [], defaultBranch: null }`, **not**
            an error;
      - [x] the span bound is the **same exclusive** one: 366 accepted, 367
            rejected, `dateTo < dateFrom` → `DATE_ORDER`;
      - [x] `branch` / `dateFrom` / `dateTo` missing → `400 REQUIRED`;
      - [x] committers: grouping and the sort order (commits desc, then name asc);
      - [x] the temp directory is deleted on success **and** when the body throws.
- [x] Unauthenticated `POST` to both paths → `401`, proved by a test.
- [x] `git grep` shows no new entry in `src/errors/messages.ts`, no new config
      key, and no change to `src/db/migrations/`.
- [x] `POST /api/reports` is byte-identical: state that `src/reports/routes.ts`
      and the report body's contract were not changed (a re-export moved out of
      `reports/validate.ts` is allowed and must be named).
- [x] `git status --porcelain` empty at the reported commit, and the hash in
      `## Implementation Notes`.
- [x] **No server started, no database, no SQL, no real repository cloned** — the
      tests use the existing runner seam. If you believe something here cannot be
      proved without a real remote, that is a `## Questions` line, not a run.

## Implementation Notes

**Commit `d1f0993`, clean tree, 2026-08-21 (Jason).** Every DoD box above is
ticked against this commit; the evidence for each is below.

### What changed — 10 files, +1268 / −24

New: `src/git/lsRemote.ts` (143), `src/repos/routes.ts` (229),
`src/repos/validate.ts` (108), `src/repos/index.ts` (11),
`test/git-ls-remote.test.ts` (225), `test/repos-routes.test.ts` (496).
Touched: `src/git/clone.ts` (+6/−1 — `credentialSecrets` exported, with the
reason in its doc comment), `src/git/index.ts` (+1 — the barrel),
`src/index.ts` (+12/−4 — the two `requireSession` mounts **before**
`app.route("/api/repos", …)`, plus the header comment), `src/reports/validate.ts`
(+37/−19 — the three re-exports, below).

**Nothing else was touched, and the untouched list is a measurement, not a
claim:** `git diff --stat -- src/errors/messages.ts src/config.ts src/db/
src/reports/routes.ts src/reports/worker.ts src/reports/jobs.ts` prints
**nothing** at this commit. No new error code, no new user-facing string, no new
config key, no migration, no `POST /api/reports` contract change.

### The three re-exports out of `reports/validate.ts` (named, as the DoD asks)

`applyDateWindowRules`, `optionalText`, `requiredText`. The first is the date
block **moved verbatim** out of `validateCreateReport` — the two calendar
parses, `DATE_ORDER`, and the exclusive `> MAX_SPAN_DAYS` comparison — so the
committers endpoint applies the same bound rather than a second copy of 366.
`validateCreateReport` now calls it; the existing `reports-validate.test.ts`
passes unmodified, which is the proof the move was behaviour-neutral.

### Gates, run at `d1f0993`

- `bun run typecheck` → exit 0.
- `bun test` → **230 pass / 0 fail**, 650 expect(), 18 files. Was 199 / 560 / 16
  at `4101551`, so **31 tests added, none removed, none rewritten**.
- `git status --porcelain` → empty.
- No server started, no `DATABASE_URL` pointed anywhere, no SQL, no database, no
  AI call, **no real remote contacted**. The module suites drive the existing
  `runner` seam; the three end-to-end committers tests clone a **local fixture
  repository** through that same seam, exactly as `reports-routes.test.ts` and
  `git-clone.test.ts` already do.

### Four judgements, flagged rather than buried

1. **A run-time `RepoUrlError` (private range / unresolvable) is a `502`
   `REPO_NOT_FOUND`.** The TASK's 502 list does not name this case, but it is
   reachable: `parseRepoUrl` catches scheme and userinfo at the 400, while the
   DNS gates only fire inside `assertSafeRepoUrl`. Rather than invent a mapping
   I **reuse `classifyRunFailure` from `reports/worker.ts`**, so the inspection
   endpoints and the worker cannot answer the same address differently. Anything
   that is neither `GitLayerError` nor `RepoUrlError` is **re-thrown** to
   `app.onError` → `500 INTERNAL`; a bug must not be reported as a story about
   the remote. (Q-BE-17 asks whether the import direction is acceptable.)
2. **`parseLsRemote` ignores `HEAD`'s own non-symref line.** Real `ls-remote`
   output can carry `<sha>\tHEAD` next to the heads; only `refs/heads/*` becomes
   a branch, so `HEAD` never appears in the list. Order and duplicates are git's,
   untouched, as instructed.
3. **The committers clone passes `branch` to `cloneRepository`**, so the argv is
   `buildCloneArgs`'s own `--filter=blob:none --single-branch --branch <branch>`
   — one place builds clone argv. A branch that does not exist therefore fails at
   the clone as `BRANCH_NOT_FOUND`, which is the code SPEC-003 lists.
4. **The temp id is `crypto.randomUUID()` through `jobTempDir`**, so the
   directory is under `tempRoot()` and the startup sweep still finds a stray.
   Nothing is persisted and no job row exists — the name is a path segment, not
   an identity.

### One duplication I did NOT remove, deliberately

`renderIssues` (the `FieldIssues` → per-field-message loop) now exists twice:
privately in `reports/routes.ts` and privately in `repos/routes.ts`. Collapsing
them means editing `reports/routes.ts`, which this TASK's DoD requires to be
unchanged. It is 8 lines with no bound in it, so nothing can drift the way two
copies of 366 would — but it is Sober's call, not mine (Q-BE-18).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

### Q-BE-17 — `repos/routes.ts` imports `classifyRunFailure` from `reports/worker.ts`. Acceptable, or should the mapping move? (NON-BLOCKING)

It is a pure exported function and reusing it is what keeps one address from
being classified two ways. But it points the new `repos/` layer at the report
**worker**, which is a heavier neighbour than the git layer it otherwise talks
to. The alternative that avoids the import is moving `classifyRunFailure` into
`src/errors/` or `src/git/` — a change to a file this TASK does not own, so I
did not make it. Nothing is blocked either way.

> answer (Sober, 2026-08-21): **Acceptable as shipped — change nothing.** The
> property worth protecting is the one you named: two doors onto the same
> address must not classify it two ways, and reuse is the only thing that
> guarantees it. The import direction is untidy, not wrong: `classifyRunFailure`
> is a pure function of an error object, it reads no worker state, and you did
> the right thing by not editing a file this TASK does not own to make the
> import prettier. **Moving it to `src/errors/` is now a parked candidate of
> mine** (with `renderIssues`, Q-BE-18) — if it ever moves, it moves once, in a
> TASK that owns both files.

### Q-BE-18 — collapse the duplicated `renderIssues`? (NON-BLOCKING)

See "One duplication I did NOT remove". If you want one copy, the natural home
is `src/errors/index.ts` next to `validationEnvelope`, and it needs the
`FieldIssues` type to move with it — a small TASK line of yours, not a silent
edit of `reports/routes.ts` inside this one.

> answer (Sober, 2026-08-21): **Keep both copies. You were right not to touch
> `reports/routes.ts`.** My rule about copies is about copies of a *bound* (366,
> a timeout, a secrets list) — two of those drift and one of them silently stops
> being enforced. `renderIssues` holds no bound: it is a loop over
> `Object.entries` that delegates every word to `fieldMessage`, so the worst a
> divergence can do is show up as a compile error. **Parked with Q-BE-17 as one
> candidate**, ranked below everything that unblocks a person; it is a tidy-up,
> and tidy-ups do not get to edit a file mid-TASK.

### Q-BE-19 — a committer with no author e-mail: the wire carries `email: ""`. Is that the contract? (BLOCKS nothing today, but TASK-018 will read it)

SPEC-003 shows `{ name, email, commits }` and does not say what an e-mail-less
commit produces. I group by name in that case (as instructed) and return
`email: ""` rather than omitting the key or sending `null`, because omission
would make the field optional for the frontend and `null` is a third shape.
**The consequence is Fern's, which is why I am asking rather than deciding:**
Decision 2.3 says the value sent as `author` is "the e-mail when there is one,
else the name", so TASK-018 has to branch on this exact value. One line from you
settles which shape it branches on.

> answer (Sober, 2026-08-21): **`email: ""` is the contract. Ship it as built —
> the key is always present and always a `string`.** Your reasoning is the
> reasoning: omission makes the field optional for every consumer forever, and
> `null` adds a third state that the frontend then has to test for alongside
> `""`. One shape, one test — `email === "" ? name : email` — which is exactly
> Decision 2.3 with no second branch.
> **This is a wire shape, not user-facing copy, so it is mine to settle and does
> not go to the human** (nothing in Q14's bundle or REQ-004 speaks to it).
> **Recorded where it will be read, not just here:** SPEC-003 §API now states it
> and TASK-018 carries it, so Fern does not have to find this answer inside a BE
> TASK. Note the fallback also decides grouping: e-mail-less commits group by
> **name**, so two different people sharing a display name and having no e-mail
> merge into one row — accepted, because the alternative is a per-commit row and
> the report's own `--author` matching has the same limit.

### Q-BE-20 — `POST /api/reports` still accepts a branch that no list ever offered. Noted, not acted on. (NO ANSWER OWED)

Requirement 1a is a screen rule (SPEC-003 says so explicitly), and the report
contract is unchanged by design — so the API remains willing to accept a typed
branch. I mention it only so it is on file rather than discovered later: nothing
in this TASK narrows `POST /api/reports`, and I did not widen my scope to do it.

> noted (Sober, 2026-08-21): correct on all three counts, and you were right to
> leave it alone. Requirement 1a is a screen rule by SPEC-003's own words, and
> narrowing the report contract would break the one thing that makes REQ-004
> cheap — that `POST /api/reports` does not change at all. On file, no action.

## Review

**Verdict: `DONE` at `d1f0993`. Reviewed 2026-08-21 by Sober.** Every gate re-run
by me, and the load-bearing behaviour re-measured outside Jason's suite. No code
written, no SQL, no database, no server, no real remote.

### 1. The gates, re-run rather than read

- `bun run typecheck` → **exit 0**.
- `bun test` → **230 pass / 0 fail**, 650 expect(), 18 files — reproduces his
  numbers exactly.
- `git status --porcelain` → **empty**; `HEAD` is `d1f0993`.
- `git show --stat` → the 10 files and `+1268 / −24` he reported, file for file.
- **"31 added, none removed, none rewritten" is now proof, not a claim:**
  `git diff 4101551 d1f0993 -- test/` is **two new files, 721 insertions, and
  `grep -c '^-[^-]'` over that diff returns 0** — not one line was deleted from
  an existing test, so the +31 cannot be hiding a −n.
- **The untouched list is a measurement:** `git diff --stat 4101551 d1f0993 --
  src/errors/messages.ts src/config.ts src/db/ src/reports/routes.ts
  src/reports/worker.ts src/reports/jobs.ts` prints **nothing**. No new error
  code, no new string, no new config key, no migration, and `POST /api/reports`
  is untouched.

### 2. The `reports/validate.ts` move is behaviour-neutral, verified in the diff

I read the diff rather than the description: `applyDateWindowRules` is the old
inline block **character for character** (the two `parseCalendarDate` calls,
`DATE_ORDER`, and the **exclusive** `> MAX_SPAN_DAYS`), `validateCreateReport`
now calls it, and the only other change is `export` on two helpers plus doc
comments. `reports-validate.test.ts` is unmodified and green — the right proof.

### 3. Measured outside his suite (my own script, the real modules, `test/` never loaded)

- **PAT placement:** `buildLsRemoteArgs` puts the token **only** in the
  `http.extraHeader` entry; the URL argument does not contain it, and the
  no-PAT argv carries no header at all.
- **`parseLsRemote`:** heads parsed in git's order; `HEAD`'s own non-symref line
  and `refs/tags/*` ignored; `defaultBranch: null` when the symref target is not
  among the heads; empty stdout → `{ branches: [], defaultBranch: null }`.
- **Failure mapping through `listRemoteBranches` with a fake runner:** timeout →
  `CLONE_TIMEOUT`; `authentication failed` → `REPO_AUTH_FAILED`; a bare
  `Repository not found` → `REPO_AUTH_FAILED` (Q-BE-5/Q-BE-13 rule, inherited);
  `does not appear to be a git repository` → `REPO_NOT_FOUND`.
- **The secrets list actually handed to `runGit`** is `credentialSecrets(pat)` —
  the token plus the two derived values — and `timeoutMs` is **30000**, i.e.
  `LS_REMOTE_TIMEOUT_MS`, not the clone's budget.
- **Validation:** `https://u:p@host/o/r.git` → `400 INVALID_URL` **before any
  runner is reached**; `git@…` → `400`; `branch`/`dateFrom`/`dateTo` missing →
  three `REQUIRED` issues; **span 366 accepted / 367 → `SPAN_TOO_LONG` limit
  366**; `dateTo < dateFrom` → `DATE_ORDER`. Same bound as the report, because
  it is literally the same function.
- **`groupCommitters`:** groups by e-mail when present, by name when the e-mail
  is `""`, counts correctly, and a three-way tie sorts by name ascending.

My probe lived in `develyst/sober-probe`, outside both repos, and is **deleted**;
`code-report-back` is clean.

### 4. Two things the DoD does not name, checked anyway

- **PAT rule 6 holds by construction:** `grep` for `console.` / `emit(` across
  `src/repos/` and `src/git/lsRemote.ts` returns **nothing** — these paths cannot
  log a body because they do not log at all.
- **`BRANCH_NOT_FOUND` with no branch is safe:** `ls-remote` calls
  `classifyCloneFailure` without a `branch`, and `messages.ts` already has an
  `undefined` arm for that code, so the theoretical path renders a real sentence
  rather than `undefined`. Nothing to change.

### 5. His four judgements — all upheld

1. **`classifyRunFailure` reuse (→ `REPO_NOT_FOUND` for a `RepoUrlError`) is
   right.** Two doors onto the same address must not disagree, and the
   re-throw of everything else means a bug is a `500`, not a story about the
   remote. See Q-BE-17.
2. `parseLsRemote` ignoring `HEAD`'s own line — verified in my probe.
3. Passing `branch` to `cloneRepository` so one place builds clone argv, and a
   missing branch fails as `BRANCH_NOT_FOUND` — the code SPEC-003 lists.
4. `crypto.randomUUID()` through `jobTempDir` under `tempRoot()` — his test
   asserts both `startsWith(tempRoot())` and deletion, on success **and** when
   `readCommits` throws inside `withClone`'s body.

### 6. One finding of mine, and it is MINE, not a defect of this TASK

**The inspection clone is unbounded.** The worker runs its clones behind
`Semaphore(config.MAX_CONCURRENT_JOBS)` (default 2); `POST /api/repos/committers`
does a full metadata clone with **no such bound**, so N authenticated requests
are N concurrent `git` processes and N temp directories. **SPEC-003 never
specified a limit — that is a gap in my spec, not in Jason's build**, and it is
not a one-line fix (reusing the worker's semaphore, a separate bound, or a new
config key are three different answers and the TASK forbids a new config key).
It is therefore **not a rework item**: it goes to my parked queue as a SPEC-003
decision before it is ever a TASK line, exactly as the query-string-secret item
did at the TASK-005 review. Nothing today is blocked by it and no behaviour
Fern depends on changes either way.

### 7. Why this is `DONE` and not `REWORK`

Every DoD box is independently reproducible, the two security properties that
matter (the token never on the remote URL; a credentialed URL rejected before a
process starts) were measured rather than read, and the one thing I found is a
hole in my own SPEC. Nothing in the endpoints has to change for TASK-018 to
start — **but TASK-018 still waits on TASK-019, which is Fern's and still
`TODO`.**
