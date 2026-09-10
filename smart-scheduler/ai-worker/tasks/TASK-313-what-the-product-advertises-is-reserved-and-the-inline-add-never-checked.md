# TASK-313 — what the product ADVERTISES is reserved, and the inline add never checked

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-09)
🔴 **RELEASE — the last item before the owner's LINE round.** 🚫 No migration, no FE change.
🔑 **@Porter's ruling and his principle, and a live hole I found while looking for the mechanism he asked for.**

---

## §1 ✅ The copy call — the English menu says `Add Student`
> **@Porter:** *"We do NOT invent a second English phrase for an act the customer has already named."*

🔴 **Three phrasings for one act — `เพิ่มนักเรียน` (ours, Thai) · `add child` (ours, English) · `Add Student`
(the customer's, screen 8) — TWO of them ours.**
✅ **`line-i18n.ts:220`, the EN menu's first line, now advertises `Add Student`** — **the same phrase as screen 8,
matched by the same rule** (case-insensitive, space-collapsed, no fuzzy match).
⚠️ **`add child` must STILL BE ACCEPTED** — **parents have seen it.** 🔑 **It stops being ADVERTISED; it does not
start being REFUSED.** **And when it is typed it must ADD a child, not name one `child`.**
📌 **The drift class in its smallest instance: two ways to say one thing is how it starts meaning two things.**

## §2 🔴 THE LIVE HOLE — `add เมนู` creates a child named `เมนู`
**The guard @Porter is asking for ALREADY EXISTS and the inline path does not use it.**
| path | reserved check |
|---|---|
| the NAME PROMPT (`:563`) | ✅ **`isReservedWord(name)` → `strikeOrPrompt`** — TASK-245 |
| 🔴 **the INLINE add (`:1035`)** | 🔴 **NONE. `addStudentAndReply(name)` is called directly.** |

⇒ **type `เมนู` at the prompt: refused.** ⇒ **type `add เมนู`: a child named `เมนู` is created.**
🔴 **That is TASK-245's ORIGINAL defect — *"`เมนู` was stored as a child's NAME, in a roster with no delete, by a
bot that had just told him `เมนู` was a command"*** — **still live, on the other door, the whole time.**
✅ **Fix: the inline path uses the same guard, and the same `strikeOrPrompt` refusal.** 🚫 **Not a second check —
the SAME one.** 📌 *`createStudentForParent`'s precondition was extracted rather than copied for this exact
reason; do the same here.*

## §3 🔑 @Porter's principle — and how much of it can actually be ASSERTED
> ***No word the product PRINTS in a menu or a prompt may become a child's name.***
> *"If it ends up a hand-kept list, say so plainly and I will carry that limit rather than discover it."*

**My answer, and it is TWO-THIRDS mechanical. Build all three and label the third.**
1. ✅ **STRUCTURAL — §2's guard.** Once the inline path checks, **every word in `RESERVED_WORDS` is unusable as a
   name by construction, on both doors.**
2. ✅ **MECHANICAL — the MENU is parseable.** `menu_body` lists commands as `· <word> — <description>`, in both
   languages. ⇒ **a test can extract every advertised token from the menu STRING and assert each one is
   reserved.** 🔑 **That makes "what we advertise is reserved" true of the menu by TEST rather than by memory** —
   **and it fails the day someone advertises a word without adding it.**
3. 🔴 **HAND-KEPT — the customer's eight screens are PROSE.** *"please type "Add Student"."* ⇒ **no parser finds
   that reliably, and I will not build one that half-finds it.** ⚠️ **This is the limit @Porter asked to be told
   rather than discover.** 📌 **Mitigation, not a mechanism: `§17c`'s screens are already pinned byte-for-byte
   (TASK-310), so the WORDS cannot change silently** — **what is unguarded is a NEW instruction being added later
   without reserving its word.**

⚠️ **State (3) in the test file next to (2)** — 🔑 **the same rule as TASK-312's declared blind spot: an assertion
that names what it does NOT cover is worth more than one that quietly covers less.**

## §4 What must not change
- 🚫 `RESERVED_WORDS`' purpose · the Thai keywords · `parseAddCommand`'s pattern (TASK-312) · `§17c`'s pinned
  screens · `§7.1`–`§7.4` · `LEAVE_NOTICE_TOO_LATE`.
- 🚫 **The strike behaviour** — a reserved-word refusal counts as a strike, *"which is exactly the escape the
  owner was reaching for when he typed it the second time."*
- 🚫 No migration · no FE change · no fuzzy matching.

## Definition of Done
- [ ] 🔴 **`add เมนู` REFUSES and creates nothing** — asserted **on the absence of a write**. ⚠️ *This is TASK-245's
      own defect on the other door; it is the reason this task is not just a copy change*
- [ ] **The same refusal on the inline path as at the prompt** — the SAME guard and the SAME `strikeOrPrompt`
- [ ] ✅ **The EN menu advertises `Add Student`** — asserted, **and `add child` is still ACCEPTED and adds a
      child** (asserted it does NOT create one named `child`)
- [ ] 🔑 **Every token the MENU advertises is reserved** — asserted **by parsing the menu string, both
      languages**, so it fails when someone advertises a word without reserving it
- [ ] 🔴 **The prose limit is DECLARED in the test file** — the customer's screens are not parseable
- [ ] 🔑 **Break it and watch** — restore the missing inline guard and show `add เมนู` writing
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)

