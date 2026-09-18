# TASK-340 — four raw dates in `t()` arguments, and one clause at the end of a header

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-11)
⚪ **NO CLOCK. Not in any release.** 🚫 No BE change, no migration.
🔑 **This is the HALF of your `§3` finding that is a DEFECT. The other half is a DECISION and it has gone to
the owner — see `§3`.**

---

## §1 ✅ The four — and the split that makes them a task
**Your scanner found four raw DTO date fields in `t()` arguments:**
| | |
|---|---|
| `CreateVoucherModal.tsx:121` | `date: result.voucher.expiryDate` — **a raw ISO date read by a human** |
| `BookingModal.tsx:118` | `date: createSlot?.date ?? ""` |
| `BookingModal.tsx:336` | `date: res.extended.date` — **the make-up's date, straight off a response** |
| `CancelBookingDialog.tsx:79` | `date: booking?.date ?? "—"` — 🔑 **one line above the raw `time:` in the SAME call** |

🔑 **These are UNFORMATTED, not differently-formatted** ⇒ **a defect, and mine to dispatch.**
📌 **The five LOCAL formatters you found are a different question** — *they format, they just do not share* —
**and that is a product judgement, not a fix.** ⇒ **`§3`.

## §2 What to do
✅ **Route all four through `formatDateDisplay`.** ⚠️ **`:118`'s `createSlot?.date` is component state from a
picker, not a DTO field** — 🔑 **check whether it is already `YYYY-MM-DD` and say so; if it is a slot value
rather than a date a human reads, LEAVE IT and name it**, the way you left `BookingModal:776` out of the time
sweep. 🚫 **Do not assume the four are one class because one scanner found them.**
✅ **Then WIDEN THE SWEEP to dates**, as you said it should be: **the same scanner with `date` keys and
`formatDateDisplay`.** 🔑 **It must FAIL first on one of these four before you fix them** — 📌 *your own rule,
third application, and the reason this is a task rather than a line in the last one.*
⚠️ **Keep the two-directional assertion** — *the fixed sites stay pinned so the scanner cannot silently stop
reaching the code.* 🔑 **That is the assertion you said you would keep if you could keep only one, and it
proved itself immediately.**

## §3 🚫 NOT IN THIS TASK — the five local formatters
**`fmtTime` (`AttentionContent:27`) · `fmtDate` (`ImportBalanceModal:138`, `SomContent:15`) · `fmtDateTime`
(`OverviewContent:58`, `SomContent:16`) — beside `formatDateDisplay`.** ✅ **I verified all five.**
🔴 **You are right that this is MONEY's state, not TIME's** — **one shared helper AND several private ones** —
📌 **and it corrects what I wrote in TASK-324, where I called dates the sibling that already had its function.
They have one and do not use it.**
⛔ **It is with @Porter for the owner, BESIDE the money duplication and the copied note limit**, because
*"may this surface legitimately format differently?"* is one question with one answer and it is his.
🚫 **Do not touch them, and do not route them through `formatDateDisplay` while you are in the neighbourhood.**

## §4 ✅ The header clause — one line, and you were right not to write it
📌 **The substance is already there at `contract.ts:14`** — *"Keeping it in step with the BE is a HUMAN job and
no test enforces it."* ✅ **I checked before agreeing with you.**
🔑 **What your clause adds is POSITION: at the END, where a reader who stops early still meets it.**
✅ **Add it.** 🚫 **Comment only, and it is the only product-code line in this task that is not a formatter
call.**

## §5 What must not change
- 🚫 The five local formatters · `formatDateDisplay`'s own output · `TIME_SLOTS` / `Select` values.
- 🚫 The two KNOWN-OPEN time entries (`BookingModal:1140`, `CancelBookingDialog:80`) — ⚠️ **they belong to
  whoever fixes them and this task is not it.** *(Say if fixing `:79` next to `:80` makes leaving `:80`
  absurd — I would take that argument.)*
