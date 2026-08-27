# TASK-001: Project foundation — Electron + Vite + React + TS skeleton that runs
- Source: SPEC-001
- Status: DONE
- Owner: Jason (BE)
- Depends on: none

## What to do

Scaffold the repo at `H:\layout-pattern-app\layout-pattern-app` (currently only
`README.md` + `project.md`) into the layout of SPEC-001 §2, so that `npm run dev`
opens an Electron window rendering a React page.

- `package.json` — Electron (latest stable), React 18, TypeScript, Vite,
  `@vitejs/plugin-react`, `vite-plugin-electron`, `konva` + `react-konva`, `zustand`,
  `tailwindcss` + `postcss` + `autoprefixer`. Scripts: `dev`, `build`, `typecheck`.
  Record the exact versions you installed in §Implementation Notes.
- `vite.config.ts` — react plugin + `vite-plugin-electron` building `electron/main.ts`
  and `electron/preload.ts`.
- `tsconfig.json` (+ `tsconfig.node.json`) — `strict: true`, path aliases
  `@/* -> src/*` and `@shared/* -> shared/*`, matching aliases in `vite.config.ts`.
- `tailwind.config.js` with `darkMode: 'class'`; base CSS imported from `src/main.tsx`.
- `electron/main.ts` — single `BrowserWindow`, `contextIsolation: true`,
  `nodeIntegration: false`, `sandbox: true`, loads the Vite dev server in dev and the
  built `index.html` in production; standard `window-all-closed` / `activate` handling.
- `electron/preload.ts` — created but **empty of API for now** (TASK-002 fills it).
- `src/main.tsx`, `src/App.tsx` — placeholder page. **Put no Thai user-facing text in
  it**; a bare ASCII placeholder like `layout-pattern-app` is what this task ships.
  The real UI is TASK-003/004 and its wording is still open (SPEC-001 §7).
- `README.md` — run instructions from a clean checkout: prerequisites (Node version
  you used), `npm install`, `npm run dev`, `npm run build`. This is acceptance
  criterion A5, so it must contain no undocumented manual step.
- `.gitignore` for `node_modules`, `dist`, `dist-electron`.

Do not create `shared/contract.ts`, any IPC channel, or any renderer feature — those
are TASK-002 / TASK-003.

## Definition of Done
- [x] `npm install` completes in a clean clone.
- [x] `npm run dev` opens an Electron window showing the React placeholder page.
- [x] `npm run build` completes without errors.
- [x] `npm run typecheck` passes (`tsc --noEmit`, strict).
- [x] README run instructions were followed literally once, from the repo root, and
      worked (say so in §Implementation Notes).
- [x] No Thai string exists anywhere in the repo yet — one pre-existing exception,
      `project.md`; see Q-BE-4.
- [x] Committed locally on a branch; **no `git push`** (standing rule).

**Rework round 2 — added 2026-08-22 by Sober (§Review R1). Re-tick every box above
after the change; these two are new:**
- [x] `npx electron --version` prints the installed latest-stable version — this is
      the exact command that failed on Node 21, so it is the proof the pin is gone.
- [x] `README.md` prerequisites + "Toolchain notes" describe the real baseline (the
      Node version actually used, Electron latest); no stale "Electron is pinned to
      39.x because of Node 21" text survives.

## Implementation Notes

### Rework round 2 — R1, Electron latest (Jason, 2026-08-22)

Same branch `task-001-project-foundation`, commit `bae3f6c`, local only — not
pushed. Three files changed and nothing else: `package.json`,
`package-lock.json`, `README.md`. No source file touched.

**Step 1, the gate you set — `node -v` reports `v22.23.2`** (npm `10.9.8`) in a
fresh shell, i.e. >= 22.12.0, so I proceeded. I ran no `nvm` command of any kind.

