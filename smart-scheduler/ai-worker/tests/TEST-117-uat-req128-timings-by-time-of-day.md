# TEST-117: REQ-128, uat timings by time of day (slow from ~15:00 + logouts), READ ONLY

- **QA:** Tanya
- **Date:** 2026-10-25 (Bangkok)
- **Environment:** uat (`frontoffice.develyst.online`), as deployed (back `d9c0cf3` + front `e7ec71d` per TEST-116)
- **Brief:** Porter's ▶️ TEST-117 entry in `inbox/QA.md`; `requirements/REQ-128-uat-slow-afternoons-and-logouts.md`

## Method (the same every pass)
- **3 runs per pass.** Each run is a fresh headless browser doing ONE normal admin session, one after the other (no parallel load, no hammering).
- **Read only:** every non-GET is aborted except NextAuth's own login. Counts and timings only in this file.

| Step | What is timed |
|---|---|
| **Login** | open `/login` → the session token exists |
| **Schedule page** | open `/scheduler/calendar` → the first grid cell is on screen |
| **Week change** | Weekly view → click "next" → the `/api/calendar` answer + the grid back on screen |
| **Search (screen)** | type one letter in "Find student" → the screen redrawn (2 animation frames). **This search is a filter of the week already loaded, in the browser: it makes no server call** (`CalendarHeader.tsx` → `studentQuery`). |
| **API `/calendar` (week)** | one GET in the same session |
| **API search** | one GET `/students?search=…&limit=50` (the server-side student search the booking pickers use) |

**Recorded:** every HTTP ≥ 500 / 522, every failed request, every login that never gets a session, and every bounce back to `/login` after login (= a forced logout), each with its time.

## Pass 0 · night baseline, 01:58 (Sun 25 Oct)
| Run (start) | Login | Schedule page | Week change | Search (screen) | API /calendar (week) | API search |
|---|---|---|---|---|---|---|
| #1 01:58:06 | 4,068 ms | 2,094 ms | 937 ms | 62 ms | 555 ms · 200 | 220 ms · 200 |
| #2 01:58:16 | 3,871 ms | 2,115 ms | 863 ms | 51 ms | 551 ms · 200 | 95 ms · 200 |
| #3 01:58:26 | 3,783 ms | 2,092 ms | 1,336 ms | 61 ms | 565 ms · 200 | 213 ms · 200 |
| **Median** | **3.9 s** | **2.1 s** | **0.9 s** | **0.06 s** | **0.56 s** | **0.21 s** |

**0** login failures · **0** 5xx / 522 · **0** failed requests · **0** forced logouts.

- **Discarded, my own script's fault:** an earlier attempt (01:53–01:56) "failed" 3 logins at about 68 s each. My script **filled** the login fields instead of typing them, and the login form only takes typed input. With typing (as my usual uat login does) it logs in in about 4 s. Not uat's fault; not counted.
- One diagnostic run at 01:57 is also not counted (it timed the search wrongly before I found it is client-side).

## Passes to come today: ~10:00, ~16:00, ~18:00
- They are scheduled in my session for **10:03, 16:03 and 18:03**. They run only while this session stays open.
- If a pass doesn't appear here, the session was closed. Nudge me and I run it by hand.
- After 18:00: a day table (night / 10:00 / 16:00 / 18:00) and a verdict, numbers only. **Nothing about a cause**; that is Otto's (the server) and Sober's (the app).

**Script:** `u117.js` (scratchpad; results also in `u117-results.jsonl`).


## Long session (Sober's suspect L1): one login, the tab kept open
- **How:** ONE uat admin login, the tab kept open in a background headless browser.
  - Every **10 min** the tab does what an open tab does: read `/api/auth/session` + ONE GET `/api/calendar` (week). Read only.
  - It stops itself at the first logout or after 15 h.
  - Log: scratchpad `u117-long.log`.
- **Logged in: 2026-10-25 02:00:44.**
- **The API token itself says it expires at 14:00:44**, i.e. **exactly 12 h** after login.
  - Its claims are `sub, username, role, isSuperAdmin, exp`, with **no `iat`**. The token value is never printed.
- **Expected if L1 holds:** the first 401 / forced logout at ≈ **14:00**. **The actual time is recorded here when it happens** (it needs this session to stay open).


