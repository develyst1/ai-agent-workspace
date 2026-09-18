# TASK-381 — RBAC Stage 2 (menu-level), BE: the `menu:*` registry, per-user grants, the guard carries grants, `requireMenu` on every admin route group, `PUT /users/:id/menus`, `GET /auth/me`, self password change (`REQ-092`, `SPEC-079 §2` Stage 2) — contract first

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-17)
**Source:** `REQ-092 §6` · `SPEC-079` (§1 model: keys are code constants; `user_permissions` rows = grants; a super admin has all). Owner: finish full option C on `sid`; `uat` held for one cutover.
**Size M.** ⛔ Chain stopped. **Contract to @Fern through me first** (TASK-382 in parallel). **No migration (37 = 37)** — `user_permissions` exists, empty.

---

## §1 The prior facts (verify)
- Stage 1: `AuthUser { id, username, displayName, isSuperAdmin, role, grants: Set }` — `grants` is empty; `requireSuperAdmin` guards `/users`; `authMiddleware` reads the user row per request.
- The FE nav has 12 entries (`AdminLayout.config.ts`: calendar · teachers · people · link-requests · bookings · badges · som · attention · reports · settings · dashboard · overview) + Stage 1's `users` (super-admin only, NOT a key). The admin API has ~10 route areas; **several READ routes serve more than one page** (the calendar reads teachers; bookings reads students, courses, vouchers…). A guard that ties a route to ONE menu breaks the pages that share it — the map must be route → the SET of menus that may call it.

## §2 The contract (proposed; confirm/correct first)
**The registry — ONE file `lib/permissions.ts`:** `MENU_KEYS = ["menu:calendar", "menu:teachers", "menu:people", "menu:link-requests", "menu:bookings", "menu:badges", "menu:som", "menu:attention", "menu:reports", "menu:settings", "menu:dashboard", "menu:overview"] as const` — exported as a typed list; the FE mirrors it by name (a pin on both sides: the two lists equal). Stage 3 adds `action:*` to the same file.
**Grants on the context:** `authMiddleware` loads the user's `user_permissions` keys with the row (one query with the relation, or one grouped read — say) ⇒ `grants: Set<string>`; a super admin's `grants` is irrelevant (`hasMenu()` returns true for them).
**The guard — `requireMenu(...menus)`:** passes if super admin or `grants` contains ANY of the listed menus; else `403 FORBIDDEN "ไม่มีสิทธิ์เข้าถึงเมนูนี้"`. **Applied to every admin route group** with the SET of menus whose pages call it — you write the map from the FE's actual calls (ask through me if a route's callers are unclear; do not guess narrow). The users group stays `requireSuperAdmin`. Public routes untouched. Assert: every route under `/api/*` (except `/auth/*`, `/users/*`) carries a `requireMenu` — TASK-185's write-route enumeration extended to ALL routes for this.
**Routes:** `PUT /users/:id/menus { keys: string[] }` (super admin) ⇒ replaces the user's `menu:*` grants (unknown key ⇒ `400 VALIDATION`; a super admin target ⇒ accepted but meaningless — say) ⇒ `{ user: UserDTO & { menus: string[] } }`; `GET /users` and the DTO carry `menus`. **`GET /auth/me`** ⇒ `{ user: { id, username, displayName, isSuperAdmin, menus } }` — the FE's source for the nav at load. **`POST /auth/me/password { currentPassword, newPassword }`** ⇒ `{ ok: true }` — any user changes their OWN password (`401` on a wrong current; min 8) — **SPEC-079 §3 decision, built as recommended: yes.**
**Effect timing:** the SERVER refuses immediately on a grant change (per-request read); the FE's nav follows on its next `GET /auth/me` (login/reload) — say it in the contract.
🚫 Not this stage: action keys, roles, hiding buttons.

## Definition of Done
- [ ] Contract confirmed first · the route → menus map in the report (for @Fern and for Stage 3)
- [ ] Suite, **count** · tsc · 37 = 37
- [ ] Pinned: every admin route carries `requireMenu` (enumeration) · a user with `menu:calendar` reaches the calendar's reads and NOT `/reports` · a super admin reaches all · a shared read (teachers list) passes for calendar OR teachers · `PUT` replaces the set; unknown key refused · `/auth/me` shape · self password change: wrong current ⇒ 401, short ⇒ 400, ok ⇒ next login with the new one
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ A user with ZERO menus: refused at login, or let in to an empty shell? Built as SPEC-079 §3.3 (let in; the FE shows "no access — ask your admin"). Say how `/auth/me` answers for them so Fern's shell has a fact to render.

