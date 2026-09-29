# TASK-549 — the approved copy becomes FINAL — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-28) · **Size S.**

## §0 The owner approved ALL of it — "ผ่านหมด"
**Every 📋 DRAFT string in `COPY-REVIEW-2026-09-28.md` §A–§D is now FINAL as written, both languages** — the four leave bodies, the Undo toast, the whole forecast block **including the caveat sentence**, and the LINE-admin page **including "ไม่ทราบว่าเป็นบัญชีของใคร"**.

## §1 Do
- **Remove the `📝 DRAFT (Fern, …)` markers** from the approved strings and **pin by value where you pin copy** — **the owner's words are now the spec.**
- 🔑 **Keep the SHAPE pins as well as the new value pins.** *A value pin says "these letters"; a shape pin says "this promise". The second is the one that caught all four defects, and it must survive the words becoming final.* ⚠️ **If keeping both makes a pin read as duplicated, say which you kept and why** — do not silently drop the shape.
- ✅ **Keep the reasons in the comments.** 📌 **Approved does not mean unexplained**: the next person to touch `previewForecast` must still meet *why "would" is deliberate* before they strengthen it.
- ⚠️ **Strings NOT in §A–§D of the review file stay drafts** (the discount errors, the attendee-note hint, and anything else marked DRAFT for another reason). **Say which you left alone.**

## §2 The question @Porter asked, and I want it answered as a statement
**"Does anything change in the build? It should be text-only."**
⇒ **Answer it with evidence, not a reassurance.** 🔑 **It is NOT purely text-only: the tests change** (shape pins gain value pins). **Say exactly that:** *no rendered string changed, no component changed, N test files changed.* ⚠️ **If a single rendered character differs from what the owner approved, that is a finding — STOP and report it**, because the file he approved is now the reference.

## §3 What I am NOT asking for
🚫 No rewording · no new keys · no component change · no BE change.

## Definition of Done
- [ ] §A–§D markers removed, **pinned by value**, 🔑 **shape pins kept (or the swap named and justified)** · reasons kept in the comments · other drafts left alone **and named** · 🔑 **"text-only?" answered as a statement with the count of changed files and the confirmation that no rendered string differs from the approved file** · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — including **a one-character drift from the approved text** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-28): the approved copy is FINAL · **710 / 0** (was 704 · +6) · tsc 0 · build ok · **7 mutations bite** · 🔑 **no rendered character differs from the file he approved — 23 rows, both languages, checked**

## §1 🔑 @Porter's question, answered as a statement
**"Does anything change in the build? It should be text-only."**

- **No rendered string changed.** **All 23 approved rows in §A–§D match `COPY-REVIEW-2026-09-28.md` character for character, in both languages** — compared programmatically against the shipped dictionary, not by eye. **Nothing was reworded to "tidy" it, and nothing drifted.**
- **No component changed.** No `.tsx` file was touched by this task.
- **`dictionaries.ts` changed in COMMENT LINES ONLY** — 13 `📝 DRAFT (Fern, …)` markers became `✅ APPROVED 2026-09-28`, with the reasons kept beneath them.
- ⚠️ **So it is NOT purely text-only, and here is exactly what else moved: 2 test files.** One existing pin was re-pointed (`undo-control.test.ts`) and **one new file added** (`i18n/approved-copy.test.ts`, 6 tests, 65 assertions, the 23 rows pinned by value).
- **Counts: 710 tests across 74 files** (was 704 across 73 ⇒ **+6 tests, +1 file**) · **tsc 0** · **`bun run build` ok** · 🚫 no BE change.

⇒ **the deployable difference is nil; the difference in what the suite guarantees is the point.**

## §2 🔑 Value pins added, shape pins KEPT — and why both
Every approved row is now pinned **by value** in `src/lib/i18n/approved-copy.test.ts`. **The shape pins stayed exactly where they were** (`leave-claim.test.ts`, `undo-preview.test.ts`, `line-admins.test.ts`, `undo-control.test.ts`).

📌 **It is not duplication, and the mutations prove it:**
- **H3** rewords an approved sentence while **keeping its promise** (*"return the leave…"* → *"give the leave back…"*). **Only the value pin sees it.**
- **H4** strengthens *"may still refuse"* into *"exactly what will happen"*. **The value pin sees the letters; the SHAPE pin sees the broken promise** — and that second failure is the one that matters, because it is the defect, not a copy edit.
🔑 ⇒ *a value pin says "these letters", a shape pin says "this promise"*, and **a reword that fails only the value pin is a conversation; a reword that fails a shape pin is a defect.** That distinction is only available while both exist.

## §3 ✅ The reasons stayed
`previewForecast` still carries **why *"would"* is deliberate** right above it, and **that is pinned** (H5 deletes the reason and bites): the next person to strengthen that word meets the argument first. The same for *"anything here that LOOKED like a name would be invented"* and *"an admin who believes a leave costs the family an entitlement AVOIDS RECORDING IT"*. 📌 **Approved does not mean unexplained.**

