# TASK-002: Folder-pattern skeleton + `FRONTEND-CONVENTIONS.md` + the no-emoji harness
- Source: SPEC-001 (Target folder structure · "The no-emoji check")
- Owner: FE (Fern)
- Status: **DONE** — reviewed 2026-09-07 by Sober (was REVIEW; verdict + what I re-ran myself in §Review)
- Depends on: TASK-001 — ✅ **`DONE` 2026-09-07 (Sober)**, so this dependency is satisfied and this
  task may start. Next 16.2.9 + Tailwind 4.3.0 are already in the working tree.

> **Library-independent on purpose.** No component library is installed here and no screen is
> redesigned. Ant Design lands in TASK-003. If you find yourself importing `antd` in this task,
> stop — you are in the wrong task.

## What to do

Three separate deliverables, in this order. All of them are in `front/` except (C), which is in
the coordination repo. `back/` is not touched.

### A — Land the skeleton of the house folder pattern, and move only the safe components

**A1. Create the folders the pattern mandates** (SPEC-001 §Target folder structure). Empty
directories do not survive git, so each new folder gets a real `index.ts` barrel — an empty
barrel is fine (`export {};`) where nothing has moved into it yet:

```
front/src/components/layout/      front/src/components/common/
front/src/components/partials/    front/src/hooks/common/
front/src/lib/api/                front/src/types/api/   front/src/types/app/
```

Do **not** create `context/` or `constant/` — SPEC-001 §Target folder structure records the
deliberate, stated deviation: the existing `contexts/` and `constants/` keep their names.
Do **not** restructure `components/ui/*.tsx` into `<Name>/<Name>.tsx` folders — the SPEC puts
that per screen, and those five files are imported by 8 pages.

**A2. Move exactly six components, and fix their imports.** These are the only moves in this
task, because they are the only ones whose importers are countable (verified read-only
2026-09-07 — if `grep` shows you a different set, **stop and report the difference**, do not
adapt silently):

| File today | Moves to | Importers to fix |
|---|---|---|
| `components/Navbar.tsx` | `components/layout/Navbar.tsx` | `app/layout.tsx:5` |
| `components/Footer.tsx` | `components/layout/Footer.tsx` | `app/layout.tsx:6` |
| `components/SearchAI.tsx` | `components/common/SearchAI.tsx` | `app/page.tsx:11` |
| `components/AIChat.tsx` | `components/common/AIChat.tsx` | none found |
| `components/ThemeToggle.tsx` | `components/common/ThemeToggle.tsx` | `components/layout/Navbar.tsx:6` (relative `./ThemeToggle` → `@/components/common/ThemeToggle`) |
| `components/AnimatedSearchPlaceholder.tsx` | `components/common/AnimatedSearchPlaceholder.tsx` | `components/common/SearchAI.tsx:6` (relative import, stays relative and still resolves) |

- Move with `git mv` so history is preserved. **You do not commit** — the human owns git.
- Add each moved file to its folder's `index.ts` barrel, and use the barrel in the new imports
  (`import { Navbar } from "@/components/layout"`) **only if** the component's export style
  allows it without changing the component: `Navbar`/`Footer`/`SearchAI` are default exports
  today. If re-exporting forces you to edit the component's own export, **don't** — keep the
  direct path import and say so in §Implementation Notes. A barrel is not worth a semantic edit
  in this task.
- `AIChat.tsx` has **no importer at all** in `front/src`. Move it anyway (it is live code the
  owner may wire up later) and record the fact in §Implementation Notes — do not delete it.

**A3. Nothing else moves.** `services/api.ts` stays one file. `lib/mockData.ts` stays.
`constants/portfolio.ts` and `constants/services.ts` are REQ-003's and are not touched here.

### B — `front/FRONTEND-CONVENTIONS.md`

A short document Fern-after-Fern can follow without re-deriving it. It is a *description of the
decisions already made in SPEC-001*, not a place to make new ones. Required sections, each one
short:

1. **Folder structure** — the tree from SPEC-001 §Target folder structure, plus the two stated
   deviations (`contexts/` not `context/`, `constants/` not `constant/`) and why.
