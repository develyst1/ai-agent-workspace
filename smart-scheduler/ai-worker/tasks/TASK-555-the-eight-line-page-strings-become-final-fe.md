# TASK-555 — the eight LINE-page strings become FINAL — FE, XS

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-29) · **Size XS.** ⏸️ **Queued behind TASK-554 — the crash goes first.**

## §0 Approved
**The eight strings you held back — `COPY-REVIEW-2026-09-28.md` §D2 — were approved by the owner on 09-28** (`tail`, `alsoTeacher`, `alsoParent`, `afterVisitor`, `confirm`, `removed`, `notKnownTitle`, `empty`).
✅ **You were right to hold them, and the approval is why holding them cost nothing.** 🔑 *He answered a question he would never have been asked if we had folded them in.*

## §1 Do
- **Same treatment as TASK-549:** markers off, **pinned by value, both languages, shape pins kept, reasons kept in the comments.**
- ✅ **The pin that stopped an unapproved string being treated as approved must now let these eight through — and must still bite for anything else.** 🔑 **Do not delete that pin; update its list.** *The mechanism is the valuable part, not the eight rows.*
- ⚠️ **Compare against the approved file itself, character for character, both languages** — the way you and @Jason both did it. **Report the count.**
- ⚠️ **Answer "text-only?" with numbers**, as before.

## Definition of Done
- [ ] Eight pinned by value both languages · **the approval-boundary pin updated, NOT removed, and still biting for anything unapproved** · compared against the approved file with a count · text-only answered in numbers · suite **count** · tsc · build ok · mutation: **a one-character drift** and **an unapproved string sneaking in** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-29): the eight §D2 strings are FINAL · **717 / 0** (unchanged) · tsc 0 · build ok · **5 of 6 mutations bite — 1 SLIPPED and I am naming it**

## §0 ✅ The front repo, re-read as instructed
**I re-read it before starting.** `git log`: the newest commits are the owner's (`dev`) carrying my TASK-539…554 work; **the newest commit by anyone outside our chain is `c8e9639` (`neeeeroooo`, 2026-09-22)** — before this run. Working tree **clean**, suite **717/0 across 76 files**, which is **exactly what I left at the end of TASK-554**. ⇒ **no surprise to explain: nothing of Palm's has landed in what I touch.**

## §1 The eight, compared against the approved file
**All 8 × 2 = 16 comparisons pass, character for character**, against `COPY-REVIEW-2026-09-28.md` §D2 — the same method as §A–§D: read out of the live dictionary module, compared to the file's own text, not by eye.
⇒ `lineAdmins` is now **17 of 17 approved**, and `APPROVED` in `approved-copy.test.ts` holds **31 rows** (23 + 8).

## §2 🔑 The boundary pin — updated, NOT removed, and it still bites
The pin that refused to treat the eight as approved now reads: **every key on that page is either in `APPROVED` or declared in `UNREVIEWED` with a reason.** `UNREVIEWED` is `{}` today — **and that emptiness is asserted, not assumed.**
- **K3** adds an unapproved string to the page: **the boundary fails** (and TASK-539's key-set pin fails beside it). ⇒ **the mechanism survives the rows it was built for.**
- **K5** declares a draft with **no reason**: fails. *A hold that explains nothing is the silence coming back with a label on it.*
🔑 **So what it guards is no longer "the eight" — it is "nobody may read silence as approval", including about strings that do not exist yet.**

## §3 ⚠️ @Porter's "text-only?", in numbers again
- **No rendered string changed. Not one.** `dictionaries.ts` changed in **comment lines only — verified mechanically: 0 non-comment changed lines** in its diff.
- **No component touched.**
- ⚠️ **What else moved: ONE test file** (`approved-copy.test.ts` — the 8 rows and the boundary's list), **+38 / −16 lines.**
- **Counts unchanged: 717 tests across 76 files** — 🔑 **the same tests now assert more** (74 assertions in that file, up from 65). **tsc 0**, **`bun run build` ok**.

## §4 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
```
BASELINE= dictionaries.ts        76776e55b4df0d26b60aca02e260feb2
          approved-copy.test.ts  8c7165f8e85d7581e3c17701b28153a9
```
| # | mutation | result |
|---|---|---|
| K1 | **one character** off in an approved §D2 EN string (`id ends` → `id end`) | ✅ the value pin (EN) |
| K2 | **one character** off in an approved §D2 Thai string (a doubled space) | ✅ the value pin (TH) |
| K2b | the `{tail}` placeholder dropped | ✅ the value pin **and** TASK-539's placeholder pin |
| K3 | **an unapproved string sneaks onto the page** | ✅ the boundary **and** TASK-539's key-set pin |
| K4 | **the boundary pin itself is gutted** (its equality replaced by `length > 0`) | 🔴 **SLIPPED — nothing failed** |
| K5 | a declared draft with no reason | ✅ the boundary |

### 🔴 K4, honestly
**Nothing caught it, and nothing in this design can:** a pin cannot pin itself — *whatever I add to catch a weakened assertion is itself weakenable*, so this is a review-time property, not a test-time one. **What I can say precisely is how much that costs here:**
- **The EVENT the pin exists for is caught TWICE.** K3 — an unapproved string actually arriving — fails **both** the boundary and `line-admins.test.ts`'s independent exhaustive key-set pin. ⇒ **gutting the boundary alone does not open the door; it takes gutting two files in two tasks.**
- 📌 **I am reporting it rather than deleting the mutation**, because a break-and-watch table with only green rows is the one thing that would make these reports less trustworthy. **If you want a third holder, say so** — the cheapest is asserting the boundary's own shape (that the equality line exists), which I did not add because it is a pin pinning a pin and reads as ceremony.

## §5 What I did not touch
🚫 §A–§D (already final and untouched) · the discount error strings and the attendee-note hint (still marked, still pinned as still-marked) · §E (the backend's, TASK-550) · 🚫 **REQ-110 items 4, 9 and 11 — Palm's, not read, not built, not tested.** 🚫 No BE change · no deploy request.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-29)
Verified within the same run as TASK-557: **729/0**, tsc 0, build ok. **No rendered string changed · `dictionaries.ts` comments only (0 non-comment lines) · no component touched · one test file · 74 assertions where there were 65.**

## ⚖️ K4 slipped — **no third holder. Her reading is right.**
**Gutting the boundary's own equality fails nothing: a pin cannot pin itself.**
✅ **Ruled: leave it.** 🔑 **The only cheap third holder would assert that the assertion exists, which is ceremony** — *it would raise the count and not the confidence.* ✅ **And the mitigation is real: the EVENT is caught twice, by K3, across two files from two tasks** — **the thing we care about is guarded; the guard's own text is not, and that is an acceptable floor.**
📌 **The sentence I want kept: "a break-and-watch table with only green rows is the one thing that would make these reports less trustworthy."** 🔑 **A reported slip is evidence the table is real.** **Recorded in `SYSTEM-FACTS.md`.**
✅ **The approval boundary was UPDATED, not removed** — the eight pass, anything else still bites. **§A–§D, the other drafts and §E untouched; Palm's items untouched.**
