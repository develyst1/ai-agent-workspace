
---

# ✅ REPORT — @Fern (2026-09-29): the FE half of item 5 — this session, or the rest · **759 / 0** (was 738 · +21) · tsc 0 · build ok · **9 mutations bite** · 🔴 **the Move-session appearance found and named**

## §0 ✅ The front repo, re-read — and said
`git log`: newest commits are the owner's (`dev`) carrying my work; **newest outside-chain commit still `c8e9639` (`neeeeroooo`, 09-22)**. Working tree: only my own files. Suite **738/0 across 80 files** at the start — what I left at TASK-559. 🚫 **Items 4, 9 and 11 (Palm's): not opened, not built, not tested.**

## §1 🔴 The Move-session appearance — found, and it was NOT the move door
**`PATCH /bookings/:id` carries only the fields that changed, for that one booking id.** No series route is reachable from that handler, and there is **no server act that moves “the rest”**. **Pinned**, including by absence (`fromDate`/`onDate`/`other-series`/`group-series` all absent from the move block).

🔑 **It was the TEACHER doors.** Their only scope control was a date box labelled — verbatim —
> **“From date” · “Today by default — earlier rows are history and stay as they are.”**

⇒ **an admin changing a teacher for one session got `fromDate` = today, which the server correctly applied to EVERY remaining row, and the screen never asked.** 📌 **Khwan's “it changed the whole course” was accurate, and it was this.** Worse, the helper that built those bodies (`withFromDate`) **omitted `fromDate` entirely when it equalled today** — i.e. it produced exactly the *neither-scope* body the backend now refuses, so this was also the deploy break.

## §2 The doors now ask — and nothing is assumed
- **Swap** and **Add teacher**: an explicit two-option choice, **`null` until a person picks**. 🚫 **No pre-selected “all”** — *a default of “the rest” would reproduce the complaint with one extra click, and a default of “this session” would just be a different guess.*
- **Two guards, deliberately:** Save is disabled without a scope **and** `submit` refuses to send one — because the first is a UI state and the second is the thing that actually protects the request (**P5** and **P6** bite separately).
- **Exactly one scope key rides** (`onDate` **or** `fromDate`), from one pure rule. **P3** (says one, sends the other) and **P4** (both keys, provoking the server's 400) both bite.
- **The date box's label follows the scope** — *“The session on”* vs *“From date”* — because the date means a different thing in each (**P9** bites).
- 🚫 **No rate on a swap.** The server allows a cover's rate only with `onDate`; this door has no rate box, and the pin asserts `rateMinor` can never ride on a swap — *a field that could contradict the scope is worse than none.*
- **Move session:** ⚖️ **a STATEMENT, not a question** — *“This moves this session only — the rest of the course stays as it is.”* 🔑 **A choice with one possible answer is noise; the doubt was real but the door was innocent, and Khwan met that doubt on this screen.** If you would rather it asked anyway, it is one line — but the server has no second answer to give.

## §3 📋 Cover vs join — the words, and the pay
**Only on the one-session scope**, because only there do they differ from what the existing wording already says:
- **swap + this session** ⇒ *“{to} covers for {from} on that day. {from} is not teaching it, and {to} is paid for it.”*
- **add + this session** ⇒ *“{name} joins that session as a second coach. Both coaches are paid for it.”*
🔑 **The pay difference is IN the words**, and pinned as such (`not teaching` + `paid` on the cover; `both` on the join; the Thai equivalents). 📝 **All seven new strings are DRAFTS (Fern, TASK-564), both languages, pinned by shape** — 🚫 **and the code was not held for them.** ⇒ **for `COPY-REVIEW-2026-09-29.md`.**

## §4 🔑 Clicked, per door, asserting the REQUEST
`series-scope.dom.test.tsx` (6 tests) — the real dialog, the real query client, a faked fetch boundary:
| door + choice | asserted body |
|---|---|
| **nothing chosen** | **no request at all**, Save disabled, neither radio checked |
| swap + this session | `PATCH /other-series/k-1/teacher` · keys exactly `["from","onDate","to"]` · no `rateMinor` |
| swap + the rest | keys exactly `["from","fromDate","to"]` |
| add + this session | `POST /other-series/k-1/teachers` · keys exactly `["onDate","teacherId"]` · the screen says **join** |
| add + the rest | keys exactly `["fromDate","teacherId"]` · **no** one-session outcome line |
| swap + this session | the cover line names **both** coaches and says **not teaching** |
🔑 **`Object.keys(body).sort()` on purpose:** a `toEqual` treats an `undefined` value as an absent key, so a body carrying BOTH scopes would have passed — the very shape the server refuses.

## §5 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
```
BASELINE= series-scope.ts          b8bfda1eb2d8046428c2d3874254dbd6
          OtherSeriesDialogs.tsx   8ea553ef0ccb118fd4ddb734466e09c7
```
| # | mutation | caught |
|---|---|---|
| P1 | 🔴 **a default of “the rest”** (the complaint with one extra click) | ✅ source + the click |
| P2 | no scope silently becomes the whole series | ✅ rule + click |
| P3 | “this session” sends `fromDate` anyway | ✅ rule + 2 clicks |
| P4 | **both scope keys ride** (the server's 400 provoked) | ✅ rule + 2 clicks |
| P5 | Save opens without a scope | ✅ source + click |
| P6 | `submit` stops refusing a scope-less body | ✅ source |
| P7 | a **cover** described as a **join** (the pay difference erased) | ✅ rule + click |
| P8 | the one-session line shown on the whole-series scope | ✅ rule |
| P9 | the date label stops following the scope | ✅ rule |

All nine bite; none slipped; **CHECKSUM: both files back to baseline.**

## §6 ⚠️ Declared: four existing pins updated, none weakened
1. `coach-rate-key.test.ts` froze the add body's whole literal. **What it protects — the rate goes through `withoutRates`, so no key ⇒ no `rateMinor` — is unchanged and still pinned**, and I **added** an absence pin (no `rateMinor` anywhere near the swap).
2. `group-series.test.ts` froze the swap literal. **Its point — a GROUP sends `{ to }` alone via `swapBody` — is unchanged and still pinned.**
3. `other-series.test.ts`'s wire pin said *teacher bodies through `withFromDate`*. **That helper is exactly what produced the refused body**, so the pin now names `scopeBody` **and adds two absence pins** so `withFromDate` cannot come back to these two doors.
4. The `otherSeries` copy count: **36 → 43** (+7).
🔑 **`withFromDate` itself is untouched and still used by the Remove door**, which is out of scope per §4.

## §7 Verification
**759 pass / 0 fail across 82 files in 10.8 s** (was 738/80 ⇒ **+21 tests, +2 files**) · **tsc 0** · **`bun run build` ok** · 🚫 what the whole-course scope does is unchanged · Remove's default untouched · no BE change · no deploy request · 🚫 Palm's items untouched.
🔴 **DEPLOY: this and TASK-562 ship together** — until both are out, a Swap or Add sends a body the server now refuses.
⚠️ **Not proven, the standing limit:** CSS, focus and a real tap; and **whether an admin reads the two options as clearly as she reads them in my head is Tanya's and the owner's** — the drafts are pinned by shape so his rewording costs one line.
