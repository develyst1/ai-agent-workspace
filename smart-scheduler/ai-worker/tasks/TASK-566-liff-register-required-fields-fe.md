# TASK-566 — REQ-110 item 10: the LIFF register form — FE, M

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-29) · **Size M.** The screen half of item 10. **@Jason's TASK-565 has landed.**

## §0 ⚠️ Before you start
**Re-read the front repo and say so** — **Palm commits through the owner's git.** 🚫 **Items 4, 9 and 11 are his.**

## §1 What the server now does
- **Every field required.** **Birthday per child** (blank, absent, or the word ข้าม ⇒ `BIRTHDATE_REQUIRED`). **Address once per household** (picked province + line ⇒ else `ADDRESS_REQUIRED`).
- 🔑 **`addressOnFile` + `province` now ride on status / link / create, and CREATE RETURNS THE NEW STATE** ⇒ **after adding one child, the form already knows the household has an address. Do not ask again, and do not re-fetch to find out.**
- ✅ **A household that only ever typed its address in the CHAT will be asked once more** — **by design.** 🔑 *An address we cannot show back to the parent is not one we collected.* ⚠️ **So the ask must not read as "we lost your address".**

## §2 The work
- **Every field marked `*`, and the form cannot proceed until each is filled.** 🚫 **The "ข้าม" path goes.** ⚠️ **Find every place it is offered** — a button, a link, a hint, a placeholder. 🔑 **A skip that survives as a hint is still an invitation.**
- 🔴 **`BIRTHDATE_INVALID` currently says *"or leave it blank"*, and that is now FALSE.** ⇒ 🔑 **A refusal telling a parent to do something the server rejects is worse than no message.** **Fix the words; 📋 draft into `COPY-REVIEW-2026-09-29.md`.**
- 📋 **The reworded duplicate-name refusal is PAGE copy** — **@Jason drafted it in §8; put it on the screen.** 🔑 **It must ask for the child's REAL name**, which is what the owner ruled.
- ⚠️ **The address ask, when the household already has one, must not appear at all** — 🚫 **not disabled, not prefilled-and-locked. Absent.** *A field you cannot use is a question you are still asking.*

## §3 The proof
🔑 **Clicked: with every field empty, the form does NOT submit** — **assert that NO request goes out**, not merely that a button looks disabled (TASK-564's two-guard lesson).
✅ **And a second child in the same household: assert the address field is ABSENT and the request carries no address.**
⚠️ **Assert the REQUEST, never only the screen** — your own TASK-559 rule.

## §4 Not in scope
🚫 The chat wizard (raised to the owner separately) · 🚫 the admin add-student form · 🚫 Palm's items.

## Definition of Done
- [ ] All fields `*` and blocking · 🚫 **every ข้าม offering found and removed, including hints** · `BIRTHDATE_INVALID` reworded · the duplicate refusal on the page, asking for the real name · **the address field ABSENT for a household that has one** · 🔑 **clicked: empty form ⇒ NO request; second child ⇒ no address in the body** · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-29): the LIFF register form — every field required, the address asked once · **775 / 0** (was 761 · +14) · tsc 0 · build ok · 🔴 **four of my own mutations SLIPPED on the first pass; all ten bite now, and that is the report's centre**

## §0 ✅ The front repo, re-read — and said
`git log`: newest commits are the owner's (`dev`) carrying my work; **newest outside-chain commit still `c8e9639` (`neeeeroooo`, 09-22)**. Working tree: only my own files. **761/0 across 82 files** at the start (TASK-563 changed nothing, as reported). 🚫 **Items 4, 9 and 11 (Palm's): not opened.**

## §1 🔴 The four slips, and what each one taught
**I ran the break-and-watch before writing this, and four mutations passed.** None was a meta-mutation; **all four were holes in my tests**, and the fourth is the one worth keeping:
| # | mutation that slipped | why my clicked test could not see it | the pin that now catches it |
|---|---|---|---|
| Q3 | the **pre-request guard** removed (`if (!formComplete) return;`) | the clicked test presses a **disabled** button, so removing the second guard changes nothing it can observe | a source pin on both guards — **TASK-564's two-guard lesson needed a two-guard pin** |
| Q6 | the create's answer **ignored** ⇒ the next child is asked again | the clicked test stops after **one** child | source pins on all three sources (`/status`, `/link`, the create's own answer) |
| Q7 | *"or leave it blank"* **back** in `BIRTHDATE_INVALID` | no copy pin existed for the register block at all | a copy pin, both languages, by absence |
| Q8 | *"(optional)"* **back** in the birthday placeholder | 🔑 **`textContent` does not include attributes — a placeholder is an attribute.** My "no optional anywhere" check was reading a surface that never contained the string | a copy pin per placeholder, **and** the DOM check now reads `placeholder` / `aria-label` / `title` too |

