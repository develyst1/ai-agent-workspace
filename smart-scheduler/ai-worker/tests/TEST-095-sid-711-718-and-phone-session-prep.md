# TEST-095 — sid on back `d32bdc4` · front `0730275` (TASK-711 + 718): the no-phone checks, and the phone session prepared

**Tester:** Tanya (QA) · **Date:** 2026-10-12 (00:10–00:25) · **Env:** sid, admin, headless · **Brief:** `inbox/QA.md` → "▶️ sid is on back `d32bdc4` · front `0730275`"
**Verdict, no-phone part: ✅ PASS for everything that can be checked without a phone.** 711's family message is queued **into the QA family's LINE now** and is read in phone part A (§3). QA has no outbox read API, so "queued" can only be proven on the phone.

## 0 · Build identity
- **Back `d32bdc4`:** the commit adds only the family's outbox message (`class_on_again_parent`) and its two keys. **No API answer changes**, so the build cannot be told apart from `eca7d2e` without the phone (⚪). The phone read in §3 A3 is its identity check. Every `eca7d2e` behaviour is still there (the Undo below behaves exactly as in TEST-094).
- **Front `0730275`:** **comments only** (TASK-718), so by design the live JS cannot tell it from `131fff3`. What *is* checkable is that nothing visible moved (§2).

## 1 · TASK-711: an Undo of a leave (state; the message is read on the phone)
Course `60cad454` (QAChatTwo · qatt75b · Tue 16:00), session **24/11**:

| Step | Result |
|---|---|
| leave 24/11 | 200 ⇒ make-up **08/12 CONFIRMED** (marked), expiry 15/12 ⇒ 22/12 |
| **Undo**, 2026-10-12 **00:17** Bangkok | 200 `kind leave`, make-up `4b021835` (08/12) cancelled ⇒ 24/11 **CONFIRMED** again; expiry stays 22/12 (Undo never moves it) |

**Expected in the family's LINE (phone A3), in this order:** ① the make-up's cancel for **08-12-2026** (TASK-704 wording), then ② **711, verbatim:**
```
✅ มีคาบเรียนตามเดิม:
Student : QAChatTwo
Program : … SURFSKATE …
Date : 24-11-2026
Time : 16:00-17:00
Note : ยกเลิกการลาแล้ว เรียนคาบนี้ตามปกติค่ะ
```
(EN reader: `✅ CLASS ON AGAIN:` … `Note : Leave cancelled. This class goes ahead as scheduled.`) **No `Coach` line.** Committed keys checked in `d32bdc4`: `ob_class_on_again_parent_title` / `_note` = the approved TH/EN byte for byte ✅.

## 2 · TASK-718: no visible string changed
- **`git diff 131fff3 0730275 -- dictionaries.ts`:** every changed line is a comment, or a trailing comment after a **byte-identical** string (the 3 discount errors and `alreadyLinkedToOne` TH). ✅
- **Live on sid:** the JS loaded by calendar / bookings / users / teachers contains, byte for byte: L1 `errPercentRange` / `errBahtPositive` / `errValue` (EN) ✅ · L9 `alreadyLinkedToOne` (TH) ✅ · `ผูก LINE` ✅ · R62 TH ✅. **The text "DRAFT — no REQ line" ships nowhere** ✅.
- Fern's open question (the four `adminAdvance*` keys: "APPROVED 10-04" in code vs "never approved" in the COPY-SET L3) is Sober's/Porter's, not a QA item.

## 3 · ⏳ The phone session, ready to run (every piece of data already exists on sid)

### A · The QA phone (USB; the owner only plugs it in, unlocks it, and allows USB debugging). I drive it; ≈ 30 min
In the sid OA chat of QA parent 0899990763 (family QAChatOne + QAChatTwo), I scroll back and read. **I never tap the rich menu.**

