# TASK-669 — link a parent from the no-parent list (FE) — FE, S–M
- Source: `SIZING-link-a-parent-teamB-2026-10-06.md` · Porter's plan (Thu–Fri) · the BE is TASK-668
- Status: REVIEWED — engineering accepted by Silver (2026-10-06); ⛔ held ONLY on the owner wording (§C) · 🔴 ships ONLY with TASK-668
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-06)
- 🔴 **Ships ONLY with TASK-668.**
- **Claim:**
  - `partials/People/*` ✅;
  - ✅ `src/services/people.service.ts` + `people.mock.service.ts` (the call);
  - ✅ `src/hooks/scheduler/usePeople.ts` (the hook);
  - ✅ the `people.*` keys in `dictionaries.ts`;
  - ✅ `src/lib/rbac/action-gate.test.ts` (+1 door), and any `src/lib/people/*` pin that counts People doors.
  - STOP for anything else.

## What to build
1. **A per-row door "ผูกผู้ปกครอง / Link a parent"** on the no-parent list, beside TASK-665's archive door. It is gated by `people.parent-students`, asked **as a literal** (so the sweep sees it).
   - **Link** is the act for a real child; **archive** is the act for a title row.
2. **The family picker:** the People page's **existing** parent search (`GET /parents?q=`, name or phone). No new read.
   - 🚫 **"Create a family and link in one go" is NOT in scope this round** (Porter). Staff create the family on People first.
3. **The confirm, which is the point of this TASK. It shows, before the admin presses Link:**
   - **the chosen family's existing children, by name.** 🔑 This is the "two Aris" case: the admin must SEE the duplicate, **not be warned by a heuristic**;
   - **the child's upcoming sessions** (count + next date), using the same "upcoming" set as TASK-668 / the archive refusal;
   - **"this link can't be undone from the screen"** (nothing un-links).
4. **On success:** the success notice, and the row leaves the list (re-read the student list, so the count drops by one).
   - **On 409:** show the server's sentence (the child was linked meanwhile). The cap and archived-family refusals show their existing sentences.
5. **Wording:** `COPY-DRAFT-teamB-week-to-10-11-2026-10-06.md` §C, keys under `people.*`, shipped `📋 DRAFT wording`. Nothing ships unapproved.
6. **Update the `🔒 OWNER'S JUDGEMENT` comment:** judgement #3 forbade a button promising what the product cannot do. **This button does it** (TASK-668), so it does not reverse #3.

## Definition of Done
- [ ] **Clicked DOM tests:**
  - the door opens the picker;
  - picking a family shows a confirm that **lists that family's children by name** and the child's upcoming sessions, plus the "cannot be undone" line;
  - confirming posts `/students/{id}/parent` with that `parentId` **only**;
  - success ⇒ the row leaves and the count drops;
  - a 409 ⇒ the server's sentence, and the row stays;
  - no bulk link control (pinned).
- [ ] Mutation set (front form, `--tests` declared):
  - the confirm without the family's children (bites);
  - without the upcoming sessions (bites);
  - a link without the confirm (bites);
  - the wrong `parentId` posted (bites).
- [ ] `bun test`, `tsc` and `build`, with counts. 🚫 No click on sid or uat. Nothing committed.

## QA hand-off
- **Screen:** People → "นักเรียนที่ยังไม่มีผู้ปกครอง" → **ผูกผู้ปกครอง** on a test child → search a family → the confirm names the family's children and the upcoming sessions → Link ⇒ the row leaves and the count drops.
  - On the family's card, the child now appears.
  - 📌 From the next event on, that family's LINE receives notices for this child. That is expected.

## Implementation Notes
**Fanta, 2026-10-06.** Repo `smart-scheduler-front`. Nothing committed. The tree also holds my uncommitted TASK-624, 665 and 670 work and no one else's. Built against Bob's contract in TASK-668 §Implementation Notes (read, not assumed).

**Files (this TASK only):**
- `?? partials/People/LinkParentDialog.tsx` (new): one dialog, two steps.
  1. **Pick:** the People page's OWN parent search, `useParents({ q, limit: 10 })` → `GET /parents?q=`. Four states (loading, error with the server's sentence, empty = the existing `people.noMatch`, results). No new read.
  2. **Confirm:** `useLinkParentPreview` = the server's `dryRun`. It shows **the family's existing children BY NAME** (nickname in brackets when it differs, so two "Ari"s are visibly two), **the child's upcoming sessions** (count + next date, exactly as the server sent), and **"this link can't be undone from the screen"**. Link is shut until the dry run has answered, and stays shut if it refused.
- `M partials/People/NoParentList.tsx`: a per-row **Link a parent** door beside the archive door (`canLink`, `onLink`, `data-no-parent-link`). The `🔒 OWNER'S JUDGEMENT` comment is updated as asked: #3 is **not reversed**; it barred a button the product cannot honour, and TASK-668 built the act.
- `M partials/People/PeopleContent.tsx`: `linkTarget` state, `canLink={can("action:people.parent-students")}` **asked as a literal** (the sweep sees it), and the dialog.
- `M services/people.service.ts`: `previewLinkParent` (`POST /students/:id/parent`, `{ parentId, dryRun: true }`) and `linkParentToStudent` (`{ parentId }` only), with the two response types. `M services/people.mock.service.ts`: the offline twins.
- `M hooks/scheduler/usePeople.ts`: `useLinkParentPreview` and `useLinkParent` (invalidates the families **and** the student reads, so the row leaves and the count drops).
- `M lib/i18n/dictionaries.ts` (`people.*` only): 10 keys, EN + TH, `COPY-DRAFT-teamB-week-to-10-11-2026-10-06.md` §C verbatim, marked **`📋 DRAFT wording`**. The cap and archived-family refusals are the server's own sentences, shown as sent (reused, not new).
- `M lib/rbac/action-gate.test.ts`: **one number**, `108 → 109`, with a TASK-669 note in the file's style. Granted in this TASK's claim ("+1 door"). No other line.
- `M no-parent-filter-task664.dom.test.tsx` and `no-parent-archive-task665.dom.test.tsx` (my own, in `People/*`): their control-count pins were "one archive door per row"; they now say "one archive door and one link door per row, nothing else".
- `?? partials/People/link-parent-task669.dom.test.tsx` (10) · `?? …/link-parent-task669.mutations.json` (10).

