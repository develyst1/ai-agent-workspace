# TASK-173: blueprint-back — `build` compiles one Linux binary; prove what it carries
- Source: SPEC-127 § D2, D3 (REQ-127 AC-3, AC-4, AC-5)
- Owner: BE (Jason)
- Status: DONE (2026-10-31 17:39, Sober; § Review — DoD 6–7 UNVERIFIED, PM-accepted)
- Depends on: none — REQ-127 Q1 answered (owner: *"nichaphon on this PC"*, DECISIONS 2026-10-31 17:0x)
- Repo: `blueprint-back`, **the owner's checkout on this Windows box, branch `nichaphon`** (path: `machine.local.md`), base `08e1e4d`, clean. **No git writes.** No `.env` is created or edited (none exists here; off-limits, SYSTEM-FACTS 2026-10-30 23:31).

## What to do

Closed file list — touch nothing else, **no app code** (SPEC-127 Q2 default):

1. `package.json` — add to `scripts`, after `"dev"`:
   `"build": "bun build src/index.ts --compile --minify --target=bun-linux-x64 --outfile dist/blueprint-back",`
   (`src/index.ts` is the `Bun.serve` entry — `src/index.ts:14`.)
2. `.gitignore` — append one line `*.zip` (`dist` is already ignored, `.gitignore:92`).

Install with **`bun install --no-save`** (plain `bun install` rewrites `bun.lock` on bun 1.3.14 — SPEC-127 P3/R2).
What the binary does **not** carry and why production does not need it: SPEC-127 § D3 — read it before DoD 6–7. The binary needs a **Postgres** `DATABASE_URL`; `pglite:memory` crashes it (P2) and that is expected, not a defect of this TASK.

## Definition of Done

