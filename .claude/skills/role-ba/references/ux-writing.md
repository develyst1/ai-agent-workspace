# User-facing wording — part of the REQ, not a polish pass

When the desk gives UX writing to the BA/PM hat, every word the user sees is a requirement.
Wording that changes what the user must **do** is a requirement change, not a copy tweak.

## Write each string as a card

| Field | What goes in it |
|---|---|
| Where / when | The screen, the state, and the trigger that shows it |
| Was | The current text, if any |
| Now | The exact new text, in every language the product ships |
| Promises | What the user may rely on after reading it — what happened, what did not, what to do next |
| Why it changed | The rule change that made the old text wrong, if any |

## Rules

1. **Exact text, never a direction.** "Make it friendlier" is not a requirement; the sentence is.
2. **When a rule changes, the label changes with it.** A control whose behaviour moved while its
   label stayed is now lying ("optional" on a field that became required; "pending" on a control
   that now also selects other states). Check every existing label touched by the new rule.
3. **An error says what happened, why, and what to do** — in that order, in the user's terms.
   The *why* matters: without it, a user blocked by a rule invents a way around it (a fake phone
   number to pass a "phone required" check), recreating the defect.
4. **Say what was NOT done.** "Nothing was saved", "existing bookings stay" — users fear silent
   partial actions more than refusals. Only promise what the system actually guarantees; if a
   promise depends on an open decision, flag it.
5. **Name the scope of an action.** "Select all (this page)", "this session only / from now on".
   The next complaint is the user who thought the action covered more than it did.
6. **Use the product's established terms** (the desk's glossary if it has one); one meaning per
   word. Introducing a synonym is introducing a second concept.
7. **Undecided strings are Questions, not drafts that ship.** If the desk allows shipping draft
   copy, it carries the desk's draft marker and tests pin the shape, not the words.
8. **Match the language rules of the desk** — which audience sees which language, whether admin
   errors are monolingual, formality level.

## Thai-specific craft

- Polite, direct, short. `กรุณา…` for a required action; avoid stacking `ค่ะ/ครับ` in system text
  unless the product's voice already does.
- Put the consequence first, the instruction second:
  *"ลบสัปดาห์นี้ไม่ได้: มีการจองอยู่ 3 รายการ — ใช้ "ปิดรับ" แทน เพื่อหยุดรับจองใหม่ (การจองเดิมยังอยู่)"*.
- Do not translate English UI idioms literally; write the Thai a Thai user would say, then check
  the English says the same thing — not the other way round.
- Vague asks like *"ดูง่าย"*, *"สวย"*, *"ไม่รก"* are not wording requirements; they are visual
  asks (see the pre-flight, section D).

## English prose

Run user-facing English and long REQ prose through `humanizer:humanizer` when it reads
machine-written. Shorter beats complete; the reader is busy.
