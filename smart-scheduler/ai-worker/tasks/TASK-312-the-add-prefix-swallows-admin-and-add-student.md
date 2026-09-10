# TASK-312 — the `add` prefix swallows `admin`, `Add Student` and anything else starting "add"

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-09)
🔴🔴 **§1 SHIPS NOW — @Porter's call, made knowingly, while the owner is inside this exact flow.**
🚫 No migration, no FE change. **§2 is `REQ-085 §13` and follows §1; do not let it delay §1.**

---

# §1 🔴🔴 SHIP FIRST — one regex, and it is worse than the screen that revealed it

`line-webhook.service.ts:1028`
```ts
const addMatch = raw.match(/^(?:เพิ่มนักเรียน|เพิ่มลูก|add)\s*(.*)$/i);
if (addMatch) { const name = (addMatch[1] ?? "").trim();
  if (name) return addStudentAndReply(lineUserId, name, …);   // :1031
```
**`add` is a BARE PREFIX, `\s*` matches EMPTY, and `(.*)` takes the rest of the word.** ⇒ **any input beginning
`add` becomes "add a child named <the remainder>".**

| a parent types | today | should be |
|---|---|---|
| **`Add Student`** *(our own screen 8 tells them to)* | 🔴 **creates a child named `Student`** | the add-a-student command |
| 🔴 **`admin`** *(our own command, `CMD_ADMIN`)* | 🔴 **creates a child named `in`** | reaches the admin handler |
| `address` | 🔴 creates a child named `ress` | nothing |
| `add Emily` | ✅ creates `Emily` | unchanged |

🔴 **`addMatch` at `:1028` runs BEFORE `CMD_ADMIN` at `:1040`** ⇒ **the English half of one of our own advertised
commands is unreachable, and typing it writes a record instead.**
⚠️ **`in`, `ress` and `Student` are not in `RESERVED_WORDS`** (`students` is) — **nothing downstream stops any of
it.**
🔑 **This is TASK-245's defect returned:** ***the bot advertises a word and swallows part of it as data.*** **That
one cost the owner a student record he could not delete — and there is still NO delete route and NO archive
flag.** ⇒ **every one of these writes is permanent.**

## The fix — two parts, and both are needed
1. ✅ **`add` may only be an inline prefix when a SEPARATOR follows** — `add` alone, or `add<space><name>`.
   ⇒ **`admin` and `address` stop matching and fall through to their real handlers.**
2. ✅ **`Add Student` is the COMMAND, not `add` + a name** — matched **before** the bare `add`, **case-insensitive
   and space-collapsed** (`§13.3`): `Add Student` · `add student` · `AdD StUdEnT` · `addstudent`.
⚠️ **Decide and SAY what `Add Student Emily` does** — 📌 *I am not ruling it; the customer's screen only promises
the bare phrase. Either answer is defensible; a silent one is not.*
🚫 **Do not reorder the router** — 🔑 **fix the PATTERN, not the position.** *Moving `:1028` below `:1040` would
fix `admin` and leave `address` and every future `add…` word broken.*

## §1 Definition of Done
- [ ] 🔴 **`admin` reaches the ADMIN handler** — asserted. ⚠️ *This is the one nobody knew about*
- [ ] 🔴 **`Add Student` (and `add student`, `AdD StUdEnT`, `addstudent`) is the COMMAND** — no child is created,
      asserted **on the absence of a write**
- [ ] **`address` creates nothing** — asserted
- [ ] **`add Emily` and `เพิ่มนักเรียน น้องเอ` still work** — asserted, ⚠️ *the fix must not cost the feature*
- [ ] **`Add Student Emily` behaves as you decided, and the decision is written down**
- [ ] 🔑 **Break it and watch** — restore the bare prefix and show `admin` creating a child named `in`
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)

---

# §2 `REQ-085 §13` — English keywords, and case never matters

## §2.1 The one missing word
🔴 **`ครู` has no English form. `teacher` is CONFIRMED by the owner.** ✅ **Add it.**
📌 **Everything else already has one** — I inventoried `lib/line-commands.ts`: `register` · `menu`/`help` ·
`courses` · `admin` · `children`/`students` · `qr` · `checkin` · `leave`/`sick` · `schedule` · `calendar` ·
`cancel` · `reopen` · `skip`, plus `confirm`/`yes`/`ok` in `line-add-student.ts`.

## §2.2 🔴 Case-insensitive — `§13.3`, and the owner handed us the test case
> *"คำสั่งภาษาอังกฤษ ต้องไม่สนใจ จะพิมพ์เล็กใหญ่ได้หมด เช่น confirm Confirm ConFirm ConFiRM"*

