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


## Pass 3 · 19:02 (the "~18:00" pass; my scheduled 18:03 run fired late, so labelled by its real time)
| Run (start) | Login | Schedule page | Week change | Search (screen) | API /calendar (week) | API search |
|---|---|---|---|---|---|---|
| #1 19:02:08 | 4,637 ms | 2,700 ms | 980 ms | 99 ms | 600 ms · 200 | 290 ms · 200 |
| #2 19:02:20 | 6,743 ms | 2,770 ms | 1,121 ms | 50 ms | 614 ms · 200 | 89 ms · 200 |
| #3 19:02:34 | 5,482 ms | 2,206 ms | 1,127 ms | 44 ms | 582 ms · 200 | 302 ms · 200 |
| **Median** | **5.5 s** | **2.7 s** | **1.1 s** | **0.05 s** | **0.60 s** | **0.29 s** |

**0** login failures · **0** 5xx / 522 · **0** forced logouts.

## The day (Sun 25 Oct 2026), medians of 3 runs each
| Pass (real time) | Login | Schedule page | Week change | Search (screen) | API /calendar (week) | API search | Errors / 522 / logouts |
|---|---|---|---|---|---|---|---|
| 0 · 01:58 night | 3.9 s | 2.1 s | 0.9 s | 0.06 s | 0.56 s | 0.21 s | 0 / 0 / 0 |
| 1 · 13:44 | 3.9 s | 2.2 s | 1.0 s | 0.06 s | 0.66 s | 0.10 s | 0 / 0 / 0 |
| 2 · 17:55 | 4.0 s | 2.65 s | 0.96 s | 0.06 s | 0.55 s | 0.16 s | 0 / 0 / 0 |
| **3 · 19:02** | **5.5 s** | **2.7 s** | **1.1 s** | **0.05 s** | **0.60 s** | **0.29 s** | **0 / 0 / 0** |

(The scheduled 10:03 / 16:03 / 18:03 runs each fired late; the real times are above. No pass hit the morning 10:00 slot.)

## Verdict (numbers only; no cause)
- **No slowdown of the size the customer describes, and not one error, 522 or forced logout in 12 runs today.**
- **What does move from night to evening:**
  - the schedule page's first load, **2.1 s → 2.7 s** (+0.6 s);
  - the login, **3.9 s → 5.5 s** (+1.6 s, with one 6.7 s run at 19:02).
- The week change, the API calls and the in-page search stay flat.
- **This is a Sunday**, so the shop's load may be unlike a weekday afternoon. **The customer's report is about weekdays from about 15:00.** A weekday re-run (≈ 15:30 / 17:00) would compare like with like; Porter's call.
- The long-session logout earlier today was a test artifact (see the CORRECTION above). **No uat logout was observed today.**


---
# Weekday re-run, Mon 26 Oct 2026 (Porter's GO; the afternoon 13:00–17:00 weighted)
- **Planned passes** (same script `u117.js`, 3 runs each, uat read only, normal use): **10:07 · 13:07 · 14:37 · 15:37 · 16:37 · 18:07**.
- They are scheduled in my session only. If a pass is missing here by the evening, the session was closed: nudge me and I run it by hand.
- **Today the jobs fired up to an hour late**, so each pass is labelled by its real start time.
- Results and a Monday-vs-Sunday table follow below as the passes run.


### Side observation (low weight): an IDLE uat tab, logged in ~02:00, was sent to /login at 17:55:13
- **What it was:** my first long-session watcher (started 02:00). It crashed in its own log formatting at 02:00:26, right after the login succeeded, so its loop never ran. Its headless tab stayed open on uat, **logged in and idle**: no checks, no clicks.
  - The second watcher, the one with the 09:33 network artifact, is a different process.