## Question
🔴 **The guard existed, was written for exactly this, and one of two doors never called it — for months.**
📌 *TASK-245 fixed the door the owner walked through.*
🔑 **How many other guards are on ONE path when there are TWO?** ⚠️ **Not a sweep — I mean the shape: a rule
extracted into a helper, applied where the defect was found, and never applied to the sibling call site.**
🚫 **Name what you see; fix nothing.** 📌 *You have already found two this week — the leave notice firing from one
door of four, and this. Both were "the fix went where the report came from".*

---

## ✅ RESULT 2026-09-09 — @Jason. **1904 pass / 0 fail**, 153 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**. 🚫 No migration, no FE change.

- [x] 🔴 **`add เมนู` REFUSES and creates nothing** — the write is fenced behind the guard, asserted by ORDER and
      by count (`addStudentAndReply` appears once in the block, after the refusal)
- [x] **The SAME guard (`isReservedWord`) and the SAME `strikeOrPrompt`** on both doors — asserted on both slices
- [x] ✅ **EN menu advertises `Add Student`**; **`add child` still ACCEPTED and adds** — asserted (`{ name: "child" }`)
- [x] 🔑 **Every token the MENU advertises is reserved — parsed from the string, both languages** (6 + 6)
- [x] 🔴 **The prose limit DECLARED in the test file** — top comment AND a describe that names what green means
- [x] 🔑 **Break it and watch** — `if (name && isReservedWord(name))` → `if (false)`; restored; green above

### §2 ✅ The inline door, and one thing I had to add for the strike rule to be REAL there
`add <reserved word>` now hits `isReservedWord` → `strikeOrPrompt` with `add_name_reserved` — the one
definition, applied to the sibling door. ⚠️ **`strikeOrPrompt` counts on a session ROW, and a linked parent
typing an inline command may have none** — the update would be a silent no-op and the second reserved word
would never hand over. ✅ **So the refusal first drops the parent INTO the name prompt** (`AWAIT_STUDENT_NAME`,
exactly where bare `add` would have put them) and counts from there. **Keeps the strike behaviour honestly
rather than nominally**; asserted by order (`setStep` before `strikeOrPrompt`).

### §3 ✅ The three parts, built and labelled — and (2) needed the add PHRASE to be reserved
Parsing the menu found **two advertised tokens that were NOT reserved: `เพิ่มนักเรียน` and `Add Student`** —
the add phrase is a regex, not a list entry (TASK-312 §2.3 kept it so). ⇒ `add เพิ่มนักเรียน` would have written
a child named `เพิ่มนักเรียน`. ✅ **`isReservedWord` now also consults the ONE definition:** a bare add command
(`parseAddCommand(text)?.name === null`) is reserved. 🚫 The words are not copied into the list; the regex
stays the single source. **The mechanical test is what found this — it earned its place on the first run.**
🔴 **(3) is declared twice** — in the file's header and in a describe of its own: the eight `§17c` screens are
PROSE; what stands in is TASK-310's byte pins plus a hand-check of the instructions those screens give
TODAY. **A new instruction added later is not covered, and the file says so.**

### §1 ✅ And the honest sentence about `add child`
It is no longer printed anywhere and still works. ⚠️ **It still creates a child named `child` if a parent types
it bare** — `child` is not reserved, and §1 said accept, not refuse. **Whether `child` joins the reserved set is
@Porter's word, not mine** — recorded in the test as *"recorded, not fixed"* so nobody mistakes it for an
oversight.

---

## ❓ THE QUESTION — guards on ONE path when there are TWO. **Named; fixed nothing.**

**The same two doors — the WIZARD (`handleAddStudentStep`) and the INLINE add (`addStudentAndReply`) — have
TWO more of these, both older than today's:**
1. 🔴 **AC-9's duplicate check — `decideDuplicate` — runs only in the wizard.** `add น้องเอ` twice creates two
   students named `น้องเอ` in the same household; the wizard would have asked for more detail. **The AC that
   said *"a duplicate asks for MORE DETAIL, never demands a rename"* is true of one door.**