| # | Item | When it was sent | What must be there (PASS) |
|---|---|---|---|
| A1 | **710** same-slot re-issue (course `60cad454`) | 2026-10-11 ~22:15 | the make-up **01-12-2026 16:00 CONFIRMED** once · **no second "CONFIRMED" and no cancel** for 01-12 after the admin's cancel |
| A2 | **704 D1** wording (same course, Undo of the 17/11 leave) | 2026-10-11 ~23:05 | the make-up cancel for **08-12-2026** in the make-up wording (no false "ระบบเพิ่มคาบชดเชยให้แล้ว") |
| A3 | **711** (Undo of the 24/11 leave) | **2026-10-12 00:17** | ① the cancel for 08-12-2026, then ② **"✅ มีคาบเรียนตามเดิม:" … 24-11-2026 … "Note : ยกเลิกการลาแล้ว เรียนคาบนี้ตามปกติค่ะ"**, no Coach line (§1) |
| A4 | **P14** class moved (727, her words) | **2026-10-12 00:17** (17/11 16:00 → 17:00) | her text: `CLASS RESCHEDULED / แก้ไขตารางเรียน ‼️` · Student · Program · Date 17-11-2026 · Time 17:00-18:00 · **Coach : qatt75b** · `Previous Schedule : 17-11-2026 16:00-17:00` |
| A5 | **713** extra group dates (series G1, both kids, ONE household) | 2026-10-11 ~22:40 | for each extra date **14/12, 21/12, 28/12**: the born-CONFIRMED make-up message, **once per child**, never a week-after-week string of make-ups |
| A6 | **716** zero-seat (28/12) | 2026-10-11 ~22:50 | the families get their seats' own cancel notices; **nothing about the GROUP row itself** |
| A7 | **719** F1 Undo (series F1, QAChatOne, 17/12) | 2026-10-11 ~23:55 (eca7d2e, before 711) | the Undo's make-up cancel for **24-12-2026**; **no** "on again" (711 was not live yet: expected) |
| A8 | **717** «ลา» inside the cut-off, **typed live by me** | during the session | course `414073f5` has today-08:00 passed. **I create a fresh class ≈ 2 h ahead** for QAChatTwo and type «ลา» ⇒ expected: `ขออภัยค่ะ การลาต้องแจ้งล่วงหน้าอย่างน้อย 3 ชม. ก่อนเริ่มคลาส` ⏎ `กรณีฉุกเฉิน กรุณาติดต่อแอดมินค่ะ` |
| A9 | **P40** (admin bell, for B3) | during the session | triggered by me; read on the OWNER's phone |
⚠️ Times A1/A2/A5/A6 are approximate (the API logs carry no timestamps). I will match by date and content.

