# TASK-026: BE — `RepoInspector` capability over the live clone
- Source: SPEC-007
- Status: TODO
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
- [ ] `RepoInspector` interface + `createRepoInspector(dir)` in `src/git/inspect.ts`,
      exported from `src/git/index.ts`.
- [ ] Path confinement enforced: a `read_file`/`search` path with `..`, an absolute
      path, or a symlink escaping `dir` is rejected (proven by a test using a fixture
      repo under `test/fixtures`).
- [ ] Size/hit caps reuse the existing constants (`MAX_TREE_PATHS`,
      `MAX_CHARS_PER_FILE`); `search` argv passes the word as a literal.
- [ ] Unit tests in a new `test/git-inspect.test.ts` (fixture repo): list returns
      capped paths, read returns capped/truncated content and rejects escapes,
      search returns capped literal-match hits.
- [ ] `bun run typecheck` exits 0 and `bun test` passes (`cd code-report-back`).

## Implementation Notes
(Jason fills in.)

## Questions
(Jason asks; Sober answers as `> answer: ...`.)

## Review
(Sober fills in at REVIEW.)
