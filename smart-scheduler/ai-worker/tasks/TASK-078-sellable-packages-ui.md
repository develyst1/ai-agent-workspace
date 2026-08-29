# TASK-078: scheduler-front (FE) — offer only packages that exist, at the real price
- Source: SPEC-024
- Status: DONE  (reviewed 2026-08-01 by Sober — grep-verified: **no price literal anywhere outside the mock**; size-1 excluded from course sizes; illegal-size repair exercised; submit disabled with no valid package; tsc 0 / build ok)
- Depends on: **TASK-077**
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
Course/session creation currently offers **4 / 6 / 10 sessions to every program**. The real card doesn't work
that way: **Onewheel has no 10 h and Balance Play has no 4 h**, so staff can sell a package the school doesn't
offer.

1. **Drive the package options from `GET /api/sellable-packages`** — after a program is chosen, offer only the
   sizes that exist for it. **Do not hard-code the price card into a dropdown**; it will drift from the card the
   first time a price changes, and the card is the thing that is authoritative.
2. **Show the price** for the chosen combination, from the same endpoint. Staff currently register a course with
   no idea what it costs, which is also how a wrong package survives unnoticed.
3. If a program has **no** price group configured, it has nothing sellable — say so plainly ("this program has
   no packages set up") rather than showing an empty dropdown that looks broken.

**Prices are VAT-inclusive** — the final amount the customer pays. Display them as-is; **never add tax and never
compute a net figure** in the browser.

## Definition of Done
- [ ] Choosing Onewheel does not offer 10 h; choosing Balance Play does not offer 4 h; the skate/bike programs
      offer 4 / 6 / 10.
- [ ] The price shown matches the card for each combination, and comes from the API (not a local table).
- [ ] A program with no packages shows a clear message, not an empty control.
- [ ] No regression to course registration, the voucher flow, or the booking modal.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — **and exercise it in a browser**: pick each program
      and say which sizes and prices you saw.

## Implementation Notes — Fern 2026-08-01

### What I built — and the price list stays in exactly one place
- `types/app/pricing/` — the response shape, with `priceMinor` documented as **satang and VAT-inclusive**, plus
  a display-only `formatPriceMinor`. **No card, no table, no fallback price anywhere in production code.**
- `services/pricing.service.ts` (+ mock) — `GET /api/sellable-packages`.
- `hooks/scheduler/usePricing.ts` — `useSellablePackages()`, `staleTime` 5 min (the card changes rarely and
  every modal wants it).
- `lib/scheduler/sellable.ts` — three pure readers: `courseSizesFor`, `packageFor`, `isUnpriced`. Framework-free
  so "what can this program sell?" has one definition. **`courseSizesFor` excludes size 1** — that's a single
  session, not a course package.
- `CreateCourseModal` — sizes and price now come from the API. **Deleted the hard-coded `const SIZES = [4,6,10]`**
  it used before (my change orphaned it).

**Three behaviours worth naming:**
1. **Switching program repairs an illegal size.** Skate with 10 selected → switch to Onewheel (no 10) leaves an
   unsellable size sitting in the form; a `useEffect` snaps it to the first legal size. Verified below.
2. **Submit is disabled when there's no valid package** (`!!chosen` in `valid`). The server refuses off-card
   combinations (TASK-077); offering a button that can only fail is worse than not offering it.
3. **Unpriced program → a plain message replacing the size control**, not an empty dropdown. Only once a program
   is actually chosen — "nothing selected yet" must not look like an error.

### Browser check — mock mode, localhost:3016 (location verified first)
Modal: **New course**. What I picked and what I saw:

| Program | Sizes offered | Price shown |
|---|---|---|
| **Skate** (bike-skate) | **4 / 6 / 10** | 6 → **฿6,490**; 10 → **฿9,790** |
| **Onewheel** | **4 / 6 — no 10** ✅ | 4 → **฿5,790** |
| **Balance Play (Private)** | **6 / 10 — no 4** ✅ | 6 → **฿7,490** |
| **Balance Play (Group)** | **6 / 10 — no 4** ✅ | 6 → **฿5,290** |
| **Surfskate** (no price group) | *size control replaced* | — |

Every figure matches your card in `sale-items.ts`, and each is labelled **"฿… — ราคารวม VAT แล้ว" / "price
includes VAT"**. No arithmetic is done on the price anywhere — it is formatted and displayed.

- **The illegal-size repair, exercised:** Skate + **10** (฿9,790) → switched program to **Onewheel** → the size
  self-corrected to **4** and the price became **฿5,790**, with 10 absent from the list.
- **Unpriced:** selecting a teacher whose only program is **Surfskate** auto-selects it and the size control is
  **replaced** by *"This program has no packages set up, so nothing can be sold for it yet."* /
  *"โปรแกรมนี้ยังไม่ได้ตั้งแพ็กเกจ จึงยังขายไม่ได้"* — the `ขนาดคอร์ส` field is gone from the form entirely, and
  **the submit button is `disabled`**.
- **TH and EN both render**; no raw keys.
- **No regression:** the voucher flow and booking modal don't read the card and were not touched; course
  registration otherwise behaves as before.

### Fixture work this needed (and one honest note)
Mock teachers carried **no `subjectOptions` at all**, so the program dropdown was empty offline and none of the
above was checkable. I gave them program ids that line up with the mock card (s1/s2 bike-skate · s3 onewheel ·
s4/s5 balance · s6 Surfskate unpriced). **I deliberately left the legacy tutoring `subjects` display strings
(คณิต/อังกฤษ/…) alone** — rewriting every fixture to the wheeled-sports names is a bigger change than this task
and nothing depends on the two agreeing. Flagging it so the inconsistency isn't read as an accident.

### ⚠️ Environment limits — say exactly which
- **The Mantine searchable `Select` would not open reliably** under scripted events inside the modal
  (`aria-expanded=true` while the dropdown stayed `data-hidden`), and the pane isn't composited so I can't
  click natively either. I worked around it by giving the unpriced teacher a **single** program, which the
  modal auto-selects — so that state was reached through the app's own logic, not by forcing state. **The one
  thing I could not do is open the program dropdown for a teacher who has Surfskate *alongside* others** and
  pick it from a list. Worth 30 seconds of deploy smoke on sid.
- **I read prices for 5 of the 11 course combinations**, not all: skate 6/10, onewheel 4, balance-private 6,
  balance-group 6 — chosen to cover every price group and both "missing size" rules. The rest come from the
  same API field through the same code path.
- One pre-existing oddity I noticed but **did not change** (out of scope, your call): the informational alert
  above still shows leave-quota text for the currently-held size even when the program sells nothing. It's the
  existing `course.info` alert keyed on `size`, not something TASK-078 introduced.

`bunx tsc --noEmit` **clean**; `bun run build` **succeeded**.

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- The API is the source of truth for both availability and price. If it doesn't return something the screen
  needs, flag it rather than filling the gap locally — a second copy of a price list is the one thing this
  design exists to prevent.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0** (my run). I grepped the FE for every card
figure — **not one price literal outside the mock**. That was the single property this task existed to protect
and it holds.

- **`courseSizesFor` excludes size 1** (`sellable.ts:10`) — a 1-hour row is a *single session*, not a course
  package. I hadn't said that; you read the card correctly.
- **Deleting the orphaned `const SIZES = [4,6,10]`** rather than leaving it next to the new logic — that's the
  cleanup rule, and a stale hard-coded list beside a dynamic one is exactly how the card gets re-copied later.
- **Switching program repairs an illegal size.** Skate+10 → Onewheel leaves an unsellable value sitting in the
  form; you snapped it to a legal one **and exercised it** (10 → self-corrected to 4, price ฿5,790). That state
  is only reachable by changing your mind mid-form, which is precisely the path nobody tests.
- **Submit disabled when there is no valid package** — the server refuses off-card combinations anyway, so
  offering a button that can only fail is worse than not offering it. Same reasoning as the collision guard in
  TASK-076, applied without being told.
- **Unpriced program replaces the size control with a sentence, and only once a program is chosen** — "nothing
  selected yet" must not look like an error. That distinction is easy to miss and annoying to live with.

**Your three environment notes are all correctly stated**, and the middle one is the good kind of honest: you
reached the unpriced state **through the app's own logic** (a teacher with a single program, auto-selected)
rather than forcing state, and you said exactly what that leaves unproven — picking Surfskate from a dropdown
*alongside* others. Thirty seconds of deploy smoke, noted. Reading 5 of 11 prices, chosen to cover **every price
group and both missing-size rules**, is sampling with a stated basis rather than a shortcut.

**The fixture inconsistency you flagged: leave it.** Renaming every legacy tutoring string to wheeled-sports
names is a bigger change than this task, nothing depends on the two agreeing, and you said so rather than
letting it read as an accident. **The `course.info` leave-quota alert is out of scope — correct not to touch
it**, and I'd rather see it named here than fixed quietly in a pricing task.

**TASK-078 → DONE. SPEC-024 is complete** (TASK-077 + TASK-078).
⏳ Deploy: rides the go-live batch. ⚠️ **Its acceptance is blocked on the two routed questions** — the
`bike-skate` 1-hour price, and whether `sale:ensure-items` already ran (voucher items may be live at placeholder
prices). Neither is Fern's or Jason's to resolve.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-078 | scheduler-front (FE): course creation offers only sellable (program, size) combinations at the real price | SPEC-024 | ✅ **DONE** (Sober 2026-08-01 — I grepped the FE for every card figure: **not one price literal outside the mock**, which was the single property this task existed to protect; size 1 excluded from course sizes (a 1-hour row is a session, not a package — she read the card, I had not said it); **switching program repairs an illegal size** and she exercised that path; submit disabled when nothing is sellable; tsc 0 / build ok) | Fern | TASK-077 |
```
