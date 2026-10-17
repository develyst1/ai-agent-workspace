# DEPLOY — uat — **the FINAL front-office release (RE-MEASURED, release candidate): Team A 708–719 + 800/801 · Team B 725–736 + the TEST-098 fix · migrations `0067` `0068` `0069`**
> ✅ **CLEARED — @Porter, 2026-10-12.** All three gates met. **(1) ✅ @Tanya's TEST-099 re-run PASS on back `5aa0f1c` / front `efb8551`** (F1 — 735's partial-cancel re-send — and F2 — the area dataset in the compiled build — both FIXED) · **(2) 734's option A DROPPED** (the owner's phone: no bump in OA Manager) ⇒ **NO menu step in this release** (§9) · **(3) ✅ the owner approved 729's fallback (`ผู้ใช้ LINE · HH:mm`), 730 (D1), 735 (D2); 736 is set 1** — `COPY-REVIEW-2026-09-29.md`, last section.
> *(Re-measured by @Sober 2026-10-12 on the committed sid build. Replaces the `d32bdc4` / Path-A version of this note: the owner chose Path B, so everything ships as ONE release.)*

**Written by @Sober for @Porter, 2026-10-12.** 🔴 **The REAL OA and REAL families.** On top of what uat runs now (back `a2185b2` · front `2db1c57`, `DEPLOY-uat-2026-10-08-706-707.md`, read-only checked in `TEST-090`).
**Build from:** back **`5aa0f1c`** · front **`efb8551`** — both clean, both = what sid runs. **No checkout step any more:** the `dong` branch IS the release (check below).

## 🔴 READ FIRST
# 🚫 DO NOT RUN `line:remove-menus`. EVER. — and NO menu step at all in this release (734's option A was dropped, §9): uat's menus stay exactly as they are.
**`LINE_ADMIN_VERIFY_CODE` is an environment value — never in a file.** From this release the code no longer READS it (the shared admin code is retired, §5). Removing it after the deploy is the owner's choice.

## STEP 0. Both trees on the named commits, clean
In the BACK folder, then the FRONT folder:
```bash
git status
```
```bash
git log --oneline -1
```
**Back: nothing to commit, `5aa0f1c`. Front: nothing to commit, `efb8551`.** Anything else ⇒ STOP: never build uat from a commit this note does not name.

## 0. ⚠️ The back `.env` → **uat values** before anything else
It holds the **sid** values now. **sid and uat databases share ONE name (`smart_scheduler`)** — prove which one you are on with §1's first two reads. 