- 🚫 No BE change · no migration · no i18n key change.

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean, **say which command**
- [ ] 🔑 **The date sweep FAILS on one of the four before it is fixed** — demonstrated, both directions
- [ ] **All four routed, OR named-and-left with the reason** — ⚠️ *`:118` is the one I expect an argument about*
- [ ] **The header's clause is at the END** — 🚫 comment only
- [ ] 🚫 **The five local formatters untouched** — asserted as an absence, **with `§3`'s reason in the test**
- [ ] 🔑 **Break it and watch** — one call, byte-identity by checksum

## Question
🔑 **Your scanner's second assertion — *the sweep actually reaches the code* — caught the failure mode we
rejected in TASK-326: *a check that passes because it found nothing.***
⇒ ❓ **Do our OTHER negative checks have that property?** 📌 *TASK-327's placeholder probe, TASK-322's wire-name
check, the `no-placeholder-leak` file* — **each asserts an absence, and an absence is what a broken scanner
also reports.**
⚠️ **Name the ones that would pass on an empty input.** 🚫 **Do not fix them** — 🔑 **I want to know how many of
our "nothing is wrong" assertions can tell *nothing is wrong* from *I looked nowhere*.**

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-11. **All four routed, the sweep widened, and I took your `§5` invitation on `:80`.**

```
bunx tsc --noEmit → exit 0
bun test          →  245 pass / 0 fail   (+3)
bun run build     → ok
git status        →  3 components + contract.ts (the clause) + 1 test file
```
🚫 No BE change · no migration · no i18n key change.

### 🔑 The demonstration is the sweep failing on the REAL four, before any fix
**I added the date sweep FIRST and ran it against the unfixed tree** — so the proof is not a mutation, it is
the defect itself:
```
(fail) TASK-340 — a `t()` argument carrying an unformatted DTO date > finds none — all four are routed
  Received: [ CreateVoucherModal … , BookingModal:118 , BookingModal:336 , CancelBookingDialog:79 ]
```
📌 *(I first misread bun's `+ Received + 6` as six sites — it counts DIFF LINES, and a 4-element array renders
as six. Checked against the scanner rather than reported.)*
✅ **And afterwards, break-and-watch in one call:** re-introduced `date: result.voucher.expiryDate` ⇒ the sweep
named it; restored; **`md5sum` before == after (`ea233970…`)**; suite green.

### §2 ✅ The four — and `:118` is the one you expected an argument about
| | verdict |
|---|---|
| `CreateVoucherModal` | **formatted** — a raw ISO expiry in the line staff read after issuing a voucher |
| `BookingModal:118` | ⚠️ **formatted, and here is the check you asked for:** it is `createSlot.date`, **component state — but it is READ, not keyed on**: it is the create dialog's **TITLE**. `CalendarContent` sets it from `b.date` and the grid from its own day key, **both ISO**. ⇒ a date a human reads. 📌 `formatDateDisplay(undefined)` is `""`, exactly what `?? ""` did, so the absent case is unchanged. **This is the opposite call to `BookingModal:776`, which I left: that one is a `Select`'s VALUE.** |
| `BookingModal:336` | **formatted** — the make-up's date, straight off the response into a toast |
| `CancelBookingDialog:79` | **formatted** — ⚠️ **and the em dash could not go through the formatter.** `formatDateDisplay` returns `""` only for a FALSY input; `"—"` is truthy, so `formatDateDisplay(booking?.date ?? "—")` hands `dayjs` an em dash and renders **`Invalid Date`** — worse than the string being fixed. ⇒ the no-booking case is branched BEFORE the call. |

### 🔴 §5's invitation — **I fixed `:80` too, and leaving it would have been the defect, freshly authored**
`date:` and `time:` are **the same `t("cancelBooking.line", …)` call, one line apart.** Formatting the date and
leaving the time raw recreates **exactly** the adjacent-lines defect TASK-329 §3 found in `pausedOriginalSlot`
— one formatted field beside one raw field in a single sentence. 🔑 **That is not "out of scope"; it is
authoring the thing we have spent three tasks removing.**
✅ **So its KNOWN-OPEN entry is DELETED, not moved** — an allow-list entry outliving its defect is the same
class as a comment outliving its mechanism. **`BookingModal:1140` stays known-open: a different call, a
different component, and genuinely not this task.**

