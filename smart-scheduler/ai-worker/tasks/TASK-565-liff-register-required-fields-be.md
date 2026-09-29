# TASK-565 — REQ-110 item 10: the LIFF register form — BE, M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-29) · **Size M.** Khwan, REQ-110 item 10. **The last of the owner's un-blocked items.**

## §0 The owner's rulings, all three
1. **The duplicate-name refusal is REWORDED to ask for the child's REAL name.** 📋 **Draft to the owner first, in `COPY-REVIEW-2026-09-29.md`.**
2. **The address is stored ON THE PARENT. If an earlier child already gave it, DO NOT ask again.** **Name and birthday are required for EVERY child.**
3. **"ข้าม" is removed: every field required, marked `*`, and the form cannot proceed until each is filled.**

## §1 The cheapest half first
✅ **The duplicate warning ALREADY EXISTS** — `addChildForLineParent` returns `name-duplicate-needs-detail`, answered as **409 `NAME_DUPLICATE_NEEDS_DETAIL`**. ⇒ 🔑 **That half is a SENTENCE, not a feature.** **Reword, draft it, and do not gold-plate it.**

## §2 The real work — removing a path
**`name`, `birthDate`, `province` and `address` are all `optional()` today, and "absent" is a deliberate skip.** ⇒ **This REMOVES a path the form was designed around.**
- ⚠️ **A live customer flow changes: a parent who could skip no longer can.** 🔑 **Say what happens to a parent who is MID-FLOW when this deploys**, and *if the honest answer is "they get an error they cannot fix", STOP and tell me.*
- 🔑 **"Required" is CONDITIONAL for the address, and the form cannot know on its own** ⇒ **the server must TELL it whether this household already has one.** ⚠️ **That is a contract addition — name it, and say what the form sees.**
- ⚠️ **Say what "already given" MEANS, exactly**: a non-empty `parents.province`? the appended note line? **both?** 🔑 **An address we "have" but cannot show back to the parent is not one we should count** — *if we cannot display it, we did not really collect it.*
- 🚫 **Do not make the admin's add-student form required too.** **The owner named the LIFF form only.**

## §3 Not in scope
🚫 The LIFF screen itself (the FE half, mine to cut) · 🚫 the admin add-student form · 🚫 Palm's items.

## Definition of Done
- [ ] The refusal reworded, 📋 **drafted into the copy file, code not held** · name + birthday required per child · **address required once per household, with the server SAYING whether it is already held** · **"already given" defined precisely** · the skip path removed · 🔑 **the mid-flow parent's experience stated — and STOPPED if it is unfixable** · the admin form untouched and pinned · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · migration number reported if any · 🔑 mutations incl. **a field slipping back to optional** and **the address being asked twice** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-29): birthday required per child · address required ONCE per household, the server SAYING whether it is on file · ข้าม removed · the refusal's reword DRAFTED (it is page copy) · **NO migration (63 stays)** · **3583 / 0 normally, and 3× unreachable, 0 failed queries** · tsc 0 · eight mutations bite

## §1 The duplicate-name refusal: a sentence, and it lives on the PAGE
- The server returns only a **code** (`NAME_DUPLICATE_NEEDS_DETAIL`, unchanged). The register contract's principle 1 is *"the server returns CODES; the page renders words"*.
- ⇒ **The reword is the page's copy.** 📋 **Drafted in COPY-REVIEW §8** (both languages, "the child's REAL name").
- ⚠️ **The LINE chat has its own copy of the sentence and keeps "more detail":** the owner named the page only. Flagged there.

## §2 Required fields (`addChildForLineParent`, the page's one writer)
- **Name:** already required (`NAME_REQUIRED`).
- **Birthday: REQUIRED for every child.** Absent, blank, **or the typed word ข้าม** ⇒ **`400 BIRTHDATE_REQUIRED`**, nothing created. A malformed or ISO date is still `BIRTHDATE_INVALID`.
- **Address: REQUIRED ONCE per household.** While none is on file, **both the picked province and the address line** are needed. Any half missing ⇒ **`400 ADDRESS_REQUIRED`**, nothing created.
  - **Once on file it is NOT asked**, and one sent anyway is **NOT written**, so there's never a second line in the note.

## §3 🔑 "Already given", precisely (`householdAddressOf`, the ONE definition)
- **On file = `parents.province` is set.** It is written **only** by the page's PICKED province (through `householdPatch`, a real one of the 77), together with the address line, and **it can be shown back.**
- 🚫 **The address line in `parents.note` does NOT count:** it's appended into free text beside staff notes (allergies…), so we can't tell it apart or show it back. **Your rule: if we can't display it, we didn't really collect it.**
- ⇒ **A household whose address came only through the CHAT** (typed, note only) **reads as NOT given**, and the page asks once more. After that, the province is set.

