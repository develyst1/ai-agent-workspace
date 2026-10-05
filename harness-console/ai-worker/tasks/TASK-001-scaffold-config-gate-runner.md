# TASK-001: scaffold + config + AC-7 + gate runner + refresh shell
- Source: SPEC-001 (§1.1, §1.2, §1.3, §2.1–2.3) — REQ-001 AC-5 (shell), AC-7
- Owner: FE (Fern) — the only engineer on this desk
- Status: DONE (Sober review 2026-10-05 21:07 — see §Review)
- Depends on: none (gate v6 `--json` exists — checked by Sober 2026-10-05 00:52)
- Repo: `harness-console-front`, branch `main`. Path: workspace-root `machine.local.md`. No git writes — the owner commits.

## What to do

1. **Scaffold** Next.js 16 + React 19 + antd v6, App Router, TypeScript — the house
   pattern (`nextjs-antd-pattern` skill). Nothing beyond what this TASK needs.
2. **Config** (SPEC §1.1): read `HARNESS_WORKSPACE_PATH` at request time; valid only if
   set, non-empty, folder exists, `<path>/check-hygiene.mjs` exists. Invalid → the page
   shows exactly `Workspace path not found — check HARNESS_WORKSPACE_PATH in .env.local`
   and runs no gate. Commit-ready `.env.example` = `HARNESS_WORKSPACE_PATH=` (no value).
3. **Gate runner** (SPEC §1.2): `listProjects()` and `runGate(project)` with the exact
   `ListRun` / `GateRun` / `RunError` types and the check order written there.
   `execFile` only; 15 s timeout; parse stdout even when `execFile` rejects on exit 1/2;
   decide on the JSON `ok`, never the exit code; ≤ 4 runs in parallel; no retry, cache
   or fallback. Type `GateJson` with **only** the fields in SPEC §2.3.
4. **Pages shell** (SPEC §1.3): `/` with title `Workspace`; `/p/[project]` that calls
   `notFound()` for a name not in `listProjects()`. Both `force-dynamic`. The refresh
   component: `router.refresh()` every 60 000 ms + `Updated <HH:MM:SS> · refreshes every 60 s`.
   **No cards, no sections yet** — they are TASK-002/003, waiting on REQ-001 Q-6..Q-8.
   Show no other visible text: any string not in REQ-001's wording table is a question
   to Sober, not something to invent.

🔴 The console writes **nothing** in the workspace and reads **no** coordination file —
only the two `existsSync` checks and the gate's stdout. 🔴 No absolute path in any
committed file.

## Definition of Done

- [ ] `npm run build` succeeds — output pasted.
- [ ] `HARNESS_WORKSPACE_PATH` unset, set to a missing folder, and set to an existing
      folder with no `check-hygiene.mjs` (e.g. the front repo itself): each shows the
      AC-7 text and no gate runs — evidence for all three.
- [ ] Valid path: `/` shows `Workspace` and the refresh hint; the hint's time changes
      after ~60 s with no click (two timestamps in the notes).
- [ ] Runner, against the real workspace: `listProjects()` returns the same list as
      `node check-hygiene.mjs --list --json` (paste both); `runGate` returns `ok: true`
      for one PASS and one FAIL desk (name them) with `data.result` matching the CLI.
- [ ] Runner error kinds, each shown once with real output: `gate` (unknown project
      name → `NO_AI_WORKER`), `timeout`, `not-json`, `schema`, `spawn`. Fixture scripts
      for the last four go in `harness-console/ai-worker/tests/harness/` — **never inside
      a project folder of the workspace**, never as a change to `check-hygiene.mjs`.
- [ ] `/p/does-not-exist` → 404; `/p/<a real project>` → 200 (status codes pasted).
- [ ] The two searches in SPEC-001 §Non-functional → no hits (commands + output).
- [ ] `grep -rn "H:\\\\" --include=* .` over committed files (excluding `node_modules`,
      `.next`) → no absolute path.

## Implementation Notes

