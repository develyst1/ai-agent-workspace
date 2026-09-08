# TASK-259 — a family's second LINE account must receive messages AND be able to use the bot
**Status:** ✅ **DONE — code** (Sober 09-06, reviewed) — tsc 0 · bun test **1445/0** (confirmed on 4 runs) · **no migration, no backfill** · 🚫 nothing sent.

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**Spec:** `SPEC-074` · **Supersedes** TASK-255, which was cut as a refactor and turned out to be this.
🔴 **`uat` batch #1 and NOT cuttable** — the customer has been told in writing that several parents can link and
act for each other. **This is the task that makes that true.**

> **Your read is the whole basis of this.** Everything below is the wiring; you already found the defect.

---

## §1 🔴 One task, two halves, and **do not submit one without the other**

Today the second phone is **consistently dead**. An outbound-only fix makes it **inconsistently alive** — messages
arrive, `เช็คอิน` does nothing — and the family then reports *"the bot is broken"* instead of *"my husband gets
nothing."* **The first is unactionable; the second is a bug report.**
⇒ **A half-fix is worse than the defect.** That is why this is one task and not two.

## §2 The accessors already exist and are already right — this is wiring

```
familyLineUserIds(parentId)  → column + links, deduped     ← outbound
familyOfLineUser(lineUserId) → links first, column FALLBACK ← inbound
```
📌 **The fallback is what makes this safe on existing data** — a family with no `family_line_links` row still
resolves through the column. **No backfill, and say so explicitly in your submission.**

## §3 🔴 The trap that would make this look like it did nothing

`reminderKey = reminder:<type>:<personId>:<date>`, enforced by `notification_outbox_idempotency_uq`.
**Today one parent = one device, so per-person and per-device are the same key.**

⇒ **The moment outbound writes a row per account, two rows for one family share one key, the second hits the
unique index and is swallowed as a duplicate. The father gets nothing — exactly as before — and every test of the
accessor still passes.**

**The key must identify the DEVICE.** ⚠️ **And it must not collide with rows already queued under the old
format** — same class as TASK-258's generation-0 rule. **Say which shape you chose and why an existing row cannot
collide with a new one.**
⚠️ **Check every other outbox key for the same assumption** — `reminderKey` is the one I found; **tell me whether
it is the only one**, rather than fixing only what I named. *(That question paid twice today.)*

## §4 The three layers

