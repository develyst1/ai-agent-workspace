# TASK-385 — RBAC Stage 3 (action-level), BE: the `action:*` registry, an action column on the route table, the guard checks the action on every mutate route, `PUT /users/:id/actions`, the discount check retired by key (`REQ-092`, `SPEC-079 §2` Stage 3) — contract first

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-18)
**Source:** `REQ-092 §6` · `SPEC-079` §1 (action keys are code constants; grants are `user_permissions` rows; a super admin has all) · Porter's decision 4 (SPEC-079 §3.4): "see the menu, change nothing" IS a valid combination.
**Size M.** ⛔ Chain stopped. **Contract to @Fern through me first** (TASK-386 in parallel). No migration (37 = 37). `sid` only; `uat` held.

---

## §1 The prior facts (verify)
- Stage 2: `lib/permissions.ts` (`MENU_KEYS`, `hasMenu`), `lib/route-menus.ts` (`ROUTE_MENUS`: 85 routes → menu sets), ONE `menuGuard` after the auth guard, fails closed, enumeration pin. Grants on the context as a `Set`.
- ~59 mutate routes (POST/PATCH/PUT/DELETE) across ~10 areas; `assertMayDiscount` (`discount-plan.ts`) still reads `role`/`isSuperAdmin` — the one inline capability check, named for this stage.

