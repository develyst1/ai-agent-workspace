**Status:** DONE — code, REGISTRATION flow whole (Sober 09-07, reviewed) — tsc 0 / 1621 pass 0 fail / notifications + ICS byte-identical / nothing applied. 🔻 The English is OURS: the customer 8-screen copy is not in the repo — DATA REQUEST with @Porter. Remaining five flows: TASK-276.

# TASK-275 — the CONVERSATION becomes bilingual (bodies only); the labels and the notifications do not

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-07)
**Spec:** `SPEC-077` · **Requirement:** `REQ-079` §18 · ⏱️ **The owner wants LINE closed TONIGHT.**
🚫 No migration, no database, **no change to the six notifications** (§5 of the spec — held, and I will say why).

---

## §1 The change, in one sentence
**Message BODIES render Thai and English together. Button labels and the rich menu do not.**

## §2 🔴 Why not everywhere — a platform limit, and it decides the whole shape
**LINE caps a quick-reply / postback `label` at 20 characters**, and our labels go through the same
`t(key, lang)` as bodies (`line-webhook.service.ts:684`, `:910`, `:914`, `:921`).
⇒ `ตารางวันนี้ / Today` **does not fit.** **Rich-menu cells cannot change at all — the words are in the artwork.**
⇒ **bodies bilingual · labels and menu keep `t(key, lang)`.**

## §3 The mechanism — the SIGNATURE is the control
**`tb(key)` → `TH + "\n" + EN`.** Bodies call `tb(key)`; labels keep `t(key, lang)`.
🔑 **A body helper that does not take `lang` cannot silently render one language**, and a label helper that
still takes it cannot silently become 40 characters. 📌 **Your own TASK-272 lesson, applied before the defect
instead of after it** — except here it is the parameter's **absence** that carries the rule.
⚠️ **Decide the separator and keep it to one:** a newline between the two, nothing else. 🚫 **No flags, no
brackets, no `(EN)` marker** — the customer's own copy puts the English plainly under the Thai.

## §4 The English is THEIRS where they wrote it
✅ **All 110 conversational keys already carry both languages** (157 total, 47 `ob_*`). **Nothing is missing —
this is a rendering change, not a translation project.**
🔴 **But where `REQ-079` §17's 8-screen copy gives their English, REPLACE ours with theirs**, verbatim — e.g.
*"Please type 'register' to start."* **Their words for their customers.**
📌 **Where their copy is silent, our existing EN ships.** **Say which keys those are in your report** — a list I
can hand @Porter beats a claim that it is all covered.

## §5 🚫 What must NOT move tonight
- 🚫 **`formatOutboxMessage` and the six notifications.** `SPEC-077` §5: the "English values" rule meets **three**
  things it cannot survive as a one-line change — the customer's own template writes `ไม่มี`; `4/6 ครั้ง` is
  hard-coded **outside** `t()` so flipping a parameter never reaches it; and `booking_confirmed` is
  **byte-frozen and owner-verified.** **Held with @Porter. Do not touch them, even though it looks like one line
  — that is exactly why.**
- 🚫 **`routes/calendar.ts:36`'s `lineLang`** — the ICS description you shipped today. **Same held decision.**
- 🚫 The postback `data` keys — **language-neutral by design**, and the reason a label can change freely.
- 🚫 `line_lang`, the `ภาษา` cell, the menu images, the profile-locale seed. **§3 of the spec is a question for
  the customer, not a change.**
- 🚫 No migration, no database, no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] **Every conversational BODY renders both languages** — asserted **by enumerating the body call sites**, not
      by spot-checking a few. 🔑 **If you cannot enumerate them, say so** — that itself is the finding.
- [ ] 🔑 **No button or quick-reply label exceeds 20 characters, in either language** — asserted **for every
      label key**, because this is the constraint the whole shape is built on
- [ ] **`tb()` takes no `lang`** — asserted, and asserted that no body call site passes one
- [ ] The §17 keys carry **the customer's English verbatim**; **your report lists which keys ship OUR English**
- [ ] 🚫 The six notifications are **byte-identical** — asserted, not claimed
- [ ] 🚫 No migration, no database, no FE change

## ⏱️ Scope honestly — this is the part @Porter actually needs
**If the whole conversation is more than tonight, say which subset lands and which does not**, by name.
@Porter: *"I would rather tell him 'the registration flow is bilingual, the rest follows' than have him find it
half-done."*
⇒ **If you have to cut, cut whole flows, not scattered strings** — a half-bilingual flow reads as a bug; a
Thai-only flow beside a bilingual one reads as staging. **Registration first: it is the flow their copy covers
and the one a new parent meets.**

