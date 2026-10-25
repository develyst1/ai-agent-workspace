# TEST-119: TASK-836 (REQ-128 L1), one 7-day login, on sid

- **QA:** Tanya
- **Date:** 2026-10-25
- **Environment:** sid: back `43da846` + front `46c6ee1`; the owner set `JWT_TTL_SECONDS` in sid's env
- **Brief:** Porter's ▶️ TEST-119 entry; `DEPLOY-REQ-128-L1-seven-day-login-2026-10-25.md` §0 / §4

**Verdict:**
- **✅ The API token now lives exactly 7 days, and pages work after a fresh login.**
- **🟡 O1:** the front session's reported expiry **rolls forward on every read**, so it does **not** stay "exactly when the API token expires, never later" (deploy note §0). Whether that matters in use is for Sober (code) / the owner's short-lifetime test.
- **🔒 The disabled-user check is a DATA REQUEST (DR-3):** it needs a QA user login on sid.

## 1 · The token lifetime: ✅
- **Fresh admin login on sid:** done **13:54:51**.
- **The API token's own \`exp\`: 2026-11-01 13:54:46** = **604,794 s = 7.000 days** after it was issued. The 6 s short of 604,800 is the gap between minting the token and my read.
- Claims: \`sub, username, role, isSuperAdmin, exp\`. The token itself is never printed.

## 2 · Pages work afterwards: ✅
| Page | Result |
|---|---|
| \`/scheduler/calendar\` | loads (week 19–25 Oct), no bounce |
| \`/scheduler/reports\` | loads |
| \`/scheduler/som\` | loads |
| \`GET /api/calendar\` | **200** |

**0** bounces to \`/login\`. (No network drop during the run; TEST-117's lesson noted.)

## 3 · 🟡 O1: the front session expiry vs the token expiry
| Read (same login) | Front session \`expires\` | Token \`exp\` | Session − token |
|---|---|---|---|
| t0 13:55:36 | 2026-11-01 13:55:35 | 2026-11-01 13:55:30 | **+6 s** |
| +65 s (after a page load) | 2026-11-01 13:56:44 | 13:55:30 | **+74 s** |
| +130 s | 2026-11-01 13:57:49 | 13:55:30 | **+139 s** |

- The front session's reported \`expires\` is **"now + 7 days" at every read** (it rolls); **the token's \`exp\` is fixed** at login + 7 days.
- So with daily use, the reported session end drifts later than the token's.
- **Not judged by me.** It may be only how \`/api/auth/session\` reports a rolling expiry, while the app still ends the session at the token's \`exp\` (the deploy note's intent: the login page, not a mid-action logout).
- **Settles it:**
  - (a) Sober reading the front session code;
  - or (b) the owner's short \`JWT_TTL_SECONDS\` test on sid (e.g. 600 s): at about 10 min, does the next page go cleanly to the login page, or does a click fail mid-action?
- (b) needs an env change, so it's the owner's (Porter's brief). **I didn't do it.**

## 4 · A disabled user is still signed out on the next click: 🔒 DR-3
- **Needs:** a session **as a QA user** on sid. An admin disables that user (Users page), then the user's next click must land on the login page. Then re-enable, restored exactly.
- **Why I stopped:** signing in on sid as a QA user (typing its password) needed the owner's written exception last time ("อนุญาต b", TASK-111 only, ended at its close). So I didn't do it on my own.
- **DR-3, pick one:**
  - **(a)** the owner allows me, in writing in \`inbox/QA.md\`, **one** headless login on sid as a named QA user (e.g. \`qa-nostatus-077\`, enabled, \`menu:calendar\` + \`menu:teachers\`) for this check only. I disable it from the admin, click once, re-enable it, and read it back.
  - **(b)** the owner does the same by hand.

**Scripts (scratchpad):** \`t836.js\` (login, token, pages), \`t836b.js\` (session vs token over 130 s). Read only after login; nothing written.
