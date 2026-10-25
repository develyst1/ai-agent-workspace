# DEPLOY — REQ-128 L1 (TASK-836): ONE 7-day login. A working user is no longer logged out mid-day — sid first, then uat — @Sober, 2026-10-25
**For @Porter → the owner.**
- **Ships ONLY after Tanya's logout step confirms L1** (the first 401 ≈ 12 h after login).
- **Both apps go together.** No migration. No secret changes.

## 0 · What is in it
- **Back:** the API token lasts **7 days** instead of 12 h. `JWT_TTL_SECONDS` still overrides it, **but an empty / garbage / ≤ 0 value now falls back to 7 days** (before, an empty line meant every token expired instantly). The tracked `.env.example` now shows 604800.
- **Front:**
  - the login session is set to 7 days;
  - **it ends exactly when the API token expires, never later**, so the user lands on the login page instead of being thrown out mid-action;
  - a revoked or disabled user is still signed out at once (every 401 still signs out).
- **Test fix inside it:** three date-dependent leave tests (TASK-822 / 818) are pinned to a fixed date. They broke when "today + 7 days" crossed into November; their checks are unchanged.

## 1 · Verified by me on clean copies (final)
| | result |
|---|---|
| **back** `d9c0cf3` + 4 files (**no `.env`**) | tsc 0 · SAFE suite **5,074 / 0**, 364 files · unhandled 0 · migrations 72 = journal 72 · set 836 **6/6** |
| **front** `e7ec71d` + 7 files | tsc 0 · `bun test` **1,358 / 0**, 144 files · unhandled 0 · **build 0** (the tree unchanged by it) · sets 836 **8/8** · 822 18/18 · 818 25/25 |

0 survivors, checksums identical, one set at a time. **Not proven yet:** a real login on sid lasting past 12 h. That is Tanya's.

## 2 · Commit lists (`git status --short -uall`, taken by me, both trees frozen)
### back: `smart-scheduler-back` (4)
```
 M .env.example
 M src/lib/jwt.ts
?? src/lib/jwt-ttl-task836.mutations.json
?? src/lib/jwt-ttl-task836.test.ts
```
### front: `smart-scheduler-front` (7)
```
 M src/auth.config.ts
 M src/components/partials/Calendar/Modal/leave-range-refusals-task822.dom.test.tsx
 M src/components/partials/Calendar/Modal/leave-range-task818.dom.test.tsx
 M src/types/next-auth.d.ts
?? scripts/mutation/task-836.json
?? src/lib/auth/token-expiry.test.ts
?? src/lib/auth/token-expiry.ts
```

## 3 · Deploy: sid, then (after Tanya) uat
1. **⚠️ THE OWNER STEP, on EACH server (sid, then uat).** Without it the code change does nothing: the servers set `JWT_TTL_SECONDS=43200`, which wins over the new default.
   - **Either set `JWT_TTL_SECONDS=604800`, or delete the whole line.** It is a duration, not a secret.
   - **Don't leave it as an empty `JWT_TTL_SECONDS=`.** It's harmless now, but say what you meant.
   - **Do NOT touch `JWT_SECRET` or the NextAuth secret:** changing either logs everyone out once.
2. **Back:** pull, restart (no migration).
3. **Front:** the usual build + restart.
4. **Users already logged in keep their OLD 12-hour token** until it runs out, so expect each of them to be logged out **one last time**, then never mid-day again. Worth one line to the customer: **after the release, log in once more.**

## 4 · Tanya's gate on sid (then uat read-only)
- Log in, note the time. **12 h later the session is still alive**, and a page loads with no logout.
- The login page appears **only when the 7 days are up** (or test it with a short `JWT_TTL_SECONDS` on sid, e.g. 600 s: at 10 min the next page goes to the login page, cleanly, not an error mid-action).
- A disabled user is still thrown out on their next click.
