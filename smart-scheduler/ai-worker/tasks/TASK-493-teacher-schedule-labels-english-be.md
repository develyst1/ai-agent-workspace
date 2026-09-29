# TASK-493 — the teacher schedule's words stay ENGLISH in a Thai chat, exactly as Khwan's sample — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size XS.** Closes TASK-486 §4, the one question I deliberately did not guess at.

## §0 The answer
**Owner, for Khwan (09-26, via Porter): the teacher schedule's labels stay ENGLISH exactly as in the sample, for Thai chats too.**
So `⏱️ THIS WEEK'S SCHEDULE`, `Confirmed`, `Attended`, `Extended`, `Pending`, `Leave` — **in both chats.** ✅ And the status table is approved as built (Extended both views · No-show and Awaiting-reschedule today only · Paused hidden).

## §1 Build
- Remove the Thai label set from the teacher schedule formatter (`⏱️ ตารางสัปดาห์นี้` and the `status_*` reads for this message). **The words are the same in both languages, by value, pinned.**
- 🔑 **Say what happens to the language parameter.** If the formatter no longer varies by language, **the parameter should go** rather than sit there implying something it no longer does — TASK-489's lesson: *a parameter that exists to express an intention rather than to be used is a comment that lies later.* If something else in the message still follows the chat's language, say what, and keep it for that.
- 🚫 **The rest of TASK-486 does not move:** the structure, the U+3000 indent, the 3-letter day labels, program-name-only, the note line, the digest's owner-approved greeting and footer, the clash note, the today header's equality with the AUTO message. Pin that they are unchanged.
- 📌 **The parent's surfaces stay bilingual.** This ruling is about the teacher schedule only — pin that nothing on a parent's path lost its Thai.
- ⚠️ **Write the REASON beside the English strings**: this is the customer's own choice for her coaches' readability, not an oversight, and the next person to meet an all-English message in a Thai chat will otherwise "fix" it.

## Definition of Done
- [ ] The teacher schedule's words English in both chats, by value · the language parameter removed **or** its remaining purpose named · everything else from TASK-486 pinned unchanged · the parent's surfaces pinned still bilingual · the reason written beside the strings · suite **count** · tsc 0 · 58 = 58 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that restores Thai labels for a TH chat and one that makes a parent surface English · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason → @Sober (2026-09-26) — the teacher schedule's words are English in every chat; the body lost its language parameter; the reply keeps `lang` for two named lines. 3200 pass / 0 fail · tsc 0 · 58 = 58 · 5/5 mutations bite

**Numbers:** `bun test` **3200 pass / 0 fail**, twice (+3: the old TH test replaced, four added) · `tsc` **0** · **58 = 58**.

## The change
- **`TEACHER_SCHEDULE_WORDS: Lang = "EN"`** (`lib/teacher-schedule.ts`), with **the reason beside it**: "the customer's own choice, not an oversight … do not 'fix' it". The headers and the status words read through it.
  - The status words are **still read from the shared `status_*` vocabulary** (its EN column), so one vocabulary still moves every surface together. **The Thai column is untouched**; it serves the parents.
- **`tsched2_title_week`** has English in **both** columns, and the reason is written beside it in `line-i18n.ts`. The Thai proposal from TASK-486 is gone rather than left as a dead string that implies it is used.

## 🔑 The language parameter
- **`renderTeacherScheduleBody(rows, view, opts)`: `lang` REMOVED.** The body has no words that vary by chat. The digest's call lost its literal `"EN"` with it.
- **`renderTeacherSchedule(rows, view, lang, cap)`: `lang` KEPT, for exactly two lines**, named in its comment: the empty line (`tsched_empty`, "ไม่มีคาบสอนในช่วงนี้ / No classes in this range") and the overflow line (`tsched_more`, "…และอีก N คาบ"). Neither is in Khwan's sample; both are sentences, not labels.
  - That purpose is **pinned** (TH chat gives the Thai empty line and the Thai "…more" line), and **mutation E** (the empty line stops following the chat) bites.
  - ❓ **Your call:** if the owner's "English" should cover those two sentences too, drop `lang` there. It is one line, and the parameter then goes entirely.
- **Also still in the chat's language, not the schedule:** the quick-reply chips (Today / This week / calendar). They are the chat's buttons, not the schedule's words, and the moved tap test says so.

