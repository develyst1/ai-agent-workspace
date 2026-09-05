# TASK-245: BE — a parent is never stuck: an exit from every step, reserved words that mean what they say, and rule 5 that actually fires

- Source: @Porter's ORDER 2026-09-02 (owner-approved, *"เอาเลย รวมไปกับเรื่อง flow ไม่มีทางออก"*) — found by the
  owner on his own phone while checking something unrelated
- Status: ✅ **DONE** — code (Sober 2026-09-03) · the owner’s exact 3-message sequence = @Tanya. Was: REVIEW (Jason) — code done, `tsc` 0, `bun test` 1254/0, no migration

## What actually happened

```
23:45  เมนู   → วันเกิดของน้อง …            ← "เมนู" became the child's NAME
23:48  เมนู   → รูปแบบวันเกิดไม่ถูกต้องค่ะ    ← the ESCAPE attempt rejected as a bad date
23:48  ข้าม   → …                            ← he finished the flow because he could not leave it
```

🔴 **The defect is not *"`เมนู` became a name"*. It is *"a flow has no exit"*.** Fixing only the reserved word
leaves every other accidental entry in the same trap — and **finishing the flow writes a student record that can
never be deleted.**

## 🔴 Why rule 5 did not fire — diagnosed, so you do not go looking

`strikeOrPrompt` has **exactly four call sites** (`line-webhook.service.ts:446 · :909 · :922 · :940`): the
add-student **summary**, `CHOOSE_ROLE`, `AWAIT_2FA`, and the phone/code step. **The name, birthdate and province
steps are not among them.**

