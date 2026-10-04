# SIZING — next round, Team B: 5 items — @Silver, 2026-10-04
**This file only sizes the work.** 🚫 No TASK has been cut, there is no SPEC and no code was touched (Porter's freeze). Everything here was read in the back and front repos on today's shared tree.
📌 **Every claim below that carries a size was re-checked by me in the code**, not inherited. I mark what is **CERTAIN** (read in code) and what is **INFERRED**.

## The table
| # | Item | Side | Size | Depends on | Blocking question |
|---|---|---|---|---|---|
| 1 | Daily report count | **FE + BE** | **M** (FE S/M, BE S/M) | — | **Q1:** count camp as children or as coach-hours |
| 2 | Every parent refusal offers admin help, and an admin is told | **BE** (plus copy) | **M** (1–2 days) | the owner's copy for the help line and the new alert | **Q2:** the no-noise window |
| 3 | The CONFIRMED-only parent window | **BE** | Leave: **S/M**. Check-in: **XS** (wording) or **M** (a product change) | — | **Q3:** may a parent check in to an unconfirmed class |
| 4 | REQ-086, the customer edits the wording | **BE + FE** | Field titles/labels only: **M + M**. Everything: **L + M** | a migration | **Q4:** which scope first |
| 5 | F5, a digit search floods the list | **BE only** | **S** | — | none |

⚠️ **Ownership:** items 1, 2 and 3 all touch back `src/services/scheduler.service.ts` and/or `src/services/line-webhook.service.ts`. Those were Team A's files this round, so the next round's claim has to settle who owns them. Items 4 and 5 do not need them.

---

## 1. Daily report · **FE + BE · M** · 🔴 **the earlier diagnosis named the wrong cause for what she saw**
**The earlier diagnosis named three causes. Re-checked, all three are real, but none of them explains her 17 vs 19.**

**Where the numbers come from (CERTAIN):**
- The screen's numbers are mostly **not** from the backend report.
  - Front `getDailyReport` makes **two** calls (front `src/services/scheduler.service.ts:1055-1061`): `/reports/daily` and **`/calendar`**, the same read the Schedule uses.
  - `enrichDailyReport` (`:1016-1053`) works out Total booked, Attended, Confirmed, Pending, the per-type rows and the per-teacher rows **from the calendar bookings**.
  - **Only On leave and Cancelled come from the backend** (`:1042-1043`).

**The three causes, re-checked:**
- **(a) Scope:** the backend `/reports/daily` really is unscoped (back `routes/api.ts:305-306`).
  - But the main numbers come from `/calendar`, which **is** scoped. So only On leave and Cancelled are shop-wide for a coach login.
  - **Her screenshot is the admin login, with "All teachers" selected, so scope played no part in what she saw.** We do not need to ask her which login she used.
- **(b) Type rows:** ✅ **true.**
  - There are 6 booking types (back `db/schema.ts:42-53`), and the rows list 4 (front `:1009-1014`).
  - OTHER and GROUP are counted in Total booked but have no row of their own.
- **(c) Total booked:** ✅ **true.** It counts everything except CANCELLED, including SICK_LEAVE, NO_SHOW, PAUSED and EXTENDED (front `:1021-1025`).

**What she actually saw (the arithmetic is CERTAIN; which row is which is INFERRED from her screenshot):**
- **22 = Total booked · 17 = Attended · 11 = the sum of the four type rows** (2 + 0 + 8 + 1).
- The per-teacher rows add up exactly to 22 and 17.
- 🔑 **Camp is counted as COACH-HOURS, not children:**
  - A camp block becomes one `bookings` row **per coach per hour**, type `OTHER`, status CONFIRMED (back `camp.service.ts:280`).
  - **The end-of-day job marks every CONFIRMED row ATTENDED, and nothing excludes camp rows** (`jobs.service.ts:83-88`).
  - The children's own camp attendance lives in `camp_days`, which the report never reads.
- ⇒ **17 = 9 private lessons attended + 8 camp coach-hours** (4 coaches × 2 hours). **She counts camp as the 9 children who came. That is the gap.**
- 22 − 17 = 5 = the leave cells, which is cause (c).
- **Her team's "2 children were auto-checked-in" theory changes nothing.** An auto-attended row counts as ATTENDED exactly like a manual check-in.

**Fix:**
- **FE:** all 6 types (or a "Camp / Other" row); camp counted the way the owner rules; "On leave" kept out of "Booked". About 40–70 lines and 3–5 tests. The mock at `scheduler.mock.service.ts:676-697` must change too.
- **BE:** add the child count from `camp_days`, and scope the route. About 40–60 lines; there are no report tests today.
  - ⚠️ The function lives in `scheduler.service.ts:956-978`.
  - `jobs.service.ts:248` and `som-report.service.ts:39` also read it, so both must be checked.
- 🚫 **Not proposed:** taking camp rows out of the end-of-day auto-attend. That would change coach pay and attendance history. If the owner wants it, it is a separate decision.

## 2. Admin help on every parent refusal · **BE · M**
**The list is the work, so here it is (CERTAIN; `svc` means `services/line-webhook.service.ts`):**
- **22 parent-facing refusals across 28 send sites**, grouped by flow:
  - **Registration and linking (4):** `verify_parent_other`, `verify_parent_other_family`, `verify_parent_archived`, `add_phone_now_registered`.
  - **Add student (4):** `add_no_parent`, the 5-child cap (a Thai-only throw, `parent.service.ts:241`), `add_generic_err`, `add_name_reserved`.
  - **Check-in and QR (6):** `empty_checkin`, `checkin_notfound`, `num_notfound`, `checkin_too_late`, the thrown check-in errors (`checkin.service.ts:93/106/109/121`), `qr_none`.
  - **Leave (5):** `empty_leave`, `empty_leave_cutoff`, `leaveNoticeMessage`, `LEAVE_LOCKED` and other throws, `num_notfound` for a typed leave.
  - **Children and courses (2):** `children_none`, `course_none`.
  - **Account and system (2):** `suspended_notice`, `generic_error`.
- **Excluded:** 10 validation re-prompts, such as a bad phone or a bad birth date. Those are the parent correcting input, not being refused.
- ⚠️ **8 of the 22 already say "contact admin/shop"**, so adding a help line would say it twice. Their wording has to be reconciled.
- 🔴 **A gap found on the way:** the two-strikes handover (`handover_to_admin`, svc:351) mutes the bot but **notifies no admin.** It belongs in this item.

**How it would be built:**
- There is **no shared refusal path**: the refusals are scattered `reply()`/`send()` calls.
- ⇒ One new helper next to `doCallAdmin` that appends the help line and calls `notifyAdmins` with a new kind (e.g. `parent_refused`). Then the 28 sites are rewritten to use it.

**No-noise (CERTAIN):**
- Nothing deduplicates today. Every "คุยกับแอดมิน" tap already alerts every admin again (svc:1578 unmutes first).
- The only dedup mechanism is the outbox `idempotencyKey`, a permanent and global unique key (`schema.ts:816-823`). So a time window needs a time bucket in the key, made per admin. `notifyAdmins` does not accept a key yet.

**Cost:**
- About 200–300 lines. Most of the risk is in the tests that pin exact reply text.
- **The help line and the new admin alert are new wording**, which is blocked on the owner, like the four existing `*_asked_for_admin` alerts that still print the generic line.

## 3. The CONFIRMED-only parent window · 🔴 **two doors, and they are NOT the same fix**
**There are two separate queries (CERTAIN):**
- check-in: `findTodayBookingsForParent`, `checkin.service.ts:154-160`;
- leave: `findUpcomingBookingsForParent`, `:174-180`.
- Each one hard-codes `eq(b.status, "CONFIRMED")`.

**Leave: TASK-598's rule fits. S/M.**
- The window shows CONFIRMED only, but **the act accepts any status except ATTENDED and SICK_LEAVE**: the `sick-leave` branch of `updateBookingStatus` (`scheduler.service.ts:3983-3998`) has **no status allow-list**, only the cut-off.
- So the window is too narrow (it drops PENDING and EXTENDED), **and the act is too wide**: it would "leave" a CANCELLED or NO_SHOW class.
- The fix is one named set, read by both the window and a new guard in the act.
  - `COURSE_LIVE_STATUSES = PENDING · CONFIRMED · EXTENDED` (`lib/course-plan.ts:7`) already exists and is the likely set.
- About 15–30 lines plus tests. The pinned tests are `leave-window-req085.test.ts:90-153` and `duo-course-req095-13.test.ts:360`.
- Touches `checkin.service.ts`, `line-webhook.service.ts` and `scheduler.service.ts`.

**Check-in: TASK-598's rule changes NOTHING.**
- **The window already equals the act.** `checkinByToken` itself refuses anything not CONFIRMED (`checkin.service.ts:108-110`: *"คาบนี้ยังไม่พร้อมเช็คอิน (ต้องยืนยันตารางก่อน)"*).
- ⇒ Letting a parent check in to a PENDING class is **a product change to the act.** It also raises billing and end-of-day questions, since the auto-attend is CONFIRMED-only too.
- The cheap alternative is **wording, XS:** say "your class is not confirmed yet" instead of "no class today".
- ⚠️ **This corrects the earlier "it costs nothing extra to fix both in TASK-598".** It does for leave, but not for check-in.
- 📌 **Worth one check:** the daily reminder loads every row for the date with no status filter (`jobs.service.ts:392`). If PENDING rows survive later filtering, a parent could be reminded about a class that check-in then says does not exist.

## 4. REQ-086, the customer edits the wording · **BE M–L + FE M**
**What no longer matches the July spec (SPEC-078), all CERTAIN:**
- **"Notifications are English-only templates" is no longer true.** They render in the recipient's language (`outbox.service.ts:86-87`), and several titles really differ by language (e.g. `cl_title`, `mv_title`, `ob_paused`). ⇒ **Every editable key needs a TH slot and an EN slot.**
- **The scope has grown:** 4 field formats in the spec; **11 `TemplateKey`s and about 40 notification kinds** today. Two arrived only this week (`teacher_leave_recorded` and `teacher_leave_lifted`).
- **"No text box" holds only for field blocks.** Many messages are free text with `{var}` placeholders (`ob_paused`, `ob_makeup_far`, `ob_tl_nothing_cancelled {n}`, …), so placeholder validation is needed after all.
- **The registration screens are one bilingual block per key.** `both()` relies on TH === EN (`line-i18n.ts:827-836`), so an edit to only one side would send the screen twice.
- **Some wording is outside the dictionary** and could not be edited without first moving it in: `leave-notice.ts`, `camp-deduction.ts`, `weekly-digest.ts`, `attention.ts`, and `HR` / `1st Trial`.

**Build today:**
- **DB:** a new override table (key, lang, text, updated_at, updated_by). That needs a migration; the latest is 0064.
- **Read path:** `t()` is synchronous and pure, and is called from about 133 files.
  - ⇒ A module-level override map consulted inside `t()`, loaded at start and refreshed on write.
  - 🔴 **The main risk:** jobs run as separate processes, so caching and refresh across processes is real work.
- **API:** list, edit, reset and preview. Preview can reuse the inventory script's fake payloads and the real renderer.
- **FE:** the existing Settings page and the existing `menu:settings` / `action:settings.edit` keys are enough. **No new permission is needed.**
- **Sizes:** field-block titles and labels only = **BE M + FE M.** Every kind plus the chat replies = **BE L + FE M.**

📌 **Fern's workbook went stale in one day** (TASK-608). If her revisions repeat, every round makes the list stale and every change of hers costs a team round. **That is the case for REQ-086. Whether it ranks above other work is the owner's call.**

## 5. F5, a digit search floods the list · **BE · S**
**Cause (CERTAIN):**
- `studentSearchConditionsOn` (`parent.service.ts:642-650`) adds `phone ILIKE '%<digits>%'` **whenever the search contains any digit.**
- `Ari3y` therefore adds `phone ILIKE '%3%'`, which matches nearly every parent. TEST-075 recorded 228 rows for `Ari3y`, and 1347 for `2`.
- The same rule serves `/students`, courses, vouchers and the eligibility picker (INFERRED from the shared function), so all of them flood the same way.

**Fix:**
- Add the phone clause **only when the search is phone-shaped**: after removing spaces, `-`, `+` and `()`, only digits remain, and there are at least 3.
- The name match is unchanged.
- One pinned test changes: `parent.service.test.ts:20-22`, the mixed `"โอ๊ด 081"` query.
- Does **not** touch `scheduler.service.ts`.
- **Separate and minor:** `%` and `_` in a search are not escaped.

---

## Questions — all of them, one per item
- **Q1 (item 1):** in the Daily report, should **camp count as the children who attended** (from `camp_days`) or as **coach-hours** (today's behaviour)? And should camp have its own row?
  - *My proposal:* children, in a "Camp" row of its own. That is how Khwan reads the day.
- **Q2 (item 2):** what is the no-noise rule?
  - *My proposal:* **at most one admin alert per parent per refusal kind per 30 minutes.** The parent still sees the help line every time.
  - The help line and the alert are new wording, which is the owner's to approve.
- **Q3 (item 3):** for **check-in**, may a parent check in to a class that is not yet confirmed?
  - *My proposal:* **no.** Fix the wording now (XS), and leave the act as it is. Leave gets the real fix (TASK-598's rule).
- **Q4 (item 4):** **which scope first:** the notification titles and labels only (M + M), or every message including the bot's replies (L + M)?
  - *My proposal:* titles and labels first, because they are what Fern's revision touches most. The replies would follow.

---

## Rulings received, 2026-10-04 (relayed by Porter)
- **Item 1, the Daily report: DROPPED by the owner** ("daily report ทิ้งไปก่อนเลย"). Q1 is withdrawn. The analysis above is kept so nothing is lost if he brings it back. 🚫 Do not size it further or raise it again.
- **Q2, the help line:** at most **one admin alert per parent, per refusal kind, per 30 minutes.** The parent still sees the help line **every** time.
- **Q3, check-in:** **NO**, a parent may not check in to an unconfirmed class. It is the **XS wording** branch, and the act does not change. The new wording is the owner's to approve.
- **Q4, REQ-086:** start with the notification **titles and labels** (M + M). The bot's replies come in a later pass.
- **The settled next-round list:** the help line on parent refusals · the CONFIRMED-only parent window · REQ-086 (titles and labels) · F5. REQ-112 A and B are held by Porter. The facts are in `FACTS-REQ-112-teamB-2026-10-04.md`.
