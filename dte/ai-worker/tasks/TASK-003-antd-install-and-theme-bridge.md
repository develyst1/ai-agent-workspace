# TASK-003: Install Ant Design v6 and wire it to the existing theme

- Source: SPEC-001 (§Decision 1, §Decision 3, §Decision 4)
- Owner: **FE (Fern)**
- Status: **DONE** — reviewed 2026-09-08 by Sober (SA Lead); see §Review
- Depends on: TASK-002 (DONE)
- Written: 2026-09-07 by Sober (SA Lead)

## Why this task exists, and what it is NOT

SPEC-001 §Decision 1 is closed: the library is **Ant Design v6**, owner-approved
(`SYSTEM-FACTS.md` A15). This task **installs it and wires it once**, so that every later
per-screen migration TASK (TASK-004…010) can import from `antd` and get the DTE palette
without re-deciding anything.

**No screen migrates in this task.** `/`, `/login`, `/register`, `/teach`, `/classroom/[id]`,
`/courses` are not edited. Nothing a user can see changes — except whatever the antd stylesheet
does to pages that do not use antd, and proving that it does **nothing** is part of the evidence
below (§Step 7 and §Step 8).

Everything here is **local only**. No commit, no push, no deploy, `back/` untouched, production
and the production database never contacted (PROTOCOL.md §Environments).

---

## What to do

### Step 1 — record the BEFORE build, before you install anything

```
cd <dte>/front
npm run build
```

Paste the **whole route table** (the `Route (app) / Size / First Load JS` block) into
§Implementation Notes under **"BEFORE"**. This is the baseline for Step 8, and it is also the
measurement TASK-002's review deferred into this task (`/`'s weight through the `common` barrel).
If the build is not green before you start, **stop and @Sober** — do not install onto a red tree.

### Step 2 — install, with exact pins

```
npm i antd@6.4.3 @ant-design/nextjs-registry@1.3.0
```

Then **edit `front/package.json` so both are exact pins with no `^` and no `~`** (npm writes `^`
by default). The house pattern's version policy is explicit that caret ranges on the UI library
are the recurring source of peer/hydration bugs.

Hard rules for this step:

- **Do NOT install `@ant-design/v5-patch-for-react-19`.** It is a v5-only shim; with v6 its
  presence causes warnings. antd v6 supports React 19 natively.
- **Do NOT touch any other dependency.** Not `lucide-react`, not `typescript`, not `next`, not
  `react`, not Tailwind. The house pattern's lockset also names `dayjs`,
  `@tanstack/react-query`, `next-auth`, and different `lucide-react` / `typescript` majors —
  **none of those are adopted here** (SPEC-001 §Decision 4 rules out React Query and NextAuth;
  the rest have no consumer yet). Adding one is out of scope for this TASK.
- `@ant-design/cssinjs` arrives transitively through the registry. Do not add it by hand.

Evidence required: the `front/package.json` diff, and the output of

```
npm ls react
```

which **must show a single `react@19.2.7`**. A duplicate React is the real cause of "Invalid hook
call" and hydration errors; if you see two, stop and @Sober.

### Step 3 — the token mirror: `front/src/constants/theme-tokens.ts` (new file)

`src/styles/themes.css` stays the **single palette of record** (SPEC-001 §Decision 3). antd
cannot read CSS custom properties at SSR time, so this file is a **deliberate, mechanically
checkable mirror** of hex values that already live in `themes.css` — never a second palette.

Create it with a header comment saying exactly that, and with the values below, each carrying the
`themes.css` selector it was copied from:

| Constant | Value | Copied from `themes.css` |
|---|---|---|
| `colorPrimary` | `#0EA5E9` | `:root --color-primary` |
| `colorInfo` | `#0EA5E9` | `:root --color-primary` |
| `colorSuccess` | `#22C55E` | `:root --color-success` |
| `colorWarning` | `#FB923C` | `:root --color-warning` |
| `colorError` | `#EF4444` | `:root --color-danger` |
| light `colorBgBase` | `#FAFAF9` | `.light --bg-primary` |
| light `colorTextBase` | `#292524` | `.light --text-primary` |
| dark `colorBgBase` | `#1C1917` | `.dark --bg-primary` |
| dark `colorTextBase` | `#F5F5F4` | `.dark --text-primary` |

Also export `borderRadius: 8` (the house pattern's value; a shape token, so it has no
`themes.css` counterpart).

Shape it so a consumer asks for one theme — e.g.
`export const antdTokens = (mode: "light" | "dark") => ({ ... })`. The exact shape is yours, but
the light/dark difference must live in **this file**, not in the provider.

**The drift guard (a DoD item, not a suggestion):** every hex above must still be findable in
`themes.css`. Prove it with

```
for h in 0EA5E9 22C55E FB923C EF4444 FAFAF9 292524 1C1917 F5F5F4; do printf "%s " "$h"; grep -ic "$h" src/styles/themes.css; done
```

and paste the output. Every count must be `>= 1`.

### Step 4 — the provider: `front/src/contexts/AntdConfigProvider.tsx` (new file)

A `"use client"` component. It:

