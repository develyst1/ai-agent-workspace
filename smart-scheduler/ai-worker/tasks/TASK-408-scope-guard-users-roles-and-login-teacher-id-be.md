# TASK-408 — Two XS closes on REQ-097: the scope check must also cover `/users*` and `/roles*` (a linked super admin slips the early exit) · the login body carries `teacherId` (the FE's first-paint flash)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-19) · **Size XS.** No migration (45 = 45). `sid`.

## §0 What I saw in `middleware/auth.ts:122–134`
`if (/^\/api\/(auth|users|me|permissions|roles)(\/|$)/.test(path)) return next();` runs BEFORE the `isScoped` line. Correct for `/auth`, `/me`, `/permissions` (the JWT alone). **Wrong for `/users*` and `/roles*`:** they carry their own `requireSuperAdmin`, but a LINKED super admin — scoped by your own rule ("a super admin WITH a link is scoped too") — still reaches user/role admin. The fail-closed proof (8 of 103) never exercised those routes because they are not in the table.

## §1 Do
1. **The scope check reaches `/users*` and `/roles*`:** move the `isScoped` refusal ABOVE the early exit for those two prefixes (keep `/auth`, `/me`, `/permissions` exempt — a linked account must still log in, read `/me`, and see the labels). Pin by value through the mini app: a linked super admin ⇒ `403 SCOPE_TEACHER` on `GET /users`, `POST /users`, `GET /roles`; an unlinked super admin ⇒ 200; a linked account still gets 200 on `GET /me` and `/permissions`. The proof's denominator moves 103 → 103 + the users/roles routes.
2. **The login body carries `teacherId`** beside `menus` / `actions` (the same row read) — so the FE's seed knows the scope on the first paint (Fern's TASK-407 §2.2). Pin the shape.
3. 🚫 Nothing else.

## Definition of Done
- [ ] Suite, **count** · tsc 0 · 45 = 45 · the two pins above · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log · one line for @Fern (the login body's new field).

---

# 📤 REPORT — @Jason → @Sober (2026-09-19)

✅ **DONE (code).** **2537 pass / 0 fail** (+2), 196 files · `tsc --noEmit` clean · 🚫 no migration (**45 = 45**).

## §1.1 — the hole, closed (`middleware/auth.ts`, ONE line moved up)
You read it right: the early exit for `/auth|users|me|permissions|roles` ran BEFORE the `isScoped` line, so a LINKED super admin — scoped by TASK-406's own rule — reached `/users*` and `/roles*` through their `requireSuperAdmin`. Now, BEFORE that exit: `if (/^\/api\/(users|roles)(\/|$)/.test(path) && isScoped(user)) throw SCOPE_TEACHER();` — `/auth`, `/me`, `/permissions` stay exempt (login, `/me`, the labels). The `user` read moved above the exit to feed it; nothing else in the guard changed (menu → action → the `TEACHER_ALLOWED` scope line as before).

## §1.2 — the login body's `teacherId`: ALREADY TRUE by construction — pinned, not re-added
`routes/auth.ts` builds the login user as `{ ...(await userDTO(user)), role }`, and `userDTO` → `toUserDTO` has carried `teacherId` + `teacherName` since TASK-406 (the auth test's login pin I moved then shows both). So Fern's seed gets the field today; I added the pin by value (and by source: the login uses the SAME DTO as the users page — one shape) rather than a second field. ⚠️ If Fern's TASK-407 §2.2 read "lacks `teacherId`" from a `sid` box, that box predates the TASK-406 deploy — nothing to change in the BE.

## Pinned (`lib/teacher-own-calendar-req097.test.ts`, +2 tests, the guard-order pin extended)
- **Through real tokens on a mini app with the real guards** (`/api/users`, `/api/users/:id`, `/api/roles`, `/api/me`, `/api/permissions`, `/api/auth/logout` registered): a LINKED super admin ⇒ **403 SCOPE_TEACHER** on `GET /users`, `POST /users`, `GET /users/:id`, `GET /roles`, `POST /roles` (the envelope by value); an UNLINKED super admin ⇒ 200 on all five; a linked super admin AND a linked plain account ⇒ 200 on `/me`, `/permissions`, `/auth/*`.
- **By source:** the users/roles scope line sits before the early exit.
- **The login body:** `teacherId` + `teacherName` beside `menus`/`actions`/`role` through the ROOT app (`authenticate` + `userDTO` spied); the route uses the one DTO.

## 🔑 Mutation — six, `finally`, checksum — all bite
A the line dropped (the hole reopens) · B the line AFTER the exit (dead code) · C `roles` left open · D `/me` refused too · E only a non-super-admin refused (the linked super admin slips) · F the login body drops the DTO. Every restore byte-identical.

📌 **One line for @Fern (via you):** the login response's `user` already carries `teacherId: string | null` and `teacherName: string | null` (the same DTO as `GET /users`); `GET /me` carries `teacherId`. A linked account now gets `403 SCOPE_TEACHER` on every `/users*` and `/roles*` call as well — hide those doors when `teacherId` is set.

🚫 No deploy request. ⛔ Only you mark this DONE. ▶️ Next: whatever waits on the board.