1. **Outbound** — the three sites you listed (`course-deduction.ts` `lookupParentLine` ·
   `scheduler.service.ts` `parentLineUserId` · the reminder's bulk lookup) → `familyLineUserIds`, **one outbox row
   per account.** ⚠️ The bulk one is a `findMany` shaped to avoid per-row lookups — **keep that shape.**
2. **Inbound** — `findParentByLineUserId` → `familyOfLineUser` across its **seven call sites**, **plus the
   hand-rolled copy in `checkin.service.ts:82`.** 🔴 **The copy is the one that will be missed** — it is the same
   two-step written out by hand, so a grep for the function name does not find it. **Assert there is no second
   hand-rolled lookup left.**
3. **Upstream** — `linkParentLine` stops overwriting. **First linked stays primary**; a second account is added
   to `family_line_links` and does **not** displace the column.
   📌 **Then document the column for what it now is:** `parents.line_user_id` is **the family's primary account,
   for display — not a routing fact.** Put it in the schema comment. **A column that used to steer everything and
   now steers nothing is exactly what the next person re-uses by accident.**

## §5 What must not move
- 🚫 The unique index on `family_line_links` — it was right all along; nothing was using what it protected.
- 🚫 `clearFamilyLine` / the menu unlink (TASK-243, TASK-249) — already correct for several accounts. **Confirm
  they still are once routing changes.**
- 🚫 Message CONTENT. REQ-077's templates are untouched — **more people receive the same message.**
- 🚫 **No preference, no "who receives what" setting.** Nobody asked for one; the promise was *ทำแทนกันได้*.

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1445 pass / 0 fail** (19 new)
- [x] **Outbound:** two accounts ⇒ **two sends with two different keys**, and `dueSends` filters neither —
      asserted by running the real functions, not by reading the source
- [x] **Inbound:** changed at the ONE resolver (`findParentByLineUserId` → `familyOfLineUser`), so all seven
      sites move together; **the hand-rolled copy in `checkin.service.ts` is gone**, asserted as an absence with
      its reason, plus a sweep assertion that **no other hand-rolled lookup is left** in any sender
- [x] **Upstream:** `linkParentLine` writes the column only `isNull(parents.lineUserId)` — asserted
- [x] **A family with ONE account behaves exactly as today** — its key is the byte-identical historical string
      and it is still send-once. Asserted as its own test, named as the regression that matters most
- [x] `parents.line_user_id`'s schema comment says it is the **primary account for DISPLAY, not a routing fact**,
      with the 🚫 for the next reader
- [x] 🚫 **No migration** (32 `drizzle/*.sql` = 32 journal tags) — and the reason is asserted: `familyOfLineUser`
      falls back to the column, so a family that has never had a link row resolves exactly as before. **No
      backfill.**
- [x] 🚫 No SQL, nothing sent

## Implementation Notes — Jason, 2026-09-06

Repo **`smart-scheduler-back`**, HEAD **`26e495e`**. `lib/family-link.ts` (`familyLineUserIdsBulk`) ·
`services/parent.service.ts` (both halves) · `services/checkin.service.ts` · `lib/course-deduction.ts` ·
`services/scheduler.service.ts` (`parentLineUserIds` + `enqueueParentCopies`) · `services/jobs.service.ts` ·
`lib/daily-reminder.ts` (`deviceReminderKey` · `reminderSends` · `dueSends`) · `db/schema.ts` · **new**
`lib/family-multi-account.test.ts`.

**§3 — the key, and why this shape.** `deviceReminderKey` gives the **primary account the un-suffixed person
key** and every additional account `…:<lineUserId>`. That buys both properties at once, which one shape alone
could not: a row queued this morning under the old format still suppresses the primary's duplicate (**nobody is
messaged twice on deploy day**), and an additional account's key **has never existed**, so it cannot collide with
anything. 📌 It is TASK-258's generation-0 rule in another costume — the same "the first one keeps the historical
string" trick, one day later.

**§4.1 — the bulk shape is kept, and it is the same function.** `familyLineUserIdsBulk` resolves the whole day in
two queries; `familyLineUserIds` is now **defined in terms of it**, so "primary first, deduped" has one
implementation. A per-row accessor call in that job would have re-introduced exactly what it was written to
avoid.

**§4.2 — changed at the resolver, not at the call sites.** `findParentByLineUserId` now asks `familyOfLineUser`,
so all seven inbound sites moved with one edit and none could be missed. The hand-rolled copy is gone, and there
is a sweep assertion that no other one exists.

⚠️ **Six of my own tests needed updating** — all of them pinning "one row per person" shapes that are now "one
row per account". Each kept its property: the reminder still collapses a day into one message per person, the
course confirm still enqueues outside the session loop, the same payload object still goes to everyone.

## Answers

**1 — `reminderKey` is the ONLY outbox key that assumed one device per person. I checked every keyed write:**
`rev:<bookingId>` / `rev-undo:` / `discount:` (a **booking**), `course-sale:<courseId>` and
`voucher-sale:<voucherId>` (an **object that was sold**), `fl:<bookingId>:<itemId>:held<n>` (a booking + a
ledger item). **Every one of them keys on a THING, not a person** — so none of them can be affected by how many
devices a person has. `reminderKey` was the only one keyed on a human, which is why it was the only one that
broke.

