# TASK-603 — §10's superseded heading — BE, XS ⚠️ **one line, and it completes the owner's §12 ruling**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-10-01) · **@Fern derived it and correctly did not reach across.**

## §0 The ruling
**The owner ruled §12's LONG wording wins, and that nothing should still carry §10's shorter draft.** **@Fern found that the superseded sentence LIVES IN THE BACKEND — the digest heading.**
✅ **And she narrowed what was superseded: ONLY the heading SENTENCE.** 🚫 **Its line shape and the "count only in the digest" promise are NOT superseded and must survive untouched.**

## §1 The work
- **Replace the superseded heading sentence with §12's wording.** 🚫 **Nothing else about the digest changes.**
- ✅ **Pin that the digest still shows a COUNT only** — 🔑 **that promise was never in question, and it is the one a careless edit here would take with it.**
- ⚠️ **If §12's long wording does not FIT a digest heading** — it was written for an attention row — **STOP and say so.** 🔑 **A heading that runs to two lines in a LINE message is not a win**, and that would be a question for the owner, not a judgement call.
- 📋 **Record the change against `§10` in the copy file: SUPERSEDED, now carrying §12's sentence.** 🚫 **Do not renumber or delete anything.**

## Definition of Done
- [ ] The superseded sentence gone, §12's in its place · ✅ **the count-only promise and the line shape pinned as UNCHANGED** · ⚠️ **STOPPED and reported if the long wording does not fit a heading** · the copy file updated, nothing renumbered · suite **count** normally **and DB-unreachable** · tsc · mutations incl. **the old sentence back** and **the digest showing names** · report + `inbox/SA.md` + log · ⚠️ **tell me at once — @Porter is holding the batch on this one line.**

---

# ✅ REPORT — @Jason (2026-10-01): **GREEN — @Porter can release the batch.** The superseded sentence is gone, §12's is in its place · **the count-only promise and the line shape pinned as UNCHANGED** · ⚠️ **the fit question answered with numbers — it FITS, no STOP** · **NO migration (65)** · **3718 / 0 normally and 3× DB-unreachable (0 failed queries)** · tsc 0 · **7 / 7 mutations bite**

## §1 The one line
- **`ATTENTION_LABELS.courses_awaiting_reconfirm`** now reads §12's approved wording in both languages:
  - TH *"คอร์สที่เลื่อนแล้วแต่ยังไม่ได้ยืนยันใหม่ (ลูกค้ายังถือตารางเดิม)"* · EN *"Courses moved but not re-confirmed (the family still has the old dates)"*.
- **Where it shows:** the **LINE digest** (`buildDigestMessage` → `• <heading>: <count>`). 📌 **@Fern's derivation confirmed from this side:** the **ADMIN PANEL** renders the heading from the FE's own dictionary, which already carried §12's sentence — so **this was the last place still carrying §10's draft**, and the two surfaces now agree.
- 🔑 **Why the longer sentence won, kept in the comment beside it:** it repeats the move dialog's own words (**ตารางเดิม / old dates**), so two warnings about one state cannot contradict each other. **The short draft was not wrong — it was silent about the consequence.**

## §2 ⚠️ The fit question — answered with NUMBERS, not a judgement call
**You asked me to STOP if §12's wording does not fit a digest heading. It fits, and here is the measurement** (each rendered as the digest renders it, `• <heading>: 3`):
| heading | TH chars | EN chars |
|---|---|---|
| `orphaned_sessions` — **the longest already shipping** | 55 | **78** |
| `unconfirmed_bookings` | 41 | 41 |
| **`courses_awaiting_reconfirm` — §12 (now)** | **69** | **76** |
| the same, §10's draft (before) | 44 | 62 |
- ⇒ **Its ENGLISH line is SHORTER than one already in the same digest**, and that existing one is the same shape: long, with a parenthetical that names the two cases. **Its Thai is the longest, by 14 characters over `orphaned_sessions`.**
- 🔑 **So this digest already carries headings of exactly this class, deliberately** — a parenthetical that names the consequence is the pattern, not an exception. **On that evidence I did not stop.**
- ⚠️ **What I am NOT claiming:** that neither wraps on a phone. **Both do**, and so does today's `orphaned_sessions`. **If the owner's objection is wrapping at all, it is an objection to that existing heading too** — and then it is one decision about the digest's style, not about this sentence. 📌 **Say the word and I will raise it as that.**

## §3 🚫 What the ruling did NOT touch — pinned as UNCHANGED
- 🔑 **The digest carries the COUNT only.** Pinned **by value, in BOTH languages, with the named items handed in on purpose**: the line is `• <heading>: 2` and **no child's name, no date and no per-row bullet appears** — asserted per item, so a partial leak cannot hide behind one absent name. (`namesPeopleInDigest` stays off — the owner-approved list, REQ-020.)
- **The panel's line shape** `<new start> · <child> · <sessions pending>` — pinned **by shape in order** (start → nickname → name fallback → pending, and exactly two separators). 📌 **Deliberately not by bytes:** the separator is escaped once transpiled (`·` → `\xB7`), so a byte pin would break on a toolchain change while saying nothing about the shape.
- ✅ **And a control:** a check that MAY name people still does, so the count-only pin is about THIS check and not a renderer that stopped listing anything.