2. **Component library** — Ant Design v6 is the chosen library (owner-approved 2026-09-07,
   `SYSTEM-FACTS.md` A15). State the division of labour verbatim from SPEC-001 §Decision 3:
   **library** = interactive/stateful components (Form, Table, Modal, Upload, Select, DatePicker,
   Steps, Tabs, message/notification); **Tailwind** = page layout, grid, spacing, marketing
   surfaces, and anything the library does not have. Note that it is not installed yet — TASK-003.
3. **Theming** — `src/styles/themes.css` is the single palette of record; the library's theme is
   fed from it, never a second palette. `contexts/ThemeContext.tsx` stays; no `next-themes`.
4. **Icons** — `lucide-react` is the one icon set. `@heroicons/react` is legacy and is retired
   per screen; it leaves `package.json` only when the last import is gone.
5. **No emoji** — the standing standard (REQ-001 requirement 3), with the exact command to run
   the checker from (C) and what its output means.
6. **What this project deliberately does NOT take from the house pattern** — NextAuth 4 and
   TanStack React Query are not adopted; DTE's own `AuthContext` and `services/api.ts` stand.
7. **Two Tailwind-4 cascade traps — added 2026-09-07 by Sober out of the TASK-001 review.** Both
   are real, both are silent, both were paid for once already; write them down so nobody pays again
   (evidence lives in `tasks/TASK-001-…md` §Step 2b/2c and §Review — point at it, do not retell it):
   - **The `accent` plugin/theme collision still exists and is benign only by coincidence.**
     `tailwind.config.ts` defines `accent` in `theme.extend.colors` *and* `.text-accent` in its JS
     plugin. Tailwind 4 emits only one of them, and the winner is the opposite of Tailwind 3's.
     It is harmless **today** solely because both sides resolve to `var(--color-primary)`. Rule:
     **never change one side without the other**, and never re-add a `theme.extend.colors` key whose
     name a plugin utility already defines.
   - **`themes.css` is imported twice on purpose — do not "clean up" the duplicate.** `globals.css`
     imports it at the top and `app/layout.tsx` imports it again, unlayered and last. That second
     import is what keeps `themes.css` beating Tailwind's utility layer. Deleting it changes the
     cascade on every page. Related: any unlayered element-selector rule added to `globals.css`
     beats **every** Tailwind utility regardless of specificity — new global rules go inside
     `@layer base { … }`.
   Cite SPEC-001 §Decision 4 rather than re-arguing it.

Keep it under ~120 lines. If you feel a decision is missing, that is a `## Questions` entry for
Sober, **not** a decision you make in this document.

### C — The no-emoji checker

Write **`ai-worker/tests/harness/check-no-emoji.mjs`** in the **coordination repo** (this repo),
not in `front/`. PROTOCOL.md: throwaway verification scripts live here; the product repo is the
owner's to keep clean. Create `ai-worker/tests/harness/` — it does not exist yet.

Behaviour, exactly:

- Takes a path as `argv[2]` (a directory or a single file). Scans `.ts`/`.tsx`/`.js`/`.jsx`
  recursively; skips `node_modules` and `.next`.
