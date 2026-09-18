# TASK-388 — RBAC Stage 4 (roles + matrix), FE: the Roles page (builder), role assignment on the Users page, inherited vs own in the checklists, the matrix view (`REQ-092`, `SPEC-079 §2` Stage 4)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-18)
**Contract (proposed to @Jason, TASK-387; confirmation via me):** `GET/POST/PATCH/DELETE /roles` (`RoleDTO { id, name, description, keys, userCount }`; `409 ROLE_IN_USE` with a count; `409 ROLE_NAME_TAKEN`) · `PUT /users/:id/role { roleId | null }` · `UserDTO` gains `roleId`, `roleName`, `grants: { fromRole, own }`; `menus`/`actions` are EFFECTIVE · `/me` gains `roleName`. A role is LIVE (edit it ⇒ every holder changes); a user's own rows are additive overrides.
**Size M.** ⛔ Chain stopped. Ships with TASK-387 (`sid`), then the single `uat` cutover.

---

## §1 The Roles page — `/scheduler/roles`, super admin only (beside `Users`)
- List: name · description · keys count (menus n · actions n) · users holding it. **Create / Edit** ⇒ one dialog: name, description, then the SAME two checklists the Users page uses (`MenusModal`'s rows and `ActionsModal`'s groups — extract the checklist bodies into shared components; no third list of labels). **Delete** two taps; `ROLE_IN_USE` shows the count sentence in the dialog.
- 🚫 No role "templates"; no default role; no client-side key rules.

## §2 The Users page — assignment and the two-tone checklists
- A **`Role`** column: a `Select` of roles (+ *none*) ⇒ `PUT /users/:id/role`; the row's `Menus` / `Actions` counts become EFFECTIVE counts.
- In `MenusModal` / `ActionsModal` for a user with a role: **keys from the role are ticked and LOCKED with a "from role X" hint; the user's own rows are the editable ticks** — the save still writes only the own rows (`PUT …/menus` / `…/actions`, as before). A super admin row: all, unchanged.
- The header shows `roleName` under the display name when present.

## §3 The matrix — a read-only view on the Roles page (a tab)
- Rows = users (username · role), columns = the 12 menus then the 46 actions grouped by area (sticky first column, horizontal scroll — the plan-table pattern); a cell = ● effective (▲ from role / ● own — two glyphs), blank otherwise. From `GET /users`; no new route. Filter by role. 🚫 No editing in the matrix (the dialogs are the editors).

## Definition of Done
- [ ] Suite, **count** · tsc · build ok
- [ ] Roles CRUD request shapes; delete two taps; `ROLE_IN_USE` rendered · assign shape (`null` on *none*) · locked-vs-own ticks value-tested; save writes only own · matrix renders from `grants` (rendered assertion) · nav entry gated super-admin
- [ ] Keys counted, both languages
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ Name the first three roles the customer will probably want (front desk · coach lead · accountant?) as EXAMPLES in the report — not seeded, not built; the owner creates them at runtime.

---

## §4 ✅ IMPLEMENTED — Fern, 2026-09-18. **The Roles page (builder on the SHARED checklists + the matrix tab), a `Role` Select per user, two-tone checklists (role keys locked, own rows editable, save writes own only), the role's name in the header.**

```
bunx tsc --noEmit → exit 0
bun test          →  420 pass / 0 fail   (was 411; +9 — new lib/rbac/roles.test.ts)
bun run build     → ok — `○ /scheduler/roles` static beside `/scheduler/users`
git status        →  13 modified · 11 new (app/(admin)/scheduler/roles/page.tsx · partials/Roles/{RolesContent,MatrixTable,index} ·
                     partials/Users/GrantChecklists.tsx · hooks/scheduler/useRoles.ts · services/roles.{service,mock.service}.ts ·
                     lib/rbac/{matrix.ts,roles.test.ts})
```
Built against @Jason's CONFIRMED contract (TASK-387, 2375/0). 🚫 No templates, no default role, no client-side key rule
(asserted: no `template` / `DEFAULT_ROLE` / a 60-char check on the page). Option C's FE is complete.

