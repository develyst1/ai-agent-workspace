# TEST-074 — RE-TEST on sid: TASK-480 / 481 / 482 + suspended page (last round before uat)

- Tester: Tanya (QA). Env: **sid** frontoffice `som.develyst.online`, backoffice via the same admin. Date: 2026-09-26.
- Build: owner deployed BE+FE with TASK-480/481/482 (no new migration; sid at 57).
- Fixture (mine): parent **QA Camp Fixture2** `b7146378` phone **0812345671**, student **campkid2 / QA Camp Kid2** `9fbb0307`,
  camp week **QA-Camp-480** (2026-09-26, cap 3, teacher Toth), package `a00160bd`, camp day `743a27b0`, token `f274d43a…`.
- Evidence under `project-docs/qa-2026-09-26/`. §1b: every verdict ends with named screenshots.

## 1. TASK-480 — camp ABSENT is terminal to every scan — ✅ PASS
Staff marked the camp day **ABSENT** in the admin roster, then it was scanned by both doors; neither flips it, and the
day stays ABSENT. The admin's own correction (ABSENT → ATTENDED) still works.

- **Roster before** — QA-Camp-480 → campkid2 = **FULL · ABSENT**, `Mark ▾`.  → `task480-admin-roster-absent-before.png`
- **Camp roster-link scan** (`/checkin/camp?token=…`) on the ABSENT day → page shows **"Already checked in · Status:
  Absent"** — no flip to attended.  → `task480-camp-link-absent-refused.png`
- **Shop-QR** (`/checkin/shop`, phone 0812345671) → the ABSENT camp day is **not offered** in the list (it WAS listed when
  PLANNED) → **"Nothing to check in right now."** — cannot be flipped from the shop door either.
  → `task480-shop-camp-row.png`. (Consistent with Sober's note: the shop-front camp door was already shut by TASK-475;
  TASK-480 makes ABSENT terminal in the remaining path.)
- **API cross-check:** `POST /checkin/camp {token}` → **200 `{"already":true}`**, day stays **ABSENT**.
- **Admin correction still allowed:** roster `Mark ▾` offers **Attended · Cancelled · Undo (back to planned)**; choosing
  **Attended** → toast **"Marked attended"**, row now **FULL · ATTENDED**.
  → `task480-mark-menu.png`, `task480-admin-roster-corrected-attended.png`.

## 2. TASK-481 / 482 — the "Shop QR" chip — ✅ behaviour verified · ⏳ live amber-chip shot DEFERRED (env)
- **Data layer (live on sid):** real bookings carry `checkinSource="shopfront-qr"` (student `asda`), while `line` and staff
  sources are stored too — confirmed by reading the authenticated `/api/bookings` payload.
- **Only `shopfront-qr` renders a chip; every other source is silent** — pinned by the FE unit tests (Fern **591/0**,
  `CheckinSourceChip` + `checkin-source.test.ts`): a `line`/staff/coach/end-of-day source renders nothing. Chip surfaces:
  `BookingsTable.tsx:389` (roster row) and `Calendar/Modal/BookingModal.tsx:167` (booking detail), both on
  `booking.checkinSource`.
- **⏳ Why no live amber-chip screenshot this round:** a fresh shop-QR check-in needs a class **inside the check-in
  window**, and this round ran at **~00:40–02:40 local**. The calendar create form only offers **business-hours start
  slots (09:00–17:00)**, so no bookable class can be in-window at night (earliest window opens ~08:30). The only existing
  `shopfront-qr` bookings on sid are **CANCELLED and past-dated** (they don't render on the calendar and fall outside the
  bookings list's default range). **This is an environment/timing block, not a defect.** ▶️ Capturable in one pass during a
  daytime window (create a 1-HR booking, confirm it, shop-QR check in, shoot the row + modal chip). I created & then
  **cancelled** a fixture 1-HR booking while proving the constraint (see Cleanup).

## 3. No admin username leaks to a parent — ⚪ NOT_TESTED (corrected 2026-09-26; first draft said PASS)
- **The prescribed test was not run:** staff check-in → open the parent-facing reply/page → look for the username. Not done.
- What I *did* observe live: the authenticated week `/api/calendar` payload carries no `checkinSource` field. Supporting,
  but it is not the parent-facing surface. The rest (`provenance:false ⇒ null`) is a **code/test read**, and per QA.md §1
  that cannot make a PASS. First draft overstated this; corrected here and to Porter.
- Also NOT_TESTED: **"a coach account sees NO chip"** (no coach login was used this round).

## 4. Suspended refusal shown on the PAGE — ✅ PASS
Suspended the fixture household (People → **QA Camp Fixture2 / 0812345671** → Suspend), then loaded the camp token page:
- `/checkin/camp?token=…` → **"Check-in failed — บัญชีถูกระงับ — ติดต่อเจ้าหน้าที่ / This account is suspended — please
  contact staff"**, red ✗, "Try again". **No child/schedule details** are shown. → `task476-suspended-refusal-page.png`
- Household **un-suspended** immediately after (restored). (TASK-476 guard confirmed on the page, not just the API.)

## 5. Smoke — partial
- **Menus / admin app:** backoffice loads and navigates cleanly (Schedule, Camp, Bookings, People, Settings) throughout
  this session — OK.
- **Shop-QR happy path:** the lookup endpoint answers; a *successful* in-window check-in is the same daytime-window block as
  §2 — re-run alongside the chip shot.
- **LINE check-in:** needs the owner's demo phone (adb rig) — not exercised this round.

## Verdict
TASK-480 **PASS** (the release blocker is fixed and evidenced). Suspended page **PASS**. No-username-leak **NOT_TESTED**
(corrected). Shop-QR chip: live render **NOT_TESTED** (no in-window class at night; engineers' tests are green but that is
not a QA pass); coach-no-chip **NOT_TESTED**; shop-QR happy path + LINE check-in **NOT_TESTED**. Open items to clear in
one daytime pass on sid, or on uat read-only once a real family uses the wall QR.

## Test data created (all mine, on sid)
- Camp week QA-Camp-480, package `a00160bd`, camp day `743a27b0`, parent `b7146378` / student `9fbb0307`: day left PLANNED, week CLOSED; parent/student kept as the standing QA camp fixture.
- 1-HR booking `93e4bbd3`: cancelled.
- Household suspend: reverted (un-suspended).

## Cleanup done
- Cancelled the fixture 1-HR booking `93e4bbd3` (campkid2, 26/Sep 09:00) — reason "Admin entered it by mistake".
- Household un-suspended (restored).
- Camp fixture: day reverted / week closed (see log). Demo link `0900000092` untouched.
