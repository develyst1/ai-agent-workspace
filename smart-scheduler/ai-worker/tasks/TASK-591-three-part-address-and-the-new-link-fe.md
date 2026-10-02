# TASK-591 — the page sends three address parts, and the new link contract — FE, S/M

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-30) · ⏸️ **After TASK-589.** 🔴 **Ships WITH @Jason's TASK-590 — neither works alone.**

## §0 ⚠️ First
**Re-read the front repo and say so.** 🚫 **Palm's items 4, 9, 11.**

## §1 The address
- **The owner ruled: province + district + sub-district. Province alone must not pass.** ✅ **The page must SEND all three picked names.**
- 🔑 **The server checks the SHAPE only — three non-empty parts and a real province.** ⚠️ **It does NOT check that the district belongs to the province.** ⇒ **Do not word anything as if it did.**
- ⚠️ **A household whose stored address has only a province is asked again — never blocked.** 🔑 **Word it so it does not read as "we lost your address"** — *it was valid when they gave it.*

## §2 The link contract
**@Jason's half changes when the LINE binding happens: a parent is bound only when their FIRST CHILD is accepted, all in one transaction.**
- ⚠️ **He is writing the new contract as a block — build against that statement, not against a diff.**
- 🔑 **What a parent sees if the child is rejected must be honest: nothing was created, and they are still where they were.** 🚫 **No half-linked screen.**

## §3 The shared refusal
✅ **The duplicate-name refusal now arrives FROM THE SERVER with both languages in the body.** ⇒ **Render what it sends.** 🚫 **Do not keep a local copy of those words** — 🔑 **the whole point is one sentence from one source.**

## §4 The proof
🔑 **Clicked: a two-part address does not submit · three parts do · a legacy household is asked and the ask does not read as a loss · and a rejected child leaves the parent unlinked and unchanged.** ✅ **Assert the REQUESTS.**

## Definition of Done
- [ ] Three parts sent, two refused before the request · the geography limit **not implied anywhere** · the legacy ask worded as an ask · the new link contract honoured, **nothing half-linked, pinned** · the refusal **rendered from the server**, 🚫 no local copy · drafts filed · 🔑 clicked, asserting the requests · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch, CHECKSUM · report + `inbox/SA.md` + log.

---

# 📤 REPORT — @Fern → @Sober (2026-09-30)

## §0 ✅ Front repo re-read first
🚫 Not from memory. Tip still `ffa8e9f`. I built against **@Jason's §3 contract BLOCK**, not a diff — the three routes, the new codes, what `/link` writes (nothing, on a new phone) and what `/create` now takes. I also read his §1 and §2 for the two things the block does not say: **the SHAPE-only check** and **what a mid-transaction rejection leaves behind (nothing).** 🚫 Palm's items 4, 9, 11 untouched.

## §1 The address — three parts, and one mode
- **The page sends `province` + `district` + `subDistrict`, the picked names.** 🚫 **The pre-joined line is gone from the wire** — the server builds the stored string itself. *The join survives for one job: the confirm screen's echo, which is display.*
- 🔴 **The typed address mode is REMOVED, and its absence is the contract.** A typed line has no province ⇒ **it could only ever produce a body the server refuses.** 🚫 Removed rather than disabled: *a control that cannot succeed is worse than no control.* ⚠️ **And a dataset that fails to load now leaves the pickers disabled and the submit shut** — honest, because without the list we cannot produce an address the server will accept. 📌 **The BIRTHDAY's type-instead toggle is untouched** — that one still produces exactly what the server reads.
- **Two parts do not submit:** `addressComplete` requires all three, the button is disabled **and** `submitCreate` returns — the two guards, and both are pinned.
- 🔑 **`ADDRESS_INCOMPLETE {missing}` is used for what it is worth: the words NAME the part.** *"We still need the sub-district" is a different sentence from "that is wrong", and only one of them tells a parent what to do.*
- ⚠️ **The geography limit is not implied anywhere.** The server checks three non-empty parts and a real province; 🚫 **it does not check that the district belongs to the province**, and no string of mine says or hints otherwise (pinned by absence in the copy entry).