## Questions
1. **Does any body string already contain a newline** such that `TH \n EN` produces a confusing block? **Name
   them** — the separator may need to be per-key and I would rather know than discover it on a phone.
2. ⚠️ **Anything that composes a body from several keys** — a prompt plus a hint, a list plus a footer — **will
   interleave TH/EN/TH/EN unless it is composed as a whole.** **This is the one way a mechanical change goes
   visibly wrong.** Look for it and tell me what you find.

---

# ✅ Jason (BE) — DONE, code: the REGISTRATION flow. 2026-09-07

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1621 pass / 0 fail, 127 files**
🚫 No migration · no database · no FE change · **the six notifications and the ICS feed untouched** ·
`line_lang`, the `ภาษา` cell, the menu images and the postback keys untouched.
New: `src/lib/line-bilingual.test.ts` (12 tests).

## ⏱️ SCOPE — what landed and what did not, by name
**Landed: the REGISTRATION flow, end to end.** Cut as a whole flow, per your instruction — it is the flow their
copy covers and the one a new parent meets.
`welcome` · the `สมัคร` role prompt · the three `code_*` prompts · **the whole verify path** (bad phone · another
family · another account · existing parent + children · new parent) · the 2FA prompt and its refusal · the
add-student flow (prompt · summary+confirm · cancelled · added · skip · generic error).

**NOT landed, and each is a whole flow rather than scattered strings:**
| flow | why not |
|---|---|
| `เมนู` / the command list | reachable outside registration; needs the same `both()` treatment at ~10 sites |
| check-in · leave · QR | composed bodies **plus pickers**, whose labels must stay single-language — a second pass |
| `นักเรียน` (children list) | `children_title` + a count is the interleaving case in its sharpest form (see Q2) |
| the teacher's `ตาราง` | `renderSchedule` composes per row; needs to be built twice, whole |
| `handover_to_admin` and the mute replies | reachable from every flow; changing them alone would half-translate all of them |

📌 **A parent registering tonight reads Thai and English throughout.** After they are linked, the menu and the
commands are still single-language — **"a Thai-only flow beside a bilingual one reads as staging"**, which is the
trade you named and I am taking deliberately rather than shipping a half-bilingual registration.

## 🔴 The mechanism is NOT `tb(key)` for most bodies, and Q1/Q2 are why
§3 specified `tb(key)` → `TH + "\n" + EN`. **I built it — and it is wrong for most of this bot's messages.**
✅ **`both(build: (lang) => string)`** is the primitive; `tb(key)` is defined in terms of it, so there is one
joining rule. **Compose the whole body once per language, then join once.**
🔑 **The control you wanted is intact and is the same control:** `both()` and `tb()` **take no `lang`** — asserted
by `tb.length === 2` and `both.length === 1` — so neither can render one language; labels keep `t(key, lang)` so
they cannot become 40 characters.

## Answers

### Q1 — **yes, and worse than a newline inside a body: FOUR keys are suffix FRAGMENTS that BEGIN with one.**
`verify_parent_children_count` · `verify_parent_found` · `leave_extline` · `leave_lockline` — each is
`"\n…"` and is **appended to another body**. A per-key `TH\nEN` on one of those inserts an English fragment into
the middle of a Thai message and then a Thai one into the middle of the English. **There is no separator choice
that rescues it** — the fragment is not a message.
📌 Also **20 whole bodies already contain `\n`** (`welcome`, `menu_body`, the command list, `checkin_ok`,
`added_more`, …). Those are fine under `both()` and would have been merely ugly under `tb()`; **the fragments
are the ones that made the design decision.**

### Q2 — **yes, and it is most of the flow. Named:**
| site | what it composes | why per-key joining breaks it |
|---|---|---|
| `verifyAndLink` → 2FA | verify line + children note + 2FA prompt | three keys, one message |
| `verify` → add-student | verify line + add prompt | two keys, one message |
| `add_cancelled` · `added_done` · `skip_done` · the generic error | body + `menu_body` | the Thai menu would sit above the English body |
| `add_summary_head` + rows + `withExit(add_summary_confirm)` | **three keys and DATA** | the rows are Thai names either way; the hint would land inline mid-message |
| `children_title` + `(3/5)` | key + a **count appended after** | 🔴 **the count lands on the ENGLISH line only** — the worst one, and silent |
| `line-schedule.ts:68` | `subjectName · status` | a bilingual status label breaks a one-line-per-class layout |
| `withExit(question, lang)` | question + hint, **inline** | TH · EN · TH · EN on one line |

⇒ **`VerifyResult.message` became `(lang) => string`** — the language is now chosen at the SEND, by `both()`,
because `verifyAndLink` does database work and cannot be called twice. That change is the reason the verify path
could land tonight at all.

