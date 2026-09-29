# TASK-574 — item 6: use the preview, the real date, and the reconfirm signal — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-30) · **Size S.** **@Jason's TASK-573 closed all three of your findings.** ⏸️ **Before TASK-572.**

## §0 ⚠️ First
**Re-read the front repo and say so.** 🚫 **Items 4, 9 and 11 are Palm's.**

## §1 The three things that now exist
1. **A read-only preview** over the act's own plan (`planStartChange`, lifted verbatim, writes nothing, same gate, same refusals). ⚠️ **It answers `forecast: true`.**
2. **`CourseSummary.startDate`** — the real field. 🚫 **The em dash goes; nothing is derived.**
3. **`reconfirm_needed_since`**, written only when the move un-confirmed something, **and the attention card shows from that moment.**

## §2 The work
- **Show the preview BEFORE the commit — the new dates and the skipped weeks, from the server's answer.** 🚫 **Nothing computed on the page.**
- 🔑 **`forecast: true` must reach the admin in words**: **the act checks clashes and each date's teacher gate again, so this can still be refused.** ⚠️ **Word it so a refusal after the preview is NOT a contradiction** — **you have done this once already, in TASK-547; use the same vocabulary.** *The two screens must not read as two different products.*
- ✅ **Use the real `startDate`.** ⚠️ **Check every other place the em dash or an invented date might still be** — 🔑 **TASK-545 removed the invention; the compiler found ONE reader. Say whether there are others.**
- ⚠️ **Say what the admin sees between the move and Confirm** — **the attention card is now the systemic catch; your on-screen warning is the immediate one.** 🔑 **Check they do not contradict each other**: *two warnings that describe the same state differently teach an admin to trust neither.*

## §3 The proof
🔑 **Clicked: the preview is fetched and rendered from the answer; the commit is a separate act; no commit before the admin confirms.** ✅ **And a preview that comes back refused BLOCKS, in the server's words** — as in TASK-547.
📋 **Drafts into `COPY-REVIEW-2026-09-29.md`, both languages, shape-pinned. 🚫 Code not held.**

## §4 Not in scope
🚫 The attention panel's own design · 🚫 Confirm-course · 🚫 Palm's items.

## Definition of Done
- [ ] Preview fetched and rendered **from the answer**, nothing computed · 🔑 **`forecast: true` in words, a post-preview refusal not a contradiction, TASK-547's vocabulary** · the real `startDate` used, **other invented-date readers named** · the two warnings checked for contradiction · 🔑 clicked, no commit before confirm, a refused preview blocks · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report + `inbox/SA.md` + log.

---

# 📤 REPORT — @Fern → @Sober (2026-09-30)

## §0 ✅ Front repo re-read first, and here is what changed under me
🚫 **I did not build on what I remembered.** Before touching anything I re-read `develop` in `smart-scheduler-front` (git **read** only) and the shared ground by file: the contract types, `mappers.ts`, the attention checks, `ChangeStartDateDialog.tsx` as I left it in TASK-571, and `dictionaries.ts`.
**Three things were there that were not there yesterday, all three @Jason's:** the **preview route**, **`CourseSummary.startDate`**, and **`courses_awaiting_reconfirm`**. 🚫 **Items 4, 9 and 11 untouched — not built, not reviewed, not tested.**

## §1 The preview — read from the answer, nothing computed
**The dialog is now two acts.** The admin picks a date and presses **"Check what would change"**; the page asks the preview route and renders **the server's own plan**: the moving rows (`{from} → {to}`), the expiry as **from → to**, **the skipped weeks**, and the reconfirm count.
🚫 **Nothing on the page predicts a date.** The only rule I wrote over the answer is *"show the rows that actually move"* — `forecastMoves` drops `from === to` and nothing else. **Pinned by ABSENCE:** the module may not contain `today`, `new Date`, `dayjs`, `addWeek` or `+ 7`. 🔑 **That pin is why the answer is the only source there can be.**
📌 **Narrowed one of my own TASK-571 pins, declared:** it used to forbid every `.filter(` in this module, which would have banned reading the answer at all. It now forbids **date arithmetic** by name. **What it protects — "the server's not-started rule is not re-implemented here" — is unchanged, and the door still has no dates in it.**

