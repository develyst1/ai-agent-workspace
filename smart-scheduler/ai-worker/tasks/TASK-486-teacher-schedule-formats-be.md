# TASK-486 — REQ-109 §3/§5/§6: the teacher's schedule messages — today and this week, in Khwan's format — BE, M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size M.** No migration expected. ⚠️ **Teacher-facing text, from the customer's own sample.** The structure below is approved; **§4 has one thing I have NOT had answered, and I want it built so the answer costs nothing.**

## §0 What exists today, and what this changes
A linked teacher already has: `ตารางของฉัน` (today), a **"This week" chip** on that reply (`btn_week` → `action=schedule&range=week`), and a **Monday digest job**. So neither view is new. **What changes is the FORMAT — and one behaviour: the tap must answer with TODAY plus the two chips** (REQ-109 §6).
🚫 **Do not build a second schedule path.** If the digest and the reply do not already share their formatter, **make them share one** — this format is going to be read side by side by the same coach on the same Monday, and two implementations of it will diverge within the month.

## §1 The format — Khwan's sample is the contract (REQ-109 §3, verbatim)
```
⏱️ THIS WEEK'S SCHEDULE

▸ MON / 07/09
@ 09:00 / ของขวัญ
　FREESKATE / Attended

▸ THU / 10/09
@ 15:00 / ส้ม
　SURFSKATE / Confirmed
　📝 เตรียมอุปกรณ์ให้น้องด้วยค่ะ
```
Line by line, so nothing is inferred:
- **`▸ <DAY> / <DD/MM>`** — a day header, one per day that has something. 🔑 **3-letter abbreviations for EVERY day** (Khwan §5 answer 2: *"ใช้ตัวย่อทั้งหมดค่ะ"*). The sample's `SATURDAY` / `SUNDAY` in full is the thing she was correcting — **`SAT` / `SUN`.**
- **`@ <HH:MM> / <student nickname>`**
- **`　<PROGRAM> / <Status>`** — note the **leading ideographic space** (U+3000) as the indent, exactly as the sample. 🔑 **The program name ONLY — no "Private" prefix** (Khwan §5 answer 3: it is too long and hard for a coach to scan). ⚠️ **This deliberately overrides the earlier "Private everywhere" rule FOR TEACHER MESSAGES ONLY.** Parent messages and the admin schedule keep it. **Pin that the parent's format still carries it** — a rule reversed in one place has a way of leaking into the others.
- **`　📝 <note>`** — the booking's note, **only when one exists** (§5 answer 4).

## §2 Which sessions appear — this is the part to get exactly right
| view | shows | hides |
|---|---|---|
| **this week** | **Confirmed · Attended** only | Pending · Leave · **Cancelled** |
| **today** | Confirmed · Attended · **Pending · Leave** | **Cancelled** |
**Cancelled is hidden in both** (§5 answer 5).
🔑 **Pin these as SETS, not as four assertions.** Build a fixture holding one session in **every** status the system has and assert the rendered output for each view — so a status we add next year is a failing test rather than a silent appearance in a coach's message. 📌 That is the `SLOT_INACTIVE_STATUSES` lesson: a list that must be complete should be checked against the real enum, not against the statuses whoever wrote the test remembered.

## §3 The two doors
1. **`ตารางของฉัน` / `My Schedule`** (tapped or typed — TASK-485 made both work) ⇒ **TODAY**, with quick-reply chips **`วันนี้` / `สัปดาห์นี้`** (`Today` / `This week`), REQ-109 §6.
2. **The Monday digest** ⇒ the **same weekly format**, same formatter.
- The existing `btn_week` behaviour is superseded by the chips; **say what happened to it** — kept, renamed, or replaced — rather than leaving two ways to ask for the same thing.
- 🚫 No artwork change. 🚫 No change to the parent's surfaces.

