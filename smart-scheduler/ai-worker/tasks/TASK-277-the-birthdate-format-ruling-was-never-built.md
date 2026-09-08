**Status:** DONE — code (Sober 09-07, reviewed) — tsc 0 / 1639 pass 0 fail / nothing applied. His answer found a SECOND unbuilt item (§3c phone format) ⇒ folded into TASK-278 §6, rule written into SA-Lead.md, backlog swept as TASK-279 (mine).

# TASK-277 — 🔴 the owner's birth-date ruling has been sitting unbuilt since 2026-09-06, in the flow we shipped tonight

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-07)
**Requirement:** `REQ-079` §17 (**closed** by the owner 2026-09-06) · 🚫 No migration, no database, no FE change.
⛔ **Do this BEFORE TASK-278** — that one applies the customer's copy to the same key, and the format ruling
decides what that key must say.

---

## §1 🔻 My miss, stated first

**`REQ-079` §17 was CLOSED on 2026-09-06 with two owner rulings.** I carried one (*"adding students: unchanged"*)
and **never cut a task for the other.** I searched `tasks/`, `specs/` and the board for it tonight: **zero hits.**

> §17: *"**Date of birth: `วัน-เดือน-ปี` (`DD-MM-YYYY`).** … ⇒ **The deployed prompt and parser both change** —
> today they demand `ปปปป-ดด-วว` and reject anything else."*

**Still true tonight**, verified in the source:
- `line-i18n.ts` `add_birthdate_prompt` = *"วันเกิดของน้อง (ปปปป-ดด-วว)"* · `add_birthdate_bad` = *"กรุณาพิมพ์
  เป็น ปปปป-ดด-วว"*
- `line-add-student.ts:61` `parseBirthDate` matches **`/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/`** — **four-digit
  year first, and nothing else.**

🔴 **And tonight TASK-275 made that flow bilingual** ⇒ **we translated a prompt the owner had already overruled.**
📌 **The ruling was in the REQ the whole time.** A decision written down and not turned into a task is the same
class as the week's other four — **a note is not a mechanism** — except this one is mine and the note was an
owner's answer.

## §2 The strings — the owner's own, verbatim from §17
- **Prompt:** `กรุณาพิมพ์วันเกิดของนักเรียนค่ะ (วัน-เดือน-ปี เช่น 02-12-2024)`
- **Rejection:** `รูปแบบวันเกิดไม่ถูกต้องค่ะ กรุณาพิมพ์เป็น วัน-เดือน-ปี เช่น 02-12-2024`
⚠️ **Both are TH.** The EN side is ours for now — **TASK-278 replaces it with the customer's** *"Please enter the
date of birth."*, **plus the format**, which their copy omits.
⚠️ **`ข้าม` / skip must survive** in both strings. Ours carries it; the owner's sentences do not mention it, and
**dropping the escape from a wizard step is not a wording change.** **Keep it, and say you did.**

## §3 The parser — day-first, and it must REFUSE the old order LOUDLY
Accept **`DD-MM-YYYY`** with our dash (and `/`, as today). ✅ Keep every existing guard: the range check and the
`Date` round-trip that refuses `31-02-2026` rather than rolling it into March.

🔴 **§17's own warning, and it is the DoD's sharpest line:**
> *"The bot must still accept a 4-digit-first string and refuse it CLEARLY rather than read `2024-12-02` as day
> 2024 and produce a confusing error."*

⇒ **`2024-12-02` must fail with the format message, not with a silent nonsense parse.** **Recognise the
four-digit-first shape and reject it as a wrong-order date.** 🚫 **Do not silently accept both orders** — that is
worse than either, because `03-04-2024` would then mean two things depending on the day.

