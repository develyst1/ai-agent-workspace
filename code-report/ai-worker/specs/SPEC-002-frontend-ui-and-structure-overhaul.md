# SPEC-002: Frontend UI redesign + folder-structure rebuild (`code-report-front`)
- Source: REQ-003
- Status: ACTIVE
- Written: 2026-08-21 by Sober (SA Lead)

## Overview

REQ-003 is two reworks of one repository, both mandated by the stakeholder and
both confined to `code-report-front`:

1. **Structure** — the repo's folders are rebuilt to the layout published by the
   skill `/anthropic-skills:nextjs-pattern-generator` (REQ-003 Requirement 2/3).
2. **Surface** — every screen is rebuilt out of **Mantine** components
   (Requirement 4) and redesigned through **`hallmark`** (Requirement 1/5).

They are specified together because they touch the same files, and they are
**executed in that order** — moving files is a mechanical, reviewable diff, and
doing it *after* a redesign would mean reviewing a rename and a rewrite in one
diff, where a behaviour regression can hide.

**No backend change, no API-contract change, no new product behaviour.** REQ-003
Requirement 6 freezes the observable behaviour accepted under REQ-001; the
freeze is written out below as a checkable list rather than left as a sentence.

## Ground truth — measured 2026-08-21, not assumed

Read from the working tree at commit `f00e78d`, clean:

- The repo already ships **both** `@mantine/core` + `@mantine/hooks` v9 **and**
  `tailwindcss` v3, exactly as REQ-003 Requirement 4 requires them to stay.
- **Not one screen uses a single Mantine component.** `grep -r "@mantine/core"
  src` returns four hits and all four are plumbing — `layout.tsx`
  (`ColorSchemeScript`, `mantineHtmlProps`, the stylesheet import),
  `providers.tsx` (`MantineProvider`) and `lib/theme.ts` (`createTheme`).
  Every one of `AppShell`, `LanguageSwitch`, `LoginForm`, `NewReportForm`,
  `ReportMarkdown`, `ReportView`, `RequireAuth` is hand-rolled native HTML with
  Tailwind utility classes (29 native elements in `NewReportForm` alone).
  **Recorded because it corrects an expectation on the board:** Q18's original
  framing said "keep both" might be *zero work*. It is not. Mantine is mounted
  but unused, so "every screen starts from Mantine" is a **full rebuild of all
  UI markup on all three screens**, not a confirmation of today's arrangement.
- The token system the standard demands **already exists and is already single**:
  `src/app/globals.css` declares every colour/face/space/radius/z as a CSS custom
  property, and both `tailwind.config.ts` and `src/lib/theme.ts` are pointers at
  those properties. `corePlugins: { preflight: false }` is set, so Tailwind ships
  no reset and Mantine's is the only one.
- Routes today: `/` (redirector), `/login`, `/reports/new`, `/reports/[jobId]`.
- `src/` is 21 files / ~3,061 lines. Everything lives in `components/` (flat) or
  `lib/`; there is no `hooks/`, `services/`, `types/`, `context/` or `constant/`.

## Decision 1 — what "follow the skill's pattern" is taken to mean

The skill publishes **two separable things**: a *folder layout + naming +
layering convention*, and a *base stack* (TanStack React Query, NextAuth, Axios,
dayjs).

**This SPEC adopts the layout, the naming and the layering. It does NOT adopt
the base stack.** No new data-layer dependency is introduced. Reasons, stated so
the decision can be overturned on its merits:

