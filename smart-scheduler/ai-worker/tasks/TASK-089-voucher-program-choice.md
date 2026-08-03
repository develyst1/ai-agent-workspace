# TASK-089: scheduler-front (FE) — a voucher must choose its program; search on both eligible pickers
- Source: SPEC-026 (REQ-029)
- Status: DONE  (reviewed 2026-08-02 by Sober — `slotSubjectId` **deleted from the codebase**, surviving `[0]` reads are all `length===1` preselects; she proved it by choosing **index 2** and reading the saved booking back; also removed the Course branch fallback I failed to name; tsc 0 / build ok)
- Depends on: **TASK-088** (for the search half only — the program half needs no backend)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## 1. 🔴 Stop guessing the voucher's program
`BookingModal.tsx:618-619` sends `subjectId: slotSubjectId`, where
`slotSubjectId = slotTeacher?.subjectOptions?.[0]?.id`. **The sport is taken by array position** — a teacher who
coaches Surfskate, Skateboard and Inline records **Surfskate every time**.

**This is my error, not yours.** You found that "a voucher has no teacher" was wrong and auto-filled from the
clicked slot; I reviewed it, **corrected the teacher half in writing and blessed the subject half in the same
breath.** The teacher is real — it's the column that was clicked. **The subject never was.**

**Add a required program choice on the Voucher tab**, limited to the subjects that teacher can coach.
- **No `[0]` fallback anywhere.** If the teacher has exactly one subject you may preselect it — but the value
  must come from a **choice**, not an index.
- **Submit is blocked** until a program is chosen, the same way the collision picker blocks approve in
  TASK-076.
- The **Course** tab is unchanged: its program comes from the course, which is a fact rather than a guess.

> The rule worth carrying: **a defaulted value is a claim.** `[0]` isn't a default, it's a guess wearing a
> default's clothes.

## 2. Search on the Course and Voucher pickers
Both render a plain list today. Add a search box using TASK-088's `q` — **server-side**, because the payload
carries no phone and a local filter therefore cannot match one.

Consistent with the Trial/Single picker: same debounce feel, same "no match" empty state, distinct from the
"nobody is eligible" empty state you already wrote.

## Definition of Done
- [ ] A voucher booking **cannot be saved without a program**, and the saved booking carries the **chosen** one.
- [ ] A teacher with several subjects offers all of them; a teacher with one may preselect but still records a
      choice.
- [ ] Course tab behaviour is unchanged.
- [ ] Both eligible pickers search by name, nickname and **parent phone**, server-side.
- [ ] "No match" and "none eligible" remain **different** messages.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — **and exercise it in a browser**: book a voucher
      against a multi-subject teacher and say which program you chose and what the booking recorded.

## Implementation Notes — Fern 2026-08-02

### 1. The `[0]` guess is gone from the file entirely
`slotSubjectId` / `slotSubjectName` are **deleted**, not bypassed — so there is no positional read left to
regress to. The voucher branch now sends `voucherSubject.id` / `.name` from a required `Select`, and `valid`
requires `!!voucherSubject`, so **Save is disabled until a program is chosen** (same shape as TASK-076's
collision picker).

**Preselect when there is exactly one option — but it still lands in state as a choice**, so the payload never
reads an array position even in the single-subject case.

**The Course branch also lost its `slotSubjectId` fallback.** You said "no `[0]` fallback anywhere", and the
Course path had `ctx?.subject?.id ?? (subjectId || slotSubjectId)` — the same guess as a third-choice default.
It now reads `ctx?.subject?.id ?? subjectId`; if a course carries no subject, `valid` refuses rather than
inventing one. **Course tab behaviour is otherwise unchanged** (verified below).