- calls `useTheme()` from `@/contexts/ThemeContext` and reads **`actualTheme`**;
- renders antd's `ConfigProvider` with
  `algorithm: actualTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm`
  and `token: antdTokens(actualTheme)` from Step 3;
- renders `{children}`.

It goes in `contexts/` because that is where this project keeps providers
(`FRONTEND-CONVENTIONS.md` §1 records `contexts/` as a deliberate deviation from the pattern's
`context/`). It is **not** a React context of its own — do not create one.

Do **not** set `locale` on `ConfigProvider` in this task. The app is `lang="th"`, but antd's Thai
locale only affects locale-sensitive components (DatePicker, Table pagination text, Empty) and
none exist yet; adding it now also drags `dayjs` in for nothing. **Deferred decision, recorded
here so it is not re-litigated:** the first TASK that introduces a locale-sensitive antd component
decides `locale` + `dayjs` then, and Sober writes it into that TASK. Do not decide it yourself.

Do **not** enable `cssVar` or `hashed: false`. Defaults only. If the light/dark flip turns out to
be visibly slow in Step 7, say so in §Questions — do not silently change the mode.

### Step 5 — wire `front/src/app/layout.tsx`

The nesting order is **fixed** and must be exactly this:

```
<body>
  <AntdRegistry>            {/* @ant-design/nextjs-registry — SSR style extraction */}
    <ThemeProvider>         {/* existing — owns actualTheme */}
      <AntdConfigProvider>  {/* Step 4 — reads actualTheme, feeds antd */}
        <AuthProvider>      {/* existing, unchanged */}
          <Navbar /> <main>{children}</main> <Footer />
```

Why this order: the registry must sit outside everything whose styles it collects, and the antd
provider must sit **inside** `ThemeProvider` because it consumes that context.

Change **nothing else in this file**. In particular `metadata.title` still carries the superseded
product name — that is **REQ-004's**, not yours, and touching it here would drag a copy change
into a dependency change (SPEC-001 §Non-functional). The double import of `themes.css` is
load-bearing (`FRONTEND-CONVENTIONS.md` §7b) — leave it.

### Step 6 — the first two wrappers

Create exactly two, in the house pattern's `Base<Component>` shape:

```
src/components/ui/Button/BaseButton.tsx   + index.ts
src/components/ui/Input/BaseInput.tsx     + index.ts
```

- `"use client"`, default export, props interface extends antd's own props type, `...props`
  spread through, `className` merged **last** so a caller can override.
- Tailwind overrides on a wrapper use the `!` suffix (`h-10! rounded-lg!`) — the pattern's answer
  to antd's specificity, and it belongs **only** in `components/ui/`, never in a page
  (`FRONTEND-CONVENTIONS.md` §2).
- `index.ts` re-exports named: `export { default as BaseButton } from "./BaseButton";`

**Two, not more, and no `components/ui/index.ts` root barrel.** A root barrel over antd wrappers
would pull antd into every module that imports anything from `ui/`. The existing flat `ui/*.tsx`
files (`CategoryCard`, `FeatureCard`, `StatCounter`, `PasswordInput`, `AnimatedBackground`) stay
exactly where they are and are **not** moved here — each moves with the screen that uses it.
Button and Input are chosen because they are what the first migration (`/login`) will need;
anything beyond that is speculative UI nobody has specced.

### Step 7 — prove the wiring, in a browser, in both themes (temporary probe route)

Create a **throwaway** route `src/app/dev-antd-check/page.tsx` rendering `BaseButton`,
`BaseInput`, and a plain antd `Card`, `Alert` and `Spin`. Then, with `npm run dev`:

1. Open `/dev-antd-check` in **light** and in **dark** (use the existing ThemeToggle).
2. Confirm the primary button is **`#0EA5E9`**, not antd's default `#1677ff`. That one check is
   what proves the token bridge is live rather than merely compiling. Say **how** you measured it
   (computed style / devtools colour picker) — "it looked blue" is not evidence.
3. Confirm the card and page background follow the theme (`#FAFAF9` light, `#1C1917` dark).
4. **Hazard to check explicitly: Tailwind preflight vs antd.** Tailwind's base reset sets
   `button { background-color: transparent }`, which has historically flattened antd's primary
   button. State plainly whether it happens here. If it does, fix it in **one** place —
   `globals.css`, inside `@layer base` (`FRONTEND-CONVENTIONS.md` §7 closing rule) — and write the
   rule and the reasoning into §Implementation Notes.
5. Check the browser console: **no hydration warning, no "Invalid hook call", no antd
   compatibility warning.** Paste what you actually saw (including "console clean").
6. Reload once with the theme set to dark and say whether there is a light flash before hydration.
   A flash is **expected and accepted** — `ThemeContext` resolves the theme in an effect, so the
   server always renders light; that is the app's existing behaviour, not something antd
   introduced. Record it; do not fix it here.

**Then delete `src/app/dev-antd-check/` entirely** and re-run the build (Step 8). The probe must
not survive this task — it would be a publicly routable page on a live site.

### Step 8 — the AFTER build, and the size delta

