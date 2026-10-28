# TASK-845 — FE: **back-office FINAL UI: NOTIFICATION (2) + the front-office pages (7)** (REQ-133) — @Fern (≈ 1.5 d)
**From @Sober to @Fern, 2026-10-27.** After TASK-844. Folder `som-balance-backoffice-spec/final-ui/`, files under `src/pages/a/notify/`, `src/pages/a/frontoffice/`, `src/mock/a-notify.ts`, `src/mock/a-fo.ts`. Build to `final-ui/CONVENTIONS.md`.

**Sources:**
- v3 `pages/a-notify/`, `pages/a-frontoffice/`, `data/a-notify.js`, `data/a-fo.js`.
- **v3 `pages/b-fo/` + `data/b-fo.js`.** The five `/fo/*` pages were Team B's in v3; in REQ-133 **all the front-office pages are Team A's** (Porter's split). Read Team B's v3 files as the source; don't edit them.
- Khwan's v3 notes (the two VERBATIM files in `project-docs/customer-2026-10-22-backoffice-prototype-v3/`).

## The pages (v3 routes, minus the `#`)
- **NOTIFICATION:** `/notify/settings` (a plain recipient list; no per-person opt-out matrix, ruling C-h) · `/notify/inbox`.
- **SETTING, every one `fo: true`** (the shell draws "หน้าบ้าน (SOM SCHEDULE)"):
  - `/frontoffice/teacher-roles` (F3, multi-role + STAFF);
  - `/frontoffice/coach-login` (F6);
  - `/fo/branch` (F1);
  - `/fo/payment` (F2, **default Transfer**, editable; **installments**: each payment on its own date);
  - `/fo/trial-link` (F4);
  - `/fo/no-teacher` (F5);
  - `/fo/confirm-camp` (D3, also sets Transfer).

## Done = (report in `inbox/SA.md`)
- `tsc` 0 · build 0 · offline: the 9 pages reachable per role, every control does something, 0 console errors / warnings, 375 px OK.
- Page → her-note table, as in TASK-844.
- **Then tell me "Team A pages done"**: the whole of Team A's UI goes to my check, then to Porter → Tanya.

---
## FE report — Fern, 2026-10-27 — TASK-845 DONE: NOTIFICATION (2) + the front-office pages (7). No git; no smart-scheduler repo touched; Team B's files untouched
**Files:** `final-ui/src/pages/a/notify/{NotifySettings,NotifyAlert}.tsx`, `src/pages/a/frontoffice/{RoleSetting,UserSetting,Branch,Payment,Conversion,ParkRent,ConfirmCamp}.tsx`, `src/mock/a-notify.ts`, `src/mock/a-fo.ts`, `src/pages/a/index.ts` (17 Team A pages). All 7 front-office pages are `group: "SETTING"` + `fo: true` (the shell draws the "หน้าบ้าน (SOM SCHEDULE)" label; inside the Payment Method and To Confirm Camp dialogs I use `<FoBadge />` by hand, as §5 says). v3 routes kept (`/frontoffice/*`, `/fo/*`).
**Gates:** `tsc` 0 · `npm run build` 0 · **`dist/index.html` = 1,243,548 B** (it also carries Team B's pages as registered now). Alone from an empty folder, `file://`, headless **Edge and Chrome**: **all 17 Team A pages × 3 roles** reachable or no-access exactly per `roles`; **every control clicked: 0 dead**, **0 console errors / warnings**; **375 px: no sideways scroll on any page**. (My click-through flags 4 controls as "unchanged" — NumberInput steppers on Park Rent and the password eye in Create User — because those Mantine controls react to real mouse events, not a synthetic `click()`; I clicked them with real mouse events: 800 → 801 / 800 ฿, and the eye turns the field `password → text`.)
**Page → her notes (quoted from the VERBATIM files):**
| page | what I applied |
|---|---|
| Notification Setting (9) | a **plain recipient list** (who · role · gets) — no opt-out matrix; "Everyone always gets all their own items — there is nothing to switch off. = **ไม่ต้องมีค่า**" (removed); "Coaches (Full-time / Part-time) = **Coach** (Full-time / Part-time)"; "OWN ITEMS — ALWAYS = **MYSELF - ALWAYS**" |
| Notification Alert (10) | "ใช้คำตามที่เราเคยแก้ใน payment detail": the item texts use Payment Detail's wording ("For 50 : … = 2", "(Sat) : 7 Hr → ชม.ที่ 5–6 = 2 Hr × 350 ฿"); "**21/10/26 10:12 ไม่ต้องใส่เวลา**": dates only; an Admin's alerts carry no ฿ |
| Role Setting (11) | ✓; full Type words, Role-by-day (Freelance / Part-time per day, editable) |
| User Setting (12) | "NO LOGIN YET = **NOT LOGIN YET**"; "Menu = **Visible**"; "After signing in = **Authorization**"; "Invisible Other people's pay · revenue = **ไม่ต้องขึ้น ขึ้นแค่อันที่เขาดูได้**" (row removed, only what he can see is listed) |
| F1 (13) | "Branch on a booking = **Branch for booking**" |
| F2 (14) | "**confirm auto เงินเข้าทั้งหมดไปเลย มีแค่ edit ไว้ก็พอ ไม่ต้องมากดแล้ว**": NO Confirm button, the method is Transfer by default, an **Edit** in the front card and a **Save** row in the back table; "Installments = **Installment**"; each installment on its own **date received** (B, answered in LINE) with its own Payment Method; Add an installment adds a row |
| F4 (15) | "**หน้านี้จะขึ้นรายละเอียดของทั้งเดือน … แบ่งตามค่าโบนัส 50/100**": month picker + a Bonus 50 table and a Bonus 100 table + Special Case with **Who get Bonus?** (1st / 2nd / Share 50 / 50); "from Trial of … / RENEW of course … (ended …) = **ไม่ต้องขึ้นวันที่**": no dates on rows |
| F5 (16) | "หัวข้อ No Teacher ใช้ **Park Rent**": page title "F5 · Park Rent" (the teacher option stays "No Teacher"); Payment Method default Transfer |
| D3 (17) | "Confirm camp = **To Confirm Camp**": the title, the button, the dialog; also sets Transfer and sends the LINE CONFIRMED SCHEDULE (B, answered in LINE) |
**Judgement calls — please look:**
1. **F4: her "หน้าบ้าน (SOM SCHEDULE) = ไม่ต้องใส่ได้ไหมคะ"** (she asks to drop the label on this page). Your task says every front-office page is `fo: true`, and the label also serves "she sees at a glance what is front office", so **F4 still shows it**. If you want her request honoured, F4 needs `fo` off (then the shell shows no label) — say so and it is one word.
2. **User Setting › Individual Information:** v3 switched the viewer to Coach; the contract gives pages no way to switch the role, so it opens a **dialog** with Kid's information (type, login, Visible).
3. Notification Alert for a Coach / Admin lists only their own items (R0), the CEO's list shows all six types.
4. The page titles keep v3's "F1 ·", "F2 ·"… prefixes (she used them in LINE).
**Not done:** not clicked through by a person.
