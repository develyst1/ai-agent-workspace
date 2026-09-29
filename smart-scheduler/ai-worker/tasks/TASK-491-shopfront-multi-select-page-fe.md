# TASK-491 — the shop QR page: tick several children, one Check-in, **a result per child** — FE, M

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-26) · Round item 3 (Khwan). **After TASK-483.** BE is TASK-490, done and verified.

## §0 The contract (from Jason, verified by me)
`POST /api/checkin/shopfront/batch` `{ phone, items: [{bookingId} | {campDayId}] }`, **1 to 10 items** ⇒ `{ results: [{ …item, status, body }] }`, **one row per item, in the order asked**, each row **exactly** what the single route would have answered for that item.
🔴 **The request's 200 means "the list was read". It does NOT mean anything was checked in. Decide per row, from `status`.** A page that reads the HTTP status and shows a tick is the defect this task exists to avoid.

## §1 🔴 The rule the whole task turns on
Three children ticked, one fails. **The screen must not say "checked in".**
- **Never one green tick for the batch.** A parent told "checked in" walks away believing **all three** children are checked in. **That child is then not expected in the class and nobody is looking for them.**
- **Never all-or-nothing on screen either:** the two that succeeded **did** succeed, and telling a parent otherwise sends them back to a counter queue for no reason.
- 🔑 **Per child: succeeded · already checked in · refused.** A refused child shows **that child's own reason**, from its own row.
📌 **This is TASK-483 again, and you fixed that one.** There, a perfectly correct refusal was rendered with a green tick and "Already checked in", and a nanny would have walked an absent child into a class. **Here the same mistake is multiplied by the number of boxes ticked.** Design the mixed result FIRST and the all-succeeded case second — the happy path will look after itself.

## §2 Build
- The existing list gains **checkboxes**; one **Check-in** button submits the ticked rows (1–10). **A single ticked child must behave exactly as today** — one endpoint, one behaviour (the BE pins a batch of one as identical).
- **The result screen is per child**, in the order asked, each row carrying its own outcome. Reuse the existing reply components where they fit; 🚫 **do not re-implement a success reply.**
- **The mixed case is the primary design**, not an edge case. A parent must be able to tell, at a glance, **which children are in and which are not** — and what to do about the ones that are not.
- **Nothing stored.** This is a shared counter device: no `localStorage`, the field cleared on success and on start-over, `autoComplete="off"` — exactly as TASK-478 settled.
- 🔑 **The four indistinguishable "nothing" cases must stay indistinguishable.** A multi-select is a new way to leak: **no count, no partial list, no row that behaves differently from its neighbours before a check-in is attempted.** Your own TASK-478 pin ("the page may not read `children` at all") is the shape to keep.
- **The 10 maximum** comes from the server; surface it kindly rather than letting the request fail. Say how.
- Copy counted, both languages. 🚫 No BE change.

## §3 What I do NOT want
- 🚫 No optimistic rendering. Nothing is ticked on screen until its row says so.
- 🚫 No retry-all button that silently re-submits the successes.
- 🚫 No summary line that replaces the per-child rows ("2 of 3 checked in" **in addition** is fine; **instead** is not).

## Definition of Done
- [ ] Checkboxes + one Check-in, 1–10 · **a result per child, in order, with that child's own reason**, pinned by RENDERING · 🔑 the mixed case pinned **including that no overall success wording appears when any row failed** · a single tick identical to today · the four "nothing" cases still indistinguishable (assert the absences) · nothing stored, field cleared · the maximum handled before the request · copy both languages · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that renders one overall success for a mixed result, one that decides from the HTTP status instead of the row, and one that hides a failed row · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-27. **Three ticked, one fails ⇒ the screen never says "checked in".**

```
bunx tsc --noEmit → exit 0
bun test          →  609 pass / 0 fail   (was 596; +13 — new lib/checkin/shopfront-batch.test.ts)
bun run build     → ok
git status        →  3 source modified (shopfront.ts · ShopfrontCheckinContent · dictionaries) · 1 new test · 3 counts moved in my own TASK-478 pins
```
Built to TASK-490's contract. 🚫 No BE change. 🚫 No deploy asked.

### `§1` — the mixed result, designed first
- **Pure (`lib/checkin/shopfront.ts`), value-tested:** `rowOutcome(row)` — `done` · `already` · `refused`, from **that row's
  own `status`**; `rowReason(row)` — that row's own server sentence (blank ⇒ the page's neutral line, never an empty
  bubble); `batchSummary` (`in` / `refused` / `anyRefused` / `allIn`); `batchHeadlineKey` — **a success word only when
  EVERY child is in**; `pairRows` — answers matched to asked items **by id**; `batchBody`, `canSubmitBatch`, `overMax`.
- **The screen:** one row per child, in the order asked, each with its own mark and its own words — a tick for
  `done`/`already`, an amber warning with **that child's reason** for `refused`, and a closing line telling the family to
  show the screen at the desk for the ones that are not in. The headline for a mixed batch counts and promises nothing:
  *"{in} of {total} checked in · {refused} need the front desk"*.
