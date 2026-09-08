# TASK-251 — REQ-079 §16: the role step stops accepting bare numbers, and becomes buttons

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-05)
**Status:** DONE — code (Sober 09-06, reviewed) — tsc 0 / bun test 1485 pass 0 fail / no migration / nothing sent.
**Customer's request, via @Porter:** the role step's `1 / 2 / 3` **collides with numbered replies their own OA
already owns.** The bot is live on the customer's account, so this is a real collision, not a hypothetical.
**Second priority — TASK-250 first.**

---

## §1 I did the sweep Porter asked for. The answer is narrower than he feared.

> *"And a sweep: anywhere else the bot asks for a number. The role step is where they hit it, not the only one."*

**Measured across `line-i18n.ts` and the webhook service — it IS the only one:**

| | | |
|---|---|---|
| `role_prompt` | *"1 = ลูกค้า/ผู้ปกครอง · 2 = ครู · 3 = แอดมิน"* | 🔴 **the only prompt that asks for a bare number** |
| `parseRoleChoice` | accepts `"1"`, `"2"`, `"3"` | 🔴 **the only parser that accepts one** |
| `เช็คอิน <n>` · `ลา <n>` (`:933`, `:943`) | take a number **after a keyword** | ✅ **cannot collide** — a bare `2` never reaches them |
| every other step | pickers or free text | ✅ |

📌 **The distinction that makes the fix small: the risk is a BARE number.** One prompt invites one, one parser
accepts one. **Close those two and the collision is gone from the product** — no sweep of the codebase required,
which is worth knowing before anyone plans a bigger change.

## §2 Answering Porter's actual question: **yes, quick replies are already wired** — and the pattern is this repo's own

`line-reply.ts` has `textReply` (every reply already carries a back-to-menu item), `bookingPicker` and
`childPicker`. Its own comment on `bookingPicker`:

> *"one button per booking carrying its id in the postback, **so a tap replaces 'type 1/2'**."*

🔴 **The repo already solved this exact problem twice — for bookings and for children. The role step is the one
that never got a picker.** ⇒ **Add `rolePicker`**, same shape as its two siblings: three buttons, each firing a
**postback** (`action=role:customer` / `role:teacher` / `role:admin`).

✅ **Why a postback and not a text quick-reply:** a postback is **our** payload on **our** namespace. It cannot be
confused with anything the customer's OA parses, no matter what they number. **The collision stops being
discouraged and becomes impossible.** That is the difference between fixing the copy and fixing the cause.

## §3 What changes

1. **`rolePicker`** in `line-reply.ts`, beside `bookingPicker` / `childPicker`.
2. **`role_prompt` copy** — no digits. TH: the question plus three labels (`ผู้ปกครอง` · `ครู` · `แอดมิน`); EN
   likewise. **The buttons carry the choices, so the text stops listing them as a menu of numbers.**
3. **A postback route for `role:*`** that does exactly what `CHOOSE_ROLE` + a valid answer does today —
   `resetStrikes` → `setStep("AWAIT_CODE", role)` → the `code_<role>` prompt. 🚫 **Reuse that path; do not write a
   second one.**
4. **`parseRoleChoice` stops accepting `"1"`, `"2"`, `"3"`.** The customer asked for this explicitly.
   ✅ **Keep the words** — and **add `พ่อ` and `แม่`** to the customer set, which Porter's write-up asks for.
   ⚠️ A typed word must keep working: **someone on PC LINE can still be in this flow**, and the quick reply is a
   tap they may not be able to make. **The picker is the front door; typed words are the one that must not close.**

## §4 The consequence I want stated, not discovered
A bare `2` at the role step **now fails to parse** ⇒ it takes the **AC-18 strike path** and, on a second miss,
hands over to a human. ✅ **That is the correct behaviour** and it is already built. ⚠️ But it means a parent who
learned `1/2/3` from an earlier session now gets a strike for the habit we taught them.
⇒ **My call: that is acceptable and needs no special case.** The strike path ends at a person, the picker is right
there, and a special case for a retired input is a rule nobody will remember to delete. **Do not add one.**

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, state the count
- [ ] `rolePicker` exists, three postback buttons, back-to-menu item preserved
- [ ] `role_prompt` contains **no digits** — asserted in a test, TH **and** EN
- [ ] `parseRoleChoice("1" | "2" | "3")` → **null**; `ผู้ปกครอง` · `พ่อ` · `แม่` · `ครู` · `แอดมิน` (+ the EN
      words already there) still resolve — all asserted
