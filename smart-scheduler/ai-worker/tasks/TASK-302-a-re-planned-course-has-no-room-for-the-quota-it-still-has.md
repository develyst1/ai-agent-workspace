# TASK-302 — a RE-PLANNED course has no room for the quota it still has

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
📌 **No clock, blocks nothing.** 🚫 No migration. 🚫 No FE change.
**Source:** **your own answer to TASK-301's Question** — *"it does NOT hold in two places, and I did not force
either."* 🔑 **You named it, declined to touch it because it was in `must not change`, and were right on both.**

---

## §1 The mechanism — I verified it before cutting this
`scheduler.service.ts:3897` — **`const expiryDate = replanExpiry(course.expiryDate, lastSession)`**, documented
as *"always covering the last planned session, and never shrinking."*
⇒ **a re-plan that finishes AFTER the old expiry sets the expiry to the last session EXACTLY.**
🔴 **Zero headroom** — and TASK-299 made that expiry the ceiling ⇒ **the next quota leave is refused.**
🔑 **The same defect as TASK-301, one verb over:** *the boundary equals the plan's end, and the quota the card
still shows has nowhere to go.*
📌 **Reachable on the ordinary path:** a course paused for a few weeks and resumed almost always ends later than
its original expiry. ⇒ **the family paused, came back, and lost the leave they had not used.**

## §2 ✅ The rule already exists — this is applying it, not inventing it
**TASK-301 established the promise: *the ceiling is the plan's end plus the REMAINING leave quota, in weeks*.**
⇒ **`replanExpiry` must keep that promise too.**
⚠️ **REMAINING, not full** — `courseLeaveQuota(course) − course.leaveUsed`. **A course that has spent its quota
gets no headroom, and that is correct: it has no leave left to take.**
✅ **The never-shrinking rule stands** — a re-plan finishing before the old expiry leaves it alone, and
`recordExpiryChange` still writes nothing when `from === to`.
🔑 **Use the same helper as TASK-301 if it fits.** ⚠️ **If the shapes genuinely differ, say so and write the
promise out again in words** — 🚫 **but do not leave two different arithmetics for one sentence.** *That is the
class this whole week has been about.*

## §3 What must not change
- 🚫 **The DERIVED expiry itself (TASK-282) — it is what killed DEF-4.** **This changes how far it reaches, never
  whether it covers the last session.**
- 🚫 `replanExpiry`'s never-shrink rule · `recordExpiryChange`'s `from === to` guard · the audit trail (REQ-082).
- 🚫 The quota, `leaveUsed`, `courseLeaveQuota`, `startDate` on resume · TASK-299's ceiling SOURCE ·
  TASK-300's anchor · TASK-301's `courseBornCeiling`.
- 🚫 No migration · no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **A resumed course with unused quota can take a leave** — asserted end to end. **Write it first**
- [ ] 🔑 **A resumed course with its quota SPENT gets no extra room** — ⚠️ **this is the assertion that keeps it a
      promise rather than a gift.** *"Remaining" is the whole difference*
- [ ] **A re-plan finishing BEFORE the old expiry still leaves it untouched** — asserted, **and
      `recordExpiryChange` still writes nothing**
- [ ] **The expiry still covers the last planned session** — asserted, because that is DEF-4's guarantee
- [ ] 🔑 **Break it and watch** — drop the remaining-quota term and show the resumed course refused again **for
      that reason**; restored, suite green, before the number
- [ ] 🚫 The derived expiry, the never-shrink rule, quota and `leaveUsed` untouched — asserted

## Question
🔑 **Your property — *a course's ceiling always leaves room for its remaining quota* — held at creation and
failed at re-plan.** ⇒ 📌 **once this lands, can that property be asserted ACROSS the lifecycle rather than per
entry point** — created, imported, re-planned, admin-edited?
⚠️ **The admin edit is a deliberate exception and must stay one** — **so the honest form may be *"every path that
computes the boundary keeps the promise; the one path where a PERSON chooses it does not"*.**
🔴 **If that is the shape, then the interesting question is whether anything warns an admin who edits the expiry
into a course's own quota.** **Name it; do not build it.**

---

