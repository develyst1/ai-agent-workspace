# TASK-006: FE — app shell, login screen, session handling, i18n scaffold
- Source: SPEC-001
- Status: DONE (Sober, 2026-08-20 — see `## Review`)
- Assignee: Fern (FE)
- Depends on: none for the UI; TASK-002 for a live backend

## What to do

Repo: `C:\Users\Admin\develyst\code-report\code-report-front` (empty, git initialized).
Stack: Next.js + React + TypeScript + Mantine + Tailwind, per the workspace
`FRONTEND-STANDARD.md`. **That file's §3 is part of this task's Definition of Done.**

1. **Scaffold + one token system.** Set up the Mantine theme and Tailwind so that
   **one** token source drives every colour and font (FRONTEND-STANDARD §1 — the
   named sin is mixing a Mantine theme with a second Tailwind colour scale).
   OKLCH, no `#000`/`#fff`, one accent, display + body face pairing.
2. **App shell** — header with the product name, language switch for the **UI**
   (th/en → sent as `Accept-Language`), and **logout**.
   **No user menu beyond logout**: no profile page, no password page, no user
   admin, no report-history list (SPEC-001 "Frontend"; REQ-001 §10.3, §10.4, §12).
3. **Login screen** — username, password, submit. Wrong credentials → inline
   error, **field values preserved**. **No "forgot password" link and no "create
   account" link anywhere** (REQ-001 §10.2/§10.4 acceptance criteria).
4. **Session handling** — the session is an HttpOnly cookie set by the backend,
   so the client never reads or stores a token. On mount, call `GET /api/auth/me`
   to decide authenticated/anonymous; any `401 AUTH_REQUIRED` from any call
   redirects to login with a "session expired" message. All fetches use
   `credentials: "include"`.
5. **API client module** — one place that sets the base URL, `Accept-Language`,
   `credentials`, and surfaces `{error:{code,message}}`. **Display the server's
   `message` as-is; never compose error text from a code** (SPEC-001 "API").
6. **i18n** — th/en UI strings in one dictionary module, `th` default. Dates
   `DD/MMM/YY`, times `HH:mm`, one helper (FRONTEND-STANDARD §2).

Backend base URL: see `## Questions` — build against the stated default.

## Definition of Done
- [x] `npm run build` and `tsc --noEmit` pass.
- [x] **FRONTEND-STANDARD §3 gate, all six items**, evidence pasted here:
      `hallmark audit` verdict better than "reads as AI-generated"; responsive at
      375/768/960; 8 states on every control with an **instant** focus-visible
      ring; contrast 4.5:1 body / 3:1 UI; `grep` of the diff for inline hex /
      `font-family` / arbitrary `z-index` / `transition-all` → **zero hits**;
      no applicable anti-pattern.
- [x] `grep -rniE "forgot|sign ?up|register|create account|change password|profile" src/`
      returns nothing that renders such a link or screen — paste the output.
- [x] Manual check against a running backend: correct login lands on the report
      form; wrong password shows an inline error with the typed username still in
      the field; logout returns to login; a deleted/expired cookie sends the next
      navigation back to login.
      **All four behaviours verified — but against a local FAKE of the three auth
      endpoints, not `code-report-back`, which does not exist yet (TASK-002 is
      still `TODO`). See Q-FE-3.**
      **Sober 2026-08-20: accepted as met against the SPEC-001 contract (Q-FE-3
      answer (a)). The same four flows are now an explicit numbered run in
      TASK-009, where they are proved against Jason's real backend.**
- [x] The password field is `type=password` with `autocomplete` set appropriately
      and is never written to localStorage/sessionStorage.

## Implementation Notes

### What was built

Repo `code-report-front` was empty; it is now a Next 16.3.1 / React 19.2.8 /
TypeScript (strict + `noUncheckedIndexedAccess`) / Mantine 9.5.1 / Tailwind
3.4.19 app. `npm` is the package manager because the DoD names `npm run build`.

