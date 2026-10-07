# TASK-696 — "create a family and link" from the link-a-parent dialog — FE, S
- Source: `SIZING-link-a-parent-teamB-2026-10-06.md` §3 (sized S) · Porter's nudge 2026-10-07: the owner pulled ONE item forward from next round, and Porter chose this one · completes TASK-669
- Status: DONE (reviewed by Silver, 2026-10-07) · rides the NEXT deploy with TASK-673
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-07)
- **Claim ✅ GRANTED by Porter, 2026-10-07:**
  - `partials/People/*`, incl. `LinkParentDialog.tsx`, `ParentFormModal.tsx` and their tests;
  - `src/hooks/scheduler/usePeople.ts`;
  - 🚫 **NO dictionary write.** STOP for anything else.
- **Back end: none.** `POST /parents` (gated by `action:people.parent-create`) and `POST /students/:id/parent` both exist, and both refuse.

## §0 Why
- TASK-669 links a child **only to a family that already exists**.
- Khwan's real case, twice (ตินติน), is a phone for a family that is **not in the system yet**. Today the admin must leave the dialog, create the family on People, come back and search again.
- ⇒ The door we just shipped does not help in the case she hits most.

## What to build
1. **In `LinkParentDialog`'s PICK step, add a create button** that reuses the People page's own **"เพิ่มผู้ปกครอง / Add parent"** (`people.addParent`).
   - It is shown **only with `action:people.parent-create`**, asked **as a literal** so the sweep sees it.
   - Without that key, the dialog is exactly TASK-669's.
2. **The button opens the EXISTING `ParentFormModal`** in add mode, with the same fields and words.
   - Add an optional callback (e.g. `onCreated(parent)`) so the caller receives the new family.
   - 🔴 **The People page's own use of the modal is unchanged** (pinned).
3. **On create, go straight to TASK-669's CONFIRM step with that family chosen.** That means the same dry run, the same confirm, and the same Link button.
   - The family's children will show as "none" (the existing `people.noMatch` / no-students line); the child's upcoming sessions show as before.
   - 🔑 **The confirm is NOT skipped.** "Can't be undone" still applies.
4. **Refusals are the server's sentences, shown as sent.** No new words.
   - Create refusals: a bad phone (`เบอร์โทรไม่ถูกต้อง`), a phone that already has a family (`เบอร์นี้มีผู้ปกครองในระบบแล้ว`, so the admin searches for that family instead), an archived family (`PARENT_ARCHIVED`).
   - Then the link refusals, exactly as in TASK-669.
5. **Two calls, not one atomic act. Decide and declare it in Implementation Notes:**
   - If the admin closes the confirm after creating, **the family stays.** It is a real family with a real phone, visible on People.
   - If the link is refused after the create, the family also stays. Show the server's sentence.
   - 🚫 **Never auto-delete or archive the new family.** *(Porter, accepted:* an auto-delete would be the only destructive act in the whole flow, fired by a user who simply stopped halfway. A family row left behind is visible, searchable and harmless; one deleted because someone closed a dialog is unrecoverable and invisible.*)*
   - 🔴 **Create OK + link refused ⇒ the admin is told WHICH half happened, never a bare "failed" (Porter). Use existing words only:**
     1. the create shows its own success notice (`people.parentSaved`, "บันทึกผู้ปกครองแล้ว" + the name or phone);
     2. the dialog **stays on the confirm for THAT new family** (it never goes back to the create form);
     3. the link refusal shows the server's sentence there.
     - ⇒ A retry links the **same** family and can never create a second one. The server also refuses a second create with that phone ("เบอร์นี้มีผู้ปกครองในระบบแล้ว").
     - If this still reads as unclear, it would need a NEW sentence: STOP and ask me (owner wording).
6. 🚫 **No new wording.**
   - Reuse `people.addParent`, `ParentFormModal`'s keys and TASK-669's §C keys.
   - **If any new sentence seems needed (e.g. a hint like "family created — now confirm the link"), STOP and ask me.** That would need the owner.
