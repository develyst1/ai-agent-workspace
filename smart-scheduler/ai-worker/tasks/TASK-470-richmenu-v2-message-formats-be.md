# TASK-470 — `REQ-107 §3`: the four message formats (check-in · request leave · my course · language/help) — BE, M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size M.** No migration. After TASK-468/469.

## §0 Every byte is the customer's
The wording lives in **`project-docs/customer-2026-09-25-richmenu/rich-menu-messages.html`** (current text in column B, wanted EN in D, wanted TH in F, her notes beneath). **Read it and copy from it** — do not retype from this task, and do not improve her phrasing. Where her sheet and this summary disagree, **the sheet wins and you tell me**.
- **Check in** — prompt `Pick class👇` / `กรุณาเลือกคลาส 👇`; class line `Feen: Duo Private BALLET / Teacher KK @ 10.00` (student first, then program, then teacher, then `@ time`); a **blank line between classes**; success `Checked in ✅` + the same line; none ⇒ `No class today` / `วันนี้ไม่มีคลาส`.
- **Request leave** — `Which child? 👇` / `กรุณาเลือกนักเรียนค่ะ`; then `Pick class to request leave 👇`; line `· FRI 25/09 @ 16:00 : Duo Private BALLET / Teacher KK`, blank line between items; success `Record Leave: …` / `บันทึการลา : …` (**her spelling — keep it**). 🔴 **Do NOT mention "moves to the end of the course"** (her note).
- **My course** — heading `My Course:` / `คอร์สของฉัน :`; line `Feen: Duo Private BALLET / Teacher KK [Remain: 4/6] *EXPIRE: 27.10.26`; **remove the leave-quota count**; blank line between courses.
- **Language / Help** — `Switched to English ✅` / `เปลี่ยนเป็นภาษาไทยแล้ว ✅`; the shorter list (Add Student — Up to 5 · My Course · Check-in · Request Leave), same items in TH; **`qr` and `menu` are gone from the list** (the commands keep WORKING — only the advertisement goes; say so and pin it).
- ⚠️ **Names:** the student name leads every line, so it goes through the ONE name rule (`displayNameOf`/`studentNamesOf` — TASK-425) and a DUO row reads both children. Do not hand-build a name.
- ⚠️ **Dates:** her formats are `25/09`, `27.10.26`, `@ 10.00` — **hers, not ours**. They differ from the `DD-MM-YYYY` house rule, and that is her choice on her own messages; copy them exactly and **flag it in your report** so the owner sees the inconsistency and can rule.

## §1 Build
Each format pinned **by value in both languages**, including the blank lines (a rendered message is what a parent reads — assert the whole string, not its parts). The leave-quota line disappears from `My course` only; nothing else about quotas changes. Two open items I will answer before you finish — **ask if they block you**: whether removing the quota from the message means removing it from the parent's view everywhere (I say no, message only), and whether "moves to the end of the course" is only wording (I say yes).

## Definition of Done
- [ ] All four by value, both languages, blank lines included · the sheet's bytes (and any disagreement with this task reported) · names through the ONE rule (a DUO row reads both) · `qr`/`menu` still WORK though unadvertised (pinned) · her date formats copied and the inconsistency flagged · suite **count** · tsc 0 · 56 = 56 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# 🔍 IN PROGRESS — @Jason → @Sober (2026-09-25) — the sheet READ; where it disagrees with this task (the sheet wins, so you hear it now); building

Written before the code on purpose (amnesia-first): these are facts from the sheet, and several need your eye early.

## §0 How the sheet is laid out
`rich-menu-messages.html` is a Google-Sheet export with a row-number column first, so the sheet's own columns **B/C/D/E/F** are HTML cells **C/D/E/F/G**: C = the CURRENT text, **E = wanted EN**, **G = wanted TH**, her notes in E beneath each block. I copy from E and G only.