Config: `package.json`, `tsconfig.json` (`@/*` → `./src/*`), `next.config.ts`,
`postcss.config.mjs`, `tailwind.config.ts`, `.env.example`.

| File | What it is |
|------|-----------|
| `src/app/globals.css` | **The token block.** Every colour, face, space, radius, z-level and easing in the app is declared here once, in OKLCH. Also the 8-state CSS for buttons, fields and the language switch. |
| `tailwind.config.ts` | Tailwind owns no values — each colour/font/space/z entry is `var(--token)`. Tailwind preflight is **off** so Mantine's reset is the only reset. |
| `src/lib/theme.ts` | Mantine theme — likewise pointers at the same `var(--token)` properties. This is the "one token source" the standard asks for: Mantine and Tailwind are two thin faces on one system. |
| `src/app/layout.tsx` | The only font declarations in the app: Trirong (display, serif, Thai+Latin) + IBM Plex Sans Thai (body) + IBM Plex Mono, via `next/font`. |
| `src/app/providers.tsx` | `MantineProvider` → `I18nProvider` → `SessionProvider` (session reads the language to send as `Accept-Language`). |
| `src/lib/api/client.ts` | The one place that talks to the backend: base URL, `Accept-Language`, `credentials:"include"`, `{error:{code,message}}` envelope, 401 handler hook. |
| `src/lib/i18n/dictionaries.ts` + `I18nProvider.tsx` | th/en strings in one module, `th` default; `document.documentElement.lang` follows. |
| `src/lib/format.ts` | The one date/time helper — `DD/MMM/YY`, `HH:mm`, Asia/Bangkok. |
| `src/lib/session/SessionProvider.tsx` | `GET /api/auth/me` on mount; login/logout; central 401 → `/login?expired=1`. |
| `src/lib/useDelayedFlag.ts` | 150ms delay-show for spinners (see the audit's one fixed minor). |
| `src/components/AppShell.tsx` | Header: product name, `displayName`, language switch, logout. Nothing else. |
| `src/components/LoginForm.tsx` | Login screen. |
| `src/components/LanguageSwitch.tsx` | Two real radios — works on tap and on keyboard, never hover-only. |
| `src/components/RequireAuth.tsx` | Guard for authenticated routes. |
| `src/app/page.tsx`, `login/page.tsx`, `reports/new/page.tsx` | Routes. |

`AGENTS.md` / `CLAUDE.md` at the repo root are **generated by `next dev` itself**
(`next/dist/server/lib/generate-agent-files.js`) and re-appear if deleted; they
are left in place deliberately, not authored by me.

### Deliberate non-additions (so review does not read them as omissions)

- **`/reports/new` renders only its heading.** The new-report form is TASK-007.
  The route exists so the post-login destination is real and the guard is
  testable end to end; I did not start TASK-007's fields.
- **No dark mode.** hallmark has a dark recipe, but neither REQ-001 nor SPEC-001
  nor this TASK asks for one, and the token block is written so adding it later
  is one `@media`/`[data-mantine-color-scheme]` block over the same hue anchor.
- **No Mantine widgets on the login screen.** The three controls are semantic
  HTML driven by the `.cr-*` classes, because that is what let me pin all eight
  states and an un-transitioned focus ring exactly. `MantineProvider` and the
  theme are wired and token-bound so TASK-007/008 (date pickers, textarea +
  counter, progress) can use Mantine components and inherit the same system.
- **No state manager, no HTTP library, no test runner.** Not asked for; two
  screens and three endpoints do not need them.

### Evidence

**1. `tsc --noEmit` and `npm run build`**

```
$ npx tsc --noEmit
tsc clean            (exit 0, no output)

$ npm run build
▲ Next.js 16.3.1 (Turbopack)
✓ Compiled successfully
  Finished TypeScript in 2.2s
✓ Generating static pages (5/5)
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /login
└ ○ /reports/new
```

**2. FRONTEND-STANDARD §3, item 5 — one token source (greps, zero real hits)**

```
### inline hex
src/app/globals.css:13:   is no #000 and no #fff anywhere in this file.     <- prose in a comment

### font-family declarations
src/app/globals.css:41:  ... no rule anywhere else in src/ declares a font-family.   <- prose in a comment

### arbitrary z-index          (no matches)
### transition-all
src/app/globals.css:72:  ... that could ever be spelled `transition-all`.    <- prose in a comment

### rgb()/hsl() colour functions   (no matches)
### arbitrary Tailwind values ([12px] etc.)  (no matches)
```

Every hit is prose inside a comment; nothing declares or renders. Runtime
confirmation on the login screen: `gradient backgrounds=0  box-shadows=0`,
`italic elements = 0`, and the only font families rendered are
`IBM Plex Sans Thai | Trirong` (`__nextjs-Geist` is the dev-overlay font, absent
from the production build).

**3. FRONTEND-STANDARD §3, item 4 — contrast** (computed in the browser from the
live tokens: CSS `lab()` → XYZ D50 → Bradford → sRGB → WCAG ratio)

```
PASS  16.25:1 (min 4.5:1)  ink on paper — body + headings
PASS   7.44:1 (min 4.5:1)  muted on paper — field labels, helper
PASS   6.81:1 (min 4.5:1)  muted on paper-2 — header caption
PASS   4.27:1 (min 3.0:1)  neutral on paper — icon / boundary
PASS   3.62:1 (min 3.0:1)  rule-strong on paper — input border
PASS   4.57:1 (min 3.0:1)  accent-ring on paper — focus ring
PASS   6.93:1 (min 4.5:1)  paper on accent — primary CTA label
PASS   9.64:1 (min 4.5:1)  paper on accent-strong — CTA hover/loading
PASS   6.93:1 (min 4.5:1)  accent on paper — link / active
PASS   6.30:1 (min 4.5:1)  accent on accent-soft — active lang segment
PASS   6.78:1 (min 4.5:1)  danger on danger-soft — inline error text
PASS   7.37:1 (min 4.5:1)  paper on danger — button error state
PASS   6.50:1 (min 4.5:1)  paper on success — button success state
PASS   3.51:1 (min 3.0:1)  neutral on paper-3 — disabled button label
```

**4. FRONTEND-STANDARD §3, item 3 — 8 states + instant focus ring**

States are declared per control in `globals.css`: default · hover ·
`:focus-visible` · `:active` · `:disabled`/`[aria-disabled]` ·
`[data-loading="true"]` · `[data-state="error"]` · `[data-state="success"]`
(buttons), and the same eight on `.cr-field` via `[data-state]`.

Measured with a real keyboard Tab (programmatic `.focus()` does not match
`:focus-visible`, so it proves nothing):

```
activeElement = input[text]
matches :focus-visible = true
outline-width=2px style=solid color=lab(47.69 46.94 65.88)  offset=2px    <- --color-accent-ring
transition-property = border-color, background-color        <- no `outline`, no `all` => instant
submit transition-property = background-color, border-color, color
```

Error state observed live: `field data-state = error`, `submit data-state =
error`, `aria-invalid = true`, error box `role="alert"` linked by
`aria-describedby` (verified true).

**5. FRONTEND-STANDARD §3, item 2 — responsive at 375 / 768 / 960**

Login screen and app shell, both measured at all three widths:

```
LOGIN @ 375x812 / 768x1024 / 960x900
  scrollWidth == clientWidth  -> h-scroll: no          (all three)
  elements overflowing right edge: 0                   (all three)
  clickable labels rendering on 2+ lines: 0            (all three)
  interactive targets under 44px tall: 0               (all three)
  html overflow-x = clip                               (never `hidden`)

SHELL @ 375x812 / 768x1024 / 960x900
  scrollWidth == clientWidth  -> h-scroll: no          (all three)
  overflowing right edge: 0                            (all three)
  "TH" 59x44 lines=1 ok | "EN" 58x44 lines=1 ok | "ออกจากระบบ" 139x44 lines=1 ok
```

One fix was made because of this pass: the language segments measured 36px tall
and were raised to 44px.

**6. `grep` for forbidden auth surfaces**

```
$ grep -rniE "forgot|sign ?up|register|create account|change password|profile" src/
src/components/AppShell.tsx:12: * There is deliberately NO user menu beyond logout — no profile, no password
src/components/LoginForm.tsx:16: * There is no "forgot password" link and no "create account" link, here or
src/lib/api/client.ts:57:      * session-expired message". The session provider registers the redirect here so
```

Three hits, all prose in comments (the third is the word "regi**ster**s"). None
renders a link or a screen. Structural proof from the running login screen:

```
--- every link/anchor on the login screen ---
  (none)
--- every button on the login screen ---
  <button>Log in</button>
full visible text = "Interface language | TH | EN | Code Report | Log in |
  Your session has expired. Please log in again. | Username | Password | Log in"
```

Zero `<a>` elements exist on the login screen, so there is nothing to click
toward a flow that does not exist.

**7. Password handling**

```
password input autocomplete = "current-password"  type="password"
username input autocomplete = "username"
document.cookie visible to JS = ""            <- HttpOnly; the client never holds a token
localStorage after a full login+logout cycle = {"cr.uiLanguage":"en"}
sessionStorage after a full login+logout cycle = []
```

The only thing this app ever writes to storage is the UI-language preference.

**8. Behaviour — the four DoD flows** (against the fake backend; see Q-FE-3)

```
wrong password -> "Login failed — Wrong username or password."  | username still "somchai"
   (server's own message, shown verbatim; both fields preserved)
correct password -> /reports/new | shell header "Code Report" / "Somchai Prasert"
logout -> /login | login form back = true
dead cookie + navigate to /reports/new -> /login   (report form never rendered)
/login?expired=1 -> notice "Your session has expired. Please log in again."
```

`Accept-Language` is proven end to end by the error copy: with the UI on `th`
the same wrong-password attempt returned
`"เข้าสู่ระบบไม่สำเร็จ — ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"`, and after switching the
switch to EN it returned `"Login failed — Wrong username or password."`. The
frontend composed neither string.

### `hallmark audit` — self-audit before review (FRONTEND-STANDARD §4)

Run against `references/anti-patterns.md` at
`smart-scheduler/smart-scheduler-front/.agents/skills/hallmark/`. Findings in
the skill's own format:

```
[major] Spinners that flash — src/components/LoginForm.tsx (submit button)
  a local login answers in <150ms, so the spinner appeared and vanished as a glitch
  → FIXED: src/lib/useDelayedFlag.ts delays the spinner 150ms; the button still
    disables instantly. Applied to the logout button too.

[minor] Hit target under 44px — src/app/globals.css (.cr-segmented label, 36px tall)
  the language switch is a primary tap target on a phone
  → FIXED: min-height raised to 44px on both axes.

[minor] Skip-link focus target 36px tall — src/components/AppShell.tsx
  keyboard-only, so not a tap target, but tight
  → FIXED: focus padding py-2 → py-3.

[note] No dark mode — hallmark documents a dark recipe
  → NOT FIXED, and deliberately: no REQ/SPEC/TASK line asks for one. Raising it
    as scope would be inventing scope. The token block is structured for it.

[note] Structural variety cannot yet be judged — only two screens exist.
  Re-audit when TASK-007 and TASK-008 land, so the three screens can be compared
  for the templating fingerprint (the tell hallmark exists to catch).

Checked and clear: purple-gradient hero · Inter-everywhere · 3-column feature
grid · card-in-card · gradient headline · side-stripe card · full-viewport
centred hero · pure black/white · AI nav · AI footer · aurora blobs · floating
orbs · lazy LCP · bounce/elastic easing · centred everything · italic headers ·
eyebrows · tag-left/header-right section heads · shadow-glow · icon-tile cards ·
glassmorphism · hover-only affordances · missing tabular-nums · animate-on-scroll
· mismatched icon sets (lucide only) · AI illustration · invented metrics
(the only figure on screen is the real displayName from /auth/me) · emoji icons ·
re-drawn chrome · token improvisation · two-line clickables · Lottie · Three.js ·
transition-all · hover:scale-105 · animated hover gradients · cursor followers ·
carousels · celebratory success toast (there is no toast) · over-confirm modal ·
straight quotes · double-hyphen dashes · z-index:9999 · uniform section padding ·
100vw.

Pre-emit self-critique: P4 H4 E5 S4 R5 V3
  (V3 — variety is unprovable on a two-screen app; nothing below 3.)

Summary — 0 critical · 1 major (fixed) · 2 minor (fixed)
Verdict — close, fix the minors
```

Verdict is one band better than the "reads as AI-generated" floor the DoD sets.

### One defect found and fixed during verification (worth Sober's eye)

The three `next/font` variables were first placed on `<body>`, while
`--font-display`/`--font-body`/`--font-mono` are declared on `:root`. A custom
property's nested `var()` is substituted **where the property is declared**, so
all three tokens resolved to the guaranteed-invalid value and *both* faces were
silently dropped — the page rendered in Times New Roman and looked plausible.
It was caught only by asserting `getComputedStyle(...).fontFamily` at runtime,
not by the build, which was green throughout. The variables now sit on `<html>`,
and `layout.tsx` carries a comment saying why.

## Questions

- **Q-SA-5 (NON-BLOCKING, raised by Sober 2026-08-20, with Porter):** how the
  frontend reaches the backend in the stakeholder's deployment is a real-world
  fact Sober does not have, and a cross-site setup would change the session
  cookie's `SameSite`/CORS design. **Build against this default:** frontend and
  backend are served on the **same origin**, with `/api/*` proxied to the
  backend; the API base URL is `NEXT_PUBLIC_API_BASE_URL`, defaulting to `/api`.
  Keep every fetch behind the API client module so a change is one edit.

(Fern asks; Sober answers as `> answer: ...`)

- **Q-FE-1 (NON-BLOCKING — copy confirmation, same class as Q-BE-2/Q-SA-4).**
  Every user-facing string in `src/lib/i18n/dictionaries.ts` is copy **I
  authored**. REQ-001 and SPEC-001 name the screens and fields, not their
  labels, and supplied no Thai wording at all. Two specific items the
  stakeholder may have an opinion on:
  1. **The product name shown in the header and on the login screen is
     "Code Report"** — I took the project code literally rather than invent a
     name. If he wants something else (in Thai, or a different English name),
     it is one line.
  2. The Thai labels: `เข้าสู่ระบบ` / `ชื่อผู้ใช้` / `รหัสผ่าน` / `ออกจากระบบ` /
     `สร้างรายงานใหม่`, and the two client-side messages
     `เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง` and
     `ติดต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง`.

  Nothing waits on this — one module, one line per string. Please put it to
  Porter when he next collects copy questions.

  > answer (Sober, 2026-08-20): **Correct not to invent, and it is with Porter
  > now.** I am routing it as one copy bundle together with Q-BE-2 (Jason's
  > th/en error strings) and Q-SA-4, because they are the same class of question
  > and the human should see the product's whole voice once rather than in three
  > instalments. **Do not change any string on your own judgement** — including
  > "Code Report" — until Porter brings an answer back through me. Keep building
  > TASK-007/008 against the current dictionary; a reword stays a copy edit for
  > as long as every string lives in `dictionaries.ts` and nothing is hardcoded
  > in a component. That property is now a review item on every FE task.

- **Q-FE-2 (NON-BLOCKING for TASK-006, but TASK-007/008 need it answered
  first).** FRONTEND-STANDARD §2 says dates render `DD/MMM/YY`. `MMM` is a
  **month abbreviation**, and the app is bilingual, so the standard does not
  settle two things for the Thai UI:
  1. Thai month abbreviation (`20/ส.ค./26`) or English in both languages
     (`20/Aug/26`)?
  2. Gregorian year or Buddhist era (`26` vs `69`)?

  I did **not** guess: `src/lib/format.ts` currently renders English/Gregorian
  in both languages, which is the literal reading of the standard, and the file
  carries a comment pointing at this question. **TASK-006 renders no date at
  all**, so nothing here is user-visible yet — but TASK-007 (date range) and
  TASK-008 (report timestamps) both do, and getting it wrong there is a rework.
  This is a stakeholder preference, so it needs Porter → human, not my judgement.

  > answer (Sober, 2026-08-20): **Agreed on both counts — it is a stakeholder
  > fact, not a design choice, and you were right not to guess.** It is with
  > Porter as of this session, flagged as the one copy/format question that has
  > a downstream cost rather than a cosmetic one.
  >
  > How to proceed while it is open, so TASK-007 is not held up:
  > 1. `src/lib/format.ts` stays exactly as it is (English month, Gregorian
  >    year, Asia/Bangkok). Do not change it on your own judgement.
  > 2. **Every rendered date in TASK-007/008 must go through `formatDate` /
  >    `formatDateTime`** — no `toLocaleDateString`, no inline formatting, not
  >    even once. If that holds, the answer, whatever it is, is a change inside
  >    one file and not a rework of two screens. I will check this specifically
  >    at review.
  > 3. Note the distinction that keeps this cheap: the **wire** format is
  >    unaffected. SPEC-001 sends `dateFrom`/`dateTo` as plain `YYYY-MM-DD`
  >    Gregorian, Asia/Bangkok, and Q-FE-2 changes only what the human reads.
  >    A Buddhist-era answer must never reach the request body.
  > 4. **A date-picker widget is the one place this can leak past `format.ts`.**
  >    If you use a Mantine picker in TASK-007, make sure its display locale is
  >    configurable from the same single point, or the answer lands in two
  >    places instead of one.
  >
  > So: **TASK-007 is clear to start now.** Build the fields, the modes and the
  > payload; if Q-FE-2 is still open when you reach the visible date strings,
  > leave them on the current default and say so in the TASK rather than
  > picking a Thai/BE rendering yourself.

- **Q-FE-3 (for Sober's decision — affects only ONE DoD line, and only
  TASK-006's).** The DoD's fourth item is "manual check against a running
  backend". `code-report-back` has no auth yet: TASK-002 is `TODO`, and
  TASK-001's own last two items are themselves blocked on Q-BE-1. There was no
  backend to check against.

  What I did instead, and want on the record: I wrote a **throwaway local fake**
  of exactly the three SPEC-001 auth endpoints (`POST /api/auth/login`,
  `GET /api/auth/me`, `POST /api/auth/logout` — HttpOnly `cr_session` cookie,
  the `{error:{code,message}}` envelope, th/en by `Accept-Language`) as a single
  node script, ran the frontend against it through the same-origin `/api/*`
  proxy, and exercised all four flows the DoD names. The evidence above is real
  browser evidence of the real components; it is not evidence about Jason's
  code. The script lived **outside both repos and has been deleted** — it is not
  committed, and I did not touch `code-report-back` or any real environment.

  Three ways forward, your call:
  - (a) accept this DoD line as met by the fake now, and re-run it for real as
    part of TASK-009's acceptance run;
  - (b) hold TASK-006 at `REVIEW` for the code and re-open just this line once
    TASK-002 lands;
  - (c) something else you prefer.

  I lean (a) — the contract I built against is SPEC-001's, and TASK-009 already
  exists to prove the two halves meet. But this is a "what counts as done"
  question, which is yours, not mine. **Nothing else in TASK-006 depends on the
  answer, and TASK-007 and TASK-008 can both start regardless** — they build on
  the shell, the API client and the i18n layer, all of which are done and
  verified.

  > answer (Sober, 2026-08-20): **(a), with the re-run written into TASK-009 so
  > it cannot be forgotten.** Reasoning, since this sets a precedent for the
  > next FE task:
  >
  > - **What that DoD line is actually for** is proving the *frontend's* four
  >   behaviours, not proving Jason's code. The contract those behaviours are
  >   defined against is SPEC-001's auth table — status codes, the
  >   `{error:{code,message}}` envelope, the HttpOnly `cr_session` cookie — and
  >   a fake that implements exactly that table exercises exactly that contract.
  >   Your evidence is real browser evidence of the real components.
  > - **Where the gap genuinely is:** nothing here proves Jason's implementation
  >   *matches* the same contract. That is an integration claim, it was always
  >   TASK-009's job, and it is now **run 11** there, naming these four flows
  >   explicitly rather than leaving them implied.
  > - **What I am not doing is (b).** Holding TASK-006 at `REVIEW` for a
  >   dependency that is two tasks away would park finished, verified work
  >   behind a stalled one and tell the board something false about where the
  >   project is.
  > - **The fake was handled correctly** and that is why (a) is available at
  >   all: outside both repos, deleted, nothing committed, `code-report-back`
  >   untouched, no real environment involved. Had it been committed into
  >   `code-report-front`, or had it drifted from the SPEC's shapes to make the
  >   UI pass, my answer would have been different. If you build another one for
  >   TASK-008's polling, hold it to the same three rules: **implement the SPEC's
  >   shapes and nothing else, keep it outside both repos, delete it after.**
  > - One thing to carry into TASK-009's evidence: your fake answered instantly,
  >   so the delay-show spinner and the `data-loading` state were never seen
  >   under a slow response. Real clone + AI latency will exercise them.

- **Note for TASK-007/008 (not a question).** The API client sets
  `Accept-Language` from the UI switch, and SPEC-001 keeps the **report**
  language as a separate `language` field in the POST body. `apiRequest()`
  already surfaces `error.fields` for `VALIDATION_ERROR`, so TASK-007's
  per-field messages have somewhere to land without new plumbing.

## Review

**Sober (SA Lead), 2026-08-20 — verdict: `DONE`.**

Reviewed against SPEC-001 ("Frontend" 1, the Auth table, and the API envelope
rule), this TASK's six items, and FRONTEND-STANDARD §3 as a UI pass per its §4.
I read the real files in `code-report-front/src`; I did not take the pasted
evidence on trust and I re-ran the checkable parts myself.

### Re-verified independently (not copied from Implementation Notes)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | exit 0, no output |
| `npm run build` | green — Next 16.3.1, TypeScript finished, 5/5 static pages, routes `/`, `/_not-found`, `/login`, `/reports/new` |
| token-sprawl greps (inline hex, `font-family`, `z-index`, `transition-all`, `rgb(`/`hsl(`, arbitrary `[12px]` values) | 4 hits, **all prose inside comments** in `globals.css`; zero declarations |
| forbidden-surface grep | 3 hits, all prose in comments (one is the word "**regi**sters") — no link, no route, no screen |

The evidence in `## Implementation Notes` is accurate as written. That is worth
saying explicitly: I checked it because a review that trusts pasted output is
not a review, and it held up.

### Contract conformance (SPEC-001)

- **Auth surface is exactly the three endpoints.** `/auth/login`, `/auth/me`,
  `/auth/logout` and nothing else. No register, no password, no user CRUD — the
  login screen renders **zero `<a>` elements**, so there is structurally nothing
  to click toward a flow that does not exist. This is the requirement the human
  answered four separate questions about (Q6/Q7/Q9/Q10) and it is honoured.
- **The frontend never composes error text from a code.** `client.ts` carries
  `message` verbatim; `dictionaries.ts` contains no server-error strings at all.
  The one fallback string is for `NetworkError` — a failure where no server
  message exists — which is the correct and only exception.
- **`expect401` is the right call and I want it on the record.** A blanket
  "401 → go to login" would have sent a user who mistyped their password to the
  login screen with a *session-expired* notice, hiding the real message.
  `expect401` on `/auth/me` (401 is the normal anonymous answer) and on
  `/auth/login` (401 is `INVALID_CREDENTIALS`, shown inline) separates the two
  meanings of the same status code. `redirecting.current` also stops N in-flight
  calls of one dead session from firing N redirects. Both are the kind of detail
  that only shows up as a bug in week three.
- **Session hygiene.** No token is read or stored, `credentials: "include"`
  throughout, `cache: "no-store"`, and the only thing written to storage is the
  UI-language preference. Consistent with SPEC-001 Non-functional.
- **Language separation is correctly anticipated.** `Accept-Language` (UI) is
  set by the client module; the report `language` field stays a POST-body value
  for TASK-007. SPEC-001 allows them to differ and the code does not conflate
  them.

### UI pass — FRONTEND-STANDARD §3

All six gates pass with evidence. On the two that usually decay first:

- **One token source (item 5).** `globals.css` declares the values; both
  `tailwind.config.ts` and `theme.ts` are pointers at the same custom
  properties. This is the specific failure the standard was written after —
  a Mantine palette plus a second Tailwind scale — and it is genuinely avoided
  rather than merely claimed.
- **Focus ring (item 3).** `outline` on `:focus-visible` only, and the
  `transition` lists `background-color`/`border-color`/`color` — never
  `outline`, never `all`. Measured under a real keyboard Tab, which is the only
  way that check means anything (`.focus()` does not match `:focus-visible`).
- `prefers-reduced-motion` is honoured and colour never carries meaning alone
  (the error state pairs an icon and words with the hue). Neither was demanded
  by the DoD; both are correct.

### The `next/font` defect

The `--font-face-*` variables on `<body>` while `--font-display`/`--font-body`
are declared on `:root` — so nested `var()` substitution happened at the
declaration site, both faces silently vanished, and the page rendered in Times
New Roman while the build stayed green. Flagging it was the right instinct: a
green build proves nothing about computed style, and "looks plausible" is the
worst failure mode there is. The fix is right and the comment in `layout.tsx`
explains *why*, so nobody re-breaks it. **Carry the method into TASK-007/008:
assert `getComputedStyle` for anything the build cannot see.**

### Scope discipline

`/reports/new` renders only its heading, no TASK-007 fields were started, and
the "no dark mode" decision was recorded rather than acted on. Adding a dark
mode nobody asked for would have been inventing scope, and declining to is the
right reading of the rules. Same for the three questions raised instead of
guessed. Nothing in this task invented a requirement.

### Minors — carry into TASK-007, none of them blocks `DONE`

1. **`"lint": "next lint"` cannot run.** No ESLint dependency, no config, and
   `next lint` is gone in Next 16 — so the script fails, and the
   `eslint-disable-next-line` in `SessionProvider.tsx` disables a rule nothing
   enforces. No DoD line asks for lint, so this is not rework. In TASK-007
   either wire a real ESLint config or delete the script; a script that cannot
   run is worse than no script, because the next person assumes it passed.
2. **The first `/auth/me` sends `Accept-Language: th` even for an `en` user.**
   Child effects run before the parent's, so `SessionProvider` fires before
   `I18nProvider` has read `localStorage`. Harmless today (that call renders no
   message), but TASK-008 polls and *does* render server messages — if any
   first-paint call can surface server text, resolve the stored language before
   the first request.
3. **An authenticated user who navigates to `/login` sees the login form.**
   Not in this DoD and not user-visible in normal use. Worth one line in
   TASK-007 or TASK-008.

### One process note — for both engineers, not a defect in this task

`code-report-front` is at "Initial commit" with the whole deliverable
**untracked**; `code-report-back` is in the same state. Two consequences worth
naming: FRONTEND-STANDARD §3 item 5 says "grep **the diff**", and there is no
diff to grep (I greped the working tree instead — the result is the same here,
it will not be once files start changing); and unversioned work is one bad
command from gone. **From now on: commit your work before moving a TASK to
`REVIEW`, referencing the TASK id in the message.** I am not reopening TASK-006
for it — the work is verified and present — but I want it true from TASK-007
and TASK-002 onward. This applies to Jason equally and I will say so in his
review.

### Verdict

`DONE`. This clears both the code pass and the UI pass. Two things I would rather
see repeated than the code itself: the questions were raised instead of guessed,
and the one real defect was found by testing what the build cannot see.

**TASK-007 and TASK-008 are unblocked.** Start with TASK-007 per the answer to
Q-FE-2 above.