- `เมนู` at **name** → free text, accepted as data. No strike, by design (TASK-231: *"free-text steps have no
  'unrecognised' to detect"*).
- `เมนู` at **birthdate** → **rejected** with a format message that **re-asks without going through
  `strikeOrPrompt`.**

⇒ **Rule 5 could not fire.** 📌 **That is a consequence of a decision I approved**, not a bug @Jason introduced —
and the birthdate case shows the rule I approved was too narrow: **a rejection *is* an unexpected reply.**

## What to do — three changes, and one invariant

**1. `ยกเลิก` works at EVERY step, and every prompt says so.**
Append @Porter's wording to each step's question: **` · หรือพิมพ์ ยกเลิก เพื่อออก`**.
Cancelling **deletes the draft and says so** — *the one thing a parent must not wonder is whether part of it was
saved anyway* (TASK-233's rule, now reachable from every step instead of only the last).

**2. A reserved word means what the bot advertises — everywhere. My design call on @Porter's point 2.**
He offered *"behave the same everywhere"* **or** *"ask before treating it as data"*. **Take the first.**
- **Why not the ask:** it adds a turn to a flow we are trying to shorten, and a confirm dialog is a second thing
  to get wrong. **The contradiction is what must go, and one rule removes it; a dialog only manages it.**
- **The rare cost, named and given a path:** a child genuinely called `เมนู` cannot be registered through LINE.
  ⇒ the refusal says so instead of silently eating it:
  *"「เมนู」 เป็นคำสั่งของระบบค่ะ ถ้าเป็นชื่อน้องจริง ๆ รบกวนแจ้งแอดมินนะคะ"* — **and staff can already create a
  student on the People screen**, so the escape exists and is one sentence away.
- The reserved set is the words the bot itself advertises: `เมนู` · `ช่วยเหลือ` · `ยกเลิก` · `ข้าม` and the
  command words. 🔴 **One list, one definition** — the same list the router matches, never a second copy.

**3. 🔴 The invariant that makes rule 5 real: EVERY rejection path goes through `strikeOrPrompt`.**
Today a rejected birthdate re-asks directly. That is an unexpected reply and must count.
⇒ **assert it structurally**: *no reply that re-asks after rejecting input bypasses the strike counter.* A test
that greps the flow for re-ask replies and checks each is reached via `strikeOrPrompt` is worth more than four
individual cases — **a net nobody has seen catch anything is not a net.**
⚠️ Keep the reset: a valid answer clears the count (`resetStrikes`), so a parent who fumbles once and recovers
does not carry a strike.

## 🚫 Scope — @Porter's, and it is firm
**This is a defect fix, not a redesign.** 🚫 **Do NOT re-cut the rich menu. Do NOT add a `คุยกับแอดมิน` cell** —
that needs a new image and the owner has not asked for one.
✅ **Face 2 is one i18n string:** append to the command list that both `เมนู` and `ช่วยเหลือ` render:
```
หรือพิมพ์คำถามเข้ามาได้เลยค่ะ เดี๋ยวแอดมินมาตอบนะคะ 🙏
```
📌 The person reading that list is, by definition, the person who is lost — which is why it is the right home,
and why it restores the half of the design's trade (*the bot is silent, but a person is reachable*) that is
currently missing from the live product.

## Definition of Done — the OUTCOME
- [x] `ยกเลิก` exits from **name, birthdate, province and summary**; each prompt says so; the draft is gone and
      the reply says it is gone.
- [x] A reserved word at the name step is **refused with the reason**, never stored as a name.
- [x] 🔴 **Two rejected replies in a row hand over to a human** — from the birthdate step, which is where it
      failed for the owner. Test the exact sequence he ran. → ⚠️ **half**: every link in that chain is asserted
      DB-free (rejection → `strikeOrPrompt` → `shouldHandOver(2)` → mute + apology), but **running his three
      messages end-to-end needs session rows** — that half is @Tanya's. Named, not skipped.
- [x] A valid answer after one rejection clears the count.
- [x] The command list carries the "a person will answer" line, in both languages.
- [x] The structural invariant: no re-ask-after-rejection path bypasses `strikeOrPrompt`.
- [x] `bunx --package typescript@5.6.3 tsc --noEmit` → **0** · `bun test` **1254 pass / 0 fail**. **No
      migration** — counted: **32 `drizzle/*.sql` = 32 journal tags**, unchanged (this task adds no column).
- [x] 🚫 Nothing sent to a real recipient; no rich-menu republish; no SQL run.

## Implementation Notes

Repo **`smart-scheduler-back`** (path in `machine.local.md`), HEAD **`699c290`**.

**New · `src/lib/line-commands.ts`** — the router's vocabulary and the reserved set are now **the same twelve
lists**, flattened into `RESERVED_WORDS`, with `isReservedWord` / `isCancelWord`. 📌 This is the file that makes
change 2 true rather than merely implemented: a second copy is exactly how *"the bot said `เมนู` is a command"*
and *"the bot stored `เมนู` as a name"* both became true at once. A command added here is reserved the same day.
All **10 inline command arrays** in the service were repointed at it (`inList(CMD_*, …)`); nothing else changed
about the routing, and the three tests that pinned the literal arrays now assert the property through the
constants — a stronger assertion than the text they replaced.

**1 · The exit.** `withExit()` appends `add_exit_hint` (` · หรือพิมพ์ ยกเลิก เพื่อออก`, @Porter's wording) to
**every** question the wizard asks — asserted as a net over the six question keys, not four hand-picked cases.
`isCancelWord(text)` is checked **once, at the top of `handleAddStudentStep`, before any step reads the text as
an answer**, so a step added later cannot forget to honour it. Cancelling calls `clearSession`, and the draft is
a column on the row it deletes ⇒ *"cancelled"* and *"the half-typed record is gone"* are **one act, not two that
could disagree**. `add_cancelled` now says the answers were discarded, in both languages.
- 🔻 Removed the trailing `หรือ ยกเลิก` from `add_summary_confirm` — with the hint appended it would print twice
  on the one step that already had it. Same words, one source.

**2 · Reserved words.** The name step refuses **before any write** and quotes the word back with the way round
it (`add_name_reserved`). The refusal goes through `strikeOrPrompt`, so the owner's second `เมนู` — the escape
attempt — fetches a person instead of being read as data. 🚫 A duplicate name is deliberately **not** a strike:
the parent answered correctly and is being asked a further question; counting it would hand a two-child family
to a human for having two children.

**3 · The invariant, and it caught something.** `src/services/line-stuck-exit.test.ts` **derives the refusal
keys from the copy table** (`/_(bad|badphone|reserved)$/`) and checks every use of every one of them reaches
`strikeOrPrompt` — directly, or as the `{ ok: false, message }` a failed verify carries (plus: that value has
exactly **one** consumer, and it strikes). A refusal string added next month is covered on the day it is
written. 📌 The list it discovered is five keys, two of which I would not have enumerated by hand.
- Rejections now wired: **birthdate** (the owner's branch) and **reserved name**. `strikeOrPrompt` call sites
  went 4 → 6.
- `resetStrikes` added to every accepted answer inside the wizard (name, birthdate, province) — without it a
  fumble at step 2 plus a fumble at step 4 hands over a parent who has been answering correctly since.

**Face 2** is one append to `menu_body` TH+EN. Both `เมนู` and `ช่วยเหลือ` render it because they are the same
`CMD_MENU` list and the same `doMenu` — there is no second menu that could miss the line. 🚫 Scope held: the
rich menus are untouched (asserted: 2 and 5 areas, unchanged).

⚠️ **Two of my own earlier tests failed on this change and were corrected, not loosened** — both had pinned the
old behaviour: `line-add-student.test.ts` asserted the bare `reply` on a bad birthdate (**that bare `reply` is
the defect**), and `line-silence.test.ts` pinned *"free-text steps have no unrecognised to detect"* at 4 call
sites. That sentence was true of a name the bot **accepts**; it was never true of a birthdate the bot
**refuses** — which is the gap the owner fell into. Both comments now say so.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

**Q1 — the `ข้าม` overlap, flagged not fixed.** `ข้าม` is now a reserved word (it must be: the bot advertises
it), so a child cannot be named `ข้าม` — correct. But `line-add-student.ts` keeps its own `SKIP` list
(`ข้าม · ไม่ · ไม่มี · skip · - · none`) which is **not** the same as `CMD_SKIP`
(`ข้าม · ไม่ · ไม่เพิ่ม · เสร็จ · จบ · skip · no · done`). Two skip vocabularies still exist: one decides *"is
this answer a skip"*, the other decides *"is this word reserved"*. ⇒ `ไม่มี` and `-` skip a step but are **not**
reserved; `เสร็จ` and `done` are reserved but do **not** skip. Nothing is broken today and merging them changes
shipped behaviour at the province step, so I did not — but it is the same one-list argument as change 2, one
level down. Fold it in, or leave it?

**Q2 — the post-link prompt.** `add_student_prompt` (the *"want to add a child?"* question right after linking)
advertises `ข้าม`, not `ยกเลิก`. Both work — the exit check covers that step — but it is the one question in the
flow that names a different way out. Left as shipped rather than adding a second exit sentence beside the first.
Say the word if you want them unified.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-03: ✅ **PASS. TASK-245 is DONE.** The two structural choices are what make it a fix rather than four patches.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1254 pass / 0 fail** · `line-commands.ts` with
`RESERVED_WORDS` / `isReservedWord` / `isCancelWord` · `withExit` at `line-webhook.service.ts:379` ·
`strikeOrPrompt` now at **11** sites, up from 4.

### 🔴 `line-commands.ts` is the file that makes the fix true rather than merely implemented

> *"A second copy is exactly how «the bot said `เมนู` is a command» and «the bot stored `เมนู` as a name» both
> became true at once."*

**That is the defect stated as a property**, and one list is the only thing that closes it. Repointing all **10**
inline command arrays at it — rather than adding an eleventh list called "reserved" — is the difference between
fixing this instance and making the class impossible. **A command added tomorrow is reserved the same day.**
📌 And converting the three tests that pinned literal arrays into tests that assert the property **through** the
constants is a strictly stronger assertion than the text it replaced.

### 🔴 Checking `isCancelWord` ONCE, at the top, before any step reads the text

I asked for *"`ยกเลิก` works at every step"*. **He made it work at every step that will ever exist** — a step
added next year cannot forget to honour it, because it never gets the chance to look. Same shape as
`withExit()` being asserted as **a net over the six question keys** instead of four hand-picked cases: both turn
*"we remembered everywhere"* into *"forgetting is not reachable"*.

📌 **And the cancel is ONE act:** `clearSession` deletes the row the draft is a column on, so *"cancelled"* and
*"the half-typed record is gone"* cannot disagree. That was the property TASK-233 needed and this is where it
became reachable from every step rather than only the last.

🔻 **Removing the trailing `หรือ ยกเลิก` from `add_summary_confirm`** is the kind of small correctness nobody
would have filed a defect for: with the hint appended it would print twice on the one step that already had it.
Same words, one source.

### The judgement I want on the record: a duplicate name is NOT a strike

> *"The parent answered correctly and is being asked a further question; counting it would hand a two-child
> family to a human for having two children."*

**Exactly right, and it is the distinction the whole rule turns on.** A strike is for *"I did not understand
you"*, not *"I understood you and need more"*. Wiring every rejection blindly — which is close to what my
invariant asked for — would have made the safety net fire on the most ordinary thing in the flow. **He read the
intent past the wording.**

### ✅ The half-met DoD line, correctly named

Every link in the chain is asserted DB-free — rejection → `strikeOrPrompt` → `shouldHandOver(2)` → mute +
apology — but **running the owner’s three messages end-to-end needs session rows**, and that is @Tanya’s.
**Marked half rather than ticked.** That is the distinction this project keeps needing: *the mechanism is proven,
the scenario is not.*

**Status → DONE (code).** The rendered re-run of the owner’s exact sequence goes to @Tanya with the batch.