- 🔴 **A 2xx is not a check-in.** The batch's HTTP status decides only whether the LIST was read; an ABSENT camp day
  comes back 2xx and is **refused** here too (TASK-483's rule, now per row); a row the server did not answer for is
  **refused, never assumed done**.
- 🚫 **Nothing is hidden and nothing is optimistic:** the result map is over what was **asked** (`pairRows(phase.asked, …)`),
  never filtered by how a child turned out, and the summary line is **in addition to** the rows.
- 🚫 **No retry-all** — a button that re-submits the successes is how a parent gets told "already checked in" for a child
  who was fine. The refused rows point at the counter instead.
- **A single ticked child is today's path, byte for byte:** `if (asked.length === 1) return checkIn(asked[0].item)` — one
  child, one behaviour, and the familiar full reply (`SuccessView` / `CampSuccessView`) rather than a compact row. **That
  is also why the compact row is not "a second success reply":** it is an outcome line for a list, and the one place a
  full reply is rendered is unchanged.
- **The ceiling of 10 is surfaced before the request:** over ten ticked, the button stays disabled and a line says
  *"please check in up to 10 children at a time"* — the call is never made to be refused.

### 🔑 The four "nothing" cases are still one (a multi-select is a new way to leak)
The TASK-478 pins hold and are re-asserted for this shape: the page **still may not read `children`**, holds **no literal
sentence**, renders the ticking list in **exactly one place**, every row's tick is identical, and no row is disabled or
styled by its own contents before a check-in is attempted. Nothing counts anything on screen before the act.

### 🚫 Nothing stored (a shared counter device)
No `localStorage`, `autoComplete="off"`, and the ticks are cleared in **three** places — a new lookup, start-over, and
after a batch — beside the phone, which is cleared after a success as TASK-478 settled.

### 🔑 Break-and-watch — eleven, `try/finally`, checksum, `BASELINE=0` on a GREEN suite
| # | mutation | result |
|---|---|---|
| 1 | one overall success for a MIXED result | **3 fail** |
| 2 | the outcome comes from the batch's HTTP status, not the row | **2 fail** |
| 3 | a refused row is hidden from the screen | **1 fail** |
| 4 | an ABSENT camp day in a batch reads as a check-in | **1 fail** |
| 5 | an unanswered row is assumed done | **1 fail** |
| 6 | rows paired by POSITION (a reorder mislabels a child) | **1 fail** |
| 7 | the refused row shows the page's line instead of its OWN reason | **1 fail** — 📌 slipped first: the reason was pinned in the HELPER only, so dropping it at the call site passed. Pinned at the call site now. |
| 8 | the ceiling is not surfaced and 11 may be submitted | **1 fail** |
| 9 | a single ticked child goes down the batch route | **1 fail** |
| 10 | the ticks survive a new lookup | **1 fail** |
| 11 | the phone is kept after a batch | **1 fail** |
`md5` identical on the two mutated files. **Three counts moved in my own TASK-478 pins, each named:** `tryAgain`
occurrences 4 → 6 (the batch's two failure paths use the same neutral line), `setPhone("")` 2 → 3, and the
`shopCheckin` copy count 12 → 20.

### Definition of Done
- [x] Checkboxes + one Check-in, 1–10 · **a result per child, in order, with that child's own reason**
- [x] 🔑 The mixed case pinned, **including that no overall success wording appears when any row failed**
- [x] A single tick identical to today · the four "nothing" cases still indistinguishable · nothing stored, field cleared
- [x] The maximum handled before the request · copy +8 both languages · **609 / 0** · `tsc` 0 · build ok
- [x] 🔑 Eleven mutations, `BASELINE=0`, `finally`, checksum — incl. one overall success, deciding from the HTTP status, and hiding a failed row

### ⚠️ Not seen on a screen
For @Tanya, on a phone, and please do the MIXED case first: one phone number with **three** children who can all be
checked in, tick all three, then have someone mark one of them ABSENT (or let one fall outside its window) between the
lookup and the press ⇒ the screen shows **three rows**: two ticks, one amber row with **the server's own sentence**, the
headline reading *"2 of 3 checked in · 1 need the front desk"* — **and the word "checked in" must not appear on its own
anywhere as a verdict for the batch.** Then all three succeeding ⇒ *"All 3 checked in"* with three ticks. Then **one**
child ticked ⇒ exactly today's single screen (the full reply). Tick eleven (if a family has that many) ⇒ the button waits
and the line explains. And after any of them, *Done — next family* ⇒ the phone field EMPTY and no ticks remembered.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
Verified in the current tree: **614 pass / 0 fail** · tsc 0 · build ok.

🔑 **She designed the mixed result first, as asked, and the headline is the proof:** `batchHeadlineKey` returns **a success word only when EVERY child is in**, and a mixed batch gets *"{in} of {total} checked in · {refused} need the front desk"* — **a count and an instruction, promising nothing.** That is the whole task in one function: **the screen cannot say "checked in" while a child is not.**
🔑 **"A 2xx is not a check-in" is built rather than remembered.** The HTTP status decides only whether the list was read; **an ABSENT camp day comes back 2xx and is still `refused` here** (TASK-483's rule, now per row), and **a row the server did not answer for is `refused`, never assumed done.** 📌 **Defaulting an unknown to the bad outcome is the right way round for an act that consumes a family's credit** — the opposite default is how a parent walks away believing three children are in.
✅ **The result map is over what was ASKED, not over what came back** (`pairRows(asked, …)`, matched by id). A child whose row goes missing cannot vanish from the screen — **the failure that would have been invisible is the one she closed by construction.**
✅ **A single ticked child is today's path byte for byte** (`if (asked.length === 1) return checkIn(...)`), with the familiar full reply — **and that is also her answer to "is the compact row a second success reply?": the one place a full reply is rendered is unchanged.** She anticipated the objection and answered it in the design rather than the report.
✅ **No retry-all, and the reason is the right one:** *"a button that re-submits the successes is how a parent gets told 'already checked in' for a child who was fine."* 🚫 The refused rows point at the counter instead.
✅ **The ten-child ceiling is surfaced before the request** — the call is never made in order to be refused. ✅ **The four "nothing" cases re-asserted for the new shape**, including her own TASK-478 pin that the page may not read `children` at all, and **nothing counted on screen before the act**.
✅ **Nothing stored, ticks cleared in three places** on a shared counter device.
