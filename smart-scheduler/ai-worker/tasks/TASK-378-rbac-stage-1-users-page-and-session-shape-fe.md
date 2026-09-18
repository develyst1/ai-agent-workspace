# TASK-378 — RBAC Stage 1 (foundation), FE: the Users page (super admin), the session carries the real user, login unchanged (`REQ-092`, `SPEC-079 §2` Stage 1)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-17)
**Source:** `REQ-092 §6` · `SPEC-079` (read §1 and §3). **Contract (proposed to @Jason, TASK-377; confirmation/corrections via me):** `POST /auth/login` ⇒ `{ token, user: { id, username, displayName, isSuperAdmin } }` (claim `role` kept as `"super_admin" | "admin"` for now); users routes, super admin only: `GET /users` · `POST /users { username, password, displayName, isSuperAdmin? }` · `PATCH /users/:id { displayName?, isSuperAdmin? }` · `POST /users/:id/password { password }` · `POST /users/:id/disable` · `POST /users/:id/enable`; refusals `409 USERNAME_TAKEN` · `400 PASSWORD_TOO_SHORT` (min 8) · `409 LAST_SUPER_ADMIN` · `403 FORBIDDEN` (not a super admin).
**Size M.** ⛔ Chain stopped. Ships with TASK-377 (Stage 1 deploy, migration `0036`).

---

