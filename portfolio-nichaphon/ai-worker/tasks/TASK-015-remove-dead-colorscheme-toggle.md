# TASK-015: Remove the dead `ColorSchemeToggle` and its `ui` barrel re-export

- Source: **SPEC-002** §"Decision: colour scheme is NOT touched by this SPEC"
  (extended 2026-09-05), on the owner's **`AC7 = เอาออก`** closing REQ-002 Q19.
- Status: **DONE** (Sober 2026-09-05 — reviewed; built by Fern 2026-09-05)
- Owner: Fern (FE)
- Depends on: none. Disjoint from TASK-013 and TASK-014; any order is fine.
- Repo: `portfolio-nichaphon-web`, `front/src/components/ui/`
- Gates: **none directly.** Read the next section before assuming otherwise.

## Read this first: this task does NOT implement AC7

`ColorSchemeToggle` is **not mounted anywhere.** I checked the whole tree: the
only references are its own file, its own `index.ts`, and line 2 of
`src/components/ui/index.ts`. `SiteHeader` does not render it and no route does.
All six routes are already dark-only via `forceColorScheme="dark"` on both
`ColorSchemeScript` (`app/layout.tsx:56`) and `MantineProvider`
(`components/providers/UIProvider.tsx:15`).

So: **this change alters nothing a visitor sees, on any route.** AC7 needs QA to
*look* at the five non-Home routes and see no colour-scheme control — Porter has
bundled that into the re-test round. It does not tick on this task, it does not
tick on a source read, and it would have ticked with or without this task. Say
so in your notes; do not let this be written up as "AC7 done".

## Why do it at all, then — two reasons, both concrete

1. **It is dead code that now contradicts a settled owner decision.** `เอาออก`
   is his word for the toggle. Leaving a working, exported toggle in the barrel
   is an invitation for someone to mount it later and quietly reopen Q19.
2. **It is the one `'use client'` component in the `ui/` barrel** — and that
   barrel is **SQ11**'s named lead for `/blog` + `/portfolio` shipping ~123 kB
   more First Load JS than `HEAD`. `app/blog/page.tsx` and
   `app/portfolio/page.tsx` both `import { RouteHero } from '@/components/ui'`,
   which pulls the whole barrel into their module graph. Removing the only
   client member turns SQ11 from a hypothesis into a measurement. **Either
   answer is useful** — if the number does not move, the lead is wrong and I
   want to know that too. This task takes **no position** on SQ11.

## What to do

1. Delete `front/src/components/ui/ColorSchemeToggle/ColorSchemeToggle.tsx`.
2. Delete `front/src/components/ui/ColorSchemeToggle/index.ts` (and the now-empty
   directory).
3. Delete line 2 of `front/src/components/ui/index.ts`:
   `export { ColorSchemeToggle } from './ColorSchemeToggle';`
   The other seven exports stay in their current order.

**Do not touch, under any reading of `เอาออก`:**

- `ColorSchemeScript forceColorScheme="dark"` in `app/layout.tsx`
- `forceColorScheme="dark"` in `components/providers/UIProvider.tsx`
- the `mantineHtmlProps` spread, or the `theme.ts` comment at line 220

Those three are what *make* the site dark-only. Removing them would undo the
owner's decision, not implement it. Nothing else in the repo changes.

## Definition of Done

- [ ] Exactly three paths in `git status --porcelain`: two deletions and one
      modified `src/components/ui/index.ts`. Nothing else.
- [ ] `grep -rn "ColorSchemeToggle" front/src` returns **zero** hits.
- [ ] `grep -rn "useMantineColorScheme\|useComputedColorScheme" front/src`
      returns **zero** hits.
- [ ] `grep -rn "forceColorScheme" front/src` still returns **exactly two** hits
      (`app/layout.tsx`, `providers/UIProvider.tsx`) — unchanged.
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run build` succeeds, and you record the **First Load JS for all six
      routes before and after** from the build table. This is a measurement for
      SQ11 only: it does **not** tick AC8 and it does **not** pre-empt TEST-003
      or REGRESSION S11, both of which are QA's.
- [ ] `npm run dev`: `/`, `/blog` and `/portfolio` render and the console is
      clean at 1280.
- [ ] §Implementation Notes states the before/after First Load JS numbers and,
      in one line, that AC7 is QA's rendered check and not ticked here.


## Implementation Notes

**AC7 is not ticked here.** Nothing a visitor sees changed on any route; AC7 ticks
only when QA looks at the five non-Home routes and sees no colour-scheme control.

### Scope — the three paths, and the two that are not mine

`git status --porcelain` (repo `portfolio-nichaphon-web`, branch `develop`):

```
 M front/src/components/partials/Home/HomeHero.module.css        <- TASK-013, already at REVIEW
 M front/src/components/partials/Services/ServicesTable.module.css <- TASK-014, already at REVIEW
 D front/src/components/ui/ColorSchemeToggle/ColorSchemeToggle.tsx
 D front/src/components/ui/ColorSchemeToggle/index.ts
 M front/src/components/ui/index.ts
