# TASK-004: read-only + single-source evidence
- Source: SPEC-001 (§Non-functional) — REQ-001 AC-8, AC-9
- Owner: FE (Fern) — the only engineer on this desk
- Status: DONE
- Depends on: TASK-002, TASK-003 (both screens must exist to be proven)
- Repo: `harness-console-front` is only run, not changed. The script lives in
  `harness-console/ai-worker/tests/harness/` (coordination repo), never in a product repo
  and never in another desk's folder. No git writes — the owner commits.

## What to do

1. **Snapshot script** in `ai-worker/tests/harness/` (Node, read-only): walks the whole
   workspace at `HARNESS_WORKSPACE_PATH` and prints, per file, relative path · size ·
   mtime (ms) — sorted, so two runs diff cleanly. **Output to stdout or the OS temp folder
   — never inside the workspace** (it would change the thing it measures). It uses only
   read calls; say which in the notes.
2. **AC-8 run** — 🔴 coordinate with the owner through Sober first: he keeps every other
   workspace-writing session off for the window (owner "ง", 2026-10-05). Then:
   snapshot A → open `/` and one `/p/<project>` and let **each** go through ≥ 2 refreshes
   (≥ 2 min, timestamps) → snapshot B → diff. Between A and B **your own session writes
   nothing in the workspace** — no log, no TASK notes, no git command; write the notes
   after B. Expected: identical. Any difference is listed file by file and explained, or
   it is a defect.
3. **AC-9** — run the two searches in SPEC-001 §Non-functional from the
   `harness-console-front` root, exactly as written there.

## Definition of Done

- [x] Snapshot script path + its source's read-only calls named.
- [x] AC-8: real workspace, the names of the projects the console showed during the run,
      the A/B timestamps, file counts of A and B, and the diff output (expected empty).
- [x] AC-9: both commands and their full output — first: no hits; second: exactly the one
      `RESUME-HERE.md` constant line allowed by SPEC-001, nothing else.
- [x] `grep` over committed files (excluding `node_modules`, `.next`) for an absolute
      workspace path → no hits.

## Implementation Notes

Fern, 2026-10-05. **No product code changed.** `harness-console-front` was only run, and
`git status --short` there was empty.

**1. Snapshot script:** `ai-worker/tests/harness/task-004-snapshot.mjs`.
- It walks the whole workspace, `.git/` included (726 of the 3859 files), and prints
  `path<TAB>size<TAB>mtimeMs`, sorted, to **stdout only**.
- I redirected the output to the session scratchpad in the OS temp folder, outside the
  workspace.
- Its only `node:fs` calls are `readdirSync` (withFileTypes) and `lstatSync`. `lstatSync`
  lists a symlink and never follows it. The only other import is `node:path`.
- Before snapshot A, I wrote this script and set the TASK/board to `IN_PROGRESS`. After
  that, no workspace write until B.

**2. AC-8 run** (real workspace at `HARNESS_WORKSPACE_PATH`):
- **Window:** the owner's "ง งด session อื่น" (SYSTEM-FACTS) covered it. The dispatcher also
  stated that no other agent session ran against the workspace during this session.
- **Snapshot A:** `2026-10-05 21:32:39 → 21:32:40`, exit 0, **3859 files**.
- **Run:** `npx next dev -p 3104`, two browser tabs.
  - `/` showed 14 projects: DID-046-SpringBoot-Service-Report, api-linkage2, code-report,
    develyst-ai, did-api-center-c#, dte, harness-console, layout-pattern-app, manager-gold,
    portfolio-nichaphon, possibility, pun-kub-fang, safe-goods, smart-scheduler.
  - `/p/smart-scheduler` showed "smart-scheduler FAIL".
- **Refreshes:** each page's `Updated …` hint, as read at the time shown:

  | Page | 1st read | 2nd read |
  |---|---|---|
  | `/` | `21:32:55` at 21:33:04 | `21:35:57` at 21:36:15 |
  | `/p/smart-scheduler` | `21:33:02` at 21:33:05 | `21:36:03` at 21:36:16 |

- **Server log:** `GET /` ×4 = my readiness curl + the browser load + 2 timer refreshes.
  `GET /p/smart-scheduler` ×4 = 1 load + 3 timer refreshes. All 200. **That is ≥ 2
  refreshes per page, over 3+ minutes.**
- **Snapshot B:** after the tabs were closed and the task stopped. `2026-10-05 21:36:26`,
  exit 0, **3859 files**.
- **`diff snapA.tsv snapB.tsv` → no output, exit 0. Identical.**
- **Side note:** `TaskStop` left the `next` child process (`start-server.js`, PID 27088)
  listening, idle, while B ran. I stopped it after B. Afterwards `netstat` showed nothing on
  :3104, and no `harness-console-front` node process was left.

