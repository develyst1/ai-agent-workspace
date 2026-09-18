# TASK-382 — RBAC Stage 2 (menu-level), FE: the nav filters on the user's menus, a route guard per page, a menu checklist per user on the Users page, the "no access" shell, the disabled-reason on login, "change my password" (`REQ-092`, `SPEC-079 §2` Stage 2)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-17)
**Contract (proposed to @Jason, TASK-381; confirmation via me):** `MENU_KEYS` (12, `menu:<navKey>`) — mirror the list by name and pin equality · `GET /auth/me` ⇒ `{ user: { id, username, displayName, isSuperAdmin, menus: string[] } }` · `UserDTO.menus` · `PUT /users/:id/menus { keys }` ⇒ `{ user }` · `POST /auth/me/password { currentPassword, newPassword }` ⇒ `{ ok }` (`401` wrong current, `400 PASSWORD_TOO_SHORT`) · a route without the menu ⇒ `403 FORBIDDEN "ไม่มีสิทธิ์เข้าถึงเมนูนี้"`. The server refuses immediately on a grant change; the nav follows on the next `/auth/me`.
**Size M.** ⛔ Chain stopped. Ships with TASK-381 (`sid` only; `uat` held).

---

## §1 The nav and the pages
- The session (or a `useMe()` query at load — say which; the session is set at login, `/auth/me` on load keeps it honest after a super admin changes grants) carries `menus`. **`navItemsFor` gains the menus**: an entry shows iff super admin OR its `menu:<key>` is granted (`users` stays `superAdminOnly`). ONE rule, the same function Stage 1 added.
- **A route guard on the `(admin)` layout** (one place): a page whose key is not granted renders the app's "no access" sentence (Stage 1's Alert shape) — never a blank; a `403` from the API on that page shows the server's sentence.
- **The empty shell** (SPEC-079 §3.3): a user with zero menus lands on a page that says *"You have no menus yet — ask your admin."* / TH; the header still shows who they are and offers "change my password" (§3).