- The stakeholder's words are about **folder structure** every time he mentions
  the skill ("ทั้ง เรื่อง folder structure", "โครงสร้าง folder structure ก็
  เรียนรู้ และทำจากในสกิลเลย"). He never named a library.
- **NextAuth is impossible here without breaking REQ-003 Requirement 6.**
  SPEC-001's auth is the backend's own `POST /api/auth/login` + session cookie +
  `GET /api/auth/me`. Adopting NextAuth would replace an accepted, reviewed
  behaviour and change the API contract — which REQ-003 puts out of scope.
- React Query / Axios / dayjs would buy nothing this app is missing: there are
  exactly three endpoints, one polling loop that already implements the SPEC-001
  2 s→5 s tiering, and a date formatter that is deliberately
  `Intl`-based and Bangkok-pinned. They are cost with no requirement behind them.
- **The cost of being wrong is small and additive**, which is why this does not
  block: if the answer to Q-SA-12 is "adopt the stack", the folders that would
  host it (`services/`, `hooks/`, `lib/api/`) already exist after TASK-010 and
  swapping `fetch` for `axios` inside them is a later, self-contained TASK — not
  a re-do of this work.

**Raised as Q-SA-12 (NON-BLOCKING) to Porter anyway**, because "use the skill"
is the stakeholder's instruction and how wide he meant it is business intent,
not a technical judgement. Work proceeds on the narrow reading meanwhile.

## Decision 2 — the target folder structure

Adapted from the skill's published tree to an app that has no admin area, no
`[system]` param and no NextAuth. **Left column is the skill's rule the folder
comes from** (REQ-003's acceptance criterion asks that a reader can point at it).

```
src/
├── app/
│   ├── (auth)/login/page.tsx            # route group — thin page
│   ├── (app)/reports/new/page.tsx       # route group — thin page
│   ├── (app)/reports/[jobId]/page.tsx   # thin async page, awaits params
│   ├── layout.tsx                       # root layout, mounts UIProvider once
│   ├── page.tsx                         # the `/` redirector
│   └── globals.css                      # THE token block (unmoved on purpose)
├── components/
│   ├── ui/                              # thin Mantine wrappers + barrels
│   ├── common/                          # LanguageSwitch, ReportMarkdown, RequireAuth
│   ├── layout/AppShell/                 # AppShell.tsx, Header/, index.ts
│   ├── providers/UIProvider.tsx         # "use client" — Mantine + theme mount
│   └── partials/
│       ├── Login/                       # LoginContent.tsx, Login.config.ts, index.ts
│       ├── NewReport/                   # NewReportContent.tsx, …Header/…Fields, config, index.ts
│       └── ReportView/                  # ReportViewContent.tsx, …Progress, …Result, config, index.ts
├── hooks/
│   ├── common/useDelayedFlag.ts + index.ts
│   └── reports/useReportJob.ts + index.ts
├── services/
│   ├── auth.service.ts                  # login / logout / me
│   └── report.service.ts                # createReport / fetchReport
├── lib/
│   ├── api/client.ts                    # the fetch wrapper, ApiError, 401 handler
│   ├── api/api-main.ts                  # one typed function per endpoint
│   ├── storage/retryParams.ts           # the "try again" prefill
│   └── format.ts                        # DD/MMM/YY, HH:mm — Bangkok-pinned
├── types/
│   ├── api/main/{common,auth,report}.ts # backend contract shapes
│   └── app/reports/index.ts             # frontend domain types
├── context/
│   ├── session/SessionProvider.tsx
│   └── i18n/I18nProvider.tsx
└── constant/text/                       # the th/en dictionaries
```

**Rules that come with the layout, and are DoD-checkable:**

- **Every directory outside `src/app/` has an `index.ts` barrel** re-exporting
  its public API. **Not `src/app/`**: that is the App Router's own namespace,
  where files are addressed by path and a barrel would re-export a `page.tsx`
  default to nobody. (Clarified 2026-08-21 answering Q-FE-11; TASK-010 already
  shipped on this reading.)
- **No relative import across a feature boundary** — `@/` alias only. (Relative
  imports *within* one partial directory are what the skill's own examples do
  and stay legal.)
- **Pages are thin.** A `page.tsx` unpacks params/guards and renders one
  `…Content` component. In Next 16 `params` is a Promise and is awaited.
- **`"use client"` only where hooks/state/handlers are used**; the `…Content`
  component is the client boundary.
- **Naming**: partial dirs PascalCase, components PascalCase, hooks
  `use*.ts` camelCase, services `*.service.ts`, config `[Feature].config.ts`.

**Two deliberate deviations from the skill's tree, with reasons** (a deviation
nobody wrote down becomes a defect at review):

1. **`components/ui/` holds a wrapper only where the project applies a real
   default** (e.g. a Button that fixes variant/size, an input that carries the
   error/aria wiring). A pass-through file per Mantine primitive would be twenty
   files that add nothing — the skill's point is "project defaults live in one
   place", and a primitive with no project default has none to hold.
2. **No `app/api/auth/[...nextauth]/route.ts`** — see Decision 1. This app's
   frontend has no API routes at all; `/api/*` is proxied to the backend by
   `next.config.ts`.

**URLs do not change.** `(auth)` and `(app)` are route *groups*: parentheses
folders are not path segments. `npm run build` must list the same four routes
after the move as before it — that is the structural proof the move was
behaviour-neutral, and it is a DoD line.

## Decision 3 — Mantine-first, and how Tailwind is stopped from becoming a
second design system

REQ-003 Requirement 4 keeps both tools; `FRONTEND-STANDARD.md` §1 calls two
coexisting colour systems "our biggest sin". Porter correctly routed the
reconciliation here rather than back to the human. The rule:

1. **`globals.css` remains THE token block.** Unmoved, single source. Mantine's
   theme and Tailwind's config stay pointers at it. Nothing else may declare a
   colour, a `font-family`, a z-index or a raw spacing value.
2. **Every screen is composed from `@mantine/core` components.** Native
   `<div>`/`<span>` for pure layout scaffolding is fine; a native `<button>`,
   `<input>`, `<select>`, `<textarea>` or `<label>` in a screen is a defect.
3. **Tailwind may not carry colour or type.** Concretely: no `text-*`, `bg-*`,
   `border-*` colour utility and no `font-*` family utility in `src/`. Colour and
   type reach the screen through Mantine props/`classNames` resolving the same
   tokens. Tailwind keeps layout, spacing, sizing, and one-off geometry — the
   "customising components" job the stakeholder named.
   *This is the concrete answer to §1's "biggest sin": the two systems cannot
   diverge on colour because only one of them is allowed to express it.*
4. ~~**`@mantine/dates` may be added**~~ **WITHDRAWN 2026-08-21 at the TASK-012
   review (Q-FE-16). This SPEC now authorises NO new dependency at all.**

   The original wording authorised `@mantine/dates` "because rule 2 cannot
   otherwise be honoured for those fields". **That premise was mine and it was
   false**, and Fern showed it rather than argued it: `TextInput type="date"` is
   a `@mantine/core` component, so rule 2 *is* honoured for the date fields with
   nothing installed — every control on the screen carries a `mantine-*` class
   and the native-control grep on `partials/NewReport` returns nothing.

   The withdrawal is not merely "the dependency turned out to be unnecessary".
   **`@mantine/dates` cannot be installed alone** — `dayjs` is a declared peer
   dependency on every 9.x release (verified with `npm view`), and `dayjs` is one
   of the four packages **Decision 1 declined** when Q-SA-12 answered
   "เอาแค่โครง". Authorising it would have re-entered a rejected branch sideways.

   The two frozen things hold for free on the shipped control: `<input
   type="date">` exposes `.value` as **`YYYY-MM-DD` by HTML specification**, and
   the **display format stays `DD/MMM/YY`** through `lib/format.ts` — see the
   freeze. This also keeps Q-SA-10 intact: the accepted native picker is still
   the control on screen, so nothing about its OS-locale rendering changed.

   **Consequence for the remaining TASKs: no dependency may be added by this
   SPEC.** A TASK that finds it needs one raises it as a question first.
5. **Nothing is removed.** `tailwindcss`, `autoprefixer`, `postcss-*` all stay
   installed and configured, per Requirement 4's "คงไว้ทั้งคู่".

## Decision 4 — how `hallmark` is applied

- **`hallmark redesign` is the verb**, not a fresh `design` run: the app exists,
  its routes, IA and copy are accepted, and hallmark's own safety rail says
  redesign preserves routes, component ownership, copy intent and information
  architecture, replacing the visual layer. That matches Requirement 1
  ("รื้อทุกหน้า") and Requirement 6 (behaviour survives) exactly.
- **The theme is chosen ONCE, on the first screen, and the other two consume
  it.** hallmark's diversification rule exists so two *briefs* don't look alike;
  three screens of one product are one brief. A theme per screen would be three
  colour systems — the failure mode Decision 3 exists to prevent.
- **The redesign may change the palette.** Q16 deliberately supersedes the
  visual result of TASK-006/007/008, so the current warm-65/accent-45 tokens are
  not protected. If the chosen theme changes them, they change **in
  `globals.css`, as tokens**, and both pointer files follow with no edit.
- **`hallmark audit` is run on each screen before the TASK goes to `REVIEW`**,
  verdict pasted into the TASK — `FRONTEND-STANDARD.md` §3.1 and §4 already
  require this; REQ-003's acceptance criterion 1 points at the same §3.
- **Deletions require an explicit file list** (hallmark's own rail, and this
  team's rule that a diff must be reviewable).

## The behaviour freeze (REQ-003 Requirement 6, made checkable)

Every item below is accepted behaviour from REQ-001/SPEC-001 and **must be
identical after the rework**. This list is the regression checklist for every
TASK in this SPEC:

1. Routes `/`, `/login`, `/reports/new`, `/reports/[jobId]` — same paths, same
   redirect rules (`/` → `/reports/new` when authenticated, `/login` when not).
   **PARTIALLY RELEASED 2026-08-21 by REQ-004 Requirement 4 — SPEC-003 /
   TASK-019 only.** The form→report transition moves from `router.replace` to
   `router.push`, because `replace` overwrites the form's history entry and is
   the reason the stakeholder cannot go back. **Paths and redirect rules are NOT
   released** and no route is added, removed or renamed.
2. Login: `POST /api/auth/login`, session cookie, `?expired=1` handling, the
   401 → login redirect wired through `setUnauthorizedHandler`.
   **PARTIALLY RELEASED 2026-08-21 by Q-SA-14 ("ขึ้นข้อความ") — TASK-015 only.**
   The *silent* redirect is no longer protected: after TASK-015 an expired
   session must **arrive at `/login` with the flag and show
   `login.sessionExpired`**. Everything else in this item is still frozen, and
   the released part becomes the new frozen behaviour once TASK-015 is `DONE`.
3. `RequireAuth` still guards both `/reports/*` routes.
4. The new-report form keeps **every** field — repo URL, PAT, date from/to,
   author, branch, extra context, report language — with the same validation
   (incl. the ≤366-day span) and the same `YYYY-MM-DD` wire values.
   **PARTIALLY RELEASED 2026-08-21 by REQ-004 Requirements 1/1a/2/2a/6 —
   SPEC-003 / TASK-018 only.** Three clauses are released: the **branch** becomes
   a list loaded from the repository instead of free text; the **author/committer**
   becomes a loaded list instead of free text; the two date fields become **one
   range control pre-filled today → today** and the single-day/range switch is
   deleted. **Still frozen inside this item:** the ≤366-day span (client bound
   exactly the server's exclusive one), the `YYYY-MM-DD` wire values, the PAT
   field's rules, extra context and the report-language field.
   *(Bookkeeping: the board and REQ-004 call this "freeze item 3". In this SPEC
   the form fields are item 4; item 3 is `RequireAuth` and stays frozen.)*
5. Report view: polling at 2 s then 5 s after 60 s, stop on terminal status and
   on unmount, resume from the URL after a refresh, the six-stage progress
   display, the `NO_COMMITS` note with no danger surface.
6. "Try again" prefills every field **except** the PAT.
7. Markdown stays sanitized: no `rehype-raw`, raw HTML rendered as inert text,
   `remark-gfm` on, and `.cr-prose a` keeps a **non-colour** cue (underline) —
   the TASK-008 rework finding must survive a restyle.
8. Dates display as `DD/MMM/YY`, times `HH:mm`, both Bangkok-pinned.
9. th/en i18n: both dictionaries intact, the language switch works, and the
   `Accept-Language` header still follows the UI language.
10. The copy bundle closed by Q14 is **not reworded**. A redesign changes
    layout and voice of the *interface*, not approved strings.

## Non-functional

- **Gates on every TASK in this SPEC:** `npm run typecheck` exit 0;
  `npm run build` green and listing the same four routes; working tree clean at
  the reported commit.
- **Token grep (FRONTEND-STANDARD §3.5), extended for Decision 3:** zero inline
  hex/`oklch(`/`rgb(`/`font-family` outside `globals.css`, zero
  `transition-all`, zero arbitrary z-index — **plus zero Tailwind colour/font
  utilities anywhere in `src/`**.
- **Responsive** at 375 / 768 / 960 (§3.2) and hallmark's 320/375/414/768 floor.
- **8 states** on every interactive control, focus-visible ring instant (§3.3).
- **No new dependency at all** (Decision 3.4, amended 2026-08-21 — the
  `@mantine/dates` authorisation is withdrawn and nothing replaces it).
- This repo has **no test runner**; the gates above plus the §3 UI evidence are
  the whole DoD, as they were for TASK-006/007/008.

## Tasks

Written as files in the next SA session; listed here so the shape and the
ordering are on the record now.

- **TASK-010: FE — folder-structure rebuild, no visual change** (depends on: —).
  Pure move/rename to Decision 2's tree, barrels, `@/` imports, thin pages,
  route groups. The diff should read as renames plus import rewrites. DoD
  includes the four-route build list and the whole behaviour freeze.
- **TASK-011: FE — app shell + login, Mantine-first + `hallmark redesign`**
  (depends on: TASK-010). **This TASK also picks the theme** for all three
  screens and lands it in `globals.css`. **The `KnowCode` product-name line
  (REQ-001 Requirement 14, Q12) is folded in here** — the header that carries
  the name is being rebuilt in this very TASK, and renaming it in a later,
  separate TASK would touch the same file twice for one settled string. Only the
  product name changes; nothing else is reworded.
- **TASK-012: FE — new-report form, Mantine-first + `hallmark redesign`**
  (depends on: TASK-011). Carries the `@mantine/dates` decision and the date
  format/validation freeze.
- **TASK-013: FE — report view, Mantine-first + `hallmark redesign`**
  (depends on: TASK-011). Carries the sanitizer and non-colour-link-cue freeze.

**Added 2026-08-21, after all four TASKs above were `DONE`, when the five
answers landed.** Neither is a redesign TASK; both exist because REQ-003 cannot
reach `SPEC_DONE` without them:

- **TASK-015: FE — show the session-expired line** (depends on: TASK-013).
  The one release of freeze item 2, authorised by Q-SA-14. Behaviour only, no
  new string, no redesign.
- **TASK-016: FE — local acceptance hand-over** (depends on: TASK-015).
  Turns Q-SA-15 + Q23 into something openable on the stakeholder's own machine:
  exact commands, port, and the list of pages/states. **This TASK is REQ-003's
  final acceptance criterion becoming actionable** — it does not itself decide
  acceptance; he does, after Porter relays the hand-over.

**Ordering against TASK-009 (SA decision, taking the stakeholder's Q19 answer as
input):** TASK-009's acceptance run is **paused until TASK-013 is `DONE`**. It
stays `TODO`; no status is moved. Reason: TASK-009 is an end-to-end run whose
FE half exercises screens that are about to be rebuilt, so running it now buys
a result that must be thrown away. **The cost is stated, not hidden: TASK-009 is
joint, so this parks Jason as well.** Splitting out its BE-only runs (12: what
the AI service does with `model` and no `provider`; 13: the first real execution
of `createDbJobRepository`'s five statements) is the obvious way to give BE work
in the meantime — it is a separate unit of SA work and is queued, not done here.

**Requirements 17 and 18 stay out**, exactly as REQ-003's Out of Scope says: they
are new behaviour, and folding new features into a redesign is how a rework
becomes unreviewable.

## Questions

### Q-SA-12 — ANSWERED 2026-08-21 — "เอาแค่โครง" = the folder layout only

> answer (2026-08-21, human, verbatim, via Porter): "เอาแค่โครง"
> — transcribed here by Sober 2026-08-21 from REQ-003 `## Questions`
> (Porter may not write in `specs/`).

**Consequence for this SPEC: none — Decision 1 stands as written.** The narrow
reading is confirmed: take the skeleton (folder/naming/layering), not the stack.
The additive "adopt React Query / NextAuth / Axios / dayjs too" branch is
**closed**, and **`dayjs` is one of the four he declined** — which is what made
`@mantine/dates` unauthorisable at the TASK-012 review (Decision 3.4, withdrawn).

*(original question below, kept for the record)*

### Q-SA-12 → Porter → the human (NON-BLOCKING)

**DATA/INTENT question, not a technical one.** The skill the stakeholder named
publishes a folder layout **and** a base stack (TanStack React Query, NextAuth,
Axios, dayjs). This SPEC adopts the **layout, naming and layering only** and
adds **no** data-layer dependency — reasons in Decision 1, the strongest being
that NextAuth would replace the accepted login behaviour REQ-003 Requirement 6
protects and change the API contract REQ-003 puts out of scope.

- **Ask him (in Thai, one line):** "โครงสร้างโฟลเดอร์จากสกิล — เอาแค่รูปแบบ
  โฟลเดอร์/การจัดชั้น หรือให้ลง library ของสกิลด้วย (React Query / Axios /
  NextAuth)?"
- **Why it does not block:** work proceeds on the narrow reading; the folders
  that would host the stack exist either way, so a later "yes" is an additive
  TASK, not a redo.

### Q-SA-13 — ANSWERED 2026-08-21 — "screenshot" = captured images are the form

> answer (2026-08-21, human, verbatim, via Porter): "screenshot, ไปเลย"
> — transcribed here by Sober 2026-08-21 from REQ-003 `## Questions`.

**Consequence: the form of the acceptance evidence is captured images — but this
answer alone had no mechanism**, because no role on this team has a displayable
browser. That gap is what produced Q-SA-15 and then Q23, and it is now closed:
**he captures, we do not.** No TASK in this SPEC carries a "paste screenshots
here" DoD line; **TASK-016** carries the hand-over instead.

*(original question below, kept for the record)*

### Q-SA-13 → Porter → the human (NON-BLOCKING)

REQ-003's last acceptance criterion is **"the stakeholder looks at the reworked
screens and says they are acceptable"** — his own judgement, by his own
instruction. Nobody on this team can put a screen in front of him, and no TASK
can tick that box on his behalf.

- **Ask him (in Thai, one line):** "ตอนตรวจงาน UI อยากดูแบบไหน — สกรีนช็อตแนบใน
  TASK, หรือจะรัน `npm run dev` ดูเองที่เครื่อง?"
- **Why it does not block:** TASK-010 through TASK-013 are written, built and
  reviewed against §3 regardless; this only decides how the final criterion gets
  evidenced.

### Q-SA-14 — ANSWERED 2026-08-21 — "ขึ้นข้อความ" = show the session-expired line

> answer (2026-08-21, human, verbatim, via Porter): "ขึ้นข้อความ"
> — transcribed here by Sober 2026-08-21 from REQ-003 `## Questions`.

**Consequence, and it is the only release of the behaviour freeze in this SPEC:**

- **Freeze item 2 is released for this one outcome.** What REQ-001 shipped is the
  *silent* redirect; the stakeholder has now replaced that outcome. Item 2's
  other clauses (the login POST, the cookie, the `?expired=1` handling on the
  screen, the `setUnauthorizedHandler` wiring) are **not** released. See the
  annotation on freeze item 2 above.
- **It lands as its own TASK — TASK-015 — not inside a redesign TASK.** All four
  redesign TASKs were already `DONE` when the answer arrived, and a behaviour
  change does not belong in a visual diff anyway.
- **No new user-facing string.** `login.sessionExpired` exists in **both**
  dictionaries (verified in `src/constant/text/dictionaries.ts`, th line 41 /
  en line 139) and was approved under Q14, so the copy bundle stays closed.
- **What he did NOT decide, and TASK-015 therefore decides technically:** which
  navigation wins the race. He approved the outcome, not a mechanism.

*(original question below, kept for the record)*

### Q-SA-14 → Porter → the human (NON-BLOCKING)

**Behaviour question, raised out of the TASK-010 review — not a bug report and
not a regression.** When a session expires mid-use, the app sends the reader to
`/login`, and **the "session expired" line is never shown**: the 401 handler
navigates to `/login?expired=1` while `RequireAuth` independently navigates to
the bare `/login` in the same tick, and the bare path wins. Fern proved this by
building and probing **both** the pre-move and post-move builds — the outcome is
identical, so it has been the behaviour since REQ-001 was accepted. The screen
does render the line when the URL carries the flag.

Freeze item 2 protects the behaviour REQ-001 shipped, and what REQ-001 shipped
is the silent redirect. Making the explanation appear is therefore **new
behaviour**, and whether the product wants it is the stakeholder's call, not
mine.

- **Ask him (in Thai, one line):** "ตอนเซสชันหมดอายุกลางทาง ระบบเด้งไปหน้า
  ล็อกอินเฉย ๆ ไม่ขึ้นข้อความว่า 'เซสชันหมดอายุ' (เป็นแบบนี้มาตั้งแต่แรก) —
  อยากให้ขึ้นข้อความไหม?"
- **Why it does not block:** TASK-011/012/013 keep the current outcome either
  way. A "yes" is one self-contained TASK line afterwards, and it needs **no new
  user-facing string** — `login.sessionExpired` already exists and was approved
  under Q14, so the copy bundle stays closed.

### Q-SA-15 — ANSWERED 2026-08-21 — "ก ส่ง URL มา" = we hand over a URL, he looks

> answer (2026-08-21, human, verbatim, via Porter): "ก ส่ง URL มา"
> — transcribed here by Sober 2026-08-21 from REQ-003 `## Questions`.

### Q23 — ANSWERED 2026-08-21 — "localhost" = he opens it on his own machine

> answer (2026-08-21, human, verbatim, via Porter): "Q23=localhost"
> — transcribed here by Sober 2026-08-21 from REQ-003 `## Questions`.

**The two together close the ownerless-criterion gap that started at Q-SA-13:
REQ-003's final acceptance criterion now has an owner (him) and a mechanism (a
server on his own machine).** Consequences for this SPEC:

- **No deployment.** "A link that works from anywhere" is ruled out, so REQ-003
  pulls in no deployment TASK and the parked cookie-`Secure` note stays parked.
- **The DoD line that falls out is mine, and it is written as TASK-016** — the
  hand-over TASK. Its content (which command, which port, which pages/states,
  and the fact that two of the three screens need the backend running) is a
  technical decision and is made there, not here.
- **The hand-over text lives in `tasks/TASK-016…md` and reaches him through
  Porter**, in Thai. It does **not** go in `../project-docs/` — that directory is
  where *he* puts evidence for *us*, and this travels the other way.
- **Ordering: TASK-015 first, then TASK-016.** Handing over screens and then
  changing one of them buys a second look-round for nothing; TASK-015 touches the
  login screen, which is one of the three he will open.
- **One thing neither answer settles, and I have not assumed it → Q-SA-17 in
  TASK-016 `## Questions` (NON-BLOCKING):** whether he also starts
  `code-report-back` against his own PostgreSQL. Without a backend, `localhost`
  shows exactly one of the three reworked screens.

*(original questions below, kept for the record)*

### Q-SA-15 → Porter → the human (NON-BLOCKING for TASK-012/013; BLOCKS REQ-003's final acceptance)

**Follows directly from Q-SA-13's answer, and is not the same question.** The
human answered Q-SA-13 with **"screenshot"** — he wants captured images rather
than running `npm run dev` himself. At the TASK-011 review it became clear that
**no role on this team can produce one**: Fern reported that his session has no
displayable browser pane, so every screenshot attempt returned "the pane is not
displayed". All of TASK-011's UI evidence is therefore *measured* from the
running production build (computed styles, resolved colours, real `Tab`
keypresses, the request log) rather than captured — which is stronger evidence
for every gate **except** the one criterion that is explicitly the stakeholder's
own eyes.

So the mechanism, not the intent, is what is missing:

- **Ask him (in Thai, one line):** "สกรีนช็อตหน้าจอที่รื้อใหม่ — ให้ทีมส่ง URL
  ให้พี่เปิดดู/แคปเอง หรือมีเครื่องที่แคปภาพให้เราได้ครับ?"
- **Why it does not block the build:** TASK-012 and TASK-013 are written, built
  and reviewed against `FRONTEND-STANDARD` §3 either way, and the measured
  evidence does not depend on images.
- **Why it does block acceptance:** REQ-003's last criterion is his judgement of
  the reworked screens. If images are the agreed form and nobody here can make
  them, that criterion has no owner — better known now than at TASK-013.
- **What is still mine, and is not this question:** *which* screens and states
  get captured and *where* the files live. That is a DoD line, it is my queued
  unit, and it is deliberately not written into any TASK until this is answered.
- **FYI for the same conversation, not a separate question:** the product theme
  is now picked (hallmark `cobalt`, TASK-011). Changing it later costs ~20 token
  values in one file and the screens follow, so if the stakeholder wants a look
  before two more screens are built on it, that is this same capture question.

*(Jason/Fern ask here; Sober answers as `> answer: ...`.)*
