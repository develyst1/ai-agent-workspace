# SPEC-078 — `REQ-086`: the customer edits the WORDS, not the messages

**From:** @Sober · **2026-09-09** · **Covers:** `REQ-086` scope **(b) NOTIFICATION templates**
🚫 **Scope (a) — the COMMAND/conversation messages — is NOT in this spec.** *(§8 says why, and it is not a
deferral for convenience.)*
🔑 **This spec exists because `REQ-085 §7.1`–`§7.4` are now BUILT, and building them answered the question
`REQ-086` was really asking.**

---

## §1 The finding that decides the whole design
**These four messages are NOT free text with placeholders.** They are already, in code:
```
TemplateKey  →  an ORDERED list of FieldKey       (TEMPLATE_FIELDS)
FieldKey     →  a label + a value source + an EMPTY RULE
NotifyType / Audience  →  which fields are OMITTED  (TYPE_OMITS / AUDIENCE_OMITS)
```
⇒ 🔑 **A message is a TITLE plus a sequence of `label : value` lines that the product assembles.**

**So the customer does not need a template. They need the WORDS:**
| editable | not editable |
|---|---|
| ✅ the **title** per `TemplateKey` | 🚫 which fields a message has, and their ORDER |
| ✅ the **label** per `FieldKey` | 🚫 the value SOURCES |
| | 🚫 the EMPTY RULES (`(-)` vs absent) |
| | 🚫 WHEN a message fires and WHO receives it |

### 🔑 Why this satisfies @Porter's four refusals STRUCTURALLY rather than by discipline
| his refusal | how this answers it |
|---|---|
| 🚫 *"a raw text box with `{{placeholders}}` and a save button"* | **There are no placeholders to mistype.** A label cannot name a value that does not exist, because labels do not name values — the FIELD does, and fields are ours |
| 🚫 *"an editor with no PREVIEW"* | **A preview is the real builder with sample data** — §6 |
| 🚫 *"editable message IDENTITY"* | **`TemplateKey` is untouchable; only its title's WORDS move** |
| 🚫 *"an edit reaching real parents without the customer seeing exactly what will be sent"* | **The preview renders through the same function that sends** — not a second renderer |

📌 **This is the difference between *"we will be careful with the text box"* and *"there is no text box"*.**

## §2 🔴 Labels are GLOBAL per `FieldKey`, not per message
**`ob_f_note` is deliberately the same label in all four messages** — @Jason, TASK-304: *"so the word means one
thing across every message a family receives."*
⇒ ✅ **One label per `FieldKey`, shared.** ⚠️ **Per-message labels would let `Remark` become "Note" on one message
and "Remark" on another** — 🔑 **the drift class this entire week was spent closing, handed to the customer as a
feature.**
📌 **If the customer ever wants one field worded differently in one message, that is a REQUIREMENT to discuss —
not a shape the editor should permit by default.**

## §3 The rows are keyed on `TemplateKey`. **Never on the title.**
🔴 **`§7.1` and `§7.3` render the SAME title from ONE i18n key** (`ob_course_title`). ⇒ **a list keyed by title
shows two rows with the same name, and an edit to the wrong one looks like it worked.**
✅ **`TemplateKey` is structural** — `Record<TemplateKey, …>` forces every key to be declared, and it caught a new
template on the day it was added.
⚠️ **The list therefore needs a HUMAN name per `TemplateKey` that is ours, not the customer's title** — *"course
confirmation"* vs *"single-session confirmation"*. 🔑 **The customer edits the title; they do not navigate by it.**

## §4 🚫 A template nothing sends must not be listed
`sick_leave` and `leave_teacher` still have renderers **because a queued outbox row needs them** — they are dead
as PRODUCERS and live as CONSUMERS until the queue drains (`SYSTEM-FACTS`, TASK-306).
⇒ 🔴 **An editor listing every renderer would offer the customer two messages the product no longer sends.**
✅ **List the templates that are ENQUEUED**, and 🔑 **derive that list rather than hand-writing it** — ⚠️ *a
hand-written scope is only as complete as somebody's memory (TASK-306), and here it would be wrong in the more
embarrassing direction: a message the customer edits and never sees.*

## §5 Defaults and reset — ONE source
✅ **The shipped default IS the current i18n string.** 🚫 **Do NOT copy the four formats into seed data** — 🔑 **two
copies of one sentence is the defect `§7` was built to remove, and the seed would rot first.**
⇒ **Store only OVERRIDES.** **An unedited label has no row.** **`Reset` DELETES the override row** — ⇒ *"back to
default" is not a stored copy of the default; it is the absence of an override.*
📌 **Q3 is satisfied exactly:** *"every message keeps its shipped default permanently"* — **because the default
never left the code.** ✅ **And *"marked as edited"* is `an override row exists`.**