🔑 **Q8 is TASK-563's own rule biting its author one layer over:** *a screen assertion is only as good as what the screen exposes.* 📌 I have written that into the new test file's header, where the next person meets it.
⚠️ **Q8 is still caught by the COPY pin rather than by the click** — the typed-date field is only on screen after *"Type it instead"*, and I did not add a click for that purely to duplicate a check the copy pin makes better. **Saying which net caught it matters more than pretending both did.**

## §2 The work
- **Every field required, and the address only while the household has none:** ONE expression (`formComplete`), read by **three** doors — Continue, Confirm, and the pre-request guard in `submitCreate`.
- 🚫 **Every ข้าม offering is gone**, and I looked for all four shapes the task named: a **button** (none existed on the page), a **link** (none), a **hint** (`birthDatePlaceholder`, `dobPickPlaceholder`, `provincePlaceholder` all said *(optional)* / *(ไม่บังคับ)* — **replaced with what to type**), and a **word for the state** (`reviewSkipped` = *"(skipped)"* / *"(ข้าม)"* — **deleted, not reworded**: a label for a state that cannot happen is how the state comes back).
- 🔑 **The address question is ABSENT when one is on file** — not disabled, not prefilled-and-locked — and in its place a line saying we already have it, **with the province the server sent**, because *an address we cannot show back is not one we collected.* ⚠️ Worded so being asked again (a chat-only address has no province stored) **does not read as "we lost it"**: it says *"we already have your address on file"* when we do, and simply asks when we do not.
- 🔑 **The state is learned from answers we already have** — `/status`, `/link` and **the create's own response** — 🚫 **never a second request.**
- 🚫 **Nothing rides that the server would ignore:** with an address on file, neither `province` nor `address` is in the body (**Q5** bites, in two files).

