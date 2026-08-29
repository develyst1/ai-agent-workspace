# TASK-059: scheduler-front (FE) — drop the `bookable` flag; surface the sale rejection
- Source: SPEC-016 addendum (REQ-019)
- Status: DONE  (reviewed 2026-08-01 by Sober — `bookable` verified gone by grep, both sale modals catch `ApiClientError` with `else throw`, mock filters unconditionally; tsc 0 / build ok. **Batch unblocked**)
- Depends on: **TASK-058** (the backend change)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## Why
คุณฟีน settled the last piece: a suspended household **cannot buy** either. So every consumer of
`GET /students?q=` — your booking picker **and** both sale modals — now wants suspended households hidden, and
TASK-058 makes that the server default. The `bookable` flag you just wired has nothing left to distinguish, and
an opt-in policy flag is a hole waiting for someone to forget it.

**Sorry for the churn — that one's mine.** The flag was the right call while the sell-side question was open
(filtering the shared endpoint would have changed the sale screens with nobody having decided that); the answer
arrived after you'd built it.

## What to do
1. **Remove the `bookable` plumbing**: the `opts` on `searchStudents`, the `bookable` prop on `StudentSelect`,
   the pass-through in `useStudentSearch`, and the prop at `BookingModal`'s Trial/Single picker.
   - **Simplify the react-query key back** (the variant segment no longer distinguishes anything). Just make
     sure the key still changes with `q`.
   - **Keep your mock's student list** — the suspended household + walk-in you added are still exactly the
     right fixtures; the mock should now filter suspended **unconditionally**, matching the server.
2. **Surface the sale rejection.** `POST /courses` / `POST /vouchers` will now return the suspension `400` for a
   suspended household. `CreateCourseModal` and `CreateVoucherModal` must **show that message**, the same way
   `BookingModal` does — an `ApiClientError` → visible alert, not a Save button that appears to do nothing.
   > This is the REQ-019 acceptance defect all over again, in two screens that didn't have it yet. The picker
   > hiding them is convenience; **the message is what a member of staff actually needs** when it happens.

## Definition of Done
- [ ] No `bookable` anywhere in the FE; the booking picker and both sale modals still hide suspended households
      (now because the server does).
- [ ] A walk-in student with **no parent** still appears everywhere.
- [ ] Both sale modals show the backend's suspension message on rejection — **check this in the browser** and
      say what you saw. If the mock can't produce a 400, say so and reuse the `ApiClientError` pattern from
      `BookingModal`.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds.

## 🔴 Why this became the critical path (raised by @Porter, and he's right)
"Deploy order is free" (TASK-058) is true and reads like "this batch is safe to ship" — **those are not the same
statement.** TASK-058 makes a suspended family's purchase fail with a `400`; **item 2 below is what makes that
`400` visible.** Ship the backend without it and buying a course/voucher for a suspended family becomes a Save
button that silently does nothing — **the exact defect คุณฟีน failed REQ-019's acceptance on two rounds ago**,
recreated on two more screens.

So **TASK-058 and this ship as a pair**, and the whole batch (including REQ-023's deploy and the 08:00 task
registration) is waiting on it. It's still a small task — it's just the last one.

## Deploy note (no hazard, unlike TASK-055)
Either order is safe: an old FE still sending `bookable=true` is **ignored** by the new backend (the schema
drops the field, it isn't rejected), and a new FE sending nothing gets the same exclusion by default. Nothing to
sequence here — I'm saying so explicitly because I made noise about ordering last time and don't want that
alarm inherited where it doesn't apply.

## Implementation Notes
**Fern — DONE, ready for review (2026-08-01). `smart-scheduler-front` only; no BE change (pairs with TASK-058).** 6 files.

**1. Dropped the `bookable` plumbing** (reverts TASK-057; the server now excludes suspended by default):
- `searchStudents(q, limit)` — the `opts`/`bookable` param is gone; the mock now filters suspended
  **unconditionally** (matching the server). Kept the mock's fixtures (suspended household + walk-in).
- `useStudentSearch(q)` — key back to `[...STUDENTS_KEY, q]` (still varies with `q`; the variant segment is gone).
- `StudentSelect` lost its `bookable` prop; `BookingModal`'s Trial/Single picker no longer passes it.
- Grep confirms **no `bookable` left** in the student-picker path (only the unrelated `TeacherView.bookable` remains).

**2. Surfaced the sale rejection** — `CreateCourseModal` + `CreateVoucherModal` now wrap submit in try/catch and,
on an `ApiClientError`, show the backend's message in a **red Alert** under the student field (same pattern
`BookingModal` uses) — so a suspended-household purchase is a clear reason, not a Save button that does nothing.

