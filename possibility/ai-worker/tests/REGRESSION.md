# Regression checklist — possibility

> Owned by Tanya (QA). Everything the product must STILL do after any change.
> Every delivered REQ adds its cases here; every escaped defect adds the case that
> would have caught it. Run the relevant subset in every test round.

## Cases

| # | Case | From REQ | Added | Last run | Result |
|---|------|----------|-------|----------|--------|
| R-1 | Signed-out `/ideas/new` (and `/`) renders the landing with the Google button — no idea box, **no W-3 alert** on a plain visit, in TH and EN | REQ-002 AC-1/AC-5 | 2026-09-21 | 2026-09-21 (TEST-001 #1, #2, #13) | PASS |
| R-2 | `POST /auth/google` with a garbage / unsigned / empty token → 401 `INVALID_GOOGLE_TOKEN` / 400 `VALIDATION_FAILED`; `users` count unchanged | REQ-002 AC-5 | 2026-09-21 | 2026-09-21 (TEST-001 #11) | PASS |
| R-3 | Returning sign-in upserts on `google_sub`: same id, no new row, `tier` untouched, display name refreshed | REQ-002 AC-3 | 2026-09-21 | 2026-09-21 (TEST-001 #6, harness `test-001-upsert-path.ts`) | PASS |
| R-4 | Valid session cookie → header shows display name + email + W-2; survives reload; `/ideas/new` renders the guarded page | REQ-002 AC-2/AC-3 | 2026-09-21 | 2026-09-21 (TEST-001 #4, #7) | PASS |
| R-5 | **Real click on Sign out clears the header immediately** (focus-refetch race, TASK-004): `/auth/logout → 204`, cookie gone, landing in place, next `/ideas/new` → landing | REQ-002 AC-4 | 2026-09-21 | 2026-09-21 (TEST-001 #9, #10) | PASS |
| R-6 | No email+password route (`/auth/login`, `/auth/register`, `/login`, `/signup` … → 404) and no `<form>`/password input in the FE | REQ-002 AC-6 | 2026-09-21 | 2026-09-21 (TEST-001 #14, #15) | PASS |
| R-7 | `GET /auth/me` without / with a bogus cookie → 401 `NOT_SIGNED_IN`; `POST /auth/logout` → 204 with `Max-Age=0` | REQ-002 (SPEC-002 §API) | 2026-09-21 | 2026-09-21 (TEST-001 #16) | PASS |
| R-8 | Real Google ID token end-to-end: 200 + `Set-Cookie`, user row created as `Ordinary`, returning sign-in reuses the row (BE log `new` → `returning`) | REQ-002 AC-2/AC-3 | 2026-09-21 | 2026-09-21 (TEST-001 #5, #6 — the owner's real click, evidence read by Tanya) | PASS (needs a human click each run) |
| R-9 | Popup dismissed → back on landing, no user created; W-3 is best-effort (AC-5 amended 2026-09-21) — observed NOT shown on a real dismiss, must never show on a plain visit | REQ-002 AC-5 | 2026-09-21 | 2026-09-21 (TEST-001 #12, #13; evidence png 5) | PASS |
| R-10 | Tier rule: every idea's shown tier = REQ-001 rule on its three scores (hand recompute of all saved ideas via `test-003-ideas-select.ts`); boundaries harness `task-005-tier-boundaries.ts` 10/10 | REQ-001 AC-2/AC-3 | 2026-09-22 | 2026-09-22 (TEST-002 #2/#3) | PASS |
| R-11 | New user = `Ordinary 0%` in header + `/me`; user tier rises immediately on the result page and never falls; the five exact names + 0/5/10/20/30 % identical in TH and EN | REQ-001 AC-1/4/5/6 | 2026-09-22 | 2026-09-22 (TEST-002 #1/#4/#5/#6, SIT) | PASS |
| R-12 | Idea box: < 20 chars → W-2 + disabled; whitespace → disabled; 3000 cap with red counter; valid text → spark loading + W-4 → 201 → result page with 3 integer scores, tier, discount, reason in the UI language | REQ-003 AC-1/3/4/8 | 2026-09-22 | 2026-09-22 (TEST-003 #1/#3/#4/#8, SIT) | PASS |
| R-13 | My ideas newest first (date W-9, tier, 80-char preview, thumbnail); open → `GET /ideas/:id` only, no re-analysis; another user's idea → W-8 not-found, no content | REQ-003 AC-5/AC-6 | 2026-09-22 | 2026-09-22 (TEST-003 #5/#6, SIT) | PASS |
| R-14 | Every real idea has 5 `idea_steps` with the SPEC-003 keys + provider/model/promptVersion | REQ-003 AC-10 | 2026-09-22 | 2026-09-22 (TEST-003 #10) | PASS |
| R-15 | Email sign-up (name/email/pw ≥ 8, Enter or click) → 201 + same session as Google, `Ordinary 0%`, `/ideas/new`; short pw → W-3, no request; duplicate email (Google or email row) → 409 + W-5 | REQ-006 AC-2/3/4 | 2026-09-22 | 2026-09-22 (TEST-004 #2/#3/#4, SIT) | PASS |
| R-16 | Email sign-in: right pw → 200 same account; wrong pw / unknown email / Google-only account → identical 401 + W-4 **readable**; sign-out shared | REQ-006 AC-5/6 | 2026-09-22 | 2026-09-22 (TEST-004 #5/#6) | PASS (round 2: W-4 14.16:1) |
| R-17 | Email user is never admin: `/admin` → W-8, admin API → 404; `password_hash` = `$argon2id$`, no password in responses | REQ-006 AC-8/9 | 2026-09-22 | 2026-09-22 (TEST-004 #8/#9) | PASS |
| R-18 | Redesign: hero + tier images per REQ-007 R2 for all five tiers (wide ≥ 768 px, tall on phone); spark loading, no spinner; result order per R6; language switch = zero layout shift; body text ≥ 4.5:1 on landing / result / `/me` / list **including alerts** | REQ-007 AC-1..6 | 2026-09-22 | 2026-09-22 (TEST-005) | PASS (round 2: alert 14.16:1, Thai hero wraps at word boundary) |
