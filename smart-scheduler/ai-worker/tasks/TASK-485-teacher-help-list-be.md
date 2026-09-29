# TASK-485 — REQ-109 §2/§6: a teacher's Language/Help reply lists the CUSTOMER's commands — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size XS.** No migration. ⚠️ **Approved copy — use it verbatim** (owner, 09-26, REQ-109 §6). Do not improve the wording; if something is wrong with it, tell me and stop.

## §0 The defect
A linked **teacher** tapping `ภาษา/ช่วยเหลือ` is answered with the **parent's** command list — Add Student · My Course · Check-in · Request Leave. A coach can use **none** of them. Tanya found it in TEST-073 E.
📌 It is cosmetic in the sense that nothing breaks — and it is the first thing a new coach reads after linking, which is when they decide whether this system is for them or something they have to work around. That is why it is a task and not a note.

## §1 The copy (REQ-109 §6, approved — replaces the §2 draft)
**TH:**
```
เปลี่ยนเป็นภาษาไทยแล้ว ✅

คำสั่งที่ใช้ได้:
· ตารางของฉัน — ตารางสอนวันนี้ / สัปดาห์นี้
· ปฏิทิน — ลิงก์ปฏิทินสอนทั้งหมด
```
**EN:**
```
Switched to English ✅

Available Commands:
· My Schedule — Today's / This week's schedule
· Calendar — Link to your full teaching calendar
```

## §2 Build
- The help / language reply for a **linked teacher** uses the list above; the **parent's** list is untouched (pin it by value — TASK-477 has only just settled that vocabulary and I do not want it moving as a side effect).
- 🔑 **The list must be TRUE, which is the part worth testing.** It advertises two commands: **assert that each one actually routes** for a teacher — `ตารางของฉัน` / `My Schedule` reaches the schedule reply, `ปฏิทิน` / `Calendar` reaches the calendar link. **A help list is a promise; an untested one is how we got here.** If a word in the approved copy does not route today, **stop and tell me** — that is a wording decision I have to take back up the chain, not something to fix by widening the parser.
- **The chat's language**, the blank line after the heading — K1's shape, as TASK-477 settled for the un-mute reply.
- **Unknown/unlinked users are unchanged.** So is every parent surface.
- 📌 The list says "วันนี้ / สัปดาห์นี้" because REQ-109 §6 adds the weekly view to `ตารางของฉัน` (TASK-486, next). **That is deliberate: the copy is approved as written.** If the weekly view is not built when this ships, say so in your report and I will decide whether they release together — **do not silently reword it to today-only.**

## Definition of Done
- [ ] The two replies by value, both languages, chat's language, blank line · the **parent's** list pinned unchanged · 🔑 **both advertised commands proven to route for a teacher** · unknown/unlinked unchanged · suite **count** · tsc 0 · 57 = 57 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that gives a teacher the parent list back and one that advertises a command that does not route · report here + `inbox/SA.md` + log.

---

# ⏸️ STOPPED AS INSTRUCTED — @Jason → @Sober (2026-09-26) — one approved word does NOT route today. No code written.

## §1 🔴 The finding: `ตารางของฉัน` / `My Schedule`, TYPED by a linked teacher, gets SILENCE
The teacher branch of the message router (`line-webhook.service.ts`, `if (linked === "teacher")`) matches with `inList`, which is an **EXACT** match (`list.includes(word)`, on the lower-cased text):
- `CMD_SCHEDULE = ["ตาราง", "ตารางสอน", "schedule"]`: **`ตารางของฉัน` is not in it, nor is `my schedule`.** Anything unmatched from a teacher falls through to AC-16's silence (the comment beside it says so on purpose). ⇒ **A coach who types exactly what the new list advertises gets no answer.**
- `CMD_CALENDAR = ["ปฏิทิน", "calendar"]`: ✅ **`ปฏิทิน` / `Calendar` DO route** (`Calendar` is lower-cased before matching) and reach `doTeacherCalendar`.

| Advertised | Typed today | Tapped today |
|---|---|---|
| `ตารางของฉัน` / `My Schedule` | ❌ silence | ✅ the menu cell fires `action=schedule` → today's schedule |
| `ปฏิทิน` / `Calendar` | ✅ the calendar link | — (not a menu cell) |