## §4 ⚠️ What I left alone, named
- 🔴 **Eight of the LINE-admin page's seventeen strings were NEVER in his §D table**: `tail` · `alsoTeacher` · `alsoParent` · `afterVisitor` · `confirm` · `removed` · `notKnownTitle` · `empty`. **They remain drafts, held by shape only**, and the file says so in words. **H7 sneaks one of them into the approved list and bites** — 🔑 *nobody may read silence as approval, and the pin enforces that rather than trusting a memory.* (`confirm` happens to carry the same letters as the approved button, but the row itself was never shown, so it stays a draft.)
- **The discount error strings** (`errPercentRange`, `errBahtPositive`, `errValue` — *"DRAFT — no REQ line"*) and **the attendee-note `hint`** (Porter owns the not-for-PII wording): untouched, still marked, and now **pinned as still-marked** so this task cannot be read as having blessed them.
- **§E's LINE messages** are the backend's (TASK-550) — not mine, not touched.

## §5 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
```
BASELINE= dictionaries.ts        8f15f0395d5ad7cc12756dc77965e051
          approved-copy.test.ts  db4648e50d07c136a74b745f537ae5b3
```
| # | mutation | caught by |
|---|---|---|
| H1 | **a ONE-CHARACTER drift in the approved EN text** (a space before the colon) — the task's required mutation | the value pin (EN) |
| H2 | **a ONE-CHARACTER drift in the approved THAI text** (a space removed) | the value pin (TH) |
| H3 | an approved sentence **reworded while keeping its promise** | the value pin **only** — the point of having it |
| H4 | *"may still refuse"* **strengthened** | the value pin **and the SHAPE pin** — the point of keeping that |
| H5 | the **reason** deleted although the words are approved | the reasons pin (×2) |
| H6 | a **DRAFT marker comes back** on an approved string | the marker pin (×2) |
| H7 | an **unreviewed** §D string presented as approved | the set-size pin **and** the still-drafts pin |

All seven bite; none slipped; **CHECKSUM: both files back to baseline.**

## §6 🚫 No finding to report on drift — and that is a verified statement, not a reassurance
I checked **every** approved row against his file, both languages, character for character: **23/23 match.** Had one differed I would have stopped, because the approved document is now the reference — **so this line means the check ran and passed, not that I looked and saw nothing odd.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28)
Verified: **710 pass / 0 fail** across 74 files · tsc 0 · build ok.

## ✅ @Porter's question, answered the way I asked and better than I asked
**23 approved rows match his file character for character, both languages — compared PROGRAMMATICALLY, not by eye** · no component touched · `dictionaries.ts` changed in **comment lines only (13 markers)** · ⚠️ **2 test files.**
🔑 **"Deployable difference nil; what the suite guarantees is what changed"** — *that is the answer to "is it text-only?", and it neither overstates nor hides.* **Comparing rather than eyeballing is what makes it a statement instead of a reassurance.**

## ✅ She PROVED the two pin kinds are not duplication, rather than asserting it
**H3 rewords a sentence keeping its promise ⇒ only the VALUE pin catches it. H4 strengthens *"may still refuse"* ⇒ the value pin catches the letters, the SHAPE pin catches the broken promise.**
🔑 **"A reword that fails only the value pin is a conversation; one that fails a shape pin is a defect."** ⇒ **That is the distinction I was reaching for in §1 and did not state this well.** ✅ And **H5 deletes *why "would" is deliberate* and bites** — the reasons are pinned, not merely kept.

## 🔴 Her finding — **MY error, and it stands as a correction to the copy file**
**§D put TEN of the LINE-admin page's SEVENTEEN strings in front of the owner.** ⇒ **"ผ่านหมด" approved WHAT HE WAS SHOWN**, so the other **eight** (`tail`, `alsoTeacher`, `alsoParent`, `afterVisitor`, `confirm`, `removed`, `notKnownTitle`, `empty`) **are not approved and remain drafts.**
🔑 **"Nobody may read silence as approval."** ✅ **Held by shape only, named in the file, and a mutation that sneaks one into the approved list bites** — *she made the boundary of the approval enforceable, which is more than naming it.*
📌 **`COPY-REVIEW-2026-09-28.md` now carries a §D2 addendum** listing all eight, marked as never shown. **It goes up with the next round.** ⚠️ **The compiler could not have caught this: the table was mine, in a document.**

## ✅ Left alone, and pinned as left alone
**The discount errors and the attendee-note hint are now pinned as STILL-MARKED** ⇒ 🔑 **this task cannot be read as blessing them.** *Pinning the absence of approval is the same move as pinning the absence of a claim, and it is the right one.*
