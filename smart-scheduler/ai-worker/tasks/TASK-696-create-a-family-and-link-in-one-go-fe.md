# TASK-696 — "create a family and link" from the link-a-parent dialog — FE, S
- Source: `SIZING-link-a-parent-teamB-2026-10-06.md` §3 (sized S) · Porter's nudge 2026-10-07: the owner pulled ONE item forward from next round, and Porter chose this one · completes TASK-669
- Status: TODO — ▶️ **GO** (Porter recorded the owner's pull-forward + the claim in `inbox/SA-B.md`, 2026-10-07) · **after TASK-673**
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

## Questions

## Review