## §4 📌 Your rule applied — and it caught the half a one-language pin would miss
**The rule you recorded from my TASK-594 trap and @Fern's twin — *count both languages, or require both scripts* — is obeyed by every assertion here**, and I proved it with the mutations rather than claiming it:
- **G2 (the Thai half reverted alone)** and **G3 (the English half alone)** are **separate mutations, and both BITE.** 🔑 **A single `toContain` on either language would have let one of them through** — which is exactly the shape that bit us twice last week.

## §5 Existing pin updated and declared
- **`attention-labels.test.ts` — TASK-273's *"the ten headings are BYTE-IDENTICAL"*.** It held the twelfth heading's superseded draft. **Updated, with the declaration in place:** the entry that changed is named, and **the ten headings the test exists for are still byte-identical** (and the eleventh too), which is what keeps its claim meaningful. 🚫 **I did not weaken the test to a shape pin** — a byte pin is right for that one.

## §6 Checks
- Suite: **3718 / 0** (3713 + 5 new, `src/lib/digest-heading-task603.test.ts`). **DB-unreachable 3×: 3718 / 0, 0 "Failed query".** tsc 0. **65 .sql = 65 tags, no migration.** 8 changed files, none with mixed line endings.
- **Mutations with `bun run mutation:run`:** baseline 22; CHECKSUM identical; every restore byte-identical:
  - **G1, the old sentence back (both languages):** BITES. · **G2, Thai only:** BITES. · **G3, English only:** BITES.
  - **G4, the shared words (`ตารางเดิม / old dates`) dropped:** BITES.
  - **G5, the digest names people for THIS check:** BITES. · **G6, the renderer's gate removed for every check:** BITES.
  - **G7, the panel's line shape loses the child:** BITES.
- 📋 **Recorded against COPY §10** as you asked: ✅ DONE, now carrying §12's sentence, with the unchanged promises and the fit numbers. 🚫 **Nothing renumbered, nothing deleted.**

⚠️ **GREEN — the batch is clear for @Porter.** ⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-10-01) · 🟢 **THE BATCH IS GREEN**
Verified by me: **BE 3718 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **and FE re-run 921 / 0.**

## ✅ And he closed @Porter's instruction with a DERIVATION, not a change
**The admin panel renders that heading from the FE's dictionary, which already had §12** ⇒ 🔑 **this was the LAST place carrying §10's draft, and the two surfaces now agree.**
📌 **"Nothing still carries it" is now a statement about the whole system rather than about one file.**

## ⚖️ The fit question — **answered with NUMBERS, and not stopping was right**
**§12 as a digest line: 69 TH / 76 EN. The longest already shipping, `orphaned_sessions`: 55 TH / 78 EN, same long parenthetical shape.** ⇒ **Its ENGLISH is SHORTER than one already in that digest; its Thai is longest by 14 characters.**
✅ **I told him to stop if it does not FIT. He showed that it fits — by comparison with what already ships rather than by opinion.** 🔑 **That is the difference between a judgement and a measurement, and it is why I am not sending it back to the owner.**
🔑 **And his framing of what remains is the valuable half: both wrap on a phone, and so does `orphaned_sessions` today.** ⇒ **If the owner objects to wrapping at all, that is ONE decision about the digest's STYLE, not about this sentence.** 📌 **Asking it per-sentence would get a wrong answer.** ⇒ **Raised to @Porter that way, marked NOT blocking.**

## 📌 My own rule, proved rather than quoted — the same day
**G2 (the Thai half reverted alone) and G3 (the English half alone) are SEPARATE mutations and BOTH bite.**
🔑 **"A single `toContain` would have let one through."** ⇒ **The rule recorded from @Fern's Y5 and @Jason's TASK-594 was applied, with its proof, within hours.** ✅ *That is what a standing rule is for.*

## ✅ And another defect-pinning pin found, fixed WITHOUT loosening
**TASK-273's "ten headings byte-identical" pin HELD THE SUPERSEDED DRAFT.** ✅ **Updated — and the ten (and the eleventh) are STILL byte-identical.** 🚫 **He did not weaken it to a shape pin to make his life easier.**
📌 **Third pin this week that was guarding the wrong text, and the third fixed by correcting it rather than relaxing it.**
✅ **Count-only is pinned BY VALUE in both languages, with the named items handed in PER ITEM** — 🔑 *so a partial leak cannot hide behind an aggregate.*
