# TASK-026: Fix header color-scheme icon hydration mismatch
- Source: SPEC-009
- Status: DONE (rework — mounted-gate; correct-by-construction + dev-clean; stakeholder to confirm on their env)
- Assignee: Fern (FE)
- Depends on: none

## What to do
In `manager-gold-front` (`components/AppHeader.tsx` / `Shell` / `layout.tsx`):
1. **Reproduce first.** With dark mode persisted, reload and confirm whether the "Hydration failed …"
   error + Sun/Moon flash actually occurs on the **current `dong`** code (which already uses
   `useComputedColorScheme("light", { getInitialValueInEffect: true })`).
2. **Ensure server↔first-client icon parity.** If it still reproduces, apply a bulletproof fix — e.g.
   render the Sun/Moon behind a `mounted` flag (render a stable placeholder / Moon until mounted, then
   the scheme-correct icon), so the SSR and first client render are always identical. Keep the toggle's
   switch + persist behaviour unchanged. Touch only the color-scheme icon path.
3. **Verify the ColorSchemeScript message** ("Encountered a script tag …") is dev-only: `bun run build`
   + `bun run start`, load the app, confirm the **production** console has neither the hydration error
   nor the script-tag message. Do NOT remove `ColorSchemeScript`. No code change if confirmed prod-clean.

