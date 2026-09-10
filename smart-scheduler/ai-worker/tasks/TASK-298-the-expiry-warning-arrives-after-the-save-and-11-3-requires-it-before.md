# TASK-298 — the expiry warning arrives AFTER the save, and `REQ-085 §11.3` requires it BEFORE

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
📌 **No clock, blocks nothing.** 🚫 **No migration.** 🚫 No FE change *(that half comes after this route exists)*.
🔑 **`§11.2` asked for an admin-editable expiry. It has existed since `REQ-082` / TASK-265. Read §1 before you
plan anything — this task is one word wide: BEFORE.**

---

## §1 🔑 What already exists — do not rebuild any of it
| | |
|---|---|
| `PATCH /courses/:id/expiry` | writes the admin's date · **`updateCourseExpiry`**, `scheduler.service.ts:3688` |
| `EditExpiryDialog.tsx` | the FE dialog, **wired at `CoursePackagePanel.tsx:336`** |
| `expiryImpact` | `lib/course-expiry-impact.ts` — **PURE, and takes the sessions rather than fetching them** |
| `ExpiryWarningAlert` | renders `warn` / `outside` / `outsideCount`, **computing nothing** |

✅ **@Porter's DoD — *"it must NAME the sessions it cuts; a count is not enough"* — is ALREADY MET.**
`ExpiryWarning.outside` is a **list**, and the alert renders it as one (`contract.ts:241`, *"AC-4 asks for the
list, not a count"*). 🚫 **Nothing to add there.**

## §2 🔴 The one real gap, and it is a timing gap
`EditExpiryDialog`'s own comment states it plainly:
> *"the warning only exists after the save: `PATCH /courses/:id/expiry` writes the new date and returns what
> that left outside it. So this asks, saves, and then shows what happened."*

**`REQ-085 §11.3`, ratified by the owner:** **an earlier-than-derived expiry is ALLOWED, but the system must
SAY WHAT IT CUTS OFF *before* saving.** ⇒ 🔴 **today it says it afterwards.**
🔑 **@Porter's reason is the acceptance criterion, not the rule:** ***"DEF-4 was an expiry preceding the
course's own last session, and it reached the owner because NOTHING SAID SO. The defect was never that the date
was wrong — it was that the date was SILENT."***
⚠️ **A warning after the write is not silence — but it is the admin learning what they did, not deciding it.**
📌 **This is `SYSTEM-FACTS`' *"this product commits and then shows"* — the exact pattern @Porter has forbidden
for `REQ-086`'s editor. His `§11.3` ruling is the fix for a live instance of it.**

## §3 What to build — and it is small because the thinking is done
✅ **A read-only preview: "if I set this expiry, what falls outside?"** — **`expiryImpact` already answers it,
purely.** ⇒ **load the course's rows, call it, return the same `ExpiryWarning` the PATCH returns.** 🚫 **Write
nothing.**
🔑 **Same shape as `POST /courses/:id/cancel/preview` (TASK-291)** — **the server owns the answer, and the
dialog asks before the admin acts rather than counting rows itself.**
- 🔑 **The response must be the SAME `ExpiryWarning` shape the PATCH returns.** ⚠️ **Two shapes for one question
  is two answers that can disagree** — and this file's own header says three copies of one answer is *"this
  project's most frequent defect"*.
- 🚫 **Do NOT change `expiryImpact`, `EXPIRY_SETTLED_STATUSES`, or what the PATCH returns.** **The PATCH keeps
  its warning** — an admin who edits by some other path must still be told.
- 🚫 **Not a gate.** **`REQ-082` AC-4 is *warn, and still save*, and `§11.3` says the same:** ***"Not a refusal.
  The admin may still do it; they may not do it BLIND."*** ⇒ **this route refuses nothing and returns no
  `problem`.**

## §4 What must not change
- 🚫 `expiryImpact` and `EXPIRY_SETTLED_STATUSES` · the PATCH's behaviour, response and status codes
- 🚫 The derived expiry (**TASK-282 — it is what killed DEF-4**) · `resumeCourse` · no migration · no FE change

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **The preview returns the SAME `ExpiryWarning` the PATCH returns for the same date** — asserted **by
      comparing the two**, not by reading them
- [ ] 🔑 **It WRITES NOTHING** — asserted: the course's `expiryDate` and its rows are **unchanged after the
      call**. ⚠️ **This is the assertion that matters most; every other property is cosmetic beside it**
- [ ] **An earlier date names the sessions it cuts** — the LIST, not just the count
- [ ] **A later date returns `warn: false`** — 📌 *the owner sets a later expiry freely, so the quiet case is a
      real case, not an edge one*
- [ ] 🔑 **Break it and watch** — and **restore it, with the suite green before you report a number**
- [ ] 🚫 The PATCH byte-identical · `expiryImpact` untouched — asserted

## Question
📌 *`expiryImpact` was built pure so that the resume could ask about sessions **that do not exist yet**. That
foresight is why this task is a route and not a feature.*
🔑 **Which OTHER acts in this product commit before they show?** — **you have `/cancel/preview` and now this;
the resume has one; `ImportBalanceModal` may.** ⚠️ **I am not asking you to build any of them.** **Name the acts
where an admin learns what they did rather than deciding it** — 🔴 **because `REQ-086` hands the customer an
editor, and that list is the argument for what its preview has to cover.**

---

# ➕ §5 AMENDMENT — @Sober, 2026-09-08. **The preview must also say if the new date eats the course's remaining LEAVE.**

**Source: @Jason's own closing finding on TASK-302** — *"`expiryImpact` reports the SESSIONS that would fall
outside the new date. It says nothing about the leave the family still has."*

## 🔴 Why this belongs HERE and not in a task of its own
**TASK-298 exists so an admin is told what an earlier expiry CUTS OFF, before saving.** 🔑 **Losing the leave the
family has not used is one of the things it cuts off** — **and it is the one the admin cannot see anywhere on the
screen.**
⇒ **Two dialogs asking "what will this cost?" at the same moment, built a week apart, is precisely the split this
week has been spent closing.** 📌 *And TASK-298 has not started, so this costs nothing to fold in now and costs a
second FE change later.*

**The consequence @Jason named, in his words:**
> *"An admin can silently spend a course's remaining quota by moving one date, and the first sign is a leave
> refused weeks later with a message about the course's end date."*
⚠️ **That refusal now names the course's own end date (TASK-301) — which is honest and still tells the admin
nothing about WHY the room disappeared.**

## ✅ What to add
**The preview reports the remaining-leave room the chosen date leaves** — `courseLeaveQuota − leaveUsed`, and
whether the date leaves weeks for it. ⚠️ **Same rule as everywhere else tonight: *plan end + remaining quota*.**
🚫 **Still not a gate.** **`§11.3` and REQ-082 AC-4 both say warn-and-save, and TASK-299's rule is that a
deliberate act sets the boundary.** ⇒ **the admin may spend the quota; they may not spend it blind.**
🔑 **Report it, do not compute a verdict:** ⇒ **the numbers on the wire, the sentence on the screen** — the same
division that let `ExpiryWarningAlert` compute nothing.
⚠️ **If this genuinely needs a different data path from the session impact, SAY SO and it becomes its own task.**
**I would rather hear that than have it wedged in.**

## ➕ Added to the Definition of Done
- [ ] **The preview reports the remaining leave the date leaves room for** — asserted, ⚠️ **including the case
      where the quota is SPENT and there is nothing to warn about**
- [ ] 🔑 **A date that eats the room is distinguishable from one that does not** — asserted on both sides. *A
      warning that fires either way is not a warning*
- [ ] 🚫 **Still not a gate** — asserted: the preview refuses nothing and returns no `problem`

---

## ✅ RESULT 2026-09-09 — @Jason. tsc **0** · **1797 pass / 0 fail**, 143 files · 🚫 **35 `.sql` = 35 journal tags.**

- [x] `tsc --noEmit` → **0** · `bun test` → **1797 / 0**, 143 files · 🚫 no migration (**35 = 35**, counted)
- [x] 🔑 **The preview returns the SAME `ExpiryWarning` the PATCH returns** — **by construction, not by
      comparison**: both read one function, so there is nothing to keep in step
- [x] 🔑 **It WRITES NOTHING** — asserted as an absence across **both** the route body and the shared
      computation it delegates to
- [x] **An earlier date names the sessions it cuts** — the LIST, and a settled session is never in it
- [x] **A later date returns `warn: false`** — the quiet case asserted as a real case
- [x] 🔑 **Break it and watch** — restored, suite green before this number
- [x] 🚫 The PATCH byte-identical · `expiryImpact` and `EXPIRY_SETTLED_STATUSES` untouched — asserted
- [x] **§5: the preview reports the remaining-leave room**, including the SPENT case · **a date that eats the
      room is distinguishable from one that does not**, asserted on both sides · 🚫 **still not a gate**

New: `POST /courses/:id/expiry/preview`, `expiryLeaveRoom` (pure), `src/lib/expiry-preview.test.ts` (12 tests).

### §1 One answer, two callers — rather than two derivations kept in step
`expiryDecision(id, expiryDate)` loads the course and its rows once and returns the impact **and** the leave
room. The preview reports it; the PATCH writes and then reports it.
🔑 **The DoD asks the preview and the PATCH to agree, and I made that unfalsifiable instead of tested:** there
is now exactly **one** `expiryImpact(` call in the service, asserted. Two derivations of one question are two
answers that can disagree, and this file's own header calls three copies of one answer this project's most
frequent defect.
🚫 **The PATCH's response is unchanged** — `leaveRoom` rides on the preview only, so §4 holds.

### §2 ✅ §5 — and the answer to your "say so if it needs a different data path" is **no, it does not**
The leave room needs the **same rows** (for the plan's end) and the **same course row** (for
`courseLeaveQuota − leaveUsed`) that the session impact already required. ⇒ **one load, two answers**, asserted
as `findMany` appearing exactly once in the shared function. **It folded in; it was not wedged in.**
`expiryLeaveRoom` sits beside `expiryImpact`, pure, using the **same `EXPIRY_SETTLED_STATUSES`** and the **same
inclusive boundary** — a boundary meaning one thing in the session warning and another in the leave warning
would be worse than no warning.
🔑 **Numbers, not a verdict:** `remainingLeave · planEnd · neededFor · roomFor · roomForAll`. The screen writes
the sentence, which is the division that already lets `ExpiryWarningAlert` compute nothing.
⚠️ **The SPENT case is the one that keeps it honest** — a family with no leave left loses nothing, so an earlier
date must not stack a leave warning on top of the session warning it already raises. Asserted.

### §3 ✅ Break it and watch
Making the preview save — `db.update(coursePackages).set({ expiryDate })`, the exact mistake a route sitting one
letter from a PATCH invites — fails the writes-nothing assertion **on the route body**, naming it. Restored.

### 🔻 Three tests were defending the old call site — all corrected, none deleted
`course-ended-writes.test.ts`'s **write-route classification caught the new route by omission on the first
run**, exactly as designed; classified `unrelated` with the reason (*nothing is reachable from it because there
is no write*). And two assertions pinned `const impact = expiryImpact(` — both now follow it into
`expiryDecision`, **with the property they protect unchanged**: the edit still warns, and still nothing throws
between having the warning and writing.

### 🔑 The Question — **the acts that commit before they show are the ones where the SYSTEM picks a DATE**
| act | previews? |
|---|---|
| create course · import · end course · workDays change · plan change *(incl. `mark-absence`)* · **expiry (this task)** | ✅ |
| 🔴 **`POST /bookings/:id/status` — `sick-leave`** | ❌ **none** |
| 🔴 **`POST /courses/:id/resume`** — the re-plan | ❌ **none** |
| `POST /bookings/:id/status` — `cancel` on a course session (reconciles and re-owes) | ❌ |
| `bulkConfirm` — partial success | ❌ |

🔴 **The everyday leave is the one with no preview, and it is the highest-frequency date the system chooses.**
📌 **That is how TASK-300 stayed invisible for as long as it did:** nobody could see where a make-up would land
until it had landed. The plan editor previews the same act (`planChange` `mark-absence`) — **so the product
already knows how to answer the question; the per-session path just never asks it.**
⚠️ **And the resume picks N dates at once and can fail mid-way with `SLOT_TAKEN`** ⇒ an admin discovers a clash
only on submit, having already chosen a schedule.

⇒ 🔑 **For `REQ-086`, the line I would draw is not "acts that write" but *"acts where the system, not the
person, decides something the person will be held to"*.** A date the family is told about is exactly that, and
it is why the preview list above splits so cleanly. 🚫 **Named, not built** — none of these is in this task.

**BALL: @Sober — TASK-298 ready for review. ⛔ Nothing else is on me.**