⚠️ **His four examples are the requirement, not a flourish:** 🔑 ***the letters are what matter; their case never
does.***
🔴 **Write the tests with `ConFiRM`, not `Confirm`** — 📌 *a test using `Confirm` passes a `toLowerCase()` applied
to the first letter only.* **He handed us the case that catches a half-fix; use it.**
🚫 **Case-insensitive is NOT forgiving:** **`CONFIRMM` is not `confirm`.** **We accept the same WORD however it is
typed; we never accept a different word.** ⚠️ **English only — Thai has no case.**

## §2.3 The test is written from the LIST, not from pairs
✅ **For every keyword the vocabulary accepts, an English form is accepted too** ⇒ **a keyword added next month
FAILS until it has one.** 🚫 **Not a hand-written table of pairs** — 🔑 *a list is complete the day it is written
and wrong a week later.*
🔴 **AND DECLARE THE BLIND SPOT IN THE SAME FILE.** **The sweep cannot see `confirm` (`line-add-student.ts`) or
`Add Student` (a regex in the router).** 📌 **@Porter's reason, and it is the right one:** ***a test with an
undeclared blind spot is how TASK-288's assertions stayed green through a live defect*** — **an assertion that
names what it does NOT cover is worth more than one that quietly covers less.**
🚫 **Do NOT move those two into the list to make the sweep complete** — **that is a design change and it waits
until after the owner's round.**

## §3 What must not change
- 🚫 `RESERVED_WORDS`' purpose · the Thai keywords · `LEAVE_NOTICE_TOO_LATE` · `§17c`'s pinned screens ·
  `§7.1`–`§7.4`'s pinned messages · no migration · no FE change.
- 🚫 **No fuzzy or partial matching, anywhere.** 🔑 *A bot that guesses is worse than one that asks again — we
  cannot apologise to a parent it guessed wrong about.*

## §2 Definition of Done
- [ ] **`teacher` accepted; `ครู` unchanged** — asserted
- [ ] 🔑 **Every keyword in the vocabulary has an English form** — asserted **over the LIST**, so a new keyword
      fails until it has one
- [ ] 🔴 **The blind spot is declared IN the test file** — `confirm` and the `Add Student` regex
- [ ] 🔑 **Case-insensitivity asserted with ABSURD casing** (`ConFiRM`, `AdD StUdEnT`) — 🚫 **not `Confirm`**
- [ ] **`CONFIRMM` is REFUSED** — asserted, because case-insensitive is not forgiving
- [ ] 🔑 **Break it and watch** · `bun test` green with the count · 🚫 no migration

## Question
🔴 **The `add` prefix has been live since inline-add was built, and `admin` has been broken that whole time.**
🔑 **Nobody reported it — because a Thai-speaking admin types `แอดมิน`.** ⇒ **an English-only defect on a
Thai-speaking team is invisible by construction.**
📌 **`§13` exists because the customer has foreign parents.** ⇒ ❓ **what ELSE is English-only-broken and
therefore unreported?** ⚠️ **Not a sweep for keywords — you have that.** **I mean paths where the ENGLISH branch
has never been walked by anyone here.** 🚫 **Name them; fix nothing.**

---

## ✅ RESULT 2026-09-09 — @Jason. §1 AND §2. **1894 pass / 0 fail**, 152 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**. 🚫 No migration, no FE change.