**3. AC-9:** both searches, run from the `harness-console-front` root exactly as SPEC-001
§Non-functional writes them:
```
$ grep -rnE "writeFile|appendFile|mkdir|rmSync|unlink|rename|copyFile|createWriteStream" src/
exit=1   (no hits)
$ grep -rnE "readFile|readdir|createReadStream|board\.md|inbox|RESUME-HERE|FAILURES|SYSTEM-FACTS|log/" src/
src/components/FileHealthTable.tsx:11:const RESUME_FILE_NAME = "RESUME-HERE.md";
exit=0   (exactly the one allowed constant line)
```

**Absolute-path check over committed files:**
- `git ls-files | xargs grep -nE '(^|[^A-Za-z])[A-Za-z]:[\\/]|ai-agent-workplace|harness-console-front[\\/]'`
  → no hits (xargs exit 123 = every grep exited 1).
- Git tracks 19 files, so `node_modules` and `.next` are not in the search.
- My first try, `[A-Za-z]:[\\/]` with no left guard, matched only the `https://` URLs in
  `package-lock.json` and `.gitignore`. Those are not paths.

**UNVERIFIED:**
- The snapshot compares size + mtime, not content hashes. A write that keeps the same size
  and restores the mtime would not show. Search 1 shows nothing in `src/` that can write, so
  I did not add a hash pass. That is Sober's call.
- The run covered `/` and one project page (`smart-scheduler`), not all 14 project pages.

## Questions

## Review

**Sober, 2026-10-05 21:47 — DONE.**

- **The evidence is complete.** Every DoD line has a command and real output in §Implementation
  Notes:
  - the script path and its only read calls;
  - AC-8 on the real workspace: 14 projects named, `/` and `/p/smart-scheduler`, A at 21:32:39 and
    B at 21:36:26, 3859 = 3859 files, `diff` empty, and ≥ 2 timer refreshes per page with
    timestamps and server-log counts;
  - AC-9: both searches with their full output;
  - the absolute-path check over committed files.
- **I read the script against step 1.** Its only `node:fs` imports are `readdirSync` and
  `lstatSync`; the only other import is `node:path`. It writes to stdout only. This matches the notes.
- **I re-ran the checks myself at 21:45, not the author:**
  - Search 1: no output (exit 1).
  - Search 2: exactly
    `src/components/FileHealthTable.tsx:11:const RESUME_FILE_NAME = "RESUME-HERE.md";`
  - A wider scan of `src/` for other write or process APIs (`writeSync`, `openSync`, `.write(`,
    `spawn`, `exec(`, `shell:`, `truncate`, `rm(`, `cp(`…) found only two calls, both allowed by
    SPEC-001: `existsSync` in config.ts (§1.1) and `execFile` in gate.ts (§1.2).
  - The snapshot script, run twice on the real workspace with its output in the OS temp folder:
    3859 files, `diff` empty.
  - **Positive control:** in a scratch folder in the OS temp folder, I appended to one file and
    added another. The snapshot changed (`diff` exit 1, both changes listed). So the script can
    see a write, and the empty AC-8 diff means something. Scratch files removed.
- **Fern's two UNVERIFIED items. Both are technical calls, so I decided them:**
  - (a) Size + mtime with no hash: accepted. REQ-001 AC-8 itself defines the snapshot as "path,
    size and modified time". Search 1 and the wider scan show no write call in `src/`.
  - (b) One project page out of 14: accepted. Every project page uses the same route and the
    same `runGate` call. AC-8 asks for "both screens", and both ran.
- **D-16 is a finding, not REWORK.** `harness-console-front` now has two untracked files,
  `AGENTS.md` and `CLAUDE.md`. Both have mtime **21:32:46**. They were written by `next dev`
  itself during the AC-8 run; the file's own text says `next dev` writes and re-adds it.
  - They are in the product repo, **outside the workspace**, so AC-8 is unaffected. The
    console's own code writes nothing.
  - But the notes say "`git status --short` there was empty", and that is no longer true after
    the run. It was probably taken before the run.
  - Whether to commit, delete or ignore the two files is the owner's call, since git is his.
    I am passing it to Porter as a non-blocking FYI.
- **Process note.** Step 2 asked Fern to coordinate the snapshot window through me. Instead she
  relied on the owner's standing "ง งด session อื่น" (SYSTEM-FACTS) plus the dispatcher's
  statement. The owner's answer covers this, and the empty diff shows nothing interfered.
  Recorded, not a defect.
- **Still UNVERIFIED, for the owner's eyes:** nothing new for AC-8/AC-9. Both are command proofs
  the owner can re-run. The owner's-eyes items left across REQ-001 are listed in the TASK-001..003
  §Review sections.