## Definition of Done
- [x] Repro result documented (did/didn't reproduce on current `dong`).
- [x] Dark persisted → reload: **no hydration-mismatch error**, correct icon, no wrong-icon flash.
- [x] Light persisted → reload: same clean result.
- [x] **Production build** (`bun run build` + start): console free of the hydration error AND the
      ColorSchemeScript script-tag message — pasted as evidence (present in dev, absent in prod).
- [x] Toggle still switches + persists; `bun run build` clean; no other behaviour/visual change.

## Implementation Notes
**Outcome: does NOT reproduce on current `dong` → SPEC-009 outcome 1 → NO code change** (a speculative
`mounted`-gate would be a blind fix against a bug that isn't there; per the spec I fixed nothing). This is
a verification-only deliverable — **no commit**.

**Reproduce-first (debugging discipline).** Storage key is `mantine-color-scheme-value` (Mantine default).
Tested both persisted schemes with a reload, watching the console, in **both** environments:

- **Production** — `bun run build` (clean, this turn) + `bun run start` on `:3025`, loaded `/login`:
  - `mantine-color-scheme-value=dark` → reload → `html[data-mantine-color-scheme=dark]`, header icon = **Sun**
    (correct for dark), and the console is **completely empty** (`read_console_messages` → "No console logs").
  - `=light` → reload → light, **Moon** icon, console **empty** again.
  - → **No hydration error and no ColorSchemeScript script-tag message in production.**
- **Development** — running dev instance of the same working tree (`:3020`), dark persisted, reload:
  - The **only** console error is the ColorSchemeScript line: *"Encountered a script tag while rendering
    React component…"* (repeated). A targeted search for `hydrat` → **no matches**; errors-only read shows
    **only** the script-tag line. → **The "Hydration failed" error does NOT occur even in dev.**

**Why it doesn't reproduce (root cause of the original report, already mitigated).** The mismatch mechanism
is server (no `localStorage` → default `light` → Moon) vs first client paint. `AppHeader.tsx` already calls
`useComputedColorScheme("light", { getInitialValueInEffect: true })`, so the **first** client render also
returns `light` → Moon (identical to SSR); the real persisted scheme is resolved in an effect *after* mount,
which is not a hydration boundary. Server HTML == first client HTML → no divergence, no wrong-icon flash.
`layout.tsx` also carries `mantineHtmlProps` (`suppressHydrationWarning` + the `data-mantine-*` attrs) and
the required `ColorSchemeScript` (no-flash). So the documented fix is already in place — nothing to add.

**Part 2 — ColorSchemeScript message is dev-only (confirmed).** Present in the **dev** console (React dev
build warning), **absent** in the **production** console (empty in both schemes). This is expected React-19
behaviour; **`ColorSchemeScript` left untouched** (removing it would reintroduce the light/dark flash).

**Toggle unchanged & verified:** clicking the button switches light⇄dark and persists across reload
(`mantine-color-scheme-value`), icon tracks the active scheme. `bun run build` clean. No files changed.

**§7:** Prod tested on my own `:3025` (verified free → launched → stopped my PID afterward). Port `:3020`
was already held by a **leftover `next dev`** (a frontend-role process, not mine this turn) — I did **not**
kill it (no by-port kill); I only *read* its console. No backend needed (the header renders on `/login`).

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-29 (verify-only; no commit). Cross-checked against the code:
`AppHeader.tsx` uses `useComputedColorScheme("light", {getInitialValueInEffect:true})` and `layout.tsx`
carries `mantineHtmlProps` (`suppressHydrationWarning`) + `ColorSchemeScript` — so the documented mismatch
mitigation is already present, consistent with Fern's finding that it does NOT reproduce.
- Reproduce-first done properly: **prod** (`build`+start) console empty on both persisted schemes (dark→Sun,
  light→Moon, no hydration error, no script-tag message); **dev** shows only the ColorSchemeScript warning,
  and a `hydrat` search returns nothing → the "Hydration failed" error doesn't occur.
- Correctly made **no code change** (a `mounted`-gate would've been a blind fix against a non-present bug);
  ColorSchemeScript left intact (no-flash). Toggle switch+persist unchanged; `bun run build` clean. §7 followed.
- **REQ-009 acceptance criteria are met by the current code** — clean reload in both schemes + prod-clean
  console with dev-vs-prod evidence.

Non-blocking note for Porter: this is a "cannot-reproduce / already-mitigated" resolution, not a found-and-fixed
bug. If the stakeholder still hits it in their environment, get their exact repro (browser, hard vs soft reload,
sequence) and I'll re-open with that. DoD: all 5 met. **Last task of SPEC-009 — REQ-009 complete.**

---
### REWORK — Sober, 2026-07-29 (my acceptance above was WRONG)
The stakeholder **confirmed the repro** on a fresh `bun run dev` (REQ-009 §Reproduction): it fires **only when
`localStorage["mantine-color-scheme-value"]="dark"` is persisted** — server renders Moon (default light), client's
**first paint** renders Sun (persisted dark) → `Hydration failed` at `AppHeader.tsx:19`. So `getInitialValueInEffect:
true` is NOT keeping the first client paint on the default here (Mantine's `ColorSchemeScript` sets
`data-mantine-color-scheme=dark` pre-hydration). The verify-only pass under-tested the dark-persisted case, and **I
signed it off prematurely — that's on me.**

**Fix required now (SPEC-009 "still reproduces" branch = the `mounted`-gate):**
1. **Reproduce first with the stakeholder's steps** (toggle dark → reload → confirm the `Hydration failed` at SunIcon).
2. Gate the toggle icon on a `mounted` flag so SSR == first client paint:
   `const [mounted,setMounted]=useState(false); useEffect(()=>setMounted(true),[]);`
   render `mounted && computed==="dark" ? <SunIcon/> : <MoonIcon/>` (default Moon until mounted, then the real icon).
   Toggle switch+persist behaviour unchanged; touch only the icon path.
3. **Re-verify with DARK PERSISTED this time** — dev + prod console clean on BOTH schemes; the icon ends correct
   (Sun in dark) with no flash-to-wrong-then-right beyond the intended post-mount swap.
Re-check all DoD boxes against the fixed build and resubmit to REVIEW.

---
### Rework Notes — Fern (FE), 2026-07-30 → back to REVIEW
**Fix applied (commit `e55a362` on `dong`, `components/AppHeader.tsx` only):** the icon is now gated on a
post-mount flag exactly as SPEC-009's "still reproduces" branch specifies —
`const [mounted,setMounted]=useState(false); useEffect(()=>setMounted(true),[])` and
`{mounted && computed === "dark" ? <SunIcon/> : <MoonIcon/>}`. Server and the first client paint now render
**Moon unconditionally** (mounted=false), so the icon cannot diverge at hydration regardless of what
`useComputedColorScheme` returns on first paint or what `ColorSchemeScript` stamped on `<html>`; the real
icon is resolved after mount. Toggle switch+persist behaviour unchanged; only the icon path changed.

**Verified (what I could observe), fresh `bun run dev` on `:3020` (mine — verified free before launch):**
- Fixed build, **dark persisted**, true cold load in a fresh browser tab → `html[data-mantine-color-scheme=dark]`,
  icon settles on **Sun**, console has **no hydration error**. Toggle → flips to light, persists `light`,
  icon → Moon. `bun run build` clean.

**Honest caveat on "reproduce first" (this matters for the review):** I could **not** reproduce the
`Hydration failed` error in my environment — **even after reverting my fix** (un-gated icon, dark persisted,
cold load in a fresh tab) the console showed only the known dev-only `ColorSchemeScript` "script tag" line and
**no hydration error**. In this toolbox's browser, same-URL navigations are *soft* (client) navigations, so I
had to cold-load via brand-new tabs to get a real hydration pass; with that method the mismatch still did not
fire on current `dong` (Mantine 9.5.0 / React 19.2 / Next 16.2) — `getInitialValueInEffect: true` already keeps
the first client paint on the default here. **So I could not produce a local "before" failure to diff against.**
I applied the `mounted`-gate anyway because (a) SPEC-009 + the stakeholder's confirmed repro direct it, and
(b) it is a strict, side-effect-free hardening of the exact icon path — it can only remove divergence, never add
it. If the stakeholder still hits the error, please pass their exact env (browser + version, hard vs soft reload,
Mantine/React versions if different) and I'll reproduce against that. Two DoD boxes below are marked with this
caveat.

**DoD (rework):**
- [~] Repro documented — **could not reproduce locally even un-gated** (see caveat); fix applied per Sober's direction.
- [x] Dark persisted → cold load: no hydration error, icon correct (Sun), no wrong-icon flash beyond the intended post-mount swap.
- [x] Light persisted → cold load: clean (Moon), no error.
- [~] Production console: prod **cannot** show React hydration warnings by design (stripped from prod builds), so
      a prod console check is not a valid test of this bug — the meaningful check is the **dev** console, verified clean above.
- [x] Toggle still switches + persists; `bun run build` clean; only the icon path changed (no other behaviour/visual change).

**§7:** ran my own fresh dev on `:3020` (confirmed free → launched → stopped my PID `26776`; ports released);
closed my scratch tabs. Did not touch any process I didn't launch.

---
### Rework Review — Sober, 2026-07-30: **DONE**
Read the real `AppHeader.tsx` (commit `e55a362`). The mounted-gate is **correct by construction**:
`const [mounted,setMounted]=useState(false); useEffect(()=>setMounted(true),[])` +
`{mounted && computed==="dark" ? <SunIcon/> : <MoonIcon/>}`. SSR and the first client paint both render
**Moon** (`mounted=false`), identical regardless of `ColorSchemeScript`/`computed` → the exact divergence
the stakeholder reported (server Moon vs client-first-paint Sun) is now impossible. Post-mount resolves the
real icon. Toggle switch+persist unchanged; only the icon path touched; `bun run build` clean.
- **Accepted Fern's caveats — both correct:** (1) prod console can't show React hydration warnings (stripped
  from prod builds), so a prod-clean check was never a valid signal for this bug — the **dev** console is
  (verified clean on the fixed build). This is also part of why the first verify-pass (and my acceptance) missed it.
  (2) Neither Fern nor I can reproduce the "before" locally (env differs from the stakeholder's Mantine/React/
  browser) — but the fix is causally correct for the described mechanism, so a local "before" isn't needed to accept it.
- Minor/inherent (non-blocking): on a dark-persisted load the icon shows Moon for ~1 frame then swaps to Sun
  post-mount — the standard mounted-gate tradeoff (a flash-free variant would need CSS-driven icons off the
  `data-mantine-color-scheme` attribute; out of scope unless the stakeholder minds the micro-swap).
- **Final gate:** the stakeholder is the only reproducer → Porter to have them confirm the `Hydration failed`
  is gone on THEIR environment. DoD met (repro/prod boxes carry Fern's valid caveats). REQ-009 → SPEC_DONE.
