# TASK-601 — §19: the registration sentence — BE, XS/S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-10-01) · 🔑 **The LAST unshipped item of the round. The owner approved §19 as drafted.**

## §0 The ruling
**A NEW phone gets the new sentence. An EXISTING phone keeps the customer's own words.**
🔴 **Today both keys carry the SAME sentence** — `verify_parent_ok_new` and `verify_parent_ok_existing` both read *"ลงทะเบียนผู้ปกครองสำเร็จแล้วค่ะ ✅ / Registration completed ✅"*. 🔑 **That is the defect: one sentence, two opposite states** — **it claims completion at the phone step, when nothing is saved.**

## §1 Build
- **The new-phone key gets §19's wording. The existing-phone key keeps Khwan's words, unchanged.**
- ✅ **Pin the two keys as DIFFERENT** — 🔑 **that is the whole fix, and it is the one thing a future edit could undo without anyone noticing.**
- ✅ **Pin by SHAPE on the new-phone key: it must NOT claim completion** (no *สำเร็จ* / *completed*). **And pin the existing-phone key BY VALUE** — **it is the customer's own sentence.**
- 🔴 **`src/lib/customer-english.test.ts:61-62` currently asserts that BOTH contain *"Registration completed ✅"*.** ⇒ 🔑 **That test PINS THE DEFECT.** **Update it and DECLARE it** — 📌 *the same family as TASK-577's "the pin was faithful to the code and the code was wrong".*
- ⚠️ **Derive whether any other sentence in the registration flow claims completion before the first child is accepted.** 🔑 **One screen told the truth and another did not is how this started.**

## §2 Not in scope
🚫 The behaviour (correct since TASK-590) · 🚫 the page's own copy · 🚫 any other §.

## Definition of Done
- [ ] The two keys DIFFERENT and pinned so · the new one **shape-pinned against claiming completion**, the existing one **value-pinned as the customer's** · 🔴 **the defect-pinning test updated AND declared** · **every other premature "completed" in that flow derived** · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · mutations incl. **the two keys made identical again** and **the new key claiming completion** · report + `inbox/SA.md` + log · ⚠️ **tell me the moment it is green — @Porter is waiting on the batch.**

---

# ✅ REPORT — @Jason (2026-10-01): **GREEN — tell @Porter.** §19's sentence shipped · the two keys **DIFFERENT and pinned so** · the new one **shape-pinned against claiming completion**, the existing one **value-pinned as the customer's** · 🔴 **FOUR tests pinned the defect, not one — all updated and declared** · every other premature "completed" in the flow derived · **NO migration (65)** · **3713 / 0 normally and 3× DB-unreachable (0 failed queries)** · tsc 0 · **6 / 6 mutations bite**

## §1 The sentence
- **NEW phone** (`verify_parent_ok_new`, §17c screen 4's slot): *"รับเบอร์แล้วค่ะ ✅ เบอร์โทรศัพท์ / Phone: {phone}"* then *"ลงทะเบียนจะเสร็จสมบูรณ์เมื่อเพิ่มนักเรียนคนแรกค่ะ / Your registration is complete once you add your first student."* — **bilingual in one string**, like every §17c screen (TASK-594 §2's rule).
- **EXISTING phone** (`verify_parent_ok_existing`): **untouched**, the customer's own words, **value-pinned**.
- **The pins:**
  - 🔑 **DIFFERENT, in both languages** — the one thing a future edit could undo unnoticed (mutation **E1** bites);
  - **by SHAPE on the new one:** it must not contain *สำเร็จ · เรียบร้อยค่ะ · completed · All set* (**E2**), **and it must still name the phone AND the condition** — the first student (**E3**). *A sentence that only dropped the claim would leave a parent wondering whether anything happened at all.*
  - **by VALUE on the existing one** (**E4**), and **the new sentence has exactly ONE caller**, so it cannot also be shown after a real link (**E5**).
- 📌 **On the shape pin's wording:** *"จะเสร็จสมบูรณ์เมื่อ…"* / *"is complete once you…"* is a **condition, not a claim** — it names what is still missing. The banned tokens are the ones that assert a finished state, which is why the pin reads for those and not for the word "complete".

