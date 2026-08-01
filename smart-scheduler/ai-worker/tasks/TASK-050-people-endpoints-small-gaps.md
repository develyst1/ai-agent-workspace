# TASK-050: scheduling (BE) — two small people-endpoint gaps (parent `note`, demographics on student-create)
- Source: SPEC-016 (REQ-019 follow-up)
- Status: DONE  (reviewed 2026-08-01 by Sober — parent `note` reachable at last (my TASK-049 spec error), demographics accepted on student-create so one call is enough; neighbouring endpoints untouched; tsc 0 / 280 tests)
- Assignee: @Jason (smart-scheduler-back, port 4006)

## Why (both surfaced during TASK-049's review — neither is urgent)
1. **Parent `note` is uneditable.** `parents.note` exists in the schema, and the People screen is meant to be
   where staff manage the record — but `POST/PATCH /parents` accept only phone/name/province, so the field can
   never be set. (**This was my spec error**, not Fern's: TASK-049 listed a note field that TASK-048's contract
   never provided. Fern correctly omitted it rather than inventing an endpoint.)
2. **A new student's demographics need a second write.** `POST /parents/:id/students` takes only
   name/nickname/note, so the FE does **create → `PATCH /students/:id`** to set gender/DOB/nationality. It works
   and is invisible to users, but a failure between the two leaves a student with no demographics (recoverable
   by editing).

## What to do
- Accept **`note`** on `POST /parents` and `PATCH /parents/:id` (validation + service + DTO). Nothing else about
  the parent endpoints changes.
- Accept the optional demographics (**`gender`, `birthDate`, `nationality`**) on `POST /parents/:id/students`,
  so a student can be created complete in one call. Keep `PATCH /students/:id` exactly as-is — the FE will drop
  its follow-up PATCH, but the endpoint stays for edits.
- Keep everything else untouched: no new columns (all four already exist), no migration, no change to the
  suspend gate or the search behaviour.

## Definition of Done
- [ ] A parent's `note` can be set on create and edit and round-trips through `GET /parents`.
- [ ] `POST /parents/:id/students` accepts optional `gender` / `birthDate` / `nationality` and persists them in
      **one** call; omitting them still works exactly as today.
- [ ] No migration; suspend enforcement, search, and the embedded-students shape are unchanged.
- [ ] `bunx tsc --noEmit` clean; `bun test` green.
- [ ] Tell @Fern (via me) once it lands so the FE can drop the extra PATCH and add the note field — that's a
      separate small FE follow-up, not part of this task.

## Implementation Notes

**Timing, since the task's own rule is about it:** I picked this up only after the BE queue emptied — TASK-062
is with you in REVIEW and TASK-063 is Fern's, so this jumped nothing.

**Gap 1 — parent `note` reachable again.** Added `note` to `createParent` / `updateParent` (validation → service
→ returned row). `POST /parents` persists it; `PATCH /parents/:id` follows the existing patch discipline
(`!== undefined` ⇒ writable, so it can also be **cleared with `null`**) and it round-trips through `GET /parents`
because the endpoints return the parent row. **Nothing else about the parent endpoints changed.**

**Gap 2 — a student can be created complete in one call.** `POST /parents/:id/students` now accepts optional
**`gender` / `birthDate` / `nationality`**, and `createStudentForParent` persists them. `birthDate` reuses the
shared `DATE` schema, so a malformed date is still rejected — no second date rule. **`PATCH /students/:id` is
untouched** (still the edit path), and omitting the new fields behaves exactly as before, which keeps the **LINE
self-registration** flow (`addStudentAndReply` passes only a name) working unchanged.

**No migration** — all four columns already existed (`parents.note` from the original schema, the three
demographics from TASK-048's 0014). Suspend enforcement, the search behaviour and the embedded-students shape
are all untouched.

### 📩 The relay you asked for (DoD bullet 5) — **@Sober, please pass to @Fern**
Both FE follow-ups are now unblocked, and neither is part of this task:
1. **Drop the follow-up `PATCH`** in the create-student handler — send the demographics in the single
   `POST /parents/:id/students` call instead. (That closes the window where a failure between the two writes
   left a student with no demographics.)
2. **Add the parent `note` field** to `ParentFormModal` — it was in TASK-049's brief but the contract didn't
   carry it, so Fern correctly left it out.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **262 pass / 0 fail** (41 files).
- New `validation.people-gaps.test.ts` — contract-level, which is where the gap actually was: `note` accepted on
  create **and** edit and **clearable with null**; omitting it unchanged; demographics accepted **in one call**;
  omitting them unchanged (the LINE path); a **malformed `birthDate` still rejected**; `name` still required.
- ⚠️ Persistence is **deploy smoke** (brownfield). **Smoke:** create a parent with a note → it comes back on
  `GET /parents`; edit the note and clear it; create a student with gender/DOB/nationality in one call → they
  appear on the People screen with the derived age, **without** a second request in the network tab.

**DoD:** parent `note` settable on create + edit and round-trips ✓ · `POST /parents/:id/students` takes optional
demographics in one call, omitting them unchanged ✓ · no migration; suspend / search / embedded-students shape
untouched ✓ · tsc clean + `bun test` green ✓ · FE follow-up written above for you to relay ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- Low priority by design — if anything higher-value is waiting, do that first and leave this.

## Review
(Sober fills at REVIEW.)

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0**; `bun test` → **280 pass / 0 fail**
(my own run).

Both gaps closed exactly as scoped, with no drift into the neighbouring endpoints:
- **`note` on `createParent` and `updateParent`** (`validation.ts:151,158`) — the field existed in the schema
  and was unreachable through the API. **This was my spec error on TASK-049**, not Fern's: I listed a parent
  note field the contract never provided, and she correctly omitted it rather than inventing an endpoint. Now
  the contract matches what the screen was always meant to do.
- **Optional `gender` / `birthDate` / `nationality` on `createParentStudent`** (`:161-170`), so a student can
  be created **complete in one call**. The comment states the reason — the FE's create → PATCH pair left a
  student with no demographics if it failed between the two. Recording *why* rather than *what* is what makes
  this maintainable.
- `updateStudent` is unchanged, so editing still works exactly as before; `birthDate` keeps the DOB-not-age
  rule from SPEC-016.

**TASK-050 → DONE — and it closes the last LOW item in the backlog.** It waited its turn behind six higher-value
tasks without jumping the queue, which is what I asked for when I filed it.

⏳ **Small FE follow-up (mine to raise, not blocking):** the People screen can now drop its extra `PATCH` after
create, and add the parent note field. Filed as **TASK-069** for @Fern — it isn't urgent, since the current
two-call flow works and is invisible to users.