📌 Why it matters that it's typed: the list's heading is *"คำสั่งที่ใช้ได้ / Available Commands"*, the same shape as the parent's list. **For parents, TASK-470 made every advertised word a real command** (`my course`, `request leave`: the TASK-313 guard caught them). The teacher list would be the first list that advertises a word you can tap but not type.

## §2 Options (yours, or up the chain; I have NOT widened the parser)
- **A. Make the advertised words commands:** add `ตารางของฉัน` and `my schedule` to `CMD_SCHEDULE` (they then also become reserved words, as every command is). Nothing to reword. This is the TASK-470 precedent.
- **B. Reword the copy** to words that already route (e.g. `ตาราง` / `Schedule`). That changes approved copy, so it goes back to the owner.
- **C. Keep the copy and treat it as describing the MENU CELL** (the cell is literally labelled `ตารางของฉัน / My Schedule`). It needs no code, but it's the only list where "Available Commands" contains a word that isn't a command.
- My recommendation: **A.** It is the precedent, it keeps the approved copy byte-for-byte, and it is two words in one list.

## §3 The other things the task asked me to check, so you can rule once
- **The defect is confirmed in the code:** the `action=lang` postback is handled **before** the linked-role check, so a teacher's ภาษา/ช่วยเหลือ tap runs the same line as a parent's (`lang_switched` + `menu_body`), i.e. the PARENT's list. The fix is a role check on that one line, pending §2.
- **"วันนี้ / สัปดาห์นี้": the week IS reachable today.** The schedule reply already carries a "This week" quick-reply button (`btn_week` → `action=schedule&range=week`). So "Today's / This week's schedule" is true now in today's format; TASK-486 changes the FORMAT, not whether a week exists. It doesn't need to wait for 486 on that account.
- **The approved copy has NO blank line after `คำสั่งที่ใช้ได้:` / `Available Commands:`** (the parent's list has one). I will keep it byte-for-byte as approved. I'm noting it only so it's a known difference, not a surprise.
- Unknown/unlinked users and every parent surface: untouched by any option.

⏸️ **Waiting on your A / B / C.** TASK-484 is done and reported.

---

# 🔨 RULING — @Sober (2026-09-26): **A.** Make the advertised words real commands. ▶️ Resume; the copy does not change.

**Stopping was exactly right, and the finding is the one the task was built to catch.** I wrote *"a help list is a promise; an untested one is how we got here"* expecting the test to prove two words route. It proved one does not. 🔑 **The instruction that mattered was "stop and tell me" rather than "make it work"** — the tempting fix (widen the parser until the copy is true) is the same shape as the mistake, and he did not take it.

## The ruling: **A**, and why not B or C
- **A — add `ตารางของฉัน` and `my schedule` to `CMD_SCHEDULE`.** It keeps the owner-approved copy **byte for byte**, and it follows **TASK-470's precedent**: for parents, every advertised word was made a real command rather than the list being trimmed to what the parser already knew.
- 🚫 **Not B.** Rewording approved copy to suit our parser is the tail wagging the dog: the customer chose the words a coach reads, and the word on the menu cell is `ตารางของฉัน`. Sending that back up the chain to save two array entries would also spend the owner's attention on our implementation detail.
- 🚫 **Not C.** "Available Commands" containing a word you can tap but not type is precisely the sort of quiet untruth that costs us a coach's confidence the first time they try it. **A list under that heading is a promise about typing.**
- ✅ **The reserved-word consequence is fine and I have checked it:** `RESERVED_WORDS` is built from the command lists on purpose ("the router's vocabulary **and** the reserved set, because they must be the same words"). So a child cannot be nicknamed `my schedule` — which is correct, not a side effect to regret.

## The rest of §3 — ruled, so you build once
1. **The actual defect is confirmed and is one line:** the `action=lang` postback is handled **before** the linked-role check, so a teacher's tap runs the parent's path. Put the role check on that line. 🚫 Do not restructure the postback router for this.
2. **"วันนี้ / สัปดาห์นี้" is TRUE today** — the schedule reply already carries a `btn_week` chip. ⇒ **This ships on its own; it does not wait for TASK-486.** Good: that removes the one coupling I was worried about.
3. **The blank line: keep the approved copy byte for byte — the copy wins, and my Definition of Done was wrong.** I wrote "K1's shape, blank line after the heading" from the parent's list; the approved teacher copy has none. 📌 **When my task and the owner's approved text disagree, the approved text wins and I want to be told — which is what he did.** The DoD below is amended.
4. Unknown/unlinked and every parent surface: untouched, as before.

## Definition of Done — amended
- [ ] The two replies **byte-identical to REQ-109 §6** (no blank line after the heading — my earlier line was wrong) · the role check on the `action=lang` postback, nothing else restructured · 🔑 **both advertised words route for a teacher, TYPED and tapped** · the parent's list pinned unchanged · `RESERVED_WORDS` grows by the two words, pinned · suite **count** · tsc 0 · 57 = 57 · 🔑 Break-and-watch — incl. a mutation giving a teacher the parent list back, and one that advertises a word that does not route · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-26) — ruling A; the approved copy byte for byte; the list proven TRUE, typed and tapped; 3130 pass / 0 fail; 6/6 mutations bite

**Numbers:** `bun test` **3130 pass / 0 fail** (+9; new `src/services/teacher-help-list-req109.test.ts`) · `tsc` **0** · **57 = 57**.

## §1 What was built
- **`teacher_menu_body`** (i18n): **copied out of REQ-109 §6's own bytes by script, never retyped.** It is the part after the confirmation's blank line, with **no blank line after the heading**, as approved.
- **The ONE role check, on the `action=lang` line only** (no restructuring): `const listKey = (await detectLinkedRole(lineUserId)) === "teacher" ? "teacher_menu_body" : "menu_body";`. A parent's reply is byte-identical to before.
- **Ruling A:** `CMD_SCHEDULE` += `ตารางของฉัน`, `my schedule`. They are in `RESERVED_WORDS` by construction (pinned).

## §2 By value, through the real dispatcher
- **Teacher, TH chat taps ภาษา/ช่วยเหลือ ⇒ the approved EN reply, whole; EN chat ⇒ the approved TH reply, whole.** (The toggle flips the language, as for parents.)
- **A parent's reply is pinned unchanged**, whole, in TASK-477's vocabulary.
- 🔑 **THE LIST IS TRUE: the advertised words are read OUT OF THE LIST ITSELF** (every `· word — …` line), then each is **typed** by a teacher, and the test checks it reaches its own answer: `ตารางของฉัน` / `My Schedule` → the schedule, `ปฏิทิน` / `Calendar` → the calendar link. Each gets exactly one reply, not silence. **A line added to the list later without a command behind it fails this test** (mutation D, a third advertised line, bites).
- **Tapped:** the menu cell fires `action=schedule` and answers.
- **"This week's" is true today:** the schedule answer carries the `action=schedule&range=week` chip (pinned).

## Break-and-watch: `mut485.mjs`, 6 mutations, **6 bite**
Every bite shows real failing tests. `finally` + sha-256 restore, byte-identical each time. CHECKSUM over `git diff` + untracked files, `959febf5…`, identical before and after. `BASELINE=41` read off a real run on 3 suites.
- A 🔴 **a teacher gets the parent's list back**
- B 🔴 `ตารางของฉัน` stops routing
- C 🔴 `my schedule` stops routing
- D 🔴 **the list advertises a word that does not route**
- E the approved copy "improved" with a blank line after the heading
- F the role check inverted (a parent gets the teacher's list)

📌 **Your generator note (a hand-made file dropped into a generated path) is recorded as yours.** Nothing here touched assets.
⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Re-run by me, twice: **3130 pass / 0 fail** both times · tsc 0 · 57 = 57 · `CMD_SCHEDULE` now carries `ตารางของฉัน` and `my schedule`, and it feeds `RESERVED_WORDS` as it should.

🔑 **The best thing here is how the list is proven true: the advertised words are read OUT OF THE COPY ITSELF, then typed by a teacher and followed to their answer.** That is not a test of today's two words — it is a test that **the list and the router cannot disagree**, whatever anyone writes in the copy next time. The defect this task was built on (a heading saying "Available Commands" over a word that is not a command) is now structurally unrepeatable, which is worth far more than the two entries that fixed today's instance.

✅ **The copy was taken from REQ-109 §6's own bytes by script**, not retyped. On approved customer text that is exactly right: a hand-copied Thai string with one wrong character passes every test we would think to write.
✅ **One role check on the `action=lang` line, nothing restructured** — as ruled. The parent's reply is pinned unchanged, so TASK-477's vocabulary did not move as a side effect.
📌 And the ruling's premise held: no blank line after the heading, **because the approved text says so and my Definition of Done was wrong**. He built the approved text, not my description of it.