## §2 🔑 `forecast: true` in words — and TASK-547's vocabulary, literally
The act re-checks clashes and each date's teacher gate, **so a clean preview can still be refused.** The admin is told so **before** confirming, in one sentence:
> *"The server checks again when you confirm, so it may still refuse."* / *"ระบบจะตรวจอีกครั้งเมื่อกดยืนยัน จึงยังมีสิทธิ์ปฏิเสธได้"*
🔑 **That is TASK-547's approved Undo-preview caveat word for word, not a paraphrase** — and a test asserts the two strings are **`toBe`-EQUAL** in both languages. ⇒ **They cannot drift into two products without a red test.** The preview button says *"Check what would change"* and the forecast header says *"{n} sessions **would** move"*: nothing on that screen claims the move has happened.
✅ **And a refusal after the preview is an ordinary outcome, clicked:** the refused sentence appears verbatim and **the commit stays shut.**

## §3 ✅ The em dash is gone — and ⚠️ the answer to "are there others"
**The card shows the real `startDate`;** the dialog's hint says *"Currently {current}…"* instead of describing the field. `startUnknown` is **deleted**, not left unused.
⚠️ **Your question — did TASK-545's compiler net find ALL the invented-date readers, or just one? Answer: there was only ever one, and I proved it three ways rather than asserting it.**
1. **The literal pin on `dtoToCourseView` still holds** — no key in that mapper may have a literal value, so **no second invented date can exist in the mapper** at all.
2. 🔑 **`weekday` and `startTime` are STILL omitted from `CoursePackageView`.** They were the other two inventions. **While the `Omit` stands, the compiler forbids a reader** — so there is no silent second reader; there is only a future compile error, which is the design.
3. **A tree-wide sweep for the em dash** turned up only placeholders for fields that **are** genuinely nullable (no coach yet, no phone, no note). 🚫 **None of them stands in for a value the server knows.**
📌 **So the net caught everything it could catch, because it is a type, not a search.** *That is the whole argument for fixing the TYPE rather than the contract — and it is now checked, not claimed.*

## §4 ⚠️ The two warnings — checked, and they do NOT contradict (with one collision to settle)
**They describe one state at two distances:** the dialog's warning is the immediate one, the attention card is the systemic catch.
✅ **They agree because they share words, deliberately:** both say the family still holds the **OLD dates** (**ตารางเดิม**), and both name **Confirm course** (**ยืนยันคอร์ส**) as the act that ends it. **A test asserts both phrases appear in both strings in both languages** — 🔑 *two warnings describing one state differently teach an admin to trust neither, so agreement has to be pinned, not intended.*
⚠️ **Declared collision, not resolved by me:** `COPY-REVIEW-2026-09-29.md` **§10** already carries a shorter draft for this same row (*"Courses with a moved start date, awaiting re-confirmation"*) filed for the BE side, which I had not seen. **It is not wrong — it is silent about the consequence, and it does not share the words my pin needs.** I filed **§12** putting both wordings side by side for the owner to pick. 🚫 **I did not weaken the pin to accommodate it and I did not overwrite §10.**
📌 **And the thing worth keeping from @Jason's answer:** the card clears on Confirm-course **only when nothing is left pending — a skipped session keeps it.** 🔑 **That is exactly the case that would have emptied the panel while a family still held old dates.**

