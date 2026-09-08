**Status:** DONE — code (Sober 09-07, reviewed) — tsc 0 / 1659 pass 0 fail / notifications + ICS byte-identical / nothing applied. Follow-up: TASK-280 (the confirm step echoes ISO, not the order the parent typed) — RULED, not sent up.

# TASK-278 — apply the customer's English, now that it is in the repo (`REQ-079` §17b)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-07)
**Source:** `REQ-079` **§17b** — @Porter transcribed the eight screens verbatim after the DATA REQUEST.
⛔ **AFTER TASK-277** — that one rewrites `add_birthdate_prompt`, which this one also touches.
📌 No clock. 🚫 No migration, no database, no FE change, **no notification and no ICS change.**

---

## §1 What this is, and what it is not
**The English side of the registration keys becomes THEIRS.** 🚫 **Nothing about the Thai side, the flow, the
buttons or the mechanism changes.** ✅ **`both()` and the 20-character label cap stay exactly as you built them.**
📌 **This is not a correction of TASK-275.** That pass was right against the only source that existed; **the
source was the problem, not the work.**

## §2 The mapping — their screen → our key
| §17b screen | their English | our key |
|---|---|---|
| 1 Start | *"Please type "register" to start."* | `welcome` — ✅ **already applied**, only the citation comment changes |
| 2 Role | *"Please type "Next" to continue."* | 🚫 **NOTHING APPLIES** — see §3 |
| 3 Phone | *"Please enter your phone number to continue."* | `code_customer` |
| 4 Added | *"Registration completed ✅"* | `verify_parent_ok_existing` — ⚠️ **keep `{phone}` and `{list}`** |
| 4 Name | *"Please enter the student's name, e.g. "Emily"."* | `add_student_prompt` · `add_student_name_prompt` |
| 4 Cap | *"You can add up to 5 students per phone number."* | same keys — ⚠️ **keep `{max}`, not a literal 5** |
| 5 DOB | *"Please enter the date of birth."* | `add_birthdate_prompt` — ⚠️ **plus the format** (§4) |
| 6 Province | *"Please enter your current province."* | `add_province_prompt` |
| 7 Check | *"Please check your information before saving."* | `add_summary_head` |
| 7 Correct? | *"Is this information correct?"* + *"Please Type "Confirm" to save."* | `add_summary_confirm` |
| 7 Exit | *"Type "Cancel" to exit."* | 🚫 **DO NOT APPLY** — see §4 |
| 8 Added | *""Nong DC" has been added successfully. ✅"* | the add-done key — ⚠️ **keep the name variable** |

## §3 🔴 Screen 2 contributes NOTHING, and that is worth stating rather than quietly skipping
@Porter's departure 1 says *"their Thai/English framing of the step stays; the typed `Next` does not."*
⚠️ **But their ONLY string for screen 2 IS the typed-`Next` instruction.** We ship **quick-reply buttons**
(TASK-251) — the fix for their own `1/2/3` complaint. ⇒ **applying their sentence would instruct a word the bot
does not accept.**
✅ **`role_prompt` keeps ours** — *"Who are you? Tap a button below, or type: parent · teacher · admin"*.
📌 **Say this in your report.** *"Screen 2 has no applicable string"* is a fact @Porter can take back to them;
silently skipping it is how a difference becomes a surprise.

## §4 The five places their text must NOT be applied literally — each is a rule we already own
1. 🚫 **The exit line.** *"Type "Cancel" to exit."* — `withExit` **already appends the exit to every question**
   (TASK-245). Putting it inside `add_summary_confirm` **prints it twice**, on the one step that used to have it
   inline. **That is the exact bug TASK-245's comment records.**
2. ⚠️ **`{list}` and `{phone}`.** Their *"Registration completed ✅"* has no children line. **Ours does, and it is
   a privacy decision** (TASK-047: a COUNT, never names, because anyone can type a phone number).
   ⇒ **their sentence, our variables. Do not drop `{list}`.**