```

Five paths, not three, because git writes are the human's — TASK-013's and
TASK-014's edits are still uncommitted in the working tree. **The three paths
below the line are the whole of this task**; I touched nothing else.

`git diff front/src/components/ui/index.ts` is exactly one removed line:

```
-export { ColorSchemeToggle } from './ColorSchemeToggle';
```

The other seven exports keep their order and their bytes. The
`ColorSchemeToggle/` directory is gone (`ls front/src/components/ui` shows seven
component folders + `index.ts`). Line endings unchanged (LF before and after,
same as its untouched siblings).

**The three forbidden lines are untouched**, verified after the edit:
`app/layout.tsx:56` `ColorSchemeScript forceColorScheme="dark"`,
`providers/UIProvider.tsx:15` `forceColorScheme="dark"`, `theme/theme.ts:220`
(comment). `data-mantine-color-scheme="dark"` still on `<html>` at runtime.

### Greps (run after the edit)

| Grep over `front/src` | DoD expects | Actual |
|---|---|---|
| `ColorSchemeToggle` | 0 | **0** |
| `useMantineColorScheme\|useComputedColorScheme` | 0 | **0** |
| `forceColorScheme` | exactly 2 | **3** — see FQ42 |

`npx tsc --noEmit` exit **0**.

### Build measurement — before / after (SQ11 only)

Both runs are `npm run build` on a **cleared `.next`**, same tree, same machine,
the only difference being the three paths above. Full table, all six routes plus
`/_not-found` and the shared bundle:

| Route | Size before | Size after | First Load JS before | First Load JS after |
|---|---|---|---|---|
| `/` | 2.97 kB | 2.74 kB | 283 kB | **283 kB** |
| `/about` | 2.89 kB | 2.65 kB | 280 kB | **279 kB** |
| `/blog` | 5.61 kB | 5.34 kB | 283 kB | **282 kB** |
| `/contact` | 4.33 kB | 4.09 kB | 281 kB | **281 kB** |
| `/portfolio` | 7.05 kB | 6.82 kB | 284 kB | **284 kB** |
| `/services` | 2.73 kB | 2.50 kB | 283 kB | **283 kB** |
| `/_not-found` | 996 B | 996 B | 103 kB | 103 kB |
| shared by all | — | — | 102 kB | 102 kB |

Shared chunk hashes are **identical** across the two runs
(`255-7e544fa2c10391fd.js` 46.1 kB, `4bd1b696-409494caf8c83275.js` 54.2 kB), so
the toggle was never in the shared bundle.

**What this measures, stated narrowly.** The barrel now has **zero** `'use client'`
members (`grep -rln "use client" front/src/components/ui` → none), and
`app/blog/page.tsx:3` + `app/portfolio/page.tsx:3` still import `RouteHero`
through it. So this is exactly the experiment SQ11 asked for. Removing the
barrel's only client member moves First Load JS by **at most 1 kB** on any route
(-1 on `/about` and `/blog`, 0 elsewhere). SQ11's gap is ~123 kB. **The named
lead therefore does not account for it** — that is the measurement; I name no
replacement cause and take no position beyond it (FQ43).

### Rendered check

`next dev` on **3032** (port 3000's orphan PID 8508 routed around, never
touched), fresh tab at **1280x800**:

- `/` — renders, title `Nichaphon Sayvav — Senior / AI Software Engineer`.
- `/blog` — renders, title `Blog — Nichaphon Sayvav`.
- `/portfolio` — renders, title `Portfolio — Nichaphon Sayvav`, h1 "Nine
  projects, and what each one had to solve", 2655 chars of body text.
- **Console clean on all three** — the only entries are React DevTools info and
  dev-only `[Fast Refresh] rebuilding`. No error, no warning.
- Incidental, **not** an AC7 tick: on `/portfolio` no element carries an
  `aria-label` matching `/theme|scheme|dark|light/i`, and
  `<html data-mantine-color-scheme="dark">`. That is one route, read from the
  DOM, not the five-route look QA owes.

Server stopped afterwards; **`front/.next` deleted** (per the standing note: no
`npm run dev` on top of a `next build` output, and clear it again after a build
measurement). No git write, no deploy, no install, no infra file touched.

## Questions

- **FQ42 (non-blocking, DoD wording).** The DoD expects `grep -rn "forceColorScheme"
  front/src` to return **exactly two** hits. The tree returns **three**, before and
  after this task: `app/layout.tsx:56`, `providers/UIProvider.tsx:15`, and
  `theme/theme.ts:220` — the third being the doc comment the task itself lists as
  untouchable. Nothing changed; I read the intent as "the two live mounts are
  unchanged" and did not edit either the code or the DoD. Confirm the reading.
  > **answer (Sober, 2026-09-05): your reading is right; the DoD was mine and it was
  > imprecise.** The intent was "the two **live mounts** are unchanged", and
  > `theme/theme.ts:220` is a doc comment the task itself lists as untouchable — so
  > **three** hits is the correct state of the tree before and after. I re-ran all
  > three greps myself and confirm: `ColorSchemeToggle` 0, the two colour-scheme hooks
  > 0, `forceColorScheme` 3 (`app/layout.tsx:56`, `providers/UIProvider.tsx:15`,
  > `theme/theme.ts:220`). **Nothing to change in the code and the DoD item counts as
  > met.** My wording error, not yours; the next DoD of this shape will say "two live
  > mounts + one comment". You were right to ask instead of editing either side.
- **FQ43 (non-blocking, SQ11).** The measurement above falsifies the named lead
  (<=1 kB, not ~123 kB). Whether SQ11 gets a follow-up — and what the next
  measurement would be — is yours; I have not looked further and will not guess.
  > **answer (Sober, 2026-09-05): SQ11's named lead is struck, and no follow-up task
  > is written now.** Your A/B *is* the experiment SQ11 asked for and it answers it:
  > the `ui` barrel has **zero** `'use client'` members, `/blog` and `/portfolio`
  > still import `RouteHero` through it, and First Load JS moves **<= 1 kB**. So the
  > barrel is not the ~123 kB, and **I name no replacement cause** — an unnamed cause
  > recorded honestly beats a plausible one. The honest next measurement is chunk-level
  > attribution (per-route `build-manifest` + chunk diff between the pre-REQ-002 commit
  > and HEAD), and that is a real engineering session for a question with **no budget
  > attached to it**: this project has no performance budget in any REQ or SPEC, and I
  > will not invent one after the fact to justify the work — that is exactly the
  > reasoning I used to say SQ11 does not block REQ-002. So SQ11 stays open as a
  > notice with Porter, with its named lead marked **FALSIFIED** and your six-route
  > table as the evidence; it becomes a task only if the owner asks for performance
  > work. **Nothing further from you.**

## Review

**Verdict: DONE — Sober, 2026-09-05.** Every check re-run by me in the tree.

| Check | Expected | I measured |
|---|---|---|
| `grep -rn "ColorSchemeToggle" front/src` | 0 | **0** |
| `grep -rn "useMantineColorScheme\|useComputedColorScheme" front/src` | 0 | **0** |
| `grep -rn "forceColorScheme" front/src` | 2 live mounts unchanged | **3** — the two mounts + `theme.ts:220`'s comment (FQ42) |
| `grep -rln "use client" front/src/components/ui` | — | **0 files** |
| `npx tsc --noEmit` | clean | **exit 0** |

- **Scope is exactly the three paths.** `git status --porcelain` shows five; two are
  TASK-013's and TASK-014's uncommitted CSS, which is correct because **git writes are
  the human's** and you were right not to tidy them. The barrel diff is the single
  removed line, the other seven exports keep their order and their bytes (I read the
  file), and `ColorSchemeToggle/` is gone — `ui/` now holds seven component folders
  plus `index.ts`.
- **The three forbidden lines are present and unchanged**, verified by me:
  `app/layout.tsx:56`, `providers/UIProvider.tsx:15`, `theme/theme.ts:220`. What makes
  the site dark-only is untouched, which is the whole point of `เอาออก` meaning the
  toggle and not the decision.

**AC7 is NOT ticked by this task and I do not tick it.** Nothing a visitor sees
changed on any route; AC7 needs QA to look at the five non-Home routes and see no
colour-scheme control. Your `/portfolio` DOM read is correctly labelled incidental —
one route, read from source-adjacent evidence, not the five-route look QA owes. You
stated this in the first line of your notes, which is what the task asked for.

**SQ11 — the falsification is the most useful result here.** Two builds on a cleared
`.next`, six routes, identical shared chunk hashes, only your three paths differing:
that is a real A/B and it kills a lead I wrote. Reporting the number that contradicts
your own task's stated motivation, and then refusing to name a replacement cause, is
the behaviour I want on this project. **The lead is now struck in SPEC-002 §Questions
SQ11 with your table as the evidence.**

**FQ42 and FQ43 answered above.** Nothing carried back to you.
