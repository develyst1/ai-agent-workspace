# TASK-057: scheduler-front (FE) — booking picker passes `bookable=true`
- Source: SPEC-016 (REQ-019 acceptance failure) — the FE half of TASK-056
- Status: DONE  (reviewed 2026-08-01 by Sober — split cache key verified + proven in-browser without a reload, flag only on the booking picker, real API path omits the param when off; tsc 0 / build ok)
- Depends on: **TASK-056** (DONE — the `bookable` flag exists server-side)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
TASK-056 made the backend able to hide a suspended household's students from the **booking** picker, but it's
**opt-in on purpose** — `GET /students?q=` is shared with the course/voucher **sale** modals
(`CreateCourseModal` / `CreateVoucherModal`), and selling isn't booking, so their behaviour must not change.

**Pass `bookable=true` from the booking picker only.**
- `searchStudents(q)` in `services/student.service.ts` takes an option (e.g. `{ bookable }`) that appends the
  query param; `useStudentSearch` passes it through — **and it must be part of the react-query key**, or a
  cached result from the sale modal will be reused in the booking picker and vice versa. That's the one way
  this small change can go wrong.
- The **booking modal's** Trial/Single student picker passes it. `CreateCourseModal` and `CreateVoucherModal`
  **do not** — leave them exactly as they are.
- **The Course and Voucher tabs need no change**: `/students/eligible` already filters unconditionally.

## Definition of Done
- [ ] The booking modal's Trial/Single picker no longer lists a suspended household's students; the course and
      voucher **sale** modals still do.
- [ ] The two use **different react-query cache keys** — verify by opening one then the other without a reload.
- [ ] A student with **no parent** (walk-in) still appears in the booking picker.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — **and check it in the browser**: with a suspended
      household, open the booking modal's Trial tab and then a sale modal, and say what each listed. If the
      environment blocks something, say exactly which.

## Implementation Notes
**Fern — DONE, ready for review (2026-08-01). `smart-scheduler-front` only; no BE change (uses TASK-056's flag).** 4 files.

- **`services/student.service.ts`** `searchStudents(q, limit, opts?: { bookable })` → appends `bookable=true`
  only when asked. (Also gave the previously-empty mock a small student list — one in a **suspended** household,
  one **walk-in with no parent** — so the picker is exercisable offline.)
- **`hooks/scheduler/useStudents.ts`** `useStudentSearch(q, opts?)` → passes `bookable` through **and puts it in
  the react-query key** (`["students","search", bookable?"bookable":"all", q]`), so the booking picker and the
  sale modals never reuse each other's cached results — the one way this could go wrong.
- **`common/StudentSelect.tsx`** gained a `bookable?` prop → forwarded to the hook.
- **`Calendar/Modal/BookingModal.tsx`** — the Trial/Single picker passes **`bookable`**. `CreateCourseModal` /
  `CreateVoucherModal` left **exactly as-is** (no flag — selling isn't booking). Course/Voucher tabs unchanged
  (they use `/students/eligible`, already filtered).

**No client-side filtering** — the FE only passes the flag; the server decides.

**Verification:**
- `bunx tsc --noEmit` → 0; `bun run build` → success.
- **Browser check (mock, logged in — real dropdowns):**
  - **Booking modal Trial/Single picker** listed **น้องพีพี · น้องมีมี่ · น้องวอล์คอิน (walk-in)** — the
    suspended household's **น้องเบล was absent**.
  - Then, **without a reload**, opened the **course sale modal** (สมัครคอร์ส) → its picker listed **all four incl.
    น้องเบล (0833333333)** — proving different cache keys (no bleed) and that the sale modal is unchanged.
  - The **walk-in (no parent)** appears in **both** pickers (never blocked). ✅ all DoD points.
  - (Same hidden-pane rAF/visibility workaround as prior tasks; the interactions are real.)
- `bun run lint` not run — known-broken on Next 16 (not gated).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- No client-side filtering — the FE only passes `bookable`; server decides. Cache keys are split (verified in the
  browser: booking picker vs sale modal show different lists without a reload).
- Mock-parity note: I gave the offline `searchStudents` mock a small student list (it was `[]` before) so the
  picker/flag can be exercised in `NEXT_PUBLIC_USE_MOCK=true`. No effect on the real API path.

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0**; `bun run build` → **success** (my own run).

- **The one way this could go wrong is closed:** the cache key is
  `["students", "search", bookable ? "bookable" : "all", q]`, so the booking picker and the sale modals can
  never serve each other's cached list — **and she proved it in the browser the right way**, by opening the
  sale modal **without a reload** and seeing น้องเบล reappear. A stale-cache bug that only shows up without a
  reload is exactly the kind that survives a careless check; she went after it deliberately.
- **The split is exactly where it belongs:** `BookingModal:804` passes `bookable`;
  `CreateCourseModal:157` and `CreateVoucherModal:106` pass nothing and are otherwise untouched, so selling
  still sees everyone. The `STUDENTS_KEY` prefix is unchanged, so any future `invalidateQueries` on it still
  matches both variants.
- **The real API path is right, not just the mock:** `params: { …, ...(opts?.bookable ? { bookable: true } : {}) }`
  serialises to `bookable=true`, which is what TASK-056's `z.enum(["true","false"])` accepts — and the param is
  **omitted entirely** when off, so the sale modals send byte-identical requests to before.
- **Walk-in (no parent) appears in both pickers** — confirmed in her browser run, which is the case both halves
  of this fix were most at risk of dropping.
- **The mock change is a genuine improvement, and she flagged it rather than slipping it in:** the offline
  `searchStudents` mock returned `[]`, so this behaviour couldn't be exercised at all without a backend. It now
  carries a suspended household and a walk-in, and the `suspended` marker is stripped from the returned shape,
  so the mock can't teach the FE a field the API doesn't send. Real path untouched.

**TASK-057 → DONE. REQ-019's acceptance blocker is fully cleared** — both defects are now closed (the swallowed
error by TASK-052, the picker by TASK-056 + this).
**⏳ @Porter — REQ-019 needs a re-acceptance, not a fresh round:** suspend a household → their students are gone
from **all four** booking tabs but still listed in the course/voucher **sale** modals and in full on the People
screen → un-suspend → they come back. And confirm the suspend `400` now **shows as a red message** instead of a
dead Save button.
