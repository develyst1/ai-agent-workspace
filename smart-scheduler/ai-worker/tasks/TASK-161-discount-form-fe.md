# TASK-161: Discount section on all five sale/booking forms (REQ-063) (FE)

- Source: SPEC-059 (REQ-063)
- Status: **DONE (code) — SA-reviewed Sober 2026-08-22.** All five forms built + reviewed; rendered/hallmark pass rides @Tanya (+ `sid` live money check). Q2 copy → @Porter; Q3 approved.
  backend and a usable feature.** Please post a log entry when you pick it up (even a one-liner — an unacknowledged
  task is indistinguishable from an unread one).
- Assignee: @Fern (FE)
- Depends on: **TASK-160 + TASK-162 — both DONE & SA-reviewed**, so the API contract below is final and stable.
- Repo: **smart-scheduler-front**. 🔄 **All five admin sale/booking forms** (course · voucher · rental · 1st Trial ·
  single session), not just course+voucher.

## What to build

A **Discount** section on **every admin sale/booking form** — create-course, create-voucher, **rental**, and the
**1st-Trial / single-session** booking forms (`smart-scheduler-front`):
- 🔴 **Rental:** the summary's `{full}` is **hours × rate** (mirror AC-14) — recompute when hours change.
- **Type toggle** `Percent` / `Baht` (TH `เปอร์เซ็นต์` / `บาท`); one active at a time.
- A **value** input and a **required reason** field (TH `เหตุผล (เช่น โปรวันแม่)`).
- A live **summary block**, `tabular-nums`: `Full price {full} · Discount −{disc} · **Amount payable {net}**`
  (TH `ราคาเต็ม {full} · ส่วนลด −{disc} · **ยอดที่ต้องชำระ {net}**`). Recomputed as they type. (AC-2 of the REQ.)
- **Disabled save + the reason** on invalid: discount > full price (`ส่วนลดมากกว่าราคาเต็มไม่ได้`), percent >100,
  negative/malformed, or **no reason** (`กรุณาระบุเหตุผลของส่วนลด`).
- 🔴 **Render EVERY server problem, not just the first.** On refusal the API returns `DiscountRefused` → **400
  `DISCOUNT_REFUSED` with `details.problems` (an array)** — show them all, or staff fix one and resubmit straight
  into the next.
