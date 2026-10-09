# TEST-090 — uat READ-ONLY pass after 706 + 707 (back `a2185b2` · front `2db1c57`)

**Tester:** Tanya (QA) · **Date:** 2026-10-08 · **Env:** uat (frontoffice.develyst.online), admin, headless
**Brief:** `inbox/QA.md` → "▶️ GO: uat READ-ONLY pass for 706 + 707" · **Deploy note:** `DEPLOY-uat-2026-10-08-706-707.md` §7
🚫 **Zero writes.** I opened screens only and never pressed Save, Apply, Delete or Close-week; every dialog was closed with ✕. After login, every non-GET request was **aborted** at the browser. The only requests aborted were Cloudflare's own `POST /cdn-cgi/rum` page beacons (not the app).

## 1. Build identity
- **Front 707: ✅ live.** The chunk that holds the camp edit dialog (it contains `data-coach-from`) is **`384tr2knc-9j1.js`, sha256 `8001a31f95d35a65…`, 57 690 bytes on uat — byte-identical to sid's**. sid is the build Part 2 of TEST-089 proved to be 707, by its request shape. Read-only; nothing saved.
- **Back 706: ⚪ not provable read-only.** 706 changes only what happens when a PENDING group date is cancelled (a write plus a family push), and `/health` carries no version. I did not try to prove it.

## 2. 🔑 Camp 12–16 Oct: which coaches are SAVED in the camp week now
Read twice, once by API (GET `/camp/weeks/:id/days`) and once in the Edit dialog (screenshots). Both agree.

| Week | Status | Per day 12–16 | Coaches saved | "(edited)" |
|---|---|---|---|---|
| **"12-16 Oct"** `cc027c4f` | OPEN | window 10:00–15:00 every day; kids 5/3/2/2/2 | **NONE on any day** | all 5 days, `editedAt` 2026-10-08 06:27:53–06:27:58 UTC (13:27 Bangkok, one save) |
| "12 -16 Oct" `35ba9c9e` | CLOSED (opens) | window 10:00–15:00; 0 kids | **NONE** | no |
| "12-13 Oct" `5e9ab46a` | CLOSED (opens) | window 10:00–15:00; 2 kids/day | **NONE** | no |

No week-level coaches either (`teacherIds: []` on all three). The camp week holds the same "0 coaches" I read at the start of the day (TEST-089 side note); **no later save added any**.

## 3. Schedule → Daily → Mon 12 Oct
- **Camp blocks (`[data-camp-block]`, the real camp-week block): 0 on any coach column.** The day carries only the two banners, "12-13 Oct · 2 kids · Closed to new bookings" and "12-16 Oct · 5 kids".
- ⚠️ **What the admins actually see on the coach columns are hand-made "Other" bookings titled "Balance Camp 12-16 Oct"** (`bookingType OTHER`, **PENDING**, 1-hour rows, no camp link: `campWeekId` / `campWeekDayId` empty). Bank's column at 10:00 and 11:00 in the screenshot is one of these. In full (12–16 Oct, read by GET `/bookings`):

| Day | Coach hours held by "Balance Camp 12-16 Oct" Other bookings (PENDING) |
|---|---|
| Mon 12 | Bank 10–12 · Pop 10–12 + 13–14 · Keng 10–12 + 13–15 · Toth 13–15 · Kowjeo 14–15 |
| Tue 13 | Haris 10–12 + 13–15 |
| Wed 14 | Haris 10–12 · Kowjeo 13–15 |
| Thu 15 | Kowjeo 10–12 · Haris 13–15 |
| Fri 16 | Kowjeo 10–12 + 13–15 |

28 rows in all, none at 12:00. There are also **16 CANCELLED Other rows (title empty, shown as "School Break Camp")** on 12–13 Oct for Bank, Kowjeo, Toth, Bowy, Haris and the "Camp" coach. They are cancelled, so they hold nothing.
- No cause is stated here. How these rows came to exist is the SA's or the owner's to read; I only report what is on uat.

⇒ **For Khwan's message:** nothing is saved in the camp week, so **"her team enters the coaches into the camp week once"** is the true picture, not "check the hours". 🔴 **For the owner and SA before she does:** the 28 PENDING "Other" rows above already hold those same coaches at those same hours. Per the deploy note's own ⚠️ (§3, *"วันที่ … ครู X มีคาบแล้ว" can still appear when it is TRUE*), adding Bank 10–12 to the camp day may now be **refused because of her own Other booking**. Whether those rows are meant to be removed first, and by whom, is a DATA question for the owner. I touched nothing.

## 4. Deploy note §8
§8 is Rollback, so there is nothing to run. The §6 server-side check (`[outbox] LINE worker started`) is in the server log, which only the owner can see.

## Evidence — `project-docs/qa-2026-10-08/test090/`
`uat-dialog-cc027c4f.png` (12-16 Oct OPEN) · `uat-dialog-35ba9c9e.png` (12 -16 Oct CLOSED) · `uat-dialog-5e9ab46a.png` (12-13 Oct CLOSED) · `uat-daily-12oct.png` · `days-*.json` · `camp-bookings-12-16.json` (the 44 camp-named bookings).
