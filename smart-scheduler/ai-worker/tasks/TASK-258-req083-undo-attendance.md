# TASK-258 — REQ-083: undo an attendance — entitlement back, revenue reversed, no leave quota spent
**Status:** ✅ **DONE — code** (Sober 09-06, reviewed) — tsc 0 · bun test **1426/0** · no migration · 🚫 nothing sent. 🔴 The sweep found **two** further money defects (SPEC-069's warning · the discount key) that the generation change would otherwise have introduced.

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**Spec:** `SPEC-073` · **Requirement:** `REQ-083` AC-1…AC-10.
**`uat` batch, #2** — behind TASK-255's defect, ahead of REQ-076. **A customer-visible wrong number.**

---

## §1 Nothing exists yet — this is build, not repair
No `usedSessions - 1` / `usedHours - 1` **anywhere in the repo**; no reverse/refund/void in `sale-post.ts`; and the
`sick-leave` path **charges leave quota**, against AC-4. **AC-2, AC-4, AC-5 and AC-7 are all new.**

## §2 🔴 Read this before you design anything: **AC-8 is impossible today**

Revenue posts on **`rev:<bookingId>`** — **fixed for the life of the booking.** So after one correction, a
re-attend hits the duplicate check and `recordSale` returns `{ ok: true, skipped: "duplicate" }`.
⇒ **AC-8 does not fail loudly. It returns `ok` and writes nothing.**
⚠️ **A reversal key alone will not save it:** AC-7 wants the *reversal* idempotent, AC-8 wants the *posting*
repeatable — **opposite demands on one key.**

### The rule: a booking's revenue is a SEQUENCE, not one fact
**`rev:<bookingId>#<n>` and `rev-undo:<bookingId>#<n>`**, `n` = the number of prior postings for that booking.
AC-7 holds (same `n` ⇒ same key ⇒ skipped) · AC-8 holds (`n+1` is fresh) · **AC-9 holds for free** — every event
is its own row and nothing is edited or deleted.

🚫 **No column for `n`.** Derive it from the movements already there — the same place the duplicate check reads.
**A counter column is a migration and a second source of truth for something the ledger already knows.**
🔴 **The most dangerous line in this task:** rows already posted carry the **un-suffixed** `rev:<bookingId>`.
**Generation 0 MUST keep that exact key.** Get it wrong and every historical booking reads as unposted and the
next day-end posts it a second time. **Assert the un-suffixed form is what generation 0 produces.**

## §3 AC-5 / AC-6 — ask the ledger, not the type
**AC-5:** posted ⇒ a **new** movement of **−฿X**; the original is never edited or deleted.
**AC-6:** posted nothing (course/voucher post at **sale**, or the day-end had not run) ⇒ **no movement at all —
not a ฿0 row.**
⇒ **The condition is "did THIS attendance post?"** — the same question `n` answers. 🚫 **Not a booking-type list**:
that would be a second answer to something the movements already know, and it would drift.

## §4 AC-4 — a correction must not spend leave quota
The `sick-leave` path consumes quota via `canTakeLeave`. **The owner ruled `ไม่กินโควตาลา`** — a named exception
to `C-22`. 📌 `plannedAtCreation` already proves the code can distinguish *"this absence is free"* from *"this
absence costs"* — **use that seam, do not invent a second.**
🔴 **The guard is "was this session ATTENDED?", never a flag on the request.** Otherwise an admin can spend or save
a family's allowance by choosing a button, and **whether a family is charged must not be a UI choice.**

## §5 AC-2 / AC-3 — and a thing to prove rather than assume
`used_sessions` / `used_hours` are the running counters; `prior_sessions` is **deliberately not derived** from
them, so decrementing is safe and does not disturb it.
⚠️ **I believe AC-3 falls out of AC-2** — the entitlement was never returned, so *every* view is wrong and the
owner reported the one he looked at. **That is my reading, not a proof.** ⇒ **Name where the "outside" number
comes from and confirm it derives.** **If any screen caches or recomputes it differently, report it — do not fold
it into this task.**

## §6 One helper, beside the thing it reverses
The attend path does three things — `status`, entitlement `+1`, revenue. **The undo does the same three, in one
place**, the way TASK-254 put both deduction sites behind one helper. ⚠️ **Beside what it reverses, not in the
request handler** — `ATTENDED → SICK_LEAVE` must behave identically however it is reached.
🚫 **AC-10: the edit/move guard is untouched.** `C-24` was about cancel/undo only.

## §7 Notifications — confirm, do not decide
🚫 **No new message.** ⚠️ **But TASK-254's `COURSE DEDUCTION` fires on the deduction — confirm the undo does not
fire it again**, and say what you checked. **A "session returned" message is @Porter's to decide, not ours.**

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1426 pass / 0 fail** (23 new)
- [x] AC-1…AC-10 asserted and named by number in the titles — ⚠️ **as far as they can be without a database**:
      the key algebra and the reversal are proven by running the real functions; the branch wiring is a labelled
      **source** assertion, because statuses, counters and movements need rows. Said in the file's own header so
      the second kind is never mistaken for the first
- [x] 🔴 Generation 0 is the **un-suffixed** `rev:<bookingId>` — `expect(revKey(B, 0)).toBe(\`rev:${"{B}"}\`)`,
      against the literal, and the default argument is 0 so an un-updated caller cannot drift
- [x] AC-8 — both posting sites take the generation; AC-7 — the reversal's key is per-generation and the `23505`
      race returns `duplicate`. **The two demands are satisfied by the same algebra, asserted side by side**
- [x] AC-6 — no movement at all, asserted as an absence **with the reason**, plus the absence of any booking-type
      list in the reversal
- [x] AC-4 — no `leaveUsed`, no `canTakeLeave`, and the branch's own condition is `current.status === "ATTENDED"`;
      asserted that it reads **no** `override` / `reasonCode` flag
- [x] The `COURSE DEDUCTION` message does not fire on an undo — asserted as an absence in the branch
- [x] 🚫 **No migration** (32 `drizzle/*.sql` = 32 journal tags) — §2's design held; nothing needed a column
- [x] 🚫 No SQL, nothing sent

## Implementation Notes — Jason, 2026-09-06

Repo **`smart-scheduler-back`**, HEAD **`26e495e`**. `src/lib/sale-post.ts` (keys · `revGeneration` ·
`postedGeneration` · `reverseBookingSale`) · `src/services/scheduler.service.ts` (the undo branch) ·
`src/services/jobs.service.ts` (both posting sites) · **new** `src/lib/attendance-undo.test.ts`.

**The generation, as you specced it.** `revKey` / `revUndoKey` / `discountKey` all return the **un-suffixed**
string at generation 0 and `…#n` after, and `revGeneration` counts a booking's `rev:` movements — the
un-suffixed one **and** `rev:<id>#%` — so a booking posted last year counts as exactly one. `postedGeneration`
(= generation − 1) is the live posting, which is what the SPEC-069 reader now asks for.

**🔴 A fourth key you did not name, and it would have cost the family money.** The **discount** rides its sale on
`discount:<refId>` — also fixed for the life of the booking. Left alone, a re-posted sale would write the LIST
price and skip the discount (its key is taken), so **the books would over-charge by exactly the discount, silently**
— the same defect as AC-8, one key along. `discountKey` follows the generation, and `recordSale` takes an optional
`discountKey` that defaults to the old string, so a first posting is byte-identical.

**The undo branch sits beside the `attend` it reverses** (§6), keyed on `current.status === "ATTENDED"`.
⚠️ **AC-1 needed one thing the task did not name:** the advance-notice check would refuse **every** correction —
it asks whether leave was declared before the class, and an undo always happens after it. The branch does not run
it. That is also why it is a separate branch rather than a flag on the existing one.

📌 **The one judgement I had to make, and it is yours to overrule:** a real leave creates an auto-`EXTENDED`
make-up; **the undo does not.** That row exists to replace a session the family spent an entitlement on — here
the entitlement itself came back, so a make-up would give them the same session twice. ⚠️ **The consequence,
named:** the plan is then one scheduled row short of its balance until someone books it. I think that is right —
the balance is the promise, the calendar is the plan — but say the word if you want the row too.

## Answers

**AC-3 — it derives, and there is no cache.** Two counters exist and I checked both:
- **`coursePackages.used_sessions`** — the column, read through **`toCourseSummary`** (`lib/leave.ts:99`) by
  every "outside" surface: the course list/cards, `attention.ts`'s expiry warnings, `line-course-view` (the
  parent's own `คอร์สของฉัน`, which renders `size − usedSessions`), and the reminder rows. **One source, many
  readers** ⇒ **AC-3 falls out of AC-2 exactly as you read it**, for all of them at once.
- **`buildCourseHistory`** (`lib/course-history.ts:168`) — the only DERIVED one:
  `bookings.filter(b => COURSE_DELIVERED.has(b.status)).length`. It self-heals from the status change alone.
- 🚫 **Nothing caches or recomputes it a third way** — no materialised count, no denormalised field on a booking.

**Your Question — the `rev:<bookingId>` sweep. Four users, one of which is the fourth key above:**
1. `jobs.service.ts:188` — the trial/single/rental posting ⇒ **now generation-aware**.
2. `jobs.service.ts:235` — the อื่นๆ posting ⇒ **now generation-aware.** It shares the key family by design
   (TASK-225), so leaving it would have made อื่นๆ the one type that silently stops re-posting.
3. `lib/sale-post.ts:290` — **`postedSaleForBooking`, the SPEC-069 warning.** 🔴 It matched the fixed key exactly,
   so after a re-attend it would have told an admin *"no money posted"* about a booking that had just been
   charged — **the very defect SPEC-069 exists to close, one generation along.** Now reads the live generation.
4. `discount:<refId>` in `lib/discount-plan.ts:98` — the sibling described above.
- ✅ **Not affected:** `course-cleanup-plan.ts` collects `postedSaleRefIds` by **`ref_id`** (the booking id),
  which the generation does not touch; `reminderKey` and the outbox's `idempotency_key` are a different table
  and a different key space; `safeStoredDiscount` validates an amount and never reads a key.
- ⚠️ **Left alone deliberately:** the `rev:` mentions in comments (`schema.ts:579`, `daily-reminder.ts:131`)
  cite the key as an analogy for the outbox's send-once rule. They are still accurate.

## Question
**Does anything else key on `rev:<bookingId>`** — a report, a reconcile script, `safeStoredDiscount`, the
SPEC-069 "revenue already posted" warning? **§2 changes that key's shape for every future posting.** I have not
swept it and I want the sweep in your submission, **not the assumption that only `recordSale` reads it.**


## Review — Sober, 2026-09-06: ✅ **PASS. TASK-258 is DONE (code).** The sweep I asked for found two money defects my own design would have shipped.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1426 pass / 0 fail** (115 files) · all three key builders
default to generation 0 and return the **un-suffixed** string (`sale-post.ts:51`, `:55`, `:63`) · no migration
(32 = 32). Nothing sent.

### 🔴 The question was worth more than the design

I wrote §2's generation rule and then asked, as a question rather than a footnote, *what else keys on
`rev:<bookingId>`*. **Two of the four answers are defects my spec would have introduced:**

1. **`postedSaleForBooking` — SPEC-069's warning.** It matched the fixed key exactly, so after a re-attend it
   would have told an admin **"no money posted"** about a booking that had just been charged. 🔴 **That is the
   precise defect SPEC-069 exists to close, re-created one generation along, by the change meant to fix a
   different one.**
2. **`discount:<refId>` — the fourth key, which I never named.** It rides its sale and is fixed for life, so a
   re-posted sale would have written the **list price and skipped the discount** — **the books over-charging the
   family by exactly the discount, silently.**

📌 **Neither would have failed a test, thrown, or logged.** One tells an admin the wrong thing about money; the
other charges the wrong amount. ⇒ **The rule I am keeping: when a change alters the shape of a key, the sweep is
not diligence, it is part of the design** — a key is an interface, and I specced it as if it had one reader.
✅ **And you swept it properly** — including what is **not** affected (`postedSaleRefIds` matches on `ref_id`;
`reminderKey` is a different table; `safeStoredDiscount` validates an amount and reads no key) and what is
**deliberately left** (the `rev:` mentions in comments, still accurate). **Naming the non-instances is what makes
the sweep checkable.**

### ✅ Back-compatibility done the way that cannot drift
`revKey(B, 0) === \`rev:${B}\`` asserted against the literal, **and the parameter defaults to 0** — so an
un-updated caller produces the old string by construction rather than by remembering to. 📌 **The dangerous line
in the task is now dangerous only if someone passes the wrong number deliberately.**

### ✅ AC-3 — answered with evidence, and it closes my own hedge
I said AC-3 was *a reading, not a proof*. **You proved it:** one column, `used_sessions`, read through
`toCourseSummary` by every outside surface — list, cards, expiry warnings, the parent's own `คอร์สของฉัน`, the
reminder rows — plus `buildCourseHistory`, which is derived from status and self-heals. **No cache, no third
count.** ⇒ **AC-3 falls out of AC-2 for all of them at once**, and that is now a fact rather than my expectation.

### ✅ Two things the task did not name, both correct
- **The advance-notice check would have refused every correction** — it asks whether leave was declared before the
  class, and an undo is always after it. **That is a real reason for a separate branch rather than a flag**, and
  it is the kind of thing that would otherwise have been discovered by an admin who could not save.
- 🔴 **No auto-`EXTENDED` make-up on an undo — approved, and your reasoning is the right one.** A make-up exists
  to replace a session the family *spent*; here the entitlement came back, so a make-up would hand them the same
  session twice. **"The balance is the promise, the calendar is the plan"** — keep that sentence.
  ⚠️ **The consequence you named is real and I am passing it on rather than changing anything:** after an undo the
  plan is one scheduled row short of its balance until someone books it. **A parent may see "4 remaining" with 3
  classes on the calendar.** That is correct and it is also a support question — **@Porter's to know about, not
  ours to design away.**

**Status → DONE (code).** REQ-083's behaviour is built; AC-1…AC-10 are asserted, with the source-vs-behaviour
split labelled in the file so the second kind is never read as the first.
