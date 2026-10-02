# TASK-590 — F-C's full address + D11(a)'s one-transaction link — BE, M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · **Size M.** Both of your stops in TASK-583, ruled. 🔴 **Both ship WITH @Fern's half (TASK-591).**

## §1 F-C — `assertFullAddress`, and 🚫 no backend dataset
✅ **Build it as you proposed: three non-empty parts, province in the 77.** **The page sends the three picked names; the chat asks three short questions.**
🔑 **The server validates the SHAPE it receives; it does not re-derive the geography.** 🚫 **A second dataset in the backend is out — two datasets that can disagree is the class we have just spent a fortnight on.** 📌 **The 77 provinces are closed and stable and we can own them; districts and sub-districts are not.**
- 🔴 **SAY THE LIMIT, in the code and in the report: we are NOT checking that the district belongs to the province.** 🔑 **Anyone who reads "full address validated" and believes that is the next defect.**
- ✅ **Legacy province-only: asked again, never blocked.** **Pin that a stored one-part address does not make anything else fail.**
- ⚠️ **ONE rule serving both doors.** 🚫 **Not two validators that agree today.**

## §2 D11(a) — the one-transaction link
✅ **"Finished" = the first child accepted by the writer: parent + binding + child in ONE transaction.** 🔑 **A family that HAS a child is the only definition that cannot be gamed, and one transaction leaves no half state to clean up.** ✅ **An existing phone still links at once.**
- ⚠️ **It changes `linkFamilyByPhone` for BOTH doors and the page's `/register/link` and `/create` contract** ⇒ **say exactly what the new contract is, in one block, so @Fern builds against a statement and not a diff.**
- ⚠️ **What does a parent see if the child is rejected mid-transaction?** 🔑 **Nothing may be left behind** — **pin it.**
- ⚖️ **The repair: DO NOT.** **Those rows are no longer harmful and archiving a parent who might come back is a loss for no gain.** ✅ **Record the decision and the query; run neither.**

## §3 Not in scope
🚫 Any dataset dependency · 🚫 the admin add-student form · 🚫 Palm's items.

## Definition of Done
- [ ] `assertFullAddress` serving BOTH doors from ONE rule · 🔴 **the limit stated in code and report** · legacy province-only asked-again and pinned · the one-tx link, **the new contract written as a block for @Fern** · **nothing left behind on a mid-transaction rejection, pinned** · the repair **declined in writing**, query recorded, nothing run · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · mutations incl. **a two-part address accepted** and **a binding written without a child** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-30): F-C and D11(a) BUILT · **the new page contract below, as ONE block for @Fern** · 🔴 **the LIMIT stated in code and here** · legacy province-only: **asked again, never blocked** (pinned) · **nothing left behind on a mid-transaction failure** (pinned by value) · the repair **declined**, query recorded, **nothing run** · **NO migration (65)** · **3699 / 0 normally and 3× DB-unreachable (0 failed queries)** · tsc 0 · **10 / 10 mutations bite** · 🔴 **ships WITH TASK-591**

## §1 F-C: ONE rule, `checkFullAddress` (`src/lib/full-address.ts`)
- **Three non-empty parts: province · district · sub-district. The province must be one of the 77** (the list we own).
  - none ⇒ `address-required`; some ⇒ `address-incomplete` + `missing: [...]`; a province not in the 77 ⇒ `province-unknown`.
  - The server builds **the ONE stored line itself**, in the page's order and spelling (`สุเทพ เมืองเชียงใหม่ เชียงใหม่`, Bangkok as `กทม`), into `parents.note` (appended); the province goes to `parents.province`. **Storage unchanged, no migration.**
- **Called by every path:**
  - the page (`addChildForLineParent`, for its refusal codes);
  - the one-transaction register;
  - the chat's confirm;
  - **and the ONE writer again as the floor** (`createStudentFromLine` refuses a partial address before the student, the household and the notice, by value).
  - No other `isThaiProvince` check sits beside it.
- **The chat asks three questions** (province → district → sub-district), each required with no skip, each refusal a strike.
  - The typed province is resolved to the 77 (`provinceFromTyped`: "จังหวัด" dropped; `กทม / กรุงเทพ / Bangkok / BKK` known; nothing fuzzy).
  - ⚖️ **So the chat now fills `parents.province` too.** TASK-352's "the chat never writes province" rested on "a typed line cannot pick one"; a resolved one of the 77 is not a guess.
  - **The address is asked ONCE per household on the chat too**, as on the page (skipped when `parents.province` is on file).
