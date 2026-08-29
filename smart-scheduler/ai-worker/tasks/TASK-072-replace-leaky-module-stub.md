# TASK-072: scheduling (BE) — replace the leaky whole-module test stub
- Source: raised by Jason on TASK-070 (**fifth occurrence**); filed by Sober
- Status: DONE  (reviewed 2026-08-01 by Sober — `mock.module` verified at **zero call sites**; all THREE stubs converted, not just the one named; isolation test asserts **real implementations** not just resolution; +1 unasked dispatch guard closing a hole where "literals win" and ":id broken" look identical; tsc 0 / 341 tests)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## Why
`api.teacher-routing.test.ts` stubs a whole module with `mock.module`. Bun's module registry is process-wide, so
**that stub leaks into every other test file** — an unrelated test decides what a new test file is allowed to
import. It surfaces as `SyntaxError: Export named 'x' not found` in a file that never mentioned the stub.

**This has now bitten five times** (TASK-053, TASK-062, twice before, and TASK-070). Four of those were fixed by
patching the stub to re-export whatever was newly needed; on TASK-070 Jason routed around it by putting the new
query builders in a module nobody stubs. That was the right call *for that task* — but it means the layout of
five tasks has now been shaped by a test fixture, and the next person meets the problem fresh with no warning.

## What to do
Replace the whole-module stub with a **narrow fake** — stub only what that test actually needs (the specific
functions it exercises), so nothing else in the suite inherits it.

- Keep `api.teacher-routing.test.ts` testing exactly what it tests today; this is about *how* it isolates, not
  *what* it asserts.
- If a narrow fake genuinely can't express what that test needs, **say so and stop** — an honest "this needs
  dependency injection in the route module first" is a better outcome than a cleverer stub. Tell me and I'll
  scope that instead.

**Nothing else changes.** No production code behaviour, no new dependencies.

## Definition of Done
- [ ] No `mock.module` on a whole module remains in the suite (or the remaining one is justified in your notes).
- [ ] `api.teacher-routing.test.ts` still asserts what it asserts today.
- [ ] **A new test file can import freely from `scheduler.service` / `parent.service`** without a stub in
      another file dictating what resolves — demonstrate it, e.g. by importing something the old stub omitted.
- [ ] `bunx tsc --noEmit` clean; `bun test` green.

## Implementation Notes

### Timing, since the task's own rule is about it
Taken only now. TASK-072 said *"behind the entire go-live queue"*, and I held it there through five other
tasks — including turns where the BE slice was empty — because BE's queue being clear isn't the same as the
queue being clear. **TASK-065/071/074/076/078/080/084 are all DONE**, so the gate is genuinely open.

### A narrow fake was possible — no dependency injection needed
`spyOn` works on an ESM namespace object in Bun, so the module can be imported **for real** and only the
functions a test actually reaches get replaced, then restored in `afterAll`. I probed that first, since your
fallback instruction was to stop and say so if it couldn't be expressed.

**All three whole-module stubs are gone** — not just the one named in the task:

| file | was stubbed | now |
|---|---|---|
| `api.teacher-routing.test.ts` | `scheduler.service` (**8 names**) | 3 spies — the 3 functions the routes reach |
| `people.route.test.ts` | `parent.service` (9 names) | 7 spies |
| `calendar.route.test.ts` | `calendar.service` (3 names) | **1** spy |

✅ **`grep -rn "mock.module" src/` returns zero call sites** — the remaining hits are the comments explaining why.

### What actually goes away
Not just the leak — **the maintenance rule goes with it.** Those stubs had to re-export names with nothing to
do with what the test asserted, purely because `./api` reaches them transitively: `getCourses`, `getVouchers`,
`listFreelanceCeilings`, `listCoursesPaged`, `listVouchersPaged`, `getDailyReport`, `updateBookingStatus`,
`searchStudents`, `createStudent`. **Every one of those lines is deleted.** Adding an export to a service can
no longer break a route test in another file.

`calendar` is the clearest case: 3 stubbed names, but the two requests only ever reach **one** function. The
other two existed solely to satisfy the module contract.

### The demonstration you asked for
New `services/module-isolation.test.ts` imports **freely** from all three previously-stubbed modules and
asserts on exports the old stubs never listed — `importCoursePackage`, `getSellablePackages`,
`resolvePriceGroup`, `bulkConfirm`, `getEligibleStudents`, `studentSearchConditions`, … **Under the old stubs
this file would not even have loaded**: it would have thrown `SyntaxError: Export named 'x' not found`.

It also checks these are the **real implementations**, not fakes answering `undefined` —
`normalizePhone("081-234-5678") === "0812345678"`, `studentSearchConditions` returns 3 conditions,
`MAX_STUDENTS_PER_PARENT === 5` — because "it imported fine" would otherwise be true of a stub too.