### B · The owner's own phone, the sid OA chat (≈ 15 min, together, timed: a code lives 10 min)
| # | He does | I do | PASS |
|---|---|---|---|
| B1 | — | open «Link LINE» as web user **`qa-norate-076`** (not a coach, active, QA role) and post the code in our chat | — |
| B2 | types **สมัคร** → **แอดมิน** → the code, within 10 min; tells me the reply | check Users page = **LINKED**, LINE links page = "QA NoRate 076" | linked, admin menu |
| B3 | types **สมัคร** → **แอดมิน** → **the OLD shared code**; tells me ONLY refused / accepted. 🚫 never sends me the code | — | refused (`verify_admin_bad`), nothing linked |
| B4 | waits | trigger one admin notice (P40 from the QA phone: a QA child registration; backup: a `makeup_past_expiry` via a seat cancel on a series past its expiry, as TEST-093 produced) | it arrives: screenshot to me |
| B5 | waits | **disable** `qa-norate-076`, trigger again | **nothing** arrives; then I re-enable |
| B6 | waits | **Unlink** on the Users page, trigger again | **nothing** arrives; Users page = NOT LINKED; his menu back as before |
- While linked, his LINE gets **every** sid admin notice (sid traffic only).
- **P13** (the coach's push) stays ⚪: neither phone is a coach's LINE.
- No one ever writes the code or the old shared code into a file.

## Data on sid from this run
Course `60cad454`: 24/11 leave + Undo, 17/11 moved to 17:00. Nothing else.

---
# Phone session results — 2026-10-12 00:19–00:40 (phone 21ec5dd6 = the owner's phone, whose LINE is QA parent 0899990763; driven by me over adb)
Evidence `project-docs/qa-2026-10-12/test095/a*.png`, `b10b.png` (no screenshot contains the old code).

## Part A — all ✅
| # | Read on the phone | |
|---|---|---|
| A1 710 | 01-12-2026 16:00 CONFIRMED **once** (22:53); the next message is the G1 course (22:55): **no second CONFIRMED, no cancel** | ✅ |
| A2 704 D1 | `❌ ยกเลิกคาบเรียน: QAChatTwo … 08-12-2026 16:00-17:00`, no false "ระบบเพิ่มคาบชดเชยให้แล้ว" (23:12) | ✅ |
| A3 **711** | 00:17: ① `❌ ยกเลิกคาบเรียน … 08-12-2026` ② `✅ มีคาบเรียนตามเดิม:` Student QAChatTwo · Program Private SURFSKATE 4 HR · Date 24-11-2026 · Time 16:00-17:00 · `Note : ยกเลิกการลาแล้ว เรียนคาบนี้ตามปกติค่ะ`; **no Coach line**; order as specified | ✅ |
| A4 **P14** | `CLASS RESCHEDULED / แก้ไขตารางเรียน ‼️` · Student · Program · Date 17-11-2026 · Time 17:00-18:00 · **Coach : qatt75b** · `Previous Schedule : 17-11-2026 16:00-17:00` = her text | ✅ |
| A5 713 | per extra date (14/12, 21/12, 28/12) one CONFIRMED **per child**; per cancelled group date ONE `❌ ยกเลิกคาบเรียน: Date … Note : ระบบเพิ่มคาบชดเชยให้แล้ว` for the household; no week-after-week string | ✅ |
| A6 716 | the seats' own cancels with the true new date (`ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ 04-01-2027 / 11-01-2027`); **nothing about the group row** | ✅ |
| A7 719 | `❌ ยกเลิกคาบเรียน: QAChatOne … 24-12-2026` (00:01); no "on again" (711 not live then, expected) | ✅ |
| A8 717 / **R39** | in LINE a class inside the cut-off is **not offered** in the «ลา» list; a stale pick (cut-off raised to 72 h while the list was open) answers **R39 verbatim, TH + EN** (`คลาสเรียนใกล้ถึงเวลาเรียนแล้ว ไม่สามารถแจ้งลาในระบบได้ค่ะ กรุณาติดต่อแอดมินเพื่อ support นะคะ` / `Class is about to start. …`). 717's own sentence is therefore reached only at the calendar door (proven in TEST-094/096). Setting restored to 3. | ✅ |
🟡 Notes: (1) a group-date cancel's family notice carries no Student/Program lines and says only "ระบบเพิ่มคาบชดเชยให้แล้ว" (the new date comes in the separate CONFIRMED) — pre-existing format. (2) **Slip, declared:** a double tap in the «ลา» flow picked THU 15/10 18:00 (QAChatTwo); the bot refused `LEAVE_NO_VALIDITY`, nothing written.

## Part B
| # | Result | |
|---|---|---|
| B1/B2 link | code minted as `qa-norate-076` (never written to a file); `register` → `admin` (inside the flow "admin" is the ROLE word — routed as linking, checked in code first, so no «คุยกับแอดมิน») → code ⇒ **"ผูกบัญชีแอดมินสำเร็จ ✅ … Admin account linked ✅"**; Users page `lineLinked: true`; LINE links panel: `linked · "QA NoRate 076" · alsoParent 0899990763`; no raw LINE id in any payload | ✅ |
| **B3** old shared code | **REFUSED** — typed by the owner himself; the code was never seen, written or screenshotted by QA | ✅ |
| **B4** admin notice | admin leave on a QA course ⇒ **"LEAVE NOTICE / แจ้งลา ‼️ · Student : QAChatOne …"** arrived on the phone (read from the phone's notification list, filtered to this OA only, LINE in the background) | ✅ |
| **B5** disabled ⇒ silence | 2026-10-12 02:07: `qa-norate-076` **disabled** ⇒ admin leave on QAChatTwo `d3027ffd` 19/02/27 ⇒ the chat shows ONLY the family's own `📅CONFIRMED SCHEDULE … 26-03-2027` — **no LEAVE NOTICE** (B4 delivered one beside the family message, so its absence is the disable). Panel: `disabled: true` | ✅ |
| **B6** Unlink ⇒ silence | re-enabled, then **Unlink** (`DELETE /users/:id/line-link` 200) ⇒ `lineLinked: false`, LINE links panel **empty** ⇒ admin leave 26/02/27 (02:09) ⇒ only the family's `CONFIRMED … 02-04-2027`, **no LEAVE NOTICE** | ✅ |
Triggers left on sid (QA): leaves on QAChatOne's ORD course `7760658c` 01/12, 08/12, 15/12.

**706 family read (for TEST-096), 01:12:** `❌ ยกเลิกคาบเรียน: Date : 12-02-2027 · Time : 18:00-19:00 · Note : ระบบเพิ่มคาบชดเชยให้แล้ว` + `📅CONFIRMED SCHEDULE … QAChatTwo … 19-03-2027` ✅ — the family of a CONFIRMED seat on a PENDING group date IS told.
**Old-code protection:** every screenshot was taken only after scrolling to the newest message and was checked before saving — **the old code appears in none** (`b5-disabled-no-notice-and-706.png`, `b6-unlinked-no-notice.png`). No dump or log holds it.
**Phone state left:** LINE on its chat list; the sid OA chat's bottom bar may still be in keyboard mode (one tap on its ☰ restores the rich menu). Nothing else on the phone was touched. `qa-norate-076` is ENABLED and NOT LINKED.
**➡️ TEST-095 phone session: COMPLETE — A ✅ all · B1–B6 ✅.**