3. ⚠️ **`{max}`, not `5`.** Their copy hardcodes five. **Keep the variable.**
4. ⚠️ **The date format.** Their *"Please enter the date of birth."* omits it. **TASK-277's format must survive**
   — their sentence **plus** `(DD-MM-YYYY, e.g. 02-12-2024)`, **and `skip`.**
5. 🔴 **Their slash-pairs are DOCUMENT formatting, not message format.** `ชื่อ / Name: น้องส้ม` ·
   `1. เริ่มลงทะเบียน / Start Registration`. @Porter already ruled the headings are section titles. **The field
   labels are the same shape** ⇒ **our summary stays BLOCK-per-language via `both()`**, Thai labels in the Thai
   block, English in the English one. 🚫 **Do not introduce inline `Thai / English` labels.**
   📌 **A message with two bilingual conventions is TASK-257 §3 exactly** — `จำนวนคาบที่ยืนยัน` and `หมายเหตุ`
   under eight English labels. **One message, one convention.**

## §5 What must not change
- 🚫 Any Thai string. 🚫 The flow, the buttons, the postback keys, the label cap.
- 🚫 `both()` / `tb()` / `withExit` / the strike behaviour.
- 🚫 The six notifications and the ICS feed (`SPEC-077` §5, still held).
- 🚫 No migration, no database, no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] Each mapped key's EN is **§17b's sentence verbatim** — asserted **against the strings, per key**
- [ ] 🔑 **The five §4 rules hold, each asserted:** the exit prints **once** · `{list}` and `{phone}` survive ·
      `{max}` is a variable · the DOB format and `skip` survive · **no inline `Thai / English` label exists**
- [ ] **Every Thai string is byte-identical** — asserted, because this pass has no business touching them
- [ ] `role_prompt` is **unchanged**, and your report says *"screen 2 has no applicable string"*
- [ ] 🚫 Notifications and ICS byte-identical · no migration, no database, no FE change

## Question
**Does their copy imply any step we do not have, or any we have that they do not?** You have the eight screens
and the flow in front of you at the same time — **nobody else will have that view again.** **Name the
differences; build none of them.** 📌 *Their `CEO` was a whole subsystem in a copy document; the lesson is that
their text is read for decisions, not transcribed into behaviour.*

---

## §6 ➕ ADDED 2026-09-07 — the phone number is shown **formatted**, because their screen 4 shows it that way

**@Jason found this while answering TASK-277:** `REQ-079` §3c — *"cosmetic, cheap, do them: phone shown formatted
(`082-503-1502`)"* — **three items, two built, this one never was.** `{phone}` is `normalizePhone(code)` ⇒ a
parent reads **`0825031502`** in the message that confirms their account.

🔻 **I first said this was a third task. It is not — it belongs here**, and the reason is §17b itself:
```
เบอร์โทรศัพท์ / Phone: 082-503-1502
```
⇒ **their screen 4 shows the formatted number.** **Rendering their copy faithfully IS the formatting**, so
splitting them would make two diffs of one screen.

**The change:** one formatter, `0825031502` → `082-503-1502`, applied where `{phone}` is interpolated into
`verify_parent_ok_existing` / `verify_parent_ok_new`.
⚠️ **DISPLAY ONLY.** 🚫 **`normalizePhone` and every stored, compared or looked-up value are untouched** — a
formatted number reaching a lookup is how a family stops matching their own record. **Assert that the formatter
has no caller outside the message layer.**
⚠️ **A number that is not ten digits, or not `0`-leading, must pass through UNCHANGED rather than be mangled into
groups.** **We accept what people type; the display must not invent a shape for something it does not recognise.**

## §7 The one DoD line this changes
The *"every Thai string byte-identical"* assertion still holds — **the strings do not change; the VALUE
interpolated into them does.** ⇒ **assert the rendered message changes in exactly that one way**, and name it,
so the byte-identical claim stays true rather than quietly relaxed.

**Added to the Definition of Done:**
- [ ] `{phone}` renders as `082-503-1502` in both parent-linked messages — asserted
- [ ] 🚫 The formatter has **no caller outside the message layer** — asserted. `normalizePhone` untouched.
- [ ] An unrecognised number passes through **unchanged** — asserted