---

## §3 📋 CONTRACT — verified against the tree; CONFIRMED with two decisions and one correction (@Jason, 2026-09-17, before building)

**Confirmed:** `lib/permissions.ts` with the 12 `MENU_KEYS` (the FE mirrors by name; both sides pin the list) · grants on the context, `Set<string>` · `requireMenu(...menus)` = super admin OR any of the listed menus, else `403 FORBIDDEN "ไม่มีสิทธิ์เข้าถึงเมนูนี้"` · every admin route carries a menu set (the map above, from the FE's real calls) · `PUT /users/:id/menus { keys }` replaces the `menu:*` grants (unknown key ⇒ 400; a super-admin target ⇒ accepted, stored, meaningless while super — kept so a later demotion lands on a sensible set) · `GET /users` and the DTO carry `menus` · `GET /auth/me` · `POST /auth/me/password { currentPassword, newPassword }` (SPEC-079 §3.2, built as recommended) · **the server refuses on a grant change within the request; the FE's nav follows on its next `GET /auth/me`** · no migration (37 = 37).

✅ **Decision 1 — ONE table, ONE guard, fail closed.** Not 85 hand-placed `.use()`s: `lib/route-menus.ts` holds `ROUTE_MENUS: Record<"METHOD /path", MenuKey[]>` (the table above, in code), and ONE `menuGuard` middleware on `/api/*` after the auth guard reads the matched handler route (`c.req.matchedRoutes`), looks it up, and applies `requireMenu(...)`. A route with NO entry is refused `403` and logged loudly — an auth guard fails closed — and the enumeration test (TASK-185's shape, extended from write routes to ALL routes) makes that impossible to ship: every route in `api.ts` must have an entry, and every entry must name a route (no stale keys). Stage 3 adds the `action:*` column to the same table. `requireMenu` stays exported as the primitive.
✅ **Decision 2 — grants are loaded only for a NON-super-admin** (one indexed read on `user_permissions` by `user_id`, after the row); a super admin's set is empty and irrelevant (`hasMenu` short-circuits). One PK read + one index read per request for a normal user; the super admin keeps Stage 1's single read.
🔴 **Correction — `/auth/me` cannot sit in `authRoutes` as-is: `/api/auth` is mounted BEFORE the JWT guard (login is public), so anything added there is unguarded.** The two `me` routes are registered in `authRoutes` with the JWT guard applied EXPLICITLY on `/me` and `/me/*` (`authRoutes.use("/me", authMiddleware)`), and `/auth/*` is excluded from the menu table — a user with zero menus must still reach `/auth/me` (that IS the fact the shell renders) and change their own password. Pinned: `/auth/me` without a token ⇒ 401; `/auth/login` still public.
📌 **`/auth/me` for a ZERO-menu user (your owner's-list question, built as §3.3):** the login succeeds; `GET /auth/me` ⇒ `{ user: { id, username, displayName, isSuperAdmin: false, menus: [] } }` — an empty array, not an error — and every menu route answers `403 "ไม่มีสิทธิ์เข้าถึงเมนูนี้"`. Fern's shell renders on `menus.length === 0 && !isSuperAdmin`.
📌 **The self password change:** wrong current ⇒ `401 UNAUTHORIZED "รหัสผ่านปัจจุบันไม่ถูกต้อง"`; short new ⇒ `400 PASSWORD_TOO_SHORT`; ok ⇒ `{ ok: true }`, the next login uses the new one (the hash is replaced; existing tokens stay valid — Stage 1's design, the row read does not check the hash).

### 📋 THE ROUTE → MENUS MAP — from the FE's ACTUAL calls (traced page → partial → hook → service → path; not a guess)
**Method:** every `components/partials/<Page>` (1:1 with the 12 pages) and the component files it imports (non-barrel) were scanned for the hook and service functions they CALL; each hook/service function was resolved to the API paths in its body. The layout shell calls nothing. 3 routes have NO FE caller today and are placed by area (marked ✱).

| area / route | menus | why |
|---|---|---|
| `GET /calendar` | calendar | the grid |
| `GET /bookings`, `PATCH /bookings/:id`, `PATCH …/note`, `PATCH …/status`, `GET …/checkin` | calendar, bookings | the booking modal is on both pages |
| `POST /bookings`, `PATCH …/badges`, `POST …/pause`, `…/resume`, `GET …/posted-sale`, `POST/DELETE …/rental`, `POST …/rental/paid` | calendar | the modal's actions (the calendar owns the cell) — bookings included where its list opens the same modal: **calendar, bookings** |
| `POST /bookings/bulk-confirm` | bookings | the list's bulk action |
| `POST /rentals`, `GET /sellable-packages`, `GET /catalog-items`, `GET /slots/availability`, `GET /entitlements/:id/plan` | calendar, bookings (+ overview for the entitlement plan) | the booking FORM's reads, opened from both pages |
| `GET /students`, `POST /students`, `GET /students/eligible` | calendar, bookings | the student picker in the form |
| `PATCH /students/:id`, `DELETE /students/:id` | people | the People page's child row |
| `GET /crm/levels` ✱ | people, calendar, bookings | the CRM ladder shown on a student card (no FE caller today) |
| `/parents`, `/parents/:id`, `…/students`, `…/suspend`, `…/unsuspend`, `…/clear-line-link` | people | |
| `/courses/*` (list, create, preview, plan, plan/preview, expiry, expiry/preview, expiry-history ✱, extra-session, history, confirm, drop, resume, cancel, cancel/preview, import, import/preview) | bookings | the course editor lives on the Bookings page |
| `GET/POST /vouchers`, `POST /vouchers/import` | bookings | |
| `GET /teachers` | calendar, bookings, link-requests, reports, teachers | the shared teacher list — five pages read it |
| `POST /teachers`, `PATCH /teachers/:id`, `…/archive`, `…/reactivate`, `…/budget`, `…/budget/topup`, `…/limit-override`, `…/work-days`, `…/work-days/impact`, `PATCH /teachers/availability`, `GET/PATCH /teachers/type-order`, `POST …/calendar-link` ✱ | teachers | |
| `DELETE /teachers/:id/line-link`, `/teacher-link-requests`, `…/approve`, `…/reject` | link-requests | |
| `GET /badges` | badges, calendar | the badge picker in the modal |
| `/badges/types`, `/badges/values` (+ `:id`) | badges | |
| `GET /badges/report` | dashboard | |
| `GET /attention` | attention | |
| `GET /reports/daily` | reports | |
| `GET /reports/som` | som | |
| `GET /settings`, `PUT/DELETE /settings/:key` | settings | |
| `/users/*` | — (`requireSuperAdmin`, not a menu) | |
| `/auth/*` | — (public; `/auth/me*` behind the JWT guard only) | |

**Contract lines for @Fern:** `GET /auth/me` ⇒ `{ user: { id, username, displayName, isSuperAdmin, menus: string[] } }` (super admin: `menus` = all 12) · `POST /auth/me/password` ⇒ `{ ok: true }` / 401 / 400 · `PUT /users/:id/menus { keys: string[] }` ⇒ `{ user }` with `menus` · every `UserDTO` gains `menus: string[]` · a menu route without the grant ⇒ `403 FORBIDDEN "ไม่มีสิทธิ์เข้าถึงเมนูนี้"` — the FE should treat a 403 on a page read as "menu revoked, reload the nav".

▶️ Building now.

---

# 📤 REPORT — @Jason → @Sober (2026-09-17)

✅ **DONE (code), against §3 as confirmed.** **2327 pass / 0 fail**, **186 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (37 = 37)**.

## §4 What was built
- **`lib/permissions.ts`**: `MENU_KEYS` (12, nav order), `isMenuKey`, **`hasMenu(user, ...menus)`** (super admin ⇒ true; else ANY of the listed), `menusOf(user)` (a super admin: all 12; else the grants in nav order) — Stage 3 adds `action:*` here.
- **`lib/route-menus.ts`**: `ROUTE_MENUS` — **85 routes → menu sets, the §3 map in code** (`GET /teachers` five menus; the booking modal/form reads two; `GET /badges` two; the entitlement plan three; three routes with no FE caller placed by area, marked ✱); `routeKey`.
- **`middleware/auth.ts`**: the guard loads grants with the row — **one index read, only for a non-super-admin**; `requireMenu(...menus)` (the primitive, `403 "ไม่มีสิทธิ์เข้าถึงเมนูนี้"`); **`menuGuard`** — reads the matched handler route from `c.req.matchedRoutes`, skips `/auth/*` and `/users/*`, **an unmapped route ⇒ 403 + a loud `[rbac]` log (fails CLOSED)**, an unknown path (no handler matched) ⇒ falls through to TASK-297's 404.
- **`index.ts`**: `authMiddleware` → `menuGuard` → the users group (order pinned).
- **`user.service.ts`**: `userGrantKeys` (the guard's read), `grantsByUser` (ONE grouped read for the list), `menus` on every `UserDTO` (a super admin: all 12), **`setUserMenus`** (unknown key ⇒ 400 before any write; one transaction: delete `menu:%` rows, insert the deduplicated set; a super-admin target accepted and stored), **`changeOwnPassword`** (verify the CURRENT hash ⇒ 401 `"รหัสผ่านปัจจุบันไม่ถูกต้อง"`, then min 8 ⇒ 400, then replace).
- **Routes**: `PUT /users/:id/menus { keys }` (super admin) · **`GET /auth/me`** and **`POST /auth/me/password`** in `authRoutes` with the JWT guard applied EXPLICITLY on `/me` + `/me/*` (auth is mounted before the guard — the correction) · the login body's `user.menus`. `validation.ts`: `setUserMenus`, `changeOwnPassword` (shape only). `contract.ts`: `UserDTO.menus`.
- 🔻 **Pins moved, with reasons:** TASK-377's DTO-keys pin (+ `menus`) and its guard-line pin (+ the grants); the auth middleware test's login body (a super admin's `menus` = all 12) and its `userGrantKeys` spy.

## §5 Pinned (`lib/rbac-stage2-menu-guard-req092.test.ts`, 23 tests)
- **The registry with values:** the 12 keys in order; `users` and an `action:*` are not menu keys; `hasMenu` for a super admin / a holder / a non-holder / a shared read / nobody; `menusOf` in nav order, non-menu keys ignored, `[]` for none.
- **🔴 The enumeration:** every route `routes/api.ts` declares (85, the floor) has a `ROUTE_MENUS` entry; every entry names a declared route (no stale keys) and lists ≥ 1 known menu; the shared reads' sets asserted by value; `/auth` and `/users` absent from the table. *(The first run of this pin failed on four `c.get("user")` false matches of the route regex — a route path starts with `/`; that filter is in the pin with the reason.)*
- **The guard end to end (the real `authMiddleware` + `menuGuard` on a mini app, service spied):** a `menu:calendar` user reaches `/calendar` and the SHARED `/teachers`, and gets 403 + the sentence on `/reports/daily` · a super admin reaches all **and the grants read is skipped for them** (the spy's call list is empty) · a zero-menu user is let in by the token and refused on every menu route · **fails closed: an unmapped route ⇒ 403 for a normal user AND a super admin, with the `[rbac]` log** · an unknown path ⇒ 404 (TASK-297's envelope survives) · `requireMenu` as a primitive.
- **The routes through the ROOT app:** `GET /auth/me` ⇒ the dev super admin with all 12 · **`/auth/me` and `/auth/me/password` without a token ⇒ 401, login still reaches its handler** · a zero-menu user's `/auth/me` ⇒ `menus: []` (the shell's fact) · `POST /auth/me/password` with the caller's OWN id: wrong current 401 / short 400 / ok `{ ok: true }` · `PUT /users/:id/menus` ⇒ `{ user }` with the set, actor `dev`, unknown key 400.
- **Source:** `setUserMenus` refuses before the transaction, deletes `menu:%`, inserts the deduplicated set · `changeOwnPassword` verifies before the length rule · `listUsers`'s one grouped read · the DTO's `menus` derivation · the guard order in `index.ts` · the non-super-admin-only grants read · 37 = 37.

## §6 🔑 Mutation — thirteen, `finally`, checksum — all bite
A the guard fails OPEN · B `hasMenu` requires ALL instead of ANY (2) · C a super admin not exempt (3) · D grants loaded for a super admin too (3) · E grants never loaded (3) · F `GET /teachers` narrowed to one menu (2) · G a route dropped from the table (3) · H a stale entry added · I `/auth/me` loses its explicit guard (4) · J the menu guard mounted before the auth guard · K `setUserMenus` appends instead of replacing · L the current-password check skipped · M an unknown path refused 403 (2). Every restore byte-identical.

## §7 ❓ Owner's-list answer (from §3): a zero-menu user is let in; `/auth/me` answers `menus: []`, every menu route 403 — built as §3.3, pinned. Effect timing: the server refuses within the request; the FE's nav follows on its next `/auth/me`.
📌 **Contract lines for @Fern in §3.** Stage 3's hook: the `action:*` column goes into `ROUTE_MENUS`'s file beside the menu sets — same table, same guard, same enumeration.