- 🔴 **A non-admin sees NO discount field at all.** The server enforces it regardless (`assertMayDiscount` → 403),
  so the hidden field is a courtesy, not the control — but hide it. (Caveat: one role today, so in practice everyone
  authenticated is admin; wire the gate on `user.role === "admin"` now so it's correct when a staff role lands.)
- **Refuse, never clamp** — an invalid value blocks the save; never silently cap it at the price.
- **Bilingual via `t(...)`**, no raw i18n key (AC-11). Wording is all in REQ-063's "User-facing wording" — verbatim,
  so the screen agrees with what the server says.
- Sends `discount: { kind, value, reason }` to the create endpoint; **FE math is display only** — the BE
  re-validates and is the source of truth (do not trust the FE number for what's posted).

## Definition of Done
- [ ] **All five** forms show the section; the summary math matches the BE for %, baht, and no-discount — including
      **rental = hours × rate** (change the hours, the full price re-computes).
- [ ] Every server `problems` entry is rendered on refusal (not just the first); non-admin sees no field.
- [ ] Invalid states disable save with the right reason; a no-discount create is byte-identical to today (AC-7 on the
      client — no `discount` sent when empty).
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok · FRONTEND-STANDARD holds · rendered/hallmark verdict pasted (rides
      @Tanya where PlanModal-style components won't composite headless).

## Review (final) — Sober 2026-08-22 — ALL FIVE forms: PASS ✅ (code)
Last two forms reviewed by reproduction: front `bunx tsc --noEmit` **0** · `bun test src/lib/scheduler/` **27/0**.
Both consume **TASK-164's wire fields, not a hardcoded price** — voucher:
`card.voucherItems.find(v => v.hours === totalHours)?.priceMinor` (`CreateVoucherModal.tsx:44`); 1st Trial:
`sellable?.firstTrialPriceMinor` (`BookingModal.tsx:624`). They pass that `fullMinor` into the **same shared
`DiscountSection` + `evaluateDiscount`** already reviewed for the first three, so the whole rule set (copied rounding,
refuse-never-clamp, AC-7 undefined-when-empty, render-all-problems, non-admin-null) applies unchanged — this was
genuinely "one prop each." Minor, non-blocking: the `?? 0` price fallback during card-load could momentarily show
`ราคาเต็ม 0`, but the BE re-validates against the real price so it can't produce a bad posting; voucher hours are all
priced so a real miss won't occur. **Code DONE across all five; rendered/hallmark pass rides @Tanya** (modal surfaces
won't composite headless) with the `sid` live money check. **Q2 copy still → @Porter; Q3 approved.**

## Review (partial) — Sober 2026-08-22
**3 of 5 forms + shared machinery: PASS ✅.** Reproduced: front `bunx tsc --noEmit` **0** · `bun run build` ok ·
`bun test src/lib/scheduler/` **27/0** (12 new) · §3.5 0/0/0/0. Read the code:
- **`lib/scheduler/discount.ts` mirrors the BE `planDiscount` correctly** — `percentOf = Math.round((full*pct)/100)`
  **copied**, not approximated (no satang drift between screen and ledger). **Refuse-never-clamp is exact:** any
  problem ⇒ `discountMinor: 0` and `netMinor = fullMinor` (never a zero-baht sale, never clamped), verified at
  `discount.ts:67-72`. `discountPayload` returns `undefined` when untouched **or** invalid ⇒ **AC-7** byte-identical
  and an invalid discount is never sent (BE re-validates anyway).
- **`DiscountSection.tsx`** — renders **every** problem (client + server `problems`), returns `null` for non-admin
  (courtesy; server still 403s). Course/rental/single-session wired; **rental `fullMinor = hours × rate`,
  recomputed on hours change (AC-14)**.
- **`client.ts` `details` fix is correct and was necessary** — `ApiClientError` dropped `details`, so
  `DISCOUNT_REFUSED.problems` never reached the UI; "render every problem" was literally unbuildable without it.
  Additive + shape-safe (`errorProblems`). Good catch (Q3): app-wide but only surfaces detail that already existed;
  no need to scope it.
- Rendered/hallmark pass rides @Tanya (modal surfaces won't composite headless) — house practice.

**Voucher + 1st-Trial correctly NOT built** — their full price isn't on the wire, and hardcoding a second price copy
is the exact anti-pattern TASK-123 exists to prevent. Right call to leave them honestly unbuilt rather than show a
made-up price on a money screen.

**Status:** the built 3 are DONE-reviewed; the task stays **open for the last 2 forms**, unblocked by **TASK-164**
(below). When 164 lands, each is "one `fullMinor` prop" — the section/validation/payload/errors are already shared.

### Q answers
- **Q1 → cut TASK-164 (BE):** expose the two prices on `GET /sellable-packages`, mirroring TASK-123's rentals. Yours.
- **Q2 (3 draft edge-case strings) → @Porter (UX writer).** Your approach is right — Thai borrowed verbatim from the
  BE's own refusals so pre-check and server read identically; EN yours, marked DRAFT. **Non-blocking**; Porter
  confirms/replaces. Keep them.
- **Q3 → approved**, see above. Leave the fix app-wide.

## Notes / Questions
(Fern fills in. The API contract is TASK-160's `discount: { kind:"PERCENT"|"BAHT", value, reason }`. Do not invent
copy — every string is in REQ-063.)

---

## Implementation Notes (Fern 2026-08-22) — 3 of 5 forms DONE, 2 BLOCKED on an API gap
**`smart-scheduler-front@dong`, uncommitted — 10 files** (3 new: `lib/scheduler/discount.ts` + its test,
`components/common/DiscountSection.tsx`).

### 🔴 The blocker, found by building not by reading: two of the five forms have no full price to show
AC-2 requires the summary to state `ราคาเต็ม {full}`. The BE prices each sale from a sale item:
| Form | BE price source | Exposed to the FE? |
|---|---|---|
| Course | `courseItemRef(group, size)` | ✅ `/sellable-packages` → `packages[]` |
| Single session | `sessionItemRef(group)` | ✅ same card, `size: 1` |
| Rental | `RENTAL_PRICE` | ✅ `rentalItems[]` (TASK-123 exposed it for exactly this reason) |
| **Voucher** | `voucherItemRef(hours)` (`VOUCHER_PRICE` 5/10/15) | ❌ **nothing on the wire** |
| **1st Trial** | the `first-trial` sale item | ❌ **nothing on the wire** |

I checked the whole payload, not just the type: there is no `voucherItems`/`firstTrialPrice` anywhere in
`getSellablePackages`. So for those two I could only show a full price by **hardcoding a second copy of the price
card** — the one thing `types/app/pricing` says in its first line never to do, and the thing TASK-123 was written to
avoid. **I did not build them and I did not guess a number.** Q1 below has the fix shape.

### Built and verified (3 forms + the shared machinery)
- 🆕 **`lib/scheduler/discount.ts`** — a deliberate mirror of the BE's `planDiscount`, including
  `Math.round((full*pct)/100)` **copied, not approximated**: a near-enough mirror shows a satang of drift on the
  summary and teaches staff to distrust the number. Returns **i18n keys**, not sentences, so both languages stay in
  `dictionaries.ts`. 🆕 **12 unit tests** pin: half-up rounding · untouched ⇒ no problems and no payload (AC-7) ·
  reason mandatory once a value is typed · **refuse-never-clamp** (too-large ⇒ `discountMinor 0` and net stays the
  FULL price, not 0) · percent range · **every problem reported at once**, not one at a time.
- 🆕 **`DiscountSection.tsx`** — toggle (`เปอร์เซ็นต์`/`บาท`), value, required reason, live `tabular-nums` summary,
  and one Alert listing **every** client problem **and** every server `problems` entry. Returns `null` for a
  non-admin (`session.user.role !== "admin"`) — stated in the code as a courtesy, not the control, since
  `assertMayDiscount` 403s regardless.
- 🔴 **`lib/api/client.ts` — I had to fix a real plumbing bug to meet the AC at all.** `ApiClientError` **dropped
  `details`**, so `DISCOUNT_REFUSED`'s `problems` array never reached any component: "render every problem" was
  literally unimplementable. It now carries `details`, plus an `errorProblems(e)` helper that is shape-safe.
- **Course** (`CreatePlanFlow`) — section under the price it applies to; `discount` in the create payload; an
  invalid discount blocks `valid` (refuse, never clamp); server problems captured in `confirmCreate` and rethrown so
  PlanModal still shows the headline.
- **Rental** (`RentalModal`) — `fullMinor = hours × rate`, **recomputed when hours change (AC-14)**; save disabled
  while invalid; server problems rendered.
- **Single session** (`BookingModal`) — price from the card's `size: 1` package for the chosen program, which is
  exactly what the BE prices it from. Rendered only for `SINGLE_SESSION`.
- **AC-7 everywhere:** untouched ⇒ `discountPayload` returns `undefined` ⇒ the request is byte-identical to today's.

**Evidence:** `bunx tsc --noEmit` **0** · `bun run build` **ok** · `bun test src/lib/scheduler/` **27 pass / 0 fail**
(12 new) · FRONTEND-STANDARD §3.5 on all four touched/new components **0/0/0/0**.
🔴 **Rendered pass + hallmark not done** — these are modal surfaces that won't composite in this session's headless
pane. → @Tanya, together with the money check on `sid`.

## Questions
- **Q1 (BLOCKING the last two forms — needs a BE task, not a decision):** expose the two missing prices on
  `GET /sellable-packages`, exactly mirroring what TASK-123 did for rentals — e.g. `voucherItems: { hours,
  priceMinor }[]` from `VOUCHER_PRICE`, and `firstTrialPriceMinor` from the `first-trial` item. Both are derivable
  from the single price authority server-side, so no second copy exists anywhere. The moment that lands, both forms
  are **one prop each** (`fullMinor={...}`) — the section, validation, payload and error rendering are already
  shared and built. I'd rather leave two forms honestly unbuilt for a day than ship a made-up "full price" onto a
  screen staff use to take money.
- **Q2 (copy — 3 strings):** REQ-063 supplies wording for *too large*, *no reason* and *not admin*, but the task also
  requires blocking on **percent out of range**, **non-integer/negative baht** and **malformed value**, which have no
  REQ line. I shipped them marked `// DRAFT` in the dictionary, with the **Thai borrowed verbatim from the BE's own
  refusals** (`discount-plan.ts`) so the pre-check and the server refusal read identically in Thai; the English is
  mine. Porter's to confirm or replace.
- **Q3 (worth knowing):** the `details` fix above is app-wide — any other endpoint returning structured refusal detail
  now reaches the UI too. Nothing else reads it yet; flagging in case you'd rather it were scoped.

---

## Update (Fern 2026-08-22, later) — 🟢 ALL FIVE forms now built; Q1 is closed by TASK-164
Jason's **TASK-164** put both missing prices on the wire (`voucherItems: {hours, priceMinor}[]` from `VOUCHER_PRICE`,
`firstTrialPriceMinor` from `FIRST_TRIAL_MINOR`) — exactly the TASK-123-shaped fix Q1 asked for. As predicted, each
blocked form was **one `fullMinor` prop**:
- **Voucher** (`CreateVoucherModal`) — full price re-reads from `voucherItems` whenever the **hour bucket** changes;
  `discount` added to `CreateVoucherInput` + the POST body; save blocked while invalid; server `problems` rendered.
- **1st Trial** (`BookingModal`) — `singleFullMinor` now resolves `FIRST_TRIAL` from `sellable.firstTrialPriceMinor`,
  so the section covers **both** revenue-posting booking types; the render guard dropped its `SINGLE_SESSION` clause.
- **`pricing.mock.service.ts`** carries both new fields at the BE's real values, so the offline summary shows the same
  numbers the server validates against — Jason's drift tests make that agreement the point, and a mock that disagreed
  would quietly teach the wrong figure.

**Still no second copy of the price card in the FE:** every one of the five full prices is read from
`/sellable-packages`, never computed or hardcoded here.

**Evidence (whole task, re-run):** `bunx tsc --noEmit` **0** · `bun run build` **ok** ·
`bun test src/lib/scheduler/` **27 pass / 0 fail** · FRONTEND-STANDARD §3.5 on **all five** forms + the shared
component **0/0/0/0** · `DiscountSection` confirmed imported by exactly the four form files.

**DoD status:** all five forms ✅ · every `problems` entry rendered ✅ (needed the `ApiClientError.details` fix) ·
non-admin sees no field ✅ · invalid disables save with the reason ✅ · no-discount create byte-identical ✅ ·
🔴 **rendered pass + hallmark verdict still outstanding** → @Tanya (modal surfaces; headless pane won't composite),
ideally alongside the `sid` money check so the summary is compared against a real posted movement.

**Q2 (3 draft strings) and Q3 (the app-wide `details` change) from the notes above are still open.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-161 | scheduler-front (FE): **REQ-063 discount form** — Discount section on create-course/voucher: %/บาท toggle, required reason, live `ราคาเต็ม→ส่วนลด→ยอดที่ต้องชำระ`, bilingual, disabled-save+reason on invalid; FE math display-only, BE re-validates. Depends TASK-160 (API shape). | SPEC-059 (REQ-063) | ✅ **DONE (code) — ALL 5 forms SA-reviewed Sober 2026-08-22.** Last 2 (voucher/1st-Trial) consume TASK-164's wire fields (no hardcoded price), one `fullMinor` prop each into the shared reviewed `DiscountSection`/`evaluateDiscount`. front tsc 0 · 27/0. Rendered/hallmark + `sid` live money check → @Tanya. Q2 copy → @Porter. — _prior:_ 🖥️ PARTIAL — 3/5 forms SA-reviewed PASS (Sober 2026-08-22); 2 blocked on TASK-164.** Reproduced front tsc 0 · build ok · 27/0. BE-mirror rounding copied (no drift), refuse-never-clamp exact (any problem ⇒ discount 0, net=full; AC-7 undefined-when-empty), renders every problem, non-admin null, rental hours×rate. `client.ts details` fix approved (was necessary; Q3 leave app-wide). Voucher+1st-Trial correctly NOT built (no hardcoded price) → **TASK-164 (BE) cut to expose the 2 prices**, then each is one prop. **Q2 draft strings → @Porter.** — _prior:_ (Fern 2026-08-22 — **3 of 5 forms built + all shared machinery; 2 BLOCKED on an API gap**. 🆕 `lib/scheduler/discount.ts` mirrors the BE `planDiscount` with `Math.round((full*pct)/100)` **copied not approximated** (a satang of drift teaches staff to distrust the summary) and returns **i18n keys, not sentences**; **12 tests** pin half-up rounding · untouched⇒no payload (AC-7) · reason mandatory · **refuse-never-clamp** (too-large ⇒ take NOTHING off, net stays the FULL price) · **all problems at once**. 🆕 `DiscountSection.tsx` = one shared block (toggle · value · required reason · live `tabular-nums` summary · ONE Alert listing every client AND every server `problems` entry) returning `null` for non-admin (courtesy — server 403s regardless). **Wired: course · rental (full = hours×rate, recomputed on hours change, AC-14) · single session.** 🔴 **Plumbing bug fixed to meet the AC at all:** `ApiClientError` **dropped `details`**, so `DISCOUNT_REFUSED`s `problems` **array** never reached any component — render-every-problem was unimplementable; now carried + shape-safe `errorProblems(e)` (app-wide → Q3). 🔴 **BLOCKED: voucher + 1st-Trial have NO full price on the wire** — BE prices them from `voucherItemRef(hours)` / the `first-trial` item, neither exposed by `getSellablePackages` (whole payload checked). Showing one would mean **hardcoding a second copy of the price card** — forbidden by `types/app/pricing` line 1 and the very thing TASK-123 exists to prevent. **Q1 = a small BE task shaped like TASK-123** (`voucherItems:{hours,priceMinor}[]` + `firstTrialPriceMinor`); then each form is **one prop**. tsc **0** · build ok · tests **27/0** · §3.5 0/0/0/0. 🔴 rendered/hallmark → @Tanya with the `sid` money check. **Q2:** 3 draft strings (percent-range / baht-positive / malformed) have no REQ line — Thai borrowed verbatim from the BE refusals so pre-check and server read identically; Porter to confirm.) 🟢 **UPDATE (Fern 2026-08-22, after your review): ALL 5 FORMS NOW BUILT — Q1 closed by TASK-164.** As predicted each blocked form was **one `fullMinor` prop**: voucher re-reads its price when the **hour bucket** changes (`voucherItems[]`); 1st-Trial resolves from `firstTrialPriceMinor`, so the section now covers **both** revenue-posting booking types; `pricing.mock` carries both at the BE's real values, because Jason's drift tests make screen-agrees-with-ledger the whole point and a disagreeing mock would quietly teach the wrong figure. **Still no second copy of the price card in the FE** — all five full prices come from `/sellable-packages`. Re-run whole task: tsc **0** · build ok · tests **27/0** · §3.5 **0/0/0/0** on all five forms + the shared component. 🔴 rendered/hallmark still → @Tanya (ideally with the `sid` money check, so the summary is compared against a real posted movement). Q2 (3 draft strings) + Q3 (app-wide `details`) still open. | Fern | — |
```
