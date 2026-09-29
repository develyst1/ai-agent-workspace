# TASK-573 — item 6's three backend gaps — BE, S/M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · **Size S/M.** 🔴 **REQ-110 item 6 does not ship without §1.** All three are @Fern's findings from TASK-571, none guessed.

## §1 🔴 A moved course is INVISIBLE until the day before — **this blocks the item**
**`GET /attention` has 11 checks, and the only PENDING one fires ONLY for today or tomorrow** ⇒ **a course moved three weeks out shows nowhere until the day before its first session.**
🔑 **I wrote "an invisible needs-reconfirm is how a family keeps the old dates for a month" as a warning; it is the current behaviour.** ⇒ **Item 6's own safety net is a field nobody reads.**
- **A 12th check, or widen that window — your call, justified in one line.** ⚠️ **If widening the existing one changes what admins see for OTHER reasons, that is a side effect: say so, and prefer the 12th.**
- 🔑 **The check must fire from the moment of the move, not from a date near the first session.** *The window we are covering is exactly "an admin moved it and has not pressed Confirm yet".*
- ⚠️ **Say what CLEARS it** — pressing Confirm, and what else. 🚫 **If nothing clears it, it becomes noise and admins will learn to ignore the panel.**

## §2 A read-only preview route — **the shape already exists**
**`skippedForLeave` exists only in the committing answer**, and ✅ **@Fern REFUSED to predict the plan on the page:** 🔑 *"a second copy of `planCourseStartChange` would be the two-copies defect on the rule that decides dates AND the expiry."* **She is right.**
- **Add the read-only route over the EXISTING pure planner** — 🔑 **exactly TASK-546's `undo-preview`: the act's own planner, run without writes.** 🚫 **No second planner, no prediction.**
- ✅ **Carry the same three conditions as `undo-preview`:** **byte-identical extraction (or STOP)** · **pinned to write nothing** · **the same gate as the act, derived from it.**
- ⚠️ **And the same honesty: a preview is a forecast.** **Say whether anything can change between preview and commit**, and if so, the FE must be able to say so.

## §3 `CourseSummary.startDate` — **the contract question I predicted, arriving on cue**
**`CoursePackageView` has no `startDate` because TASK-545 removed the INVENTED one** ⇒ **the compile error arrived exactly as designed.**
🔑 **TASK-545's ruling was "fix the type, not the contract — a real reader will arrive as a compile error, not as Sunday 09:00 on the owner's screen." It did.** ⇒ **Now it IS the contract question, and the answer is a real field.**
- **Add `startDate` to `CourseSummary`** — **this endpoint already writes that column.**
- ⚠️ **Apply the TASK-542 discipline as answers, not expectations:** **public allow-lists confirmed BY VALUE AND BY SOURCE**, **what a scoped teacher sees**, **the key-set count pinned.**
- 🚫 **One field. Do not take the opportunity to add others.**

## §4 Not in scope
🚫 Changing the move itself · 🚫 the FE · 🚫 Palm's items.

## Definition of Done
- [ ] §1 the check fires **from the moment of the move**, what clears it **stated**, side effects named · §2 the preview over the **existing** planner, **three `undo-preview` conditions met**, forecast honesty stated · §3 `startDate` added, **public confirmed by value AND source, scoped answer stated, key set pinned** · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · migration reported if any · 🔑 mutations incl. **the check not firing on a fresh move**, **the preview writing**, **the field leaking to a public answer** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-30): all three gaps closed · **migration `0064_course_reconfirm_needed` (uat 64 ⇒ 65)** · **3634 / 0 normally, and 3× DB-unreachable, 0 failed queries** · tsc 0 · **65 = 65** · nine mutations bite

## §1 🔴 The moved course is visible FROM THE MOMENT OF THE MOVE: a 12th check, not a wider window
- **Why a 12th, in one line:** widening `unconfirmed_bookings`'s today/tomorrow window would put **every** unconfirmed session of the coming weeks on the panel. That's a different question and it would be noise, so that card is untouched.
- **The fact is WRITTEN, not inferred:** `course_packages.reconfirm_needed_since` (`0064`, one nullable column, no backfill). **The move writes it only when it un-confirmed something** (`needsReconfirm`); a never-confirmed course doesn't get it.
  - *Why a column:* "has PENDING sessions" alone can't tell a moved course from a never-confirmed one (every new course), and that would be noise (a mutation ignoring the mark bites).
- **The card** (`courses_awaiting_reconfirm`) shows while **the mark is set AND sessions are still PENDING AND the course is live**. There's **no date window**: pinned on a course moved three weeks out (a mutation adding a window bites).
- **What CLEARS it:**
  1. **Confirm-course**: it clears the mark when nothing is left pending. **A session the confirm SKIPPED** (a budget refusal) is still pending, **so the card stays** and keeps asking.
  2. **Confirming each session one by one**: the pending count reaches 0, so the card goes silent by itself.
  3. **The course ended or paused.**
  - A mutation that never clears (noise) bites, and so does one where confirm doesn't clear.
- **Label:** `<new start> · <child nickname> · <pending count>`.
  - 🔐 **The LINE digest carries the COUNT only**: `namesPeopleInDigest` stays off, because which checks may name people there is the owner-approved list (REQ-020). The panel names the course.
  - 📋 **The heading is a DRAFT: COPY-REVIEW §10.**
- **Side effects on other cards: none.** The existing pins moved only for the addition (12 checks; the heading list appended, as TASK-453 did; the named-in-digest list unchanged).

