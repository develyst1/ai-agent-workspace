# TEST-125: uat READ-ONLY smoke of the 10-26 deploy (back `f4aeb39` + migration 0072, front `f9f7f9c`, `JWT_TTL_SECONDS` fixed)

- **QA:** Tanya
- **Date:** 2026-10-26, ~22:10 Bangkok
- **Brief:** Porter's ▶️ entry in `inbox/QA.md` (10-26)
- **How:** headless, admin login, `lib-uat`. Every non-GET is aborted, so **nothing was written on uat**. Counts only, no names.
- **Screenshots:** `project-docs/qa-2026-10-26/test125/`

## Verdict: ✅ PASS on everything asked. One harness note on the 2 dialogs (below)

| Check | Result | |
|---|---|---|
| **836: login lifetime** | token claims `sub, username, role, isSuperAdmin, exp`; **exp − login = 7.000 days**; NextAuth `session.expires` − now = **7.000 days** | ✅ (was 12 h on uat) |
| **837 / 838: buttons** | a course's "จัดการแผน" window shows **"ตัดจบคอร์ส"** and **"เปลี่ยนครู / เวลา ทั้งคอร์ส"** | ✅ |
| **837: dialog** | opens: title "ตัดจบคอร์สนี้", buttons ยกเลิก / ตัดจบคอร์ส → **cancelled**, nothing done | ✅ opens / cancels |
| **838: dialog** | opens: title "เปลี่ยนครู / เวลา ทั้งคอร์ส", the course line, **วันเริ่มคาบแรก** (pre-filled 8 พ.ย. 2026), **เวลา**, **ครูผู้สอน**, ยกเลิก / ยืนยัน → **cancelled** | ✅ opens / cancels |
| **748: Daily Report** | API `/reports/daily?date=2026-10-26` **200** (all the usual keys); the Reports page shows the **"รวม (+กลุ่ม)"** (Total +Group) column with values | ✅ reads, no error |
| **Errors** | responses ≥ 500: **0** · page errors: **0** | ✅ |

### Harness note (not a defect): both dialogs showed "ทำรายการไม่สำเร็จ"
- **Cause:** each dialog fetches a **preview** as it opens (`POST /courses/:id/cancel/preview` and `POST /courses/:id/change-teacher-time/preview`). My read-only guard **aborted both POSTs** (they're in its blocked list), so the dialog showed its failure line.
- **The same previews worked on sid** (TEST-121) with the same front.
- **So on uat I proved:** the buttons are there, the dialogs open and cancel cleanly, no error. **Not proved on uat:** the preview content.
- **If you want it:** both previews compute and write nothing (a preview route; the act is a separate route). Allowing these 2 POSTs in my harness on uat is your / the owner's call; I won't widen uat's read-only rule myself.

### Blocked by my guard (for the record)
- the 2 previews above;
- 4 × `POST /cdn-cgi/rum` (Cloudflare's browser beacon).
- No other non-GET was attempted.
