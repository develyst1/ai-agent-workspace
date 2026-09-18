# TASK-358 — Expiry with advance leave = the BASE ceiling + the leave weeks (`REQ-089 item 2`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-15)
**Source:** `REQ-089 §0 item 2` — the customer's example is the spec: **Kavya, size 6, starts 23/9, 3 weeks advance leave ⇒ expiry = 8 + 3 = 11 weeks from start. Today the system makes it the LAST SESSION's week.**
**Size S.** ⛔ **Chain stopped.** ⏱️ First deploy of the round rides with TASK-357.

---

## §1 The prior fact, then the change
`SYSTEM-FACTS` (TASK-301, 09-08): `courseExpiry(start, size)` = week `size + quota` (6 ⇒ week 8) — *plan end + quota weeks*; and **`courseBornCeiling` stretches from `lastPlanned` by the ABSENCES only** ⇒ with 3 declared absences the plan ends week 9 and the ceiling is week 9 = the last session. **That is exactly the screen the customer describes.** The quota's headroom is eaten by the leaves.
🔑 **The rule the customer states: `bornCeiling = courseExpiry(start, size) + (advance-leave weeks)`** — week 8 + 3 = week 11. The quota's week survives; the leaves add on top. Verify the "advance-leave weeks" unit: the number of DISTINCT WEEKS declared absent, not sessions (one weekly course ⇒ equal; state it).

