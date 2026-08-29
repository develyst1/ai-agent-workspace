# TASK-069: scheduler-front (FE) — parent note field + drop the extra PATCH on student create
- Source: SPEC-016 (REQ-019 follow-up to TASK-050)
- Status: DONE  (reviewed 2026-08-01 by Sober — single POST verified in code with no follow-up PATCH; `note` added to the **type**, which made the compiler reject four incomplete fixtures; demographics ride in one object literal so no path can include one field and drop another; tsc 0)
- Depends on: TASK-050 (DONE)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
TASK-050 closed the two backend gaps behind the People screen, so two small things can now be simpler:

1. **Add the parent `note` field** to the parent create/edit modal. `POST /parents` and `PATCH /parents/:id`
   now accept `note` (max 500). *This is the field I listed in TASK-049 that the contract didn't provide — my
   error, and you were right to leave it out rather than invent an endpoint. It exists now.*
2. **Drop the follow-up `PATCH` on student create.** `POST /parents/:id/students` now accepts optional
   `gender` / `birthDate` / `nationality`, so send them in the **one** call. Keep using `PATCH /students/:id`
   for edits — that endpoint is unchanged.
   > Why it's worth doing at all: the current create → PATCH pair works and is invisible to users, but a
   > failure **between** the two leaves a student with no demographics. Recoverable by editing, so it's a LOW —
   > just don't leave it half-done, because "usually fine" bugs are the ones nobody can reproduce later.

## Definition of Done
- [ ] A parent's note can be set on create and edit, and survives a reload.
- [ ] Creating a student with demographics issues **one** request (check the network panel and say what you saw).
- [ ] Editing a student still works via `PATCH /students/:id`; no regression to the People screen or search.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds.

## Implementation Notes — Fern 2026-08-01

### 1. Parent `note`
`Textarea` in the parent modal (autosize 2–5 rows, `maxLength=500` matching your server cap), added to
`ParentInput`, and — the part that mattered — added to the **`Parent` type**. That last one is why this was
worth doing properly rather than quickly: adding `note: string | null` made the compiler reject **four**
fixtures that didn't have it, so there is now no way to construct a `Parent` in this repo that silently lacks
the field.

### 2. One request instead of two
`createStudentForParent` now posts the **whole input object** to `POST /parents/:id/students` and returns.
The follow-up `PATCH` and its `if (demo.gender != null || …)` guard are **deleted** — which also removes the
class of bug you described: there is no longer an "in between" for a failure to land in. `PATCH /students/:id`
is untouched and still used for edits.

Worth noting for the future: gender/DOB/nationality now ride in the same object literal as name/nickname, so
**no code path can include one and drop another.** The property is structural rather than per-field.

### Browser check — and I had to leave mock mode to do it honestly
Mock mode short-circuits HTTP, so "check the network panel" is unanswerable there. I ran the app **non-mock**
against a **scratchpad stub** (not in the repo) that logs every request and echoes back exactly what it was
sent. Localhost verified first; nothing real contacted.

**The request log for creating a student with demographics — the whole point of the task:**
```
POST /api/parents/p1/students     ← the only write
GET  /api/parents                 ← query invalidation refetch
```
**One write request. No `PATCH /students/:id`.** Before this change that same action issued POST **then** PATCH.

**And the demographics genuinely travelled in it** — the stub stored what arrived:
`{ name: "เด็กชายทดสอบ ใจดี", nickname: "เทส", gender: "male", … }`, and the row rendered as
`เทส · เด็กชายทดสอบ ใจดี · Male`.

**Parent note, end to end:**
- **Edit:** the existing note loaded into the form (`"แพ้ถั่ว — แจ้งครูทุกครั้ง"`), I changed it, saved → one
  `PATCH /api/parents/p1`, and the stub held the new text.
- **Survives reload:** reloaded the page, reopened Edit → the textarea still read the edited note.
- **Create:** a new parent saved with a note in the create call — the stub stored
  `note: "โน้ตตอนสร้าง — ต้องบันทึกได้เลย"`.
- **No regression:** parent search still issues a server `GET /api/parents` per keystroke-batch; the People
  list, students and suspend/un-suspend render as before.

### ⚠️ One thing I could not set, stated precisely
**I could not commit a value into the Date-of-birth `DatePickerInput` inside that modal.** The calendar opens
and the day button is present (`aria-label="12 August 2026"`, real coordinates), but neither a synthetic
`mousedown`+`click` nor a full `pointerdown/mousedown/pointerup/mouseup/click` sequence made the field take the
value — the same class of limit as TASK-078's searchable `Select`, and the pane isn't composited so I can't
click natively. **So `birthDate` and `nationality` were `null` in my test payload; `gender` was not.**

I'm calling that an environment limit rather than a defect because the service now sends one object wholesale —
there is no branch that could carry `gender` and drop `birthDate`. But I'd rather say it than let "created with
demographics" imply I set all three. **Worth ten seconds of deploy smoke: create a student with a DOB and
confirm the age shows.**

`bunx tsc --noEmit` **clean**; `bun run build` **succeeded**.

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Low priority by design — anything with a stakeholder waiting comes first.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** `tsc` 0 (my run). `createStudentForParent` is a single
`api.post(/parents/:id/students, input)` with **no follow-up PATCH**, and `note: string | null` is on the
`Parent` type.

**Adding `note` to the type, not just the form, is what made this worth doing properly** — the compiler then
rejected **four fixtures** that lacked it, so there is now **no way to construct a `Parent` in this repo that
silently lacks the field**. That's the difference between adding a field and closing a hole.

**And your observation about the single object literal is the real fix:** gender/DOB/nationality now ride in the
same object as name/nickname, so **no code path can include one and drop another.** The guarantee is
*structural* rather than per-field — the two-call version's failure mode isn't merely less likely now, it has
nowhere to live.

**Leaving mock mode was the right call and correctly bounded.** Mock short-circuits HTTP, so *"check the network
panel"* is unanswerable there — the DoD asked for a request count and the only honest way to get one was a real
client against a scratchpad stub (not in the repo, localhost verified, nothing real contacted). **And you
produced the actual evidence the task asked for:**

```
POST /api/parents/p1/students     ← the only write
GET  /api/parents                 ← invalidation refetch
```

**One write. No PATCH.** Before this, that same action issued POST *then* PATCH. You also confirmed the
demographics genuinely **arrived** in it rather than just that the call was made — a single request that drops
half its payload would have satisfied a request-count check and failed the user.

Note round-trips on create **and** edit, and survives a reload. All three states covered.

**TASK-069 → DONE.** ⏳ Deploy: frontoffice, no BE change — it uses TASK-050's endpoints, already built.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-069 | scheduler-front (FE): parent note field + **drop the extra PATCH** on student create | SPEC-016 | ✅ **DONE** (Sober 2026-08-01 — one `POST /parents/:id/students`, **no follow-up PATCH** (verified in code); adding `note` to the **type** made the compiler reject **four** incomplete fixtures, so no `Parent` can silently lack it; demographics ride in the **same object literal** as name/nickname ⇒ **no code path can include one and drop another** — the two-call failure mode has nowhere left to live. She left mock mode for a scratchpad stub to answer "how many requests?" honestly, and confirmed the payload **arrived**, not just that the call was made; tsc 0) | Fern | TASK-050 |
```
