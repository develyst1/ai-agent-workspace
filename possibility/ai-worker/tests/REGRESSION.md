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
| R-9 | Popup dismissed → back on landing, no user created; W-3 shown (best-effort per SPEC-002 §Flow 8) | REQ-002 AC-5 | 2026-09-21 | 2026-09-21 (TEST-001 #12) | PASS (no user) / W-3 UNVERIFIED |