**Decided and declared (internal; overturn freely):**
1. **The confirm's read is a `useQuery`, although it is a POST.** It is a read (the dry run writes nothing, pinned by Bob). It has its **own key root** (`["link-parent-preview", …]`), not under `PARENTS_KEY`, and `gcTime: 0`: the link invalidates the families, and a still-open confirm would otherwise re-ask a question whose answer is now "this child already has a parent". It can never show a stale preview for a family that has changed.
2. **The picker lists the first 10 families even before the admin types**, and typing narrows them (the same `q` the page uses). I did not add a "type to search" hint: that would be a new sentence. With more than 10 families the admin narrows by typing.
3. **The contract types live in `people.service.ts`**, not `types/api/contract.ts` (outside the claim).
4. **Link is shut while the dry run is loading or has refused.** A cap or archived-family sentence on the dry run means there is nothing to confirm.
5. After a successful link the dialog closes and the success notice (`people.linkParentDone`) shows; the row leaves because the student reads are re-read.

**Verification:**
- `bunx tsc --noEmit` exit 0 · `bun run build` exit 0.
- `link-parent-task669.dom.test.tsx` → **10 pass / 0 fail**, all clicked and read at the wire:
  - a link door on every row; opening the picker posts nothing; typing narrows by name or phone;
  - **picking a family posts the dry run ONLY** (`{ parentId, dryRun: true }`) and shows both of a family's two "อาริ" children by name, "has 3 upcoming session(s)" with the next date, and the "can't be undone" line; a family with no students and a child with no upcoming sessions say so;
  - **confirming posts `/students/s-child/parent` with `{ parentId: "p-ari" }` and nothing else** (never the child's id, no `from`, no `dryRun`); the other family's id rides when the other is picked; the dialog closes, the row leaves, the count drops (`(2)` → `(1)`);
  - a `409` on the link shows the server's sentence, the row stays; a refusal on the dry run (the cap) shows its sentence and **Link stays shut**;
  - without `people.parent-students` there is no link door (the archive door is its own key); one link door per row, 0 checkboxes, no "link all".
- Mutation set `link-parent-task669`: `bun run mutation:run -- --tests "src/components/partials/People/link-parent-task669.dom.test.tsx src/components/partials/People/no-parent-archive-task665.dom.test.tsx src/components/partials/People/no-parent-filter-task664.dom.test.tsx" --mutations src/components/partials/People/link-parent-task669.mutations.json`
  ```
  BASELINE 19 pass / 0 fail
  K1 confirm without the family's children ........ BITES 18/1
  K2 confirm without the upcoming sessions ........ BITES 18/1
  K3 a link WITHOUT the confirm ................... BITES 14/5
  K4 the wrong parentId posted .................... BITES 17/2
  K5 "can't be undone" dropped .................... BITES 18/1
  K6 the confirm's read is not a dry run .......... BITES 12/7
  K7 the door shown without the permission ........ BITES 18/1
  K8 a bulk "link all" control .................... BITES 16/3
  K9 the server's sentence replaced by a generic .. BITES 18/1
  K10 Link enabled whatever the dry run said ...... BITES 18/1
  CHECKSUM identical
  ```
  (The DoD's four are K1–K4.)
- **Full `bun test`: 1035 pass / 4 fail across 116 files.** The 4 are exactly the TASK-624 pins awaiting Silver's answer to TASK-624 Q1; this TASK adds no failure and moves no pin outside the granted one.
- 🚫 No click on sid or uat. **Footprint:** none (the runner restored every file).

## Questions
None for this TASK.
- 📌 For the release note, not a question: **from the next event on, a linked family's LINE receives notices for this child.** The confirm says so in its upcoming-sessions line when there are sessions, and Bob's route sends no notice at the moment of linking.

## Review
**Silver, 2026-10-06 — ✅ ENGINEERING ACCEPTED. Held ONLY on the owner's wording (§C, DRAFT). 🔴 Ships ONLY with TASK-668.**
- **Scope:** all inside the granted claim (`People/*`, `people.service` + mock, `usePeople`, the `people.*` keys, `action-gate` +1, your own People pins).
- **The confirm does its job:** the family's children BY NAME (two Aris are visibly two), the upcoming sessions, and "cannot be undone". Link stays shut until the dry run answers and while it refuses. The link posts `{ parentId }` only.
- **All 5 declared decisions are accepted.** The preview as its own `useQuery` key with `gcTime 0` is a careful touch: a stale preview after a link would have lied.
- **Re-run by me:** People/* + 670's files → **27 / 0**. The 10 link strings carry the DRAFT marker.
- **When the wording is approved:** swap in any differing words, drop the markers, re-run, and send me that diff.
