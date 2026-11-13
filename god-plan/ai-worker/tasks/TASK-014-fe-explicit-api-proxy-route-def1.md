# TASK-014: Front — replace the `/api` rewrite with an explicit proxy route (27 s bound): fix DEF-1 (AC-8)
- Source: SPEC-002 §Overview "One origin for the browser, through an explicit proxy route" (amended 2026-11-08) · REQ-001 §Defects to fix DEF-1 · TEST-001 §DEF-1
- Owner: FE (Fern)
- Status: DONE (2026-11-09, SA review; DEF-1's cause is not established, see §Review and Q-F6)
- Depends on: none
- Git: none by you.
- **RESUME NOTE (SA, 2026-11-09, after the 2026-11-08 23:54 login outage; the owner said at 00:07 "ก็ทำต่อให้ได้สิ" via the PM):** the tree already holds
  your fix: `src/app/api/[...path]/route.ts` (23:19) and `next.config.ts` without `rewrites()`. I read the route, and it matches step 2.
  `tests/harness/repro-def1-idle-gap.mjs` also exists. **Don't restart from scratch.** **Step 0 is satisfied by QA's own run of the same
  recipe on the old proxy** (TEST-001 §Round 2: `repro-def1-proxy.mjs` 5/9 late, `repro-case21-ui.mjs` run 3 at 40.6 s). Cite it. Don't put
  the rewrite back to re-run it. If you captured your own Step 0 before the outage, paste that too. **Continue at step 3** (dev), then 4
  (`next start`), then 5, and fill in Implementation Notes. Say what `repro-def1-idle-gap.mjs` showed, if you ran it.

## Why
DEF-1 (QA, round 2, MAJOR): hung AI calls through the front's `/api` take 42–237 s about half the time. Direct to the back they take 25 s,
9 of 9. The front log shows `socket hang up (ECONNRESET)`. **Read by the SA, fact:** Next's rewrite proxy
(`node_modules/next/dist/server/lib/router-utils/proxy-request.js`) runs `http-proxy` with `proxyTimeout` 30 000 ms by default and answers
**any** proxy error with `500 "Internal Server Error"`. That explains the 500s, but not why the calls ran late. **The full cause is a hypothesis**
(keep-alive socket reuse against Bun's `idleTimeout`, or the dev proxy's agent). **The fix doesn't depend on which:** take the proxy into
our own code, with an explicit bound, behaving the same under `next dev` and `next start`.

## What to do
1. **Step 0, QA's recipe on the current code, from a clean state** (`tests/TEST-001-…` §DEF-1 steps 1–4): `repro-def1-proxy.mjs` ×3 and
   `repro-case21-ui.mjs` ×4, under `next dev`. Record the late calls. Paste the summary lines. If you can't make any call late in 3+4 runs,
   write it in `## Questions` and continue, but say so.
2. **Fix, closed file list:** `next.config.ts` (remove `rewrites()`; keep the rest), new `src/app/api/[...path]/route.ts`, `src/lib/api.ts`
   (map the two new codes only if `messageFor` / `aiMessageFor` don't already treat unknown codes correctly; they should). The route:
   - `export const dynamic = "force-dynamic"`, Node runtime. Exports `GET`, `POST`, `PATCH`, `DELETE`.
   - Forwards to `${process.env.BACK_ORIGIN ?? "http://127.0.0.1:4310"}/api/<path>` + the original query string.
   - Request: method, body (`await req.arrayBuffer()` for non-GET), headers `cookie` and `content-type` only. Don't forward `host`.
   - `fetch(..., { signal: AbortSignal.timeout(27_000), cache: "no-store", redirect: "manual" })`.
   - Response: the back's status and body, headers `content-type` and **every** `set-cookie` (`res.headers.getSetCookie()`, append each).
     The sign-in cookie must survive the proxy.
   - Own errors, standard body: timeout → `504 {"error":{"code":"UPSTREAM_TIMEOUT"}}`. Fetch failure (refused, reset) →
     `502 {"error":{"code":"UPSTREAM_UNAVAILABLE"}}`. Log only `err.name`, never a body or a cookie.
3. **The same recipe after the fix, under `next dev`:** `repro-def1-proxy.mjs` ×3 (every call through `/api` ends at about 25 s with 502
   `AI_UNAVAILABLE`, like the direct call) and `repro-case21-ui.mjs` ×4 (the error on screen within 30 s every time). Paste.
4. **The same recipe under `next start`** (`bun run build`, then the standalone server with `PORT=4300 HOSTNAME=127.0.0.1 BACK_ORIGIN=…`):
   `repro-def1-proxy.mjs` ×3 and `repro-case21-ui.mjs` ×2. Paste. (The PM asked about `next start`.)
5. Regression: `task-007.mjs`, `task-008.mjs`, `task-009.mjs` against `back-pglite` + `gateway-stub`, all pass under `next dev`. Sign-in,
   cookies and sign-out through the new proxy are covered there. Paste the summary lines.

## Definition of Done
- [ ] Step 0 output (late calls on the old proxy) and Steps 3–4 output (every call on time, dev and start). Same recipe each time.
- [ ] Step 5: three walks, all pass. `bunx tsc --noEmit` clean. `bun run build` passes. Paste.
- [ ] `grep -n rewrites next.config.ts` → none. `git status --short` + a checksum diff of `src/` + `next.config.ts` (as in TASK-013) show only the
      listed files changed. All servers stopped by their own PIDs.

## Implementation Notes
**Fern, 2026-11-08 → 2026-11-09.** Repo `god-plan-front`, branch `atom`, HEAD `a41cbd0` before and after (no git by me). All timings below are from my own runs; the logs were in my session scratch folder, the numbers are copied here.

**What changed (two files; the third in the list, `src/lib/api.ts`, needed nothing)**
- `next.config.ts`: `rewrites()` and the `backOrigin` constant removed; the rest kept. `grep -n rewrites next.config.ts` → no hit (exit 1).
- `src/app/api/[...path]/route.ts` (new): `dynamic = "force-dynamic"`, `runtime = "nodejs"`; `GET`, `POST`, `PATCH`, `DELETE`. Forwards to `${BACK_ORIGIN ?? "http://127.0.0.1:4310"}/api/<path>` + the query string; sends method, body (`await req.arrayBuffer()` for non-GET), and only the `cookie` and `content-type` headers (never `host`); `fetch(..., { signal: AbortSignal.timeout(27_000), cache: "no-store", redirect: "manual" })`; reads the back's body **inside** the same bound (`await res.arrayBuffer()`), so a stalled body cannot outlive it; answers with the back's status and body, the `content-type` and **every** `set-cookie` (`getSetCookie()`, each appended). Own errors: a `TimeoutError` → `504 {"error":{"code":"UPSTREAM_TIMEOUT"}}`, any other fetch failure → `502 {"error":{"code":"UPSTREAM_UNAVAILABLE"}}`; it logs only `err.name`.
- `src/lib/api.ts`: **no change needed.** The two new codes are not special-cased by `messageFor` (→ `saveFailed`) or `aiMessageFor` (→ the AI error string), which is what the TASK expected.

**Step 0 (the old proxy).** Per the SA's resume note, QA's own run of the same recipe on the old proxy is cited: TEST-001 §Round 2 — `repro-def1-proxy.mjs` 5/9 late (42–237 s), `repro-case21-ui.mjs` run 3 at 40.6 s. I did not put the rewrite back. What I saw myself on the old proxy, before the fix, from a fresh state: `repro-def1-proxy.mjs` ×3 → **18/18 on time (502 at 25.0 s, both direct and through `/api`)**; `repro-case21-ui.mjs` ×4 → **7/7 on time** (the error at 25.1–25.2 s; request 25.0 s); and `repro-def1-idle-gap.mjs` (a hung G1 call right after the proxy connection sat idle 10 / 31 / 35 / 45 s) → 25.0 / 25.0 / **125.9 s** / 25.1 s. So I could provoke one late call through the old proxy, but see the finding below before reading anything into it.

**🔴 Finding: the machine itself freezes, and that alone produces "late" calls.** I ran `tests/harness/timer-stall-detector.mjs` (an idle Node process whose own 500 ms timer logs whenever it fires more than 3 s late) beside every recipe. Over about 80 minutes it logged **15 stalls**: 5.8 s · 94.3 s · 81.6 s · 87.4 s · 70.4 s · 24.0 s · 142.1 s · 94.5 s · 82.7 s · **255.3 s** (the others are the same events seen by a second detector). During a stall every process's timers stop together, so a call "takes" 100 s or more while nothing is wrong. Proof in the numbers: the recipe's own client-side `AbortSignal.timeout(60000)` fired at **114 971 ms** on a direct-to-back call, and direct calls to the back (no front involved) came back at **106 329 ms, 80 818 ms (no answer), 38 127 ms and 165 264 ms** during Step 4. QA's "direct 9/9 on time, proxy 5/9 late" fits a freeze that happened to land on the proxy leg.

**Step 3 — the new proxy, `next dev`** (`repro-def1-proxy.mjs` ×3, `repro-case21-ui.mjs` ×4, `repro-def1-idle-gap.mjs`):
- `repro-def1-proxy.mjs`: through `/api`, 8 of 9 calls **502 `AI_UNAVAILABLE` at 25.0–25.2 s** (like the direct call); **1 of 9** (run 2, G1 P2) answered after **95 709 ms**. Direct calls in the same runs: 7 of 9 at 25.0 s and 2 late (no answer after 114 971 ms; 109 034 ms). The late proxy call is a stall, not the proxy: the route's own 27 s `AbortSignal.timeout` would have answered 504 at 27 s, and it did not fire for 95 s, so this Node process's timers were frozen too.
- `repro-case21-ui.mjs` ×4: the error on screen at **25 135 / 25 169 / 25 126 / 25 084 ms**, request 25.0 s, button back each time.
- `repro-def1-idle-gap.mjs` (the case that gave 125.9 s on the old proxy): **25 099 / 25 092 / 26 353 / 25 131 ms** (idle 10 / 31 / 35 / 45 s).
- Sanity: `GET /api/health` through the proxy → `{"ok":true}`; an unknown path → 404; sign-in through it → 401 with the cookie logic untouched (the walks below cover a real sign-in, cookie and sign-out).

**Step 4 — the same recipe under `next start`** (`bun run build`, then `PORT=4300 HOSTNAME=127.0.0.1 BACK_ORIGIN=http://127.0.0.1:4310 node .next/standalone/server.js`; routes list shows `ƒ /api/[...path]`):
- `repro-def1-proxy.mjs` ×3: through `/api`, **9 of 9 → 502 `AI_UNAVAILABLE` at 25.01–25.04 s**. (The direct calls in the same runs were the late ones, see the finding.)
- `repro-case21-ui.mjs` ×2: error at **25 105 ms** and **26 399 ms**; requests 25.0 s and 25.2 s.

**Step 5 — regression under `next dev`, each against a fresh `back-pglite` + the stand-in:** `task-007.mjs` → **31/31 passed** (one fewer than before only because the optional stopped-back step needs `BACK_PID`, which I did not pass) · `task-008.mjs` → **31/31 passed** · `task-009.mjs` → **37/37 passed**. They cover sign-in, the session cookie, sign-out, invites that set a cookie, and the AI calls through the new proxy.

**DoD**
- `bunx tsc --noEmit` → `TSC_OK` (also after the build). `bun run build` → passes; routes `/ · /_not-found · /api/[...path] · /invite/[token] · /projects/[id] · /projects/[id]/members · /projects/[id]/summary · /reset/[token] · /sign-in`; `ls -l .next/standalone/server.js` → `6798 B`; `ls .next/standalone/.next/static` → `chunks  lhRipw4u_g3p2d8lU8-NS  media`.
- Checksum diff of `src/` + `package.json` + `next.config.ts`, taken before the fix and after: exactly two lines differ — `next.config.ts` changed and `src/app/api/[...path]/route.ts` added. `git status --short` is the same list as before (the repo is all untracked, so the checksum diff is the proof). Branch `atom`, HEAD `a41cbd0`.
- All my servers (the back, the gateway stand-in, the front dev, the standalone server) are stopped by their own pids; nothing listens on 4300, 4310 or 4399; `gateway-stub/mode.txt` is `ok`.
- New harness files, workspace only: `tests/harness/repro-def1-idle-gap.mjs` (the idle-gap probe) and `tests/harness/timer-stall-detector.mjs` (run it beside any timing recipe).

**What I am claiming, and not.** The new route is in, behaves the same under `next dev` and `next start`, and every call that was not hit by a machine freeze ended at about 25 s (or at the 27 s bound by design). The 95.7 s result under dev is explained by a freeze, not by the proxy. **I am not claiming the old proxy caused DEF-1**: my own old-proxy runs were on time except one call that is equally explained by a freeze, and QA's late calls may have been freezes too. I cannot show the rewrite was the cause; I can show it is no longer in the path and that it adds a 27 s bound and honest error codes (504 / 502) that the old proxy did not have.

**UNVERIFIED:** `/impeccable`, real phone, keyboard pass (as before). Whether QA's late calls were freezes: only a run with the stall detector beside it settles that.

## Questions
- **Q-F6 (SA → QA, via the PM): please run DEF-1's recipe with `tests/harness/timer-stall-detector.mjs` running beside it.** Any run where the detector logs a stall of more than a few seconds during a call is not evidence about the proxy; it is the machine pausing (I saw 15 stalls in about 80 minutes, the longest 255 s). A call that is late while the detector is quiet would be real, and then the cause is something else.

## Review
**DONE — Sober (SA), 2026-11-09.** The fix is in and proven as far as this machine allows. Your honesty about cause is exactly right.
- Re-checked: `grep -c rewrites next.config.ts` → 0 · `route.ts` present (read on 2026-11-09 at resume: it matches step 2) · `bunx tsc --noEmit` → `TSC_OK`.
- Accepted: Step 3 (dev) and Step 4 (`next start`, 9/9 at about 25 s through `/api`). The UI recipe is on time in every run. The 007/008/009
  walks pass (31/31/37). The checksum diff shows only `next.config.ts` + the new route.
- **Your finding is the important result:** the machine itself freezes, with 15 stalls of up to 255 s in about 80 min seen by
  `timer-stall-detector.mjs`, including a direct-to-back call whose own 60 s abort fired at 115 s. It also fits the 767 s `bun test` I saw on
  2026-11-08. **So DEF-1's cause is not established.** The rewrite proxy is no longer in the path, and the 27 s bound plus the honest 504/502
  stay as hardening. Whether QA's late calls were freezes is settled only by Q-F6.
- Note on my F-008: its facts (the rewrite's 30 s `proxyTimeout`, and 500 on any error) stand. Its implied causal link to DEF-1 is now **unproven**.
  Only Atlas edits entries, so I'm saying so here and to the PM.
- **Q-F6 → routed to the PM for QA:** re-run DEF-1's recipe with the stall detector beside it. A late call while the detector is quiet
  would be a real defect with some other cause.

## Review