## ✅ RESULT 2026-09-08 — @Jason. tsc **0** · **1785 pass / 0 fail**, 142 files · 🚫 **35 `.sql` = 35 journal tags.**

- [x] `tsc --noEmit` → **0** · `bun test` → **1785 / 0**, 142 files · 🚫 no migration (**35 = 35**, counted)
- [x] 🔑 **A resumed course with unused quota can take a leave** — **written first**
- [x] 🔑 **A resumed course with its quota SPENT gets no extra room** — the boundary lands on its last session
      exactly, as before. *"Remaining" is the whole difference*
- [x] **A re-plan finishing BEFORE the old expiry leaves it untouched**, and `recordExpiryChange` still writes
      nothing — both asserted
- [x] **The expiry still covers the last planned session** — asserted across every quota value, because that is
      DEF-4's guarantee
- [x] 🔑 **Break it and watch** — dropping the term returns the expiry as the last session exactly and the
      resumed course is refused again; restored, suite green, before this number
- [x] 🚫 The derived expiry, the never-shrink rule, quota and `leaveUsed` untouched — asserted

New: `src/lib/replan-quota-room.test.ts` (10 tests).

### §1 ✅ The same arithmetic, not a second one
```ts
replanExpiry(currentExpiry, lastSession, remainingQuota) =
  lastSession ? courseBornCeiling(currentExpiry, lastSession, 0, remainingQuota) : currentExpiry
```
🔑 **A re-plan declares no absences, so it IS `courseBornCeiling` with `absences = 0`.** The shapes did fit, so
there is one arithmetic for one sentence — **and it is asserted by AGREEMENT** across every quota value, so a
change to either function that does not change the other fails there rather than in production.
⚠️ `remainingQuota = Math.max(0, courseLeaveQuota(course) − course.leaveUsed)`, floored at zero so a course
somehow over its quota cannot pull the expiry backwards and fight the never-shrink rule.

### §2 ✅ Break it and watch — and the REASON
Replacing the remaining term with `0` returns `2026-12-01` — **the last session exactly, zero headroom** — and
`exceedsExtensionCeiling` refuses the leave again. Three assertions fail and the first names the case.
📌 **The *"quota SPENT"* test correctly keeps PASSING under that mutation**, which is the right shape: with
nothing remaining the two builds agree, and a mutation that broke it too would have meant the term was doing
something other than what it claims.

### 🔑 The Question — **yes, and your form of it is the right one**
> *"Every path that COMPUTES the boundary keeps the promise; the one path where a PERSON chooses it does not."*

**Asserted as one test over the three computing paths**, so a fourth entry point added without the promise fails
there rather than on a family's calendar:
| path | ceiling | keeps *plan end + remaining quota* |
|---|---|---|
| **created** | `courseBornCeiling(courseExpiry, lastPlanned, absences, quota)` | ✅ |
| **imported** | `importedCourseExpiry` → `courseExpiry(realStart, size, quota)` | ✅ |
| **re-planned** | `replanExpiry` → `courseBornCeiling(…, 0, remaining)` | ✅ |
| ⚪ **admin edit** | whatever the person typed | **deliberately not — TASK-299's rule** |

📌 **One thing worth naming from building it:** the imported path keeps the promise **by a different
expression** — `courseExpiry` encodes *plan end + quota* directly, while the other two go through
`courseBornCeiling`. They cannot disagree in the direction that matters, because `courseBornCeiling` takes
`courseExpiry` as its `base` and `max`es with it. **But it is the same sentence in two arithmetics**, and if a
fourth path ever needs a third, that is the moment to collapse them.

### 🔴 Your last question — **nothing warns the admin. Named, not built.**
`updateCourseExpiry` computes `expiryImpact`, which reports the **SESSIONS** that would fall outside the new
date. **It says nothing about the leave the family still has.** ⇒ **an admin can silently spend a course's
remaining quota by moving one date**, and the first sign is a leave refused weeks later with a message about the
course's end date.
⚠️ Asserted only as *the absence of `leaveUsed` in that function* — so if someone later adds the warning, this
test tells them the note here is stale rather than letting it sit.

**BALL: @Sober — TASK-302 ready for review. ⛔ TASK-298 next, still open on me.**