**That file is the regression guard**: reintroduce a whole-module stub and it fails, in a file whose only job
is to explain why.

### Assertions unchanged — plus one I added
The two TASK-029 dispatch tests assert exactly what they did before. I added a **third**: `PATCH /teachers/:id`
still dispatches to `updateTeacher` with the id. Without it, both original tests would keep passing even if the
param route had stopped dispatching entirely — "literals win" and "`:id` is broken" look identical from the
literal side. Cheap, and it closes that.

### One stale comment cleaned up (mine to clean)
`eligible.route.test.ts` explained that it *couldn't* mock because another file's stub had already won the
race. My change made that false, so I rewrote it: no service mock is now a **free choice**, and narrow spies
would work there if it ever needs one. Leaving it would have taught the next person a rule that no longer holds.

### Verification
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **341 pass / 0 fail** (47 files, was 337 — **+4**).
- Ran each converted file individually **and** the whole suite, since the failure mode this fixes is
  **cross-file** and only appears in a full run.
- **No production code changed. No new dependencies** — `spyOn` is already part of `bun:test`.

**DoD:** **no `mock.module` on a whole module remains** — all three converted, grep-verified ✓ ·
`api.teacher-routing.test.ts` asserts what it asserted before (plus one guard) ✓ · a new test file imports
freely from `scheduler.service` / `parent.service`, **demonstrated** with exports the old stubs omitted ✓ ·
tsc clean + tests green ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **LOW by design.** Anything on the go-live list comes first — this waits until the queue is genuinely clear.
- You've hit this more than anyone; if you think the right fix is somewhere else entirely, say so before doing
  the obvious one.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** `tsc` 0 · `bun test` **341/0** (my run) · **`mock.module` has zero
call sites** — I grepped; the remaining hits are the comments explaining why.

**You held it correctly, and the distinction you drew is one I want reused:** *"BE's queue being clear isn't the
same as the queue being clear."* You sat on this through several turns where your own slice was empty, because
the gate was the **go-live list**, not your idleness. That's the rule working as written rather than as
convenient.

**You probed the fallback before assuming it** — I said stop and tell me if a narrow fake couldn't express the
test, and you checked whether `spyOn` works on an ESM namespace in Bun *first*. It does, so no DI was needed and
you didn't spend a re-scope.

**Three stubs converted, not the one named.** `calendar.route.test.ts` is the clearest evidence of the disease:
**3 stubbed names, and the two requests only ever reach 1.** The other two existed purely to satisfy a module
contract — which is the whole pathology in miniature.

**And the real win isn't the leak, it's the maintenance rule that goes with it.** Those stubs had to re-export
nine names with nothing to do with what the tests asserted, purely because `./api` reaches them transitively.
**Adding an export to a service can no longer break a route test in another file** — which is the thing that bit
you five times.

**`module-isolation.test.ts` is the right shape for a regression guard**, and the part that makes it real is
that it asserts the imports are the **actual implementations** (`normalizePhone("081-234-5678")`,
`MAX_STUDENTS_PER_PARENT === 5`) rather than merely resolving. *"It imported fine"* would have been true of a
stub too — you closed the gap between the test passing and the test meaning something.

**Two things you did unasked and were right to:**
- The **third dispatch assertion** on `PATCH /teachers/:id`. Your reasoning is exact: *"literals win" and
  "`:id` is broken" look identical from the literal side* — so the two original tests would have kept passing
  through a total failure of param routing. That's a TASK-029-shaped hole in the test for the TASK-029 fix.
- **Rewriting the stale comment in `eligible.route.test.ts`.** It explained a constraint your change had just
  removed. Leaving it would have taught the next person a rule that no longer holds — and stale comments are
  worse than none, because they're trusted.

**Running each file individually *and* the whole suite** was the right verification: the failure mode this fixes
is **cross-file** and only appears in a full run.

**TASK-072 → DONE.** No production code changed, no new dependencies.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-072 | scheduling (BE): replace the leaky whole-module test stubs | — | ✅ **DONE** (Sober 2026-08-01 — **`mock.module` grep-verified at zero call sites**; **all three** stubs converted, not just the one named (`calendar` had 3 stubbed names where the tests reach **1** — the pathology in miniature); he **probed the fallback first** (`spyOn` works on an ESM namespace, so no DI needed) rather than assuming; the isolation test asserts the imports are **real implementations**, since *"it imported fine"* would be true of a stub too; +1 unasked guard on `PATCH /teachers/:id` because **"literals win" and ":id is broken" look identical from the literal side**; tsc 0 / **341 tests**). He also held it correctly through several idle turns: *"BE's queue being clear isn't the same as the queue being clear"* | Jason | — |
```
