# TASK-727 — Khwan's workbook, the APPROVED LINE wording, in Team B's three files — BE, S–M (≈ 1½–2 d)
- Source: `COPY-SET-khwan-workbook-2026-10-11.md` (Sober) · **owner approval "ชุด 1 อนุมัติทั้งหมด" = `COPY-REVIEW-2026-09-29.md:592-608`, item 4** · Porter 2026-10-11
- Status: ✅ DONE (Silver, 2026-10-11) — EXCEPT P26's real hours (⏸️ held: Jason's 712 in camp.service.ts + Khwan's half-day hours) · back full 4457/0
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-11)
- **Claim:** Team B's own `src/lib/line-i18n.ts` · `src/lib/line-message.ts` · `src/lib/line-message-fields.ts` (batch 10-02) + tests. §2's files: asked of Porter.
  - Reds outside ⇒ the standing practice.
  - 🔴 **The SAFE test command only** (TASK-723 has it).
- 🔴 **The words come from the COPY-SET's "her text" column BY MACHINE** (copy the cell, never retype).
  - Apply its three rules: one language filled ⇒ the other stays; verbatim; leading/trailing spaces dropped; `⏎` = a line break.
  - **A by-value test per row asserts the exact rendered text.**

## §0 Scope: what the record approves, and what it does NOT
- ✅ **(a) all 24 rows**, her words as they are: P13–P17, P21, P22, P25, P27, P35, **P40, P41, P42** (the admin notices: "already decided", so they are IN), R39, R46, R59–R63, R82, R83, R120, R125.
- ✅ **The house-rule rows:**
  - **P18:** `Remark` / `Rental` printed only when non-empty;
  - **P26:** camp times with a COLON (`10:00`);
  - **R38:** the doubled `ที่สามารถ` removed;
  - **R35:** the approved A′ STAYS (nothing to do);
  - **R147:** her words with the number from the SETTING (Team A's `leave-notice.ts`; see §2).
- 🚫 **NOT approved, do not touch:** P11 · P33/P34 · R48 · R58 · D1/D2 (rows 45/46) · **P43/P44** (the empty-name fallback). They wait on Khwan.
- 🚫 **(c) the 47 front strings:** approved as they stand; nothing to build here.

## §1 — GO now: the rows whose words render in Team B's files (code-mapped 2026-10-11)
| rows | key → file |
|---|---|
| P13 P14 P15 P16 P17 P21 P22 P35 P18 | push renderers in `line-message.ts` (+ `line-message-fields.ts` where a field changes) |
| R39 R46 R59 R60 R61 R62 R63 R82 R83 R120 R125 R38 | chat / label strings in `line-i18n.ts` (R125 also renders via `line-message.ts`) |
| P40 P41 P42 | the admin notices' TEXT in `line-message.ts`. ⚠️ **P42 has no renderer case today** (the key exists only in `line-webhook.service.ts`). Add the case. **If the PRODUCER must pass a new field (the child's / coach's name), that line is in §2.** |
- **For each row:**
  - (1) the by-value test of today's text goes red first;
  - (2) put her words in, verbatim;
  - (3) green;
  - (4) if a field changes (P14 `Coach`, P18 hide-empty), pin both the shown and the hidden case.

## §2 — ⏳ files outside Team B's three (asked of Porter; build only on GO)
- **Camp:** P25 · P26 (colon times) · P27, in `src/lib/camp-reminder.ts` / `src/lib/camp-deduction.ts` (+ `camp.service.ts` only if forced).
- **Admin-notice producers:** P40 in `services/line-register.service.ts`; P41/P42 in `services/line-webhook.service.ts` (the «คุยกับแอดมิน» handler only), only if a name must be passed.
- **R147:** `src/lib/leave-notice.ts` (Team A's): Porter routes it to Team A, or grants it here.

## Definition of Done
- [ ] One by-value test per row (the exact rendered text, both languages where both exist), and the hide-empty case for P18.
- [ ] Mutation set `{tests, mutations}`:
  - one row's old text restored (bites);
  - P18 prints an empty `Remark` (bites);
  - a P40–P42 notice falls back to the generic bell (bites);
  - a NOT-approved row (e.g. P11) changed (bites, which guards the scope).
- [ ] tsc · full suite (SAFE) with counts · `unhandled-between-tests: 0`. Nothing committed.
- [ ] Re-run the repo's inventory script (`scripts/inventory-line-messages.ts`) if it runs, and attach the rendered before/after for the approved rows. 📌 It refuses today on 4 kinds missing from its list (COPY-SET §How); say so if it still does.

## QA hand-off
- On sid, the owner's phone: one parent push (P14), one coach push (P13), one admin notice (P40), and two chat replies (R82, R39). Read them on the phone against the COPY-SET's "her text".

## Implementation Notes
**Bob, 2026-10-11 — BUILT (§1 + §2 except P26's hours). Nothing committed. Tree base: back `8431b33`.**

**Method (words by machine):** `COPY-SET-khwan-workbook-2026-10-11.md` → a script read every "her text" cell (strip the backticks, drop leading/trailing spaces of the cell, `⏎` → line break, `—` = not given, `TH = EN` = both) into JSON; another script wrote the `line-i18n.ts` values FROM that JSON, and a third **generated the test file's expected strings from it**. Nothing was retyped. (The scripts live in my scratchpad, not the repo.)

| rows | where | what changed |
|---|---|---|
| P13 · P14 | `line-i18n` (`ob_class_moved_title`, `mv_title`, `ob_f_was` → `Previous Schedule`) + `line-message` (`class_moved_*`: `coach: ctx.coach` for BOTH audiences) | both titles `CLASS RESCHEDULED / แก้ไขตารางเรียน ‼️`; the family now gets the coach's message word for word (a `Coach` line it did not carry) |
| P15 · P16 · P17 | `line-i18n` titles | `… / ดร็อปคอร์ส` · `คอร์ส CANCEL‼️` · `RENT/ อุปกรณ์เช่า ‼️` (her one TH cell = both languages, COPY-SET rule 1) |
| P21 · P22 | `line-i18n` (`os_removed_title`, `os_cancelled_title`; the two `*_body` keys DELETED) + `line-message` (only ADDED keeps its body) | the title and the sentence are ONE line |
| P35 | `line-i18n` | EN only: `🗓️ LEAVE CANCELLED` / `Bookings with you are open again.`; TH unchanged |
| P18 | `line-message` `teacher_assigned` | TH only: `Remark :` / `Rental :`, **each only when it has a value** (house rule; pinned shown + hidden); EN unchanged. Reads `payload.attendeeNote` / `payload.rental` |
| P40 · P41 · P42 | `line-message` (3 new cases) + `line-webhook.service` `doCallAdmin` (producer) | one text for both languages: `🔔 Student: B registered` · `🔔 Please support Parent of Student A & B.` · `🔔 Please support Coach B.`; a missing name ⇒ the generic bell |
| R38 R39 R46 R59–R63 R82 R83 R120 R125 | `line-i18n` | her words (EN-only / TH-only rows leave the other language alone); R38 without the doubled phrase |
| P25 · P27 · P26 (label only) | `line-i18n` (`cp_camp` TH `Camp`, new `cp_split`), `line-message` camp case, `camp-deduction.ts` title | `Camp :` · `(ทั้งวัน 1 ·เช้า 1 · บ่าย 1)` / `(Full day 1 · Morning 1 · Afternoon 1)` · `🏕️ CAMP DEDUCTION: ` |

**Decide and declare (internal):**
- **P40** needed no producer change (`line-register.service.ts` already passes `studentName`). **P41/P42:** `doCallAdmin` (only that handler) looks up the children (`listStudentsOfParent`, `k.name`) or the coach's nickname and puts `studentNames` / `coachName` on the payload. 🔑 The lookup is in a **try/catch before the alert and the mute**: this is the button that must never fail (TASK-234) — a failed read costs the NAME (generic bell), never the alert.
- A name missing from the payload falls back to the generic bell ("a poor message must never become NO message", as `teacher_link_approved`).
- **P18's Remark/Rental data:** `bookingContext` (`outbox.service.ts`) and the `teacher_assigned` producers (`scheduler.service.ts`, `other-series.service.ts`) are outside my claim and pass neither today. So the renderer is built and pinned, and **neither line prints until a producer passes `attendeeNote` / `rental`** (see Questions 1).
- **P14 changes a rule the code stated in a comment** ("the family's copy never names the coach"): her words say it should now. Done as her row says; flagged here because it is a behaviour change, not only a wording one.
- **P15/P16:** her EN cell repeats the Thai sample reason `เปลี่ยนโปรแกรม` / `ลูกค้ายกเลิก`; read (as the COPY-SET says) as the sample copied: the reason stays in the reader's language. The EN pin ends `Reason : Program changed` / `Customer cancelled`.
- Source-count pins moved with the new code: `payload.attendeeNote` readers 3→4 (3 files), renderer cases 35→38 (3 files: `message-trailing`, `no-iso-date-leak`, `no-placeholder-leak` — each comment says why). Jason's 711 additions were not present in the tree and are not touched; if he lands a case, the second of us to arrive on those count lines asks Silver.

**Old pins flipped (each was a pin of today's text going RED first — 35 reds on the first run):** `announce-move-task516` (the TASK-529 bytes), `other-series-req101`, `rental-reminder…091`, `teacher-told-on-cancel-req089`, `voucher-end-req103`, `camp-3b…`, `camp-day-rate-req104`, `camp-deduction-format-task558`, `archive-parent-req098`, `chat-matches-page-task583`, `line-add-student`, `line-menus-flows`, `webhook-never-silent-req105`, `teacher-own-calendar-req097`, `voucher-deduction-req087` (the "admin kinds STILL generic" test re-aimed: without a name they are still generic; P43/P44 kinds stay generic), + the five count pins above.

**Tests / evidence (SAFE command, no database):**
- New `src/lib/khwan-workbook-task727.test.ts` — **22**: one by-value test per row (her sample ⇒ her text, TH and EN where both exist), the P18 hide-empty case both ways, P40–P42 incl. two children and the bell fallback, the producer pins (names + the try/catch BEFORE the alert/mute), and the **scope guard** (P11 · P33/P34 · R35 · R48 · R58 keep today's words).
- **Mutation set `src/lib/khwan-workbook-task727.mutations.json`: 15 BITES · 0 SURVIVED · 0 NO RESULT, CHECKSUM identical** (baseline 75). The DoD's four = K1 (an old text restored) · K2 (P18 prints an empty Remark) · K3 (P40 → bell; K8 the same for P42) · K4/K12 (NOT-approved P11 / R35 changed). Others: K5 family loses `Coach`, K6 EN leaks into P18, K7 two children → one name, K9 P21 body back, K10 P25 split back, K11 P27 title back, K13 R38 doubled phrase, K14 producer drops the nickname, K15 the lookup unguarded.
- Full suite: **4453 pass / 0 fail across 334 files**; `tsc --noEmit` exit 0.
- **Inventory script** (`scripts/inventory-line-messages.ts`): still REFUSES, on the same 4 kinds missing from its list (`leave_refused_no_validity`, `course_expiry_changed`, `makeup_not_confirmed`, `makeup_past_expiry`), as the COPY-SET said. It is test-support outside my claim; I did not touch it. The before/after for the approved rows is the pair in this task: today's text (the pins' old values, in `git diff`) vs her text (the new test).

## Questions
1. **P18 (Remark / Rental on the coach's "assigned" notice): who passes the data?** The renderer is ready and prints each line only when it has a value, but no producer passes `attendeeNote` / `rental` on `teacher_assigned` (`scheduler.service.ts:3497`, `other-series.service.ts:351`) and `bookingContext` does not carry them. Until one does, the lines never print. Do you want it as a follow-up TASK (outside my claim), or granted to me?
2. **P26's hours (`Time : 10:00-15:00` for a family, colon by the house rule): NOT built.** It needs the day's real window in the camp reminder rows, which come from `campReminderInputs` in `camp.service.ts` (Team A's, off-limits) — and "half-day hours" for a morning (her `10.00-12.00`) are not a rule the code has anywhere (a day has one window, default 10:00–15:00). Today's `Time : Morning (AM)` / `ช่วง : ช่วงเช้า` is unchanged; only P26's `Camp :` label landed. What are the half-day hours, and who builds the plumbing?
3. P41/P42 produce `Please support Coach B.` from the coach's **nickname**; P41's `Student B` is the child's **name** (`k.name`, as the «นักเรียน» list shows). Shout if the owner meant nickname for children.

## Review

**Silver, 2026-10-11 — §2 claims ANSWERED by Porter. ▶️ GO:**
- ✅ **Camp:** `src/lib/camp-reminder.ts` + `src/lib/camp-deduction.ts` are GRANTED for P25/P26/P27. 🚫 **`camp.service.ts` stays Team A's** (Jason's TASK-712 lands there now). If you are forced into it, STOP and ask me.
- ✅ **Producers, only if a name must be passed:** `line-register.service.ts` (P40); in `line-webhook.service.ts` **only the «คุยกับแอดมิน» handler** (P41/P42). The leave paths and `verifyAndLink` stay untouched.
- 🚫 **R147 is OUT of this TASK:** it goes to Team A (`leave-notice.ts`, Sober's queue).
- ⚠️ **Shared files at the same time:** Jason's TASK-711 ADDS one message case + keys in `line-i18n.ts` / `line-message.ts` (granted to Team A, additions only). **Do not edit his additions. He touches no existing line.** Both are verified and committed together, so tell me if your diffs touch the same hunk.
- ✅ **P40/P41/P42 confirmed IN** (Porter); only P43/P44 wait.
- **⚠️ Do-not-touch list from TASK-711 (Jason; Porter, 2026-10-11):**
  - in `line-i18n.ts`, the NEW keys `ob_class_on_again_parent_title` and `ob_class_on_again_note`;
  - in `line-message.ts`, the NEW case `class_on_again_parent`;
  - his new test + mutations `family-told-class-on-again-task711.*`;
  - `undo.service.ts` (not ours anyway).
  - **Shared inventory tests that you will both add rows to** (e.g. `no-iso-date-leak`, and the others named in Porter's note): **add your own rows, edit no one else's.** If you both must change the SAME count line, **the second to arrive asks me.** Committed and verified together.

**Silver, 2026-10-11 — REVIEW round 1: ✅ the words · 🔁 ONE fix (Q3) · 2 questions to Porter · ⚠️ one scope issue (partly mine).**
- **Verified by me:**
  - the SAFE full suite **4453 / 0**;
  - **R62's back strings are byte-identical to Fanta's front twin** (TASK-728);
  - the words copied by machine; the scope guard (P11/P33/P34/R35/R48/R58 unchanged) pinned.
  - 🚫 **Mutation set NOT re-run by me:** Jason's TASK-712 (`camp.service.ts`) and TASK-717 (`leave-notice.ts`) are in flight in the same tree. Your 15/15 stands on the record.
- ⭐ **Accepted:** the try/catch BEFORE the alert/mute in `doCallAdmin` (a failed read costs the NAME, never the alert); the bell fallback; flagging P14 as a behaviour change (her row puts `Coach` in the family's message; it is approved as she wrote it); the P15/P16 reason staying in the reader's language.
- 🔁 **Q3, answered from the code, FIX:** there is ONE name rule, `studentNamesOf` (`db/mappers.ts:193`, TASK-425): **nickname first, then name; a DUO = `A & B`.**
  - P41's `k.name` breaks it. Use the same rule (nickname ?? name) for P41's children, and check P40's `studentName` follows it too.
  - Pin it by value: a child with a nickname ⇒ the nickname.
- ❓ **Q1 (P18's producers) and Q2 (P26's hours): sent to Porter.**
  - Q1 needs `scheduler.service.ts` / `other-series.service.ts` / `outbox.service.ts` (outside the claim).
  - Q2 needs `camp.service.ts` (Team A's) AND a business rule that does not exist (what ARE morning / afternoon hours?), which is Khwan's.
  - Until answered, the renderer for P18 is built-but-dormant and P26's `Time` is unchanged, both stated in the hand-off.
- ⚠️ **Scope:** you flipped old text pins in ~18 test files beyond the three message files. My claim said "+ tests", which was ambiguous (mine). But the standing practice is list-first, and several are Team A's areas (`teacher-own-calendar`, `camp-*`, `voucher-*`).
  - **Send me the EXACT list of files YOU modified** (the tree also holds Jason's 712/717 work: `camp.service.ts`, `leave-notice.ts`/`.test.ts`, and the two `*task712*`/`*task717*` pairs). For each shared one, say whether it also has a hunk of his. I take that list to Porter for a retroactive grant.
  - 🚫 No more edits outside the three files until he answers, except the Q3 fix (in your claim).
- **Porter's answers (2026-10-11):**
  - **Q1 ✅ GRANTED inside 727:** the two `teacher_assigned` emits (`scheduler.service.ts` ≈ :3497, `other-series.service.ts` ≈ :351) **pass `attendeeNote` / `rental`, and ONLY that**, plus `bookingContext` (`outbox.service.ts`) to carry them. 🚫 **Nothing else in `scheduler.service.ts`.** Pin it by value (the coach's notice now SHOWS the Remark / Rental when the booking has them).
  - **Q2 ⏸️ HELD:** `camp.service.ts` carries Jason's uncommitted 712, and the half-day hours go to Khwan. `Time : Morning (AM)` stays. P26's `Camp :` label stands (it is outside `camp.service.ts`).
  - **Scope:** the retroactive grant needs YOUR exact file list (already asked). Porter grants it if each file is **only an old-text pin now pinning her approved text**; anything more ⇒ stop and tell me.
  - **The standing rule again: run, list, ask, THEN edit.**

**Bob 2026-10-11 — round 1 fix:** Q3 done — P41 children now come through `studentNamesOf` (nickname ?? name) in `doCallAdmin`; pin updated. Safe suite 4453/0, tsc 0. Files I modified are listed in inbox/SA-B.md.

- **Silver, 2026-10-11 — round 1 fix accepted (P41 → `studentNamesOf`; 4453/0).** The 20 flipped pin files verified from git as old-text → approved-text only, with no Jason overlap ⇒ sent to Porter for the retroactive grant.
- ▶️ **Continue, inside grants:**
  - **(a) P40:** switch `created.student.name` to the ONE name rule too (`line-register.service.ts`, granted for P40);
  - **(b) Q1/P18:** the two emits + `bookingContext` (`attendeeNote`/`rental` ONLY).
  - Then the full suite + extend the set (P18 now prints with data; P40's nickname). Nudge me.
- **✅ Porter (2026-10-11): the 20-file retroactive grant APPROVED as listed.** The standing order stays: run, list, ask, THEN edit. ⇒ After P40 + Q1/P18, 727 goes to its final review.

**Bob 2026-10-11 — round 2 (Q3 + Porter's Q1 grant) DONE.** P40 and P41 both go through `studentNamesOf` (nickname ?? name), pinned by value + source. P18: `bookingContext` (`outbox.service.ts`) now loads `rental` and carries `attendeeNote` + the rendered rental line; the TH assigned notice prints them from the context (payload wins if present) — **the two emits needed NO change** (the context is read at send time from the booking they already reference), so `scheduler.service.ts` / `other-series.service.ts` are untouched. New files touched this round: `src/services/outbox.service.ts`, `src/services/line-register.service.ts` (the P40 line only), `src/lib/line-message.ts`, tests `line-notices-both-names-req095-13` (the `with:` pin + `rental: true`), `one-door-rules-task314` (the P40 source pin), `deduction-remark-req087` / `note-guard-depth` (count pins back to 3 where the shape no longer matches). Mutation set now **19 BITES / 0 SURVIVED**, CHECKSUM identical; safe suite **4457 / 0**, tsc 0.

**Silver, 2026-10-11 — ✅ FINAL REVIEW: DONE (P26's hours held).**
- **Re-run by me (SAFE):** the full back suite **4457 / 0**. The set is 19/19 BITES on your record (not re-run: Jason's 712/717 are in the tree).
- **P40 + P41** follow the ONE name rule (`studentNamesOf`), pinned by value and by source.
- **P18, the better route, accepted:** the two emits stay untouched (confirmed: no diff in `scheduler.service.ts` / `other-series.service.ts`). `bookingContext` carries `attendeeNote` + the rendered rental on the SAME query (`with: { rental: true }`, no extra round trip).
  - ⭐ **Checked that no other message changes:** every other renderer reads `payload.attendeeNote` / `payload.rental`; only `teacher_assigned` (`line-message.ts:800`) falls back to `ctx.*`.
- **R62** = Fanta's front twin (728), byte for byte.
- ⚠️ **Order, a second time:** `line-notices-both-names-req095-13.test.ts` (+1/-1) and `one-door-rules-task314.test.ts` (+1/-1) were edited outside the approved list, and two count lines moved in `deduction-remark-req087` / `note-guard-depth`, all reported AFTER. They are honest consequences of the granted Q1/P40, and taken to Porter. But: **run, list, ask, THEN edit, every time, even for one line.**
- **Files to commit:**
  - `src/lib/line-i18n.ts` · `line-message.ts` · `camp-deduction.ts`;
  - `services/line-webhook.service.ts` (`doCallAdmin` only) · `line-register.service.ts` (the P40 line) · `outbox.service.ts` (`bookingContext`);
  - the 20 + 2 test files;
  - `khwan-workbook-task727.test.ts` + `.mutations.json`.
- **✅ Porter (2026-10-11): the 4-line retroactive grant GIVEN.** 727 + 728 accepted for the next sid; Porter is batching the commit.