(Fern fills this in: what changed, how it was verified, real output. Anything not
actually run is written `UNVERIFIED — <what would settle it>`. Any rule you had to
decide yourself — write it here with why.)

**Fern, 2026-10-05 08:14.** Nothing committed (owner commits). No server/background process left running.

### What changed (`harness-console-front`, all new, untracked)

- `package.json` (exact pins from the house lockset: next 16.2.9, react/react-dom 19.2.7,
  antd 6.4.3, @ant-design/nextjs-registry 1.3.0, typescript 6.0.3; + @types/node 22.20.5,
  @types/react 19.3.0), `package-lock.json`, `tsconfig.json` (`@/*` → `src/*`), `.env.example`
  (`HARNESS_WORKSPACE_PATH=`, no value). `.env.local` created (git-ignored, value from
  `machine.local.md`, owner "ข ได้"). `npm install` run (owner "ค ได้"): 91 packages; `npm ls react` → single 19.2.7.
- `src/lib/config.ts` — `getWorkspacePath()`: env read per request, two `existsSync` calls, no default.
- `src/lib/gate.ts` — `RunError`/`ListRun`/`GateRun` exact SPEC casing; `GateJson` = only §2.3 fields;
  `listProjects()`, `runGate(project)`, `runGates(projects)` (≤4 at a time, order kept), `reasonOf()` (§1.4 table).
  `execFile(process.execPath, …, {cwd, timeout 15000, windowsHide, maxBuffer 8 MB})`; check order exactly §1.2; exit code never read.
- `src/lib/text.ts` — the only user-facing strings (AC-7 text, `Could not list projects — <reason>`) + `hhmmss()`.
- `src/components/RefreshHint.tsx` — `router.refresh()` every 60 000 ms + `Updated <HH:MM:SS> · refreshes every 60 s`.
- `src/components/Title.tsx` — client re-export of `Typography.Title` (see decisions).
- `src/app/layout.tsx` (AntdRegistry + ConfigProvider), `src/app/page.tsx` (`/`), `src/app/p/[project]/page.tsx`. Both pages `force-dynamic`.

### Evidence (real output)

1. `npm run build` → `▲ Next.js 16.2.9 (Turbopack) · ✓ Compiled successfully in 6.4s · Finished TypeScript in 2.3s`;
   routes `ƒ /`, `○ /_not-found`, `ƒ /p/[project]`.
2. AC-7, `next start -H 127.0.0.1 -p 3100`, `.env.local` moved aside for the run, env set per case
   (body grepped for the AC-7 text / `>Workspace</h2>` / `Updated …`):
   ```
   [unset]   /  -> 200 :: Workspace path not found — check HARNESS_WORKSPACE_PATH in .env.local   (/p/harness-console same)
   [missing] /  -> 200 :: same text  (HARNESS_WORKSPACE_PATH=<non-existent folder>)                (/p/harness-console same)
   [nogate]  /  -> 200 :: same text  (HARNESS_WORKSPACE_PATH=<harness-console-front root>)         (/p/harness-console same)
   ```
   No title, no refresh hint, server log empty in all three. "No gate runs": in all three there is no
   `check-hygiene.mjs` to run, and both pages return before calling the runner (code path, not a process trace).
3. Valid path, `/`: page text `Workspace` / `Updated 08:11:28 · refreshes every 60 s`; after 65 s with no click
   (Browser pane, `get_page_text`): `Updated 08:12:28 · refreshes every 60 s`.
4. Runner vs CLI — harness `harness-console/ai-worker/tests/harness/task-001-runner.mjs` imports the real
   `src/lib/gate.ts` (Node type-stripping + a resolve hook for `@/` and `server-only`):
   ```
   listProjects() [real] {"ok":true,"projects":["DID-046-SpringBoot-Service-Report","api-linkage2","code-report","develyst-ai","did-api-center-c#","dte","harness-console","layout-pattern-app","manager-gold","portfolio-nichaphon","possibility","pun-kub-fang","safe-goods","smart-scheduler"],...}
   node check-hygiene.mjs --list --json → "projects": [same 14, same order]
   runGate(harness-console) {"ok":true,...,"data":{"result":"PASS","checks":0}}   CLI: ok true, PASS, 0 checks, exit 0
   runGate(smart-scheduler) {"ok":true,...,"data":{"result":"FAIL","checks":22}}  CLI: ok true, FAIL, 22 checks, exit 1
   ```
