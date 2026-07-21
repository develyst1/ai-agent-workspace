# TASK-001: API key store module + example file + gitignore

- Source: SPEC-001
- Status: REVIEW
- Depends on: none

## What to do

Create a small, self-contained key-store module. No middleware wiring yet
(that's TASK-002) — just the store + supporting files.

1. **`src/auth/keyStore.ts`** — new file. Responsibilities:
   - Load and parse `api-keys.json` from the repo root
     (`process.cwd() + "/api-keys.json"`, or resolve relative to project root).
   - Cache the parsed entries in a `Map<key, { project, disabled }>`.
   - **Reload on change:** track the file's `mtimeMs`; on each lookup, `stat`
     the file and re-parse only if mtime changed. Use Bun/Node `fs` (`statSync`,
     `readFileSync`) — synchronous is fine, the file is tiny.
   - Export `lookupProject(key: string): string | null` — returns the project
     name for a valid, **enabled** key, else `null` (unknown OR disabled both
     return `null` — callers must not distinguish).
   - **Fail closed & never throw:** if the file is missing, empty, or invalid
     JSON, treat it as "no keys" (every lookup returns `null`) and
     `console.warn` once per load failure. Do not crash the process.
   - Never log key values anywhere.
2. **Types:** add a small `ApiKeyEntry` interface (`key`, `project`, `disabled`)
   — put it in `keyStore.ts` (local) rather than bloating `src/types/index.ts`,
   since it isn't part of the public request/response contract.
3. **`api-keys.example.json`** (repo root, committed) — dummy entries showing the
   shape from SPEC-001 (two projects, one `disabled: true`).
4. **`.gitignore`** — add `api-keys.json` so the real key file is never committed.
   (Leave `api-keys.example.json` tracked.)

Follow the repo's existing style (see `src/config/models.ts`): plain functions,
Thai section comments are fine but not required.

## Definition of Done

- [ ] `src/auth/keyStore.ts` exists and exports `lookupProject`.
- [ ] `api-keys.example.json` committed; `api-keys.json` present locally for
      testing and listed in `.gitignore` (verify: `git check-ignore api-keys.json`
      prints the path).
- [ ] Manual smoke (no test runner in repo) — create a local `api-keys.json` with
      one enabled + one disabled entry, then in a scratch file or `bun repl`:
      `import { lookupProject } from "./src/auth/keyStore"` and confirm:
      - valid enabled key → returns its project name,
      - disabled key → `null`,
      - unknown key → `null`,
      - delete/rename `api-keys.json` → returns `null` and warns, no crash.
- [ ] Type-check passes: `bunx tsc --noEmit` (tsconfig present) reports no new errors.
- [ ] No key value is ever printed/logged.

## Implementation Notes

### Files changed
- **`src/auth/keyStore.ts`** (new) — key store module. Local `ApiKeyEntry`
  interface (`key`, `project`, `disabled?`). Loads `api-keys.json` resolved from
  `process.cwd()`. Caches parsed entries in a `Map<key, {project, disabled}>`,
  tracks the file's `mtimeMs`, and re-parses only when mtime changes (cheap
  `statSync` per lookup). Exports `lookupProject(key): string | null` — returns
  the project name only for a valid **enabled** key; unknown OR disabled both
  return `null` (indistinguishable). Fail-closed & never throws: missing / empty /
  invalid-JSON file → treated as "no keys" (all lookups `null`) with a single
  `console.warn` (guarded so it doesn't spam every request while the file stays
  broken; re-warns on a fresh failure transition). Duplicate `key` → first wins.
  Only project names are ever logged — no `key` value is printed anywhere.
- **`api-keys.example.json`** (new, committed) — dummy shape from SPEC-001: two
  projects, `project-beta` with `disabled: true`. Real keys go in the gitignored
  `api-keys.json` (placeholder text tells the human to `openssl rand -hex 24`).
- **`.gitignore`** — added `api-keys.json` (example stays tracked).
- Local `api-keys.json` created for testing only — gitignored, **not** committed.

### Verification (commands + output)
- `git check-ignore api-keys.json` → prints `api-keys.json` ✅;
  `git check-ignore api-keys.example.json` → not ignored ✅.
- `git status --porcelain` shows `?? api-keys.example.json`, `?? src/auth/`,
  `M .gitignore` — **`api-keys.json` absent** (correctly ignored). ✅
- Smoke test (temporary scratch file run with `bun`, since no test runner; file
  removed after) — all PASS:
  - enabled key → `"project-alpha"`
  - disabled key → `null`
  - unknown key → `null`
  - empty key → `null`
  - `api-keys.json` renamed away mid-run → `null` + one warn, **no crash**; second
    lookup still `null` (no warn spam)
  - file restored → hot-reload, enabled key → `"project-alpha"` again
- `bunx tsc --noEmit` → **no errors in project source** (`src/**`). The only tsc
  output is pre-existing `node_modules/bun-types/ffi.d.ts` "Duplicate identifier"
  noise (tsconfig has no `skipLibCheck`) — present regardless of this change,
  none of it references `src/`.

### Notes for review
- I did **not** touch the repo `CLAUDE.md` — it already showed as modified in
  `git status` at the start of my session (the AI-team role section). Left as-is.
- The warn-guard logic (`warnedFailure` + resetting `cachedMtimeMs` on missing
  file) is the one spot with any subtlety; happy to simplify if you'd prefer a
  plain warn-every-failed-load.
- No wiring/middleware here per scope — that's TASK-002.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

(Sober fills this in at REVIEW: verdict + reasons.)
