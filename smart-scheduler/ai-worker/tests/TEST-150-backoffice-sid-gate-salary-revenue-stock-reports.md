# TEST-150: back office on sid — Salary demo spine, roles (R0), Revenue, Stock, 2.1 / R1.8 reports
**Status:** 🟡 IN_TEST — designed; signed-out checks ✅; everything behind sign-in **NOT_TESTED, waiting for 3 session cards** (CEO · admin · coach).
**Source:** Porter's 2026-11-09 20:12 entry in `inbox/QA.md` · REQ-120 (R0, R1, R2, R3, §4) · SPEC-097 (roles + sign-in) · SPEC-100 (thin slip demo) · SPEC-098/099 (revenue) · Master Plan v1 §3–§6.
**Build:** BB `693627d` + BF `e2add44` (Porter; the local clones read the same). Host `backoffice-som.develyst.online` (SYSTEM-FACTS l.248: sid's back office).

## Access (2026-11-09 ~20:20 Bangkok)
- **What I hold:** the front-office card `som.json` (host `som.develyst.online`) and `uat.json`. **No back-office card.**
- **What I see:** the back office has its **own** username + password page (`/login`, «เข้าสู่ระบบ»). The front-office card does **not** carry over (its cookies are for `som.develyst.online` only); with or without it I land on `/login?next=%2F`.
- **My rule:** I never sign in on a deployed host (no typing, no token I sign, no credential file). So every case behind sign-in waits for a **session card per role**, made by whoever signs in, saved like `som.json`. Proposed names: `picklocker/state/bo-ceo.json`, `bo-admin.json`, `bo-coach.json` (the coach one for a QA coach, so "own slip only" can be tested). I load them as given and never read them.

## Signed-out checks: ✅ TEST_PASSED (run 2026-11-09, GET only, nothing typed)
| Probe | Result |
|---|---|
| `/` , `/salary/payrun`, `/salary/people`, `/revenue/summary`, `/stock`, `/reports` | **307 → `/login?next=…`** (each keeps its own `next`) |
| `GET /api/v1/me`, `/salary/my-slip`, `/revenue/categories`, `/revenue/refunds/sources`, `/stock/sales`, `/stock/low-stock`, `/reports/students`, `/reports/courses`, `/demo/stock`, `/bo/items` (no token) | **401 `UNAUTHORIZED` «ต้อง login»** on every one |
| `GET /api/v1/internal/salary/unconfirmed` (no service token) | **401 «service token ไม่ถูกต้อง»** (fail-closed, as TASK-887 says) |
| `GET /api/v1/notifications/` | 404 (the route has no bare `/` GET; not a finding) |

## The design — risk first (what a defect would cost, highest first)
**Block A — R0 visibility, money must not leak (highest: a pay or revenue figure shown to the wrong person can't be taken back).** Needs all 3 cards.
- A1 · CEO sees pay and revenue screens and figures; **admin** sees **no** base salary, **no** pay totals, **no** revenue page or figure (R0.2; Khwan = admin view, §9.4 #6); **coach** sees **only his own slip**.
- A2 · The same on the API: admin → 403 on every revenue route (`requireRole("ceo")`) and masked pay fields; coach → 403 on others' slips (by id, not just hidden in the menu).
- A3 · Menu vs URL: a page hidden from a role is also refused when its URL is typed directly.
**Block B — the Salary demo spine (Master Plan §3 promise, 20–23 Nov):** pay run → slip → lock.
- B1 · Pay run for a month on QA coaches: FT base slip with an Other ± line (+ and −, reason required); totals = the sum of lines.
- B2 · Slip page (CEO view, coach's own view) matches the pay run, line for line.
- B3 · **Lock** (auto 12:00 per SPEC-100 / manual): after lock nothing on that month can change (edit refused, both screen and API); a second lock is a no-op.
- B4 · Extra Hour / FL hours from TASK-872's reader on a QA coach with known timetable minutes (my own bookings on sid), only where SPEC-100 puts them in the demo.
**Block C — Revenue (CEO only):** C1 lines written by the front office (TEST-148/149 rows) appear with the right type, amount, method, branch, date; C2 Summary / Detail filters; C3 refund path if built; C4 admin refused (A2).
**Block D — Stock:** D1 product import (QA file only), stock-in, a sale (stock-out) with method + commission picker; D2 balance = in − out; D3 low-stock threshold + the Monday job's guard (internal route, already fail-closed above); D4 the Stock demo page.
**Block E — reports (2.1 / R1.8):** each report's totals against the rows it lists; period filters; export if present; role visibility (A).
**Throughout:** TH + EN labels on what Khwan / ฟีน will see; phone width for the coach's slip; QA data only (names starting "QA TEST-150"); nothing on uat.

## 2026-11-09 20:14 ring (Team C + Team B Salary screens on the real API): still BLOCKED
Re-checked `picklocker/state/`: `som.json`, `uat.json` only, no back-office card. Every screen named (Revenue Summary / Detail / Type and Category, Add Manually, ECA Payment, Refund, All Report, the Salary screens 869/882/895/899/902/923) sits behind the back office's own login, **the CEO views included**, so none is runnable by me yet. One CEO card unlocks Blocks B, C and E; admin + QA-coach cards unlock Block A.

## NOT_TESTED (now)
Everything in Blocks A–E: **no back-office session**. To settle: 3 cards (CEO, admin, a QA coach). Porter rings per screen as the FE seams land; I run the block that screen opens.

## Test data created
None yet (signed-out GETs only). **uat:** not touched.

## Block B — the Salary spine (CEO), 2026-11-09 21:15 Bangkok: ✅ TEST_PASSED + 🐞 D-150-1 (language)
**Card:** `bo-ceo.json` as given → `/dashboard` (not /login); `GET /api/v1/me` = role **ceo**. **Build:** BB `693627d` + BF `e2add44` + the owner's redeploy (Porter 21:13). **Test month 2027-05** (far from any month in use; nothing current locked). QA coaches only.
| Step | Result |
|---|---|
| Profiles: QA coach `2ade954f` FT base 20,000 ฿; `f453d207` PT base 8,000 ฿ | 200, 200 (sid had **0** salary profiles before) |
| Create period 2027-05; again | **201**; again **409 PERIOD_EXISTS «มีงวดเดือนนี้แล้ว»**. Status open, **pay period 30 Apr – 30 May** (= R1.4), **lock 31 May 12:00 Bangkok** (= R1.5) |
| Run | `{created: 2}` — one draft slip per profiled coach (base 20,000 / 8,000) |
| Other ± on the FT slip: +500, −200, empty reason, zero | 201, 201, **400 «ต้องระบุเหตุผล»**, **400 non-zero** |
| OT 60 min on 3 May | **110.58 ฿** = 20,000 ÷ 26 ÷ 8 × 1.15 (110.577 → 11058 satang) ✓ R1.2 |
| Slip total | **20,410.58** = 20,000 + 500 − 200 + 110.58 ✓ |
| Exports | period CSV 200 `text/csv`; slip xlsx 200 (xlsx type); slip pdf 200 `application/pdf` (not opened) |
| **Lock** | 200, status **locked**, lockedAt stamped |
| After lock: add line · delete line · OT · run | **409 LOCKED «งวดนี้ถูกล็อกแล้ว แก้ไขไม่ได้»** on all four; slip unchanged |
| Lock again | 200 (no-op) |
**Painted (read only):** Pay run shows May 2027 «ล็อกแล้ว», «ช่วงจ่าย 30 เม.ย. – 30 พ.ค. 2027», the lock note, rows QACT 20,000.00 / 20,410.58 and QADT2 8,000.00 / 8,000.00, total 2 people 28,000.00 / 28,410.58. The slip page lists base, both Other lines with their reasons (+500.00 / −200.00), «03/05: OT 1 Hr +110.58», net 20,410.58, and «สลิปนี้ล็อกแล้ว … ดูได้อย่างเดียว». No API error on either page. Evidence: `tests/evidence/test150-b-slip.png` (QA coach only).
**🐞 D-150-1 (low, wording; customer ruling): the Pay run and slip screens are mostly Thai.** REQ-120 §8 **D2 = A: "English for the whole back office", incl. the coach's slip page.** Seen: «ภาพรวมรายเดือน · งวดเงินเดือน · เดือน · ปี (ค.ศ.) · สร้างงวด · ล็อกแล้ว · ช่วงจ่าย · เงินเดือนฐาน · รวมสุทธิ · กลับไป Pay run · สลิปนี้ล็อกแล้ว … ดูได้อย่างเดียว», Thai month names, and «ต้องระบุเหตุผล» / «งวดนี้ถูกล็อกแล้ว» from the API. The left menu also mixes Thai items («งบกำไร–ขาดทุน», «รายได้แยกตามกิจกรรม», «แท็ก»). As ruled, it should be English; any change to that ruling is the PM's to bring.
**Not tested:** Extra Hour / FL teaching pay / bonus / transport / commission auto lines (no QA timetable in May 2027 — a later round on a month with QA bookings); the coach's own slip + confirm (no coach card); admin masking (no admin card).
**Test data:** salary profiles for 2 QA coaches; period **2027-05 locked** with 2 QA slips (cannot be unlocked; harmless far-future month).

## Block C — Revenue (CEO), 2026-11-09 ~21:20: ✅ TEST_PASSED on reads, manual + ECA · 🟡 Refund BLOCKED (D-150-2, env)
- **Categories:** 63, types COURSE · TRIAL · VOUCHER · ECA · SALES · FNB · RENT · OTHER.
- **The C1 lines from TEST-148/149 are all in `/revenue/lines` (2026-11-09), right on every field** (matched by category + amount + method + branch; the list has no ref id): course `52d40230` 4,790 **CARD** (P5) · course `a2e9d921` 4,790 Transfer branch **OTHER** · voucher `68827b23` 6,000 branch **OTHER** · camp `b2044a2d` **11,500 CASH «Balance Camp»** · camp `bd23f47a` 5,900 Transfer · TRIAL 1,390 · 1 HR 1,390 · my 2 vouchers 6,000 each. **Unconfirmed courses / camp packages have no line**, as C1 says.
- **Summary = lines:** today's total **125,120.00 ฿ = the sum of the day's 29 lines**; after my two 1 ฿ lines the total rose by **exactly 2.00** (ECA +1, OTHER +1); MTD moved the same.
- **Writes:** Add Manually 1 ฿ (OTHER · Shirt, Cash) **201, source MANUAL**; ECA Payment 1 ฿ (1 class × 1 student, Transfer) **201, source ECA**; a manual line typed REFUND **400** (refused). A 365-day range on the lines list: 200.
- **🟡 Refund BLOCKED — 🐞 D-150-2 (env, blocks the Refund screen on sid):** on a new **C-TEST** course (`fec1ee28`, child "CTEST150" under my QA parent with no LINE, QA coach not on LINE), refund sources lists it correctly (fee 4,790, 4 sessions to cancel, not refunded). **POST /revenue/refunds 1,000 ฿ → 503 `NOT_CONFIGURED` «the scheduling API is not configured (SCHEDULER_API_URL / SCHEDULER_INTERNAL_SECRET); nothing was refunded».** Nothing was written (no REFUND line, summary unchanged). Settled by: the owner sets those two env values on the sid back office, then I re-run. The amount guard works: 1,000,000 ฿ → **400 "between 1 and the sale's fee (479000)"**.
- **Painted (read only):** Summary, Detail, Type and Category, Add Manually, ECA Payment, Refund and `/revenue` all load with **no API error**.

## Block D — Stock (CEO), 2026-11-09 ~21:23: ✅ TEST_PASSED (API) + painted pages load
- sid had **no products** («No product found»). Created **QA-T150-001** "QA TEST-150 product" (price 100 ฿, opening 10, revenue category SALES · Miller): **201**; same code again → **409 DUPLICATE_CODE**.
- **Stock-in 5 → 15**; the same idempotency key again → 200, **still 15** (no double).
- **Sale (STOCK OUT) of 2**, Cash, seller = QA coach `2ade954f`, commission 10 ฿/unit → **200, 13 left**; the same key again → 200, **still 13**. A sale of 999 → **409 NEGATIVE_BALANCE «จะติดลบ (13 -999 = -986)»**, nothing moved.
- **Sales list** shows it (qty 2, Cash, Bravo, buyer). **Revenue:** exactly **one SALES line 200 ฿ Cash Bravo, source STOCK**. Low-stock: empty (no threshold hit).
- **Painted (read only):** Product, STOCK IN, STOCK OUT, Low Stock, Stock Report, Stock import, Stock Demo, Notification Setting / Alert all load with **no API error**. The Notification Alert shows my OT entry («OT · QACT · 03/05/27 · 1 Hr»).
- **Not tested:** Excel import (needs a QA workbook), Stock Demo move A→B, low-stock thresholds + the Monday job, commission flowing into a pay run (needs a Nov 2026 period, which the demo uses — not mine to create).

## Block E — reports, 2026-11-09 ~21:25: ✅ R1.8 on my data · 🟡 2.1 loads only
- **R1.8 Pay report, 2027-05:** the QA FT row = base 20,000 · OT 110.58 · other 300.00 · other income 410.58 · **total 20,410.58** = the slip; xlsx 200. **Teaching report:** 0 minutes (no QA classes in May 2027), xlsx 200.
- **2.1 (`/reports`, All Report):** the page loads with no API error (REPORT · STOCK · CHECK IN · COURSE · SALARY …). Its totals weren't checked against rows (needs a period with known data).
- **Salary Report page (Nov 2026):** «ยังไม่มี Pay run ของเดือนนี้» — correct, no Nov period.

## Questions for Porter (not defects)
- **Other Income (`/salary/entries`) refuses the CEO:** «บทบาท CEO ไม่มีสิทธิ์เปิดหน้า Other Income». By the role design, or should the CEO see it? (R1.2: merit for staff is entered by ขวัญ or ฟีน.)

## Test data created (sid back office, all "QA" / "C-TEST")
Salary profiles for QA coaches `2ade954f` (FT 20,000) and `f453d207` (PT 8,000); **period 2027-05 locked**; product QA-T150-001 (13 in stock) + its sale and SALES line; revenue lines: 1 ฿ OTHER manual + 1 ฿ ECA; in SB: child `ceb357b8` "C-TEST TEST-150 refund kid" + course `fec1ee28` (sold, not refunded — I'll cancel it after the refund re-run).
> answer (Porter, 2026-11-09 21:24): Other Income refusing the CEO is **by design** (the admin-blind path; the CEO adds on the slip). Silver will hide the link for the CEO. Not a defect. D-150-2 goes to the owner (env); Refund re-run when Porter rings.

## R0.1 — back-office login management (Porter 22:08), 2026-11-09 ~22:10: ✅ TEST_PASSED (CEO side) · sign-in AS admin/coach NOT_TESTED
**Build:** the owner's local BB (HEAD `7fcd748` + R0.1's uncommitted files: `routes/users.ts`, `bo-user-admin.service.ts`, migration `0021_bo_users_fo_user_id`) + BF. CEO card as given.
| Case | Result |
|---|---|
| List before | 1 login: `ceo` (CEO, active, not admitted) |
| **Admit** front-office `qa-coach-qatt75` as coach (no teacherId sent) | **201**, role coach, **teacherId = `7508e641…` taken from the front office**, active, admitted |
| **Admit** front-office `qa-nostatus-077` as admin | **201**, role admin, teacherId null |
| The coach again | **409 ALREADY_ADMITTED «ผู้ใช้นี้ถูกเพิ่มในหลังบ้านแล้ว»** |
| A username not in the front office | **404 «ไม่พบผู้ใช้นี้ในระบบหน้าบ้าน»** |
| A front-office login that is disabled (`qa-a-59807`) | **400, details.field = username** «ถูกปิดใช้งานในระบบหน้าบ้าน» |
| role ceo / role staff | **400, field = role** («ไม่สามารถเพิ่มผู้ใช้เป็น CEO ได้» / «role ต้องเป็น admin หรือ coach») |
| bad username `X!` | **400, field = username** |
| bad teacherId / a coach with no teacher anywhere | **400, field = teacherId** (both) |
| body is an array | **400** «ข้อมูลไม่ถูกต้อง» (no field — the body itself) |
| Deactivate → reactivate the admin | 200 → active **false**; 200 → active **true** |
| Deactivate the CEO | **400 «ไม่สามารถปิดใช้งานบัญชี CEO ได้»** |
| Deactivate a bad id | 400 |
| `/me` afterwards | still **ceo** — the CEO card still signs in |
**Painted (read only):** menu «User Setting → /users»; the page reads "Admit a login" and lists ceo (CEO, ACTIVE), qa-coach-qatt75 (Coach, ACTIVE, Deactivate), qa-nostatus-077 (Admin, ACTIVE, Deactivate).
- **Observation O-150-1 (cosmetic, not judged):** the "Person" column shows the coach's **raw teacher id** (`7508e641-0aef-…`), not a name.
- The API's messages are Thai while the page is English (same family as D-150-1).
**NOT_TESTED:** signing in **as** the admitted admin / coach (needs their password: standing rule; waits for [bo-admin] / [bo-coach] cards), and with it Block A (money visibility) and a deactivated login being refused at sign-in.
**Test data:** 2 admitted QA logins (`qa-coach-qatt75` coach, `qa-nostatus-077` admin), both left **active** for the role cards.

## Salary auto lines + R1.7 Daily (Porter 22:34), 2026-11-09 ~22:45: ✅ TEST_PASSED on FL · Extra Hour · Merit · Transport · Daily — Bonus 50/100 NOT_TESTED (needs the Nov 2026 period)
**Month 2027-06** (pay period **31 May – 29 Jun**, R1.4 ✓), left **open** (not locked). CEO card. QA coaches only.
**Set-up:** in SB (som.json): **16 ECA classes** (OTHER, kind ECA, no student, 1 h each, confirmed): QA FT `2ade954f` **Wed 9 Jun × 6** and **Sat 12 Jun × 7**; QA FL `7c9bbc14` **Tue 8 Jun × 3**. In the back office: FT profile (base 20,000, merit-eligible, car); FL profile (no base, role FL, motorbike), FL rate **ECA 300 ฿/h**; a QA school **12 km**; trips: FT car **round trip** 9 Jun, FL motorbike **one way** 8 Jun.
| Line | Hand math | On the slip |
|---|---|---|
| **Extra Hour** (FT, weekday from the 5th h, weekend from the 6th; ECA counts) | Wed 6 h → 2 h × 350 = **700**; Sat 7 h → 2 h × 350 = **700** | «09/06 (Wed): 6 Hr → extra 2 Hr × 350» **700.00**, «12/06 (Sat): 7 Hr → extra 2 Hr × 350» **700.00** (auto, one line per date) ✓ |
| **FL teaching pay** (hours × that person's class-type rate) | 3 h ECA × 300 = **900** | «08/06 (Tue): eca 3 Hr × 300» **900.00**, classType eca (auto) ✓ |
| **Merit** (amount typed, merit-eligible) | 1,000 | **1,000.00** (manual) ✓ |
| **Transport** car 6 ฿/km min 60 | 12 km × 2 = 24 km × 6 = **144** | «QA TEST-150 school · 09/06/27 · Round trip · 24 km» **144.00** ✓ |
| **Transport** motorbike 3 ฿/km min 40 | 12 km × 3 = 36 → **min 40** | «… · 08/06/27 · One way · 12 km» **40.00** ✓ |
| Slip totals | FT 20,000 + 1,400 + 1,000 + 144 = **22,544**; FL 900 + 40 = **940** | **22,544.00 / 940.00** ✓ |
- **Idempotent:** apply-transport twice → `written 2` then `written 0, unchanged 2`. apply-bonus on June → `written 0` (no candidates, correct).
- **Run** created 3 slips (FT, FL, and the PT profile from Block B) and inserted 3 auto lines, and **warned**: FL `7c9bbc14` has a **group** class on Mon 7 Jun 2027 (not mine; already on sid) with **no FL rate** (`no_fl_rate`).
- **R1.7 Daily report:** 8 Jun → Freelance 3 h, «ECA 3 Hr × 300 ฿», 900.00; 9 Jun → Full-time 6 h, «Extra Hour 2 Hr × 350 ฿», 700.00; 12 Jun → Full-time 7 h, 700.00; **7 Jun** → Freelance 1 h, «Group 1 Hr × — ฿», income empty, and the day's **missingRates lists (coach, group)** — the gap is shown, not hidden ✓.
**NOT_TESTED: Bonus 50 / 100.** A bonus falls in the month of the purchase (DECISIONS row 12b), and any purchase I make is dated **now (Nov 2026)**. So it only shows in the **Nov 2026 period**, which the 20–23 Nov demo uses and which doesn't exist on sid yet. **Question for Porter:** may I create the Nov 2026 period on sid (run + apply-bonus, never lock), or should Bonus wait until the demo's own run?
**Test data:** 16 ECA classes in SB (June 2027, QA coaches, no student, note "QA TEST-150 auto lines"); FL profile + ECA rate; QA school; 2 trips; **period 2027-06 open** with 3 QA slips (+ the merit and transport lines).

## Bonus 50 / 100 on the Nov 2026 period (Porter 22:37: create, run, apply-bonus, never lock), 2026-11-09 ~23:00: ✅ Bonus 50 · 🟡 Bonus 100 waits for tonight's day-end
**Bonus 50 ✅.** A new child "QA TEST-150 bonus kid" (QA150bonus) under my QA parent `030dea39` (no LINE): 1st Trial today 18:00 with QA FT `2ade954f` → confirmed → **attended**; then course A (4 × from 16 Nov, same coach) → `fromTrialBookingId` = the trial ✓ (F4 link). `apply-bonus` on Nov 2026 → **written 1**: the FT slip gets **«Bonus 50 · QA150bonus (Private)» 50.00 (auto)** ✓. A second apply → `written 0, unchanged 1` (no double) ✓.
**Bonus 100 — first try, correct refusal:** course B (renewal of A, `prevCourseId` = A ✓) is listed by apply-bonus as **unresolved `NO_FIRST_COACH`** — A has no ATTENDED session yet, and by TASK-860 the first coach is the coach of the first ATTENDED session, stamped by the **day-end**; TASK-863 lists the case instead of dropping it ✓. Not a defect.
**Bonus 100 — second chain, set up now, re-check after tonight's day-end:** child "QA TEST-150 bonus kid 2" (QA150bonus2): old course **X `fe2f1edf`** (4 × weekly from Mon 2 Nov 19:00, QA FT `2ade954f`), its **2 Nov session attended** (used 1, firstTeacher still null until day-end); renewal **Y** bought now (from 14 Dec 16:00, QA PT `f453d207`), `prevCourseId` = X ✓. **Expected after the day-end:** X.firstTeacherId = `2ade954f`, and `apply-bonus` on Nov 2026 writes **Bonus 100 = 100.00 to `2ade954f`** (the old course's first coach, not Y's coach).
**What I created in the Nov 2026 period (Porter's condition 1) — QA rows only:**
- **Period 2026-11** (pay period **31 Oct – 29 Nov**, lock-at **30 Nov 12:00 Bangkok**), status **open**, **never locked by me**. Created by me (it didn't exist).
- **3 draft slips**, one per QA salary profile: `2ade954f` (FT, base 20,000), `f453d207` (PT, base 8,000), `7c9bbc14` (FL). The run also put the FL coach's November classes through and **warned `no_fl_rate`** for his private / group classes (no rate set for those types; only ECA has one).
- **1 auto line:** Bonus 50 (50.00) on `2ade954f`. Nothing else written by me in that period.
- No real coach has a salary profile on sid, so the run made no slip for anyone else.
- Porter's condition 2: I finish well before **30 Nov 12:00**; the Bonus 100 re-check is the only thing left in it.
**Test data (SB):** children QA150bonus + QA150bonus2 (under QA parent `030dea39`, no LINE); a 1st Trial (attended, its C1 TRIAL line written); courses A, B, X (1 attended), Y — all QA coaches, sold (their C1 sale / payment rows stay).

## Bonus 100 re-run, 2026-11-10 ~20:20 (after the day-end): first coach ✅ stamped · apply-bonus BLOCKED (CEO card lapsed)
- **SB (som.json, GET):** old course X `fe2f1edf` now has **firstTeacherId = `2ade954f`** (used 1, ACTIVE) — the day-end stamped it as TASK-860 says ✓. Renewal Y still has `prevCourseId` = X ✓.
- **Back office:** `bo-ceo.json` **lapsed** — `/dashboard` redirects to `/login`. I don't sign in myself, so `apply-bonus` on the Nov 2026 period (expected: **Bonus 100 = 100.00 to `2ade954f`**) waits for a fresh CEO card. Nothing was written. The Nov 2026 period is untouched (open), and the 30 Nov 12:00 lock is still far off.

## Bonus 100 — closed, 2026-11-10 ~20:35 (fresh bo-ceo card): ✅ TEST_PASSED
- `apply-bonus` on the Nov 2026 period → **written 1, unchanged 1** (the earlier Bonus 50 not doubled).
- The QA FT slip `2ade954f` now has **«Bonus 100 · QA150bonus2 (Private)» 100.00 (auto)** beside «Bonus 50 · QA150bonus (Private)» 50.00; slip total **20,150.00** = 20,000 + 50 + 100 ✓.
- It went to the **old course X's first coach** (`2ade954f`, stamped by the day-end), not to the renewal Y's coach (`f453d207`); the renewal is no longer listed as unresolved ✓.
- Period 2026-11 still **open** (not locked).
- Not checked: the PT slip's lines (only that the renewal resolved to the FT coach).
**Bonus 50 + Bonus 100 both TEST_PASSED** on sid; the Nov 2026 period's contents are now: 3 QA draft slips (`2ade954f` FT, `f453d207` PT, `7c9bbc14` FL) + 2 auto bonus lines (50 + 100) on `2ade954f`.

## P&L guard settling call (Porter 23:42, for `CHECK-2026-11-11-bo-reports-pl-guard.md`), 2026-11-11 ~23:50: 🔴 D-150-3, sid's P&L is open with NO login
`GET https://backoffice-som.develyst.online/api/v1/bo/reports/pl?from=2026-11-01&to=2026-11-30`, GET only. Bodies were not kept; I recorded only the shape.
| Request | Status | Body |
|---|---|---|
| **No token at all** (plain `fetch` from my machine: no cookie, no header) | **200** | JSON `from, to, incomeMinor, expenseMinor, profitMinor, byDirection, byCadence, byItem`: **has data** |
| `bo-coach` card, **cookie only** (no Authorization header) | **200** | the same: has data |
| `bo-coach` card, **Bearer header only** (`credentials: 'omit'`) | **403** | `{error}` |
| `bo-admin` card, Bearer header only | **200** | has data (whether an admin may see the P&L belongs to the money-visibility rules, not judged here) |
- **Meaning:**
  - A request without a Bearer is answered as if signed in. That fits Sober's inferred `SKIP_ADMIN_AUTH=true` on sid.
  - A valid coach Bearer is still refused (403), so the code's own guard works.
  - The coach 200 in UNLOCK-010 is explained by the cookie-only path.
- **Severity:** high, if this env reaches any customer-facing host. On sid, anyone who can reach the URL reads the P&L.
- **Fix owner:** the owner or Otto, by setting sid's env `SKIP_ADMIN_AUTH=false` (CHECK §2). Not mine.
- **Re-check after the fix:** the no-token GET must give **401**, cookie-only 401, coach Bearer 403.
- **Not checked here:** whether a never-admitted FO user can sign in (CHECK §3).

### Re-check after the owner set `SKIP_ADMIN_AUTH=false` and restarted (Porter 23:48), ~23:55: ✅ D-150-3 CLOSED
| Request | Before | Now |
|---|---|---|
| (1) No token at all | 200 | **401** ✅ |
| Cookie only (CEO / admin / coach cards) | 200 (coach) | **401 / 401 / 401** ✅ |
| (2) CEO card Bearer | — | **200** ✅ |
| admin Bearer · coach Bearer | 200 · 403 | 200 · 403 (unchanged) |
- **(3) The CEO in the browser:** opens on `/dashboard` (the P&L page heading shows), and is still on `/dashboard` after a reload. **No 401 loop.** The only 401 on the page was my own cookie-only probe.
- The admin card lands on `/items` and the coach card on `/salary/my-slip`. Both load.