5. Error kinds (fixtures in a `mkdtemp` folder under the OS temp dir, removed at the end — nothing in the workspace):
   ```
   gate      runGate(no-such-project) [real] {"kind":"gate","code":"NO_AI_WORKER","message":"no ai-worker at <ws>\\no-such-project\\ai-worker"}  (CLI exit 2, same error)
   timeout   fake gate sleeps 30 s → (15.0 s) {"kind":"timeout"}
   not-json  fake gate prints `RESULT: PASS` → {"kind":"not-json"}
   schema    fake gate prints {schema:2,ok:true} → {"kind":"schema","schema":2}
   spawn     process.execPath set to a non-existent exe → {"kind":"spawn","message":"spawn <tmp>\\no-such-node.exe ENOENT"}
   reasonOf: gate=<message> · timeout=no answer after 15 s · not-json=output was not JSON · schema=gate version not supported · spawn=could not start the gate
   ```
6. Routes (`curl -w '%{http_code}'`): `/` 200 · `/p/smart-scheduler` 200 · `/p/harness-console` 200 ·
   `/p/did-api-center-c%23` 200 · `/p/does-not-exist` 404.
7. SPEC §Non-functional searches, from the repo root: both `grep -rnE "writeFile|…|createWriteStream" src/` and
   `grep -rnE "readFile|…|log/" src/` → no output, exit 1. (The `RESUME-HERE.md` constant arrives in TASK-003, not here.)
8. Absolute path: `git ls-files -co --exclude-standard | xargs grep -nF 'H:\'` → no output (exit 123 = no match);
   `grep -rnF 'H:\' --exclude-dir=node_modules --exclude-dir=.next .` → one hit only, `./.env.local` (git-ignored, allowed). Harness file: no hit.

### Decisions I made (not in the SPEC) — Sober to confirm or overrule

- **D-1 Dependencies:** only what this TASK needs from the house lockset — react-query, next-auth, axios,
  tailwind, dayjs, lucide-react left out (TASK step 1: "Nothing beyond what this TASK needs").
- **D-2 AC-7 page** shows only the AC-7 text (antd `Alert`): no `Workspace` title, no refresh hint.
  **Project page (TASK-001)** shows only the refresh hint. No `<title>` metadata (no approved string).
- **D-3 Runner signatures** match SPEC exactly (no workspace argument): `run()` reads `getWorkspacePath()`
  itself and throws if invalid — unreachable, the pages check AC-7 first. Added `runGates()` for the ≤4 cap.
- **D-4 `spawn` = any execFile error with a string `code`** (ENOENT etc.). This also catches `maxBuffer`
  overflow (> 8 MB stdout; largest desk today ~83 KB) — it would show `could not start the gate`.
- **D-5 URL segment:** Next 16 hands `[project]` over still percent-encoded (`did-api-center-c%23` was 404
  before decoding, 200 after) → `decodeURIComponent`, malformed escape → `notFound()`. `/p/%E0` returns 500
  from Next itself before the page runs (no log line) — not ours, not chased.
- **D-6 `Typography.Title` is `undefined` across antd's client boundary in a server page** (first `/` render
  was a 500 "Element type is invalid") → tiny client re-export `src/components/Title.tsx`.

### UNVERIFIED

- The owner's eyes on the running page (styling/layout) — settled by him opening `/` locally.
- That no gate process starts on an AC-7 page is shown by the code path, not by a process trace.

### Re-verification, Fern 2026-10-05 20:28 (the 08:14 session was cut off before it logged or told Sober)

