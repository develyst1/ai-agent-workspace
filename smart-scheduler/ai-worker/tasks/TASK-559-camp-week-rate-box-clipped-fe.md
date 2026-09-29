# TASK-559 — REQ-110 item 7: the camp week editor's rate box is clipped — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-29) · **Size S.** ⏸️ **Queued behind TASK-558** (order 1 → 12 → 7 → 8). Khwan, on **uat, desktop**; screenshot `project-docs/customer-2026-09-29-feedback/item7-camp-week-rate-cut-off.webp`.

## §0 ⚠️ Re-read the front repo first
**Palm commits through the owner's git.** **Say that you re-read it.** 🚫 **Items 4, 9 and 11 are his — do not touch them.**

## §1 What is actually wrong
**`Camp/OpenWeekDialog.tsx` puts a SIX-COLUMN Mantine `Table` inside a `Modal`, and the rate is the LAST column.** ⇒ 🔑 **When the table is wider than the dialog, the thing that falls off the right edge is exactly the rate.** **Nothing is logically broken: the dialog is too narrow for its own table.**
**The ask, literally: the rate must be VISIBLE AND EDITABLE without sideways scrolling.** 🚫 **Nothing else about the dialog changes.**
- **Your call how** — a wider modal, a column that cannot be squeezed, a different arrangement of the row. ⚠️ **Say which and why in one line.**
- 🔑 **Whatever you choose must hold at more than one width.** *A fix tuned to one screen is a fix that moves the problem to another one.* **Name the widths you checked.**
- ⚠️ **The rate column is conditional (`showRates`).** **Check both states** — *the layout that works with it may be the one that looked fine without it.*

## §2 The proof, and its honest limit
✅ **A click test that the rate input is reachable and accepts a value** — **a control is proven by using it.**
⚠️ **But the pixels are NOT provable here**, and I will not pretend otherwise: 🔑 **only Tanya can confirm it, on a desktop at Khwan's width — 1920px — with the dialog open.** **Say plainly in your report what you proved and what you did not**, so @Porter can hand her the right thing to look at.

## §3 Not in scope
🚫 No change to camp logic, rates or permissions · 🚫 no redesign of the dialog · 🚫 Palm's items.

## Definition of Done
- [ ] The rate visible and editable with **no sideways scroll** · the approach named in one line · 🔑 **more than one width checked, and the widths NAMED** · **both `showRates` states** · click test that the input takes a value · ⚠️ **what was NOT proven stated plainly, for Tanya at 1920px** · front repo re-read and said so · suite **count** · tsc · build ok · Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-29): the camp rate box is no longer clipped · **738 / 0** (was 729 · +9) · tsc 0 · build ok · **6 mutations bite** · ⚠️ **the pixels are Tanya's, and I say exactly which half I proved**

## §0 ✅ The front repo, re-read — and said
`git log`: newest commits are the owner's (`dev`) carrying my work; **the newest outside-chain commit is still `c8e9639` (`neeeeroooo`, 09-22)**. Working tree: **only my own files** from TASK-555/557. Suite **729/0 across 78 files** at the start — what I left. 🚫 **REQ-110 items 4, 9 and 11: not opened, not built, not tested.**

## §1 The approach, in one line
**The dialog is widened only when the rate column is actually there, to a viewport-capped width** — `min(92rem, 94vw)` — **and the rate column is made unsqueezable** (`whitespace-nowrap` on its header and cell).
🔑 **Why that pair:** the width puts the sixth column on screen; the nowrap stops the fix turning into the other half of the same defect — *a rate box that is visible and too narrow to use is not better than one off the edge.*
🚫 **The five-column dialog is untouched** (`lg`): widening a dialog that was not broken is its own defect, and mutation **N2** does exactly that and bites.

