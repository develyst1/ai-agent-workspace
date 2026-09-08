# SPEC-077 — the CONVERSATION is bilingual; the NOTIFICATIONS are not

**Requirement:** `REQ-079` §18 (customer via the owner, 2026-09-07) · **From:** @Sober · **Repo:** `smart-scheduler-back`
**Supersedes:** the 2026-09-06 single-language ruling, **for the conversation only.**

---

## §1 The two families, and the line between them is the SURFACE, not the wording

| family | language | who composes it |
|---|---|---|
| **the conversation** — registration, prompts, errors, the command list | 🔴 **BILINGUAL**, Thai and English in one message | `line-webhook.service.ts` · `teacher-link.service.ts` |
| **the notifications** — the six outbox messages | **English labels** | `formatOutboxMessage` |

📌 **That line is already the one @Jason drew on TASK-272:** *"which modules COMPOSE text a human reads? There
are exactly two."* ⇒ **the split §18 asks for is a split this backend already has**, and no new boundary is
invented to serve it.

## §2 🔴 BILINGUAL DOES NOT FIT EVERYWHERE, and this is a platform limit, not a preference

**LINE caps a quick-reply / postback `label` at 20 characters.** Our button labels go through the same `t(key,
lang)` as message bodies (`line-webhook.service.ts:684`, `:910`, `:914`, `:921`). ⇒ **`ตารางวันนี้ / Today` does
not fit, and neither do most pairs.**

⇒ **The rule is decided by whether the surface has room:**
| surface | bilingual? | why |
|---|---|---|
| message **bodies** | ✅ yes | 5000-char reply limit; a doubled prompt is nowhere near it |
| **button / quick-reply labels** | 🚫 **cannot** | 20 characters |
| **rich-menu cells** | 🚫 **cannot** | the words are baked into artwork |

## §3 ⇒ The answer to *"does the `ภาษา` switch still switch anything?"* — **yes, and only where bilingual does not fit**

**After this lands, `line_lang` governs exactly two things: the BUTTON LABELS and the RICH-MENU IMAGE.**
Everything else is either bilingual (the bodies) or English (the notifications).
🔑 **The switch survives precisely where the character budget refuses the alternative.** **It is not a control
that lies** — but **its MEANING has narrowed from "the language the bot speaks to me" to "the language of my
buttons"**, and a user cannot know that from the cell.
⇒ 🔴 **That is the question for the customer, and it is now concrete rather than philosophical:**
**(ก)** keep the cell, meaning buttons + menu · **(ข)** make the buttons Thai-only and **retire the cell**,
freeing a rich-menu slot and deleting `line_lang`, the `parent-th`/`parent-en` pair and three menu images.
🚫 **Nothing is ripped out tonight.** ⚠️ **Nor is the cell left standing with an unstated new meaning for long** —
that is the failure mode we have been paying for all week: a thing that still exists and no longer means what
its name says.

## §4 The mechanism — one helper, and `lang` LEAVES the bodies

`tb(key)` → `TH + "\n" + EN`. **Bodies call `tb(key)`; labels keep `t(key, lang)`.**
🔑 **The signature is the control.** A body function that no longer takes `lang` **cannot silently render one
language**, and a label function that still takes it **cannot silently become 40 characters.**
📌 **This is TASK-272's lesson applied before the defect instead of after it:** *the control is a total map AND a
typed input* — here it is the parameter's **absence** that carries the rule.

✅ **All 110 conversational keys already have both languages** (157 keys, 47 of them `ob_*`). **No string is
missing; this is a rendering change, not a translation project.**
⚠️ **The customer's own English replaces ours wherever `REQ-079` §17's 8-screen copy gives it** — *"Please type
'register' to start."* **Their words for their customers.** Where their copy is silent, **our existing EN ships**,
and that is stated rather than hidden.

## §5 🔴 The notifications are NOT one line, and I am NOT shipping them tonight

@Porter's ruling — *"generated values inside a notification follow the labels: English"* — is right in intent and
**cannot be implemented by passing `"EN"`.** Three things it meets:

1. 🔴 **The customer's OWN template writes `ไม่มี`.** `REQ-077`'s draft: `**Advance Leave Notice : {วันลาที่แจ้งไว้
   / ไม่มี}`. ⇒ forcing English turns their own specified word into `None`. **Their copy contradicts the rule on
   the one generated value the message actually contains.**
2. 🔴 **`Remaining : 4/6 ครั้ง` is hard-coded Thai OUTSIDE `t()`** (`lib/course-deduction.ts:28`). ⇒ **flipping
   the language parameter does not reach it.** **The rule would be believed implemented while one value stayed
   Thai** — a note, not a mechanism, for the fourth time this week.
3. 🔴 **`booking_confirmed` is owner-verified and BYTE-FROZEN**, and it is a notification. Forcing English
   rewrites it. ⇒ **either it is carved out, or it stops being frozen. Somebody must say which.**

⇒ **Held for @Porter. One line of code, three unanswered questions, six live messages, and the owner reviewed one
of them yesterday.** 🚫 **Not shipped blind tonight.**

## §6 What must not change
- 🚫 `formatOutboxMessage` and the six notifications — **untouched tonight** (§5).
- 🚫 The postback `data` keys — **language-neutral by design** and the reason a label can change freely.
- 🚫 The rich-menu artwork and the `parent-th`/`parent-en` pair — §3 is a question, not a change.
- 🚫 `line_lang`'s column, the `ภาษา` cell, the seed from the LINE profile locale.
- 🚫 The ICS feed's `lineLang` (`routes/calendar.ts:36`) — ⚠️ **it is a notification surface and §18 arguably
  makes it English**, but it shipped **today** under TASK-272 and its rule is §5's, not §4's. **Held with §5.**

## §7 Build order
1. **TASK-275** — `tb()`, the bodies, the customer's English where §17 gives it. **Nothing else moves.**
2. **Held**: the notifications (§5) and the ICS description, on @Porter's three answers.
3. **Held**: the `ภาษา` cell (§3), on the customer's ก/ข.
