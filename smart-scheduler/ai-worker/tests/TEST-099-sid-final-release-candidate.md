# TEST-099 — the FINAL sid pass before uat (back `1f82c32` · front `efb8551`, Journal 70)

**Tester:** Tanya (QA) · **Date:** 2026-10-12, 20:45–21:15 · **Env:** sid, admin, headless + the owner's phone (21ec5dd6, LINE = QA parent 0899990763) · **Brief:** `inbox/QA.md` → "▶️ GO: the FINAL sid pass"
**Verdict: 🔴 FAIL — two findings.** **F1** (TASK-735, a partial camp cancel not re-sent; Bob has a fix waiting). **F2** (REQ-118: every area-code path answers **500** on sid, so neither address picker can load). Everything else that is reachable PASSES. The old code is in no image.

## 🔴 F2 — REQ-118: every area-code path returns 500 on sid (both pickers dead)
- `GET /api/areas/provinces` ⇒ **500 INTERNAL**; `/areas/districts?province=38` ⇒ 500; `/areas/subdistricts?district=3801` ⇒ 500. A malformed query (`province=xx`) answers the proper **400 VALIDATION**, so the route is mounted and only the **data-dependent** part fails.
- **Admin PATCH `/parents/:id`** on the QA parent `a3fb456e`:

  | Case | Result | |
  |---|---|---|
  | full triple บึงกาฬ (38/3801/380101) | **500 INTERNAL** | 🔴 |
  | inconsistent triple | **500 INTERNAL** (should be a refusal) | 🔴 |
  | half triple | 400 `ที่อยู่ต้องมีจังหวัด อำเภอ/เขต และตำบล/แขวง` | ✅ |
  | old name not one of the 77 (`บึงกาฬฬ`) | 400 `PROVINCE_UNKNOWN` | ✅ |
  | old name, a real one (`บึงกาฬ`) | 200, province set, codes null | ✅ |
  | null ×3 | 200, cleared | ✅ |

  The parent was restored to `กรุงเทพมหานคร`.
- **On screen:** People → **Add parent**. The form shows Parent's province / District / Sub-district, and its load calls `/areas/provinces` ⇒ **500**, so there is nothing to pick (`req118-admin-form.png`). I closed it with Cancel; nothing was saved.
- **Not testable because of F2:** the register PAGE picker with บึงกาฬ (it also needs a LINE login, which a headless browser does not have) · the TH/EN rendering of a stored address (`addressTh`/`addressEn`; no address can be stored as codes).
- No cause is stated here (the SA's job). The fact: the validator answers, the dataset-backed reads fail. The pattern fits the dataset not being readable on the sid box; the SA should confirm.
- ✅ **The LINE CHAT asks NO address:** «Add» ⇒ name `QA099Kid` ⇒ birthday `01-01-2018` ⇒ **straight to the summary**, no address prompt. The summary shows the **address on file** (`ที่อยู่ / Address: กรุงเทพมหานคร (ที่อยู่เดิมของครอบครัว) / (the address we have on file)`). Cancelled there (no 5th QA child created). (`req118-chat-add-no-address.png`)

## 🔴 F1 — TASK-735 (D2): a partial camp cancel is NOT re-sent when the days left equal an earlier message's days
Camp week "QA-099 camp" `d8e7c075` (09–13 Nov), QAChatTwo:

| Time | Act | Family message | |
|---|---|---|---|
| 20:49 | package A HALF/DAILY, note "QA camp remark", first week 09+10 AM | `📅CONFIRMED SCHEDULE: … Camp — half day (per day) · Date : 09-11-2026 - 10-11-2026 · Time : 10:00-12:00 · Remark : QA camp remark` | ✅ |
| 20:50 | A + 11/11 AM (a change) | the same, `Date : 09-11-2026 - 11-11-2026` | ✅ |
| **20:50:20** | **A: cancel 11/11** (partial; 09+10 left) | **NOTHING.** The family's last word still says 09–11 Nov | 🔴 |
| 20:50 | package C FULL, 12/11 | `… full day (per day) · Date : 12-11-2026 · Time : 10:00-15:00` | ✅ |
| 20:51 | **C: cancel its LAST day** | **`❌ ยกเลิกคาบเรียน:` · Student · Program · Date 12-11-2026 · Time 10:00-15:00** | ✅ |
| 20:51 | package E HALF PM, 13/11 | `… Date : 13-11-2026 · Time : 13:00-15:00` | ✅ |
| 20:53:24 | A: cancel 10/11 (09 left, a set never sent before) | **re-sent:** `Date : 09-11-2026 · Time : 10:00-12:00 · Remark : QA camp remark` | ✅ |

⇒ A partial cancel **does** re-send, **except** when the days left equal an earlier message's days (here the first booking's 09–10). Bob's fix is waiting to be committed; **re-run after the redeploy** (the same 7 steps on a fresh week).
Hours ✅ (AM 10:00-12:00 · PM 13:00-15:00 · FULL 10:00-15:00, with a colon) · Remark ✅ shown / omitted · `Program` = the sale name (`Camp — half day (per day)`), 📋 DRAFT per Khwan Q3.

