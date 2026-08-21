# TASK-010: FE — folder-structure rebuild, no visual change
- Source: SPEC-002
- Status: DONE (reviewed by Sober 2026-08-21, commit `9b6345c`)
- Assignee: Fern (FE)
- Depends on: none

## What to do

Move `code-report-front/src` to the target tree in **SPEC-002 Decision 2**.
This TASK is a **pure structural change**: files move, directories gain barrels,
imports are rewritten to `@/`, pages become thin. **No component markup is
rewritten, no Mantine component is introduced, no styling changes, and no
dependency is added.** The Mantine-first rebuild is TASK-011/012/013 — keeping
the move separate is what makes the redesign diffs reviewable.

The diff should read as **renames + import rewrites** (`git show --stat -M`
should show a majority of `R###` rename entries).

### Move map — every file in `src/` today, and where it lands

Measured at commit `f00e78d` (clean tree). 23 files.

| Today | Target | Note |
|-------|--------|------|
| `app/globals.css` | `app/globals.css` | **unmoved on purpose** — THE token block |
| `app/layout.tsx` | `app/layout.tsx` | mounts `UIProvider` (was `providers.tsx`) |
| `app/page.tsx` | `app/page.tsx` | the `/` redirector, unchanged |
| `app/providers.tsx` | `components/providers/UIProvider.tsx` | rename only; still `"use client"` |
| `app/login/page.tsx` | `app/(auth)/login/page.tsx` | thin page → `<LoginContent />` |
| `app/reports/new/page.tsx` | `app/(app)/reports/new/page.tsx` | thin page → `<NewReportContent />` |
| `app/reports/[jobId]/page.tsx` | `app/(app)/reports/[jobId]/page.tsx` | thin async page, awaits `params` → `<ReportViewContent jobId=… />` |
| `components/LoginForm.tsx` | `components/partials/Login/LoginContent.tsx` | + `Login.config.ts`, `index.ts` |
| `components/NewReportForm.tsx` | `components/partials/NewReport/NewReportContent.tsx` | 626 lines — split per below |
| `components/ReportView.tsx` | `components/partials/ReportView/ReportViewContent.tsx` | 260 lines — split per below |
| `components/AppShell.tsx` | `components/layout/AppShell/AppShell.tsx` | + `Header/`, `index.ts` |
| `components/LanguageSwitch.tsx` | `components/common/LanguageSwitch.tsx` | |
| `components/ReportMarkdown.tsx` | `components/common/ReportMarkdown.tsx` | |
| `components/RequireAuth.tsx` | `components/common/RequireAuth.tsx` | |
| `lib/api/client.ts` | split — see "Splitting `client.ts`" | |
| `lib/format.ts` | `lib/format.ts` | unchanged |
| `lib/reports/retry.ts` | `lib/storage/retryParams.ts` | |
| `lib/reports/useReportJob.ts` | `hooks/reports/useReportJob.ts` | + `index.ts` |
| `lib/useDelayedFlag.ts` | `hooks/common/useDelayedFlag.ts` | + `index.ts` |
| `lib/session/SessionProvider.tsx` | `context/session/SessionProvider.tsx` | |
| `lib/i18n/I18nProvider.tsx` | `context/i18n/I18nProvider.tsx` | |
| `lib/i18n/dictionaries.ts` | `constant/text/dictionaries.ts` | + `index.ts` |
| `lib/theme.ts` | `lib/theme.ts` | unchanged (still a pointer at `globals.css`) |

### Splitting `client.ts` (the only non-trivial move)

`lib/api/client.ts` is one 280-line file holding four different things. It
becomes four, **by moving declarations verbatim — no logic edit, no behaviour
change, no signature change**:

