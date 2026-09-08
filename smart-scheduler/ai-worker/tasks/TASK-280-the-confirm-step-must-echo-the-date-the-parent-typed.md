**Status:** DONE — code (Sober 09-07, reviewed) — tsc 0 / 1669 pass 0 fail / nothing applied. 🔑 His sweep found parseImportDob has been DAY-FIRST all along ⇒ TASK-277 REMOVED a divergence rather than creating one. ⚠️ Import accepts dots, LINE does not — deliberate, do not align.

# TASK-280 — the confirm step echoes the date in a format the parent did not type

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-07)
**Source:** **your** finding at the end of TASK-278. 📌 Small. 🚫 No migration, no database, no FE change.
⚠️ **Higher value than its size:** it repairs the guard TASK-277 declared load-bearing.

---

## §1 The defect, in one line
A parent types **`02-12-2024`**. `summaryLines` prints `draft.birthDate`, the **stored ISO** value, so the
confirm step shows them **`2024-12-02`**.

## §2 🔴 Why this is not cosmetic
**TASK-277 made the confirm step load-bearing for correctness** — §17's own words — **precisely because
`03-04-2024` is ambiguous to a HUMAN** (3 April or 4 March). The parser is unambiguous; the person is not, and
the summary exists to let them catch their own slip.
⇒ **Echoing in the other order makes the reader perform exactly the conversion the step exists to spare them.**
Someone who typed `03-04-2024` meaning **4 March** sees `2024-04-03` and must re-derive the order to check it.
🔴 **A confirm step that echoes in a different format is not a weaker guard — on this field it is close to no
guard at all**, and TASK-277's ruling assumed a guard that was stronger than the one we have.

## §3 The ruling — day-first, and it is NOT a new decision
**Echo `DD-MM-YYYY` with our dash: `02-12-2024`.**
🚫 **Not @Porter's to decide, and not mine to invent** — it follows from two decisions already made:
1. **The owner's input order** — `วัน-เดือน-ปี`, §17, closed 2026-09-06.
2. **The customer's own screen 7** — `วันเดือนปีเกิด / Date of Birth: 02.12.2024`, §17b. **Day-first.**
**Both point the same way.** *(Their dots do not ship — §17b departure 2, already ruled.)*

## §4 How — the same shape as your phone formatter, and for the same reason
**Format at the DISPLAY, never at the store.**
- 🚫 **`draft.birthDate` stays ISO**, `parseBirthDate` unchanged, everything that reads `birthDate` untouched.
  **A display format reaching the database is the one way this can do harm.**
- ✅ **Put the formatter beside `parseBirthDate`**, with the same sentence yours carries: *it is deliberately
  NOT the inverse of the parser and must never be used as one.* 📌 **That sentence is the control** — the
  obvious future mistake is reaching for it to undo the parse.
- ✅ **Assert it by POSITION** — called only where the summary is built — **not by counting call sites.**
- ⚠️ **A value that is not a well-formed ISO date passes through UNCHANGED.** `null` still renders the `none`
  label. **Same rule as the phone: the display must not invent a shape for something it does not recognise.**

## §5 What must not change
- 🚫 `parseBirthDate`, the stored value, the skip path, `withExit`, the strike behaviour.
- 🚫 The confirm step's own load-bearing comment — **strengthen it, do not replace it:** add that the echo is
  day-first *because* the step is what disambiguates a day-first input.
- 🚫 The six notifications and the ICS feed. 🚫 No migration, no database, no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] 🔑 **Type `02-12-2024` ⇒ the summary shows `02-12-2024`** — asserted end to end, prompt to summary, **not
      just on the formatter**
- [ ] 🔑 **`03-04-2024` echoes `03-04-2024`** — the ambiguous case, asserted as its own test, since it is the
      whole reason the step exists
- [ ] **The stored value is still ISO** — asserted at the write, because that is where this could do harm
- [ ] A malformed or `null` value passes through / renders `none` — asserted
- [ ] The formatter has **no caller outside the summary** — asserted by position
- [ ] 🚫 Notifications and ICS byte-identical · no migration, no database, no FE change

## Question
**Is the date echoed anywhere else a parent or teacher reads it back to CHECK something?** The confirm step is
the one I know of. 📌 *An echo whose format differs from the input is only a defect where somebody is verifying;
everywhere else ISO is fine and probably better.* **Name what you find; change nothing else.**

---

# ✅ Jason (BE) — DONE, code. 2026-09-07

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1669 pass / 0 fail, 131 files**
🚫 No migration · no database · no FE change · `parseBirthDate`, the stored value, the skip path, `withExit` and
the strike behaviour untouched · notifications and ICS untouched.
New: `src/lib/birthdate-echo.test.ts` (10 tests).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1669 / 0**, 131 files
- [x] 🔑 **`02-12-2024` ⇒ the summary shows `02-12-2024`** — asserted **end to end**, through the real parser
      and the real `summaryLines`, not on the formatter
- [x] 🔑 **`03-04-2024` echoes `03-04-2024`** — its own test, **with `04-03-2024` beside it**, asserting the two
      echoes DIFFER (that is the property, not the string)
- [x] **The stored value is still ISO** — asserted at the round trip, plus that the retired order is still refused
- [x] A malformed value passes through; `null` renders the `none` label — asserted
- [x] The formatter has **no caller outside the summary** — asserted **by position**, plus four modules asserted
      not to call it at all
- [x] 🚫 Notifications and ICS byte-identical · no migration, no database, no FE change

