# TASK-699 — BE: **the family is told when an ADMIN changes a course's expiry — longer OR shorter** — @Jason (≈ ½ day)
**From @Sober to @Jason.** **Owner RULING 2026-10-07 (via @Porter, `inbox/SA.md` "MY MISS: the owner RULED the extension notice"):** take it · **ADMIN edits only** · **a date moved EARLIER is told too, same notice.** Khwan asked for it herself: *"นี่ถ้าผปคทำเอง เราก็ต้องเป็นคนแจ้ง manual อยู่ดีไหมคะ"* — without it her team telephones every family by hand.
✅ **Claim (Team A):** `services/scheduler.service.ts` (`updateCourseExpiry` only) · `lib/line-message.ts` (one new case) · `lib/line-i18n.ts` (one new key) · their tests. **No migration, no FE, no route change.**

## 1. ▶️ Where — ONE writer, and only that one
- **In `updateCourseExpiry`, INSIDE the existing transaction, after `recordExpiryChange`:** enqueue the family notice. **The notice exists iff the expiry write committed** (a failed write rolls it back with it).
- 🚫 **NOT** in `addLeaveWeek` (the automatic +1 weeks: T1/T2/T3 ride an event the family already hears about — owner: no double-telling) · 🚫 **NOT** in `changeCourseStart` / `resumeCourse` (their expiry moves as a by-product of a re-plan, not an admin's expiry edit — outside the ruling; **report in one line whether the family hears anything on those paths today; change nothing there**) · 🚫 **NOT** the voucher's `updateVoucherExpiry` (not in the ruling).

## 2. ▶️ Who and when
- **Who:** the course's household accounts — `householdLineUserIds(tx, [course.studentId, course.coStudentId])` (a DUO course reaches both families once, de-duplicated), sent through **`enqueueParentCopies`** — so a family with no linked account gets the ONE skipped row, as every parent notice does. 🚫 **No coach. No admin.**
- **When NOT:** `from === to` (not a change — same rule as `recordExpiryChange`) ⇒ **no row at all** · **an ENDED course ⇒ no row** (it has no classes left; a validity date on a finished course tells the family something false). *(My ruling, not the owner's — @Porter may overturn.)* **A DROPPED (paused) course IS told** — that is exactly when an admin extends before resuming.
- **Longer and shorter are the SAME notice** — no direction branch in code.

## 3. ▶️ What — a NEW kind, 🚫 NOT `course_confirmed` / CONFIRMED SCHEDULE
`kind: "course_expiry_changed"`, payload `{ courseId, from, to }` (snapshotted here, as `class_moved_*` does — two quick edits send two true messages). Rendered by a new case in `line-message.ts` with the same student-name / program-label rules the other parent notices use (🚫 no second name rule), dates through `ddmmyyyy`.
**Words — 📋 DRAFT, with @Porter → owner. Put them in exactly as below, marked DRAFT in the comment as `ob_makeup_past_expiry` was:**
- **TH:** `แจ้งเปลี่ยนวันหมดอายุคอร์สค่ะ: คอร์ส {program} ของ {student} ใช้ได้ถึงวันที่ {to} (จากเดิม {from}) หากมีข้อสงสัย กรุณาติดต่อแอดมินค่ะ`
- **EN:** `Course expiry date changed: {student}'s {program} course is now valid until {to} (previously {from}). Please contact Admin if you have any questions.`
🚫 **Nothing ships on a draft:** if the owner changes the words, you change the two strings and nothing else.

## 4. ✅ Done means
**`tsc` · `bun test` with COUNTS (DB-unreachable run) · `unhandled-between-tests: 0` · `66 = 66` (no new migration)** · tests:
- extend ⇒ ONE parent row per household account, kind `course_expiry_changed`, `{from, to}` correct · **shorten ⇒ the same** · DUO ⇒ both households, de-duplicated · no linked account ⇒ ONE skipped row · `from === to` ⇒ no row · ENDED ⇒ no row · DROPPED ⇒ told · **no teacher row, no admin row** · the write failing ⇒ no row (same transaction) · `addLeaveWeek` (T1/T2/T3) ⇒ **no** such row · rendered TH and EN equal the two strings above with the fields filled.
- **Mutations (list recorded HERE, in-file tests list): notice sent on a no-op · sent on an ENDED course · NOT sent when shortened (a direction branch) · sent from `addLeaveWeek` · sent to the coach · enqueued outside the transaction (BITES on the rollback test) · `course_confirmed` re-used instead of the new kind.**
- ⏱️ **If it is bigger than ½ day, STOP and say so — 🚫 do not compress it.** Owner's date (FRI 16) does not depend on it.

## ✅ 2026-10-07 — @Jason: `TASK-699` DONE — the family is told when an ADMIN changes a course's expiry (longer or shorter); 10 / 10 bite
**`tsc` 0 · DB-unreachable suite `4224 pass · 0 fail` · `unhandled-between-tests: 0` · `66 = 66` (no migration).** **Set: `src/services/course-expiry-family-notice-task699.mutations.json` — 10 / 10 BITE**, baseline 45, CHECKSUM identical, test list in the file. Within ½ day; nothing compressed.
**Built exactly as briefed:** in `updateCourseExpiry` ONLY, **inside the existing transaction, after `recordExpiryChange`**, through `enqueueParentCopies(tx, householdLineUserIds(tx, [studentId, coStudentId]))` — one parent row per household account (DUO: both, de-duplicated), ONE skipped row when no account is linked. **No direction branch** — longer and shorter are the same notice. **NEW kind `course_expiry_changed`**, payload `{ courseId, from, to, size }`, rendered by one new case in `line-message.ts`, one new key `ob_course_expiry_changed` — **the two strings EXACTLY as drafted, marked 📋 DRAFT beside the key** (student by the ONE name rule, program by `programLabel`, dates `dd-mm-yyyy`, `-` for a missing field).
**By value through the real `updateCourseExpiry` (fake tx that rolls back on a throw):** extend ⇒ one row `{from,to}` right · shorten ⇒ the same · DUO ⇒ both households once · no account ⇒ one skipped row · `from === to` ⇒ no row (and no audit row) · ENDED ⇒ no row · DROPPED ⇒ told · **the audit write failing ⇒ no row** · enqueued inside the transaction · **no teacher row, no admin row** · `addLeaveWeek` ⇒ no such row · TH and EN equal the two strings with fields filled.
**Mutations:** `N1` no-op sent · `N2` ENDED sent · `N3` a direction branch (shortened not told) · `N4` sent from `addLeaveWeek` · `N5` to the coach · `N6` enqueued OUTSIDE the transaction · `N7` `course_confirmed` re-used · `N8` Thai paraphrased · `N9` a DROPPED course not told · `N10` to the admins — **all bite.**
**Scope held:** the kind is raised in exactly ONE place (pinned by source); `addLeaveWeek`, `changeCourseStart`, `resumeCourse` and vouchers are untouched.
### 📌 Your one-line question — does the family hear anything on `changeCourseStart` / `resumeCourse` today?
**No.** Neither function enqueues any parent/admin/coach notice itself (checked in the code: no `enqueueParentCopies` / `enqueueLine` / `notifyAdmins` in either body). Changed nothing there.
### ⚠️ Two small things
1. **`size` added to the payload** (the brief says `{ courseId, from, to }`): the program label «Private Freeskate 6 HR» needs the course size, and snapshotting it is the same discipline as `from`/`to`. Remove it and the label loses its «6 HR».
2. **The ctx source:** a course has no booking of its own, so the notice carries ONE of the course's COURSE_PACKAGE rows as `bookingId` — the enriched row the worker already reads the student/program from (no second name rule). A course with no rows at all would render `-` for student/program; not reachable in practice.
**Pins moved, each with its reason:** kind count 33→34 ×3 files, `?? "-"` 11→13, `enqueueParentCopies(` 6→7, `householdLineUserIds(` 3→4 — each with a `· 🔻 TASK-699` note. My renderer reads `to`/`from` only when they are strings (other kinds carry `to` as a slot object — the ISO-leak probe caught it).
▶️ **Ball: Sober verifies 699.** If the owner changes the words, it is two strings.

---
## ➕ §2 — 2026-10-07 — @Sober → @Jason: **the approval-marker pass (XS, comments ONLY)**
**The owner APPROVED 699's sentence as drafted, TH and EN (`COPY-REVIEW-2026-09-29.md:515`).** ⇒ **retire every stale marker on the round's Team A strings.** 🔑 *A marker that outlives its meaning is read as the truth by the next person.*
**Flip these, and ONLY these — each to `✅ APPROVED by the owner <date> — COPY-REVIEW-2026-09-29.md:<line>`:**
| file:line (today) | string | approval |
|---|---|---|
| `lib/line-i18n.ts:609` | `ob_course_expiry_changed` (699) | 2026-10-07 · `:515` |
| `lib/line-i18n.ts:477` | `ob_leave_refused_no_validity` (A2) | 2026-10-06 · `:491` |
| `lib/line-i18n.ts:600` | `ob_makeup_past_expiry` (A3) | 2026-10-06 · `:491` |
| `lib/line-i18n.ts:726` | `ob_reason_SCHOOL_ISSUE` (A5 — TH the customer's own words, EN approved) | 2026-10-06 · `:491` |
| `lib/leave.ts:14` | the admin refusal (A1) | 2026-10-06 · `:491` |
| `lib/booking-undo.ts:70` | the Undo chain refusal (A4) | 2026-10-06 · `:491` |
| `lib/line-i18n.ts:739` + `lib/line-message.ts:314` | `mc_title` (TASK-537) | ⚠️ **NOT an owner approval of its own** — write exactly: `words identical to the owner-APPROVED cl_title; marker retired on @Porter's ruling 2026-10-07 (COPY-REVIEW-2026-09-29.md:521)` |
| `lib/coach-rate.ts:44` | `RATE_REQUIRED` (REQ-110 §3) | 2026-10-01 · `:370` ("all other sections approved as drafted") |
| `lib/teacher-leave.ts:39`, `:93`, `:105` · `services/scheduler.service.ts:3434` | the advance-leave server sentences (REQ-110 §15) | 2026-10-01 · `:370` |
| `lib/line-i18n.ts:197`, `:202`, `:395`, `:405`, `:407`, `:410` · `services/line-register.service.ts:315`, `:322` | the LINE registration lines (REQ-110 §17 / §18) | 2026-10-01 · `:370` |
🔴 **Before flipping ANY row: the string in code must equal the approved text in `COPY-REVIEW-2026-09-29.md` byte-for-byte.** **If it differs, do NOT flip it and do NOT fix it — list it for me** (a flipped marker on a string nobody approved is the exact lie this pass exists to remove).
🚫 **No string, no behaviour, no other marker.** **NOT in this pass — Team B's, @Silver's to answer:** `services/parent.service.ts:285` and `validation.ts:719`. 🚫 Touch neither.
**✅ Done means:** the grep `grep -rn "DRAFT\|NOT approved" src --include=*.ts | grep -v test` shows **none of the rows above** · `tsc` 0 · DB-unreachable `bun test` with COUNTS · `unhandled-between-tests: 0` (a test may pin a comment — if one does, say which and why it moved). No mutation set (no behaviour).

## ✅ 2026-10-07 — @Jason: `TASK-699` §2 — marker pass DONE: **16 of 21 sites flipped, 5 NOT flipped because the code does not equal the approved text** (listed for you)
**`tsc` 0 · DB-unreachable suite `4224 pass · 0 fail` · `unhandled-between-tests: 0` · `66 = 66`. Comments only — no string, no behaviour touched.**
**Method:** every string was compared to `COPY-REVIEW-2026-09-29.md` by a script (whitespace / backticks / `{placeholder}` normalised) BEFORE its marker was touched. Found ⇒ flipped to `✅ APPROVED by the owner <date> — COPY-REVIEW-2026-09-29.md:<line>`.
### ✅ Flipped (16 sites)
`line-i18n.ts:477` A2 · `:600` A3 · `:726` A5 · `leave.ts:14` A1 · `booking-undo.ts:70` A4 — all 2026-10-06 · `:491` · **`mc_title`** (`line-i18n.ts:739` + `line-message.ts:314`) with your exact wording; **I verified the words ARE identical to `cl_title` (TH and EN)** · `coach-rate.ts:44` `RATE_REQUIRED` · `teacher-leave.ts:93`, `:105` · `scheduler.service.ts:3434` · `line-i18n.ts:395` (`add_dup_detail`), `:405` (`add_addr_province_bad`), `:407` (`add_phone_now_registered`) · `line-register.service.ts:315`, `:322` — all 2026-10-01 · `:370`. *(RATE_REQUIRED's only difference from the reviewed draft is `<date>` vs `${date}`, a placeholder — flipped.)*
### 🔴 NOT flipped — the code differs from the approved text, or the approved text is not in the document. Yours / Porter's to rule
1. **`ob_course_expiry_changed` (`line-i18n.ts:609`) — MY OWN 699 SENTENCE: the owner approved a DIFFERENT Thai sentence than I built.** COPY-REVIEW `:516` (approved TH): **`วันหมดอายุคอร์สเปลี่ยนแล้ว — คอร์ส {program} ของ {student} ใช้ได้ถึง {to} (เดิม {from}) หากมีข้อสงสัยกรุณาติดต่อแอดมิน`** · built TH: `แจ้งเปลี่ยนวันหมดอายุคอร์สค่ะ: … ใช้ได้ถึงวันที่ {to} (จากเดิม {from}) หากมีข้อสงสัย กรุณาติดต่อแอดมินค่ะ`. **EN matches byte-for-byte.** ▶️ **Say "change the TH" and it is one string (+ one mutation anchor, `N8`); I did not touch it (§2 forbids strings).** Marker left as DRAFT meanwhile.
2. **`line-i18n.ts:197` — the three address prompts** (`add_addr_province/district/subdistrict_prompt`): COPY §18 gives the TH half WITHOUT the particle for district and sub-district (`กรุณาระบุอำเภอ/เขต เช่น วัฒนา`) and joins the halves with ` / `; the code has `…ค่ะ` and a newline.
3. **`line-i18n.ts:202` — `add_addr_on_file`**: COPY §18 `(ที่อยู่เดิมของครอบครัว)` / `(the address we have on file)`; code `ที่อยู่เดิมของครอบครัว / on file`.
4. **`line-i18n.ts:410` — `add_birthdate_bad`**: COPY-REVIEW only shows the CHANGE (`… เช่น 02-12-2024`, an ellipsis before it), never the whole sentence, so a full byte-check is impossible; the part it shows matches. Not flipped — your call whether "the deletion matches" is enough.
5. **`teacher-leave.ts:39` — `ADMIN_LEAVE_FUTURE_ONLY`**: the sentence (`บันทึกวันลาแทนครูได้เฉพาะวันถัดไปเป็นต้นไป — …จัดการรายคาบในปฏิทิน`) is **not in COPY-REVIEW at all** (§15 lists three other sentences; this is TASK-648's). Nothing to flip it against.
**Not touched, as ruled:** `parent.service.ts:285`, `validation.ts:719` (Team B).
**Tests that pinned a marker (moved, each saying so):** `school-issue-reason-task690.test` (the label describe + its marker pin), `booking-undo-req108.test` (the chain refusal's marker + its title), `makeup-past-expiry-task657.test` (the dictionary marker) — each now pins the APPROVED marker instead of the draft one. No mutation set (no behaviour); 690's set (the label's mutations) still bites the same words.
**ONE line for Porter:** *Owner-approved markers flipped on 16 back-end string sites; 5 left as DRAFT because the code ≠ the approved text — most importantly the owner approved a different Thai sentence for the expiry-changed notice (`วันหมดอายุคอร์สเปลี่ยนแล้ว — …`) than the draft we built; Jason will switch the Thai on a yes.*
▶️ **Ball: Sober — rule the 5, esp. #1 (a yes ⇒ one string).**
