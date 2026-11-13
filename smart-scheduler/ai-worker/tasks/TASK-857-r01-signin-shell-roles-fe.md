# TASK-857 — FE: R0.1 sign-in page + shell + role visibility (backoffice-front) — @Fern — REQ-120 wk 1
**From @Sober, 2026-11-08. BUILD GO.** SPEC: `specs/SPEC-097-r0-roles-users-signin-contract.md`. Repo: `smart-scheduler-backoffice-front` (Next 16 + Mantine 9), branch `dong`. **Git only on the owner's word.**
**Carry over from the agreed final UI** (`som-balance-backoffice-spec/final-ui`, REQ-133, md5 `1d0ce1f6…`) — it is the prototype, never the product; bring the shell/components into the real Next app.

## Steps
1. **Shell:** carry over the AppShell (sidebar + header, SOM BALANCE · BACK OFFICE), dark theme by default (TASK-847), from `final-ui/src/shell`.
2. **Sign-in page:** username + password → `POST /auth/login` (SPEC §3/§4); store the token; on 401 show the error; the page is the only route reachable signed-out.
3. **Role context:** `useRole()` from the token's `role`; the menu + page gates filter by role exactly as `final-ui` does (CEO all · admin no pay/revenue pages · coach own); the "cannot see" screen for a role that may not open a page.
4. **Field masking** is per page as blocks land (not this TASK) — but the **no-pay/no-revenue-for-admin** rule is wired in the role context so later pages inherit it.

## Done = (evidence in `## Implementation Notes`)
- `tsc` 0 · `next build` 0 · 0 console errors.
- Signed-out → only the sign-in page; a wrong login shows the error; a good login lands on the role's home.
- The 3 roles (seeded/stub) each see the right menu; an admin sees no pay/revenue page; dark by default.
- `git status` = only your claimed files. **No git command run.**

## Questions
_(none blocking; 3 decisions to confirm are listed in Implementation Notes)_

