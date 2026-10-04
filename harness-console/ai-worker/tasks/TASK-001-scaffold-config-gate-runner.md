# TASK-001: scaffold + config + AC-7 + gate runner + refresh shell
- Source: SPEC-001 (§1.1, §1.2, §1.3, §2.1–2.3) — REQ-001 AC-5 (shell), AC-7
- Owner: FE (Fern) — the only engineer on this desk
- Status: TODO
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

## Questions

## Review

(Sober fills this in at REVIEW.)
