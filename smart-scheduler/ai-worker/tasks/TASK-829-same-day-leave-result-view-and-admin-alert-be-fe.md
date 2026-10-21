# TASK-829 — BE + FE: **after a teacher's SAME-DAY leave: show what happened, and alert an admin when a class is left as is (D4)** (REQ-125 K1, owner: "K1 b") — @Jason (BE ≈ 0.55 d) + @Fern (FE ≈ 0.55 d), incl. +10 percent
**From @Sober, 2026-10-21.** The last number of Team A's 800–829 block. Source:
- TEST-111 (Tanya), and Fern's TASK-828 note: after a same-day save, a D4 class left as is is surfaced to nobody;
- the owner's ruling *"K1 b"* (Porter, inbox/SA.md 10-21).

**Claims (Porter):** the same front files as TASK-828 + the TASK-827 back family (`line-message.ts` · `line-i18n.ts` · the coach-notice inventory + the kind-count pins), plus `scheduler.service.ts` for the one call site.
**List every pin file before editing. Never run two mutation sets on one tree at once.**

## The alert text: ⏳ DRAFT, waiting for the owner. **Build with a marked placeholder; nothing ships before approval.**
| where | TH (draft) | EN (draft) |
|---|---|---|
| LINE to the admins, when a teacher's same-day leave leaves class(es) as is (D4) | ⚠️ ครู {name} แจ้งลาวันนี้ ({date}) — คาบต่อไปนี้ยังไม่มีครูรับแทน เพราะครูท่านอื่นของคาบไม่ว่างในเวลานั้น กรุณาจัดการในปฏิทิน: {list} | ⚠️ {name} reported leave for today ({date}). These classes have no teacher to take over (their other teachers aren't free then). Please handle them in the calendar: {list} |
(`{list}` = "HH:mm · program/title" per class, one per line, as the 827 notice lists classes.)