## Pins
- **English in both chats, by value:** a Thai chat's reply is **byte-identical to the English one**, for Khwan's full sample (today and week views) and for a two-row fixture. **Every** status a coach can be shown renders its English word in a Thai chat. **No Thai outside the names.**
- **The reason is beside the strings:** pinned by source in both files.
- **Parents keep their Thai:**
  - every `status_*` TH entry is Thai (the shared vocabulary that the ICS feed and the parents' lists read);
  - `suspended_notice`, `checkin_too_late`, `checkin_bad_link`, `menu_body` and `empty_checkin` are Thai in TH.
- **TASK-486 unchanged, by the existing pins, untouched and passing:**
  - Khwan's EN sample byte for byte (the U+3000 indent, 3-letter days, program-name-only, the note line);
  - the today header equal to the AUTO message's title;
  - the status sets against the real enum;
  - the parent's `Private BALLET`;
  - the digest's owner-approved title, greeting and footer;
  - the clash note.

## Moved pins (each with the reason written in)
- `teacher-schedule-req109` › "🇹🇭 TH, proposed and pinned" (the Thai labels) is **replaced** by "a THAI chat reads the SAME English words", plus the three pins above.
- `teacher-schedule-tap-req109` › "TH chat: the same, in Thai words" now expects `FREESKATE / Pending` in a Thai chat. The chips stay Thai (`วันนี้`, `สัปดาห์นี้`), unchanged.
- `group-series-req104` pinned the literal `"EN"` the digest handed to the formatter. It now pins that the digest passes **no** language, and that the formatter's words are the `"EN"` constant.

## Break-and-watch: `mut493.mjs`, 5 mutations, **5 bite**
`BASELINE=61` (the five files), read off a real run. `finally` + sha-256 restore, byte-identical. **CHECKSUM `3d511ade…` identical before and after.**
- **A — Thai labels restored for a TH chat** (the chat's language handed back into the body): **bites, 2 fail**.
- **B — the constant flipped to Thai** (every chat and the digest): **bites, 10 fail**.
- **C — a parent surface made English** (`suspended_notice`'s Thai column): **bites, 1 fail**.
- **D — the shared status vocabulary's Thai column made English**: **bites, 1 fail**.
- **E — the empty line stops following the chat**: **bites, 1 fail**.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26) — with the answer to his ❓
Re-run by me: **3205 pass / 0 fail** · tsc 0 · 58 = 58. (3200 at his report; the difference is TASK-494's new file, which I verified in the same tree.)

✅ **The strongest pin here is that a Thai chat is BYTE-IDENTICAL to an English one** — her whole sample, both views. That is the customer's ruling expressed as an equality rather than as a list of translated strings, and it cannot drift one label at a time.
✅ **Parents keep their Thai**, pinned across every `status_*` and five parent replies. The ruling was about teachers; making that explicit is what stops it leaking.
✅ **The `lang` parameter removed from the body** rather than left sitting there — his own TASK-489 lesson applied to himself.

## ❓ His question, ruled: **yes, those two lines are English too.**
He kept the chat's language for exactly two lines outside Khwan's sample — the empty-schedule line and *"…and N more"* — and asked.
**Make them English.** 🔑 **One message, one language.** Two Thai sentences inside an otherwise wholly English message do not read as a considered choice; they read as **a bug the coach will report** — and a coach reporting a non-bug costs more than either wording. The customer's reason was her coaches' readability, and a mixed message is the one thing that is harder to read than either language.
✅ **The chips stay in the chat's language, and he is right to separate them:** they are buttons, part of the app's furniture, not the schedule. The ruling was about the message.

---

# ✅ FOLLOW-UP REPORT — @Jason → @Sober (2026-09-26) — your ❓ ruling built: the empty line and "…and N more" are English too; `renderTeacherSchedule` takes NO language. 3206 pass / 0 fail · tsc 0 · 58 = 58 · 2/2 mutations bite

- **`renderTeacherSchedule(rows, view, cap = 20)`:** `lang` is **removed**. Every word of the message now reads through `TEACHER_SCHEDULE_WORDS` ("EN"), including the empty line ("No classes in this range") and the overflow line ("…and N more"). The comment says why: one message, one language. The webhook's call is now `renderTeacherSchedule(rows, range)`; **the chips still take the chat's `lang`** (they are buttons, not the schedule).
- **`tsched_empty`'s Thai column is untouched, on purpose.** The AUTO "today" message (`line-today-schedule.ts`, parents and coaches) still reads it in the chat's language. That is pinned (`t("tsched_empty", "TH")` is still Thai), so this ruling can't leak into that surface.
- **The equality moved to where the chat actually is.** With no language input left, a TH-vs-EN comparison of the formatter would be a tautology. So the pin now goes **through the real dispatcher** (`teacher-schedule-tap-req109`): **a Thai chat's schedule text is byte-identical to an English chat's, with rows AND with nothing to show.**
- **Moved source pins (with the reason):** `bilingual-flows` and `daily-schedule-req085` pinned the call with `, lang`.
- **Break-and-watch (`mut493c.mjs`):** F (the empty line in Thai) **bites, 2 fail**; G (the overflow line in Thai) **bites, 1 fail**. `BASELINE=62`, restore byte-identical, and the checksum is identical before and after.
⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26) — the follow-up closes it
Verified in the current tree (with TASK-492): **3240 pass / 0 fail** twice · tsc 0 · `renderTeacherSchedule(rows, view, cap)` takes **no language** at `lib/teacher-schedule.ts:111`.

🔑 **The best judgement in this follow-up is the one about the pin, not the one about the words.** With the language input gone, **a TH-vs-EN comparison of the formatter would be a tautology** — it could not fail, whatever anyone did to the strings. So he **moved the equality to the real dispatcher**, where the chat's language actually enters: a Thai chat's schedule text byte-identical to an English chat's, with rows and with nothing to show.
📌 **Recorded as a rule: when a change removes the input a pin varied, the pin stops being evidence and becomes decoration.** It keeps passing, which is precisely why nobody notices. **Move it to where the variable still exists, or delete it — do not leave it green.** That is a failure mode I have not seen us name before, and it is more dangerous than a missing test because it looks like coverage.

✅ **`tsched_empty`'s Thai column deliberately untouched**, because the AUTO "today" message still reads it in the chat's language — **pinned so this ruling cannot leak into a surface parents also see.** Knowing which readers share a string is the whole job here.
✅ The two moved source pins carry their reason; the chips keep the chat's language (buttons, not the schedule).
