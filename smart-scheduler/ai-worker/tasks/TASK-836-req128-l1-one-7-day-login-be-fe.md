# TASK-836 — BE + FE: **REQ-128 L1, one 7-day login.** The API token and the front session end TOGETHER, so a working user is never logged out mid-day — @Jason (BE ≈ 0.25 d) + @Fern (FE ≈ 0.55 d), incl. +10%
**From @Sober, 2026-10-25.** Owner: *"A. 7 วัน"* (via Porter, inbox/SA.md 10-25). GO by Porter.

**Ships ONLY after Tanya's logout step confirms L1** (the expected first 401 ≈ 14:00:44). Build now; nothing is committed by agents.

## Why (REQ-128 L1, read 10-25)
- The API token lives **12 h** (back `src/lib/jwt.ts:18`, `JWT_TTL_SECONDS ?? 12 * 3600`).
- The front's NextAuth session has no `maxAge`, so 30 days, and it **rolls forward with activity** (`src/auth.config.ts:9`).
- After 12 h the next call returns 401, and **every 401 signs out** (`src/lib/api/client.ts:83-87`). The user is thrown out mid-work.

## The design (my pick: ONE fixed 7-day lifetime, no silent renewal)
**Why no renewal:**
- It is a constant on the back, plus "end at the token's own expiry" on the front;
- no new route and no background refresh;
- after 7 days the user sees the login page, cleanly.

**The rule:** the front session ends **exactly when the API token it carries expires**, never later. So a 401 from an expired token can't happen mid-work any more.

### BE (@Jason)
- `src/lib/jwt.ts`: the default TTL → **7 days** (`7 * 24 * 3600`). The env override `JWT_TTL_SECONDS` stays.
- Nothing else changes: the guard still answers 401 for a revoked / disabled / unknown user (`middleware/auth.ts:65-79`).
- **Tests by value:** a signed token's `exp` = now + 604800 when the env is unset; the env override still wins.
- **Mutations:** the default back to 12 h; the env ignored.

### FE (@Fern)
- `src/auth.config.ts`: session `maxAge: 7 * 24 * 3600`.
  - **And:** at sign-in, read the API token's `exp` from its payload (a base64 read of the claim; **no secret, no verify on the front**) into the NextAuth token.
  - In the `jwt` callback, **once now ≥ that exp, end the session** (return null), so the user is sent to the login page cleanly instead of meeting a 401 mid-action.
  - **The rolling session can never outlive the API token.**
- `src/lib/api/client.ts`: **unchanged.** Any 401 still signs out, so a revoked or disabled user is still thrown out at once (keep `reason=disabled`).
- **Tests by value:**
  - a session whose API token expires in the future stays;
  - one whose token has expired ends;
  - a token without `exp` ends (fail closed);
  - the 401 sign-out (incl. `reason=disabled`) is unchanged.
- **Mutations:** maxAge back to the default; the exp check removed; the comparison flipped (`>` vs `≥` at the boundary); a missing `exp` treated as valid.

## Owner step (uat; no secret values in any file)
- **If `JWT_TTL_SECONDS` is set on uat, remove it, or set it to `604800`** (7 days; this is a duration, not a secret).
- `JWT_SECRET` and the NextAuth secret stay exactly as they are. Changing either would log everyone out once.

## Done means
Per side:
- tests by value + a mutation set (each bite shown);
- tsc 0 · the suite / `bun test` / build;
- `unhandled-between-tests: N`;
- `git status` in full.

**List every pin file before editing.** No two mutation sets at once on one tree. Nothing committed.


## Jason (BE) 2026-10-25 — TASK-836 BE (REQ-128 L1): the API token's default lifetime 12 h → 7 days — GREEN

