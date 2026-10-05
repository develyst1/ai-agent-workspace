# TASK-669 — link a parent from the no-parent list (FE) — FE, S–M
- Source: `SIZING-link-a-parent-teamB-2026-10-06.md` · Porter's plan (Thu–Fri) · the BE is TASK-668
- Status: TODO — ▶️ **GO (Porter, 2026-10-06): claims granted.** Starts once TASK-668's route exists. **TASK-668 + TASK-669 are ONE ship-set** (like 665+667).
  - Wording: build against the drafts (§C), marked DRAFT. Swap in the approved words when they land (the same way as 658).
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

## Questions

## Review