## §5 The proof — 🔑 clicked, at the boundary the server reads
**9 clicked tests** through the DOM harness, every one pressing the real controls:
- **The preview is fetched and RENDERED FROM THE ANSWER** — the rows on screen are the answer's rows, and a row the server said does not move is **not** shown.
- 🔑 **No commit before confirm:** with a date chosen and no preview asked for, **the commit button is disabled AND a pre-request return blocks it** — two guards, and the test asserts **zero requests to the commit URL**, not just a greyed button. *(A clicked test that presses a disabled button proves nothing — so the requests are split by URL and counted.)*
- 🔴 **A refused preview BLOCKS:** the server's sentence appears and the commit never opens.
- **A new date discards the forecast** — you cannot confirm a plan that was made for a different date.
- The skipped weeks, the expiry from → to, and the reconfirm block are all asserted **from the answer**.

## §6 🔑 Break-and-watch — `BASELINE=` (md5), every mutation in `try/finally`, CHECKSUM verified
| # | mutation | result |
|---|---|---|
| S1 | 🔴 the commit no longer needs a forecast (the preview becomes decoration) | ✅ 803/1 |
| S2 | the commit BUTTON opens without a forecast | ✅ 800/4 |
| S3 | a new date KEEPS the old forecast (a plan for a different date) | ✅ 19/1 *(see below)* |
| S4 | 🔴 the `forecast: true` caveat dropped (a post-preview refusal becomes a contradiction) | ✅ 801/3 |
| S5 | the caveat stops matching TASK-547's sentence (two products again) | ✅ 801/3 |
| S6 | the forecast lists rows the server said do NOT move | ✅ 802/2 |
| S7 | the skipped weeks dropped from the view | ✅ 803/1 |
| S8 | ✅ the em dash comes back instead of the real date | 🔴 **SLIPPED first — re-pinned, now bites** |
| S9 | the mapper stops carrying the real start date | ✅ 801/3 |
| S10 | the attention card's words drift from the dialog's | ✅ **caught (19/1)** — my runner mislabelled it |

**CHECKSUM: every one of the four files back to its baseline md5 — verified per mutation.** Nothing is left mutated.

### 🔴 S8 — the slip, and what it taught
**Removing the real date and putting the em-dash string back passed 804/0.** Cause: I had pinned the **card** for the real date and not the **dialog's hint**, so the hint could silently regress to *"what the field is"* while the card still looked right. ✅ **Closed by pinning the dialog's own `newStartHintCurrent` call with `formatDateDisplay(course.startDate)` at the source.** 📌 **The lesson is the one I keep re-learning: a value that appears in two places needs two pins, because "the feature works" is checked at whichever place I happened to test.**

### ⚠️ S3 and S10 — a RUNNER defect I want on the record, because it faked ten greens
**My first full pass reported all ten rows INCONCLUSIVE or slipped, and the reason was not the code:** `execSync`'s default **1 MB `maxBuffer`** against a suite that now prints **~6.9 MB** — the child was killed mid-run, so **no summary line was ever produced.** 🔑 **This is TASK-571's R6 lesson arriving with a different cause: a run that prints no summary is not a green — it is a run that did not happen.** ✅ **Fixed:** `maxBuffer` raised to 256 MB, and the runner now **trusts the counts** (`N pass` / `N fail`) instead of extracting failure names — S10 was mislabelled "slipped" while the counts plainly read `1 fail`. **S3 and S10 were then each re-run alone and both bite.**
📌 **Two keepers for `SYSTEM-FACTS.md` if you want them:** the buffer limit is a **silent** failure mode that looks exactly like a pass, and **counts are the truth, names are a convenience.**

## §7 Verification
**804 pass / 0 fail across 86 files, 5942 `expect()` calls** (was 796 ⇒ **+8 tests**) · **`bunx tsc --noEmit` clean** · **`bun run build` ok** — all three re-run **after** the mutation pass restored the files, so the numbers above are the restored tree's.
🚫 No SQL, no database, no environment touched · no BE change asked for · **no deploy requested** · Confirm-course, the money and Palm's items untouched · **git read only, never written.**
📋 **6 drafts filed into `COPY-REVIEW-2026-09-29.md` §11–§12** (5 preview strings + the card, both languages, shape-pinned, marked `DRAFT (Fern, TASK-574)`), **1 retired (`startUnknown`)**. 🚫 **Code not held for approval.**
⚠️ **Not proven by me:** CSS, focus order and a real tap · the preview route's own correctness (it is @Jason's, lifted verbatim from the act — I assert only that I render its answer and compute nothing) · and **§4's collision is the owner's choice, not mine.**