- **Change (`src/lib/jwt.ts` only):** `export const DEFAULT_TTL_SECONDS = 7 * 24 * 3600;` and `ttlSeconds = () => Number(process.env.JWT_TTL_SECONDS ?? DEFAULT_TTL_SECONDS)`. The env override stays. The guard (`middleware/auth.ts`) and its 401s are untouched.
- **Pins listed first:** none pin the TTL. Searched `JWT_TTL_SECONDS`, `12 * 3600`, `12h`, `ttlSeconds`, `lib/jwt` across src: the only users are `routes/auth.ts`, `middleware/auth.ts`, `middleware/auth.test.ts`, `line-admin-removal-task538.test.ts` (all just call `signToken`/`verifyToken`). No existing test edited.
- **Tests (new `src/lib/jwt-ttl-task836.test.ts`, 5):** env unset ⇒ `exp` = now + 604800 to the second · not 12 h · override 3600 wins, 604800 = default · claims round-trip · source pin (one constant, no refresh/renew path).
- **Set `jwt-ttl-task836.mutations.json`: 4/4 BITE, 0 survivors, checksum identical** (M1 default back to 12 h · M2 env ignored · M3 7 hours · M4 override read as minutes).
- **Verified:** tsc 0 · SAFE suite 5,073 pass / 0 fail (364 files; +5 tests, +1 file) · migrations 72 = 72. `git status` saved: GIT-STATUS-back-836-2026-10-25.txt (3 lines: jwt.ts + my 2 new files). My run had .env present (the test deletes `JWT_TTL_SECONDS` itself and sets its own `JWT_SECRET`, so it holds without .env); your no-.env room is still yours.
- **⚠️ For the owner step:** the back's env files hold `JWT_TTL_SECONDS=43200` (12 h): `.env.example:23`, `.env.uat:25`, `.env.sid:25` and the local `.env:25`. A set variable BEATS the new default, so uat (and sid) stay at 12 h until it is removed or set to `604800`. I did not edit any env file (outside the TASK's claim). If you want `.env.example` / `.env.uat` / `.env.sid` changed to 604800 or the line dropped, say so and I'll list and do it.

Ball: Sober.

## 🔧 2026-10-25 — @Sober → @Jason: ONE hardening before I verify (the diff is otherwise right)
- **The hole:** `Number(process.env.JWT_TTL_SECONDS ?? DEFAULT)`. If the env line is left **empty** (`JWT_TTL_SECONDS=`, which is easy to do while "removing" it per the owner step), `??` does not fire and `Number("")` = **0**. **Every token then expires the moment it is issued: nobody can stay logged in.** Garbage (`abc` ⇒ NaN) or a negative number is just as bad.
- **The fix:** a set value counts only if it's a finite number > 0. Empty, garbage or ≤ 0 ⇒ `DEFAULT_TTL_SECONDS`.
- **Tests by value:** `""` ⇒ 604800 · `"abc"` ⇒ 604800 · `"0"` / `"-5"` ⇒ 604800 · `"3600"` ⇒ 3600.
- **Mutations:** drop the guard (empty ⇒ 0 bites); `> 0` → `>= 0` (bites on `"0"`).
- **The env files: leave them.** Only `.env.example` is tracked; `.env.uat` / `.env.sid` / `.env` are git-ignored local copies. **The live value is on each server = the owner's step** (Porter). Whether to change the tracked `.env.example` line is Porter's call (outside the claim); I've asked.


## Jason (BE) 2026-10-25 — TASK-836 BE hardening: an empty / garbage / ≤ 0 `JWT_TTL_SECONDS` falls back to 7 days — GREEN

- **Fix (`src/lib/jwt.ts` only):** `ttlSeconds` now reads `const v = Number(process.env.JWT_TTL_SECONDS); return Number.isFinite(v) && v > 0 ? v : DEFAULT_TTL_SECONDS;`. A set value counts only if it is a finite number > 0; empty (`Number("")` = 0), garbage (NaN), `0`, negative and `Infinity` all give 604800.
- **Tests by value (one new test in `jwt-ttl-task836.test.ts`, now 6):** `""` · `"abc"` · `"0"` · `"-5"` · `"Infinity"` ⇒ 604800; `"3600"` ⇒ 3600. The source pin was re-aimed to the new two-line body (my own file).
- **Set 836 now 6/6 BITE, 0 survivors, checksum identical:** M1 default 12 h · M2 env ignored · M3 7 hours · M4 override as minutes · **M5 guard dropped (only unset falls back ⇒ an empty line gives 0)** · **M6 `> 0` → `>= 0` (a "0" accepted)**. M2 and M4 re-anchored to the new body.
- **Verified:** tsc 0 · SAFE suite 5,074 pass / 0 fail (364 files) · `git status`: `jwt.ts` + my 2 new files only. Env files not touched.

Ball: Sober.

## ✅ 2026-10-25 — @Sober: TASK-836 BE VERIFIED (incl. the hardening + the granted `.env.example` line)
- **The code:** `ttlSeconds` takes a set value only if it is finite and > 0; unset / empty / garbage / ≤ 0 ⇒ 7 days.
- **`.env.example`:** exactly ONE line changed (`JWT_TTL_SECONDS` 12 h → 604800); no other env file touched.
- **No-`.env` clean room** of back `d9c0cf3` + 4 files: tsc 0 · SAFE suite **5,074 / 0** · unhandled 0 · 72 = 72 · set 836 **6/6** (incl. M5 empty ⇒ 0, M6 `>= 0`), checksum identical.
- 🧊 The back tree is frozen for the commit; the FE half (Fern) is pending.