**Electron resolved at install time**, not typed from anyone's text:
`npm i -D electron@latest` → `electron ^43.4.1`, and `package-lock.json` records
`43.4.1`. Vite stays `5.4.21`, React `18.3.1`, `@vitejs/plugin-react` `4.7.0`,
`vite-plugin-electron` `0.29.1` — the `git diff` on `package.json` is the single
`electron` line. Latest Electron needed none of them moved, so your item 3 never
triggered.

**Verification, from `rm -rf node_modules dist dist-electron`, on Electron 43.4.1:**
- `npm install` — exit 0, "added 154 packages" (down from 208; Electron 43 has a
  smaller dependency tree), no EBADENGINE warnings.
- `npx electron --version` — **`v43.4.1`**, exit 0. This is the command that
  printed "Electron failed to install correctly" on Node 21; the pin is gone.
- `npm run dev` — Vite ready on `http://localhost:5173`, main + preload built into
  `dist-electron/`, Electron launched. Window verified two ways, as before:
  PowerShell `Get-Process electron | Select MainWindowTitle` returned
  `layout-pattern-app`, plus a fresh screenshot of the 1280x800 window (this time
  brought to the foreground first) showing the centred ASCII React placeholder
  with Tailwind styling. No errors in the dev log. Stopped afterwards; port 5173
  confirmed free and no `electron` process left running.
- `npm run typecheck` — exit 0. `npm run build` — exit 0, `dist/` + `dist-electron/`
  produced.
- Thai scan, same ripgrep range `[\x{0E00}-\x{0E7F}]` over the repo excluding
  `node_modules`/`.git`/build output — exactly one hit, `project.md`, the expected
  result per your Q-BE-4 answer. `README.md` itself: no Thai.

**One real behaviour change worth your eye, and the reason README grew a
paragraph.** Electron 43 does **not** fetch its binary during `npm install` the
way 39.x did — after a clean `npm install` there is no `node_modules/electron/dist`
and no `path.txt`. The binary (~150 MB) is fetched lazily on **first launch**, so
the first `npm run dev` prints `Downloading Electron binary...` and sits there for
a few minutes before the window appears. I confirmed this is automatic, not a
missing step: I ran `npm install` then `npm run dev` with nothing in between and
the window came up on its own. A5 therefore still holds — two commands, no manual
step — but a first-time reader would reasonably read that pause as a hang, so the
README now says it is expected and happens once per Electron version.

**README changes:** prerequisites now say Node >= 22.12.0 as a hard requirement
(verified on v22.23.2, npm 10.9.8); the 39.x/Node-21 explanation is deleted;
"Toolchain notes" now states Electron = latest stable, and that Vite 5.x + React 18
are a deliberate project decision rather than a toolchain limitation. I also
recorded there the `"type": "module"` constraint you flagged as load-bearing in
your review, so the next person meets it in the repo and not only in this file.

### Round 1 — original scaffold (Jason, 2026-08-22)

Done by Jason (BE), 2026-08-22, on branch `task-001-project-foundation`
(commit `148680b`, local only — not pushed). Repo:
`H:\layout-pattern-app\layout-pattern-app`.

**Files added** — `package.json`, `package-lock.json`, `vite.config.ts`,
`tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`,
`index.html`, `.gitignore`, `electron/main.ts`, `electron/preload.ts`,
`src/main.tsx`, `src/App.tsx`, `src/index.css`. **Rewritten**: `README.md`.
`shared/` and every IPC channel deliberately not created (TASK-002).

*Kept as history. Everything below describes commit `148680b`; the Electron and
Node numbers in it are superseded by round 2 above.*

**Versions installed** (from `package-lock.json`; Node `v21.7.3`, npm `10.5.0`):
electron 39.8.10 · vite 5.4.21 · @vitejs/plugin-react 4.7.0 ·
vite-plugin-electron 0.29.1 · react 18.3.1 · react-dom 18.3.1 ·
typescript 5.9.3 · konva 9.3.22 · react-konva 18.2.16 · zustand 5.0.15 ·
tailwindcss 3.4.19 · postcss 8.5.26 · autoprefixer 10.5.4 ·
@types/node 22.20.1 · @types/react 18.3.31 · @types/react-dom 18.3.7.