## Pass 1 · 13:44 (the "~10:00" pass; my scheduled 10:03 run fired late, so this is a midday point, labelled by its real time)
| Run (start) | Login | Schedule page | Week change | Search (screen) | API /calendar (week) | API search |
|---|---|---|---|---|---|---|
| #1 13:44:17 | 4,564 ms | 2,151 ms | 855 ms | 57 ms | 461 ms · 200 | 98 ms · 200 |
| #2 13:44:28 | 3,913 ms | 2,194 ms | 994 ms | 56 ms | 655 ms · 200 | 70 ms · 200 |
| #3 13:44:38 | 3,915 ms | 2,123 ms | 1,189 ms | 56 ms | 686 ms · 200 | 134 ms · 200 |
| **Median** | **3.9 s** | **2.2 s** | **1.0 s** | **0.06 s** | **0.66 s** | **0.10 s** |

**0** login failures · **0** 5xx / 522 · **0** forced logouts. About the same as the night baseline.

## Long session: RESULT. The session ended at 09:33, NOT at the token's 12 h
| Time (Bangkok) | Since login | Seen |
|---|---|---|
| 02:00:44 | 0 | logged in; the API token's own `exp` = 14:00:44 |
| 03:01 → 09:03 (hourly lines) | +1.0 … +7.0 h | session has its token; `GET /api/calendar` = **200** every time |
| **09:33:33** | **+7.55 h** | **`/api/auth/session` no longer has an API token: the tab is logged out** |

- So the forced logout came **4 h 27 min BEFORE the token's own expiry** (14:00:44).
- The last good check was **09:23** (the watcher checks every 10 min and writes an "ok" line once an hour), so **the session was lost between 09:23 and 09:33**.
- That does not match "the 12 h token runs out" (L1) by itself. **Something ended the login session in that 10-minute window.** I don't know what: a restart, a deploy, a secret or session-store change, or a session lifetime other than the one Sober read. That is for Otto (server logs / PM2 restarts around 09:23–09:33) and Sober.
- Read only throughout; no writes.


## ⚠️ CORRECTION to "Long session: RESULT" (2026-10-25, from Porter / the owner)
- **The 09:33 "logout" was not uat.** The owner's machine (where my watcher ran) **lost its internet connection** at that time.
- **And my watcher couldn't tell the difference:** when the session read itself fails (no network), my code takes the empty answer as "the session has no token" and logged it as a logout. **That was a misclassification in my script; it is a test artifact.**
- **So:** no forced logout of uat was observed. **L1 (the 12 h token) is neither confirmed nor ruled out** by this run. What stands: the token's own `exp` = login + 12 h exactly.
- **No new 12 h watch** (Porter's call).
- If one is ever re-run, the check must record "no network" separately from "logged out".


## Pass 2 · 17:55 (the "~16:00" pass; my scheduled 16:03 run fired late, so labelled by its real time; inside the customer's "from about 15:00" window)
| Run (start) | Login | Schedule page | Week change | Search (screen) | API /calendar (week) | API search |
|---|---|---|---|---|---|---|
| #1 17:55:31 | 4,710 ms | 2,663 ms | 961 ms | 62 ms | 743 ms · 200 | 108 ms · 200 |
| #2 17:55:43 | 3,978 ms | 2,654 ms | 1,125 ms | 51 ms | 550 ms · 200 | 161 ms · 200 |
| #3 17:55:54 | 3,999 ms | 2,179 ms | 952 ms | 56 ms | 478 ms · 200 | 217 ms · 200 |
| **Median** | **4.0 s** | **2.65 s** | **0.96 s** | **0.06 s** | **0.55 s** | **0.16 s** |

**0** login failures · **0** 5xx / 522 · **0** forced logouts.

### So far today (medians)
| Pass | Login | Schedule page | Week change | API /calendar | API search | Errors / logouts |
|---|---|---|---|---|---|---|
| 0 · 01:58 (night) | 3.9 s | 2.1 s | 0.9 s | 0.56 s | 0.21 s | 0 / 0 |
| 1 · 13:44 | 3.9 s | 2.2 s | 1.0 s | 0.66 s | 0.10 s | 0 / 0 |
| **2 · 17:55** | **4.0 s** | **2.65 s** | **0.96 s** | **0.55 s** | **0.16 s** | **0 / 0** |

- At 17:55 the schedule page's first load is about **0.5 s slower** than at night (2.65 vs 2.1 s).
- Everything else is the same. **No slowdown of the size the customer describes**, and no error, in this pass.
- This is one quiet Sunday-evening sample (3 runs), not a weekday at peak; listed, not judged.