2. 🔴 **AC-11's admin notification — `notifyAdmins({ kind: "student_registered" })` — fires only from the
   wizard's confirm.** A child added inline is a child no admin is told about. **"The admin is told" (TASK-152's
   lesson, loud SKIPPED rows and all) is true of one door.**
3. 📌 **Weaker, and I name it because it is the same shape:** the wizard's `assertCanAddStudent` courtesy check
   at the FIRST step is not on the inline door — **but this one is fine**: the write's own precondition still
   enforces it, which is exactly why it was extracted. The difference is a worse message, not a missing rule.

🔑 **The pattern in all three plus today's: `addStudentAndReply` predates the wizard, and every rule written FOR
the wizard (TASK-233, TASK-245) was written INTO the wizard.** *"The fix went where the report came from"* — and
the report always came from the wizard, because that is the door with a prompt to get stuck in. **The inline
door never generates a report: it succeeds, wrongly, and silently — the same reason `Add Student` sat unnoticed.**

**BALL: @Sober — TASK-313 ready for review. ⛔ Nothing else is on me.**

---

# ➕ §5 AMENDMENT — @Sober, 2026-09-09. **`add child` must be the PHRASE, like `Add Student`. That was already the instruction and I did not make it loud enough.**

**Your honest sentence is what surfaced this:**
> *"It still creates a child named `child` if a parent types it bare — `child` is not reserved, and §1 said
> accept, not refuse. Whether `child` joins the reserved set is @Porter's word, not mine."*

✅ **You were right to flag it and right not to decide it. But it does not need @Porter — he already ruled it, and
I carried the line into §1 without emphasis:**
> **@Porter, verbatim:** *"`add child` must still be ACCEPTED — parents have seen it. It stops being ADVERTISED;
> it does not start being refused. **And when it is typed, it must add a child and NOT name one `child`.**"*

⇒ 🔑 **`add child` is the COMMAND, exactly as `Add Student` is.** **Not `add` + the name `child`.**
📌 **So it needs neither a reserved word nor a refusal — it needs the same treatment its sibling phrase already
has.** ⚠️ **`child` joining `RESERVED_WORDS` would be the WRONG fix: it would refuse a parent who legitimately
typed `add child` instead of serving them, and `child` is no longer a word we print.**

## ✅ What to change — one shape, three phrases
**`parseAddCommand` already treats `Add Student` as a phrase.** ⇒ **`add child` joins it**, with the same rules:
**case-insensitive, space-collapsed** (`add child` · `AdD ChIlD` · `addchild`), **and a name after a separator
still works** (`add child Emily` → `Emily`, exactly as `Add Student Emily` → `Emily`).
🔑 **Then the menu's retirement is only about what we PRINT, which is what @Porter ruled** — **and a parent who
remembers the old phrase gets the prompt rather than a child called `child`.**

## ➕ Added to the Definition of Done
- [ ] 🔑 **`add child` (bare, any casing, collapsed) starts the PROMPT and creates NOTHING** — asserted on the
      absence of a write, the same way `Add Student` is
- [ ] **`add child Emily` creates `Emily`** — asserted, ⚠️ *the same shape as the sibling phrase; not a special case*
- [ ] 🚫 **`child` is NOT added to `RESERVED_WORDS`** — asserted, **and one line saying why: it is no longer a word
      we print, and reserving it would refuse a parent instead of serving them**
- [ ] **The menu still advertises `Add Student` only** — unchanged
- [ ] 🔑 **Break it and watch** — restored, suite green before the number

---

## ✅ §5 RESULT 2026-09-09 — @Jason. **1905 pass / 0 fail**, 153 files · 🚫 **35 = 35** · tsc 0 (`bunx --package typescript@5.6.3 tsc --noEmit`).
✅ **`add child` is the COMMAND, exactly as `Add Student` is** — one regex alternative (`student|child`), one shape, three phrases: `add child` · `AdD ChIlD` · `addchild` → the prompt; **`add child Emily` → `Emily`**; `addchildemily` → nothing. 🚫 `child` is NOT reserved (asserted) — the bare PHRASE is, through the one definition, like its siblings.
🔑 **Break it and watch:** `child` dropped from the alternative → `add child → {"name":"child"}` again, 2 fail (the §5 assertion in each of the two files); restored; green above.
📌 The parser's doc-block carries §5 next to the `Add Student Emily` decision, so the three phrases are explained in one place.

**BALL: @Sober — §5 done; the release is closed on my side. TASK-314 next, off the clock.**
