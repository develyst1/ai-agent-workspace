# TASK-091: scheduling (BE) — 🔴 moving a booking between teachers never reconciles the freelance ceiling
- Source: found while designing REQ-030 (Porter asked me to verify interaction #1 rather than assume it)
- Status: DONE  (Sober-verified 2026-08-03 on branch `dong` — tsc 0 · bun test 396/0, run by me; see ## Review. Stale-hold DATA REQUEST routed to @Porter.)  (built 2026-08-02 by Jason — @Sober. tsc 0 · **396/0** (+12). ✅ **`moveBooking` is the ONLY
  writer of an existing booking's `teacherId`** (grep-verified). 🔴 **Found a SECOND bug while building it: the
  idempotency key wasn't per-item**, so a round trip A→B→A would silently leave the booking held on **two**
  items — it now includes the item. **Replaced `reconcileFreelanceDraw` rather than adding a second reconcile**,
  and made `moveBooking` transactional (it wasn't). ⚠️ **Stale data: I did not query — signature + read-only
  query written for @Porter to route; no repair written.**)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## The bug
`moveBooking` (`scheduler.service.ts:1245`) accepts `teacherId` and writes it — and **never calls
`reconcileFreelanceDraw`.** I grepped its whole body: no reconcile, no freelance anything.

So when staff move a CONFIRMED session from freelance **A** to freelance **B**:
- **A's ceiling stays drawn.** A holds an hour for a session they are no longer teaching — their budget is
  consumed by work they don't do, and they hit their cap early.
- **B's ceiling is never drawn.** B teaches a session that costs their budget nothing — **so B can be booked
  past their ceiling**, which is the exact thing the cap exists to prevent.

**Both directions are wrong, and nothing says so.** It is the same silent-money shape as the sale path, and it
is live right now.

## Why the existing reconcile doesn't cover it
`reconcileFreelanceDraw` derives `held` from movements matching **`(itemId = this teacher's item, refId =
booking)`** (`:142-144`). It is scoped to **one** item — the teacher it was called with. It was written for
**status** changes, where the teacher never moves, and it is correct for that. **A teacher change is a
different event**: the hour is held on *another* teacher's item, which this function cannot see.

## What to do
**Make the reconcile whole-booking rather than per-teacher.** A booking should hold **at most one hour, on
exactly one item — the current teacher's** — whatever it held before.

- **Release any item holding this booking that is not the current teacher's**, then apply the normal
  reconcile-to-target for the current teacher. Expressed that way it is correct for *any* number of teacher
  changes, and it collapses to today's behaviour when the teacher hasn't changed.
- Call it from `moveBooking` **inside the same transaction as the teacher write**, so the money and the
  assignment cannot disagree.
- ⚠️ **Do not add a second definition of the target.** `heldTarget`/`reconcileDelta` (TASK-028) already say how
  many hours a status should hold; this is about **which item** holds them, not how many.

## ⚠️ Check before you build, and tell me either way
- Are there **other** writers of `bookings.teacherId`? I found `moveBooking`; if there is a second, it has the
  same hole and I'd rather fix both than discover the other one later.
- **Does existing data already carry stale holds?** Bookings moved between freelances before this fix would
  leave A's item drawn. **Do not repair data on your own initiative** — say how many and I'll route it, the
  same way we handled the un-posted sales.

## Definition of Done
- [ ] Moving a booking A→B **releases A and draws B**, in one transaction.
- [ ] Moving FREELANCE → FT/PT releases A and draws nobody; FT/PT → FREELANCE draws the new one.
- [ ] Moving a booking whose status holds **nothing** (PENDING, CANCELLED, NO_SHOW) still holds nothing after —
      a move must not create a draw that the status doesn't call for.
- [ ] Moving date/time only, with no teacher change, is **byte-for-byte unchanged**.
- [ ] Repeated moves (A→B→A→B) leave **exactly one** hour held, on the current teacher. Test the round trip —
      that's where an off-by-one hides.
- [ ] No second definition of "how many hours a status holds".
- [ ] `bunx tsc --noEmit` clean; `bun test` green — the item-selection rule **pure and tested**, including the
      multi-move case.
- [ ] Say whether other `teacherId` writers exist, and how much stale data this would leave behind.

## Implementation Notes

### ✅ Your first check: **`moveBooking` is the only writer of an existing booking's `teacherId`**
I grepped every `update(bookings)` / `insert(bookings)` in `src/`. The other writers are
`checkin-token.ts:22` (token), `jobs.service.ts:46` (`NO_SHOW`), and four status writes inside
`updateBookingStatus` (`CONFIRMED`/`ATTENDED`/`CANCELLED`/`SICK_LEAVE`) — **none of them touches `teacherId`**.

One near-miss worth naming: the sick-leave **extension** at `:1161` inserts a *new* booking carrying
`current.teacherId`. That's a different booking id, and it's created `PENDING`, which holds nothing — so it
needs no draw and has no stale-hold risk.

### 🔴 A second bug I found while building this — the idempotency key
The old key was `` `fl:${bookingId}:held${target}` `` — unique per (booking, target) but **not per item**. On a
round trip **A→B→A** the release of B and the earlier release of A both key `…:held0`, so
`onConflictDoNothing` would silently swallow the second one and the booking would end up **held on two items
at once**. That is precisely the round-trip off-by-one you told me to look for, and it would have survived a
correct `planHoldMoves`.

The key now includes the item: `` `fl:${bookingId}:${item.id}:held${0|1}` ``. Changing the format is safe
because the reconcile derives `held` from the **movement ledger**, never from the key — the key is only a
double-write guard.

### What I built, and what I removed
**`planHoldMoves(holds, currentItemId, target)`** — pure, in `lib/freelance-budget.ts`. *Release every item
holding this booking that isn't the current teacher's, then bring the current teacher's item to target.*
Stated that way it's correct for **any** number of teacher changes and collapses to today's behaviour when the
teacher hasn't moved (no foreign holds ⇒ one adjustment, exactly as before).

⚠️ **It decides *which item*, never *how many hours*** — `heldTarget`/`reconcileDelta` still own that, and a
test asserts the deltas it produces are the same ones `reconcileDelta` would.

**I replaced `reconcileFreelanceDraw` rather than adding alongside it.** You said *make the reconcile
whole-booking*, and keeping both would have been two definitions of the same reconcile with one of them
subtly wrong — the exact drift this team keeps paying for. `updateBookingStatus` now calls
`reconcileBookingHolds` too; with no teacher change it produces an identical single adjustment. The per-item
money math moved into `applyHoldMove`, so driving several items needs no restatement of it.

**`moveBooking` is now transactional.** It wasn't before — a bare `db.update`. The teacher write and the money
move are in one transaction, so the assignment and the ceiling cannot disagree.

⚠️ One deliberate asymmetry: a **release is never blocked by a cap** (`allowNegative: true` for `delta < 0`).
Refusing to release because a *ceiling* is full would strand the old teacher's budget forever.

### ⚠️ Your second check: stale data — I can't count it, and here's exactly what to count
**I have not queried anything** (and after TASK-085's disclosure I'm not going to). What I can say precisely:

A booking carries a stale hold if it was **moved between two FREELANCE teachers** while its status was one of
**`CONFIRMED` / `ATTENDED` / `SICK_LEAVE` / `EXTENDED`** (`FREELANCE_CONSUMING_STATUSES`). Its signature is
exact and needs no guessing: **more than one `bo.item` with a non-zero net hold for the same `ref_id`.**

**DATA REQUEST — the query, for @Porter to route (read-only):**
```sql
SELECT m.ref_id AS booking_id, count(*) AS items_holding
FROM bo.movement m
WHERE m.ref_type IN ('BOOKING','BOOKING_REVERSAL')
GROUP BY m.ref_id, m.item_id
HAVING -sum(m.qty) <> 0            -- this (booking,item) still holds an hour
-- then: bookings appearing more than once above are the stale ones.
;
```
**I have deliberately not written a repair**, per your instruction. Once we know the count, the fix is simply
to `PATCH` each affected booking with its current `teacherId` — the new reconcile is self-correcting, and
there's a test proving it collapses a two-item state to one. **That's a repair with no bespoke SQL**, which is
the cheapest kind, but it's your call and Porter's to route.

### Verification
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **396 pass / 0 fail** (51 files, was 384 — **+12**).
- New `lib/hold-moves.test.ts` covers the DoD line by line: **A→B releases A and draws B**, and the *result*
  is exactly one hour on the current teacher · FREELANCE→FT/PT releases and draws nobody · FT/PT→FREELANCE
  draws · a **non-holding status** (`PENDING`/`CANCELLED`/`NO_SHOW`) still holds nothing after a move, and
  releases the old hold · **no teacher change ⇒ zero adjustments**, so date/time-only moves are unchanged ·
  🔑 the **round trip A→B→A→B** ends with exactly one hour on B, **and every intermediate step holds exactly
  one — never zero, never two** · re-running a plan is a no-op · a booking already stuck on **two** items is
  collapsed to one (the state this bug could create) · and the target comes from `heldTarget`/`reconcileDelta`.
- Tests assert on the **applied result**, not just the emitted moves — a plan can look right and still leave
  the wrong state.
- ⚠️ The DB writes are **deploy smoke** (brownfield). **Smoke:** confirm a session with freelance A → A's
  remaining drops · move it to freelance B → **A's remaining goes back up and B's drops** (both, in one
  request) · move it back → A drawn, B released, and **A's remaining is the same figure as after the first
  confirm** (no drift) · move to an FT teacher → B released, nobody drawn · move only the date → **neither
  ceiling moves** · cancel a moved booking → its single hold is released.

**DoD:** A→B releases A and draws B in one transaction ✓ · FREELANCE→FT/PT releases and draws nobody;
FT/PT→FREELANCE draws ✓ · a non-holding status still holds nothing ✓ · date/time-only move unchanged ✓ ·
**A→B→A→B leaves exactly one hour on the current teacher** ✓ · no second definition of the target ✓ · tsc
clean + tests green with the item-selection rule pure and tested incl. multi-move ✓ · other `teacherId`
writers: **none** ✓ · stale-data signature + query stated, **no repair written** ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- This is money and it is live — **if the clean fix needs a change I've scoped out, say so before doing it.**
- REQ-030 will make per-session teacher changes an **everyday** operation rather than a rare manual move, so
  this has to be right before that lands. That's why it's ahead of it, not part of it.

## Review
**Verdict: DONE ✅** — Sober, 2026-08-03 (code-level verification completed on branch `dong`, once the office
tree was synced — HEAD `95ea213`). `bunx tsc --noEmit` → exit 0 · `bun test` → **396 pass / 0 fail** (51 files),
run by me.

**Read the real code, not the notes:**
- **Per-item idempotency key confirmed** — `applyHoldMove:160` emits `` `fl:${bookingId}:${item.id}:held${0|1}` ``.
  The round-trip collision (A→B→A both keying `…:held0`) is genuinely closed. Draw blocks on no-budget/no-override;
  refund clamped to ceiling via `reconcileRemaining`; `valueMinor` signed.
- **`reconcileBookingHolds:176` is whole-booking** — derives `held` across **all** items for `refId=bookingId`,
  targets via `heldTarget(status)` only (no second definition), releases foreign holds, and **a release is never
  cap-blocked** (`move.delta > 0 ? allowNegative : true`). Persisted unlock still honored via `readLimitOverride`,
  so a moved-to teacher who is unlocked may exceed cap and a locked one may not — consistent with booking.
- **The regression surface I flagged is clean** — `updateBookingStatus:1255` calls the same
  `reconcileBookingHolds` with `current.teacherId` + the actual post-status; with no teacher change it produces
  exactly one adjustment, identical to the old per-teacher `reconcileFreelanceDraw`. `planHoldMoves` ignores
  foreign items at net-0 (`h.held !== 0`), so a previously-moved booking doesn't spuriously re-release.
- **`moveBooking:1315` is transactional** — teacher write + reconcile in one `db.transaction`; no-teacher-change
  ⇒ zero moves (date/time-only unchanged). `override` is `false` there, but the persisted per-teacher unlock is
  still read inside the reconcile, so an unlocked target isn't wrongly refused.
- **`planHoldMoves` (pure)** and **`hold-moves.test.ts`** cover every DoD line incl. A→B→A→B and the
  two-item-collapse; assert on the applied result, not the emitted moves.

**Still open and routed to @Porter (not part of this task's code):** the **stale-hold DATA REQUEST** — Jason's
read-only query counting bookings held on >1 `bo.item` (from moves made before this fix). Once counted, the
repair is a `PATCH`-with-current-`teacherId` per booking (self-correcting reconcile, tested), no bespoke SQL.
Only relevant on an environment where such moves happened; on `sid` it's likely zero, but confirm before closing.

### Design review (this I can judge, and it holds)
- **Root cause confirmed as a real class of bug.** `reconcileFreelanceDraw` (TASK-028) derives `held` for a
  *single* item; a teacher change parks the hour on *another* teacher's item it cannot see. So `moveBooking`
  writing `teacherId` with no reconcile strands A's draw and lets B exceed cap. ✅
- **The whole-booking reconcile is correct by construction, not by arithmetic** — "release any item holding this
  booking that isn't the current teacher's, then bring the current teacher's to target" makes *at most one hour
  on exactly one item* true for any number of moves and collapses to identity when nothing moved. Right shape. ✅
- **The second bug (idempotency key not per-item) is a genuine catch** — without the item in the key `A→B→A`
  collides on `…:held0`, `onConflictDoNothing` swallows the second release → held on two items. Safe to change
  the key format because `held` is derived from the movement ledger, never the key. ✅
- **Transactional `moveBooking` + release-never-blocked-by-cap (`allowNegative` on delta<0)** — both correct; a
  full ceiling must not strand the old teacher's budget forever. ✅
- **Stale-data process is right** — no query run, exact signature + read-only query handed to @Porter to route,
  no repair written; the self-correcting `PATCH`-with-current-`teacherId` repair needs no bespoke SQL. ✅

### 🔴 Why this is NOT DONE — the evidence step is blocked, not passed
The edited tree is on **`H:\scheduler`**, which is **not reachable from this SA session** — the only copy on
this machine (`C:\Users\Admin\develyst\smart-scheduler\smart-scheduler-back`) is **frozen at ~2026-07-23**
(`freelance-budget.ts` is still the 16-line TASK-024 version; `git log` tops out at the REQ-006 `bo.item`
refactor). So I could **not** read `planHoldMoves`/`reconcileBookingHolds`/`applyHoldMove`, confirm the new
reconcile call sits inside `moveBooking`'s transaction, or run `tsc`/`bun test` myself. I will not stamp a
money task DONE on the strength of the implementation notes alone — that is the exact "trust the claim, skip the
check" failure this week kept punishing.

**The one place that genuinely needs the real code before sign-off:** `reconcileFreelanceDraw` was **replaced**,
so `updateBookingStatus` — the **live** status→money path — now runs through the new `reconcileBookingHolds`.
That is the regression surface (live money, not just the new move path). "Identical single adjustment when
nothing moved" + the **396/0** suite must be *seen* passing against the actual tree, not read from a note.

**Routed to @Porter** (see 2026-08-03 log): decide how the code-level verification is produced — relay `tsc` +
`bun test` output and the three functions from the `H:` machine, or make the current tree reachable to SA. Task
stays **REVIEW** until then.