## §2 🔑 More than one width — named, and checked as arithmetic
`min(92rem, 94vw)` evaluated at every width I checked, all pinned:
| viewport | dialog | note |
|---|---|---|
| **1920** (Khwan's) | **1472px** | the cap does not bind — she gets the full width |
| 1600 | 1504 → **1472px** | capped |
| 1440 | **1353.6px** | the viewport binds |
| 1366 | **1284px** | " |
| 1280 (13" laptop) | **1203.2px** | " |
| 1024 | **962.6px** | still far above the `lg` (620px) that clipped the rate |
🔑 **At every one of them the dialog is narrower than the screen** ⇒ **the fix cannot move the problem to a narrower one**, which is the failure mode §1 warned about. **N3** (cap dropped) and **N4** (cap made too tight) both bite.
✅ **Both `showRates` states checked**, by value and by clicking: rates shown ⇒ wide; **rates masked (`teacherRates: null`, no key) ⇒ the old narrow `lg` and no rate box at all.**

## §3 ✅ Proven — and 🔴 NOT proven, plainly
**Proven here** (`open-week-dialog.dom.test.tsx`, the real dialog):
- the rate box **exists for the coach on the day and is prefilled from the server** (50000 satang ⇒ *500*, never blank);
- 🔑 **it TAKES a value and the value LANDS**: typing 650 and pressing **Save** sends the per-day PATCH `{ teachers: [{ teacherId: "t1", rateMinor: 65000 }] }`;
- the **width rule reaches the rendered document** in the rates case, and **is absent** in the masked case.

🔴 **NOT proven, and it cannot be from here: the pixels.** happy-dom has no layout engine — **nothing in this repo can answer "is 1472px wide enough for six columns at 1920"**. ⇒ **@Tanya, on a desktop at 1920, with the week editor open and the rate column showing: is the rate box fully visible and editable with no sideways scroll?** 📌 That is the one question this task cannot close, and it is the question Khwan actually asked.

## §4 📌 A harness fact I had to find the hard way
**`user.type` does NOT drive Mantine's `NumberInput` under happy-dom** (it is a masked input). 🔴 **I noticed because a mutation that emptied the handler — `onChange={() => {}}` — still passed a typing test**: the input kept showing what I typed while nothing was stored. ⇒ the test now uses `fireEvent.change` **and asserts the SAVE**, so it proves the value is committed rather than displayed. 🔑 *A box that shows what you typed and forgets it is the same class of lie as a clipped one*, and **N6 now bites in the click as well as the source.**

## §5 ⚠️ Declared: one existing pin updated
`camp-rate-credit.test.ts` (TASK-444) pinned the rate header cell **including its exact JSX**, so adding `className="whitespace-nowrap"` failed it. **What that pin protects — the column exists only when `showRates` — is unchanged and still pinned**; I updated the literal and **added the class to the assertion**, so the squeeze fix cannot be undone silently either. **N5** proves both halves still bite.

## §6 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
```
BASELINE= camp-dialog-width.ts   1b3f40464f286627a50756c98ec2fdc4
          OpenWeekDialog.tsx     9c728c6abcfe6c299f520eaf3f22643e
```
| # | mutation | caught |
|---|---|---|
| N1 | back to `lg` with the rate column (**Khwan's bug un-fixed**) | ✅ source + the click |
| N2 | the width stops depending on `showRates` (the narrow dialog widened too) | ✅ rules + the masked-case click |
| N3 | the **viewport cap dropped** (a fixed 92rem overflowing a laptop) | ✅ the widths test + the click |
| N4 | the cap kept but **too tight** (back under the old `lg`) | ✅ the widths test + the click |
| N5 | the rate column **squeezable** again | ✅ my pin + TASK-444's |
| N6 | the rate box **stops taking a value** | ✅ source **and the click** (after §4) |

All six bite; none slipped; **CHECKSUM: both files back to baseline.**

## §7 Verification
**738 pass / 0 fail across 80 files in 7.3 s** (was 729/78 ⇒ **+9 tests, +2 files**) · **tsc 0** · **`bun run build` ok** · 🚫 no camp logic, rates or permissions touched · no redesign · no BE change · no deploy request · 🚫 Palm's items untouched.
📌 **For @Porter to hand Tanya:** the week editor on a **1920** desktop, an **existing** week, with the **rate column showing** (key 59 and unmasked rates) — *is the rate visible and editable without scrolling sideways?* And the same dialog **without** rates, to confirm it still looks as it did.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-29)
Verified by me: **738 pass / 0 fail** across 80 files · tsc 0 · build ok.

## ✅ The fix answers §1 exactly, including the half I was most worried about
**Widen ONLY when the rate column is shown, to a viewport-capped `min(92rem, 94vw)`, and make that column unsqueezable.**
🔑 **"A visible-but-too-narrow box is the other half of the same defect"** — *correct: pulling the column into view and leaving it two characters wide would have satisfied the ticket and not the customer.*
✅ **The five-column dialog keeps `lg`, and a mutation widening it BITES** — **the fix is confined to the case that has the problem.**
🔑 **And the widths are not a list, they are an argument:** 1920 ⇒ 1472 · 1600 · 1440 ⇒ 1353.6 · 1366 · 1280 ⇒ 1203.2 · 1024 ⇒ 962.6 — **narrower than the screen at every one** ⇒ **the fix cannot move the problem to a narrower screen.** *That is what I asked for and it is better than naming the widths.*

## ✅ What was proven, and the line she drew
**The box exists, is prefilled, and THE VALUE LANDS** — 650 + Save ⇒ `rateMinor: 65000` in the per-day PATCH.
🔴 **NOT proven, and she says so plainly: the PIXELS.** ⇒ **@Porter hands Tanya exactly this: a desktop at 1920, an EXISTING week, the rate column showing (key 59 + unmasked) — is the rate visible and editable with NO sideways scroll? And the same dialog WITHOUT rates, to confirm it still looks as it did.**
✅ **"happy-dom has no layout engine; nothing here can answer it"** — 🔑 *naming what the harness CANNOT do is worth more than another green test.*

## 🔴 The harness finding — this one goes beyond the task
**`user.type` does NOT drive Mantine's `NumberInput` under happy-dom.** **She found it because a mutation emptying the handler STILL PASSED a typing test** — **the input showed what she typed while nothing was stored.**
🔑 **"A box that shows what you typed and forgets it is the same class of lie as a clipped one."** ⇒ **The test now uses `fireEvent.change` AND asserts the SAVE.**
⚠️ **The consequence is bigger than this file: any existing DOM test that TYPES into an input and asserts only what is on screen may be green for the same wrong reason.** ⇒ **I am riding a one-line sweep on her next FE task — not a new task, and not this one's job.** 📌 **Recorded in `SYSTEM-FACTS.md`.**
✅ **TASK-444's rate-header pin updated and declared** — it froze the exact JSX; its meaning is kept **and the nowrap class is now asserted too.**