**Your question — a teacher with no subjects:** the picker is replaced by an orange alert naming the teacher
(*"{teacher} has no programs set up, so a voucher session cannot be recorded against them. Add a program to the
teacher first."*), and since `voucherSubject` stays null, **Save stays disabled**. "Required choice" and
"nothing to choose" resolve as *blocked, with the reason* rather than a dropdown that looks broken.
⚠️ **Code-verified, not exercised** — every mock teacher has at least one subject and I didn't want to distort
a fixture just to reach it.

### 2. Search on both eligible pickers
`getEligibleStudents(type, q)` + `useEligibleStudents(type, enabled, q)` keyed on `q`, 300 ms debounce,
`keepPreviousData` so options don't blink while a search resolves. **It's a separate `TextInput`, not Mantine's
local `searchable`** — a local filter cannot match a parent phone, because the payload doesn't carry one, which
is the exact complaint this exists to fix. The "no match" / "nobody eligible" messages remain distinct
(`eligiblePlaceholder` already branched on `eligible.length`).

### Browser check — mock, localhost verified first
**The decisive one — I deliberately chose a program that is NOT index 0.** Teacher **แอน** coaches
**[Bike, Skate, Onewheel]**; the old code recorded `Bike` every time.

1. Voucher tab on แอน's slot → fields are **Student** and **Program \***, and **Save is `disabled`**.
2. Program options were exactly **[Bike, Skate, Onewheel]** — I picked **Onewheel (index 2)**.
3. Picked the student → **Save still `disabled`** (program not yet chosen in that ordering) → picked the
   program → **Save `disabled=false`**. Both halves are required, independently.
4. Saved, then navigated **client-side** (a full reload resets the in-memory mock — I got caught by that once
   and redid the run) → all-bookings went **12 → 13 found**, and the new row reads:
   **`น้องกัน ปิติ · Onewheel · แอน · 2026-08-02 · 09:00-10:00 · Voucher`**.
   **The booking recorded the program I chose, not the one at index 0.**
5. **Single-subject teacher** (บีม, one program): the field **preselected `Surfskate`** and Save stayed disabled
   until a student was picked — preselected, still a recorded choice.
6. **Search:** the voucher picker listed **[วิว, กัน]**; typing **`กัน`** narrowed it to **[กัน]**. Server-side —
   `q` is in the query key, and the mock filters the same way the API does.
7. **Course tab unchanged:** its fields are still `Student / Teacher / Time` with **no program picker**.

### ⚠️ Limits, stated exactly
- **Parent-phone search is not proven.** The mock's eligible payload has **no phone column**, so my filter
  matches name+nickname only. TASK-088 does the phone half server-side and the FE just forwards `q` on the
  identical path I did exercise — but a positive **phone → student** match is confirmable only on `sid`.
  **Worth one line of @Tanya's round: search an eligible picker by a parent's phone.**
- **The no-subjects teacher branch is reasoned, not run** (see above).

`bunx tsc --noEmit` **clean**; `bun run build` **succeeded**.

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Layout is yours. The two non-negotiables: **no `[0]` fallback**, and search hits the server.
- If a teacher has **no** subjects, say what you did — that's the case where "required choice" and "nothing to
  choose" collide, and I'd rather see it handled than discover it.

## Review
(Sober fills at REVIEW.)

## Review
**Verdict: DONE ✅ (Sober, 2026-08-02).** `tsc` 0 (my run). I grepped for the positional read: **`slotSubjectId`
is gone from the codebase**, and every surviving `subjectOptions[0]` is inside an
`if (subjectOptions.length === 1)` preselect — which is the case I explicitly allowed, and it lands in state as
a choice. **The guess has no form left to regress to**, which is what "deleted, not bypassed" has to mean.

### The browser check is the one that actually proves it
**You deliberately chose a program that is not index 0** — แอน coaches `[Bike, Skate, Onewheel]`, the old code
recorded `Bike` every time, and you picked **Onewheel (index 2)** and then read the saved booking back:
`น้องกัน · Onewheel · แอน · Voucher`. **That single assertion is the whole REQ.** Picking index 0 would have
passed every check and proved nothing.

Two more that show you were testing the *rule* rather than the happy path: **Save stayed disabled with a student
but no program**, so the two requirements are independently enforced; and the **single-subject teacher
preselected but still recorded a choice**, which is the case where a lazy implementation quietly reintroduces
the positional read.

**And you caught yourself mid-run** — a full reload resets the in-memory mock, so you redid it client-side.
Reporting that is worth more than the result: it's the difference between "the number changed" and "the number
changed for the reason I think".

### The Course-branch fallback — right call, and I under-specified it
I wrote *"no `[0]` fallback anywhere"* and then described only the voucher path. You found
`ctx?.subject?.id ?? (subjectId || slotSubjectId)` on the Course branch — **the same guess sitting as a
third-choice default** — and removed it, so a course with no subject now refuses rather than inventing one.
**That is my instruction applied where I failed to look**, and it's the second time this week the same class of
error has been caught by someone reading past the sentence I wrote.

### The no-subjects teacher
An orange alert naming the teacher, with Save disabled — *"blocked, with the reason"* rather than an empty
dropdown that reads as broken. And you marked it **code-verified, not exercised**, because reaching it meant
distorting a fixture. **Correct on both counts**: the behaviour is right, and the label on the evidence is
honest.

### Search
A separate `TextInput` rather than Mantine's local `searchable`, and your reason is the right one: **a local
filter cannot match a parent phone, because the payload deliberately doesn't carry one** — which is the exact
complaint the search exists to fix. Debounced, keyed on `q`, `keepPreviousData` so options don't blink, and the
two empty states stay distinct.

**TASK-089 → DONE. REQ-029 is complete** (TASK-088 + TASK-089).

⏳ **Deploy + acceptance note for @Porter:** the fix stops *new* wrong data. **It does not repair the voucher
bookings already written** with a program chosen by array position — that's the item I asked you to put to the
owner, and it's now the only part of REQ-029 that isn't closed.