## §2 The contract (proposed; confirm/correct first)
**The keys — `ACTION_KEYS` in `lib/permissions.ts`:** `action:<area>.<verb>`, **one key per mutate route, grouped by the menu that owns it** — the area names are the menu keys' tails so the FE can group without a second table (e.g. `action:calendar.book`, `action:calendar.cancel`, `action:calendar.attend`, `action:calendar.rental`, `action:bookings.course-create`, `action:bookings.course-drop`, `action:bookings.import`, `action:teachers.edit`, `action:people.student-delete`, `action:settings.edit`, `action:sales.discount` …). **You name them from the route table; report the full list** (~59; fewer if several routes are honestly ONE act — e.g. `pause` + `resume` = one key `action:calendar.pause`? — say your rule and keep it one rule). Each key carries a human label pair (TH/EN) in the registry — the FE renders the checklist from the BE's list (`GET /permissions` ⇒ `{ menus, actions: [{ key, area, labelTh, labelEn }] }`), so no second list of names exists.
**The route table:** `ROUTE_MENUS` becomes `ROUTE_ACCESS: Record<route, { menus: MenuKey[]; action?: ActionKey }>` — every mutate route carries an `action`; reads carry none. The enumeration pin extends: every POST/PATCH/PUT/DELETE (except `/auth`, `/users`, `/me`) has an action; no unknown action; every `ACTION_KEYS` entry is used by ≥ 1 route.
**The guard:** `menuGuard` becomes `accessGuard`: the menu check as today, THEN if the route has an `action`, `hasAction(user, action)` (super admin ⇒ true) else **`403 FORBIDDEN "ไม่มีสิทธิ์ทำรายการนี้"`** (its own sentence — the FE tells a menu refusal from an action refusal). Fails closed on an unmapped route as today.
**`assertMayDiscount` retired by key:** `action:sales.discount` — the guard cannot see the BODY (a discount is a field on a create), so this one stays a service check but reads `hasAction(user, "action:sales.discount")` instead of role; the `role` reader is gone (Stage 1's `Role` type may now shrink — say).
**Routes:** `PUT /users/:id/actions { keys }` (super admin) replaces the user's `action:*` grants (unknown ⇒ 400); `UserDTO` gains `actions: string[]`; `GET /me` gains `actions` (a super admin: all). `GET /permissions` (any signed-in user) ⇒ the registry.
🚫 Not this stage: roles; hiding buttons (FE); any new mutate route.

## Definition of Done
- [ ] Contract + the full key list (with labels) in `inbox/SA.md` FIRST
- [ ] Suite, **count** · tsc · 37 = 37
- [ ] Pinned: enumeration (every mutate route has an action; no stale keys) · a user with `menu:calendar` but no actions reads the calendar and gets `403` + the action sentence on `POST /bookings` · with `action:calendar.book` ⇒ through · super admin ⇒ all · discount refused without `action:sales.discount`, allowed with · `/permissions` shape · `PUT …/actions` replaces
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ The internal job routes and the check-in/LIFF routes are outside this table by design — say so in the report so the owner knows what "every action" covers; build nothing.

---

# 📋 CONTRACT — @Jason → @Sober (2026-09-18) — confirm/correct before I build

## The ONE naming rule
**One key per ACT the owner would tick on a checklist; a route's key = its act.** Three consequences, applied without exception:
1. **A preview shares its act's key** — `/courses/preview`, `/plan/preview`, `/expiry/preview`, `/cancel/preview`, `/import/preview` gate on the act they preview (a preview that a user may see but not do is a lie on the screen).
2. **An act and its undo share one key** — pause/resume, drop/resume, suspend/unsuspend, archive/reactivate, approve/reject (one decision), record/pay/remove a rental, set/top-up a budget.
3. **Create and edit are different acts** (different forms, different trust) — student, parent, teacher, course, badge type, badge value each get a `-create` and an `-edit` where both routes exist.
**Area = the tail of the menu whose page OWNS the entity** (`action:<area>.<verb>`), carried as an explicit `area` field in the registry so the FE groups by the field, never by parsing. ONE cross-cutting area that is not a menu: **`sales`**, for the body-level discount check that spans four routes across two menus (your name, kept).

## The keys — 45 (58 mutate routes → 44 route keys + 1 body key)
| # | key | area | routes it gates | TH | EN |
|---|---|---|---|---|---|
| 1 | `action:calendar.book` | calendar | `POST /bookings` | จองคาบเรียน | Book a session |
| 2 | `action:calendar.booking-edit` | calendar | `PATCH /bookings/:id` | แก้ไขการจอง | Edit a booking |
| 3 | `action:calendar.status` | calendar | `PATCH /bookings/:id/status` (confirm · attend · sick-leave · cancel) | บันทึกสถานะคาบ (ยืนยัน/มาเรียน/ลาป่วย/ยกเลิก) | Set a session's status |
| 4 | `action:calendar.pause` | calendar | `POST /bookings/:id/pause` · `POST /bookings/:id/resume` | พัก/กลับมาเรียน | Pause & resume a booking |
| 5 | `action:calendar.badges` | calendar | `PATCH /bookings/:id/badges` | ติดป้ายคาบเรียน | Set a session's badges |
| 6 | `action:calendar.note` | calendar | `PATCH /bookings/:id/note` | บันทึกโน้ตคาบเรียน | Edit a session's note |
| 7 | `action:calendar.rental` | calendar | `POST /bookings/:id/rental` · `POST …/rental/paid` · `DELETE …/rental` | บันทึก/รับเงิน/ลบค่าเช่าอุปกรณ์ในคาบ | Record, pay, remove a session rental |
| 8 | `action:calendar.rental-sale` | calendar | `POST /rentals` | ขายเช่าอุปกรณ์ | Sell a rental |
| 9 | `action:bookings.bulk-confirm` | bookings | `POST /bookings/bulk-confirm` | ยืนยันคาบทั้งชุด | Bulk-confirm sessions |
| 10 | `action:bookings.course-create` | bookings | `POST /courses` · `POST /courses/preview` | เปิดคอร์ส | Create a course |
| 11 | `action:bookings.course-edit` | bookings | `PATCH /courses/:id` | แก้ไขคอร์ส | Edit a course |
| 12 | `action:bookings.course-plan` | bookings | `POST /courses/:id/plan` · `POST …/plan/preview` | วางแผนคาบของคอร์ส | Plan a course's sessions |
| 13 | `action:bookings.course-expiry` | bookings | `PATCH /courses/:id/expiry` · `POST …/expiry/preview` | เลื่อนวันหมดอายุคอร์ส | Change a course's expiry |
| 14 | `action:bookings.course-extra-session` | bookings | `POST /courses/:id/extra-session` | เพิ่มคาบพิเศษ | Add an extra session |
| 15 | `action:bookings.course-confirm` | bookings | `POST /courses/:id/confirm` | ยืนยันคอร์ส | Confirm a course |
| 16 | `action:bookings.course-drop` | bookings | `POST /courses/:id/drop` · `POST /courses/:id/resume` | พัก/กลับมาเรียนคอร์ส | Drop & resume a course |
| 17 | `action:bookings.course-cancel` | bookings | `POST /courses/:id/cancel` · `POST …/cancel/preview` | ยกเลิกคอร์ส | Cancel a course |
| 18 | `action:bookings.course-import` | bookings | `POST /courses/import` · `POST …/import/preview` | นำเข้าคอร์ส | Import courses |
| 19 | `action:bookings.voucher-create` | bookings | `POST /vouchers` | ออกบัตรกำนัล | Create a voucher |
| 20 | `action:bookings.voucher-import` | bookings | `POST /vouchers/import` | นำเข้าบัตรกำนัล | Import vouchers |
| 21 | `action:people.student-create` | people | `POST /students` (route menus: calendar + bookings — the booking form creates inline; the ACT is a people act) | เพิ่มนักเรียน | Add a student |
| 22 | `action:people.student-edit` | people | `PATCH /students/:id` | แก้ไขนักเรียน | Edit a student |
| 23 | `action:people.student-delete` | people | `DELETE /students/:id` | ลบนักเรียน | Delete a student |
| 24 | `action:people.parent-create` | people | `POST /parents` | เพิ่มผู้ปกครอง | Add a parent |
| 25 | `action:people.parent-edit` | people | `PATCH /parents/:id` | แก้ไขผู้ปกครอง | Edit a parent |
| 26 | `action:people.parent-students` | people | `POST /parents/:id/students` | ผูกนักเรียนกับผู้ปกครอง | Link a student to a parent |
| 27 | `action:people.parent-suspend` | people | `POST /parents/:id/suspend` · `POST …/unsuspend` | ระงับ/ยกเลิกระงับผู้ปกครอง | Suspend & unsuspend a parent |
| 28 | `action:people.parent-line-unlink` | people | `POST /parents/:id/clear-line-link` | ยกเลิกการเชื่อม LINE ผู้ปกครอง | Clear a parent's LINE link |
| 29 | `action:teachers.create` | teachers | `POST /teachers` | เพิ่มครู | Add a teacher |
| 30 | `action:teachers.edit` | teachers | `PATCH /teachers/:id` | แก้ไขข้อมูลครู | Edit a teacher |
| 31 | `action:teachers.archive` | teachers | `POST /teachers/:id/archive` · `POST …/reactivate` | เก็บ/คืนสถานะครู | Archive & reactivate a teacher |
| 32 | `action:teachers.budget` | teachers | `PUT /teachers/:id/budget` · `POST …/budget/topup` | ตั้ง/เติมงบครู | Set & top up a teacher's budget |
| 33 | `action:teachers.limit-override` | teachers | `PATCH /teachers/:id/limit-override` | ปรับเพดานชั่วโมงครู | Override a teacher's limit |
| 34 | `action:teachers.work-days` | teachers | `PATCH /teachers/:id/work-days` | ตั้งวันทำงานครู | Set a teacher's work days |
| 35 | `action:teachers.availability` | teachers | `PATCH /teachers/availability` | ตั้งเวลาว่างครู | Set teacher availability |
| 36 | `action:teachers.type-order` | teachers | `PATCH /teachers/type-order` | จัดลำดับประเภทครู | Order teacher types |
| 37 | `action:teachers.calendar-link` | teachers | `POST /teachers/:id/calendar-link` ✱ no FE caller | สร้างลิงก์ปฏิทินครู | Issue a teacher's calendar link |
| 38 | `action:link-requests.decide` | link-requests | `POST /teacher-link-requests/:id/approve` · `POST …/reject` | อนุมัติ/ปฏิเสธคำขอเชื่อม LINE | Approve & reject a LINE link request |
| 39 | `action:link-requests.unlink` | link-requests | `DELETE /teachers/:id/line-link` | ยกเลิกการเชื่อม LINE ครู | Unlink a teacher's LINE |
| 40 | `action:badges.type-create` | badges | `POST /badges/types` | เพิ่มประเภทป้าย | Add a badge type |
| 41 | `action:badges.type-edit` | badges | `PATCH /badges/types/:id` | แก้ไขประเภทป้าย | Edit a badge type |
| 42 | `action:badges.value-create` | badges | `POST /badges/values` | เพิ่มค่าป้าย | Add a badge value |
| 43 | `action:badges.value-edit` | badges | `PATCH /badges/values/:id` | แก้ไขค่าป้าย | Edit a badge value |
| 44 | `action:settings.edit` | settings | `PUT /settings/:key` · `DELETE /settings/:key` (delete = reset to default) | แก้ไขการตั้งค่า | Edit settings |
| 45 | `action:sales.discount` | sales | ⚠ BODY-level, no route of its own: the `discount` field on `POST /courses` · `POST /vouchers` · `POST /bookings` · `POST /rentals` (the service check, as §2) | ให้ส่วนลด | Give a discount |

## The shapes
- `lib/permissions.ts`: `ACTION_KEYS` (the 45, in the table's order), `ActionKey`, `isActionKey`, **`hasAction(user, action)`** (super admin ⇒ true, else the grant), `actionsOf(user)`, and **`PERMISSION_REGISTRY: { menus: MenuKey[], actions: { key, area, labelTh, labelEn }[] }`** — the labels live beside the keys, the FE has no second list.
- `lib/route-menus.ts` → **`ROUTE_ACCESS: Record<route, { menus: readonly MenuKey[]; action?: ActionKey }>`** (file renamed `route-access.ts`; `ROUTE_MENUS` gone). Reads carry no `action`; every POST/PATCH/PUT/DELETE carries one.
- `middleware/auth.ts`: `menuGuard` → **`accessGuard`** — menu check as today (its sentence), THEN `action` ⇒ `hasAction` else **`403 FORBIDDEN "ไม่มีสิทธิ์ทำรายการนี้"`**; unmapped ⇒ 403 + `[rbac]` log as today. `requireAction(...)` as a primitive beside `requireMenu`.
- `assertMayDiscount(discount, user)`: `if (!discount) return; if (!hasAction(user, "action:sales.discount")) throw 403 FORBIDDEN "ไม่มีสิทธิ์ให้ส่วนลด"` — the `role` reader gone; the sentence changes from "เฉพาะแอดมินเท่านั้นที่ให้ส่วนลดได้" (no longer true — it is a grant now). ❓ confirm the sentence.
- **`Role`:** the `role` claim stays in the token and on `AuthUser` (the FE reads it for display; TASK-377's pins); after this stage NOTHING reads it for authorization. I will not shrink the type this stage (cosmetic, touches jwt/login/pins) — say if you want it.
- Routes: **`PUT /users/:id/actions { keys: string[] }`** ⇒ `{ user }` (super admin; unknown ⇒ 400 before the tx; replaces `action:%` rows in one tx — the mirror of `setUserMenus`). **`UserDTO.actions: ActionKey[]`** (super admin: all 45) on every DTO incl. the login body. **`GET /me`** ⇒ `{ user: { …, menus, actions } }`. **`GET /permissions`** (any signed-in user; excluded from the menu table like `/me`) ⇒ `{ menus: MenuKey[], actions: [{ key, area, labelTh, labelEn }] }` — `menus` as keys only (the nav already owns the menu names; TASK-382's checklist has them). ❓ say if the menus want labels too.
- 🚫 No migration: `user_permissions` rows already take any key; `userGrantKeys` already reads all of a user's keys, so the guard's one read carries the actions for free.

## ⚠ Two body-level acts I am NOT splitting unless you say so
- `PATCH /bookings/:id/status` carries four acts in its body (`confirm · attend · sick-leave · cancel`). By the rule it is ONE key (`action:calendar.status`). Splitting "cancel a session" out would need a second body-reading check like the discount's. ❓
- Its `override: true` (the admin override of the advance-notice leave rule, UC-029) is a capability hiding in a body flag — today anyone who can PATCH status can override. ❓ `action:calendar.leave-override` as a 46th body-level key, or leave it for Stage 4.

## ⚠ For the OWNER'S list (via you): what "every action" covers
The table gates the ADMIN API (`/api/*` behind the JWT). Outside it by design: the LINE webhook (`/api/webhooks/line`, `/webhooks`), the public check-in and LIFF register routes (`publicCheckin`, `publicRegister` — the LIFF token is the credential), the public `.ics` calendar (the token is the credential), and the internal jobs (`/internal/*`, the reminder run). Those are not a user's acts; nothing there changes.

⛔ Waiting on your confirm before code.

---

# 📤 REPORT — @Jason → @Sober (2026-09-18)

✅ **DONE (code), against the confirmed contract (45 keys + the 46th `action:calendar.leave-override`; the four answers applied).** **2350 pass / 0 fail**, **187 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (37 = 37)**.

## What was built
- **`lib/permissions.ts`** — `ACTION_REGISTRY` (46 entries `{ key, area, labelTh, labelEn }`, the contract's table in code, in its order), `ACTION_KEYS`, `ActionKey`, `ACTION_AREAS` (7 menu tails + `sales`), `isActionKey`, **`hasAction(user, action)`** (super admin ⇒ true, else THE grant), `actionsOf(user)`, **`PERMISSION_REGISTRY = { menus: MENU_KEYS, actions: ACTION_REGISTRY }`**, `ACTION_FORBIDDEN_TH`, and **`assertMayOverrideLeave(override, user)`** (the 46th key's check — 403 `"ไม่มีสิทธิ์ยกเว้นกฎแจ้งลาล่วงหน้า"`).
- **`lib/route-access.ts`** (renamed from `route-menus.ts`, which is deleted) — **`ROUTE_ACCESS: Record<route, { menus, action? }>`**: the 85 routes, the Stage 2 menu sets unchanged, **58 mutate routes each with its action, 27 reads with none.** `read(menus)` / `act(menus, action)` helpers keep the rows one line each.
- **`middleware/auth.ts`** — `menuGuard` → **`accessGuard`**: the menu check (its sentence) THEN, if the route has an action, `hasAction` else **`403 FORBIDDEN "ไม่มีสิทธิ์ทำรายการนี้"`**; unmapped ⇒ 403 + `[rbac] route not in ROUTE_ACCESS` as before; exclusions `(auth|users|me|permissions)`. `requireAction(key)` beside `requireMenu`.
- **`lib/discount-plan.ts`** — `assertMayDiscount` reads **`hasAction(user, "action:sales.discount")`**; the `role` reader is gone (nothing reads `role` for authorization any more; the claim and the type stay, per your answer 2); sentence **`"ไม่มีสิทธิ์ให้ส่วนลด"`** (answer 1). Its parameter type is now the `AuthUser` shape (`{ isSuperAdmin, grants }`).
- **`routes/api.ts`** — `PATCH /bookings/:id/status` calls `assertMayOverrideLeave(override, c.get("user"))` BEFORE the service (answer 4: the flag is read in `svc.updateBookingStatus` → `reconcileBookingHolds` / the advance-notice branch at `scheduler.service.ts` ~3103; the check sits at the route beside the status change, the same shape as the discount's).
- **`user.service.ts`** — `UserDTO.actions: ActionKey[]` (super admin: all 46; on every DTO incl. the login body); **`setUserActions`** and `setUserMenus` now both call ONE private `replaceGrants(id, keys, prefix, isKey, word, actor)` — unknown key ⇒ 400 before the tx; one tx deletes `<prefix>%` rows and inserts the deduplicated set; **the other prefix's rows are untouched** (menus and actions are independent — decision 4).
- **Routes** — `PUT /users/:id/actions { keys }` (super admin) · `GET /api/me` ⇒ `{ user: { …, menus, actions } }` · **`GET /api/permissions`** (new `routes/permissions.ts`, mounted after the guard, any signed-in user) ⇒ `{ menus: MenuKey[], actions: [{ key, area, labelTh, labelEn }] }`. `validation.ts`: `setUserActions` (shape only).
- 🔻 **Pins moved, with reasons:** Stage 2's test now imports `ROUTE_ACCESS`/`accessGuard` (its 24 tests unchanged in substance: the enumeration reads `.menus`, the exclusion names four, the `/me` bodies carry `actions`); Stage 1's discount-reader pin now asserts the KEY line and `not.toContain("user.role")`; `discount-plan.test.ts`'s `assertMayDiscount` block rewritten by key (a `role: "admin"` label with no grant is REFUSED — pinned); the DTO-keys pin (+ `actions`) and the auth test's login body (+ all 46).

## Pinned (`lib/rbac-stage3-actions-req092.test.ts`, 23 tests)
- **The registry with values:** 46 keys, unique, `action:<area>.<verb>` with `area` = the parsed area, TH + EN non-empty; areas = menu tails + `sales`, every area used; the two body-level entries by value; `hasAction` (super admin / holder / menu-grant-is-not-an-action / nobody); `actionsOf` in registry order; `PERMISSION_REGISTRY` is the two lists by identity.
- **🔴 The enumeration:** every non-GET route in `routes/api.ts` (58, the floor) has a KNOWN action; no GET has one; **every key is used by ≥ 1 route except exactly the two body-level keys, which are used by NONE**; the rule by value (five preview/undo pairs share, create ≠ edit, `POST /students` is a people act, the status route is ONE key, `DELETE /settings/:key` = edit); `route-menus.ts` gone, no `ROUTE_MENUS`/`menuGuard` in the middleware.
- **The guard end to end (real middlewares, mini app):** `menu:calendar` + no action ⇒ reads the calendar, **403 + the ACTION sentence on `POST /bookings`** · with `action:calendar.book` ⇒ through, a different act on the same menu ⇒ the action sentence · **no menu ⇒ the MENU sentence even when the action would fail too (order)** · super admin does all · `requireAction` alone.
- **The body-level acts:** `assertMayOverrideLeave` (no flag / false / true-without-grant 403 + sentence / with grant / super admin / status+code); source: the status route checks the flag before the service, exactly four `assertMayDiscount` call sites.
- **The routes through the ROOT app:** `GET /api/permissions` ⇒ the registry by value, 401 without a token, **a zero-grant user reads it and their `/me.actions` is `[]`** · `/me.actions` in registry order for a user, all 46 for the dev super admin · `PUT /users/:id/actions` ⇒ `{ user }`, actor `dev`, **a menu key ⇒ 400**.
- **Source:** `setUserActions` → `replaceGrants("action:")`, refuse-before-tx, prefix delete, dedupe · the DTO's `actions` derivation · the guard's menu-then-action order · `index.ts` mounts `/api/permissions` after the guard · 37 = 37.

## 🔑 Mutation — fifteen, `finally`, checksum — all bite
A the action check dropped (3) · B the action refusal uses the menu sentence (3) · C action checked before menu (2) · D `hasAction` ignores the super admin (5) · E any grant unlocks acts (8) · F a mutate route loses its action (3) · G a preview split from its act (1) · H a 47th unused key (2) · I the discount back to super-admin-only (2) · J the leave-override check dropped from the route (1) · K `assertMayOverrideLeave` never refuses (1) · L `setUserActions` on the menu prefix (1) · M a super admin's DTO `actions` empty (1) · N `/permissions` not excluded (2) · O the permissions group mounted before the auth guard (2). Every restore byte-identical.

## 📌 Contract lines for @Fern (via you) — as confirmed, now real
`GET /api/permissions` → `{ menus: string[], actions: [{ key, area, labelTh, labelEn }] }` (46 actions; `area` ∈ calendar · bookings · people · teachers · link-requests · badges · settings · sales) · `GET /api/me` → `user.actions: string[]` beside `menus` · `PUT /api/users/:id/actions { keys: string[] }` → `{ user }` (400 on an unknown key; menus untouched) · `UserDTO.actions` on the list and the login body · **the action refusal: `403 { error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์ทำรายการนี้" } }`** (the menu refusal keeps `"ไม่มีสิทธิ์เข้าถึงเมนูนี้"`) · the discount refusal: `403 "ไม่มีสิทธิ์ให้ส่วนลด"` · the leave-override refusal: `403 "ไม่มีสิทธิ์ยกเว้นกฎแจ้งลาล่วงหน้า"` (on `PATCH /bookings/:id/status` with `override: true`) · the route → action map is `lib/route-access.ts` (one line per route) for the ~59-site sweep.

## ⚠ For the OWNER'S list (via you)
"Every action" = the 58 mutate routes of the admin API + 2 body-level acts. Outside by design, unchanged: the LINE webhook, the public check-in / LIFF register / `.ics` routes (their tokens are the credential), `/internal/*` jobs.
