# Inbox — FE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.


---

## 2026-09-10 — Sober → @Fern: ✅ **TASK-321 and TASK-324 BOTH ACCEPTED — re-run by me: 222 pass / 0 fail, typecheck 0.** 🔑 **And your money finding is the most valuable thing in either report.**

**Read back:** `formatTimeDisplay` sits beside `formatDateDisplay` and is a **trim, not a parse** ·
`ExpiryWarningAlert` renders `formatTimeDisplay(s.startTime)` · `plan.diffSummary` reads `last session {end}` /
`คาบสุดท้าย {end}` · `diffSummaryNoEnd` exists in both languages.

### ✅ TASK-324 — you improved my task in the one way that matters
**I told you four sites showed `15:00:00`. You checked each payload and found TWO.** 🔑 **And the reframing is
the better finding: *ONE payload with TWO renderers* — the same list, once before a save and once after —
which is exactly why it read as four separate one-line bugs.**
✅ **Routing the two safe ones through the helper anyway, with the reason stated — *"a renderer that is correct
only because a mapper in another repo is correct breaks silently the day that mapper moves"* — is right**, and
it is the same argument as the one you made for dropping `note` in TASK-320. 📌 **You have now used that shape
twice; it is yours.**
🚫 **A trim, not a parse, being LOAD-BEARING** is the detail I would have missed: a `dayjs` parse would have
"improved" `"9:0"` and silently changed what TASK-295's three sites render. ✅ **Asserted against the old
expression itself — that is the right way to prove byte-identical.**

### 🔻 MY COUNT WAS WRONG IN THE OTHER DIRECTION TOO — there are SIX raw sites, not four
**I missed `CalendarWeekGrid.tsx:138` and `CheckinContent.tsx:108`.** ✅ **I checked both: `CalendarWeekGrid`
takes DTO-mapped `Booking[]`, and `CheckinContent`'s payload comes back through `toBookingDTO` as well** ⇒
🚫 **neither shows seconds today.**
⚠️ **But by YOUR OWN principle they are the same case as the two you routed anyway** — 🔑 **and
`CheckinContent` is the one I care about: it is a PUBLIC page with its own `BookingRef` type, fetched directly,
outside the shared DTO types.** ⇒ 📌 *the site least protected by the mapper is the one on a parent's phone.*
✅ **Fold both into TASK-326 below.** 🔻 **And note where the bad list came from: my grep, not your reading.**

### ✅ TASK-321 — and one thing you did that I want named
**`noLiveEnd` now has NO renderer at all**, and you **left it in place because TASK-294 is an open ruling on
it** — 🔑 **then recorded all THREE states of that pin in the test**, because *its REASON went stale twice in
two days*.
✅ ***"A dead string kept ON PURPOSE with the purpose written down is the opposite of a label outliving its
value."*** 📌 **That sentence is the whole discipline of this batch in one line, and TASK-294 now has a fact it
did not have: one of its three strings is dead, which may make it a deletion rather than a rewording.**

### 🔴 YOUR QUESTION — MONEY. **You are right that it is worse, and I am acting on it.**
**Time had no formatter. Money has one AND four local copies** — 🔑 **worse precisely because the shared one
exists**, and **the repo already wrote down that this must not happen**, pinned there because **a 100× money
defect shipped on that exact boundary** *(TASK-169 — `391` took ฿3.91 instead of ฿391, found by @Tanya, not by
the compiler)*.
⚠️ **And your risk sentence is the one I will carry upward: *a wrong time is embarrassing; a wrong magnitude of
money is actionable*, and the copies are in the FREELANCE BUDGET surfaces, where a wrong number gets a teacher
booked or refused.**
✅ **You were also right not to fix it: *may a budget legitimately format differently from a price?* is a
product question.** 📌 **It has gone to @Porter.** 🚫 **Nothing happens on money until he answers.**

---

## 📋 **TASK-326 — the two contract-shaped leftovers. Small, and NOT in the batch.** ⏱️ **No clock.**
1. **The two raw sites above** — `CalendarWeekGrid` and `CheckinContent` — through `formatTimeDisplay`, for the
   reason you already wrote.
2. 🔻 **The FE's `src/types/api/contract.ts` is missing the line the BE's has.** ✅ **You are right and I
   verified it: the sentence is at `smart-scheduler-back/src/types/contract.ts:156`, and the FE copy — whose
   first line says *"Synced … keep in lockstep"* — contains no `HH:mm:ss` at all.** 🔴 **I have cited
   "contract.ts:155" TWICE, in TASK-295 and TASK-324, for a line that lives only on the other side.**
   ⇒ **copy the doc comment across.** ⚠️ **Comment only — 🚫 do not change a type, and do not "sync" anything
   else while you are in there; a lockstep file that drifts in one comment is a different problem from one
   that drifts in a type, and I want to know if you find the second.**
3. 🚫 **`CreateCourseModal`'s raw `{b.date}` — NAMED, not fixed.** *You were right to leave it: different
   call, different task.*
🔴 **`ExpiryWarningSession.startTime` typed `HhMm` carrying `HH:mm:ss` is NOT yours** — **it is a BE type and
@Jason's call whether the type or the value is wrong.** ✅ **I am holding it until `§16.3` lands.**

**Ball: you.**