⚠️ **`03-04-2024` is genuinely ambiguous to a human** — 3 April or 4 March. **What saves it is the confirm step
(§7): the summary prints the date back before anything is written.** ⇒ 🔴 **The confirm step is now LOAD-BEARING
for correctness, not just for review** (§17's words). **Do not let it be simplified away later** — say so in a
comment where the summary is built.

## §4 What must not change
- 🚫 The stored value stays **`YYYY-MM-DD`** — this is an INPUT format, not a storage format. **Anything reading
  `birthDate` must be untouched.**
- 🚫 The skip path, the strike/re-prompt behaviour, `withExit`.
- 🚫 `t()`/`both()`, the label cap, the notifications, the ICS feed.
- 🚫 No migration, no database, no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] The prompt and rejection are **the owner's strings verbatim**, and **`ข้าม` still works** — asserted
- [ ] `02-12-2024` parses to **`2024-12-02`** — asserted
- [ ] 🔑 **`2024-12-02` is REFUSED with the format message** — asserted. *A four-digit-first string must fail
      clearly, not parse as day 2024.*
- [ ] `31-02-2026` still refused (the round-trip guard survives the reorder)
- [ ] **The stored value is still `YYYY-MM-DD`** — asserted, because this is the one place a reorder could reach
      the database
- [ ] The confirm step still prints the date back, with a comment saying it is load-bearing
- [ ] 🚫 No migration, no database, no FE change

## Question
**Are there other closed rulings in `REQ-079` §17 or elsewhere that never became tasks?** I found this one by
reading the REQ to map the customer's copy — **not by any process.** ⚠️ **Do not sweep the whole requirements
folder** (that is mine), **but if you see one while you are in there, name it.**

---

# ✅ Jason (BE) — DONE, code. 2026-09-07

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1639 pass / 0 fail, 129 files**
🚫 No migration · no database · no FE change · the skip path, the strike/re-prompt behaviour, `withExit`,
`both()`/the label cap, the notifications and the ICS feed all untouched.
New: `src/lib/birthdate-format.test.ts` (10 tests).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1639 / 0**, 129 files
- [x] The prompt and rejection are **the owner's strings verbatim**, and **`ข้าม` still works** — asserted in
      both strings, both languages, and through the parser
- [x] `02-12-2024` → **`2024-12-02`** — asserted
- [x] 🔑 **`2024-12-02` is REFUSED** — asserted, **and asserted that the refusal is by SHAPE**, matched before
      the day-first pattern is tried
- [x] `31-02-2026` still refused — the round-trip guard restated day-first, because it is the one guard a
      reorder could quietly have lost
- [x] **The stored value is still `YYYY-MM-DD`** — asserted over four accepted inputs
- [x] The confirm step prints the date back, with the load-bearing comment
- [x] 🚫 No migration, no database, no FE change

## §3 — the refusal is by SHAPE, not by a day being out of range
```ts
// The retired order, caught FIRST and refused.
if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(raw)) return { ok: false };
const m = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
```
`2024-12-02` would have failed anyway — day 2024 is out of range — **but the point is which sentence the parent
reads**, and a range failure and a format failure are the same `{ ok: false }` to the caller. Matching the
four-digit-first shape first makes the refusal be *about the order*. **Mutation-tested: removing that line fails
the test**, and it fails for the right reason — the string starts parsing instead of being rejected.
🚫 Both orders are **not** accepted, asserted with `03-04-2024` → `2024-04-03` and nothing else.

## 🔴 The two tests that pinned the overruled format
`line-add-student.test.ts` asserted `parseBirthDate("2018-04-02") → "2018-04-02"` **and, four lines later,
`parseBirthDate("02-04-2018").ok === false`.** ⇒ **the suite was actively defending the format the owner
overruled on 09-06.** Rewritten as the requirement, not deleted — the round-trip guard, the skip and the
"impossible date" property all kept, restated day-first.

## The confirm step, in the code
Comment written where the summary is built: *"THIS STEP IS LOAD-BEARING FOR CORRECTNESS, not just for review…
`03-04-2024` is genuinely ambiguous to a HUMAN — 3 April or 4 March. The parser is unambiguous; the person
typing is not… 🚫 Nobody may 'simplify' the confirm step away later."* Asserted by the test, so the sentence
cannot be deleted quietly either.

