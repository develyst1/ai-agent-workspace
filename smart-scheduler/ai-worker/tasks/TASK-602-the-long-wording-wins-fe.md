# TASK-602 — §12: the long wording wins — FE, XS/S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-10-01) · **The owner ruled §12.**

## §0 ⚠️ First
**Re-read the front repo and say so.** 🚫 **Palm's items 4, 9, 11.**

## §1 The ruling
**The LONG wording wins — yours.** ✅ **And the agreement pin on *ตารางเดิม / old dates* STAYS.**
🔴 **§10's shorter draft is SUPERSEDED: make sure nothing still carries it.**
- ⚠️ **Derive what carries §10's text.** 🔑 **It was filed for the BE side (the digest heading), so if the string lives there, STOP and tell me** — **that is @Jason's, not yours.**
- ✅ **Where it is yours, replace it and keep the agreement pin holding** — **the row and the on-screen warning must still share *ตารางเดิม* and still name *Confirm course*, now in the long wording.** 🔑 **The pin was never about which draft won; it was about the two never drifting apart.**
- 📌 **Mark §10 in the copy file as SUPERSEDED BY §12** — 🚫 **do not delete it.** *A superseded draft that vanishes reads as an oversight; one marked superseded reads as a decision.*

## §2 The proof
🔑 **Both surfaces assert the long wording, in both languages, and the agreement pin still bites** — ✅ **re-run the mutation that makes them disagree.**

## Definition of Done
- [ ] The long wording on every surface that is yours · 🔴 **§10's text derived, and STOPPED if it lives in the backend** · the agreement pin **still biting**, re-run and named · §10 marked **superseded, not deleted** · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch, CHECKSUM · report + `inbox/SA.md` + log.

---

# 📋 REPORT — @Fern → @Sober (2026-10-01)

**Repo:** `smart-scheduler-front` (working tree). **§0: I re-read the front repo before starting** — the `attention.checks` and `courseStart` blocks in both languages, `AttentionContent.tsx`, and the agreement pin in `course-start.test.ts`. 🚫 **Palm's items 4, 9, 11 untouched.**

**Suite 921 pass / 0 fail across 96 files · `tsc --noEmit` 0 · `bun run build` ok · Break-and-watch 6/6 BITES, CHECKSUM identical.**

## §1 ✅ The long wording was already the only one in the front repo
**Nothing in the FE code had to change for the ruling itself.** Both languages carry §12's wording and have since TASK-574:
- `Courses moved but not re-confirmed (the family still has the old dates)`
- `คอร์สที่เลื่อนแล้วแต่ยังไม่ได้ยืนยันใหม่ (ลูกค้ายังถือตารางเดิม)`
**Derived, not assumed:** §10's sentence (`รอยืนยันใหม่` / `awaiting re-confirmation`) appears **nowhere** in `smart-scheduler-front`, and **nowhere in `smart-scheduler-backoffice-front`** either — I searched both repos that are mine.

## §2 🔴 §10's text LIVES IN THE BACKEND — so I stopped
**It is @Jason's, in two places (read-only grep, nothing touched):**
- `smart-scheduler-back/src/lib/line-i18n.ts:105-107` — the LINE digest's heading for `courses_awaiting_reconfirm`, **TH and EN**, in §10's superseded words.
- `smart-scheduler-back/src/lib/attention-labels.test.ts:90-92` — **pinned** there, so changing the string alone would turn that suite red: **the pin has to move with it.**

⚠️ **And the consequence is worth stating plainly, because it is the thing §12 exists to prevent.** The panel row and the digest heading are **the same check key** (`courses_awaiting_reconfirm`) **on two surfaces**, and they now say **different sentences for one state**: the panel says the family still holds the old dates; the digest does not. 🔑 ***Two warnings describing one state differently teach an admin to trust neither*** — that was the whole argument of §12, and it is still half-true in the digest.
📌 **The FE prefers its own label and only falls back to the API's title** (`AttentionContent.resolveTitle`), so the panel is safe either way — **the digest is the surface that still carries the superseded wording.** 🚫 **Not mine to change. Reported, not built.**

## §3 ✅ The agreement pin — still holding, and harder to narrow
**The claim is unchanged:** for **both** languages, the dialog's `warnStale` and the card label both name the **OLD dates** the family still holds; the dialog also names **Confirm course** as the act that ends it, and the card names **re-confirm**. 📌 ***The pin was never about which draft won; it was about the two never drifting apart*** — so the ruling did not weaken it, and I added three things rather than resting on it:
1. **The superseded wording is refused BY NAME**, in both languages ⇒ adopting §10's draft on this surface fails here even though every pattern assertion would still pass.
2. **The languages examined are themselves asserted** (`expect(checked).toEqual(["en", "th"])`) ⇒ 🔑 *a pin quietly narrowed to one language is a weaker pin, silently.* **Y4 proves it: narrowing the loop now bites.**
3. **The record is pinned as APPROVED**, so it cannot drift back to reading as my draft.

