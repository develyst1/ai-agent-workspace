# TASK-175: caw-back — `build` compiles the API to one Linux binary; prove it (REQ-128)
- Source: SPEC-128 D2, D3
- Owner: BE (Bob)
- Status: DONE (2026-10-31 18:53, Silver; § Review — was REVIEW, Bob)
- Depends on: none — base `8271082` on **`nichaphon`**, the owner's checkout on his Windows box (`machine.local.md` → `caw-back`; DECISIONS 2026-10-31 18:4x). **Not `atom`.** No git (the owner's word only).

## What to do

Build configuration only — no file under `src/` or `test/`, no README change.

1. `bun install --no-save` if `node_modules` is missing. **Never a plain `bun install`** — it rewrites `bun.lock` (SPEC-128 § Lockfile).
2. `package.json` `scripts`: add, after `"api": …`, the line
   `"build": "bun build src/index.ts --compile --minify --target=bun-linux-x64 --outfile dist/caw-back",`
   The entry is `src/index.ts` (it calls `Bun.serve`, `:19`) — **not** `src/dev.ts`, and **not** the runner (SPEC-128 D3, Q1: the runner is not compiled in this TASK).
3. `.gitignore`: add one line, `*.zip`, at the end. `dist` is already ignored (`:92`).
4. Every `bun` command below runs as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT …` unless the line says otherwise. A plain `bun run dev` or `bun run runner` here starts **real** Claude CLI workers (SYSTEM-FACTS 12:54) — don't run either one.

Closed file list: `package.json` · `.gitignore`. Anything else changed ⇒ stop and ask in `## Questions`.

Artifact line for your Implementation Notes: artifact `dist/caw-back` (the API only). On the server it starts with `./caw-back`, with `PORT`, `HOST`, `DATABASE_URL` (Postgres), `BLUEPRINT_URL` and `CAW_POLL_MS` from the environment / `.env` in its working directory. **The runner is not in it.** It still runs from source with `bun run runner` (SPEC-128 Q1 default).

## Definition of Done
Run every command in the owner's `caw-back` checkout. Paste the real output. Never print a `DATABASE_URL`.

- [ ] 1. Before: `git status --short --untracked-files=all` → empty (base: empty, run 2026-10-31 18:47 after the SA restored `bun.lock`)
- [ ] 2. `git diff -- package.json .gitignore` → exactly the one added `build` line and the one `*.zip` line (base: n/a — new)
- [ ] 3. `bun run build` → exit 0, output has `compile … bun-linux-x64` (base: `error: Script not found "build"`, run 18:47)
- [ ] 4. `file dist/caw-back` → `ELF 64-bit LSB executable, x86-64` (REQ-128 AC-3) (base: n/a — no build script; SA scratch probe P1: `ELF 64-bit LSB executable, x86-64, … GNU/Linux 3.2.0`)
- [ ] 5. `git check-ignore -v dist/caw-back` → `.gitignore:92:dist	dist/caw-back` (base: the same, run 18:47)
- [ ] 6. **Partial AC-4 (Windows target, as SPEC-127 P6):** `bun build src/index.ts --compile --minify --outfile <your scratch>/caw-back.exe` (no `--target`; output **outside** the repo). Then from a scratch folder holding a **copy** of the owner's `caw-back/.env` (copy it with `cp`, never `cat` it), run it with `PORT=<free> HOST=127.0.0.1 CAW_POLL_MS=0`. `curl` `/health` → `200`, and `GET /v1/projects` with header `X-CAW-Actor: sa` (the value the SA probe used) → `200` with a `projects` array. Read routes only, write nothing to the TEST DB. Stop it **by pid** from the port. Delete the `.env` copy and show `Test-Path` → `False` (base: n/a — new; SA probe P2: `/health` 200, `/v1/projects` 200)
- [ ] 7. **AC-4 on Linux:** `PORT=<free> ./dist/caw-back` on Linux with a Postgres `DATABASE_URL`, `curl /v1/projects` → 200 (base: n/a — no Linux on this box). Expected: `UNVERIFIED — no Linux here; settles on the owner's first server run` (accepted in advance, REQ-128 AC-4)
- [ ] 8. `bunx tsc --noEmit -p .` → exit 0 (base: exit 0, run 18:45)
- [ ] 9. `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file test` → **`280 pass`, `151 fail`**, `432 tests across 76 files` — the same as the base. The 151 are pre-existing Windows failures (SPEC-128 R5), not yours. Any other number ⇒ write it in Notes and stop (base: 280 pass / 151 fail / 432 tests / 76 files, run 18:45)
- [ ] 10. After: `git status --short --untracked-files=all` → exactly ` M .gitignore`, ` M package.json` — no `bun.lock`, no `dist/` (base: empty)

## Implementation Notes
**Bob, 2026-10-31 ~18:50–19:00.** Owner's `caw-back` checkout (`machine.local.md`), branch `nichaphon`, HEAD `8271082`. No git write, no file outside `package.json` + `.gitignore`, `node_modules` already present (no install run, `bun.lock` untouched).

**Changed:** `package.json` — one `build` line after `api`; `.gitignore` — one `*.zip` line at the end. Both files are CRLF; I matched that with a script that asserts exactly one anchor match (a plain edit tool would have mixed line endings).

**Artifact:** `dist/caw-back` (the API only; 95,955,072 B). On the server it starts with `./caw-back`, with `PORT`, `HOST`, `DATABASE_URL` (Postgres), `BLUEPRINT_URL`, `CAW_POLL_MS` from the environment / `.env` in its working directory. The runner is not in it; it still runs from source with `bun run runner`.

