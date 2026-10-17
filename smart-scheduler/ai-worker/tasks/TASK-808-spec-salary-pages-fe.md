# TASK-808 — FE: **the clickable spec — SALARY pages** (REQ-122 §2 · REQ-120 §0–§1) — @Fern (M ≈ 3.3 d incl. +10 percent)
**From @Sober to @Fern, 2026-10-16.** Starts after TASK-807's shell is accepted. Build ONLY through the shell's API and `CONVENTIONS.md`; your files are `pages/a-salary/*` + `data/a-salary.js` + entries in `pages-a.js`.
**Truth is REQ-120 §1 and her verbatim answers** (paths in REQ-120's header). Where this list and REQ-120 differ, REQ-120 wins: tell me, don't guess. Every number below is hers; do not invent rules.

## Pages (menu "Salary"; English labels, Thai side panel per page)
| # | page | roles | must show |
|---|---|---|---|
| 1 | **People** list | CEO · Admin | name · type(s) · vehicle; base salary column 🔒 for Admin (`SPEC.locked`) |
| 2 | **Person profile** | CEO · Admin (base 🔒) | types incl. **one person PT on Sat–Sun + FL on Mon–Fri** ("the class's role is automatic by its day"); STAFF example; base salary 🔒 CEO only; **FL rate per class type** (Private / Duo / Group / ECA / Camp); merit yes/no; vehicle car / motorbike; commission eligibility shown **by type** |
| 3 | **Pay settings** | CEO | Extra Hour **350 ฿/hr**, weekday from the **5th** hour, weekend from the **6th**, hours from the timetable incl. ECA + camp · OT **salary ÷ 26 ÷ 8 × 1.15**, non-teaching only · Bonus 50 rule (trial → course OR voucher, no time limit, two coaches 25 each) · Bonus 100 rule (renewal; coach changed → admin chooses; voucher after voucher is NOT a renewal) · **commission groups + rates** incl. **Miller helmet 40 and Miller pads 40 as their own groups, separate from Animal Helmet 40**; eligibility **by type** (STAFF: Skate bag only); FT shares → FT pool, split equally at month end; not reduced by discount; set to 0 when ฟีน pays cash · Transportation car **6 ฿/km min 60**, motorbike **3 ฿/km min 40**, one-way / round · **school distances** (editable table) |
| 4 | **Pay run** for **30/9–30/10** | CEO | every person with status **Draft / Confirmed / Auto-locked 12:00**; the confirm deadline (last day of the month, before 12:00); open a slip |
| 5 | **Slip** (CEO view) | CEO | itemised, her words *"ทุกรายการต้องขึ้นดีเทลนะคะ"*: Extra Hour **per date** ("14/10 = 6 Hr") · teaching hours **with who was taught** (น้องเอ…) · each bonus **with the child's name** · each trip in full · OT · merit · commission per sale · other ± with its reason · total |
| 6 | **My slip** (Coach) | Coach only | the coach's own slip, same detail · **Confirm** button (toast) · the deadline · a note "LINE reminder 09:00 and 11:00 on the last day" · "not confirmed by 12:00 → paid as shown, no edits; disputes go to an admin" |
| 7 | **Admin entries** | Admin · CEO | four forms: **OT hours** · **Merit** (teacher's merit entered by **Admin Poo**, every 3 months; staff merit by **Khwan / ฟีน**, monthly) · **Transportation trip** (person · school · one-way/round · vehicle → amount) · **Other ±** with a **required** reason. **Blind: no slip total anywhere on this page**, also after a coach confirmed ("you can add an item; you cannot see the total") |
| 8 | **Daily check-in report** | CEO | per day: hours cut + each coach's pay for the day |

- The Admin must never see a pay total or a base salary on ANY Salary page; the Coach sees only "My slip" (others show the shell's no-access screen).
- Every button navigates, opens an example dialog, or toasts in Thai what would happen (e.g. "บันทึกแล้ว: OT 2 ชม. ของ Bank → เพิ่มในสลิปรอบ 30/9–30/10"). No dead buttons.
- Example data: staff names she used; children only as น้องเอ / น้องบี / น้องซี.

## ✅ Done means
- All 8 pages open in the right roles and refuse in the others; no dead-button errors; no console errors in any role.
- Each page's side panel: 2–4 plain Thai lines, no tech words.
- A short list in your report: page → the REQ-120 lines it shows (I write `CHECKLIST.md` from it).

---
## 📋 @Fern REPORT — 2026-10-16 — 🔨 808 BUILT (all 8 Salary pages), ready for @Sober
Files (Team A only): `data/a-salary.js` · `pages/a-salary/{people,person,settings,payrun,slip,my-slip,entries,daily}.js` · entries in `pages-a.js`. Built only through the shell API + CONVENTIONS. **The numbers are the ones she already approved in the draft** (FT slip **23,139 ฿**, Kid PT+FL **11,550 ฿** with FL rates Private 300 · Duo 350 · Group 250 · ECA 400 · Camp 300, Admin Poo **15,600 ฿**, STA 12 km round trip car **144 ฿**, FT pool **1,200 ÷ 6 = 200**, OT **115 ฿/Hr**) — typed, **nothing computed**; I added only the dated detail lines, each checked by eye to add up to her totals.
**Checked (Browser pane, over localhost, scripted, all 3 roles × all 13 registered pages):** every page opens in its roles and shows the no-access screen in the others (39 of 39 as expected) · **0 dead buttons** · **0 console errors** · every side panel has 3 Thai lines · all 6 dialogs open/close in each role · Pay run "Open slip" → Slip (Kid 11,550 ฿ / tabs Poo 15,600 ฿) · daily tab 13/10 → 8 Hr · 300 ฿ · "Other ±" with no reason → Thai "needs a reason" toast, with a reason → saved toast · Admin: **0 money figures on People/Person; Entries shows only items the Admin typed (no slip total, the banner says so)**; Admin sees 🔒 on base (People ×6, Person ×2). ⚠️ **file:// from a zip is still the open proof (see 807).**
### Page → REQ-120 lines it shows (for your `CHECKLIST.md`)
| page (route) | REQ-120 |
|---|---|
| **People** `#/salary/people` | R1.1 (types FT·PT·FL·STAFF, PT+FL person) · R1.2 (vehicle, merit, base 🔒) · R0.1–R0.2 |
| **Person profile** `#/salary/person` | R1.1 (Kid: PT Sat–Sun + FL Mon–Fri, "role by day") · R1.2 (FL rate per person × class type, merit, vehicle) · R1.3 (commission by type; STAFF = Skate bag only) · R0.2 · STAFF example (Poo) |
| **Pay settings** `#/salary/settings` | §1.2 table: Extra Hour 350 (5th/6th) · OT ÷26÷8×1.15 · Bonus 50 (+ 25 each) · Bonus 100 (admin chooses; voucher after voucher not a renewal) · commission groups incl. **Miller helmet 40 and Miller pads 40 as their own groups** + FT pool / not reduced by discount / 0 when ฟีน pays cash (R1.3) · transportation car 6/60, motorbike 3/40, one-way/round · **school distances (editable)** |
| **Pay run** `#/salary/payrun` | R1.4 (30/9–30/10) · R1.5 (deadline, LINE 09:00/11:00, auto-locked, no edits) · statuses Draft / Confirmed / Auto-locked 12:00 |
| **Slip** `#/salary/slip` | R1.6 (Extra Hour per date · teaching hours with who was taught · each bonus with the child's name · each trip in full) · every pay line of §1.2 (base, Extra Hour, OT, merit, bonus 50/100, commission incl. FT pool, transportation, other ± with reason, FL teaching pay by class type) · R0.1 |
| **My slip** `#/salary/my-slip` | R0.1 (coach sees only own slip) · R1.5 (Confirm, deadline, LINE reminders, "not confirmed → paid as shown, no edits; dispute → admin") · R1.6 |
| **Admin entries** `#/salary/entries` | R0.1 · **R0.3 blind entry** (after a coach confirmed: add, never see the total) · OT · Merit (teacher by Poo / staff by Khwan·ฟีน) · Transportation trip · Other ± with a **required** reason |
| **Daily check-in report** `#/salary/daily` | R1.7 (hours cut + each coach's pay for the day) |
(Not drawn, by design: R1.8 month-end reports — Reports is Team B's, last phase.)
### ⚠️ Points for you (REQ-120 wins — telling, not guessing)
1. **Admin and FL rates.** Her verbatim *"ไม่ให้แอดมินเห็นค่าแรงของครูทุกคน"* suggests Admin should not see a coach's rates either; REQ-120 R0.2 locks only the base. I drew the rates 🔒 for Admin **and put the question INSIDE the Person page** (`SPEC.ask`: A locked / B visible), so she answers it herself.
2. **Dates are mine** (the weekdays are real for 2026: 14/10 Wed, 10/10 Sat, …); schools other than **STA 12 km** (hers) are invented example names/distances — flagged "example" only in the Pay settings table title, tell me if you want a visible "(example)" tag.
3. **"6 FT" in the FT-pool line** is hers; the People list shows only 2 FT — the page says "the first 6 of the list".
**BALL: @Sober.**

---
## ✅ 2026-10-16 — @Sober: 808 + 809 VERIFIED, one fix on Person profile
**My own scripted pass:** a scratch localhost server + the pane, **12 visible pages × 3 roles** (+ the hidden template).
- **0 console errors, 0 dead buttons.**
- **Open/blocked exactly as each TASK says:**
  - Admin is blocked on Pay settings, Pay run, Slip, My slip, Daily and Notification settings;
  - Coach opens only My slip and Inbox.
- **Admin sees 0 money figures** on People and Person profile. Admin entries shows only the items the admin typed (144 ฿ · 60 ฿ · 200 ฿), with no slip total.
- Every page has 3 Thai side-panel lines. Every dialog opened and closed in every role.

**🔧 Fix (Fern): remove the `SPEC.ask("a-salary-admin-sees-rates")` question from `pages/a-salary/person.js`. Keep the rates 🔒 for Admin.**
- Her own words already settle it. QS13, `project-docs/customer-2026-10-13-backoffice-confirm/khwan-answers-2026-10-14-VERBATIM.md:59`: *"นอกจากเงินเดือนพื้นฐาน (พี่ฟีนเห็นคนเดียว) ไม่ให้แอดมินเห็นค่าแรงของครูทุกคน"*.
- Asking it again would make her answer something she has already answered.
- Your lock is right, and the question goes. (REQ-120 R0.2 says less than QS13; I am telling @Porter, since the REQ is his.)

**The other two points:**
- **Dates:** fine as they are.
- **Schools:** STA · ABC · RIS · WA · KIS are her own site codes; only the distances are examples. Home already says every number is an example, so no extra tag is needed.
- **"6 FT"** stays as she wrote it.

---
## 🔧 @Fern — 2026-10-16 — Sober's fix DONE: the in-page question `a-salary-admin-sees-rates` is REMOVED from `pages/a-salary/person.js`; the FL rates stay 🔒 for Admin (her QS13). Re-checked: Admin on Person profile = 2 locks, no question box, rates not in the page text; CEO sees the rates; 0 dead buttons, 0 console errors. (Point 1 of my report above is therefore closed.)

## ✅ 2026-10-16 — @Sober: the fix is checked. TASK-808 fully VERIFIED
`person.js` has no `SPEC.ask`. FL rates and base salary both render `SPEC.locked("CEO only")` for non-CEO roles, and the file parses.
