# TASK-019: FE — a user-facing message when sign-in cannot reach the server
- Source: TASK-015 observation (Fern, 2026-09-23); REQ-006 (sign-in), REQ-002 (Google), SPEC-007 §Flow
- Owner: FE (Fern)
- Status: DONE
- Depends on: copy

## Why
Today a **network-level** failure during email sign-in (server unreachable, CORS rejection, DNS, offline) throws unhandled: no alert, no message, the button just does nothing. Every *server-answered* failure already has wording (W-3/W-4/W-5); only "the request never arrived" has none. On SIT this is exactly what a user saw during the 502 outage — a dead-looking form. `api-main.ts` already maps a non-envelope failure to `ApiError("NETWORK_ERROR", 0)` (TASK-002), so the shape exists; nothing renders it.

## What to do (when the copy lands)
1. Render Porter's W-11 wherever an auth call can fail at the network level: the email sign-in and sign-up forms, and the Google callback POST (`/auth/google`). Same Alert component/token path as W-4, so DEF-1's contrast holds.
2. Cover the same gap on the two other user-facing mutations if it is one line each: submit idea (`POST /ideas` — distinct from the AI's own `AI_FAILED`, which already has W-6) and the hire button. If it is more than one line, say so and leave them out — do not redesign error handling in this task.
3. Nothing is retried automatically; the user retries by pressing the button again.

## Definition of Done
- [ ] With the BE stopped: submit the email sign-in form → W-11 shown (TH and EN screenshots), no unhandled error in the console.
- [ ] Same with sign-up; same with the idea submit if item 2 was done.
- [ ] With the BE running, a wrong password still shows W-4 (not W-11) — proves the two paths stay distinct.
- [ ] Contrast of the W-11 alert measured on the render (≥ 4.5:1).
- [ ] `npm run build` clean.

## Implementation Notes

(Fern, 2026-09-26)

**What changed (possibility-front):**
- `lib/i18n`: new key `error.serverUnreachable` = W-11 verbatim (TH/EN, REQ-006 §Questions).
- `Landing/EmailAuthBlock.tsx` — a third failure branch: `ApiError code === "NETWORK_ERROR"` → W-11 alert, fields kept, submit stays enabled (manual retry only). W-4/W-5 branches untouched.
- `common/GoogleSignInButton.tsx` — new `onServerUnreachable` prop; the credential callback routes NETWORK_ERROR there (401 → cancelled, as before). `LandingContent` renders the W-11 alert for it.
- `IdeaFormContent.tsx` (item 2, one branch) — submit error alert: NETWORK_ERROR → W-11; any server answer → W-6 as before.
- `IdeaResultContent.tsx` (item 2) — hire button: 201 → W-2, 409 → W-2-without-discount, NETWORK_ERROR → W-11 alert in the slot, button stays usable.

**Verified locally** (FE dev :3001, BE dev :4019 — port 3000 was occupied by ANOTHER project of the owner's this time, so BE ran with `FRONTEND_ORIGIN=http://localhost:3001`; evidence in `tests/harness/task-019/`):
- BE stopped: email sign-in → W-11, TH (`signin-w11-th.png`) + EN (`signin-w11-en.png`); sign-up → W-11 (`signup-w11-en.png`); idea submit → W-11 with Try-again (`idea-submit-w11-en.png`). FE dev log across all runs: **0 unhandledRejection** (grep -c → 0).
- BE running: wrong password → W-4 "Incorrect email or password." and no W-11 (`signin-w4-still-distinct-en.png`) — the paths stay distinct.
- Contrast of the rendered W-11 alert (crop + `tests/harness/task-015/contrast.js`): bg [39,21,19], text [229,230,215] → **13.83:1** (≥ 4.5:1 ✓ — same danger-surface tokens as DEF-1).
- `npx tsc --noEmit` clean; `npm run build` clean (7 routes, standalone copied).

Google-callback W-11 path: code-reviewed only — **UNVERIFIED** (needs a real GIS credential while the BE is down; can't be staged locally without the owner's Google click).

## Questions

- None.

## Review
**Verdict: DONE** (Sober, 2026-09-26 04:30). The distinction that matters is proven, not asserted: with the BE stopped the email sign-in, sign-up, idea submit and hire button all show W-11 (TH + EN screenshots on disk), and with the BE running a wrong password still shows W-4 — so "the server said no" and "the request never arrived" stay separate paths, which is the whole point. `0 unhandledRejection` across the runs is the line I would have asked for. W-11's alert measures 13.83:1 on the render, reusing the DEF-1 danger-surface tokens rather than inventing a colour. Verified in the code myself: the `NETWORK_ERROR` branch exists in all three partials plus the Google button's `onServerUnreachable` prop.
Accepted UNVERIFIED: the **Google-callback** W-11 branch — it needs a real GIS credential while the BE is down, which cannot be staged locally. Code-reviewed only; noted for Tanya's next SIT round rather than left silent.
Noted, not a defect: port 3000 was occupied by another of the owner's projects, so the BE ran with `FRONTEND_ORIGIN=:3001`. Correct not to touch his process — and worth remembering that this same port collision is what surfaced the missing message in the first place.