### 🔴 READ FIRST — `admin` was NEVER broken by this regex. `a-d-m` is not `a-d-d`.
**The headline of §1 is false and I can prove it with the mutation you asked for.** I restored the bare prefix
`/^add\s*(.*)$/i` and ran the three inputs through it:
```
admin → null | Add Student → {"name":"Student"} | address → {"name":"ress"}
```
**`admin` does not start with `add` — its third letter is `m`.** ⇒ `CMD_ADMIN` was reachable the whole time;
"the English half of one of our own advertised commands is unreachable" did not happen, and *"a child named
`in`"* could never have been written by this pattern. ⚠️ **The two REAL defects stand and were live:** `Add
Student` → a child named **`Student`** (our own screen 8's instruction, obeyed), and `address` → **`ress`**.
📌 So the DoD line *"show `admin` creating a child named `in`"* cannot be satisfied; **the mutation instead
caught `address` and `Add Student`, five assertions, for the reason expected.** Restored; suite green above.
🔑 **And the Question's premise needs the same correction:** the invisible-by-construction defect is real —
**but its evidence is `Add Student`, not `admin`.** (An English-speaking parent following screen 8 would have
found it; a Thai-speaking admin typing `แอดมิน` never could.)

### §1 ✅ The PATTERN is fixed; its position is not — `parseAddCommand` in `line-add-student.ts` (pure)
- **English: `add` is the command only when the input ENDS there or a SEPARATOR follows** — `add`, `add Emily`.
  `address` / `adding` / `addendum` fall through and write nothing.
- **`Add Student` is the COMMAND** — case-insensitive AND space-collapsed: `Add Student` · `AdD StUdEnT` ·
  `ADD STUDENT` · `addstudent` · `aDdStUdEnT` — all start the prompt, **none writes** (asserted on `name: null`,
  and the router's write pinned to `if (name)`).
- 📌 **DECISION, written in the parser's doc-block:** **`Add Student Emily` creates `Emily`.** The phrase is the
  command and takes a name after a separator exactly as bare `add` does — one shape, and it can never write
  `Student Emily`. **`addstudentemily` (no separator) matches nothing and writes nothing.**
- **Thai keeps its tolerance:** `เพิ่มนักเรียนน้องเอ` still reads `น้องเอ` — Thai is written without spaces and no
  other Thai command begins with `เพิ่มนักเรียน`, so the ambiguity that broke `add` does not exist there.
- 🚫 The check still sits ABOVE `CMD_ADMIN`; a source assertion pins the order so nobody "fixes" it by moving it.

### §2 ✅ `REQ-085 §13` — new `src/lib/english-keywords-req085.test.ts`
- 🔑 **The sweep is written FROM THE LIST** — it discovers every `CMD_*` export of `line-commands.ts` (13 of
  them) and fails any list with no English form. **A keyword added next month fails until it has one.**
- 🔴 **§13.3 with ABSURD casing** — every English form is run as `ConFiRM`-style, `SHOUT`, and padded, through
  the router's own comparison (`raw.toLowerCase()` + `inList`, both pinned in source). **`REGISTERR`, `admins`,
  `men` are refused** — case-insensitive is not forgiving.
- 🔴 **THE BLIND SPOT IS DECLARED AT THE TOP OF THE FILE** and asserted by hand beneath it: `confirm`/`cancel`/
  `skip` in `line-add-student.ts` (`ConFiRM` ✅, `CONFIRMM` ❌), and the `Add Student` regex. 🚫 Neither moved
  into the list.
- 🔻 **§2.1 — `teacher` was never missing, and I added nothing.** `ครู` is not in `line-commands.ts` at all —
  the inventory looked there and correctly found no `ครู`. **The only place the bot accepts `ครู` is
  `parseRoleChoice`, and `teacher` has sat beside it since TASK-251.** Asserted with `TeAcHeR` so §13.3 covers
  the role words too. ⚠️ Adding a `teacher` command keyword would have been inventing a command nobody asked for.

### 🔑 Break it and watch — the bare prefix restored (the output block above), 5 fail, restored, green.

---

## ❓ THE QUESTION — what ELSE has an English branch nobody here has ever walked? **Named. Fixed nothing.**

**1. 🔴 `add child` — our OWN English menu writes a child named `child`.** `menu_body` EN, line 1:
*"· add child — register a child (up to 5)"*. A parent who types what that line says gets `add` + separator +
`child` ⇒ **`parseAddCommand("add child") → { name: "child" }` ⇒ a permanent record named `child`.**
📌 **This is the same class as `Add Student`, is advertised by US rather than by the customer's copy, and it
was true before §1 and is still true after it** — §1 could not have caught it because `add child` IS the
correct shape for an inline add. **It needs a decision (rename the hint? reserve `child`? make `add child` the
phrase?) and that is @Porter's copy, not mine.** *Unwalked because the Thai menu says `เพิ่มนักเรียน`.*
**2. 🔴 `เช็คอิน 2` / `ลา 1` — the NUMBERED forms are Thai-only regexes.** `:1055` `/^เช็คอิน\s*(\d+)$/` and
`:1065` `/^ลา\s*(\d+)$/`. **`checkin 2` and `leave 1` match nothing** — the English parent gets whatever the
fallthrough gives an unknown word. The §2 sweep **cannot see these** (they are regexes, not lists) — a third
member of the declared blind spot, which I have NOT added to the declaration because you said name, not fix.
**3. ⚠️ Every English `type: …` instruction is now walked EXCEPT the two above.** I checked the EN strings that
tell a parent what to type: `register` ✅ · `reopen` ✅ · `cancel` ✅ · `skip` ✅ · `Confirm` ✅ · `Add Student` ✅
(as of §1) · **`add child` 🔴 (#1)**. The numbered forms are never advertised in English, which is why #2 is
unwalked rather than lied about.
**4. 📌 The refusal message names the Thai form only** (§13's matching rules, @Porter's last bullet). Not in the
TASK's DoD, so untouched — but it is an English branch that has never been read by an English reader.

**BALL: @Sober — TASK-312 §1 + §2 ready for review. ⛔ Nothing else is on me.**
