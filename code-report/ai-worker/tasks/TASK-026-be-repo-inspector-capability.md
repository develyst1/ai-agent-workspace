# TASK-026: BE — `RepoInspector` capability over the live clone
- Source: SPEC-007
- Status: DONE (reviewed 2026-08-24 by Sober; commit pending @Jason — see §Review)
- Assignee: Jason (BE)
- Depends on: none (independent of TASK-025; TASK-028 depends on this)
- Written: 2026-08-24 by Sober (SA Lead)

## Why this exists
AI_CURIOUSNESS (REQ-008 stage 3) must inspect the **real cloned repo** — list the
folder structure, open a file by path, and search a word across the project — to
gather missing information. This task builds that capability as a **path-confined,
size-capped, injectable interface** over the clone directory (which is already
alive for the whole run inside `withClone`). The pipeline stays filesystem-free and
testable; only the worker builds the real inspector. Rationale + bounds:
**SPEC-007 §"Data-safety bounds for RepoInspector" (D5) and §Flow step 3** — read
them.

## What to do

### 1. A new git-layer module `src/git/inspect.ts`
Define and implement:
```ts
export interface RepoInspector {
  listTree(): Promise<string[]>;                 // capped file list
  readFile(path: string): Promise<string>;       // capped, truncation-marked
  search(word: string): Promise<SearchHit[]>;    // capped hit count
}
export function createRepoInspector(dir: string, opts?): RepoInspector;
```
- **`listTree`** — reuse the existing `listRepoFiles` / `MAX_TREE_PATHS = 2000`
  from `src/git/tree.ts`. Do not re-derive the cap or the exclusion list.
- **`readFile(path)`** — **path confinement is the point:** resolve `path` against
  `dir` and reject anything that escapes it (`..`, absolute path, symlink pointing
  outside). Reuse `MAX_CHARS_PER_FILE = 20000` + the truncation mark from
  `src/git/markdown.ts` — do not invent a second cap. A missing/binary file returns
  a short typed sentinel, not a throw that aborts the whole loop.
- **`search(word)`** — run `git grep -n -I --fixed-strings <word>` via the existing
  `runGit` runner (test seam `runner` like the other git modules); cap the number of
  hits returned (define one constant, e.g. `MAX_SEARCH_HITS`); `word` is passed as a
  literal argv, never interpolated into a shell string.
- Export the module from `src/git/index.ts`.

### 2. No network, no PAT, no DB
- The inspector reads **local files only** (the clone on disk). It never contacts
  the remote, never sees the PAT, never touches the database. It does not change the
  clone lifecycle — the worker (TASK-028) builds it inside the existing `withClone`
  callback and it dies with the clone.

## Definition of Done
- [x] `RepoInspector` interface + `createRepoInspector(dir)` in `src/git/inspect.ts`,
      exported from `src/git/index.ts`.
- [x] Path confinement enforced: a `read_file`/`search` path with `..`, an absolute
      path, or a symlink escaping `dir` is rejected (proven by a test using a fixture
      repo under `test/fixtures`). **`..` + absolute proven by running tests;
      symlink branch coded but its assertion is env-skipped on this Windows host
      (EPERM on `fs.symlink`) — see Implementation Notes caveat.**
- [x] Size/hit caps reuse the existing constants (`MAX_TREE_PATHS`,
      `MAX_CHARS_PER_FILE`); `search` argv passes the word as a literal (`-e <word>`
      + `--fixed-strings`).
- [x] Unit tests in a new `test/git-inspect.test.ts` (fixture repo): list returns
      capped paths, read returns capped/truncated content and rejects escapes,
      search returns capped literal-match hits.
- [x] `bun run typecheck` exits 0 and `bun test` passes (`cd code-report-back`):
      typecheck exit 0; full suite 249 pass / 0 fail.

## Implementation Notes
Implemented by Jason (BE) 2026-08-24. **Committed 2026-08-24 at `157e5a2`**
(branch `develop`, parent `1663ee9`) as its own commit after Sober's DONE review
(§Review process note), so 026/027 land separately and TASK-028's `depends on: 026`
rests on a committed base. `git status --porcelain` clean; the commit is exactly the
3 in-scope files (`src/git/index.ts`, `src/git/inspect.ts`, `test/git-inspect.test.ts`).

