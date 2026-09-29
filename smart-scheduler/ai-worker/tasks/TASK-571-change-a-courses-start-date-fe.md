# TASK-571 — REQ-110 item 6: the start-date button — FE, M

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-30) · **Size M.** The screen half of the round's last item. **@Jason's TASK-570 has landed.**

## §0 ⚠️ First
**Re-read the front repo and say so.** 🚫 **Items 4, 9 and 11 are Palm's.**

## §1 What the server gives you
- **A not-yet-started course's start date can be moved.** **"Not started" = nothing imported as taught AND every non-cancelled session today or later** — *a cancelled first session is still movable.*
- **The sessions are MOVED in place** (not cancelled and re-created) · **a clash refuses the WHOLE move** · **a teacher's blocked week is SKIPPED and returned to you.**
- 🔑 **ZERO notices go out at the move.** **Confirmed sessions become PENDING with `needsReconfirm`, and the existing Confirm-course flow later sends ONE new schedule per person.**
- **The expiry is recomputed and recorded with the ADMIN as actor.**

## §2 The work
- **The button, and a preview before it commits.** ⚠️ **The preview must show the skipped weeks the server returned** — 🔑 *an admin who does not see that a week was skipped will not understand the end date.*
- 🔴 **Until someone runs Confirm-course, the family and the coach still hold the OLD schedule.** ⇒ 🔑 **Say so, on the screen, at the moment of the move** — *not in a toast that disappears.* **And say what to do about it.**
- 🔴 **A course awaiting reconfirmation must be VISIBLE where an admin looks** — **the attention surface, not only a field on a detail page.** ⚠️ **Check whether it already surfaces there. If it does not, say so — that is a finding, and I want it named before this ships.** 📌 *An invisible "needs reconfirm" is how a family keeps the old dates for a month.*
- ⚠️ **If the course's expiry was set BY HAND, the move replaces it.** 🔑 **The admin must see that before they commit** — **ask @Jason's preview for it if the fact is not already there, and tell me.** *Replacing a colleague's deliberate date without saying so is the silent-undo problem wearing different clothes.*
- 📋 **All new wording is a DRAFT into `COPY-REVIEW-2026-09-29.md`, both languages, pinned by shape. 🚫 Code not held.** 🚫 **Server refusals verbatim.**

## §3 The proof
🔑 **Clicked: the preview shown, the move sent once, and the skipped weeks rendered from the server's answer** — not from anything the page computed. ✅ **Assert the REQUEST**, and 🚫 **no request at all until the admin confirms.**
⚠️ **A refusal (a clash, a started course) leaves the course untouched and shows the server's words.**

## §4 Not in scope
🚫 Confirm-course itself · 🚫 the money · 🚫 Palm's items.

## Definition of Done
- [ ] Preview then commit, **skipped weeks shown from the server's answer** · 🔴 **the stale-schedule window stated on screen, with what to do** · 🔴 **reconfirm visibility checked and NAMED if missing** · the hand-set-expiry warning present (or the gap reported) · refusals verbatim, course untouched · 🔑 **clicked, asserting the request, no request before confirm** · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report + `inbox/SA.md` + log.
