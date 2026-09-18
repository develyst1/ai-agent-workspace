# SPEC-079 — `REQ-092` RBAC: the STAGED build plan (Sober, 2026-09-17)

**Source:** `REQ-092 §6` (owner: full system; super admin registers users and manages menu + action permissions; roles; per-user overrides; disable; reset password; configured at RUNTIME; first super admin bootstrapped). **Delivery:** four stages, each its own `sid` → QA → `uat`.

## §0 What exists (the read, `inbox/PM.md` 2026-09-17)
One shared env login (`ADMIN_USERNAME/PASSWORD`); JWT `{ sub, role }` with `Role = "admin" | "staff"`; `authMiddleware` on `/api/*`; `requireRole` exists, unused; FE next-auth Credentials → `/auth/login`, session holds `backendToken` + `role`; nav = one config table (12 entries); 59 admin mutate routes in ~10 areas. No users table.

## §1 The model (all stages; built incrementally)
- **`users`** — `id` · `username` UNIQUE · `password_hash` · `display_name` · `is_super_admin bool` · `disabled_at null` · `created_at/by` · `updated_at`. (Stage 1)
- **Permission KEYS are code constants, not rows** — a `menu:<key>` per nav entry (12) and an `action:<area>.<verb>` per mutate route (~59), one registry file in the BE, exported to the FE as a typed list (the FE never invents a key). (Stage 2 defines menus, Stage 3 actions.)
- **`user_permissions`** — `(user_id, key)` rows = the user's effective GRANTS (Stage 2 onward). A super admin ignores the table (has all).
- **`roles`** + **`role_permissions`** + `users.role_id` — a role is a named bundle; assigning a role SETS the user's grants; per-user overrides are rows in `user_permissions` marked `override` (Stage 4). Until Stage 4, grants are per user only.
- **The guard** — the JWT carries `sub = user id`; `authMiddleware` loads the user row per request (one indexed read), refuses `disabled_at` (revocation within the request, not the TTL), attaches `{ id, username, isSuperAdmin, grants: Set<key> }`; `requirePermission(key)` refuses `403` unless super admin or granted. (Stage 1 loads the row; Stage 2 adds grants.)
- **Actor** — every existing `actor` argument gets `username` (audit lines become real names for free); pre-cutover rows keep the shared word (`REQ-088 §9.1` precedent).

## §2 The stages
| stage | what lands | migrations | size |
|---|---|---|---|
| **1 Foundation** | `users` table; `Bun.password` hashing (built-in, no dependency); `/auth/login` against the table; the FIRST super admin **bootstrapped from env on first boot when the table is empty** (`BOOTSTRAP_ADMIN_USERNAME/PASSWORD`; the old `ADMIN_*` env login is RETIRED the moment one user exists — a decision, §3); users CRUD + reset-password + enable/disable, super-admin only; guard loads the row; actor = username. FE: **Users** page (list · create · disable/enable · reset password · mark super admin), login unchanged, header shows the user. | `0036` (37 = 37): `users` + `user_permissions` (created now, empty, so Stages 2–3 need NO migration) | BE M · FE M |
| **2 Menu guard** | the `menu:*` registry (12); grants per user on the Users page (a checklist); FE nav filters on grants + a route guard; BE refuses an area's routes without its menu grant (`requirePermission` per route group). | none | BE S · FE S–M |
| **3 Action guard** | the `action:*` registry (~59) attached route-by-route (one table in code, one middleware); FE hides/disables each action by key (the sweep); the Users page's checklist grows the action keys grouped by area. | none | BE M · FE M–L |
| **4 Roles + matrix** | `roles`, `role_permissions`, `users.role_id`; a Roles page (name a bundle, tick keys); assign a role to a user; per-user overrides on top; the matrix view (users × areas). | `0037` (38 = 38) | BE M · FE M |
Deploys: 4 (one per stage), 2 with migrations (1 and 4).

## §3 Decisions that need the OWNER before the stage (flagged to @Porter)
1. **(Stage 1)** The old env login is retired once a real user exists — or kept as a break-glass? *My recommendation: retired; the bootstrap env pair is the break-glass (it re-creates the first super admin only when the table is EMPTY).*
2. **(Stage 1)** Password rules: minimum length only (8), no complexity — *recommendation*; and reset = the super admin sets a new password (no email flow — the app has no mail).
3. **(Stage 2)** A user with NO menu grants: refused at login with a sentence, or lets in to an empty shell? *Recommendation: lets in, sees nothing, the header says "no access — ask your admin".*
4. **(Stage 3)** Read-only areas: is "see the menu but change nothing" a valid combination (menu grant without action grants)? *Recommendation: yes — that IS the point of separating them.*

## §4 Non-goals (all stages)
No parent/teacher/LIFF change (the public routes stay before the guard); no email; no self-service sign-up; no password-strength meter; no session list/"log out everywhere" (the row read handles disable).

## §5 — The single `uat` cutover (written 2026-09-18, when all four stages were green on `sid`)
**What lands at once:** Stage 1 (`0036_users`), Stage 2, Stage 3, Stage 4 (`0037_roles`) — BE and FE. **What breaks at once, by design:** the shared `admin` login stops the moment the first user exists; every staff member needs their own account.
**Order (the human runs every step; agents never touch `uat`):**
1. **Before the hour** — nothing on `uat` yet: the super admin decides the roles (e.g. front desk / coach lead / accountant) and the list of staff usernames.
2. `db:migrate` — **`0036` + `0037` + `0038` + `0039` in ONE run** (no enum labels; preflight has nothing to split): `0036`/`0037` add tables (lock nothing existing) and a nullable column on `users`; `0038` adds two nullable columns on `course_packages` (REQ-091 §14); `0039` adds two on `students` (REQ-093); `0040` adds four on **`bookings` — the HOT table** — and one on `booking_teachers` (REQ-095 Stage 1) — every column add is catalog-only (no rewrite), but each is an ACCESS EXCLUSIVE blink that queues behind anything holding the table: **run at a quiet moment, never during the 17:30 job or an import.** Then `db:verify` ⇒ **41**. (Updated 2026-09-18: the cutover now carries REQ-094, REQ-091 §14 and REQ-093 with RBAC.)
3. BE env: set `BOOTSTRAP_ADMIN_USERNAME` / `BOOTSTRAP_ADMIN_PASSWORD` (**8+ characters** — a shorter one is refused loudly), restart the BE (`pm2`), deploy the FE build.
4. **First login with that pair creates the super admin.** From then on the env pair is ignored; remove `ADMIN_USERNAME/PASSWORD` from the env (they are read nowhere).
5. On the Users/Roles pages: create the roles, create every staff account (min 8-char passwords, the super admin sets them), assign roles, tick any extra menus/actions per person. **Until this is done, staff cannot work** — do it in the same sitting.
6. Every pre-cutover browser session is refused with 401 ("sign in again") — never a 500 (TASK-380 §2).
**Rollback:** the tables are additive; the old env login is gone in code, so rollback = redeploy the previous build (the new tables can stay).