7. The phone-shape rule is the server's (`createParent`: a normalised phone of at least 9 digits, the TASK-644 ruling). 🚫 Do not add a second client-side rule beyond the modal's existing "phone required".

## Definition of Done
- [ ] **Clicked DOM tests (at the wire):**
  - with `parent-create`, the pick step shows the create button; without it, there is none;
  - create → `POST /parents` with the form body → then **the dry run for THAT new id** → the confirm shows → Link posts `/students/{id}/parent` with `{ parentId: <new id> }` only;
  - a create refusal (the duplicate phone) shows the server's sentence, and **no link call is made**;
  - close after create ⇒ no link call is made, and the family is not deleted;
  - 🔴 **create OK + link 409, by value:** the `parentSaved` notice was shown, the server's link sentence is on screen, the dialog is still on the NEW family's confirm, and pressing Link again posts the SAME `parentId`. **`POST /parents` is called exactly ONCE**;
  - the People page's own "Add parent" flow is unchanged (pinned);
  - TASK-669's tests still pass, with no pin moved.
- [ ] Mutation set (front form, `--tests` declared):
  - the confirm skipped after create (bites);
  - the link posts the wrong / old `parentId` (bites);
  - the create button shown without `parent-create` (bites);
  - a link attempted after a create refusal (bites);
  - after a refused link the dialog returns to the create form, or a second `POST /parents` is made (bites).
- [ ] `bun test`, `tsc` and `build`, with counts. 🚫 No click on sid or uat. Nothing committed.

## QA hand-off
- **Screen:** People → "นักเรียนที่ยังไม่มีผู้ปกครอง" → ผูกผู้ปกครอง → **เพิ่มผู้ปกครอง** → enter a NEW phone → save ⇒ the confirm opens for that family (no children yet) → Link ⇒ the row leaves, and the family's card shows the child.
- **Screen:** enter a phone that already has a family ⇒ *"เบอร์นี้มีผู้ปกครองในระบบแล้ว"*, and nothing is linked.
- 📌 As in TASK-669: from the next event on, that family's LINE receives notices for this child.

## Implementation Notes
**Fanta, 2026-10-07.** Repo `smart-scheduler-front`. Nothing committed. Tree = my uncommitted TASK-673 work plus this TASK. **No BE, no new wording, no dictionary write** (existing keys only: `people.addParent`, `people.parentSaved`, ParentFormModal's, TASK-669's §C).

**Files (this TASK only, all in `partials/People/*`):**
- `M ParentFormModal.tsx`: ONE optional prop, `onCreated?: (parent: Parent) => void`. In add mode, after the success notice and before `onClose`, it is called with the family the server just created. Never on a refusal, never in edit mode. **The People page does not pass it, so its own "Add parent" flow is exactly as before (pinned).**
- `M LinkParentDialog.tsx`: in the PICK step, a **create button** (`people.addParent`, `data-link-create`) shown only with `action:people.parent-create`, **asked once and as a literal** (`canCreateParent`). It opens the existing `ParentFormModal` in add mode; `onCreated` sets the new family as the chosen one, so the dialog goes **straight to TASK-669's confirm for it**: same dry run, same confirm, same Link button, "can't be undone" still shown.
- `?? link-parent-create-task696.dom.test.tsx` (6) · `?? link-parent-create-task696.mutations.json` (6).

**Decided and declared (the two-calls rule, as the TASK asked):**
1. **Two calls, not one atomic act:** create first, link second. After a create the family is a real row.
   - **The admin stops after the create ⇒ the family STAYS** (visible and searchable on People). **The link is refused after the create ⇒ the family STAYS.** 🚫 Nothing in this code deletes or archives a family: pinned by absence (no DELETE, no archive call) and by value.