## §1 Where the SHEET disagrees with this task's summary — the sheet wins, each one flagged
1. **Two TH cells contain ENGLISH text**: the leave class prompt (G18) is `Pick class to request leave 👇` in BOTH columns, and the check-in success (G11) is `Checked in ✅` in both. Probably a copy-paste on her side — but "do not improve her phrasing" and "the sheet wins", so I **copy them as written** and flag them for the owner. 📖 A one-word answer from her fixes it later.
2. **My Course lines start with `.  `** (a full stop and TWO spaces): `.  Feen: Duo Private BALLET / Teacher KK [Remain: 4/6] *EXPIRE: 27.10.26`. Your summary has the line without that prefix. Copied exactly.
3. **Her own two leave examples disagree on spacing**: `FRI 25/09 @ 16:00` vs `SAT 26/09 @15:00`. Code needs ONE format — I use **`@ 16:00` (with the space)**, which also matches her check-in `@ 10.00`, and flag it.
4. **The times use two different separators on purpose-or-not**: check-in `@ 10.00` (a DOT) · leave `@ 16:00` (a COLON) · My Course expiry `27.10.26` (DD.MM.YY) · leave date `25/09` (DD/MM). Each copied per message and **flagged against our `DD-MM-YYYY` house rule**, as you asked.
5. 🔴 **The Language / Help reply changes SHAPE, and loses a line that matters**: her wanted reply is the confirmation **plus** `Available Commands:` and the four-item list, in ONE message — and her list **drops** today's closing lines *"Or just type your question — an admin will read it and reply. 🙏"* / *"หรือพิมพ์คำถามเข้ามาได้เลยค่ะ เดี๋ยวแอดมินมาตอบนะคะ 🙏"* and *"เพิ่มนักเรียนได้สูงสุด 5 คนต่อเบอร์"*. The first of those is the only place the bot tells a parent a human reads the chat. **The sheet wins and I will build it** — but ⚠️ please put this one to the owner explicitly, because it removes a reassurance rather than rewording it.
6. **Check-in items have NO leading bullet** in her format (`Feen: … @ 10.00`) while leave items do (`· FRI …`). Copied exactly — including that asymmetry.
7. **Add Student** (rows 41–43) is on this sheet too — that is TASK-469's reply. ⚠️ **Row 43 carries a LITERAL LIFF URL with a real LIFF id.** It will **not** be copied into code: TASK-469's rule is the id from the ENV, never a literal (a hard-coded real id sends a demo parent to the customer's page).

## §2 One constraint the sheet cannot see
Her class lines are 40–50 characters (`Feen: Duo Private BALLET / Teacher KK @ 10.00`); **a LINE quick-reply BUTTON label is capped at 20**. So her format goes into the message BODY (what a parent reads), and the buttons keep a short label — the TASK-316 body/button split that already exists. I will pin that the body is hers byte-for-byte and that every button fits.

## §3 Your two open items — neither blocks me
Quota removed from the My Course **message only** (your reading, and her note says exactly that — *"เอาสิทธิการลาออกค่ะ"* under My Course); "moves to the end of the course" is **wording only** (her note: *"ไม่ต้องบอกเรื่อง move class to the end ค่ะ"*). I build on both.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — the four formats from her sheet, by value in both languages; 3010 pass / 0 fail; 11/11 mutations bite

**Numbers:** `bun test` **3010 pass / 0 fail** (+20 over 468's 2990; new file `src/lib/line-v2-messages-req107.test.ts`, 20 tests) · `tsc` **0** · 🚫 no migration (**56 = 56**) · pins moved in **5 suites** (§5).

## §4 What was built
- **NEW `src/lib/line-v2-lines.ts`** — her three class-line shapes, pure, in ONE file: `checkinLine` (`Feen: Private BALLET / Teacher KK @ 10.00`), `leaveLine` (`FRI 25/09 @ 16:00 : Private BALLET / Teacher KK`), `courseLineV2` (`.  Feen: … [Remain: 4/6] *EXPIRE: 27.10.26`), and `joinItems` = a **blank line** between items. Her EN and TH columns are **identical** for these lines, so the lines take no language; the language only picks the headings around them. **The name goes through `studentNamesOf`** (the ONE rule) — a DUO row reads `Feen & Pun` (by value).
- **`line-i18n.ts`** — `pick_checkin` · `pick_leave` · `empty_checkin` · `pick_leave_child` · `course_title` · `menu_body` · `checkin_ok` · `checkin_already` · `leave_ok_session` copied from her E/G cells.
- **Handlers** — the check-in and leave list BODIES are her format (check-in no bullet, leave `· `, a blank line between); the successes take the ONE line; the language toggle replies **confirmation + list, one message, in the new language**; My Course loads `student` + `coStudent` and leads each line with the name.
- 🔴 **`My Course` and `Request Leave` are now real commands** (`CMD_COURSES` += `my course`, `CMD_LEAVE` += `request leave`). The TASK-313 guard (`advertised-is-reserved`) caught it: her list advertises those two words and neither was a command, so a parent typing what the list says would have got silence.
- 🔑 **`qr`, `menu`, `เมนู`, `children`, `นักเรียน` leave the LIST only** — every one still reserved and routed (pinned by value + by source).

## §5 Pins that moved — each named
`line-menus-flows` (AC-15 block → her line, by value; REMAINING-not-used, clamp at 0, `-` for a missing field, all kept) · `advertised-is-reserved-req085` (six → FOUR commands per language, by value) · `line-i18n` (`checkin_ok` takes `{line}`) · `voucher-deduction-req087` (the card's line moved to `line-v2-lines.ts`; "the card never shares the notification's helper" still pinned on both files) · `line-stuck-exit` Face 2 (see §6.1). The old `courseLine` is **deleted** (nothing else called it; its claims moved with it). The `course_row` key stays (another suite pins it as a label pattern).

## §6 Questions / flags — in addition to §1's seven (all built as the sheet says)
1. ⚠️ **"An admin will read it and reply 🙏" is gone** from the list (§1 item 5). Face 2 of `line-stuck-exit` is now pinned as **absent, pending the owner**, and what still guarantees a person is reachable is pinned beside it: `คุยกับแอดมิน` is a cell on BOTH parent-facing menus. If the owner wants the line back, it is one i18n edit and the pin flips.
2. ⚠️ **The leave success no longer names the child** (`Record Leave: FRI 25/09 @ 16:00 : …`). TASK-135 Q2 (Porter) put the name there for two-child families; her sheet overrides it. The flow still asks "which child?" first when two children have a class that day.
3. **`{locked}` kept, `{extended}` dropped.** The make-up date is no longer printed (her "don't mention moving to the end"); the make-up session itself is still created exactly as before. The quota-used-up warning stays: it only appears in a case her normal example never shows, and removing a warning is not something the sheet asked for (by value).
4. **"Duo" is not invented.** Her examples read `Duo Private BALLET`; the program is printed as `subject.name`, so a DUO course reads "Duo …" only if the subject is named that way. Ask the owner whether "Duo" should come from the course type instead.
5. **Bilingual stays where TASK-276 put it.** `empty_checkin` and My Course are still sent through `both()` (TH + EN in one message). I did not reverse TASK-276's ruling on my own. 📌 Consequence: My Course now prints **the same lines twice** (her lines are the same in both languages), once under each heading. Should it go single-language here? Your ruling or the owner's.
6. **Buttons stay short.** Her lines are 40–50 characters and LINE caps a quick-reply button at 20, so her format is the BODY and the buttons keep their short labels (TASK-316's split).
7. **The literal LIFF id in her row 43 was not copied** (that is TASK-469, and it comes from ENV).

## Break-and-watch — `mut470.mjs`, 11 mutations, **11 bite** (`finally`, sha-256 restore byte-identical each time, `git diff` CHECKSUM `84ae5af5…` identical before and after; `BASELINE=151` read off the run on 7 suites)
A a bullet on the check-in list · B 🔴 the blank line between items removed · C 🔴 "moves to the end of the course" back · D 🔴 the check-in name hand-built (a DUO row reads one child) · E 🔴 `my course` not a command · F 🔴 `qr` stops working · G a colon in the check-in time · H the toggle replies without the list · I 🔴 My Course loses the name · J 🔴 `Remain` prints USED · K the admin line restored.
📌 **I PASSED on the first run.** Nothing pinned that My Course fills in the name. Added a source pin on `doMyCourses` (`studentNamesOf(c)` + `student`/`coStudent` loaded); re-run with `BASELINE=152` → **bites**.

⛔ Only you mark this DONE. ▶️ Next in your order: TASK-469 once 468 is reviewed.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25), and my ruling on your ❓(f)
Re-run by me: **3010 pass / 0 fail** · tsc 0 · 56 = 56 · `lib/line-v2-lines.ts` present.
**❓(f) — My Course under `both()` prints the same lines twice. My ruling: print the class lines ONCE, the heading in both languages.**
The reason is the rule behind TASK-276, not the letter of it: we print both languages so **a parent of either language can read the message** — and her class line (`Feen: Duo Private BALLET / Teacher KK [Remain: 4/6] *EXPIRE: 27.10.26`) contains **no translated word at all**. Printing it twice does not serve a Thai reader or an English one; it just doubles the message and makes a four-course family scroll. So: the **heading** is bilingual (`My Course:` / `คอร์สของฉัน :` — the only part with words), the **class lines appear exactly once**, and pin that they do. ⚠️ Where a block DOES contain words (the prompts, the success lines, "No class today"), TASK-276's rule stands unchanged — this is a narrowing to data-only blocks, not a retreat from bilingual messages.
**Everything else in your report is right, and five items are the owner's, not ours** — they are going to him through Porter exactly as you listed them: the "admin will reply 🙏" line gone from the list (pinned absent, and the admin cell still guarantees a person is reachable); **the leave success dropping the child's name, which overrides TASK-135 Q2** (her sheet against our earlier ruling — his call, not a thing we settle quietly); two TH cells carrying English text; three date/time styles against our `DD-MM-YYYY`; and "Duo" coming from the subject's own name rather than being invented.
**Two things I want on the record:**
1. 🔴 **`My Course` and `Request Leave` were not commands at all** — her list advertises them, and the TASK-313 guard caught that we would have advertised words that do nothing. A guard earning its keep on a task nobody expected it to touch.
2. 📌 **Mutation I passed first** (My Course losing the student's name), you pinned it and it bites now. Reported in your own words again — that is the fourth time this week a harness gap was found by the person whose harness it was, and it is why I trust these numbers.
The make-up date no longer printed while the make-up is still created, and the quota-locked warning kept, are both correct readings of her sheet.

---

# ✅ FOLLOW-UP — @Jason → @Sober (2026-09-25) — ruling (f) applied: My Course heading bilingual, class lines ONCE
- `renderMyCourses(rows)` takes no language now: heading via `tb("course_title")` (`คอร์สของฉัน :\nMy Course:`), then each line once; "no courses" stays bilingual via `tb`. The handler sends `renderMyCourses(view)` (the `both()` wrapper is gone for this reply only).
- Pins: by value in `line-v2-messages-req107.test.ts` (whole message + "Feen appears exactly once"), `line-menus-flows` AC-15 block, `bilingual-flows` site updated (the flow is still asserted bilingual — now inside the renderer).
- **3011 pass / 0 fail**, tsc 0, 56 = 56. Mutation **L** (lines printed once per language again) **bites** (BASELINE=167, restore byte-identical).
