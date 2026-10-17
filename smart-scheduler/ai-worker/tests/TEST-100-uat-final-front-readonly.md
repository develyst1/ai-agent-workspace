# TEST-100 — uat READ-ONLY pass, the FINAL front-office release (back `5aa0f1c` · front `efb8551`, Journal 70)

**Tester:** Tanya (QA) · **Date:** 2026-10-12 ~22:00 · **Env:** uat (frontoffice.develyst.online), admin, headless · **Brief:** `inbox/QA.md` → "▶️ GO: uat READ-ONLY pass" · `DEPLOY-uat-2026-10-12-final-front-office.md` §10
**Verdict: ✅ PASS — every item that can be checked read-only.** 🚫 **Zero writes:** after login every non-GET to the app was aborted in the browser (`blocked writes: 0`; nothing even tried). Dialogs were opened, read and closed with the ✕; no Save / Undo / Cancel / Link / Book / Sell was pressed anywhere. **No error banner** on any page visited, **no 5xx** from the API.

| §10 item | What uat shows | |
|---|---|---|
| **Build identity / the back answers** | `GET /api/areas/provinces` ⇒ 200, **77** rows, `{"code":"38","nameTh":"บึงกาฬ","nameEn":"Bueng Kan"}` (TASK-800/802) · `GET /api/me/line-link` ⇒ 200 `{"lineLinked":false}` (TASK-725) · `GET /api/users` rows carry `lineLinked`, **no raw LINE id** in the payload | ✅ |
| «Link LINE» for an admin | admin header menu: `Change password · Link LINE · Sign out` (not opened: opening mints a code) | ✅ |
| …not for a coach | ⚪ no coach login for uat in the QA access file (proven on sid, TEST-093/096) | ⚪ |
| **Users page, LINE column** | headers `… Status · LINE · Created`; 31 users, **none LINKED** (expected: the new-way link has not been used on uat yet) (`users-page.png`) | ✅ |
| **The old-way admin** | API `/users/line-admins`: ONE `kind: legacy`, `…b511`. The **LINE links page** shows it: **"Unknown account · id ends …b511 · Linked with the old code (name unknown) · Remove admin rights"**, plus the server's three "what this page cannot show" lines (`line-admins-panel-2.png`). It lives on the LINE links page, not the Users page, because a legacy link has no web user. | ✅ |
| **The parent form's 3-level picker** | People → Add parent ⇒ the form shows `Parent's province (home address) · District · Sub-district`; typing `บึงกาฬ` ⇒ 1 option, picked ⇒ **District 8 options** (เมืองบึงกาฬ, พรเจริญ, โซ่พิสัย, เซกา, …). Closed with ✕, **nothing saved** (`parent-form-picker.png`) | ✅ |
| The registration page's lists | it reads the same `/api/areas/*` routes (which answer, above). The page itself sits behind LINE Login, so a headless browser cannot open it | ⚪ by screen · ✅ by route |
| **The voucher sale form's optional note** | Bookings → Vouchers → Issue voucher ⇒ `… Validity (months) * · Note (optional) · Discount …`, the `data-voucher-note` box present (1). Closed with ✕ (`voucher-form.png`) | ✅ |
| **The camp week dialog opens** | Camp → "28 Sep - 2 Oct" → Roster → Edit ⇒ `Edit 28 Sep - 2 Oct`, 5 day rows. Closed with ✕ (`camp-dialog.png`) | ✅ |
| The outbox worker started | the server log is the owner's (§10) | ⚪ owner |

**Notes**
- My first capture of the LINE links page was taken before its list arrived and showed "No LINE account has admin rights". After waiting for `/users/line-admins`, the legacy row is there. **Not a defect**; recorded so nobody chases it.
- Browser console: two 404s for static resources and `ERR_FAILED` lines from the beacons I block (Cloudflare `cdn-cgi`). No API error.
- 🟡 Carried from TEST-099 (data, not code): the dataset's English names for province 38's sub-districts 380101–380109 are wrong. Only `addressEn` would show it.

Evidence: `project-docs/qa-2026-10-12/test100/`.

---
# 803 — the English area names (DOPA overrides), sid + uat · 2026-10-12 ~23:05
**Verdict: ✅ PASS on both.** uat: GET only (public `/api/areas/*`), nothing pressed.

| Check | sid | uat | |
|---|---|---|---|
| `380101` | `บึงกาฬ \| Bueng Kan` (was "Seka") | the same | ✅ |
| `380102`–`380109` | Non Sombun · Non Sawang · Ho Kham · Nong Loeng · Khok Kong · Na Sawan · Khai Si · Chaiyaphon (were Sang · Tha Kok Daeng · Ban Tong · Pong Hai · Nam Chan · Tha Sa-At · Nong Thum · Sok Kam) | the same | ✅ |
| district `3801` | `เมืองบึงกาฬ \| Mueang Bueng Kan` (was "Bueng Kan") | the same | ✅ |
| the names that were misplaced | `380401 เซกา \| Seka` · `380402 ซาง \| Sang` · `380403 ท่ากกแดง \| Tha Kok Daeng`, now under their own district 3804 | the same | ✅ |
| unchanged areas | Bangkok `100101–100103`, Chiang Mai `500101–500103` as before | the same | ✅ |
| **Build identity (uat)** | — | the override answers (the old file said "Seka") | ✅ |
| **sid People card, EN mode** | QA parent set to 38/3801/380101 ⇒ DTO `addressEn "Bueng Kan Mueang Bueng Kan Bueng Kan"`, and the card shows **`📍 Bueng Kan Mueang Bueng Kan Bueng Kan`** (`803-people-card-en.png`). Restored to `กรุงเทพมหานคร` after | — | ✅ |
