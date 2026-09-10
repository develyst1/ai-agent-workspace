# TASK-326 — two raw time sites the sweep missed, and a lockstep file that is not in lockstep

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-10)
📌 **NOT in the `uat` batch. NO CLOCK.** 🚫 No BE change, no type change, no migration.
🔑 **Small on purpose. Two of the three items are mine to have got wrong.**

---

## §1 Two more raw time sites — **and neither is broken today**
**I gave you FOUR. There are SIX.** 🔻 **`CalendarWeekGrid.tsx:138`** (`{b.startTime}`) and
🔴 **`CheckinContent.tsx:108`** (`` `${b.startTime}–${b.endTime ?? ""}` ``).
✅ **I checked both before writing this:** `CalendarWeekGrid` takes DTO-mapped `Booking[]`; `CheckinContent`'s
payload returns through `toBookingDTO` too ⇒ 🚫 **neither shows seconds.**
⇒ ✅ **Route them through `formatTimeDisplay` anyway, for YOUR reason:** ***a renderer that is correct only
because a mapper in another repo is correct breaks silently the day that mapper moves.***
⚠️ **`CheckinContent` is the one that matters most:** **a PUBLIC page, its own local `BookingRef` type, fetched
directly rather than through the shared DTO types.** ⇒ 🔑 **the site least protected by the mapper is the one
on a parent's phone.**
📌 **Say if the count is still wrong** — *my grep produced the list of four and it was not exhaustive.*

## §2 🔻 The lockstep file that is not — **and I have cited it twice from the wrong side**
✅ **You are right, and I verified it.** **The sentence *"As stored (`HH:mm:ss`) — the FE formats"* is at
`smart-scheduler-back/src/types/contract.ts:156`.** **The FE's `src/types/api/contract.ts` — whose FIRST LINE
reads *"Synced from smart-scheduler-back/src/types/contract.ts — keep in lockstep"* — contains no `HH:mm:ss`
at all.**
🔴 **TASK-295 and TASK-324 both cite `contract.ts:155` for a line that exists only in the other repo.**
✅ **Copy the doc comment across.** 🚫 **COMMENT ONLY.** ⚠️ **Do not change a type and do not "sync" anything
else while you are there.** 🔑 **A lockstep file that has drifted in a COMMENT is a different problem from one
that has drifted in a TYPE — and if you find the second kind, that is a finding I want, not a fix I want.**

## §3 🚫 Named, not fixed — and this is the whole of it
**`CreateCourseModal:174` renders `{b.date}` raw** where every other list uses `formatDateDisplay`.
✅ **You were right to leave it: different call, different task, and the component is unrendered.**
🔴 **`ExpiryWarningSession.startTime` typed `HhMm` while carrying `HH:mm:ss` is NOT yours** — a BE type, and
**@Jason's call whether the TYPE is wrong or the VALUE is.** 🚫 **Do not touch it.**

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean, **say which command**
- [ ] **Both `§1` sites use `formatTimeDisplay`** — asserted per site
- [ ] 🔑 **You say whether SIX is the right number** — *and if it is not, the new list, not a fix*
- [ ] **`§2`'s comment copied across, comment only** — 🚫 **no type touched**, asserted as an absence
- [ ] ⚠️ **Any OTHER drift you notice between the two contract files is REPORTED, not fixed**
- [ ] 🚫 No BE change — asserted

## Question
🔑 **A file whose first line says *"keep in lockstep"* had drifted, and neither repo's tests could ever have
noticed.** ⇒ ❓ **Is there anything cheap that would?** 📌 *I am not asking for a build step or a codegen
pipeline — those are proposals for a different day.* ⚠️ **I am asking whether the FE could assert something
about the file it claims to mirror at all, or whether the honest answer is that a hand-copied file can only be
kept honest by hand.** 🔑 **If it is the second, say so plainly** — **then the fix is that the comment stops
promising lockstep and says what it actually is.**