**Ball: @Sober.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30)
Verified by me: **804 pass / 0 fail** across 86 files · tsc 0 · build ok.

## ✅ The clicked proof learned from TASK-566's slip
**No commit before confirm, asserted as ZERO requests to the COMMIT url** — 🔑 **she split the requests by url and counted them, because a clicked test that presses a disabled button proves nothing.** *Her own lesson from three tasks ago, applied without being reminded.*
✅ **A refused preview BLOCKS, and a NEW DATE DISCARDS THE FORECAST** — 🔑 **you cannot confirm a plan made for a different date.** *That case was in neither the task nor the server's contract; it is the one an admin would actually hit.*

## ✅ My question answered three ways instead of asserted
**There was only ever ONE invented-date reader:** (1) the literal-free pin on `dtoToCourseView` forbids a second invented date · (2) 🔑 **`weekday` and `startTime` are STILL omitted, so the compiler forbids a reader — there is no silent second one, only a future compile error, which IS the design** · (3) a tree-wide em-dash sweep found only placeholders for genuinely nullable fields.
🔑 **"The net caught everything it can catch because it is a TYPE, not a search."** ⇒ 📌 **That is the argument for TASK-545's ruling, stated better than I stated it.**

## ✅ The two warnings agree, and the agreement is PINNED
**Both say the family still holds the OLD dates (ตารางเดิม) and both name Confirm course (ยืนยันคอร์ส), asserted in both strings in both languages.**
🔑 **Pinned, not intended.** *Two warnings that agree today are two that diverge the first time one of them is edited.*

## ⚖️ The copy collision — **her handling is right; the wording goes up, the PIN is mine**
**`COPY-REVIEW` §10 already carried a shorter draft for that attention row, filed for the BE side.** ✅ **She did not weaken her pin to fit it and did not overwrite it — she filed §12 with both side by side.**
⚖️ **My ruling on the engineering half: whichever wording wins, the agreement pin must hold on a SHARED word.** **If the short row wins, move it to ยืนยันใหม่ / re-confirm, exactly as she offered.**
📌 **My recommendation up the chain: the short wording for the LIST ROW, hers for the SCREEN.** 🔑 **A one-line attention row is an index, not an explanation — the consequence belongs where the admin acts, not where they scan.**

## 🔴 Her slip — and the rule it produced
**Restoring the em-dash string PASSED 804/0, because she had pinned the CARD and not the DIALOG'S HINT.**
🔑 **"A value shown in two places needs two pins, because 'the feature works' gets checked wherever I happened to look."** ✅ Re-pinned at the source. **Recorded.**

## 🔴 The runner defect — **this one reaches backwards, and I am acting on it**
**`execSync`'s default 1 MB `maxBuffer` against ~6.9 MB of suite output killed the child mid-run, so no summary was ever printed — and her runner read that as a pass. TEN faked greens.**
🔑 **TASK-571's R6 lesson arriving with a COMPLETELY DIFFERENT CAUSE.** ⇒ **The rule is not about focus traps; it is about absence: a run that prints no summary is not a green.**
✅ **Fixed (256 MB), and the runner now trusts the COUNTS rather than extracting failure names** — one row had been mislabelled "slipped" while the counts plainly read `1 fail`. 🔑 **Counts are the truth; names are a convenience.**
⚠️ **The part she did not raise and I am raising: HOW FAR BACK does this reach?** ⇒ **Rider on her next task: derive at roughly which task the suite output crossed 1 MB, and therefore which earlier break-and-watch tables are SUSPECT.** 🚫 **Do not re-run them yet — tell me the list.** *I have accepted those reports; I would rather know they are sound than assume it.*
🔴 **And the same question goes to @Jason immediately: his suite is more than four times the size of hers.**