```
npm run build
npx tsc --noEmit
node <coordination-repo>/ai-worker/tests/harness/check-no-emoji.mjs <dte>/front/src
```

- Paste the **AFTER** route table beside the BEFORE one and state the **First Load JS delta for
  `/`** in kB. Expectation, to be confirmed or refuted by the number rather than assumed: `/` uses
  no antd component, so the delta should be **small**. A large jump means antd is being pulled
  into the shared chunk by the provider — that is a finding for @Sober, not something to absorb.
- `npx tsc --noEmit` must exit 0.
- The emoji checker will still report the **124-occurrence baseline**; that is expected and is not
  this task's bar. What matters is **zero hits in the files this task created or edited**
  (`FRONTEND-CONVENTIONS.md` §5). Say so explicitly, and name those files.

### Step 9 — housekeeping carried over from TASK-002 §Questions Q3

Add `*.tsbuildinfo` to the **repo-root** `.gitignore` (there is no `front/.gitignore`; the root
file has no such line today). `npx tsc --noEmit` writes `front/tsconfig.tsbuildinfo`, which shows
up as untracked for everyone who typechecks. One line, in the `# Misc` block.

### Step 10 — update `front/FRONTEND-CONVENTIONS.md`

§2 currently says antd is "**not installed yet** — that is TASK-003. Do not import `antd` before
then." Update §2 and §3 to describe what now exists: the pinned versions, the registry/provider
nesting order, `constants/theme-tokens.ts` as the mirror-with-a-guard, the `Base<Component>`
wrapper rule, and the "no `ui/` root barrel" rule from Step 6. **Describe the decisions; do not
make new ones** — that file's own preamble says a missing decision goes back to the SA Lead.

---

## Definition of Done

- [ ] **BEFORE** build green and its route table pasted in §Implementation Notes.
- [ ] `front/package.json` shows `"antd": "6.4.3"` and `"@ant-design/nextjs-registry": "1.3.0"` —
      **exact, no `^`/`~`** — and no other dependency changed (paste the `package.json` diff).
- [ ] `npm ls react` prints a **single** `react@19.2.7` (pasted).
- [ ] `npm ls @ant-design/v5-patch-for-react-19` pasted, showing it is **not** installed.
- [ ] `src/constants/theme-tokens.ts` exists, mirrors the 9 values of Step 3, and the drift-guard
      loop output is pasted with every count `>= 1`.
- [ ] `src/contexts/AntdConfigProvider.tsx` exists, is `"use client"`, reads `actualTheme`, sets
      the algorithm and tokens, and sets **no** `locale` and **no** `cssVar`.
- [ ] `layout.tsx` nesting is exactly `AntdRegistry > ThemeProvider > AntdConfigProvider >
      AuthProvider`; `metadata.title` **unchanged**; the `themes.css` double import intact
      (paste the diff — it should be small).
- [ ] `components/ui/Button/` and `components/ui/Input/` exist with `Base*.tsx` + `index.ts`;
      there is **no** `components/ui/index.ts`; the five existing flat `ui/*.tsx` files are
      untouched (`git status` shows them unmodified).
- [ ] Browser evidence from Step 7 in **both** themes: primary button measured as `#0EA5E9` with
      the method stated, backgrounds follow the theme, **console output pasted**, and the
      Tailwind-preflight question answered yes/no (with the fix if yes).
- [ ] `src/app/dev-antd-check/` is **deleted**; `git status` proves no probe file remains.
- [ ] **AFTER** build green, route table pasted, `/` First Load JS delta stated in kB.
- [ ] `npx tsc --noEmit` exits 0 (paste the exit code).
- [ ] Emoji checker run; **zero hits in the files this task created or edited**, those files named
      (the 124 baseline elsewhere is expected).
- [ ] `*.tsbuildinfo` is in the repo-root `.gitignore`.
- [ ] `front/FRONTEND-CONVENTIONS.md` §2/§3 updated per Step 10.
- [ ] Nothing in `back/` changed; no commit, no push, no deploy; production never contacted.
- [ ] Anything you could not actually run is written as `UNVERIFIED — <what would settle it>`.

## Implementation Notes

Filled by Fern (FE), 2026-09-07. All work local; nothing committed, pushed or deployed;
`back/` untouched; production and the production DB never contacted.

### Files created

- `front/src/constants/theme-tokens.ts`
- `front/src/contexts/AntdConfigProvider.tsx`
- `front/src/components/ui/Button/BaseButton.tsx` + `index.ts`
- `front/src/components/ui/Input/BaseInput.tsx` + `index.ts`

### Files edited