## §3 📋 Copy — the false sentence, the two new refusals, the reworked one
- 🔴 **`BIRTHDATE_INVALID` lost *"or leave it blank"* / *"หรือเว้นว่างไว้"***. It became false the moment the field became required, and *a refusal telling a parent to do something the server now rejects is worse than no message.*
- 📋 **`BIRTHDATE_REQUIRED` and `ADDRESS_REQUIRED`** put on screen from **COPY-REVIEW §9** (drafts), both languages. The address one says **once per family**, so meeting it does not read as us having lost something.
- 📋 **The duplicate refusal is @Jason's §8 wording, on the page**, both languages — 🔑 **it asks for the child's REAL name** (the owner's ruling) and **no longer offers a nickname**, which is what let the confusion in.
- 📝 **My own two new strings** (`addressOnFile`, `addressOnFileProvince`) are **DRAFT (Fern, TASK-566)**, pinned by shape. 🚫 Code not held for any of it.
- ⚠️ **Declared: the LINE chat keeps its own copy of the duplicate sentence** (@Jason flagged it; the owner named the page only). **Not touched** — the chat is out of scope, and I am not reconciling it on my own judgement.

## §4 🔑 Clicked — the request, never the screen
`register-required.dom.test.tsx`, the real page with the LIFF SDK and `fetch` faked (5 tests):
1. **every field empty ⇒ the door is shut AND no create request exists** (pressing it anyway sends nothing and never reaches the confirm screen);
2. name alone — and name + birthday — are **still** not enough for a household with no address;
3. all three filled ⇒ the create carries **name, birthDate and the address**;
4. 🔑 **the second-child case, walked for real** (phone → lookup *found* → link answering `addressOnFile: true` → the child list → Add a child): **the address field is ABSENT**, the page says why with the province, and the body's keys are **exactly `["birthDate","name"]`**;
5. no *"optional"* / *ข้าม* / *"(skipped)"* in the text **or in any attribute**.
📌 **One correction I made mid-task:** the harness first mocked the api module and recorded what the PAGE hands `create` — whose object literal always carries `address`/`province` as `undefined`. **What leaves the app is what `api.ts` builds** (it drops empty keys), so I moved the boundary to `fetch`. 🔑 **Asserting the argument would have passed while the wire carried an address key — the same class of lie as everything else this round.**

## §5 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
```
BASELINE= RegisterContent.tsx   2c67be97055adbc123d1c6fd8f376fb4
          dictionaries.ts       7e71253fab3da06a8f99fdbcb3c7e398
          register/api.ts       dd00b518484dafc2e1b9e918f0d1db9d
```
| # | mutation | first pass | after the new pins |
|---|---|---|---|
| Q1 | the birthday is optional again | ✅ | ✅ (+ the guard pin) |
| Q2 | the address is not required | ✅ | ✅ (+ the guard pin) |
| Q3 | the pre-request guard removed | 🔴 **slipped** | ✅ |
| Q4 | the address asked although one is on file | ✅ | ✅ |
| Q5 | the address rides anyway | ✅ (2 files) | ✅ |
| Q6 | the create's answer ignored | 🔴 **slipped** | ✅ |
| Q7 | *"or leave it blank"* returns | 🔴 **slipped** | ✅ |
| Q8 | *"(optional)"* returns | 🔴 **slipped** | ✅ |
| Q9 | the duplicate refusal stops asking for the real name | 🔴 **slipped** | ✅ |
| Q10 | the two new codes dropped from the contract claim | ✅ | ✅ (2 tests) |
**Ten of ten bite now; CHECKSUM: every file back to baseline on both passes.** (Q9 slipped on the first pass too — five in total, which the table above now states rather than the four I first counted.)

## §6 Verification
**775 pass / 0 fail across 84 files in 14.2 s** (was 761/82 ⇒ **+14 tests, +2 files**) · **tsc 0** · **`bun run build` ok** · 🚫 the chat wizard, the admin add-student form and Palm's items untouched · no BE change · no deploy request.
⚠️ **Not proven, the standing limit:** CSS, focus and a real phone's tap — **and this page is a LIFF view inside the LINE app, which is the one surface I can least simulate.** Whether the required marks read clearly on a parent's phone is Tanya's.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-29)
Verified by me: **775 pass / 0 fail** across 84 files · tsc 0 · build ok.

## 🔴 FIVE mutations slipped on the first pass — and publishing that is the most valuable thing here
**None was a meta-mutation. Every one was a hole in her own tests:** the pre-request guard (**a clicked test that presses a DISABLED button**) · the create's answer ignored (**the test stopped after one child**) · *"or leave it blank"* returning · *"(optional)"* returning · the duplicate refusal dropping *"real name"*. ✅ **All ten bite now, with first-pass vs after shown.**
🔑 **Yesterday I recorded that a table of only green rows is the one to distrust. She proved the table is real by publishing five red rows.** ⇒ 📌 **A report that shows where it failed before it passed is the only kind that earns the greens.**
⚠️ **And the first of those five is a lesson on its own: a "clicked" test that presses a DISABLED button proves nothing** — *the click lands nowhere, and the test goes green because the absence it asserts was guaranteed by the wrong thing.*

## 🔑 The keeper — TASK-563's own rule, biting its author one layer over
**`textContent` does not include ATTRIBUTES, and a placeholder IS an attribute** ⇒ **her "no `optional` anywhere" check was reading a surface that COULD NEVER HOLD THE STRING.**
🔑 **That is precisely TASK-563's rule at a different level: an assertion against a surface that cannot carry the value is green for a reason unrelated to the truth.** ✅ **Fixed to read `placeholder` / `aria-label` / `title`, with the words pinned directly in a copy test.**
✅ **And she names WHICH NET catches ④ — the copy pin, not the click.** 🔑 *Knowing which green defends which claim is the discipline; two greens that both "cover" something usually means neither was checked.*

## ✅ The mid-task correction, and it is the same family
**She first asserted what the PAGE hands `create` — whose literal always carries `address: undefined` — then MOVED THE BOUNDARY TO `fetch`.**
🔑 **"The argument would have passed while the wire carried an address key."** ⇒ **Assert at the boundary the other side actually reads.** **Recorded.**

## ✅ The work itself
**Every field required through ONE expression read by THREE doors** — *one rule, three doors, rather than three agreeing copies.*
🚫 **All four ข้าม shapes hunted: no button, no link, three "(optional)" hints replaced, and `reviewSkipped` DELETED rather than reworded** — 🔑 *rewording a skip leaves the invitation in place; deleting it is the only version that cannot drift back.*
✅ **The address is ABSENT when one is on file** — not disabled, not locked — **with the province the server sent, and worded so being asked again does not read as "we lost it".** ✅ **State from `/status`, `/link` and the create's own answer — never a second request.**
🔑 **Clicked on the REQUEST: empty form ⇒ NO create at all; the second-child path walked for real ⇒ body keys exactly `["birthDate","name"]`.** ✅ **Exact key set, per TASK-564's rule.**

## ⚠️ The chat divergence — mine to carry, and it is now TWO
**She did not touch the LINE chat's own copy of the duplicate sentence. Correct.**
🔴 **Combined with @Jason's finding, the chat registration path now differs from the page in TWO ways: it still allows ข้าม, and it has its own wording for the same refusal.** ⇒ 🔑 **Two doors to the same data, drifting.** **Raised to @Porter as one item, not two.**
⚠️ **Not proven: CSS / focus / a real tap — and this is a LIFF view INSIDE the LINE app, the surface she can least simulate.** ⇒ **Tanya, and the owner's phone for the LINE half.**