## §2 The Users page — the menu checklist
- Each user row gains **`Menus`** (a count chip; click ⇒ a dialog with 12 checkboxes labelled by the nav's own `labelKey`s, grouped as the nav is; `Select all` / `none`) ⇒ `PUT /users/:id/menus { keys }`; a super admin row shows *all menus (super admin)* and no checklist. This is the **bridge until Stage 4**: per-user direct grants; Stage 4's roles will SET these same rows.

## §3 Two small items from the list, folded in (owner decisions flagged to @Porter; build as recommended)
- **"Change my password"** in the header's user menu (any user): current + new + confirm ⇒ `POST /auth/me/password`; server sentences.
- **The disabled reason on login:** when the API's 401 carries `บัญชีนี้ถูกปิดใช้งาน`, the sign-out redirect adds `?reason=disabled` and the login page shows ONE line (*"This account has been disabled — contact your admin."* / TH); every other 401 unchanged.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok
- [ ] `MENU_KEYS` equality pin · nav filter value-tested (super admin all; a two-menu user two; zero ⇒ the shell) · route guard on a non-granted page · checklist request shape `{ keys }` · change-my-password shape · disabled reason shown only for that sentence
- [ ] Keys counted, both languages
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ The dashboard is the app's landing page — a user without `menu:dashboard` lands where? Say what the layout does today for `/` and build the simplest (first granted menu, else the shell).

---

## §4 ✅ IMPLEMENTED — Fern, 2026-09-17. **The nav and every page follow the user's menus from `/auth/me`; the empty shell; a `Menus` checklist per user; "change my password" on the avatar; the disabled reason on login.**

```
bunx tsc --noEmit → exit 0
bun test          →  403 pass / 0 fail   (was 394; +9 — new lib/rbac/menu-guard.test.ts)
bun run build     → ok — every /scheduler/* route static as before
git status        →  16 modified · 8 new (lib/rbac/{menus.ts,menu-guard.test.ts} · layout/AdminLayout/MenuGuard.tsx ·
                     Header/ChangePasswordModal.tsx · hooks/scheduler/useMe.ts · services/me.{service,mock.service}.ts)
```
Built against @Jason's CONFIRMED contract (TASK-381, 2327/0). 🚫 No roles · no `action:*` · no permissions matrix
(Stages 3–4). The Stage-1 page and its pins are intact — four TASK-378 pins moved to the Stage-2 shapes, named below.

### `§1` — the nav and the pages
- **The source of `menus` — answered: `useMe()` (`GET /auth/me`) is the truth; the session only SEEDS it.** The login
  body's `user.menus` ride the token to the session (`auth.ts` → `auth.config.ts` → `next-auth.d.ts`), and `useMe()`
  hands them to TanStack as `initialData` with **`initialDataUpdatedAt: 0`** — stale on arrival, so the real read fires
  at once and the nav does not flash empty on a reload. Then `staleTime` 30 s, refetch on window focus, and **a
  refetch on any `403`** (`lib/api/client.ts` fires `ss:forbidden`; `useMe` listens) — a grant taken away mid-session
  shows the guard's sentence on the very next refused call, not a page that cannot load. A pre-Stage-2 token has no
  seed: the guard waits for the read (a spinner, never the page's fetches). Mutation 6 fails.
- **`MENU_KEYS`** (`lib/rbac/menus.ts`) — the twelve, the BE's literal by name and order. 🔴 **Pinned two ways:** the
  literal itself, AND the nav-derived list (`NAV_ITEMS` then `HIDDEN_NAV_ITEMS`, each entry's new **`menuKey`**) must
  `toEqual` it, in order. 📌 *That pin found a real miss on the first run: my edit had skipped `menu:badges` on the
  Badges entry — the page would have been OPEN to everyone. Fixed; mutations 1 and 2 (a dropped key, a wrong key on an
  entry) each fail two tests.* `users` has no key (super-admin-only, as the BE says). `overview` moved from a
  commented-out line into `HIDDEN_NAV_ITEMS` with `menu:overview` — hidden as before, but type-checked and keyed.
- **ONE rule — `mayOpen(me, item)`:** `superAdminOnly` ⇒ the flag; `menuKey` ⇒ `hasMenu` (a super admin has all);
  neither ⇒ open. **`navItemsFor(me)`** now takes `{ isSuperAdmin, menus }` (the Stage-1 signature widened, not
  a second function); the sidebar reads `useMe().access`. Value-tested: a super admin sees every entry; a two-menu
  user exactly those two; zero ⇒ nothing; grants-not-yet-known ⇒ nothing. Mutation 3 fails.
- **The route guard — `MenuGuard`, ONE place, on `AdminLayout`'s `<main>`:** `navItemForPath(pathname)` (the same
  lookup the header's title uses — it searches the hidden entries too, so `/scheduler/dashboard` by URL is guarded)
  → `mayOpen`. Not granted ⇒ the Stage-1 `Alert` shape with ONE sentence (*"You do not have access to this menu."*)
  and **a door to the first menu they do have** (*"Go to Schedule"*) — never a blank, and the page (with its
  fetches) never mounts. A route outside the nav renders as before. Mutation 4 fails.
- **The empty shell** (SPEC-079 §3.3): zero menus and not a super admin ⇒ *"You have no menus yet" / "Ask your admin
  to give you access to the menus you need."* on every path; the header above still shows who they are and offers
  "change my password" (§3). Mutation 5 fails.
- **A `403` on a granted page** (the server's word wins): the interceptor throws the sentence as today for whatever
  the page shows, AND `useMe` re-reads — if the grant is gone the guard replaces the page with its sentence.

### `§2` — the Users page: the menu checklist
- **`UserDTO.menus`**; each row gains **`Menus`**: a super admin's row says *"All menus (super admin)"* and has no
  checklist; every other row is a count button (*"3 menus"*) ⇒ **`MenusModal`**: the twelve as checkboxes, **labelled
  by the nav's own `labelKey`s in the nav's order** (`MENU_ROWS` is derived from `NAV_ITEMS`+`HIDDEN_NAV_ITEMS` — no
  second list of names), the hidden pages (Dashboard, Overview) last; `Select all` / `Select none`; seeded from the row
  on open (render-time, as `EditUserModal`). Save ⇒ **`PUT /users/:id/menus { keys }`**, `keys` filtered to the
  registry in the registry's order (mutation 7 — as ticked — fails); refusal = the server's sentence in the dialog
  (`errMsg`, the fourth `setError` — the Stage-1 count pin moved 3 → 4). `USERS_KEY` invalidates. The nav is flat,
  so "grouped as the nav is" = the nav's order; nothing invented.

### `§3` — the two folded-in items
- **"Change my password"** — the avatar is now the user menu (Mantine `Menu`): *display name · username · Change
  password · Sign out*. The bare sign-out button moved in; its call is byte-identical. `ChangePasswordModal`: current +
  new + confirm ⇒ **`POST /auth/me/password { currentPassword, newPassword }`** (mutation 10 fails). Server sentences:
  wrong current (`401`), `PASSWORD_TOO_SHORT` (`400`). The one client check is the two new boxes matching (asserted,
  trailing comments stripped). 🔴 **A contract quirk handled here, named for you:** the wrong-current-password refusal
  is a **`401`** — the interceptor's sign-out path. The client now exempts exactly `/auth/me/password` (mutation 9 —
  the exemption removed — fails); every other 401 still signs out. A `400`/`409` from the BE for that case would let
  the exemption go — @Jason's call, not a defect.
- **The disabled reason on login:** the interceptor adds **`&reason=disabled` ONLY when the 401 body's message is
  the guard's own sentence** (`DISABLED_SENTENCE = "บัญชีนี้ถูกปิดใช้งาน"`, `middleware/auth.ts:72`); the login page
  reads `?reason=disabled` after mount and shows ONE line (*"This account has been disabled — contact your
  admin."* / *"บัญชีนี้ถูกปิดใช้งาน — กรุณาติดต่อผู้ดูแลระบบ"*). Every other 401 is unchanged (mutation 8 — the reason on
  every 401 — fails). The login form itself is untouched (the Stage-1 pin still holds).
- Copy: **`rbac.*` 4 · `header.*` +6 · `login.disabledReason` · `users.*` +8 (38 → 46)** — both languages, counted.

### 🔑 Break-and-watch — ten mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the registry drops `menu:badges` | **2 fail** |
| 2 | a nav entry carries the wrong key (`reports` → `menu:settings`) | **2 fail** |
| 3 | `mayOpen` ignores the grant | **1 fail** |
| 4 | the guard renders the page anyway | **1 fail** |
| 5 | zero menus is not the shell | **1 fail** |
| 6 | the seed is trusted (no refetch at once) | **1 fail** |
| 7 | the checklist sends the keys as ticked, unfiltered | **1 fail** |
| 8 | `reason=disabled` on EVERY 401 | **1 fail** |
| 9 | the self-service 401 signs the user out | **1 fail** |
| 10 | change-my-password sends `{ password }` | **1 fail** |
`md5` identical on all eight mutated files.

### Definition of Done
- [x] **403 / 0** · `tsc` 0 · build ok
- [x] `MENU_KEYS` equality pin (literal AND nav-derived, in order) · nav filter value-tested (all / two / zero) · route
      guard on a non-granted page · checklist `{ keys }` · change-my-password shape · disabled reason only for that sentence
- [x] Keys counted, both languages
- [x] 🔑 Break-and-watch — ten, `finally`, checksum

### ⚠️ Not seen on a screen
The user menu on the avatar (the `TM` glyph is still the old fixed initials — not this task's, named); the shell; the
checklist at phone width; the landing redirect. For @Tanya via you on `sid` after the Stage-2 deploy: as the super
admin, open a user's `Menus`, tick two (say Schedule + Daily report), save ⇒ log in as them ⇒ the nav shows exactly
those two, `/` lands on Schedule, `/scheduler/people` by URL ⇒ the one sentence + "Go to Schedule", `/scheduler/dashboard`
by URL ⇒ the same; untick all ⇒ their next reload shows the shell, the avatar menu still works and changing their
own password (wrong current ⇒ the sentence in the dialog, NOT a sign-out; short ⇒ `PASSWORD_TOO_SHORT`) ⇒ then sign
in with the new one; disable them ⇒ their next call lands on login with the one orange line; a super admin's row shows
"All menus" with no checklist.

## Question — **a user without `menu:dashboard` lands where?** ⚠️ owner's list
**What the layout does today for `/`:** `app/page.tsx` redirects to **`/scheduler/calendar`** (not the dashboard — the
Dashboard entry has been hidden since REQ-026 and its page is a hidden route); the login page's default after sign-in
is the same path. So the landing question is really *"a user without `menu:calendar`"*. **Built, the simplest:** the
guard treats `LANDING_HREF` (`/scheduler/calendar`) specially — not granted there and they have any menu ⇒
`router.replace` to their **first granted menu in nav order**; no menus ⇒ the shell. Elsewhere (any other page by
URL) it is the sentence + the door, not a redirect — a URL someone typed should say why, not bounce. Nothing else
moved: `/`, the login default, and `?next=` all still say `/scheduler/calendar` and the guard sorts it out.
