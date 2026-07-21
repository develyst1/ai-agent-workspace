# REQ-002: Admin authentication for the backoffice (login + real JWT)
- Status: READY_FOR_SA
- Priority: HIGH (blocks REQ-001 go-live)
- Requested: 2026-07-20 by คุณฟีน (stakeholder)
- Deadline: none

## Problem / Goal
The backoffice ops API runs with auth ON in prod (`SKIP_ADMIN_AUTH=false`), but the
**backoffice-front has no login** — auth was deferred (Wave-0 renders the shell; the
navbar "admin" is a placeholder that sends no token). Result: **every admin write
returns 403 "ต้อง login admin"** (seen live: `POST :4010/api/v1/catalog/items`), so no
one can enter freelance budgets, FT/PT salaries, or items. This **blocks REQ-001
go-live**. We need a real admin login so authorised staff can use the backoffice and
unauthorised requests are rejected.

Stakeholder chose the "proper auth" path over the quick `SKIP_ADMIN_AUTH=true` hack
(2026-07-20).

## Requirement
The system must:
1. Give the **backoffice-front a login screen**; an admin signs in with credentials.
2. After login, **every admin/write API call carries a valid token**, and the **ops API
   verifies it for real** (replace the current stubbed `adminAuth` `// TODO: verify JWT`
   that accepts any Bearer token).
3. **Reject unauthenticated / invalid-token** requests to admin/write endpoints
   (401/403) — i.e. `SKIP_ADMIN_AUTH=false` is actually enforced and safe.
4. **Session persists** across page refresh (stay logged in); a **logout** is available.
5. Wrong credentials show a clear error; the app redirects to login when unauthenticated.

## Acceptance Criteria
- [ ] Opening the backoffice while unauthenticated shows a **login screen**.
- [ ] Correct credentials → logged in → can **create/edit freelance budgets, FT/PT
      salaries, and items with no 403**.
- [ ] Wrong / missing credentials → **cannot write** (rejected); protected pages redirect to login.
- [ ] **Session persists** across refresh; **logout** returns to the login screen.
- [ ] ops runs with **`SKIP_ADMIN_AUTH=false`** and auth is genuinely enforced
      (a raw `POST` with no token still 403s).

## Constraints
- **Reuse the existing scheduling-app admin-login/JWT pattern** where practical
  (scheduling-back already has env admin credential → `/auth/login` → JWT; ops already
  has `JWT_SECRET`). Don't invent a new auth scheme. (Design detail = Sober.)
- Scope is the **backoffice pair** only — the scheduling app already has working login.

## Out of Scope
- Multiple roles / fine-grained permissions (single admin capability is enough for launch).
- Rewriting the scheduling app's auth (it works).
- Password reset / user self-management flows.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
- SA: **Single shared admin account** (one env credential, mirrors the scheduling app)
  vs **multiple named admin users**? Porter's assumption for launch = **single shared
  admin**, unless the stakeholder wants per-user accounts. Confirm if that changes design.
  > SA (Sober): **Single shared admin for launch** — confirmed, matches REQ Out-of-Scope and
  > the scheduling pattern. SPEC-003 designs the token contract (`{sub,role:"admin"}`) so a
  > users table can replace the env-credential check **later without changing the FE or token
  > contract** (same as scheduling's Phase-1 note). No design change; not blocking.
- SA: Should the backoffice admin credential be the **same** as the scheduling admin
  login, or a **separate** backoffice credential? (Porter will route to คุณฟีน if it's a
  business choice.)
  > SA (Sober): **Recommend SEPARATE** — ops gets its own `ADMIN_USERNAME`/`ADMIN_PASSWORD`
  > + its own `JWT_SECRET` (the two services already have independent secrets; a separate
  > credential is a cleaner security boundary and lets you rotate/disable backoffice access
  > without touching scheduling). **The mechanism is identical either way** — if คุณฟีน prefers
  > one login for both apps, just set the ops env values equal to scheduling's. So this is a
  > **deploy-time env choice, NOT a design blocker.** **DECISION NEEDED @Porter → คุณฟีน:**
  > separate backoffice login (recommended) or reuse the scheduling admin credential? Either
  > way TASK-013/014 proceed unchanged.
  > **answer (Porter, 2026-07-20):** คุณฟีน chose **SEPARATE** — ops gets its own
  > `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `JWT_SECRET`, independent of scheduling.
