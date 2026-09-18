# TASK-380 — The bootstrap refuses LOUDLY when the env pair breaks the password rule, and never logs a credential (`REQ-092` Stage 1 field defect) — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-17)
**The fact (verified in the code + the owner's log):** on `sid` `BOOTSTRAP_ADMIN_PASSWORD=admin` (5 chars); `bootstrapIfEmpty` → `createUser` → `assertPassword` throws `400 PASSWORD_TOO_SHORT` BEFORE the insert; the `ApiException` returns as the login's response, nothing in stdout, the FE shows its generic sentence, the table stays empty, every login retries. The owner looped for hours. **Recovery is an env change (told); this task makes the failure visible next time.**
⚠️ **The working tree of `user.service.ts` carries UNCOMMITTED debug `console.log`s that print the env password** — not yours; the human's. Coordinate: if they are still there when you start, replace them (your diff supersedes); say what you found. **Never log a credential.**
**Size XS.** ⛔ Chain stopped. Ships in the next Stage-1 `sid` build.

## §1 The change
- `bootstrapIfEmpty`: check the env pair against the SAME rules `createUser` will apply (username pattern, `PASSWORD_MIN`) BEFORE calling it; on failure `console.error("[auth] bootstrap REFUSED: BOOTSTRAP_ADMIN_PASSWORD shorter than 8 (or: username invalid) — set it and restart")` ONCE per process (not per login attempt) and throw the same `PASSWORD_TOO_SHORT` / `VALIDATION` so the login answers with the specific sentence, not the generic 401.
- `.env.example`: `BOOTSTRAP_ADMIN_PASSWORD=` EMPTY, with the rule beside it (`# min 8 chars; read only while the users table is empty`).
- 🚫 No credential in any log line, ever — assert by a negative over the file (`envPass`/`password` never inside a `console.*` call).

## Definition of Done
- [ ] Suite, **count** · tsc · 37 = 37
- [ ] Pinned: a 5-char env password ⇒ login answers `400 PASSWORD_TOO_SHORT`, one error log line, no insert · an 8-char one ⇒ created · the negative: no `console.*` argument references a password variable · `.env.example` placeholder empty
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

---

## §2 ADDED (Tanya, `sid`, 2026-09-17) — a legacy `sub` returns 500, must be 401 — SHIPS IN THE SAME BUILD, before `uat`
**Verified:** `authMiddleware` (`middleware/auth.ts:60`) calls `findUserById(sub)`; the column is `uuid`, so a non-UUID `sub` (every pre-Stage-1 token carries `sub = "admin"`) makes Postgres throw `22P02` BEFORE the `if (!row) → 401`. **Every admin logged in before the cutover hits a 500 on their first call instead of "sign in again."**
- Fix at the guard: validate the claim's shape before the read (a UUID check — one regex, or `z.string().uuid()`), and treat a malformed `sub` as `401 "โทเคนไม่ถูกต้องหรือหมดอายุ"` (the token sentence); keep the row read for a well-formed id. 🚫 Do not catch-all around the lookup — a real DB error must still be a 500.
- Pinned: a token with `sub = "admin"` ⇒ 401 with the token sentence, no query issued · a well-formed unknown id ⇒ 401 · a well-formed known id ⇒ through · a DB error on the read is NOT swallowed.

---

# 📤 REPORT — @Jason → @Sober (2026-09-17)

✅ **DONE (code), §1 + §2 in one build.** **2304 pass / 0 fail**, **185 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (37 = 37)**.

## §3 What I found in the working tree, and what I did with it
`user.service.ts` carried TEN uncommitted `console.log`s that were not mine — four in `createUser` (username, actor, password LENGTH, display name, the flag) and six in `bootstrapIfEmpty`, **one of which printed `BOOTSTRAP_ADMIN_PASSWORD` itself to stdout** (`console.log('env pass', envPass)`). Per your line, my diff supersedes: all ten are gone. The file now has exactly two `console.*` calls — the refusal (`error`) and the creation (`info`) — and a negative pin over the file asserts no `console.*` argument ever names a password variable, and that no `console.log(` exists there at all.

## §4 What was built
- **§1** `bootstrapEnvRefusal(envUser, envPass)` (pure, exported): the SAME rules `createUser` applies — `USERNAME_RE` over the normalised username ⇒ `400 VALIDATION`; `length < PASSWORD_MIN` ⇒ `400 PASSWORD_TOO_SHORT` with a sentence that names the env variable and says *set it and restart*. `bootstrapIfEmpty` calls it AFTER the pair matched and the table is empty, BEFORE `createUser`; on a refusal: `console.error("[auth] bootstrap REFUSED: BOOTSTRAP_ADMIN_PASSWORD is shorter than 8 — set it and restart. The users table is still empty.")` **once per process** (a module flag), then throws the specific 400 — so the login answers the specific sentence, not the generic 401, and the operator's console says why. The success line is `console.info`. `.env.example`: `BOOTSTRAP_ADMIN_PASSWORD=` EMPTY with *"min 8 chars; read only while the users table is empty — a shorter one is REFUSED loudly"* beside it.
- **§2** `middleware/auth.ts`: `UUID_RE` exported; after `verifyToken`, **`if (!UUID_RE.test(sub)) throw 401 "โทเคนไม่ถูกต้องหรือหมดอายุ"` BEFORE `findUserById`** — a legacy `sub = "admin"` never reaches the `uuid` column; no catch-all around the lookup, so a real database error stays a 500.

## §5 Pinned (`lib/bootstrap-loud-and-legacy-sub-req092.test.ts`, 9 tests) + one moved
- **§1:** the pure refusal (5 chars ⇒ `PASSWORD_TOO_SHORT` — the `sid` case; 8 ⇒ null; a bad username ⇒ `VALIDATION`; normalised first; **the boundary 7/8 and `PASSWORD_MIN === 8`** — added after mutation D drifted the minimum to 6 and passed) · **the `sid` case end to end** with the reads spied: three login attempts ⇒ 400 `PASSWORD_TOO_SHORT` each, ZERO inserts, at most ONE `[auth] bootstrap REFUSED` line, and no log line carries the value · an 8-char pair ⇒ created as before · **the negative over the file** (no `console.*` argument matches `envPass|password|passwordHash|input.password`; no `console.log(`; the human's three debug prefixes absent) · `.env.example`'s empty placeholder + the rule.
- **§2:** `sub = "admin"` ⇒ 401 with the token sentence and **no query issued** (the spy's call list is empty) · a well-formed unknown id ⇒ 401 with the read having run · a well-formed known id ⇒ through · **a DB error on the read ⇒ 500, not swallowed** · `UUID_RE` accepts the PK shape and refuses `admin`/`dev`/`""`/a 32-hex string; the check sits before the read; no `try { … findUserById`.
- 🔻 `middleware/auth.test.ts`: its fixture ids were `u-1`/`u-2` — non-UUIDs, which the new shape check refuses (the fix working) — now real UUIDs.

## §6 🔑 Mutation — seven, `finally`, checksum — all bite (one after a pin I added)
A the pre-check removed — the `sid` failure as shipped · B the refusal logs the password · C the human's debug line comes back · **D the pre-check's minimum drifts to 6 — PASSED first (5 < 6 still refused); the 7/8 boundary pinned, now 1 fail** · E the shape check removed (a legacy sub reaches the DB) · F a catch-all swallows a DB error into a 401 (3 fail) · G the malformed sub gets the disabled sentence (2). Restores byte-identical.

📌 **For the deploy note:** `BOOTSTRAP_ADMIN_PASSWORD` must be ≥ 8; a shorter one now refuses loudly in the console and the login shows `PASSWORD_TOO_SHORT`'s sentence. Every pre-cutover admin session answers 401 on its first call (sign in again), never 500.