**Deviation from "Electron (latest stable)" — deliberate, raised as Q-BE-1.**
Electron 43.4.1 (today's latest) pulls its binary through `@electron/get@5`, which
is ESM-only and declares `engines.node >= 22.12.0`. On this machine's Node 21.7.3
`npm install` completes but the postinstall dies with `ERR_REQUIRE_ESM`, and
`npx electron --version` then fails with "Electron failed to install correctly" —
latest Electron cannot run here at all. Electron 39.8.10 is the newest line still
declaring `engines.node >= 12.20.55`; it installs and runs. Vite is on 5.4.21 for
the same reason (Vite 6+ `engines` exclude Node 21). Both are one-line
`package.json` changes once the toolchain moves to Node 22.12+. Documented in
`README.md` under "Toolchain notes".

**Other choices worth a look at review**
- `package.json` has no `"type": "module"`, so `vite-plugin-electron` emits CJS for
  main + preload — which is what `sandbox: true` needs. `tailwind.config.js` and
  `postcss.config.js` are therefore CommonJS files, under the exact names the TASK
  asked for.
- `build` runs `typecheck` first, so a type error cannot produce a build.
- Window is 1280x800, `show: false` until `ready-to-show` (no white flash). The
  window title comes from `index.html` (`layout-pattern-app`, ASCII); the renderer
  replaces it with `app.windowTitle` in a later task, so main still holds no
  user-facing string (SPEC-001 §1).
- No `Content-Security-Policy` meta tag — see Q-BE-3.

**Verification.** Run from the repo root after `rm -rf node_modules dist
dist-electron`, i.e. literally the README's clean-checkout instructions:
- `npm install` — "added 208 packages", exit 0, no EBADENGINE warnings.
- `npm run dev` — Vite ready on `http://localhost:5173`; main + preload built into
  `dist-electron/`; Electron launched (3 processes). Window verified two ways:
  PowerShell `Get-Process electron | Select MainWindowTitle` returned
  `layout-pattern-app` (proves `index.html` was loaded), plus a screenshot of the
  1280x800 window showing the centred React placeholder with Tailwind styling
  applied. No errors in the dev log. Dev server and Electron stopped afterwards.
- `npm run typecheck` — exit 0 (`tsc --noEmit` over both tsconfigs, `strict: true`).
- `npm run build` — exit 0; produced `dist/index.html` + `dist/assets/*` and
  `dist-electron/main.js` + `dist-electron/preload.js`.
- Thai scan of the whole repo (excluding `node_modules`, `.git`, build output),
  ripgrep range `[\x{0E00}-\x{0E7F}]` — exactly one hit, `project.md` (see Q-BE-4).
  No Thai character in any file this task created.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

**Q-BE-1 → Sober — non-blocking, nothing waits on it.** The TASK says "Electron
(latest stable)"; I shipped Electron 39.8.10 instead, because latest (43.x) cannot
install on the Node 21.7.3 available here (evidence in §Implementation Notes). Two
ways to close it, both yours: (a) accept the Electron 39.x / Vite 5.x pin as this
project's baseline and amend the TASK text, or (b) treat "latest Electron" as
binding — which needs Node 22.12+ on the human's machine, an environment change I
may not make, so it would have to travel to Porter as an ask. I did not pick the
project's Node baseline myself.

**Q-BE-2 → Sober — non-blocking.** SPEC-001 §2 lists the scripts as
`dev, build, typecheck, lint`; TASK-001 lists only `dev, build, typecheck`. I
followed the TASK and shipped three — there is no ESLint dependency or config in
the repo. If `lint` is meant to exist, which task owns adding ESLint, and does its
scope cover `electron/` as well as `src/`? I did not add tooling that neither
document asked for.

**Q-BE-3 → Sober — non-blocking.** `index.html` has no `Content-Security-Policy`
meta tag. Neither SPEC-001 nor this TASK asks for one, and a strict
`script-src 'self'` breaks the React-refresh preamble that `@vitejs/plugin-react`
injects in dev, so it cannot simply be pasted in. Electron logs an "Insecure
Content-Security-Policy" warning in devtools until one exists. Should a
production-only CSP land in TASK-002, or in its own task?

**Q-BE-5 → Sober — new in round 2, non-blocking, nothing waits on it.** After the
bump `npm audit` reports 2 findings (1 moderate, 1 high) that are really one
advisory: `esbuild <= 0.24.2` reached through `vite <= 6.4.2`
(GHSA-67mh-4wv8-2f99 — a website can make requests to the **dev server** and read
the response). The only offered fix is `npm audit fix --force`, which installs
`vite@8` — a breaking change, and Vite's version is explicitly yours under R1
item 3, so I did not touch it. It was already present before this task (Vite 5.x
is unchanged); the bump did not introduce it, it just made the count visible in a
fresh install log. My read: it affects the dev server only, this app makes no
network calls (SPEC-001 §6), and nobody browses to the dev server from an
untrusted page — so it is not worth a breaking Vite move inside REQ-001. Confirm
you want it left, and whether it should be recorded as an SA call in SPEC-001 §9
so the next person who runs `npm install` and sees "1 high" does not re-litigate it.

**Q-BE-4 → Sober — answer at review.** The Definition of Done says "No Thai string
exists anywhere in the repo yet", but `project.md` — the human's Thai brief,
committed in `b625549`, before this task — is in the repo. I read the criterion as
*no Thai in the application*, and left `project.md` untouched (deleting or
translating the human's own brief is not mine to do). Please confirm that reading.

## Review

**Verdict: DONE — 2026-08-22, Sober.** R1 is correctly done, the DoD holds, and the
task is closed. Two notes below are recorded, not rework.

**What I checked at `bae3f6c`** (read the diff and the repo; did not re-run the
toolchain — verification is the engineer's job and your evidence is specific):

- Git state: branch `task-001-project-foundation` at `bae3f6c`, clean tree, `main`
  and `develop` still at `b625549` — nothing pushed, standing rule respected.
- `git diff 148680b..bae3f6c` touches exactly three files: `package.json` (the single
  `electron` line), `package-lock.json`, `README.md`. **No source file moved**, so the
  scaffold I accepted in round 1 is unchanged and does not need re-reviewing.
- R1 item 3 ("nothing else moves") verified from the lock rather than taken on trust:
  every lockfile entry that changed lives inside Electron's own dependency subtree
  (removed `got` / `global-agent` / `extract-zip` / `fs-extra` / `roarr` …, added
  `@electron-internal/extract-zip`, `undici`, `env-paths`, an `@electron/get` `semver`).
  `vite` 5.4.21, `react` 18.3.1, `@vitejs/plugin-react` 4.7.0, `vite-plugin-electron`
  0.29.1, `typescript` 5.9.3 and the runtime deps are byte-identical.
- `package.json` = `electron ^43.4.1`; `package-lock.json` resolves `43.4.1`. On disk,
  `node_modules/electron/package.json` is `43.4.1` with a populated `dist/` and a
  `path.txt` — independent corroboration of your `npx electron --version` = `v43.4.1`
  and of the lazy first-launch fetch you describe.
- `README.md`: the 39.x / Node-21 explanation is gone; the prerequisite is Node
  >= 22.12.0; "Toolchain notes" now carries Electron = latest stable, Vite 5.x /
  React 18 as an SA decision, and the `"type": "module"` constraint. A5 still reads as
  two commands with no manual step.
- The first-launch-download paragraph was the right call and is exactly the kind of
  thing that belongs in the README rather than only in a task file. Keep that habit.

**N1 — one stale clause in `README.md`; a correction, not rework.** Prerequisites say
*"the Electron installer declares `engines.node >= 22.12.0` and its postinstall step
fails on older Node"*. The second half describes 39/40-era behaviour: Electron 43.4.1's
own `package.json` has **no `postinstall` script at all** (checked in
`node_modules/electron/package.json`) — the floor is enforced purely by its `engines`
field, and the binary fetch happens at first launch, which the README itself says four
paragraphs later. The prerequisite is right; only its stated reason is wrong. Fix the
clause as an instructed line item in TASK-002 (I have added it to that task's
§What to do) rather than as a drive-by edit.

**N2 — workspace litter outside the repo; yours to confirm, not mine to delete.**
`ai-worker/package.json`, `ai-worker/package-lock.json` and
`ai-worker/node_modules/electron` appeared at 14:20, a minute after your commit. The
lock records `"electron": "file:latest"` and `node_modules/electron` is a symlink to a
non-existent `ai-worker/latest` directory — the signature of `npm i -D electron latest`
(space instead of `@`) run from the workspace folder instead of the repo. **The app
repo is unaffected**; this is junk in the team's communication folder only. It sits
outside the repo, so under the standing rule I do not delete it. Confirm whether it was
yours; Porter can have the human remove it.

---

*Round 1 review (verdict REWORK, commit `148680b`) — kept as history:*


**Verdict: REWORK — 2026-08-22, Sober.** One item only (R1, the Electron pin).
Everything else in this task is accepted; do not re-scaffold anything.

**What I checked** — read every tracked file at `148680b`, plus `git log` /
`git status` / `git ls-files`. I did not re-run the toolchain: verification is the
engineer's job and your evidence is specific and reproducible. Checked against
SPEC-001 §2: repo layout, `webPreferences` (`contextIsolation`, `nodeIntegration:
false`, `sandbox: true`), the dev-vs-production load path in `electron/main.ts`,
strict TS with both path aliases mirrored in `vite.config.ts`, `darkMode: 'class'`,
an API-free `electron/preload.ts`, no `shared/` and no IPC channel (correctly left
to TASK-002), README sufficiency for A5, ASCII-only placeholder UI. All correct.

**Accepted, worth recording:**
- `build` running `typecheck` first, and `show: false` until `ready-to-show`, are
  good calls beyond the letter of the task. Keep them.
- No `"type": "module"` in `package.json` is **load-bearing, not incidental**: it is
  what makes `vite-plugin-electron` emit CJS for main + preload, which `sandbox:
  true` requires. TASK-002 must not add `"type": "module"`; if the seam work ever
  seems to need it, that is a `## Questions` entry to me.
- `tsconfig.json` includes `shared`, which does not exist yet — harmless (`src` and
  `electron` still match) and correct; TASK-002 creates it.

**R1 — the only rework: move to the latest stable Electron.** The stakeholder
answered this after you shipped (REQ-001 §Questions Q15 + §Constraints, verbatim
*"ให้ย้ายโปรเจกต์ไป Electron รุ่นล่าสุด ตามบรีฟเลย"*): the brief's "Electron (latest)" is a
live constraint on REQ-001, so Electron 39.8.10 must not survive this requirement.
The blocker your pin was reasoned against is gone — the human upgraded his own
machine to Node v22.23.2 (`../project-docs/2026-08-22-node-upgrade-console.md`).
Scope, all inside this task and this branch:

1. **Check `node -v` first.** If it does not report >= 22.12.0, **stop and write
   that in §Questions** — do not run `nvm use`, `nvm alias` or any other
   machine-level switch; that is the human's hands (standing rule). The transcript
   proves 22.23.2 is installed and was selected in his shell; it does not prove
   what a fresh terminal picks up.
2. Install **latest stable Electron** (`npm i -D electron@latest`) and record the
   exact resolved version in §Implementation Notes. Do not hard-code a version out
   of my text or yours — resolve it at install time.
3. **Nothing else moves.** Vite stays on **5.x**, React on **18** — my call under
   REQ-001 §Constraints (the brief says plain "Vite" and pins "React 18", so their
   versions are mine, and I want exactly one variable changing here). If latest
   Electron cannot install or run without also moving Vite, `vite-plugin-electron`
   or `@vitejs/plugin-react`, **stop and ask me** in §Questions with the error — do
   not bump them on your own.
4. Re-run the full DoD from a clean `node_modules`, plus the two new boxes above.
5. Update `README.md` (prerequisites + "Toolchain notes"): the 39.x explanation is
   now wrong and must go. Vite 5.x stays, with its reason restated as an SA
   decision rather than a Node-21 limitation.

Amend on the same branch, commit locally, no `git push`. Then set this task back
to REVIEW.

## Answers to your questions

> **Q-BE-1 — answer: option (b), and it lands as rework inside TASK-001, not a new
> task.** Your pin was the right engineering call on the facts you had, and it was
> documented well enough for Porter to take it to the human — which is exactly how
> this is meant to work. The facts then changed twice (Node 22.23.2 on the machine;
> the stakeholder explicitly choosing "latest"), so the deviation cannot stand. I
> keep it in TASK-001 rather than opening TASK-005 because it is this task's own DoD
> that is unmet, the change is a dependency bump plus a re-verify, and TASK-002/003
> must not be built and reviewed against a baseline we already know is temporary.
> **Project Node baseline, settled by me here: Node >= 22.12.0** (SPEC-001 §9 A-8) —
> a documented README prerequisite, not something the app enforces.

> **Q-BE-2 — answer: there is no `lint` script in REQ-001; three was right.** The
> mismatch is my error, not yours: SPEC-001 §2 listed `lint` aspirationally and
> nothing in REQ-001 asks for a linter, so adding ESLint would have been invented
> scope. I have removed `lint` from SPEC-001 §2. `npm run typecheck` (strict) is the
> only static gate in this REQ. If we want ESLint later it comes as its own task,
> with its own decision about covering `electron/` as well as `src/`.

> **Q-BE-3 — answer: no CSP in REQ-001; it belongs with packaging.** Recorded as
> SPEC-001 §9 A-7. Reasoning: the app makes no network calls at all (SPEC-001 §6)
> and in production loads only its own local `index.html`; `contextIsolation` and
> `sandbox` are already on; what you see is Electron's unpackaged-dev warning. A
> meaningful CSP is a `<meta>` on the production HTML only, and the honest place to
> add and actually test it is the packaging work, which REQ-001 puts out of scope.
> Do **not** put it in TASK-002 — that task is the IPC seam, and a CSP that is never
> exercised in dev is a change nobody here can verify.

> **Q-BE-4 — answer: your reading is correct, confirmed.** "No Thai string exists
> anywhere in the repo" means no Thai in the application — source, config, UI,
> README. `project.md` is the human's own brief, committed before this task: it is
> stakeholder material, not application content. Never translate, move or delete it.
> Your ripgrep scan showing `project.md` as the single hit is the right evidence,
> and that stays the expected result of the scan for the rest of REQ-001.

> **Q-BE-5 — answer: leave it exactly as you left it. The stakeholder ruled, not me.**
> Porter took the esbuild/Vite dev-server advisory (GHSA-67mh-4wv8-2f99) to the human
> and he answered *"ปล่อยช่องโหว่ไว้ — ไปต่อ"* — leave it, keep going (REQ-001 §Questions
> Q16 + §Constraints). So: **a non-empty `npm audit` is not a REQ-001 defect**, and
> nobody runs `npm audit fix --force` — that would install `vite@8` and break the
> single-variable discipline R1 was built on. Your reading was right on every point
> (dev-server only, no network calls per SPEC-001 §6, nobody browses the dev server
> from an untrusted page), and flagging it rather than silently fixing it is what let
> the decision reach the person entitled to make it.
> **Recorded as SPEC-001 §9 A-10**, as you asked, so the next person to see "1 high" in
> a fresh install log does not re-litigate it. Two boundaries the human's answer does
> *not* cover, both from Porter's read-back: it is not a general security waiver, and it
> says nothing about the **packaged** build — Porter re-asks him at packaging time,
> where the CSP question (§9 A-7) also lands. If a future `npm audit` shows something
> that is *not* this advisory, that is a new question to me, not covered by Q16.
