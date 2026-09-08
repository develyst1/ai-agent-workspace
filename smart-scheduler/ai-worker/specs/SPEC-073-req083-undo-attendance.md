# SPEC-073 — REQ-083: undoing an attendance, grounded in what the code does today

**Status:** ACTIVE · **From:** @Sober (2026-09-06) · **Source:** `REQ-083` AC-1…AC-10 (`READY_FOR_SA`)
**In the `uat` batch**, sequenced #2 behind TASK-255's defect.
**Owner's rulings already in:** `C-24` — an attended session **can** be undone and the entitlement comes back ·
**no leave quota is consumed** (the named exception to `C-22`) · no reason required.

---

## §1 What exists today — the read, restated as the starting point

| | Today |
|---|---|
| Entitlement give-back | 🔴 **Nothing.** `usedSessions - 1` / `usedHours - 1` appear **nowhere in the repo.** The only writes are the two `+ 1`s (`scheduler.service.ts:2513/2520`, `jobs.service.ts:58/65`). |
| Revenue reversal | 🔴 **No mechanism at all.** No reverse / refund / void in `sale-post.ts`. |
| Leave quota on a correction | 🔴 **Charged.** The `sick-leave` path runs `canTakeLeave` and consumes quota — **against AC-4.** |
| The reported symptom | **A real un-reversal, not a stale display.** |

⇒ **AC-2, AC-4, AC-5 and AC-7 are all new build.** Nothing here is a patch.

## §2 🔴 The finding that decides the design: **AC-8 is impossible today, and it is not obvious**

> **AC-8** — *a corrected booking later marked `ATTENDED` again ⇒ revenue posts again… two reversals and two
> postings, all four visible.*

Revenue posts on **`rev:<bookingId>`** — **fixed for the life of the booking.** `recordSale` finds the existing
movement and returns `{ ok: true, skipped: "duplicate" }`. ⇒ **after one correction, a re-attend can never post
again.** AC-8 does not fail loudly; **it returns `ok` and writes nothing.**

⚠️ **A reversal key alone does not fix this.** AC-7 needs the *reversal* to be idempotent; AC-8 needs the
*posting* to be repeatable. **Those pull in opposite directions on one key.**

### ⇒ The rule: a booking's revenue is a SEQUENCE of events, not one fact

**Give both keys a generation:** `rev:<bookingId>#<n>` and `rev-undo:<bookingId>#<n>`, where `n` is the number of
prior postings for that booking.
- **AC-7 holds** — the reversal key is deterministic given `n`, so a second undo of the same posting is the same
  key and is skipped.
- **AC-8 holds** — a re-attend is `n+1`, a key that has never been used.
- **AC-9 holds for free** — every posting and every reversal is its own row; **nothing is edited or deleted.**

🚫 **Do not add a column for `n`.** Derive it from the movements that already exist for the booking — the same
place the duplicate check already reads. **A counter column is a migration and a second source of truth for
something the ledger already knows.**
⚠️ **Back-compatibility is not optional:** rows already posted carry the **un-suffixed** `rev:<bookingId>`.
**Generation 0 must keep that exact key**, or every historical booking looks unposted and the next day-end
double-posts it. **This is the single most dangerous line in the task.**

## §3 AC-5 / AC-6 — the two cases are already separated by the ACs
- **AC-5** is conditional on **posted** revenue ⇒ a **new movement of −฿X**, original untouched.
- **AC-6:** a course or voucher posts its revenue **at sale**, so the attendance posted nothing ⇒ **no movement at
  all, not a ฿0 row.** *(@Porter, and he is right — the same rule as REQ-078 AC-4, one rule in the product.)*
⇒ **The condition is "did THIS attendance post?", not "what type is it?"** — ask the ledger, exactly as §2's `n`
does. **A type list would be a second answer to a question the movements already answer.**

## §4 AC-2 / AC-3 — one counter, and prove it before assuming it
`used_sessions` / `used_hours` are the running counters, and `prior_sessions` is **deliberately not derived from
them** (an immutable import figure) — so **decrementing is safe and does not disturb it.**

📌 **My reading is that AC-3 is satisfied by AC-2**: the entitlement was never given back, so *every* view is
wrong; the owner reported the one he was looking at. ⚠️ **But that is a reading, not a proof** — **@Jason must
name where the "outside" number comes from** and confirm it derives. **If any screen caches or recomputes it
differently, that is a separate finding and I want it reported, not folded in.**

## §5 AC-4 — the correction must not spend leave quota
The `sick-leave` path consumes quota via `canTakeLeave`. ⚠️ **A correction is not a leave request** — the owner
ruled it, and `plannedAtCreation` already proves the code can distinguish *"this absence is free"* from *"this
absence costs"*. **Use that seam; do not invent a second one.**
🔴 **The guard must be "was this session attended?", not a flag on the request** — otherwise an admin can spend or
save a family's quota by choosing a button, and **whether a family's allowance is charged must not be a UI
choice.**

## §6 Symmetry — the reversal is the attend path run backwards, in one place
The attend path does three things: `status`, entitlement `+1`, and (at day-end) revenue. ⇒ **the undo does the
same three in one helper**, the way TASK-254 put both deduction sites behind one.
⚠️ **`ATTENDED → SICK_LEAVE` is reachable from both the admin action and any future path** — so the reversal
belongs beside the thing it reverses, **not in the request handler.**
🚫 **AC-10: the edit/move guard is untouched.** `C-24` was about cancel/undo only.

## §7 What this spec does not decide
- 🅿️ @Porter's one open confirm — *does the money stay for a course* — **does not block:** AC-6 already says a
  course posts nothing at attendance, so there is nothing to reverse either way.
- 🚫 Any notification. **A correction that messages a family is a product decision nobody has made.** ⚠️ But
  TASK-254's `COURSE DEDUCTION` fires on the deduction — **@Jason must confirm the undo does not fire it again**,
  and if a "session returned" message is wanted, that is @Porter's.

## §8 Build order
**One task.** The three effects share one condition (*was this attended?*) and one seam; splitting them ships a
correction that fixes the balance and leaves the money, which is the same class of half-fix TASK-255 refused.