## §2 What moves and what must not
- `course-plan.ts` `courseBornCeiling` (and only the creation path — `resumeCourse` records through the same writer; **say whether the resume path derives from the same function or has its own copy** — if a copy, that is a second source and goes on the owner's list, not into this task).
- 🚫 `exceedsExtensionCeiling` stays inclusive; the stored `expiryDate` stays THE ceiling (TASK-299); `PATCH /courses/:id/expiry` untouched; no migration (**35 = 35**).
- The plan RESPONSE that states the new expiry must show week 11 for the Kavya case — pin it by the customer's numbers (`2026-09-23` start, size 6, weeks 2–4 absent, or whichever three you pick — state them).

## Definition of Done
- [ ] Suite, **count** · tsc clean (`bunx --package typescript@5.6.3 tsc --noEmit`) · **35 = 35**
- [ ] Kavya pinned: 0 leaves ⇒ week 8 (unchanged, asserted) · 3 leaves ⇒ week 11 · a size-4 with 1 leave ⇒ week 6
- [ ] `SYSTEM-FACTS` line for TASK-301 is now WRONG — write the replacement sentence in your report; I edit the file
- [ ] 🔑 Break-and-watch ×2 (formula back · resume path), `finally`, CHECKSUM

## Question — ⚠️ answer to the OWNER'S LIST
❓ A course created BEFORE this lands has its ceiling stored at the old value. **How many live courses on `sid` would differ?** — that is a DATA REQUEST up the chain, not a query you run; name the column and the condition so @Porter can ask.

---

# 📤 REPORT — @Jason → @Sober (2026-09-15)

✅ **DONE (code).** **2121 pass / 0 fail**, **172 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (35 = 35)**. **One source line changed** (`courseBornCeiling`'s return, two lines), five pins rewritten across three files, one new test file.

## §1 🔑 The formula, and why the old one ate the quota
**Before:** `max(base, lastPlanned + absences)`. The creation path lays the plan as a uniform weekly chain (weeks 1..size) and appends one make-up per declared absence AFTER it, so `lastPlanned` = week `size`. Kavya: base = week 8, plan end = week 6, +3 = week 9 ⇒ `max(8, 9)` = **week 9 = the last make-up session, the quota's two weeks eaten.** *Exactly the screen the customer described.*
**Now:** `addDays(max(base, lastPlanned), absences × 7)` — **the BASE (which already holds the quota's weeks) plus the absent weeks.** Kavya: week 8 + 3 = **week 11.** ✅ **Pinned by HIS numbers:** `2026-09-23` start, size 6 · 0 leaves ⇒ week 8 (unchanged, asserted) · 3 leaves ⇒ week 11 (and `!== week 9`, the old answer asserted absent) · size 4 + 1 leave ⇒ week 6. 🚫 **Still never shrinks:** a plan drawn PAST the base keeps its own end as the floor, and the absences add on top of whichever is later — asserted.
📌 **The unit:** `absences` = the number of DISTINCT WEEKS declared absent — the creation path passes `absentWeeks.size`, a `Set` of 1-based week numbers, so a week declared twice counts once. **On a weekly course that equals sessions, which is every course today.** Asserted at the call site, and mutation C (pass `.length` instead of `.size`) fails.

## §2 ❓ The resume path — the SAME function, not a copy
`replanExpiry(currentExpiry, lastSession)` = `courseBornCeiling(currentExpiry, lastSession, 0)` — **with `absences = 0` the formula is `max(currentExpiry, lastSession)`, which is exactly what it was before this task.** ⇒ **a resumed course's ceiling does not move because of TASK-358, and there is no second source.** `resumeCourse` reaches it through `replanExpiry` and has no `addDays` of its own — asserted, and mutation B (the resume path growing its own arithmetic) fails. The creation PREVIEW uses the same function too (two call sites in the service, no ceiling arithmetic outside the one function — asserted).

## §3 🔻 The pins — five moved, all REWRITTEN, one REVERSED with the reason
`extension-ceiling` ×3, `makeup-far-out`, `replan-quota-room`: every one pinned the size-4 / 3-absences case at **week 7** (the last make-up); it is **week 8** now (5 + 3). **The claim each makes — *the ceiling covers the plan* — is unchanged; the number moved UP.** ⚠️ **One is a REVERSAL and says so:** `replan-quota-room`'s *"no quota term at CREATION either"* — 🔑 **`REQ-089 item 2` reverses the OUTCOME, not TASK-308's reasoning: there is still no separate quota term; the stretch simply starts from the BASE (which already holds the quota's week) instead of from the last session.** The resume path's "no quota term" assertions in that file are untouched and still true.

## §4 ✅ SYSTEM-FACTS — the replacement sentence, for you to place
The TASK-301 block (`§ The stretched ceiling drops the quota's week`, 2026-09-08) is now WRONG in its second paragraph. **Replace it with:**
> 🔻 **TASK-358 (`REQ-089 item 2`, 2026-09-15): `courseBornCeiling(base, lastPlanned, absences)` = `max(base, lastPlanned) + absences weeks` — the BASE ceiling (plan end + quota) plus the DISTINCT WEEKS declared absent.** Kavya, size 6, 3 absent weeks ⇒ week 8 + 3 = **week 11**; 0 absences ⇒ week 8, unchanged. It used to stretch from the plan's LAST SESSION by the absences (`max(base, lastPlanned + absences)`), which put the ceiling ON the last make-up and let the leaves eat the quota's weeks — the customer's own example refused that. **`replanExpiry` (resume) is the same function with `absences = 0` ⇒ `max(currentExpiry, lastSession)`, unchanged by TASK-358.**
The TASK-301/302 block (`§ The ceiling promise, stated once`) describes a four-argument signature with a `quota` term that TASK-308 already removed; it was stale before today — 📌 *say if you want that one rewritten too; I did not touch `SYSTEM-FACTS`, per the DoD.*

## §5 🔑 Mutation — three, `finally`, checksum — all bite
**A** the formula back (Kavya = week 9 again) ⇒ 3 fail · **B** the resume path grows its own arithmetic ⇒ 1 fail · **C** sessions instead of distinct weeks ⇒ 1 fail.
🔻 **And TASK-342's rule caught ME in this task's own test:** my first region for the `absentWeeks.size` assertion used a bare `indexOf` for its END anchor, found an earlier `const [course] = await tx`, and the region was EMPTY on the first run. Rewritten to search the end FROM the start index, with a positive over the same region. *The rule works on its author.*

## §6 ❓ YOUR QUESTION — courses born BEFORE this lands: how many on `sid` would differ? **A DATA REQUEST, not a query I run.**
🔑 **The column:** `course_packages.expiry_date` — the stored ceiling (TASK-299: the stored value IS the ceiling).
🔑 **The condition — a course would DIFFER if and only if it was created with declared absences and is still live:**
- `course_packages.ended_at IS NULL AND dropped_at IS NULL` (live), and
- it has at least one `bookings` row with `planned_at_creation = true` (a declared absence at creation), and
- its stored `expiry_date` < `courseExpiry(start_date, size) + (number of DISTINCT WEEKS among those rows) × 7 days` — **which, for every course created by the old formula with ≥1 absence, it will be** (the old value was the last make-up's week; the new one is the base + the weeks).
📌 **What @Porter can ask the human for, in one sentence:** *"On `sid`, count live `course_packages` (`ended_at` and `dropped_at` both null) that have any booking with `planned_at_creation = true`, and for each list `id`, `start_date`, `size`, `expiry_date`, and the number of distinct booking dates flagged `planned_at_creation`."* From that list the new ceiling is arithmetic I can do on paper: `start + (maxWeek(size) − 1 + distinctAbsentWeeks) × 7 days`. ⚠️ **No cleanup is proposed by this task** — whether to move those courses' stored ceilings is the owner's, and `PATCH /courses/:id/expiry` already exists for an admin to do it per course if he says yes.
