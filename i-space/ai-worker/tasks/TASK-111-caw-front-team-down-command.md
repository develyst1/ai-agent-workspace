# TASK-111: caw-front — the team-down command matches caw-back (`bun run runner`)
- Source: SPEC-103 (REQ-104 Q3, PM-decided 2026-10-29 — `requirements/REQ-104-caw-live-cli-view.md` § Questions Q3)
- Owner: FE (Fanta)
- Status: DONE (2026-10-29, Silver — § Review)
- Depends on: none (do it with TASK-106's DoD 6 or right after; same repo)
- Repo: `caw-front` on `atom`. **You change code; you never run git.**

## Why

caw-back's `TeamStatus.startCommand` is the literal `"cd caw-back && bun run runner"` (`caw-back → src/http/routes/team.ts:13`). It
is what to run when the **API is up but no runner is**. `bun run dev` would also start a second API and clash on :4500. caw-front's
mock, tests and the hand-restored line in `schema.d.ts` still say `bun run dev`.

## What to do

Change **only** the team-down start command, everywhere it appears, to `cd caw-back && bun run runner`.

Closed file list (lines from the SA's `grep -n`, 2026-10-29):
- `src/api/schema.d.ts` — run `bun run gen:api` again and **keep its output as is** (drop your hand-restore at `:3876`);
- `src/api/mock.ts:733` — both branches;
- `src/api/mock.test.ts:220,222`;
- `src/api/http.test.ts:312,318`;
- `tests/board.spec.ts:162`;
- `tests/chat.spec.ts:172`.

**Do not change:**
- `src/components/BackendDown.tsx:15` — the **API-down** command; there `bun run dev` is right, because it starts both;
- `src/words.ts:250` `sampleDataHint` — caw-front's own dev command;
- `mock.ts:250` / `tests/team.spec.ts:254` / `http.test.ts:332` — a project's code-map commands, unrelated.

## Definition of Done

- [ ] `grep -rn "cd caw-back && bun run dev" src tests` → only `src/components/BackendDown.tsx:15` (paste it).
- [ ] `git diff --numstat src/api/schema.d.ts` → TASK-106's additions + this one line changed, from a plain `gen:api` with no hand edit.
- [ ] `bun run typecheck` clean · `bun test src` → same count as TASK-106 left it, 0 fail.
- [ ] `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → all pass (264 at TASK-106).
- [ ] `git status --short` → only files from TASK-106's and this TASK's closed lists; no `tsconfig.json`.

## Implementation Notes

Fanta · 2026-10-29 13:45–13:48 · `caw-front` on `atom` · no git write · only the team-down command changed.

**Changed (every hit of the old command; `grep -rn "cd caw-back && bun run dev" src tests` found these 8 lines before):** `src/api/mock.ts:733` (both branches) · `src/api/mock.test.ts:220,222` · `src/api/http.test.ts:312,318` · `tests/board.spec.ts:162` · `tests/chat.spec.ts:172` → `cd caw-back && bun run runner`. `src/api/schema.d.ts`: my hand-restore at `:3876` is dropped — a plain `bun run gen:api` (13:45) rewrote it, nothing edited by hand.

```
$ grep -rn "cd caw-back && bun run dev" src tests                → (no output)
$ git diff --numstat src/api/schema.d.ts                         → 141  1   (TASK-106's 140 additions + this one line)
$ git diff -U0 src/api/schema.d.ts | grep startCommand           → -startCommand: "cd caw-back && bun run dev";  +startCommand: "cd caw-back && bun run runner";
$ bun run typecheck                                              → clean
$ bun test src                                                   → 334 pass · 0 fail · 1325 expect() calls (same count as TASK-106 left it)
$ NEXT_DIST_DIR=.next-f bun run build                            → ✓ Compiled successfully
$ NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e    → 264 passed (2.7m)  exit 0   (13:45 → 13:48)
```
`git status --short` → TASK-106's list plus `src/api/http.test.ts`, `src/api/mock.test.ts`, `tests/board.spec.ts`, `tests/chat.spec.ts` (all in this TASK's list); no `tsconfig.json`.

**One difference from the DoD text:** the first checkbox expects the grep to show `src/components/BackendDown.tsx:15`. It does not, because that line is JSX text: `cd caw-back &amp;&amp; bun run dev` (HTML-escaped `&&`), so the literal grep cannot match it. I read line 15 and did not touch the file (`git diff --stat src/components/BackendDown.tsx` → empty). `src/words.ts:250`, `mock.ts:250`, `tests/team.spec.ts:254` and `http.test.ts:332` are also untouched.
Footprint: git-ignored `.next-f/`, `test-results/`; no servers left (`ss … :3510|:3530` → nothing).

## Questions

## Review

**DONE** — Silver (SA, Team B), 2026-10-29 13:5x.

- Re-checked by the SA:
  - `grep -rn "cd caw-back && bun run dev" src tests` → no output;
  - `git diff --stat src/components/BackendDown.tsx` → empty (untouched);
  - `git diff --numstat src/api/schema.d.ts` → 141 / 1;
  - `bun test src` → 334 pass · 0 fail; typecheck clean.
- Your note on DoD 1 is right and the DoD text was mine: `BackendDown.tsx:15` holds `&amp;&amp;` (JSX), so the literal grep
  cannot show it. The check that matters (the file is unchanged) passes.