- [ ] The `role:*` postback reaches **the same** step transition as a typed word — asserted, one path not two
- [ ] 🚫 No migration · no SQL · nothing sent to LINE

## Questions
1. **Does any existing test or fixture rely on `parseRoleChoice("1")`?** Update them, and **say how many** — a
   number I can check.
2. **Do quick replies render on LINE for PC?** `SYSTEM-FACTS.md` records that **rich menus do not and buttons
   cannot be tapped there** — if quick replies share that fate, §3's typed-word fallback is not a nicety, it is
   the only path for a PC user, and I want that written down rather than assumed.

---

# ✅ Jason (BE) — DONE, code. 2026-09-06

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1485 pass / 0 fail, 118 files**
🚫 No migration · no SQL · **nothing sent to LINE** — every assertion is against a builder's return value or
source text. New tests: `src/services/line-role-buttons.test.ts` (16 tests, 79 expects).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1485 / 0**, 118 files
- [x] `rolePicker` exists, three postback buttons, back-to-menu item preserved (**and asserted LAST**)
- [x] `role_prompt` contains **no digits** — asserted per language, TH **and** EN, against **ASCII and Thai
      digits** (`๐-๙`): a TH prompt reading *"๑ = ..."* would have passed an ASCII-only guard
- [x] `parseRoleChoice("1" | "2" | "3")` → **null** (plus `" 1 "` and `๑`); `ลูกค้า` · `ผู้ปกครอง` · `นักเรียน` ·
      `พ่อ` · `แม่` · `customer` · `parent` · `ครู` · `teacher` · `แอดมิน` · `admin` all still resolve —
      each asserted, plus case and stray spacing
- [x] The `role` postback reaches **the same** step transition as a typed word — `acceptRole(` appears **exactly
      3 times** (declaration + typed word + tap) and `setStep(lineUserId, "AWAIT_CODE", role)` **exactly once**
- [x] 🚫 No migration · no SQL · nothing sent to LINE

## ⚠️ One deviation from §3.3, deliberate — the postback is `action=role&role=customer`, not `action=role:customer`
§2 spells the payload `role:customer`. I built `action=role&role=<role>` instead, because **every dispatch in
this service is `action === "<stable key>"` plus params** — `parsePostback`'s own comment says it returns *"a
stable action key plus params"*, and `bookingPicker` ships `action=checkin&bookingId=…`. A `role:customer`
action would be the only key in the product needing prefix matching, i.e. a second dispatch style for one
button row. **The routing you asked for is unchanged; only the spelling is.** Say the word and I will flip it.

## ➕ Two things I did beyond the four changes, both because the fix was otherwise half-built

**1. The first-strike re-ask now re-sends the PICKER, not just text.** `strikeOrPrompt` took a `string` and
replied with text. That is right for the five other branches, so it is now an **optional sixth argument**
(`promptMessage?: LineMessage`) — nothing else changed. 🔴 **Why it is not a polish item:** SYSTEM-FACTS
(corrected 09-02) says a quick reply **disappears the moment the user types**, and PC has **no rich menu to
bring it back**. Without this, the buttons are offered exactly once — to everyone **except the person who just
proved they needed them**. The handover reply stays text.

**2. A test that ties the LABEL to the PARSER.** `parseRoleChoice(t("role_btn_teacher", lang))` must equal
`"teacher"`, both languages. ⚠️ The drift it closes: someone renames a button to a friendlier word, the chip
keeps working (it is a postback), and **only the PC user who copies the label by hand** finds out it is not
understood — the one user who cannot tap, hitting the one failure the tap hides.

## Answers

### Q1 — **ONE fixture relied on `parseRoleChoice("1")`. Two tests changed in total.**
| file | what it asserted | now |
|---|---|---|
| `src/lib/line-webhook.test.ts:13` | `parseRoleChoice("1")` → `"customer"` | **corrected**, not deleted: `→ null`, plus `ผู้ปกครอง → customer` so the line still proves the parser works |
| `src/services/line-silence.test.ts:175` | the exact call shape `t("role_prompt", lang), lang)` | **corrected** to `…, lang, askRole(lang))` — it failed on the sixth argument, **not** on the number |
📌 Grepped `parseRoleChoice` across the repo: 4 hits outside its own definition — the two above, the import, and
`line-menus-flows.test.ts:264` which asserts `parseRoleChoice(text)` is *called*, not what it returns. **Nothing
else in the product accepts a bare number**, which is the §1 sweep holding after the change.

### Q2 — **The premise in the question is out of date, and `SYSTEM-FACTS.md` already says so — in the same file.**
> **Quick replies DO render on LINE PC, and they ARE tappable.**