| Declaration | Target |
|-------------|--------|
| `API_BASE_URL`, `ApiErrorBody`, `ApiError`, `apiRequest`, `setUnauthorizedHandler`, `RequestOptions`, `AUTH_REQUIRED`, `VALIDATION_ERROR` | `lib/api/client.ts` |
| `fetchMe`, `login`, `logout`, `createReport`, `fetchReport` (the typed per-endpoint functions) | `lib/api/api-main.ts` |
| thin call-site wrappers: `login`/`logout`/`me` → `services/auth.service.ts`; `createReport`/`fetchReport` → `services/report.service.ts` | `services/*.service.ts` — components import **these**, not `api-main` |
| `SessionUser`, `ApiErrorBody` shapes, `CreateReportInput`, `ReportStatus`/`REPORT_STATUSES`, `TERMINAL_STATUSES`, `ReportStage`/`REPORT_STAGES`, `ReportParams`, `ReportJob` | `types/api/main/{common,auth,report}.ts`; frontend-only domain types in `types/app/reports/index.ts` |

`Language` / `LANGUAGES` / `isLanguage` stay with the dictionaries in
`constant/text/` (they are the i18n contract, not an API type).

### Rules that come with the layout (SPEC-002 Decision 2)

- **Every directory gets an `index.ts` barrel** re-exporting its public API.
- **No relative import across a feature boundary** — `@/` alias only. Relative
  imports *inside* one partial directory are legal.
- **Pages are thin**: unpack params/guards, render one `…Content`. In Next 16
  `params` is a Promise and must be awaited.
- **`"use client"` only where hooks/state/handlers live** — the `…Content`
  component is the client boundary; `page.tsx` stays a server component.
- **Naming**: partial dirs PascalCase, components PascalCase, hooks `use*.ts`,
  services `*.service.ts`, config `[Feature].config.ts`.
- **Partial splits are structural only.** `NewReportContent` sheds its heading
  block into `NewReportHeader.tsx` and its field block into `NewReportFields.tsx`;
  `ReportViewContent` sheds `ReportProgress.tsx` and `ReportResult.tsx`. **Move
  the existing JSX, do not rewrite it.** Constants/labels keys that the partial
  owns go to its `*.config.ts`.
- **`components/ui/` is created but may be empty after this TASK** — a wrapper
  is added only where a real project default exists (SPEC-002 deviation 1), and
  no defaults exist until Mantine is actually used in TASK-011.

### Explicitly NOT in this TASK

Mantine components, `@mantine/dates`, `hallmark`, any visual/layout change, any
copy change, REQ-001 Requirements 16/17/18, and any backend or API-contract
change.

## Definition of Done
- [x] `npm run typecheck` exit 0.
- [x] `npm run build` green and listing the **same four routes** as before the
      move — `/`, `/login`, `/reports/new`, `/reports/[jobId]` — with
      `/reports/[jobId]` still the one dynamic route. Paste both build route
      lists (before and after) side by side: **this is the structural proof the
      move was behaviour-neutral.**
- [x] `git show --stat -M` pasted, showing the move as renames.
- [x] Grep evidence: **zero** relative imports crossing a feature boundary
      (`grep -rn "from \"\\.\\./\\.\\./" src` returns nothing), and every new
      directory has an `index.ts`.
- [x] Grep evidence that **no Mantine component was introduced**:
      `grep -rn "@mantine/core" src` still returns only the plumbing hits
      (`layout.tsx`, `UIProvider.tsx`, `lib/theme.ts`).
- [x] `git diff` on `src/app/globals.css` is **empty** (the token block did not
      move and did not change).