## §4 📝 The record: §12 is APPROVED, §10 is SUPERSEDED (kept)
- **In the code:** the two §12 strings' markers now read **`✅ APPROVED (owner 2026-10-01, §12 — the LONG wording)`** instead of `📝 DRAFT (Fern, TASK-574)`, with §10's superseded sentence written out beside them so the next reader does not have to find this report.
- **In the copy file:** **§12 marked APPROVED**, **§10 marked ⛔ SUPERSEDED BY §12 and NOT deleted** — with a note that its line-shape and "count only in the digest" promises are untouched by the ruling, and that its heading sentence still lives in the backend.
- ⚠️ **One thing I did NOT do, deliberately:** the ruling also said *"all other sections are approved as drafted"*, and **27 other `📝 DRAFT (Fern, …)` markers** still stand in `dictionaries.ts`, several of them pinned by name. **That is a mechanical sweep across the whole dictionary and its pins — not this task.** 🔑 **Say the word and it is one.** Until then the markers understate what the owner has approved, which is the safe direction to be wrong in.

## §5 Break-and-watch — 6 mutations, 6 BITES, CHECKSUM identical

| # | mutation | verdict |
|---|---|---|
| Y1 | 🔴 the card adopts §10's superseded draft, both languages | **BITES** 22/1 |
| Y2 | 🔴 §10's draft adopted in **Thai only** — the half-drift | **BITES** 22/1 |
| Y3 | 🔴 the dialog's warning loses the shared words (TASK-571's R2, **re-run**) | **BITES** 21/2 |
| Y4 | ⚠️ the pin is quietly narrowed to English | **BITES** 22/1 |
| Y5 | the record drifts back to DRAFT though the owner ruled | **BITES** 22/1 |
| Y6 | the card label is emptied | **BITES** 22/1 |

⚠️ **Two rows had to be earned, and both are mine to own:**
- **Y4 and Y5 first came back `ANCHOR AMBIGUOUS ⇒ NOT RUN`** (3 hits and 2 hits). 🔑 **Not a verdict and not a colour** — the anchors were rewritten to be unique and both then ran. 📌 *An ambiguous anchor is the runner refusing to guess which line I meant, which is exactly what I want it to do.*
- **Y5 then SURVIVED, and the reason is the same mistake this whole task is about.** My marker pin read `toContain("✅ APPROVED (owner 2026-10-01, §12")` — and **the Thai line carries the same prefix**, so deleting the English marker left the assertion satisfied by the other language. ⇒ 🔑 ***one source standing in for another is the bug the agreement pin exists to catch, and I had written it into the pin itself.*** It counts **both** markers now (`=== 2`), and Y5 bites.

## Files
- **Record only (no behaviour):** `src/lib/i18n/dictionaries.ts` — the two §12 markers now say APPROVED, with §10's superseded sentence written beside them.
- **Pin:** `src/lib/scheduler/course-start.test.ts` — the superseded wording refused by name, the languages examined asserted, both APPROVED markers counted.
- **Copy file:** §12 → APPROVED · §10 → ⛔ SUPERSEDED BY §12, kept.
- **Mutations:** `scripts/mutation/task-602.json` (Y1–Y6).

---

# ✅ DONE — REVIEWED by @Sober (2026-10-01)
Verified by me: **FE 921 / 0** across 96 files · tsc 0 · build ok. ✅ **BE re-run too: 3713 / 0.**

## ✅ §10 handled with more precision than I asked for
**Kept, marked ⛔ SUPERSEDED BY §12 — and she narrowed WHAT was superseded: only its HEADING SENTENCE.** ✅ **Its line shape and the "count only in the digest" promise still stand.**
🔑 **That is the right kind of care: a wholesale "superseded" would have quietly retired two promises the owner never ruled on.** ✅ **And she recorded that the sentence LIVES IN THE BACKEND and did not reach across.** ⇒ **Exactly as instructed** — **and it leaves one line for @Jason, which I am cutting now rather than calling the batch complete.**

## 🔴 Y5 — **the pin guarding against cross-language substitution was itself satisfiable by the other language**
**Her marker pin used `toContain("✅ APPROVED (owner 2026-10-01, §12")` — and the THAI line carries the same prefix** ⇒ **deleting the ENGLISH marker left the assertion satisfied BY THE OTHER LANGUAGE.**
🔑 ***"One source standing in for another is the bug the agreement pin exists to catch — and I had written it into the pin itself."***
📌 **Self-caught, and it is the same shape as @Jason's *"identical in TH and EN" passes a Thai-only string* from TASK-594.** ⇒ **Two instances, two engineers, one week: a bilingual assertion is satisfied by one language unless BOTH are counted.** ✅ **Both markers are counted now, and it bites.** **Recorded.**

## ✅ Y4/Y5's first run — the runner refused to guess, and that is right
**`ANCHOR AMBIGUOUS ⇒ NOT RUN`** — 🔑 **not a verdict, not a colour.** ✅ **"An ambiguous anchor is the runner refusing to guess which line I meant, which is exactly what it should do."**
📌 **Seventh distinct non-verdict this stretch, and the first that is the tool being CORRECT rather than failing.** 🔑 **That is what the rule was for: NO RESULT must be reachable on purpose, not only by accident.**

## ⚖️ Her flag about the other 27 markers — **ruled: yes, but not here and not now**
**The owner's ruling said "all other sections are approved as drafted", and 27 `📝 DRAFT (Fern, …)` markers still stand, several pinned by name.**
✅ **She was right not to fold it in: it is a dictionary-wide mechanical sweep touching many pins.**
🔑 **And her reasoning settles the urgency: "the markers understate what the owner approved, which is the safe direction to be wrong in."** ⇒ **It does not hold the batch.** ⇒ **TASK-604, queued.**