## §4 ⚠️ The open question — build it so the answer is cheap
**Khwan's sample mixes an English header and English status words with Thai names.** I do not know whether a **Thai** coach should read `THIS WEEK'S SCHEDULE / Attended` or `ตารางสัปดาห์นี้ / เข้าเรียนแล้ว`, and **I am not going to guess on customer-approved text.**
**Build it as:** the **structure** exactly as §1 for both languages; the **words** (header, status labels) following the **chat's language**, with the **EN rendering byte-identical to the sample**. Propose the TH labels, **pinned by value**, and list them plainly in your report.
⇒ I am asking Porter for Khwan's confirmation in parallel. **If she wants the English words in a Thai chat, that is then a one-line change to a label map — not a rewrite.** 🚫 Do not block on it, and do not invent a third arrangement.

## Definition of Done
- [ ] The format by value against §1 for both views, **including the U+3000 indent and 3-letter day labels for every day** · the status sets pinned **against the real status enum**, not a remembered list · cancelled hidden in both · the note line only when a note exists · **program name only, and the parent's format pinned to still carry "Private"** · one formatter shared by the reply and the digest (say what you found) · the tap answers TODAY + the two chips · `btn_week`'s fate stated · TH labels proposed and pinned · suite **count** · tsc 0 · 57 = 57 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that shows a Cancelled session, one that shows Leave in the weekly view, and one that puts "Private" back in a teacher message · report here + `inbox/SA.md` + log.

---

# 📐 CONTRACT + 6 ❓ — @Jason → @Sober (2026-09-26) — read before building; NO code. The format collides with owner-approved text in three places, and the status set has three classes of session Khwan didn't cover.

## §A What exists (read, not assumed)
1. **Two formatters, today:**
   - the **reply** (`renderSchedule`, `lib/line-schedule.ts`): day heading `▸ Monday 30/07`, `HH:MM  student`, `   program · status`, and `Remark : …` (REQ-085 §7.2's label); rendered in `TEMPLATE_LANG` = **EN** (TASK-304: "one language is enough");
   - the **Monday digest** (`renderWeeklySchedule`, `lib/weekly-digest.ts`, TASK-441): one line per row, `DD-MM-YYYY · HH:MM-HH:MM · program / student`, plus the TASK-453b clash suffix.
   - **They share nothing.** Your instinct was right: one formatter is the fix.
2. **The digest is ENGLISH-ONLY by an owner ruling (REQ-104 §3)**, and pinned: no Thai code point under either `line_lang`. It also carries the owner's **greeting** (`Hello, here is your teaching schedule for this week:`) and **footer** (`Please review your schedule.`), and the **owner-approved clash note** (TASK-453b).
3. **The digest shows CONFIRMED only** (`REMINDABLE`), and a GROUP / OTHER row prints its **title with no student**.
4. **The real status enum has NINE values:** PENDING · CONFIRMED · ATTENDED · SICK_LEAVE · NO_SHOW · **EXTENDED** · **PENDING_RESCHEDULE** · CANCELLED · **PAUSED**. Khwan's rules name four (Confirmed, Attended, Pending, Leave) and hide Cancelled.
5. **The note** is `attendeeNote` (TASK-178), already rendered as `Remark : …` by today's reply. Khwan's sample prints it `　📝 …`.
6. **The headers:** `tsched_title_today` = `⏱️TODAY'S SCHEDULE:` (no space, a colon) and is **pinned EQUAL to the daily AUTO message's title** (`ob_today_title`, owner-approved: "Format แจ้งเตือน Auto โอเคแล้วค่ะ"). Khwan's weekly header is `⏱️ THIS WEEK'S SCHEDULE` (a space, no colon).

## §B The ❓, each with my recommendation, so you can rule in one pass
1. **The digest vs REQ-104 §3 (English-only, greeting, footer).** REQ-109 §6 says "the Monday auto digest uses the same weekly format".
   - **Rec:** the digest becomes **exactly** the §1 format: Khwan's header, no greeting, no footer. It stays **English words** (it has no chat of its own to follow; REQ-104 §3's ruling stands for the *language*). The rows carry Thai names now, as her sample does, so the "no Thai code point" pin becomes "no Thai in the FIXED words".
   - ⚠️ That drops two lines the owner approved, so it needs his yes.
2. **The clash note (TASK-453b, owner-approved)** has no place in Khwan's format.
   - **Rec:** keep it, on the status line: `　SURFSKATE / Confirmed ⚠️ <the existing note>`, byte-identical to today's suffix. Dropping an owner-approved warning is not something her sample asked for.
3. **Statuses Khwan didn't name**, which is what "pin against the real enum" turned up:
   - **EXTENDED** is a real, scheduled make-up class (`COURSE_LIVE_STATUSES`). **Rec: show it in both views under its OWN existing label** (`Extended` / `คาบขยาย`). Hiding it would silently drop a class a coach must teach.
   - **PENDING_RESCHEDULE** (awaiting the parent's yes to a move): **Rec:** today only, like Pending.
   - **NO_SHOW** · **PAUSED**: **Rec:** hidden in both (settled / on hold).
   - I'll pin the full nine-value table as a typed `Record` over the enum, so a tenth status is a compile error and a failing test.
4. **The today header.** **Rec:** keep `⏱️TODAY'S SCHEDULE:` (it is pinned equal to the approved AUTO message). Use Khwan's `⏱️ THIS WEEK'S SCHEDULE` for the week only. The alternative (`⏱️ TODAY'S SCHEDULE` in her style) would break that equality, or move the AUTO message too.
5. **GROUP / OTHER rows**, which have no student: `@ HH:MM / <student>` has nothing to print. **Rec:** the row's **title** in the student's place (the digest's current rule), e.g. `@ 10:00 / Balance Play Group`.
6. **The end time** (the digest prints `09:00-10:00`; Khwan prints `@ 09:00`). **Rec:** start only, as her sample.

## §C What I will build once you rule (unchanged by the answers)
- **ONE formatter** (`renderTeacherSchedule(rows, view, lang)`) used by the reply (today and week) and by the digest. The digest's payload grows `status` and `note` per row.
- The format **byte-identical to §1**: 3-letter days for every day, U+3000 indent, `@ HH:MM / name`, program ONLY (the "Private" rule: the teacher gets `subject.name` raw; the parent's format is pinned to still carry it), `　📝 note` only when present.
- **The tap ⇒ TODAY + chips `วันนี้` / `สัปดาห์นี้` (`Today` / `This week`).** `btn_week`'s fate: **replaced** by the pair (the calendar chip stays beside them).
- **Proposed TH words, pinned by value** (the chat's language; EN byte-identical to the sample):
  - header: `⏱️ ตารางสัปดาห์นี้`;
  - statuses: **the existing `status_*` labels, read from the file, not new words**: `ยืนยันแล้ว` (Confirmed) · `เข้าเรียนแล้ว` (Attended) · `รอยืนยัน` (Pending) · `ลา` (Leave) · and, if ❓3 shows it, `คาบขยาย` / `Extended` (EXTENDED already has its own label).
- ⚠️ **TASK-304 moves:** its reply was `TEMPLATE_LANG` (EN) by ruling; §4 of your task makes the words follow the chat. I'll pin the change and name 304 in the code.

⏸️ **Waiting on §B 1–6.** No code written.

---

# 🔨 RULING — @Sober (2026-09-26) on §B 1–6. ▶️ Build. **Nothing here needs the owner, and that is the point of ruling 1.**

**Writing the contract before the code was the right call and it paid for itself twice over** — ❓3 alone would have shipped as a coach losing a make-up class from their schedule, and no test I asked for would have caught it, because **I specified the status sets from Khwan's four words and she named four of nine.** "Pin against the real enum" found what "pin the four" never would.

## 1. The digest — 🔨 **keep the greeting and the footer. Adopt her format for the BODY only.** (Not your rec.)
Your reading of "the same weekly format" is defensible, but it costs an owner decision and **it does not have to.** REQ-109 §6 is a ruling about **the schedule's format**; the greeting and footer are not the schedule, they are the message around it. **Adopting her body satisfies §6 completely while dropping nothing anyone approved** — so this stops being a question.
📌 **The general rule, and I want it in the code comment:** when a new instruction and an old approved one can both be honoured, honour both and do not spend the owner's attention. Escalate when they genuinely **conflict** — here they do not.
✅ **English words in the digest stand** (REQ-104 §3: it has no chat to follow). Your reframing of the pin — *no Thai in the FIXED words*, since the rows now carry Thai names as her own sample does — is exactly right; **pin it in those terms and say why the old pin could not survive her format.**

## 2. The clash note — ✅ **agreed, kept, on the status line, byte-identical.**
A sample that does not mention a warning is not a request to delete it. **Silence in a customer's example is not an instruction**, and an owner-approved warning about two classes colliding is the single most expensive line in that message to lose.

## 3. The statuses — ✅ **EXTENDED shown in both, PENDING_RESCHEDULE today only, PAUSED hidden. 🔨 NO_SHOW: shown in TODAY, hidden in the week.** (One change to your rec.)
- **EXTENDED in both, under its own label — this is the most important answer of the six.** It is a real, scheduled class with a child in front of it. **Hiding it means a coach does not know they are teaching**, and it would have been hidden by a faithful reading of Khwan's four words. Exactly the failure the enum pin exists to prevent.
- 🔨 **NO_SHOW, my change, with the reason:** the day-end settles every started CONFIRMED class into ATTENDED **or NO_SHOW**. If NO_SHOW is hidden from *today*, a coach's evening view **silently loses rows that were there in the morning** — a schedule that shrinks as the day passes is unsettling and looks like a bug. Khwan's own rule for today is the day's **full picture** (it is why Leave appears there), and a no-show is exactly as informative as a leave. **Hidden in the WEEK**, where the view is about what to teach.
- **PENDING_RESCHEDULE today only** ✅ — it is a Pending in all but name.
- **PAUSED hidden** ✅ — not scheduled, nothing to teach.
- ✅ **The typed `Record` over the enum is the right shape**: a tenth status becomes a compile error, not a surprise in a coach's message. **Make sure it fails to compile rather than defaulting to hidden** — a default is how this class of bug comes back.
📌 Two of these five (EXTENDED, NO_SHOW) are my judgement, not Khwan's words. **They go to Porter for her, as a table, with the reasons** — but they are cheap to change and they do not block you.

## 4. Today's header — ✅ **agreed. Keep `⏱️TODAY'S SCHEDULE:`, use her style for the week.**
The equality with the approved AUTO message is worth more than internal symmetry between our two headers. **Two messages a coach receives on the same day agreeing with each other beats two views of ours agreeing with each other.**

## 5. GROUP / OTHER — ✅ **agreed: the title in the student's place**, following the digest's existing rule. Reusing a rule that already exists beats inventing a second one for the same hole.

## 6. The end time — ✅ **agreed: start only, as her sample.** 📌 Say in the report that the digest **loses** the end time it prints today — that is a real reduction in what a coach is told, made on the customer's own sample, and it belongs in Tanya's list rather than in a diff.

## Also approved
- ✅ **TASK-304's EN-only reply moving to the chat's language** — pin the change and name 304 in the code, as you proposed. That ruling was "one language is enough" for a format nobody had settled; the format is settled now and the coach's own language is the better answer.
- ✅ **`btn_week` replaced by the pair**, the calendar chip staying beside them.
- ✅ **TH labels read from the existing `status_*` words, not newly invented.** One vocabulary; if a status is renamed, every surface moves together.

## Definition of Done — amended
Everything in the original list, plus: · the greeting and footer **kept**, pinned · the clash note kept, byte-identical, pinned · the **nine-value typed table** (EXTENDED both · PENDING_RESCHEDULE today · NO_SHOW **today only** · PAUSED and CANCELLED hidden), failing to **compile** on a tenth status · today's header pinned equal to the AUTO message · GROUP/OTHER titles · start time only, with the digest's lost end time **stated for Tanya** · TASK-304's language change pinned and named · 🔑 add a mutation that **hides EXTENDED** and one that **shows NO_SHOW in the weekly view**.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-26) — ONE formatter for the reply and the digest; Khwan's sample byte for byte; the nine-status table; 3148 pass / 0 fail; 11/11 mutations bite

**Numbers:** `bun test` **3148 pass / 0 fail** (+18; new `src/lib/teacher-schedule-req109.test.ts`, `src/services/teacher-schedule-tap-req109.test.ts`) · `tsc` **0** · **57 = 57**.

## §1 What was built
- **NEW `src/lib/teacher-schedule.ts`: THE teacher format**, used by both the `ตารางของฉัน` reply (today and week) and the Monday digest's body.
  - `TEACHER_VISIBLE` is a **typed `Record<BookingStatus, …>` over `bookingStatus.enumValues`**. A tenth status is a **compile error**, and there is no default:
    - CONFIRMED · ATTENDED · EXTENDED: **both views**;
    - PENDING · SICK_LEAVE · PENDING_RESCHEDULE · NO_SHOW: **today only**;
    - CANCELLED · PAUSED: **neither**.
    - Each has its reason written beside it; EXTENDED and NO_SHOW are marked as your judgement.
  - Also in the file: `teacherProgram` (drops a **leading** `Private ` only: `Private FREESKATE` → `FREESKATE`, while `BALANCE PLAY (Private)` is kept), `teacherDayHeader` (`▸ MON / 07/09`, 3 letters for every day, via the existing `DOW3`), `renderTeacherScheduleBody` (the day blocks, U+3000 indent, `@ HH:MM / name`, `　program / status` plus the clash suffix when given, `　📝 note` only when present) and `renderTeacherSchedule` (the reply's header + blank line + body).
- **The reply:** rows through `displayNameOf` (the ONE rule; a title in the student's place), the **chat's language**, and chips **`Today` · `This week` · `My calendar`** on every schedule reply. 🔻 **`btn_week` was REPLACED:** the old single toggle is gone and the pair is always shown (pinned; mutation J brings the toggle back and bites).
- **The digest:** `renderWeeklySchedule` = the owner's **title + greeting + blank + Khwan's body + blank + footer** (ruling 1: honour both; your sentence is in the comment). The body is rendered with **literal `"EN"`** (pinned) and `clashNote: CLASH_NOTE_WEEKLY`. `groupWeekRows` filters by the **week** set and each row carries `status · name · note · subject`. A payload queued before the change (no `status`) renders as CONFIRMED, which is all the old digest held; an empty payload is byte-identical to before.
- **Headers:** the week header is Khwan's `⏱️ THIS WEEK'S SCHEDULE` (new key `tsched2_title_week`); **today is still `⏱️TODAY'S SCHEDULE:`, pinned equal to `ob_today_title`** (§B4).
- **TH words (proposed, pinned by value):** the header `⏱️ ตารางสัปดาห์นี้`; statuses **read from the existing `status_*`**: `ยืนยันแล้ว` · `เข้าเรียนแล้ว` · `รอยืนยัน` · `ลา` · `คาบขยาย` · `ไม่มา` · `รอย้ายคาบ`. **The day labels stay `MON`…`SUN` in both languages**, as her leave line (TASK-470) already prints `FRI` in both of her columns. If Khwan wants English words in a Thai chat, that is the one `tsched2_title_week` line plus passing `"EN"`.

## §2 By value
- 🔑 **Khwan's sample, whole, byte-identical** in the EN week view: 13 sessions over 7 days, the 📝 lines, `BALANCE PLAY (Private)` kept, and **`SAT` / `SUN`** (her own correction).
- **The status sets:** one fixture row per status of the **real enum**. Week = {CONFIRMED, ATTENDED, EXTENDED}; today = those + {PENDING, SICK_LEAVE, PENDING_RESCHEDULE, NO_SHOW}; CANCELLED and PAUSED appear in neither. The table's keys equal `enumValues`.
- 🔴 **"Private" for a PARENT is unchanged:** `checkinLine` still prints `Private BALLET` (pinned beside the teacher rule).
- **Through the dispatcher:**
  - the tap ⇒ today's rows (asked for today only), Khwan's format, and the four chips by value;
  - a TH chat ⇒ Thai status words and `วันนี้` / `สัปดาห์นี้`;
  - the week chip ⇒ Mon–Sun, her header, and a PENDING row NOT shown.
- **The digest:** EXTENDED and ATTENDED now reach the Monday week, while PENDING / NO_SHOW / CANCELLED never do. The owner's words surround the body, and the FIXED words carry no Thai (the names do, by design, and I said why the old pin could not survive).

## §3 ⚠️ For Tanya's re-check list (behaviour a coach will see change)
1. **The digest no longer prints the END time** (`09:00-10:00` → `@ 09:00`). A real reduction, from her own sample (§B6).
2. 🔴 **The Monday digest now includes EXTENDED make-up classes.** It was CONFIRMED-only, so **make-up classes were missing from every coach's Monday week until now.** This is a pre-existing gap the enum table closed.
3. The reply is in the coach's chat language (TASK-304's EN-only reply moved, named in the code).
4. The chips are always the pair; the old single toggle is gone.
5. NO_SHOW and "awaiting move" rows appear in the today view (your ruling).

## §4 Two things found, NOT changed (outside this task)
- **The reply and the digest ask different questions of the database.** The reply (`findBookingsForTeacher`) reads rows where the coach is the **PRIMARY** teacher only. The digest also includes rows where they are an **ADDITIONAL** teacher (TASK-441's rule). So a co-taught class is in the Monday message and **not** in `ตารางของฉัน`. The format is now one; the query is still two. I'd suggest a small task to have the reply use the digest's rule.
- **`src/lib/line-schedule.ts` (the old `renderSchedule`) has NO production caller now.** Nine test files still exercise it, and some also guard other things (status-label coverage). Deleting it means moving pins in nine suites, which I didn't want to fold in here. Please cut it as a clean-up task, or tell me to.

## §5 One trap, recorded
The U+3000 indent is written `String.fromCharCode(0x3000)`, not as a literal character or an escape: **two of my tools turned a `\u3000` escape back into the invisible character on the way to disk**, and an invisible character in source is one an editor or a reader "fixes" to a space. Mutation F (plain spaces) bites.

## Break-and-watch: `mut486.mjs`, 11 mutations, **11 bite**
Every bite shows real failing tests. `finally` + sha-256 restore, byte-identical each time. CHECKSUM over `git diff` + untracked files, identical before and after the main run. `BASELINE=71` read off a real run on 4 suites.
- A 🔴 **Cancelled shown**
- B 🔴 **Leave in the week**
- C 🔴 **"Private" back in a teacher message**
- D 🔴 **EXTENDED hidden**
- E 🔴 **NO_SHOW in the week**
- F the indent as plain spaces
- G a full day name
- H 🔴 the owner's greeting dropped
- I 🔴 the clash note dropped
- J the old single toggle
- K the reply back in fixed EN

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Re-run by me, twice: **3148 pass / 0 fail** both times · tsc 0 · 57 = 57 · one formatter in `lib/teacher-schedule.ts` serving the reply and the digest.

🔴 **The enum table closed a gap nobody knew about: EXTENDED make-up classes were missing from EVERY Monday digest.** That is not a new rule landing — it is **a coach never having been told about a make-up class in that message**, for as long as the digest has existed. It surfaced only because I asked for the sets to be pinned against the real enum rather than against Khwan's four words, and because he treated that instruction as a question about the system rather than a test-writing chore. **Both halves were needed.**
📌 **Recorded as the general lesson: a status list written from a customer's example is a list of the cases they happened to think of.** The system's enum is the only complete one. This is the second time in two days that "check it against the real thing, not the remembered thing" has found a live defect.

✅ **Ruling 1 landed as intended** — the owner's title, greeting and footer kept **around** her body, with the reasoning in the comment. Nothing approved was dropped and nothing went up the chain that did not need to.
✅ Khwan's sample reproduced **byte-identically** in EN, including `BALANCE PLAY (Private)`, while "Private" is dropped for teachers — with the **parent's `Private BALLET` pinned**, so the reversal cannot leak.
✅ TH words read from the existing `status_*` labels rather than invented, and TASK-304's language change pinned and named.

## 📌 Two things he found and deliberately did NOT change — both correct to leave
1. 🔴 **The reply reads PRIMARY-teacher rows only, while the digest includes additional teachers** ⇒ **a co-taught class appears in Monday's message and is absent from `ตารางของฉัน`.** That is the same failure as the EXTENDED gap wearing different clothes — **a coach not being shown a class they are teaching** — and it is now the most valuable loose thread we have. ▶️ **Cut as TASK-487.**
2. `line-schedule.ts` is dead production code with nine test files still pointing at it. Real, and **not urgent**: dead code that tests still exercise is tidy-up, not risk. It goes on the backlog, not into this round.
**Separating those two — one a defect, one a chore — rather than reporting "two follow-ups" is the part I want to note.** They look alike in a diff and they are nothing alike in consequence.

⚠️ **For Tanya, both stated:** the digest **loses the end time** (Khwan's sample, deliberate), and the digest **now includes EXTENDED classes** (a gap closed, so a Monday message may contain rows that never appeared before — that is correct, not a regression).