## §2 🔴 FOUR tests pinned the defect — all updated and DECLARED
**You named one; the suite had four.** Each was faithful to the code, and the code was wrong (TASK-577's family):
1. **`customer-english.test.ts`** — asserted BOTH keys contain *"Registration completed ✅"*. Now: the existing one does, **the new one must not**.
2. **`registration-copy-req079.test.ts` (screen 4a, byte-for-byte)** — asserted `verify_parent_ok_new === SCREEN["4a"]`.
3. **`registration-copy-req079.test.ts` (screen 4 ASSEMBLED)** — the whole block, byte-for-byte.
4. **`leave-notice-req085-16d.test.ts` (TASK-318's ✅ on the Thai success line)** — asserted the old Thai value exactly.
- 🔴 **The consequence I am declaring, because it is a departure from "§17c byte-for-byte":** **screen 4a's exact sentence is now carried by NO key.** It only ever rendered on the new-phone step, which is precisely where it had become false. ✅ **Asserted** (`allChatStrings()` holds no string equal to `SCREEN["4a"]`), so the retirement is visible instead of being discovered.
- ✅ **TASK-318's own claim survives where it still applies:** the ✅ still rides the **Thai** line.
- ✅ **TASK-310's composition claim is untouched** — screen 4 is still ONE block with each half rendered **once**; only the first half's words changed.
- 📌 **And one of the four was MINE:** TASK-594 §1's pin recorded the defect as *today's fact* so the attribution could not be lost. **It now records the fix.** *A pin written to preserve a finding has to be retired by the fix that answers it.*

## §3 ⚠️ DERIVED — nothing else claims completion before the first child
**Swept every string the chat can render from the phone step through the wizard** (taken from the source, not a kept list; >20 keys), for the words that assert a finished state. **Four hits, each justified, and the list is pinned:**
| key | why it may claim it |
|---|---|
| `added_done` | the child HAS been created — **pinned: it renders after the writer** in the confirm branch |
| `skip_done` | reachable **only** for a parent who already has a child — **pinned: TASK-307's `if (!kids.length)` re-asks instead** |
| `verify_admin_ok` | an **admin** link really is finished at that moment: it binds no family and waits for no child |
| `verify_parent_ok_existing` | that account **is** linked at that moment (the customer's sentence, value-pinned) |
- ⚠️ **`skip_done` was the one worth checking** — *"เรียบร้อยค่ะ ✅ / All set ✅"* would be a lie before the first child, and it cannot be reached there.
- 🔑 **A fifth would fail the test**, so a future premature "completed" cannot arrive quietly (mutation **E6**: a claim added to the name prompt bites).

## §4 Checks
- Suite: **3713 / 0** (3707 + 6 new, `src/lib/registration-sentence-task601.test.ts`). **DB-unreachable 3×: 3713 / 0, 0 "Failed query".** tsc 0. **65 .sql = 65 tags, no migration.** 6 changed files, none with mixed line endings.
- **Mutations with `bun run mutation:run`** (the `--tests` list names **every one of the five files a pin lives in**): baseline 85; CHECKSUM identical; every restore byte-identical:
  - **E1, the two keys identical again:** BITES. · **E2, the new key claims completion:** BITES.
  - **E3, the condition dropped:** BITES. · **E4, the existing key loses the customer's sentence:** BITES.
  - **E5, the new sentence shown on a real link too:** BITES. · **E6, a premature claim added before the first child:** BITES.
- 📋 **COPY §19 marked APPROVED & SHIPPED as §19b**, with a note that two §19 blocks exist (@Fern's leave screen is the other) — ⚠️ **nothing renumbered**, so no report's reference breaks.

⚠️ **GREEN — the batch is ready for @Porter.** ⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-10-01)
Verified by me: **3713 / 0** · tsc 0.

## 🔴 I named ONE defect-pinning test. The suite had FOUR.
**`customer-english` · screen 4a byte-for-byte · screen 4 ASSEMBLED · TASK-318's ✅ pin.** **All updated and declared.**
🔑 **A false sentence that had been pinned FOUR TIMES OVER.** ⇒ 📌 **That is not four mistakes; it is one sentence that four different people each took as the specification.** **A pin is a statement of intent, and intent copied four times is very hard to dislodge.**

## 📌 The keeper — and one of the four was HIS OWN
**TASK-594 §1's pin recorded the defect as TODAY'S FACT; it now records the fix.**
🔑 ***"A pin written to preserve a finding has to be retired by the fix that answers it."***
📌 **That is a genuinely new rule about pins, and it comes from the person whose pin it was.** ⇒ **A finding-pin has a lifetime: it exists to stop a fact being lost before it is acted on, and the act that answers it must take it down.** **Recorded.**

## ✅ The shape pin asks for the right two things
**No *สำเร็จ / เรียบร้อยค่ะ / completed / All set* (E2) — AND it must still name the PHONE and the CONDITION (E3).**
🔑 **"A sentence that only dropped the claim would leave a parent wondering whether anything happened."** ⇒ **Removing a false claim is not the same as saying something useful**, and he pinned both halves rather than the easy one. ✅ **One caller (E5).**

## ✅ Declared consequences, both handled the right way
🔴 **§17c screen 4a's exact sentence is now carried by NO key** — **it only ever rendered where it had become false.** ✅ **ASSERTED, so the retirement is VISIBLE** — *a retired customer sentence that simply disappears is indistinguishable from one we lost.*
✅ **TASK-318's claim survives (the ✅ still rides the Thai line) and TASK-310's composition is untouched** — **the narrowing is scoped, not a general loosening.**
✅ **Derived: nothing else claims completion before the first child.** **Four justified hits pinned AS A LIST** (`added_done` after the writer · `skip_done` only with a child on file · `verify_admin_ok` — an admin link really is done · `verify_parent_ok_existing`) **and a fifth FAILS the test (E6 bites).** 🔑 **A list with reasons, so a fifth cannot be added quietly.**

## ⚖️ The numbering collision — **his handling is right, and it adds a clause to my rule**
**Two §19 blocks now exist (@Fern's is the other). He marked his APPROVED & SHIPPED as §19b and renumbered NOTHING.**
✅ **Correct.** 🔑 **An APPROVED section must never be renumbered, because the owner's approval references the number.** ⇒ **The suffix is the honest minimal fix.** 📌 **My by-task rule stands for new sections; this is its legacy edge, and it is now written down.**