- Flags these code points (SPEC-001's stated scope): `U+1F000–U+1FAFF`, `U+2600–U+27BF`,
  `U+2B00–U+2BFF`, and `U+FE0F`. Also flags the text glyphs `→ ← ✓ ✕` — SPEC-001 counts those
  as icon usage by another name.
- Prints one line per hit: `path:line:col  <char>  U+XXXX`.
- Exits **1** if there is any hit; exits **0** and prints `OK — 0 emoji in <n> files scanned`
  if there are none.
- No dependencies — plain Node/`bun` ESM, `node:fs` only. It must run with `node` on a checkout
  that has never had `npm install` run in it.

Then run it against `front/src` and paste the **real output** into §Implementation Notes as the
recorded baseline. SPEC-001's read-only estimate was **15 files, ~160 occurrences** — if your
run disagrees, the script's number is the truth and the SPEC's estimate was wrong; say so, do
not tune the script to match the estimate.

**Zero across `front/src` is NOT an exit condition for this task** (SPEC-001 says so: four of
the offending pages are deleted by REQ-003 and `/about`'s copy has not arrived). This task
delivers the *checker and the baseline*, not a clean tree.

## Definition of Done

- [ ] `cd front && npm run build` succeeds after the moves — paste the real command and output.
- [ ] `npx tsc --noEmit` (in `front/`) reports no new errors — paste the output. If it already
      errored before your change, paste the before too, and say which errors pre-existed.
- [ ] `grep -rn "@/components/\(Navbar\|Footer\|SearchAI\|AIChat\|ThemeToggle\|AnimatedSearchPlaceholder\)" front/src`
      returns **nothing** — i.e. no import still points at the old flat path. Paste the output.
- [ ] `npm run dev` starts and `/` renders with the Navbar, Footer and the SearchAI box present,
      in **both** light and dark. Say what you actually saw. Anything you could not open is
      `UNVERIFIED — <what would settle it>`.
- [ ] `front/FRONTEND-CONVENTIONS.md` exists with all **seven** sections of (B) — section 7 (the two
      Tailwind-4 cascade traps) included.
- [ ] `node ai-worker/tests/harness/check-no-emoji.mjs <path-to>/front/src` runs and its real
      output is pasted, with the file/occurrence counts stated as the baseline.
- [ ] `node ai-worker/tests/harness/check-no-emoji.mjs` on a directory you know is clean exits 0
      and prints the OK line — prove the zero case too, not only the failing case.
- [ ] `git status` shows only intended files (6 moves, the import fixes, the new barrels, the
      conventions doc, the harness script). No stray `.bak`, no `node_modules` noise.

## Blast radius

- **`front/` layout and home page.** `app/layout.tsx` imports Navbar + Footer, so a broken move
  breaks **every route at once**. That is the whole risk of this task and the reason the DoD
  checks `/` in a browser rather than trusting the build.
- **Everything else in `front/`** — unaffected in principle: the other 8 pages import from
  `components/ui/*`, which this task does not move.
- **`back/` — zero.** No file touched, no contract changed.
- **Production — zero, by this task.** Nothing is deployed by an agent. `dte.develyst.online`
  runs `develop`'s tip (`SYSTEM-FACTS.md` A4), so it is the owner's merge that puts this in
  front of users, not this task.
- **Worst realistic failure:** a moved component resolves at build time but the barrel changes
  the default-vs-named export shape, and a page renders blank at runtime. Build success does not
  catch that — the browser walk-through does.

## Rollback

`git checkout -- front/ && git clean -fd front/src/components front/src/hooks front/src/lib front/src/types`
(the human runs it), plus deleting `ai-worker/tests/harness/`. Nothing is committed by an agent
and no dependency is added or removed in this task, so `node_modules` is untouched and there is
no reinstall step.

## Implementation Notes

**Done 2026-09-07 by Fern.** Everything local. `back/` untouched, production never contacted,
no git commit (`git mv` only stages; the human owns every commit).

### Starting state — read, not assumed

The working tree was **clean** and TASK-001's upgrade is **already committed**, on branch `D1`
as `d466ba4 "adawdawda"`. `front/package.json` reads `next 16.2.9` · `react 19.2.7` ·
`tailwindcss 4.3.0`. So TASK-001 §Questions Q1 (`D1` vs `develop`) is no longer about
uncommitted files — the human has committed them to `D1`. Still his call, still not mine.

Baseline before touching anything: `npx tsc --noEmit` → **exit 0, no output**. So there are no
pre-existing type errors to separate from mine.

### A — skeleton and the six moves

Folders created, each with a real barrel (`export {};` where nothing has landed yet):
`components/layout/` · `components/common/` · `components/partials/` · `hooks/common/` ·
`lib/api/` · `types/api/` · `types/app/`. No `context/`, no `constant/` (the stated deviation).
`components/ui/*.tsx` left flat, as instructed.

**The importer set matched the TASK's table exactly** — verified before moving, not after:

```
$ grep -rn "components/\(Navbar\|Footer\|SearchAI\|AIChat\|ThemeToggle\|AnimatedSearchPlaceholder\)\|\./\(...\)" src
src/app/layout.tsx:5:import Navbar from "@/components/Navbar";
src/app/layout.tsx:6:import Footer from "@/components/Footer";
src/app/page.tsx:11:import SearchAI from '@/components/SearchAI';
src/components/Navbar.tsx:6:import ThemeToggle from './ThemeToggle';
src/components/SearchAI.tsx:6:import AnimatedSearchPlaceholder from './AnimatedSearchPlaceholder';
```

Five importers, exactly the five the table names, and `AIChat` with none. Nothing to report as a
difference.

All six moved with `git mv` (status shows `R`, so history is preserved). Three import sites
rewritten:

- `app/layout.tsx` — two lines became one: `import { Navbar, Footer } from "@/components/layout";`
- `app/page.tsx` — `import { SearchAI } from '@/components/common';`
- `components/layout/Navbar.tsx` — `'./ThemeToggle'` → `'@/components/common/ThemeToggle'` (direct
  path, as the table dictates), **not** the barrel.
- `components/common/SearchAI.tsx` — `'./AnimatedSearchPlaceholder'` left relative; both files are
  now in `common/`, so it still resolves. Not touched.

**Barrels are used and no component's export was edited.** All six are default exports; the barrel
re-exports them as named (`export { default as Navbar } from "./Navbar";`), which needs no change
inside the component. So the "keep the direct path instead" escape hatch was not needed.

**One thing Sober should know, since it is a consequence of using the barrel and not of the move
itself:** `app/page.tsx` now imports `SearchAI` through `@/components/common`, and that barrel also
re-exports `AIChat`. `AIChat` is a `'use client'` component with no side effects, so it should
tree-shake, but I did **not** measure the home page's bundle before and after. If Sober would
rather `/` import `@/components/common/SearchAI` directly, that is a one-line change — say so in
§Review. **UNVERIFIED — a before/after bundle-size comparison of `/` would settle it.**

`AIChat.tsx` has **no importer at all** in `front/src` (confirmed by the grep above). Moved
anyway, not deleted, as instructed.

### DoD evidence

**1. `npm run build` — succeeds.** 14/14 static pages, same route list as TASK-001's post-upgrade
build:

```
✓ Compiled successfully in 4.0s
  Running TypeScript ...
  Finished TypeScript in 5.3s ...
✓ Generating static pages using 11 workers (14/14) in 708ms
Route (app): / · /_not-found · /about · /blog · /classroom/[id] · /contact · /courses ·
             /login · /portfolio · /register · /services · /teach · /verify-email
```

The `MODULE_TYPELESS_PACKAGE_JSON` warning about `tailwind.config.ts` is still printed. It is the
warning TASK-001 §Questions Q4 raised and Sober **accepted** — unchanged by this task, not
silenced.

**2. `npx tsc --noEmit` — exit 0, no output**, both before and after. No pre-existing errors, no
new ones. *(Note: `tsc` dropped a `front/tsconfig.tsbuildinfo` next to the config; I deleted it,
and `git status` below confirms it is gone. It is not in `.gitignore` — worth the human adding,
but adding it is not in this task's scope.)*

**3. No import points at an old flat path:**

```
$ grep -rn "@/components/\(Navbar\|Footer\|SearchAI\|AIChat\|ThemeToggle\|AnimatedSearchPlaceholder\)" front/src
(no output; exit 1 = no match)
```

**4. `npm run dev` + the browser — `/` renders in BOTH themes.** `next dev --turbopack`,
`✓ Ready in 747ms`, Next 16.2.9.

What I actually saw at `http://localhost:3000/`:

- **Dark** (`<html class="dark">`, `dte-theme` = `system`): Navbar with the DTE wordmark and all
  five Thai links (`หน้าแรก ทักษะทั้งหมด เกี่ยวกับเรา สอนกับเรา` + `เข้าสู่ระบบ / สมัครฟรี`), the
  hero, and the SearchAI box with its animated placeholder cycling. Footer present at the bottom
  of the document (`About Services Portfolio Contact © 2025 Develyst…`), `background-color:
  rgb(28,25,23)`.
- **Light** — switched with the app's own ThemeToggle dropdown → "Light". `<html class="light">`,
  `dte-theme` = `light`, `--bg-primary: #fafaf9`, body `rgb(250,250,249)`. Navbar, SearchAI and
  Footer all still present and rendered; screenshot after a reload shows the light page.
- **Console: no errors** (`read_console_messages onlyErrors` → none).

One measurement trap worth recording: reading `getComputedStyle` ~400 ms after the theme click
still returned the dark value — the theme transition had not finished. The light values above were
read after a reload. Same class of staleness TASK-001 hit with screenshots.

**UNVERIFIED — below-the-fold appearance.** I confirmed the Footer exists and is styled by reading
the live DOM (`document.querySelector('footer')`, its rect and computed colours), **not** by
looking at it. My browser tool's screenshots go stale after scrolling — TASK-001 proved that. Only
the owner's own eyes settle how the footer *looks* after the move. Routes other than `/` were not
re-walked; `layout.tsx` is shared by all of them and the build is green, but that is an inference,
not an observation.

**5. `front/FRONTEND-CONVENTIONS.md` exists**, all seven sections, **127 lines** (the TASK said "under ~120" —
seven points over, and I would rather report the number than cut section 7 short). Section 7 points at
TASK-001 §Step 2b/2c and §Review for the evidence rather than retelling it.

**6. The checker, real output.** `ai-worker/tests/harness/check-no-emoji.mjs` — plain Node ESM,
`node:fs` only, no dependencies, run with `node v22.23.2`.

```
$ node ai-worker/tests/harness/check-no-emoji.mjs H:/dte/dte/front/src
front\src\app\about\page-new.tsx:64:44  🌟  U+1F31F
front\src\app\about\page-new.tsx:71:60  ✅  U+2705
... (124 lines) ...
front\src\services\aiChat.ts:17:68  →  U+2192

124 occurrence(s) in 39 file(s) scanned.
exit=1
```

**BASELINE, recorded 2026-09-07: 124 occurrences across 14 offending files** (39 `.ts`/`.tsx`
files scanned in total):

| file | hits | | file | hits |
|---|---|---|---|---|
| `lib/mockData.ts` | 39 | | `app/page.tsx` | 5 |
| `app/about/page.tsx` | 17 | | `app/courses/page.tsx` | 5 |
| `app/about/page-new.tsx` | 17 | | `services/aiChat.ts` | 4 |
| `app/teach/page.tsx` | 7 | | `components/common/SearchAI.tsx` | 4 |
| `components/layout/Navbar.tsx` | 6 | | `app/login/page.tsx` | 4 |
| `app/register/page.tsx` | 6 | | `app/verify-email/page.tsx` | 3 |
| `app/classroom/[id]/page.tsx` | 6 | | `components/common/AIChat.tsx` | 1 |

**The SPEC's estimate was 15 files / ~160, and the script disagrees — the script is the truth.**
The difference is fully explained and is not a script bug: SPEC-001 counted
`app/about/page.tsx.backup` (33 hits), and `.backup` is **not** one of the four extensions the
TASK told me to scan, so it is out of scope by design. In fact **every one of the SPEC's fourteen
per-file counts matches mine exactly** — its own list sums to 157 (the "~160"), and 157 − 33 =
**124**, my number to the unit. So the estimate was not wrong; only its file count included the
`.backup`. I tuned nothing.

**7. The zero case is proved too**, not only the failing case:

```
$ node ai-worker/tests/harness/check-no-emoji.mjs H:/dte/dte/front/src/types
OK — 0 emoji in 2 files scanned
exit=0
```

And the single-file mode:

```
$ node ai-worker/tests/harness/check-no-emoji.mjs H:/dte/dte/front/src/components/common/AIChat.tsx
...AIChat.tsx:19:122  😊  U+1F60A
1 occurrence(s) in 1 file(s) scanned.
exit=1
```

*(Running it on `ai-worker/tests/harness/` itself prints `OK — 0 emoji in 0 files scanned` — the
harness is `.mjs`, which is not in the four extensions. Zero files scanned is a weak proof, which
is why the `types/` run above is the one that counts.)*

**8. `git status --short` — only intended files, nothing stray:**

```
 M front/src/app/layout.tsx
 M front/src/app/page.tsx
R  front/src/components/AIChat.tsx -> front/src/components/common/AIChat.tsx
R  front/src/components/AnimatedSearchPlaceholder.tsx -> front/src/components/common/AnimatedSearchPlaceholder.tsx
R  front/src/components/SearchAI.tsx -> front/src/components/common/SearchAI.tsx
R  front/src/components/ThemeToggle.tsx -> front/src/components/common/ThemeToggle.tsx
R  front/src/components/Footer.tsx -> front/src/components/layout/Footer.tsx
RM front/src/components/Navbar.tsx -> front/src/components/layout/Navbar.tsx
?? front/FRONTEND-CONVENTIONS.md
?? front/src/components/common/index.ts
?? front/src/components/layout/index.ts
?? front/src/components/partials/
?? front/src/hooks/
?? front/src/lib/api/
?? front/src/types/
```

No `.bak`, no `node_modules` noise, no `tsconfig.tsbuildinfo`. Nothing committed by me.

### Files changed

- `front/src/components/{layout,common}/` — six moved files + two barrels.
- `front/src/components/partials/index.ts`, `front/src/hooks/common/index.ts`,
  `front/src/lib/api/index.ts`, `front/src/types/api/index.ts`, `front/src/types/app/index.ts` —
  empty barrels.
- `front/src/app/layout.tsx`, `front/src/app/page.tsx`, `front/src/components/layout/Navbar.tsx` —
  import lines only.
- `front/FRONTEND-CONVENTIONS.md` — new.
- `ai-worker/tests/harness/check-no-emoji.mjs` — new (coordination repo).

### Not touched, on purpose

`back/` · `services/api.ts` · `lib/mockData.ts` · `constants/portfolio.ts` ·
`constants/services.ts` · `components/ui/*.tsx` · `app/about/page.tsx.backup` and `page-new.tsx`
(REQ-003's / the owner's, `SYSTEM-FACTS.md` Q3). No dependency added or removed — `antd` is
TASK-003's and is **not** installed.

## Questions

- **Q1 (small, needs a yes/no, not blocking the review).** `/` now reaches `SearchAI` through the
  `@/components/common` barrel, and that barrel also re-exports `AIChat` — a `'use client'`
  component nothing else imports. The TASK told me to use the barrel where the export style
  allows, and it does. But I did **not** measure whether it costs the home page any bundle weight.
  Keep the barrel, or make `/` import `@/components/common/SearchAI` directly? Either is one line.

  > answer (Sober, 2026-09-07): **Keep the barrel.** Not on faith — I read what the barrel actually
  > drags in. `AIChat.tsx` is 161 lines and its only non-React imports are
  > `@heroicons/react/24/outline` and `@/services/aiChat`, and **both are already in `/`'s module
  > graph via `SearchAI`** (`components/common/SearchAI.tsx:4,8`). So the worst case, if Turbopack
  > does not tree-shake it, is one 161-line client component and **no new dependency edge**. That is
  > not worth a one-off deviation from the very barrel convention this task is establishing.
  > **It stays UNVERIFIED and I am not laundering it:** nobody has measured `/`'s bundle. The
  > measurement is folded into **TASK-003**, which must report antd's bundle cost anyway — it will
  > report `/` before and after, and the barrel is inside that "before". If it turns out to cost
  > real weight, the fix is still the same one line.

- **Q2 (a fact for you, not a request).** TASK-001's seven files are **no longer uncommitted** —
  the human committed them to `D1` as `d466ba4 "adawdawda"`, and the tree was clean when I started.
  That changes the premise of TASK-001 §Questions Q1 (`D1` vs `develop`): the question is now
  "why does `D1` exist and does it reach `develop`", not "which branch should these land on".
  Still the human's, still not mine to decide — flagging it so the board's Blocked row is accurate.

  > answer (Sober, 2026-09-07): **Useful — and the fact has moved on again since you wrote it.**
  > I re-read the refs myself (read-only, no fetch, no network):
  > `D1`, `develop`, `origin/D1` and `origin/develop` **all point at `d466ba4`**
  > (`git rev-list --left-right --count develop...D1` → `0  0`). TASK-001's upgrade is therefore
  > **already on `develop`, local and remote** — the worry behind the board's Blocked row ("does
  > `D1` reach `develop`") is answered by evidence, and I have closed that row.
  > `D1` is a duplicate label on the same commit; **why it exists is still the human's** and I am
  > not guessing. Caveat stated plainly: `remotes/origin/*` are as of this checkout's last fetch,
  > which I did **not** perform — I ran no network command.
  > ~~**A separate and more serious finding came out of the same read**: `origin/production` sits at
  > `253eeda`, one commit *behind* `develop`, which does not sit comfortably with
  > `SYSTEM-FACTS.md` A4 ("production runs `develop`'s tip"). Not yours, not mine — it has gone to
  > Porter for the owner. See §Review, "One finding that leaves this task".~~
  > **STRUCK 2026-09-07 by Sober**, on the owner's standing ruling (`SYSTEM-FACTS.md` **A23**,
  > carried by Porter): **git is outside this team's scope** — branches, commit hashes, what is
  > merged/pushed, and which branch production runs are the owner's alone. Nobody asks, reports on,
  > or gates work on them. A4 stands as the owner stated it and is not a live question. The rest of
  > this answer (that the upgrade is on `develop`) is left in place as history only; do not re-raise
  > any of it. **Unchanged: no agent commits, pushes, merges, deploys, or touches production.**

- **Q3 (housekeeping, out of my scope to fix).** `npx tsc --noEmit` writes
  `front/tsconfig.tsbuildinfo`, and `front/.gitignore` does not ignore it, so it shows up as an
  untracked file for anyone who typechecks. I deleted the one I made rather than add it to
  `.gitignore` — editing `.gitignore` is not in this TASK. Worth a line in some future TASK.

  > answer (Sober, 2026-09-07): **Correct call, and I hit it too** — my own `npx tsc --noEmit`
  > re-run recreated `front/tsconfig.tsbuildinfo` and I deleted it the same way. It is a real
  > papercut for everyone who typechecks, and the fix is **one line in `front/.gitignore`** — too
  > small for a TASK of its own. **I am carrying it into TASK-003** as an explicit first step
  > (TASK-003 touches `front/` config anyway). Recorded here so it cannot get lost; if TASK-003
  > ships without it, that is my miss, not yours.

## Review

**Verdict: `DONE`** — Sober (SA Lead), 2026-09-07. Every Definition-of-Done item is met, and the
five that can be re-run without a browser I **re-ran myself** rather than reading Fern's paste.
Two `UNVERIFIED` items are accepted and carried to the owner (below); they are not laundered into
"it works".

### What I re-ran myself, read-only (not "I read the notes")

| Check | My own command | Result |
|---|---|---|
| The skeleton exists as specified | `ls -R front/src/{components,hooks,lib,types}` | 7 folders, all present, each with a barrel. No `context/`, no `constant/` — the stated deviation held. `components/ui/*.tsx` still flat, as instructed. |
| No import still points at an old flat path (DoD 3) | `grep -rn "@/components/\(Navbar\|Footer\|SearchAI\|AIChat\|ThemeToggle\|AnimatedSearchPlaceholder\)" front/src` | **no output, exit 1** — reproduced. |
| Types (DoD 2) | `cd front && npx tsc --noEmit` | **exit 0, no output** — reproduced independently. |
| The emoji baseline (DoD 6) | `node ai-worker/tests/harness/check-no-emoji.mjs H:/dte/dte/front/src` | **`124 occurrence(s) in 39 file(s) scanned`, exit 1** — and piping the hits through `sort -u` on the path gives **14 distinct files**. Fern's baseline reproduces to the unit. |
| The zero case (DoD 7) | `node …/check-no-emoji.mjs …/front/src/types` | `OK — 0 emoji in 2 files scanned`, **exit 0** — reproduced. |
| The tree is clean (DoD 8) | `git status --short` in the repo | Exactly the 6 `R`/`RM` moves, 2 modified import sites, and the 7 new untracked files. No `.bak`, no `node_modules`, no `tsconfig.tsbuildinfo`. **Nothing committed by an agent.** |
| The conventions doc (DoD 5) | `wc -l` + `grep -n "^#"` on `front/FRONTEND-CONVENTIONS.md` | 127 lines, **all seven** `##` sections present in order, section 7 present with both traps. |

I also read the checker's source rather than only its output: the ranges, `U+FE0F` and the four
text glyphs match SPEC-001 §"The no-emoji check" exactly; it iterates by code point (so a
surrogate pair is one hit, not two), takes a file *or* a directory, skips `node_modules`/`.next`,
and imports nothing but `node:fs`/`node:path`. It runs on a checkout that never had
`npm install`. No dependency, no tuning to the estimate.

### What I did NOT re-run, and whose evidence stands

**I ran no `npm run build`, no dev server and no browser.** DoD 1 (build green, 14/14 static
pages) and DoD 4 (`/` walked in dark **and** light, console clean) rest on **Fern's own pasted
commands and output**, which is what this project's evidence rule asks for — and his notes name
the measurement trap he hit (reading `getComputedStyle` ~400 ms after the theme click still
returned dark; the light values came after a reload). That is the shape of an honest measurement,
not a claim.

### Accepted `UNVERIFIED` — owed to the owner's eyes, not to another agent

1. **Below-the-fold appearance after the moves.** Fern proved the Footer *exists* and is styled by
   reading the live DOM, **not by looking at it** — his browser tool's screenshots go stale after
   scrolling (TASK-001 proved that with a fixed probe). Only the owner's eyes settle how it looks.
2. **Routes other than `/` were not re-walked.** `app/layout.tsx` is shared by all 14 routes and
   the build is green, but that is an inference, not an observation — and `layout.tsx` is exactly
   the file this task edited, so it is the one inference I least want to leave silent. It rides
   along with the owner's existing walk-through of the upgrade rather than becoming a new blocker.
3. **`/`'s bundle weight through the `common` barrel** — see §Questions Q1; measurement folded
   into TASK-003.

None of these is `REWORK`: each is a thing that genuinely cannot be settled from this seat.

### On the SPEC's estimate being "wrong"

It was not. Fern's reconciliation is correct and I checked the arithmetic: SPEC-001's per-file
counts match his to the unit, its list sums to 157, and `157 − 33` (`about/page.tsx.backup`, an
extension the TASK deliberately does not scan) `= 124`. **SPEC-001 §"The no-emoji check" now has a
stale baseline line** ("15 files, ~160") — it is stale only in *file count and scope note*, not in
substance. I am not editing SPEC-001 in this unit; the authoritative number from today forward is
the script's, and it is recorded in `front/FRONTEND-CONVENTIONS.md` §5 and here: **124 in 14
files, 39 scanned, 2026-09-07**.

### Two small things I am accepting rather than sending back

- **127 lines against a "~120" guide.** Fern reported the number instead of cutting section 7
  short. That is the right trade and the right disclosure.
- **Section 7 cites "SPEC-001 §Decision 4".** Decision 4 is theming/`ThemeContext`, so that
  pointer is a little off-target for a *cascade* trap — but the citation came from **my own TASK
  text**, not from Fern. My error, not his; it costs a reader one extra click and is not worth a
  rework hop. Whoever next edits that section can retarget it.

### ~~One finding that leaves this task~~ — CLOSED AND STRUCK 2026-09-07

~~Reading the refs to answer Q2 (read-only, **no fetch, no network**) turned up something that is
not TASK-002's and not Fern's: **`origin/production` is at `253eeda`, one commit behind
`develop`/`origin/develop` (`d466ba4`)**, while `SYSTEM-FACTS.md` A4 records that production runs
`develop`'s tip. Either A4 needs qualifying or a `production` branch exists that nobody here has
been told about. **I am not resolving it and no agent may check the live site.** It has gone to
Porter, for the owner, and onto the board. If A4 is wrong, every "blast radius: production is
reached by the owner's merge to `develop`" line written so far is resting on it.~~

**Struck 2026-09-07 by Sober**, on the owner's standing ruling recorded as `SYSTEM-FACTS.md`
**A23** and carried to me by Porter: **git is outside this team's scope.** Branches, commit
hashes, what is merged or pushed, and which branch production runs are the owner's business
alone — no role asks about them, reports on them, or gates work on them, and this item does not
return. `SYSTEM-FACTS.md` **A4 stands as the owner stated it**; it was never a live question.
The board row that carried this finding is struck too. **Unchanged and absolute: no agent
commits, pushes, merges, deploys, or touches production or its database** — work is handed off as
edited files on `develop`. Raising this finding was the error being corrected here; the mistake
was treating a git observation as a team concern, not the reading itself.
