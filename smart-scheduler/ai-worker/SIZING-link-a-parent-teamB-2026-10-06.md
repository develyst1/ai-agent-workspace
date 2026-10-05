# SIZING — let an admin LINK A PARENT to a child that already exists — @Silver, 2026-10-06
**This file only sizes the work. 🚫 Nothing is built, nothing is cut.** Owner: "ให้ประเมินเรื่องผูกผู้ปกครองเลย". Sober's two facts are taken as given, not re-derived. Read in code today; **CERTAIN** unless marked.

## Size: **S/M overall**: **BE S + FE S–M**, plus **wording** (the owner's)
"Create the parent and link in one go" is **a separate second item, S** (§3).

## 1. Where it belongs: **its OWN narrow action. I agree with Porter.**
- The student edit's schema is a six-field allow-list (`validation.ts:471-478`: name · nickname · gender · birthDate · nationality · note), and `parentId` is not in it.
  - **Widening it is the wrong shape.** It would put "which family owns this child" on the same form as a typo fix, and it would accept **any** value, including a different family.
- ⭐ **A permission for exactly this act already exists:** `action:people.parent-students`, labelled **"ผูกนักเรียนกับผู้ปกครอง / Link a student to a parent"** (`permissions.ts:105`).
  - Today it gates only *creating* a child under a parent (`route-access.ts:150` → `POST /parents/:id/students`).
  - ⇒ **Reusing it needs no new key and no grant on any box.** (A new key is granted on every box and every role, and a key nobody holds is a feature nobody has.)
- **Shape:**
  - one route, e.g. `POST /students/:id/parent { parentId }`, gated by `people.parent-students`;
  - one service function in `parent.service.ts` (Team B's file);
  - its own validator in `validation.ts` (Team B's file).

## 2. Can it be made to REFUSE moving a child? **Yes, structurally, not by a check that a caller could skip.**
- The write itself carries the condition:
  - `UPDATE students SET parent_id = $parent WHERE id = $student AND parent_id IS NULL RETURNING id`.
  - **Zero rows ⇒ 409** (e.g. `STUDENT_ALREADY_HAS_PARENT`).
  - 🔑 The database decides **in the same statement**, so two admins at once, or a stale screen, cannot move a child. There is no "read, check, then write" gap.
- **It accepts no "from" family at all.** There is nothing a later caller could pass to make it re-parent.
- **Pins, so it cannot drift into the other thing:**
  - a test that a child **with** a parent is refused, and the row is unchanged;
  - a mutation dropping `AND parent_id IS NULL` must bite;
  - ⭐ a **source sweep** that `parent_id` / `parentId` is written in exactly the known places: creation, the import exemption, and this action.
  - ⇒ A future "move a child" would have to add a new writer **and** break that pin in plain sight.
  - This extends Sober's "nothing nulls it later" fact into "nothing moves it either".
- **The same guards as the "add a child" door, reused, not copied:**
  - `assertParentActive` (an archived family is refused, `parent.service.ts:46`);
  - **`assertCanAddStudent`, the 5-per-family cap**, because linking a sixth child is adding one.
- ⚠️ **It cannot be undone from a screen** (nothing un-links). A wrong link is fixed the way the owner fixes data today. ⇒ The confirm in §4 matters.

## 3. The household picker: **the existing parent search. "Create a family and link" is a SECOND item.**
- **Pick from existing families:** the People page's own parent search (`GET /parents?q=`, name or phone; `useParents`). No new read.
- **Create-and-link in one go: NOT in this item.**
  - Khwan has twice had a phone for a family that did not exist yet (ตินติน).
  - The parts exist (`POST /parents` creates a family, gated by `people.parent-create`), so it is a front-end flow: **create, then link**, two calls, both refusable.
  - **It is S on its own**, and it carries the phone-shape rule (≥9 digits, the same rule as TASK-644).
  - ▶️ **Owner's call: in the same round or the next.** Without it, staff create the family first on People, then link.

## 4. What happens the moment it links, and the screen SHOULD say so
**CERTAIN, the link itself sends nothing:** it writes no outbox row. What changes is **everything from then on:**
- the family's LINE account (if it is linked) **sees this child immediately**: check-in, leave, My courses;
- **every later event reaches them:** the next daily reminder, any confirm, move, cancel or deduction.
- ⇒ **A family that has heard nothing for weeks can start getting messages tomorrow morning.** The family sees it as "messages out of nowhere".

**The confirm should show, before the admin presses link:**
1. **the family's existing children** (names only, no guessing). Porter's Ari case: the family already had `Ari Khosla (V)`, and linking the old record gives **two Aris**. **The admin must see that, not be warned by a heuristic.**
2. **the child's live future sessions** (the count, and the next date). That is the same rule as the archive refusal, from the TASK-663/665 reads, so the admin knows what will start arriving.
- **Wording is new, a DRAFT for the round's one copy set.** I will draft it with the TASK.

## 5. Does it change the "(18)" list? **Yes, the row simply leaves.**
- The list's predicate is `parent_id IS NULL` (live). Once linked, the row no longer matches, and **the count drops by one** on the next read. No list code changes.
- 📌 **Where the action lives (INFERRED, the owner's call):** naturally as a second per-row door on the no-parent list, beside archive (TASK-665). **Link** is the right act for a real child; **archive** is the right act for a title row.
  - #3 is not reversed: this button **does** what it says.

## Order
1. **TASK-665 archive** and **the per-row uat read** first (Porter's order).
2. **Link a parent: BE S + FE S–M, one pair** (the row door, the parent picker, the confirm showing the family's children and the upcoming sessions).
3. **Create a family and link** as a follow-up, if the owner wants it now.

## Owner decisions, in one place
1. **Reuse `people.parent-students`** ("Link a student to a parent") rather than a new key? *I propose yes.*
2. **"Create a family and link" in this round, or next?**
3. **Approve the confirm wording** (draft to come): it shows the family's children and the upcoming sessions.
