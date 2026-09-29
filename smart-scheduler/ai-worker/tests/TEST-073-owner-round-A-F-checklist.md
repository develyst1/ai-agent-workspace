# TEST-073: OWNER ROUND (A–F) — sid, 2026-09-25 (started ~20:19)

- Source: Porter's owner-order A–F checklist (uat waits on a full PASS). One row per item, PASS / FAIL /
  BLOCKED / PENDING + reason, §1b screenshots.
- ⏰ **Timing note:** I started at **20:19**, past the **17:30 day-end**. Every "today class before 17:30"
  item is therefore BLOCKED tonight (K5, and the missed-class paths). I completed the parts that don't need
  that window and booked a **21:00 fixture** (the pre-class check-in window is 100 min, so 21:00 is checkable
  now) to run the REQ-108 happy path.
- This is a large round; the phone-heavy items (C/D/E/F, K4-LINE) are honestly marked **PENDING — need a
  continuation session**; I did not fake untested rows.

## A. REQ-108 shop-front QR
| Item | Result |
|---|---|
| Settings → shop-front QR panel shows the QR **and** the URL text | ✅ **PASS** — renders the QR + "Check in at the shop" + `https://som.develyst.online/checkin/shop` + Copy/Print (`req108-settings-qr-panel.png`) |
| 1. Happy path | ✅ **PASS** — booked asda a 21:00 fixture; `/checkin/shop` → entered 0900000092 → **only asda** listed ("asda · 25/Sep/26 · 21:00–22:00 · Private FREESKATE · Teacher Toth") → tap → **"Check-in complete"** (Student asda / Subject Private FREESKATE / Teacher Toth / Time 2026-09-25 21:00–22:00 / **+10 points**). Matches the LINE-flow shape. |
| 1b. Admin: seat ATTENDED + source shows "shop QR" | 🟡 **PARTIAL / FLAG** — the check-in completed (page confirmed). BUT `checkin_source` (value `shopfront-qr`, `checkin.service.ts:75`) appears **stored only** — I found **no admin DTO/UI surface** that displays it (not in the booking DTO mapper, not in BookingModal). **"Source shows in admin" may not be visible anywhere — @Sober/@Jason: where is it meant to show?** |
| 2. Neutral screen, identical, no names | ✅ **PASS (2/4 cases)** — no-class-in-window (0900000092 post-check-in) and non-customer (0999999999) both show the **same** "Nothing to check in right now. Please ask the front desk.", **no names**. Suspended case = under **D**; empty-list = same neutral. |
| 3. Next family sees nothing | ✅ **PASS** — "Done — next family" returns to the empty phone screen, no leftovers. |
| 4. Rate limit (N failed lookups) | ⛔ **PENDING** — not run tonight. |
| 5. Window (outside / already-settled cannot check in) | ⛔ **PENDING** — needs a settled/out-of-window fixture; overlaps K5 (time-blocked). |
| 6. Camp day (don't overturn a staff absence) | ⛔ **PENDING** — needs a camp fixture. |

## B. REQ-107 K4 / K5
| Item | Result |
|---|---|
| K4 — check-in pick carries `Teacher <name>` | 🟡 the shop-QR list showed **"Teacher Toth"** ✓; the **LINE** เช็คอิน pick + leave pick (TH & EN) not re-run tonight = **PENDING**. |
| K5 — late-window (default 0 ⇒ "too late"; set 60 ⇒ post-end before 17:30 succeeds via LINE button AND `/checkin` link; settled ⇒ "too late"; reset 0) | ⛔ **BLOCKED** — it is **20:19, past the 17:30 day-end**. The "post-end before 17:30" and "missed class" paths need that window. **Run before 17:30** (with a today fixture). I did NOT change the `checkin_late_minutes` setting (it stays at 0). |

## C. TASK-477 (un-mute reply language + blank line; quick-reply chips = the 4 menu commands TH+EN; 3rd chip opens COURSE view; "children" lists children)
⛔ **PENDING** — phone/LINE test, needs a continuation session. (Round-2 note already flagged the un-mute reply had no blank line + an old chip name; this verifies the fix.)

## D. TASK-476 (old `/checkin?token=…` + camp REFUSE a suspended family; refusal shows no class details)
⛔ **PENDING** — needs a fixture family suspended then un-suspended; not run tonight.

## E. Teacher menu (via demo phone as a fixture TEACHER)
⛔ **PENDING** — needs unlink the demo phone → link as a fixture teacher (approve as super admin) → check the 2-cell teacher menu / ตารางของฉัน / ภาษา → unlink → re-link 0900000092 as parent → 6-cell. A full phone block; continuation.

## F. Regression (Sign Up reply · Chat-with-Admin reply · collapsed menu · My Course · leave confirmation with child name)
🟡 **PASS from round 2** (TEST-071): all five verified there (Sign Up "…สมัครสมาชิก/…sign up", Chat-with-Admin exact wording, collapsed default, My Course `[Remain: x/y] *EXPIRE`, leave confirmation names the child). A fresh re-spot-check tonight = PENDING.

## Footprint (tonight)
- Booked then **cancelled** the 21:00 fixture (asda, FIRST_TRIAL, `9e95ab21`). Clean (CANCELLED residue).
- Did NOT change any Settings value (checkin_late_minutes stays 0). Demo link intact (0900000092 → customer).
- Pre-existing open: asda's 24/10 & 31/10 leaves (the TEST-072 finding — no admin reversal).

## Bottom line for @Porter
**REQ-108 core PASSES** — the Settings QR panel, the happy-path check-in, the neutral screen, and the
next-family reset all work. **One flag:** the check-in **source ("shop QR") does not appear to be surfaced in
admin** — needs Sober/Jason to say where (or it's a gap). **K5 is time-BLOCKED** (past 17:30). The phone-heavy
items (rate-limit, window, camp, K4-LINE, C, D, E, F) need a **continuation session**, and K5 needs a run
**before 17:30**. I did not mark untested items PASS.

## Evidence — `../project-docs/qa-2026-09-25/`
- `req108-settings-qr-panel.png` — Settings QR panel (QR + URL text).
- `req108-neutral-screen.png` — the neutral "Nothing to check in" screen (no names).

---

## RE-RUN after Porter's bounce (2026-09-25, ~20:40) — REQ-108 now evidenced; K5 premise corrected
Fixed the two bad evidence points and corrected the K5 premise (day-end settles only pre-17:30 sessions, so an
evening fixture is unsettled). Used the 100-min pre-window + a `late=60` setting to make evening classes checkable.

| Item | Result | Evidence |
|---|---|---|
| Settings QR panel (logged in, URL visible) | ✅ **PASS** — RE-SHOT correctly | `req108-settings-qr-panel.png` (now the real panel, QR + `som.develyst.online/checkin/shop`) |
| 1. Happy path — child list + success | ✅ **PASS** | `req108-child-list.png` (only asda listed, "Private FREESKATE · Teacher Toth") + `req108-k5-checkin-success-late60.png` ("Check-in complete", asda / Private FREESKATE / Toth / 19:00–20:00 / **+10 points**) |
| 1b. Admin ATTENDED | ✅ **PASS (API-confirmed)** — the 19:00 fixture seat = **ATTENDED** after the shop check-in (bookings query). 🔴 **but the calendar grid is only 09:00–17:00**, so an evening fixture (required to be unsettled + checkable at this hour) does not appear in the calendar or daily report. |
| 1b. Source = "shop QR" in admin | 🔴 **FLAG (to @Sober)** — `checkin_source` (`shopfront-qr`) is **stored** but appears in **no** DTO/view: calendar, `/bookings?studentId`, and `/reports/daily` all return `src = n/a`. There is no admin surface that shows the source. |
| 2. Neutral screen, identical, no names | ✅ **PASS** — no-class + non-customer both "Nothing to check in right now", no names | `req108-neutral-screen.png` |
| 3. Next family sees nothing | ✅ **PASS** — "Done" → empty phone screen, no leftovers |
| 4. Rate limit | ✅ **PASS** — **live probe:** misses #1–5 = 200, **#6 = 429 RATE_LIMITED**; once the 5-miss/IP/10-min cap is hit, even a valid family (0900000092) gets 429. Successes don't add misses. |
| 5. Window (outside / settled ⇒ cannot check in) | 🟡 the /checkin/shop **list excludes** out-of-window classes (so they can't be tapped); the **"too late"** wording lives on the direct paths (LINE button / `/checkin?token`), which are phone/token-bound — see BLOCKED. |
| K5(b) — post-end check-in before day-end, `/checkin/shop`, late=60 | ✅ **PASS** — the ended 19:00–20:00 class checked in (proof above). |
| K5 — LINE button + `/checkin` link paths; late=0 ⇒ "too late"; settled ⇒ "too late" | ⛔ **BLOCKED** — see the phone blocker; the `/checkin?token` path needs the per-booking token (not exposed to QA). |
| 6. Camp day | ⛔ **PENDING** — needs a camp fixture; not run. |

## 🔴 HARD BLOCKER for the phone items (K4-LINE, K5-LINE, C TASK-477, D-via-LINE, E teacher-menu, F)
**The demo phone auto-locked and now requires a PIN.** A swipe-up reveals the secure lock screen (screencap
returns a black 7,923-byte frame = a DRM/secure surface). I cannot enter a PIN (it is the owner's, and
unlocking is not mine to do). **These items cannot run until the owner unlocks the demo phone.** This is an
external blocker, not "a continuation" — every LINE/phone row is gated on it.

- **K4 note:** the SHOP-QR pick already shows **"Teacher Toth"** (`req108-child-list.png`), i.e. the pick
  carries the teacher name on that surface; the LINE เช็คอิน/แจ้งลา picks specifically remain phone-gated.

## Also temporarily self-limited
After the rate-limit probe, **my test IP is 429-blocked on the shop lookup for ~10 min** — so re-running any
`/checkin/shop` lookup from here (window negative, D-suspended-via-lookup) is refused until it clears. The
phone is on mobile data (a different IP) and would not be affected — but it is locked.

## Footprint (this re-run) — cleaned
- `checkin_late_minutes` set to 60 for the K5 test, **reset to 0** ✅.
- Fixtures booked + **cancelled**: 19:00 (asda, was ATTENDED), 18:00 & 20:00 (temp), and the earlier 21:00.
- Demo link intact; no menus/settings left changed.

## Updated bottom line
REQ-108 is now **properly evidenced and largely PASSES** (Settings QR, happy path, next-family, neutral, rate
limit, admin ATTENDED) with **one real FLAG** (source not surfaced in admin — @Sober). K5(b) via /checkin/shop
PASSES. **Everything phone/LINE-based (K4-LINE, K5-LINE, C, D, E, F) is hard-BLOCKED by the locked demo phone
— the owner must unlock it.** Camp + the direct-path "too late" remain to run.

---

## PHONE BLOCK (owner unlocked the demo phone, ~20:55–21:06)
| Item | Result | Evidence |
|---|---|---|
| **C — TASK-477** | ✅ **FULL PASS** — (1) the un-mute (`reopen`) reply is now in the **chat's language (TH-only)** with the **blank line**; (2) the 4 quick-reply chips are the menu commands, and the old "นักเรียนของฉัน" (children) chip is **replaced by "คอร์สของฉัน"**; (3) the course chip **opens the COURSE view** (My Course list); (4) typing **"children"** still lists the children ("นักเรียนของคุณ (4/5): มิลล่า, มิลลิม, asda, temp"). | `req107-C-task477-reopen-chips.png`, `req107-C-course-chip.png`, `req107-C-children-typed.png` |
| **K5 — LINE button check-in (in-window)** | ✅ **PASS** — with a class in progress, LINE **เช็คอิน** → "**Checked in ✅ / temp: Private FREESKATE / Teacher Toth @ 20.00**". | `req107-K4-checkin-pick.png` |
| **K4 — check-in carries `Teacher <name>`** | ✅ the check-in line reads "temp: Private FREESKATE / **Teacher Toth** @ 20.00" (name present). (One-class case auto-completes, so the multi-option PICK **buttons** weren't shown — the format carries the teacher name.) | same shot |
| **K5 — "too late" (late=0, ended class), LINE** | 🟡 **FLAG** — LINE เช็คอิน on an ended class (late=0) replied "**โทเคนเซ็คอินหมดอายุแล้ว**" (check-in **token expired**), **not** the "too late" (สายเกินไป) wording K5 specifies. @Sober — is the LINE surface's message meant to be "token expired", or should it match the scan's "too late"? | `req107-K5-toolate-late0.png` |
| **E — teacher menu via the demo phone** | 🔴 **BLOCKED / FINDING** — I created a fixture teacher (`QATtest`), cleared the parent link, and tried to enter the teacher-link path. But the LINE flow has **no role picker**: typing `register` → "type **Next**" → **Next** → "Please enter your phone number" — it goes straight to the **customer** phone entry, with **no "teacher" option** anywhere. So a teacher cannot self-link from the demo phone on this build (the `CHOOSE_ROLE`/`askRole` picker in `line-webhook.service.ts:1267` is not reached; register maps to the customer-only "Next→phone" flow). **@Sober/owner: what is the actual teacher-link entry?** (Or the role picker was dropped and this is a gap.) |
| **F — regression** | ✅ re-confirmed the pieces seen tonight: Chat-with-Admin reply, My Course format (via the course chip), the collapsed menu; Sign-Up + leave-child-name passed in round 2 (TEST-071). |

## Fixtures / footprint (phone block) — cleaned
- Fixture teacher `QATtest` (c70611ec) **archived**. Parent link **cleared then re-linked** (0900000092 → parent,
  `lineLinked: true`) via the chat phone flow → demo restored. No pending teacher-link requests left.
- (Earlier: check-in fixtures cancelled, `checkin_late_minutes` back to 0.)

## Still not run (specific reasons)
- **K4 leave PICK buttons** — needs a child with **2+ leavable** sessions (asda's are spent; temp has none
  booked as leavable). Would need a fresh multi-session course fixture.
- **D — TASK-476 suspended `/checkin?token`** — needs a per-booking **check-in token** (not exposed to QA) +
  a suspend/un-suspend fixture.
- **K5 scan "too late" / REQ-108 window / camp** — the shop-checkin endpoint is rate-limited from my IP after
  the rate-limit probe; camp needs a camp fixture.

## Net status
REQ-108 core + rate limit ✅ (evidenced). C (TASK-477) ✅ full pass. K5 LINE success ✅, K4 teacher-name ✅.
🟡 K5 "too late" via LINE shows "token expired" (flag). 🔴 **E teacher-menu is blocked by a real finding — no
teacher entry in the LINE flow.** D, K4-leave-pick, camp, and the scan-window "too late" remain (reasons above).

---

## CONTINUATION after phone re-auth (~22:00–22:11) — TASK-479 re-check, E, K4 leave-pick, REQ-108 window/rate
| Item | Result | Evidence |
|---|---|---|
| **TASK-479 — ended-class reply (TH + EN)** | ✅ **PASS** — TH: "**เลยเวลาเช็คอินแล้ว**"; EN: "**Check-in time has passed.**". Both in the chat's language, **no "token"**, proper time-passed wording. **This resolves my earlier "token expired" flag.** | `req107-TASK479-toolate-TH.png`, `req107-TASK479-toolate-EN.png` |
| **E — teacher menu** | 🔴 **FINDING (confirmed with Sober's exact keyword)** — typing **`สมัคร`** (typed via the Thai keyboard) → "**Please type Next to continue**" → **Next** → "**enter phone number**": the **customer** flow. **No role picker, no ครู option.** `register` behaves identically. So on the DEPLOYED sid build the teacher-link role picker is **not reachable** — a teacher cannot self-link from the demo phone. (Sober's `CHOOSE_ROLE`/`askRole` path from the code is not live here; likely the customer command shadows `สมัคร`.) Fixture teacher `qatt2` created + archived; parent re-linked. | `req107-E-rolepicker.png` |
| **REQ-108 window (too early)** | ✅ **PASS** — a class before its window: shop lookup does **not** list it (children:0); direct shop check-in → **409 NOT_CHECKINABLE** "ไม่มีคลาสให้เช็คอินในขณะนี้ / No class to check in right now". |
| **REQ-108 rate limit — N + reset** | ✅ **PASS** — **N = 5** misses per IP per **10-min** window; the **6th** lookup = **429 RATE_LIMITED**. Once capped, even a valid family (0900000092) is 429 until the window resets (~10 min). Successful lookups don't add misses. |
| **K4 — leave PICK sends `Teacher <name>`** | ✅ **PASS** — the button LABEL is short ("01/10 17:00") but the **sent text** carries it: "**พฤหัสบดี 01/10 · 17:00 · Teacher Bank · Private SURFSKATE**" (not the old bare "24/10 15:00"); the confirmation reads "บันทึกการลา : temp — THU 01/10 @ 17:00 : Private SURFSKATE / **Teacher Bank**". | `req107-K4-leave-pick-EN.png` |
| K5(c) — a settled/ended class ⇒ "too late" | ✅ covered by TASK-479 — an ended class replies "time has passed" (both langs); a day-end-settled (NO_SHOW) class gives the same. |

## Still open (specific)
- **D — TASK-476 suspended `/checkin?token`** — needs a per-booking **check-in token**, which QA has no
  endpoint for. The **camp roster link** (`GET /camp/days/:id/checkin`) returns a token — doable with a camp
  fixture; not built tonight.
- **REQ-108 camp** — needs a camp fixture; not built.

## Footprint (continuation) — demo restored, some irreversible leaves
- Demo restored: parent re-linked (`lineLinked: true`), **bot in TH**, 6-cell menu. Fixture teachers
  `QATtest`/`qatt2` **archived**. Check-in fixtures **cancelled**; `checkin_late_minutes` back to **0**.
- ⚠️ **Irreversible leaves (TEST-072 gap):** the K4 leave-pick test set **temp's 2026-10-01 17:00** seat to
  `SICK_LEAVE` (over-quota), on top of **asda's 24/10 & 31/10**. None can be reversed by an admin on this build
  (TEST-072). **Owner: DB-fix or await the un-leave feature.**

## Net (whole round)
✅ REQ-108: Settings QR, happy path, neutral, next-family, **rate limit (N=5)**, **window (too-early)**, admin
ATTENDED (API) — with the **source-not-surfaced FLAG** (Sober). ✅ **C (TASK-477) full pass.** ✅ **K4** check-in
+ leave pick carry the teacher name. ✅ **K5** LINE success + **TASK-479 "time has passed" (TH/EN, no token)**.
🔴 **E teacher-menu = a confirmed finding** (no teacher entry in the LINE flow). ⬜ D (needs a token), camp
(needs a fixture) remain.

---

## E teacher menu — ✅ PASS (my earlier "finding" was OPERATOR ERROR — retracted)
Porter/Khwan's sheet was right: the "Please type Next" prompt **is** the role step (Next = parent, ครู/teacher
= teacher). My earlier round typed **Next** (= parent), so it went to the customer flow — **not a product gap.**
Redone correctly:
1. Cleared the parent link; typed `สมัคร` (via the Thai keyboard) → "Please type Next to continue".
2. Typed **`teacher`** → "**Please type the teacher nickname as registered**".
3. Typed the fixture nickname `qatt3` → "**Your link request has been sent to staff ✅**".
4. Approved as super admin (`POST /teacher-link-requests/:id/approve`) → 200, teacher linked to the LINE user.
5. **The 2-cell TEACHER menu appeared** (blue theme): **ตารางของฉัน / My schedule** + **ภาษา/ช่วยเหลือ /
   Language·Help** — bilingual, collapsed by default. ✅
   - **ตารางของฉัน works** → "⏱️ TODAY'S SCHEDULE: No classes in this range" + chips (สัปดาห์นี้ / ปฏิทินของฉัน). ✅
   - **ภาษา works** → "Switched to English ✅". ✅
   - 🔸 **Minor observation:** the teacher's ภาษา/ช่วยเหลือ "Available Commands" help lists the **customer**
     commands (Add Student / My Course / Check-in / Request Leave), not teacher-specific ones. Worth a look.
6. Unlinked the teacher (`DELETE /teachers/:id/line-link`) and re-linked **0900000092** as the parent
   (register → Next → phone) → **back on the 6-cell customer menu**, `lineLinked: true`, **bot in TH**. ✅

Evidence: `req107-E-teacher-menu.png` (2-cell teacher menu), `req107-E-teacher-schedule.png` (ตารางของฉัน).

## Corrected E status
🟢 **E PASS.** The teacher-link door works end to end (สมัคร → teacher → nickname → admin approve → teacher
menu; unlink → re-link parent → 6-cell). **My earlier "no teacher entry" finding is WITHDRAWN — it was my
typing "Next" instead of "teacher".** Only nit: the teacher help lists customer commands.

## Footprint update
Demo restored: parent re-linked (`lineLinked: true`), **bot TH**, 6-cell. Fixture teachers `QATtest`/`qatt2`/
`qatt3` all **archived**. The pre-existing over-quota leaves (temp 01/10, asda 24/10 & 31/10) remain — the
Undo-feature backlog, not mine to fix (owner's note).

## Remaining rows
- **D — TASK-476 suspended** and **REQ-108 camp**: both unlock with a **camp fixture** (a camp week incl.
  today + a fixture child), which gives the `/checkin/camp?token=` link (D) and the shop-QR camp row. To build.

---

## D + REQ-108 camp (built a camp fixture) — D PASS; camp surfaced a 🔴 DEFECT
Built: fixture parent (phone 0812345670) + child "campkid", a camp week including today (Toth), a FULL/DAILY
package, redeemed today's day, and pulled the roster link `GET /camp/days/:id/checkin`
(`/checkin/camp?token=…`).

| Item | Result |
|---|---|
| **D — TASK-476 suspended (`/checkin/camp` link)** | ✅ **PASS** — suspended the fixture family, then `POST /checkin/camp {token}` → **400 "บัญชีถูกระงับ — ติดต่อเจ้าหน้าที่ / This account is suspended — please contact staff"** — a refusal with **NO class details** (no student name, no class info). Un-suspended after. (The regular `/checkin?token=` path shares the same `anyHouseholdSuspended`-first guard, `checkin.service.ts:82`.) |
| **REQ-108 camp — shop-QR camp row** | ✅ **PASS** — `/checkin/shopfront/lookup` for the parent lists campkid's **camp item** (`kind: "camp"`, campDayId, date, half). |
| **REQ-108 camp — a staff-marked absence must NOT be overturned** | 🔴 **FAIL → DEFECT.** Staff marked the camp day **ABSENT** (`PATCH /camp/days/:id {status:"ABSENT"}` → 200, status ABSENT). Then the wall-QR camp scan `POST /checkin/camp {token}` → **200, and the day flipped to ATTENDED.** A wall QR **overturned** the staff-marked absence. **Code confirms it:** `campScanOutcome` (`lib/camp.ts`) guards ATTENDED / CANCELLED / expired / not-today, then **falls through to `return "attend"` for ABSENT** — no ABSENT guard. Violates REQ-108 §6 and Sober's own stated rule ("a wall QR must never overturn a staff-marked absence"). |

**Recommend (BE):** in `campScanOutcome`, treat `ABSENT` like a terminal/settled state — a scan on an ABSENT day
must NOT attend it (return "already"/refuse, per the owner's ruling), the same way `ATTENDED` returns "already".

Cleanup: camp day reset to PLANNED, camp week CLOSED, fixture family archived.

## FINAL A–F verdict
- **A REQ-108:** Settings QR ✅ · happy path ✅ · neutral ✅ · next-family ✅ · rate limit (N=5) ✅ · window
  (too-early) ✅ · admin ATTENDED ✅ — 🔸 **source not surfaced in admin (flag → Sober)** · shop-QR camp row ✅
  · 🔴 **camp wall-QR overturns a staff ABSENT (DEFECT)**.
- **B:** K4 check-in + leave pick carry the teacher name ✅ · K5 LINE ✅ + **TASK-479 "time has passed"** (TH/EN,
  no token) ✅.
- **C TASK-477** ✅ full pass.
- **D TASK-476 suspended** ✅.
- **E teacher menu** ✅ (my earlier "finding" was operator error — withdrawn) — 🔸 nit: teacher ภาษา help lists
  customer commands.
- **F regression** ✅.

**Two flags + one DEFECT for Sober:** (1) `checkin_source` not surfaced in admin; (2) teacher ภาษา help shows
customer commands; (3) 🔴 the camp wall-QR overturns a staff-marked ABSENT (`campScanOutcome` missing the
ABSENT guard). Everything else PASSES.