2. **Create OK + link refused:** the create's own notice (`people.parentSaved`, with the family's name) was shown; the dialog **stays on the confirm for THAT new family** (it never returns to the create form or the pick step), and the server's link sentence is on it. **Link again posts the SAME `parentId`, and `POST /parents` was called exactly once**: a retry can never make a second family. No new sentence was needed.
3. **Create refused** (e.g. the phone already has a family): the modal's existing error notice carries the server's sentence as its description; the dialog stays on the pick step and **no dry run and no link** is attempted (the admin searches for that family instead).
4. **The phone-shape rule is not duplicated.** The modal's existing "phone required" is the only client check; the server's `createParent` rule (a normalised phone of **at least 9 digits**, the TASK-644 ruling) decides the rest. *(Corrected 2026-10-07 at Silver's review: this line first said "5-digit", which was wrong.)*

**Verification:**
- `bunx tsc --noEmit` exit 0 · `bun run build` exit 0.
- `link-parent-create-task696.dom.test.tsx` → **6 pass / 0 fail**, clicked and read at the wire:
  - with `people.parent-create` the pick step shows the button; **without it there is none** and the picker is untouched;
  - **create posts the form body once → the dry run for THAT new id → the confirm (title "Link น้องมิว to แม่ตินติน?", "This family has no students yet.", "can't be undone") → Link posts `{ parentId: "p-created" }` only**; the row leaves;
  - create REFUSAL ⇒ the server's sentence as the notice's description, still on the pick step, **no dry run, no link**;
  - 🔴 **create OK + link 409, by value:** the `parentSaved` notice (with the name), the server's sentence on the confirm, still the NEW family's confirm, **the create form did not reopen**, Link again posts the same `parentId`, `POST /parents` exactly **1**;
  - close after create (Escape) ⇒ no link, no delete, no archive, one create;
  - the People page's own "Add parent": creates, the saved notice, and **no link dialog, no dry run, no link**.
  - TASK-669's 10 tests are unchanged and still pass.
- Mutation set `link-parent-create-task696`: `bun run mutation:run -- --tests "src/components/partials/People/link-parent-create-task696.dom.test.tsx src/components/partials/People/link-parent-task669.dom.test.tsx" --mutations src/components/partials/People/link-parent-create-task696.mutations.json`
  ```
  BASELINE 16 pass / 0 fail
  V1 the confirm SKIPPED after create ............ BITES 13/3
  V2 the wrong / old parentId posted ............. BITES 14/2
  V3 the create button without the permission .... BITES 15/1
  V4 a link attempted after a create refusal ..... BITES 14/2
  V5 a refused link returns to the CREATE form ... BITES 15/1   (first run: SURVIVED → test strengthened, re-run)
  V6 a refused link drops the new family ......... BITES 14/2
  CHECKSUM identical
  ```
  The TASK-669 set re-run on the changed dialog: all BITES, checksum identical.
- **Full `bun test`: 1084 pass / 1 fail across 121 files.** The 1 is the pin in Q1 and nothing else.
- 🚫 No click on sid or uat. **Footprint:** none (the runner restored every file).
- 📌 **Found and fixed on the way (also recorded in SYSTEM-FACTS):** three other dom tests `mock.module("@/lib/ui/notify")` with a collector and Bun keeps it for the whole run, so a toast "on screen" passed alone and failed in the full suite (3 of my 6 tests). The tests now assert on what `notify` was called with.

## Questions
- **Q1 — ONE pinned count outside the claim (STOP, as the TASK says).** The create button is a new door, asked **as a literal** as the TASK requires ("so the sweep sees it"). That moves exactly one number: `src/lib/rbac/action-gate.test.ts:69` `expect(sites.length).toBe(109)` → **110** (verified: *Expected 109, Received 110*). TASK-696's claim names `partials/People/*`, `usePeople.ts` and "no dictionary write", not that file (TASK-669's claim did). Proposal: **`109 → 110` and a TASK-696 note** in the file's style: "+ the link dialog's create-family door, on the EXISTING `people.parent-create` key (the one the page's Add-parent button asks), asked as a literal". Nothing else in the file.
  - 🚫 What I did NOT do: hoist the key into the page's existing variable so the count stays 109. That would hide a new door from the sweep that exists to count doors. (I did ask the key once, not twice, so the count moves by exactly one.)
  - May I make that one edit?

## Review
**Silver, 2026-10-07 — engineering ✅ ACCEPTED in-claim; ⛔ waiting ONLY on Q1 (a claim, which is Porter's to grant).**
- **Re-run by me** (with the tree quiet): `People/*` → **25 / 0**; set `link-parent-create-task696` → **6/6 BITES**, `CHECKSUM identical`.
- `ParentFormModal` gains only the optional `onCreated`; the People page's flow is unchanged and pinned.
- **The half-done case is pinned by value, exactly as Porter asked:** the notice, the same confirm, the same `parentId`, `POST /parents` ×1.
- **All 4 declared decisions accepted.** ⭐ Refusing to hoist the key so the count "stays 109" was right: the sweep exists to count doors.
- **Q1 answer:** `action-gate.test.ts:69` `109 → 110`, ONE number + a TASK-696 note, nothing else. The file is clean and committed, and no open TASK names it. **Asked @Porter for the claim (2026-10-07); do NOT edit until I write GO.**
- 📌 Fix in your notes: decision 4 says "5-digit"; the server's rule is **≥ 9** (`createParent`).
- **Q1 — ✅ GRANTED by @Porter (2026-10-07): `action-gate.test.ts:69` ONLY, `109 → 110`, on condition that the NEW door is NAMED, not merely counted.**
  - Checked: it is named nowhere today. `:111` asserts `ParentFormModal`'s own gate, not this door.
  - ⇒ **On that same line 69**, after the count, add an inline assertion that names the site, plus a TASK-696 note:
    ```ts
    expect(sites.length).toBe(110); expect(sites.some((s) => s.file.endsWith("People/LinkParentDialog.tsx") && s.key === "action:people.parent-create")).toBe(true); /* TASK-696: + the link dialog's "create a family" door … */
    ```
  - It must be inline, because `has()` is declared below line 69.
  - Keep the existing TASK-669 note on that line.
  - 🚫 Nothing else in the file. Make sure it bites: remove the door ⇒ both the count and the name fail.


### Q1 done as granted; a SECOND pin found behind it → Q2 (Fanta, 2026-10-07)
**Line 69, exactly as Porter's condition (diff is one hunk, `@@ -69 +69 @@`, nothing else in the file):**
```
- expect(sites.length).toBe(109); /* TASK-669: …
+ expect(sites.length).toBe(110); expect(sites.some((s) => s.file.endsWith("People/LinkParentDialog.tsx") && s.key === "action:people.parent-create")).toBe(true); /* TASK-696: + the link dialog's "create a family" door, on the EXISTING `people.parent-create` key …, asked ONCE as a literal and NAMED here — a count alone passes for any door (Porter's condition) */ /* TASK-669: …
```
The existing TASK-669 note is kept. Line 69 now **passes**, and the new door is NAMED (a count alone would pass for any door).

**But that test has a second assertion directly under it that only runs once line 69 passes:**
- **Q2 — `src/lib/rbac/action-gate.test.ts:70`:** `expect(new Set(sites.map((s) => s.file)).size).toBe(39)` → **40** (verified: *Expected 39, Received 40*). It counts the DISTINCT files that hold a gate, and `partials/People/LinkParentDialog.tsx` had none until this TASK, so the new door adds a FILE as well as a site. Its note already lists the files each earlier task added ("+ UndoControl · + OtherSeriesContent · + VoucherPanel · + ClashResolveBox").
- ⛔ **Outside the grant** ("line 69 ONLY"), so I have NOT touched it. Proposal: `39 → 40` with a TASK-696 note in that line's style ("+ LinkParentDialog (TASK-696)"). The new file is also named by the line-69 assertion, so this edit is a count that is now backed by a name.
- 🔴 **Bites, as asked:** removing the door fails BOTH the count and the name on line 69 (and line 70's file count once granted). I checked the first by running with the door's key present; I will re-prove all three by mutation as soon as line 70 is granted, since a sweep that fails at line 69 hides what comes after it.
- 📌 Lesson for the next one (not a request): this test has several assertions after line 69; an edit there should be sized by running the test to the end, not just to its first failure. I asked about 69 only because it was the first one that failed.
- **Everything else is green:** `tsc` exit 0, full suite **1084 pass / 1 fail across 121 files**, the 1 being this sweep (now at line 70).
- **Q1 done as granted:** verified by me (`:69` = 110 + the door named inline; the TASK-669 note kept).
- **Q2 (`:70`, 39 → 40):** my miss, not Fanta's (**F-012**). I asked for `:69` without running past it.
  - Asked @Porter for `:70` ONLY: `39 → 40` + `LinkParentDialog (TASK-696)` in that line's file list comment.
  - The naming condition is **already met**: `:69`'s new assertion names `People/LinkParentDialog.tsx`.
  - ⛔ Don't touch `:70` until I write GO.
- **Q2 — ✅ GRANTED by @Porter (2026-10-07): `:70` ONLY, `39 → 40`**, under the same naming condition.
  - The condition is met by `:69`'s inline assertion (it names `People/LinkParentDialog.tsx`). Add `· TASK-696: + LinkParentDialog` to `:70`'s existing comment.
  - Then: the full suite, and re-prove count + name + file by mutation (remove the door ⇒ `:69` and `:70` both red).

### Q2 done as granted; re-proof (Fanta, 2026-10-07)
**Line 70 only (`git diff -U0 action-gate.test.ts` = ONE hunk `@@ -69,2 +69,2 @@`, the two granted lines, nothing else in the file):**
```
- … .size).toBe(39); /* + UndoControl (TASK-518) · + OtherSeriesContent · TASK-440: + VoucherPanel · TASK-457: + ClashResolveBox */
+ … .size).toBe(40); /* … · TASK-457: + ClashResolveBox · TASK-696: + LinkParentDialog (named on the line above) */
```
**Re-run:** `bunx tsc --noEmit` exit 0 · **full `bun test` 1085 pass / 0 fail across 121 files** · `bun run build` exit 0.

**The re-proof Porter asked for — remove the door ⇒ the sweep goes red, on each of count, NAME and file:**
- **Mutation set** `src/lib/rbac/action-gate-task696.mutations.json`, `bun run mutation:run -- --tests "src/lib/rbac/action-gate.test.ts" --mutations src/lib/rbac/action-gate-task696.mutations.json`:
  ```
  BASELINE 8 pass / 0 fail
  Q1 the create door REMOVED ........................................ BITES 7/1
  Q2 the door asked under ANOTHER key (count + files right) ......... BITES 7/1   ← only the NAME can catch this
  Q3 a SECOND gate literal in the same file (count 111, name holds) . BITES 7/1   ← the count catches this
  CHECKSUM identical
  ```
- 🔑 **A sweep stops at its first red assertion, so one mutation cannot show all three.** So I also evaluated the three predicates of lines 69–70 on the real sources with the door removed **in memory only** (a scratch script; nothing under the repo was written):
  ```
  door PRESENT : count=110 named=true  files=40     (the three values the test now asserts)
  door REMOVED : count=109 named=false files=39     (each one differs on its own)
  ```
  ⇒ removing the door breaks the **count** (110→109), the **name** (line 69's inline assertion) and the **file count** (40→39, line 70). Q2 proves the name is not redundant with the count; Q3 proves the count is not redundant with the name.
- `git status`: my TASK-673 files (accepted, not yet committed), the TASK-696 files, `action-gate.test.ts` and the new set. Nothing committed.

**Silver, 2026-10-07 — ✅ DONE.**
- `action-gate.test.ts` is ONE hunk over `:69`–`:70`, exactly the two grants.
- **Re-run by me:** the **full front suite 1085 / 0** (121 files). Set `action-gate-task696` → **3/3 BITES**, `CHECKSUM identical`.
  - ⭐ Q2 proves the point of Porter's condition: a door under the wrong key keeps both counts right, and **only the name catches it**.
- Earlier: People 25/0, set `link-parent-create-task696` 6/6.
- **Files to commit, all of TASK-696:**
  - `People/LinkParentDialog.tsx`, `People/ParentFormModal.tsx`;
  - `People/link-parent-create-task696.dom.test.tsx` + `.mutations.json`;
  - `lib/rbac/action-gate.test.ts` + `action-gate-task696.mutations.json`.
