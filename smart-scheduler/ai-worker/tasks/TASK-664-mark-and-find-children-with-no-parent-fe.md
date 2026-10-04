# TASK-664 — piece B (FE): mark a no-household child in the picker, and make them findable on People — FE, S
- Source: TASK-644 piece B · Porter GO 2026-10-05 · wording `COPY-DRAFT-no-household-visible-teamB-2026-10-05.md` (DRAFT)
- Status: DONE — FINAL (reviewed by Silver, 2026-10-05) · pairs with TASK-663
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-05)
- Claim: `src/components/common/StudentSelect.tsx` · `src/components/partials/People/*` · the `student.*` keys in `dictionaries.ts` (granted 10-04; add any People keys under `student.*` or tell me). Co-located tests.

## §0 Why, and what it must NOT become
- 🔴 **This is the control the owner bought the import exemption with.** He permitted imports to create a child with no household *because* this makes them findable.
- **Two surfaces, and Porter wants both:**
  1. **The picker MARKS them.** Each row is a `StudentListItem` and already carries `parentId` (`types/api/contract.ts:742`). 🚫 No new field, no new query.
  2. **The People page can SHOW them.** Today it lists children by parent, so they are **unlisted**, not merely unlabelled.
- 🔴 **NOT a scary warning on an ordinary screen** (Porter). Staff see these rows every day, and a marker everyone learns to ignore is worse than none.
  - ⇒ **Quiet, factual, findable on purpose:** a small grey tag, with no red, no warning icon, no modal and no toast.
  - The reason is said **once**, where somebody went looking (the People filter's explainer), not on every row.

## What to do
1. **Picker (`StudentSelect.tsx`):** a row with `parentId === null` shows a small muted tag, `student.noParentTag` (draft "ยังไม่มีผู้ปกครอง / No parent linked").
   - The row stays pickable.
   - Rows with a parent are byte-unchanged.
   - 🚫 Don't change the sort. Alphabetical "sorts first" is not a defect (Sober).
2. **People page (`partials/People/*`):** a filter, **off by default**, that lists only the students with no parent linked, via `GET /students?noParent=true` (TASK-663). It shows:
   - the count beside the label;
   - the explainer line under it;
   - a quiet empty state.
   - Each row shows what the existing student rows show (name, nickname, birth date if present).
   - 🚫 **No action button:** no screen can set a parent today. 🚫 **No bulk action.**
   - **Decide and declare** where the filter sits, matching the page's existing filters (e.g. beside `BirthdayFilter`), and how it shares the page's archived toggle (a live-only list by default is the expected reading).
3. Wording: `COPY-DRAFT-no-household-visible-teamB-2026-10-05.md` §1–2, under `student.*` keys, marked `📋 DRAFT wording`. **It does not ship until the owner approves it.**

## Definition of Done
- [ ] **Clicked DOM tests:**
  - **Picker:** a parentless row shows the tag and is still pickable; a parented row shows no tag (pinned unchanged).
  - **People:** the filter is off by default (the page is unchanged); turning it on requests `noParent=true` and lists the rows with the count; the empty state shows when there are none; there is no action control in that view.
- [ ] **The "not scary" check, pinned:** the tag uses the muted styling and no warning colour or icon. Pin the class or style you choose, so a later "make it red" is a visible decision, not a drift.
- [ ] Mutation set `src/components/common/no-parent-visible-task664.mutations.json` (front form: a plain list, as in TASK-662):
  - the tag shown on every row (bites);
  - the tag never shown (bites);
  - the filter on by default (bites);
  - `noParent` not sent (bites).
- [ ] `bun test`, `tsc --noEmit` and `bun run build`, with counts.
- [ ] 🚫 No click on sid or uat.
- [ ] `git status`: only these files. Nothing committed.

## For the QA hand-off
- **Screens:**
  - New course / booking picker: type a parentless child's name, and the row carries the grey "ยังไม่มีผู้ปกครอง" tag.
  - People → the filter lists them with the count. On uat that should include the 17 dormant rows plus any not yet repaired.

## Implementation Notes
**Fanta, 2026-10-05.** Repo `smart-scheduler-front`. Nothing committed. The tree also holds my TASK-662 files (the owner has not committed them yet), and no one else's.

**Files (TASK-664 only):**
- `M src/components/common/StudentSelect.tsx`
  - A row with `parentId === null` renders its label plus a tag `student.noParentTag`, with `data-no-parent-tag` and `NO_PARENT_TAG_CLASS` (muted grey: `bg-muted-100 text-muted-600`, 10px, no icon). Contrast #475569 on #f1f5f9 ≈ 7:1.
  - Rows with a parent render **exactly `r.label`** as before. The sort is untouched. The row stays a normal option, so it is pickable.
- `?? src/components/partials/People/NoParentList.tsx` (new, in the claimed folder): the list card.
  - The explainer appears **once** at its top. Rows show name · nickname · birth date or `—`, the same as the existing student list.
  - A quiet empty state. **No button, no link, no bulk action.**
- `M src/components/partials/People/PeopleContent.tsx`
  - A `Switch` labelled `student.noParentFilter`, **off by default**, beside `BirthdayFilter`. When on, the count appears beside it as ` (N)` with no extra words.
  - When on, `NoParentList` **replaces** the page's lists (families, birthday list, archived parents). When off, every existing line is unchanged.
- `M src/lib/i18n/dictionaries.ts`: 4 `student.*` keys (EN+TH, from the copy draft §1–2 verbatim), marked `📋 DRAFT wording`.
- `??` tests: `components/common/no-parent-tag-task664.dom.test.tsx` (3) and `components/partials/People/no-parent-filter-task664.dom.test.tsx` (4).
- `?? src/components/common/no-parent-visible-task664.mutations.json`.

**Decided and declared (internal; overturn freely):**
1. **No file outside the claim.** The People read reuses the existing `useBirthdayStudents(params)` → `listStudentsByBirthday`, which is already the generic `GET /students` with passed-through params. So `noParent=true` goes out with **no new hook or service**.
   - ⚠️ Two costs. The hook's name now under-describes it. And in offline **mock** mode (`NEXT_PUBLIC_USE_MOCK`) the mock ignores `noParent`.
   - A rename or a mock branch would touch `hooks/` and `services/` (unclaimed). Say if you want either.
2. **Placement:** in the toolbar, between `BirthdayFilter` and `Show archived`. It is a `Switch` like its neighbour, because it is an on/off view.
3. **Composition:** the same read, so the search `q` **and a set birthday range** ride along and the server composes them. The params are `{ ...(birthdayParams ?? {q}), noParent: "true", limit: 200 }`. Limit 200 is the birthday list's own.
4. **Archived:** live students only, whatever `Show archived` says (the server's default; `archived` is not sent). The question is "who can a parent not see", and an archived child is not booked.
5. **The pinned birthday lines stay byte-identical.** `lib/people/birthday-filter.test.ts` (unclaimed) pins `{birthdayParams !== null ? (` and the list slice, so the new view **wraps** the existing expression from outside (`{noParent ? <NoParentList/> : (<>…</>)}`) rather than editing it. The inner lines are not re-indented, to keep the diff surgical.
6. **The count is the length of the rows returned** (capped at 200, like the birthday list). It shows only while the filter is on, because "off" asks nothing.

**Verification:**
- `bun test src/components/common/no-parent-tag-task664.dom.test.tsx src/components/partials/People/no-parent-filter-task664.dom.test.tsx` → **7 pass / 0 fail**. All clicked:
  - picker: the parentless row has the tag and is picked (`id` reported); the parented row has no tag and its text is exactly its label; **the "not scary" pin**: the exact class, no warning colour, no `svg`.
  - People: off by default (no `noParent` request, families view as before); **on ⇒ the request carries `{ noParent: "true", limit: 200 }`** (read at the wire), 2 rows, the DOB formatted, the explainer once, **0 buttons or links** in the list, `(2)` beside the label; on with none ⇒ the empty state and `(0)`; the search `q` rides on the same read.
- Mutation set: `bun run mutation:run -- --tests "<the two files>" --mutations src/components/common/no-parent-visible-task664.mutations.json`
  ```
  BASELINE 7 pass / 0 fail
  T1 tag on every row ........ BITES 6/1
  T2 tag never shown ......... BITES 5/2
  T3 tag made red ............ BITES 6/1   (the "not scary" pin)
  F1 filter on by default .... BITES 3/4
  F2 noParent not sent ....... BITES 5/2
  CHECKSUM identical
  ```
- Full: `tsc --noEmit` exit 0 · **`bun test` 991 pass / 0 fail across 110 files** · `bun run build` ok.
  - My first draft tripped the TASK-596 rule (`=== null` on a node). Fixed to `!node` in my file.
- 🚫 No click on sid or uat.

**Footprint:** no data. The runner restored every file (checksum identical).

**Ship gate:** the 4 keys are `📋 DRAFT wording`. When the owner approves, I update any words that differ and drop the markers, the same way as TASK-662.

## Questions

## Review
**Silver, 2026-10-05 — ✅ ENGINEERING ACCEPTED. Held ONLY on the owner's wording** (`COPY-DRAFT-no-household-visible-teamB-2026-10-05.md`).
- **Diff read:**
  - **Picker:** a parentless row gets the muted tag; parented rows render exactly `r.label`; the sort is untouched; the row is pickable.
  - **People:** an off-by-default `Switch` beside `BirthdayFilter`. When on, `NoParentList` replaces the lists. When off, every existing line is unchanged, because the pinned birthday lines are wrapped, not edited.
  - **No action control**, as specified.
- **All 6 declared decisions are accepted:**
  - reusing `GET /students` through the existing hook, which avoids leaving the claim. The hook's name under-describes it, and mock mode ignores `noParent`; both are noted and neither is needed now;
  - the placement;
  - search and birthday composing on the server;
  - live only;
  - wrapping rather than editing pinned lines;
  - the count shown only while on.
- **Wording:** a machine check finds all 4 keys equal to the draft §1–2 strings, marked DRAFT.
- **"Not scary" is pinned and bites** (T3, "tag made red"). That is exactly the drift Porter wanted guarded.
- **Re-run by me:** **full front suite 991 / 0** (110 files); `tsc` exit 0.
- **When the wording is approved:** update any differing words, drop the markers, re-run, and send me that diff. Ships as a pair with TASK-663.

## Final step (Silver, 2026-10-05): the owner APPROVED the wording AS DRAFTED
- Approval record: `COPY-DRAFT-no-household-visible-teamB-2026-10-05.md` § "OWNER APPROVED".
- @Fanta:
  - **remove the 4 `📋 DRAFT wording` markers only.** The approved strings ARE your strings; 🚫 do not touch them.
  - **Write the owner's three judgements into the code comments** beside the tag, the explainer and the list, so nobody "tidies" them later:
    1. the tag states a fact (never error, invalid or broken) and the row stays pickable;
    2. the explainer appears ONCE, under the filter, never per row;
    3. NO action button, because no screen can set a parent. The view makes them visible; it does not fix them.
  - Your existing pins already guard 1 and 3 (the "not scary" class, and 0 buttons). Confirm they still bite.
  - Re-run this TASK's tests and send me the diff. Then 664 is FINAL and pairs with TASK-663.

### Final step done (Fanta, 2026-10-05)
- **The markers.** There are **two** marker comments, not four: one EN block and one TH block, each covering the 4 keys. Both are replaced. **All 8 strings are byte-unchanged** (`git diff -U0` shows them exactly as drafted):
  ```
  - // 🔴 TASK-664 — 📋 DRAFT wording (Silver, COPY-DRAFT-no-household-visible-teamB-2026-10-05.md §1–2; not yet approved).
  + // 🔴 TASK-664 — ✅ owner-approved 2026-10-05, as drafted (COPY-DRAFT-no-household-visible-teamB-2026-10-05.md §1–2).
  - // 🔴 TASK-664 — 📋 DRAFT wording (see the EN block).
  + // 🔴 TASK-664 — ✅ owner-approved 2026-10-05 (see the EN block).
  ```
- **The owner's three judgements are written into the code, each marked `🔒 OWNER'S JUDGEMENT (approved 2026-10-05, do not "tidy")`:**
  1. `StudentSelect.tsx`, at the tag: it states a FACT (never error, invalid or broken), the row stays PICKABLE, muted with no icon.
  2. `NoParentList.tsx`, at the explainer: ONCE, under the filter, never per row, and why.
  3. `NoParentList.tsx`, at the rows: NO action button and no bulk action, because no screen can set a parent; the view makes them visible and does not fix them.
- **The pins still bite, and two rows were added so judgements 1 and 3 each have a bite of their own:**
  ```
  BASELINE 7 pass / 0 fail
  T1 tag on every row ............................ BITES 6/1
  T2 tag never shown ............................. BITES 5/2
  T3 tag made red ("not scary") .................. BITES 6/1
  T4 parentless row made unpickable (judgement 1)  BITES 6/1   ← new
  F1 filter on by default ........................ BITES 3/4
  F2 noParent not sent ........................... BITES 5/2
  F3 an action button on each row (judgement 3) .. BITES 6/1   ← new
  CHECKSUM identical
  ```
- **Re-run:** this TASK's 2 files + `src/lib/i18n` → 14 / 0 · `tsc --noEmit` exit 0 · **full suite 991 / 0 across 110 files** · build ok. Nothing committed.

- ✅ **Final step accepted (Silver, 2026-10-05):**
  - 0 DRAFT markers remain, and a machine check finds all 8 approved strings present verbatim.
  - The owner's 3 judgements are in the code, marked `🔒 OWNER'S JUDGEMENT`.
  - T4 (unpickable) and F3 (action button) give judgements 1 and 3 their own bite.
  - My re-run of the 2 task files gives 7/0.
  - **TASK-664 is FINAL.**
