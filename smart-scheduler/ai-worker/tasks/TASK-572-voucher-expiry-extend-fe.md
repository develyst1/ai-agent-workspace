# TASK-572 — REQ-110 item 3: the voucher extend control — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-30) · **Size S.** ⏸️ **Queued behind TASK-571.**

## §0 What the server gives you
- **An admin can extend a voucher's expiry**, through the same warn-and-save shape the course expiry edit uses — **one decision serving the preview and the save.**
- **EXPIRED ⇒ extendable** · **ENDED ⇒ 409** (its hours are gone; ⛔ *whether a different "top-up" door should exist is with the owner*) · **NOT STARTED ⇒ 409** — 🔑 *before the first booking the date is a sale-day placeholder, so "extending" it could end the voucher EARLIER.*
- ✅ **The extension now survives a full cancel-and-rebook.** 🔕 **Nobody is notified, deliberately** — the family sees it on their next notice.

## §1 The work
- **The control, with the preview's warning before the save.** 🚫 **Server refusals verbatim** — **all three of them carry a reason an admin can act on; do not replace them with a generic message.**
- ⚠️ **The two 409s are not errors in the admin's sense — they are answers.** 🔑 **Present them as "why not, and what to do instead", not as a failure banner.** 📋 **Wording is a DRAFT into the copy file; 🚫 code not held.**
- 🔕 **Do not imply anyone is told.** *The audience is deliberately none; a screen saying "the family has been notified" would be a lie.*

## §2 The proof
🔑 **Clicked: preview then save, asserting the REQUEST** · **no request before confirm** · **a 409 leaves the voucher untouched and shows the server's words.**

## §3 Not in scope
🚫 Top-up · 🚫 how a voucher's expiry is first set · 🚫 Palm's items.

## Definition of Done
- [ ] Extend with a preview warning · **all three refusals verbatim and presented as answers, not failures** · 🔕 nothing implying a notice · 🔑 clicked, asserting the request, none before confirm · drafts filed early · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report + `inbox/SA.md` + log.