**2 — three readers of `parents.line_user_id` outside the notification paths. None routes, and I changed none
of them:**
- `lib/course-cleanup-plan.ts:65,102` — a **safety refusal** (*"this parent has a LINE account ⇒ not test
  data"*), owner-run script. ⚠️ Under the new rule a family linked ONLY through `family_line_links` would slip
  past it — unreachable today because the first link still fills the column, but it is a refusal about deleting
  real data, so **worth a line in whatever task next touches that script.**
- `lib/roster-link.ts:24` — `moveRosterLink` nulls the column `WHERE line_user_id = <id>` on a role change. For
  a **non-primary** account that matches nothing, so a `family_line_links` row would survive a parent becoming a
  teacher. Rare (one person, both roles) and not a routing bug; **reported, not fixed.**
- `services/checkin.service.ts:82` — the hand-rolled inbound copy, which **is** routing and is fixed here.
- ✅ Nothing in the backoffice, no report and no export reads it.

## Questions
1. **Is `reminderKey` the only outbox key that assumes one device per person?** Name what you checked.
2. **Does anything else read `parents.line_user_id` for routing** beyond the three outbound sites and the inbound
   lookup — a report, an export, the backoffice? **I have not swept it and I am not assuming the read was
   exhaustive for readers outside the notification paths.**


## Review — Sober, 2026-09-06: ✅ **PASS. TASK-259 is DONE (code).** Both halves, and the key shape is better than the one I described.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1445 pass / 0 fail**, confirmed on **four** runs ·
`deviceReminderKey` at `daily-reminder.ts:174` · `linkParentLine` guarded by `isNull(parents.lineUserId)`
(`parent.service.ts:93`) · no migration (32 = 32). Nothing sent.

⚠️ **One thing I will not round off:** my **first** run reported **1 fail** and took **5.56s** against ~1.05s on
every run since. **I could not name the test** — the four re-runs are clean and the output named nothing. The
runtime says contention on a cold first run rather than logic. **Recording it because a flaky suite is how a real
failure eventually gets waved through**, and I would rather it be written down unresolved than tidied away.

### ✅ §3 — you solved the trap better than I stated it
I said *"the key must identify the device."* **Your shape does that and keeps one property I had not asked for:**
the **primary** account keeps the **un-suffixed person key**, and additional accounts get `…:<lineUserId>`.
⇒ **a row queued this morning under the old format still suppresses the primary's duplicate — nobody is messaged
twice on deploy day** — and an additional account's key **has never existed**, so it cannot collide with anything.
📌 **It is TASK-258's generation-0 rule in another costume**, as you say: *the first one keeps the historical
string.* **Twice in two days, the same shape has been the answer to "change a key without breaking what is
already queued."** That is a pattern now, and worth reaching for first next time.

### ✅ Changed at the RESOLVER, not at the seven call sites
I wrote *"across its seven call sites"* — you changed `findParentByLineUserId` itself, **so all seven moved with
one edit and none could be missed.** 📌 **The instruction described the work; you found the seam.** And the
hand-rolled copy is gone with a sweep assertion that no other one is left — which matters because **that copy is
invisible to a grep for the function name**, which is exactly how it escaped being counted in the first place.

### ✅ The bulk shape kept, and made the single case
`familyLineUserIds` is now **defined in terms of** `familyLineUserIdsBulk`, so *"primary first, deduped"* has one
implementation and the reminder job keeps the two-query shape it was written to have. **A per-row accessor call
there would have re-introduced precisely what that job exists to avoid.**

### ✅ Answer 1 — the generalisation is the keeper
> *"Every other key is on a THING, not a person — `rev:`/`discount:` a booking, `course-sale:` an object that was
> sold, `fl:` a booking plus a ledger item. `reminderKey` was the only one keyed on a human, which is why it was
> the only one that broke."*

📌 **That is the class, stated once and reusable:** a key on a *thing* is unaffected by how many devices a person
has; **a key on a person breaks the moment a person can be plural.** Worth more than the list it came from.

### ✅ Answer 2 — two latent findings, both correctly reported rather than fixed
- **`course-cleanup-plan.ts` — a safety refusal about deleting real data.** A family linked ONLY through
  `family_line_links` would slip past *"this parent has LINE ⇒ not test data."*
  ✅ **Unreachable today, and I checked why: because first-link still fills the column — which your own
  `isNull` assertion pins.** ⇒ **the premise of that safety check is already a tested property**, not a hope.
  **That upgrades your note into a control, and it is worth knowing that it already is one.**
- **`roster-link.ts`** — a `family_line_links` row survives a parent becoming a teacher. Rare, not routing.
⇒ **Both now have a home with a trigger** (board, Blocked/waiting), because a finding in a finished task file is a
note, and a note is not a control. **Reported-not-fixed was the right call on both.**

**Status → DONE (code).** ⚠️ **The regression that mattered most is asserted:** a family with ONE account keeps the
byte-identical historical key and is still send-once. **That is every family we currently have.**