## Answer — **yes, one more, in the same section, and it is the same shape**
🔴 **`REQ-079` §17 §3c — *"phone shown formatted (`082-503-1502`)"*. Closed as *"cosmetic, cheap, do them"* and
never built.**
`verify_parent_ok_existing` / `verify_parent_ok_new` interpolate `{phone}`, and `{phone}` is
`normalizePhone(code)` — **the raw digits, `0825031502`.** No formatter exists anywhere in the repo (I grepped
for one). ⇒ **a parent who registers today reads their number unformatted**, in the message that confirms their
account.
✅ **The other two items of §3c ARE built**, so this is one omission rather than a forgotten paragraph:
`ยืนยัน`/`confirm` are accepted (`CONFIRM` in `line-add-student.ts:47`), and the existing children **are** listed
back at the add-student step (`parentChildrenNames`, `line-webhook.service.ts:1132`).
📌 **Not built here** — it is a wording/display decision in a message TASK-278 is about to rewrite, and doing it
inside a format fix is how two changes become one unreviewable diff. **Named, per your instruction.**

⚠️ **And one that is raised rather than un-tasked**, so I am not counting it: `REQ-079` §18's own closing note —
*"the `ภาษา` control may now switch nothing… a switch that switches nothing is a control that lies."* **You
raised it in the same document; it is with @Porter.**

## Review — Sober, 2026-09-07: ✅ **PASS. TASK-277 is DONE (code).** 🔴 **And your answer found a SECOND unbuilt item in the same requirement — which makes this a process failure, not two slips. Mechanism written.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **1639 pass / 0 fail**, 129 files · nothing applied.
`line-add-student.ts` refuses the four-digit-first shape **before** the day-first pattern is tried ·
`add_birthdate_prompt` is the owner's sentence **with `หรือพิมพ์ ข้าม` kept** · stored value still `YYYY-MM-DD`.

### 🔑 The shape-first refusal, and why your reasoning is better than the DoD line
> *"`2024-12-02` would have failed anyway — day 2024 is out of range — but the point is which sentence the parent
> reads, and a range failure and a format failure are the same `{ ok: false }` to the caller."*

✅ **Exactly.** The behaviour was already correct; **the message was not**, and the caller cannot tell the two
apart. **A control that returns the right verdict for the wrong reason is one refactor away from returning the
wrong verdict** — and it reads as fine until then.
🔑 **And you mutation-tested it *and checked the failure reason*** — *"it fails for the right reason: the string
starts parsing instead of being rejected."* 📌 **That is the rule I wrote down four hours ago after my own false
confirmation on TASK-273, and you applied it without being told.**

### 🔴 The two tests that were DEFENDING the overruled format
`parseBirthDate("2018-04-02") → "2018-04-02"` **and** `parseBirthDate("02-04-2018").ok === false`, four lines
apart. ⇒ **the suite was actively holding the format the owner overruled on 09-06.**
📌 **That is why the miss survived a day of green builds** — and it is the sharpest argument yet for rewriting
tests **as the requirement** rather than deleting them: a test that pins yesterday's decision is indistinguishable
from a test that pins today's.

### 🔻 Your answer makes this a PROCESS failure, and the mechanism is now written
**`REQ-079` §3c — *"cosmetic, cheap, do them"* — three items. Two are built; the phone formatting is not.** A
parent reads **`0825031502`** in the message confirming their account, and **the customer's own screen 4 shows
`082-503-1502`.**
⇒ **Two things in one requirement that were decided and never became work**, both found because you went looking
for something else. **Once is a slip. Twice in one file is that there is no mechanism** — and *"a note is not a
mechanism"* is the sentence this week has been built on, so it applies to my own workflow too.
✅ **Written into `SA-Lead.md` as a standing rule:** *a section marked ✅ CLOSED must name the TASK carrying each
ruling, or say "no work" — at the moment of closing, which is the only moment anyone is looking.*
✅ **And `TASK-279` is mine, not yours** — sweeping the requirements folder for closed decisions with no task.
**You were right to name it and right not to sweep.**

### 🔻 I changed my mind about where the phone formatting goes
You said *"not here — it is a display decision in a message TASK-278 is about to rewrite."* **Right about
TASK-277, and I have gone further: it belongs IN TASK-278.** ⇒ **their screen 4 shows the formatted number**, so
rendering their copy faithfully *is* the formatting. **Folded in as §6 rather than cut as a third task touching
one string** — and 278's *"every Thai string byte-identical"* line now names that one intended exception, so the
assertion stays honest instead of quietly being relaxed later.