## P26 (TASK-736) — the camp family reminder
⚪ **Not observable on sid:** `camp_reminder_enabled` = **off** (the default) on sid, and the reminder rides the morning job, which QA cannot trigger. Proven by Bob's tests only. To see it: the owner turns the flag on for one morning, with a QA camp day booked for that date.

## The TEST-098 fix — the admin «ครูลา» on a COURSE make-up
Course `458f6b42` (QAChatTwo): the CONFIRMED make-up 09/03/27 ⇒ admin cancel `TEACHER_LEAVE` (20:55) ⇒ the family: **`❌ ยกเลิกคาบเรียน: … 09-03-2027 … เหตุผล : ครูลา · Note : ระบบเพิ่มคาบชดเชยให้แล้ว`** ✅ (`098fix-admin-krula-reason.png`). **The course weeks are UNCHANGED:** `maxWeek 6`, expiry `2027-03-09` before and after; the replacement re-booked into the freed 02/03 slot ✅.

## 734 — the isolated bump (the owner's OA Manager)
Dong_08 was put on top (20:48 "Test") by the owner, then I pressed «คุยกับแอดมิน» at **20:51:39**. The phone shows the user-side **`คุยกับแอดมิน`** bubble (20:51) and the unchanged bot reply ✅ (`734-isolated-bump-and-d2-full-pm.png`). ⏳ **Whether the chat jumped above Dong_08 is the owner's screenshot** (asked via Porter at 20:51).

## Regression (re-run on THIS build)
| Item | Result | |
|---|---|---|
| 710 same-slot | course `91433a60`: leave 13/04/27 ⇒ make-up 04/05 ⇒ admin cancel ⇒ replacement 04/05 same slot, CONFIRMED + marked | ✅ |
| 713 one extra date | series R2 `9be65792` (Mon 18:00, 07/06–12/07/27, 2 seats): cancel 14/06 ⇒ ONE extra date 19/07, both seats CONFIRMED | ✅ |
| 716 retire | 19/07: one seat out ⇒ stays; the last ⇒ CANCELLED | ✅ |
| 719 revive | series F1c: E 20/05/27 retired by the seat's leave ⇒ Undo ⇒ **E CONFIRMED + seat CONFIRMED**, make-up 27/05 cancelled | ✅ |
| 712 own hours inside the day | a–e as TEST-096 (both ends refused, equal ends saved, valid pair saved, day-only shrink refused); day 26/10 restored | ✅ |
| 717 cut-off sentence | 24 ⇒ "…อย่างน้อย 24 ชม.…", 72 ⇒ "…72 ชม.…"; setting restored to 3 | ✅ |
| 730/732 voucher sold (phone, 21:06) | `VOUCHER 5 HR · *Expiry date : 3 Months · Remark : QA TEST-099 remark` | ✅ |
| 711 (phone, 21:06) | make-up cancel 11-05-2027, then `✅ มีคาบเรียนตามเดิม … 20-04-2027 … ยกเลิกการลาแล้ว เรียนคาบนี้ตามปกติค่ะ` | ✅ |
| 734 bubble · 731 P11 Reason · 727 rows | live above / TEST-098 | ✅ |

