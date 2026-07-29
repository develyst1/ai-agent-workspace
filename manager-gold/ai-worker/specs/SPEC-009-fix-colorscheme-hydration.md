# SPEC-009: Fix the color-scheme toggle hydration mismatch
- Source: REQ-009
- Status: ACTIVE (**REOPENED 2026-07-29** — the verify-only TASK-026 was WRONG: stakeholder CONFIRMED the
  repro with dark persisted. The "still reproduces" branch below now applies → the **`mounted`-gate icon fix
  is required**. TASK-026 back to REWORK.)
- Baseline: `../architecture-baseline.md`. FE-only bug fix on the REQ-005 header (TASK-018).
  REQ-005 stays DELIVERED.

## Root cause (mechanism)
A hydration mismatch happens when the header icon renders a different value on the server vs the
first client render. The server has no `localStorage`, so it computes the **default** scheme
(`light` → Moon). If the client reads a **persisted `dark`** and renders **Sun** on its first paint,
React sees server-HTML ≠ client-HTML → the mismatch error (+ a wrong-icon flash). Mantine's fix is
`useComputedColorScheme(default, { getInitialValueInEffect: true })` — return the default on the
first render (server + client agree), then resolve the real value in an effect.

## Important — reproduce FIRST (don't blind-fix)
**The current `components/AppHeader.tsx` ALREADY calls
`useComputedColorScheme("light", { getInitialValueInEffect: true })`** — the documented mitigation is
already in place. So step 1 is to **reproduce the mismatch on the current `dong` code** (dark persisted
→ reload, watch the console). Two outcomes:
- **If it does NOT reproduce** (the mitigation already covers it): the deliverable is the acceptance
  evidence (clean reload in both schemes) + the prod-console verification (part 2). No behavioural change.
- **If it STILL reproduces**: find the real server/client divergence and apply a **bulletproof** fix —
  e.g. gate the icon on a `mounted` flag (`useEffect(()=>setMounted(true),[])`) and render a **stable**
  element until mounted (a fixed placeholder / the Moon) so server and first client paint are always
  identical, then show the scheme-correct icon. Keep the toggle's switch + persist behaviour exactly as now.

Apply the debugging discipline: reproduce → identify the exact diverging node → fix → confirm the repro
is gone. Do not change unrelated code.

## Part 2 — verify the ColorSchemeScript message is prod-clean
The second console line ("Encountered a script tag while rendering") is from Mantine's required
`ColorSchemeScript` (no-flash) and is a **dev-only React-19 warning**. **Verify** it: `bun run build`
then `bun run start`, load the app, and confirm the production console has **neither** the hydration
error **nor** the script-tag message. Document the result. **No code change** if confirmed prod-only —
do NOT remove `ColorSchemeScript` (that reintroduces the flash).

## Non-functional
- Toggle still switches light/dark and persists (`mg-color-scheme` / Mantine's key) across reload.
- No other visual/behaviour change. `bun run build` clean.

## Tasks
- TASK-026: FE — reproduce the header icon hydration mismatch on current `dong`; ensure the Sun/Moon
  icon renders identically server↔first-client (fix only if it still reproduces); verify NO
  hydration error on reload for BOTH persisted schemes; verify the ColorSchemeScript message is
  dev-only / absent in a production build — with evidence. (depends: —)

## Questions
(Fern asks here; Sober answers as `> answer: ...`)