- `front/package.json` (2 dependency lines)
- `front/package-lock.json` (npm's own)
- `front/src/app/layout.tsx` (2 imports + nesting)
- `front/FRONTEND-CONVENTIONS.md` (§2, §3)
- `.gitignore` at the **repo root** (1 line)

### Created and DELETED again (probe)

- `front/src/app/dev-antd-check/page.tsx` — deleted; `git status` below proves nothing remains.

---

### 🔴 Two findings for @Sober before anything else

**F1 — the First Load JS delta is NOT small: `+100.8 kB` uncompressed on `/`, and the same
`+100.8 kB` on every single route.** Step 8 predicted a large jump would mean "antd is being
pulled into the shared chunk by the provider — that is a finding for @Sober, not something to
absorb." That is exactly what the numbers say: the rise is uniform across all 13 routes, so it is
the shared chunk, not any page. Cause is structural and inherent to the nesting this TASK
specifies — `AntdConfigProvider` sits in the root layout and imports antd's `ConfigProvider` +
`theme`, which drags antd's token/algorithm engine and `@ant-design/cssinjs` into every entry.
I did **not** try to work around it (that would be a design change). Numbers in §Step 8 below.
**UNVERIFIED — the gzipped/Brotli delta.** Next 16 + Turbopack reports only
`firstLoadUncompressedJsBytes`, and the BEFORE chunks were overwritten by the AFTER build, so I
could not measure the compressed delta the user actually downloads. What would settle it: a build
of each state with the chunk files gzipped and compared.

**F2 — antd v6 emits CSS variables BY DEFAULT.** I did not set `cssVar` (Step 4 forbade it), but
v6 emits a `css-var-*` class on every antd element anyway, and the theme is delivered as
`--ant-color-*` custom properties. The deferred `cssVar` call therefore is not "off vs on" — it
is "leave the v6 default alone vs explicitly configure it". Recorded, not decided. See §Questions
Q1.

---

### Step 1 — BEFORE build (green)

```
$ cd <dte>/front && npm run build
▲ Next.js 16.2.9 (Turbopack)
✓ Compiled successfully in 3.9s
  Finished TypeScript in 5.5s ...
✓ Generating static pages using 11 workers (14/14) in 655ms
```

**Note on the route table the TASK asked for:** Next 16 + Turbopack **no longer prints a
`Size / First Load JS` table**. The printed table is routes + render mode only:

```
Route (app)
┌ ○ /                 ├ ○ /_not-found     ├ ○ /about       ├ ○ /blog
├ ƒ /classroom/[id]   ├ ○ /contact        ├ ○ /courses     ├ ○ /login
├ ○ /portfolio        ├ ○ /register       ├ ○ /services    ├ ○ /teach
└ ○ /verify-email
○  (Static) prerendered   ƒ  (Dynamic) server-rendered on demand
```

The sizes still exist, in `front/.next/diagnostics/route-bundle-stats.json`
(`firstLoadUncompressedJsBytes` per route). That is the measurement used for Step 8:

```
$ node -e "const m=require('.../.next/diagnostics/route-bundle-stats.json');
           for(const r of m) console.log(r.route.padEnd(20),(r.firstLoadUncompressedJsBytes/1024).toFixed(1)+' kB')"
```

### Step 2 — install, exact pins

```
$ npm i antd@6.4.3 @ant-design/nextjs-registry@1.3.0
added 64 packages, and audited 157 packages in 24s
```

npm wrote `^`; both were edited to exact. `git diff front/package.json` — 2 lines, nothing else:

```
@@ -8,9 +8,11 @@
   "dependencies": {
+    "@ant-design/nextjs-registry": "1.3.0",
     "@headlessui/react": "^2.2.9",
     "@heroicons/react": "^2.2.0",
     "@next/third-parties": "16.2.9",
+    "antd": "6.4.3",
     "axios": "^1.12.2",
```

Single React (every antd/registry subtree is `deduped`; full 90-line tree not retold):

```
$ npm ls react
front@0.1.0 H:\dte\dte\front
+-- @ant-design/nextjs-registry@1.3.0
| +-- @ant-design/cssinjs@2.1.2
| | `-- react@19.2.7 deduped
| `-- react@19.2.7 deduped
...
+-- antd@6.4.3
| ... (every child) `-- react@19.2.7 deduped
`-- react@19.2.7
```

Only one non-deduped `react@19.2.7` in the whole tree. The v5 shim is absent:

```
$ npm ls @ant-design/v5-patch-for-react-19
front@0.1.0 H:\dte\dte\front
`-- (empty)
```

`@ant-design/cssinjs@2.1.2` arrived transitively, as expected. No other dependency touched.

### Step 3 — `src/constants/theme-tokens.ts` + drift guard

All 9 values mirrored, each annotated with its `themes.css` selector, plus `borderRadius: 8`.
Shape is `antdTokens(mode: "light" | "dark")`; the light/dark split lives in the file, not the
provider. Drift guard:

```
$ for h in 0EA5E9 22C55E FB923C EF4444 FAFAF9 292524 1C1917 F5F5F4; do printf "%s " "$h"; grep -ic "$h" src/styles/themes.css; done
0EA5E9 2
22C55E 1
FB923C 1
EF4444 1
FAFAF9 1
292524 2
1C1917 2
F5F5F4 2
```

Every count `>= 1`.

### Step 4 — `src/contexts/AntdConfigProvider.tsx`

`"use client"`, reads `useTheme().actualTheme`, sets
`algorithm: actualTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm` and
`token: antdTokens(actualTheme)`. **No `locale`. No `cssVar`. No `hashed`.** Not a context of its
own. (See F2 — v6's own default still produces CSS variables.)

### Step 5 — `layout.tsx`

`git diff` (the `Navbar/Footer` barrel line in the same hunk is **TASK-002's**, already in the
working tree before I started — my change is the 2 added imports and the nesting):

```
+import { AntdRegistry } from "@ant-design/nextjs-registry";
+import AntdConfigProvider from "@/contexts/AntdConfigProvider";
@@
-        <ThemeProvider>
-          <AuthProvider>
+        <AntdRegistry>
+          <ThemeProvider>
+            <AntdConfigProvider>
+              <AuthProvider>
```

`metadata.title` untouched. Both `themes.css` imports intact.

### Step 6 — the two wrappers

`ui/Button/BaseButton.tsx` (+`index.ts`), `ui/Input/BaseInput.tsx` (+`index.ts`). `"use client"`,
default export, props extend antd's `ButtonProps` / `InputProps`, `...props` spread,
`className` merged last, `!`-suffixed Tailwind (`rounded-lg!`, `h-10! rounded-lg!`).
**No `components/ui/index.ts`** was created. The five flat legacy `ui/*.tsx` files are untouched
— they do not appear in `git status` below.

### Step 7 — browser evidence (`npm run dev`, `http://localhost:3000/dev-antd-check`)

**Measurement method:** Chrome DevTools protocol via `getComputedStyle()` on the live elements —
both the resolved `background-color` and the underlying antd CSS custom properties. Not eyeballed.
(Caveat worth recording: a `getComputedStyle` read issued in the same JS context immediately after
navigation returned pre-hydration values twice; every number below is from a settled read that
agrees with the screenshot.)

**LIGHT** (`<html class="light">`, `actualTheme="light"`):

| measured | value |
|---|---|
| primary button `background-color` | `rgb(14, 165, 233)` = **`#0EA5E9`** ✅ (antd default `#1677ff` is NOT in play) |
| button `border-radius` | `8px` |
| `--ant-color-primary` / `--ant-color-info` | `#0ea5e9` |
| `--ant-color-success` / `-warning` / `-error` | `#22c55e` / `#fb923c` / `#ef4444` |
| `--ant-color-bg-base` | `#FAFAF9` |
| `--ant-color-text-base` | `#292524` |
| `--ant-border-radius` | `8px` |
| antd Card `background-color` | `rgb(250, 250, 249)` = `#FAFAF9` ✅ |
| `BaseInput` height / radius | `40px` / `8px` (the `h-10!` override wins) |

**DARK** (`<html class="dark">`, `actualTheme="dark"`):

| measured | value |
|---|---|
| `--ant-color-bg-base` | **`#1C1917`** ✅ exactly our token |
| `--ant-color-text-base` | **`#F5F5F4`** ✅ exactly our token |
| `--ant-border-radius` | `8px` |
| `--ant-color-primary` | `#0f8fc9` |
| primary button `background-color` | `rgb(15, 143, 201)` = `#0F8FC9` |
| antd Card `background-color` | `rgb(54, 44, 38)` = `#362C26`; text `rgba(245,245,244,.85)` |

**Read the two dark numbers carefully — they are derivations, not drift.** `darkAlgorithm` maps
the *base* tokens onto a dark scale: it shifts our `#0EA5E9` to `#0F8FC9`, and lifts
`colorBgBase #1C1917` to a container `#362C26`. That `#362C26` is a **warm** stone tone
(R>G>B) — antd's own dark base `#000000` derives a *neutral* `#141414`, so the warmth is proof
our base is what is feeding the algorithm. The two values the algorithm passes through
untouched — `colorBgBase` and `colorTextBase` — came out as our exact hexes.

**7.4 — Tailwind preflight vs antd: NO, it does not happen here.** The rule does exist:

```
button, input, select, optgroup, textarea { font: inherit; letter-spacing: inherit;
  color: inherit; opacity: 1; background-color: rgba(0, 0, 0, 0); border-radius: 0px; }
```

but Tailwind 4 emits it **inside `@layer base`**, while antd's styles are **unlayered** — and
unlayered beats every layer. Measured result: the primary button is a solid `#0EA5E9` with an
`8px` radius, i.e. preflight loses on both properties it would have flattened.
**No `globals.css` change was made and none was needed.**

**7.5 — console.** Clean. Full tail after a fresh load:

```
[info] Download the React DevTools for a better development experience...
[log]  [HMR] connected
[log]  Current user: null      (x6 — AuthContext's own pre-existing log)
[log]  [Fast Refresh] rebuilding / done in 174ms
```

No hydration warning, no "Invalid hook call", no antd compatibility warning. Two things seen
earlier and resolved/discounted: (a) `Warning: [antd: Alert] 'message' is deprecated. Please use
'title' instead.` — **my probe's own fault**; antd v6 renamed `Alert`'s `message` prop to
`title`, I fixed the probe and the warning went. Worth knowing before TASK-004+ writes Alerts.
(b) repeated `WebSocket connection to 'ws://localhost:3000/_next/webpack-hmr' failed` — Next dev
HMR noise from a stale socket, unrelated to antd (it names webpack, not antd).

**7.6 — light flash on a dark reload: YES, present, and pre-existing.** Evidence, not impression:

```
$ curl -s http://localhost:3000/dev-antd-check | grep -o '<html[^>]*>'
<html lang="th">
$ curl -s http://localhost:3000/dev-antd-check | grep -o -- '--ant-color-primary:#[0-9a-fA-F]*'
--ant-color-primary:#0ea5e9
```

The server ships **no theme class** and the light token set; `ThemeContext` resolves the theme in
an effect, so the first paint is always light. I also observed the flip directly (a read right
after navigation returned light values, then dark). Recorded and **not** fixed here, per Step 7.6.
The flip itself is a CSS-variable swap (F2) and was not visibly slow.

**Probe deleted.** `rm -rf src/app/dev-antd-check` — `ls src/app` no longer lists it, and
`git status` below shows no probe file.

### Step 8 — AFTER build, typecheck, emoji

```
$ npm run build
✓ Compiled successfully
✓ Generating static pages using 11 workers (14/14) in 889ms
   (same 13-route table as BEFORE; no route added or removed)

$ npx tsc --noEmit ; echo "tsc exit=$?"
tsc exit=0
```

First Load JS, uncompressed, per route — the numbers behind **F1**:

| Route | BEFORE | AFTER | Δ |
|---|---|---|---|
| **`/`** | **561.7 kB** | **662.5 kB** | **+100.8 kB** |
| `/teach` | 546.4 | 647.2 | +100.8 |
| `/register` | 543.6 | 644.3 | +100.7 |
| `/classroom/[id]` | 540.5 | 641.3 | +100.8 |
| `/login` | 533.2 | 634.0 | +100.8 |
| `/portfolio` | 531.5 | 632.2 | +100.7 |
| `/verify-email` | 531.4 | 632.1 | +100.7 |
| `/contact` | 531.1 | 631.9 | +100.8 |
| `/about` | 527.2 | 628.0 | +100.8 |
| `/courses` | 525.9 | 626.7 | +100.8 |
| `/_not-found` · `/blog` · `/services` | 524.3 | 625.1 | +100.8 |

Emoji checker:

```
$ node ai-worker/tests/harness/check-no-emoji.mjs <dte>/front/src
...
124 occurrence(s) in 45 file(s) scanned.
```

The 124 baseline is unchanged, as expected. **Zero hits in every file this TASK created or
edited** — verified by filtering the checker's own output for them, which returns nothing:
`constants/theme-tokens.ts`, `contexts/AntdConfigProvider.tsx`,
`components/ui/Button/{BaseButton.tsx,index.ts}`, `components/ui/Input/{BaseInput.tsx,index.ts}`,
`app/layout.tsx`.

### Step 9 — `.gitignore`

```
$ git diff .gitignore
@@ -55,3 +55,4 @@
  .cache/
  .parcel-cache/
  .eslintcache
+*.tsbuildinfo
```

`front/tsconfig.tsbuildinfo` no longer appears in `git status`.

### Step 10 — `front/FRONTEND-CONVENTIONS.md`

§2 rewritten from "not installed yet" to the installed state: the two exact pins, why no caret,
why `@ant-design/v5-patch-for-react-19` is deliberately absent, the `Base<Component>` wrapper
rules, the "no `ui/` root barrel" rule, and the measured preflight verdict. §3 gained "How the
bridge is built": `theme-tokens.ts` as mirror-with-a-grep-guard, the provider's job, the fixed
nesting block, the two deferred calls (`locale`/`dayjs`, `cssVar` — with F2 noted), and the
accepted light flash. Decisions described, none made.

### Final `git status --short` (whole repo)

```
 M .gitignore
 M front/next-env.d.ts          <- pre-existing (Next regenerates it; not mine)
 M front/package-lock.json
 M front/package.json
 M front/src/app/layout.tsx
 M front/src/app/page.tsx       <- TASK-002's, pre-existing
 M front/src/components/layout/Navbar.tsx   <- TASK-002's, pre-existing
?? front/FRONTEND-CONVENTIONS.md            <- TASK-002's file, edited by me
?? front/src/components/common/index.ts     <- TASK-002's
?? front/src/components/layout/index.ts     <- TASK-002's
?? front/src/components/partials/           <- TASK-002's
?? front/src/components/ui/Button/          <- MINE
?? front/src/components/ui/Input/           <- MINE
?? front/src/constants/theme-tokens.ts      <- MINE
?? front/src/contexts/AntdConfigProvider.tsx <- MINE
?? front/src/hooks/  ?? front/src/lib/api/  ?? front/src/types/   <- TASK-002's
```

**Nothing under `back/`. No `dev-antd-check`. No `components/ui/index.ts`. No commit, no push,
no deploy, production never contacted.**

## Questions

**Q1 — `cssVar`: the deferred call is not the call the TASK expected. @Sober**
Step 4 said "do not enable `cssVar`", and I did not pass it. But antd v6 emits CSS variables by
**default** — every antd element carries a `css-var-*` class and the theme arrives as
`--ant-color-*` properties (measured, §Step 7). So the open decision is now "leave v6's default
alone, or explicitly configure `cssVar`", and the TASK's premise that it is currently off is not
what the browser shows. Recorded, not decided — this is yours.

> **answer (Sober, 2026-09-08): leave v6's default alone — `cssVar` is CLOSED, not deferred.**
> Do not pass `cssVar`, and do not pass `hashed`, here or in any later TASK. Reasons: (a) the
> default is the configuration that was actually measured working end to end — SSR extraction
> through `AntdRegistry`, console clean, both themes correct, the flip a variable swap;
> (b) `cssVar: true` would only restate the default; (c) `cssVar: false` would trade that swap
> for a re-render of hashed styles, for no stated need. Your correction of the TASK's premise is
> accepted and is the right kind of finding. `FRONTEND-CONVENTIONS.md` §3 already describes v6's
> default accurately — no edit needed. This reopens only if some TASK ever needs two
> `ConfigProvider`s over different subtrees, and it reopens with me, never inside a screen TASK.

**Q2 — F1, the `+100.8 kB` uncompressed on every route. @Sober**
Step 8 told me to escalate a large jump rather than absorb it, so I am escalating it: it is
uniform across all 13 routes, i.e. the shared chunk, and it follows directly from the nesting this
TASK fixes (the root layout imports antd's `ConfigProvider` + `theme`). Any remedy — lazy-loading
the provider, scoping it below the layout, or accepting the cost — is a design decision, not
mine. **I have changed nothing about it.**

> **answer (Sober, 2026-09-08): escalating was correct — this is NOT rework, and you change
> nothing. The remedy is mine and it is not decided today.** What I have settled:
> - **Rejected now: lazy-loading the provider (`dynamic(..., { ssr: false })`).** It reintroduces
>   exactly the FOUC/hydration mismatch `AntdRegistry` exists to prevent. Nobody is to try it.
> - **Accepted for now: the cost stands as shipped.** No screen renders antd yet, so today the
>   `+100.8 kB` buys nothing on any route; that is an argument for settling it before the screen
>   migrations pile more on, not for reverting a correctly-built bridge.
> - **The only candidate worth measuring** is scoping the antd provider below the root layout —
>   a route group covering the app surfaces (`/login`, `/register`, `/verify-email`, `/teach`,
>   `/classroom/[id]`, `/courses`) while the marketing pages (`/`, `/about`) stay antd-free.
>   Whether that is worth the split depends on the compressed number (Q3), which I do not have.
> - **This does NOT block TASK-004+.** If the provider later moves into a route-group layout,
>   that is a change to layout files only; no screen's own code changes. Screen migrations
>   proceed while I settle it.
> I own the follow-up unit (measure, then decide); it is recorded on the board and in SPEC-001.

**Q3 — the compressed number I could not produce. @Sober**
`UNVERIFIED — the gzip/Brotli First Load JS delta.` Next 16 + Turbopack prints no size table at
all (the sizes now live in `.next/diagnostics/route-bundle-stats.json`, uncompressed only), and
the BEFORE chunk files were overwritten by the AFTER build. If the compressed number matters for
judging Q2, it needs a deliberate two-build measurement — say so and I will run it.

> **answer (Sober, 2026-09-08): yes, it matters, and no, not now and not as rework of TASK-003.**
> The compressed number is the input to the Q2 decision, so it is the first half of the follow-up
> unit I just took — it will arrive as its own small measurement TASK with the method written
> down (including how to obtain a BEFORE state without leaving the tree half-uninstalled), not as
> an ad-hoc run. **Do not run anything for this yet, and do not uninstall antd to get a BEFORE.**
> The `UNVERIFIED — gzip/Brotli First Load JS delta` stands as written and is carried openly on
> the board; so does the fact that the BEFORE uncompressed table cannot be reproduced from the
> current tree. Reporting both instead of estimating them was the right call.

**Q4 — antd v6 renamed `Alert`'s `message` prop to `title`. @Sober**
Found the hard way on the probe (a console deprecation warning). Not an issue in this TASK — no
screen uses `Alert` — but TASK-004+ and any copied v5 snippet will hit it. Flagging so it lands in
a SPEC/TASK rather than being rediscovered per screen.

> **answer (Sober, 2026-09-08): taken, and it lands in the TASK layer, not per screen.** From now
> on every screen TASK I write that renders `Alert` states `title` (v6) explicitly, and the first
> such TASK also instructs a short "v5 → v6 API differences" list in `FRONTEND-CONVENTIONS.md` §2
> so a copied v5 snippet is caught by the doc rather than by a console warning. **Do not add that
> list now** — an empty list of one item invites guessing at the rest, and I am not going to
> enumerate v6 breaking changes we have not actually hit. Add each one as it is met, with the
> TASK that met it.

## Review

**Verdict: DONE** — reviewed 2026-09-08 by Sober (SA Lead). No rework. Both findings (F1, F2)
were escalations the TASK explicitly asked for, not defects; answers are in §Questions Q1–Q4.

### What I re-ran myself, on the tree as it sits (not read from the notes)

| Check | Result |
|---|---|
| `front/package.json` | `"antd": "6.4.3"`, `"@ant-design/nextjs-registry": "1.3.0"` — exact, no `^`/`~`; no other dependency changed vs. the list TASK-001/002 left behind |
| `layout.tsx` nesting | `AntdRegistry > ThemeProvider > AntdConfigProvider > AuthProvider` — exactly as specified |
| `layout.tsx` `metadata.title` | still `"DTE - Disrupt Thai Education \| …"` — **correctly untouched**; it is REQ-004's |
| both `themes.css` imports | intact |
| `src/constants/theme-tokens.ts` | all 9 values present, each annotated with its `themes.css` selector, `borderRadius: 8`; light/dark split lives in the file, not the provider |
| drift guard (re-run by me) | `0EA5E9 2 · 22C55E 1 · FB923C 1 · EF4444 1 · FAFAF9 1 · 292524 2 · 1C1917 2 · F5F5F4 2` — every count `>= 1` |
| `AntdConfigProvider.tsx` | `"use client"`, reads `actualTheme`, sets algorithm + tokens, **no `locale`, no `cssVar`, no `hashed`**, not a context of its own |
| the two wrappers | `ui/Button/` and `ui/Input/` with `Base*.tsx` + named-re-export `index.ts`; props extend antd's own types; `...props` spread; caller `className` merged **last**; `!`-suffixed Tailwind only inside `ui/` |
| **no** `components/ui/index.ts` | confirmed absent |
| the five flat legacy `ui/*.tsx` | all present and unmoved |
| probe route | `src/app/dev-antd-check/` **gone**; `ls src/app` lists only the 13 real routes |
| `npm run build` (re-run by me) | green, 14/14 static pages, same 13-route table; and it confirms Fern's claim that Next 16 + Turbopack prints **no** `Size / First Load JS` column any more |
| `route-bundle-stats.json` (re-read by me) | `/` **662.5 kB**, `/teach` 647.2, … `/services` 625.1 — **identical to the AFTER column in §Step 8** |
| `npx tsc --noEmit` (re-run by me) | exit `0` |
| emoji harness (re-run by me) | `124 occurrence(s) in 45 file(s)` — baseline unchanged; filtering its output for this TASK's created/edited files returns **nothing** |
| repo-root `.gitignore` | `*.tsbuildinfo` present in the `# Misc` block |
| `FRONTEND-CONVENTIONS.md` §2/§3 | rewritten to the installed state, incl. the measured preflight verdict, the mirror-with-a-grep-guard, the fixed nesting block and the two deferred calls. **Describes; decides nothing** — as instructed |
| `back/` | untouched |

### Accepted on the engineer's own evidence (I did not re-run a browser)

Step 7 is the one part I cannot re-verify from a file read, and it is the part that proves the
bridge is live rather than merely compiling. It is accepted because the **method is stated and
is a measurement**: `getComputedStyle()` over the DevTools protocol, resolved colours *and* the
underlying `--ant-*` properties, in both themes, with the pre-hydration-read caveat disclosed.
Light `#0EA5E9` (not antd's `#1677ff`), dark `colorBgBase`/`colorTextBase` passing through as
`#1C1917`/`#F5F5F4`, and the warm `#362C26` container that shows *our* base is feeding
`darkAlgorithm` — that reasoning is right, and calling the two shifted dark values derivations
rather than drift is exactly the distinction I would have asked for. Preflight-vs-antd answered
with the actual cascade rule (`@layer base` loses to unlayered) and no speculative
`globals.css` fix: correct restraint. Console pasted, including the two warnings found and
disposed of. Light-flash-on-dark-reload confirmed by `curl` against the SSR HTML — evidence, not
impression — and correctly left unfixed.

### Carried forward, openly

1. **`UNVERIFIED — the gzip/Brotli First Load JS delta`** (Q3). Owed to the follow-up unit.
2. **The BEFORE uncompressed route table cannot be reproduced** from the current tree (its chunks
   were overwritten). It stands as Fern reported it; the AFTER half I verified independently.
3. **`+100.8 kB` uncompressed on every route** (F1/Q2) — accepted as shipped, remedy undecided,
   owned by me, not blocking TASK-004+. Porter is told, so the owner hears it from us before he
   hears it from a slow page.
4. **Owner's own eyes.** Nothing user-visible was meant to change in this TASK, and nothing
   observed says otherwise — but no screen uses antd yet, so the first real proof of the bridge
   comes with the first migrated screen, not from here.

### Two small notes, neither of them rework

- `export interface BaseButtonProps extends ButtonProps {}` (and the Input twin) is an empty
  extending interface. Harmless today — `front/` has **no lint script** — but it is what
  `@typescript-eslint/no-empty-object-type` flags, so if a lint step is ever added, expect it.
  Deliberately not "fixed": the named interface is the extension point the next wrapper props
  will hang off, and renaming it later would churn imports.
- The `Alert` `message` → `title` rename (Q4) is now the SA layer's to carry, per the answer
  above.
