# SPEC-097: R0.1 — roles, users and sign-in (the contract all three teams build against) — REQ-120, BUILD GO 2026-11-08
**Author:** Sober (SA, Team A) · **Repo:** `smart-scheduler-backoffice-back` (Hono) + `smart-scheduler-backoffice-front` (Next/Mantine), branch `dong`. **TASKs:** TASK-856 (BE), TASK-857 (FE).
**Why this is first:** every back-office screen and API is behind sign-in and role. **Revenue (Team C) is CEO-only and cannot integrate until this lands — so this contract is published by end of wk 1** for Sector to build against.

## 0. What exists today (read before building)
- `backoffice-back/src/routes/auth.ts`: **Phase-1 single-admin stub** — one admin from `ADMIN_USERNAME/PASSWORD`, role hard-coded `"admin"`, token `{sub, role:"admin"}`.
- `src/middleware/auth.ts`: an admin JWT gate; `SKIP_ADMIN_AUTH=true` bypasses (dev).
- `src/db/schema.ts`: `accounts` is the **financial** ledger (party/unit/currency), **not** user accounts; comment line 467 "No roles/approvals". **There is no user-role model yet.**
- The final UI's role model (what the FE already assumes): `Role = "ceo" | "admin" | "coach"` (`final-ui/src/shell/types.ts`). **Match it exactly.**

## 1. The three roles (REQ-120 R0.1/R0.2/R0.3)
`type Role = "ceo" | "admin" | "coach"` — lower-case, these three, no others.
- **ceo** (พี่ฟีน): sees everything.
- **admin** (incl. ขวัญ, พี่กุ้ง): records items; **never sees any coach pay (base, FL rate, slip total) or any revenue** (R0.2); adds items **blind** (R0.3).
- **coach**: sees **only their own** slip.

## 2. The user model (new tables — one migration, through MIGRATION-QUEUE.md)
- `bo.users`: `id` · `username` (unique) · `password_hash` · `role` (the enum) · `teacher_id` (nullable uuid referencing the scheduling teacher, for a coach's "own slip" scoping — **plain uuid, NO cross-schema FK**; `public.teachers` belongs to smart-scheduler-back, and `bo.item.owner_ref` already follows this no-FK house pattern. Integrity is enforced at seed/app level, 2026-11-08) · `active` · timestamps.
- A **pgEnum** `bo.role` = `('ceo','admin','coach')`.
- **Schema-qualified names** `bo.role` / `bo.users` (matching the existing `bo.item` / `bo.movement`) are the as-built names; the `bo_users` / `bo_role` spelling above was shorthand (ruled 2026-11-08).
- Seed: one `ceo` for พี่ฟีน (credentials from the owner via Porter, never hard-coded). The dev single-admin stub stays only under `SKIP_ADMIN_AUTH`.
- 🔴 Schema change ⇒ **a migration, serialized through `MIGRATION-QUEUE.md`** (shared sid DB, 3 teams, one journal). Team A takes the first wk-1 migration slot.

## 3. Sign-in (the meeting: "same login as the front office")
- **Default design (confirm the front-office mechanism in a wk-1 read, then lock):** the back office has its own `POST /auth/login` (username + password → JWT `{sub, role, teacherId?}`), validating against `bo_users`. A person uses the **same username/password as the front office** by seeding `bo_users` from the front-office identity; a later SSO (accept the front's token) is a follow-up, not wk 1.
- `login` response: `{ token, user: { username, role, teacherId } }`. Token TTL from `JWT_TTL_SECONDS`.
- ⚠️ `inferred` — the exact front-office auth (NextAuth in `smart-scheduler-front`) link is read in wk 1 (TASK-856 step 0) before the seed strategy is fixed; this SPEC's shape (bo_users + role in the token) does not change either way.

## 4. The contract every team consumes (stable; do not change without a SPEC bump)
- **Middleware:** `requireAuth` (valid Bearer → `c.var.user = {sub, role, teacherId}`), and `requireRole(...roles: Role[])` → 403 `FORBIDDEN` otherwise. Replaces the single-admin gate.
- **Team C (Revenue) uses `requireRole("ceo")`** on every revenue route. **Team B / A** use `requireRole("ceo","admin")` where admins may act, and **field-level masking** (hide pay/revenue from admin) is the handler's job per R0.2 — the middleware gates the route, the handler hides the field.
- **FE:** `useRole()` + the shell's role switcher drive page and field visibility exactly as `final-ui` already does (carry it over).
- **Casing is exact:** role strings lower-case; the token field is `role`; the user object is `{username, role, teacherId}`.
- **Token `sub` = the username** (the audit actor), not the row id (as-built, 2026-11-08). Usernames are the stable login identity.
- **The gate reads the token only** — no per-request DB read — so a user deactivated mid-session keeps access until the token expires (`JWT_TTL_SECONDS`, 12 h). Login does reject an inactive user. A **per-request `active` check is a deferred R-later hardening** (small admin set, low risk for R0.1); flagged so it is not forgotten.
- 🔶 **Team C heads-up (guard-detection):** `src/routes/bo.test.ts` finds guarded routes by `handler.name === "adminAuth"`. A route guarded with `requireRole(...)` / `requireAuth` does **not** match that walk. When Team C adds its first `requireRole("ceo")` revenue route, that assertion must also accept `"requireRole"` / `"requireAuth"` — a one-line fix that belongs with Team C's first guarded-route TASK, not TASK-856.

## 5. Out of scope (later in the spine)
F3 multi-role/STAFF, F6 coach login polish, R0.4 notifications. R0.1 here = sign-in + the three roles + the gate + the user model + CEO seed. Admin field-masking rules are applied per page as each block is built.

## 6. Done = (TASK-856/857)
- `bo_users` + `bo_role` enum migrated (one queued migration); `POST /auth/login` returns `{token, user:{username,role,teacherId}}`; `requireRole` gates a probe route three ways (ceo/admin/coach); the single-admin stub only under `SKIP_ADMIN_AUTH`.
- FE: sign-in page + role context; the carried-over shell shows pages per role; an admin sees no pay/revenue page.
- Evidence: the migration applied on sid (through the queue), the three role gates shown (200/403), the login round-trip.