**DoD (real output):**
1. Before, `git status --short --untracked-files=all` → empty. Branch `nichaphon`, `git rev-parse --short HEAD` → `8271082`.
2. `git diff -- package.json .gitignore` → `+.gitignore: *.zip` (after `.tern-port`) and `+package.json: "build": "bun build src/index.ts --compile --minify --target=bun-linux-x64 --outfile dist/caw-back",` after the `"api"` line. Nothing else.
3. `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun run build` → exit 0:
   `$ bun build src/index.ts --compile --minify --target=bun-linux-x64 --outfile dist/caw-back` · `[19ms] bundle 300 modules` · `[469ms] compile dist/caw-back bun-linux-x64-v1.3.14`
4. `file dist/caw-back` → `ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=a9a0d18db4f98a86ad4778800c5fa46943f81b2e, not stripped`
5. `git check-ignore -v dist/caw-back` → `.gitignore:92:dist	dist/caw-back`
6. Windows target: `bun build src/index.ts --compile --minify --outfile <scratch>\caw-back.exe` (no `--target`, scratch outside the repo; `[22ms] bundle 300 modules`, exe 99,842,560 B). Run from a scratch folder holding an `cp`-style copy of the owner's `.env` (never printed; I listed only its key names to check for danger — it has `CLAUDE_BIN`, `CAW_WORKSPACE_ROOT`, `RUNNER_*`), with `PORT=51633 HOST=127.0.0.1 CAW_POLL_MS=0`. **Deviation, safety only:** I also set `CLAUDE_BIN=NOT-A-REAL-BINARY` in the process env so the `.env` value could not be used; `src/index.ts` never starts a worker, so nothing depended on it. Output: `caw-back API on http://127.0.0.1:51633` · `[pull] blueprint_unreachable` (Blueprint not running here — expected). `curl /health` → `200`. `curl -H "X-CAW-Actor: sa" /v1/projects` → `HTTP 200`, body `{"projects":[{"id":…,"name":…,"mode":"manual",…` (a `projects` array; first project's text not copied here). Read routes only, no write. Stopped by pid from the port (`Get-NetTCPConnection -LocalPort 51633` → pid 28800 → `Stop-Process`), `still listening: False`. `.env` copy deleted, `Test-Path` → `False`.
7. **UNVERIFIED — no Linux here; settles on the owner's first server run** (accepted in advance, REQ-128 AC-4). What the Windows run in 6 does and does not show: the same source compiled and served on Windows; it does not show the Linux binary running.
8. `bunx tsc --noEmit -p .` → exit 0.
9. `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file test` → `280 pass` · `1 skip` · `151 fail` · `42 errors` · `921 expect() calls` · `Ran 432 tests across 76 files. [45.32s]`. Pass / fail / tests / files equal the base. The TASK's base did not state the skip (1) and error (42) counts, so I cannot say they equal it — **I did not run the suite on the base to compare**; they come from the same pre-existing Windows failures I expect but have not proved. SA to judge.
10. After, `git status --short --untracked-files=all` → ` M .gitignore` · ` M package.json`. No `bun.lock`, no `dist/` (ignored).

**Not covered by this TASK (seen, left):** the compiled binary carries no files read from disk at runtime. I did not audit `src/` for `readFileSync`/migrations/`.wasm` (a `src/` read was outside the closed list's spirit; SPEC-128 owns that call). The Windows run served `/v1/projects` from the owner's `.env` database, so whatever the DB needs at runtime was present there — that is not proof for a server with a fresh Postgres. **UNVERIFIED — a first start on a Linux box with an empty Postgres settles it.**

Self-review against role-be §3: scope = two files; no contract change; no secret printed; no error path touched, so `silent-failure-hunter` and `/security-review` are not triggered.

## Questions

## Review

**DONE — 2026-10-31 18:53, Silver.** The work meets SPEC-128 D2 and REQ-128 AC-3, AC-4 (partial, as accepted) and AC-5 (back).
- Scope: re-run by me on the owner's tree (`nichaphon`, HEAD 8271082). `git status --short --untracked-files=all` → ` M .gitignore`, ` M package.json`, which is exactly the closed list. The diff is exactly `+*.zip` and the `build` line.
- Re-run: `bun run build` → `compile dist/caw-back bun-linux-x64-v1.3.14`; `file dist/caw-back` → `ELF 64-bit LSB executable, x86-64` (AC-3); status after the build is unchanged (`dist/` is ignored).
- Your point 1 (skip/errors): my base run of 18:45 (SA scratch `req128/base-back.out`) printed **`280 pass · 1 skip · 151 fail · 42 errors · 432 tests / 76 files`**. My re-run now prints the same five numbers, so they are equal to the base. The TASK's base line left out skip/errors, and that omission is mine. AC-5 holds on this box (R5: the Windows failures were there before this change).
- Your point 2 (runtime-read files): that audit is the SA's, and it is in SPEC-128 D3. The API binary reads only the migrations folder from disk, and only on the `pglite:*` path. A fresh Postgres is migrated by the operator from source (`bun run db:migrate`), which is deployment side. The runner is not in this binary (Q1, accepted). So a first start against an **empty** Postgres needs the operator's migrate first. That is the SPEC's statement, not a gap in this TASK.
- DoD 6: setting `CLAUDE_BIN=NOT-A-REAL-BINARY` was a safe, sensible deviation. Accepted.
- DoD 7 / AC-4 on Linux: `UNVERIFIED`, accepted in advance (REQ-128 AC-4).
- Tree fingerprint for QA / git: `tree-fp H:/ispace/caw-back HEAD 8271082 fp adeeea17e327` (256 paths, 0 untracked), 18:53.
