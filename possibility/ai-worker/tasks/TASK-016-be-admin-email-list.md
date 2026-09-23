# TASK-016: BE — admin is a list of emails from configuration
- Source: SPEC-005 §Amendment 2026-09-23 (REQ-004 owner change); touches SPEC-002 §Flow 9, SPEC-007 §Unchanged
- Owner: BE (Jason)
- Status: DONE
- Depends on: none

## What to do
1. `src/env.ts`: add `ADMIN_EMAILS` (string). Parse once at startup into a lower-cased `Set<string>`: split on `,`, trim, drop empties; **at least one entry or exit** naming the var. **Fallback:** if `ADMIN_EMAILS` is absent but `ADMIN_EMAIL` is present, use the old value and `console.warn` once naming both vars. Export the set (not the raw string).
2. `src/lib/session.ts`: `isAdmin(user)` = the set has `user.email.toLowerCase()`. **Drop the `googleSub !== null` condition** (owner's 2026-09-23 decision — an email+password account on the list is admin). `requireAdmin` behaviour unchanged (404 for everyone else).
3. `.env.example`: replace `ADMIN_EMAIL=` with `ADMIN_EMAILS=` and a comment `# comma-separated, e.g. a@x.com,b@y.com`.
4. Nothing else: no schema change, no route change, no DTO change (`isAdmin` still computed in `toUserDto`).

## Definition of Done
- [x] `ADMIN_EMAILS` with two addresses: `/auth/me` for each → `isAdmin:true`; `GET /admin/hire-requests` for each → 200 — paste both (use your `dev-jason-pw1@example.com` **email+password** fixture as one of them, proving the method no longer matters).
- [x] A third account not on the list → `isAdmin:false` and `GET /admin/hire-requests` → 404 — paste.
- [x] Case/space robustness: `ADMIN_EMAILS=" A@X.com , b@y.com "` → both still admin — paste.
- [x] `ADMIN_EMAILS=` empty / missing and no `ADMIN_EMAIL` → process exits naming the var — paste.
- [x] Fallback: only `ADMIN_EMAIL` set → server starts, WARN line shown, that address is admin — paste.
- [x] `.env.example` diff pasted. Say explicitly whether you changed the local `.env` (the owner owns SIT's).

## Implementation Notes
(Jason, 2026-09-23 — no git writes; BE port from `.env` PORT, 4019 today)

**Files in `possibility-back`:** `src/env.ts` (`ADMIN_EMAILS` + legacy `ADMIN_EMAIL` both optional in the zod schema; `parseAdminEmails` splits on `,`, trims, lower-cases, drops empties; `loadAdminEmails()` → list, else legacy + one WARN, else `process.exit(1)` naming `ADMIN_EMAILS`; exports `ADMIN_EMAILS: ReadonlySet<string>`, never the raw string) · `src/lib/session.ts` (`isAdmin(user)` = `ADMIN_EMAILS.has(user.email.toLowerCase())` — the `googleSub !== null` condition is **gone**) · `.env.example`. No schema, route or DTO change; `toUserDto` still computes `isAdmin`. `bunx tsc --noEmit` clean.

**Two addresses, one email+password + one Google** — `ADMIN_EMAILS="dev-jason-pw1@example.com,dev-jason-a@example.com"`:
```
dev-jason-pw1@example.com  (EMAIL+PASSWORD account)  /auth/me → "isAdmin":true   GET /admin/hire-requests → [200]
dev-jason-a@example.com    (Google fixture)          /auth/me → "isAdmin":true   GET /admin/hire-requests → [200]
dev-jason-b@example.com    (not on the list)         /auth/me → "isAdmin":false  GET /admin/hire-requests → {"error":{"code":"NOT_FOUND","message":"Not found"}} [404]
```
→ the sign-in method no longer matters (the amendment's point), and a third account still gets 404.

**Case / space robustness** — `ADMIN_EMAILS=" Dev-Jason-PW1@Example.com , DEV-JASON-B@example.com "`:
```
dev-jason-pw1@example.com → "isAdmin":true   /admin → [200]
dev-jason-b@example.com   → "isAdmin":true   /admin → [200]      (mixed case + surrounding spaces both normalised)
dev-jason-a@example.com   → "isAdmin":false  /admin → [404]      (not on THIS list — proves the set actually changed)
```
**Empty / missing → exit naming the var** (both vars emptied explicitly; note Bun auto-loads `.env`, so `ADMIN_EMAIL=` from the local file must be overridden or it silently supplies the fallback):
```
ADMIN_EMAILS="" ADMIN_EMAIL=""    → Missing or invalid environment variable(s): ADMIN_EMAILS (comma-separated list of admin emails; at least one entry required)
ADMIN_EMAILS=" , , " ADMIN_EMAIL="" → same line   (separators/whitespace only = empty)
```
**Fallback — only `ADMIN_EMAIL` set** (a deployed `.env` keeps starting):
```
WARN: ADMIN_EMAILS is not set — falling back to the superseded ADMIN_EMAIL. Replace it with ADMIN_EMAILS (comma-separated) in .env.
Started development server: http://localhost:4031
dev-jason-a@example.com (the ADMIN_EMAIL value) → "isAdmin":true  /admin → [200]
dev-jason-b@example.com                          → "isAdmin":false /admin → [404]
```
**`.env.example` diff:**
```diff
-ADMIN_EMAIL=
+ADMIN_EMAILS=
+# comma-separated, e.g. a@x.com,b@y.com
```
**Local `.env`: NOT changed** — it still holds only `ADMIN_EMAIL=`, which is exactly why the fallback path above is exercised on this machine. SIT's `.env` is the owner's; he needs the one line Sober already gave Porter (`ADMIN_EMAILS=siegkung@gmail.com,<Tanya's address>`) at the next deploy — until then SIT keeps running on the fallback with the single old address.

No new fixtures: reused `dev-jason-pw1@example.com` (TASK-011) and the Google fixtures `dev-jason-a/b@example.com` (TASK-005).

DoD: two-address list both admin incl. the email+password one ✔ · third account false + 404 ✔ · case/space ✔ · empty/missing exits naming the var ✔ · fallback WARN + starts + that address is admin ✔ · `.env.example` diff + local `.env` untouched ✔.

## Questions
- **Q-1 @Sober (Jason, 2026-09-23) — SECURITY, for the owner:** while testing I built a shell command wrongly and the SIT **`DATABASE_URL`, including its password, was printed into my session output**. It is **not** written to any file — `.env` is untouched and git-ignored, and nothing went into a TASK, log or harness. But the value is now visible in this session's transcript, which is not a place secrets belong. My recommendation: the owner rotates that Postgres password on the SIT server and updates his `.env` (BE restart; no code or migration involved). I cannot do it and will not touch his server. Mistake is mine — not the design's.
- **Q-2 @Sober (Jason, 2026-09-23), non-blocking:** the BE listens on `.env` `PORT` (4019 on this machine), not 4000 as SPEC-001 §Backend layout still implies. Fern and Tanya should read `PORT` rather than assume 4000 — worth one line in SPEC-001 if you agree.

## Review
**Verdict: DONE** (Sober, 2026-09-23 05:50). Verified in code (`env.ts` parses to a lower-cased `ReadonlySet`, raw string never exported; `session.ts` `isAdmin` is set-membership only, the `googleSub` condition gone) and in the runs: an **email+password** account on the list is admin (200) alongside a Google one, a third account is `isAdmin:false` + 404, mixed case and surrounding spaces normalise, empty/separator-only exits naming `ADMIN_EMAILS`, and the legacy fallback starts with one WARN. `.env.example` updated, local `.env` correctly untouched. Exactly the small change it should have been.
Answers: **Q-1 (security)** — right call to report it and not touch his server; routed to Porter as **DR-9: rotate the SIT Postgres password and update the SIT `.env`** (BE restart, no code, no migration). Nothing was written to a file, so there is nothing for us to scrub; the value lived only in your session output. **Q-2** agreed — SPEC-001 §Backend layout amended: the BE listens on `.env` `PORT` (4000 is only the default when the var is absent); Fern and Tanya read `PORT`, never assume.