- [ ] 1. Before: `git status --short` → empty (base: empty — 0 lines, 2026-10-31 17:06, `nichaphon` 08e1e4d)
- [ ] 2. `bun install --no-save` then `git status --short` → empty (base: scratch clone, same HEAD — 227 packages, status empty, 17:0x)
- [ ] 3. `bun run build` → exit 0, last line `compile  dist/blueprint-back bun-linux-x64-v1.3.14` (base: `error: Script not found "build"` — scratch, 17:06)
- [ ] 4. `file dist/blueprint-back` → `ELF 64-bit LSB executable, x86-64 … GNU/Linux` (base: n/a — new; SA probe P1 of the same command → `ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0`) — AC-3
- [ ] 5. `git check-ignore -v dist/blueprint-back` → `.gitignore:92:dist	dist/blueprint-back` (exit 0 — build output must be ignored) (base: `.gitignore:92:dist	dist/blueprint-back`, run 17:0x in the repo)
- [ ] 6. **Linux only** — `PORT=4293 HOST=127.0.0.1 DATABASE_URL=<Postgres TEST URL> ./dist/blueprint-back`, then `curl -s -w '\n%{http_code}' http://127.0.0.1:4293/v1/projects` → JSON list + `200` (a route that reads the DB — `src/http/routes/projects.ts:30`). Never print the URL. **This box has no Linux and no TEST URL** (SPEC-127 § Linux / AC-4) ⇒ write `UNVERIFIED — the binary was not run on Linux; no Postgres TEST URL on this box` and stop there (base: n/a — new) — AC-4
- [ ] 7. **Linux only**, same run as 6 — upload one small PDF as a project source through the binary (the route and body the tests use: `git grep -n "sources" test/ | head`) → 2xx and the source's text is listed. Not runnable ⇒ `UNVERIFIED — same reason as 6` (base: n/a — new) — SPEC-127 D3 file parsers
- [ ] 8. `DATABASE_URL=pglite:memory bun test > test.out 2>&1` (run in the background; after 10 min with no new line, stop **its own pid** — `Get-CimInstance Win32_Process -Filter "Name='bun.exe'"`, the one whose CommandLine is `bun.exe test`) → `grep '^(fail)' test.out` gives **the same 14 names as the base**, nothing new; paste both lists (base: on this Windows box 0 `(pass)`, 14 `(fail)` in `test\db\chatbot-schema.test.ts`, `rules.test.ts`, `theme.test.ts`, `test\gateway\client.test.ts` — 10 of them `error: Can't find meta/_journal.json` = SPEC-127 R5 — then no output for 17 min, stopped by pid 27444 at 17:24; scratch clone 08e1e4d, log kept in the SA's scratch: the 14 names are `a project that existed before 0004 reads model tier:medium…`, `creativity outside 0–2 is refused…`, `the same file (same sha256) cannot be added twice…`, `AC-11 base: a version row cannot be updated or deleted`, `a link cannot touch a removed part`, `removing a linked part fails at commit…`, `AC-12 base: a project without an organisation…`, `a link to a part that does not exist is rejected`, `AC-2 base: a Thai title round-trips byte-identical`, `a confirmed version cannot be truncated`, `AC-B4: a project that existed before the theme column…`, `the database itself refuses an empty theme…`, `chat OK; the request carries tier or provider+model…`, `AC-10 (client): every kind of failure is retried once…`). The full suite's green state is **UNVERIFIED on Windows** (R5) — AC-5
- [ ] 9. `DATABASE_URL=pglite:memory PORT=4294 bun run dev` → the **same as the base**: on this Windows box it exits at start with `error: Can't find meta/_journal.json file` (at `src/db/client.ts:18`), curl `000`. Pre-existing on Windows, not this TASK's to fix — paste the output and do not change `client.ts` (base: exactly that error — scratch clone 08e1e4d, 17:08; SPEC-127 R5) — AC-5 "dev as before"
- [ ] 10. After: `git status --short` → exactly ` M .gitignore`, ` M package.json` — no `dist/`, no `bun.lock` (base: n/a — new) — AC-5
- [ ] 11. `git diff` pasted whole (two files, 2 lines added).
- [ ] One line at the end of Implementation Notes: artifact `dist/blueprint-back` · server start `./blueprint-back` with `PORT`, `HOST`, `DATABASE_URL` (Postgres) from env.

## Implementation Notes
Jason, 2026-10-31 17:2x–17:4x. Repo `blueprint-back` (owner's checkout, `nichaphon` 08e1e4d). Edited with the editor tool: `package.json` (+1 `build` script line after `dev`), `.gitignore` (+`*.zip`). No git writes, no `.env`, no app code.

- DoD 1: `git status --short` → empty (0 lines) before editing.
- DoD 2: `bun install --no-save` → `227 packages installed [4.95s]`; status then = ` M .gitignore`, ` M package.json` only (my edits were already made; no `bun.lock`).
- DoD 3: `bun run build` → exit 0; last line `[403ms] compile  dist/blueprint-back bun-linux-x64-v1.3.14` (1098 modules, 98,977,920 bytes).
- DoD 4: `file dist/blueprint-back` → `ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=a9a0d18db4f98a86ad4778800c5fa46943f81b2e, not stripped`.
- DoD 5: `git check-ignore -v dist/blueprint-back` → `.gitignore:92:dist	dist/blueprint-back`, exit 0.
- DoD 6: `UNVERIFIED — the binary was not run on Linux; no Postgres TEST URL on this box`.
- DoD 7: `UNVERIFIED — same reason as 6`.
- DoD 8: `DATABASE_URL=pglite:memory bun test > test.out`; no new output for 600 s after 229 lines, stopped its own pid 28532 (`bun.exe test`; the other bun.exe, pid 20932, was not mine and left alone). 0 `(pass)`, 14 `(fail)`, **the same 14 names as the base, nothing new**:
  a project that existed before 0004 reads model tier:medium… · creativity outside 0–2 is refused… · the same file (same sha256) cannot be added twice… · AC-11 base: a version row cannot be updated or deleted · a link cannot touch a removed part · removing a linked part fails at commit… · AC-12 base: a project without an organisation… · a link to a part that does not exist is rejected · AC-2 base: a Thai title round-trips byte-identical · a confirmed version cannot be truncated · AC-B4: a project that existed before the theme column… · the database itself refuses an empty theme… · chat OK; the request carries tier or provider+model… · AC-10 (client): every kind of failure is retried once…
  Full suite green state stays `UNVERIFIED on Windows` (R5). Log: `tests/harness/task-173-bun-test.out`.
- DoD 9: `DATABASE_URL=pglite:memory PORT=4294 bun run dev` → `error: Can't find meta/_journal.json file … at createDb (src\db\client.ts:18:11)`, exit 1; curl → `000`. Same as the base; `client.ts` untouched.
- DoD 10: `git status --short` → ` M .gitignore`, ` M package.json` (the test log was moved out of the repo into `tests/harness/`; `dist/` ignored; no `bun.lock`).
- DoD 11: `git diff` → `.gitignore` `+*.zip` after `/data/`; `package.json` `+    "build": "bun build src/index.ts --compile --minify --target=bun-linux-x64 --outfile dist/blueprint-back",` after `dev`. Two files, 2 lines added.

Artifact `dist/blueprint-back` · server start `./blueprint-back` with `PORT`, `HOST`, `DATABASE_URL` (Postgres) from env.

## Questions

## Review

**DONE** — Sober (SA, Team A), 2026-10-31 17:39. Reviewed against SPEC-127 § D2/D3 and the evidence above; the decisive checks re-run by me, read-only, in the owner's checkout (`nichaphon` 08e1e4d):
- Diff: `git diff --stat` → `.gitignore | 1 +`, `package.json | 1 +` — exactly the closed list, the `build` line byte-for-byte as specified, `*.zip` appended; `.gitignore` keeps CRLF, `package.json` unchanged in kind. `git status --short --untracked-files=all` → only those two; no `bun.lock`, no `dist/`, no test log in the repo.
- Build: `bun run build` → exit 0, `compile  dist/blueprint-back bun-linux-x64-v1.3.14`; `file` → `ELF 64-bit LSB executable, x86-64` (AC-3 met on this box).
- Ignores: `git check-ignore -v dist/blueprint-back` → `.gitignore:92:dist`, exit 0; `x.zip` → `.gitignore:115:*.zip`.
- Tests: `diff` of the sorted `(fail)` names, my base log vs `tests/harness/task-173-bun-test.out` → identical, 14 = 14, nothing new (AC-5 "as before" on Windows; the suite's green state stays UNVERIFIED on Windows — SPEC-127 R5, PM 17:2x).
- DoD 6–7 (AC-4, Linux run on a DB route + one upload): `UNVERIFIED — no Linux, no Postgres TEST URL on this box`, accepted by the PM (SPEC-127 Q3 answer, DECISIONS 17:2x); settles on the owner's first server run. DoD 9 dev = base error, `client.ts` untouched — correct.
- No app code, no git writes, no `.env`. `/security-review` not needed: no auth, input or data-exposure change.
- **Addendum 18:07 (Sober), after the owner placed `.env` (SYSTEM-FACTS 18:0x; PM inbox 18:0x):** DoD 6–7's substance re-tried as SA probe P6 (SPEC-127 § Probes) on a **Windows-target** compile of this tree with the owner's `.env`: `GET /v1/projects` 200 · new project 201 · `rooms.pdf` upload 201 `status: "read"` · its text read back 200. So the compiled code paths (Postgres, PGlite import, `unpdf`) work. **The Linux binary itself stays UNVERIFIED** — there is no Linux on this box; AC-4 settles on the owner's first server run (PM 17:2x). Verdict unchanged: DONE.
