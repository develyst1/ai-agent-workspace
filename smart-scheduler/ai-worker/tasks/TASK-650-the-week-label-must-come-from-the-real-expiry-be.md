# TASK-650 — BE: **the "ขยายได้ถึงสัปดาห์ที่ N" label must come from the REAL expiry** (QA re-test, item 1) 🔴 **BLOCKS uat**
**From @Sober to @Jason.** 🔑 **@Porter: treat this as a DEFECT, not copy — *a number on screen that disagrees with the system's behaviour is a defect wearing copy's clothes*, and it is on the exact screen Khwan is about to inspect.**

## 1. 🔴 The cause — **the label is the CAPPED rule the owner deleted today**
**The course card prints `course.usage` — *"ใช้ไป {used}/{quota} · ขยายได้ถึงสัปดาห์ที่ {week}"* — with `week: c.maxWeek`.** **`maxWeek` comes from `toCourseSummary` in `lib/leave.ts`: `maxWeekFor(size, quota) = size + quota`.**
⇒ **It is computed from the size and the quota, NEVER from the stored expiry.** **Since `TASK-646`, the expiry STRETCHES per declared day — so a 4-session course with 3 declared days expires in week 8 and the card still says week 5.** ✅ **The DATES are right; the LABEL understates them.**
🔑 **This is `TASK-646`'s cause one level up: the expiry rule changed and a second reader of the OLD rule was left behind.**

## 2. ▶️ The fix — **at the SOURCE, once**
**Derive `maxWeek` from the course's own stored `expiryDate` and `startDate` — the inverse of `courseExpiry`, which is `start + (week − 1) × 7` days.** ⇒ **`week = days(start → expiry) / 7 + 1`** (round UP for an expiry that is not on a week boundary).
🚫 **Not on the card.** **The card is in `partials/Bookings/*` — Team B's — and it must not need to change: it already prints what the server sends.** 🔑 *Fix it on one card and the next screen that shows a week number is wrong again.*
✅ **One consequence that is the SAME line, not new work: an admin-EXTENDED expiry also becomes honest on the card, because the label now reads the expiry instead of re-deriving it.** 📌 **Say in your report whether that was wrong before — I believe it was.**

## 3. ⚠️ What must NOT move
- 🔴 **For a course with nothing declared and no extension, `maxWeek` must equal `size + quota` EXACTLY, at EVERY size** — 4→5 · 6→8 · 10→13 and the off-card sizes. **Pin it by value at each.** 🔑 **That is the owner's rule for an ordinary course, and this change must be invisible to one.**
- **`maxWeekFor` itself stays** — `courseExpiry` still builds the BASE expiry from it at creation. **Only the SUMMARY's label changes source.**
- ⚠️ **The FRONT has a second copy of the old rule in `lib/scheduler/leave.ts` (`MAX_WEEK_BY_SIZE[size]`) — but it is used ONLY by `scheduler.mock.service.ts`, the offline mock.** 🚫 **Not in this task; the owner closed the batch to new work.** 📌 **Recorded so nobody thinks it was missed.**

## 4. ✅ Done means
1. **`tsc` · the no-DB suite with COUNTS · migrations balanced.**
2. **Value tests: an ordinary course at every size ⇒ `size + quota` · a pre-start course with 3 declared days ⇒ +3 · Tanya's own case (the card's week matches the last make-up's week).**
3. **Mutations, filed and named: `maxWeek` back to `size + quota` (must BITE on the stretched case) · the inverse off by one (must BITE on the ordinary case).**
4. 🔴 **A test that crosses the seam the way `TASK-647`'s did: the server's `maxWeek` for Tanya's course, rendered through the card's own string, reads the week the make-ups actually reach.**

## ✅ 2026-10-04 — @Jason: DONE — the label reads the expiry now, and YES it was wrong for admin extensions too
**`tsc` 0 · the DB-unreachable suite 3903 pass · 0 fail · 65 = 65 — no migration.**
**Set: `src/lib/max-week-from-expiry-task650.mutations.json` — 7 / 7 BITE**, baseline 33, CHECKSUM identical. **Test set named in the file.**

### §2 — one line, at the source
```ts
const maxWeek = weekOfExpiry(c.startDate, c.expiryDate, maxWeekFor(c.size, quota));
```
**`weekOfExpiry` is the inverse of `courseExpiry`, stated as such where it lives:** `expiry = start + (week − 1) × 7` ⇒ `week = days / 7 + 1`.
- ⚠️ **Rounded UP**, so an expiry off a week boundary reports the week it falls INSIDE — **the label promises a ceiling, and a ceiling rounded down is a promise the system does not keep.** (`W4` rounds down and bites.)
- 🚫 **It never reports LESS than the course's own base ceiling**, and a missing or unparseable expiry falls back: **a stored expiry behind the base is a data fault, and a label is not the place to surface one.** (`W5`, `W6`.)
- 🚫 **Not on the card.** ✅ **`maxWeekFor` is untouched — `courseExpiry` still builds the BASE expiry from it at creation. Only the READER moved** (`W7` changes the rule itself instead and bites, because it would move the base too).

### §3 — what must not move, pinned by value
- ✅ **4→5 · 6→8 · 10→13**, and **every size the table knows, derived rather than listed** — so a new size cannot be forgotten in this test.
- ✅ **An OFF-CARD size with its own stored quota still answers for itself** (8 with quota 2 ⇒ 10), TASK-213's rule unchanged.
- ✅ **For an ordinary course the card's STRING is byte-identical to what it printed before this change** — *"ใช้ไป 1/2 · ขยายได้ถึงสัปดาห์ที่ 8"*. 🔑 **The change is invisible to a course with nothing declared, which is the whole safety claim.**

### §4.4 — the seam, the way TASK-647's did it
**Tanya's course rendered through the card's own string: `"ใช้ไป 0/1 · ขยายได้ถึงสัปดาห์ที่ 8"`, and the week it prints is at or past the week the last make-up actually reaches.** ✅ **One week per declared day at 1, 2, 5 and 12.**

### 📌 Your question — **was an admin-EXTENDED expiry mislabelled before? YES, and this fixes it on the same line**
**The label never read the expiry at all, so ANY expiry change left the week number at `size + quota` — an admin extension included.** **A 10-session course extended by 4 weeks read "week 13" while it really ran to week 17.** ✅ **Pinned by value.** 🔑 **It is not new work: the same `weekOfExpiry` call answers both, because both are the same bug — a second reader of a rule that had moved.**

### ⚠️ Two of my own things, written down
1. **`leave.test.ts`'s shared fixture carried an arbitrary `expiryDate` 13 weeks after its start.** **It was not WRONG before — it was MEANINGLESS, and a meaningless value in a fixture becomes a wrong one the moment something starts reading it.** ⇒ each case now carries the expiry its own size implies, through the real rule, with the reason written in.
2. **`W7` was MIS-AIMED first:** it edited `MAX_WEEK_BY_SIZE`, which `maxWeekFor` does not read (the map is DERIVED from the quota table, not the other way round) — **so it SURVIVED while claiming to change the rule.** 🔑 ***A mutation aimed at the wrong line survives for a reason that has nothing to do with the tests*** — the second time this week a survivor was my mistake rather than a gap. **Re-cut onto `maxWeekFor` itself; it bites.**
📌 **§3's note recorded and NOT acted on: the front's second copy of the old rule (`lib/scheduler/leave.ts`, used only by the offline mock) is out of scope and I have not touched the front repo.**