---

# ✅ Jason (BE) — DONE, code. 2026-09-07

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1659 pass / 0 fail, 130 files**
🚫 No migration · no database · no FE change · **the six notifications and the ICS feed untouched**, asserted ·
`both()`/`tb()`/`withExit`/the label cap/the strike behaviour untouched.
New: `src/lib/customer-english.test.ts` (20 tests).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1659 / 0**, 130 files
- [x] Each mapped key's EN is §17b's sentence — asserted per key, screen by screen
- [x] 🔑 **All five §4 rules asserted:** the exit prints once · `{list}`/`{phone}` survive · `{max}` is a
      variable (and asserted **not** to be a literal 5) · the DOB format and `skip` survive · **no inline
      `Thai / English` label** on any summary label
- [x] **Every Thai string byte-identical** — asserted against a copy of all eight
- [x] `role_prompt` unchanged; screen 2 named below
- [x] §6: `{phone}` renders `082-503-1502` · the formatter has **no caller outside the message layer** ·
      an unrecognised number passes through **unchanged**
- [x] 🚫 Notifications and ICS byte-identical · no migration, no database, no FE change

## §3 — **screen 2 has no applicable string**, stated for @Porter to take back
Their only screen-2 line is *"Please type "Next" to continue."* We ship quick-reply **buttons** (TASK-251) —
the fix for their own `1/2/3` collision. ⇒ **applying their sentence would instruct a word `parseRoleChoice`
rejects.** `role_prompt` keeps ours, and the test asserts it contains no `Next` in either language.

## §6 — the formatter, and the two things that keep it safe
`formatPhoneForDisplay` sits **beside `normalizePhone`** so the pair is read together, with 🚫 *"it is
deliberately NOT the inverse of `normalizePhone` and must never be used as one."*
✅ Three call sites, all inside a `t("verify_parent_ok…")` interpolation — asserted by position, not by
counting. ✅ Asserted that `parent.service`, `scheduler.service` and `routes/api` do not call it at all.
⚠️ `021234567` · `66825031502` · `12345` · `""` all pass through unchanged: **we accept what people type, so the
display must not invent a shape for a number it does not recognise.**

## Answer — **their copy vs our flow, both directions. Named, none built.**

### Steps WE have that their copy has no screen for
1. 🔴 **The `skip` escape** — offered at name, DOB and province. **Their copy never mentions skipping**, so a
   parent reading their document would not know the step is optional. Ours must keep it (a wizard step with no
   way past is the TASK-245 trap), but **they have not seen it.**
2. 🔴 **The exit on EVERY question** (`withExit`, TASK-245). **Their copy shows `Cancel` only on screen 7.**
   Ours appends it everywhere, because the owner himself got stuck on three questions that each looked like the
   only thing he was allowed to answer. **A deliberate divergence from their document, and the right one.**
3. **The add-another loop** (`added_more` — *"type the next name, or skip to finish"*). Their screen 8 reads as
   terminal. The owner ruled *"one at a time, unchanged"*, which our loop already is — **but the loop's own
   prompt is a screen they have never written copy for.**
4. **The children-on-file line** (`{list}`) — §4.2's privacy decision. Their screen 4 has no such line.
5. ⚠️ **The 2FA step.** `AWAIT_2FA` exists and is switched off (`line_parent_2fa`), so today's flow matches
   theirs. **If the owner ever switches it on, the customer has never seen that screen** — and switching it on
   is a setting, not a build (TASK-232). **Worth knowing before, not after.**
6. **Two strikes then a human.** No screen, and correctly so — but it is behaviour their copy does not describe.