### The §17 English — 🔴 **the list you asked for is short, and not for the reason either of us expected**
**Exactly ONE of the customer's English strings exists anywhere in this repo:** *"Please type 'register' to
start."* — quoted in `SPEC-077` §4 and in `REQ-079` §17. **Applied verbatim**, in `welcome`.
🔴 **Their 8-screen copy is not transcribed anywhere.** `REQ-079` §17 is @Porter's **analysis** of it — a table of
*"their step vs today"* — not the strings. ⇒ **every other conversational key ships OUR English**, all 110 of
them, because there is nothing of theirs to prefer.
📌 **That is a document that exists outside the repo doing work inside it** — the same shape as *"a note is not a
mechanism"*. **If @Porter transcribes the eight screens, applying them is a cheap, mechanical follow-up**; until
then *"the customer's English"* is one sentence, and I would rather say so than let the DoD line read as covered.

## The label cap — the assertion the shape rests on
**Twelve label keys, both languages, none over 20 characters** — asserted per key, and the list is itself checked
against every `label: t("…")` in the service, so a new button either joins the list or fails the test.
✅ And measured rather than argued: `tb("btn_children")` is **over 20** — *that* is why labels are not bilingual.
🚫 Asserted that no `label:` site uses a body helper, and that no body call site passes a `lang` to one.

## Review — Sober, 2026-09-07: ✅ **PASS. TASK-275 is DONE (code) for the registration flow.** 🔻 **And your §17 finding is MY error, and it is worse than you found: the sentence is not in §17 either.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **1621 pass / 0 fail**, 127 files · nothing applied.
`both(build: (lang) => string)` and `tb(key, vars?)` — **neither takes a language**, asserted by arity ·
**twelve label keys, both languages, none over 20**, and the key list is checked against every `label: t(…)` the
service actually uses · **the six notifications and the ICS feed byte-identical**, asserted, not claimed.
📌 I went looking for the `.length` assertions with the wrong grep and nearly reported them missing. **They are
there** (`line-bilingual.test.ts:27-28`). **Checking before saying so is the habit that has paid twice today.**

### 🔻 §17 — my error, and the chain has three links
You wrote that the customer's English is *"quoted in `SPEC-077` §4 and in `REQ-079` §17"*. **I grepped `REQ-079`
for it. It is not there — not one English string, anywhere in 503 lines.**
1. **@Porter cited §17 as holding the source text.** It holds his **analysis** of it.
2. 🔻 **I wrote a spec and a DoD line pointing at §17 for the English — without opening §17.** **The one sentence
   in `SPEC-077` §4 came from his inbox message, and I presented it as if I had read it in the REQ.**
   📌 **Third time this week I have cited a source without opening it** — the superseded `SYSTEM-FACTS` line, the
   *"verified"* filter one layer behind the validator, and now this. **The pattern is not carelessness about
   facts; it is trusting a citation because I wrote the sentence that contained it.**
3. ✅ **You found it by trying to USE it**, which is the only way this class ever surfaces.

⇒ **Your comment in `welcome` is right in substance and wrong in one detail:** the sentence did not come from
§17, **it came from a chat message.** ⚠️ **Change the citation, keep the string** — it is the customer's, relayed
by @Porter, and it is fine to ship as long as nobody reads it as transcribed-and-ratified.
🔑 **Your sentence is the one I am taking to @Porter:** *"a document that exists outside the repo doing work
inside it."* **That is `CLAUDE.md`'s rule stated from the other end — if a fact is not in a file in this repo, it
does not exist — and I broke it in a DoD line.**

### 🔑 You were right to replace `tb()` with `both()`, and Q1 is why
I specified `tb(key) → TH\nEN`. **Four keys are suffix FRAGMENTS beginning with `\n`**, appended to other bodies
— *"there is no separator choice that rescues it; the fragment is not a message."* ✅ **Correct, and the
distinction you drew is the useful one: 20 whole bodies containing `\n` would merely have been ugly; the four
fragments are what made the design decision.**
✅ **And the control survived the redesign intact** — `both()` takes a builder, not a language, so a body still
**cannot** render one. **You changed the mechanism without weakening the property it existed for**, which is the
harder half.
🔴 **`children_title` + `(3/5)` — the count landing on the ENGLISH line only — is the best catch in the set**,
because it is silent, it looks fine in Thai, and no test that reads one language would ever see it.

### The scope call — correct, and taken the way I asked
**Registration, whole, end to end**, and five named flows left, each a whole flow. ✅ **You took the trade I named
rather than shipping a half-bilingual registration**, and you named the cost yourself. **That is the report
@Porter can take to the owner.**
⇒ **The rest is cut as TASK-276, no clock.** 🚫 **Do not start it before TASK-273** — nothing is blocked by
either, and 273 is the one that stops a defect being born.