## Implementation Notes
**Fern, 2026-11-08.** Repo `smart-scheduler-backoffice-front`, branch `dong`. The repo already had a Phase-1 shell + login (single admin), so I extended it rather than re-copying final-ui: its shell (sidebar groups, header, NoAccess screen, role gate by a page table) is the same pattern, brought in as follows.
- **Role model:** `src/types/app/roles.ts` (`Role = "ceo"|"admin"|"coach"`, `SessionUser {username, role, teacherId}`), `src/lib/auth.ts` `getClaims()` (token claims `{sub, role, teacherId}`; null if unreadable / no valid role), `src/context/RoleContext.tsx` (`RoleProvider`, `useRole()`, `useSession()`).
- **One role table:** `src/lib/roles/pages.ts` `PAGE_RULES` = route, group, roles, `money`, `menu`. The menu (`menuFor`), the page gate (`canOpen`) and each role's home (`homeFor`) all come from it. **The no-pay/no-revenue-for-admin rule is enforced where the table is defined:** a `money: true` page listing `"admin"` throws at module load, so a later page cannot slip past it.
- **Shell:** `Sidebar` draws groups from `menuFor(role)` (ALL-CAPS group labels as final-ui); brand "SOM BALANCE · BACK OFFICE"; `Header` shows username + role badge (no switcher: the role is the token's); `AdminLayout` gates: denied ⇒ `NoAccess` screen (`data-no-access`, children are NOT rendered so no data call fires); a token with no valid role ⇒ clears it, back to /login. Dark by default was already set (`defaultColorScheme="dark"`), checked: `data-mantine-color-scheme="dark"` on first load.
- **Sign-in:** `/login` → `POST /v1/auth/login` (the path the back already mounts; SPEC §3 writes `/auth/login`), token stored in the existing `bo_token` cookie, wrong login shows the API's message (stub: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"), good login lands on `homeFor(role)` (a `next` the role may not open falls back to home). `/` (root) now sends a signed-in person to their home. `proxy.ts` matcher gained `/`, `/my-slip` and **`/revenue`, which was NOT guarded before** (a signed-out visit used to open the page shell).
- **Evidence (headless Chromium vs a throwaway stub of `POST /api/v1/auth/login`, ports 3011/4011, both stopped after):**
  - `tsc --noEmit` 0 · `next build` 0 (also from the final tree, no env override).
  - Signed-out `/`, `/items`, `/revenue`, `/my-slip` → `/login?next=…`. Wrong login: error shown, stays on /login.
  - **CEO** → home `/dashboard`, menu: งบกำไร–ขาดทุน · รายได้แยกตามกิจกรรม · รายการ · แท็ก; opens dashboard/revenue/items/payroll; `/my-slip` NO-ACCESS.
  - **Admin** → home `/items`, menu: รายการ · แท็ก only; `/dashboard`, `/revenue`, `/payroll`, `/reports`, `/my-slip` all NO-ACCESS.
  - **Coach** → home `/my-slip`, menu: สลิปของฉัน only; `/items`, `/dashboard` NO-ACCESS.
  - Console: the only errors are the intended wrong-login 401 and the 404s of the old pages' data calls (`/bo/reports/pl`, `/bo/items`, `/bo/tag-groups`, `/bo/reports/revenue-by-activity`) that my stub does not serve; nothing from the shell, login or the gate.
- **Decisions for you to confirm (any can be flipped in one line of `PAGE_RULES`):**
  1. The table: **ceo-only** = งบกำไร–ขาดทุน, รายได้, payroll, ftpt-salary, freelance-budgets, reports; **ceo+admin** = items, tags, wallet, inventory (items/tags are what an admin records); **coach** = `/my-slip` only.
  2. `/my-slip` is a placeholder page (coach's own slip lands with the salary block); `teacherId` is carried in the session for it.
  3. Menu groups REPORTS / REVENUE / ITEMS / SALARY are mine (the old Thai labels stay).
- **Not tested:** against the real back (TASK-856 not landed; the live stub login returns role `"admin"` only). The role is read from the token for display and gating only; the API stays the boundary.
- **git status** (front repo): modified `src/app/(admin)/layout.tsx`, `src/app/layout.tsx` (title), `src/app/login/page.tsx`, `src/app/page.tsx`, `src/components/common/PagePlaceholder.tsx`, `AdminLayout.config.ts`, `AdminLayout.tsx`, `Header.tsx`, `Sidebar.tsx`, `src/lib/auth.ts`, `src/proxy.ts`, `src/services/auth.service.ts`; new `src/app/(admin)/my-slip/`, `src/context/RoleContext.tsx`, `src/lib/roles/`, `src/types/app/roles.ts`. **No git command run** beyond reading status.

## Review
_(—)_

## Review
**Sober, 2026-11-08: DONE** (FE complete and proven against a matching stub; real-back integration verifies when TASK-856 deploys). Strong work, and two things above the ask:
- The **no-pay/no-revenue-for-admin rule enforced at the table's definition** (`money:true` + `"admin"` throws at module load) is stronger than I specced — a later page can't slip past it. ✅ R0.2.
- You **guarded `/revenue`, which was unguarded before** — a real signed-out-exposure fix. ✅
- Role model / token shape match SPEC-097 §4 exactly (`Role = ceo|admin|coach`, `{username, role, teacherId}`). 3 roles gate correctly (CEO/admin/coach menus + NO-ACCESS), dark by default. tsc 0 / next build 0.
**Your 3 decisions — confirmed, with one caveat:**
1. The role table (ceo-only = P&L/revenue/payroll/salary/reports; ceo+admin = items/tags/wallet/inventory; coach = my-slip): **the RULE is right** (admin never money/revenue). ⚠️ **The specific page list is PROVISIONAL** — those are the old ERP pages; they change when the REQ-120 pages replace them (and the D1-prop rebuild decision). Keep the table, expect the rows to turn over.
2. `/my-slip` placeholder + `teacherId` in the session — ✅.
3. Menu group labels — ✅.
**One note (not a fix):** the canonical login path is **`/api/v1/auth/login`** (back: `app.route("/api", api)` → `/v1` → auth `/login`). SPEC §3's `/auth/login` was shorthand — I've aligned it; your `/v1/auth/login` via the proxy resolves to it. Confirm it end-to-end when 856 is deployed.