## §2 The link contract — nothing half-linked, because nothing is written
**`/link` on a new phone writes nothing**, so the page no longer calls it there: it **keeps the phone and goes to the form**, and **`/create` carries it** — the family and the first child in one transaction.
🔑 **That is D11's cause removed, not worked around:** the old flow created the parent at the phone step, which is how a family could exist with no child. ⇒ **A rejected child now leaves the parent exactly as they were: unlinked, still on the form, with the refusal on screen.** Pinned by a clicked test that asserts **one `create`, no `link`, and no move to a linked screen.**
✅ **`PHONE_NOW_REGISTERED`** sends them back to the phone step with the server's reason — *someone else registered that number between our check and this save; nothing of ours was written.*
🔑 **And the phone is a ONE-SHOT:** cleared once the family exists, proven by a clicked second child whose body carries **no phone and no address** (it is on file now).
⚠️ **One race I handled rather than cast away:** `/link` from the "found" screen can also answer `"new"` (the family could be archived between the lookup and the tap). **Same path as the phone step**, instead of a type assertion.

## §3 The shared refusal — one sentence, one source
**The duplicate-name refusal now arrives from the server with both languages**, so the page renders `message.TH` / `message.EN` and 🚫 **keeps no copy at all** — not even as a fallback, *because a fallback is a second source.*
📌 **That one sentence has had three homes in three rounds** — the chat's words, an approved reword held locally (TASK-577), and now the server's body. **The drift is exactly why it moved**, and I have said so in the code, the pin and the copy entry.
⚠️ **Declared: this REVERSES a pin of ours** — *"no server `message` is ever rendered — the page owns the words"*. It was right while the server sent codes only. ✅ **The pin now states the rule precisely: every OTHER code's words are the page's, and a `message` is rendered only when one is sent.**

## §4 The proof — 🔑 clicked, asserting the requests
**8 new clicked tests** (17 in that file now): two parts ⇒ **the door is shut and pressing it sends nothing** · three parts ⇒ **the body carries the three names AND the phone** · 🔴 **a new phone writes nothing at the phone step — `sent` is exactly `["status","lookup"]`, no `link`** · 🔴 **a rejected child ⇒ one `create`, no `link`, still on the form** · the legacy ask appears **for a linked family and NOT for a new one** · `ADDRESS_INCOMPLETE` **names the part** · `PHONE_NOW_REGISTERED` **returns to the phone** · and **a second child's body carries no phone and no address.**
📌 **Two test-craft fixes on the way, both worth keeping:** the address pickers are selected **by position, not by label** — *Mantine puts the required asterisk inside the label and two of the page's strings start with the word "Province", so a label query matched prose as well as a control*; and the refusal box now carries **`data-failure={code}`**, so a test names WHICH refusal it is reading instead of hunting for text that is also a field label.

## §5 🔑 Break-and-watch — 11 mutations, all BITE, two after their missing halves were added
`scripts/mutation/task-591.json` · **BASELINE 99/0, 563 B green** · **CHECKSUM identical** on both runs.

