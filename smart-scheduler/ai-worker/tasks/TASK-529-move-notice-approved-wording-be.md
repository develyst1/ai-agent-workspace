# TASK-529 — the move notice's APPROVED wording: the house pattern, `Was :` appended — BE, XS. **This gates the sid deploy.**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size XS.** 🔨 **Owner ruling via Porter. Replaces TASK-516's draft.** ⚠️ **The sid deploy waits on this being green** — the notice is already in HEAD, so the release cannot go until the words are the approved ones.

## §0 What the owner changed, and it is a pattern correction rather than a rewrite
*"ให้ pattern คล้ายๆ กับอันอื่นๆ"* — **two corrections to your draft:**
1. **Date and Time on separate lines**, like every other notice.
2. **English field labels in BOTH languages** (`Student` / `Program` / `Date` / `Time`), as `❌ CLASS CANCELLED:` already does. 🚫 **No Thai `จาก` / `เป็น`.**
🔑 **And the structural one: the main block is the NEW slot. The OLD slot is ONE appended line, `Was : <date> <time>`** — the same way cancel appends `Reason` / `Note`.
📌 **My draft had From/To as a pair, which read as a table of two equal facts.** His shape says *"this is the class, and it used to be elsewhere"* — **the new slot is what a coach acts on, and the old one is context.** That is a better message than mine and it matches what every other notice does.

## §1 The approved text
**To every COACH** (the coach stamp, bilingual title, identical in both languages):
```
CLASS MOVED / ย้ายคาบ ‼️
Student : มะขิด
Program : Freeskate 1 HR
Date : 12-10-2026
Time : 14:00-15:00
Coach : Ek, Nok
Was : 05-10-2026 10:00-11:00
```
**To the FAMILY** — the **title follows the chat's language** (TH `📅 ย้ายคาบเรียน:` / EN `📅 CLASS MOVED:`), **the labels stay English**, and **no `Coach` line and no reason**:
```
📅 ย้ายคาบเรียน:
Student : มะขิด
Program : Freeskate 1 HR
Date : 12-10-2026
Time : 14:00-15:00
Was : 05-10-2026 10:00-11:00
```

## §2 Build
- **Replace the draft keys' values, remove every `📖 DRAFT` marker on them, and flip the FORM pins to BYTE pins** — that was the whole point of pinning by shape: **his answer is a one-line change and then the bytes are the contract.**
- 🔑 **The family's title follows the chat language while its labels do not.** That is deliberate and slightly odd — **pin both halves explicitly**, or the next reader will "fix" one of them.
- **`Was :` is one appended line**, in the same position cancel puts `Reason` / `Note`. 🔑 **Pin that it is absent from nothing** — i.e. a move always has a previous slot, so the line always appears; if there is a path where it could be empty, **say so** rather than letting it render as `Was :` with nothing after it.
- 🚫 **No other behaviour changes.** Who receives it, when it fires, the seat filter, the transaction placement — all TASK-516's, all unchanged and pinned.
- ⚠️ **Nothing else in the message shape may drift while you are in there.** If the house pattern's other notices disagree with each other about label order, **report it, do not harmonise it** — that would be a wording change nobody approved.

## §3 Tell me when it is green
Porter is holding the sid deploy on this. **Report the suite counts both ways and I will verify and release the hold the same turn.**

## Definition of Done
- [ ] Both messages **byte-pinned** to the approved text, both languages, every draft marker gone · the family's **title by chat language, labels in English**, both pinned · `Was :` appended in the house position and always present (or the exception stated) · 🚫 TASK-516's behaviour pinned unchanged · no other notice touched (disagreements **reported, not harmonised**) · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation restoring From/To, one putting Thai labels in the family copy, and one putting `Coach` in it · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-27): GREEN. The approved words are byte-pinned, both audiences and both languages · no draft markers left · TASK-516's behaviour unchanged · **3409 / 0 normally AND unreachable, 0 failed queries** · tsc 0 · 60 = 60 · six mutations bite

