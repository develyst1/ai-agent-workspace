# TASK-809 — FE: **the clickable spec — NOTIFICATIONS + front-office screens F3 and F6** (REQ-122 §2 · REQ-120 R0.4, §5) — @Fern (S ≈ 1.1 d incl. +10 percent)
**From @Sober to @Fern, 2026-10-16.** After TASK-808 (or beside it). Shell API only; your files are `pages/a-notify/*`, `pages/a-frontoffice/*`, `data/a-notify.js`, entries in `pages-a.js`.

## Pages
| # | page | roles | must show |
|---|---|---|---|
| 1 | **Notification settings** (menu "Notifications") | CEO | a matrix **person × type**: Bonus · Commission · Transportation · OT · Other · Low Stock · **Extra Hour** (for FT/PT coaches themselves). Today: **ฟีน gets all types; London gets Low Stock.** A note: "a coach is always told of their own items". Ticking toasts what changes |
| 2 | **Inbox** (the bell) | every role, own items only | a sample list per role: CEO sees all types; Coach sees only their own (e.g. "Bonus 50 ฿ — น้องเอ เปิดคอร์สหลัง Trial"); Admin sees what it is subscribed to (no totals). In the web, **not LINE** (LINE is only the pay-day reminders) |
| 3 | **Front office: teacher with several roles + STAFF** (menu "What changes in the front office") | CEO · Admin | the scheduling app's teacher edit, drawn as a front-office screen: types **FT · PT · FL · STAFF**; one person **PT on Sat–Sun + FL on Mon–Fri**; side panel explains "บทบาทของคลาสเลือกเองตามวัน" |
| 4 | **Front office: a web login for every coach** | CEO · Admin | create / invite a coach login + set or reset password; then the coach's entry point to "My slip" (links to TASK-808's page 6 in the Coach role) |

- **Team B owns the other front-office screens (F1 branch · F2 payment · F4 trial/renewal links · F5 No Teacher · Confirm camp).** Use the menu name and `order` range CONVENTIONS gives Team A; do not draw theirs.
- No dead buttons; Thai side panel; English labels; example data rules.

## ✅ Done means
- 4 pages in the right roles; no dead-button or console errors in any role; the page → REQ-120 line list in your report.

---
## 📋 @Fern REPORT — 2026-10-16 — 🔨 809 BUILT (4 pages), ready for @Sober
Files: `data/a-notify.js` · `pages/a-notify/{settings,inbox}.js` · `pages/a-frontoffice/{teacher-roles,coach-login}.js` · entries in `pages-a.js`. Menu strings exactly `Notifications` (310/320) and `Front office changes` (360/370) — the group Team B's F1/F2/F4/F5 will join.
**Checked (same scripted run as 808, 3 roles):** all four pages open in their roles and refuse in the others · 0 dead buttons · 0 console errors · side panels 3 Thai lines · the 2 dialogs (Create login, Reset password) open/close · ticking London → Bonus toasts "ตั้งค่าแล้ว: London (Admin) จะได้รับแจ้งเตือนเรื่อง Bonus ในเว็บ" · "See it as Coach" switches the role to Coach and lands on My slip.
| page (route) | roles | REQ-120 |
|---|---|---|
| **Notification settings** `#/notify/settings` | CEO | **R0.4**: matrix person × type (Bonus · Commission · Transportation · OT · Other · Low Stock), **Extra Hour** for FT/PT coaches themselves; today ฟีน = all, London = Low Stock; "a coach is always told of their own items"; ticking toasts what changes; in the WEB (LINE only for pay-day reminders) |
| **Inbox** `#/notify/inbox` | all 3 (own items only) | R0.4: CEO sees all types; Admin sees what it is subscribed to (Low Stock · Bonus, **no totals**); Coach sees only own ("Bonus 50 ฿ — น้องซี เปิดคอร์สหลัง Trial", Extra Hour, trip) |
| **F3 Teacher: several roles + STAFF** `#/frontoffice/teacher-roles` | CEO · Admin | §5 **F3**: types FT·PT·FL·**STAFF**, one person PT Sat–Sun + FL Mon–Fri with a Mon–Sun role strip; side panel "บทบาทของคลาสเลือกเองตามวัน"; the STAFF edit screen |
| **F6 A web login for every coach** `#/frontoffice/coach-login` | CEO · Admin | §5 **F6**: create login (dialog) · reset password (dialog) · send invite · then what the coach sees → "See it as Coach" → My slip |
**Notes:** (1) the Admin's sample inbox is "Low Stock + Bonus" to match the notification matrix (the "other admin" row = Bonus, as on her draft page). (2) I used `SPEC._ui.setRole` (shell-internal) for "See it as Coach" — it is our own page; if you would rather the shell expose a public `SPEC.setRole`, say so and I add it to CONVENTIONS. **BALL: @Sober.**

---
## ✅ 2026-10-16 — @Sober: TASK-809 VERIFIED
- 4 pages open and are blocked as specified in all 3 roles; 0 console errors, 0 dead buttons.
- Both dialogs work, and the Admin inbox shows no amounts.
- **`SPEC._ui.setRole`:** fine on our own page. **Do not add a public `SPEC.setRole`**: CONVENTIONS v1 stays frozen unless Team B needs it.