### 🔴 The one that is NOT cosmetic — and it lands on the step TASK-277 just made load-bearing
**Their screen 7 echoes the date back as `02.12.2024` — day-first, the order they typed it in. Ours echoes
`2024-12-02`.**
`summaryLines` prints `draft.birthDate`, which is the **stored ISO** value. ⇒ a parent types `02-12-2024` and the
confirm step shows them **`2024-12-02`**.
⚠️ **TASK-277 made that step load-bearing for correctness** precisely because `03-04-2024` is ambiguous to a
human — *"the summary prints the date back before anything is written."* **But it prints it back in a format the
parent did not use.** Someone who typed `03-04-2024` meaning 4 March sees `2024-04-03` and has to re-derive the
order to check it. **The guard still exists; it is weaker than the ruling assumes.**
🚫 **Not built** — you said name them and build none, and this one is a decision: echo the input format, or echo
ISO and accept the re-derivation. 📌 **@Porter's, and it belongs with the DOB ruling rather than with a copy
pass.**

### Steps THEIR copy has that we do not
**None.** Screens 1 · 3 · 4 · 5 · 6 · 7 · 8 all map to steps we already have; screen 2 maps to a step we have
and solve differently. 📌 Their `02.12.2024` **dots** and the `1. …` **headings** were already ruled out in
§17b's own departures — I did not re-litigate either.

## Review — Sober, 2026-09-07: ✅ **PASS. TASK-278 is DONE (code).** 🔴 **And your last finding lands on the step TASK-277 declared load-bearing — I am ruling it, not holding it.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **1659 pass / 0 fail**, 130 files · nothing applied ·
`formatPhoneForDisplay` has **three call sites, all inside a `t("verify_parent_ok…")` interpolation**
(`line-webhook.service.ts:487 · 495 · 500`) and **none anywhere else** · `summaryLines` prints `draft.birthDate`
raw, exactly as you say.

### 🔑 The formatter's guardrails are better than the ones I wrote
✅ **Placed beside `normalizePhone` with *"it is deliberately NOT the inverse and must never be used as one"***
— **that sentence is the control**, because the obvious future mistake is someone reaching for it to undo the
normaliser. ✅ **Asserted by POSITION rather than by counting call sites**, which survives someone adding a
fourth. ✅ And `021234567 · 66825031502 · 12345 · ""` all pass through untouched — *"we accept what people type,
so the display must not invent a shape for a number it does not recognise."*

### 🔴 The confirm step echoes a format the parent did not type — **and I am RULING it, not sending it up**
> *"Their screen 7 echoes `02.12.2024` — the order they typed. Ours echoes `2024-12-02`… the guard still exists;
> it is weaker than the ruling assumes."*

**This is the best finding of the four tasks tonight**, because it is the one place where two of our own
decisions quietly disagree. **TASK-277 made that step load-bearing *precisely because* `03-04-2024` is ambiguous
to a human** — and then it prints the date back **in the other order**, so the reader has to perform the
conversion the step exists to spare them. ⇒ **a confirm step that echoes in a different format is not a weaker
guard; on this field it is close to no guard at all.**

**Ruled: the confirm step echoes the date DAY-FIRST, in the format the parent typed.** 🚫 **Not a decision for
@Porter** — it applies two decisions we already have: **the owner's day-first input order** (§17) and **the
customer's own screen 7, which shows `02.12.2024`.** Both point the same way; nothing new is being chosen.
⚠️ **Display only, same rules as your phone formatter** — the stored value stays ISO and nothing that reads
`birthDate` moves. ⇒ **TASK-280.**
📌 **@Porter is told as a statement, not a question**, the same shape as the `ไม่มี` change: he should hear it
before the owner sees it.

### The rest of your answer — six things the customer has never seen
✅ **`skip`, the exit on every question, the add-another loop, the children-on-file line, the strike-then-human
behaviour** — all correct as built and all absent from their document. **Going to @Porter as a list**, because
*"the customer has not seen it"* is a different risk from *"we did it wrong", and only one of them is ours to
fix.*
🔴 **And #5 is the one I would not have thought to ask:** **2FA is a SETTING, not a build** — so *"switch it
on"* is a sentence the owner could say at any moment, and **the customer has never seen that screen.**
**Worth knowing before, not after.** That goes up tonight.
✅ **"Steps their copy has that we do not: none."** **A clean negative, arrived at with both documents open —
nobody will have that view again**, which is why I asked for it in the same breath as the differences.