**Verification:**
- `bunx tsc --noEmit` → 0; `bun run build` → success.
- **Browser check (mock, real dropdowns):**
  - The **course sale modal** and the **voucher sale modal** now list **น้องพีพี · น้องมีมี่ · น้องวอล์คอิน** —
    the suspended household's **น้องเบล is absent** (in TASK-057 the sale modals still showed เบล; now they don't,
    via the server-default exclusion mirrored in the mock). The **walk-in (no parent)** appears in both.
  - The booking picker is unchanged (still excludes เบล — same shared path).
  - ⚠️ **The sale-rejection Alert couldn't be triggered live:** with suspended households excluded from the picker,
    a suspended student **can't be selected**, so no `POST /courses`/`/vouchers` 400 is reachable through the UI in
    mock. Per the DoD I **reused BookingModal's `ApiClientError` → Alert pattern** verbatim (verified by code +
    tsc/build); the real 400 surfaces on the first `sid` deploy smoke.
- `bun run lint` not run — known-broken on Next 16 (not gated).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Still **no client-side filtering** — removed the flag; the server decides who's listed. The two sale modals now
  reuse BookingModal's `ApiClientError`→Alert pattern for the suspension `400`.
- **Deploy note (yours, confirmed):** old-FE-sending-`bookable` is ignored by the new BE and new-FE-sending-nothing
  gets the same exclusion, so order is free — but this + TASK-058 are the pair the batch is held on.

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01). The batch is unblocked.** `bunx tsc --noEmit` → **0**;
`bun run build` → **success** (my own run).

- **`bookable` is genuinely gone from the student-picker path.** I grepped rather than trusting the claim: every
  remaining hit is the unrelated teacher-availability concept (`bookableOnDate`, `TeacherView.bookable`), which
  is exactly what you said. The query key is back to `[...STUDENTS_KEY, q]` and still varies with `q`.
- **Both sale modals catch properly** — `if (e instanceof ApiClientError) setError(e.message); else throw e`.
  The `else throw` matters: an unexpected failure still surfaces instead of being swallowed into a red box that
  says the wrong thing. Same shape as `BookingModal`, so there's one pattern in the codebase, not three.
- **The mock now filters suspended unconditionally**, matching the server — so offline dev can't teach anyone
  the old behaviour.

**On the alert you couldn't trigger — your report is right, and the conclusion is better than "untested".**
With suspended households excluded from the picker, a suspended student **can't be selected**, so the sale `400`
is unreachable through the UI in mock. That's not a gap in your work; it's the two layers doing their jobs. The
`400` remains reachable for real in the narrow cases that matter — **a picker list gone stale** (the query has a
30s `staleTime`, so a household suspended in another tab is selectable for up to half a minute) and any direct
API call. That is precisely why @Porter held the batch for this task: the window is small, but inside it the
old behaviour was a Save button that silently did nothing. **Belt and braces, working as intended.**

**TASK-059 → DONE.** ⏳ **@Porter — TASK-058 + TASK-059 are the pair you were waiting on; the batch can ship**,
and your sequence stands: deploy BE+FE → open `/scheduler/attention` and confirm the **red "never run"** warning
→ register all three Windows tasks → re-open for the timestamp → accept REQ-023.
**Add one line to the sale smoke:** suspend a household **while** a sale modal is open, then try to save — that's
the one path that exercises the alert for real, and it takes ten seconds.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-059 | scheduler-front (FE): drop the `bookable` plumbing **+ show the suspension `400` in BOTH sale modals** | SPEC-016 | ✅ **DONE** (Sober 2026-08-01 — `bookable` gone from the picker path (grep-verified; only the unrelated `bookableOnDate`/`TeacherView.bookable` remain), both sale modals catch `ApiClientError` **with `else throw`** so unexpected errors still surface, mock filters unconditionally; tsc 0 / build ok) — 🟢 **THE BATCH IS UNBLOCKED** | Fern | TASK-058 |
```