- **What it caught:** at **17:55:13** that idle tab was **navigated to `/login`** by the app itself. The process ended at ~21:3x.
- **By value:**
  - that login's token would have expired at ≈ **14:00** (login + 12 h, as the second watcher measured);
  - the bounce came ≈ **3 h 55 min after the expiry**, not at it. An idle tab notices only when something makes it check.
  - **The bounce came seconds before my 17:55 pass's first admin login finished** (run 1 ended 17:55:31). The same account logged in at **13:44**, while this tab's token was still valid, and that did **not** bounce it.
  - ⇒ This is **not** "one session per user" (a new login doesn't kick an open tab). The trigger at 17:55 is unknown; most likely the app's own session re-check firing after the expiry.
- **What it adds to L1 (the 12 h token):** consistent with it. An open tab is logged out some time after login + 12 h, at the next session check, not exactly at 12 h.
  - **Weak:** one idle headless tab, and the trigger isn't identified.
  - **Not a 7-day check:** uat is still on the 12 h build, and TASK-836 (7 days) is on sid only.
- **Monday:** the planned weekday timing passes are unchanged. I won't start a new long watcher unless Porter wants one, since TASK-836's 7-day token makes L1 moot once it reaches uat.


## Weekday re-run, Mon 26 Oct: ⚠️ only ONE pass ran (19:13). The 10:07 / 13:07 / 14:37 / 15:37 / 16:37 / 18:07 passes were all MISSED
- **Why:** they were scheduled in my session only, and the session wasn't running during the day. The prompts arrived together at ~19:10.
- **So there's no weekday-afternoon data,** which is the slot the customer reports (from ~15:00). I ran the one pass I could, at its real time.

### Pass · 19:13 (Mon)
| Run (start) | Login | Schedule page | Week change | Search (screen) | API /calendar (week) | API search |
|---|---|---|---|---|---|---|
| #1 19:13:11 | 4,872 ms | 2,355 ms | 1,101 ms | 50 ms | 891 ms · 200 | 85 ms · 200 |
| #2 19:13:24 | 3,924 ms | 2,653 ms | 975 ms | 57 ms | 631 ms · 200 | 98 ms · 200 |
| #3 19:13:34 | 5,058 ms | 2,638 ms | 1,283 ms | 67 ms | 670 ms · 200 | 98 ms · 200 |
| **Median** | **4.9 s** | **2.6 s** | **1.1 s** | **0.06 s** | **0.67 s** | **0.10 s** |

**0** login failures · **0** 5xx / 522 · **0** failed requests · **0** forced logouts.

### Monday next to Sunday (medians)
| Pass | Login | Schedule page | Week change | API /calendar | API search | Errors / 522 / logouts |
|---|---|---|---|---|---|---|
| Sun 01:58 (night) | 3.9 s | 2.1 s | 0.9 s | 0.56 s | 0.21 s | 0 / 0 / 0 |
| Sun 13:44 | 3.9 s | 2.2 s | 1.0 s | 0.66 s | 0.10 s | 0 / 0 / 0 |
| Sun 17:55 | 4.0 s | 2.65 s | 0.96 s | 0.55 s | 0.16 s | 0 / 0 / 0 |
| Sun 19:02 | 5.5 s | 2.7 s | 1.1 s | 0.60 s | 0.29 s | 0 / 0 / 0 |
| **Mon 19:13** | **4.9 s** | **2.6 s** | **1.1 s** | **0.67 s** | **0.10 s** | **0 / 0 / 0** |

### Verdict so far (numbers only; no cause)
- **Mon 19:13 ≈ Sun 19:02:** every step is within ~0.6 s, no step reaches 2× a Sunday median, and there's no error, 522 or logout.
- **The weekday afternoon (13:00–17:00) is still UNMEASURED.** This pass says nothing about it.
- **To close it:** the passes must run while a session is open in the afternoon, by hand or with an open session. That's Porter's call (e.g. Tue 27 Oct, 14:30 / 15:30 / 16:30).


## Weekday afternoon by hand, Tue 27 Oct (Porter's decision, inbox/QA.md 10-26)
- **Planned:** ~10:03 (morning baseline), ~14:31, ~15:31, ~16:31. The same `u117.js`, 3 runs each, uat read only.
  - If uat is deployed before a pass, that pass's row notes the build.
  - The 16:31 pass closes TEST-117 with the full day table.
- ⚠️ **They are scheduled in my session only, the same as Monday.** If the session isn't running at those times they are missed again. **The fix:** keep my session open on Tue afternoon, or nudge me at the time and I run the pass by hand (`node u117.js tue-HHMM 3`).