### `§1` — the Roles page (`/scheduler/roles`, super admin only)
- **Nav:** `roles` beside `users`, `superAdminOnly` (value-tested; the Stage-1 "exactly one flag-gated entry" pin
  became "exactly two"). The page refuses a non-super-admin with the Users page's sentence and never fetches for them.
- **List:** name · description · *menus n · actions n* · a `n users` badge (blue when held). **Create / Edit — ONE
  dialog:** name, description, then **the SAME two checklists the Users page uses**: 🔴 the checklist bodies were
  EXTRACTED into `partials/Users/GrantChecklists.tsx` (`MenusChecklist` — the twelve in the nav's order by the nav's
  `labelKey`s; `ActionsChecklist` — from `GET /permissions`, grouped by the registry's `area` under the menu's nav
  label, the BE's label in `lang`, select-all per group and overall). The Users page's two dialogs and the Roles
  builder all mount these — **no third list of labels** (asserted on the page and the shared file; mutation 7 fails).
  Create ⇒ `POST /roles { name (trimmed), description (only when present), keys }`; edit ⇒ `PATCH /roles/:id` with
  **only the fields that changed** — `keys` (REPLACE) ride only when the set differs (mutation 8 fails; 14 — the
  service sending `keys` when absent — fails). Keys go in **registry order, menus then actions** (the BE's shape).
- **Delete — two taps:** the row's red button opens `DeleteRoleDialog`; its own red confirm is the second (mutation 9
  — one tap — fails). **`ROLE_IN_USE` lands in the dialog** with the server's count sentence (`errMsg`); no FE
  wording composes a count (asserted). `ROLE_NAME_TAKEN` / `VALIDATION` land in the builder the same way.
- A role is LIVE: every write invalidates BOTH `roles` and `users` (effective sets and counts move together).

### `§2` — the Users page
- **A `Role` column** — a `Select` of the roles + *No role* ⇒ **`PUT /users/:id/role { roleId | null }`** (`null` on
  *none*; mutation 5 — an empty string — and 6 — the wrong body key — fail). A super admin's row shows `—` (they have
  everything; nothing to assign). The row's `Menus` / `Actions` counts are the EFFECTIVE ones (the server's, on re-read).
- **Two-tone checklists:** `MenusModal` / `ActionsModal` seed the editable ticks from **`grants.own`** and lock
  **`grants.fromRole`** with *"from role X"* beside the label (disabled checkbox). **The save still writes ONLY the own
  rows** (`PUT …/menus` / `…/actions`, byte-identical lines). **Value-tested** on the pure helpers: `isTicked` (a locked
  key is ticked; mutation 1 fails), `withKeys` (un-ticking a locked key is a no-op on `own`; select-all covers only the
  FREE keys — mutation 2, select-all pulling the role's keys into own, fails), and what the save would send for that
  state never contains the role's key. Mutation 3 (seeding the effective set — the way to accidentally copy a role's
  keys into own rows) and 4 (forgetting the lock) fail.
- **The header** shows `roleName` under the display name (and in the avatar menu) from `/me`; null ⇒ nothing.

