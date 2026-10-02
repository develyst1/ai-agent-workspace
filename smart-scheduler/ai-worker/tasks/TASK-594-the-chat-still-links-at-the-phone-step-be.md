# TASK-594 — 🔴 does the chat still link at the PHONE step? + the address prompts — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-10-01) · Tanya, TEST-076 re-test. 🔴 **§1 first — it may contradict a contract we just built.**

## §1 🔴 "The chat links the parent at the PHONE step"
**Tanya reports it on sid, on the build that carries TASK-590.** 🔑 **TASK-590's whole point was that a parent is bound only when their FIRST CHILD is accepted, in one transaction.**
⇒ **Answer this before anything else, and answer it as a FACT:**
- **Does the chat path go through `registerFamilyWithFirstChild`, or around it?** ⚠️ **If around: that is the defect, and it is the one we believed we had fixed.**
- ⚠️ **If the chat path is correct and Tanya saw something else** (an existing phone linking at once, which IS the designed behaviour), **say so plainly and say what she saw** — 🚫 **do not simply report "works as intended".** 🔑 **If a tester with our own spec in hand reads it as a contradiction, the behaviour is at best badly worded.**
- 📌 **Either answer is worth having. What is not acceptable is a guess.**

## §2 The address prompts in the chat
- **The prompts are Thai-only in an EN chat.** ⇒ **Fix it, both languages, the way every other chat string works.** ⚠️ **Derive whether any other prompt has the same problem** — *one Thai-only string usually means a whole block was added without `t()`.*
- ⚠️ **District and sub-district accept FREE TEXT.** ⚖️ **That is our STATED LIMIT, not a defect** — **we validate three non-empty parts and a real province, and we deliberately do not own the district data.** 🔑 **Say so back to @Porter in one line so the owner can decide whether he wants more** — 🚫 **and do not build a picker or a dataset on your own.**

## §3 Not in scope
🚫 The FE nits (@Fern) · 🚫 a district dataset · 🚫 the camp count (attributed first by @Fern).

## Definition of Done
- [ ] §1 answered **as a fact, with the code path named** — **fixed if the chat bypasses the one-transaction writer, or the behaviour explained AND its wording flagged** · the chat's address prompts in **both languages**, **every other Thai-only prompt derived** · the free-text limit **stated upward, not built around** · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · mutations for each fix · report + `inbox/SA.md` + log.

---

# ➕ ADDED 2026-10-01 — nit 5, attributed to you by @Fern

## §4 "7 คน" for a one-child camp week
**@Fern attributed it to the PAYLOAD and STOPPED. She pinned the screen three ways rather than asserting it:**
**the cell renders `kidCount` VERBATIM (no sum, no length, no addition) · the block builder copies `b.campKidCount` and nothing else · the merge that joins adjacent blocks REQUIRES the same `campWeekDayId`, so it can never pool two days into one count.** **A value test drives it: two bookings on one day ⇒ 1, and two days ⇒ `[1, 7]`.**
⇒ 🔑 **If the screen says 7 where one child is enrolled, the 7 ARRIVED in `campKidCount`.** 📌 **That is an attribution, not an opinion — start from it.**
- ⚠️ **Derive what `campKidCount` counts today** — *rows? seats? a week total shown on a day?* 🔑 **A count that is right for one question and shown against another is not a wrong number, it is the wrong number's label.**
- ⚠️ **Say which it SHOULD be, and whether any other consumer wants the current meaning.** 🚫 **If something legitimately wants the week total, do not change it underneath them — name it and we add the second number.**

## Definition of Done (addition)
- [ ] `campKidCount`'s current meaning **derived**, the intended one stated, **other consumers named** · fixed or **STOPPED with the conflict named** · mutations incl. **the two meanings swapped** · reported with the rest.

---

# ✅ REPORT — @Jason (2026-10-01): **§1 answered as a FACT — the chat does NOT link at the phone step; what Tanya read is the phone step's SENTENCE, and it is wrong** · §2 fixed, every other prompt derived · §4 fixed: `campKidCount` pooled every week on the date · **NO migration (65)** · **3707 / 0 normally and 3× DB-unreachable (0 failed queries)** · tsc 0 · **8 / 8 mutations bite**

## §1 🔴 Does the chat link at the PHONE step? **NO. The code path, named.**
- **`verifyAndLink` → `linkFamilyByPhone(lineUserId, code)`.** For a phone we do not know it returns **`{ outcome: "new", phone }` and writes NOTHING** — no parent row, no `family_line_links`, no roster move (pinned by value in TASK-590; mutation **C2** re-proves it bites).
- **The chat then carries the phone on the session draft** (`setDraft(… { newPhone })`) and asks for the first child. **That branch links no rich menu and seeds no language** — it returns *before* `settleLinkedRole` (mutation **C1** bites).
- **The family is created at CONFIRM, through `registerFamilyWithFirstChild`** — parent + child + household + admin notice in ONE transaction. **Pinned: that is the chat's ONLY call, and the whole webhook never calls `findOrCreateParentByPhone`, `bindFamilyLine` or `linkParentLine`.**
- ⇒ **The chat does not go around the one-transaction writer.** **TASK-590 holds.**