| # | mutation | verdict |
|---|---|---|
| W1 | 🔴 two address parts are enough to submit | ✅ BITES 97/2 |
| W2 | 🔴 the district and sub-district stop riding | ✅ BITES 96/3 |
| W3 | 🔴 the unlinked account's phone stops riding | ✅ BITES 98/1 |
| W4 | 🔴 the page writes at the phone step again (**D11's cause**) | ✅ BITES 96/3 |
| W5 | 🔴 the duplicate refusal goes back to a local sentence | ✅ BITES 98/1 |
| W6 | 🔴 the server's `message` is ignored | ✅ BITES 97/2 |
| W7 | ⚠️ `ADDRESS_INCOMPLETE` stops naming the part | ✅ BITES 97/2 |
| W8 | ⚠️ the legacy ask reads as a LOSS | ✅ BITES 98/1 |
| W9 | the legacy ask is shown to a brand-new family too | ✅ **BITES 74/1 at the source** (the DOM run of that mutant **crashes Bun** — exit 9, no summary) |
| W10 | 🔴 `PHONE_NOW_REGISTERED` is swallowed | ✅ BITES 98/1 |
| W11 | the phone keeps riding after the family exists | ✅ **BITES 16/1 — after a second-child test was added** |

### ⚠️ What the first pass found in my own tests
- **W11 survived because no test added a SECOND child.** ✅ Closed by clicking one: its body carries **no phone and no address**. 📌 *The rule said "the phone rides for the first child and never again", and nothing had ever asked for the second.*
- **W9 survived because my legacy test proved the sentence APPEARS and never that it is ABSENT for a new family** — *half a rule is not a rule.* ✅ Both halves asserted now.
- ⚠️ **And W9's re-run met the crash again: that mutant takes Bun down (exit 9, 28 bytes, no summary).** ✅ **Reason fixed rather than the row — pinned at the source, where it bites 74/1.** 🔑 **Fourth cause, same rule: overflow · hang · crash · and now a crash on a different mutant.** *Every time, the fix has been the reason and a source pin — which is why the rule is still worth something.*

## §6 Verification
**896 pass / 0 fail across 93 files** (was 886/93 ⇒ **+10 tests**) · **tsc clean** · **`bun run build` ok** · **`bun run mutation:prove`: all five cases still hold** · both mutation runs **CHECKSUM identical**.
🚫 No SQL, no database, no environment · **no BE change** · no deploy request · git read only.
📋 **7 drafts + 1 changed string filed as `§T-591`** — 🔑 **the first entry under your new numbering rule**, and it links to @Jason's §18 rather than competing with it.
⚠️ **Declared: ELEVEN existing pins updated, none weakened.** The code list (+2), the *"no server `message`"* pin (**reversed for one code, argued in the pin**), the omitted-key pin (five fields now, `address` gone), AC-9 (third round for that sentence), the `lang` occurrence count (3 → 6, all still rendering), §8b's `pickedProvince` line, §4 nit 2 (**no typed mode left to instruct**), §9 (**the parts travel, the join is display**), the escape-hatch pin (**inverted: there is no typed mode**), the dynamic-load pin, and `formComplete` (**all three parts**).
🔴 **DEPLOY: this ships WITH @Jason's TASK-590.** Neither half works alone — the page sends fields the old server ignores, and the new server refuses a two-part address the old page would still send.
⚠️ **Not proven by me:** CSS, focus and a real tap · the dataset's own correctness · **and the district-belongs-to-province gap is the server's stated limit, not something I can close from here.**

**Ball: @Sober.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · **the round's last piece**
Verified by me: **896 pass / 0 fail** across 93 files · tsc 0 · build ok.

## ✅ §3 — one sentence, one source, and 🚫 not even a fallback
**Rendered FROM THE SERVER, both languages in its body, and the page keeps NO copy** — 🔑 ***"not even a fallback, because a fallback is a second source."***
📌 **Three homes in three rounds** (the chat's words → an approved reword held locally → the server's body) **and the DRIFT is why it moved** — written into the code, the pin AND the copy entry.
⚖️ **She declared that this REVERSES our own pin** (*"no server `message` is ever rendered — the page owns the words"*) **and narrowed it rather than deleting it: every OTHER code's words are still the page's.**
✅ **Ruled: correct.** 🔑 **That pin was right while the server sent codes only. When the server began carrying an OWNER-APPROVED sentence, the rule's reason changed** — *and a rule whose reason has changed gets a new reason or goes.* **She gave it the new one, in the pin.**

## 📌 Two test-craft fixes worth keeping
**Pickers are chosen BY POSITION, not by label** — *Mantine puts the required asterisk inside the label, and two of the page's strings start with "Province", so a label query matched prose as well as a control.*
**And the refusal box carries `data-failure={code}`** ⇒ 🔑 **a test now names WHICH refusal it is reading instead of hunting for text that is also a field label.** 📌 **Assert the IDENTITY of a refusal, not its wording — the wording is the owner's and will change.**

## ⚠️ §5 — two rows exposed missing halves in her own tests
**W11 survived because NO TEST ADDED A SECOND CHILD** — *the rule said "never again" and nothing had ever asked.*
**W9 survived because the legacy test proved the sentence APPEARS and never that it is ABSENT for a new family.**
🔑 ***"Half a rule is not a rule."*** ✅ **Both closed.** **Recorded.**
⚠️ **And W9's re-run met the crash again — that mutant takes Bun down (exit 9, 28 B, no summary).** ✅ **Reason fixed, not the row; pinned at the source where it bites 74/1.**
🔑 **Fourth cause, same rule: overflow · hang · crash · crash** — *and every time the fix has been the reason plus a source pin, which is why the rule still means something after four failures of the tool meant to prove it.*

## 🔴 The deploy coupling, stated in both directions
**The page sends fields an OLD server ignores, and a NEW server refuses the two-part address an OLD page would still send.** ⇒ **They ship together.** 📌 **That is a proper coupling statement: not "they are related", but what breaks in each direction.**
✅ **Eleven pins updated, none weakened**, including the reversed one argued IN the pin. 📋 **Filed as `§T-591` — the first entry under the new numbering, LINKING to @Jason's §18 rather than competing with it.**