### `§3` — the matrix (a tab on the Roles page, read-only)
- **`MatrixTable`** — rows = users (username · role, or *Super admin*), columns = the 12 menus then the actions grouped
  by area (the registry's order; group headers = the nav labels, `Sales`), sticky first column + horizontal scroll
  (`StickyScrollArea`, the plan-table pattern). A cell = **● own · ▲ from role · a grey ● for a super admin's
  everything**; blank otherwise. **`matrixCell` is pure and value-tested** — own beats role when a key is in both (the
  own row is the one that can be un-ticked; mutation 10 fails), a super admin is everything (mutation 11 fails).
- **Rendered assertion** (`renderToString` inside `MantineProvider` + `I18nProvider`): two users × 15 columns from a
  three-action registry — the role user's row has exactly 2 `▲`, 1 `●`, 12 blanks; the super admin's row 15 grey `●`
  and no blank; `data-pin="lead"` present; **no `<input>` / `<button>` in the table** (mutation 12 — a checkbox per
  cell — fails). Fed by `GET /users` + `GET /permissions`; **no new route** (asserted: the roles service knows no
  `matrix`). Filter by role (+ *No role* + all).
- Copy: `roles.*` 26 · `nav.roles` · `users.*` +4 (58) — both languages, counted.

### 🔑 Break-and-watch — fourteen mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | a locked key can be un-ticked | **1 fail** |
| 2 | select-all pulls the role's keys into own | **1 fail** |
| 3 | the menus dialog seeds the EFFECTIVE set | **1 fail** |
| 4 | the actions dialog forgets the lock | **1 fail** |
| 5 | *none* sends `""` instead of `null` | **1 fail** |
| 6 | the assign body key is wrong | **1 fail** |
| 7 | the builder grows a third list of labels | **2 fail** |
| 8 | edit sends `keys` always | **1 fail** |
| 9 | delete on one tap | **1 fail** |
| 10 | role beats own in the matrix cell | **1 fail** |
| 11 | the matrix loses the super admin's everything | **2 fail** |
| 12 | the matrix becomes editable | **1 fail** |
| 13 | the nav entry loses its gate | **4 fail** |
| 14 | `PATCH /roles` sends `keys` when absent | **1 fail** |
`md5` identical on all eight mutated files. Two Stage-2/3 pins moved with the extraction (the checklist-body pins now
read `GrantChecklists.tsx` and the dialogs' mount lines) and three key-count pins (54 → 58); each named in its file.

### Definition of Done
- [x] **420 / 0** · `tsc` 0 · build ok (`○ /scheduler/roles`)
- [x] CRUD shapes · delete two taps · `ROLE_IN_USE` rendered · assign `null` on *none* · locked-vs-own value-tested, save writes own only · matrix rendered from `grants` · nav entry gated
- [x] Keys counted, both languages
- [x] 🔑 Break-and-watch — fourteen, `finally`, checksum

### ⚠️ Not seen on a screen
The builder at phone width (two long checklists in one dialog — it scrolls; a Stepper would be a later polish); the
matrix's truncated column headers (tooltips carry the full label); the grey `●`. For @Tanya on `sid`: create a role
with two menus + three actions ⇒ assign it to a user on the Users page ⇒ their `Menus` count reads the effective
number; open their `Menus` ⇒ the role's two are ticked and greyed with *"from role …"*, tick a third and save ⇒ the
server's `grants.own` holds ONE key, `menus` three; edit the role, add a menu ⇒ the user's nav gains it on their next
focus without any save on their row; try to delete the role ⇒ the count sentence in the dialog; clear their role ⇒
their own key stays; the Matrix tab shows ▲ for the role's keys and ● for the own one, the filter narrows to the role.

## Question — **the first three roles, as EXAMPLES** ⚠️ owner's list (not seeded, not built)
1. **Front desk** — menus *Schedule · People · Bookings / Students · LINE links*; actions *Book a session · Set a
   session's status · Edit a booking · Set a session's badges · Edit a session's note · Record/pay/remove a session
   rental · Sell a rental · Add a parent · Add a student · Edit a parent/student · Link a student to a parent ·
   Approve & reject a LINE link request*. Not: the discount, cancel/drop a course, teachers' budgets.
2. **Coach lead** — menus *Schedule · Teachers · Daily report · Needs attention*; actions *Set a session's status ·
   Pause & resume a booking · Override the leave-notice rule · Set teacher availability · Set a teacher's work days ·
   Override a teacher's limit · Order teacher types · Edit a teacher · Archive & reactivate a teacher*. Not: any sale.
3. **Accountant** — menus *Bookings / Students · SOM dashboard · Daily report · Settings*; actions *Create a course ·
   Create a voucher · Import courses / vouchers · Change a course's expiry · Give a discount · Edit settings*. Not:
   the grid's booking acts, people edits.
The owner creates them at runtime from the checklists; the names are only a shape to start from.