## §1 The session
- `auth.ts` (next-auth Credentials): keep the login screen byte-for-byte; the session gains `user.id`, `displayName`, `isSuperAdmin` from the login response (`role` still read as today so nothing else moves). The header shows `displayName` (today the shared name).
- A `401` on any API call (a disabled user's token) ⇒ the existing sign-out path — say what the client does today on `401` and reuse it.

## §2 The Users page — `/scheduler/users`, nav entry `Users` (super admin only)
- **Visible only when `session.user.isSuperAdmin`** — nav entry hidden otherwise AND the page refuses (renders the same "no access" shape the app has for a missing route, if any; say). The server is the guard; this is the honest UI.
- List: username · display name · super admin badge · status (enabled/disabled) · created. Actions: **Create** (username, display name, password + confirm, super-admin checkbox) · **Reset password** (a dialog, new password + confirm, two taps) · **Disable / Enable** (two taps on disable) · **Edit** (display name, super-admin toggle). Refusals show the server's sentence; `LAST_SUPER_ADMIN` in the dialog.
- 🚫 No delete; no self-service password change (Stage 1 is the super admin's page); no permissions UI (Stage 2).
- Keys counted, both languages.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok
- [ ] Session shape asserted; header shows the display name; nav entry gated on `isSuperAdmin`
- [ ] Every action's request shape asserted; two taps on reset and disable; refusals render the sentence
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ Where does a non-super-admin see WHO they are and change their own password later (Stage 2+)? Say where the header could carry it; build nothing.

---

## §3 ✅ IMPLEMENTED — Fern, 2026-09-17. **The session carries the real user; the header shows the display name; a Users page for the super admin — and one BE defect found by reading the widened `role`.**

```
bunx tsc --noEmit → exit 0
bun test          →  394 pass / 0 fail   (was 383; +11 — new lib/users/users-page.test.ts)
bun run build     → ok — `○ /scheduler/users` static beside its siblings
git status        →  9 modified · 6 new (app/(admin)/scheduler/users/page.tsx · partials/Users/{UsersContent,index} ·
                     hooks/scheduler/useUsers.ts · services/users.{service,mock.service}.ts · lib/users/users-page.test.ts)
```
Built against @Jason's CONFIRMED contract (BE done, 2294/0). 🚫 No delete · no self-service password · no
permissions UI · the login screen untouched (asserted: same two fields, no new word).

### `§1` — the session
- **`LoginResponse.user`** is now `{ id, username, displayName, isSuperAdmin, role }`; `Role` widened to
  `"super_admin" | "admin" | "staff"` with the Stage-3 note beside it; **`UserDTO`** added.
- **`auth.ts` `authorize`:** `id` = the ROW's id (it used to be the username — a real change of identity, asserted;
  mutation 1 fails), `name`/`displayName` = the display name, `isSuperAdmin` strict (`=== true`; mutation 2 — truthy
  — fails), `role` still read as today so `DiscountSection` and the BE's guard keep working. The mock user is a
  super admin so the offline app shows the page.
- **`auth.config.ts`** carries `userId` · `displayName` · `isSuperAdmin` token → session (edge-safe, no new deps);
  **`next-auth.d.ts`** augments `Session.user` with `id`, `displayName`, `isSuperAdmin`.
- **The header** shows `session.user.displayName`, falling back to the username for a pre-Stage-1 token, then
  `header.staff` — asserted.
- **A `401` on any call** — a disabled user's next request — takes **the existing path in `lib/api/client.ts`:** the
  axios interceptor calls `signOut({ callbackUrl: "/login?next=…" })` and the login page shows its own sentence.
  Nothing new; the page adds no second handler (asserted). ⚠️ *One honest limit:* the guard's own sentence
  (`"บัญชีนี้ถูกปิดใช้งาน"`, Jason's correction 1) is **not shown** — the sign-out happens before anything renders,
  and the login screen is byte-for-byte unchanged by this task. Surfacing it means a `reason` on the redirect and a
  line on the login page — one small task for Stage 2 if the owner wants a disabled user told why. Named.

### `§2` — the Users page (`/scheduler/users`)
- **Nav:** `NavItem` gained `superAdminOnly?`; a `Users` entry (`nav.users`, `UserCog`) after Settings with it set;
  **`navItemsFor(isSuperAdmin)`** filters, and `Sidebar` reads it off `useSession()` — value-tested: with `true` the
  key is there, with `false` it is gone and the list is exactly one shorter (mutations 3 and 4 fail). The header's
  title lookup still walks `NAV_ITEMS` so the page gets its own title. **The server is the guard**
  (`requireSuperAdmin` ⇒ `403`); this is the honest UI.
- **The page refuses too:** `UsersContent` reads `session.user.isSuperAdmin`; a non-super-admin who lands by URL sees
  **one calm `Alert`** — *"Only a super admin can manage users."* / *"เฉพาะ super admin เท่านั้นที่จัดการผู้ใช้งานได้"*.
  ❓ *The app has NO "no access" page shape of its own* (a missing route falls to Next's `_not-found`), so I did not
  invent one; the sentence is the shape. And the query is `enabled` only for a super admin — the page never even
  asks the server for the list otherwise (asserted; mutation 5 fails).
- **List:** username (mono) · display name (+ `(you)` on the caller's own row, by `session.user.id`) · Access (a
  `Super admin` badge or `Admin`) · Status (`Enabled`/`Disabled`, disabled rows dimmed) · Created (`formatDateDisplay`).
- **Actions and their request shapes, asserted:**
  - **Create** — username (the pattern shown as the hint, `3–40: a-z 0-9 . _ -`), display name, password + confirm,
    super-admin checkbox ⇒ `POST /users { username: trimmed+lowercased, password, displayName: trimmed, isSuperAdmin
    only when true }` (mutation 9 — as typed — fails). The service lowercases so the admin sees what will be stored;
    the PATTERN is the server's (`VALIDATION`, its sentence in the dialog).
  - **Edit** — display name + super-admin toggle ⇒ `PATCH /users/:id` with **only the fields that changed** (the dialog
    diffs against the row; the service spreads by presence; mutation 8 fails). `LAST_SUPER_ADMIN` lands in the
    dialog.
  - **Reset password** — a dialog: new password + confirm ⇒ `POST /users/:id/password { password }`. **Two taps:** the
    row's button opens the dialog; the dialog's own orange submit is the second, and it is disabled until the two
    boxes match. `PASSWORD_TOO_SHORT` in the dialog.
  - **Disable / Enable** — `POST /users/:id/disable` | `/enable`. **Two taps on DISABLE** (button → the app's
    `useConfirm`, red, naming the user; mutation 6 — one tap — fails); **enable is one tap** — it only gives access
    back. Refusals (`LAST_SUPER_ADMIN`) as a red notice.
- 🔴 **No client-side rule beyond "the two password boxes match"** — no username regex, no length check, no
  last-super-admin counting: asserted by absence with trailing comments stripped (📌 *the string trap, again — my own
  comment `// LAST_SUPER_ADMIN lands here` tripped the first cut of the negative; the negative now strips `// …` before
  matching*); mutation 7 (a client length rule) fails.
- Copy: **`users.*` 38 keys × 2 + `nav.users`** — both languages, asserted key-for-key.

### 🔻 Found by reading the widened `role` — **a super admin cannot give a DISCOUNT today, on both sides**
`Role` now issues `"super_admin"` for a super admin (`routes/auth.ts:18`, `middleware/auth.ts:42`). **Two readers
check `role !== "admin"`:** the FE's `DiscountSection` (hides the section) and **the BE's `assertMayDiscount`
(`discount-plan.ts:147`, refuses with `403 "เฉพาะแอดมินเท่านั้นที่ให้ส่วนลดได้"`)**. Jason's Decision 3 says *"every
table user is at least admin, so that guard behaves exactly as today"* — **it does not for the super admin: the
bootstrapped first user (the ONLY user on day one) gets `super_admin`, and `super_admin !== "admin"` ⇒ every
discounted sale by the owner's own account is refused.** ✅ **On my side I widened the FE gate** (`role === "admin" ||
role === "super_admin"`, mutation 10 fails) — it is the FE half of the intent, not a bypass: the server still
decides. ⚠️ **The BE half is @Jason's, one line (`!== "admin"` → not in `["admin","super_admin"]`) — or Stage 3's
`action:sales.discount` key early.** Reported here; not touched.

### 🔑 Break-and-watch — ten mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | session `id` = the username again | **1 fail** |
| 2 | `isSuperAdmin` truthy, not strict | **1 fail** |
| 3 | `navItemsFor` returns everything | **1 fail** |
| 4 | the sidebar passes `true` regardless of the session | **1 fail** |
| 5 | the page fetches the list for everyone | **1 fail** |
| 6 | disable on ONE tap | **1 fail** |
| 7 | a client-side password length rule | **1 fail** |
| 8 | the edit PATCH sends every field | **1 fail** |
| 9 | the username sent as typed (not lowercased) | **1 fail** |
| 10 | the discount gate hides for `super_admin` again | **1 fail** |
`md5` identical on all seven mutated files.

### Definition of Done
- [x] **394 / 0** · `tsc` 0 · build ok (`○ /scheduler/users`)
- [x] Session shape asserted end to end; header shows the display name; nav entry gated on `isSuperAdmin` (value-tested)
- [x] Every action's request shape asserted; two taps on reset and disable; refusals render the sentence
- [x] 🔑 Break-and-watch — ten, `finally`, checksum

### ⚠️ Not seen on a screen
The table at phone width (six columns; the actions wrap last); the `(you)` marker; the confirm dialog's red button.
For @Tanya via you on `sid` after the Stage-1 deploy (`0036` first): log in as the bootstrap super admin ⇒ the
header shows the display name, `Users` in the nav; add a user (bad username ⇒ the pattern sentence; short password ⇒
`PASSWORD_TOO_SHORT`; duplicate ⇒ `USERNAME_TAKEN`); log in as that user ⇒ no `Users` entry, `/scheduler/users` by URL
⇒ the one sentence; back as super admin: disable them ⇒ two taps ⇒ their next request bounces to login; try to remove
the last super admin's flag ⇒ `LAST_SUPER_ADMIN` in the dialog. 🔴 **And the discount:** as the super admin, give a
discount on a sale ⇒ today the server refuses (`403`) — that is the BE finding above, not the page.

## Question — **where does a non-super-admin see WHO they are and change their own password later?** ⚠️ owner's list
**Who they are — already answered by this task:** the header now shows the display name for every user (it showed
the shared login before), and the `TM` avatar circle beside it is a fixed glyph today with no menu. **Where a
self-service password change belongs:** that avatar — a small menu (*display name · username · Change password ·
Sign out*), the same `Menu` the app uses elsewhere, moving the existing sign-out button into it. It needs one BE
route the contract does not have (`POST /me/password { currentPassword, newPassword }` — a self-service reset must
prove the old one, unlike the super admin's) and one dialog reusing this page's password+confirm pair. Stage 2+,
one small task on each side. Not built.