## Jason (BE) 2026-10-25 — TASK-836 BE: the granted `.env.example` line — DONE

- Tracked `.env.example` line 23: `JWT_TTL_SECONDS=43200` → `JWT_TTL_SECONDS=604800`. **Only that line**; `.env`, `.env.uat`, `.env.sid` untouched.
- Pins listed first: four tests read `.env.example` (`bootstrap-loud-and-legacy-sub-req092`, `rbac-stage1-users-req092`, `line-register-req088`, `sec1-admin-code-task534`); none touches the TTL line (they pin the admin-bootstrap / LINE / code placeholders). No test edited.
- Suite 5,074 pass / 0 fail (364 files). `git status`: `.env.example` + `jwt.ts` (modified), `jwt-ttl-task836.test.ts` + `.mutations.json` (new). Nothing else.

Ball: Sober.

---
## FE report — Fern, 2026-10-25 — TASK-836 FE DONE (front only; nothing committed)
**Change:**
- NEW `src/lib/auth/token-expiry.ts` (edge-safe, no deps, no secret): `SESSION_MAX_AGE_SECONDS = 7 * 24 * 3600`; `readTokenExp(jwt)` (base64url payload read of the `exp` claim → number | null; never verifies); `tokenLive(exp, now)` (`now < exp`, fail closed on a missing exp).
- `src/auth.config.ts`: `session.maxAge = 7 days`; at sign-in `token.backendExp = readTokenExp(user.backendToken)`; the `jwt` callback now `return null` once `!tokenLive(token.backendExp)` — so the session ends at the token's own exp, never later; a token with no readable exp ends the session (also at sign-in).
- `src/types/next-auth.d.ts`: `backendExp?: number | null` on the JWT. `src/lib/api/client.ts`: **unchanged** (every 401 still signs out; `reason=disabled` kept) — pinned by a test.
**Pins (listed to you first, none needed an edit):** `menu-guard.test.ts:82-84` · `teacher-scope.test.ts:77-78` · `users-page.test.ts:21,35-40` (+ `next-auth.d.ts` strings): all `toContain` of lines I only added around; re-run: green.
**Tests by value** (`src/lib/auth/token-expiry.test.ts`, 10, real JWT-shaped strings through the REAL `jwt` callback, clock set with `setSystemTime`): maxAge = 604800 · exp read incl. url-safe/multibyte · every unreadable shape → null (none, junk, no exp, string exp, null exp) · live/ended/boundary (`now == exp` ends) · sign-in keeps the session + carries exp and the old fields · expired → null · one second before keeps / the second of exp ends · fail closed (no exp at sign-in and on a later read) · the 401 sign-out strings in `client.ts` unchanged.
**Mutation set `scripts/mutation/task-836.json`** (alone; no runner before or after; CHECKSUM identical; baseline 10/0): M1 maxAge dropped · M2 12 h · M3 🔴 end-check removed · M4 boundary `<=` · M5 🔴 missing exp valid · M6 exp not read at sign-in · M7 🚫 401 sign-out narrowed · M8 claim read accepts any value — **all 8 BITE**.
**Gates:** tsc 0 · build 0 · `bun test` **1355 pass / 3 fail** · `unhandled-between-tests: 0`.
⚠️ **The 3 failures are NOT this change — they are clock-dependent tests of mine that went red because "today" is now 2026-10-25:** `leave-range-refusals-task822.dom.test.tsx` (F1 ×2) and TASK-818 P2 "moving the START past the end…". They build dates with `dayjs().add(7,"day")`, and 25/10 + 7 crosses into November, which their month-grid clicks do not expect (green on 10-21). Neither file imports auth. I did not touch them (outside 836's claim). **Proposal:** a 836-sized follow-up (≈0.1 d): pin their "today" with `setSystemTime` to a mid-month day — say go and I will list the pin files first.
**`git status --short -uall` (front):**
```
 M src/auth.config.ts
 M src/types/next-auth.d.ts
?? scripts/mutation/task-836.json
?? src/lib/auth/token-expiry.test.ts
?? src/lib/auth/token-expiry.ts
```
**Not tried:** a real sign-in against a real 7-day API token in a browser (the exp is read from JWT-shaped test strings; Jason's BE default change is what makes real tokens last 7 days). Owner step (uat) stays as written in this task: `JWT_TTL_SECONDS` removed or `604800`.

## ▶️ 2026-10-25 — @Sober → @Fern: GO the clock fix (Team A's own pins, self-granted), inside TASK-836's commit
- **The 3 red tests** (`leave-range-refusals-task822.dom.test.tsx` F1 ×2 · TASK-818 P2) build their dates from the real "today" and break when +7 days crosses a month end.
- **Fix:** pin their "today" with `setSystemTime` to a fixed mid-month date, and restore the real clock after each.
  - The minimal edit: **each test's point is kept, its dates now fixed**.
  - Re-run sets **822 + 818** (they must still bite) and 836.
- **List the files first** (in your report), then the full `bun test` must be **0 fail**. Then nudge me once for the verify.
- The design is checked: next-auth **5.0.0-beta.31** supports `return null` from `jwt` to end the session.

---
## FE report — Fern, 2026-10-25 — the clock fix is DONE (inside TASK-836's commit list)
**Files edited (Team A's own tests; the minimal edit, each test's point unchanged):**
- `src/components/partials/Calendar/Modal/leave-range-refusals-task822.dom.test.tsx` and `leave-range-task818.dom.test.tsx`: `iso()` now counts from a fixed `CLOCK = "2026-10-12T09:00:00"` instead of `dayjs()`; `beforeEach` calls `setSystemTime(new Date(CLOCK))` (so the page's own "today" is that same day); `afterEach` calls `setSystemTime()` (the real clock is back for every other file). Import gains `setSystemTime`.
**Result:** `bun test` **1358 pass / 0 fail** (143 → 144 files incl. the new auth test) · tsc 0 · build 0 · `unhandled-between-tests: 0`.
**Sets, one at a time (no runner before/after, CHECKSUM identical each):** 822 **18/18 BITE** (baseline 78/0) · 818 **25/25 BITE** (baseline 41/0) · 836 **8/8 BITE** (baseline 10/0). No SURVIVED / ANCHOR MISSING.
**Note for you:** other test files also build dates from `dayjs()` (`cancel-restores-o1`, `leave-panel-task820`, `lift-leave-task814`, `leave-co-taught-task828`, `leave-range…`, `leave-same-day-task829`, `teacher-leave-list-task821`, `teacher-leave-row`, `resume-defaults`). They are green today, but any of them can go red on another run day the same way; I did not touch them (not in the GO). Say if you want the same pin applied.
**`git status --short -uall` (front):**
```
 M src/auth.config.ts
 M src/components/partials/Calendar/Modal/leave-range-refusals-task822.dom.test.tsx
 M src/components/partials/Calendar/Modal/leave-range-task818.dom.test.tsx
 M src/types/next-auth.d.ts
?? scripts/mutation/task-836.json
?? src/lib/auth/token-expiry.test.ts
?? src/lib/auth/token-expiry.ts
```

## ✅ 2026-10-25 — @Sober: TASK-836 FE VERIFIED → READY for the commit (`DEPLOY-REQ-128-L1-seven-day-login-2026-10-25.md`)
- **Clean copy** of front `e7ec71d` + 7 files: tsc 0 · `bun test` **1,358 / 0** · unhandled 0 · build 0 (the tree unchanged by it).
- **Sets, one at a time:** 836 **8/8** · 822 18/18 · 818 25/25.
- next-auth 5.0.0-beta.31 supports ending the session by returning `null` from `jwt`.
- 🧊 Both trees are frozen. It ships after Tanya confirms L1, plus the owner's env step on each server.

## ⬆️ 2026-10-25 — @Sober: ขึ้น git (Porter's order) — COMMITTED + PUSHED on `dong`. No deploy
- **back** `smart-scheduler-back`: **`43da846`** `fix: Make a login last 7 days and ignore an empty token lifetime (TASK-836)`. The 4 files exactly as listed. Push: `d9c0cf3..43da846  dong -> dong`.
- **front** `smart-scheduler-front`: **`46c6ee1`** `fix: End the login session when the API token expires, after 7 days (TASK-836)`. The 7 files exactly as listed. Push: `e7ec71d..46c6ee1  dong -> dong`.
- `git fetch` first: neither branch was behind (0 behind / 1 ahead), so nothing was integrated.
- **รวมโค้ด (`merge-workflow.sh`) was NOT run:** not ordered (commit + sync only).
- Both trees are clean and level with `origin/dong`.
- **Still the owner's:** the deploy + the env step on each server, after Tanya confirms L1.
