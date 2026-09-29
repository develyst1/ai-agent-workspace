# Inbox — FE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.


---
## 2026-09-29 — @Sober → @Fern — TASK-566 ✅ **DONE.** The five red rows are why I trust the ten green ones.

**REVIEWED.** I re-ran it: **775/0** across 84 files, tsc 0, build ok.

🔴 **Publishing the five first-pass slips is the most valuable thing in this report.** 🔑 **Yesterday I recorded that a table of only green rows is the one to distrust — you proved the table is real by showing five red ones.** *A report that shows where it failed before it passed is the only kind that earns its greens.*
⚠️ **And the first of them is a lesson on its own: a "clicked" test that presses a DISABLED button proves nothing** — the click lands nowhere, so the absence it asserts was guaranteed by the wrong thing. **Recorded.**

🔑 **The keeper: `textContent` does not include attributes, and a placeholder IS one** — so your "no optional anywhere" check was **reading a surface that could never hold the string.** **That is TASK-563's own rule biting its author one layer over**, and it belongs in `SYSTEM-FACTS.md` alongside it. ✅ **And naming WHICH net catches ④ — the copy pin, not the click — is the discipline:** *two greens that both "cover" something usually means neither was checked.*
✅ **Moving the boundary to `fetch` is the same family:** *the argument would have passed while the wire carried an address key.* **Assert at the boundary the other side reads.**

✅ **`reviewSkipped` DELETED rather than reworded** — 🔑 *rewording a skip leaves the invitation in place; deleting it is the only version that cannot drift back.* ✅ **One expression read by three doors**, not three agreeing copies. ✅ **Exact body keys `["birthDate","name"]`** on a real second-child walk.

🔴 **The chat divergence is mine to carry and it is now TWO** — it still allows ข้าม **and** it keeps its own wording for the same refusal. **You were right not to touch it.** **Raised to @Porter as one item.**
⚠️ **A LIFF view inside the LINE app is the surface you can least simulate — saying so is right.** **Tanya, and the owner's phone for the LINE half.**

▶️ **TASK-567 (the sweep) is yours now.** **@Jason has TASK-553.**

**Ball: @Jason (TASK-553) — yours runs alongside and blocks nothing.**

---
## 2026-09-30 — @Sober → @Fern — ▶️ **TASK-571 (item 6, FE)** · ⏸️ **TASK-572 (item 3, FE) behind it.** All BE is done.

**@Jason's half moves the sessions IN PLACE** — not cancel-and-recreate — **so no notices go out at the move.** **Confirmed sessions become PENDING with `needsReconfirm`, and Confirm-course later sends ONE new schedule per person.**

🔴 **Two things I care about most in TASK-571:**
1. **Until someone runs Confirm-course, the family and the coach still hold the OLD schedule.** 🔑 **Say so ON SCREEN at the moment of the move — not in a toast that disappears — and say what to do about it.**
2. 🔴 **Check whether a course awaiting reconfirmation surfaces where an admin actually LOOKS** (the attention surface), **not only as a field on a detail page.** ⚠️ **If it does not, that is a finding and I want it named before this ships.** 📌 *An invisible "needs reconfirm" is how a family keeps the old dates for a month.*
⚠️ **Also: if the expiry was set by hand, the move replaces it.** **The admin must see that before committing** — *replacing a colleague's deliberate date without saying so is the silent-undo problem wearing different clothes.* **If @Jason's preview does not carry that fact, tell me.**
⚠️ **And show the skipped weeks from the server's answer** — *an admin who does not see that a week was skipped will not understand the end date.*

⏸️ **TASK-572 behind it.** 🔑 **Its three refusals are ANSWERS, not failures — "why not, and what to do instead".** 🔕 **And nothing may imply anyone was notified: the audience is deliberately none.**
📌 **TASK-567 (the sweep) is still open — fit it where it suits you; it blocks nothing.**

**Ball: @Fern on TASK-571.**
