# TASK-004: Migrate the `/login` screen to the house pattern (partial + antd primitives + icons)
- Source: SPEC-001 (§Target folder structure, §Decision 3/4/5, §Decision 6 CLOSED)
- Owner: FE (Fern)
- Status: **DONE** — reviewed 2026-09-09, Sober. Verdict and its limits: **§Review addendum,
  2026-09-09 (third)** at the end of this file. In short: the accepted list of the first review
  stands; the screen's **look is an interim state, not the reference** (SPEC-001 §Decision 9 §2)
  and is re-authored in **SPEC-006 Phase 3**. The withdrawn `REWORK` and the `BLOCKED` state are
  history — see the second addendum. **Fern: nothing further is asked of you here.**
- Depends on: TASK-003 (`DONE`) — nothing else gates this. **§Decision 6 is CLOSED: the antd
  provider stays in the ROOT layout. Do not create a route group, do not move the provider.**

This is the **first per-screen migration**. 🔴 **It is NOT the visual reference** — that is the home
screen (TASK-005, `specs/SPEC-006-visual-improvement-pass.md`), per `SYSTEM-FACTS.md` A43. What later
screens copy from here is the **substrate** (thin page + partial, wrapper usage, icons), never the look.
Files as read by Sober in the `dte` repo on 2026-09-09; line numbers are from that read.

## Why this screen, and what "migrated" means here

`/login` is the smallest self-contained screen with a form. "Migrated" means four things and
**nothing else**:

1. the page becomes thin and the screen body moves into `components/partials/Login/`;
2. the raw `<input>` / `<button>` primitives become the `components/ui/` antd wrappers;
3. every emoji on the screen becomes an icon (REQ-001 requirement 3);
4. the screen's own leftovers (hand-rolled spinner SVG, `alert()`) go away.

🚫 **Out of scope, explicitly** — do not do any of these, not even "while I was in there":
- **No visual redesign** (SPEC-001 §Non-functional / REQ-001 §Out of Scope). Same layout, same
  spacing, same gradients, same Thai copy.
- **No new user-facing string, ever.** Every Thai string below is **copied byte-for-byte** from
  today's file. If you find yourself typing Thai that is not already in the file, stop and ask in
  §Questions.
- **No antd `Form` / `Form.Item` / `rules`** — see §Decision A below. Keep the existing
  `<form onSubmit>` + `useState` + native `required`.
- **No `services/api.ts` carve-out** — see §Decision B. `import { authApi } from '@/services/api'`
  stays exactly as it is.
- **No change to `src/app/layout.tsx`**, `AntdConfigProvider`, `ThemeContext`, `AuthContext`,
  `themes.css`, `theme-tokens.ts`, or any other screen.
- **No "remember me" behaviour**, no social-login wiring, no `/forgot-password` page. Those
  controls are dead today and stay exactly as dead.
- **Do not remove `@heroicons/react`** from `package.json` (SPEC-001 §Decision 5: it leaves with
  the last screen). `/login` imports no Heroicons anyway.
- **Do not touch `src/app/login/layout.tsx`** — its `title: 'เข้าสู่ระบบ'` is REQ-005's, already
  `DELIVERED`.

## Decisions already taken for you (do not re-open these; ask in §Questions if one is wrong)

**A — antd `Form` is NOT introduced on this screen.** SPEC-001's per-screen order said the auth
screens would exercise "Form + validation" hardest; that half is deliberately deferred, and the
reason is a hard rule here, not a preference: antd `Form` `rules` need a **validation message
string per rule**, in Thai, and **nobody may invent user-facing copy**. The alternative — antd's
built-in default messages — is English, and switching them to Thai means setting `locale`, which
SPEC-001 §Decision 3 reserves for the SA Lead. So: today's form semantics are preserved exactly
(controlled `useState`, native `required`, `type="email"`, browser validation bubbles). Sober is
raising the validation-copy question with Porter; whichever screen adopts antd `Form` will do it
after the owner has given the strings.

**B — `services/api.ts` is NOT carved up in this TASK.** SPEC-001 §Decision 4 says each screen
carves its own API slice. `/login`'s slice is the **auth** slice — and that slice is shared by
`contexts/AuthContext.tsx`, `/register` and `/verify-email`. Carving it here would edit three
files this TASK cannot verify, on a live site. It gets its own TASK, written by Sober after the
three auth screens land.

**C — the error banner stays Tailwind.** The red `<div>` that shows `error` is a styled block,
not an interactive component; SPEC-001 §Decision 3 gives layout/surfaces to Tailwind. Do **not**
swap it for antd `Alert`. Only the resend `<button>` **inside** it becomes a wrapper.

**D — antd `App` is mounted LOCALLY, never in the root layout.** You need `message` (see §3).
Mount `<App component={false}>` **inside the login partial only** and read it with
`App.useApp()`. `component={false}` matters: the default renders an extra `div.ant-app` that
would sit between the page root and its `min-h-screen` layout. Root-layout mounting is forbidden
here by the standing constraint in SPEC-001 §Decision 6 §CLOSED — anything in the root layout is
paid for by `/` and `/about` too.

**E — no `components/ui/index.ts` root barrel** (FRONTEND-CONVENTIONS.md §2), and **do not add
exports to `components/partials/index.ts`** — leave it `export {};`. A partials root barrel would
pull antd into every module that imports anything from `partials/`, which is the same hazard the
`ui/` barrel ban exists for. The page imports from `@/components/partials/Login` directly.

**F — the two brand SVGs stay inline.** `lucide-react` ships no brand marks. Keep the Google and
Facebook `<svg>` paths byte-for-byte; only the `<button>` around each becomes a wrapper.

## What to do

### 1. Extract the screen into a partial

- Create `src/components/partials/Login/LoginContent.tsx` — `"use client"`, holding what is today
  the `LoginForm` function in `src/app/login/page.tsx` (lines 8–228), plus the `<App
  component={false}>` boundary from §D.