## §2 The preview: the act's OWN plan, without writes (TASK-546's three conditions)
- **`POST /courses/:id/start-date/preview { startDate }`** → moves (from → to, status → toStatus), the new expiry, `needsReconfirm`, `skippedForLeave`, **`forecast: true`**.
  1. **Extraction, verbatim:** the act's reads and refusals are LIFTED into `planStartChange`; the act calls it and then writes, and the preview calls it and returns. **No second planner** (a mutation giving the preview its own plan call bites).
  2. **Writes nothing:** pinned by source, **and driven by value through a READ-ONLY exec** (it has only `query`; any write would throw). The preview-writing mutation bites.
  3. **The same gate:** its access entry **equals the act's** (pinned equal), and the same refusals (a started course refuses the preview too; pinned).
- ⚠️ **Forecast honesty: yes, the act can differ.** The preview doesn't check:
  - a clash with ANOTHER booking (`SLOT_TAKEN`);
  - each date's teacher gate (archived / weekday off / freelance).
  - Both are checked only as the act moves each session.
  - And time can change the answer: a session delivered, a leave recorded, the day turning.
  - ⇒ **`forecast: true` is on the answer**, so the FE can say so.

## §3 `CourseSummary.startDate`: ONE field, the real column
- Added in the one builder (`toCourseSummary`), typed `string` (the column is NOT NULL). `CourseLike` requires it, **so every construction must supply it: the compile error is the guard.** Only test fixtures needed it (5 sites).
- 🔒 **Public, BY VALUE:** the check-in answer is still the six-field allow-list, so **no course and no `startDate`**, even when the admin DTO carries it (a mutation leaking it bites).
- 🔒 **Public, BY SOURCE:** every check-in answer goes out through that allow-list; **the parent's LINE course view uses the summary only to FILTER and builds its own fields** (it never spreads it). Pinned.
- 📌 **The scoped teacher:** they read the same booking DTO for their own rows, so **they see their course's `startDate`**. That's harmless: the dates of the sessions they teach are already theirs. Stated and pinned.
- **Key set pinned: 15 + `startDate` = 16.** A second field slipping in bites.

## §4 Checks
- Suite: **3634 / 0** (3624 + 10 new in `src/lib/item6-backend-gaps-task573.test.ts`). **DB-unreachable 3×: 3634 / 0, 0 "Failed query".** tsc 0. **65 .sql = 65 tags.** Witness = the column.
- **Existing pins updated, each for exactly this:**
  - 61 count pins 64 → 65;
  - attention checks 11 → 12, twice;
  - the heading list appended;
  - the start-date route pair classified "guarded";
  - my own TASK-570 slice widened to include the lifted `planStartChange`;
  - 5 course fixtures given a `startDate`.
- **Break-and-watch** (BASELINE 10, CHECKSUM identical, every restore byte-identical):
  - **C1, the check NOT FIRING on a fresh move:** **BITES**.
  - **C2, a date window:** BITES.
  - **C3, never clears:** BITES (2).
  - **C4, confirm doesn't clear:** BITES.
  - **C5, every unconfirmed course shown:** BITES.
  - **P1, the PREVIEW WRITING:** **BITES**.
  - **P2, the preview's own plan:** BITES.
  - **F1, the field LEAKING to a PUBLIC answer:** **BITES**.
  - **F2, a second field added:** BITES.
- My preview tests first read the real clock; they're now pinned to a Bangkok "today", so they won't expire.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · **item 6 is unblocked**
Verified by me: **3634 / 0** (and 3× unreachable) · tsc 0 · **65 .sql = 65 journal tags** (counted myself). ⚠️ **uat range 64 ⇒ 65, reported to @Porter.**

## ✅ §1 — and the careful detail is the one that makes it trustworthy
**`reconfirm_needed_since` is written ONLY when the move actually un-confirmed something**, and the card shows **from that moment** while sessions are pending.
🔑 **"Clears: Confirm-course when nothing is left pending — A SKIPPED SESSION KEEPS IT."** ⇒ **That is the case that would have quietly emptied the panel while a family still held old dates.** ✅ **Plus one-by-one confirming, and ended / paused.**
🔑 **I asked "what clears it, because nothing clearing it makes it noise" — he answered with the case where something ALMOST clears it and must not.** ✅ **And the digest shows a COUNT only, leaving REQ-020's named list alone** — *a new signal that does not rewrite an existing one.*

## ✅ §2 — the `undo-preview` shape, reused rather than re-derived
**The act's OWN plan lifted VERBATIM into `planStartChange`, called by both** · **writes nothing (pinned, AND driven through a read-only exec)** · **the same gate, pinned EQUAL** · **the same refusals.**
🔑 **"Pinned equal" is stronger than "the same": it fails if the two ever diverge, rather than asserting that they match today.**
✅ ⚠️ **And the honesty is carried: `forecast: true`, because the act still checks other-booking clashes and each date's teacher gate.** 📌 **The same discipline as TASK-546 — a preview says what WOULD happen, and the answer says so in a field the screen can read.**

## ✅ §3 — one field, and the guard is the compiler
**`CourseSummary.startDate`, REQUIRED in `CourseLike`, so the compile error is the guard.** 🔑 *The mechanism that caught the missing field is the mechanism that keeps it present.*
✅ **Public check-in allow-list unchanged, BY VALUE AND BY SOURCE; the chat builds its own fields; the scoped teacher sees it on their own rows (stated, harmless); key set pinned at 16.** ⇒ **TASK-542's discipline applied as answers without being restated.**
▶️ **Item 6 is unblocked. The screen can now use the preview, the real start date, and the reconfirm signal.**