## 1. Migrations — **`0067` · `0068` · `0069`** (all forward-only, nullable columns, NO data rewritten)
- **`0067` (TASK-725):** `users.line_user_id` · `line_link_code_hash` · `line_link_code_expires_at` + two partial unique indexes (the admin LINE link).
- **`0068` (TASK-732):** `vouchers.note` (the voucher sale's Remark).
- **`0069` (TASK-800, REQ-118):** `parents.province_code` · `district_code` · `subdistrict_code` (the address as area codes).
**Read BEFORE (owner, read-only, bare SQL, one at a time, on the uat database):**
```sql
SELECT inet_server_addr();
```
```sql
SELECT count(*) FROM students WHERE name LIKE 'QAChat%';
```
```sql
SELECT count(*) AS users FROM users;
```
```sql
SELECT value FROM app_settings WHERE key = 'line_admin_user_ids';
```
*(1st: uat's INTERNAL address **`172.17.172.29`** — not the public `154.197.124.29`. 2nd: **0** on uat (sid holds the QA families). Either wrong ⇒ STOP, you are not on uat. 4th: today's admins linked the OLD way — keep the output, §5.)*
**Then:**
```bash
bun run db:migrate
```
**Expect `Journal: 70 migration(s)` and the green verify line.** A red is a real gap — read it, never seed blindly.
**Verify AFTER (bare SQL):**
```sql
SELECT table_name, column_name FROM information_schema.columns WHERE (table_name = 'users' AND column_name LIKE 'line_%') OR (table_name = 'vouchers' AND column_name = 'note') OR (table_name = 'parents' AND column_name LIKE '%_code') ORDER BY table_name, column_name;
```
**Expect exactly SEVEN rows:** `parents.district_code` · `parents.province_code` · `parents.subdistrict_code` · `users.line_link_code_expires_at` · `users.line_link_code_hash` · `users.line_user_id` · `vouchers.note`.

## 2. Build + restart BOTH — back `5aa0f1c` and front `efb8551`. **Ship together** (the front's pickers read the back's new area routes; 726's screens call 725's routes).

## 3. 🔴 The REQ-118 BACKFILL — the owner runs it, DRY RUN first (after §2)
```bash
bun run scripts/backfill-area-codes.ts
```
**DRY RUN (the default): reads, decides, PRINTS, writes NOTHING.** Output = ids and reasons only (no names, phones or note text). **Expect roughly (the owner's reads, 2026-10-12):** **285** parents get a province code by exact name · **3 LISTED** `province-not-one-of-77` (the rows with street text in `province` — never parsed; a person fixes them in the admin form) · **106** `no-province` (nothing to convert) · district + sub-district only for notes in our doors' exact format, the rest listed.
**Send the dry-run output to @Porter / @Sober and WAIT for "apply".** Then:
```bash
bun run scripts/backfill-area-codes.ts --apply
```
One transaction; idempotent (a second run changes nothing); `province` and the notes are never changed. **Skipping the backfill is safe** — the codes simply stay empty until an address is picked again.

## 4. What changes
### For FAMILIES
- **A cancelled make-up put back in the SAME slot sends NO second «CONFIRMED»** (`TASK-710`).
- **An Undo of a leave TELLS THE FAMILY the class is on again** (`TASK-711`, owner-approved): «✅ มีคาบเรียนตามเดิม: … Note : ยกเลิกการลาแล้ว เรียนคาบนี้ตามปกติค่ะ» / «✅ CLASS ON AGAIN: … Note : Leave cancelled. This class goes ahead as scheduled.»
- **A cancelled GROUP date's make-ups go on ONE extra group date** (`TASK-713`) — not one private class per child, week after week. The series CANCEL-ALL is unchanged.
- **The leave cut-off refusal in Khwan's words**, the hours from Settings (`TASK-717`).
- **Khwan's LINE wording, set 1** (`TASK-727`) + **her answers 1–4** (`TASK-731`: P11 · P33/P34 · R48 · R58) · the register page's "LINE already linked to another family" = the chat's (`TASK-728`).
- **NEW family messages (Team B):** a **«CONFIRMED SCHEDULE» when a VOUCHER is sold** (`TASK-730`, row 45: expiry in MONTHS, the sale's Remark — `TASK-732/733`) · a **«CONFIRMED SCHEDULE» when a CAMP is booked**, re-sent on an edit or a cancel (`TASK-735`, row 46) · **the camp family reminder prints the REAL hours** (`TASK-736`, P26).
- **The LINE chat registration NO LONGER ASKS FOR AN ADDRESS** (`TASK-800`, owner ruling): birthday ⇒ summary. The address is entered on the registration PAGE or by the admin.
- **The registration page's address lists come from the official data** (`TASK-800/801`): บึงกาฬ's places are now pickable correctly; a few names read as DOPA spells them.
### For COACHES
- **The extra group date (713):** the coach is told once; **if every child leaves it, it is CANCELLED** (existing cancel notice, `TASK-716`); **if an Undo brings a child back, it comes back** (existing «CLASS ON AGAIN», `TASK-719`) — or the Undo is refused if the slot was taken / the coach is on leave.
- 727: the coach's "assigned" shows **Remark / Rental when present**; camp labels in her words.
### For ADMINS
- **Camp week dialog (`TASK-712`):** a coach's OWN hours outside the day's hours are **REFUSED at both ends**, naming the coach (also when only the day's or the week's hours change).
- **Admin LINE notices name WHO** (P40/P41/P42, `TASK-727`) and **P43/P44** — an admin account / an unlinked person, with the LINE display name and its fallback (`TASK-729`, **gate (3)**).
- **The TEST-098 Reason fix** (Team B, ONE notice-only line in `scheduler.service.ts`, granted; Silver verified the stored reason and the week logic byte-identical) — *@Porter: Silver's one-line description goes here before CLEARED.*
- **The parent form's address is a 3-level picker** (province → district → sub-district, codes); the card shows the address in the screen's language (`TASK-801`). A form save with a non-province name is refused.
- **The admin LINE link (§5).** · **The «ขยายคาบ» badge also shows on an extra group date.** · The 47 approved sentences carry their approval in the code (`TASK-718`, no visible change).

## 5. 🔴 The admin-LINE CUT-OVER (725/726) — this deploy IS the cut-over
- **The old shared admin code no longer links anyone** (the existing «รหัสแอดมินไม่ถูกต้อง ลองใหม่อีกครั้ง»). Seen on sid with the owner's phone: the new link works, the old code is refused.
- **How an admin links now:** web → header **«ผูก LINE»** → a **one-time code (10 min, single use)** → in the shop's LINE chat **«สมัคร» → «แอดมิน» → the code**. A coach account has no «ผูก LINE».
- **Who receives admin notices:** linked AND ACTIVE web users **plus** the old-way accounts, until each re-links or the super admin removes them.

## 6. ▶️ For Khwan's team, right AFTER this is live
1. **Each admin who should get LINE notices links their OWN LINE** (§5). 2. **The super admin** checks the Users page's **LINE** column and removes old-way accounts as people re-link. 3. **The 3 listed parents** (backfill `province-not-one-of-77`): open each, pick the address. 4. *(Optional)* the leave cut-off hours on Settings.

## 7. ✅ The numbers — re-run by @Sober, 2026-10-12, on the committed trees (`5aa0f1c` / `efb8551`, both clean)
**Back:** tsc **0** · **`4652 pass · 0 fail`** (346 files) · `unhandled-between-tests: 0` · **70 `.sql` = 70 journal entries**. **Front:** tsc **0** · **`1170 pass · 0 fail`** (132 files) · `unhandled-between-tests: 0` · build **0**.
**Break-and-watch, ALL on one exact copy of this same tree (the COMBINED run, 2026-10-12), all BITE, CHECKSUM identical:** Team A `800` 14/14 · `801` 12/12 · `711` 7/7 · `712` 9/9 · `716` 11/11 · `717` 4/4 · `719` 8/8 · Team B `725` 18/18 · `727` 18/18 · `729` 9/9 · `730` 8/8 · `731` 8/8 · `732` 7/7 · `734` 5/5 (code shipped but INERT — no menu publish) · `735` 12/12 · `736` 6/6 · `TEST-098` 3/3 · `696` 6/6. **Plus, on the final back (`5aa0f1c` = + F1 + F2):** `802` 3/3 · `800` 14/14 · `735` 15/15 (combined run on an exact copy) · **a COMPILED build started outside the repo loads all 7,436 area rows** (the F2 check). **REQ-118's gate-as-a-test:** all 7,436 served area triples accepted.
**Boundary:** code and tests, DB-unreachable, every connection setting blanked. **On screen / on LINE: @Tanya on sid + the owner's phone (gates 1–2).**

## 8. LINE-side — the OA quota (`429 … monthly limit` is LINE's)
**More pushes:** a family message per undone leave (711) · per voucher sold (730) · per camp booked / edited / cancelled (735) · a coach cancel when an extra date retires (716) · a coach «CLASS ON AGAIN» when it revives (719) · P43/P44 admin notices now with words (same count as the empty bell). **Fewer:** no duplicate «CONFIRMED» on a same-slot replacement (710) · one coach message per extra group date instead of one per child (713). **Check `[outbox] LINE worker started` once after the restart.**

## 9. ⚠️ Known and deliberate
- 🔴 **734's option A is DROPPED (the owner's phone, 2026-10-12: the bubble shows, but OA Manager shows NO bump).** **No menu is published or relinked in this release; uat's menus stay as they are, so 734's code is inert.** ⇒ **The admin still cannot locate a no-name «คุยกับแอดมิน» chat by its time in OA Manager** — the P43/P44 notice (`ผู้ใช้ LINE · HH:mm`) names the time; finding that chat stays manual.
- 🟡 **Some ENGLISH area names in the dataset are wrong** (Tanya, TEST-099; e.g. 380101 บึงกาฬ → "Seka"). Thai names and codes are right. **Only the admin People card shows the English address (`addressEn`), and only when the admin's screen is in English** — no family screen and no LINE message uses it; the pickers show Thai. A machine check found **30 English names that are another place's English name in the same province (10 in บึงกาฬ, 38)** — at least one of each pair is wrong; the true total is likely higher (no official English reference is in the repo). **A fast follow-up after this release** (an override list in our repo, the upstream file untouched).
- **The chat no longer collects an address** — new LINE-chat registrations arrive with NO address; the admin fills it (owner ruling).
- **Parents the backfill could not convert keep NULL codes** (listed by reason); their `province` text and notes are untouched.
- **A camp day whose coach is ALREADY outside its hours** is refused on its next save, naming the coach (712).
- **Old-way admin accounts have no name** (removed by the super admin as people re-link).
- **The series cancel-all of a group** still books standalone make-ups (owner-accepted). **An emptied ORDINARY group date is not cancelled** (only an extra one).

## 10. After the restart — @Tanya on uat, READ-ONLY
**Never press Save, Undo, Cancel, Link, Book or Sell** (each reaches real families or admins). Look: the back answers · the outbox worker started · «ผูก LINE» for an admin, not for a coach · the Users page's **LINE** column · the parent form's 3-level picker opens with lists · the registration page's lists load · the camp week dialog opens. **The §1 / §3 reads are the owner's.**

## 11. Rollback
**Back to `a2185b2` and front to `2db1c57`, TOGETHER.** **`0067` / `0068` / `0069` STAY** — 🚫 no down-migration on a live box; the old code never reads those columns. ⚠️ **After a rollback:** admins linked the NEW way stop receiving notices (the old code reads only the old list); the shared code works again only if `LINE_ADMIN_VERIFY_CODE` is still set. **No menus were changed by this release** — nothing to undo there. Messages already sent stay sent; backfilled codes stay (unused by the old code).