## Declared slip
While aiming the REQ-118 PATCH tests at the QA parent, my `GET /parents?search=0899990763` ignored the filter and returned **another sid parent, `3b62a2d6` (phone 0928988998, no name)**. Six PATCHes hit its address before I noticed: set province `บึงกาฬ`, then null ×3. **Its address was empty before and is empty now** (verified: province/codes all null). Its `updatedAt` moved (2026-10-12 13:57 UTC) and the parent-edit history may hold those rows. No other field was sent. The tests were then re-run on the right parent by its id.

## QA data added
Camp week `d8e7c075` + packages A/C/E (QAChatTwo) · the «ครูลา» cancel on `458f6b42` · the regression rows below.

---
# Re-run — back `5aa0f1c` (F1 fix + TASK-802), front `efb8551` unchanged · 2026-10-12 21:30–21:50
**Verdict: ✅ F1 FIXED · ✅ F2 FIXED.** One 🟡 data note (English sub-district names in province 38).

**Build identity:** `/api/areas/*` now answer rows (they returned 500 on `1f82c32`), so the dataset is in the build. The F1 behaviour changed (below).

## F2 — REQ-118
- `GET /api/areas/provinces` ⇒ **77** rows, incl. `{"code":"38","nameTh":"บึงกาฬ","nameEn":"Bueng Kan"}` · `districts?province=38` ⇒ 8 · `subdistricts?district=3801` ⇒ 12. Bangkok 1001 / Chiang Mai 5001 spot-checked: TH and EN match.
- **Admin PATCH (QA parent `a3fb456e`, restored to `กรุงเทพมหานคร` after):**

  | Case | Result | |
  |---|---|---|
  | full triple 38/3801/380110 | 200, `province บึงกาฬ`, codes stored, `addressTh "วิศิษฐ์ เมืองบึงกาฬ บึงกาฬ"`, `addressEn "Wisit Bueng Kan Bueng Kan"` | ✅ |
  | inconsistent triple | **400 VALIDATION** (no more 500) | ✅ |
  | half triple | 400 | ✅ |
  | name not one of the 77 | 400 `PROVINCE_UNKNOWN` | ✅ |
  | name-only, another province (`เชียงใหม่`) over stored codes | 200, province changed and **codes cleared** (no stale codes) | ✅ |
  | null ×3 | cleared | ✅ |

  The inconsistent triple's message is the generic "ที่อยู่ต้องมีจังหวัด อำเภอ/เขต และตำบล/แขวง". It is the correct refusal, but it does not say the levels disagree; that's a wording nicety for the SA.
- **Admin "Add parent" form on screen:** search `บึงกาฬ` ⇒ 1 option ⇒ District 8 options ⇒ Sub-district 12 options ⇒ the form holds `บึงกาฬ/38 · เมืองบึงกาฬ/3801 · วิศิษฐ์/380110`. All three area calls returned 200. **Closed with Cancel** (`rerun-f2-admin-picker.png`). ✅
- **The register PAGE's picker:** it reads the same routes (77 provinces incl. **38**). The page itself sits behind LINE Login, so a headless browser cannot open it; ⚪ on screen, ✅ by the route it uses.
- 🟡 **Data note (the upstream dataset, not the code):** province 38's sub-districts carry **wrong English names** for 380101–380109, e.g. `บึงกาฬ | Seka`, `โนนสมบูรณ์ | Sang`, `หอคำ | Ban Tong`; 380110–380112 are right. District 3801 `เมืองบึงกาฬ` is `Bueng Kan` (not "Mueang Bueng Kan"). Thai names and codes are right, and the pickers show Thai, so only **`addressEn`** for those sub-districts would read wrong. Worth a machine check of TH↔EN across the dataset before EN addresses are shown anywhere.

## F1 — TASK-735, the exact sequence on a fresh week ("QA-099b camp" `4d430ee9`, 16–20 Nov)
| Time | Act | Family message | |
|---|---|---|---|
| 21:45 | book 16+17 AM, note | `Date : 16-11-2026 - 17-11-2026 · Time : 10:00-12:00 · Remark : QA rerun remark` | ✅ |
| 21:46 | + 18/11 | `Date : 16-11-2026 - 18-11-2026 …` | ✅ |
| **21:46** | **cancel 18/11** (days left = the first message's days) | **re-sent: `Date : 16-11-2026 - 17-11-2026 · Time : 10:00-12:00 · Remark : QA rerun remark`** | ✅ **FIXED** |
(`rerun-f1-partial-cancel-resent.png`)