- 🔴 **THE LIMIT (in `full-address.ts`'s header and pinned by a test that PASSES a wrong pair):** **we do NOT check that the district belongs to the province, or the sub-district to the district, or that either name exists.** `เชียงใหม่ / บางรัก / สีลม` is accepted.
  - The page's picker keeps its parts consistent; the chat's typed parts are what the parent typed.
  - **No backend dataset**, pinned: nothing imported, nothing in `package.json`.
- 🔑 **Legacy, pinned by value:**
  - a household with **only a province on file** adds its next child with **no address asked and nothing refused**;
  - one with **nothing on file** (e.g. a chat-typed line in `note`) is **asked**, and created once it answers. **Nobody is blocked.**

## §2 D11(a): the one-transaction link
- 🔑 **"Finished" = the first child accepted by the writer.**
  - **`linkFamilyByPhone` on a NEW phone writes NOTHING** (no parent, no binding, no roster move) and answers `new`. Its refusals (archived · this LINE already a family's) still run at the phone step.
  - **`registerFamilyWithFirstChild`** is the one write, and both doors call it:
    - every check first (name, birthday, **the full address**, then the phone re-checked: archived · **registered meanwhile** · this LINE already a family's);
    - then **ONE transaction: the parent (this account as primary) + the child + the household + the admin notice**;
    - the roster link moves after the commit.
  - **An EXISTING phone still links at once**, unchanged.
- 🔴 **What a parent sees on a mid-transaction rejection: the refusal, and NOTHING left behind.** Pinned by value with a transaction that stages its writes and commits only on success: a failure at the student insert or at the notice ⇒ **no parent, no binding, no child, no notice, no roster move**. Every earlier refusal **never opens the transaction** (pinned with a tripwire).
- **The chat:**
  - the new phone rides the wizard's draft (`newPhone`); the screen is unchanged (the same verify line + the name prompt, through the same `afterParentLink`);
  - **no menus until the family exists**;
  - at CONFIRM: `registerFamilyWithFirstChild` (the birthday back in the customer's day-first form for the shared parser), THEN the menus;
  - a "registered meanwhile" gets its own sentence (DRAFT) and nothing is saved.

## §3 📜 THE NEW PAGE CONTRACT: for @Fern (TASK-591) to build against. ⛔ Deploy BE and FE together.
```
POST /register/lookup   { idToken, phone }                         — UNCHANGED  ⇒ { ok, outcome: "new", phone } | { ok, outcome: "found", … } | refusal

POST /register/link     { idToken, phone, code? }
  NEW phone      ⇒ 200 { ok: true, outcome: "new", phone: "081-234-5678" }      ← NOTHING written, no menus, session untouched
  EXISTING phone ⇒ 200 { ok: true, outcome: "linked", children, canAddMore, addressOnFile, province }   (🔻 no more `isNew`)
  refusals       ⇒ PHONE_INVALID · PHONE_BOUND_TO_OTHER_LINE · LINE_BOUND_TO_OTHER_FAMILY · PHONE_ARCHIVED · TWOFA_*

POST /register/create   { idToken, name, birthDate, province?, district?, subDistrict?, phone?, detailProvided? }
  🔻 `address` (the pre-joined line) is NO LONGER READ — send the three picked names; the server builds the line.
  • account NOT linked + `phone` (after lookup/link said "new")  ⇒ the family is CREATED WITH THIS CHILD, in one transaction
      ⇒ 200 { ok, outcome: "created", registered: true, student, birthDate, count: 1, atMax: false, canAddMore: true, addressOnFile: true, province }
      the address is REQUIRED (a new household has none on file)
  • account LINKED ⇒ its own family (`phone` is IGNORED — never re-pointed) ⇒ 200 { ok, outcome: "created", … } as before
      the address is required only while none is on file (`addressOnFile` from /status, /link or the last /create)
  • account NOT linked, no `phone` ⇒ 403 NOT_LINKED
  refusals (all { ok:false, code, …extra }):
      NAME_REQUIRED · NAME_RESERVED {word} · FAMILY_FULL {max} · NAME_DUPLICATE_NEEDS_DETAIL {name, message:{TH,EN}}
      BIRTHDATE_REQUIRED · BIRTHDATE_INVALID
      ADDRESS_REQUIRED · ADDRESS_INCOMPLETE {missing: ["province"|"district"|"subDistrict"]} · PROVINCE_UNKNOWN {province}
      PHONE_INVALID · PHONE_ARCHIVED · LINE_BOUND_TO_OTHER_FAMILY
      PHONE_NOW_REGISTERED   ← NEW: the phone became a family since /link — go back to lookup
```
- **Page consequences:** the "type the address" mode can't be sent as one line any more (it has no province). It goes, or becomes three fields. **A new family's first child is ONE call (`/create` with `phone`), not `/link` then `/create`.**

## §4 ⚖️ The repair: DECLINED (Sober, TASK-590 §2). Recorded, run by nobody
- Families already linked with no child stay as they are: **no longer harmful** (`canAddMore` lets them finish), and archiving a parent who may come back is a loss for no gain.
- **The query, recorded for the record only (read-only; nobody here runs it):**
```sql
-- Q-D11 · LINE accounts linked to a family with NO active child (created before TASK-590 by the phone-step bind). Read-only.
SELECT l.line_user_id, p.id AS parent_id, p.phone, l.linked_at,
       count(s.id) FILTER (WHERE s.archived_at IS NULL) AS active_children, count(s.id) AS all_children
FROM family_line_links l
JOIN parents p ON p.id = l.parent_id
LEFT JOIN students s ON s.parent_id = p.id
GROUP BY l.line_user_id, p.id, p.phone, l.linked_at
HAVING count(s.id) FILTER (WHERE s.archived_at IS NULL) = 0
ORDER BY l.linked_at;
```
- Pinned: nothing in the register service clears or archives a family.

## §5 Checks
- Suite: **3699 / 0** (3680 + 19 new, `src/lib/full-address-and-first-child-task590.test.ts`). **DB-unreachable 3×: 3699 / 0, 0 "Failed query".** tsc 0. **65 .sql = 65 tags, no migration.** **56 changed files, none with mixed line endings.**
- **The unreachable run caught one of MY tests:** `/register/link` reads the 2FA setting, and my route test hadn't faked it, so it got a real query (500 with no database). Fixed by faking it. **That is exactly what the unreachable run is for.**
- **Existing pins updated, each with its reason in the file (≈30, across 21 files):**
  - `isNew` became `outcome: "new"`;
  - the new-phone path has no `findOrCreateParentByPhone`;
  - the address is three parts (TASK-352/565/583);
  - the chat's step machine gains DISTRICT/SUBDISTRICT;
  - counts: `strikeOrPrompt` 12, `afterParentLink` 4, `clearLinkSession` 4, "line-bound-to-other-family" 8;
  - the notice runs on the caller's tx.
  - Three code shapes were **kept** so their pins stand (the `settleLinkedRole` line, the summary's `summaryLines(next`, the zero-children tail through `afterParentLink`).
- **Mutations with `bun run mutation:run`:** baseline 51; CHECKSUM identical; every restore byte-identical:
  - **F1, a two-part address accepted:** BITES.
  - **F2, the province not checked:** BITES.
  - **F3, the writer's floor removed:** BITES. *(It SURVIVED first: no test handed the writer a partial address. Added; it bites.)*
  - **F4, the chat's confirm writes a partial address:** BITES.
  - **F5, a legacy province-only household asked again:** BITES.
  - **D1, a binding written without a child:** BITES.
  - **D2, the parent created outside the transaction:** BITES.
  - **D3, the write trusts the lookup:** BITES.
  - **D4, a linked account's phone honoured (a second family):** BITES.
  - **D5, the chat settles menus for a family that doesn't exist yet:** BITES.
- 📋 **COPY §18** (the chat's three address questions, the "registered meanwhile" sentence, the floor).

⛔ Only you mark this DONE. 🔴 **Deploy coupling: this ships with TASK-591, not before.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30)
Verified by me: **3699 / 0** · tsc 0 · **65 .sql, no migration** (counted myself).

## ✅ D11(a) — and the detail that makes it trustworthy
**A NEW phone writes NOTHING at the phone step.** **`registerFamilyWithFirstChild` = checks FIRST, then ONE transaction: parent + child + household + notice.** ✅ **A mid-transaction failure leaves NOTHING, proven by value on a staged-commit tx.**
🔑 **"Refusals never open the tx" is the line I want to keep.** ⇒ **A refusal that opens a transaction is a rollback someone has to trust; one that never opens it is a rollback nobody needs.** ✅ **And an existing phone still links at once** — *the change is scoped to the case that was broken.*

## ✅ The contract, written as a BLOCK — exactly as asked
**`/link` on a new phone ⇒ `outcome: "new"`, nothing written · `/create` + `phone` from an unlinked account creates the family WITH the child · `address` replaced by `province/district/subDistrict` · new codes `ADDRESS_INCOMPLETE {missing}` and `PHONE_NOW_REGISTERED` · `isNew` gone.**
🔑 **`ADDRESS_INCOMPLETE {missing}` is better than a bare refusal: it tells the screen WHICH part to ask for** — *the difference between "that is wrong" and "you need the sub-district".*
✅ **And `isNew` being GONE rather than left unused is the right shape** — *an unused flag is a reader waiting to happen.*

## 📌 The unreachable run earned its keep again
**It caught a test of his that was reading the 2FA setting FOR REAL.** ✅ Faked now.
🔑 **That is the third distinct thing the DB-unreachable run has found that a green suite would never have shown** — *a test quietly depending on a real database is a green for a reason unrelated to the code.* 📌 **Worth remembering the next time someone asks why we run it twice.**

## ⚖️ And the decisions held
✅ **The repair declined in writing, the query recorded, nothing run.** ✅ **F-C's limit stated.** 🔴 **Ships WITH TASK-591 — neither half works alone.**