## BE (@Jason), after the 828 rework's tree is quiet
- **One new outbox kind** (e.g. `teacher_leave_left_as_is_admin`) + its renderer, with the approved strings once given (a **«copy pending»** placeholder until then).
- **Sent from the same-day act only** (TASK-825's path), inside the same transaction, **ONE message per leave act** listing every D4 class.
  - Recipients = the admins the existing admin notices go to (the same helper as the other admin alerts; **name it in your report**).
  - **Not** the leaver, the coaches or the families.
- **Advance leave does NOT send it:** the admin is the one recording it and already sees the D4 classes in the result + the panel.
- **Tests by value:**
  - same-day with 1 D4 + 1 continuing + 1 sole → ONE admin alert listing only the D4 class;
  - no D4 → no alert;
  - the preview → 0 alerts (condition P still holds).
- **Mutations:**
  - the alert sent for a continuing class;
  - sent from the preview;
  - sent to a family;
  - one alert per class instead of one per act.
- The inventory + the kind count 44 → 45 (own-team pins: ask me first).

## FE (@Fern), after the 828 rework (incl. O1) is verified
- **After a teacher's own SAME-DAY save**, show the result view (instead of only closing on a toast), from the act's answer:
  - **continues** (with whom) · **cancelled** · **left as is** (the approved D4 sentence) · and "an admin has been told" when a D4 class exists.
  - Approved labels only. If a line needs new words, stop and tell me.
- **Tests:**
  - the three outcomes shown;
  - a sole-teacher-only day looks as today (plus the list);
  - a mutation that hides the left-as-is class must bite.

## ✅ Done means
Per side: tests by value + a mutation set (each bite shown) · tsc 0 · suite / `bun test` / build · `unhandled-between-tests: N` · `git status` in full. Nothing committed; one release with the 828 rework.


## Jason (BE) 2026-10-21 — TASK-829 BE (REQ-125 K1 b): the admin alert for a class left as is — GREEN

**Built (back only, nothing committed):**
- ONE new outbox kind `teacher_leave_left_as_is_admin` + renderer (`line-message.ts`: leaver, date dd-mm-yyyy, one line per class «HH:mm · title»).
- Sender `sendLeftAsIsAlertToAdmins` (scheduler.service.ts) — ONE call site, inside the same-day act's transaction (reportTeacherLeave), with ALL D4 classes at once. No D4 ⇒ nothing.
- **Admin helper = `notifyAdmins`** (lib/line-admin.ts: linked admin accounts ∪ legacy list, de-duplicated; no admin ⇒ one SKIPPED row). Never the leaver, coaches or families.
- Advance record, range, lift and PREVIEW never reach it (source pin + by-value tests: preview 0, advance 0, range 0).
- Text is a «copy pending» DRAFT (line-i18n `ob_tl_left_as_is_admin`):
  - TH: «copy pending» ⚠️ ครู {name} แจ้งลาวันนี้ ({date}) — คาบต่อไปนี้ยังไม่มีครูรับแทน เพราะครูท่านอื่นของคาบไม่ว่างในเวลานั้น กรุณาจัดการในปฏิทิน: {list}
  - EN: «copy pending» ⚠️ {name} reported leave for today ({date}). These classes have no teacher to take over (their other teachers aren't free then). Please handle them in the calendar: {list}
  - Pinned as DRAFT; when the owner approves, drop the marker and mark APPROVED. Nothing ships before.

**Pin files edited (your GO, self-granted):** message-trailing-req085-16-3.test.ts (:74/:121), no-iso-date-leak.test.ts (:104), no-placeholder-leak.test.ts (:48/:130) — kind count 44→45; own tests same-day-leave-co-taught-task825.test.ts (admin spy + 4 by-value tests: 1 D4 + 1 continuing + 1 sole → one alert listing only the D4; two D4 → still one; no D4 → none; own door and admin door alike) and advance-leave-co-taught-task826.test.ts (preview/advance/range → 0). New: left-as-is-alert-task829.test.ts + .mutations.json.

**Verified:** tsc 0 · full suite 5,062 pass / 0 fail (363 files, unhandled 0; the one tsc nit in my new test fixed after, re-run: file 5/5, tsc clean) · migrations 72 = 72 · sets 829 8/8 BITE, 827 13/13, 826 15/15, 825 10/10, 824 11/11, all checksum-identical, 0 survivors. Saved: GIT-STATUS-back-829-2026-10-21.txt. Not re-run this round: clean-room/no-.env (no new env dependence added; 826 file already carries the JWT_SECRET default).

Ball: Sober. FE half is Fern's; the wording waits for the owner. Holding the back tree.

## ✅ 2026-10-21 — @Sober: TASK-829 BE VERIFIED (the alert text still «copy pending»)
- **Clean copy, NO `.env`**, of back `55cdb53` + 10 files (the final tree, after your tsc nit fix): tsc 0 · SAFE suite **5,062 / 0**, 363 files · unhandled 0 · 72 = 72.
- **Sets:** 829 **8/8** · 827 13/13 · 826 15/15 · 825 10/10 · 824 11/11. 0 survivors, checksums identical.
- **Pins:** the kind count 44 → 45 ×3 files + your own 825/826 tests, as granted.
- **Blocks the commit:** the owner's approval of the alert text → you drop «copy pending» and mark it APPROVED → I re-check that string + set 829.


## Jason (BE) 2026-10-21 — TASK-829 BE: owner-APPROVED text applied — GREEN

- `line-i18n.ts` `ob_tl_left_as_is_admin`: dropped the «copy pending» prefix ONLY (TH + EN sentence word for word as drafted); comment now says APPROVED by the owner 2026-10-21. Renderer comment in `line-message.ts` updated the same way.
- `left-as-is-alert-task829.test.ts`: pins the approved text exactly, no "copy pending" anywhere, comment says APPROVED.
- Set 829 P7 re-aimed: "the Thai text differs from the approved one" (a word changed) — still bites. Set 829: 8/8 BITE, 0 survivors, checksum identical.
- tsc 0 · 3 probe files + 829 test 24/0 · full suite 5,062 pass / 0 fail (363 files, unhandled 0). Saved GIT-STATUS-back-829b-2026-10-21.txt. My run had .env present; the no-.env clean room is yours as before.
- Back tree now held for the commit.

Ball: Sober.

## ✅ 2026-10-21 — @Sober: TASK-829 BE FINAL (approved text) VERIFIED
- The approved TH + EN are string-matched **verbatim** in `line-i18n.ts`; 0 «copy pending» left.
- **No-`.env` clean room:** tsc 0 · SAFE suite **5,062 / 0** · unhandled 0 · 72 = 72.
- **Sets:** 829 **8/8** (P7 = "the text differs from the approved one") · 827 13/13 · 826 15/15 · 825 10/10 · 824 11/11.
- The back tree is frozen for the commit.

---
## ⚖️ 2026-10-21 — @Sober rules on Fern's three points
1. **Option (a): the line shows only when the alert really went out.** Fern is right: the same-day answer carries no such fact, and `notifyAdmins` writes ONE SKIPPED row when no admin is linked.
   - **BE (@Jason), small addendum, `scheduler.service.ts` only:**
     - `sendLeftAsIsAlertToAdmins` returns how many admins the alert was queued for: `(await getAdminLineUserIds(tx)).length`, read in the same transaction just before `notifyAdmins`. That is 0 when the SKIPPED row is written.
     - **Do NOT edit `lib/line-admin.ts`.** It is outside the claim.
     - The same-day answer gains `adminsAlerted` **only when** `toHandle.length > 0`. The key is absent otherwise, as for `continues` / `toHandle` today.
   - **BE tests by value:**
     - 1 D4 + 2 linked admins → `adminsAlerted: 2`;
     - 1 D4 + no admin → `adminsAlerted: 0` + the SKIPPED row;
     - no D4 → no key.
   - **BE mutations:**
     - the count fixed at 1;
     - the key present without D4;
     - the count taken from the outbox rows, so the SKIPPED row counts as 1.
   - (`one-door-rules-task314`'s `getAdminLineUserIds` pin reads only `createStudentFromLine`: not touched.)
   - **FE (@Fern):** the line shows **only** when `adminsAlerted > 0`. A mutation that shows it at 0 or absent must bite.
2. **The "an admin has been told" copy:** Fern's DRAFT went to Porter for the owner. **Build the line behind a «copy pending» marker; it does not ship before approval.**
   - TH: แจ้งแอดมินแล้วเรื่องคาบที่ยังไม่มีครูรับแทน
   - EN: The admins have been told about the class(es) left as they are.
3. **"Plus the list":** Fern's reading is right. **A sole-teacher-only day stays exactly today's toast + close.** No behaviour change there.

---
## ✅ 2026-10-21 — the owner APPROVED the FE line (via @Porter, COPY-REVIEW 2026-10-21) + Jason's `adminsAlerted` count
- TH: แจ้งแอดมินแล้วเรื่องคาบที่ยังไม่มีครูรับแทน
- EN: The admins have been told about the class(es) left as they are.


## Jason (BE) 2026-10-21 — TASK-829 BE ADDENDUM: `adminsAlerted` in the same-day answer — GREEN

- **Change (scheduler.service.ts only; NOT lib/line-admin.ts):** `sendLeftAsIsAlertToAdmins` now returns `(await getAdminLineUserIds(tx)).length`, read in the act's transaction just before `notifyAdmins` (0 if no D4 class). `getAdminLineUserIds` added to the existing `line-admin` import. The same-day answer carries `adminsAlerted` inside `split` and ONLY when `toHandle.length > 0`. The `return { cancelled…, ...split }` line is unchanged.
- **Pins listed first:** only my own `same-day-leave-co-taught-task825.test.ts:290` (the `split` line string) changed. The return-line pins (825:291, 097:341) are untouched because the key rides inside `split`. `one-door-rules-task314` (pins `createStudentFromLine` only) is untouched. No other file edited.
- **Tests by value (825):** 2 admins → `adminsAlerted: 2` · no admin → 0 AND the one SKIPPED row (`no admin recipient configured`) · no D4 (continuing only / sole only) → key absent.
- **Set 829 now 11:** P9 count fixed at 1 · P10 key present without a D4 · P11 count taken from the outbox rows (SKIPPED row counts as 1). P6's anchor re-aimed to `return 0;`. **11/11 BITE, 0 survivors, checksum identical.**
- **Verified:** tsc 0 · SAFE suite 5,063 pass / 0 fail (363 files; +1 test) · sets 829 11/11, 825 10/10, 826 15/15, 827 13/13 clean. Saved GIT-STATUS-back-829c-2026-10-21.txt. My run had .env present; the no-.env room is yours.

Ball: Sober. Back tree held.

## ✅ 2026-10-21 — @Sober: TASK-829 BE ADDENDUM (`adminsAlerted`) VERIFIED
- **The code matches ruling 1:**
  - the count is read from `getAdminLineUserIds(tx)` in the act's transaction just before `notifyAdmins`;
  - the key rides in `split` only when `toHandle.length > 0`;
  - `lib/line-admin.ts` is untouched.
- **No-`.env` clean room** of back `55cdb53` + 10 files: tsc 0 · SAFE suite **5,063 / 0**, 363 files · unhandled 0 · 72 = 72.
- **Sets:** 829 **11/11** (P9–P11 new) · 825 10/10 · 826 15/15 · 827 13/13. 0 survivors, checksums identical.
- 🧊 The back tree is frozen for the commit.

---
## ✅ @Fern — 2026-10-21 — TASK-829 FE DONE: after a teacher's own SAME-DAY leave, the dialog shows what happened. Approved wording applied. Nothing committed.
**What it does:** when the act's answer carries `continues` / `toHandle` (the back sends them only when a co-taught class was involved) the dialog **stays open on a result view** — new `Calendar/Modal/LeaveSameDayResult.tsx`: the approved headline «{n} sessions cancelled · {families} families told» (the answer's own counts = the classes REALLY cancelled), the cancelled classes (ids from the answer, time/name from the day's rows), each **continuing** class with the approved «Continues with {names}» tag, each class **LEFT AS IT IS** with the approved D4 sentence (no guessed name: a class not among the rows gets its time only), and **«The admins have been told about the class(es) left as they are.»** — **shown only when `adminsAlerted > 0`** (Jason's new field; absent or 0 ⇒ no line, never inferred from `toHandle`). **A sole-teacher day (no such keys, or empty arrays) is exactly today's toast + close**, request unchanged. Dialog change: one branch after the advance check + one state (`ReportLeaveDialog.tsx`); the pinned toast line stays verbatim.
**The "admins have been told" line is now the owner-APPROVED text** (TH «แจ้งแอดมินแล้วเรื่องคาบที่ยังไม่มีครูรับแทน» / EN «The admins have been told about the class(es) left as they are.»): «copy pending» dropped, key `leaveDays.adminToldLeftAsIs` marked APPROVED (2026-10-21, REQ-125 K1), both texts pinned exactly in my test, and a pin that no «copy pending» remains (the one other `copy pending` in `dictionaries.ts` is an older camp string, not mine, untouched). Type: `OwnLeaveResult.adminsAlerted?: number`.
**Pins: none edited** (the key is in `leaveDays`, so the `teacherLeave` §6 count is unchanged). No Team A test file changed.
**Numbers:** `tsc` 0 · `bun test` **1337 pass / 0 fail** (142 files) · `bun run build` exit 0 · `unhandled-between-tests: 0`. New test `leave-same-day-task829.dom.test.tsx` (17). **Sets, strictly one at a time, tree audited after (0 leftovers): 829 17/17 (re-run on the approved wording) · 828-o1 13/13 · 828 26/26 · 818 25/25 · 820 22/22 · 822 18/18**, every CHECKSUM identical. (The last five were run just before the one-line wording change, which touches only the `adminToldLeftAsIs` key and its comments; only set 829 guards it, and it was re-run after.)
**Your bites:** **Y1** the left-as-is class hidden → BITES (the TEST-111 case) · **Y12** "admins told" shown at `adminsAlerted` 0 → BITES · **Y13** shown when ABSENT → BITES · plus Y14 inferred from `toHandle` · Y2 continues hidden · Y3/Y4 miscounts · Y5 a sole day shows the view · Y6/Y7 only-continues / only-D4 not shown · Y8 guessed name · Y9/Y10 closes / toasts on top · Y11 Close dead · Y15 marker dropped · Y16/Y17 EN / TH words altered.
**`git status --short -uall` (front, on top of committed `3e4a337`; 19 files = the 828 rework + O1 + 829):**
```
 M scripts/mutation/task-818.json
 M scripts/mutation/task-820.json
 M scripts/mutation/task-828.json
 M src/components/partials/Calendar/CancelLeaveButton.tsx
 M src/components/partials/Calendar/LeaveDayPanel.tsx
 M src/components/partials/Calendar/LiftLeaveConfirm.tsx
 M src/components/partials/Calendar/LiftRangeConfirm.tsx
 M src/components/partials/Calendar/Modal/LeaveWillDo.tsx
 M src/components/partials/Calendar/Modal/ReportLeaveDialog.tsx
 M src/components/partials/Calendar/Modal/leave-co-taught-task828.dom.test.tsx
 M src/components/partials/Teachers/TeacherLeaveList.tsx
 M src/lib/i18n/dictionaries.ts
 M src/types/api/contract.ts
?? scripts/mutation/task-828-o1.json
?? scripts/mutation/task-829.json
?? src/components/partials/Calendar/Modal/LeaveSameDayResult.tsx
?? src/components/partials/Calendar/Modal/leave-same-day-task829.dom.test.tsx
?? src/components/partials/Calendar/cancel-restores-o1.dom.test.tsx
```
**Not proven:** a real browser; the real answer against the real back (the wire is faked with 826/829's published shapes — `adminsAlerted` is coded against the shape you named; I have not seen Jason's field in his tree). **BALL: @Sober.**

## ✅ 2026-10-21 — @Sober: TASK-829 FE VERIFIED → READY for the commit (`DEPLOY-REQ-125-rework-o1-and-task829-2026-10-21.md`)
- **Clean copy** of front `3e4a337` + 18 files: tsc 0 · `bun test` **1,337 / 0** · unhandled 0 · build 0 (the tree unchanged by it).
- **Sets, re-run by me on the final tree, one at a time:** 829 **17/17** · 828-o1 13/13 · 828 26/26 · 818 25/25 · 820 22/22 · 822 18/18.
- The approved "admins have been told" TH + EN are verbatim; no «copy pending» from this work (the camp reminder one predates it, in HEAD). No pin edited.
- 🧊 Both trees frozen until the owner commits.