### 🔴 So what did she see? The SENTENCE — and she was right to report it
- The phone step answers with the customer's §17c screen 4: **"ลงทะเบียนผู้ปกครองสำเร็จแล้วค่ะ ✅ / Registration completed ✅"**.
- ⚠️ **The SAME sentence is used when the phone IS known** (`verify_parent_ok_existing`), where the account really is linked at that moment. **One sentence, two opposite states** — so the chat gives a tester no way to tell "nothing saved yet" from "you are linked".
- 🔑 **The behaviour is right and the words are wrong**, exactly as you anticipated. 🚫 **Not "works as intended".**
- **Not changed by me: it is the customer's own copy.** 📋 **DRAFT in `COPY-REVIEW-2026-09-29.md` §19** — the new-phone sentence becomes *"we have your number; your registration is complete once you add your first student"*; the existing-phone one keeps the customer's words, because there they are true.
- 📌 **What she could NOT have seen, and it is worth saying to @Porter:** an EXISTING phone links at once, by design — if her test phone had been used before, that is the designed behaviour and not a defect.

## §2 ✅ The chat's address questions, in both languages — and the rule derived
- **Fixed:** the three address questions and the summary's on-file note **moved into `REGISTRATION_COPY`**, so each is ONE bilingual string, like every other §17c screen. They rendered one language because they shipped in the keyed `{TH,EN}` table.
- 🔑 **The rule, derived and stated once:** a **§17c SCREEN is bilingual** (the customer wrote both languages into one string, for a reader whose language we do not yet know); **everything else answers inside a session whose language IS known** (TASK-307's ruling: 39 `t(…, lang)` against 13 `both()`). **My block broke that pattern; nothing else did.**
- **Derived — every key the wizard renders, classified:** the 12 §17c screens are bilingual; the per-language ones are exactly **`add_addr_province_bad` · `add_birthdate_bad` · `add_cancelled` · `add_dup_detail` · `add_generic_err` · `add_name_reserved` · `add_no_parent` · `added_atmax_note` · `menu_body`** — every one a **refusal or a menu**, i.e. correct by that rule, and **`add_cancelled` / `add_generic_err` / `menu_body` are rendered through `both()` anyway.** The list is pinned, so a tenth cannot appear quietly.
- ⚠️ **`add_addr_province_bad` stays per-language on purpose:** it is a REFUSAL, the same shape as `add_birthdate_bad` beside it. **Say if you want it bilingual — it is one line.**
- 🔑 **A trap worth recording:** my first check was *"the screen renders the same in TH and EN"*. **A Thai-ONLY string passes that** — it is identical in both. **Mutation B3 SURVIVED on it.** The check now requires **both scripts present in the one string**, and B3 bites.

## §3 ⚖️ District / sub-district free text — **stated upward, not built around**
**For @Porter, in one line:** *"District and sub-district are typed by hand and we do not check them against the province — the server requires all three parts and a real province, and we deliberately do not keep Thailand's district data. If the owner wants them picked from a list instead of typed, that is his decision and a separate piece of work."*
🚫 No picker, no dataset, nothing built.

## §4 🔴 "7 คน" on a one-child week — @Fern's attribution was right, and the payload pooled the WEEKS
- **What `campKidCount` counted TODAY:** `dayCounts` is **children per WEEK per DATE** (one `camp_days` row per child per date, statuses PLANNED/ATTENDED/ABSENT) — **that part was right.** The calendar then built its map **keyed by DATE ALONE and SUMMED every week covering it**:
  `kidsByDate.set(date, (kidsByDate.get(date) ?? 0) + Number(n))`.
  ⇒ **on a date where two camp weeks run, every block of week A showed A + B.**
- 🔑 **Your framing was exactly right: it is not a wrong number, it is the wrong number's LABEL.** The pooled total correctly answers *"how many children are at camp that day"*; the block asks the narrower *"how many in THIS week that day"*. 📌 **And it matches the evidence: the owner's item-12 query returned SEVEN camp rows for 09-30** — the day's total across the weeks, which is the 7 Tanya saw on a week with one child.
- **What it SHOULD be:** the block's OWN week on that date. **Fixed:** the map is keyed `weekId|date` and read through the block's own `campWeekDayId → campWeekId` (already loaded in the shared relation set).
- **Other consumers: NONE wanted the pooled total** — `dayCounts` goes to the FE **per week** on `campWeeks` (the banner shows one row per week with its own count), and this map had **exactly one reader**. 🚫 So nothing is changed underneath anyone, and no second number is needed.
- ⚠️ **The old pin held the defect:** `expect(CAL).toContain("campKidCount: … kidsByDate.get(row.date) …")` — **a call-site source pin passes any derivation**, which is the lesson @Fern paid for. **Replaced by a VALUE test on the real `getCalendar`, built so the two candidate meanings DISAGREE:** two weeks on one date, 1 child and 6 ⇒ **`[1, 6]`, never `[7, 7]`**. The old test's claim is narrowed in place ("the same number on every block of that day **in that week**").

## §5 Checks
- Suite: **3707 / 0** (3699 + 8 new, `src/lib/tanya-retest-task594.test.ts`). **DB-unreachable 3×: 3707 / 0, 0 "Failed query".** tsc 0. **65 .sql = 65 tags, no migration.** 4 changed files, none with mixed line endings.
- 📌 **Your lesson applied, and it caught something:** my `--tests` list names **every file a pin lives in** (the new file, TASK-590's, TASK-583's, the camp DTO's and the register contract's). **The unreachable baseline also refused to run at first** — my new calendar test read the freelance ceilings and the settings for real. Both faked; that is what the unreachable run is for.
- **Mutations with `bun run mutation:run`:** baseline 60; CHECKSUM identical; every restore byte-identical:
  - **A1, §4 the two meanings SWAPPED (the date's pooled total — Tanya's 7):** BITES.
  - **A2, §4 the week dropped from the key:** BITES. · **A3, §4 some other week's count:** BITES.
  - **B1 / B2, §2 an address question back to one language:** BITES.
  - **B3, §2 the on-file note back to one language:** BITES *(SURVIVED first — see §2's trap)*.
  - **C1, §1 the chat links at the phone step:** BITES. · **C2, §1 the family bound at the phone step:** BITES.
- 📋 **COPY §19** (the phone step's sentence, DRAFT, the owner's) and **COPY §18 updated** (the address questions are bilingual now).

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-10-01)
Verified by me: **3707 / 0** · tsc 0.

## 🔑 §1 — the best possible outcome of that instruction: **the code was right and the screen was lying**
**The chat does NOT link at the phone step; the path goes through the one-transaction writer.** 🔴 **What Tanya read is THE SENTENCE: the phone step answers *"Registration completed ✅"* when NOTHING is saved — and the SAME sentence is used when the phone IS known and the account really is linked.**
🔑 ***One sentence, two opposite states.*** ⇒ ✅ **"Not 'works as intended': the words are wrong."**
📌 **This is exactly why I refused to accept "works as intended": a tester holding our own spec read the screen as a contradiction BECAUSE THE SCREEN SAID THE OPPOSITE OF THE TRUTH.** **Tanya was right to report it, and the report was about the right thing even though the code was fine.**
📋 **§19 drafted — new phone ⇒ "we have your number; registration completes with your first student"; the existing-phone sentence keeps the customer's own words.** ⚖️ **It is the customer's copy, so the owner rules. Going up.**

## ✅ §2 — he derived the pattern instead of fixing his block
🔑 **"A §17c SCREEN is bilingual; everything else answers in the session's known language."** ✅ **And he proved it: the 9 per-language keys are ALL refusals or the menu, pinned AS A LIST so a tenth cannot appear quietly.** ⇒ **Only his own block broke the pattern.**
📌 **That is the difference between fixing a bug and finding the rule it broke.** ✅ **`add_addr_province_bad` staying per-language is consistent — it is a refusal, like `add_birthdate_bad`.**

## ✅ §4 — @Fern's attribution was right, and the number has a source
**The map was keyed by DATE ALONE and summed every week on it, so two weeks on one date POOLED.** 📌 **The owner's item-12 query returned SEVEN rows for 09-30 — that is the 7.** ✅ **Fixed to `weekId|date`, and no consumer wanted the pooled total** (the banner takes `dayCounts` per week; the map had one reader).
⚠️ **And the old pin HELD THE DEFECT: a call-site source pin.** ✅ **Replaced by a value test on the real `getCalendar` where the two meanings disagree (1 and 6, never 7/7).**
🔑 **Third time this fortnight: a SOURCE pin on a CALL SITE proves the call, not the answer.** **Recorded.**

## ⚠️ Two of his own, and the first is a keeper
🔑 ***"Identical in TH and EN" PASSES a Thai-ONLY string*** — **B3 survived until the check required BOTH SCRIPTS.** ⇒ **An equality between two languages is satisfied when both are the same wrong language.** **Recorded.**
📌 **And the unreachable baseline REFUSED TO RUN because his calendar test read budgets and settings for real.** 🔑 **Fourth distinct real-database dependency that run has caught** — *and each time a green suite would have said nothing.*
