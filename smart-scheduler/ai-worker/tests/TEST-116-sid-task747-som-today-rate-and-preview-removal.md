# TEST-116: TASK-747 (SOM Today % = the Daily Report %) + Palm's preview removal, on sid

- **QA:** Tanya
- **Date:** 2026-10-22
- **Environment:** sid: back **`d9c0cf3`** (TASK-747) + the served front (see §2: it is Palm's **`e7ec71d`**, the preview removed)
- **Brief:** Porter's ⏸️ / ▶️ TASK-747 entries of 2026-10-22 in `inbox/QA.md`
- **Evidence:** `project-docs/qa-2026-10-22/task747/`

**Verdict: ✅ PASS.**
- SOM's Today % = the Daily Report's % (API and screen), **including a day with children on leave**.
- **sid's served JS no longer contains the preview layer.**
- A failed pop-up request shows an **error, not invented children**.
- The SOM cards = the API.

## 1 · Today's % (TASK-747)
SOM's `today` is the server's Bangkok "today" and has no date parameter, so the live comparison is **today, 22 Oct**. That covers the leave case: today has 2 children on leave.

| Case | SOM `today` | Daily Report | |
|---|---|---|---|
| **22 Oct, all branches** (4 attended · 4 confirmed · **2 on leave**) | `attendanceRate` **67** | `attendanceRate` **67** = 4 ÷ (4 + 2) | ✅ (the old SOM formula, attended ÷ confirmed, would have said 100) |
| **No booking ⇒ 0** | a branch filter with no bookings today: confirmed 0 · attended 0 · rate **0** | 6 Dec (no bookings: TB 0): rate **0** | ✅ |
| **On screen, today** | SOM card "Attendance **67%**" (`som-today.png`) | Daily Report "**67%** Attendance rate" (`daily-today.png`) | ✅ the same |

- A past day can't be compared for SOM (it has no date input).
- The legacy `today.expected` (15) is still in the API; the page doesn't use it.

## 2 · Is the preview layer gone from sid's served JS? Yes
- The local `dong` is now `e7ec71d` ("Remove the SOM preview figures and legacy fallbacks"), and `src/lib/som/` no longer exists.
- **Served JS of `/scheduler/som` (86 chunks):** **0** chunks contain any of the 8 strings that existed **only** in the old `lib/som/preview.ts` (ปากเกร็ด, นนทบุรี · เมืองภูเก็ต, ภูเก็ต · สนใจคอร์สต่อหลังจบ · ขอครูคนเดิม · Voucher 15 hrs · น้องโอบอุ้ม · น้องคิริน · Course 6 · Skate).
- ⚪ Two strings that were in BOTH the preview and the **mock-mode data** (`services/som-report.service.ts`: "น้องข้าวหอม", "บางรัก, กรุงเทพมหานคร") are still in 4 chunks. That is the mock dataset, used only when `NEXT_PUBLIC_USE_MOCK=true`; on sid the screen = the API (§3), so mock is off. Listed, not judged.
- My first scan looked only for those shared strings and read "preview still present"; the preview-only markers corrected it.

## 3 · The New-vs-Renewing pop-up when its request fails: ✅ an error, no invented children
- I made **only my own browser** answer `GET /reports/som/new-vs-renewing/*` with a 500. Nothing was sent to the server; read only.
- Clicking "New Course this month" ⇒ *"Couldn't load the list · Try again"*, **0 rows, 0 invented names** (`nvr-request-failed.png`).

## 4 · SOM regression (Oct, sid): ✅ screen = API, card for card
| Card | Screen = API |
|---|---|
| Today · Confirmed / Attended / Attendance % | 4 / 4 / **67%** |
| Active course · Active voucher | 40 · 13 |
| 1st Trial (3 months) · 1 HR (3 months) · Total customers | 4 · 25 · 52 |
| NvR: 1st Trial · New this month · New previous month · Renew · 1st Trial no course · Not renewed | 1 · 9 · 3 · 5 · 1 · 13 |
| Each of the 6 pop-ups: rows = API detail = card | ✅ |

Not renewed is 13 today (12 in TEST-114): the data moved, and the screen and API moved together.

## Clean-up
Nothing written. No fixture was needed (today already had children on leave). Read only.

**Scripts (scratchpad):**
- `t747.js`: rate, screens, a first JS scan, the forced-error pop-up.
- `t747b.js`: the preview-only markers, the empty day.
- `t747c.js`: the SOM regression.


## §re-run on the deploy Porter confirmed (back `d9c0cf3` + front `e7ec71d`, 2026-10-22)
The same three scripts were re-run after Porter's "deployed" message, so the result is tied to that deploy. **Identical results:**
- **Rate:** SOM 67 = Daily 67 (2 on leave) and **67% on both screens**; no booking ⇒ 0.
- **Preview:** 0 of 86 chunks carry a preview-only string.
- **Forced error:** the NvR pop-up shows *"Couldn't load the list · Try again"*.
- **Regression:** all 14 SOM cards + 6 pop-ups = the API.

**✅ PASS stands.** (My first run already met this build: the owner had deployed before it.)


---
# §uat: READ-ONLY smoke · uat = back `d9c0cf3` + front `e7ec71d` · 2026-10-22
**Verdict: ✅ PASS. 0 app writes** (the guard aborted only Cloudflare's `/cdn-cgi/rum` beacon). No forced errors on uat (as asked). Counts only.

| Check | Result | |
|---|---|---|
| **Today (22 Oct), API** | SOM `today.attendanceRate` **86** (19 attended, 19 confirmed) = Daily **86** = 19 ÷ (19 + **3 on leave**) | ✅ |
| **Today, on screen** | SOM card "Attendance **86%**" · Daily Report "**86%**" | ✅ the same |
| **A past day (18 Oct)** | SOM has no date input, so it has no past-day value. The Daily Report's rate there = 82 = 94 ÷ (94 + 21), by value (the formula SOM now reuses) | ✅ |
| **Served JS** (62 chunks of `/scheduler/som`) | **0** preview-only strings | ✅ |
| **SOM Oct cards, screen = API** | Today 19 · 19 · 86% · Active course 189 · Active voucher 48 · 1st Trial 164 · 1 HR 95 · Total 349 · New this month 29 · New prev month 18 · Renew 35 · 1st Trial no course 87 · Not renewed 29 | ✅ all 13 |
| **NvR pop-ups** (New this month · Renew · Not renewed) | rows on screen = API (29 · 35 · 29) | ✅ |
| **Daily 18 Oct, All, Others Program** (no programme children) | *"Group — — · ECA — — · Camp — — · Other — —"* | ✅ still no sample |

⚪ **uat was unstable during this smoke:**
- the first two runs couldn't finish logging in (the session came back empty / "Failed to fetch");
- a plain request for the login page took 10–19 s and once answered **522** (Cloudflare: origin timed out).
- The third run went through. Nothing was written in any run.

**Script:** `u116.js` (lib-uat).