## §4 The contract addition: the form is TOLD
- **`POST /register/status`** (on open), **`/register/link`** and **`/register/create`** now carry **`addressOnFile: boolean`** + **`province: string | null`** (the name, to SHOW: *"ที่อยู่: เชียงใหม่ (มีแล้ว)"*).
- **What the form sees:**
  - `addressOnFile: false` ⇒ show the province + address fields, both `*`;
  - `true` ⇒ hide them and optionally show the province.
  - **`create` returns the NEW state, so the "add another child" form already knows** (pinned: the first child with an address ⇒ `addressOnFile: true`).
- **Two new codes, no message** (principle 1): `BIRTHDATE_REQUIRED`, `ADDRESS_REQUIRED`. **Page words drafted in COPY-REVIEW §9.**
- ⚠️ **One existing page sentence becomes false:** `BIRTHDATE_INVALID` ends *"…or leave it blank"*. **Flagged in §9 for the FE half.**

## §5 🔑 The mid-flow parent at deploy: FIXABLE, so not a STOP
- **Only a parent with the OLD page already open across the deploy** is affected, and only if they leave the birthday or address blank.
- **What they see:** the old page doesn't know the two new codes. `FailureAlert` renders `register.code.<CODE>`, so **the text falls back to the raw key**, and **the page stays on the form** (no phase change for an unknown code; read from `RegisterContent.tsx`).
  - ⇒ **They can fill the field and resubmit, and it succeeds.** A confusing message, but not a dead end, and nothing half-written: the refusal comes BEFORE any write.
- **Reopening the LINE link loads the new page.** BE + FE ship in the same uat round (the owner: *"ขึ้น uat รอบเดียว"*), so the window is only pages left open across the deploy.

## §6 Out of scope, pinned
- 🚫 **The admin add-student form is untouched:** it has no birthday/address fields at all. Pinned by value (still accepts name + phone; its field list unchanged).
- 🚫 **The LINE chat wizard keeps its own path, ข้าม included:** it creates through `createStudentFromLine`, not the page's composition. Pinned. ⚠️ **So a parent can still skip via the CHAT. Say if the owner wants the chat to match.**

## §7 Checks
- Suite: **3583 / 0** (3575 + 8 new in `src/services/liff-register-required-task565.test.ts`). **DB-unreachable 3×: 3583 / 0, 0 "Failed query".** tsc 0. **63 .sql = 63 tags: no migration.**
- **One existing pin updated:** TASK-347's "Rule 5, ข้าม is an absent field" pinned the skip composition. It now pins **that the skip is gone** (blank ⇒ `birthdate-required`, the word ⇒ `birthdate-required`).
- **Break-and-watch** (BASELINE 24, CHECKSUM identical, every restore byte-identical):
  - **F1, a field slipping back to OPTIONAL** (the birthday skip): **BITES**.
  - **F2, the word ข้าม accepted:** BITES.
  - **F3, the address optional:** BITES.
  - **F4, half an address accepted:** BITES.
  - **A1, the address ASKED TWICE:** **BITES**.
  - **A2, the address WRITTEN twice:** BITES.
  - **D1, "given" counts the note:** BITES.
  - **S1, the form not told:** BITES.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-29)
Verified by me: **3583 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **63 .sql, no migration** (counted myself).

## 🔑 "Given" defined the way I asked, and the consequence stated rather than buried
**"Given" = `parents.province` set — written only by the page's PICKED province, and SHOWABLE. The note's line does not count, because it cannot be told apart or shown back.**
✅ **That is exactly the condition: an address we "have" but cannot show back to the parent is not one we collected.**
⚠️ **And he states the price: a household that typed its address in the chat gets asked once more.** 🔑 **That is the right trade — asking once more is a small cost; treating an unshowable note line as an address is a permanent lie in the record.** 📌 **Raised to @Porter as a customer-visible effect, because it is one.**

## ✅ The mid-flow answer is the one I wanted him to actually check
**FIXABLE, not a STOP: an old page open across the deploy shows the raw code key but STAYS ON THE FORM — fill and resubmit works, and nothing is half-written.**
🔑 **"Nothing half-written" is the part that mattered** — *a parent stuck with a partly-created child would have been the STOP.*

## ✅ The contract addition, named and shaped well
**status / link / create carry `addressOnFile` + `province`, and CREATE RETURNS THE NEW STATE, so the next child's form already knows.**
🔑 **That last part removes a round trip AND a chance to disagree** — *the form never has to ask "do they have one now?" after adding a child; it was told.*

## 🔴 Two things for the FE half, both real
1. **`BIRTHDATE_INVALID` still says *"or leave it blank"* — which this change made FALSE.** ⇒ 🔑 **A refusal that tells a parent to do something the server now rejects is worse than no message.** **Into the FE half.**
2. 🔴 **The chat wizard STILL allows ข้าม.** ⇒ **A parent can skip the required fields simply by registering in chat instead of on the page.**
🔑 **That is not a tidy-up — it makes the owner's ruling optional in practice**, *and the data he asked us to guarantee still will not be there.* ⚠️ **Out of scope, correctly not folded in** ⇒ **raised to @Porter for the owner, with a recommendation: make the chat match, or accept that the record stays incomplete.**
✅ **Admin form untouched and pinned**, as scoped.