Every DoD item above was re-run in this session against the files on disk, unchanged. No code was edited.
`npm run build` ✓ (same 3 routes) · the AC-7 cases unset / missing / nogate: `/` and `/p/*` → 200 + the AC-7 text, including `/p/does-not-exist`
(config is checked before the list) · valid: `/` 200 `Workspace` + hint, `/p/harness-console` · `/p/smart-scheduler` · `/p/did-api-center-c%23` 200,
`/p/does-not-exist` 404 · the refresh in the Browser pane with no click: `Updated 20:26:58` → `Updated 20:27:59` · harness: same 14 projects
as `--list --json`, harness-console PASS/0, smart-scheduler FAIL/22 (CLI: `FAIL 22`), the five error kinds identical to item 5 · both §Non-functional
searches exit 1 · the absolute-path check exit 123 · `.env.local` and `next-env.d.ts` git-ignored (`git check-ignore -v`). After the run: no node process, port 3100 closed.

## Questions

- **Q-F1 (Fern → Sober, 2026-10-05, non-blocking for review):** `npm audit` on the house-lockset pin
  `next 16.2.9` reports **critical** advisories, among them *"Unauthenticated Remote Code Execution on
  windows-hosted servers"* (GHSA-p293-qw3h-jr36) and others; audit says the fix is `next@16.3.8` (also pulls
  newer postcss/sharp). This app runs on Windows. I kept the pin (a version bump is a stack decision, not
  mine) and ran every test bound to `127.0.0.1` only. Bump to 16.3.8 — yes/no?
  > answer (Sober, 2026-10-05 21:07): **YES — pin `next` to exactly `16.3.8`.** Technical, mine: the
  > decided stack is "Next.js 16" and 16.3.8 is Next.js 16, so the stack is not re-opened; `npm install`
  > of Next.js 16 is already owner-approved ("ค ได้"). Re-checked by me: `npm audit --omit=dev` on the
  > current lock → `next 9.3.4-canary.0 - 16.3.5 Severity: critical` (incl. GHSA-p293-qw3h-jr36, Windows
  > RCE) + `postcss <=8.5.22 Severity: high`, fix "Will install next@16.3.8"; `npm view next@16.3.8
  > version` → `16.3.8`. Done as **TASK-002 step 0** (not a reopen — TASK-001 met its SPEC). Keep
  > binding `127.0.0.1` for every local run until then.

## Review

**Sober, 2026-10-05 21:07 — DONE.** Checked against SPEC-001 §1.1–§1.4, §2.3 and every DoD item.

- **Evidence present for every DoD item**, real output, run twice (08:14 and the 20:28
  re-verification): build · three AC-7 cases · 60 s refresh with two timestamps · runner = CLI
  (14 projects; harness-console PASS/0, smart-scheduler FAIL/22) · all five error kinds · 404/200 ·
  both §Non-functional searches · absolute-path check.
- **Code read against the SPEC** (`src/lib/config.ts`, `gate.ts`, `text.ts`, both pages): `execFile`
  with `process.execPath`, 15 s, `windowsHide`, 8 MB; check order timeout → spawn → parse → schema →
  `ok` exactly as §1.2; exit code never read; `RunError`/`ListRun`/`GateRun`/`GateJson` casing matches;
  `reasonOf` = §1.4 table; only the two `existsSync` calls; no default path; `force-dynamic` on both.
- **Re-ran myself (read-only, front repo root):** both §Non-functional greps → exit 1; the
  committed-files `H:\` search → exit 123; harness script → no absolute path.
- **Fern's decisions D-1..D-6 — all confirmed.** D-4: a > 8 MB stdout shows `could not start the gate`
  — accepted (largest desk ~83 KB); revisit only if a desk nears it. D-5 (`decodeURIComponent`,
  malformed → 404) is right: names contain `#`.
- **Not verified by anyone:** the owner's eyes on the page; "no gate runs on an AC-7 page" is a code
  path, not a process trace (both already under §UNVERIFIED). `DONE` is not the owner's acceptance.
- Q-F1 answered above — the bump is TASK-002 step 0.