## The shape — yours, reused deliberately
`formatBirthDateForDisplay` sits **immediately after `parseBirthDate`**, carrying the same sentence the phone
formatter carries: *"deliberately NOT the inverse of `parseBirthDate`, and must never be used as one."*
📌 **The placement is part of the control**: the sentence has to be where the person about to make the mistake
is already looking, and the mistake is reaching for it to undo the parse. Asserted that the two sit in that
order in the file.

## 🔴 The test that had to be corrected — and it is the same shape as TASK-277's
`line-add-student.test.ts:44` asserted `"วันเกิด: 2018-04-02"`. ⇒ **the suite pinned the ISO echo**, so the
weakened guard was green. **Second time in two tasks that this file's assertions were defending the thing that
was wrong** — first the input order, now the echo. Corrected, not deleted, with the reason on the line.
✅ **Mutation-tested, and it fails for the right reason:** reverting the echo to `draft.birthDate` fails the
three round-trip tests — the ones about what a parent SEES — and not the display-only ones.

## Answer — **the confirm step is the only place a date is echoed back to be CHECKED**
Swept every reader of `birthDate` outside the parser:

| site | what it does | verdict |
|---|---|---|
| `summaryLines` | echoes it back before writing | 🔴 **the one — fixed** |
| `attention.ts:72` | *"is it missing?"* for the incomplete-students card | ✅ presence, never displayed |
| `som-report.ts` `ageFrom` / `ageBand` | derives an age band | ✅ a computation, not an echo |
| `db/schema.ts:172` | the column | ✅ storage |
| `student-import.ts` | the admin CSV import | ✅ parses, does not echo for verification |

📌 **And every other date a parent or teacher reads — `Start`, `Date`, the leave dates — is one the SYSTEM chose,
not one they typed.** Your own distinction holds: *an echo whose format differs from the input is only a defect
where somebody is verifying.* **Nobody is verifying their own keystrokes anywhere else**, so ISO stays and is
probably better.

### ➕ One thing the sweep turned up that is worth knowing, and needs nothing
🔑 **`parseImportDob` (`student-import.ts:73`) has been DAY-FIRST all along** — `^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$`,
and it accepts dots as well as dashes, which is exactly the `02.12.2024` the customer wrote.
⇒ **The product had two date conventions before this week: the admin import took the customer's order, the LINE
flow demanded ISO.** **TASK-277 did not create a divergence — it removed one**, and the owner's ruling aligned
LINE with what the import had been doing since it was written. 🚫 Nothing to change; recorded because *"the
import already agreed with them"* is a fact that makes the ruling look less like a preference and more like a
correction.

## Review — Sober, 2026-09-07: ✅ **PASS. TASK-280 is DONE (code).** 🔑 **And your sweep found that the ruling was a CORRECTION, not a preference — which changes how it should be told to the owner.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **1669 pass / 0 fail**, 131 files · nothing applied ·
`formatBirthDateForDisplay` (`line-add-student.ts:109`) sits **after `parseBirthDate`** and has **exactly one
caller**, `summaryLines:154` · `parseImportDob`'s regex is **`^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$`**, exactly
as you say.

### 🔑 `03-04-2024` beside `04-03-2024`, asserting the two echoes DIFFER
> *"that is the property, not the string."*

**That is the correct test and it is not the one my DoD asked for.** I asked that `03-04-2024` echo itself — **a
formatter that returned its input unchanged would pass that.** **Asserting the two differ is the property the
step exists for**, and it is the difference between testing the output and testing the guard.

### 🔴 A test was pinning the weakened guard — SECOND time in two tasks, same file
`line-add-student.test.ts:44` asserted `"วันเกิด: 2018-04-02"` ⇒ **the suite held the ISO echo green.**
**First the input order, now the echo — both in the same file.** 📌 **That file has now defended the wrong
behaviour twice in one night**, which is worth more than either fix: **a test written for a decision keeps
defending it after the decision changes, and nothing about it looks stale.**
✅ **And you mutation-tested it and checked the reason** — *"reverting the echo fails the three round-trip tests,
the ones about what a parent SEES, and not the display-only ones."* **The failing set being the right set is the
measurement.**

### 🔑 The finding: `parseImportDob` has been DAY-FIRST since it was written
**The admin CSV import has accepted `02.12.2024` all along** — day-first, dots included, **the customer's exact
format.** ⇒ **the product had TWO date conventions before this week, and `TASK-277` REMOVED one rather than
creating one.**
🔑 **That changes what @Porter tells the owner.** *"We changed the LINE flow to match what you asked for"* is a
preference honoured. ***"The import already did it that way; the LINE flow was the odd one out"*** **is a
correction** — and the second is both truer and easier to defend if the customer ever asks why it was wrong
before. **Going up tonight in your words.**

⚠️ **One thing I am recording rather than acting on, so nobody "aligns" it later by accident:** **the import
accepts DOTS and the LINE flow does not.** That is not an oversight — the owner ruled *"their order with OUR
dash"* — so **the two now agree on ORDER and differ on SEPARATOR, deliberately.** 📌 **Written down because the
obvious future tidy-up is to make them identical**, and doing so would quietly reverse half of a ruling that is
one day old.

### The sweep — a bounded negative, done the way that makes a negative worth having
Five readers of `birthDate`, each with **what it does** rather than a verdict alone: presence · an age band ·
storage · an import · **the one echo.** ✅ **And the distinction you closed on is the one I gave you, tightened:**
*every other date a parent or teacher reads is one the SYSTEM chose, not one they typed* — **so nobody is
verifying their own keystrokes anywhere else**, and ISO stays.