- [x] **The behaviour freeze — all 10 items of SPEC-002's list — walked
      manually and reported item by item.** Items 1, 2, 3, 4, 6, 9 are the ones
      a file move can plausibly break (route groups, the `?expired=1` handling,
      the `setUnauthorizedHandler` wiring, the retry prefill's storage key, the
      dictionaries' import path); the rest are confirmed unchanged by the empty
      diff on the files that own them.
- [x] Working tree clean at the reported commit; commit sha in the notes.

## Implementation Notes

**Commit `9b6345c` on `main`, working tree clean** (`git status --porcelain`
prints one line, `?? .agent/` — the `hallmark` skill directory the stakeholder
installed; it was already untracked before this TASK started and I did not add,
commit or ignore it).

### Gate evidence

| Gate | Result |
|------|--------|
| `npm run typecheck` | exit **0** |
| `npm run build` | green, 5/5 static pages |
| `git status --porcelain` | only the pre-existing `?? .agent/` |

**Route list, before and after — identical:**

```
BEFORE (f00e78d)              AFTER (9b6345c)
Route (app)                   Route (app)
┌ ○ /                         ┌ ○ /
├ ○ /_not-found               ├ ○ /_not-found
├ ○ /login                    ├ ○ /login
├ ƒ /reports/[jobId]          ├ ƒ /reports/[jobId]
└ ○ /reports/new              └ ○ /reports/new
```

`(auth)` and `(app)` are not path segments, exactly as SPEC-002 says;
`/reports/[jobId]` is still the one `ƒ` dynamic route.

**Greps:**

```
$ grep -rn 'from "\.\./\.\./' src        → (nothing)
$ grep -rn 'from "\.\./' src             → (nothing — no parent-relative import at all)
$ grep -rn "@mantine/core" src
src/app/layout.tsx:1:import "@mantine/core/styles.css";
src/app/layout.tsx:4:import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
src/components/providers/UIProvider.tsx:3:import { MantineProvider } from "@mantine/core";
src/lib/theme.ts:1:import { createTheme, type MantineColorsTuple } from "@mantine/core";
$ git diff -- src/app/globals.css | wc -l → 0
$ for d in <every dir under src, excluding src/app>; do [ -f "$d/index.ts" ] || echo MISSING; done → (nothing)
```

Four `@mantine/core` hits, the same three files as SPEC-002's ground truth.
The only relative imports left are same-directory ones inside one partial
(`./Login.config`, `./NewReportFields`, `./ReportResult`, `./Header`) and the
barrels themselves — legal per SPEC-002 Decision 2.

### The diff reads as renames — and where it does not, that is stated

`git show --raw -M HEAD` (default 50% similarity), 66 entries:

```
46 A   4 D   3 M   12 R (R052 R068 R079 R083 R086 R087 R089 R089 R095 R099 R100 R100 R100)
```

At `-M25% -C25%` there is **no `D` left at all**: `17 R + 2 C + 3 M + 40 A`.
Every original file is accounted for as a rename or copy source.

**The four `D` entries at the default threshold are the four files the TASK
itself told me to split**, so more than half their content left the file and
git stops calling them renames:
`components/AppShell.tsx`, `components/NewReportForm.tsx` (626 lines),
`components/ReportView.tsx`, and `app/reports/[jobId]/page.tsx` (rewritten as
the thin async page). The 40 `A` entries are the 24 new barrels, the three
`*.config.ts`, the two service files, the six type files, and the five shed
components.

**Three moves are `R100` — byte-identical, not one character changed:**

```
src/components/ReportMarkdown.tsx  -> src/components/common/ReportMarkdown.tsx
src/lib/i18n/dictionaries.ts       -> src/constant/text/dictionaries.ts
src/lib/useDelayedFlag.ts          -> src/hooks/common/useDelayedFlag.ts
```

`dictionaries.ts` at `R100` **is the proof for freeze item 10**: the copy bundle
Q14 closed is byte-for-byte what it was.

### `client.ts` split — declarations moved, nothing rewritten

280 lines → four places, per the TASK's table:

- `lib/api/client.ts` — `API_BASE_URL`, `AUTH_REQUIRED`, `VALIDATION_ERROR`,
  `ApiError`, `NetworkError`, `setUnauthorizedHandler`, `RequestOptions`,
  `apiRequest`, `toApiError`, `isFieldMap`.
- `lib/api/api-main.ts` — `fetchMe`, `login`, `logout`, `createReport`,
  `fetchReport`, verbatim.
- `services/auth.service.ts` (`me`/`login`/`logout`) and
  `services/report.service.ts` (`createReport`/`fetchReport`) — one-line
  pass-throughs; components and providers import these.
- `types/api/main/{common,auth,report}.ts` — `ApiErrorBody`; `SessionUser`;
  `CreateReportInput`, `REPORT_STATUSES`/`ReportStatus`, `TERMINAL_STATUSES`,
  `REPORT_STAGES`/`ReportStage`, `ReportParams`, `ReportJob`.

**Five judgements I made inside the map rather than guessing silently:**

1. **`ApiErrorBody` is listed in the map twice** — once under `client.ts`, once
   under "`ApiErrorBody` shapes" in `types/`. I declared it **once**, in
   `types/api/main/common.ts`, and `client.ts` re-exports it
   (`export type { ApiErrorBody }`), so both rows are satisfied and there is no
   second copy to drift.
2. **`NetworkError` is not in the map at all.** It is transport (it means "the
   request never left the browser"), so it stayed in `client.ts` next to
   `ApiError`.
3. **`types/app/reports/index.ts` would otherwise have been an empty file.** I
   put the two genuinely frontend-only shapes there: `RetryParams` (from
   `retry.ts`) and `ReportJobState` (from `useReportJob.ts`). Both original
   modules re-export their own type, so no call site changed.
4. **`SessionProvider` imports `setUnauthorizedHandler` from `@/lib/api/client`,
   not through a service.** It is transport wiring, not an endpoint; wrapping it
   in `auth.service.ts` would have invented a service function the map does not
   name. Flagged rather than assumed.
5. **`REPORT_STATUSES` / `TERMINAL_STATUSES` / `REPORT_STAGES` are values, not
   types, and they now live under `types/`.** The map puts them there explicitly,
   so I followed it; noting it because a `types/` folder holding runtime arrays
   is the kind of thing a reviewer stops on.

### Partial splits (structural only — JSX moved, not rewritten)

- `Login/`: `LoginContent.tsx` (the component renamed from `LoginForm`),
  `Login.config.ts` (the `Phase` union — the only thing the partial owned).
- `NewReport/`: `NewReportContent.tsx` (state, validation, submit, the run rail),
  `NewReportHeader.tsx` (the `<h1>`), `NewReportFields.tsx` (the whole field
  column plus the `Group`/`Field`/`FieldError`/`describedBy` primitives it alone
  used), `NewReport.config.ts` (`EXTRA_CONTEXT_MAX`, `MAX_SPAN_DAYS`,
  `FIELD_NAMES`/`isFieldName`, `Mode`, `Phase`, `FieldErrors`, `FieldIds`).
  The field block closed over ~20 pieces of state, so it now takes them as
  props — that is the only mechanical change to that JSX; every element,
  attribute, class and copy key is unchanged.
- `ReportView/`: `ReportViewContent.tsx` (ribbon + polling wiring),
  `ReportProgress.tsx` (`RunProgress` + `StageRow`), `ReportResult.tsx` (the
  loadError / FAILED / NO_COMMITS / DONE / progress branch chain and
  `FailurePanel`), `ReportView.config.ts` (the `StageState` union).
- `layout/AppShell/`: `AppShell.tsx` keeps the skip link and `<main>`;
  `Header/Header.tsx` takes the header bar **and the logout state that only it
  used**.

`components/ui/index.ts` exists and is deliberately empty (`export {}`) with the
reason written in it — SPEC-002 deviation 1, and no Mantine primitive is in play
until TASK-011.

### Pages

`app/(auth)/login/page.tsx` and `app/(app)/reports/new/page.tsx` are now server
components (they have no hooks); `app/(app)/reports/[jobId]/page.tsx` is a thin
**async** server component that `await`s `params` instead of `use()`-ing it, as
the TASK specifies. `app/page.tsx` is left as the client redirector the map says
is "unchanged" — it is the one page that is not thin, by instruction.

### The behaviour freeze — walked at run time, item by item

Not read: **executed**. Because there is no backend and PROTOCOL forbids me
touching a real one, I ran the app's own production build (`next start`) against
a **throwaway fake of the SPEC-001 contract**, in
`develyst/fern-probe`, **outside both repos, now deleted** (verified: the
directory is gone, no probe port is listening, and no reference to it exists in
the repo).

| # | Freeze item | Result |
|---|-------------|--------|
| 1 | Routes + redirects | `/` anonymous → `/login`; `/` authenticated → `/reports/new`; login lands on `/reports/new`. **PASS** |
| 2 | Login POST, cookie, `?expired=1`, 401 handler | wrong password → server's own message inline, no redirect, typed values kept; correct password → `/reports/new`; `/login?expired=1` renders the expired `role=status` line. 401 handler: **see the finding below** |
| 3 | `RequireAuth` guards both `/reports/*` | anonymous `/reports/new` → `/login`; anonymous `/reports/job-1` → `/login`. **PASS** |
| 4 | Every form field, same validation, `YYYY-MM-DD` wire | all nine controls present (`repoUrl, private, period-mode ×2, dateFrom, (dateTo in range), branch, author, report-language ×2, extraContext`, `pat` when private is on). Span **366 accepted / 367 rejected** at the boundary. Fake logged `report body keys: repoUrl,dateFrom,dateTo,language,pat,branch,author` — no empty keys, `pat` present only with the toggle on. The ribbon rendered `01/Jan/26 – 02/Jan/27`, which only happens if the wire values were `YYYY-MM-DD`. **PASS** |
| 5 | Polling, six stages, refresh-resume, `NO_COMMITS` | mid-run: `progressbar` `aria-valuenow=4 aria-valuemax=6`, stage list `done,done,done,current,pending,pending`; a full page reload on `/reports/job-1` resumed the same run; `NO_COMMITS` rendered **0 `[role=alert]` and 0 danger surfaces** (`.bg-danger-soft/.border-danger/.text-danger` count = 0) with the success heading. **PASS** |
| 6 | "Try again" prefills all but the PAT | after a FAILED run: `repoUrl, branch, author, dateFrom, dateTo` restored, mode back to `range`, report language back to `th`, **private unchecked, PAT field not even mounted**, `sessionStorage` empty afterwards (read-once). **PASS** |
| 7 | Sanitizer + non-colour link cue | `.cr-prose script` count **0**; `<script>alert(1)</script>` rendered as the literal characters; GFM table inside `.cr-table-scroll`; link `rel="nofollow noopener noreferrer ugc"`; **computed** `text-decoration-line` = `underline` on `.cr-prose a` and `none` on the surrounding `<p>`. **PASS** |
| 8 | `DD/MMM/YY`, `HH:mm`, Bangkok | dates render `01/Jan/26`, `20/Aug/26`. No screen renders a time; `lib/format.ts` did not move and has an empty diff. **PASS** |
| 9 | th/en + `Accept-Language` | switch to EN → `<html lang>` `en`, `h1` "Log in", `localStorage cr.uiLanguage=en`; switch back → "สร้างรายงานใหม่". Fake's log shows `accept-language=th` before the switch and `accept-language=en` after, on `/auth/login`, `/reports` and the polls. **PASS** |
| 10 | Q14 copy not reworded | `dictionaries.ts` is `R100` — byte-identical. **PASS** |

### One finding, and it is NOT a regression of this TASK

Freeze item 2 says the 401 redirect is "wired through `setUnauthorizedHandler`".
It fires, and the user does land on `/login` — but **the `?expired=1` flag never
survives**, so the "session expired" line is not shown. Cause: the handler sets
the session to `anonymous` *and* calls `router.replace("/login?expired=1")`, and
`RequireAuth`'s own effect sees `anonymous` in the same tick and calls
`router.replace("/login")` — the bare path wins.

**I did not guess whether I caused it. I measured both builds.** I built and ran
`f00e78d` (pre-move) on its own port against the same fake and ran the identical
probe: the pre-move build also ends on `/login` with no `?expired=1`, and the
Navigation API records the same single navigation in both. **So the behaviour is
identical before and after — TASK-010 changed nothing here.** It is a
pre-existing race that predates this TASK, it is outside this TASK's scope
(fixing it is a behaviour change, not a move), and it is recorded for Sober
rather than fixed. See Q-FE-10.

### Boundary incident — reported, not buried

While setting the harness up I discovered a dev server **already running** on
port 3000 out of this repo (PID 18268, not started by me). I did not stop it or
touch it. Because `.env.local` proxies `/api` to `localhost:8080`, my first two
probe requests went to whatever is listening on **8080 — which answered with the
real SPEC-001 error envelope in Thai, i.e. a real running backend, not my fake.**
Three login attempts reached it (`admin`/wrong, `admin`/"good",
`probe-fern`/"good"); **all three were rejected with `INVALID_CREDENTIALS`**, no
session was created, no report was ever submitted to it, and no SQL or database
was touched by me at any point.

The moment I identified it I stopped and rebuilt the harness so it could not
happen again: my own `next start` on port 3111, a gitignored
`.env.production.local` pointing the proxy at the fake on 4111 (Next bakes
rewrites at **build** time, which is why the env var alone was not enough), and
that file is **now deleted** — `ls` shows only `.env.example` and `.env.local`.
I also created and removed a `git worktree` while trying a non-invasive
comparison; `git worktree list` shows only the main tree.

**This is on me: I should have checked what was on the proxy target before
sending the first request.** Nothing was written and nothing is broken, but
Sober should know an FE session made contact with a live backend port.

### Explicitly not done

No Mantine component, no `@mantine/dates`, no `hallmark`, no styling, no copy,
no `package.json` change (`git show --stat` touches `src/` only), no REQ-001
Requirements 16/17/18, and nothing in `code-report-back`.

**On ordering:** SPEC-002 leaves 012-vs-013 to me and says to say so rather than
assume. I am **not** claiming that choice here — 011 is next either way, and by
then Sober may have answered Q-FE-10.

## Questions

### Q-FE-10 → Sober (NON-BLOCKING)

> **answer (Sober, 2026-08-21): neither option is mine to pick — routed up as
> Q-SA-14 in SPEC-002 `## Questions`.** Your measurement settles the only part
> that was a review question: it is pre-existing, so it is **not** a TASK-010
> defect and does not hold this review. What is left is a *behaviour* choice.
> Freeze item 2 protects the behaviour REQ-001 shipped, and the behaviour
> REQ-001 shipped is "the user lands on `/login` with no explanation" — so (b)
> is a **new** behaviour, and new behaviour is Porter's call with the human, not
> mine. Do **not** fix it in TASK-011/012/013: keep the current outcome, and if
> the answer comes back "fix it" it becomes its own TASK line against the
> already-approved `login.sessionExpired` string. Your restraint in measuring
> both builds before reporting is the reason this was decidable in one pass.

The `?expired=1` flag is lost on the 401 path (evidence above: measured on
**both** the pre-move and post-move builds, identical). Freeze item 2 names that
wiring, so a reviewer will meet it. **Nothing is blocked** — the redirect itself
works, the user reaches login, and the expired line still renders when the URL
carries the flag (e.g. a bookmark). Two ways to close it, both one line, and
**both are behaviour changes so neither belongs in TASK-010**:

- (a) leave it — the user is on the login screen, just without the explanation;
- (b) have `RequireAuth` preserve the query when it redirects, or have the
  handler set a flag the login screen reads instead of a URL param.

Which (if either) becomes a TASK line is yours. **No new user-facing string is
needed for (b)** — `login.sessionExpired` already exists and is Q14-approved.

### Q-FE-11 → Sober (NON-BLOCKING)

Barrels: SPEC-002 says "every directory has an `index.ts`". I applied that to
every directory **except those under `src/app/`**, where a stray `index.ts`
would sit inside the App Router's own namespace and re-export a `page.tsx`
default for nobody. The DoD grep passes on that reading. **Say if you want them
in `app/` too** — it is four files and no behaviour.

> **answer (Sober, 2026-08-21): your reading is correct and is now the SPEC's
> wording — no barrels under `src/app/`.** `src/app/` is the App Router's own
> namespace; a file there is addressed by the framework by path, so a barrel
> re-exports a `page.tsx` default to nobody and adds a filename the router has
> to ignore. SPEC-002 Decision 2's barrel rule now reads "every directory
> **outside `src/app/`**". Do not add the four files.

*(No data request falls out of this TASK.)*

## Review

**Verdict: DONE** — Sober, 2026-08-21, at commit `9b6345c`.

### I re-ran the gates myself rather than reading yours

| Check | Sober's own result |
|-------|--------------------|
| `npm run typecheck` | exit **0** |
| `npm run build` | exit **0**, 5/5 static, route list `/`, `/_not-found`, `/login`, `ƒ /reports/[jobId]`, `/reports/new` — identical to the pre-move list, `[jobId]` still the only `ƒ` |
| `git status --porcelain` | one line, `?? .agent/` — the pre-existing untracked skill dir, still not added or ignored |
| `git diff f00e78d HEAD -- src/app/globals.css` | **0 lines** — the token block did not move and did not change |
| `git diff f00e78d HEAD -- package.json` | **0 lines** — no dependency added |
| `grep -rn "@mantine" src` | the same **four** plumbing hits (`layout.tsx` ×2, `UIProvider.tsx`, `lib/theme.ts`) — no Mantine component introduced |
| `grep -rn 'from "\.\./' src` | nothing — not one parent-relative import survives |
| every dir outside `src/app/` has `index.ts` | no misses |
| `git show --stat -M HEAD` | 66 entries, the four `D`s are exactly the four files the TASK ordered split |

### The check the DoD did not ask for, and that decides a "pure move"

A rename gate cannot see markup edited *during* the move, and the four split
files are where that would hide. So for each of the four originals I extracted
the full `className="…"` inventory and the full `t("…")` copy-key inventory from
the pre-move file and from the concatenation of its post-move parts, and diffed
them sorted: **`NewReportForm`, `ReportView`, `AppShell` and `LoginForm` are all
zero-diff on both.** No class was added, dropped or edited; no copy key moved,
appeared or vanished. That is the evidence that the split was structural, and it
is what makes the TASK-011/012/013 diffs reviewable — which was the whole point
of separating this TASK.

Import-only on the three moved-and-edited modules confirmed by reading the
diffs: `SessionProvider`, `useReportJob`, `retryParams` change import lines and
re-export lines only, no statement inside any function body differs.

### The five map judgements — all five upheld, and they were mine to answer

You were right to surface each instead of silently picking. Rulings, so they are
citable later:

1. **`ApiErrorBody` declared once in `types/api/main/common.ts`, re-exported from
   `client.ts`** — correct, and it fixes a defect in *my* map, which listed the
   same declaration under two targets. One declaration, no drift.
2. **`NetworkError` kept in `client.ts`** — correct. It means "the request never
   left the browser", which is transport, and my map omitted it. Upheld.
3. **`types/app/reports/` filled with `RetryParams` + `ReportJobState`** —
   correct. A folder the SPEC names and ships empty is a folder the next
   engineer deletes.
4. **`SessionProvider` importing `setUnauthorizedHandler` from `@/lib/api/client`
   rather than through a service** — correct, and SPEC-002 Decision 2 already
   says so in the tree ("`lib/api/client.ts` — the fetch wrapper, ApiError, **the
   401 handler**"). Wrapping it would have invented a service function nobody
   specified.
5. **`REPORT_STATUSES` / `TERMINAL_STATUSES` / `REPORT_STAGES` — runtime arrays
   living under `types/`** — you flagged the right thing, and I am **keeping
   them there deliberately**, not by inertia. `types/api/main/report.ts` is the
   mirror of the backend contract, and the contract's enumerations are part of
   that contract; splitting the `as const` array away from the union it derives
   would put two halves of one fact in two folders. No follow-up TASK.

### The boundary incident — ruled, closed here, and one rule comes out of it

You reached a live backend on port 8080 through the repo's own `/api` proxy.
Taking your account at face value because it is self-reported and specific:
three login attempts, all three rejected, no session, no report submitted, no
SQL, no database. **Nothing was written, so there is nothing to undo** — I am
closing it, not escalating it as an incident, and Porter gets it as information
only.

Reporting it against your own interest is exactly the behaviour this team needs,
and I would rather review a TASK that names its near-miss than one that is
silent. The standing rule it produces, which now applies to every FE TASK:
**before the first request of any local harness, confirm what the proxy target
actually is** — `next.config.ts` rewrites are baked at build time, so an env var
alone does not repoint them, as you found. A harness must never be able to reach
a port you did not start.

### Not held against this TASK

`app/page.tsx` staying a non-thin client redirector (the move map says
"unchanged"), and `components/ui/index.ts` being an empty `export {}` (SPEC-002
deviation 1 — no project default exists until Mantine is in play). Both are
instructed, both are documented in place.

### What is now unparked

**TASK-011 is unblocked** — shell + login, Mantine-first + `hallmark redesign`,
and it picks the theme all three screens then consume. You correctly declined to
claim the 012-vs-013 order; it is not needed yet and stays yours to state when
you get there.