## §6 The preview renders through the REAL builder
✅ **`formatOutboxMessage(payload, ctx, lang, audience)` with a sample payload.** 🚫 **No second renderer, no
approximation.**
🔑 **It must show the CONDITIONAL cases, because those are where a label is most likely to look wrong:**
- **a COURSE row and a ONE-HOUR row** — `Remaining` / `*Expiry date` appear on one and not the other, and the
  owner's reason for that is *"ไม่งั้นมันจะแยกยังไง"*;
- 🔴 **the EMPTY cases, both kinds:** `**Advance Leave Notice` showing `(-)`, and `Remark` **absent entirely**.
⚠️ **A preview that only shows the full, happy message hides the two rules that are hardest to get right and
easiest to break.** 📌 *`§8.1`'s trap was deliberately triggered in three of the four build tasks and caught
every time — the preview is where the CUSTOMER meets it, and they have no test.*

## §7 What a label may not be
⚠️ **These are refusals at EDIT time, in front of the person editing — `REQ-086`'s own requirement.**
- 🚫 **Empty.** **A blank label produces `: value`** — 🔑 *TASK-219: a label with nothing after it reads as
  information that went missing; this is the same wound facing the other way.*
- 🚫 **Containing the ` : ` separator**, which would make one line read as two fields.
- 🚫 **A newline** — one field, one line.
- ⚠️ **Length: bounded, and the bound is a real number rather than a feeling** — LINE wraps rather than truncates
  in a text message, so this is about legibility, not a hard cap. 🔑 **Say the number in the UI, do not silently
  trim.**
✅ **Otherwise the label is the customer's, reproduced EXACTLY** — including Thai. 🚫 **Never translated, never
case-corrected.** 📌 *`§8.2`: a human's words are a human's words. And their own examples disagree about `HR` vs
`Hr` — so "fixing" their casing would be us choosing between two things they wrote.*

## §8 🚫 Why scope (a) — the conversation — is NOT here
**Scope (b) is a FIELD TABLE. Scope (a) is genuinely free text** — the entry prompt, role replies, errors.
⇒ **they share a goal and share almost no mechanism**, and 🔴 **(a) is bilingual** (`REQ-079 §18`, and the
registration flow answers in the session's language) **while (b) is English-only** (`REQ-085 §4`).
⚠️ **One editor spanning both would need two validation models, two language models and two preview shapes.**
🔑 **And (a) has a live dependency: `§5`'s entry copy is with the CUSTOMER right now.** ⇒ **shipping an editor for
a sentence they are still writing would be the third version of that sentence in a week.**
📌 **(a) is a separate spec, after `§5` lands.**

## §9 What this needs that nothing in `REQ-085` did
🔴 **A MIGRATION — the first in the whole batch.** One override table, keyed by scope and key, holding text.
⚠️ **@Jason's split-run rule (PENDING DEPLOY 8) and `db:verify`'s witness ledger apply**, and 🚫 **I am not
designing the table here** — **that is the task's, and it is the one place this work stops being cheap.**
📌 **Everything in `REQ-085` shipped with `35 = 35`. This will not, and that is the honest signal that `REQ-086`
is a different size of thing.**

## §10 Open — @Porter's, before a task can be cut
1. ❓ **Which templates does the customer see?** **Four `§7` formats are theirs. There are others** (`course_deduction`,
   `todays_schedule`'s siblings, the reschedule and pause notices). 🔑 **"All of them" is a bigger promise than
   `REQ-086` made.**
2. ❓ **Is the FIELD LABEL table one screen or per-message?** **§2 says the labels are global; the SCREEN could
   still be grouped per message for legibility.** ⚠️ **If it is grouped, it must be visibly obvious that editing
   `Remark` there changes it everywhere** — *otherwise the customer discovers §2 by surprise.*
3. ❓ **May the customer edit the TITLE at all, given `§7.1`/`§7.3` share one?** **If they edit "the title", which
   messages change?** 🔑 **Either the two titles split into two keys — a code change we should make deliberately —
   or one edit moves both, and the UI must say so.**

⇒ 🚫 **No task until (1) and (3) are answered.** **(2) can be decided with @Fern when the screen is designed.**