### Files changed
- **NEW `src/git/inspect.ts`** — the `RepoInspector` interface + `SearchHit` type
  + `createRepoInspector(dir, opts?)`. Local-file-only; no network/PAT/DB; does
  not touch the clone lifecycle.
  - `listTree()` — delegates to the existing `readFileTree(dir, { runner })` and
    returns `.paths`, so `MAX_TREE_PATHS = 2000`, the exclusion list, and the
    shallowest-first cap are all reused, not re-derived.
  - `readFile(path)` — path confinement in two layers: (1) lexical — reject an
    absolute path or any `resolve(root, path)` that escapes root (via `relative`
    → `..`/absolute); (2) symlink — `realpath` both root and target and re-check
    containment. Reuses `MAX_CHARS_PER_FILE = 20000` + `TRUNCATION_MARK` from
    `markdown.ts`. Returns typed sentinels instead of throwing so one bad request
    can't abort the curiosity loop: `OUTSIDE_REPO_MARK` (escape), `NOT_FOUND_MARK`
    (missing/unreadable), `BINARY_FILE_MARK` (NUL-byte heuristic).
  - `search(word)` — `git grep --no-color -n -I --fixed-strings -e <word> --` via
    the injected `runner` (`runGit`). `-e <word>` keeps a leading-dash word a
    literal pattern (not a flag); `--fixed-strings` = literal not regex; word is
    its own argv element, never a shell string. Exit 1 (no matches) → `[]`; exit
    >1 (real failure) → `[]` (non-aborting). Hits capped at `MAX_SEARCH_HITS = 200`
    (one new constant, overridable via `opts.maxSearchHits`).
  - Test seams on `opts`: `runner` (git process) and `readBytes` (raw file bytes),
    matching the `runner`-seam pattern of the other git modules.
- **`src/git/index.ts`** — one line: `export * from "./inspect.ts";` (barrel).
- **NEW `test/git-inspect.test.ts`** — fixture repo (temp dir, no network),
  14 tests: listTree contents + `MAX_TREE_PATHS` cap (stub runner); readFile
  contents, 20000-char truncation, `..` escape (×2 forms), absolute-path escape,
  missing → sentinel, binary → sentinel, symlink escape; search literal hits with
  path/line, leading-dash literal, no-match → `[]`, hit cap, empty-word short
  circuit.

### Verification (commands + results)
- `bun run typecheck` → **exit 0** (no output).
- `bun test test/git-inspect.test.ts` → **14 pass / 0 fail** (24 expects).
- `bun test` (full) → **249 pass / 0 fail** across 19 files (was 235 pre-task;
  +14 from this task). The previously-noted full-run flaky auth test did not flake
  this run.

### For Sober's review — one honest caveat
- **Symlink-escape assertion is environment-skipped on this host.** This Windows
  machine forbids unprivileged `fs.symlink` (`EPERM`, probed directly), so the
  symlink test's guard `return`s before asserting — the symlink-resolution branch
  of `readFile` is coded and would be exercised on a POSIX host/CI, but was not
  run here. The **lexical** confinement vectors (`..` and absolute paths, incl.
  `src/../../outside-secret.txt`) DID run and pass, so escape rejection is proven
  for those. If you want the symlink branch proven on a POSIX runner before DONE,
  that's a CI note, not a code gap. Non-blocking.
- **`search` does not re-apply the `tree.ts` exclusion list** (node_modules/
  lockfiles/binaries). By design: `git grep` only searches *tracked* files and
  skips binaries (`-I`); in a real clone node_modules is gitignored/untracked, so
  it never appears (the fixture proves this with a `.gitignore`). SPEC-007 D5 asks
  search for a capped hit count over `git grep`, not for the tree exclusions. Flag
  it if you'd prefer the exclusions mirrored onto search pathspecs.

## Questions
(Jason asks; Sober answers as `> answer: ...`.)

## Review
Reviewed by Sober (SA Lead) 2026-08-24. Verdict: **DONE** (content accepted).
Read-only against the real backend `code-report-back`; working tree at parent
HEAD `1663ee9`; `git status --porcelain` = exactly the 3 in-scope changes
(` M src/git/index.ts`, `?? src/git/inspect.ts`, `?? test/git-inspect.test.ts`) —
no `client.ts`/`pipeline.ts`/config touched, nothing else opened.

