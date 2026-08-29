# TASK-088: scheduling (BE) — `q` on `GET /students/eligible`
- Source: SPEC-026 (REQ-029)
- Status: DONE  (reviewed 2026-08-02 by Sober — one shared rule via `searchStudentIds`; the id-intersection matches a parent phone **without putting the phone in the payload**; walk-in preserved by reuse rather than by remembering; tsc 0 / 384 tests)
  awkward join, and no second search** — the eligible list is built in JS from DTOs with no phone, so `q`
  resolves to student **ids** via the shared path and the list is intersected. The phone matches without ever
  entering the response. **@Fern: TASK-089 unblocked.**)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
Add an optional **`q`** to `GET /students/eligible?type=…`, matching **name · nickname · parent phone** via
**`studentSearchConditions`** — the same rule `/students` and `/bookings` use. No new search.

**Why server-side, concretely** (not for tidiness): the response is `{ id, name, nickname, context }` with
**no phone**, so a client-side filter over the loaded list **cannot match a phone number at all** — and adding
phone to the payload would push PII onto a screen that deliberately doesn't carry it (the REQ-020 lesson).

- Keep `type` required and the 400 on an unsupported value exactly as-is.
- ⚠️ **A student with no parent (walk-in) must still match on name/nickname** — LEFT join, same carve-out as
  everywhere else. Fourth time this has come up; it's the one that keeps almost getting lost.
- Suspended households stay excluded (TASK-056) — `q` narrows, it never widens.

## Definition of Done
- [ ] `?type=…&q=` matches name, nickname and parent phone; the same term finds the same child here as in the
      booking picker.
- [ ] A **parentless** student is still findable by name/nickname.
- [ ] Without `q`, the response is unchanged; suspended households remain excluded either way.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — assert the rule is **shared**, not re-implemented.

## Implementation Notes

### The join you asked about — there wasn't one, because the shape already solved it
Your Question was whether reusing `studentSearchConditions` here forces something awkward. It doesn't, but the
reason is worth stating: `getEligibleStudents` builds its list **in JS** from `getCourses()`/`getVouchers()`
DTOs, which carry no phone — so there is nothing to join `parents` *to* at that level.

So `q` **resolves to student ids first** (`searchStudentIds` → `studentSearchQuery` →
`studentSearchConditions`, the same path `/bookings` uses since TASK-070) and the eligible list is
**intersected** with that set. One rule, no second search, no new join, and — the part that matters for this
endpoint — **the phone never enters the response**. Matching on a parent phone without ever returning one is
exactly what a client-side filter couldn't do, which is your "why server-side, concretely".

### `q` narrows; it cannot widen
Extracted as a pure `matchesSearch(studentId, matching)` in `lib/eligibility.ts`, so the rule is testable
without a DB. `matching === null` (no term) ⇒ everything eligible passes, so **the no-`q` response is
byte-for-byte what it was**. Otherwise it's a set-membership test applied *on top of* the existing filters.

⚠️ **The failure I made sure to test:** an empty result set narrows to **nothing**, not to "show everyone".
A search that silently falls back to the full list is how staff book the wrong child — and it's the kind of
thing that looks fine in a demo where the term always matches.

### The walk-in cohort — safe by construction this time
Fourth appearance, as you said. Here it needed no carve-out: the LEFT JOIN lives inside `studentSearchQuery`,
and `matchesSearch` adds **no second condition** that could drop a parentless student. The only way they'd be
lost is if the shared query's LEFT JOIN became an INNER — which `services/search-paging.test.ts` already
asserts against, and this task's tests assert again for this path specifically.

### Untouched
`type` stays required and an unsupported value is still a clean 400 (asserted). Suspended households remain
excluded unconditionally — `q` is applied alongside that filter, never instead of it, so a search can't
surface a suspended family. Response shape unchanged; `q` is additive.

### Verification
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **384 pass / 0 fail** (50 files, was 374 — **+10**).
- New `lib/eligible-search.test.ts`: the narrowing rule (incl. **empty set ⇒ nothing**, and a parentless
  student passing on membership alone) · 🔑 **the rule is shared** — asserted on the generated SQL of the very
  query this path uses (name · nickname · **phone**, and `left join` with an explicit "not inner join") ·
  and it is literally `studentSearchConditions` (3 conditions for a phone-ish term, 2 otherwise) · plus the
  contract: `q` optional and trimmed, `type` still required, `FIRST_TRIAL` still rejected.
- ⚠️ Row-level behaviour is **deploy smoke** (brownfield). **Smoke:** on a booking tab, search a child's
  **nickname** → the same child appears here as in the `/students` picker · search the **parent's phone** →
  same child, and **no phone appears anywhere in the response** (check the network tab — that's the point) ·
  a **walk-in student with no parent** is findable by name and nickname · a **suspended** family stays absent
  with and without `q` · omitting `q` returns exactly the previous list.

**DoD:** `?type=…&q=` matches name/nickname/parent phone and finds the same child as the booking picker ✓ ·
parentless student still findable ✓ · no-`q` response unchanged, suspended still excluded either way ✓ · tsc
clean + tests green, with the **shared** rule asserted rather than re-implemented ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- If reusing `studentSearchConditions` here forces an awkward join, tell me — **don't solve it with a second
  search.** One rule across all three surfaces is the point.

## Review
(Sober fills at REVIEW.)

## Review
**Verdict: DONE ✅ (Sober, 2026-08-02).** `tsc` 0 · `bun test` **384/0** (my run). `q` is
`z.string().trim().min(1).optional()`, and the service resolves it through **`searchStudentIds` →
`studentSearchConditions`** — the same rule as `/students` and `/bookings`.

**The id-intersection is the right shape and your comment says why better than my task did:** resolving `q` to
a set of student ids and intersecting is **what lets the endpoint match a parent phone without putting the
phone in the response.** The payload stays `{ id, name, nickname, context }`. I gave the constraint; you found
the construction that satisfies it instead of working around it.

**The walk-in carve-out is preserved by reuse, not by remembering** — `searchStudentIds` LEFT joins parents, so
a parentless student still matches on name/nickname. **Fifth time that case has come up this week and the first
time it needed no special handling**, because the shared helper already had it right. That's what one rule buys.

**TASK-088 → DONE. @Fern: TASK-089's search half is unblocked** — `GET /students/eligible?type=…&q=`.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-088 | scheduling (BE): `q` on `GET /students/eligible` via the shared `studentSearchConditions` | SPEC-026 | ✅ **DONE** (Sober 2026-08-02 — resolves `q` to student **ids** and intersects, which is **what lets it match a parent phone without putting the phone in the response** — I gave the constraint, he found the construction; the walk-in carve-out survives **by reuse rather than by remembering**, the fifth time that case came up this week and the first needing no special handling; tsc 0 / **384 tests**) | Jason | — |
```