### 🔻 I broke my own check, and the fix is a better check
**TASK-339 pinned `file:line`. The comments these fixes carry moved every pinned line and THREE assertions went
red for no reason but their own brittleness.** ⇒ identity is now **FILE + EXPRESSION**; the line survives only
in `where`, for a human to look up. 🔑 **A pin a comment can break teaches the next person to delete it.**
📌 **And the two-directional guard earned itself again:** the "formatted sites" pin went red because
`CancelBookingDialog` had **become** a formatted site — *a formatted site appearing is as much a change to the
sweep's world as a raw one*, and I would not have noticed otherwise.

### §3 🚫 The five local formatters — untouched, and asserted so with your reason in the test
`fmtTime` · `fmtDate` ×2 · `fmtDateTime` ×2 are asserted **present**, with the note that they FORMAT and merely
do not SHARE, that this is money's state, and that whether a surface may legitimately format differently is
with @Porter. 🚫 **Routing them here would have decided that question by accident.**

### §4 ✅ The clause is at the END
`contract.ts` now closes with *"⚠️ **Nothing enforces this — keeping it in step with the BE is a human job.**"*
📌 The substance was already at `:14`; **what this adds is position** — a reader who stops early still meets it,
which is precisely what *"synced … keep in lockstep"* prevented, twice.

### Definition of Done
- [x] `bun test` **245 / 0** · `bunx tsc --noEmit` exit 0 · build ok
- [x] 🔑 **The date sweep FAILED on the four before the fix** — demonstrated on the real tree, then again by
      mutation with byte-identity
- [x] All four routed, **with `:118` argued rather than assumed**
- [x] The header's clause is at the END — comment only
- [x] 🚫 The five local formatters untouched — asserted, **with §3's reason in the test**
- [x] 🔑 Break-and-watch — one call, checksum

## Question — **which of our negative checks pass on an empty input?**

🔴 **Four assertions, in three files, and two of them are mine.** ⚠️ **And the sharpest part is WHY the third
counts.**

| | region | asserted | |
|---|---|---|---|
| `expiry-warning.test.ts:52` | `call = dialog.slice(indexOf("resume.mutateAsync"), indexOf("notify({ title…"))` | **negatives only** (`not.toContain("weekday")`) | 🔴 if either anchor moves, the slice is empty and it passes |
| `expiry-warning.test.ts:73-74` | `panel = src.slice(indexOf("result ? ("), indexOf("TASK-287 §1"))` | **negatives only** (`.add(`, `dayjs(`) | 🔴 **and its end anchor is a COMMENT** — a task reference that a tidy-up would delete |
| `dialog-labels.test.ts:127` | `header = modal.slice(…)` | `not.toContain("noLiveEnd")` | 🔴 **mine.** ⚠️ **The `it` HAS three positives — but they are on `modal`, the whole file, not on `header`.** |
| `dialog-labels.test.ts:144-146` | same `header` | three negatives | 🔴 mine |

🔑 **So the rule is not "a negative needs a positive somewhere in the test". It is: *the guard must be over the
SAME REGION as the negative.*** `dialog-labels:127` looks guarded and is not — three green positives sit beside
it proving something about a different string.
⚠️ **And `panel`'s end anchor being a comment is its own hazard:** the check depends on prose surviving, which
is the class this week has been about, pointed the other way.

✅ **The ones that are guarded, so the pattern is visible:** `pause-booking` ×2 (`toContain("/pause\`")`,
`toContain("calendar.pauseTitle")`) · `expiry-warning`'s `payload` (`toContain("startDate")`) · `create-note`
×3 · `expiry-preview` ×4 · `plan-rows` · `time-format` · `resume-defaults` ×2 · `wire-names`
(`length > 0`) · `t-arg-shape` (pins the formatted set — the strongest form, since it fails when the world
changes in EITHER direction).
🚫 **Named, none fixed.**
📌 **The cheap general form, if you want it later:** *every slice-derived region gets one positive over that
same region before any negative.* **It is a review rule, not a mechanism — a test cannot see which positive
belongs to which slice.**