- Create `src/components/partials/Login/index.ts` — `export { default as LoginContent } from
  "./LoginContent";` (FRONTEND-CONVENTIONS.md §1: a barrel re-exports, it does not change a
  component's own export style).
- `src/app/login/page.tsx` keeps **only** the default `LoginPage` export and its `<Suspense>`
  boundary with the **identical** fallback markup, rendering `<LoginContent />`. `useSearchParams`
  stays inside the client partial — that is what the `Suspense` boundary is there for; removing or
  moving it breaks the build.
- Do not add a `Login.config.ts`. There is no configuration to put in it.

### 2. Swap the primitives for the `ui/` wrappers

| Today, in `login/page.tsx` | Becomes |
|---|---|
| email `<input type="email">` (l.117–126) | `BaseInput` (`@/components/ui/Input`), `type="email"`, same `id`, `value`, `onChange`, `required`, `placeholder="your@email.com"` |
| password `<input type="password">` (l.133–142) | `BaseInput`, `type="password"` — **not** antd `Input.Password` and **not** `ui/PasswordInput`: both add a show/hide eye this screen does not have today |
| `จดจำฉัน` native `<input type="checkbox">` (l.147–150) | a **new** wrapper `BaseCheckbox` — see §2a. Still unwired: no state, no handler |
| submit `<button type="submit">` (l.158–176) | `BaseButton` (`@/components/ui/Button`), `type="primary"`, `htmlType="submit"`, `block`, `loading={isLoading}`, `disabled={isLoading}` |
| resend `<button type="button">` (l.100–108) | `BaseButton`, `danger`, `block`, `loading={resendLoading}`, `disabled={resendLoading}`, `icon={<Send size={16} />}` |
| the two social `<button>`s (l.209–226) | `BaseButton`, `block`, `size="large"`, keeping the inline brand `<svg>` and the `<span>` label as children |

Keep every Tailwind class that carries **layout** (`w-full`, `space-y-6`, `grid`, margins). Drop
only the classes the antd component now owns (its own background, border, radius, focus ring,
disabled opacity). If a Tailwind utility loses a specificity fight with antd, the fix goes on the
**wrapper** with a `!` suffix (FRONTEND-CONVENTIONS.md §2) — **never** on this page.

**§2a — the new wrapper.** `src/components/ui/Checkbox/BaseCheckbox.tsx` + `index.ts`, following
the exact shape of `BaseButton`/`BaseInput`: `"use client"`, default export, `export interface
BaseCheckboxProps extends CheckboxProps {}` from antd, `...props` spread, `className` merged
**last**. No `!` utilities unless you measure that you need one.

### 3. The four emoji, the fifth the checker misses, and the two `alert()`s

The harness flags **4** hits in this file (verified by Sober 2026-09-09):
`page.tsx:64:14 ✅` · `67:14 ❌` · `107:57 📨` · `187:15 💡`.

🔴 **There is a fifth: `⏳` (U+23F3) at line 107**, in `'⏳ กำลังส่ง...'`. The harness does **not**
flag it — U+23F3 falls outside the ranges SPEC-001 fixed. It must go anyway; the requirement is
"no emoji", not "no harness hits". Do not widen the harness in this TASK (its `124`-occurrence
baseline is cited in other reviews); Sober is carrying the gap.

| Emoji | Where | Replacement |
|---|---|---|
| `✅` l.64 | `alert('✅ ' + (data.message \|\| '…'))` | `message.success(...)` — antd supplies the icon |
| `❌` l.67 | `alert('❌ ' + errorMessage)` | `message.error(errorMessage)` |
| `⏳` l.107 | resend button label while sending | `BaseButton loading` (antd's own spinner). The label stays the copied string `กำลังส่ง...` |
| `📨` l.107 | resend button label at rest | `icon={<Send size={16} />}` from `lucide-react`. The label stays `ส่งอีเมลยืนยันอีกครั้ง` |
| `💡` l.187 | demo-credentials hint | `<Lightbulb size={14} />` from `lucide-react`, inline before the text, `aria-hidden` |

**The three `alert()` calls become antd `message`** (SPEC-001 §Decision 3 assigns
message/notification to the library). This is the only way an emoji-in-an-`alert()` can become an
icon — a browser alert cannot hold one. The **strings are copied verbatim**; only the emoji prefix
and the blocking dialog go:

- l.57 `alert('กรุณากรอกอีเมลของคุณก่อน')` → `message.warning('กรุณากรอกอีเมลของคุณก่อน')`
- l.64 → `message.success(data.message || 'ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว')`
- l.67 → `message.error(errorMessage)`

Get `message` from `const { message } = App.useApp();` inside the component (§D) — **not** the
static `import { message } from "antd"`, which does not read `ConfigProvider` and would render
untinted in dark mode.

### 4. The hand-rolled submit spinner

Delete the inline `<svg className="animate-spin …">` (l.161–164) and the `<span
className="flex items-center justify-center">` wrapper around it. `BaseButton loading` renders
antd's spinner. The label stays the copied `กำลังเข้าสู่ระบบ...` / `เข้าสู่ระบบ`.

### 5. Leave alone, on purpose

The gradient `DTE` wordmark, `เข้าสู่ระบบเพื่อเริ่มต้นเรียนรู้`, the two background blur blobs,
the `animate-fade-in-up` delays, the `หรือเข้าสู่ระบบด้วย` divider, the `/forgot-password` and
`/register?redirect=…` links, the demo-credentials text itself, and the `redirect` query handling.
The repo's files use **CRLF**; keep the line endings you found.

## Definition of Done

Run each command yourself and paste the **real output** into §Implementation Notes. A claim with
no output is `REWORK` (PROTOCOL.md §Evidence).

- [ ] 1. `npm run build` in `front/` — exit 0, and the route table still lists **9 routes**. Paste
  the table; `/login`'s First Load JS BEFORE and AFTER both stated.
- [ ] 2. `npx tsc --noEmit` in `front/` — exit 0, no output.
- [ ] 3. `node ai-worker/tests/harness/check-no-emoji.mjs <repo>/front/src` — the whole-tree total
  drops from **124** to **120**, and **no line of the output names `login/page.tsx`,
  `partials/Login/`, or `ui/Checkbox/`**. Paste the total line and the grep you used.
- [ ] 4. `grep -n "⏳\|📨\|✅\|❌\|💡" src/app/login/page.tsx src/components/partials/Login/*.tsx`
  — **no matches** (this is what catches the U+23F3 the harness misses).
- [ ] 5. `grep -rn "alert(" src/app/login src/components/partials/Login` — **no matches**.
- [ ] 6. Dev server (`npm run dev`, on a port you pick and **state**, not 3000; stop it after) —
  `GET /login` returns **200**.
- [ ] 7. **Seen with your own eyes, in the browser, in BOTH light and dark theme** (this is the
  part no command can do; say what you saw, per item):
  - the screen is visually unchanged from before — same layout, same colours, same spacing;
  - both inputs accept text; submitting empty still shows the browser's own required bubble;
  - a **wrong** password shows `อีเมลหรือรหัสผ่านไม่ถูกต้อง` in the red banner, and the submit
    button showed antd's spinner while in flight;
  - the resend button (force it visible if you can) renders the `Send` icon and no `📨`;
  - the `Lightbulb` icon renders on the demo-credentials line;
  - the antd `message` toast is **readable in dark mode** (this is the specific thing
    `App.useApp()` buys you — if it is untinted, you used the static import).
- [ ] 8. `git status` shows changes **only** under `front/src/app/login/`,
  `front/src/components/partials/Login/`, `front/src/components/ui/Checkbox/`. (Reading git state
  is fine; **you commit nothing** — the owner's rule.) If anything else changed, say why.
- [ ] 9. Anything above you could not run — write `UNVERIFIED — <what would settle it>`. An honest
  UNVERIFIED is accepted and carried; a false "it works" is not.

## Implementation Notes

**Fern, 2026-09-09.** Status `TODO` → `IN_PROGRESS` → `REVIEW`. Everything below was run by me on
this machine; the pasted output is real.

### Files changed (git status, DoD 8 — read-only, nothing committed)

```
$ git status --porcelain          # run in the repo root, after the final build
 M front/src/app/login/page.tsx
?? front/src/components/partials/Login/
?? front/src/components/ui/Checkbox/
```

Nothing else. (`front/next-env.d.ts` showed as ` M` while the dev server was up — `next dev`
rewrites its own `import "./.next/dev/types/routes.d.ts"` line and `next build` writes it back.
The final `npm run build` restored it; it is not in the list above and I never edited it by hand.)

The five files:

| File | New/changed | Line endings |
|---|---|---|
| `front/src/app/login/page.tsx` | changed — 236 lines → 16; keeps only `LoginPage` + the identical `<Suspense>` fallback | **CRLF** (as found) |
| `front/src/components/partials/Login/LoginContent.tsx` | new — the old `LoginForm` verbatim + the `<App component={false}>` boundary | **CRLF** |
| `front/src/components/partials/Login/index.ts` | new — `export { default as LoginContent } …` | LF |
| `front/src/components/ui/Checkbox/BaseCheckbox.tsx` | new — §2a wrapper | LF |
| `front/src/components/ui/Checkbox/index.ts` | new — barrel | LF |

**Line-ending decision, declared because the TASK says "keep the line endings you found" and the
repo is not uniform.** `login/page.tsx` was pure CRLF and stayed pure CRLF (16/16). The three
*barrel/wrapper* files follow their own siblings — `ui/Button/*` and `ui/Input/*` from TASK-003
are pure **LF** — so `ui/Checkbox/*` and `partials/Login/index.ts` are LF. `LoginContent.tsx` is
**CRLF** because its body is a byte-for-byte lift out of a CRLF file, and matching it keeps the
Thai/JSX lines literally unchanged bytes. Verified, no mixed file:

```
src/app/login/page.tsx                          CRLF=16  LF=16  (pure CRLF)
src/components/partials/Login/LoginContent.tsx  CRLF=228 LF=228 (pure CRLF)
src/components/partials/Login/index.ts          CRLF=0   LF=1   (pure LF)
src/components/ui/Checkbox/BaseCheckbox.tsx     CRLF=0   LF=24  (pure LF)
src/components/ui/Checkbox/index.ts             CRLF=0   LF=2   (pure LF)
```

No `sed -i` was used anywhere (SYSTEM-FACTS A40). `components/partials/index.ts` is untouched and
still `export {};` (§E). No `ui/` root barrel was created.

### DoD 1 — `npm run build`, exit 0, 9 routes

```
$ cd front && npm run build
✓ Compiled successfully in 2.6s
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ƒ /classroom/[id]
├ ○ /courses
├ ○ /login
├ ○ /register
├ ○ /teach
└ ○ /verify-email
build exit=0
```

9 routes, unchanged. **Next 16 + Turbopack prints no size column**, so First Load JS comes from
TASK-019's instrument (`measure-first-load.mjs`, same one Sober re-ran), A = before my edit,
B = after, both on this tree:

```
route            BEFORE raw / gzip / brotli      AFTER raw / gzip / brotli       delta gzip
/login           649.2 kB / 196.6 / 170.4        896.7 kB / 274.6 / 237.4        +78.0 kB
/                678.4 kB / 203.4 / 176.2        695.1 kB / 209.0 / 181.1         +5.6 kB
/_not-found      640.1 kB / 193.4 / 167.8        656.8 kB / 199.0 / 172.6         +5.6 kB
/about           643.0 kB / 194.5 / 168.6        659.7 kB / 200.0 / 173.5         +5.6 kB
/classroom/[id]  656.7 kB / 197.9 / 171.6        673.4 kB / 203.5 / 176.5         +5.6 kB
/courses         641.8 kB / 194.1 / 168.3        658.4 kB / 199.6 / 173.2         +5.6 kB
/register        659.8 kB / 199.4 / 172.9        676.6 kB / 204.9 / 177.8         +5.6 kB
/teach           662.7 kB / 199.0 / 172.6        679.3 kB / 204.5 / 177.4         +5.6 kB
/verify-email    647.0 kB / 195.6 / 169.6        663.6 kB / 201.1 / 174.4         +5.6 kB
```

JSON evidence: `ai-worker/tests/harness/first-load-TASK-004-{BEFORE,AFTER}.json`.

🔴 **Read the second column before you review the first.** Two separate costs, and I decomposed
them from the chunk lists rather than guessing:

- The set of chunks **shared by all 9 routes** grew from **640.1 kB → 656.8 kB raw (+16.7 kB,
  +5.6 kB gzip, +4.9 kB Brotli)**. Every route pays it, including `/` and `/about`.
- Each route's **own** page chunk is byte-identical before/after (e.g. `/` = 38.3 kB both times,
  `/about` = 2.9 kB both times) — so the uniform growth is entirely the shared set, not a
  per-page regression.
- `/login`'s own chunks went **9.1 kB → 239.9 kB raw** (a 238.6 kB chunk containing `useApp`, plus
  a 1.3 kB `lucide` chunk).

I did not widen scope to chase this; I am reporting it because **SPEC-001 §Decision 6 has a
re-open trigger** and this is the first real datum after the +40.55 kB gzip TASK-019 measured.
See §Questions Q3 — it is Sober's call, not mine.

### DoD 2 — `npx tsc --noEmit`

```
$ cd front && npx tsc --noEmit
tsc exit=0
```

No output, exit 0.

### DoD 3 — the emoji harness

```
$ node ai-worker/tests/harness/check-no-emoji.mjs H:/dte/dte/front/src
…
120 occurrence(s) in 48 file(s) scanned.        (exit 1 — expected; the 120 are other screens)
```

**124 → 120**, exactly the 4 the TASK named. And the grep over the harness's own output for the
three touched paths:

```
$ grep -n "login\|partials\|Checkbox" <harness output>
(no matches)
```

Baseline re-confirmed before I started: the same command on the untouched tree printed
`124 occurrence(s) in 44 file(s) scanned.` (44 → 48 files scanned = my 4 new files, none of them
a hit).

### DoD 4 — the fifth emoji the harness misses (U+23F3)

```
$ grep -n "⏳\|📨\|✅\|❌\|💡" src/app/login/page.tsx src/components/partials/Login/*.tsx
exit=1 (no matches)
```

I also swept **every** non-Thai, non-ASCII codepoint in all five touched files rather than trust a
five-character grep. One hit, and it is not an emoji:

```
src/app/login/page.tsx                          clean
src/components/partials/Login/LoginContent.tsx  U+2022
src/components/partials/Login/index.ts          clean
src/components/ui/Checkbox/BaseCheckbox.tsx     clean
src/components/ui/Checkbox/index.ts             clean
```

`U+2022` is the `•` in the password `placeholder="••••••••"` — present in today's file, copied
byte-for-byte, outside every harness range, and a placeholder glyph rather than an icon. I left it
alone (changing it would be new user-facing copy). Flagging it so it is a decision, not an
oversight.

### DoD 5 — no `alert()`

```
$ grep -rn "alert(" src/app/login src/components/partials/Login
exit=1 (no matches)
```

All three became `App.useApp()` `message` calls with the strings copied verbatim:
`message.warning('กรุณากรอกอีเมลของคุณก่อน')` · `message.success(data.message || 'ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว')` ·
`message.error(errorMessage)`. No `import { message } from "antd"` anywhere.

### DoD 6 — dev server, `GET /login` 200

Port **3061** (stated, not 3000). Started with `npx next dev -p 3061`, stopped afterwards
(`taskkill /PID 20264 /F` — `SUCCESS`).

```
$ curl -s -o /dev/null -w "%{http_code}" http://localhost:3061/login
GET /login -> 200 (attempt 1)
… GET /login 200 in 1420ms (next.js: 1010ms, application-code: 410ms)
```

`NEXT_PUBLIC_API_URL` was never set and no `.env.local` exists — the app fell back to its own
`http://localhost:4002` default. Nothing was pointed at production; no local backend was running
either (see §Questions Q2 for what that cost).

### DoD 7 — seen with my own eyes, light AND dark

Driven in a real Chromium against `localhost:3061`, viewport 1280×1050, theme switched with
`prefers-color-scheme` emulation (`localStorage dte-theme` was `system`, so the app's own
`ThemeContext` resolved it — `document.documentElement.className` read `"dark"`).

- **Layout, both themes — unchanged in structure, changed in three control metrics.** The
  gradient `DTE` wordmark, `เข้าสู่ระบบเพื่อเริ่มต้นเรียนรู้`, both blur blobs, the card, the
  `หรือเข้าสู่ระบบด้วย` divider, both links and the demo-credentials line all render exactly where
  they did. What is **not** pixel-identical, measured with `getBoundingClientRect()`:
  - inputs **50 px → 40 px** (`BaseInput` forces `h-10!`; the legacy `px-4 py-3` recipe is still
    live on `/register`, where I measured `[50, 50, 52, 52]` for comparison);
  - submit button **≈50 px → 32 px** (antd default size — the TASK gives `size="large"` only to
    the two social buttons) and its **sky→cyan gradient is gone**, now flat antd primary
    (`rgb(15, 143, 201)` in dark);
  - social buttons **≈50 px → 40 px** (`size="large"`).
  These follow directly from the TASK's own instruction to drop the classes antd now owns, so I
  implemented them as written rather than fighting them on the page — but they collide with
  §"Out of scope: no visual redesign … same spacing, same gradients", so they are **Q1** below.
- **Both inputs accept text** — typed `john@example.com` and a 13-char password, both rendered.
- **Empty submit still shows the browser's own bubble** — screenshot shows Chromium's
  "Please fill out this field" anchored on the email field. Native `required` survived (no antd
  `Form`, per §A).
- **Wrong password** → the red Tailwind banner (§C untouched) with exactly
  `อีเมลหรือรหัสผ่านไม่ถูกต้อง`, confirmed by an accessibility-tree match, not by eye alone. While
  the request was in flight the submit button showed **antd's spinner** and the copied label
  `กำลังเข้าสู่ระบบ...`; the hand-rolled `animate-spin` SVG is gone (DoD 4 of §4).
- **The resend button renders the `Send` icon and no `📨`**, and **the antd `message` toast is
  readable in dark mode**: `.ant-message-notice-content` computed
  `background-color: rgb(66, 54, 46)`, `color: rgba(245, 245, 244, 0.85)`, holder class list
  includes `ant-message-css-var` — i.e. it is reading `ConfigProvider`, which is what
  `App.useApp()` (§D) buys. Text read back: `กรุณากรอกอีเมลของคุณก่อน`.
  **How I forced it visible, and how I proved I put it back.** `needsVerification` is unreachable
  at runtime today — `AuthContext.login` catches every error and returns `false`, so `LoginForm`'s
  own `catch` never fires (pre-existing, unchanged by me; see Q2). So I applied a **temporary
  local probe**: `useState(false)`→`(true)` on `needsVerification` and the in-file string as the
  initial `error`, looked, then restored from a backup. Byte-identical restore, proven:
  `sha256 01b4ee56baa4c77ecc1625379d4c1b96683b1b4da03922ddb134f8ad6f5aebe2` before the probe and
  after the restore, CRLF still 228/228. The backup is parked at
  `ai-worker/tests/harness/LoginContent.tsx.task004.bak` if you want to diff it yourself.
- **The `Lightbulb` icon renders** on the demo-credentials line, inline before
  `ทดสอบด้วยบัญชีตัวอย่าง: john@example.com / password123`, `aria-hidden`.
- **Dark mode is correct after hydration** — `input#email` computed `rgb(54, 44, 38)` /
  `rgba(245, 245, 244, 0.85)`, checkbox `rgb(54, 44, 38)` on border `rgb(108, 89, 75)`, social
  buttons `rgb(54, 44, 38)`. The first frame after a dark reload does show light antd controls;
  that is the **already-documented** light flash (FRONTEND-CONVENTIONS §3 "Known, accepted, and
  NOT antd's doing"), and it is now visible on antd controls too because `/login` is the first
  screen that renders any.

### DoD 9 — UNVERIFIED, honestly

- **UNVERIFIED — the `message.success` / `message.error` toasts on a real resend.** Only
  `message.warning` was exercised (empty-email guard). The other two need `authApi.resendVerification`
  to actually resolve/reject, i.e. a local backend; there is none on this machine. What would
  settle it: a local `back/` + local Postgres, or Sober authorising a stubbed API base URL.
- **UNVERIFIED — the toast in LIGHT theme.** I measured it dark (the theme §D exists for) and did
  not re-run it light.
- **UNVERIFIED — the checkbox is still cosmetic.** `จดจำฉัน` has no state and no handler, exactly
  as before; I did not verify "remember me" does anything, because it does nothing by design.
- **UNVERIFIED — production.** Nothing here was run against `dte.develyst.online`, and nothing
  should be. `DELIVERED` ≠ deployed.
- Everything else in DoD 1–8 was run and its real output is pasted above.

## Questions

**Q1 — the three control-metric changes are a visual change; the TASK forbids one. Which wins?**
Measured above: inputs 50→40 px, submit ≈50→32 px and its sky→cyan **gradient replaced by flat
antd primary**, social buttons ≈50→40 px. I did **not** deviate: §2's table names `BaseInput`,
`BaseButton type="primary"` (no `size`), and `size="large"` only on the social pair, and §2 says
to drop "the classes the antd component now owns" — padding and background are exactly that. But
§Out-of-scope says "same spacing, same gradients". Both cannot hold. This is the reference screen,
so please rule explicitly rather than let six more screens copy my reading:
- (a) accept it — antd's metrics are the new house look, the gradient goes site-wide as screens
  migrate; or
- (b) preserve today's look — then `BaseButton`/`BaseInput` need `size="large"`/an `h-[50px]!` and
  a gradient variant **on the wrapper** (§2 forbids the override on the page), which is a change
  to TASK-003's files and therefore yours to authorise, not mine to make.
I have implemented (a) as written. Say the word and (b) is a small edit.

**Q2 — `needsVerification` is dead code, and it is not dead for the reason the TASK assumes.**
`AuthContext.login` (l. "return false" in its `catch`) swallows **every** error, so `LoginForm`'s
`catch` — the only place that calls `setNeedsVerification(true)` — can never run. The resend
button, and therefore `message.success`/`message.error`, are unreachable in the real app today.
This is pre-existing and I changed nothing about it (out of scope: `contexts/AuthContext.tsx` is
not mine to touch, and it is shared with `/register` and `/verify-email`). Flagging it because
the TASK's DoD 7 asks me to see that button work and the honest answer is that a user cannot.
Do you want a follow-up TASK, or does it ride with the `services/api.ts` auth carve-out (§B)?

**Q3 — the antd shared chunk grew for every route, and §Decision 6 has a re-open trigger.**
Numbers in §Implementation Notes DoD 1: **+5.6 kB gzip / +4.9 kB Brotli on all 9 routes**
(shared set 640.1→656.8 kB raw), on top of TASK-019's +40.55 kB gzip — plus **+78.0 kB gzip on
`/login` itself**. Six more screens will each add more antd surface to that shared set. I am not
proposing anything (the route-group split is rejected and I am not re-opening it); I am handing
you the first post-decision datum because deciding what it means is §Decision 6's, i.e. yours.

**Q4 — one antd dev warning, cosmetic as far as I can measure, but it is aimed straight at §D.**
The dev console logs, once per load:
`Warning: [antd: App] When using cssVar, ensure "component" is assigned a valid React component
string.` That is antd objecting to `component={false}` while v6's default `cssVar` is on. I
checked the thing it would break and it is **not** broken: the message holder carries
`ant-message-css-var` and the toast computes themed dark colours (values in DoD 7). So I kept
`component={false}` exactly as §D requires. Confirming you want it kept, with the warning, rather
than `component="div"` (which reintroduces the wrapper `div` §D exists to avoid).

### Sober's answers, 2026-09-09

> 🔴 **STRUCK 2026-09-09 (Sober) — the answer below is WRONG and was never the owner's word.** It
> rests on `SYSTEM-FACTS.md` **A41**, which is struck: A41 was **Porter's misreading**, and the owner
> corrected it himself in his very next message — **A42**, verbatim: *"re UI ไม่ได้หมายถึง ให้ ย้อนเป็น
> หน้าตาเดิม หมายถึงให้ทำ หน้าตาใหม่ให้ดีขึ้น และ แค่ เอา emojiออก ใช้icon"*. **Option (b) is NOT his
> answer.** Kept verbatim underneath as the record, per PROTOCOL.md's never-delete discipline. The
> live answer to your Q1 is **§Review addendum, 2026-09-09 (second)**; read that, not this.

> **answer Q1 — the OWNER ruled, and the ruling is (b): preserve today's look.** Verbatim, via
> Porter: **"re UI เอง และ แค่ เอา emojiออก ใช้icon"** — recorded as `SYSTEM-FACTS.md` **A41** and in
> `requirements/REQ-001…md` §Out of Scope. It binds all seven SPEC-001 screens, not just `/login`.
> You read the collision correctly and you did not deviate from the TASK — **the TASK was wrong**,
> not your implementation of it: §2 told you to drop "the classes antd now owns" without saying
> what replaces the look they carried. That is my defect and I am fixing it in the SPEC
> (§Decision 7, new) as well as here. **The mechanism is mine and is written in §Review below;
> you implement it, you do not choose it.**

> **answer Q2 — your finding is correct; I re-read the code myself rather than take the claim.**
> `contexts/AuthContext.tsx` `login()` (l.61–88) wraps the whole call in `try` and its `catch`
> does `console.error(...)` + `return false` (l.83–85) — it never re-throws. So `LoginForm`'s own
> `catch` cannot run, `setNeedsVerification(true)` is unreachable, and with it the resend button
> and `message.success`/`message.error`. Pre-existing, **not** introduced by you, and correctly
> left alone. **It does NOT ride with the `services/api.ts` carve-out** — that is a module-shape
> change, this is a behaviour bug on a live site (a user who has not verified their email is told
> only "อีเมลหรือรหัสผ่านไม่ถูกต้อง"). It is **out of REQ-001's scope entirely**: REQ-001 is
> folder pattern + component library + icons. I am carrying it to Porter as a finding for the
> owner, exactly as I did the `/forgot-password` 404 — do not act on it, do not touch
> `AuthContext.tsx` in the rework.

> **answer Q3 — §Decision 6 is NOT re-opened, and this datum does not re-open it.** The trigger is
> **both conditions or neither** (SPEC-001 §Decision 6 §"Re-open trigger"): (a) `Navbar`/`Footer`
> ruled antd-free **in writing** — no SPEC says that today; and (b) after TASK-004…**010** land,
> `/` and `/about` still ≥ ~130 kB Brotli. (b) cannot even be evaluated until the last screen is
> in, and one screen is not "after they land". So: datum recorded, decision untouched, nothing
> reverts. Two things I am noting for that later evaluation, from your numbers: the **+5.6 kB gzip
> uniform** rise is the shared set growing as the wrappers actually get imported (expected, and it
> is what §Decision 6 priced), and `/login`'s own **+78.0 kB gzip** is dominated by a single
> ~238.6 kB raw chunk carrying `App`/`useApp`. Six screens each pulling their own `App` boundary is
> a real question — but the answer is **not** "mount it in the root layout" (the standing
> constraint forbids it), so it stays a question for the post-TASK-010 review, not for you now.

> **answer Q4 — keep `component={false}`; the warning is accepted, on your measurement.** You did
> the right thing: you checked the thing the warning claims to endanger instead of obeying or
> ignoring it. `ant-message-css-var` on the holder plus a themed dark toast (`rgb(66,54,46)` /
> `rgba(245,245,244,0.85)`) is the proof that `cssVar` is in fact working. `component="div"`
> reintroduces the wrapper `div` §D exists to avoid, for no measured gain. Keep it. I am recording
> it in SPEC-001 §Non-functional as a **known, accepted dev-only warning** so the next screen does
> not re-litigate it. If it ever turns into a real symptom (an untinted toast/modal), that is a new
> question to me, not a silent fix.

## Review

> 🔴 **The `REWORK` verdict below is WITHDRAWN — 2026-09-09 (Sober).** Read the **§Review addendum,
> 2026-09-09 (second)** at the end of this section first; it says exactly which parts of the verdict
> survive (most of it) and which are void (the visual-restoration order and its mechanism). The text
> below is kept verbatim as the record and as the source of the accepted list — it is **not** deleted.

**Sober, 2026-09-09 — verdict: `REWORK`, on ONE thing only.**

**What I re-ran / re-read myself, not read off your paste** (PROTOCOL.md §Evidence — I review the
evidence, not the claim):

- **`ui/` consumers:** `grep -rn "components/ui/(Button|Input|Checkbox)" front/src` → **exactly
  three hits, all in `partials/Login/LoginContent.tsx`**. `/login` is the *only* consumer of the
  three wrappers today. That fact is what makes the fix below surgical rather than site-wide.
- **The pre-migration markup**, so the target look is quoted, not remembered — see the class
  strings in the rework table below. The same input recipe and the same gradient-submit recipe are
  **live and byte-identical on `/register`** today, which gives you a running pixel reference that
  needs no restore of anything.
- **`AuthContext.login`** l.61–88 — your Q2 finding confirmed (see the answer above).
- **`constants/theme-tokens.ts`** — `colorPrimary` is `#0EA5E9` (sky-**500**), while the legacy
  submit is a `sky-600 → cyan-600` **gradient**. antd has no gradient token, so this cannot be
  solved in `ConfigProvider` even if I were willing to touch the root layout, which I am not.

**ACCEPTED, and NOT to be redone** — DoD 1, 2, 3, 4, 5, 6 and 8 are evidenced with real output and
they pass. Specifically accepted: the partial extraction and the 16-line page, the `<Suspense>`
fallback kept identical, `partials/index.ts` left `export {};` and no `ui/` root barrel (§E), the
locally-mounted `App component={false}` (§D), all three `alert()` → `App.useApp()` `message` with
the strings copied verbatim, all **five** emoji gone including the `⏳` U+23F3 the harness misses,
the CRLF/LF decision *and* the fact that you declared it, the whole-codepoint sweep that went
beyond the five-character grep, and the `U+2022` placeholder call — leaving `••••••••` alone was
right, changing it would have been new user-facing copy. The probe-and-restore with a sha256 on
both sides is exactly the standard this project needs and I am citing it as the pattern for the
remaining screens. Your four `UNVERIFIED` are honest and all four are **carried, not held against
you**.

**WHY REWORK.** The owner has ruled Q1 = **(b)** (`SYSTEM-FACTS.md` **A41**). The screen must look
as it did. It currently does not, and the collision is wider than the three metrics you measured —
I found **six** controls changed, so here is the full list; do not work from the three.

| Control | Today's look (the target — pre-migration class string, quoted) | What it renders as now |
|---|---|---|
| email + password input | `w-full px-4 py-3 bg-theme-primary border border-theme-primary rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-all` → **50 px** | `BaseInput`'s `h-10!` → **40 px** |
| submit | `w-full bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-sky-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 focus:ring-offset-theme-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]` → **≈50 px, gradient, hover/active scale** | flat antd primary, **32 px**, no gradient, **no scale** |
| the 2 social buttons | `flex items-center justify-center px-4 py-3 bg-theme-secondary border border-theme-primary rounded-lg hover:bg-theme-hover transition-all transform hover:scale-[1.02]` → **≈50 px** | `size="large"` → **40 px**, antd surface, **no hover scale** |
| resend (inside the red banner) | `mt-3 w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed` → soft translucent red, **`rounded-md`, `text-sm`** | antd `danger`, 32 px, `rounded-lg!`, solid antd red — **you did not list this one** |
| `จดจำฉัน` checkbox | native `<input type="checkbox" class="rounded border-theme-primary text-sky-600 focus:ring-sky-600">` inside `<label class="flex items-center cursor-pointer">`, label `ml-2 text-theme-secondary` | antd `Checkbox`, its own box size and `colorPrimary` **#0EA5E9**, not `sky-600` — **you did not list this one either** |
| everything else on the screen | — | **unchanged, and confirmed unchanged.** Nothing below is in scope. |

**THE MECHANISM — mine, decided, not open** (this is the half A41 explicitly leaves to me, and it
is now SPEC-001 **§Decision 7**):

> **The `ui/` wrapper's DEFAULT look IS today's look.** The legacy Tailwind recipe moves *into* the
> wrapper — with the `!` suffix where antd wins the specificity fight — and pages stay clean. No
> new prop, no variant API, no page-level override, and **nothing in `AntdConfigProvider` /
> `theme-tokens.ts` / the root layout** (the standing constraint: a root-layout change is paid for
> by `/` and `/about` too).

Why the default and not a `variant` prop: `/login` is the only consumer today, and the same two
recipes are byte-identical on `/register`, so a variant prop would be an abstraction with one
value — speculative. Why not `ConfigProvider` tokens: they cannot express a gradient, and they are
a whole-site change.

**You are AUTHORISED to edit TASK-003's wrapper files** — `ui/Button/BaseButton.tsx`,
`ui/Input/BaseInput.tsx` and your own `ui/Checkbox/BaseCheckbox.tsx`. That is the authorisation you
correctly asked for in Q1(b). Nothing else outside `front/src/app/login/`,
`front/src/components/partials/Login/` and `front/src/components/ui/{Button,Input,Checkbox}/` may
change.

**What to do, concretely:**

1. **`BaseInput`** — replace `h-10!` with the legacy input recipe above (the height comes from
   `px-4 py-3`, so an explicit height is not the point — the *measured* 50 px is). Keep the
   `focus:ring-2 focus:ring-sky-600` ring and suppress antd's own focus shadow if the two fight.
2. **`BaseButton`** — three looks, keyed off the antd props the page **already** passes, so the
   page does not change: `type="primary"` → the gradient submit recipe; `danger` → the soft-red
   resend recipe (`rounded-md`, `text-sm`, `px-3 py-2` — note it overrides the wrapper's own
   `rounded-lg!`); neither → the social/surface recipe. Keep the `hover:scale-[1.02]` /
   `active:scale-[0.98]` transforms; they are part of today's look.
3. **`BaseCheckbox`** — match the native control: `sky-600` check colour (not `colorPrimary`),
   `rounded` box, `cursor-pointer`, label `ml-2 text-theme-secondary`.
4. **Remove `size="large"` from the two social buttons** in `LoginContent.tsx`. Height is the
   wrapper's business now; leaving `size` there is a second source of truth.
5. **Change nothing else on the screen.** No new Thai string, no antd `Form`, no `AuthContext`, no
   `/forgot-password`, no harness widening. Everything in the original §"Out of scope" still binds.

**Definition of Done for the rework** (re-run DoD 1–6 and 8 as before — they must still pass — plus):

- [ ] R1. `getBoundingClientRect()` on the migrated `/login`, **both themes**: email input, password
  input, submit, both social buttons. Paste the numbers. Targets: inputs **50**, submit **≈50**,
  social **≈50** — i.e. the numbers you already measured on the legacy controls.
- [ ] R2. **Reference measurement, same run, same viewport: `/register`** — its input and its
  gradient submit use the byte-identical legacy class strings and are untouched. Paste both
  screens' numbers side by side. This is the reference that needs no restore of anything.
- [ ] R3. Computed style of the submit shows a **gradient** background (`linear-gradient` in
  `background-image`), not a flat colour, in both themes.
- [ ] R4. The resend button (force it visible with the same probe-and-restore + sha256 you used
  before) renders **translucent red, `rounded-md`, `text-sm`** — and still shows the `Send` icon
  and no `📨`.
- [ ] R5. The checkbox box and its label render as they did — say what you measured (box size,
  check colour, label gap).
- [ ] R6. Seen with your own eyes, **both themes**, side by side against `/register`'s legacy
  controls: the screen looks as it did.
- [ ] R7. Anything above that genuinely cannot be made pixel-identical: **do not fight it and do
  not guess** — write `UNVERIFIED — <the measurement>` with the numbers and hand it back. I rule,
  you do not.

One note on judgement, since this is the reference screen: you implemented the TASK as written and
raised the collision instead of silently resolving it. That is the behaviour I want. The rework is
the cost of my spec defect, not of your work.

### Review addendum, 2026-09-09 (second) — **the `REWORK` verdict is WITHDRAWN; TASK-004 is `BLOCKED` on REQ-001 §Q7**

**Sober, 2026-09-09. This is me reversing my own ruling, not re-reviewing your work.**

**What happened, plainly, and whose fault each half is.** I ordered the rework above on
`SYSTEM-FACTS.md` **A41** — "the owner ruled Q1 = (b), preserve today's look". **A41 is struck.** It
was **Porter's misreading** of the owner's Thai, and the owner corrected it unprompted in his next
message — **A42**: *"re UI ไม่ได้หมายถึง ให้ ย้อนเป็น หน้าตาเดิม หมายถึงให้ทำ หน้าตาใหม่ให้ดีขึ้น และ แค่
เอา emojiออก ใช้icon"*. **Q1 option (b) was never his answer.** He does not want the old look back;
he wants the **new** look **made better**, and emoji → icons.

Attribution, by name, because this project attributes defects: the misreading is **Porter's**, and he
recorded it as his own. **The second mistake is mine** — I took a one-line reading of a Thai sentence
and, in the same session, built a **seven-screen** design rule on it (§Decision 7) and shipped it to
you as a `REWORK`. You then spent a session doing precise, well-evidenced work toward a target that
was never asked for. **None of this is a defect in your work**, and nothing in the rework is held
against you: you implemented what you were told, you measured it against a real reference instead of
claiming it, and you handed back three things you would not guess at (R1a/R5a/R6a) exactly as R7
required.

**What of the verdict above SURVIVES — unchanged, not re-opened, and safe whatever Q7 answers:**

- The entire **ACCEPTED** paragraph of the first review: DoD 1, 2, 3, 4, 5, 6, 8; the partial
  extraction and the 16-line page; `<Suspense>`; `partials/index.ts` left `export {};` and no `ui/`
  root barrel; the local `App component={false}`; all three `alert()` → `message` with strings copied
  verbatim; **all five emoji gone**, including the `⏳` U+23F3 the harness misses; the CRLF/LF
  handling; the probe-and-restore-with-sha256 pattern. A42 **re-affirms** the emoji→icon half
  (he has now stated it three times), and the folder/substrate half was never in question.
- Your rework's own evidence quality: R1–R7 are real measurements against a live reference, the
  `->` U+2192 self-attribution (123 → 120, proven on a restored copy rather than assumed) is the
  standard this project needs, and the transition-throttling **Method note** is a finding I want the
  remaining screens to inherit. Cited, kept, not wasted.
- The **finding** underneath §Decision 7, which stands on its own: "drop the classes the antd
  component now owns" silently changed six controls. A screen TASK must always say **what happens to
  the look**. What is struck is my *answer* (restore the legacy recipe), not the *question*.

**What is VOID:**

- The `REWORK` verdict itself, and its stated reason ("the owner has ruled Q1 = (b); the screen must
  look as it did"). Withdrawn.
- **§Review items 1–4** (the `BaseInput` / `BaseButton` / `BaseCheckbox` recipes and the
  `size="large"` removal) as *requirements*. They are no longer a target to be hit or defended.
- **`specs/SPEC-001…md` §Decision 7 in whole** — struck there today, replaced by **§Decision 8**.
- The rework DoD **R1–R7** as acceptance criteria. Your measurements stay in the file as evidence of
  what the code does; they are no longer the bar it must clear.

**Why I am NOT ruling `DONE`, and NOT ordering a revert — the ambiguity I refuse to guess at.**
A42 settles that restoration was not wanted; it does **not** settle *how far* "ให้ดีขึ้น" (*better*)
goes. Porter has that with the owner as **REQ-001 §Questions Q7**: **(ก)** antd's own default
appearance already IS "better", or **(ข)** a deliberate visual-improvement pass he wants to see on
`/login` first. **The two answers demand opposite code on these same four files.** Marking this
`DONE` would bless the legacy look as the accepted reference for six more screens — the precise thing
A42 kills. Ordering a revert today would make me guess (ก). So the honest state is **`BLOCKED`**, and
it costs nothing: TASK-005…010 were already gated on this screen.

**Fern — nothing is asked of you on TASK-004 right now. Do not revert anything, do not touch the
four files, and do not start a fifth.** When Q7 lands I write the next unit and it will be small and
bounded — under (ก), a revert of the same four files to antd's defaults, DoD 1–6/8 re-run, and your
R1a/R5a/R6a evaporate with it.

**Your three rework questions, answered so they are not left hanging** (each is a question about
matching the legacy look, and that goal is now struck — so none of them needs a number from me):

- **R1a — submit height 48 vs my "≈50".** You were right and I was wrong: the byte-identical legacy
  control on `/register` measures **48** because it is a native `<button>` with `border-width: 0`.
  My "≈50" was a number I carried over from the inputs without re-reading the reference. **Reporting
  the measurement instead of hitting my number is exactly right** and I want that behaviour every
  time. Moot now — but the lesson is kept: a target number in one of my TASKs is not evidence, and
  where it disagrees with a live measurement, the measurement wins and comes back to me.
- **R5a — the checkbox box, 16×16 / radius 4 vs the native 13×13 / radius 0.** You handed it back
  under R7 rather than inventing a 13 px that nobody ever wrote (it is Chrome's own default, not a
  value in our CSS). Correct call, and moot for the same reason. Your finding that **antd v6's
  checkbox DOM is not v5's** (`span.ant-checkbox` is the box, there is no `.ant-checkbox-inner`,
  the label is `span.ant-checkbox-label`) is real and survives all of this — I am keeping it as a
  fact for whichever screen next touches a checkbox, and it was found the right way, by reading the
  running DOM after the v5 selectors were silently inert.
- **R6a — `.*-theme-*` classes cannot carry `!`, so you used `bg-[var(--bg-primary)]!` etc.** Your
  reasoning is sound (they are plain unlayered classes in `themes.css`, not Tailwind utilities, so
  the suffixed form is simply never generated) and you declared it instead of hiding it. **I am not
  ordering the `globals.css` layer change** — it is a whole-site file, it would be a real change made
  to satisfy a rule that no longer exists, and under Q7 = (ก) the arbitrary utilities disappear with
  the rest of the recipe. Recorded, deliberately not acted on.

**One thing I owe you as the reference screen's engineer:** you have now been reworked once on a
ruling that was withdrawn, and you were the one who flagged the collision **both** times rather than
resolving it silently. That is the behaviour that caught this, and it is the behaviour I want kept.
The cost of the round trip is mine and Porter's, and it is written down in both our files.

## Rework Implementation Notes

**Fern, 2026-09-09.** Status `REWORK` -> `IN_PROGRESS` -> `REVIEW`. Visual restoration only; I
touched nothing outside the four files below and re-opened none of DoD 1-6/8's accepted work.
Everything pasted here was run by me on this machine.

### Files changed (DoD 8 — `git status --porcelain`, read-only, nothing committed)

```
 M front/src/components/partials/Login/LoginContent.tsx
 M front/src/components/ui/Button/BaseButton.tsx
 M front/src/components/ui/Checkbox/BaseCheckbox.tsx
 M front/src/components/ui/Input/BaseInput.tsx
```

Nothing else, and all four are inside the paths §Review authorises. Two notes on this list:

- `front/src/app/login/page.tsx` does **not** appear because it needed no change **and** because the
  branch moved under me: `partials/Login/`, `ui/Checkbox/` and the `login/page.tsx` edit are now
  **committed on branch `D1`** (they were `??` / ` M` in my last session). Someone else committed
  them; **I ran no git write** (owner's rule, SYSTEM-FACTS A23). Flagging it because it silently
  moves the harness baseline — see DoD 3.
- Line endings kept as found, no `sed -i` anywhere (A40): `LoginContent.tsx` pure **CRLF 228/228**,
  the three `ui/` wrappers pure **LF** like their TASK-003 siblings.

### The mechanism, as implemented (SPEC-001 §Decision 7 — your ruling, not my choice)

The legacy recipe now lives in the wrapper's **default** render. One thing I had to solve that
§Decision 7 does not mention, so it is declared rather than hidden:

> **`bg-theme-primary` / `border-theme-primary` / `text-theme-secondary` cannot carry a `!` suffix.**
> They are plain unlayered classes in `styles/themes.css`, not Tailwind utilities, so
> `bg-theme-primary!` is simply not a class Tailwind generates — and unsuffixed they lose to antd's
> own unlayered CSS-in-JS. I expressed them as arbitrary utilities bound to **the same custom
> properties `themes.css` declares** (`bg-[var(--bg-primary)]!`, `border-[var(--border-primary)]!`,
> `text-[var(--text-primary)]!`). Same palette, one source of record (FRONTEND-CONVENTIONS §3),
> only a form that can carry `!important`. Measured identical to `/register` in both themes (R2).
> If you want the class names literally instead, that is a `globals.css` change and therefore yours.

`BaseButton` has the three cases you specified, keyed off `type="primary"` / `danger` / neither — no
new prop, no page override. `LoginContent.tsx`'s only change is the removal of `size="large"` from
the two social buttons (your item 4).

**`text-base!` is why the heights come back.** The legacy controls were native elements inheriting
the body's 16 px; antd's own font-size is 14 px. With `px-4 py-3` that is 12+12+24 = 48/50 px. No
explicit height is set anywhere; `h-10!` is gone from `BaseInput`.

### R1 + R2 — rects and computed style, `/login` (migrated) vs `/register` (legacy, untouched), BOTH themes

Same run, same browser, same viewport **1280x1050**, dev server **3062**. Colours re-read with CSS
transitions suppressed in the browser only — see §Method note.

**LIGHT**

| control | `/login` AFTER rework | `/register` legacy reference | verdict |
|---|---|---|---|
| email input | **382x50**, bg `rgb(250,250,249)`, border `1px rgb(231,229,228)`, radius `8px`, `16px/24px`, pad `12px 16px`, colour `rgb(41,37,36)` | **382x50**, bg `rgb(250,250,249)`, border `1px rgb(231,229,228)`, radius `8px`, `16px/24px`, pad `12px 16px`, colour `rgb(41,37,36)` | **identical** |
| password input | **382x50** | **382x50** | **identical** |
| submit | **382x48**, border-width `0px`, radius `8px`, `16px w600`, pad `12px 16px`, colour `rgb(255,255,255)` | **382x48**, border-width `0px`, radius `8px`, `16px w600`, pad `12px 16px` | **identical** |
| social x2 | **218x50** each, bg `rgb(245,245,244)`, border `1px rgb(231,229,228)`, radius `8px`, `16px` | (no counterpart on `/register`) | matches the legacy `/login` recipe |

**DARK**

| control | `/login` AFTER rework | `/register` legacy reference | verdict |
|---|---|---|---|
| email / password input | **382x50**, bg `rgb(28,25,23)`, border `1px rgb(57,50,48)`, radius `8px`, `16px/24px`, pad `12px 16px`, colour `rgb(245,245,244)` | **382x50**, bg `rgb(28,25,23)`, border `1px rgb(57,50,48)`, radius `8px`, `16px/24px`, pad `12px 16px`, colour `rgb(245,245,244)` | **identical** |
| submit | **382x48**, border-width `0px`, radius `8px`, `16px w600` | **382x48**, border-width `0px`, radius `8px`, `16px w600` | **identical** |
| social x2 | **218x50**, bg `rgb(41,37,36)`, border `1px rgb(57,50,48)` | (no counterpart) | matches |

🔴 **One target number in R1 is wrong, and I am reporting the measurement rather than hitting the
number.** R1 says submit "**≈50**". The byte-identical control still live on `/register` measures
**48**, because the legacy submit is a native `<button>` with **`border-width: 0px`**. I therefore
targeted **48** and used `border-0!` (not `border-transparent!`) on the primary case, so antd's 1 px
border is removed rather than merely made invisible. The inputs and the social buttons genuinely are
**50** — they do carry a 1 px border. If you want 50 on the submit instead, it is a one-word change
and it is yours to rule (§Questions R1a).

### R3 — the submit is a gradient, both themes

```
background-image: linear-gradient(to right,
                   lab(51.7754 -11.4713 -49.8349) 0%,     <- sky-600  #0284C7
                   lab(55.1767 -26.7496 -30.5138) 100%)   <- cyan-600 #0891B2
```

Identical string on `/login` (light **and** dark) and on `/register`'s untouched legacy submit.
`border-width: 0px`, no `box-shadow`, `color: rgb(255,255,255)`, `font-weight: 600`. The
`hover:scale-[1.02]` / `active:scale-[0.98]` transforms and the `hover:from-sky-700
hover:to-cyan-700` hover gradient are on the wrapper; I did not drive a hover.

### R4 — the resend button, forced visible by probe-and-restore

Probe: `needsVerification` `useState(false)` -> `(true)`, and the **in-file** string
`'อีเมลหรือรหัสผ่านไม่ถูกต้อง'` as the initial `error`. No new string was typed.
**Restore proven byte-identical:**

```
sha256 before probe : 20e24da46c50a275e2026670181ab4882a921cb84671f861780f1a9911d48dc8
sha256 after restore: 20e24da46c50a275e2026670181ab4882a921cb84671f861780f1a9911d48dc8
CRLF 228 / LF 228 (pure CRLF, unchanged)   grep for the probe strings: exit 1 (gone)
```

Measured, **both themes, identical numbers**:

```
rect            348x38
background      oklab(0.637009 0.214185 0.101411 / 0.2)     = red-500 @ 20%   (bg-red-500/20)
border          1px oklab(0.637009 0.214185 0.101411 / 0.5) = red-500 @ 50%   (border-red-500/50)
border-radius   6px         = rounded-md   ✔ (NOT the wrapper's old rounded-lg)
font            14px w500   = text-sm font-medium ✔
padding         8px 12px    = py-2 px-3 ✔
color           lab(55.4814 75.0732 48.8528) = red-500 #EF4444
margin-top      12px        = the page's own mt-3, unchanged
label           "ส่งอีเมลยืนยันอีกครั้ง"      icon <svg class="lucide lucide-send"> ✔   no 📨
```

The `rounded-lg!` vs `rounded-md!` fight you flagged is gone by construction: `BaseButton` emits
**one** radius class per case, so there is no two-`!important`-rules race whose winner depends on
Tailwind's output order.

### R5 — the checkbox: what you named is done; the box SIZE is not, and I did not fight it

```
                      /login AFTER (antd v6 wrapper)      /register legacy native
box                   16 x 16                             13 x 13
border-radius         4px  (Tailwind `rounded`)           0px  (the legacy `rounded` class is INERT
                                                                on a native checkbox — measured)
checked fill+border   lab(51.7754 -11.4713 -49.8349)      browser default (accent-color: auto;
                      = sky-600 #0284C7, NOT #0EA5E9            the legacy `text-sky-600` is INERT)
cursor (wrapper)      pointer                             default on /register; `cursor-pointer` on
                                                          /login's legacy <label> -> matches /login
label gap             padding-inline-start 8px            margin-left 8px            -> identical
label colour/size     rgb(87,83,78) light /               rgb(87,83,78) light /
                      rgb(214,211,209) dark, 14px         rgb(214,211,209) dark, 14px -> identical
```

**UNVERIFIED — the box is 16x16, not the native 13x13 (+3 px each way), and its radius is 4px vs
0px.** Per R7 I am handing this back instead of guessing: antd v6 sizes the box from
`ConfigProvider`, and forcing 13 px would be a made-up number with no legacy CSS behind it — the
13 px is Chrome's own default, not a value anyone wrote. Everything you *did* name in §Review item 3
— sky-600, `rounded`, `cursor-pointer`, label `ml-2 text-theme-secondary` — is done and measured.

⚠️ **antd v6's checkbox DOM is not v5's** — worth knowing before the next screen: the visible box is
`span.ant-checkbox` itself (**there is no `.ant-checkbox-inner`**) and the label is
`span.ant-checkbox-label`, not a bare sibling `span`. My first attempt used the v5 selectors and was
silently inert; I found it by reading the running DOM, not the docs.

### R6 — seen with my own eyes, both themes

Full-page screenshots at 1280x1050 in **light** and in **dark**, with the resend banner forced
visible by the R4 probe, `/register` open in the same session for comparison:

- The card, the gradient `DTE` wordmark, `เข้าสู่ระบบเพื่อเริ่มต้นเรียนรู้`, both blur blobs, the
  `หรือเข้าสู่ระบบด้วย` divider, both links and the demo-credentials line are where they were.
- **The submit is a sky->cyan gradient again**, full width, tall like `/register`'s — not a flat
  32 px antd primary.
- **Both inputs are card-height again**, with the themed fill and the hairline border; side by side
  with `/register`'s they read as the same control.
- **The social buttons are tall again**, with the theme border and surface; the brand SVGs and the
  `Google` / `Facebook` labels are unchanged.
- **The resend button is translucent red with the small radius and small text**, with the `Send`
  icon — it reads as the legacy button, not as an antd `danger` button.
- The `Lightbulb` icon still renders on the demo-credentials line; the `จดจำฉัน` checkbox is sky-600
  when checked, in both themes.

### DoD 1-6 and 8 re-run — they still pass

```
DoD 2  $ npx tsc --noEmit                       -> tsc exit=0, no output
DoD 1  $ npm run build                          -> Compiled successfully in 2.4s   build exit=0
       Route (app): /, /_not-found, /about, /classroom/[id], /courses, /login,
                    /register, /teach, /verify-email                    = 9 routes, unchanged
DoD 6  $ curl -s -o /dev/null -w "%{http_code}" http://localhost:3062/login
       GET /login -> 200      (port 3062, stated; stopped after — taskkill /PID 22024 /F SUCCESS)
DoD 5  $ grep -rn "alert(" src/app/login src/components/partials/Login src/components/ui/{Button,Input,Checkbox}
       exit=1 (no matches)
DoD 4  $ grep -n "⏳\|📨\|✅\|❌\|💡" src/app/login/page.tsx src/components/partials/Login/*.tsx \
                                       src/components/ui/{Button,Input,Checkbox}/*.tsx
       exit=1 (no matches)
DoD 8  $ git status --porcelain          -> the 4 files listed at the top, nothing else
```

**DoD 3 — the emoji harness, and a real trap I fell into.**

```
$ node ai-worker/tests/harness/check-no-emoji.mjs H:/dte/dte/front/src
120 occurrence(s) in 48 file(s) scanned.        (exit 1 — expected; the 120 are other screens)
$ grep -n "login\|partials\|Checkbox\|Button\|Input" <harness output>
(no matches)
```

**120, the accepted post-TASK-004 number.** But my *first* run of this rework printed **123**, and I
chased it instead of shrugging: **I had written three `->` arrows (U+2192) into `BaseButton`'s doc
comment**, and the harness flags U+2192. I proved the attribution rather than assuming it — copied
`front/src` to a scratch dir, restored the four files there from `git show HEAD:<path>`, re-ran the
harness on that copy: **120**. So the +3 was mine and only mine, and it is gone (the arrows are now
`=>`). Two lessons for the remaining six screens: **the harness scans comments too**, and **a
wrapper edit can move the emoji count without touching any screen**.

Whole-codepoint sweep of all five in-scope files (not just the five-character grep) — non-Thai,
non-ASCII, above U+2000:

```
src/app/login/page.tsx                          clean
src/components/partials/Login/LoginContent.tsx  U+2022          (the `••••••••` placeholder — your accepted call)
src/components/ui/Input/BaseInput.tsx           U+2014          (em dash, prose in a comment)
src/components/ui/Button/BaseButton.tsx         U+2014          (em dash, prose in a comment)
src/components/ui/Checkbox/BaseCheckbox.tsx     U+2014, U+2026  (em dash + ellipsis, prose in a comment)
```

None is an emoji, none is user-facing, none is flagged by the harness. Declared so it is a decision
of yours and not an oversight of mine — say the word and they become ASCII.

**First Load JS after the rework** (`measure-first-load.mjs`, label `TASK-004-REWORK`, JSON at
`ai-worker/tests/harness/first-load-TASK-004-REWORK.json`):

```
route              AFTER-first-pass gzip     AFTER-rework gzip     delta
/login                     274.6                   275.1           +0.5 kB
all 8 other routes       unchanged               unchanged          0.0 kB
```

The rework is CSS utility classes only: **+1.5 kB raw / +0.5 kB gzip on `/login` alone**, nothing on
the shared set. Your §Decision 6 answer is untouched by it.

### Method note — one measurement hazard, so you can reproduce these numbers

`getComputedStyle` in my headless browser returned **stale colours** — a checkbox that reads
unchecked but screenshots blue, inputs reading `transparent` / black just after navigation. Cause:
the app has a global `* { transition: background-color .2s, color .2s, border-color .2s }`, and the
browser pane throttles `requestAnimationFrame` while it is not displayed, so a running transition
never advances. Every colour above was re-read after injecting `*{transition:none!important}` **in
the browser only** — no file changed. Sizes, padding and radius are not transitioned and were
unaffected. If a later screen reports a colour that contradicts its screenshot, this is why.

### UNVERIFIED, carried forward

- **UNVERIFIED — the checkbox box size**, 16x16 vs the native 13x13 (R5 above). Yours to rule.
- **UNVERIFIED — `message.success` / `message.error` on a real resend.** Unchanged from my first
  submission: still needs a local backend, still none on this machine. `message.warning` is the only
  one ever exercised.
- **UNVERIFIED — the toast in LIGHT theme.** Still not re-run; the resend path is unreachable in the
  real app (your Q2 answer), so the only reachable toast is the empty-email guard.
- **UNVERIFIED — production.** Nothing here touched `dte.develyst.online`. `DELIVERED` ≠ deployed.
- The one accepted dev-only console warning is still the only console error:
  `Warning: [antd: App] When using cssVar, ensure "component" is assigned a valid React component
  string.` — once per load; `component={false}` kept, per your Q4 answer.

## Questions (rework)

**R1a — the submit's target height is 48, not the "≈50" in R1.** Measured on the untouched,
byte-identical control on `/register`: `382x48`, `border-width: 0px`. I implemented **48**
(`border-0!`) and said so rather than padding the wrapper to hit your number. Confirm 48, or tell me
to make it 50.

**R5a — the `จดจำฉัน` box is 16x16 / radius 4px; the native one is 13x13 / radius 0.** Per R7 I did
not fight it. The 13 px is Chrome's default, not a written value, and antd v6 sizes the box from
`ConfigProvider`, which §Decision 7 rules out as the mechanism. Accept 16/4, or give me a number.

**R6a — the `.*-theme-*` classes cannot be `!`-suffixed; I used `var(--…)` arbitrary utilities.**
Same custom properties, same palette, measured identical to `/register` in both themes. If you would
rather the literal class names win, the fix is a `globals.css` layer change — a whole-site file,
therefore yours, not mine.

### Sober's answers to R1a / R5a / R6a, 2026-09-09

> **answer R1a / R5a / R6a — all three are MOOT, and none of them was your error.** They are
> questions about matching the legacy look, and **that goal is struck**: the owner corrected the
> ruling I ordered the rework on (`SYSTEM-FACTS.md` A41 → **A42** — the new look stays and should get
> *better*; option (b) was never his answer). Full reasoning, plus what survives from each of your
> three findings, is in **§Review addendum, 2026-09-09 (second)** above. In short: **48 was right and
> my "≈50" was wrong** (R1a); **handing the 13×13 back instead of inventing it was right**, and your
> antd-v6-checkbox-DOM finding is kept as a fact for the next screen (R5a); **no `globals.css` layer
> change is ordered** — recorded, deliberately not acted on (R6a). **Do not touch the four files.**

---

### Review addendum, 2026-09-09 (third) — **verdict: `DONE`.** The block is lifted by A43

**Sober, 2026-09-09.** REQ-001 §Q7 is answered: **`SYSTEM-FACTS.md` A43**, option **(ข)** — a
deliberate visual-improvement pass, **the home page first, the courses page second**, criteria
**spacing + colour, modern**. `/login` was **not** taken as the first screen.

**Why that makes this `DONE` with no further work.** The single reason I withheld `DONE` in the
second addendum was written down as: *"marking this `DONE` would bless the legacy look as the
accepted reference for six more screens"*. **A43 removes that risk outright** — the reference is now
the **home page the owner approves**, and it is being built as **TASK-005** under
`specs/SPEC-006-visual-improvement-pass.md`. Nothing about this screen's appearance is a precedent
any more, so nothing about it needs to be settled before it closes.

**What `DONE` covers:** everything in the **ACCEPTED** list of the first review and re-affirmed in
the second addendum — DoD 1–6/8, the partial extraction and the 16-line page, `<Suspense>`,
`partials/index.ts` left `export {};`, the local `App component={false}`, all three `alert()` →
`message` with strings copied verbatim, **all five emoji gone** (including the `⏳` U+23F3 the
harness misses), the CRLF/LF handling and the probe-and-restore-with-sha256 pattern.

**What `DONE` explicitly does NOT bless — read this before copying anything from this screen:**

- The current **look** of `/login`, and the legacy recipes now sitting in the `ui/{Button,Input,
  Checkbox}` **defaults**, are an **interim state, not the reference** (SPEC-001 §Decision 9 §2).
  They are **not reverted** — reverting a live screen to satisfy a rule that no longer exists is the
  same mistake in the other direction — and they are **re-authored in SPEC-006 Phase 3**, against
  the look the owner has approved by then.
- The rework DoD **R1–R7** remain **evidence of what the code does**, not acceptance criteria. R1a /
  R5a / R6a stay answered-and-moot exactly as written in the second addendum.

**Two `UNVERIFIED` carried out of this TASK to Porter, unchanged:** nobody here has seen `/login` on
the live site (no agent may), and the `AuthContext.login()` swallowed-error finding (Q2) is a real
behaviour bug on a live product that is **out of REQ-001's scope** and still owned by Porter → the
owner. Neither blocks this verdict.

**Fern: nothing further is asked of you on TASK-004. Your next unit is `TASK-005` — the home
screen — and it is a different kind of work: you now have a written look to implement.**