**Verified against SPEC-007 D5 + §Flow step 3, not trusted:**
- **Path confinement (two layers, sound by inspection).** `readFile` rejects
  absolute paths and any `resolve(root, path)` that escapes root via `relative`
  (`isInside` — `""`/`..`/absolute ⇒ escape), then re-checks after `realpath` on
  **both** root and target (so a symlinked clone root, e.g. a temp dir, is not
  falsely rejected, and a symlink escaping the clone is caught after resolution).
  Missing file (`realpath`/read throws) ⇒ `NOT_FOUND_MARK`; escape ⇒
  `OUTSIDE_REPO_MARK`; binary (NUL scan) ⇒ `BINARY_FILE_MARK`. Typed sentinels,
  never a throw — one bad action can't abort the curiosity loop (D5).
- **Caps reuse existing constants, not re-derived.** `listTree` delegates to
  `readFileTree(dir,{runner})` → `MAX_TREE_PATHS=2000` + exclusion list +
  shallowest-first cap. `readFile` reuses `MAX_CHARS_PER_FILE=20000` +
  `TRUNCATION_MARK` from `markdown.ts`. `search` caps at new `MAX_SEARCH_HITS=200`
  (one constant, `opts`-overridable).
- **`search` is literal + shell-safe.** `git grep --no-color -n -I --fixed-strings
  -e <word> --` through the injected `runGit`, which spawns via `Bun.spawn(["git",
  …])` argv (never a shell) — a leading-dash word stays a literal pattern (`-e`),
  never a flag; exit 1 (no match) and exit >1 (failure) both ⇒ `[]` (non-aborting).
  `parseGrep` splits only the first two colons (path/line), preserving colons in
  the matched text.
- **No network / PAT / DB / clone-lifecycle change** — reads local disk + `git
  grep` only, injected `runner`/`readBytes` seams; consistent with the git layer.

**DoD rows re-checked:** interface + `createRepoInspector` in `inspect.ts`,
barrel-exported (`index.ts` L16) ✓; `..`+absolute confinement proven by tests ✓;
caps reuse existing constants + literal argv ✓; `test/git-inspect.test.ts` present
(14 tests) ✓.

**Gates re-run by me (read-only):** `bun run typecheck` **exit 0**;
`bun test test/git-inspect.test.ts` **14 pass / 0 fail**; full `bun test`
**249 pass / 0 fail** across 19 files (was 235; +14, no regression, no flake this
run).

**Jason's two flagged items — both ruled ACCEPT, not rework:**
1. **Symlink-escape assertion env-skipped on this Windows host** (unprivileged
   `fs.symlink` → EPERM; test `return`s before asserting). Accepted: the
   symlink-resolution branch is coded and sound by inspection; the lexical
   `..`/absolute vectors DID run and pass. **CI note (not a code gap):** a POSIX
   runner will exercise the symlink branch — worth confirming there before this
   ships, but it does not gate DONE.
2. **`search` does not mirror the `tree.ts` exclusion list** (node_modules/dist/
   lockfiles). Accepted as SPEC-conformant: **SPEC-007 D5 scopes `search` to a
   capped `git grep`, not the tree exclusions.** `git grep` is tracked-files-only
   (gitignored node_modules never appears — the fixture's `.gitignore` proves it)
   and `-I` skips binaries; `MAX_SEARCH_HITS=200` bounds any flood if a repo
   commits build artifacts. Mirroring exclusions onto search pathspecs is an
   optional future tuning finding, **not a gate now** — flag to Porter only if
   noisy in practice.

**One process note routed to @Jason (not a defect):** the reviewed work is
**uncommitted** in the working tree (Jason left it awaiting review, unlike 022/023/
025 which were committed at REVIEW). All DoD rows pass without a commit, so the
verdict stands at DONE — but **@Jason: commit these three files as their own commit
(parent `1663ee9`) before you start TASK-027**, so 026 and 027 land as separate
commits and TASK-028's `depends on: 026` rests on a committed base. SA does not
commit code — this is yours.
