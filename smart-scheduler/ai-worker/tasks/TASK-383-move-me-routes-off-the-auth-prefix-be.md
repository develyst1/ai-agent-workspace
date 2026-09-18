# TASK-383 — Move the signed-in user's routes off `/auth/*`: `GET /api/me`, `POST /api/me/password` (Stage 2 routing bug, `sid`) — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-18)
**The fact (Tanya, verified):** the frontoffice's NextAuth catch-all (`app/api/auth/[...nextauth]`) owns `/api/auth/*` on the FE host; only `/api/auth/login` is proxied to the BE. `GET /auth/me` and `POST /auth/me/password` answer NextAuth's `400 "Bad request."` — change-password and the grant re-read never reach the BE. Security holds (the BE 403s); two features are dead.
**Decision:** move, don't rewrite — `/auth/*` is NextAuth's namespace on the FE host for as long as NextAuth exists; a rewrite is one more line to forget at the next deploy.
**Size XS.** Ships with Stage 3's `sid` build (or alone — @Porter's call). No migration.

## §1 The change
- `GET /api/me` and `POST /api/me/password` — under `/api/*`, so the normal `authMiddleware` applies (no explicit guard needed any more — remove TASK-381's `authRoutes.use("/me", …)`); **excluded from the menu table like `/users/*`** (a zero-menu user must reach both). The old `/auth/me*` routes REMOVED (not aliased — one path).
- Same bodies, same codes. 📌 The wrong-current-password refusal: change `401` → **`400 WRONG_PASSWORD`** (Fern's list item — a 401 collides with the FE's sign-out interceptor; a 400 is the honest code: the request was well-formed and the credential in the BODY was wrong, the session is fine). Sentence unchanged.
- Pins: `/api/me` without a token ⇒ 401; with ⇒ the shape; a zero-menu user reaches both; `/auth/me` ⇒ 404; the menu-table enumeration excludes `/me*`; the enumeration still covers everything else.

## Definition of Done
- [ ] Suite, **count** · tsc · 37 = 37 · contract line to @Fern via me
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

---

# 📤 REPORT — @Jason → @Sober (2026-09-18)

✅ **DONE (code), against §1.** **2328 pass / 0 fail**, **186 files** · `tsc --noEmit` clean · 🚫 **no migration (37 = 37)**.

## What changed
- **`routes/me.ts` (new)** — `meRoutes`: `GET /` (the same `{ user: { id, username, displayName, isSuperAdmin, menus } }` body) and `POST /password` (the same `{ currentPassword, newPassword }` ⇒ `{ ok: true }`). Mounted in `index.ts` as **`app.route("/api/me", meRoutes)`** AFTER `authMiddleware` + `menuGuard` — the normal `/api/*` JWT guard, nothing explicit.
- **`routes/auth.ts`** — the `/me` block, its explicit `.use("/me*", authMiddleware)`, and the `authMiddleware`/`menusOf`/`changeOwnPassword` imports are GONE; only `POST /login` remains, with a comment that nothing but login may live under `/auth` (NextAuth owns `/api/auth/*` on the FE host). **No alias**: `/api/auth/me` and `/api/auth/me/password` are 404.
- **`middleware/auth.ts`** — `menuGuard`'s exclusion is now `^\/api\/(auth|users|me)(\/|$)`: `/me*` is JWT-only, not menu-gated (a zero-menu user reaches both).
- **`user.service.ts`** — `changeOwnPassword`'s wrong-current refusal: `401 UNAUTHORIZED` → **`400 WRONG_PASSWORD`**, sentence unchanged `"รหัสผ่านปัจจุบันไม่ถูกต้อง"`. Order unchanged (verify current → min 8 → replace).
- Doc comments in `route-menus.ts`, `permissions.ts`, `users.ts` say `/api/me` now.

## Pinned (`rbac-stage2-menu-guard-req092.test.ts`, 24 tests — +1, the rest re-pointed)
- `GET /api/me` ⇒ the dev super admin with all 12 · **`/api/me` and `/api/me/password` without a token ⇒ 401**, login still public · **`/api/auth/me` + `/api/auth/me/password` ⇒ 404, and `routes/auth.ts` declares exactly ONE route (`.post(`) with no `/me` and no `authMiddleware`** · a zero-menu user with a real token **reaches `/api/me` (`menus: []`) AND `/api/me/password` (service called with THEIR id), and is still 403 on `/api/calendar`** · `POST /api/me/password`: wrong current ⇒ **`400 { error: { code: "WRONG_PASSWORD", message } }`** by value, short ⇒ 400, ok ⇒ `{ ok: true }`, the caller's own id · enumeration: no `/auth`, `/users` or `/me` key in `ROUTE_MENUS`, and the guard's exclusion regex names the same three (source) · source: the 400 line present and NO `ApiException(401` in `changeOwnPassword` · `index.ts` order: `menuGuard` before `app.route("/api/me")`.

## 🔑 Mutation — seven, `finally`, checksum — all bite
A the guard stops excluding `/me*` (4) · B the me group mounted BEFORE the auth guard (5) · C the refusal back to 401 (1) · D an alias `/auth/me` sneaks back (1) · E/F the password route drops the caller's id (1 / 2) · G a `/me` row added to the menu table (2). Every restore byte-identical.

## 📌 Contract line for @Fern (via you)
`GET /api/me` → `{ user: { id, username, displayName, isSuperAdmin, menus: MenuKey[] } }` · `POST /api/me/password { currentPassword, newPassword }` → `200 { ok: true }` | **`400 { error: { code: "WRONG_PASSWORD", message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" } }`** | `400 PASSWORD_TOO_SHORT` · both need the Bearer token only (no menu) · `/api/auth/me*` is **404** — no alias, do not proxy it. The 401-exemption in the FE's interceptor can be retired: this route never answers 401 for a wrong password.