## §1 What changed (three source files, words and shape only)
- **`line-message-fields.ts`:** `class_moved` now uses **the house block** `student · program · date · time · coach`, **the same list and order as `class_cancelled`**.
- **`line-message.ts`:**
  - The block's **Date / Time are the NEW slot** (`payload.to`).
  - **`Was : <old slot>` is ONE appended line, last**, where cancel appends `Reason` / `Note`.
  - Both slots still come from the **payload snapshot** (TASK-516's A→B / B→C rule).
  - The slots arrive already `HH:MM`, so **the render site never trims** (TASK-283's pin).
- **`line-i18n.ts`:**
  - **One new label, `ob_f_was` = `Was`**, English in both languages and **shared by both audiences**.
  - **Removed:** `ob_f_from` / `ob_f_to` / `mv_from` / `mv_to` (dead now, and nothing else read them).
  - Both `📖 DRAFT` comments are replaced with **✅ APPROVED (owner, 09-27) · byte-frozen**.
  - The stamp (`CLASS MOVED / ย้ายคาบ ‼️`) and the family titles (`📅 ย้ายคาบเรียน:` / `📅 CLASS MOVED:`) were already the approved text: **byte-identical, unchanged**.

## §2 Pins (`announce-move-task516.test.ts`: the FORM block is replaced with 5 BYTE tests)
- **Coach:** the exact seven lines of your §1, **`toBe` in TH and in EN** (identical).
- **Family:** the exact six lines, TH and EN.
- 🔑 **The deliberate mix, both halves:**
  - **the titles differ by language**;
  - **the labelled lines are identical across languages**;
  - the labels are exactly `Student / Program / Date / Time / Was`.
- **`Was`:**
  - it appears exactly once, **last**, and holds the OLD slot, while the block holds the new one;
  - it is **always present from the producer**: `announceMove` builds `from` from the pre-move row's date/start (NOT NULL columns), and that line is pinned by source.
  - 📌 **The one exception, stated:** a hand-made **partial payload** (no old date/start) drops the whole line; it **never renders a bare `Was :`**. This is TASK-345's walker rule: *a poor message, never NO message.* No real producer builds one.
- **`message-time-format.test.ts` (TASK-283's registry): the one honest update.**
  - The move notice **now prints a `Time`** (the new slot), so its registry row went from `printsTime: false` to **`true`**.
  - Its owner is now **`hhmm(after.startTime)` / `hhmm(after.endTime)`** in `announceMove`: both ends are formatted in the same file.
- **No counter moved:** still 28 kinds, and still 28 renderer `case`s.

## §3 Break-and-watch (CHECKSUM identical, restores byte-identical, BASELINE=5)
- **F: the From/To PAIR restored:** BITES (4 fail).
- **L: Thai labels in the family copy** (`จาก`): BITES.
- **C: a `Coach` line in the family copy:** BITES.
- **E: the family title "tidied" to English in both languages:** BITES (the other half of the mix).
- **S: slots swapped** (the block shows the old slot): BITES.
- **P: `Was` moved above the block:** BITES.

## §4 🚫 No behaviour changes
- `announceMove` is **untouched**: who is told, when, the live-seat filter and the in-transaction placement.
- **All TASK-516 behaviour tests pass unchanged**, and the full suite is green both ways.

## §5 ⚠️ A disagreement REPORTED, not harmonised (as told)
- **The family CANCEL notice mixes label languages:**
  - `cl_reason` is **`เหตุผล` (Thai) in TH**;
  - its other labels (`Student…`, `Note`) are English;
  - the **coach** cancel uses `Reason` (English, `ob_f_reason`).
- So **"English labels in both languages" is not yet true of every notice**: a Thai family whose class is cancelled for a teacher's leave reads `เหตุผล : ครูลา`.
- It's the owner's own approved text (TASK-410, 09-19), so **I did not touch it.** Whether it should become `Reason` is his call.
- **Label ORDER agrees everywhere:** every per-session notice uses `Student · Program · Date · Time · Coach` (`TEMPLATE_FIELDS`), with appended lines after.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27). **🔓 The sid deploy hold is released.**
Verified: **3409 pass / 0 fail normally AND with the database unreachable** · tsc 0 · 60 = 60.

✅ **The approved text is byte-pinned, the drafts are gone, and `announceMove` is untouched** — all of TASK-516's behaviour still pinned green. **The words changed and nothing else did**, which is what an approved-wording task should look like.
🔑 **The deliberate oddity is pinned by BOTH halves** — *the titles differ by language, and the labelled lines are identical across languages.* ⇒ **neither half can be "tidied" into agreement with the other**, which is exactly the risk I flagged.
✅ **`Was` is always present from the producer** (built from the pre-move row's NOT NULL date and start), **and it never renders a bare `Was :`** on a hand-made partial payload. 📌 **That is the right answer to "always present?": it is guaranteed where it comes from, and harmless where it could not be.**
✅ **One registry row honestly updated** — TASK-283's time-format audit now records this notice as printing a `Time`. **A registry that agrees with reality because someone updated it, and said so.**

## 📌 Reported and NOT harmonised, as instructed — and he was right to leave it
**The family cancel notice's `Reason` label is Thai (`เหตุผล`) in a Thai chat, while all its other labels are English** — and **that is owner-approved (TASK-410).** 🔑 **So the house pattern is not "English labels everywhere"; it is "English labels, except where he decided otherwise".** Had he harmonised it, he would have **overwritten an approved decision to make a pattern I described tidier.** ⚠️ **The pattern I handed him was my summary of the house style, not the house style itself** — and the label **order** agrees everywhere, which is the part that actually matters to a reader.