`SYSTEM-FACTS.md:288` — *"✏️ CORRECTED 2026-09-02 — LINE PC and buttons. The earlier entry said buttons 'cannot
be tapped at all'. **They can.**"* What is true: **chips vanish the moment the user types**, and PC has no rich
menu to bring them back.

⇒ **Your conclusion survives its wrong premise, and I built to it:** a PC user still ends up typing, so the typed
words are **not a nicety**. But the reason matters, because it changes the fix: the danger is not *"PC cannot
tap"* — it is *"PC gets one shot"*. That is exactly why the strike re-ask now carries the picker (➕1). Had I
taken the old fact at face value, I would have concluded the picker is phone-only decoration and left the re-ask
as text — **the wrong build from a right-sounding rule.**

🔴 **A file-hygiene flag for you, not a change I will make:** `SYSTEM-FACTS.md` **still contains the superseded
line at `:143`** (*"no rich menu, and buttons cannot be tapped at all — text only"*) alongside its own correction
at `:288`. Both read as current facts. The correction's own note says it best: *"a wrong reason is what makes
someone eventually drop a right rule."* **Whoever owns that file should retire `:143` or point it at `:288`** —
I did not edit it, it is not mine.


## Review — Sober, 2026-09-06: ✅ **PASS. TASK-251 is DONE (code).** 🔴 **And I quoted a fact that the same file had already corrected.**

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1485 pass / 0 fail** (118 files) · no migration, nothing
sent to LINE.

### 🔴 My Q2 was wrong, from a file I had read
I wrote *"`SYSTEM-FACTS.md` records that rich menus do not render on PC and buttons cannot be tapped there."*
**`SYSTEM-FACTS.md:288` is a dated correction of exactly that sentence** — *"The earlier entry said buttons
'cannot be tapped at all'. **They can.**"*
⇒ **I quoted the superseded half of an entry that carries its own correction three lines below it.** That is
RULE ZERO — newest wins — failed inside a single file, by the person who keeps invoking it.
📌 **The conclusion survives and the premise did not:** chips **are** tappable on PC but **vanish the moment the
user types**, and there is no rich menu there to bring them back. **So "typed words must keep working" is still
right — for a different reason than the one I gave**, and the difference is exactly what your change #1 is about.

### 🔴 The change I did not ask for, which is the one that mattered
> *"Without this, the buttons are offered exactly once — to everyone **except the person who just proved they
> needed them.**"*

`strikeOrPrompt` replied with text, so the **first-strike re-ask** — the moment a confused user is asked again —
was the one moment the picker was absent. **Given chips disappear on typing, a user who typed something wrong had
no way back to the buttons.** ⇒ optional sixth argument, five other branches untouched, handover still text.
**That is the fix being finished rather than merely built**, and it is only visible if you know the vanish rule.

### ✅ The deviation, accepted — and your reason is better than my spelling
`action=role&role=customer`, not `action=role:customer`. **Every dispatch in the service is `action === "<stable
key>"` plus params**, and `parsePostback`'s own comment says so. **A `role:customer` action would be the only key
in the product needing prefix matching** — a second dispatch style for one button row. ⇒ **keep yours.** My §3
spelled a payload; you kept a convention.

### ✅ Two assertions I would not have written
- **Digits checked in Thai numerals too** (`๐-๙`). *"A TH prompt reading `๑ = …` would have passed an ASCII-only
  guard."* 🔴 **The requirement is "no numbers", and I wrote a test that only knew Western ones** — in a Thai
  product, for a Thai customer's complaint about numbers colliding.
- **The label tied to the parser** (`parseRoleChoice(t("role_btn_teacher", lang))` → `"teacher"`). ⚠️ The drift it
  closes is precise: rename a button to a friendlier word, **the chip keeps working because it is a postback**,
  and **only the PC user who copies the label by hand** discovers it is not understood — **the one user who
  cannot tap, hitting the one failure the tap hides.**

### ✅ Q1 answered with the grep, not the guess
One fixture relied on `parseRoleChoice("1")`; two tests changed, **both corrected rather than deleted** — the
first still proves the parser works (`ผู้ปกครอง → customer`), the second failed on the **sixth argument**, not on
the number. And four hits swept across the repo. ⇒ **§1's sweep still holds after the change: nothing else in the
product accepts a bare number.**

**Status → DONE (code).** ⇒ `uat` batch: **#5 done.** Remaining: **#4 REQ-084's defect half** and **#6 TASK-252.**
