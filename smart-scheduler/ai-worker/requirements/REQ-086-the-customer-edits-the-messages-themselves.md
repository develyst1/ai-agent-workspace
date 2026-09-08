# REQ-086 — The CUSTOMER edits the LINE messages themselves

**From:** the owner, 2026-09-08 · **Held by:** @Porter
> *"อยากให้ทำระบบแก้ไขข้อความพวกนี้ด้วย อยากให้ลูกค้าทำเองได้ … เพราะสองอย่างนี้เราทำไม่ถูกใจลูกค้าสักที
> อาจจะผิดที่ฉัน และพวกนายที่อ่อนเรื่องความจำด้วย"*

## 🔑 The reason, and it is the strongest argument in this file — **it is about US, not about a feature**
**We have never got this copy right for the customer.** **Every round costs a message from him, a task, a build,
a deploy and a test — to change a sentence.**
🔻 **And he named the cause correctly: agent memory.** **Wording rulings decay across sessions.** **Tonight
alone: `Date : อังคาร` was ruled English in `REQ-079 §18` and shipped Thai anyway; my own pause copy
outlived its ruling by a day; two Thai sentences that mean opposite things share one string; three comments
described a mechanism deleted the same night.**
⇒ 🔑 **The fix for "the agents forget the wording" is NOT better agents. It is to stop routing wording through
agents at all.** **A person who wants a different sentence types the different sentence.**
📌 **This is the highest-leverage item on the list, and it is the only one that removes a whole CLASS of our
failures rather than one instance.**

## Scope — TWO surfaces, and he already ranked their difficulty correctly
### (a) 🟢 COMMAND messages — the easier half
**What the bot says in conversation** — the entry prompt, the role replies, confirmations, errors.
📌 **Mostly free text.** ⇒ **the simplest possible editor is already useful.**
### (b) 🟠 NOTIFICATION templates — the harder half, and he said why
> *"มันต้องมีข้อความที่คัสตอมมา แล้ว value ที่จะส่งมาให้เอาไปใส่อีก"*
**`CONFIRMED SCHEDULE`, the daily schedule, the leave and reminder messages** — **a template plus VALUES the
system fills in** (`Student`, `Date`, `Coach`, `Expiry date`, `Sessions`…).
🔴 **The whole risk of this feature lives here, and it is one thing: a template can name a value that does not
exist, or omit one that matters.** ⇒ **the editor must not be able to produce a message that fails at send
time.** **It has to refuse, at edit time, in front of the person editing.**

## 🔴 What @Porter will NOT let this become
1. 🚫 **A raw text box with `{{placeholders}}` and a save button.** **A typo in a placeholder becomes a broken
   message to a real parent, discovered by the parent.**
2. 🚫 **An editor with no PREVIEW.** 🔑 **This product already commits-then-shows everywhere** (`SYSTEM-FACTS`),
   **and that pattern cost us a whole night on the resume dialog.** ⇒ **a message editor with no preview is that
   mistake made permanent and handed to the customer.**
3. 🚫 **Editable message IDENTITY.** **Which message fires when is OUR logic. Only the WORDS are theirs.**
4. 🚫 **Anything that lets an edit reach real parents without the customer seeing exactly what will be sent.**

## ❓ OPEN — mine to answer before this is buildable, not @Sober's to guess
- **WHO edits?** The customer's admins — **or only the owner?** 🔑 **The People screen already has roles; this
  needs one of them, not a new concept.**
- **Both languages, or English only?** ⚠️ **§4 says notifications are English-only** ⇒ **if that holds, the
  notification editor is single-language and (a) is where bilingual lives.**
- **Is there a way BACK to the shipped default** when an edit turns out worse? **There must be.**
- **What happens to a message MID-FLIGHT when the template changes?**
🚫 **No estimate, no design and no build order from me. This is a REQ, not a task.**

---

# ➕ THE FOUR OPEN QUESTIONS ARE ANSWERED — `REQ-086` is now shapeable

## Q1 — WHO edits? **ANSWERED BY THE OWNER, 2026-09-08**
> *"คนที่ log in frontoffice ได้ ตอนนี้มีคนเดียวคือ admin"*
✅ **The editor lives in the FRONTOFFICE, behind the existing admin login.** 🚫 **No new role, no new permission
concept, no invitation flow.** 🔑 **"Whoever can log in" is a rule that stays true when they add a second
account later** — **it is a statement about the DOOR, not about a person.**

## Q2 — ONE language or two? **@Porter's answer, derived from rulings we already have**
- **(b) NOTIFICATIONS → ENGLISH ONLY, single-language editor.** 🔗 **`REQ-085 §4`: *"eng ล้วน ไม่ควรไทยเลย
  แม้แต่ติด"*.** ⇒ **a Thai field on that editor would be a field that must never be used.**
- **(a) COMMAND messages → BILINGUAL.** 🔗 **`REQ-079 §18`: conversation is bilingual.**
🔑 **The split is not a preference — it is the two rulings already made, applied.** ⚠️ **If §4 is ever relaxed,
this answer changes with it and not before.**

## Q3 — How do they get BACK? **@Porter's answer: they always can, and it must be one action**
✅ **Every message keeps its SHIPPED DEFAULT permanently.** **An edited message is marked as edited and can be
RESET to the default in one action.**
🔑 **Why this is a requirement and not a nicety:** **the customer will edit a message at a moment when they are
unhappy, and discover the result later, in front of a parent.** ⇒ **"undo" has to be reachable by someone who is
embarrassed and in a hurry.** 🚫 **"Retype the original from memory" is not a way back — nobody remembers it,
which is the entire premise of this REQ.**

## Q4 — What about a message MID-FLIGHT? **@Porter's answer: the template is read AT SEND TIME. That is all.**
✅ **A message already SENT is never rewritten** — it is a chat message in someone's LINE, and we could not
change it if we wanted to. **A message not yet sent uses whatever the template says when it fires.**
🚫 **No versioning, no scheduling, no "effective from".** 🔑 **The simple rule is also the honest one: the
customer sees "the next one will use this", which is exactly what a preview shows them.**

---
## ✅ `REQ-086` is now unblocked for @Sober to shape. 🚫 **Still no estimate, design or build order from @Porter.**
